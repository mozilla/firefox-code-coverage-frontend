import React, { Component } from 'react';

import * as FetchAPI from '../fetch_data';
import { TestsSideViewer, CoveragePercentageViewer } from './fileviewercov';

const queryString = require('query-string');

/* FileViewer loads a raw file for a given revision from Mozilla's hg web.
 * It uses test coverage information from Active Data to show coverage
 * for runnable lines.
 */
export default class FileViewerContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appError: undefined,
      coverage: undefined,
      parsedFile: [],
      selectedLine: undefined,
    };
    this.setSelectedLine = this.setSelectedLine.bind(this);
    /* get revision and path parameters from URL */
    const parsedQuery = queryString.parse(props.location.search);
    if (!parsedQuery.revision || !parsedQuery.path) {
      this.setState({ appError: "Undefined URL query ('revision', 'path' fields are required)" });
    }
    /* remove beginning '/' in the path parameter */
    if (parsedQuery.path.startsWith('/')) {
      parsedQuery.path = parsedQuery.path.slice(1);
    }
    this.revision = parsedQuery.revision;
    this.path = parsedQuery.path;
  }

  componentDidMount() {
    /* Fetch source code from hg */
    FetchAPI.getRawFile(this.revision, this.path)
      .then(text => this.setState({ parsedFile: text.split('\n') }))
    ;

    /* Fetch coverages from ActiveData */
    FetchAPI.query({
      from: 'coverage',
      where: {
        and: [
          { eq: { 'source.file.name': `${this.path}` } },
          { eq: { 'repo.changeset.id12': `${this.revision}` } },
        ],
      },
      limit: 1000,
      format: 'list',
    })
      .then((data) => {
        this.setState({ coverage: data });
      });
  }

  /* handle fileviewer's line onclick event */
  setSelectedLine(selectedLineNumber) {
    this.setState({ selectedLine: selectedLineNumber });
  }

  render() {
    const { appError, coverage, parsedFile, selectedLine } = this.state;

    return (
      <div>
        <FileViewerMeta
          revision={this.revision}
          path={this.path}
          appError={appError}
        />
        <CoveragePercentageViewer
          coverage={coverage}
        />
        <FileViewer
          parsedFile={parsedFile}
          onLineClick={this.setSelectedLine}
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
const FileViewer = ({ parsedFile, onLineClick }) => (
  <div>
    <table>
      <tbody>
        {
          parsedFile.map((line, lineNumber) => (
            <Line
              key={lineNumber}
              lineNumber={lineNumber + 1}
              lineText={line}
              onLineClick={onLineClick}
            />
          ))
        }
      </tbody>
    </table>
  </div>
);

const Line = (props) => {
  let lineClass = '';

  const handleOnClick = () => {
    lineClass = 'selected';
    props.onLineClick(props.lineNumber);
  };

  return (
    <tr>
      <td className="file_line_number">{props.lineNumber}</td>
      <td className={`file_line_text ${lineClass}`} onClick={handleOnClick}><pre>{props.lineText}</pre></td>
    </tr>
  );
};

/* This component contains metadata of the file */
const FileViewerMeta = ({ revision, path, appError }) => (
  <div>
    {appError && <span className="error_message">{appError}</span>}
    <h4>Revision number: {revision} <br /> Path: {path}</h4>
  </div>
);
