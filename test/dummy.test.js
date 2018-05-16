// Used for data structures converters testing
export const changesetsArray = [
  {
    author: 'Some Person <some.person@gmail.com>',
    branch: 'testing',
    bzUrl: 'http://bugzilla.mozilla.org/dummyurl0',
    desc: 'Bug 1234: For testing',
    files: ['local/file/random.cpp'],
    hidden: true,
    linkify: false,
    node: '92a00bb8477d5839f',
    parents: ['b92f0a1fe67dea7'],
    pushId: '00000',
    summary: 'this is a dummy cset 1',
    tags: [],
  },
  {
    author: 'Red Blue <rbg@gmail.com>',
    branch: 'tracking',
    bzUrl: 'http://bugzilla.mozilla.org/dummyurl1',
    desc: 'Bug 2345: Also testing',
    files: ['local/box/file.html', 'local/box/file.cpp'],
    hidden: true,
    linkify: true,
    node: '94648fd013aa0417dd3d',
    parents: ['a4dbbaf33f26bbe3adda'],
    pushId: '11111',
    summary: 'this is a dummy cset 2',
    tags: [],
  },
  {
    author: 'No Name <nn@gmail.com>',
    branch: 'dev',
    bzUrl: 'http://bugzilla.mozilla.org/dummyurl2',
    desc: 'Bug 3456: Another testing',
    files: ['local/repo/front.js', 'local/repo/back.py', 'local/repo/edit.css'],
    hidden: false,
    linkify: false,
    node: '9dcb6898acddeb169dc',
    parents: ['f65886b9d0e73a35a'],
    pushId: '22222',
    summary: 'this is a dummy cset 3',
    tags: [],
  },
];

// Used for data structure converters testing
export const changesetsMap = {
  '92a00bb8477d5839f': {
    author: 'Some Person <some.person@gmail.com>',
    branch: 'testing',
    bzUrl: 'http://bugzilla.mozilla.org/dummyurl0',
    desc: 'Bug 1234: For testing',
    files: ['local/file/random.cpp'],
    hidden: true,
    linkify: false,
    node: '92a00bb8477d5839f',
    parents: ['b92f0a1fe67dea7'],
    pushId: '00000',
    summary: 'this is a dummy cset 1',
    tags: [],
  },
  '94648fd013aa0417dd3d': {
    author: 'Red Blue <rbg@gmail.com>',
    branch: 'tracking',
    bzUrl: 'http://bugzilla.mozilla.org/dummyurl1',
    desc: 'Bug 2345: Also testing',
    files: ['local/box/file.html', 'local/box/file.cpp'],
    hidden: true,
    linkify: true,
    node: '94648fd013aa0417dd3d',
    parents: ['a4dbbaf33f26bbe3adda'],
    pushId: '11111',
    summary: 'this is a dummy cset 2',
    tags: [],
  },
  '9dcb6898acddeb169dc': {
    author: 'No Name <nn@gmail.com>',
    branch: 'dev',
    bzUrl: 'http://bugzilla.mozilla.org/dummyurl2',
    desc: 'Bug 3456: Another testing',
    files: ['local/repo/front.js', 'local/repo/back.py', 'local/repo/edit.css'],
    hidden: false,
    linkify: false,
    node: '9dcb6898acddeb169dc',
    parents: ['f65886b9d0e73a35a'],
    pushId: '22222',
    summary: 'this is a dummy cset 3',
    tags: [],
  },
};

export const supportedExtensions = [
  'c',
  'h',
  'jsm',
];

// This is an incomplete parsedDiff object
export const parsedDiff = [
  {
    to: 'layout/reftests/reftest.list',
  },
  {
    to: 'layout/tools/reftest/globals.jsm',
  },
];

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
