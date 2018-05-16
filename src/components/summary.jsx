import ChangesetInfo from './changesetInfo';

const Summary = ({ changesets, changesetsCoverage, sortedChangesets, onSortByCoverage }) => (
  <table className="changeset-viewer">
    <tbody>
      <tr>
        <th>Author</th>
        <th>Changeset</th>
        <th>Description</th>
        <th onClick={() => onSortByCoverage()}>Coverage summary</th>
      </tr>
      {sortedChangesets.map(({ node }) => (
        <ChangesetInfo
          key={node}
          changeset={changesets[node]}
          summary={changesetsCoverage[node].summary}
          summaryClassName={changesetsCoverage[node].summaryClassName}
        />
      ))}
    </tbody>
  </table>
);

export default Summary;
