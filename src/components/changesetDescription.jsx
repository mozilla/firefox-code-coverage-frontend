import bzIcon from '../static/bugzilla.png';
import dummyIcon from '../static/dummyIcon16x16.png';

const ChangesetDescription = ({ description, bzUrl }) => (
  <div className="changeset-description">
    {(bzUrl) ?
      <a href={bzUrl} target="_blank">
        <img className="bzIcon" src={bzIcon} alt="bugzilla icon" />
      </a>
      : <i className="icon-substitute" src={dummyIcon} />}
    {description.substring(0, 40).padEnd(40)}
  </div>
);

export default ChangesetDescription;
