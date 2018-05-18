/* global describe it */
import { arrayToMap, filterUnsupportedExtensions } from '../../src/utils/data';
import * as dummyData from '../dummy.test';

const assert = require('assert');

describe('Data structure converters', () => {
  describe('arrayToMap', () => {
    it('should return a map of node:changeset pairs', () => {
      const csetMap = arrayToMap(dummyData.changesetsArray);
      assert.deepEqual(csetMap, dummyData.changesetsMap);
    });
  });
});

describe('Supported file extensions', () => {
  const newParsedDiff =
    filterUnsupportedExtensions(dummyData.parsedDiff, dummyData.supportedExtensions);
  it('should include .jsm files', () => {
    assert.equal(newParsedDiff.length, 1);
    assert.equal(newParsedDiff[0].to, 'layout/tools/reftest/globals.jsm');
  });
  it('should not include .list files', () => {
    let found = false;
    newParsedDiff.forEach((parsedFile) => {
      if (parsedFile.to.endsWith('list')) {
        found = true;
      }
    });
    assert.equal(found, false);
  });
  it('works even if supportedExtensions is undefined', () => {
    const parsedDiff =
      filterUnsupportedExtensions(dummyData.parsedDiff, undefined);
    assert.deepEqual(dummyData.parsedDiff, parsedDiff);
  });
});
