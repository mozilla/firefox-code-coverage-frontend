import React from 'react';
import { Route } from 'react-router-dom';

import AppDisclaimer from './disclaimer';
import DiffViewerContainer from '../containers/diffViewer';
import FileViewerContainer from '../containers/fileViewer';
import GitHubRibbon from './githubRibbon';
import SummaryContainer from '../containers/summary';
import settings from '../settings';
import { clearCache } from '../utils/localCache';
import '../style.css';

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
          <SummaryContainer
            repoName={settings.FIREFOX_REPO}
          />
        </div>
      )}
    />
    <Route
      path="/changeset/:id"
      render={({ match }) => (
        <DiffViewerContainer
          node={match.params.id}
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
        if (clearCache()) {
          return (<p>The local database has been cleared.</p>);
        }
        return (<p>Failed to clear the local DB.</p>);
      }}
    />
  </div>
);
