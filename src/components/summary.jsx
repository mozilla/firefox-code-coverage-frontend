import { Component } from 'react';
import MenuDownIcon from 'mdi-react/MenuDownIcon';
import MenuRightIcon from 'mdi-react/MenuRightIcon';
import MenuUpIcon from 'mdi-react/MenuUpIcon';
import ChangesetInfo from './changesetInfo';
import {
  sortChangesetsByCoverage,
  sortChangesetsNewestFirst,
  sortingMethods,
} from '../utils/data';

export default class Summary extends Component {
  state = {
    sortingIcon: <MenuRightIcon />,
    sortingMethod: sortingMethods.DATE,
    sortingReversed: false,
  }

  onClickNextSorting() {
    if (this.state.sortingMethod === sortingMethods.DATE) {
      this.setState({
        sortingIcon: <MenuDownIcon />,
        sortingMethod: sortingMethods.COVERAGE,
      });
    } else if (!this.state.sortingReversed) {
      this.setState({
        sortingIcon: <MenuUpIcon />,
        sortingReversed: true,
      });
    } else {
      this.setState({
        sortingIcon: <MenuRightIcon />,
        sortingMethod: sortingMethods.DATE,
        sortingReversed: false,
      });
    }
  }

  sortedChangesets() {
    const { changesets, changesetsCoverage } = this.props;
    if (this.state.sortingMethod === sortingMethods.DATE) {
      return sortChangesetsNewestFirst(changesets, changesetsCoverage);
    }
    return sortChangesetsByCoverage(changesets, changesetsCoverage, this.state.sortingReversed);
  }

  render() {
    const { changesets, changesetsCoverage } = this.props;

    const sortedChangesets = this.sortedChangesets();

    return (
      <table className="changeset-viewer">
        <tbody>
          <tr>
            <th>Author</th>
            <th>Changeset</th>
            <th>Description</th>
            <th
              onClick={() => this.onClickNextSorting()}
              title={'sorted by date (click to sort by coverage)'}
              style={{ cursor: 'pointer' }}
            >
              {this.state.sortingIcon}
              <span>Coverage summary</span>
            </th>
          </tr>
          {sortedChangesets.map(node => (
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
  }
}
