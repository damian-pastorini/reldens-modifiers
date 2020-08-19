const ModifierConst = require('./constants');

class Calculator
{

    calculateNewValue(originalValue, operation, operationValue, revert)
    {
        // @NOTE: the following operations needs an opposite method for the revert.
        if(
            (operation === ModifierConst.OPS.INC && !revert)
            || (operation === ModifierConst.OPS.DEC && revert)
        ){
            originalValue = originalValue + operationValue;
        }
        if(
            (operation === ModifierConst.OPS.DEC && !revert)
            || (operation === ModifierConst.OPS.INC && revert)
        ){
            originalValue = originalValue - operationValue;
        }
        if(
            (operation === ModifierConst.OPS.MUL && !revert)
            || (operation === ModifierConst.OPS.DIV && revert)
        ){
            originalValue = originalValue * operationValue;
        }
        if(
            (operation === ModifierConst.OPS.DIV && !revert)
            || (operation === ModifierConst.OPS.MUL && revert)
        ){
            originalValue = originalValue / operationValue;
        }
        if(
            (operation === ModifierConst.OPS.INC_P && !revert)
            || (operation === ModifierConst.OPS.DEC_P && revert)
        ){
            if(revert){
                let revertValue = (Math.round(originalValue / (100 - operationValue))) * 100 - originalValue;
                originalValue = originalValue + revertValue;
            } else {
                originalValue = originalValue + Math.round(originalValue * operationValue / 100);
            }
        }
        if(
            (operation === ModifierConst.OPS.DEC_P && !revert)
            || (operation === ModifierConst.OPS.INC_P && revert)
        ){
            if(revert){
                let revertValue = originalValue - Math.round((originalValue / (100 - operationValue))) * 100;
                originalValue = originalValue - revertValue;
            } else {
                originalValue = originalValue - Math.round(originalValue * operationValue / 100);
            }
        }
        return originalValue;
    }

}

module.exports = Calculator;