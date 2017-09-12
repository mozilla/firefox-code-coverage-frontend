import React, { Component } from 'react';
import { Link } from 'react-router-dom'

import * as FetchAPI from '../../fetch_data'
import { DiffFile } from './DiffFile'

var parse = require('parse-diff');

/* DiffViewer loads a raw diff from Mozilla's hg-web and code coverage from
 * shiptit-uplift to show a diff with code coverage information for added
 * lines.
 */
export class DiffViewer extends Component {
  state = {
    diffs: [],
    error_message: '',
    parsed_changeset: []
  }

  componentDidMount() {
    FetchAPI.getDiff(this.props.changeset).then(response =>
      response.text()
    ).then(text =>
      this.setState({parsed_changeset: parse(text)})
    ).catch(error =>
      console.log(error)
    )

    FetchAPI.getChangesetCoverage(this.props.changeset).then(response =>
      response.text()
    ).then(text => {
      const { error, diffs } = JSON.parse(text)
      if (error) {
        this.setState({error_message: error})
      } else {
        this.setState({diffs: diffs})
      }
    }).catch(error =>
      console.log(error)
    )
  }

  render() {
    return (
      <div className="page_body codecoverage-diffviewer">
        <Link className="return-home" to="/">Return main page</Link>
        <div className='error_message'>{this.state.error_message}</div>
        {(this.state.diffs.length != 0) && this.state.parsed_changeset.map(
          (diff_block, index) => {
            // We try to see if the file modified shows up in the code
            // coverage data we have for this diff
            const diffs = this.state.diffs
            const code_cov_info = (diffs) ?
              diffs.find(info => info['name'] === diff_block.from) : undefined
            // We only push down the subset of code coverage data
            // applicable to a file
            return (
              <DiffFile
                key={index}
                id={index}
                diff_block={diff_block}
                code_cov_info={code_cov_info}
              />
            );
          }
        )}
      </div>
    );
  } // end of render
}
