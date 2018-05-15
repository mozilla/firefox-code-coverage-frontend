import React, { Component } from 'react';
import ReactInterval from 'react-interval';
import { connect } from 'react-redux';

import Summary from '../components/summary';
import settings from '../settings';
import { mapToArray, extendObject } from '../utils/data';
import { getCoverage } from '../utils/coverage';
import getChangesets from '../utils/hg';
import { saveInCache } from '../utils/localCache';
import * as a from '../actions';

const { INTERNAL_ERROR, LOADING, PENDING } = settings.STRINGS;

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
      pollingEnabled: false, // We don't start polling until we're ready
      errorMessage: '',
      timeout: 10000, // How often we poll for csets w/o coverage status
    };
  }

  async componentDidMount() {
    this.fetchChangesets();
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
      const changesetsCoverage = await getCoverage(changesets);
      const summary = { pending: 0, error: 0 };
      Object.values(changesetsCoverage).forEach((csetCoverage) => {
        if (csetCoverage.summary === PENDING) {
          summary.pending += 1;
        } else if (csetCoverage.summary === INTERNAL_ERROR) {
          summary.error += 1;
        }
      });
      console.debug(`We have ${Object.keys(changesets).length} changesets.`);
      console.debug(`pending: ${summary.pending}`);
      console.debug(`errors: ${summary.error}`);
      this.props.addChangesets(changesets);
      this.props.addChangesetsCoverage(changesetsCoverage);
      this.setState({ pollingEnabled: summary.pending > 0 });
    } catch (error) {
      console.error(error);
      this.props.addChangesets({});
      this.props.addChangesetsCoverage({});
      this.setState({
        pollingEnabled: false,
        errorMessage: 'We have failed to fetch coverage data.',
      });
    }
  }

  // We poll on an interval for coverage for csets without it
  async pollPending(changesetsCoverage) {
    console.debug('We are going to poll again for coverage data.');
    try {
      // Only poll changesets that are still pending
      const onlyPendingChangesets = mapToArray(changesetsCoverage)
        .filter(cov => cov.summary === PENDING);
      const partialCoverage = await getCoverage(onlyPendingChangesets);
      const count = partialCoverage
        .filter(cov => cov.summary === PENDING).length;
      const newCoverage = extendObject(changesetsCoverage, partialCoverage);
      if (count === 0) {
        console.debug('No more polling required.');
        this.setState({ pollingEnabled: false });
      }
      // It is recommended to keep redux functions being pure functions
      saveInCache('coverage', newCoverage);
      this.props.addChangesetsCoverage(newCoverage);
    } catch (e) {
      this.setState({ pollingEnabled: false });
    }
  }

  render() {
    const { pollingEnabled, errorMessage, timeout } = this.state;
    const { changesets, changesetsCoverage } = this.props;

    if (errorMessage) {
      return (<div className="error-message">{errorMessage}</div>);
    }

    const viewableCsetsMap = {};
    if (Object.keys(changesets).length !== 0) {
      Object.keys(changesetsCoverage).forEach((node) => {
        if (changesets[node] && changesetsCoverage[node].show) {
          viewableCsetsMap[node] = changesets[node];
        }
      });
    }

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
        {Object.keys(viewableCsetsMap).length > 0 &&
          <Summary
            changesets={viewableCsetsMap}
            coverage={changesetsCoverage}
          />
        }
        {(!pollingEnabled && Object.keys(viewableCsetsMap) === 0) &&
          <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
            <span>There is currently no coverage data to show. Please </span>
            <a href={`${settings.REPO}/issues/new`} target="_blank">file an issue</a>.
          </p>
        }
        {pollingEnabled &&
          (<h3 className="adding">{LOADING}</h3>)
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
