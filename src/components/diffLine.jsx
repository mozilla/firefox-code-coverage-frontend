/* A DiffLine contains metadata about a line in a DiffBlock */
const DiffLine = ({ change, fileDiffs, id }) => {
  const c = change; // Information about the line itself
  const changeType = change.type; // Added, deleted or unchanged line
  let rowClass = 'nolinechange'; // CSS tr and td classes
  const rowId = id;
  let [oldLineNumber, newLineNumber] = ['', '']; // Cell contents

  if (changeType === 'add') {
    // Added line - <blank> | <new line number>
    if (fileDiffs) {
      try {
        const coverage = fileDiffs.lines[c.ln];
        if (coverage === 'Y') {
          rowClass = 'hit';
        } else if (coverage === '?') {
          rowClass = 'nolinechange';
        } else {
          rowClass = 'miss';
        }
      } catch (e) {
        console.log(e);
        rowClass = 'miss';
      }
    }
    newLineNumber = c.ln;
  } else if (changeType === 'del') {
    // Removed line - <old line number> | <blank>
    oldLineNumber = c.ln;
  } else {
    // Unchanged line - <old line number> | <blank>
    oldLineNumber = c.ln1;
    if (oldLineNumber !== c.ln2) {
      newLineNumber = c.ln2;
    }
  }

  return (
    <tr id={rowId} className={`${rowClass} diff-row`}>
      <td className="old-line-number diff-cell">{oldLineNumber}</td>
      <td className="new-line-number diff-cell">{newLineNumber}</td>
      <td className="line-content diff-cell">
        <pre>{c.content}</pre>
      </td>
    </tr>
  );
};

export default DiffLine;
