import { hgDiffUrl, pushlogUrl } from '../utils/hg';

const CoverageMeta = ({
  node, overallCoverage, repoName, summary,
}) => (
  <div className="coverage-meta">
    <div className="coverage-meta-row">
      <span className="meta">
        {`Current coverage: ${overallCoverage.substring(0, 4)}%`}
      </span>
      <span className="meta meta-right">
        <a href={pushlogUrl(repoName, node)} target="_blank">Push Log</a>
      </span>
    </div>
    <div className="coverage-meta-row">
      <span className="meta">{summary}</span>
      <span className="meta meta-right">
        <a href={hgDiffUrl(repoName, node)} target="_blank">Hg Diff</a>
      </span>
    </div>
  </div>
);

export default CoverageMeta;
