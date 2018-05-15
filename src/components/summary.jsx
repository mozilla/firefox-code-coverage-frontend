import ChangesetInfo from './changesetInfo';

const Summary = ({ changesetsCoverage, sortedChangesets }) => (
  <table className="changeset-viewer">
    <tbody>
      <tr>
        <th>Author</th>
        <th>Changeset</th>
        <th>Description</th>
        <th>Coverage summary</th>
      </tr>
      {sortedChangesets.map(changeset => (
        <ChangesetInfo
          key={changeset.node}
          changeset={changeset}
          summary={changesetsCoverage[changeset.node].summary}
          summaryClassName={changesetsCoverage[changeset.node].summaryClassName}
        />
      ))}
    </tbody>
  </table>
);

export default Summary;
