/* eslint no-bitwise: ["error", { "allow": ["<<"] }] */

// djb2Code algorythm
// Based on http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
const hash = (str) => {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charCodeAt(i);
    h = ((h << 5) + h) + char; /* hash * 33 + c */
  }
  return h;
};

export default hash;
