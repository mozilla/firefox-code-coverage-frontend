import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import * as FetchAPI from '../fetch_data';
import dateFromUnixTimestamp from '../utils/date';

const ChangesetInfo = ({ changeset, push, onClick }) => {
  const { author, node, desc, index, showToggle, pushId } = changeset;
  const { hidden, linkify, date } = push;
  // XXX: For author remove the email address
  // XXX: For desc display only the first line
  // XXX: linkify bug numbers
  // The tipmost changeset should always be visible
  const changesetClass = (index !== 0 && hidden) ? 'hidden_changeset' : 'changeset';
  const toggleText = (hidden) ? '[Expand]' : '[Collapse]';
  return (
    <tr className={changesetClass}>
      <td className="changeset-date">
        {(date && index === 0) && <span>{dateFromUnixTimestamp(date)}</span>}</td>
      <td className="changeset-author">
        {author.substring(0, 22)}</td>
      <td className="changeset-node-id">
        {(linkify) ?
          <Link to={`/changeset/${node}`}>{node.substring(0, 12)}</Link>
          : <span>{node.substring(0, 12)}</span>}
      </td>
      <td className="changeset-description">
        {desc.substring(0, 40)}</td>
      <td className="changeset-collapse">
        {(showToggle) &&
          <span>{push.numCsets} changesets in push -&nbsp;
            <a href="#" id={pushId} onClick={onClick}>{toggleText}</a>
          </span>
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
      </tr>
      {changesets.map(cset => (
        <ChangesetInfo
          key={cset.node}
          changeset={cset}
          push={pushes[cset.pushId]}
          onClick={onClick} />
      ))}
    </tbody>
  </table>
);

export default class ChangesetsViewerContainer extends Component {
  state = {
    changesets: [],
    pushes: {},
    errorMessage: ''
  }

  componentDidMount() {
    const { repoName } = this.props;
    const ignore = (cset) => {
      if ((cset.author.search('ffxbld') === -1) &&
         (cset.desc.search('ack out') === -1) &&
         (cset.desc.search('acked out') === -1)) {
        return false;
      }

      return true;
    };

    FetchAPI.getJsonPushes(repoName).then(response =>
      response.json()
    ).then((text) => {
      // In here we're flattening the data structure
      // We're now going to have an array of changeset
      // and each changeset is going to have the original
      // metadata explicitely declared
      // This improves manipulating the data structure
      const filteredCsets = [];
      const filteredPushes = {};
      Object.keys(text.pushes).reverse().forEach((id) => {
        const push = text.pushes[id];
        const csets = push.changesets;
        const lenCsets = csets.length - 1;
        const tipmost = csets[lenCsets];

        if (!ignore(tipmost)) {
          filteredPushes[id] = {
            date: push.date,
            numCsets: lenCsets,
            tipmost: tipmost.node,
            hidden: false,
            linkify: true
          };
          csets.reverse().filter(c => !ignore(c)).map((cset, position) => {
            const newCset = {
              index: position,
              pushId: id,
              ...cset
            };
            if (position === 0 && lenCsets > 1) {
              newCset.showToggle = true;
            }
            filteredCsets.push(newCset);
          });
        }
      });
      this.setState({
        changesets: filteredCsets,
        pushes: filteredPushes
      });
    }).catch((error) => {
      console.log(error);
      this.setState({
        changesets: [],
        pushes: {},
        errorMessage: 'We have failed to fetch pushes.'
      });
    });
  }

  toggleRowVisibility(pushId) {
    this.setState((prevState) => {
      const newPushes = [];
      Object.keys(prevState.pushes).forEach((id) => {
        const push = prevState.pushes[id];
        newPushes[id] = {
          ...push
        };
        if (pushId === id) {
          newPushes[id].hidden = !push[id];
        }
      });
      return {
        pushes: newPushes
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
        onClick={event => this.toggleRowVisibility(event.target.id)} />
    );
  }
}
