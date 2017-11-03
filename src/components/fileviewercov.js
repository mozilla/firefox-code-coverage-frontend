/* This file contains file-view RHS siderbar components */

import React from 'react';

/* Sidebar component, show which tests will cover the given selected line */
export const TestsSideViewer = ({coverage, testsPerLines, selectedLine}) => {

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
        coverage={coverage}
        testsPerLines={testsPerLines}
        selectedLine={selectedLine}
      />
    </div>
  );
};

/* Sidebar list component*/
const TestsDetail = ({coverage, testsPerLines, selectedLine}) => {
  const testList = testsPerLines[selectedLine];
    if (!testList) {
      return <div>No test covers this line</div>
    }

  const testItems = testList.map((testNum) => {
    const test = coverage.data[testNum];
    const testName = test.run.name;
    return <li key={testName}>{testName}</li>
  });

  return (
    <ul>
      {testItems}
    </ul>
  );
}
