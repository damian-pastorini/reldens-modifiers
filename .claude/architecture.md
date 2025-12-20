# Modifiers System - Deep Technical Architecture

This document provides comprehensive technical details about the @reldens/modifiers package internals.

## Core Execution Flow

### Complete Modifier Application Flow

When you call `modifier.apply(target)`, here's the complete execution path:

```
modifier.apply(target, useBasePropertyToGetValue, applyOnBaseProperty)
  ↓
modifier.execute(target, revert=false, useBasePropertyToGetValue, applyOnBaseProperty)
  ↓
1. Validate target exists (line 86-88)
2. Validate conditions if present (line 90-96)
3. Override target if provided (line 99-101)
4. Calculate new value (line 103)
   ↓
   getModifiedValue(revert, useBasePropertyToGetValue)
     ↓
     a. Determine which property to read from (line 134)
     b. Get current value via PropertyManager (line 136)
     c. Calculate using Calculator (line 138)
     d. Handle special operations SET/SET_N/METHOD (line 140-151)
     e. Apply min/max limits (line 153)
        ↓
        applyModifierLimits(propertyValue)
          ↓
          - Check minValue (line 153-155)
          - Check maxValue (line 156-158)
          - Check minProperty (line 159-164)
          - Check maxProperty (line 165-170)
          - Return clamped value (line 171)
5. Determine which property to apply to (line 104)
6. Apply value via PropertyManager (line 105)
7. Update state to MOD_APPLIED (line 106)
8. Return true (line 107)
```

### Property Path Navigation Flow

**Example:** Modifying `stats/combat/attack` on a player object

```javascript
let player = {
    stats: {
        combat: {
            attack: 50,
            defense: 30
        }
    }
};

modifier.apply(player);
```

**Internal Flow:**

```
PropertyManager.setOwnerProperty(player, 'stats/combat/attack', 75)
  ↓
manageOwnerProperty(player, 'stats/combat/attack', 75)
  ↓
1. Split path: ['stats', 'combat', 'attack']  (line 24)
2. Extract parent object (line 25)
   ↓
   extractChildPropertyOwner(player, ['stats', 'combat', 'attack'])
     ↓
     a. Copy array and pop last element: ['stats', 'combat']  (line 44-45)
     b. If empty array, return player (single-level property)  (line 46-48)
     c. Navigate through path parts (line 49-55)
        - Check player.stats exists → currentOwner = player.stats
        - Check player.stats.combat exists → currentOwner = player.stats.combat
     d. Return player.stats.combat (the PARENT of 'attack')
3. Get final property name: 'attack'  (line 26)
4. Validate property exists when getting (line 27-29)
5. Set value: player.stats.combat['attack'] = 75  (line 30-32)
6. Return new value: 75  (line 33)
```

**Critical Understanding:**
- `extractChildPropertyOwner` returns the PARENT object, NOT the property value
- For `['stats', 'combat', 'attack']` it returns `player.stats.combat`
- This allows setting `player.stats.combat.attack` directly
- Validation only happens when GETTING values (value is undefined)
- When SETTING values, no validation is performed (allows creating new properties)

## Base Property Operations Deep Dive

### The Two Parameters

**useBasePropertyToGetValue:**
- Controls which property to READ from for calculation
- `true`: Read from `basePropertyKey`
- `false`: Read from `propertyKey`

**applyOnBaseProperty:**
- Controls which property to WRITE result to
- `true`: Write to `basePropertyKey`
- `false`: Write to `propertyKey`

### Four Possible Combinations

**1. Both false (default):**
```javascript
// Read from propertyKey, write to propertyKey
player.attack = 50;
modifier.apply(target, false, false);
// Reads from attack (50), calculates, writes to attack
```

**2. useBasePropertyToGetValue=true, applyOnBaseProperty=false:**
```javascript
// Read from basePropertyKey, write to propertyKey
player.currentHealth = 50;
player.baseHealth = 100;
modifier.apply(target, true, false);
// Reads from baseHealth (100), calculates, writes to currentHealth
```

**3. useBasePropertyToGetValue=false, applyOnBaseProperty=true:**
```javascript
// Read from propertyKey, write to basePropertyKey
player.currentHealth = 50;
player.baseHealth = 100;
modifier.apply(target, false, true);
// Reads from currentHealth (50), calculates, writes to baseHealth
```

**4. Both true:**
```javascript
// Read from basePropertyKey, write to basePropertyKey
player.baseHealth = 100;
modifier.apply(target, true, true);
// Reads from baseHealth (100), calculates, writes to baseHealth
```

### Real-World Use Cases

**Percentage-based healing from max health:**
```javascript
let player = {
    currentHealth: 30,
    maxHealth: 100
};

let healingPotion = new Modifier({
    key: 'healing-potion',
    propertyKey: 'currentHealth',
    basePropertyKey: 'maxHealth',
    operation: ModifierConst.OPS.INC_P,
    value: 50  // 50% of max health
});

// Calculate 50% of maxHealth (100) = 50
// Apply to currentHealth: 30 + 50 = 80
healingPotion.apply(player, true, false);
// Result: currentHealth = 80
```

**Equipment that modifies base stats:**
```javascript
let player = {
    currentStrength: 50,
    baseStrength: 100
};

let strengthRing = new Modifier({
    key: 'strength-ring',
    propertyKey: 'currentStrength',
    basePropertyKey: 'baseStrength',
    operation: ModifierConst.OPS.INC,
    value: 25
});

// Calculate from currentStrength: 50 + 25 = 75
// Apply to baseStrength (permanent base increase)
strengthRing.apply(player, false, true);
// Result: baseStrength = 75
```

## Calculator Operations Deep Dive

### INC_P (Increase Percentage) - The Tricky One

**Apply Formula** (calculator.js line 30-37):
```javascript
// originalValue = 100, operationValue = 50
let percentage = originalValue * operationValue / 100;  // 100 * 50 / 100 = 50
let roundedPercentage = Math.round(percentage);  // 50
return originalValue + roundedPercentage;  // 100 + 50 = 150
```

**Revert Formula** (calculator.js line 30-37):
```javascript
// currentValue = 150 (after applying +50%)
// We need to get back to original 100
// Formula: originalValue = currentValue / (1 + percentage/100)
let divider = 1 + (operationValue / 100);  // 1 + (50/100) = 1.5
let result = originalValue / divider;  // 150 / 1.5 = 100
return Math.round(result);  // 100
```

**Why Rounding Matters:**
```javascript
// Without rounding
100 * 33 / 100 = 33.33... → 133.33...

// With rounding
100 * 33 / 100 = 33.33... → 33 → 133

// Revert
133 / 1.33 = 100 (exact)
```

### DEC_P (Decrease Percentage)

**Apply Formula:**
```javascript
// originalValue = 100, operationValue = 25
let percentage = originalValue * operationValue / 100;  // 100 * 25 / 100 = 25
return originalValue - Math.round(percentage);  // 100 - 25 = 75
```

**Revert Formula:**
```javascript
// currentValue = 75 (after -25%)
// Formula: originalValue = currentValue / (1 - percentage/100)
let divider = 1 - (operationValue / 100);  // 1 - 0.25 = 0.75
return Math.round(originalValue / divider);  // 75 / 0.75 = 100
```

### All Operations Summary

| Operation | Apply | Revert | Example (100, 25) |
|-----------|-------|--------|-------------------|
| INC | a + b | a - b | 100 + 25 = 125 → 125 - 25 = 100 |
| DEC | a - b | a + b | 100 - 25 = 75 → 75 + 25 = 100 |
| MUL | a * b | a / b | 100 * 2 = 200 → 200 / 2 = 100 |
| DIV | a / b | a * b | 100 / 2 = 50 → 50 * 2 = 100 |
| INC_P | a + (a*b/100) | a / (1+b/100) | 150 → 100 |
| DEC_P | a - (a*b/100) | a / (1-b/100) | 75 → 100 |
| SET | b | false | Sets to b → Reverts to false |
| SET_N | b | false | Sets to b → Reverts to false |

## Modifier Limits System

### Execution Order

Limits are applied AFTER calculation but BEFORE setting the value:

```
1. Calculate new value
2. Apply modifier limits ← YOU ARE HERE
3. Set value on target
```

### Four Types of Limits

**1. minValue (fixed numeric minimum):**
```javascript
let modifier = new Modifier({
    key: 'damage',
    propertyKey: 'health',
    operation: ModifierConst.OPS.DEC,
    value: 150,
    minValue: 0  // Health cannot go below 0
});

// health = 100
// Calculate: 100 - 150 = -50
// Apply limit: max(-50, 0) = 0
// Result: health = 0
```

**2. maxValue (fixed numeric maximum):**
```javascript
let modifier = new Modifier({
    key: 'heal',
    propertyKey: 'health',
    operation: ModifierConst.OPS.INC,
    value: 100,
    maxValue: 150  // Health cannot exceed 150
});

// health = 100
// Calculate: 100 + 100 = 200
// Apply limit: min(200, 150) = 150
// Result: health = 150
```

**3. minProperty (dynamic minimum from target property):**
```javascript
let target = {
    health: 50,
    minHealth: 10
};

let modifier = new Modifier({
    key: 'damage',
    propertyKey: 'health',
    operation: ModifierConst.OPS.DEC,
    value: 100,
    minProperty: 'minHealth'  // Use minHealth as floor
});

// Calculate: 50 - 100 = -50
// Read minHealth: 10
// Apply limit: max(-50, 10) = 10
// Result: health = 10
```

**4. maxProperty (dynamic maximum from target property):**
```javascript
let target = {
    health: 50,
    maxHealth: 100
};

let modifier = new Modifier({
    key: 'heal',
    propertyKey: 'health',
    operation: ModifierConst.OPS.INC,
    value: 80,
    maxProperty: 'maxHealth'  // Use maxHealth as ceiling
});

// Calculate: 50 + 80 = 130
// Read maxHealth: 100
// Apply limit: min(130, 100) = 100
// Result: health = 100
```

### Limit Check Order (applyModifierLimits method)

```javascript
1. Check minValue (if it's a number)
2. Check maxValue (if it's a number)
3. Check minProperty (if defined and property exists)
4. Check maxProperty (if defined and property exists)
```

**Important:** All applicable limits are checked sequentially. A value could be adjusted multiple times:

```javascript
let modifier = new Modifier({
    propertyKey: 'health',
    operation: ModifierConst.OPS.SET,
    value: 200,
    minValue: 0,
    maxValue: 150,
    maxProperty: 'maxHealth'  // target.maxHealth = 120
});

// Flow:
// Initial: 200
// After minValue check: 200 (no change, 200 > 0)
// After maxValue check: 150 (clamped to 150)
// After maxProperty check: 120 (clamped to maxHealth)
// Final result: 120
```

## Condition System Deep Dive

### Condition Validation Flow

```javascript
let condition = new Condition({
    key: 'level-check',
    propertyKey: 'level',
    conditional: ModifierConst.COMPARE.GE,
    value: 10
});

condition.isValidOn(target);
```

**Execution:**
```
1. Get target property value via PropertyManager (line 42)
   - Supports deep paths: 'stats/combat/level'
2. Get comparison method name (line 43)
   - GE → 'ge'
3. Execute comparison method (line 44)
   - this.ge() → returns true/false
4. Return validation result
```

### All Comparison Methods

**EQ (Equal)** - condition.js line 48-51:
```javascript
eq(){
    return this.targetPropertyValue === this.value;
}
// Example: 10 === 10 → true
```

**NE (Not Equal)** - condition.js line 53-56:
```javascript
ne(){
    return this.targetPropertyValue !== this.value;
}
// Example: 10 !== 5 → true
```

**LT (Less Than)** - condition.js line 58-61:
```javascript
lt(){
    return this.targetPropertyValue < this.value;
}
// Example: 5 < 10 → true
```

**GT (Greater Than)** - condition.js line 63-66:
```javascript
gt(){
    return this.targetPropertyValue > this.value;
}
// Example: 15 > 10 → true
```

**LE (Less or Equal)** - condition.js line 68-71:
```javascript
le(){
    return this.targetPropertyValue <= this.value;
}
// Example: 10 <= 10 → true
```

**GE (Greater or Equal)** - condition.js line 73-76:
```javascript
ge(){
    return this.targetPropertyValue >= this.value;
}
// Example: 10 >= 10 → true
```

### Multiple Conditions

When a modifier has multiple conditions, ALL must be valid:

```javascript
let levelCondition = new Condition({
    key: 'min-level',
    propertyKey: 'level',
    conditional: ModifierConst.COMPARE.GE,
    value: 10
});

let healthCondition = new Condition({
    key: 'min-health',
    propertyKey: 'health',
    conditional: ModifierConst.COMPARE.GT,
    value: 50
});

let modifier = new Modifier({
    key: 'powerful-attack',
    propertyKey: 'damage',
    operation: ModifierConst.OPS.MUL,
    value: 2,
    conditions: [levelCondition, healthCondition]
});

// Validation (modifier.js validateConditions method line 116-129):
// for each condition:
//   - Check it's a Condition instance
//   - Call condition.isValidOn(target)
//   - If ANY fails, return false
// If ALL pass, return true
```

### Deep Property Conditions

Conditions support the same path notation as modifiers:

```javascript
let player = {
    stats: {
        combat: {
            level: 15
        }
    }
};

let condition = new Condition({
    key: 'combat-level-check',
    propertyKey: 'stats/combat/level',  // Deep path
    conditional: ModifierConst.COMPARE.GE,
    value: 10
});

condition.isValidOn(player);  // true (15 >= 10)
```

## PropertyManager Internal Mechanics

### The extractChildPropertyOwner Method

**Purpose:** Navigate to the PARENT object owning the final property.

**Critical Concept:** It does NOT return the property value, it returns the object containing the property.

```javascript
let player = {
    stats: {
        combat: {
            attack: 50
        }
    }
};

// For path 'stats/combat/attack'
let parts = ['stats', 'combat', 'attack'];
let parent = extractChildPropertyOwner(player, parts);
// Returns: player.stats.combat (NOT 50!)
```

**Step-by-Step Execution:**

```javascript
extractChildPropertyOwner(propertyOwner, propertyPathParts)
```

**Line 44-45:** Copy array and remove last element
```javascript
let pathToParent = [...propertyPathParts];  // ['stats', 'combat', 'attack']
pathToParent.pop();  // ['stats', 'combat']
```

**Line 46-48:** Handle single-level properties
```javascript
if(0 === pathToParent.length){
    return propertyOwner;  // No navigation needed
}
```

**Line 49-55:** Navigate through path
```javascript
let currentOwner = propertyOwner;  // Start at root
for(let propertyName of pathToParent){  // ['stats', 'combat']
    // Iteration 1: propertyName = 'stats'
    if(!sc.hasOwn(currentOwner, propertyName)){
        ErrorManager.error('Invalid property...');
    }
    currentOwner = currentOwner[propertyName];  // currentOwner = player.stats

    // Iteration 2: propertyName = 'combat'
    if(!sc.hasOwn(currentOwner, propertyName)){
        ErrorManager.error('Invalid property...');
    }
    currentOwner = currentOwner[propertyName];  // currentOwner = player.stats.combat
}
return currentOwner;  // Returns player.stats.combat
```

**Line 56:** Return parent object
```javascript
return currentOwner;  // The object containing the final property
```

### Why This Design?

**Allows direct property assignment:**
```javascript
let parent = extractChildPropertyOwner(player, ['stats', 'combat', 'attack']);
// parent = player.stats.combat

let propertyKey = 'attack';
parent[propertyKey] = 75;  // player.stats.combat.attack = 75
```

**Enables validation before access:**
```javascript
if(!sc.hasOwn(parent, propertyKey)){
    ErrorManager.error('Property does not exist!');
}
```

### manageOwnerProperty - The Orchestrator

This method coordinates getting/setting values:

**Getting a value (value parameter is undefined):**
```javascript
manageOwnerProperty(player, 'stats/combat/attack', undefined)
  ↓
1. Split path: ['stats', 'combat', 'attack']
2. Get parent: player.stats.combat
3. Get property name: 'attack'
4. Validate property exists (line 27-29)
5. Return value: player.stats.combat.attack
```

**Setting a value:**
```javascript
manageOwnerProperty(player, 'stats/combat/attack', 75)
  ↓
1. Split path: ['stats', 'combat', 'attack']
2. Get parent: player.stats.combat
3. Get property name: 'attack'
4. Skip validation (value is defined)
5. Set value: player.stats.combat.attack = 75
6. Return new value: 75
```

**Why validation only on GET:**
- Getting: Property must exist to read it
- Setting: Creating new properties is allowed

## Type System and Value Parsing

### Type Constants (constants.js)

```javascript
TYPES: {
    INT: 'integer',
    STRING: 'string'
}
```

### Value Parsing Flow

**Constructor** (modifier.js line 23-24):
```javascript
this.originalValue = props.value;  // Store original
this.value = this.parseValue(props.value);  // Parse based on type
```

**parseValue Method** (modifier.js line 54-63):
```javascript
parseValue(value){
    if(this.type === ModifierConst.TYPES.INT){
        value = Number(value);  // Convert to number
    }
    if(this.type === ModifierConst.TYPES.STRING){
        value = String(value);  // Convert to string
    }
    return value;
}
```

**Examples:**
```javascript
// INT type (default)
new Modifier({
    key: 'test',
    propertyKey: 'attack',
    operation: ModifierConst.OPS.INC,
    value: '25'  // String input
});
// this.value = 25 (number)

// STRING type
new Modifier({
    key: 'test',
    propertyKey: 'status',
    operation: ModifierConst.OPS.SET,
    type: ModifierConst.TYPES.STRING,
    value: 123  // Number input
});
// this.value = '123' (string)
```

### Min/Max Value Parsing

**Constructor** (modifier.js line 26-27):
```javascript
this.minValue = sc.hasOwn(props, 'minValue') ? this.parseValue(props.minValue) : false;
this.maxValue = sc.hasOwn(props, 'maxValue') ? this.parseValue(props.maxValue) : false;
```

**Why parse min/max values?**
- Ensures type consistency
- Allows string inputs from database/config
- Prevents type comparison issues

## State Management System

### State Constants (constants.js)

```javascript
MOD_MISSING_KEY: 101,
MOD_MISSING_PROPERTY_KEY: 102,
MOD_MISSING_OPERATION: 103,
MOD_MISSING_VALUE: 104,
MOD_READY: 105,
MOD_APPLIED: 106,
MOD_REVERTED: 107,
MOD_UNDEFINED_TARGET: 108,
MOD_INVALID_CONDITIONS: 109,
MOD_MISSING_CONDITION_INSTANCE: 110,
MOD_MODIFIER_ERROR: 111
```

### State Lifecycle

```
Constructor → determineState() → Initial State
                                      ↓
                        MOD_READY / MOD_MISSING_* / Error State
                                      ↓
                            apply() or revert()
                                      ↓
                        MOD_APPLIED / MOD_REVERTED / Error State
```

### determineState Method (modifier.js line 37-52)

**Validation Order:**
```javascript
1. Check key exists → MOD_MISSING_KEY
2. Check propertyKey exists → MOD_MISSING_PROPERTY_KEY
3. Check operation exists → MOD_MISSING_OPERATION
4. Check value exists → MOD_MISSING_VALUE
5. All valid → MOD_READY
```

### Runtime State Changes

**During execution:**
```javascript
execute(target, revert){
    // State can change during execution:
    if(!target){
        this.state = ModifierConst.MOD_UNDEFINED_TARGET;
        return false;
    }

    if(conditions invalid){
        this.state = ModifierConst.MOD_INVALID_CONDITIONS;
        return false;
    }

    // Success:
    this.state = revert ? ModifierConst.MOD_REVERTED : ModifierConst.MOD_APPLIED;
    return true;
}
```

**During condition validation:**
```javascript
validateConditions(target){
    if(!(condition instanceof Condition)){
        this.state = ModifierConst.MOD_MISSING_CONDITION_INSTANCE;
        return false;
    }

    if(!condition.isValidOn(target)){
        this.state = ModifierConst.MOD_INVALID_CONDITIONS;
        return false;
    }
}
```

**During method operation:**
```javascript
if(this.operation === ModifierConst.OPS.METHOD){
    if(!sc.hasOwn(this, this.value) || 'function' !== typeof this[this.value]){
        this.state = ModifierConst.MOD_MODIFIER_ERROR;
        return false;
    }
}
```

## Integration Patterns

### With @reldens/items-system

Items use modifiers for equipment stats:

```javascript
// Item has modifiers
let sword = {
    key: 'iron-sword',
    modifiers: {
        '1': new Modifier({
            key: 'sword-attack',
            propertyKey: 'stats/atk',
            operation: ModifierConst.OPS.INC,
            value: 25
        }),
        '2': new Modifier({
            key: 'sword-speed',
            propertyKey: 'stats/spd',
            operation: ModifierConst.OPS.DEC,
            value: 5
        })
    }
};

// When equipped:
for(let modifierId in item.modifiers){
    let modifier = item.modifiers[modifierId];
    modifier.apply(player);
}

// When unequipped:
for(let modifierId in item.modifiers){
    let modifier = item.modifiers[modifierId];
    modifier.revert(player);
}
```

### With @reldens/skills

Skills use modifiers for temporary buffs:

```javascript
let skill = {
    key: 'berserker-rage',
    duration: 10000,  // 10 seconds
    modifiers: {
        attack_boost: new Modifier({
            key: 'rage-attack',
            propertyKey: 'stats/atk',
            operation: ModifierConst.OPS.INC_P,
            value: 50  // +50% attack
        }),
        defense_penalty: new Modifier({
            key: 'rage-defense',
            propertyKey: 'stats/def',
            operation: ModifierConst.OPS.DEC_P,
            value: 30  // -30% defense
        })
    }
};

// On skill cast:
for(let key in skill.modifiers){
    skill.modifiers[key].apply(player);
}

// After duration:
setTimeout(() => {
    for(let key in skill.modifiers){
        skill.modifiers[key].revert(player);
    }
}, skill.duration);
```

### Custom Method Operations

Extend Modifier class for complex calculations:

```javascript
const { Modifier, ModifierConst } = require('@reldens/modifiers');

class CriticalHitModifier extends Modifier
{
    criticalCalculation(modifier, currentValue)
    {
        let baseDamage = currentValue;
        let critChance = this.target.stats.critChance || 0.1;
        let critMultiplier = this.target.stats.critMultiplier || 2;

        if(Math.random() < critChance){
            return Math.floor(baseDamage * critMultiplier);
        }

        return baseDamage;
    }
}

let critModifier = new CriticalHitModifier({
    key: 'crit-system',
    propertyKey: 'calculatedDamage',
    operation: ModifierConst.OPS.METHOD,
    value: 'criticalCalculation'  // Method name
});

critModifier.apply(combatContext);
```

## Common Gotchas and Solutions

### 1. Using basePropertyKey Without Setting It

**Problem:**
```javascript
let modifier = new Modifier({
    key: 'test',
    propertyKey: 'currentHealth',
    // No basePropertyKey specified
    operation: ModifierConst.OPS.INC_P,
    value: 50
});

modifier.apply(target, true, false);  // useBasePropertyToGetValue = true
```

**What Happens:**
- basePropertyKey defaults to propertyKey (line 20)
- Reads from currentHealth, not maxHealth
- Unexpected calculation

**Solution:**
```javascript
let modifier = new Modifier({
    key: 'test',
    propertyKey: 'currentHealth',
    basePropertyKey: 'maxHealth',  // Explicitly set
    operation: ModifierConst.OPS.INC_P,
    value: 50
});
```

### 2. Forgetting to Revert Modifiers

**Problem:**
```javascript
// Apply modifier
modifier.apply(player);

// Player changes equipment
// Modifier never reverted!
// Stats permanently modified
```

**Solution:**
```javascript
// Always pair apply with revert
modifier.apply(player);

// Later...
modifier.revert(player);
```

### 3. Modifying Wrong Property with Paths

**Problem:**
```javascript
let player = {
    stats: {
        combat: { attack: 50 }
    }
};

let modifier = new Modifier({
    key: 'test',
    propertyKey: 'stats/combat/atk',  // TYPO: 'atk' not 'attack'
    operation: ModifierConst.OPS.INC,
    value: 25
});

modifier.apply(player);
// Creates stats.combat.atk = 25 (NEW property!)
// stats.combat.attack = 50 (unchanged)
```

**Solution:**
- Double-check property paths
- Use constants for property names
- Validate in tests

### 4. Condition Type Mismatches

**Problem:**
```javascript
let player = { level: 10 };  // Number

let condition = new Condition({
    key: 'level-check',
    propertyKey: 'level',
    conditional: ModifierConst.COMPARE.EQ,
    type: ModifierConst.TYPES.STRING,  // Wrong type!
    value: '10'
});

condition.isValidOn(player);  // false! (10 !== '10')
```

**Solution:**
```javascript
let condition = new Condition({
    key: 'level-check',
    propertyKey: 'level',
    conditional: ModifierConst.COMPARE.EQ,
    type: ModifierConst.TYPES.INT,  // Correct type
    value: 10
});
```

### 5. Percentage Operations on Zero

**Problem:**
```javascript
let player = { damage: 0 };

let modifier = new Modifier({
    key: 'damage-boost',
    propertyKey: 'damage',
    operation: ModifierConst.OPS.INC_P,
    value: 100  // +100%
});

modifier.apply(player);
// Result: damage = 0 (0 + 100% of 0 = 0)
```

**Solution:**
- Use absolute values (INC) for base increases
- Or set base value first, then apply percentages

## Testing Patterns

### Test Structure

Tests are organized by class and functionality:

```
tests/
  unit/
    test-calculator.js - Calculator operations
    test-condition.js - Condition validation
    test-modifier.js - Modifier application/revert
    test-property-manager.js - Property navigation
    test-constants.js - Constants validation
  fixtures/
    test-helpers.js - Mock objects and helpers
```

### Key Test Scenarios

**1. Basic Operations:**
- Each operation type (INC, DEC, MUL, DIV, INC_P, DEC_P, SET)
- Apply and revert
- State changes

**2. Property Navigation:**
- Simple properties ('health')
- Nested properties ('stats/health')
- Deep nested properties ('stats/combat/attack')
- Error handling for invalid paths

**3. Conditions:**
- All comparison operators
- Multiple conditions
- Nested property conditions
- Type handling (INT vs STRING)

**4. Edge Cases:**
- Zero values
- Negative values
- Very large numbers
- Decimal values
- Type conversions

**5. Integration:**
- Modifiers with conditions
- Modifiers with limits
- Base property operations

## Performance Considerations

### PropertyManager Caching

PropertyManager does NOT cache property lookups. Each access navigates the full path:

```javascript
// Every call navigates full path
modifier.apply(player);  // Navigates to property
modifier.revert(player);  // Navigates again
```

**For high-frequency modifications:**
- Consider caching parent objects
- Or use direct property access when paths are static

### Condition Validation

Conditions are validated on every apply/revert:

```javascript
// With 5 conditions:
modifier.apply(player);
// Validates all 5 conditions
// Then applies modifier
```

**Optimization:**
- Use minimal conditions
- Or cache validation results if conditions don't change

### Modifier Reuse

Modifier instances are reusable:

```javascript
let modifier = new Modifier({
    key: 'heal',
    propertyKey: 'health',
    operation: ModifierConst.OPS.INC,
    value: 50
});

// Use on multiple targets
modifier.apply(player1);
modifier.apply(player2);
modifier.apply(player3);
```

**Benefit:**
- Single instance for common modifiers
- Reduced memory footprint
- Consistent behavior
