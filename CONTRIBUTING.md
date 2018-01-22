# How to contribute
We are very gratefull to receive pull requests from everyone. In order to collaborate successfully
we would like to lay down some principles and steps that will make contributing easier.

# Principles

* In React, there's a unidirectional data flow principle that we follow
  * You can [read this](https://open.bekk.no/easier-reasoning-with-unidirectional-dataflow-and-immutable-data) to learn more
  * Do all data manipulations at the very top parent component and set the state there; pass down the data to the children component
  * Children components should not do data manipulations or fetching
  * They are to receive props and just render the UI
* Always remember at all times: "The UI is a representation of the app's state" (code accordingly!)
  * If your state changes then your UI has to re-render
* Do not store data in your state that has no UI representation
* Write [good commit messages](https://github.com/erlang/otp/wiki/writing-good-commit-messages)
* It is OK and encouraged to [rewrite the commits of your PR](https://www.atlassian.com/git/tutorials/rewriting-history/git-rebase) when needed
  * It is an excellent skill to learn
  * We do not want a large number of commits with ```fix ups``` after receiving feedback on your PR
  * A PR can have dozens of commit messages. Landing that many commits to the `master` branch makes the history of the project very polluted
  * When you rewrite the history of your commits you will have to force the push (`git push -f`) and it will overwrite remote commits
* Please read the [following style guides](https://udacity.github.io/frontend-nanodegree-styleguide/) and follow their advice.

# Before you start
Please make sure you have completed an introductory tutorial of React.
We recommend the [official one](https://reactjs.org/tutorial/tutorial.html).

# Getting connected
Use [IRC](https://wiki.mozilla.org/IRC) to communicate with the team and join us on the ```#ateam``` channel.
Introduce yourself and let us know a bit about yourself. We would love to chat with you!

# Getting started

* Claim an [issue](https://github.com/mozilla/firefox-code-coverage-frontend/issues) by making a comment
  * The ones that say [good first issues](https://github.com/mozilla/firefox-code-coverage-frontend/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) are likely to be more straightforward
  * If after you claim an issue there are no interactions I will make the issue available for other contributors
* Fork the repo
* Clone your repo
```
git clone git@github.com:your-username/firefox-code-coverage-frontend.git
```
* Install the [requirements](https://github.com/mozilla/firefox-code-coverage-frontend/blob/master/README.md#requirements) and
[set up the project](https://github.com/mozilla/firefox-code-coverage-frontend/blob/master/README.md#set-up)
* Create a branch for the issue you want to contribute to (e.g. `git checkout -b your_branch_name`)
  * Do not develop on the `master` branch
* Make sure you pass the linting checks (`yarn lint`)
* Push changes to your branch and [submit a pull request](https://github.com/thoughtbot/factory_bot_rails/compare/)
  * We're commited to give feedback (or contact you of delays) on the PR within a businness day
  * If you don't hear back check on IRC to see if the reviewers
* Make a comment on the PR indicating the user name of the reviewer
* After addressing any feedback


