import settings from '../settings';
import { JSON_HEADERS, PLAIN_HEADERS } from './fetch';
import { queryCacheWithFallback } from './localCache';

const { REPO_NAME, HG_HOST } = settings;

export const getDiff = (node, repoName = REPO_NAME) =>
  fetch(`${HG_HOST}/${repoName}/raw-rev/${node}`, { PLAIN_HEADERS });

export const getRawFile = (node, filePath, repoName = REPO_NAME) =>
  fetch(`${HG_HOST}/${repoName}/raw-file/${node}/${filePath}`, { PLAIN_HEADERS });

export const getChangesetMeta = async (node, repoPath = REPO_NAME) =>
  fetch(`${HG_HOST}/${repoPath}/json-rev/${node}`, JSON_HEADERS);

export const getJsonPushes = (repoName = REPO_NAME, date = settings.HG_DAYS_AGO) =>
  fetch(`${HG_HOST}/${repoName}/json-pushes?version=2&full=1&startdate=${date}`, JSON_HEADERS);

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

const getChangesets = async (repoName = REPO_NAME) => {
  const fallback = async () => {
    const text = await (await getJsonPushes(repoName)).json();
    return pushesToCsets(text.pushes);
  };
  return queryCacheWithFallback('changesets', fallback);
};

export default getChangesets;
