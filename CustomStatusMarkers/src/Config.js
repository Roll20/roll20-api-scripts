(() => {
  'use strict';

  /**
   * Module for global script configurations.
   */
  CustomStatusMarkers.Config = class {
    /**
     * Gets the configured alignment for status marker icons.
     * @return {string}
     */
    static getAlignment() {
      let options = CustomStatusMarkers.State.getOptions();
      return options.alignment || 'above';
    }

    /**
     * Gets the configured diameter for status marker icons.
     * @return {int}
     */
    static getIconSize() {
      let options = CustomStatusMarkers.State.getOptions();
      return options.iconSize || CustomStatusMarkers.MARKER_RADIUS*2;
    }

    /**
     * Changes the alignment of status markers relative to their tokens.
     * @param {string} alignment
     */
    static setAlignment(alignment) {
      let options = CustomStatusMarkers.State.getOptions();
      options.alignment = alignment;

      CustomStatusMarkers.refreshSizeAndPositioning();
    }

    /**
     * Changes the size of the status markers.
     * @param {int} size
     */
    static setIconSize(size) {
      let options = CustomStatusMarkers.State.getOptions();
      options.iconSize = size;

      CustomStatusMarkers.refreshSizeAndPositioning();
    }
  };
})();
