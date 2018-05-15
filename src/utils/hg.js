import settings from '../settings';
import { jsonFetch, plainFetch } from './fetch';
import { getFromCache, saveInCache } from './localCache';

const { REPO_NAME, HG_HOST } = settings;

const authorInfo = (author) => {
  const nameRegex = /([^<]*)/i;
  const nameMatch = nameRegex.exec(author);
  const authorName = nameMatch ? nameMatch[1] : null;

  const emailRegex = /[<]([^>]*@[^>]*)[>]/i;
  const emailMatch = emailRegex.exec(author);
  const authorEmail = emailMatch ? emailMatch[1] : null;

  return { authorName, authorEmail };
};

// Depending if information about a changeset is obtained via `json-pushes`
// versus `json-rev` we will have `pushId` and `date` properties OR
// have to set the `pushId` and `changesetIndex` (position within a push)
// in order to facilitate sorting of changesets
const initializedChangeset = (cset, author, pushId, changesetIndex) => ({
  pushId,
  changesetIndex,
  ...authorInfo(author),
  ...cset,
});

export const getDiff = async (node, repoName = REPO_NAME) => {
  const text = await plainFetch(`${HG_HOST}/${repoName}/raw-rev/${node}`);
  return text.text();
};

export const getRawFile = (node, filePath, repoName = REPO_NAME) =>
  plainFetch(`${HG_HOST}/${repoName}/raw-file/${node}/${filePath}`);

export const getChangesetMeta = async (node, repoPath = REPO_NAME) => {
  const meta = await jsonFetch(`${HG_HOST}/${repoPath}/json-rev/${node}`);
  return initializedChangeset(meta, meta.user);
};

export const getJsonPushes = (repoName = REPO_NAME, date = settings.HG_DAYS_AGO) =>
  jsonFetch(`${HG_HOST}/${repoName}/json-pushes?version=2&full=1&startdate=${date}`);

export const hgDiffUrl = (node, repoName = REPO_NAME) =>
  `${HG_HOST}/${repoName}/rev/${node}`;

export const pushlogUrl = (node, repoName = REPO_NAME) =>
  `${HG_HOST}/${repoName}/pushloghtml?changeset=${node}`;

export const rawFile = async (node, filePath, repoName = REPO_NAME) => {
  try {
    const res = await getRawFile(node, filePath, repoName);
    if (res.status !== 200) {
      throw new Error();
    }
    return (await res.text()).split('\n');
  } catch (e) {
    console.error(`Failed to fetch source for revision: ${node}, filePath: ${filePath}\n${e}`);
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

export const bzUrl = (description) => {
  const bzUrlRegex = /^bug\s*(\d*)/i;
  const bzUrlMatch = bzUrlRegex.exec(description);
  return bzUrlMatch ? (
    `${settings.BZ_URL}/show_bug.cgi?id=${bzUrlMatch[1]}`) : null;
};

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
        .forEach((cset, changesetIndex) => {
          filteredCsets[cset.node] =
            initializedChangeset(cset, cset.author, pushId, changesetIndex);
        });
    }
  });
  return filteredCsets;
};

export const getChangesets = async (repoName = REPO_NAME) => {
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
      const text = await getJsonPushes(repoName);
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
    const text = await getJsonPushes(repoName);
    csets = await pushesToCsets(text.pushes);
  }
  return csets;
};
