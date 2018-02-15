import * as Chroma from 'chroma-js';

const getPercentCovColor = percent =>
  // warm red, lemon yellow, neon green
  Chroma.scale(['#ff4f5e', '#fff44f', '#54ffbd']).mode('lab')(percent / 100);

export default getPercentCovColor;
