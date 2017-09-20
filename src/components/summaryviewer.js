import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import * as FetchAPI from '../fetch_data';

const ChangesetInfo = ({ index, push, pushId, visibility, onClick }) => {
  const { author, node, desc } = push.changesets[index];
  // XXX: For author remove the email address
  // XXX: For desc display only the first line
  // XXX: linkify bug numbers
  // The tipmost changeset should always be visible
  const changesetClass = (index === 0 || visibility) ? 'changeset' : 'hidden_changeset';
  const toggleText = (visibility) ? '[Collapse]' : '[Expand]';
  const numChangesets = push.changesets.length - 1;
  return (
    <tr className={changesetClass}>
      <td className="changeset-author">
        {author.substring(0, 16)}</td>
      <td className="changeset-node-id">
        <Link to={`/changeset/${node}`}>
          {node.substring(0, 12)}
        </Link>
      </td>
      <td className="changeset-description">
        {desc.substring(0, 30)}</td>
      <td className="changeset-collapse">
        {(index === 0 && numChangesets > 0) ?
          <span>{numChangesets} changesets in push -&nbsp;
            <a href="#" id={pushId} onClick={onClick}>{toggleText}</a>
          </span> : <span></span>
        }
      </td>
    </tr>
  );
};

const ChangesetsViewer = ({ pushes, hiddenChangesets, onClick }) => (
  <table>
    <tbody>
      <tr>
        <th>Author</th>
        <th>Changeset</th>
        <th>Description</th>
        <th>Collapsed csets</th>
      </tr>
      {Object.keys(pushes).reverse().map((pushId) => {
        const push = pushes[pushId];
        return push.changesets.map((cset, index) => (
          <ChangesetInfo
            key={push.node}
            index={index}
            push={push}
            pushId={pushId}
            visibility={hiddenChangesets[pushId]}
            onClick={onClick} />
        ));
      })}
    </tbody>
  </table>
);

export default class ChangesetsViewerContainer extends Component {
  state = {
    pushes: {},
    errorMessage: '',
    hiddenChangesets: {}
  }

  componentDidMount() {
    const { repoName } = this.props;
    // XXX: If the fetched data is the same as in the state do
    //      no call setSate to prevent one more render
    FetchAPI.getJsonPushes(repoName).then(response =>
      response.json()
    ).then((text) => {
      const hidden = {};
      const hgPushes = {};
      Object.keys(text.pushes).forEach((pushId) => {
        const csets = text.pushes[pushId].changesets;
        const tipCset = csets[csets.length - 1];

        if ((tipCset.author !== 'ffxbld') &&
           (tipCset.desc.search('ack out') === -1) &&
           (tipCset.desc.search('acked out') === -1)) {
          hidden[pushId] = true;
          hgPushes[pushId] = text.pushes[pushId];
        }
      });
      this.setState({
        hiddenChangesets: hidden,
        pushes: hgPushes
      });
    }).catch((error) => {
      console.log(error);
      this.setState({
        pushes: [],
        errorMessage: 'We have failed to fetch pushes.'
      });
    });
  }

  toggleRowVisibility(pushId) {
    this.setState((prevState) => {
      const newHiddenChangesets = {};
      Object.assign(newHiddenChangesets, prevState.hiddenChangesets);
      newHiddenChangesets[pushId] = !newHiddenChangesets[pushId];
      return {
        hiddenChangesets: newHiddenChangesets
      };
    });
  }

  render() {
    const { errorMessage, pushes, hiddenChangesets } = this.state;
    if (errorMessage) {
      return (<div className="errorMessage">{errorMessage}</div>);
    }

    return (
      <ChangesetsViewer
        pushes={pushes}
        hiddenChangesets={hiddenChangesets}
        onClick={event => this.toggleRowVisibility(event.target.id)} />
    );
  }
}
