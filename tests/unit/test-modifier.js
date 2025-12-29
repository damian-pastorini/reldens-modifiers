/**
 *
 * Reldens - Modifier Unit Tests
 *
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const Modifier = require('../../lib/modifier');
const Condition = require('../../lib/condition');
const ModifierConst = require('../../lib/constants');
const { TestHelpers } = require('../fixtures/test-helpers');

describe('Modifier', () => {
    let target;

    beforeEach(() => {
        target = TestHelpers.createMockTarget();
    });

    describe('Constructor', () => {
        it('should create modifier with all required properties', () => {
            let modifier = new Modifier({
                key: 'test-modifier',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 20
            });
            assert.strictEqual(modifier.key, 'test-modifier');
            assert.strictEqual(modifier.propertyKey, 'attack');
            assert.strictEqual(modifier.operation, ModifierConst.OPS.INC);
            assert.strictEqual(modifier.value, 20);
        });

        it('should accept property_key as alternative to propertyKey', () => {
            let modifier = new Modifier({
                key: 'test',
                property_key: 'health',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            assert.strictEqual(modifier.propertyKey, 'health');
        });

        it('should set basePropertyKey to propertyKey by default', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            assert.strictEqual(modifier.basePropertyKey, 'attack');
        });

        it('should accept custom basePropertyKey', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                basePropertyKey: 'maxHealth',
                operation: ModifierConst.OPS.INC_P,
                value: 50
            });
            assert.strictEqual(modifier.basePropertyKey, 'maxHealth');
        });

        it('should default type to INT', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            assert.strictEqual(modifier.type, ModifierConst.TYPES.INT);
        });

        it('should accept STRING type', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'status',
                operation: ModifierConst.OPS.SET,
                type: ModifierConst.TYPES.STRING,
                value: 'poisoned'
            });
            assert.strictEqual(modifier.type, ModifierConst.TYPES.STRING);
        });

        it('should parse value based on type', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: '25'
            });
            assert.strictEqual(modifier.value, 25);
            assert.strictEqual(typeof modifier.value, 'number');
        });

        it('should accept target in constructor', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 10,
                target: target
            });
            assert.strictEqual(modifier.target, target);
        });

        it('should accept conditions array', () => {
            let condition = new Condition({
                key: 'level-check',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GE,
                value: 5
            });
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 10,
                conditions: [condition]
            });
            assert.strictEqual(modifier.conditions.length, 1);
        });

        it('should accept min and max values', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: 50,
                minValue: 0,
                maxValue: 100
            });
            assert.strictEqual(modifier.minValue, 0);
            assert.strictEqual(modifier.maxValue, 100);
        });

        it('should accept min and max properties', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: 50,
                minProperty: 'minHealth',
                maxProperty: 'maxHealth'
            });
            assert.strictEqual(modifier.minProperty, 'minHealth');
            assert.strictEqual(modifier.maxProperty, 'maxHealth');
        });
    });

    describe('determineState', () => {
        it('should set state to READY when all required props are present', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            assert.strictEqual(modifier.state, ModifierConst.MOD_READY);
        });

        it('should set state to MISSING_KEY when key is missing', () => {
            let modifier = new Modifier({
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            assert.strictEqual(modifier.state, ModifierConst.MOD_MISSING_KEY);
        });

        it('should set state to MISSING_PROPERTY_KEY when propertyKey is missing', () => {
            let modifier = new Modifier({
                key: 'test',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            assert.strictEqual(modifier.state, ModifierConst.MOD_MISSING_PROPERTY_KEY);
        });

        it('should set state to MISSING_OPERATION when operation is missing', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                value: 10
            });
            assert.strictEqual(modifier.state, ModifierConst.MOD_MISSING_OPERATION);
        });

        it('should set state to MISSING_VALUE when value is missing', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC
            });
            assert.strictEqual(modifier.state, ModifierConst.MOD_MISSING_VALUE);
        });
    });

    describe('apply - INC Operation', () => {
        it('should increase property value', () => {
            let modifier = new Modifier({
                key: 'attack-boost',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 20
            });
            modifier.apply(target);
            assert.strictEqual(target.attack, 70);
        });

        it('should set state to APPLIED after successful application', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            modifier.apply(target);
            assert.strictEqual(modifier.state, ModifierConst.MOD_APPLIED);
        });

        it('should return true on successful application', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            let result = modifier.apply(target);
            assert.strictEqual(result, true);
        });
    });

    describe('apply - DEC Operation', () => {
        it('should decrease property value', () => {
            let modifier = new Modifier({
                key: 'attack-penalty',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.DEC,
                value: 15
            });
            modifier.apply(target);
            assert.strictEqual(target.attack, 35);
        });
    });

    describe('apply - MUL Operation', () => {
        it('should multiply property value', () => {
            let modifier = new Modifier({
                key: 'damage-multiplier',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.MUL,
                value: 2
            });
            modifier.apply(target);
            assert.strictEqual(target.attack, 100);
        });
    });

    describe('apply - DIV Operation', () => {
        it('should divide property value', () => {
            let modifier = new Modifier({
                key: 'weakness',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.DIV,
                value: 2
            });
            modifier.apply(target);
            assert.strictEqual(target.attack, 25);
        });
    });

    describe('apply - INC_P Operation', () => {
        it('should increase by percentage', () => {
            let modifier = new Modifier({
                key: 'percent-boost',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC_P,
                value: 50
            });
            modifier.apply(target);
            assert.strictEqual(target.attack, 75);
        });
    });

    describe('apply - DEC_P Operation', () => {
        it('should decrease by percentage', () => {
            let modifier = new Modifier({
                key: 'percent-penalty',
                propertyKey: 'health',
                operation: ModifierConst.OPS.DEC_P,
                value: 50
            });
            modifier.apply(target);
            assert.strictEqual(target.health, 50);
        });
    });

    describe('apply - SET Operation', () => {
        it('should set property to specific value', () => {
            let modifier = new Modifier({
                key: 'set-level',
                propertyKey: 'level',
                operation: ModifierConst.OPS.SET,
                value: 20
            });
            modifier.apply(target);
            assert.strictEqual(target.level, 20);
        });
    });

    describe('revert', () => {
        it('should revert INC operation', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 20
            });
            modifier.apply(target);
            assert.strictEqual(target.attack, 70);
            modifier.revert(target);
            assert.strictEqual(target.attack, 50);
        });

        it('should revert DEC operation', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.DEC,
                value: 15
            });
            modifier.apply(target);
            assert.strictEqual(target.attack, 35);
            modifier.revert(target);
            assert.strictEqual(target.attack, 50);
        });

        it('should revert MUL operation', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.MUL,
                value: 2
            });
            modifier.apply(target);
            modifier.revert(target);
            assert.strictEqual(target.attack, 50);
        });

        it('should revert INC_P operation', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC_P,
                value: 50
            });
            modifier.apply(target);
            let boostedHealth = target.health;
            modifier.revert(target);
            assert.strictEqual(target.health, 100);
        });

        it('should set state to REVERTED after successful revert', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            modifier.apply(target);
            modifier.revert(target);
            assert.strictEqual(modifier.state, ModifierConst.MOD_REVERTED);
        });

        it('should revert SET operation to false', () => {
            target.status = 'normal';
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'status',
                operation: ModifierConst.OPS.SET,
                type: ModifierConst.TYPES.STRING,
                value: 'poisoned'
            });
            modifier.apply(target);
            assert.strictEqual(target.status, 'poisoned');
            modifier.revert(target);
            assert.strictEqual(target.status, false);
        });
    });

    describe('Conditions', () => {
        it('should apply modifier when condition is valid', () => {
            let condition = new Condition({
                key: 'level-check',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GE,
                value: 5
            });
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 20,
                conditions: [condition]
            });
            let result = modifier.apply(target);
            assert.strictEqual(result, true);
            assert.strictEqual(target.attack, 70);
        });

        it('should not apply modifier when condition is invalid', () => {
            let condition = new Condition({
                key: 'level-check',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GT,
                value: 20
            });
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 20,
                conditions: [condition]
            });
            let result = modifier.apply(target);
            assert.strictEqual(result, false);
            assert.strictEqual(target.attack, 50);
        });

        it('should validate all conditions', () => {
            let condition1 = new Condition({
                key: 'level-check',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GE,
                value: 5
            });
            let condition2 = new Condition({
                key: 'health-check',
                propertyKey: 'health',
                conditional: ModifierConst.COMPARE.GT,
                value: 50
            });
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 20,
                conditions: [condition1, condition2]
            });
            let result = modifier.apply(target);
            assert.strictEqual(result, true);
            assert.strictEqual(target.attack, 70);
        });

        it('should fail if any condition is invalid', () => {
            let condition1 = new Condition({
                key: 'level-check',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GE,
                value: 5
            });
            let condition2 = new Condition({
                key: 'health-check',
                propertyKey: 'health',
                conditional: ModifierConst.COMPARE.GT,
                value: 200
            });
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 20,
                conditions: [condition1, condition2]
            });
            let result = modifier.apply(target);
            assert.strictEqual(result, false);
            assert.strictEqual(target.attack, 50);
        });
    });

    describe('Value Limits', () => {
        it('should respect minValue limit', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.DEC,
                value: 150,
                minValue: 0
            });
            modifier.apply(target);
            assert.strictEqual(target.health, 0);
        });

        it('should respect maxValue limit', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: 100,
                maxValue: 150
            });
            modifier.apply(target);
            assert.strictEqual(target.health, 150);
        });

        it('should respect maxProperty limit', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: 100,
                maxProperty: 'maxHealth'
            });
            modifier.apply(target);
            assert.strictEqual(target.health, 150);
        });

        it('should not limit when value is within range', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: 20,
                minValue: 0,
                maxValue: 200
            });
            modifier.apply(target);
            assert.strictEqual(target.health, 120);
        });
    });

    describe('Nested Property Modifications', () => {
        it('should modify nested property', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'stats/strength',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            modifier.apply(target);
            assert.strictEqual(target.stats.strength, 30);
        });

        it('should modify deeply nested property', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'stats/combat/attack',
                operation: ModifierConst.OPS.INC,
                value: 25
            });
            modifier.apply(target);
            assert.strictEqual(target.stats.combat.attack, 125);
        });
    });

    describe('Base Property Operations', () => {
        it('should use basePropertyKey for calculation when useBasePropertyToGetValue is true', () => {
            target.currentHealth = 50;
            target.baseHealth = 100;
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'currentHealth',
                basePropertyKey: 'baseHealth',
                operation: ModifierConst.OPS.INC_P,
                value: 50
            });
            modifier.apply(target, true, false);
            assert.strictEqual(target.currentHealth, 150);
        });

        it('should apply to basePropertyKey when applyOnBaseProperty is true', () => {
            target.currentHealth = 50;
            target.baseHealth = 100;
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'currentHealth',
                basePropertyKey: 'baseHealth',
                operation: ModifierConst.OPS.INC,
                value: 25
            });
            modifier.apply(target, false, true);
            assert.strictEqual(target.baseHealth, 75);
            assert.strictEqual(target.currentHealth, 50);
        });
    });

    describe('Error Handling', () => {
        it('should return false when no target is provided', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            let result = modifier.apply();
            assert.strictEqual(result, false);
        });

        it('should set state to UNDEFINED_TARGET when no target', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            modifier.apply();
            assert.strictEqual(modifier.state, ModifierConst.MOD_UNDEFINED_TARGET);
        });
    });

    describe('Target Override', () => {
        it('should use provided target over constructor target', () => {
            let originalTarget = TestHelpers.createMockTarget({attack: 30});
            let newTarget = TestHelpers.createMockTarget({attack: 60});
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 10,
                target: originalTarget
            });
            modifier.apply(newTarget);
            assert.strictEqual(newTarget.attack, 70);
            assert.strictEqual(modifier.target, newTarget);
        });
    });

    describe('NULL and Undefined Handling (Bug Fix Validation)', () => {
        it('should handle NULL minValue (no limit applied)', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.DEC,
                value: 150,
                minValue: null
            });
            modifier.apply(target);
            assert.strictEqual(target.health, -50);
            assert.strictEqual(modifier.minValue, null);
        });

        it('should handle NULL maxValue (no limit applied)', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: 500,
                maxValue: null
            });
            modifier.apply(target);
            assert.strictEqual(target.health, 600);
            assert.strictEqual(modifier.maxValue, null);
        });

        it('should treat undefined minValue as false', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.DEC,
                value: 150
            });
            modifier.apply(target);
            assert.strictEqual(target.health, -50);
            assert.strictEqual(modifier.minValue, false);
        });

        it('should treat undefined maxValue as false', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: 500
            });
            modifier.apply(target);
            assert.strictEqual(target.health, 600);
            assert.strictEqual(modifier.maxValue, false);
        });

        it('should distinguish between maxValue=0 (hard limit) and maxValue=null (no limit)', () => {
            let modifier1 = new Modifier({
                key: 'test1',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: 50,
                maxValue: 0
            });
            modifier1.apply(target);
            assert.strictEqual(target.health, 0);
            let target2 = TestHelpers.createMockTarget();
            let modifier2 = new Modifier({
                key: 'test2',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: 50,
                maxValue: null
            });
            modifier2.apply(target2);
            assert.strictEqual(target2.health, 150);
        });

        it('should handle database-like objects with NULL minValue/maxValue', () => {
            let databaseRow = {
                key: 'hp-boost',
                property_key: 'health',
                operation: 1,
                value: '50',
                minValue: null,
                maxValue: null
            };
            let modifier = new Modifier(databaseRow);
            modifier.apply(target);
            assert.strictEqual(target.health, 150);
            assert.strictEqual(modifier.minValue, null);
            assert.strictEqual(modifier.maxValue, null);
        });
    });

    describe('Invalid Operation Values', () => {
        it('should handle string operation by converting to number', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: '1',
                value: 50
            });
            modifier.apply(target);
            assert.strictEqual(target.health, 150);
        });

        it('should handle invalid operation code returning original value', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: 999,
                value: 50
            });
            modifier.apply(target);
            assert.strictEqual(target.health, 100);
        });

        it('should handle NULL operation by converting to 0', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: null,
                value: 50
            });
            assert.strictEqual(modifier.operation, 0);
        });
    });

    describe('Invalid Value Types', () => {
        it('should handle NaN value for INT type', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: NaN
            });
            assert.ok(Number.isNaN(modifier.value));
        });

        it('should handle Infinity value', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: Infinity
            });
            modifier.apply(target);
            assert.strictEqual(target.health, Infinity);
        });

        it('should handle empty string value by converting to 0', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: ''
            });
            modifier.apply(target);
            assert.strictEqual(target.health, 100);
        });

        it('should handle NULL value by converting to 0', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: null
            });
            modifier.apply(target);
            assert.strictEqual(target.health, 100);
        });

        it('should handle undefined value by converting to NaN', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: undefined
            });
            assert.ok(Number.isNaN(modifier.value));
        });
    });

    describe('Property Access Errors', () => {
        it('should throw error when accessing non-existent property', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'nonExistentProperty',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            assert.throws(() => {
                modifier.apply(target);
            });
        });

        it('should throw error when accessing nested property on undefined parent', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'stats/undefined/property',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            assert.throws(() => {
                modifier.apply(target);
            });
        });

        it('should return false when target is null', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            assert.strictEqual(modifier.apply(null), false);
            assert.strictEqual(modifier.state, ModifierConst.MOD_UNDEFINED_TARGET);
        });

        it('should return false when target is undefined', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            assert.strictEqual(modifier.apply(undefined), false);
            assert.strictEqual(modifier.state, ModifierConst.MOD_UNDEFINED_TARGET);
        });
    });

    describe('METHOD Operation Errors', () => {
        it('should return false when METHOD operation has non-existent method', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.METHOD,
                value: 'nonExistentMethod'
            });
            let result = modifier.apply(target);
            assert.strictEqual(result, false);
            assert.strictEqual(modifier.state, ModifierConst.MOD_MODIFIER_ERROR);
        });

        it('should return false when METHOD operation has non-function property', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.METHOD,
                value: 'key'
            });
            let result = modifier.apply(target);
            assert.strictEqual(result, false);
            assert.strictEqual(modifier.state, ModifierConst.MOD_MODIFIER_ERROR);
        });
    });

    describe('Condition Validation Errors', () => {
        it('should handle invalid condition instance (not Condition class)', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 10,
                conditions: [{key: 'fake', propertyKey: 'level', conditional: 'eq', value: 10}]
            });
            let result = modifier.apply(target);
            assert.strictEqual(result, false);
            assert.strictEqual(modifier.state, ModifierConst.MOD_MISSING_CONDITION_INSTANCE);
        });

        it('should handle empty conditions array same as no conditions', () => {
            let modifier1 = new Modifier({
                key: 'test1',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 10,
                conditions: []
            });
            let result1 = modifier1.apply(target);
            assert.strictEqual(result1, true);
            let target2 = TestHelpers.createMockTarget();
            let modifier2 = new Modifier({
                key: 'test2',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            let result2 = modifier2.apply(target2);
            assert.strictEqual(result2, true);
            assert.strictEqual(target.attack, target2.attack);
        });

        it('should fail when any condition in array is invalid', () => {
            let validCondition = new Condition({
                key: 'valid',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GT,
                value: 5
            });
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 10,
                conditions: [validCondition, {fake: 'condition'}]
            });
            let result = modifier.apply(target);
            assert.strictEqual(result, false);
        });
    });

    describe('Extreme Values', () => {
        it('should handle very large numbers without overflow', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: Number.MAX_SAFE_INTEGER
            });
            modifier.apply(target);
            assert.strictEqual(target.health, 100+Number.MAX_SAFE_INTEGER);
        });

        it('should handle very small negative numbers', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.DEC,
                value: Number.MAX_SAFE_INTEGER
            });
            modifier.apply(target);
            assert.strictEqual(target.health, 100-Number.MAX_SAFE_INTEGER);
        });

        it('should handle zero as value', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: 0
            });
            modifier.apply(target);
            assert.strictEqual(target.health, 100);
        });
    });

    describe('Limit Edge Cases', () => {
        it('should handle minValue greater than maxValue', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: 50,
                minValue: 200,
                maxValue: 100
            });
            modifier.apply(target);
            assert.strictEqual(target.health, 100);
        });

        it('should handle minValue equal to maxValue', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: 50,
                minValue: 75,
                maxValue: 75
            });
            modifier.apply(target);
            assert.strictEqual(target.health, 75);
        });

        it('should handle negative minValue and maxValue', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.DEC,
                value: 150,
                minValue: -100,
                maxValue: -50
            });
            modifier.apply(target);
            assert.strictEqual(target.health, -50);
        });

        it('should throw when maxProperty points to non-existent property', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.INC,
                value: 100,
                maxProperty: 'nonExistentProperty'
            });
            assert.throws(() => {
                modifier.apply(target);
            });
        });

        it('should not apply minProperty limit when value is 0 (falsy)', () => {
            target.minHealth = 0;
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'health',
                operation: ModifierConst.OPS.DEC,
                value: 150,
                minProperty: 'minHealth'
            });
            modifier.apply(target);
            assert.strictEqual(target.health, -50);
        });
    });

    describe('Base Property Edge Cases', () => {
        it('should throw when basePropertyKey does not exist', () => {
            target.currentHealth = 50;
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'currentHealth',
                basePropertyKey: 'nonExistentBase',
                operation: ModifierConst.OPS.INC_P,
                value: 50
            });
            assert.throws(() => {
                modifier.apply(target, true, false);
            });
        });

        it('should calculate percentage of zero as zero', () => {
            target.currentHealth = 50;
            target.baseHealth = 0;
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'currentHealth',
                basePropertyKey: 'baseHealth',
                operation: ModifierConst.OPS.INC_P,
                value: 50
            });
            modifier.apply(target, true, false);
            assert.strictEqual(target.currentHealth, 0);
        });

        it('should handle basePropertyKey with null value (null coerces to 0)', () => {
            target.currentHealth = 50;
            target.baseHealth = null;
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'currentHealth',
                basePropertyKey: 'baseHealth',
                operation: ModifierConst.OPS.INC_P,
                value: 50
            });
            modifier.apply(target, true, false);
            assert.strictEqual(target.currentHealth, 0);
        });
    });

    describe('String Type Edge Cases', () => {
        it('should handle empty string for STRING type', () => {
            target.status = 'normal';
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'status',
                operation: ModifierConst.OPS.SET,
                type: ModifierConst.TYPES.STRING,
                value: ''
            });
            modifier.apply(target);
            assert.strictEqual(target.status, '');
        });

        it('should handle NULL for STRING type by converting to string', () => {
            target.status = 'normal';
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'status',
                operation: ModifierConst.OPS.SET,
                type: ModifierConst.TYPES.STRING,
                value: null
            });
            modifier.apply(target);
            assert.strictEqual(target.status, 'null');
        });

        it('should handle undefined for STRING type by converting to string', () => {
            target.status = 'normal';
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'status',
                operation: ModifierConst.OPS.SET,
                type: ModifierConst.TYPES.STRING,
                value: undefined
            });
            modifier.apply(target);
            assert.strictEqual(target.status, 'undefined');
        });

        it('should handle object for STRING type by converting to string', () => {
            target.status = 'normal';
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'status',
                operation: ModifierConst.OPS.SET,
                type: ModifierConst.TYPES.STRING,
                value: {foo: 'bar'}
            });
            modifier.apply(target);
            assert.strictEqual(target.status, '[object Object]');
        });
    });

    describe('Revert Edge Cases', () => {
        it('should handle revert with conditions when conditionsOnRevert is false', () => {
            let condition = new Condition({
                key: 'level-check',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GT,
                value: 100
            });
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 20,
                conditions: [condition],
                conditionsOnRevert: false
            });
            modifier.apply(target);
            assert.strictEqual(target.attack, 50);
            let revertResult = modifier.revert(target);
            assert.strictEqual(revertResult, true);
            assert.strictEqual(target.attack, 30);
        });

        it('should handle revert with conditions when conditionsOnRevert is true', () => {
            let condition = new Condition({
                key: 'level-check',
                propertyKey: 'level',
                conditional: ModifierConst.COMPARE.GT,
                value: 100
            });
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                operation: ModifierConst.OPS.INC,
                value: 20,
                conditions: [condition],
                conditionsOnRevert: true
            });
            modifier.apply(target);
            assert.strictEqual(target.attack, 50);
            let revertResult = modifier.revert(target);
            assert.strictEqual(revertResult, false);
            assert.strictEqual(target.attack, 50);
        });

        it('should handle revert on SET_N operation', () => {
            target.status = 'normal';
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'status',
                operation: ModifierConst.OPS.SET_N,
                type: ModifierConst.TYPES.STRING,
                value: 'poisoned'
            });
            modifier.apply(target);
            assert.strictEqual(target.status, 'poisoned');
            modifier.revert(target);
            assert.strictEqual(target.status, false);
        });
    });

    describe('Constructor Property Preference', () => {
        it('should prefer propertyKey over property_key when both provided', () => {
            let modifier = new Modifier({
                key: 'test',
                propertyKey: 'attack',
                property_key: 'health',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            assert.strictEqual(modifier.propertyKey, 'attack');
        });

        it('should use property_key when propertyKey is missing', () => {
            let modifier = new Modifier({
                key: 'test',
                property_key: 'health',
                operation: ModifierConst.OPS.INC,
                value: 10
            });
            assert.strictEqual(modifier.propertyKey, 'health');
        });
    });
});
