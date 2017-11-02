import React, { Component } from 'react';

import * as FetchAPI from '../fetch_data';

const queryString = require('query-string');

/* FileViewer loads a raw file for a given revision from Mozilla's hg web.
 * It uses test coverage information from Active Data to show coverage
 * for runnable lines.
 */
export default class FileViewerContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appError: undefined,
      coverage: undefined,
      parsedFile: [],
      selectedLine: null,
      testsPerLines: undefined,
    };

    this.setSelectedLine = this.setSelectedLine.bind(this)
  }

  componentDidMount() {
    /* get revision and path parameters from URL */
    const parsedQuery = queryString.parse(this.props.location.search);
    if (!parsedQuery.revision || !parsedQuery.path) {
      this.setState({ appError: "Undefined URL query ('revision', 'path' fields are required)" });
    }
    /* remove begining '/' in the path parameter */
    if (parsedQuery.path.startsWith('/')) {
      parsedQuery.path = parsedQuery.path.slice(1);
    }
    this.revision = parsedQuery.revision
    this.path = parsedQuery.path

    /* Fetch source code from hg */
    FetchAPI.getRawFile(this.revision, this.path)
      .then(text => this.setState({ parsedFile: text.split("\n") }))
    ;

    /* Fetch coverages from ActiveData */
    FetchAPI.query({
      "from": "coverage",
      "where": {
        "and": [
          {"eq": {"source.file.name": `${this.path}`}},
          {"eq": {"repo.changeset.id12": `${this.revision}`}}
        ]
      },
      "limit": 1000,
      "format": "list"
    })
    .then(data => {
      // TODO remove these log lines
      console.log(data);
      this.setState({coverage: data});
      this.parseTestsCoverage(data.data);
    });
  }

  /* Parse data returns from ActiveData */
  parseTestsCoverage(data) {
    console.log(data.length);
    var stat = []

    for (var i = 0; i < data.length; i++) {
      var coveredLines = data[i].source.file.covered;

      for (var j = 0; j < coveredLines.length; j++) {
        var line = coveredLines[j];
        if (!stat[line]) {
          stat[line] = [];
        }
        stat[line].push(i);
      }
    }
    console.log(stat);
    this.setState({testsPerLines: stat});
  }

  /* handle fileviewer's line onclick event */
  setSelectedLine(lineNumber) {
    console.log(lineNumber);
    this.setState({selectedLine: lineNumber});
    // if (this.state.selectedLine == lineNumber) {
    //   this.setState({selectedLine: null})
    // } else {
    //   this.setState({selectedLine: lineNumber});
    // }
  }

  render() {
    return (
      <div>
        <FileViewerMeta
          revision={this.revision}
          path={this.path}
          appError={this.state.appError}
        />
        <FileViewer
          parsedFile={this.state.parsedFile}
          coverage={this.state.coverage}
          testsPerLines={this.state.testsPerLines}
          onLineClick={this.setSelectedLine}
        />
        <TestsViewer
          coverage={this.state.coverage}
          testsPerLines={this.state.testsPerLines}
          selectedLine={this.state.selectedLine}
        />
      </div>
    );
  };
}

/* This component renders each line of the file with its line number */
const FileViewer = ({ parsedFile, coverage, testsPerLines, onLineClick }) => {
  return (
    <div>
      <table>
        <tbody>
          {
            parsedFile.map((line, lineNumber) => (
              <Line
                key={lineNumber}
                lineNumber={lineNumber+1}
                lineText={line}
                onLineClick={onLineClick}
              />
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

const Line = (props) => {
  const handleOnClick = () => {
    props.onLineClick(props.lineNumber);
  }

  return (
      <tr>
        <td className="file_line_number">{props.lineNumber}</td>
        <td className="file_line_text" onClick={handleOnClick}><pre>{props.lineText}</pre></td>
      </tr>
  );
};






/* Sidebar component, show which tests will cover the given selected line */
const TestsViewer = ({coverage, testsPerLines, selectedLine}) => {

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









/* Sidebar component, show which tests will cover the given selected line */
// const TestsViewer = ({coverage, testsPerLines, selectedLine}) => {
//
//   if (!testsPerLines || !selectedLine) {
//     return (
//       <ul className="tests_viewer">
//         <li>waiting</li>
//       </ul>
//     );
//   }
//
//   const testList = testsPerLines[selectedLine];
//   if (!testList) {
//     return <div className="tests_viewer">'No test for this line'</div>
//   }
//
//   // console.log(coverage.data[3]);
//   // return (<div />)
//
//   const testItems = testList.map((testNum) => {
//     const test = coverage.data[testNum];
//     // console.log(test);
//     const testName = test.run.name;
//     return <li key={testName}>{testName}</li>
//   });
//
//
//   return (
//     <ul className="tests_viewer">
//       {testItems}
//     </ul>
//   );
// };











/* This component contains metadata of the file */
const FileViewerMeta = ({ revision, path, appError }) => {
  return (
    <div>
      {appError && <span className="error_message">{appError}</span>}
      <h4>Revision number: {revision} <br/> Path: {path}</h4>
    </div>
  );
};
