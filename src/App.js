import React, { Component } from 'react';
import { DiffViewer } from './DiffViewer'

// Main component
export function CodeCoverageDiffViewer(props) {
  return (
      <div className="page_body codecoverage-diffviewer">
        <DiffViewer changeset={props.changeset}/>
      </div>
  );
}
