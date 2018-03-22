export default {
  CACHE_SECONDS_TO_EXPIRE: 15 * 60,
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
  GITHUB_RIBBON: 'https://s3.amazonaws.com/github/ribbons/forkme_right_green_007200.png',
  MSTOS: 1000, // ms to s conversion
  MIN_REVISION_LENGTH: 5,
  REPO: 'https://github.com/mozilla/firefox-code-coverage-frontend',
  STRINGS: {
    LOADING: 'Loading...',
    PENDING: 'Pending',
  },
  THREE_DAYS_AGO: new Date((new Date()).getTime() - (3 * 24 * 60 * 60 * 1000))
    .toISOString().substring(0, 10),
};
