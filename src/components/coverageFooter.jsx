import { githubUrl, codecovUrl, ccovBackendUrl } from '../utils/coverage';

const CoverageFooter = ({ gitBuildCommit, hgNode }) => (
  <div className="meta-footer">
    <a href={githubUrl(gitBuildCommit)} target="_blank">GitHub</a>
    <a href={codecovUrl(gitBuildCommit)} target="_blank">Codecov</a>
    <a href={ccovBackendUrl(hgNode)} target="_blank">Coverage Backend</a>
  </div>
);

export default CoverageFooter;
