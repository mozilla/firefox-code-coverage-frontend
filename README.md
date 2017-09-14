# Firefox code coverage history viewer prototype
This is a repository to prototype a code coverage history viewer for Firefox.

The scope of this project is minimal as it will focus on:

* a similar view as the [commits view](https://codecov.io/gh/marco-c/gecko-dev/commits) of codecov.io.
* a code coverage + diff viewer [sample](https://firefox-code-coverage.herokuapp.com/#/changeset/12e33b9d6f91)

This is to support this [code coverage planning document](https://docs.google.com/document/d/1dOWi18qrudwaOThNAYoCMS3e9LzhxGUiMLLrQ_WVR9w/edit#heading=h.rj6a3f39527l).

You can preview the current app [here](https://firefox-code-coverage.herokuapp.com/).

# Requirements

* [Node.js](https://nodejs.org)
* [Yarn Package Manager](https://yarnpkg.com/en/docs/install)

# Set up
Checkout the code and run:

* yarn install
* yarn start

# Statistical analysis

In order to help with development you can run the following:

```bash
yarn run flow
```

This gives you a statistical analysis of the source code.

Some IDEs support Flow. I personally use [Atom](https://atom.io/) which has [linter-flow](https://atom.io/packages/linter-flow).
You will need to download [Flow](https://github.com/facebook/flow/releases)
and put the binary in your PATH to make it work.
