import React from 'react';

import * as FetchAPI from '../fetch_data';

export const DiffViewerMeta = ({ changeset }) => {
  const hgRev = `${FetchAPI.hgHost}/mozilla-central/rev/${changeset}`;
  const shipitUrl = `${FetchAPI.ccovBackend}/coverage/changeset/${changeset}`;

  return (
    <div>
      <span><b>Meta for diff ({changeset})</b></span>
      <table>
        <tbody>
          <tr>
            <td>
              <a href={hgRev} target="_blank">Hg diff</a>&nbsp;-&nbsp;
              <a href={shipitUrl} target="_blank">Shipit backend</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const NetCoverageContainer = ({ coverage, parsedDiff }) => {
  if (parsedDiff.length > 0) {
    const addedLines = parsedDiff.reduce((sum, file) => (
      sum + file.additions), 0);
    const coveredLines = (coverage.diffs.length !== 0) ?
      coverage.diffs.reduce((sum, file) => (
        ('changes' in file) ?
          sum + file.changes.reduce((acumm, lineCov) => (
              (lineCov.coverage === 'Y') ? acumm + 1 : acumm), 0) :
          sum), 0) : 0;

    let netGain = ((addedLines !== 0) ?
      (coveredLines / addedLines) * 100 : 0);
    netGain = netGain.toPrecision(3);

    return (<NetCoverage
      addedLines={addedLines}
      coveredLines={coveredLines}
      netGain={netGain} />);
  }
};

const NetCoverage = ({ addedLines, coveredLines, netGain }) => (
  <tr><td>
    <span className="net-lines-coverage-change">
        New lines coverage change: {netGain}%;
    </span>
    {` / Added lines: ${addedLines} / `}
    {`Covered lines: ${coveredLines}`}
  </td></tr>
);

const ParentMeta = ({ coverage }) => {
  const pushlog = `https://hg.mozilla.org/mozilla-central/pushloghtml?changeset=${coverage.build_changeset}`;
  const codecov = `https://codecov.io/gh/marco-c/gecko-dev/commit/${coverage.git_build_changeset}`;
  const gh = `https://github.com/mozilla/gecko-dev/commit/${coverage.git_build_changeset}`;

  return (
    <div>
      <div>
        <b>Meta for parent code coverage build ({coverage.build_changeset})</b>
      </div>
      <div>
        {`Current coverage: ${coverage.overall_cur.substring(0, 4)}%`}&nbsp;-&nbsp;
        <a href={pushlog} target="_blank">Push log</a>&nbsp;-&nbsp;
        <a href={gh} target="_blank">GitHub</a>&nbsp;-&nbsp;
        <a href={codecov} target="_blank">Codecov</a>
      </div>
    </div>
  );
};

export const CoverageMeta = ({ coverage, parsedDiff }) => {
  let errorMessage;
  if (!coverage || coverage.error) {
    if (!coverage) {
      errorMessage = "We're waiting for coverage data from the backend.";
    } else if (coverage.error) {
      errorMessage = coverage.error;
    }
    return (
      <div className="error_message">{errorMessage}</div>
    );
  }

  if (coverage.diffs.length === 0) {
    errorMessage = `There is no code coverage for this diff
                    or no new lines are being added to this diff.`;
  }

  return (
    <div>
      {(parsedDiff.length > 0 && coverage) &&
        <NetCoverageContainer
          coverage={coverage}
          parsedDiff={parsedDiff} />}
      <ParentMeta coverage={coverage} />
      <div className="error_message">{errorMessage}</div>
    </div>
  );
};
