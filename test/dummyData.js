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
    tags: []
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
    tags: []
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
    tags: []
  }
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
    tags: []
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
    tags: []
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
    tags: []
  }
};

// Used for Coverage summary reports testing
export const coverage = {
  build_changeset: 'f258a2b821eaa1c1ee',
  diffs: {
    local/test/file1.h: {
      lines: {
        1: '?',
        2: 'Y',
        3: 'Y',
        4: 'N',
        5: 'N',
        6: 'N'
      },
      percent: 33.3
    },
    local/test/file2.h: {
      lines: {
        1: '?',
        2: '?',
        3: '?',
        4: '?',
        5: '?',
        6: '?'
      },
      percent: 0
    }
  },
  git_build_changeset: '2c2f5427bbc38bcc07976ab9',
  overall_cur: '49.2',
  overall_prev: '60.0'
};

// Used for coverage data calculations testing
export const fileCoverage = {

};
