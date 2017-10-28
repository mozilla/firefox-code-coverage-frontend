import * as Query from './query';

export const hgHost = 'https://hg.mozilla.org';
export const ccovBackend = 'https://uplift.shipit.staging.mozilla-releng.net';
export const activeData = 'https://activedata.allizom.org';

const plainHeaders = {
  Accept: 'text/plain',
};
const jsonHeaders = {
  Accept: 'application/json',
};

export const getDiff = changeset =>
  fetch(`${hgHost}/mozilla-central/raw-rev/${changeset}`, { plainHeaders });

export const getJsonPushes = repoName =>
  fetch(`${hgHost}/${repoName}/json-pushes?version=2&full=1`, { jsonHeaders });

export const getChangesetCoverage = changeset =>
  fetch(`${ccovBackend}/coverage/changeset/${changeset}`, { jsonHeaders });

export const getChangesetCoverageSummary = changeset =>
  fetch(`${ccovBackend}/coverage/changeset_summary/${changeset}`, { jsonHeaders });

// raw-file fetcher (fileviewer)
export const getRawFile = (revision, path, callback) => {
  const data = fetch(`${hgHost}/integration/mozilla-inbound/raw-file/${revision}/${path}`, { plainHeaders })
  handleData(data, callback);
}

// get coverage from ActiveData for a particular source file
export const getFileRevisionCoverage = (revision, path, callback) => {
  const data = fetch(`${activeData}/query`, { jsonHeaders, method:"POST", body: JSON.stringify(Query.testCoverage(revision, path)) })
  handleData(data, callback);
}

const handleData = (data, callback) => {
  data.then(response => response.text())
  .then(text => (callback(text, undefined)))
  .catch(error => {
    console.log(error);
    callback(undefined, true); 
  })
}