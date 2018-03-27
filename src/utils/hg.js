import settings from '../settings';
import { JSON_HEADERS, PLAIN_HEADERS } from './fetch';
import { getFromCache, saveInCache } from './localCache';

const { HG_HOST } = settings;

export const getDiff = (node, repoPath = 'mozilla-central') =>
  fetch(`${HG_HOST}/${repoPath}/raw-rev/${node}`, { PLAIN_HEADERS });

export const getRawFile = (node, path, repoPath) =>
  fetch(`${HG_HOST}/${repoPath}/raw-file/${node}/${path}`, { PLAIN_HEADERS });

export const getJsonPushes = (repoPath, date = settings.HG_DAYS_AGO) => (
  fetch(`${HG_HOST}/${repoPath}/json-pushes?version=2&full=1&startdate=${date}`, JSON_HEADERS)
);

export const hgDiffUrl = (repoName, node) => (
  `${HG_HOST}/${repoName}/rev/${node}`
);

export const pushlogUrl = (repoName, node) => (
  `${HG_HOST}/${repoName}/pushloghtml?changeset=${node}`
);

export const rawFile = async (revision, path, repoPath) => {
  try {
    const res = await getRawFile(revision, path, repoPath);
    if (res.status !== 200) {
      throw new Error();
    }
    return (await res.text()).split('\n');
  } catch (e) {
    console.error(`Failed to fetch source for revision: ${revision}, path: ${path}\n${e}`);
    throw new Error('Failed to get source code from hg');
  }
};

const ignoreChangeset = ({ desc, author }) => {
  if (
    (author.includes('ffxbld')) ||
    (desc.includes('a=merge') && desc.includes('r=merge')) ||
    (desc.includes('erge') && (desc.includes('to'))) ||
    (desc.includes('ack out')) ||
    (desc.includes('acked out'))) {
    return true;
  }
  return false;
};

const bzUrl = (description) => {
  const bzUrlRegex = /^bug\s*(\d*)/i;
  const bzUrlMatch = bzUrlRegex.exec(description);
  return bzUrlMatch ? (
    `${settings.BZ_URL}/show_bug.cgi?id=${bzUrlMatch[1]}`) : null;
};

const authorInfo = (author) => {
  const nameRegex = /([^<]*)/i;
  const nameMatch = nameRegex.exec(author);
  const name = nameMatch ? nameMatch[1] : null;

  const emailRegex = /[<]([^>]*@[^>]*)[>]/i;
  const emailMatch = emailRegex.exec(author);
  const email = emailMatch ? emailMatch[1] : null;

  return { name, email };
};

const initializedChangeset = (cset, id) => ({
  bzUrl: bzUrl(cset.desc),
  pushId: id,
  authorInfo: authorInfo(cset.author),
  ...cset,
});

// A push can be composed of multiple changesets
// We want to return an array of changesets
// Some changesets will be ignored
// XXX: We return an array to keep chronological order
//      A better approach would not rely on that
const pushesToCsets = async (pushes) => {
  const filteredCsets = [];
  Object.keys(pushes).reverse().forEach((pushId) => {
    // We only consider pushes that have more than 1 changeset
    if (pushes[pushId].changesets.length >= 1) {
      // Re-order csets and filter out those we don't want
      pushes[pushId].changesets.reverse()
        .filter(c => !ignoreChangeset(c))
        .forEach((cset) => {
          filteredCsets.push(initializedChangeset(cset, pushId));
        });
    }
  });
  return filteredCsets;
};

const getChangesets = async (repoName) => {
  let csets = [];
  if (settings.CACHE_CONFIG.ENABLED) {
    try {
      csets = await getFromCache('changesets');
    } catch (e) {
      // We only log since we want to fetch the changesets from Hg
      console.error(e);
    }

    if (!csets || csets.length === 0) {
      console.debug('The local cache was not available.');
      const text = await (await getJsonPushes(repoName)).json();
      csets = await pushesToCsets(text.pushes);
    }

    try {
      saveInCache('changesets', csets);
    } catch (e) {
      console.info('We have failed to store to the local cache');
      // We don't want to throw an error and abort code execution
      console.error(e);
    }
  } else {
    const text = await (await getJsonPushes(repoName)).json();
    csets = await pushesToCsets(text.pushes);
  }
  return csets;
};

export default getChangesets;
