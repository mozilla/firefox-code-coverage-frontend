import * as Chroma from 'chroma-js';

export const getPercentCovColor = percent =>
  Chroma.scale(['red', 'yellow', 'green']).mode('lab')(percent);

export const getLineHitCovColor = percent =>
  Chroma.scale(['dfd', 'a1fc83']).mode('lab')(percent);
