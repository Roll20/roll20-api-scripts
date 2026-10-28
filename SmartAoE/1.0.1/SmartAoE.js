// ========================
// === SmartAoE v1.0.1 ===
// ========================

// AUTHORS:
//  - David M. (djmoorehead): https://app.roll20.net/users/3987469 (original author, 0.x)
//  - MidNiteShadow7: https://app.roll20.net/users/16506286/midniteshadow7 (1.0.x fixes and refactor)

// Draws areas of effect on gridded maps, decides which squares and tokens they cover, and can roll
// saves, apply damage and markers, and post a results card. Requires libInline.

/* global on log state sendChat sendPing getObj findObjs createObj Campaign playerIsGM spawnFx spawnFxBetweenPoints toBack toFront getAttrByName getSheetItem setSheetItem setDefaultTokenForCharacter randomInteger _ libInline */

const SmartAoE = (() => {
  'use strict';

  // ————— CONSTANTS & STATE —————
  const scriptName = 'SmartAoE';
  const version = '1.0.1';
  const schemaVersion = '0.1';

  let cardParameters = {};
  const tokenMarkerURLs = {};

  const defaultParameters = {
    leftmargin: '-42px',
    tableborder: '2px solid #000000;',
    tablebgcolor: '#EEEEEE',
    tableborderradius: '6px;',
    tableshadow: '5px 3px 3px 0px #aaa;',
    title: 'SmartAoE',
    titlecardbackground: 'linear-gradient(red, yellow)',
    titlecardbottomborder: '2px solid #444444;',
    titlefontface: 'Contrail One',
    titlefontsize: '1.2em',
    titlefontlineheight: '1.2em',
    descriptiontext: '',
    lineheight: 'normal',
    titlefontcolor: '#EEEEEE',
    subtitlefontsize: '13px',
    subtitlefontface: 'Tahoma',
    subtitlefontcolor: '#333333',
    subtitleseperator: ' &' + '#x2666; ',
    bodyfontsize: '14px;',
    bodyfontface: 'Helvetica',
    oddrowbackground: '#FFFFFF',
    evenrowbackground: '#DDDDDD',
    oddrowfontcolor: '#000000',
    evenrowfontcolor: '#000000',
    leftsub: '',
    rightsub: '',
    debug: 0,
    hidecard: '0',
    hidetitlecard: '0',
    showresultheader: '0',
    imagewidth: 32,
    imageheight: 32,
    resizeinline: '1',
    dontcheckbuttonsforapi: '0',
    roundup: '0',
    buttonbackground: '#1C6EA4',
    buttontextcolor: '#FFFFFF',
    buttonbordercolor: '#999999',
    dicefontcolor: '#1C6EA4',
    dicefontsize: '3.0em',
    usehollowdice: '0',
    allowplaintextinrolls: '0',
    whisper: '',
    showfromfornonwhispers: '0',
    allowinlinerollsinoutput: '0',
    nominmaxhighlight: '0',
    disablestringexpansion: '0',
    disablerollvariableexpansion: '0',
    disableparameterexpansion: '0',
    disablerollprocessing: '0',
    disableattributereplacement: '0',
    disableinlineformatting: '0',
    styleTableTag: ' border-collapse:separate; border: solid black 2px; border-radius: 6px; -moz-border-radius: 6px; ',
    styleNormal:
      ' text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: 1em; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: #FFFEA2; border-color: #87850A; color: #000000;',
    styleFumble:
      ' text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: 1em; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: #FFAAAA; border-color: #660000; color: #660000;',
    styleCrit:
      ' text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: 1em; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: #88CC88; border-color: #004400; color: #004400;',
    styleBoth:
      ' text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: 1em; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: #8FA4D4; border-color: #061539; color: #061539;',
  };

  let tableLineCounter = 0;
  let targetNum = 0;

  // Shared working variables. Before 1.0.0 these were never declared, so they leaked into the
  // shared Mod sandbox as globals (where another script could overwrite them). They are declared
  // here, once, so they are still shared between SmartAoE's functions exactly as before, but
  // private to SmartAoE, and the script can run in strict mode.
  let c,
    controlledby,
    gmOutput,
    newIndex,
    newX,
    newY,
    originHeight,
    originIndex,
    originWidth,
    originX,
    originY,
    pageGridIncrement,
    pageScaleNumber,
    path,
    pathstring,
    publicOutput,
    returnString,
    s,
    success,
    whisperString;

  // ————— OBSERVERS (PUBLIC HOOKS) —————
  //---------------------------------------------------------------------------------------
  // Handles registering token change events for other api scripts
  //---------------------------------------------------------------------------------------
  const observers = {
    tokenChange: [],
  };

  /**
   * Registers a handler that other API scripts can use to be told when SmartAoE changes a token. Exposed publicly as
   * ObserveTokenChange.
   * Non-function arguments are silently ignored.
   *
   * @param {Function} handler - Callback invoked as handler(obj, prev) on each token change.
   */
  const observeTokenChange = function (handler) {
    if (handler && _.isFunction(handler)) {
      observers.tokenChange.push(handler);
    }
  };

  /**
   * Calls every handler registered for the given event with the changed object and its previous state.
   * Exceptions thrown by a handler are caught and logged so one bad observer cannot break the others.
   *
   * @param {string} event - Observer event key (currently only 'tokenChange').
   * @param {object} obj - Roll20 graphic (token) that changed.
   * @param {object} prev - Previous attribute values of the token.
   */
  const notifyObservers = function (event, obj, prev) {
    _.each(observers[event], function (handler) {
      try {
        handler(obj, prev);
      } catch (e) {
        log(`SmartAoE: An observer threw and exception in handler: ${handler}`);
      }
    });
  };
  //---------------------------------------------------------------------------------------
  //---------------------------------------------------------------------------------------

  // ————— UTILITIES —————
  /**
   * Checks whether a value is a finite number (excludes NaN, Infinity and numeric strings).
   *
   * @param {*} value - Value to test.
   * @returns {boolean} True if value is a finite number.
   */
  const isNumber = function isNumber(value) {
    return typeof value === 'number' && isFinite(value);
  };

  //Jukebox function taken from Kurt J.'s Scriptcards script'
  /**
   * Starts playing the jukebox track with the given title. Whispers an error to chat if no such track exists.
   * Adapted from Kurt J.'s ScriptCards script.
   *
   * @param {string} trackname - Title of the Roll20 jukebox track.
   * @param {string} whisperString - Whisper prefix (e.g. '/w gm') used for the error message.
   */
  const playJukeboxTrack = function (trackname, whisperString) {
    const track = findObjs({ type: 'jukeboxtrack', title: trackname })[0];
    if (track) {
      track.set('softstop', false);
      track.set('playing', true);
    } else {
      sendChat(scriptName, `${whisperString} Error: Jukebox track ${trackname} not found in game`);
    }
  };

  /**
   * Adds a custom entry to, or removes a SmartAoE entry from, the Campaign turn order and writes it back to Campaign().
   * Added turns are inserted directly after the current turn and, when linked, tagged with a smartaoeid so they can
   * be removed when the control token is deleted.
   *
   * @param {string} operation - 'add' or 'remove'; anything else is a no-op.
   * @param {string} turnName - Custom name shown in the turn tracker (add only).
   * @param {number|string} turnValue - Initial turn value 'pr' (add only).
   * @param {string} turnFormula - Turn tracker formula applied each round (add only).
   * @param {string} controlTokID - Control token id stored as smartaoeid (add) or used to find the turn to remove
   *   (remove).
   * @param {string} pageID - Page id stored on the turn entry (add only).
   * @param {boolean} [linkToToken=true] - Whether to tag the added turn with smartaoeid so it is removed with the
   *   control token.
   */
  const modifyTurnTracker = function (
    operation,
    turnName,
    turnValue,
    turnFormula,
    controlTokID,
    pageID,
    linkToToken = true,
  ) {
    let turnOrder;
    if (Campaign().get('turnorder') !== '') {
      turnOrder = JSON.parse(Campaign().get('turnorder'));
    } else {
      turnOrder = [];
    }

    switch (operation) {
      case 'add':
        //Add custom turn immediately after the current turn.
        //      NOTE: we add an additional parameter "smartaoeid". This is to allow removal of the turn when the controlTok is deleted
        //      We could have used the normal "id" parameter, but the turn tracker won't allow us to override the name if we do so. Defaulting to the name of the controlTok rather than the AoE effect name
        let newTurn;
        if (linkToToken) {
          newTurn = {
            id: '-1',
            pr: turnValue,
            custom: turnName,
            _pageid: pageID,
            formula: turnFormula,
            smartaoeid: controlTokID,
          };
        } else {
          newTurn = { id: '-1', pr: turnValue, custom: turnName, _pageid: pageID, formula: turnFormula };
        }
        turnOrder.splice(1, 0, newTurn);
        Campaign().set('turnorder', JSON.stringify(turnOrder));
        break;
      case 'remove':
        const turnIndex = turnOrder.findIndex((t) => t.smartaoeid === controlTokID);
        if (turnIndex > -1) {
          turnOrder.splice(turnIndex, 1);
          Campaign().set('turnorder', JSON.stringify(turnOrder));
        }
        break;
      default:
        break;
    }
  };

  // ————— CHAT CARD OUTPUT —————
  /**
   * Builds the opening HTML of the chat card: the outer container and the title/subtitle header.
   * The subtitle is leftsub and rightsub joined by subtitleseperator, or whichever one is non-empty. Style
   * placeholders are filled from cardParameters.
   *
   * @param {object} cardParameters - Chat card style/content settings (title, leftsub, rightsub, subtitleseperator,
   *   colours, fonts).
   * @returns {string} HTML for the card header (outer divs are closed later by buildTableBody/buildGMOutput).
   */
  const buildTitle = function (cardParameters) {
    let subtitle = '';
    if (cardParameters.leftsub !== '' && cardParameters.rightsub !== '') {
      subtitle = cardParameters.leftsub + cardParameters.subtitleseperator + cardParameters.rightsub;
    }
    if (cardParameters.leftsub !== '' && cardParameters.rightsub === '') {
      subtitle = cardParameters.leftsub;
    }
    if (cardParameters.leftsub === '' && cardParameters.rightsub !== '') {
      subtitle = cardParameters.rightsub;
    }

    let output =
      `<div style="margin-left:!{leftmargin}">` +
      `<div style="display: table; border: !{tableborder}; background-color: !{tablebgcolor}; width: 270px; text-align: left; border-radius: !{tableborderradius}; border-collapse: separate; box-shadow: !{tableshadow}">` +
      `<div style="display: table-header-group; background-image: !{titlecardbackground}; border-bottom: !{titlecardbottomborder};">` +
      `<div style="display: table-row;">` +
      `<div style="display: table-cell; padding: 2px 2px; text-align: center; border-bottom: 2px solid #444444;border-top-left-radius: !{tableborderradius};border-top-right-radius: !{tableborderradius};">` +
      `<span style="font-family: !{titlefontface}; font-style:normal; font-size: !{titlefontsize}; line-height: !{titlefontlineheight}; font-weight: bold; color: !{titlefontcolor}; text-shadow: -1px 1px 0 #000, 1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000;">${cardParameters.title}</span>` +
      `<br><span style="font-family: !{subtitlefontface}; font-variant: normal; font-size: !{subtitlefontsize}; font-style:normal; font-weight: bold; color: !{subtitlefontcolor}; ">${subtitle}</span>` +
      `</div>` +
      `</div>` +
      `</div>`;
    output = replaceStyleInformation(output, cardParameters);
    return output;
  };

  //Inline roll for a plain-number damage formula. Roll20 can't start an inline roll with a negative number,
  //so healing amounts are written as "0 - n". Non-numeric values count as 0.
  /**
   * Turns a plain-number damage value into an inline-roll string. Negative (healing) values are written as '0 - n'
   * because Roll20 inline rolls cannot start with a negative number.
   *
   * @param {number} base - Flat damage amount; non-finite values are treated as 0.
   * @returns {string} Inline-roll string such as '[[5]]' or '[[0 - 5]]'.
   */
  const baseDamageFormula = function (base) {
    const n = Number.isFinite(base) ? base : 0;
    return n < 0 ? `[[0 - ${Math.abs(n)}]]` : `[[${n}]]`;
  };

  //Damage row(s) for the chat card: every damage roll with a non-zero result is shown, so formula 2
  //still appears when formula 1 is absent. Returns '' when there is no damage to show.
  /**
   * Builds the damage section of the chat card from the rolled damage results. Every roll with a non-zero result is
   * shown, so damage 2 still appears when damage 1 is absent.
   *
   * @param {object[]} damageRolls - Damage roll results, each with styled_1 (inline-roll HTML) and result_1 (array of
   *   totals).
   * @param {object} aoeLink - AoE link object from state; supplies damageType1/damageType2 and cardParameters.
   * @returns {string} HTML for the damage row, or '' when there is no damage to show.
   */
  const buildDamageRows = function (damageRolls, aoeLink) {
    const shown = damageRolls
      .map((r, idx) => {
        return {
          styled: r.styled_1,
          type: idx === 0 ? aoeLink.damageType1 : aoeLink.damageType2,
          value: r.result_1 ? r.result_1[0] : 0,
        };
      })
      .filter((r) => r.value);
    if (shown.length === 0) {
      return '';
    }
    const second = shown[1] || { styled: '', type: '' };
    return buildDamageRow(shown[0].styled, shown[0].type, second.styled, second.type, aoeLink.cardParameters);
  };

  /**
   * Builds a one-row HTML table showing one or two damage rolls with their damage types.
   *
   * @param {string} damRoll1 - Inline-roll HTML for the first damage roll.
   * @param {string} damType1 - Damage type label for the first roll.
   * @param {string} [damRoll2=''] - Inline-roll HTML for the second damage roll; omitted from the row when empty.
   * @param {string} [damType2=''] - Damage type label for the second roll.
   * @param {object} cardParameters - Chat card style settings used to fill placeholders.
   * @returns {string} HTML table for the damage row.
   */
  const buildDamageRow = function (damRoll1, damType1, damRoll2 = '', damType2 = '', cardParameters) {
    const damageCell = (roll, type) =>
      `<td style="width:270px;padding:3px;line-height: !{lineheight};width:100%;vertical-align:middle;text-align:center;font-weight:bold; font-size:!{bodyfontsize}; font-family: !{bodyfontface}">` +
      `<span>Dmg:</span>` +
      `${roll}` +
      `<span>${type}</span>` +
      `</td>`;

    let rowData = damageCell(damRoll1, damType1);
    if (damRoll2 !== '') {
      rowData = rowData + damageCell(damRoll2, damType2);
    }

    let output =
      `<table style="width:270px; border-collapse:collapse; table-layout:fixed; width 270px; font-size:!{bodyfontsize}; font-family: !{bodyfontface}; border-bottom: 2px solid #444444;">` +
      `<tr style="background: !{tablebgcolor}; text-align:center">${rowData}</tr>` +
      `</table>`;

    output = replaceStyleInformation(output, cardParameters);
    return output;
  };

  /**
   * Colours for the next row of the saving-throw table, alternating odd/even rows via the shared tableLineCounter.
   *
   * @param {object} cardParameters - Chat card style settings, including odd/even row colours.
   * @returns {{rowBackground:string, fontColor:string}} Background and text colour for the row.
   */
  const nextRowColors = function (cardParameters) {
    tableLineCounter += 1;
    return tableLineCounter % 2 === 0
      ? { rowBackground: cardParameters.evenrowbackground, fontColor: cardParameters.evenrowfontcolor }
      : { rowBackground: cardParameters.oddrowbackground, fontColor: cardParameters.oddrowfontcolor };
  };

  /**
   * Builds the header row (Target / Roll / P/F? / Dam.) of the saving-throw table.
   * Increments the shared tableLineCounter to choose the odd/even row colours.
   *
   * @param {object} cardParameters - Chat card style settings, including odd/even row colours.
   * @returns {string} HTML <tr> for the save table header.
   */
  const buildSaveHeaderRow = function (cardParameters) {
    const { rowBackground, fontColor } = nextRowColors(cardParameters);

    let output =
      `<tr style="background: ${rowBackground}; color:${fontColor}; text-align:center;border-bottom: 1px solid #444444;">` +
      `<td style="width:150px;padding:3px;width:85%;vertical-align:middle;text-align:left;font-weight:bolder;">Target</td>` +
      `<td style="width:30px;text-align:center;font-weight:bold;padding: 2px 2px">Roll</td>` +
      `<td style="width:40px;text-align:center; font-weight:bold; padding: 2px 2px">P/F?</td>` +
      `<td style="width:50px;font-weight:bold; padding: 2px 2px">Dam.</td>` +
      `</tr>`;
    output = replaceStyleInformation(output, cardParameters);
    return output;
  };

  /**
   * Wraps the GM-only save rows (e.g. tokens on the GM layer) in their own table for a separate whisper to the GM.
   * Closes the outer card divs opened by buildTitle.
   *
   * @param {string} saveRows - Concatenated HTML <tr> rows for GM-only targets.
   * @param {object} cardParameters - Chat card style settings used to fill placeholders.
   * @returns {string} HTML table for the GM whisper.
   */
  const buildGMOutput = function (saveRows, cardParameters) {
    let output =
      `<div style="margin-left:!{leftmargin}">` +
      `<table style="width:270px; border-collapse:collapse; table-layout:fixed; font-size:!{bodyfontsize}; font-family: !{bodyfontface}">` +
      `<tr>` +
      `<td style="width:150px;padding:3px;width:85%;vertical-align:middle;text-align:left;font-weight:bolder;"></td>` +
      `<td style="width:30px;text-align:center;font-weight:bold;padding: 2px 2px"></td>` +
      `<td style="width:40px;text-align:center; font-weight:bold; padding: 2px 2px"></td>` +
      `<td style="width:50px;font-weight:bold; padding: 2px 2px"></td>` +
      `</tr>` +
      `${saveRows}` +
      `</table></div></div>`;

    output = replaceStyleInformation(output, cardParameters);
    return output;
  };

  /**
   * Assembles the saving-throw table from the header row, the save rows and the description row, and closes the outer
   * card divs opened by buildTitle.
   *
   * @param {string} saveHeaderRow - HTML header row ('' to omit).
   * @param {string} saveRows - Concatenated HTML save rows ('' to omit).
   * @param {string} descRow - HTML description row ('' to omit).
   * @param {object} cardParameters - Chat card style settings used to fill placeholders.
   * @returns {string} HTML for the table body and card closing tags.
   */
  const buildTableBody = function (saveHeaderRow, saveRows, descRow, cardParameters) {
    let output =
      `<table style="width:270px; border-collapse:collapse; table-layout:fixed; font-size:!{bodyfontsize}; font-family: !{bodyfontface}">` +
      `${saveHeaderRow}` +
      `${saveRows}` +
      `${descRow}` +
      `</table></div></div>`;

    output = replaceStyleInformation(output, cardParameters);
    return output;
  };

  /**
   * Builds one target's row in the saving-throw table: token image (ping-pull link), name, save roll(s), a P/F badge
   * and the damage taken.
   * Unless damage is auto-applied, the P/F badge is a button that runs !smartapply with the damage details.
   * Increments the shared tableLineCounter for row colours.
   *
   * @param {string} imageURL - Token image URL.
   * @param {string} id - Target token id.
   * @param {string} layer - Token layer; 'gmlayer' makes the ping GM-only and the damage message a GM whisper.
   * @param {string} name - Display name of the target.
   * @param {boolean} success - True if the target passed its save.
   * @param {string} saveInline1 - Inline-roll HTML for the first save roll.
   * @param {string} saveInline2 - Inline-roll HTML for the second save roll (advantage/disadvantage).
   * @param {boolean} roll2x - Whether to show the second save roll.
   * @param {number[]} dam - Damage amounts, joined with '/'.
   * @param {boolean} autoApply - If true, damage was already applied so no !smartapply link is added.
   * @param {string[]} bar - Token bar(s) that damage is applied to.
   * @param {string} markerString - Status markers to apply ('::' separators); 'n/a' if empty.
   * @param {string} RVI - Resist/vulnerable/immune indicator shown as superscript after the name.
   * @param {string} zeroHPmarker - Marker(s) to apply at 0 HP ('::' separators); 'n/a' if empty.
   * @param {boolean} removeAtZero - Whether the token is removed at 0 HP.
   * @param {object} cardParameters - Chat card style settings, including odd/even row colours.
   * @param {string} whisperString - Whisper prefix passed to !smartapply.
   * @param {boolean} whisperResults - Whether damage messages should be whispered to the GM.
   * @returns {{layer:string, output:string}} The token layer and the row HTML.
   */
  const buildSaveRow = function (
    imageURL,
    id,
    layer,
    name,
    success,
    saveInline1,
    saveInline2,
    roll2x,
    dam,
    autoApply,
    bar,
    markerString,
    RVI,
    zeroHPmarker,
    removeAtZero,
    cardParameters,
    whisperString,
    whisperResults,
  ) {
    let damString = dam.join('/');
    markerString = markerString.replace(/::/g, '%%');
    zeroHPmarker = zeroHPmarker.replace(/::/g, '%%');
    if (markerString === '') {
      markerString = 'n/a';
    }
    if (zeroHPmarker === '') {
      zeroHPmarker = 'n/a';
    }
    const gmWhisperDamageMsg = layer === 'gmlayer' || whisperResults ? 'true' : 'false';

    const removeAtZeroMsg = removeAtZero ? 'true' : 'false';
    const barString = bar.join(',');

    //replace some problem characters before creating the !smartapply button action text. These will get un-replaced when triggered
    const tempName = name.replace(/'/g, '%apostrophe%').replace(/`/g, '%backtick%');

    const applyDamLink = autoApply
      ? ''
      : ` href='!smartapply --args|${id}|"${tempName}"|${barString}|${damString}|${markerString}|${zeroHPmarker}|${removeAtZeroMsg}|${gmWhisperDamageMsg}|${whisperString}'`;
    damString = damString.replace(/\//g, ' / ');

    let RVI_output = '';
    if (RVI.length > 0) {
      RVI_output = `<span style="font-size: 10px; vertical-align: super">${RVI}</span>`;
    }

    const { rowBackground, fontColor } = nextRowColors(cardParameters);

    //P/F badge: green "P" for a pass, red "F" for a fail; a button for !smartapply unless damage was auto-applied
    const result = `<td style="text-align:center"><a style="font-weight:bold;color:#ffffff;background:${success ? '#3FB315' : '#b50e0c'};border:1px solid black;padding:2px;cursor:pointer"${applyDamLink}>${success ? 'P' : 'F'}</a></td>`;

    //ping-pull for tokens on gm layer will only be visible to gm. Otherwise, all players see ping-pull
    const pingCmd = layer === 'gmlayer' ? '!smartpinggm' : '!smartpingall';

    let output =
      `<tr style="background: ${rowBackground}; color:${fontColor}">` +
      `<td style="padding:3px;height:25px">` +
      `<div style ="float:left;">` +
      `<a style="display:inline-block;vertical-align:middle;margin-right:4px;border-style:none;margin:0px;padding:0px;background: ${rowBackground}; cursor:pointer;" href="${pingCmd} ${id}">` +
      `<img style ="height:25px;width:25px;" src ="${imageURL}"></img>` +
      `</a>` +
      `</div>` +
      `<span style="vertical-align:middle;font-weight:bolder">${name}</span>` +
      RVI_output +
      `</td>` +
      `<td style="text-align:center">` +
      `${saveInline1}${roll2x ? saveInline2 : ''}` +
      `</td>` +
      `${result}` +
      `<td style="text-align:center; font-weight:bold">${damString}</td>` +
      `</tr>`;

    output = replaceStyleInformation(output, cardParameters);

    return { layer: layer, output: output };
  };

  /**
   * Builds the description row shown at the bottom of the saving-throw table.
   *
   * @param {string} descText - Description text or HTML.
   * @param {object} cardParameters - Chat card style settings used to fill placeholders.
   * @returns {string} HTML for the description row.
   */
  const buildDescRow = function (descText, cardParameters) {
    let output =
      `<desc style="background: !{tablebgcolor}; border-bottom-left-radius: !{tableborderradius};border-bottom-right-radius: !{tableborderradius};">` +
      `<td colspan="4">` +
      `<div style="text-align:justify;text-justify:inter-word; margin:2px 2px 2px 2px;border-top: 1px solid #444444;">${descText}</div>` +
      `</td>` +
      `</desc>`;

    output = replaceStyleInformation(output, cardParameters);
    return output;
  };

  /**
   * Replaces every !{styleName} placeholder in an HTML string with the matching value from cardParameters.
   *
   * @param {string} outputLine - HTML containing !{...} placeholders.
   * @param {object} cardParmeters - Chat card style settings keyed by placeholder name.
   * @returns {string} HTML with the known placeholders filled in.
   */
  const replaceStyleInformation = function (outputLine, cardParmeters) {
    const styleList = [
      'tableborder',
      'tablebgcolor',
      'tableborderradius',
      'tableshadow',
      'titlecardbackground',
      'titlecardbottomborder',
      'titlefontsize',
      'titlefontlineheight',
      'titlefontcolor',
      'bodyfontsize',
      'subtitlefontsize',
      'subtitlefontcolor',
      'titlefontface',
      'bodyfontface',
      'subtitlefontface',
      'buttonbackground',
      'buttontextcolor',
      'buttonbordercolor',
      'dicefontcolor',
      'dicefontsize',
      'descriptiontext',
      'leftmargin',
    ];

    for (let i = 0; i < styleList.length; i++) {
      outputLine = outputLine.replace(new RegExp('!{' + styleList[i] + '}', 'g'), cardParmeters[styleList[i]]);
    }
    return outputLine;
  };

  // ————— SAVES & INLINE ROLLS —————
  const saveList = {
    '5estr': {
      name: 'STR Save',
      formula:
        '[[d20 + ([[d0 + @{strength_save_bonus}@{pbd_safe}]]*(1-@{npc})) [PC] + (@{npc_str_save}*@{npc}) [NPC]]]',
    },
    '5edex': {
      name: 'DEX Save',
      formula:
        '[[d20 + ([[d0 + @{dexterity_save_bonus}@{pbd_safe}]]*(1-@{npc})) [PC] + (@{npc_dex_save}*@{npc}) [NPC]]]',
    },
    '5econ': {
      name: 'CON Save',
      formula:
        '[[d20 + ([[d0 + @{constitution_save_bonus}@{pbd_safe}]]*(1-@{npc})) [PC] + (@{npc_con_save}*@{npc}) [NPC]]]',
    },
    '5eint': {
      name: 'INT Save',
      formula:
        '[[d20 + ([[d0 + @{intelligence_save_bonus}@{pbd_safe}]]*(1-@{npc})) [PC] + (@{npc_int_save}*@{npc}) [NPC]]]',
    },
    '5ewis': {
      name: 'WIS Save',
      formula: '[[d20 + ([[d0 + @{wisdom_save_bonus}@{pbd_safe}]]*(1-@{npc})) [PC] + (@{npc_wis_save}*@{npc}) [NPC]]]',
    },
    '5echa': {
      name: 'CHA Save',
      formula:
        '[[d20 + ([[d0 + @{charisma_save_bonus}@{pbd_safe}]]*(1-@{npc})) [PC] + (@{npc_cha_save}*@{npc}) [NPC]]]',
    },
    pf1fort: {
      name: 'FORT Save',
      formula: '[[1d20+@{fortitude}[MOD]+(@{saves_condition})[CONDITION]+@{rollmod_save}[QUERY]]]',
    },
    pf1ref: {
      name: 'REF Save',
      formula: '[[1d20+@{reflex}[MOD]+(@{saves_condition})[CONDITION]+@{rollmod_save}[QUERY]]]',
    },
    pf1will: {
      name: 'WILL Save',
      formula: '[[1d20+@{will}[MOD]+(@{saves_condition})[CONDITION]+@{rollmod_save}[QUERY]]]',
    },
    pf2fort: {
      name: 'FORT Save',
      formula:
        '[[1d20cs20cf1 + [@{saving_throws_fortitude_proficiency_display}] (@{saving_throws_fortitude})[@{text_modifier}] + (@{query_roll_bonus})[@{text_bonus}]]]',
    },
    pf2ref: {
      name: 'REF Save',
      formula:
        '[[1d20cs20cf1 + [@{saving_throws_reflex_proficiency_display}] (@{saving_throws_reflex})[@{text_modifier}] + (@{query_roll_bonus})[@{text_bonus}]]]',
    },
    pf2will: {
      name: 'WILL Save',
      formula:
        '[[1d20cs20cf1 + [@{saving_throws_will_proficiency_display}] (@{saving_throws_will})[@{text_modifier}] + (@{query_roll_bonus})[@{text_bonus}]]]',
    },
    pfcfort: {
      name: 'FORT Save',
      formula:
        '[[1d20+@{total-Fort}[tot]+@{Fort-ability-mod}[mod]+@{Fort-trait}[trait]+@{Fort-resist}[res]+@{Fort-misc-mod}[misc]+@{saves-cond}[cond]+@{buff_Fort-total}[buff1]+@{buff_saves-total}[buff2]]]',
    },
    pfcref: {
      name: 'REF Save',
      formula:
        '[[1d20+@{total-Ref}[tot]+@{Ref-ability-mod}[mod]+@{Ref-trait}[trait]+@{Ref-resist}[res]+@{Ref-misc-mod}[misc]+@{saves-cond}[cond]+@{buff_Ref-total}[buff1]+@{buff_saves-total}[buff2]]]',
    },
    pfcwill: {
      name: 'WILL Save',
      formula:
        '[[1d20+@{total-Will}[tot]+@{Will-ability-mod}[mod]+@{Will-trait}[trait]+@{Will-resist}[res]+@{Will-misc-mod}[misc]+@{saves-cond}[cond]+@{buff_Will-total}[buff1]+@{buff_saves-total}[buff2]]]',
    },
    custom: {
      name: '',
      formula: '',
    },
  };
  /**
   * Escapes characters that Roll20 chat would otherwise read as HTML, roll or macro syntax, replacing them with HTML
   * entities.
   *
   * @param {string} str - Text to escape.
   * @param {boolean} [weak] - If true, leave '<' and '>' unescaped.
   * @returns {string} The escaped text.
   */
  const htmlReplace = (str, weak) => {
    const entities = {
      '<': 'lt',
      '>': 'gt',
      "'": '#39',
      '@': '#64',
      '{': '#123',
      '|': '#124',
      '}': '#125',
      '[': '#91',
      '"': 'quot',
      ']': '#93',
      '*': '#42',
      '&': 'amp',
    };
    const regExp = weak ? /['"@{|}[*&\]]/g : /[<>'"@{|}[*&\]]/g;
    return str.replace(regExp, (c) => '&' + entities[c] + ';');
  };

  /**
   * Renders a rolled expression as a Roll20-style inline-roll span showing the total, with a hover tooltip of the
   * formula and dice. The border colour marks a crit (green), fumble (red) or both (blue).
   *
   * @param {object} roll - Inline roll from msg.inlinerolls (needs expression and results).
   * @param {boolean} hideformula - If true, omit the tooltip so the formula is hidden.
   * @returns {string} HTML <span> for the inline roll.
   */
  const makeInlineroll = (roll, hideformula) => {
    const boundary = (results) => {
      switch (detectCritical(results)) {
        case 'crit':
          return ';border:2px solid #3FB315';
        case 'mixed':
          return ';border:2px solid #4A57ED';
        case 'fumble':
          return ';border:2px solid #B31515';
        default:
          return '';
      }
    };
    const background = 'background-color: #FEF68E';
    return (
      '<span ' +
      (hideformula
        ? ''
        : `class="showtip tipsy" title="Rolling ${htmlReplace(roll.expression)} = ${rollToText(roll.results)}" `) +
      `style="display:inline-block;min-width:1em;color:#000000;font-size:1.2em;font-weight:bold;padding:0 3px;vertical-align:middle;${background}; ` +
      `cursor:${hideformula ? 'default' : 'help'}${boundary(roll.results)}">${roll.results.total || '0'}</span>`
    );
  };
  /**
   * Recursively converts a Roll20 roll result tree into tooltip text, wrapping individual dice in crit/fumble styled
   * spans.
   *
   * @param {object} roll - Roll20 roll result node (type 'R' dice, 'M' math, 'V' roll set, 'G' group).
   * @returns {string} Text/HTML describing the roll; '' for unknown node types.
   */
  const rollToText = (roll) => {
    switch (roll.type) {
      case 'R': {
        const c = (roll.mods && roll.mods.customCrit) || [
            {
              comp: '==',
              point: roll.sides,
            },
          ],
          f = (roll.mods && roll.mods.customFumble) || [
            {
              comp: '==',
              point: 1,
            },
          ],
          styledRolls = roll.results.map((r) => {
            const style = rollIsCrit(r.v, c[0].comp, c[0].point)
              ? ' critsuccess'
              : rollIsCrit(r.v, f[0].comp, f[0].point)
                ? ' critfail'
                : '';
            return `<span class='basicdiceroll${style}'>${r.v}</span>`;
          });
        return `(${styledRolls.join('+')})`;
      }
      case 'M':
        return roll.expr
          .toString()
          .replace(/(\+|-)/g, '$1 ')
          .replace(/\*/g, '&' + 'ast' + ';');
      case 'V':
        return roll.rolls.map(rollToText).join(' ');
      case 'G':
        return `'(${roll.rolls.map((a) => a.map(rollToText).join(' ')).join(' ')})`;
      default:
        return '';
    }
  };
  /**
   * Recursively checks a Roll20 roll result tree for critical successes and fumbles, honouring custom crit/fumble
   * ranges (cs/cf).
   *
   * @param {object} roll - Roll20 roll result node.
   * @returns {('crit'|'fumble'|'mixed'|false)} 'mixed' if both occur, 'crit' or 'fumble' if only one does, otherwise
   *   false.
   */
  const detectCritical = (roll) => {
    let s = [];
    if (roll.type === 'V') s = (roll.rolls || []).map(detectCritical);
    if (roll.type === 'G') s = _.flatten(roll.rolls || []).map(detectCritical);
    if (roll.type === 'R') {
      const crit = (roll.mods && roll.mods.customCrit) || [
        {
          comp: '==',
          point: roll.sides || 0,
        },
      ];
      const fumble = (roll.mods && roll.mods.customFumble) || [
        {
          comp: '==',
          point: 1,
        },
      ];
      if (roll.results.some((r) => rollIsCrit(r.v, crit[0].comp, crit[0].point))) s.push('crit');
      if (roll.results.some((r) => rollIsCrit(r.v, fumble[0].comp, fumble[0].point))) s.push('fumble');
    }
    const c = s.includes('crit'),
      f = s.includes('fumble'),
      m = s.includes('mixed') || (c && f);
    return m ? 'mixed' : c ? 'crit' : f ? 'fumble' : false;
  };
  /**
   * Compares one die value against a crit/fumble threshold.
   *
   * @param {number} value - Die result.
   * @param {string} comp - Comparison operator: '==', '<=' or '>='.
   * @param {number} point - Threshold value.
   * @returns {boolean|undefined} Result of the comparison; undefined for an unknown operator.
   */
  const rollIsCrit = (value, comp, point) => {
    switch (comp) {
      case '==':
        return value == point;
      case '<=':
        return value <= point;
      case '>=':
        return value >= point;
    }
  };

  // ————— BASIC TYPES —————
  /**
   * Constructor for a simple 2D point. Use with new.
   *
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   */
  const pt = function (x, y) {
    this.x = x;
    this.y = y;
  };

  /**
   * Normalises a Roll20 library image URL to its 'thumb' size so the API can use it in createObj. Adds a random
   * cache-busting query string if the URL has none.
   *
   * @param {string} imgsrc - Image URL.
   * @returns {string|undefined} The cleaned thumb URL, or undefined if the URL is not a Roll20 library image.
   */
  const getCleanImgsrc = function (imgsrc) {
    const parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/);
    if (parts) {
      return parts[1] + 'thumb' + parts[3] + (parts[4] ? parts[4] : `?${Math.round(Math.random() * 9999999)}`);
    }
    return;
  };

  // ————— INSTALL —————
  /**
   * Abilities given to the AoEControlToken character SmartAoE creates on first run: [name, macro action, token
   * action?]. The AoEGenerator macro links to the AoE ones by name.
   */
  const CONTROL_TOKEN_ABILITIES = [
    ['CW', '!smartrotateorigin cw', true],
    ['CCW', '!smartrotateorigin ccw', true],
    ['Trigger-ALL', '!smarttrigger', true],
    ['Trigger-Target', '!smartquery @{target|Choose a Target|token_id}', true],
    //Square, float
    ['5ft-Square', '!smartaoe {{\n  --aoeType|square, float\n  --radius|2.5ft\n  --fx|burn-fire\n}}', false],
    ['10ft-Square', '!smartaoe {{\n  --aoeType|square, float\n  --radius|5ft\n  --fx|burn-fire\n}}', false],
    ['20ft-Square', '!smartaoe {{\n  --aoeType|square, float\n  --radius|10ft\n  --fx|burn-fire\n}}', false],
    ['30ft-Square', '!smartaoe {{\n  --aoeType|square, float\n  --radius|15ft\n  --fx|burn-fire\n}}', false],
    ['40ft-Square', '!smartaoe {{\n  --aoeType|square, float\n  --radius|20ft\n  --fx|burn-fire\n}}', false],
    ['Variable-Square', '!smartaoe {{\n  --aoeType|square\n  --fx|burn-fire\n}}', false],
    //Circle, float
    [
      '5ft-Circle',
      '!smartaoe {{\n  --aoeType|circle, float\n  --radius|2.5ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '10ft-Circle',
      '!smartaoe {{\n  --aoeType|circle, float\n  --radius|5ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '20ft-Circle',
      '!smartaoe {{\n  --aoeType|circle, float\n  --radius|10ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '30ft-Circle',
      '!smartaoe {{\n  --aoeType|circle, float\n  --radius|15ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '40ft-Circle',
      '!smartaoe {{\n  --aoeType|circle, float\n  --radius|20ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}',
      false,
    ],
    ['Variable-Circle', '!smartaoe {{\n  --aoeType|circle\n  --minGridArea|0.5\n  --fx|burn-fire\n}}', false],
    //PF circle, float
    [
      '5ft-PF-Circle',
      '!smartaoe {{\n  --aoeType|PFcircle, float\n  --radius|2.5ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '10ft-PF-Circle',
      '!smartaoe {{\n  --aoeType|PFcircle, float\n  --radius|5ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '20ft-PF-Circle',
      '!smartaoe {{\n  --aoeType|PFcircle, float\n  --radius|10ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '30ft-PF-Circle',
      '!smartaoe {{\n  --aoeType|PFcircle, float\n  --radius|15ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '40ft-PF-Circle',
      '!smartaoe {{\n  --aoeType|PFcircle, float\n  --radius|20ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}',
      false,
    ],
    ['Variable-PF-Circle', '!smartaoe {{\n  --aoeType|PFcircle\n  --minGridArea|0.5\n  --fx|burn-fire\n}}', false],
    //Centered on Caster, square
    [
      '5ft-Square-Caster',
      '!smartaoe {{\n  --aoeType|square, float\n  --controlTokName|self\n  --radius|5ft\n  --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '10ft-Square-Caster',
      '!smartaoe {{\n  --aoeType|square, float\n  --controlTokName|self\n  --radius|10ft\n  --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '15ft-Square-Caster',
      '!smartaoe {{\n  --aoeType|square, float\n  --controlTokName|self\n  --radius|15ft\n  --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '20ft-Square-Caster',
      '!smartaoe {{\n  --aoeType|square, float\n  --controlTokName|self\n  --radius|20ft\n  --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '30ft-Square-Caster',
      '!smartaoe {{\n  --aoeType|square, float\n  --controlTokName|self\n  --radius|30ft\n  --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '40ft-Square-Caster',
      '!smartaoe {{\n  --aoeType|square, float\n  --controlTokName|self\n  --radius|40ft\n  --forceIntersection|0\n}}',
      false,
    ],
    //Centered on Caster, circle
    [
      '5ft-Circle-Caster',
      '!smartaoe {{\n  --aoeType|circle, float\n  --controlTokName|self\n  --radius|5ft\n  --minGridArea|0.5\n --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '10ft-Circle-Caster',
      '!smartaoe {{\n  --aoeType|circle, float\n  --controlTokName|self\n  --radius|10ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '15ft-Circle-Caster',
      '!smartaoe {{\n  --aoeType|circle, float\n  --controlTokName|self\n  --radius|15ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '20ft-Circle-Caster',
      '!smartaoe {{\n  --aoeType|circle, float\n  --controlTokName|self\n  --radius|20ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '30ft-Circle-Caster',
      '!smartaoe {{\n  --aoeType|circle, float\n  --controlTokName|self\n  --radius|30ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '40ft-Circle-Caster',
      '!smartaoe {{\n  --aoeType|circle, float\n  --controlTokName|self\n  --radius|40ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    //Centered on Caster, PF circle
    [
      '5ft-PF-Circle-Caster',
      '!smartaoe {{\n  --aoeType|PFcircle, float\n  --controlTokName|self\n  --radius|5ft\n  --minGridArea|0.5\n --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '10ft-PF-Circle-Caster',
      '!smartaoe {{\n  --aoeType|PFcircle, float\n  --controlTokName|self\n  --radius|10ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '15ft-PF-Circle-Caster',
      '!smartaoe {{\n  --aoeType|PFcircle, float\n  --controlTokName|self\n  --radius|15ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '20ft-PF-Circle-Caster',
      '!smartaoe {{\n  --aoeType|PFcircle, float\n  --controlTokName|self\n  --radius|20ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '30ft-PF-Circle-Caster',
      '!smartaoe {{\n  --aoeType|PFcircle, float\n  --controlTokName|self\n  --radius|30ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '40ft-PF-Circle-Caster',
      '!smartaoe {{\n  --aoeType|PFcircle, float\n  --controlTokName|self\n  --radius|40ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    //Lines
    ['30ft-Line', '!smartaoe {{\n  --aoeType|line\n  --radius|30ft\n  --fx|burn-fire\n}}', false],
    ['60ft-Line', '!smartaoe {{\n  --aoeType|line\n  --radius|60ft\n  --fx|burn-fire\n}}', false],
    ['100ft-Line', '!smartaoe {{\n  --aoeType|line\n  --radius|100ft\n  --fx|burn-fire\n}}', false],
    ['Variable-Line', '!smartaoe {{\n  --aoeType|line\n  --fx|burn-fire\n}}', false],
    //5e cones
    [
      '15ft-5eCone',
      '!smartaoe {{\n  --aoeType|5econe\n  --radius|15ft\n  --origin|nearest, face\n  --minGridArea|0.25\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '30ft-5eCone',
      '!smartaoe {{\n  --aoeType|5econe\n  --radius|30ft\n  --origin|nearest, face\n  --minGridArea|0.25\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '60ft-5eCone',
      '!smartaoe {{\n  --aoeType|5econe\n  --radius|60ft\n  --origin|nearest, face\n  --minGridArea|0.25\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      'Variable-5eCone',
      '!smartaoe {{\n  --aoeType|5econe\n  --origin|nearest,face\n  --minGridArea|0.25\n  --fx|burn-fire\n}}',
      false,
    ],
    //PF cones
    [
      '15ft-PFCone',
      '!smartaoe {{\n  --aoeType|PFcone\n  --radius|15ft\n  --origin|nearest, face\n  --forceIntersection|0\n  --minGridArea|0.50\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '30ft-PFCone',
      '!smartaoe {{\n  --aoeType|PFcone\n  --radius|30ft\n  --origin|nearest\n  --forceIntersection|1\n --minGridArea|0.50\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '60ft-PFCone',
      '!smartaoe {{\n  --aoeType|PFcone\n  --radius|60ft\n  --origin|nearest\n  --forceIntersection|1\n --minGridArea|0.50\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      'Variable-PFCone',
      '!smartaoe {{\n  --aoeType|PFcone\n  --origin|nearest\n  --forceIntersection|1\n --minGridArea|0.50\n  --fx|burn-fire\n}}',
      false,
    ],
    //Normal cones, user enters cone angle
    [
      '15ft-Cone',
      '!smartaoe {{\n  --aoeType|cone, ?{Enter cone angle|90}\n  --radius|15ft\n  --minGridArea|0.50\n  --origin|nearest, face\n  --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '30ft-Cone',
      '!smartaoe {{\n  --aoeType|cone, ?{Enter cone angle|90}\n  --radius|30ft\n  --minGridArea|0.50\n  --origin|nearest, face\n  --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      '60ft-Cone',
      '!smartaoe {{\n  --aoeType|cone, ?{Enter cone angle|90}\n  --radius|60ft\n  --minGridArea|0.50\n  --origin|nearest, face\n  --forceIntersection|0\n  --fx|burn-fire\n}}',
      false,
    ],
    [
      'Variable-Cone',
      '!smartaoe {{\n  --aoeType|cone, ?{Enter cone angle|90}\n  --minGridArea|0.50\n  --origin|nearest, face\n  --forceIntersection|1\n  --fx|burn-fire\n}}',
      false,
    ],
  ];

  /**
   * Runs on startup: logs the version, creates or resets state[scriptName] when the schema version changes, and sets
   * up the default helpers.
   * If missing, creates the 'AoEControlToken' character (reticle default token plus CW/CCW/Trigger token actions and
   * many preset AoE abilities) and the GM 'AoEGenerator' collections macro, and whispers the GM about what was
   * created. Errors are logged.
   *
   * @returns {Promise<void>} Resolves when setup is complete.
   */
  async function checkInstall() {
    log(scriptName + ' v' + version + ' initialized.');

    //delete state[scriptName];

    if (!_.has(state, scriptName) || state[scriptName].version !== schemaVersion) {
      log('  > Updating Schema to v' + schemaVersion + ' <');
      switch (state[scriptName] && state[scriptName].version) {
        case 0.1:
        /* falls through */
        case 'UpdateSchemaVersion':
          state[scriptName].version = schemaVersion;
          break;

        default:
          resetLinks();
          break;
      }
    }

    //----------------------------------------------------------------------------------
    //  Check for existence of the default control token. Create it if it doesn't exist
    //  Also creates multiple abilities/token actions, plus a collections macro for calling up an AoE Generator chat menu
    //----------------------------------------------------------------------------------
    //declared outside the try block so the catch handler can name them (it threw a ReferenceError and hid the real error)
    const charName = 'AoEControlToken';
    const macroName = 'AoEGenerator';
    try {
      const URL = 'https://s3.amazonaws.com/files.d20.io/images/219939338/Q-RiO5B4NhyaPGwc1YMz9w/max.png?1620037815'; //reticle image

      const controlTokenChars =
        findObjs(
          {
            _type: 'character',
            name: charName,
          },
          { caseInsensitive: true },
        ) || [];

      if (controlTokenChars.length === 0) {
        log(`====> From ${scriptName}: The default ${charName} character does not exist! Creating now.`);

        const charObj = {
          avatar: URL,
          name: charName,
          inplayerjournals: 'all',
          controlledby: 'all',
        };
        const newChar = createObj('character', charObj);
        if (newChar) {
          const charID = newChar.get('_id');
          const pageID = Campaign().get('playerpageid');

          //create/set the default token for the control token character
          const tokObj = {
            imgsrc: getCleanImgsrc(URL),
            represents: charID,
            name: charName,
            has_bright_light_vision: true, //UDL
            light_hassight: true, //LDL
            width: 70,
            height: 70,
            left: 100,
            top: 100,
            layer: 'objects',
            pageid: pageID,
          };

          const newTok = createObj('graphic', tokObj);
          if (newTok) {
            setDefaultTokenForCharacter(newChar, newTok);
            newTok.remove();
          }

          //create common abilities for the new character
          CONTROL_TOKEN_ABILITIES.forEach(([name, action, istokenaction]) => {
            createObj('ability', { characterid: charID, name, action, istokenaction });
          });

          log(`====> From ${scriptName}: Character (${charName}) was created.`);
          sendChat(
            scriptName,
            `/w gm \`\`SmartAoE has generated character (${charName}) with default token and abilities, for use as a control token.\`\``,
          );
        }
      }

      const menuMacros =
        findObjs(
          {
            _type: 'macro',
            name: macroName,
          },
          { caseInsensitive: true },
        ) || [];

      if (menuMacros.length === 0) {
        log(`====> From ${scriptName}: Creating collections macro: ${macroName}`);

        const arrow = `🏹`;
        const explosion = `💥`;

        const actionText =
          `/w gm &{template:default}{{name=AoE Generator}} {{${arrow}${arrow}&nbsp;***CAST AT RANGE*** ${arrow}${arrow}&nbsp;\n` +
          `**_____Square / Cube______**&nbsp;\n` +
          `[5ft](~AoEControlToken|5ft-Square) [10ft](~AoEControlToken|10ft-Square) [20ft](~AoEControlToken|20ft-Square) [30ft](~AoEControlToken|30ft-Square) [40ft](~AoEControlToken|40ft-Square)\n` +
          `**_____Circle / Sphere______**&nbsp;\n` +
          `[5ft](~AoEControlToken|5ft-Circle) [10ft](~AoEControlToken|10ft-Circle) [20ft](~AoEControlToken|20ft-Circle) [30ft](~AoEControlToken|30ft-Circle) [40ft](~AoEControlToken|40ft-Circle)\n` +
          `**____PF Circle / Sphere____**&nbsp;\n` +
          `[5ft](~AoEControlToken|5ft-PF-Circle) [10ft](~AoEControlToken|10ft-PF-Circle) [20ft](~AoEControlToken|20ft-PF-Circle) [30ft](~AoEControlToken|30ft-PF-Circle) [40ft](~AoEControlToken|40ft-PF-Circle)\n` +
          `------------------------------------------\n` +
          `((${explosion})) ***FROM CASTER*** ((${explosion}))&nbsp;&nbsp;\n` +
          `**_____Square / Cube______**&nbsp;\n` +
          `[5ft](~AoEControlToken|5ft-Square-Caster) [10ft](~AoEControlToken|10ft-Square-Caster) [15ft](~AoEControlToken|15ft-Square-Caster) [20ft](~AoEControlToken|20ft-Square-Caster) [30ft](~AoEControlToken|30ft-Square-Caster)\n` +
          `[40ft](~AoEControlToken|40ft-Square-Caster) [Variable](~AoEControlToken|Variable-Square)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n` +
          `**_____Circle / Sphere______**&nbsp;\n` +
          `[5ft](~AoEControlToken|5ft-Circle-Caster) [10ft](~AoEControlToken|10ft-Circle-Caster) [15ft](~AoEControlToken|15ft-Circle-Caster) [20ft](~AoEControlToken|20ft-Circle-Caster) [30ft](~AoEControlToken|30ft-Circle-Caster)\n` +
          `[40ft](~AoEControlToken|40ft-Circle-Caster) [Variable](~AoEControlToken|Variable-Circle)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n` +
          `**____PF Circle / Sphere____**&nbsp;\n` +
          `[5ft](~AoEControlToken|5ft-PF-Circle-Caster) [10ft](~AoEControlToken|10ft-PF-Circle-Caster) [15ft](~AoEControlToken|15ft-PF-Circle-Caster) [20ft](~AoEControlToken|20ft-PF-Circle-Caster) [30ft](~AoEControlToken|30ft-PF-Circle-Caster)\n` +
          `[40ft](~AoEControlToken|40ft-PF-Circle-Caster) [Variable](~AoEControlToken|Variable-PF-Circle)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n` +
          `**__________Line__________**&nbsp;\n` +
          `[30ft](~AoEControlToken|30ft-Line) [60ft](~AoEControlToken|60ft-Line) [100ft](~AoEControlToken|100ft-Line) [Variable](~AoEControlToken|Variable-Line)\n` +
          `**_______Cone (Query)______**\n` +
          `[15ft](~AoEControlToken|15ft-Cone) [30ft](~AoEControlToken|30ft-Cone) [60ft](~AoEControlToken|60ft-Cone) [Variable](~AoEControlToken|Variable-Cone)\n` +
          `**_________5e-Cone________**\n` +
          `[15ft](~AoEControlToken|15ft-5eCone) [30ft](~AoEControlToken|30ft-5eCone) [60ft](~AoEControlToken|60ft-5eCone) [Variable](~AoEControlToken|Variable-5eCone)\n` +
          `**_________PF-Cone________**\n` +
          `[15ft](~AoEControlToken|15ft-PFCone) [30ft](~AoEControlToken|30ft-PFCone) [60ft](~AoEControlToken|60ft-PFCone) [Variable](~AoEControlToken|Variable-PFCone)\n` +
          `}}`;

        const players = findObjs({ _type: 'player' }).filter((p) => playerIsGM(p.get('_id')));
        if (players.length === 0) {
          log(`====> From ${scriptName}: No GM found, so the collections macro (${macroName}) was not created.`);
          return;
        }
        const gmID = players[0].get('_id');

        const macro = createObj('macro', { playerid: gmID, name: macroName, visibleto: gmID, action: actionText });

        if (macro) {
          log(`====> From ${scriptName}: Collections macro (${macroName}) was created.`);
          sendChat(
            scriptName,
            `/w gm \`\`SmartAoE has created a collections macro named (${macroName}). You may want to trim down the options depending on your game system of choice. \`\``,
          );
        } else {
          log(`====> From ${scriptName}: Failed to create collections macro (${macroName}).`);
          sendChat(scriptName, `/w gm \`\`SmartAoE failed to create a collections macro named (${macroName}) \`\``);
        }
      }
    } catch (err) {
      log(`Error creating character ${charName} and/or macro ${macroName}: ${err.message}`);
    }
  }

  // ————— AOE LINKS (STATE) —————
  /**
   * Expands a hex colour (#rgb, #rgba, #rrggbb or #rrggbbaa) to the full 8-digit #rrggbbaa form.
   *
   * @param {string} htmlstring - Hex colour string, with or without '#'.
   * @param {string} [defaultAlpha='ff'] - Alpha to append when the input has none.
   * @returns {string} Colour in '#rrggbbaa' form (other lengths are returned unchanged with '#').
   */
  const toFullColor = function (htmlstring, defaultAlpha = 'ff') {
    let s = htmlstring.toLowerCase().replace(/[^0-9a-f]/g, ''); //strip every non-hex character (was the first only)
    switch (s.length) {
      case 3:
        s = `${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}${defaultAlpha}`;
        break;
      case 4:
        s = `${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
        break;
      case 6:
        s = `${s}${defaultAlpha}`;
        break;
    }
    return `#${s}`;
  };

  /**
   * Empties SmartAoE's state: every AoE in the campaign is unlinked (paths and control tokens are left on the board).
   * Used on first install, when the stored schema is unknown, and by !smartclearcache.
   */
  const resetLinks = function () {
    state[scriptName] = {
      version: schemaVersion,
      links: [],
    };
  };

  /**
   * Writes recalculated path ids, origin index and bounding box back to an existing AoE link in state.
   *
   * @param {number} linkIndex - Index of the link in state[scriptName].links.
   * @param {string[]} pathIDs - Ids of the AoE's current Roll20 paths (copied).
   * @param {number} originIndex - Index into the link's originPts of the active origin.
   * @param {pt[]} boundingBox - Corner points [UL, UR, LR, LL] of the affected grid area.
   */
  const updateAoELink = function (linkIndex, pathIDs, originIndex, boundingBox) {
    //clear old paths from memory

    state[scriptName].links[linkIndex].pathIDs = pathIDs.map((x) => x);
    state[scriptName].links[linkIndex].originIndex = originIndex;
    state[scriptName].links[linkIndex].boundingBox = boundingBox;
  };

  /**
   * Creates a new AoE link record from all of the parsed !smartaoe options and saves it to state[scriptName].links.
   * Also records the zero-HP markers via rememberZeroHPMarkers.
   * Each parameter is copied to the link property of the same name; only those whose meaning is not obvious are listed.
   *
   * @param {string} controlTokName - Name of the control token.
   * @param {string} controlTokID - Id of the control token that moves the AoE.
   * @param {string} aoeType - AoE shape (e.g. 'square', 'circle', 'PFcircle', 'line', 'cone', '5econe', 'PFcone').
   * @param {pt} originPt - Starting origin point, stored as originPts[0].
   * @param {string} originTokID - Id of the caster/origin token.
   * @param {string} pathID - Id of the AoE's first drawn path (the link keeps a list of path ids).
   * @param {string} pageID - Page the AoE is on.
   * @param {object} cardParameters - Chat card style settings for the results card.
   * @param {...*} rest - The remaining options (save, damage, resistance, condition, sound, whisper, layer and caster
   *   settings) stored unchanged.
   * @returns {object} The new link object.
   */
  const makeAoELink = function (
    controlTokName,
    controlTokID,
    aoeType,
    coneWidth,
    aoeFloat,
    instant,
    forceIntersection,
    aoeColor,
    aoeOutlineColor,
    gridColor,
    radius,
    wallWidth,
    originType,
    originPt,
    minGridArea,
    minTokArea,
    originTokID,
    pathID,
    pageID,
    fxType,
    saveFormula,
    saveName,
    ignoreAttr,
    ignoreVal,
    DC,
    noSave,
    damageBar,
    autoApply,
    damageFormula1,
    damageFormula2,
    damageBase1,
    damageBase2,
    damageType1,
    damageType2,
    rollDamage1,
    rollDamage2,
    damageSaveRule,
    resistanceRule,
    vulnerableRule,
    immunityRule,
    resistAttrs,
    vulnerableAttrs,
    immunityAttrs,
    conditionPass,
    conditionFail,
    zeroHPmarker,
    removeAtZero,
    hideNames,
    spawnSound,
    moveSound,
    triggerSound,
    deleteSound,
    cardParameters,
    whisperString,
    whisperAll,
    whisperResults,
    outlineOnly,
    aoeLayer,
    casterCondition,
    casterConditionOnFail,
    affectsCaster,
  ) {
    const link = {
      //tokName: state[scriptName].links.length.toString(),
      controlTokName: controlTokName,
      aoeType: aoeType,
      coneWidth: coneWidth,
      aoeFloat: aoeFloat,
      instant: instant,
      forceIntersection: forceIntersection,
      aoeColor: aoeColor,
      aoeOutlineColor: aoeOutlineColor,
      gridColor: gridColor,
      radius: radius,
      wallWidth: wallWidth,
      fxType: fxType,
      minGridArea: minGridArea,
      minTokArea: minTokArea,
      pageID: pageID,
      originTokID: originTokID,
      controlTokID: controlTokID,
      boundingBox: [], //will be array of pts [UL, UR, LR, LL], defined by the min/max x/y of the affected grid squares
      originType: originType,
      originPts: [originPt],
      originIndex: 0,
      pathIDs: [pathID],
      saveFormula: saveFormula,
      saveName: saveName,
      ignoreAttr: ignoreAttr,
      ignoreVal: ignoreVal,
      DC: DC,
      noSave: noSave,
      damageBar: damageBar,
      autoApply: autoApply,
      damageFormula1: damageFormula1,
      damageFormula2: damageFormula2,
      damageBase1: damageBase1,
      damageBase2: damageBase2,
      damageType1: damageType1,
      damageType2: damageType2,
      rollDamage1: rollDamage1,
      rollDamage2: rollDamage2,
      damageSaveRule: damageSaveRule,
      resistanceRule: resistanceRule,
      vulnerableRule: vulnerableRule,
      immunityRule: immunityRule,
      resistAttrs: resistAttrs,
      vulnerableAttrs: vulnerableAttrs,
      immunityAttrs: immunityAttrs,
      conditionPass: conditionPass,
      conditionFail: conditionFail,
      zeroHPmarker: zeroHPmarker,
      removeAtZero: removeAtZero,
      hideNames: hideNames,
      spawnSound: spawnSound,
      moveSound: moveSound,
      triggerSound: triggerSound,
      deleteSound: deleteSound,
      cardParameters: cardParameters,
      whisperString: whisperString,
      whisperAll: whisperAll,
      whisperResults: whisperResults,
      outlineOnly: outlineOnly,
      aoeLayer: aoeLayer,
      casterCondition: casterCondition,
      casterConditionOnFail: casterConditionOnFail,
      affectsCaster: affectsCaster,
    };

    state[scriptName].links.push(link);
    rememberZeroHPMarkers(zeroHPmarker);
    return link;
  };

  //Return object containing arrays of {[linkObj], [indices]} from state object, given tokenID or pathID based on searchType. Returns undefined if none found.
  //normally an AoEControlToken id is passed, but a potential target token_id can also be passed (fromTarget=true) to find all AoE's that overlap the target's square
  /**
   * Finds AoE links in state. Normally matches links whose control or origin token is the given id. With fromTarget,
   * treats the id as a target token and returns the links on its page whose grid squares cover at least minTokArea of
   * the token.
   * Grid-square paths that no longer exist are skipped.
   *
   * @param {string} ID - Control/origin token id, or a target token id when fromTarget is true.
   * @param {boolean} [fromTarget=false] - Search by area overlap with the target token instead of by id.
   * @returns {{links:object[], indices:number[]}|undefined} Matching links and their indices in state, or undefined
   *   if none are found.
   */
  const getAoELinks = function (ID, fromTarget = false) {
    const linkObjs = [];
    const indices = [];

    if (fromTarget) {
      const tok = getObj('graphic', ID);
      if (!tok) {
        return undefined;
      }
      const tokX = tok.get('left');
      const tokY = tok.get('top');
      const tokWidth = tok.get('width');
      const tokHeight = tok.get('height');
      const tokArea = tokWidth * tokHeight;
      const tokCorners = getCellCoords(tokX, tokY, tokWidth, tokHeight);
      const pageID = tok.get('_pageid');
      const page = getObj('page', pageID);
      if (!page) {
        return undefined;
      }
      const pageGridIncrement = page.get('snapping_increment');

      state[scriptName].links.forEach((link, index) => {
        if (link.pageID === pageID) {
          let totalOverlapArea = 0;
          (link.pathIDs || []).forEach((pid) => {
            const path = getObj('path', pid);

            //skip paths that no longer exist (deleted by hand, page copied, etc.). A stale AoE used to
            //throw "Cannot read properties of undefined (reading 'get')" and break every Trigger-Target
            //only check grid squares, not the outer AoE boundary path
            if (path && path.get('width') * path.get('height') <= 4900 * pageGridIncrement) {
              const gridSq = getCellCoords(path.get('left'), path.get('top'), path.get('width'), path.get('height'));
              const overlapArea = calcRectangleOverlapArea(gridSq, tokCorners);
              totalOverlapArea += overlapArea;
            }
          });
          if (totalOverlapArea >= link.minTokArea * tokArea) {
            linkObjs.push(link);
            indices.push(index);
          }
        }
      });
    } else {
      state[scriptName].links.forEach((link, index) => {
        if (link.controlTokID === ID || link.originTokID === ID) {
          linkObjs.push(link);
          indices.push(index);
        }
      });
    }

    if (linkObjs.length > 0) {
      const retVal = {
        links: linkObjs,
        indices: indices,
      };
      return retVal;
    } else {
      return undefined;
    }
  };

  // ————— TOKENS & PATHS —————
  /**
   * Creates one or two control tokens on the objects layer from a default-token JSON, at the given position and size,
   * optionally setting tooltip and side.
   * Whispers an error and returns early if the image is not in a Roll20 library or the requested side is invalid.
   *
   * @param {string} who - Player name used in error whispers.
   * @param {string} tokenJSON - Default token JSON of the control token character.
   * @param {string} pageID - Page to create the token(s) on.
   * @param {number} spawnX - Left (centre x) in pixels.
   * @param {number} spawnY - Top (centre y) in pixels.
   * @param {number} size - Width and height in pixels.
   * @param {string} controlledby - Comma-separated player ids that control the token.
   * @param {boolean} isDrawing - Whether the token is marked as a drawing.
   * @param {number|string} currentSideNew - 1-based side to show, a non-number for a random side, or -999 to leave
   *   unchanged.
   * @param {string} tooltip - Tooltip text; '' for none.
   * @param {number} [numSpawns=1] - Number of tokens to create (1 or 2).
   * @returns {Promise<object[]|undefined>} The created Roll20 graphic (token) objects, or undefined on error.
   */
  const spawnTokenAtXY = async function (
    who,
    tokenJSON,
    pageID,
    spawnX,
    spawnY,
    size,
    controlledby,
    isDrawing,
    currentSideNew,
    tooltip,
    numSpawns = 1,
  ) {
    let controlTok;
    let controlTok2;
    const controlToks = [];
    let sidesArr;
    const whisperString = `/w "${who}"`;

    try {
      const baseObj = JSON.parse(tokenJSON);

      //set token properties
      baseObj.pageid = pageID;
      baseObj.left = spawnX;
      baseObj.top = spawnY;
      baseObj.width = size;
      baseObj.height = size;
      baseObj.controlledby = controlledby;
      baseObj.isdrawing = isDrawing;
      baseObj.layer = 'objects';

      if (tooltip !== '') {
        baseObj.tooltip = tooltip;
        baseObj.show_tooltip = true;
      }

      baseObj.imgsrc = getCleanImgsrc(baseObj.imgsrc); //ensure that we're using the thumb.png

      //image must exist in personal Roll20 image library
      if (baseObj.imgsrc === undefined) {
        sendChat(
          scriptName,
          `${whisperString} Unable to find imgsrc for default token of \(${baseObj.name}\)<br> You must use an image file that has been uploaded to your Roll20 Library.`,
        );
        return;
      }

      if (baseObj.hasOwnProperty('sides')) {
        sidesArr = baseObj['sides'].split('|');

        if (currentSideNew !== -999 && sidesArr[0] !== '') {
          //check for random side
          if (isNaN(currentSideNew)) {
            currentSideNew = randomInteger(sidesArr.length) - 1; // Setting to random side. currentSide is 1-based for user
          } else {
            currentSideNew = parseInt(currentSideNew) - 1; //currentSide is 1-based for user
          }

          //set the current side, if it exists (was "> 0 ||", which let any number through and failed on a missing side)
          if (currentSideNew >= 0 && currentSideNew <= sidesArr.length - 1) {
            const newSideImg = getCleanImgsrc(sidesArr[currentSideNew]); //URL of the image
            baseObj['currentSide'] = currentSideNew;
            baseObj['imgsrc'] = newSideImg;
          } else {
            sendChat(
              scriptName,
              `${whisperString} Error: the control token has no side ${currentSideNew + 1} (it has ${sidesArr.length}).`,
            );
            return; //(previously returned an unrelated shared variable)
          }
        }
      }

      controlTok = await createObj('graphic', baseObj);
      controlToks.push(controlTok);
      if (numSpawns === 2) {
        controlTok2 = await createObj('graphic', baseObj);
        controlToks.push(controlTok2);
      }
      return controlToks;
    } catch (err) {
      sendChat(scriptName, `${whisperString} Unhandled exception: ${err.message}`);
    }
  };

  /**
   * Builds the Roll20 path JSON for a D&D 5e flat cone (a triangle from the origin), adding invisible corner points
   * so the path's bounding box stays square and centred on the origin.
   *
   * @param {number} rad - Cone length in pixels.
   * @param {number} z - Extra radius so the cone's far corners fit (rad/(2*sin(atan(0.5))) - rad).
   * @param {number} coneWidth - Cone angle in degrees.
   * @param {number} coneDirection - Direction in degrees (0 = up, clockwise).
   * @returns {string} Path JSON string for createObj('path').
   */
  const build5eCone = function (rad, z, coneWidth, coneDirection) {
    let pointsJSON = '';
    const deg2rad = Math.PI / 180;
    //see above for details of what "z" is

    const ptOrigin = new pt(rad + z, rad + z);
    const ptUL = new pt(0, 0);
    const ptUR = new pt(2 * (rad + z), 0);
    const ptLR = new pt(2 * (rad + z), 2 * (rad + z));
    const ptLL = new pt(0, 2 * (rad + z));

    //normalize rotation to 360deg and find defining angles (converted to radians)

    coneDirection = normalizeTo360deg(coneDirection);

    //define "cone" angles (in degrees)
    const th1 = deg2rad * (coneDirection - coneWidth / 2); //angle of trailing cone side
    const th2 = deg2rad * (coneDirection + coneWidth / 2); //angle of leading cone side

    //a 5e cone is defined by the orgin and two pts
    const pt1 = get5eConePathPt(rad + z, th1);
    const pt2 = get5eConePathPt(rad + z, th2);

    //start path at the origin pt, connect to pts 1&2, then back to origin
    pointsJSON = `[[\"M\",${ptOrigin.x},${ptOrigin.y}],[\"L\",${pt1.x},${pt1.y}],[\"L\",${pt2.x},${pt2.y}],[\"L\",${ptOrigin.x},${ptOrigin.y}],`;
    //add "phantom" single points to path corresponding to the four corners to keep the size computations correct
    pointsJSON =
      pointsJSON +
      `[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUL.x},${ptUL.y}],[\"M\",${ptUR.x},${ptUR.y}],[\"L\",${ptUR.x},${ptUR.y}],[\"M\",${ptLR.x},${ptLR.y}],[\"L\",${ptLR.x},${ptLR.y}],[\"M\",${ptLL.x},${ptLL.y}],[\"L\",${ptLL.x},${ptLL.y}],[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUL.x},${ptUL.y}]]`;

    return pointsJSON;
  };

  /**
   * Converts degrees to radians.
   *
   * @param {number} degrees - Angle in degrees.
   * @returns {number} Angle in radians.
   */
  const degreesToRadians = function (degrees) {
    const pi = Math.PI;
    return degrees * (pi / 180);
  };

  //cx, cy = coordinates of the center of rotation
  /**
   * Rotates a point around a centre by the given angle. Changes the passed point in place and also returns it.
   *
   * @param {number} cX - X of the centre of rotation.
   * @param {number} cY - Y of the centre of rotation.
   * @param {number} angle - Rotation in radians.
   * @param {{x:number, y:number}} p - Point to rotate (changed in place).
   * @returns {{x:number, y:number}} The same, rotated, point.
   */
  const rotatePoint = function (cX, cY, angle, p) {
    s = Math.sin(angle);
    c = Math.cos(angle);

    // translate point back to origin:
    p.x -= cX;
    p.y -= cY;

    // rotate point
    newX = p.x * c - p.y * s;
    newY = p.x * s + p.y * c;

    // translate point back:
    p.x = newX + cX;
    p.y = newY + cY;

    return p;
  };

  /**
   * Works out the geometry of a rectangular wall AoE that runs from the origin towards the control token: its rotated
   * corners, centre, circumscribing box size, extreme points, and a slightly enlarged polygon for hit tests.
   *
   * @param {pt} originPtPx - Wall origin in pixels.
   * @param {pt} controlPtPx - Control token position in pixels; sets the wall angle (and length when variable).
   * @param {number|string} radius - Wall length in pixels, or 'variable' to use the origin-to-control distance.
   * @param {number} wallWidth - Wall thickness in pixels.
   * @returns {object} {width, angle, radius, pt1..pt4, pMinX, pMaxX, pMinY, pMaxY, pCenter, widthBB, heightBB,
   *   expandedPolygon}.
   */
  const getWallParams = function (originPtPx, controlPtPx, radius, wallWidth) {
    let rad = radius;
    if (radius === 'variable') {
      rad = distBetweenPts(originPtPx, controlPtPx);
    }

    const wallAngle = getAngle2ControlToken(originPtPx, controlPtPx);
    const wallAngleRad = degreesToRadians(wallAngle);

    //get map coords of wall boundary, rotated around the originPt
    //first, get unrotated rectangle corner and center points
    const pt1_0 = new pt(originPtPx.x, originPtPx.y - wallWidth / 2);
    const pt2_0 = new pt(originPtPx.x + rad, originPtPx.y - wallWidth / 2);
    const pt3_0 = new pt(originPtPx.x + rad, originPtPx.y + wallWidth / 2);
    const pt4_0 = new pt(originPtPx.x, originPtPx.y + wallWidth / 2);
    const pCenter_0 = new pt(originPtPx.x + rad / 2, originPtPx.y);

    //then rotate these points around the originPt
    const pt1 = rotatePoint(originPtPx.x, originPtPx.y, wallAngleRad - (90 * Math.PI) / 180, pt1_0);
    const pt2 = rotatePoint(originPtPx.x, originPtPx.y, wallAngleRad - (90 * Math.PI) / 180, pt2_0);
    const pt3 = rotatePoint(originPtPx.x, originPtPx.y, wallAngleRad - (90 * Math.PI) / 180, pt3_0);
    const pt4 = rotatePoint(originPtPx.x, originPtPx.y, wallAngleRad - (90 * Math.PI) / 180, pt4_0);
    const pCenter = rotatePoint(originPtPx.x, originPtPx.y, wallAngleRad - (90 * Math.PI) / 180, pCenter_0);

    //now, get dimensions of the rectangle circumscribing the rotated wall rectangle
    const minX = Math.min(pt1.x, pt2.x, pt3.x, pt4.x);
    const maxX = Math.max(pt1.x, pt2.x, pt3.x, pt4.x);
    const minY = Math.min(pt1.y, pt2.y, pt3.y, pt4.y);
    const maxY = Math.max(pt1.y, pt2.y, pt3.y, pt4.y);
    const widthBB = maxX - minX;
    const heightBB = maxY - minY;

    //find pts with minX, maxX, minY, MaxY
    const ptsArr = [pt1, pt2, pt3, pt4];
    const pMinX = ptsArr.reduce(function (prev, curr) {
      return prev.x < curr.x ? prev : curr;
    });
    const pMaxX = ptsArr.reduce(function (prev, curr) {
      return prev.x > curr.x ? prev : curr;
    });
    const pMinY = ptsArr.reduce(function (prev, curr) {
      return prev.y < curr.y ? prev : curr;
    });
    const pMaxY = ptsArr.reduce(function (prev, curr) {
      return prev.y > curr.y ? prev : curr;
    });

    //here we are going to create a new polygon that is s (10px) wider on each side.
    //      This is to help overcome the floating point error issues with the isPointInPolygon function
    const s = 10;
    let tempPt1 = { x: pt1_0.x - s, y: pt1_0.y - s };
    let tempPt2 = { x: pt2_0.x + s, y: pt2_0.y - s };
    let tempPt3 = { x: pt3_0.x + s, y: pt3_0.y + s };
    let tempPt4 = { x: pt4_0.x - s, y: pt4_0.y + s };
    tempPt1 = rotatePoint(originPtPx.x, originPtPx.y, wallAngleRad - (90 * Math.PI) / 180, tempPt1);
    tempPt2 = rotatePoint(originPtPx.x, originPtPx.y, wallAngleRad - (90 * Math.PI) / 180, tempPt2);
    tempPt3 = rotatePoint(originPtPx.x, originPtPx.y, wallAngleRad - (90 * Math.PI) / 180, tempPt3);
    tempPt4 = rotatePoint(originPtPx.x, originPtPx.y, wallAngleRad - (90 * Math.PI) / 180, tempPt4);
    const expandedPolygon = [tempPt1, tempPt2, tempPt3, tempPt4, tempPt1];

    return {
      width: wallWidth,
      angle: wallAngle,
      radius: rad,
      pt1: pt1, //the corner pts
      pt2: pt2,
      pt3: pt3,
      pt4: pt4,
      pMinX: pMinX, //corner pt with smallest X value
      pMaxX: pMaxX, //corner pt with largest X value
      pMinY: pMinY, //corner pt with smallest Y value
      pMaxY: pMaxY, //corner pt with largest Y value
      pCenter: pCenter, //the geometric center of the rotated wall
      widthBB: widthBB, //the width of the rectangle circumscribing the wall
      heightBB: heightBB, //the height of the rectangle circumscribing the wall
      expandedPolygon: expandedPolygon, //a rectangle that is s (10px) wider on each side. This polygon is rotated already
    };
  };

  //The bounding box of the path will be a square with side lengths equal to the diagonal of the wall rectangle
  /**
   * Builds the Roll20 path JSON for a wall: a closed rectangle through the four corner points from getWallParams.
   *
   * @param {object} wallParams - Result of getWallParams (uses pt1..pt4).
   * @returns {string} Path JSON string for createObj('path').
   */
  const buildWallPath = function (wallParams) {
    const pt1 = wallParams.pt1;
    const pt2 = wallParams.pt2;
    const pt3 = wallParams.pt3;
    const pt4 = wallParams.pt4;
    //Full rectangle (5 pts - wraps back around to pt1 again)
    const wallPointsJSON = `[[\"M\",${pt1.x},${pt1.y}],[\"L\",${pt2.x},${pt2.y}],[\"L\",${pt3.x},${pt3.y}],[\"L\",${pt4.x},${pt4.y}],[\"L\",${pt1.x},${pt1.y}]]`;

    return wallPointsJSON;
  };

  /**
   * Builds the Roll20 path JSON for a closed square with sides of 2*rad, starting at the local origin (0,0).
   *
   * @param {number} rad - Half the side length in pixels.
   * @returns {string} Path JSON string for createObj('path').
   */
  const buildSquarePath = function (rad) {
    const ptUL = new pt(0, 0);
    const ptUR = new pt(2 * rad, 0);
    const ptLR = new pt(2 * rad, 2 * rad);
    const ptLL = new pt(0, 2 * rad);

    //Full square
    const squarePointsJSON = `[[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUR.x},${ptUR.y}],[\"L\",${ptLR.x},${ptLR.y}],[\"L\",${ptLL.x},${ptLL.y}],[\"L\",${ptUL.x},${ptUL.y}]]`;

    return squarePointsJSON;
  };

  //Circle building portion of function is modified from TheAaron's "dlcircle" script
  /**
   * Builds the Roll20 path JSON for a circle (coneWidth 360) or a round-ended cone of the given angle, inside a 2*rad
   * square. Cones get invisible corner points to keep the bounding box square.
   * Circle code is adapted from TheAaron's dlcircle script.
   *
   * @param {number} rad - Radius in pixels.
   * @param {number} coneWidth - Cone angle in degrees; 360 draws a full circle.
   * @param {number} coneDirection - Cone direction in degrees (0 = up, clockwise); ignored for circles.
   * @returns {string} Path JSON string for createObj('path').
   */
  const buildCirclePath = function (rad, coneWidth, coneDirection) {
    let circlePoints;
    let steps, stepSize;
    const deg2rad = Math.PI / 180;

    steps = Math.min(Math.max(Math.round((Math.PI * 2 * Math.sqrt((2 * rad * rad) / 2)) / 35), 4), 20);

    const at = (theta) => ({ x: Math.cos(theta) * rad, y: Math.sin(theta) * rad });

    if (coneWidth === 360) {
      //Build a full circle
      stepSize = Math.PI / (2 * steps);

      let acc = [[], [], [], []];
      let th = 0;
      _.times(steps + 1, () => {
        const pt = at(th);
        acc[0].push([pt.x, pt.y]);
        acc[1].push([-pt.x, pt.y]);
        acc[2].push([-pt.x, -pt.y]);
        acc[3].push([pt.x, -pt.y]);
        th += stepSize;
      });
      acc = acc[0].concat(acc[1].reverse().slice(1), acc[2].slice(1), acc[3].reverse().slice(1));

      //Some js wizardry from TheAaron with the array map function. I couldn't make it work without returning the outer (1st & last) square brackets
      //So, we will take this string, strip the last "]", then append the grid points to the path
      circlePoints = JSON.stringify(acc.map((v, i) => [i ? 'L' : 'M', rad + v[0], rad + v[1]]));
      circlePoints = circlePoints.substring(0, circlePoints.length - 1);
    } else {
      //build a cone instead
      steps = 50;
      stepSize = deg2rad * (coneWidth / steps);

      const oX = rad;
      const oY = rad;
      let x, y;
      const startAngle = deg2rad * (coneDirection - coneWidth / 2);
      const endAngle = deg2rad * (coneDirection + coneWidth / 2);
      const ptUL = new pt(0, 0);
      const ptUR = new pt(2 * rad, 0);
      const ptLR = new pt(2 * rad, 2 * rad);
      const ptLL = new pt(0, 2 * rad);

      //start path at the origin pt
      circlePoints = `[[\"M\",${oX},${oY}],`;

      //for loop takes into account cumulative floating point precision error
      for (let th = startAngle; th < endAngle + Number.EPSILON * steps; th += stepSize) {
        //change in "normal" polar coord conversion due to 0deg being straight up and positive Y being "down"
        x = oX + oX * Math.sin(th);
        y = oY + oY * Math.cos(th + deg2rad * 180);
        circlePoints = circlePoints + `[\"L\",${x},${y}],`;
      }

      //connect back to the origin pt
      circlePoints = circlePoints + `[\"L\",${oX},${oY}],`;
      //add "phantom" single points to path corresponding to the four corners to keep the size computations correct
      circlePoints =
        circlePoints +
        `[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUL.x},${ptUL.y}],[\"M\",${ptUR.x},${ptUR.y}],[\"L\",${ptUR.x},${ptUR.y}],[\"M\",${ptLR.x},${ptLR.y}],[\"L\",${ptLR.x},${ptLR.y}],[\"M\",${ptLL.x},${ptLL.y}],[\"L\",${ptLL.x},${ptLL.y}],[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUL.x},${ptUL.y}]`;
    }

    return circlePoints + ']';
  };

  /**
   * Removes the Roll20 path objects with the given ids from the board, skipping any that no longer exist. Does not
   * change the link stored in state.
   *
   * @param {string[]} pathIDs - Ids of the paths to remove.
   * @returns {Promise<void>} Resolves once all removals have been requested.
   */
  async function deleteLinkedPaths(pathIDs) {
    //delete the linked paths and clear the pathIDs array from the state object
    //uses its own variable: it used to overwrite the shared "path" that AoE creation was still using
    pathIDs.forEach((pathID) => {
      const oldPath = getObj('path', pathID);
      if (oldPath) {
        oldPath.remove();
      }
    });
  }

  /**
   * Creates a Roll20 path object on the given page with the supplied geometry and styling. Side effect: adds a new
   * path to the tabletop.
   *
   * @param {string} pathstring - Roll20 path data (JSON-encoded array of SVG-like commands, e.g.
   *   [["M",x,y],["L",x,y]]).
   * @param {string} pageID - ID of the page to draw on.
   * @param {string} layer - Layer name ('objects', 'map', 'gmlayer', 'walls').
   * @param {string} fillColor - Fill colour (hex or 'transparent').
   * @param {string} strokeColor - Stroke colour (hex or 'transparent').
   * @param {number} strokeWidth - Stroke width in pixels.
   * @param {number} height - Bounding-box height in pixels.
   * @param {number} width - Bounding-box width in pixels.
   * @param {number} left - X of the path centre in pixels.
   * @param {number} top - Y of the path centre in pixels.
   * @returns {object} The created Roll20 path object.
   */
  const createPath = function (
    pathstring,
    pageID,
    layer,
    fillColor,
    strokeColor,
    strokeWidth,
    height,
    width,
    left,
    top,
  ) {
    const path = createObj('path', {
      pageid: pageID,
      path: pathstring,
      fill: fillColor,
      stroke: strokeColor,
      layer: layer,
      stroke_width: strokeWidth,
      width: width,
      height: height,
      left: left,
      top: top,
    });
    return path;
  };

  // ————— GEOMETRY —————
  /**
   * Wraps an angle in degrees into the range [0, 360).
   *
   * @param {number} deg - Angle in degrees (may be negative or above 360).
   * @returns {number} Equivalent angle in [0, 360).
   */
  const normalizeTo360deg = function (deg) {
    deg = deg % 360;
    if (deg < 0) {
      deg += 360;
    }
    return deg;
  };

  /**
   * Projects a point at a given distance and bearing from an origin, used to place a line's end point when the AoE
   * has a fixed length. Pixel coordinates; bearing in degrees, 0 = straight up, increasing clockwise (Roll20 y grows
   * downward).
   *
   * @param {pt} oPt - Origin point in pixels.
   * @param {number} rad - Distance from the origin in pixels.
   * @param {number} angle - Bearing in degrees; must be in [0, 360) or nothing is returned.
   * @returns {pt|undefined} The projected point, or undefined if angle is outside [0, 360).
   */
  const getNewControlPt = function (oPt, rad, angle) {
    const deg2rad = Math.PI / 180;
    let smallAngle;
    let retPt;
    angle = normalizeTo360deg(angle); //angles outside 0-360 used to return undefined

    if (angle === 0) {
      retPt = new pt(oPt.x, oPt.y - rad);
    } else if (angle > 0 && angle < 90) {
      smallAngle = angle * deg2rad;
      retPt = new pt(oPt.x + rad * Math.sin(smallAngle), oPt.y - rad * Math.cos(smallAngle));
    } else if (angle === 90) {
      retPt = new pt(oPt.x + rad, oPt.y);
    } else if (angle > 90 && angle < 180) {
      smallAngle = angle * deg2rad - 90 * deg2rad;
      retPt = new pt(oPt.x + rad * Math.cos(smallAngle), oPt.y + rad * Math.sin(smallAngle));
    } else if (angle === 180) {
      retPt = new pt(oPt.x, oPt.y + rad);
    } else if (angle > 180 && angle < 270) {
      smallAngle = angle * deg2rad - 180 * deg2rad;
      retPt = new pt(oPt.x - rad * Math.sin(smallAngle), oPt.y + rad * Math.cos(smallAngle));
    } else if (angle === 270) {
      retPt = new pt(oPt.x - rad, oPt.y);
    } else if (angle > 270 && angle < 360) {
      smallAngle = angle * deg2rad - 270 * deg2rad;
      retPt = new pt(oPt.x - rad * Math.cos(smallAngle), oPt.y - rad * Math.sin(smallAngle));
    }

    return retPt;
  };

  /**
   * Returns the bearing from the origin point to the control point, used as the AoE direction. Degrees, 0 = straight
   * up, increasing clockwise (Roll20 y grows downward).
   *
   * @param {{x:number, y:number}} oPt - Origin point in pixels.
   * @param {{x:number, y:number}} cPt - Control point in pixels.
   * @returns {number} Bearing in degrees in [0, 360); NaN if the two points coincide.
   */
  const getAngle2ControlToken = function (oPt, cPt) {
    const deg2rad = Math.PI / 180;
    let cAngle; //return value (angle from originPt to controlPt)

    if (cPt.x === oPt.x && cPt.y === oPt.y) {
      return 0; //same point: no direction, treat as straight up (was NaN)
    }

    const dX = Math.abs(cPt.x - oPt.x);
    const dY = Math.abs(cPt.y - oPt.y);
    const smallAngle = Math.atan(dY / dX); //this does not take into account the quadrant in which the angle lies. More tests req'd to determine correct relative angle

    if (cPt.x < oPt.x && cPt.y < oPt.y) {
      //UL quadrant
      cAngle = 270 * deg2rad + smallAngle;
    } else if (cPt.x > oPt.x && cPt.y < oPt.y) {
      //UR quadrant
      cAngle = 90 * deg2rad - smallAngle;
    } else if (cPt.x > oPt.x && cPt.y > oPt.y) {
      //LR quadrant
      cAngle = 90 * deg2rad + smallAngle;
    } else if (cPt.x < oPt.x && cPt.y > oPt.y) {
      //LL quadrant
      cAngle = 270 * deg2rad - smallAngle;
    } else if (cPt.x === oPt.x && cPt.y < oPt.y) {
      //straight up
      cAngle = 0 * deg2rad;
    } else if (cPt.x > oPt.x && cPt.y === oPt.y) {
      //straight right
      cAngle = 90 * deg2rad;
    } else if (cPt.x === oPt.x && cPt.y > oPt.y) {
      //straight down
      cAngle = 180 * deg2rad;
    } else if (cPt.x < oPt.x && cPt.y === oPt.y) {
      //straight left
      cAngle = 270 * deg2rad;
    }

    return cAngle / deg2rad; //angle expressed in degrees
  };

  /**
   * Snaps a pixel point to the centre of the grid cell that contains it and expresses that centre in grid units (cell
   * index minus 0.5, so the first cell's centre is 0.5). A cell is 70 * pageGridIncrement pixels wide.
   *
   * @param {{x:number, y:number}} Pt - Point in pixels.
   * @param {number} pageGridIncrement - Page snapping_increment (cells per 70px unit).
   * @returns {pt} Centre of the containing cell, in grid units.
   */
  const convertPtPixels2Units = function (Pt, pageGridIncrement) {
    const closestCellX = Math.ceil(Pt.x / (70 * pageGridIncrement)) * 70 * pageGridIncrement - 35 * pageGridIncrement;
    const closestCellY = Math.ceil(Pt.y / (70 * pageGridIncrement)) * 70 * pageGridIncrement - 35 * pageGridIncrement;

    const newX = closestCellX / (70 * pageGridIncrement);
    const newY = closestCellY / (70 * pageGridIncrement);

    const PtInUnits = new pt(newX, newY);
    return PtInUnits;
  };

  /**
   * Converts parallel arrays of x and y coordinates from grid units to pixels (multiplies by 70 * pageGridIncrement).
   *
   * @param {{xVals:number[], yVals:number[]}} obj - Coordinates in grid units.
   * @param {number} pageGridIncrement - Page snapping_increment.
   * @returns {{xVals:number[], yVals:number[]}} New object with coordinates in pixels.
   */
  const convertLocationsArrUnits2Pixels = function (obj, pageGridIncrement) {
    const newX = obj.xVals.map((val) => val * 70 * pageGridIncrement);
    const newY = obj.yVals.map((val) => val * 70 * pageGridIncrement);
    return { xVals: newX, yVals: newY };
  };

  /**
   * Rasterises a line AoE onto the grid using Bresenham's algorithm, stepping one cell at a time between the two end
   * cells, then converts the result to pixels. Inputs are in grid units (as returned by convertPtPixels2Units) so the
   * output is the pixel centre of each covered cell.
   *
   * @param {number} x1 - Start x in grid units.
   * @param {number} y1 - Start y in grid units.
   * @param {number} x2 - End x in grid units.
   * @param {number} y2 - End y in grid units.
   * @param {number} pageGridIncrement - Page snapping_increment.
   * @returns {{xVals:number[], yVals:number[]}} Pixel centres of the cells the line passes through.
   */
  const getLineLocations = function (x1, y1, x2, y2, pageGridIncrement) {
    let lineCoords = {
      xVals: [],
      yVals: [],
    };
    // Iterators, counters required by algorithm
    let x, y, dx, dy, dx1, dy1, px, py, xe, ye, i;
    // Calculate line deltas
    dx = x2 - x1;
    dy = y2 - y1;
    // Create a positive copy of deltas (makes iterating easier)
    dx1 = Math.abs(dx);
    dy1 = Math.abs(dy);
    // Calculate error intervals for both axis
    px = 2 * dy1 - dx1;
    py = 2 * dx1 - dy1;
    // The line is X-axis dominant
    if (dy1 <= dx1) {
      // Line is drawn left to right
      if (dx >= 0) {
        x = x1;
        y = y1;
        xe = x2;
      } else {
        // Line is drawn right to left (swap ends)
        x = x2;
        y = y2;
        xe = x1;
      }
      //pixel(x, y); // Draw first pixel
      lineCoords.xVals.push(x);
      lineCoords.yVals.push(y);
      // Rasterize the line
      for (i = 0; x < xe; i++) {
        x = x + 1;
        // Deal with octants...
        if (px < 0) {
          px = px + 2 * dy1;
        } else {
          if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
            y = y + 1;
          } else {
            y = y - 1;
          }
          px = px + 2 * (dy1 - dx1);
        }
        // Draw pixel from line span at
        // currently rasterized position
        lineCoords.xVals.push(x);
        lineCoords.yVals.push(y);
      }
    } else {
      // The line is Y-axis dominant
      // Line is drawn bottom to top
      if (dy >= 0) {
        x = x1;
        y = y1;
        ye = y2;
      } else {
        // Line is drawn top to bottom
        x = x2;
        y = y2;
        ye = y1;
      }
      //pixel(x, y); // Draw first pixel
      lineCoords.xVals.push(x);
      lineCoords.yVals.push(y);

      // Rasterize the line
      for (i = 0; y < ye; i++) {
        y = y + 1;
        // Deal with octants...
        if (py <= 0) {
          py = py + 2 * dx1;
        } else {
          if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
            x = x + 1;
          } else {
            x = x - 1;
          }
          py = py + 2 * (dx1 - dy1);
        }
        // Draw pixel from line span at
        // currently rasterized position
        lineCoords.xVals.push(x);
        lineCoords.yVals.push(y);
      }
    }

    lineCoords = convertLocationsArrUnits2Pixels(lineCoords, pageGridIncrement);

    return lineCoords;
  };

  /**
   * Distance between two points in pixels. By default this is straight-line (Euclidean); with calcType 'PF' it
   * applies Pathfinder diagonal rules (every other diagonal counts 1.5 squares), rounded down to whole scale units
   * and converted back to pixels.
   *
   * @param {{x:number, y:number}} pt1 - First point in pixels.
   * @param {{x:number, y:number}} pt2 - Second point in pixels.
   * @param {string} [calcType='Euclidean'] - 'Euclidean' or 'PF'.
   * @param {number} [gridIncrement=-999] - Page snapping_increment; required for 'PF'.
   * @param {number} [scaleNumber=-999] - Page scale_number (units per cell); required for 'PF'.
   * @returns {number} Distance in pixels.
   */
  const distBetweenPts = function (pt1, pt2, calcType = 'Euclidean', gridIncrement = -999, scaleNumber = -999) {
    let distPx; //distance in Pixels
    let distUnits; //distance in units (gridded maps only)
    if (calcType === 'PF' && gridIncrement !== -999 && scaleNumber !== -999) {
      //using 'Pathfinder' distance rules, where every other diagonal unit counts as 1.5 units.
      //..or using 5e diagonal rules where each diag only counts 1 square.
      //..5e is special due to how t is constructed. We use Euclidean distance to determine if in cone, but we can display in 5e units.
      //Only compatible with gridded maps
      //convert from pixels to units, do the funky pathfinder math, then convert back to pixels
      const dX = (Math.abs(pt1.x - pt2.x) * scaleNumber) / 70 / gridIncrement;
      const dY = (Math.abs(pt1.y - pt2.y) * scaleNumber) / 70 / gridIncrement;
      const maxDelta = Math.max(dX, dY);
      const minDelta = Math.min(dX, dY);
      let minFloor1pt5Delta;
      if (calcType === 'PF') {
        //every other diagonal counts as 1.5 squares
        minFloor1pt5Delta = Math.floor(1.5 * minDelta);
      }

      //convert dist back to pixels
      distUnits = Math.floor((maxDelta - minDelta + minFloor1pt5Delta) / scaleNumber) * scaleNumber;
      distPx = (distUnits * 70 * gridIncrement) / scaleNumber;
      //floor( ( maxDelta-minDelta + minFloor1pt5Delta ) /5  )*5

      //  [[ floor((([[{abs((@{position-x}-@{target|Target|position-x})*5/70),abs((@{position-y}-@{target|Target|position-y})*5/70)}kh1]]-
      //  [[{abs((@{position-x}-@{target|Target|position-x})*5/70),abs((@{position-y}-@{target|Target|position-y})*5/70)}kl1]])+
      //  floor(1.5*([[{abs((@{position-x}-@{target|Target|position-x})*5/70),abs((@{position-y}-@{target|Target|position-y})*5/70)}kl1]])))/5)*5]]
    } else {
      //default Pythagorean theorem
      distPx = Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2));
    }

    return distPx;
  };

  /**
   * Calculates the area of a simple polygon with the shoelace formula. Vertices must already be ordered (clockwise or
   * anticlockwise); the polygon is closed automatically.
   *
   * @param {pt[]} vertices - Ordered polygon vertices.
   * @returns {number} Absolute area in square pixels (or the squared units of the input).
   */
  function calcPolygonArea(vertices) {
    //vertices is an array of pts
    //NOTE: vertices must be in clockwise or counter-clockwise order for this to work!!!
    let total = 0;

    for (let i = 0, l = vertices.length; i < l; i++) {
      const addX = vertices[i].x;
      const addY = vertices[i == vertices.length - 1 ? 0 : i + 1].y;
      const subX = vertices[i == vertices.length - 1 ? 0 : i + 1].x;
      const subY = vertices[i].y;

      total += addX * addY * 0.5;
      total -= subX * subY * 0.5;
    }

    return Math.abs(total);
  }

  /**
   * Calculates the overlap area of two axis-aligned rectangles, used to work out how much of a token a grid-cell path
   * covers.
   *
   * @param {pt[]} rect1 - Corners in the order [UL, UR, LR, LL] (as from getCellCoords).
   * @param {pt[]} rect2 - Corners in the same order.
   * @returns {number} Overlap area in square pixels, 0 if they do not overlap.
   */
  const calcRectangleOverlapArea = function (rect1, rect2) {
    //rect 1&2 are arrays of pts [UL, UR, LR, LL], in that order!
    const x_overlap = Math.max(0, Math.min(rect1[1].x, rect2[1].x) - Math.max(rect1[0].x, rect2[0].x));
    const y_overlap = Math.max(0, Math.min(rect1[3].y, rect2[3].y) - Math.max(rect1[0].y, rect2[0].y));
    return x_overlap * y_overlap;
  };

  /**
   * Tests whether two axis-aligned rectangles overlap or touch. Pixel coordinates, y grows downward.
   *
   * @param {{x:number, y:number}} topLeft1 - Upper-left corner of the first rectangle.
   * @param {{x:number, y:number}} bottomRight1 - Lower-right corner of the first rectangle.
   * @param {{x:number, y:number}} topLeft2 - Upper-left corner of the second rectangle.
   * @param {{x:number, y:number}} bottomRight2 - Lower-right corner of the second rectangle.
   * @returns {boolean} True if the rectangles overlap or share an edge.
   */
  const rectanglesOverlap = function (topLeft1, bottomRight1, topLeft2, bottomRight2) {
    if (topLeft1.x > bottomRight2.x || topLeft2.x > bottomRight1.x) {
      return false;
    }
    if (topLeft1.y > bottomRight2.y || topLeft2.y > bottomRight1.y) {
      return false;
    }
    return true;
  };

  //adapted from https://stackoverflow.com/posts/63436180/revisions
  /**
   * Tests whether a point lies inside a polygon using ray casting. Points on a vertex or an edge count as inside.
   * Adapted from https://stackoverflow.com/posts/63436180/revisions.
   *
   * @param {{x:number, y:number}} P - Point to test.
   * @param {{x:number, y:number}[]} polygon - Polygon vertices in order (closing vertex optional).
   * @returns {boolean} True if inside or on the boundary.
   */
  const isPointInPolygon = function (P, polygon) {
    const between = (p, a, b) => (p >= a && p <= b) || (p <= a && p >= b);
    let inside = false;
    for (let i = polygon.length - 1, j = 0; j < polygon.length; i = j, j++) {
      const A = polygon[i];
      const B = polygon[j];
      // corner cases
      if ((P.x == A.x && P.y == A.y) || (P.x == B.x && P.y == B.y)) return true;
      if (A.y == B.y && P.y == A.y && between(P.x, A.x, B.x)) return true;

      if (between(P.y, A.y, B.y)) {
        // if P inside the vertical range
        // filter out "ray pass vertex" problem by treating the line a little lower
        if ((P.y == A.y && B.y >= A.y) || (P.y == B.y && A.y >= B.y)) continue;
        // calc cross product `PA X PB`, P lays on left side of AB if c > 0
        const c = (A.x - P.x) * (B.y - P.y) - (B.x - P.x) * (A.y - P.y);
        if (c == 0) return true;
        if (A.y < B.y == c > 0) inside = !inside;
      }
    }
    return inside ? true : false;
  };

  //*******************************************************************************************************************************
  /* The following is an alternative to the isPointInPolygon function, which appears to be more sensitive to floating point errors
    //*******************************************************************************************************************************
    *
    *       
    *       
    *       
    *       
    */
  //
  /**
   * Squares a number.
   *
   * @param {number} x - Value to square.
   * @returns {number} x * x.
   */
  function sqr(x) {
    return x * x;
  }
  /**
   * Squared Euclidean distance between two points (avoids a square root).
   *
   * @param {{x:number, y:number}} v - First point.
   * @param {{x:number, y:number}} w - Second point.
   * @returns {number} Squared distance.
   */
  function distSquared(v, w) {
    return sqr(v.x - w.x) + sqr(v.y - w.y);
  }
  /**
   * Squared distance from a point to the nearest point on a line segment.
   *
   * @param {{x:number, y:number}} P - Point to test.
   * @param {{x:number, y:number}} endPt1 - First end of the segment.
   * @param {{x:number, y:number}} endPt2 - Second end of the segment.
   * @returns {number} Squared distance to the segment.
   */
  function distToSegmentSquared(P, endPt1, endPt2) {
    const l2 = distSquared(endPt1, endPt2);
    if (l2 === 0) return distSquared(P, endPt1);
    let t = ((P.x - endPt1.x) * (endPt2.x - endPt1.x) + (P.y - endPt1.y) * (endPt2.y - endPt1.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return distSquared(P, { x: endPt1.x + t * (endPt2.x - endPt1.x), y: endPt1.y + t * (endPt2.y - endPt1.y) });
  }
  /**
   * Distance from a point to the nearest point on a line segment.
   *
   * @param {{x:number, y:number}} P - Point to test.
   * @param {{x:number, y:number}} endPt1 - First end of the segment.
   * @param {{x:number, y:number}} endPt2 - Second end of the segment.
   * @returns {number} Distance to the segment.
   */
  function distToSegment(P, endPt1, endPt2) {
    return Math.sqrt(distToSegmentSquared(P, endPt1, endPt2));
  }
  /**
   * Tests whether a point is inside a wall polygon, treating anything within 0.1px of an edge as inside. More
   * tolerant of floating-point error than isPointInPolygon alone.
   *
   * @param {{x:number, y:number}} P - Point to test, in pixels.
   * @param {{x:number, y:number}[]} polygon - Closed polygon (first vertex repeated at the end).
   * @returns {boolean} True if on an edge or inside.
   */
  const isPointInWall = function (P, polygon) {
    //first, look for cases where P lies on one of line segments of the polygon
    for (let i = 0; i < polygon.length - 1; i += 1) {
      const a = polygon[i];
      const b = polygon[i + 1];

      if (distToSegment(P, a, b) < 0.1) {
        return true;
      }
    }
    //If not on a line segment, use normal algorithm
    return isPointInPolygon(P, polygon);
  };

  /**
   * Tests whether a point lies within a cone AoE. Angles are in degrees, 0 = straight up, increasing clockwise;
   * distances in pixels. A 3% tolerance is applied to the radius, and a point at the origin always counts as inside.
   * For flat (5e) cones the limit is the straight outer edge rather than the arc.
   *
   * @param {{x:number, y:number}} pt - Point to test.
   * @param {{x:number, y:number}} oPt - Cone origin.
   * @param {number} rad - Cone length in pixels.
   * @param {number} coneDirection - Centre-line bearing in degrees.
   * @param {number} coneWidth - Full cone angle in degrees.
   * @param {boolean} isFlatCone - True for a 5e-style triangular cone.
   * @param {string} [calcType='Euclidean'] - 'Euclidean' or 'PF' distance rules.
   * @param {number} [gridIncrement=-999] - Page snapping_increment; needed for 'PF'.
   * @param {number} [scaleNumber=-999] - Page scale_number; needed for 'PF'.
   * @returns {boolean} True if the point is inside the cone.
   */
  const isPointInCone = function (
    pt,
    oPt,
    rad,
    coneDirection,
    coneWidth,
    isFlatCone,
    calcType = 'Euclidean',
    gridIncrement = -999,
    scaleNumber = -999,
  ) {
    const deg2rad = Math.PI / 180;
    let pAngle; //the angle between the cone origin and the test pt
    let smallAngle;
    const startAngle = deg2rad * Math.floor(normalizeTo360deg(coneDirection - coneWidth / 2)); //round down to nearest degree to account for flotaing pt errors
    let endAngle = deg2rad * Math.ceil(normalizeTo360deg(coneDirection + coneWidth / 2)); //round down to nearest degree to account for flotaing pt errors
    const centerAngle = deg2rad * normalizeTo360deg(coneDirection);
    let criticalDist;

    //special case: Angle calcs will fail when the pt to check is same as origin point - count this as in the cone.
    if (Math.round(pt.x) === Math.round(oPt.x) && Math.round(pt.y) === Math.round(oPt.y)) {
      return true;
    }

    // Calculate polar co-ordinates
    let polarRadius;

    if (calcType === 'PF' && gridIncrement !== -999 && scaleNumber !== -999) {
      polarRadius = distBetweenPts(oPt, pt, calcType, gridIncrement, scaleNumber);
    } else {
      polarRadius = distBetweenPts(oPt, pt);
    }

    const dX = Math.abs(pt.x - oPt.x);
    const dY = Math.abs(pt.y - oPt.y);

    //calculate "smallAngle" - this does not take into account the quadrant in which the angle lies. More tests req'd to determine correct relative angle
    if (dX === 0) {
      smallAngle = 90 * deg2rad;
    } else {
      smallAngle = Math.atan(dY / dX);
    }

    if (pt.x < oPt.x && pt.y < oPt.y) {
      //UL quadrant
      pAngle = 270 * deg2rad + smallAngle;
    } else if (pt.x > oPt.x && pt.y < oPt.y) {
      //UR quadrant
      pAngle = 90 * deg2rad - smallAngle;
    } else if (pt.x > oPt.x && pt.y > oPt.y) {
      //LR quadrant
      pAngle = 90 * deg2rad + smallAngle;
    } else if (pt.x < oPt.x && pt.y > oPt.y) {
      //LL quadrant
      pAngle = 270 * deg2rad - smallAngle;
    } else if (pt.x === oPt.x && pt.y < oPt.y) {
      //straight up
      pAngle = 0 * deg2rad;
    } else if (pt.x > oPt.x && pt.y === oPt.y) {
      //straight right
      pAngle = 90 * deg2rad;
    } else if (pt.x === oPt.x && pt.y > oPt.y) {
      //straight down
      pAngle = 180 * deg2rad;
    } else if (pt.x < oPt.x && pt.y === oPt.y) {
      //straight left
      pAngle = 270 * deg2rad;
    }

    //2nd test angle: Add 360deg to pAngle (to handle cases where startAngle is a negative value and endAngle is positive)
    const pAngle360 = pAngle + 360 * deg2rad;
    if (endAngle < startAngle) {
      endAngle = endAngle + 360 * deg2rad;
    }

    if (isFlatCone) {
      //for 5e-style cones. Basically a triangle (no rounded outer face)
      //angle between the point and the cone's centre line, the short way round (e.g. 350deg and 10deg are 20deg apart)
      const diff = Math.abs(pAngle - centerAngle);
      const dTheta = Math.min(diff, 2 * Math.PI - diff);
      criticalDist = rad / Math.cos(dTheta);
    } else {
      //compare to full radius cone
      criticalDist = rad;
    }

    const err = 1.03;
    //test pAngle and pAngle360 against start/end Angles
    //        (pAngle360*err >= startAngle) && (pAngle360 <= endAngle*err) && (polarRadius <= criticalDist*err) ) {
    if (
      (pAngle >= startAngle && pAngle <= endAngle && polarRadius <= criticalDist * err) ||
      (pAngle360 >= startAngle && pAngle360 <= endAngle && polarRadius <= criticalDist * err)
    ) {
      return true;
    } else {
      return false;
    }
  };

  // Returns intersection of two line segments.
  /**
   * Finds the point where two line segments cross, used to clip grid cells against AoE edges.
   *
   * @param {number} p0_x - Segment 1 start x.
   * @param {number} p0_y - Segment 1 start y.
   * @param {number} p1_x - Segment 1 end x.
   * @param {number} p1_y - Segment 1 end y.
   * @param {number} p2_x - Segment 2 start x.
   * @param {number} p2_y - Segment 2 start y.
   * @param {number} p3_x - Segment 2 end x.
   * @param {number} p3_y - Segment 2 end y.
   * @returns {{x:number, y:number}|null} The intersection, or null if the segments do not cross (parallel or
   *   overlapping segments also give null).
   */
  const getIntersectionPt = function (p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
    const s1_x = p1_x - p0_x;
    const s1_y = p1_y - p0_y;
    const s2_x = p3_x - p2_x;
    const s2_y = p3_y - p2_y;

    const s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    const t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
      // intersection at one point
      const intX = p0_x + t * s1_x;
      const intY = p0_y + t * s1_y;
      return { x: intX, y: intY };
      //    // overlapping vertical lines
      //    // overlapping horizontal lines
    } else {
      // No intersection
      return null;
    }
  };

  /**
   * Projects the end of a cone side from the origin at a given angle and length, rounded to whole pixels. Angle in
   * radians, 0 = straight up, increasing clockwise (Roll20 y grows downward).
   *
   * @param {{x:number, y:number}} oPt - Cone origin in pixels.
   * @param {number} rad - Length in pixels.
   * @param {number} theta - Bearing in radians.
   * @returns {pt} The end point.
   */
  const getConeEndPt = function (oPt, rad, theta) {
    const deg2rad = Math.PI / 180;
    //change in "normal" polar coord conversion due to 0deg being straight up and positive Y being "down"
    const x = Math.round(oPt.x + rad * Math.sin(theta));
    const y = Math.round(oPt.y + rad * Math.cos(theta + deg2rad * 180));
    return new pt(x, y);
  };

  /**
   * Returns the three vertices of a cone: the origin and the ends of its two sides. For a 5e cone the sides are
   * lengthened by z so the flat outer edge sits at the right distance.
   *
   * @param {string} aoeType - AoE type; '5econe' uses the flat-cone geometry.
   * @param {pt} oPt - Cone origin in pixels.
   * @param {number} coneDirection - Centre-line bearing in degrees (0 = up, clockwise).
   * @param {number} coneWidth - Full cone angle in degrees.
   * @param {number} rad - Cone length in pixels.
   * @param {number} z - Extra side length in pixels for 5e cones (0 otherwise).
   * @returns {pt[]} [origin, trailing-side end, leading-side end].
   */
  const getConeEndPts2 = function (aoeType, oPt, coneDirection, coneWidth, rad, z) {
    const deg2rad = Math.PI / 180;
    coneDirection = normalizeTo360deg(coneDirection);
    const th1 = deg2rad * (coneDirection - coneWidth / 2); //angle of trailing cone side
    const th2 = deg2rad * (coneDirection + coneWidth / 2); //angle of leading cone side
    const sideLength = aoeType === '5econe' ? rad + z : rad; //a 5e cone's sides reach past rad to its flat end
    return [oPt, getConeEndPt(oPt, sideLength, th1), getConeEndPt(oPt, sideLength, th2)];
  };

  /**
   * Projects a 5e cone side end relative to a local origin at (rad, rad), for building the cone outline path inside
   * its own bounding box. Not rounded. Angle in radians, 0 = straight up, clockwise.
   *
   * @param {number} rad - Side length in pixels; also the local origin offset.
   * @param {number} theta - Bearing in radians.
   * @returns {pt} The end point in path-local pixel coordinates.
   */
  const get5eConePathPt = function (rad, theta) {
    const deg2rad = Math.PI / 180;
    //change in "normal" polar coord conversion due to 0deg being straight up and positive Y being "down"
    const x = rad + rad * Math.sin(theta);
    const y = rad + rad * Math.cos(theta + deg2rad * 180);
    return new pt(x, y);
  };

  //clockwise ordering of corner points of cell
  /**
   * Returns the corners of a rectangle centred on (i, j), in clockwise order starting at the upper-left, with the
   * first corner repeated to close the shape. Used for grid cells and token footprints.
   *
   * @param {number} i - Centre x in pixels.
   * @param {number} j - Centre y in pixels.
   * @param {number} width - Width in pixels.
   * @param {number} [height=-999] - Height in pixels; defaults to width (a square).
   * @returns {pt[]} [UL, UR, LR, LL, UL].
   */
  const getCellCoords = function (i, j, width, height = -999) {
    if (height === -999) {
      height = width;
    }
    const ptUL = new pt(i - width / 2, j - height / 2);
    const ptUR = new pt(i + width / 2, j - height / 2);
    const ptLR = new pt(i + width / 2, j + height / 2);
    const ptLL = new pt(i - width / 2, j + height / 2);
    const ptUL2 = new pt(i - width / 2, j - height / 2);

    const points = [ptUL, ptUR, ptLR, ptLL, ptUL2]; //note the repeat of ptUL to close the cell
    return points;
  };

  //returns the grid corner that is the farthest away from the origin pt
  /**
   * Returns whichever of the given points is farthest (Euclidean) from the origin. Used for Pathfinder distance
   * checks on grid cells.
   *
   * @param {{x:number, y:number}} oPt - Origin point.
   * @param {pt[]} cornerPts - Candidate points (e.g. a cell's corners).
   * @returns {pt} The farthest point.
   */
  const getFarthestCorner = function (oPt, cornerPts) {
    let maxDist = -999999;
    let farthestPt;
    cornerPts.forEach((pt) => {
      const d = distBetweenPts(oPt, pt);
      if (d > maxDist) {
        maxDist = d;
        farthestPt = pt;
      }
    });
    return farthestPt;
  };

  /**
   * Appends a point to an array only if no point with the same x and y is already there. Mutates arr.
   *
   * @param {{x:number, y:number}[]} arr - Array to add to.
   * @param {{x:number, y:number}} obj - Point to add.
   * @returns {number} 1 if added, 0 if it was a duplicate.
   */
  const pushUniquePtToArray = function (arr, obj) {
    const index = arr.findIndex((e) => e.x === obj.x && e.y === obj.y);
    if (index === -1) {
      arr.push(obj);
      return 1;
    } else {
      return 0;
    }
  };

  /**
   * Appends a value to an array only if it is not already present (strict equality). Mutates arr.
   *
   * @param {Array} arr - Array to add to.
   * @param {*} element - Value to add.
   * @returns {number} 1 if added, 0 if it was a duplicate.
   */
  const pushUniqueElementToArray = function (arr, element) {
    const index = arr.findIndex((e) => e === element);
    if (index === -1) {
      arr.push(element);
      return 1;
    } else {
      return 0;
    }
  };

  /**
   * Orders Roll20 path IDs by the distance of each path's centre from a point, nearest first. IDs of paths that no
   * longer exist are dropped.
   *
   * @param {string[]} pathsArr - Roll20 path object IDs.
   * @param {{x:number, y:number}} oPt - Reference point in pixels.
   * @returns {string[]} The surviving IDs, sorted by distance.
   */
  const sortPathsByDistanceToOrigin = function (pathsArr, oPt) {
    let tempPath;
    let tempPt;
    let dist;

    //populate temp array of objects with pathIDs & dist
    const pathDistID = [];
    pathsArr.forEach((pathID) => {
      tempPath = getObj('path', pathID);
      if (!tempPath) {
        return; //path no longer exists
      }
      tempPt = new pt(tempPath.get('left'), tempPath.get('top'));
      dist = distBetweenPts(tempPt, oPt);
      pathDistID.push({ id: pathID, dist: dist });
    });

    //sort temp array by dist
    const pathDistIDSorted = pathDistID.sort((a, b) => a.dist - b.dist);

    //copy the sorted xy coords to a return array
    const retArr = pathDistIDSorted.map((e) => e.id);
    return retArr;
  };

  /**
   * Sorts points by angle around their centroid so they form a non-self-intersecting polygon (needed before
   * calcPolygonArea). Uses atan2 ascending, which is clockwise on screen because Roll20 y grows downward.
   *
   * @param {{x:number, y:number}[]} ptsArr - Points to sort.
   * @returns {{x:number, y:number}[]} New array of plain {x, y} objects in clockwise order.
   */
  const sortPtsClockwise = function (ptsArr) {
    const center = ptsArr.reduce(
      (acc, { x, y }) => {
        acc.x += x / ptsArr.length;
        acc.y += y / ptsArr.length;
        return acc;
      },
      { x: 0, y: 0 },
    );

    // Add an angle property to each point using tan(angle) = y/x
    const angles = ptsArr.map(({ x, y }) => {
      return { x, y, angle: (Math.atan2(y - center.y, x - center.x) * 180) / Math.PI };
    });

    // Sort your points by angle
    const pointsSorted = angles.sort((a, b) => a.angle - b.angle);

    //copy the sorted xy coords to a return array
    const retArr = pointsSorted.map((pt) => {
      return { x: pt.x, y: pt.y };
    });
    return retArr;
  };

  /**
   * Finds the grid-cell centre nearest to a point, searching only centres within one cell (70 * pageGridIncrement px)
   * on each axis.
   *
   * @param {{x:number, y:number}} testPt - Point in pixels.
   * @param {pt[]} ptArray - Candidate grid-cell centres in pixels.
   * @param {number} pageGridIncrement - Page snapping_increment.
   * @returns {pt|undefined} The nearest centre, or undefined if none is within one cell.
   */
  const getClosestGridPt = function (testPt, ptArray, pageGridIncrement) {
    //first, filter out points in the master array that are farther than 1 unit away
    const arr = ptArray.filter((pt) => {
      if (
        pt.x <= testPt.x + 70 * pageGridIncrement &&
        pt.x >= testPt.x - 70 * pageGridIncrement &&
        pt.y <= testPt.y + 70 * pageGridIncrement &&
        pt.y >= testPt.y - 70 * pageGridIncrement
      ) {
        return true;
      }
    });

    let minDist = 99999;
    let d, idx;
    arr.forEach((pt, i) => {
      d = distBetweenPts(pt, testPt);
      if (d < minDist) {
        minDist = d;
        idx = i;
      }
    });
    return arr[idx];
  };

  //function taken from https://stackoverflow.com/questions/37224912/circle-line-segment-collision/37225895
  /**
   * Finds where a line segment crosses a circle's circumference. Adapted from
   * https://stackoverflow.com/questions/37224912/circle-line-segment-collision/37225895.
   *
   * @param {{x:number, y:number}} pt1 - Segment start.
   * @param {{x:number, y:number}} pt2 - Segment end.
   * @param {{x:number, y:number}} centerPt - Circle centre.
   * @param {number} rad - Circle radius (same units as the points).
   * @returns {{x:number, y:number}[]} Zero, one or two intersection points lying on the segment.
   */
  const getLineCircleIntersections = function (pt1, pt2, centerPt, rad) {
    let b, c, d, u1, u2, ret, retP1, retP2, v1, v2;

    const circle = {
      radius: rad,
      center: centerPt,
    };

    const line = {
      p1: pt1,
      p2: pt2,
    };

    v1 = {};
    v2 = {};
    v1.x = line.p2.x - line.p1.x;
    v1.y = line.p2.y - line.p1.y;
    v2.x = line.p1.x - circle.center.x;
    v2.y = line.p1.y - circle.center.y;
    b = v1.x * v2.x + v1.y * v2.y;
    c = 2 * (v1.x * v1.x + v1.y * v1.y);
    b *= -2;
    d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
    if (isNaN(d)) {
      // no intercept
      return [];
    }
    u1 = (b - d) / c; // these represent the unit distance of point one and two on the line
    u2 = (b + d) / c;
    retP1 = {}; // return points
    retP2 = {};
    ret = []; // return array
    if (u1 <= 1 && u1 >= 0) {
      // add point if on the line segment
      retP1.x = line.p1.x + v1.x * u1;
      retP1.y = line.p1.y + v1.y * u1;
      ret[0] = retP1;
    }
    if (u2 <= 1 && u2 >= 0) {
      // second add point if on the line segment
      retP2.x = line.p1.x + v1.x * u2;
      retP2.y = line.p1.y + v1.y * u2;
      ret[ret.length] = retP2;
    }
    return ret;
  };

  /**
   * Tests whether a point is within a circle, flooring the distance to the nearest pixel to absorb floating-point
   * error.
   *
   * @param {{x:number, y:number}} pt - Point to test, in pixels.
   * @param {{x:number, y:number}} centerPt - Circle centre, in pixels.
   * @param {number} rad - Radius in pixels.
   * @returns {boolean} True if inside or on the circle.
   */
  const isPointInCircle = function (pt, centerPt, rad) {
    const d = Math.floor(distBetweenPts(pt, centerPt)); //rounded down to nearest pixel to account for floating point errors
    return d <= rad;
  };

  /**
   * Grid-cell bounds of a search box: the centres of the cells nearest its two corners.
   *
   * @param {pt} minPt - Upper-left corner of the box, in pixels.
   * @param {pt} maxPt - Lower-right corner of the box, in pixels.
   * @param {pt[]} pageGridCenters - Every grid-cell centre on the page.
   * @param {number} pageGridIncrement - Page snapping_increment.
   * @returns {{minX:number, maxX:number, minY:number, maxY:number}} Centre coordinates of the outermost cells.
   */
  const getGridBounds = function (minPt, maxPt, pageGridCenters, pageGridIncrement) {
    return {
      minX: getClosestGridPt(minPt, pageGridCenters, pageGridIncrement).x,
      maxX: getClosestGridPt(maxPt, pageGridCenters, pageGridIncrement).x,
      minY: getClosestGridPt(minPt, pageGridCenters, pageGridIncrement).y,
      maxY: getClosestGridPt(maxPt, pageGridCenters, pageGridIncrement).y,
    };
  };

  /**
   * Grid-cell bounds of the box around an AoE origin, widened by the origin offset on each axis so it covers the whole
   * AoE (circles, squares and cones).
   *
   * @param {pt} oPt - AoE origin (already including any offset from the token centre).
   * @param {number} radX - Horizontal half-size of the AoE, in pixels.
   * @param {number} radY - Vertical half-size of the AoE, in pixels.
   * @param {number} offsetX - Horizontal origin offset, in pixels.
   * @param {number} offsetY - Vertical origin offset, in pixels.
   * @param {pt[]} pageGridCenters - Every grid-cell centre on the page.
   * @param {number} pageGridIncrement - Page snapping_increment.
   * @returns {{minX:number, maxX:number, minY:number, maxY:number}} Centre coordinates of the outermost cells.
   */
  const getOriginGridBounds = function (oPt, radX, radY, offsetX, offsetY, pageGridCenters, pageGridIncrement) {
    const searchX = radX + Math.abs(offsetX || 0);
    const searchY = radY + Math.abs(offsetY || 0);
    return getGridBounds(
      new pt(oPt.x - searchX, oPt.y - searchY),
      new pt(oPt.x + searchX, oPt.y + searchY),
      pageGridCenters,
      pageGridIncrement,
    );
  };

  /**
   * Works out which grid cells inside the given bounds an AoE covers. This is the shared engine behind the circle,
   * square, wall and cone shapes, which differ only in the tests they pass in:
   *  - a cell whose four corners are all inside is kept;
   *  - otherwise the points where the AoE's edge crosses each side of the cell (top, right, bottom, left) are added to
   *    the cell, plus any AoE vertices inside the cell. With fewer than two such points the cell is dropped (unless
   *    keepUncrossed keeps it); otherwise the cell is clipped to the AoE and kept if the covered area is at least
   *    minGridArea of a cell.
   *
   * @param {object} shape - The AoE's tests.
   * @param {function(pt):boolean} shape.isCornerInside - Whether a cell corner is inside the AoE.
   * @param {function(pt):boolean} [shape.isPointInside=shape.isCornerInside] - Whether a clipped point is kept.
   * @param {function(pt, pt):pt[]} shape.edgeCrossings - Where the AoE's edge crosses the cell side from a to b.
   *   (called with the side index as a third argument).
   * @param {pt[]} [shape.vertices=[]] - AoE corner points to add when they fall inside a cell.
   * @param {function(pt[]):boolean} [shape.keepUncrossed] - For a partly covered cell with fewer than two crossing
   *   points: return true to keep it anyway (gets the cell's corner points). Used for circles smaller than a cell.
   * @param {pt} [shape.farFrom] - If given, each cell records its corner farthest from this point (PF distances).
   * @param {{minX:number, maxX:number, minY:number, maxY:number}} bounds - Centres of the outermost cells to test.
   * @param {number} minGridArea - Minimum covered fraction of a cell (0-1).
   * @param {number} pageGridIncrement - Page snapping_increment.
   * @returns {{center:pt, farthestCorner:(pt|undefined)}[]} The covered cells.
   */
  const getCoveredCells = function (shape, bounds, minGridArea, pageGridIncrement) {
    const cellSize = 70 * pageGridIncrement;
    const isPointInside = shape.isPointInside || shape.isCornerInside;
    const vertices = shape.vertices || [];
    const covered = [];

    //columns, then rows, as the shapes always did (the order of the returned cells is kept)
    for (let i = bounds.minX; i <= bounds.maxX; i = i + cellSize) {
      for (let j = bounds.minY; j <= bounds.maxY; j = j + cellSize) {
        const corners = getCellCoords(i, j, cellSize); //[UL, UR, LR, LL, UL] (UL repeated to close the cell)
        const cell = {
          center: new pt(i, j),
          farthestCorner: shape.farFrom ? getFarthestCorner(shape.farFrom, corners) : undefined,
        };

        if (corners.slice(0, 4).every((c) => shape.isCornerInside(c))) {
          covered.push(cell); //fully inside
          continue;
        }

        //partly covered (or not at all): collect the AoE edge crossings on each side of the cell
        let points = corners.slice();
        let numAddedPts = 0;
        for (let side = 0; side < 4; side++) {
          const sideCrossings = [];
          shape.edgeCrossings(corners[side], corners[side + 1], side).forEach((p) => {
            if (p) pushUniquePtToArray(sideCrossings, p);
          });
          sideCrossings.forEach((p) => points.push(p));
          numAddedPts += sideCrossings.length;
        }
        //and the AoE's own corners that sit inside this cell
        vertices.forEach((v) => {
          if (isPointInPolygon(v, corners)) {
            numAddedPts += pushUniquePtToArray(points, v); //1 if added, 0 if already there
          }
        });

        points = sortPtsClockwise(points);

        if (numAddedPts < 2) {
          //must have two crossing points to calculate an area
          if (shape.keepUncrossed && shape.keepUncrossed(corners)) {
            covered.push(cell);
          }
          continue;
        }

        //clip the cell to the AoE, then measure what is left
        points = sortPtsClockwise(points.filter((p) => isPointInside(p)));
        const area = calcPolygonArea(points);
        if (area >= minGridArea * 70 * 70 * pageGridIncrement * pageGridIncrement) {
          covered.push(cell);
        }
      }
    }
    return covered;
  };

  /**
   * Crossing points of the cell side a-b with each of the given straight AoE edges.
   *
   * @param {pt} a - Start of the cell side.
   * @param {pt} b - End of the cell side.
   * @param {pt[][]} edges - AoE edges as [start, end] pairs.
   * @returns {Array<pt|null>} One entry per edge (null where they don't cross).
   */
  const getSegmentCrossings = function (a, b, edges) {
    return edges.map(([p, q]) => getIntersectionPt(a.x, a.y, b.x, b.y, p.x, p.y, q.x, q.y));
  };

  /**
   * Turns a list of covered cells into the {xVals, yVals} lists of cell centres that the path drawing uses.
   *
   * @param {{center:pt}[]} cells - Covered cells, in order.
   * @returns {{xVals:number[], yVals:number[]}} Pixel centres of the cells.
   */
  const cellsToCoords = function (cells) {
    return {
      xVals: cells.map((c) => c.center.x),
      yVals: cells.map((c) => c.center.y),
    };
  };

  /**
   * Works out which grid cells a circle AoE covers. Cells fully inside are kept; partly covered cells are clipped to
   * the circle and kept if the covered area is at least minGridArea of a cell. A circle smaller than a cell that sits
   * inside it keeps that cell. For 'PFcircle', cells must also pass a Pathfinder distance check (cell centre, or
   * farthest corner if forceIntersection). All values in pixels.
   *
   * @param {pt[]} pageGridCenters - Every grid-cell centre on the page.
   * @param {string} aoeType - 'circle' or 'PFcircle'.
   * @param {number} minGridArea - Minimum covered fraction of a cell (0-1).
   * @param {pt} oPt - Circle centre.
   * @param {number} rad - Radius in pixels.
   * @param {number} pageGridIncrement - Page snapping_increment.
   * @param {number} pageScaleNumber - Page scale_number, for PF distances.
   * @param {number} offsetX - Horizontal origin offset from the token centre; widens the search box.
   * @param {number} offsetY - Vertical origin offset; widens the search box.
   * @param {boolean} forceIntersection - For 'PFcircle', test the farthest corner instead of the centre.
   * @returns {{xVals:number[], yVals:number[]}} Pixel centres of the covered cells.
   */
  const getCircleLocations = function (
    pageGridCenters,
    aoeType,
    minGridArea,
    oPt,
    rad,
    pageGridIncrement,
    pageScaleNumber,
    offsetX,
    offsetY,
    forceIntersection,
  ) {
    const cellArea = 70 * 70 * pageGridIncrement * pageGridIncrement;
    const bounds = getOriginGridBounds(oPt, rad, rad, offsetX, offsetY, pageGridCenters, pageGridIncrement);
    let cells = getCoveredCells(
      {
        isCornerInside: (p) => isPointInCircle(p, oPt, rad),
        edgeCrossings: (a, b) => getLineCircleIntersections(a, b, oPt, rad),
        //a circle smaller than a cell can sit inside it without crossing an edge: keep that cell if enough is covered
        keepUncrossed: (corners) =>
          oPt.x - rad >= corners[0].x &&
          oPt.x + rad <= corners[2].x &&
          oPt.y - rad >= corners[0].y &&
          oPt.y + rad <= corners[2].y &&
          Math.PI * rad * rad >= minGridArea * cellArea,
        farFrom: oPt,
      },
      bounds,
      minGridArea,
      pageGridIncrement,
    );

    if (aoeType === 'PFcircle') {
      //one last check to see if the grid square satisfies PF-style distance rules (every other diag counts as 2sq)
      cells = cells.filter((c) => {
        const testPt = forceIntersection ? c.farthestCorner : c.center;
        return distBetweenPts(oPt, testPt, 'PF', pageGridIncrement, pageScaleNumber) <= rad;
      });
    }
    return cellsToCoords(cells);
  };

  /**
   * Works out which grid cells a wall AoE (a rotated rectangle from getWallParams) covers. Cells fully inside are
   * kept; partly covered cells are clipped against the wall polygon and kept if the covered area is at least
   * minGridArea of a cell. All values in pixels.
   *
   * @param {pt[]} pageGridCenters - Every grid-cell centre on the page.
   * @param {number} minGridArea - Minimum covered fraction of a cell (0-1).
   * @param {object} wallParams - From getWallParams: corners pt1-pt4 and extreme points pMinX, pMaxX, pMinY, pMaxY.
   * @param {number} pageGridIncrement - Page snapping_increment.
   * @returns {{xVals:number[], yVals:number[]}} Pixel centres of the covered cells.
   */
  const getWallLocations = function (pageGridCenters, minGridArea, wallParams, pageGridIncrement) {
    const wallAoEPolygon = [wallParams.pt1, wallParams.pt2, wallParams.pt3, wallParams.pt4, wallParams.pt1];
    const wallEdges = [0, 1, 2, 3].map((k) => [wallAoEPolygon[k], wallAoEPolygon[k + 1]]);
    const bounds = {
      minX: getClosestGridPt(wallParams.pMinX, pageGridCenters, pageGridIncrement).x,
      maxX: getClosestGridPt(wallParams.pMaxX, pageGridCenters, pageGridIncrement).x,
      minY: getClosestGridPt(wallParams.pMinY, pageGridCenters, pageGridIncrement).y,
      maxY: getClosestGridPt(wallParams.pMaxY, pageGridCenters, pageGridIncrement).y,
    };
    const cells = getCoveredCells(
      {
        isCornerInside: (p) => isPointInPolygon(p, wallAoEPolygon),
        isPointInside: (p) => isPointInWall(p, wallAoEPolygon), //tolerant of floating-point error on the edges
        edgeCrossings: (a, b) => getSegmentCrossings(a, b, wallEdges),
        vertices: wallAoEPolygon.slice(0, 4),
      },
      bounds,
      minGridArea,
      pageGridIncrement,
    );
    return cellsToCoords(cells);
  };

  /**
   * Works out which grid cells a square AoE covers. The square is centred on the origin with half-width rad, widened
   * by the offsets on each side. Cells fully inside are kept; partly covered cells are clipped and kept if the
   * covered area is at least minGridArea of a cell. All values in pixels.
   *
   * @param {pt[]} pageGridCenters - Every grid-cell centre on the page.
   * @param {number} minGridArea - Minimum covered fraction of a cell (0-1).
   * @param {pt} oPt - Square centre.
   * @param {number} rad - Half the side length in pixels.
   * @param {number} pageGridIncrement - Page snapping_increment.
   * @param {number} offsetX - Horizontal widening, in pixels (also widens the search box).
   * @param {number} offsetY - Vertical widening, in pixels.
   * @returns {{xVals:number[], yVals:number[]}} Pixel centres of the covered cells.
   */
  const getSquareLocations = function (pageGridCenters, minGridArea, oPt, rad, pageGridIncrement, offsetX, offsetY) {
    const squareAoEPolygon = [
      new pt(oPt.x - rad - offsetX, oPt.y - rad - offsetY),
      new pt(oPt.x + rad + offsetX, oPt.y - rad - offsetY),
      new pt(oPt.x + rad + offsetX, oPt.y + rad + offsetY),
      new pt(oPt.x - rad - offsetX, oPt.y + rad + offsetY),
      new pt(oPt.x - rad - offsetX, oPt.y - rad - offsetY),
    ];
    //a horizontal cell side can only cross the square's vertical edges, and a vertical side its horizontal edges
    const verticalEdges = [
      [squareAoEPolygon[1], squareAoEPolygon[2]],
      [squareAoEPolygon[3], squareAoEPolygon[4]],
    ];
    const horizontalEdges = [
      [squareAoEPolygon[0], squareAoEPolygon[1]],
      [squareAoEPolygon[2], squareAoEPolygon[3]],
    ];
    const bounds = getOriginGridBounds(oPt, rad, rad, offsetX, offsetY, pageGridCenters, pageGridIncrement);
    const cells = getCoveredCells(
      {
        isCornerInside: (p) => isPointInPolygon(p, squareAoEPolygon),
        edgeCrossings: (a, b, side) => getSegmentCrossings(a, b, side % 2 === 0 ? verticalEdges : horizontalEdges),
        vertices: squareAoEPolygon.slice(0, 4),
      },
      bounds,
      minGridArea,
      pageGridIncrement,
    );
    return cellsToCoords(cells);
  };

  /**
   * Works out which grid cells a cone covers. Supports 'cone' (round-ended), '5econe' (flat-ended triangle, 53deg)
   * and 'PFcone' (round-ended, then filtered by Pathfinder distance to each cell's farthest corner). Cells fully
   * inside are kept; partly covered cells are clipped to the cone and kept if the covered area is at least
   * minGridArea of a cell. All values in pixels.
   *
   * @param {pt[]} pageGridCenters - Every grid-cell centre on the page.
   * @param {string} aoeType - 'cone', '5econe' or 'PFcone'.
   * @param {number} minGridArea - Minimum covered fraction of a cell (0-1).
   * @param {pt} oPt - Cone origin.
   * @param {number} coneDirection - Centre-line bearing in degrees (0 = up, clockwise).
   * @param {number} coneWidth - Full cone angle in degrees.
   * @param {number} rad - Cone length in pixels.
   * @param {number} pageGridIncrement - Page snapping_increment.
   * @param {number} pageScaleNumber - Page scale_number, for PF distances.
   * @param {number} offsetX - Horizontal origin offset from the token centre; widens the search box.
   * @param {number} offsetY - Vertical origin offset; widens the search box.
   * @param {number} oWidth - Origin token width in pixels (pads the search box for round cones).
   * @param {number} oHeight - Origin token height in pixels.
   * @returns {{xVals:number[], yVals:number[]}} Pixel centres of the covered cells.
   */
  const getConeLocations = function (
    pageGridCenters,
    aoeType,
    minGridArea,
    oPt,
    coneDirection,
    coneWidth,
    rad,
    pageGridIncrement,
    pageScaleNumber,
    offsetX,
    offsetY,
    oWidth,
    oHeight,
  ) {
    const isFlatCone = aoeType === '5econe';
    let bbRadX;
    let bbRadY;
    let coneEndPts; //[origin, trailing-side end, leading-side end]

    if (isFlatCone) {
      const z = rad / (2 * Math.sin(Math.atan(0.5))) - rad;
      coneEndPts = getConeEndPts2(aoeType, oPt, coneDirection, coneWidth, rad, z);
      const sizeX = Math.max(
        Math.abs(coneEndPts[0].x - coneEndPts[1].x),
        Math.abs(coneEndPts[1].x - coneEndPts[2].x),
        Math.abs(coneEndPts[2].x - coneEndPts[0].x),
      );
      const sizeY = Math.max(
        Math.abs(coneEndPts[0].y - coneEndPts[1].y),
        Math.abs(coneEndPts[1].y - coneEndPts[2].y),
        Math.abs(coneEndPts[2].y - coneEndPts[0].y),
      );
      //Extend the bounding box by 1.5 times
      bbRadX = Math.ceil((sizeX * 1.5) / (70 * pageGridIncrement)) * 70 * pageGridIncrement;
      bbRadY = Math.ceil((sizeY * 1.5) / (70 * pageGridIncrement)) * 70 * pageGridIncrement;
    } else {
      coneEndPts = getConeEndPts2(aoeType, oPt, coneDirection, coneWidth, rad, 0);
      bbRadX = rad + oWidth / 2;
      bbRadY = rad + oHeight / 2;
    }

    const inCone = (p) => isPointInCone(p, oPt, rad, coneDirection, coneWidth, isFlatCone);
    const coneSides = [
      [oPt, coneEndPts[1]],
      [oPt, coneEndPts[2]],
    ];
    const flatEnd = [[coneEndPts[1], coneEndPts[2]]];

    //where a cell side crosses the cone: its two straight sides, then the flat end (5e) or the arc (round cones)
    const edgeCrossings = (a, b) => {
      const crossings = getSegmentCrossings(a, b, coneSides);
      if (isFlatCone) {
        return crossings.concat(getSegmentCrossings(a, b, flatEnd));
      }
      if (coneWidth !== 360) {
        return crossings.concat(getLineCircleIntersections(a, b, oPt, rad).filter(inCone));
      }
      return crossings; //a full circle has no arc ends to clip against
    };

    const bounds = getOriginGridBounds(oPt, bbRadX, bbRadY, offsetX, offsetY, pageGridCenters, pageGridIncrement);
    let cells = getCoveredCells(
      { isCornerInside: inCone, edgeCrossings, vertices: coneEndPts, farFrom: oPt },
      bounds,
      minGridArea,
      pageGridIncrement,
    );

    if (aoeType === 'PFcone') {
      //one last check to see if the grid square satisfies PF-style distance rules (every other diag counts as 2sq)
      cells = cells.filter(
        (c) => distBetweenPts(oPt, c.farthestCorner, 'PF', pageGridIncrement, pageScaleNumber) <= rad,
      );
    }
    return cellsToCoords(cells);
  };

  //The following finds the intersection of the control line with the origin token (always thru center of token)
  //      then finds the closest possiblePt (corners or faces) to that intersection pt
  /**
   * For 'nearest' origin modes: finds where the line from the control point to the token's centre crosses the token's
   * bounding box, then returns the candidate origin point closest to that crossing. Pixels.
   *
   * @param {{x:number, y:number}} cPt - Control point.
   * @param {number} minX - Left edge of the origin token.
   * @param {number} minY - Top edge of the origin token.
   * @param {number} maxX - Right edge of the origin token.
   * @param {number} maxY - Bottom edge of the origin token.
   * @param {{x:number, y:number}[]} possiblePts - Candidate origins (from getPossibleOriginPts).
   * @returns {{x:number, y:number}} The chosen origin point.
   */
  const getNearestOriginPt = function (cPt, minX, minY, maxX, maxY, possiblePts) {
    let intersectPt;
    let dist;
    let minDist = 99999;
    let nearestPt;

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const m = (midY - cPt.y) / (midX - cPt.x);
    if (cPt.x <= midX) {
      // check "left" side
      const minXy = m * (minX - cPt.x) + cPt.y;
      if (minY <= minXy && minXy <= maxY) {
        intersectPt = { x: minX, y: minXy };
      }
    }

    if (cPt.x >= midX) {
      // check "right" side
      const maxXy = m * (maxX - cPt.x) + cPt.y;
      if (minY <= maxXy && maxXy <= maxY) {
        intersectPt = { x: maxX, y: maxXy };
      }
    }

    if (cPt.y <= midY) {
      // check "top" side
      const minYx = (minY - cPt.y) / m + cPt.x;
      if (minX <= minYx && minYx <= maxX) {
        intersectPt = { x: minYx, y: minY };
      }
    }

    if (cPt.y >= midY) {
      // check "bottom" side
      const maxYx = (maxY - cPt.y) / m + cPt.x;
      if (minX <= maxYx && maxYx <= maxX) {
        intersectPt = { x: maxYx, y: maxY };
      }
    }

    // edge case when finding midpoint intersection: m = 0/0 = NaN
    if (cPt.x === midX && cPt.y === midY) {
      intersectPt = { x: cPt.x, y: cPt.y };
    }

    //Now, find the nearest "possiblePt" to this intersection pt

    if (!intersectPt) {
      intersectPt = { x: cPt.x, y: cPt.y }; //no edge crossing found (floating-point edge case): use the control point
    }

    for (let i = 0; i < possiblePts.length; i++) {
      dist = distBetweenPts(intersectPt, possiblePts[i]);
      if (dist < minDist || i === 0) {
        nearestPt = possiblePts[i];
        minDist = dist;
      }
    }

    return nearestPt;
  };

  /**
   * Lists candidate origin points around the edge of a token: its grid corners, plus half-cell face midpoints when
   * allowFaces is true. Pixels.
   *
   * @param {{x:number, y:number}} oPt - Token centre.
   * @param {number} height - Token height in pixels.
   * @param {number} width - Token width in pixels.
   * @param {number} pageGridIncrement - Page snapping_increment.
   * @param {boolean} [allowFaces=false] - Also include points every half cell.
   * @returns {{x:number, y:number}[]} Unique edge points sorted clockwise.
   */
  const getPossibleOriginPts = function (oPt, height, width, pageGridIncrement, allowFaces = false) {
    //gets all the corner points and 1/2 grid width faces around an origin pt
    let allPts = [];

    let incr;
    if (allowFaces) {
      incr = 35 * pageGridIncrement;
    } else {
      incr = 70 * pageGridIncrement;
    }

    for (let i = oPt.x - width / 2; i <= oPt.x + width / 2; i += incr) {
      pushUniquePtToArray(allPts, { x: i, y: oPt.y - height / 2 });
      pushUniquePtToArray(allPts, { x: i, y: oPt.y + height / 2 });
    }
    for (let j = oPt.y - height / 2; j <= oPt.y + height / 2; j += incr) {
      pushUniquePtToArray(allPts, { x: oPt.x - width / 2, y: j });
      pushUniquePtToArray(allPts, { x: oPt.x + width / 2, y: j });
    }
    //sort the points clockwise
    allPts = sortPtsClockwise(allPts);
    return allPts;
  };

  /**
   * Works out the grid cells covered by an AoE link by building the page's grid-cell centres and calling the
   * shape-specific function for link.aoeType (cone types, square, wall, circle types, otherwise line). For a
   * fixed-radius line the control point is first moved to the set length along the same bearing. Pixels throughout.
   *
   * @param {object} link - AoE link from state (aoeType, radius, coneWidth, minGridArea, aoeFloat, forceIntersection,
   *   pageID, ...).
   * @param {object} oTok - Roll20 graphic for the origin token.
   * @param {pt} originPtPx - Origin point.
   * @param {pt} controlPtPx - Control point.
   * @param {number} offsetX - Origin x offset from the token centre.
   * @param {number} offsetY - Origin y offset from the token centre.
   * @param {number} pageGridIncrement - Page snapping_increment.
   * @param {number} pageScaleNumber - Page scale_number.
   * @param {object} [wallParams] - From getWallParams; needed only for walls.
   * @returns {{xVals:number[], yVals:number[]}|undefined} Pixel centres of the covered cells.
   */
  const getPathLocations = function (
    link,
    oTok,
    originPtPx,
    controlPtPx,
    offsetX,
    offsetY,
    pageGridIncrement,
    pageScaleNumber,
    wallParams,
  ) {
    let locationsArr; //return value - array of pts (x & y)
    let coneDirection = 0; //angle (in degrees) between originPt & controlPt
    let rad = 0; //radius of effect in pixels

    //find center coords of each token
    const oHeight = oTok.get('height');
    const oWidth = oTok.get('width');

    const page = getObj('page', link.pageID);
    const pageGridCenters = [];
    const pageWidth = page.get('width');
    const pageHeight = page.get('height');

    for (let i = 0 - pageWidth; i < 2 * pageWidth * (1 / pageGridIncrement); i++) {
      for (let j = 0 - pageHeight; j < 2 * pageHeight * (1 / pageGridIncrement); j++) {
        pageGridCenters.push(
          new pt(
            35 * pageGridIncrement + i * 70 * pageGridIncrement,
            35 * pageGridIncrement + j * 70 * pageGridIncrement,
          ),
        );
      }
    }
    if (page) {
      const originPtU = convertPtPixels2Units(originPtPx, pageGridIncrement);
      let controlPtU = convertPtPixels2Units(controlPtPx, pageGridIncrement);

      //add error handling.  TBD
      //etc..

      switch (link.aoeType) {
        case '5econe':
        //Fall through
        case 'PFcone':
        //Fall through
        case 'cone':
          //use pt in pixels for cones (higher resolution needed)
          coneDirection = getAngle2ControlToken(originPtPx, controlPtPx);
          if (link.radius === 'variable') {
            rad = distBetweenPts(originPtPx, controlPtPx);
          } else {
            rad = link.radius;
          }
          locationsArr = getConeLocations(
            pageGridCenters,
            link.aoeType,
            link.minGridArea,
            originPtPx,
            coneDirection,
            link.coneWidth,
            rad,
            pageGridIncrement,
            pageScaleNumber,
            offsetX,
            offsetY,
            oWidth,
            oHeight,
          );
          break;
        case 'square':
          rad = link.radius;
          if (link.radius === 'variable' && !link.aoeFloat) {
            rad = Math.max(Math.abs(originPtPx.x - controlPtPx.x), Math.abs(originPtPx.y - controlPtPx.y));
          }
          locationsArr = getSquareLocations(
            pageGridCenters,
            link.minGridArea,
            originPtPx,
            rad,
            pageGridIncrement,
            offsetX,
            offsetY,
          );
          break;
        case 'wall':
          //walls are a bit different. We passed wallParams into this function, which includes radius, so we don't have to calculate again.
          locationsArr = getWallLocations(pageGridCenters, link.minGridArea, wallParams, pageGridIncrement);
          break;
        case 'PFcircle':
        //Fall through
        case 'circle':
          rad = link.radius;
          if (link.radius === 'variable' && !link.aoeFloat) {
            rad = distBetweenPts(originPtPx, controlPtPx);
          }
          locationsArr = getCircleLocations(
            pageGridCenters,
            link.aoeType,
            link.minGridArea,
            originPtPx,
            rad,
            pageGridIncrement,
            pageScaleNumber,
            offsetX,
            offsetY,
            link.forceIntersection,
          );
          break;
        case 'line':
        // falls through: 'line' is the default
        default:
          if (link.radius !== 'variable') {
            //if pre-defined radius, recalculate the controlPt (originPt remains the same)
            const direction = getAngle2ControlToken(originPtPx, controlPtPx);

            controlPtPx = getNewControlPt(originPtPx, link.radius, direction, pageGridIncrement);
            controlPtU = convertPtPixels2Units(controlPtPx, pageGridIncrement);
          }
          locationsArr = getLineLocations(originPtU.x, originPtU.y, controlPtU.x, controlPtU.y, pageGridIncrement);
          break;
      }

      return locationsArr;
    }
  };

  /**
   * Finds the index of a point in an array of points by exact x/y equality.
   * Used to record which candidate origin point an AoE is currently using.
   *
   * @param {pt[]} arr - Array of points to search.
   * @param {pt} pt - Point to look for.
   * @returns {number} Index of the first matching point, or -1 if not found.
   */
  const getIndexFromPtArray = function (arr, pt) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].x === pt.x && arr[i].y === pt.y) {
        return i;
      }
    }
    return -1;
  };

  // ————— MAP UPDATES —————
  /**
   * Redraws every AoE in the given link set: deletes the old grid-square and outline paths, recalculates the origin
   * point (optionally re-picking the nearest corner/face), creates new Roll20 paths for the affected cells and the true
   * outline, then saves the new path IDs, origin index and bounding box to state via updateAoELink.
   *
   * @param {{links: object[], indices: number[]}} aoeLinks - Links (and their state indices) returned by getAoELinks.
   * @param {boolean} [recalcNearest=true] - Re-compute candidate origin points and pick the nearest; false reuses the
   *   stored originIndex.
   * @param {number} [offsetX=0] - X offset (px) of the origin from the origin token centre; overwritten when the
   *   nearest origin is recalculated.
   * @param {number} [offsetY=0] - Y offset (px) of the origin from the origin token centre; overwritten when the
   *   nearest origin is recalculated.
   * @returns {Promise<void>} Resolves once all paths have been created and state updated.
   */
  async function updateMapWithAoE(aoeLinks, recalcNearest = true, offsetX = 0, offsetY = 0) {
    let pathLocations;
    let newPaths = [];
    let pageGridIncrement;
    let rad;

    //delete the linked paths and clear the pathIDs array from the state object

    //do for each matching link in state object
    for (let a = 0; a < aoeLinks.indices.length; a++) {
      newPaths = [];

      //generate new paths based on aoeType and current posiitons or originTok and controlTok
      const oTok = getObj('graphic', aoeLinks.links[a].originTokID);
      const oHeight = oTok.get('height');
      const oWidth = oTok.get('width');

      const cTok = getObj('graphic', aoeLinks.links[a].controlTokID);

      let originPtPx = new pt(oTok.get('left'), oTok.get('top')); //the origin coords of the effect (in pixels) - this may be different than the origin token center
      const controlPtPx = new pt(cTok.get('left'), cTok.get('top')); //the coords of the control pt of the effect (in pixels) - this may be different than the control token center

      const pageID = aoeLinks.links[a].pageID;
      const page = getObj('page', pageID);

      //physically delete existing paths
      deleteLinkedPaths(aoeLinks.links[a].pathIDs);

      if (
        aoeLinks.links[a].aoeFloat === true &&
        (aoeLinks.links[a].aoeType === 'square' ||
          aoeLinks.links[a].aoeType === 'circle' ||
          aoeLinks.links[a].aoeType === 'PFcircle')
      ) {
        originPtPx.x = controlPtPx.x;
        originPtPx.y = controlPtPx.y;
      }

      if (page && recalcNearest) {
        let oX, oY;
        pageGridIncrement = page.get('snapping_increment');
        pageScaleNumber = page.get('scale_number');

        //possibly shift origin pt
        if (
          aoeLinks.links[a].originType.match(/nearest/i) &&
          (aoeLinks.links[a].aoeType.match(/cone/i) ||
            (aoeLinks.links[a].aoeType.match(/wall/i) && aoeLinks.links[a].forceIntersection === false))
        ) {
          const possibleOrigins = getPossibleOriginPts(
            originPtPx,
            oHeight,
            oWidth,
            pageGridIncrement,
            aoeLinks.links[a].originType.match(/face/i),
          );
          aoeLinks.links[a].originPts = possibleOrigins.map((x) => x);

          oX = originPtPx.x;
          oY = originPtPx.y;
          originPtPx = getNearestOriginPt(
            controlPtPx,
            originPtPx.x - oWidth / 2,
            originPtPx.y - oHeight / 2,
            originPtPx.x + oWidth / 2,
            originPtPx.y + oHeight / 2,
            possibleOrigins,
          );
          aoeLinks.links[a].originIndex = getIndexFromPtArray(possibleOrigins, originPtPx);

          offsetX = originPtPx.x - oX;
          offsetY = originPtPx.y - oY;
        } else {
          aoeLinks.links[a].originPts = [originPtPx];
          aoeLinks.links[a].originIndex = 0;
        }
      } else if (page) {
        pageGridIncrement = page.get('snapping_increment');
        pageScaleNumber = page.get('scale_number');
        //use the originPt found in state object link
        originIndex = aoeLinks.links[a].originIndex;
        originPtPx = aoeLinks.links[a].originPts[originIndex];
      }

      //walls are handled a bit differently. We're going to pre-calculate some parameters, which get used twice: once for grid area paths and once for aoe outline path
      let wallParams;
      if (aoeLinks.links[a].aoeType === 'wall') {
        wallParams = getWallParams(originPtPx, controlPtPx, aoeLinks.links[a].radius, aoeLinks.links[a].wallWidth);
      }

      if (aoeLinks.links[a].outlineOnly === false) {
        //This function returns the coords of the grid area paths (the individual squares)
        pathLocations = getPathLocations(
          aoeLinks.links[a],
          oTok,
          originPtPx,
          controlPtPx,
          offsetX,
          offsetY,
          pageGridIncrement,
          pageScaleNumber,
          wallParams,
        );

        //define the bounding box of affected grid squares
        const ptUL = new pt(
          Math.min(...pathLocations.xVals) - 35 * pageGridIncrement,
          Math.min(...pathLocations.yVals) - 35 * pageGridIncrement,
        );
        const ptUR = new pt(
          Math.max(...pathLocations.xVals) + 35 * pageGridIncrement,
          Math.min(...pathLocations.yVals) - 35 * pageGridIncrement,
        );
        const ptLR = new pt(
          Math.max(...pathLocations.xVals) + 35 * pageGridIncrement,
          Math.max(...pathLocations.yVals) + 35 * pageGridIncrement,
        );
        const ptLL = new pt(
          Math.min(...pathLocations.xVals) - 35 * pageGridIncrement,
          Math.max(...pathLocations.yVals) + 35 * pageGridIncrement,
        );
        aoeLinks.links[a].boundingBox = [ptUL, ptUR, ptLR, ptLL];

        let path;
        let pathstring;

        for (let p = 0; p < pathLocations.xVals.length; p++) {
          pathstring = buildSquarePath(35 * pageGridIncrement);
          path = await new Promise(function (resolve) {
            const thePath = createPath(
              pathstring,
              pageID,
              aoeLinks.links[a].aoeLayer,
              aoeLinks.links[a].aoeColor,
              aoeLinks.links[a].gridColor,
              2,
              70 * pageGridIncrement,
              70 * pageGridIncrement,
              pathLocations.xVals[p],
              pathLocations.yVals[p],
            );
            resolve(thePath);
          });
          newPaths.push(path.get('_id'));
        }
      }

      //create a path with the true outline of the AoE
      if (aoeLinks.links[a].aoeType === '5econe') {
        //
        const coneDirection = getAngle2ControlToken(originPtPx, controlPtPx);
        if (aoeLinks.links[a].radius === 'variable') {
          rad = distBetweenPts(originPtPx, controlPtPx);
        } else {
          rad = aoeLinks.links[a].radius;
        }
        const coneWidth = 53.14; //hardcode
        const z = rad / (2 * Math.sin(Math.atan(0.5))) - rad;

        pathstring = build5eCone(rad, z, coneWidth, coneDirection);
        path = await new Promise(function (resolve) {
          const thePath = createPath(
            pathstring,
            pageID,
            aoeLinks.links[a].aoeLayer,
            'transparent',
            aoeLinks.links[a].aoeOutlineColor,
            3,
            rad * 2,
            rad * 2,
            originPtPx.x - z,
            originPtPx.y - z,
          );
          resolve(thePath);
        });
        newPaths.push(path.get('_id'));
      } else if (aoeLinks.links[a].aoeType === 'cone' || aoeLinks.links[a].aoeType === 'PFcone') {
        //
        const coneDirection = getAngle2ControlToken(originPtPx, controlPtPx);
        if (aoeLinks.links[a].radius === 'variable') {
          rad = distBetweenPts(originPtPx, controlPtPx);
        } else {
          rad = aoeLinks.links[a].radius;
        }
        pathstring = buildCirclePath(rad, aoeLinks.links[a].coneWidth, coneDirection);
        path = await new Promise(function (resolve) {
          const thePath = createPath(
            pathstring,
            pageID,
            aoeLinks.links[a].aoeLayer,
            'transparent',
            aoeLinks.links[a].aoeOutlineColor,
            3,
            rad * 2,
            rad * 2,
            originPtPx.x,
            originPtPx.y,
          );
          resolve(thePath);
        });
        newPaths.push(path.get('_id'));
      } else if (aoeLinks.links[a].aoeType === 'square') {
        //
        rad = aoeLinks.links[a].radius;
        if (aoeLinks.links[a].radius === 'variable' && !aoeLinks.links[a].aoeFloat) {
          rad = Math.max(Math.abs(originPtPx.x - controlPtPx.x), Math.abs(originPtPx.y - controlPtPx.y));
        }

        pathstring = buildSquarePath(rad);
        path = await new Promise(function (resolve) {
          const thePath = createPath(
            pathstring,
            pageID,
            aoeLinks.links[a].aoeLayer,
            'transparent',
            aoeLinks.links[a].aoeOutlineColor,
            3,
            rad * 2,
            rad * 2,
            originPtPx.x,
            originPtPx.y,
          );
          resolve(thePath);
        });
        newPaths.push(path.get('_id'));
      } else if (aoeLinks.links[a].aoeType === 'circle' || aoeLinks.links[a].aoeType === 'PFcircle') {
        //
        if (aoeLinks.links[a].radius === 'variable') {
          rad = distBetweenPts(originPtPx, controlPtPx);
        } else {
          rad = aoeLinks.links[a].radius;
        }
        pathstring = buildCirclePath(rad, 360, 0);
        path = await new Promise(function (resolve) {
          const thePath = createPath(
            pathstring,
            pageID,
            aoeLinks.links[a].aoeLayer,
            'transparent',
            aoeLinks.links[a].aoeOutlineColor,
            3,
            rad * 2,
            rad * 2,
            originPtPx.x,
            originPtPx.y,
          );
          resolve(thePath);
        });
        newPaths.push(path.get('_id'));
      } else if (aoeLinks.links[a].aoeType === 'wall') {
        //
        pathstring = buildWallPath(wallParams);
        path = await new Promise(function (resolve) {
          const thePath = createPath(
            pathstring,
            pageID,
            aoeLinks.links[a].aoeLayer,
            'transparent',
            aoeLinks.links[a].aoeOutlineColor,
            3,
            wallParams.heightBB,
            wallParams.widthBB,
            wallParams.pCenter.x,
            wallParams.pCenter.y,
          );
          resolve(thePath);
        });
        newPaths.push(path.get('_id'));
      }

      //Update the State object with new paths, originIndex, and bounding box array
      updateAoELink(aoeLinks.indices[a], newPaths, aoeLinks.links[a].originIndex, aoeLinks.links[a].boundingBox);
    }
  }

  /**
   * Moves a token to the nearest grid intersection on its page, then notifies observers of the change.
   * Used for floating AoEs whose control token must sit on grid lines (forceIntersection).
   *
   * @param {object} tok - Roll20 graphic (token) to snap; its left/top are updated.
   */
  const snapToIntersection = function (tok) {
    const pageID = tok.get('_pageid');
    const page = getObj('page', pageID);
    const pageGridIncrement = page.get('snapping_increment');
    const pageWidthPx = page.get('width') * 70;
    const pageHeightPx = page.get('height') * 70;

    const intersections = [];
    for (let i = 0; i <= pageWidthPx * (1 / pageGridIncrement); i += 70 * pageGridIncrement) {
      for (let j = 0; j <= pageHeightPx * (1 / pageGridIncrement); j += 70 * pageGridIncrement) {
        intersections.push(new pt(i, j));
      }
    }
    const tokPt = new pt(tok.get('left'), tok.get('top'));
    const newPt = getClosestGridPt(tokPt, intersections, pageGridIncrement);

    //grab the previous token settings before setting new ones
    const prevTok = JSON.parse(JSON.stringify(tok));
    //set new tok settings
    tok.set({ left: newPt.x, top: newPt.y });
    //trigger tokenChange event for other api scripts
    notifyObservers('tokenChange', tok, prevTok);
  };

  // ————— EVENT HANDLERS —————
  //Move DL path to remain under source token
  /**
   * 'change:graphic' handler. When a token linked to an AoE is moved, optionally snaps it to a grid intersection,
   * plays the move sound and redraws the linked AoE(s) via updateMapWithAoE. Ignores changes that do not alter
   * left/top.
   *
   * @param {object} obj - Roll20 graphic (token) after the change.
   * @param {object} prev - Previous attribute values of the graphic (plain object).
   * @returns {Promise<void>}
   */
  async function smartAoE_handleTokenChange(obj, prev) {
    //find all paths linked to token, returns an array of aoeLinks objects or undefined
    //aoeLinks object looks like {links:[{aoeType, originTokID, controlTokID, pathIDs[], pageID}], indices:[]}

    //only trigger when token is moved
    if (obj.get('left') === prev.left && obj.get('top') === prev.top) {
      return;
    }

    const tokID = obj.get('id');
    const aoeLinks = getAoELinks(tokID);

    //potentially force the AoEControlToken to snap to grid intersection for floating AoE squares
    let tempLinks = [];
    if (aoeLinks) {
      tempLinks = aoeLinks.links.filter((link) => {
        return (
          link.forceIntersection &&
          (link.controlTokID === tokID || (link.originTokID === tokID && obj.get('name') === 'AoEControlToken'))
        );
      });
    }

    if (tempLinks.length > 0) {
      snapToIntersection(obj);
    }

    if (aoeLinks && obj) {
      //optional sound fx during move
      const trackName = aoeLinks.links[0].moveSound;
      if (trackName !== '') {
        whisperString = aoeLinks.links[0].whisperString || '';
        playJukeboxTrack(trackName, whisperString);
      }
      updateMapWithAoE(aoeLinks);
    }
  }

  /**
   * Tears down every AoE linked to a token: removes any turn-tracker entry for it, deletes the linked paths,
   * splices the links out of state, removes associated control tokens (and the second token spawned for walls),
   * and plays the delete sound.
   *
   * @param {object} obj - Roll20 graphic (token) being removed; may be an origin or control token.
   */
  const deleteAoELinksAndControlToks = function (obj) {
    const controlToks = [];
    const tokID = obj['id'];

    //Possibly remove a value from the turn tracker
    modifyTurnTracker('remove', '', '', '', tokID, '');

    const aoeLinks = getAoELinks(obj.get('id'));

    if (aoeLinks) {
      //aoeLinks.indices.forEach((index) => {
      for (let i = aoeLinks.indices.length - 1; i > -1; i--) {
        //delete the linked paths and clear the the associated links arrays from the state object
        const stateLinkIndex = aoeLinks.indices[i];
        deleteLinkedPaths(state[scriptName].links[stateLinkIndex].pathIDs);

        //If deleted token is a source token, remove all control tokens associated with that source token
        if (tokID === aoeLinks.links[i].originTokID && tokID !== aoeLinks.links[i].controlTokID) {
          controlToks.push(aoeLinks.links[i].controlTokID);
        }

        //for walls (for which we spawned *two* controlToks), delete the "origin tok" also
        if (aoeLinks.links[i].aoeType.match(/wall/i)) {
          controlToks.push(aoeLinks.links[i].originTokID);
        }

        state[scriptName].links.splice(stateLinkIndex, 1);
      }
      controlToks.forEach((id) => {
        removeToken(id);
      });
      const trackName = aoeLinks.links[0].deleteSound;
      if (trackName !== '') {
        const whisperString = aoeLinks.links[0].whisperString || '';
        playJukeboxTrack(trackName, whisperString);
      }
    }
  };

  /**
   * 'destroy:graphic' handler. Cleans up any AoE links, paths and control tokens tied to the deleted token.
   *
   * @param {object} obj - Roll20 graphic (token) that was destroyed.
   */
  const smartAoE_handleRemoveToken = function (obj) {
    deleteAoELinksAndControlToks(obj);
  };

  // ————— ROLL PARSING —————
  //returns character object for given name
  /**
   * Looks up a character in the journal by name (case-insensitive). Used to find the character whose default
   * token is spawned as the AoE control token.
   *
   * @param {string} charName - Character name to find.
   * @returns {object|undefined} First matching Roll20 character, or undefined if none.
   */
  const getCharacterFromName = function (charName) {
    const character = findObjs(
      {
        _type: 'character',
        name: charName,
      },
      { caseInsensitive: true },
    )[0];
    return character;
  };

  //libInline HTML-encodes roll expressions (e.g. "*" -> "&#42;", "{" -> "&#123;", "<" -> "&#xFF1C;").
  //Decode them all before re-rolling, otherwise [[2*13d6]] was re-rolled as [[2&#42;13d6]] = 2.
  /**
   * Decodes the HTML entities libInline puts into roll expressions (e.g. &#42; for *) so the expression can be
   * re-rolled correctly; without this [[2*13d6]] would be re-rolled as [[2&#42;13d6]].
   *
   * @param {string} expr - Encoded inline-roll expression (falsy values are treated as an empty string).
   * @returns {string} Decoded expression.
   */
  const decodeInlineExpression = function (expr) {
    return String(expr || '')
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/\uFF1C/g, '<');
  };

  /**
   * Replaces each $[[n]] placeholder in a string with that roll's total from libInline data, and collects the
   * roll objects that were used.
   *
   * @param {string} str - Text containing $[[n]] placeholders.
   * @param {object[]} parsedInlines - Inline roll data from libInline.getRollData.
   * @returns {{text: string, inlines: object[]}} Substituted text and the inline rolls it referenced.
   */
  const substituteInlineRolls = function (str, parsedInlines) {
    let index;
    const inlineArr = [];
    const reg = /\$\[\[\d+\]\]/g;

    const foundInlines = str.match(reg) || [];

    foundInlines.forEach((inline) => {
      index = inline.replace(/\$\[\[/, '').replace(/\]\]/, '');
      str = str.replace(inline, parsedInlines[index].total);
      inlineArr.push(parsedInlines[index]);
    });
    return { text: str, inlines: inlineArr };
  };

  /**
   * Parses a !smartaoe chat message into "--cmd|value" arguments, flattening {{ }} wrappers and <br/> line breaks and
   * substituting inline-roll totals. Mutates msg.content as a side effect.
   *
   * @param {object} msg - Roll20 chat message.
   * @returns {{cmd: string, params: string, inlines: object[]}[]} One entry per argument; cmd is lower-cased.
   */
  const parseArgs = function (msg) {
    msg.content = msg.content.replace(/<br\/>\n/g, ' ').replace(/(\{\{(.*?)\}\})/g, ' $2 ');

    const parsedInlines = libInline.getRollData(msg) || [];

    //Check for inline rolls
    let args = msg.content.split(/\s+--/);
    args.shift();
    args = args.map((arg) => {
      const cmds = arg.split('|');
      const retVals = substituteInlineRolls(cmds[1], parsedInlines);

      return {
        cmd: cmds.shift().toLowerCase().trim(),
        params: retVals.text,
        inlines: retVals.inlines,
      };
    });
    return args;
  };

  /**
   * Turns a value read from a character sheet into text. Beacon sheets can return numbers, booleans (true/false
   * become '1'/'0' so they work in roll formulas) and arrays (joined with commas).
   *
   * @param {*} value - Value from getSheetItem or an attribute's 'current'.
   * @returns {string} The value as text ('' when missing).
   */
  const sheetValueToString = function (value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? '1' : '0';
    if (Array.isArray(value)) return value.map(sheetValueToString).join(',');
    if (typeof value === 'object') return '';
    return String(value);
  };

  /**
   * Reads a character sheet item with getSheetItem, which also sees Beacon (e.g. D&D 2024) computed properties that
   * findObjs and getAttrByName miss. Tries the name as given, then the Beacon custom-attribute form "user.<name>"
   * only if the sheet has no such item: an item that exists but is empty (e.g. an NPC with no resistances) stops
   * there, because Roll20 logs an error to the API console for every missing user.* attribute.
   *
   * @param {string} charID - Roll20 character ID.
   * @param {string} attrName - Attribute or computed property name.
   * @param {string} [type='current'] - 'current' or 'max'.
   * @returns {Promise<{name: string, value: *}|undefined>} The name that matched and its value, or undefined if
   *   getSheetItem is unavailable or nothing matched (or the value is empty).
   */
  const getSheetValue = async function (charID, attrName, type = 'current') {
    if (typeof getSheetItem !== 'function') return undefined;
    for (const name of [attrName, `user.${attrName}`]) {
      let value;
      try {
        value = await getSheetItem(charID, name, type);
      } catch (err) {
        continue; //not found on this sheet; try the next name
      }
      if (value === '') return undefined;
      if (value !== null && value !== undefined) return { name, value };
    }
    return undefined;
  };

  /**
   * Reads one value of a character's attribute: the legacy attribute object if there is one (case-insensitive name),
   * otherwise the sheet item (Beacon sheets). An empty legacy attribute doesn't hide a sheet item: Beacon characters
   * can carry leftover legacy attributes (e.g. from a 2014 sheet or another mod) with the same name.
   *
   * @param {string} charID - Roll20 character ID.
   * @param {string} attrName - Attribute name.
   * @param {string} [type='current'] - 'current' or 'max'.
   * @returns {Promise<{attr: object|undefined, sheetName: string|undefined, raw: string}|undefined>} The legacy
   *   attribute or the sheet item name that matched, and the value as text; undefined if neither exists.
   */
  const readCharacterValue = async function (charID, attrName, type = 'current') {
    const attr = findObjs(
      {
        _type: 'attribute',
        name: attrName,
        _characterid: charID,
      },
      { caseInsensitive: true },
    )[0];
    const legacyRaw = attr ? sheetValueToString(attr.get(type)) : '';
    if (attr && legacyRaw !== '') return { attr, sheetName: undefined, raw: legacyRaw };
    const sheetValue = await getSheetValue(charID, attrName, type);
    if (sheetValue) return { attr: undefined, sheetName: sheetValue.name, raw: sheetValueToString(sheetValue.value) };
    if (attr) return { attr, sheetName: undefined, raw: legacyRaw };
    return undefined;
  };

  //replaceAttributes and processTokenRolls modified from Jakob's group-check script
  /**
   * Recursively expands @{attribute} references in a roll formula using the given character's attribute values.
   * Reads through getSheetItem first (works for legacy and Beacon sheets), then getAttrByName (legacy sheet
   * defaults). Missing attributes become empty strings.
   *
   * @param {string} formula - Roll formula containing @{attrName} references.
   * @param {string} charID - Roll20 character ID to read attributes from.
   * @returns {Promise<string>} Formula with all attribute references replaced.
   */
  const replaceAttributes = async function (formula, charID) {
    const myGetAttrByName = async (attrName) => {
      const sheetValue = await getSheetValue(charID, attrName);
      if (sheetValue) return sheetValueToString(sheetValue.value);
      return sheetValueToString(getAttrByName(charID, attrName));
    };

    //a pass replaces every reference; repeat while values themselves contain references
    while (/@{(.*?)}/.test(formula)) {
      const names = [...new Set([...formula.matchAll(/@{(.*?)}/g)].map((m) => m[1]))];
      const values = {};
      for (const name of names) values[name] = await myGetAttrByName(name);
      formula = formula.replace(/@{(.*?)}/g, (_, attrName) => values[attrName]);
    }
    return formula;
  };

  /**
   * Sorts target entries by layer name in descending order, so "objects" targets come before "gmlayer" ones
   * (keeps hidden-name numbering from leaking GM-layer targets). Sorts in place.
   *
   * @param {object[]} tokenRolls - Target entries from processTokenRolls (each with a layer property).
   * @returns {object[]} The same array, sorted.
   */
  const sortTokenRollsByLayer = function (tokenRolls) {
    //sorts in descending order ("objects", then "gmlayer")
    tokenRolls.sort((a, b) => {
      const layerA = a.layer.toLowerCase(),
        layerB = b.layer.toLowerCase();

      if (layerA > layerB) {
        return -1;
      }
      if (layerA < layerB) {
        return 1;
      }
      return 0;
    });
    return tokenRolls;
  };

  /**
   * Removes the damage types that only apply to nonmagical attacks from a resistance, vulnerability or immunity list
   * (e.g. 2014 stat blocks' "bludgeoning, piercing, and slashing from nonmagical attacks that aren't silvered"). AoEs
   * are treated as magical, as for Magic Resistance, so these mustn't match a bludgeoning AoE.
   *
   * @param {string} text - Lower-cased damage type list.
   * @returns {string} The list without the nonmagical damage types.
   */
  const removeNonmagicalDamage = function (text) {
    //"bludgeoning, piercing, and slashing", "bludgeoning or piercing", ...
    const physical = '(?:(?:bludgeoning|piercing|slashing)(?:\\s*,\\s*(?:and\\s+|or\\s+)?|\\s+(?:and|or)\\s+)?)+';
    return text
      .replace(new RegExp(`${physical}\\s*(?:damage\\s+)?from\\s+non-?magical[^;]*`, 'g'), '')
      .replace(new RegExp(`non-?magical\\s+${physical}[^;]*`, 'g'), '');
  };

  /**
   * Checks a Beacon (D&D 2024) sheet's "store" attribute for an enabled Magic Resistance feature. Only feature names
   * are checked: the whole store also holds item and spell text, which can mention magic resistance.
   *
   * @param {*} store - The current value of the character's "store" attribute (an object on Beacon sheets).
   * @returns {boolean} True if the sheet has an enabled feature named Magic Resistance.
   */
  const hasBeaconMagicResistance = function (store) {
    let data = store;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (err) {
        return false;
      }
    }
    const integrants = data?.integrants?.integrants;
    if (!integrants || typeof integrants !== 'object') return false;
    return Object.values(integrants).some(
      (item) =>
        item &&
        item._enabled !== false &&
        typeof item.name === 'string' &&
        item.name.toLowerCase().includes('magic resistance'),
    );
  };

  /**
   * Builds the saving-throw entry for one target token: reads its resistances, vulnerabilities and immunities from the
   * link's configured attributes, detects Magic Resistance (roll twice), and expands the save formula with the
   * character's attributes ([[0]] when the AoE has no save). Attributes not found as legacy attribute objects are
   * read from the sheet with getSheetItem (Beacon sheets); Magic Resistance is read from a Beacon sheet's features.
   *
   * @param {object} token - Roll20 graphic (token) hit by the AoE.
   * @param {object} link - AoE link from state.
   * @returns {Promise<object|null>} Target entry (pic, name, layer, saveName, DC, roll2x, formula, id, RVI strings),
   *   or null if the token has no character.
   */
  const processTokenRolls = async function (token, link) {
    const charID = token.get('represents'),
      character = getObj('character', charID),
      displayName = token.get('name');
    const tokenPic = token.get('imgsrc').replace(/(?:max|original|med)\.png/, 'thumb.png');
    const layer = token.get('layer');

    const attrs = findObjs(
      {
        _type: 'attribute',
        _characterid: charID,
      },
      { caseInsensitive: true },
    );

    let resistances = '';
    let vulnerabilities = '';
    let immunities = '';
    let roll2x = false;

    /**
     * Joins the lower-cased values of the named attributes: legacy attribute objects where they have a value,
     * otherwise the sheet item of that name (an empty leftover legacy attribute must not hide a Beacon sheet's value).
     *
     * @param {string[]} attrNames - Attribute names configured on the link (e.g. resistAttrs).
     * @returns {Promise<string>} The values joined, '' when none are found.
     */
    const readDamageAttrs = async (attrNames) => {
      const values = [];
      for (const attrName of attrNames) {
        const legacyValues = (attrs || [])
          .filter((att) => att.get('name') === attrName)
          .map((e) => sheetValueToString(e.get('current')).toLowerCase())
          .filter((v) => v !== '');
        if (legacyValues.length > 0) {
          values.push(...legacyValues);
        } else {
          const sheetValue = await getSheetValue(charID, attrName);
          if (sheetValue) values.push(sheetValueToString(sheetValue.value).toLowerCase());
        }
      }
      return values.map(removeNonmagicalDamage).join('');
    };

    if (!character) return null;

    resistances = await readDamageAttrs(link.resistAttrs);
    vulnerabilities = await readDamageAttrs(link.vulnerableAttrs);
    immunities = await readDamageAttrs(link.immunityAttrs);

    if (attrs) {
      //Magic Resistance (likely 5e-only)
      const tempAttrs = attrs.filter((att) => {
        const current = att.get('current');
        if (att.get('name') === 'store') return hasBeaconMagicResistance(current);
        return sheetValueToString(current).toLowerCase().includes('magic resist');
      });
      if (tempAttrs.length > 0) {
        roll2x = true;
      }
    }

    let computedFormula;
    if (link.noSave === true) {
      computedFormula = '[[0]]';
    } else {
      computedFormula = await replaceAttributes(link.saveFormula, charID);
    }

    return {
      pic: tokenPic,
      name: displayName,
      layer: layer,
      //"roll2": (ro === "roll2"),
      saveName: link.saveName,
      DC: link.DC,
      //"damage": damage,
      roll2x: roll2x,
      formula: computedFormula,
      id: token.id,
      resistances: resistances,
      vulnerabilities: vulnerabilities,
      immunities: immunities,
    };
  };

  // Format inline rolls
  /**
   * Recursively sums the raw dice values in a Roll20 roll result, ignoring dropped dice and non-dice terms.
   *
   * @param {object} roll - Roll20 roll result node (type V, G or R).
   * @returns {number} Sum of kept dice results (0 for other node types).
   */
  const extractDiceRoll = (roll) => {
    if (roll.type === 'V' && roll.rolls) {
      return roll.rolls.map(extractDiceRoll).reduce((m, x) => m + x, 0);
    }
    if (roll.type === 'G' && roll.rolls) {
      return _.flatten(roll.rolls)
        .map(extractDiceRoll)
        .reduce((m, x) => m + x, 0);
    }
    if (roll.type === 'R') {
      return roll.results
        .filter((x) => x.v && !x.d)
        .map((x) => x.v)
        .reduce((m, x) => m + x, 0);
    } else {
      return 0;
    }
  };

  /**
   * Copies roll results from sendChat callback messages into the matching rows (damage rolls or targets), adding
   * result_n (totals), raw_n (dice only) and styled_n (inline-roll HTML) for each line n of the rolled text.
   *
   * @param {object[][]} messages - Message arrays returned by sendChat callbacks, one per row.
   * @param {object[]} rows - Rows to populate, in the same order (mutated).
   * @returns {object[]} The populated rows.
   */
  const attachRollResults = function (messages, rows) {
    messages.forEach((msgList, j) => {
      const inlinerollData = (msgList[0].inlinerolls || []).map((roll) => {
        return {
          raw: extractDiceRoll(roll.results),
          result: roll.results.total || 0,
          styled: makeInlineroll(roll, false), //convert to variable later
        };
      });
      msgList[0].content.split('<br>').forEach((str, n) => {
        rows[j][`result_${n + 1}`] = [];
        rows[j][`raw_${n + 1}`] = [];
        rows[j][`styled_${n + 1}`] = str.replace(/\$\[\[(\d+)\]\]/g, (_, number) => {
          rows[j][`result_${n + 1}`].push(inlinerollData[parseInt(number)].result);
          rows[j][`raw_${n + 1}`].push(inlinerollData[parseInt(number)].raw);
          return inlinerollData[parseInt(number)].styled;
        });
      });
    });
    return rows;
  };

  //this was modified from Jakob's group-check api script
  /**
   * Formats rolled damage results, then either rolls every target's save (and continues in processFinalMessages) or,
   * if there are no targets, sends the damage-only chat card. Mutates damageRolls.
   *
   * @param {object[][]} messages - sendChat callback messages for the damage rolls.
   * @param {object[]} damageRolls - Damage roll entries ({formula}) to populate.
   * @param {object[]} tokenRolls - Target entries from processTokenRolls.
   * @param {object} aoeLink - AoE link from state (card parameters, whisper settings, etc.).
   */
  const processMessagesMaster = function (messages, damageRolls, tokenRolls, aoeLink) {
    //takes all the rolls that were processed thru the Roll20 die roller for all tokens and formats them.
    //   then, we will format the final chat output
    let whisperString = '';
    attachRollResults(messages, damageRolls);

    if (tokenRolls.length > 0) {
      Promise.all(
        tokenRolls.map(
          (o) =>
            new Promise((resolve) => {
              sendChat('', `${o.formula}${o.roll2x ? `<br>${o.formula}` : ''}`, resolve);
            }),
        ),
      )
        .then(async (messages) => processFinalMessages(messages, damageRolls, tokenRolls, aoeLink))
        .catch((err) => sendErrorMessage(err));
    } else {
      let output = buildTitle(aoeLink.cardParameters);
      const damageOutput = buildDamageRows(damageRolls, aoeLink);

      if (damageOutput) {
        output = output + damageOutput;

        const descRow = buildDescRow(aoeLink.cardParameters.descriptiontext, aoeLink.cardParameters);
        output = output + buildTableBody('', '', descRow, aoeLink.cardParameters);

        if (aoeLink.whisperAll) {
          whisperString = aoeLink.whisperString;
        }
        sendChat(scriptName, `${whisperString} ${output}`);
      }
    }
  };

  // ————— DAMAGE & MARKERS —————
  /**
   * Deletes a graphic from the board if it still exists.
   *
   * @param {string} tokID - Roll20 graphic ID.
   */
  const removeToken = function (tokID) {
    const tok = getObj('graphic', tokID);

    if (tok) {
      tok.remove();
    }
  };

  /**
   * Applies damage (or healing, if negative) to a token's bar(s), cascading leftover damage or healing to the next bar;
   * damage never goes below 0 and healing never goes above max. Adds or removes the 0 HP marker, optionally removes
   * the token at 0 HP, and otherwise updates the bars and notifies observers.
   *
   * @param {string} tokID - Roll20 graphic (token) ID.
   * @param {string} name - Name to show in the result message.
   * @param {Array<number|string>} bar - Bar numbers (1-3) to apply to, in order.
   * @param {Array<number|string>} damageArr - Damage amounts to add together (negative heals).
   * @param {string} zeroHPmarker - Status marker(s) for 0 HP (comma-separated); also recorded via
   *   rememberZeroHPMarkers.
   * @param {boolean} [removeAtZero=false] - Remove the token when its last bar reaches 0.
   * @returns {string} Summary such as "Applied 12 damage to Goblin" or "Healed Goblin by 5".
   */
  const applyDamage = function (tokID, name, bar, damageArr, zeroHPmarker, removeAtZero = false) {
    rememberZeroHPMarkers(zeroHPmarker); //before the marker is added, so observers can recognise it
    const tok = getObj('graphic', tokID);
    const currentHP = [];
    const maxHP = [];
    const newHP = [];
    let amountHealed;
    let remainingDamage;

    //Multiple bar values may be present. bar is an array of 1 to 3 elements. Damage will apply to them in order, cascading down if more damage remains.
    if (bar.length > 0) {
      bar.map((b) => {
        currentHP.push(parseInt(tok.get(`bar${b}_value`)) || 0);
        maxHP.push(parseInt(tok.get(`bar${b}_max`)) || 99999);
      });
    } else {
      currentHP.push(0);
      maxHP.push(0);
    }

    const damage = damageArr.map((e) => parseInt(e)).reduce((a, b) => a + b);

    if (damage >= 0) {
      //damage can't reduce below 0
      //first bar value
      newHP.push(Math.max(currentHP[0] - damage, 0));
      if (damage > currentHP[0] && bar.length > 1) {
        remainingDamage = damage - currentHP[0];
        //second bar value
        newHP.push(Math.max(currentHP[1] - remainingDamage, 0));
        if (remainingDamage > currentHP[1] && bar.length > 2) {
          remainingDamage = remainingDamage - currentHP[1];
          //third bar value
          newHP.push(Math.max(currentHP[2] - remainingDamage, 0));
        }
      }
      returnString = `Applied ${damage} damage to ${name}`;
    } else {
      //negative damage = healing! Can't heal above max.
      //Heal the first bar up to its max, then cascade only the leftover healing to the next bar.
      //A bar already above its max (e.g. temp HP) is left as-is rather than reduced to max.
      let remainingHeal = Math.abs(damage);
      amountHealed = 0;
      for (let i = 0; i < currentHP.length; i++) {
        if (i > 0 && remainingHeal <= 0) {
          break;
        }
        const healed = Math.min(remainingHeal, Math.max(maxHP[i] - currentHP[i], 0));
        newHP.push(currentHP[i] + healed);
        amountHealed += healed;
        remainingHeal -= healed;
      }
      //newHP and maxHP are arrays, so compare bar by bar (newHP===maxHP was never true)
      const atMax = newHP.every((hp, idx) => hp >= maxHP[idx]);
      returnString = atMax ? `Healed ${name} by ${amountHealed} (@Max)` : `Healed ${name} by ${amountHealed}`;
    }

    if (zeroHPmarker && newHP[bar.length - 1] === 0) {
      addStatusMarkers(tokID, zeroHPmarker);
    } else if (zeroHPmarker && newHP[bar.length - 1] > 0) {
      removeStatusMarkers(tokID, zeroHPmarker);
    }

    //newHP is an array; like the zeroHPmarker check above, test the last bar (newHP===0 was never true)
    if (removeAtZero && newHP[bar.length - 1] === 0) {
      removeToken(tokID);
    } else {
      //grab the previous token settings before setting new ones
      const prevTok = JSON.parse(JSON.stringify(tok));
      //set new tok settings
      newHP.forEach((hp, idx) => {
        tok.set(`bar${bar[idx]}_value`, hp);
      });
      //trigger tokenChange event for other api scripts
      notifyObservers('tokenChange', tok, prevTok);
    }

    return returnString;
  };

  //0 HP marker tags (--zeroHPmarker) used this session. Kept after an AoE is deleted (e.g. --instant AoEs are
  //removed before their damage is applied) so other scripts can tell SmartAoE's 0 HP markers apart.
  const knownZeroHPMarkers = new Set();
  /**
   * Records 0 HP marker tags used this session in knownZeroHPMarkers, so other scripts (via the public ZeroHPMarkers
   * accessor) can recognise SmartAoE's markers even after the AoE is deleted.
   *
   * @param {string} markerString - Comma-separated status markers.
   */
  const rememberZeroHPMarkers = function (markerString) {
    splitStatusMarkers(markerString).forEach((m) => knownZeroHPMarkers.add(markerTag(m)));
  };

  //Splits a statusmarkers string into trimmed, non-empty entries
  /**
   * Splits a statusmarkers string into trimmed, non-empty entries.
   *
   * @param {string} markerString - Comma-separated status markers (falsy is treated as empty).
   * @returns {string[]} Marker entries.
   */
  const splitStatusMarkers = function (markerString) {
    return (markerString || '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '');
  };

  //Marker tag without its optional @number badge, e.g. "red@2" -> "red", "Down::123@1" -> "Down::123"
  /**
   * Strips the optional @number badge from a marker, e.g. "red@2" becomes "red".
   *
   * @param {string} marker - Status marker entry.
   * @returns {string} Marker tag without the badge.
   */
  const markerTag = function (marker) {
    return marker.replace(/@\d+$/, '');
  };

  /**
   * Adds status markers to a token, skipping any whose tag is already present (badges ignored) and duplicates within
   * the input. Notifies observers only if the markers actually changed.
   *
   * @param {string} tokID - Roll20 graphic (token) ID.
   * @param {string} markerString - Comma-separated markers to add.
   */
  const addStatusMarkers = function (tokID, markerString) {
    if (!markerString) {
      return;
    }

    const tok = getObj('graphic', tokID);
    if (!tok) {
      return;
    }
    const currentMarkers = splitStatusMarkers(tok.get('statusmarkers'));
    const currentTags = currentMarkers.map(markerTag);

    //we don't want to duplicate statusmarkers, so compare whole marker tags (ignoring any @number badge).
    //Filtering avoids the skipped entries of splicing inside forEach, and substring matches such as "red" in "red@2".
    const newMarkers = splitStatusMarkers(markerString).filter((m, idx, arr) => {
      return !currentTags.includes(markerTag(m)) && arr.findIndex((x) => markerTag(x) === markerTag(m)) === idx;
    });
    if (newMarkers.length === 0) {
      return;
    }

    //grab the previous token settings before setting new ones
    const prevTok = JSON.parse(JSON.stringify(tok));
    //set new tok settings (no stray leading/trailing commas)
    tok.set('statusmarkers', currentMarkers.concat(newMarkers).join(','));
    //trigger tokenChange event for other api scripts
    notifyObservers('tokenChange', tok, prevTok);
  };

  /**
   * Removes status markers from a token by tag (so "red" also removes "red@2"). Notifies observers only if
   * something was removed.
   *
   * @param {string} tokID - Roll20 graphic (token) ID.
   * @param {string} markerString - Comma-separated markers to remove.
   */
  const removeStatusMarkers = function (tokID, markerString) {
    if (!markerString) {
      return;
    }
    const tok = getObj('graphic', tokID);
    if (!tok) {
      return;
    }
    const allMarkers = splitStatusMarkers(tok.get('statusmarkers'));

    //compare whole marker tags so "red@2" is removed by "red", and spaces after commas are ignored
    const tagsToRemove = splitStatusMarkers(markerString).map(markerTag);
    const currentMarkers = allMarkers.filter((m) => !tagsToRemove.includes(markerTag(m)));
    if (currentMarkers.length === allMarkers.length) {
      return;
    }

    //grab the previous token settings before setting new ones
    const prevTok = JSON.parse(JSON.stringify(tok));
    //set new tok settings
    tok.set('statusmarkers', currentMarkers.join(','));
    //trigger tokenChange event for other api scripts
    notifyObservers('tokenChange', tok, prevTok);
  };

  /**
   * Applies a simple arithmetic rule such as "*0.5", "/2", "+5" or "-10" to a value. Multiplication and division
   * are rounded down. Used for save, resistance, vulnerability and immunity adjustments.
   *
   * @param {number} val - Value to adjust.
   * @param {string} rule - Operator followed by a number; whitespace is ignored.
   * @returns {number} Adjusted value.
   */
  const applyMathRule = function (val, rule) {
    //rule should look like "*2", "-10", "/2", etc.
    rule = rule.replace(/\s+/g, '');

    const operator = rule.substring(0, 1);
    const operand = parseFloat(rule.replace(operator, ''));

    let retVal = val; //unknown operator: leave the value unchanged
    switch (operator) {
      case '*':
        retVal = Math.floor(val * operand);
        break;
      case '/':
        retVal = Math.floor(val / operand);
        break;
      case '+':
        retVal = val + operand;
        break;
      case '-':
        retVal = val - operand;
        break;
    }
    return retVal;
  };

  // ————— RESULTS OUTPUT —————
  //this was modified from Jakob's group-check api script
  /**
   * Takes the rolled saving throws, works out each target's damage (save rule plus resistances, vulnerabilities and
   * immunities) and pass/fail markers, optionally auto-applies damage and markers, applies any caster condition, and
   * sends the public chat card plus GM-whispered rows and damage summaries.
   *
   * @param {object[][]} messages - sendChat callback messages for the save rolls, one per target.
   * @param {object[]} damageRolls - Formatted damage roll entries.
   * @param {object[]} tokenRolls - Target entries from processTokenRolls (mutated with roll results).
   * @param {object} aoeLink - AoE link from state.
   */
  const processFinalMessages = function (messages, damageRolls, tokenRolls, aoeLink) {
    //roll results arrive as arrays (one entry per inline roll in the line). Turn them into numbers before doing maths:
    //"[5] + 2" used to give "52", and a line with two rolls compared as NaN
    const lineTotal = (vals) => [].concat(vals).reduce((sum, v) => sum + (Number(v) || 0), 0);
    const firstRoll = (vals) => Number([].concat(vals)[0]) || 0;
    //takes all the rolls that were processed thru the Roll20 die roller for all tokens and formats them.
    //   then, we will format the final chat output
    const publicDamageMessages = [];
    const gmDamageMessages = [];
    let autoApplyMsg = '';
    let name; //override for ApplyDamage function
    let whisperString = '';
    let atLeastOneFailedSave = false;

    if (aoeLink.whisperAll) {
      whisperString = aoeLink.whisperString || '';
    }

    attachRollResults(messages, tokenRolls);

    // Format rows of output
    const outputNew = buildTitle(aoeLink.cardParameters) + buildDamageRows(damageRolls, aoeLink);

    const saveHeaderRow = buildSaveHeaderRow(aoeLink.cardParameters);

    //Calculate damage and status markers based on individual saving throws
    const saveRolls = tokenRolls.map((o) => {
      let tempDam1, tempDam2;
      const thisDamage = [];
      let thisMarker = '';
      let thisSaveRoll;
      const RVI = []; //Resistances, Vulnerabilities, Immunities
      let RVI_string = '';

      tempDam1 = lineTotal(damageRolls[0].result_1);

      const damType1 = aoeLink.damageType1.toLowerCase();
      const damType2 = aoeLink.damageType2.toLowerCase();

      thisSaveRoll = firstRoll(o.result_1);
      if (o.roll2x) {
        RVI.push('A'); //rolling with advantage
        if (o.result_1[0] >= o.result_2[0]) {
          o.styled_2 = o.styled_2.replace('color:#000000', 'color:#999999');
        } else if (o.result_2[0] > o.result_1[0]) {
          thisSaveRoll = firstRoll(o.result_2);
          o.styled_1 = o.styled_1.replace('color:#000000', 'color:#999999');
        }
      }

      //Account for Vulnerabilities, resistances, and immunities for damage types 1 & 2
      if (damType1 !== '' && o.vulnerabilities.includes(damType1)) {
        tempDam1 = applyMathRule(tempDam1, aoeLink.vulnerableRule);
        pushUniqueElementToArray(RVI, 'V');
      }
      if (damType1 !== '' && o.resistances.includes(damType1)) {
        tempDam1 = applyMathRule(tempDam1, aoeLink.resistanceRule);
        pushUniqueElementToArray(RVI, 'R');
      }
      if (damType1 !== '' && o.immunities.includes(damType1)) {
        tempDam1 = applyMathRule(tempDam1, aoeLink.immunityRule);
        pushUniqueElementToArray(RVI, 'I');
      }
      if (damageRolls.length > 1) {
        tempDam2 = lineTotal(damageRolls[1].result_1);
        if (damType2 !== '' && o.vulnerabilities.includes(damType2)) {
          tempDam2 = applyMathRule(tempDam2, aoeLink.vulnerableRule);
          pushUniqueElementToArray(RVI, 'V');
        }
        if (damType2 !== '' && o.resistances.includes(damType2)) {
          tempDam2 = applyMathRule(tempDam2, aoeLink.resistanceRule);
          pushUniqueElementToArray(RVI, 'R');
        }
        if (damType2 !== '' && o.immunities.includes(damType2)) {
          tempDam2 = applyMathRule(tempDam2, aoeLink.immunityRule);
          pushUniqueElementToArray(RVI, 'I');
        }
      }
      if (RVI.length > 0) {
        RVI_string = RVI.join(',');
      }

      //check save result
      if (thisSaveRoll >= o.DC) {
        success = true;
        tempDam1 = applyMathRule(tempDam1, aoeLink.damageSaveRule);

        thisDamage.push(tempDam1);
        //check for 2nd damage type
        if (damageRolls.length > 1) {
          tempDam2 = applyMathRule(tempDam2, aoeLink.damageSaveRule);
          thisDamage.push(tempDam2);
        }
        if (aoeLink.conditionPass && aoeLink.autoApply) {
          addStatusMarkers(o.id, aoeLink.conditionPass);
        }
        thisMarker = aoeLink.conditionPass;
      } else {
        success = false;
        atLeastOneFailedSave = true;
        thisDamage.push(tempDam1);
        if (damageRolls.length > 1) {
          thisDamage.push(tempDam2);
        }
        if (aoeLink.conditionFail && aoeLink.autoApply) {
          addStatusMarkers(o.id, aoeLink.conditionFail);
        }

        thisMarker = aoeLink.conditionFail;
      }

      if (aoeLink.hideNames) {
        targetNum += 1;
        name = `Target_${targetNum}`;
      } else {
        name = o.name;
      }

      if (aoeLink.autoApply) {
        const damMsg = applyDamage(
          o.id,
          name,
          aoeLink.damageBar,
          thisDamage,
          aoeLink.zeroHPmarker,
          aoeLink.removeAtZero,
        );
        if (damMsg !== '') {
          if (o.layer === 'gmlayer' || aoeLink.whisperResults) {
            gmDamageMessages.push(damMsg);
          } else {
            publicDamageMessages.push(damMsg);
          }
        }
      }

      return buildSaveRow(
        o.pic,
        o.id,
        o.layer,
        name,
        success,
        o.styled_1,
        o.styled_2,
        o.roll2x,
        thisDamage,
        aoeLink.autoApply,
        aoeLink.damageBar,
        thisMarker,
        RVI_string,
        aoeLink.zeroHPmarker,
        aoeLink.removeAtZero,
        aoeLink.cardParameters,
        whisperString,
        aoeLink.whisperResults,
      );
    });

    if (aoeLink.casterCondition && !aoeLink.casterConditionOnFail) {
      addStatusMarkers(aoeLink.originTokID, aoeLink.casterCondition);
    } else if (aoeLink.casterCondition && aoeLink.casterConditionOnFail && atLeastOneFailedSave) {
      addStatusMarkers(aoeLink.originTokID, aoeLink.casterCondition);
    }

    const publicSaveRolls = saveRolls
      .filter((r) => {
        return r.layer !== 'gmlayer' && !aoeLink.whisperResults;
      })
      .map((e) => {
        return e.output;
      })
      .join('');

    const gmSaveRolls = saveRolls
      .filter((r) => {
        return r.layer === 'gmlayer' || aoeLink.whisperResults;
      })
      .map((e) => {
        return e.output;
      })
      .join('');

    const descRow = buildDescRow(aoeLink.cardParameters.descriptiontext, aoeLink.cardParameters);

    publicOutput = outputNew + buildTableBody(saveHeaderRow, publicSaveRolls, descRow, aoeLink.cardParameters);

    //public output
    sendChat(scriptName, `${whisperString} ${publicOutput}`);

    if (publicDamageMessages.length > 0) {
      autoApplyMsg = `${whisperString} <br>${publicDamageMessages.join('<br>')}`;
      sendChat(scriptName, autoApplyMsg);
    }

    //GM output
    if (gmSaveRolls) {
      gmOutput = buildGMOutput(gmSaveRolls, aoeLink.cardParameters);
      sendChat(scriptName, `/w gm ${gmOutput}`);
    }
    if (gmDamageMessages.length > 0) {
      autoApplyMsg = '/w gm <br>' + gmDamageMessages.join('<br>');
      sendChat(scriptName, autoApplyMsg);
    }
  };

  /**
   * Posts a public chat message reporting an error that happened while processing rolls.
   *
   * @param {*} err - Error or message from the failed roll promise.
   */
  const sendErrorMessage = function (err) {
    const errorMessage =
      'Something went wrong when processing rolls.<br>' + `The error message generated by Roll20 is:<br>${err}`;
    sendChat('SmartAoE', errorMessage);
  };

  // ————— HELP HANDOUT —————
  /** Name of the GM-only help handout SmartAoE creates and keeps up to date. */
  const HANDOUT_NAME = `${scriptName} — Help & Reference`;

  /** Chat commands for the help handout: [command, description]. Keep in step with COMMAND_HANDLERS and the README. */
  const HANDOUT_COMMANDS = [
    [
      '!smartaoe {{ --param|value … }}',
      'Create an AoE for the selected token (or --selectedID). See Parameters below.',
    ],
    [
      '!smarttrigger [controlTokenID]',
      'Trigger the selected control token’s AoE (or the one whose id is given) on everything inside it. Selecting one of the AoE squares also works.',
    ],
    [
      '!smartquery <tokenID>',
      'Trigger only the AoEs that overlap a token’s square, e.g. !smartquery @{target|Choose a Target|token_id} for start/end-of-turn effects.',
    ],
    ['!smartrotateorigin cw|ccw', 'Move a cone’s origin to the next corner/face of the caster.'],
    ['!smartremove', 'Remove all AoEs and control tokens linked to the selected token.'],
    [
      '!smartclearcache',
      'Forget every stored AoE link in the game (tokens and drawings stay). Use only if links are corrupted.',
    ],
    ['!smarthelp', 'Rebuild this help handout and whisper a link to it.'],
    ['!smartapply --args|…', 'Used by the chat card’s apply buttons. Not normally typed by hand.'],
  ];

  /** `!smartaoe` parameters for the help handout, grouped: [group, [[parameter, values, default], …]]. */
  const HANDOUT_PARAMS = [
    [
      'Shape and placement',
      [
        [
          '--aoeType',
          'line, square, circle, PFcircle, wall, cone[, angle], PFcone, 5econe; add ", float" to squares/circles to detach them',
          'line',
        ],
        ['--radius', 'number with units (30ft, 6u), bare number = pixels, or variable', 'variable'],
        ['--width', 'wall thickness (wall only)', '1 square'],
        ['--origin', 'center, nearest, or "nearest, face"', 'center'],
        ['--offset', 'x, y offset of the origin from the caster, in grid squares', '0, 0'],
        ['--forceIntersection', 'snap the control token to grid intersections', 'auto'],
        ['--minGridArea / --minTokArea', 'fraction (0–1) of a square / token that must be covered', '0.01'],
        ['--instant', 'delete the control token once triggered', 'false'],
        ['--affectsCaster', 'the caster can be affected', 'false'],
        ['--aoeLayer', 'objects/token, gm or map (map avoids the Jumpgate layering issue)', 'objects'],
        [
          '--selectedID / --playerID',
          'caster token id / controlling player id (for calls from other scripts)',
          'selection',
        ],
      ],
    ],
    [
      'Control token & appearance',
      [
        ['--controlTokName', 'character whose default token is used, or self', 'AoEControlToken'],
        ['--controlTokSize / --controlTokSide', 'size in squares / side of a multi-sided token', '1 / default'],
        ['--isDrawing / --tooltip', 'control token drawing flag / tooltip text', 'false / none'],
        ['--aoeColor / --aoeOutlineColor', '#RRGGBBAA fill / #RRGGBB outline, or player', '#ff000050 / #ff0000'],
        ['--gridColor / --outlineOnly', 'grid-line colour (alpha 00 hides) / outline without fill', '#000000 / false'],
        ['--fx', 'Roll20 effect <type>-<colour> on each affected square', 'none'],
        ['--spawnSound / --moveSound / --triggerSound / --deleteSound', 'jukebox track names', 'none'],
        ['--turnorder', 'name, value, formula, linked', 'linked'],
      ],
    ],
    [
      'Saves, damage & markers',
      [
        ['--dc / --saveFormula', 'save DC / 5eSTR…5eCHA or a formula (<<…>> and a{…} roll per target)', '0 / none'],
        [
          '--noSave / --ignore',
          'no save (assumed when there is no --saveFormula) / attrName, value to leave characters out',
          'false / none',
        ],
        [
          '--damageFormula1 / --damageFormula2',
          'number or roll each; negative heals; formula 2 can be used alone',
          'none',
        ],
        ['--damageType1 / --damageType2', 'damage type of each formula', 'none'],
        ['--damageSaveRule', 'operation on a successful save', '*0.5'],
        ['--bar / --autoApply', 'bar(s) to change, e.g. 3,1 / apply without the chat buttons', '1 / false'],
        [
          '--resistAttr / --vulnerableAttr / --immunityAttr',
          'attributes listing the target’s defences',
          'npc_resistances …',
        ],
        [
          '--resistanceRule / --vulnerableRule',
          'operation for resistance / vulnerability (immunity is *0)',
          '*0.5 / *2',
        ],
        [
          '--resource',
          'attrName, cost, alias, limit — resource (e.g. spell slot) spent by the caster: counts down to 0, or with a limit (number, max or an attribute) counts up to it. 2024-sheet spell slots (lvlN_slots_expended) count up to lvlN_slots_total without a limit',
          'cost 1',
        ],
        ['--conditionFail / --conditionPass', 'marker(s) on a failed / passed save (@# adds a number)', 'none'],
        [
          '--zeroHPmarker / --removeAtZero',
          'marker when the last bar reaches 0 / remove the token at 0',
          'none / false',
        ],
        ['--casterCondition', 'marker on the caster, or "marker, onFail"', 'none'],
      ],
    ],
    [
      'Chat card',
      [
        [
          '--title / --leftSub / --rightSub / --desc',
          'card title, subtitles and description (%br% = line break)',
          'SmartAoE',
        ],
        ['--hideNames', 'show targets as Target_1, Target_2…', 'false'],
        ['--whisperAll / --whisperResults', 'whisper the whole card / only the results', 'false'],
        ['--chatAvatarsEnabled', 'false if chat avatars are turned off', 'true'],
        [
          'Styling',
          '--titleCardBackground, --titleFontFace/Color/Size, --bodyFontFace/Size, --tableBGColor, --evenRowBackground, …',
          'see README',
        ],
      ],
    ],
  ];

  /** Example macros for the help handout: [title, macro text]. */
  const HANDOUT_EXAMPLES = [
    ['20 ft cube that floats freely', '!smartaoe {{\n  --aoeType|square, float\n  --radius|10ft\n}}'],
    [
      '5e cone that rotates around the caster',
      '!smartaoe {{\n  --aoeType|5econe\n  --radius|30ft\n  --minGridArea|0.25\n  --origin|nearest, face\n}}',
    ],
    [
      'Fireball: DEX save, half damage, 0 HP marker',
      '!smartaoe {{\n  --aoeType|circle, float\n  --radius|20ft\n  --dc|@{selected|spell_save_dc}\n  --saveFormula|5eDEX\n  --damageFormula1|[[8d6]]\n  --damageType1|fire\n  --zeroHPmarker|dead\n  --fx|burst-fire\n}}',
    ],
    [
      'Healing with no save',
      '!smartaoe {{\n  --aoeType|circle, float\n  --radius|15ft\n  --noSave|true\n  --damageFormula1|-10\n  --autoApply|true\n}}',
    ],
  ];

  /** Tips for the help handout: [title, text]. Mirrors the README. Text in `backticks` is shown as code. */
  const HANDOUT_TIPS = [
    [
      'Jumpgate layering',
      'In Jumpgate the AoE squares can cover tokens (a Roll20 issue). Add `--aoeLayer|map`, or refresh the browser. Clicking the control token may select a square instead; Trigger still works.',
    ],
    ['Attached squares and circles', 'Fixed-radius squares/circles without `float` only fit one-square casters.'],
    [
      'Line lengths',
      'Lines use true distance, so diagonals are shorter than 5e grid counting. Leave out `--radius` and place the token by hand for an exact count.',
    ],
    [
      'Called from other scripts',
      'Pass `--selectedID` and `--playerID`, or install SelectManager and run `!smconfig +playerid` once.',
    ],
    [
      '2024 (Beacon) sheets',
      'Use the Mod Script Sandbox v1.5. Saves, damage-type attributes, `--ignore` and `--resource` read the 2024 sheet; spell slots (`lvlN_slots_expended`) count up to `lvlN_slots_total`. Magic Resistance comes from a feature of that name.',
    ],
    ['Stale links', 'If AoEs stop matching the map (e.g. after copying pages), run `!smartclearcache`.'],
  ];

  /**
   * Grid rules for the help handout: [rules, settings]. Mirrors the README's "Grid rules by game system". Text in
   * `backticks` is shown as code.
   */
  const HANDOUT_GRID_RULES = [
    [
      'D&D 5e 2024: an area covering at least half a square affects the whole square',
      '`--minGridArea|0.5`; cones with `--aoeType|5econe`',
    ],
    [
      'D&D 5e 2014, DMG: the half-square rule is given for circular areas (spheres, cylinders)',
      '`--minGridArea|0.5` on circles; the defaults on other shapes',
    ],
    [
      "D&D 5e 2014, Xanathar's template method: a square counts if any part of it is under the template",
      'The defaults (`0.01` / `0.01`); cones with `5econe`',
    ],
    [
      'Pathfinder 1e, D&D 3.5, Starfinder 1e: bursts and cones start at a grid intersection, every second diagonal counts double, and a square is in the area if its far edge is',
      "`--aoeType|PFcircle, float` or `PFcone` with `--forceIntersection|1` (tests each square's farthest corner)",
    ],
    [
      'Pathfinder 2e, Starfinder 2e: bursts start at a grid corner and are measured like movement; a creature is hit if any square of its space is in the area',
      "`PFcircle` with `--forceIntersection|1` for bursts, `PFcone` for cones, `line` for lines; keep `--minTokArea` at `0.01`. Emanations (from the sides of a creature's space) aren't modelled exactly: a `PFcircle` from a Medium creature's centre is closest",
    ],
    ['Templates where any creature the template touches is affected', 'The defaults (`0.01` / `0.01`)'],
    [
      'A square counts only if its centre is in the area',
      'No exact setting; `--minGridArea|0.5` is closest for circles',
    ],
  ];

  /**
   * Inline styles for the help handout. Roll20 strips <style> blocks, so there is no dark-mode media query: body text
   * inherits the theme's colour, accents are mid-tones that read on light and dark backgrounds, and tints are
   * semi-transparent grey.
   */
  const HANDOUT_STYLE = {
    outer: 'font-family:Arial,sans-serif;font-size:13px;',
    header: 'background-color:#8b1e1e;color:#fff;padding:10px 12px;border-radius:6px;',
    h1: 'margin:0;font-size:20px;color:#fff;',
    subtitle: 'margin:4px 0 0 0;font-size:12px;color:#f3d9c9;',
    h2: 'margin:18px 0 6px 0;font-size:16px;color:#cc5a32;border-bottom:2px solid #e0a35b;padding-bottom:2px;',
    h3: 'margin:12px 0 4px 0;font-size:14px;color:#cc5a32;',
    p: 'margin:4px 0 8px 0;line-height:1.4;',
    table: 'width:100%;border-collapse:collapse;margin:4px 0 10px 0;',
    th: 'background-color:#a8401f;color:#fff;text-align:left;padding:4px 6px;',
    td: 'padding:4px 6px;border-bottom:1px solid rgba(128,128,128,0.35);vertical-align:top;',
    code: 'font-family:monospace;background-color:rgba(128,128,128,0.2);border:1px solid rgba(128,128,128,0.35);border-radius:3px;padding:0 3px;',
    pre: 'font-family:monospace;background-color:rgba(128,128,128,0.12);border:1px solid rgba(128,128,128,0.35);padding:6px;white-space:pre-wrap;margin:4px 0 10px 0;',
    footer: 'margin-top:16px;font-size:11px;opacity:0.75;',
  };

  /**
   * Escapes text for handout HTML.
   *
   * @param {*} text - Value to escape.
   * @returns {string} HTML-safe text.
   */
  const escapeHandoutHtml = function (text) {
    return String(text ?? '').replace(
      /[&<>"'{}|@]/g,
      (ch) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
          '{': '&#123;',
          '}': '&#125;',
          '|': '&#124;',
          '@': '&#64;',
        })[ch],
    );
  };

  /**
   * Builds a handout table from rows of already-escaped HTML cells.
   *
   * @param {string[]}   headings - Column headings.
   * @param {string[][]} rows     - Cell HTML per row.
   * @returns {string} Table HTML.
   */
  const handoutTable = function (headings, rows) {
    const S = HANDOUT_STYLE;
    const head = headings.map((h) => `<th style="${S.th}">${h}</th>`).join('');
    const body = rows.map((cells) => `<tr>${cells.map((c) => `<td style="${S.td}">${c}</td>`).join('')}</tr>`).join('');
    return `<table style="${S.table}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  };

  /**
   * Wraps text as inline code in the handout.
   *
   * @param {string} text - Plain text.
   * @returns {string} HTML.
   */
  const handoutCode = function (text) {
    return `<span style="${HANDOUT_STYLE.code}">${escapeHandoutHtml(text)}</span>`;
  };

  /**
   * Escapes text for the handout, showing the parts in `backticks` as inline code that doesn't break across lines
   * (e.g. after the "--" of a parameter).
   *
   * @param {string} text - Plain text with optional `code` spans.
   * @returns {string} HTML.
   */
  const handoutText = function (text) {
    return String(text ?? '')
      .split('`')
      .map((part, i) =>
        i % 2 === 1
          ? `<span style="${HANDOUT_STYLE.code}white-space:nowrap;">${escapeHandoutHtml(part)}</span>`
          : escapeHandoutHtml(part),
      )
      .join('');
  };

  /**
   * Generates the help handout HTML.
   *
   * @returns {string} Handout notes HTML.
   */
  const buildHandoutHtml = function () {
    const S = HANDOUT_STYLE;
    const p = (html) => `<p style="${S.p}">${html}</p>`;
    const overview =
      `<h2 style="${S.h2}">Overview</h2>` +
      p(
        'SmartAoE draws areas of effect on gridded maps and decides consistently which squares and creatures are inside. ' +
          'It can roll saving throws, apply damage (with resistances, vulnerabilities and immunities), add condition markers and post a results card. ' +
          'This handout is GM-only and is rebuilt every time the script loads.',
      );
    const quickStart =
      `<h2 style="${S.h2}">Quick start</h2><ol style="${S.p}">` +
      [
        `Select the caster’s token and run a ${handoutCode('!smartaoe')} macro (the ${handoutCode('AoEGenerator')} macro whispers a menu of ready-made AoEs).`,
        'Move the control token (the reticle) to aim; cones and lines run from the caster towards it.',
        `Select the control token and run ${handoutCode('!smarttrigger')} (token action Trigger-ALL). Saves are rolled and a results card is posted.`,
        `With ${handoutCode('--autoApply|true')} damage and markers are applied at once; otherwise use the buttons on the card.`,
        `Delete the control token (or use ${handoutCode('--instant')}) to remove the AoE.`,
      ]
        .map((li) => `<li>${li}</li>`)
        .join('') +
      '</ol>';
    const commands =
      `<h2 style="${S.h2}">Commands</h2>` +
      handoutTable(
        ['Command', 'Description'],
        HANDOUT_COMMANDS.map(([cmd, desc]) => [handoutCode(cmd), escapeHandoutHtml(desc)]),
      );
    const params =
      `<h2 style="${S.h2}">!smartaoe parameters</h2>` +
      p('Parameters are case-insensitive. Yes/no options accept true/yes/1 and false/no/0.') +
      HANDOUT_PARAMS.map(
        ([group, rows]) =>
          `<h3 style="${S.h3}">${escapeHandoutHtml(group)}</h3>` +
          handoutTable(
            ['Parameter', 'Values', 'Default'],
            rows.map(([name, values, def]) => [handoutCode(name), escapeHandoutHtml(values), escapeHandoutHtml(def)]),
          ),
      ).join('');
    const examples =
      `<h2 style="${S.h2}">Examples</h2>` +
      HANDOUT_EXAMPLES.map(
        ([title, macro]) =>
          `<h3 style="${S.h3}">${escapeHandoutHtml(title)}</h3><pre style="${S.pre}">${escapeHandoutHtml(macro)}</pre>`,
      ).join('');
    const gridRules =
      `<h2 style="${S.h2}">Grid rules by game system</h2>` +
      p(
        `Two settings decide which squares and creatures an AoE hits: ${handoutCode('--minGridArea')} (how much of a square must be covered for it to count) and ${handoutCode('--minTokArea')} (how much of a token must be in the counted squares). Both default to ${handoutCode('0.01')}, so almost any overlap counts. Set them to match your game’s rules:`,
      ) +
      handoutTable(
        ['Rules', 'Settings'],
        HANDOUT_GRID_RULES.map(([rules, settings]) => [escapeHandoutHtml(rules), handoutText(settings)]),
      ) +
      p(
        '<b>The drawn squares are the ruling.</b> SmartAoE works out how much of each square the shape covers and draws only the squares that count, so there is no template edge to judge by eye, whichever rule you use.',
      ) +
      p(
        `<b>Creature size.</b> Hits are decided by squares, not by how much of a creature the area covers. A token is hit when at least ${handoutCode('--minTokArea')} of it lies in counted squares. With the default ${handoutCode('0.01')}, a Tiny creature in a counted square is hit however small its token, and a token that straddles squares is hit if any part of it is in a counted square. Raise ${handoutCode('--minTokArea')} (e.g. ${handoutCode('0.5')}) only if your table wants most of a creature’s space to be inside.`,
      ) +
      p(
        'SmartAoE needs a gridded page. These are guides: check your rulebook, as tables often house-rule areas of effect.',
      );
    const integration =
      `<h2 style="${S.h2}">Other scripts</h2>` +
      p(
        `Scripts can react to SmartAoE’s token changes with ${handoutCode('SmartAoE.ObserveTokenChange(fn)')}, and read the 0 HP marker tags it has used with ${handoutCode('SmartAoE.ZeroHPMarkers()')}. HealthColors uses both.`,
      );
    const tips =
      `<h2 style="${S.h2}">Tips &amp; known limitations</h2><ul style="${S.p}">` +
      HANDOUT_TIPS.map(
        ([t, x]) => `<li style="margin-bottom:4px;"><b>${escapeHandoutHtml(t)}:</b> ${handoutText(x)}</li>`,
      ).join('') +
      '</ul>';
    const footer = `<p style="${S.footer}">${scriptName} v${version} · Author David M. (djmoorehead) · Full documentation: wiki.roll20.net/SmartAoE</p>`;
    return (
      `<div style="${S.outer}"><div style="${S.header}"><h1 style="${S.h1}">${scriptName}</h1>` +
      `<p style="${S.subtitle}">Version ${version} · Help &amp; Reference</p></div>` +
      `${overview}${quickStart}${commands}${params}${examples}${gridRules}${integration}${tips}${footer}</div>`
    );
  };

  /**
   * Creates the GM-only help handout, or rewrites its notes when it already exists.
   * Extra handouts with the same name are left alone (only the first is updated).
   *
   * @returns {object|undefined} The Roll20 handout, or undefined if it could not be written.
   */
  const installHandout = function () {
    try {
      const handout =
        findObjs({ _type: 'handout', name: HANDOUT_NAME })[0] ||
        createObj('handout', { name: HANDOUT_NAME, inplayerjournals: '', controlledby: '' });
      if (!handout) return undefined;
      handout.set({ inplayerjournals: '', controlledby: '' });
      handout.set('notes', buildHandoutHtml());
      return handout;
    } catch (err) {
      log(`${scriptName}: could not update the help handout: ${(err && err.message) || err}`);
      return undefined;
    }
  };

  /**
   * Identifies who sent a chat command, for whispering replies back to them.
   *
   * @param {object} msg - Roll20 chat message.
   * @param {string} [fallback=''] - Whisper prefix to use when the player can't be found (e.g. '/w gm').
   * @returns {{who:(string|undefined), whisperString:string}} The player's display name and '/w "name"' prefix.
   */
  const getCaller = function (msg, fallback = '') {
    const player = getObj('player', msg.playerid);
    const who = player ? player.get('_displayname') : undefined;
    return { who, whisperString: who === undefined ? fallback : `/w "${who}"` };
  };

  /**
   * Handles `!smarthelp`: rebuilds the help handout and whispers the caller a link to it.
   *
   * @param {object} msg - Roll20 chat message.
   * @returns {Promise<void>}
   */
  const handleHelpCommand = async function (msg) {
    const { whisperString } = getCaller(msg, '/w gm');
    const handout = installHandout();
    const link = handout
      ? `[Open the SmartAoE help handout](http://journal.roll20.net/handout/${handout.id})`
      : 'Could not create the help handout; see the API console.';
    sendChat(scriptName, `${whisperString} ${link}`, null, { noarchive: true });
  };

  // ————— CHAT COMMANDS —————
  //Finds the token to trigger from the chat selection. In Jumpgate the AoE squares can sit on top of the
  //control token, so clicking it may select one of the squares instead: map a selected AoE square back to
  //its link's control token. Returns undefined when nothing usable is selected.
  /**
   * Picks the token to trigger from the chat selection. If an AoE grid square (path) is selected instead, as can
   * happen in Jumpgate where squares sit over the control token, it maps the path back to its link's control token.
   *
   * @param {object[]} selected - msg.selected entries ({_type, _id}).
   * @returns {object|undefined} Roll20 graphic to trigger, or undefined if nothing usable is selected.
   */
  const findTriggerToken = function (selected) {
    if (!selected || selected.length === 0) {
      return undefined;
    }
    for (let i = 0; i < selected.length; i++) {
      const sel = selected[i];
      if (sel._type === 'graphic') {
        const g = getObj('graphic', sel._id);
        if (g) {
          return g;
        }
      } else if (sel._type === 'path') {
        const link = state[scriptName].links.find((l) => (l.pathIDs || []).includes(sel._id));
        if (link) {
          const ctl = getObj('graphic', link.controlTokID);
          if (ctl) {
            return ctl;
          }
        }
      }
    }
    return undefined;
  };

  /**
   * Handles `!smartclearcache`. Resets SmartAoE's state, unlinking every AoE in the campaign (existing paths and
   * control tokens are left on the board), and whispers a confirmation to the caller.
   *
   * @param {object} msg - Roll20 chat message.
   * @returns {Promise<void>}
   */
  const handleClearCacheCommand = async function (msg) {
    const { whisperString } = getCaller(msg);
    resetLinks();
    sendChat(
      scriptName,
      `${whisperString} The SmartAoE cache has been cleared and all AoEs have been unlinked!<br>Any active AoEs in the campaign will have to be deleted manually.`,
      null,
      {
        noarchive: true,
      },
    );
  };

  /**
   * Handles `!smartremove [tokenID]`. Deletes the AoE links, paths and control tokens for the given token, or the
   * first selected token if no ID is passed; whispers an error if neither is available.
   *
   * @param {object} msg - Roll20 chat message.
   * @returns {Promise<void>}
   */
  const handleRemoveCommand = async function (msg) {
    let tok;

    const { whisperString } = getCaller(msg);
    let tokID;

    const args = msg.content.split(/\s+/);

    if (args.length > 1) {
      tokID = args[1];
    } else if (msg.selected) {
      tokID = msg.selected[0]._id;
    } else {
      sendChat(
        scriptName,
        `${whisperString} You must have a token selected or pass a valid token_id in order to proceed`,
        null,
        {
          noarchive: true,
        },
      );
      return;
    }

    tok = getObj('graphic', tokID);
    if (!tok) {
      sendChat(scriptName, `${whisperString} Unable to find a token with id = ${tokID}`, null, { noarchive: true });
      return;
    }
    deleteAoELinksAndControlToks(tok);
  };

  /**
   * Handles `!smartquery [targetTokenID]`. Finds every AoE that covers the target token (or the first selected
   * token) and sends `!smarttrigger controlTokenID targetTokenID` for each one, so the target alone is resolved.
   *
   * @param {object} msg - Roll20 chat message.
   * @returns {Promise<void>}
   */
  const handleQueryCommand = async function (msg) {
    const { whisperString } = getCaller(msg);
    let targetTok;
    let targetTokID;

    const args = msg.content.split(/\s+/);

    if (args.length > 1) {
      targetTokID = args[1];
    } else if (msg.selected && msg.selected.length > 0) {
      targetTokID = msg.selected[0]._id;
    } else {
      sendChat(
        scriptName,
        `${whisperString} You must have a token selected or pass a valid token_id in order to proceed`,
        null,
        {
          noarchive: true,
        },
      );
      return;
    }
    targetTok = getObj('graphic', targetTokID);

    if (targetTok) {
      const aoeLinks = getAoELinks(targetTokID, true);

      if (aoeLinks) {
        aoeLinks.links.forEach((link) => {
          sendChat('', `!smarttrigger ${link.controlTokID} ${targetTok.get('_id')}`);
        });
      }
    } else {
      sendChat(scriptName, `${whisperString} Unable to find a token with id = ${targetTokID}`, null, {
        noarchive: true,
      });
    }
  };

  /**
   * Handles the chat-card button command `!smartapply
   * --args|tokenID|"name"|bars|damage|marker|zeroHPmarker|removeAtZero|gmWhisper|whisperString`.
   * Restores %apostrophe%/%backtick% escapes and %% as ::, applies the damage via applyDamage, adds the condition
   * marker, and reports the result in chat (GM whisper if gmWhisper is true). "n/a" means no marker; damage is
   * "/"-separated.
   *
   * @param {object} msg - Roll20 chat message.
   * @returns {Promise<void>}
   */
  const handleApplyCommand = async function (msg) {
    //Before parsing, Un-replace any temporary special character replacements made when the button event text was created
    let args = msg.content
      .replace(/%apostrophe%/g, "'")
      .replace(/%backtick%/g, '`')
      .split(/\s+--args/);
    if (args.length > 1) {
      args = args[1].split(/\|/);
    }
    log(args);
    let damageMsg = '';

    const tokenID = args[1];
    const name = args[2];
    const bar = args[3].split(',').map((b) => b.trim());
    const damageArr = args[4].split('/').map((e) => parseInt(e));
    const marker = args[5].replace(/%%/g, '::').replace('n/a', '') || ''; //not all commands will include status marker(s)
    const zeroHPmarker = args[6].replace(/%%/g, '::').replace('n/a', '') || ''; //not all commands will include seroHPmarker(s)
    const removeAtZero = args[7].includes('true') ? true : false;
    const gmWhisper = args[8].includes('true') ? true : false;
    const whisperString = args[9];

    const token = getObj('graphic', tokenID);
    if (token) {
      damageMsg = applyDamage(tokenID, name, bar, damageArr, zeroHPmarker, removeAtZero);

      if (gmWhisper) {
        sendChat(scriptName, `/w gm ${damageMsg}`);
      } else {
        sendChat(scriptName, `${whisperString} ${damageMsg}`);
      }

      if (marker) {
        addStatusMarkers(tokenID, marker);
      }
    } else {
      sendChat(
        scriptName,
        `${whisperString} TokenID ${tokenID} does not seem to exist. Perhaps it was deleted or the id is incorrect.`,
        null,
        {
          noarchive: true,
        },
      );
    }
  };

  /**
   * Handles `!smartpinggm tokenID` and `!smartpingall tokenID`. Pings the token's location and moves the view there,
   * for all players (pingall) or only the caller (pinggm).
   *
   * @param {object} msg - Roll20 chat message.
   * @returns {Promise<void>}
   */
  const handlePingCommand = async function (msg) {
    const { whisperString } = getCaller(msg);

    const args = msg.content.split(/\s+/);
    const tokenID = args[1];

    const token = getObj('graphic', tokenID);
    if (token) {
      const page = getObj('page', token.get('_pageid'));
      if (msg.content.includes('smartpingall')) {
        sendPing(token.get('left'), token.get('top'), page.get('_id'), msg.playerid, true);
      } else {
        sendPing(token.get('left'), token.get('top'), page.get('_id'), msg.playerid, true, msg.playerid);
      }
    } else {
      sendChat(
        scriptName,
        `${whisperString} TokenID ${tokenID} does not exist. Perhaps it was deleted or the id is incorrect.`,
        null,
        {
          noarchive: true,
        },
      );
    }
  };

  /**
   * Handles `!smartrotateorigin cw|ccw` with a token selected. Moves each linked non-floating AoE (or wall) to the
   * next or previous candidate origin point and redraws it. "ccw" rotates counter-clockwise; anything else rotates
   * clockwise.
   *
   * @param {object} msg - Roll20 chat message.
   * @returns {Promise<void>}
   */
  const handleRotateOriginCommand = async function (msg) {
    let aoeLinks;

    const { whisperString } = getCaller(msg);

    const cmd = msg.content.split(/\s+/);

    if (cmd.length > 1) {
      let tok;
      let direction; // either +1 or -1

      tok = msg.selected && msg.selected[0] ? getObj('graphic', msg.selected[0]._id) : undefined;

      if (!tok) {
        sendChat(scriptName, `${whisperString} You must select a token to proceed`);
        return;
      }

      if (cmd[1].match(/ccw/i)) {
        //rotate originPt counter-clockwise
        direction = -1;
      } else {
        //default: rotate originPt clockwise
        direction = 1;
      }

      aoeLinks = getAoELinks(tok.get('id'));

      if (aoeLinks && aoeLinks.indices.length > 0) {
        //for each link associated with selected token (could be originTok or controlTok)
        for (let a = 0; a < aoeLinks.indices.length; a++) {
          if (aoeLinks.links[a].aoeFloat === false || aoeLinks.links[a].aoeType.match(/wall/i)) {
            //if floating AoE, rotating the origin point has no meaning (unless it is a wall, lol)

            //find new index (recycle through array of potential originPts)
            if (aoeLinks.links[a].originIndex + direction < 0) {
              newIndex = aoeLinks.links[a].originPts.length - 1;
            } else if (aoeLinks.links[a].originIndex + direction > aoeLinks.links[a].originPts.length - 1) {
              newIndex = 0;
            } else {
              newIndex = aoeLinks.links[a].originIndex + direction;
            }
            aoeLinks.links[a].originIndex = newIndex;

            //Update the State object with new origin index
            const oTok = getObj('graphic', aoeLinks.links[a].originTokID);
            if (!oTok) continue; //the caster token was deleted
            const oX = oTok.get('left');
            const oY = oTok.get('top');
            const offsetX = aoeLinks.links[a].originPts[aoeLinks.links[a].originIndex].x - oX;
            const offsetY = aoeLinks.links[a].originPts[aoeLinks.links[a].originIndex].y - oY;
            //Re-draw this AoE only (it used to redraw every linked AoE with this one's offsets)
            const thisLink = { links: [aoeLinks.links[a]], indices: [aoeLinks.indices[a]] };
            updateMapWithAoE(thisLink, false, offsetX, offsetY);
          }
        }
      }
    }
  };

  /**
   * Handles `!smarttrigger [controlTokenID] [targetTokenID]`. Resolves the AoE linked to the selected (or given) token:
   * finds character tokens covered by it (respecting ignore attributes, affectsCaster and minTokArea), spawns FX,
   * plays the trigger sound, rolls damage and saves, and continues in processMessagesMaster. With a target ID only that
   * token is resolved. Instant AoEs are deleted afterwards.
   *
   * @param {object} msg - Roll20 chat message.
   * @returns {Promise<void>}
   */
  const handleTriggerCommand = async function (msg) {
    let tok;
    let pageID;
    let controlTok = {}; //hoist to top so we can set from within a callback function
    let aoeLinks;

    const { whisperString } = getCaller(msg);

    const args = msg.content.split(/\s+/);
    let singleTarget = false;
    let targetID;
    let targetTok;

    if (args.length === 1) {
      //no ids passed - standard trigger that affects all toks in range
      tok = findTriggerToken(msg.selected);
    } else {
      tok = getObj('graphic', args[1]);
      if (args[2]) {
        //target id passed, this is a trigger for a single target (e.g. effect that happens on the targets turn rather than one a caster's turn)
        targetID = args[2];
        targetTok = getObj('graphic', targetID);
        if (!targetTok) {
          sendChat(scriptName, `${whisperString} Unable to find a target token with id = ${targetID}`, null, {
            noarchive: true,
          });
          return;
        }
        singleTarget = true;
      }
      //"!smarttrigger <controlTokenID>" with no target triggers everything in range (it used to crash)
    }

    if (!tok) {
      sendChat(
        scriptName,
        `${whisperString} Select an AoE control token (or its caster) to trigger, or pass its token id.`,
        null,
        {
          noarchive: true,
        },
      );
      return;
    }

    tableLineCounter = 0;
    targetNum = 0;

    pageID = tok.get('pageid');
    const thePage = getObj('page', pageID);
    pageGridIncrement = thePage.get('snapping_increment');

    //find links associated with the aoeControlToken
    aoeLinks = getAoELinks(tok.get('id'));
    if (!aoeLinks) {
      sendChat(
        scriptName,
        `${whisperString} That token is not part of a SmartAoE. Select an AoE control token (or its caster).`,
        null,
        {
          noarchive: true,
        },
      );
      return;
    }

    let validToks = [];
    if (singleTarget) {
      validToks.push(getObj('graphic', targetID));
    } else {
      //get an array of all tokens representing characters on the page
      validToks = findObjs({
        _pageid: pageID,
        _type: 'graphic',
      });

      validToks = validToks.filter((t) => {
        return t.get('represents') !== '' && (t.get('layer') === 'objects' || t.get('layer') === 'gmlayer');
      });
    }

    //add some key location & size params to validToks for later evaluation
    validToks = validToks.map((t) => {
      return {
        tok: t,
        center: new pt(t.get('left'), t.get('top')),
        width: t.get('width'),
        height: t.get('height'),
        area: t.get('width') * t.get('height'),
        corners: getCellCoords(t.get('left'), t.get('top'), t.get('width'), t.get('height')),
        overlapArea: 0,
      };
    });

    let instant = false;
    let isOriginTok = false;
    if (aoeLinks.indices.length > 0) {
      const trackName = aoeLinks.links[0].triggerSound;
      if (trackName !== '') {
        playJukeboxTrack(trackName, whisperString);
      }
      //for each link associated with selected token (could be originTok or controlTok)
      for (let a = 0; a < aoeLinks.indices.length; a++) {
        //rolls and targets belong to this AoE only: each link posts its own card (they used to pile up across links)
        let tokenRolls = [];
        const damageRolls = [];
        //an AoE whose control token hasn't moved yet has no squares (or bounding box) to test against
        if (!aoeLinks.links[a].boundingBox || aoeLinks.links[a].boundingBox.length === 0) {
          sendChat(
            scriptName,
            `${whisperString} Move the AoE's control token to draw the area before triggering it.`,
            null,
            {
              noarchive: true,
            },
          );
          continue;
        }

        //first, filter for "ignore" attributes (legacy attribute objects, else the sheet item on Beacon sheets)
        let thisValidToks = [];
        for (const obj of validToks) {
          const represents = obj.tok.get('represents');
          const name = obj.tok.get('name');
          if (!represents || name === aoeLinks.links[a].controlTokName) continue;
          const ignoreAttr = aoeLinks.links[a].ignoreAttr;
          const ignoreVal = aoeLinks.links[a].ignoreVal.toString();
          const ignoreValue = ignoreAttr !== '' ? await readCharacterValue(represents, ignoreAttr) : undefined;
          if (!ignoreValue || ignoreValue.raw !== ignoreVal) thisValidToks.push(obj);
        }

        //Next, omit origin token and any tokens that don't have at least one corner in the AoE bounding box (or at least one corner of AoE bounding box is within the token bounding box)
        if (aoeLinks.links[a].affectsCaster) {
          thisValidToks = thisValidToks.filter((obj) => {
            return rectanglesOverlap(
              obj.corners[0],
              obj.corners[2],
              aoeLinks.links[a].boundingBox[0],
              aoeLinks.links[a].boundingBox[2],
            );
          });
        } else {
          thisValidToks = thisValidToks.filter((obj) => {
            return (
              obj.tok.get('_id') !== aoeLinks.links[a].originTokID &&
              rectanglesOverlap(
                obj.corners[0],
                obj.corners[2],
                aoeLinks.links[a].boundingBox[0],
                aoeLinks.links[a].boundingBox[2],
              )
            );
          });
        }

        //sort the linked paths by distance to originPt
        const tempOriginPt = aoeLinks.links[a].originPts[aoeLinks.links[a].originIndex];
        aoeLinks.links[a].pathIDs = sortPathsByDistanceToOrigin(aoeLinks.links[a].pathIDs, tempOriginPt);

        controlTok = getObj('graphic', aoeLinks.links[a].controlTokID);
        const tempControlPt = new pt(controlTok.get('left'), controlTok.get('top'));

        //beam is a special fx, only fired once
        if (aoeLinks.links[a].fxType.match(/beam/i) && aoeLinks.links[a].aoeType === 'line') {
          spawnFxBetweenPoints(tempOriginPt, tempControlPt, aoeLinks.links[a].fxType, pageID);
        } else if (singleTarget && aoeLinks.links[a].fxType !== '') {
          //if a singeTarget trigger, only spawn fx at target location
          spawnFx(targetTok.get('left'), targetTok.get('top'), aoeLinks.links[a].fxType, pageID);
        }

        //do stuff for every affected square of the linked AoE
        for (let p = 0; p < aoeLinks.links[a].pathIDs.length; p++) {
          const tempPath = getObj('path', aoeLinks.links[a].pathIDs[p]);
          if (tempPath) {
            if (tempPath.get('width') <= 70 * pageGridIncrement) {
              //possibly spawn FX
              if (aoeLinks.links[a].fxType !== '' && singleTarget === false) {
                spawnFx(tempPath.get('left'), tempPath.get('top'), aoeLinks.links[a].fxType, pageID);
              }
              //check for tokens within affected grid square, add area overlapping with AoE
              for (let t = 0; t < thisValidToks.length; t++) {
                const pathRect = getCellCoords(tempPath.get('left'), tempPath.get('top'), tempPath.get('width'));
                const overlapArea = calcRectangleOverlapArea(pathRect, thisValidToks[t].corners);
                thisValidToks[t].overlapArea += overlapArea;
              }
            }
          }
        }

        //define rolls for damage formulas 1 & 2. Each may be a roll or a plain number, independently
        //(previously formula 2 was dropped unless both formulas were rolls)
        const thisLink = aoeLinks.links[a];
        damageRolls.push({
          formula: thisLink.rollDamage1 ? thisLink.damageFormula1 : baseDamageFormula(thisLink.damageBase1),
        });
        if (thisLink.rollDamage2) {
          damageRolls.push({ formula: thisLink.damageFormula2 });
        } else if (Number.isFinite(thisLink.damageBase2) && thisLink.damageBase2 !== 0) {
          damageRolls.push({ formula: baseDamageFormula(thisLink.damageBase2) });
        }

        let foundIndex = -1;
        for (let t = 0; t < thisValidToks.length; t++) {
          if (thisValidToks[t].overlapArea >= aoeLinks.links[a].minTokArea * thisValidToks[t].area) {
            //only add unique tokenids to the array of "hit" tokens
            foundIndex = tokenRolls.findIndex((e) => e.id === thisValidToks[t].tok.get('_id'));
            if (foundIndex === -1) {
              const roll = await processTokenRolls(thisValidToks[t].tok, aoeLinks.links[a]);
              if (roll) tokenRolls.push(roll); //null when the token's character no longer exists
            }
          }
        }

        //sort tokenRolls by layer (descending -> "objects", "gmlayer") to put targets on gmlayer last in order
        //(in case hideNames is used, don't want a "skipped" token number spoiling anything)
        if (tokenRolls.length > 0) {
          tokenRolls = sortTokenRollsByLayer(tokenRolls);
        }

        Promise.all(
          damageRolls.map(
            (o) =>
              new Promise((resolve) => {
                sendChat('', `${o.formula}`, resolve);
              }),
          ),
        )
          .then(async (messages) => processMessagesMaster(messages, damageRolls, tokenRolls, aoeLinks.links[a]))
          .catch((err) => sendErrorMessage(err));

        //finally, check for instantaneous AoE and set flag for deletion
        if (aoeLinks.links[a].instant) {
          instant = true;
        }
        if (tok.get('id') === aoeLinks.links[a].originTokID) {
          isOriginTok = true;
        }
      } //end aoeLink loop
    }

    //if the AoE settings are set to instant, remove the AoE after triggering
    if (instant) {
      if (isOriginTok) {
        deleteAoELinksAndControlToks(tok);
      } else {
        tok.remove();
      }
    }
  };

  /**
   * Handles `!smartaoe {{ --param|value ... }}`. Parses the AoE definition (shape, size, origin, colours, save and
   * damage rules, markers, sounds, chat-card styling, resources, turn tracker), finds the caster token (selected or
   * via --selectedID/--playerID when called by another script), and checks and spends any resource. It then spawns the
   * control token(s) from the controlTokName character's default token (or uses the caster for "self"), draws the
   * initial path, and stores the link in state via makeAoELink. Also applies a caster condition and plays the spawn
   * sound.
   *
   * @param {object} msg - Roll20 chat message.
   * @returns {Promise<void>}
   */
  const handleCreateAoeCommand = async function (msg) {
    let who;
    let whisperString;
    let whisperAll = false;
    let whisperResults = false;
    let selectedID;
    let playerID; //which player called the script. Will determine who gets whispered results
    let pageID;
    let radius = 'variable'; //maximum radius, in pixels
    let wallWidth = 70;
    let originType = 'center'; //"nearest" corner/face, "center"
    let aoeType = 'line';
    let offsetX = 0;
    let offsetY = 0;
    let forceIntersection;
    let coneWidth;
    let controlToks = [];
    let controlTok = {}; //hoist to top so we can set from within a callback function
    let minGridArea = 0.01; //from 0 to 1, minimum fraction of grid cell to be "counted" as within AoE (ignored for line effects)
    let minTokArea = 0.01; //from 0 to 1, minimum fraction of token area in order to be "counted" as within AoE
    let fxType = '';
    let controlTokName = 'AoEControlToken';
    let controlTokSize = 1;
    let controlTokSide = -999;
    let aoeColor = '#ff000050';
    let aoeOutlineColor = '#ff0000';
    let gridColor = '#000000';
    let instant = false;
    let isDrawing = false;
    let ignoreAttr = '';
    let ignoreVal = '';
    let outlineOnly = false;
    let aoeLayer = 'objects';
    let DC = 0;
    let noSave = false;
    let saveFormula = '';
    let saveName = '';
    let damageFormula1 = 'damageFormula1';
    let damageFormula2 = 'damageFormula2';
    let rollDamage1 = false;
    let rollDamage2 = false;
    let damageBase1 = 0;
    let damageBase2 = 0;
    let damageType1 = '';
    let damageType2 = '';
    let damageBar = [1];
    let conditionFail = '';
    let conditionPass = '';
    let zeroHPmarker = '';
    let removeAtZero = false;
    let autoApply = false;
    let aoeFloat = false;
    let tooltip = '';
    let damageSaveRule = '*0.5';
    let resistanceRule = '*0.5';
    let vulnerableRule = '*2';
    const immunityRule = '*0';
    let resistAttrs = ['npc_resistances'];
    let vulnerableAttrs = ['npc_vulnerabilities'];
    let immunityAttrs = ['npc_immunities'];
    let oTok; //origin token
    let convertRadius = ''; //will we need to convert range from pixels to "u" or another page-defined distance unit?
    let convertWidth = ''; //will we need to convert the wallWidth from pixels to "u" or another page-defined distance unit?
    let hideNames = false;
    let getFillColor = false;
    let getOutlineColor = false;
    let resourceName = '';
    let resourceCost = 0;
    let resourceAlias = '';
    let resourceLimit = '';
    let spawnSound = '';
    let moveSound = '';
    let triggerSound = '';
    let deleteSound = '';
    let turnName = '';
    let turnValue = 0;
    let turnFormula = 0;
    let linkTurnToToken = true;
    let casterCondition = '';
    let casterConditionOnFail = false;
    let affectsCaster = false;

    ({ who, whisperString } = getCaller(msg));
    const player = getObj('player', msg.playerid); //for --aoeColor|player

    const retVal = [];
    //Initialize output formatting
    cardParameters = {};
    Object.assign(cardParameters, defaultParameters);

    //Parse msg into an array of argument objects [{cmd:params}]
    const args = parseArgs(msg);
    //assign values to our params arrray based on args
    args.forEach((arg) => {
      const option = arg['cmd'].toLowerCase().trim();
      const param = arg['params'].trim();
      const inlines = arg['inlines'];

      switch (option) {
        case 'selectedid':
          selectedID = param;
          break;
        case 'playerid':
          playerID = param;
          break;
        case 'radius':
          radius = parseFloat(param);
          const u = param.match(/[a-zA-Z]+/gi); //if not an empty string, we will use page settings to convert radius to "u" or other map-defined units
          if (u !== null) {
            convertRadius = u[0];
          }
          break;
        case 'width':
          wallWidth = parseFloat(param);
          const wu = param.match(/[a-zA-Z]+/gi); //if not an empty string, we will use page settings to convert radius to "u" or other map-defined units
          if (wu !== null) {
            convertWidth = wu[0];
          }
          break;
        case 'controltokname':
          controlTokName = param;
          break;
        case 'controltoksize':
          controlTokSize = parseFloat(param);
          break;
        case 'controltokside':
          controlTokSide = param;
          break;
        case 'aoetype':
          const w = param.toLowerCase();
          if (w.includes('circle')) {
            if (w.includes('float')) {
              aoeFloat = true;
            }
            aoeType = w.includes('pfcircle') ? 'PFcircle' : 'circle';
          } else if (w.includes('sq')) {
            aoeType = 'square';
            if (w.includes('float')) {
              aoeFloat = true;
            }
          } else if (w.includes('5econe')) {
            aoeType = '5econe';
            coneWidth = 53.14;
          } else if (w.includes('pfcone')) {
            aoeType = 'PFcone';
            coneWidth = 90;
          } else if (w.includes('cone')) {
            aoeType = 'cone';
            const tempType = param.split(',').map((layer) => layer.trim());
            if (tempType.length > 1) {
              coneWidth = parseFloat(tempType[1]);
            }
            if (!isNumber(coneWidth)) {
              sendChat(scriptName, `${whisperString} Unable to determine cone width. 90deg cone will be used.`);
              coneWidth = 90;
            }
          } else if (w.includes('wall')) {
            aoeType = 'wall';
            aoeFloat = true;
            originType = 'nearest,face';
          } else {
            //default
            aoeType = 'line';
          }
          break;
        case 'origin':
          originType = param;
          break;
        case 'offset':
          const direction = param.split(',');
          offsetX = parseFloat(direction[0]); //wil convert to pixels later
          offsetY = parseFloat(direction[1]); //wil convert to pixels later
          break;
        case 'forceintersection':
          if (_.contains(['true', 'yes', '1'], param.toLowerCase())) {
            forceIntersection = true;
            isDrawing = true;
          } else if (_.contains(['false', 'no', '0'], param.toLowerCase())) {
            forceIntersection = false;
          }
          break;
        case 'mingridarea':
          minGridArea = parseFloat(param);
          break;
        case 'mintokarea':
          minTokArea = parseFloat(param);
          break;
        case 'fx':
          fxType = param;
          break;
        case 'aoecolor':
          //user passed an html color
          if (param.match(/#/)) {
            const f = param.split('#');
            aoeColor = toFullColor(f[1]);
          } else if (param.includes('player') && 'API' !== msg.playerid) {
            if (player) {
              //player was obtained above from msg.playerid. Will fail when called from API
              aoeColor = player.get('color') + '50';
            } else {
              sendChat(
                scriptName,
                `${whisperString} Error attempting to set aoeColor to player color, so default color will be used`,
              );
            }
            //if no player object already, attempt to get from a player id or player name argument
          } else if ('API' === msg.playerid) {
            //attempt to get player color later in the script (after all args have been parsed - user should have passed a playerID)
            getFillColor = true;
          }
          break;
        case 'aoeoutlinecolor':
          //user passed an html color
          if (param.match(/#/)) {
            const f = param.split('#');
            aoeOutlineColor = toFullColor(f[1]);
          } else if (param.includes('player') && 'API' !== msg.playerid) {
            if (player) {
              //player was obtained above from msg.playerid. Will fail when called from API
              aoeOutlineColor = player.get('color') + '50';
            } else {
              sendChat(
                scriptName,
                `${whisperString} Error attempting to set aoeOutlineColor to player color, so default color will be used`,
              );
            }
            //if no player object already, attempt to get from a player id or player name argument
          } else if ('API' === msg.playerid) {
            //attempt to get player color later in the script (after all args have been parsed - user should have passed a playerID)
            getOutlineColor = true;
          }
          break;
        case 'gridcolor':
          if (param.match(/#/)) {
            const f = param.split('#');
            gridColor = toFullColor(f[1]);
          }
          break;
        case 'instant':
          if (_.contains(['true', 'yes', '1'], param.toLowerCase())) {
            instant = true;
          }
          break;
        case 'isdrawing':
          if (aoeFloat || _.contains(['true', 'yes', '1'], param.toLowerCase())) {
            isDrawing = true;
          }
          break;
        case 'ignore':
          const ig = param.split(',').map((e) => e.trim());
          if (ig.length < 2) {
            throw 'Invalid argument syntax.<br>Structure is --ignore|attrName,value';
          } else {
            ignoreAttr = ig[0];
            ignoreVal = ig[1];
          }
          break;
        case 'dc':
          DC = parseInt(param);
          break;
        case 'nosave':
          if (_.contains(['true', 'yes', '1'], param.toLowerCase())) {
            noSave = true;
            DC = 999999;
          }
          break; // (was missing: --noSave|false fell through and set the save formula to "false")
        case 'saveformula':
          const s = param.toLowerCase();
          if (saveList.hasOwnProperty(s)) {
            saveFormula = saveList[s].formula;
            saveName = saveList[s].name;
          } else {
            //custom formula, user-defined
            saveFormula = param.replace(/<</g, '[[').replace(/>>/g, ']]').replace(/a{/g, '@{').replace(/\s+/g, '');
            //example: "<<1d20 +a{dodge}[DODGE]>>"" becomes "[[1d20 +@{dodge}[DODGE]]]"
          }
          break;
        case 'bar':
          damageBar = param.split(',').map((b) => parseInt(b.trim()));
          break;
        case 'autoapply':
          if (_.contains(['true', 'yes', '1'], param.toLowerCase())) {
            autoApply = true;
          }
          break;
        case 'damageformula1':
          const d1 = param.toLowerCase();
          if (d1.search('<<') !== -1) {
            //custom formula, user-defined
            damageFormula1 = param.replace(/<</g, '[[').replace(/>>/g, ']]').replace(/a{/g, '@{').replace(/\s+/g, '');
            rollDamage1 = true;
            //example: "<<(8+?{Cast at what level?|3,0|4,1|5,2|6,3|7,4|8,5|9,6})d6>>"" becomes something like "[[(8+1)d6]]"
          } else {
            if (inlines[0] === undefined) {
              damageBase1 = parseInt(d1);
            } else {
              damageFormula1 = `[[${decodeInlineExpression(inlines[0].expression)}]]`;
              rollDamage1 = true;
            }
          }
          break;
        case 'damageformula2':
          const d2 = param.toLowerCase();
          if (d2.search('<<') !== -1) {
            //custom formula, user-defined
            damageFormula2 = param.replace(/<</g, '[[').replace(/>>/g, ']]').replace(/a{/g, '@{').replace(/\s+/g, '');
            rollDamage2 = true;
            //example: "<<(8+?{Cast at what level?|3,0|4,1|5,2|6,3|7,4|8,5|9,6})d6>>"" becomes something like "[[(8+1)d6]]"
          } else {
            if (inlines[0] === undefined) {
              damageBase2 = parseInt(d2); //was damageBase1, which overwrote formula 1's damage
            } else {
              damageFormula2 = `[[${decodeInlineExpression(inlines[0].expression)}]]`;
              rollDamage2 = true;
            }
          }
          break;
        case 'damagetype1':
          damageType1 = param;
          break;
        case 'damagetype2':
          damageType2 = param;
          break;
        case 'conditionfail':
          //ensure no spaces between commas (required for the statusmarkers property of graphic object)
          conditionFail = param
            .split(',')
            .map((s) => s.trim())
            .join(',');
          break;
        case 'conditionpass':
          //ensure no spaces between commas (required for the statusmarkers property of graphic object)
          conditionPass = param
            .split(',')
            .map((s) => s.trim())
            .join(',');
          break;
        case 'zerohpmarker':
          //ensure no spaces between commas (required for the statusmarkers property of graphic object)
          zeroHPmarker = param
            .split(',')
            .map((s) => s.trim())
            .join(',');
          break;
        case 'removeatzero':
          if (_.contains(['true', 'yes', '1'], param.toLowerCase())) {
            removeAtZero = true;
          }
          break;
        case 'resistattr':
          resistAttrs = param.split(',').map((s) => s.trim());
          break;
        case 'vulnerableattr':
          vulnerableAttrs = param.split(',').map((s) => s.trim());
          break;
        case 'immunityattr':
          immunityAttrs = param.split(',').map((s) => s.trim());
          break;
        case 'damagesaverule':
          damageSaveRule = param.replace(/\s+/g, '');
          break;
        case 'resistancerule':
          resistanceRule = param.replace(/\s+/g, '');
          break;
        case 'vulnerablerule':
          vulnerableRule = param.replace(/\s+/g, '');
          break;
        case 'hidename':
        case 'hidenames':
          if (_.contains(['true', 'yes', '1'], param.toLowerCase())) {
            hideNames = true;
          }
          break;
        //Output formatting/content (CARD PARAMETERS)--------------------------------------
        case 'desc':
        case 'description':
          cardParameters.descriptiontext = param.replace(/%(.*?)%/g, '<$1>');
          break;
        case 'title':
          cardParameters.title = param;
          break;
        case 'leftsub':
          cardParameters.leftsub = param;
          break;
        case 'rightsub':
          cardParameters.rightsub = param;
          break;
        case 'titlecardbackground':
          cardParameters.titlecardbackground = param;
          break;
        case 'titlefontface':
          cardParameters.titlefontface = param;
          break;
        case 'titlefontcolor':
          cardParameters.titlefontcolor = param;
          break;
        case 'titlefontsize':
          cardParameters.titlefontsize = param;
          break;
        case 'titlefontlineheight':
          cardParameters.titlefontlineheight = param;
          break;
        case 'subtitlefontface':
          cardParameters.subtitlefontface = param;
          break;
        case 'subtitlefontcolor':
          cardParameters.subtitlefontcolor = param;
          break;
        case 'subtitlefontsize':
          cardParameters.subtitlefontsize = param;
          break;
        case 'bodyfontface':
          cardParameters.bodyfontface = param;
          break;
        case 'bodyfontsize':
          cardParameters.bodyfontsize = param;
          break;
        case 'tablebgcolor':
          cardParameters.tablebgcolor = param;
          break;
        case 'tableborder':
          cardParameters.tableborder = param;
          break;
        case 'tableborderradius':
          cardParameters.tableborderradius = param;
          break;
        case 'tableshadow':
          cardParameters.tableshadow = param;
          break;
        case 'titlecardbottomborder':
          cardParameters.titlecardbottomborder = param;
          break;
        case 'evenrowbackground':
          cardParameters.evenrowbackground = param;
          break;
        case 'oddrowbackground':
          cardParameters.oddrowbackground = param;
          break;
        case 'evenrowfontcolor':
          cardParameters.evenrowfontcolor = param;
          break;
        case 'oddrowfontcolor':
          cardParameters.oddrowfontcolor = param;
          break;
        case 'chatavatarsenabled':
          if (_.contains(['true', 'yes', '1'], param.toLowerCase())) {
            cardParameters.leftmargin = '-42px';
          } else {
            cardParameters.leftmargin = '-12px';
          }
          break;
        case 'resource':
          const r = param.split(',');
          resourceName = r[0].trim();
          if (r.length > 1) {
            resourceCost = parseFloat(r[1].trim());
            if (!isNumber(resourceCost)) {
              retVal.push('Non-numeric resource cost detected (' + r[1] + ').');
            }
          } else {
            resourceCost = 1;
          }
          if (r.length > 2 && r[2].trim() !== '') {
            resourceAlias = r[2].trim();
          } else {
            resourceAlias = resourceName;
          }
          //a limit makes the resource count up (uses so far, e.g. 2024 sheet *_slots_expended) instead of down
          resourceLimit = r.length > 3 ? r[3].trim() : '';
          break;
        case 'spawnsound':
          spawnSound = param;
          break;
        case 'movesound':
          moveSound = param;
          break;
        case 'triggersound':
          triggerSound = param;
          break;
        case 'deletesound':
          deleteSound = param;
          break;
        case 'whisperall':
          if (_.contains(['true', 'yes', '1'], param.toLowerCase())) {
            whisperAll = true;
          } else {
            whisperAll = false;
          }
          break;
        case 'whisperresults':
          if (_.contains(['true', 'yes', '1'], param.toLowerCase())) {
            whisperResults = true;
          } else {
            whisperResults = false;
          }
          break;
        case 'turnorder':
          const t = param.split(',').map((s) => s.trim());
          turnName = t[0];
          if (t.length > 1) {
            if (isNaN(parseInt(t[1]))) {
              retVal.push('Error: Non-numeric value detected in the turnOrder command. Value will be set to 0.');
            } else {
              turnValue = parseInt(t[1]);
            }
          }
          if (t.length > 2) {
            if (isNaN(parseInt(t[2]))) {
              retVal.push('Error: Non-numeric formula detected in the turnOrder command. Formula will be ignored.');
            } else {
              turnFormula = parseInt(t[2]);
            }
          }
          if (t.length > 3) {
            if (_.contains(['false', 'no', '0'], t[3].toLowerCase())) {
              linkTurnToToken = false;
            } else {
              linkTurnToToken = true;
            }
          }
          break;
        case 'tooltip':
          tooltip = param;
          break;
        case 'outlineonly':
          if (_.contains(['true', 'yes', '1'], param.toLowerCase())) {
            outlineOnly = true;
          } else {
            outlineOnly = false;
          }
          break;
        case 'aoelayer':
          //send token to object, gm, or map layer
          if (param.match(/obj/i) || param.match(/tok/i)) {
            aoeLayer = 'objects';
          } else if (param.match(/gm/i)) {
            aoeLayer = 'gmlayer';
          } else if (param.match(/map/i)) {
            aoeLayer = 'map';
          } else {
            retVal.push('Invalid layer requested. Valid layers are "object(s)", "token", "tok", "gm","map"');
          }
          break;
        case 'castercondition':
          //ensure no spaces between commas (required for the statusmarkers property of graphic object)
          const c = param.split(',').map((s) => s.trim());
          casterCondition = c[0];
          if (c.length > 1) {
            casterConditionOnFail = param.match(/onfail/i) ? true : false;
          }
          break;
        case 'affectscaster':
          if (_.contains(['true', 'yes', '1'], param.toLowerCase())) {
            affectsCaster = true;
          } else {
            affectsCaster = false;
          }
          break;
        default:
          retVal.push('Unexpected argument identifier (' + option + ').');
          break;
      }
    }); //end forEach arg

    //Token select or ID validation
    if (selectedID === undefined && msg.selected === undefined) {
      sendChat(scriptName, `${whisperString} You must either select a token or pass the tokenID via --selectedID`);
      return;
    }
    //Get the origin token object from either msg or an explicitly defined tokenID
    if ('API' === msg.playerid) {
      //SmartAoE WAS CALLED BY ANOTHER API SCRIPT
      if (playerID === undefined || selectedID === undefined) {
        sendChat(
          scriptName,
          'When SmartAoE is called by another script, it must pass both the selected token ID and the playerID',
        );
        return;
      }
      const p = getObj('player', playerID);
      if (getFillColor) {
        aoeColor = p.get('color') + '50';
      }
      if (getOutlineColor) {
        aoeOutlineColor = p.get('color');
      }

      who = p.get('_displayname');
      controlledby = playerID;
      oTok = getObj('graphic', selectedID);
    } else {
      //SmartAoE WAS CALLED DIRECTLY BY A PLAYER VIA CHAT. Get values from msg *IF* they weren't explicitly passed as arguments
      if (selectedID === undefined) {
        oTok = getObj('graphic', msg.selected[0]._id);
      } else {
        oTok = getObj('graphic', selectedID);
      }
      //Set controlledBy property of token to determine who can move the control token.
      if (playerID === undefined) {
        controlledby = msg.playerid;
      } else {
        controlledby = playerID;
      }

      if (oTok === undefined) {
        //may have passed the character_id instead of token_id. Attempt to get oTok from the player page
        const currentPageGraphics = findObjs({
          _pageid: Campaign().get('playerpageid'),
          _type: 'graphic',
          represents: selectedID,
        });

        oTok = currentPageGraphics[0];
        if (oTok === undefined) {
          sendChat(
            scriptName,
            'Unable to find the origin token from the selectedID<br>If a characterID was passed, check the player ribbon page.',
          );
          return;
        }
      }
    }

    //Check for valid offset X/Y (numeric)
    if (isNaN(offsetX) || isNaN(offsetY)) {
      retVal.push('Non-numeric offset detected. Format is "--offset|#,#" in Squares');
    } else if (offsetX > 50 * 70 || offsetY > 50 * 70) {
      //In case the offset was entered in pixels
      retVal.push('Offset out of range. Format is "--offset|#,#" in Squares (Max 50)');
    }

    //No --saveFormula and no --noSave: each target used to send an empty roll that Roll20 never answers, so the AoE
    //silently did nothing when triggered. Treat it as no save (full damage to every target), like --noSave|true.
    if (!noSave && saveFormula === '') {
      noSave = true;
      DC = 999999;
    }

    //First data validation checkpoint
    if (retVal.length > 0) {
      sendChat(scriptName, `${whisperString} ${retVal}`);
      return;
    }

    //----------------------------------------------------------------

    //Get token values and page settings
    originWidth = oTok.get('width');
    originHeight = oTok.get('height');

    pageID = oTok.get('pageid');

    originX = oTok.get('left');
    originY = oTok.get('top');

    //--------------RESOURCE MANAGEMENT----------------
    if (resourceName !== '') {
      const oChar = getObj('character', oTok.get('represents'));
      if (oChar) {
        const charID = oChar.get('_id');
        const whisperResource = (text) => sendChat(scriptName, `${whisperString} ${text}`, null, { noarchive: true });
        //legacy attribute object, or a sheet item on Beacon sheets (e.g. D&D 2024)
        const resource = await readCharacterValue(charID, resourceName);
        if (!resource) {
          whisperResource(`Resource '${resourceName}' is not found.`);
          return;
        }
        const resourceCurrent = parseFloat(resource.raw);
        if (!isNumber(resourceCurrent)) {
          whisperResource(`Non-numeric current resource value detected (${resourceName} = ${resource.raw})`);
          return;
        }

        //count-up mode: the resource tracks uses (e.g. 2024 sheet lvl3_slots_expended) up to a limit, which is a
        //number, the resource's own max ("max"), or another attribute (e.g. lvl3_slots_total)
        let limit;
        //2024 (Beacon) spell slots count slots used, so without a limit use the sheet's slot total. 2014 sheets keep
        //lvlN_slots_expended as a legacy attribute holding the slots left, so they still count down
        const slotMatch = resource.sheetName && resourceName.match(/^lvl(\d)_slots_expended$/i);
        if (resourceLimit === '' && slotMatch) {
          const slotTotalName = `lvl${slotMatch[1]}_slots_total`;
          if (await readCharacterValue(charID, slotTotalName)) resourceLimit = slotTotalName;
        }
        if (resourceLimit !== '') {
          let rawLimit = resourceLimit;
          if (!isNumber(Number(resourceLimit))) {
            const limitValue =
              resourceLimit.toLowerCase() === 'max'
                ? await readCharacterValue(
                    charID,
                    resource.attr ? resource.attr.get('name') : resource.sheetName,
                    'max',
                  )
                : await readCharacterValue(charID, resourceLimit);
            rawLimit = limitValue ? limitValue.raw : undefined;
          }
          limit = parseFloat(rawLimit);
          if (!isNumber(limit)) {
            whisperResource(
              `The limit for ${resourceAlias} ('${resourceLimit}') is not found or not a number${rawLimit ? ` (${rawLimit})` : ''}.`,
            );
            return;
          }
        }

        const countsUp = limit !== undefined;
        const newVal = countsUp ? resourceCurrent + resourceCost : resourceCurrent - resourceCost;
        if (countsUp ? newVal > limit : newVal < 0) {
          whisperResource(
            countsUp
              ? `Not enough ${resourceAlias}! <br> ${resourceAlias} used = ${resourceCurrent} of ${limit}, Cost = ${resourceCost}`
              : `Not enough ${resourceAlias}! <br> Current ${resourceAlias} = ${resourceCurrent}, Cost = ${resourceCost}`,
          );
          return;
        }
        if (resource.attr) {
          resource.attr.set('current', newVal);
        } else {
          try {
            await setSheetItem(charID, resource.sheetName, newVal, 'current', { allowThrow: true });
          } catch (err) {
            whisperResource(
              `Could not update ${resourceAlias} ('${resourceName}') on the sheet, so the AoE was not created. The sheet may not allow scripts to change it.`,
            );
            log(`${scriptName}: setSheetItem failed for ${resourceName}: ${err && err.message ? err.message : err}`);
            return;
          }
        }
        whisperResource(
          countsUp
            ? `${resourceAlias}: ${resourceCost} used. Now ${newVal} of ${limit} used.`
            : `${resourceAlias} reduced by ${resourceCost}. Current value = ${newVal}`,
        );
      }
    }

    const thePage = getObj('page', pageID);
    pageScaleNumber = thePage.get('scale_number');
    pageGridIncrement = thePage.get('snapping_increment');

    //convert user input to pixels using current grid size & origin token size
    if (offsetX > 0 && originWidth > 70 * pageGridIncrement) {
      offsetX = offsetX * 70 * pageGridIncrement + originWidth / 2;
    } else if (offsetX < 0 && originWidth > 70 * pageGridIncrement) {
      offsetX = offsetX * 70 * pageGridIncrement - originWidth / 2;
    } else {
      offsetX = offsetX * 70 * pageGridIncrement;
    }

    if (offsetY > 0 && originHeight > 70 * pageGridIncrement) {
      offsetY = offsetY * 70 * pageGridIncrement + originHeight / 2;
    } else if (offsetX < 0 && originHeight > 70 * pageGridIncrement) {
      offsetY = offsetY * 70 * pageGridIncrement - originHeight / 2;
    } else {
      offsetY = offsetY * 70 * pageGridIncrement;
    }

    const spawnX_max = parseInt(thePage.get('width')) * 70; //page size in pixels
    const spawnY_max = parseInt(thePage.get('height')) * 70;

    if (
      originX + offsetX < 0 ||
      originX + offsetX > spawnX_max ||
      originY + offsetY < 0 ||
      originY + offsetY > spawnY_max
    ) {
      sendChat(scriptName, `${whisperString} Error: The provided offsets would spawn the controlToken off the map!`);
      return;
    }

    //possibly convert the radius from user-supplied units to pixels
    if (convertRadius !== '') {
      if (pageGridIncrement !== 0) {
        //grid map
        if (convertRadius === 'u') {
          radius = radius * 70 * pageGridIncrement; //convert from "u" to pixels
        } else {
          radius = (radius * 70 * pageGridIncrement) / pageScaleNumber; //convert from page units to pixels
        }
      } else {
        //gridless map, only use page settings
        if (convertRadius === 'u') {
          sendChat(
            scriptName,
            `${whisperString} Warning: Units \"u\" selected on a gridless map. radius will be calculated in pixels and will probably be much smaller than expected`,
          );
        } else {
          radius = (radius * 70) / pageScaleNumber;
        }
      }
    }

    //This is a fix for wall AoE's
    //for fixed length "aoeType|line, float" we must reduce the effective length by one square.
    //      This is because the Bresenheim line algorithm always includes the origin square, and the way lines are calculated were originally "from the caster"

    //possibly convert the wallWidth from user-supplied units to pixels
    if (convertWidth !== '') {
      if (pageGridIncrement !== 0) {
        //grid map
        if (convertWidth === 'u') {
          wallWidth = wallWidth * 70 * pageGridIncrement; //convert from "u" to pixels
        } else {
          wallWidth = (wallWidth * 70 * pageGridIncrement) / pageScaleNumber; //convert from page units to pixels
        }
      } else {
        //gridless map, only use page settings
        if (convertWidth === 'u') {
          sendChat(
            scriptName,
            `${whisperString} Warning: Units \"u\" selected on a gridless map. radius will be calculated in pixels and will probably be much smaller than expected`,
          );
        } else {
          wallWidth = (wallWidth * 70) / pageScaleNumber;
        }
      }
    }

    //assign default forceIntersection behavior if undefined by user
    if (forceIntersection === undefined && aoeType === 'wall') {
      //If wall width is even number of squares, ControlToks should snap to intersection
      const sizeSq = 70 * pageGridIncrement;
      const wallWidthSquares = wallWidth / sizeSq;
      if (wallWidthSquares % 2 === 0) {
        forceIntersection = true;
        isDrawing = true;
      } else {
        forceIntersection = false;
      }
    } else if (forceIntersection === undefined) {
      //typically will forceIntersection for float AoE's, unless 1 square or smaller or if --forceIntersection was explicitly set by user
      if (
        aoeFloat === true &&
        (aoeType === 'circle' || aoeType === 'PFcircle' || aoeType === 'square') &&
        radius > 35 / pageGridIncrement
      ) {
        forceIntersection = true;
        isDrawing = true;
      }
    }

    //if controlTokName is 'Self', the aoeType must be "circle, float" or "square, float" with an explicit radius
    if (controlTokName.toLowerCase() === 'self') {
      if (
        (aoeType !== 'circle' || aoeType === 'PFcircle' || aoeType !== 'square') &&
        (aoeFloat !== true || isNumber(radius) === false)
      ) {
        sendChat(
          scriptName,
          `${whisperString} Config Error: Only AoE's of circle/square, with the float keyword, and with an explicit radius can use --controlTokName|self`,
        );
        return;
      }
    }

    //resize fixed-width radii if sourceToken is larger than one square
    if (
      radius !== 'variable' &&
      (aoeFloat !== true || controlTokName.toLowerCase() === 'self') &&
      (aoeType === 'square' || aoeType === 'circle' || aoeType === 'PFcircle' || aoeType === 'line')
    ) {
      radius = radius + originWidth / 2;
    }

    controlTokSize = controlTokSize * 70 * pageGridIncrement;

    if (controlTokName.toLowerCase() === 'self') {
      controlTok = getObj('graphic', oTok.get('_id'));

      //Possibly add a value to the turn tracker
      if (turnName !== '') {
        modifyTurnTracker('add', turnName, turnValue, turnFormula, oTok.get('_id'), pageID, linkTurnToToken);
      }

      const pathstring = buildSquarePath(35 * pageGridIncrement);
      const path = createPath(
        pathstring,
        pageID,
        aoeLayer,
        aoeColor,
        gridColor,
        2,
        70 * pageGridIncrement,
        70 * pageGridIncrement,
        controlTok.get('left'),
        controlTok.get('top'),
      );

      if (path) {
        if (controlTok.get('width') > 70 * pageGridIncrement) {
          toBack(controlTok);
          toBack(path);
        } else {
          toBack(controlTok);
          toBack(oTok);
          toBack(path);
        }

        //create a link between the source and control tokens (stored in state object)
        const oPt = new pt(oTok.get('left'), oTok.get('top'));

        makeAoELink(
          controlTokName,
          controlTok.get('_id'),
          aoeType,
          coneWidth,
          aoeFloat,
          instant,
          forceIntersection,
          aoeColor,
          aoeOutlineColor,
          gridColor,
          radius,
          wallWidth,
          originType,
          oPt,
          minGridArea,
          minTokArea,
          oTok.get('_id'),
          path.get('_id'),
          controlTok.get('_pageid'),
          fxType,
          saveFormula,
          saveName,
          ignoreAttr,
          ignoreVal,
          DC,
          noSave,
          damageBar,
          autoApply,
          damageFormula1,
          damageFormula2,
          damageBase1,
          damageBase2,
          damageType1,
          damageType2,
          rollDamage1,
          rollDamage2,
          damageSaveRule,
          resistanceRule,
          vulnerableRule,
          immunityRule,
          resistAttrs,
          vulnerableAttrs,
          immunityAttrs,
          conditionPass,
          conditionFail,
          zeroHPmarker,
          removeAtZero,
          hideNames,
          spawnSound,
          moveSound,
          triggerSound,
          deleteSound,
          cardParameters,
          whisperString,
          whisperAll,
          whisperResults,
          outlineOnly,
          aoeLayer,
          casterCondition,
          casterConditionOnFail,
          affectsCaster,
        );

        //Immediately trigger a "change:graphic" event on the origin/controlTok to generate the AoE
        smartAoE_handleTokenChange(controlTok, controlTok);
      } else {
        sendChat(scriptName, `${whisperString} Unknown error. createObj failed. AoE path not created.`);
        return;
      }
    } else {
      const spawnObj = getCharacterFromName(controlTokName);
      if (spawnObj === undefined) {
        sendChat(
          scriptName,
          `${whisperString} Error: Character \"${controlTokName}\" must be in the journal with a default token `,
        );
        return;
      }
      spawnObj.get('_defaulttoken', async function (defaultToken) {
        let spawnX = originX + offsetX;
        let spawnY = originY + offsetY;

        let numSpawns = 1;
        if (aoeType === 'wall') {
          numSpawns = 2;
          if (forceIntersection === true) {
            //for even width walls that snap to intersections, we will pre-snap them to the lower right corner
            spawnX = spawnX + 35 * pageGridIncrement;
            spawnY = spawnY + 35 * pageGridIncrement;
          }
        }

        controlToks = await spawnTokenAtXY(
          who,
          defaultToken,
          pageID,
          spawnX,
          spawnY,
          controlTokSize,
          controlledby,
          isDrawing,
          controlTokSide,
          tooltip,
          numSpawns,
        );
        if (!controlToks || controlToks.length === 0) {
          return; //spawnTokenAtXY has already whispered the reason
        }

        //Possibly add a value to the turn tracker
        if (turnName !== '') {
          modifyTurnTracker(
            'add',
            turnName,
            turnValue,
            turnFormula,
            controlToks[0].get('_id'),
            pageID,
            linkTurnToToken,
          );
        }

        const pathstring = buildSquarePath(35 * pageGridIncrement);
        const path = createPath(
          pathstring,
          pageID,
          aoeLayer,
          aoeColor,
          gridColor,
          2,
          70 * pageGridIncrement,
          70 * pageGridIncrement,
          controlToks[0].get('left'),
          controlToks[0].get('top'),
        );

        if (path) {
          if (controlToks[0].get('width') > 70 * pageGridIncrement) {
            toBack(controlToks[0]);
            if (controlToks.length > 1) {
              toBack(controlToks[1]);
            }
            toBack(path);
          } else {
            toBack(controlToks[0]);
            if (controlToks.length > 1) {
              toBack(controlToks[1]);
            }
            toBack(oTok);
            toBack(path);
          }

          if (controlToks.length > 1) {
            //create a link between the source and control tokens (stored in state object).
            //in this case, the origin token is now the 2nd "controlTok" spawned
            const oPt = new pt(controlToks[1].get('left'), controlToks[1].get('top'));
            makeAoELink(
              controlTokName,
              controlToks[0].get('_id'),
              aoeType,
              coneWidth,
              aoeFloat,
              instant,
              forceIntersection,
              aoeColor,
              aoeOutlineColor,
              gridColor,
              radius,
              wallWidth,
              originType,
              oPt,
              minGridArea,
              minTokArea,
              controlToks[1].get('_id'),
              path.get('_id'),
              controlToks[0].get('_pageid'),
              fxType,
              saveFormula,
              saveName,
              ignoreAttr,
              ignoreVal,
              DC,
              noSave,
              damageBar,
              autoApply,
              damageFormula1,
              damageFormula2,
              damageBase1,
              damageBase2,
              damageType1,
              damageType2,
              rollDamage1,
              rollDamage2,
              damageSaveRule,
              resistanceRule,
              vulnerableRule,
              immunityRule,
              resistAttrs,
              vulnerableAttrs,
              immunityAttrs,
              conditionPass,
              conditionFail,
              zeroHPmarker,
              removeAtZero,
              hideNames,
              spawnSound,
              moveSound,
              triggerSound,
              deleteSound,
              cardParameters,
              whisperString,
              whisperAll,
              whisperResults,
              outlineOnly,
              aoeLayer,
              casterCondition,
              casterConditionOnFail,
              affectsCaster,
            );
          } else {
            //create a link between the source and control tokens (stored in state object)
            const oPt = new pt(oTok.get('left'), oTok.get('top'));
            makeAoELink(
              controlTokName,
              controlToks[0].get('_id'),
              aoeType,
              coneWidth,
              aoeFloat,
              instant,
              forceIntersection,
              aoeColor,
              aoeOutlineColor,
              gridColor,
              radius,
              wallWidth,
              originType,
              oPt,
              minGridArea,
              minTokArea,
              oTok.get('_id'),
              path.get('_id'),
              controlToks[0].get('_pageid'),
              fxType,
              saveFormula,
              saveName,
              ignoreAttr,
              ignoreVal,
              DC,
              noSave,
              damageBar,
              autoApply,
              damageFormula1,
              damageFormula2,
              damageBase1,
              damageBase2,
              damageType1,
              damageType2,
              rollDamage1,
              rollDamage2,
              damageSaveRule,
              resistanceRule,
              vulnerableRule,
              immunityRule,
              resistAttrs,
              vulnerableAttrs,
              immunityAttrs,
              conditionPass,
              conditionFail,
              zeroHPmarker,
              removeAtZero,
              hideNames,
              spawnSound,
              moveSound,
              triggerSound,
              deleteSound,
              cardParameters,
              whisperString,
              whisperAll,
              whisperResults,
              outlineOnly,
              aoeLayer,
              casterCondition,
              casterConditionOnFail,
              affectsCaster,
            );
          }
        } else {
          sendChat(scriptName, `${whisperString} Unknown error. createObj failed. AoE path not created.`);
          return;
        }
      });
    }

    if (casterCondition && !casterConditionOnFail) {
      addStatusMarkers(oTok.get('_id'), casterCondition);
    }

    //Posiibly play sound fx when the control token is spawned
    if (spawnSound !== '') {
      playJukeboxTrack(spawnSound, whisperString);
    }
  };

  /** Chat commands handled by SmartAoE, in the order they are checked. */
  const COMMAND_HANDLERS = [
    { match: (content) => content.indexOf('!smarthelp') === 0, run: handleHelpCommand },
    { match: (content) => content.indexOf('!smartclearcache') === 0, run: handleClearCacheCommand },
    { match: (content) => content.indexOf('!smartremove') === 0, run: handleRemoveCommand },
    { match: (content) => content.indexOf('!smartquery') === 0, run: handleQueryCommand },
    { match: (content) => content.indexOf('!smartapply') === 0, run: handleApplyCommand },
    { match: (content) => /^!smartping(gm|all)\b/.test(content), run: handlePingCommand },
    { match: (content) => content.indexOf('!smartrotateorigin') === 0, run: handleRotateOriginCommand },
    { match: (content) => content.indexOf('!smarttrigger') === 0, run: handleTriggerCommand },
    { match: (content) => content.indexOf('!smartaoe') === 0, run: handleCreateAoeCommand },
  ];

  /**
   * 'chat:message' handler. Runs each COMMAND_HANDLERS entry whose matcher accepts the lower-cased content of an API
   * message. Errors are whispered to the caller; thrown non-Error values are sent as-is, and real errors also log a
   * stack trace to the API console.
   *
   * @param {object} msg - Roll20 chat message.
   * @returns {Promise<void>}
   */
  async function smartAoE_handleInput(msg) {
    if (msg.type !== 'api') return;
    const content = msg.content.toLowerCase();
    try {
      for (const { match, run } of COMMAND_HANDLERS) {
        if (match(content)) {
          await run(msg);
          break; //one command per message
        }
      }
    } catch (err) {
      const { whisperString } = getCaller(msg);
      if (err.message === undefined) {
        sendChat(scriptName, whisperString + err); //sent err code via throw
      } else {
        sendChat(scriptName, whisperString + 'Error: ' + err.message);
        log(`${scriptName} error: ${err.stack || err.message}`); //stack trace in the API console for diagnosis
      }
    }
  }

  // ————— BOOTSTRAP —————
  /**
   * Fills tokenMarkerURLs with a tag-to-image-URL lookup built from the campaign's token markers, used when
   * drawing markers in chat cards.
   */
  const populateTokenMarkerURLs = function () {
    // Retrieve list of token/status markers from the Campaign and create a URL lookup array based on name
    const tokenMarkers = JSON.parse(Campaign().get('token_markers'));

    tokenMarkers.forEach((marker) => {
      tokenMarkerURLs[marker.tag] = marker.url;
    });
  };

  /**
   * Registers SmartAoE's Roll20 event handlers: chat commands, token movement (redraws AoEs) and token deletion
   * (cleans up links).
   */
  const registerEventHandlers = function () {
    on('chat:message', smartAoE_handleInput);
    on('change:graphic', smartAoE_handleTokenChange);
    on('destroy:graphic', smartAoE_handleRemoveToken);
  };

  on('ready', () => {
    checkInstall();
    installHandout();
    registerEventHandlers();
    populateTokenMarkerURLs();
  });

  return {
    ObserveTokenChange: observeTokenChange,
    //Public: marker tags SmartAoE has used as --zeroHPmarker this session (e.g. so HealthColors doesn't add its own)
    ZeroHPMarkers: () => [...knownZeroHPMarkers],
  };
})();
