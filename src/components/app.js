import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import ChangesetsViewerContainer from './summaryviewer';
import DiffViewerContainer from './diffviewer';
import FileViewerContainer from './fileviewer';
import '../style.css';

const REPO = 'https://github.com/mozilla/firefox-code-coverage-frontend';

const AppDisclaimer = () => (
  <div className="app-disclaimer">
    <div>
      <p>NOTE: This app is in beta state.</p>
      <p>There are some core issues with regards to coverage collection. These are
        explained in the project&apos;s&nbsp;
        <a href={`${REPO}/blob/master/README.md#disclaimers`}>readme</a>.</p>
    </div>
    <div>
      Project information: <a href={REPO}>Frontend repository</a>&nbsp;
      <a href={`${REPO}/issues?q=is%3Aissue+is%3Aopen+label%3Abug`}>Known issues</a>
    </div>

  </div>
);

// Main component
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repoName: 'mozilla-central',
    };
  }

  render() {
    const { repoName } = this.state;
    return (
      <div className="app">
        <Route
          exact
          path="/"
          render={() => (
            <div className="changesets-viewer">
              <AppDisclaimer />
              <ChangesetsViewerContainer
                repoName={repoName}
              />
            </div>
          )}
        />
        <Route
          path="/changeset/:id"
          render={({ match }) => (
            <DiffViewerContainer
              changeset={match.params.id}
              repoName={repoName}
            />
          )}
        />
        <Route
          path="/file"
          component={FileViewerContainer}
        />
      </div>
    );
  }
}
