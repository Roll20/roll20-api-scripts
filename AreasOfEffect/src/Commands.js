(() => {
  'use strict';

  const MENU_CMD = '!areasOfEffectShowMenu';
  const ADD_EFFECT_CMD = '!areasOfEffectAddEffect';
  const APPLY_EFFECT_AT_PATH_CMD = '!areasOfEffectApplyEffectAtPath';
  const APPLY_EFFECT_AT_TOKEN_CMD = '!areasOfEffectApplyEffectAtToken';
  const APPLY_EFFECT_BETWEEN_TOKENS_CMD = '!areasOfEffectApplyEffectBetweenTokens';
  const APPLY_EFFECT_AT_CONE_CMD = '!areasOfEffectApplyEffectAtCone';
  const APPLY_EFFECT_AT_BLAST_CMD = '!areasOfEffectApplyEffectAtBlast';
  const DEL_EFFECT_CMD = '!areasOfEffectDeleteEffect';
  const SHOW_EFFECTS_CMD = '!areasOfEffectShowEffects';
  const EXPORT_STATE_CMD = '!areasOfEffectExportState';
  const IMPORT_STATE_CMD = '!areasOfEffectImportState';

  function _AddEffectCmd(msg) {
    let argv = bshields.splitArgs(msg.content);
    let player = getObj('player', msg.playerid);

    let name = argv.slice(1).join('_');
    let graphic, path;
    _.each(msg.selected, item => {
      if(item._type === 'graphic')
        graphic = getObj('graphic', item._id);
      if(item._type === 'path')
        path = getObj('path', item._id);
    });

    if(graphic && path)
      AreasOfEffect.saveEffect(player, name, graphic, path);
    else {
      AreasOfEffect.utils.Chat.whisper(player,
        'ERROR: You must select a graphic and a path to save an effect.');
    }
  }

  function _ApplyEffectAtPathCmd(msg) {
    let argv = bshields.splitArgs(msg.content);
    let player = getObj('player', msg.playerid);

    let name = argv.slice(1).join('_');
    let path;
    _.each(msg.selected, item => {
      if(item._type === 'path')
        path = getObj('path', item._id);
    });

    if(path)
      AreasOfEffect.applyEffect(player, name, path);
    else {
      AreasOfEffect.utils.Chat.whisper(player,
        'ERROR: You must select a path to apply the effect to.');
    }
  }

  function _ApplyEffectAtTokenCmd(msg) {
    let argv = bshields.splitArgs(msg.content);
    let player = getObj('player', msg.playerid);

    let target = getObj('graphic', argv[1]);
    let radiusUnits = argv[2];
    let name = argv.slice(3).join('_');

    let path = AreasOfEffect.Paths.createRadiusPathAtToken(target, radiusUnits);
    AreasOfEffect.applyEffect(player, name, path);
  }

  function _ApplyEffectBetweenTokensCmd(msg) {
    let argv = bshields.splitArgs(msg.content);
    let player = getObj('player', msg.playerid);

    let selected = getObj('graphic', argv[1]);
    let target = getObj('graphic', argv[2]);
    let name = argv.slice(3).join('_');

    AreasOfEffect.applyEffectBetweenTokens(player, name, selected, target);
  }

  function _ApplyEffectAtCone(msg) {
    let argv = bshields.splitArgs(msg.content);
    let player = getObj('player', msg.playerid);

    let selected = getObj('graphic', argv[1]);
    let radiusUnits = argv[2];
    let name = argv.slice(3).join('_');

    let path = AreasOfEffect.Paths.createRadiusPathAtCone(selected, radiusUnits);
    AreasOfEffect.applyEffect(player, name, path);
  }

  function _ApplyEffectAtBlast(msg) {
    let argv = bshields.splitArgs(msg.content);
    let player = getObj('player', msg.playerid);

    let selected = getObj('graphic', argv[1]);
    let radiusUnits = argv[2];
    let name = argv.slice(3).join('_');

    let path = AreasOfEffect.Paths.createRadiusPathAtBlast(selected, radiusUnits);
    AreasOfEffect.applyEffect(player, name, path);
  }

  function _DelEffectCmd(msg) {
    let argv = bshields.splitArgs(msg.content);

    let name = argv[1];
    let confirm = argv[2];

    if(confirm === 'yes') {
      let player = getObj('player', msg.playerid);
      AreasOfEffect.deleteEffect(name);
      AreasOfEffect.Wizard.show(player);
    }
  }

  function _ExportStateCmd(msg) {
    let player = getObj('player', msg.playerid);
    AreasOfEffect.State.exportState(player);
  }

  function _ImportStateCmd(msg) {
    // Can't use splitArgs here since it strips out double-quotes.
    let argv = msg.content.split(' ');
    let player = getObj('player', msg.playerid);

    let json = argv.slice(1).join(' ');
    AreasOfEffect.State.importState(player, json);
  }

  function _MenuCmd(msg) {
    let player = getObj('player', msg.playerid);
    AreasOfEffect.Wizard.show(player);
  }

  /**
   * Set up our chat command handler.
   */
  on("chat:message", function(msg) {
    try {
      if(msg.type !== 'api')
        return;

      let argv = bshields.splitArgs(msg.content);
      if(argv[0] === ADD_EFFECT_CMD)
        _AddEffectCmd(msg);
      else if(argv[0] === APPLY_EFFECT_AT_PATH_CMD)
        _ApplyEffectAtPathCmd(msg);
      else if(argv[0] === APPLY_EFFECT_AT_TOKEN_CMD)
        _ApplyEffectAtTokenCmd(msg);
      else if(argv[0] === APPLY_EFFECT_BETWEEN_TOKENS_CMD)
        _ApplyEffectBetweenTokensCmd(msg);
      else if(argv[0] === APPLY_EFFECT_AT_CONE_CMD)
        _ApplyEffectAtCone(msg);
      else if(argv[0] === APPLY_EFFECT_AT_BLAST_CMD)
        _ApplyEffectAtBlast(msg);
      else if(argv[0] === DEL_EFFECT_CMD)
        _DelEffectCmd(msg);
      else if(argv[0] === EXPORT_STATE_CMD)
        _ExportStateCmd(msg);
      else if(argv[0] === IMPORT_STATE_CMD)
        _ImportStateCmd(msg);
      else if(argv[0] === MENU_CMD)
        _MenuCmd(msg);
    }
    catch(err) {
      let player = getObj('player', msg.playerid);

      log('Areas Of Effect ERROR: ' + err.message);
      AreasOfEffect.utils.Chat.whisper(player, 'ERROR: ' + err.message);
      log(err.stack);
    }
  });

  AreasOfEffect.Commands = {
    MENU_CMD,
    ADD_EFFECT_CMD,
    APPLY_EFFECT_AT_PATH_CMD,
    APPLY_EFFECT_AT_TOKEN_CMD,
    APPLY_EFFECT_BETWEEN_TOKENS_CMD,
    APPLY_EFFECT_AT_CONE_CMD,
    APPLY_EFFECT_AT_BLAST_CMD,
    DEL_EFFECT_CMD,
    SHOW_EFFECTS_CMD,
    EXPORT_STATE_CMD,
    IMPORT_STATE_CMD
  };
})();
