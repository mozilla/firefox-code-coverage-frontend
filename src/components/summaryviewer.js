import { Link } from 'react-router-dom';
import React, { Component } from 'react';
import ReactInterval from 'react-interval';

import * as FetchAPI from '../fetch_data';

const PENDING = 'Pending';

const ChangesetInfo = ({ changeset }) => {
  const { author, desc, hidden, linkify, node, summary } = changeset;
  // XXX: For author remove the email address
  // XXX: For desc display only the first line
  // XXX: linkify bug numbers
  return (
    <tr className={(hidden) ? 'hidden_changeset' : 'changeset'}>
      <td className="changeset-author">{author.substring(0, 22)}</td>
      <td className="changeset-node-id">{(linkify) ?
        <Link to={`/changeset/${node}`}>{node.substring(0, 12)}</Link>
        : <span>{node.substring(0, 12)}</span>}
      </td>
      <td className="changeset-description">{desc.substring(0, 40)}</td>
      <td className="changeset-info">{summary}</td>
    </tr>
  );
};

const ChangesetsViewer = ({ changesets }) => (
  <table>
    <tbody>
      <tr>
        <th>Author</th>
        <th>Changeset</th>
        <th>Description</th>
        <th>Coverage summary</th>
      </tr>
      {Object.keys(changesets).map(node => (
        <ChangesetInfo
          key={node}
          changeset={changesets[node]}
        />
      ))}
    </tbody>
  </table>
);

const PollingStatus = ({ pollingEnabled }) => (
  (pollingEnabled) ?
    (<div className="polling-status"> {pollingEnabled}
      Some changesets are still being processed and we are actively
      polling them until we get a result.
    </div>) : (null)
);

const arrayToMap = (csets) => {
  const newCsets = {};
  csets.forEach((cset) => {
    newCsets[cset.node] = cset;
  });
  return newCsets;
};

const mapToArray = csets => (
  Object.keys(csets).map(node => csets[node])
);

const csetWithCcovData = async (cset) => {
  if (!cset.node) {
    throw Error(`No node for cset: ${cset}`);
  }
  const newCset = Object.assign({}, cset);
  // XXX: fetch does not support timeouts. I would like to add a 5 second
  // timeout rather than wait Heroku's default 30 second timeout. Specially
  // since we're doing sequential fetches.
  // XXX: Wrap fetch() in a Promise; add a setTimeout and call reject() if
  // it goes off, otherwise resolve with the result of the fetch()
  try {
    const res = await FetchAPI.getChangesetCoverage(cset.node);
    if (res.status === 202) {
      // This is the only case when we poll again
      newCset.summary = PENDING;
    } else if (res.status === 200) {
      const ccSum = await res.json();

      // XXX: Document in which cases we would not have overall_cur
      if (ccSum.overall_cur) {
        // We have coverage data, thus, adding links to the coverage diff viewer
        // and unhiding the csets
        newCset.linkify = true;
        newCset.hidden = false;
        newCset.summary = ccSum.overall_cur;
      } else {
        console.error(`No overall_cur: ${ccSum}`);
      }
    } else if (res.status === 500) {
      newCset.summary = res.statusText;
    } else {
      console.log(`Unexpected HTTP code (${res.status}) for ${newCset}`);
    }
    return newCset;
  } catch (e) {
    console.log(`Failed to fetch data for ${cset}`);
    return cset;
  }
};

// Return list of changesets
const pushesToCsets = async (pushes, hiddenDefault) => {
  const ignore = ({ desc, author }) => {
    if (
      (author.includes('ffxbld')) ||
      (desc.includes('a=merge') && desc.includes('r=merge')) ||
      (desc.includes('erge') && (desc.includes('to'))) ||
      (desc.includes('ack out')) ||
      (desc.includes('acked out'))) {
      return true;
    }

    return false;
  };
  const filteredCsets = [];
  Object.keys(pushes).reverse().forEach((id) => {
    // Re-order csets and filter out those we don't want
    const csets = pushes[id].changesets.reverse().filter(c => !ignore(c));
    const lenCsets = csets.length;

    if (lenCsets >= 1) {
      csets.forEach((cset) => {
        const newCset = {
          pushId: id,
          hidden: hiddenDefault,
          linkify: false,
          ...cset,
        };
        filteredCsets.push(newCset);
      });
    }
  });
  // Separating into two blocks makes it easier to code
  const newCsets = await Promise.all(filteredCsets
    .map(async cset => csetWithCcovData(cset)));
  return newCsets;
};

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
    const { repoName } = this.props;
    const { hideCsetsWithNoCoverage } = this.state;
    this.fetchPushes(repoName, hideCsetsWithNoCoverage);
  }

  async fetchPushes(repoName, hideCsetsWithNoCoverage) {
    try {
      // Fetch last 10 pushes
      const text = await (await FetchAPI.getJsonPushes(repoName)).json();
      const csets = await pushesToCsets(text.pushes, hideCsetsWithNoCoverage);
      console.log(`We have ${csets.length} changesets.`);
      this.setState({ changesets: arrayToMap(csets), pollingEnabled: true });
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
    console.log('Polling for csets w/o coverage data...');
    try {
      let newCsets = mapToArray(changesets);
      newCsets = await Promise.all(
        newCsets.map((c) => {
          if (c.summary !== PENDING) {
            return c;
          }
          return csetWithCcovData(c);
        }));
      const count = newCsets.filter(c => c.summary === PENDING).length;
      const csetsMap = arrayToMap(newCsets);
      if (count === 0) {
        this.setState({ changesets: csetsMap, pollingEnabled: false });
      } else {
        this.setState({ changesets: csetsMap });
      }
    } catch (e) {
      this.setState({ pollingEnabled: false });
    }
  }

  render() {
    const { changesets, pollingEnabled, errorMessage, timeout } = this.state;
    if (errorMessage) {
      return (<div className="errorMessage">{errorMessage}</div>);
    }

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
        <ChangesetsViewer
          changesets={changesets}
        />
      </div>
    );
  }
}
