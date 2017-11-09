/* This file contains coverage information for a particular revision of a source file */
import React from 'react';

const _ = require('lodash');

/* Sidebar component, show which tests will cover the given selected line */
export const TestsSideViewer = ({ lineNumber, testsPerLines }) => {
  let content;

  if (!testsPerLines) {
    content = <h3>Fetching coverage from backend...</h3>;
  } else if (!lineNumber) {
    // TODO if no line has been selected, show coverage of the file
    content = <h3>Select a line to view tests</h3>;
  } else if (testsPerLines[lineNumber] && testsPerLines[lineNumber].length > 0) {
    content = (
      <div>
        <h3>Line: {lineNumber}</h3>
        <ul>
          {
            testsPerLines[lineNumber].map(test =>
              (<Test
                key={test.run.name}
                name={test.run.name}
              />),
            )
          }
        </ul>
      </div>
    );
  } else {
    content = (
      <div className="tests_viewer">
        <h3>Line: {lineNumber}</h3>
        <p>No test covers this line</p>
      </div>
    );
  }
  return <div className="tests_viewer">{content}</div>;
};

const Test = props => <li>{props.name}</li>;

/* shows coverage percentage of a file */
export const CoveragePercentageViewer = ({ coverage }) => {
  const percentageCovered = undefined;

  if (coverage) {
    const totalCovered = _.union(_.flatten(coverage.data.map(d => d.source.file.covered)));
    const uncovered = _.union(_.flatten(coverage.data.map(d => d.source.file.uncovered)));
    const totalLines = _.union(uncovered, totalCovered).length;

    if (totalCovered !== 0 || uncovered !== 0) {
      this.percentageCovered = totalCovered.length / totalLines;
    } else {
      // this.percentageCovered is left undefined
    }
  }

  return (
    <div className="coverage_meta">
      <div className="coverage_meta_totals">
        {this.percentageCovered &&
          <span className="percentage_covered">
            {(this.percentageCovered * 100).toPrecision(4)}%
          </span>
        }
      </div>
    </div>
  );
};
