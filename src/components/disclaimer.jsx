import settings from '../settings';

const { REPO } = settings;

export default () => (
  <div className="app-disclaimer">
    <div>
      <p>NOTE: This app is in beta state.</p>
      <p>There are some core issues with regards to coverage collection. These are
        explained in the project&apos;s&nbsp;
      <a href={`${REPO}/blob/master/README.md#disclaimers`}>readme</a>.
      </p>
    </div>
    <div>
      Project information: <a href={REPO}>Frontend repository</a>&nbsp;
      <a href={`${REPO}/issues?q=is%3Aissue+is%3Aopen+label%3Abug`}>Known issues</a>
    </div>

  </div>
);
