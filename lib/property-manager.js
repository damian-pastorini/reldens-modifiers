/**
 *
 * Reldens - PropertyManager
 *
 */

const { ErrorManager, sc } = require('@reldens/utils');

class PropertyManager
{

    getPropertyValue(propertyOwner, propertyString)
    {
        return this.manageOwnerProperty(propertyOwner, propertyString);
    }

    setOwnerProperty(propertyOwner, propertyString, value)
    {
        return this.manageOwnerProperty(propertyOwner, propertyString, value);
    }

    manageOwnerProperty(propertyOwner, propertyString, value)
    {
        let propertyPathParts = propertyString.split('/');
        let property = this.extractDeepProperty(propertyOwner, propertyPathParts);
        let propertyKey = propertyPathParts.pop();
        let isValidValue = 'undefined' !== typeof value;
        if(isValidValue){
            property[propertyKey] = value;
        }
        return property[propertyKey];
    }

    extractDeepProperty(propertyOwner, propertyPathParts)
    {
        let pathPartsClone = [...propertyPathParts];
        let propertyName = pathPartsClone.shift();
        if(!sc.hasOwn(propertyOwner, propertyName)){
            ErrorManager.error(
                'Property "'+propertyName+'" from path parts: "'+propertyPathParts.join('/')+'"]'
                +' owner invalid value: '+propertyOwner[propertyName]+'.'
            );
        }
        if(1 < pathPartsClone.length){
            return this.extractDeepProperty(propertyOwner[propertyName], pathPartsClone);
        }
        return propertyOwner[propertyName];
    }

}

module.exports = PropertyManager;
