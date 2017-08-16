import React, { Component } from 'react';
import { Route } from 'react-router-dom'
import { DiffViewer } from './DiffViewer'
import { ChangesetForm } from './ChangesetForm'

// Main component
export class App extends Component {
  state = {
    // https://hg.mozilla.org/mozilla-central/rev/12e33b9d6f91
    changeset: '12e33b9d6f91' // Until we have coverage for other changesets
  }

  render() {
    return (
      <div className='app'>
        <Route exact path="/" render={({ history }) => (
          <ChangesetForm
            initialValue={this.state.changeset}
            onSubmit={(form_values) => {
              this.setState({changeset: form_values.changeset})
              if (form_values.changeset) {
                history.push('/changeset/' + form_values.changeset)
              } else {
                console.log('XXX: The changeset was undefined.')
              }
            }}
          />
        )}/>
        <Route path="/changeset" render={() => (
          <DiffViewer changeset={this.state.changeset}/>
        )}/>
      </div>
    );
}
}
