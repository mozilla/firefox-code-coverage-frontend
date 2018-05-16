import * as localForage from 'localforage';
import settings from '../settings';

const CACHING_KEY = 'cachedTime';

export const isExpiredCache = (lastCaching) => {
  const MSTOS = 1000;
  const currentTime = (new Date()).getTime();
  const secondsDifference = (currentTime - lastCaching) / MSTOS;
  console.debug((currentTime - lastCaching) / MSTOS);
  return (
    (typeof lastCaching === 'number') &&
    (secondsDifference > settings.CACHE_CONFIG.SECONDS_TO_EXPIRE))
    || false;
};

export const getFromCache = async (key) => {
  let data;
  try {
    const lastCaching = await localForage.getItem(CACHING_KEY);
    data = await localForage.getItem(key);
    if (!isExpiredCache(lastCaching) && data) {
      console.debug('Retrieved data from the local cache.');
    } else {
      console.debug('The cache has expired');
      data = undefined;
    }
  } catch (e) {
    // We only log since we want to fetch the changesets from Hg
    console.error(e);
  }
  return data;
};

export const saveInCache = async (key, data) => {
  const currentTime = (new Date()).getTime();
  console.debug('Storing on local cache.');
  await localForage.setItem(key, data);
  await localForage.setItem(CACHING_KEY, currentTime);
};

export const clearCache = () => {
  try {
    localForage.clear();
    return true;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const queryCacheWithFallback = async (key, fallback) => {
  let data;
  if (settings.CACHE_CONFIG.ENABLED) {
    try {
      data = await getFromCache(key);
    } catch (e) {
      // We only log since we want to fetch the coverage from the backend
      console.error(e);
    }

    // WARNING: This code can only be used if you're expecting an Object
    if (!data || Object.keys(data).length === 0) {
      console.debug('The local cache was not available.');
      data = await fallback();
      try {
        saveInCache(key, data);
      } catch (e) {
        console.info('We have failed to store to the local cache');
        // We don't want to throw an error and abort code execution
        console.error(e);
      }
    }
  } else {
    data = await fallback();
  }
  return data;
};
