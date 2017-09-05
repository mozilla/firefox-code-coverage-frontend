import React, { Component } from 'react';
import { Route } from 'react-router-dom'

import { ChangesetForm } from '../components/CoverageSummary/ChangesetForm'
import { ChangesetsViewer } from '../components/CoverageSummary/ChangesetsViewer'
import { DiffViewer } from '../components/DiffViewer'
import './style.css';

// Main component
export class App extends Component {
  state = {
    repo_name: 'mozilla-central',
  }

  render() {
    return (
      <div className='app'>
        <Route exact path="/" render={({ history }) => (
          <div className='changesets-viewer'>
            <ChangesetForm
              onSubmit={(form_values) => {
                if (form_values.changeset) {
                  history.push('/changeset/' + form_values.changeset)
                } else {
                  console.log('XXX: The changeset was undefined.')
                }
              }}
            />
            <hr/>
            <ChangesetsViewer
              repo_name={this.state.repo_name}
            />
          </div>
        )}/>
        <Route path="/changeset/:id" render={({ match }) => (
          <DiffViewer changeset={match.params.id}/>
        )}/>
      </div>
    );
}
}
