import React, { Component } from 'react';
import * as queryString from 'query-string';

import { fileRevisionCoverageSummary, fileRevisionWithActiveData, rawFile } from '../utils/data';
import { TestsSideViewer, CoveragePercentageViewer } from './fileviewercov';
import { HORIZONTAL_ELLIPSIS, HEAVY_CHECKMARK } from '../utils/symbol';
import hash from '../utils/hash';

// FileViewer loads a raw file for a given revision from Mozilla's hg web.
// It uses test coverage information from Active Data to show coverage
// for runnable lines.
export default class FileViewerContainer extends Component {
  constructor(props) {
    super(props);
    this.state = this.parseQueryParams();
    this.setSelectedLine = this.setSelectedLine.bind(this);
  }

  componentDidMount() {
    const { revision, path } = this.state;
    this.fetchData(revision, path);
  }

  setSelectedLine(selectedLineNumber) {
    // click on a selected line to deselect the line
    if (selectedLineNumber === this.state.selectedLine) {
      this.setState({ selectedLine: undefined });
    } else {
      this.setState({ selectedLine: selectedLineNumber });
    }
  }

  fetchData(revision, path, repoPath = 'mozilla-central') {
    // Get source code from hg
    const fileSource = async () => {
      this.setState({ parsedFile: (await rawFile(revision, path, repoPath)) });
    };
    // Get coverage from ActiveData
    const coverageData = async () => {
      const { data } = await fileRevisionWithActiveData(revision, path, repoPath);
      this.setState({ coverage: fileRevisionCoverageSummary(data) });
    };
    // Fetch source code and coverage in parallel
    try {
      Promise.all([fileSource(), coverageData()]);
    } catch (error) {
      this.setState({ appErr: `${error.name}: ${error.message}` });
    }
  }

  parseQueryParams() {
    const parsedQuery = queryString.parse(this.props.location.search);
    const out = {
      appError: undefined,
      revision: undefined,
      path: undefined,
    };
    if (!parsedQuery.revision || !parsedQuery.path) {
      out.appErr = "Undefined URL query ('revision', 'path' fields are required)";
    } else {
      // Remove beginning '/' in the path parameter to fetch from source,
      // makes both path=/path AND path=path acceptable in the URL query
      // Ex. "path=/accessible/atk/Platform.cpp" AND "path=accessible/atk/Platform.cpp"
      out.revision = parsedQuery.revision;
      out.path = parsedQuery.path.startsWith('/') ? parsedQuery.path.slice(1) : parsedQuery.path;
    }
    return out;
  }

  render() {
    const { parsedFile, coverage, selectedLine } = this.state;

    return (
      <div className="filecov-container">
        <FileViewerMeta {...this.state} />
        { (parsedFile) && <FileViewer {...this.state} onLineClick={this.setSelectedLine} /> }
        <TestsSideViewer
          coverage={coverage}
          lineNumber={selectedLine}
        />
      </div>
    );
  }
}

// This component renders each line of the file with its line number
const FileViewer = ({ parsedFile, coverage, selectedLine, onLineClick }) => (
  <div className="file-view">
    <table className="file-view-table">
      <tbody>
        {parsedFile.map((text, lineNumber) => {
          const uniqueId = hash(text) + lineNumber;
          return (
            <Line
              key={uniqueId}
              lineNumber={lineNumber + 1}
              text={text}
              coverage={coverage}
              selectedLine={selectedLine}
              onLineClick={onLineClick}
            />
          );
        })}
      </tbody>
    </table>
  </div>
);

const Line = ({ lineNumber, text, coverage, selectedLine, onLineClick }) => {
  const handleOnClick = () => {
    onLineClick(lineNumber);
  };

  const select = (lineNumber === selectedLine) ? 'selected' : '';

  let color = '';
  let nTests = '';
  if (coverage) {
    // hit line
    if (coverage.coveredLines.find(element => element === lineNumber)) {
      nTests = coverage.testsPerHitLine[lineNumber].length;
      color = 'hit';
    // miss line
    } else if (coverage.uncoveredLines.find(element => element === lineNumber)) {
      color = 'miss';
    }
  }

  return (
    <tr className={`file-line ${select} ${color}`} onClick={handleOnClick}>
      <td className="file-line-number">{lineNumber}</td>
      <td className="file-line-tests">{nTests}</td>
      <td className="file-line-text"><pre>{text}</pre></td>
    </tr>
  );
};

// This component contains metadata of the file
const FileViewerMeta = ({ revision, path, appErr, parsedFile, coverage }) => {
  const showStatus = (label, data) => (
    <li className="file-meta-li">
      {label}: {(data) ? HEAVY_CHECKMARK : HORIZONTAL_ELLIPSIS}
    </li>
  );

  return (
    <div className="file-meta">
      <div className="file-meta-center">
        <div className="file-meta-title">File Coverage</div>
        { (coverage) && <CoveragePercentageViewer coverage={coverage} /> }
        <div className="file-meta-status">
          <ul className="file-meta-ul">
            { showStatus('Source code', parsedFile) }
            { showStatus('Coverage', coverage) }
          </ul>
        </div>
      </div>
      {appErr && <span className="error-message">{appErr}</span>}

      <div className="file-summary">
        <span className="file-path">{path}</span>
      </div>
      <div className="file-meta-revision">revision number: {revision}</div>
    </div>
  );
};
