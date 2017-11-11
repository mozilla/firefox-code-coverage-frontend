/* This file contains coverage information for a particular revision of a source file */
import React from 'react';

const _ = require('lodash');

/* Sidebar component, show which tests will cover the given selected line */
export const TestsSideViewer = ({ coverage, lineNumber }) => {
  let content;

  if (!coverage) {
    content = <h3>Fetching coverage from backend...</h3>;
  } else if (!lineNumber) {
    // TODO if no line has been selected, show coverage of the file
    content = <h3>Select a line to view tests</h3>;
  } else if (coverage.testsPerHitLine[lineNumber]) {
    content = (
      <div>
        <h3>Line: {lineNumber}</h3>
        <ul>
          {
            coverage.testsPerHitLine[lineNumber].map(test =>
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
    const totalLines = _.union(coverage.uncoveredLines, coverage.coveredLines).length;

    if (coverage.coveredLines.length !== 0 || coverage.uncoveredLines.length !== 0) {
      this.percentageCovered = coverage.coveredLines.length / totalLines;
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
