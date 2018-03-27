import * as localForage from 'localforage';
import settings from '../settings';
import { JSON_HEADERS, PLAIN_HEADERS } from './fetch_data';

export const HG_HOST = 'https://hg.mozilla.org';

export const getDiff = (changeset, repoPath = 'mozilla-central') =>
  fetch(`${HG_HOST}/${repoPath}/raw-rev/${changeset}`, { PLAIN_HEADERS });

export const getRawFile = (revision, path, repoPath) =>
  fetch(`${HG_HOST}/${repoPath}/raw-file/${revision}/${path}`, { PLAIN_HEADERS });

export const getJsonPushes = (repoPath, date = settings.HG_DAYS_AGO) => (
  fetch(`${HG_HOST}/${repoPath}/json-pushes?version=2&full=1&startdate=${date}`, JSON_HEADERS)
);

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

  return {name, email}
};


const initializedChangeset = (cset, id, hidden) => ({
  pushId: id,
  hidden,
  bzUrl: bzUrl(cset.desc),
  authorInfo: authorInfo(cset.author),
  linkify: false,
  ...cset,
});

// A push can be composed of multiple changesets
// We want to return an array of changesets
// Some changesets will be ignored
// XXX: We return an array to keep chronological order
//      A better approach would not rely on that
const pushesToCsets = async (pushes, hidden) => {
  const filteredCsets = [];
  Object.keys(pushes).reverse().forEach((pushId) => {
    // Re-order csets and filter out those we don't want
    const csets = pushes[pushId].changesets.reverse().filter(c =>
      !ignoreChangeset(c));

    // We only consider pushes that have more than 1 changeset
    if (csets.length >= 1) {
      csets.forEach((cset) => {
        filteredCsets.push(initializedChangeset(cset, pushId, hidden));
      });
    }
  });
  return filteredCsets;
};


const isExpiredCache = (lastCaching) => {
  const MSTOS = 1000;
  const currentTime = (new Date()).getTime();
  const secondsDifference = (currentTime - lastCaching) / MSTOS;
  console.debug((currentTime - lastCaching) / MSTOS);
  return (
    (typeof lastCaching === 'number') &&
    (secondsDifference > settings.CACHE_CONFIG.SECONDS_TO_EXPIRE))
    || false;
};

const getCsetsFromCache = async (repoName, hidden) => {
  let csets = [];
  try {
    const lastCaching = await localForage.getItem('cachedTime');
    const cachedCsets = await localForage.getItem('changesets');
    if (!isExpiredCache(lastCaching) && cachedCsets) {
      console.debug(`Retrieved cached changesets. We have ${cachedCsets.length} changesets.`);
      csets = cachedCsets;
    } else {
      console.debug('The cache has expired');
    }
  } catch (e) {
    // We only log since we want to fetch the changesets from Hg
    console.error(e);
  }

  if (csets.length === 0) {
    console.debug('The local cache was not available.');
    const pushes = await getJsonPushes(repoName);
    const text = await (pushes).json();
    csets = await pushesToCsets(text.pushes, hidden);

    try {
      const currentTime = (new Date()).getTime();
      console.debug('Storing on local cache.');
      await localForage.setItem('changesets', csets);
      await localForage.setItem('cachedTime', currentTime);
    } catch (e) {
      console.info('We have failed to store to the local cache');
      // We don't want to throw an error and abort code execution
      console.error(e);
    }
  }

  return csets;
};

export default async (repoName, hidden) => {
  let csets = [];
  if (settings.CACHE_CONFIG.ENABLED) {
    console.debug('Local caching enabled');
    csets = await getCsetsFromCache(repoName, hidden);
  } else {
    console.debug('Local caching disabled');
    const text = await (await getJsonPushes(repoName)).json();
    csets = await pushesToCsets(text.pushes, hidden);
  }
  return csets;
};
