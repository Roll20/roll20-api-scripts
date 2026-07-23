/**
 * =========================================================
 * @File        combatassistant.js
 * @Project     Combat Assistant
 * @Description Lightweight Roll20 combat assistance extracted from T&T ideas.
 * @Author      AmadeusVF
 * @Version     1.0.0
 * =========================================================
 *
 * Design goals:
 * - Writes character sheet HP only through Beacon when the HP bar is linked.
 * - Reads Roll20 attack/damage/healing chat rolls and whispers GM action cards.
 * - Uses token bars for unlinked HP and temporary HP.
 * - Optionally reads assigned character sheet traits for resistance, immunity,
 *   vulnerability, and native Roll20 saving throw results.
 *
 * Main command:
 *   !combatAssistant menu
 *   !combatAssistant config
 *   !combatAssistant set hpbar 1
 *   !combatAssistant set acbar 2
 *   !combatAssistant set tempbar 3
 *   !combatAssistant deal <payload|manual> ...
 *   !combatAssistant heal <payload|manual> ...
 */
const CombatAssistant = (() => {
    'use strict';

    /** -----------------------------------------------------------------------
     * Metadata
     * --------------------------------------------------------------------- */
    const META = Object.freeze({
        NAME: 'Combat Assistant',
        DEVELOPER: 'AmadeusVF',
        DEVELOPER_URL: 'https://www.patreon.com/cw/AmadeusVF/home',
        SHORT_NAME: 'CA',
        LOG_NAME: 'Combat Assistant',
        CHAT_NAME: 'Combat Assistant',
        VERSION: '1.0.0',
        STATE_KEY: 'COMBAT_ASSISTANT',
        LEGACY_STATE_KEY: 'COMBAT_TRACKER',
        SCHEMA_VERSION: 1
    });

    const COMMANDS = Object.freeze([
        '!combatassistant',
        '!combat-assistant',
        '!ca'
    ]);

    const PLAYER_ALLOWED_ACTIONS = Object.freeze({
        use: true,
        rollinit: true
    });

    const INITIATIVE_BATCH_TIMERS = {};
    let SCRIPT_ACTIVE = false;

    /** -----------------------------------------------------------------------
     * Config
     * --------------------------------------------------------------------- */
    const DEFAULT_CARD_CONFIG = Object.freeze({
        width: 300,
        leftOffset: -30,
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(255, 255, 255)',
        borderColor: 'rgb(127, 127, 127)',
        titleBgColor: 'rgba(0, 0, 0, 0.6)',
        titleLineColor: 'rgba(215, 47, 47, 0.8)',
        bodyBgColor: 'rgba(0, 0, 0, 0.3)',
        bodyImageUrl: 'https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTEyL3Jhd3BpeGVsX29mZmljZV80Nl9ibGFja193YWxscGFwZXJfbW9ub2Nocm9tZV9jaGluZXNlX2RyYWdvbl8yNmY3MzllOS1mYzkwLTQ3MDEtYjdmNS01NjFmMTQwMjc1OGRfMS5qcGc.jpg'
    });

    const DEFAULT_TEXT_CONFIG = Object.freeze({
        character: 'rgb(211, 194, 12)',
        heal: 'rgb(52, 203, 116)',
        damage: 'rgb(220, 45, 45)',
        applied: 'rgb(84, 186, 255)'
    });

    const DAMAGE_TYPE_COLORS = Object.freeze({
        normal: 'rgb(220, 45, 45)',
        bludgeoning: 'rgb(135, 35, 35)',
        slashing: 'rgb(135, 35, 35)',
        piercing: 'rgb(135, 35, 35)',
        fire: 'rgb(215, 55, 40)',
        acid: 'rgb(115, 230, 95)',
        poison: 'rgb(134, 38, 244)',
        cold: 'rgb(49, 87, 239)',
        lightning: 'rgb(75, 230, 255)',
        thunder: 'rgb(122, 120, 255)',
        force: 'rgb(185, 45, 120)',
        necrotic: 'rgb(61, 82, 79)',
        psychic: 'rgb(155, 90, 212)',
        radiant: 'rgb(223, 232, 96)',
        healing: 'rgb(52, 203, 116)',
        'temp healing': 'rgb(255, 105, 180)'
    });

    const DAMAGE_TYPE_ICONS = Object.freeze({
        normal: '💫',
        acid: '🧪',
        bludgeoning: '💢',
        cold: '❄️',
        fire: '🔥',
        force: '🌀',
        lightning: '⚡',
        necrotic: '💀',
        piercing: '🗡️',
        poison: '☠️',
        psychic: '🪬',
        radiant: '🌟',
        slashing: 'ノ',
        thunder: '🌩️',
        healing: '💚',
        'temp healing': '💗'
    });

    const ABILITIES = Object.freeze({
        strength: 'STR',
        dexterity: 'DEX',
        constitution: 'CON',
        intelligence: 'INT',
        wisdom: 'WIS',
        charisma: 'CHA'
    });

    const ABILITY_ALIASES = Object.freeze({
        str: 'strength',
        strength: 'strength',
        dex: 'dexterity',
        dexterity: 'dexterity',
        con: 'constitution',
        constitution: 'constitution',
        int: 'intelligence',
        intelligence: 'intelligence',
        wis: 'wisdom',
        wisdom: 'wisdom',
        cha: 'charisma',
        charisma: 'charisma'
    });

    const CONFIG = Object.freeze({
        CHAT_NAME: META.CHAT_NAME,
        DEFAULT_CARD_CONFIG,
        DEFAULT_TEXT_CONFIG,
        DEFAULT_CARD_WIDTH: DEFAULT_CARD_CONFIG.width,
        DEFAULT_CARD_LEFT_OFFSET: DEFAULT_CARD_CONFIG.leftOffset,
        DEFAULT_CARD_TITLE_COLOR: DEFAULT_CARD_CONFIG.titleColor,
        DEFAULT_CARD_BODY_COLOR: DEFAULT_CARD_CONFIG.bodyColor,
        DEFAULT_CARD_BORDER_COLOR: DEFAULT_CARD_CONFIG.borderColor,
        DEFAULT_CARD_TITLE_BG_COLOR: DEFAULT_CARD_CONFIG.titleBgColor,
        DEFAULT_CARD_TITLE_LINE_COLOR: DEFAULT_CARD_CONFIG.titleLineColor,
        DEFAULT_CARD_BODY_BG_COLOR: DEFAULT_CARD_CONFIG.bodyBgColor,
        DEFAULT_CARD_BODY_IMAGE_URL: DEFAULT_CARD_CONFIG.bodyImageUrl,
        DEFAULT_TEXT_CHARACTER_COLOR: DEFAULT_TEXT_CONFIG.character,
        DEFAULT_TEXT_HEAL_COLOR: DEFAULT_TEXT_CONFIG.heal,
        DEFAULT_DAMAGE_TYPE_COLOR: DEFAULT_TEXT_CONFIG.damage,
        DEFAULT_TEXT_APPLIED_COLOR: DEFAULT_TEXT_CONFIG.applied,
        DAMAGE_TYPE_COLORS,
        DAMAGE_TYPE_ICONS,
        ROLL_CARD_STYLE: Object.freeze({
            fontFamily: "'Comic Sans MS', 'Comic Sans', cursive",
            fontSize: '22px',
            fontWeight: '900',
            color: 'rgb(255,255,255)'
        })
    });

    const RUNTIME_CONFIG_DEFAULTS = Object.freeze({
        DEBUG: false,
        CHAT_TRACKING: true,
        CHAT_PROBE: false,
        PLAYER_ATTACK_BUTTON: false,
        PLAYER_HEALING_BUTTON: false,
        PLAYER_MANUAL_ROLL: false,
        CA_ROLLS_INITIATIVE: false,
        SHEET_2014_CA_ROLLS: false,
        HP_BAR: 1,
        AC_BAR: 2,
        TEMP_HP_BAR: 3,
        DAMAGE_ROUND_UP: true,
        USE_SHEET_DAMAGE_TRAITS: true,
        REVEAL_DAMAGE_SOURCE: true,
        HIDE_TOKEN_NAMES_IN_LOG: false,
        CHAT_BACKGROUND_IMAGE_URL: DEFAULT_CARD_CONFIG.bodyImageUrl
    });

    const RUNTIME_CONFIG_FIELDS = Object.freeze([
        { key: 'CHAT_TRACKING', label: 'Chat Tracking', type: 'boolean', tip: 'Read Roll20 attack, damage, and healing rolls.' },
        { key: 'CA_ROLLS_INITIATIVE', label: '2024 Combat Assistant Rolls Initiative', type: 'boolean', tip: 'Combat Assistant rolls initiative from sheet data and writes the turn order directly.' },
        { key: 'SHEET_2014_CA_ROLLS', label: '2014 Combat Assistance Rolls', type: 'boolean', tip: 'OFF uses Roll20 buttons for 2014 NPC saving throws and initiative. ON rolls 2014 NPC saving throws and initiative with Combat Assistant after asking normal, advantage, or disadvantage.' },
        { key: 'PLAYER_MANUAL_ROLL', label: 'Player Manual Roll', type: 'boolean', tip: 'Ask player-controlled tokens to roll their own saving throws.' },
        { key: 'PLAYER_ATTACK_BUTTON', label: 'Player Attack Button', type: 'boolean', tip: 'When possible, captured attack buttons are whispered to the controlling player, allowing them to select a target, resolve the attack against its AC, and automatically apply damage.' },
        { key: 'PLAYER_HEALING_BUTTON', label: 'Player Healing Button', type: 'boolean', tip: 'When possible, captured healing buttons are whispered to the controlling player, allowing them to select a target apply healing.' },
        { key: 'HP_BAR', label: 'HP Bar', type: 'bar', tip: 'Token bar used for hit points.' },
        { key: 'AC_BAR', label: 'AC Bar', type: 'bar', tip: 'Token bar used for armor class.' },
        { key: 'TEMP_HP_BAR', label: 'Temp HP Bar', type: 'bar0', tip: 'Token bar used for temporary HP. Use 0 to disable.' },
        { key: 'DAMAGE_ROUND_UP', label: 'Damage Round Up', type: 'boolean', tip: 'Round halved damage up instead of down.' },
        { key: 'USE_SHEET_DAMAGE_TRAITS', label: 'Read Sheet Resistances', type: 'boolean', tip: 'Read Roll20 sheet damage resistances, immunities, and vulnerabilities.' },
        { key: 'REVEAL_DAMAGE_SOURCE', label: 'Reveal Damage Source', type: 'boolean', tip: 'Show who caused damage and which attack or spell caused it.' },
        { key: 'HIDE_TOKEN_NAMES_IN_LOG', label: "Hide Token's Names in Log", type: 'boolean', tip: 'Use generic Target and Attacker labels in public combat logs while keeping token icons in the title.' },
        { key: 'DEBUG', label: 'Debug', type: 'boolean', tip: 'Log debug information in the Roll20 API console.' },
        { key: 'CHAT_BACKGROUND_IMAGE_URL', label: 'Chat Background Image URL', type: 'text', tip: 'Background image used by Combat Assistant cards.' },
        //{ key: 'CHAT_PROBE', label: 'Chat Probe', type: 'boolean', tip: 'Whisper raw Roll20 chat message dumps to the GM for parser testing.' },
    ]);

    /** -----------------------------------------------------------------------
     * State
     * --------------------------------------------------------------------- */
    const State = {
        defaults() {
            return {
                schemaVersion: META.SCHEMA_VERSION,
                settings: Object.assign({}, RUNTIME_CONFIG_DEFAULTS),
                recentAttacks: {},
                recentAttackQueue: [],
                pendingNativeSaves: {},
                pendingNativeInitiatives: {},
                pendingNativeInitiativeBatches: {},
                pendingNativeInitiativeSeq: 0,
                playerActionRequests: {}
            };
        },

        ensure() {
            if (!state[META.STATE_KEY] && META.LEGACY_STATE_KEY && state[META.LEGACY_STATE_KEY]) {
                state[META.STATE_KEY] = state[META.LEGACY_STATE_KEY];
            }
            state[META.STATE_KEY] = state[META.STATE_KEY] || this.defaults();
            this.migrate();
            return state[META.STATE_KEY];
        },

        migrate() {
            const root = state[META.STATE_KEY];
            root.schemaVersion = root.schemaVersion || 1;
            root.settings = root.settings || {};
            Object.keys(RUNTIME_CONFIG_DEFAULTS).forEach((key) => {
                if (!Object.prototype.hasOwnProperty.call(root.settings, key)) {
                    root.settings[key] = RUNTIME_CONFIG_DEFAULTS[key];
                }
            });
            root.recentAttacks = root.recentAttacks || {};
            root.recentAttackQueue = Array.isArray(root.recentAttackQueue) ? root.recentAttackQueue : [];
            root.pendingNativeSaves = root.pendingNativeSaves || {};
            root.pendingNativeInitiatives = root.pendingNativeInitiatives || {};
            root.pendingNativeInitiativeBatches = root.pendingNativeInitiativeBatches || {};
            root.pendingNativeInitiativeSeq = Math.max(0, Utils.toInt(root.pendingNativeInitiativeSeq, 0));
            root.playerActionRequests = root.playerActionRequests || {};
            root.schemaVersion = META.SCHEMA_VERSION;
        },

        get() {
            return this.ensure();
        },

        createPlayerActionRequest(data) {
            const root = this.get();
            root.playerActionRequests = root.playerActionRequests || {};
            this.cleanupPlayerActionRequests();
            const id = 'pa_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
            root.playerActionRequests[id] = Object.assign({}, data || {}, {
                id,
                createdAt: Date.now(),
                used: false
            });
            return id;
        },

        getPlayerActionRequest(id) {
            const root = this.get();
            root.playerActionRequests = root.playerActionRequests || {};
            const safeId = String(id || '').trim();
            return safeId ? (root.playerActionRequests[safeId] || null) : null;
        },

        markPlayerActionUsed(id) {
            const request = this.getPlayerActionRequest(id);
            if (!request || request.used) return false;
            request.used = true;
            request.usedAt = Date.now();
            return true;
        },

        cleanupPlayerActionRequests() {
            const root = this.get();
            root.playerActionRequests = root.playerActionRequests || {};
            const now = Date.now();
            Object.keys(root.playerActionRequests).forEach((id) => {
                const entry = root.playerActionRequests[id] || {};
                const age = now - Number(entry.createdAt || 0);
                if (entry.used || age > 10 * 60 * 1000) delete root.playerActionRequests[id];
            });
        },

        cleanupRuntimeQueues() {
            const root = this.get();
            const now = Date.now();

            root.playerActionRequests = root.playerActionRequests || {};
            Object.keys(root.playerActionRequests).forEach((id) => {
                const entry = root.playerActionRequests[id] || {};
                const createdAt = Number(entry.createdAt || 0);
                if (entry.used || !createdAt || now - createdAt > 10 * 60 * 1000) delete root.playerActionRequests[id];
            });

            root.pendingNativeSaves = root.pendingNativeSaves || {};
            Object.keys(root.pendingNativeSaves).forEach((id) => {
                const entry = root.pendingNativeSaves[id] || {};
                const createdAt = Number(entry.createdAt || 0);
                if (!createdAt || now - createdAt > 2 * 60 * 1000) delete root.pendingNativeSaves[id];
            });

            root.pendingNativeInitiatives = root.pendingNativeInitiatives || {};
            Object.keys(root.pendingNativeInitiatives).forEach((id) => {
                const entry = root.pendingNativeInitiatives[id] || {};
                const createdAt = Number(entry.createdAt || 0);
                if (!createdAt || now - createdAt > 2 * 60 * 1000) delete root.pendingNativeInitiatives[id];
            });

            root.pendingNativeInitiativeBatches = root.pendingNativeInitiativeBatches || {};
            Object.keys(root.pendingNativeInitiativeBatches).forEach((id) => {
                const entry = root.pendingNativeInitiativeBatches[id] || {};
                const createdAt = Number(entry.createdAt || 0);
                if (!createdAt || now - createdAt > 2 * 60 * 1000) delete root.pendingNativeInitiativeBatches[id];
            });

            root.recentAttacks = root.recentAttacks || {};
            Object.keys(root.recentAttacks).forEach((key) => {
                const entry = root.recentAttacks[key] || {};
                const timestamp = Number(entry.timestamp || 0);
                if (!timestamp || now - timestamp > 60 * 1000) delete root.recentAttacks[key];
            });

            root.recentAttackQueue = (Array.isArray(root.recentAttackQueue) ? root.recentAttackQueue : [])
                .filter((entry) => entry && now - Number(entry.timestamp || 0) <= 60 * 1000)
                .slice(-20);
        }
    };

    /** -----------------------------------------------------------------------
     * Logger
     * --------------------------------------------------------------------- */
    const Logger = {
        isDebugEnabled() {
            return !!RuntimeConfig.get('DEBUG');
        },

        info() {
            const args = Array.prototype.slice.call(arguments);
            log('[' + META.LOG_NAME + '] ' + args.join(' '));
        },

        debug() {
            if (!this.isDebugEnabled()) return;
            const args = Array.prototype.slice.call(arguments);
            log('[' + META.LOG_NAME + ':DEBUG] ' + args.join(' '));
        },

        error() {
            const args = Array.prototype.slice.call(arguments);
            log('[' + META.LOG_NAME + ':ERROR] ' + args.join(' '));
        }
    };

    /** -----------------------------------------------------------------------
     * Utils
     * --------------------------------------------------------------------- */
    const Utils = {
        asString(value, fallback) {
            if (fallback === undefined) fallback = '';
            return value === undefined || value === null ? fallback : String(value);
        },

        toInt(value, fallback) {
            if (fallback === undefined) fallback = 0;
            const n = parseInt(value, 10);
            return Number.isNaN(n) ? fallback : n;
        },

        toNumber(value, fallback) {
            if (fallback === undefined) fallback = 0;
            const n = parseFloat(value);
            return Number.isNaN(n) ? fallback : n;
        },

        toBoolean(value, fallback) {
            if (fallback === undefined) fallback = false;
            if (value === undefined || value === null || String(value).trim() === '') return fallback;
            if (value === true || value === false) return value;
            const normalized = String(value).trim().toLowerCase();
            if (['1', 'true', 'yes', 'y', 'on', 'enable', 'enabled'].indexOf(normalized) >= 0) return true;
            if (['0', 'false', 'no', 'n', 'off', 'disable', 'disabled'].indexOf(normalized) >= 0) return false;
            return fallback;
        },

        clamp(value, min, max) {
            return Math.max(min, Math.min(max, value));
        },

        isFunction(value) {
            return typeof value === 'function';
        },

        isNonEmptyString(value) {
            return typeof value === 'string' && value.trim().length > 0;
        },

        escapeHtml(value) {
            return Utils.asString(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        },

        attrSafe(value) {
            return Utils.escapeHtml(value).replace(/[\r\n]+/g, ' ');
        },

        stripHtml(value) {
            return String(value || '')
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
                .replace(/<li[^>]*>/gi, '- ')
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;/gi, ' ')
                .replace(/&quot;/gi, '"')
                .replace(/&#39;|&apos;/gi, "'")
                .replace(/&lt;/gi, '<')
                .replace(/&gt;/gi, '>')
                .replace(/&amp;/gi, '&')
                .trim();
        },

        cleanRoll20Label(value) {
            return Utils.stripHtml(value)
                .replace(/\[([^\]]+)\]\((?:[^)]+)\)/g, '$1')
                .replace(/\$\[\[\d+\]\]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        },

        truncate(value, maxLength) {
            const text = String(value || '');
            const max = Math.max(20, Utils.toInt(maxLength, 1200));
            return text.length > max ? text.slice(0, max) + '...' : text;
        },

        encodeJsonPayload(value) {
            try {
                return encodeURIComponent(JSON.stringify(value || {}));
            } catch (error) {
                Logger.debug('[Payload:encode]', error && error.message ? error.message : String(error));
                return '%7B%7D';
            }
        },

        decodeJsonPayload(value, fallback) {
            if (fallback === undefined) fallback = {};
            try {
                const decoded = decodeURIComponent(String(value || '').trim());
                const parsed = JSON.parse(decoded);
                return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
            } catch (error) {
                Logger.debug('[Payload:decode]', error && error.message ? error.message : String(error));
                return fallback;
            }
        },

        splitCommand(content) {
            const text = Utils.asString(content).trim();
            const parts = text.split(/\s+/);
            return { raw: text, base: parts[0] || '', args: parts.slice(1) };
        },

        normalizeName(value) {
            return String(value || '')
                .trim()
                .toLowerCase()
                .replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/[^a-z0-9]+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        },

        uniqueNames(list) {
            const seen = {};
            const out = [];
            (Array.isArray(list) ? list : []).forEach((entry) => {
                const name = String(entry || '').trim();
                const key = name.toLowerCase();
                if (!name || seen[key]) return;
                seen[key] = true;
                out.push(name);
            });
            return out;
        },

        formatSigned(value) {
            const n = Utils.toInt(value, 0);
            return (n >= 0 ? '+' : '') + String(n);
        },

        isSafeImageUrl(value) {
            const url = String(value || '').trim();
            return /^https?:\/\//i.test(url) || url === '';
        }
    };

    /** -----------------------------------------------------------------------
     * Runtime config
     * --------------------------------------------------------------------- */
    const RuntimeConfig = {
        getAll() {
            const root = State.get();
            root.settings = root.settings || {};
            Object.keys(RUNTIME_CONFIG_DEFAULTS).forEach((key) => {
                if (!Object.prototype.hasOwnProperty.call(root.settings, key)) root.settings[key] = RUNTIME_CONFIG_DEFAULTS[key];
            });
            return root.settings;
        },

        get(key) {
            const safeKey = String(key || '').trim().toUpperCase();
            const config = this.getAll();
            return Object.prototype.hasOwnProperty.call(config, safeKey) ? config[safeKey] : RUNTIME_CONFIG_DEFAULTS[safeKey];
        },

        normalizeKey(key) {
            const normalized = String(key || '').trim().toUpperCase().replace(/[-\s]+/g, '_');
            const aliases = {
                HPBAR: 'HP_BAR',
                HP_BAR: 'HP_BAR',
                ACBAR: 'AC_BAR',
                AC_BAR: 'AC_BAR',
                TEMPBAR: 'TEMP_HP_BAR',
                TEMP_BAR: 'TEMP_HP_BAR',
                TEMP_HP: 'TEMP_HP_BAR',
                TEMP_HP_BAR: 'TEMP_HP_BAR',
                CHAT: 'CHAT_TRACKING',
                CHATTRACKING: 'CHAT_TRACKING',
                CHAT_TRACKING: 'CHAT_TRACKING',
                PROBE: 'CHAT_PROBE',
                CHAT_PROBE: 'CHAT_PROBE',
                ROUNDUP: 'DAMAGE_ROUND_UP',
                DAMAGE_ROUND_UP: 'DAMAGE_ROUND_UP',
                SHEET_TRAITS: 'USE_SHEET_DAMAGE_TRAITS',
                USE_SHEET_DAMAGE_TRAITS: 'USE_SHEET_DAMAGE_TRAITS',
                PLAYER_COMBAT: 'PLAYER_ATTACK_BUTTON',
                PLAYER_ATTACK_BUTTON: 'PLAYER_ATTACK_BUTTON',
                PLAYER_HEALTH: 'PLAYER_HEALING_BUTTON',
                PLAYER_HEALING_BUTTON: 'PLAYER_HEALING_BUTTON',
                PLAYER_MANUAL: 'PLAYER_MANUAL_ROLL',
                PLAYER_MANUAL_ROLL: 'PLAYER_MANUAL_ROLL',
                MANUAL_ROLL: 'PLAYER_MANUAL_ROLL',
                CA2014: 'SHEET_2014_CA_ROLLS',
                '2014': 'SHEET_2014_CA_ROLLS',
                '2014_CA': 'SHEET_2014_CA_ROLLS',
                '2014_CA_ROLLS': 'SHEET_2014_CA_ROLLS',
                SHEET_2014_CA_ROLLS: 'SHEET_2014_CA_ROLLS',
                HIDE_NAMES: 'HIDE_TOKEN_NAMES_IN_LOG',
                HIDE_TOKEN_NAMES: 'HIDE_TOKEN_NAMES_IN_LOG',
                HIDE_TOKEN_NAMES_IN_LOG: 'HIDE_TOKEN_NAMES_IN_LOG',
                BG: 'CHAT_BACKGROUND_IMAGE_URL',
                BACKGROUND: 'CHAT_BACKGROUND_IMAGE_URL',
                CHAT_BACKGROUND_IMAGE_URL: 'CHAT_BACKGROUND_IMAGE_URL',
                DEBUG: 'DEBUG'
            };
            return aliases[normalized] || normalized;
        },

        getField(key) {
            const safeKey = this.normalizeKey(key);
            for (let i = 0; i < RUNTIME_CONFIG_FIELDS.length; i += 1) {
                if (RUNTIME_CONFIG_FIELDS[i].key === safeKey) return RUNTIME_CONFIG_FIELDS[i];
            }
            return null;
        },

        normalizeValue(field, value) {
            if (!field) return value;
            if (field.type === 'boolean') return Utils.toBoolean(value, !!RUNTIME_CONFIG_DEFAULTS[field.key]);
            if (field.type === 'bar') return Utils.clamp(Utils.toInt(value, RUNTIME_CONFIG_DEFAULTS[field.key]), 1, 3);
            if (field.type === 'bar0') return Utils.clamp(Utils.toInt(value, RUNTIME_CONFIG_DEFAULTS[field.key]), 0, 3);
            if (field.key === 'CHAT_BACKGROUND_IMAGE_URL') {
                const url = String(value === undefined || value === null ? '' : value).trim();
                return Utils.isSafeImageUrl(url) ? url : RUNTIME_CONFIG_DEFAULTS.CHAT_BACKGROUND_IMAGE_URL;
            }
            return String(value === undefined || value === null ? '' : value).trim();
        },

        set(key, value) {
            const safeKey = this.normalizeKey(key);
            const field = this.getField(safeKey);
            if (!field) return { ok: false, message: 'Unknown setting: ' + key + '.' };
            const config = this.getAll();
            config[safeKey] = this.normalizeValue(field, value);
            return { ok: true, key: safeKey, value: config[safeKey], field };
        },

        toggle(key) {
            const safeKey = this.normalizeKey(key);
            const field = this.getField(safeKey);
            if (!field) return { ok: false, message: 'Unknown setting: ' + key + '.' };
            if (field.type !== 'boolean') return { ok: false, message: 'Setting is not toggleable: ' + key + '.' };
            return this.set(safeKey, !Utils.toBoolean(this.get(safeKey), false));
        },

        fields() {
            return RUNTIME_CONFIG_FIELDS.slice();
        }
    };

    /** -----------------------------------------------------------------------
     * HTML helpers
     * --------------------------------------------------------------------- */
    const Html = {
        tag(tagName, content, style) {
            if (content === undefined) content = '';
            if (style === undefined) style = '';
            const styleAttr = style ? ' style="' + style + '"' : '';
            return '<' + tagName + styleAttr + '>' + content + '</' + tagName + '>';
        },

        span(content, style) {
            return this.tag('span', content || '', style || '');
        },

        div(content, style) {
            return this.tag('div', content || '', style || '');
        },

        img(src, style) {
            return '<img src="' + Utils.attrSafe(src || '') + '" style="' + (style || '') + '" />';
        },

        tooltip(innerHtml, tipHtml) {
            const tip = String(tipHtml || '').trim();
            if (!tip) return innerHtml;
            return '<span class="showtip tipsy" title="' + Utils.attrSafe(tip) + '">' + innerHtml + '</span>';
        },

        card(options) {
            options = options || {};
            const title = String(options.title || '');
            const body = String(options.body || '');
            const buildOptions = options.buildOptions || {};
            const width = Number(buildOptions.width) || CONFIG.DEFAULT_CARD_WIDTH;
            const leftOffset = Number(buildOptions.leftOffset) || CONFIG.DEFAULT_CARD_LEFT_OFFSET;
            const titleAlign = buildOptions.titleAlign || 'center';
            const bodyAlign = buildOptions.bodyAlign || 'center';
            const titleColor = buildOptions.titleColor || CONFIG.DEFAULT_CARD_TITLE_COLOR;
            const bodyColor = buildOptions.bodyColor || CONFIG.DEFAULT_CARD_BODY_COLOR;
            const borderColor = buildOptions.borderColor || CONFIG.DEFAULT_CARD_BORDER_COLOR;
            const titleBgColor = buildOptions.titleBgColor || CONFIG.DEFAULT_CARD_TITLE_BG_COLOR;
            const titleLineColor = buildOptions.titleLineColor || CONFIG.DEFAULT_CARD_TITLE_LINE_COLOR;
            const bodyBgColor = buildOptions.bodyBgColor || CONFIG.DEFAULT_CARD_BODY_BG_COLOR;
            const bgImageURLRaw = buildOptions.bgImageURL || RuntimeConfig.get('CHAT_BACKGROUND_IMAGE_URL') || CONFIG.DEFAULT_CARD_BODY_IMAGE_URL;
            const bgImageURL = Utils.isSafeImageUrl(bgImageURLRaw) ? bgImageURLRaw : CONFIG.DEFAULT_CARD_BODY_IMAGE_URL;
            const bgOverlayStart = buildOptions.bgOverlayStart || 'rgba(0, 0, 0, 0.8)';
            const bgOverlayEnd = buildOptions.bgOverlayEnd || 'rgba(0, 0, 0, 0.8)';
            const bgSize = buildOptions.bgSize || 'auto 100%';
            const bgAttachment = buildOptions.bgAttachment || 'fixed';
            const bgPosition = buildOptions.bgPosition || 'right 25px bottom 100px';
            const titleHtml = Utils.isNonEmptyString(buildOptions.titleHtml)
                ? String(buildOptions.titleHtml)
                : Utils.escapeHtml(title);

            return (
                '<div style="display:block;width:calc(100% + ' + Math.abs(leftOffset) + 'px);margin-left:' + leftOffset + 'px;text-align:left;box-sizing:border-box;">' +
                    '<div style="' +
                        'display:block;' +
                        'width:' + width + 'px;' +
                        'max-width:100%;' +
                        'background-image:linear-gradient(' + bgOverlayStart + ',' + bgOverlayEnd + '), url(\'' + Utils.attrSafe(bgImageURL) + '\');' +
                        'background-size:' + bgSize + ';' +
                        'background-position:' + bgPosition + ';' +
                        'background-repeat:no-repeat;' +
                        'background-attachment:' + bgAttachment + ';' +
                        'border:1px solid ' + borderColor + ';' +
                        'border-radius:8px;' +
                        'overflow:hidden;' +
                        'box-sizing:border-box;' +
                        'font-family:Arial,Helvetica,sans-serif;' +
                    '">' +
                        '<div style="padding:8px 12px;text-align:' + titleAlign + ';font-weight:700;font-size:18px;color:' + titleColor + ';background:' + titleBgColor + ';">' +
                            titleHtml +
                            '<div style="height:1px;background:' + titleLineColor + ';margin:6px -6px -8px -6px;"></div>' +
                        '</div>' +
                        '<div style="padding:8px 10px 10px 10px;text-align:' + bodyAlign + ';color:' + bodyColor + ';background:' + bodyBgColor + ';">' + body + '</div>' +
                    '</div>' +
                '</div>'
            );
        }
    };

    /** -----------------------------------------------------------------------
     * Roll20 adapter
     * --------------------------------------------------------------------- */
    const R20 = {
        send(message, callback) {
            if (Utils.isFunction(callback)) sendChat(CONFIG.CHAT_NAME, message, callback);
            else sendChat(CONFIG.CHAT_NAME, message);
        },

        direct(html) {
            this.send('/direct ' + html);
        },

        whisper(target, html) {
            const safeTarget = String(target || 'GM').trim() || 'GM';
            this.send('/w "' + safeTarget + '" ' + html);
        },

        hasSheetApi() {
            return typeof getSheetItem === 'function' && typeof setSheetItem === 'function';
        },

        buttonAbilityCommand(characterId, abilityName) {
            const safeCharacterId = String(characterId || '').trim();
            const safeAbilityName = String(abilityName || '').trim();
            return safeCharacterId && safeAbilityName ? ('~' + safeCharacterId + '|' + safeAbilityName) : '';
        },

        chatAbilityCommand(characterId, abilityName) {
            const safeCharacterId = String(characterId || '').trim();
            const safeAbilityName = String(abilityName || '').trim();
            return safeCharacterId && safeAbilityName ? ('%{' + safeCharacterId + '|' + safeAbilityName + '}') : '';
        },

        sheetAttributeCommand(characterId, attributeName, htmlEncoded) {
            const safeCharacterId = String(characterId || '').trim();
            const safeAttributeName = String(attributeName || '').trim();
            if (!safeCharacterId || !safeAttributeName) return '';
            return (htmlEncoded ? '&#64;' : '@') + '{' + safeCharacterId + '|' + safeAttributeName + '}';
        },

        getSelectedTokens(msg) {
            const selected = Array.isArray(msg && msg.selected) ? msg.selected : [];
            const seen = {};
            const tokens = [];
            for (let i = 0; i < selected.length; i += 1) {
                const id = String(selected[i] && selected[i]._id || '').trim();
                if (!id || seen[id]) continue;
                seen[id] = true;
                const token = getObj('graphic', id);
                if (token) tokens.push(token);
            }
            return tokens;
        },

        getTokenById(tokenId) {
            const id = String(tokenId || '').trim();
            return id ? getObj('graphic', id) : null;
        },

        getCharacterFromToken(token) {
            if (!token || !Utils.isFunction(token.get)) return null;
            const charId = String(token.get('represents') || '').trim();
            return charId ? getObj('character', charId) : null;
        },

        getCharacterByName(characterName) {
            const safeName = String(characterName || '').trim().toLowerCase();
            if (!safeName) return null;
            const characters = findObjs({ _type: 'character' }) || [];
            for (let i = 0; i < characters.length; i += 1) {
                const current = String(characters[i].get('name') || '').trim().toLowerCase();
                if (current === safeName) return characters[i];
            }
            return null;
        },

        cleanupBatchAbilities(maxKeep, maxAgeMs) {
            const helper = this.getCharacterByName('Combat Assistant Helper');
            if (!helper) return;
            const helperId = String(helper.id || '').trim();
            if (!helperId) return;
            const keep = Math.max(1, Utils.toInt(maxKeep, 20));
            const ageLimit = Math.max(60000, Utils.toInt(maxAgeMs, 10 * 60 * 1000));
            const now = Date.now();
            const abilities = (findObjs({ _type: 'ability', _characterid: helperId }) || [])
                .filter((ability) => ability && Utils.isFunction(ability.get) && Utils.isFunction(ability.remove) && /^CT_Batch_/i.test(String(ability.get('name') || '')))
                .map((ability) => {
                    const name = String(ability.get('name') || '');
                    const stamp = name.match(/_([0-9a-z]+)$/i);
                    const createdAt = stamp ? parseInt(stamp[1], 36) : 0;
                    return { ability, name, createdAt: Number.isFinite(createdAt) ? createdAt : 0 };
                })
                .sort((a, b) => b.createdAt - a.createdAt);
            abilities.forEach((entry, index) => {
                if (index >= keep || !entry.createdAt || now - entry.createdAt > ageLimit) {
                    try {
                        entry.ability.remove();
                    } catch (error) {
                        Logger.debug('[batch-cleanup]', error && error.message ? error.message : String(error));
                    }
                }
            });
        },

        getOrCreateBatchHelper() {
            const existing = this.getCharacterByName('Combat Assistant Helper');
            if (existing) {
                try {
                    if (Utils.isFunction(existing.set)) {
                        existing.set({
                            archived: false,
                            inplayerjournals: 'all',
                            controlledby: 'all'
                        });
                    }
                } catch (error) {
                    Logger.debug('[batch-helper-access]', error && error.message ? error.message : String(error));
                }
                return existing;
            }
            if (typeof createObj !== 'function') return null;
            try {
                return createObj('character', {
                    name: 'Combat Assistant Helper',
                    archived: false,
                    inplayerjournals: 'all',
                    controlledby: 'all'
                });
            } catch (error) {
                Logger.error('[batch-helper]', error && error.message ? error.message : String(error));
                return null;
            }
        },

        createNativeRollBatchAbility(commands) {
            const safeCommands = Array.isArray(commands)
                ? commands.map((command) => String(command || '').trim()).filter(Boolean)
                : [];
            if (!safeCommands.length) return { ok: false, message: 'No Roll20 commands were available for the batch.' };
            const helper = this.getOrCreateBatchHelper();
            if (!helper) return { ok: false, message: 'Combat Assistant Helper character could not be created.' };
            const helperId = String(helper.id || '').trim();
            if (!helperId || typeof createObj !== 'function') return { ok: false, message: 'Combat Assistant Helper is not usable.' };
            this.cleanupBatchAbilities(20, 10 * 60 * 1000);
            const abilityName = 'CT_Batch_' + Date.now().toString(36);
            try {
                createObj('ability', {
                    _characterid: helperId,
                    name: abilityName,
                    action: safeCommands.join('\n'),
                    istokenaction: false
                });
                return {
                    ok: true,
                    command: this.buttonAbilityCommand(helperId, abilityName),
                    abilityName,
                    count: safeCommands.length
                };
            } catch (error) {
                Logger.error('[batch-ability]', error && error.message ? error.message : String(error));
                return { ok: false, message: 'Roll20 batch ability could not be created.' };
            }
        },

        createNativeRollButtonCommand(command) {
            const batch = this.createNativeRollBatchAbility([command]);
            return batch && batch.ok ? batch.command : '';
        },

        sendNativeCommandsSequentially(commands, delayMs) {
            const safeCommands = Array.isArray(commands)
                ? commands.map((command) => String(command || '').trim()).filter(Boolean)
                : [];
            const delay = Math.max(100, Utils.toInt(delayMs, 700));
            safeCommands.forEach((command, index) => {
                setTimeout(() => {
                    try {
                        sendChat(CONFIG.CHAT_NAME, command);
                    } catch (error) {
                        Logger.error('[native-roll:auto]', error && error.message ? error.message : String(error));
                    }
                }, index * delay);
            });
            return safeCommands.length;
        },

        getTokensByCharacterName(characterName) {
            const character = this.getCharacterByName(characterName);
            if (!character) return [];
            const characterId = String(character.id || '').trim();
            return this.getTokensByCharacterId(characterId);
        },

        getTokensByCharacterId(characterId) {
            const safeCharacterId = String(characterId || '').trim();
            if (!safeCharacterId) return [];
            return (findObjs({ _type: 'graphic' }) || []).filter((token) => {
                return token && Utils.isFunction(token.get) && String(token.get('represents') || '').trim() === safeCharacterId;
            });
        },

        getTokenPageId(tokenOrId) {
            const token = typeof tokenOrId === 'string' ? this.getTokenById(tokenOrId) : tokenOrId;
            return token && Utils.isFunction(token.get) ? String(token.get('_pageid') || token.get('pageid') || '').trim() : '';
        },

        findTokenByCharacterIdOnPage(characterId, pageId) {
            const safePageId = String(pageId || '').trim();
            if (!safePageId) return null;
            const tokens = this.getTokensByCharacterId(characterId);
            for (let i = 0; i < tokens.length; i += 1) {
                if (this.getTokenPageId(tokens[i]) === safePageId) return tokens[i];
            }
            return null;
        },

        getPlayerPageId(playerId) {
            const safePlayerId = String(playerId || '').trim();
            if (typeof Campaign !== 'function') return '';
            try {
                const campaign = Campaign();
                const specificRaw = campaign && Utils.isFunction(campaign.get) ? campaign.get('playerspecificpages') : '';
                const specific = specificRaw ? JSON.parse(specificRaw) : {};
                if (safePlayerId && specific && specific[safePlayerId]) return String(specific[safePlayerId] || '').trim();
                const player = safePlayerId ? getObj('player', safePlayerId) : null;
                const lastPage = player && Utils.isFunction(player.get) ? String(player.get('_lastpage') || '').trim() : '';
                if (lastPage) return lastPage;
                return String(campaign.get('playerpageid') || '').trim();
            } catch (error) {
                return '';
            }
        },

        getTokenId(token) {
            return token && Utils.isFunction(token.get) ? String(token.get('_id') || token.id || '').trim() : '';
        },

        tokenIsControlledByPlayer(token, character, playerId) {
            const safePlayerId = String(playerId || '').trim();
            if (!safePlayerId) return false;
            return this.hasPlayerAccess(token && Utils.isFunction(token.get) ? token.get('controlledby') : '', safePlayerId) ||
                this.hasPlayerAccess(character && Utils.isFunction(character.get) ? character.get('controlledby') : '', safePlayerId);
        },

        resolveRollSourceToken(result, playerId) {
            const safePlayerId = String(playerId || '').trim();
            const explicitTokenId = String(result && (result.sourceTokenId || result.casterTokenId || result.tokenId) || '').trim();
            const explicit = explicitTokenId ? this.getTokenById(explicitTokenId) : null;
            if (explicit) return explicit;

            const character = this.getCharacterByName(result && (result.characterName || result.tokenName) || '');
            const characterId = character ? String(character.id || '').trim() : '';
            if (!characterId) return null;
            const playerPageId = this.getPlayerPageId(safePlayerId);
            const pageToken = this.findTokenByCharacterIdOnPage(characterId, playerPageId);
            if (pageToken) return pageToken;

            const tokens = this.getTokensByCharacterId(characterId);
            for (let i = 0; i < tokens.length; i += 1) {
                if (this.tokenIsControlledByPlayer(tokens[i], character, safePlayerId)) return tokens[i];
            }
            return tokens[0] || null;
        },

        getTokenImageByCharacterName(characterName) {
            const tokens = this.getTokensByCharacterName(characterName);
            for (let i = 0; i < tokens.length; i += 1) {
                const imgsrc = String(tokens[i].get('imgsrc') || '').trim();
                if (imgsrc) return imgsrc;
            }
            const character = this.getCharacterByName(characterName);
            const avatar = character ? String(character.get('avatar') || '').trim() : '';
            return avatar;
        },

        getCharacterControllerDisplayNames(character) {
            const ids = [];
            const addIds = (raw) => {
                String(raw || '').split(',').forEach((id) => {
                    const safeId = String(id || '').trim();
                    if (safeId) ids.push(safeId);
                });
            };
            if (character && Utils.isFunction(character.get)) addIds(character.get('controlledby'));
            if (ids.indexOf('all') >= 0) {
                const players = findObjs({ _type: 'player' }) || [];
                return Utils.uniqueNames(players.map((player) => {
                    if (!player || !Utils.isFunction(player.get)) return '';
                    return String(player.get('_displayname') || player.get('displayname') || '').trim();
                }).filter(Boolean));
            }
            const names = Utils.uniqueNames(ids.map((id) => {
                const player = getObj('player', id);
                if (!player) return '';
                return String(player.get('_displayname') || player.get('displayname') || '').trim();
            }).filter(Boolean));
            return names;
        },

        getTokenControllerDisplayNames(token, character) {
            const ids = [];
            const addIds = (raw) => {
                String(raw || '').split(',').forEach((id) => {
                    const safeId = String(id || '').trim();
                    if (safeId) ids.push(safeId);
                });
            };
            if (token && Utils.isFunction(token.get)) addIds(token.get('controlledby'));
            if (character && Utils.isFunction(character.get)) addIds(character.get('controlledby'));
            if (ids.indexOf('all') >= 0) {
                const players = findObjs({ _type: 'player' }) || [];
                return Utils.uniqueNames(players.map((player) => {
                    if (!player || !Utils.isFunction(player.get)) return '';
                    return String(player.get('_displayname') || player.get('displayname') || '').trim();
                }).filter(Boolean));
            }
            return Utils.uniqueNames(ids.map((id) => {
                const player = getObj('player', id);
                if (!player) return '';
                return String(player.get('_displayname') || player.get('displayname') || '').trim();
            }).filter(Boolean));
        },

        isPlayerControlledToken(token, character) {
            const tokenControlledBy = token && Utils.isFunction(token.get) ? String(token.get('controlledby') || '').trim() : '';
            return !!tokenControlledBy || this.isPlayerControlledCharacter(character);
        },

        isPlayerControlledCharacter(character) {
            if (!character || !Utils.isFunction(character.get)) return false;
            return String(character.get('controlledby') || '').trim() !== '';
        },

        parsePlayerAccessList(value) {
            return String(value || '').split(',').map((entry) => String(entry || '').trim()).filter(Boolean);
        },

        hasPlayerAccess(value, playerId) {
            const safePlayerId = String(playerId || '').trim();
            const entries = this.parsePlayerAccessList(value);
            if (entries.indexOf('all') >= 0) return true;
            if (!safePlayerId) return false;
            return entries.indexOf(safePlayerId) >= 0;
        },

        getCharacterAccessFlags(character, playerId, isGM) {
            if (isGM) return { journalAccess: true, controlAccess: true, hasAccess: true, isGM: true };
            if (!character) return { journalAccess: false, controlAccess: false, hasAccess: false, isGM: false };
            const journalAccess = this.hasPlayerAccess(character.get('inplayerjournals'), playerId);
            const controlAccess = this.hasPlayerAccess(character.get('controlledby'), playerId);
            return { journalAccess, controlAccess, hasAccess: journalAccess && controlAccess, isGM: false };
        },

        getCharacterStoreDumpRoots(characterId) {
            const safeCharacterId = String(characterId || '').trim();
            if (!safeCharacterId) return [];
            const attrs = findObjs({ _type: 'attribute', _characterid: safeCharacterId }) || [];
            const storeAttr = attrs.find((attr) => attr && Utils.isFunction(attr.get) && String(attr.get('name') || '').trim().toLowerCase() === 'store');
            if (!storeAttr) return [];
            const current = storeAttr.get('current');
            if (current && typeof current === 'object') return [current];
            const raw = String(current || '').trim();
            if (!raw) return [];
            try {
                const parsed = JSON.parse(raw);
                return parsed && typeof parsed === 'object' ? [parsed] : [];
            } catch (error) {
                Logger.debug('[store dump]', error && error.message ? error.message : String(error));
                return [];
            }
        },

        detectSheetVersion(characterId) {
            const safeCharacterId = String(characterId || '').trim();
            if (!safeCharacterId) return 'unknown';
            const storeRoots = this.getCharacterStoreDumpRoots(safeCharacterId);
            if (storeRoots.some((root) => root && typeof root === 'object' && (root.integrants || root.settings || root.hitpoints))) return '2024';

            const attrs = findObjs({ _type: 'attribute', _characterid: safeCharacterId }) || [];
            const names = {};
            attrs.forEach((attr) => {
                if (!attr || !Utils.isFunction(attr.get)) return;
                const name = String(attr.get('name') || '').trim().toLowerCase();
                if (name) names[name] = true;
            });
            const classicSignals = ['rtype', 'wtype', 'npc', 'spellcasting_ability', 'strength_save_roll', 'dexterity_save_roll', 'constitution_save_roll'];
            if (classicSignals.some((name) => names[name])) return '2014';
            return storeRoots.length ? '2024' : '2014';
        }
    };

    /** -----------------------------------------------------------------------
     * Render
     * --------------------------------------------------------------------- */
    const Render = {
        getMessageCardStyle(type) {
            const bgColorByType = {
                normal: { titleColor: 'rgb(200, 200, 200)', borderColor: CONFIG.DEFAULT_CARD_BORDER_COLOR },
                warning: { titleColor: 'rgb(230, 195, 60)', borderColor: 'rgb(127, 127, 0)' },
                failure: { titleColor: 'rgb(225, 60, 60)', borderColor: 'rgb(127, 0, 0)' },
                success: { titleColor: 'rgb(80, 220, 120)', borderColor: 'rgb(0, 127, 0)' }
            };
            return bgColorByType[String(type || 'normal').toLowerCase()] || bgColorByType.normal;
        },

        sendWhisperMessage(target, title, body, type) {
            const cardStyle = this.getMessageCardStyle(type || 'normal');
            R20.whisper(target || 'GM', Html.card({
                title: title || META.NAME,
                body: '<div style="font-size:14px;margin:0;line-height:17px;">' + String(body || '') + '</div>',
                buildOptions: { titleColor: cardStyle.titleColor, borderColor: cardStyle.borderColor }
            }));
        },

        sendPublicMessage(title, body, type, buildOptions) {
            const cardStyle = this.getMessageCardStyle(type || 'normal');
            const options = Object.assign({ titleColor: cardStyle.titleColor, borderColor: cardStyle.borderColor }, buildOptions || {});
            R20.send(Html.card({
                title: title || META.NAME,
                body: '<div style="font-size:14px;margin:0;line-height:17px;">' + String(body || '') + '</div>',
                buildOptions: options
            }));
        },

        sendDamageResult(result, type) {
            this.sendPublicMessage(
                'Combat Log',
                this.buildDamageNarrative(result),
                type || (result && result.missed ? 'warning' : (result && result.noDamage ? 'warning' : 'normal')),
                { titleHtml: this.combatLogTitleHtml(result || {}, 'Combat Log') }
            );
        },

        sendHealResult(result, requestedBy) {
            result = result || {};
            const narrative = this.buildHealNarrative(result);
            const sourceName = String(result.sourceName || '').trim();
            const sourceAction = String(result.sourceAction || '').trim();
            const isManual = /^manual$/i.test(sourceName) || /^manual(?:\s+healing)?$/i.test(sourceAction);
            const title = result.mode === 'temp' ? 'Temporary HP' : 'Healing';
            if (isManual) {
                const cardStyle = this.getMessageCardStyle('success');
                R20.whisper(requestedBy || 'GM', Html.card({
                    title: 'Combat Log',
                    body: '<div style="font-size:14px;margin:0;line-height:17px;">' + narrative + '</div>',
                    buildOptions: {
                        titleColor: cardStyle.titleColor,
                        borderColor: cardStyle.borderColor,
                        titleHtml: this.combatLogTitleHtml(result, title)
                    }
                }));
                return;
            }
            this.sendPublicMessage('Combat Log', narrative, 'success', { titleHtml: this.combatLogTitleHtml(result, title) });
        },

        getDamageTypeIcon(type) {
            const key = CombatService.normalizeDamageType(type);
            return CONFIG.DAMAGE_TYPE_ICONS[key] || CONFIG.DAMAGE_TYPE_ICONS.normal;
        },

        getDamageTypeColor(type) {
            const key = CombatService.normalizeDamageType(type);
            return CONFIG.DAMAGE_TYPE_COLORS[key] || CONFIG.DEFAULT_DAMAGE_TYPE_COLOR;
        },

        queryOptionsWithDefault(label, defaultValue, options) {
            const safeLabel = Utils.attrSafe(label || 'Value');
            const normalizedDefault = String(defaultValue || '').trim().toLowerCase();
            const safeOptions = (Array.isArray(options) ? options : [])
                .map((entry) => {
                    if (Array.isArray(entry)) return { label: String(entry[0] || ''), value: String(entry[1] || entry[0] || '') };
                    return { label: String(entry || ''), value: String(entry || '') };
                })
                .filter((entry) => entry.value);
            const ordered = [];
            const seen = {};
            const addOption = (entry) => {
                const value = String(entry && entry.value || '').trim();
                if (!value) return;
                const key = value.toLowerCase();
                if (seen[key]) return;
                seen[key] = true;
                ordered.push(String(entry.label || value) + ',' + value);
            };
            const defaultEntry = safeOptions.find((entry) => String(entry.value || '').trim().toLowerCase() === normalizedDefault);
            if (defaultEntry) addOption(defaultEntry);
            safeOptions.forEach(addOption);
            return '&#63;{' + safeLabel + '|' + ordered.map(Utils.attrSafe).join('|') + '}';
        },

        damageTypeQuery(defaultType) {
            return this.queryOptionsWithDefault('Damage Type', CombatService.normalizeDamageType(defaultType || 'normal'), [
                ['Normal', 'normal'],
                ['Acid', 'acid'],
                ['Bludgeoning', 'bludgeoning'],
                ['Cold', 'cold'],
                ['Fire', 'fire'],
                ['Force', 'force'],
                ['Lightning', 'lightning'],
                ['Necrotic', 'necrotic'],
                ['Piercing', 'piercing'],
                ['Poison', 'poison'],
                ['Psychic', 'psychic'],
                ['Radiant', 'radiant'],
                ['Slashing', 'slashing'],
                ['Thunder', 'thunder']
            ]);
        },

        saveAbilityQuery(defaultAbility) {
            const normalized = CombatService.normalizeAbilityName(defaultAbility || '');
            return this.queryOptionsWithDefault('Save', normalized || 'no', [
                ['No', 'no'],
                ['Strength', 'strength'],
                ['Dexterity', 'dexterity'],
                ['Constitution', 'constitution'],
                ['Intelligence', 'intelligence'],
                ['Wisdom', 'wisdom'],
                ['Charisma', 'charisma']
            ]);
        },

        sanitizeCommand(command) {
            return String(command || '#').replace(/"/g, '&quot;').replace(/[\r\n]+/g, ' ');
        },

        iconButtonHtml(buildOptions) {
            const options = buildOptions || {};
            const iconHtml = String(options.iconHtml || options.icon || '&#9679;');
            const label = String(options.label || options.text || 'BTN');
            const command = this.sanitizeCommand(options.command || options.callback || '#');
            const width = Math.max(1, Utils.toInt(options.width, 40));
            const height = Math.max(1, Utils.toInt(options.height, 40));
            const iconSize = Math.max(1, Utils.toInt(options.iconSize, 18));
            const labelSize = Math.max(1, Utils.toInt(options.labelSize, 12));
            const labelHeight = Math.max(1, Utils.toInt(options.labelHeight, 13));
            const labelLineHeight = Math.max(1, Utils.toInt(options.labelLineHeight, 12));
            const backgroundColor = String(options.backgroundColor || 'rgba(55,55,55,0.95)');
            const borderColor = String(options.borderColor || 'rgba(255,255,255,0.75)');
            const textColor = String(options.textColor || 'rgb(255,255,255)');
            const margin = String(options.margin || '0 1px');
            const paddingTop = Math.max(0, Utils.toInt(options.paddingTop, 5));
            const labelPaddingTop = Math.max(0, Utils.toInt(options.labelPaddingTop, 0));
            const safeTooltip = String(options.tooltip || '').trim();
            const titleAttr = safeTooltip ? (' title="' + Utils.attrSafe(safeTooltip) + '"') : '';
            return (
                '<a href="' + command + '"' + titleAttr + ' style="' +
                    'display:inline-block;width:' + width + 'px;height:' + height + 'px;min-width:' + width + 'px;' +
                    'box-sizing:border-box;text-align:center;text-decoration:none;border:1px solid ' + borderColor + ';border-radius:' + String(options.borderRadius || '4px') + ';' +
                    'background:' + backgroundColor + ';color:' + textColor + ';font-family:Arial,Helvetica,sans-serif;overflow:hidden;vertical-align:middle;margin:' + margin + ';padding:' + paddingTop + 'px 0 0 0;' +
                '">' +
                    '<strong><span style="display:block;height:20px;line-height:19px;font-size:' + iconSize + 'px;text-align:center;">' + iconHtml + '</span></strong>' +
                    '<strong><span style="display:block;height:' + labelHeight + 'px;line-height:' + labelLineHeight + 'px;padding:' + labelPaddingTop + 'px;font-size:' + labelSize + 'px;text-align:center;white-space:normal;">' + Utils.escapeHtml(label) + '</span></strong>' +
                '</a>'
            );
        },

        iconButtonTableHtml(buttons, options) {
            options = options || {};
            const safeButtons = Array.isArray(buttons) ? buttons.filter(Boolean) : [];
            const columns = Math.max(1, Utils.toInt(options.columns || safeButtons.length || 1, 1));
            const footer = String(options.footer || '').trim();
            const colWidth = 100 / columns;
            const rows = [];
            for (let i = 0; i < safeButtons.length; i += columns) {
                const cells = [];
                for (let c = 0; c < columns; c += 1) {
                    const button = safeButtons[i + c];
                    cells.push('<td style="width:' + colWidth + '%;text-align:center;vertical-align:middle;padding:2px 4px;">' + (button || '') + '</td>');
                }
                rows.push('<tr>' + cells.join('') + '</tr>');
            }
            return (
                '<table style="width:100%;border-collapse:collapse;table-layout:fixed;"><tbody>' + rows.join('') + '</tbody></table>' +
                (footer ? '<div style="padding-top:5px;color:rgb(170,170,170);font-size:10px;line-height:12px;text-align:center;">' + Utils.escapeHtml(footer) + '</div>' : '')
            );
        },

        rollBadgeHtml(roll, marker, options) {
            options = options || {};
            roll = roll || {};
            const natural = Utils.toInt(roll.natural, 0);
            const total = Utils.toInt(roll.total, natural);
            const displayMarker = natural === 1 ? '&#128165;' : marker;
            const isCritical = !!roll.critical || displayMarker === '&#9733;';
            const isNaturalOne = natural === 1;
            const isDimmed = !!roll.dimmed && !isCritical && !isNaturalOne;
            const hasSuccessState = roll.success === true || roll.success === false;
            const bgColor = isCritical
                ? 'rgba(70,150,90,0.30)'
                : (isNaturalOne ? 'rgba(165,45,45,0.30)' : (isDimmed ? 'rgba(55,55,55,0.30)' : (hasSuccessState ? (roll.success ? 'rgba(70,150,90,0.30)' : 'rgba(165,45,45,0.30)') : (options.bgColor || 'rgba(55,55,55,0.95)'))));
            const borderColor = options.borderColor || (isCritical ? 'rgb(60,255,110)' : (isNaturalOne ? 'rgb(255,60,60)' : (isDimmed ? 'rgba(255,255,255,0.35)' : (hasSuccessState ? (roll.success ? 'rgba(100,230,130,0.85)' : 'rgba(230,80,80,0.85)') : 'rgba(255,255,255,0.75)'))));
            const rollStyle = CONFIG.ROLL_CARD_STYLE || {};
            const size = Math.max(18, Utils.toInt(options.size, 40));
            const fontSize = String(options.fontSize || rollStyle.fontSize || '20px');
            const modifier = Utils.toInt(roll.modifier, 0);
            const tooltip = roll.tooltip || ('Roll [1d20] = [ ' + String(natural) + ' ]');
            const markerColor = displayMarker === '&#9650;' || displayMarker === '&#9733;' ? 'rgb(90,220,120)' : 'rgb(230,80,80)';
            const markerTop = displayMarker === '&#9733;' || displayMarker === '&#128165;' ? '0px' : '-3px';
            const markerSize = displayMarker === '&#9733;' ? '12px' : (displayMarker === '&#128165;' ? '11px' : '10px');
            const textColor = isDimmed ? 'rgb(145,145,145)' : (rollStyle.color || 'rgb(255,255,255)');
            return Html.div(
                Html.tooltip(
                    Html.div(
                        Utils.escapeHtml(String(total)) +
                        (displayMarker ? Html.span(displayMarker, 'position:absolute;top:' + markerTop + ';right:2px;font-size:' + markerSize + ';line-height:10px;color:' + markerColor + ';font-weight:900;') : ''),
                        'position:relative;width:' + size + 'px;height:' + size + 'px;line-height:' + size + 'px;text-align:center;border:1px solid ' + borderColor + ';border-radius:4px;background:' + bgColor + ';font-family:' + (rollStyle.fontFamily || 'Arial, Helvetica, sans-serif') + ';font-size:' + fontSize + ';font-weight:' + (rollStyle.fontWeight || '900') + ';color:' + textColor + ';'
                    ),
                    tooltip
                ),
                'display:inline-block;width:' + (size + 2) + 'px;text-align:center;vertical-align:middle;'
            );
        },

        savingThrowBadgesHtml(roll, ability) {
            roll = roll || {};
            const modifier = Utils.toInt(roll.modifier, 0);
            const mode = String(roll.mode || 'normal').toLowerCase();
            const rolls = (Array.isArray(roll.rolls) && roll.rolls.length ? roll.rolls : [roll.natural])
                .map((value) => Utils.toInt(value, 0));
            const chosen = mode === 'advantage'
                ? Math.max.apply(null, rolls)
                : (mode === 'disadvantage' ? Math.min.apply(null, rolls) : Utils.toInt(roll.natural, 0));
            let chosenUsed = false;
            const badges = rolls.map((natural) => {
                const isChosen = !chosenUsed && natural === chosen;
                if (isChosen) chosenUsed = true;
                const total = natural + modifier;
                const marker = isChosen && mode === 'advantage' ? '&#9650;' : (isChosen && mode === 'disadvantage' ? '&#9660;' : '');
                return this.rollBadgeHtml({
                    natural,
                    total,
                    modifier,
                    success: !!roll.success,
                    dimmed: rolls.length > 1 && !isChosen,
                    tooltip: ability + ' Save<br>Roll: ' + String(natural) + '<br>Modifier: ' + Utils.formatSigned(modifier) + '<br>Total: ' + String(total) + '<br>DC: ' + String(roll.dc) + (mode !== 'normal' ? ('<br>Mode: ' + mode) : '')
                }, marker, { size: 34, fontSize: '18px' });
            }).reverse().join('');
            return '<div style="display:inline-block;text-align:right;white-space:nowrap;">' + badges + '</div>';
        },

        attackPromptTitleHtml(result) {
            result = result || {};
            const imgsrc = String(result.tokenImgsrc || '').trim();
            const imgHtml = imgsrc
                ? Html.img(imgsrc, 'width:24px;height:24px;object-fit:cover;border-radius:3px;vertical-align:middle;display:block;')
                : '<span style="display:block;width:24px;height:24px;"></span>';
            const damageType = String(result.damageType || '').trim();
            const damageIcon = this.getDamageTypeIcon(damageType) || '&#9679;';
            const isSaveAttack = Utils.toBoolean(result.isSaveAttack, false) || !!result.saveAbility;
            const saveAbilityLabel = CombatService.abilityNameToShortLabel(result.saveAbility || '') || String(result.saveAbilityLabel || 'SAVE').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'SAV';
            const summaryWidth = 44;
            const summaryValueWidth = 26;
            const challengeValue = isSaveAttack ? (result.saveDc || result.attackTotal || 0) : (result.attackTotal || result.saveDc || 0);
            const summaryHtml =
                '<div style="font-size:11px;line-height:12px;white-space:nowrap;width:' + summaryWidth + 'px;">' +
                    '<span style="display:inline-block;width:16px;text-align:right;color:rgb(230,80,80);font-weight:900;">' + (isSaveAttack ? '&#127922;' : '&#128165;') + '</span>' +
                    '<strong title="' + Utils.attrSafe(isSaveAttack ? (saveAbilityLabel + ' Saving Throw DC ' + String(challengeValue)) : 'Attack Roll') + '" style="display:inline-block;width:' + summaryValueWidth + 'px;text-align:right;color:rgb(255,255,255);font-weight:900;">' + Utils.escapeHtml(String(challengeValue)) + '</strong>' +
                '</div>' +
                '<div style="font-size:11px;line-height:12px;white-space:nowrap;width:' + summaryWidth + 'px;">' +
                    '<span style="display:inline-block;width:16px;text-align:left;">' + damageIcon + '</span>' +
                    '<strong style="display:inline-block;width:' + summaryValueWidth + 'px;text-align:right;color:' + this.getDamageTypeColor(damageType) + ';font-weight:900;">' + Utils.escapeHtml(String(result.damageTotal || result.healTotal || 0)) + '</strong>' +
                '</div>';
            return (
                '<table style="width:100%;border-collapse:collapse;table-layout:fixed;">' +
                    '<tbody><tr>' +
                        '<td style="width:28px;text-align:left;vertical-align:middle;padding:0;">' + imgHtml + '</td>' +
                        '<td style="text-align:center;vertical-align:middle;font-size:17px;line-height:19px;font-weight:900;white-space:normal;">' + Utils.escapeHtml(String(result.attackName || 'Attack')) + '</td>' +
                        '<td style="width:48px;text-align:right;vertical-align:middle;padding:0;">' + summaryHtml + '</td>' +
                    '</tr></tbody>' +
                '</table>'
            );
        },

        showAttackDamagePrompt(result) {
            result = result || {};
            if (result.effectType === 'healing' || result.isHealing) {
                const healAmount = Math.max(0, Utils.toInt(result.healTotal || result.damageTotal, 0));
                const isTempHealing = Utils.toBoolean(result.isTempHealing, false) || String(result.healMode || '').toLowerCase() === 'temp';
                const payload = Utils.encodeJsonPayload({
                    type: 'heal',
                    mode: isTempHealing ? 'temp' : 'hp',
                    amount: healAmount,
                    sourceName: String(result.tokenName || result.characterName || 'Caster'),
                    sourceAction: String(result.attackName || 'Healing'),
                    sourceImgsrc: String(result.tokenImgsrc || '')
                });
                const healButton = this.iconButtonHtml({
                    iconHtml: isTempHealing ? '&#128151;' : '&#128154;',
                    label: isTempHealing ? 'Temp' : 'Heal',
                    command: '!combatAssistant heal ' + payload,
                    backgroundColor: 'rgba(20,115,55,0.95)',
                    tooltip: isTempHealing ? 'Apply temporary HP to selected token bar(s)' : 'Apply healing to selected token bar(s)'
                });
                const editButton = this.iconButtonHtml({
                    iconHtml: '&#9997;&#127995;',
                    label: 'Edit',
                    command: '!combatAssistant heal manual &#63;{Heal Type|HP,hp|Temp,temp} &#63;{Healing|' + String(healAmount) + '}',
                    backgroundColor: 'rgba(55,55,55,0.95)',
                    tooltip: 'Edit healing amount'
                });
                const body = this.iconButtonTableHtml([healButton, editButton], { columns: 2, footer: 'Select target token(s) before pressing any button.' });
                return Html.card({
                    title: META.NAME,
                    body,
                    buildOptions: { titleHtml: this.attackPromptTitleHtml(Object.assign({}, result, { damageTotal: healAmount, damageType: isTempHealing ? 'temp healing' : 'healing', attackTotal: 0 })) }
                });
            }

            const damageRolls = Array.isArray(result.damageRolls) && result.damageRolls.length
                ? result.damageRolls
                : [{ total: result.damageTotal, damageType: result.damageType || 'normal', formula: result.damageFormula || 'Roll20' }];
            const primaryDamage = damageRolls[0] || {};
            const challenge = Math.max(0, Utils.toInt(result.saveDc || result.attackTotal, 0));
            const saveAbility = CombatService.normalizeAbilityName(result.saveAbility || '');
            const attackPayload = Utils.encodeJsonPayload({
                type: 'damage',
                mode: result.isSaveAttack || saveAbility ? 'save' : 'attack',
                challenge,
                saveAbility,
                halfOnSuccess: !!result.halfOnSuccess,
                halfOnSuccessKnown: !!result.halfOnSuccessKnown,
                damageRolls,
                sourceName: String(result.tokenName || result.characterName || ''),
                sourceAction: String(result.attackName || ''),
                sourceImgsrc: String(result.tokenImgsrc || '')
            });
            const hitPayload = Utils.encodeJsonPayload({
                type: 'damage',
                mode: 'direct',
                challenge: 0,
                saveAbility: '',
                damageRolls,
                sourceName: String(result.tokenName || result.characterName || ''),
                sourceAction: String(result.attackName || ''),
                sourceImgsrc: String(result.tokenImgsrc || '')
            });
            const missPayload = Utils.encodeJsonPayload({
                type: 'damage',
                mode: 'miss',
                forceMiss: true,
                damageRolls: [{ total: 0, damageType: 'normal' }],
                sourceName: String(result.tokenName || result.characterName || ''),
                sourceAction: String(result.attackName || ''),
                sourceImgsrc: String(result.tokenImgsrc || '')
            });
            const attackButton = this.iconButtonHtml({
                iconHtml: result.isSaveAttack || saveAbility ? '&#127922;' : '&#9876;&#65039;',
                label: result.isSaveAttack || saveAbility ? (CombatService.abilityNameToShortLabel(saveAbility) || 'SAVE') : 'Atk',
                command: '!combatAssistant deal ' + attackPayload + ((result.isSaveAttack || saveAbility) && RuntimeConfig.get('SHEET_2014_CA_ROLLS')
                    ? ' &#63;{2014 Roll Mode|Normal,normal|Advantage,advantage|Disadvantage,disadvantage}'
                    : ''),
                backgroundColor: 'rgba(45,45,45,0.95)',
                tooltip: result.isSaveAttack || saveAbility ? 'Roll selected target save and apply damage' : 'Apply damage only if attack hits selected target AC'
            });
            const hitButton = this.iconButtonHtml({
                iconHtml: '&#128165;',
                label: 'Hit',
                command: '!combatAssistant deal ' + hitPayload,
                backgroundColor: 'rgba(120,40,40,0.95)',
                tooltip: 'Apply damage directly to selected token(s)'
            });
            const missButton = this.iconButtonHtml({
                iconHtml: '&#128683;',
                label: 'Miss',
                command: '!combatAssistant deal ' + missPayload,
                backgroundColor: 'rgba(80,135,85,0.65)',
                tooltip: 'No damage'
            });
            const editButton = this.iconButtonHtml({
                iconHtml: '&#9997;&#127995;',
                label: 'Edit',
                command: '!combatAssistant deal manual &#63;{Damage|' + String(Math.max(0, Utils.toInt(result.damageTotal || primaryDamage.total, 0))) + '} ' +
                    this.damageTypeQuery(primaryDamage.damageType || result.damageType || 'normal') + ' ' +
                    '&#63;{Challenge|' + String(challenge || 0) + '} ' +
                    this.saveAbilityQuery(saveAbility || 'no') + ' ' +
                    this.queryOptionsWithDefault('Half on Success', result.halfOnSuccess ? 'yes' : 'no', [['No', 'no'], ['Yes', 'yes']]),
                backgroundColor: 'rgba(45,45,45,0.95)',
                tooltip: 'Edit damage manually'
            });
            const body = this.iconButtonTableHtml([attackButton, hitButton, missButton, editButton], { columns: 4, footer: 'Select target token(s) before pressing any button.' });
            return Html.card({
                title: META.NAME,
                body,
                buildOptions: { titleHtml: this.attackPromptTitleHtml(result) }
            });
        },

        showConfigMenu(target) {
            const settings = RuntimeConfig.getAll();
            const fields = RuntimeConfig.fields();
            const buttonH = 8;
            const buttonW = 24;
            
            const baseButtonStyle =
                'display:inline-flex;' +
                'align-items:center;' +
                'justify-content:center;' +
                'width:' + buttonW + 'px;' +
                'height:' + buttonH + 'px;' +
                'line-height:1;' +
                'text-align:center;' +
                'text-decoration:none;' +
                'border:1px solid rgba(255,255,255,0.65);' +
                'border-radius:4px;' +
                'color:rgb(255,255,255);' +
                'font-size:10px;' +
                'font-weight:900;' +
                'box-sizing:border-box;';

            const rows = fields.map((field) => {
                const value = settings[field.key];
                let button = '';
                    if (field.type === 'boolean') {
                        button =
                            '<a href="!combatAssistant toggle ' + Utils.attrSafe(field.key) + '"' +
                            ' title="' + Utils.attrSafe('Toggle ' + field.label) + '"' +
                            ' style="' + baseButtonStyle + 'background:' + (value ? 'rgba(20,115,55,0.95)' : 'rgba(120,40,40,0.95)') + ';">' +
                                (value ? 'ON' : 'OFF') +
                            '</a>';
                    } else if (field.type === 'bar' || field.type === 'bar0') {
                        const opts = field.type === 'bar0' ? '0|1|2|3' : '1|2|3';
                        button =
                            '<a href="!combatAssistant set ' + Utils.attrSafe(field.key) + ' &#63;{' + Utils.attrSafe(field.label) + '|' + opts + '}"' +
                            ' title="' + Utils.attrSafe('Edit ' + field.label) + '"' +
                            ' style="' + baseButtonStyle + 'background:rgba(0,105,160,0.95);">' +
                                value +
                            '</a>';
                    } else {
                        button =
                            '<a href="!combatAssistant set ' + Utils.attrSafe(field.key) + ' &#63;{' + Utils.attrSafe(field.label) + '|' + Utils.attrSafe(String(value || '').replace(/\|/g, ' ')) + '}"' +
                            ' title="' + Utils.attrSafe('Edit ' + field.label) + '"' +
                            ' style="' + baseButtonStyle + 'background:rgba(0,105,160,0.95);">' +
                                'EDIT' +
                            '</a>';
                    }
                const displayValue = field.type === 'boolean'
                    ? (value ? 'ON' : 'OFF')
                    : String(value === undefined || value === null || value === '' ? '-' : value);
                return (
                    '<tr>' +
                        '<td title="' + Utils.attrSafe(field.tip || field.label) + '" style="text-align:left;vertical-align:middle;padding:2px 2px 2px 2px;color:rgb(225,225,225);font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + Utils.escapeHtml(field.label) + '</td>' +
                        '<td style="width:40px;text-align:right;vertical-align:middle;padding:2px 0;">' + button + '</td>' +
                    '</tr>'
                );
            }).join('');
            const body =
                '<table style="width:100%;border-collapse:collapse;table-layout:fixed;"><tbody>' + rows + '</tbody></table>';
            R20.whisper(target || 'GM', Html.card({ title: META.NAME + ' Settings', body }));
        },

        showMenu(target) {
            const damageTypes = '-,normal|Acid,acid|Bludgeoning,bludgeoning|Cold,cold|Fire,fire|Force,force|Lightning,lightning|Necrotic,necrotic|Piercing,piercing|Poison,poison|Psychic,psychic|Radiant,radiant|Slashing,slashing|Thunder,thunder';
            const abilities = 'No,no|Strength,strength|Dexterity,dexterity|Constitution,constitution|Intelligence,intelligence|Wisdom,wisdom|Charisma,charisma';
            const dmgButton = this.iconButtonHtml({
                iconHtml: '&#128165;',
                label: 'Dmg',
                command: '!combatAssistant deal manual &#63;{Damage|0} &#63;{Type|' + damageTypes + '} &#63;{Challenge|0} &#63;{Save|' + abilities + '} &#63;{Half on Success|no|yes}' +
                    (RuntimeConfig.get('SHEET_2014_CA_ROLLS') ? ' &#63;{2014 Roll Mode|Normal,normal|Advantage,advantage|Disadvantage,disadvantage}' : ''),
                backgroundColor: 'rgba(135,35,35,0.95)',
                tooltip: 'Deal damage to selected token(s)'
            });
            const healButton = this.iconButtonHtml({
                iconHtml: '&#128154;',
                label: 'Heal',
                command: '!combatAssistant heal manual &#63;{Heal Type|HP,hp|Temp,temp} &#63;{Healing|0}',
                backgroundColor: 'rgba(20,115,55,0.95)',
                tooltip: 'Heal selected token(s)'
            });
            const saveButton = this.iconButtonHtml({
                iconHtml: '&#128735;',
                label: 'Save',
                command: '!combatAssistant save &#63;{Ability|Strength,strength|Dexterity,dexterity|Constitution,constitution|Intelligence,intelligence|Wisdom,wisdom|Charisma,charisma}' +
                    (RuntimeConfig.get('SHEET_2014_CA_ROLLS') ? ' &#63;{2014 Roll Mode|Normal,normal|Advantage,advantage|Disadvantage,disadvantage}' : ''),
                backgroundColor: 'rgba(160,145,65,0.85)',
                tooltip: 'Roll a saving throw for selected token(s)'
            });
            const initButton = this.iconButtonHtml({
                iconHtml: '&#127922;',
                label: 'Init',
                command: '!combatAssistant init' +
                    (RuntimeConfig.get('SHEET_2014_CA_ROLLS') ? ' &#63;{2014 Roll Mode|Normal,normal|Advantage,advantage|Disadvantage,disadvantage}' : ''),
                backgroundColor: 'rgba(70,115,170,0.85)',
                tooltip: 'Roll initiative for selected token(s)'
            });
            const body = this.iconButtonTableHtml([dmgButton, healButton, saveButton, initButton], {
                columns: 4,
                footer: 'Select target token(s) before pressing a button.'
            });
            const titleHtml =
                '<table style="width:100%;border-collapse:collapse;table-layout:fixed;"><tbody><tr>' +
                    '<td style="width:34px;text-align:left;vertical-align:middle;white-space:nowrap;">' +
                        '<a href="!combatAssistant help" title="Open help" style="display:inline-block;background:transparent;border:0;color:rgb(230,230,230);text-decoration:none;font-size:15px;line-height:15px;padding:0;margin:0;">&#10067;</a>' +
                    '</td>' +
                    '<td style="text-align:center;vertical-align:middle;">' + Utils.escapeHtml(META.NAME) + '</td>' +
                    '<td style="width:34px;text-align:right;vertical-align:middle;white-space:nowrap;">' +
                        '<a href="!combatAssistant config" title="Open settings" style="display:inline-block;background:transparent;border:0;color:rgb(230,230,230);text-decoration:none;font-size:15px;line-height:15px;padding:0;margin:0;">&#9881;&#65039;</a>' +
                    '</td>' +
                '</tr></tbody></table>';
            R20.whisper(target || 'GM', Html.card({ title: META.NAME, body, buildOptions: { titleHtml } }));
        },

        showHelp(target) {
            const body =
                '<div style="text-align:left;font-size:12px;line-height:16px;color:rgb(225,225,225);">' +
                    '<b>Commands</b><br>' +
                    '<code>!combat-assistant help</code><br>' +
                    '<code>!combatAssistant menu</code><br>' +
                    '<code>!combatAssistant config</code><br>' +
                    '<code>!combatAssistant set hpbar 1</code><br>' +
                    '<code>!combatAssistant set acbar 2</code><br>' +
                    '<code>!combatAssistant set tempbar 3</code><br>' +
                    '<code>!combatAssistant deal manual 8 fire</code> with target token(s) selected<br>' +
                    '<code>!combatAssistant heal manual hp 10</code> with target token(s) selected<br><br>' +
                    '<code>!combatAssistant save dexterity</code> with token(s) selected<br>' +
                    '<code>!combatAssistant init</code> with token(s) selected<br><br>' +
                    '<b>Bar setup</b><br>' +
                    'HP Bar: ' + Utils.escapeHtml(String(RuntimeConfig.get('HP_BAR'))) + '<br>' +
                    'AC Bar: ' + Utils.escapeHtml(String(RuntimeConfig.get('AC_BAR'))) + '<br>' +
                    'Temp HP Bar: ' + Utils.escapeHtml(String(RuntimeConfig.get('TEMP_HP_BAR'))) + '<br><br>' +
                    '<b>Important</b><br>' +
                    'If the HP bar is linked, Combat Assistant updates character sheet HP through Beacon. If HP is not linked, only the token bar is changed.<br>' +
                    'Temp HP uses the linked/configured token bar and does not require sheet HP.<br><br>' +
                    '<div style="text-align:center;font-size:11px;line-height:14px;color:rgb(190,190,190);padding:4px 0 6px 0;">' +
                        'This is a lightweight version extracted from the original code. Try <a href="https://app.roll20.net/forum/post/12758022/t-and-t-chat-based-inventory-dynamic-shops-auto-healing-loot-and-item-automation-for-roll20-d-and-d-2024" target="_blank" style="color:rgb(0,180,180);text-decoration:none;font-weight:700;"><b>Trinkets and Trackers</b></a> for the full immersive experience.' +
                    '</div>' +
                    '<div style="display:table;width:100%;font-size:11px;line-height:13px;color:rgb(160,160,160);padding-top:4px;">' +
                        '<div style="display:table-cell;text-align:left;">Created by <a href="' + Utils.attrSafe(META.DEVELOPER_URL) + '" target="_blank" style="color:rgb(0,180,180);text-decoration:none;font-weight:700;"><b>' + Utils.escapeHtml(META.DEVELOPER) + '</b></a></div>' +
                        '<div style="display:table-cell;text-align:right;">Version <span style="color:rgb(255,220,0);font-weight:700;">' + Utils.escapeHtml(META.VERSION) + '</span></div>' +
                    '</div>' +
                '</div>';
            const configButton = this.iconButtonHtml({ iconHtml: '&#9881;&#65039;', label: 'Config', command: '!combatAssistant config', width: 52, tooltip: 'Open settings' });
            R20.whisper(target || 'GM', Html.card({ title: META.NAME, body: body + '<div style="text-align:center;padding-top:6px;">' + configButton + '</div>' }));
        },

        buildDamageNarrative(result) {
            result = result || {};
            const hideNames = RuntimeConfig.get('HIDE_TOKEN_NAMES_IN_LOG');
            const targetLabel = hideNames ? 'Target' : String(result.tokenName || 'Target');
            const targetName = Html.span(Utils.escapeHtml(targetLabel), 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:900;');
            const sourceName = String(result.sourceName || '').trim();
            const sourceAction = String(result.sourceAction || '').trim();
            const isManualSource = /^manual$/i.test(sourceName) || /^manual(?:\s+damage)?$/i.test(sourceAction);
            const revealSource = RuntimeConfig.get('REVEAL_DAMAGE_SOURCE') && !isManualSource;
            const sourceLabel = hideNames ? 'Attacker' : sourceName;
            const sourceNameHtml = sourceName ? Html.span(Utils.escapeHtml(sourceLabel), 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:900;') : '';
            const sourceActionHtml = sourceAction
                ? Html.span(Utils.escapeHtml(sourceAction), 'color:rgb(245,220,80);font-weight:900;')
                : '';
            const sourcePhrase = revealSource && sourceActionHtml
                ? (' from ' + (sourceNameHtml ? (sourceNameHtml + '&#39;s ') : '') + sourceActionHtml)
                : (revealSource && sourceNameHtml ? (' from ' + sourceNameHtml) : '');

            if (result.missed) {
                return revealSource && sourceActionHtml
                    ? (sourceNameHtml ? (sourceNameHtml + ' ') : '') + 'attacks ' + targetName + ' with ' + sourceActionHtml + ' but misses.'
                    : (revealSource && sourceNameHtml ? (sourceNameHtml + ' attacks ' + targetName + ' but misses.') : 'The attack against ' + targetName + ' misses.');
            }
            if (result.save && result.save.used) {
                const roll = result.save;
                const outcome = roll.success ? ' succeeds' : ' fails';
                const ability = CombatService.abilityNameToShortLabel(roll.ability) || 'SAVE';
                const badge = this.savingThrowBadgesHtml(roll, ability);
                const damageParts = this.buildDamagePartsHtml(result);
                const blockedByImmunity = damageParts && damageParts.indexOf('blocked by ') >= 0 && damageParts.indexOf(' immunity') >= 0;
                const joinedSourcePhrase = blockedByImmunity && sourcePhrase ? (',' + sourcePhrase) : sourcePhrase;
                const phrase = targetName + outcome + ' on the ' + ability + ' Save and takes ' + (damageParts || 'no damage') + joinedSourcePhrase + (result.fainted ? ' and falls unconscious' : '') + '.';
                const tempLine = result.tempAbsorbed > 0
                    ? '<div style="padding-top:2px;color:rgb(52,203,116);font-size:10px;line-height:12px;text-align:center;">(Some damage was absorbed by Temporary HP)</div>'
                    : '';
                return '<table style="width:100%;border-collapse:collapse;table-layout:fixed;"><tr><td style="text-align:center;vertical-align:middle;font-size:14px;line-height:16px;">' + phrase + '</td><td style="width:78px;text-align:right;vertical-align:top;white-space:nowrap;">' + badge + '</td></tr></table>' + tempLine;
            }
            if (result.noDamage) {
                const damageParts = this.buildDamagePartsHtml(result);
                const blockedByImmunity = damageParts && damageParts.indexOf('blocked by ') >= 0 && damageParts.indexOf(' immunity') >= 0;
                const joinedSourcePhrase = blockedByImmunity && sourcePhrase ? (',' + sourcePhrase) : sourcePhrase;
                return targetName + ' takes ' + (damageParts || 'no damage') + joinedSourcePhrase + '.';
            }

            const damageParts = this.buildDamagePartsHtml(result);
            const tempLine = result.tempAbsorbed > 0
                ? '<div style="padding-top:2px;color:rgb(52,203,116);font-size:10px;line-height:12px;text-align:center;">(Some damage was absorbed by Temporary HP)</div>'
                : '';
            return targetName + ' takes ' + (damageParts || '0 damage') + sourcePhrase + (result.fainted ? ' and falls unconscious' : '') + '.' + tempLine;
        },

        titleTokenIconHtml(imgsrc) {
            const safeImg = String(imgsrc || '').trim();
            return Utils.isSafeImageUrl(safeImg)
                ? Html.img(safeImg, 'width:24px;height:24px;object-fit:cover;border-radius:3px;vertical-align:middle;display:block;')
                : '';
        },

        combatLogTitleHtml(result, title) {
            result = result || {};
            const sourceName = String(result.sourceName || '').trim();
            const sourceAction = String(result.sourceAction || '').trim();
            const isManualSource = /^manual$/i.test(sourceName) || /^manual(?:\s+(?:damage|healing))?$/i.test(sourceAction);
            const showSource = RuntimeConfig.get('REVEAL_DAMAGE_SOURCE') && !isManualSource;
            const sourceHtml = showSource ? this.titleTokenIconHtml(result.sourceImgsrc || '') : this.titleTokenIconHtml('');
            const targetHtml = this.titleTokenIconHtml(result.tokenImgsrc || '');
            return (
                '<table style="width:100%;border-collapse:collapse;table-layout:fixed;"><tbody><tr>' + (showSource ?
                    '<td style="width:28px;text-align:left;vertical-align:middle;padding:0;">' + sourceHtml + '</td>' : "\t") +
                    '<td style="text-align:center;vertical-align:middle;">' + Utils.escapeHtml(title || 'Combat Log') + '</td>' +
                    '<td style="width:28px;text-align:right;vertical-align:middle;padding:0;">' + targetHtml + '</td>' +
                '</tr></tbody></table>'
            );
        },

        buildDamagePartsHtml(result) {
            const rawParts = (Array.isArray(result && result.parts) ? result.parts : []);
            const hadPendingDamage = (part) => Utils.toInt(part && part.adjustedBase, Utils.toInt(part && part.baseDamage, 0)) > 0;
            const visibleParts = rawParts.filter((part) => Utils.toInt(part && part.finalDamage, 0) > 0 || (!!(part && part.immune) && hadPendingDamage(part)));
            const allVisibleDamageBlockedByImmunity = visibleParts.length > 0 && visibleParts.every((part) => !!part.immune && Utils.toInt(part.finalDamage, 0) <= 0);
            const parts = visibleParts.map((part) => {
                const type = CombatService.normalizeDamageType(part.damageType);
                const typeLabel = type && type !== 'normal' ? type : '';
                const color = this.getDamageTypeColor(type);
                const typed = typeLabel ? Html.span(Utils.escapeHtml(typeLabel), 'color:' + color + ';font-weight:900;') : '';
                const traitLabel = typed || 'damage';
                if (part.immune && Utils.toInt(part.finalDamage, 0) <= 0 && hadPendingDamage(part)) {
                    return allVisibleDamageBlockedByImmunity && visibleParts.length === 1
                        ? 'no damage, blocked by ' + traitLabel + ' immunity'
                        : 'no ' + (typed ? (typed + ' ') : '') + 'damage, blocked by ' + traitLabel + ' immunity';
                }
                const amount = Html.span(Utils.escapeHtml(String(part.finalDamage)), 'color:' + color + ';font-weight:900;');
                const adjustments = [];
                if (part.immune) adjustments.push('blocked by ' + traitLabel + ' immunity');
                if (part.resistant) adjustments.push('reduced by ' + traitLabel + ' resistance');
                if (part.vulnerable) adjustments.push('increased by ' + traitLabel + ' vulnerability');
                return amount + (typed ? (' ' + typed) : '') + ' damage' + (adjustments.length ? (', ' + adjustments.join(' and ')) : '');
            });
            return parts.join(', ');
        },

        buildHealNarrative(result) {
            result = result || {};
            const hideNames = RuntimeConfig.get('HIDE_TOKEN_NAMES_IN_LOG');
            const targetName = Html.span(Utils.escapeHtml(hideNames ? 'Target' : String(result.tokenName || 'Target')), 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:900;');
            const amount = Html.span(Utils.escapeHtml(String(result.amount || 0)), 'color:' + (result.mode === 'temp' ? 'rgb(255,105,180)' : CONFIG.DEFAULT_TEXT_HEAL_COLOR) + ';font-weight:900;');
            const sourceNameRaw = String(result.sourceName || '').trim();
            const sourceActionRaw = String(result.sourceAction || '').trim();
            const sourceName = sourceNameRaw && !/^manual$/i.test(sourceNameRaw)
                ? Html.span(Utils.escapeHtml(hideNames ? 'Healer' : sourceNameRaw), 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:900;')
                : '';
            const sourceAction = sourceActionRaw && !/^manual(?:\s+healing)?$/i.test(sourceActionRaw)
                ? Html.span(Utils.escapeHtml(sourceActionRaw), 'color:rgb(245,220,80);font-weight:900;')
                : '';
            if (sourceName || sourceAction) {
                const source = sourceName || Html.span('Someone', 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:900;');
                const usingText = sourceAction ? (' using ' + sourceAction) : '';
                if (result.mode === 'temp') return source + ' grants ' + amount + ' temporary HP to ' + targetName + usingText + '.';
                return source + ' heals ' + amount + ' HP to ' + targetName + usingText + '.';
            }
            if (result.mode === 'temp') {
                return targetName + ' receives ' + amount + ' temporary HP (' + Utils.escapeHtml(String(result.previousTemp || 0)) + ' &rarr; ' + Utils.escapeHtml(String(result.currentTemp || 0)) + ').';
            }
            return targetName + ' heals ' + amount + ' HP (' + Utils.escapeHtml(String(result.previousHp || 0)) + ' &rarr; ' + Utils.escapeHtml(String(result.currentHp || 0)) + (result.maxHp !== null && result.maxHp !== undefined ? ('/' + Utils.escapeHtml(String(result.maxHp))) : '') + ').';
        },

        showNativeSaveRollRequest(request) {
            request = request || {};
            const ability = CombatService.abilityNameToShortLabel(request.saveAbility || '') || 'SAVE';
            const challenge = Math.max(0, Utils.toInt(request.challenge, 0));
            const tokenName = Html.span(Utils.escapeHtml(String(request.tokenName || 'Target')), 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:900;');
            const damageType = CombatService.normalizeDamageType(request.damageType || 'normal');
            const damageIcon = this.getDamageTypeIcon(damageType);
            const damageColor = this.getDamageTypeColor(damageType);
            const button = this.iconButtonHtml({
                iconHtml: '&#127922;',
                label: ability,
                command: String(request.command || '#'),
                backgroundColor: 'rgba(45,45,45,0.95)',
                tooltip: 'Roll ' + ability + ' saving throw'
            });
            const body =
                '<table style="width:100%;border-collapse:collapse;table-layout:fixed;"><tbody><tr>' +
                    '<td style="text-align:center;vertical-align:middle;padding:2px 8px 6px 0;font-size:13px;line-height:16px;color:rgb(235,235,235);">' +
                        tokenName + ' must roll a <strong>' + Utils.escapeHtml(ability) + '</strong> saving throw' + (challenge > 0 ? (' <strong>DC ' + Utils.escapeHtml(String(challenge)) + '</strong>') : '') + '.' +
                        '<br><span style="color:rgb(190,190,190);font-size:12px;">Damage: </span>' +
                        '<strong style="color:' + damageColor + ';">' + damageIcon + ' ' + Utils.escapeHtml(String(request.damage || 0)) +
                        (damageType === 'normal' ? '' : (' ' + Utils.escapeHtml(damageType))) + '</strong>' +
                    '</td>' +
                    '<td style="width:56px;text-align:right;vertical-align:middle;padding:2px 0 6px 4px;">' + button + '</td>' +
                '</tr></tbody></table>';
            return Html.card({
                title: ability + ' Saving Throw',
                body
            });
        },

        showNativeSheetRollRequest(request) {
            request = request || {};
            const label = String(request.label || 'Roll');
            const tokenName = Html.span(Utils.escapeHtml(String(request.tokenName || 'Token')), 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:900;');
            const button = this.iconButtonHtml({
                iconHtml: String(request.iconHtml || '&#127922;'),
                label,
                command: String(request.command || '#'),
                backgroundColor: 'rgba(45,45,45,0.95)',
                tooltip: String(request.tooltip || 'Roll')
            });
            const body =
                '<table style="width:100%;border-collapse:collapse;table-layout:fixed;"><tbody><tr>' +
                    '<td style="text-align:center;vertical-align:middle;padding:2px 8px 6px 0;font-size:13px;line-height:16px;color:rgb(235,235,235);">' +
                        tokenName + ' rolls <strong>' + Utils.escapeHtml(String(request.rollName || label)) + '</strong>.' +
                    '</td>' +
                    '<td style="width:56px;text-align:right;vertical-align:middle;padding:2px 0 6px 4px;">' + button + '</td>' +
                '</tr></tbody></table>';
            return Html.card({
                title: String(request.title || label + ' Roll'),
                body
            });
        },

        showNativeBatchRollRequest(request) {
            request = request || {};
            const label = String(request.label || 'Roll');
            const names = (Array.isArray(request.names) ? request.names : [])
                .map((name) => String(name || '').trim())
                .filter(Boolean);
            const rows = names.length
                ? names.map((name) => '<div style="padding:1px 0;color:rgb(225,225,225);font-size:12px;line-height:14px;">' + Utils.escapeHtml(name) + '</div>').join('')
                : '<div style="color:rgb(180,180,180);font-size:12px;line-height:14px;">No tokens listed.</div>';
            const button = this.iconButtonHtml({
                iconHtml: String(request.iconHtml || '&#127922;'),
                label,
                command: String(request.command || '#'),
                backgroundColor: 'rgba(45,45,45,0.95)',
                tooltip: String(request.tooltip || label)
            });
            const body =
                '<table style="width:100%;border-collapse:collapse;table-layout:fixed;"><tbody><tr>' +
                    '<td style="text-align:left;vertical-align:middle;padding:2px 8px 6px 0;">' +
                        '<div style="color:rgb(190,190,190);font-size:12px;line-height:14px;padding-bottom:3px;">' + String(request.intro || 'Roll for:') + '</div>' +
                        rows +
                    '</td>' +
                    '<td style="width:60px;text-align:right;vertical-align:middle;padding:2px 0 6px 4px;">' + button + '</td>' +
                '</tr></tbody></table>';
            return Html.card({
                title: String(request.title || label),
                body
            });
        },

        showInitiativeResults(results) {
            const rows = (Array.isArray(results) ? results : []).map((result) => {
                const modifier = Utils.toInt(result.modifier, 0);
                const tokenName = Html.span(Utils.escapeHtml(String(result.tokenName || 'Token')), 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:900;');
                const bonusHtml = Html.span(' (' + Utils.escapeHtml(Utils.formatSigned(modifier)) + ')', 'color:rgb(145,145,145);font-size:11px;font-weight:700;');
                const mode = String(result.mode || 'normal');
                const reasonText = (mode === 'advantage' || mode === 'disadvantage') ? String(result.rollModeReason || mode).trim() : '';
                const reasonMarker = mode === 'advantage'
                    ? Html.span(' &#9650; ', 'color:rgb(90,220,120);font-size:10px;font-weight:900;')
                    : (mode === 'disadvantage' ? Html.span(' &#9660; ', 'color:rgb(230,80,80);font-size:10px;font-weight:900;') : '');
                const reasonHtml = reasonText
                    ? Html.span(' (' + reasonMarker + Utils.escapeHtml(reasonText) + ')', 'color:rgb(145,145,145);font-size:10px;font-weight:700;')
                    : '';
                const rolls = (Array.isArray(result.rolls) && result.rolls.length ? result.rolls : [result.natural || 0]).map((roll) => Utils.toInt(roll, 0));
                const chosenValue = mode === 'advantage'
                    ? Math.max.apply(null, rolls)
                    : (mode === 'disadvantage' ? Math.min.apply(null, rolls) : rolls[0]);
                let chosenUsed = false;
                const badges = rolls.map((roll) => {
                    const isChosen = !chosenUsed && roll === chosenValue;
                    if (isChosen) chosenUsed = true;
                    const marker = isChosen && mode === 'advantage' ? '&#9650;' : (isChosen && mode === 'disadvantage' ? '&#9660;' : '');
                    return this.rollBadgeHtml({
                        natural: roll,
                        total: roll + modifier,
                        modifier,
                        dimmed: rolls.length > 1 && !isChosen,
                        tooltip: 'Initiative<br>Roll: (' + String(roll) + ')<br>Modifier: ' + Utils.formatSigned(modifier) + '<br>Total: ' + String(roll + modifier) + (mode !== 'normal' ? ('<br>Mode: ' + mode) : '')
                    }, marker, { size: 34, fontSize: '18px' });
                }).reverse().join('');
                return '<tr>' +
                    '<td style="text-align:left;vertical-align:middle;padding:3px 4px;font-size:14px;line-height:16px;">' + tokenName + bonusHtml + reasonHtml + '</td>' +
                    '<td style="width:86px;text-align:right;vertical-align:middle;padding:3px 0;white-space:nowrap;overflow:visible;">' +
                        '<div style="display:inline-block;text-align:right;white-space:nowrap;">' + badges + '</div>' +
                    '</td>' +
                '</tr>';
            }).join('');
            const body = rows
                ? '<table style="width:100%;border-collapse:collapse;table-layout:fixed;"><tbody>' + rows + '</tbody></table>'
                : '<div>No initiative rolls were made.</div>';
            return Html.card({ title: 'Initiative Roll', body });
        },

        showSavingThrowResults(results, abilityLabel) {
            const safeAbilityLabel = String(abilityLabel || 'SAVE').trim().toUpperCase();
            const rows = (Array.isArray(results) ? results : []).map((result) => {
                const modifier = Utils.toInt(result.modifier, 0);
                const tokenName = Html.span(Utils.escapeHtml(String(result.tokenName || 'Token')), 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:900;');
                const bonusHtml = Html.span(' (' + Utils.escapeHtml(Utils.formatSigned(modifier)) + ')', 'color:rgb(145,145,145);font-size:11px;font-weight:700;');
                const mode = String(result.mode || 'normal');
                const rolls = (Array.isArray(result.rolls) && result.rolls.length ? result.rolls : [result.natural || 0]).map((roll) => Utils.toInt(roll, 0));
                const chosenValue = mode === 'advantage'
                    ? Math.max.apply(null, rolls)
                    : (mode === 'disadvantage' ? Math.min.apply(null, rolls) : rolls[0]);
                let chosenUsed = false;
                const badges = rolls.map((roll) => {
                    const isChosen = !chosenUsed && roll === chosenValue;
                    if (isChosen) chosenUsed = true;
                    const marker = isChosen && mode === 'advantage' ? '&#9650;' : (isChosen && mode === 'disadvantage' ? '&#9660;' : '');
                    return this.rollBadgeHtml({
                        natural: roll,
                        total: roll + modifier,
                        modifier,
                        dimmed: rolls.length > 1 && !isChosen,
                        tooltip: safeAbilityLabel + ' Save<br>Roll: (' + String(roll) + ')<br>Modifier: ' + Utils.formatSigned(modifier) + '<br>Total: ' + String(roll + modifier) + (mode !== 'normal' ? ('<br>Mode: ' + mode) : '')
                    }, marker, { size: 34, fontSize: '18px' });
                }).reverse().join('');
                return '<tr>' +
                    '<td style="text-align:left;vertical-align:middle;padding:3px 4px;font-size:14px;line-height:16px;">' + tokenName + bonusHtml + '</td>' +
                    '<td style="width:86px;text-align:right;vertical-align:middle;padding:3px 0;white-space:nowrap;overflow:visible;">' +
                        '<div style="display:inline-block;text-align:right;white-space:nowrap;">' + badges + '</div>' +
                    '</td>' +
                '</tr>';
            }).join('');
            const body = rows
                ? '<table style="width:100%;border-collapse:collapse;table-layout:fixed;"><tbody>' + rows + '</tbody></table>'
                : '<div>No saving throws were made.</div>';
            return Html.card({ title: safeAbilityLabel + ' Saving Throws', body });
        }
    };

    /** -----------------------------------------------------------------------
     * Roll parser and chat capture
     * --------------------------------------------------------------------- */
    const RollParser = {
        isOwnChatMessage(msg) {
            const who = String(msg && msg.who || '').trim();
            const content = String(msg && msg.content || '');
            if (Utils.normalizeName(who).indexOf(Utils.normalizeName(META.CHAT_NAME)) >= 0) return true;
            if (/Combat Assistant Chat Probe/i.test(content)) return true;
            return false;
        },

        renderChatProbe(msg) {
            msg = msg || {};
            const keys = Object.keys(msg)
                .filter((key) => ['content', 'inlinerolls'].indexOf(key) < 0)
                .sort();
            const inlineRolls = (Array.isArray(msg.inlinerolls) ? msg.inlinerolls : []).map((roll, index) => ({
                index,
                expression: roll && roll.expression ? String(roll.expression) : '',
                total: roll && roll.results && roll.results.total !== undefined ? roll.results.total : ''
            }));
            const content = String(msg.content || '');
            const plain = Utils.stripHtml(content);
            const body =
                '<div style="text-align:left;font-size:11px;line-height:14px;color:rgb(225,225,225);">' +
                    '<b>type:</b> ' + Utils.escapeHtml(msg.type || '') + '<br>' +
                    '<b>who:</b> ' + Utils.escapeHtml(msg.who || '') + '<br>' +
                    '<b>rolltemplate:</b> ' + Utils.escapeHtml(msg.rolltemplate || '') + '<br>' +
                    '<b>keys:</b> ' + Utils.escapeHtml(keys.join(', ')) + '<br>' +
                    '<b>inlinerolls:</b><br><code style="white-space:pre-wrap;">' + Utils.escapeHtml(Utils.truncate(JSON.stringify(inlineRolls), 900)) + '</code><br>' +
                    '<b>plain:</b><br><code style="white-space:pre-wrap;">' + Utils.escapeHtml(Utils.truncate(plain, 1400)) + '</code><br>' +
                    '<b>content:</b><br><code style="white-space:pre-wrap;">' + Utils.escapeHtml(Utils.truncate(content, 1800)) + '</code>' +
                '</div>';
            return Html.card({ title: 'Combat Assistant Chat Probe', body });
        },

        maybeDumpChatProbe(msg) {
            if (!RuntimeConfig.get('CHAT_PROBE')) return;
            if (this.isOwnChatMessage(msg)) return;
            R20.whisper('GM', this.renderChatProbe(msg));
        },

        getRollTemplateField(content, field) {
            const safeField = String(field || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const match = String(content || '').match(new RegExp('\\{\\{' + safeField + '=([\\s\\S]*?)\\}\\}', 'i'));
            return match ? String(match[1] || '').trim() : '';
        },

        getFirstField(content, fields) {
            for (let i = 0; i < fields.length; i += 1) {
                const value = this.getRollTemplateField(content, fields[i]);
                if (String(value || '').trim()) return value;
            }
            return '';
        },

        getInlineRollTotal(msg, index) {
            const rolls = Array.isArray(msg && msg.inlinerolls) ? msg.inlinerolls : [];
            const roll = rolls[index] || null;
            if (!roll || !roll.results) return null;
            if (roll.results.total !== undefined && roll.results.total !== null) return Utils.toNumber(roll.results.total, 0);
            return null;
        },

        getInlineRollFormula(msg, value) {
            const index = this.extractInlineRollIndex(value);
            if (index === null) return '';
            const rolls = Array.isArray(msg && msg.inlinerolls) ? msg.inlinerolls : [];
            const roll = rolls[index] || null;
            return roll && roll.expression ? String(roll.expression || '').trim() : '';
        },

        getInlineRollObject(msg, value) {
            const index = this.extractInlineRollIndex(value);
            if (index === null) return null;
            const rolls = Array.isArray(msg && msg.inlinerolls) ? msg.inlinerolls : [];
            return rolls[index] || null;
        },

        extractInlineRollIndex(value) {
            const text = String(value || '');
            const match = text.match(/\$\[\[(\d+)\]\]/) || text.match(/\[\[.*?\]\]/);
            if (!match) return null;
            if (match[1] !== undefined) return Utils.toInt(match[1], 0);
            return null;
        },

        fieldTotal(msg, value) {
            const text = String(value || '').trim();
            const index = this.extractInlineRollIndex(text);
            if (index !== null) {
                const total = this.getInlineRollTotal(msg, index);
                if (total !== null) return total;
            }
            const numeric = text.replace(/<[^>]*>/g, '').match(/-?\d+(?:\.\d+)?/);
            return numeric ? Utils.toNumber(numeric[0], 0) : null;
        },

        evaluateFlatMathExpression(expression) {
            const source = String(expression || '').replace(/\s+/g, '');
            if (!source || /[^0-9+\-*/().]/.test(source)) return null;
            const tokens = source.match(/\d+(?:\.\d+)?|[+\-*/()]/g) || [];
            let index = 0;
            const parseExpression = () => {
                let value = parseTerm();
                while (index < tokens.length && (tokens[index] === '+' || tokens[index] === '-')) {
                    const op = tokens[index++];
                    const rhs = parseTerm();
                    value = op === '+' ? value + rhs : value - rhs;
                }
                return value;
            };
            const parseTerm = () => {
                let value = parseFactor();
                while (index < tokens.length && (tokens[index] === '*' || tokens[index] === '/')) {
                    const op = tokens[index++];
                    const rhs = parseFactor();
                    value = op === '*' ? value * rhs : (rhs === 0 ? value : value / rhs);
                }
                return value;
            };
            const parseFactor = () => {
                const token = tokens[index++];
                if (token === '+') return parseFactor();
                if (token === '-') return -parseFactor();
                if (token === '(') {
                    const value = parseExpression();
                    if (tokens[index] === ')') index += 1;
                    return value;
                }
                return Utils.toNumber(token, 0);
            };
            if (!tokens.length) return null;
            const result = parseExpression();
            return Number.isFinite(result) ? result : null;
        },

        getInlineRollD20Natural(msg, value) {
            const roll = this.getInlineRollObject(msg, value);
            const collectDiceResults = (node, results) => {
                if (!node || typeof node !== 'object') return;
                if (Array.isArray(node)) {
                    node.forEach((entry) => collectDiceResults(entry, results));
                    return;
                }
                if (Array.isArray(node.results)) {
                    node.results.forEach((entry) => {
                        if (!entry || typeof entry !== 'object') return;
                        const sides = Utils.toInt(node.sides || node.dice || node.die || 0, 0);
                        const value = entry.v !== undefined ? entry.v : (entry.value !== undefined ? entry.value : entry.result);
                        if ((sides === 20 || /d20/i.test(String(node.expression || node.type || ''))) && value !== undefined && value !== null) {
                            results.push(Utils.toInt(value, 0));
                        }
                    });
                }
                Object.keys(node).forEach((key) => {
                    if (key !== 'results') collectDiceResults(node[key], results);
                });
            };
            const diceResults = [];
            collectDiceResults(roll && roll.results, diceResults);
            if (diceResults.length) return diceResults[0];

            const formula = this.getInlineRollFormula(msg, value);
            const total = this.fieldTotal(msg, value);
            if (total === null || !/d20/i.test(formula)) return null;
            const withoutDice = formula.replace(/\d*d20/ig, '0').replace(/\[[^\]]*]/g, '');
            const modifier = this.evaluateFlatMathExpression(withoutDice);
            if (modifier === null) return null;
            const natural = Math.round(Utils.toNumber(total, 0) - modifier);
            return natural >= 1 && natural <= 20 ? natural : null;
        },

        hasTemplateFlag(content, fields, flag) {
            const safeFlag = String(flag || '').trim().toLowerCase();
            if (!safeFlag) return false;
            if (Utils.toBoolean(fields[safeFlag], false)) return true;
            return new RegExp('\\{\\{' + safeFlag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=1\\}\\}', 'i').test(String(content || ''));
        },

        isZeroD20InlineRoll(msg, value) {
            const formula = this.getInlineRollFormula(msg, value);
            return /\b0d20\b/i.test(String(formula || '').replace(/\s+/g, ''));
        },

        resolve2014TemplateD20Roll(msg, fields, content, r1Value, r2Value) {
            const r1 = this.fieldTotal(msg, r1Value);
            const rawR2 = this.fieldTotal(msg, r2Value);
            const r2IsRealRoll = rawR2 !== null && rawR2 !== undefined && !this.isZeroD20InlineRoll(msg, r2Value);
            const r2 = r2IsRealRoll ? rawR2 : null;
            const n1 = r1 !== null ? this.getInlineRollD20Natural(msg, r1Value) : null;
            const n2 = r2 !== null ? this.getInlineRollD20Natural(msg, r2Value) : null;
            const rollModeText = String(fields.rollmode || fields.type || '').toLowerCase();
            const advantage = this.hasTemplateFlag(content, fields, 'advantage') || this.hasTemplateFlag(content, fields, 'adv') || /\badvantage\b/i.test(rollModeText);
            const disadvantage = this.hasTemplateFlag(content, fields, 'disadvantage') || this.hasTemplateFlag(content, fields, 'disadv') || /\bdisadvantage\b/i.test(rollModeText);
            const always = this.hasTemplateFlag(content, fields, 'always');
            let total = r1 !== null ? r1 : null;
            let natural = n1;
            let mode = 'normal';
            if (r1 !== null && r2 !== null) {
                if (disadvantage) {
                    total = Math.min(r1, r2);
                    natural = r2 < r1 ? n2 : n1;
                    mode = 'disadvantage';
                } else if (advantage || always) {
                    total = Math.max(r1, r2);
                    natural = r2 > r1 ? n2 : n1;
                    mode = 'advantage';
                }
            }
            return {
                total,
                natural,
                mode,
                rolls: [r1, r2].filter((value) => value !== null && value !== undefined),
                naturalRolls: [n1, n2].filter((value) => value !== null && value !== undefined),
                hasSecondRoll: r2 !== null && r2 !== undefined
            };
        },

        getRollTemplateFields(content) {
            const fields = {};
            const source = String(content || '');
            const pattern = /\{\{([^=}{]+)=([\s\S]*?)\}\}/g;
            let match;
            while ((match = pattern.exec(source)) !== null) {
                fields[String(match[1] || '').trim().toLowerCase()] = String(match[2] || '').trim();
            }
            if (!fields.charname) {
                const charMatch = source.match(/(?:^|\s)charname=([^\r\n{}]+?)(?=\s+\{\{|$)/i);
                if (charMatch) fields.charname = String(charMatch[1] || '').trim();
            }
            return fields;
        },

        parseAdvancedHtml(content) {
            const source = String(content || '');
            if (!/<rolltemplate\b/i.test(source)) return null;
            const htmlText = (raw) => Utils.stripHtml(raw).replace(/\s+/g, ' ').trim();
            const readDivByClass = (className) => {
                const pattern = new RegExp('<div\\s+class="[^"]*' + className + '[^"]*"[^>]*>([\\s\\S]*?)<\\/div>', 'i');
                const match = source.match(pattern);
                return match ? htmlText(match[1]) : '';
            };
            const characterName = Utils.cleanRoll20Label(readDivByClass('meta__character-name'));
            const titleMatch = source.match(/<div\s+class="[^"]*header__title[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
            const rawTitle = titleMatch ? Utils.cleanRoll20Label(htmlText(titleMatch[1])) : '';
            if (!rawTitle) return null;
            const textSource = htmlText(source);
            const isTemporaryHitPoints = /\btemporary\s+hit\s+points?\b/i.test(rawTitle) || /\btemporary\s+hit\s+points?\b/i.test(textSource) || /\btemp(?:orary)?\s*hp\b/i.test(textSource);
            const isHealing = isTemporaryHitPoints || /data-rollSubcategory="(?:Healing|Heal)"/i.test(source) || /\b(healing|heal)\b/i.test(rawTitle) || /\b(healing|heal)\s+breakdown\b/i.test(textSource);
            const isTempHealing = isTemporaryHitPoints;
            const isDamage = !isHealing && (/header__title[^"]*--damage/i.test(titleMatch[0]) || /data-rollSubcategory="Damage"/i.test(source));
            const attackName = Utils.cleanRoll20Label(rawTitle.replace(/\s+(Damage|Healing|Heal)\s*$/i, '').trim());
            const resultMatch = source.match(/data-result="([+-]?\d+(?:\.\d+)?)"/i);
            const firstResult = resultMatch ? Utils.toNumber(resultMatch[1], 0) : null;
            const damageRolls = [];
            const damagePattern = /damage-breakdown__icon[\s\S]*?<\/div>\s*([^<]+?)\s*<div\s+class="[^"]*damage-breakdown__total[^"]*"[^>]*>\s*([+-]?\d+)/gi;
            const formulaPattern = /<div\s+class="[^"]*rt-formula__raw[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div\s+class="[^"]*rt-formula__evaluated[^"]*"[^>]*>[\s\S]*?data-roll(?:name|id)="[^"]*"[^>]*>\s*([+-]?\d+)/gi;
            const formulas = [];
            let formulaMatch = null;
            while ((formulaMatch = formulaPattern.exec(source)) !== null) {
                formulas.push({ formula: htmlText(formulaMatch[1]), total: Utils.toInt(formulaMatch[2], 0) });
            }
            let damageMatch = null;
            while ((damageMatch = damagePattern.exec(source)) !== null) {
                const index = damageRolls.length;
                const type = isHealing ? 'healing' : (htmlText(damageMatch[1]) || 'normal');
                const total = Utils.toInt(damageMatch[2], 0);
                damageRolls.push({ total, damageType: type, formula: (formulas[index] && formulas[index].formula) || 'Roll20' });
            }
            if (!damageRolls.length && isHealing && firstResult !== null) {
                damageRolls.push({
                    total: Math.max(0, Utils.toInt(firstResult, 0)),
                    damageType: isTempHealing ? 'temp healing' : 'healing',
                    formula: formulas.length ? formulas.map((entry) => entry.formula || '').filter(Boolean).join(' + ') : 'Roll20'
                });
            }
            const damageTotal = damageRolls.length ? damageRolls.reduce((sum, entry) => sum + Math.max(0, Utils.toInt(entry.total, 0)), 0) : ((isDamage || isHealing) ? firstResult : null);
            const saveDcMatch = textSource.match(/\bDC\s*([0-9]+)/i) || textSource.match(/\b(?:difficulty\s+class)\s*([0-9]+)/i);
            const saveAbilityMatch = textSource.match(/\b(strength|dexterity|constitution|intelligence|wisdom|charisma|str|dex|con|int|wis|cha)\b\s+(?:saving\s+throw|save)\b/i) || textSource.match(/\b(?:saving\s+throw|save)\b\s*[:\-]?\s*\b(strength|dexterity|constitution|intelligence|wisdom|charisma|str|dex|con|int|wis|cha)\b/i);
            const saveDc = saveDcMatch ? Utils.toInt(saveDcMatch[1], 0) : 0;
            const saveAbility = saveAbilityMatch ? saveAbilityMatch[1] : '';
            const halfOnSuccess = /\bOn\s+Successful\s+Save\s*:\s*(?:Half|Half\s+as\s+much)\s+damage\b/i.test(textSource) || /\bhalf\s+(?:as\s+much\s+)?damage\b/i.test(textSource);
            return {
                characterName,
                attackName,
                isAttack: !isDamage && !isHealing,
                isDamage,
                isHealing,
                isTempHealing,
                attackTotal: !isDamage && !isHealing ? firstResult : null,
                damageTotal,
                damageType: damageRolls.length ? damageRolls[0].damageType : 'normal',
                damageRolls,
                formula: damageRolls.length ? damageRolls.map((entry) => entry.formula || 'Roll20').join(' + ') : 'Roll20',
                saveDc,
                saveAbility,
                halfOnSuccess,
                halfOnSuccessKnown: saveDc > 0
            };
        },

        extractSaveDetailsFromText(text) {
            const source = Utils.stripHtml(String(text || '')).replace(/\s+/g, ' ').trim();
            if (!source) return { saveDc: 0, saveAbility: '', halfOnSuccess: false };
            const saveDcMatch = source.match(/\bDC\s*([0-9]+)/i) || source.match(/\b(?:difficulty\s+class)\s*([0-9]+)/i);
            const abilityPattern = '(strength|dexterity|constitution|intelligence|wisdom|charisma|str|dex|con|int|wis|cha)';
            const saveAbilityMatch =
                source.match(new RegExp('\\bDC\\s*[0-9]+\\s+' + abilityPattern + '\\s+(?:saving\\s+throw|save)\\b', 'i')) ||
                source.match(new RegExp('\\b' + abilityPattern + '\\s+(?:saving\\s+throw|save)\\b', 'i')) ||
                source.match(new RegExp('\\b(?:saving\\s+throw|save)\\b\\s*[:\\-]?\\s*' + abilityPattern + '\\b', 'i'));
            const halfOnSuccess = /\bOn\s+Successful\s+Save\s*:\s*(?:Half|Half\s+as\s+much)\s+damage\b/i.test(source) ||
                /\bhalf\s+(?:as\s+much\s+)?damage\b/i.test(source);
            return {
                saveDc: saveDcMatch ? Math.max(0, Utils.toInt(saveDcMatch[1], 0)) : 0,
                saveAbility: saveAbilityMatch ? CombatService.normalizeAbilityName(saveAbilityMatch[1]) : '',
                halfOnSuccess
            };
        },

        parseAttackRoll(msg, fields, advanced) {
            const content = String(msg.content || '');
            if (advanced && advanced.isAttack && advanced.attackTotal !== null) {
                return {
                    total: Math.max(0, Utils.toInt(advanced.attackTotal, 0)),
                    hasAttackRoll: true,
                    mode: 'normal',
                    rolls: [],
                    saveDc: advanced.saveDc || 0,
                    saveAbility: advanced.saveAbility || '',
                    halfOnSuccess: !!advanced.halfOnSuccess,
                    halfOnSuccessKnown: !!advanced.halfOnSuccessKnown
                };
            }
            const attackFieldValue = String(fields.attack || '').trim();
            const attackFieldIsRoll = !!attackFieldValue &&
                !/^[01]$/.test(attackFieldValue) &&
                (/\$\[\[\d+\]\]/.test(attackFieldValue) || /\bd20\b/i.test(attackFieldValue) || /^[+-]?\d+(?:\.\d+)?$/.test(attackFieldValue));
            const r1Value = fields.r1 || fields.atk || fields.roll || (attackFieldIsRoll ? attackFieldValue : '');
            const r2Value = fields.r2 || '';
            const resolvedRoll = this.resolve2014TemplateD20Roll(msg, fields, content, r1Value, r2Value);
            const saveDcField = fields.savedc || fields.save_dc || fields.dc || fields.spelldc || '';
            const saveDcTotal = saveDcField ? this.fieldTotal(msg, saveDcField) : null;
            const textSave = this.extractSaveDetailsFromText([
                fields.savedesc,
                fields.save_success,
                fields.description,
                fields.desc,
                content
            ].filter(Boolean).join(' '));
            const saveDc = Math.max(0, Utils.toInt(saveDcTotal !== null ? saveDcTotal : saveDcField, 0)) || textSave.saveDc;
            const saveAbility = fields.saveattr || fields.saveability || fields.save_ability || fields.savetype || textSave.saveAbility || '';
            let total = resolvedRoll.total;
            const natural = resolvedRoll.natural;
            const mode = resolvedRoll.mode;
            if (total === null && saveDc > 0) total = saveDc;
            return {
                total,
                hasAttackRoll: resolvedRoll.total !== null && resolvedRoll.total !== undefined,
                natural,
                isCritical: natural === 20,
                mode,
                rolls: resolvedRoll.rolls,
                naturalRolls: resolvedRoll.naturalRolls,
                saveDc,
                saveAbility,
                halfOnSuccess: /half/i.test(String(fields.savedesc || fields.save_success || fields.description || '')) || textSave.halfOnSuccess,
                halfOnSuccessKnown: saveDc > 0
            };
        },

        parseDamageRolls(msg, fields, advanced, attack) {
            if (advanced && Array.isArray(advanced.damageRolls) && advanced.damageRolls.length) {
                return advanced.damageRolls.map((entry) => ({
                    total: Math.max(0, Utils.toInt(entry.total, 0)),
                    damageType: CombatService.normalizeDamageType(entry.damageType || advanced.damageType || 'normal'),
                    formula: entry.formula || advanced.formula || 'Roll20'
                }));
            }
            const damageRolls = [];
            const content = String(msg && msg.content || '');
            const hasCritTemplate = !!(
                (attack && attack.isCritical) ||
                Utils.toBoolean(fields.crit || fields.critical || false, false) ||
                /\{\{crit=1\}\}/i.test(content)
            );
            const critKeyByDamageKey = {
                dmg1: 'crit1',
                dmg2: 'crit2',
                globaldamage: 'globaldamagecrit'
            };
            const damageKeys = [
                ['dmg1', 'dmg1type'],
                ['dmg2', 'dmg2type'],
                ['globaldamage', 'globaldamagetype'],
                ['damage', 'damage_type'],
                ['dmg', 'damagetype'],
                ['hldmg', 'hldmgtype'],
                ['healing', 'healingtype'],
                ['heal', 'healtype']
            ];
            damageKeys.forEach((pair) => {
                const value = fields[pair[0]];
                if (!value) return;
                if (pair[0] === 'damage' && (fields.dmg1 || fields.dmg1flag || fields.dmg2)) return;
                const total = this.fieldTotal(msg, value);
                if (total === null) return;
                const rawType = fields[pair[1]] || fields.damage_type || fields.damagetype || fields.dmgtype || '';
                if (Math.max(0, Utils.toInt(total, 0)) <= 0 && !String(rawType || '').trim()) return;
                const type = rawType || 'normal';
                const critKey = critKeyByDamageKey[pair[0]] || '';
                const critValue = hasCritTemplate && critKey && fields[critKey]
                    ? this.fieldTotal(msg, fields[critKey])
                    : 0;
                const baseTotal = Math.max(0, Utils.toInt(total, 0));
                const critTotal = Math.max(0, Utils.toInt(critValue, 0));
                const baseFormula = this.getInlineRollFormula(msg, value) || 'Roll20';
                const critFormula = critTotal > 0 ? this.getInlineRollFormula(msg, fields[critKey]) : '';
                damageRolls.push({
                    total: baseTotal + critTotal,
                    damageType: CombatService.normalizeDamageType(type),
                    formula: critTotal > 0
                        ? (baseFormula + ' + crit ' + (critFormula || String(critTotal)))
                        : baseFormula,
                    baseTotal,
                    critTotal
                });
            });
            return damageRolls;
        },

        parseMessage(msg) {
            if (!msg || msg.type === 'api') return null;
            const content = String(msg.content || '');
            if (!msg.rolltemplate && content.indexOf('{{') < 0 && !/<rolltemplate\b/i.test(content)) return null;

            const fields = this.getRollTemplateFields(content);
            const advanced = this.parseAdvancedHtml(content);
            const explicitAttackNameSource = (advanced && advanced.attackName) || fields.rname || fields.attackname || fields.spellname || fields.rollname || this.getFirstField(content, ['rname', 'attackname', 'spellname', 'rollname']);
            const explicitCharacterNameSource = (advanced && advanced.characterName) || fields.charname || fields.character_name || fields.character || fields.source || this.getFirstField(content, ['charname', 'character_name', 'character', 'source']);
            const attackName = Utils.cleanRoll20Label(explicitAttackNameSource || fields.name || this.getFirstField(content, ['name']) || 'Attack');
            const characterName = Utils.cleanRoll20Label(explicitCharacterNameSource || String(msg.who || '').replace(/\s+\(GM\)$/i, '').trim());
            const lower = content.toLowerCase();
            const attack = this.parseAttackRoll(msg, fields, advanced);
            const damageRolls = this.parseDamageRolls(msg, fields, advanced, attack);
            const damageTotal = damageRolls.length
                ? damageRolls.reduce((sum, entry) => sum + Math.max(0, Utils.toInt(entry.total, 0)), 0)
                : Math.max(0, Utils.toInt(advanced && advanced.damageTotal, 0));
            const hasDamage = damageRolls.length > 0 || (advanced && advanced.isDamage);
            const healingSignalText = String(fields.dmg1type || fields.damage_type || fields.damagetype || fields.hldmgtype || fields.healingtype || fields.rname || fields.name || '');
            const temporaryHitPointsSignal = /\btemporary\s+hit\s+points?\b/i.test(healingSignalText) || /\btemporary\s+hit\s+points?\b/i.test(content) || /\btemp(?:orary)?\s*hp\b/i.test(healingSignalText) || /\btemp(?:orary)?\s*hp\b/i.test(content);
            const explicitHealing = (advanced && advanced.isHealing) || temporaryHitPointsSignal || /\b(healing|heal)\b/i.test(healingSignalText);
            const rollLabelText = [
                msg.rolltemplate,
                explicitAttackNameSource,
                fields.rname,
                fields.rollname,
                fields.name
            ].join(' ');
            const normalizedRollLabel = Utils.normalizeName(rollLabelText);
            const looksLikeInitiative = normalizedRollLabel.indexOf('initiative') >= 0 || normalizedRollLabel.indexOf('init') >= 0;
            const attackFieldValue = String(fields.attack || '').trim();
            const attackFieldIsRoll = !!attackFieldValue &&
                !/^[01]$/.test(attackFieldValue) &&
                (/\$\[\[\d+\]\]/.test(attackFieldValue) || /\bd20\b/i.test(attackFieldValue) || /^[+-]?\d+(?:\.\d+)?$/.test(attackFieldValue));
            const templateName = String(msg.rolltemplate || '').trim().toLowerCase();
            const attackTemplateSignal = /(?:^|[^a-z])(?:atk|attack|npcatk|npcfullatk)(?:[^a-z]|$)/i.test(templateName) && templateName !== 'dmg' && templateName !== 'npcdmg';
            const hasAttackSignal = !!(
                fields.r1 ||
                fields.r2 ||
                fields.atk ||
                fields.roll ||
                attackFieldIsRoll ||
                /\{\{r1=/.test(lower) ||
                /\{\{atk=1\}\}/i.test(content) ||
                attackTemplateSignal
            );
            const looksLikeAttack = !looksLikeInitiative && ((advanced && advanced.isAttack) || hasAttackSignal);
            const looksLikeDamage = hasDamage || /dmg\d*=|\{\{dmg=|\{\{globaldamage=|\{\{hldmg=|\{\{healing=|\{\{heal=/.test(lower);
            const saveAbility = CombatService.normalizeAbilityName((advanced && advanced.saveAbility) || attack.saveAbility || fields.saveability || fields.saveattr || '');
            const saveDc = Math.max(0, Utils.toInt((advanced && advanced.saveDc) || attack.saveDc || 0, 0));

            if (!looksLikeAttack && !looksLikeDamage && !explicitHealing) return null;

            return {
                characterName,
                hasExplicitCharacterName: !!String(explicitCharacterNameSource || '').trim(),
                tokenName: characterName || 'Token',
                tokenImgsrc: R20.getTokenImageByCharacterName(characterName),
                attackName,
                hasExplicitAttackName: !!String(explicitAttackNameSource || '').trim(),
                isAttack: !!looksLikeAttack,
                isDamage: !!looksLikeDamage && !explicitHealing,
                isHealing: !!explicitHealing,
                isTempHealing: !!(advanced && advanced.isTempHealing) || temporaryHitPointsSignal,
                attackTotal: Math.max(0, Utils.toInt(attack.total, 0)),
                hasAttackRoll: !!attack.hasAttackRoll,
                attackNatural: attack.natural,
                isCritical: !!attack.isCritical,
                rollMode: attack.mode || 'normal',
                saveDc,
                saveAbility,
                isSaveAttack: saveDc > 0,
                halfOnSuccess: !!((advanced && advanced.halfOnSuccess) || attack.halfOnSuccess),
                halfOnSuccessKnown: !!((advanced && advanced.halfOnSuccessKnown) || attack.halfOnSuccessKnown),
                damageType: damageRolls.length ? damageRolls[0].damageType : ((advanced && advanced.damageType) || 'normal'),
                damageTotal,
                healTotal: damageTotal,
                damageFormula: damageRolls.map((entry) => entry.formula || 'Roll20').join(' + ') || 'Roll20',
                damageRolls
            };
        },

        capturedRollKey(characterName, attackName) {
            return Utils.normalizeName(characterName) + '::' + Utils.normalizeName(attackName);
        },

        rememberAttack(entry) {
            const root = State.get();
            root.recentAttacks = root.recentAttacks || {};
            root.recentAttackQueue = Array.isArray(root.recentAttackQueue) ? root.recentAttackQueue : [];
            const next = Object.assign({}, entry, { timestamp: Date.now() });
            const key = this.capturedRollKey(next.characterName, next.attackName);
            root.recentAttacks[key] = next;
            root.recentAttackQueue.push(next);
            this.pruneRecentAttacks();
            return next;
        },

        pruneRecentAttacks() {
            const root = State.get();
            const now = Date.now();
            root.recentAttackQueue = (root.recentAttackQueue || []).filter((entry) => entry && now - Number(entry.timestamp || 0) <= 60000).slice(-20);
            Object.keys(root.recentAttacks || {}).forEach((key) => {
                if (now - Number(root.recentAttacks[key] && root.recentAttacks[key].timestamp || 0) > 60000) delete root.recentAttacks[key];
            });
        },

        findRecentAttack(characterName, attackName) {
            this.pruneRecentAttacks();
            const root = State.get();
            const direct = root.recentAttacks[this.capturedRollKey(characterName, attackName)];
            if (direct) return direct;
            const normalizedCharacter = Utils.normalizeName(characterName);
            const normalizedAttack = Utils.normalizeName(attackName);
            for (let i = (root.recentAttackQueue || []).length - 1; i >= 0; i -= 1) {
                const entry = root.recentAttackQueue[i];
                if (!entry) continue;
                const entryCharacter = Utils.normalizeName(entry.characterName);
                const entryAttack = Utils.normalizeName(entry.attackName);
                if (normalizedCharacter && entryCharacter && normalizedCharacter !== entryCharacter) continue;
                if (normalizedAttack && entryAttack && normalizedAttack !== entryAttack && normalizedAttack.indexOf(entryAttack) < 0 && entryAttack.indexOf(normalizedAttack) < 0) continue;
                return entry;
            }
            return null;
        },

        clearRecentAttack(entry) {
            if (!entry) return;
            const root = State.get();
            delete root.recentAttacks[this.capturedRollKey(entry.characterName, entry.attackName)];
        },

        makePendingNativeSaveId() {
            return 'save_' + String(Date.now()) + '_' + Math.random().toString(36).slice(2, 10);
        },

        makePendingNativeInitiativeId() {
            return 'init_' + String(Date.now()) + '_' + Math.random().toString(36).slice(2, 10);
        },

        makePendingNativeInitiativeBatchId() {
            return 'init_batch_' + String(Date.now()) + '_' + Math.random().toString(36).slice(2, 10);
        },

        prunePendingNativeSaves(maxAgeMs) {
            const root = State.get();
            root.pendingNativeSaves = root.pendingNativeSaves || {};
            const now = Date.now();
            const maxAge = Math.max(10000, Utils.toInt(maxAgeMs, 120000));
            Object.keys(root.pendingNativeSaves).forEach((key) => {
                const entry = root.pendingNativeSaves[key];
                const createdAt = Math.max(0, Utils.toInt(entry && entry.createdAt, 0));
                if (!createdAt || now - createdAt > maxAge) delete root.pendingNativeSaves[key];
            });
        },

        createPendingNativeSave(entry) {
            this.prunePendingNativeSaves();
            const root = State.get();
            root.pendingNativeSaves = root.pendingNativeSaves || {};
            const requestId = this.makePendingNativeSaveId();
            root.pendingNativeSaves[requestId] = Object.assign({}, entry || {}, {
                id: requestId,
                kind: 'saving',
                characterName: String(entry && entry.characterName || '').trim(),
                normalizedCharacter: Utils.normalizeName(entry && entry.characterName || ''),
                rollName: String(entry && entry.rollName || '').trim(),
                normalizedRollName: Utils.normalizeName(entry && entry.rollName || ''),
                tokenId: String(entry && entry.tokenId || '').trim(),
                characterId: String(entry && entry.characterId || '').trim(),
                createdAt: Date.now()
            });
            return requestId;
        },

        consumePendingNativeSaveById(requestId) {
            this.prunePendingNativeSaves();
            const root = State.get();
            root.pendingNativeSaves = root.pendingNativeSaves || {};
            const safeRequestId = String(requestId || '').trim();
            if (!safeRequestId || !root.pendingNativeSaves[safeRequestId]) return null;
            const entry = root.pendingNativeSaves[safeRequestId];
            delete root.pendingNativeSaves[safeRequestId];
            return entry || null;
        },

        prunePendingNativeInitiatives(maxAgeMs) {
            const root = State.get();
            root.pendingNativeInitiatives = root.pendingNativeInitiatives || {};
            root.pendingNativeInitiativeBatches = root.pendingNativeInitiativeBatches || {};
            const now = Date.now();
            const maxAge = Math.max(10000, Utils.toInt(maxAgeMs, 120000));
            Object.keys(root.pendingNativeInitiatives).forEach((key) => {
                const entry = root.pendingNativeInitiatives[key];
                const createdAt = Math.max(0, Utils.toInt(entry && entry.createdAt, 0));
                if (!createdAt || now - createdAt > maxAge) delete root.pendingNativeInitiatives[key];
            });
            Object.keys(root.pendingNativeInitiativeBatches).forEach((key) => {
                const entry = root.pendingNativeInitiativeBatches[key];
                const createdAt = Math.max(0, Utils.toInt(entry && entry.createdAt, 0));
                if (!createdAt || now - createdAt > maxAge) delete root.pendingNativeInitiativeBatches[key];
            });
        },

        getTurnOrderSnapshot() {
            if (typeof Campaign !== 'function') return [];
            try {
                const parsed = JSON.parse(Campaign().get('turnorder') || '[]');
                return Array.isArray(parsed) ? parsed.filter(Boolean).map((entry) => Object.assign({}, entry)) : [];
            } catch (error) {
                return [];
            }
        },

        createPendingNativeInitiativeBatch(tokens) {
            this.prunePendingNativeInitiatives();
            const root = State.get();
            root.pendingNativeInitiativeBatches = root.pendingNativeInitiativeBatches || {};
            const tokenIds = (Array.isArray(tokens) ? tokens : [])
                .map((token) => String(token && ((Utils.isFunction(token.get) ? token.get('_id') : '') || token.id) || '').trim())
                .filter(Boolean);
            const batchId = this.makePendingNativeInitiativeBatchId();
            root.pendingNativeInitiativeBatches[batchId] = {
                id: batchId,
                tokenIds,
                results: {},
                autoQueue: [],
                activeAutoRequestId: '',
                turnorderSnapshot: this.getTurnOrderSnapshot(),
                createdAt: Date.now()
            };
            return batchId;
        },

        getPendingNativeInitiativeBatch(batchId) {
            const root = State.get();
            root.pendingNativeInitiativeBatches = root.pendingNativeInitiativeBatches || {};
            const safeBatchId = String(batchId || '').trim();
            return safeBatchId ? (root.pendingNativeInitiativeBatches[safeBatchId] || null) : null;
        },

        setNativeInitiativeAutoQueue(batchId, rolls) {
            const batch = this.getPendingNativeInitiativeBatch(batchId);
            if (!batch) return false;
            batch.autoQueue = (Array.isArray(rolls) ? rolls : [])
                .map((roll, index) => ({
                    requestId: String(roll && roll.requestId || '').trim(),
                    nativeCommand: String(roll && roll.nativeCommand || '').trim(),
                    tokenName: String(roll && roll.tokenName || 'Token').trim(),
                    index,
                    status: 'pending'
                }))
                .filter((roll) => roll.requestId && roll.nativeCommand);
            batch.activeAutoRequestId = '';
            return batch.autoQueue.length > 0;
        },

        advanceNativeInitiativeAutoQueue(batchId) {
            const batch = this.getPendingNativeInitiativeBatch(batchId);
            if (!batch || !Array.isArray(batch.autoQueue)) return false;
            if (String(batch.activeAutoRequestId || '').trim()) return false;
            const next = batch.autoQueue.find((entry) => entry && entry.status === 'pending');
            if (!next) return false;
            next.status = 'waiting';
            batch.activeAutoRequestId = next.requestId;
            setTimeout(() => {
                try {
                    R20.send(next.nativeCommand);
                } catch (error) {
                    Logger.error('[initiative-auto-roll]', error && error.message ? error.message : String(error));
                    next.status = 'failed';
                    batch.activeAutoRequestId = '';
                    this.advanceNativeInitiativeAutoQueue(batchId);
                }
            }, 100);
            return true;
        },

        formatInitiativeValue(value) {
            const safeValue = Math.round(Utils.toNumber(value, 0) * 100) / 100;
            return Number.isInteger(safeValue) ? String(safeValue) : safeValue.toFixed(2).replace(/0+$/g, '').replace(/\.$/, '');
        },

        getCurrentTurnOrder() {
            if (typeof Campaign !== 'function') return [];
            try {
                const parsed = JSON.parse(Campaign().get('turnorder') || '[]');
                return Array.isArray(parsed) ? parsed.filter(Boolean).map((entry) => Object.assign({}, entry)) : [];
            } catch (error) {
                return [];
            }
        },

        getTokenPageId(tokenId) {
            const token = R20.getTokenById(tokenId);
            return token && Utils.isFunction(token.get) ? String(token.get('_pageid') || '').trim() : '';
        },

        makeTurnOrderEntry(tokenId, initiativeTotal) {
            const safeTokenId = String(tokenId || '').trim();
            const entry = { id: safeTokenId, pr: this.formatInitiativeValue(initiativeTotal), custom: '' };
            const pageId = this.getTokenPageId(safeTokenId);
            if (pageId) entry._pageid = pageId;
            return entry;
        },

        updateTurnOrderWithInitiativeResults(results, options) {
            options = options || {};
            const safeResults = (Array.isArray(results) ? results : [])
                .filter((result) => result && result.tokenId && result.total !== undefined && result.total !== null);
            if (!safeResults.length || typeof Campaign !== 'function') return false;

            let turnOrder = this.getCurrentTurnOrder();
            const activeTurnId = String(turnOrder[0] && turnOrder[0].id || '').trim();
            const rolledIds = {};
            const resultPr = {};
            const baselineIds = {};
            (Array.isArray(options.baselineTurnOrder) ? options.baselineTurnOrder : []).forEach((entry) => {
                const id = String(entry && entry.id || '').trim();
                if (id) baselineIds[id] = true;
            });
            safeResults.forEach((result) => {
                const id = String(result.tokenId || '').trim();
                if (id) rolledIds[id] = true;
                resultPr[this.formatInitiativeValue(result.total)] = true;
            });

            turnOrder = turnOrder.filter((entry) => {
                const id = String(entry && entry.id || '').trim();
                if (!id) return true;
                if (rolledIds[id]) return false;
                if (options.cleanupNativePr && !baselineIds[id] && resultPr[String(entry && entry.pr || '')]) return false;
                return true;
            });
            safeResults.forEach((result) => {
                turnOrder.push(this.makeTurnOrderEntry(result.tokenId, result.total));
            });
            turnOrder.sort((a, b) => Utils.toNumber(b && b.pr, 0) - Utils.toNumber(a && a.pr, 0));

            if (activeTurnId) {
                const activeIndex = turnOrder.findIndex((entry) => String(entry && entry.id || '').trim() === activeTurnId);
                if (activeIndex > 0) turnOrder = turnOrder.slice(activeIndex).concat(turnOrder.slice(0, activeIndex));
            }

            const firstPageId = String((safeResults.find((result) => String(result.pageId || '').trim()) || {}).pageId || this.getTokenPageId(safeResults[0].tokenId) || '').trim();
            const before = this.getCurrentTurnOrder();
            Campaign().set('turnorder', JSON.stringify(turnOrder));
            if (firstPageId) Campaign().set('initiativepage', firstPageId);
            this.debugTurnOrderWrite('Native Initiative Update', before, turnOrder);
            return true;
        },

        debugTurnOrderWrite(source, before, after) {
            if (!RuntimeConfig.get('DEBUG')) return;
            Render.sendPublicMessage(
                'Turn Order Debug',
                '<div style="text-align:left;font-size:11px;line-height:13px;">' +
                    '<strong>Source:</strong> ' + Utils.escapeHtml(String(source || 'Unknown')) + '<br>' +
                    '<strong>Before:</strong><br><code>' + Utils.escapeHtml(JSON.stringify(before || [])) + '</code><br>' +
                    '<strong>After:</strong><br><code>' + Utils.escapeHtml(JSON.stringify(after || [])) + '</code>' +
                '</div>',
                'normal'
            );
        },

        createPendingNativeInitiative(entry) {
            this.prunePendingNativeInitiatives();
            const root = State.get();
            root.pendingNativeInitiatives = root.pendingNativeInitiatives || {};
            root.pendingNativeInitiativeSeq = Math.max(0, Utils.toInt(root.pendingNativeInitiativeSeq, 0)) + 1;
            const requestId = this.makePendingNativeInitiativeId();
            root.pendingNativeInitiatives[requestId] = Object.assign({}, entry || {}, {
                id: requestId,
                kind: 'initiative',
                characterName: String(entry && entry.characterName || '').trim(),
                normalizedCharacter: Utils.normalizeName(entry && entry.characterName || ''),
                tokenId: String(entry && entry.tokenId || '').trim(),
                characterId: String(entry && entry.characterId || '').trim(),
                batchId: String(entry && entry.batchId || '').trim(),
                sequence: root.pendingNativeInitiativeSeq,
                createdAt: Date.now()
            });
            return requestId;
        },

        removePendingNativeInitiativeById(requestId) {
            const safeRequestId = String(requestId || '').trim();
            if (!safeRequestId) return false;
            const root = State.get();
            root.pendingNativeInitiatives = root.pendingNativeInitiatives || {};
            if (!root.pendingNativeInitiatives[safeRequestId]) return false;
            delete root.pendingNativeInitiatives[safeRequestId];
            return true;
        },

        resolvePendingNativeSave(characterName, rollName) {
            this.prunePendingNativeSaves();
            const root = State.get();
            root.pendingNativeSaves = root.pendingNativeSaves || {};
            const normalizedCharacter = Utils.normalizeName(characterName);
            const normalizedRoll = Utils.normalizeName(rollName);
            const entries = Object.keys(root.pendingNativeSaves)
                .map((key) => root.pendingNativeSaves[key])
                .filter(Boolean)
                .sort((a, b) => Utils.toInt(a.createdAt, 0) - Utils.toInt(b.createdAt, 0));
            if (!entries.length) return null;

            const matches = entries.filter((entry) => {
                if (entry.normalizedCharacter && normalizedCharacter && entry.normalizedCharacter !== normalizedCharacter) return false;
                if (!entry.normalizedRollName || !normalizedRoll) return true;
                return normalizedRoll.indexOf(entry.normalizedRollName) >= 0 || entry.normalizedRollName.indexOf(normalizedRoll) >= 0;
            });
            let entry = matches[0] || null;
            if (!entry && entries.length === 1 && !normalizedRoll) {
                const only = entries[0];
                if (!normalizedCharacter || !only.normalizedCharacter || only.normalizedCharacter === normalizedCharacter) entry = only;
            }
            if (!entry) return null;
            delete root.pendingNativeSaves[entry.id];
            return entry;
        },

        resolvePendingNativeInitiative(characterName) {
            this.prunePendingNativeInitiatives();
            const root = State.get();
            root.pendingNativeInitiatives = root.pendingNativeInitiatives || {};
            const normalizedCharacter = Utils.normalizeName(characterName);
            const entries = Object.keys(root.pendingNativeInitiatives)
                .map((key) => root.pendingNativeInitiatives[key])
                .filter(Boolean)
                .sort((a, b) => {
                    const seqDiff = Utils.toInt(a.sequence, 0) - Utils.toInt(b.sequence, 0);
                    return seqDiff || (Utils.toInt(a.createdAt, 0) - Utils.toInt(b.createdAt, 0));
                });
            if (!entries.length) return null;
            let entry = entries.find((candidate) => {
                if (!normalizedCharacter) return true;
                if (!candidate.normalizedCharacter) return false;
                return candidate.normalizedCharacter === normalizedCharacter;
            }) || null;
            if (!entry && !normalizedCharacter) entry = entries[0];
            if (!entry) return null;
            delete root.pendingNativeInitiatives[entry.id];
            return entry;
        },

        recordPendingNativeInitiativeResult(tokenId, initiativeTotal, batchId, requestId) {
            const safeTokenId = String(tokenId || '').trim();
            const batch = this.getPendingNativeInitiativeBatch(batchId);
            if (!safeTokenId || !batch) return false;
            batch.results = batch.results || {};
            batch.results[safeTokenId] = Math.round(Utils.toNumber(initiativeTotal, 0) * 100) / 100;
            const knownResults = [];
            (Array.isArray(batch.tokenIds) ? batch.tokenIds : []).forEach((id) => {
                const knownTokenId = String(id || '').trim();
                if (!knownTokenId || !Object.prototype.hasOwnProperty.call(batch.results || {}, knownTokenId)) return;
                knownResults.push({
                    tokenId: knownTokenId,
                    pageId: this.getTokenPageId(knownTokenId),
                    total: batch.results[knownTokenId]
                });
            });
            this.updateTurnOrderWithInitiativeResults(knownResults, {
                baselineTurnOrder: batch.turnorderSnapshot,
                cleanupNativePr: true
            });
            const safeRequestId = String(requestId || '').trim();
            if (safeRequestId && String(batch.activeAutoRequestId || '').trim() === safeRequestId) {
                const active = (Array.isArray(batch.autoQueue) ? batch.autoQueue : [])
                    .find((entry) => entry && String(entry.requestId || '').trim() === safeRequestId);
                if (active) active.status = 'done';
                batch.activeAutoRequestId = '';
                setTimeout(() => this.advanceNativeInitiativeAutoQueue(batchId), 150);
            }
            const expectedIds = (Array.isArray(batch.tokenIds) ? batch.tokenIds : [])
                .map((id) => String(id || '').trim())
                .filter(Boolean);
            const complete = expectedIds.length > 0 && expectedIds.every((id) => Object.prototype.hasOwnProperty.call(batch.results || {}, id));
            if (complete) this.schedulePendingNativeInitiativeBatchFlush(batchId, 250);
            return true;
        },

        schedulePendingNativeInitiativeBatchFlush(batchId, delayMs) {
            const safeBatchId = String(batchId || '').trim();
            if (!safeBatchId) return;
            if (INITIATIVE_BATCH_TIMERS[safeBatchId]) clearTimeout(INITIATIVE_BATCH_TIMERS[safeBatchId]);
            INITIATIVE_BATCH_TIMERS[safeBatchId] = setTimeout(() => {
                delete INITIATIVE_BATCH_TIMERS[safeBatchId];
                try {
                    this.flushPendingNativeInitiativeBatch(safeBatchId);
                } catch (error) {
                    Logger.error('[initiative-batch-flush]', error && error.message ? error.message : String(error));
                }
            }, Math.max(100, Utils.toInt(delayMs, 600)));
        },

        flushPendingNativeInitiativeBatch(batchId) {
            const batch = this.getPendingNativeInitiativeBatch(batchId);
            if (!batch) return false;
            const root = State.get();
            root.pendingNativeInitiativeBatches = root.pendingNativeInitiativeBatches || {};
            delete root.pendingNativeInitiativeBatches[String(batchId || '').trim()];
            return true;
        },

        getRollTemplateBlocks(content) {
            const source = String(content || '');
            const blocks = [];
            const pattern = /<rolltemplate\b[\s\S]*?<\/rolltemplate>/gi;
            let match = null;
            while ((match = pattern.exec(source)) !== null) {
                if (match[0]) blocks.push(match[0]);
            }
            return blocks.length ? blocks : [source];
        },

        extractNativeInitiativeRolls(msg, parsed) {
            const content = String(msg && msg.content || '');
            const rolls = [];
            const blocks = this.getRollTemplateBlocks(content);
            const isInitiativeLabel = (value) => {
                const normalized = Utils.normalizeName(value || '');
                return normalized.indexOf('initiative') >= 0 || normalized.indexOf('init') >= 0;
            };
            const isInitiativeFields = (fields, block, advanced) => {
                const label = [
                    msg && msg.rolltemplate,
                    advanced && advanced.attackName,
                    fields && fields.rname,
                    fields && fields.rollname,
                    fields && fields.name
                ].join(' ');
                return isInitiativeLabel(label) || /\binitiative\b/i.test(block || '');
            };

            blocks.forEach((block) => {
                const advanced = this.parseAdvancedHtml(block);
                const fields = this.getRollTemplateFields(block);
                if (!isInitiativeFields(fields, block, advanced)) return;
                const attack = this.parseAttackRoll(msg, fields, advanced);
                const resultMatch = String(block || '').match(/data-result="([+-]?\d+(?:\.\d+)?)"/i);
                const total = attack && attack.total !== null && attack.total !== undefined
                    ? Utils.toNumber(attack.total, 0)
                    : (advanced && advanced.attackTotal !== null && advanced.attackTotal !== undefined
                        ? Utils.toNumber(advanced.attackTotal, 0)
                        : (resultMatch ? Utils.toNumber(resultMatch[1], 0) : null));
                if (total === null || total === undefined || Number.isNaN(Number(total))) return;
                rolls.push({
                    characterName: (advanced && advanced.characterName) || fields.charname || '',
                    total
                });
            });

            if (!rolls.length && parsed) {
                const rollName = parsed.attackName ? String(parsed.attackName || '') : '';
                if (!rollName || isInitiativeLabel(rollName)) {
                    const total = this.extractCapturedRollTotal(msg, parsed);
                    if (total !== null && total !== undefined && !Number.isNaN(Number(total))) {
                        rolls.push({
                            characterName: parsed.characterName || '',
                            total
                        });
                    }
                }
            }

            if (!rolls.length && /\binitiative\b/i.test(content)) {
                const totals = [];
                const resultPattern = /data-result="([+-]?\d+(?:\.\d+)?)"/gi;
                let resultMatch = null;
                while ((resultMatch = resultPattern.exec(content)) !== null) {
                    totals.push(Utils.toNumber(resultMatch[1], 0));
                }
                totals.forEach((total) => {
                    if (total !== null && total !== undefined && !Number.isNaN(Number(total))) {
                        rolls.push({
                            characterName: '',
                            total
                        });
                    }
                });
            }

            return rolls;
        },

        async handlePendingNativeInitiativeCapture(parsed, msg) {
            const root = State.get();
            if (!root.pendingNativeInitiatives || !Object.keys(root.pendingNativeInitiatives).length) return false;
            if (!msg || msg.type === 'api') return false;
            const content = String(msg && msg.content || '');
            const rolls = this.extractNativeInitiativeRolls(msg, parsed);
            if (!rolls.length) return false;
            let applied = 0;
            rolls.forEach((roll) => {
                const characterName = roll.characterName || '';
                const pending = this.resolvePendingNativeInitiative(characterName);
                if (!pending) return;
                if (this.recordPendingNativeInitiativeResult(pending.tokenId, roll.total, pending.batchId, pending.id)) applied += 1;
            });
            return applied > 0;
        },

        extractCapturedRollTotal(msg, parsed) {
            const content = String(msg && msg.content || '');
            const advanced = this.parseAdvancedHtml(content);
            if (advanced && advanced.attackTotal !== null && advanced.attackTotal !== undefined) return Utils.toNumber(advanced.attackTotal, 0);
            if (parsed && parsed.attackTotal !== undefined && parsed.attackTotal !== null) return Utils.toNumber(parsed.attackTotal, 0);
            const resultMatch = content.match(/data-result="([+-]?\d+(?:\.\d+)?)"/i);
            if (resultMatch) return Utils.toNumber(resultMatch[1], 0);
            const rolls = Array.isArray(msg && msg.inlinerolls) ? msg.inlinerolls : [];
            for (let i = 0; i < rolls.length; i += 1) {
                if (rolls[i] && rolls[i].results && rolls[i].results.total !== undefined && rolls[i].results.total !== null) {
                    return Utils.toNumber(rolls[i].results.total, 0);
                }
            }
            return null;
        },

        async handlePendingNativeSaveCapture(parsed, msg) {
            const root = State.get();
            if (!root.pendingNativeSaves || !Object.keys(root.pendingNativeSaves).length) return false;
            if (!msg || msg.type === 'api') return false;
            const total = this.extractCapturedRollTotal(msg, parsed);
            if (total === null || total === undefined || Number.isNaN(Number(total))) return false;
            const characterName = parsed && parsed.characterName ? parsed.characterName : String(msg.who || '').replace(/\s+\(GM\)$/i, '').trim();
            const rollName = parsed && parsed.attackName ? parsed.attackName : '';
            const pending = this.resolvePendingNativeSave(characterName, rollName);
            if (!pending) return false;
            const token = R20.getTokenById(pending.tokenId);
            if (!token) {
                Render.sendWhisperMessage(pending.requestedBy || 'GM', 'Damage Blocked', 'The pending saving throw target token was not found.', 'failure');
                return true;
            }
            const payload = Object.assign({}, pending.payload || {}, {
                nativeSaveTotal: total,
                nativeSaveRollName: rollName,
                nativeSaveCharacterName: characterName
            });
            const result = await CombatService.applyDamageToToken(token, payload);
            if (!result.ok) {
                Render.sendWhisperMessage(pending.requestedBy || 'GM', 'Damage Blocked', result.message || 'Could not apply damage after the saving throw.', 'failure');
                return true;
            }
            Render.sendDamageResult(result);
            return true;
        },

        sendPlayerPrompt(result) {
            const isHealing = !!result.isHealing;
            if (isHealing && !RuntimeConfig.get('PLAYER_HEALING_BUTTON')) return false;
            if (!isHealing && !RuntimeConfig.get('PLAYER_ATTACK_BUTTON')) return false;
            const token = R20.resolveRollSourceToken(result, result.playerId || '');
            const character = token ? R20.getCharacterFromToken(token) : null;
            const recipients = R20.getCharacterControllerDisplayNames(character);
            if (!recipients.length) return false;
            const casterTokenId = R20.getTokenId(token);
            const casterCharacterId = character ? String(character.id || token.get('represents') || '').trim() : '';
            const casterPageId = R20.getTokenPageId(token);
            const saveAbility = CombatService.normalizeAbilityName(result.saveAbility || '');
            const payloadObject = isHealing ? {
                type: 'heal',
                mode: result.isTempHealing ? 'temp' : 'hp',
                amount: Math.max(0, Utils.toInt(result.healTotal || result.damageTotal, 0)),
                sourceName: String(result.tokenName || result.characterName || 'Caster'),
                sourceAction: String(result.attackName || 'Healing'),
                sourceImgsrc: String((token && token.get('imgsrc')) || result.tokenImgsrc || ''),
                casterTokenId,
                casterCharacterId,
                casterPageId
            } : {
                type: 'damage',
                mode: result.isSaveAttack || saveAbility ? 'save' : 'attack',
                challenge: Math.max(0, Utils.toInt(result.saveDc || result.attackTotal, 0)),
                saveAbility,
                halfOnSuccess: !!result.halfOnSuccess,
                halfOnSuccessKnown: !!result.halfOnSuccessKnown,
                damageRolls: Array.isArray(result.damageRolls) && result.damageRolls.length
                    ? result.damageRolls
                    : [{ total: result.damageTotal || 0, damageType: result.damageType || 'normal', formula: result.damageFormula || 'Roll20' }],
                sourceName: String(result.tokenName || result.characterName || ''),
                sourceAction: String(result.attackName || ''),
                sourceImgsrc: String((token && token.get('imgsrc')) || result.tokenImgsrc || ''),
                casterTokenId,
                casterCharacterId,
                casterPageId
            };
            const actionId = State.createPlayerActionRequest({
                type: isHealing ? 'heal' : 'damage',
                payload: payloadObject,
                sourceTokenId: casterTokenId,
                sourceCharacterId: casterCharacterId,
                sourcePageId: casterPageId,
                characterId: casterCharacterId,
                characterName: character ? String(character.get('name') || '') : '',
                attackName: String(result.attackName || (isHealing ? 'Healing' : 'Attack'))
            });
            const command = '!combatAssistant use ' + actionId + ' &#64;{target|token_id}';
            const button = isHealing
                ? Render.iconButtonHtml({ iconHtml: result.isTempHealing ? '&#128151;' : '&#128154;', label: result.isTempHealing ? 'Temp' : 'Heal', command, backgroundColor: 'rgba(20,115,55,0.95)', tooltip: 'Choose a target token and apply this healing once' })
                : Render.iconButtonHtml({ iconHtml: '&#9876;&#65039;', label: result.isSaveAttack || saveAbility ? (CombatService.abilityNameToShortLabel(saveAbility) || 'SAVE') : 'ATK', command, backgroundColor: 'rgba(120,40,40,0.95)', tooltip: 'Choose a target token and apply this attack once' });
            const body = Render.iconButtonTableHtml([button], {
                columns: 1,
                footer: 'Single Use Button Press the button, then choose a target when Roll20 asks.'
            });
            const titleResult = Object.assign({}, result, {
                damageType: isHealing ? (result.isTempHealing ? 'temp healing' : 'healing') : result.damageType,
                damageTotal: isHealing ? (result.healTotal || result.damageTotal || 0) : result.damageTotal
            });
            recipients.forEach((recipient) => R20.whisper(recipient, Html.card({
                title: isHealing ? 'Healing Available' : 'Attack Available',
                body,
                buildOptions: { titleHtml: Render.attackPromptTitleHtml(titleResult) }
            })));
            return true;
        },

        shouldOfferAttackAndSavePrompts(result) {
            if (!result || result.isHealing) return false;
            const attackTotal = Math.max(0, Utils.toInt(result.attackTotal, 0));
            const saveDc = Math.max(0, Utils.toInt(result.saveDc, 0));
            const saveAbility = CombatService.normalizeAbilityName(result.saveAbility || '');
            const damageRolls = Array.isArray(result.damageRolls) ? result.damageRolls : [];
            const damageTotal = Math.max(0, Utils.toInt(result.damageTotal, 0));
            return !!result.hasAttackRoll && attackTotal > 0 && saveDc > 0 && !!saveAbility && (damageRolls.length > 0 || damageTotal > 0);
        },

        attackPromptVariant(result) {
            return Object.assign({}, result || {}, {
                isSaveAttack: false,
                saveDc: 0,
                saveAbility: '',
                halfOnSuccess: false,
                halfOnSuccessKnown: false
            });
        },

        savePromptVariant(result) {
            return Object.assign({}, result || {}, {
                isSaveAttack: true,
                saveAbility: CombatService.normalizeAbilityName(result && result.saveAbility || ''),
                saveDc: Math.max(0, Utils.toInt(result && result.saveDc, 0))
            });
        },

        sendAttackDamagePrompts(result) {
            if (this.shouldOfferAttackAndSavePrompts(result)) {
                R20.whisper('GM', Render.showAttackDamagePrompt(this.attackPromptVariant(result)));
                R20.whisper('GM', Render.showAttackDamagePrompt(this.savePromptVariant(result)));
                return;
            }
            R20.whisper('GM', Render.showAttackDamagePrompt(result));
            this.sendPlayerPrompt(result);
        },

        async handleChatMessage(msg) {
            if (!RuntimeConfig.get('CHAT_TRACKING')) return;
            const parsed = this.parseMessage(msg);
            if (parsed) parsed.playerId = String(msg && msg.playerid || '').trim();
            if (await this.handlePendingNativeInitiativeCapture(parsed, msg)) return;
            if (await this.handlePendingNativeSaveCapture(parsed, msg)) return;
            if (!parsed) return;
            Logger.debug('[Roll capture]', JSON.stringify({ name: parsed.attackName, char: parsed.characterName, attack: parsed.isAttack, damage: parsed.isDamage, healing: parsed.isHealing, total: parsed.attackTotal, damage: parsed.damageTotal }));

            if (parsed.isHealing) {
                const healResult = Object.assign({}, parsed, {
                    effectType: 'healing',
                    healMode: parsed.isTempHealing ? 'temp' : 'hp',
                    damageType: parsed.isTempHealing ? 'temp healing' : 'healing',
                    damageTotal: parsed.healTotal
                });
                R20.whisper('GM', Render.showAttackDamagePrompt(healResult));
                this.sendPlayerPrompt(healResult);
                return;
            }

            if (parsed.isAttack && !parsed.isDamage) {
                this.rememberAttack(parsed);
                return;
            }

            if (parsed.isAttack && parsed.isDamage) {
                this.sendAttackDamagePrompts(parsed);
                this.rememberAttack(parsed);
                return;
            }

            if (parsed.isDamage) {
                const prior = this.findRecentAttack(
                    parsed.hasExplicitCharacterName ? parsed.characterName : '',
                    parsed.hasExplicitAttackName ? parsed.attackName : ''
                );
                if (!prior && !parsed.isSaveAttack) return;
                const result = Object.assign({}, parsed, {
                    tokenName: (prior && prior.tokenName) || parsed.tokenName,
                    tokenImgsrc: (prior && prior.tokenImgsrc) || parsed.tokenImgsrc,
                    attackName: (prior && prior.attackName) || parsed.attackName,
                    attackTotal: Math.max(0, Utils.toInt(prior && prior.attackTotal, parsed.attackTotal || 0)),
                    hasAttackRoll: !!((prior && prior.hasAttackRoll) || parsed.hasAttackRoll),
                    rollMode: (prior && prior.rollMode) || parsed.rollMode,
                    saveDc: Math.max(0, Utils.toInt(parsed.saveDc || (prior && prior.saveDc), 0)),
                    saveAbility: parsed.saveAbility || (prior && prior.saveAbility) || '',
                    isSaveAttack: !!(parsed.saveDc || (prior && prior.saveDc)),
                    halfOnSuccess: !!(parsed.halfOnSuccess || (prior && prior.halfOnSuccess)),
                    halfOnSuccessKnown: !!(parsed.halfOnSuccessKnown || (prior && prior.halfOnSuccessKnown))
                });
                this.sendAttackDamagePrompts(result);
                if (prior) this.clearRecentAttack(prior);
            }
        }
    };

    /** -----------------------------------------------------------------------
     * Combat service
     * --------------------------------------------------------------------- */
    const CombatService = {
        normalizeDamageType(type) {
            const raw = String(type || '').trim().toLowerCase();
            if (!raw || raw === '-' || raw === 'none') return 'normal';
            if (/\btemporary\s+hit\s+points?\b/i.test(raw) || /\btemp(?:orary)?\s*hp\b/i.test(raw) || /\btemp\s+healing\b/i.test(raw)) return 'temp healing';
            const known = Object.keys(CONFIG.DAMAGE_TYPE_COLORS);
            for (let i = 0; i < known.length; i += 1) {
                if (raw === known[i] || raw.indexOf(known[i]) >= 0) return known[i];
            }
            if (/heal/i.test(raw)) return 'healing';
            return raw.replace(/[^a-z\s-]+/g, '').replace(/\s+/g, ' ').trim() || 'normal';
        },

        normalizeAbilityName(value) {
            const key = String(value || '').trim().toLowerCase();
            return ABILITY_ALIASES[key] || '';
        },

        abilityNameToShortLabel(value) {
            const ability = this.normalizeAbilityName(value);
            return ABILITIES[ability] || '';
        },

        getBarNumber(key) {
            return Utils.clamp(Utils.toInt(RuntimeConfig.get(key), key === 'TEMP_HP_BAR' ? 0 : 1), key === 'TEMP_HP_BAR' ? 0 : 1, 3);
        },

        getTokenName(token) {
            if (!token || !Utils.isFunction(token.get)) return 'Target';
            return String(token.get('name') || 'Target').trim() || 'Target';
        },

        getBar(token, barNumber) {
            const bar = Utils.toInt(barNumber, 0);
            if (!token || bar < 1 || bar > 3) return { ok: false, message: 'Invalid token bar.' };
            const prefix = 'bar' + String(bar) + '_';
            const valueRaw = token.get(prefix + 'value');
            const maxRaw = token.get(prefix + 'max');
            const linkRaw = token.get(prefix + 'link');
            const value = valueRaw === undefined || valueRaw === null || String(valueRaw).trim() === '' ? 0 : Utils.toNumber(valueRaw, 0);
            const max = maxRaw === undefined || maxRaw === null || String(maxRaw).trim() === '' ? null : Utils.toNumber(maxRaw, null);
            const link = String(linkRaw || '').trim();
            return { ok: true, bar, value, max, link, prefix };
        },

        linkedBarMatches(token, barNumber, attrName) {
            const bar = this.getBar(token, barNumber);
            if (!bar.ok || !bar.link) return false;
            const wanted = String(attrName || '').trim().toLowerCase();
            const rawLink = String(bar.link || '').trim().toLowerCase();
            if (rawLink === wanted) return true;
            const attr = getObj('attribute', bar.link);
            return !!(attr && Utils.isFunction(attr.get) && String(attr.get('name') || '').trim().toLowerCase() === wanted);
        },

        getBarNumberForAttribute(token, attrName, configKey) {
            const wanted = String(attrName || '').trim().toLowerCase();
            for (let i = 1; i <= 3; i += 1) {
                if (this.linkedBarMatches(token, i, wanted)) return i;
            }
            return this.getBarNumber(configKey);
        },

        findCharacterAttribute(characterId, attrName) {
            const safeCharacterId = String(characterId || '').trim();
            const wanted = String(attrName || '').trim().toLowerCase();
            if (!safeCharacterId || !wanted) return null;
            const attrs = findObjs({ _type: 'attribute', _characterid: safeCharacterId }) || [];
            for (let i = 0; i < attrs.length; i += 1) {
                const attr = attrs[i];
                if (!attr || !Utils.isFunction(attr.get)) continue;
                if (String(attr.get('name') || '').trim().toLowerCase() === wanted) return attr;
            }
            return null;
        },

        findLinkedOrNamedAttribute(token, barNumber, attrName) {
            const character = R20.getCharacterFromToken(token);
            const characterId = character ? String(character.id || token.get('represents') || '').trim() : '';
            const wanted = String(attrName || '').trim().toLowerCase();
            const bar = this.getBar(token, barNumber);
            if (bar.ok && bar.link) {
                const linked = getObj('attribute', bar.link);
                if (linked && Utils.isFunction(linked.get) && String(linked.get('name') || '').trim().toLowerCase() === wanted) {
                    return linked;
                }
            }
            return this.findCharacterAttribute(characterId, wanted);
        },

        setBarValue(token, barNumber, value) {
            const bar = Utils.toInt(barNumber, 0);
            if (!token || bar < 1 || bar > 3) return false;
            const props = {};
            props['bar' + String(bar) + '_value'] = value;
            token.set(props);
            return true;
        },

        shouldWriteSheetAttributeForBar(token, barNumber, attrName) {
            const safeAttr = String(attrName || '').trim().toLowerCase();
            return this.linkedBarMatches(token, barNumber, safeAttr);
        },

        setAttributeObjectCurrent(attr, value) {
            if (!attr || !Utils.isFunction(attr.get)) return { ok: false, message: 'Attribute was not found.' };
            const safeValue = String(Math.max(0, Utils.toInt(value, 0)));
            try {
                if (Utils.isFunction(attr.setWithWorker)) {
                    attr.setWithWorker({ current: safeValue });
                    return { ok: true, source: 'attribute.setWithWorker' };
                }
                if (Utils.isFunction(attr.set)) {
                    attr.set({ current: safeValue });
                    return { ok: true, source: 'attribute.set' };
                }
            } catch (error) {
                return { ok: false, message: error && error.message ? error.message : String(error) };
            }
            return { ok: false, message: 'Attribute is not writable.' };
        },

        async setCharacterSheetAttributeValue(characterId, attrName, value, options) {
            const safeCharacterId = String(characterId || '').trim();
            const safeAttrName = String(attrName || '').trim();
            const safeValue = String(Math.max(0, Utils.toInt(value, 0)));
            if (!safeCharacterId || !safeAttrName) return { ok: false, message: 'Character or attribute was not found.' };
            const opts = options || {};
            const linkedAttr = opts.token ? this.findLinkedOrNamedAttribute(opts.token, opts.barNumber, safeAttrName) : this.findCharacterAttribute(safeCharacterId, safeAttrName);
            if (linkedAttr) {
                const attrWrite = this.setAttributeObjectCurrent(linkedAttr, safeValue);
                if (attrWrite.ok) {
                    Logger.debug('[sheet-attr:set:ok]', 'characterId=' + safeCharacterId, 'attr=' + safeAttrName, 'value=' + safeValue, 'source=' + attrWrite.source);
                    return attrWrite;
                }
                Logger.debug('[sheet-attr:set:attribute-failed]', safeAttrName, attrWrite.message || 'failed');
            }
            let beaconError = '';
            Logger.debug('[sheet-attr:set:start]', 'characterId=' + safeCharacterId, 'attr=' + safeAttrName, 'value=' + safeValue, 'setSheetItem=' + String(typeof setSheetItem));
            if (typeof setSheetItem === 'function') {
                try {
                    await setSheetItem(safeCharacterId, safeAttrName, safeValue);
                    Logger.debug('[sheet-attr:set:ok]', 'characterId=' + safeCharacterId, 'attr=' + safeAttrName, 'value=' + safeValue);
                    return { ok: true, source: 'setSheetItem' };
                } catch (error) {
                    beaconError = error && error.message ? error.message : String(error);
                    Logger.debug('[setSheetItem:' + safeAttrName + ']', beaconError);
                }
            }
            return {
                ok: false,
                message: 'Could not set sheet attribute ' + safeAttrName + ' with Beacon' + (beaconError ? (': ' + beaconError) : '.')
            };
        },

        async setBarOrLinkedAttributeValue(token, barNumber, attrName, value, options) {
            const bar = this.getBar(token, barNumber);
            if (!bar.ok) return bar;
            const opts = options || {};
            const safeValue = Math.max(0, Utils.toInt(value, 0));
            if (this.shouldWriteSheetAttributeForBar(token, barNumber, attrName)) {
                const character = R20.getCharacterFromToken(token);
                const characterId = character ? String(character.id || token.get('represents') || '').trim() : '';
                const sheetWrite = await this.setCharacterSheetAttributeValue(characterId, attrName, safeValue, { token, barNumber });
                if (sheetWrite.ok) {
                    this.setBarValue(token, barNumber, safeValue);
                    return { ok: true, linked: true, source: sheetWrite.source };
                }
                if (opts.fallbackToBarIfLinkedAttrMissing) {
                    this.setBarValue(token, barNumber, safeValue);
                    return { ok: true, linked: false, fallback: true };
                }
                return sheetWrite;
            }
            if (String(bar.link || '').trim()) {
                return {
                    ok: false,
                    message: 'Bar ' + String(barNumber) + ' is linked to a different attribute. Combat Assistant will not overwrite it.'
                };
            }
            this.setBarValue(token, barNumber, safeValue);
            return { ok: true, linked: false };
        },

        readAc(token) {
            const acBar = this.getBarNumber('AC_BAR');
            const bar = this.getBar(token, acBar);
            if (bar.ok && String(bar.value).trim() !== '') return Utils.toInt(bar.value, 0);
            return 0;
        },

        getCharacterStoreAttribute(characterId) {
            const safeCharacterId = String(characterId || '').trim();
            if (!safeCharacterId) return null;
            const attrs = findObjs({ _type: 'attribute', _characterid: safeCharacterId }) || [];
            for (let i = 0; i < attrs.length; i += 1) {
                const attr = attrs[i];
                if (!attr || !Utils.isFunction(attr.get)) continue;
                if (String(attr.get('name') || '').trim().toLowerCase() === 'store') return attr;
            }
            return null;
        },

        loadCharacterStore(characterId) {
            const attr = this.getCharacterStoreAttribute(characterId);
            if (!attr) return { ok: false, message: 'Character store was not found.' };
            const current = attr.get('current');
            if (current && typeof current === 'object') return { ok: true, root: current };
            const raw = String(current || '').trim();
            if (!raw) return { ok: false, message: 'Character store is empty.' };
            try {
                const root = JSON.parse(raw);
                return root && typeof root === 'object' ? { ok: true, root } : { ok: false, message: 'Character store is not an object.' };
            } catch (error) {
                return { ok: false, message: 'Character store could not be parsed.' };
            }
        },

        getHitpointsNode(root) {
            if (!root || typeof root !== 'object' || Array.isArray(root)) return null;
            if (!root.hitpoints || typeof root.hitpoints !== 'object' || Array.isArray(root.hitpoints)) return null;
            return root.hitpoints;
        },

        getDeathSavesState(characterId) {
            const store = this.loadCharacterStore(characterId);
            if (!store.ok) return { ok: false, open: false, failures: 0, successes: 0, message: store.message };
            const hitpoints = this.getHitpointsNode(store.root);
            const deathSaves = hitpoints && hitpoints.deathSaves && typeof hitpoints.deathSaves === 'object' && !Array.isArray(hitpoints.deathSaves)
                ? hitpoints.deathSaves
                : null;
            return {
                ok: true,
                open: Utils.toBoolean(deathSaves && deathSaves.open, false),
                failures: Utils.toInt(deathSaves && deathSaves.failures, 0),
                successes: Utils.toInt(deathSaves && deathSaves.successes, 0)
            };
        },

        setTokenStatusMarker(token, marker, enabled) {
            if (!token || !Utils.isFunction(token.get) || !Utils.isFunction(token.set)) return false;
            const safeMarker = String(marker || '').trim();
            if (!safeMarker) return false;
            const current = String(token.get('statusmarkers') || '')
                .split(',')
                .map((entry) => String(entry || '').trim())
                .filter(Boolean);
            const normalized = current.filter((entry) => entry.split('@')[0] !== safeMarker);
            if (enabled) normalized.push(safeMarker);
            token.set('statusmarkers', normalized.join(','));
            return true;
        },

        normalizeTraitList(value, removePattern) {
            const raw = String(value || '').trim().toLowerCase();
            if (!raw || raw === '-' || raw === 'none') return [];
            return raw
                .replace(/\band\b/g, ',')
                .split(/[,;|/]+/)
                .map((entry) => entry
                    .replace(/\([^)]*\)/g, '')
                    .replace(removePattern || /$^/, '')
                    .trim()
                )
                .filter(Boolean)
                .filter((entry, index, list) => list.indexOf(entry) === index);
        },

        normalizeDamageTraitValue(value) {
            const values = [];
            const collect = (entry) => {
                if (entry === undefined || entry === null) return;
                if (Array.isArray(entry)) {
                    entry.forEach(collect);
                    return;
                }
                if (typeof entry === 'object') {
                    ['damage', 'type', 'value', 'name', 'label'].forEach((key) => {
                        if (Object.prototype.hasOwnProperty.call(entry, key)) collect(entry[key]);
                    });
                    return;
                }
                values.push(String(entry));
            };
            collect(value);
            return this.normalizeTraitList(values.join(','), /damage/gi);
        },

        addDamageTraitValues(traits, target, value) {
            if (!traits || !target || !Object.prototype.hasOwnProperty.call(traits, target)) return;
            this.normalizeDamageTraitValue(value).forEach((entry) => {
                if (entry && traits[target].indexOf(entry) < 0) traits[target].push(entry);
            });
        },

        readJsonDamageTraitFields(rawJson, traits) {
            if (!rawJson || !traits) return;
            let parsed = null;
            try {
                parsed = JSON.parse(String(rawJson || '').trim());
            } catch (error) {
                return;
            }
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return;
            const fields = {};
            Object.keys(parsed).forEach((key) => {
                fields[String(key || '').trim().toLowerCase()] = parsed[key];
            });
            const pick = (names) => {
                for (let i = 0; i < names.length; i += 1) {
                    const key = String(names[i] || '').trim().toLowerCase();
                    if (Object.prototype.hasOwnProperty.call(fields, key)) return fields[key];
                }
                return '';
            };
            this.addDamageTraitValues(traits, 'resistances', pick(['Resistances', 'Damage Resistances', 'Damage Resistance']));
            this.addDamageTraitValues(traits, 'immunities', pick(['Immunities', 'Damage Immunities', 'Damage Immunity']));
            this.addDamageTraitValues(traits, 'vulnerabilities', pick(['Vulnerabilities', 'Damage Vulnerabilities', 'Damage Vulnerability']));
        },

        read2014DamageTraits(characterId, traits) {
            if (!characterId || !traits) return traits;
            this.addDamageTraitValues(traits, 'resistances', this.readAttributeRaw(characterId, [
                'npc_resistances',
                'damage_resistances',
                'resistances'
            ], ''));
            this.addDamageTraitValues(traits, 'immunities', this.readAttributeRaw(characterId, [
                'npc_immunities',
                'damage_immunities',
                'immunities'
            ], ''));
            this.addDamageTraitValues(traits, 'vulnerabilities', this.readAttributeRaw(characterId, [
                'npc_vulnerabilities',
                'damage_vulnerabilities',
                'vulnerabilities'
            ], ''));
            this.readJsonDamageTraitFields(this.readAttributeRaw(characterId, ['kingdom_drop_data', 'npc'], ''), traits);
            return traits;
        },

        readStoreDamageTraits(characterId) {
            const traits = { resistances: [], immunities: [], vulnerabilities: [] };
            if (!characterId || !RuntimeConfig.get('USE_SHEET_DAMAGE_TRAITS')) return traits;
            const addTraits = (target, value) => this.addDamageTraitValues(traits, target, value);
            const walk = (node) => {
                if (!node || typeof node !== 'object') return;
                if (Array.isArray(node)) {
                    node.forEach(walk);
                    return;
                }
                const type = String(node.type || '').trim().toLowerCase();
                const hasCascades = Object.prototype.hasOwnProperty.call(node, 'cascades');
                const enabled = !Object.prototype.hasOwnProperty.call(node, '_enabled') || Utils.toBoolean(node._enabled, true);
                if (type === 'defense' && enabled && !hasCascades) {
                    const defense = String(node.defense || '').trim().toLowerCase();
                    if (defense.indexOf('resist') >= 0) addTraits('resistances', node.damage);
                    else if (defense.indexOf('immune') >= 0 || defense.indexOf('immun') >= 0) addTraits('immunities', node.damage);
                    else if (defense.indexOf('vulner') >= 0) addTraits('vulnerabilities', node.damage);
                }
                Object.keys(node).forEach((key) => walk(node[key]));
            };
            R20.getCharacterStoreDumpRoots(characterId).forEach(walk);
            this.read2014DamageTraits(characterId, traits);
            Logger.debug('[Sheet traits]', characterId, JSON.stringify(traits));
            return traits;
        },

        traitIncludes(traitText, damageType) {
            const type = this.normalizeDamageType(damageType);
            if (!type || type === 'normal' || type === 'healing' || type === 'temp healing') return false;
            const list = Array.isArray(traitText) ? traitText : this.normalizeDamageTraitValue(traitText);
            if (!list.length) return false;
            if (list.some((entry) => {
                const current = String(entry || '').trim().toLowerCase();
                return current === type || current.indexOf(type) >= 0 || type.indexOf(current) >= 0;
            })) return true;
            const text = list.join(',');
            if (type === 'bludgeoning' && /bludgeon/.test(text)) return true;
            if (type === 'piercing' && /pierc/.test(text)) return true;
            if (type === 'slashing' && /slash/.test(text)) return true;
            return false;
        },

        applyTraits(amount, damageType, traits) {
            let finalDamage = Math.max(0, Utils.toInt(amount, 0));
            const immune = this.traitIncludes(traits.immunities, damageType);
            const resistant = this.traitIncludes(traits.resistances, damageType);
            const vulnerable = this.traitIncludes(traits.vulnerabilities, damageType);
            if (immune) finalDamage = 0;
            else {
                if (resistant) finalDamage = RuntimeConfig.get('DAMAGE_ROUND_UP') ? Math.ceil(finalDamage / 2) : Math.floor(finalDamage / 2);
                if (vulnerable) finalDamage *= 2;
            }
            return { finalDamage, immune, resistant, vulnerable };
        },

        readAttributeNumber(characterId, names, fallback) {
            const safeCharacterId = String(characterId || '').trim();
            const safeNames = (Array.isArray(names) ? names : [names]).map((name) => String(name || '').trim().toLowerCase()).filter(Boolean);
            if (!safeCharacterId || !safeNames.length) return fallback;
            const attrs = findObjs({ _type: 'attribute', _characterid: safeCharacterId }) || [];
            for (let i = 0; i < attrs.length; i += 1) {
                const attr = attrs[i];
                if (!attr || !Utils.isFunction(attr.get)) continue;
                if (safeNames.indexOf(String(attr.get('name') || '').trim().toLowerCase()) < 0) continue;
                const current = attr.get('current');
                if (current !== undefined && current !== null && String(current).trim() !== '') return Utils.toInt(current, fallback);
            }
            return fallback;
        },

        readAttributeRaw(characterId, names, fallback) {
            const safeCharacterId = String(characterId || '').trim();
            const safeNames = (Array.isArray(names) ? names : [names]).map((name) => String(name || '').trim().toLowerCase()).filter(Boolean);
            if (!safeCharacterId || !safeNames.length) return fallback;
            const attrs = findObjs({ _type: 'attribute', _characterid: safeCharacterId }) || [];
            for (let i = 0; i < attrs.length; i += 1) {
                const attr = attrs[i];
                if (!attr || !Utils.isFunction(attr.get)) continue;
                if (safeNames.indexOf(String(attr.get('name') || '').trim().toLowerCase()) < 0) continue;
                const current = attr.get('current');
                if (current !== undefined && current !== null && String(current).trim() !== '') return String(current).trim();
            }
            return fallback;
        },

        read2014SavingThrowModifier(characterId, ability) {
            const safeAbility = this.normalizeAbilityName(ability);
            if (!safeAbility) return 0;
            const short = this.abilityNameToShortLabel(safeAbility).toLowerCase();
            const saveBonus = this.readAttributeNumber(characterId, [
                safeAbility + '_save_bonus',
                short + '_save_bonus',
                safeAbility + '_saving_throw_bonus',
                safeAbility + '_save_mod',
                short + '_save_mod',
                safeAbility + '_save',
                short + '_save'
            ], null);
            if (saveBonus !== null && saveBonus !== undefined) return saveBonus;
            const abilityMod = this.readAttributeNumber(characterId, [
                safeAbility + '_mod',
                short + '_mod'
            ], 0);
            const profRaw = this.readAttributeRaw(characterId, [
                safeAbility + '_save_prof',
                short + '_save_prof',
                safeAbility + '_saving_throw_prof'
            ], '');
            let proficiency = 0;
            if (profRaw) {
                const numericProf = Utils.toInt(profRaw, null);
                if (numericProf !== null && numericProf !== undefined && numericProf > 0) proficiency = numericProf;
                else if (/@\{?pb\}?|proficient|true|yes|on|1/i.test(profRaw)) proficiency = this.getProficiencyBonus(characterId);
            }
            const globalSaveBonus = this.readAttributeNumber(characterId, [
                'global_save_mod',
                'global_saving_throw_bonus',
                'globalsavingthrowbonus'
            ], 0);
            return abilityMod + proficiency + globalSaveBonus;
        },

        normalizeRollMode(mode) {
            const value = String(mode || '').trim().toLowerCase();
            if (value === 'adv' || value === 'advantage') return 'advantage';
            if (value === 'dis' || value === 'disadvantage') return 'disadvantage';
            return 'normal';
        },

        rollSavingThrowForToken(token, ability, mode) {
            if (!token) return { ok: false, message: 'Target token was not found.' };
            const character = R20.getCharacterFromToken(token);
            if (!character) return { ok: false, message: this.getTokenName(token) + ' must be linked to a character.' };
            const characterId = String(character.id || token.get('represents') || '').trim();
            const safeAbility = this.normalizeAbilityName(ability);
            if (!characterId || !safeAbility) return { ok: false, message: 'Saving throw could not be resolved.' };
            const modifier = this.read2014SavingThrowModifier(characterId, safeAbility);
            const rollMode = this.normalizeRollMode(mode);
            const roll1 = this.rollD20();
            const roll2 = rollMode === 'normal' ? null : this.rollD20();
            const natural = rollMode === 'advantage'
                ? Math.max(roll1, roll2)
                : (rollMode === 'disadvantage' ? Math.min(roll1, roll2) : roll1);
            return {
                ok: true,
                tokenId: String(token.id || token.get('_id') || '').trim(),
                tokenName: this.getTokenName(token),
                characterId,
                characterName: String(character.get('name') || this.getTokenName(token) || 'Token').trim(),
                ability: safeAbility,
                modifier,
                mode: rollMode,
                rolls: roll2 === null ? [roll1] : [roll1, roll2],
                natural,
                total: natural + modifier
            };
        },

        parseStoreList(value) {
            if (Array.isArray(value)) return value.map((entry) => String(entry || '').trim()).filter(Boolean);
            const raw = String(value || '').trim();
            if (!raw) return [];
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed.map((entry) => String(entry || '').trim()).filter(Boolean);
            } catch (ignored) {}
            return raw.split(',').map((entry) => String(entry || '').replace(/[[\]"]/g, '').trim()).filter(Boolean);
        },

        walkCharacterStore(characterId, visitor) {
            if (!Utils.isFunction(visitor)) return;
            const walk = (node, ancestorHasCascades) => {
                if (!node || typeof node !== 'object') return;
                if (Array.isArray(node)) {
                    node.forEach((entry) => walk(entry, ancestorHasCascades));
                    return;
                }
                const hasCascades = ancestorHasCascades || Object.prototype.hasOwnProperty.call(node, 'cascades');
                visitor(node, hasCascades);
                Object.keys(node).forEach((key) => walk(node[key], hasCascades));
            };
            R20.getCharacterStoreDumpRoots(characterId).forEach((root) => walk(root, false));
        },

        walkCharacterStoreIntegrants(characterId, visitor) {
            if (!Utils.isFunction(visitor)) return;
            const walk = (node, ancestorHasCascades) => {
                if (!node || typeof node !== 'object') return;
                if (Array.isArray(node)) {
                    node.forEach((entry) => walk(entry, ancestorHasCascades));
                    return;
                }
                const hasCascades = ancestorHasCascades || Object.prototype.hasOwnProperty.call(node, 'cascades');
                visitor(node, hasCascades);
                Object.keys(node).forEach((key) => walk(node[key], hasCascades));
            };
            let walked = false;
            R20.getCharacterStoreDumpRoots(characterId).forEach((root) => {
                const integrants = root && root.integrants && root.integrants.integrants;
                if (!integrants || typeof integrants !== 'object') return;
                walked = true;
                if (Array.isArray(integrants)) {
                    integrants.forEach((entry) => walk(entry, false));
                } else {
                    Object.keys(integrants).forEach((key) => walk(integrants[key], false));
                }
            });
            if (!walked) this.walkCharacterStore(characterId, visitor);
        },

        abilityScoreToModifier(score) {
            return Math.floor((Utils.toInt(score, 10) - 10) / 2);
        },

        readFlatValue(node) {
            if (!node || typeof node !== 'object') return null;
            const sources = [
                node.valueFormula && node.valueFormula.flatValue,
                node.flatValueFormula && node.flatValueFormula.flatValue,
                node.flatValue
            ];
            for (let i = 0; i < sources.length; i += 1) {
                if (sources[i] !== undefined && sources[i] !== null && String(sources[i]).trim() !== '') return Utils.toInt(sources[i], null);
            }
            return null;
        },

        getDexterityScoreFromStore(characterId) {
            const scores = [];
            this.walkCharacterStoreIntegrants(characterId, (node, inheritedCascades) => {
                const type = String(node.type || '').trim().toLowerCase();
                const ability = String(node.ability || node.name || '').trim().toLowerCase();
                const enabled = !Object.prototype.hasOwnProperty.call(node, '_enabled') || Utils.toBoolean(node._enabled, true);
                if (type !== 'ability score' || inheritedCascades || !enabled || ability !== 'dexterity') return;
                const flatValue = this.readFlatValue(node);
                if (flatValue !== null && flatValue !== undefined) scores.push(flatValue);
            });
            const usableScores = scores.filter((score) => score >= 3);
            if (usableScores.length) return Math.max.apply(null, usableScores);
            return scores.length ? Math.max.apply(null, scores) : null;
        },

        getDexterityModifierFromStore(characterId) {
            const score = this.getDexterityScoreFromStore(characterId);
            return score === null || score === undefined ? null : this.abilityScoreToModifier(score);
        },

        getCharacterLevel(characterId) {
            const attrLevel = this.readAttributeNumber(characterId, ['level', 'character_level', 'base_level'], null);
            if (attrLevel !== null && attrLevel !== undefined && attrLevel > 0) return attrLevel;

            const totalLevels = [];
            const classLevels = [];
            this.walkCharacterStoreIntegrants(characterId, (node, inheritedCascades) => {
                const type = String(node.type || '').trim().toLowerCase();
                const enabled = !Object.prototype.hasOwnProperty.call(node, '_enabled') || Utils.toBoolean(node._enabled, true);
                if (type !== 'class level' || inheritedCascades || !enabled) return;
                const totalLevel = Utils.toInt(node.totalLevel, null);
                const level = Utils.toInt(node.level, null);
                if (totalLevel !== null && totalLevel !== undefined && totalLevel > 0) totalLevels.push(totalLevel);
                if (level !== null && level !== undefined && level > 0) classLevels.push(level);
            });
            if (totalLevels.length) return Math.max.apply(null, totalLevels);
            if (classLevels.length) return classLevels.reduce((sum, level) => sum + level, 0);
            return 1;
        },

        getStandardProficiencyBonus(level) {
            const safeLevel = Math.max(1, Math.min(20, Utils.toInt(level, 1)));
            return Math.max(2, Math.min(6, Math.ceil(safeLevel / 4) + 1));
        },

        getProficiencyBonus(characterId) {
            const attrPb = this.readAttributeNumber(characterId, ['pb', 'proficiency_bonus'], null);
            if (attrPb !== null && attrPb !== undefined && attrPb > 0) return attrPb;
            return this.getStandardProficiencyBonus(this.getCharacterLevel(characterId));
        },

        getInitiativeExtraBonus(characterId) {
            let bonus = 0;
            const reasons = [];
            const seenReasons = {};
            this.walkCharacterStoreIntegrants(characterId, (node, inheritedCascades) => {
                const type = String(node.type || '').trim().toLowerCase();
                const enabled = !Object.prototype.hasOwnProperty.call(node, '_enabled') || Utils.toBoolean(node._enabled, true);
                if (type !== 'initiative' || inheritedCascades || !enabled) return;
                const formula = node.valueFormula && typeof node.valueFormula === 'object' ? node.valueFormula : {};
                const reason = String(node.recordName || node.name || 'Initiative Bonus').trim();
                if (formula.proficiency && Utils.toBoolean(formula.proficiency.add, false)) {
                    const pb = this.getProficiencyBonus(characterId);
                    if (pb && !seenReasons[reason + ':proficiency']) {
                        seenReasons[reason + ':proficiency'] = true;
                        bonus += pb;
                        if (reason && reasons.indexOf(reason) < 0) reasons.push(reason);
                    }
                }
                const flatValue = this.readFlatValue(node);
                if (flatValue && !seenReasons[reason + ':flat']) {
                    seenReasons[reason + ':flat'] = true;
                    bonus += flatValue;
                    if (reason && reasons.indexOf(reason) < 0) reasons.push(reason);
                }
            });
            return { bonus, reasons };
        },

        getInitiativeModifier(characterId) {
            const storeDexMod = this.getDexterityModifierFromStore(characterId);
            const extra = this.getInitiativeExtraBonus(characterId);
            if (storeDexMod !== null && storeDexMod !== undefined) return storeDexMod + extra.bonus;
            const attrValue = this.readAttributeNumber(characterId, ['initiative_bonus', 'initiative_mod', 'init_bonus'], null);
            if (attrValue !== null && attrValue !== undefined) return attrValue;
            return this.readAttributeNumber(characterId, ['dexterity_mod', 'dex_mod'], 0) + extra.bonus;
        },

        getInitiativeRollInfo(characterId) {
            let advantage = 0;
            let disadvantage = 0;
            const advantageReasons = [];
            const disadvantageReasons = [];
            this.walkCharacterStoreIntegrants(characterId, (node, inheritedCascades) => {
                const type = String(node.type || '').trim().toLowerCase();
                const enabled = !Object.prototype.hasOwnProperty.call(node, '_enabled') || Utils.toBoolean(node._enabled, true);
                if (type !== 'roll bonus' || inheritedCascades || !enabled) return;
                const categories = this.parseStoreList(node.bonusCategory).map((entry) => entry.toLowerCase());
                if (categories.indexOf('initiative') < 0) return;
                const details = String(node.bonusDetails || '').trim().toLowerCase();
                const reason = String(node.recordName || node.name || node.title || '').trim();
                if (details.indexOf('highest') >= 0 || details.indexOf('advantage') >= 0) {
                    advantage += 1;
                    if (reason && advantageReasons.indexOf(reason) < 0) advantageReasons.push(reason);
                }
                if (details.indexOf('lowest') >= 0 || details.indexOf('disadvantage') >= 0) {
                    disadvantage += 1;
                    if (reason && disadvantageReasons.indexOf(reason) < 0) disadvantageReasons.push(reason);
                }
            });
            if (advantage > disadvantage) return { mode: 'advantage', reason: advantageReasons.join(', ') || 'Advantage' };
            if (disadvantage > advantage) return { mode: 'disadvantage', reason: disadvantageReasons.join(', ') || 'Disadvantage' };
            return { mode: 'normal', reason: '' };
        },

        rollD20() {
            if (typeof randomInteger === 'function') return randomInteger(20);
            return Math.floor(Math.random() * 20) + 1;
        },

        rollInitiativeForToken(token, forcedMode) {
            if (!token) return { ok: false, message: 'Token was not found.' };
            const character = R20.getCharacterFromToken(token);
            if (!character) return { ok: false, message: this.getTokenName(token) + ' must be linked to a character.' };
            const characterId = String(character.id || token.get('represents') || '').trim();
            const tokenId = String((Utils.isFunction(token.get) ? token.get('_id') : '') || token.id || '').trim();
            const modifier = this.getInitiativeModifier(characterId);
            const forcedModeText = String(forcedMode || '').trim();
            const rollInfo = forcedModeText
                ? { mode: this.normalizeRollMode(forcedModeText), reason: 'Manual 2014 roll mode' }
                : this.getInitiativeRollInfo(characterId);
            const mode = rollInfo.mode;
            const roll1 = this.rollD20();
            const roll2 = mode === 'normal' ? null : this.rollD20();
            const natural = mode === 'advantage'
                ? Math.max(roll1, roll2)
                : (mode === 'disadvantage' ? Math.min(roll1, roll2) : roll1);
            const total = natural + modifier;
            return {
                ok: true,
                tokenId,
                tokenName: this.getTokenName(token),
                characterId,
                characterName: String(character.get('name') || this.getTokenName(token) || 'Token').trim(),
                modifier,
                mode,
                rollModeReason: rollInfo.reason,
                rolls: roll2 === null ? [roll1] : [roll1, roll2],
                natural,
                total
            };
        },

        applyInitiativeResults(results) {
            const safeResults = (Array.isArray(results) ? results : []).filter((entry) => entry && entry.ok && entry.tokenId);
            return RollParser.updateTurnOrderWithInitiativeResults(safeResults.map((entry) => ({
                tokenId: String(entry.tokenId),
                pageId: RollParser.getTokenPageId(String(entry.tokenId)),
                total: entry.total
            })));
        },

        getNativeSaveMacroName(ability) {
            const safeAbility = this.normalizeAbilityName(ability);
            return safeAbility ? (safeAbility + '_save') : '';
        },

        getNativeSaveCommandSet(characterId, ability) {
            const safeAbility = this.normalizeAbilityName(ability);
            if (!safeAbility) return { macroName: '', buttonCommand: '', nativeCommand: '', batchCommand: '', sheetVersion: 'unknown', requiresButton: false };
            const sheetVersion = R20.detectSheetVersion(characterId);
            const macroName = sheetVersion === '2014' ? (safeAbility + '_save_roll') : (safeAbility + '_save');
            const requiresButton = sheetVersion === '2014';
            const sheetAttributeCommand = requiresButton ? R20.sheetAttributeCommand(characterId, macroName, false) : '';
            return {
                macroName,
                buttonCommand: sheetVersion === '2014'
                    ? R20.createNativeRollButtonCommand(sheetAttributeCommand)
                    : R20.buttonAbilityCommand(characterId, macroName),
                nativeCommand: requiresButton ? '' : R20.chatAbilityCommand(characterId, macroName),
                batchCommand: requiresButton ? sheetAttributeCommand : R20.chatAbilityCommand(characterId, macroName),
                sheetVersion,
                requiresButton
            };
        },

        startNativeSavingDamageRoll(token, payload, who) {
            if (!RuntimeConfig.get('CHAT_TRACKING')) {
                return { ok: false, message: 'Chat Tracking must be enabled to read Roll20 saving throws.' };
            }
            if (!token) return { ok: false, message: 'Target token was not found.' };
            const character = R20.getCharacterFromToken(token);
            if (!character) return { ok: false, message: 'Target token needs an assigned character to roll a saving throw.' };
            const characterId = String(character.id || token.get('represents') || '').trim();
            const saveAbility = this.normalizeAbilityName(payload && payload.saveAbility || '');
            const commandSet = this.getNativeSaveCommandSet(characterId, saveAbility);
            if (!characterId || !commandSet.macroName || !commandSet.buttonCommand || (!commandSet.requiresButton && !commandSet.nativeCommand)) return { ok: false, message: 'Native saving throw macro could not be resolved.' };
            const tokenName = this.getTokenName(token);
            const characterName = String(character.get('name') || tokenName || 'Token').trim();
            const requestId = RollParser.createPendingNativeSave({
                tokenId: String(token.id || token.get('_id') || '').trim(),
                characterId,
                characterName,
                tokenName,
                rollName: saveAbility,
                payload: Object.assign({}, payload || {}),
                requestedBy: String(who || 'GM')
            });
            if (!requestId) return { ok: false, message: 'Native saving throw request could not be queued.' };
            const damageRolls = Array.isArray(payload && payload.damageRolls) ? payload.damageRolls : [];
            const damage = damageRolls.reduce((sum, roll) => sum + Math.max(0, Utils.toInt(roll && (roll.total || roll.amount || roll.damage), 0)), 0);
            const damageType = damageRolls.length ? damageRolls[0].damageType : (payload && payload.damageType || 'normal');
            const playerCommand = commandSet.buttonCommand;
            const nativeCommand = commandSet.nativeCommand;
            const batchCommand = String(commandSet.batchCommand || nativeCommand || '').trim();
            const tokenControlledBy = token && Utils.isFunction(token.get) ? String(token.get('controlledby') || '') : '';
            const characterControlledBy = character && Utils.isFunction(character.get) ? String(character.get('controlledby') || '') : '';
            const hasPlayerController = R20.isPlayerControlledToken(token, character);
            const playerRecipients = hasPlayerController ? R20.getTokenControllerDisplayNames(token, character) : [];
            const shouldAskPlayer = hasPlayerController;
            if (!shouldAskPlayer) {
                if (!batchCommand) return { ok: false, message: 'Native saving throw batch command could not be resolved.' };
                return {
                    ok: true,
                    pending: true,
                    requestId,
                    tokenName,
                    characterName,
                    saveAbility,
                    challenge: Math.max(0, Utils.toInt(payload && payload.challenge, 0)),
                    damage,
                    damageType,
                    command: playerCommand,
                    nativeCommand,
                    batchCommand,
                    sheetVersion: commandSet.sheetVersion,
                    batchRoll: true,
                    tokenControlledBy,
                    characterControlledBy,
                    recipients: ['GM']
                };
            }
            const recipients = shouldAskPlayer ? Utils.uniqueNames(['GM'].concat(playerRecipients)) : ['GM'];
            const card = Render.showNativeSaveRollRequest({
                tokenName,
                saveAbility,
                challenge: Math.max(0, Utils.toInt(payload && payload.challenge, 0)),
                damage,
                damageType,
                command: playerCommand
            });
            recipients.forEach((recipient) => R20.whisper(recipient, card));
            return { ok: true, pending: true, requestId, tokenName, recipients, sheetVersion: commandSet.sheetVersion };
        },

        async applyDamageToToken(token, payload) {
            if (!token) return { ok: false, message: 'Target token was not found.' };
            payload = payload || {};
            const tokenName = this.getTokenName(token);
            const tokenImgsrc = String(token.get('imgsrc') || '').trim();
            const character = R20.getCharacterFromToken(token);
            const characterId = character ? String(character.id || '').trim() : '';
            const hpBarNumber = this.getBarNumberForAttribute(token, 'hp', 'HP_BAR');
            const tempBarNumber = this.getBarNumberForAttribute(token, 'hp_temp', 'TEMP_HP_BAR');
            const hpBar = this.getBar(token, hpBarNumber);
            if (!hpBar.ok) return hpBar;
            const hpLinked = this.shouldWriteSheetAttributeForBar(token, hpBarNumber, 'hp');
            let tempBar = null;
            if (tempBarNumber > 0) {
                tempBar = this.getBar(token, tempBarNumber);
                if (!tempBar.ok) return tempBar;
            }

            if (payload.forceMiss || payload.mode === 'miss') {
                return { ok: true, tokenName, tokenImgsrc, sourceImgsrc: payload.sourceImgsrc || '', missed: true, sourceName: payload.sourceName || '', sourceAction: payload.sourceAction || '', totalDamage: 0, parts: [], previousHp: hpBar.value, currentHp: hpBar.value };
            }

            const mode = String(payload.mode || 'direct').toLowerCase();
            const challenge = Math.max(0, Utils.toInt(payload.challenge, 0));
            if (mode === 'attack' && challenge > 0) {
                const ac = this.readAc(token);
                if (ac > 0 && challenge < ac) {
                    return { ok: true, tokenName, tokenImgsrc, sourceImgsrc: payload.sourceImgsrc || '', missed: true, ac, attackTotal: challenge, sourceName: payload.sourceName || '', sourceAction: payload.sourceAction || '', totalDamage: 0, parts: [], previousHp: hpBar.value, currentHp: hpBar.value };
                }
            }

            let save = { used: false };
            let saveSuccessNoDamage = false;
            let saveSuccessHalf = false;
            if (mode === 'save' && challenge > 0) {
                if (!characterId) return { ok: false, message: 'Target token needs an assigned character to roll a saving throw.' };
                if (payload.nativeSaveTotal === undefined || payload.nativeSaveTotal === null || String(payload.nativeSaveTotal).trim() === '') {
                    return { ok: false, message: 'Roll20 saving throw result was not captured yet.' };
                }
                const nativeTotal = Utils.toNumber(payload.nativeSaveTotal, 0);
                const nativeModifier = payload.nativeSaveModifier !== undefined && payload.nativeSaveModifier !== null ? Utils.toInt(payload.nativeSaveModifier, 0) : 0;
                const nativeNatural = payload.nativeSaveNatural !== undefined && payload.nativeSaveNatural !== null ? Utils.toInt(payload.nativeSaveNatural, nativeTotal - nativeModifier) : nativeTotal;
                const nativeRolls = Array.isArray(payload.nativeSaveRolls)
                    ? payload.nativeSaveRolls.map((roll) => Utils.toInt(roll, null)).filter((roll) => roll !== null && roll !== undefined)
                    : [nativeNatural];
                const nativeMode = this.normalizeRollMode(payload.nativeSaveMode || 'normal');
                save = {
                    used: true,
                    ability: this.normalizeAbilityName(payload.saveAbility || ''),
                    dc: challenge,
                    raw: String(payload.nativeSaveRollName || 'Roll20'),
                    modifier: nativeModifier,
                    natural: nativeNatural,
                    total: nativeTotal,
                    rolls: nativeRolls.length ? nativeRolls : [nativeNatural],
                    mode: nativeMode,
                    native: true,
                    success: nativeTotal >= challenge
                };
                if (save.success) {
                    if (payload.halfOnSuccess) saveSuccessHalf = true;
                    else saveSuccessNoDamage = true;
                }
            }

            const damageRolls = Array.isArray(payload.damageRolls) && payload.damageRolls.length ? payload.damageRolls : [{ total: payload.amount || payload.damage || 0, damageType: payload.damageType || 'normal' }];
            const traits = this.readStoreDamageTraits(characterId);
            const parts = [];
            let totalDamage = 0;
            for (let i = 0; i < damageRolls.length; i += 1) {
                const roll = damageRolls[i] || {};
                const base = Math.max(0, Utils.toInt(roll.total || roll.amount || roll.damage, 0));
                const damageType = this.normalizeDamageType(roll.damageType || payload.damageType || 'normal');
                let adjustedBase = base;
                if (saveSuccessNoDamage) adjustedBase = 0;
                else if (saveSuccessHalf) adjustedBase = RuntimeConfig.get('DAMAGE_ROUND_UP') ? Math.ceil(adjustedBase / 2) : Math.floor(adjustedBase / 2);
                const traitResult = this.applyTraits(adjustedBase, damageType, traits);
                totalDamage += traitResult.finalDamage;
                parts.push(Object.assign({ baseDamage: base, adjustedBase, damageType }, traitResult));
            }

            const previousHp = Math.max(0, Utils.toInt(hpBar.value, 0));
            const previousTemp = tempBar ? Math.max(0, Utils.toInt(tempBar.value, 0)) : 0;
            let remainingDamage = totalDamage;
            let tempAbsorbed = 0;
            let currentTemp = previousTemp;
            if (tempBar && currentTemp > 0 && remainingDamage > 0) {
                tempAbsorbed = Math.min(currentTemp, remainingDamage);
                currentTemp -= tempAbsorbed;
                remainingDamage -= tempAbsorbed;
                const tempWrite = await this.setBarOrLinkedAttributeValue(token, tempBarNumber, 'hp_temp', currentTemp, {
                    fallbackToBarIfLinkedAttrMissing: true
                });
                if (!tempWrite.ok) return tempWrite;
            }
            const currentHp = Math.max(0, previousHp - remainingDamage);
            const hpWrite = await this.setBarOrLinkedAttributeValue(token, hpBarNumber, 'hp', currentHp);
            if (!hpWrite.ok) return hpWrite;
            let deathMarked = false;
            if (!hpLinked && previousHp > 0 && currentHp <= 0) {
                deathMarked = this.setTokenStatusMarker(token, 'dead', true);
            }

            return {
                ok: true,
                tokenName,
                tokenImgsrc,
                sourceImgsrc: payload.sourceImgsrc || '',
                sourceName: payload.sourceName || '',
                sourceAction: payload.sourceAction || '',
                save,
                parts,
                totalDamage,
                hpDamage: remainingDamage,
                tempAbsorbed,
                previousTemp,
                currentTemp,
                previousHp,
                currentHp,
                maxHp: hpBar.max,
                fainted: previousHp > 0 && currentHp <= 0,
                deathMarked,
                sheetWrite: { ok: true, skipped: true },
                noDamage: totalDamage <= 0
            };
        },

        async applyHealToToken(token, payload) {
            if (!token) return { ok: false, message: 'Target token was not found.' };
            payload = payload || {};
            const tokenName = this.getTokenName(token);
            const tokenImgsrc = String(token.get('imgsrc') || '').trim();
            const character = R20.getCharacterFromToken(token);
            const characterId = character ? String(character.id || token.get('represents') || '').trim() : '';
            const mode = String(payload.mode || 'hp').trim().toLowerCase() === 'temp' ? 'temp' : 'hp';
            const amount = Math.max(0, Utils.toInt(payload.amount || payload.healing || payload.heal, 0));
            const sourceName = payload.sourceName || '';
            const sourceAction = payload.sourceAction || '';
            const sourceImgsrc = payload.sourceImgsrc || '';
            if (amount <= 0) return { ok: false, message: 'Healing amount must be greater than 0.' };

            if (mode === 'temp') {
                const tempBarNumber = this.getBarNumberForAttribute(token, 'hp_temp', 'TEMP_HP_BAR');
                if (tempBarNumber <= 0) return { ok: false, message: 'Temp HP bar is disabled. Set TEMP_HP_BAR to 1, 2, or 3.' };
                const tempBar = this.getBar(token, tempBarNumber);
                if (!tempBar.ok) return tempBar;
                const previousTemp = Math.max(0, Utils.toInt(tempBar.value, 0));
                const currentTemp = Math.max(previousTemp, amount);
                const tempWrite = await this.setBarOrLinkedAttributeValue(token, tempBarNumber, 'hp_temp', currentTemp, {
                    fallbackToBarIfLinkedAttrMissing: true
                });
                if (!tempWrite.ok) return tempWrite;
                return { ok: true, mode, tokenName, tokenImgsrc, amount, previousTemp, currentTemp, sourceName, sourceAction, sourceImgsrc };
            }

            const hpBarNumber = this.getBarNumberForAttribute(token, 'hp', 'HP_BAR');
            const hpBar = this.getBar(token, hpBarNumber);
            if (!hpBar.ok) return hpBar;
            const hpLinked = this.shouldWriteSheetAttributeForBar(token, hpBarNumber, 'hp');
            const previousHp = Math.max(0, Utils.toInt(hpBar.value, 0));
            const deathSaves = previousHp <= 0 && characterId ? this.getDeathSavesState(characterId) : { ok: true, open: false };
            if (previousHp <= 0 && deathSaves.open) {
                return {
                    ok: false,
                    message: tokenName + ' is at 0 HP and has active death saves. Stabilize the character before applying healing.'
                };
            }
            const maxHp = hpBar.max !== null && hpBar.max !== undefined && !Number.isNaN(Number(hpBar.max)) && Number(hpBar.max) > 0 ? Number(hpBar.max) : null;
            const currentHp = maxHp ? Math.min(maxHp, previousHp + amount) : (previousHp + amount);
            const hpWrite = await this.setBarOrLinkedAttributeValue(token, hpBarNumber, 'hp', currentHp);
            if (!hpWrite.ok) return hpWrite;
            return { ok: true, mode, tokenName, tokenImgsrc, amount, previousHp, currentHp, maxHp, sourceName, sourceAction, sourceImgsrc, stabilized: false, sheetWrite: { ok: true, skipped: true } };
        }
    };

    /** -----------------------------------------------------------------------
     * Commands
     * --------------------------------------------------------------------- */
    const CommandHandlers = {
        getTargetToken(ctx, tokenIdArg) {
            const explicitId = String(tokenIdArg || '').trim();
            if (explicitId) {
                const token = R20.getTokenById(explicitId);
                if (token) return token;
            }
            const selected = R20.getSelectedTokens(ctx.msg);
            return selected[0] || null;
        },

        getTargetTokens(ctx, tokenIdArg) {
            const explicitId = String(tokenIdArg || '').trim();
            if (explicitId) {
                const token = R20.getTokenById(explicitId);
                return token ? [token] : [];
            }
            const selected = R20.getSelectedTokens(ctx.msg);
            if (selected.length) return selected;
            const fallback = this.getTargetToken(ctx, '');
            return fallback ? [fallback] : [];
        },

        ensureApplyPermission(ctx) {
            if (ctx.isGM) return { ok: true };
            const action = String(ctx && ctx.actionType || '').toLowerCase();
            if (!ctx.fromPlayerAction) return { ok: false, message: 'Only generated player action buttons can apply this action.' };
            if (action === 'heal' && RuntimeConfig.get('PLAYER_HEALING_BUTTON')) return { ok: true };
            if (action === 'damage' && RuntimeConfig.get('PLAYER_ATTACK_BUTTON')) return { ok: true };
            return { ok: false, message: 'This action is not enabled for players.' };
        },

        isPlayerAllowedAction(action) {
            return !!PLAYER_ALLOWED_ACTIONS[String(action || '').trim().toLowerCase()];
        },

        canUsePlayerActionRequest(ctx, request) {
            if (ctx.isGM) return true;
            const payload = request && request.payload ? request.payload : {};
            const sourceTokenId = String(request && request.sourceTokenId || payload.casterTokenId || '').trim();
            const sourceCharacterId = String(request && request.sourceCharacterId || request && request.characterId || payload.casterCharacterId || '').trim();
            const sourceToken = sourceTokenId ? R20.getTokenById(sourceTokenId) : null;
            const sourceCharacter = sourceToken
                ? R20.getCharacterFromToken(sourceToken)
                : (sourceCharacterId ? getObj('character', sourceCharacterId) : null);
            if (sourceToken && R20.tokenIsControlledByPlayer(sourceToken, sourceCharacter, ctx.playerId)) return true;
            const access = R20.getCharacterAccessFlags(sourceCharacter, ctx.playerId, ctx.isGM);
            return !!access.controlAccess;
        },

        getNativeRollRecipients(token, character) {
            const playerRecipients = R20.isPlayerControlledToken(token, character) ? R20.getTokenControllerDisplayNames(token, character) : [];
            return Utils.uniqueNames(['GM'].concat(playerRecipients));
        },

        resolvePlayerActionSourceOnTargetPage(request, targetToken) {
            const payload = request && request.payload ? request.payload : {};
            const characterId = String(payload.casterCharacterId || request.sourceCharacterId || request.characterId || '').trim();
            const targetPageId = R20.getTokenPageId(targetToken);
            if (!characterId || !targetPageId) return null;
            const samePageToken = R20.findTokenByCharacterIdOnPage(characterId, targetPageId);
            const sourceToken = samePageToken || R20.getTokenById(payload.casterTokenId || request.sourceTokenId || '');
            if (!sourceToken) return null;
            payload.casterTokenId = R20.getTokenId(sourceToken);
            payload.casterCharacterId = characterId;
            payload.casterPageId = R20.getTokenPageId(sourceToken);
            payload.sourceImgsrc = String(sourceToken.get('imgsrc') || payload.sourceImgsrc || '');
            request.sourceTokenId = payload.casterTokenId;
            request.sourceCharacterId = characterId;
            request.sourcePageId = payload.casterPageId;
            return sourceToken;
        },

        sendNativeRollBatchForTokens(tokens, macroName, options) {
            options = options || {};
            const safeMacroName = String(macroName || '').trim();
            if (!safeMacroName) return { sent: 0, failed: ['Native Roll20 macro could not be resolved.'] };
            const autoRolls = [];
            const batchRolls = [];
            const ca2014PlainRolls = [];
            const ca2014InitiativeRolls = [];
            const failed = [];
            let individual = 0;
            const trackInitiative = Utils.toBoolean(options.trackInitiative, false);
            const initiativeBatchId = trackInitiative ? RollParser.createPendingNativeInitiativeBatch(tokens) : '';
            const isInitiativeRoll = safeMacroName.toLowerCase() === 'initiative';

            for (let i = 0; i < tokens.length; i += 1) {
                const token = tokens[i];
                if (!token) {
                    failed.push('Target token was not found.');
                    continue;
                }
                const character = R20.getCharacterFromToken(token);
                if (!character) {
                    failed.push(CombatService.getTokenName(token) + ' must be linked to a character.');
                    continue;
                }
                const characterId = String(character.id || token.get('represents') || '').trim();
                if (!characterId) {
                    failed.push(CombatService.getTokenName(token) + ' has no character id.');
                    continue;
                }
                const tokenName = CombatService.getTokenName(token);
                const characterName = String(character.get('name') || tokenName || 'Token').trim();
                const commandSet = options.saveAbility
                    ? CombatService.getNativeSaveCommandSet(characterId, options.saveAbility)
                    : (() => {
                        const sheetVersion = R20.detectSheetVersion(characterId);
                        const requiresButton = isInitiativeRoll && sheetVersion === '2014';
                        return {
                            macroName: safeMacroName,
                            buttonCommand: R20.buttonAbilityCommand(characterId, safeMacroName),
                            nativeCommand: requiresButton ? '' : R20.chatAbilityCommand(characterId, safeMacroName),
                            batchCommand: R20.chatAbilityCommand(characterId, safeMacroName),
                            sheetVersion,
                            requiresButton
                        };
                    })();
                const playerCommand = commandSet.buttonCommand;
                const nativeCommand = commandSet.nativeCommand;
                const batchCommand = String(commandSet.batchCommand || nativeCommand || '').trim();
                if (!playerCommand || !batchCommand) {
                    failed.push(CombatService.getTokenName(token) + ' native roll command could not be resolved.');
                    continue;
                }
                const tokenControlledBy = token && Utils.isFunction(token.get) ? String(token.get('controlledby') || '') : '';
                const characterControlledBy = character && Utils.isFunction(character.get) ? String(character.get('controlledby') || '') : '';
                const hasPlayerController = R20.isPlayerControlledToken(token, character);
                const shouldAskPlayer = hasPlayerController;
                if (!shouldAskPlayer && options.saveAbility && commandSet.sheetVersion === '2014' && RuntimeConfig.get('SHEET_2014_CA_ROLLS')) {
                    ca2014PlainRolls.push({
                        tokenId: String((Utils.isFunction(token.get) ? token.get('_id') : '') || token.id || '').trim(),
                        tokenName,
                        characterName
                    });
                    continue;
                }
                let initiativeRequestId = '';
                if (trackInitiative) {
                    initiativeRequestId = RollParser.createPendingNativeInitiative({
                        tokenId: String((Utils.isFunction(token.get) ? token.get('_id') : '') || token.id || '').trim(),
                        characterId,
                        characterName,
                        tokenName,
                        batchId: initiativeBatchId
                    });
                }
                if (!shouldAskPlayer && trackInitiative && isInitiativeRoll && commandSet.sheetVersion === '2014' && RuntimeConfig.get('SHEET_2014_CA_ROLLS')) {
                    ca2014InitiativeRolls.push({
                        tokenId: String((Utils.isFunction(token.get) ? token.get('_id') : '') || token.id || '').trim(),
                        tokenName,
                        characterName,
                        batchId: initiativeBatchId,
                        requestId: initiativeRequestId
                    });
                    continue;
                }
                if (shouldAskPlayer) {
                    const recipients = this.getNativeRollRecipients(token, character);
                    const card = Render.showNativeSheetRollRequest({
                        title: options.individualTitle || options.title || 'Roll20 Roll',
                        tokenName,
                        rollName: options.rollName || safeMacroName,
                        label: options.label || 'Roll',
                        iconHtml: options.iconHtml || '&#127922;',
                        command: playerCommand,
                        tooltip: options.tooltip || ('Roll ' + safeMacroName)
                    });
                    recipients.forEach((recipient) => R20.whisper(recipient, card));
                    individual += 1;
                } else if (commandSet.requiresButton) {
                    batchRolls.push({ tokenName, characterName, command: playerCommand, nativeCommand, batchCommand, tokenControlledBy, characterControlledBy, requestId: initiativeRequestId, sheetVersion: commandSet.sheetVersion });
                } else {
                    autoRolls.push({ tokenName, characterName, command: playerCommand, nativeCommand, batchCommand, tokenControlledBy, characterControlledBy, requestId: initiativeRequestId, sheetVersion: commandSet.sheetVersion });
                }
            }

            if (ca2014InitiativeRolls.length) {
                if (options.rollMode) {
                    const results = [];
                    ca2014InitiativeRolls.forEach((roll) => {
                        const token = R20.getTokenById(roll.tokenId);
                        const result = CombatService.rollInitiativeForToken(token, options.rollMode);
                        RollParser.removePendingNativeInitiativeById(roll.requestId);
                        if (result.ok) {
                            results.push(result);
                            if (trackInitiative && roll.batchId) {
                                RollParser.recordPendingNativeInitiativeResult(result.tokenId, result.total, roll.batchId, roll.requestId);
                            }
                        } else {
                            failed.push(result.message || 'Initiative roll failed.');
                        }
                    });
                    if (results.length) R20.direct(Render.showInitiativeResults(results));
                } else {
                    R20.whisper('GM', Render.showNativeBatchRollRequest({
                        title: '2014 Initiative Rolls',
                        intro: 'Roll <strong>Initiative</strong> for:',
                        names: ca2014InitiativeRolls.map((roll) => roll.tokenName || roll.characterName || 'Token'),
                        label: 'Init',
                        iconHtml: options.iconHtml || '&#127922;',
                        command: '!combatAssistant roll2014init &#63;{Roll Mode|Normal,normal|Advantage,advantage|Disadvantage,disadvantage} ' +
                            Utils.encodeJsonPayload({
                                batchId: initiativeBatchId,
                                rolls: ca2014InitiativeRolls.map((roll) => ({
                                    tokenId: roll.tokenId,
                                    requestId: roll.requestId
                                })).filter((roll) => roll.tokenId)
                            }),
                        tooltip: 'Roll all listed 2014 initiatives with Combat Assistant'
                    }));
                }
            }

            if (autoRolls.length) {
                if (trackInitiative) {
                    RollParser.setNativeInitiativeAutoQueue(initiativeBatchId, autoRolls);
                    RollParser.advanceNativeInitiativeAutoQueue(initiativeBatchId);
                } else {
                    R20.sendNativeCommandsSequentially(
                        autoRolls.map((roll) => roll.nativeCommand || roll.batchCommand || ''),
                        options.rollDelayMs || 750
                    );
                }
            }
            if (batchRolls.length) {
                const batch = R20.createNativeRollBatchAbility(batchRolls.map((roll) => roll.batchCommand || roll.nativeCommand || ''));
                if (batch.ok) {
                    R20.whisper('GM', Render.showNativeBatchRollRequest({
                        title: options.batchTitle || options.title || 'Roll20 Rolls',
                        intro: options.batchIntro || 'Roll for:',
                        names: batchRolls.map((roll) => roll.tokenName || roll.characterName || 'Token'),
                        label: options.batchLabel || 'Roll All',
                        iconHtml: options.iconHtml || '&#127922;',
                        command: batch.command,
                        tooltip: options.batchTooltip || 'Roll all listed tokens'
                    }));
                } else {
                    failed.push(batch.message || 'Could not create Roll All button.');
                }
            }
            if (ca2014PlainRolls.length) {
                const abilityLabel = CombatService.abilityNameToShortLabel(options.saveAbility || '') || String(options.label || 'SAVE').toUpperCase();
                if (options.rollMode) {
                    const results = [];
                    ca2014PlainRolls.forEach((roll) => {
                        const token = R20.getTokenById(roll.tokenId);
                        const result = CombatService.rollSavingThrowForToken(token, options.saveAbility, options.rollMode);
                        if (result.ok) results.push(result);
                        else failed.push(result.message || 'Saving throw failed.');
                    });
                    if (results.length) R20.direct(Render.showSavingThrowResults(results, abilityLabel));
                } else {
                    R20.whisper('GM', Render.showNativeBatchRollRequest({
                        title: '2014 ' + abilityLabel + ' Saving Throws',
                        intro: 'Roll <strong>' + Utils.escapeHtml(abilityLabel) + '</strong> saving throws:',
                        names: ca2014PlainRolls.map((roll) => roll.tokenName || roll.characterName || 'Token'),
                        label: 'Roll',
                        iconHtml: options.iconHtml || '&#127922;',
                        command: '!combatAssistant roll2014plain &#63;{Roll Mode|Normal,normal|Advantage,advantage|Disadvantage,disadvantage} ' +
                            Utils.encodeJsonPayload({
                                ability: options.saveAbility,
                                tokenIds: ca2014PlainRolls.map((roll) => roll.tokenId).filter(Boolean)
                            }),
                        tooltip: 'Roll all listed 2014 saving throws with Combat Assistant'
                    }));
                }
            }

            return {
                sent: individual + autoRolls.length + batchRolls.length + ca2014PlainRolls.length + ca2014InitiativeRolls.length,
                individual,
                automatic: autoRolls.length + (options.rollMode ? ca2014InitiativeRolls.length : 0),
                batch: batchRolls.length + ca2014PlainRolls.length + (options.rollMode ? 0 : ca2014InitiativeRolls.length),
                failed
            };
        },

        async handle(ctx) {
            const args = ctx.args || [];
            const action = String(args[0] || 'menu').trim().toLowerCase();
            if (!ctx.isGM && !this.isPlayerAllowedAction(action)) {
                Render.sendWhisperMessage(ctx.who, 'Permission Denied', 'Only the GM can use Combat Assistant commands. Use generated player buttons for attacks, healing, and saving throws.', 'failure');
                return;
            }
            if (action === 'menu') {
                Render.showMenu(ctx.who);
                return;
            }
            if (action === 'help') {
                Render.showHelp(ctx.who);
                return;
            }
            if (action === 'config' || action === 'settings') {
                Render.showConfigMenu(ctx.who);
                return;
            }
            if (action === 'set') {
                const key = args[1] || '';
                const value = args.slice(2).join(' ');
                const result = RuntimeConfig.set(key, value);
                if (!result.ok) Render.sendWhisperMessage(ctx.who, 'Settings', result.message, 'failure');
                else Render.showConfigMenu(ctx.who);
                return;
            }
            if (action === 'toggle') {
                const result = RuntimeConfig.toggle(args[1] || '');
                if (!result.ok) Render.sendWhisperMessage(ctx.who, 'Settings', result.message, 'failure');
                else Render.showConfigMenu(ctx.who);
                return;
            }
            if (action === 'use') {
                await this.handlePlayerActionUse(ctx, args.slice(1));
                return;
            }
            if (action === 'roll2014save') {
                await this.handle2014CombatAssistantSaveRoll(ctx, args.slice(1));
                return;
            }
            if (action === 'roll2014plain') {
                this.handle2014CombatAssistantPlainSaveRoll(ctx, args.slice(1));
                return;
            }
            if (action === 'roll2014init') {
                this.handle2014CombatAssistantInitiativeRoll(ctx, args.slice(1));
                return;
            }
            if (action === 'deal') {
                await this.handleDeal(ctx, args.slice(1));
                return;
            }
            if (action === 'heal') {
                await this.handleHeal(ctx, args.slice(1));
                return;
            }
            if (action === 'save' || action === 'saving') {
                await this.handleSave(ctx, args.slice(1));
                return;
            }
            if (action === 'init' || action === 'initiative') {
                await this.handleInitiative(ctx, args.slice(1));
                return;
            }
            if (action === 'rollinit') {
                await this.handleCombatAssistantInitiativeRoll(ctx, args.slice(1));
                return;
            }
            if (action === 'test') {
                this.handleTest(ctx);
                return;
            }
            Render.sendWhisperMessage(ctx.who, 'Unknown Command', 'Use <code>!combatAssistant menu</code> or <code>!combat-assistant help</code>.', 'warning');
        },

        async handlePlayerActionUse(ctx, args) {
            const actionId = String(args[0] || '').trim();
            const targetId = String(args[1] || '').trim();
            const request = State.getPlayerActionRequest(actionId);
            if (!request || request.used) {
                Render.sendWhisperMessage(ctx.who, 'Action Expired', 'This single-use button has already been used or expired.', 'warning');
                return;
            }
            if (!this.canUsePlayerActionRequest(ctx, request)) {
                Render.sendWhisperMessage(ctx.who, 'Permission Denied', 'This player action belongs to a token you do not control.', 'failure');
                return;
            }
            if (!targetId) {
                Render.sendWhisperMessage(ctx.who, 'Target Required', 'Choose a target token before pressing the button.', 'warning');
                return;
            }
            const target = R20.getTokenById(targetId);
            if (!target) {
                Render.sendWhisperMessage(ctx.who, 'Target Required', 'The selected target token could not be found.', 'warning');
                return;
            }
            this.resolvePlayerActionSourceOnTargetPage(request, target);
            if (!State.markPlayerActionUsed(actionId)) {
                Render.sendWhisperMessage(ctx.who, 'Action Expired', 'This single-use button has already been used.', 'warning');
                return;
            }
            const useCtx = Object.assign({}, ctx, {
                msg: Object.assign({}, ctx.msg || {}, { selected: [] }),
                fromPlayerAction: true
            });
            if (String(request.type || '').toLowerCase() === 'heal') {
                await this.handleHeal(useCtx, [Utils.encodeJsonPayload(request.payload || {}), targetId]);
                return;
            }
            await this.handleDeal(useCtx, [Utils.encodeJsonPayload(request.payload || {}), targetId]);
        },

        async handle2014CombatAssistantSaveRoll(ctx, args) {
            if (!ctx.isGM) {
                Render.sendWhisperMessage(ctx.who, 'Permission Denied', 'Only the GM can roll grouped 2014 saving throws.', 'failure');
                return;
            }
            const mode = CombatService.normalizeRollMode(args[0] || 'normal');
            const payload = Utils.decodeJsonPayload(args[1] || '', {});
            const ids = Array.isArray(payload.ids) ? payload.ids.map((id) => String(id || '').trim()).filter(Boolean) : [];
            if (!ids.length) {
                Render.sendWhisperMessage(ctx.who, '2014 Saving Throws', 'No pending saving throws were found.', 'warning');
                return;
            }
            let applied = 0;
            for (let i = 0; i < ids.length; i += 1) {
                const pending = RollParser.consumePendingNativeSaveById(ids[i]);
                if (!pending) continue;
                const token = R20.getTokenById(pending.tokenId);
                if (!token) {
                    Render.sendWhisperMessage(ctx.who, 'Damage Blocked', 'The pending saving throw target token was not found.', 'failure');
                    continue;
                }
                const roll = CombatService.rollSavingThrowForToken(token, pending.rollName || (pending.payload && pending.payload.saveAbility) || '', mode);
                if (!roll.ok) {
                    Render.sendWhisperMessage(ctx.who, '2014 Saving Throw', roll.message || 'Saving throw failed.', 'failure');
                    continue;
                }
                const damagePayload = Object.assign({}, pending.payload || {}, {
                    nativeSaveTotal: roll.total,
                    nativeSaveNatural: roll.natural,
                    nativeSaveModifier: roll.modifier,
                    nativeSaveRolls: roll.rolls,
                    nativeSaveMode: roll.mode,
                    nativeSaveRollName: (CombatService.abilityNameToShortLabel(roll.ability) || 'SAVE') + ' Save',
                    nativeSaveCharacterName: roll.characterName
                });
                const result = await CombatService.applyDamageToToken(token, damagePayload);
                if (!result.ok) {
                    Render.sendWhisperMessage(ctx.who, 'Damage Blocked', result.message || 'Could not apply damage after the saving throw.', 'failure');
                    continue;
                }
                Render.sendDamageResult(result);
                applied += 1;
            }
            if (!applied) Render.sendWhisperMessage(ctx.who, '2014 Saving Throws', 'No pending saving throws could be resolved.', 'warning');
        },

        handle2014CombatAssistantPlainSaveRoll(ctx, args) {
            if (!ctx.isGM) {
                Render.sendWhisperMessage(ctx.who, 'Permission Denied', 'Only the GM can roll grouped 2014 saving throws.', 'failure');
                return;
            }
            const mode = CombatService.normalizeRollMode(args[0] || 'normal');
            const payload = Utils.decodeJsonPayload(args[1] || '', {});
            const ability = CombatService.normalizeAbilityName(payload.ability || '');
            const tokenIds = Array.isArray(payload.tokenIds) ? payload.tokenIds.map((id) => String(id || '').trim()).filter(Boolean) : [];
            if (!ability || !tokenIds.length) {
                Render.sendWhisperMessage(ctx.who, '2014 Saving Throws', 'No 2014 saving throw tokens were found.', 'warning');
                return;
            }
            const results = [];
            const failed = [];
            tokenIds.forEach((tokenId) => {
                const token = R20.getTokenById(tokenId);
                const result = CombatService.rollSavingThrowForToken(token, ability, mode);
                if (result.ok) results.push(result);
                else failed.push(result.message || 'Saving throw failed.');
            });
            if (results.length) R20.direct(Render.showSavingThrowResults(results, CombatService.abilityNameToShortLabel(ability) || 'SAVE'));
            if (failed.length) Render.sendWhisperMessage(ctx.who, '2014 Saving Throws', Utils.escapeHtml(failed.join(' ')), 'warning');
        },

        handle2014CombatAssistantInitiativeRoll(ctx, args) {
            if (!ctx.isGM) {
                Render.sendWhisperMessage(ctx.who, 'Permission Denied', 'Only the GM can roll grouped 2014 initiative.', 'failure');
                return;
            }
            const mode = CombatService.normalizeRollMode(args[0] || 'normal');
            const payload = Utils.decodeJsonPayload(args[1] || '', {});
            const batchId = String(payload.batchId || '').trim();
            const rolls = Array.isArray(payload.rolls)
                ? payload.rolls.map((entry) => ({
                    tokenId: String(entry && entry.tokenId || '').trim(),
                    requestId: String(entry && entry.requestId || '').trim()
                })).filter((entry) => entry.tokenId)
                : [];
            if (!rolls.length) {
                Render.sendWhisperMessage(ctx.who, '2014 Initiative', 'No 2014 initiative tokens were found.', 'warning');
                return;
            }
            const results = [];
            const failed = [];
            rolls.forEach((entry) => {
                const token = R20.getTokenById(entry.tokenId);
                const result = CombatService.rollInitiativeForToken(token, mode);
                RollParser.removePendingNativeInitiativeById(entry.requestId);
                if (result.ok) {
                    results.push(result);
                    if (batchId) {
                        RollParser.recordPendingNativeInitiativeResult(result.tokenId, result.total, batchId, entry.requestId);
                    }
                } else {
                    failed.push(result.message || 'Initiative roll failed.');
                }
            });
            if (results.length) {
                if (!batchId) CombatService.applyInitiativeResults(results);
                R20.direct(Render.showInitiativeResults(results));
            }
            if (failed.length) Render.sendWhisperMessage(ctx.who, '2014 Initiative', Utils.escapeHtml(failed.join(' ')), 'warning');
        },

        async handleDeal(ctx, args) {
            const permission = this.ensureApplyPermission(Object.assign({}, ctx, { actionType: 'damage' }));
            if (!permission.ok) {
                Render.sendWhisperMessage(ctx.who, 'Permission Denied', permission.message, 'failure');
                return;
            }
            let payload = null;
            let targetId = '';
            if (String(args[0] || '').toLowerCase() === 'manual') {
                const damage = Math.max(0, Utils.toInt(args[1], 0));
                const damageType = CombatService.normalizeDamageType(args[2] || 'normal');
                const challenge = Math.max(0, Utils.toInt(args[3], 0));
                const saveAbility = CombatService.normalizeAbilityName(args[4] || '');
                const halfOnSuccess = Utils.toBoolean(args[5], false);
                payload = {
                    type: 'damage',
                    mode: saveAbility && challenge > 0 ? 'save' : (challenge > 0 ? 'attack' : 'direct'),
                    challenge,
                    saveAbility,
                    halfOnSuccess,
                    halfOnSuccessKnown: !!saveAbility,
                    damageRolls: [{ total: damage, damageType, formula: 'Manual' }],
                    sourceName: 'Manual',
                    sourceAction: 'Manual Damage'
                };
                const manualExtra = String(args[6] || '').trim();
                if (manualExtra && ['normal', 'advantage', 'disadvantage', 'adv', 'dis'].indexOf(manualExtra.toLowerCase()) >= 0) {
                    payload.rollMode = CombatService.normalizeRollMode(manualExtra);
                    targetId = args[7] || '';
                } else {
                    targetId = args[6] || '';
                }
            } else {
                payload = Utils.decodeJsonPayload(args[0] || '', null);
                const secondArg = String(args[1] || '').trim();
                if (secondArg && ['normal', 'advantage', 'disadvantage', 'adv', 'dis'].indexOf(secondArg.toLowerCase()) >= 0) {
                    payload.rollMode = CombatService.normalizeRollMode(secondArg);
                    targetId = args[2] || '';
                } else {
                    targetId = args[1] || '';
                }
            }
            if (!payload) {
                Render.sendWhisperMessage(ctx.who, 'Damage', 'Invalid damage payload.', 'failure');
                return;
            }
            const tokens = this.getTargetTokens(ctx, targetId);
            if (!tokens.length) {
                Render.sendWhisperMessage(ctx.who, 'Damage', 'No target tokens were found. Select one or more tokens before pressing the button.', 'warning');
                return;
            }
            const mode = String(payload.mode || 'direct').toLowerCase();
            const challenge = Math.max(0, Utils.toInt(payload.challenge, 0));
            const needsNativeSave = mode === 'save' && challenge > 0 && (payload.nativeSaveTotal === undefined || payload.nativeSaveTotal === null || String(payload.nativeSaveTotal).trim() === '');
            if (needsNativeSave) {
                const pendingNames = [];
                const autoRolls = [];
                const batchRolls = [];
                const ca2014Rolls = [];
                for (let i = 0; i < tokens.length; i += 1) {
                    const queued = CombatService.startNativeSavingDamageRoll(tokens[i], payload, ctx.who);
                    if (!queued.ok) {
                        Render.sendWhisperMessage(ctx.who, 'Damage Blocked', queued.message || 'Could not queue Roll20 saving throw.', 'failure');
                        continue;
                    }
                    if (queued.batchRoll && queued.sheetVersion === '2014' && RuntimeConfig.get('SHEET_2014_CA_ROLLS')) ca2014Rolls.push(queued);
                    else if (queued.batchRoll && queued.sheetVersion === '2014') batchRolls.push(queued);
                    else if (queued.batchRoll) autoRolls.push(queued);
                    else pendingNames.push(queued.tokenName);
                }
                if (autoRolls.length) {
                    R20.sendNativeCommandsSequentially(
                        autoRolls.map((roll) => roll.nativeCommand || roll.batchCommand || ''),
                        850
                    );
                }
                if (ca2014Rolls.length) {
                    const abilityLabel = CombatService.abilityNameToShortLabel(payload.saveAbility || '') || 'SAVE';
                    if (payload.rollMode) {
                        for (let r = 0; r < ca2014Rolls.length; r += 1) {
                            const pending = RollParser.consumePendingNativeSaveById(ca2014Rolls[r].requestId);
                            if (!pending) continue;
                            const token = R20.getTokenById(pending.tokenId);
                            const roll = CombatService.rollSavingThrowForToken(token, pending.rollName || (pending.payload && pending.payload.saveAbility) || '', payload.rollMode);
                            if (!roll.ok) {
                                Render.sendWhisperMessage(ctx.who, '2014 Saving Throw', roll.message || 'Saving throw failed.', 'failure');
                                continue;
                            }
                            const damagePayload = Object.assign({}, pending.payload || {}, {
                                nativeSaveTotal: roll.total,
                                nativeSaveNatural: roll.natural,
                                nativeSaveModifier: roll.modifier,
                                nativeSaveRolls: roll.rolls,
                                nativeSaveMode: roll.mode,
                                nativeSaveRollName: (CombatService.abilityNameToShortLabel(roll.ability) || abilityLabel) + ' Save',
                                nativeSaveCharacterName: roll.characterName
                            });
                            const result = await CombatService.applyDamageToToken(token, damagePayload);
                            if (!result.ok) {
                                Render.sendWhisperMessage(ctx.who, 'Damage Blocked', result.message || 'Could not apply damage after the saving throw.', 'failure');
                                continue;
                            }
                            Render.sendDamageResult(result);
                        }
                    } else {
                        R20.whisper('GM', Render.showNativeBatchRollRequest({
                            title: '2014 ' + abilityLabel + ' Saving Throws',
                            intro: 'Roll <strong>' + Utils.escapeHtml(abilityLabel) + '</strong> saving throws' + (challenge > 0 ? (' DC ' + Utils.escapeHtml(String(challenge))) : '') + ':',
                            names: ca2014Rolls.map((roll) => roll.tokenName || roll.characterName || 'Token'),
                            label: 'Roll',
                            iconHtml: '&#127922;',
                            command: '!combatAssistant roll2014save &#63;{Roll Mode|Normal,normal|Advantage,advantage|Disadvantage,disadvantage} ' +
                                Utils.encodeJsonPayload({ ids: ca2014Rolls.map((roll) => roll.requestId || '').filter(Boolean) }),
                            tooltip: 'Roll all listed 2014 saving throws with Combat Assistant'
                        }));
                    }
                }
                if (batchRolls.length) {
                    const abilityLabel = CombatService.abilityNameToShortLabel(payload.saveAbility || '') || 'SAVE';
                    const batch = R20.createNativeRollBatchAbility(batchRolls.map((roll) => roll.batchCommand || roll.nativeCommand || ''));
                    if (batch.ok) {
                        R20.whisper('GM', Render.showNativeBatchRollRequest({
                            title: abilityLabel + ' Saving Throws',
                            intro: 'Roll <strong>' + Utils.escapeHtml(abilityLabel) + '</strong> saving throws' + (challenge > 0 ? (' DC ' + Utils.escapeHtml(String(challenge))) : '') + ':',
                            names: batchRolls.map((roll) => roll.tokenName || roll.characterName || 'Token'),
                            label: 'Roll',
                            iconHtml: '&#127922;',
                            command: batch.command,
                            tooltip: 'Roll all listed saving throws'
                        }));
                    } else {
                        Render.sendWhisperMessage(ctx.who, 'Damage Blocked', batch.message || 'Could not create Roll All button.', 'failure');
                    }
                }
                if (pendingNames.length) {
                    Render.sendWhisperMessage(
                        ctx.who,
                        'Roll20 Saves Pending',
                        'Waiting for Roll20 saving throws from: <b>' + Utils.escapeHtml(pendingNames.join(', ')) + '</b>.',
                        'warning'
                    );
                }
                return;
            }
            for (let i = 0; i < tokens.length; i += 1) {
                const result = await CombatService.applyDamageToToken(tokens[i], payload);
                if (!result.ok) {
                    Render.sendWhisperMessage(ctx.who, 'Damage Blocked', result.message || 'Could not apply damage.', 'failure');
                    continue;
                }
                Render.sendDamageResult(result);
            }
        },

        async handleSave(ctx, args) {
            const ability = CombatService.normalizeAbilityName(args[0] || '');
            if (!ability) {
                Render.sendWhisperMessage(ctx.who, 'Saving Throw', 'Choose a valid ability: strength, dexterity, constitution, intelligence, wisdom, or charisma.', 'warning');
                return;
            }
            const macroName = CombatService.getNativeSaveMacroName(ability);
            const abilityLabel = CombatService.abilityNameToShortLabel(ability) || 'SAVE';
            const rollModeArg = String(args[1] || '').trim();
            const rollMode = ['normal', 'advantage', 'disadvantage', 'adv', 'dis'].indexOf(rollModeArg.toLowerCase()) >= 0
                ? CombatService.normalizeRollMode(rollModeArg)
                : '';
            const tokens = this.getTargetTokens(ctx, '');
            if (!tokens.length) {
                Render.sendWhisperMessage(ctx.who, 'Saving Throw', 'Select one or more linked tokens.', 'warning');
                return;
            }
            const result = this.sendNativeRollBatchForTokens(tokens, macroName, {
                saveAbility: ability,
                title: abilityLabel + ' Saving Throw',
                individualTitle: abilityLabel + ' Saving Throw',
                rollName: abilityLabel + ' Saving Throw',
                label: abilityLabel,
                batchLabel: abilityLabel,
                batchTitle: abilityLabel + ' Saving Throws',
                batchIntro: 'Roll <strong>' + Utils.escapeHtml(abilityLabel) + '</strong> saving throws:',
                iconHtml: '&#128735;',
                tooltip: 'Roll ' + abilityLabel + ' saving throw',
                batchTooltip: 'Roll all listed ' + abilityLabel + ' saving throws',
                rollMode,
                alwaysAskControlled: true
            });
            if (result.failed.length) Render.sendWhisperMessage(ctx.who, 'Saving Throw', Utils.escapeHtml(result.failed.join(' ')), 'warning');
        },

        canUseTokenButton(ctx, token) {
            if (ctx.isGM) return true;
            const character = R20.getCharacterFromToken(token);
            const access = R20.getCharacterAccessFlags(character, ctx.playerId, ctx.isGM);
            return !!access.controlAccess;
        },

        whisperCombatAssistantInitiativeButton(token, ctx) {
            const character = R20.getCharacterFromToken(token);
            if (!character) return false;
            const tokenName = CombatService.getTokenName(token);
            const tokenId = String((Utils.isFunction(token.get) ? token.get('_id') : '') || token.id || '').trim();
            const characterId = String(character.id || (Utils.isFunction(token.get) ? token.get('represents') : '') || '').trim();
            const needs2014Mode = characterId && R20.detectSheetVersion(characterId) === '2014' && RuntimeConfig.get('SHEET_2014_CA_ROLLS');
            const recipients = this.getNativeRollRecipients(token, character);
            const card = Render.showNativeSheetRollRequest({
                title: 'Initiative Roll',
                tokenName,
                rollName: 'Initiative',
                label: 'Init',
                iconHtml: '&#127922;',
                command: '!combatAssistant rollinit ' + Utils.attrSafe(tokenId) +
                    (needs2014Mode ? ' &#63;{2014 Roll Mode|Normal,normal|Advantage,advantage|Disadvantage,disadvantage}' : ''),
                tooltip: 'Roll initiative with Combat Assistant'
            });
            recipients.forEach((recipient) => R20.whisper(recipient, card));
            return true;
        },

        runCombatAssistantInitiative(tokens, ctx, rollMode) {
            const automatic = [];
            let requested = 0;
            const failed = [];
            tokens.forEach((token) => {
                const character = R20.getCharacterFromToken(token);
                if (!character) {
                    failed.push(CombatService.getTokenName(token) + ' must be linked to a character.');
                    return;
                }
                if (R20.isPlayerControlledToken(token, character)) {
                    if (this.whisperCombatAssistantInitiativeButton(token, ctx)) requested += 1;
                    return;
                }
                const characterId = String(character.id || (Utils.isFunction(token.get) ? token.get('represents') : '') || '').trim();
                const forcedMode = characterId && R20.detectSheetVersion(characterId) === '2014' && RuntimeConfig.get('SHEET_2014_CA_ROLLS')
                    ? rollMode
                    : '';
                const result = CombatService.rollInitiativeForToken(token, forcedMode);
                if (result.ok) automatic.push(result);
                else failed.push(result.message || 'Initiative roll failed.');
            });
            if (automatic.length) {
                CombatService.applyInitiativeResults(automatic);
                R20.direct(Render.showInitiativeResults(automatic));
            }
            if (requested) {
                Render.sendWhisperMessage(ctx.who, 'Initiative', 'Initiative roll request sent to player-controlled token(s).', 'normal');
            }
            if (failed.length) Render.sendWhisperMessage(ctx.who, 'Initiative', Utils.escapeHtml(failed.join(' ')), 'warning');
        },

        async handleCombatAssistantInitiativeRoll(ctx, args) {
            const tokenId = String(args[0] || '').trim();
            const rollModeArg = String(args[1] || '').trim();
            const rollMode = ['normal', 'advantage', 'disadvantage', 'adv', 'dis'].indexOf(rollModeArg.toLowerCase()) >= 0
                ? CombatService.normalizeRollMode(rollModeArg)
                : '';
            const token = R20.getTokenById(tokenId);
            if (!token) {
                Render.sendWhisperMessage(ctx.who, 'Initiative', 'Token was not found.', 'failure');
                return;
            }
            if (!this.canUseTokenButton(ctx, token)) {
                Render.sendWhisperMessage(ctx.who, 'Initiative', 'You do not control this token.', 'failure');
                return;
            }
            const character = R20.getCharacterFromToken(token);
            const characterId = character ? String(character.id || (Utils.isFunction(token.get) ? token.get('represents') : '') || '').trim() : '';
            const forcedMode = characterId && R20.detectSheetVersion(characterId) === '2014' && RuntimeConfig.get('SHEET_2014_CA_ROLLS')
                ? rollMode
                : '';
            const result = CombatService.rollInitiativeForToken(token, forcedMode);
            if (!result.ok) {
                Render.sendWhisperMessage(ctx.who, 'Initiative', result.message || 'Initiative roll failed.', 'failure');
                return;
            }
            CombatService.applyInitiativeResults([result]);
            R20.direct(Render.showInitiativeResults([result]));
        },

        async handleInitiative(ctx, args) {
            args = args || [];
            const rollModeArg = String(args[0] || '').trim();
            const rollMode = ['normal', 'advantage', 'disadvantage', 'adv', 'dis'].indexOf(rollModeArg.toLowerCase()) >= 0
                ? CombatService.normalizeRollMode(rollModeArg)
                : '';
            const tokens = this.getTargetTokens(ctx, '');
            if (!tokens.length) {
                Render.sendWhisperMessage(ctx.who, 'Initiative', 'Select one or more linked tokens.', 'warning');
                return;
            }
            if (RuntimeConfig.get('CA_ROLLS_INITIATIVE')) {
                this.runCombatAssistantInitiative(tokens, ctx, rollMode);
                return;
            }
            if (RuntimeConfig.get('DEBUG')) {
                Render.sendPublicMessage(
                    'Initiative Debug',
                    '<div style="text-align:left;font-size:11px;line-height:13px;"><strong>Turn Order Before Initiative:</strong><br><code>' +
                        Utils.escapeHtml(JSON.stringify(RollParser.getCurrentTurnOrder())) +
                    '</code></div>',
                    'normal'
                );
            }
            const result = this.sendNativeRollBatchForTokens(tokens, 'initiative', {
                title: 'Initiative Roll',
                individualTitle: 'Initiative Roll',
                rollName: 'Initiative',
                label: 'Init',
                batchLabel: 'Init',
                batchTitle: 'Initiative Rolls',
                batchIntro: 'Roll <strong>Initiative</strong> for:',
                iconHtml: '&#127922;',
                tooltip: 'Roll initiative',
                batchTooltip: 'Roll initiative for all listed tokens',
                trackInitiative: true,
                rollMode,
                alwaysAskControlled: true
            });
            if (result.failed.length) Render.sendWhisperMessage(ctx.who, 'Initiative', Utils.escapeHtml(result.failed.join(' ')), 'warning');
        },

        handleTest(ctx) {
            const tokens = this.getTargetTokens(ctx, '');
            if (!tokens.length) {
                Render.sendPublicMessage('Combat Assistant Test', 'No selected token.', 'warning');
                return;
            }
            const rows = tokens.map((token) => {
                const character = R20.getCharacterFromToken(token);
                const tokenName = CombatService.getTokenName(token);
                const tokenControlledBy = token && Utils.isFunction(token.get) ? String(token.get('controlledby') || '') : '';
                const characterControlledBy = character && Utils.isFunction(character.get) ? String(character.get('controlledby') || '') : '';
                const characterName = character && Utils.isFunction(character.get) ? String(character.get('name') || '') : '';
                return '<div style="padding:2px 0;text-align:left;">' +
                    '<b>' + Utils.escapeHtml(tokenName) + '</b><br>' +
                    'token.controlledby: <code>' + Utils.escapeHtml(tokenControlledBy || '(empty)') + '</code><br>' +
                    'character: <code>' + Utils.escapeHtml(characterName || '(none)') + '</code><br>' +
                    'character.controlledby: <code>' + Utils.escapeHtml(characterControlledBy || '(empty)') + '</code>' +
                '</div>';
            }).join('<hr style="border:0;border-top:1px solid rgba(255,255,255,0.25);margin:4px 0;">');
            Render.sendPublicMessage('Combat Assistant Test', rows, 'normal');
        },

        async handleHeal(ctx, args) {
            const permission = this.ensureApplyPermission(Object.assign({}, ctx, { actionType: 'heal' }));
            if (!permission.ok) {
                Render.sendWhisperMessage(ctx.who, 'Permission Denied', permission.message, 'failure');
                return;
            }
            let payload = null;
            let targetId = '';
            if (String(args[0] || '').toLowerCase() === 'manual') {
                payload = {
                    type: 'heal',
                    mode: String(args[1] || 'hp').trim().toLowerCase() === 'temp' ? 'temp' : 'hp',
                    amount: Math.max(0, Utils.toInt(args[2], 0)),
                    sourceName: 'Manual',
                    sourceAction: 'Manual Healing'
                };
                targetId = args[3] || '';
            } else {
                payload = Utils.decodeJsonPayload(args[0] || '', null);
                targetId = args[1] || '';
            }
            if (!payload) {
                Render.sendWhisperMessage(ctx.who, 'Healing', 'Invalid healing payload.', 'failure');
                return;
            }
            const tokens = this.getTargetTokens(ctx, targetId);
            if (!tokens.length) {
                Render.sendWhisperMessage(ctx.who, 'Healing', 'No target tokens were found. Select one or more tokens before pressing the button.', 'warning');
                return;
            }
            for (let i = 0; i < tokens.length; i += 1) {
                const result = await CombatService.applyHealToToken(tokens[i], payload);
                if (!result.ok) {
                    Render.sendWhisperMessage(ctx.who, 'Healing Blocked', result.message || 'Could not apply healing.', 'failure');
                    continue;
                }
                Render.sendHealResult(result, ctx.who);
            }
        }
    };

    /** -----------------------------------------------------------------------
     * Events / registration
     * --------------------------------------------------------------------- */
    const Events = {
        async onChatMessage(msg) {
            try {
                if (!SCRIPT_ACTIVE) return;
                State.cleanupRuntimeQueues();
                if (msg && msg.type !== 'api') {
                    RollParser.maybeDumpChatProbe(msg);
                    await RollParser.handleChatMessage(msg);
                    return;
                }
                if (!msg || msg.type !== 'api') return;
                const parsed = Utils.splitCommand(msg.content);
                const base = String(parsed.base || '').trim().toLowerCase();
                if (COMMANDS.indexOf(base) < 0) return;
                const who = Utils.asString(msg.who).replace(/\s+\(GM\)$/i, '');
                const playerId = msg.playerid || '';
                const isGM = typeof playerIsGM === 'function' ? playerIsGM(playerId) : false;
                const ctx = { msg, who, playerId, isGM, args: parsed.args, raw: parsed.raw };
                await CommandHandlers.handle(ctx);
            } catch (error) {
                Logger.error('[chat:message]', error && error.stack ? error.stack : (error && error.message ? error.message : String(error)));
                try {
                    R20.whisper('GM', Html.card({
                        title: META.NAME + ' Error',
                        body: '<div style="font-size:12px;line-height:15px;color:rgb(240,180,180);">' + Utils.escapeHtml(error && error.message ? error.message : String(error)) + '</div>',
                        buildOptions: { titleColor: 'rgb(225,60,60)', borderColor: 'rgb(127,0,0)' }
                    }));
                } catch (ignored) {}
            }
        },

        onReady() {
            const sandboxVersion = String((typeof Campaign === 'function' && Campaign() && Campaign().sandboxVersion) || '').trim().toLowerCase();
            if (sandboxVersion && sandboxVersion !== 'experimental') {
                Render.sendWhisperMessage(
                    'GM',
                    META.NAME.toUpperCase(),
                    Html.span('API SANDBOX VERSION: DEFAULT<br>', 'color:rgb(208, 139, 28)') +
                    '<br>' +
                    'Combat Assistant is not available.<br>' +
                    'Go to Mod Library and set "API Sandbox Version" to Experimental to use this API.',
                    'failure'
                );
                return;
            }

            if (!R20.hasSheetApi()) {
                Render.sendWhisperMessage(
                    'GM',
                    META.NAME.toUpperCase(),
                    Html.span('REQUIRED SHEET API NOT AVAILABLE<br>', 'color:rgb(208, 139, 28)') +
                    '<br>' +
                    'Combat Assistant requires Roll20 getSheetItem() and setSheetItem().<br>' +
                    'Restart the Mod sandbox or verify the current Roll20 Mod environment.',
                    'failure'
                );
                return;
            }

            State.ensure();
            State.cleanupRuntimeQueues();
            R20.cleanupBatchAbilities(20, 10 * 60 * 1000);
            SCRIPT_ACTIVE = true;
            Logger.info('Ready v' + META.VERSION + '. Use !combatAssistant menu or !combat-assistant help');
        }
    };

    on('ready', Events.onReady);
    on('chat:message', Events.onChatMessage);

    return Object.freeze({
        META,
        CONFIG,
        State,
        RuntimeConfig,
        Utils,
        Html,
        Render,
        RollParser,
        CombatService
    });
})();
