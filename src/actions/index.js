import * as types from './actionTypes';

export const addChangeset = changeset => ({
  type: types.ADD_CHANGESET,
  data: changeset,
});

export const addChangesets = changesets => ({
  type: types.ADD_CHANGESETS,
  data: changesets,
});

export const addChangesetCoverage = changesetCoverage => ({
  type: types.ADD_CHANGESET_COVERAGE,
  data: changesetCoverage,
});

export const addChangesetsCoverage = changesetsCoverage => ({
  type: types.ADD_CHANGESETS_COVERAGE,
  data: changesetsCoverage,
});
