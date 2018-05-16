import {
  getCoverage,
  getPendingCoverage,
  changesetsCoverageSummary,
} from '../utils/coverage';
import { getChangesets } from '../utils/hg';
import { saveInCache } from '../utils/localCache';

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
