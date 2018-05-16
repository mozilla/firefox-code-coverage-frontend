import React, { Component } from 'react';
import ReactInterval from 'react-interval';
import { connect } from 'react-redux';

import Summary from '../components/summary';
import settings from '../settings';
import { loadCoverageData, pollPendingChangesets } from '../utils/data';
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
      pollingEnabled: false, // We don't start polling until we're ready
      errorMessage: '',
      timeout: 10000, // How often we poll for csets w/o coverage status
    };
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
