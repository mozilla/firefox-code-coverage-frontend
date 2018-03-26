import ChangesetDescription from './changesetDescription';
import eIcon from '../static/noun_205162_cc.png';
import dummyIcon from '../static/dummyIcon16x16.png';

const ChangesetInfo = ({ changeset }) => {
  const {
    authorInfo, desc, hidden, bzUrl, node, summary, summaryClassName,
  } = changeset;
  const hgUrl = changeset.coverage.hgRev;
  const handleClick = (e) => {
    if (e.target.tagName.toLowerCase() === 'td') {
      window.open(`/#/changeset/${node}`, '_blank');
    } else {
      e.stopPropagation();
    }
  };
  return (
    <tr className={(hidden) ? 'hidden-changeset' : 'changeset'} onClick={e => handleClick(e)}>
      <td className="changeset-author">
        {(authorInfo.email) ?
          <a href={`mailto: ${authorInfo.email}`}>
            <img className="eIcon" src={eIcon} alt="email icon" />
          </a> : <img className="icon-substitute" src={dummyIcon} alt="placeholder icon" />
        }
        <span className="changeset-eIcon-align">{authorInfo.name.substring(0, 60)}</span>
      </td>
      <td className="changeset-hg">
        {(hgUrl) ?
          <a href={hgUrl} target="_blank">{node.substring(0, 12)}</a>
          : <span>{node.substring(0, 12)}</span>}
      </td>
      <td>
        <ChangesetDescription description={desc} bzUrl={bzUrl} />
      </td>
      <td className={`changeset-summary ${summaryClassName}`}>{summary}</td>
    </tr>
  );
};

export default ChangesetInfo;
