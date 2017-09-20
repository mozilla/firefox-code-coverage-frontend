export const hgHost = 'https://hg.mozilla.org';
export const ccovBackend = 'https://uplift.shipit.staging.mozilla-releng.net';

const plainHeaders = {
  Accept: 'text/plain'
};
const jsonHeaders = {
  Accept: 'application/json'
};

export const getDiff = changeset =>
  fetch(`${hgHost}/mozilla-central/raw-rev/${changeset}`, { plainHeaders });

export const getJsonPushes = repoName =>
  fetch(`${hgHost}/${repoName}/json-pushes?version=2&full=1`, { jsonHeaders });

export const getChangesetCoverage = changeset =>
  fetch(`${ccovBackend}/coverage/changeset/${changeset}`, { jsonHeaders });

export const getChangesetCoverageSummary = changeset =>
  fetch(`${ccovBackend}/coverage/changeset_summary/${changeset}`, { jsonHeaders });
