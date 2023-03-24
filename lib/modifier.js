/**
 *
 * Reldens - Modifier
 *
 */

const Calculator = require('./calculator');
const Condition = require('./condition');
const PropertyManager = require('./property-manager');
const ModifierConst = require('./constants');
const { Logger, sc } = require('@reldens/utils');

class Modifier
{

    constructor(props)
    {
        this.key = props.key;
        this.propertyKey = sc.get(props, 'propertyKey', props.property_key);
        this.basePropertyKey = sc.get(props, 'basePropertyKey', this.propertyKey);
        this.operation = props.operation;
        this.type = sc.get(props, 'type', ModifierConst.TYPES.INT);
        this.originalValue = props.value;
        this.value = this.parseValue(props.value);
        this.target = sc.get(props, 'target', false);
        this.minValue = sc.hasOwn(props, 'minValue') ? this.parseValue(props.minValue) : false;
        this.maxValue = sc.hasOwn(props, 'maxValue') ? this.parseValue(props.maxValue) : false;
        this.minProperty = sc.get(props, 'minProperty', false);
        this.maxProperty = sc.get(props, 'maxProperty', false);
        this.conditions = sc.get(props, 'conditions', []);
        this.conditionsOnRevert = sc.get(props, 'conditionsOnRevert', false);
        this.state = this.determineState(props);
        this.calculator = new Calculator();
        this.propertyManager = new PropertyManager();
    }

    determineState(props)
    {
        if(!sc.hasOwn(props, 'key')){
            return ModifierConst.MOD_MISSING_KEY;
        }
        if(!sc.hasOwn(props, 'propertyKey') && !sc.hasOwn(props, 'property_key')){
            return ModifierConst.MOD_MISSING_PROPERTY_KEY;
        }
        if(!sc.hasOwn(props, 'operation')){
            return ModifierConst.MOD_MISSING_OPERATION;
        }
        if(!sc.hasOwn(props, 'value')){
            return ModifierConst.MOD_MISSING_VALUE;
        }
        return ModifierConst.MOD_READY;
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

    apply(target, useBasePropertyToGetValue, applyOnBaseProperty)
    {
        this.execute(target, false, useBasePropertyToGetValue, applyOnBaseProperty);
    }

    revert(target, useBasePropertyToGetValue, applyOnBaseProperty)
    {
        this.execute(target, true, useBasePropertyToGetValue, applyOnBaseProperty);
    }

    /**
     *
     * Here you have two specific attributes for special features, useBasePropertyToGetValue and applyOnBaseProperty.
     * When useBasePropertyToGetValue is true then the modifier will use the basePropertyKey to calculate the modified
     * value.
     * Besides, no matter from which value your start the calculations then you can use the applyOnBaseProperty
     * property to specify if you want to apply the new calculated value to the propertyKey or to the basePropertyKey.
     *
     */
    execute(target, revert = false, useBasePropertyToGetValue = false, applyOnBaseProperty = false)
    {
        if(!this.target && !target){
            this.state = ModifierConst.MOD_UNDEFINED_TARGET;
            return false;
        }
        if(
            this.conditions.length
            && !this.validateConditions(target)
            && (!revert || (revert && this.conditionsOnRevert))
        ){
            return false;
        }
        // override target if provided:
        if(target){
            this.target = target;
        }
        // calculate new value, set on the owner and change state:
        let newValue = this.getModifiedValue(revert, useBasePropertyToGetValue);
        let applyToProp = applyOnBaseProperty ? this.basePropertyKey : this.propertyKey;
        this.setOwnerProperty(applyToProp, newValue);
        this.state = revert ? ModifierConst.MOD_REVERTED : ModifierConst.MOD_APPLIED;
    }

    validateConditions(target)
    {
        for(let condition of this.conditions){
            if(condition instanceof Condition){
                Logger.error(['Missing Condition instance.', (typeof condition), 'was specified.']);
                this.state = ModifierConst.MOD_MISSING_CONDITION_INSTANCE;
                return false;
            }
            if(!condition.isValidOn(target)){
                this.state = ModifierConst.MOD_INVALID_CONDITIONS;
                return false;
            }
        }
        return true;
    }

    getModifiedValue(revert = false, useBasePropertyToGetValue = false)
    {
        let usePropKey = useBasePropertyToGetValue ? this.basePropertyKey : this.propertyKey;
        // get current property value (this could be already modified):
        let currentValue = this.getPropertyValue(usePropKey);
        // extracted maths:
        let propertyValue = this.calculator.calculateNewValue(currentValue, this.operation, this.value, revert);
        // parse object specific operations:
        if(this.operation === ModifierConst.OPS.SET || this.operation === ModifierConst.OPS.SET_N){
            propertyValue = revert ? false : this.value;
        }
        if(this.operation === ModifierConst.OPS.METHOD){
            // this allows you to extend a modifier and set your own calculation/application method:
            if(!sc.hasOwn(this, this.value) || typeof this[this.value] !== 'function'){
                Logger.error(['Modifier error:', this, 'Undefined method:', this.value]);
                this.state = ModifierConst.MOD_MODIFIER_ERROR;
                return false;
            }
            propertyValue = this[this.value](this, propertyValue);
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
