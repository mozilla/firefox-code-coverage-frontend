import React, { Component } from 'react';

/* A DiffLine contains metadata about a line in a DiffBlock */
export function DiffLine(props) {
  // Information about the line itself
  var c = props.change
  var cov = props.code_cov_info
  // Added, deleted or unchanged line
  var type = props.change.type
  // CSS tr and td classes
  var row_class, coverage_status
  var line_id
  var [old_line_number, new_line_number] = ['', '']
  //var coverage_status = 'unchanged'

  if (type === 'add') {
    // Added line - <cov_status> | <blank> | <new line number>
    row_class = type
    if (cov) {
      cov.changes.new.map(line_cov_info => {
        // XXX: Verify in here that the lines match
        if (line_cov_info.line === c.ln) {
          if (line_cov_info.coverage) {
            coverage_status = 'hit'
          } else {
            // XXX: This is currently not doing anything
            coverage_status = 'miss'
          }
        }
      })
    }
    line_id = props.id
    new_line_number = c.ln
  } else if (type === 'del') {
    // Removed line - <old line number> | <blank>
    row_class = type
    old_line_number = c.ln
  } else {
    // Unchanged line - <old line number> | <blank>
    row_class = type
    new_line_number = c.ln1
    old_line_number = c.ln2
  }
  return (
    <tr id={line_id} className={row_class}>
      <td className={coverage_status}>&nbsp;</td>
      <td className='old_line_number'>{old_line_number}</td>
      <td className='new_line_number'>{new_line_number}</td>
      <td className='line_content'>
        <pre>{c.content}</pre>
      </td>
    </tr>
  );
}
