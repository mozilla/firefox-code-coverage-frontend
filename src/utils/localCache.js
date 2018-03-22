import { clear } from 'localforage';

export default () => {
  try {
    clear();
    return true;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
