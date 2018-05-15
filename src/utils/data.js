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

export const sortChangesets = (changesets, changesetsCoverage, sortingMethod) => {
  if ((Object.keys(changesets).legnth === 0) ||
      (Object.keys(changesetsCoverage).length === 0)) {
    return [];
  }
  const sortedChangesets = mapToArray(changesets)
    .filter(cset => changesetsCoverage[cset.node].show);
  if (sortingMethod === sortingMethods.DATE) {
    sortedChangesets.sort(sortChangesetsByRecency);
  }
  return sortedChangesets;
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
