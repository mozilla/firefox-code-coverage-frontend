import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import * as FetchAPI from '../fetch_data';
import { DiffMeta, CoverageMeta } from './diffviewermeta';

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
    ).catch((error) => {
      console.error(error);
      this.setState({
        appError: 'We did not manage to parse the diff correctly.'
      });
    });

    FetchAPI.getChangesetCoverage(changeset).then(response =>
      response.text()
    ).then(text =>
      this.setState({ coverage: JSON.parse(text) })
    ).catch((error) => {
      console.error(error);
      this.setState({
        appError: 'There was an error fetching the code coverage data.'
      });
    });
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
    <DiffMeta changeset={changeset} />
    <CoverageMeta coverage={coverage} parsedDiff={parsedDiff} />
    <span className="error_message">{appError}</span>
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
        (lineCovInfo.line === c.ln));

      if (coverage === 'Y') {
        rowClass = 'hit';
      } else if (coverage === '?') {
        rowClass = 'nolinechange';
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
