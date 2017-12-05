/* This file contains coverage information for a particular revision of a source file */
import React, { Component } from 'react';

import * as Color from '../utils/color';

/* Sidebar component, show which tests will cover the given selected line */
export const TestsSideViewer = ({ coverage, lineNumber }) => {
  let content;

  if (!coverage) {
    content = <h3>Fetching coverage from backend...</h3>;
  } else if (!lineNumber) {
    content = (
      <div>
        <h3>All test that cover this file</h3>
        <ul className="test-viewer-ul">
          {
            coverage.allTests.map(test =>
              (<Test
                key={test.run.key}
                test={test}
              />),
            )
          }
        </ul>
      </div>
    );
  } else if (coverage.testsPerHitLine[lineNumber]) {
    content = (
      <div>
        <h3>Line: {lineNumber}</h3>
        <ul className="test-viewer-ul">
          {
            coverage.testsPerHitLine[lineNumber].map(test =>
              (<Test
                key={test.run.key}
                test={test}
              />),
            )
          }
        </ul>
      </div>
    );
  } else {
    content = (
      <div>
        <h3>Line: {lineNumber}</h3>
        <p>No test covers this line</p>
      </div>
    );
  }
  return (
    <div className="tests_viewer">
      <div className="tests-viewer-title">Covered Tests</div>
      {content}
    </div>
  );
};

/* Test list item in the TestsSideViewer */
class Test extends Component {
  constructor(props) {
    super(props);
    this.state = { expand: false };
    this.expandClass = '';
    this.handleTestOnClick = this.handleTestOnClick.bind(this);
  }

  handleTestOnClick() {
    this.expandClass = (this.state.expand) ? '' : 'expanded';
    this.setState({ expand: !this.state.expand });
  }

  render() {
    const test = this.props.test;
    return (
      <li>
        <div className="toggleable-test-title" onClick={this.handleTestOnClick}>
          <span className={`test-ptr ${this.expandClass}`}>&#x2023;</span>
          <label className="test-name">
            { test.run.name.substring(test.run.name.indexOf('/') + 1) }
          </label>
        </div>
        <div className={`expandable-test-info ${this.expandClass}`}>
          <ul className="test-detail-ul">
            <li><span>platform : </span>{test.run.machine.platform}</li>
            <li><span>suite : </span>{test.run.suite.fullname}</li>
            <li><span>chunk : </span>{test.run.chunk}</li>
          </ul>
        </div>
      </li>
    );
  }
}

/* shows coverage percentage of a file */
export const CoveragePercentageViewer = ({ coverage }) => {
  let percentageCovered;
  let coveredLines;
  let totalLines;

  if (coverage) {
    coveredLines = coverage.coveredLines.length;
    totalLines = coveredLines + coverage.uncoveredLines.length;

    if (coveredLines !== 0 || coverage.uncoveredLines.length !== 0) {
      percentageCovered = coveredLines / totalLines;
    } else {
      // this.percentageCovered is left undefined
    }
  }

  return (
    <div className="coverage_percentage_viewer">
      <div className="coverage_percentage">
        {percentageCovered ?
          <span className="coverage_percentage" style={{ backgroundColor: `${Color.getPercentCovColor(percentageCovered)}` }}>
            { (percentageCovered * 100).toPrecision(4) }% - { coveredLines } lines covered out of { totalLines } added
          </span>
          :
          <span>No changes</span>
        }
      </div>
    </div>
  );
};
