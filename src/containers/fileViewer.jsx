import React, { Component } from 'react';

import FileOutlineIcon from 'mdi-react/FileOutlineIcon';
import FolderOutlineIcon from 'mdi-react/FolderOutlineIcon';
import settings from '../settings';
import { sourceCoverageSummary, sourceCoverageFromActiveData, pathCoverageFromBackend } from '../utils/coverage';
import { rawFile } from '../utils/hg';
import { TestsSideViewer, CoveragePercentageViewer } from '../components/fileViewer';
import { HORIZONTAL_ELLIPSIS, HEAVY_CHECKMARK } from '../utils/symbol';
import hash from '../utils/hash';

const { low, medium, high } = settings.COVERAGE_THRESHOLDS;

// FileViewer loads a raw file for a given revision from Mozilla's hg web.
// It uses test coverage information from Active Data to show coverage
// for runnable lines.
export default class FileViewerContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.setSelectedLine = this.setSelectedLine.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { revision, path } = this.props;
    if (revision === prevProps.revision && path === prevProps.path) {
      return;
    }
    // Reset the state and fetch new data
    const newState = {
      appErr: undefined,
      pathCoverage: undefined,
      sourceCoverage: undefined,
      parsedFile: undefined,
    };
    // eslint-disable-next-line react/no-did-update-set-state
    this.setState(newState);
    this.fetchData();
  }

  setSelectedLine(selectedLineNumber) {
    // click on a selected line to deselect the line
    if (selectedLineNumber === this.state.selectedLine) {
      this.setState({ selectedLine: undefined });
    } else {
      this.setState({ selectedLine: selectedLineNumber });
    }
  }

  async fetchData(repoPath = 'mozilla-central') {
    const { revision, path } = this.props;
    if (!revision) {
      this.setState({ appErr: "Undefined URL query (field 'revision' is required)" });
      return;
    }
    // Get overall path coverage from backend
    const pathCoverage = async () => {
      const data = await pathCoverageFromBackend(revision, path, repoPath);
      this.setState({ pathCoverage: data });
    };
    // Get detailed source coverage from ActiveData
    const fileCoverage = async () => {
      const { data } = await sourceCoverageFromActiveData(revision, path, repoPath);
      this.setState({ sourceCoverage: sourceCoverageSummary(data) });
    };
    // Get raw source code from hg
    const fileSource = async () => {
      const parsedFile = await rawFile(revision, path, repoPath);
      this.setState({ parsedFile });
    };
    // Fetch source code and coverage in parallel
    try {
      await Promise.all([pathCoverage(), fileCoverage(), fileSource()]);
    } catch (error) {
      console.error(error);
      if ((error instanceof RangeError) && (error.message === 'Revision number too short')) {
        this.setState({ appErr: 'Revision number is too short. Unable to fetch data.' });
      } else {
        this.setState({ appErr: `${error.name}: ${error.message}` });
      }
      throw error;
    }
  }

  render() {
    const { revision, path } = this.props;
    const {
      pathCoverage, sourceCoverage, parsedFile, selectedLine, appErr,
    } = this.state;

    return (
      <div>
        <div className="file-view">
          <FileViewerMeta {...this.props} {...this.state} />
          { pathCoverage && pathCoverage.type === 'directory' &&
          <table className="changeset-viewer">
            <tbody>
              <tr>
                <th>File</th>
                <th>Coverage summary</th>
              </tr>
              {pathCoverage.children.map((file) => {
						      const fileName = file.path.replace(new RegExp(`^${path}`, 'g'), '');
						      const coveragePercent = Math.round(100 * file.coverage);
						      let summaryClassName = high.className;
						      if (coveragePercent < medium.threshold) {
						        summaryClassName =
                      (coveragePercent < low.threshold ? low.className : medium.className);
						      }
						      const href =
                    `/#/file?revision=${revision}&path=${path}${fileName}`;
						      return (
  <tr className="changeset" key={fileName}>
                    <td className="changeset-author">
      <a href={href}>
                        {file.type === 'directory' ? <FolderOutlineIcon /> : <FileOutlineIcon />}
                        <span className="changeset-eIcon-align">{fileName}</span>
                      </a>
    </td>
                    <td className={`changeset-summary ${summaryClassName}`}>{coveragePercent}%</td>
                  </tr>
						      );
						    })}
            </tbody>
          </table> }
          { pathCoverage && pathCoverage.type === 'file' &&
            <div style={{ textAlign: 'center' }}>Coverage: {Math.round(pathCoverage.coverage * 100)}%</div> }
          { parsedFile &&
            <FileViewer {...this.state} onLineClick={this.setSelectedLine} /> }
        </div>
        <TestsSideViewer
          coverage={sourceCoverage}
          lineNumber={selectedLine}
        />
      </div>
    );
  }
}

// This component renders each line of the file with its line number
const FileViewer = ({
  parsedFile, sourceCoverage, selectedLine, onLineClick,
}) => (
  <table className="file-view-table">
    <tbody>
      {parsedFile.map((text, lineNumber) => {
        const uniqueId = hash(text) + lineNumber;
        return (
          <Line
            key={uniqueId}
            lineNumber={lineNumber + 1}
            text={text}
            coverage={sourceCoverage}
            selectedLine={selectedLine}
            onLineClick={onLineClick}
          />
        );
      })}
    </tbody>
  </table>
);

const Line = ({
  lineNumber, text, coverage, selectedLine, onLineClick,
}) => {
  const handleOnClick = () => {
    onLineClick(lineNumber);
  };

  const select = (lineNumber === selectedLine) ? 'selected' : '';

  let nTests;
  let color;
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
      <td className="file-line-tests">
        { nTests && <span className="tests">{nTests}</span> }
      </td>
      <td className="file-line-text"><pre>{text}</pre></td>
    </tr>
  );
};

// This component contains metadata of the file
const FileViewerMeta = ({
  revision, path, appErr, parsedFile, sourceCoverage,
}) => {
  const showStatus = (label, data) => (
    <li className="file-meta-li">
      {label}: {(data) ? HEAVY_CHECKMARK : HORIZONTAL_ELLIPSIS}
    </li>
  );

  return (
    <div>
      <div className="file-meta-center">
        <div className="file-meta-title">File Coverage</div>
        { (sourceCoverage) && <CoveragePercentageViewer coverage={sourceCoverage} /> }
        <div className="file-meta-status">
          <ul className="file-meta-ul">
            { showStatus('Source code', parsedFile) }
            { showStatus('Coverage', sourceCoverage) }
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
