/* This file contains coverage information for a particular revision of a source file */
import React, { Component } from 'react';

import * as Color from '../utils/color';

/* Sidebar component, show which tests will cover the given selected line */
export class TestsSideViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: undefined,
    };
    this.handleTestOnExpand = this.handleTestOnExpand.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // collapse expanded test when selected line is changed
    this.setState({ expand: undefined, });
  }

  handleTestOnExpand(row) {
    if (this.state.expand === row) {
      this.setState({ expand: undefined });
    } else {
      this.setState({ expand: row });
    }
  }

  getTestList(tests) {
    return(
      <ul className="test-viewer-ul">
        { tests.map((test, row) => (
          <Test
            key={test.run.key}
            row={row}
            test={test}
            expand={this.state.expand}
            handleTestOnExpand={this.handleTestOnExpand}
          />
        ))}
      </ul>
    );
  };

  render() {
    const { coverage, lineNumber } = this.props;
    let testTitle, testList;
    if (!coverage) {
      testTitle = "Fetching coverage from backend...";
    } else if (!lineNumber) {
      testTitle = "All test that cover this file";
      testList = this.getTestList(coverage.allTests);
    } else {
      testTitle = `Line: ${lineNumber}`;
      if (coverage.testsPerHitLine[lineNumber]) {
        testList = this.getTestList(coverage.testsPerHitLine[lineNumber]);
      } else if (coverage.uncoveredLines.includes(lineNumber)) {
        testList = (<p>No test covers this line</p>);
      } else {
        testList = (<p>This line is not coverable</p>);
      }
    }
    return(
      <div className="tests_viewer">
        <div className="tests-viewer-title">Covered Tests</div>
        <h3>{testTitle}</h3>
        {testList}
      </div>
    );
  }
}

// Test list item in the TestsSideViewer
export const Test = ({ row, test, expand, handleTestOnExpand }) => {
  let testClass = (row === expand) ? 'expanded' : '';
  return (
    <li>
      <div className="toggleable-test-title" onClick={() => handleTestOnExpand(row)}>
        <span className={`test-ptr ${testClass}`}>&#x2023;</span>
        <label className="test-name">
          { test.run.name.substring(test.run.name.indexOf('/') + 1) }
        </label>
      </div>
      <div className={`expandable-test-info ${testClass}`}>
        <ul className="test-detail-ul">
          <li><span>platform : </span>{test.run.machine.platform}</li>
          <li><span>suite : </span>{test.run.suite.fullname}</li>
          <li><span>chunk : </span>{test.run.chunk}</li>
        </ul>
      </div>
    </li>
  );
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
