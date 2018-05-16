import {
  getCoverage,
  getPendingCoverage,
  changesetsCoverageSummary,
} from '../utils/coverage';
import { getChangesets } from '../utils/hg';
import { saveInCache } from '../utils/localCache';

export const sortingMethods = {
  DATE: 'date',
  COVERAGE: 'coverage',
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

export const sortChangesets = (changesets, changesetsCoverage, sortingMethod) => {
  if ((Object.keys(changesets).legnth === 0) ||
      (Object.keys(changesetsCoverage).length === 0)) {
    return [];
  }
  let sortedChangesets = [];
  if (sortingMethod === sortingMethods.DATE) {
    sortedChangesets = mapToArray(changesets)
      .filter(cset => changesetsCoverage[cset.node].show);
    sortedChangesets.sort(sortChangesetsByRecency);
  } else if (sortingMethod === sortingMethods.COVERAGE) {
    Object.keys(changesetsCoverage).forEach((node) => {
      if (changesetsCoverage[node].show) {
        sortedChangesets.push(changesetsCoverage[node]);
      }
    });
    sortedChangesets.sort(sortChangesetsByCoverageScore);
  }
  return sortedChangesets;
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
