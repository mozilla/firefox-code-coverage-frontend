import React, { Component } from 'react';
import { Link } from 'react-router-dom'

import * as FetchAPI from '../fetch_data'

let parse = require('parse-diff');

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

const DiffViewer = ({ coverage_summary, coverage, error_message, parsed_changeset }) => {
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

/* A DiffLine contains all diff changes for a specific file */
const DiffFile = ({ code_cov_info, coverage_summary, diff_block }) => {
  return (
    <div className='difffile'>
      <div className='filesummary'>
        <div className='filepath'>{diff_block.from}</div>
        <DiffSummary summary={coverage_summary} />
      </div>
      {diff_block.chunks.map((block, index) =>
        <DiffBlock
          key={index}
          block={block}
          code_cov_info={code_cov_info}
        />
      )}
    </div>
  );
}

const DiffSummary = ({summary}) => {
  return (
    <div className='filecoveragesummary'>{(summary) ?
      summary.overall_cur : 'no summary available'}
    </div>
  )
}

/* A DiffBlock is *one* of the blocks changed for a specific file */
export function DiffBlock({ block, code_cov_info }) {
  return (
    <div className='diffblock'>
      <div className='difflineat'>{block.content}</div>
      <table className='diffblock'>
        <tbody>
          {block.changes.map((change, index) => {
             return (
               <DiffLine
                 key={index}
                 id={index}
                 change={change}
                 code_cov_info={code_cov_info}
               />
             )
           })}
       </tbody>
     </table>
    </div>
  );
}

/* A DiffLine contains metadata about a line in a DiffBlock */
const DiffLine = ({ change, code_cov_info, id }) => {
  // Information about the line itself
  const c = change
  const cov = code_cov_info
  // Added, deleted or unchanged line
  const change_type = change.type
  // CSS tr and td classes
  const [row_class, cov_status_class] = ['nolinechange', 'nocovchange']
  const row_id = id
  // Cell contents
  const cov_status = ' ' // We need blank string to respect width value of cell
  const [old_line_number, new_line_number] = ['', '']

  if (change_type === 'add') {
    // Added line - <cov_status> | <blank> | <new line number>
    row_class = change_type
    cov_status_class = 'miss' // Let's start assuming a miss
    if (cov) {
      let { coverage } = cov.changes.find(line_cov_info =>
        (line_cov_info.new_line === c.ln))
      cov_status_class = (coverage === 'Y') ? 'hit' :
                         (coverage === 'N') ? 'miss': 'undefined'
    }
    new_line_number = c.ln
  } else if (change_type === 'del') {
    // Removed line - <blank> | <old line number> | <blank>
    row_class = change_type
    old_line_number = c.ln
  } else {
    // Unchanged line - <blank> | <old line number> | <blank>
    row_class = change_type
    old_line_number = c.ln1
    if (old_line_number !== c.ln2) {
      new_line_number = c.ln2
    }
  }
  return (
    <tr id={row_id} className={row_class}>
      <td className={cov_status_class}>{cov_status}</td>
      <td className='old_line_number'>{old_line_number}</td>
      <td className='new_line_number'>{new_line_number}</td>
      <td className='line_content'>
        <pre>{c.content}</pre>
      </td>
    </tr>
  );
}
