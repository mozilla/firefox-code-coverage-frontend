import { uniq } from 'lodash';
import settings from '../settings';
import { jsonFetch, jsonPost, plainFetch } from './fetch';
import { queryCacheWithFallback, saveInCache } from './localCache';

const {
  ACTIVE_DATA, CCOV_BACKEND, CCOV_STAGING_BACKEND, CODECOV_GECKO_DEV, GH_GECKO_DEV,
} = settings;

const { INTERNAL_ERROR, PENDING } = settings.STRINGS;

export const githubUrl = gitCommit => `${GH_GECKO_DEV}/commit/${gitCommit}`;
export const codecovUrl = gitCommit => (`${CODECOV_GECKO_DEV}/commit/${gitCommit}`);
export const ccovBackendUrl = node => (`${CCOV_BACKEND}/coverage/changeset/${node}`);

const queryChangesetCoverage = node =>
  plainFetch(`${CCOV_BACKEND}/coverage/changeset/${node}`);

export const queryPathCoverage = (path, revision) =>
  jsonFetch(`${CCOV_STAGING_BACKEND}/v2/path?path=${path}${revision ? `&changeset=${revision}` : ''}`);

const queryActiveData = body =>
  jsonPost(`${ACTIVE_DATA}/query`, body);

export const querySupportedFiles = () =>
  jsonFetch(`${CCOV_BACKEND}/coverage/supported_extensions`);

const coverageStatistics = (coverage) => {
  const s = {
    addedLines: 0,
    coveredLines: 0,
  };
  Object.keys(coverage.diffs).forEach((filePath) => {
    Object.keys(coverage.diffs[filePath].lines).forEach((lineNumber) => {
      const lineCoverage = coverage.diffs[filePath].lines[lineNumber];
      if (lineCoverage === 'Y') {
        s.coveredLines += 1;
      }
      if (lineCoverage !== '?') {
        s.addedLines += 1;
      }
    });
  });
  s.percentage = (s.addedLines === 0) ?
    undefined : 100 * (s.coveredLines / s.addedLines);
  return s;
};

// get the coverage summary for a particular revision and file
export const sourceCoverageSummary = (coverage) => {
  const s = {
    coveredLines: [],
    uncoveredLines: [],
    allTests: coverage,
    testsPerHitLine: [],
  };
  // get covered lines and tests that cover each line
  coverage.forEach((c) => {
    c.source.file.covered.forEach((line) => {
      s.coveredLines.push(line);
      if (!s.testsPerHitLine[line]) {
        s.testsPerHitLine[line] = [];
      }
      s.testsPerHitLine[line].push(c);
    });
  });
  s.coveredLines = uniq(s.coveredLines);
  // get uncovered lines
  coverage.forEach((c) => {
    c.source.file.uncovered.forEach((line) => {
      if (!s.testsPerHitLine[line]) {
        s.uncoveredLines.push(line);
      }
    });
  });
  s.uncoveredLines = uniq(s.uncoveredLines);
  // calculate line coverage stats
  s.numCovLines = s.coveredLines.length;
  s.numUncovLines = s.uncoveredLines.length;
  s.numTotalLines = s.numCovLines + s.numUncovLines;
  s.percentage = (s.numCovLines !== 0 ||
    s.numUncovLines !== 0) ? ((s.numCovLines / s.numTotalLines) * 100) : undefined;
  return s;
};

export const coverageSummaryText = (coverage) => {
  const { percentage, coveredLines, addedLines } = coverage.statistics;
  const { low, medium, high } = settings.COVERAGE_THRESHOLDS;
  const result = { className: 'no-change', text: 'No changes' };
  if (typeof percentage !== 'undefined') {
    const perc = parseInt(percentage, 10);
    if (perc < low.threshold) {
      result.className = low.className;
    } else if (perc < medium.threshold) {
      result.className = medium.className;
    } else {
      result.className = high.className;
    }
    result.text = `${perc}% - ${coveredLines} lines covered out of ${addedLines} added`;
  }
  return result;
};

// Get percentage of uncovered lines in one file
const fileCoveragePercent = (file) => {
  const s = {
    coveredLines: Object.values(file).filter(coverage => coverage === 'Y').length,
    uncoveredLines: Object.values(file).filter(coverage => coverage === 'N').length,
  };
  const totalCoverableLines = s.coveredLines + s.uncoveredLines;

  s.percentage = (totalCoverableLines === 0) ?
    0 : 100 * (s.uncoveredLines / totalCoverableLines);
  return s.percentage;
};

// We transform the data
export const transformCoverageData = (cov) => {
  /* We only want to transform the diffs entry in the data:
    "diffs": [{
        "changes": [{ "coverage": "?", "line": 413 }, ... ]
        "name": "browser/extensions/formautofill/FormAutofillParent.jsm"
      }]
    to
    "diffs": {
      "browser/extensions/formautofill/FormAutofillParent.jsm": {
        "413": "?",
      }
   */
  const newCov = Object.assign({}, cov);
  newCov.diffs = {};
  cov.diffs.forEach(({ changes, name }) => {
    const lines = {};
    changes.forEach(({ coverage, line }) => {
      lines[line] = coverage;
    });
    newCov.diffs[name] = {
      lines,
      percent: fileCoveragePercent(lines),
    };
  });
  // Some extra data for the UI
  newCov.statistics = coverageStatistics(newCov);
  const result = coverageSummaryText(newCov);
  newCov.summary = result.text;
  newCov.summaryClassName = result.className;
  return newCov;
};

export const getChangesetCoverage = async (node) => {
  if (!node) {
    throw Error(`No node for cset: ${node}`);
  }
  let coverage = { show: false };
  const res = await queryChangesetCoverage(node);
  if (res.status === 202) {
    // This is the only case when we poll again
    coverage.summary = settings.STRINGS.PENDING;
  } else if (res.status === 200) {
    coverage = transformCoverageData(await res.json());
    coverage.show = true;
  } else if (res.status === 500) {
    coverage.summary = res.statusText;
  } else {
    console.warning(`Unexpected HTTP code (${res.status}) for ${coverage}`);
  }
  coverage.node = node;
  return coverage;
};

export const getCoverage = async (changesets) => {
  const fallback = async () => {
    const results = await Promise.all(
      Object.keys(changesets)
        .map(async node => getChangesetCoverage(node)));
    const changesetsCoverage = {};
    results.forEach((csetCov) => {
      changesetsCoverage[csetCov.node] = csetCov;
    });
    return changesetsCoverage;
  };
  return queryCacheWithFallback('coverage', fallback);
};

export const changesetsCoverageSummary = (changesetsCoverage) => {
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

export const pollPendingChangesets = async (coverage) => {
  let pollingEnabled = true;
  console.debug('We are going to poll again for coverage data.');
  const { changesetsCoverage, summary } = await getCoverage(coverage);
  if (summary.pending === 0) {
    console.debug('No more polling required.');
    pollingEnabled = false;
  }
  saveInCache('coverage', changesetsCoverage);
  return { changesetsCoverage, pollingEnabled };
};

export const getPendingCoverage = async (changesetsCoverage) => {
  const results = await Promise.all(
    Object.keys(changesetsCoverage)
      .map(async (node) => {
        let csetCoverage = changesetsCoverage[node];
        if (csetCoverage.summary === PENDING) {
          csetCoverage = await getChangesetCoverage(node);
        }
        return csetCoverage;
      }));

  const csetsCoverage = {};
  results.forEach((csetCov) => {
    csetsCoverage[csetCov.node] = csetCov;
  });
  return {
    coverage: csetsCoverage,
    summary: changesetsCoverageSummary(csetsCoverage),
  };
};

export const sourceCoverageFromActiveData = async (revision, path, repoPath) => {
  try {
    if (revision.length < settings.MIN_REVISION_LENGTH) {
      throw new RangeError('Revision number too short');
    }
    const res = await queryActiveData({
      from: 'coverage',
      where: {
        and: [
          { eq: { 'source.file.name': path } },
          { eq: { 'repo.branch.name': repoPath } },
          { prefix: { 'repo.changeset.id': revision } },
        ],
      },
      limit: 1000,
      format: 'list',
    });
    if (res.status !== 200) {
      throw new Error(`HTTP response ${res.status}`);
    }
    return res.json();
  } catch (e) {
    throw new Error(`Failed to fetch data for revision: ${revision}, path: ${path}\n${e}`);
  }
};

export const pathCoverageFromBackend = async (revision, path, repoPath) => {
  try {
    if (revision.length < settings.MIN_REVISION_LENGTH) {
      throw new RangeError('Revision number too short');
    }
    const data = await queryPathCoverage(path /* , revision */);
    if (data.status && data.staus !== 200) {
      throw new Error(`HTTP response ${data.status}`);
    }
    return data;
  } catch (error) {
    // FIXME: If you start using this method, please replace the `console.error()` with a `throw`.
    console.error(new Error(`Failed to fetch data for revision: ${revision}, path: ${path}\n${error}`));
  }
};
