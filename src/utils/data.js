import {
  changesetsCoverageSummary,
  getCoverage,
  getPendingCoverage,
} from '../utils/coverage';
import { getChangesets } from '../utils/hg';
import { saveInCache } from '../utils/localCache';

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
  let retVal;
  if (a.changesetIndex < b.changesetIndex) {
    retVal = 1;
  } else {
    retVal = -1;
  }
  return retVal;
};

const sortChangesetsByTimestamp = (a, b) => {
  let retVal;
  if (a.date[0] < b.date[0]) {
    retVal = 1;
  } else {
    retVal = -1;
  }
  return retVal;
};

const sortChangesetsByRecency = (a, b) => {
  let retVal;
  if (a.pushId < b.pushId) {
    retVal = 1;
  } else if (a.pushId === b.pushId) {
    if (a.date) {
      retVal = sortChangesetsByTimestamp(a, b);
    } else {
      retVal = sortChangesetsByChangesetIndex(a, b);
    }
  } else {
    retVal = -1;
  }
  return retVal;
};

const sortWithUndefined = (a, b) => {
  let retVal;
  if ((typeof a.percentage === 'undefined') && (typeof b.percentage === 'undefined')) {
    retVal = 0;
  } else if (typeof a.percentage === 'undefined') {
    retVal = 1;
  } else {
    retVal = -1;
  }
  return retVal;
};

const sortChangesetsByCoverageScore = (a, b) => {
  let retVal;
  if ((typeof a.percentage === 'undefined') || (typeof b.percentage === 'undefined')) {
    // Some changesets are marked as 'No changes'
    // These changes cannot affect coverage, thus, an undefined percentage
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
  const { coverage, summary } = await getPendingCoverage(changesetsCoverage);
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
