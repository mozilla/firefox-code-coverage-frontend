import React, { Component } from 'react';

import * as FetchAPI from '../fetch_data';

export default class FileViewerContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appError: undefined,
      rawFile: undefined,
    };

    const { revision, path } = this.props;
    FetchAPI.getRawFile(revision, path)
      .then(response => {
        if (response.status !== 200) {
          console.log('Error status code' + response.status);
          return;
        }
        response.text().then(file => {
          this.setState({ rawFile: file.split('\n') })
        });
      })
      .catch((error) => {
        console.error(error);
        this.setState({
          appError: 'We did not manage to parse the raw-file correctly.',
        });
      });
  }


  render() {
    // console.log(this.props);
    const { revision, path } = this.props;
    return (
      <div>
        <FileViewerMeta revision={revision} path={path}/>
        <FileViewer rawFile={this.state.rawFile} />
      </div>
    );
  }
}



/* This viewer renders each line of the file with its line number */
const FileViewer = ({ rawFile }) => {
  if (!rawFile) {
    return( <div>"Waiting for file from the backend"</div> );
  }

  var id = 0;
  const rawFileLines = rawFile.map((line) => {
    id = id + 1;
    return(
      <tr key={id}>
        <th>{id}</th>
        <th>{line}</th>
      </tr>
    );
  });

  return (
    <div>
      <table className="table table-sm table-bordered table-hover">
        <tbody>
          {rawFileLines}
        </tbody>
      </table>
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
