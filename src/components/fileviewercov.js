/* This file contains coverage information for a particular revision of a source file */
import React, { Component } from 'react';


/* Sidebar component, show which tests will cover the given selected line */
export class TestsSideViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandTest: undefined,
    };
    this.handleTestOnExpand = this.handleTestOnExpand.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // collapse expanded test when selected line is changed
    this.setState({ expandTest: undefined, });
  }

  handleTestOnExpand(row) {
    if (this.state.expandTest === row) {
      this.setState({ expandTest: undefined });
    } else {
      this.setState({ expandTest: row });
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
            expand={(row === this.state.expandTest) ? 'expanded':''}
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
      } else {
        testList = (<p>No test covers this line</p>);
      }
    }
    return(
      <div className="tests-viewer">
        <div className="tests-viewer-title">Covered Tests</div>
        <h3>{testTitle}</h3>
        {testList}
      </div>
    );
  }
}

// Test list item in the TestsSideViewer
export const Test = ({ row, test, expand, handleTestOnExpand }) => {
  return (
    <li>
      <div className="toggleable-test-title" onClick={() => handleTestOnExpand(row)}>
        <span className={`test-ptr ${expand}`}>&#x2023;</span>
        <label className="test-name">
          { test.run.name.substring(test.run.name.indexOf('/') + 1) }
        </label>
      </div>
      <div className={`expandable-test-info ${expand}`}>
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
  const coveredLines = coverage.coveredLines.length;
  const totalLines = coveredLines + coverage.uncoveredLines.length;
  let percentageCovered;
  if (coveredLines !== 0 || coverage.uncoveredLines.length !== 0) {
    percentageCovered = (
      <span className="coverage-percentage">
        { (coveredLines / totalLines * 100).toPrecision(4) }% - { coveredLines } lines covered out of { totalLines } added
      </span>
    );
  } else {
    percentageCovered = (<span>No changes</span>);
  }

  return (
    <div className="coverage-percentage-viewer">
      { percentageCovered }
    </div>
  );
};
