import React, { Component } from 'react';

import * as queryString from 'query-string';
import * as Color from '../utils/color';
import { fileRevisionCoverageSummary, fileRevisionWithActiveData, rawFile } from '../utils/data';
import { TestsSideViewer, CoveragePercentageViewer } from './fileviewercov';

/* FileViewer loads a raw file for a given revision from Mozilla's hg web.
 * It uses test coverage information from Active Data to show coverage
 * for runnable lines.
 */
export default class FileViewerContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      /* app status */
      status: {
        app: undefined,
      },
      revision: undefined,
      path: undefined,
      /* app data */
      parsedFile: [],
      coverage: {
        coveredLines: [],
        uncoveredLines: [],
        allTests: [],
        testsPerHitLine: [],
      },
      selectedLine: undefined,
    };
    this.setSelectedLine = this.setSelectedLine.bind(this);
  }

  componentWillMount() {
    /* get revision and path parameters from URL */
    this.parseQueryParams();
  }

  async componentDidMount() {
    /* Get source code and coverage in parallel  */
    await Promise.all([this.fetchSourceCode(), this.fetchCoverage()]);
  }

  setSelectedLine(selectedLineNumber) {
    this.setState({ selectedLine: selectedLineNumber });
  }

  parseQueryParams() {
    const parsedQuery = queryString.parse(this.props.location.search);
    if (!parsedQuery.revision || !parsedQuery.path) {
      this.setState({ status: { app: "Undefined URL query ('revision', 'path' fields are required)" } });
    } else {
      this.setState({
        revision: parsedQuery.revision,
        /* remove beginning '/' in the path parameter to fetch from source */
        path: parsedQuery.path.startsWith('/') ? parsedQuery.path.slice(1) : parsedQuery.path });
    }
  }

  /* Get source code from hg */
  async fetchSourceCode(revision = this.state.revision, path = this.state.path) {
    const source = await rawFile(revision, path, 'integration/mozilla-inbound');
    if (source) {
      this.setState({ parsedFile: source.split('\n') });
    } else {
      this.setState({ status: { app: 'We did not manage to fetch source file from hg.mozilla' } });
    }
  }

  /* Get coverage from ActiveData */
  async fetchCoverage(revision = this.state.revision, path = this.state.path) {
    const coverage = await fileRevisionWithActiveData(revision, path);
    if (coverage) {
      this.setState({ coverage: fileRevisionCoverageSummary(coverage.data) });
    } else {
      this.setState({ status: { app: 'We did not manage to fetch test coverage from ActiveData' } });
    }
  }

  render() {
    const { status, revision, path, parsedFile, coverage, selectedLine } = this.state;

    return (
      <div>
        <div className="file-view">
          <FileViewerMeta
            revision={revision}
            path={path}
            status={status}
            parsedFile={parsedFile}
            coverage={coverage}
          />
          <FileViewer
            parsedFile={parsedFile}
            coverage={coverage}
            selectedLine={selectedLine}
            onLineClick={this.setSelectedLine}
          />
        </div>
        <CoveragePercentageViewer
          coverage={coverage}
        />
        <TestsSideViewer
          coverage={coverage}
          lineNumber={selectedLine}
        />
      </div>
    );
  }
}

/* This component renders each line of the file with its line number */
const FileViewer = ({ parsedFile, coverage, selectedLine, onLineClick }) => (
  <table className="file-view-table">
    <tbody>
      {
        parsedFile.map((line, lineNumber) => (
          <Line
            key={lineNumber}
            lineNumber={lineNumber + 1}
            lineText={line}
            coverage={coverage}
            selectedLine={selectedLine}
            onLineClick={onLineClick}
          />
        ))
      }
    </tbody>
  </table>
);

const Line = ({ lineNumber, lineText, coverage, selectedLine, onLineClick }) => {
  const handleOnClick = () => {
    onLineClick(lineNumber);
  };

  const lineClass = (lineNumber === selectedLine) ? 'selected' : 'unselected';

  // default line color
  let nTests;
  let color = '#ffffff';
  // hit line
  if (coverage.coveredLines.find(element => element === lineNumber)) {
    nTests = coverage.testsPerHitLine[lineNumber].length;
    color = Color.getLineHitCovColor(nTests / coverage.allTests.length);
  // miss line
  } else if (coverage.uncoveredLines.find(element => element === lineNumber)) {
    color = '#ffe5e5';
  }

  return (
    <tr className={`file_line ${lineClass}`} onClick={handleOnClick} style={{ backgroundColor: `${color}` }}>
      <td className="file_line_number">{lineNumber}</td>
      <td className="file_line_tests">
        { nTests && <span className="tests">{nTests}</span> }
      </td>
      <td className="file_line_text"><pre>{lineText}</pre></td>
    </tr>
  );
};

/* This component contains metadata of the file */
const FileViewerMeta = ({ revision, path, status, parsedFile, coverage }) => {
  const showStatus = (label, fetched) => {
    let msg;
    if (fetched === undefined) {
      msg = 'Fetching...';
    } else if (fetched === true) {
      msg = <span>&#x2714;</span>; // heavy checkmark
    } else if (fetched === false) {
      msg = <span>&#x2716;</span>; // heavy multiplication x
    }
    return (<li className="file-meta-li">{label}: {msg}</li>);
  };

  return (
    <div>
      <div className="file-meta-center">
        <div className="file-meta-status">
          <ul className="file-meta-ul">
            { showStatus('Source code', parsedFile.length > 0) }
            { showStatus('Coverage', Object.keys(coverage).length > 0) }
          </ul>
        </div>
        <div className="file-meta-title">File Coverage</div>
      </div>
      {status.app && <span className="error_message">{status.app}</span>}

      <div className="file-summary"><div className="file-path">{path}</div></div>
      <div className="file-meta-revision">revision number: {revision}</div>
    </div>
  );
};
