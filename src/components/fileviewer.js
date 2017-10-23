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
    };

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
  }

  render() {
    // console.log(this.props);
    const { revision, path } = this.props;
    return (
      <div>
        <FileViewerMeta revision={revision} path={path}/>
        <FileViewer parsedFile={this.state.parsedFile} />
      </div>
    );
  }
}

/* This viewer renders each line of the file with its line number */
const FileViewer = (props) => {
  return ( 
    <div>
      <table>
        { 
          props.parsedFile.map((line, lineNumber) => (
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

const Line = (props) => {
  return (
    <div>
      <tr>
        <td width="40">{props.lineNumber}</td>
        <td><pre>{props.lineText}</pre></td>
      </tr>
    </div>
  );
};

/* This view contains meta data of the file */
const FileViewerMeta = ({ revision, path }) => {
  return (
    <h4>
      Revision number: {revision} <br/> Path: {path}
    </h4>
  );
};
