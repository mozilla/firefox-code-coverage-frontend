import * as data from '../src/utils/data';
import * as dummyData from '../test/dummyData';
const assert = require('assert');

describe('Data structure converters', () => {
  describe('arrayToMap', () => {
    it('should return a map of node:changeset pairs', () => {
      const csetMap = data.arrayToMap(dummyData.changesetsArray);
      assert.deepEqual(csetMap, dummyData.changesetsMap);
    });
  });
  describe('mapToArray', () => {
    it('should return an array of changesets', () => {
      const csetArray = data.mapToArray(dummyData.changesetsMap);
      assert.deepEqual(csetArray, dummyData.changesetsArray);
    });
  });
});

describe('Coverage summary reports', () => {
  describe('fileRevisionCoverageSummary', () => {
    it('should return an object containing added/covered lines and coverage percentage.', () => {
      // const summary = data.fileRevisionCoverageSummary(coverage);
      // assert.equal(summary.addedLines, 4);
      // assert.equal(summary.coveredLines, 10);
      // assert.equal(summary.percentage, 40);
    });
  });
  describe('coverageSummaryText', () => {
    it('should return an object containing coverage text and category', () => {
      const summary = data.coverageSummaryText();
      assert.equal();
    });
  });
});

describe('Coverage data calculations', () => {
  describe('fileCoveragePercent', () => {
    it('should return the percent of covered lines in a file', () => {
      const percent = data.fileCoveragePercent(dummyData.fileCoverage);
      assert.equal();
    });
  });
  describe('transformCoverageData', () => {
    it('should return a reformatted changeset coverage object', () => {
      // transformCoverageData();
      // assert.equal();
    });
  });
  // I don't know how exactly to best test this as of right now since changesets
  // are not permanently stored.
  // Perhaps also test if endpoints are hitting correctly--this requires
  // non-expiring changesets on the backend as well.
  // describe('csetWithCcovData', () => {
  //
  // });
});

describe('Endpoints', () => {
  describe('TBD', () => {
    it('TBD', () => {

    });
  });
});
