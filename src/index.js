import { CodeCoverageDiffViewer } from './diff.js';
import React from 'react';
import ReactDOM from 'react-dom';

// https://hg.mozilla.org/mozilla-central/rev/12e33b9d6f91
var changeset = '12e33b9d6f91'

ReactDOM.render(
  <CodeCoverageDiffViewer changeset={changeset} />,
  document.getElementById('root')
);
