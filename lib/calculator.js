/**
 *
 * Reldens - Calculator
 *
 */

const ModifierConst = require('./constants');

class Calculator
{

    calculateNewValue(originalValue, operation, operationValue, revert)
    {
        let isIncrease = operation === ModifierConst.OPS.INC;
        let isDecrease = operation === ModifierConst.OPS.DEC;
        if((isIncrease && !revert) || (isDecrease && revert)){
            return originalValue + operationValue;
        }
        if((isDecrease && !revert) || (isIncrease && revert)){
            return originalValue - operationValue;
        }
        let isMultiplication = operation === ModifierConst.OPS.MUL;
        let isDivision = operation === ModifierConst.OPS.DIV;
        if((isMultiplication && !revert) || (isDivision && revert)){
            return originalValue * operationValue;
        }
        if((isDivision && !revert) || (isMultiplication && revert)){
            return originalValue / operationValue;
        }
        let isIncreasePercentage = operation === ModifierConst.OPS.INC_P;
        if((isIncreasePercentage && !revert)){
            return originalValue + Math.round(originalValue * operationValue / 100);
        }
        if(isIncreasePercentage && revert){
            let revertValue = Math.ceil(originalValue - (originalValue / (100 - operationValue)) * 100);
            return originalValue + revertValue;
        }
        let isDecreasePercentage = operation === ModifierConst.OPS.DEC_P;
        if((isDecreasePercentage && !revert)){
            return originalValue - Math.round(originalValue * operationValue / 100);
        }
        if(isDecreasePercentage && revert){
            let revertValue = Math.ceil((originalValue / (100 - operationValue)) * 100 - originalValue);
            return originalValue + revertValue;
        }
    }

}

module.exports = Calculator;
