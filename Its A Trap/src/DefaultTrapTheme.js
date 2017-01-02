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
      let content = new HtmlBuilder('.paddedRow', effect.message);
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
