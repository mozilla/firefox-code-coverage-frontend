const Mustache = require('mustache');

const DEBUG = true;

const validateTemplate = (template) => {
  if (typeof template !== 'string') {
    throw Error(`Template: ${template} has to be a string`);
  }
};

export const note = (template, params) => {
  try {
    validateTemplate(template);
    console.log(Mustache.render(template, params));
  } catch (err) {
    throw Error(`Problem logging: ${err}`);
  }
};

export const error = (template, params) => {
  try {
    validateTemplate(template);
    console.error(Mustache.render(template, params));
  } catch (err) {
    throw Error(`Problem logging: ${err}`);
  }
};

export const debug = (value) => {
  try {
    if (DEBUG) {
      console.log(value);
    }
  } catch (err) {
    throw Error(`Problem logging: ${err}`);
  }
};
