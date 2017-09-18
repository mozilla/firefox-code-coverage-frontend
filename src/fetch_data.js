export const hgHost = 'https://hg.mozilla.org'
export const ccovBackend = 'https://uplift.shipit.staging.mozilla-releng.net'
const headers = {
  'Accept': 'text/plain'
}

export const getDiff = (changeset) =>
  fetch(`${hgHost}/mozilla-central/raw-rev/${changeset}`, { headers })

export const getJsonPushes = (repo_name) =>
  fetch(`${hgHost}/${repo_name}/json-pushes?version=2&full=1`, {
    'Accept': 'application/json'
  })

export const getChangesetCoverage = (changeset) =>
fetch(`${ccovBackend}/coverage/changeset/${changeset}`, {
  'Accept': 'application/json'
})

export const getChangesetCoverageSummary = (changeset) =>
fetch(`${ccovBackend}/coverage/changeset_summary/${changeset}`, {
  'Accept': 'application/json'
})
