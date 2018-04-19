import settings from '../settings';

const { REPO } = settings;

export default () => (
  <a className="github-fork-ribbon" href={`${REPO}`} data-ribbon="Fork me on GitHub" title="Fork me on GitHub">Fork me on GitHub</a>
);
