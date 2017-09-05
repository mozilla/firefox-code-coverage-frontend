import React, { Component } from 'react';

import * as FetchAPI from '../../fetch_data'

function PushInfo(props) {
  var p = props.push_info
  // XXX: For author remove the email address
  // XXX: For desc display only the first line
  // XXX: linkify bug numbers
  return (
    <tr className='push'>
      <td className='tip-changeset-author'>{p.changesets[0].author.substring(0, 16)}</td>
      <td className='tip-changeset-node-id'>{p.changesets[0].node.substring(0, 12)}</td>
      <td className='tip-changeset-description'>{p.changesets[0].desc.substring(0, 30)}</td>
    </tr>
  )
}

export class ChangesetsViewer extends Component {
  state = {
    'pushes': []
  }

  componentDidMount() {
    // XXX: If the fetched data is the same as in the state do
    //      no call setSate to prevent one more render
    FetchAPI.getJsonPushes(this.props.repo_name).then(response =>
      response.json()
    ).then(text =>
      this.setState({pushes: text.pushes})
    ).catch(error =>
      console.error(error)
    )
  }

  render() {
    return (
      <table>
        <tbody>
          <tr>
            <th>Author</th>
            <th>Changeset</th>
            <th>Description</th>
          </tr>
          {Object.keys(this.state.pushes).sort().reverse().map((push_id) => (
            <PushInfo
              key={push_id}
              push_info={this.state.pushes[push_id]}
              collapsed={this.state.collapsed}
            />
          ))}
        </tbody>
      </table>
    )
  }
}
