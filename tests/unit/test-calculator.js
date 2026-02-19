/**
 *
 * Reldens - Calculator Unit Tests
 *
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const Calculator = require('../../lib/calculator');
const ModifierConst = require('../../lib/constants');

describe('Calculator', () => {
    let calculator;

    describe('Constructor', () => {
        it('should create calculator instance', () => {
            calculator = new Calculator();
            assert.ok(calculator instanceof Calculator);
        });
    });

    describe('calculateNewValue - INC (Increment)', () => {
        it('should add value when not reverting', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.INC, 25, false);
            assert.strictEqual(result, 125);
        });

        it('should subtract value when reverting', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(125, ModifierConst.OPS.INC, 25, true);
            assert.strictEqual(result, 100);
        });

        it('should handle negative values', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(50, ModifierConst.OPS.INC, -20, false);
            assert.strictEqual(result, 30);
        });

        it('should handle zero', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.INC, 0, false);
            assert.strictEqual(result, 100);
        });
    });

    describe('calculateNewValue - DEC (Decrement)', () => {
        it('should subtract value when not reverting', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.DEC, 30, false);
            assert.strictEqual(result, 70);
        });

        it('should add value when reverting', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(70, ModifierConst.OPS.DEC, 30, true);
            assert.strictEqual(result, 100);
        });

        it('should handle negative results', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(50, ModifierConst.OPS.DEC, 80, false);
            assert.strictEqual(result, -30);
        });
    });

    describe('calculateNewValue - MUL (Multiply)', () => {
        it('should multiply value when not reverting', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(50, ModifierConst.OPS.MUL, 3, false);
            assert.strictEqual(result, 150);
        });

        it('should divide value when reverting', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(150, ModifierConst.OPS.MUL, 3, true);
            assert.strictEqual(result, 50);
        });

        it('should handle decimal multiplication', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.MUL, 1.5, false);
            assert.strictEqual(result, 150);
        });

        it('should handle multiplication by zero', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.MUL, 0, false);
            assert.strictEqual(result, 0);
        });
    });

    describe('calculateNewValue - DIV (Divide)', () => {
        it('should divide value when not reverting', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(60, ModifierConst.OPS.DIV, 2, false);
            assert.strictEqual(result, 30);
        });

        it('should multiply value when reverting', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(30, ModifierConst.OPS.DIV, 2, true);
            assert.strictEqual(result, 60);
        });

        it('should handle decimal division', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.DIV, 4, false);
            assert.strictEqual(result, 25);
        });
    });

    describe('calculateNewValue - INC_P (Increase Percentage)', () => {
        it('should increase by percentage when not reverting', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(200, ModifierConst.OPS.INC_P, 50, false);
            assert.strictEqual(result, 300);
        });

        it('should apply percentage increase with rounding', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.INC_P, 33, false);
            assert.strictEqual(result, 133); // 100 + Math.round(100 * 33 / 100)
        });

        it('should revert percentage increase correctly', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(300, ModifierConst.OPS.INC_P, 50, true);
            assert.strictEqual(result, 200); // Math.round(300 / (1 + 50/100))
        });

        it('should handle 100% increase', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.INC_P, 100, false);
            assert.strictEqual(result, 200);
        });
    });

    describe('calculateNewValue - DEC_P (Decrease Percentage)', () => {
        it('should decrease by percentage when not reverting', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.DEC_P, 25, false);
            assert.strictEqual(result, 75);
        });

        it('should apply percentage decrease with rounding', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.DEC_P, 33, false);
            assert.strictEqual(result, 67); // 100 - Math.round(100 * 33 / 100)
        });

        it('should revert percentage decrease correctly', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(75, ModifierConst.OPS.DEC_P, 25, true);
            assert.strictEqual(result, 100); // Math.round(75 / (1 - 25/100))
        });

        it('should handle 50% decrease', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(200, ModifierConst.OPS.DEC_P, 50, false);
            assert.strictEqual(result, 100);
        });
    });

    describe('Edge Cases', () => {
        it('should handle very large numbers', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(1000000, ModifierConst.OPS.INC, 500000, false);
            assert.strictEqual(result, 1500000);
        });

        it('should handle very small decimal values', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(0.5, ModifierConst.OPS.MUL, 2, false);
            assert.strictEqual(result, 1);
        });

        it('should handle negative base values with percentage operations', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(-100, ModifierConst.OPS.INC_P, 50, false);
            assert.strictEqual(result, -150);
        });
    });

    describe('Invalid Operation Codes', () => {
        it('should return original value for string operation code', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, 'invalid', 50, false);
            assert.strictEqual(result, 100);
        });

        it('should return original value for null operation code', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, null, 50, false);
            assert.strictEqual(result, 100);
        });

        it('should return original value for undefined operation code', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, undefined, 50, false);
            assert.strictEqual(result, 100);
        });

        it('should return original value for invalid number operation code', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, 999, 50, false);
            assert.strictEqual(result, 100);
        });

        it('should return original value for negative operation code', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, -1, 50, false);
            assert.strictEqual(result, 100);
        });

        it('should return original value for zero operation code', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, 0, 50, false);
            assert.strictEqual(result, 100);
        });
    });

    describe('NaN Inputs', () => {
        it('should handle NaN originalValue with INC', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(NaN, ModifierConst.OPS.INC, 50, false);
            assert.ok(Number.isNaN(result));
        });

        it('should handle NaN operationValue with INC', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.INC, NaN, false);
            assert.ok(Number.isNaN(result));
        });

        it('should handle NaN originalValue with MUL', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(NaN, ModifierConst.OPS.MUL, 2, false);
            assert.ok(Number.isNaN(result));
        });

        it('should handle NaN operationValue with MUL', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.MUL, NaN, false);
            assert.ok(Number.isNaN(result));
        });

        it('should handle NaN in percentage operations', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(NaN, ModifierConst.OPS.INC_P, 50, false);
            assert.ok(Number.isNaN(result));
        });
    });

    describe('Infinity Inputs', () => {
        it('should handle Infinity originalValue with INC', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(Infinity, ModifierConst.OPS.INC, 50, false);
            assert.strictEqual(result, Infinity);
        });

        it('should handle Infinity operationValue with INC', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.INC, Infinity, false);
            assert.strictEqual(result, Infinity);
        });

        it('should handle negative Infinity with DEC', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.DEC, Infinity, false);
            assert.strictEqual(result, -Infinity);
        });

        it('should handle Infinity with MUL', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(Infinity, ModifierConst.OPS.MUL, 2, false);
            assert.strictEqual(result, Infinity);
        });

        it('should handle Infinity with DIV', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(Infinity, ModifierConst.OPS.DIV, 2, false);
            assert.strictEqual(result, Infinity);
        });

        it('should handle division of number by Infinity', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.DIV, Infinity, false);
            assert.strictEqual(result, 0);
        });
    });

    describe('Division By Zero', () => {
        it('should handle division by zero', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.DIV, 0, false);
            assert.strictEqual(result, Infinity);
        });

        it('should handle negative division by zero', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(-100, ModifierConst.OPS.DIV, 0, false);
            assert.strictEqual(result, -Infinity);
        });

        it('should handle zero divided by zero', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(0, ModifierConst.OPS.DIV, 0, false);
            assert.ok(Number.isNaN(result));
        });
    });

    describe('Zero Values', () => {
        it('should handle zero originalValue with all operations', () => {
            calculator = new Calculator();
            assert.strictEqual(calculator.calculateNewValue(0, ModifierConst.OPS.INC, 50, false), 50);
            assert.strictEqual(calculator.calculateNewValue(0, ModifierConst.OPS.DEC, 50, false), -50);
            assert.strictEqual(calculator.calculateNewValue(0, ModifierConst.OPS.MUL, 50, false), 0);
            assert.strictEqual(calculator.calculateNewValue(0, ModifierConst.OPS.DIV, 50, false), 0);
        });

        it('should handle zero operationValue with INC', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.INC, 0, false);
            assert.strictEqual(result, 100);
        });

        it('should handle zero operationValue with DEC', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.DEC, 0, false);
            assert.strictEqual(result, 100);
        });

        it('should handle zero operationValue with MUL', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.MUL, 0, false);
            assert.strictEqual(result, 0);
        });

        it('should handle zero percentage operations', () => {
            calculator = new Calculator();
            assert.strictEqual(calculator.calculateNewValue(100, ModifierConst.OPS.INC_P, 0, false), 100);
            assert.strictEqual(calculator.calculateNewValue(100, ModifierConst.OPS.DEC_P, 0, false), 100);
        });
    });

    describe('Percentage Operation Edge Cases', () => {
        it('should handle 100% decrease', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.DEC_P, 100, false);
            assert.strictEqual(result, 0);
        });

        it('should handle over 100% decrease', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.DEC_P, 150, false);
            assert.strictEqual(result, -50);
        });

        it('should handle 200% increase', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.INC_P, 200, false);
            assert.strictEqual(result, 300);
        });

        it('should handle very large percentage increase', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.INC_P, 1000, false);
            assert.strictEqual(result, 1100);
        });

        it('should handle decimal percentage values', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.INC_P, 33.333, false);
            assert.strictEqual(result, 133);
        });

        it('should handle negative percentage values for INC_P', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.INC_P, -50, false);
            assert.strictEqual(result, 50);
        });

        it('should handle negative percentage values for DEC_P', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.DEC_P, -50, false);
            assert.strictEqual(result, 150);
        });
    });

    describe('Revert Flag Edge Cases', () => {
        it('should handle revert=null as false', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.INC, 50, null);
            assert.strictEqual(result, 150);
        });

        it('should handle revert=undefined as false', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.INC, 50, undefined);
            assert.strictEqual(result, 150);
        });

        it('should handle revert=0 as false', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.INC, 50, 0);
            assert.strictEqual(result, 150);
        });

        it('should handle revert=1 as true', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(150, ModifierConst.OPS.INC, 50, 1);
            assert.strictEqual(result, 100);
        });

        it('should handle revert="true" string as true', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(150, ModifierConst.OPS.INC, 50, 'true');
            assert.strictEqual(result, 100);
        });
    });

    describe('Negative Values', () => {
        it('should handle negative originalValue with INC', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(-100, ModifierConst.OPS.INC, 50, false);
            assert.strictEqual(result, -50);
        });

        it('should handle negative originalValue with DEC', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(-100, ModifierConst.OPS.DEC, 50, false);
            assert.strictEqual(result, -150);
        });

        it('should handle negative originalValue with MUL', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(-100, ModifierConst.OPS.MUL, 2, false);
            assert.strictEqual(result, -200);
        });

        it('should handle negative originalValue with DIV', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(-100, ModifierConst.OPS.DIV, 2, false);
            assert.strictEqual(result, -50);
        });

        it('should handle negative operationValue with INC', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.INC, -50, false);
            assert.strictEqual(result, 50);
        });

        it('should handle negative operationValue with MUL', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.MUL, -2, false);
            assert.strictEqual(result, -200);
        });

        it('should handle both negative values with MUL', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(-100, ModifierConst.OPS.MUL, -2, false);
            assert.strictEqual(result, 200);
        });
    });

    describe('Very Large Numbers', () => {
        it('should handle MAX_SAFE_INTEGER with INC', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(Number.MAX_SAFE_INTEGER, ModifierConst.OPS.INC, 1, false);
            assert.strictEqual(result, Number.MAX_SAFE_INTEGER+1);
        });

        it('should handle MIN_SAFE_INTEGER with DEC', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(Number.MIN_SAFE_INTEGER, ModifierConst.OPS.DEC, 1, false);
            assert.strictEqual(result, Number.MIN_SAFE_INTEGER-1);
        });

        it('should handle MAX_VALUE with INC', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(Number.MAX_VALUE, ModifierConst.OPS.INC, Number.MAX_VALUE, false);
            assert.strictEqual(result, Infinity);
        });
    });

    describe('Rounding in Percentage Operations', () => {
        it('should round INC_P results correctly', () => {
            calculator = new Calculator();
            let result1 = calculator.calculateNewValue(100, ModifierConst.OPS.INC_P, 33.33, false);
            assert.strictEqual(result1, 133);
            let result2 = calculator.calculateNewValue(100, ModifierConst.OPS.INC_P, 33.66, false);
            assert.strictEqual(result2, 134);
        });

        it('should round DEC_P results correctly', () => {
            calculator = new Calculator();
            let result1 = calculator.calculateNewValue(100, ModifierConst.OPS.DEC_P, 33.33, false);
            assert.strictEqual(result1, 67);
            let result2 = calculator.calculateNewValue(100, ModifierConst.OPS.DEC_P, 33.66, false);
            assert.strictEqual(result2, 66);
        });

        it('should round negative percentage increase', () => {
            calculator = new Calculator();
            let result = calculator.calculateNewValue(100, ModifierConst.OPS.INC_P, 0.1, false);
            assert.strictEqual(result, 100);
        });
    });
});
