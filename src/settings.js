import { daysAgoDate } from './utils/date';

const settings = {
  ACTIVE_DATA: 'https://activedata.allizom.org',
  BZ_URL: 'https://bugzilla.mozilla.org',
  CACHE_CONFIG: {
    SECONDS_TO_EXPIRE: 1 * 60 * 60, // 1 hour
    ENABLED: process.env.ENABLE_CACHE === 'true' || process.env.NODE_ENV === 'production',
  },
  CCOV_BACKEND: 'https://coverage.moz.tools',
  CCOV_STAGING_BACKEND: 'https://coverage.staging.moz.tools',
  CODECOV_GECKO_DEV: 'https://codecov.io/gh/mozilla/gecko-dev',
  COVERAGE_THRESHOLDS: {
    low: {
      threshold: 20,
      className: 'low-coverage',
    },
    medium: {
      threshold: 70,
      className: 'medium-coverage',
    },
    high: {
      className: 'high-coverage',
    },
  },
  REPO_NAME: 'mozilla-central',
  GH_GECKO_DEV: 'https://github.com/mozilla/gecko-dev',
  HG_HOST: 'https://hg.mozilla.org',
  MIN_REVISION_LENGTH: 5,
  REPO: 'https://github.com/mozilla/firefox-code-coverage-frontend',
  STRINGS: {
    INTERNAL_ERROR: 'INTERNAL SERVER ERROR',
    LOADING: 'Loading...',
    PENDING: 'Pending',
  },
  HG_DAYS_AGO: daysAgoDate(1),
};

if (settings.CACHE_CONFIG.ENABLED) {
  console.debug('Local caching enabled');
} else {
  console.debug('Local caching disabled');
}

export default settings;
