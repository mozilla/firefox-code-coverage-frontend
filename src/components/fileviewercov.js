/* This file contains coverage information for a particular revision of a source file */
import React from 'react';

import * as Color from '../utils/color';

const _ = require('lodash');

/* Sidebar component, show which tests will cover the given selected line */
export const TestsSideViewer = ({ coverage, lineNumber }) => {
  let content;

  if (!coverage) {
    content = <h3>Fetching coverage from backend...</h3>;
  } else if (!lineNumber) {
    content = (
      <div>
        <h3>All test that cover this file</h3>
        <ul>
          {
            coverage.allTests.map(test => 
              (<Test
                key={test.run.name}
                name={test.run.name}
              />)
            )
          }
        </ul>
      </div>
    );
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
    const totalLines = coverage.uncoveredLines.length + coverage.coveredLines.length;

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
          <span className="percentage_covered" style={{ backgroundColor: `${Color.getPercentCovColor(this.percentageCovered)}` }}>
            { (this.percentageCovered * 100).toPrecision(4) }%
          </span>
        }
      </div>
    </div>
  );
};
