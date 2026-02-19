# Modifiers - Quick Reference

Fast lookup for common patterns and critical details.

## File Locations

```
lib/
  modifier.js - Main Modifier class
  calculator.js - Math operations
  condition.js - Condition validation
  property-manager.js - Deep property access
  constants.js - All constants

tests/
  unit/ - All test files
  fixtures/test-helpers.js - Mock objects
```

## Critical Line Numbers

### modifier.js
- Line 20: `basePropertyKey` defaults to `propertyKey`
- Line 84-107: `execute()` - Main execution method
- Line 103: `getModifiedValue()` call
- Line 104: Determine which property to apply to
- Line 105: Apply value via PropertyManager
- Line 126-148: `getModifiedValue()` - Calculation logic
- Line 150-172: `applyModifierLimits()` - Min/max enforcement

### property-manager.js
- Line 22-34: `manageOwnerProperty()` - Main orchestrator
- Line 27-29: Validation (only when getting values)
- Line 42-57: `extractChildPropertyOwner()` - Returns PARENT object

### calculator.js
- Line 14-44: `calculateNewValue()` - All math operations
- Line 30-37: INC_P/DEC_P with rounding

### condition.js
- Line 40-45: `isValidOn()` - Validation entry point
- Line 48-76: Comparison methods (eq, ne, lt, gt, le, ge)

## Quick Patterns

### Basic Modifier
```javascript
const { Modifier, ModifierConst } = require('@reldens/modifiers');

let mod = new Modifier({
    key: 'attack-boost',
    propertyKey: 'attack',
    operation: ModifierConst.OPS.INC,
    value: 20
});

mod.apply(target);
mod.revert(target);
```

### With Conditions
```javascript
const { Condition } = require('@reldens/modifiers');

let condition = new Condition({
    key: 'level-check',
    propertyKey: 'level',
    conditional: ModifierConst.COMPARE.GE,
    value: 10
});

let mod = new Modifier({
    key: 'bonus',
    propertyKey: 'strength',
    operation: ModifierConst.OPS.INC,
    value: 25,
    conditions: [condition]
});
```

### Deep Property Access
```javascript
let mod = new Modifier({
    key: 'nested-boost',
    propertyKey: 'stats/combat/attack',
    operation: ModifierConst.OPS.INC,
    value: 30
});
```

### Base Property Operations
```javascript
// Read from maxHealth, apply to currentHealth
let mod = new Modifier({
    key: 'percentage-heal',
    propertyKey: 'currentHealth',
    basePropertyKey: 'maxHealth',
    operation: ModifierConst.OPS.INC_P,
    value: 50
});

mod.apply(target, true, false);
```

### With Limits
```javascript
let mod = new Modifier({
    key: 'heal',
    propertyKey: 'health',
    operation: ModifierConst.OPS.INC,
    value: 100,
    minValue: 0,
    maxProperty: 'maxHealth'
});
```

## Operation Quick Reference

| Op | ID | Apply | Revert | Use Case |
|----|----|-------|--------|----------|
| INC | 1 | a+b | a-b | Flat increase |
| DEC | 2 | a-b | a+b | Flat decrease |
| DIV | 3 | a/b | a*b | Division |
| MUL | 4 | a*b | a/b | Multiplication |
| INC_P | 5 | a+(a*b/100) | a/(1+b/100) | % increase |
| DEC_P | 6 | a-(a*b/100) | a/(1-b/100) | % decrease |
| SET | 7 | b | false | Set value |
| METHOD | 8 | custom | custom | Custom method |
| SET_N | 9 | b | false | Set value (alt) |

## Comparison Operators

| Op | Symbol | Code |
|----|--------|------|
| EQ | === | ModifierConst.COMPARE.EQ |
| NE | !== | ModifierConst.COMPARE.NE |
| LT | < | ModifierConst.COMPARE.LT |
| GT | > | ModifierConst.COMPARE.GT |
| LE | <= | ModifierConst.COMPARE.LE |
| GE | >= | ModifierConst.COMPARE.GE |

## State Constants

| State | Value | Meaning |
|-------|-------|---------|
| MOD_MISSING_KEY | 101 | No key provided |
| MOD_MISSING_PROPERTY_KEY | 102 | No propertyKey |
| MOD_MISSING_OPERATION | 103 | No operation |
| MOD_MISSING_VALUE | 104 | No value |
| MOD_READY | 105 | Ready to apply |
| MOD_APPLIED | 106 | Applied successfully |
| MOD_REVERTED | 107 | Reverted successfully |
| MOD_UNDEFINED_TARGET | 108 | No target object |
| MOD_INVALID_CONDITIONS | 109 | Conditions failed |
| MOD_MISSING_CONDITION_INSTANCE | 110 | Invalid condition |
| MOD_MODIFIER_ERROR | 111 | General error |

## Type Constants

```javascript
ModifierConst.TYPES.INT = 'integer'
ModifierConst.TYPES.STRING = 'string'
```

## Common Mistakes

### 1. Not Setting basePropertyKey
```javascript
// WRONG - basePropertyKey defaults to propertyKey
modifier.apply(target, true, false);

// RIGHT - Explicitly set basePropertyKey
new Modifier({
    propertyKey: 'currentHealth',
    basePropertyKey: 'maxHealth',
    ...
});
```

### 2. Property Path Typos
```javascript
// WRONG - Creates NEW property
propertyKey: 'stats/atk'  // stats.atk created

// RIGHT - Use existing property
propertyKey: 'stats/attack'  // stats.attack modified
```

### 3. Type Mismatches in Conditions
```javascript
// WRONG - Type mismatch
value: '10',
type: ModifierConst.TYPES.STRING
// Compares player.level (number) === '10' (string) → false

// RIGHT - Matching types
value: 10,
type: ModifierConst.TYPES.INT
```

### 4. Forgetting to Revert
```javascript
// WRONG - Modifier never reverted
modifier.apply(player);
// Stats permanently changed!

// RIGHT - Always pair apply/revert
modifier.apply(player);
// Later...
modifier.revert(player);
```

## PropertyManager Critical Details

### extractChildPropertyOwner Returns PARENT, Not Value

```javascript
let player = {
    stats: {
        attack: 50
    }
};

// For path 'stats/attack':
let parent = extractChildPropertyOwner(player, ['stats', 'attack']);
// Returns: player.stats (PARENT object)
// NOT: 50 (the value)
```

### Validation Only Happens on GET

```javascript
// Getting value - validates property exists
manager.getPropertyValue(player, 'stats/attack');
// If stats.attack doesn't exist → ErrorManager.error()

// Setting value - NO validation, creates if missing
manager.setOwnerProperty(player, 'stats/attack', 75);
// If stats.attack doesn't exist → creates it
```

## Base Property Parameters

### The Four Combinations

| useBase | applyBase | Read From | Write To | Use Case |
|---------|-----------|-----------|----------|----------|
| false | false | propertyKey | propertyKey | Normal modification |
| true | false | basePropertyKey | propertyKey | % of max to current |
| false | true | propertyKey | basePropertyKey | Current to base |
| true | true | basePropertyKey | basePropertyKey | Base to base |

## Limit Application Order

```javascript
1. Check minValue (if number)
2. Check maxValue (if number)
3. Check minProperty (if defined)
4. Check maxProperty (if defined)
```

**Example:**
```javascript
// value = 200
// minValue = 0 → 200 (no change)
// maxValue = 150 → 150 (clamped)
// maxProperty = 'maxHealth' (100) → 100 (clamped again)
// Final: 100
```

## Testing Quick Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --filter="Calculator"

# Run with watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Dependencies

**Only one dependency:**
```javascript
@reldens/utils
  - ErrorManager: Error handling
  - Logger: Logging
  - sc (Shortcuts): Helper methods
```

## Integration Points

**Used by:**
- `@reldens/items-system` - Item stat modifiers
- `@reldens/skills` - Skill effects and buffs
- Main Reldens platform - Character stats, equipment, buffs/debuffs

**Integrates with:**
- `@reldens/utils` - Core utilities
- `@reldens/items-system` - Item modifiers
- `@reldens/skills` - Skill modifiers

## Debug Tips

### Check Modifier State
```javascript
console.log(modifier.state);
// 105 = MOD_READY
// 106 = MOD_APPLIED
// 107 = MOD_REVERTED
// 108+ = Error states
```

### Trace Property Access
```javascript
// Add debug logging in property-manager.js
manageOwnerProperty(propertyOwner, propertyString, value){
    console.log('Path:', propertyString);
    console.log('Value:', value);
    console.log('Setting:', 'undefined' !== typeof value);
    // ... rest of code
}
```

### Test Condition Validation
```javascript
let result = condition.isValidOn(target);
console.log('Valid:', result);
console.log('Target value:', condition.targetPropertyValue);
console.log('Expected value:', condition.value);
```

### Verify Calculation
```javascript
let newValue = modifier.getModifiedValue(false, false);
console.log('Calculated:', newValue);
console.log('Before limits:', /* value before applyModifierLimits */);
console.log('After limits:', newValue);
```

## Important Reminders

1. **basePropertyKey defaults to propertyKey** - Always check if you need to set it explicitly
2. **extractChildPropertyOwner returns PARENT** - Not the property value
3. **Validation only on GET** - Setting creates properties if missing
4. **All conditions must pass** - Single failed condition = modifier doesn't apply
5. **Limits applied after calculation** - Before setting value on target
6. **Percentage operations use rounding** - Prevents decimal accumulation
7. **State tracks modifier lifecycle** - Check state for debugging
8. **Modifiers are reusable** - Same instance can be applied to multiple targets
