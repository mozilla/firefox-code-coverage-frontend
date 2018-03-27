import bzIcon from '../static/bugzilla.png';
import { bzUrl } from '../utils/hg';

const BugzillaIconLink = ({ description }) => (
  <a href={bzUrl(description)} target="_blank">
    <img className="bzIcon" src={bzIcon} alt="" />
  </a>
);

export default BugzillaIconLink;
