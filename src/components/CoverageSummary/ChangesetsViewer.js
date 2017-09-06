import React, { Component } from 'react';

import * as FetchAPI from '../../fetch_data'

function ChangesetInfo({ index, author, node, description, hidden }) {
  // XXX: For author remove the email address
  // XXX: For desc display only the first line
  // XXX: linkify bug numbers
  return (
    <tr className='changeset'>
      <td className='tip-changeset-author'>
        {author.substring(0, 16)}</td>
      <td className='tip-changeset-node-id'>
        {node.substring(0, 12)}</td>
      <td className='tip-changeset-description'>
        {description.substring(0, 30)}</td>
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
            </tr>
            {Object.keys(this.state.pushes).reverse().filter(pushId => {
              const csets = this.state.pushes[pushId].changesets
              if (csets[csets.length - 1].author !== 'ffxbld') {
                return this.state.pushes[pushId]
              }
            }).map(pushId => {
              const csets = this.state.pushes[pushId].changesets
              return csets.map((cset, index) => {
                const { author, node, desc } = csets[index]
                return (
                  <ChangesetInfo
                    key={node}
                    index={index}
                    author={author}
                    node={node}
                    description={desc}
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
