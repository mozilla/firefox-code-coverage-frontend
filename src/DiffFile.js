import React, { Component } from 'react';
import { DiffBlock } from './DiffBlock'

/* A DiffLine contains all diff changes for a specific file */
export function DiffFile(props) {
  return (
    <div className='difffile'>
      <div className='filesummary'>
        <div className='filepath'>{props.diff_block.from}</div>
        <div className='filecoveragesummary'>summary</div>
      </div>
      {props.diff_block.chunks.map((block, index) =>
        <DiffBlock
          key={index}
          block={block}
          code_cov_info={props.code_cov_info}
        />
      )}
    </div>
  );
}
