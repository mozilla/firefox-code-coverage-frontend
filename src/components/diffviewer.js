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
    coverage: undefined,
    parsedDiff: []
  }

  componentDidMount() {
    const { changeset } = this.props
    const { coverage, parsedDiff } = this.state

    FetchAPI.getDiff(changeset).then(response =>
      response.text()
    ).then(text =>
      this.setState({parsedDiff: parse(text)})
    ).catch(error =>
      console.log(error)
    )

    FetchAPI.getChangesetCoverage(changeset).then(response =>
      response.text()
    ).then(text => {
      this.setState({coverage: JSON.parse(text)})
    }).catch(error =>
      console.log(error)
    )
  }

  render() {
    const { changeset, repoName } = this.props
    const { coverage, parsedDiff } = this.state
    return (
      <DiffViewer
        repoName={repoName}
        changeset={changeset}
        coverage={coverage}
        parsedDiff={parsedDiff}
      />
    )
  }
}

const DiffViewer = ({ repoName, changeset, coverage, parsedDiff }) => {
  return (
    <div className="page_body codecoverage-diffviewer">
      <Link className="return-home" to="/">Return to main page</Link>
      <DiffMeta changeset={changeset} />
      <CoverageMeta changeset={changeset} coverage={coverage} />
      <br />
      {parsedDiff.map(
        (diffBlock, index) => {
          // We only push down the subset of code coverage data
          // applicable to a file
          return (
            <DiffFile
              key={index}
              id={index}
              diffBlock={diffBlock}
              coverage={coverage}
            />
          );
        }
      )}
    </div>
  )
}

const DiffMeta = ({ changeset }) => {
  const hgRev = `${FetchAPI.hgHost}/mozilla-central/rev/${changeset}`

  return (
    <table>
      <tbody>
        <tr><td>Link to <a className="hg-rev" href={hgRev}>Hg diff ({changeset})</a></td></tr>
      </tbody>
    </table>
  )
}

const CoverageMeta = ({ changeset, coverage }) => {
  const hgRev = `${FetchAPI.hgHost}/mozilla-central/rev/${changeset}`
  const ccovUrl = `${FetchAPI.ccovBackend}/coverage/changeset/${changeset}`

  let errorMessage
  if (coverage) {
    if (coverage.error) {
      errorMessage = coverage.error
    } else if (!coverage.diffs) {
      errorMessage = "This change does not have NEW LINES."
    }
  } else {
    errorMessage = "We're waiting for coverage data from the backend."
  }

  return (
    <table>
      <tbody>
        <tr><td>Link to <a className="coverage-changeset-api" href={ccovUrl}>Code coverage backend</a></td></tr>
        <tr><td><CoverageSummary coverage={coverage} /></td></tr>
        <tr><td><span className='error_message'>{errorMessage}</span></td></tr>
      </tbody>
    </table>
  )
}

const CoverageSummary = ({ coverage }) => {
  return (
    <span className='filecoveragesummary'>{(coverage) ?
      `Current coverage: ${coverage.overall_cur}` :
      'No coverage data available.'}
    </span>
  )
}

/* A DiffLine contains all diff changes for a specific file */
const DiffFile = ({ coverage, diffBlock }) => {
  // We try to see if the file modified shows up in the code
  // coverage data we have for this diff
  let coverageInfo
  if (coverage) {
    coverageInfo = (coverage.diffs) ?
      coverage.diffs.find(info => info['name'] === diffBlock.from) : undefined
  }

  return (
    <div className='difffile'>
      <div className='filesummary'>
        <div className='filepath'>{diffBlock.from}</div>
      </div>
      {diffBlock.chunks.map((block, index) =>
        <DiffBlock
          key={index}
          block={block}
          coverageInfo={coverageInfo}
        />
      )}
    </div>
  );
}

/* A DiffBlock is *one* of the blocks changed for a specific file */
const DiffBlock = ({ block, coverageInfo }) => {
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
                 coverageInfo={coverageInfo}
               />
             )
           })}
       </tbody>
     </table>
    </div>
  );
}

/* A DiffLine contains metadata about a line in a DiffBlock */
const DiffLine = ({ change, coverageInfo, id }) => {
  // Information about the line itself
  const c = change
  const cov = coverageInfo
  // Added, deleted or unchanged line
  const changeType = change.type
  // CSS tr and td classes
  let [rowClass, covStatusClass] = ['nolinechange', 'nocovchange']
  const rowId = id
  // Cell contents
  const cov_status = ' ' // We need blank string to respect width value of cell
  let [oldLineNumber, newLineNumber] = ['', '']

  if (changeType === 'add') {
    // Added line - <cov_status> | <blank> | <new line number>
    rowClass = changeType
    covStatusClass = 'miss' // Let's start assuming a miss
    if (cov) {
      let { coverage } = cov.changes.find(line_cov_info =>
        (line_cov_info.new_line === c.ln))
      covStatusClass = (coverage === 'Y') ? 'hit' :
                         (coverage === 'N') ? 'miss': 'undefined'
    }
    newLineNumber = c.ln
  } else if (changeType === 'del') {
    // Removed line - <blank> | <old line number> | <blank>
    rowClass = changeType
    oldLineNumber = c.ln
  } else {
    // Unchanged line - <blank> | <old line number> | <blank>
    rowClass = changeType
    oldLineNumber = c.ln1
    if (oldLineNumber !== c.ln2) {
      newLineNumber = c.ln2
    }
  }
  return (
    <tr id={rowId} className={rowClass}>
      <td className={covStatusClass}></td>
      <td className='old_line_number'>{oldLineNumber}</td>
      <td className='new_line_number'>{newLineNumber}</td>
      <td className='line_content'>
        <pre>{c.content}</pre>
      </td>
    </tr>
  );
}
