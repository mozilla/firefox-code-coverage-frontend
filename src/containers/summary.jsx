import React, { Component } from 'react';
import ReactInterval from 'react-interval';

import Summary from '../components/summary';
import ChangesetFilter from '../components/changesetFilter';
import settings from '../settings';
import {
  loadCoverageData,
  pollPendingChangesets,
  sortChangesets,
  sortingMethods,
} from '../utils/data';

const { LOADING } = settings.STRINGS;

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
      errorMessage: '',
      changesets: {},
      changesetsCoverage: {},
      descriptionFilterValue: '',
      pollingEnabled: false, // We don't start polling until we're ready
      timeout: 10000, // How often we poll for csets w/o coverage status
      sortingMethod: sortingMethods.DATE,
    };
    this.onFilterByDescription = this.onFilterByDescription.bind(this);
  }

  async componentDidMount() {
    this.initializeData();
  }

  onFilterByDescription(event) {
    event.preventDefault();
    this.setState({ descriptionFilterValue: event.target.value });
  }

  async initializeData() {
    try {
      const { changesets, changesetsCoverage, summary } = await loadCoverageData();
      this.setState({
        changesets,
        changesetsCoverage,
        pollingEnabled: summary.pending > 0,
      });
    } catch (error) {
      console.error(error);
      this.setState({
        changesets: {},
        changesetsCoverage: {},
        pollingEnabled: false,
        errorMessage: 'We have failed to fetch coverage data.',
      });
    }
  }

  // We poll on an interval for coverage for csets without it
  async pollPending(changesetsCoverage) {
    console.debug('We are going to poll again for coverage data.');
    try {
      const { csetsCoverage, polling } = await pollPendingChangesets(changesetsCoverage);
      this.setState({ changesetsCoverage: csetsCoverage, pollingEnabled: polling });
    } catch (e) {
      this.setState({ pollingEnabled: false });
    }
  }

  render() {
    const {
      changesets,
      changesetsCoverage,
      descriptionFilterValue,
      errorMessage,
      pollingEnabled,
      timeout,
    } = this.state;

    if (errorMessage) {
      return (<div className="error-message">{errorMessage}</div>);
    }

    const sortedChangesets =
      sortChangesets(changesets, changesetsCoverage, this.state.sortingMethod);

    return (
      <div>
        {pollingEnabled && (
          <div>
            <ReactInterval
              timeout={timeout}
              enabled={pollingEnabled}
              callback={() => this.pollPending(changesetsCoverage)}
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
        {sortedChangesets.length > 0 && (
          <Summary
            changesetsCoverage={changesetsCoverage}
            sortedChangesets={sortedChangesets}
          />
        )}
        {(!pollingEnabled &&
          (Object.keys(changesetsCoverage).length > 0)
          && sortedChangesets.length === 0) && (
            <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
              <span>There is currently no coverage data to show. Please </span>
              <a href={`${settings.REPO}/issues/new`} target="_blank">file an issue</a>.
            </p>
          )
        }
        {pollingEnabled &&
          (<h3 className="loading">{LOADING}</h3>)
        }
      </div>
    );
  }
}
