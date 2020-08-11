/**
 *
 * Reldens - Modifier
 *
 */

const { ErrorManager } = require('@reldens/utils');
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
        console.log('here???');
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
        let propertyValue = this.getPropertyValue();
        // @NOTE: the following operations (except SET and APPLY_METHOD) needs an opposite method for the revert.
        if(
            (this.operation === ModifierConst.OPS.INC && !revert)
            || (this.operation === ModifierConst.OPS.DEC && revert)
        ){
            propertyValue = propertyValue + this.value;
        }
        if(
            (this.operation === ModifierConst.OPS.DEC && !revert)
            || (this.operation === ModifierConst.OPS.INC && revert)
        ){
            propertyValue = propertyValue - this.value;
        }
        if(
            (this.operation === ModifierConst.OPS.MUL && !revert)
            || (this.operation === ModifierConst.OPS.DIV && revert)
        ){
            propertyValue = propertyValue * this.value;
        }
        if(
            (this.operation === ModifierConst.OPS.DIV && !revert)
            || (this.operation === ModifierConst.OPS.MUL && revert)
        ){
            propertyValue = propertyValue / this.value;
        }
        if(
            (this.operation === ModifierConst.OPS.INC_P && !revert)
            || (this.operation === ModifierConst.OPS.DEC_P && revert)
        ){
            if(revert){
                let revertValue = (Math.round(propertyValue / (100 - this.value))) * 100 - propertyValue;
                propertyValue = propertyValue + revertValue;
            } else {
                propertyValue = propertyValue + Math.round(propertyValue * this.value / 100);
            }
        }
        if(
            (this.operation === ModifierConst.OPS.DEC_P && !revert)
            || (this.operation === ModifierConst.OPS.INC_P && revert)
        ){
            if(revert){
                let revertValue = propertyValue - Math.round((propertyValue / (100 - this.value))) * 100;
                propertyValue = propertyValue - revertValue;
            } else {
                propertyValue = propertyValue - Math.round(propertyValue * this.value / 100);
            }
        }
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

    getPropertyValue()
    {
        return this.manageOwnerProperty();
    }

    setOwnerProperty(value)
    {
        return this.manageOwnerProperty(value);
    }

    manageOwnerProperty(value)
    {
        let propName = this.propertyKey;
        // @NOTE: here we reference the target as initial point to get the property but then we loop the path and
        // override the variable to reference the next property on the path and get/set the value.
        let propertyOwner = this.target;
        if(this.propertyKey.indexOf('/') !== -1){
            let propArray = this.propertyKey.split('/');
            propName = propArray.pop();
            for(let prop of propArray){
                if(!{}.hasOwnProperty.call(propertyOwner, prop)){
                    ErrorManager.error([
                        'Property not found in path:', this.propertyKey, prop,
                        'Property owner:', propertyOwner
                    ]);
                }
                propertyOwner = propertyOwner[prop];
            }
        }
        if(typeof value !== 'undefined'){
            propertyOwner[propName] = value;
        }
        return propertyOwner[propName];
    }

}

module.exports = Modifier;
