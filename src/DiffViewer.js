import React, { Component } from 'react';
import { Link } from 'react-router-dom'

import * as FetchAPI from './fetch_data'
import { DiffFile } from './DiffFile'
import { code_cov_info } from './offline_data'

var parse = require('parse-diff');

/* DiffViewer loads a raw diff from Mozilla's hg-web and code coverage from
 * shiptit-uplift to show a diff with code coverage information for added
 * lines.
 */
export class DiffViewer extends Component {
  state = {
    parsed_changeset: [],
    code_cov_info: []
  }

  componentDidMount() {
    FetchAPI.getDiff(this.props.changeset).then(response =>
      response.text()
    ).then(text =>
      this.setState({parsed_changeset: parse(text)})
    ).catch(error =>
      console.log(error)
    )
    this.setState({code_cov_info: code_cov_info})
  }

  render() {
    return (
      <div className="page_body codecoverage-diffviewer">
        <Link className="return-home" to="/">Return main page</Link>
        {this.state.parsed_changeset.map(
          (diff_block, index) => {
            // We try to see if the file modified shows up in the code
            // coverage data we have for this diff
            var code_cov_info = this.state.code_cov_info.map(info => {
              if (info['name'] === diff_block.from) {
                return info
              }
            });
            // We only push down the subset of code coverage data
            // applicable to a file
            return (
              <DiffFile
                key={index}
                id={index}
                diff_block={diff_block}
                code_cov_info={code_cov_info[0]}
              />
            );
          }
        )}
      </div>
    );
  } // end of render
}
