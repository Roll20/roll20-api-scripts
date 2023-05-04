# checkLightLevel

A script to check the current illumination level of a selected Token.
Basic usage: `!checklight` with a token selected
 
[Documentation](https://app.roll20.net/forum/post/11312893)

## From other scripts

`checkLightLevel.litBy(tokenOrId)`
Returns a LitBy object:

```
/*
 * @typedef {object} LitBy
 * @property {?boolean} bright - token is lit by bright light, null on error
 * @property {?array} dim - dim light emitters found to be illuminating selected token, null on error
 * @property {?float} daylight - token is in <float between 0 and 1> daylight, false on no daylight, null on error
 * @property {?float} total - total light multiplier from adding all sources, max 1, null on error
 * @property {?boolean} partial - if true, no source of light is completely illuminating the token's area 
 * @property {?string} err - error message, only on error
 * 
 * @param {string | object} tokenOrTokenId - Roll20 Token object, or token UID string
 * @returns {LitBy}
 */
```