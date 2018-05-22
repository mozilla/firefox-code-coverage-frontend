import { Component } from 'react';
import { Link } from 'react-router-dom';
import MenuRightIcon from 'mdi-react/MenuRightIcon';
import MenuDownIcon from 'mdi-react/MenuDownIcon';
import DiffBlock from './diffBlock';

/* A DiffLine contains all diff changes for a specific file */
class DiffFile extends Component {
  state = {
    hiddenBlocks: false,
  }

  componentDidMount() {
    // Collapse by default files which don't have any coverage information
    if (!this.state.hiddenBlocks && !this.props.fileCoverageDiffs) {
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({ hiddenBlocks: true });
    }
  }

  onClickHideOrShow() {
    this.setState({ hiddenBlocks: !this.state.hiddenBlocks });
  }

  render() {
    const { hiddenBlocks } = this.state;
    const { buildRev, diffBlock, fileCoverageDiffs, path } = this.props;

    return (
      <div className="diff-file">
        <div
          className="file-summary"
          onClick={() => this.onClickHideOrShow()}
          role="button"
          tabIndex={0}
        >
          <div className="file-path">
            {hiddenBlocks ? (
              <MenuRightIcon />
            ) : (
              <MenuDownIcon />
            )}
            <Link
              className="diff-viewer-link"
              to={`/file?revision=${buildRev}&path=${path}`}
              href={`/file?revision=${buildRev}&path=${path}`}
            >
              {path}
            </Link>
          </div>
        </div>
        {!hiddenBlocks && diffBlock.chunks.map(block => (
          <DiffBlock
            block={block}
            filePath={path}
            fileDiffs={fileCoverageDiffs}
            key={block.content}
          />
        ))}
      </div>
    );
  }
}

export default DiffFile;
