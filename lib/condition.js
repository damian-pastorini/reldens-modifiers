/**
 *
 * Reldens - Condition
 *
 */

const { ErrorManager, sc } = require('@reldens/utils');
const PropertyManager = require('./property-manager');
const ModifierConst = require('./constants');

class Condition
{

    constructor(props)
    {
        if(!sc.hasOwn(props, 'key')){
            ErrorManager.error('Missing Condition key.');
        }
        if(!sc.hasOwn(props, 'propertyKey')){
            ErrorManager.error('Missing Condition propertyKey.');
        }
        if(!sc.hasOwn(props, 'conditional')){
            ErrorManager.error('Missing Condition conditional.');
        }
        if(!sc.hasOwn(props, 'value')){
            ErrorManager.error('Missing Condition value.');
        }
        this.key = props.key;
        this.propertyKey = props.propertyKey;
        this.conditional = props.conditional;
        this.type = sc.get(props, 'type', ModifierConst.TYPES.INT);
        this.value = this.parseValue(props.value);
        this.propertyManager = new PropertyManager();
    }

    parseValue(value)
    {
        if(this.type === ModifierConst.TYPES.INT){
            value = Number(value);
        }
        if(this.type === ModifierConst.TYPES.STRING){
            value = String(value);
        }
        return value;
    }

    isValidOn(targetObject, overrideVal)
    {
        if (typeof this[this.conditional] === 'function'){
            let value = overrideVal || this.value;
            let targetPropValue = this.propertyManager.getPropertyValue(targetObject, this.propertyKey);
            return this[this.conditional](targetPropValue, value);
        }
        ErrorManager.error('Condition operation is not a function.');
    }

    eq(targetPropValue, value)
    {
        return targetPropValue === value;
    }

    ne(targetPropValue, value)
    {
        return targetPropValue !== value;
    }

    lt(targetPropValue, value)
    {
        return targetPropValue < value;
    }

    gt(targetPropValue, value)
    {
        return targetPropValue > value;
    }

    le(targetPropValue, value)
    {
        return targetPropValue <= value;
    }

    ge(targetPropValue, value)
    {
        return targetPropValue >= value;
    }

}

module.exports = Condition;
