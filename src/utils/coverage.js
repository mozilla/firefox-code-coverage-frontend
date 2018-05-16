import { uniq } from 'lodash';
import settings from '../settings';
import { jsonPost, plainFetch } from './fetch';
import { queryCacheWithFallback } from './localCache';

const {
  ACTIVE_DATA, BACKEND, CCOV_BACKEND, CODECOV_GECKO_DEV, GH_GECKO_DEV,
} = settings;

export const githubUrl = gitCommit => `${GH_GECKO_DEV}/commit/${gitCommit}`;
export const codecovUrl = gitCommit => (`${CODECOV_GECKO_DEV}/commit/${gitCommit}`);
export const ccovBackendUrl = node => (`${BACKEND}/coverage/changeset/${node}`);

const queryChangesetCoverage = node =>
  plainFetch(`${CCOV_BACKEND}/coverage/changeset/${node}`);

const queryActiveData = body =>
  jsonPost(`${ACTIVE_DATA}/query`, body);

const coverageSummary = (coverage) => {
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
export const fileRevisionCoverageSummary = (coverage) => {
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
  const { low, medium, high } = settings.COVERAGE_THRESHOLDS;
  const s = coverageSummary(coverage);
  const result = { className: 'no-change', text: 'No changes' };
  if (typeof s.percentage !== 'undefined') {
    const perc = parseInt(s.percentage, 10);
    if (perc < low.threshold) {
      result.className = low.className;
    } else if (perc < medium.threshold) {
      result.className = medium.className;
    } else {
      result.className = high.className;
    }
    result.text = `${perc}% - ${s.coveredLines} lines covered out of ${s.addedLines} added`;
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
  try {
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
      console.log(`Unexpected HTTP code (${res.status}) for ${coverage}`);
    }
    coverage.node = node;
  } catch (e) {
    console.log(e);
    console.log(`Failed to fetch data for ${node}`);
  }
  return coverage;
};

export const getCoverage = async (changesets) => {
  const fallback = () => (
    Promise.all(changesets.map(async cset =>
      getChangesetCoverage(cset.node)))
  );
  return queryCacheWithFallback('coverage', fallback);
};

export const fileRevisionWithActiveData = async (revision, path, repoPath) => {
  try {
    if (revision.length < settings.MIN_REVISION_LENGTH) {
      throw new RangeError('Revision number too short');
    }
    const res = await queryActiveData({
      from: 'coverage',
      where: {
        and: [
          { eq: { 'source.file.name': path } },
          { prefix: { 'repo.changeset.id': revision } },
          { eq: { 'repo.branch.name': repoPath } },
        ],
      },
      limit: 1000,
      format: 'list',
    });
    if (res.status !== 200) {
      throw new Error();
    }
    return res.json();
  } catch (e) {
    console.error(`Failed to fetch data for revision: ${revision}, path: ${path}\n${e}`);
    throw e;
  }
};
