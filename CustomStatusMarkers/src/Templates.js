(() => {
  'use strict';

  /**
   * A persisted template for a custom status marker.
   * @typedef {object} StatusMarkerTemplate
   * @property {string} src
   *           The URL of the marker's image.
   * @property {PathMath.BoundingBox} bbox
   *           The marker image's original bounding box.
   */

  /**
   * Gets the BoundingBox of a Graphic.
   * @private
   * @param {Graphic} graphic
   * @return {PathMath.BoundingBox}
   */
  function _getGraphicBoundingBox(graphic) {
    let left = graphic.get('left');
    let top = graphic.get('top');
    let width = graphic.get('width');
    let height = graphic.get('height');
    return new PathMath.BoundingBox(left, top, width, height);
  }

  /**
   * Static methods for persisting custom status marker templates.
   */
  CustomStatusMarkers.Templates = class {

    /**
     * Deletes a custom status marker template.
     * @param  {string}   statusName
     */
    static delete(statusName) {
      let csmState = CustomStatusMarkers.State.getState();
      delete csmState.templates[statusName];
    }

    /**
     * Loads a StatusMarkerTemplate from the module state.
     * @param  {String}   statusName
     * @return {StatusMarkerTemplate}
     */
    static get(statusName) {
      let csmState = CustomStatusMarkers.State.getState();
      return csmState.templates[statusName];
    }

    /**
     * Persists a custom status marker.
     * @param {String} statusName
     * @param {Graphic} icon
     */
    static save(statusName, icon) {
      let csmState = CustomStatusMarkers.State.getState();
      let bbox = _getGraphicBoundingBox(icon);
      let src = CustomStatusMarkers.utils.getCleanImgsrc(icon.get('imgsrc'));

      csmState.templates[statusName] = { bbox, src };
    }
  };
})();
