import BugzillaIconLink from './bugzillaIconLink';
import { hgDiffUrl } from '../utils/hg';

import eIcon from '../static/noun_205162_cc.png';
import dummyIcon from '../static/dummyIcon16x16.png';

const handleClick = (e, node) => {
  if (e.target.tagName.toLowerCase() === 'td') {
    window.open(`/#/changeset/${node}`, '_blank');
  } else {
    e.stopPropagation();
  }
};

const ChangesetInfo = ({ changeset, summary, summaryClassName }) => {
  const {
    authorInfo, desc, node,
  } = changeset;

  return (
    <tr className="changeset" onClick={e => handleClick(e, node)}>
      <td className="changeset-author">
        {(authorInfo.email) ?
          <a href={`mailto: ${authorInfo.email}`}>
            <img className="eIcon" src={eIcon} alt="email icon" />
          </a> : <img className="icon-substitute" src={dummyIcon} alt="placeholder icon" />
        }
        <span className="changeset-eIcon-align">{authorInfo.name.substring(0, 60)}</span>
      </td>
      <td className="changeset-hg">
        <a href={hgDiffUrl(node)} target="_blank">{node.substring(0, 12)}</a>
      </td>
      <td>
        <div className="changeset-description">
          <BugzillaIconLink description={desc} />
          {desc.substring(0, 40).padEnd(40)}
        </div>
      </td>
      <td className={`changeset-summary ${summaryClassName}`}>{summary}</td>
    </tr>
  );
};

export default ChangesetInfo;
