const settings = {
  ACTIVE_DATA: 'https://activedata.allizom.org',
  BZ_URL: 'http://bugzilla.mozilla.org',
  CACHE_CONFIG: {
    SECONDS_TO_EXPIRE: 1 * 60 * 60, // 1 hour
    ENABLED: process.env.ENABLE_CACHE === 'true' || process.env.NODE_ENV === 'production',
  },
  CCOV_BACKEND: 'https://uplift.shipit.staging.mozilla-releng.net',
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
  FIREFOX_REPO: 'mozilla-central',
  GITHUB_RIBBON: 'https://s3.amazonaws.com/github/ribbons/forkme_right_green_007200.png',
  HG_HOST: 'https://hg.mozilla.org',
  MIN_REVISION_LENGTH: 5,
  REPO: 'https://github.com/mozilla/firefox-code-coverage-frontend',
  STRINGS: {
    INTERNAL_ERROR: 'INTERNAL SERVER ERROR',
    LOADING: 'Loading...',
    PENDING: 'Pending',
  },
  HG_DAYS_AGO: new Date((new Date()).getTime() - (2 * 24 * 60 * 60 * 1000))
    .toISOString().substring(0, 10),
};

if (settings.CACHE_CONFIG.ENABLED) {
  console.debug('Local caching enabled');
} else {
  console.debug('Local caching disabled');
}

export default settings;
