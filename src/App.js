import React, { Component } from 'react';
import { Route } from 'react-router-dom'
import { DiffViewer } from './DiffViewer'
import { Home } from './Home'

// https://hg.mozilla.org/mozilla-central/rev/12e33b9d6f91
var changeset = '12e33b9d6f91'

// Main component
export function App(props) {
  return (
    <div className='app'>
      <Route exactly path="/" component={Home} />
      <Route path="/changeset" render={() => (
        <DiffViewer changeset={changeset}/>
      )}/>
    </div>
  );
}
