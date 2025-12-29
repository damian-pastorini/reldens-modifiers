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

    describe('NULL and Undefined Target Handling', () => {
        it('should throw error when target is null', () => {
            propertyManager = new PropertyManager();
            assert.throws(() => {
                propertyManager.getPropertyValue(null, 'health');
            });
        });

        it('should throw error when target is undefined', () => {
            propertyManager = new PropertyManager();
            assert.throws(() => {
                propertyManager.getPropertyValue(undefined, 'health');
            });
        });

        it('should throw error when setting property on null target', () => {
            propertyManager = new PropertyManager();
            assert.throws(() => {
                propertyManager.setOwnerProperty(null, 'health', 100);
            });
        });

        it('should throw error when setting property on undefined target', () => {
            propertyManager = new PropertyManager();
            assert.throws(() => {
                propertyManager.setOwnerProperty(undefined, 'health', 100);
            });
        });

        it('should throw error when parent property is null', () => {
            propertyManager = new PropertyManager();
            let target = {stats: null};
            assert.throws(() => {
                propertyManager.getPropertyValue(target, 'stats/strength');
            });
        });

        it('should throw error when parent property is undefined', () => {
            propertyManager = new PropertyManager();
            let target = {stats: undefined};
            assert.throws(() => {
                propertyManager.getPropertyValue(target, 'stats/strength');
            });
        });
    });

    describe('NULL and Undefined Value Handling', () => {
        it('should set property to null', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            propertyManager.setOwnerProperty(target, 'health', null);
            assert.strictEqual(target.health, null);
        });

        it('should get property when value is undefined (not set)', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let result = propertyManager.setOwnerProperty(target, 'health', undefined);
            assert.strictEqual(result, 100);
            assert.strictEqual(target.health, 100);
        });

        it('should set property to 0', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            propertyManager.setOwnerProperty(target, 'health', 0);
            assert.strictEqual(target.health, 0);
        });

        it('should set property to false', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            propertyManager.setOwnerProperty(target, 'health', false);
            assert.strictEqual(target.health, false);
        });

        it('should set property to empty string', () => {
            propertyManager = new PropertyManager();
            let target = {name: 'test'};
            propertyManager.setOwnerProperty(target, 'name', '');
            assert.strictEqual(target.name, '');
        });

        it('should set property to NaN', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            propertyManager.setOwnerProperty(target, 'health', NaN);
            assert.ok(Number.isNaN(target.health));
        });

        it('should set property to Infinity', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            propertyManager.setOwnerProperty(target, 'health', Infinity);
            assert.strictEqual(target.health, Infinity);
        });
    });

    describe('Property Name Edge Cases', () => {
        it('should throw error for empty string property name', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            assert.throws(() => {
                propertyManager.getPropertyValue(target, '');
            });
        });

        it('should handle property names with spaces', () => {
            propertyManager = new PropertyManager();
            let target = {'property name': 100};
            let value = propertyManager.getPropertyValue(target, 'property name');
            assert.strictEqual(value, 100);
        });

        it('should handle property names with special characters', () => {
            propertyManager = new PropertyManager();
            let target = {'prop-name': 100};
            let value = propertyManager.getPropertyValue(target, 'prop-name');
            assert.strictEqual(value, 100);
        });

        it('should handle property names with numbers', () => {
            propertyManager = new PropertyManager();
            let target = {'prop123': 100};
            let value = propertyManager.getPropertyValue(target, 'prop123');
            assert.strictEqual(value, 100);
        });

        it('should handle numeric string property names', () => {
            propertyManager = new PropertyManager();
            let target = {'123': 100};
            let value = propertyManager.getPropertyValue(target, '123');
            assert.strictEqual(value, 100);
        });
    });

    describe('Very Deep Nesting', () => {
        it('should handle 10 levels of nesting', () => {
            propertyManager = new PropertyManager();
            let target = {
                l1: {l2: {l3: {l4: {l5: {l6: {l7: {l8: {l9: {l10: 42}}}}}}}}
                }
            };
            let value = propertyManager.getPropertyValue(target, 'l1/l2/l3/l4/l5/l6/l7/l8/l9/l10');
            assert.strictEqual(value, 42);
        });

        it('should set value in deeply nested structure', () => {
            propertyManager = new PropertyManager();
            let target = {
                l1: {l2: {l3: {l4: {l5: {l6: {l7: {l8: {l9: {l10: 42}}}}}}}}
                }
            };
            propertyManager.setOwnerProperty(target, 'l1/l2/l3/l4/l5/l6/l7/l8/l9/l10', 100);
            assert.strictEqual(target.l1.l2.l3.l4.l5.l6.l7.l8.l9.l10, 100);
        });

        it('should throw error when deep path is invalid', () => {
            propertyManager = new PropertyManager();
            let target = {
                l1: {l2: {l3: {l4: null}}}
            };
            assert.throws(() => {
                propertyManager.getPropertyValue(target, 'l1/l2/l3/l4/l5/l6');
            });
        });
    });

    describe('Single Path Extraction', () => {
        it('should return original target for single property', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let result = propertyManager.extractChildPropertyOwner(target, ['health']);
            assert.strictEqual(result, target);
        });

        it('should return original target for empty path array', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let result = propertyManager.extractChildPropertyOwner(target, []);
            assert.strictEqual(result, target);
        });
    });

    describe('manageOwnerProperty Edge Cases', () => {
        it('should get property when no value provided', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let result = propertyManager.manageOwnerProperty(target, 'health');
            assert.strictEqual(result, 100);
        });

        it('should get property when value is explicitly undefined', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let result = propertyManager.manageOwnerProperty(target, 'health', undefined);
            assert.strictEqual(result, 100);
            assert.strictEqual(target.health, 100);
        });

        it('should handle setting nested property with null value', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            propertyManager.manageOwnerProperty(target, 'stats/strength', null);
            assert.strictEqual(target.stats.strength, null);
        });

        it('should return the value after setting', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let result = propertyManager.manageOwnerProperty(target, 'health', 150);
            assert.strictEqual(result, 150);
        });
    });

    describe('Path with Trailing/Leading Slashes', () => {
        it('should handle path with leading slash', () => {
            propertyManager = new PropertyManager();
            let target = {
                '': {stats: {strength: 20}}
            };
            let value = propertyManager.getPropertyValue(target, '/stats/strength');
            assert.strictEqual(value, 20);
        });

        it('should throw error for path with only slashes', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            assert.throws(() => {
                propertyManager.getPropertyValue(target, '///');
            });
        });

        it('should handle consecutive slashes in path', () => {
            propertyManager = new PropertyManager();
            let target = {
                stats: {'': {strength: 20}}
            };
            let value = propertyManager.getPropertyValue(target, 'stats//strength');
            assert.strictEqual(value, 20);
        });
    });

    describe('Object Type Values', () => {
        it('should set property to object', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let objValue = {a: 1, b: 2};
            propertyManager.setOwnerProperty(target, 'data', objValue);
            assert.strictEqual(target.data, objValue);
        });

        it('should set property to array', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let arrValue = [1, 2, 3];
            propertyManager.setOwnerProperty(target, 'list', arrValue);
            assert.strictEqual(target.list, arrValue);
        });

        it('should set property to function', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let fn = () => 42;
            propertyManager.setOwnerProperty(target, 'method', fn);
            assert.strictEqual(target.method, fn);
        });

        it('should get nested object property', () => {
            propertyManager = new PropertyManager();
            let target = {
                data: {inner: {value: 42}}
            };
            let value = propertyManager.getPropertyValue(target, 'data/inner/value');
            assert.strictEqual(value, 42);
        });
    });

    describe('Property Overwriting', () => {
        it('should overwrite existing simple property', () => {
            propertyManager = new PropertyManager();
            let target = {health: 100};
            propertyManager.setOwnerProperty(target, 'health', 200);
            assert.strictEqual(target.health, 200);
        });

        it('should overwrite existing nested property', () => {
            propertyManager = new PropertyManager();
            let target = TestHelpers.createMockTarget();
            let originalDefense = target.stats.combat.defense;
            propertyManager.setOwnerProperty(target, 'stats/combat/attack', 500);
            assert.strictEqual(target.stats.combat.attack, 500);
            assert.strictEqual(target.stats.combat.defense, originalDefense);
        });

        it('should overwrite object with primitive', () => {
            propertyManager = new PropertyManager();
            let target = {stats: {strength: 20}};
            propertyManager.setOwnerProperty(target, 'stats', 42);
            assert.strictEqual(target.stats, 42);
        });

        it('should overwrite primitive with object', () => {
            propertyManager = new PropertyManager();
            let target = {value: 42};
            let newObj = {a: 1};
            propertyManager.setOwnerProperty(target, 'value', newObj);
            assert.strictEqual(target.value, newObj);
        });
    });

    describe('Extreme Property Names', () => {
        it('should handle very long property name', () => {
            propertyManager = new PropertyManager();
            let longName = 'a'.repeat(1000);
            let target = {[longName]: 42};
            let value = propertyManager.getPropertyValue(target, longName);
            assert.strictEqual(value, 42);
        });

        it('should handle property name with unicode characters', () => {
            propertyManager = new PropertyManager();
            let target = {'プロパティ': 42};
            let value = propertyManager.getPropertyValue(target, 'プロパティ');
            assert.strictEqual(value, 42);
        });

        it('should handle property name with emoji', () => {
            propertyManager = new PropertyManager();
            let target = {'😀': 42};
            let value = propertyManager.getPropertyValue(target, '😀');
            assert.strictEqual(value, 42);
        });
    });

    describe('Error Messages', () => {
        it('should provide descriptive error for invalid nested property', () => {
            propertyManager = new PropertyManager();
            let target = {stats: {strength: 10}};
            assert.throws(() => {
                propertyManager.getPropertyValue(target, 'stats/invalid/deep');
            }, /Invalid property "invalid"/);
        });

        it('should provide descriptive error for missing root property', () => {
            propertyManager = new PropertyManager();
            let target = {health: 100};
            assert.throws(() => {
                propertyManager.getPropertyValue(target, 'missing');
            }, /Invalid property "missing"/);
        });

        it('should throw error when setting property on null parent', () => {
            propertyManager = new PropertyManager();
            let target = {stats: null};
            assert.throws(() => {
                propertyManager.setOwnerProperty(target, 'stats/strength', 20);
            });
        });
    });
});
