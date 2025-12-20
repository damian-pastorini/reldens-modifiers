/**
 *
 * Reldens - PropertyManager Unit Tests
 *
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const PropertyManager = require('../../lib/property-manager');
const { TestHelpers } = require('../fixtures/test-helpers');

describe('PropertyManager', () => {
    let propertyManager;

    describe('Constructor', () => {
        it('should create PropertyManager instance', () => {
            propertyManager = new PropertyManager();
            assert.ok(propertyManager instanceof PropertyManager);
        });
    });

    describe('getPropertyValue - Simple Properties', () => {
        it('should get simple property value', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let value = propertyManager.getPropertyValue(target, 'health');
            assert.strictEqual(value, 100);
        });

        it('should get numeric property', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let value = propertyManager.getPropertyValue(target, 'attack');
            assert.strictEqual(value, 50);
        });

        it('should get property from different object', () => {
            propertyManager = new PropertyManager();
            let target = {name: 'Test', value: 42};
            let value = propertyManager.getPropertyValue(target, 'value');
            assert.strictEqual(value, 42);
        });
    });

    describe('getPropertyValue - Nested Properties', () => {
        it('should get nested property value', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let value = propertyManager.getPropertyValue(target, 'stats/strength');
            assert.strictEqual(value, 20);
        });

        it('should get deeply nested property value', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let value = propertyManager.getPropertyValue(target, 'stats/combat/attack');
            assert.strictEqual(value, 100);
        });

        it('should get another deeply nested property', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let value = propertyManager.getPropertyValue(target, 'stats/combat/defense');
            assert.strictEqual(value, 80);
        });

        it('should handle complex nested paths', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTargetWithNestedProps();
            let value = propertyManager.getPropertyValue(target, 'player/stats/magic/power');
            assert.strictEqual(value, 60);
        });
    });

    describe('setOwnerProperty - Simple Properties', () => {
        it('should set simple property value', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            propertyManager.setOwnerProperty(target, 'health', 150);
            assert.strictEqual(target.health, 150);
        });

        it('should set numeric property to zero', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            propertyManager.setOwnerProperty(target, 'attack', 0);
            assert.strictEqual(target.attack, 0);
        });

        it('should set property to negative value', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            propertyManager.setOwnerProperty(target, 'defense', -10);
            assert.strictEqual(target.defense, -10);
        });

        it('should return the set value', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let result = propertyManager.setOwnerProperty(target, 'health', 200);
            assert.strictEqual(result, 200);
        });
    });

    describe('setOwnerProperty - Nested Properties', () => {
        it('should set nested property value', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            propertyManager.setOwnerProperty(target, 'stats/strength', 25);
            assert.strictEqual(target.stats.strength, 25);
        });

        it('should set deeply nested property value', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            propertyManager.setOwnerProperty(target, 'stats/combat/attack', 120);
            assert.strictEqual(target.stats.combat.attack, 120);
        });

        it('should set deeply nested property and preserve other properties', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let originalDefense = target.stats.combat.defense;
            propertyManager.setOwnerProperty(target, 'stats/combat/attack', 150);
            assert.strictEqual(target.stats.combat.attack, 150);
            assert.strictEqual(target.stats.combat.defense, originalDefense);
        });

        it('should set complex nested path', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTargetWithNestedProps();
            propertyManager.setOwnerProperty(target, 'player/stats/magic/power', 85);
            assert.strictEqual(target.player.stats.magic.power, 85);
        });
    });

    describe('manageOwnerProperty - Get and Set', () => {
        it('should get property when value is undefined', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let result = propertyManager.manageOwnerProperty(target, 'health');
            assert.strictEqual(result, 100);
        });

        it('should set property when value is provided', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let result = propertyManager.manageOwnerProperty(target, 'health', 75);
            assert.strictEqual(result, 75);
            assert.strictEqual(target.health, 75);
        });

        it('should handle zero as valid value', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            propertyManager.manageOwnerProperty(target, 'attack', 0);
            assert.strictEqual(target.attack, 0);
        });
    });

    describe('extractChildPropertyOwner', () => {
        it('should return parent for single-level path', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let result = propertyManager.extractChildPropertyOwner(target, ['stats']);
            assert.strictEqual(result, target);
        });

        it('should return parent object for two-level path', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let result = propertyManager.extractChildPropertyOwner(target, ['stats', 'strength']);
            assert.strictEqual(result, target.stats);
        });

        it('should return parent object for three-level path', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let result = propertyManager.extractChildPropertyOwner(target, ['stats', 'combat', 'attack']);
            assert.strictEqual(result, target.stats.combat);
        });
    });

    describe('Error Handling', () => {
        it('should throw error when property does not exist', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            assert.throws(() => {
                propertyManager.getPropertyValue(target, 'nonexistent');
            });
        });

        it('should throw error when nested property path is invalid', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            assert.throws(() => {
                propertyManager.getPropertyValue(target, 'stats/invalid/path');
            });
        });

        it('should throw error with descriptive message', () => {
            propertyManager = new PropertyManager();
            let target = {stats: {strength: 10}};
            assert.throws(() => {
                propertyManager.getPropertyValue(target, 'stats/nonexistent/prop');
            }, /Invalid property "nonexistent"/);
        });
    });

    describe('Path Separator', () => {
        it('should use forward slash as separator', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let value = propertyManager.getPropertyValue(target, 'stats/combat/attack');
            assert.strictEqual(value, 100);
        });

        it('should handle multiple levels with forward slash', () => {
            propertyManager = new PropertyManager();
            let target = {
                level1: {
                    level2: {
                        level3: {
                            level4: {
                                value: 42
                            }
                        }
                    }
                }
            };
            let value = propertyManager.getPropertyValue(target, 'level1/level2/level3/level4/value');
            assert.strictEqual(value, 42);
        });
    });
});
