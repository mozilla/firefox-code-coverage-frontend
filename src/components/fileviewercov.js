// This file contains coverage information for a particular revision of a source file
import React, { Component } from 'react';

import getPercentCovColor from '../utils/color';
import { TRIANGULAR_BULLET } from '../utils/symbol';

// Sidebar component, show which tests will cover the given selected line
export class TestsSideViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandTest: undefined,
    };
    this.handleTestOnExpand = this.handleTestOnExpand.bind(this);
  }

  componentWillReceiveProps() {
    // collapse expanded test when selected line is changed
    this.setState({ expandTest: undefined });
  }

  getTestList(tests) {
    return (
      <ul className="test-viewer-ul">
        {tests.map((test, row) => (
          <Test
            // eslint-disable-next-line no-underscore-dangle
            key={test._id}
            row={row}
            test={test}
            expand={(row === this.state.expandTest) ? 'expanded' : ''}
            handleTestOnExpand={this.handleTestOnExpand}
          />
        ))}
      </ul>
    );
  }

  handleTestOnExpand(row) {
    if (this.state.expandTest === row) {
      this.setState({ expandTest: undefined });
    } else {
      this.setState({ expandTest: row });
    }
  }

  render() {
    const { coverage, lineNumber } = this.props;
    let testTitle;
    let testList;
    if (!coverage) {
      testTitle = 'Fetching coverage from backend...';
    } else if (!lineNumber) {
      testTitle = 'All test that cover this file';
      testList = this.getTestList(coverage.allTests);
    } else {
      testTitle = `Line: ${lineNumber}`;
      if (coverage.testsPerHitLine[lineNumber]) {
        testList = this.getTestList(coverage.testsPerHitLine[lineNumber]);
      } else {
        testList = (<p>No test covers this line</p>);
      }
    }
    return (
      <div className="tests-viewer">
        <div className="tests-viewer-title">Covered Tests</div>
        <h3>{testTitle}</h3>
        {testList}
      </div>
    );
  }
}

// Test list item in the TestsSideViewer
const Test = ({
  row, test, expand, handleTestOnExpand,
}) => (
  <li>
    <button className="test-switch" onClick={() => handleTestOnExpand(row)}>
      <span className={`test-symbol ${expand}`}>{TRIANGULAR_BULLET}</span>
      <span className="test-name">
        { test.run.name.substring(test.run.name.indexOf('/') + 1) }
      </span>
    </button>
    <div className={`expandable-test-info ${expand}`}>
      <ul className="test-detail-ul">
        <li>{`platform : ${test.run.machine.platform}`}</li>
        <li>{`suite : ${test.run.suite.fullname}`}</li>
        <li>{`chunk : ${test.run.chunk}`}</li>
      </ul>
    </div>
  </li>
);

// shows coverage percentage of a file
export const CoveragePercentageViewer = ({ coverage }) => {
  let percentageCovered;
  if (coverage.percentage) {
    percentageCovered = (
      <div
        className="coverage-percentage"
        style={{ backgroundColor: `${getPercentCovColor(coverage.percentage)}` }}
      >
        {coverage.percentage.toPrecision(4)}
        % - {coverage.numCovLines} lines covered out of {coverage.numTotalLines} coverable lines
      </div>
    );
  } else {
    percentageCovered = (<div className="coverage-percentage">No changes</div>);
  }

  return (
    <div className="coverage-percentage-viewer">
      { percentageCovered }
    </div>
  );
};
