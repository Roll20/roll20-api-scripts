// Github: https://github.com/bpunya/roll20-api/blob/master/TruePageCopy/1.0/TruePageCopy.js
// Author: PaprikaCC (Bodin Punyaprateep)

var TruePageCopy = TruePageCopy || (function () {
  const version = '1.0';
  const lastUpdate = 1491244370;

  const checkVersion = function () {
    if (!state.PageCopy) clearState();
    log(`-- True Page Copy v${version} -- [${new Date(lastUpdate * 1000)}]`);
  };

  const checkExistingWork = function () {
    if (state.PageCopy.workQueue.length) {
      printToChat('gm', `Continuing interrupted copying of the ${getObj('page', state.PageCopy.sourcePage).get('name')}`);
      state.PageCopy.active = true;
      copyObjectsToDestination(reorderGraphics);
    } else if (state.PageCopy.completedWork.length) {
      printToChat('gm', `Continuing interrupted normalizing of the ${getObj('page', state.PageCopy.destinationPage).get('name')}`);
      state.PageCopy.active = true;
      reorderGraphics(clearState);
    } else {
      clearState();
    }
  };

  const clearState = function () {
    state.PageCopy = {
      active: false,
      secureStr: false,
      sourcePage: false,
      destinationPage: false,
      deletedPage: state.PageCopy ? state.PageCopy.deletedPage : false,
      completedWork: [],
      workQueue: [],
    };
  };

  const createSecureButton = function (target) {
    const randStr = getRandomString(32);
    state.PageCopy.secureStr = randStr;
    const output = `Are you sure you want to copy ${getObj('page', state.PageCopy.sourcePage).get('name')} ` +
                 `to ${getObj('page', state.PageCopy.destinationPage).get('name')}? ` +
                 'This will override all existing graphics and modify the current page to fit the source. <br>' +
                 `[Yes](!pagecopy ${randStr})` +
                 '[No](!pagecopy decline)';
    printToChat(target, output);
  };

  const copyObjectsToDestination = function (callback) {
    const workQueue = () => {
      if (state.PageCopy.workQueue.length) {
        const part = state.PageCopy.workQueue.shift();
        if (part.type !== 'graphic' || part.data.imgsrc) {
          const graphic = createObj(part.type, part.data);
          if (graphic) state.PageCopy.completedWork.push(graphic);
        }
        _.defer(workQueue);
      } else {
        printToChat('gm', `Normalizing z-order on the ${getObj('page', state.PageCopy.destinationPage).get('name')} page.`);
        callback(clearState);
      }
    };

    workQueue();
  };

  const reorderGraphics = function (callback) {
    const reorderFunction = () => {
      if (state.PageCopy.completedWork.length) {
        const part = state.PageCopy.completedWork.pop();
        if (part) toBack(part);
        _.defer(reorderFunction);
      } else {
        printToChat('gm', `Finished copying the ${getObj('page', state.PageCopy.sourcePage).get('name')} page!`);
        callback();
      }
    };

    reorderFunction();
  };

  const findGraphics = function (source) {
    const zOrder = source.get('_zorder');
    const objsToCopy = findObjs({ _pageid: source.id });
    if (zOrder) {
      return _.chain(zOrder.split(','))
              .map(position => _.find(objsToCopy, obj => obj.id === position))
              .reject(_.isUndefined)
              .map(obj => prepareObjects(obj))
              .value();
    } return _.map(objsToCopy, obj => prepareObjects(obj))
  };

  const getCleanImgsrc = function (imgsrc) {
    const parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/);
    if (parts) {
      return parts[1] + 'thumb' + parts[3] + (parts[4] ? parts[4] : '?' + Math.round(Math.random() * 9999999));
    }
    return undefined;
  };

  const getGmPage = function (playerName) {
    return findObjs({
      _type: 'player',
      _displayname: playerName,
    })[0].get('_lastpage');
  };

  const getGraphicData = function (obj) {
    const props = ['bar1_link', 'bar2_link', 'bar3_link', 'represents', 'left', 'top', 'width', 'height', 'rotation', 'layer', 'isdrawing', 'flipv', 'fliph', 'name', 'gmnotes', 'controlledby', 'bar1_value', 'bar2_value', 'bar3_value', 'bar1_max', 'bar2_max', 'bar3_max', 'aura1_radius', 'aura2_radius', 'aura1_color', 'aura2_color', 'aura1_square', 'aura2_square', 'tint_color', 'statusmarkers', 'showname', 'showplayers_name', 'showplayers_bar1', 'showplayers_bar2', 'showplayers_bar3', 'showplayers_aura1', 'showplayers_aura2', 'playersedit_name', 'playersedit_bar1', 'playersedit_bar2', 'playersedit_bar3', 'playersedit_aura1', 'playersedit_aura2', 'light_radius', 'light_dimradius', 'light_otherplayers', 'light_hassight', 'light_angle', 'light_losangle', 'light_multiplier'];
    return _.reduce(props, (m, p) => { m[p] = obj.get(p); return m; }, { _pageid: state.PageCopy.destinationPage, imgsrc: getCleanImgsrc(obj.get('imgsrc')) });
  };

  const getPathData = function (obj) {
    const props = ['path', 'fill', 'stroke', 'rotation', 'layer', 'stroke_width', 'width', 'height', 'top', 'left', 'scaleX', 'scaleY', 'controlledby'];
    return _.reduce(props, (m, p) => { m[p] = obj.get(p); return m; }, { _pageid: state.PageCopy.destinationPage });
  };

  const getTextData = function (obj) {
    const props = ['top', 'left', 'width', 'height', 'text', 'font_size', 'rotation', 'color', 'font_family', 'layer', 'controlledby'];
    return _.reduce(props, (m, p) => { m[p] = obj.get(p); return m; }, { _pageid: state.PageCopy.destinationPage });
  };

  const getPageInfo = function (page) {
    const props = ['showgrid', 'showdarkness', 'showlighting', 'width', 'height', 'snapping_increment', 'grid_opacity', 'fog_opacity', 'background_color', 'gridcolor', 'grid_type', 'scale_units', 'scale_number', 'gridlabels', 'diagonaltype', 'lightupdatedrop', 'lightenforcelos', 'lightrestrictmove', 'lightglobalillum'];
    return _.reduce(props, (m, p) => { m[p] = page.get(p); return m; }, {});
  };

  const getRandomString = function (length) {
    return Math.round((36 ** (length + 1)) - (Math.random() * (36 ** (length + 1)))).toString(36).slice(1);
  };

  const handleChatInput = function (msg) {
    if (msg.type !== 'api' || !playerIsGM(msg.playerid)) return;
    const args = msg.content.split(/\s/);
    const target = msg.who.slice(0, -5);
    switch (args[0]) {
      case '!pagecopy':
        // I wanted most of the functionality to be in !pagecopy without special commands.
        if (!args[1]) {
          if (state.PageCopy.secureStr) { // If we're waiting, don't do anything
            return;
          } else if (state.PageCopy.active) { // If it's active, warn the user and don't do anything
            printToChat(target, 'Script is currently active. Please use !pagecopy reset if you want to stop.');
          } else if (!state.PageCopy.sourcePage) { // If we haven't set a source, do that.
            state.PageCopy.sourcePage = getGmPage(target);
            printToChat(target, `Setting the source page to ${getObj('page', getGmPage(target)).get('name')}.`);
          } else if (state.PageCopy.sourcePage === getGmPage(target)) { // If the destination is the same as the source, warn user.
            printToChat(target, 'You must select a different source and destination page.');
          } else { // Set the destination
            state.PageCopy.destinationPage = getGmPage(target);
            createSecureButton(target);
          }
        } else {
          switch (args[1]) {
            case state.PageCopy.secureStr: {
              if (!state.PageCopy.active) {
                preparePageCopy(state.PageCopy.sourcePage, state.PageCopy.destinationPage);
              } else {
                printToChat(target, 'Script is currently active. Please use !pagecopy reset if you want to stop.');
              }
              break;
            }
            case 'debug': {
              log(state.PageCopy);
              break;
            }
            case 'decline': {
              if (state.PageCopy.secureStr) {
                clearState();
                printToChat(target, 'Copying declined.');
              }
              break;
            }
            case 'help': {
              showHelp(target);
              break;
            }
            case 'reset': {
              clearState();
              printToChat(target, 'Resetting internal state.');
              break;
            }
            case 'source': {
              if (!state.PageCopy.secureStr || !state.PageCopy.active) {
                state.PageCopy.sourcePage = getGmPage(target);
                printToChat(target, `Setting the source page to ${getObj('page', getGmPage(target)).get('name')}`);
              }
              break;
            }
            default: {
              if (args[1].length !== 32) showHelp(target);
              break;
            }
          }
        }
    }
  };

  const handlePageCreation = function (newPage) {
    if (state.PageCopy.deletedPage === newPage.id) return;
    const sourcePage = _.chain(findObjs({ type: 'page' }))
                        .filter(page => `${page.get('name')} (Copy)` === newPage.get('name'))
                        .filter(page => page.get('_zorder') === newPage.get('_zorder'))
                        .filter(page => _.isEqual(getPageInfo(page), getPageInfo(newPage)))
                        .first()
                        .value();
    if (sourcePage) preparePageCopy(sourcePage.id, newPage.id);
  };

  const handlePageDestruction = function (page) {
    state.PageCopy.deletedPage = page.id;
  };

  const prepareObjects = function (obj) {
    const type = obj.get('_type');
    if (type === 'graphic') return { type: 'graphic', data: getGraphicData(obj) };
    else if (type === 'path') return { type: 'path', data: getPathData(obj) };
    else if (type === 'text') return { type: 'text', data: getTextData(obj) };
    return undefined;
  };

// This is the exposed function
// @param1 is the id of the page to be copied
// @param2 is the id of the destination page
  const preparePageCopy = function (originalId, destinationId) {
    if (state.PageCopy.active) {
      log(`True Page Copy - Script is currently copying the ${getObj('page', state.PageCopy.sourcePage).get('name')} page.`);
      return;
    }

    const originalPage = getObj('page', originalId);
    const destinationPage = getObj('page', destinationId);
    state.PageCopy.secureStr = false;
    state.PageCopy.sourcePage = originalId;
    state.PageCopy.destinationPage = destinationId;

    if (!originalPage || !destinationPage) {
      log('True Page Copy - One or both of the supplied page ids do not exist.');
      clearState();
    } else if (originalId === destinationId) {
      log('True Page Copy - You cannot copy a page to itself.');
      clearState();
    } else {
      state.PageCopy.active = true;
      state.PageCopy.completedWork = [];
      state.PageCopy.workQueue = findGraphics(originalPage);
      printToChat('gm', `Script is now copying the ${originalPage.get('name')} page.`);
      destinationPage.set(getPageInfo(originalPage));
      copyObjectsToDestination(reorderGraphics);
    }
  };

  const showHelp = function (target) {
    const content = 'If you wish to use True Page Copy, you can either use the Duplicate Page ' +
                    'Button or type "!pagecopy" or "!pagecopy source" when you are looking at ' +
                    'the page you want to copy from. Next, move to the map that you want to copy' +
                    'to and enter "!pagecopy" again. A button prompt will appear asking if you ' +
                    'want to copy the pages.';
    printToChat(target, content);
  };

  const printToChat = function (target, content) {
    const FORMATTING_START = '<div style="background-color:#ffffff; padding:5px; border-width:2px; border-style:solid;">' +
                             '<div style="border-width:2px; border-style:dotted; padding:5px">';
    const FORMATTING_END = '</div></div>';
    sendChat('True Page Copy', `/w ${target} <br>${FORMATTING_START}${content}${FORMATTING_END}`, null, { noarchive: true });
  };

  const registerEventHandlers = function () {
    on('chat:message', handleChatInput);
    on('add:page', handlePageCreation);
    on('destroy:page', handlePageDestruction);
  };

  return {
    CopyPages: preparePageCopy,
    CheckWork: checkExistingWork,
    CheckInstall: checkVersion,
    RegisterEventHandlers: registerEventHandlers,
  };
}());

on('ready', () => {
  "use strict";

  TruePageCopy.CheckInstall();
  TruePageCopy.RegisterEventHandlers();
  TruePageCopy.CheckWork();
});
