import bzIcon from '../static/bugzilla.png';

const ChangesetDescription = ({ description, bzUrl }) => (
  <div className="changeset-description">
    {description.substring(0, 40).padEnd(40)}
    {(bzUrl) ?
      <a href={bzUrl} target="_blank">
        <img className="bzIcon" src={bzIcon} alt="bugzilla icon" />
      </a>
      : undefined}
  </div>
);

export default ChangesetDescription;
