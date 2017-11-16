const chroma = require('chroma-js');

export const getPercentCovColor = percent => chroma.scale(['red', 'yellow', 'green']).mode('lab')(percent);

export const getLineHitCovColor = percent => chroma.scale(['dfd', 'a1fc83']).mode('lab')(percent);
