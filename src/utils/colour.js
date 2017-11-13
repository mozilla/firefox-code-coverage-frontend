const chroma = require('chroma-js');

export const getPercentCovColor = percent => chroma.scale(['red', 'yellow', 'green']).mode('lab')(percent);
