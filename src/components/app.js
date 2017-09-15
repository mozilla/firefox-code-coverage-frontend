// @flow
import React, { Component } from 'react';
import { Route } from 'react-router-dom'

import { ChangesetForm } from '../components/CoverageSummary/ChangesetForm'
import { ChangesetsViewer } from '../components/CoverageSummary/ChangesetsViewer'
import { DiffViewerContainer } from '../components/diffviewer'
import '../style.css'

type Props = {};

type State = {
  repoName: string,
};

// Main component
export class App extends Component<Props, State> {
  state = {
    repoName: 'mozilla-central',
  }

  render() {
    return (
      <div className='app'>
        <Route exact path="/" render={({ history }) => (
          <div className='changesets-viewer'>
            <ChangesetForm
              onSubmit={(formValues) => {
                if (formValues.changeset) {
                  history.push('/changeset/' + formValues.changeset)
                } else {
                  console.log('XXX: The changeset was undefined.')
                }
              }}
            />
            <hr/>
            <ChangesetsViewer
              repoName={this.state.repoName}
            />
          </div>
        )}/>
        <Route path="/changeset/:id" render={({ match }) => (
          <DiffViewerContainer changeset={match.params.id}/>
        )}/>
      </div>
    );
}
}
