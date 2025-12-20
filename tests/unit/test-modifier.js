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
});
