import { PENDING, SETTINGS } from '../settings';
import * as FetchAPI from '../utils/fetch_data';

export const arrayToMap = (csets) => {
  const newCsets = {};
  csets.forEach((cset) => {
    newCsets[cset.node] = cset;
  });
  return newCsets;
};

export const mapToArray = csets => (
  Object.keys(csets).map(node => csets[node])
);

const coverageSummary = (coverage) => {
  const s = {
    addedLines: 0,
    coveredLines: 0,
  };
  if (coverage.diffs.length > 0) {
    coverage.diffs.forEach((diff) => {
      diff.changes.forEach((change) => {
        if (change.coverage === 'Y') {
          s.coveredLines += 1;
        }
        if (change.coverage !== '?') {
          s.addedLines += 1;
        }
      });
      s.percentage = (s.addedLines === 0) ?
        undefined :
        100 * (s.coveredLines / s.addedLines);
    });
  }
  return s;
};

export const coverageSummaryText = (coverage) => {
  const { coverageThresholds } = SETTINGS;
  const { low, medium, high } = coverageThresholds;
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

export const csetWithCcovData = async (cset) => {
  if (!cset.node) {
    throw Error(`No node for cset: ${cset}`);
  }
  const newCset = Object.assign({}, cset);
  // XXX: fetch does not support timeouts. I would like to add a 5 second
  // timeout rather than wait Heroku's default 30 second timeout. Specially
  // since we're doing sequential fetches.
  // XXX: Wrap fetch() in a Promise; add a setTimeout and call reject() if
  // it goes off, otherwise resolve with the result of the fetch()
  try {
    const res = await FetchAPI.getChangesetCoverage(cset.node);
    if (res.status === 202) {
      // This is the only case when we poll again
      newCset.summary = PENDING;
    } else if (res.status === 200) {
      const coverageData = await res.json();

      // XXX: Document in which cases we would not have overall_cur
      if (coverageData.overall_cur) {
        // We have coverage data, thus, adding links to the coverage diff viewer
        // and unhiding the csets
        newCset.linkify = true;
        newCset.hidden = false;
        newCset.coverage = {
          ...coverageData,
          diffMeta: node => ({
            hgRev: `${FetchAPI.hgHost}/mozilla-central/rev/${node}`,
            ccovBackend: `${FetchAPI.ccovBackend}/coverage/changeset/${node}`,
          }),
          parentMeta: coverage => ({
            pushlog: `https://hg.mozilla.org/mozilla-central/pushloghtml?changeset=${coverage.build_changeset}`,
            codecov: `https://codecov.io/gh/marco-c/gecko-dev/commit/${coverage.git_build_changeset}`,
            gh: `https://github.com/mozilla/gecko-dev/commit/${coverage.git_build_changeset}`,
          }),
        };
        const result = coverageSummaryText(coverageData);
        newCset.summary = result.text;
        newCset.summaryClassName = result.className;
      } else {
        console.error(`No overall_cur: ${coverageData}`);
      }
    } else if (res.status === 500) {
      newCset.summary = res.statusText;
    } else {
      console.log(`Unexpected HTTP code (${res.status}) for ${newCset}`);
    }
    return newCset;
  } catch (e) {
    console.log(e);
    console.log(`Failed to fetch data for ${cset.node}`);
    return cset;
  }
};
