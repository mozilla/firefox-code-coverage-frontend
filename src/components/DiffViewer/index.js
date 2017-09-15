import React, { Component } from 'react';
import { Link } from 'react-router-dom'

import * as FetchAPI from '../../fetch_data'
import { DiffFile } from './DiffFile'

var parse = require('parse-diff');


const DiffViewer = props => {
  const { coverage_summary, coverage, error_message, parsed_changeset } = props
  return (
    <div className="page_body codecoverage-diffviewer">
      <Link className="return-home" to="/">Return main page</Link>
      <div className='error_message'>{error_message}</div>
      {(coverage.length != 0) && parsed_changeset.map(
        (diff_block, index) => {
          // We try to see if the file modified shows up in the code
          // coverage data we have for this diff
          const code_cov_info = (coverage) ?
            coverage.find(info => info['name'] === diff_block.from) : undefined
          // We only push down the subset of code coverage data
          // applicable to a file
          return (
            <DiffFile
              key={index}
              id={index}
              diff_block={diff_block}
              code_cov_info={code_cov_info}
              coverage_summary={coverage_summary}
            />
          );
        }
      )}
    </div>
  )
}

/* DiffViewer loads a raw diff from Mozilla's hg-web and code coverage from
 * shiptit-uplift to show a diff with code coverage information for added
 * lines.
 */
export class DiffViewerContainer extends Component {
  state = {
    coverage_summary: {},
    coverage: [],
    error_message: '',
    parsed_changeset: []
  }

  componentDidMount() {
    const { changeset } = this.props
    const { coverage_summary, coverage, error_message, parsed_changeset } = this.state

    FetchAPI.getDiff(changeset).then(response =>
      response.text()
    ).then(text =>
      this.setState({parsed_changeset: parse(text)})
    ).catch(error =>
      console.log(error)
    )

    FetchAPI.getChangesetCoverage(changeset).then(response =>
      response.text()
    ).then(text => {
      const { error, diffs } = JSON.parse(text)
      if (error) {
        this.setState({error_message: error})
      } else {
        this.setState({coverage: diffs})
      }
    }).catch(error =>
      console.log(error)
    )

    FetchAPI.getChangesetCoverageSummary(changeset).then(response =>
      response.text()
    ).then(text =>
      this.setState({coverage_summary: JSON.parse(text)})
    ).catch(error =>
      console.log(error)
    )
  }

  render() {
    const { coverage_summary, coverage, error_message, parsed_changeset } = this.state
    return (
      <DiffViewer
        coverage_summary={coverage_summary}
        coverage={coverage}
        error_message={error_message}
        parsed_changeset={parsed_changeset}
      />
    )
  }
}
