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

    describe('NULL and Undefined Value Handling', () => {
        it('should handle NULL value for INT type', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: null
            });
            assert.strictEqual(condition.value, 0);
        });

        it('should throw error for undefined value', () => {
            assert.throws(() => {
                new Condition({
                    key: 'test',
                    propertyKey: 'level',
                    conditional: ModifierConst.COMPARE.EQ,
                    value: undefined
                });
            });
        });

        it('should handle NULL value for STRING type', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'name',
                conditional: ModifierConst.COMPARE.EQ,
                type: ModifierConst.TYPES.STRING,
                value: null
            });
            assert.strictEqual(condition.value, 'null');
        });

        it('should throw error for undefined value in STRING type', () => {
            assert.throws(() => {
                new Condition({
                    key: 'test',
                    propertyKey: 'name',
                    conditional: ModifierConst.COMPARE.EQ,
                    type: ModifierConst.TYPES.STRING,
                    value: undefined
                });
            });
        });

        it('should compare NULL target property with NULL condition value', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: null
            });
            let target = {level: null};
            assert.strictEqual(condition.isValidOn(target), false);
        });
    });

    describe('Invalid Conditional Operator', () => {
        it('should throw error when conditional is invalid', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: 'invalid',
                value: 10
            });
            let target = TestHelpers.createMockTarget();
            assert.throws(() => {
                condition.isValidOn(target);
            });
        });

        it('should throw error when conditional is number', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: 123,
                value: 10
            });
            let target = TestHelpers.createMockTarget();
            assert.throws(() => {
                condition.isValidOn(target);
            });
        });

        it('should throw error when conditional is null', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: null,
                value: 10
            });
            let target = TestHelpers.createMockTarget();
            assert.throws(() => {
                condition.isValidOn(target);
            });
        });
    });

    describe('NaN Comparisons', () => {
        it('should handle NaN value with EQ', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: NaN
            });
            let target = {level: NaN};
            assert.strictEqual(condition.isValidOn(target), false);
        });

        it('should handle NaN value with NE', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.NE,
                value: NaN
            });
            let target = {level: NaN};
            assert.strictEqual(condition.isValidOn(target), true);
        });

        it('should handle NaN value with GT', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GT,
                value: NaN
            });
            let target = {level: 10};
            assert.strictEqual(condition.isValidOn(target), false);
        });

        it('should handle NaN target property with LT', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.LT,
                value: 10
            });
            let target = {level: NaN};
            assert.strictEqual(condition.isValidOn(target), false);
        });
    });

    describe('Infinity Comparisons', () => {
        it('should handle Infinity with EQ', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: Infinity
            });
            let target = {level: Infinity};
            assert.strictEqual(condition.isValidOn(target), true);
        });

        it('should handle Infinity with GT', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GT,
                value: 100
            });
            let target = {level: Infinity};
            assert.strictEqual(condition.isValidOn(target), true);
        });

        it('should handle Infinity with LT', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.LT,
                value: Infinity
            });
            let target = {level: 100};
            assert.strictEqual(condition.isValidOn(target), true);
        });

        it('should handle negative Infinity with LT', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.LT,
                value: 0
            });
            let target = {level: -Infinity};
            assert.strictEqual(condition.isValidOn(target), true);
        });
    });

    describe('Type Mismatch Comparisons', () => {
        it('should handle string number vs actual number with EQ', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: 10
            });
            let target = {level: '10'};
            assert.strictEqual(condition.isValidOn(target), false);
        });

        it('should handle comparing number to boolean', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: 1
            });
            let target = {level: true};
            assert.strictEqual(condition.isValidOn(target), false);
        });

        it('should handle comparing string to number with GT', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GT,
                value: 10
            });
            let target = {level: '20'};
            assert.strictEqual(condition.isValidOn(target), true);
        });

        it('should handle empty string comparison', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'name',
                conditional: ModifierConst.COMPARE.EQ,
                type: ModifierConst.TYPES.STRING,
                value: ''
            });
            let target = {name: ''};
            assert.strictEqual(condition.isValidOn(target), true);
        });
    });

    describe('Property Access Errors', () => {
        it('should throw error when target property does not exist', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'nonExistent',
                conditional: ModifierConst.COMPARE.EQ,
                value: 10
            });
            let target = TestHelpers.createMockTarget();
            assert.throws(() => {
                condition.isValidOn(target);
            });
        });

        it('should throw error when nested property parent does not exist', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'stats/nonExistent/prop',
                conditional: ModifierConst.COMPARE.EQ,
                value: 10
            });
            let target = TestHelpers.createMockTarget();
            assert.throws(() => {
                condition.isValidOn(target);
            });
        });

        it('should throw error when target is null', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: 10
            });
            assert.throws(() => {
                condition.isValidOn(null);
            });
        });

        it('should throw error when target is undefined', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: 10
            });
            assert.throws(() => {
                condition.isValidOn(undefined);
            });
        });
    });

    describe('Zero and Falsy Values', () => {
        it('should handle zero comparison with EQ', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: 0
            });
            let target = {level: 0};
            assert.strictEqual(condition.isValidOn(target), true);
        });

        it('should distinguish between 0 and false', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: 0
            });
            let target = {level: false};
            assert.strictEqual(condition.isValidOn(target), false);
        });

        it('should handle negative zero', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: -0
            });
            let target = {level: 0};
            assert.strictEqual(condition.isValidOn(target), true);
        });

        it('should handle comparing with empty string', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'name',
                conditional: ModifierConst.COMPARE.NE,
                type: ModifierConst.TYPES.STRING,
                value: ''
            });
            let target = {name: 'warrior'};
            assert.strictEqual(condition.isValidOn(target), true);
        });
    });

    describe('Override Value Edge Cases', () => {
        it('should use NULL as override value when provided', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: 10
            });
            let target = {level: null};
            assert.strictEqual(condition.isValidOn(target, null), true);
        });

        it('should handle undefined override value falling back to condition value', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: 10
            });
            let target = {level: 10};
            assert.strictEqual(condition.isValidOn(target, undefined), true);
        });

        it('should use 0 as override value when provided', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: 10
            });
            let target = {level: 0};
            assert.strictEqual(condition.isValidOn(target, 0), true);
        });

        it('should use false as override value when explicitly provided', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'active',
                conditional: ModifierConst.COMPARE.EQ,
                value: true
            });
            let target = {active: false};
            assert.strictEqual(condition.isValidOn(target, false), true);
        });
    });

    describe('Extreme Values', () => {
        it('should handle MAX_SAFE_INTEGER comparison', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.EQ,
                value: Number.MAX_SAFE_INTEGER
            });
            let target = {level: Number.MAX_SAFE_INTEGER};
            assert.strictEqual(condition.isValidOn(target), true);
        });

        it('should handle MIN_SAFE_INTEGER comparison', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.LT,
                value: 0
            });
            let target = {level: Number.MIN_SAFE_INTEGER};
            assert.strictEqual(condition.isValidOn(target), true);
        });

        it('should handle very long string comparison', () => {
            let longString = 'a'.repeat(10000);
            let condition = new Condition({
                key: 'test',
                propertyKey: 'description',
                conditional: ModifierConst.COMPARE.EQ,
                type: ModifierConst.TYPES.STRING,
                value: longString
            });
            let target = {description: longString};
            assert.strictEqual(condition.isValidOn(target), true);
        });
    });

    describe('Boundary Comparisons', () => {
        it('should handle boundary between LT and EQ', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.LT,
                value: 10
            });
            let target1 = {level: 9};
            let target2 = {level: 10};
            let target3 = {level: 11};
            assert.strictEqual(condition.isValidOn(target1), true);
            assert.strictEqual(condition.isValidOn(target2), false);
            assert.strictEqual(condition.isValidOn(target3), false);
        });

        it('should handle boundary between GT and EQ', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GT,
                value: 10
            });
            let target1 = {level: 9};
            let target2 = {level: 10};
            let target3 = {level: 11};
            assert.strictEqual(condition.isValidOn(target1), false);
            assert.strictEqual(condition.isValidOn(target2), false);
            assert.strictEqual(condition.isValidOn(target3), true);
        });

        it('should handle boundary between LE and GT', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.LE,
                value: 10
            });
            let target1 = {level: 10};
            let target2 = {level: 11};
            assert.strictEqual(condition.isValidOn(target1), true);
            assert.strictEqual(condition.isValidOn(target2), false);
        });

        it('should handle boundary between GE and LT', () => {
            let condition = new Condition({
                key: 'test',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GE,
                value: 10
            });
            let target1 = {level: 9};
            let target2 = {level: 10};
            assert.strictEqual(condition.isValidOn(target1), false);
            assert.strictEqual(condition.isValidOn(target2), true);
        });
    });
});
