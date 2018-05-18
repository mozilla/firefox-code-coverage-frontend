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
    sortingMethod: sortingMethods.DATE,
    sortingReversed: false,
  }

  onClickNextSorting() {
    if (this.state.sortingMethod === sortingMethods.DATE) {
      this.setState({ sortingMethod: sortingMethods.COVERAGE });
    } else if (!this.state.sortingReversed) {
      this.setState({ sortingReversed: true });
    } else {
      this.setState({
        sortingMethod: sortingMethods.DATE,
        sortingReversed: false,
      });
    }
  }

  displaySortingStatusIcon() {
    const { sortingMethod, sortingReversed } = this.state;
    if (sortingMethod === sortingMethods.DATE) {
      return <MenuRightIcon />;
    }
    if (sortingMethod === sortingMethods.COVERAGE) {
      return sortingReversed ? <MenuDownIcon /> : <MenuUpIcon />;
    }
    return undefined;
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
            <th onClick={() => this.onClickNextSorting()}>
              {this.displaySortingStatusIcon()}
              <span>Coverage summary</span>
            </th>
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
  }
}
