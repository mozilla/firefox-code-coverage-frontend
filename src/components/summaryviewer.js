import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import * as FetchAPI from '../fetch_data';

const ChangesetInfo = ({ changeset }) => {
  const { author, desc, hidden, linkify, node, summary } = changeset;
  // XXX: For author remove the email address
  // XXX: For desc display only the first line
  // XXX: linkify bug numbers
  return (
    <tr className={(hidden) ? 'hidden_changeset' : 'changeset'}>
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
        {(summary && summary.error) &&
          <span>{summary.error}</span>
        }
        {(summary && summary.overall_cur) &&
          <span>{summary.overall_cur}</span>
        }
      </td>
    </tr>
  );
};

const ChangesetsViewer = ({ changesets, onClick }) => (
  <table>
    <tbody>
      <tr>
        <th>Author</th>
        <th>Changeset</th>
        <th>Description</th>
        <th>Coverage summary</th>
      </tr>
      {changesets.map(cset => ((cset) &&
        <ChangesetInfo
          key={cset.node}
          changeset={cset}
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
      filteredPushes[id] = {
        date: push.date,
      };
      csets.map((cset) => {
        const newCset = {
          pushId: id,
          hidden: true,
          linkify: false,
          ...cset,
        };
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

const csetWithCcovData = async (cset) => {
  const newCset = Object.assign({}, cset);
  // XXX: fetch does not support timeouts. I would like to add a 5 second
  // timeout rather than wait Heroku's default 30 second timeout. Specially
  // since we're doing sequential fetches.
  // XXX: Wrap fetch() in a Promise; add a setTimeout and call reject() if
  // it goes off, otherwise resolve with the result of the fetch()
  const res = await FetchAPI.getChangesetCoverage(cset.node);
  if (res.status === 202) {
    // XXX: We should retry few times before giving up
    newCset.summary = { error: 'Pending' };
  } else if (res.status === 200) {
    const ccSum = await res.json();
    newCset.summary = ccSum;

    // XXX: Document in which cases we would not have overall_cur
    if (ccSum.overall_cur) {
      // We have coverage data, thus, adding links to the coverage diff viewer
      // and unhiding the csets associated to this push
      newCset.linkify = true;
      newCset.hidden = false;
    }
  } else {
    newCset.summary = { error: res.statusText };
  }
  return newCset;
};

// Return list of csets with coverage data if available
const addSummariesToCsets = async (csets) => {
  console.log(csets.length);
  let newCsets = [];
  try {
    const firstCset = csets[0];
    console.log(`About to fetch ${firstCset.pushId} (${firstCset.node})`);
    const newCset = await csetWithCcovData(firstCset);
    newCsets = [newCset];
    if (newCset.linkify) {
      newCsets = newCsets.concat(await Promise.all(csets
        .filter(cset =>
          cset.node !== firstCset.node)
        .map(async cset =>
          (csetWithCcovData(cset)))));
    }
  } catch (e) {
    console.log(e);
    newCsets = csets;
  }
  return newCsets;
};

// Return a new object of csets but with their coverage data.
const csetsWithCoverage = async (csets, pushes) => {
  try {
    return (
      await Promise.all(
        Object
          .keys(pushes)
          .map(pushId => (
            addSummariesToCsets(csets.filter(c => c.pushId === pushId))
          ))))
      .reduce((list, changesets) =>
        list.concat(changesets), []);
  } catch (e) {
    console.log(e);
    return csets;
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

  async componentDidMount() {
    const { repoName } = this.props;
    this.fetchPushes(repoName);
  }

  async fetchPushes(repoName) {
    try {
      const text = await (await FetchAPI.getJsonPushes(repoName)).json();
      const { csets, pushList } = processJsonPushes(text.pushes);
      const changesets = await csetsWithCoverage(csets, pushList);
      this.setState({
        changesets,
        pushes: pushList,
      });
    } catch (error) {
      console.log(error);
      this.setState({
        changesets: [],
        pushes: {},
        errorMessage: 'We have failed to fetch coverage data.',
      });
    }
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
