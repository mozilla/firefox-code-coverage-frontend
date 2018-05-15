import settings from '../settings';
import { getCoverage } from '../utils/coverage';
import { getChangesets } from '../utils/hg';
import { saveInCache } from '../utils/localCache';

const { INTERNAL_ERROR, PENDING } = settings.STRINGS;

export const mapToArray = (csets = {}) => (
  Object.keys(csets).map(node => csets[node])
);

export const extendObject = (obj, copyFrom) => {
  const newObject = Object.create({}, obj);
  Object.keys(copyFrom).forEach((key) => {
    newObject[key] = copyFrom[key];
  });
  return newObject;
};

const generateSummary = (changesetsCoverage) => {
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
  const summary = generateSummary(changesetsCoverage);
  return {
    changesets,
    changesetsCoverage,
    summary,
  };
};

export const pollPendingChangesets = async (changesetsCoverage) => {
  let polling = true;
  console.debug('We are going to poll again for coverage data.');
  // Only poll changesets that are still pending
  const onlyPendingChangesets = mapToArray(changesetsCoverage)
    .filter(cov => cov.summary === PENDING);
  const partialCoverage = await getCoverage(onlyPendingChangesets);
  const count = partialCoverage
    .filter(cov => cov.summary === PENDING).length;
  const csetsCoverage = extendObject(changesetsCoverage, partialCoverage);
  if (count === 0) {
    console.debug('No more polling required.');
    polling = false;
  }
  // It is recommended to keep redux functions being pure functions
  saveInCache('coverage', csetsCoverage);
  return { csetsCoverage, polling };
};
