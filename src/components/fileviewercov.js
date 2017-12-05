/* This file contains coverage information for a particular revision of a source file */
import React, { Component } from 'react';

import * as Color from '../utils/color';

/* Sidebar component, show which tests will cover the given selected line */
export const TestsSideViewer = ({ coverage, lineNumber }) => {
  const getTestList = (tests) => (
    <ul className="test-viewer-ul">
      { tests.map(test => (<Test key={test.run.key} test={test} />)) }
    </ul>
  );

  let testTitle, testList;
  if (!coverage) {
    testTitle = "Fetching coverage from backend...";
  } else if (!lineNumber) {
    testTitle = "All test that cover this file";
    testList = getTestList(coverage.allTests);
  } else {
    testTitle = `Line: ${lineNumber}`;
    if (coverage.testsPerHitLine[lineNumber]) {
      testList = getTestList(coverage.testsPerHitLine[lineNumber]);
    } else if (coverage.uncoveredLines.includes(lineNumber)) {
      testList = (<p>No test covers this line</p>);
    } else {
      testList = (<p>This line is not coverable</p>);
    }
  }

  /*
} else if (coverage.testsPerHitLine[lineNumber]) {
  testTitle = `Line: ${lineNumber}`;
  testList = getTestList(coverage.testsPerHitLine[lineNumber]);
} else {
  testTitle = `Line: ${lineNumber}`;
  testList = (<p>No test covers this line</p>);
}
  */

  return (
    <div className="tests_viewer">
      <div className="tests-viewer-title">Covered Tests</div>
      <h3>{testTitle}</h3>
      {testList}
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
  const totalLines = coverage.uncoveredLines.length + coverage.coveredLines.length;
  if (coverage.coveredLines.length !== 0 || coverage.uncoveredLines.length !== 0) {
    percentageCovered = coverage.coveredLines.length / totalLines;
  }

  return (
    <div className="coverage_meta">
      <div className="coverage_meta_totals">
        {percentageCovered &&
          <span className="percentage_covered" style={{ backgroundColor: `${Color.getPercentCovColor(percentageCovered)}` }}>
            { (percentageCovered * 100).toPrecision(4) }%
          </span>
        }
      </div>
    </div>
  );
};
