import React, { Component } from 'react';
import { Link } from 'react-router-dom'

import * as FetchAPI from '../../fetch_data'

function ChangesetInfo({ index, push, pushId, visibility, onClick }) {
  const { author, node, desc } = push.changesets[index]
  // XXX: For author remove the email address
  // XXX: For desc display only the first line
  // XXX: linkify bug numbers
  // The tipmost changeset should always be visible
  const changesetClass = (index === 0 || visibility) ? 'changeset': 'hidden_changeset'
  const toggleText = (visibility) ? '[Collapse]' : '[Expand]'
  const numChangesets = push.changesets.length - 1
  return (
    <tr className={changesetClass}>
      <td className='changeset-author'>
        {author.substring(0, 16)}</td>
      <td className='changeset-node-id'>
        <Link to={`/changeset/${node}`}>
          {node.substring(0, 12)}
        </Link>
      </td>
      <td className='changeset-description'>
        {desc.substring(0, 30)}</td>
      <td className='changeset-collapse'>
        {(index === 0 && numChangesets > 0) ?
          <span>{numChangesets} changesets in push -&nbsp;
            <a href='#' id={pushId} onClick={onClick}>{toggleText}</a></span>
            :
          <span></span>
        }
      </td>
    </tr>
  )
}

export class ChangesetsViewer extends Component {
  state = {
    'pushes': {},
    'errorMessage': '',
    'hiddenChangesets': {}
  }

  componentDidMount() {
    // XXX: If the fetched data is the same as in the state do
    //      no call setSate to prevent one more render
    FetchAPI.getJsonPushes(this.props.repoName).then(response =>
      response.json()
    ).then(text => {
      let hiddenChangesets = {}
      Object.keys(text.pushes).forEach(pushId => {
        hiddenChangesets[pushId] = false
      })
      this.setState({
        pushes: text.pushes,
        hiddenChangesets: hiddenChangesets
      })}
    ).catch(error => {
      this.setState({
        pushes: [],
        errorMessage: 'We have failed to fetch pushes. See the log console for more details'
      })
      console.error(error)
    })
  }

  toggleRowVisibility(pushId) {
    this.setState((prevState, props) => {
      let newHiddenChangesets = {}
      Object.assign(newHiddenChangesets, prevState.hiddenChangesets)
      newHiddenChangesets[pushId] = ! newHiddenChangesets[pushId]
      return {
        hiddenChangesets: newHiddenChangesets
      }
    })
  }

  render() {
    if (this.state.errorMessage) {
      return (<div className='errorMessage'>{this.state.errorMessage}</div>)
    } else {
      return (
        <table>
          <tbody>
            <tr>
              <th>Author</th>
              <th>Changeset</th>
              <th>Description</th>
              <th>Collapsed csets</th>
            </tr>
            {Object.keys(this.state.pushes).reverse().filter(pushId => {
              const csets = this.state.pushes[pushId].changesets
              if (csets[csets.length - 1].author !== 'ffxbld') {
                return this.state.pushes[pushId]
              }
            }).map(pushId => {
              const push = this.state.pushes[pushId]
              return push.changesets.map((cset, index) => {
                return (
                  <ChangesetInfo
                    key={push.node}
                    index={index}
                    push={push}
                    pushId={pushId}
                    visibility={this.state.hiddenChangesets[pushId]}
                    onClick={(event) => this.toggleRowVisibility(event.target.id)}
                  />
                )
              })
            })}
          </tbody>
        </table>
      )
    }
  }
}
