// ============================
// === Concentration v1.0.0 ===
// ============================

// AUTHORS:
//  - Robin Kuiper:  https://app.roll20.net/users/1226016/robin
//  - Steve Roberts: https://app.roll20.net/users/16506286/midniteshadow7

const Concentration =
  globalThis.Concentration ||
  (function () {
    'use strict';

    let checked = [];

    // Styling for the chat responses.
    const styles = {
        reset: 'padding: 0; margin: 0;',
        menu: 'background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;',
        button:
          'background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center;',
        textButton:
          'background-color: transparent; border: none; padding: 0; color: #000; text-decoration: underline',
        list: 'list-style: none;',
        float: {
          right: 'float: right;',
          left: 'float: left;',
        },
        overflow: 'overflow: hidden;',
        fullWidth: 'width: 100%;',
      },
      script_name = 'Concentration',
      state_name = 'CONCENTRATION',
      debug_prefix = '[Concentration v1]',
      pending_roll_ttl = 10 * 60 * 1000,
      markers = [
        'blue',
        'brown',
        'green',
        'pink',
        'purple',
        'red',
        'yellow',
        '-',
        'all-for-one',
        'angel-outfit',
        'archery-target',
        'arrowed',
        'aura',
        'back-pain',
        'black-flag',
        'bleeding-eye',
        'bolt-shield',
        'broken-heart',
        'broken-shield',
        'broken-skull',
        'chained-heart',
        'chemical-bolt',
        'cobweb',
        'dead',
        'death-zone',
        'drink-me',
        'edge-crack',
        'fishing-net',
        'fist',
        'fluffy-wing',
        'flying-flag',
        'frozen-orb',
        'grab',
        'grenade',
        'half-haze',
        'half-heart',
        'interdiction',
        'lightning-helix',
        'ninja-mask',
        'overdrive',
        'padlock',
        'pummeled',
        'radioactive',
        'rolling-tomb',
        'screaming',
        'sentry-gun',
        'skull',
        'sleepy',
        'snail',
        'spanner',
        'stopwatch',
        'strong',
        'three-leaves',
        'tread',
        'trophy',
        'white-tower',
      ],
      allowed_reminder_targets = new Set(['everyone', 'character', 'gm']),
      allowed_support_modes = new Set(['basic', 'detailed']),
      /**
       * @typedef {Object} ConcentrationConfig
       * @property {string} command API command name without leading !.
       * @property {string} statusmarker Roll20 token marker used for concentration.
       * @property {1|2|3} bar HP bar index used to detect damage.
       * @property {'everyone'|'character'|'gm'} send_reminder_to Reminder target scope.
       * @property {boolean} auto_add_concentration_marker Auto-detect and set marker from supported spell cards.
       * @property {boolean} auto_roll_save Auto-roll concentration saves on HP loss.
       * @property {boolean} advantage Unused legacy config key preserved for compatibility.
       * @property {string} bonus_attribute Character attribute used as concentration save modifier.
       * @property {boolean} show_roll_button Show manual roll buttons when auto-roll is disabled.
       * @property {boolean} debug Enable debug logs.
       * @property {'basic'|'detailed'} support_mode Debug output detail level.
       */
      /**
       * @typedef {Object} SpellCast
       * @property {'legacy'|'beacon'} sheetType Source sheet parser that detected the cast.
       * @property {string|null} characterName Caster character name when available.
       * @property {string|null} characterId Caster character id when available.
       * @property {string} spellName Spell name.
       * @property {boolean} isConcentration Whether the detected spell requires concentration.
       */
      /**
       * @typedef {Object} ResolvedCharacter
       * @property {Object|null} character Roll20 character object if resolved.
       * @property {string|null} characterId Resolved character id.
       * @property {string|null} characterName Resolved character name.
       * @property {string|null} warning Resolution warning details.
       */
      /**
       * @typedef {Object} PendingRoll
       * @property {string|null} represents Character id represented by the token.
       * @property {string|null} tokenId Token id that triggered the check.
       * @property {number} DC Concentration check difficulty class.
       * @property {number} conSaveMod Concentration modifier.
       * @property {string} name Display name for prompts.
       * @property {string} target Chat whisper target.
       * @property {number} [createdAt] Creation timestamp in milliseconds.
       */
      validateCommandName = (value) => {
        if (typeof value !== 'string') {
          return false;
        }

        return /^[A-Za-z0-9_-]{1,32}$/.test(value.trim());
      },
      isValidRoll20Id = (value) => {
        if (typeof value !== 'string') {
          return false;
        }

        return /^[-A-Za-z0-9_]+$/.test(value.trim());
      },
      isValidPendingRollId = (value) => {
        if (typeof value !== 'string') {
          return false;
        }

        return /^pr_\d+_[a-z0-9]+$/.test(value.trim());
      },
      truncateText = (value, maxLength) => {
        if (value === null || value === undefined) {
          return value;
        }

        let text = String(value);

        return text.length > maxLength
          ? text.slice(0, maxLength) + '...'
          : text;
      },
      cleanDebugText = (value, maxLength = 240) => {
        if (value === null || value === undefined) {
          return null;
        }

        let text = String(value)
          .replace(/<[^>]*>/g, ' ')
          .replace(/&nbsp;/gi, ' ')
          .replace(/&amp;/gi, '&')
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>')
          .replace(/&quot;/gi, '"')
          .replace(/&#39;/gi, "'")
          .replace(/\s+/g, ' ')
          .trim();

        return truncateText(text || '(empty)', maxLength);
      },
      formatDebugValue = (value) => {
        if (value === null || value === undefined || value === '') {
          return 'n/a';
        }

        if (typeof value === 'string') {
          return cleanDebugText(value, 200);
        }

        if (typeof value === 'number' || typeof value === 'boolean') {
          return String(value);
        }

        if (Array.isArray(value)) {
          let simplified = value.map((item) => formatDebugValue(item));
          return truncateText(simplified.join(', '), 200);
        }

        return '[details]';
      },
      humanizeDebugText = (value) => {
        if (value === null || value === undefined || value === '') {
          return 'n/a';
        }

        return String(value).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
      },
      debugFieldLabels = {
        source: 'Detection Path',
        messageType: 'Message Type',
        template: 'Roll Template',
        spellName: 'Spell',
        caster: 'Caster',
        status: 'Result',
        preview: 'Message Preview',
        reason: 'Reason',
        warning: 'Warning',
        characterId: 'Character ID',
        characterName: 'Character Name',
        attribute: 'Attribute',
        value: 'Value',
        error: 'Error',
        pageId: 'Page ID',
        scope: 'Scope',
        represents: 'Represents',
        tokenId: 'Token ID',
        pendingRollId: 'Pending Roll ID',
      },
      getDebugFieldLabel = (key) => {
        return debugFieldLabels[key] || humanizeDebugText(key);
      },
      normalizeDetectionPath = (value) => {
        if (value === 'legacy') {
          return 'Legacy sheet';
        }

        if (value === 'beacon') {
          return 'Beacon sheet';
        }

        return 'No match';
      },
      normalizeDetectionStatus = (value) => {
        if (!value || value === 'n/a') {
          return 'n/a';
        }

        if (value === 'detected') {
          return 'Concentration spell detected';
        }

        return 'Skipped: ' + humanizeDebugText(value);
      },
      detectionReasonLabels = {
        'not-legacy-spell-rolltemplate': 'Not a legacy spell card message',
        'legacy-spell-not-concentration':
          'Legacy spell card found, but concentration was not marked',
        'legacy-spell-missing-character-or-spell':
          'Legacy spell card was missing character or spell details',
        'legacy-spell-detected': 'Legacy spell card already matched',
        'not-beacon-advancedroll': 'Not a Beacon advanced roll message',
        'advancedroll-does-not-look-like-spell-card':
          'Advanced roll did not look like a spell card',
        'beacon-spell-not-concentration':
          'Beacon spell card found, but concentration was not marked',
        'beacon-spell-missing-spell-name':
          'Beacon spell card was missing spell name',
        'beacon-spell-missing-character':
          'Beacon spell card was missing caster details',
      },
      normalizeDetectionReason = (value) => {
        if (!value || value === 'n/a') {
          return 'n/a';
        }

        let reasonText = String(value);
        let reasons = reasonText
          .split(';')
          .map((reason) => reason.trim())
          .filter(Boolean)
          .map((reason) => {
            return detectionReasonLabels[reason] || humanizeDebugText(reason);
          });

        return reasons.join('; ');
      },
      shouldLogSpellDetection = (msg, spellCast) => {
        if (spellCast) {
          return true;
        }

        // Keep detection debug readable by skipping unrelated chat traffic.
        if (msg?.rolltemplate === 'spell') {
          return true;
        }

        return msg?.type === 'advancedroll';
      },
      normalizeDebugValueByKey = (key, value) => {
        if (key === 'source') {
          return normalizeDetectionPath(value);
        }

        if (key === 'status') {
          return normalizeDetectionStatus(value);
        }

        if (key === 'reason') {
          return normalizeDetectionReason(value);
        }

        if (key === 'warning') {
          return humanizeDebugText(value);
        }

        return value;
      },
      formatDebugPayload = (data) => {
        if (data === undefined) {
          return '';
        }

        if (typeof data === 'string') {
          return cleanDebugText(data, 240);
        }

        if (data && typeof data === 'object') {
          let entries = Object.keys(data).map((key) => {
            let value = normalizeDebugValueByKey(key, data[key]);
            return getDebugFieldLabel(key) + ': ' + formatDebugValue(value);
          });

          return entries.join(' | ');
        }

        return String(data);
      },
      getContentPreview = (content) => {
        return cleanDebugText(content, 160);
      },
      getConfig = () => {
        return state[state_name]?.config || null;
      },
      getSupportMode = () => {
        let mode = getConfig()?.support_mode;

        return mode === 'detailed' ? 'detailed' : 'basic';
      },
      formatBasicSpellDetection = (data) => {
        if (data.status === 'detected') {
          return (
            'Concentration spell detected' +
            (data.spellName
              ? ' | Spell: ' + formatDebugValue(data.spellName)
              : '') +
            (data.caster ? ' | Caster: ' + formatDebugValue(data.caster) : '') +
            (data.source
              ? ' | Path: ' +
                formatDebugValue(normalizeDetectionPath(data.source))
              : '')
          );
        }

        return (
          'Skipped: ' + formatDebugValue(normalizeDetectionReason(data.status))
        );
      },
      getBasicDebugKeys = (data) => {
        let preferredKeys = [
          'reason',
          'warning',
          'error',
          'spellName',
          'caster',
          'characterName',
          'attribute',
          'value',
        ];
        let keys = preferredKeys.filter((key) => Object.hasOwn(data, key));

        if (!keys.length) {
          keys = Object.keys(data).slice(0, 2);
        }

        return keys;
      },
      formatBasicDebugObject = (data) => {
        return getBasicDebugKeys(data)
          .map((key) => {
            let value = normalizeDebugValueByKey(key, data[key]);
            return getDebugFieldLabel(key) + ': ' + formatDebugValue(value);
          })
          .join(' | ');
      },
      formatBasicDebugPayload = (label, data) => {
        if (data === undefined) {
          return '';
        }

        if (typeof data === 'string') {
          return cleanDebugText(data, 140);
        }

        if (!data || typeof data !== 'object') {
          return String(data);
        }

        if (label === 'Spell detection') {
          return formatBasicSpellDetection(data);
        }

        return formatBasicDebugObject(data);
      },
      debugLog = (label, data) => {
        let config = getConfig();
        let supportMode = getSupportMode();

        if (!config?.debug) {
          return;
        }

        let payload = '';

        if (data !== undefined) {
          try {
            payload =
              supportMode === 'detailed'
                ? formatDebugPayload(data)
                : formatBasicDebugPayload(label, data);
          } catch (error) {
            log(
              debug_prefix +
                ' debugLog stringify error: ' +
                (error?.message || String(error)),
            );
            payload = cleanDebugText(String(data), 240);
          }
        }

        log(debug_prefix + ' ' + label + (payload ? ': ' + payload : ''));
      },
      decodeEntities = (value) => {
        if (!value) {
          return value;
        }

        const entities = {
          '&amp;': '&',
          '&lt;': '<',
          '&gt;': '>',
          '&quot;': '"',
          '&#39;': "'",
        };

        return value.replace(
          /(&amp;|&lt;|&gt;|&quot;|&#39;)/g,
          (match) => entities[match] || match,
        );
      },
      getFirstMatch = (content, patterns) => {
        if (!content) {
          return null;
        }

        for (const pattern of patterns) {
          let match = content.match(pattern);
          if (match?.[1]) {
            return decodeEntities(match[1].trim());
          }
        }

        return null;
      },
      getConcentrationTrackingKey = (obj) => {
        if (!obj || typeof obj.get !== 'function') {
          return null;
        }

        return obj.get('represents') || obj.get('id') || null;
      },
      getTokenDisplayName = (token, fallbackName) => {
        if (!token || typeof token.get !== 'function') {
          return fallbackName || 'This token';
        }

        return token.get('name') || fallbackName || 'This token';
      },
      hasStatusMarker = (statusmarkers, marker) => {
        if (!statusmarkers) {
          return false;
        }

        return new RegExp('(?:^|,)' + marker + '(?:@[^,]+)?(?:,|$)').test(
          statusmarkers,
        );
      },
      cleanupPendingRolls = () => {
        if (!state[state_name].pendingRolls) {
          state[state_name].pendingRolls = {};
          return;
        }

        let now = Date.now();

        Object.keys(state[state_name].pendingRolls).forEach((id) => {
          let pendingRoll = state[state_name].pendingRolls[id];

          if (
            !pendingRoll?.createdAt ||
            now - pendingRoll.createdAt > pending_roll_ttl
          ) {
            delete state[state_name].pendingRolls[id];
          }
        });
      },
      toConfigValue = (value) => {
        if (value === 'true') {
          return true;
        }

        if (value === 'false') {
          return false;
        }

        return value;
      },
      sanitizeSpellInput = (value) => {
        if (typeof value !== 'string') {
          return '';
        }

        return truncateText(value.replace(/[<>]/g, '').trim(), 80);
      },
      escapeHtml = (value) => {
        if (value === null || value === undefined) {
          return '';
        }

        return String(value)
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#39;');
      },
      validateConfigSetting = (key, value) => {
        switch (key) {
          case 'command': {
            if (!validateCommandName(value)) {
              return {
                valid: false,
                message:
                  'Invalid command. Use 1-32 characters: letters, numbers, underscore, or hyphen.',
              };
            }

            return { valid: true, value: value.trim() };
          }

          case 'statusmarker':
            if (!markers.includes(value)) {
              return { valid: false, message: 'Invalid status marker.' };
            }

            return { valid: true, value };

          case 'bar': {
            let bar = Number.parseInt(value, 10);
            if (![1, 2, 3].includes(bar)) {
              return {
                valid: false,
                message: 'Invalid HP bar. Choose 1, 2, or 3.',
              };
            }

            return { valid: true, value: bar };
          }

          case 'send_reminder_to':
            if (!allowed_reminder_targets.has(value)) {
              return {
                valid: false,
                message:
                  'Invalid reminder target. Choose everyone, character, or gm.',
              };
            }

            return { valid: true, value };

          case 'support_mode':
            if (!allowed_support_modes.has(value)) {
              return {
                valid: false,
                message: 'Invalid support mode. Choose basic or detailed.',
              };
            }

            return { valid: true, value };

          case 'auto_add_concentration_marker':
          case 'auto_roll_save':
          case 'show_roll_button':
          case 'debug':
            if (typeof value !== 'boolean') {
              return {
                valid: false,
                message: 'Invalid toggle value. Use true or false.',
              };
            }

            return { valid: true, value };

          case 'bonus_attribute': {
            if (typeof value !== 'string' || !value.trim()) {
              return {
                valid: false,
                message: 'Invalid attribute name.',
              };
            }

            return { valid: true, value: truncateText(value.trim(), 80) };
          }

          default:
            return {
              valid: false,
              message: 'Unknown config setting.',
            };
        }
      },
      processSelectedTokens = (msg, playerid, spell) => {
        let safeSpell = sanitizeSpellInput(spell);

        if (!msg.selected?.length) {
          return false;
        }

        msg.selected.forEach((selectedItem) => {
          let token = getObj(selectedItem._type, selectedItem._id);
          addConcentration(token, playerid, safeSpell);
        });

        return true;
      },
      runPendingRoll = (pendingRollId, hasAdvantage) => {
        if (!isValidPendingRollId(pendingRollId)) {
          debugLog('Pending roll input rejected', {
            pendingRollId: pendingRollId || null,
          });
          return;
        }

        let pendingRoll = consumePendingRoll(pendingRollId);

        if (!pendingRoll) {
          debugLog('Pending roll missing or expired', {
            pendingRollId: pendingRollId || null,
          });
          makeAndSendMenu(
            'That concentration roll button has expired. Trigger the concentration check again to create a new button.',
            '',
            'gm',
          );
          return;
        }

        roll(
          pendingRoll.represents,
          pendingRoll.DC,
          pendingRoll.conSaveMod,
          pendingRoll.name,
          pendingRoll.target,
          hasAdvantage,
          pendingRoll.tokenId,
        );
      },
      applyDefaultConfig = (target, defaults) => {
        Object.keys(defaults).forEach((key) => {
          if (!Object.hasOwn(target, key)) {
            target[key] = defaults[key];
          }
        });
      },
      applyConfigSetting = (args) => {
        if (!args.length) {
          return '<span style="color: red">Missing config setting.</span>';
        }

        let setting = args.shift().split('|');
        let key = (setting.shift() || '').trim();
        let rawValue = setting.join('|');
        let value = toConfigValue(rawValue);
        let validation = validateConfigSetting(key, value);

        if (!validation.valid) {
          return '<span style="color: red">' + validation.message + '</span>';
        }

        state[state_name].config[key] = validation.value;

        return key === 'bar'
          ? '<span style="color: red">The API Library needs to be restarted for this to take effect.</span>'
          : null;
      },
      toggleAdvantageForCharacter = (characterId) => {
        if (
          !isValidRoll20Id(characterId) ||
          !getObj('character', characterId)
        ) {
          return;
        }

        if (state[state_name].advantages[characterId]) {
          state[state_name].advantages[characterId] =
            !state[state_name].advantages[characterId];
        } else {
          state[state_name].advantages[characterId] = true;
        }
      },
      handleGmCommand = (extracommand, args, msg) => {
        switch (extracommand) {
          case 'reset':
            state[state_name] = {};
            setDefaults(true);
            sendConfigMenu(
              false,
              '<span style="color: red">The API Library needs to be restarted for this to take effect.</span>',
            );
            return;

          case 'config': {
            let message = applyConfigSetting(args);
            sendConfigMenu(false, message);
            return;
          }

          case 'advantage-menu':
            sendAdvantageMenu();
            return;

          case 'toggle-advantage':
            toggleAdvantageForCharacter(args[0]);
            sendAdvantageMenu();
            return;

          case 'roll':
            runPendingRoll(args[0], false);
            return;

          case 'advantage':
            runPendingRoll(args[0], true);
            return;

          default:
            if (processSelectedTokens(msg, msg.playerid, extracommand)) {
              return;
            }

            sendConfigMenu();
        }
      },
      canControlToken = (token, character, playerid) => {
        let tokenControllers = new Set(
          (token.get('controlledby') || '').split(','),
        );
        let characterControllers = new Set(
          character ? (character.get('controlledby') || '').split(',') : [],
        );

        return (
          tokenControllers.has(playerid) ||
          tokenControllers.has('all') ||
          characterControllers.has(playerid) ||
          characterControllers.has('all') ||
          playerIsGM(playerid)
        );
      },
      resolveReminderTarget = (token, character) => {
        let target = state[state_name].config.send_reminder_to;
        let characterName = character
          ? character.get('name')
          : token.get('name');
        let tokenName = getTokenDisplayName(token, characterName);

        if (target === 'character') {
          target = characterName ? createWhisperName(characterName) : 'gm';
        } else if (target === 'everyone') {
          target = '';
        }

        return {
          target,
          tokenName,
        };
      },
      announceConcentration = (tokenName, spell, target) => {
        let safeTokenName = escapeHtml(tokenName || 'Unknown');
        let safeSpell = escapeHtml(spell || '');
        let message = spell
          ? '<b>' +
            safeTokenName +
            '</b> is now concentrating on <b>' +
            safeSpell +
            '</b>.'
          : '<b>' + safeTokenName + '</b> is now concentrating.';

        makeAndSendMenu(message, '', target);
      },
      /**
       * Stores a pending concentration roll request and returns an expiring id.
       * @param {PendingRoll} pendingRoll Pending roll payload.
       * @returns {string} Pending roll id.
       */
      createPendingRoll = (pendingRoll) => {
        cleanupPendingRolls();

        let id =
          'pr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);

        state[state_name].pendingRolls[id] = {
          represents: pendingRoll.represents || null,
          tokenId: pendingRoll.tokenId || null,
          DC: pendingRoll.DC,
          conSaveMod: pendingRoll.conSaveMod,
          name: pendingRoll.name,
          target: pendingRoll.target,
          createdAt: Date.now(),
        };

        return id;
      },
      /**
       * Consumes and removes a pending roll request by id.
       * @param {string} id Pending roll id.
       * @returns {PendingRoll|null} Pending roll payload if found and valid.
       */
      consumePendingRoll = (id) => {
        cleanupPendingRolls();

        if (!id || !state[state_name].pendingRolls[id]) {
          return null;
        }

        let pendingRoll = state[state_name].pendingRolls[id];
        delete state[state_name].pendingRolls[id];

        return pendingRoll;
      },
      detectLegacySpellCast = (msg) => {
        if (msg?.rolltemplate !== 'spell' || !msg?.content) {
          return {
            spellCast: null,
            reason: 'not-legacy-spell-rolltemplate',
          };
        }

        if (!msg.content.includes('{{concentration=1}}')) {
          return {
            spellCast: null,
            reason: 'legacy-spell-not-concentration',
          };
        }

        let characterName = getFirstMatch(msg.content, [
          /charname=([^\n{}]*[^"\n{}])/i,
        ]);
        let spellName = getFirstMatch(msg.content, [
          /name=([^\n{}]*[^"\n{}])/i,
        ]);

        if (!characterName || !spellName) {
          return {
            spellCast: null,
            reason: 'legacy-spell-missing-character-or-spell',
          };
        }

        return {
          spellCast: {
            sheetType: 'legacy',
            characterName,
            characterId: null,
            spellName,
            isConcentration: true,
          },
          reason: null,
        };
      },
      detectBeaconSpellCast = (msg) => {
        if (msg?.type !== 'advancedroll' || !msg?.content) {
          return {
            spellCast: null,
            reason: 'not-beacon-advancedroll',
          };
        }

        let looksLikeSpellCard =
          /header__title/i.test(msg.content) ||
          /header__subtitle/i.test(msg.content) ||
          /meta__character/i.test(msg.content) ||
          /data-character-name/i.test(msg.content) ||
          /spell/i.test(msg.content);

        if (!looksLikeSpellCard) {
          return {
            spellCast: null,
            reason: 'advancedroll-does-not-look-like-spell-card',
          };
        }

        let isConcentration = [
          /data-chip\s*=\s*["']?concentration["']?/i,
          /data-[a-z-]*\s*=\s*["']?concentration["']?/i,
          /\bconcentration\b/i,
        ].some((pattern) => pattern.test(msg.content));

        if (!isConcentration) {
          return {
            spellCast: null,
            reason: 'beacon-spell-not-concentration',
          };
        }

        let spellName = getFirstMatch(msg.content, [
          /header__title[^>]*>\s*([^<]+?)\s*</i,
          /data-title\s*=\s*["']([^"']+)["']/i,
          /aria-label\s*=\s*["']([^"']+)["']/i,
        ]);
        let characterName = getFirstMatch(msg.content, [
          /meta__character[^>]*>\s*([^<]+?)\s*</i,
          /data-character-name\s*=\s*["']([^"']+)["']/i,
        ]);
        let characterId = getFirstMatch(msg.content, [
          /data-character-id\s*=\s*["']([^"']+)["']/i,
          /data-characterid\s*=\s*["']([^"']+)["']/i,
          /characterid\s*=\s*["']([^"']+)["']/i,
        ]);

        if (!spellName) {
          return {
            spellCast: null,
            reason: 'beacon-spell-missing-spell-name',
          };
        }

        if (!characterName && !characterId) {
          return {
            spellCast: null,
            reason: 'beacon-spell-missing-character',
          };
        }

        return {
          spellCast: {
            sheetType: 'beacon',
            characterName,
            characterId,
            spellName,
            isConcentration: true,
          },
          reason: null,
        };
      },
      /**
       * Detects concentration spell casts across supported sheet output formats.
       * @param {Object} msg Roll20 chat message payload.
       * @returns {SpellCast|null} Detected concentration spell cast details.
       */
      detectConcentrationSpellCast = (msg) => {
        let legacyDetection = detectLegacySpellCast(msg);
        let beaconDetection = legacyDetection.spellCast
          ? { spellCast: null, reason: 'legacy-spell-detected' }
          : detectBeaconSpellCast(msg);
        let spellCast = legacyDetection.spellCast || beaconDetection.spellCast;
        let detectionSource = 'none';

        if (legacyDetection.spellCast) {
          detectionSource = 'legacy';
        } else if (beaconDetection.spellCast) {
          detectionSource = 'beacon';
        }

        if (shouldLogSpellDetection(msg, spellCast)) {
          debugLog('Spell detection', {
            source: detectionSource,
            messageType: msg?.type || null,
            template: msg?.rolltemplate || null,
            spellName: spellCast?.spellName || null,
            caster: spellCast?.characterName || spellCast?.characterId || null,
            status: spellCast
              ? 'detected'
              : [legacyDetection.reason, beaconDetection.reason]
                  .filter(Boolean)
                  .join('; '),
            preview: getContentPreview(msg?.content),
          });
        }

        return spellCast;
      },
      /**
       * Resolves a character object from parsed spell cast details.
       * @param {SpellCast} spellCast Parsed concentration spell cast details.
       * @returns {ResolvedCharacter} Character resolution result.
       */
      resolveCharacterFromSpellCast = (spellCast) => {
        let warning = null;
        let character = null;

        if (spellCast.characterId) {
          character = getObj('character', spellCast.characterId);

          if (!character) {
            warning =
              'character-id-not-found: ' +
              truncateText(spellCast.characterId, 80);
          }
        }

        if (!character && spellCast.characterName) {
          let exactMatches = findObjs({
            _type: 'character',
            name: spellCast.characterName,
          });

          if (exactMatches.length > 1) {
            warning =
              'duplicate-character-name: ' +
              truncateText(spellCast.characterName, 80);
          }

          character = exactMatches[0] || null;
        }

        return {
          character,
          characterId: character
            ? character.get('id')
            : spellCast.characterId || null,
          characterName: character
            ? character.get('name')
            : spellCast.characterName || null,
          warning,
        };
      },
      getRepresentedTokens = (characterId, player) => {
        if (!characterId) {
          return [];
        }

        let currentPageId = player?.get ? player.get('lastpage') : null;

        if (currentPageId) {
          let currentPageTokens = findObjs({
            represents: characterId,
            _type: 'graphic',
            _pageid: currentPageId,
          });

          if (currentPageTokens.length) {
            return currentPageTokens;
          }
        }

        return findObjs({
          represents: characterId,
          _type: 'graphic',
        });
      },
      getConcentrationSaveModifier = async (characterId) => {
        let attributeName = state[state_name].config.bonus_attribute;
        let rawValue = null;

        if (!characterId) {
          debugLog('Missing character for save modifier', {
            attribute: attributeName,
          });
          return 0;
        }

        if (typeof getSheetItem === 'function') {
          try {
            rawValue = await getSheetItem(characterId, attributeName);
          } catch (error) {
            debugLog('getSheetItem failed', {
              characterId,
              attribute: attributeName,
              error: error?.message || String(error),
            });
          }
        }

        if (
          (rawValue === null || rawValue === undefined || rawValue === '') &&
          typeof getAttrByName === 'function'
        ) {
          try {
            rawValue = getAttrByName(characterId, attributeName, 'current');
          } catch (error) {
            debugLog('getAttrByName failed', {
              characterId,
              attribute: attributeName,
              error: error?.message || String(error),
            });
          }
        }

        if (rawValue === null || rawValue === undefined || rawValue === '') {
          debugLog('Missing concentration modifier', {
            characterId,
            attribute: attributeName,
          });
          return 0;
        }

        let parsedValue = Number.parseInt(rawValue, 10);

        if (Number.isNaN(parsedValue)) {
          debugLog('Non-numeric concentration modifier', {
            characterId,
            attribute: attributeName,
            value: rawValue,
          });
          return 0;
        }

        return parsedValue;
      },
      /**
       * Runs concentration auto-detection and applies markers when enabled.
       * @param {Object} msg Roll20 chat message payload.
       */
      processAutoConcentrationDetection = (msg) => {
        if (!state[state_name].config.auto_add_concentration_marker) {
          return;
        }

        let spellCast = detectConcentrationSpellCast(msg);

        if (spellCast?.isConcentration) {
          handleConcentrationSpellCast(msg, spellCast);
        }
      },
      /**
       * Parses and validates an API command payload for this script.
       * @param {Object} msg Roll20 chat message payload.
       * @returns {{args:string[], extracommand:string}|null} Parsed command details, or null when invalid.
       */
      parseApiCommandMessage = (msg) => {
        if (msg.type !== 'api' || typeof msg.content !== 'string') {
          return null;
        }

        let input = msg.content.trim();

        if (!input.startsWith('!')) {
          return null;
        }

        let args = input.split(/\s+/);
        let commandToken = args.shift() || '';
        let command = commandToken.substring(1);
        let extracommand = args.shift() || '';

        if (!validateCommandName(command)) {
          return null;
        }

        if (command !== state[state_name].config.command) {
          return null;
        }

        return {
          args,
          extracommand,
        };
      },
      /**
       * Dispatches a parsed command to GM or player command handlers.
       * @param {Object} msg Roll20 chat message payload.
       * @param {{args:string[], extracommand:string}} parsedCommand Parsed command details.
       */
      dispatchApiCommand = (msg, parsedCommand) => {
        if (playerIsGM(msg.playerid)) {
          handleGmCommand(parsedCommand.extracommand, parsedCommand.args, msg);
          return;
        }

        processSelectedTokens(msg, msg.playerid, parsedCommand.extracommand);
      },
      /**
       * Handles incoming chat events for auto-detection and explicit API commands.
       * @param {Object} msg Roll20 chat:message payload.
       */
      handleInput = (msg) => {
        processAutoConcentrationDetection(msg);

        let parsedCommand = parseApiCommandMessage(msg);

        if (!parsedCommand) {
          return;
        }

        dispatchApiCommand(msg, parsedCommand);
      },
      addConcentration = (token, playerid, spell) => {
        if (!token) {
          return;
        }

        const marker = state[state_name].config.statusmarker;
        let characterId = token.get('represents');
        let character = characterId ? getObj('character', characterId) : null;

        if (!canControlToken(token, character, playerid)) {
          return;
        }

        if (!token.get('status_' + marker)) {
          let reminder = resolveReminderTarget(token, character);
          announceConcentration(reminder.tokenName, spell, reminder.target);
        }

        token.set('status_' + marker, !token.get('status_' + marker));
      },
      /**
       * Applies concentration markers from an auto-detected spell cast.
       * @param {Object} msg Roll20 chat message payload.
       * @param {SpellCast} spellCast Parsed concentration spell cast details.
       */
      handleConcentrationSpellCast = (msg, spellCast) => {
        const marker = state[state_name].config.statusmarker;
        let player = getObj('player', msg.playerid);
        let resolvedCharacter = resolveCharacterFromSpellCast(spellCast);
        let characterId = resolvedCharacter.characterId;
        let characterName =
          resolvedCharacter.characterName ||
          spellCast.characterName ||
          'Unknown';
        let representedTokens = getRepresentedTokens(characterId, player);
        let message;
        let target = state[state_name].config.send_reminder_to;

        if (resolvedCharacter.warning) {
          debugLog('Character resolution warning', {
            warning: resolvedCharacter.warning,
            characterName,
            characterId,
          });
        }

        if (!player || !characterId) {
          let abortReason = player ? 'unresolved-character' : 'missing-player';
          debugLog('Spell cast aborted', {
            reason: abortReason,
            characterName,
            characterId,
            spellName: spellCast.spellName,
          });
          return;
        }

        let searchAttributes = {
          represents: characterId,
          _type: 'graphic',
          _pageid: player.get('lastpage'),
        };
        searchAttributes['status_' + marker] = true;

        let isConcentrating = findObjs(searchAttributes).length > 0;

        if (isConcentrating) {
          message =
            '<b>' +
            escapeHtml(characterName) +
            '</b> is concentrating already.';
        } else {
          if (!representedTokens.length) {
            debugLog('No represented tokens found for spell cast', {
              characterName,
              characterId,
              spellName: spellCast.spellName,
              pageId: player.get('lastpage'),
            });
            return;
          }

          representedTokens.forEach((token) => {
            let attributes = {};
            attributes['status_' + marker] = true;
            token.set(attributes);
          });

          message =
            '<b>' +
            escapeHtml(characterName) +
            '</b> is now concentrating on <b>' +
            escapeHtml(spellCast.spellName) +
            '</b>.';
        }

        if (target === 'character') {
          target = createWhisperName(characterName);
        } else if (target === 'everyone') {
          target = '';
        }

        makeAndSendMenu(message, '', target);
      },
      handleStatusMarkerChange = (obj, prev) => {
        const marker = state[state_name].config.statusmarker;
        let markerWasSet = prev && hasStatusMarker(prev.statusmarkers, marker);

        if (markerWasSet && !obj.get('status_' + marker)) {
          removeMarker(obj.get('represents'), 'graphic', obj);
        }
      },
      /**
       * Checks whether a token update represents concentration-relevant HP loss.
       * @param {Object} obj Roll20 token graphic object after change.
       * @param {Object} prev Previous token state snapshot.
       * @param {string} marker Configured concentration status marker.
       * @param {string} bar Token bar property key being tracked.
       * @returns {boolean} True when concentration checks should run.
       */
      isConcentrationDamageEvent = (obj, prev, marker, bar) => {
        return !!(
          prev &&
          obj.get('status_' + marker) &&
          obj.get(bar) < prev[bar]
        );
      },
      /**
       * Builds reminder text and resolved whisper target for concentration checks.
       * @param {string} tokenName Display token name.
       * @param {number} DC Concentration check DC.
       * @param {'everyone'|'character'|'gm'|string} target Configured reminder target.
       * @returns {{chatText:string, target:string}} Reminder content with resolved chat target.
       */
      buildConcentrationReminderMessage = (tokenName, DC, target) => {
        let safeTokenName = escapeHtml(tokenName);
        let chatText;
        let whisperTarget;

        if (target === 'character') {
          chatText = 'Make a Concentration Check - <b>DC ' + DC + '</b>.';
          whisperTarget = createWhisperName(tokenName);
        } else if (target === 'everyone') {
          chatText =
            '<b>' +
            safeTokenName +
            '</b> must make a Concentration Check - <b>DC ' +
            DC +
            '</b>.';
          whisperTarget = '';
        } else {
          chatText =
            '<b>' +
            safeTokenName +
            '</b> must make a Concentration Check - <b>DC ' +
            DC +
            '</b>.';
          whisperTarget = 'gm';
        }

        return {
          chatText,
          target: whisperTarget,
        };
      },
      /**
       * Adds Roll and Advantage buttons to a reminder message.
       * @param {string} chatText Existing reminder text.
       * @param {string} pendingRollId Pending roll identifier.
       * @returns {string} Reminder text with action buttons appended.
       */
      appendPendingRollButtons = (chatText, pendingRollId) => {
        let withButtons =
          chatText +
          '<hr>' +
          makeButton(
            'Advantage',
            '!' +
              state[state_name].config.command +
              ' advantage ' +
              pendingRollId,
            styles.button + styles.float.right,
          );

        withButtons +=
          '&nbsp;' +
          makeButton(
            'Roll',
            '!' + state[state_name].config.command + ' roll ' + pendingRollId,
            styles.button + styles.float.left,
          );

        return withButtons;
      },
      /**
       * Prevents duplicate rapid concentration processing for the same token/character.
       * @param {string|null} trackingKey Token or represented character tracking key.
       */
      queueTrackingKey = (trackingKey) => {
        if (!trackingKey) {
          return;
        }

        checked.push(trackingKey);
        setTimeout(() => {
          let index = checked.indexOf(trackingKey);
          if (index !== -1) {
            checked.splice(index, 1);
          }
        }, 1000);
      },
      /**
       * Handles concentration checks after tracked HP bar damage.
       * @param {Object} obj Roll20 token graphic object after change.
       * @param {Object} prev Previous token state snapshot.
       */
      handleGraphicChange = async (obj, prev) => {
        let trackingKey = getConcentrationTrackingKey(obj);

        if (trackingKey && checked.includes(trackingKey)) {
          return false;
        }

        let bar = 'bar' + state[state_name].config.bar + '_value',
          target = state[state_name].config.send_reminder_to,
          marker = state[state_name].config.statusmarker;

        if (isConcentrationDamageEvent(obj, prev, marker, bar)) {
          let calc_DC = Math.floor((prev[bar] - obj.get(bar)) / 2),
            DC = Math.max(calc_DC, 10),
            con_save_mod = await getConcentrationSaveModifier(
              obj.get('represents'),
            ),
            tokenName = getTokenDisplayName(obj),
            reminder = buildConcentrationReminderMessage(tokenName, DC, target),
            chat_text = reminder.chatText;

          target = reminder.target;

          if (state[state_name].config.show_roll_button) {
            let pendingRollId = createPendingRoll({
              represents: obj.get('represents') || null,
              tokenId: obj.get('id'),
              DC,
              conSaveMod: con_save_mod,
              name: tokenName,
              target,
            });

            chat_text = appendPendingRollButtons(chat_text, pendingRollId);
          }

          if (state[state_name].config.auto_roll_save) {
            roll(
              obj.get('represents') || null,
              DC,
              con_save_mod,
              tokenName,
              target,
              !!state[state_name].advantages[obj.get('represents')],
              obj.get('id'),
            );
          } else {
            makeAndSendMenu(chat_text, '', target);
          }

          queueTrackingKey(trackingKey);
        }
      },
      /**
       * Rolls a concentration saving throw and reports success or failure.
       * @param {string|null} represents Character id represented by the token.
       * @param {number} DC Concentration check DC.
       * @param {number} con_save_mod Concentration modifier.
       * @param {string} name Display name for result output.
       * @param {string} target Chat whisper target.
       * @param {boolean} advantage Whether advantage applies.
       * @param {string|null} tokenId Token id used for marker cleanup on failure.
       */
      roll = (
        represents,
        DC,
        con_save_mod,
        name,
        target,
        advantage,
        tokenId,
      ) => {
        let safeName = escapeHtml(name);
        sendChat(
          script_name,
          '[[1d20cf<' +
            (DC - con_save_mod - 1) +
            'cs>' +
            (DC - con_save_mod - 1) +
            '+' +
            con_save_mod +
            ']]',
          (results) => {
            let title =
                'Concentration Save <br> <b style="font-size: 10pt; color: gray;">' +
                safeName +
                '</b>',
              advantageRollResult;

            let rollresult =
              results[0].inlinerolls[0].results.rolls[0].results[0].v;
            let result = rollresult;

            if (advantage) {
              advantageRollResult = randomInteger(20);
              result = Math.max(rollresult, advantageRollResult);
            }

            let total = result + con_save_mod;

            let success = total >= DC;

            let result_text = success ? 'Success' : 'Failed',
              result_color = success ? 'green' : 'red';

            let rollResultString = advantage
              ? rollresult + ' / ' + advantageRollResult
              : rollresult;

            let contents =
              '<table style="width: 100%; text-align: left;">' +
              '<tr><th>DC</th><td>' +
              DC +
              '</td></tr>' +
              '<tr><th>Modifier</th><td>' +
              con_save_mod +
              '</td></tr>' +
              '<tr><th>Roll Result</th><td>' +
              rollResultString +
              '</td></tr>' +
              '</table>' +
              '<div style="text-align: center">' +
              '<b style="font-size: 16pt;">' +
              '<span style="border: 1px solid ' +
              result_color +
              '; padding-bottom: 2px; padding-top: 4px;">[[' +
              result +
              '+' +
              con_save_mod +
              ']]</span><br><br>' +
              result_text +
              '</b>' +
              '</div>';
            makeAndSendMenu(contents, title, target);

            if (target !== '' && target !== 'gm') {
              makeAndSendMenu(contents, title, 'gm');
            }

            if (!success) {
              removeMarker(represents, getObj('graphic', tokenId), 'graphic');
            }
          },
        );
      },
      removeMarker = (represents, currentObj, type = 'graphic') => {
        let marker = 'status_' + state[state_name].config.statusmarker;

        if (represents) {
          debugLog('Removing concentration marker', {
            scope: 'represented-tokens',
            represents,
          });

          findObjs({ type, represents }).forEach((obj) => {
            if (obj.get(marker)) {
              obj.set(marker, false);
            }
          });

          return;
        }

        if (currentObj?.get(marker)) {
          debugLog('Removing concentration marker', {
            scope: 'single-token',
            tokenId: currentObj.get('id'),
          });
          currentObj.set(marker, false);
        }
      },
      createWhisperName = (name) => {
        if (!name || typeof name !== 'string') {
          return 'gm';
        }

        let safeName = name.replace(/[<>"'`]/g, '').trim();

        return (safeName || 'gm').split(' ').shift();
      },
      ucFirst = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
      },
      /**
       * Renders and sends the GM configuration menu.
       * @param {boolean} [first] Whether to show first-time setup title.
       * @param {string|null} [message] Optional status or validation message.
       */
      sendConfigMenu = (first, message) => {
        let markerDropdown = '?{Marker';
        markers.forEach((marker) => {
          markerDropdown +=
            '|' + ucFirst(marker).replace('-', ' ') + ',' + marker;
        });
        markerDropdown += '}';

        let markerButton = makeButton(
            state[state_name].config.statusmarker,
            '!' +
              state[state_name].config.command +
              ' config statusmarker|' +
              markerDropdown,
            styles.button + styles.float.right,
          ),
          commandButton = makeButton(
            '!' + state[state_name].config.command,
            '!' +
              state[state_name].config.command +
              ' config command|?{Command (without !)}',
            styles.button + styles.float.right,
          ),
          barButton = makeButton(
            'bar ' + state[state_name].config.bar,
            '!' +
              state[state_name].config.command +
              ' config bar|?{Bar|Bar 1 (green),1|Bar 2 (blue),2|Bar 3 (red),3}',
            styles.button + styles.float.right,
          ),
          sendToButton = makeButton(
            state[state_name].config.send_reminder_to,
            '!' +
              state[state_name].config.command +
              ' config send_reminder_to|?{Send To|Everyone,everyone|Character,character|GM,gm}',
            styles.button + styles.float.right,
          ),
          addConMarkerButton = makeButton(
            state[state_name].config.auto_add_concentration_marker,
            '!' +
              state[state_name].config.command +
              ' config auto_add_concentration_marker|' +
              !state[state_name].config.auto_add_concentration_marker,
            styles.button + styles.float.right,
          ),
          autoRollButton = makeButton(
            state[state_name].config.auto_roll_save,
            '!' +
              state[state_name].config.command +
              ' config auto_roll_save|' +
              !state[state_name].config.auto_roll_save,
            styles.button + styles.float.right,
          ),
          bonusAttrButton = makeButton(
            state[state_name].config.bonus_attribute,
            '!' +
              state[state_name].config.command +
              ' config bonus_attribute|?{Attribute|' +
              state[state_name].config.bonus_attribute +
              '}',
            styles.button + styles.float.right,
          ),
          showRollButtonButton = makeButton(
            state[state_name].config.show_roll_button,
            '!' +
              state[state_name].config.command +
              ' config show_roll_button|' +
              !state[state_name].config.show_roll_button,
            styles.button + styles.float.right,
          ),
          debugButton = makeButton(
            state[state_name].config.debug,
            '!' +
              state[state_name].config.command +
              ' config debug|' +
              !state[state_name].config.debug,
            styles.button + styles.float.right,
          ),
          supportModeButton = makeButton(
            state[state_name].config.support_mode,
            '!' +
              state[state_name].config.command +
              ' config support_mode|?{Support Mode|Basic,basic|Detailed,detailed}',
            styles.button + styles.float.right,
          ),
          listItems = [
            '<span style="' +
              styles.float.left +
              '">Command:</span> ' +
              commandButton,
            '<span style="' +
              styles.float.left +
              '">Statusmarker:</span> ' +
              markerButton,
            '<span style="' +
              styles.float.left +
              '">HP Bar:</span> ' +
              barButton,
            '<span style="' +
              styles.float.left +
              '">Send Reminder To:</span> ' +
              sendToButton,
            '<span style="' +
              styles.float.left +
              '">Auto Add Con. Marker: <p style="font-size: 8pt;">Works only for 5e OGL and 2024 Sheets.</p></span> ' +
              addConMarkerButton,
            '<span style="' +
              styles.float.left +
              '">Auto Roll Save:</span> ' +
              autoRollButton,
            '<span style="' +
              styles.float.left +
              '">Debug Mode:</span> ' +
              debugButton,
            '<span style="' +
              styles.float.left +
              '">Support Mode:</span> ' +
              supportModeButton,
          ],
          resetButton = makeButton(
            'Reset',
            '!' + state[state_name].config.command + ' reset',
            styles.button + styles.fullWidth,
          ),
          title_text = first
            ? script_name + ' First Time Setup'
            : script_name + ' Config';

        if (state[state_name].config.auto_roll_save) {
          listItems.push(
            '<span style="' +
              styles.float.left +
              '">Bonus Attribute:</span> ' +
              bonusAttrButton,
          );
        }

        if (!state[state_name].config.auto_roll_save) {
          listItems.push(
            '<span style="' +
              styles.float.left +
              '">Roll Button:</span> ' +
              showRollButtonButton,
          );
        }

        let advantageMenuButton = state[state_name].config.auto_roll_save
          ? makeButton(
              'Advantage Menu',
              '!' + state[state_name].config.command + ' advantage-menu',
              styles.button + styles.fullWidth,
            )
          : '';

        message = message ? '<p>' + message + '</p>' : '';
        let contents =
          message +
          makeList(
            listItems,
            styles.reset + styles.list + styles.overflow,
            styles.overflow,
          ) +
          '<br>' +
          advantageMenuButton +
          '<hr><p style="font-size: 80%">You can always come back to this config by typing `!' +
          state[state_name].config.command +
          ' config`.</p><hr>' +
          resetButton;
        makeAndSendMenu(contents, title_text, 'gm');
      },
      sendAdvantageMenu = () => {
        let menu_text = '';
        let characters = findObjs({ type: 'character' }).sort((a, b) => {
          let nameA = a.get('name').toUpperCase();
          let nameB = b.get('name').toUpperCase();

          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;

          return 0;
        });

        characters.forEach((character) => {
          let safeName = escapeHtml(character.get('name') || 'Unnamed');
          let name = state[state_name].advantages?.[character.get('id')]
            ? '<b>' + safeName + '</b>'
            : safeName;
          menu_text +=
            makeButton(
              name,
              '!' +
                state[state_name].config.command +
                ' toggle-advantage ' +
                character.get('id'),
              styles.textButton,
            ) + '<br>';
        });

        makeAndSendMenu(menu_text, 'Advantage Menu', 'gm');
      },
      makeAndSendMenu = (contents, title, whisper) => {
        title = title && title != '' ? makeTitle(title) : '';
        whisper = whisper && whisper !== '' ? '/w ' + whisper + ' ' : '';
        sendChat(
          script_name,
          whisper +
            '<div style="' +
            styles.menu +
            styles.overflow +
            '">' +
            title +
            contents +
            '</div>',
          null,
          { noarchive: true },
        );
      },
      makeTitle = (title) => {
        return '<h3 style="margin-bottom: 10px;">' + title + '</h3>';
      },
      makeButton = (title, href, style) => {
        return '<a style="' + style + '" href="' + href + '">' + title + '</a>';
      },
      makeList = (items, listStyle, itemStyle) => {
        let list = '<ul style="' + listStyle + '">';
        items.forEach((item) => {
          list += '<li style="' + itemStyle + '">' + item + '</li>';
        });
        list += '</ul>';
        return list;
      },
      checkInstall = () => {
        if (!_.has(state, state_name)) {
          state[state_name] = state[state_name] || {};
        }
        setDefaults();
        cleanupPendingRolls();

        log(
          script_name + ' Ready! Command: !' + state[state_name].config.command,
        );
        if (state[state_name].config.debug) {
          makeAndSendMenu(script_name + ' Ready! Debug On.', '', 'gm');
        }
      },
      registerEventHandlers = () => {
        on('chat:message', handleInput);
        on(
          'change:graphic:bar' + state[state_name].config.bar + '_value',
          handleGraphicChange,
        );
        on('change:graphic:statusmarkers', handleStatusMarkerChange);
      },
      setDefaults = (reset) => {
        const defaults = {
          config: {
            command: 'concentration',
            statusmarker: 'stopwatch',
            bar: 1,
            send_reminder_to: 'everyone',
            auto_add_concentration_marker: true,
            auto_roll_save: true,
            advantage: false,
            bonus_attribute: 'constitution_save_mod',
            show_roll_button: true,
            debug: false,
            support_mode: 'basic',
          },
          advantages: {},
          pendingRolls: {},
        };

        state[state_name].config = state[state_name].config || {};
        applyDefaultConfig(state[state_name].config, defaults.config);

        state[state_name].advantages =
          state[state_name].advantages || defaults.advantages;
        state[state_name].pendingRolls =
          state[state_name].pendingRolls || defaults.pendingRolls;

        if (!state[state_name].config.hasOwnProperty('firsttime') && !reset) {
          sendConfigMenu(true);
          state[state_name].config.firsttime = false;
        }
      };

    return {
      CheckInstall: checkInstall,
      RegisterEventHandlers: registerEventHandlers,
    };
  })();

on('ready', function () {
  'use strict';

  Concentration.CheckInstall();
  Concentration.RegisterEventHandlers();
});
