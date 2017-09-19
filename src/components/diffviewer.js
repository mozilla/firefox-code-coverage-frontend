import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import * as FetchAPI from '../fetch_data';

const parse = require('parse-diff');

/* DiffViewer loads a raw diff from Mozilla's hg-web and code coverage from
 * shiptit-uplift to show a diff with code coverage information for added
 * lines.
 */
export default class DiffViewerContainer extends Component {
  state = {
    appError: undefined,
    coverage: undefined,
    parsedDiff: []
  }

  componentDidMount() {
    const { changeset } = this.props;

    FetchAPI.getDiff(changeset).then(response =>
      response.text()
    ).then(text =>
      this.setState({ parsedDiff: parse(text) })
    ).catch(error =>
      this.setState({ appError: error })
    );

    FetchAPI.getChangesetCoverage(changeset).then(response =>
      response.text()
    ).then(text =>
      this.setState({ coverage: JSON.parse(text) })
    ).catch(error =>
      this.setState({ appError: error })
    );
  }

  render() {
    const { changeset } = this.props;
    const { appError, coverage, parsedDiff } = this.state;
    return (
      <DiffViewer
        appError={appError}
        changeset={changeset}
        coverage={coverage}
        parsedDiff={parsedDiff} />
    );
  }
}

const DiffViewer = ({ appError, changeset, coverage, parsedDiff }) => (
  <div className="page_body codecoverage-diffviewer">
    <Link className="return-home" to="/">Return to main page</Link>
    <DiffViewerMeta appError={appError} changeset={changeset} />
    <CoverageMeta coverage={coverage} parsedDiff={parsedDiff} />
    <br />
    {parsedDiff.map(
      (diffBlock, index) =>
        // We only push down the subset of code coverage data
        // applicable to a file
        (
          <DiffFile
            key={index}
            id={index}
            diffBlock={diffBlock}
            coverage={coverage} />
        )
    )}
  </div>
);

const DiffViewerMeta = ({ appError, changeset }) => {
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

const NetCoverage = ({ addedLines, coveredLines, netGain }) => (
  <tr><td>
    {`New lines coverage change: ${netGain}% / `}
    {`Added lines: ${addedLines} / `}
    {`Covered lines: ${coveredLines}`}
  </td></tr>
);

const CoverageMeta = ({ coverage, parsedDiff }) => {
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
  if (netGain.length > 1) {
    netGain = netGain.toPrecision(3);
  }

  if (coverage.diffs.length === 0) {
    errorMessage = 'This change does not have NEW LINES.';
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
        <NetCoverage
          addedLines={addedLines}
          coveredLines={coveredLines}
          netGain={netGain} />
        <tr><td>{`Current coverage: ${coverage.overall_cur}`}</td></tr>
        <tr><td>{`Build changeset: ${coverage.build_changeset}`}</td></tr>
        <tr><td><span className="error_message">{errorMessage}</span></td></tr>
      </tbody>
    </table>
  );
};

/* A DiffLine contains all diff changes for a specific file */
const DiffFile = ({ coverage, diffBlock }) => {
  // We try to see if the file modified shows up in the code
  // coverage data we have for this diff
  let coverageInfo;
  if (coverage) {
    coverageInfo = (coverage.diffs) ?
      coverage.diffs.find(info => info.name === diffBlock.from) : undefined;
  }

  return (
    <div className="'difffile'">
      <div className="filesummary">
        <div className="filepath">{diffBlock.from}</div>
      </div>
      {diffBlock.chunks.map((block, index) => (
        <DiffBlock
          key={index}
          block={block}
          coverageInfo={coverageInfo} />
      ))}
    </div>
  );
};

/* A DiffBlock is *one* of the blocks changed for a specific file */
const DiffBlock = ({ block, coverageInfo }) => (
  <div className="diffblock">
    <div className="difflineat">{block.content}</div>
    <table className="diffblock">
      <tbody>
        {block.changes.map((change, index) => (
          <DiffLine
            key={index}
            id={index}
            change={change}
            coverageInfo={coverageInfo} />
         ))}
      </tbody>
    </table>
  </div>
);

/* A DiffLine contains metadata about a line in a DiffBlock */
const DiffLine = ({ change, coverageInfo, id }) => {
  // Information about the line itself
  const c = change;
  // Added, deleted or unchanged line
  const changeType = change.type;
  // CSS tr and td classes
  let rowClass = 'nolinechange';
  const rowId = id;
  // Cell contents
  let [oldLineNumber, newLineNumber] = ['', ''];

  if (changeType === 'add') {
    // Added line - <blank> | <new line number>
    if (coverageInfo) {
      const { coverage } = coverageInfo.changes.find(lineCovInfo =>
        (lineCovInfo.new_line === c.ln));

      if (coverage === 'Y') {
        rowClass = 'hit';
      } else {
        rowClass = 'miss'; // Let's start assuming a miss
      }
    }
    newLineNumber = c.ln;
  } else if (changeType === 'del') {
    // Removed line - <old line number> | <blank>
    oldLineNumber = c.ln;
  } else {
    // Unchanged line - <old line number> | <blank>
    oldLineNumber = c.ln1;
    if (oldLineNumber !== c.ln2) {
      newLineNumber = c.ln2;
    }
  }

  return (
    <tr id={rowId} className={rowClass}>
      <td className="old_line_number">{oldLineNumber}</td>
      <td className="new_line_number">{newLineNumber}</td>
      <td className="line_content">
        <pre>{c.content}</pre>
      </td>
    </tr>
  );
};
