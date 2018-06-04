/* global describe it */
import {
  arrayToMap,
  mapToArray,
  filterUnsupportedExtensions,
  sortChangesetsByCoverage,
  sortChangesetsNewestFirst,
} from '../../src/utils/data';
import * as dummyData from '../dummy.test';

const changesetMocks = require('../mocks/changesetsMocks.json');
const changesetsCoverageMock = require('../mocks/changesetsCoverageMock.json');
const sortedChangesetsByRecency = require('../expected/sortedChangesetsByRecency');
const sortedChangesetsByLowCoverage = require('../expected/sortedChangesetsByLowCoverage');
const sortedChangesetsByHighCoverage = require('../expected/sortedChangesetsByHighCoverage');

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

describe('Sorting of changesets and coverage', () => {
  it('should sort by recency of changesets', () => {
    const actual = sortChangesetsNewestFirst(changesetMocks, changesetsCoverageMock);
    assert.deepEqual(actual, sortedChangesetsByRecency);
  });
  it('should sort by lowest coverage', () => {
    const actual = sortChangesetsByCoverage(changesetMocks, changesetsCoverageMock);
    assert.deepEqual(actual, sortedChangesetsByLowCoverage);
  });
  it('should sort by highest coverage', () => {
    const actual = sortChangesetsByCoverage(changesetMocks, changesetsCoverageMock, true);
    assert.deepEqual(actual, sortedChangesetsByHighCoverage);
  });
});
