/* global describe it */
import { fileRevisionCoverageSummary, coverageSummaryText, transformCoverageData } from '../src/utils/coverage';
import * as dummyData from '../test/dummy.test';

const assert = require('assert');

describe('Coverage summary methods', () => {
  describe('fileRevisionCoverageSummary', () => {
    it('should return a summary of a file\'s covered and uncovered lines and percentage of total coverage', () => {
      const coverageFileRevision = fileRevisionCoverageSummary(dummyData.coverageFileRevision);
      assert.deepEqual(coverageFileRevision.coveredLines, [3, 4, 5, 6]);
      assert.deepEqual(coverageFileRevision.uncoveredLines, [1, 2, 7, 8, 9, 10]);
      assert.equal(coverageFileRevision.numCovLines, 4);
      assert.equal(coverageFileRevision.numUncovLines, 6);
      assert.equal(coverageFileRevision.numTotalLines, 10);
      assert.equal(coverageFileRevision.percentage, 40);
    });
  });
  describe('coverageSummaryText', () => {
    it('should return a low summary result', () => {
      const coverageLow = coverageSummaryText(dummyData.coverageLow);
      assert.equal(coverageLow.className, 'low-coverage');
      assert.equal(coverageLow.text, '0% - 0 lines covered out of 1 added');
    });
    it('should return a medium summary result', () => {
      const coverageMed = coverageSummaryText(dummyData.coverageMed);
      assert.equal(coverageMed.className, 'medium-coverage');
      assert.equal(coverageMed.text, '50% - 1 lines covered out of 2 added');
    });
    it('should return a high summary result', () => {
      const coverageHigh = coverageSummaryText(dummyData.coverageHigh);
      assert.equal(coverageHigh.className, 'high-coverage');
      assert.equal(coverageHigh.text, '100% - 1 lines covered out of 1 added');
    });
  });
  describe('transformCoverageData', () => {
    it('should return a summary object of coverage data', () => {
      const coverageTransform = transformCoverageData(dummyData.coverageTransform);
      assert.deepEqual(coverageTransform.diffs, dummyData.coverageHigh.diffs);
      assert.equal(coverageTransform.summary, '100% - 1 lines covered out of 1 added');
      assert.equal(coverageTransform.summaryClassName, 'high-coverage');
    });
  });
});
