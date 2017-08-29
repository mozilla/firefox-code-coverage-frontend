import React, { Component } from 'react';

import { code_cov_info, code_cov_commits } from './offline_data'

/*
Given a changeset (e.g. 12e33b9d6f91) we can inquire the GH commit id
 https://api.pub.build.mozilla.org/mapper/gecko-dev/rev/hg/12e33b9d6f91
 |--> e1013bf46df49b3c5b8839f37d92a8209d4625ea
      12e33b9d6f91d008603abc7140a8957c8b9b0ad6
 https://hg.mozilla.org/mozilla-central/rev/12e33b9d6f91
 https://github.com/mozilla/gecko-dev/commit/e1013bf46df49b3c5b8839f37d92a8209d4625ea

We first fetch recent uploaded commits to codecov.
We then find the associated Mercurial changeset
We then have to explore all changesets included as part of that commit

The key is to use the commit uploaded to codecov and query that API.

For instance, for this Mercurial changeset (XXX) we need to determine that
it was included in this Codecov/GitHub commit (XXX). Once we have this
information we can fetch the code coverage information from this API:
https://codecov.io/api/gh/marco-c/gecko-dev/tree/<CHANGESET>/<PATH_TO_FILE>?src=extension
*/
function CommitInfo(props) {
  var info = props.commit_info
  // XXX: Some commits have this problem
  var author = 'unknown'
  var message = ''
  if (info.author) {
    author = (info.author) ? (
      info.author.username) : (
      info.author.name
    )
    message = info.message.substring(0, 30)
  }
  // XXX: For desc display only the first line
  // XXX: linkify bug numbers
  return (
    <tr className='push'>
      <td className='tip-commit-author'>{author}</td>
      <td className='tip-commit-codecov'>{info.commitid.substring(0, 7)}</td>
      <td className='tip-commit-timestamp'>{info.timestamp.substring(0, 16)}</td>
      <td className='tip-commit-description'>{message}</td>
    </tr>
  )
}

// Based on https://stackoverflow.com/a/17027621
function sortCommits(commits, sortAttribute) {
  for(var k=1; k < commits.length; k++){
     for(var i=k; i > 0 &&
       new Date(commits[i][sortAttribute]) <
       new Date(commits[i-1][sortAttribute]); i--) {

        var tmpCommit = commits[i];
        commits[i] = commits[i-1];
        commits[i-1] = tmpCommit;
     }
  }
}

export class ChangesetsViewer extends Component {
  state = {
    'commits': []
  }

  componentDidMount() {
    sortCommits(code_cov_commits.commits, 'timestamp')
    code_cov_commits.commits.reverse()

    this.setState(code_cov_commits)
  }

  render() {
    if (this.state.commits.length != 0) {
      return (
        <table className='changeset-viewer'>
          <tbody>
            <tr>
              <th className='changeset-viewer-header'>Author</th>
              <th className='changeset-viewer-header'>Changeset</th>
              <th className='changeset-viewer-header'>Timestamp</th>
              <th className='changeset-viewer-header'>Description</th>
            </tr>
            {this.state.commits.map(commit => (
              <CommitInfo
                key={commit.commitid}
                commit_info={commit}
                collapsed={this.state.collapsed}
              />
            ))}
          </tbody>
        </table>
      )
    } else {
      return (<div></div>)
    }
  }
}
