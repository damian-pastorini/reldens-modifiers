[![Reldens - GitHub - Release](https://www.dwdeveloper.com/media/reldens/reldens-mmorpg-platform.png)](https://github.com/damian-pastorini/reldens)

# Reldens - Modifiers

## About

This package is for the Modifiers class, which helps to apply and revert values to an specific target properties.


## How to

To use this class you just need to require/import it and passing the required properties to create each instance.

```
// require the class:
const { Modifier } = require('@reldens/modifiers');

// create an instance with target:
let modifyAtk = new Modifier({
   target: targetObject,
   key: 'sword-atk',
   propertyKey: 'stats/atk',
   operation: ItemsConst.OPS.INC,
   value: 200 // this would be how much the atk points increase (property original value + 200).
});

// since the target was already set in the modifier then we can just apply it:
modifyAtk.apply();

// or just create an instance without the target:
let modifyAtk = new Modifier({
   key: 'sword-atk',
   propertyKey: 'stats/atk',
   operation: ItemsConst.OPS.INC,
   value: 200
});

// and apply or revert the modifier by passing and setting the target on the execution:
modifyAtk.apply(targetObject);
```

Notes:

 - In the example we are using a property path `stats/atk` as `propertyKey`, the modifier will follow the path
as each part been an object/sub-object property, like: `targetObject.stats.atk`.
The goal behind this is to always use as target the object that contains all the possible properties to be modified.

 - The target can be specified on the modifier creation or in the execution. In the second case the target will be set
on the `modifier.target` property.

---

### [Reldens](https://github.com/damian-pastorini/reldens/ "Reldens")

##### [By DwDeveloper](https://www.dwdeveloper.com/ "DwDeveloper")
