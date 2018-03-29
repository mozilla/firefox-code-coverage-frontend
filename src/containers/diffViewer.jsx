import React, { Component } from 'react';
import { orderBy } from 'lodash';

import DiffViewer from '../components/diffViewer';
import { getChangesetCoverage } from '../utils/coverage';
import { getParsedDiff, getChangesetMeta } from '../utils/hg';
import settings from '../settings';

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
      coverage: undefined,
      parsedDiff: [],
    };
  }

  componentDidMount() {
    const { node } = this.props;
    Promise.all([
      this.fetchSetChangesetMeta(node),
      this.fetchSetCoverageData(node),
      this.fetchSetDiff(node)]);
  }

  async fetchSetChangesetMeta(node) {
    const changeset = await getChangesetMeta(node);
    this.setState({ changeset });
  }

  async fetchSetCoverageData(node) {
    try {
      const coverage = await getChangesetCoverage(node);
      if (coverage.summary === settings.STRINGS.PENDING) {
        this.setState({
          appError: 'The coverage data is still pending. Try again later.',
        });
      }
      this.setState({ coverage });
    } catch (error) {
      console.error(error);
      this.setState({
        appError: 'There was an error fetching the code coverage data.',
      });
    }
  }

  async fetchSetDiff(node) {
    try {
      this.setState({ parsedDiff: await getParsedDiff(node) });
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
    const {
      appError, changeset, coverage, parsedDiff,
    } = this.state;
    const sortedDiff = sortByPercent(parsedDiff, coverage);

    return (
      <DiffViewer
        appError={appError}
        changeset={changeset}
        coverage={coverage}
        parsedDiff={sortedDiff}
      />
    );
  }
}
