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
    'error_message': '',
    'hidden_changesets': {}
  }

  componentDidMount() {
    // XXX: If the fetched data is the same as in the state do
    //      no call setSate to prevent one more render
    FetchAPI.getJsonPushes(this.props.repo_name).then(response =>
      response.json()
    ).then(text => {
      let hidden_changesets = {}
      for (var push_id in text.pushes) {
        hidden_changesets[push_id] = false
      }
      this.setState({
        pushes: text.pushes,
        hidden_changesets: hidden_changesets
      })}
    ).catch(error => {
      this.setState({
        pushes: [],
        error_message: 'We have failed to fetch pushes. See the log console for more details'
      })
      console.error(error)
    })
  }

  render() {
    if (this.state.error_message) {
      return (<div className='error_message'>{this.state.error_message}</div>)
    } else {
      return (
        <table>
          <tbody>
            <tr>
              <th>Author</th>
              <th>Changeset</th>
              <th>Description</th>
            </tr>
            {Object.keys(this.state.pushes).reverse().filter( (push_id) => {
              const csets = this.state.pushes[push_id].changesets
              if (csets[csets.length - 1].author !== 'ffxbld') {
                return this.state.pushes[push_id]
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
