export const coverageLow = {
  build_changeset: 'cbf38053c',
  diffs: {
    'local/repo/test.js': {
      lines: {
        1: 'N',
      },
      percent: 100,
    },
  },
  git_build_changeset: 'e52a95e9e832630',
  overall_cur: '60',
  overall_prev: '55',
  statistics: {
    percentage: 0,
    coveredLines: 0,
    addedLines: 1,
  },
};

export const coverageMed = {
  build_changeset: 'f454466ff16cbf38',
  diffs: {
    'local/repo/test.js': {
      lines: {
        1: 'N',
        2: 'Y',
      },
      percent: 50,
    },
  },
  git_build_changeset: '52a95e9e832630f9',
  overall_cur: '58.11328',
  overall_prev: '59.16936',
  statistics: {
    percentage: 50,
    coveredLines: 1,
    addedLines: 2,
  },
};

export const coverageHigh = {
  build_changeset: '7dad306cf8fed',
  diffs: {
    'local/repo/test.js': {
      lines: {
        1: 'Y',
      },
      percent: 0,
    },
  },
  git_build_changeset: 'faae221e52a95',
  overall_cur: '10.12363',
  overall_prev: '15.29584',
  statistics: {
    percentage: 100,
    coveredLines: 1,
    addedLines: 1,
  },
};

export const coverageTransform = {
  build_changeset: '7dad306cf8fed',
  diffs: [
    {
      changes: [{ coverage: 'Y', line: 1 }],
      name: 'local/repo/test.js',
    },
  ],
  git_build_changeset: 'faae221e52a95',
  overall_cur: '10.12363',
  overall_prev: '15.29584',
};

export const coverageFileRevision = [
  {
    source: {
      file: {
        covered: [3, 4, 5, 6],
        uncovered: [1, 2, 7, 8, 9, 10],
      },
    },
  },
];
