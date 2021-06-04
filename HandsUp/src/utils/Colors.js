(() => {
  'use strict';

  /**
   * A module for color computations.
   */
  HandsUp.utils.Colors = class {
    /**
     * Convert a color from the HSL in the range [0, 1] to
     * RGB in the range [0, 255].
     * @param {float} hue hue
     * @param {float} sat saturation
     * @param {float} lum luminescence
     * @return {vec3}
     */
    static hsl2rgb(hue, sat, lum) {
      let hue360 = hue * 360;
      // Algorithm stolen from
      // https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative.
      function f(n) {
        let k = (n + hue360/30) % 12;
        let a = sat * Math.min(lum, 1 - lum);
        let rgbNorm = lum - a * Math.max(Math.min(k - 3, 9-k, 1), -1);
        return Math.floor(255 * rgbNorm);
      }

      return [f(0), f(8), f(4)];
    }
  };
})();
