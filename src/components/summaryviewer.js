import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import * as FetchAPI from '../fetch_data';
import dateFromUnixTimestamp from '../utils/date';

const ChangesetInfo = ({ changeset, push, onClick }) => {
  const hideCset = (desc) => {
    if (desc.includes('=merge') || (desc.includes('erge') && desc.includes('to'))) {
      return true;
    }
    return false;
  };
  const { author, node, desc, index, showToggle, pushId } = changeset;
  const { collapsed, linkify, date, summary } = push;
  // XXX: For author remove the email address
  // XXX: For desc display only the first line
  // XXX: linkify bug numbers
  // The tipmost changeset should always be visible
  let changesetClass;
  // XXX: For now do not hide timpost changesets
  if (index !== 0 && hideCset(desc)) {
    changesetClass = 'collapsed_changeset';
  } else {
    changesetClass = (index !== 0 && collapsed) ? 'collapsed_changeset' : 'changeset';
  }
  const toggleText = (collapsed) ? '[Expand]' : '[Collapse]';
  return (
    <tr className={changesetClass}>
      <td className="changeset-date">
        {(date && index === 0) && <span>{dateFromUnixTimestamp(date)}</span>}</td>
      <td className="changeset-author">
        {author.substring(0, 22)}</td>
      <td className="changeset-node-id">
        {(linkify && index !== 0) ?
          <Link to={`/changeset/${node}`}>{node.substring(0, 12)}</Link>
          : <span>{node.substring(0, 12)}</span>}
      </td>
      <td className="changeset-description">
        {desc.substring(0, 40)}</td>
      <td className="changeset-collapse">
        {(showToggle) &&
          <span>{push.numCsets} changesets in push -&nbsp;
            <a href={`#${pushId}`} id={pushId} onClick={onClick}>{toggleText}</a>
          </span>
        }
      </td>
      <td className="push-coverage-summary">
        {(summary && index === 0 && summary.error) &&
          <span>{summary.error}</span>
        }
        {(summary && index === 0 && summary.overall_cur) &&
          <span>{summary.overall_cur}</span>
        }
      </td>
    </tr>
  );
};

const ChangesetsViewer = ({ changesets, pushes, onClick }) => (
  <table>
    <tbody>
      <tr>
        <th>Push date</th>
        <th>Author</th>
        <th>Changeset</th>
        <th>Description</th>
        <th>Collapsed csets</th>
        <th>Coverage summary</th>
      </tr>
      {changesets.map(cset => (
        <ChangesetInfo
          key={cset.node}
          changeset={cset}
          push={pushes[cset.pushId]}
          onClick={onClick}
        />
      ))}
    </tbody>
  </table>
);

const processJsonPushes = (pushes) => {
  const ignore = ({ desc, author }) => {
    if (
      (author.includes('ffxbld')) ||
      (desc.includes('ack out')) ||
      (desc.includes('acked out'))) {
      return true;
    }

    return false;
  };
  // In here we're flattening the data structure
  // We're now going to have an array of changeset
  // and each changeset is going to have the original
  // metadata explicitely declared
  // This improves manipulating the data structure
  const filteredCsets = [];
  const filteredPushes = {};

  Object.keys(pushes).reverse().forEach((id) => {
    const push = pushes[id];
    const csets = push.changesets;
    const lenCsets = csets.length - 1;
    const tipmost = csets[lenCsets];

    if (lenCsets > 1 || !ignore(tipmost)) {
      filteredPushes[id] = {
        date: push.date,
        numCsets: lenCsets,
        tipmost: tipmost.node,
        collapsed: true,
        linkify: false,
      };
      csets.reverse()
        .filter(c => !ignore(c))
        .map((cset, position) => {
          const newCset = {
            index: position,
            pushId: id,
            ...cset,
          };
          if (position === 0 && lenCsets > 1) {
            newCset.showToggle = true;
          }
          filteredCsets.push(newCset);
          return newCset;
        });
    }
  });
  return {
    csets: filteredCsets,
    pushList: filteredPushes,
  };
};

// XXX: For now, we can only make 1 request a time to the backend
// or we will overwhelm it: https://github.com/mozilla-releng/services/issues/632
// Recursively fetching one summary at a time
const getSummaries = async (pushIds, pushes) => {
  // We're expecting the list of pushIds to be sorted from highest to lowest
  // since we grab the pushId from the end.
  // This is because more recent pushes are likely not to have code coverage data.
  const pushId = pushIds.pop();
  if (!pushId) {
    return {};
  }

  const push = pushes[pushId];
  const processedPushes = {};
  processedPushes[pushId] = {
    ...push,
  };

  try {
    console.log(`About to fetch ${pushId} (${push.tipmost})`);
    // XXX: fetch does not support timeouts. I would like to add a 5 second
    // timeout rather than wait Heroku's default 30 second timeout. Specially
    // since we're doing sequential fetches.
    // XXX: Wrap fetch() in a Promise; add a setTimeout and call reject() if
    // it goes off, otherwise resolve with the result of the fetch()
    const res = await FetchAPI.getChangesetCoverage(push.tipmost);
    if (res.status === 202) {
      processedPushes[pushId].summary = {
        error: 'Pending',
      };
    } else if (res.status === 200) {
      const ccSum = await res.json();
      processedPushes[pushId].summary = ccSum;

      if (ccSum.overall_cur) {
        // We have coverage data, thus, adding links to the coverage diff viewer
        processedPushes[pushId].linkify = true;
        processedPushes[pushId].collapsed = false;
      }
    } else {
      processedPushes[pushId].summary = {
        error: res.statusText,
      };
    }
  } catch (e) {
    console.log(e);
    processedPushes[pushId].summary = {
      error: 'Failed to fetch.',
    };
  }

  try {
    const remainingSummaries = await getSummaries(pushIds, pushes);
    return Object.assign(processedPushes, remainingSummaries);
  } catch (e) {
    // Once one fails; let's just stop and return the original list
    return pushes;
  }
};

export default class ChangesetsViewerContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      changesets: [],
      pushes: {},
      errorMessage: '',
    };
  }

  componentDidMount() {
    const { repoName } = this.props;

    FetchAPI.getJsonPushes(repoName)
      .then(response =>
        response.json(),
      ).then(async (text) => {
        const { csets, pushList } = processJsonPushes(text.pushes);

        this.setState({
          changesets: csets,
          pushes: pushList,
        });

        try {
          // Ordered from lowest to higher
          const pushIds = Object.keys(pushList).reverse();
          const newPushes = await getSummaries(pushIds, pushList);
          this.setState({
            pushes: newPushes,
          });
        } catch (e) {
          console.log(e);
        }
      }).catch((error) => {
        console.log(error);
        this.setState({
          changesets: [],
          pushes: {},
          errorMessage: 'We have failed to fetch pushes.',
        });
      });
  }

  toggleRowVisibility(pushId) {
    this.setState((prevState) => {
      const newPushes = [];
      Object.keys(prevState.pushes).forEach((id) => {
        const push = prevState.pushes[id];
        newPushes[id] = {
          ...push,
        };
        if (pushId === id) {
          newPushes[id].collapsed = !push.collapsed;
        }
      });
      return {
        pushes: newPushes,
      };
    });
  }

  render() {
    const { errorMessage, changesets, pushes } = this.state;
    if (errorMessage) {
      return (<div className="errorMessage">{errorMessage}</div>);
    }

    return (
      <ChangesetsViewer
        changesets={changesets}
        pushes={pushes}
        onClick={event => this.toggleRowVisibility(event.target.id)}
      />
    );
  }
}
