import DiffLine from './diffLine';
import hash from '../utils/hash';

const uniqueLineId = (filePath, change) => {
  let lineNumber;
  if (change.ln) {
    lineNumber = change.ln;
  } else if (change.ln2) {
    lineNumber = change.ln2;
  } else {
    lineNumber = change.ln1;
  }
  return `${hash(filePath)}-${change.type}-${lineNumber}`;
};

/* A DiffBlock is *one* of the blocks changed for a specific file */
const DiffBlock = ({ filePath, block, fileDiffs }) => (
  <div>
    <div className="diff-line-at">{block.content}</div>
    <div className="diff-block">
      <table className="diff-block-table">
        <tbody>
          {block.changes.map((change) => {
            const uid = uniqueLineId(filePath, change);
            return (<DiffLine
              key={uid}
              id={uid}
              change={change}
              fileDiffs={fileDiffs}
            />);
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default DiffBlock;
