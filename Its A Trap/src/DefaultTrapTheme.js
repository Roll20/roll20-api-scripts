/**
 * The default system-agnostic Admiral Ackbar theme.
 * @implements TrapTheme
 */
(() => {
  'use strict';

  class DefaultTheme {

    /**
     * @inheritdoc
     */
    get name() {
      return 'default';
    }

    /**
     * @inheritdoc
     */
    activateEffect(effect) {
      let content = new HtmlBuilder('div');

      var row = content.append('.paddedRow');
      if(effect.victim) {
        row.append('span.bold', 'Target:');
        row.append('span', effect.victim.get('name'));
      }

      content.append('.paddedRow', effect.message);

      let table = TrapTheme.htmlTable(content, '#a22', effect);
      let tableView = table.toString(TrapTheme.css);
      effect.announce(tableView);
    }

    /**
     * @inheritdoc
     */
    passiveSearch(trap, charToken) {
      // Do nothing.
    }
  }

  ItsATrap.registerTheme(new DefaultTheme());
})();
