import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { HashRouter } from 'react-router-dom';
import App from './components/app';

const root = document.getElementById('root');
const load = () => render((
  <AppContainer>
    <HashRouter>
      <App />
    </HashRouter>
  </AppContainer>
), root);

// This is needed for Hot Module Replacement
if (module.hot) {
  module.hot.accept('./components/app', load);
}

load();
