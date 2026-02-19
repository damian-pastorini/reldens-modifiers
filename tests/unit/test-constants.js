/**
 *
 * Reldens - Constants Unit Tests
 *
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const ModifierConst = require('../../lib/constants');

describe('Constants', () => {
    describe('OPS (Operations)', () => {
        it('should export INC operation', () => {
            assert.strictEqual(ModifierConst.OPS.INC, 1);
        });

        it('should export DEC operation', () => {
            assert.strictEqual(ModifierConst.OPS.DEC, 2);
        });

        it('should export DIV operation', () => {
            assert.strictEqual(ModifierConst.OPS.DIV, 3);
        });

        it('should export MUL operation', () => {
            assert.strictEqual(ModifierConst.OPS.MUL, 4);
        });

        it('should export INC_P operation', () => {
            assert.strictEqual(ModifierConst.OPS.INC_P, 5);
        });

        it('should export DEC_P operation', () => {
            assert.strictEqual(ModifierConst.OPS.DEC_P, 6);
        });

        it('should export SET operation', () => {
            assert.strictEqual(ModifierConst.OPS.SET, 7);
        });

        it('should export METHOD operation', () => {
            assert.strictEqual(ModifierConst.OPS.METHOD, 8);
        });

        it('should export SET_N operation', () => {
            assert.strictEqual(ModifierConst.OPS.SET_N, 9);
        });

        it('should have all operations defined', () => {
            assert.ok(ModifierConst.OPS.INC);
            assert.ok(ModifierConst.OPS.DEC);
            assert.ok(ModifierConst.OPS.DIV);
            assert.ok(ModifierConst.OPS.MUL);
            assert.ok(ModifierConst.OPS.INC_P);
            assert.ok(ModifierConst.OPS.DEC_P);
            assert.ok(ModifierConst.OPS.SET);
            assert.ok(ModifierConst.OPS.METHOD);
            assert.ok(ModifierConst.OPS.SET_N);
        });
    });

    describe('COMPARE (Comparison Operators)', () => {
        it('should export EQ comparison', () => {
            assert.strictEqual(ModifierConst.COMPARE.EQ, 'eq');
        });

        it('should export NE comparison', () => {
            assert.strictEqual(ModifierConst.COMPARE.NE, 'ne');
        });

        it('should export LT comparison', () => {
            assert.strictEqual(ModifierConst.COMPARE.LT, 'lt');
        });

        it('should export GT comparison', () => {
            assert.strictEqual(ModifierConst.COMPARE.GT, 'gt');
        });

        it('should export LE comparison', () => {
            assert.strictEqual(ModifierConst.COMPARE.LE, 'le');
        });

        it('should export GE comparison', () => {
            assert.strictEqual(ModifierConst.COMPARE.GE, 'ge');
        });

        it('should have all comparisons defined', () => {
            assert.ok(ModifierConst.COMPARE.EQ);
            assert.ok(ModifierConst.COMPARE.NE);
            assert.ok(ModifierConst.COMPARE.LT);
            assert.ok(ModifierConst.COMPARE.GT);
            assert.ok(ModifierConst.COMPARE.LE);
            assert.ok(ModifierConst.COMPARE.GE);
        });
    });

    describe('TYPES (Data Types)', () => {
        it('should export INT type', () => {
            assert.strictEqual(ModifierConst.TYPES.INT, 'int');
        });

        it('should export STRING type', () => {
            assert.strictEqual(ModifierConst.TYPES.STRING, 'string');
        });

        it('should have both types defined', () => {
            assert.ok(ModifierConst.TYPES.INT);
            assert.ok(ModifierConst.TYPES.STRING);
        });
    });

    describe('State Constants', () => {
        it('should export MOD_MISSING_KEY', () => {
            assert.strictEqual(ModifierConst.MOD_MISSING_KEY, 'mk');
        });

        it('should export MOD_MISSING_PROPERTY_KEY', () => {
            assert.strictEqual(ModifierConst.MOD_MISSING_PROPERTY_KEY, 'mpk');
        });

        it('should export MOD_MISSING_OPERATION', () => {
            assert.strictEqual(ModifierConst.MOD_MISSING_OPERATION, 'mo');
        });

        it('should export MOD_MISSING_VALUE', () => {
            assert.strictEqual(ModifierConst.MOD_MISSING_VALUE, 'mv');
        });

        it('should export MOD_READY', () => {
            assert.strictEqual(ModifierConst.MOD_READY, 'mre');
        });

        it('should export MOD_APPLIED', () => {
            assert.strictEqual(ModifierConst.MOD_APPLIED, 'ma');
        });

        it('should export MOD_REVERTED', () => {
            assert.strictEqual(ModifierConst.MOD_REVERTED, 'mr');
        });

        it('should export MOD_UNDEFINED_TARGET', () => {
            assert.strictEqual(ModifierConst.MOD_UNDEFINED_TARGET, 'mut');
        });

        it('should export MOD_INVALID_CONDITIONS', () => {
            assert.strictEqual(ModifierConst.MOD_INVALID_CONDITIONS, 'mic');
        });

        it('should export MOD_MISSING_CONDITION_INSTANCE', () => {
            assert.strictEqual(ModifierConst.MOD_MISSING_CONDITION_INSTANCE, 'mmci');
        });

        it('should export MOD_MODIFIER_ERROR', () => {
            assert.strictEqual(ModifierConst.MOD_MODIFIER_ERROR, 'me');
        });

        it('should have all state constants defined', () => {
            assert.ok(ModifierConst.MOD_MISSING_KEY);
            assert.ok(ModifierConst.MOD_MISSING_PROPERTY_KEY);
            assert.ok(ModifierConst.MOD_MISSING_OPERATION);
            assert.ok(ModifierConst.MOD_MISSING_VALUE);
            assert.ok(ModifierConst.MOD_READY);
            assert.ok(ModifierConst.MOD_APPLIED);
            assert.ok(ModifierConst.MOD_REVERTED);
            assert.ok(ModifierConst.MOD_UNDEFINED_TARGET);
            assert.ok(ModifierConst.MOD_INVALID_CONDITIONS);
            assert.ok(ModifierConst.MOD_MISSING_CONDITION_INSTANCE);
            assert.ok(ModifierConst.MOD_MODIFIER_ERROR);
        });
    });

    describe('Constant Structure', () => {
        it('should have OPS object', () => {
            assert.ok(typeof ModifierConst.OPS === 'object');
        });

        it('should have COMPARE object', () => {
            assert.ok(typeof ModifierConst.COMPARE === 'object');
        });

        it('should have TYPES object', () => {
            assert.ok(typeof ModifierConst.TYPES === 'object');
        });

        it('should export all top-level properties', () => {
            assert.ok(ModifierConst.OPS);
            assert.ok(ModifierConst.COMPARE);
            assert.ok(ModifierConst.TYPES);
            assert.ok(ModifierConst.MOD_MISSING_KEY);
            assert.ok(ModifierConst.MOD_READY);
        });
    });
});
