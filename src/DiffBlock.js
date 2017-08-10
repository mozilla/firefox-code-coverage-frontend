import React, { Component } from 'react';
import { DiffLine } from './DiffLine'

/* A DiffBlock is *one* of the blocks changed for a specific file */
export function DiffBlock(props) {
  return (
    <div className='diffblock'>
      <div className='difflineat'>{props.block.content}</div>
      <table className='diffblock'>
        <tbody>
          {props.block.changes.map((change, index) => {
             return (
               <DiffLine
                 key={index}
                 id={index}
                 change={change}
                 code_cov_info={props.code_cov_info}
               />
             )
           })}
       </tbody>
     </table>
    </div>
  );
}
