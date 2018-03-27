export const ccovBackend = 'https://uplift.shipit.staging.mozilla-releng.net';
export const activeData = 'https://activedata.allizom.org';

export const JSON_HEADERS = {
  Accept: 'application/json',
};
export const PLAIN_HEADERS = {
  Accept: 'text/plain',
};

const jsonPost = (url, body) =>
  fetch(url, { headers: JSON_HEADERS, method: 'POST', body: JSON.stringify(body) });

export const getChangesetCoverage = changeset =>
  fetch(`${ccovBackend}/coverage/changeset/${changeset}`, { JSON_HEADERS });

export const getChangesetCoverageSummary = changeset =>
  fetch(`${ccovBackend}/coverage/changeset_summary/${changeset}`, { JSON_HEADERS });

export const queryActiveData = body =>
  jsonPost(`${activeData}/query`, body);
