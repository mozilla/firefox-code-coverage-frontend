/* global describe it */
import { arrayToMap, mapToArray } from '../src/utils/data';
import * as dummyData from '../test/dummy.test';

const assert = require('assert');

describe('Data structure converters', () => {
  describe('arrayToMap', () => {
    it('should return a map of node:changeset pairs', () => {
      const csetMap = arrayToMap(dummyData.changesetsArray);
      assert.deepEqual(csetMap, dummyData.changesetsMap);
    });
  });
  describe('mapToArray', () => {
    it('should return an array of changesets', () => {
      const csetArray = mapToArray(dummyData.changesetsMap);
      assert.deepEqual(csetArray, dummyData.changesetsArray);
    });
  });
});
