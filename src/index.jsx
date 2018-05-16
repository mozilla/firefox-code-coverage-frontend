import Raven from 'raven-js';
import { createStore } from 'redux';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import App from './components/app';
import reducer from './reducers';

const store = createStore(
  reducer,
  /* eslint no-underscore-dangle: 0 */
  window.__REDUX_DEVTOOLS_EXTENSION__ &&
  window.__REDUX_DEVTOOLS_EXTENSION__(),
);

Raven.config('https://60b05bc4ef794a6c9e30e86e6a316083@sentry.io/300397').install();

const root = document.getElementById('root');
const load = () => render(
  <Provider store={store}>
    <AppContainer>
      <HashRouter>
        <App />
      </HashRouter>
    </AppContainer>
  </Provider>,
  root,
);

// This is needed for Hot Module Replacement
if (module.hot) {
  module.hot.accept('./components/app', load);
}

load();
