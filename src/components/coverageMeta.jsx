import BugzillaIconLink from './bugzillaIconLink';
import { hgDiffUrl, pushlogUrl } from '../utils/hg';

const CoverageMeta = ({
  changeset, node, overallCoverage, summary,
}) => (
  <div className="coverage-meta">
    <div className="coverage-meta-row">
      <span className="meta">
        {`Current coverage: ${overallCoverage.substring(0, 4)}%`}
      </span>
      <span className="meta meta-right">
        <a href={pushlogUrl(node)} target="_blank">Push Log</a>
      </span>
    </div>
    <div className="coverage-meta-row">
      <span className="meta">{summary}</span>
      <span className="meta meta-right">
        <a href={hgDiffUrl(node)} target="_blank">Hg Diff</a>
      </span>
    </div>
    {changeset &&
      <div className="coverage-meta-row">
        <div style={{ display: 'flex' }}>
          <BugzillaIconLink description={changeset.desc} />
          <span style={{ verticalAlign: 'top' }}>{changeset.desc}</span>
        </div>
      </div>
    }
  </div>
);

export default CoverageMeta;
