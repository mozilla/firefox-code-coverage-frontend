const isMap = (val) => {
  if (val === null) { return false;}
  return (typeof val == 'object')
};


/**
 * IF dest[k]==undefined THEN ASSIGN arguments[i][k]
 * @param dest - the object to be updated (use null to fill a new object)
 * @param sources - objects with properties to update dest with (if not already set)
 * @returns `dest` recursively updated by sources
 */
export const recursiveExtend = (dest, ...sources) => {
  function _setDefault(dest, source, path) {
    let keys = Object.keys(source);
    for (let k = 0; k < keys.length; k++) {
      let key = keys[k];
      let value = dest[key];
      if (value === null) {
        dest[key] = source[key];
      } else if (!isMap(value)) {
        // do nothing
      } else if (path.indexOf(value) !== -1) {
        // do nothing
      } else {
        dest[key] = _setDefault(value, source[key], path.concat([value]));
      }
    }
    return dest;
  }

  for (let source of sources){
    if (source === undefined) {
      // do nothing
    } else if (dest === null) {
      if (isMap(source)) {
        return _setDefault({}, source, []);
      } else {
        dest = source;
        break;
      }
    } else if (isMap(dest)) {
      return _setDefault(dest, source, []);
    } else {
      break;
    }
  }
  return dest;
};

