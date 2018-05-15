import { combineReducers } from 'redux';

import * as types from '../actions/actionTypes';
import { extendObject } from '../utils/data';

const changesets = (state = {}, action) => {
  switch (action.type) {
    case types.ADD_CHANGESETS: {
      const csets = action.data;
      return extendObject(state, csets);
    }
    default:
      return state;
  }
};

const changesetsCoverage = (state = {}, action) => {
  switch (action.type) {
    case types.ADD_CHANGESETS_COVERAGE: {
      const csetsCoverage = action.data;
      return extendObject(state, csetsCoverage);
    }
    default:
      return state;
  }
};

export default combineReducers({
  changesets,
  changesetsCoverage,
});
