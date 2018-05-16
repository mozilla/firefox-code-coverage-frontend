import settings from '../settings';
import { getCoverage } from '../utils/coverage';
import { getChangesets } from '../utils/hg';
import { saveInCache } from '../utils/localCache';

const { INTERNAL_ERROR, PENDING } = settings.STRINGS;

export const sortingMethods = {
  DATE: 'date',
  COVERAGE: 'coverage',
};

export const arrayToMap = (csets = []) => {
  const newCsets = {};
  csets.forEach((cset) => {
    newCsets[cset.node] = cset;
  });
  return newCsets;
};

export const mapToArray = (csets = {}) => (
  Object.keys(csets).map(node => csets[node])
);

export const extendObject = (obj, copyFrom) => {
  const newObject = Object.create(obj);
  Object.keys(copyFrom).forEach((key) => {
    newObject[key] = copyFrom[key];
  });
  return newObject;
};

const sortChangesetsByChangesetIndex = (a, b) => {
  if (a.changesetIndex < b.changesetIndex) {
    return 1;
  }
  return -1;
};

const sortChangesetsByTimestamp = (a, b) => {
  if (a.date[0] < b.data[0]) {
    return 1;
  }
  return -1;
};

const sortChangesetsByRecency = (a, b) => {
  if (a.pushId < b.pushId) {
    return 1;
  } else if (a.pushId === b.pushId) {
    if (a.date) {
      return sortChangesetsByTimestamp(a, b);
    }
    return sortChangesetsByChangesetIndex(a, b);
  }
  return -1;
};

const sortWithUndefined = (a, b) => {
  if ((typeof a.percentage === 'undefined') && (typeof b.percentage === 'undefined')) {
    return 0;
  } else if (typeof a.percentage === 'undefined') {
    return 1;
  }
  return -1;
};

const sortChangesetsByCoverageScore = (a, b) => {
  let retVal;
  if ((typeof a.percentage === 'undefined') || (typeof b.percentage === 'undefined')) {
    retVal = sortWithUndefined(a, b);
  } else if (a.percentage < b.percentage) {
    retVal = -1;
  } else if (a.percentage === b.percentage) {
    retVal = 0;
  } else {
    retVal = 1;
  }
  return retVal;
};

const viewableChangesetsArray = changesetsCoverage => (
  mapToArray(changesetsCoverage).filter(csetCov => csetCov.show));

export const sortChangesetsNewestFirst = (changesets, changesetsCoverage) => {
  const csets = viewableChangesetsArray(changesetsCoverage);
  csets.sort(sortChangesetsByRecency);
  return csets;
};

export const sortChangesetsByCoverage = (changesets, changesetsCoverage, reversed) => {
  const csets = viewableChangesetsArray(changesetsCoverage);
  csets.sort(sortChangesetsByCoverageScore);
  if (reversed) {
    csets.reverse();
  }
  return csets;
};

const changesetsCoverageSummary = (changesetsCoverage) => {
  const summary = { pending: 0, error: 0 };
  Object.values(changesetsCoverage).forEach((csetCoverage) => {
    if (csetCoverage.summary === PENDING) {
      summary.pending += 1;
    } else if (csetCoverage.summary === INTERNAL_ERROR) {
      summary.error += 1;
    }
  });
  console.debug(`We have ${Object.keys(changesetsCoverage).length} changesets.`);
  console.debug(`pending: ${summary.pending}`);
  console.debug(`errors: ${summary.error}`);
  return summary;
};

export const loadCoverageData = async () => {
  const changesets = await getChangesets();
  const changesetsCoverage = await getCoverage(changesets);
  const summary = changesetsCoverageSummary(changesetsCoverage);
  return {
    changesets,
    changesetsCoverage,
    summary,
  };
};

export const pollPendingChangesets = async (changesetsCoverage) => {
  let polling = true;
  console.debug('We are going to poll again for coverage data.');
  const { coverage, summary } = await getCoverage(changesetsCoverage);
  if (summary.pending === 0) {
    console.debug('No more polling required.');
    polling = false;
  }
  saveInCache('coverage', coverage);
  return { coverage, polling };
};

export const filterUnsupportedExtensions = (parsedDiff = {}, supportedExtensions = []) => {
  if (supportedExtensions.length === 0) {
    return parsedDiff;
  }
  const newDiff = [];
  parsedDiff.forEach((p) => {
    const extensionTo = p.to.split('.').pop();
    if (supportedExtensions.indexOf(extensionTo) >= 0) {
      newDiff.push(p);
    }
  });
  return newDiff;
};
