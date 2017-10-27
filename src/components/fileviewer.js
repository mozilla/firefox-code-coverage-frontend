import React, { Component } from 'react';

import * as FetchAPI from '../fetch_data';

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
    };
  };

  componentDidMount() {
    /* get revision and path parameters from URL */
    const parsedQuery = queryString.parse(this.props.location.search);
    this.revision = parsedQuery.revision
    this.path = parsedQuery.path
    if (!this.revision || !this.path) {
      this.setState({ appError: "Undefined URL query ('revision', 'path' fields are required)" });
    }

    FetchAPI.getRawFile(this.revision, this.path)
      .then(response => {
        if (response.status !== 200) {
          console.log('Error status code' + response.status);
          return;
        }
        response.text()
      .then((text) => this.setState(() => ({ parsedFile: text.split("\n") })))
      .catch((error) => {
        console.error(error);
        this.setState(() => ({ appError: 'We did not manage to parse the file correctly.' }));
      });
    });

    FetchAPI.getFileRevisionCoverage(this.revision, this.path,
      (data) => {
        console.log(data);
        this.setState(() => ({ coverage: data }));
        // TODO remove these log lines
        console.log(this.state.coverage.data[0][0].source.file.covered);
        console.log(this.state.coverage.data[0][0].source.file.uncovered);
        console.log(this.state.coverage.data[0][0].source.file.percentage_covered);
      }
    )
  };

  render() {
    return (
      <div>
        <FileViewerMeta
          revision={this.revision}
          path={this.path}
          appError={this.state.appError}
        />
        <FileViewer
          parsedFile={this.state.parsedFile}
          coverage={this.state.coverage}
        />
      </div>
    );
  };
}

/* This component renders each line of the file with its line number */
const FileViewer = ({ parsedFile, coverage }) => {
  return (
    <div>
      <table>
        <tbody>
          {
            parsedFile.map((line, lineNumber) => (
              <Line
                key={lineNumber}
                lineNumber={lineNumber+1}
                lineText={line}
              />
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

const Line = (props) => {
  return (
      <tr>
        <td className="file_line_number">{props.lineNumber}</td>
        <td><pre>{props.lineText}</pre></td>
      </tr>
  );
};

/* This component contains metadata of the file */
const FileViewerMeta = ({ revision, path, appError }) => {
  return (
    <div>
      {appError && <span className="error_message">{appError}</span>}
      <h4>Revision number: {revision} <br/> Path: {path}</h4>
    </div>
  );
};
