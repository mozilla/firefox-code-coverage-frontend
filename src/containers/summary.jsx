import React, { Component } from 'react';
import ReactInterval from 'react-interval';

import Summary from '../components/summary';
import ChangesetFilter from '../components/changesetFilter';
import GenericErrorMessage from '../components/genericErrorMessage';
import settings from '../settings';
import { arrayToMap, mapToArray } from '../utils/data';
import { getCoverage } from '../utils/coverage';
import getChangesets from '../utils/hg';

const { INTERNAL_ERROR, LOADING, PENDING } = settings.STRINGS;

const PollingStatus = ({ pollingEnabled }) => (
  (pollingEnabled) ? (
    <div className="polling-status"> {pollingEnabled}
      Some changesets are still being processed and we are actively
      polling them until we get a result.
    </div>) : (null)
);

export default class SummaryContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      changesets: [],
      coverage: [],
      descriptionFilterValue: '',
      pollingEnabled: false, // We don't start polling until we're ready
      errorMessage: '',
      timeout: 30000, // How often we poll for csets w/o coverage status
    };
    this.onFilterByDescription = this.onFilterByDescription.bind(this);
  }

  async componentDidMount() {
    this.fetchChangesets();
  }

  onFilterByDescription(event) {
    event.preventDefault();
    this.setState({ descriptionFilterValue: event.target.value });
  }

  async fetchChangesets() {
    try {
      // XXX: With this refactor we're only storing changesets w/o coverage data
      //      This means that the cache is only as useful as saving all the Hg fetches
      //
      // Next refactor:
      // 1) fetch jsonPushes (2 days)
      // 2) filter out pushes that can be ignored (e.g. only 1 cset)
      // 3) fetch coverage data for all of them
      // 4) Inspect pushes from oldest to newest
      //    FAIL: If there are no pushes with some coverage (Show message)
      // 5) For every push with coverage data go and fetch each cset
      const changesets = await getChangesets();
      const coverage = await getCoverage(changesets);
      const summary = { pending: 0, error: 0 };
      changesets.forEach((cset) => {
        if (cset.summary === PENDING) {
          summary.pending += 1;
        } else if (cset.summary === INTERNAL_ERROR) {
          summary.error += 1;
        }
      });
      console.debug(`We have ${changesets.length} changesets.`);
      console.debug(`pending: ${summary.pending}`);
      console.debug(`errors: ${summary.error}`);
      this.setState({
        changesets,
        coverage,
        pollingEnabled: summary.pending > 0,
      });
    } catch (error) {
      console.error(error);
      this.setState({
        changesets: [],
        coverage: [],
        pollingEnabled: false,
        errorMessage: 'We have failed to fetch coverage data.',
      });
    }
  }

  // We poll on an interval for coverage for csets without it
  async pollPending(coverage) {
    console.debug('We are going to poll again for coverage data.');
    try {
      // Only poll changesets that are still pending
      const partialCoverage = await getCoverage(mapToArray(coverage)
        .filter(cov => cov.summary === PENDING));
      const count = partialCoverage.filter(cov => cov.summary === PENDING).length;
      const newCoverage = {
        ...coverage,
        ...arrayToMap(partialCoverage),
      };
      if (count === 0) {
        console.debug('No more polling required.');
        this.setState({ coverage: newCoverage, pollingEnabled: false });
      } else {
        this.setState({ coverage: newCoverage });
      }
    } catch (e) {
      this.setState({ pollingEnabled: false });
    }
  }

  render() {
    const {
      descriptionFilterValue, changesets, coverage, pollingEnabled, errorMessage, timeout,
    } = this.state;
    const coverageMap = arrayToMap(coverage);

    if (errorMessage) {
      return (<div className="error-message">{errorMessage}</div>);
    }
    descriptionFilterValue.length();

    const viewableCsetsMap = {};
    changesets.forEach((cset) => {
      if (coverageMap[cset.node] && coverageMap[cset.node].show &&
          cset.desc.search(descriptionFilterValue) !== -1) {
        viewableCsetsMap[cset.node] = cset;
      }
    });

    return (
      <div>
        {pollingEnabled && (
          <div>
            <ReactInterval
              timeout={timeout}
              enabled={pollingEnabled}
              callback={() => this.pollPending(coverage)}
            />
            <PollingStatus
              pollingEnabled={pollingEnabled}
            />
          </div>
        )}
        <ChangesetFilter
          value={descriptionFilterValue}
          onChange={this.onFilterByDescription}
        />
        {Object.keys(viewableCsetsMap).length > 0 &&
          <Summary
            changesets={viewableCsetsMap}
            coverage={coverageMap}
          />
        }
        {(!pollingEnabled && Object.keys(viewableCsetsMap) === 0) &&
          <GenericErrorMessage />
        }
        {Object.keys(changesets).length === 0 &&
          (<h3 className="loading">{LOADING}</h3>)
        }
      </div>
    );
  }
}
