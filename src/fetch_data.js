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
export const getRawFile = (revision, path, handleResponse) => {
  fetch(`${hgHost}/integration/mozilla-inbound/raw-file/${revision}/${path}`, { plainHeaders })
    .then(response => {
      if (response.status !== 200) {
        console.log('Error status code' + response.status);
        return;
      }
      response.text().then(handleResponse);
    })
    .catch(error => {
      console.error(error);
      this.setState(() => ({ appError: 'We did not manage to parse the file correctly.' }));
    });
}


// get coverage from ActiveData for a particular source file
export const getFileRevisionCoverage = (revision, path, handleResponse) => {
  fetch(`${activeData}/query`, { jsonHeaders, method:"POST", body: JSON.stringify(Query.testCoverage(revision, path)) })
    .then(response => {
      if (response.status !== 200) {
        console.log('Error status code' + response.status);
        return;
      }
      response.json().then(handleResponse);
    })
    .catch(error => {
      console.error(error);
      this.setState(() => ({ appError: 'We did not manage to parse the file correctly.' }));
    });
}
