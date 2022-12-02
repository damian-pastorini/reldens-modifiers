/**
 *
 * Reldens - PropertyManager
 *
 */

const { ErrorManager, Logger, sc } = require('@reldens/utils');

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
        let propertyName = propertyPathParts.shift();
        if(!sc.hasOwn(propertyOwner, propertyName)){
            let message = 'Property "'+propertyName+'" not found in path parts: [' + propertyPathParts.join(',') + ']';
            Logger.error(message, {'Property owner': propertyOwner});
            ErrorManager.error(message);
        }
        if(1 < propertyPathParts.length){
            return this.extractDeepProperty(propertyOwner[propertyName], propertyPathParts);
        }
        return propertyOwner[propertyName];
    }

}

module.exports = PropertyManager;
