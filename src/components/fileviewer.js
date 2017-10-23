import React, { Component } from 'react';

import * as FetchAPI from '../fetch_data';

/* FileViewer loads a raw file for a given revision from Mozilla's hg web.
 * It uses test coverage information from Active Data to show coverage
 * for runnable lines.
 */
export default class FileViewerContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appError: undefined,
      parsedFile: [],
      coverage: undefined
    };
  };

  componentDidMount() {
    const { revision, path } = this.props;
    FetchAPI.getRawFile(revision, path)
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
  };

  render() {
    const { revision, path } = this.props;
    return (
      <div>
        <FileViewerMeta 
          revision={revision} 
          path={path} 
          appError={this.state.appError}
        />
        {this.state.coverage}
        <FileViewer parsedFile={this.state.parsedFile} />
      </div>
    );
  };
}

/* This component renders each line of the file with its line number */
const FileViewer = ({ parsedFile }) => {
  return ( 
    <div>
      <table>
        { 
          parsedFile.map((line, lineNumber) => (
            <Line 
              key={lineNumber}
              lineNumber={lineNumber+1}
              lineText={line}
            />
          ))
        }
      </table>
    </div>
  );
};

const Line = ({ key, lineNumber, lineText }) => {
  return (
    <div>
      <tr>
        <td className="file_line_number">{lineNumber}</td>
        <td><pre>{lineText}</pre></td>
      </tr>
    </div>
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
