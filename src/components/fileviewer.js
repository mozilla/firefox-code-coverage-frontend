import React, { Component } from 'react';

import * as queryString from 'query-string';
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
      appErr: undefined,
      revision: undefined,
      path: undefined,
      selectedLine: undefined,
      // app data
      parsedFile: undefined,
      coverage: undefined,
    };
    // get revision and path parameters from URL
    this.parseQueryParams();
    this.setSelectedLine = this.setSelectedLine.bind(this);
  }

  async componentDidMount() {
    const {revision, path} = this.state;
    await this.fetchData(revision, path, 'mozilla-central');
  }

  async fetchData(revision, path, repoPath = 'integration/mozilla-inbound') {
    console.log(revision, path, repoPath);
    try {
      // Get source code and coverage in parallel
      const [file, coverage] = await Promise.all([
        rawFile(revision, path, repoPath),
        fileRevisionWithActiveData(revision, path, repoPath),
      ]);
      this.setState({
        parsedFile: file.split('\n'),
        coverage: fileRevisionCoverageSummary(coverage.data),
      });
    } catch (error) {
      this.setState({
        appErr: `${error.name}: ${error.message}`,
      });
    }
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

  render() {
    const { parsedFile, coverage, selectedLine } = this.state;

    return (
      <div>
        <div className="file-view">
          <FileViewerMeta {...this.state} />
          { (parsedFile) && <FileViewer {...this.state} onLineClick={this.setSelectedLine} /> }
        </div>
        <TestsSideViewer
          coverage={coverage}
          lineNumber={selectedLine}
        />
      </div>
    );
  }
}

/* FileViewer component renders each line of the file with its line number */
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
    <tr className={`file-line ${select} ${color}`} onClick={handleOnClick}>
      <td className="file-line-number">{lineNumber}</td>
      <td className="file-line-tests">
        { nTests && <span className="tests">{nTests}</span> }
      </td>
      <td className="file-line-text"><pre>{lineText}</pre></td>
    </tr>
  );
};

/* FileViewerMeta component contains metadata of the file */
const FileViewerMeta = ({ revision, path, appErr, coverage }) => {
  return (
    <div>
      <div className="file-meta-center">
        <div className="file-meta-title">File Coverage</div>
        { (coverage) && <CoveragePercentageViewer coverage={coverage}/> }
      </div>
      {appErr && <span className="error-message">{appErr}</span>}

      <div className="file-summary"><div className="file-path">{path}</div></div>
      <div className="file-meta-revision">revision number: {revision}</div>
    </div>
  );
};
