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
});
