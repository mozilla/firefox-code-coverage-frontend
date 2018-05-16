import React, { Component } from 'react';
import ReactInterval from 'react-interval';
import { connect } from 'react-redux';

import Summary from '../components/summary';
import settings from '../settings';
import {
  loadCoverageData,
  pollPendingChangesets,
  sortChangesets,
  sortingMethods,
} from '../utils/data';
import * as a from '../actions';

const { LOADING } = settings.STRINGS;

const PollingStatus = ({ pollingEnabled }) => (
  (pollingEnabled) ? (
    <div className="polling-status"> {pollingEnabled}
      Some changesets are still being processed and we are actively
      polling them until we get a result.
    </div>) : (null)
);

class SummaryContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMessage: '',
      pollingEnabled: false, // We don't start polling until we're ready
      timeout: 10000, // How often we poll for csets w/o coverage status
      sortingMethod: sortingMethods.DATE,
    };
    this.sortByCoverage = this.sortByCoverage.bind(this);
  }

  async componentDidMount() {
    this.loadCoverageData();
  }

  async loadCoverageData() {
    try {
      const { changesets, changesetsCoverage, summary } = await loadCoverageData();
      this.props.addChangesets(changesets);
      this.props.addChangesetsCoverage(changesetsCoverage);
      this.setState({ pollingEnabled: summary.pending > 0 });
    } catch (error) {
      console.error(error);
      this.setState({
        pollingEnabled: false,
        errorMessage: 'We have failed to fetch coverage data.',
      });
    }
  }

  // We poll on an interval for coverage for csets without it
  async pollPending(changesetsCoverage) {
    try {
      const { csetsCoverage, polling } = await pollPendingChangesets(changesetsCoverage);
      this.props.addChangesetsCoverage(csetsCoverage);
      this.setState({ pollingEnabled: polling });
    } catch (e) {
      this.setState({ pollingEnabled: false });
    }
  }

  sortByCoverage() {
    this.setState({ sortingMethod: sortingMethods.COVERAGE });
  }

  render() {
    const { errorMessage, pollingEnabled, timeout } = this.state;
    const { changesets, changesetsCoverage } = this.props;

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
        {sortedChangesets.length > 0 && (
          <Summary
            changesets={changesets}
            changesetsCoverage={changesetsCoverage}
            sortedChangesets={sortedChangesets}
            onSortByCoverage={this.sortByCoverage}
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

const mapStateToProps = ({ changesets, changesetsCoverage }) => ({
  changesets,
  changesetsCoverage,
});

const mapDispatchToProps = dispatch => ({
  addChangesets: data => dispatch(a.addChangesets(data)),
  addChangesetsCoverage: data => dispatch(a.addChangesetsCoverage(data)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SummaryContainer);
