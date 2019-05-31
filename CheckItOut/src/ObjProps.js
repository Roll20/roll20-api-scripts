(() => {
  'use strict';

  /**
   * A module for managing the persisted properties of
   * objects for this script.
   */
  CheckItOut.ObjProps = class {
    /**
     * Copies the persisted properties from one object to another. This
     * overwrites any existing properties on the receiving object.
     * @param {Graphic} fromObj
     * @param {Graphic} toObj
     */
    static copy(fromObj, toObj) {
      let fromProps = CheckItOut.ObjProps.create(fromObj);
      let toProps = CheckItOut.ObjProps.create(toObj);

      let clone = CheckItOut.utils.deepCopy(fromProps);
      _.extend(toProps, clone);
    }


    /**
     * Creates new persisted properties for an object. If the object already
     * has persisted properties, the existing properties are returned.
     * @param {Graphic} obj
     * @return {ObjProps}
     */
    static create(obj) {
      let objID = obj.get('_id');

      // If properties for the object exist, return those. Otherwise
      // create blank persisted properties for it.
      let existingProps = CheckItOut.State.getState().graphics[objID];
      if (existingProps)
        return existingProps;
      else {
        let newProps = {
          id: objID
        };
        let defaults = CheckItOut.ObjProps.getDefaults();
        _.defaults(newProps, defaults
        );
        CheckItOut.State.getState().graphics[objID] = newProps;
        return newProps;
      }
    }

    /**
     * Deletes the persisted properties for an object.
     * @param {Graphic} obj
     */
    static delete(obj) {
      let objID = obj.get('_id');
      let state = CheckItOut.State.getState();

      let props = state.graphics[objID];
      if (props)
        delete state.graphics[objID];
    }

    /**
     * Gets the persisted properties for an object. Returns undefined if
     * they don't exist.
     * @param {Graphic} obj
     * @return {ObjProps}
     */
    static get(obj) {
      let objID = obj.get('_id');
      return CheckItOut.State.getState().graphics[objID];
    }

    /**
     * Produces an empty object properties structure.
     * @return {ObjProps}
     */
    static getDefaults() {
      return {
        core: {},
        theme: {}
      };
    }

    /**
     * Gets an immutable copy an object's persisted properties. If the object
     * has no persisted properties, a default properties structure is provided.
     * @param {Graphic} obj
     * @return {ObjProps}
     */
    static getReadOnly(obj) {
      let existingProps = CheckItOut.ObjProps.get(obj);

      // If the properties exist, return a deep copy of them.
      if (existingProps)
        return CheckItOut.utils.deepCopy(existingProps);
      else
        return CheckItOut.ObjProps.getDefaults();
    }
  };
})();
