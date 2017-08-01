const host = 'https://hg.mozilla.org'
const headers = {
  'Accept': 'text/plain'
}

export const getDiff = (changeset) =>
  fetch(`${host}/mozilla-central/raw-rev/${changeset}`, { headers })
