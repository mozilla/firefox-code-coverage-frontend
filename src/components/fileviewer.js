import React, { Component } from 'react';

import * as FetchAPI from '../fetch_data';

const queryString = require('query-string');
const _ = require('lodash')

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
    };
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
      console.log(data);
      this.setState({coverage: data});
    });
  }

  render() {
    const { appError, coverage, parsedFile } = this.state;

    return (
      <div>
        <FileViewerMeta
          revision={this.revision}
          path={this.path}
          appError={appError}
        />
        <CoverageMeta 
          coverage={coverage}
        />
        <FileViewer
          parsedFile={parsedFile}
          coverage={coverage}
        />
      </div>
    );
  };
}

/* This component renders each line of the file with its line number */
const FileViewer = ({ parsedFile, coverage }) => {
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
              />
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

const Line = (props) => {
  return (
      <tr>
        <td className="file_line_number">{props.lineNumber}</td>
        <td><pre>{props.lineText}</pre></td>
      </tr>
  );
};

/* This component contains metadata of the file */
const FileViewerMeta = ({ revision, path, appError }) => {
  return (
    <div>
      {appError && <span className="error_message">{appError}</span>}
      <h4>Revision number: {revision} <br/> Path: {path}</h4>
    </div>
  );
};

const CoverageMeta = ({ coverage }) => {
  let percentageCovered = undefined;
  
  if (coverage) {
    let total_covered = _.union(_.flatten(coverage.data.map((d) => d.source.file.covered)));
    let uncovered = _.union(_.flatten(coverage.data.map((d) => d.source.file.uncovered)));
    let total_uncovered = _.difference(uncovered, total_covered);
    this.percentageCovered = total_covered.length / total_uncovered.length;
  }

  return (
    <div className="coverage_meta">
      <div className="coverage_meta_totals">
        <span className="percentage_covered">{(this.percentageCovered * 100).toPrecision(4)}%</span>
      </div>
    </div>
  );
};