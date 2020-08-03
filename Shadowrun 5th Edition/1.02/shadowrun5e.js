//:+:+:+:+:+: SHADOWRUN 5th Edition API :+:+:+:+:+: //
/**
 * The Shadowrun 5th Edition API for Roll20, designed to work with the Shadowrun 5th
 * Edition Character Sheet by Cassie Levett. This API provides for three commands:
 *   * !sr5 --linkToken: Set up all selected tokens with some defaults so that they
 *     names and bars are connected appropriately to the character sheet.
 *   * !sr5 --initCounter: Display a custom Initiative Counter on the Initiative Tracker
 *     that shows the Round/Pass information; when all initiatives have been acted upon,
 *     this automatically subtracts 10 from all initiatives and updates the Round/Pass
 *     info based on what Initiative scores remain.
 *   * !sr5 --rollInit: This rolls initiative for the selected Token, replicating 
 *     behavior of the Initiative buttons from the character sheet; if you also have the
 *     'matrix' and 'astral' Token icons in use, it will look for those to properly
 *     select which initiative to use
 * @author: Cassie Levett, additional contributions by R. William Morris
 * @version: 1.04
 * @new: Complete overhaul of coding documentation to make it easier to read and be
 *   understood
 * @new: Switched the colors/bars for stun and matrix damage; most video games identify
 *   health as red and mana as blue, so stun condition monitor is now the bar 2 (blue)
 *   and the matrix damage condition monitor is bar 1 (green)
 * @bugfix: Fixed problem in handleInput function that resulted in the apiMenu firing off
 *   whenever anything that wasn't a valid command was typed into chat.
 * @bugfix: Fixed some spelling errors and vague error responses in handleInput.
 * @bugfix: Fixed a problem with our Initiative Counter being added to the turnorder
 *   array with .unshift instead of .push, leading to a round automatically advancing
 *   incorrectly when the next person rolled initiative.
 * @bugfix: Fixed a formatting issue with the notification that a new Combat Round had
 *   begun; it should now match the styling for the rest of the API.
 * @bugfix: Removed some orphan helper functions that didn't do anything in v.1.03,
 *   including d6, getTokenURL, getTokenId, getTokenAttrsFromCharacterID, 
 *   getIDsFromTokens and getTokenRepresents.
 * @bugfix: Consolidated sr5HelperFunctions.getCharacterIdFromTokenId function into a
 *   single function.
 * @bugfix: Folded the getSheetType helper function into the Character @class as .type.
 * @bugfix: Fixed a problem in addInitiativeToTracker where the turnorder wasn't sorted
 *   properly when initiative was rolled by more than once person in a turn (for example,
 *   when players are encouraged to click the button for their own initiative).
 */
//:+:+:+:+:+: SHADOWRUN 5th Edition API :+:+:+:+:+: //

//:+:+:+:+:+: OBJECT CONSTRUCTORS :+:+:+:+:+: //
/**
 * Character @Class defines the Character object needed for the processResults and
 *   findInitiativeScores functions
 * @param {String} characterID: the alphanumeric ID associated with the character;
 *   you can get this from a known TokenID by using the getCharacterIdFromTokenId
 *   helper function.
 * @return {object}:
 * * .name {String} Character's Name
 * * .id {String} Character's characterID
 * * .token {String} Character's TokenID
 * * .src {String} Character's TokenURL
 * 
 * @APIObject getAttrByName https://wiki.roll20.net/API:Objects#getAttrByName
 * @APIObject findObjs https://wiki.roll20.net/API:Objects#findObjs.28attrs.29
 * 
 * @TODO: May need an attribute that identifies if the graphic object is a
 *   character, needs research!
 * @TODO: This Class doesn't use standard JavaScript conventions of underscore
 *   attributes, get and set for an object. Consider a re-write?
 */
class Character {
  constructor(characterID) {
    this.name = getAttrByName(characterID, 'character_name');
    this.id = characterID;
    this.token = findObjs({represents: characterID, _type: "graphic"})[0].attributes["_id"];
    this.src = findObjs({represents: characterID, _type: "graphic"})[0].attributes["imgsrc"];
    this.type = getAttrByName([characterID], 'sheet_type');
  }
}

/**
 * InitiativeTurn Class defines the InitiativeTurn object needed for the
 *   addInitiativeToTracker function
 * @param {} total:
 * @param {} id:
 * @param {String} name: 
 * @return {Object}:
 * * .pr {}
 * * .id {}
 * * .custom {}
 * @TODO: This Class doesn't use standard JavaScript conventions of underscore
 *   attributes, get and set for an object. Consider a re-write?
 */
class InitiativeTurn {
  constructor(total, id, name) {
    this.pr = total;
    this.id = id ? id : undefined;
    this.custom = name ? name : undefined;
  }
}
//:+:+:+:+:+: END OBJECT CONSTRUCTORS :+:+:+:+:+: //

//:+:+:+:+:+: STYLE BUILDERS :+:+:+:+:+: //
// Builder pieces for constructing properly stylish automated responses in chat
const primary    = '#610b0d', secondary = '#666', third = '#e7e6e5', accent = '#333';
const divstyle   = `style="color: #eee;width: 90%; border: 1px solid ${accent}; background-color: #131415; padding: 5px;"`;
const buttons    = `text-align:center; border: 1px solid ${accent}; margin: 3px; padding: 2px; background-color: ${primary}; border-radius: 4px;  box-shadow: 1px 1px 1px ${secondary};`
const astyle     = `style="text-align:center; ${buttons} width: 68%;"`;
const arrowstyle = `style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid ${secondary}; margin: 5px 0px;"`;
const headstyle  = `style="color: #fff; font-size: 18px; text-align: left; font-constiant: small-caps; font-family: Times, serif; margin-bottom: 2px;"`;
const substyle   = 'style="font-size: 0.8em; line-height: 13px; margin-top: -2px; font-style: italic;"';
const breaks     = `style="border-color:${third}; margin: 5px 2px;"`;
const circles    = `style='font-family:pictos;color: #fff;padding:2%;${buttons} width: 15px;'`
const centered   = `style="text-align:center;"`;
const apiName    = `Shadowrun 5th Edition`;
const version    = '1.04';
const header     = `<div ${divstyle}><div ${headstyle}>${apiName} <span ${substyle}>(v.${version})</span></div><div ${arrowstyle}>`;
const errorMessage = (name, error) => log(`${name}: ${error}`);
const readmeLink = '[Readme](https://github.com/Roll20/roll20-api-scripts/tree/master/Shadowrun%205th%20Edition)';
//:+:+:+:+:+: END STYLE BUILDERS :+:+:+:+:+: //

//:+:+:+:+:+: HELPER FUNCTIONS :+:+:+:+:+: //
const sr5HelperFunctions = {
  /**
   * The getCharacterIdFromTokenId function is used in linkTokens, processResults, 
   *   findInitiativeScores functions to get the characterID from the tokenID provided
   * @param {String} tokenID: The unique ID of the token, retrieved from the 
   *   msg.selected._id (when tokens are selected on the screen) or 
   *   msg.inlinerolls.expression (for processResults
   * @return {String} The unique CharacterID of the character associated with the token
   */
  getCharacterIdFromTokenId : (tokenID) => {
    tokenAttributes = findObjs({_id: tokenID, _type: "graphic"});
    return tokenAttributes[0].attributes.represents
  },

  /**
  * The getStatusIcons function is used in the tokenLinker and findInitiativeScores
  *   functions; this identifies the current icons active on the token, but we're
  *   specifically looking for the 'matrix' or 'astral' icons
  */
  getStatusIcons: tokenId => findObjs({_id: tokenId, _type: "graphic"})[0].attributes['statusmarkers'],
  
  /**
  * The getTurnorder function checks to see if the current turnorder is empty, and if so,
  *   sets turnorder to an empty object; otherwise, pull turnorder data from the Campaign()
  *   information. If initiative(s) have already been rolled, turnorder is expected to have
  *   four elements by default, but may have many more:
  *   * .pr: the Initiative rolled
  *   * .id: the ID of the Token/graphic object; for our Initiative Counter, this will
  *     be set to -1
  *   * ._pageid: the page ID of the page the turn order is on
  *   * .custom: this element will be used for our Initiatve Counter
  */
  getTurnorder: () => Campaign().get("turnorder") === "" ? [] :  JSON.parse(Campaign().get("turnorder")),
  setTurnorder: (turnorder) => Campaign().set("turnorder", JSON.stringify(turnorder)),

  // The findIndex function is used in the addInitiativeToTracker and 
  //   sr5CounterCheckInitiative functions to find the index of an object in an array
  //   based on a value
  findIndex: (property, match) => property.findIndex(element => Object.values(element).includes(match)),

  // The sortDescending function is used in the processInitiative and 
  //   sr5CounterCheckInitiative functions to sort the array (sortorder) in Descending
  //   order
  sortDescending: (array, key) => array.sort((a,b) => a[key] > b[key] ? -1 : 1),
}
//:+:+:+:+:+: END HELPER FUNCTIONS :+:+:+:+:+: //

var sr5api = sr5api || (function() {
  'use strict';
  
  //:+:+:+:+:+: INPUT HANDLER FUNCTION :+:+:+:+:+: //
  
  /**
  * The handleInput function, well, handles input. When you type something in chat, this
  *   function is called by the registerEventHandlers function to analyze chat:message to
  *   determine if its intended for use in the api. If the message starts with !sr5, it
  *   will generate a response.  In a properly formed call, it will analyze what's after
  *   the space-double-dashes for the API functionality that's being called.
  * @param {object} msg: This is the object received on the chat:message event, documented
  *   at https://roll20.zendesk.com/hc/en-us/articles/360037256754-API-Chat#API:Chat-chat:message
  *   In particular, this function is looking for the following in the msg object:
  *   * .content {String} The text that was entered into the chat window. If it doesn't
  *   * .playerid {String} the id of the player who entered the msg
  *     start with "!sr5", we don't care about it here.
  *   * .inlinerolls {Array}
  *     * 
  *   * .selected {String} An array of objects the user had selected when the command was
  *     entered:
  *     * id: ID of the token selected
  *     * type: type of the token selected; usually 'graphic'
  *   * .type {String} This should always be 'api'. If it isn't api, we don't care about it
  *     here.
  *   * .who {String} The display name of the player or character that sent the message; 
  *     this may include the '(GM)' string in it!
  * @return 
  * 
  * @TODO: consider checking for msg.content.substring(0,4) === "!sr5" straight off. If
  *   the msg.content doesn't start with that, its not an sr5api call and we don't care
  * @TODO: all of these commands are for tokens associated with characters, so we should
  *   make sure the tokens are characters at some point, maybe as a helper function?
  */
  const handleInput = msg => {
    const args = msg.content.split(" --")
    const who = msg.who.split(' ')[0]
    log(args)
    //Test to see if msg is an sr5 command and api type; this should be happening earlier
    if (args[0] === "!sr5" && msg.type === "api") {
        // Define noTokensSelected constant for feedback on error message for the
        //   linkToken and rollInit commands
        const noTokensSelected = `<div ${centered}>No tokens selected.</div>`;
        // Define selected constant, used in linkToken and rollInit commands to determine
        //   if anything is selected
        const selected = msg.selected;
        // Iterate through the expected arguments: linkToken, initCounter and rollInit
        switch(args[1]) {
          case "linkToken":
              // Check to see if there is a second command word after the sr5 linkToken
              //   command (this should only happen when a link is clicked in the apiMenu)
              if (args[2]) {
                  if (args[2] === 'info') {
                    chatMessage(apiCommands.linkToken.info)
                  } else if (args[2] === 'help') {
                    chatMessage(apiCommands.linkToken.help)
                  } else {
                    chatMessage(`Argument provided for linkToken was invalid: ${msg.content} . Spelling matters, omae!<br /> ${returnMenu}`)
                  }
              } else {
                  //There is not a second command word: if there are tokens selected,
                  //  then call the linkTokens function; if there are no tokens selected
                  //  (selected is undefined) then display an error that no tokens are
                  //  selected, otherwise just throw the apiMenu.
                  //@TODO Whether tokens are selected or not should really be a binary
                  //  thing, there shouldn't be any reason apiMenu gets thrown here
                  selected ? linkTokens(selected, who) : selected === undefined ? chatMessage(noTokensSelected) : apiMenu();
              }
              break;
          case "initCounter":
              //Check to see if there is a second command word after the sr5 initCounter
              //  command (this should only happen when a link is clicked in the apiMenu)
              if (args[2]) {
                  //There is a second word: if it is 'info' or 'help', call the
                  //  chatMessage function to display hardcoded information in the
                  //  apiCommands array, otherwise throw an error
                  if (args[2] === 'info') {
                    chatMessage(apiCommands.initCounter.info)
                  } else if (args[2] === 'help') {
                    chatMessage(apiCommands.initCounter.help)
                  } else {
                    chatMessage(`The argument provided for initCounter was invalid: ${msg.content} . Spelling matters, omae!<br /> ${returnMenu}`)
                  }
              } else {
                  //There is not a second command word, so we're just running the sr5
                  //  addInitiativeCounter function
                  addInitiativeCounter()
              }
              break;
          case "rollInit":
              //Check to see if there is a second command word after the sr5 rollInit
              //  command (this should only happen when a link is clicked in the apiMenu)
              if (args[2]) {
                  //There is a second word: if it is 'info' or 'help', call the
                  //  chatMessage function to display hardcoded information in the
                  //  apiCommands array, otherwise throw an error
                  if (args[2] === 'info') {
                    chatMessage(apiCommands.rollInit.info)
                  } else if (args[2] === 'help') {
                    chatMessage(apiCommands.rollInit.help)
                  } else if (args[2] === 'error') {
                    chatMessage(apiCommands.rollInit.error)
                  } else {
                    chatMessage(`The argument provided for rollInit was invalid: ${msg.content} . Spelling matters, omae!<br /> ${returnMenu}`)
                  }
              } else {
                  //There is not a second command word, so we're just running the sr5
                  //  rollInitiative function if tokens are selected
                  //@TODO Whether tokens are selected or not should really be a binary
                  //  thing, there shouldn't be any reason apiMenu gets thrown here
                  selected ? rollInitiative(selected) : selected === undefined  ? chatMessage(noTokensSelected) : apiMenu();
              }
              break;
          default:
              //Something is really not right... chances are the user entered !sr5
              //  without an argument, so we'll politely remind them to straighten up
              //  with that nonsense!
              chatMessage(`The argument provided was invalid: ${msg.content} . Spelling matters, omae!<br /> ${returnMenu}`);
        };
    } else if (msg.who === `${apiName} Roll Initiative`) {
        // msg is NOT an sr5 command and api type, so testing to see if the rollInitiative
        //   function threw something into chat; that means we're running the
        //   processInitiative with msg.inlinerolls
        processInitiative(msg.inlinerolls)
    } else if (msg.type === "api" && msg.content.substring(0,4) === "!sr5") {
        //msg is NOT an sr5 command and api type NOR sent to chat by the rollInitiative
        //  function, so we're testing to see if this is even an !sr5 command; if so,
        //  throw them an error that makes sense
        chatMessage(`${msg.content} is an invalid sr5 api command, chummer!<br /> ${returnMenu}`);
    } else {
      //this isn't even an sr5api command, why are we here? Return! Return!
      return;
    }
  },
  //:+:+:+:+:+: END INPUT HANDLER FUNCTION :+:+:+:+:+: //
  
  //:+:+:+:+:+: API MENU FUNCTIONS :+:+:+:+:+: //
  /**
   * The apiMenu function returns a clickable menu for the sr5 api
   * @param {String} who: the id of the person the apiMenu is being whispered to
   * @return A properly formatted menu with each sr5api command linkified, with info and
   *   help buttons
   * 
   * @TODO Consider adding a 'feedback' argument because sometimes this just pops up
   *   because you did something wrong. It looks like someone started to add this
   *   functionality and then just got rid of it.
   * @TODO Consider moving this down to the end of the API Menu section
   */
  apiMenu = who => {
    let feedback = ""
    let commandArray = ['linkToken', 'initCounter', 'rollInit']
    commandArray.forEach(command => feedback += menuButtons(command));
    chatMessage(feedback, who);
  },
  
  /**
   * The menuButtons function generates the buttons for the apiMenu function.
   * @param {String} command: The individual sr5 api command text, defined in the apiMenu
   *   function
   * @return {String} feedback: the fully styled row of buttons for the requested command
   */
  menuButtons = command => {
    let feedback = ""
    feedback += `<div ${centered}><a ${astyle} href="!sr5 --${command}">${apiCommands[command].name}</a>`
    feedback += `<a ${circles} href="!sr5 --${command} --info">i</a><a ${circles} href="!sr5 --${command} --help">?</a>`
    feedback += `</div>`
    feedback += `<hr ${breaks} />`
    return feedback
  },
  
  //Build an object with an element for each api command that is also an object
  //  containing name, info and help text
  returnMenu = `<div ${centered}><a ${astyle} href="!sr5">Api Menu</a></div>`,
  apiCommands = {
    linkToken: {
      name: 'Link Tokens',
      info: `<div ${centered}>Link Tokens</div><div>Set a number of defaults on selected tokens then set the default token on the represented character sheets. For full details review the ${readmeLink}</div></div>${returnMenu}`,
      help: `<div ${centered}>Link Tokens</div><div ${centered}>!sr5 --linkToken</div><ol><li>Set token to represent a character sheet in the token settings</li><li>Select a token or multiple tokens</li><li>Run the above command or push the menu button in chat.</li></ol><div>${readmeLink}</div>${returnMenu}`
    },
    initCounter: {
      name: 'Initiative Counter',
      info: `<div ${centered}>Initiative Counter</div><div>Adds a initiative turn to the Turn Order that will count up the Combat Rounds and Initiative Passes. Every time this custom entry gets to the top of a round it will reduce initiative by 10 and remove any entries that are less than 1. If it is the only entry in the Turn Order it will increase the round counter.</div><div>${readmeLink}</div>${returnMenu}`,
      help: `<div ${centered}>Initiative Counter</div><div ${centered}>!sr5 --initCounter</div><ul><li>Add counter before rolling initiative.</li><li>Use arrow at the bottom of the turn tracker to cycle through turns.</li></ul><div>${readmeLink}</div>${returnMenu}`
    },
    rollInit: {
      name: 'Roll Initiative',
      info: `<div ${centered}>Roll Initiative</div><div>Roll initiative for all the selected tokens and add it to the token tracker.</div><div>${readmeLink}</div>${returnMenu}`,
      help: `<div ${centered}>Roll Initiative</div><div ${centered}>!sr5 --rollInit</div><ol><li>Set tokens to represent a characters sheet</li><li>Select a token or multiple tokens.</li><li>Run the above command or push the menu button in chat.</li></ol><div>${readmeLink}</div>${returnMenu}`,
      error: `<div ${centered}><strong>Roll Initiative</strong></div><div ${centered}>Troubleshooting</div><ol> <li>Ensure initiative modifier attributes are valid</li> <li>Ensure initiative dice are valid</li> <li>Change attributes related to intiative then change them back to their original value to toggle sheetworkers</li> </ol> <div>${readmeLink}</div>${returnMenu}`
    }
  },
  //:+:+:+:+:+: END API MENU FUNCTIONS :+:+:+:+:+: //

  //:+:+:+:+:+: TOKEN LINKER COMMAND FUNCTIONS:+:+:+:+:+: //
  /** 
   * The linkTokens function looks at a Token's Linked character Sheet and set a number
   *   of defaults 
   * @param {Array} selected: data on selected tokens
   * @param {String} who
   * @return sets up each character token as hardcoded in the tokenLinker Function
   * @APIObject getObj https://roll20.zendesk.com/hc/en-us/articles/360037772833-API-Function-Documentation#API:FunctionDocumentation-getObj
   * @APIObject setDefaultTokenForCharacter https://roll20.zendesk.com/hc/en-us/articles/360037256774-API-Utility-Functions#API:UtilityFunctions-Character
   *
   * @TODO Why wouldn't this call the Character class to build an object for each
   *   character?
   */
  linkTokens = (selected, who) => {
    selected.forEach(token => {
      const characterID   = sr5HelperFunctions.getCharacterIdFromTokenId(token["_id"]) || false;
      const characterName = getAttrByName(characterID, 'character_name') || "";
      const tokenID       = token["_id"];
      let feedback = '';
      //Check first to see if the token represents a character
      if (characterID) {
        //if this is a character, run the tokenLinker function for the selected
        //  characterID, tokenID and characterName to get the hardcoded update info.
        //@TODO if we use the Character object, maybe consider just passing that to the
        //  tokenLinker function
        const update = tokenLinker(characterID, tokenID, characterName);
        //Set the default token for the represented character sheet
        const tokenGet = getObj("graphic", tokenID);
        const representsCharacter  = getObj('character', characterID);
        //if an update exists (from the tokenLinker function), run the update on the
        //  selected token
        if (update) {
          tokenGet.set(update);
          setDefaultTokenForCharacter(representsCharacter, tokenGet);
          feedback += `<div ${centered}><strong>${characterName}</strong></div><hr ${breaks} /><div ${centered}>Token defaults set!</div>`
        } else {
          //there's no update, so we need to throw an error
          errorMessage('linkTokens', 'Update not found, omae!')
        };
      } else {
        //The token doesn't represent a character, so provide feedback
        //@TODO: Find a way to more clearly identify the offending token?
        feedback += `<div>The selected token does not represent a character. Set a character in the Token settings.</div>`;
      }
      sendChat(`${apiName} Token Linker`, `/w ${who} ${header}</div>${feedback}</div>`)
    });
  },

  /**
   * The tokenLinker function attempts to update selected tokens. It is called by the
   * linkTokens function.
   * @param {String} characterID: determined in the linkTokens function
   * @param {String} tokenID: determined in the linkTokens function
   * @param {characterName} determined in the linkTokens function
   * @return {Object} update: an object with the settings for the Token to be used by the
   *   linkTokens function
   *
   */
  tokenLinker = (characterID, tokenID, characterName) => {
    try {
      //get the sheetType of the characterID; expected values are 'grunt', 'pc', 
      //  'vehicle', 'host' & 'sprite', selected on the Sheet Select dropdown in the
      //  Options tab of the Shadowrun 5e character sheet
      const sheetType  = getAttrByName(characterID, 'sheet_type');
      //get the statusMarkers of the tokenID token; all we care about are the presence
      //  of the 'matrix' or the 'astral' tokens
      const statusMarkers = sr5HelperFunctions.getStatusIcons(tokenID);
      //if the Matrix status token is active, we identify this with matrixMarker
      const matrixMarker = statusMarkers.includes('matrix') ? 'matrix' : false;
      //set stunCharacters as an array for the character types that have a stun
      //  condition monitor
      const stunCharacters = ['grunt', 'pc'];
      //set physicalCharacters as an array for the sheetTypes that have a physical
      //  condition monitor
      const physicalCharacters = stunCharacters.concat(['vehicle']);
      //set matrixCharacters as an array for the sheetTypes that have a matrix
      //  condition monitor
      const matrixCharacters = ['vehicle', 'host', 'sprite'];
      //set true/false flags for stun, matrix and physical, making sure to include
      //  matrix if the token has the matrixMarker active
      const stun = stunCharacters.includes(sheetType) ? true : false;
      const matrix = matrixCharacters.includes(sheetType) || matrixMarker ? true : false;
      const physical = physicalCharacters.includes(sheetType) ? true : false;
      //create the update object using the default settings
      //@TODO: Consider only changing barX settings to true if that type of condition
      //  monitor exists
      //@TODO: Rework this entire section so that we can set options within the macro
      //  button, but keep the below as defaults
      let update = {
        bar1_value: 0,
        bar2_value: 0,
        bar3_value: 0,
        name: characterName || "",
        bar1_link: "",
        bar2_link: "",
        bar3_link: "",
        showname: true,
        showplayers_bar1: true,
        showplayers_bar2: true,
        showplayers_bar3: true,
        playersedit_name: true,
        playersedit_bar1: true,
        playersedit_bar2: true,
        playersedit_bar3: true,
        light_hassight: true,
        bar1_max: matrix ? getAttrByName(characterID, `matrix`, "max") || 0 : "",
        bar2_max: stun ? getAttrByName(characterID, `stun`, "max") || 0 : "",
        bar3_max: physical ? getAttrByName(characterID, `physical`, "max") || 0 : "",
      }; 
      //If the sheetType is 'pc', iterate through each of stun, matrix and physical
      //  to first find the character attribute in the character sheet, then update
      //  barX_link information (on the Edit Token page) for each attribute, bar1 is
      //  stun, bar2 is matrix and bar3 is physical.
      //@TODO Correct the error handling to use errorMessage functionality
      if (sheetType === 'pc') {
        ['stun', 'matrix', 'physical'].forEach(attr => {
          const link = findObjs({characterid : characterID, "name": attr});
          const num = attr === 'matrix' && matrixMarker ? 1 : attr === 'stun' ? 2 : 3;
          link[0] ? update[`bar${num}_link`] = link[0].id : log(`Linked attribute not found for bar${num}`);
        });
      }
      return update
    } catch (error) {
      errorMessage('tokenLinker', error)
    };
  },
  //:+:+:+:+:+: END TOKEN LINKER :+:+:+:+:+: //

  //:+:+:+:+:+: INITIATIVE COUNTER :+:+:+:+:+: //
  /**
  * The addInitiativeCounter function adds the sr5 Round/Pass placeholder into the
  *   Initiative Tracker
  * @param: None
  * @return: Adds the Initiative Counter to the Initiative Tracker page or, if it already
  *   exists, resets it to round 1, pass 1
  */
  addInitiativeCounter = () => {
    try {
      //first, we'll gather our existing turnorder information and put it into the
      //  turnorder object, if it exists
      let turnorder = sr5HelperFunctions.getTurnorder();
      //If the Initiative Tracker isn't open, open it
      openInitiativePage();
      //Next, establish iniobj object with some default values for 'to', 'check' and 'idx'
      let iniobj = {
        to: [],
        check: '',
        idx: 0
      };
      /** 
      * The inicheck function changes the elements of iniobj to try to find an existing
      *   Initiative Counter on the Initiative Tracker page:
      *   * .po: equal to iniobj.to, which is likely an empty object at this point; can't
      *     find where this is used anywhere!!
      *   * .to: the information found in the Campaign's turnorder element; not sure why
      *     this isn't just using the turnorder variable we already established
      *   * .check: this searches through the object in iniobj.to to find the first value
      *     of custom = 'Round / Pass'
      *   * .idx: the index of the value found in .check
      */
      const inicheck = () => {
        iniobj.po = iniobj.to;
        iniobj.to = turnorder;
        iniobj.check = _.find(iniobj.to, obj => obj.custom == 'Round / Pass');
        iniobj.idx = iniobj.to.indexOf(iniobj.check);
      };
      /**
      * The addinit function adds the Initiative Counter to the start of the Campaign's
      *   turnorder object
      * @param: {Object} oTurnOrder the turnorder object from Campaign
      * @return: sets the new turnorder for the Campaign with a fresh Initiative Counter
      *   at 1 / 1
      * @TODO: Check to make sure it doesn't already exist?
      */
      const addini = oTurnOrder => {
        oTurnOrder.unshift({
          id: '-1',
          pr: '1 / 1',
          custom: 'Round / Pass'
        });
        sr5HelperFunctions.setTurnorder(oTurnOrder);
      };
      //Check to see if the Initiative Counter is already on the Initiative Tracker page
      inicheck();
      //If the Initiative Counter doesn't exist, call addini to add it to the counter;
      //  if Iniatitive Counter does exist, remove it, then call addini to add a reset
      //  Initiative Counter to initiative
      if (iniobj.check === undefined) {
        addini(iniobj.to);
      } else{
        iniobj.to.splice(iniobj.idx, 1);
        addini(iniobj.to);
      };
    } catch (error) {
      errorMessage('addInitiativeCounter', error)
    }
  },
  /**
  * The openInitiativePage function opens the campaign's initiative page if it is closed.
  *   This is used in the addInitiativeToTracker and addInitiativeCounter. Full
  *   description of the Campaign object is at 
  *   https://roll20.zendesk.com/hc/en-us/articles/360037772793-API-Objects#API:Objects-Campaign
  * @TODO: Consider moving this up to sr5HelperFunctions
  */
  openInitiativePage = () => {
    if (Campaign().get('initiativepage') === false) {
      Campaign().set('initiativepage', true);
    };
  },
  //:+:+:+:+:+: END INITIATIVE COUNTER :+:+:+:+:+: //

  //:+:+:+:+:+: GROUP INITIATIVE :+:+:+:+:+: //
  /**
   * The addInitiativeToTracker function is called by the processInitiative function
   * @param {Object} tokenInitiatives: this object contains data passed from the
   *   processInitiative function, with an element for each roll containing data 
   *   gathered as part of the Character class
   * @return: Adds new Initiative roll data to the Initative Tracker window, replacing
   *   any existing initiative rolls for that character
   */
  addInitiativeToTracker = tokenInitiatives => {
    try {
      //first, we'll gather our existing turnorder information and put it into the
      //  turnorder object, if it exists
      let turnorder = sr5HelperFunctions.getTurnorder();
      //next, get the Index of the Initiative Counter we added in the
      //  addInitiativeCounter function
      const counterIndex = sr5HelperFunctions.findIndex(turnorder, 'Round / Pass');
      //Open the Initiative Tracker if not open
      openInitiativePage();
      //Iterate through each element of turnorder
      turnorder.forEach(turn => {
        //find the index to each element within the tokenInitiatives object, given the
        //  Character's .id in the element
        const index = sr5HelperFunctions.findIndex(tokenInitiatives, turn.id)
        //If the index is greater than 0 (meaning its not our Initiative Counter), make
        //  turnorder.pr equal to the initiative total for that element, then remove
        //  that element from the tokenInitiatives object
        if (index >= 0) {
            turn.pr = tokenInitiatives[index].total
            tokenInitiatives.splice(index, 1)
        }
      });
      //Iterate through each element that remains in tokenInitiatives and add it to the
      //  end of turnorder
      //@TODO Investigate why this is even necessary.
      tokenInitiatives.forEach(token => {
        const newInitiative = new InitiativeTurn(token.total, token.token);
        turnorder.push(newInitiative)
      });
      //If our Initiative Counter's index is equal to or greater 0 (meaning its at the
      //  top of the Initiative Tracker), capture the data in the element in the counter
      //  variable, then remove it from turnorder and re-add it to turnorder at the end
      if (counterIndex >= 0) {
        const counter = turnorder[counterIndex]
        turnorder.splice(counterIndex, 1)
        turnorder = sr5HelperFunctions.sortDescending(turnorder, 'pr')
        turnorder.push(counter)
      }
      //Now that turnorder is all sorted, add it back into the Campaign!
      sr5HelperFunctions.setTurnorder(turnorder);
    } catch (error) {
        errorMessage('addInitiativeTracker', error)
    }
  },
  /**
   * The processInitiative function takes information from msg.inlinerolls in the
   *   chracterInitiativeRolls variable, runs it through processResults to obtain an
   *   array with Character objects as elements, then sends that array through 
   *   sr5HelperFunctions.sortDescending to sort it by total, then adds that to the
   *   Initiative Tracker with the addInitiativeTracker function.
   * @param: {Object} characterInitiativeRolls: information contained in
   *   msg.inlinerolls, which is then passed off to the processResults function for
   *   processing
   * @TODO: This whole process fails to sort initiative previously rolled and active;
   *   need to figure out how to make sure all initiative scores are always processed
   *   properly
   */
  processInitiative = characterInitiativeRolls => {
    try {
      //First, take the msg.inline information and process it through the processResults 
      //  function to get an array populated with Character objects in each element
      const processedRolls = processResults(characterInitiativeRolls)
      //Then sort processedRolls in sr5HelperFunctions.sortDescending
      const sortedByTotal = sr5HelperFunctions.sortDescending(processedRolls, 'total')
      //Add the sorted initiative roll information to the Initiative Tracker
      addInitiativeToTracker(sortedByTotal)
    } catch (error) {
      errorMessage('processInitiative', error)
    }
  },
  /**
   * The processResults function takes information from msg.inlinerolls and creates a 
   *   Character class object. It then adds character.total to the object to include
   *   the result of the Initiative roll.
   * @param: {Object} results: This is the data from msg.inlinerolls, passed from the
   *   processInitiative function. In particular we are interested in the following
   *   elements:
   *   * .expression: we need the tokenID information out of this element
   *   * .results.total: the Initiative that resulted from the die roll
   * @return: An array with an element for each Character object, including
   *   character.total with the Initiative result gathered from msg.inlinerolls
   * @TODO: Consider adding character.total to the Character object we created?
   */
  processResults = results => {
    try {
      let array = [];
      //iterate through the msg.inlinerolls data contained in results
      results.forEach(roll =>{
        //find the tokenID for each element
        const tokenID = roll['expression'].split(' [')[1].slice(0, -1);
        //get the characterID based on that tokenID
        const characterID = sr5HelperFunctions.getCharacterIdFromTokenId(tokenID);
        //create a new Character object based on the characterID
        const character = new Character(characterID)
        //add a character.total to the Character object equal to the Initiative rolled
        //  for that element in msg.inlinerolls
        character.total = roll.results.total
        //add the Character object to our array
        array.push(character)
      });
      return array
    } catch (error) {
      errorMessage('processResults', error)
    }
  },
  /**
   * The rollInitiative function is base functionality that fires off when 
   *   "!sr5 --rollInit" is called in chat. It is called by the handleInput function.
   * @param: {Object} selected: An object with the information contained in msg.selected
   *   for the Tokens currently selected
   * @return: processes and outputs Initiative information to chat
   */
  rollInitiative = selected => {
    try {
      //First, pass the selected Object through the findInitiativeScores function to
      //  process the initiative results and return an array with a Character object for
      // each element
      const selectedInitiatives = findInitiativeScores(selected);
      //Next, establish an empty feedback constant to hold the text we want to build
      let feedback = '';
      //iterate through the selectedInitiatives array and build a themed response to
      //  display in chat
      //@TODO rename 'value' to make more sense, maybe 'character' as the name of the array
      for (let [key, value] of Object.entries(selectedInitiatives)) {
        feedback += `<div style='display: inline-block; border: 1px solid ${third}; border-radius: 5px; padding: 2%; background-color: ${secondary}; margin-bottom: 3%; width: 95%;'>`
        //Display the token's image first
        feedback += `<img src='${value.src}' style='margin-right: 2%; width: 20%;'>`
        //Display the name associated with the token next
        feedback += `<label style='display: inline-block; font-weight: bold; font-size: 1.3em; color: ${third}; vertical-align: middle; width: 60%;'>${value.name}</label>`
        //Display the result of the roll (.expression) and the id of the token (.token);
        //  This actually rolls the dice for initiative, using double brackets on either
        //  side of value.expression
        //@TODO: Why are we adding the id of the token to this? This appears in the
        //  inlinerolls object as msg.inlinerolls.results.rolls[3].text. What is it?
        const roll = value.expression ? `[[${value.expression} [${value.token}]]]` : `<a ${circles} href="!sr5 --rollInit --error">!</a>`
        feedback += `<div style='color: ${accent}; width: 15%; display: inline-block;'>${roll}</div>`
        //Close out the theming for the box
        feedback += `</div><br />`
      }
      //send the themed feedback to chat; note this will trigger the
      //  processInitiative(msg.inlinerolls) function in the handleInput function
      sendChat(`${apiName} Roll Initiative`, `${header}</div>${feedback}</div>`);
    } catch (error) {
      errorMessage('rollInitiative', error)
    }
  },
  /**
   * The findInitiativeScores function is called by rollInitiative
   * @param {Object} selected: this is an array containing information on each token
   *   selected, taken originally from msg.selected
   * @return: 
   */
  findInitiativeScores = selected => {
    try {
      //start off with an empty array
      let array = [];
      //iterate through each element of selected to build our array
      selected.forEach(token => {
        const characterID = sr5HelperFunctions.getCharacterIdFromTokenId(token["_id"]);
        const statusMarkers = sr5HelperFunctions.getStatusIcons(token["_id"]);
        //build a new Character object
        const character = new Character(characterID);
        //use the character.types and/or the statusMarkers on the Token to determine what
        //  sort of initiative to call: 'matrix', 'astral' or 'initiative'; default is
        //  just 'initiative'
        const intiativeType = character.type === "sprite" || character.type === "host" || character.type === "vehicle" || statusMarkers.includes('matrix') ? 'matrix' : statusMarkers.includes('astral') ? 'astral' : 'initiative';
        //search the character sheet for the appropriate initiative modifier (the integer
        //  added to the roll)
        //@TODO: Does this include additional or temporary modifiers?
        character.modifier = getAttrByName(characterID, `${intiativeType}_mod`);
        //search the character sheet for the appropriate number of initiative dice
        character.dice = getAttrByName(characterID, `${intiativeType}_dice`);
        //if we've gathered both a modifier and dice, then we'll build the roll
        //  character.expression needed for roll20 to roll; note the use of cs0cf0 to
        //  ensure no rolls are shown as critical success or failures
        //@TODO cs0cf0 shows in the tooltip in the chat in roll20; explore ways to hide
        //  this, is fugly
        if (character.modifier && character.dice) {
          character.expression = `${character.modifier}+${character.dice}d6cs0cf0`
        } else {
          character.expression = undefined
        }
        //add the character object we've built to the array
        array.push(character)
      });
      return array
    } catch (error) {
      errorMessage('findInitiativeScores', error)
    }
  },
  //:+:+:+:+:+: END GROUP INITIATIVE :+:+:+:+:+: //
    
  //Send message to chat
  //TODO: Consider making this a helper function
  chatMessage = (feedback, who) => sendChat(`${apiName} API`, `/w ${who || 'gm'} ${header}</div>${feedback}</div>`),

  registerEventHandlers = () => {
    on('chat:message', handleInput);
  };

  return {
    RegisterEventHandlers: registerEventHandlers
  };
}());

on("ready",() => {
    'use strict';
    sr5api.RegisterEventHandlers();
});


//:+:+:+:+:+: INITIATIVE COUNTER :+:+:+:+:+: //
/**
 * The sr5CounterCheckInitiative function is called whenever there is a change in the
 *   turnorder for the campaign, usually when the GM clicks the Next Turn arrow button
 *   on the Initiative Tracker. This function checks to see if our Initiative Counter is
 *   at the top of the Initiative Tracker and, if so, updates all Initiatives for the
 *   next pass or round and returns a new turnorder to the campaign with this information
 * @params: None (we'll use sr5HelperFunctions.getTurnorder() to pick up the
 *   current turnorder)
 * @return: Update the Campaign.turnorder with the new Initiative Counter with updated
 *   Round/Pass information
 * @TODO: The name of this functionality is misleading. Maybe change to
 *   sr5InitCounterUpdate?
 */
sr5CounterCheckInitiative = () => {
  //First, gather information on the current turnorder for the Campaign
  let turnorder = sr5HelperFunctions.getTurnorder();
  //Next, search through turnorder for the index of the element that contains our
  //  Initiative Counter
  const counterIndex = sr5HelperFunctions.findIndex(turnorder, 'Round / Pass');
  //If our Initiative Counter is at the top of the Initiative list, its time to move on
  //  to the next pass or turn!
  if (counterIndex === 0) {
    //get our Initiative Counter object from the turnorder object
    let counter = turnorder[counterIndex]
    //remove our Initiative Counter object from the turnorder object; we're going to
    //  build a new one
    turnorder.splice(counterIndex, 1)
    //Hey! This is the start of the new one!
    let newTurnOrder = []
    //Iterate through turnover.pr (where the Initiative results are stored) to reduce all
    //  the current initiatives by 10 and remove them if that makes them less than 0; if
    //  they're still positive, add them to the newTurnOrder
    turnorder.forEach(element => { 
        element.pr -= 10
        element.pr > 0 ? newTurnOrder.push(element) : false;
    });
    //Pass our newTurnOrder through .sortDescending to sort it properly 
    newTurnOrder = sr5HelperFunctions.sortDescending(newTurnOrder, 'pr')
    //Start rebuilding our Initiative Counter by splitting out the Round / Pass
    //  information from our counter object
    const split = counter.pr.split(` / `)
    //if the newTurnOrder has no entries (meaning everyone has had all the passes for
    //  that round), turn our string for Round into an integer (base 10!) and add 1 to it
    //  to advance to the next Round
    let round = newTurnOrder.length < 1 ? parseInt(split[0], 10) + 1 : split[0]
    //if the newTurnOrder has no entires, reset the Pass to 1; otherwise turn the string
    //  for our Turn into an integer (base 10!) and add one to it
    let pass = newTurnOrder.length < 1 ? 1 : parseInt(split[1], 10) + 1
    //rebuild our Initiative Counter
    counter.pr = `${round} / ${pass}`
    //if we've got a new Round, fire off an entry in chat to notify everyone that a new
    //  Round has begun
    feedback = `<div ${centered}><label style='display: inline-block; font-weight: bold; font-size: 1.1em; color: ${third}; vertical-align: middle; width: 60%;'>Combat Round ${round}</label></div>`
    newTurnOrder.length < 1 ? sendChat('API', `${header}</div>${feedback}`) : false;
    //Stick the new Initiative Counter into the newTurnOrder
    newTurnOrder.push(counter)
    //Send off the newTurnOrder to the Campaign's turnorder object to make everything
    //  official!
    sr5HelperFunctions.setTurnorder(newTurnOrder);
},
//fire off sr5CounterCheckInitiative when the Campaign Turnorder changes!
on('change:campaign:turnorder', () => {
    sr5CounterCheckInitiative();
});
//:+:+:+:+:+: END INITIATIVE COUNTER :+:+:+:+:+: //
