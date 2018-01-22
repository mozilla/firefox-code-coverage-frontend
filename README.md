# Firefox code coverage diff viewer
This project is the code coverage changeset viewer for Firefox. You can view the frontend running in [here](https://firefox-code-coverage.herokuapp.com).

To understand the big picture of code coverage at Mozilla read [this](https://marco-c.github.io/2017/07/28/code-coverage-architecture.html) blog post.

The app will show recent changesets from mozilla-central that have code coverage (pending changesets will be automatically be fetched).
From there you can navigate to the diff of each changeset
and see the code coverage for added lines. It is very important to reiterate that it is code coverage for added lines and not for a specific file (as most code coverage viewers focus on).

The data used in this UI is based on data submitted to
[codecov.io](https://codecov.io/gh/marco-c/gecko-dev/commits).

# Planning and views
This is document tracks the
[original plans](https://docs.google.com/document/d/1dOWi18qrudwaOThNAYoCMS3e9LzhxGUiMLLrQ_WVR9w/edit#heading=h.rj6a3f39527l) while these track
[grid view of plans](https://docs.google.com/spreadsheets/d/1fDJH081xukK1QSZTsT63MqFFAqH0WgnO1Y5NjkwAVck/edit#gid=0) and
[long term plans](https://docs.google.com/document/d/1VMhwtoMJmYFbWQ5EF-O6ZJq6_0LprAPd94sFgSh5lJQ/edit#heading=h.p59ulsfjj6x2).
You view all coverage collection work tracked in
[here](https://bugzilla.mozilla.org/showdependencytree.cgi?id=1278393&hide_resolved=1).
You can preview this app
[here](https://firefox-code-coverage.herokuapp.com/)
while
[over here](https://marco-c.github.io/code-coverage-reports/)
we track files without any coverage.

# Disclaimers

- Linux64 only
  - partial debug build type: [some flags](http://searchfox.org/mozilla-central/source/browser/config/mozconfigs/linux64/code-coverage) are disabled
  - debug only tests are run
- A few tests are disabled on coverage builds due to high failures
  - [Skipped tests](http://searchfox.org/mozilla-central/search?q=skip-if+%3D+.*cov.*&case=false&regexp=true&path=*.ini) if running a coverage job and [few others](http://searchfox.org/mozilla-central/search?q=ccov.*%5C%5B&case=false&regexp=true&path=taskcluster%2Fci%2F*%2F*.yml)
- We ignore C++ files generated from IDL, IPDL, WebIDL
- Coverage collections are for .c*, .h*, and .js* files
  - However, not all of these are covered (either no coverage or zero coverage)
  - Some of these are because we don't cover all platforms
- Intermittent failures during testing cause different code paths to be hit (such as crash reporting)
- Broken builds/failures might prevent us from running a test, set of tests, or a few jobs, coverage could be abnormally low

# Filing issues
You can file frontend issues in [Firefox code coverage frontend](https://github.com/mozilla/firefox-code-coverage-frontend/issues).
For backend issues file them in [releng-services](https://github.com/mozilla-releng/services) with the
[4.app: shipit_uplift](https://github.com/mozilla-releng/services/issues?q=is%3Aissue+is%3Aopen+label%3A%224.app%3A+shipit_code_coverage%22) label.

# Requirements

* [Node.js](https://nodejs.org)
* [Yarn Package Manager](https://yarnpkg.com/en/docs/install)

# Set up
Checkout the code and run:

```bash
yarn install
yarn start
```
