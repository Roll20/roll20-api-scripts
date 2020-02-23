/**
 * utils package
 */
(() => {
  'use strict';

  /**
   * Cookbook.getCleanImgsrc
   * https://wiki.roll20.net/API:Cookbook#getCleanImgsrc
   */
  function getCleanImgsrc(imgsrc) {
    let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)(.*)$/);
    if(parts)
      return parts[1]+'thumb'+parts[3];
    throw new Error('Only images that you have uploaded to your library ' +
      'can be used as custom status markers. ' +
      'See https://wiki.roll20.net/API:Objects#imgsrc_and_avatar_property_restrictions for more information.');
  }

  MarchingOrder.utils = {
    getCleanImgsrc
  };
})();
