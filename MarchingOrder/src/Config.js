(() => {
  'use strict';

  /**
   * Module for global script configurations.
   */
  MarchingOrder.Config = class {

    /**
     * Get the configured default marching order.
     */
    static getDefaultMarchingOrder() {
      return MarchingOrder.State.getState().defaultOrder;
    }

    /**
     * Set the configured default marching order.
     * @param {Graphic} leader
     */
    static setDefaultMarchingOrder(leader) {
      let items = [];
      let next = leader;
      while(next) {
        let represents = next.get('represents');
        if(!represents)
          throw new Error('All tokens in the default marching order must represent a character.');

        items.push({
          represents,
          imgsrc: next.get('imgsrc'),
          name: next.get('name')
        });
        next = next.follower;
      }
      MarchingOrder.State.getState().defaultOrder = items;
    }
  };
})();
