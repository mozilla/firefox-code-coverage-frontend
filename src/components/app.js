// @flow
import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import ChangesetsViewer from './summaryviewer';
import DiffViewerContainer from './diffviewer';
import '../style.css';

type Props = {};

type State = {
  repoName: string,
};

// Main component
export default class App extends Component<Props, State> {
  state = {
    repoName: 'mozilla-central'
  }

  render() {
    const { repoName } = this.state;
    return (
      <div className="app">
        <Route
          exact path="/" render={() => (
            <div className="changesets-viewer">
              <ChangesetsViewer
                repoName={repoName} />
            </div>
        )} />
        <Route
          path="/changeset/:id" render={({ match }) => (
            <DiffViewerContainer
              changeset={match.params.id}
              repoName={repoName} />
        )} />
      </div>
    );
  }
}
