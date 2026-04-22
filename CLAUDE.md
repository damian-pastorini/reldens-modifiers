## Package Overview

**@reldens/modifiers** is the modifiers system for Reldens. It provides:
- Stat modification system with mathematical operations
- Conditional modifiers based on target state
- Deep property access using path notation
- Revertible operations (apply/revert)
- Value limits and property-based constraints
- State management for modifier lifecycle

## Key Commands

```bash
# Run tests
npm test

# Install dependencies
npm install
```

## Architecture

### Core Classes

**Modifier** (`lib/modifier.js`):
- Main class for applying/reverting value changes to object properties
- Supports operations: INC, DEC, MUL, DIV, INC_P, DEC_P, SET, SET_N, METHOD
- Conditional application based on target state
- Value limits via `minValue`, `maxValue`, `minProperty`, `maxProperty`
- Deep property access via path notation (e.g., 'stats/combat/attack')
- State tracking: MOD_READY, MOD_APPLIED, MOD_REVERTED, etc.
- Methods:
  - `apply(target, useBasePropertyToGetValue, applyOnBaseProperty)` - Apply modifier
  - `revert(target, useBasePropertyToGetValue, applyOnBaseProperty)` - Revert modifier
  - `execute(target, revert, useBasePropertyToGetValue, applyOnBaseProperty)` - Core execution logic

**Condition** (`lib/condition.js`):
- Validates conditions before applying modifiers
- Supports comparisons: EQ, NE, LT, GT, LE, GE
- Methods:
  - `isValidOn(targetObject, overrideVal)` - Check if condition is met
  - Comparison methods: `eq()`, `ne()`, `lt()`, `gt()`, `le()`, `ge()`
- Supports INT and STRING data types

**Calculator** (`lib/calculator.js`):
- Performs mathematical operations
- Handles percentage calculations with rounding
- Supports revert operations (inverse calculations)
- Method:
  - `calculateNewValue(originalValue, operation, operationValue, revert)` - Calculate modified value

**PropertyManager** (`lib/property-manager.js`):
- Accesses and modifies deep object properties
- Uses path notation with '/' separator (e.g., 'player/stats/health')
- Methods:
  - `getPropertyValue(propertyOwner, propertyString)` - Get nested property value
  - `setOwnerProperty(propertyOwner, propertyString, value)` - Set nested property value
  - `manageOwnerProperty(propertyOwner, propertyString, value)` - Internal property management
  - `extractChildPropertyOwner(propertyOwner, propertyPathParts)` - Navigate to parent object owning the final property

**ModifierConst** (`lib/constants.js`):
- Operation types: INC (1), DEC (2), DIV (3), MUL (4), INC_P (5), DEC_P (6), SET (7), METHOD (8), SET_N (9)
- Comparison operators: EQ, NE, LT, GT, LE, GE
- Data types: INT, STRING
- State constants: MOD_READY, MOD_APPLIED, MOD_REVERTED, MOD_MISSING_KEY, etc.

### Modifier Operations

**Operation Types**:
- `INC` (1) - Increment: Add to current value
- `DEC` (2) - Decrement: Subtract from current value
- `MUL` (4) - Multiply: Multiply current value
- `DIV` (3) - Divide: Divide current value
- `INC_P` (5) - Increase Percentage: Add percentage of current value
- `DEC_P` (6) - Decrease Percentage: Subtract percentage of current value
- `SET` (7) - Set: Replace with new value
- `SET_N` (9) - Set (alternative): Replace with new value
- `METHOD` (8) - Custom Method: Call custom calculation method

**Operation Examples**:
```javascript
// INC: 100 + 25 = 125
// DEC: 100 - 30 = 70
// MUL: 50 * 3 = 150
// DIV: 60 / 2 = 30
// INC_P: 200 + (200 * 50 / 100) = 300
// DEC_P: 100 - (100 * 25 / 100) = 75
// SET: value = 10 (ignores current value)
```

**Revert Operations**:
- All operations can be reverted (inverse calculations)
- INC reverts to DEC, MUL reverts to DIV, and vice versa
- Percentage operations use special revert formulas
- SET operations revert to `false`

### Advanced Features

**Base Property Operations**:
- `basePropertyKey` - Property to read value from for calculations
- `propertyKey` - Property to apply result to
- `useBasePropertyToGetValue` - Use basePropertyKey for calculation
- `applyOnBaseProperty` - Apply result to basePropertyKey instead of propertyKey
- Example: Calculate from `baseHealth` but apply to `currentHealth`

**Conditional Modifiers**:
- `conditions` - Array of Condition instances
- Modifier only applies if all conditions are valid
- `conditionsOnRevert` - Check conditions on revert (default: false)

**Value Limits**:
- `minValue` / `maxValue` - Fixed numeric limits
- `minProperty` / `maxProperty` - Property-based limits (e.g., use maxHealth as limit)

## Important Notes

- Used by `@reldens/skills` for skill effects and bonuses
- Used by `@reldens/items-system` for item bonuses and equipment stats
- Used throughout main Reldens project for character stats, buffs, debuffs
- All modifiers are revertible (can be undone)
- Server-authoritative (server calculates all modifier effects)
- Client receives final calculated values only
- Supports complex conditional logic for modifier activation
- Deep property access enables modifying nested object structures
- State management helps with debugging and validation
- Only dependency: `@reldens/utils` (for ErrorManager, Logger, and Shortcuts)

## Implementation Patterns

**Creating a Simple Modifier**:
```javascript
const { Modifier, ModifierConst } = require('@reldens/modifiers');
let modifier = new Modifier({
    key: 'attack-boost',
    propertyKey: 'attack',
    operation: ModifierConst.OPS.INC,
    value: 20
});
modifier.apply(target);
modifier.revert(target);
```

**Creating a Conditional Modifier**:
```javascript
const { Modifier, Condition, ModifierConst } = require('@reldens/modifiers');
let condition = new Condition({
    key: 'min-level',
    propertyKey: 'level',
    conditional: ModifierConst.COMPARE.GE,
    value: 10
});
let modifier = new Modifier({
    key: 'level-bonus',
    propertyKey: 'strength',
    operation: ModifierConst.OPS.INC,
    value: 10,
    conditions: [condition]
});
```

**Deep Property Access**:
```javascript
let modifier = new Modifier({
    key: 'nested-stat-boost',
    propertyKey: 'stats/combat/attack',
    operation: ModifierConst.OPS.INC_P,
    value: 25
});
```
