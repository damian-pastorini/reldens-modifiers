const { ErrorManager } = require('@reldens/utils');
const PropertyManager = require('./property-manager');

class Condition
{

    constructor(props)
    {
        if(!{}.hasOwnProperty.call(props, 'key')){
            ErrorManager.error('Missing Condition key.');
        }
        if(!{}.hasOwnProperty.call(props, 'propertyKey')){
            ErrorManager.error('Missing Condition propertyKey.');
        }
        if(!{}.hasOwnProperty.call(props, 'conditional')){
            ErrorManager.error('Missing Condition conditional.');
        }
        if(!{}.hasOwnProperty.call(props, 'value')){
            ErrorManager.error('Missing Condition value.');
        }
        this.key = props.key;
        this.propertyKey = props.propertyKey;
        this.conditional = props.conditional;
        this.value = props.value;
        this.propertyManager = new PropertyManager();
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
