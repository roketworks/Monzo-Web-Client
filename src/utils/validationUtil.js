'use strict';

const validator = {
  validatePayday: (payday) => {
    const result = {};
    const lowerLimit = 1; 
    const upperLimit = 30;

    if (payday) {
      if (!isNumber(payday)){
        result.isValid = false; 
        result.message = 'Not a valid number';
      } else {
        if (payday <= upperLimit && payday >= lowerLimit){
          result.isValid = true; 
        } else {
          result.isValid = false; 
          result.message = 'Must be between ' + lowerLimit + ' and ' + upperLimit;
        }
      }
    }
    else {
      result.isValid = false; 
      result.message = 'No value provided'; 
    }

    return result;
  }
}; 

const isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

export default validator;