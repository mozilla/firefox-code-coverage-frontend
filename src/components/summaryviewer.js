import { Link } from 'react-router-dom';
import React, { Component } from 'react';
import ReactInterval from 'react-interval';

import * as FetchAPI from '../utils/fetch_data';
import { PENDING } from '../settings';
import { arrayToMap, csetWithCcovData, mapToArray } from '../utils/data';

const ChangesetInfo = ({ changeset }) => {
  const { author, desc, hidden, bzUrl, linkify, node, summary, summaryClassName } = changeset;
  const hgLink = changeset.coverage.diffMeta(node).hgRev;
  // XXX: For author remove the email address
  // XXX: For desc display only the first line
  return (
    <tr className={(hidden) ? 'hidden-changeset' : 'changeset'}>
      <td className="changeset-author">{author.substring(0, 22)}</td>
      <td className="changeset-hg">
        <a href={changeset.coverage.diffMeta(node).hgRev} target="_blank">
          {node.substring(0, 12)}
        </a>
      </td>
      <td className="changeset-description">
        {(bzUrl) ?
          <a href={bzUrl} target="_blank">{desc.substring(0, 40)}</a>
          : desc.substring(0, 40) }
      </td>
      <td className={`changeset-summary ${summaryClassName}`}>{summary}</td>
      <td className="changeset-node-id">{(linkify) ?
        <Link to={`/changeset/${node}`}>{node.substring(0, 12)}</Link>
        : <span>{node.substring(0, 12)}</span>}
      </td>
    </tr>
  );
};

const ChangesetsViewer = ({ changesets }) => (
  (changesets.length > 0) ?
    (<table className="changeset-viewer">
      <tbody>
        <tr>
          <th>Author</th>
          <th>Changeset</th>
          <th>Description</th>
          <th>Coverage summary</th>
          <th>Coverage Diff</th>
        </tr>
        {Object.keys(changesets).map(node => (
          <ChangesetInfo
            key={node}
            changeset={changesets[node]}
          />
        ))}
      </tbody>
    </table>) : null
);

const PollingStatus = ({ pollingEnabled }) => (
  (pollingEnabled) ?
    (<div className="polling-status"> {pollingEnabled}
      Some changesets are still being processed and we are actively
      polling them until we get a result.
    </div>) : (null)
);

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
        const bzUrlRegex = /^bug\s*(\d*)/i;
        const bzUrlMatch = bzUrlRegex.exec(cset.desc);
        const bzUrl = bzUrlMatch ? (`http://bugzilla.mozilla.org/show_bug.cgi?id=${bzUrlMatch[1]}`) : null;
        const newCset = {
          pushId: id,
          hidden: hiddenDefault,
          bzUrl,
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
      this.setState({
        changesets: arrayToMap(csets),
        pollingEnabled: csets.filter(c => c.summary === PENDING).length > 0,
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
    const { changesets, pollingEnabled, errorMessage, timeout } = this.state;
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
        <ChangesetsViewer
          changesets={viewableCsets}
        />
      </div>
    );
  }
}
