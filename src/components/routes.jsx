import { Route } from 'react-router-dom';
import * as queryString from 'query-string';

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
      render={({ location }) => {
        const parsedQuery = queryString.parse(location.search);
        const { revision } = parsedQuery;
        let { path } = parsedQuery;
        if (path) {
          // Remove beginning '/' in the path parameter to fetch from source,
          // makes both path=/path AND path=path acceptable in the URL query
          // Ex. "path=/accessible/atk/Platform.cpp" AND "path=accessible/atk/Platform.cpp"
          path = path.startsWith('/') ? path.slice(1) : path;
        }
        return (
          <FileViewerContainer
            revision={revision}
            path={path}
          />
        );
      }}
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
