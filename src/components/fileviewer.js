import React, { Component } from 'react';

import * as FetchAPI from '../fetch_data';
import { TestsSideViewer, CoveragePercentageViewer } from './fileviewercov';

const queryString = require('query-string');
const _ = require('lodash');

/* FileViewer loads a raw file for a given revision from Mozilla's hg web.
 * It uses test coverage information from Active Data to show coverage
 * for runnable lines.
 */
export default class FileViewerContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appError: undefined,
      parsedFile: [],
      coverage: {
        coveredLines: [],
        uncoveredLines: [],
        testsPerHitLine: [],
        testsPerMissLine: [],
      },
      selectedLine: undefined,
    };
    this.setSelectedLine = this.setSelectedLine.bind(this);
    /* get revision and path parameters from URL */
    const parsedQuery = queryString.parse(props.location.search);
    if (!parsedQuery.revision || !parsedQuery.path) {
      this.setState({ appError: "Undefined URL query ('revision', 'path' fields are required)" });
    }
    /* remove beginning '/' in the path parameter */
    if (parsedQuery.path.startsWith('/')) {
      parsedQuery.path = parsedQuery.path.slice(1);
    }
    this.revision = parsedQuery.revision;
    this.path = parsedQuery.path;
  }

  componentDidMount() {
    /* Fetch source code from hg */
    FetchAPI.getRawFile(this.revision, this.path)
      .then(text => this.setState({ parsedFile: text.split('\n') }))
    ;

    /* Fetch coverages from ActiveData */
    FetchAPI.query({
      from: 'coverage',
      where: {
        and: [
          { eq: { 'source.file.name': `${this.path}` } },
          { eq: { 'repo.changeset.id12': `${this.revision}` } },
        ],
      },
      limit: 1000,
      format: 'list',
    })
      .then((data) => {
        this.parseCoverage(data.data);
      });
  }

  setSelectedLine(selectedLineNumber) {
    this.setState({ selectedLine: selectedLineNumber });
  }

  /* Parse coverage data */
  parseCoverage(data) {
    const covered = [];
    const uncovered = [];
    const testsPerHitLine = [];
    const testsPerMissLine = [];

    data.forEach((d) => {
      d.source.file.covered.forEach((line) => {
        covered.push(line);
        if (!testsPerHitLine[line]) {
          testsPerHitLine[line] = [];
        }
        testsPerHitLine[line].push(d);
      });
    });

    data.forEach((d) => {
      d.source.file.uncovered.forEach((line) => {
        if (!testsPerHitLine[line]) {
          uncovered.push(line);
          if (!testsPerMissLine[line]) {
            testsPerMissLine[line] = [];
          }
          testsPerMissLine[line].push(d);
        }
      });
    })

    this.setState({
      coverage: {
        coveredLines: _.uniq(covered),
        uncoveredLines: _.uniq(uncovered),
        testsPerHitLine,
        testsPerMissLine,
      },
    });
  }

  render() {
    const { appError, parsedFile, coverage, selectedLine } = this.state;

    return (
      <div>
        <FileViewerMeta
          revision={this.revision}
          path={this.path}
          appError={appError}
        />
        <CoveragePercentageViewer
          coverage={coverage}
        />
        <FileViewer
          parsedFile={parsedFile}
          coverage={coverage}
          selectedLine={selectedLine}
          onLineClick={this.setSelectedLine}
        />
        <TestsSideViewer
          coverage={coverage}
          lineNumber={selectedLine}
        />
      </div>
    );
  }
}

/* This component renders each line of the file with its line number */
const FileViewer = ({ parsedFile, coverage, selectedLine, onLineClick }) => (
  <div>
    <table className="file_viewer">
      <tbody>
        {
          parsedFile.map((line, lineNumber) => (
            <Line
              key={lineNumber}
              lineNumber={lineNumber + 1}
              lineText={line}
              coverage={coverage}
              selectedLine={selectedLine}
              onLineClick={onLineClick}
            />
          ))
        }
      </tbody>
    </table>
  </div>
);

const Line = ({ lineNumber, lineText, coverage, selectedLine, onLineClick  }) => {
  const handleOnClick = () => {
    onLineClick(lineNumber);
  };

  const lineClass = (lineNumber === selectedLine ) ? 'selected' : '';

  let nTests, cov = '';
  if (coverage.coveredLines.find( element => element === lineNumber )) {
    cov = 'hit';
    nTests = coverage.testsPerHitLine[lineNumber].length;
  }
  else if (coverage.uncoveredLines.find( element => element === lineNumber )) {
    cov = 'miss';
  }


  console.log(nTests);


  return (
    <tr className={`file_line ${cov} ${lineClass}`}>
      <td className="file_line_number">{lineNumber}</td>
      <td className="file_line_tests">
        { cov === 'hit' && <span className="tests">{nTests}</span> }
      </td>
      <td className="file_line_text" onClick={handleOnClick}><pre>{lineText}</pre></td>
    </tr>
  );
};

/* This component contains metadata of the file */
const FileViewerMeta = ({ revision, path, appError }) => (
  <div>
    {appError && <span className="error_message">{appError}</span>}
    <h4>Revision number: {revision} <br /> Path: {path}</h4>
  </div>
);
