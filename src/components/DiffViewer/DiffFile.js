import React, { Component } from 'react';
import { DiffBlock } from './DiffBlock'

const DiffSummary = ({summary}) => {
  return (
    <div className='filecoveragesummary'>{(summary) ?
      summary.overall_cur : 'no summary available'}
    </div>
  )
}

/* A DiffLine contains all diff changes for a specific file */
export function DiffFile({ code_cov_info, coverage_summary, diff_block }) {
  return (
    <div className='difffile'>
      <div className='filesummary'>
        <div className='filepath'>{diff_block.from}</div>
        <DiffSummary summary={coverage_summary} />
      </div>
      {diff_block.chunks.map((block, index) =>
        <DiffBlock
          key={index}
          block={block}
          code_cov_info={code_cov_info}
        />
      )}
    </div>
  );
}
