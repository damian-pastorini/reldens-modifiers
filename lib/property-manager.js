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
        let childPropertyOwner = this.extractChildPropertyOwner(propertyOwner, propertyPathParts);
        let propertyKey = propertyPathParts[propertyPathParts.length-1];
        if('undefined' === typeof value && !sc.hasOwn(childPropertyOwner, propertyKey)){
            ErrorManager.error('Invalid property "'+propertyKey+'" from path: "'+propertyPathParts.join('/')+'"].');
        }
        if('undefined' !== typeof value){
            childPropertyOwner[propertyKey] = value;
        }
        return childPropertyOwner[propertyKey];
    }

    /*
     * Navigates through a property path and returns a parent object owning the final property.
     * - ['health'] returns propertyOwner (parent of 'health')
     * - ['stats', 'hp'] returns propertyOwner.stats (parent of 'hp')
     * - ['stats', 'power', 'mgk'] returns propertyOwner.stats.power (parent of 'mgk')
     */
    extractChildPropertyOwner(propertyOwner, propertyPathParts)
    {
        let pathToParent = [...propertyPathParts];
        pathToParent.pop();
        if(0 === pathToParent.length){
            return propertyOwner;
        }
        let currentOwner = propertyOwner;
        for(let propertyName of pathToParent){
            if(!sc.hasOwn(currentOwner, propertyName)){
                ErrorManager.error('Invalid property "'+propertyName+'" from path: "'+propertyPathParts.join('/')+'"].');
            }
            currentOwner = currentOwner[propertyName];
        }
        return currentOwner;
    }

}

module.exports = PropertyManager;
