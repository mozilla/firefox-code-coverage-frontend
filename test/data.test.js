/* global describe it */
import { mapToArray } from '../src/utils/data';
import * as dummyData from '../test/dummy.test';

const assert = require('assert');

describe('Data structure converters', () => {
  describe('mapToArray', () => {
    it('should return an array of changesets', () => {
      const csetArray = mapToArray(dummyData.changesetsMap);
      assert.deepEqual(csetArray, dummyData.changesetsArray);
    });
  });
});
