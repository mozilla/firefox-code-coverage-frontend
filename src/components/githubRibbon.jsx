import settings from '../settings';

const { REPO, GITHUB_RIBBON } = settings;

export default () => (
  <div className="github-ribbon">
    <a href={`${REPO}`}>
      <img src={`${GITHUB_RIBBON}`} alt="Fork me on GitHub" title="Fork me on GitHub" />
    </a>
  </div>
);
