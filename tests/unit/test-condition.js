/**
 *
 * Reldens - Condition Unit Tests
 *
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const Condition = require('../../lib/condition');
const ModifierConst = require('../../lib/constants');
const { TestHelpers } = require('../fixtures/test-helpers');

describe('Condition', () => {
    describe('Constructor', () => {
        it('should create condition with all required properties', () => {
            let condition = new Condition({
                key: 'test-condition',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GE,
                value: 10
            });
            assert.strictEqual(condition.key, 'test-condition');
            assert.strictEqual(condition.propertyKey, 'level');
            assert.strictEqual(condition.conditional, ModifierConst.COMPARE.GE);
            assert.strictEqual(condition.value, 10);
        });

        it('should throw error when key is missing', () => {
            assert.throws(() => {
                new Condition({
                    propertyKey: 'level',
                    conditional: ModifierConst.COMPARE.GE,
                    value: 10
                });
            });
        });

        it('should throw error when propertyKey is missing', () => {
            assert.throws(() => {
                new Condition({
                    key: 'test',
                    conditional: ModifierConst.COMPARE.GE,
                    value: 10
                });
            });
        });

        it('should throw error when conditional is missing', () => {
            assert.throws(() => {
                new Condition({
                    key: 'test',
                    propertyKey: 'level',
                    value: 10
                });
            });
        });

        it('should throw error when value is missing', () => {
            assert.throws(() => {
                new Condition({
                    key: 'test',
                    propertyKey: 'level',
                    conditional: ModifierConst.COMPARE.GE
                });
            });
        });

        it('should default to INT type', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: 10
            });
            assert.strictEqual(condition.type, ModifierConst.TYPES.INT);
        });

        it('should accept STRING type', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'name',
                conditional: ModifierConst.COMPARE.EQ,
                type: ModifierConst.TYPES.STRING,
                value: 'warrior'
            });
            assert.strictEqual(condition.type, ModifierConst.TYPES.STRING);
            assert.strictEqual(condition.value, 'warrior');
        });
    });

    describe('parseValue', () => {
        it('should parse value as number for INT type', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: '10'
            });
            assert.strictEqual(condition.value, 10);
            assert.strictEqual(typeof condition.value, 'number');
        });

        it('should parse value as string for STRING type', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'name',
                conditional: ModifierConst.COMPARE.EQ,
                type: ModifierConst.TYPES.STRING,
                value: 123
            });
            assert.strictEqual(condition.value, '123');
            assert.strictEqual(typeof condition.value, 'string');
        });
    });

    describe('isValidOn - EQ (Equal)', () => {
        it('should return true when values are equal', () => {
            let condition = new Condition({
                key: 'level-check',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: 10
            });
            let target = TestHelpers.createMockTarget({level: 10});
            assert.strictEqual(condition.isValidOn(target), true);
        });

        it('should return false when values are not equal', () => {
            let condition = new Condition({
                key: 'level-check',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: 10
            });
            let target = TestHelpers.createMockTarget({level: 15});
            assert.strictEqual(condition.isValidOn(target), false);
        });

        it('should work with string values', () => {
            let condition = new Condition({
                key: 'class-check',
                propertyKey: 'class',
                conditional: ModifierConst.COMPARE.EQ,
                type: ModifierConst.TYPES.STRING,
                value: 'warrior'
            });
            let target = {class: 'warrior'};
            assert.strictEqual(condition.isValidOn(target), true);
        });
    });

    describe('isValidOn - NE (Not Equal)', () => {
        it('should return true when values are not equal', () => {
            let condition = new Condition({
                key: 'level-check',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.NE,
                value: 10
            });
            let target = TestHelpers.createMockTarget({level: 15});
            assert.strictEqual(condition.isValidOn(target), true);
        });

        it('should return false when values are equal', () => {
            let condition = new Condition({
                key: 'level-check',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.NE,
                value: 10
            });
            let target = TestHelpers.createMockTarget({level: 10});
            assert.strictEqual(condition.isValidOn(target), false);
        });
    });

    describe('isValidOn - LT (Less Than)', () => {
        it('should return true when target value is less than condition value', () => {
            let condition = new Condition({
                key: 'health-check',
                propertyKey: 'health',
                conditional: ModifierConst.COMPARE.LT,
                value: 90
            });
            let target = TestHelpers.createMockTarget({health: 80});
            assert.strictEqual(condition.isValidOn(target), true);
        });

        it('should return false when target value is greater than condition value', () => {
            let condition = new Condition({
                key: 'health-check',
                propertyKey: 'health',
                conditional: ModifierConst.COMPARE.LT,
                value: 90
            });
            let target = TestHelpers.createMockTarget({health: 100});
            assert.strictEqual(condition.isValidOn(target), false);
        });

        it('should return false when values are equal', () => {
            let condition = new Condition({
                key: 'health-check',
                propertyKey: 'health',
                conditional: ModifierConst.COMPARE.LT,
                value: 90
            });
            let target = TestHelpers.createMockTarget({health: 90});
            assert.strictEqual(condition.isValidOn(target), false);
        });
    });

    describe('isValidOn - GT (Greater Than)', () => {
        it('should return true when target value is greater than condition value', () => {
            let condition = new Condition({
                key: 'level-check',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GT,
                value: 5
            });
            let target = TestHelpers.createMockTarget({level: 10});
            assert.strictEqual(condition.isValidOn(target), true);
        });

        it('should return false when target value is less than condition value', () => {
            let condition = new Condition({
                key: 'level-check',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GT,
                value: 20
            });
            let target = TestHelpers.createMockTarget({level: 10});
            assert.strictEqual(condition.isValidOn(target), false);
        });

        it('should return false when values are equal', () => {
            let condition = new Condition({
                key: 'level-check',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GT,
                value: 10
            });
            let target = TestHelpers.createMockTarget({level: 10});
            assert.strictEqual(condition.isValidOn(target), false);
        });
    });

    describe('isValidOn - LE (Less Than or Equal)', () => {
        it('should return true when target value is less than condition value', () => {
            let condition = new Condition({
                key: 'health-check',
                propertyKey: 'health',
                conditional: ModifierConst.COMPARE.LE,
                value: 100
            });
            let target = TestHelpers.createMockTarget({health: 80});
            assert.strictEqual(condition.isValidOn(target), true);
        });

        it('should return true when values are equal', () => {
            let condition = new Condition({
                key: 'health-check',
                propertyKey: 'health',
                conditional: ModifierConst.COMPARE.LE,
                value: 100
            });
            let target = TestHelpers.createMockTarget({health: 100});
            assert.strictEqual(condition.isValidOn(target), true);
        });

        it('should return false when target value is greater than condition value', () => {
            let condition = new Condition({
                key: 'health-check',
                propertyKey: 'health',
                conditional: ModifierConst.COMPARE.LE,
                value: 100
            });
            let target = TestHelpers.createMockTarget({health: 120});
            assert.strictEqual(condition.isValidOn(target), false);
        });
    });

    describe('isValidOn - GE (Greater Than or Equal)', () => {
        it('should return true when target value is greater than condition value', () => {
            let condition = new Condition({
                key: 'level-check',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GE,
                value: 10
            });
            let target = TestHelpers.createMockTarget({level: 15});
            assert.strictEqual(condition.isValidOn(target), true);
        });

        it('should return true when values are equal', () => {
            let condition = new Condition({
                key: 'level-check',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GE,
                value: 10
            });
            let target = TestHelpers.createMockTarget({level: 10});
            assert.strictEqual(condition.isValidOn(target), true);
        });

        it('should return false when target value is less than condition value', () => {
            let condition = new Condition({
                key: 'level-check',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GE,
                value: 10
            });
            let target = TestHelpers.createMockTarget({level: 5});
            assert.strictEqual(condition.isValidOn(target), false);
        });
    });

    describe('Deep Property Access', () => {
        it('should validate conditions on nested properties', () => {
            let condition = new Condition({
                key: 'nested-check',
                propertyKey: 'stats/strength',
                conditional: ModifierConst.COMPARE.GT,
                value: 15
            });
            let target = TestHelpers.createMockTarget();
            assert.strictEqual(condition.isValidOn(target), true);
        });

        it('should validate conditions on deeply nested properties', () => {
            let condition = new Condition({
                key: 'deep-nested-check',
                propertyKey: 'stats/combat/attack',
                conditional: ModifierConst.COMPARE.EQ,
                value: 100
            });
            let target = TestHelpers.createMockTarget();
            assert.strictEqual(condition.isValidOn(target), true);
        });
    });

    describe('Override Value', () => {
        it('should use override value when provided', () => {
            let condition = new Condition({
                key: 'level-check',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: 10
            });
            let target = TestHelpers.createMockTarget({level: 15});
            // Should check if target.level === overrideValue (20), not value (10)
            assert.strictEqual(condition.isValidOn(target, 15), true);
        });
    });
});
