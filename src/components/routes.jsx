import { Route } from 'react-router-dom';

import AppDisclaimer from './disclaimer';
import DiffViewerContainer from '../containers/diffViewer';
import FileViewerContainer from '../containers/fileViewer';
import GitHubRibbon from './githubRibbon';
import SummaryContainer from '../containers/summary';
import { clearCache } from '../utils/localCache';

const Routes = () => (
  <div>
    <Route
      exact
      path="/"
      render={() => (
        <div className="changesets-viewer">
          <GitHubRibbon />
          <AppDisclaimer />
          <SummaryContainer />
        </div>
      )}
    />
    <Route
      path="/changeset/:id"
      render={({ match }) => (
        <DiffViewerContainer node={match.params.id} />
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

export default Routes;
