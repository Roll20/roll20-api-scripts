(() => {
  'use strict';

  const cmds = AreasOfEffect.Commands;

  AreasOfEffect.Wizard = class {
    /**
     * Shows the list of effects which can be applied to a selected path.
     * @param {Player} player
     */
    static show(player) {
      let playerId = player.get('_id');
      let content = new HtmlBuilder('div');
      let effects = AreasOfEffect.getEffects();

      let table = content.append('table.effectsTable');
      _.each(effects, effect => {
        let row = table.append('tr');
        var thumbnail = row.append('td');
        thumbnail.append('img.effectThumbnail', '', {
          src: effect.imgsrc
        });
        thumbnail.append('div', effect.name);

        row.append('td',
          new HtmlBuilder('a', '✎', {
            href: `${cmds.APPLY_EFFECT_AT_PATH_CMD} ${effect.name}`,
            title: 'Path: Apply effect to selected path.'
          })
        );

        row.append('td',
          new HtmlBuilder('a', '➙', {
            href: `${cmds.APPLY_EFFECT_BETWEEN_TOKENS_CMD} &#64;{selected|token_id} &#64;{target|token_id} ${effect.name}`,
            title: 'Ray: Create the effect from selected token to target token.'
          })
        );

        row.append('td',
          new HtmlBuilder('a', '✸', {
            href: `${cmds.APPLY_EFFECT_AT_TOKEN_CMD} &#64;{target|token_id} ?{Specify radius:} ${effect.name}`,
            title: 'Burst: Create effect centered on target token.'
          })
        );

        row.append('td',
          new HtmlBuilder('a', '⩤', {
            href: `${cmds.APPLY_EFFECT_AT_CONE_CMD} &#64;{selected|token_id} ?{Specify radius:} ${effect.name}`,
            title: 'Line/Cone: Create line/cone effect originating on selected token in the direction they are currently facing.'
          })
        );

        row.append('td',
          new HtmlBuilder('a', '⬕', {
            href: `${cmds.APPLY_EFFECT_AT_BLAST_CMD} &#64;{selected|token_id} ?{Specify radius:} ${effect.name}`,
            title: 'Blast: Create D&D 4E blast effect originating on selected token in the direction they are currently facing, using grid distance.'
          })
        );

        // The GM is allowed to delete effects.
        if(playerIsGM(playerId))
          row.append('td',
            new HtmlBuilder('a', '❌', {
              href: `${cmds.DEL_EFFECT_CMD} ${effect.name} ?{Delete effect: Are you sure?|yes|no}`,
              title: 'Delete effect.'
            })
          );
      });
      if(playerIsGM(playerId)) {
        content.append('div', '[Save New Effect](' + cmds.ADD_EFFECT_CMD + ' ?{Save Area of Effect: name})');
        content.append('div', '[⏏ Export State](' + cmds.EXPORT_STATE_CMD + ')', {
          title: 'Displays the JSON for this script\'s state, including all its saved effects, so that it can be imported into another campaign.'
        });
        content.append('div', '[⚠ Import State](' + cmds.IMPORT_STATE_CMD + ' ?{Paste exported state JSON here:})', {
          title: 'Imports the script state from another campaign from its exported JSON.'
        });
      }

      let menu = new AreasOfEffect.utils.Menu('Choose effect', content);
      menu.show(player);
    }
  };
})();
