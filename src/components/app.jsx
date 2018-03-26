import React from 'react';
import { Route } from 'react-router-dom';

import ChangesetsViewerContainer from '../containers/summaryViewer';
import DiffViewerContainer from '../containers/diffViewer';
import FileViewerContainer from '../containers/fileViewer';
import settings from '../settings';
import clearLocalCache from '../utils/localCache';
import '../style.css';
import AppDisclaimer from './disclaimer';
import GitHubRibbon from './githubRibbon';

// Main component
export default () => (
  <div className="app">
    <Route
      exact
      path="/"
      render={() => (
        <div className="changesets-viewer">
          <GitHubRibbon />
          <AppDisclaimer />
          <ChangesetsViewerContainer
            repoName={settings.FIREFOX_REPO}
          />
        </div>
      )}
    />
    <Route
      path="/changeset/:id"
      render={({ match }) => (
        <DiffViewerContainer
          changeset={match.params.id}
          repoName={settings.FIREFOX_REPO}
        />
      )}
    />
    <Route
      path="/file"
      component={FileViewerContainer}
    />
    <Route
      path="/clear-cache"
      render={() => {
        if (clearLocalCache()) {
          return (<p>The local database has been cleared.</p>);
        }
        return (<p>Failed to clear the local DB.</p>);
      }}
    />
  </div>
);
