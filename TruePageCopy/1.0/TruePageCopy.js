// Github: https://github.com/bpunya/roll20-api/blob/master/TruePageCopy/TruePageCopy.js
// Author: PaprikaCC (Bodin Punyaprateep)

var TruePageCopy = TruePageCopy || (function () {
  const version = '1.0';
  const lastUpdate = 1490028625;

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
        state.PageCopy.completedWork.push(createObj(part.type, part.data));
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
        toBack(part);
        _.delay(reorderFunction, 50)
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
              .filter(o => o)
              .map(obj => prepareObjects(obj))
              .value()
    }

    return prepareObjects(objsToCopy);
  };

  const getGmPage = function (playerName) {
    return findObjs({
      _type: 'player',
      _displayname: playerName,
    })[0].get('_lastpage');
  };

  const getGraphicData = function (obj) {
    return {
      _pageid: state.PageCopy.destinationPage,
      imgsrc: obj.get('imgsrc').replace(/\/max\./g, '/thumb.').replace(/\/med\./g, '/thumb.'),
      bar1_link: obj.get('bar1_link'),
      bar2_link: obj.get('bar2_link'),
      bar3_link: obj.get('bar3_link'),
      represents: obj.get('represents'),
      left: obj.get('left'),
      top: obj.get('top'),
      width: obj.get('width'),
      height: obj.get('height'),
      rotation: obj.get('rotation'),
      layer: obj.get('layer'),
      isdrawing: obj.get('isdrawing'),
      flipv: obj.get('flipv'),
      fliph: obj.get('fliph'),
      name: obj.get('name'),
      gmnotes: obj.get('gmnotes'),
      controlledby: obj.get('controlledby'),
      bar1_value: obj.get('bar1_value'),
      bar2_value: obj.get('bar2_value'),
      bar3_value: obj.get('bar3_value'),
      bar1_max: obj.get('bar1_max'),
      bar2_max: obj.get('bar2_max'),
      bar3_max: obj.get('bar3_max'),
      aura1_radius: obj.get('aura1_radius'),
      aura2_radius: obj.get('aura2_radius'),
      aura1_color: obj.get('aura1_color'),
      aura2_color: obj.get('aura2_color'),
      aura1_square: obj.get('aura1_square'),
      aura2_square: obj.get('aura2_square'),
      tint_color: obj.get('tint_color'),
      statusmarkers: obj.get('statusmarkers'),
      showname: obj.get('showname'),
      showplayers_name: obj.get('showplayers_name'),
      showplayers_bar1: obj.get('showplayers_bar1'),
      showplayers_bar2: obj.get('showplayers_bar2'),
      showplayers_bar3: obj.get('showplayers_bar3'),
      showplayers_aura1: obj.get('showplayers_aura1'),
      showplayers_aura2: obj.get('showplayers_aura2'),
      playersedit_name: obj.get('playersedit_name'),
      playersedit_bar1: obj.get('playersedit_bar1'),
      playersedit_bar2: obj.get('playersedit_bar2'),
      playersedit_bar3: obj.get('playersedit_bar3'),
      playersedit_aura1: obj.get('playersedit_aura1'),
      playersedit_aura2: obj.get('playersedit_aura2'),
      light_radius: obj.get('light_radius'),
      light_dimradius: obj.get('light_dimradius'),
      light_otherplayers: obj.get('light_otherplayers'),
      light_hassight: obj.get('light_hassight'),
      light_angle: obj.get('light_angle'),
      light_losangle: obj.get('light_losangle'),
      light_multiplier: obj.get('light_multiplier'),
    };
  };

  const getPathData = function (obj) {
    return {
      _pageid: state.PageCopy.destinationPage,
      path: obj.get('path'),
      fill: obj.get('fill'),
      stroke: obj.get('stroke'),
      rotation: obj.get('rotation'),
      layer: obj.get('layer'),
      stroke_width: obj.get('stroke_width'),
      width: obj.get('width'),
      height: obj.get('height'),
      top: obj.get('top'),
      left: obj.get('left'),
      scaleX: obj.get('scaleX'),
      scaleY: obj.get('scaleY'),
      controlledby: obj.get('controlledby'),
    };
  };

  const getTextData = function (obj) {
    return {
      _pageid: state.PageCopy.destinationPage,
      top: obj.get('top'),
      left: obj.get('left'),
      width: obj.get('width'),
      height: obj.get('height'),
      text: obj.get('text'),
      font_size: obj.get('font_size'),
      rotation: obj.get('rotation'),
      color: obj.get('color'),
      font_family: obj.get('font_family'),
      layer: obj.get('layer'),
      controlledby: obj.get('controlledby'),
    };
  };

  const getPageInfo = function (source) {
    return {
      showgrid: source.get('showgrid'),
      showdarkness: source.get('showdarkness'),
      showlighting: source.get('showlighting'),
      width: source.get('width'),
      height: source.get('height'),
      snapping_increment: source.get('snapping_increment'),
      grid_opacity: source.get('grid_opacity'),
      fog_opacity: source.get('fog_opacity'),
      background_color: source.get('background_color'),
      gridcolor: source.get('gridcolor'),
      grid_type: source.get('grid_type'),
      scale_units: source.get('scale_units'),
      scale_number: source.get('scale_number'),
      gridlabels: source.get('gridlabels'),
      diagonaltype: source.get('diagonaltype'),
      lightupdatedrop: source.get('lightupdatedrop'),
      lightenforcelos: source.get('lightenforcelos'),
      lightrestrictmove: source.get('lightrestrictmove'),
      lightglobalillum: source.get('lightglobalillum'),
    };
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
          if (state.PageCopy.active) {
            // If it's currently active.
            printToChat(target, 'Script is currently active. Please use !pagecopy reset if you want to stop.');
          } else if (!state.PageCopy.sourcePage) {
            // If the source hasn't been selected yet.
            state.PageCopy.sourcePage = getGmPage(target);
            printToChat(target, `Setting the source page to ${getObj('page', getGmPage(target)).get('name')}.`);
          } else if (state.PageCopy.sourcePage === getGmPage(target) && !state.PageCopy.secureStr) {
            // If it's the same as the source and we're not waiting on a yes button press.
            printToChat(target, 'You must select a different source and destination page.');
          } else if (!state.PageCopy.secureStr) {
            // If we're not waiting on a yes button press.
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
              if (!state.PageCopy.secureStr) {
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
    if (state.PageCopy.deletedPage !== newPage.id) {
      const sourcePage = _.chain(findObjs({ type: 'page' }))
                          .filter(page => `${page.get('name')} (Copy)` === newPage.get('name'))
                          .filter(page => page.get('_zorder') === newPage.get('_zorder'))
                          .filter(page => _.isEqual(getPageInfo(page), getPageInfo(newPage)))
                          .first()
                          .value();
      if (sourcePage && findGraphics(sourcePage)) {
        preparePageCopy(sourcePage.id, newPage.id);
      }
    }
  };

  const handlePageDestruction = function (page) {
    state.PageCopy.deletedPage = page.id;
  };

  const prepareObjects = function (objs) {
    const getData = (obj) => {
      const type = obj.get('_type');
      if (type === 'graphic') return { type: 'graphic', data: getGraphicData(obj) };
      else if (type === 'path') return { type: 'path', data: getPathData(obj) };
      else if (type === 'text') return { type: 'text', data: getTextData(obj) };
      return undefined;
    };

    return _.isArray(objs) ? _.map(objs, obj => getData(obj)) : getData(objs);
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

      if (!state.PageCopy.workQueue.length) {
        log('True Page Copy - Nothing needed to be copied.')
        clearState();
      } else {
        printToChat('gm', `Script is now copying the ${originalPage.get('name')} page.`);
        destinationPage.set(Object.assign(
          getPageInfo(originalPage),
          { name: `${originalPage.get('name')} (Copy)` }
        ));
        copyObjectsToDestination(reorderGraphics);
      }
    }
  };

  const showHelp = function (target) {
    const content = 'If you wish to use True Page Copy, enter \'!pagecopy or\' \'!pagecopy source\' ' +
                    'when you are looking at the page you want to copy from. Then move to the map ' +
                    'that you want to copy to and enter \'!pagecopy\' again. A button prompt will ' +
                    'appear asking if you want to copy the pages.';
    printToChat(target, content);
  };

  const printToChat = function (target, content) {
    const FORMATTING_START = '';
    const FORMATTING_END = '';
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
