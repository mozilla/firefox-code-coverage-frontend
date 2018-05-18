import * as localForage from 'localforage';
import settings from '../settings';
import CacheError from '../utils/errors';

const VALID_KEYS = ['changesets', 'coverage'];
const CACHING_KEY = 'cachedTime';

const queryCacheIsExpired = async () => {
  const lastCaching = await localForage.getItem(CACHING_KEY);
  const MSTOS = 1000;
  const currentTime = (new Date()).getTime();
  const secondsDifference = (currentTime - lastCaching) / MSTOS;
  console.debug((currentTime - lastCaching) / MSTOS);
  return (
    (typeof lastCaching === 'number') &&
    (secondsDifference > settings.CACHE_CONFIG.SECONDS_TO_EXPIRE))
    || false;
};

const getFromCache = async (key) => {
  if (typeof key !== 'string') {
    throw new CacheError(`${key} should be a string.`);
  } else if (!VALID_KEYS.find(elem => elem === key)) {
    throw new CacheError(`${key} is not a valid cache key.`);
  }

  if (await queryCacheIsExpired()) {
    throw new CacheError('The cache has expired.');
  }

  const data = await localForage.getItem(key);
  if (!data) {
    throw new CacheError(`${key} was not found in the cache.`);
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
      console.warning(e);
      data = undefined;
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

export const loadDataFromCache = async () => {
  let data;
  try {
    data.changesets = await getFromCache('changesets');
    data.changesetsCoverage = await getFromCache('coverage');
  } catch (e) {
    console.error(e);
  }

  return data;
};

export const saveDataToCache = (data) => {
  Object.entries(data).forEach((key, value) => {
    saveInCache(key, value);
  });
};
