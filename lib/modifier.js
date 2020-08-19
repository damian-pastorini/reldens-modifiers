/**
 *
 * Reldens - Modifier
 *
 */

const { ErrorManager } = require('@reldens/utils');
const Calculator = require('./calculator');
const PropertyManager = require('./property-manager');
const ModifierConst = require('./constants');

class Modifier
{

    constructor(props)
    {
        if(
            !{}.hasOwnProperty.call(props, 'key')
            || (!{}.hasOwnProperty.call(props, 'propertyKey') && !{}.hasOwnProperty.call(props, 'property_key'))
            || !{}.hasOwnProperty.call(props, 'operation')
            || !{}.hasOwnProperty.call(props, 'value')
        ){
            ErrorManager.error([
                'Undefined required properties {key, propertyKey (property_key), operation, value} in:',
                props
            ]);
        }
        this.key = props.key;
        this.propertyKey = props.propertyKey ? props.propertyKey : props.property_key;
        this.operation = props.operation;
        this.value = props.value;
        this.originalValue = props.value;
        this.target = {}.hasOwnProperty.call(props, 'target') ? props.target : false;
        this.minValue = {}.hasOwnProperty.call(props, 'minValue') ? props.minValue : false;
        this.maxValue = {}.hasOwnProperty.call(props, 'maxValue') ? props.maxValue : false;
        this.minProperty = {}.hasOwnProperty.call(props, 'minProperty') ? props.minProperty : false;
        this.maxProperty = {}.hasOwnProperty.call(props, 'maxProperty') ? props.maxProperty : false;
        this.state = false;
        this.calculator = new Calculator();
        this.propertyManager = new PropertyManager();
    }

    apply(target)
    {
        this.execute(target, false);
    }

    revert(target)
    {
        this.execute(target, true);
    }

    execute(target, revert)
    {
        // return error if target is not present at all:
        if(!this.target && !target){
            ErrorManager.error('Undefined target.');
        }
        // override target if provided:
        if(target){
            this.target = target;
        }
        // calculate new value, set on the owner and change state:
        let newValue = this.getModifiedValue(revert);
        this.setOwnerProperty(this.propertyKey, newValue);
        if(revert){
            this.state = ModifierConst.MOD_REVERTED;
        } else {
            this.state = ModifierConst.MOD_APPLIED;
        }
    }

    getModifiedValue(revert = false)
    {
        // get current property value (this could be already modified):
        let currentValue = this.getPropertyValue(this.propertyKey);
        // extracted maths:
        let propertyValue = this.calculator.calculateNewValue(currentValue, this.operation, this.value, revert);
        // parse object specific operations:
        if(this.operation === ModifierConst.OPS.SET || this.operation === ModifierConst.OPS.SET_N){
            if(revert){
                propertyValue = false;
            } else {
                propertyValue = this.value;
            }
        }
        if(this.operation === ModifierConst.OPS.METHOD){
            // this allows you to extend a modifier and set your own calculation/application method:
            if(!{}.hasOwnProperty.call(this, this.value) || typeof this[this.value] !== 'function'){
                Logger.error(['Modifier error:', this, 'Undefined method:', this.value]);
            } else {
                propertyValue = this[this.value](this, propertyValue);
            }
        }
        // apply modifier min and max values if required:
        return this.applyModifierLimits(propertyValue);
    }

    applyModifierLimits(ownerProperty)
    {
        // @NOTE: if the limits are false none will be applied.
        if(this.minValue && ownerProperty < this.minValue){
            ownerProperty = this.minValue;
        }
        if(this.maxValue && ownerProperty > this.maxValue){
            ownerProperty = this.maxValue;
        }
        if(this.minProperty){
            let minPropValue = this.getPropertyValue(this.minProperty);
            if(minPropValue && ownerProperty < minPropValue){
                ownerProperty = minPropValue;
            }
        }
        if(this.maxProperty){
            let maxPropValue = this.getPropertyValue(this.maxProperty);
            if(maxPropValue && ownerProperty > maxPropValue){
                ownerProperty = maxPropValue;
            }
        }
        return ownerProperty;
    }

    getPropertyValue(propName)
    {
        return this.propertyManager.getPropertyValue(this.target, propName);
    }

    setOwnerProperty(propName, value)
    {
        return this.propertyManager.setOwnerProperty(this.target, propName, value);
    }

}

module.exports = Modifier;
