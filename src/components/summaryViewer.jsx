import ChangesetInfo from './changesetInfo';

const ChangesetsViewer = ({ changesets }) => (
  <table className="changeset-viewer">
    <tbody>
      <tr>
        <th>Author</th>
        <th>Changeset</th>
        <th>Description</th>
        <th>Coverage summary</th>
      </tr>
      {Object.keys(changesets).map(node => (
        <ChangesetInfo
          key={node}
          changeset={changesets[node]}
        />
      ))}
    </tbody>
  </table>
);

export default ChangesetsViewer;
