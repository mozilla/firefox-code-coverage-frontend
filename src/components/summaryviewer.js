import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import * as FetchAPI from '../fetch_data';

const ChangesetInfo = ({ changeset, push }) => {
  const { author, node, desc, showInfo } = changeset;
  const { linkify, summary } = push;
  // XXX: For author remove the email address
  // XXX: For desc display only the first line
  // XXX: linkify bug numbers
  return (
    <tr className="changeset">
      <td className="changeset-author">
        {author.substring(0, 22)}</td>
      <td className="changeset-node-id">
        {(linkify) ?
          <Link to={`/changeset/${node}`}>{node.substring(0, 12)}</Link>
          : <span>{node.substring(0, 12)}</span>}
      </td>
      <td className="changeset-description">
        {desc.substring(0, 40)}</td>
      <td className="changeset-info">
        {(summary && showInfo && summary.error) &&
          <span>{summary.error}</span>
        }
        {(summary && showInfo && summary.overall_cur) &&
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
        <th>Author</th>
        <th>Changeset</th>
        <th>Description</th>
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
      (desc.includes('a=merge') && desc.includes('r=merge')) ||
      (desc.includes('erge') && (desc.includes('to'))) ||
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

  // Populate filteredPushes and filteredChangesets
  Object.keys(pushes).reverse().forEach((id) => {
    const push = pushes[id];
    // Re-order csets and filter out those we don't want
    const csets = push.changesets.reverse().filter(c => !ignore(c));
    const lenCsets = csets.length - 1;

    if (lenCsets >= 1) {
      // The firstcset changeset expected not to be a merge one
      // Using firstcset terminology instead of tipmost to clarify
      // that it does not necessarily have to be the original tipmost
      // of a push
      const firstcset = csets[lenCsets];
      filteredPushes[id] = {
        date: push.date,
        numCsets: lenCsets,
        firstcset: firstcset.node,
        linkify: false,
      };
      csets.map((cset, position) => {
        const newCset = {
          pushId: id,
          ...cset,
        };
        if (position === 0 && lenCsets > 1) {
          newCset.showInfo = true;
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
    console.log(`About to fetch ${pushId} (${push.firstcset})`);
    // XXX: fetch does not support timeouts. I would like to add a 5 second
    // timeout rather than wait Heroku's default 30 second timeout. Specially
    // since we're doing sequential fetches.
    // XXX: Wrap fetch() in a Promise; add a setTimeout and call reject() if
    // it goes off, otherwise resolve with the result of the fetch()
    const res = await FetchAPI.getChangesetCoverage(push.firstcset);
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

  render() {
    const { errorMessage, changesets, pushes } = this.state;
    if (errorMessage) {
      return (<div className="errorMessage">{errorMessage}</div>);
    }

    return (
      <ChangesetsViewer
        changesets={changesets}
        pushes={pushes}
      />
    );
  }
}
