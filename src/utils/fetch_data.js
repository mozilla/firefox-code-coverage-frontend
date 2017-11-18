export const hgHost = 'https://hg.mozilla.org';
export const ccovBackend = 'https://uplift.shipit.staging.mozilla-releng.net';
export const activeData = 'https://activedata.allizom.org';

const plainHeaders = {
  Accept: 'text/plain',
};
const jsonHeaders = {
  Accept: 'application/json',
};

async function httpFetch(params) {
  try {
    const response = await fetch(
      params.url,
      {
        headers: params.headers || plainHeaders,
        method: params.method || 'GET',
        body: params.body,
      },
    );
    if (response.status !== 200) {
      throw Error(`Error status code${response.status}`);
    }
    return response.text();
  } catch (error) {
    throw Error(`Problem fetching from URL${error}`);
  }
}

async function jsonPost(params) {
  try {
    const response = await httpFetch({
      url: params.url,
      headers: jsonHeaders,
      method: 'POST',
      body: JSON.stringify(params.body),
    });
    return JSON.parse(response);
  } catch (error) {
    throw Error(`Problem fetching JSON from URL ${params.url}\n${error}`);
  }
}

export const getDiff = changeset =>
  fetch(`${hgHost}/mozilla-central/raw-rev/${changeset}`, { plainHeaders });

export const getJsonPushes = repoName =>
  fetch(`${hgHost}/${repoName}/json-pushes?version=2&full=1`, { jsonHeaders });

export const getChangesetCoverage = changeset =>
  fetch(`${ccovBackend}/coverage/changeset/${changeset}`, { jsonHeaders });

export const getChangesetCoverageSummary = changeset =>
  fetch(`${ccovBackend}/coverage/changeset_summary/${changeset}`, { jsonHeaders });

// raw-file fetcher (fileviewer)
export const getRawFile = (revision, path) => httpFetch({
  url: `${hgHost}/integration/mozilla-inbound/raw-file/${revision}/${path}`,
});

// query active data
export const query = body => jsonPost({
  url: `${activeData}/query`,
  body,
});
