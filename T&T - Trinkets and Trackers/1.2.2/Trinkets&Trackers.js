/**
 * =========================================================
 * @File        Trinkets&Trackers.js
 * @Project     Trinkets and Trackers (T&T)
 * @Description Professional base prototype for commands, cards and helpers.
 * @Author      AmadeusVF
 * @Version     1.2.1
 * =========================================================
 */
const TnT = (() => {
    'use strict';

    /** -----------------------------------------------------------------------
     * @section Metadata
     * --------------------------------------------------------------------- */
    const META = Object.freeze({
        NAME: 'Trinkets & Trackers',
        DEVELOPER: 'AmadeusVF',
        SHORT_NAME: 'T&T',
        LOG_NAME: 'T&T',
        VERSION: '1.2.2',
        STATE_KEY: 'TRINKETS_AND_TRACKERS',
        SCHEMA_VERSION: 2
    });

    /** -----------------------------------------------------------------------
     * @section Config
     * --------------------------------------------------------------------- */
    const CONFIG = Object.freeze({
        DEBUG: true,
        CHAT_NAME: 'Trinkets & Trackers (T&T)',
        DEFAULT_WHISPER: true,

        DEFAULT_CARD_WIDTH: 300,
        DEFAULT_CARD_LEFT_OFFSET: -30,
        DEFAULT_CARD_TITLE_COLOR: 'rgb(255, 255, 255)',
        DEFAULT_CARD_BODY_COLOR: 'rgb(255, 255, 255)',
        DEFAULT_CARD_BORDER_COLOR: 'rgb(127, 127, 127)',
        DEFAULT_CARD_TITLE_BG_COLOR: 'rgba(0, 0, 0, 0.6)',
        DEFAULT_CARD_TITLE_LINE_COLOR: 'rgba(215, 47, 47, 0.8)',
        DEFAULT_CARD_BODY_BG_COLOR: 'rgba(0, 0, 0, 0.3)',
        DEFAULT_CARD_BODY_IMAGE_URL: 'https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTEyL3Jhd3BpeGVsX29mZmljZV80Nl9ibGFja193YWxscGFwZXJfbW9ub2Nocm9tZV9jaGluZXNlX2RyYWdvbl8yNmY3MzllOS1mYzkwLTQ3MDEtYjdmNS01NjFmMTQwMjc1OGRfMS5qcGc.jpg',

        DEFAULT_ITEM_ROW_FONT_SIZE: 12,
        DEFAULT_ITEM_ROW_IMAGE_SIZE: 24,
        DEFAULT_ITEM_ROW_HEIGHT: 28,
        DEFAULT_ITEM_COMMON_QUALITY_COLOR: 'rgb(200, 200, 200)',
        DEFAULT_ITEM_UNCOMMON_QUALITY_COLOR: 'rgb(90, 160, 70)',
        DEFAULT_ITEM_RARE_QUALITY_COLOR: 'rgb(0, 130, 170)',
        DEFAULT_ITEM_VERY_RARE_QUALITY_COLOR: 'rgb(125, 40, 175)',
        DEFAULT_ITEM_LEGENDARY_QUALITY_COLOR: 'rgb(175, 170, 40)',
        DEFAULT_ITEM_ARTIFACT_QUALITY_COLOR: 'rgb(175, 58, 40)',

        DEFAULT_TEXT_CHARACTER_COLOR: 'rgb(211, 194, 12)',
        DEFAULT_TEXT_QUANTITY_COLOR: 'rgb(52, 203, 116)',
        DEFAULT_TEXT_ITEM_COLOR: 'rgb(84, 186, 255)',
        DEFAULT_TEXT_HEAL_COLOR: 'rgb(52, 203, 116)',
        DEFAULT_TEXT_APPLIED_COLOR: 'rgb(84, 186, 255)',

        CURRENCY_FALLBACK: 'gp',
        INVENTORY_TRANSFER_MAX_DISTANCE_FT: 5
    });

    const TAG_COLOR = Object.freeze({
        DEFAULT_SOURCE_PLAYER_COLOR : 'rgb(9, 243, 235)',
        DEFAULT_TARGET_PLAYER_COLOR : 'rgb(233, 225, 17)',

        DEFAULT_ATTRIBUTE_NAME_COLOR : 'rgb(17, 168, 233)',
        DEFAULT_ATTRIBUTE_VALUE_COLOR : 'rgb(233, 168, 17)',
    });

    const ACTIONS = Object.freeze({
        INVENTORY: Object.freeze(['get', 'remove', 'add', 'buy', 'give', 'use', 'discard']),
        CURRENCY: Object.freeze(['give', 'take']),
        SHOP: Object.freeze(['get', 'list', 'buy', 'create', 'add', 'remove', 'delete', 'open', 'close', 'hide', 'reveal', 'toggle', 'blacklist', 'config', 'load', 'reload', 'export', 'menu', 'detail', 'stockmode', 'rollprice', 'price', 'stock']),
        ITEM: Object.freeze(['list', 'rawlist', 'search', 'details', 'create', 'remove', 'reload']),
        TOKEN: Object.freeze(['init', 'clear', 'attacks', 'refreshattacks', 'refreshspells', 'roll'])
    });
    const PUBLIC_ACTIONS = Object.freeze({
        INVENTORY: Object.freeze(['get', 'remove', 'give', 'use', 'discard']),
        CURRENCY: Object.freeze(['give', 'take']),
        SHOP: Object.freeze(['list', 'get', 'buy']),
        ITEM: Object.freeze(['search', 'details'])
    });
    const GM_ACTIONS = Object.freeze({
        INVENTORY: Object.freeze(['add']),
        SHOP: Object.freeze(['create', 'add', 'remove', 'delete', 'open', 'close', 'hide', 'reveal', 'toggle', 'blacklist', 'config', 'load', 'reload', 'export', 'menu', 'detail', 'stockmode', 'rollprice', 'price', 'stock']),
        ITEM: Object.freeze(['list', 'rawlist', 'create', 'remove', 'reload']),
        TOKEN: Object.freeze(['init', 'clear', 'attacks', 'refreshattacks', 'refreshspells'])
    });

    const CURRENCY_TYPES = Object.freeze(['cp', 'sp', 'gp']);
    const CURRENCY_COLORS = Object.freeze({
        cp: 'rgb(185, 115, 50)',
        sp: 'rgb(182, 182, 182)',
        gp: 'rgb(232, 197, 58)'
    });
    const SHOP_STATES = Object.freeze(['open', 'close']);
    const SHOP_DEFAULT_CONFIG = Object.freeze({
        hidePrice: false,
        hasStock: true
    });
    const SHOP_INFINITE_STOCK = 999999;

    /** -----------------------------------------------------------------------
     * @section State
     * --------------------------------------------------------------------- */
    const State = {
        defaults() {
            return {
                schemaVersion: META.SCHEMA_VERSION,
                config: {
                    debug: CONFIG.DEBUG
                },
                cache: {},
                players: {},
                itemDrafts: {},
                shops: {}
            };
        },

        ensure() {
            state[META.STATE_KEY] = state[META.STATE_KEY] || this.defaults();
            this.migrate();
            return state[META.STATE_KEY];
        },

        migrate() {
            const root = state[META.STATE_KEY];
            if (!root.schemaVersion) {
                root.schemaVersion = 1;
            }

            root.config = root.config || {};
            root.cache = root.cache || {};
            root.players = root.players || {};
            root.itemDrafts = root.itemDrafts || {};
            root.shops = root.shops || {};

            switch (root.schemaVersion) {
                case 1:
                default:
                    root.schemaVersion = META.SCHEMA_VERSION;
                    break;
            }
        },

        get() {
            return this.ensure();
        }
    };

    /** -----------------------------------------------------------------------
     * @section Logger
     * --------------------------------------------------------------------- */
    const Logger = {
        isDebugEnabled() {
            return !!State.get().config.debug;
        },

        info(...args) {
            log('[' + META.LOG_NAME + '] ' + args.join(' '));
        },

        debug(...args) {
            if (!this.isDebugEnabled()) return;
            log('[' + META.LOG_NAME + ':DEBUG] ' + args.join(' '));
        },

        error(...args) {
            log('[' + META.LOG_NAME + ':ERROR] ' + args.join(' '));
        }
    };

    /** -----------------------------------------------------------------------
     * @section Utils
     * --------------------------------------------------------------------- */
    const Utils = {
        asString(value, fallback = '') {
            return value === undefined || value === null ? fallback : String(value);
        },

        toInt(value, fallback = 0) {
            const n = parseInt(value, 10);
            return Number.isNaN(n) ? fallback : n;
        },

        toNumber(value, fallback = 0) {
            const n = Number(value);
            return Number.isNaN(n) ? fallback : n;
        },

        toBoolean(value, fallback = false) {
            if (value === undefined || value === null || String(value).trim() === '') return fallback;
            if (value === true || value === false) return value;
            const normalized = String(value).trim().toLowerCase();
            if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
            if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
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
            return Utils.escapeHtml(value);
        },

        joinStyles(styleMap = {}) {
            return Object.entries(styleMap)
                .filter(([, v]) => v !== undefined && v !== null && v !== '')
                .map(([k, v]) => k + ':' + v)
                .join(';');
        },

        splitCommand(content = '') {
            const text = Utils.asString(content).trim();
            const parts = text.split(/\s+/);
            return {
                raw: text,
                base: parts[0] || '',
                args: parts.slice(1)
            };
        },

        splitArgsAndQty(args = [], defaultQty = 1) {
            const safeArgs = Array.isArray(args) ? args.slice() : [];
            let qty = Math.max(1, Utils.toInt(defaultQty, 1));
            if (!safeArgs.length) {
                return { args: safeArgs, qty };
            }

            const maybeQty = Utils.toInt(safeArgs[safeArgs.length - 1], NaN);
            if (!Number.isNaN(maybeQty)) {
                qty = Math.max(1, maybeQty);
                safeArgs.pop();
            }
            return { args: safeArgs, qty };
        },

        uniqueNames(list = []) {
            const seen = {};
            const out = [];
            const safeList = Array.isArray(list) ? list : [];

            for (let i = 0; i < safeList.length; i += 1) {
                const name = String(safeList[i] || '').trim();
                const key = name.toLowerCase();
                if (!name || seen[key]) continue;
                seen[key] = true;
                out.push(name);
            }

            return out;
        }
    };

    /** -----------------------------------------------------------------------
     * @section HTML Helpers
     * --------------------------------------------------------------------- */
    const Html = {
        tag(tagName, content = '', style = '') {
            const styleAttr = style ? ' style="' + style + '"' : '';
            return '<' + tagName + styleAttr + '>' + content + '</' + tagName + '>';
        },

        span(content = '', style = '') {
            return this.tag('span', content, style);
        },

        div(content = '', style = '') {
            return this.tag('div', content, style);
        },

        img(src = '', style = '') {
            return '<img src="' + Utils.attrSafe(src) + '" style="' + style + '" />';
        },

        button({ text = 'OK', command = '', style = '' } = {}) {
            const safeText = Utils.escapeHtml(text);
            const safeCommand = Utils.asString(command)
                .replace(/"/g, '&quot;')
                .replace(/[\r\n]+/g, ' ');

            return (
                '<a href="' + safeCommand + '" style="' + style + '">' +
                    safeText +
                '</a>'
            );
        },

        tooltip(innerHtml, tipHtml = '') {
            return (
                '<span class="showtip tipsy" title="' + Utils.attrSafe(tipHtml) + '">' +
                    innerHtml +
                '</span>'
            );
        },

        card({ title = '', body = '', buildOptions = {} } = {}) {
            const width = (Number(buildOptions.width) || CONFIG.DEFAULT_CARD_WIDTH);
            const leftOffset = (Number(buildOptions.leftOffset) || CONFIG.DEFAULT_CARD_LEFT_OFFSET);

            const titleAlign = (buildOptions.titleAlign || 'center');
            const bodyAlign = (buildOptions.bodyAlign || 'center');

            const titleColor = (buildOptions.titleColor || CONFIG.DEFAULT_CARD_TITLE_COLOR);
            const bodyColor = (buildOptions.bodyColor || CONFIG.DEFAULT_CARD_BODY_COLOR);

            const borderColor = (buildOptions.borderColor || CONFIG.DEFAULT_CARD_BORDER_COLOR);
            const titleBgColor = (buildOptions.titleBgColor || CONFIG.DEFAULT_CARD_TITLE_BG_COLOR);
            const titleLineColor = (buildOptions.titleLineColor || CONFIG.DEFAULT_CARD_TITLE_LINE_COLOR);
            const bodyBgColor = (buildOptions.bodyBgColor || CONFIG.DEFAULT_CARD_BODY_BG_COLOR);

            const bgImageURL = (buildOptions.bgImageURL || CONFIG.DEFAULT_CARD_BODY_IMAGE_URL);
            const bgOverlayStart = (buildOptions.bgOverlayStart || 'rgba(0, 0, 0, 0.7)');
            const bgOverlayEnd = (buildOptions.bgOverlayEnd || 'rgba(0, 0, 0, 0.7)');
            const titleHtml = Utils.isNonEmptyString(buildOptions.titleHtml)
                ? String(buildOptions.titleHtml)
                : Utils.escapeHtml(title);

            return (
                '<div style="display:block;width:calc(100% + ' + Math.abs(leftOffset) + 'px);margin-left:' + leftOffset + 'px;text-align:left;box-sizing:border-box;">' +
                    '<div style="' +
                        'display:block;' +
                        'width:' + width + 'px;' +
                        'max-width:100%;' +
                        'background-image:linear-gradient(' + bgOverlayStart + ',' + bgOverlayEnd + '), url(\'' + bgImageURL + '\');' +
                        'background-size:cover;' +
                        'background-position:center top;' +
                        'background-repeat:no-repeat;' +
                        'background-attachment:fixed;' +
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

    const Handout = {
        normalizeField(field = 'notes') {
            const safeField = String(field || '').trim().toLowerCase();
            return safeField === 'gmnotes' ? 'gmnotes' : 'notes';
        },

        normalizeRef(handoutRef) {
            if (handoutRef === undefined || handoutRef === null) return '';
            return String(handoutRef).trim();
        },

        isHandoutObject(handoutRef) {
            return !!(
                handoutRef &&
                Utils.isFunction(handoutRef.get) &&
                Utils.isFunction(handoutRef.set) &&
                handoutRef.get('_type') === 'handout'
            );
        },

        getByName(name) {
            const exact = findObjs({
                type: 'handout',
                name: name
            })[0];

            if (exact) return exact;

            const safeName = String(name || '').trim().toLowerCase();
            if (!safeName) return null;

            const allHandouts = findObjs({
                type: 'handout'
            });

            return allHandouts.find((handout) => {
                const currentName = String(handout.get('name') || '').trim().toLowerCase();
                return currentName === safeName;
            }) || null;
        },

        toRefLabel(handoutRef) {
            if (this.isHandoutObject(handoutRef)) {
                return '"' + (handoutRef.get('name') || handoutRef.id || 'unknown') + '"';
            }
            return '"' + this.normalizeRef(handoutRef) + '"';
        },

        get(handoutRef) {
            if (!handoutRef) return null;

            if (this.isHandoutObject(handoutRef)) {
                return handoutRef;
            }

            const ref = this.normalizeRef(handoutRef);
            if (!ref) return null;

            return getObj('handout', ref) || this.getByName(ref);
        },

        ensure(handoutRef) {
            const existing = this.get(handoutRef);
            if (existing) return existing;

            const ref = this.normalizeRef(handoutRef);
            if (!ref) return null;

            return createObj('handout', {
                name: ref
            });
        },

        read(handoutRef, field = 'gm', options = {}) {
            const createIfMissing = !!options.createIfMissing;
            const handout = createIfMissing ? this.ensure(handoutRef) : this.get(handoutRef);
            const safeField = this.normalizeField(field);

            return new Promise((resolve, reject) => {
                if (!handout) {
                    reject(new Error('Handout not found: ' + this.toRefLabel(handoutRef)));
                    return;
                }

                try {
                    handout.get(safeField, (value) => {
                        resolve(String(value || ''));
                    });
                } catch (error) {
                    reject(error);
                }
            });
        },

        write(handoutRef, value = '', field = 'gm', options = {}) {
            const createIfMissing = !!options.createIfMissing;
            const append = !!options.append;
            const handout = createIfMissing ? this.ensure(handoutRef) : this.get(handoutRef);
            const safeField = this.normalizeField(field);
            const nextValue = String(value || '');

            return new Promise((resolve, reject) => {
                if (!handout) {
                    reject(new Error('Handout not found: ' + this.toRefLabel(handoutRef)));
                    return;
                }

                const save = (content) => {
                    try {
                        handout.set(safeField, content);
                        resolve(true);
                    } catch (error) {
                        reject(error);
                    }
                };

                if (!append) {
                    save(nextValue);
                    return;
                }

                handout.get(safeField, (currentValue) => {
                    save(String(currentValue || '') + nextValue);
                });
            });
        }
    };

    /** -----------------------------------------------------------------------
     * @section Roll20 Adapter
     * --------------------------------------------------------------------- */
    const R20 = {
        send(message, callback = null) {
            if (Utils.isFunction(callback)) {
                sendChat(CONFIG.CHAT_NAME, message, callback);
                return;
            }
            sendChat(CONFIG.CHAT_NAME, message);
        },

        direct(html) {
            this.send('/direct ' + html);
        },

        whisper(target, html) {
            this.send('/w "' + Utils.asString(target) + '" ' + html);
        },

        getSelectedToken(msg) {
            const id = msg?.selected?.[0]?._id;
            return id ? getObj('graphic', id) : null;
        },

        getCharacterFromToken(token) {
            if (!token) return null;
            const charId = token.get('represents');
            return charId ? getObj('character', charId) : null;
        },

        getTokenById(tokenId) {
            const id = String(tokenId || '').trim();
            return id ? getObj('graphic', id) : null;
        },

        parseTokenRef(tokenRef = '') {
            const parts = String(tokenRef || '').trim().split('|');
            return {
                tokenId: String(parts[0] || '').trim(),
                characterId: String(parts[1] || '').trim(),
                pageId: String(parts[2] || '').trim()
            };
        },

        makeTokenRef(token) {
            if (!token) return '';
            const tokenId = String(token.id || '').trim();
            const characterId = String(token.get('represents') || '').trim();
            const pageId = String(token.get('_pageid') || token.get('pageid') || '').trim();
            return [tokenId, characterId, pageId].filter((value) => value !== '').join('|');
        },

        findTokenByCharacterId(characterId = '', pageId = '') {
            const safeCharacterId = String(characterId || '').trim();
            const safePageId = String(pageId || '').trim();
            if (!safeCharacterId) return null;

            const tokens = findObjs({ _type: 'graphic' })
                .filter((token) => {
                    if (!token) return false;
                    if (String(token.get('represents') || '').trim() !== safeCharacterId) return false;
                    if (safePageId) {
                        const tokenPageId = String(token.get('_pageid') || token.get('pageid') || '').trim();
                        if (tokenPageId !== safePageId) return false;
                    }
                    return true;
                });

            return tokens[0] || null;
        },

        resolveTokenRef(tokenRef = '') {
            const parsed = this.parseTokenRef(tokenRef);
            let token = this.getTokenById(parsed.tokenId);
            let resolvedByCharacter = false;

            if (!token && parsed.characterId) {
                token = this.findTokenByCharacterId(parsed.characterId, parsed.pageId);
                resolvedByCharacter = !!token;
            }

            const character = this.getCharacterFromToken(token) ||
                (parsed.characterId ? getObj('character', parsed.characterId) : null);
            const tokenName = String(
                (token && token.get('name')) ||
                (character && character.get('name')) ||
                parsed.tokenId ||
                tokenRef ||
                'Unknown'
            ).trim();

            return {
                token,
                character,
                tokenName,
                tokenId: token ? String(token.id || '').trim() : parsed.tokenId,
                characterId: character ? String(character.id || '').trim() : parsed.characterId,
                pageId: token ? String(token.get('_pageid') || token.get('pageid') || '').trim() : parsed.pageId,
                originalRef: String(tokenRef || '').trim(),
                resolvedByCharacter
            };
        },

        parsePlayerAccessList(value) {
            return String(value || '')
                .split(',')
                .map((entry) => String(entry || '').trim())
                .filter(Boolean);
        },

        hasPlayerAccess(value, playerId = '') {
            const safePlayerId = String(playerId || '').trim();
            const entries = this.parsePlayerAccessList(value);
            if (entries.includes('all')) return true;
            if (!safePlayerId) return false;
            return entries.includes(safePlayerId);
        },

        getCharacterAccessFlags(character, playerId = '', isGM = false) {
            if (isGM) {
                return {
                    journalAccess: true,
                    controlAccess: true,
                    hasAccess: true,
                    isGM: true
                };
            }

            if (!character) {
                return {
                    journalAccess: false,
                    controlAccess: false,
                    hasAccess: false,
                    isGM: false
                };
            }

            const journalAccess = this.hasPlayerAccess(character.get('inplayerjournals'), playerId);
            const controlAccess = this.hasPlayerAccess(character.get('controlledby'), playerId);

            return {
                journalAccess,
                controlAccess,
                hasAccess: journalAccess && controlAccess,
                isGM: false
            };
        },

        getSourceTokenAccess({ sourceTokenId = '', playerId = '', isGM = false } = {}) {
            const resolved = this.resolveTokenRef(sourceTokenId);
            const token = resolved.token;
            const character = resolved.character;
            const tokenName = String(
                resolved.tokenName ||
                sourceTokenId ||
                'Unknown'
            ).trim();
            const access = this.getCharacterAccessFlags(character, playerId, isGM);

            return {
                token,
                character,
                tokenName,
                tokenId: resolved.tokenId,
                characterId: resolved.characterId,
                pageId: resolved.pageId,
                resolvedByCharacter: resolved.resolvedByCharacter,
                ...access
            };
        },

        requireSourceTokenAccess({ sourceTokenId = '', playerId = '', isGM = false, actionLabel = 'use' } = {}) {
            const access = this.getSourceTokenAccess({
                sourceTokenId,
                playerId,
                isGM
            });

            if (!access.token) {
                return { ok: false, message: 'Source token was not found.', access };
            }

            if (!access.character) {
                return { ok: false, message: 'Source token is not linked to a character.', access };
            }

            if (!access.hasAccess) {
                return {
                    ok: false,
                    message:
                        'You cannot ' + String(actionLabel || 'use') +
                        ' <b>' + Utils.escapeHtml(access.tokenName || sourceTokenId) + '</b>.<br>' +
                        'You need both journal and control access to this character.',
                    access
                };
            }

            return { ok: true, access };
        },

        sendSourceAccessFailure(who = 'GM', title = 'Access Denied', accessResult = {}, type = 'failure') {
            const safeResult = accessResult || {};
            Render.sendWhisperMessage(
                who,
                title,
                safeResult.message || 'You need both journal and control access to this character.',
                type
            );

            const access = safeResult.access || {};
            if (access && access.token && !access.hasAccess) {
                Render.sendWhisperMessage(
                    'GM',
                    title,
                    Html.span(Utils.escapeHtml(who), 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:700;') +
                    ' attempted to use ' +
                    Html.span(Utils.escapeHtml(access.tokenName || 'Unknown'), 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:700;') +
                    ' as a source token.<br>' +
                    'Journal access: <b>' + (access.journalAccess ? 'true' : 'false') + '</b> | ' +
                    'Control access: <b>' + (access.controlAccess ? 'true' : 'false') + '</b>.',
                    'warning'
                );
            }
        },

        getControllerDisplayNames(character) {
            if (!character) return [];

            const controllersRaw = String(character.get('controlledby') || '');
            const controllerIds = controllersRaw
                .split(',')
                .map((id) => String(id || '').trim())
                .filter((id) => id && id !== 'all');

            const names = controllerIds
                .map((id) => {
                    const player = getObj('player', id);
                    if (!player) return '';
                    return String(player.get('_displayname') || player.get('displayname') || '').trim();
                })
                .filter(Boolean);

            return Utils.uniqueNames(names);
        },

        getTokenContext(tokenId = '', fallbackName = '') {
            const resolved = this.resolveTokenRef(tokenId);
            const token = resolved.token;
            const character = resolved.character;
            const tokenName = String(
                resolved.tokenName ||
                fallbackName ||
                tokenId
            ).trim();

            return {
                token,
                character,
                tokenId: resolved.tokenId,
                characterId: resolved.characterId,
                tokenName,
                controllerNames: this.getControllerDisplayNames(character)
            };
        },

        async getSheet(characterId, attrName, prop) {
            return prop ? getSheetItem(characterId, attrName, prop) : getSheetItem(characterId, attrName);
        },

        async setSheet(characterId, attrName, value, options = {}) {
            const safeCharacterId = String(characterId || '').trim();
            const safeAttrName = String(attrName || '').trim();
            const protectStore = !(options && options.protectStore === false);
            const snapshotValue = options && Object.prototype.hasOwnProperty.call(options, 'snapshotValue')
                ? options.snapshotValue
                : value;
            let storeSnapshot = null;
            let storeCurrentAfterSet = null;

            if (protectStore && safeCharacterId && safeAttrName.toLowerCase() !== 'store') {
                storeSnapshot = InventoryService.snapshotInventoryStoreAttribute(safeCharacterId);
            }

            try {
                const result = await setSheetItem(characterId, attrName, value);
                if (storeSnapshot) {
                    const afterSnapshot = InventoryService.snapshotInventoryStoreAttribute(safeCharacterId);
                    storeCurrentAfterSet = afterSnapshot ? afterSnapshot.current : null;
                }
                return result;
            } finally {
                if (storeSnapshot) {
                    InventoryService.updateInventorySnapshotValue(
                        storeSnapshot,
                        InventoryService.getSheetSnapshotCandidateKeys(safeAttrName),
                        snapshotValue,
                        { currentAfterSet: storeCurrentAfterSet }
                    );
                    InventoryService.restoreInventoryStoreAttribute(
                        storeSnapshot,
                        'after-setSheetItem:' + safeAttrName
                    );
                }
            }
        }
    };

    /** -----------------------------------------------------------------------
     * @section Models
     * --------------------------------------------------------------------- */
    class ItemRawData {
        constructor({
            id = '',
            templateId = '',

            name = '',
            abbreviation = '',
            description = '',
            quantity = 0,
            weight = 0,
            AC = '',
            modifier = '',
            debuff = '',
            requirement = '',

            type = '',
            subtype = '',

            rarity = 'common',
            defaultPrice = 0,
            defaultPriceType = 'gp',
            imageUrl = '',

            effect = '',
            diceCount = 0,
            diceSide = 0,
            bonus = 0,
            rollBonus = 0,
            area = 'single',

            damage = '',
            damageType = '',
            properties = '',
            mastery = '',
            tags = '',

            equippable = false,
            equipped = false,
            attunement = false,
            attuned = false,
            attunementPrerequisite = '',

            consumable = false,
            usable = false,
            useTarget = true,
            useRange = '',
            consumableRange = '',
            questItem = false,
        } = {}) {
            this.id = String(id);
            this.templateId = String(templateId);

            this.name = String(name);
            this.abbreviation = String(abbreviation);
            this.description = String(description);
            this.quantity = Math.max(0, Number(quantity) || 0);
            this.weight = Number(weight) || 0;
            this.AC = String(AC);
            this.modifier = String(modifier);
            this.debuff = String(debuff);
            this.requirement = String(requirement);

            this.type = String(type);
            this.subtype = String(subtype);

            this.rarity = String(rarity || 'common');
            this.defaultPrice = Number(defaultPrice) || 0;
            this.defaultPriceType = String(defaultPriceType || 'gp');
            this.imageUrl = String(imageUrl);

            this.effect = String(effect);
            this.diceCount = Number(diceCount) || 0;
            this.diceSide = Number(diceSide) || 0;
            this.bonus = Number(bonus) || 0;
            this.rollBonus = Number(rollBonus) || 0;
            this.area = String(area || 'single');

            this.damage = String(damage);
            this.damageType = String(damageType);
            this.properties = String(properties);
            this.mastery = String(mastery);
            this.tags = String(tags);

            this.equippable = Utils.toBoolean(equippable, false);
            this.equipped = Utils.toBoolean(equipped, false);
            this.attunement = Utils.toBoolean(attunement, false);
            this.attuned = Utils.toBoolean(attuned, false);
            this.attunementPrerequisite = String(attunementPrerequisite);

            this.consumable = Utils.toBoolean(consumable, false);
            this.usable = Utils.toBoolean(usable, false);
            this.useTarget = Utils.toBoolean(useTarget, true);
            this.useRange = String(useRange || consumableRange || '');
            this.consumableRange = this.useRange;
            this.questItem = Utils.toBoolean(questItem, false);
        }
    }

    class ShopItemRecord extends ItemRawData {
        constructor(data = {}) {
            const input = (data && typeof data === 'object') ? data : {};
            const safeName = String(input.name || input.recordName || '').trim();
            const catalogItem = ItemCatalog.getByName(safeName);
            const merged = Object.assign({}, catalogItem || {}, input);
            const defaultPrice = Number(merged.defaultPrice) || 0;
            const defaultPriceType = String(merged.defaultPriceType || CONFIG.CURRENCY_FALLBACK);
            const explicitPrice = input.price !== null &&
                input.price !== undefined &&
                String(input.price).trim() !== '' &&
                String(input.price).trim() !== '-';
            const explicitPriceType = input.priceType !== null &&
                input.priceType !== undefined &&
                String(input.priceType).trim() !== '' &&
                String(input.priceType).trim() !== '-';
            const quantityValue = input.quantity === null || input.quantity === undefined || String(input.quantity).trim() === ''
                ? SHOP_INFINITE_STOCK
                : Math.max(1, Utils.toInt(input.quantity, SHOP_INFINITE_STOCK));
            const stockValue = input.stock === null || input.stock === undefined || String(input.stock).trim() === ''
                ? quantityValue
                : Math.max(0, Utils.toInt(input.stock, quantityValue));

            merged.name = String(merged.name || safeName).trim();
            merged.quantity = quantityValue;
            merged.defaultPrice = explicitPrice ? (Number(input.price) || 0) : defaultPrice;
            merged.defaultPriceType = explicitPriceType
                ? (InventoryService.normalizeCurrencyType(input.priceType) || defaultPriceType)
                : defaultPriceType;

            super(merged);

            this.id = String(merged.id || this.name).trim();
            this.quantity = quantityValue;
            this.stock = stockValue;
            this.price = Number(merged.defaultPrice) || 0;
            this.priceType = InventoryService.normalizeCurrencyType(merged.defaultPriceType) || CONFIG.CURRENCY_FALLBACK;
            this.hidden = Utils.toBoolean(input.hidden, false);
            this.tags = String(input.tags !== undefined ? input.tags : this.tags || '');
        }

        isInfiniteStock() {
            return Math.max(0, Utils.toInt(this.stock, 0)) >= SHOP_INFINITE_STOCK;
        }

        toJSON() {
            return Object.assign({}, this, {
                quantity: this.quantity,
                stock: this.stock,
                price: this.price,
                priceType: this.priceType,
                defaultPrice: this.price,
                defaultPriceType: this.priceType,
                hidden: this.hidden,
                tags: this.tags
            });
        }
    }

    class Shop {
        constructor({
            id = '',
            name = '',
            itemList = [],
            state = 'close',
            hidden = undefined,
            config = {},
            blacklist = [],
            location = [],
            salesLedger = [],
            itemsSold = [],
            earnings = {},
            createdAt = 0,
            updatedAt = 0
        } = {}) {
            const now = Date.now();
            this.id = Shop.normalizeId(id || name);
            this.name = String(name || this.id || 'Shop').trim();
            this.itemList = (Array.isArray(itemList) ? itemList : [])
                .map((item) => new ShopItemRecord(item))
                .filter((item) => item.name);
            const legacyHiddenState = String(state || '').trim().toLowerCase() === 'hidden';
            this.state = Shop.normalizeState(state);
            this.hidden = Utils.toBoolean(hidden, legacyHiddenState);
            this.config = Object.assign({}, SHOP_DEFAULT_CONFIG, config || {});
            this.config.hidePrice = Utils.toBoolean(this.config.hidePrice, SHOP_DEFAULT_CONFIG.hidePrice);
            this.config.hasStock = Utils.toBoolean(this.config.hasStock, SHOP_DEFAULT_CONFIG.hasStock);
            this.blacklist = Utils.uniqueNames(Array.isArray(blacklist) ? blacklist : []);
            this.location = Shop.normalizeLocation(location);
            this.salesLedger = Shop.normalizeSalesLedger(Array.isArray(salesLedger) && salesLedger.length ? salesLedger : itemsSold);
            this.earnings = Shop.normalizeEarnings(earnings);
            this.createdAt = Number(createdAt) || now;
            this.updatedAt = Number(updatedAt) || now;
        }

        static normalizeId(value = '') {
            return String(value || '')
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        static normalizeState(value = '') {
            const safeState = String(value || '').trim().toLowerCase();
            if (safeState === 'closed') return 'close';
            if (safeState === 'hidden') return 'close';
            return SHOP_STATES.includes(safeState) ? safeState : 'close';
        }

        static normalizeLocation(value = []) {
            const source = Array.isArray(value)
                ? value
                : String(value || '').split(',');
            return Utils.uniqueNames(
                source
                    .map((entry) => String(entry || '').trim())
                    .filter(Boolean)
            );
        }

        static normalizeSalesLedger(value = []) {
            const source = Array.isArray(value) ? value : [];
            const byName = {};

            for (let i = 0; i < source.length; i += 1) {
                const entry = source[i] || {};
                const name = String(entry.name || entry.itemName || '').trim();
                if (!name) continue;
                const key = name.toLowerCase();
                const quantity = Math.max(0, Utils.toInt(entry.quantity || entry.qty || entry.sold, 0));
                if (!byName[key]) byName[key] = { name, quantity: 0 };
                byName[key].quantity += quantity;
            }

            return Object.keys(byName)
                .map((key) => byName[key])
                .filter((entry) => entry.quantity > 0)
                .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
        }

        static normalizeEarnings(value = {}) {
            const safeValue = value && typeof value === 'object' ? value : {};
            return {
                cp: Math.max(0, Utils.toInt(safeValue.cp, 0)),
                sp: Math.max(0, Utils.toInt(safeValue.sp, 0)),
                gp: Math.max(0, Utils.toInt(safeValue.gp, 0))
            };
        }

        isOpen() {
            return this.state === 'open';
        }

        isHidden() {
            return Utils.toBoolean(this.hidden, false);
        }

        findItem(itemName = '') {
            const key = String(itemName || '').trim().toLowerCase();
            if (!key) return null;
            return this.itemList.find((item) => String(item.name || '').trim().toLowerCase() === key) || null;
        }

        upsertItem(itemData = {}) {
            const nextItem = new ShopItemRecord(itemData);
            if (!nextItem.name) return null;

            const existing = this.findItem(nextItem.name);
            if (existing) {
                Object.assign(existing, nextItem.toJSON());
            } else {
                this.itemList.push(nextItem);
            }

            this.updatedAt = Date.now();
            return nextItem;
        }

        removeItem(itemName = '') {
            const key = String(itemName || '').trim().toLowerCase();
            const before = this.itemList.length;
            this.itemList = this.itemList.filter((item) => String(item.name || '').trim().toLowerCase() !== key);
            if (this.itemList.length !== before) this.updatedAt = Date.now();
            return before !== this.itemList.length;
        }

        isBlacklisted(identity = '') {
            const key = String(identity || '').trim().toLowerCase();
            if (!key) return false;
            return this.blacklist.some((entry) => String(entry || '').trim().toLowerCase() === key);
        }

        getTotalItemsSold() {
            return this.salesLedger.reduce((total, entry) => total + Math.max(0, Utils.toInt(entry.quantity, 0)), 0);
        }

        getEarningsGpFloor() {
            const cp = Math.max(0, Utils.toInt(this.earnings.cp, 0));
            const sp = Math.max(0, Utils.toInt(this.earnings.sp, 0));
            const gp = Math.max(0, Utils.toInt(this.earnings.gp, 0));
            return gp + Math.floor(sp / 10) + Math.floor(cp / 100);
        }

        recordSale({ itemName = '', quantity = 1, currencyType = '', amount = 0 } = {}) {
            const safeName = String(itemName || '').trim();
            const qty = Math.max(1, Utils.toInt(quantity, 1));
            if (safeName) {
                const key = safeName.toLowerCase();
                let entry = this.salesLedger.find((row) => String(row.name || '').trim().toLowerCase() === key);
                if (!entry) {
                    entry = { name: safeName, quantity: 0 };
                    this.salesLedger.push(entry);
                }
                entry.quantity = Math.max(0, Utils.toInt(entry.quantity, 0)) + qty;
                this.salesLedger = Shop.normalizeSalesLedger(this.salesLedger);
            }

            const coinType = InventoryService.normalizeCurrencyType(currencyType);
            const coinAmount = Math.max(0, Utils.toInt(amount, 0));
            if (coinType && coinAmount > 0) {
                this.earnings[coinType] = Math.max(0, Utils.toInt(this.earnings[coinType], 0)) + coinAmount;
            }

            this.updatedAt = Date.now();
        }

        toJSON() {
            return {
                id: this.id,
                name: this.name,
                itemList: this.itemList.map((item) => item.toJSON()),
                state: this.state,
                hidden: this.isHidden(),
                config: Object.assign({}, this.config),
                blacklist: this.blacklist.slice(),
                location: this.location.slice(),
                salesLedger: this.salesLedger.map((entry) => ({
                    name: entry.name,
                    quantity: Math.max(0, Utils.toInt(entry.quantity, 0))
                })),
                earnings: Object.assign({}, this.earnings),
                createdAt: this.createdAt,
                updatedAt: this.updatedAt
            };
        }
    }

    class ChatCommand {
        constructor({
            name = '',
            description = '',
            trigger = '',
            callback = null,
            useToken = false,
            enabled = true,
            gmOnly = false
        } = {}) {
            this.name = String(name);
            this.description = String(description);
            this.trigger = (Array.isArray(trigger) ? trigger : [trigger])
                .map((entry) => String(entry || '').trim())
                .filter(Boolean);
            this.callback = (typeof callback === 'function') ? callback : null;
            this.useToken = Boolean(useToken);
            this.enabled = Boolean(enabled);
            this.gmOnly = Boolean(gmOnly);
        }

        matches(content = '') {
            const parsed = Utils.splitCommand(content);
            return this.enabled && this.trigger.includes(parsed.base);
        }

        async execute(ctx = {}) {
            if (!this.callback) return null;
            return this.callback(ctx);
        }
    }

    /** ---------------------------------------------------------------------------
     * @section Catalogs
     * ------------------------------------------------------------------------- */
    const ItemCatalog = {
        byId: {},
        handoutRef: 'T&T Items Catalog',
        field: 'notes',
        raw: '',

        clear() {
            this.byId = {};
        },

        register(rawItemData = {}) {
            const item = new ItemRawData(rawItemData);
            if (!item.id) return null;
            this.byId[item.id] = item;
            return item;
        },

        getByID(itemId = '') {
            return this.byId[String(itemId)] || null;
        },

        getByName(itemName = '') {
            const safeName = String(itemName || '').trim().toLowerCase();
            if (!safeName) return null;

            return Object.values(this.byId).find(item =>
                String(item.name || '').trim().toLowerCase() === safeName
            ) || null;
        },

        getAll() {
            return Object.values(this.byId);
        }
    };

    const ItemsTemplateCatalog = {
        data: [],
        byKey: {},
        byNameKey: {},
        byNormalizedNameKey: {},
        handoutRef: 'T&T Items Template',
        field: 'notes',
        raw: '',

        clear() {
            this.data = [];
            this.byKey = {};
            this.byNameKey = {};
            this.byNormalizedNameKey = {};
        },

        normalizeNameKey(value = '') {
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

        setEntries(entries = []) {
            this.clear();
            const safeEntries = Array.isArray(entries) ? entries : [];

            for (let i = 0; i < safeEntries.length; i += 1) {
                const entry = safeEntries[i];
                if (!entry || typeof entry !== 'object') continue;
                if (!entry.record || typeof entry.record !== 'object') continue;
                if (!entry.record.node || typeof entry.record.node !== 'object') continue;

                this.data.push(entry);
                if (entry.templateKey) this.byKey[entry.templateKey] = entry;
                if (entry.sourceKey && entry.nameKey) this.byKey[entry.sourceKey + '::' + entry.nameKey] = entry;
                if (entry.nameKey) this.byNameKey[entry.nameKey] = entry;
                const normalizedNameKey = this.normalizeNameKey(entry.name || entry.nameKey);
                if (normalizedNameKey) this.byNormalizedNameKey[normalizedNameKey] = entry;
            }
        },

        get(source = 'store', itemName = '') {
            const key = String(source || 'store').trim().toLowerCase() + '::' + String(itemName || '').trim().toLowerCase();
            const entry = this.byKey[key] || null;
            return entry && entry.record ? entry.record : null;
        },

        getAny(itemName = '') {
            const nameKey = String(itemName || '').trim().toLowerCase();
            if (!nameKey) return null;
            if (this.byNameKey[nameKey] && this.byNameKey[nameKey].record) return this.byNameKey[nameKey].record;
            const normalizedNameKey = this.normalizeNameKey(itemName);
            if (normalizedNameKey && this.byNormalizedNameKey[normalizedNameKey] && this.byNormalizedNameKey[normalizedNameKey].record) {
                return this.byNormalizedNameKey[normalizedNameKey].record;
            }
            for (let i = 0; i < this.data.length; i += 1) {
                const entry = this.data[i];
                if (entry && entry.nameKey === nameKey && entry.record) return entry.record;
            }
            return null;
        },

        getAll() {
            return this.data.slice();
        }
    };

    const ShopCatalog = {
        byId: {},
        handoutRef: 'T&T Shop Catalog',
        field: 'notes',
        raw: '',

        clear() {
            this.byId = {};
        },

        register(rawShopData = {}) {
            const shop = rawShopData instanceof Shop ? rawShopData : new Shop(rawShopData);
            if (!shop.id) return null;
            this.byId[shop.id] = shop;
            return shop;
        },

        get(shopId = '') {
            return this.byId[Shop.normalizeId(shopId)] || null;
        },

        getAll() {
            return Object.values(this.byId);
        }
    };

    /** -----------------------------------------------------------------------
     * @section Registries
     * --------------------------------------------------------------------- */
    const Registry = {
        commands: new Map(),

        registerCommand(command) {
            if (!(command instanceof ChatCommand)) {
                throw new Error('registerCommand expects ChatCommand');
            }

            command.trigger.forEach((key) => {
                this.commands.set(key, command);
            });

            return command;
        },

        getCommand(content = '') {
            const parsed = Utils.splitCommand(content);
            return this.commands.get(parsed.base) || null;
        }
    };

    /** -----------------------------------------------------------------------
     * @section Services
     * --------------------------------------------------------------------- */
    const InventoryService = {

        async loadItemCatalogFromHandout(handoutRef = ItemCatalog.handoutRef, field = ItemCatalog.field) {
            const rawContent = await Handout.read(handoutRef, field);
            const parsed = this.tryParseHandoutPayload(rawContent);
            const sourceItems = Array.isArray(parsed)
                ? parsed
                : (parsed && Array.isArray(parsed.items) ? parsed.items : []);

            ItemCatalog.handoutRef = String(handoutRef || ItemCatalog.handoutRef);
            ItemCatalog.field = String(field || ItemCatalog.field);
            ItemCatalog.raw = rawContent;
            ItemCatalog.clear();

            sourceItems.forEach((rawItem, index) => {
                const normalizedItem = Object.assign({}, rawItem);
                if (!normalizedItem.abbreviation && normalizedItem.abreviation) {
                    normalizedItem.abbreviation = normalizedItem.abreviation;
                }
                if (!normalizedItem.id) {
                    normalizedItem.id = 'item_' + (index + 1);
                }

                ItemCatalog.register(normalizedItem);
            });

            return ItemCatalog.getAll();
        },

        async loadItemTemplatesFromHandout(handoutRef = ItemsTemplateCatalog.handoutRef) {
            const safeRef = String(handoutRef || ItemsTemplateCatalog.handoutRef).trim();
            let notesRaw = '';
            let gmnotesRaw = '';

            try {
                notesRaw = await Handout.read(safeRef, 'notes');
            } catch (error) {}
            try {
                gmnotesRaw = await Handout.read(safeRef, 'gmnotes');
            } catch (error) {}

            ItemsTemplateCatalog.handoutRef = safeRef;
            ItemsTemplateCatalog.raw = notesRaw || gmnotesRaw || '';
            ItemsTemplateCatalog.clear();

            let templatesArray = this.tryParseTemplateEntries(notesRaw);
            if (!Array.isArray(templatesArray) || !templatesArray.length) {
                templatesArray = this.tryParseTemplateEntries(gmnotesRaw);
            }
            if (!Array.isArray(templatesArray) || !templatesArray.length) return [];

            const normalizedEntries = templatesArray
                .map((entry) => this.normalizeTemplateEntry(entry))
                .filter((entry) => entry && entry.record && entry.record.node);

            ItemsTemplateCatalog.setEntries(normalizedEntries);
            return ItemsTemplateCatalog.getAll();
        },

        toIntOrNull(value) {
            const parsed = parseInt(String(value === undefined || value === null ? '' : value).trim(), 10);
            return Number.isNaN(parsed) ? null : parsed;
        },

        normalizeSourceKey() {
            return 'store';
        },

        isTargetWithinTransferDistance(sourceTokenId = '', targetTokenId = '', maxDistanceFt = CONFIG.INVENTORY_TRANSFER_MAX_DISTANCE_FT) {
            const sourceId = String(sourceTokenId || '').trim();
            const targetId = String(targetTokenId || '').trim();
            const maxDistance = Math.max(0, Number(maxDistanceFt) || 0);
            if (!sourceId || !targetId) {
                return { ok: false, distanceFt: 0, maxDistanceFt: maxDistance, message: 'Missing source or target token.' };
            }

            const sourceResolved = R20.resolveTokenRef(sourceId);
            const targetResolved = R20.resolveTokenRef(targetId);
            const sourceToken = sourceResolved.token;
            const targetToken = targetResolved.token;
            if (!sourceToken || !targetToken) {
                return { ok: false, distanceFt: 0, maxDistanceFt: maxDistance, message: 'Source or target token was not found.' };
            }

            const sourcePageId = String(sourceToken.get('_pageid') || sourceToken.get('pageid') || '').trim();
            const targetPageId = String(targetToken.get('_pageid') || targetToken.get('pageid') || '').trim();
            if (!sourcePageId || !targetPageId || sourcePageId !== targetPageId) {
                return { ok: false, distanceFt: Infinity, maxDistanceFt: maxDistance, message: 'Tokens must be on the same page.' };
            }

            const pageObj = getObj('page', sourcePageId);
            const feetPerCell = Math.max(1, Number(pageObj && pageObj.get('scale_number')) || 5);
            const pxPerCell = 70;
            const sx = Number(sourceToken.get('left')) || 0;
            const sy = Number(sourceToken.get('top')) || 0;
            const tx = Number(targetToken.get('left')) || 0;
            const ty = Number(targetToken.get('top')) || 0;
            const dxCells = Math.abs(sx - tx) / pxPerCell;
            const dyCells = Math.abs(sy - ty) / pxPerCell;
            const distanceCells = Math.max(dxCells, dyCells);
            const distanceFt = distanceCells * feetPerCell;

            return {
                ok: distanceFt <= maxDistance,
                distanceFt,
                maxDistanceFt: maxDistance,
                message: (distanceFt <= maxDistance)
                    ? 'Target is within range.'
                    : Html.span(
                        Utils.escapeHtml(String(targetResolved.tokenName || 'Target')),
                        'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:700;'
                    ) + ' is not within range for this action.'
            };
        },

        cloneJsonSafe(value) {
            if (value === null || value === undefined) return value;
            try { return JSON.parse(JSON.stringify(value)); } catch (e) { return value; }
        },

        stripHtml(value = '') {
            return String(value || '')
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
                .replace(/<li[^>]*>/gi, '- ')
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;/gi, ' ')
                .replace(/&quot;/gi, '"')
                .replace(/&#39;|&apos;/gi, '\'')
                .replace(/&lt;/gi, '<')
                .replace(/&gt;/gi, '>')
                .replace(/&amp;/gi, '&')
                .trim();
        },

        tryParseHandoutPayload(raw) {
            const source = this.stripHtml(raw);
            if (!source) return null;

            const candidates = [source];
            const firstBracket = source.indexOf('[');
            const lastBracket = source.lastIndexOf(']');
            if (firstBracket >= 0 && lastBracket > firstBracket) {
                candidates.push(source.slice(firstBracket, lastBracket + 1).trim());
            }
            const firstBrace = source.indexOf('{');
            const lastBrace = source.lastIndexOf('}');
            if (firstBrace >= 0 && lastBrace > firstBrace) {
                candidates.push(source.slice(firstBrace, lastBrace + 1).trim());
            }

            for (let i = 0; i < candidates.length; i += 1) {
                const candidate = candidates[i];
                try { return JSON.parse(candidate); } catch (e) {}
                try { return JSON.parse(candidate.replace(/,\s*([}\]])/g, '$1')); } catch (e) {}
                try { return Function('"use strict"; return (' + candidate + ');')(); } catch (e) {}
            }
            return null;
        },

        parseRootObject(raw) {
            if (raw && typeof raw === 'object') return this.cloneJsonSafe(raw);
            if (typeof raw !== 'string') return null;
            return this.tryParseHandoutPayload(raw);
        },

        getInventoryRootContext(characterId) {
            const attrs = findObjs({
                _type: 'attribute',
                _characterid: String(characterId)
            }) || [];
            const rootAttr = attrs.find((attr) => {
                const attrName = String(attr.get('name') || '').trim().toLowerCase();
                return attrName === 'store';
            }) || null;

            return {
                attrs,
                rootAttr
            };
        },

        loadInventoryRoot(characterId, options = {}) {
            const createIfMissing = !!options.createIfMissing;
            const context = this.getInventoryRootContext(characterId);
            let rootAttr = context.rootAttr;

            if (!rootAttr && createIfMissing) {
                rootAttr = createObj('attribute', {
                    _characterid: String(characterId),
                    characterid: String(characterId),
                    name: 'store',
                    current: '{}'
                });
            }

            if (!rootAttr) {
                return {
                    ok: false,
                    message: 'Inventory source attribute not found.',
                    attrs: context.attrs,
                    rootAttr: null
                };
            }

            const rawCurrent = rootAttr.get('current');
            const mode = (rawCurrent && typeof rawCurrent === 'object') ? 'object' : 'json-string';
            let root = this.parseRootObject(rawCurrent);
            if ((!root || typeof root !== 'object') && createIfMissing) root = {};
            if (!root || typeof root !== 'object') {
                return {
                    ok: false,
                    message: 'Inventory source is empty or invalid.',
                    attrs: context.attrs,
                    rootAttr
                };
            }

            return {
                ok: true,
                attrs: context.attrs,
                rootAttr,
                rawCurrent,
                mode,
                root
            };
        },

        saveInventoryRoot(rootEntry) {
            if (!rootEntry || !rootEntry.rootAttr) return false;
            if (rootEntry.mode === 'object') rootEntry.rootAttr.set('current', rootEntry.root);
            else rootEntry.rootAttr.set('current', JSON.stringify(rootEntry.root));
            return true;
        },

        snapshotInventoryStoreAttribute(characterId) {
            const safeCharacterId = String(characterId || '').trim();
            if (!safeCharacterId) return null;

            const context = this.getInventoryRootContext(safeCharacterId);
            if (!context.rootAttr) return null;

            return {
                characterId: safeCharacterId,
                attributeId: context.rootAttr.id,
                current: this.cloneJsonSafe(context.rootAttr.get('current'))
            };
        },

        restoreInventoryStoreAttribute(snapshot, reason = '') {
            if (!snapshot || !snapshot.characterId || !snapshot.attributeId) return false;

            let attr = getObj('attribute', snapshot.attributeId);
            if (!attr) {
                const context = this.getInventoryRootContext(snapshot.characterId);
                attr = context.rootAttr;
            }
            if (!attr) return false;

            attr.set('current', this.cloneJsonSafe(snapshot.current));
            Logger.debug(
                '[Inventory:restore store]',
                'characterId=' + String(snapshot.characterId || ''),
                'attributeId=' + String(attr.id || ''),
                'reason=' + String(reason || 'sheet-write-protection')
            );
            return true;
        },

        getSheetSnapshotCandidateKeys(attrName = '') {
            const safeAttrName = String(attrName || '').trim();
            if (!safeAttrName) return [];

            const normalized = safeAttrName.toLowerCase();
            const keys = [safeAttrName];

            if (normalized === 'hp') {
                keys.push('currentHP', 'currenthp');
            } else if (normalized === 'hp_max' || normalized === 'hpmax') {
                keys.push('hp_max', 'maxHP', 'maxhp', 'hpMax');
            }

            return Utils.uniqueNames(keys);
        },

        updateInventorySnapshotValue(snapshot, candidateKeys = [], value, options = {}) {
            if (!snapshot || !Array.isArray(candidateKeys) || !candidateKeys.length) return false;

            const originalCurrent = snapshot.current;
            const parsed = this.parseRootObject(originalCurrent);
            if (!parsed || typeof parsed !== 'object') return false;
            const parsedAfterSet = this.parseRootObject(options && options.currentAfterSet);

            const keyLookup = {};
            for (let i = 0; i < candidateKeys.length; i += 1) {
                const key = String(candidateKeys[i] || '').trim().toLowerCase();
                if (key) keyLookup[key] = true;
            }

            const paths = [];
            const walk = (node, path = []) => {
                if (!node || typeof node !== 'object') return;

                if (Array.isArray(node)) {
                    for (let i = 0; i < node.length; i += 1) {
                        walk(node[i], path.concat(i));
                    }
                    return;
                }

                const keys = Object.keys(node);
                for (let i = 0; i < keys.length; i += 1) {
                    const key = keys[i];
                    const nextPath = path.concat(key);
                    const currentValue = node[key];
                    const isWritableLeaf = currentValue === null || typeof currentValue !== 'object';
                    if (isWritableLeaf && keyLookup[String(key || '').trim().toLowerCase()]) {
                        paths.push(nextPath);
                    }
                    walk(currentValue, nextPath);
                }
            };

            walk(parsed, []);

            if (!paths.length && parsedAfterSet && typeof parsedAfterSet === 'object') {
                const expectedValue = String(value === undefined || value === null ? '' : value);
                const seenPath = {};

                const walkChangedLeaves = (beforeNode, afterNode, path = []) => {
                    if (afterNode === null || afterNode === undefined) return;
                    if (typeof afterNode !== 'object') {
                        const beforeText = String(beforeNode === undefined || beforeNode === null ? '' : beforeNode);
                        const afterText = String(afterNode === undefined || afterNode === null ? '' : afterNode);
                        if (afterText === expectedValue && beforeText !== afterText) {
                            const pathKey = path.join('.');
                            if (path.length && !seenPath[pathKey]) {
                                paths.push(path.slice());
                                seenPath[pathKey] = true;
                            }
                        }
                        return;
                    }

                    if (Array.isArray(afterNode)) {
                        for (let i = 0; i < afterNode.length; i += 1) {
                            const nextBefore = Array.isArray(beforeNode) ? beforeNode[i] : undefined;
                            walkChangedLeaves(nextBefore, afterNode[i], path.concat(i));
                        }
                        return;
                    }

                    const keys = Object.keys(afterNode);
                    for (let i = 0; i < keys.length; i += 1) {
                        const key = keys[i];
                        const nextBefore = beforeNode && typeof beforeNode === 'object' ? beforeNode[key] : undefined;
                        walkChangedLeaves(nextBefore, afterNode[key], path.concat(key));
                    }
                };

                walkChangedLeaves(parsed, parsedAfterSet, []);
            }

            if (!paths.length) return false;

            for (let i = 0; i < paths.length; i += 1) {
                this.setAtPath(parsed, paths[i], value);
            }

            snapshot.current = (typeof originalCurrent === 'string')
                ? JSON.stringify(parsed)
                : parsed;

            Logger.debug(
                '[Inventory:update snapshot]',
                'characterId=' + String(snapshot.characterId || ''),
                'paths=' + String(paths.map((path) => path.join('.')).join('|')),
                'value=' + String(value)
            );
            return true;
        },

        getInventoryContainer(rootObj) {
            if (!rootObj || typeof rootObj !== 'object') return null;
            if (
                rootObj.integrants &&
                typeof rootObj.integrants === 'object' &&
                rootObj.integrants.integrants &&
                typeof rootObj.integrants.integrants === 'object'
            ) {
                return rootObj.integrants.integrants;
            }
            return rootObj;
        },

        ensureInventoryContainer(rootObj) {
            if (!rootObj || typeof rootObj !== 'object') return null;
            if (!rootObj.integrants || typeof rootObj.integrants !== 'object' || Array.isArray(rootObj.integrants)) {
                rootObj.integrants = {};
            }
            if (!rootObj.integrants.integrants || typeof rootObj.integrants.integrants !== 'object' || Array.isArray(rootObj.integrants.integrants)) {
                rootObj.integrants.integrants = {};
            }
            return rootObj.integrants.integrants;
        },

        parsePathTokens(pathText = '') {
            const parts = String(pathText || '').split('.');
            const tokens = [];
            for (let i = 0; i < parts.length; i += 1) {
                const re = /([^\[\]]+)|\[(\d+)\]/g;
                let match;
                while ((match = re.exec(parts[i])) !== null) {
                    if (match[1]) tokens.push(match[1]);
                    else if (match[2]) tokens.push(Number(match[2]));
                }
            }
            return tokens;
        },

        getAtTokens(start, tokens = []) {
            let node = start;
            for (let i = 0; i < tokens.length; i += 1) {
                if (node === null || node === undefined) return null;
                node = node[tokens[i]];
            }
            return node;
        },

        ensureObjectPath(start, tokens = []) {
            let node = start;
            for (let i = 0; i < tokens.length; i += 1) {
                const key = tokens[i];
                if (!node[key] || typeof node[key] !== 'object' || Array.isArray(node[key])) node[key] = {};
                node = node[key];
            }
            return node;
        },

        parseChildIdList(value) {
            if (Array.isArray(value)) return value.map((entry) => String(entry || '').trim()).filter(Boolean);
            const text = String(value === undefined || value === null ? '' : value).trim();
            if (!text) return [];
            try {
                const parsed = JSON.parse(text);
                if (!Array.isArray(parsed)) return [];
                return parsed.map((entry) => String(entry || '').trim()).filter(Boolean);
            } catch (e) {
                return [];
            }
        },

        normalizeStackComparable(value) {
            if (value === undefined || value === null) return '';
            if (typeof value === 'string') return value.trim().toLowerCase();
            if (typeof value === 'number' || typeof value === 'boolean') return String(value);
            if (Array.isArray(value)) {
                return value
                    .map((entry) => this.normalizeStackComparable(entry))
                    .filter(Boolean)
                    .join('|');
            }
            if (typeof value === 'object') {
                const ignoredKeys = {
                    sourceid: true,
                    shortid: true,
                    parentid: true,
                    createdtime: true,
                    arrayposition: true
                };
                const keys = Object.keys(value)
                    .filter((key) => !ignoredKeys[String(key || '').trim().toLowerCase()])
                    .sort();
                const parts = [];
                for (let i = 0; i < keys.length; i += 1) {
                    const key = keys[i];
                    parts.push(key + ':' + this.normalizeStackComparable(value[key]));
                }
                return '{' + parts.join(',') + '}';
            }
            return String(value).trim().toLowerCase();
        },

        getNodeChildIdStackKey(node = {}) {
            const explicitChildId = Object.prototype.hasOwnProperty.call(node, 'childID')
                ? node.childID
                : (Object.prototype.hasOwnProperty.call(node, 'childId') ? node.childId : '');
            if (explicitChildId !== undefined && explicitChildId !== null && String(explicitChildId).trim() !== '') {
                return this.normalizeStackComparable(explicitChildId);
            }

            const childValue = Object.prototype.hasOwnProperty.call(node, 'childIDs') ? node.childIDs : '';

            const parsedChildIds = this.parseChildIdList(childValue);
            if (parsedChildIds.length) {
                return 'count:' + String(parsedChildIds.length);
            }
            return this.normalizeStackComparable(childValue);
        },

        getNodeModifierStackKey(node = {}) {
            const modifierValue = Object.prototype.hasOwnProperty.call(node, 'modifier')
                ? node.modifier
                : (Object.prototype.hasOwnProperty.call(node, 'modifiers') ? node.modifiers : '');
            return this.normalizeStackComparable(modifierValue);
        },

        getNodeStackSignature(node = {}, fallbackName = '') {
            const safeNode = (node && typeof node === 'object') ? node : {};
            const name = this.getFirstStringValue(safeNode, ['name', 'recordName', 'itemName', 'label', 'title']) || String(fallbackName || '');
            const description = this.getFirstStringValue(safeNode, ['description', 'desc', 'details', 'text']);

            return {
                name: this.normalizeStackComparable(name),
                description: this.normalizeStackComparable(description),
                childKey: this.getNodeChildIdStackKey(safeNode),
                modifierKey: this.getNodeModifierStackKey(safeNode)
            };
        },

        isSameStackSignature(leftNode = {}, rightNode = {}, leftName = '', rightName = '') {
            const left = this.getNodeStackSignature(leftNode, leftName);
            const right = this.getNodeStackSignature(rightNode, rightName);
            return (
                left.name === right.name &&
                left.description === right.description &&
                left.childKey === right.childKey &&
                left.modifierKey === right.modifierKey
            );
        },

        collectChildNodesFromObjectContainer(container, parentNode = {}) {
            if (!container || typeof container !== 'object' || Array.isArray(container)) return {};
            if (!parentNode || typeof parentNode !== 'object') return {};

            const childNodes = {};
            const visited = {};

            const visitById = (id) => {
                const safeId = String(id || '').trim();
                if (!safeId || visited[safeId]) return;
                if (!Object.prototype.hasOwnProperty.call(container, safeId)) return;

                const node = container[safeId];
                if (!node || typeof node !== 'object') return;

                visited[safeId] = true;
                childNodes[safeId] = this.cloneJsonSafe(node);

                const nestedIds = this.parseChildIdList(node.childIDs);
                for (let i = 0; i < nestedIds.length; i += 1) {
                    visitById(nestedIds[i]);
                }
            };

            const topIds = this.parseChildIdList(parentNode.childIDs);
            for (let i = 0; i < topIds.length; i += 1) {
                visitById(topIds[i]);
            }

            const parentShortId = String(parentNode.shortID || '').trim();
            if (parentShortId) {
                const keys = Object.keys(container);
                for (let i = 0; i < keys.length; i += 1) {
                    const key = keys[i];
                    const node = container[key];
                    if (!node || typeof node !== 'object') continue;
                    if (String(node.parentID || '').trim() === parentShortId) {
                        visitById(key);
                    }
                }
            }

            return childNodes;
        },

        removeChildrenFromObjectContainer(container, childIds = [], parentShortId = '', skipKey = '') {
            if (!container || typeof container !== 'object' || Array.isArray(container)) return 0;
            let removed = 0;

            for (let i = 0; i < childIds.length; i += 1) {
                const id = String(childIds[i] || '').trim();
                if (!id || id === skipKey) continue;
                if (Object.prototype.hasOwnProperty.call(container, id)) {
                    delete container[id];
                    removed += 1;
                }
            }

            const parentId = String(parentShortId || '').trim();
            if (!parentId) return removed;

            const keys = Object.keys(container);
            for (let i = 0; i < keys.length; i += 1) {
                const key = keys[i];
                if (key === skipKey) continue;
                const node = container[key];
                if (!node || typeof node !== 'object') continue;
                if (String(node.parentID || '').trim() === parentId) {
                    delete container[key];
                    removed += 1;
                }
            }

            return removed;
        },

        getNextArrayPosition(container) {
            if (!container || typeof container !== 'object') return 1;
            let maxPos = 0;
            const nodes = Array.isArray(container) ? container : Object.keys(container).map((k) => container[k]);
            for (let i = 0; i < nodes.length; i += 1) {
                const node = nodes[i];
                if (!node || typeof node !== 'object') continue;
                const pos = this.toIntOrNull(node.arrayPosition);
                if (pos !== null && pos > maxPos) maxPos = pos;
            }
            return maxPos + 1;
        },

        randomToken(length = 8, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
            let out = '';
            for (let i = 0; i < length; i += 1) out += chars.charAt(Math.floor(Math.random() * chars.length));
            return out;
        },

        makeInventoryRowId(container) {
            let id = this.randomToken(21, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-');
            while (Object.prototype.hasOwnProperty.call(container, id)) {
                id = this.randomToken(21, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-');
            }
            return id;
        },

        makeShortId() {
            return this.randomToken(9);
        },

        isPlaceholderInventoryRowId(value = '') {
            const text = String(value || '').trim().toLowerCase();
            return text === '__temporary__' || text === '__row_id__';
        },

        remapSourceIdsDeep(value, sourceIdMap) {
            if (!value || typeof value !== 'object') return;
            if (!sourceIdMap || typeof sourceIdMap !== 'object') return;

            const seen = [];
            const walk = (node) => {
                if (!node || typeof node !== 'object') return;
                if (seen.indexOf(node) >= 0) return;
                seen.push(node);

                if (Array.isArray(node)) {
                    for (let i = 0; i < node.length; i += 1) walk(node[i]);
                    return;
                }

                const keys = Object.keys(node);
                for (let i = 0; i < keys.length; i += 1) {
                    const key = keys[i];
                    const mappedKey = Object.prototype.hasOwnProperty.call(sourceIdMap, key)
                        ? sourceIdMap[key]
                        : key;
                    if (mappedKey !== key) {
                        node[mappedKey] = node[key];
                        delete node[key];
                    }

                    const currentKey = mappedKey;
                    if (
                        typeof node[currentKey] === 'string' &&
                        Object.prototype.hasOwnProperty.call(sourceIdMap, node[currentKey])
                    ) {
                        node[currentKey] = sourceIdMap[node[currentKey]];
                    }
                    if (String(currentKey || '').trim().toLowerCase() === 'sourceid') {
                        const oldId = String(node[currentKey] || '').trim();
                        if (oldId && Object.prototype.hasOwnProperty.call(sourceIdMap, oldId)) {
                            node[currentKey] = sourceIdMap[oldId];
                        }
                        continue;
                    }
                    walk(node[currentKey]);
                }
            };

            walk(value);
        },

        getFirstStringValue(obj, keys = []) {
            for (let i = 0; i < keys.length; i += 1) {
                const key = keys[i];
                if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
                const value = obj[key];
                if (typeof value === 'string' && value.trim().length) return value.trim();
            }
            return '';
        },

        getFirstQtyKey(obj, qtyKeys = []) {
            for (let i = 0; i < qtyKeys.length; i += 1) {
                const key = qtyKeys[i];
                if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
                if (this.toIntOrNull(obj[key]) !== null) return key;
            }
            return '';
        },

        looksLikeInventoryItemNode(node) {
            if (!node || typeof node !== 'object' || Array.isArray(node)) return false;

            const nameKeys = ['name', 'label', 'title', 'itemName', 'item_name', 'displayName', 'recordName'];
            const qtyKeys = ['quantity', 'qty', 'count', 'amount', 'uses', 'charges', 'itemcount', 'item_count', 'itemQuantity', 'item_quantity'];
            const hintKeys = ['equipped', 'weight', 'rarity', 'weaponType', 'armorType', 'equipData', 'weaponData', 'armorData'];
            const name = this.getFirstStringValue(node, nameKeys);
            if (!name) return false;
            const hasQty = qtyKeys.some((key) => Object.prototype.hasOwnProperty.call(node, key));
            const hasHints = hintKeys.some((key) => Object.prototype.hasOwnProperty.call(node, key));
            return hasQty || hasHints;
        },

        walkInventoryNodes(root, onItem, options = {}) {
            const maxDepth = Number(options.maxDepth) || 8;
            const maxVisits = Number(options.maxVisits) || 5000;
            const seen = [];
            let visits = 0;

            const nameKeys = ['name', 'label', 'title', 'itemName', 'item_name', 'displayName', 'recordName'];
            const qtyKeys = ['quantity', 'qty', 'count', 'amount', 'uses', 'charges', 'itemcount', 'item_count', 'itemQuantity', 'item_quantity'];

            const walk = (node, path = '', pathTokens = [], depth = 0) => {
                if (visits >= maxVisits || depth > maxDepth) return false;
                if (!node || typeof node !== 'object') return false;
                if (seen.indexOf(node) >= 0) return false;
                seen.push(node);
                visits += 1;

                if (Array.isArray(node)) {
                    for (let i = 0; i < node.length; i += 1) {
                        const nextPath = path + '[' + String(i) + ']';
                        if (walk(node[i], nextPath, pathTokens.concat(i), depth + 1)) return true;
                    }
                    return false;
                }

                if (this.looksLikeInventoryItemNode(node)) {
                    const entry = {
                        node,
                        path,
                        pathTokens: pathTokens.slice(),
                        name: this.getFirstStringValue(node, nameKeys),
                        qtyKey: this.getFirstQtyKey(node, qtyKeys)
                    };
                    if (typeof onItem === 'function' && onItem(entry) === true) return true;
                }

                const keys = Object.keys(node);
                for (let i = 0; i < keys.length; i += 1) {
                    const key = keys[i];
                    const nextPath = path ? (path + '.' + key) : key;
                    if (walk(node[key], nextPath, pathTokens.concat(key), depth + 1)) return true;
                }
                return false;
            };

            walk(root, '', [], 0);
        },

        extractInventoryMeta(node = {}) {
            const readFirst = (keys = []) => {
                for (let i = 0; i < keys.length; i += 1) {
                    const k = keys[i];
                    if (!Object.prototype.hasOwnProperty.call(node, k)) continue;
                    const value = node[k];
                    if (value === undefined || value === null) continue;
                    return value;
                }
                return null;
            };
            const asText = (value) => {
                if (value === undefined || value === null) return '';
                if (typeof value === 'string') return value.trim();
                if (typeof value === 'number' || typeof value === 'boolean') return String(value);
                if (Array.isArray(value)) return value.map((entry) => asText(entry)).filter(Boolean).join(', ');
                try { return JSON.stringify(value); } catch (e) { return String(value); }
            };
            const toBoolOrNull = (value) => {
                if (value === true || value === false) return value;
                const text = asText(value).toLowerCase();
                if (!text) return null;
                if (['1', 'true', 'yes', 'y', 'on'].includes(text)) return true;
                if (['0', 'false', 'no', 'n', 'off'].includes(text)) return false;
                return null;
            };

            const meta = {};
            const setIfText = (key, value) => {
                const text = asText(value);
                if (text) meta[key] = text;
            };

            setIfText('templateId', readFirst(['templateId', 'templateID', 'compendiumPageID']));
            setIfText('abbreviation', readFirst(['abbreviation', 'abreviation', 'shortName', 'label']));
            setIfText('description', readFirst(['description', 'desc', 'details', 'text']));
            setIfText('type', readFirst(['type', 'itemType', 'classification', 'kind', 'category']));
            setIfText('subtype', readFirst(['subtype', 'weaponType', 'armorType', 'itemSubtype']));
            setIfText('rarity', readFirst(['rarity', 'quality']));
            setIfText('imageUrl', readFirst(['imageUrl', 'imageURL', 'img', 'icon', 'iconUrl', 'image', 'avatar']));
            setIfText('AC', readFirst(['AC', 'ac', 'armorClass', 'armor_class']));
            setIfText('modifier', readFirst(['modifier', 'modifiers', 'itemModifier', 'itemModifiers']));
            setIfText('debuff', readFirst(['debuff', 'debuffs', 'penalty', 'penalties']));
            setIfText('requirement', readFirst(['requirement', 'requirements', 'prerequisite', 'prerequisites']));
            setIfText('effect', readFirst(['effect', 'itemEffect']));
            setIfText('damage', readFirst(['damage', 'damageDice', 'damageRoll', 'dmg']));
            setIfText('damageType', readFirst(['damageType', 'damage_type', 'dmgType', 'damageKind']));
            setIfText('properties', readFirst(['properties', 'property', 'weaponProperties']));
            setIfText('mastery', readFirst(['mastery', 'weaponMastery']));
            setIfText('tags', readFirst(['tags', 'tagList', 'keywords']));
            setIfText('useRange', readFirst(['useRange', 'consumableRange', 'range']));
            setIfText('consumableRange', readFirst(['consumableRange', 'range']));

            const diceCount = this.toIntOrNull(readFirst(['diceCount', 'dice_count', 'dice']));
            if (diceCount !== null) meta.diceCount = diceCount;
            const diceSide = this.toIntOrNull(readFirst(['diceSide', 'dice_side', 'die', 'sides']));
            if (diceSide !== null) meta.diceSide = diceSide;
            const bonusRaw = this.toIntOrNull(readFirst(['bonus', 'flatBonus']));
            if (bonusRaw !== null) meta.bonus = bonusRaw;
            const rollBonusRaw = this.toIntOrNull(readFirst(['rollBonus', 'roll_bonus']));
            if (rollBonusRaw !== null) meta.rollBonus = rollBonusRaw;

            const weightRaw = readFirst(['weight', 'itemWeight', 'weightLb', 'weightLbs', 'lbs']);
            const weight = this.toIntOrNull(weightRaw);
            if (weight !== null) meta.weight = weight;

            const consumable = toBoolOrNull(readFirst(['consumable', 'isConsumable']));
            if (consumable !== null) meta.consumable = consumable;

            const usable = toBoolOrNull(readFirst(['usable', 'isUsable', 'canUse']));
            if (usable !== null) meta.usable = usable;

            const useTarget = toBoolOrNull(readFirst(['useTarget', 'requiresTarget', 'targetRequired', 'isTargetRequired']));
            if (useTarget !== null) meta.useTarget = useTarget;

            return meta;
        },

        tryParseTemplateEntries(rawText = '') {
            const parsed = this.tryParseHandoutPayload(rawText);
            if (Array.isArray(parsed)) return parsed;
            if (parsed && typeof parsed === 'object' && Array.isArray(parsed.templates)) return parsed.templates;
            return null;
        },

        normalizeTemplateEntry(entry = {}) {
            if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
            const record = (entry.record && typeof entry.record === 'object' && !Array.isArray(entry.record))
                ? entry.record
                : {};
            const node = (record.node && typeof record.node === 'object' && !Array.isArray(record.node))
                ? record.node
                : ((entry.node && typeof entry.node === 'object' && !Array.isArray(entry.node)) ? entry.node : null);
            if (!node) return null;

            const sourceKey = this.normalizeSourceKey(record.source || entry.source || 'store');
            const name = String(record.name || entry.name || node.name || node.recordName || '').trim();
            if (!name) return null;
            const nameKey = String(name || '').trim().toLowerCase();
            const templateKey = String(entry.templateKey || (sourceKey + '::' + name)).trim().toLowerCase();
            if (!templateKey) return null;

            return {
                name,
                nameKey,
                sourceKey,
                templateKey,
                record: {
                    source: sourceKey,
                    name,
                    updatedAt: Number(record.updatedAt || entry.updatedAt) || 0,
                    node,
                    meta: (record.meta && typeof record.meta === 'object' && !Array.isArray(record.meta))
                        ? record.meta
                        : ((entry.meta && typeof entry.meta === 'object' && !Array.isArray(entry.meta)) ? entry.meta : {})
                }
            };
        },

        getTemplateRecord(itemName = '', source = 'store', options = {}) {
            const safeName = String(itemName || '').trim();
            if (!safeName) return null;
            const catalogItem = ItemCatalog.getByName(safeName);
            const candidates = Utils.uniqueNames([
                options && options.templateId,
                safeName,
                catalogItem && catalogItem.name,
                catalogItem && catalogItem.abbreviation,
                catalogItem && catalogItem.abreviation,
                catalogItem && catalogItem.id,
                catalogItem && catalogItem.templateId
            ].filter(Boolean));

            for (let i = 0; i < candidates.length; i += 1) {
                const candidate = candidates[i];
                const record = ItemsTemplateCatalog.get(this.normalizeSourceKey(source), candidate) ||
                    ItemsTemplateCatalog.getAny(candidate);
                if (record) return record;
            }
            return null;
        },

        buildItemTemplateRecord(itemName = '', itemData = {}) {
            const safeItem = itemData && typeof itemData === 'object' ? itemData : {};
            const safeName = String(itemName || safeItem.name || safeItem.recordName || '').trim();
            if (!safeName) return null;

            const createdTime = Date.now();
            const weightRaw = this.toIntOrNull(safeItem.weight);
            const weight = weightRaw === null ? 0 : weightRaw;
            const asString = (value) => value === undefined || value === null ? '' : String(value);
            const asBoolean = (value) => {
                if (value === true || value === false) return value;
                const text = String(value === undefined || value === null ? '' : value).trim().toLowerCase();
                return text === 'true' || text === '1' || text === 'yes' || text === 'on';
            };

            const node = {
                _enabled: true,
                _label: '',
                arrayPosition: 0,
                builderDisplayName: '',
                childIDs: '[]',
                cost: asString(safeItem.cost),
                createdTime,
                AC: asString(safeItem.AC),
                debuff: asString(safeItem.debuff),
                description: asString(safeItem.description),
                equipData: {
                    equippable: asBoolean(safeItem.equippable),
                    equipped: asBoolean(safeItem.equipped)
                },
                modifier: asString(safeItem.modifier),
                name: safeName,
                parentID: '',
                quantity: 1,
                requirement: asString(safeItem.requirement),
                shortID: this.makeShortId(),
                source: '',
                type: 'Item',
                weight
            };

            const meta = {
                rowId: '',
                path: '',
                childNodes: {}
            };

            return {
                source: 'store',
                name: safeName,
                updatedAt: createdTime,
                node,
                meta
            };
        },

        async transferItem({
            sourceTokenId = '',
            targetTokenId = '',
            itemName = '',
            quantity = 1,
            playerId = '',
            isGM = false,
            maxDistanceFt = CONFIG.INVENTORY_TRANSFER_MAX_DISTANCE_FT
        } = {}) {
            const sourceId = String(sourceTokenId || '').trim();
            const targetId = String(targetTokenId || '').trim();
            const safeName = String(itemName || '').trim();
            const qty = Math.max(1, this.toIntOrNull(quantity) || 1);
            if (!sourceId || !targetId || !safeName) {
                return { ok: false, message: 'Missing source token, target token, or item name.' };
            }

            const sourceAccessResult = R20.requireSourceTokenAccess({
                sourceTokenId: sourceId,
                playerId,
                isGM,
                actionLabel: 'transfer items from'
            });
            if (!sourceAccessResult.ok) {
                return {
                    ok: false,
                    message: sourceAccessResult.message,
                    sourceAccess: sourceAccessResult.access
                };
            }

            const sourceToken = sourceAccessResult.access.token;
            const targetResolved = R20.resolveTokenRef(targetId);
            const targetToken = targetResolved.token;
            if (!targetToken) {
                return { ok: false, message: 'Target token was not found.' };
            }

            const sourceCharId = String(sourceAccessResult.access.character.id || sourceToken.get('represents') || '').trim();
            const targetCharId = String(targetResolved.characterId || targetToken.get('represents') || '').trim();
            if (!sourceCharId || !targetCharId) {
                return { ok: false, message: 'Source or target token is not linked to a character.' };
            }

            const normalizedName = safeName.toLowerCase();
            const sourceRootEntry = this.loadInventoryRoot(sourceCharId);
            if (!sourceRootEntry.ok) {
                return { ok: false, message: sourceRootEntry.message || 'Source inventory is invalid.' };
            }

            let sourceEntry = null;
            this.walkInventoryNodes(sourceRootEntry.root, (entry) => {
                if (String(entry.name || '').trim().toLowerCase() !== normalizedName) return false;

                const currentQty = entry.qtyKey ? this.toIntOrNull(entry.node[entry.qtyKey]) : null;
                if (currentQty !== null && (currentQty <= 0 || currentQty < qty)) return false;
                if (currentQty === null && qty > 1) return false;

                sourceEntry = {
                    node: entry.node,
                    name: String(entry.name || safeName).trim(),
                    qtyKey: entry.qtyKey,
                    path: entry.path,
                    pathTokens: entry.pathTokens.slice(),
                    currentQty
                };
                return true;
            });

            const availableQty = sourceEntry
                ? (sourceEntry.currentQty === null ? 1 : Math.max(0, sourceEntry.currentQty))
                : 0;

            if (!sourceEntry) {
                return {
                    ok: false,
                    message: 'Not enough items to transfer.',
                    availableQty
                };
            }

            const inRange = this.isTargetWithinTransferDistance(sourceId, targetId, maxDistanceFt);
            if (!inRange.ok) {
                return {
                    ok: false,
                    message: inRange.message,
                    distanceFt: inRange.distanceFt,
                    maxDistanceFt: inRange.maxDistanceFt
                };
            }

            const pathTokens = Array.isArray(sourceEntry.pathTokens) ? sourceEntry.pathTokens.slice() : [];
            if (!pathTokens.length) {
                return { ok: false, message: 'Source item path is invalid.' };
            }

            const sourceLeaf = pathTokens[pathTokens.length - 1];
            const sourceParentTokens = pathTokens.slice(0, -1);
            const sourceContainer = sourceParentTokens.length
                ? this.getAtTokens(sourceRootEntry.root, sourceParentTokens)
                : sourceRootEntry.root;

            if (!sourceContainer || typeof sourceContainer !== 'object') {
                return { ok: false, message: 'Source container was not found.' };
            }

            const transferNode = this.cloneJsonSafe(sourceEntry.node);
            if (!transferNode || typeof transferNode !== 'object') {
                return { ok: false, message: 'Source node could not be cloned.' };
            }

            if (sourceEntry.qtyKey) {
                transferNode[sourceEntry.qtyKey] = qty;
            }
            transferNode.quantity = qty;
            if (Object.prototype.hasOwnProperty.call(transferNode, 'name')) transferNode.name = sourceEntry.name;
            if (Object.prototype.hasOwnProperty.call(transferNode, 'recordName')) transferNode.recordName = sourceEntry.name;

            const transferChildNodes = (!Array.isArray(sourceContainer))
                ? this.collectChildNodesFromObjectContainer(sourceContainer, sourceEntry.node)
                : {};

            const transferTemplateRecord = {
                source: this.normalizeSourceKey('store'),
                name: sourceEntry.name,
                updatedAt: Date.now(),
                node: transferNode,
                meta: {
                    path: String(sourceEntry.path || '').trim(),
                    rowId: (typeof sourceLeaf === 'string') ? String(sourceLeaf).trim() : '',
                    childNodes: transferChildNodes
                }
            };

            const removeResult = await this.removeInventoryItem(sourceCharId, sourceEntry.name, qty);
            if (!removeResult.ok) {
                return { ok: false, message: removeResult.message || 'Unable to remove item from source.' };
            }

            const addResult = await this.addInventoryItem(targetCharId, sourceEntry.name, qty, {
                templateRecord: transferTemplateRecord
            });
            if (!addResult.ok) {
                await this.addInventoryItem(sourceCharId, sourceEntry.name, qty, {
                    templateRecord: transferTemplateRecord
                });
                return { ok: false, message: addResult.message || 'Unable to add item to target.' };
            }

            return {
                ok: true,
                itemName: sourceEntry.name,
                transferred: qty,
                sourceRemaining: Math.max(0, availableQty - qty),
                removedChildren: Number(removeResult.removedChildren) || 0,
                distanceFt: inRange.distanceFt,
                maxDistanceFt: inRange.maxDistanceFt
            };
        },

        normalizeCurrencyType(currencyType = '') {
            const safeType = String(currencyType || '').trim().toLowerCase();
            if (CURRENCY_TYPES.includes(safeType)) return safeType;
            return '';
        },

        async transferCurrency({
            action = 'give',
            sourceTokenId = '',
            targetTokenId = '',
            currencyType = '',
            quantity = 1,
            playerId = '',
            isGM = false,
            maxDistanceFt = CONFIG.INVENTORY_TRANSFER_MAX_DISTANCE_FT
        } = {}) {
            const safeAction = String(action || '').trim().toLowerCase();
            if (safeAction !== 'give' && safeAction !== 'take') {
                return { ok: false, message: 'Invalid action. Use give or take.' };
            }

            const sourceId = String(sourceTokenId || '').trim();
            const targetId = String(targetTokenId || '').trim();
            const coinType = this.normalizeCurrencyType(currencyType);
            const qty = Math.max(1, this.toIntOrNull(quantity) || 0);
            if (!sourceId || !targetId || !coinType || qty <= 0) {
                return { ok: false, message: 'Missing source token, target token, currency type, or quantity.' };
            }
            if (sourceId === targetId) {
                return { ok: false, message: 'Select a different token.' };
            }

            const sourceAccessResult = R20.requireSourceTokenAccess({
                sourceTokenId: sourceId,
                playerId,
                isGM,
                actionLabel: safeAction === 'take' ? 'take currency with' : 'transfer currency from'
            });
            const sourceAccess = sourceAccessResult.access;
            if (!sourceAccessResult.ok) {
                return {
                    ok: false,
                    message: sourceAccessResult.message,
                    sourceAccess
                };
            }
            if (!sourceAccess.token || !sourceAccess.character) {
                return { ok: false, message: 'Source token is not linked to a character.' };
            }

            const targetResolved = R20.resolveTokenRef(targetId);
            const targetToken = targetResolved.token;
            if (!targetToken) {
                return { ok: false, message: 'Target token was not found.' };
            }
            const targetCharacter = targetResolved.character || R20.getCharacterFromToken(targetToken);
            if (!targetCharacter) {
                return { ok: false, message: 'Target token is not linked to a character.' };
            }

            if (safeAction === 'take') {
                const targetAccessResult = R20.requireSourceTokenAccess({
                    sourceTokenId: targetId,
                    playerId,
                    isGM,
                    actionLabel: 'take currency from'
                });
                if (!targetAccessResult.ok) {
                    return {
                        ok: false,
                        message: targetAccessResult.message,
                        sourceAccess: targetAccessResult.access
                    };
                }
            }

            const inRange = this.isTargetWithinTransferDistance(sourceId, targetId, maxDistanceFt);
            if (!inRange.ok) {
                return {
                    ok: false,
                    message: inRange.message,
                    distanceFt: inRange.distanceFt,
                    maxDistanceFt: inRange.maxDistanceFt
                };
            }

            const sourceCharacterId = String(sourceAccess.character.id || '').trim();
            const targetCharacterId = String(targetCharacter.id || '').trim();
            if (!sourceCharacterId || !targetCharacterId) {
                return { ok: false, message: 'Source or target character was not found.' };
            }
            if (sourceCharacterId === targetCharacterId) {
                return { ok: false, message: 'Select a different token.' };
            }

            const debitCharacterId = (safeAction === 'give') ? sourceCharacterId : targetCharacterId;
            const creditCharacterId = (safeAction === 'give') ? targetCharacterId : sourceCharacterId;
            const debitTokenId = (safeAction === 'give') ? sourceId : targetId;
            const creditTokenId = (safeAction === 'give') ? targetId : sourceId;

            const debitRaw = await R20.getSheet(debitCharacterId, coinType);
            const creditRaw = await R20.getSheet(creditCharacterId, coinType);
            const debitBefore = Math.max(0, this.toIntOrNull(debitRaw) || 0);
            const creditBefore = Math.max(0, this.toIntOrNull(creditRaw) || 0);

            if (debitBefore < qty) {
                return {
                    ok: false,
                    message: 'Not enough ' + coinType.toUpperCase() + ' to transfer.',
                    available: debitBefore,
                    requested: qty,
                    currencyType: coinType
                };
            }

            const debitAfter = debitBefore - qty;
            const creditAfter = creditBefore + qty;
            await R20.setSheet(debitCharacterId, coinType, debitAfter === 0 ? -1 : debitAfter, { snapshotValue: debitAfter });
            await R20.setSheet(creditCharacterId, coinType, creditAfter);

            const debitContext = R20.getTokenContext(debitTokenId, debitTokenId);
            const creditContext = R20.getTokenContext(creditTokenId, creditTokenId);

            return {
                ok: true,
                action: safeAction,
                currencyType: coinType,
                transferred: qty,
                debit: {
                    tokenId: debitTokenId,
                    characterId: debitCharacterId,
                    tokenName: debitContext.tokenName,
                    before: debitBefore,
                    after: debitAfter
                },
                credit: {
                    tokenId: creditTokenId,
                    characterId: creditCharacterId,
                    tokenName: creditContext.tokenName,
                    before: creditBefore,
                    after: creditAfter
                },
                distanceFt: inRange.distanceFt,
                maxDistanceFt: inRange.maxDistanceFt
            };
        },

        setAtPath(root, path = [], value) {
            if (!root || typeof root !== 'object' || !Array.isArray(path) || !path.length) return false;
            let node = root;
            for (let i = 0; i < path.length - 1; i += 1) {
                node = node[path[i]];
                if (!node || typeof node !== 'object') return false;
            }
            node[path[path.length - 1]] = value;
            return true;
        },

        parseDiceFormula(text = '') {
            const match = String(text || '').match(/(\d+)\s*d\s*(\d+)\s*([+-]\s*\d+)?/i);
            if (!match) return null;
            const count = Math.max(1, this.toIntOrNull(match[1]) || 1);
            const sides = Math.max(1, this.toIntOrNull(match[2]) || 1);
            const bonus = match[3] ? Number(String(match[3]).replace(/\s+/g, '')) || 0 : 0;
            return { count, sides, bonus };
        },

        rollDice({ count = 1, sides = 1, bonus = 0 } = {}) {
            const safeCount = Math.max(1, this.toIntOrNull(count) || 1);
            const safeSides = Math.max(1, this.toIntOrNull(sides) || 1);
            const safeBonus = Number(bonus) || 0;
            const rolls = [];
            let total = 0;

            for (let i = 0; i < safeCount; i += 1) {
                const roll = Math.floor(Math.random() * safeSides) + 1;
                rolls.push(roll);
                total += roll;
            }
            total += safeBonus;

            return {
                count: safeCount,
                sides: safeSides,
                bonus: safeBonus,
                rolls,
                total
            };
        },

        buildUseEffectContext(item = {}) {
            const safeItem = item || {};
            const effectText = String(safeItem.effect || '').trim();

            let diceCount = Math.max(0, this.toIntOrNull(safeItem.diceCount) || 0);
            let diceSide = Math.max(0, this.toIntOrNull(safeItem.diceSide) || 0);
            let flatBonus = Number(safeItem.bonus) || 0;
            flatBonus += Number(safeItem.rollBonus) || 0;

            if (!(diceCount > 0 && diceSide > 0)) {
                const parsed = this.parseDiceFormula(effectText);
                if (parsed) {
                    diceCount = parsed.count;
                    diceSide = parsed.sides;
                    flatBonus += parsed.bonus;
                }
            }

            return {
                effectText,
                diceCount,
                diceSide,
                bonus: flatBonus
            };
        },

        parseFeetFromRangeText(rangeText = '', fallbackFt = CONFIG.INVENTORY_TRANSFER_MAX_DISTANCE_FT) {
            const fallback = Math.max(0, Number(fallbackFt) || 0);
            const safeText = String(rangeText || '').trim().toLowerCase();
            if (!safeText) return fallback;
            if (safeText === 'self') return 0;
            if (safeText === 'touch') return 5;

            const numberMatch = safeText.match(/(\d+(\.\d+)?)/);
            if (!numberMatch) return fallback;
            return Math.max(0, Number(numberMatch[1]) || fallback);
        },

        getItemUseRangeFeet(item = {}) {
            const safeItem = item || {};
            const rangeText = String(
                safeItem.useRange ||
                safeItem.consumableRange ||
                ''
            ).trim();
            return this.parseFeetFromRangeText(rangeText, CONFIG.INVENTORY_TRANSFER_MAX_DISTANCE_FT);
        },

        resolveUseEffectKey(effectText = '') {
            const normalized = String(effectText || '').trim().toLowerCase();
            if (!normalized) return 'apply_only';

            if (
                normalized.includes('heal') ||
                normalized.includes('healing') ||
                normalized.includes('cura') ||
                normalized.includes('curar') ||
                normalized.includes('curacion')
            ) {
                return 'heal';
            }
            return 'apply_only';
        },

        async executeHealEffect({ targetCharacterId = '', item = {} } = {}) {
            const safeTargetCharacterId = String(targetCharacterId || '').trim();
            if (!safeTargetCharacterId) return { ok: false, message: 'Target character was not found.' };

            const context = this.buildUseEffectContext(item);
            if (!(context.diceCount > 0 && context.diceSide > 0)) {
                return {
                    ok: false,
                    message: 'Healing effect is missing dice data.',
                    effectType: 'heal'
                };
            }

            const maxRawValue = await R20.getSheet(safeTargetCharacterId, 'hp_max');
            const currentRawValue = await R20.getSheet(safeTargetCharacterId, 'hp');

            const hasCurrentHp =
                currentRawValue !== undefined &&
                currentRawValue !== null &&
                String(currentRawValue).trim() !== '';
            if (!hasCurrentHp) {
                return {
                    ok: false,
                    message: 'HP attribute was not found for this character.',
                    effectType: 'heal'
                };
            }

            const roll = this.rollDice({
                count: context.diceCount,
                sides: context.diceSide,
                bonus: context.bonus
            });

            const currentHp = Number(currentRawValue) || 0;
            const maxRaw = Number(maxRawValue);
            const hasMax =
                maxRawValue !== undefined &&
                maxRawValue !== null &&
                String(maxRawValue).trim() !== '' &&
                !Number.isNaN(maxRaw) &&
                maxRaw > 0;
            const nextHp = hasMax ? Math.min(maxRaw, currentHp + roll.total) : (currentHp + roll.total);

            await R20.setSheet(safeTargetCharacterId, 'hp', nextHp);
            Logger.info(
                '[Heal:setSheet hp]',
                'characterId=' + safeTargetCharacterId,
                'previous=' + String(currentHp),
                'next=' + String(nextHp)
            );

            return {
                ok: true,
                effectType: 'heal',
                roll,
                amount: roll.total,
                previousHp: currentHp,
                currentHp: nextHp,
                maxHp: hasMax ? maxRaw : null,
                message:
                    'Heals <b>' + Utils.escapeHtml(String(roll.total)) + '</b> HP' +
                    ' (' + Utils.escapeHtml(String(currentHp)) + ' -> ' + Utils.escapeHtml(String(nextHp)) +
                    (hasMax ? '/' + Utils.escapeHtml(String(maxRaw)) : '') + ').',
                narrativeType: 'heal',
                narrativeValue: String(roll.total)
            };
        },

        async executeUseEffect({ targetCharacterId = '', item = {} } = {}) {
            const safeItem = item || {};
            const effectText = String(safeItem.effect || '').trim();
            const effectKey = this.resolveUseEffectKey(effectText);

            if (effectKey === 'heal') {
                return this.executeHealEffect({
                    targetCharacterId,
                    item: safeItem
                });
            }

            if (effectKey === 'apply_only') {
                const effectLabel = effectText || 'Item effect';
                return {
                    ok: true,
                    effectType: 'apply_only',
                    message: 'Applied <b>' + Utils.escapeHtml(effectLabel) + '</b>.',
                    narrativeType: 'applied',
                    narrativeValue: effectLabel
                };
            }

            return {
                ok: false,
                effectType: 'unknown',
                message: 'Unsupported item effect: "' + effectText + '".'
            };
        },

        async useInventoryItem({ sourceTokenId = '', targetTokenId = '', itemName = '', playerId = '', isGM = false } = {}) {
            const sourceId = String(sourceTokenId || '').trim();
            const targetId = String(targetTokenId || '').trim();
            const safeName = String(itemName || '').trim();
            if (!sourceId || !targetId || !safeName) {
                return { ok: false, message: 'Missing source token, target token, or item name.' };
            }

            const sourceAccessResult = R20.requireSourceTokenAccess({
                sourceTokenId: sourceId,
                playerId,
                isGM,
                actionLabel: 'use items from'
            });
            const sourceAccess = sourceAccessResult.access;
            if (!sourceAccessResult.ok) {
                return {
                    ok: false,
                    message: sourceAccessResult.message,
                    sourceAccess
                };
            }
            if (!sourceAccess.token || !sourceAccess.character) {
                return { ok: false, message: 'Source token is not linked to a character.' };
            }

            const targetResolved = R20.resolveTokenRef(targetId);
            const targetToken = targetResolved.token;
            if (!targetToken) {
                return { ok: false, message: 'Target token was not found.' };
            }
            const targetCharacterId = String(targetResolved.characterId || targetToken.get('represents') || '').trim();
            if (!targetCharacterId) {
                return { ok: false, message: 'Target token is not linked to a character.' };
            }

            const characterId = String(sourceAccess.character.id || '').trim();
            if (!characterId) {
                return { ok: false, message: 'Source character was not found.' };
            }

            const sourceItems = await this.getSheetInventory(characterId);
            const sourceItem = sourceItems.find((entry) =>
                String(entry.name || '').trim().toLowerCase() === safeName.toLowerCase()
            );

            if (!sourceItem) {
                return { ok: false, message: 'Item was not found in source inventory.' };
            }

            const availableQty = Math.max(0, this.toIntOrNull(sourceItem.quantity) || 0);
            const sourceItemType = String(sourceItem.type || '').trim().toLowerCase();
            const sourceItemEffect = String(sourceItem.effect || '').trim().toLowerCase();
            const sourceItemSubtype = String(sourceItem.subtype || '').trim().toLowerCase();
            const sourceItemUseRange = String(sourceItem.useRange || sourceItem.consumableRange || '').trim().toLowerCase();
            const sourceItemTags = String(sourceItem.tags || '').trim().toLowerCase();
            const isAmmoItem =
                sourceItemType === 'ammo' ||
                sourceItemEffect === 'ammo' ||
                sourceItemSubtype === 'ammo' ||
                sourceItemUseRange === 'ammo' ||
                sourceItemTags.indexOf('ammo') >= 0;
            const isConsumable = sourceItem.consumable === true || String(sourceItem.consumable || '').trim().toLowerCase() === 'true';

            const maxUseDistanceFt = this.getItemUseRangeFeet(sourceItem);
            const inRange = this.isTargetWithinTransferDistance(sourceId, targetId, maxUseDistanceFt);
            if (!inRange.ok) {
                return {
                    ok: false,
                    message: inRange.message,
                    distanceFt: inRange.distanceFt,
                    maxDistanceFt: inRange.maxDistanceFt
                };
            }

            let effectResult = null;
            if (isAmmoItem) {
                effectResult = {
                    ok: true,
                    effectType: 'ammo',
                    message: '',
                    narrativeType: 'ammo',
                    narrativeValue: ''
                };
            } else {
                effectResult = await this.executeUseEffect({
                    targetCharacterId,
                    item: sourceItem
                });

                if (!effectResult.ok) {
                    return {
                        ok: false,
                        message: effectResult.message || 'Unable to apply item effect.',
                        effect: String(sourceItem.effect || '').trim()
                    };
                }
            }

            let consumed = 0;
            let remaining = Math.max(0, availableQty);
            if (isConsumable && availableQty > 0) {
                const removeResult = await this.removeInventoryItem(characterId, sourceItem.name, 1);
                if (!removeResult.ok) {
                    return { ok: false, message: removeResult.message || 'Unable to consume item.' };
                }
                consumed = 1;
                remaining = Math.max(0, this.toIntOrNull(removeResult.remaining) || 0);
            }

            return {
                ok: true,
                itemName: String(sourceItem.name || safeName),
                itemDescription: String(sourceItem.description || '').trim(),
                itemType: sourceItemType,
                consumed,
                remaining,
                availableQty,
                isConsumable,
                effect: String(sourceItem.effect || '').trim(),
                effectType: effectResult.effectType || '',
                effectMessage: effectResult.message || '',
                effectResult,
                useRangeFt: maxUseDistanceFt,
                distanceFt: inRange.distanceFt,
                targetTokenId: targetResolved.tokenId || targetId,
                sourceAccess
            };
        },

        async getSheetInventory(characterId) {
            const items = [];
            const rootEntry = this.loadInventoryRoot(characterId);
            const attrs = rootEntry.attrs || this.getInventoryRootContext(characterId).attrs;

            if (rootEntry.ok) {
                const inventoryContainer = this.getInventoryContainer(rootEntry.root) || rootEntry.root;
                this.walkInventoryNodes(inventoryContainer, (entry) => {
                    const qty = entry.qtyKey ? this.toIntOrNull(entry.node[entry.qtyKey]) : null;
                    if (qty !== null && qty <= 0) return false;
                    const meta = this.extractInventoryMeta(entry.node);
                    items.push({
                        name: entry.name,
                        quantity: qty === null ? 1 : Math.max(0, qty),
                        __path: entry.path,
                        ...meta
                    });
                    return false;
                });
            }

            if (!items.length && Array.isArray(attrs)) {
                for (let i = 0; i < attrs.length; i += 1) {
                    const attrNameRaw = String(attrs[i].get('name') || '').trim();
                    if (!attrNameRaw || attrNameRaw.toLowerCase().indexOf('store.') !== 0) continue;
                    const qty = this.toIntOrNull(attrs[i].get('current'));
                    if (qty === null) continue;
                    const prettyName = attrNameRaw.slice('store.'.length).replace(/[_\.]+/g, ' ').replace(/\s+/g, ' ').trim();
                    if (!prettyName) continue;
                    items.push({
                        name: prettyName,
                        quantity: Math.max(0, qty),
                        __path: attrNameRaw
                    });
                }
            }

            const dedup = {};
            for (let i = 0; i < items.length; i += 1) {
                const item = items[i];
                const key = String(item.name || '').trim().toLowerCase();
                if (!key) continue;

                const existing = dedup[key];
                if (!existing) {
                    dedup[key] = item;
                    continue;
                }

                const existingQty = Math.max(0, this.toIntOrNull(existing.quantity) || 0);
                const itemQty = Math.max(0, this.toIntOrNull(item.quantity) || 0);
                if (itemQty > existingQty) {
                    dedup[key] = item;
                }
            }

            return Object.keys(dedup)
                .map((k) => {
                    const inventoryItem = dedup[k];
                    const catalogItem = ItemCatalog.getByName(inventoryItem.name);
                    const merged = Object.assign({}, catalogItem || {}, inventoryItem);
                    delete merged.__path;
                    if (!merged.id) {
                        merged.id = 'inv_' + String(merged.name || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '_');
                    }
                    return new ItemRawData(merged);
                })
                .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
        },

        async removeInventoryItem(characterId, itemName, quantity = 1) {
            const normalizedName = String(itemName || '').trim().toLowerCase();
            const removeQty = Math.max(1, this.toIntOrNull(quantity) || 1);
            if (!characterId || !normalizedName) {
                return { ok: false, message: 'Missing character or item name.' };
            }

            const rootEntry = this.loadInventoryRoot(characterId);
            if (!rootEntry.ok) return { ok: false, message: rootEntry.message };

            const quantifiedTargets = [];
            const fallbackTargets = [];
            this.walkInventoryNodes(rootEntry.root, (entry) => {
                if (String(entry.name || '').trim().toLowerCase() !== normalizedName) return false;
                const currentQty = entry.qtyKey ? this.toIntOrNull(entry.node[entry.qtyKey]) : null;
                if (currentQty !== null && (currentQty <= 0 || currentQty < removeQty)) return false;
                if (currentQty === null && removeQty > 1) return false;
                const candidate = {
                    node: entry.node,
                    name: entry.name,
                    qtyKey: entry.qtyKey,
                    path: entry.path,
                    pathTokens: entry.pathTokens.slice(),
                    currentQty
                };
                if (entry.qtyKey && currentQty !== null) quantifiedTargets.push(candidate);
                else fallbackTargets.push(candidate);
                return false;
            });
            const target = quantifiedTargets[0] || fallbackTargets[0] || null;

            if (!target) {
                return { ok: false, message: 'Item not found with enough quantity.' };
            }

            if (target.qtyKey && target.currentQty !== null && target.currentQty > removeQty) {
                target.node[target.qtyKey] = target.currentQty - removeQty;
                this.saveInventoryRoot(rootEntry);
                return {
                    ok: true,
                    action: 'decremented',
                    itemName: String(target.name || itemName),
                    removed: removeQty,
                    remaining: Math.max(0, target.currentQty - removeQty),
                    removedChildren: 0
                };
            }

            const pathTokens = Array.isArray(target.pathTokens) ? target.pathTokens.slice() : [];
            if (!pathTokens.length) {
                return { ok: false, message: 'Item path is invalid.' };
            }

            const leaf = pathTokens[pathTokens.length - 1];
            const parentTokens = pathTokens.slice(0, -1);
            const parentNode = parentTokens.length ? this.getAtTokens(rootEntry.root, parentTokens) : rootEntry.root;
            if (!parentNode || typeof parentNode !== 'object') {
                return { ok: false, message: 'Parent node for item was not found.' };
            }

            let removedChildren = 0;
            if (!Array.isArray(parentNode)) {
                const childIds = this.parseChildIdList(target.node.childIDs);
                const parentShortId = String(target.node.shortID || '').trim();
                removedChildren = this.removeChildrenFromObjectContainer(parentNode, childIds, parentShortId, String(leaf));
            }

            if (Array.isArray(parentNode) && typeof leaf === 'number') {
                if (leaf < 0 || leaf >= parentNode.length) {
                    return { ok: false, message: 'Array index is out of bounds.' };
                }
                parentNode.splice(leaf, 1);
            } else {
                delete parentNode[leaf];
            }

            this.saveInventoryRoot(rootEntry);

            return {
                ok: true,
                action: 'deleted',
                itemName: String(target.name || itemName),
                removed: removeQty,
                remaining: 0,
                removedChildren
            };
        },

        async addInventoryItem(characterId, itemName, quantity = 1, options = {}) {
            const normalizedName = String(itemName || '').trim();
            const addQty = Math.max(1, this.toIntOrNull(quantity) || 1);
            if (!characterId || !normalizedName) {
                return { ok: false, message: 'Missing character or item name.' };
            }

            const safeName = String(itemName || '').trim();
            const normalizedKey = safeName.toLowerCase();
            const forceNewEntry = !!(options && options.forceNewEntry);
            const optionsTemplateRecord = (options && options.templateRecord && typeof options.templateRecord === 'object')
                ? options.templateRecord
                : null;
            const optionsTemplateId = options && options.templateId !== undefined && options.templateId !== null
                ? String(options.templateId || '').trim()
                : '';
            const fallbackItem = (options && options.fallbackItem && typeof options.fallbackItem === 'object')
                ? options.fallbackItem
                : null;
            const incomingStackNode = (optionsTemplateRecord && optionsTemplateRecord.node && typeof optionsTemplateRecord.node === 'object')
                ? optionsTemplateRecord.node
                : null;
            const rootEntry = this.loadInventoryRoot(characterId, { createIfMissing: true });
            if (!rootEntry.ok) return { ok: false, message: rootEntry.message };

            let existingMatch = null;
            this.walkInventoryNodes(rootEntry.root, (entry) => {
                if (String(entry.name || '').trim().toLowerCase() !== normalizedKey) return false;
                if (!entry.qtyKey) return false;
                if (incomingStackNode && !this.isSameStackSignature(entry.node, incomingStackNode, entry.name, safeName)) {
                    return false;
                }
                existingMatch = entry;
                return true;
            });

            if (!forceNewEntry && existingMatch && existingMatch.node && typeof existingMatch.node === 'object') {
                const currentQty = Math.max(0, this.toIntOrNull(existingMatch.node[existingMatch.qtyKey]) || 0);
                existingMatch.node[existingMatch.qtyKey] = currentQty + addQty;
                this.saveInventoryRoot(rootEntry);
                return {
                    ok: true,
                    action: 'incremented',
                    itemName: safeName,
                    added: addQty,
                    before: currentQty,
                    after: currentQty + addQty
                };
            }

            let templateRecord = optionsTemplateRecord;

            if (!templateRecord) {
                if (!ItemsTemplateCatalog.getAll().length) {
                    await this.loadItemTemplatesFromHandout();
                }
                templateRecord = this.getTemplateRecord(safeName, 'store', { templateId: optionsTemplateId });
            }

            if (!templateRecord && fallbackItem) {
                templateRecord = this.buildItemTemplateRecord(safeName, fallbackItem);
            }

            // Accept both catalog-entry shape ({ templateKey, record }) and plain record shape.
            if (
                templateRecord &&
                !templateRecord.node &&
                templateRecord.record &&
                typeof templateRecord.record === 'object'
            ) {
                templateRecord = templateRecord.record;
            }

            if (!templateRecord || !templateRecord.node || typeof templateRecord.node !== 'object') {
                return { ok: false, message: 'Template not found for "' + safeName + '".' };
            }

            const node = this.cloneJsonSafe(templateRecord.node);
            if (!node || typeof node !== 'object') return { ok: false, message: 'Template node is invalid.' };
            if (Object.prototype.hasOwnProperty.call(node, 'name')) node.name = safeName;
            if (Object.prototype.hasOwnProperty.call(node, 'recordName')) node.recordName = safeName;
            node.quantity = addQty;

            const templatePath = String((templateRecord.meta && templateRecord.meta.path) || '').trim();
            const templatePathTokens = this.parsePathTokens(templatePath);
            const containerTokens = templatePathTokens.length > 1 ? templatePathTokens.slice(0, -1) : ['integrants', 'integrants'];
            const container = this.ensureObjectPath(rootEntry.root, containerTokens);
            if (!container || typeof container !== 'object') {
                return { ok: false, message: 'Target container was not found.' };
            }

            let rowId = '';
            let oldParentRowId = '';
            if (!Array.isArray(container)) {
                const preferredRowId = templatePathTokens.length
                    ? String(templatePathTokens[templatePathTokens.length - 1] || '').trim()
                    : '';
                const hasUsablePreferredRowId = !!preferredRowId && !this.isPlaceholderInventoryRowId(preferredRowId);
                if (hasUsablePreferredRowId) oldParentRowId = preferredRowId;
                if (!oldParentRowId && templateRecord.meta && templateRecord.meta.rowId) {
                    const rowIdRaw = String(templateRecord.meta.rowId || '').trim();
                    const parts = rowIdRaw.split('.');
                    oldParentRowId = parts.length ? String(parts[parts.length - 1] || '').trim() : '';
                    if (this.isPlaceholderInventoryRowId(oldParentRowId)) oldParentRowId = '';
                }
                rowId = hasUsablePreferredRowId && !Object.prototype.hasOwnProperty.call(container, preferredRowId)
                    ? preferredRowId
                    : this.makeInventoryRowId(container);
            }

            let nextArrayPosition = this.getNextArrayPosition(container);
            const takeArrayPosition = () => {
                const current = nextArrayPosition;
                nextArrayPosition += 1;
                return current;
            };

            const oldParentShortID = String(node.shortID || '').trim();
            let newParentShortID = oldParentShortID;
            if (oldParentShortID) {
                newParentShortID = this.makeShortId();
                node.shortID = newParentShortID;
            }
            if (Object.prototype.hasOwnProperty.call(node, 'createdTime')) node.createdTime = Date.now();
            if (Object.prototype.hasOwnProperty.call(node, 'arrayPosition')) node.arrayPosition = takeArrayPosition();

            const sourceIdMap = {};
            if (oldParentRowId && rowId) sourceIdMap[oldParentRowId] = rowId;

            let templateChildrenCloned = 0;
            if (!Array.isArray(container) && templateRecord.meta && templateRecord.meta.childNodes && typeof templateRecord.meta.childNodes === 'object') {
                const childNodes = templateRecord.meta.childNodes;

                if (!oldParentRowId) {
                    const topChildIds = this.parseChildIdList(node.childIDs);
                    for (let t = 0; t < topChildIds.length; t += 1) {
                        const topId = String(topChildIds[t] || '').trim();
                        if (!topId || !Object.prototype.hasOwnProperty.call(childNodes, topId)) continue;
                        const topNode = childNodes[topId];
                        if (!topNode || typeof topNode !== 'object') continue;
                        const sourceId = String(topNode.sourceID || topNode.sourceId || '').trim();
                        if (!sourceId) continue;
                        oldParentRowId = sourceId;
                        if (rowId) sourceIdMap[oldParentRowId] = rowId;
                        break;
                    }
                }

                const oldTopIds = this.parseChildIdList(node.childIDs).filter((id) => Object.prototype.hasOwnProperty.call(childNodes, id));
                const orderedOldIds = [];
                const visitedOldIds = {};
                const visitOldId = (id) => {
                    const oldId = String(id || '').trim();
                    if (!oldId || visitedOldIds[oldId]) return;
                    if (!Object.prototype.hasOwnProperty.call(childNodes, oldId)) return;
                    visitedOldIds[oldId] = true;
                    orderedOldIds.push(oldId);
                    const nested = this.parseChildIdList(childNodes[oldId].childIDs);
                    for (let x = 0; x < nested.length; x += 1) visitOldId(nested[x]);
                };
                for (let t = 0; t < oldTopIds.length; t += 1) visitOldId(oldTopIds[t]);
                const allChildKeys = Object.keys(childNodes);
                for (let t = 0; t < allChildKeys.length; t += 1) visitOldId(allChildKeys[t]);

                if (orderedOldIds.length) {
                    const rowIdMap = {};
                    const shortIdMap = {};
                    if (oldParentShortID && newParentShortID) shortIdMap[oldParentShortID] = newParentShortID;

                    for (let c = 0; c < orderedOldIds.length; c += 1) {
                        const oldId = orderedOldIds[c];
                        let newId = this.makeInventoryRowId(container);
                        while (
                            !newId ||
                            newId === rowId ||
                            Object.values(rowIdMap).indexOf(newId) >= 0
                        ) {
                            newId = this.makeInventoryRowId(container);
                        }
                        rowIdMap[oldId] = newId;
                        sourceIdMap[oldId] = newId;

                        const originalNode = childNodes[oldId];
                        const oldChildShortId = originalNode && typeof originalNode === 'object'
                            ? String(originalNode.shortID || '').trim()
                            : '';
                        if (oldChildShortId) {
                            let newChildShortId = this.makeShortId();
                            while (Object.values(shortIdMap).indexOf(newChildShortId) >= 0) {
                                newChildShortId = this.makeShortId();
                            }
                            shortIdMap[oldChildShortId] = newChildShortId;
                        }
                    }

                    for (let c = 0; c < orderedOldIds.length; c += 1) {
                        const oldId = orderedOldIds[c];
                        const childClone = this.cloneJsonSafe(childNodes[oldId]);
                        if (!childClone || typeof childClone !== 'object') continue;

                        const newId = rowIdMap[oldId];
                        if (!newId) continue;

                        if (Object.prototype.hasOwnProperty.call(childClone, 'shortID')) {
                            const oldShortId = String(childClone.shortID || '').trim();
                            if (oldShortId && shortIdMap[oldShortId]) childClone.shortID = shortIdMap[oldShortId];
                        }
                        if (Object.prototype.hasOwnProperty.call(childClone, 'parentID')) {
                            const oldParentId = String(childClone.parentID || '').trim();
                            if (oldParentId && shortIdMap[oldParentId]) childClone.parentID = shortIdMap[oldParentId];
                            else if (oldParentId && rowIdMap[oldParentId]) childClone.parentID = rowIdMap[oldParentId];
                            else if (oldParentId === oldParentShortID) childClone.parentID = newParentShortID;
                        }
                        if (Object.prototype.hasOwnProperty.call(childClone, 'childIDs')) {
                            const childIdList = this.parseChildIdList(childClone.childIDs);
                            const mappedChildIds = [];
                            for (let m = 0; m < childIdList.length; m += 1) {
                                const mapped = rowIdMap[String(childIdList[m] || '').trim()];
                                if (mapped) mappedChildIds.push(mapped);
                            }
                            childClone.childIDs = JSON.stringify(mappedChildIds);
                        }
                        this.remapSourceIdsDeep(childClone, sourceIdMap);
                        if (Object.prototype.hasOwnProperty.call(childClone, 'createdTime')) childClone.createdTime = Date.now();
                        if (Object.prototype.hasOwnProperty.call(childClone, 'arrayPosition')) childClone.arrayPosition = takeArrayPosition();
                        container[newId] = childClone;
                        templateChildrenCloned += 1;
                    }

                    const newTopIds = [];
                    for (let iTop = 0; iTop < oldTopIds.length; iTop += 1) {
                        const mappedTop = rowIdMap[String(oldTopIds[iTop] || '').trim()];
                        if (mappedTop) newTopIds.push(mappedTop);
                    }
                    node.childIDs = JSON.stringify(newTopIds);
                }
            }

            this.remapSourceIdsDeep(node, sourceIdMap);
            if (Array.isArray(container)) container.push(node);
            else container[rowId] = node;
            this.saveInventoryRoot(rootEntry);

            return {
                ok: true,
                action: 'created',
                itemName: safeName,
                added: addQty,
                before: 0,
                after: addQty,
                templateChildrenCloned
            };
        }
    };

    /** -----------------------------------------------------------------------
     * @section Item Service
     * --------------------------------------------------------------------- */
    const ItemService = {
        draftFields: [
            { key: 'id', label: 'ID', type: 'text', defaultValue: '' },
            { key: 'templateId', label: 'Template ID', type: 'text', defaultValue: '' },
            { key: 'name', label: 'Name', type: 'text', defaultValue: '' },
            { key: 'abbreviation', label: 'Abbreviation', type: 'text', defaultValue: '' },
            { key: 'description', label: 'Description', type: 'text', defaultValue: '' },
            { key: 'quantity', label: 'Quantity', type: 'number', defaultValue: 0 },
            { key: 'weight', label: 'Weight', type: 'number', defaultValue: 0 },
            { key: 'AC', label: 'AC', type: 'text', defaultValue: '' },
            { key: 'modifier', label: 'Modifier', type: 'text', defaultValue: '' },
            { key: 'debuff', label: 'Debuff', type: 'text', defaultValue: '' },
            { key: 'requirement', label: 'Requirement', type: 'text', defaultValue: '' },
            { key: 'type', label: 'Type', type: 'text', defaultValue: '' },
            { key: 'subtype', label: 'Subtype', type: 'text', defaultValue: '' },
            { key: 'rarity', label: 'Rarity', type: 'text', defaultValue: 'common' },
            { key: 'defaultPrice', label: 'Default Price', type: 'number', defaultValue: 0 },
            { key: 'defaultPriceType', label: 'Price Type', type: 'text', defaultValue: CONFIG.CURRENCY_FALLBACK },
            { key: 'imageUrl', label: 'Image URL', type: 'text', defaultValue: '' },
            { key: 'effect', label: 'Effect', type: 'text', defaultValue: '' },
            { key: 'diceCount', label: 'Dice Count', type: 'number', defaultValue: 0 },
            { key: 'diceSide', label: 'Dice Side', type: 'number', defaultValue: 0 },
            { key: 'bonus', label: 'Bonus', type: 'number', defaultValue: 0 },
            { key: 'rollBonus', label: 'Roll Bonus', type: 'number', defaultValue: 0 },
            { key: 'area', label: 'Area', type: 'text', defaultValue: 'single' },
            { key: 'damage', label: 'Damage', type: 'text', defaultValue: '' },
            { key: 'damageType', label: 'Damage Type', type: 'text', defaultValue: '' },
            { key: 'properties', label: 'Properties', type: 'text', defaultValue: '' },
            { key: 'mastery', label: 'Mastery', type: 'text', defaultValue: '' },
            { key: 'tags', label: 'Tags', type: 'text', defaultValue: '' },
            { key: 'equippable', label: 'Equippable', type: 'boolean', defaultValue: false },
            { key: 'equipped', label: 'Equipped', type: 'boolean', defaultValue: false },
            { key: 'attunement', label: 'Attunement', type: 'boolean', defaultValue: false },
            { key: 'attuned', label: 'Attuned', type: 'boolean', defaultValue: false },
            { key: 'attunementPrerequisite', label: 'Attunement Prerequisite', type: 'text', defaultValue: '' },
            { key: 'consumable', label: 'Consumable', type: 'boolean', defaultValue: false },
            { key: 'usable', label: 'Usable', type: 'boolean', defaultValue: false },
            { key: 'useTarget', label: 'Use Target', type: 'boolean', defaultValue: true },
            { key: 'useRange', label: 'Use Range', type: 'text', defaultValue: '5ft' },
            { key: 'consumableRange', label: 'Consumable Range', type: 'text', defaultValue: '' },
            { key: 'questItem', label: 'Quest Item', type: 'boolean', defaultValue: false }
        ],

        getDraftKey(ctx = {}) {
            return String(ctx.playerId || ctx.who || 'GM').trim() || 'GM';
        },

        slugify(value = '') {
            return String(value || '')
                .trim()
                .toLowerCase()
                .replace(/<[^>]*>/g, '')
                .replace(/&[^;\s]+;/g, ' ')
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_+|_+$/g, '') || 'custom_item';
        },

        createDefaultDraft() {
            const draft = {};
            for (let i = 0; i < this.draftFields.length; i += 1) {
                const field = this.draftFields[i];
                draft[field.key] = this.cloneFieldValue(field.defaultValue);
            }
            return draft;
        },

        cloneFieldValue(value) {
            if (value === null || value === undefined) return value;
            if (typeof value === 'object') return InventoryService.cloneJsonSafe(value);
            return value;
        },

        getDraft(ctx = {}, options = {}) {
            const root = State.get();
            root.itemDrafts = root.itemDrafts || {};
            const key = this.getDraftKey(ctx);
            if (!root.itemDrafts[key] || options.reset) root.itemDrafts[key] = this.createDefaultDraft();
            return root.itemDrafts[key];
        },

        clearDraft(ctx = {}) {
            const root = State.get();
            root.itemDrafts = root.itemDrafts || {};
            delete root.itemDrafts[this.getDraftKey(ctx)];
        },

        getFieldSpec(fieldKey = '') {
            const key = String(fieldKey || '').trim();
            return this.draftFields.find((field) => field.key === key) || null;
        },

        setDraftField(ctx = {}, fieldKey = '', value = '') {
            const field = this.getFieldSpec(fieldKey);
            if (!field) return { ok: false, message: 'Unknown item field: ' + fieldKey + '.' };
            const draft = this.getDraft(ctx);
            if (field.type === 'number') draft[field.key] = Number(value) || 0;
            else if (field.type === 'boolean') draft[field.key] = Utils.toBoolean(value, false);
            else draft[field.key] = String(value === undefined || value === null ? '' : value).trim();
            return { ok: true, draft };
        },

        toggleDraftField(ctx = {}, fieldKey = '') {
            const field = this.getFieldSpec(fieldKey);
            if (!field || field.type !== 'boolean') return { ok: false, message: 'Field is not toggleable: ' + fieldKey + '.' };
            const draft = this.getDraft(ctx);
            draft[field.key] = !Utils.toBoolean(draft[field.key], false);
            return { ok: true, draft };
        },

        normalizeDraft(draft = {}) {
            const item = {};
            for (let i = 0; i < this.draftFields.length; i += 1) {
                const field = this.draftFields[i];
                const value = Object.prototype.hasOwnProperty.call(draft, field.key) ? draft[field.key] : field.defaultValue;
                if (field.type === 'number') item[field.key] = Number(value) || 0;
                else if (field.type === 'boolean') item[field.key] = Utils.toBoolean(value, field.defaultValue);
                else item[field.key] = String(value === undefined || value === null ? '' : value).trim();
            }

            item.name = String(item.name || '').trim();
            item.id = String(item.id || this.slugify(item.name)).trim();
            if (!item.abbreviation) item.abbreviation = item.name;
            if (!item.consumableRange) item.consumableRange = item.useRange || '5ft';
            item.defaultPriceType = CurrencyService.normalizeType(item.defaultPriceType) || CONFIG.CURRENCY_FALLBACK;
            return new ItemRawData(item);
        },

        itemToPlainObject(item) {
            const safeItem = item instanceof ItemRawData ? item : new ItemRawData(item || {});
            const out = {};
            for (let i = 0; i < this.draftFields.length; i += 1) {
                const key = this.draftFields[i].key;
                out[key] = safeItem[key];
            }
            return out;
        },

        async readHandoutItems() {
            let raw = '';
            let parsed = null;
            try {
                raw = await Handout.read(ItemCatalog.handoutRef, ItemCatalog.field, { createIfMissing: true });
                parsed = InventoryService.tryParseHandoutPayload(raw);
            } catch (error) {
                parsed = null;
            }
            const payload = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
            const items = Array.isArray(parsed)
                ? parsed.slice()
                : (Array.isArray(payload.items) ? payload.items.slice() : []);
            return { raw, parsed, payload, items };
        },

        async writeHandoutItems(items = [], parsed = null, payload = {}) {
            const safeItems = Array.isArray(items) ? items : [];
            const nextPayload = Array.isArray(parsed)
                ? safeItems
                : Object.assign({}, payload || {}, { items: safeItems });
            const nextContent = JSON.stringify(nextPayload, null, 4);
            await Handout.write(ItemCatalog.handoutRef, nextContent, ItemCatalog.field, { createIfMissing: true });
            await InventoryService.loadItemCatalogFromHandout();
            return ItemCatalog.getAll();
        },

        async createFromDraft(ctx = {}) {
            const draft = this.getDraft(ctx);
            const item = this.normalizeDraft(draft);
            if (!item.name) return { ok: false, message: 'Item name is required.' };
            if (!item.id) return { ok: false, message: 'Item ID is required.' };

            const existingById = ItemCatalog.getByID(item.id);
            const existingByName = ItemCatalog.getByName(item.name);
            if (existingById || existingByName) {
                return { ok: false, message: 'Item already exists in catalog.' };
            }

            const handout = await this.readHandoutItems();
            const idKey = String(item.id || '').trim().toLowerCase();
            const nameKey = String(item.name || '').trim().toLowerCase();
            const duplicate = handout.items.find((entry) => {
                const currentId = String((entry && entry.id) || '').trim().toLowerCase();
                const currentName = String((entry && entry.name) || '').trim().toLowerCase();
                return (currentId && currentId === idKey) || (currentName && currentName === nameKey);
            });
            if (duplicate) return { ok: false, message: 'Item already exists in handout.' };

            handout.items.push(this.itemToPlainObject(item));
            await this.writeHandoutItems(handout.items, handout.parsed, handout.payload);
            this.clearDraft(ctx);
            return { ok: true, item: ItemCatalog.getByID(item.id) || item, total: ItemCatalog.getAll().length };
        },

        async removeByName(itemName = '') {
            const safeName = String(itemName || '').trim();
            if (!safeName) return { ok: false, message: 'Item name is required.' };
            const nameKey = safeName.toLowerCase();
            const existing = ItemCatalog.getByName(safeName);
            if (!existing) return { ok: false, message: 'Item was not found in catalog.' };

            const handout = await this.readHandoutItems();
            const before = handout.items.length;
            handout.items = handout.items.filter((entry) => String((entry && entry.name) || '').trim().toLowerCase() !== nameKey);
            if (handout.items.length === before) return { ok: false, message: 'Item was not found in handout.' };
            await this.writeHandoutItems(handout.items, handout.parsed, handout.payload);
            return { ok: true, itemName: existing.name, total: ItemCatalog.getAll().length };
        },

        search(query = '') {
            const needle = String(query || '').trim().toLowerCase();
            if (!needle) return [];
            return ItemCatalog.getAll().filter((item) => {
                return String(item.name || '').trim().toLowerCase().indexOf(needle) >= 0;
            });
        },

        getByExactName(itemName = '') {
            return ItemCatalog.getByName(itemName);
        },

        getSectionName(item = {}) {
            const type = String(item.type || '').trim().replace(/\s+/g, ' ');
            if (type) {
                return type
                    .split(' ')
                    .map((part) => part ? (part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()) : '')
                    .join(' ');
            }
            return 'Other Items';
        },

        groupBySection(items = []) {
            const groups = {};
            const order = [];
            for (let i = 0; i < items.length; i += 1) {
                const item = items[i];
                const section = this.getSectionName(item);
                if (!groups[section]) {
                    groups[section] = [];
                    order.push(section);
                }
                groups[section].push(item);
            }
            return order.map((section) => ({ section, items: groups[section] }));
        }
    };

    /** -----------------------------------------------------------------------
     * @section Currency Service
     * --------------------------------------------------------------------- */
    const CurrencyService = {
        normalizeType(currencyType = '') {
            return InventoryService.normalizeCurrencyType(currencyType);
        },

        getGoldConversionRate(currencyType = '') {
            const coinType = this.normalizeType(currencyType);
            if (coinType === 'cp') return 100;
            if (coinType === 'sp') return 10;
            return 1;
        },

        async getWallet(characterId = '') {
            const safeCharacterId = String(characterId || '').trim();
            if (!safeCharacterId) return { cp: 0, sp: 0, gp: 0 };

            const cpRaw = await R20.getSheet(safeCharacterId, 'cp');
            const spRaw = await R20.getSheet(safeCharacterId, 'sp');
            const gpRaw = await R20.getSheet(safeCharacterId, 'gp');
            return {
                cp: Math.max(0, InventoryService.toIntOrNull(cpRaw) || 0),
                sp: Math.max(0, InventoryService.toIntOrNull(spRaw) || 0),
                gp: Math.max(0, InventoryService.toIntOrNull(gpRaw) || 0)
            };
        },

        async setCurrencyValue(characterId = '', currencyType = '', value = 0) {
            const safeCharacterId = String(characterId || '').trim();
            const coinType = this.normalizeType(currencyType);
            const amount = Math.max(0, InventoryService.toIntOrNull(value) || 0);
            if (!safeCharacterId || !coinType) return false;
            await R20.setSheet(safeCharacterId, coinType, amount === 0 ? -1 : amount, { snapshotValue: amount });
            return true;
        },

        async restoreWallet(characterId = '', wallet = {}) {
            const safeWallet = wallet && typeof wallet === 'object' ? wallet : {};
            await this.setCurrencyValue(characterId, 'cp', safeWallet.cp);
            await this.setCurrencyValue(characterId, 'sp', safeWallet.sp);
            await this.setCurrencyValue(characterId, 'gp', safeWallet.gp);
            return true;
        },

        async transferCurrency(options = {}) {
            return InventoryService.transferCurrency(options);
        },

        async creditCharacter({ characterId = '', currencyType = '', quantity = 0 } = {}) {
            const safeCharacterId = String(characterId || '').trim();
            const coinType = this.normalizeType(currencyType);
            const qty = Math.max(0, InventoryService.toIntOrNull(quantity) || 0);
            if (!safeCharacterId || !coinType || qty <= 0) {
                return { ok: false, message: 'Missing character, currency type, or quantity.' };
            }

            const currentRaw = await R20.getSheet(safeCharacterId, coinType);
            const before = Math.max(0, InventoryService.toIntOrNull(currentRaw) || 0);
            const after = before + qty;
            await R20.setSheet(safeCharacterId, coinType, after);
            return { ok: true, characterId: safeCharacterId, currencyType: coinType, credited: qty, before, after };
        },

        async spendFromToken({
            tokenId = '',
            currencyType = '',
            quantity = 0,
            playerId = '',
            isGM = false
        } = {}) {
            const safeTokenId = String(tokenId || '').trim();
            const coinType = this.normalizeType(currencyType);
            const qty = Math.max(0, InventoryService.toIntOrNull(quantity) || 0);
            if (!safeTokenId || !coinType || qty <= 0) {
                return { ok: false, message: 'Missing token, currency type, or quantity.' };
            }

            const accessResult = R20.requireSourceTokenAccess({
                sourceTokenId: safeTokenId,
                playerId,
                isGM,
                actionLabel: 'spend currency from'
            });
            const access = accessResult.access;

            if (!access.token || !access.character) {
                return { ok: false, message: 'Buyer token is not linked to a character.' };
            }

            if (!accessResult.ok) {
                return {
                    ok: false,
                    message: accessResult.message,
                    access
                };
            }

            const characterId = String(access.character.id || '').trim();
            const walletBefore = await this.getWallet(characterId);
            const before = Math.max(0, InventoryService.toIntOrNull(walletBefore[coinType]) || 0);
            const gpBefore = Math.max(0, InventoryService.toIntOrNull(walletBefore.gp) || 0);
            let after = before - qty;
            let gpAfter = gpBefore;
            let convertedGp = 0;
            let convertedAmount = 0;

            if (before < qty && coinType !== 'gp') {
                const rate = this.getGoldConversionRate(coinType);
                const shortage = qty - before;
                convertedGp = Math.ceil(shortage / rate);
                convertedAmount = convertedGp * rate;
                if (gpBefore >= convertedGp) {
                    gpAfter = gpBefore - convertedGp;
                    after = before + convertedAmount - qty;
                }
            }

            if (after < 0) {
                return {
                    ok: false,
                    message: 'Not enough ' + coinType.toUpperCase() + ' to buy this item.',
                    available: before,
                    availableGp: gpBefore,
                    requested: qty,
                    currencyType: coinType,
                    access
                };
            }

            if (coinType !== 'gp' && convertedGp > 0) {
                await this.setCurrencyValue(characterId, 'gp', gpAfter);
            }
            await this.setCurrencyValue(characterId, coinType, after);
            const walletAfter = await this.getWallet(characterId);
            return {
                ok: true,
                tokenId: safeTokenId,
                characterId,
                tokenName: access.tokenName,
                currencyType: coinType,
                spent: qty,
                before,
                after,
                walletBefore,
                walletAfter,
                convertedFromGp: convertedGp > 0,
                convertedGp,
                convertedAmount,
                access
            };
        }
    };

    /** -----------------------------------------------------------------------
     * @section Shop Repository
     * --------------------------------------------------------------------- */
    const ShopRepository = {
        root() {
            const root = State.get();
            root.shops = root.shops || {};
            return root.shops;
        },

        normalizeId(id = '') {
            return Shop.normalizeId(id);
        },

        exists(id = '') {
            const safeId = this.normalizeId(id);
            return !!(safeId && this.root()[safeId]);
        },

        get(id = '') {
            const safeId = this.normalizeId(id);
            if (!safeId) return null;
            const raw = this.root()[safeId];
            return raw ? new Shop(raw) : null;
        },

        save(shop) {
            const record = shop instanceof Shop ? shop : new Shop(shop || {});
            if (!record.id) {
                return { ok: false, message: 'Shop ID is required.' };
            }
            record.updatedAt = Date.now();
            this.root()[record.id] = record.toJSON();
            return { ok: true, shop: record };
        },

        list({ includeHidden = true } = {}) {
            return Object.keys(this.root())
                .map((id) => this.get(id))
                .filter((shop) => shop && (includeHidden || !shop.isHidden()))
                .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
        },

        remove(id = '') {
            const safeId = this.normalizeId(id);
            if (!safeId || !this.root()[safeId]) return false;
            delete this.root()[safeId];
            return true;
        }
    };

    /** -----------------------------------------------------------------------
     * @section Shop Service
     * --------------------------------------------------------------------- */
    const ShopService = {
        normalizeAction(action = '') {
            const normalized = String(action || '').trim().toLowerCase();
            return ACTIONS.SHOP.includes(normalized) ? normalized : '';
        },

        normalizeState(state = '') {
            return Shop.normalizeState(state);
        },

        getSupportedActions() {
            return ACTIONS.SHOP.slice();
        },

        isActionSupported(action = '') {
            return this.normalizeAction(action) !== '';
        },

        async loadShopCatalogFromHandout(handoutRef = ShopCatalog.handoutRef, field = ShopCatalog.field) {
            const safeRef = String(handoutRef || ShopCatalog.handoutRef).trim();
            const safeField = String(field || ShopCatalog.field || 'notes').trim();
            const rawContent = await Handout.read(safeRef, safeField);
            const parsed = InventoryService.tryParseHandoutPayload(rawContent);
            const sourceShops = Array.isArray(parsed)
                ? parsed
                : (parsed && Array.isArray(parsed.shops) ? parsed.shops : []);

            ShopCatalog.handoutRef = safeRef;
            ShopCatalog.field = safeField;
            ShopCatalog.raw = rawContent;
            ShopCatalog.clear();

            sourceShops.forEach((rawShop) => {
                ShopCatalog.register(rawShop);
            });

            return ShopCatalog.getAll();
        },

        async exportShopToHandout(shopId = '', handoutRef = ShopCatalog.handoutRef, field = ShopCatalog.field) {
            const result = this.getShop(shopId);
            if (!result.ok) return result;

            const safeRef = String(handoutRef || ShopCatalog.handoutRef).trim();
            const safeField = String(field || ShopCatalog.field || 'notes').trim();
            let rawContent = '';
            let parsed = null;

            try {
                rawContent = await Handout.read(safeRef, safeField, { createIfMissing: true });
                parsed = InventoryService.tryParseHandoutPayload(rawContent);
            } catch (error) {
                parsed = null;
            }

            const payload = (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
                ? parsed
                : {};
            const shops = Array.isArray(parsed)
                ? parsed.slice()
                : (Array.isArray(payload.shops) ? payload.shops.slice() : []);
            const exportedShop = result.shop.toJSON();
            const exportId = ShopRepository.normalizeId(exportedShop.id);
            let updated = false;

            for (let i = 0; i < shops.length; i += 1) {
                const currentId = ShopRepository.normalizeId((shops[i] && (shops[i].id || shops[i].name)) || '');
                if (currentId && currentId === exportId) {
                    shops[i] = exportedShop;
                    updated = true;
                    break;
                }
            }

            if (!updated) shops.push(exportedShop);

            const nextPayload = Array.isArray(parsed)
                ? shops
                : Object.assign({}, payload, { shops });
            const nextContent = JSON.stringify(nextPayload, null, 2);
            await Handout.write(safeRef, nextContent, safeField, { createIfMissing: true });
            ShopCatalog.handoutRef = safeRef;
            ShopCatalog.field = safeField;
            ShopCatalog.raw = nextContent;
            ShopCatalog.clear();
            shops.forEach((shop) => ShopCatalog.register(shop));

            return { ok: true, shop: result.shop, created: !updated, handoutRef: safeRef, field: safeField };
        },

        importShopFromCatalog(shopId = '', options = {}) {
            const safeId = ShopRepository.normalizeId(shopId);
            if (!safeId) return { ok: false, message: 'Shop ID is required.' };
            const catalogShop = ShopCatalog.get(safeId);
            if (!catalogShop) return { ok: false, message: 'Shop was not found in the shop catalog.' };
            if (ShopRepository.exists(safeId) && !(options && options.overwrite)) {
                return { ok: false, message: 'Shop already exists in state: ' + safeId + '.' };
            }
            return ShopRepository.save(new Shop(catalogShop.toJSON()));
        },

        importAllFromCatalog(options = {}) {
            const shops = ShopCatalog.getAll();
            const imported = [];
            const skipped = [];

            for (let i = 0; i < shops.length; i += 1) {
                const shop = shops[i];
                const result = this.importShopFromCatalog(shop.id, options);
                if (result.ok) imported.push(result.shop);
                else skipped.push({ shop, message: result.message });
            }

            return { ok: true, imported, skipped };
        },

        createShop({
            id = '',
            name = '',
            state = 'close',
            hidePrice = SHOP_DEFAULT_CONFIG.hidePrice,
            hasStock = SHOP_DEFAULT_CONFIG.hasStock,
            blacklist = [],
            location = []
        } = {}) {
            const safeId = ShopRepository.normalizeId(id || name);
            if (!safeId) return { ok: false, message: 'Shop ID is required.' };
            if (ShopRepository.exists(safeId)) {
                return { ok: false, message: 'Shop already exists: ' + safeId + '.' };
            }

            const shop = new Shop({
                id: safeId,
                name: name || safeId,
                state,
                config: {
                    hidePrice,
                    hasStock
                },
                blacklist,
                location
            });
            return ShopRepository.save(shop);
        },

        deleteShop(id = '') {
            const result = this.getShop(id);
            if (!result.ok) return result;
            const removed = ShopRepository.remove(result.shop.id);
            if (!removed) return { ok: false, message: 'Unable to remove shop.' };
            return { ok: true, shop: result.shop };
        },

        listShops({ includeHidden = true } = {}) {
            return ShopRepository.list({ includeHidden });
        },

        getShop(id = '') {
            const shop = ShopRepository.get(id);
            if (!shop) return { ok: false, message: 'Shop was not found.' };
            return { ok: true, shop };
        },

        setShopState(id = '', state = '') {
            const result = this.getShop(id);
            if (!result.ok) return result;
            const safeState = String(state || '').trim().toLowerCase();
            if (safeState === 'hidden' || safeState === 'hide') {
                result.shop.hidden = true;
            } else if (safeState === 'reveal') {
                result.shop.hidden = false;
            } else {
                result.shop.state = this.normalizeState(state);
            }
            return ShopRepository.save(result.shop);
        },

        toggleOpenClose(id = '') {
            const result = this.getShop(id);
            if (!result.ok) return result;
            result.shop.state = result.shop.isOpen() ? 'close' : 'open';
            return ShopRepository.save(result.shop);
        },

        toggleHidden(id = '') {
            const result = this.getShop(id);
            if (!result.ok) return result;
            result.shop.hidden = !result.shop.isHidden();
            return ShopRepository.save(result.shop);
        },

        setConfig(id = '', key = '', value = '') {
            const result = this.getShop(id);
            if (!result.ok) return result;
            const safeKey = String(key || '').trim();
            if (!Object.prototype.hasOwnProperty.call(SHOP_DEFAULT_CONFIG, safeKey)) {
                return { ok: false, message: 'Unknown shop config: ' + safeKey + '.' };
            }
            result.shop.config[safeKey] = Utils.toBoolean(value, result.shop.config[safeKey]);
            return ShopRepository.save(result.shop);
        },

        toggleStockMode(id = '') {
            const result = this.getShop(id);
            if (!result.ok) return result;
            result.shop.config.hasStock = !Utils.toBoolean(result.shop.config.hasStock, SHOP_DEFAULT_CONFIG.hasStock);
            return ShopRepository.save(result.shop);
        },

        clearItemPrices(id = '') {
            const result = this.getShop(id);
            if (!result.ok) return result;
            result.shop.itemList.forEach((item) => {
                item.price = -1;
                item.defaultPrice = -1;
            });
            return ShopRepository.save(result.shop);
        },

        setItemPrice(id = '', itemName = '', price = 0, priceType = '') {
            const result = this.getShop(id);
            if (!result.ok) return result;
            const item = result.shop.findItem(itemName);
            if (!item) return { ok: false, message: 'Item was not found in shop.' };
            item.price = Number(price);
            if (Number.isNaN(item.price)) item.price = 0;
            item.defaultPrice = item.price;
            item.priceType = CurrencyService.normalizeType(priceType) || item.priceType || CONFIG.CURRENCY_FALLBACK;
            item.defaultPriceType = item.priceType;
            return ShopRepository.save(result.shop);
        },

        setItemStock(id = '', itemName = '', quantity = SHOP_INFINITE_STOCK) {
            const result = this.getShop(id);
            if (!result.ok) return result;
            const item = result.shop.findItem(itemName);
            if (!item) return { ok: false, message: 'Item was not found in shop.' };
            const qtyText = String(quantity || '').trim().toLowerCase();
            const stock = qtyText === 'unlimited' || qtyText === 'infinite' || qtyText === 'infinity'
                ? SHOP_INFINITE_STOCK
                : Math.max(0, InventoryService.toIntOrNull(quantity) || 0);
            item.stock = stock;
            item.quantity = stock;
            return ShopRepository.save(result.shop);
        },

        updateBlacklist(id = '', mode = '', identity = '') {
            const result = this.getShop(id);
            if (!result.ok) return result;
            const safeMode = String(mode || '').trim().toLowerCase();
            const safeIdentity = String(identity || '').trim();
            if (!safeIdentity) return { ok: false, message: 'Blacklist identity is required.' };
            if (safeMode !== 'add' && safeMode !== 'remove') {
                return { ok: false, message: 'Use blacklist add or blacklist remove.' };
            }

            if (safeMode === 'add') {
                result.shop.blacklist = Utils.uniqueNames(result.shop.blacklist.concat([safeIdentity]));
            } else {
                const key = safeIdentity.toLowerCase();
                result.shop.blacklist = result.shop.blacklist.filter((entry) => String(entry || '').trim().toLowerCase() !== key);
            }
            return ShopRepository.save(result.shop);
        },

        resolveBlacklistIdentity(identity = '') {
            const safeIdentity = String(identity || '').trim();
            if (!safeIdentity) return '';
            const token = R20.getTokenById(safeIdentity);
            const character = R20.getCharacterFromToken(token);
            if (character && character.id) return character.id;
            return safeIdentity;
        },

        addItem({
            shopId = '',
            itemName = '',
            quantity = SHOP_INFINITE_STOCK,
            price = null,
            priceType = '',
            equippable = null,
            hidden = false
        } = {}) {
            const result = this.getShop(shopId);
            if (!result.ok) return result;
            const safeName = String(itemName || '').trim();
            if (!safeName) return { ok: false, message: 'Item name is required.' };

            const catalogItem = ItemCatalog.getByName(safeName);
            const hasEquippableOverride = equippable !== undefined &&
                equippable !== null &&
                String(equippable).trim() !== '';
            const canEquip = Utils.toBoolean(equippable, false);
            const itemPayload = Object.assign({}, catalogItem || {}, {
                name: catalogItem && catalogItem.name ? catalogItem.name : safeName,
                quantity,
                stock: quantity,
                price,
                priceType,
                hidden
            });
            if (hasEquippableOverride) {
                itemPayload.equippable = canEquip;
                itemPayload.equipped = false;
            }

            const item = result.shop.upsertItem(itemPayload);
            if (!item) return { ok: false, message: 'Unable to add item to shop.' };

            const saveResult = ShopRepository.save(result.shop);
            if (!saveResult.ok) return saveResult;
            return { ok: true, shop: result.shop, item };
        },

        removeItem(shopId = '', itemName = '') {
            const result = this.getShop(shopId);
            if (!result.ok) return result;
            const removed = result.shop.removeItem(itemName);
            if (!removed) return { ok: false, message: 'Item was not found in shop.' };
            const saveResult = ShopRepository.save(result.shop);
            if (!saveResult.ok) return saveResult;
            return { ok: true, shop: result.shop, itemName };
        },

        isBuyerBlacklisted(shop, identities = []) {
            const safeIdentities = Array.isArray(identities) ? identities : [];
            for (let i = 0; i < safeIdentities.length; i += 1) {
                if (shop.isBlacklisted(safeIdentities[i])) return true;
            }
            return false;
        },

        async buyItem({
            shopId = '',
            buyerTokenId = '',
            itemName = '',
            quantity = 1,
            playerId = '',
            who = '',
            isGM = false
        } = {}) {
            const result = this.getShop(shopId);
            if (!result.ok) return result;

            const shop = result.shop;
            if (!shop.isOpen()) {
                return { ok: false, message: 'Shop is not open.' };
            }

            const safeTokenId = String(buyerTokenId || '').trim();
            const safeItemName = String(itemName || '').trim();
            const qty = Math.max(1, InventoryService.toIntOrNull(quantity) || 1);
            if (!safeTokenId || !safeItemName) {
                return { ok: false, message: 'Missing buyer token or item name.' };
            }

            const accessResult = R20.requireSourceTokenAccess({
                sourceTokenId: safeTokenId,
                playerId,
                isGM,
                actionLabel: 'buy items with'
            });
            const access = accessResult.access;
            if (!access.token || !access.character) {
                return { ok: false, message: 'Buyer token is not linked to a character.' };
            }
            if (!accessResult.ok) {
                return {
                    ok: false,
                    message: accessResult.message,
                    sourceAccess: access
                };
            }

            const buyerIdentities = [
                playerId,
                who,
                safeTokenId,
                access.tokenName,
                access.character.id,
                access.character.get('name')
            ];
            if (this.isBuyerBlacklisted(shop, buyerIdentities)) {
                return { ok: false, message: 'This buyer is blacklisted from this shop.' };
            }

            const shopItem = shop.findItem(safeItemName);
            if (!shopItem || shopItem.hidden) {
                return { ok: false, message: 'Item was not found in shop.' };
            }

            const isInfiniteStock = shopItem.isInfiniteStock && shopItem.isInfiniteStock();
            if (shop.config.hasStock && !isInfiniteStock && shopItem.stock < qty) {
                return {
                    ok: false,
                    message: 'Not enough stock for this item.',
                    available: shopItem.stock,
                    requested: qty
                };
            }

            if (Number(shopItem.price) < 0) {
                return { ok: false, message: 'This item has no fixed price yet. Ask the GM.' };
            }
            const totalPrice = Math.max(0, Math.ceil((Number(shopItem.price) || 0) * qty));
            let spendResult = { ok: true, spent: 0, currencyType: shopItem.priceType };
            if (totalPrice > 0) {
                spendResult = await CurrencyService.spendFromToken({
                    tokenId: safeTokenId,
                    currencyType: shopItem.priceType,
                    quantity: totalPrice,
                    playerId,
                    isGM
                });
                if (!spendResult.ok) return spendResult;
            }

            const addResult = await InventoryService.addInventoryItem(access.character.id, shopItem.name, qty, {
                templateId: shopItem.templateId,
                fallbackItem: shopItem.toJSON ? shopItem.toJSON() : shopItem
            });
            if (!addResult.ok) {
                if (spendResult.ok && spendResult.walletBefore) {
                    await CurrencyService.restoreWallet(access.character.id, spendResult.walletBefore);
                } else if (spendResult.ok && spendResult.spent > 0) {
                    await CurrencyService.creditCharacter({
                        characterId: access.character.id,
                        currencyType: spendResult.currencyType,
                        quantity: spendResult.spent
                    });
                }
                return addResult;
            }

            if (shop.config.hasStock && !isInfiniteStock) {
                shopItem.stock = Math.max(0, shopItem.stock - qty);
            }
            shop.recordSale({
                itemName: shopItem.name,
                quantity: qty,
                currencyType: shopItem.priceType,
                amount: totalPrice
            });
            const saveResult = ShopRepository.save(shop);
            if (!saveResult.ok) return saveResult;

            return {
                ok: true,
                shop,
                item: shopItem,
                buyerTokenId: safeTokenId,
                buyerName: access.tokenName,
                buyerCharacterId: access.character.id,
                itemName: shopItem.name,
                quantity: qty,
                totalPrice,
                currencyType: shopItem.priceType,
                remainingStock: shopItem.stock,
                addResult,
                spendResult
            };
        }
    };

    /** -----------------------------------------------------------------------
     * @section Renderers
     * --------------------------------------------------------------------- */
    const Render = {
        getMessageCardStyle(type = 'normal') {
            const bgColorByType = {
                normal: {titleColor: 'rgb(200, 200, 200)', borderColor: CONFIG.DEFAULT_CARD_BORDER_COLOR},
                warning: {titleColor: 'rgb(175, 175, 0)', borderColor: 'rgb(127, 127, 0)'},
                failure: {titleColor: 'rgb(175, 0, 0)', borderColor: 'rgb(127, 0, 0)'},
                success: {titleColor: 'rgb(0, 175, 0)', borderColor: 'rgb(0, 127, 0)'}
            };

            const resolvedType = String(type || 'normal').toLowerCase();
            return bgColorByType[resolvedType] || bgColorByType.normal;
        },

        sendWhisperMessage(target, title = '', body = '', type = 'normal') {
            const cardStyle = this.getMessageCardStyle(type);

            const safeTarget = String(target || '').trim();
            const safeTitle = String(title || '');
            const safeBody = String(body || '');

            if (!safeTarget) {
                Logger.error('sendWhisperMessage requires a valid target.');
                return;
            }

            R20.whisper(
                safeTarget,
                Html.card({
                    title: safeTitle,
                    body: '<div style="font-size:14px;margin:0;">' + safeBody + '</div>',
                    buildOptions: {
                        titleColor: cardStyle.titleColor,
                        borderColor: cardStyle.borderColor
                    }
                })
            );
        },

        sendPublicMessage(title = '', body = '', type = 'normal') {
            const cardStyle = this.getMessageCardStyle(type);

            R20.send(
                Html.card({
                    title: String(title || ''),
                    body: '<div style="font-size:14px;margin:0;">' + String(body || '') + '</div>',
                    buildOptions: {
                        titleColor: cardStyle.titleColor,
                        borderColor: cardStyle.borderColor
                    }
                })
            );
        },

        getCurrencyColor(currencyType = '') {
            const coinType = InventoryService.normalizeCurrencyType(currencyType);
            return CURRENCY_COLORS[coinType] || (CONFIG.DEFAULT_TEXT_ITEM_COLOR || 'rgb(84, 186, 255)');
        },

        currencyAmountHtml(amount = 0, currencyType = '') {
            const coinType = InventoryService.normalizeCurrencyType(currencyType) || CONFIG.CURRENCY_FALLBACK;
            const text = Utils.escapeHtml(String(amount)) + ' ' + Utils.escapeHtml(coinType);
            return Html.span(text, 'color:' + this.getCurrencyColor(coinType) + ';font-weight:700;');
        },

        buildUseRollTooltip(rollData = {}) {
            const rolls = Array.isArray(rollData.rolls) ? rollData.rolls : [];
            if (!rolls.length) return '';

            const sides = Math.max(1, Utils.toInt(rollData.sides, 1));
            const bonus = Number(rollData.bonus) || 0;

            const diceHtml = rolls.map((value) => {
                const die = Utils.toInt(value, 0);
                let color = '#f2f2f2';
                if (die === 1) color = 'rgb(220, 60, 60)';
                else if (die === sides) color = 'rgb(60, 190, 90)';
                return '<span style=\'color:' + color + ';font-weight:700;\'>' + Utils.escapeHtml(String(die)) + '</span>';
            }).join(' <span style=\'color:#9ba9b7;\'>+</span> ');

            let expression = '(' + diceHtml + ')';
            if (bonus > 0) {
                expression += ' <span style=\'color:#9ba9b7;\'>+</span> <span style=\'color:#8ec5ff;font-weight:700;\'>' + Utils.escapeHtml(String(bonus)) + '</span>';
            } else if (bonus < 0) {
                expression += ' <span style=\'color:#9ba9b7;\'>-</span> <span style=\'color:#8ec5ff;font-weight:700;\'>' + Utils.escapeHtml(String(Math.abs(bonus))) + '</span>';
            }
            return expression;
        },

        buildInventoryWalletRow(payload = {}) {
            const cp = Math.max(0, Utils.toInt(payload.cp, 0));
            const sp = Math.max(0, Utils.toInt(payload.sp, 0));
            const gp = Math.max(0, Utils.toInt(payload.gp, 0));
            const sourceTokenId = String(payload.sourceTokenId || '').trim();

            const coinUrl = 'https://static.vecteezy.com/system/resources/thumbnails/009/342/607/small/shiny-coins-clipart-design-illustration-free-png.png';
            const coin = (value, overlayColor = 'rgba(255,255,255,0)', valueColor = '#f2f2f2') => {
                return (
                    '<span style="display:inline-flex;align-items:center;gap:4px;margin-left:8px;">' +
                        '<span style="' +
                            'display:inline-block;' +
                            'width:12px;height:12px;' +
                            'vertical-align:middle;' +
                            'border-radius:50%;' +
                            'background-image:linear-gradient(' + overlayColor + ',' + overlayColor + '), url(\'' + Utils.attrSafe(coinUrl) + '\');' +
                            'background-blend-mode:multiply;' +
                            'background-size:cover;' +
                            'background-position:center;' +
                            'background-repeat:no-repeat;' +
                            'box-shadow:inset 0 0 0 1px rgba(255,255,255,0.2);' +
                        '"></span>' +
                        '<span style="font-size:12px;font-weight:700;line-height:1;color:' + valueColor + ';"> ' + Utils.escapeHtml(String(value)) + '</span>' +
                    '</span>'
                );
            };

            const cpIcon = coin(cp, 'rgba(185, 115, 50, 0.53)', 'rgb(185, 115, 50)');
            const spIcon = coin(sp, 'rgba(182, 182, 182, 0.67)', 'rgb(182, 182, 182)');
            const gpIcon = coin(gp, 'rgba(232, 197, 58, 0.5)', 'rgb(232, 197, 58)');
            const giveButton = sourceTokenId
                ? this.inRowButtonHtml({
                    text: 'GIVE',
                    textColor: 'rgb(255,255,255)',
                    backgroundColor: 'rgba(0, 86, 115, 0.9)',
                    borderColor: 'rgb(255,255,255)',
                    width: 32,
                    height: 15,
                    callback:
                        '!tntCurrency give ' +
                        sourceTokenId +
                        ' &#64;{target|token_id} &#63;{Coin|cp|sp|gp} &#63;{Qty|1}'
                })
                : '';

            return (
                '<table style="width:100%;border-collapse:collapse;table-layout:auto;margin:0 0 2px 0;">' +
                    '<tr>' +
                        '<td style="padding:0;text-align:left;vertical-align:middle;">' +
                            '<div style="display:flex;align-items:center;gap:6px;width:100%;height:18px;">' +
                                '<span style="font-size:13px;font-weight:700;line-height:18px;color:rgb(210, 210, 210);"><b>Wallet:</b></span>' +
                                '<span style="display:inline-flex;align-items:center;justify-content:flex-end;white-space:nowrap;margin-left:auto;">' +
                                    cpIcon + spIcon + gpIcon +
                                '</span>' +
                            '</div>' +
                        '</td>' +
                        '<td style="padding:0 0 0 4px;text-align:right;vertical-align:middle;white-space:nowrap;width:0px;">' +
                            '<div style="display:flex;align-items:center;justify-content:flex-end;height:18px;">' +
                                (giveButton || '') +
                            '</div>' +
                        '</td>' +
                    '</tr>' +
                '</table>' +
                '<div style="height:8px;"></div>'
            );
        },

        buildInventoryGiveNarrative(audience = 'gm', payload = {}) {
            const mode = String(audience || 'gm').trim().toLowerCase();
            const sourceName = Utils.escapeHtml(String(payload.sourceName || 'Source'));
            const targetName = Utils.escapeHtml(String(payload.targetName || 'Target'));
            const qtyText = Utils.escapeHtml(String(payload.qty || 0));
            const itemName = Utils.escapeHtml(String(payload.itemName || 'Item'));

            const characterColor = CONFIG.DEFAULT_TEXT_CHARACTER_COLOR || 'rgb(211, 194, 12)';
            const qtyColor = CONFIG.DEFAULT_TEXT_QUANTITY_COLOR || 'rgb(52, 203, 116)';
            const itemColor = CONFIG.DEFAULT_TEXT_ITEM_COLOR || 'rgb(84, 186, 255)';

            const sourceHtml = Html.span(sourceName, 'color:' + characterColor + ';font-weight:700;');
            const targetHtml = Html.span(targetName, 'color:' + characterColor + ';font-weight:700;');
            const qtyHtml = Html.span(qtyText, 'color:' + qtyColor + ';font-weight:700;');
            const itemHtml = Html.span(itemName, 'color:' + itemColor + ';font-weight:700;');

            if (mode === 'source') {
                return (
                    '<span style="display:block;text-align:center;">' +
                        'You gave ' + qtyHtml + ' ' + itemHtml + ' to ' + targetHtml +
                    '</span>'
                );
            }

            if (mode === 'target') {
                return (
                    '<span style="display:block;text-align:center;">' +
                        sourceHtml + ' gave you ' + qtyHtml + ' ' + itemHtml +
                    '</span>'
                );
            }

            return (
                '<span style="display:block;text-align:center;">' +
                    sourceHtml + ' gave ' + qtyHtml + ' ' + itemHtml + ' to ' + targetHtml +
                '</span>'
            );
        },

        buildInventoryUseNarrative(payload = {}) {
            const sourceName = Utils.escapeHtml(String(payload.sourceName || 'Source'));
            const targetName = Utils.escapeHtml(String(payload.targetName || 'Target'));
            const qtyText = Utils.escapeHtml(String(payload.qty || 1));
            const itemName = Utils.escapeHtml(String(payload.itemName || 'Item'));

            const characterColor = CONFIG.DEFAULT_TEXT_CHARACTER_COLOR || 'rgb(211, 194, 12)';
            const qtyColor = CONFIG.DEFAULT_TEXT_QUANTITY_COLOR || 'rgb(52, 203, 116)';
            const itemColor = CONFIG.DEFAULT_TEXT_ITEM_COLOR || 'rgb(84, 186, 255)';
            const healColor = CONFIG.DEFAULT_TEXT_HEAL_COLOR || 'rgb(52, 203, 116)';
            const appliedColor = CONFIG.DEFAULT_TEXT_APPLIED_COLOR || 'rgb(84, 186, 255)';

            const sourceHtml = '<b>' + Html.span(sourceName, 'color:' + characterColor + ';font-weight:700;') + '</b>';
            const targetHtml = '<b>' + Html.span(targetName, 'color:' + characterColor + ';font-weight:700;') + '</b>';
            const qtyHtml = Html.span(qtyText, 'color:' + qtyColor + ';font-weight:700;');
            const itemHtml = '<b>' + Html.span(itemName, 'color:' + itemColor + ';font-weight:700;') + '</b>';

            const isSelf = !!payload.isSelf;
            const narrativeType = String(payload.narrativeType || '').trim().toLowerCase();
            const isAmmo = narrativeType === 'ammo';
            const targetPhrase = isAmmo
                ? ''
                : (isSelf ? ' on <b>itself</b>' : (' on ' + targetHtml));

            const rollData = payload.rollData || {};
            const hasRoll = Array.isArray(rollData.rolls) && rollData.rolls.length > 0;
            const rollValue = Utils.escapeHtml(String(
                payload.narrativeValue !== undefined && payload.narrativeValue !== null && String(payload.narrativeValue).trim() !== ''
                    ? payload.narrativeValue
                    : (rollData.total || '')
            ));
            const rollFormulaText = (() => {
                const count = Math.max(0, Utils.toInt(rollData.count, 0));
                const sides = Math.max(0, Utils.toInt(rollData.sides, 0));
                const bonus = Number(rollData.bonus) || 0;
                if (!(count > 0 && sides > 0)) return rollValue;
                let formula = String(count) + 'd' + String(sides);
                if (bonus > 0) formula += '+' + String(bonus);
                else if (bonus < 0) formula += String(bonus);
                return Utils.escapeHtml(formula);
            })();

            let sentence = '';
            if (isAmmo) {
                sentence = sourceHtml + ' used ' + qtyHtml + ' ' + itemHtml + '.';
            } else if (narrativeType === 'heal') {
                sentence =
                    sourceHtml +
                    ' used ' + qtyHtml + ' ' + itemHtml + targetPhrase +
                    '. Heal: ' + Html.span(rollFormulaText, 'color:' + healColor + ';font-weight:700;') + '.';
            } else {
                const effectValue = Utils.escapeHtml(String(payload.narrativeValue || payload.effect || 'an effect'));
                const effectTip = String(payload.itemDescription || payload.description || '')
                    .replace(/[\r\n]+/g, ' ')
                    .trim();
                const effectHtmlBase = Html.span(effectValue, 'color:' + appliedColor + ';font-weight:700;');
                const effectHtml = effectTip ? Html.tooltip(effectHtmlBase, effectTip) : effectHtmlBase;
                sentence =
                    sourceHtml +
                    ' used ' + qtyHtml + ' ' + itemHtml + targetPhrase +
                    '. Effect: ' + effectHtml + '.';
            }

            if (!hasRoll) {
                return '<div style="display:block;text-align:center;">' + sentence + '</div>';
            }

            const rollBoxBase =
                '<div style="' +
                    'display:inline-block;' +
                    'width:40px;height:40px;' +
                    'line-height:40px;' +
                    'text-align:center;' +
                    'font-size:20px;' +
                    'color:#f2f2f2;' +
                    'background:rgb(31,31,31);' +
                    'border:1px solid #6f7a86;' +
                    'border-radius:4px;' +
                    'box-shadow:inset 0 1px 0 rgba(255,255,255,0.1);' +
                '">' + rollValue + '</div>';

            const rollTooltip = this.buildUseRollTooltip(rollData);
            const rollBox = rollTooltip ? Html.tooltip(rollBoxBase, rollTooltip) : rollBoxBase;

            return (
                '<table style="width:100%;border-collapse:collapse;">' +
                    '<tr>' +
                        '<td style="text-align:left;vertical-align:middle;padding-right:8px;">' + sentence + '</td>' +
                        '<td style="width:72px;text-align:right;vertical-align:middle;">' + rollBox + '</td>' +
                    '</tr>' +
                '</table>'
            );
        },

        inRowButtonHtml(buildOptions = {}, extraData = {}) {
            const options = buildOptions || {};

            const text = String(options.text || 'BTN');
            const textColor = String(options.textColor || '#f2f2f2');
            const backgroundColor = String(options.backgroundColor || 'rgba(0,0,0,0.6)');
            const borderColor = String(options.borderColor || 'rgba(255,255,255,0.35)');

            const imageUrl = String(
                options.imageUrl ||
                options.imageURL ||
                options.imgUrl ||
                options.backgroundImage ||
                ''
            ).trim();

            const hasImage = imageUrl !== '' && imageUrl !== '0' && imageUrl.toLowerCase() !== 'none';

            const toCssSize = (value, fallback) => {
                if (value === undefined || value === null || value === '') return fallback;

                if (typeof value === 'number') {
                    return String(Math.max(0, value)) + 'px';
                }

                const textValue = String(value).trim();
                if (!textValue) return fallback;

                if (/^\d+(\.\d+)?$/.test(textValue)) {
                    return textValue + 'px';
                }

                return textValue;
            };

            const width = toCssSize(options.width, '22px');
            const height = toCssSize(options.height, '22px');

            const fontSize = toCssSize(options.fontSize, '10px');
            const fontWeight = options.bold === false
                ? '400'
                : String(options.fontWeight || '900');

            let command = String(options.command || '').trim();

            if (typeof options.callback === 'function') {
                try {
                    command = String(options.callback(options, extraData) || '').trim();
                } catch (error) {
                    Logger.error(
                        'inRowButtonHtml callback error: ' +
                        (error && error.message ? error.message : String(error))
                    );
                }
            } else if (options.callback !== undefined && options.callback !== null) {
                command = String(options.callback).trim();
            }

            if (!command) command = '#';

            const styleObject = {
                display: 'inline-block',
                width: width,
                height: height,
                'min-width': width,
                padding: '0',
                margin: String(options.margin || '0 1px'),
                color: textColor,
                'font-size': fontSize,
                'font-weight': fontWeight,
                'line-height': height,
                'text-decoration': 'none',
                'text-transform': options.uppercase === false ? 'none' : 'uppercase',
                'white-space': 'nowrap',
                'text-align': 'center',
                border: '1px solid ' + borderColor,
                'border-radius': String(options.borderRadius || '4px'),
                'box-sizing': 'border-box',
                cursor: 'pointer',
                overflow: 'hidden'
            };

            if (hasImage) {
                styleObject['background-color'] = 'transparent';
                styleObject['background-image'] = "url('" + imageUrl.replace(/'/g, "\\'") + "')";
                styleObject['background-size'] = String(options.backgroundSize || 'cover');
                styleObject['background-position'] = String(options.backgroundPosition || 'center center');
                styleObject['background-repeat'] = 'no-repeat';
                styleObject['text-shadow'] = String(options.textShadow || '0 0 2px rgba(0,0,0,0.9)');
            } else {
                styleObject['background-color'] = backgroundColor;
            }

            const style = Utils.joinStyles(styleObject);

            const buttonHtml = Html.button({
                text: text,
                command: command,
                style: style
            });
            return Utils.isNonEmptyString(options.tooltip)
                ? Html.tooltip(buttonHtml, Utils.escapeHtml(options.tooltip))
                : buttonHtml;
        },

        itemRowUseButton(item, sourceId) {
            const safeItem = item || {};
            const qty = Math.max(0, Utils.toInt(safeItem.quantity, 0));

            const isUsable = Utils.toBoolean(safeItem.usable, false);
            if (!isUsable) return '';

            const isConsumable = Utils.toBoolean(safeItem.consumable, false);
            if (isConsumable && qty <= 0) return '';
            const safeSourceId = String(sourceId || '').trim();
            const safeItemName = String(safeItem.name || safeItem.recordName || '').trim();
            if (!safeSourceId || !safeItemName) return '';
            const useTarget = Utils.toBoolean(safeItem.useTarget, true);
            const targetArg = useTarget ? ' &#64;{target|token_id}' : (' ' + safeSourceId);

            return this.inRowButtonHtml({
                text: 'U',
                textColor: 'rgb(255,255,255)',
                backgroundColor: 'rgba(10, 122, 0, 0.9)',
                borderColor:'rgb(255,255,255)',
                width: 16,
                height: 15,
                tooltip: 'Use Item',
                callback:
                    '!tntInventory use ' +
                    safeSourceId +
                    targetArg +
                    ' ' +
                    safeItemName
            });
        },

        itemRowGiveButton(item, sourceId) {
            const safeItem = item || {};
            const qty = Math.max(0, Utils.toInt(safeItem.quantity, 0));
            if (qty <= 0) return '';

            const safeSourceId = String(sourceId || '').trim();
            const safeItemName = String(safeItem.name || safeItem.recordName || '').trim();

            if (!safeSourceId || !safeItemName) return '';

            return this.inRowButtonHtml({
                text: 'G',
                textColor: 'rgb(255,255,255)',
                backgroundColor: 'rgba(0, 86, 115, 0.9)',
                borderColor: 'rgb(255,255,255)',
                width: 16,
                height: 15,
                tooltip: 'Give, Target should be within 5 ft range',
                callback:
                    '!tntInventory give ' +
                    safeSourceId +
                    ' &#64;{target|token_id}' +
                    ' ' +
                    safeItemName +
                    ' &#63;{Qty|1}'
            });
        },

        itemRowDiscardButton(item, sourceId) {
            const safeItem = item || {};
            const qty = Math.max(0, Utils.toInt(safeItem.quantity, 0));
            if (qty <= 0) return '';

            const safeSourceId = String(sourceId || '').trim();
            const safeItemName = String(safeItem.name || safeItem.recordName || '').trim();
            if (!safeSourceId || !safeItemName) return '';

            const qtyArg = qty > 1 ? ' &#63;{Qty|1}' : ' 1';
            return this.inRowButtonHtml({
                text: 'D',
                textColor: 'rgb(255,255,255)',
                backgroundColor: 'rgba(150, 20, 20, 0.92)',
                borderColor: 'rgb(255,255,255)',
                width: 16,
                height: 15,
                tooltip: 'Discard Item from inventory',
                callback:
                    '!tntInventory discard ' +
                    safeSourceId +
                    ' ' +
                    safeItemName +
                    qtyArg
            });
        },

        formatAttackBonus(value = '') {
            const raw = String(value === undefined || value === null ? '' : value).trim();
            if (!raw) return '';
            const firstNumber = raw.match(/[+-]?\d+/);
            if (!firstNumber) return raw;
            const bonus = Utils.toInt(firstNumber[0], 0);
            return bonus >= 0 ? ('+' + String(bonus)) : String(bonus);
        },

        formatAttackDamage(attack = {}) {
            const safeAttack = attack || {};
            const dmgBase = String(safeAttack.dmgBase || safeAttack.damageBase || safeAttack.damage || '').trim();
            const dmgModRaw = String(safeAttack.dmgMod || safeAttack.damageMod || '').trim();
            const dmgMod = this.formatAttackBonus(dmgModRaw);
            if (!dmgBase && !dmgMod) return '';
            if (!dmgBase) return this.compactDamageText(dmgMod);
            if (!dmgMod || dmgMod === '+0') return this.compactDamageText(dmgBase);
            return this.compactDamageText(dmgBase + (dmgMod.charAt(0) === '-' ? '-' + dmgMod.slice(1) : '+' + dmgMod.replace(/^\+/, '')));
        },

        compactDamageText(value = '') {
            return String(value || '').trim().replace(/\s*([+-])\s*/g, '$1');
        },

        tokenAttackDamageHtml(attack = {}) {
            const damageText = this.formatAttackDamage(attack);
            if (!damageText) return '';

            const damageType = String(attack.dmgType || attack.damageType || '').trim();
            const damageHtml = '<span style="margin-left:5px;color:rgb(215,47,47);font-weight:700;">' +
                Utils.escapeHtml(damageText) +
                '</span>';

            return damageType ? Html.tooltip(damageHtml, Utils.escapeHtml(damageType)) : damageHtml;
        },

        tokenAttackBaseDamageHtml(attack = {}) {
            const safeAttack = attack || {};
            const dmgBase = String(safeAttack.dmgBase || safeAttack.damageBase || safeAttack.damage || '').trim();
            if (!dmgBase) return '';

            const damageType = String(safeAttack.dmgType || safeAttack.damageType || '').trim();
            const damageHtml = '<span style="margin-left:5px;color:rgb(215,47,47);font-weight:700;">' +
                Utils.escapeHtml(dmgBase) +
                '</span>';

            return damageType ? Html.tooltip(damageHtml, Utils.escapeHtml(damageType)) : damageHtml;
        },

        isPositiveFlag(value = '') {
            const raw = String(value || '').trim().toLowerCase();
            if (!raw) return false;
            if (['1', 'true', 'yes', 'y', 'on'].includes(raw)) return true;
            return Utils.toInt(raw, 0) > 0;
        },

        formatSaveAttributeButtonText(attack = {}) {
            const safeAttack = attack || {};
            const saveFlag = safeAttack.saveFlag || safeAttack.saveflag || safeAttack.save_flag || '';
            if (!this.isPositiveFlag(saveFlag)) return '';

            const saveAttr = String(safeAttack.saveAttr || safeAttack.saveattr || safeAttack.save_attr || '').trim();
            if (!saveAttr) return 'SAVE';
            return saveAttr.slice(0, 3).toUpperCase();
        },

        tokenAttackDamageButton(attack = {}, characterId = '') {
            const safeAttack = attack || {};
            const safeCharacterId = String(characterId || '').trim();
            const safeAttackId = String(safeAttack.attackId || safeAttack.id || '')
                .trim()
                .replace(/"/g, '')
                .replace(/[^A-Za-z0-9_-]/g, '');
            const damageText = this.formatAttackDamage(safeAttack);
            const damageType = String(safeAttack.dmgType || safeAttack.damageType || '').trim();
            if (!safeCharacterId || !safeAttackId || !damageText) return '';

            return this.inRowButtonHtml({
                text: damageText,
                textColor: 'rgb(255,255,255)',
                backgroundColor: 'rgba(120, 40, 40, 0.95)',
                borderColor: 'rgb(255,255,255)',
                width: 46,
                height: 15,
                fontSize: 12,
                uppercase: false,
                tooltip: 'Roll ' + damageType + ' Damage.',
                callback: '~' + safeCharacterId + '|repeating_attack("' + safeAttackId + '", "attack", "dmg")'
            });
        },

        cleanRepeatingActionId(value = '') {
            return String(value || '')
                .trim()
                .replace(/"/g, '')
                .replace(/[^A-Za-z0-9_-]/g, '');
        },

        tokenActionButton({
            text = 'Run',
            command = '',
            tooltip = '',
            backgroundColor = 'rgba(150,20,20,0.92)',
            width = 30
        } = {}) {
            if (!String(command || '').trim()) return '';
            return this.inRowButtonHtml({
                text,
                textColor: 'rgb(255,255,255)',
                backgroundColor,
                borderColor: 'rgb(255,255,255)',
                width,
                height: 15,
                fontSize: 9,
                uppercase: false,
                tooltip,
                callback: command
            });
        },

        tokenAttackButton(attack = {}, characterId = '') {
            const safeAttack = attack || {};
            const safeCharacterId = String(characterId || '').trim();
            const safeAttackId = String(safeAttack.attackId || safeAttack.id || '')
                .trim()
                .replace(/"/g, '')
                .replace(/[^A-Za-z0-9_-]/g, '');
            const attackBonus = String(safeAttack.attackBonus || safeAttack.atkBonus || '').trim();
            const saveAttr = this.formatSaveAttributeButtonText(safeAttack);
            const saveDc = String(safeAttack.saveDc || safeAttack.savedc || safeAttack.save_dc || '').trim();
            const buttonText = saveAttr
                ? (saveAttr + (saveDc ? ' ' + saveDc : ''))
                : ((attackBonus ? this.formatAttackBonus(attackBonus) : '+0') + ' ATK');

            if (!safeCharacterId || !safeAttackId) return '';
            const isAttack = String(buttonText || '').includes('ATK');

            return this.inRowButtonHtml({
                text: buttonText,
                textColor: 'rgb(255,255,255)',
                backgroundColor: isAttack ? 'rgba(45,45,45,0.95)' : 'rgba(77, 83, 7, 0.95)' ,
                borderColor: 'rgb(255,255,255)',
                width: 46,
                height: 15,
                fontSize: 12,
                uppercase: true,
                tooltip: isAttack ? 'Attack Roll' : 'Saving Throw',
                callback: '~' + safeCharacterId + '|repeating_attack_' + safeAttackId + '_attack'
            });
        },

        tokenAttackRefreshButton(tokenRef = '') {
            const safeTokenRef = String(tokenRef || '').trim();
            if (!safeTokenRef) return '';

            return this.inRowButtonHtml({
                text: 'Refresh',
                textColor: 'rgb(255,255,255)',
                backgroundColor: 'rgba(45,45,45,0.95)',
                borderColor: 'rgb(255,255,255)',
                width: 54,
                height: 15,
                fontSize: 12,
                uppercase: false,
                tooltip: 'Refresh attack list',
                callback: '!tntToken refreshattacks ' + safeTokenRef
            });
        },

        tokenSpellRefreshButton(tokenRef = '') {
            const safeTokenRef = String(tokenRef || '').trim();
            if (!safeTokenRef) return '';

            return this.inRowButtonHtml({
                text: 'Refresh',
                textColor: 'rgb(255,255,255)',
                backgroundColor: 'rgba(110,45,160,0.95)',
                borderColor: 'rgb(255,255,255)',
                width: 54,
                height: 15,
                fontSize: 12,
                uppercase: false,
                tooltip: 'Refresh spell list',
                callback: '!tntToken refreshspells ' + safeTokenRef
            });
        },

        tokenSpellButton(spell = {}, options = {}) {
            const safeSpell = spell || {};
            const safeCharacterId = String(options.characterId || '').trim();
            const safeSpellId = String(safeSpell.spellId || safeSpell.id || '')
                .trim()
                .replace(/"/g, '')
                .replace(/[^A-Za-z0-9_-]/g, '');
            const spellLevelKey = TokenService.normalizeSpellLevel(safeSpell.spellLevel || safeSpell.level || '');
            const attackBonus = String(safeSpell.spellAttackBonus || '').trim();
            const saveAttr = String(safeSpell.spellSave || safeSpell.spellsave || '').trim();
            const saveDc = String(safeSpell.spellSaveDc || '').trim();
            const actionType = String(safeSpell.spellDamageType || '').trim().toLowerCase();
            const buttonText = actionType === 'spell attack'
                ? ((attackBonus ? this.formatAttackBonus(attackBonus) : '+0') + ' ATK')
                : (actionType === 'spell save'
                    ? ((saveAttr ? saveAttr.slice(0, 3).toUpperCase() : 'SAVE') + (saveDc ? ' ' + saveDc : ''))
                    : 'Cast');

            if (!safeCharacterId || !safeSpellId) return '';
            const isSaveSpell = !String(buttonText || '').includes('ATK') && String(buttonText || '').includes('Cast');

            return this.inRowButtonHtml({
                text: buttonText,
                textColor: 'rgb(255,255,255)',
                backgroundColor: isSaveSpell ? 'rgba(110,45,160,0.95)' : 'rgba(45, 51, 160, 0.95)',
                borderColor: 'rgb(255,255,255)',
                width: 46,
                height: 15,
                fontSize: 12,
                uppercase: false,
                tooltip: 'Cast spell',
                callback: '~' + safeCharacterId + '|repeating_spell-' + spellLevelKey + '("' + safeSpellId + '", "spell")'
            });
        },

        tokenSpellDamageButton(spell = {}, characterId = '') {
            const safeSpell = spell || {};
            const safeCharacterId = String(characterId || '').trim();
            const safeSpellId = String(safeSpell.spellId || safeSpell.id || '')
                .trim()
                .replace(/"/g, '')
                .replace(/[^A-Za-z0-9_-]/g, '');
            const spellLevelKey = TokenService.normalizeSpellLevel(safeSpell.spellLevel || safeSpell.level || '');
            const damageText = this.compactDamageText(safeSpell.spellDamage || safeSpell.damage || '');
            if (!safeCharacterId || !safeSpellId || !damageText) return '';

            return this.inRowButtonHtml({
                text: damageText,
                textColor: 'rgb(255,255,255)',
                backgroundColor: 'rgba(120, 40, 40, 0.95)',
                borderColor: 'rgb(255,255,255)',
                width: 46,
                height: 15,
                fontSize: 12,
                uppercase: false,
                tooltip: 'Roll spell damage.',
                callback: '~' + safeCharacterId + '|repeating_spell-' + spellLevelKey + '("' + safeSpellId + '", "spell", "dmg")'
            });
        },

        itemRowBuyButton(item, options = {}) {
            const safeItem = item || {};
            const safeShopId = String(options.shopId || '').trim();
            const buyerTokenId = String(options.buyerTokenId || '').trim();
            const safeItemName = String(safeItem.name || safeItem.recordName || '').trim();
            if (!safeShopId || !buyerTokenId || !safeItemName) return '';
            const stockValue = Math.max(0, Utils.toInt(safeItem.stock, 0));
            const isInfiniteStock = stockValue >= SHOP_INFINITE_STOCK;
            if (Utils.toBoolean(options.hasStock, true) && !isInfiniteStock && stockValue <= 0) return '';

            return this.inRowButtonHtml({
                text: String(options.priceText || 'BUY').trim(),
                textColor: 'rgb(255,255,255)',
                backgroundColor: 'rgba(115, 72, 0, 0.92)',
                borderColor: 'rgb(255,255,255)',
                width: 30,
                height: 15,
                tooltip: options.tooltip,
                callback:
                    '!tntShop buy ' +
                    safeShopId +
                    ' ' +
                    buyerTokenId +
                    ' ' +
                    safeItemName +
                    ' &#63;{Qty|1}'
            });
        },

        shopStatusButton(shop = {}, options = {}) {
            const safeShop = shop || {};
            const isOpen = Utils.isFunction(safeShop.isOpen)
                ? safeShop.isOpen()
                : String(safeShop.state || '').toLowerCase() === 'open';
            return this.inRowButtonHtml({
                text: isOpen ? 'Open' : 'Close',
                textColor: 'rgb(255,255,255)',
                backgroundColor: isOpen ? 'rgba(10,122,0,0.92)' : 'rgba(150,20,20,0.92)',
                borderColor: 'rgba(255,255,255,0.55)',
                width: options.width || 40,
                height: options.height || 15,
                fontSize: options.fontSize || 12,
                uppercase: false,
                tooltip: isOpen ? 'Press to close' : 'Press to open',
                callback: '!tntShop toggle ' + String(safeShop.id || '') + (options.returnTo === 'detail' ? ' detail' : '')
            });
        },

        shopHiddenButton(shop = {}, options = {}) {
            const safeShop = shop || {};
            const isHidden = Utils.isFunction(safeShop.isHidden)
                ? safeShop.isHidden()
                : Utils.toBoolean(safeShop.hidden, String(safeShop.state || '').toLowerCase() === 'hidden');
            return this.inRowButtonHtml({
                text: isHidden ? 'Hidden' : 'Reveal',
                textColor: 'rgb(255,255,255)',
                backgroundColor: isHidden ? 'rgba(100,45,150,0.95)' : 'rgba(95,95,95,0.9)',
                borderColor: 'rgba(255,255,255,0.55)',
                width: options.width || 40,
                height: options.height || 15,
                fontSize: options.fontSize || 12,
                uppercase: false,
                tooltip: isHidden ? 'Press to reveal' : 'Press to hide',
                callback: '!tntShop reveal ' + String(safeShop.id || '') +
                    (options.returnTo === 'menu' ? ' menu' : (options.returnTo === 'detail' ? ' detail' : ''))
            });
        },

        shopStockModeButton(shop = {}, options = {}) {
            const hasStock = Utils.toBoolean(shop && shop.config && shop.config.hasStock, true);
            return this.inRowButtonHtml({
                text: hasStock ? 'Stock' : 'Unlimited',
                textColor: 'rgb(255,255,255)',
                backgroundColor: hasStock ? 'rgba(0,86,115,0.95)' : 'rgba(90,90,90,0.9)',
                borderColor: 'rgba(255,255,255,0.55)',
                width: options.width || 40,
                height: options.height || 15,
                fontSize: options.fontSize || 12,
                uppercase: false,
                tooltip: hasStock ? 'Press to use unlimited stock mode' : 'Press to use item stock',
                callback: '!tntShop stockmode ' + String(shop.id || '')
            });
        },

        shopRollPriceButton(shop = {}, options = {}) {
            return this.inRowButtonHtml({
                text: 'R. Price',
                textColor: 'rgb(255,255,255)',
                backgroundColor: 'rgba(115,72,0,0.95)',
                borderColor: 'rgba(255,255,255,0.55)',
                width: options.width || 40,
                height: options.height || 15,
                fontSize: options.fontSize || 10,
                uppercase: false,
                tooltip: 'Press to clear item prices, then set custom values',
                callback: '!tntShop rollprice ' + String(shop.id || '')
            });
        },

        shopExportButton(shop = {}, options = {}) {
            return this.inRowButtonHtml({
                text: 'Export',
                textColor: 'rgb(255,255,255)',
                backgroundColor: 'rgba(35,105,80,0.95)',
                borderColor: 'rgba(255,255,255,0.55)',
                width: options.width || 40,
                height: options.height || 15,
                fontSize: options.fontSize || 10,
                uppercase: false,
                tooltip: 'Export this shop to the shop handout',
                callback: '!tntShop export ' + String(shop.id || '') + ' detail'
            });
        },

        shopLoadButton(shop = {}, options = {}) {
            return this.inRowButtonHtml({
                text: 'Load',
                textColor: 'rgb(255,255,255)',
                backgroundColor: 'rgba(85,70,150,0.95)',
                borderColor: 'rgba(255,255,255,0.55)',
                width: options.width || 40,
                height: options.height || 15,
                fontSize: options.fontSize || 11,
                uppercase: false,
                tooltip: 'Load this shop from the shop handout',
                callback: '!tntShop load ' + String(shop.id || '') + ' true detail'
            });
        },

        buildShopSalesTooltip(shop = {}) {
            const ledger = Array.isArray(shop.salesLedger) ? shop.salesLedger : [];
            if (!ledger.length) return 'No items sold yet.';
            return ledger.map((entry) => {
                return Utils.escapeHtml(String(entry.name || 'Item')) + ': ' + Utils.escapeHtml(String(Math.max(0, Utils.toInt(entry.quantity, 0))));
            }).join('<br>');
        },

        buildShopEarningsTooltip(shop = {}) {
            const earnings = Shop.normalizeEarnings(shop.earnings || {});
            return Utils.escapeHtml(String(earnings.cp)) + ' cp, ' +
                Utils.escapeHtml(String(earnings.sp)) + ' sp, ' +
                Utils.escapeHtml(String(earnings.gp)) + ' gp';
        },

        buildShopBlacklistTooltip(shop = {}) {
            const entries = Array.isArray(shop.blacklist) ? shop.blacklist : [];
            if (!entries.length) return 'No blocked characters.';
            return entries.map((entry) => {
                const id = String(entry || '').trim();
                const character = id ? getObj('character', id) : null;
                return Utils.escapeHtml(character ? character.get('name') : id);
            }).join('<br>');
        },

        buildShopLocationTooltip(shop = {}) {
            const entries = Array.isArray(shop.location) ? shop.location : [];
            if (!entries.length) return 'Everywhere';
            return entries.map((entry) => {
                const id = String(entry || '').trim();
                const page = id ? getObj('page', id) : null;
                return Utils.escapeHtml(page ? page.get('name') : id);
            }).join('<br>');
        },

        shopMenuRow(shop = {}) {
            const safeShop = shop || {};
            const removeButton = this.inRowButtonHtml({
                text: 'X',
                textColor: 'rgb(255,255,255)',
                backgroundColor: 'rgba(150,20,20,0.95)',
                borderColor: 'rgba(255,255,255,0.55)',
                width: 16,
                height: 15,
                fontSize: 11,
                uppercase: false,
                tooltip: 'Remove Store',
                callback: '!tntShop delete ' + String(safeShop.id || '') + ' &#63;{Remove Store?|no|yes}'
            });
            const menuButton = this.inRowButtonHtml({
                text: 'Menu',
                textColor: 'rgb(255,255,255)',
                backgroundColor: 'rgba(0,86,180,0.95)',
                borderColor: 'rgba(255,255,255,0.55)',
                width: 34,
                height: 15,
                fontSize: 12,
                uppercase: false,
                callback: '!tntShop detail ' + String(safeShop.id || '')
            });
            return (
                '<tr style="height:24px;">' +
                    '<td style="padding:4px 4px 0px 0px;width:20px;text-align:left;vertical-align:middle;white-space:nowrap;">' +
                        removeButton +
                    '</td>' +
                    '<td style="padding:0px 4px 0px 0px;text-align:left;vertical-align:middle;">' +
                        '<div style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">' +
                            '<b>' + Utils.escapeHtml(String(safeShop.name || safeShop.id || 'Shop')) + '</b>' +
                        '</div>' +
                    '</td>' +
                    '<td style="padding:4px 0px 0px 0px;width:132px;text-align:right;vertical-align:middle;white-space:nowrap;">' +
                        this.shopStatusButton(safeShop, { width: 34, fontSize: 12 }) +
                        this.shopHiddenButton(safeShop, { returnTo: 'menu', width: 42, fontSize: 12 }) +
                        menuButton +
                    '</td>' +
                '</tr>'
            );
        },

        showShopAdminMenu(shops = []) {
            const rows = shops.length
                ? shops.map((shop) => this.shopMenuRow(shop)).join('')
                : '<tr><td colspan="3" style="padding:4px 0;color:rgb(160,160,160);font-size:12px;">No shops found.</td></tr>';
            const titleHtml =
                '<div style="position:relative;text-align:center;line-height:18px;">' +
                    '<span>Shop Manager</span>' +
                    '<span style="position:absolute;right:0;top:0;">' +
                        this.inRowButtonHtml({
                            text: 'Create',
                            textColor: 'rgb(255,255,255)',
                            backgroundColor: 'rgba(0,86,115,0.95)',
                            borderColor: 'rgba(255,255,255,0.55)',
                            width: 48,
                            height: 16,
                            fontSize: 11,
                            uppercase: false,
                            tooltip: 'Create Store',
                            callback: '!tntShop create &#63;{Store ID|new-shop} &#63;{Store Name|New Shop}'
                        }) +
                    '</span>' +
                '</div>';
            return Html.card({
                title: 'Shop Manager',
                body:
                    '<table style="width:100%;border-collapse:collapse;table-layout:fixed;">' +
                        '<tbody>' + rows + '</tbody>' +
                    '</table>',
                buildOptions: {
                    titleHtml
                }
            });
        },

        shopDetailItemRow(item = {}, shop = {}) {
            const safeItem = item || {};
            const imageUrl = String(safeItem.imageUrl || '').trim();
            const imageHtml = imageUrl && imageUrl !== '0'
                ? '<img src="' + Utils.attrSafe(imageUrl) + '" style="width:24px;height:24px;object-fit:cover;border-radius:4px;vertical-align:middle;margin-right:6px;" />'
                : '<span style="display:inline-block;width:24px;height:24px;vertical-align:middle;margin-right:6px;"></span>';
            const itemName = String(safeItem.name || safeItem.recordName || safeItem.abbreviation || 'Item').trim();
            const itemLabel = String(safeItem.abbreviation || safeItem.name || safeItem.recordName || 'Item').trim();
            const qualityColorByRarity = {
                common: CONFIG.DEFAULT_ITEM_COMMON_QUALITY_COLOR,
                uncommon: CONFIG.DEFAULT_ITEM_UNCOMMON_QUALITY_COLOR,
                rare: CONFIG.DEFAULT_ITEM_RARE_QUALITY_COLOR,
                very_rare: CONFIG.DEFAULT_ITEM_VERY_RARE_QUALITY_COLOR,
                legendary: CONFIG.DEFAULT_ITEM_LEGENDARY_QUALITY_COLOR,
                artifact: CONFIG.DEFAULT_ITEM_ARTIFACT_QUALITY_COLOR
            };
            const rarityKey = String(safeItem.rarity || safeItem.quality || 'common')
                .trim()
                .toLowerCase()
                .replace(/[\s-]+/g, '_');
            const qualityColor = String(
                qualityColorByRarity[rarityKey] ||
                qualityColorByRarity.common ||
                'rgb(200,200,200)'
            ).replace(/\)\)+$/g, ')');
            const description = String(safeItem.description || '').trim();
            const itemNameHtml =
                '<span style="color:' + qualityColor + ';font-weight:700;">' +
                    Utils.escapeHtml(itemLabel) +
                '</span>';
            const itemBlock = description
                ? Html.tooltip(imageHtml + '<b>' + itemNameHtml + '</b>', description)
                : imageHtml + '<b>' + itemNameHtml + '</b>';
            const priceText = Number(safeItem.price) < 0
                ? 'unpriced'
                : (String(Math.max(0, Number(safeItem.price) || 0)) + ' ' + String(safeItem.priceType || CONFIG.CURRENCY_FALLBACK).toUpperCase());
            const stockValue = Math.max(0, Utils.toInt(safeItem.stock, 0));
            const stockText = stockValue >= SHOP_INFINITE_STOCK ? 'unlimited' : String(stockValue);
            const priceButton = this.inRowButtonHtml({
                text: '$',
                textColor: 'rgb(255,255,255)',
                backgroundColor: 'rgba(115,72,0,0.95)',
                borderColor: 'rgba(255,255,255,0.55)',
                width: 20,
                height: 15,
                fontSize: 12,
                uppercase: false,
                tooltip: 'Current price: ' + priceText,
                callback: '!tntShop price ' + String(shop.id || '') + ' ' + itemName + ' &#63;{Price|-1} &#63;{Currency|gp}'
            });
            const stockButton = this.inRowButtonHtml({
                text: 'Qty',
                textColor: 'rgb(255,255,255)',
                backgroundColor: 'rgba(0,86,115,0.95)',
                borderColor: 'rgba(255,255,255,0.55)',
                width: 30,
                height: 15,
                fontSize: 12,
                uppercase: false,
                tooltip: 'Current stock: ' + stockText,
                callback: '!tntShop stock ' + String(shop.id || '') + ' ' + itemName + ' &#63;{Stock|' + stockText + '}'
            });
            const removeButton = this.inRowButtonHtml({
                text: 'X',
                textColor: 'rgb(255,255,255)',
                backgroundColor: 'rgba(150,20,20,0.92)',
                borderColor: 'rgba(255,255,255,0.55)',
                width: 20,
                height: 15,
                fontSize: 12,
                uppercase: false,
                tooltip: 'Remove this item from the shop',
                callback: '!tntShop remove ' + String(shop.id || '') + ' ' + itemName + ' --detail'
            });

            return (
                '<tr style="height:30px;">' +
                    '<td style="padding:2px 0;text-align:left;vertical-align:middle;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">' +
                        itemBlock +
                    '</td>' +
                    '<td style="padding:2px 0 2px 4px;text-align:right;vertical-align:middle;white-space:nowrap;width:116px;">' +
                        priceButton + stockButton + removeButton +
                    '</td>' +
                '</tr>'
            );
        },

        showShopDetail(shop = {}) {
            const safeShop = shop || {};
            const totalSold = Utils.isFunction(safeShop.getTotalItemsSold) ? safeShop.getTotalItemsSold() : 0;
            const gpFloor = Utils.isFunction(safeShop.getEarningsGpFloor) ? safeShop.getEarningsGpFloor() : 0;
            const salesHtml = Html.tooltip(
                '<span style="font-weight:700;color:rgb(220,220,220);">Items Sold: ' + Utils.escapeHtml(String(totalSold)) + '</span>',
                this.buildShopSalesTooltip(safeShop)
            );
            const earningsHtml = Html.tooltip(
                '<span style="font-weight:700;color:rgb(232,197,58);">Earnings: ' + Utils.escapeHtml(String(gpFloor)) + ' gp</span>',
                this.buildShopEarningsTooltip(safeShop)
            );
            const blacklistCount = Array.isArray(safeShop.blacklist) ? safeShop.blacklist.length : 0;
            const locationCount = Array.isArray(safeShop.location) ? safeShop.location.length : 0;
            const blacklistHtml = Html.tooltip(
                '<span style="font-weight:700;color:rgb(220,220,220);">Blacklist [' + Utils.escapeHtml(String(blacklistCount)) + ']</span>',
                this.buildShopBlacklistTooltip(safeShop)
            );
            const locationHtml = Html.tooltip(
                '<span style="font-weight:700;color:rgb(220,220,220);">Locations [' + Utils.escapeHtml(String(locationCount)) + '] ' + '</span>',
                this.buildShopLocationTooltip(safeShop)
            );
            const itemListCount = Array.isArray(safeShop.itemList) ? safeShop.itemList.length : 0;
            const itemListHtml = '<span style="font-weight:700;color:rgb(220,220,220);">Item List [' + Utils.escapeHtml(String(itemListCount)) + ']</span>';
            const disabledButtonStyle = {
                textColor: 'rgb(190,190,190)',
                backgroundColor: 'rgba(70,70,70,0.8)',
                borderColor: 'rgba(255,255,255,0.25)',
                width: 30,
                height: 15,
                fontSize: 10,
                uppercase: false,
                tooltip: 'Pending maps phase',
                callback: '#'
            };
            const itemRows = safeShop.itemList.length
                ? safeShop.itemList.map((item) => this.shopDetailItemRow(item, safeShop)).join('')
                : '<tr><td style="padding:4px 0;color:rgb(160,160,160);font-size:12px;">No items in this shop.</td></tr>';

            const titleHtml =
                '<div style="text-align:center;line-height:1.1;">' +
                    '<div style="font-size:20px;font-weight:800;">' + Utils.escapeHtml(String(safeShop.name || 'Shop')) + '</div>' +
                    '<div style="font-size:11px;color:rgb(170,170,170);font-weight:400;">' + Utils.escapeHtml(String(safeShop.id || '')) + '</div>' +
                '</div>';

            const body =
                '<table style="width:100%;border-collapse:collapse;table-layout:fixed;">' +
                    '<tbody>' +
                        '<tr>' +
                            '<td style="padding:2px 0;text-align:left;">' +
                                salesHtml +
                            '</td>' +
                            '<td style="padding:2px 0;text-align:right;">' +
                                earningsHtml +
                            '</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td colspan="2" style="padding:5px 0;text-align:center;">' +
                                '<table style="width:100%;border-collapse:collapse;table-layout:fixed;">' +
                                    '<tbody>' +
                                        '<tr>' +
                                            '<td style="width:16.66%;padding:4px 2px;text-align:center;vertical-align:middle;">' +
                                                this.shopStatusButton(safeShop, { returnTo: 'detail' }) +
                                            '</td>' +
                                            '<td style="width:16.66%;padding:4px 2px;text-align:center;vertical-align:middle;">' +
                                                this.shopHiddenButton(safeShop, { returnTo: 'detail' }) +
                                            '</td>' +
                                            '<td style="width:16.66%;padding:4px 2px;text-align:center;vertical-align:middle;">' +
                                                this.shopStockModeButton(safeShop) +
                                            '</td>' +
                                            '<td style="width:16.66%;padding:4px 2px;text-align:center;vertical-align:middle;">' +
                                                this.shopRollPriceButton(safeShop) +
                                            '</td>' +
                                            '<td style="width:16.66%;padding:4px 2px;text-align:center;vertical-align:middle;">' +
                                                this.shopExportButton(safeShop) +
                                            '</td>' +
                                            '<td style="width:16.66%;padding:4px 2px;text-align:center;vertical-align:middle;">' +
                                                this.shopLoadButton(safeShop) +
                                            '</td>' +
                                        '</tr>' +
                                    '</tbody>' +
                                '</table>' +
                            '</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td style="padding:3px 0;text-align:left;">' +
                                blacklistHtml +
                            '</td>' +
                            '<td style="padding:3px 0;text-align:right;">' +
                                this.inRowButtonHtml(Object.assign({}, disabledButtonStyle, {
                                    text: 'Add',
                                    textColor: 'rgb(255,255,255)',
                                    backgroundColor: 'rgba(150,20,20,0.92)',
                                    borderColor: 'rgba(255,255,255,0.55)',
                                    height: 15,
                                    fontSize: 12,
                                    tooltip: 'Target a character token to blacklist',
                                    callback: '!tntShop blacklist ' + String(safeShop.id || '') + ' add &#64;{target|token_id}'
                                })) +
                                this.inRowButtonHtml(Object.assign({}, disabledButtonStyle, {
                                    text: 'Clear',
                                    textColor: 'rgb(255,255,255)',
                                    backgroundColor: 'rgba(10,122,0,0.92)',
                                    borderColor: 'rgba(255,255,255,0.55)',
                                    width: 40,
                                    height: 15,
                                    fontSize: 12,
                                    tooltip: 'Target a character token to remove from blacklist',
                                    callback: '!tntShop blacklist ' + String(safeShop.id || '') + ' remove &#64;{target|token_id}',
                                })) +
                            '</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td style="padding:3px 0;text-align:left;">' +
                                locationHtml +
                            '</td>' +
                            '<td style="padding:3px 0;text-align:right;">' +
                                this.inRowButtonHtml(Object.assign({}, disabledButtonStyle, {
                                    text: 'Set',
                                    fontSize: 12,
                                })) +
                                this.inRowButtonHtml(Object.assign({}, disabledButtonStyle, {
                                    text: 'Clear',
                                    fontSize: 12,
                                    width: 40
                                })) +
                            '</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td style="padding:3px 0;text-align:left;">' +
                                itemListHtml +
                            '</td>' +
                            '<td style="padding:3px 0;text-align:right;">' +
                                this.inRowButtonHtml(Object.assign({}, disabledButtonStyle, {
                                    text: 'Add',
                                    textColor: 'rgb(255,255,255)',
                                    backgroundColor: 'rgba(0,86,115,0.95)',
                                    borderColor: 'rgba(255,255,255,0.55)',
                                    height: 15,
                                    fontSize: 12,
                                    tooltip: 'Add an item to this shop',
                                    callback: '!tntShop add ' + String(safeShop.id || '') + ' &#63;{Item Name} - - &#63;{Equippable?|no|yes} --detail'
                                })) +
                            '</td>' +
                        '</tr>' +
                    '</tbody>' +
                '</table>' +
                '<div style="height:1px;background:rgba(255,255,255,0.18);margin:5px 0;"></div>' +
                '<table style="width:100%;border-collapse:collapse;table-layout:fixed;">' +
                    '<tbody>' +
                        itemRows +
                    '</tbody>' +
                '</table>';

            return Html.card({
                title: safeShop.name || 'Shop',
                body,
                buildOptions: {
                    titleHtml
                }
            });
        },

        showItemInRowHtml(item, options = {}) {
            const safeItem = item || {};
            const fontSize = Number(options.fontSize) || CONFIG.DEFAULT_ITEM_ROW_FONT_SIZE;
            const imageSize = Number(options.imageSize) || CONFIG.DEFAULT_ITEM_ROW_IMAGE_SIZE;
            const rowHeight = Number(options.rowHeight) || CONFIG.DEFAULT_ITEM_ROW_HEIGHT;
            const sourceTokenId = String(options.sourceTokenId || '').trim();
            const buyerTokenId = String(options.buyerTokenId || '').trim();

            const qualityColorByRarity = {
                common: CONFIG.DEFAULT_ITEM_COMMON_QUALITY_COLOR,
                uncommon: CONFIG.DEFAULT_ITEM_UNCOMMON_QUALITY_COLOR,
                rare: CONFIG.DEFAULT_ITEM_RARE_QUALITY_COLOR,
                very_rare: CONFIG.DEFAULT_ITEM_VERY_RARE_QUALITY_COLOR,
                legendary: CONFIG.DEFAULT_ITEM_LEGENDARY_QUALITY_COLOR,
                artifact: CONFIG.DEFAULT_ITEM_ARTIFACT_QUALITY_COLOR
            };
            const rarityKey = String(safeItem.rarity || safeItem.quality || 'common')
                .trim()
                .toLowerCase()
                .replace(/[\s-]+/g, '_');
            const qualityColor = String(
                qualityColorByRarity[rarityKey] ||
                qualityColorByRarity.common ||
                'rgb(162, 162, 162)'
            ).replace(/\)\)+$/g, ')');
            const description = String(safeItem.description || '').trim();
            const hasDescription = description.length > 0;
            const imageUrl = String(safeItem.imageUrl || '').trim();
            const hasImage = imageUrl !== '' && imageUrl !== '0';
            const itemLabel = String(
                safeItem.abbreviation || safeItem.abreviation || safeItem.name || 'UNKNOWN ITEM'
            ).toUpperCase();
            const itemName = String(safeItem.name || safeItem.recordName || itemLabel).trim();
            const quantityValue = Math.max(0, Utils.toInt(safeItem.quantity, 0));
            let quantity = '';
            if (options.menuType === 'inventory') {
                quantity = ' [' + Utils.escapeHtml(String(quantityValue)) + ']';
            } else if (options.menuType === 'shop') {
                const stockValue = Math.max(0, Utils.toInt(safeItem.stock, 0));
                const isUnlimited = !Utils.toBoolean(options.hasStock, true) || stockValue >= SHOP_INFINITE_STOCK;
                const stockText = Utils.toBoolean(options.hasStock, true)
                    ? (' [' + (isUnlimited ? '∞' : Utils.escapeHtml(String(stockValue))) + ']')
                    : ' [∞]';
                quantity = stockText;
            }

            let itemNameHtml =
                '<span style="color:' + qualityColor + ';font-weight:700;font-size:' + fontSize + 'px;vertical-align:middle;">' +
                    Utils.escapeHtml(itemLabel) +
                '</span>';
            if (options.menuType === 'inventory' && itemName) {
                itemNameHtml = Html.button({
                    text: itemLabel,
                    command: '!tntItem details ' + itemName,
                    style: Utils.joinStyles({
                        color: qualityColor,
                        'font-weight': '700',
                        'font-size': fontSize + 'px',
                        'vertical-align': 'middle',
                        'text-decoration': 'none',
                        background: 'transparent',
                        border: '0',
                        padding: '0',
                        margin: '0',
                        display: 'inline',
                        cursor: 'pointer'
                    })
                });
            }

            const imageHtml = hasImage
                ? '<img src="' + Utils.attrSafe(imageUrl) + '" style="width:' + imageSize + 'px;height:' + imageSize + 'px;object-fit:cover;border-radius:4px;vertical-align:middle;margin-right:6px;" />'
                : '<span style="display:inline-block;width:' + imageSize + 'px;height:' + imageSize + 'px;vertical-align:middle;margin-right:6px;"></span>';

            let itemBlock =
                '<span style="' + 'display:block;' +  'white-space:nowrap;' + 'overflow:hidden;' + 'text-overflow:clip;' + 'line-height:1.15;' + 'padding-right:0;' + '">' +
                    imageHtml + itemNameHtml + quantity +
                '</span>';

            if (hasDescription) {
                itemBlock =
                    '<span class="showtip tipsy" title="' + Utils.escapeHtml(description) + '" style="cursor:help;display:inline;white-space:normal;overflow-wrap:anywhere;word-break:break-word;">' +
                        itemBlock +
                    '</span>';
            }

            let buttons = '';
            if (options.menuType === 'inventory') {
                buttons += this.itemRowUseButton(safeItem, sourceTokenId);
                buttons += this.itemRowGiveButton(safeItem, sourceTokenId);
                buttons += this.itemRowDiscardButton(safeItem, sourceTokenId);
            } else if (options.menuType === 'shop') {
                const priceText = Utils.toBoolean(options.hidePrice, false)
                    ? ''
                    : (Number(safeItem.price) < 0
                        ? ' TBD'
                        : (Utils.escapeHtml(String(Math.max(0, Number(safeItem.price) || 0))) + ' ' + Utils.escapeHtml(String(safeItem.priceType || CONFIG.CURRENCY_FALLBACK).toUpperCase())));

                buttons += this.itemRowBuyButton(safeItem, {
                    tooltip: priceText,
                    shopId: options.shopId,
                    buyerTokenId,
                    hasStock: options.hasStock
                });
            } else if (options.menuType === 'catalog') {
                const safeItemName = String(safeItem.name || safeItem.recordName || '').trim();
                if (safeItemName) {
                    buttons += this.inRowButtonHtml({
                        text: 'DETAILS',
                        textColor: 'rgb(255,255,255)',
                        backgroundColor: 'rgba(0,86,115,0.95)',
                        borderColor: 'rgba(255,255,255,0.55)',
                        width: 40,
                        height: 15,
                        fontSize: 8,
                        tooltip: 'Details',
                        callback: '!tntItem details ' + safeItemName
                    });
                }
            }
            const buttonFloat = buttons
                ? '<span style="' + 'position:absolute;' + 'right:0;' + 'top:5px;' + 'z-index:2;' + 'text-align:right;' + 'white-space:nowrap;' + '">' + buttons + '</span>'
                : '';
            return (
                '<tr style="min-height:' + rowHeight + 'px;">' +
                    '<td style="' +
                        'position:relative;' +
                        'padding:1px 0;' +
                        'text-align:left;' +
                        'vertical-align:middle;' +
                        'line-height:1.15;' +
                        'overflow:hidden;' +
                        'height:' + rowHeight + 'px;' +
                    '">' +
                        itemBlock +
                        buttonFloat +
                    '</td>' +
                '</tr>'
            );
        },

        promptSafe(value = '') {
            return String(value === undefined || value === null ? '' : value)
                .replace(/[|}]/g, ' ')
                .replace(/[\r\n]+/g, ' ')
                .trim();
        },

        showItemCatalog(items = [], options = {}) {
            const safeItems = Array.isArray(items) ? items : [];
            const grouped = !!options.grouped;
            const title = String(options.title || 'Item Catalog') + ' [' + String(safeItems.length) + ']';
            const rowOptions = {
                menuType: 'catalog',
                fontSize: 12,
                imageSize: 24,
                rowHeight: 28
            };

            const itemTable = (itemRows) => {
                return (
                    '<table style="width:100%;border-collapse:collapse;table-layout:auto;">' +
                        '<tbody>' + itemRows + '</tbody>' +
                    '</table>'
                );
            };

            let body = '';
            if (grouped) {
                const groups = ItemService.groupBySection(safeItems);
                body = groups.map((group) => {
                    const itemRows = group.items.map((item) => this.showItemInRowHtml(item, rowOptions)).join('');
                    return (
                        '<div style="padding:8px 0 4px 0;text-align:center;">' +
                            '<div style="font-size:12px;font-weight:800;color:rgb(235,235,235);">' + Utils.escapeHtml(group.section) + '</div>' +
                            '<div style="height:1px;background:rgba(255,255,255,0.72);margin:4px 18px 4px 18px;"></div>' +
                        '</div>' +
                        itemTable(itemRows)
                    );
                }).join('');
            } else {
                const rows = safeItems.map((item) => this.showItemInRowHtml(item, rowOptions)).join('');
                body = rows ? itemTable(rows) : '';
            }

            if (!body) {
                body = '<div style="padding:4px 0;color:rgb(160,160,160);font-size:12px;">No items found.</div>';
            }

            return Html.card({
                title,
                body
            });
        },

        showItemDetails(item = {}) {
            const safeItem = item || {};
            const imageUrl = String(safeItem.imageUrl || '').trim();
            const hasImage = imageUrl !== '' && imageUrl !== '0';
            const itemName = String(safeItem.name || 'Item').trim();

            const lines = [];
            const addLine = (label, value, always = false, options = {}) => {
                const text = String(value === undefined || value === null ? '' : value).trim();
                const hideZero = !(options && options.showZero);
                if (!always && (!text || (hideZero && text === '0'))) return;
                lines.push(
                    '<div style="padding:1px 0;text-align:left;color:rgb(235,235,235);font-size:12px;line-height:1.25;">' +
                        '<b style="color:rgb(165,165,165);">' + Utils.escapeHtml(label) + ':</b> ' +
                        Utils.escapeHtml(text || '-') +
                    '</div>'
                );
            };

            const price = Number(safeItem.defaultPrice);
            const priceType = String(safeItem.defaultPriceType || CONFIG.CURRENCY_FALLBACK).trim().toUpperCase();
            const diceCount = Math.max(0, Utils.toInt(safeItem.diceCount, 0));
            const diceSide = Math.max(0, Utils.toInt(safeItem.diceSide, 0));
            const bonus = Number(safeItem.bonus) || 0;
            let diceText = '';
            if (diceCount > 0 && diceSide > 0) {
                diceText = String(diceCount) + 'd' + String(diceSide);
                if (bonus > 0) diceText += '+' + String(bonus);
                else if (bonus < 0) diceText += String(bonus);
            } else if (bonus !== 0) {
                diceText = String(bonus);
            }
            const priceText = (!Number.isNaN(price) && price > 0)
                ? (String(price) + ' ' + priceType)
                : '-';
            const effectText = String(safeItem.effect || '').trim();
            const hasEffect = effectText && effectText.toLowerCase() !== 'none';

            addLine('Type', safeItem.type, true);
            if (hasEffect) addLine('Effect', effectText);
            addLine('Rarity', safeItem.rarity, true);
            addLine('Price', priceText, true);
            addLine('AC', safeItem.AC, false, { showZero: true });
            addLine('Modifier', safeItem.modifier, false, { showZero: true });
            addLine('Debuff', safeItem.debuff);
            addLine('Requirement', safeItem.requirement);
            addLine('Dice', diceText);
            addLine('Damage Type', safeItem.damageType);
            addLine('Properties', safeItem.properties);
            addLine('Mastery', safeItem.mastery);
            addLine('Use Range', safeItem.useRange);
            addLine('Weight', safeItem.weight);

            const description = String(safeItem.description || '').trim();
            const descriptionHtml = description
                ? (
                    '<div style="margin-top:8px;text-align:center;color:rgb(165,165,165);font-size:12px;font-weight:700;">Description</div>' +
                    '<div style="height:1px;background:rgba(165,165,165,0.8);margin:4px 0 6px 0;"></div>' +
                    '<div style="color:rgb(235,235,235);font-size:12px;line-height:1.35;text-align:center;white-space:pre-wrap;">' +
                        Utils.escapeHtml(description) +
                    '</div>'
                )
                : '';

            const iconHtml = hasImage
                ? '<img src="' + Utils.attrSafe(imageUrl) + '" style="float:right;width:64px;height:64px;object-fit:cover;border-radius:4px;margin:2px 4px 6px 8px;" />'
                : '';

            const body =
                '<div style="text-align:left;min-height:' + (hasImage ? '70px' : '0') + ';overflow:hidden;">' +
                    iconHtml +
                    (lines.length ? lines.join('') : '<div style="padding:4px 0;color:rgb(160,160,160);font-size:12px;">No item details available.</div>') +
                '</div>' +
                '<div style="clear:both;"></div>' +
                descriptionHtml;

            return Html.card({
                title: itemName,
                body
            });
        },

        showItemCreateDraft(draft = {}, options = {}) {
            const fields = ItemService.draftFields;
            const fieldRows = fields.map((field) => {
                const value = Object.prototype.hasOwnProperty.call(draft, field.key) ? draft[field.key] : field.defaultValue;
                const displayValue = field.type === 'boolean'
                    ? (Utils.toBoolean(value, field.defaultValue) ? 'true' : 'false')
                    : String(value === undefined || value === null || value === '' ? '-' : value);
                const button = field.type === 'boolean'
                    ? this.inRowButtonHtml({
                        text: displayValue === 'true' ? 'ON' : 'OFF',
                        width: 30,
                        height: 15,
                        fontSize: 10,
                        textColor: 'rgb(255,255,255)',
                        backgroundColor: displayValue === 'true' ? 'rgba(10,122,0,0.92)' : 'rgba(95,95,95,0.9)',
                        borderColor: 'rgba(255,255,255,0.55)',
                        tooltip: 'Toggle ' + field.label,
                        callback: '!tntItem create toggle ' + field.key
                    })
                    : this.inRowButtonHtml({
                        text: 'Edit',
                        width: 32,
                        height: 15,
                        fontSize: 10,
                        textColor: 'rgb(255,255,255)',
                        backgroundColor: 'rgba(0,86,115,0.95)',
                        borderColor: 'rgba(255,255,255,0.55)',
                        tooltip: 'Edit ' + field.label,
                        callback: '!tntItem create set ' + field.key + ' &#63;{' + Utils.escapeHtml(field.label) + '|' + Utils.escapeHtml(this.promptSafe(value)) + '}'
                    });

                return (
                    '<tr>' +
                        '<td style="padding:2px 4px 2px 0;text-align:left;vertical-align:middle;width:88px;color:rgb(190,190,190);font-size:11px;font-weight:700;">' +
                            Utils.escapeHtml(field.label) +
                        '</td>' +
                        '<td style="padding:2px 4px;text-align:left;vertical-align:middle;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:rgb(235,235,235);font-size:11px;">' +
                            Utils.escapeHtml(displayValue) +
                        '</td>' +
                        '<td style="padding:2px 0 2px 4px;text-align:right;vertical-align:middle;white-space:nowrap;width:36px;">' +
                            button +
                        '</td>' +
                    '</tr>'
                );
            }).join('');

            const footer =
                '<div style="height:1px;background:rgba(255,255,255,0.18);margin:6px 0;"></div>' +
                '<div style="text-align:center;">' +
                    this.inRowButtonHtml({
                        text: 'Save',
                        width: 42,
                        height: 16,
                        fontSize: 11,
                        textColor: 'rgb(255,255,255)',
                        backgroundColor: 'rgba(10,122,0,0.92)',
                        borderColor: 'rgba(255,255,255,0.55)',
                        callback: '!tntItem create save'
                    }) +
                    this.inRowButtonHtml({
                        text: 'Reset',
                        width: 44,
                        height: 16,
                        fontSize: 11,
                        textColor: 'rgb(255,255,255)',
                        backgroundColor: 'rgba(115,72,0,0.95)',
                        borderColor: 'rgba(255,255,255,0.55)',
                        callback: '!tntItem create reset'
                    }) +
                    this.inRowButtonHtml({
                        text: 'Cancel',
                        width: 48,
                        height: 16,
                        fontSize: 11,
                        textColor: 'rgb(255,255,255)',
                        backgroundColor: 'rgba(150,20,20,0.92)',
                        borderColor: 'rgba(255,255,255,0.55)',
                        callback: '!tntItem create cancel'
                    }) +
                '</div>';

            return Html.card({
                title: 'Create Item Draft',
                body:
                    '<table style="width:100%;border-collapse:collapse;table-layout:fixed;">' +
                        '<tbody>' + fieldRows + '</tbody>' +
                    '</table>' +
                    footer
            });
        },

        showItemsList(items = [], options = {}) {
            const safeItems = Array.isArray(items) ? items : [];
            const title = String(options.title || 'Items Catalog');
            const emptyText = String(options.emptyText || 'No items found in catalog.');
            const walletHtml = Utils.isNonEmptyString(options.walletHtml) ? String(options.walletHtml) : '';
            const rowOptions = {
                menuType: options.menuType || 'store',
                fontSize: options.fontSize,
                imageSize: options.imageSize,
                rowHeight: options.rowHeight,
                sourceTokenId: options.sourceTokenId,
                buyerTokenId: options.buyerTokenId,
                shopId: options.shopId,
                hidePrice: options.hidePrice,
                hasStock: options.hasStock
            };
            const rows = safeItems.length
                ? safeItems.map((item) => this.showItemInRowHtml(item, rowOptions)).join('')
                : '<tr><td style="padding:4px 0;color:rgb(160,160,160);font-size:12px;">' + Utils.escapeHtml(emptyText) + '</td></tr>';
            const tableBody =
                walletHtml +
                '<table style="width:100%;border-collapse:collapse;table-layout:auto;">' +
                    '<tbody>' + rows + '</tbody>' +
                '</table>';

            const cardBuildOptions = Object.assign({}, options.buildOptions || {});
            if (Utils.isNonEmptyString(options.titleHtml)) {
                cardBuildOptions.titleHtml = options.titleHtml;
                if (!cardBuildOptions.titleAlign) cardBuildOptions.titleAlign = 'left';
            }

            return Html.card({
                title: title,
                body: tableBody,
                buildOptions: cardBuildOptions
            });
        },

        tokenActionRow(name, damageHtml, button, width = 50) {
            return (
                '<tr style="height:28px;">' +
                    '<td style="padding:0;text-align:left;vertical-align:middle;white-space:normal;line-height:16px;">' +
                        '<b>' + Utils.escapeHtml(String(name || '').trim()) + '</b>' +
                    '</td>' +
                    '<td style="padding:0 6px 0 4px;text-align:right;vertical-align:middle;white-space:nowrap;width:' + String(width) + 'px;">' +
                        damageHtml +
                    '</td>' +
                    '<td style="padding:0;text-align:right;vertical-align:middle;white-space:nowrap;width:50px;">' +
                        button +
                    '</td>' +
                '</tr>'
            );
        },

        tokenActionCardTitle(tokenName = '', label = '', labelColor = 'rgb(215,47,47)') {
            return Html.span(Utils.escapeHtml(String(tokenName || 'Character')), 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:700;') +
                ' ' +
                Html.span(Utils.escapeHtml(String(label || 'Actions')), 'color:' + labelColor + ';font-weight:700;');
        },

        showTokenAttackActionCard(attacks = [], options = {}) {
            const characterId = String(options.characterId || '').trim();
            const tokenName = String(options.tokenName || options.title || 'Character');
            const tokenRef = String(options.tokenRef || options.tokenId || '').trim();
            const rows = (Array.isArray(attacks) ? attacks : [])
                .filter((attack) => String(attack.atkAttrBase || '').trim().toLowerCase() !== 'spell')
                .map((attack) => this.tokenActionRow(
                    attack.attackName || attack.name || 'Attack',
                    this.tokenAttackDamageButton(attack, characterId),
                    this.tokenAttackButton(attack, characterId),
                    78
                ));

            if (!rows.length) return '';
            const refreshButton = this.tokenAttackRefreshButton(tokenRef);
            if (refreshButton) {
                rows.push(
                    '<tr style="height:24px;">' +
                        '<td colspan="3" style="padding:6px 0 0 0;text-align:center;vertical-align:middle;">' +
                            refreshButton +
                        '</td>' +
                    '</tr>'
                );
            }
            return Html.card({
                title: tokenName + '\'s Attacks',
                body:
                    '<table style="width:100%;border-collapse:collapse;table-layout:auto;">' +
                        '<tbody>' + rows.join('') + '</tbody>' +
                    '</table>',
                buildOptions: {
                    titleHtml: this.tokenActionCardTitle(tokenName, 'Attacks', 'rgb(215,47,47)')
                }
            });
        },

        buildTokenSpellRows(spells = [], options = {}) {
            const safeSpells = Array.isArray(spells) ? spells : [];
            const characterId = String(options.characterId || '').trim();
            const tokenId = String(options.tokenId || '').trim();
            const tokenRef = String(options.tokenRef || options.tokenId || '').trim();
            const spellLevelLabel = (level) => {
                const normalized = TokenService.normalizeSpellLevel(level);
                return normalized === 'cantrip' ? 'Cantrips' : ('Level ' + normalized);
            };
            const rows = [];
            let lastSpellLevel = null;
            safeSpells.forEach((spell) => {
                const spellLevel = TokenService.normalizeSpellLevel(spell.spellLevel || spell.level || '');
                if (spellLevel !== lastSpellLevel) {
                    rows.push(
                        '<tr><td colspan="3" style="padding:5px 0 2px 0;text-align:center;color:rgb(235,235,235);font-size:12px;font-weight:700;">' +
                            Utils.escapeHtml(spellLevelLabel(spellLevel)) +
                        '</td></tr>'
                    );
                    lastSpellLevel = spellLevel;
                }
                rows.push(this.tokenActionRow(
                    spell.spellName || spell.name || 'Spell',
                    this.tokenSpellDamageButton(spell, characterId),
                    this.tokenSpellButton(spell, { characterId, tokenId }),
                    78
                ));
            });
            const refreshButton = this.tokenSpellRefreshButton(tokenRef);
            if (refreshButton) {
                rows.push(
                    '<tr style="height:24px;">' +
                        '<td colspan="3" style="padding:6px 0 0 0;text-align:center;vertical-align:middle;">' +
                            refreshButton +
                        '</td>' +
                    '</tr>'
                );
            }
            return rows;
        },

        showTokenSpellActionCard(spells = [], options = {}) {
            const tokenName = String(options.tokenName || options.title || 'Character');
            const rows = this.buildTokenSpellRows(spells, options);
            if (!rows.length) return '';
            return Html.card({
                title: tokenName + ' Spells',
                body:
                    '<table style="width:100%;border-collapse:collapse;table-layout:auto;">' +
                        '<tbody>' + rows.join('') + '</tbody>' +
                    '</table>',
                buildOptions: {
                    titleHtml: this.tokenActionCardTitle(tokenName, 'Spells', 'rgb(150,80,220)')
                }
            });
        },

        showTokenActionList(attacks = [], spells = [], options = {}) {
            const attackCard = this.showTokenAttackActionCard(attacks, options);
            const spellCard = this.showTokenSpellActionCard(spells, options);
            if (attackCard || spellCard) return attackCard + spellCard;

            const title = String(options.title || 'Actions');
            const rows = '<tr><td style="padding:4px 0;color:rgb(160,160,160);font-size:12px;">No attacks or spells found.</td></tr>';
            return Html.card({
                title,
                body:
                    '<table style="width:100%;border-collapse:collapse;table-layout:auto;">' +
                        '<tbody>' + rows + '</tbody>' +
                    '</table>'
            });
        },

        showTokenAttackList(attacks = [], options = {}) {
            return this.showTokenAttackActionCard(attacks, options);
        },

        showTokenSpellList(spells = [], options = {}) {
            return this.showTokenSpellActionCard(spells, options);
        }
    };

    /** -----------------------------------------------------------------------
     * @section Token Service
     * --------------------------------------------------------------------- */
    const TokenService = {
        managedAbilityNames: Object.freeze([
            'Inventory',
            'Shop',
            'Search',
            'Initiative',
            'Ability-Check',
            'Saving-Throw',
            'Skill-Check',
            'Attacks'
        ]),

        repeatingConfigs: Object.freeze({
            attack: Object.freeze({
                prefix: 'repeating_attack',
                nameSuffix: 'atkname',
                idSuffix: 'id',
                listAttribute: 'user.T&T_attack_list',
                nameKey: 'attackName',
                idKey: 'attackId',
                extraFields: Object.freeze({
                    dmgBase: 'dmgbase',
                    dmgMod: 'dmgmod',
                    dmgType: 'dmgtype',
                    atkProfFlag: ['atkprofflag', 'atkprof_flag', 'atk_prof_flag'],
                    atkAttrBase: 'atkattr_base',
                    saveFlag: ['saveflag', 'save_flag'],
                    saveAttr: ['saveattr', 'save_attr']
                }),
                fallbackName: 'Attack'
            }),
            spell: Object.freeze({
                prefix: 'repeating_spell',
                nameSuffix: 'spellname',
                idSuffix: 'id',
                listAttribute: 'user.T&T_spell_list',
                nameKey: 'spellName',
                idKey: 'spellId',
                extraFields: Object.freeze({
                    spellLevel: 'spelllevel',
                    spellClass: 'spellclass',
                    spellDamageType: 'spelldamagetype',
                    spellDamage: 'spelldamage',
                    spellSave: 'spellsave'
                }),
                fallbackName: 'Spell'
            })
        }),

        async getInitAbilities(characterId = '', tokenId = '') {
            const abilityCheck =
                '?{Ability|Strength,%&#123;selected&#124;strength&#125;|Dexterity,%&#123;selected&#124;dexterity&#125;|Constitution,%&#123;selected&#124;constitution&#125;|Intelligence,%&#123;selected&#124;intelligence&#125;|Wisdom,%&#123;selected&#124;wisdom&#125;|Charisma,%&#123;selected&#124;charisma&#125;}';
            const savingThrow =
                '?{Ability|Strength,%&#123;selected&#124;strength_save&#125;|Dexterity,%&#123;selected&#124;dexterity_save&#125;|Constitution,%&#123;selected&#124;constitution_save&#125;|Intelligence,%&#123;selected&#124;intelligence_save&#125;|Wisdom,%&#123;selected&#124;wisdom_save&#125;|Charisma,%&#123;selected&#124;charisma_save&#125;}';
            const skillCheck =
                '?{Skill|Acrobatics,%&#123;selected&#124;acrobatics&#125;|Animal Handling,%&#123;selected&#124;animal_handling&#125;|Arcana,%&#123;selected&#124;arcana&#125;|Athletics,%&#123;selected&#124;athletics&#125;|Deception,%&#123;selected&#124;deception&#125;|History,%&#123;selected&#124;history&#125;|Insight,%&#123;selected&#124;insight&#125;|Intimidation,%&#123;selected&#124;intimidation&#125;|Investigation,%&#123;selected&#124;investigation&#125;|Medicine,%&#123;selected&#124;medicine&#125;|Nature,%&#123;selected&#124;nature&#125;|Perception,%&#123;selected&#124;perception&#125;|Performance,%&#123;selected&#124;performance&#125;|Persuasion,%&#123;selected&#124;persuasion&#125;|Religion,%&#123;selected&#124;religion&#125;|Sleight of Hand,%&#123;selected&#124;sleight_of_hand&#125;|Stealth,%&#123;selected&#124;stealth&#125;|Survival,%&#123;selected&#124;survival&#125;}';
            const abilities = [
                { name: 'Inventory', action: '!tntInventory' },
                { name: 'Shop', action: '!tntShop list' },
                { name: 'Search', action: '!tntItem search ?{itemname}' },
                { name: 'Initiative', action: '%{selected|initiative}' },
                { name: 'Ability-Check', action: abilityCheck },
                { name: 'Saving-Throw', action: savingThrow },
                { name: 'Skill-Check', action: skillCheck },
                { name: 'Attacks', action: '!tntToken attacks' }
            ];
            return abilities;
        },

        getCharacterAttributes(characterId = '') {
            const safeCharacterId = String(characterId || '').trim();
            if (!safeCharacterId) return [];
            return findObjs({
                _type: 'attribute',
                _characterid: safeCharacterId
            }) || [];
        },

        getAttributeCurrent(attribute) {
            if (!attribute || !Utils.isFunction(attribute.get)) return '';
            return String(attribute.get('current') || '').trim();
        },

        findCharacterAttribute(characterId = '', attributeName = '') {
            const safeCharacterId = String(characterId || '').trim();
            const key = String(attributeName || '').trim().toLowerCase();
            if (!safeCharacterId || !key) return null;

            const attributes = this.getCharacterAttributes(safeCharacterId);
            return attributes.find((attribute) => String(attribute.get('name') || '').trim().toLowerCase() === key) || null;
        },

        getRepeatingConfig(type = '') {
            return this.repeatingConfigs[String(type || '').trim().toLowerCase()] || null;
        },

        buildRepeatingListValue(entries = [], type = '') {
            const config = this.getRepeatingConfig(type);
            if (!config) return '';

            const safeEntries = Array.isArray(entries) ? entries : [];
            const extraFields = config.extraFields || {};
            const extraKeys = Object.keys(extraFields);
            return safeEntries
                .filter((entry) => entry && entry[config.nameKey] && entry[config.idKey])
                .filter((entry) => type !== 'attack' || String(entry.atkAttrBase || '').trim().toLowerCase() !== 'spell')
                .map((entry) => {
                    if (type === 'attack') {
                        return JSON.stringify(String(entry[config.nameKey])) + ':' +
                            JSON.stringify(String(entry[config.idKey])) + ':' +
                            JSON.stringify(this.formatRepeatingAttackDamage(entry)) + ':' +
                            JSON.stringify(String(entry.dmgType || '')) + ':' +
                            JSON.stringify(String(entry.attackBonus || '')) + ':' +
                            JSON.stringify(String(entry.saveFlag || '')) + ':' +
                            JSON.stringify(String(entry.saveAttr || '')) + ':' +
                            JSON.stringify(String(entry.atkProfFlag || '')) + ':' +
                            JSON.stringify(String(entry.saveDc || ''));
                    }

                    if (type === 'spell') {
                        return JSON.stringify(String(entry[config.nameKey])) + ':' +
                            JSON.stringify(String(entry[config.idKey])) + ':' +
                            JSON.stringify(this.normalizeSpellLevel(entry.spellLevel)) + ':' +
                            JSON.stringify(String(entry.spellClass || '')) + ':' +
                            JSON.stringify(String(entry.spellDamageType || '')) + ':' +
                            JSON.stringify(String(entry.spellDamage || '')) + ':' +
                            JSON.stringify(String(entry.spellSave || '')) + ':' +
                            JSON.stringify(String(entry.spellAttackBonus || '')) + ':' +
                            JSON.stringify(String(entry.spellSaveDc || '')) + ':' +
                            JSON.stringify(String(entry.spellcastingAbility || '')) + ':' +
                            JSON.stringify(String(entry.spellcastingMod || ''));
                    }

                    if (extraKeys.length) {
                        const payload = {
                            id: String(entry[config.idKey])
                        };
                        for (let i = 0; i < extraKeys.length; i += 1) {
                            const key = extraKeys[i];
                            const value = String(entry[key] || '').trim();
                            if (value) payload[key] = value;
                        }
                        return JSON.stringify(String(entry[config.nameKey])) + ':' + JSON.stringify(payload);
                    }

                    return JSON.stringify(String(entry[config.nameKey])) + ':' + JSON.stringify(String(entry[config.idKey]));
                })
                .join(',');
        },

        formatRepeatingAttackDamage(entry = {}) {
            const dmgBase = String(entry.dmgBase || '').trim();
            const dmgMod = this.simplifyModifierExpression(entry.dmgMod || '');
            if (!dmgBase && !dmgMod) return '';
            if (!dmgBase) return this.compactDamageText(dmgMod);
            if (!dmgMod || dmgMod === '0' || dmgMod === '+0') return this.compactDamageText(dmgBase);
            return this.compactDamageText(dmgBase + (dmgMod.charAt(0) === '-' ? '-' + dmgMod.slice(1) : '+' + dmgMod.replace(/^\+/, '')));
        },

        compactDamageText(value = '') {
            return String(value || '').trim().replace(/\s*([+-])\s*/g, '$1');
        },

        simplifyModifierExpression(value = '') {
            const raw = String(value || '').trim();
            if (!raw) return '';

            const numericParts = raw.match(/[+-]?\s*\d+/g);
            const strippedNumeric = raw.replace(/[+-]?\s*\d+/g, '').replace(/[+\-\s]/g, '');
            if (numericParts && numericParts.length && !strippedNumeric) {
                const total = numericParts.reduce((sum, part) => sum + Utils.toInt(String(part).replace(/\s+/g, ''), 0), 0);
                if (total === 0) return '';
                return total > 0 ? ('+' + String(total)) : String(total);
            }

            return raw;
        },

        normalizeSpellLevel(value = '') {
            const text = String(value || '').trim().toLowerCase();
            if (!text) return '1';
            if (text === '0' || text.indexOf('cantrip') >= 0) return 'cantrip';
            const numeric = Utils.toInt(text, 1);
            return String(Utils.clamp(numeric, 1, 9));
        },

        parseInlineRepeatingTriples(raw = '', type = '') {
            const config = this.getRepeatingConfig(type);
            if (!config) return [];

            const source = String(raw || '').trim();
            if (!source) return [];

            const entries = [];
            const pattern = /"((?:\\.|[^"\\])*)"\s*:\s*"((?:\\.|[^"\\])*)"\s*:\s*"((?:\\.|[^"\\])*)"(?:\s*:\s*"((?:\\.|[^"\\])*)")?(?:\s*:\s*"((?:\\.|[^"\\])*)")?(?:\s*:\s*"((?:\\.|[^"\\])*)")?(?:\s*:\s*"((?:\\.|[^"\\])*)")?(?:\s*:\s*"((?:\\.|[^"\\])*)")?(?:\s*:\s*"((?:\\.|[^"\\])*)")?(?:\s*:\s*"((?:\\.|[^"\\])*)")?(?:\s*:\s*"((?:\\.|[^"\\])*)")?/g;
            let match;

            while ((match = pattern.exec(source)) !== null) {
                let name = '';
                let id = '';
                let level = '';
                let spellClass = '';
                let spellDamageType = '';
                let spellDamage = '';
                let spellSave = '';
                let spellAttackBonus = '';
                let spellSaveDc = '';
                let spellcastingAbility = '';
                let spellcastingMod = '';
                try { name = JSON.parse('"' + match[1] + '"'); } catch (error) { name = match[1]; }
                try { id = JSON.parse('"' + match[2] + '"'); } catch (error) { id = match[2]; }
                try { level = JSON.parse('"' + match[3] + '"'); } catch (error) { level = match[3]; }
                if (match[4] !== undefined) {
                    try { spellClass = JSON.parse('"' + match[4] + '"'); } catch (error) { spellClass = match[4]; }
                }
                if (match[5] !== undefined) {
                    try { spellDamageType = JSON.parse('"' + match[5] + '"'); } catch (error) { spellDamageType = match[5]; }
                }
                if (match[6] !== undefined) {
                    try { spellDamage = JSON.parse('"' + match[6] + '"'); } catch (error) { spellDamage = match[6]; }
                }
                if (match[7] !== undefined) {
                    try { spellSave = JSON.parse('"' + match[7] + '"'); } catch (error) { spellSave = match[7]; }
                }
                if (match[8] !== undefined) {
                    try { spellAttackBonus = JSON.parse('"' + match[8] + '"'); } catch (error) { spellAttackBonus = match[8]; }
                }
                if (match[9] !== undefined) {
                    try { spellSaveDc = JSON.parse('"' + match[9] + '"'); } catch (error) { spellSaveDc = match[9]; }
                }
                if (match[10] !== undefined) {
                    try { spellcastingAbility = JSON.parse('"' + match[10] + '"'); } catch (error) { spellcastingAbility = match[10]; }
                }
                if (match[11] !== undefined) {
                    try { spellcastingMod = JSON.parse('"' + match[11] + '"'); } catch (error) { spellcastingMod = match[11]; }
                }

                const entry = {};
                entry[config.nameKey] = String(name || '').trim();
                entry[config.idKey] = String(id || '').trim();
                if (type === 'spell') {
                    entry.spellLevel = this.normalizeSpellLevel(level);
                    entry.spellClass = String(spellClass || '').trim();
                    entry.spellDamageType = String(spellDamageType || '').trim();
                    entry.spellDamage = String(spellDamage || '').trim();
                    entry.spellSave = String(spellSave || '').trim();
                    entry.spellAttackBonus = String(spellAttackBonus || '').trim();
                    entry.spellSaveDc = String(spellSaveDc || '').trim();
                    entry.spellcastingAbility = String(spellcastingAbility || '').trim();
                    entry.spellcastingMod = String(spellcastingMod || '').trim();
                }
                if (entry[config.nameKey] && entry[config.idKey]) entries.push(entry);
            }

            return entries;
        },

        parseInlineRepeatingQuads(raw = '', type = '') {
            const config = this.getRepeatingConfig(type);
            if (!config) return [];

            const source = String(raw || '').trim();
            if (!source) return [];

            const entries = [];
            const pattern = /"((?:\\.|[^"\\])*)"\s*:\s*"((?:\\.|[^"\\])*)"\s*:\s*"((?:\\.|[^"\\])*)"\s*:\s*"((?:\\.|[^"\\])*)"(?:\s*:\s*"((?:\\.|[^"\\])*)")?(?:\s*:\s*"((?:\\.|[^"\\])*)")?(?:\s*:\s*"((?:\\.|[^"\\])*)")?(?:\s*:\s*"((?:\\.|[^"\\])*)")?(?:\s*:\s*"((?:\\.|[^"\\])*)")?/g;
            let match;

            while ((match = pattern.exec(source)) !== null) {
                let name = '';
                let id = '';
                let damage = '';
                let damageType = '';
                let attackBonus = '';
                let saveFlag = '';
                let saveAttr = '';
                let atkProfFlag = '';
                let saveDc = '';
                try { name = JSON.parse('"' + match[1] + '"'); } catch (error) { name = match[1]; }
                try { id = JSON.parse('"' + match[2] + '"'); } catch (error) { id = match[2]; }
                try { damage = JSON.parse('"' + match[3] + '"'); } catch (error) { damage = match[3]; }
                try { damageType = JSON.parse('"' + match[4] + '"'); } catch (error) { damageType = match[4]; }
                if (match[5] !== undefined) {
                    try { attackBonus = JSON.parse('"' + match[5] + '"'); } catch (error) { attackBonus = match[5]; }
                }
                if (match[6] !== undefined) {
                    try { saveFlag = JSON.parse('"' + match[6] + '"'); } catch (error) { saveFlag = match[6]; }
                }
                if (match[7] !== undefined) {
                    try { saveAttr = JSON.parse('"' + match[7] + '"'); } catch (error) { saveAttr = match[7]; }
                }
                if (match[8] !== undefined) {
                    try { atkProfFlag = JSON.parse('"' + match[8] + '"'); } catch (error) { atkProfFlag = match[8]; }
                }
                if (match[9] !== undefined) {
                    try { saveDc = JSON.parse('"' + match[9] + '"'); } catch (error) { saveDc = match[9]; }
                }

                const entry = {};
                entry[config.nameKey] = String(name || '').trim();
                entry[config.idKey] = String(id || '').trim();
                entry.dmgBase = String(damage || '').trim();
                entry.dmgMod = '';
                entry.dmgType = String(damageType || '').trim();
                entry.attackBonus = String(attackBonus || '').trim();
                entry.saveFlag = String(saveFlag || '').trim();
                entry.saveAttr = String(saveAttr || '').trim();
                entry.atkProfFlag = String(atkProfFlag || '').trim();
                entry.saveDc = String(saveDc || '').trim();
                if (entry[config.nameKey] && entry[config.idKey]) entries.push(entry);
            }

            return entries;
        },

        parseRepeatingListValue(value = '', type = '') {
            const config = this.getRepeatingConfig(type);
            if (!config) return [];

            const raw = String(value || '').trim();
            if (!raw) return [];

            if (type === 'spell') {
                const inlineEntries = this.parseInlineRepeatingTriples(raw, type);
                if (inlineEntries.length) return inlineEntries;
            }
            if (type === 'attack') {
                const inlineEntries = this.parseInlineRepeatingQuads(raw, type);
                if (inlineEntries.length) return inlineEntries;
            }

            const candidates = [
                raw,
                raw.charAt(0) === '{' ? raw : ('{' + raw + '}')
            ];

            for (let i = 0; i < candidates.length; i += 1) {
                try {
                    const parsed = JSON.parse(candidates[i]);
                    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) continue;
                    return Object.keys(parsed)
                        .map((entryName) => {
                            const payload = parsed[entryName];
                            const entry = {};
                            entry[config.nameKey] = String(entryName || '').trim();
                            if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
                                entry[config.idKey] = String(payload.id || payload[config.idKey] || '').trim();
                                const extraFields = config.extraFields || {};
                                const extraKeys = Object.keys(extraFields);
                                for (let x = 0; x < extraKeys.length; x += 1) {
                                    const key = extraKeys[x];
                                    entry[key] = String(payload[key] || '').trim();
                                }
                            } else {
                                entry[config.idKey] = String(payload || '').trim();
                            }
                            return entry;
                        })
                        .filter((entry) => entry[config.nameKey] && entry[config.idKey]);
                } catch (error) {}
            }

            return [];
        },


        async getStoredRepeatingList(characterId = '', type = '') {
            const safeCharacterId = String(characterId || '').trim();
            const config = this.getRepeatingConfig(type);
            if (!safeCharacterId || !config) return [];

            const rawValue = await R20.getSheet(safeCharacterId, config.listAttribute);
            const entries = this.parseRepeatingListValue(rawValue, type);
            if (type === 'attack' && entries.length) {
                const attributes = this.getCharacterAttributes(safeCharacterId);
                const dumpRoots = this.getCharacterSheetDumpRoots(attributes);
                const fastDetails = await this.getFastDetails(safeCharacterId);
                await this.resolveAttackDamageModifiers(entries, attributes, dumpRoots, safeCharacterId, fastDetails);
            }
            return entries;
        },

        async getStoredAttacks(characterId = '') {
            const safeCharacterId = String(characterId || '').trim();
            if (!safeCharacterId) return [];
            return this.getStoredRepeatingList(safeCharacterId, 'attack');
        },

        async getStoredSpells(characterId = '') {
            const safeCharacterId = String(characterId || '').trim();
            if (!safeCharacterId) return [];
            return this.getStoredRepeatingList(safeCharacterId, 'spell');
        },

        buildAttackAction(characterId = '', attackId = '', options = {}) {
            const safeCharacterId = String(characterId || '').trim();
            const safeAttackId = String(attackId || '')
                .trim()
                .replace(/"/g, '')
                .replace(/[^A-Za-z0-9_-]/g, '');
            if (!safeCharacterId || !safeAttackId) return '';

            if (options && options.encodeForQuery) {
                return '%&#123;' + safeCharacterId + '&#124;repeating_attack(&quot;' + safeAttackId + '&quot;&#44; &quot;attack&quot;)&#125;';
            }

            return '%{' + safeCharacterId + '|repeating_attack_' + safeAttackId + '_attack}';
        },

        async updateRepeatingListAttribute(characterId = '', type = '', entries = []) {
            const safeCharacterId = String(characterId || '').trim();
            const config = this.getRepeatingConfig(type);
            const attributeName = config ? config.listAttribute : '';
            if (!safeCharacterId) {
                return { ok: false, action: 'failed', name: attributeName || String(type || ''), message: 'Character is required.' };
            }
            if (!config) {
                return { ok: false, action: 'failed', name: String(type || ''), message: 'Unknown repeating list type.' };
            }

            try {
                const value = this.buildRepeatingListValue(entries, type);
                await R20.setSheet(safeCharacterId, attributeName, value);
                return { ok: true, action: 'set', name: attributeName, value };
            } catch (error) {
                return {
                    ok: false,
                    action: 'failed',
                    name: attributeName,
                    message: error && error.message ? error.message : String(error)
                };
            }
        },

        async updateAttackListAttribute(characterId = '', attacks = []) {
            return this.updateRepeatingListAttribute(characterId, 'attack', attacks);
        },

        async updateJsonAttribute(characterId = '', attributeName = '', value = '') {
            const safeCharacterId = String(characterId || '').trim();
            const safeAttributeName = String(attributeName || '').trim();
            if (!safeCharacterId) {
                return { ok: false, action: 'failed', name: safeAttributeName, message: 'Character is required.' };
            }
            if (!safeAttributeName) {
                return { ok: false, action: 'failed', name: '', message: 'Attribute name is required.' };
            }

            try {
                await R20.setSheet(safeCharacterId, safeAttributeName, value);
                return { ok: true, action: 'set', name: safeAttributeName, value };
            } catch (error) {
                return {
                    ok: false,
                    action: 'failed',
                    name: safeAttributeName,
                    message: error && error.message ? error.message : String(error)
                };
            }
        },

        buildSpellDumpValue(dumpRoots = [], spells = []) {
            return JSON.stringify({
                generatedAt: new Date().toISOString(),
                dumpRoots: Array.isArray(dumpRoots) ? dumpRoots.length : 0,
                spells: (Array.isArray(spells) ? spells : []).map((spell) => ({
                    rowKey: String((spell && spell.rowKey) || ''),
                    id: String((spell && (spell.spellId || spell.id)) || ''),
                    name: String((spell && (spell.spellName || spell.name)) || ''),
                    level: String((spell && spell.spellLevel) || ''),
                    spellClass: String((spell && spell.spellClass) || ''),
                    spellDamageType: String((spell && spell.spellDamageType) || ''),
                    spellDamage: String((spell && spell.spellDamage) || ''),
                    spellSave: String((spell && spell.spellSave) || ''),
                    spellAttackBonus: String((spell && spell.spellAttackBonus) || ''),
                    spellSaveDc: String((spell && spell.spellSaveDc) || ''),
                    spellcastingAbility: String((spell && spell.spellcastingAbility) || ''),
                    spellcastingMod: String((spell && spell.spellcastingMod) || ''),
                    debug: spell && spell.__debug ? spell.__debug : null
                })),
                roots: Array.isArray(dumpRoots) ? dumpRoots : []
            });
        },

        async updateSpellDumpAttribute(characterId = '', dumpRoots = [], spells = []) {
            return this.updateJsonAttribute(characterId, 'user.tnt_spell_dump', this.buildSpellDumpValue(dumpRoots, spells));
        },

        async updateSpellListAttribute(characterId = '', spells = []) {
            return this.updateRepeatingListAttribute(characterId, 'spell', spells);
        },

        macroQuerySafeText(value = '') {
            return String(value || '')
                .replace(/[|,{}]/g, ' ')
                .replace(/[\r\n\t]+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        },

        cleanRepeatingActionId(value = '') {
            return String(value || '')
                .trim()
                .replace(/"/g, '')
                .replace(/[^A-Za-z0-9_-]/g, '');
        },

        isRepeatingLookupError(value = '') {
            return String(value || '').trim().indexOf('&{template:error}') >= 0;
        },

        getRepeatingFieldSuffixes(fieldConfig) {
            if (Array.isArray(fieldConfig)) {
                return fieldConfig
                    .map((entry) => String(entry || '').trim())
                    .filter(Boolean);
            }
            const suffix = String(fieldConfig || '').trim();
            return suffix ? [suffix] : [];
        },

        getRepeatingFieldValueBySuffixes(attributes = [], prefix = '', rowKey = '', suffixes = []) {
            const safePrefix = String(prefix || '').trim();
            const safeRowKey = String(rowKey || '').trim();
            if (!safePrefix || !safeRowKey || !Array.isArray(suffixes) || !suffixes.length) return '';

            for (let i = 0; i < suffixes.length; i += 1) {
                const targetName = safePrefix + '_' + safeRowKey + '_' + suffixes[i];
                const attr = attributes.find((attribute) =>
                    String(attribute.get('name') || '').trim().toLowerCase() === targetName.toLowerCase()
                );
                if (!attr) continue;
                const value = this.getAttributeCurrent(attr);
                if (value) return value;
            }
            return '';
        },

        cleanSheetAttributeReference(value = '') {
            const raw = String(value || '').trim();
            if (!raw) return '';

            const referenceMatch = raw.match(/^@\{(?:[^|{}]+\|)?([^|{}]+)\}$/);
            if (referenceMatch) return String(referenceMatch[1] || '').trim();

            return raw
                .replace(/^@?\{+/, '')
                .replace(/\}+$/, '')
                .split('|')
                .pop()
                .trim();
        },

        getAttributeCurrentByName(attributes = [], attributeName = '') {
            const key = this.cleanSheetAttributeReference(attributeName).toLowerCase();
            if (!key || !Array.isArray(attributes)) return '';

            const attr = attributes.find((attribute) =>
                String(attribute.get('name') || '').trim().toLowerCase() === key
            );
            return this.getAttributeCurrent(attr);
        },

        getAttributeMaxByName(attributes = [], attributeName = '') {
            const key = this.cleanSheetAttributeReference(attributeName).toLowerCase();
            if (!key || !Array.isArray(attributes)) return '';

            const attr = attributes.find((attribute) =>
                String(attribute.get('name') || '').trim().toLowerCase() === key
            );
            return attr && Utils.isFunction(attr.get) ? String(attr.get('max') || '').trim() : '';
        },

        getAttributeRawCurrentByName(attributes = [], attributeName = '') {
            const key = String(attributeName || '').trim().toLowerCase();
            if (!key || !Array.isArray(attributes)) return '';

            const attr = attributes.find((attribute) =>
                String(attribute.get('name') || '').trim().toLowerCase() === key
            );
            return attr && Utils.isFunction(attr.get) ? attr.get('current') : '';
        },

        parseSheetDumpRoot(value) {
            if (value && typeof value === 'object') return value;
            const raw = String(value || '').trim();
            if (!raw) return null;

            try { return JSON.parse(raw); } catch (error) {}
            return null;
        },

        getCharacterSheetDumpRoots(attributes = []) {
            const roots = [];
            ['builder', 'store'].forEach((attributeName) => {
                const parsed = this.parseSheetDumpRoot(this.getAttributeRawCurrentByName(attributes, attributeName));
                if (parsed && typeof parsed === 'object') roots.push(parsed);
            });
            return roots;
        },

        normalizeLookupText(value = '') {
            return String(value || '')
                .trim()
                .toLowerCase()
                .replace(/\s+/g, ' ');
        },

        extractBuilderAttackAbility(node) {
            if (!node || typeof node !== 'object') return '';

            const attack = node.attack;
            if (!attack || typeof attack !== 'object') return '';

            const explicitAbility = String(
                attack.abilityBonus ||
                (attack.ability && attack.ability.ability) ||
                ''
            ).trim();
            if (explicitAbility) return explicitAbility;

            const attackType = this.normalizeLookupText(attack.type || '');
            if (attackType === 'melee') return 'Strength';
            if (attackType === 'ranged') return 'Dexterity';
            return '';
        },

        extractBuilderSaveMeta(node) {
            if (!node || typeof node !== 'object' || !node.save || typeof node.save !== 'object') {
                return { saveFlag: '', saveAttr: '' };
            }

            const saveAttr = String(
                node.save.saveAbility ||
                node.save.saveAttr ||
                node.save.saveattr ||
                ''
            ).trim();

            return {
                saveFlag: saveAttr ? '1' : '',
                saveAttr
            };
        },

        spellLevelSortValue(value = '') {
            const level = this.normalizeSpellLevel(value);
            return level === 'cantrip' ? 0 : Utils.toInt(level, 1);
        },

        canonicalAbilityName(value = '') {
            const normalized = this.normalizeLookupText(value);
            const map = {
                str: 'Strength',
                strength: 'Strength',
                dex: 'Dexterity',
                dexterity: 'Dexterity',
                con: 'Constitution',
                constitution: 'Constitution',
                int: 'Intelligence',
                intelligence: 'Intelligence',
                wis: 'Wisdom',
                wisdom: 'Wisdom',
                cha: 'Charisma',
                charisma: 'Charisma'
            };
            return map[normalized] || '';
        },

        abilityNameToShort(value = '') {
            const ability = this.canonicalAbilityName(value);
            const map = {
                Strength: 'STR',
                Dexterity: 'DEX',
                Constitution: 'CON',
                Intelligence: 'INT',
                Wisdom: 'WIS',
                Charisma: 'CHA'
            };
            return map[ability] || '';
        },

        abilityShortToModifierKey(value = '') {
            const shortName = String(value || '').trim().toLowerCase();
            const map = {
                str: 'str_mod',
                dex: 'dex_mod',
                con: 'con_mod',
                int: 'int_mod',
                wis: 'wis_mod',
                cha: 'cha_mod'
            };
            return map[shortName] || '';
        },

        extractSpellcastingAbilityFromText(value = '') {
            const text = this.normalizeLookupText(value);
            if (!text || text.indexOf('spellcasting') < 0) return '';

            const abilities = [
                ['Strength', ['strength', 'str']],
                ['Dexterity', ['dexterity', 'dex']],
                ['Constitution', ['constitution', 'con']],
                ['Intelligence', ['intelligence', 'int']],
                ['Wisdom', ['wisdom', 'wis']],
                ['Charisma', ['charisma', 'cha']]
            ];
            for (let i = 0; i < abilities.length; i += 1) {
                const ability = abilities[i][0];
                const aliases = abilities[i][1];
                for (let x = 0; x < aliases.length; x += 1) {
                    if (new RegExp('(^|[^a-z])' + aliases[x] + '([^a-z]|$)').test(text)) return ability;
                }
            }
            return '';
        },

        normalizeRaceSpellcastingSource(value = '') {
            const normalized = this.normalizeLookupText(value);
            if (normalized === 'elf') return ['elf', 'elven'];
            return normalized ? [normalized] : [];
        },

        findSpellcastingAbilityInDumpRoots(dumpRoots = [], sourceName = '', sourceType = 'class') {
            const sourceKeys = sourceType === 'race'
                ? this.normalizeRaceSpellcastingSource(sourceName)
                : [this.normalizeLookupText(sourceName)];
            if (!Array.isArray(dumpRoots) || !dumpRoots.length || !sourceKeys.filter(Boolean).length) return '';

            let fallbackAbility = '';
            const matchesSource = (text) => {
                const normalized = this.normalizeLookupText(text);
                if (!normalized || normalized.indexOf('spellcasting') < 0) return false;
                return sourceKeys.some((key) => key && normalized.indexOf(key) >= 0);
            };
            const walk = (node) => {
                if (!node || typeof node !== 'object') return '';
                if (Array.isArray(node)) return node.reduce((found, child) => found || walk(child), '');

                const text = [node.recordName, node.name, node.builderDisplayName].filter(Boolean).join(' ');
                const ability = this.extractSpellcastingAbilityFromText(text);
                if (ability && matchesSource(text)) return ability;
                if (!fallbackAbility && sourceType === 'race' && ability && this.normalizeLookupText(text).indexOf('spellcasting choice') >= 0) {
                    fallbackAbility = ability;
                }

                const keys = Object.keys(node);
                for (let i = 0; i < keys.length; i += 1) {
                    const found = walk(node[keys[i]]);
                    if (found) return found;
                }
                return '';
            };

            for (let i = 0; i < dumpRoots.length; i += 1) {
                const found = walk(dumpRoots[i]);
                if (found) return found;
            }
            return fallbackAbility;
        },

        resolveSpellOriginAbility({ spellClass = '', characterClass = '', race = '', dumpRoots = [], fastDetails = {} } = {}) {
            const origin = this.normalizeLookupText(spellClass);
            const classSource = origin && origin.indexOf('magic initiate') !== 0 ? spellClass : characterClass;
            const useClass = !origin || origin.indexOf('magic initiate') === 0 || origin.indexOf(this.normalizeLookupText(characterClass)) >= 0;
            if (!useClass && race && origin.indexOf(this.normalizeLookupText(race)) >= 0) {
                if (fastDetails && fastDetails.race_spellcasting_attribute) return this.canonicalAbilityName(fastDetails.race_spellcasting_attribute);
                return this.findSpellcastingAbilityInDumpRoots(dumpRoots, race, 'race');
            }
            return useClass
                ? (this.canonicalAbilityName(fastDetails && fastDetails.class_spellcasting_attribute) ||
                    this.findSpellcastingAbilityInDumpRoots(dumpRoots, classSource, 'class') ||
                    this.findSpellcastingAbilityInDumpRoots(dumpRoots, characterClass, 'class'))
                : (this.canonicalAbilityName(fastDetails && fastDetails.race_spellcasting_attribute) ||
                    this.findSpellcastingAbilityInDumpRoots(dumpRoots, race, 'race') ||
                    this.findSpellcastingAbilityInDumpRoots(dumpRoots, classSource, 'class') ||
                    this.findSpellcastingAbilityInDumpRoots(dumpRoots, characterClass, 'class'));
        },

        parseFastDetailsValue(value = '') {
            const raw = String(value || '').trim();
            if (!raw) return {};
            try {
                const parsed = JSON.parse(raw);
                return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
            } catch (error) {
                return {};
            }
        },

        async getFastDetails(characterId = '') {
            const raw = await R20.getSheet(characterId, 'user.T&T_fast_details');
            return this.parseFastDetailsValue(raw);
        },

        buildSpellcastingFastDetails({ abilityShort = '', pb = 0, fastDetails = {}, prefix = '' } = {}) {
            const safePrefix = String(prefix || '').trim();
            const ability = this.abilityNameToShort(abilityShort) || String(abilityShort || '').trim().toUpperCase();
            const modKey = this.abilityShortToModifierKey(ability);
            const mod = modKey ? Utils.toInt(fastDetails[modKey], 0) : 0;
            const bonus = ability ? this.formatSignedModifier(Utils.toInt(pb, 0) + mod) : '';
            const save = ability ? String(8 + Utils.toInt(pb, 0) + mod) : '';
            return {
                [safePrefix + '_spellcasting_attribute']: ability,
                [safePrefix + '_spellcasting_bonus']: bonus,
                [safePrefix + '_spellcasting_save']: save
            };
        },

        async buildFastDetails(characterId = '', attributes = [], dumpRoots = []) {
            const existing = await this.getFastDetails(characterId);
            const [
                hpMaxRaw,
                acRaw,
                levelRaw,
                strModRaw,
                dexModRaw,
                conModRaw,
                intModRaw,
                wisModRaw,
                chaModRaw,
                pbRaw,
                classRaw,
                raceRaw
            ] = await Promise.all([
                this.getResolvedAttributeValue(characterId, attributes, 'hp_max'),
                this.getResolvedAttributeValue(characterId, attributes, 'ac'),
                this.getResolvedAttributeValue(characterId, attributes, 'level'),
                this.getResolvedAttributeValue(characterId, attributes, 'strength_mod'),
                this.getResolvedAttributeValue(characterId, attributes, 'dexterity_mod'),
                this.getResolvedAttributeValue(characterId, attributes, 'constitution_mod'),
                this.getResolvedAttributeValue(characterId, attributes, 'intelligence_mod'),
                this.getResolvedAttributeValue(characterId, attributes, 'wisdom_mod'),
                this.getResolvedAttributeValue(characterId, attributes, 'charisma_mod'),
                this.getResolvedAttributeValue(characterId, attributes, 'pb'),
                existing.class ? Promise.resolve(existing.class) : this.getResolvedAttributeValue(characterId, attributes, 'class'),
                existing.race ? Promise.resolve(existing.race) : this.getResolvedAttributeValue(characterId, attributes, 'race')
            ]);
            const details = {
                hp_max: Utils.toInt(hpMaxRaw, 0),
                ac: Utils.toInt(acRaw, 10),
                level: Utils.toInt(levelRaw, 0),
                str_mod: Utils.toInt(strModRaw, 0),
                dex_mod: Utils.toInt(dexModRaw, 0),
                con_mod: Utils.toInt(conModRaw, 0),
                int_mod: Utils.toInt(intModRaw, 0),
                wis_mod: Utils.toInt(wisModRaw, 0),
                cha_mod: Utils.toInt(chaModRaw, 0),
                pb: Utils.toInt(pbRaw, 0),
                class: String(classRaw || '').trim(),
                race: String(raceRaw || '').trim()
            };

            const shouldLookupClassCasting = !String(existing.class || '').trim();
            const shouldLookupRaceCasting = !String(existing.race || '').trim();
            const classAbility = String(existing.class_spellcasting_attribute || '').trim().toUpperCase() ||
                (shouldLookupClassCasting ? this.abilityNameToShort(this.findSpellcastingAbilityInDumpRoots(dumpRoots, details.class, 'class')) : '');
            const raceAbility = String(existing.race_spellcasting_attribute || '').trim().toUpperCase() ||
                (shouldLookupRaceCasting ? this.abilityNameToShort(this.findSpellcastingAbilityInDumpRoots(dumpRoots, details.race, 'race')) : '');

            return Object.assign(
                details,
                this.buildSpellcastingFastDetails({ abilityShort: classAbility, pb: details.pb, fastDetails: details, prefix: 'class' }),
                this.buildSpellcastingFastDetails({ abilityShort: raceAbility, pb: details.pb, fastDetails: details, prefix: 'race' })
            );
        },

        async updateFastDetailsAttribute(characterId = '', fastDetails = {}) {
            return this.updateJsonAttribute(characterId, 'user.T&T_fast_details', JSON.stringify(fastDetails || {}));
        },

        findAttackNodeInDumpRoots(dumpRoots = [], entry = {}) {
            const attackId = this.cleanRepeatingActionId(entry.attackId || entry.id || '');
            const attackName = this.normalizeLookupText(entry.attackName || entry.name || '');
            if ((!attackId && !attackName) || !Array.isArray(dumpRoots) || !dumpRoots.length) return null;

            let idOnlyNode = null;
            let nameOnlyNode = null;
            const matchesName = (node) => {
                if (!attackName) return true;
                const nodeName = this.normalizeLookupText(node.name || '');
                const recordName = this.normalizeLookupText(node.recordName || '');
                return nodeName === attackName ||
                    recordName === attackName ||
                    recordName.indexOf(attackName) >= 0 ||
                    (!!nodeName && attackName.indexOf(nodeName) >= 0);
            };

            const walk = (node) => {
                if (!node || typeof node !== 'object') return null;

                if (Array.isArray(node)) return node.reduce((found, child) => found || walk(child), null);

                const shortId = String(node.shortID || node.shortId || '').trim();
                if (attackId && shortId === attackId) {
                    if (matchesName(node)) return node;
                    if (!idOnlyNode) idOnlyNode = node;
                }
                if (!nameOnlyNode && node.attack && typeof node.attack === 'object' && matchesName(node)) {
                    nameOnlyNode = node;
                }

                const keys = Object.keys(node);
                for (let i = 0; i < keys.length; i += 1) {
                    const found = walk(node[keys[i]]);
                    if (found) return found;
                }
                return null;
            };

            for (let i = 0; i < dumpRoots.length; i += 1) {
                const found = walk(dumpRoots[i]);
                if (found) return found;
            }
            return idOnlyNode || nameOnlyNode;
        },

        abilityNameToModifierAttribute(abilityName = '') {
            const normalized = String(abilityName || '').trim().toLowerCase();
            if (!normalized || normalized === 'none' || normalized === 'auto' || normalized === 'spell') return '';

            const map = {
                strength: 'strength_mod',
                str: 'strength_mod',
                dexterity: 'dexterity_mod',
                dex: 'dexterity_mod',
                constitution: 'constitution_mod',
                con: 'constitution_mod',
                intelligence: 'intelligence_mod',
                int: 'intelligence_mod',
                wisdom: 'wisdom_mod',
                wis: 'wisdom_mod',
                charisma: 'charisma_mod',
                cha: 'charisma_mod'
            };
            return map[normalized] || '';
        },

        modifierAttributeToFastKey(attributeName = '') {
            const key = this.cleanSheetAttributeReference(attributeName).toLowerCase();
            const map = {
                strength_mod: 'str_mod',
                dexterity_mod: 'dex_mod',
                constitution_mod: 'con_mod',
                intelligence_mod: 'int_mod',
                wisdom_mod: 'wis_mod',
                charisma_mod: 'cha_mod'
            };
            return map[key] || key;
        },

        getFastDetailValue(fastDetails = {}, attributeName = '') {
            const key = this.modifierAttributeToFastKey(attributeName);
            if (!key || !fastDetails || typeof fastDetails !== 'object') return '';
            if (!Object.prototype.hasOwnProperty.call(fastDetails, key)) return '';
            const value = fastDetails[key];
            return value === undefined || value === null ? '' : String(value).trim();
        },

        async getCachedOrResolvedAttributeValue(characterId = '', attributes = [], attributeName = '', fastDetails = {}) {
            const cached = this.getFastDetailValue(fastDetails, attributeName);
            if (cached !== '') return cached;
            return this.getResolvedAttributeValue(characterId, attributes, attributeName);
        },

        isBlankOrZeroModifier(value = '') {
            const raw = String(value || '').trim();
            return !raw || raw === '0' || raw === '+0' || raw === '-0';
        },

        isPositiveFlag(value = '') {
            const raw = String(value || '').trim().toLowerCase();
            if (!raw) return false;
            if (['1', 'true', 'yes', 'y', 'on'].includes(raw)) return true;
            return Utils.toInt(raw, 0) > 0;
        },

        damageTextHasModifier(value = '') {
            return /[+-]\s*\d+/.test(String(value || '').trim());
        },

        appendDamageModifier(base = '', next = '') {
            const rawNext = String(next || '').trim();
            if (this.isBlankOrZeroModifier(rawNext)) return String(base || '').trim();

            const current = String(base || '').trim();
            const normalizedNext = /^[+-]?\d+$/.test(rawNext)
                ? (Utils.toInt(rawNext, 0) >= 0 ? ('+' + String(Utils.toInt(rawNext, 0))) : String(Utils.toInt(rawNext, 0)))
                : rawNext;

            if (!current) return normalizedNext;
            if (normalizedNext.charAt(0) === '-') return current + ' - ' + normalizedNext.slice(1);
            return current + ' + ' + normalizedNext.replace(/^\+/, '');
        },

        async getResolvedAttributeValue(characterId = '', attributes = [], attributeName = '') {
            const attrName = this.cleanSheetAttributeReference(attributeName);
            if (!attrName) return '';

            const directValue = this.getAttributeCurrentByName(attributes, attrName);
            if (directValue) return directValue;

            const sheetValue = String(await R20.getSheet(characterId, attrName) || '').trim();
            return this.isRepeatingLookupError(sheetValue) ? '' : sheetValue;
        },

        async getFirstResolvedAttributeValue(characterId = '', attributes = [], attributeNames = []) {
            const names = Array.isArray(attributeNames) ? attributeNames : [attributeNames];
            for (let i = 0; i < names.length; i += 1) {
                const value = await this.getResolvedAttributeValue(characterId, attributes, names[i]);
                if (String(value || '').trim()) return String(value || '').trim();
            }
            return '';
        },

        modifierValueToNumber(value = '') {
            const raw = String(value || '').trim();
            if (!raw) return 0;
            const match = raw.match(/[+-]?\d+/);
            return match ? Utils.toInt(match[0], 0) : 0;
        },

        formatSignedModifier(value = 0) {
            const numeric = Utils.toInt(value, 0);
            return numeric >= 0 ? ('+' + String(numeric)) : String(numeric);
        },

        applyAttackSaveMeta(entry = {}, attackNode = null) {
            if (!entry) return;
            const saveMeta = this.extractBuilderSaveMeta(attackNode);
            [
                ['saveFlag', 'saveflag'],
                ['saveFlag', 'saveFlag'],
                ['saveAttr', 'saveattr'],
                ['saveAttr', 'saveAttr']
            ].forEach(([entryKey, nodeKey]) => {
                if (attackNode && !entry[entryKey] && attackNode[nodeKey] !== undefined) {
                    entry[entryKey] = String(attackNode[nodeKey] || '').trim();
                }
            });
            if (!entry.saveFlag && saveMeta.saveFlag) entry.saveFlag = saveMeta.saveFlag;
            if (!entry.saveAttr && saveMeta.saveAttr) entry.saveAttr = saveMeta.saveAttr;
            if (!this.isPositiveFlag(entry.saveFlag)) entry.saveAttr = '';
        },

        buildAttackDebugEntry(entry = {}, data = {}) {
            const attackNode = data.attackNode || null;
            return {
                rowKey: String(entry.rowKey || ''),
                id: String(entry.attackId || entry.id || ''),
                name: String(entry.attackName || entry.name || ''),
                atkAttrBase: String(data.atkAttrBase || ''),
                saveFlag: String(entry.saveFlag || ''),
                saveAttr: String(entry.saveAttr || ''),
                atkProfFlag: String(entry.atkProfFlag || ''),
                dumpNodeFound: attackNode ? '1' : '0',
                dumpShortId: attackNode ? String(attackNode.shortID || attackNode.shortId || '') : '',
                dumpName: attackNode ? String(attackNode.name || '') : '',
                dumpRecordName: attackNode ? String(attackNode.recordName || '') : '',
                abilityBonus: String(data.builderAbility || ''),
                abilityModAttr: String(data.abilityModAttr || ''),
                abilityMod: String(data.abilityMod || ''),
                dmgBase: String(entry.dmgBase || ''),
                dmgModRaw: String(data.dmgModRaw || ''),
                resolvedDmgMod: String(data.resolvedDmgMod || ''),
                finalDmgMod: String(entry.dmgMod || ''),
                proficiencyBonus: String(data.proficiencyBonus || ''),
                attackBonus: String(entry.attackBonus || ''),
                saveAbilityModAttr: String(data.saveAbilityModAttr || ''),
                saveAbilityMod: String(data.saveAbilityMod || ''),
                saveDc: String(entry.saveDc || '')
            };
        },

        async resolveAttackDamageModifiers(entries = [], attributes = [], dumpRoots = [], characterId = '', fastDetails = {}) {
            if (!Array.isArray(entries) || !entries.length) return entries;

            for (let i = 0; i < entries.length; i += 1) {
                const entry = entries[i];
                if (!entry) continue;

                const dmgModRaw = String(entry.dmgMod || '').trim();
                const atkAttrBaseRaw = String(entry.atkAttrBase || '').trim();
                const dmgModAttrName = this.cleanSheetAttributeReference(dmgModRaw);
                const atkAttrName = this.cleanSheetAttributeReference(atkAttrBaseRaw);
                const isSpellAttack = atkAttrName.toLowerCase() === 'spell';
                const shouldResolveDmgMod = dmgModAttrName && /^[A-Za-z_][A-Za-z0-9_ -]*$/.test(dmgModAttrName);
                const attackNode = this.findAttackNodeInDumpRoots(dumpRoots, entry);
                this.applyAttackSaveMeta(entry, attackNode);

                const isSaveAttack = this.isPositiveFlag(entry.saveFlag);
                const shouldUseAttackAbility = !isSpellAttack && !isSaveAttack;
                const builderAbility = shouldUseAttackAbility ? this.extractBuilderAttackAbility(attackNode) : '';
                const builderAbilityModAttr = this.abilityNameToModifierAttribute(builderAbility);
                const atkAbilityModAttr = shouldUseAttackAbility ? (this.abilityNameToModifierAttribute(atkAttrName) || atkAttrName) : '';
                const abilityModAttr = builderAbilityModAttr || atkAbilityModAttr;
                const saveAbilityModAttr = isSaveAttack ? this.abilityNameToModifierAttribute(entry.saveAttr) : '';

                const resolvedDmgMod = shouldResolveDmgMod
                    ? await this.getCachedOrResolvedAttributeValue(characterId, attributes, dmgModAttrName, fastDetails)
                    : '';
                const resolvedBuilderAbilityMod = builderAbilityModAttr
                    ? await this.getCachedOrResolvedAttributeValue(characterId, attributes, builderAbilityModAttr, fastDetails)
                    : '';
                const resolvedAtkMod = (!resolvedBuilderAbilityMod && shouldUseAttackAbility && atkAbilityModAttr)
                    ? await this.getCachedOrResolvedAttributeValue(characterId, attributes, atkAbilityModAttr, fastDetails)
                    : '';
                const abilityMod = resolvedBuilderAbilityMod || resolvedAtkMod;
                const saveAbilityMod = saveAbilityModAttr
                    ? await this.getCachedOrResolvedAttributeValue(characterId, attributes, saveAbilityModAttr, fastDetails)
                    : '';

                let combinedMod = '';
                if (resolvedDmgMod) {
                    combinedMod = this.appendDamageModifier(combinedMod, resolvedDmgMod);
                } else if (!shouldResolveDmgMod && !this.isBlankOrZeroModifier(dmgModRaw)) {
                    combinedMod = this.appendDamageModifier(combinedMod, dmgModRaw);
                }

                if (shouldUseAttackAbility && dmgModAttrName.toLowerCase() !== String(abilityModAttr || '').toLowerCase()) {
                    combinedMod = this.appendDamageModifier(combinedMod, abilityMod);
                }
                entry.dmgMod = this.damageTextHasModifier(entry.dmgBase) ? '' : combinedMod;

                const proficiencyBonus = (shouldUseAttackAbility && this.isPositiveFlag(entry.atkProfFlag))
                    ? (this.getFastDetailValue(fastDetails, 'pb') || await this.getFirstResolvedAttributeValue(characterId, attributes, ['pb', 'proficiency_bonus', 'prof_bonus']))
                    : '';
                const saveProficiencyBonus = isSaveAttack
                    ? (this.getFastDetailValue(fastDetails, 'pb') || await this.getFirstResolvedAttributeValue(characterId, attributes, ['pb', 'proficiency_bonus', 'prof_bonus']))
                    : '';
                const attackBonusValue = this.modifierValueToNumber(abilityMod) + this.modifierValueToNumber(proficiencyBonus);
                if (abilityMod || proficiencyBonus) entry.attackBonus = this.formatSignedModifier(attackBonusValue);
                if (isSaveAttack) {
                    entry.saveDc = String(8 + this.modifierValueToNumber(saveAbilityMod) + this.modifierValueToNumber(saveProficiencyBonus));
                }
                if (builderAbility) entry.abilityModSource = builderAbility;
                entry.__debug = this.buildAttackDebugEntry(entry, {
                    attackNode,
                    atkAttrBase: atkAttrBaseRaw,
                    builderAbility,
                    abilityModAttr,
                    abilityMod,
                    dmgModRaw,
                    resolvedDmgMod,
                    proficiencyBonus: isSaveAttack ? saveProficiencyBonus : proficiencyBonus,
                    saveAbilityModAttr,
                    saveAbilityMod
                });
            }

            return entries;
        },

        async resolveSpellModifiers(entries = [], attributes = [], dumpRoots = [], characterId = '', fastDetails = {}) {
            if (!Array.isArray(entries) || !entries.length) return entries;

            const characterClass = String((fastDetails && fastDetails.class) || this.getAttributeCurrentByName(attributes, 'class') || '').trim();
            const race = String((fastDetails && fastDetails.race) || this.getAttributeCurrentByName(attributes, 'race') || '').trim();
            const proficiencyBonus = this.getFastDetailValue(fastDetails, 'pb') ||
                await this.getFirstResolvedAttributeValue(characterId, attributes, ['pb', 'proficiency_bonus', 'prof_bonus']);

            for (let i = 0; i < entries.length; i += 1) {
                const entry = entries[i];
                if (!entry) continue;

                const spellDamageType = this.normalizeLookupText(entry.spellDamageType || '');
                const spellcastingAbility = this.resolveSpellOriginAbility({
                    spellClass: entry.spellClass,
                    characterClass,
                    race,
                    dumpRoots,
                    fastDetails
                });
                const spellcastingModAttr = this.abilityNameToModifierAttribute(spellcastingAbility);
                const spellcastingMod = spellcastingModAttr
                    ? await this.getCachedOrResolvedAttributeValue(characterId, attributes, spellcastingModAttr, fastDetails)
                    : '';

                entry.spellcastingAbility = spellcastingAbility;
                entry.spellcastingMod = spellcastingMod;

                if (spellDamageType === 'spell attack') {
                    entry.spellSave = '';
                    entry.spellSaveDc = '';
                    entry.spellAttackBonus = this.formatSignedModifier(
                        this.modifierValueToNumber(proficiencyBonus) + this.modifierValueToNumber(spellcastingMod)
                    );
                } else if (spellDamageType === 'spell save') {
                    const saveAbility = this.canonicalAbilityName(entry.spellSave);
                    entry.spellSave = saveAbility || String(entry.spellSave || '').trim();
                    entry.spellAttackBonus = '';
                    entry.spellSaveDc = String(8 + this.modifierValueToNumber(proficiencyBonus) + this.modifierValueToNumber(spellcastingMod));
                } else {
                    entry.spellDamage = '';
                    entry.spellSave = '';
                    entry.spellAttackBonus = '';
                    entry.spellSaveDc = '';
                }

                entry.__debug = {
                    rowKey: String(entry.rowKey || ''),
                    id: String(entry.spellId || entry.id || ''),
                    name: String(entry.spellName || entry.name || ''),
                    level: this.normalizeSpellLevel(entry.spellLevel || ''),
                    spellClass: String(entry.spellClass || ''),
                    spellDamageType: String(entry.spellDamageType || ''),
                    spellDamage: String(entry.spellDamage || ''),
                    spellSave: String(entry.spellSave || ''),
                    spellcastingAbility,
                    spellcastingModAttr,
                    spellcastingMod,
                    proficiencyBonus,
                    spellAttackBonus: String(entry.spellAttackBonus || ''),
                    spellSaveDc: String(entry.spellSaveDc || ''),
                    spellDcFormula: spellDamageType === 'spell save' ? '8 + proficiencyBonus + spellcastingMod' : ''
                };
            }

            return entries;
        },

        async getRepeatingSheetValue(characterId = '', prefix = '', rowKey = '', suffixes = []) {
            for (let i = 0; i < suffixes.length; i += 1) {
                const value = String(await R20.getSheet(characterId, prefix + '_' + rowKey + '_' + suffixes[i]) || '').trim();
                if (this.isRepeatingLookupError(value)) return '';
                if (value) return value;
            }
            return '';
        },

        async getRepeatingEntries(characterId = '', type = '', options = {}) {
            const config = this.getRepeatingConfig(type);
            if (!config) return [];

            const attributes = Array.isArray(options.attributes) ? options.attributes : this.getCharacterAttributes(characterId);
            const sharedDumpRoots = Array.isArray(options.dumpRoots) ? options.dumpRoots : this.getCharacterSheetDumpRoots(attributes);
            const dumpRoots = type === 'attack' ? sharedDumpRoots : [];
            const spellDumpRoots = type === 'spell' ? sharedDumpRoots : [];
            const fastDetails = options.fastDetails && typeof options.fastDetails === 'object' ? options.fastDetails : {};
            const byName = {};
            const idByRow = {};
            const extraByRow = {};
            const nameRegex = new RegExp('^' + config.prefix + '_(.+)_' + config.nameSuffix + '$');
            const idRegex = new RegExp('^' + config.prefix + '_(.+)_' + config.idSuffix + '$');
            const extraFields = config.extraFields || {};
            const extraKeys = Object.keys(extraFields);

            for (let i = 0; i < attributes.length; i += 1) {
                const attr = attributes[i];
                const attrName = String(attr.get('name') || '').trim();
                let match = attrName.match(nameRegex);
                if (match) {
                    const rowKey = String(match[1] || '').trim();
                    if (rowKey) byName[rowKey] = this.getAttributeCurrent(attr);
                    continue;
                }

                match = attrName.match(idRegex);
                if (match) {
                    const rowKey = String(match[1] || '').trim();
                    if (rowKey) idByRow[rowKey] = this.getAttributeCurrent(attr);
                    continue;
                }

                for (let x = 0; x < extraKeys.length; x += 1) {
                    const key = extraKeys[x];
                    const suffixes = this.getRepeatingFieldSuffixes(extraFields[key]);
                    for (let s = 0; s < suffixes.length; s += 1) {
                        const extraRegex = new RegExp('^' + config.prefix + '_(.+)_' + suffixes[s] + '$');
                        match = attrName.match(extraRegex);
                        if (!match) continue;
                        const rowKey = String(match[1] || '').trim();
                        if (!rowKey) continue;
                        extraByRow[rowKey] = extraByRow[rowKey] || {};
                        extraByRow[rowKey][key] = this.getAttributeCurrent(attr);
                        break;
                    }
                }
            }

            const entries = Object.keys(byName)
                .map((rowKey) => {
                    const id = String(idByRow[rowKey] || rowKey).trim();
                    const name = String(byName[rowKey] || id || config.fallbackName).trim();
                    const entry = { rowKey };
                    entry[config.idKey] = id;
                    entry[config.nameKey] = name;
                    const extra = extraByRow[rowKey] || {};
                    for (let x = 0; x < extraKeys.length; x += 1) {
                        const key = extraKeys[x];
                        const suffixes = this.getRepeatingFieldSuffixes(extraFields[key]);
                        entry[key] = String(extra[key] || this.getRepeatingFieldValueBySuffixes(attributes, config.prefix, rowKey, suffixes) || '').trim();
                    }
                    return entry;
                })
                .filter((entry) => entry[config.idKey] && entry[config.nameKey])
                .filter((entry) => type !== 'attack' || String(entry.atkAttrBase || '').trim().toLowerCase() !== 'spell')
                .sort((a, b) => type === 'spell'
                    ? (this.spellLevelSortValue(a.spellLevel) - this.spellLevelSortValue(b.spellLevel) ||
                        String(a[config.nameKey] || '').localeCompare(String(b[config.nameKey] || '')))
                    : String(a[config.nameKey] || '').localeCompare(String(b[config.nameKey] || '')));

            if (entries.length) {
                if (type === 'attack') await this.resolveAttackDamageModifiers(entries, attributes, dumpRoots, characterId, fastDetails);
                if (type === 'spell') await this.resolveSpellModifiers(entries, attributes, spellDumpRoots, characterId, fastDetails);
                return entries;
            }

            const indexedEntries = [];
            for (let index = 0; index < 50; index += 1) {
                const rowKey = '$' + String(index);
                const name = String(await R20.getSheet(characterId, config.prefix + '_' + rowKey + '_' + config.nameSuffix) || '').trim();
                const id = String(await R20.getSheet(characterId, config.prefix + '_' + rowKey + '_' + config.idSuffix) || '').trim();
                if (this.isRepeatingLookupError(name) || this.isRepeatingLookupError(id)) break;
                if (!name && !id) continue;

                const entry = { rowKey };
                entry[config.idKey] = id || rowKey;
                entry[config.nameKey] = name || id || (config.fallbackName + ' ' + String(index + 1));
                for (let x = 0; x < extraKeys.length; x += 1) {
                    const key = extraKeys[x];
                    if (type === 'attack' && key === 'saveAttr' && !this.isPositiveFlag(entry.saveFlag)) {
                        entry[key] = '';
                        continue;
                    }
                    if (type === 'spell') {
                        const spellDamageType = this.normalizeLookupText(entry.spellDamageType || '');
                        if (key === 'spellDamage' && spellDamageType !== 'spell attack' && spellDamageType !== 'spell save') {
                            entry[key] = '';
                            continue;
                        }
                        if (key === 'spellSave' && spellDamageType !== 'spell save') {
                            entry[key] = '';
                            continue;
                        }
                    }
                    const suffixes = this.getRepeatingFieldSuffixes(extraFields[key]);
                    entry[key] = await this.getRepeatingSheetValue(characterId, config.prefix, rowKey, suffixes);
                }
                indexedEntries.push(entry);
            }

            const filteredIndexedEntries = indexedEntries
                .filter((entry) => type !== 'attack' || String(entry.atkAttrBase || '').trim().toLowerCase() !== 'spell');
            if (type === 'attack') await this.resolveAttackDamageModifiers(filteredIndexedEntries, attributes, dumpRoots, characterId, fastDetails);
            if (type === 'spell') {
                await this.resolveSpellModifiers(filteredIndexedEntries, attributes, spellDumpRoots, characterId, fastDetails);
                filteredIndexedEntries.sort((a, b) =>
                    this.spellLevelSortValue(a.spellLevel) - this.spellLevelSortValue(b.spellLevel) ||
                    String(a[config.nameKey] || '').localeCompare(String(b[config.nameKey] || ''))
                );
            }
            return filteredIndexedEntries;
        },

        async getRepeatingAttacks(characterId = '', options = {}) {
            return this.getRepeatingEntries(characterId, 'attack', options);
        },

        async getRepeatingSpells(characterId = '', options = {}) {
            return this.getRepeatingEntries(characterId, 'spell', options);
        },

        async buildAttackMacro(characterId = '', tokenId = '') {
            const safeCharacterId = String(characterId || '').trim();
            const safeTokenId = String(tokenId || '').trim();
            const attacks = await this.getRepeatingAttacks(safeCharacterId);
            if (!safeCharacterId || !safeTokenId || !attacks.length) return '';

            const options = attacks.map((attack) => {
                const label = this.macroQuerySafeText(attack.attackName || attack.attackId);
                const attackId = this.macroQuerySafeText(attack.attackId);
                const action = this.buildAttackAction(safeCharacterId, attackId, { encodeForQuery: true });
                return label + ',' + action;
            });

            return '?{Attack|' + options.join('|') + '}';
        },

        getCharacterAbilities(characterId = '') {
            const safeCharacterId = String(characterId || '').trim();
            if (!safeCharacterId) return [];
            return findObjs({
                _type: 'ability',
                _characterid: safeCharacterId
            }) || [];
        },

        findCharacterAbility(characterId = '', abilityName = '') {
            const key = String(abilityName || '').trim().toLowerCase();
            if (!key) return null;
            const abilities = this.getCharacterAbilities(characterId);
            return abilities.find((ability) => String(ability.get('name') || '').trim().toLowerCase() === key) || null;
        },

        removeObject(object) {
            if (!object || !Utils.isFunction(object.remove)) return false;
            object.remove();
            return true;
        },

        clearManagedAbilities(characterId = '') {
            const safeCharacterId = String(characterId || '').trim();
            const names = this.managedAbilityNames.map((name) => String(name || '').trim().toLowerCase());
            const abilities = this.getCharacterAbilities(safeCharacterId);
            const removed = [];

            for (let i = 0; i < abilities.length; i += 1) {
                const ability = abilities[i];
                const name = String(ability.get('name') || '').trim();
                if (!names.includes(name.toLowerCase())) continue;
                if (this.removeObject(ability)) removed.push(name);
            }

            return removed;
        },

        clearCharacterSetup(characterId = '') {
            const safeCharacterId = String(characterId || '').trim();
            if (!safeCharacterId) return { ok: false, message: 'Character is required.' };

            const removedAbilities = this.clearManagedAbilities(safeCharacterId);
            return {
                ok: true,
                removedAbilities,
                abilityCount: removedAbilities.length,
            };
        },

        upsertCharacterAbility(characterId = '', ability = {}) {
            const safeCharacterId = String(characterId || '').trim();
            const name = String(ability.name || '').trim();
            const action = String(ability.action || '');
            if (!safeCharacterId || !name || !action) {
                return { ok: false, action: 'skipped', name, message: 'Missing character, ability name, or action.' };
            }

            const existing = this.findCharacterAbility(safeCharacterId, name);
            if (existing) {
                existing.set({
                    action,
                    istokenaction: true
                });
                return { ok: true, action: 'updated', name, ability: existing };
            }

            const created = createObj('ability', {
                characterid: safeCharacterId,
                name,
                action,
                istokenaction: true
            });
            return { ok: !!created, action: created ? 'created' : 'failed', name, ability: created };
        },

        async initCharacterAbilities(characterId = '', tokenId = '') {
            const safeCharacterId = String(characterId || '').trim();
            if (!safeCharacterId) return { ok: false, message: 'Character is required.' };

            const abilities = await this.getInitAbilities(safeCharacterId, tokenId);
            const results = abilities.map((ability) => this.upsertCharacterAbility(safeCharacterId, ability));
            const failed = results.filter((result) => !result.ok);
            return {
                ok: !failed.length,
                results,
                failed,
                created: results.filter((result) => result.action === 'created').length,
                updated: results.filter((result) => result.action === 'updated').length
            };
        }
    };

    /** -----------------------------------------------------------------------
     * @section Command Handlers
     * --------------------------------------------------------------------- */
    const Handlers = {
        actionList(actions = []) {
            const displayActions = (Array.isArray(actions) ? actions : [])
                .map((action) => String(action || '').trim())
                .filter(Boolean)
                .map((action) => (action.toLowerCase() === 'rawlist' ? 'rawList' : action));
            return '{' + displayActions.join('|') + '}';
        },

        getCommandDescription(command = {}, isGM = false) {
            const name = String(command.name || '').trim().toLowerCase();
            if (name === 'inventory') {
                return isGM
                    ? 'Inventory: !tntInventory {get|remove|add|give|use|discard}.'
                    : 'Inventory: !tntInventory {get|remove|give|use|discard}.';
            }
            if (name === 'shop') {
                return isGM
                    ? 'Shop: !tntShop {list|get|buy|menu|detail|export|create|delete|add|remove|open|close|hide|blacklist|config|load|reload}.'
                    : 'Shop: !tntShop {list|get|buy}.';
            }
            if (name === 'item') {
                return isGM
                    ? 'Item Catalog: !tntItem {list|rawList|search|details|create|remove|reload}.'
                    : 'Item Catalog: !tntItem {search|details}.';
            }
            if (name === 'token') {
                return isGM
                    ? 'Token: !tntToken {init|clear|attacks|refreshattacks|refreshspells}.'
                    : 'Token: !tntToken {attacks|refreshattacks|refreshspells}.';
            }
            return String(command.description || '');
        },

        sendShopUsage(who = 'GM', isGM = false) {
            const actions = isGM
                ? PUBLIC_ACTIONS.SHOP.concat(GM_ACTIONS.SHOP)
                : PUBLIC_ACTIONS.SHOP.slice();
            const examples = isGM
                ? '<br>Examples: <b>!tntShop menu</b> | <b>!tntShop get shopId</b> | <b>!tntShop buy shopId buyerTokenId itemName qty</b>'
                : '<br>Examples: <b>!tntShop list</b> | <b>!tntShop get shopId</b> | <b>!tntShop buy shopId buyerTokenId itemName qty</b>';
            Render.sendWhisperMessage(
                who,
                'Command Usage',
                'Use: <b>!tntShop ' + Handlers.actionList(actions) + ' ...</b>' + examples,
                'warning'
            );
        },

        sendItemUsage(who = 'GM', isGM = false) {
            const actions = isGM
                ? PUBLIC_ACTIONS.ITEM.concat(GM_ACTIONS.ITEM)
                : PUBLIC_ACTIONS.ITEM.slice();
            Render.sendWhisperMessage(
                who,
                'Command Usage',
                'Use: <b>!tntItem ' + Handlers.actionList(actions) + ' ...</b>',
                'warning'
            );
        },

        async help(ctx) {
            const isGM = !!ctx.isGM;
            const commands = Array.from(new Set([...Registry.commands.values()]))
                .filter((cmd) => isGM || !cmd.gmOnly);
            const body = commands.map((cmd) => {
                return Html.div(
                    '<b>' + Utils.escapeHtml(cmd.trigger[0] || cmd.name) + '</b> - ' + Utils.escapeHtml(Handlers.getCommandDescription(cmd, isGM)),
                    'padding:4px 0;'
                );
            }).join('');

            R20.whisper(ctx.who, Html.card({ title: 'T&T Commands', body }));
        },

        async token(ctx) {
            const who = ctx.who || 'GM';
            const action = String((ctx.args && ctx.args[0]) || '').trim().toLowerCase();

            if (!ACTIONS.TOKEN.includes(action)) {
                Render.sendWhisperMessage(
                    who,
                    'Command Usage',
                    ctx.isGM ? 'Use: <b>!tntToken {init|clear|attacks|refreshattacks|refreshspells}</b>' : 'Use: <b>!tntToken {attacks|refreshattacks|refreshspells}</b>',
                    'warning'
                );
                return;
            }

            if (action === 'roll') {
                const rollType = String((ctx.args && ctx.args[1]) || '').trim().toLowerCase();
                const characterId = String((ctx.args && ctx.args[2]) || '').trim();
                const actionId = TokenService.cleanRepeatingActionId((ctx.args && ctx.args[3]) || '');
                const spellLevel = TokenService.normalizeSpellLevel((ctx.args && ctx.args[4]) || '');
                const character = characterId ? getObj('character', characterId) : null;

                if (!character || !actionId || (rollType !== 'attack' && rollType !== 'spell')) {
                    Render.sendWhisperMessage(
                        who,
                        'Token Action',
                        'Invalid token action request.',
                        'failure'
                    );
                    return;
                }

                const access = R20.getCharacterAccessFlags(character, ctx.playerId, ctx.isGM);
                if (!access.hasAccess) {
                    Render.sendWhisperMessage(
                        who,
                        'Access Denied',
                        'You need both journal and control access to this character.',
                        'failure'
                    );
                    return;
                }

                const macro = rollType === 'attack'
                    ? '%{' + characterId + '|repeating_attack("' + actionId + '", "attack")}'
                    : '%{' + characterId + '|repeating_spell-' + spellLevel + '("' + actionId + '", "spell")}';
                R20.send(macro);
                return;
            }

            if ((action === 'init' || action === 'clear') && !ctx.isGM) {
                Render.sendWhisperMessage(who, 'GM Command', 'Only a GM can initialize or clear token setup.', 'failure');
                return;
            }

            if (action === 'attacks') {
                const token = R20.getSelectedToken(ctx.msg);
                const accessResult = R20.requireSourceTokenAccess({
                    sourceTokenId: token && token.id,
                    playerId: ctx.playerId,
                    isGM: ctx.isGM,
                    actionLabel: 'view attacks from'
                });

                if (!accessResult.ok) {
                    R20.sendSourceAccessFailure(who, 'Token Attacks', accessResult);
                    return;
                }

                const character = accessResult.access.character;
                const characterName = String(character.get('name') || accessResult.access.tokenName || 'Character');
                const rawAttackList = await R20.getSheet(character.id, 'user.T&T_attack_list');
                const attacks = await TokenService.getStoredAttacks(character.id);
                const spells = await TokenService.getStoredSpells(character.id);
                if (!String(rawAttackList || '').trim() && !attacks.length && !spells.length) {
                    Render.sendWhisperMessage(
                        who,
                        'Token Attacks',
                        'No attacks or spells were found for <b>' + Utils.escapeHtml(characterName) + '</b>.',
                        'warning'
                    );
                    return;
                }

                const renderOptions = {
                    title: characterName + ' Actions',
                    tokenName: accessResult.access.tokenName || characterName,
                    characterId: character.id,
                    tokenId: accessResult.access.token.id,
                    tokenRef: R20.makeTokenRef(accessResult.access.token),
                    rawAttributeName: 'user.T&T_attack_list',
                    rawAttributeValue: rawAttackList
                };
                const attackCard = Render.showTokenAttackList(attacks, renderOptions);
                const spellCard = Render.showTokenSpellList(spells, renderOptions);
                if (attackCard) R20.whisper(who, attackCard);
                if (spellCard) R20.whisper(who, spellCard);
                return;
            }

            if (action === 'refreshattacks') {
                const selectedToken = R20.getSelectedToken(ctx.msg);
                const tokenRef = String((ctx.args && ctx.args[1]) || '').trim();
                const sourceTokenId = tokenRef || (selectedToken && selectedToken.id);
                const accessResult = R20.requireSourceTokenAccess({
                    sourceTokenId,
                    playerId: ctx.playerId,
                    isGM: ctx.isGM,
                    actionLabel: 'refresh attacks from'
                });

                if (!accessResult.ok) {
                    R20.sendSourceAccessFailure(who, 'T&T Refresh Attacks', accessResult);
                    return;
                }

                const character = accessResult.access.character;
                const tokenName = String(accessResult.access.tokenName || character.get('name') || 'Character');
                Render.sendWhisperMessage(who, 'T&T Refresh Attacks', 'This may take a few seconds.', 'success');

                const attributes = TokenService.getCharacterAttributes(character.id);
                const dumpRoots = TokenService.getCharacterSheetDumpRoots(attributes);
                const fastDetails = await TokenService.buildFastDetails(character.id, attributes, dumpRoots);
                const attacks = await TokenService.getRepeatingAttacks(character.id, {
                    attributes,
                    dumpRoots,
                    fastDetails
                });
                const result = await TokenService.updateAttackListAttribute(character.id, attacks);
                if (!result || !result.ok) {
                    Render.sendWhisperMessage(
                        who,
                        'T&T Refresh Attacks',
                        Utils.escapeHtml((result && result.message) || 'Unable to update attack list.'),
                        'failure'
                    );
                    return;
                }

                const attackCard = Render.showTokenAttackList(attacks, {
                    title: tokenName + ' Actions',
                    tokenName,
                    characterId: character.id,
                    tokenId: accessResult.access.token.id,
                    tokenRef: R20.makeTokenRef(accessResult.access.token)
                });
                if (attackCard) {
                    R20.whisper(who, attackCard);
                    return;
                }

                Render.sendWhisperMessage(
                    who,
                    'T&T Refresh Attacks',
                    'No attacks were found for <b>' + Utils.escapeHtml(tokenName) + '</b>.',
                    'warning'
                );
                return;
            }

            if (action === 'refreshspells') {
                const selectedToken = R20.getSelectedToken(ctx.msg);
                const tokenRef = String((ctx.args && ctx.args[1]) || '').trim();
                const sourceTokenId = tokenRef || (selectedToken && selectedToken.id);
                const accessResult = R20.requireSourceTokenAccess({
                    sourceTokenId,
                    playerId: ctx.playerId,
                    isGM: ctx.isGM,
                    actionLabel: 'refresh spells from'
                });

                if (!accessResult.ok) {
                    R20.sendSourceAccessFailure(who, 'T&T Refresh Spells', accessResult);
                    return;
                }

                const character = accessResult.access.character;
                const tokenName = String(accessResult.access.tokenName || character.get('name') || 'Character');
                Render.sendWhisperMessage(who, 'T&T Refresh Spells', 'This may take a few seconds.', 'success');

                const attributes = TokenService.getCharacterAttributes(character.id);
                const dumpRoots = TokenService.getCharacterSheetDumpRoots(attributes);
                const fastDetails = await TokenService.buildFastDetails(character.id, attributes, dumpRoots);
                const spells = await TokenService.getRepeatingSpells(character.id, {
                    attributes,
                    dumpRoots,
                    fastDetails
                });
                const listResult = await TokenService.updateSpellListAttribute(character.id, spells);
                const dumpResult = await TokenService.updateSpellDumpAttribute(character.id, dumpRoots, spells);
                if (!listResult || !listResult.ok || !dumpResult || !dumpResult.ok) {
                    Render.sendWhisperMessage(
                        who,
                        'T&T Refresh Spells',
                        Utils.escapeHtml((listResult && listResult.message) || (dumpResult && dumpResult.message) || 'Unable to update spell list.'),
                        'failure'
                    );
                    return;
                }

                const spellCard = Render.showTokenSpellList(spells, {
                    title: tokenName + ' Actions',
                    tokenName,
                    characterId: character.id,
                    tokenId: accessResult.access.token.id,
                    tokenRef: R20.makeTokenRef(accessResult.access.token)
                });
                if (spellCard) {
                    R20.whisper(who, spellCard);
                    return;
                }

                Render.sendWhisperMessage(
                    who,
                    'T&T Refresh Spells',
                    'No spells were found for <b>' + Utils.escapeHtml(tokenName) + '</b>.',
                    'warning'
                );
                return;
            }

            if (action === 'init') {
                const token = R20.getSelectedToken(ctx.msg);
                const character = R20.getCharacterFromToken(token);
                if (!token || !character) {
                    Render.sendWhisperMessage(who, 'Token Setup', 'Select a token linked to a character.', 'warning');
                    return;
                }

                const rawTokenName = String(token.get('name') || character.get('name') || 'Character');
                const characterName = Utils.escapeHtml(String(character.get('name') || rawTokenName));
                Render.sendWhisperMessage(
                    'GM',
                    'T&T Token Initialization',
                    'Preparing ' +
                    Html.span(Utils.escapeHtml(rawTokenName), 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:700;') +
                    '\'s Trinkets and Trackers.' +
                    '<div>This may take a few seconds.</div>',
                    'success'
                );
                const result = await TokenService.initCharacterAbilities(character.id, token.id);
                if (!result.ok) {
                    Render.sendWhisperMessage(
                        who,
                        'Token Setup',
                        'Unable to initialize token macros for <b>' + characterName + '</b>.',
                        'failure'
                    );
                    return;
                }

                const setupAttributes = TokenService.getCharacterAttributes(character.id);
                const setupDumpRoots = TokenService.getCharacterSheetDumpRoots(setupAttributes);
                const fastDetails = await TokenService.buildFastDetails(character.id, setupAttributes, setupDumpRoots);
                const attacks = await TokenService.getRepeatingAttacks(character.id, {
                    attributes: setupAttributes,
                    dumpRoots: setupDumpRoots,
                    fastDetails
                });
                const spells = await TokenService.getRepeatingSpells(character.id, {
                    attributes: setupAttributes,
                    dumpRoots: setupDumpRoots,
                    fastDetails
                });
                const attributeResults = [
                    await TokenService.updateFastDetailsAttribute(character.id, fastDetails),
                    await TokenService.updateAttackListAttribute(character.id, attacks),
                    await TokenService.updateSpellListAttribute(character.id, spells),
                    await TokenService.updateSpellDumpAttribute(character.id, setupDumpRoots, spells)
                ];

                const abilityList = result.results
                    .map((entry) => Utils.escapeHtml(entry.name) + ' <span style="color:rgb(165,165,165);">(' + Utils.escapeHtml(entry.action) + ')</span>')
                    .join('<br>');
                const attributeSet = attributeResults.filter((entry) => entry && entry.ok).length;
                const attributeFailed = attributeResults.filter((entry) => !entry || !entry.ok).length;
                const attributeList = attributeResults
                    .map((entry) => {
                        const status = (entry && entry.ok) ? entry.action : 'failed';
                        const name = (entry && entry.name) ? entry.name : 'unknown';
                        const message = entry && entry.message ? (': ' + String(entry.message)) : '';
                        return Utils.escapeHtml(name) + ' <span style="color:rgb(165,165,165);">(' + Utils.escapeHtml(status + message) + ')</span>';
                    })
                    .join('<br>');
                Render.sendWhisperMessage(
                    who,
                    'Token Setup',
                    'T&T Setup for <b>' + characterName + '</b>.<br>' +
                    'Created: <b>' + Utils.escapeHtml(String(result.created)) + '</b> | Updated: <b>' + Utils.escapeHtml(String(result.updated)) + '</b><br><br>' +
                    abilityList +
                    '<br><br><b>Attributes</b><br>' +
                    'Set: <b>' + Utils.escapeHtml(String(attributeSet)) + '</b> | Failed: <b>' + Utils.escapeHtml(String(attributeFailed)) + '</b><br><br>' +
                    attributeList,
                    'success'
                );
                return;
            }

            if (action === 'clear') {
                const token = R20.getSelectedToken(ctx.msg);
                const character = R20.getCharacterFromToken(token);
                if (!token || !character) {
                    Render.sendWhisperMessage(who, 'Token Setup', 'Select a token linked to a character.', 'warning');
                    return;
                }

                const characterName = Utils.escapeHtml(String(character.get('name') || token.get('name') || 'Character'));
                const result = TokenService.clearCharacterSetup(character.id);
                if (!result.ok) {
                    Render.sendWhisperMessage(
                        who,
                        'Token Setup',
                        Utils.escapeHtml(result.message || 'Unable to clear token setup.'),
                        'failure'
                    );
                    return;
                }

                Render.sendWhisperMessage(
                    who,
                    'Token Setup Cleared',
                    'Cleared T&T for <b>' + Html.span(characterName, 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';') + '</b>.' +
                    '<div>' + 'Macros removed: <b>' + Utils.escapeHtml(String(result.abilityCount)) + '</b>.</div>',
                    'success'
                );
            }
        },

        async attributes(ctx){
            const who = ctx.who || 'GM';
            const token = R20.getSelectedToken(ctx.msg);
            const character = R20.getCharacterFromToken(token);
            const tokenName = token ? (token.get('name') || token.id) : 'N/A';

            if (!token || !character) {
                Render.sendWhisperMessage(
                    who,
                    'No Token Selected',
                    'Select a token linked to a character.',
                    'warning'
                );
                return;
            }

            const actionIndex = ctx.args.findIndex(arg => /^(get|set)$/i.test(arg));

            if (actionIndex === -1) {
                Render.sendWhisperMessage(
                    who,
                    'Command Usage',
                    'Use: !tntAttr get &lt;attribute_name&gt;<br>or: !tntAttr set &lt;attribute_name&gt; &lt;value&gt;',
                    'warning'
                );
                return;
            }

            const action = Utils.asString(ctx.args[actionIndex]).trim().toLowerCase();
            const attributeName = Utils.asString(ctx.args[actionIndex + 1]).trim();

            if (!attributeName || attributeName.startsWith('--')) {
                Render.sendWhisperMessage(
                    who,
                    'Command Incomplete',
                    'Write an attribute name after get/set.',
                    'warning'
                );
                return;
            }

            let newValue = 0;
            if (action === 'set') {
                newValue = Utils.asString(ctx.args.slice(actionIndex + 2).join(' ')).trim();

                if (newValue === '') {
                    Render.sendWhisperMessage(
                        who,
                        'Command Incomplete',
                        'Write a value after the attribute name.',
                        'warning'
                    );
                    return;
                }

                await R20.setSheet(character.id, attributeName, newValue);
            }

            const rawAttributeValue = await R20.getSheet(character.id, attributeName);
            const attributeValue = Utils.asString(rawAttributeValue);
            const displayValue = attributeValue === '' ? 'undefined' : attributeValue;

            const cardType = (action === 'set') ?
                (newValue === displayValue ? 'success' : 'failure') :
                (rawAttributeValue !== undefined ? 'success' : 'failure');

            Render.sendWhisperMessage(
                who,
                (action === 'set') ? 'Updating Token Attribute' : 'Reading Token Attribute',
                Html.span(Utils.escapeHtml(tokenName), 'color:' + TAG_COLOR.DEFAULT_SOURCE_PLAYER_COLOR + ';') + '\'s ' +
                Html.span(Utils.escapeHtml(attributeName).toUpperCase(), 'color:' + TAG_COLOR.DEFAULT_ATTRIBUTE_NAME_COLOR + ';') + ' is ' +
                Html.span(Utils.escapeHtml(displayValue), 'color:' + TAG_COLOR.DEFAULT_ATTRIBUTE_VALUE_COLOR + ';'),
                cardType
            );
        },

        async inventory(ctx) {
            const who = ctx.who || 'GM';
            const rawArgs = Array.isArray(ctx.args) ? ctx.args : [];
            const lowerArgs = rawArgs.map((arg) => String(arg || '').trim().toLowerCase()).filter(Boolean);
            const firstArg = lowerArgs[0] || '';
            const action = ACTIONS.INVENTORY.includes(firstArg) ? firstArg : 'get';
            const token = R20.getSelectedToken(ctx.msg);
            const character = R20.getCharacterFromToken(token);

            if (action !== 'give' && action !== 'use' && action !== 'discard' && (!token || !character)) {
                Render.sendWhisperMessage(who, 'No Token Selected', 'Select a token linked to a character.', 'warning');
                return;
            }

            if (action === 'get' || action === 'remove') {
                const accessResult = R20.requireSourceTokenAccess({
                    sourceTokenId: token && token.id,
                    playerId: ctx.playerId,
                    isGM: ctx.isGM,
                    actionLabel: action === 'get' ? 'view inventory from' : 'remove items from'
                });
                if (!accessResult.ok) {
                    R20.sendSourceAccessFailure(who, 'Inventory Access', accessResult);
                    return;
                }
            }

            const showInventory = async (characterObj = character, sourceTokenObj = token) => {
                if (!characterObj) return;
                const items = await InventoryService.getSheetInventory(characterObj.id);
                if (!items.length) {
                    Render.sendWhisperMessage(
                        who,
                        'Inventory',
                        'No items found.',
                        'warning'
                    );
                    return;
                }

                const cpRaw = await R20.getSheet(characterObj.id, 'cp');
                const spRaw = await R20.getSheet(characterObj.id, 'sp');
                const gpRaw = await R20.getSheet(characterObj.id, 'gp');
                const sourceTokenRef = R20.makeTokenRef(sourceTokenObj);

                const tokenDisplayName = Utils.asString(
                    (sourceTokenObj && sourceTokenObj.get('name')) ||
                    characterObj.get('name') ||
                    'Character'
                );
                const walletHtml = Render.buildInventoryWalletRow({
                    cp: cpRaw,
                    sp: spRaw,
                    gp: gpRaw,
                    sourceTokenId: sourceTokenRef
                });

                R20.whisper(who, Render.showItemsList(items, {
                    title: tokenDisplayName + ' Inventory',
                    walletHtml: walletHtml,
                    menuType: 'inventory',
                    sourceTokenId: sourceTokenRef
                }));
            };

            if (action === 'get') {
                await showInventory();
                return;
            }

            if (action === 'remove') {
                const parsedRemove = Utils.splitArgsAndQty(rawArgs.slice(1), 1);
                const removeArgs = parsedRemove.args;
                const qty = parsedRemove.qty;

                const renderTitle = 'Item Removed';
                const itemName = removeArgs.join(' ').trim();
                if (!itemName) {
                    Render.sendWhisperMessage(
                        who,
                        'Command Usage',
                        'Use: <b>!tntInventory remove itemName qty</b><br>Example: <b>!tntInventory remove Handaxe 2</b>',
                        'warning'
                    );
                    return;
                }

                const removeResult = await InventoryService.removeInventoryItem(character.id, itemName, qty);
                if (!removeResult.ok) {
                    Render.sendWhisperMessage(
                        who,
                        renderTitle,
                        Utils.escapeHtml(removeResult.message || 'Unable to remove item.'),
                        'failure'
                    );
                    return;
                }

                Render.sendWhisperMessage(
                    who,
                    renderTitle,
                    'Removed <b>' + Utils.escapeHtml(String(removeResult.removed)) + '</b> x <b>' + Utils.escapeHtml(String(removeResult.itemName || itemName)) + '</b>.',
                    'success'
                );
                Logger.debug(
                    '[Inventory:remove]',
                    'item="' + Utils.asString(removeResult.itemName || itemName) + '"',
                    'removed=' + Utils.asString(removeResult.removed),
                    'removedChildren=' + Utils.asString(removeResult.removedChildren || 0),
                    'actor="' + Utils.asString(who) + '"'
                );
                await showInventory();
                return;
            }

            if (action === 'discard') {
                const discardArgs = rawArgs.slice(1);
                if (discardArgs.length < 2) {
                    Render.sendWhisperMessage(
                        who,
                        'Command Usage',
                        'Use: <b>!tntInventory discard sourceTokenId itemName qty</b><br>Example: <b>!tntInventory discard -SRC- Potion of Healing 1</b>',
                        'warning'
                    );
                    return;
                }

                const sourceTokenId = String(discardArgs[0] || '').trim();
                const parsedDiscard = Utils.splitArgsAndQty(discardArgs.slice(1), 1);
                const qty = parsedDiscard.qty;
                const itemName = parsedDiscard.args.join(' ').trim();
                if (!sourceTokenId || !itemName) {
                    Render.sendWhisperMessage(who, 'Item Discarded', 'Missing source token or item name.', 'failure');
                    return;
                }

                const accessResult = R20.requireSourceTokenAccess({
                    sourceTokenId,
                    playerId: ctx.playerId,
                    isGM: ctx.isGM,
                    actionLabel: 'discard items from'
                });
                if (!accessResult.ok) {
                    R20.sendSourceAccessFailure(who, 'Inventory Access', accessResult);
                    return;
                }

                const removeResult = await InventoryService.removeInventoryItem(accessResult.access.character.id, itemName, qty);
                if (!removeResult.ok) {
                    Render.sendWhisperMessage(
                        who,
                        'Item Discarded',
                        Utils.escapeHtml(removeResult.message || 'Unable to discard item.'),
                        'failure'
                    );
                    return;
                }

                Render.sendWhisperMessage(
                    who,
                    'Item Discarded',
                    'Discarded <b>' + Utils.escapeHtml(String(removeResult.removed)) + '</b> x <b>' + Utils.escapeHtml(String(removeResult.itemName || itemName)) + '</b>.',
                    'success'
                );
                Logger.debug(
                    '[Inventory:discard]',
                    'item="' + Utils.asString(removeResult.itemName || itemName) + '"',
                    'removed=' + Utils.asString(removeResult.removed),
                    'removedChildren=' + Utils.asString(removeResult.removedChildren || 0),
                    'actor="' + Utils.asString(who) + '"'
                );
                await showInventory(accessResult.access.character, accessResult.access.token);
                return;
            }

            if (action === 'add') {
                if (!ctx.isGM) {
                    Render.sendWhisperMessage(who, 'GM Command', 'Only a GM can use !tntInventory add.', 'failure');
                    return;
                }

                const renderTitle = 'Item Added';
                const parsedAdd = Utils.splitArgsAndQty(rawArgs.slice(1), 1);
                const addArgs = parsedAdd.args;
                const qty = parsedAdd.qty;

                const itemName = addArgs.join(' ').trim();
                if (!itemName) {
                    Render.sendWhisperMessage(
                        who,
                        'Command Usage',
                        'Use: <b>!tntInventory add itemName qty</b><br>Example: <b>!tntInventory add Potion of Healing 2</b>',
                        'warning'
                    );
                    return;
                }

                const addResult = await InventoryService.addInventoryItem(character.id, itemName, qty);
                if (!addResult.ok) {
                    Render.sendWhisperMessage(
                        who,
                        renderTitle,
                        Utils.escapeHtml(addResult.message || 'Unable to add item.'),
                        'failure'
                    );
                    return;
                }

                Render.sendWhisperMessage(
                    who,
                    renderTitle,
                    'Added <b>' + Utils.escapeHtml(String(addResult.added)) + '</b> x <b>' + Utils.escapeHtml(String(addResult.itemName || itemName)) + '</b>.',
                    'success'
                );
                Logger.debug(
                    '[Inventory:add]',
                    'item="' + Utils.asString(addResult.itemName || itemName) + '"',
                    'added=' + Utils.asString(addResult.added),
                    'templateChildrenCloned=' + Utils.asString(addResult.templateChildrenCloned || 0),
                    'actor="' + Utils.asString(who) + '"'
                );
                await showInventory();
                return;
            }

            if (action === 'give') {
                const giveArgs = rawArgs.slice(1);
                if (giveArgs.length < 3) {
                    Render.sendWhisperMessage(
                        who,
                        'Command Usage',
                        'Use: <b>!tntInventory give sourceTokenId targetTokenId itemName qty</b><br>Example: <b>!tntInventory give -SRC- @{target|token_id} Potion of Healing 1</b>',
                        'warning'
                    );
                    return;
                }

                const renderTitle = 'Item Transfer';
                const sourceTokenId = String(giveArgs[0] || '').trim();
                const targetTokenId = String(giveArgs[1] || '').trim();
                let qty = 1;
                const maybeQty = InventoryService.toIntOrNull(giveArgs[giveArgs.length - 1]);
                if (maybeQty !== null) qty = Math.max(1, maybeQty);

                const itemName = (maybeQty !== null ? giveArgs.slice(2, -1) : giveArgs.slice(2)).join(' ').trim();

                if (!sourceTokenId || !targetTokenId || !itemName) {
                    Render.sendWhisperMessage(who, renderTitle, 'Missing source token, target token, or item name.', 'failure');
                    return;
                }

                const sourceAccessResult = R20.requireSourceTokenAccess({
                    sourceTokenId: sourceTokenId,
                    playerId: ctx.playerId,
                    isGM: ctx.isGM,
                    actionLabel: 'transfer items from'
                });

                if (!sourceAccessResult.ok) {
                    R20.sendSourceAccessFailure(who, renderTitle, sourceAccessResult);
                    return;
                }

                const transferResult = await InventoryService.transferItem({
                    sourceTokenId,
                    targetTokenId,
                    itemName,
                    quantity: qty,
                    playerId: ctx.playerId,
                    isGM: ctx.isGM,
                    maxDistanceFt: CONFIG.INVENTORY_TRANSFER_MAX_DISTANCE_FT
                });

                if (!transferResult.ok) {
                    Render.sendWhisperMessage(
                        who,
                        renderTitle,
                        transferResult.message || 'Unable to transfer item.',
                        'failure'
                    );
                    return;
                }

                const sourceContext = R20.getTokenContext(sourceTokenId, sourceTokenId);
                const targetContext = R20.getTokenContext(targetTokenId, targetTokenId);

                const sourceRecipients = Utils.uniqueNames(
                    sourceContext.controllerNames.length ? sourceContext.controllerNames : [who]
                );
                const targetRecipients = Utils.uniqueNames(targetContext.controllerNames);

                const narrativePayload = {
                    sourceName: sourceContext.tokenName,
                    targetName: targetContext.tokenName,
                    qty: transferResult.transferred,
                    itemName: transferResult.itemName || itemName
                };

                const gmNarrative = Render.buildInventoryGiveNarrative('gm', narrativePayload);
                const sourceNarrative = Render.buildInventoryGiveNarrative('source', narrativePayload);
                const targetNarrative = Render.buildInventoryGiveNarrative('target', narrativePayload);

                Render.sendWhisperMessage('GM', renderTitle, gmNarrative);

                const sent = {};
                for (let i = 0; i < sourceRecipients.length; i += 1) {
                    const recipient = sourceRecipients[i];
                    const key = String(recipient || '').trim().toLowerCase();
                    if (!key || key === 'gm' || sent[key]) continue;
                    sent[key] = true;
                    Render.sendWhisperMessage(recipient, renderTitle, sourceNarrative);
                }

                for (let i = 0; i < targetRecipients.length; i += 1) {
                    const recipient = targetRecipients[i];
                    const key = String(recipient || '').trim().toLowerCase();
                    if (!key || key === 'gm' || sent[key]) continue;
                    sent[key] = true;
                    Render.sendWhisperMessage(recipient, renderTitle, targetNarrative);
                }
                return;
            }

            if (action === 'use') {
                const useArgs = rawArgs.slice(1);
                if (useArgs.length < 3) {
                    Render.sendWhisperMessage(
                        who,
                        'Command Usage',
                        'Use: <b>!tntInventory use sourceTokenId targetTokenId itemName</b><br>Example: <b>!tntInventory use -SRC- @{target|token_id} Potion of Healing</b>',
                        'warning'
                    );
                    return;
                }

                const renderTitle = 'Item Used';
                let sourceTokenId = String(useArgs[0] || '').trim();
                const targetTokenId = String(useArgs[1] || '').trim();
                const itemName = useArgs.slice(2).join(' ').trim();
                if (!sourceTokenId || !targetTokenId || !itemName) {
                    Render.sendWhisperMessage(who, renderTitle, 'Missing source token, target token, or item name.', 'failure');
                    return;
                }

                const sourceResolved = R20.resolveTokenRef(sourceTokenId);
                const targetResolved = R20.resolveTokenRef(targetTokenId);
                if (!sourceResolved.token && targetResolved.token) {
                    sourceTokenId = targetTokenId;
                }

                const useResult = await InventoryService.useInventoryItem({
                    sourceTokenId,
                    targetTokenId,
                    itemName,
                    playerId: ctx.playerId,
                    isGM: ctx.isGM
                });

                if (!useResult.ok) {
                    Render.sendWhisperMessage(
                        who,
                        renderTitle,
                        useResult.message || 'Unable to use item.',
                        'failure'
                    );
                    return;
                }

                const sourceContext = R20.getTokenContext(sourceTokenId, sourceTokenId);
                const targetContext = R20.getTokenContext(targetTokenId, targetTokenId);
                const isSelfTarget = !!(
                    (sourceContext.characterId && targetContext.characterId && sourceContext.characterId === targetContext.characterId) ||
                    (sourceContext.tokenId && targetContext.tokenId && sourceContext.tokenId === targetContext.tokenId)
                );
                const globalNarrative = Render.buildInventoryUseNarrative({
                    sourceName: sourceContext.tokenName,
                    targetName: targetContext.tokenName,
                    qty: 1,
                    itemName: useResult.itemName || itemName,
                    itemDescription: useResult.itemDescription || '',
                    narrativeType: useResult.effectResult && useResult.effectResult.narrativeType,
                    narrativeValue: useResult.effectResult && useResult.effectResult.narrativeValue,
                    rollData: useResult.effectResult && useResult.effectResult.roll,
                    effect: useResult.effect,
                    isSelf: isSelfTarget
                });
                Render.sendPublicMessage(renderTitle, globalNarrative);

                const itemColor = CONFIG.DEFAULT_TEXT_ITEM_COLOR || 'rgb(84, 186, 255)';
                const usedLine = (useResult.isConsumable)
                    ? ('You used 1 ' + Html.span(Utils.escapeHtml(String(useResult.itemName || itemName)), 'color:' + itemColor + ';font-weight:700;') + ' and have ' + Html.span(Utils.escapeHtml(String(useResult.remaining)), 'color:' + CONFIG.DEFAULT_TEXT_QUANTITY_COLOR + ';font-weight:700;') + ' left.')
                    : ('You used a ' + Html.span(Utils.escapeHtml(String(useResult.itemName || itemName)), 'color:' + itemColor + ';font-weight:700;') + '.');
                Render.sendWhisperMessage(who, renderTitle, usedLine);

                if (useResult.isConsumable) {
                    const leftLine =
                        Utils.escapeHtml(sourceContext.tokenName) +
                        ' has ' +
                        Html.span(Utils.escapeHtml(String(useResult.remaining)), 'color:' + CONFIG.DEFAULT_TEXT_QUANTITY_COLOR + ';font-weight:700;') +
                        ' ' +
                        Html.span(Utils.escapeHtml(String(useResult.itemName || itemName)), 'color:' + itemColor + ';font-weight:700;') +
                        ' left.';
                    Render.sendWhisperMessage('GM', renderTitle, leftLine);
                }

                /*const sourceTokenObj = R20.getTokenById(sourceTokenId);
                const sourceCharacterObj = R20.getCharacterFromToken(sourceTokenObj);
                if (sourceCharacterObj) {
                    await showInventory(sourceCharacterObj, sourceTokenObj);
                }*/
                return;
            }

            if (action === 'buy') {
                Render.sendWhisperMessage(who, 'Inventory', 'Use <b>!tntShop buy shopId buyerTokenId itemName qty</b> for shop purchases.', 'warning');
                return;
            }
        },

        async currency(ctx) {
            const who = ctx.who || 'GM';
            const args = Array.isArray(ctx.args) ? ctx.args : [];
            const action = String(args[0] || '').trim().toLowerCase();
            const sourceTokenId = String(args[1] || '').trim();
            const targetTokenId = String(args[2] || '').trim();
            const currencyType = String(args[3] || '').trim().toLowerCase();
            const qty = Math.max(1, InventoryService.toIntOrNull(args[4]) || 0);

            if (args.length < 5 || !action || !sourceTokenId || !targetTokenId || !currencyType || !qty) {
                Render.sendWhisperMessage(
                    who,
                    'Command Usage',
                    'Use: <b>!tntCurrency {give|take} sourceTokenId targetTokenId {cp|sp|gp} qty</b><br>Example: <b>!tntCurrency give -SRC- @{target|token_id} gp 10</b>',
                    'warning'
                );
                return;
            }

            if (!ACTIONS.CURRENCY.includes(action)) {
                Render.sendWhisperMessage(who, 'Currency', 'Invalid action. Use give or take.', 'failure');
                return;
            }

            if (!CurrencyService.normalizeType(currencyType)) {
                Render.sendWhisperMessage(who, 'Currency', 'Invalid currency type. Use CP, SP, or GP.', 'failure');
                return;
            }

            const result = await CurrencyService.transferCurrency({
                action,
                sourceTokenId,
                targetTokenId,
                currencyType,
                quantity: qty,
                playerId: ctx.playerId,
                isGM: ctx.isGM,
                maxDistanceFt: CONFIG.INVENTORY_TRANSFER_MAX_DISTANCE_FT
            });

            if (!result.ok) {
                Render.sendWhisperMessage(
                    who,
                    'Currency Transfer',
                    String(result.message || 'Unable to transfer currency.'),
                    'failure'
                );

                if (result.sourceAccess && !result.sourceAccess.hasAccess) {
                    Render.sendWhisperMessage(
                        'GM',
                        'Currency Transfer',
                        Html.span(Utils.escapeHtml(who), 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:700;') +
                        ' attempted to transfer ' +
                        Html.span(Utils.escapeHtml(String(qty)), 'color:' + CONFIG.DEFAULT_TEXT_QUANTITY_COLOR + ';font-weight:700;') +
                        ' ' +
                        Html.span(Utils.escapeHtml(String(currencyType).toUpperCase()), 'color:' + CONFIG.DEFAULT_TEXT_ITEM_COLOR + ';font-weight:700;') +
                        ' from ' +
                        Html.span(Utils.escapeHtml(result.sourceAccess.tokenName || sourceTokenId), 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:700;') +
                        '.<br>' +
                        'Journal access: <b>' + (result.sourceAccess.journalAccess ? 'true' : 'false') + '</b> | ' +
                        'Control access: <b>' + (result.sourceAccess.controlAccess ? 'true' : 'false') + '</b>.',
                        'warning'
                    );
                }
                return;
            }

            const transferQtyText = String(result.transferred || qty);
            const qtyText = Utils.escapeHtml(transferQtyText);
            const qtyLabel = Html.span(qtyText, 'color:' + CONFIG.DEFAULT_TEXT_QUANTITY_COLOR + ';font-weight:700;');
            const debitName = Html.span(Utils.escapeHtml(String(result.debit.tokenName || 'Source')), 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:700;');
            const creditName = Html.span(Utils.escapeHtml(String(result.credit.tokenName || 'Target')), 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:700;');
            const coinLabel = Utils.escapeHtml(String(result.currencyType || currencyType).toUpperCase());
            const balanceBody =
                debitName + ': <b>' + Utils.escapeHtml(String(result.debit.after)) + '</b> ' + coinLabel +
                ' | ' +
                creditName + ': <b>' + Utils.escapeHtml(String(result.credit.after)) + '</b> ' + coinLabel + '.';

            const gmLine = (action === 'take')
                ? (creditName + ' took ' + qtyLabel + ' ' + coinLabel + ' from ' + debitName + '.')
                : (debitName + ' gave ' + qtyLabel + ' ' + coinLabel + ' to ' + creditName + '.');

            const sourceContext = R20.getTokenContext(sourceTokenId, sourceTokenId);
            const targetContext = R20.getTokenContext(targetTokenId, targetTokenId);
            const sourceName = Utils.escapeHtml(String(sourceContext.tokenName || sourceTokenId));
            const targetName = Utils.escapeHtml(String(targetContext.tokenName || targetTokenId));
            const characterColor = CONFIG.DEFAULT_TEXT_CHARACTER_COLOR || 'rgb(211, 194, 12)';
            const resolvedCurrencyType = String(result.currencyType || currencyType).trim().toLowerCase();
            const sourceNameHtml = Html.span(sourceName, 'color:' + characterColor + ';font-weight:700;');
            const targetNameHtml = Html.span(targetName, 'color:' + characterColor + ';font-weight:700;');
            const amountHtml = Render.currencyAmountHtml(transferQtyText, resolvedCurrencyType);

            const sourceLine = (action === 'take')
                ? ('You took ' + amountHtml + ' from ' + targetNameHtml + '.')
                : ('You gave ' + amountHtml + ' to ' + targetNameHtml + '.');

            const targetLine = (action === 'take')
                ? (sourceNameHtml + ' took ' + amountHtml + ' from you.')
                : (sourceNameHtml + ' gave you ' + amountHtml + '.');

            Render.sendWhisperMessage('GM', 'Currency Transfer', gmLine + '<br>' + balanceBody, 'normal');

            const sourceRecipients = Utils.uniqueNames(
                sourceContext.controllerNames.length ? sourceContext.controllerNames : [who]
            );
            const targetRecipients = Utils.uniqueNames(targetContext.controllerNames);
            const sent = {};

            for (let i = 0; i < sourceRecipients.length; i += 1) {
                const recipient = sourceRecipients[i];
                const key = String(recipient || '').trim().toLowerCase();
                if (!key || key === 'gm' || sent[key]) continue;
                sent[key] = true;
                Render.sendWhisperMessage(recipient, 'Currency Transfer', sourceLine, 'success');
            }

            for (let i = 0; i < targetRecipients.length; i += 1) {
                const recipient = targetRecipients[i];
                const key = String(recipient || '').trim().toLowerCase();
                if (!key || key === 'gm' || sent[key]) continue;
                sent[key] = true;
                Render.sendWhisperMessage(recipient, 'Currency Transfer', targetLine, 'success');
            }
        },

        async item(ctx) {
            const who = ctx.who || 'GM';
            const args = Array.isArray(ctx.args) ? ctx.args : [];
            const rawAction = String(args[0] || '').trim();
            const action = rawAction.toLowerCase();
            const gmActions = ['list', 'rawlist', 'create', 'remove', 'reload'];

            if (!ACTIONS.ITEM.includes(action)) {
                Handlers.sendItemUsage(who, ctx.isGM);
                return;
            }

            if (gmActions.includes(action) && !ctx.isGM) {
                Render.sendWhisperMessage(
                    who,
                    'GM Command',
                    'Only a GM can manage the item catalog.<br>Player actions: <b>!tntItem search</b>.',
                    'failure'
                );
                return;
            }

            if (action === 'reload') {
                try {
                    const items = await InventoryService.loadItemCatalogFromHandout();
                    Render.sendWhisperMessage(
                        who,
                        'Item Catalog',
                        'Reloaded <b>' + Utils.escapeHtml(String(items.length)) + '</b> items from <b>' + Utils.escapeHtml(ItemCatalog.handoutRef) + '</b>.',
                        'success'
                    );
                } catch (error) {
                    Render.sendWhisperMessage(who, 'Item Catalog', Utils.escapeHtml(error.message || String(error)), 'failure');
                }
                return;
            }

            if (action === 'rawlist') {
                R20.whisper(who, Render.showItemCatalog(ItemCatalog.getAll(), {
                    title: 'Item Catalog',
                    grouped: false
                }));
                return;
            }

            if (action === 'list') {
                R20.whisper(who, Render.showItemCatalog(ItemCatalog.getAll(), {
                    title: 'Item Catalog',
                    grouped: true
                }));
                return;
            }

            if (action === 'search') {
                let query = args.slice(1).join(' ').trim();
                if (!query) query = '?{Item Search|}';

                if (query.indexOf('?{') >= 0) {
                    R20.whisper(who, Html.card({
                        title: 'Item Search',
                        body:
                            '<div style="text-align:center;">' +
                                Render.inRowButtonHtml({
                                    text: 'Search',
                                    width: 54,
                                    height: 18,
                                    fontSize: 11,
                                    textColor: 'rgb(255,255,255)',
                                    backgroundColor: 'rgba(0,86,115,0.95)',
                                    borderColor: 'rgba(255,255,255,0.55)',
                                    callback: '!tntItem search &#63;{Item Search|}'
                                }) +
                            '</div>'
                    }));
                    return;
                }

                const results = ItemService.search(query);
                R20.whisper(who, Render.showItemCatalog(results, {
                    title: 'Item Search: ' + query,
                    grouped: false
                }));
                return;
            }

            if (action === 'details') {
                const itemName = args.slice(1).join(' ').trim();
                if (!itemName) {
                    Render.sendWhisperMessage(who, 'Item Details', 'Use: <b>!tntItem details itemName</b>.', 'warning');
                    return;
                }

                const item = ItemService.getByExactName(itemName);
                if (!item) {
                    Render.sendWhisperMessage(who, 'Item Details', 'Item was not found in catalog.', 'failure');
                    return;
                }

                R20.whisper(who, Render.showItemDetails(item));
                return;
            }

            if (action === 'remove') {
                let itemName = args.slice(1).join(' ').trim();
                if (!itemName) {
                    R20.whisper(who, Html.card({
                        title: 'Remove Item',
                        body:
                            '<div style="text-align:center;">' +
                                Render.inRowButtonHtml({
                                    text: 'Remove',
                                    width: 62,
                                    height: 18,
                                    fontSize: 11,
                                    textColor: 'rgb(255,255,255)',
                                    backgroundColor: 'rgba(150,20,20,0.92)',
                                    borderColor: 'rgba(255,255,255,0.55)',
                                    callback: '!tntItem remove &#63;{Exact Item Name|}'
                                }) +
                            '</div>'
                    }));
                    return;
                }

                const result = await ItemService.removeByName(itemName);
                Render.sendWhisperMessage(
                    who,
                    'Item Catalog',
                    result.ok
                        ? ('Removed <b>' + Utils.escapeHtml(result.itemName) + '</b>. Catalog now has <b>' + Utils.escapeHtml(String(result.total)) + '</b> items.')
                        : Utils.escapeHtml(result.message || 'Unable to remove item.'),
                    result.ok ? 'success' : 'failure'
                );
                return;
            }

            if (action === 'create') {
                const mode = String(args[1] || '').trim().toLowerCase();

                if (mode === 'set') {
                    const field = String(args[2] || '').trim();
                    const value = args.slice(3).join(' ').trim();
                    const result = ItemService.setDraftField(ctx, field, value);
                    if (!result.ok) {
                        Render.sendWhisperMessage(who, 'Item Draft', Utils.escapeHtml(result.message || 'Unable to update draft.'), 'failure');
                        return;
                    }
                    R20.whisper(who, Render.showItemCreateDraft(result.draft));
                    return;
                }

                if (mode === 'toggle') {
                    const field = String(args[2] || '').trim();
                    const result = ItemService.toggleDraftField(ctx, field);
                    if (!result.ok) {
                        Render.sendWhisperMessage(who, 'Item Draft', Utils.escapeHtml(result.message || 'Unable to update draft.'), 'failure');
                        return;
                    }
                    R20.whisper(who, Render.showItemCreateDraft(result.draft));
                    return;
                }

                if (mode === 'reset') {
                    R20.whisper(who, Render.showItemCreateDraft(ItemService.getDraft(ctx, { reset: true })));
                    return;
                }

                if (mode === 'cancel') {
                    ItemService.clearDraft(ctx);
                    Render.sendWhisperMessage(who, 'Item Draft', 'Draft cancelled.', 'warning');
                    return;
                }

                if (mode === 'save') {
                    const result = await ItemService.createFromDraft(ctx);
                    if (!result.ok) {
                        Render.sendWhisperMessage(who, 'Item Draft', Utils.escapeHtml(result.message || 'Unable to create item.'), 'failure');
                        R20.whisper(who, Render.showItemCreateDraft(ItemService.getDraft(ctx)));
                        return;
                    }
                    Render.sendWhisperMessage(
                        who,
                        'Item Catalog',
                        'Created <b>' + Utils.escapeHtml(result.item.name) + '</b>. Catalog now has <b>' + Utils.escapeHtml(String(result.total)) + '</b> items.',
                        'success'
                    );
                    return;
                }

                R20.whisper(who, Render.showItemCreateDraft(ItemService.getDraft(ctx)));
                return;
            }
        },

        async shop(ctx) {
            const who = ctx.who || 'GM';
            const args = Array.isArray(ctx.args) ? ctx.args : [];
            const action = ShopService.normalizeAction(args[0] || '');
            const selectedToken = R20.getSelectedToken(ctx.msg);
            const selectedTokenId = selectedToken && selectedToken.id ? selectedToken.id : '';
            const gmActions = GM_ACTIONS.SHOP;

            if (!action) {
                Handlers.sendShopUsage(who, ctx.isGM);
                return;
            }

            if (gmActions.includes(action) && !ctx.isGM) {
                Render.sendWhisperMessage(
                    who,
                    'GM Command',
                    'Only a GM can manage shops.<br>Player actions: <b>!tntShop ' + Handlers.actionList(PUBLIC_ACTIONS.SHOP) + ' ...</b>',
                    'failure'
                );
                return;
            }

            const parseTrailingQty = (rawParts = [], defaultQty = 1) => {
                const parts = Array.isArray(rawParts) ? rawParts.slice() : [];
                let qty = Math.max(1, InventoryService.toIntOrNull(defaultQty) || 1);
                const maybeQtyText = String(parts[parts.length - 1] || '').trim();
                const maybeQty = /^\d+$/.test(maybeQtyText) ? InventoryService.toIntOrNull(maybeQtyText) : null;
                if (maybeQty !== null) {
                    qty = Math.max(1, maybeQty);
                    parts.pop();
                }
                return { parts, qty };
            };

            if (action === 'list') {
                const shops = ShopService.listShops({ includeHidden: ctx.isGM });
                const body = shops.length
                    ? shops.map((shop) => {
                        const button = shop.isOpen() ?
                            Render.inRowButtonHtml({
                                text: 'VISIT',
                                textColor: 'rgb(255,255,255)',
                                backgroundColor: 'rgba(0, 86, 115, 0.9)',
                                borderColor: 'rgb(255,255,255)',
                                width: 40,
                                height: 15,
                                callback: '!tntShop get ' + shop.id
                            }) :
                            Render.inRowButtonHtml({
                                text: 'CLOSE',
                                textColor: 'rgb(255,255,255)',
                                backgroundColor: 'rgba(200, 0, 0, 0.9)',
                                borderColor: 'rgb(255,255,255)',
                                width: 40,
                                height: 15,
                            });
                        return (
                            '<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin:2px 0;">' +
                                '<tr>' +
                                    '<td style="padding:0px 1px 0px 0;text-align:left;vertical-align:middle;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">' +
                                        '<b>' + Utils.escapeHtml(shop.name) + '</b>' +
                                    '</td>' +
                                    '<td style="padding:5px 0 0px 4px;text-align:right;vertical-align:middle;white-space:nowrap;width:48px;">' +
                                        button +
                                    '</td>' +
                                '</tr>' +
                            '</table>'
                        );
                    }).join('')
                    : 'No shops found.';
                Render.sendWhisperMessage(who, 'Shops', body, shops.length ? 'normal' : 'warning');
                return;
            }

            if (action === 'menu') {
                const shops = ShopService.listShops({ includeHidden: true });
                R20.whisper(who, Render.showShopAdminMenu(shops));
                return;
            }

            if (action === 'detail') {
                const result = ShopService.getShop(args[1] || '');
                if (!result.ok) {
                    Render.sendWhisperMessage(who, 'Shop Manager', Utils.escapeHtml(result.message || 'Shop was not found.'), 'failure');
                    return;
                }
                R20.whisper(who, Render.showShopDetail(result.shop));
                return;
            }

            if (action === 'reload') {
                try {
                    const shops = await ShopService.loadShopCatalogFromHandout();
                    Render.sendWhisperMessage(
                        who,
                        'Shop Catalog',
                        'Loaded <b>' + Utils.escapeHtml(String(shops.length)) + '</b> shops from <b>' + Utils.escapeHtml(ShopCatalog.handoutRef) + '</b>.',
                        'success'
                    );
                } catch (error) {
                    Render.sendWhisperMessage(who, 'Shop Catalog', Utils.escapeHtml(error.message || String(error)), 'failure');
                }
                return;
            }

            if (action === 'load') {
                if (!ShopCatalog.getAll().length) {
                    try {
                        await ShopService.loadShopCatalogFromHandout();
                    } catch (error) {
                        Render.sendWhisperMessage(who, 'Shop Catalog', Utils.escapeHtml(error.message || String(error)), 'failure');
                        return;
                    }
                }

                const shopId = String(args[1] || '').trim();
                const overwrite = Utils.toBoolean(args[2], false);
                const result = shopId
                    ? ShopService.importShopFromCatalog(shopId, { overwrite })
                    : ShopService.importAllFromCatalog({ overwrite });

                if (shopId) {
                    Render.sendWhisperMessage(
                        who,
                        'Shop Catalog',
                        result.ok
                            ? ('Imported <b>' + Utils.escapeHtml(result.shop.name) + '</b> into live shop state.')
                            : Utils.escapeHtml(result.message || 'Unable to import shop.'),
                        result.ok ? 'success' : 'failure'
                    );
                    return;
                }

                Render.sendWhisperMessage(
                    who,
                    'Shop Catalog',
                    'Imported <b>' + Utils.escapeHtml(String(result.imported.length)) + '</b> shops. Skipped <b>' + Utils.escapeHtml(String(result.skipped.length)) + '</b>.',
                    result.skipped.length ? 'warning' : 'success'
                );
                return;
            }

            if (action === 'export') {
                try {
                    const result = await ShopService.exportShopToHandout(args[1] || '');
                    Render.sendWhisperMessage(
                        who,
                        'Shop Export',
                        result.ok
                            ? ((result.created ? 'Added ' : 'Updated ') + '<b>' + Utils.escapeHtml(result.shop.name) + '</b> in <b>' + Utils.escapeHtml(result.handoutRef) + '</b>.')
                            : Utils.escapeHtml(result.message || 'Unable to export shop.'),
                        result.ok ? 'success' : 'failure'
                    );
                } catch (error) {
                    Render.sendWhisperMessage(who, 'Shop Export', Utils.escapeHtml(error.message || String(error)), 'failure');
                }
                return;
            }

            if (action === 'create') {
                const shopId = String(args[1] || '').trim();
                const name = args.slice(2).join(' ').trim() || shopId;
                const result = ShopService.createShop({
                    id: shopId,
                    name,
                    state: 'close',
                    hidePrice: false,
                    hasStock: true,
                    location: []
                });
                Render.sendWhisperMessage(
                    who,
                    'Shop Created',
                    result.ok
                        ? ('Created <b>' + Utils.escapeHtml(result.shop.name) + '</b> with ID <b>' + Utils.escapeHtml(result.shop.id) + '</b>.')
                        : Utils.escapeHtml(result.message || 'Unable to create shop.'),
                    result.ok ? 'success' : 'failure'
                );
                return;
            }

            if (action === 'delete') {
                const shopId = String(args[1] || '').trim();
                const confirmation = String(args[2] || 'no').trim().toLowerCase();
                if (confirmation !== 'yes') {
                    R20.whisper(who, Render.showShopAdminMenu(ShopService.listShops({ includeHidden: true })));
                    return;
                }

                const result = ShopService.deleteShop(shopId);
                if (result.ok) {
                    Render.sendWhisperMessage(
                        who,
                        'Shop Removed',
                        'Removed <b>' + Utils.escapeHtml(result.shop.name) + '</b>.',
                        'success'
                    );
                    R20.whisper(who, Render.showShopAdminMenu(ShopService.listShops({ includeHidden: true })));
                } else {
                    Render.sendWhisperMessage(who, 'Shop Removed', Utils.escapeHtml(result.message || 'Unable to remove shop.'), 'failure');
                }
                return;
            }

            if (action === 'toggle') {
                const result = ShopService.toggleOpenClose(args[1] || '');
                if (result.ok && String(args[2] || '').trim().toLowerCase() === 'detail') R20.whisper(who, Render.showShopDetail(result.shop));
                else if (result.ok) R20.whisper(who, Render.showShopAdminMenu(ShopService.listShops({ includeHidden: true })));
                else Render.sendWhisperMessage(who, 'Shop State', Utils.escapeHtml(result.message || 'Unable to update shop state.'), 'failure');
                return;
            }

            if (action === 'reveal') {
                const result = ShopService.toggleHidden(args[1] || '');
                const returnTo = String(args[2] || '').trim().toLowerCase();
                if (result.ok && returnTo === 'menu') R20.whisper(who, Render.showShopAdminMenu(ShopService.listShops({ includeHidden: true })));
                else if (result.ok) R20.whisper(who, Render.showShopDetail(result.shop));
                else Render.sendWhisperMessage(who, 'Shop State', Utils.escapeHtml(result.message || 'Unable to update shop state.'), 'failure');
                return;
            }

            if (action === 'stockmode') {
                const result = ShopService.toggleStockMode(args[1] || '');
                if (result.ok) R20.whisper(who, Render.showShopDetail(result.shop));
                else Render.sendWhisperMessage(who, 'Shop Config', Utils.escapeHtml(result.message || 'Unable to update stock mode.'), 'failure');
                return;
            }

            if (action === 'rollprice') {
                const result = ShopService.clearItemPrices(args[1] || '');
                if (result.ok) R20.whisper(who, Render.showShopDetail(result.shop));
                else Render.sendWhisperMessage(who, 'Shop Prices', Utils.escapeHtml(result.message || 'Unable to clear prices.'), 'failure');
                return;
            }

            if (action === 'price') {
                const shopId = String(args[1] || '').trim();
                const priceType = String(args[args.length - 1] || '').trim();
                const price = Number(args[args.length - 2]);
                const itemName = args.slice(2, -2).join(' ').trim();
                const result = ShopService.setItemPrice(shopId, itemName, price, priceType);
                if (result.ok) R20.whisper(who, Render.showShopDetail(result.shop));
                else Render.sendWhisperMessage(who, 'Shop Price', Utils.escapeHtml(result.message || 'Unable to update price.'), 'failure');
                return;
            }

            if (action === 'stock') {
                const shopId = String(args[1] || '').trim();
                const stock = args[args.length - 1];
                const itemName = args.slice(2, -1).join(' ').trim();
                const result = ShopService.setItemStock(shopId, itemName, stock);
                if (result.ok) R20.whisper(who, Render.showShopDetail(result.shop));
                else Render.sendWhisperMessage(who, 'Shop Stock', Utils.escapeHtml(result.message || 'Unable to update stock.'), 'failure');
                return;
            }

            if (action === 'open' || action === 'close' || action === 'hide') {
                const shopId = String(args[1] || '').trim();
                const state = action === 'open' ? 'open' : (action === 'close' ? 'close' : 'hidden');
                const result = ShopService.setShopState(shopId, state);
                const stateText = result.ok
                    ? (action === 'hide'
                        ? (result.shop.isOpen() ? 'open and hidden' : 'hidden')
                        : result.shop.state)
                    : '';
                Render.sendWhisperMessage(
                    who,
                    'Shop State',
                    result.ok
                        ? ('Shop <b>' + Utils.escapeHtml(result.shop.name) + '</b> is now <b>' + Utils.escapeHtml(stateText) + '</b>.')
                        : Utils.escapeHtml(result.message || 'Unable to update shop state.'),
                    result.ok ? 'success' : 'failure'
                );
                return;
            }

            if (action === 'config') {
                const shopId = String(args[1] || '').trim();
                const key = String(args[2] || '').trim();
                const value = String(args[3] || '').trim();
                const result = ShopService.setConfig(shopId, key, value);
                Render.sendWhisperMessage(
                    who,
                    'Shop Config',
                    result.ok
                        ? ('Updated <b>' + Utils.escapeHtml(key) + '</b> for <b>' + Utils.escapeHtml(result.shop.name) + '</b>.')
                        : Utils.escapeHtml(result.message || 'Unable to update shop config.'),
                    result.ok ? 'success' : 'failure'
                );
                return;
            }

            if (action === 'blacklist') {
                const shopId = String(args[1] || '').trim();
                const mode = String(args[2] || '').trim();
                const identity = ShopService.resolveBlacklistIdentity(args.slice(3).join(' ').trim());
                const result = ShopService.updateBlacklist(shopId, mode, identity);
                if (result.ok) R20.whisper(who, Render.showShopDetail(result.shop));
                else Render.sendWhisperMessage(who, 'Shop Blacklist', Utils.escapeHtml(result.message || 'Unable to update blacklist.'), 'failure');
                return;
            }

            if (action === 'add') {
                const shopId = String(args[1] || '').trim();
                const parts = args.slice(2);
                const returnDetail = String(parts[parts.length - 1] || '').trim().toLowerCase() === '--detail';
                if (returnDetail) parts.pop();

                let equippable = null;
                const maybeEquippableText = String(parts[parts.length - 1] || '').trim().toLowerCase();
                if (['yes', 'yes', 'true', '1', 'on', 'no', 'no', 'false', '0', 'off'].includes(maybeEquippableText)) {
                    equippable = Utils.toBoolean(maybeEquippableText, false);
                    parts.pop();
                }

                let quantity = SHOP_INFINITE_STOCK;
                const maybeQtyText = String(parts[parts.length - 1] || '').trim();
                const maybeQty = /^\d+$/.test(maybeQtyText) ? InventoryService.toIntOrNull(maybeQtyText) : null;
                if (maybeQty !== null) {
                    quantity = Math.max(1, maybeQty);
                    parts.pop();
                }

                let price = null;
                let priceType = '';
                const maybePriceType = String(parts[parts.length - 1] || '').trim().toLowerCase();
                const maybePrice = String(parts[parts.length - 2] || '').trim();
                const hasExplicitPricePair = parts.length >= 2 &&
                    (maybePrice === '-' || InventoryService.toIntOrNull(maybePrice) !== null) &&
                    (maybePriceType === '-' || CurrencyService.normalizeType(maybePriceType));

                if (hasExplicitPricePair) {
                    price = maybePrice === '-' ? null : Math.max(0, InventoryService.toIntOrNull(maybePrice) || 0);
                    priceType = maybePriceType === '-' ? '' : maybePriceType;
                    parts.pop();
                    parts.pop();
                }

                const itemName = parts.join(' ').trim();
                const result = ShopService.addItem({
                    shopId,
                    itemName,
                    quantity,
                    price,
                    priceType,
                    equippable
                });
                if (returnDetail) {
                    if (result.ok) R20.whisper(who, Render.showShopDetail(result.shop));
                    else Render.sendWhisperMessage(who, 'Shop Item', Utils.escapeHtml(result.message || 'Unable to add item to shop.'), 'failure');
                    return;
                }
                Render.sendWhisperMessage(
                    who,
                    'Shop Item',
                    result.ok
                        ? ('Added <b>' + Utils.escapeHtml(result.item.name) + '</b> to <b>' + Utils.escapeHtml(result.shop.name) + '</b>.')
                        : Utils.escapeHtml(result.message || 'Unable to add item to shop.'),
                    result.ok ? 'success' : 'failure'
                );
                return;
            }

            if (action === 'remove') {
                const shopId = String(args[1] || '').trim();
                const returnDetail = String(args[args.length - 1] || '').trim().toLowerCase() === '--detail';
                const itemName = (returnDetail ? args.slice(2, -1) : args.slice(2)).join(' ').trim();
                const result = ShopService.removeItem(shopId, itemName);
                if (returnDetail) {
                    if (result.ok) R20.whisper(who, Render.showShopDetail(result.shop));
                    else Render.sendWhisperMessage(who, 'Shop Item', Utils.escapeHtml(result.message || 'Unable to remove item from shop.'), 'failure');
                    return;
                }
                Render.sendWhisperMessage(
                    who,
                    'Shop Item',
                    result.ok
                        ? ('Removed <b>' + Utils.escapeHtml(String(result.itemName || itemName)) + '</b> from <b>' + Utils.escapeHtml(result.shop.name) + '</b>.')
                        : Utils.escapeHtml(result.message || 'Unable to remove item from shop.'),
                    result.ok ? 'success' : 'failure'
                );
                return;
            }

            if (action === 'get') {
                const shopId = String(args[1] || '').trim();
                const result = ShopService.getShop(shopId);
                if (!result.ok || (result.shop.isHidden() && !ctx.isGM)) {
                    Render.sendWhisperMessage(who, 'Shop', Utils.escapeHtml(result.message || 'Shop was not found.'), 'failure');
                    return;
                }

                const shop = result.shop;
                const shopVisibilityText = shop.state + (shop.isHidden() ? ' | hidden' : '');
                const visibleItems = shop.itemList.filter((item) => !item.hidden);
                R20.whisper(who, Render.showItemsList(visibleItems, {
                    title: shop.name,
                    emptyText: 'No items found in this shop.',
                    menuType: 'shop',
                    shopId: shop.id,
                    buyerTokenId: selectedTokenId,
                    hidePrice: shop.config.hidePrice,
                    hasStock: shop.config.hasStock
                }));
                return;
            }

            if (action === 'buy') {
                const shopId = String(args[1] || '').trim();
                let buyerTokenId = String(args[2] || '').trim();
                let itemParts = args.slice(3);
                if (!R20.getTokenById(buyerTokenId) && selectedTokenId) {
                    buyerTokenId = selectedTokenId;
                    itemParts = args.slice(2);
                }

                const parsed = parseTrailingQty(itemParts, 1);
                const itemName = parsed.parts.join(' ').trim();
                const result = await ShopService.buyItem({
                    shopId,
                    buyerTokenId,
                    itemName,
                    quantity: parsed.qty,
                    playerId: ctx.playerId,
                    who,
                    isGM: ctx.isGM
                });

                if (!result.ok) {
                    Render.sendWhisperMessage(who, 'Shop Purchase', Utils.escapeHtml(result.message || 'Unable to buy item.'), 'failure');
                    return;
                }

                const boughtQtyHtml = Html.span(Utils.escapeHtml(String(result.quantity)), 'color:' + CONFIG.DEFAULT_TEXT_QUANTITY_COLOR + ';font-weight:700;');
                const boughtItemHtml = Html.span(Utils.escapeHtml(result.itemName), 'color:' + CONFIG.DEFAULT_TEXT_ITEM_COLOR + ';font-weight:700;');
                const priceText = result.totalPrice > 0
                    ? (' for ' + Render.currencyAmountHtml(result.totalPrice, result.currencyType))
                    : '';
                const conversionText = result.spendResult && result.spendResult.convertedFromGp
                    ? (
                        '<br><span style="font-size:11px;color:rgb(190,190,190);">' +
                        'Converted ' + Utils.escapeHtml(String(result.spendResult.convertedGp)) + ' gp to ' +
                        Utils.escapeHtml(String(result.spendResult.convertedAmount)) + ' ' +
                        Utils.escapeHtml(String(result.currencyType || '').toLowerCase()) + '.' +
                        '</span>'
                    )
                    : '';
                Render.sendWhisperMessage(
                    who,
                    'Shop Purchase',
                    'You bought ' + boughtQtyHtml + ' ' + boughtItemHtml + priceText + '.' + conversionText,
                    'success'
                );
                Render.sendWhisperMessage(
                    'GM',
                    'Shop Purchase',
                    Html.span(Utils.escapeHtml(result.buyerName || who), 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:700;') +
                    ' bought ' +
                    boughtQtyHtml +
                    ' ' +
                    boughtItemHtml +
                    priceText +
                    ' from ' +
                    Html.span(Utils.escapeHtml(result.shop.name), 'color:' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight:700;') + '.' +
                    conversionText,
                    'normal'
                );
                R20.whisper(who, Render.showItemsList(result.shop.itemList.filter((item) => !item.hidden), {
                    title: result.shop.name,
                    emptyText: 'No items found in this shop.',
                    menuType: 'shop',
                    shopId: result.shop.id,
                    buyerTokenId,
                    hidePrice: result.shop.config.hidePrice,
                    hasStock: result.shop.config.hasStock
                }));
                return;
            }
        }
    };

    /** -----------------------------------------------------------------------
     * @section Event Handlers
     * --------------------------------------------------------------------- */
    const Events = {
        async onChatMessage(msg) {
            if (!msg || msg.type !== 'api') return;

            const command = Registry.getCommand(msg.content);
            if (!command) return;
            if (!command.enabled) return;

            const parsed = Utils.splitCommand(msg.content);
            const who = Utils.asString(msg.who).replace(/\s+\(GM\)$/i, '');
            const playerId = msg.playerid || '';
            const isGM = playerIsGM(playerId);
            const selected = Array.isArray(msg.selected) ? msg.selected : [];

            if (command.gmOnly && !isGM) {
                Render.sendWhisperMessage(who, 'GM Command', 'Only a GM can use this command.', 'failure');
                return;
            }

            if (command.useToken && !selected.length) {
                Render.sendWhisperMessage(who, 'No Token Selected', 'Select a token first.', 'warning');
                return;
            }

            const ctx = {
                msg,
                command,
                who,
                base: parsed.base,
                args: parsed.args,
                isGM,
                playerId,
                selected,
                state: State.get(),
                config: CONFIG,
                meta: META
            };

            try {
                await command.execute(ctx);
            } catch (err) {
                Logger.error(err.message || String(err));
                Render.sendWhisperMessage(
                    who,
                    'Error',
                    Utils.escapeHtml(err.message || String(err)),
                    'failure'
                );
            }
        }
    };


    /** -----------------------------------------------------------------------
     * @section Bootstrap
     * --------------------------------------------------------------------- */
    const Bootstrap = {
        registerCommands() {
            Registry.registerCommand(new ChatCommand({
                name: 'Help',
                description: 'Show all available commands.',
                trigger: ['!tntHelp', '!tnt'],
                callback: Handlers.help
            }));

            Registry.registerCommand(new ChatCommand({
                name: 'Manage Attribute',
                description: 'Get/Set Character\'s Attribute',
                trigger: '!tntAttr',
                useToken: true,
                enabled: true,
                gmOnly: true,
                callback: Handlers.attributes
            }));

            Registry.registerCommand(new ChatCommand({
                name: 'Token',
                description: 'Token: !tntToken {init|clear|attacks|refreshattacks|refreshspells}.',
                trigger: '!tntToken',
                useToken: false,
                enabled: true,
                gmOnly: false,
                callback: Handlers.token
            }));

            Registry.registerCommand(new ChatCommand({
                name: 'Inventory',
                description: 'Inventory: !tntInventory [get|remove|add|give|use|discard]. Buy is pending.',
                trigger: ['!tntInventory'],
                useToken: false,
                callback: Handlers.inventory
            }));

            Registry.registerCommand(new ChatCommand({
                name: 'Currency',
                description: 'Currency: !tntCurrency {give|take} source target {cp|sp|gp} qty.',
                trigger: ['!tntCurrency'],
                useToken: false,
                callback: Handlers.currency
            }));

            Registry.registerCommand(new ChatCommand({
                name: 'Shop',
                description: 'Shop: !tntShop {menu|detail|export|list|get|buy|create|delete|add|remove|open|close|hide|blacklist|config|load|reload}.',
                trigger: ['!tntShop'],
                useToken: false,
                callback: Handlers.shop
            }));

            Registry.registerCommand(new ChatCommand({
                name: 'Item',
                description: 'Item Catalog: !tntItem {list|rawList|search|details|create|remove|reload}.',
                trigger: ['!tntItem'],
                useToken: false,
                callback: Handlers.item
            }));
        },

        bindEvents() {
            on('chat:message', Events.onChatMessage);
        },

        init() {
            const isSandboxDefault = Campaign().sandboxVersion.toLowerCase() !== 'experimental';
            if(isSandboxDefault) {
                Render.sendWhisperMessage(
                    'GM',
                    CONFIG.CHAT_NAME.toUpperCase(),
                    Html.span('API SANDBOX VERSION: DEFAULT<br>', 'color:rgb(208, 139, 28)') +
                    '<br>' +
                    'T&amp;T API is not available.<br>' +
                    'Go to Mod Library and set "API Sandbox Version" to Experimental to use this API.',
                    'failure'
                );
                return;
            }

            State.ensure();
            this.registerCommands();
            this.bindEvents();
            Logger.info(META.NAME + ' v:' + META.VERSION + ' ready.');

            InventoryService.loadItemCatalogFromHandout()
                .then((items) => {
                    Logger.info('Item catalog loaded:', items.length, 'items.');

                    /*R20.whisper('GM', Render.showItemsList(items, {
                        title: 'Items Catalog',
                        menuType: 'store'
                    }));//*/

                    return ShopService.loadShopCatalogFromHandout();
                })
                .then((shops) => {
                    Logger.info('Shop catalog loaded:', shops.length, 'shops.');
                })
                .catch((err) => Logger.error('Catalog load failed:', err.message));

            InventoryService.loadItemTemplatesFromHandout()
                .then((templates) => {
                    Logger.info('Item templates loaded:', templates.length, 'templates.');
                })
                .catch((err) => Logger.error('Item template load failed:', err.message));

            R20.send(
                Html.card({
                    title:CONFIG.CHAT_NAME,
                    body:
                        '<p style="font-size:20px;margin:-4px 0px 12px 0px;color:rgb(187, 185, 86);">Ready to Roll!</p>' +
                        '<p style="font-size:12px;margin:0;">Created by <span style="color:rgb(0,225,255);">' + Utils.escapeHtml(META.DEVELOPER) + '</span></p>'+
                        '<p style="font-size:12px;margin:2px 0px 0px 0px;">Version <span style="color:rgb(0, 255, 13);">' + Utils.escapeHtml(META.VERSION) + '</span></p>',
                    buildOptions: {
                        titleColor:'rgb(188, 138, 32)',
                        bgOverlayStart: 'rgba(0,0,0,.5)',
                        bgOverlayEnd: 'rgba(0,0,0,.5)',
                        bgImageURL: 'https://images.stockcake.com/public/4/9/d/49db6271-adf8-4cbb-93e9-a172c244eb6b_large/mystical-dragon-encounter-stockcake.jpg'
                    }
                })
            );
        }
    };

    on('ready', () => Bootstrap.init());

    return {
        meta: META,
        config: CONFIG
    };
})();
