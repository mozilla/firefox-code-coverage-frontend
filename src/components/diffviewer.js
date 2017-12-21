import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { csetWithCcovData } from '../utils/data';
import hash from '../utils/hash';
import * as FetchAPI from '../utils/fetch_data';

const parse = require('parse-diff');

/* DiffViewer loads a raw diff from Mozilla's hg-web and code coverage from
 * shiptit-uplift to show a diff with code coverage information for added
 * lines.
 */
export default class DiffViewerContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appError: undefined,
      csetMeta: {
        coverage: undefined,
      },
      parsedDiff: [],
    };
  }

  async componentDidMount() {
    const { changeset } = this.props;
    await Promise.all([this.fetchSetCoverageData(changeset), this.fetchSetDiff(changeset)]);
  }

  async fetchSetCoverageData(changeset) {
    try {
      this.setState({ csetMeta: await csetWithCcovData({ node: changeset }) });
    } catch (error) {
      console.error(error);
      this.setState({
        appError: 'There was an error fetching the code coverage data.',
      });
    }
  }

  async fetchSetDiff(changeset) {
    try {
      const text = await (await FetchAPI.getDiff(changeset, 'mozilla-central')).text();
      this.setState({ parsedDiff: parse(text) });
    } catch (error) {
      console.error(error);
      this.setState({
        appError: 'We did not manage to parse the diff correctly.',
      });
    }
  }

  render() {
    const { appError, csetMeta, parsedDiff } = this.state;
    return (
      <DiffViewer
        {...csetMeta}
        appError={appError}
        parsedDiff={parsedDiff}
      />
    );
  }
}

const DiffViewer = ({ appError, coverage, node, parsedDiff, summary }) => (
  <div className="codecoverage-diffviewer">
    <div className="return-home"><Link to="/">Return to main page</Link></div>
    {(coverage) &&
      <CoverageMeta
        {...coverage.parentMeta(coverage)}
        {...coverage.diffMeta(node)}
        coverage={coverage}
        node={node}
        summary={summary}
      />}
    <span className="error_message">{appError}</span>
    {parsedDiff.map(diffBlock =>
      // We only push down the subset of code coverage data
      // applicable to a file
      (
        <DiffFile
          key={diffBlock.from}
          diffBlock={diffBlock}
          fileCoverageDiffs={(coverage) ?
            coverage.diffs[diffBlock.from] : undefined}
        />
      ))}
  </div>
);

const CoverageMeta = ({ ccovBackend, codecov, coverage, gh, hgRev, pushlog, summary }) => (
  <div className="coverage-meta">
    <div className="coverage-meta-row">
      <span className="meta parent-meta-subtitle">Parent meta</span>
      <span className="meta">
        {`Current coverage: ${coverage.overall_cur.substring(0, 4)}%`}
      </span>
      <span className="meta meta-right">
        <a href={pushlog} target="_blank">Push log</a>&nbsp;
        <a href={gh} target="_blank">GitHub</a>&nbsp;
        <a href={codecov} target="_blank">Codecov</a>
      </span>
    </div>
    <div className="coverage-meta-row">
      <span className="meta parent-meta-subtitle">Changeset meta</span>
      <span className="meta">{summary}</span>
      <span className="meta meta-right">
        <a href={hgRev} target="_blank">Hg diff</a>&nbsp;
        <a href={ccovBackend} target="_blank">Coverage backend</a>
      </span>
    </div>
  </div>
);

/* A DiffLine contains all diff changes for a specific file */
const DiffFile = ({ fileCoverageDiffs, diffBlock }) => (
  <div className="diff-file">
    <div className="file-summary">
      <div className="file-path">{diffBlock.from}</div>
    </div>
    {diffBlock.chunks.map(block => (
      <DiffBlock
        key={block.content}
        filePath={diffBlock.from}
        block={block}
        fileDiffs={fileCoverageDiffs}
      />
    ))}
  </div>
);

const uniqueLineId = (filePath, change) => {
  let lineNumber;
  if (change.ln) {
    lineNumber = change.ln;
  } else if (change.ln2) {
    lineNumber = change.ln2;
  } else {
    lineNumber = change.ln1;
  }
  return `${hash(filePath)}-${change.type}-${lineNumber}`;
};

/* A DiffBlock is *one* of the blocks changed for a specific file */
const DiffBlock = ({ filePath, block, fileDiffs }) => (
  <div>
    <div className="diff-line-at">{block.content}</div>
    <div className="diff-block">
      <table className="diff-block-table">
        <tbody>
          {block.changes.map((change) => {
            const uid = uniqueLineId(filePath, change);
            return (<DiffLine
              key={uid}
              id={uid}
              change={change}
              fileDiffs={fileDiffs}
            />);
          })}
        </tbody>
      </table>
    </div>
  </div>
);

/* A DiffLine contains metadata about a line in a DiffBlock */
const DiffLine = ({ change, fileDiffs, id }) => {
  const c = change; // Information about the line itself
  const changeType = change.type; // Added, deleted or unchanged line
  let rowClass = 'nolinechange'; // CSS tr and td classes
  const rowId = id;
  let [oldLineNumber, newLineNumber] = ['', '']; // Cell contents

  if (changeType === 'add') {
    // Added line - <blank> | <new line number>
    if (fileDiffs) {
      try {
        const coverage = fileDiffs[c.ln];
        if (coverage === 'Y') {
          rowClass = 'hit';
        } else if (coverage === '?') {
          rowClass = 'nolinechange';
        } else {
          rowClass = 'miss';
        }
      } catch (e) {
        console.log(e);
        rowClass = 'miss';
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
    <tr id={rowId} className={`${rowClass} diff-row`}>
      <td className="old-line-number diff-cell">{oldLineNumber}</td>
      <td className="new-line-number diff-cell">{newLineNumber}</td>
      <td className="line-content diff-cell">
        <pre>{c.content}</pre>
      </td>
    </tr>
  );
};
