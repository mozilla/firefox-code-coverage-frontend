const hg_host = 'https://hg.mozilla.org'

const text_plain_headers = {
  'Accept': 'text/plain'
}
const json_headers = {
  'Accept': 'application/json'
}

export const getDiff = (changeset) =>
  fetch(`${hg_host}/mozilla-central/raw-rev/${changeset}`, text_plain_headers)

export const getJsonPushes = (repo_name) =>
  fetch(`${hg_host}/${repo_name}/json-pushes?version=2&full=1`, json_headers)
