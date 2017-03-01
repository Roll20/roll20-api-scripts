/**
 * The configured JSON properties of a trap. This can be extended to add
 * additional properties for system-specific themes.
 */
var TrapEffect = (() => {
  'use strict';

  const DEFAULT_FX = {
    maxParticles: 100,
    emissionRate: 3,
    size: 35,
    sizeRandom: 15,
    lifeSpan: 10,
    lifeSpanRandom: 3,
    speed: 3,
    speedRandom: 1.5,
    gravity: {x: 0.01, y: 0.01},
    angle: 0,
    angleRandom: 180,
    duration: -1,
    startColour: [220, 35, 0, 1],
    startColourRandom: [62, 0, 0, 0.25],
    endColour: [220, 35, 0, 0],
    endColourRandom:[60, 60, 60, 0]
  };

  return class TrapEffect {

    /**
     * An API chat command that will be executed when the trap is activated.
     * If the constants TRAP_ID and VICTIM_ID are provided,
     * they will be replaced by the IDs for the trap token and the token for
     * the trap's victim, respectively in the API chat command message.
     * @type {string}
     */
    get api() {
      return this._effect.api;
    }

    /**
     * Specifications for an AreasOfEffect script graphic that is spawned
     * when a trap is triggered.
     * @typedef {object} TrapEffect.AreaOfEffect
     * @property {String} name      The name of the AoE effect.
     * @property {vec2} [direction] The direction of the effect. If omitted,
     *                              it will be extended toward the triggering token.
     */

    /**
     * JSON defining a graphic to spawn with the AreasOfEffect script if
     * it is installed and the trap is triggered.
     * @type {TrapEffect.AreaOfEffect}
     */
    get areaOfEffect() {
      return this._effect.areaOfEffect;
    }

    /**
     * Configuration for special FX that are created when the trap activates.
     * @type {object}
     * @property {(string | FxJsonDefinition)} name
     *           Either the name of the FX that is created
     *           (built-in or user-made), or a custom FX JSON defintion.
     * @property {vec2} offset
     *           The offset of the special FX, in units from the trap's token.
     * @property {vec2} direction
     *           For beam-like FX, this specifies the vector for the FX's
     *           direction. If left blank, it will fire towards the token
     *           that activated the trap.
     */
    get fx() {
      return this._effect.fx;
    }

    /**
     * Whether the trap should only be announced to the GM when it is activated.
     * @type {boolean}
     */
    get gmOnly() {
      return this._effect.gmOnly;
    }

    /**
     * Gets a copy of the trap's JSON properties.
     * @readonly
     * @type {object}
     */
    get json() {
      return _.clone(this._effect);
    }

    /**
     * JSON defining options to produce an explosion/implosion effect with
     * the KABOOM script.
     * @type {object}
     */
    get kaboom() {
      return this._effect.kaboom;
    }

    /**
     * The flavor message displayed when the trap is activated. If left
     * blank, a default message will be generated based on the name of the
     * trap's token.
     * @type {string}
     */
    get message() {
      return this._effect.message || this._createDefaultTrapMessage();
    }

    /**
     * The trap's name.
     * @type {string}
     */
    get name() {
      return this._trap.get('name');
    }

    /**
     * Secret notes for the GM.
     * @type {string}
     */
    get notes() {
      return this._effect.notes;
    }

    /**
     * The layer that the trap gets revealed to.
     * @type {string}
     */
    get revealLayer() {
      return this._effect.revealLayer;
    }

    /**
     * Whether the trap is revealed when it is spotted.
     * @type {boolean}
     */
    get revealWhenSpotted() {
      return this._effect.revealWhenSpotted;
    }

    /**
     * The name of a sound played when the trap is activated.
     * @type {string}
     */
    get sound() {
      return this._effect.sound;
    }

    /**
     * This is where the trap stops the token.
     * If "edge", then the token is stopped at the trap's edge.
     * If "center", then the token is stopped at the trap's center.
     * If "none", the token is not stopped by the trap.
     * @type {string}
     */
    get stopAt() {
      return this._effect.stopAt;
    }

    /**
     * Command arguments for integration with the TokenMod script by The Aaron.
     * @type {string}
     */
    get tokenMod() {
      return this._effect.tokenMod;
    }

    /**
     * The trap this TrapEffect represents.
     * @type {Graphic}
     */
    get trap() {
      return this._trap;
    }

    /**
     * The ID of the trap.
     * @type {uuid}
     */
    get trapId() {
      return this._trap.get('_id');
    }

    /**
     * A list of path IDs defining an area that triggers this trap.
     * @type {string[]}
     */
    get triggerPaths() {
      return this._effect.triggerPaths;
    }

    /**
     * A list of names or IDs for traps that will also be triggered when this
     * trap is activated.
     * @type {string[]}
     */
    get triggers() {
      return this._effect.triggers;
    }

    /**
     * The name for the trap/secret's type displayed in automated messages.
     * @type {string}
     */
    get type() {
      return this._effect.type;
    }

    /**
     * The victim who activated the trap.
     * @type {Graphic}
     */
    get victim() {
      return this._victim;
    }

    /**
     * The ID of the trap's victim.
     * @type {uuid}
     */
    get victimId() {
      return this._victim && this._victim.get('_id');
    }

    /**
     * @param {Graphic} trap
     *        The trap's token.
     * @param {Graphic} [victim]
     *        The token for the character that activated the trap.
     */
    constructor(trap, victim) {
      let effect = {};

      // URI-escape the notes and remove the HTML elements.
      let notes = trap.get('gmnotes');
      try {
        notes = decodeURIComponent(notes).trim();
      }
      catch(err) {
        notes = unescape(notes).trim();
      }
      if(notes) {
        try {
          notes = notes.split(/<[/]?.+?>/g).join('');
          effect = JSON.parse(notes);
        }
        catch(err) {
          effect.message = 'ERROR: invalid TrapEffect JSON.';
        }
      }
      this._effect = effect;
      this._trap = trap;
      this._victim = victim;
    }

    /**
     * Activates the traps that are triggered by this trap.
     */
    activateTriggers() {
      let triggers = this.triggers;
      if(triggers) {
        let otherTraps = ItsATrap.getTrapsOnPage(this._trap.get('_pageid'));
        let triggeredTraps = _.filter(otherTraps, trap => {
          // Skip if the trap is disabled.
          if(trap.get('status_interdiction'))
            return false;

          return triggers.indexOf(trap.get('name')) !== -1 ||
                 triggers.indexOf(trap.get('_id')) !== -1;
        });

        _.each(triggeredTraps, trap => {
          ItsATrap.activateTrap(trap);
        });
      }
    }

    /**
     * Announces the activated trap.
     * This should be called by TrapThemes to inform everyone about a trap
     * that has been triggered and its results. Fancy HTML formatting for
     * the message is encouraged. If the trap's effect has gmOnly set,
     * then the message will only be shown to the GM.
     * This also takes care of playing the trap's sound, FX, and API command,
     * they are provided.
     * @param  {string} [message]
     *         The message for the trap results displayed in the chat. If
     *         omitted, then the trap's raw message will be displayed.
     */
    announce(message) {
      message = message || this.message;
      let announcer = state.ItsATrap.userOptions.announcer;

      // Display the message to everyone, unless it's a secret.
      if(this.gmOnly) {
        message = '/w gm ' + message;
        sendChat(announcer, message);

        // Whisper any secret notes to the GM.
        if(this.notes)
          sendChat(announcer, '/w gm Trap Notes:<br/>' + this.notes);
      }
      else {
        sendChat(announcer, message);

        // Whisper any secret notes to the GM.
        if(this.notes)
          sendChat(announcer, '/w gm Trap Notes:<br/>' + this.notes);

        // Reveal the trap if it's set to become visible.
        if(this.trap.get('status_bleeding-eye'))
          ItsATrap.revealTrap(this.trap);

        // Produce special outputs if it has any.
        this.playSound();
        this.playFX();
        this.playAreaOfEffect();
        this.playKaboom();
        this.playTokenMod();
        this.playApi();

        // Allow traps to trigger each other using the 'triggers' property.
        this.activateTriggers();
      }
    }

    /**
     * Creates a default message for the trap.
     * @private
     * @return {string}
     */
    _createDefaultTrapMessage() {
      if(this.victim) {
        if(this.name)
          return `${this.victim.get('name')} set off a trap: ${this.name}!`;
        else
          return `${this.victim.get('name')} set off a trap!`;
      }
      else {
        if(this.name)
          return `${this.name} was activated!`;
        else
          return `A trap was activated!`;
      }
    }

    /**
     * Executes the trap's API chat command if it has one.
     */
    playApi() {
      let api = this.api;
      if(api) {
        api = api.split('TRAP_ID').join(this.trapId);
        api = api.split('VICTIM_ID').join(this.victimId);
        sendChat('ItsATrap-api', api);
      }
    }

    /**
     * Spawns the AreasOfEffect graphic for this trap. If AreasOfEffect is
     * not installed, then this has no effect.
     */
    playAreaOfEffect() {
      if(typeof AreasOfEffect !== 'undefined' && this.areaOfEffect) {
        let direction = (this.areaOfEffect.direction && VecMath.scale(this.areaOfEffect.direction, 70)) ||
        (() => {
          if(this._victim)
            return [
              this._victim.get('left') - this._trap.get('left'),
              this._victim.get('top') - this._trap.get('top')
            ];
          else
            return [0, 0];
        })();
        direction[2] = 0;

        let p1 = [this._trap.get('left'), this._trap.get('top'), 1];
        let p2 = VecMath.add(p1, direction);
        if(VecMath.dist(p1, p2) > 0) {
          let segments = [[p1, p2]];
          let pathJson = PathMath.segmentsToPath(segments);
          let path = createObj('path', _.extend(pathJson, {
            _pageid: this._trap.get('_pageid'),
            layer: 'objects',
            stroke: '#ff0000'
          }));

          let aoeGraphic = AreasOfEffect.applyEffect('', this.areaOfEffect.name, path);
          aoeGraphic.set('layer', 'map');
          toFront(aoeGraphic);
        }
      }
    }

    /**
     * Spawns built-in or custom FX for an activated trap.
     */
    playFX() {
      var pageId = this._trap.get('_pageid');

      if(this.fx) {
        var offset = this.fx.offset || [0, 0];
        var origin = [
          this._trap.get('left') + offset[0]*70,
          this._trap.get('top') + offset[1]*70
        ];

        var direction = this.fx.direction || (() => {
          if(this._victim)
            return [
              this._victim.get('left') - origin[0],
              this._victim.get('top') - origin[1]
            ];
          else
            return [ 0, 1 ];
        })();

        this._playFXNamed(this.fx.name, pageId, origin, direction);
      }
    }

    /**
     * Play FX using a named effect.
     * @private
     * @param {string} name
     * @param {uuid} pageId
     * @param {vec2} origin
     * @param {vec2} direction
     */
    _playFXNamed(name, pageId, origin, direction) {
      let x = origin[0];
      let y = origin[1];

      let fx = name;
      let isBeamLike = false;

      var custFx = findObjs({ _type: 'custfx', name: name })[0];
      if(custFx) {
        fx = custFx.get('_id');
        isBeamLike = custFx.get('definition').angle === -1;
      }
      else
        isBeamLike = !!_.find(['beam-', 'breath-', 'splatter-'], type => {
          return name.startsWith(type);
        });

      if(isBeamLike) {
        let p1 = {
          x: x,
          y: y
        };
        let p2 = {
          x: x + direction[0],
          y: y + direction[1]
        };

        spawnFxBetweenPoints(p1, p2, fx, pageId);
      }
      else
        spawnFx(x, y, fx, pageId);
    }

    /**
     * Produces an explosion/implosion effect with the KABOOM script.
     */
    playKaboom() {
      if(typeof KABOOM !== 'undefined' && this.kaboom) {
        let center = [this.trap.get('left'), this.trap.get('top')];
        let options = {
          effectPower: this.kaboom.power,
          effectRadius: this.kaboom.radius,
          type: this.kaboom.type,
          scatter: this.kaboom.scatter
        };

        KABOOM.NOW(options, center);
      }
    }

    /**
     * Plays a TrapEffect's sound, if it has one.
     */
    playSound() {
      if(this.sound) {
        var sound = findObjs({
          _type: 'jukeboxtrack',
          title: this.sound
        })[0];
        if(sound) {
          sound.set('playing', true);
          sound.set('softstop', false);
        }
        else {
          let msg = 'Could not find sound "' + this.sound + '".';
          sendChat('ItsATrap-api', msg);
        }
      }
    }

    /**
     * Invokes TokenMod on the victim's token.
     */
    playTokenMod() {
      if(typeof TokenMod !== 'undefined' && this.tokenMod && this._victim) {
        let victimId = this._victim.get('id');
        let command = '!token-mod ' + this.tokenMod + ' --ids ' + victimId;

        // Since playerIsGM fails for the player ID "API", we'll need to
        // temporarily switch TokenMod's playersCanUse_ids option to true.
        if(!TrapEffect.tokenModTimeout) {
          let temp = state.TokenMod.playersCanUse_ids;
          TrapEffect.tokenModTimeout = setTimeout(() => {
            state.TokenMod.playersCanUse_ids = temp;
            TrapEffect.tokenModTimeout = undefined;
          }, 1000);
        }

        state.TokenMod.playersCanUse_ids = true;
        sendChat('It\'s A Trap', command);
      }
    }
  };
})();
