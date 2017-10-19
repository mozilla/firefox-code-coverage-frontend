import React, { Component } from 'react';

export default class FileViewerContainer extends Component {
  // console.log(this.props);
  render() {
    console.log(this.props);
    return (
      <div>
        <div>File view</div>
        <div>revision number: {this.props.revision}</div>
        <div>path to file: {this.props.path}</div>
      </div>
    );
  }
}
