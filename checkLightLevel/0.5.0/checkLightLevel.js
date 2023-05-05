/* globals on findObjs getObj playerIsGM log sendChat PathMath Plugger */
var API_Meta = API_Meta || {};
API_Meta.checkLightLevel = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.checkLightLevel.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); } }

const checkLightLevel = (() => { //eslint-disable-line no-unused-vars

  const scriptName = 'checkLightLevel',
    scriptVersion = '0.5.0',
    debugLogging = false,
    consolePassthrough = true;  // set to false if you want debug logs sent to the Roll20 API console (yuck)

  const debug = (() => {
    const send = (logLevel, ...msgs) => {
      if (!debugLogging) return;
      if (consolePassthrough) {
        console[logLevel](...msgs);
      }
      else {
        msgs.forEach(msg => log(msg));
      }
    }
    return {
      log: (...msgs) => send('log', ...msgs),
      info: (...msgs) => send('info', ...msgs),
      warn: (...msgs) => send('warn', ...msgs),
      error: (...msgs) => send('error', ...msgs)
    }
  })();

  /**
   * @param {object[]} selected array of simple token objects
   * @returns {object[] | null} array of actual token objects
   */
  const getSelectedTokens = (selected) => {
    const selectedIds = selected && selected.length ? selected.map(sel => sel._id) : null
    return selectedIds ? selectedIds.map(id => getObj('graphic', id)) : null;
  }

  /**
   * @param {object} token token object
   * @returns {object|null} page object
   */
  const getPageOfToken = (token) => token && token.id ? getObj('page', token.get('_pageid')) : null;

  /**
   * @param {object} point1 { x: number, y: number }
   * @param {object} point2 { x: number, y: number }
   * @returns 
   */
  const getSeparation = (point1, point2) => {
    const delta = { x: point1.x - point2.x, y: point1.y - point2.y },
    distance = Math.sqrt(delta.x**2 + delta.y**2);
    return distance;
  }

  /**
   * @param {object} token1 token object
   * @param {object} token2 token object
   * @returns {number} separation in pixels
   */
  const getTokenSeparation = (token1, token2) => {
    if (!token1 || !token2) return;
    const pos1 = { x: parseInt(token1.get('left')), y: parseInt(token1.get('top')) },
      pos2 = { x: parseInt(token2.get('left')), y: parseInt(token2.get('top')) };
    if (![pos1.x, pos1.y, pos2.x, pos2.y].reduce((valid, val) => (valid === true && Number.isSafeInteger(val)) ? true : false, true)) return null;
    return getSeparation(pos1, pos2);
  }

  /**
   * @param {number} feetValue distance in feet
   * @param {object} page map page object
   * @returns {number|null} pixel distance
   */
  const feetToPixels = (feetValue, page) => {
    if (!page) return null;
    const gridPixelMultiplier = page.get('snapping_increment'),
      gridUnitScale = page.get('scale_number');
    const pixelValue = feetValue/gridUnitScale*(gridPixelMultiplier*70);
    debug.info(`Pixel distance: ${pixelValue}`);
    return pixelValue;
  }

  /**
   * @param {object} page map page object
   * @returns {boolean}
   */
  const checkGlobalIllumination = (page) => {
    if (!page || !page.id) return false;
    return page.get('daylight_mode_enabled') ? parseFloat(page.get('daylightModeOpacity')) : false;
  }

  /**
   * Check if a one way wall is allowing light through in the correct direction
   * @param {object} segment path segment
   * @param {number} lightFlowAngle 
   * @param {boolean} oneWayReversed 
   * @returns {boolean}
   */
  const isOneWayAndTransparent = (segment, lightFlowAngle, oneWayReversed) => {
    if (!segment || segment.length < 2) return;
    const delta = { x: segment[1][0] - segment[0][0], y: segment[0][1] - segment[1][1] }
    const segmentAngle = getAngleFromX(delta.x, delta.y);
    debug.info(`Segment angle is ${segmentAngle}`);
    const transparencyAngle = oneWayReversed
      ? segmentAngle - 90
      : segmentAngle + 90;
    const angleDifference = Math.abs(transparencyAngle - lightFlowAngle);
    debug.warn(`Transparency diff ${angleDifference}`);
    return angleDifference < 90 ? true : false;
  }

  /**
   * @param {number} rads radians
   * @returns {number} degrees
   */
  const toDegrees = (rads) => rads*180/Math.PI;

  /**
   * Get the angle from the x axis to the line drawn to (x,y) from origin
   * @param {number} x 
   * @param {number} y 
   * @returns {number} radians
   */
  const getAngleFromX = (x, y) => toDegrees(Math.atan2(y, x));

  /**
   * Check for LOS blocking walls between token and light source
   * @param {object} token1 token object
   * @param {object} token2 token object
   * @param {number} range pixel range
   * @param {object} page map page object
   * @returns {null|object} returns null if no LOS block, or first path object which blocks the light source
   */
  const checkLineOfSight = (token1, token2, range, page) => {
    const pos1 = { x: parseInt(token1.get('left')), y: parseInt(token1.get('top')) },
      pos2 = { x: parseInt(token2.get('left')), y: parseInt(token2.get('top')) },
      blockingPaths = findObjs({ type: 'path', pageid: page.id, layer: 'walls' }).filter(path => path.get('barrierType') !== 'transparent');
    const losPath = new PathMath.Path([[pos1.x, pos1.y, 0], [pos2.x, pos2.y, 0]]);
    let losBlocked = null;
    for (let i=0; i<blockingPaths.length; i++) {
      let pathData;
      const isOneWayWall = blockingPaths[i].get('barrierType') === 'oneWay',
        oneWayReversed = isOneWayWall ? blockingPaths[i].get('oneWayReversed') : null,
        lightFlowAngle = isOneWayWall ? getAngleFromX(pos1.x - pos2.x, pos2.y - pos1.y) : null;
      try { pathData = JSON.parse(blockingPaths[i].get('path')); } catch(e) { debug.error(e) }
      if (!pathData) continue;
      const pathTop = blockingPaths[i].get('top') - (blockingPaths[i].get('height')/2),
        pathLeft = blockingPaths[i].get('left') - (blockingPaths[i].get('width')/2);
      const pathVertices = pathData.map(vertex => [ vertex[1] + pathLeft, vertex[2] + pathTop, 0 ]);
      const wallPath = new PathMath.Path(pathVertices);
      const wallSegments = wallPath.toSegments(),
        losSegments = losPath.toSegments();
      for (let w=0; w<wallSegments.length; w++) {
        if (losBlocked) break;
        const skipOneWaySegment = isOneWayWall ? isOneWayAndTransparent(wallSegments[w], lightFlowAngle, oneWayReversed) : false;
        if (skipOneWaySegment) {
          debug.info('Skipping segment due to one-way transparency');
          continue;
        }
        for (let l=0; l<losSegments.length; l++) {
          const intersect = PathMath.segmentIntersection(wallSegments[w], losSegments[l]);//wallPath.intersects(losPath);
          if (intersect) {
            debug.info(`Found intersect, skipping light source`, blockingPaths[i]);
            losBlocked = blockingPaths[i];
            break;
          }
        }
      }
      if (losBlocked) break;
    }
    return losBlocked;
  }

  /**
   * Use cubic fade out to approximate the light level in dim light at different ranges
   * @param {number} tokenSeparation - pixel distance, center to center
   * @param {number} dimLightRadius - pixel radius of dim light from the emitter
   * @param {number} brightLightRadius - pixel radius of bright light from the emitter
   * @returns {number} - light level multiplier, 0 - 1
   */
  const getDimLightFalloff = (tokenSeparation, dimLightRadius, brightLightRadius, gridPixelSize) => {
    const dimLightOnlyRadius = (dimLightRadius - brightLightRadius) + gridPixelSize/2,
      tokenDimLightDistance = tokenSeparation - brightLightRadius;
    const lightLevelWithFalloff = (1-(tokenDimLightDistance/dimLightOnlyRadius)**3) * 0.5;
    return lightLevelWithFalloff;
  }

  /**
   * @param {object} token token object
   * @returns {number} average radius in pixels
   */
  const getTokenAverageRadius = (token) => {
    return (parseInt(token.get('height'))||0 + parseInt(token.get('width'))||0)*0.66;
  }

  /**
   * @param {object} token token object
   * @returns {LitBy}
   */
  const checkLightLevelOfToken = (token) => {
    if (typeof(PathMath) !== 'object') return { err: `Aborted - This script requires PathMath.` };
    const tokenPage = getPageOfToken(token),
      litBy = { bright: false, dim: [], daylight: false, total: 0, partial: true };
    const gridPixelSize = tokenPage.get('snapping_increment') * 70;
    const tokenAverageRadius = getTokenAverageRadius(token);
    if (!tokenPage || !tokenPage.id) return { err: `Couldn't find token or token page.` };
    litBy.daylight = checkGlobalIllumination(tokenPage);
    if (litBy.daylight) litBy.total += litBy.daylight;
    const allTokens = findObjs({ type: 'graphic', _pageid: tokenPage.id }),
      allLightTokens = allTokens.filter(token => (token.get('emits_bright_light') || token.get('emits_low_light')) && token.get('layer') !== 'gmlayer');
    for (let i=0; i<allLightTokens.length; i++) {
      if (litBy.bright || litBy.total >= 1) break;
      const tokenSeparation = getTokenSeparation(token, allLightTokens[i]),
        losBlocked = checkLineOfSight(token, allLightTokens[i], tokenSeparation, tokenPage);
      if (losBlocked) {
        continue;
      }
      const brightRangeFeet = allLightTokens[i].get('emits_bright_light')
        ? allLightTokens[i].get('bright_light_distance')
        : 0;
      const dimRangeFeet = allLightTokens[i].get('emits_low_light')
          ? allLightTokens[i].get('low_light_distance')
          : 0;
      const brightRange = feetToPixels(brightRangeFeet, tokenPage),
        dimRange = feetToPixels(dimRangeFeet, tokenPage),
        brightRangePartial = brightRange + tokenAverageRadius,
        dimRangePartial = dimRange + tokenAverageRadius;
      if (brightRange == null && dimRange == null) continue;
      if (brightRange && tokenSeparation <= brightRangePartial) {
        litBy.bright = true;
        litBy.total = 1;
        if (tokenSeparation <= brightRange) litBy.partial = false;
        break;
      }
      else if (dimRange && tokenSeparation <= dimRangePartial) {
        litBy.dim.push(allLightTokens[i]);
        litBy.total += getDimLightFalloff(tokenSeparation, dimRangePartial, brightRangePartial, gridPixelSize);
        if (tokenSeparation <= dimRange) litBy.partial = false;
      }
    }
    litBy.total = Math.min(litBy.total, 1);
    return { litBy };
  }
    
  const handleInput = (msg) => {
    if (msg.type === 'api' && /!checklight/i.test(msg.content) && playerIsGM(msg.playerid)) {
      const tokens = getSelectedTokens(msg.selected || []);
      if (!tokens || !tokens.length) return postChat(`Nothing selected.`);
      if (!tokenPageHasDynamicLighting) return postChat(`Token's page does not have dynamic lighting.`);
      tokens.forEach(token => {
        const { litBy, err } = checkLightLevelOfToken(token),
          tokenName = token.get('name') || 'Nameless Token';
        if (err) {
          postChat(err);
          return;
        }
        let messages = [];
        const partialString = litBy.daylight || !litBy.partial
          ? ''
          : 'partially ';
        if (litBy.daylight) messages.push(`${tokenName} is in ${(litBy.daylight*100).toFixed(0)}% global light.`);
        if (litBy.bright) messages.push(`${tokenName} is ${partialString}in direct bright light.`);
        else if (litBy.dim.length) messages.push(`${tokenName} is ${partialString}in ${litBy.total >= 1 ? `at least ` : ''}${litBy.dim.length} sources of dim light.`);
        else if (!litBy.daylight) messages.push(`${tokenName} is in darkness.`);
        if (!litBy.bright && litBy.total > 0) messages.push(`${tokenName} is ${partialString}in ${parseInt(litBy.total*100)}% total light level.`)
        if (messages.length) {
          let opacity = litBy.bright ? 1
            : litBy.total > 0.2 ? litBy.total
            : 0.2;
          if (typeof(litBy.daylight) === 'number') opacity = Math.max(litBy.daylight.toFixed(2), opacity);
          const chatMessage = createChatTemplate(token, messages, opacity);
          postChat(chatMessage);
        }
      });
    }
  }

  /**
   * @param {object[]} tokens array of token objects
   * @returns {boolean}
   */
  const tokenPageHasDynamicLighting = (tokens) => {
    const page = getPageOfToken(tokens[0]);
    return page.get('dynamic_lighting_enabled');
  }

  const createChatTemplate = (token, messages, opacity) => {
    return `
      <div class="light-outer" style="background: black; border-radius: 1rem; border: 2px solid #4c4c4c; white-space: nowrap; padding: 0.5rem 0.2rem">
        <div class="light-avatar" style="	display: inline-block!important; width: 20%; padding: 0.5rem;">
          <img src="${token.get('imgsrc')}" style="opacity: ${opacity};"/>
        </div>
        <div class="light-text" style="display: inline-block; color: whitesmoke; vertical-align: middle; width: 75%; white-space: normal;">
          ${messages.reduce((out, msg) => out += `<p>${msg}</p>`, '')}
        </div>
      </div>
      `.replace(/\n/g, '');
  }

  const postChat = (chatText, whisper = 'gm') => {
    const whisperText = whisper ? `/w "${whisper}" ` : '';
    sendChat(scriptName, `${whisperText}${chatText}`, null, { noarchive: true });
  }

  /**
   * @typedef {object} LitBy
   * @property {?boolean} bright - token is lit by bright light, null on error
   * @property {?array} dim - dim light emitters found to be illuminating selected token, null on error
   * @property {?float} daylight - token is in <float between 0 and 1> daylight, false on no daylight, null on error
   * @property {?float} total - total light multiplier from adding all sources, max 1, null on error
   * @property {boolean} partial - token's grid square is not fully lit by any light source
   * @property {?string} err - error message, only on error
   * 
   * @param {string | object} tokenOrTokenId - Roll20 Token object, or token UID string
   * @returns {LitBy}
   */
  const isLitBy = (tokenOrTokenId) => {
    const output = { bright: null, dim: null, daylight: null, total: null }
    const token = tokenOrTokenId && typeof(tokenOrTokenId) === 'object' && tokenOrTokenId.id ? tokenOrTokenId
      : typeof(tokenOrTokenId) === 'string' ? getObj('graphic', tokenOrTokenId)
      : null;
    const { litBy, err } = token && token.id
      ? checkLightLevelOfToken(token)
      : { err: `Could not find token from supplied ID.` };
    Object.assign(output,
      litBy || err
    );
    return output;
  }

  // Meta toolbox plugin
  const checklight = (msg) => {
    const errors = [];
    const tokens = getSelectedTokens(msg.selected),
      token = tokens ? tokens[0] : null;
    if (!token || !token.id) errors.push(`Checklight plugin: No selected token`);
    else {
      const { litBy, err } = checkLightLevelOfToken(token);
      if (litBy) {
        return typeof(litBy.total) === 'number'
          ? parseFloat(litBy.total).toFixed(4)
          : 0;
      }
      else errors.push(err);
    }
    if (errors.length) errors.forEach(e => log(e));
    return '';
  }
  const registerWithMetaToolbox = () => {
    try {
      Plugger.RegisterRule(checklight);
      debug.info(`Registered with Plugger`);
    }
    catch (e) { log(`ERROR Registering ${scriptName} with PlugEval: ${e.message}`); }
  }

  on('ready', () => {
    if (typeof(Plugger) === 'object') registerWithMetaToolbox();
    on('chat:message', handleInput);
    log(`${scriptName} v${scriptVersion}`);
  });

  return { isLitBy }

})();
{ try { throw new Error(''); } catch (e) { API_Meta.checkLightLevel.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.checkLightLevel.offset); } }
/* */