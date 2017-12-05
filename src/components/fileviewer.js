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
      appErr: undefined,
      revision: undefined,
      path: undefined,
      /* app data */
      parsedFile: undefined,
      coverage: undefined,
      selectedLine: undefined,
    };
    // get revision and path parameters from URL
    this.parseQueryParams();
    this.setSelectedLine = this.setSelectedLine.bind(this);
  }

  async componentDidMount() {
    /* Get source code and coverage in parallel  */
    const {revision, path} = this.state;
    await Promise.all([this.fetchSourceCode(revision, path), this.fetchCoverage(revision, path)]);
  }

  setSelectedLine(selectedLineNumber) {
    // click on a selected line to deselect the line
    if (selectedLineNumber === this.state.selectedLine) {
      this.setState({ selectedLine: undefined });
    } else {
      this.setState({ selectedLine: selectedLineNumber });
    }
  }

  parseQueryParams() {
    const parsedQuery = queryString.parse(this.props.location.search);
    if (!parsedQuery.revision || !parsedQuery.path) {
      this.state = {...this.state, appErr: "Undefined URL query ('revision', 'path' fields are required)"};
    } else {
      /* Remove beginning '/' in the path parameter to fetch from source,
       * makes both path=/path AND path=path acceptable in the URL query
       * Ex. "path=/accessible/atk/Platform.cpp" AND "path=accessible/atk/Platform.cpp"
       */
      this.state = {...this.state,
        revision: parsedQuery.revision,
        path: parsedQuery.path.startsWith('/') ? parsedQuery.path.slice(1) : parsedQuery.path,
      };
    }
  }

  /* Get source code from hg */
  async fetchSourceCode(revision, path) {
    const source = await rawFile(revision, path, 'integration/mozilla-inbound');
    if (source) {
      this.setState({ parsedFile: source.split('\n') });
    } else {
      this.setState({ appErr: 'We did not manage to fetch source file from hg.mozilla' });
    }
  }

  /* Get coverage from ActiveData */
  async fetchCoverage(revision, path) {
    const coverage = await fileRevisionWithActiveData(revision, path);
    if (coverage) {
      this.setState({ coverage: fileRevisionCoverageSummary(coverage.data) });
    } else {
      this.setState({ appErr: 'We did not manage to fetch test coverage from ActiveData' });
    }
  }

  render() {
    const { appErr, revision, path, parsedFile, coverage, selectedLine } = this.state;

    return (
      <div>
        <div className="file-view">
          <FileViewerMeta {...this.state} />
          { (parsedFile) && <FileViewer {...this.state} onLineClick={this.setSelectedLine} /> }
        </div>
        { (coverage) && <CoveragePercentageViewer coverage={coverage}/> }
        <TestsSideViewer coverage={coverage} lineNumber={selectedLine} />
      </div>
    );
  }
}

/* This component renders each line of the file with its line number */
const FileViewer = ({ parsedFile, coverage, selectedLine, onLineClick }) => (
  <table className="file-view-table">
    <tbody>
      {
        parsedFile.map((lineText, lineNumber) => (
          <Line
            key={lineNumber}
            lineNumber={lineNumber + 1}
            lineText={lineText}
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

  const select = (lineNumber === selectedLine) ? 'selected' : null;

  let nTests, color;
  if (coverage) {
    // hit line
    if (coverage.coveredLines.find(element => element === lineNumber)) {
      nTests = coverage.testsPerHitLine[lineNumber].length;
      color = "hit"
    // miss line
    } else if (coverage.uncoveredLines.find(element => element === lineNumber)) {
      color = 'miss';
    }
  }

  return (
    <tr className={`file_line ${select} ${color}`} onClick={handleOnClick}>
      <td className="file_line_number">{lineNumber}</td>
      <td className="file_line_tests">
        { nTests && <span className="tests">{nTests}</span> }
      </td>
      <td className="file_line_text"><pre>{lineText}</pre></td>
    </tr>
  );
};

/* This component contains metadata of the file */
const FileViewerMeta = ({ revision, path, appErr, parsedFile, coverage }) => {
  const showStatus = (label, data) => {
    let msg;
    if (!data) {
      msg = 'Fetching...';
    } else if (data.length > 0 || Object.keys(coverage).length > 0) {
      msg = <span>&#x2714;</span>; // heavy checkmark
    } else {
      msg = <span>&#x2716;</span>; // heavy multiplication x
    }
    return (<li className="file-meta-li">{label}: {msg}</li>);
  };

  return (
    <div>
      <div className="file-meta-center">
        <div className="file-meta-status">
          <ul className="file-meta-ul">
            { showStatus('Source code', parsedFile) }
            { showStatus('Coverage', coverage) }
          </ul>
        </div>
        <div className="file-meta-title">File Coverage</div>
      </div>
      {appErr && <span className="error_message">{appErr}</span>}

      <div className="file-summary"><div className="file-path">{path}</div></div>
      <div className="file-meta-revision">revision number: {revision}</div>
    </div>
  );
};
