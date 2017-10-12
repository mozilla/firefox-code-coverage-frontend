import React, { Component } from 'react';
import * as FetchAPI from '../fetch_data';

const RevisionListItem = ({revision}) => {
  // convert timestamp to "YYYY-MM-DDTHH:mm:ss" without using third-party library
  const convertTime = (s) => {
    return new Date(s * 1e3).toISOString().slice(0, -5);
  };

  return (
    <li>{convertTime(revision[1])} &nbsp; {revision[0]}</li>
  );
};

const RevisionList = (props) => {
   const revisionItems = props.revisions.map((revision) => {
     return <RevisionListItem key={revision[0]} revision={revision} />
  });

  return (
    <ul>
      {revisionItems}
    </ul>
  );
};

export default class RevisionSidebar extends Component {
  constructor(props) {
    super(props)

    this.state = { revisions: [["Loading", 0]] }

    FetchAPI.getRevisionNumbers()
      .then(response => {
        if (response.status !== 200) {
          console.log('Error status code' + response.status);
          return;
        }
        response.json().then(res => {
          // console.log(res);
          this.setState({ revisions: res.data });
        });
      }
    )
    .catch(err => {
      console.log('Fetch error', err);
    })
  }

  render() {
    return (
      <div className="revision-sidebar">
        <b>Revision numbers</b>
        <RevisionList revisions={this.state.revisions} />
      </div>
    );
  }
}

// export default RevisionSidebar
