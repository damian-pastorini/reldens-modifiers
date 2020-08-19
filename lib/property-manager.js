const { ErrorManager } = require('@reldens/utils');

class PropertyManager
{

    getPropertyValue(propertyOwner, propName)
    {
        return this.manageOwnerProperty(propertyOwner, propName);
    }

    setOwnerProperty(propertyOwner, propName, value)
    {
        return this.manageOwnerProperty(propertyOwner, propName, value);
    }

    manageOwnerProperty(propertyOwner, propName, value)
    {
        if(propName.indexOf('/') !== -1){
            let propArray = propName.split('/');
            propName = propArray.pop();
            for(let prop of propArray){
                if(!{}.hasOwnProperty.call(propertyOwner, prop)){
                    ErrorManager.error([
                        'Property not found in path:', propName, prop,
                        'Property owner:', propertyOwner
                    ]);
                }
                propertyOwner = propertyOwner[prop];
            }
        }
        if(typeof value !== 'undefined'){
            propertyOwner[propName] = value;
            return propertyOwner;
        }
        return propertyOwner[propName];
    }

}

module.exports = PropertyManager;