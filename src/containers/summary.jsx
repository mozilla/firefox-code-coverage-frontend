import React, { Component } from 'react';
import ReactInterval from 'react-interval';
import { connect } from 'react-redux';

import Summary from '../components/summary';
import ChangesetFilter from '../components/changesetFilter';
import GenericErrorMessage from '../components/genericErrorMessage';
import settings from '../settings';
import { pollPendingChangesets } from '../utils/coverage';
import { filterChangesets, loadCoverageData } from '../utils/data';
import { saveInCache } from '../utils/localCache';
import * as a from '../actions';

const { LOADING } = settings.STRINGS;

const PollingStatus = ({ pollingEnabled }) => (
  (pollingEnabled) ? (
    <div className="polling-status"> {pollingEnabled}
      Some changesets are still being processed and we are actively
      polling them until we get a result.
    </div>) : (null)
);

const queryIfAnyDataToDisplay = (changesets, changesetsCoverage) => (
  Object.keys(changesets)
    .filter(node =>
      changesetsCoverage[node] && changesetsCoverage[node].show,
    ).length > 0
);

class SummaryContainer extends Component {
  constructor(props) {
    super(props);
    this.onFilterByDescription = this.onFilterByDescription.bind(this);
  }

  state = {
    descriptionFilterValue: '',
    doneFirstLoad: false,
    errorMessage: '',
    pollingEnabled: false, // We don't start polling until we're ready
    timeout: 10000, // How often we poll for csets w/o coverage status
  };

  async componentDidMount() {
    this.initializeData();
  }

  onFilterByDescription(event) {
    event.preventDefault();
    this.setState({ descriptionFilterValue: event.target.value });
  }

  async initializeData() {
    try {
      // This will either fetch the data or grab it from the cache
      const { changesets, changesetsCoverage, summary } = await loadCoverageData();
      this.props.addChangesets(changesets);
      this.props.addChangesetsCoverage(changesetsCoverage);
      this.setState({
        doneFirstLoad: true,
        pollingEnabled: summary.pending > 0,
      });
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
  async pollPending(coverage) {
    try {
      const { changesetsCoverage, pollingEnabled } = await pollPendingChangesets(coverage);
      this.setState({ changesetsCoverage, pollingEnabled });
      // It is recommended to keep redux functions being pure functions
      saveInCache('coverage', changesetsCoverage);
      this.props.addChangesetsCoverage(changesetsCoverage);
    } catch (e) {
      this.setState({ pollingEnabled: false });
    }
  }

  render() {
    const {
      descriptionFilterValue,
      doneFirstLoad,
      errorMessage,
      pollingEnabled,
      timeout,
    } = this.state;
    const { changesets, changesetsCoverage } = this.props;

    if (errorMessage) {
      return (<div className="error-message">{errorMessage}</div>);
    }

    const someDataToShow = queryIfAnyDataToDisplay(changesets, changesetsCoverage);
    const filteredChangesets = filterChangesets(changesets, descriptionFilterValue);

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
        {someDataToShow &&
          <div>
            <ChangesetFilter
              value={descriptionFilterValue}
              onChange={this.onFilterByDescription}
            />
            <Summary
              changesets={filteredChangesets}
              changesetsCoverage={changesetsCoverage}
            />
          </div>
        }
        {!someDataToShow && !pollingEnabled && doneFirstLoad && (
          <GenericErrorMessage />
        )}
        {!someDataToShow && !pollingEnabled &&
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
