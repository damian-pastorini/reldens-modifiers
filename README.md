[![Reldens - GitHub - Release](https://www.dwdeveloper.com/media/reldens/reldens-mmorpg-platform.png)](https://github.com/damian-pastorini/reldens)

# Reldens - Modifiers

## About

This package provides a modifiers system originally created for the Reldens project, but designed to be used anywhere. 

The package includes:

- **Modifier**: Apply and revert value modifications to object properties with conditions and limits
- **Condition**: Define conditions that must be met before applying modifiers
- **Calculator**: Handle mathematical operations (increase, decrease, multiply, divide, percentages, set values)
- **PropertyManager**: Access and modify deep object properties using path notation
- **Constants**: Pre-defined operation types, comparison operators, and state constants

## Installation

```bash
npm install @reldens/modifiers
```

## Quick Start

```javascript
const { Modifier, ModifierConst } = require('@reldens/modifiers');

// Create a player object
let player = {
    health: 100,
    maxHealth: 150,
    attack: 50
};

// Create a modifier to increase attack by 20
let attackBoost = new Modifier({
    key: 'attack-boost',
    propertyKey: 'attack',
    operation: ModifierConst.OPS.INC,
    value: 20
});

// Apply the modifier
attackBoost.apply(player);
console.log(player.attack); // 70

// Revert the modifier
attackBoost.revert(player);
console.log(player.attack); // 50
```

## Detailed Usage Examples

### Modifier Class

The Modifier class is the core component for applying value changes to object properties.

#### Basic Operations

```javascript
const { Modifier, ModifierConst } = require('@reldens/modifiers');

let character = {
    strength: 100,
    intelligence: 80,
    gold: 500
};

// Increase (INC)
let strengthBonus = new Modifier({
    key: 'str-bonus',
    propertyKey: 'strength',
    operation: ModifierConst.OPS.INC,
    value: 25
});
strengthBonus.apply(character);
console.log(character.strength); // 125

// Decrease (DEC)
let goldCost = new Modifier({
    key: 'shop-cost',
    propertyKey: 'gold',
    operation: ModifierConst.OPS.DEC,
    value: 150
});
goldCost.apply(character);
console.log(character.gold); // 350

// Multiply (MUL)
let criticalHit = new Modifier({
    key: 'crit-damage',
    propertyKey: 'strength',
    operation: ModifierConst.OPS.MUL,
    value: 2
});
criticalHit.apply(character);
console.log(character.strength); // 250

// Divide (DIV)
let weakness = new Modifier({
    key: 'weakness-debuff',
    propertyKey: 'strength',
    operation: ModifierConst.OPS.DIV,
    value: 2
});
weakness.apply(character);
console.log(character.strength); // 125
```

#### Percentage Operations

```javascript
let stats = { damage: 200, defense: 100 };

// Increase by percentage (INC_P)
let damageIncrease = new Modifier({
    key: 'damage-boost',
    propertyKey: 'damage',
    operation: ModifierConst.OPS.INC_P,
    value: 50 // 50% increase
});
damageIncrease.apply(stats);
console.log(stats.damage); // 300 (200 + 50% of 200)

// Decrease by percentage (DEC_P)
let armorPiercing = new Modifier({
    key: 'armor-pierce',
    propertyKey: 'defense',
    operation: ModifierConst.OPS.DEC_P,
    value: 25 // 25% reduction
});
armorPiercing.apply(stats);
console.log(stats.defense); // 75 (100 - 25% of 100)
```

#### Set Operations

```javascript
let player = { level: 1, status: 'normal' };

// Set numeric value (SET)
let levelUp = new Modifier({
    key: 'level-up',
    propertyKey: 'level',
    operation: ModifierConst.OPS.SET,
    value: 10
});
levelUp.apply(player);
console.log(player.level); // 10

// Set string value (SET with string type)
let statusEffect = new Modifier({
    key: 'poison-status',
    propertyKey: 'status',
    operation: ModifierConst.OPS.SET,
    type: ModifierConst.TYPES.STRING,
    value: 'poisoned'
});
statusEffect.apply(player);
console.log(player.status); // 'poisoned'
```

#### Value Limits

```javascript
let character = { health: 50, maxHealth: 100 };

// Modifier with min/max limits
let healing = new Modifier({
    key: 'healing-potion',
    propertyKey: 'health',
    operation: ModifierConst.OPS.INC,
    value: 80,
    minValue: 0,
    maxValue: 100
});
healing.apply(character);
console.log(character.health); // 100 (capped at maxValue)

// Using property-based limits
let manaRestore = new Modifier({
    key: 'mana-potion',
    propertyKey: 'mana',
    operation: ModifierConst.OPS.INC,
    value: 50,
    maxProperty: 'maxMana' // Use maxMana property as limit
});
```

#### Deep Property Access

```javascript
let character = {
    stats: {
        combat: {
            attack: 100,
            defense: 80
        },
        magic: {
            power: 60
        }
    }
};

// Modify nested property using path notation
let magicBoost = new Modifier({
    key: 'magic-boost',
    propertyKey: 'stats/magic/power',
    operation: ModifierConst.OPS.INC,
    value: 25
});
magicBoost.apply(character);
console.log(character.stats.magic.power); // 85
```

### Condition Class

Conditions allow you to control when modifiers should be applied.

#### Basic Conditions

```javascript
const { Condition, ModifierConst } = require('@reldens/modifiers');

let player = { level: 15, health: 80, maxHealth: 100 };

// Create conditions
let levelCondition = new Condition({
    key: 'min-level',
    propertyKey: 'level',
    conditional: ModifierConst.COMPARE.GE, // Greater or equal
    value: 10
});

let healthCondition = new Condition({
    key: 'low-health',
    propertyKey: 'health',
    conditional: ModifierConst.COMPARE.LT, // Less than
    value: 90
});

// Test conditions
console.log(levelCondition.isValidOn(player)); // true (15 >= 10)
console.log(healthCondition.isValidOn(player)); // true (80 < 90)
```

#### Available Comparison Operators

```javascript
// All available comparison operators
let conditions = {
    equals: ModifierConst.COMPARE.EQ,        // ===
    notEquals: ModifierConst.COMPARE.NE,     // !==
    lessThan: ModifierConst.COMPARE.LT,      // <
    greaterThan: ModifierConst.COMPARE.GT,   // >
    lessOrEqual: ModifierConst.COMPARE.LE,   // <=
    greaterOrEqual: ModifierConst.COMPARE.GE // >=
};
```

#### Modifiers with Conditions

```javascript
let player = { level: 5, experience: 1200, strength: 50 };

// Create condition
let experienceCondition = new Condition({
    key: 'exp-check',
    propertyKey: 'experience',
    conditional: ModifierConst.COMPARE.GE,
    value: 1000
});

// Create modifier with condition
let experienceBonus = new Modifier({
    key: 'exp-strength-bonus',
    propertyKey: 'strength',
    operation: ModifierConst.OPS.INC,
    value: 10,
    conditions: [experienceCondition]
});

// This will apply because experience >= 1000
experienceBonus.apply(player);
console.log(player.strength); // 60

// Change experience and test again
player.experience = 500;
let newBonus = new Modifier({
    key: 'another-bonus',
    propertyKey: 'strength',
    operation: ModifierConst.OPS.INC,
    value: 20,
    conditions: [experienceCondition]
});

// This won't apply because experience < 1000
newBonus.apply(player);
console.log(player.strength); // Still 60
```

### PropertyManager Class

The PropertyManager handles deep property access using path notation.

```javascript
const { PropertyManager } = require('@reldens/modifiers');

let propertyManager = new PropertyManager();

let gameObject = {
    player: {
        inventory: {
            weapons: {
                sword: { damage: 50, durability: 100 }
            }
        }
    }
};

// Get deep property value
let swordDamage = propertyManager.getPropertyValue(gameObject, 'player/inventory/weapons/sword/damage');
console.log(swordDamage); // 50

// Set deep property value
propertyManager.setOwnerProperty(gameObject, 'player/inventory/weapons/sword/damage', 65);
console.log(gameObject.player.inventory.weapons.sword.damage); // 65
```

### Calculator Class

The Calculator class handles mathematical operations and can be used independently.

```javascript
const { Calculator, ModifierConst } = require('@reldens/modifiers');

let calculator = new Calculator();

// Basic operations
console.log(calculator.calculateNewValue(100, ModifierConst.OPS.INC, 25, false)); // 125
console.log(calculator.calculateNewValue(100, ModifierConst.OPS.DEC, 30, false)); // 70
console.log(calculator.calculateNewValue(50, ModifierConst.OPS.MUL, 3, false)); // 150
console.log(calculator.calculateNewValue(60, ModifierConst.OPS.DIV, 2, false)); // 30

// Percentage operations
console.log(calculator.calculateNewValue(200, ModifierConst.OPS.INC_P, 50, false)); // 300
console.log(calculator.calculateNewValue(100, ModifierConst.OPS.DEC_P, 25, false)); // 75

// Revert operations (using revert = true)
console.log(calculator.calculateNewValue(125, ModifierConst.OPS.INC, 25, true)); // 100
console.log(calculator.calculateNewValue(70, ModifierConst.OPS.DEC, 30, true)); // 100
```

## Real-World Examples

### RPG Character System

```javascript
const { Modifier, Condition, ModifierConst } = require('@reldens/modifiers');

// Character data
let character = {
    level: 20,
    class: 'warrior',
    stats: {
        strength: 100,
        agility: 60,
        intelligence: 40
    },
    equipment: {
        weapon: null,
        armor: null
    }
};

// Equipment modifiers
let magicSword = new Modifier({
    key: 'magic-sword',
    propertyKey: 'stats/strength',
    operation: ModifierConst.OPS.INC,
    value: 35
});

let agilityBoots = new Modifier({
    key: 'agility-boots',
    propertyKey: 'stats/agility',
    operation: ModifierConst.OPS.INC_P,
    value: 25 // 25% increase
});

// Class-specific bonuses with conditions
let warriorCondition = new Condition({
    key: 'warrior-class',
    propertyKey: 'class',
    conditional: ModifierConst.COMPARE.EQ,
    type: ModifierConst.TYPES.STRING,
    value: 'warrior'
});

let classBonus = new Modifier({
    key: 'warrior-strength-bonus',
    propertyKey: 'stats/strength',
    operation: ModifierConst.OPS.INC_P,
    value: 20,
    conditions: [warriorCondition]
});

// Apply equipment
magicSword.apply(character);
agilityBoots.apply(character);
classBonus.apply(character);

console.log('Final stats:', character.stats);
// strength: 162 (100 + 35 + 20% of 135)
// agility: 75 (60 + 25% of 60)
// intelligence: 40 (unchanged)
```

### Temporary Buff System

```javascript
// Buff system with time limits and conditions
let player = { health: 200, maxHealth: 300, mana: 50 };

// Health condition for mana regeneration
let lowManaCondition = new Condition({
    key: 'low-mana',
    propertyKey: 'mana',
    conditional: ModifierConst.COMPARE.LT,
    value: 100
});

// Conditional mana regeneration
let manaRegen = new Modifier({
    key: 'mana-regen-buff',
    propertyKey: 'mana',
    operation: ModifierConst.OPS.INC,
    value: 25,
    maxProperty: 'maxMana',
    conditions: [lowManaCondition]
});

// Apply buff (will work because mana < 100)
manaRegen.apply(player);
console.log(player.mana); // 75

// Try to apply again (still works because mana < 100)
manaRegen.apply(player);
console.log(player.mana); // 100

// Try once more (won't work because mana >= 100)
let player2 = { ...player };
manaRegen.apply(player2);
console.log(player2.mana); // Still 100 (condition not met)
```

## Constants Reference

### Operations (ModifierConst.OPS)

- `INC` (1): Increase value
- `DEC` (2): Decrease value  
- `DIV` (3): Divide value
- `MUL` (4): Multiply value
- `INC_P` (5): Increase by percentage
- `DEC_P` (6): Decrease by percentage
- `SET` (7): Set absolute value
- `METHOD` (8): Call custom method
- `SET_N` (9): Set value (alternative)

### Comparison Operators (ModifierConst.COMPARE)

- `EQ`: Equal to (===)
- `NE`: Not equal to (!==)
- `LT`: Less than (<)
- `GT`: Greater than (>)
- `LE`: Less than or equal (<=)
- `GE`: Greater than or equal (>=)

### Data Types (ModifierConst.TYPES)

- `INT`: Integer type
- `STRING`: String type

### Modifier States

- `MOD_MISSING_KEY`: Missing key parameter
- `MOD_MISSING_PROPERTY_KEY`: Missing propertyKey parameter
- `MOD_MISSING_OPERATION`: Missing operation parameter
- `MOD_MISSING_VALUE`: Missing value parameter
- `MOD_READY`: Modifier ready to apply
- `MOD_APPLIED`: Modifier successfully applied
- `MOD_REVERTED`: Modifier successfully reverted
- `MOD_UNDEFINED_TARGET`: No target object specified
- `MOD_INVALID_CONDITIONS`: Conditions not met
- `MOD_MISSING_CONDITION_INSTANCE`: Invalid condition instance
- `MOD_MODIFIER_ERROR`: General modifier error

## Advanced Features

### Base Property Operations

Use different properties for calculation and application:

```javascript
let character = {
    currentHealth: 50,
    baseHealth: 100,
    maxHealth: 120
};

// Calculate from baseHealth but apply to currentHealth
let healing = new Modifier({
    key: 'healing-spell',
    propertyKey: 'currentHealth',
    basePropertyKey: 'baseHealth',
    operation: ModifierConst.OPS.INC_P,
    value: 30 // 30% of baseHealth
});

// Use baseHealth for calculation, apply to currentHealth
healing.apply(character, true, false);
console.log(character.currentHealth); // 80 (50 + 30% of 100)
```

### Custom Method Operations

```javascript
class CustomModifier extends Modifier
{
    customCalculation(modifier, currentValue)
    {
        // Custom logic here
        return Math.floor(currentValue * 1.5) + 10;
    }
}

let customMod = new CustomModifier({
    key: 'custom-boost',
    propertyKey: 'attack',
    operation: ModifierConst.OPS.METHOD,
    value: 'customCalculation'
});
```

## Error Handling

The package includes comprehensive error handling and state management:

```javascript
let invalidModifier = new Modifier({
    // Missing required parameters
    key: 'invalid'
});

console.log(invalidModifier.state); // Will show error state code
```

---

Need something specific?

[Request a feature here: https://www.reldens.com/features-request](https://www.reldens.com/features-request)

## Documentation

[https://www.reldens.com/documentation/modifiers](https://www.reldens.com/documentation/modifiers)

---

### [Reldens](https://github.com/damian-pastorini/reldens/ "Reldens")

##### [By DwDeveloper](https://www.dwdeveloper.com/ "DwDeveloper")
