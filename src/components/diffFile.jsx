import { Link } from 'react-router-dom';
import DiffBlock from './diffBlock';

/* A DiffLine contains all diff changes for a specific file */
const DiffFile = ({
  buildRev, diffBlock, fileCoverageDiffs, path,
}) => (
  <div className="diff-file">
    <div className="file-summary">
      <div className="file-path">
        <Link
          className="diff-viewer-link"
          to={`/file?revision=${buildRev}&path=${path}`}
          href={`/file?revision=${buildRev}&path=${path}`}
        >
          {path}
        </Link>
      </div>
    </div>
    {diffBlock.chunks.map(block => (
      <DiffBlock
        block={block}
        filePath={path}
        fileDiffs={fileCoverageDiffs}
        key={block.content}
      />
    ))}
  </div>
);

export default DiffFile;
