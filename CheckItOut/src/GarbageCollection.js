(() => {
  'use strict';

  /**
   * Delete the persisted properties for an object if it is destroyed.
   */
  on('destroy:graphic', obj => {
    CheckItOut.ObjProps.delete(obj);

    //log(CheckItOut.State.getState());
  });
})();
