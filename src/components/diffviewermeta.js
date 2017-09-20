import React from 'react';

import * as FetchAPI from '../fetch_data';

export const DiffViewerMeta = ({ appError, changeset }) => {
  const hgRev = `${FetchAPI.hgHost}/mozilla-central/rev/${changeset}`;
  const ccovUrl = `${FetchAPI.ccovBackend}/coverage/changeset/${changeset}`;

  return (
    <table>
      <tbody>
        <tr><td>Link to <a
          className="hg-rev"
          href={hgRev}
          target="_blank">Hg diff ({changeset})</a>
        </td></tr>
        <tr><td>Link to <a
          className="coverage-changeset-api"
          href={ccovUrl}
          target="_blank">Code coverage backend</a></td></tr>
        <tr><td><span className="error_message">{appError}</span></td></tr>
      </tbody>
    </table>
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
    {`New lines coverage change: ${netGain}% / `}
    {`Added lines: ${addedLines} / `}
    {`Covered lines: ${coveredLines}`}
  </td></tr>
);

export const CoverageMeta = ({ coverage, parsedDiff }) => {
  let errorMessage;
  if (!coverage || coverage.error) {
    if (!coverage) {
      errorMessage = "We're waiting for coverage data from the backend.";
    } else if (coverage.error) {
      errorMessage = coverage.error;
    }
    return (
      <table><tbody>
        <tr><td><span className="error_message">{errorMessage}</span></td></tr>
      </tbody></table>
    );
  }

  if (coverage.diffs.length === 0) {
    errorMessage = `There is no code coverage for this diff
                    or no new lines are being added to this diff.`;
  }

  const codecov = `https://codecov.io/gh/marco-c/gecko-dev/commit/${coverage.git_build_changeset}`;
  const gh = `https://github.com/mozilla/gecko-dev/commit/${coverage.git_build_changeset}`;

  return (
    <table>
      <tbody>
        <tr><td>Link to <a
          className="codecov"
          href={codecov}
          target="_blank">Codecov</a></td></tr>
        <tr><td>Link to <a
          className="GH"
          href={gh}
          target="_blank">GitHub</a></td></tr>
        {(parsedDiff.length > 0 && coverage) &&
          <NetCoverageContainer
            coverage={coverage}
            parsedDiff={parsedDiff} />}
        <tr><td>{`Current coverage: ${coverage.overall_cur.substring(0, 4)}%`}</td></tr>
        <tr><td>{`Build changeset: ${coverage.build_changeset}`}</td></tr>
        <tr><td><span className="error_message">{errorMessage}</span></td></tr>
      </tbody>
    </table>
  );
};
