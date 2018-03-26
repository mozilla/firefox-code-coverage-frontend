import React, { Component } from 'react';
import { orderBy } from 'lodash';

import DiffViewer from '../components/diffViewer';
import { csetWithCcovData } from '../utils/coverage';
import { getDiff } from '../utils/hg';
import settings from '../settings';

const parse = require('parse-diff');


// Adds a new percent property to each file in parsedDiff that represents
// the proportion of uncovered lines.
// This directly modifies each object in the parsedDiff array.
const sortByPercent = (parsedDiff, coverage) => {
  parsedDiff.forEach((p) => {
    const cov = p;
    cov.percent = (coverage.diffs[p.from]) ? coverage.diffs[p.from].percent : 0;
  });
  const sortedDiffs = orderBy(parsedDiff, ({ percent }) => percent || 0, ['desc']);
  return sortedDiffs;
};

/* DiffViewer loads a raw diff from Mozilla's hg-web and code coverage from
 * shiptit-uplift to show a diff with code coverage information for added
 * lines.
 */
export default class DiffViewerContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appError: undefined,
      csetMeta: {
        coverage: undefined,
      },
      parsedDiff: [],
    };
  }

  componentDidMount() {
    const { changeset } = this.props;
    Promise.all([this.fetchSetCoverageData(changeset), this.fetchSetDiff(changeset)]);
  }

  async fetchSetCoverageData(changeset) {
    try {
      const csetMeta = await csetWithCcovData({ node: changeset });
      if (csetMeta.summary === settings.STRINGS.PENDING) {
        this.setState({
          appError: 'The coverage data is still pending. Try again later.',
        });
      }
      this.setState({ csetMeta });
    } catch (error) {
      console.error(error);
      this.setState({
        appError: 'There was an error fetching the code coverage data.',
      });
    }
  }

  async fetchSetDiff(changeset) {
    try {
      const text = await (await getDiff(changeset)).text();
      this.setState({ parsedDiff: parse(text) });
    } catch (e) {
      if ((e instanceof TypeError) && (e.message === 'Failed to fetch')) {
        this.setState({
          appError: 'We\'ve had a network issue. Please try again.',
        });
      } else {
        this.setState({
          appError: 'We did not manage to parse the diff correctly.',
        });
        // Since we're not checking for e.message we should raise it
        // so it shows up on sentry.io
        throw e;
      }
    }
  }

  render() {
    const { appError, csetMeta, parsedDiff } = this.state;
    const sortedDiff = sortByPercent(parsedDiff, csetMeta.coverage);

    return (
      <DiffViewer
        {...csetMeta}
        appError={appError}
        parsedDiff={sortedDiff}
      />
    );
  }
}
