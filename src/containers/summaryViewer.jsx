import React, { Component } from 'react';
import ReactInterval from 'react-interval';

import SummaryViewer from '../components/summaryViewer';
import settings from '../settings';
import { arrayToMap, csetWithCcovData, mapToArray } from '../utils/data';
import getChangesets from '../utils/hg';

const { LOADING, INTERNAL_ERROR, PENDING } = settings.STRINGS;

const PollingStatus = ({ pollingEnabled }) => (
  (pollingEnabled) ? (
    <div className="polling-status"> {pollingEnabled}
      Some changesets are still being processed and we are actively
      polling them until we get a result.
    </div>) : (null)
);

export default class ChangesetsViewerContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      changesets: {},
      pollingEnabled: false, // We don't start polling until we're ready
      errorMessage: '',
      hideCsetsWithNoCoverage: true,
      timeout: 30000, // How often we poll for csets w/o coverage status
    };
  }

  async componentDidMount() {
    this.fetchChangesets(this.props.repoName, this.state.hideCsetsWithNoCoverage);
  }

  async fetchChangesets(repoName, hideCsetsWithNoCoverage) {
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
      const csetsNoCoverage = await getChangesets(repoName, hideCsetsWithNoCoverage);
      const csets = await Promise.all(csetsNoCoverage.map(async cset =>
        csetWithCcovData(cset)));
      const summary = { pending: 0, error: 0 };
      csets.forEach((cset) => {
        if (cset.summary === PENDING) {
          summary.pending += 1;
        } else if (cset.summary === INTERNAL_ERROR) {
          summary.error += 1;
        }
      });
      console.log(`We have ${csets.length} changesets.`);
      console.log(`pending: ${summary.pending}`);
      console.log(`errors: ${summary.error}`);
      this.setState({
        changesets: arrayToMap(csets),
        pollingEnabled: summary.pending > 0,
      });
    } catch (error) {
      console.log(error);
      this.setState({
        changesets: {},
        pollingEnabled: false,
        errorMessage: 'We have failed to fetch coverage data.',
      });
    }
  }

  // We poll on an interval for coverage for csets without it
  async pollPending(changesets) {
    console.log('Determine if we need to poll csets w/o coverage data...');
    try {
      let newCsets = mapToArray(changesets);
      newCsets = await Promise.all(newCsets.map((c) => {
        if (c.summary !== PENDING) {
          return c;
        }
        return csetWithCcovData(c);
      }));
      const count = newCsets.filter(c => c.summary === PENDING).length;
      const csetsMap = arrayToMap(newCsets);
      if (count === 0) {
        console.log('No more polling required.');
        this.setState({ changesets: csetsMap, pollingEnabled: false });
      } else {
        this.setState({ changesets: csetsMap });
      }
    } catch (e) {
      this.setState({ pollingEnabled: false });
    }
  }

  render() {
    const {
      changesets, pollingEnabled, errorMessage, timeout,
    } = this.state;

    if (errorMessage) {
      return (<div className="error-message">{errorMessage}</div>);
    }
    const viewableCsets = mapToArray(changesets).filter(c => c.hidden === false);

    return (
      <div>
        {pollingEnabled && (
          <div>
            <ReactInterval
              timeout={timeout}
              enabled={pollingEnabled}
              callback={() => this.pollPending(changesets)}
            />
            <PollingStatus
              pollingEnabled={pollingEnabled}
            />
          </div>
        )}
        {viewableCsets.length > 0 &&
          <SummaryViewer changesets={viewableCsets} />
        }
        {(!pollingEnabled && Object.keys(changesets).length > 0) &&
          <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
            <span>There is currently no coverage data to show. Please </span>
            <a href={`${settings.REPO}/issues/new`} target="_blank">file an issue</a>.
          </p>
        }
        {(Object.keys(changesets).length === 0) &&
          (<h3 className="loading">{LOADING}</h3>)
        }
      </div>
    );
  }
}
