// checks if an object is empty and returns true or false
const isEmptyObject = (object) => {
  /* eslint-disable no-unneeded-ternary */
  // necessary for correct props in test
  return Object.keys(object).length ? true : false;
  /* eslint-enable */
};

export default isEmptyObject;
