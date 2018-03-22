export const hgHost = 'https://hg.mozilla.org';
export const ccovBackend = 'https://uplift.shipit.staging.mozilla-releng.net';
export const activeData = 'https://activedata.allizom.org';

const plainHeaders = {
  Accept: 'text/plain',
};
const jsonHeaders = {
  Accept: 'application/json',
};
const THREE_DAYS_AGO = new Date((new Date()).getTime() - (3 * 24 * 60 * 60 * 1000))
  .toISOString().substring(0, 10);

const jsonPost = (url, body) =>
  fetch(url, { headers: jsonHeaders, method: 'POST', body: JSON.stringify(body) });

export const getDiff = (changeset, repoPath = 'mozilla-central') =>
  fetch(`${hgHost}/${repoPath}/raw-rev/${changeset}`, { plainHeaders });

export const getRawFile = (revision, path, repoPath) =>
  fetch(`${hgHost}/${repoPath}/raw-file/${revision}/${path}`, { plainHeaders });

export const getJsonPushes = (repoPath, date = THREE_DAYS_AGO) =>
  fetch(`${hgHost}/${repoPath}/json-pushes?version=2&full=1&startDate=${date}`, { jsonHeaders });

export const getChangesetCoverage = changeset =>
  fetch(`${ccovBackend}/coverage/changeset/${changeset}`, { jsonHeaders });

export const getChangesetCoverageSummary = changeset =>
  fetch(`${ccovBackend}/coverage/changeset_summary/${changeset}`, { jsonHeaders });

export const queryActiveData = body =>
  jsonPost(`${activeData}/query`, body);
