/* This file contains file-view RHS siderbar components */

import React from 'react';

/* Sidebar component, show which tests will cover the given selected line */
export const TestsSideViewer = ({testsPerLines, selectedLine}) => {

  if (!testsPerLines) {
    return (
      <div className="tests_viewer">
        <h3>"Fetching coverage from backend..."</h3>
      </div>
    );
  }

  // TODO if no line has been selected, show coverage of the file
  else if (!selectedLine) {
    return (
      <div className="tests_viewer">
        <h3>Select a line to view tests</h3>
      </div>
    );
  }

  return (
    <div className="tests_viewer">
      <h3>Line: {selectedLine}</h3>
      <TestsDetail
        testsPerLines={testsPerLines}
        selectedLine={selectedLine}
      />
    </div>
  );
};

/* Sidebar list component*/
const TestsDetail = ({testsPerLines, selectedLine}) => {
  const testList = testsPerLines[selectedLine];
    if (!testList) {
      return <div>No test covers this line</div>
    }

  const testItems = testList.map((test) => {
    return <li key={test.run.name}>{test.run.name}</li>
  });

  return (
    <ul>
      {testItems}
    </ul>
  );
}
