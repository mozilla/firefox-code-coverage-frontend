import React, { Component } from 'react';
import { Route } from 'react-router-dom'

import { ChangesetForm } from './ChangesetForm'
import { ChangesetsViewer } from './ChangesetsViewer'
import { DiffViewer } from './DiffViewer'

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
                this.setState({changeset: form_values.changeset})
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
        <Route path="/changeset" render={() => (
          <DiffViewer changeset={this.state.changeset}/>
        )}/>
      </div>
    );
}
}
