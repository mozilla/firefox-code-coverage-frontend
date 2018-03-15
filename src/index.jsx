import Raven from 'raven-js';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { HashRouter, BrowserRouter } from 'react-router-dom';
import App from './components/app';
import { HASH_HISTORY } from './settings';

Raven.config('https://60b05bc4ef794a6c9e30e86e6a316083@sentry.io/300397').install();

const root = document.getElementById('root');
const load = () => render((
  <AppContainer>
    {process.env.ROUTING === HASH_HISTORY ? (
      <HashRouter>
        <App />
      </HashRouter>
    ) : (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    }
  </AppContainer>
), root);

// This is needed for Hot Module Replacement
if (module.hot) {
  module.hot.accept('./components/app', load);
}

load();
