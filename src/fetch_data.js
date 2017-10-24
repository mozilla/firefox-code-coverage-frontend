import * as Query from './query';
const https = require('https');

export const hgHost = 'https://hg.mozilla.org';
export const ccovBackend = 'https://uplift.shipit.staging.mozilla-releng.net';
export const activeData = 'activedata.allizom.org';

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
export const getRawFile = (revision, path) =>
  fetch(`${hgHost}/integration/mozilla-inbound/raw-file/${revision}/${path}`, { plainHeaders });

// Taken from https://github.com/mozilla/moz-coco/blob/master/src/client/Client.js
// On October 23, 2017
// Under the MPL License
export const getFileRevisionCoverage = (revision, path, callback) => {
  const body = Query.testCoverage(revision, path);
  const jsonbody = JSON.stringify(body);
  const options = {
    hostname: `${activeData}`,
    port: 443,
    path: '/query',
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(jsonbody)
    }
  }
  console.log("Query sent: " + jsonbody);
  const respchunks = [];
  const p = new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        respchunks.push(new Buffer(chunk));
      });
      res.on('end', (chunk) => {
        resolve(Buffer.concat(respchunks).toString('utf8'));
      });
      res.on('error', (e) => {
        reject(e);
      });
    });
    req.write(jsonbody);
    req.end();
  });
  p.then((body) => {
    callback(JSON.parse(body));
  }).catch((err) => console.log(`Exception in fetch_data.js: ${err}`));
}