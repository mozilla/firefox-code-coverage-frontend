import settings from '../settings';

const GenericErrorMessage = () => (
  <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
    <span>There has been a critical error. Please </span>
    <a href={`${settings.REPO}/issues/new`} target="_blank">file an issue</a>.
  </p>
);

export default GenericErrorMessage;
