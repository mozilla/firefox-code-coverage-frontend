import ChangesetInfo from './changesetInfo';

const Summary = ({ changesets, coverage }) => (
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
          summary={coverage[node].summary}
          summaryClassName={coverage[node].summaryClassName}
        />
      ))}
    </tbody>
  </table>
);

export default Summary;
