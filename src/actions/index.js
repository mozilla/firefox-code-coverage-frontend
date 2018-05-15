import * as types from './actionTypes';

export const addChangesets = changesets => ({
  type: types.ADD_CHANGESETS,
  data: changesets,
});

export const addChangesetsCoverage = changesetsCoverage => ({
  type: types.ADD_CHANGESETS_COVERAGE,
  data: changesetsCoverage,
});
