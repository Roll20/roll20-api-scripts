/**
 * This module provides the GM wizard for setting properties on objects via
 * a chat menu.
 */
(() => {
  'use strict';

  /**
   * The GM wizard menu.
   */
  CheckItOut.GMWizard = class {
    /**
     * @param {Graphic} target The object that the wizard displays and
     * modifies properties for.
     */
    constructor(target) {
      this._target = target;
    }

    /**
     * Gets the global script properties.
     * @return {WizardProperty[]}
     */
    getGlobalProperties() {
      let state = CheckItOut.State.getState();

      return [
        {
          id: 'globalTheme',
          name: 'Theme',
          desc: 'The theme used to handle system-specific rules for examining objects, specific to the character sheet used in your campaign.',
          value: state.themeName,
          options: (() => {
            return [
              'default',
              ...CheckItOut.themes.getRegisteredThemeNames()
            ];
          })()
        }
      ];
    }

    /**
     * Gets the basic wizard properties for the selected object.
     * @return {WizardProperty[]}
     */
    getProperties() {
      let objInfo = CheckItOut.ObjProps.getReadOnly(this._target);

      return [
        {
          id: 'name',
          name: 'Name',
          desc: 'The name of the object.',
          value: this._target.get('name')
        },
        {
          id: 'description',
          name: 'Description',
          desc: 'The description shown for the object when it is checked.',
          value: objInfo.core.description
        },
        {
          id: 'maxDist',
          name: 'Max Distance',
          desc: 'Characters must be within this distance of the object ' +
            'in order to examine it. This is measured in whatever units ' +
            'are used for the object\'s page.',
          value: objInfo.core.maxDist || 'infinity'
        },
        {
          id: 'sound',
          name: 'Sound effect',
          desc: 'A sound effect that is played when the object is checked.',
          value: objInfo.core.sound
        }
      ];
    }

    /**
     * Modifies a core property of the wizard's object.
     * @param {string} propID The ID of the property being modified.
     * @param {string[]} params The new parameters for the modified property.
     */
    modifyProperty(propID, params) {
      let objProps = CheckItOut.ObjProps.create(this._target);

      //log(`Modifying ${propID}.`);

      // global properties
      if (propID === 'globalTheme')
        CheckItOut.setTheme(params[0]);

      // object properties
      if (propID === 'name')
        this._target.set('name', params[0]);
      if (propID === 'description')
        objProps.core.description = params[0];
      if (propID === 'maxDist')
        objProps.core.maxDist = parseFloat(params[0]);
      if (propID === 'sound')
        objProps.core.sound = params[0];
    }

    /**
     * Produces the HTML content for a group of WizardProperties.
     * @param {string} modCmd The command invoked when the properties' buttons
     * are pressed
     */
    _renderProps(modCmd, properties) {
      let objID = this._target.get('_id');

      let table = new HtmlBuilder('table.propsTable');
      _.each(properties, prop => {
        let row = table.append('tr', undefined, {
          title: prop.desc
        });

        if (prop.isButton) {
          let prompt = '';
          if (prop.prompt) {
            prompt = '?{Are you sure?|yes|no}';
          }

          row.append('td', `[${prop.name}](${modCmd} ${objID} ${prop.id} ${prompt})`, {
            colspan: 2,
            style: { 'font-size': '0.8em' }
          });
        }
        else {
          // Construct the list of parameter prompts.
          let params = [];
          let paramProperties = prop.properties || [prop];
          _.each(paramProperties, item => {
            let options = '';
            if(item.options)
              options = '|' + item.options.join('|');
            params.push(`?{${item.name} ${item.desc} ${options}}`);
          });

          row.append('td', `[${prop.name}](${modCmd} ${objID} ${prop.id} ${params.join('&&')})`, {
            style: {
              'font-size': '0.8em',
              'vertical-align': 'top'
            }
          });

          row.append('td', `${prop.value || ''}`, {
            style: { 'font-size': '0.8em' }
          });
        }
      });

      return table;
    }

    /**
     * Shows the wizard menu to a GM.
     * @param {string} player The player the wizard is being shown for.
     */
    show(player) {
      let content = new HtmlBuilder('div');

      // Add core properties.
      content.append('h3', 'Core properties');
      let coreProperties = this.getProperties();
      let coreContent = this._renderProps(
        CheckItOut.commands.MODIFY_CORE_PROPERTY_CMD, coreProperties);
      content.append(coreContent);

      // Add theme properties.
      let theme = CheckItOut.getTheme();
      let themeProperties = theme.getWizardProperties(this._target);
      if (themeProperties.length > 0) {
        content.append('h3', 'Theme-specific properties');
        let themeContent = this._renderProps(
          CheckItOut.commands.MODIFY_THEME_PROPERTY_CMD, themeProperties);
        content.append(themeContent);
      }

      // Add global properties
      content.append('h3', 'Global properties');
      let globalProperties = this.getGlobalProperties();
      let globalContent = this._renderProps(
        CheckItOut.commands.MODIFY_CORE_PROPERTY_CMD, globalProperties);
      content.append(globalContent);

      // Add copy button
      let objID = this._target.get('_id');
      content.append('div', `[Copy properties to...]` +
        `(${CheckItOut.commands.COPY_PROPS_CMD} ${objID} ` +
        `&#64;{target|token_id})`, {
          title: 'Copy the properties from this object to another one.'
        });

      // Show the menu to the GM who requested it.
      let menu = new CheckItOut.utils.Menu('Object Properties', content);
      menu.show(player);
    }
  };
})();
