import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import ChangesetsViewerContainer from './summaryviewer';
import DiffViewerContainer from './diffviewer';
import FileViewerContainer from './fileviewer';
import '../style.css';

const AppDisclaimer = () => (
  <div>
    NOTE: This app is in an alpha state. There are some core issues we still
    need to fix and until then we will list them in here.
    <ul>
      <li>The backend needs some refactoring for the endpoints not to timeout
        often (<a href="https://github.com/mozilla-releng/services/issues/632">Issue 632</a>)
      </li>
      <li>Some changesets are not shown (Backouts, ffxbld & merges)</li>
      <li>Links to some changesets are not guaranteed to have code coverage</li>
    </ul>
    <span>UI based on&nbsp;
      <a href="https://github.com/armenzg/firefox-code-coverage-frontend">
        Firefox code coverage frontend
      </a></span>
    <hr />
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
