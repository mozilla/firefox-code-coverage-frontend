export const arrayToMap = (csets = []) => {
  const newCsets = {};
  csets.forEach((cset) => {
    newCsets[cset.node] = cset;
  });
  return newCsets;
};

export const mapToArray = (csets = {}) => (
  Object.keys(csets).map(node => csets[node])
);

export const filterUnsupportedExtensions = (parsedDiff = {}, supportedExtensions = []) => {
  if (supportedExtensions.length === 0) {
    return parsedDiff;
  }
  const newDiff = [];
  parsedDiff.forEach((p) => {
    const extensionTo = p.to.split('.').pop();
    if (supportedExtensions.indexOf(extensionTo) >= 0) {
      newDiff.push(p);
    }
  });
  return newDiff;
};
