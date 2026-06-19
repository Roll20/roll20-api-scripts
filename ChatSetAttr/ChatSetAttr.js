// ChatSetAttr v2.0 by Jakob, GUD Team
var ChatSetAttr = (function (exports) {
    'use strict';

    var name = "ChatSetAttr";
    var version = "2.0";
    var authors = [
    	"Jakob",
    	"GUD Team"
    ];
    var scriptJson = {
    	name: name,
    	version: version,
    	authors: authors};

    // #region Style Helpers
    function convertCamelToKebab(camel) {
        return camel.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    }
    function s(styleObject = {}) {
        let style = "";
        for (const [key, value] of Object.entries(styleObject)) {
            const kebabKey = convertCamelToKebab(key);
            style += `${kebabKey}: ${value};`;
        }
        return style;
    }
    function escapeHtml$1(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
    class SafeHtml {
        html;
        constructor(html) {
            this.html = html;
        }
    }
    function rawHtml(html) {
        return new SafeHtml(html);
    }
    function renderChild(child) {
        if (child instanceof SafeHtml) {
            return child.html;
        }
        if (typeof child === "string") {
            return escapeHtml$1(child);
        }
        return "";
    }
    function h(tagName, attributes = {}, ...children) {
        const attrs = Object.entries(attributes ?? {})
            .map(([key, value]) => ` ${key}="${escapeHtml$1(String(value))}"`)
            .join("");
        const flattenedChildren = children.flat(10).filter(child => child != null);
        const childrenContent = flattenedChildren.map(renderChild).join("");
        return new SafeHtml(`<${tagName}${attrs}>${childrenContent}</${tagName}>`);
    }

    const buttonStyleBase = {
        border: "none",
        borderRadius: "4px",
        padding: "4px 8px",
        backgroundColor: "rgba(233, 30, 162, 1)",
        color: "rgba(255, 255, 255, 1)",
        cursor: "pointer",
        fontWeight: "500",
    };
    const frameStyleBase = {
        border: "1px solid rgba(59, 130, 246, 0.3)",
        borderRadius: "8px",
        padding: "8px",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
    };
    const frameStyleNotice = {
        border: "1px solid rgba(245, 158, 11, 0.55)",
        borderRadius: "8px",
        padding: "8px",
        backgroundColor: "rgba(245, 158, 11, 0.18)",
    };
    const frameStyleError = {
        border: "1px solid rgba(239, 68, 68, 0.4)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
    };
    const headerStyleBase = {
        fontSize: "1.5em",
        marginBottom: "0.5em",
    };

    const CHAT_WRAPPER_STYLE = s(frameStyleBase);
    const CHAT_HEADER_STYLE = s(headerStyleBase);
    const CHAT_BODY_STYLE = s({
        fontSize: "14px",
        lineHeight: "1.4",
    });
    const ERROR_WRAPPER_STYLE = s({
        ...frameStyleBase,
        ...frameStyleError,
    });
    const ERROR_HEADER_STYLE = s(headerStyleBase);
    const ERROR_BODY_STYLE = s({
        fontSize: "14px",
        lineHeight: "1.4",
    });
    // #region Generic Message Creation Function
    function createMessage(header, messages, styles) {
        return (h("div", { style: styles.wrapper },
            h("h3", { style: styles.header }, header),
            h("div", { style: styles.body }, messages.map(message => h("p", null, message))))).html;
    }
    // #region Chat Message Function
    function createChatMessage(header, messages) {
        return createMessage(header, messages, {
            wrapper: CHAT_WRAPPER_STYLE,
            header: CHAT_HEADER_STYLE,
            body: CHAT_BODY_STYLE
        });
    }
    // #region Error Message Function
    function createErrorMessage(header, errors) {
        return createMessage(header, errors, {
            wrapper: ERROR_WRAPPER_STYLE,
            header: ERROR_HEADER_STYLE,
            body: ERROR_BODY_STYLE
        });
    }

    const NOTICE_WRAPPER_STYLE = s(frameStyleNotice);
    const NOTICE_HEADER_STYLE = s(headerStyleBase);
    function createNoticeMessage(title, content) {
        return (h("div", { style: NOTICE_WRAPPER_STYLE },
            h("div", { style: NOTICE_HEADER_STYLE }, title),
            h("div", null, content))).html;
    }

    const NOTIFY_WRAPPER_STYLE = s(frameStyleBase);
    const NOTIFY_HEADER_STYLE = s(headerStyleBase);
    function createNotifyMessage(title, content) {
        return (h("div", { style: NOTIFY_WRAPPER_STYLE },
            h("div", { style: NOTIFY_HEADER_STYLE }, title),
            h("div", null, rawHtml(content)))).html;
    }

    function createWelcomeMessage() {
        const buttonStyle = s(buttonStyleBase);
        return (h("div", null,
            h("p", null, "Thank you for installing ChatSetAttr."),
            h("p", null,
                "To get started, use the command ",
                h("code", null, "!setattr-config"),
                " to configure the script to your needs."),
            h("p", null,
                "For detailed documentation and examples, please use the ",
                h("code", null, "!setattr-help"),
                " command or click the button below:"),
            h("p", null,
                h("a", { href: "!setattr-help", style: buttonStyle }, "Create Journal Handout")))).html;
    }

    const BEACON_UNSUPPORTED_NOTICE_TITLE = "Notice: Beacon Support Disabled";
    const BEACON_UNSUPPORTED_NOTICE_BODY = "Beacon character sheets are not supported on this Mod API Sandbox. " +
        "Please be sure you have the correct Sandbox selected on the Mod API Scripts Page " +
        "and restart the Mod API Server.";
    const LONG_RUNNING_QUERY_TITLE = "Long Running Query";
    const LONG_RUNNING_QUERY_BODY = "The operation is taking a long time to execute. This may be due to a large number of " +
        "targets or attributes being processed. Please be patient as the operation completes.";
    function getWhisperPrefix(playerID) {
        const player = getPlayerName(playerID);
        return `/w "${player || "GM"}" `;
    }
    function normalizeCommandOutputOptions(options = {}) {
        return {
            mute: Boolean(options.mute),
            silent: Boolean(options.silent || options.mute),
        };
    }
    function getPlayerName(playerID) {
        const player = getObj("player", playerID);
        return player?.get("_displayname") || undefined;
    }
    function sendMessages(playerID, header, messages, delivery, output) {
        if (output?.silent) {
            return;
        }
        const from = delivery?.from ?? "ChatSetAttr";
        const newMessage = createChatMessage(header, messages);
        const chatMessage = delivery?.public
            ? newMessage
            : `${getWhisperPrefix(playerID)}${newMessage}`;
        sendChat(from, chatMessage);
    }
    function sendErrors(playerID, header, errors, from, output) {
        if (errors.length === 0 || output?.mute) {
            return;
        }
        const sender = from ?? "ChatSetAttr";
        const newMessage = createErrorMessage(header, errors);
        sendChat(sender, `${getWhisperPrefix(playerID)}${newMessage}`);
    }
    function sendDelayMessage(playerID, output) {
        if (output?.silent) {
            return;
        }
        const noticeMessage = createNoticeMessage(LONG_RUNNING_QUERY_TITLE, LONG_RUNNING_QUERY_BODY);
        sendChat("ChatSetAttr", `${getWhisperPrefix(playerID)}${noticeMessage}`, undefined, { noarchive: true });
    }
    function sendBeaconUnsupportedNotice() {
        const message = createNoticeMessage(BEACON_UNSUPPORTED_NOTICE_TITLE, BEACON_UNSUPPORTED_NOTICE_BODY);
        sendChat("ChatSetAttr", "/w gm " + message, undefined, { noarchive: true });
    }
    function sendNotification(title, content, archive) {
        const notifyMessage = createNotifyMessage(title, content);
        sendChat("ChatSetAttr", "/w gm " + notifyMessage, undefined, { noarchive: archive });
    }
    function sendWelcomeMessage() {
        const welcomeMessage = createWelcomeMessage();
        sendNotification("Welcome to ChatSetAttr!", welcomeMessage, false);
    }

    const CONFIG_WRAPPER_STYLE = s(frameStyleBase);
    const CONFIG_HEADER_STYLE = s(headerStyleBase);
    const CONFIG_TABLE_STYLE = s({
        width: "100%",
        border: "none",
        borderCollapse: "separate",
        borderSpacing: "0 4px",
    });
    const CONFIG_ROW_STYLE = s({
        marginBottom: "4px",
    });
    const CONFIG_BUTTON_STYLE_ON = s({
        ...buttonStyleBase,
        backgroundColor: "#16A34A",
        color: "#FFFFFF",
        fontWeight: "500",
    });
    const CONFIG_BUTTON_STYLE_OFF = s({
        ...buttonStyleBase,
        backgroundColor: "#DC2626",
        color: "#FFFFFF",
        fontWeight: "500",
    });
    const CONFIG_CLEAR_FIX_STYLE = s({
        clear: "both",
    });
    function camelToKebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    }
    function createConfigMessage() {
        const config = getConfig();
        const configEntries = Object.entries(config);
        const relevantEntries = configEntries.filter(([key]) => key !== "version"
            && key !== "scriptVersion"
            && key !== "globalconfigCache"
            && key !== "flags"
            && key !== "helpContentUpdatedAt");
        return (h("div", { style: CONFIG_WRAPPER_STYLE },
            h("div", { style: CONFIG_HEADER_STYLE }, "ChatSetAttr Configuration"),
            h("div", null,
                h("table", { style: CONFIG_TABLE_STYLE }, relevantEntries.map(([key, value]) => (h("tr", { style: CONFIG_ROW_STYLE },
                    h("td", null,
                        h("strong", null,
                            key,
                            ":")),
                    h("td", null,
                        h("a", { href: `!setattr-config --${camelToKebabCase(key)}`, style: value ? CONFIG_BUTTON_STYLE_ON : CONFIG_BUTTON_STYLE_OFF }, value ? "Enabled" : "Disabled")))))),
                h("div", { style: CONFIG_CLEAR_FIX_STYLE })))).html;
    }

    const STATE_SCHEMA_VERSION = 4;
    const GLOBAL_CONFIG_OPTIONS = [
        {
            label: "Players can modify all characters",
            key: "playersCanModify",
            value: "playersCanModify",
        },
        {
            label: "Players can use --evaluate",
            key: "playersCanEvaluate",
            value: "playersCanEvaluate",
        },
        {
            label: "Trigger sheet workers when setting attributes",
            key: "useWorkers",
            value: "useWorkers",
        },
        {
            label: "Players can target party members",
            key: "playersCanTargetParty",
            value: "playersCanTargetParty",
        },
    ];
    const DEFAULT_CONFIG = {
        version: STATE_SCHEMA_VERSION,
        scriptVersion: scriptJson.version,
        globalconfigCache: {
            lastsaved: 0,
        },
        playersCanTargetParty: true,
        playersCanModify: false,
        playersCanEvaluate: false,
        useWorkers: true,
        helpContentUpdatedAt: 0,
        flags: [],
    };
    function getStateSchemaVersion(raw) {
        if (raw === undefined || raw === null) {
            return 0;
        }
        if (typeof raw === "number" && Number.isFinite(raw)) {
            return raw;
        }
        if (typeof raw === "string") {
            const parsed = Number(raw);
            if (Number.isFinite(parsed) && /^\d+$/.test(raw.trim())) {
                return parsed;
            }
            return 0;
        }
        return 0;
    }
    function ensureChatSetAttrState() {
        if (!state.ChatSetAttr) {
            state.ChatSetAttr = {};
        }
        return state.ChatSetAttr;
    }
    function getPersistedSchemaVersion() {
        return getStateSchemaVersion(state.ChatSetAttr?.version);
    }
    function persistStateVersionMetadata() {
        const raw = ensureChatSetAttrState();
        const schemaVersion = getStateSchemaVersion(raw.version);
        if (schemaVersion > 0 && raw.version !== schemaVersion) {
            raw.version = schemaVersion;
        }
        if (!Object.hasOwn(raw, "scriptVersion") || raw.scriptVersion !== scriptJson.version) {
            raw.scriptVersion = scriptJson.version;
        }
    }
    function syncScriptVersion() {
        persistStateVersionMetadata();
    }
    function parseGlobalConfigCheckbox(g, label, valueField) {
        return g[label] === valueField;
    }
    function buildCacheSnapshot(g) {
        const cache = { lastsaved: g.lastsaved ?? 0 };
        for (const option of GLOBAL_CONFIG_OPTIONS) {
            cache[option.label] = `${g[option.label] ?? ""}`;
        }
        return cache;
    }
    function checkGlobalConfig() {
        const g = globalconfig?.chatsetattr;
        if (!g?.lastsaved) {
            return [];
        }
        state.ChatSetAttr = state.ChatSetAttr || {};
        const cache = (state.ChatSetAttr.globalconfigCache || { lastsaved: 0 });
        if (g.lastsaved <= cache.lastsaved) {
            return [];
        }
        const changes = [];
        for (const option of GLOBAL_CONFIG_OPTIONS) {
            const newRaw = `${g[option.label] ?? ""}`;
            const oldRaw = `${cache[option.label] ?? ""}`;
            if (newRaw === oldRaw) {
                continue;
            }
            const newValue = parseGlobalConfigCheckbox(g, option.label, option.value);
            const oldValue = getConfig()[option.key];
            if (newValue === oldValue) {
                continue;
            }
            state.ChatSetAttr[option.key] = newValue;
            changes.push(`${option.key}: ${String(oldValue)} → ${String(newValue)}`);
        }
        state.ChatSetAttr.globalconfigCache = buildCacheSnapshot(g);
        if (changes.length > 0) {
            log(`ChatSetAttr: Imported Global Config settings: ${changes.join(", ")}`);
            sendNotification("ChatSetAttr Global Config", `<p>New settings imported from Global Config:</p><ul>${changes.map(change => `<li>${change}</li>`).join("")}</ul>`, false);
        }
        return changes;
    }
    function getConfig() {
        const stateConfig = state?.ChatSetAttr || {};
        return {
            ...DEFAULT_CONFIG,
            ...stateConfig,
        };
    }
    function setConfig(newConfig) {
        Object.assign(ensureChatSetAttrState(), newConfig);
    }
    function hasFlag(flag) {
        const config = getConfig();
        return config.flags.includes(flag);
    }
    function setFlag(flag) {
        const config = getConfig();
        if (!hasFlag(flag)) {
            config.flags.push(flag);
            setConfig({ flags: config.flags });
        }
    }
    function checkConfigMessage(message) {
        return message.startsWith("!setattr-config");
    }
    const FLAG_MAP = {
        "--players-can-modify": "playersCanModify",
        "--players-can-evaluate": "playersCanEvaluate",
        "--players-can-target-party": "playersCanTargetParty",
        "--use-workers": "useWorkers",
    };
    function handleConfigCommand(message, playerID) {
        message = message.replace("!setattr-config", "").trim();
        const args = message.split(/\s+/);
        const newConfig = {};
        for (const arg of args) {
            const cleanArg = arg.toLowerCase();
            const flag = FLAG_MAP[cleanArg];
            if (flag !== undefined) {
                newConfig[flag] = !getConfig()[flag];
                log(`Toggled config option: ${flag} to ${newConfig[flag]}`);
            }
        }
        setConfig(newConfig);
        const configMessage = createConfigMessage();
        sendChat("ChatSetAttr", `${getWhisperPrefix(playerID)}${configMessage}`, undefined, { noarchive: true });
    }

    const observers = {};
    function registerObserver(event, callback) {
        if (!observers[event]) {
            observers[event] = [];
        }
        observers[event].push(callback);
    }
    function notifyObservers(event, obj, prev) {
        const callbacks = observers[event] || [];
        callbacks.forEach(callback => {
            callback(obj, prev);
        });
    }

    const WRITABLE_KEYS = new Set(["current", "max"]);
    function normalizeKey(key) {
        return key.startsWith("_") ? key.slice(1) : key;
    }
    function toAttrString(value) {
        if (value === undefined || value === null) {
            return "";
        }
        return String(value);
    }
    function hasSheetItemValue(value) {
        return value !== null && value !== undefined && value !== "";
    }
    function hasPriorValue$1(value) {
        return value !== undefined && value !== null && value !== "";
    }
    function toSnapshot(targetId, actualName, kind, state, id = "") {
        return {
            _id: id,
            _type: kind,
            _characterid: targetId,
            name: actualName,
            current: state.current,
            max: state.max,
        };
    }
    function mergeAttributeState(targetId, actualName, priorValues, results, isDelete) {
        const maxKey = `${actualName}_max`;
        const priorCurrent = priorValues[targetId]?.[actualName];
        const priorMax = priorValues[targetId]?.[maxKey];
        if (isDelete) {
            return {
                current: toAttrString(priorCurrent),
                max: toAttrString(priorMax),
                priorCurrent: toAttrString(priorCurrent),
                priorMax: toAttrString(priorMax),
            };
        }
        const newCurrent = results[targetId]?.[actualName];
        const newMax = results[targetId]?.[maxKey];
        return {
            current: newCurrent !== undefined ? toAttrString(newCurrent) : toAttrString(priorCurrent),
            max: newMax !== undefined ? toAttrString(newMax) : toAttrString(priorMax),
            priorCurrent: toAttrString(priorCurrent),
            priorMax: toAttrString(priorMax),
        };
    }
    function tryFindLegacyAttribute(targetId, actualName) {
        return findObjs({
            _type: "attribute",
            _characterid: targetId,
            name: actualName,
        })[0];
    }
    function isLegacySheet(targetId) {
        const character = getObj("character", targetId);
        if (!character) {
            return false;
        }
        return character.sheetEnvironment === "legacy" || character.sheetEnvironment === undefined;
    }
    function legacyAttributeForSheet(targetId, actualName) {
        if (!isLegacySheet(targetId)) {
            return undefined;
        }
        return tryFindLegacyAttribute(targetId, actualName);
    }
    async function resolveObserverKind(targetId, actualName) {
        if (isLegacySheet(targetId)) {
            return "attribute";
        }
        const computed = await getSheetItem(targetId, actualName, "current");
        const computedMax = await getSheetItem(targetId, actualName, "max");
        if (hasSheetItemValue(computed) || hasSheetItemValue(computedMax)) {
            return "computed";
        }
        const userAttr = await getSheetItem(targetId, `user.${actualName}`, "current");
        const userMax = await getSheetItem(targetId, `user.${actualName}`, "max");
        if (hasSheetItemValue(userAttr) || hasSheetItemValue(userMax)) {
            return "userAttribute";
        }
        return "computed";
    }
    function isNewAttributeOrUser(kind, state) {
        if (kind === "computed") {
            return false;
        }
        return state.priorCurrent === "" && state.priorMax === "";
    }
    function sheetItemPath(kind, actualName) {
        return kind === "userAttribute" ? `user.${actualName}` : actualName;
    }
    async function writeSheetItemValue(characterId, kind, actualName, key, value) {
        const normalized = normalizeKey(key);
        if (!WRITABLE_KEYS.has(normalized)) {
            return false;
        }
        const type = normalized;
        const path = sheetItemPath(kind, actualName);
        try {
            await setSheetItem(characterId, path, value, type, {
                allowThrow: true,
                createAttr: true,
                withWorker: true,
            });
            return true;
        }
        catch {
            return false;
        }
    }
    function createObserverAttributeObject(targetId, actualName, kind, state, id = "") {
        const snapshot = toSnapshot(targetId, actualName, kind, state, id);
        const obj = {
            get(key) {
                const normalized = normalizeKey(key);
                const byKey = {
                    id: snapshot._id,
                    _id: snapshot._id,
                    type: snapshot._type,
                    _type: snapshot._type,
                    characterid: snapshot._characterid,
                    _characterid: snapshot._characterid,
                    name: snapshot.name,
                    current: snapshot.current,
                    max: snapshot.max,
                };
                return byKey[normalized] ?? byKey[key];
            },
            set(keyOrProps, value) {
                const updates = {};
                if (typeof keyOrProps === "string") {
                    const normalized = normalizeKey(keyOrProps);
                    if (WRITABLE_KEYS.has(normalized) && value !== undefined) {
                        updates[normalized] = value;
                    }
                }
                else {
                    if (keyOrProps.current !== undefined) {
                        updates.current = keyOrProps.current;
                    }
                    if (keyOrProps.max !== undefined) {
                        updates.max = keyOrProps.max;
                    }
                }
                for (const [key, nextValue] of Object.entries(updates)) {
                    if (nextValue === undefined) {
                        continue;
                    }
                    void writeSheetItemValue(targetId, kind, actualName, key, nextValue).then(ok => {
                        if (ok) {
                            snapshot[key] = nextValue;
                        }
                    });
                }
                return obj;
            },
            toJSON() {
                return { ...snapshot };
            },
        };
        return obj;
    }
    function resolveObserverDestroyObj(targetId, actualName, kind) {
        if (kind !== "attribute" || !isLegacySheet(targetId)) {
            return undefined;
        }
        return tryFindLegacyAttribute(targetId, actualName);
    }
    function resolveObserverObj(targetId, actualName, kind, state) {
        if (kind === "attribute") {
            const legacyAttr = legacyAttributeForSheet(targetId, actualName);
            if (legacyAttr) {
                return legacyAttr;
            }
        }
        const legacyAttr = legacyAttributeForSheet(targetId, actualName);
        const id = legacyAttr?.get("_id") ?? "";
        return createObserverAttributeObject(targetId, actualName, kind, state, id);
    }
    function resolveObserverAddObj(targetId, actualName, kind, state) {
        if (kind === "attribute") {
            const legacyAttr = legacyAttributeForSheet(targetId, actualName);
            if (legacyAttr) {
                return legacyAttr;
            }
        }
        const legacyAttr = legacyAttributeForSheet(targetId, actualName);
        const id = legacyAttr?.get("_id") ?? "";
        return createObserverAttributeObject(targetId, actualName, kind, state, id);
    }
    async function captureDeletePriorState(targetId, actualName, kind, priorValues) {
        const maxKey = `${actualName}_max`;
        let priorCurrent = priorValues[targetId]?.[actualName];
        let priorMax = priorValues[targetId]?.[maxKey];
        const legacyAttr = legacyAttributeForSheet(targetId, actualName);
        if (legacyAttr) {
            if (!hasPriorValue$1(priorCurrent)) {
                priorCurrent = legacyAttr.get("current");
            }
            if (!hasPriorValue$1(priorMax)) {
                priorMax = legacyAttr.get("max");
            }
        }
        else {
            const userCurrent = await getSheetItem(targetId, `user.${actualName}`, "current");
            const userMax = await getSheetItem(targetId, `user.${actualName}`, "max");
            const hasUserValues = hasSheetItemValue(userCurrent) || hasSheetItemValue(userMax);
            const path = hasUserValues || kind === "userAttribute"
                ? `user.${actualName}`
                : actualName;
            if (!hasPriorValue$1(priorCurrent)) {
                priorCurrent = await getSheetItem(targetId, path, "current");
            }
            if (!hasPriorValue$1(priorMax)) {
                priorMax = await getSheetItem(targetId, path, "max");
            }
            if (!hasPriorValue$1(priorCurrent) && hasUserValues) {
                priorCurrent = userCurrent;
            }
            if (!hasPriorValue$1(priorMax) && hasUserValues) {
                priorMax = userMax;
            }
        }
        const current = toAttrString(priorCurrent);
        const max = toAttrString(priorMax);
        return {
            current,
            max,
            priorCurrent: current,
            priorMax: max,
        };
    }
    function logicalAttributeKey(target, actualName) {
        return `${target}:${actualName}`;
    }
    function toActualName(name) {
        const isMax = name.endsWith("_max");
        return {
            actualName: isMax ? name.slice(0, -4) : name,
            isMax,
        };
    }

    function buildSetAttributeOptions(overrides = {}) {
        const { useWorkers = true } = getConfig() || {};
        return {
            noCreate: overrides.noCreate ?? false,
            setWithWorker: overrides.setWithWorker ?? useWorkers,
        };
    }
    function failureKey(target, name) {
        return `${target}:${name}`;
    }
    function collectLogicalGroups(results) {
        const groups = new Map();
        for (const target in results) {
            for (const name in results[target]) {
                const { actualName } = toActualName(name);
                const key = logicalAttributeKey(target, actualName);
                const existing = groups.get(key);
                if (existing) {
                    existing.keys.push(name);
                }
                else {
                    groups.set(key, { target, actualName, keys: [name] });
                }
            }
        }
        return Array.from(groups.values());
    }
    function groupHasFailure(group, failed) {
        return group.keys.some(name => failed.has(failureKey(group.target, name)));
    }
    function shouldSkipPairedMaxDelete(target, actualName, isMax, priorValues, results) {
        if (!isMax) {
            return false;
        }
        const maxKey = `${actualName}_max`;
        const hasCompanionCurrent = Object.hasOwn(results[target], actualName);
        if (isLegacySheet(target)) {
            return hasCompanionCurrent;
        }
        // Beacon userAttributes are removed when current is cleared; a follow-up max delete fails.
        if (hasCompanionCurrent) {
            return true;
        }
        if (!hasPriorValue(priorValues[target]?.[maxKey])) {
            return true;
        }
        return false;
    }
    function hasPriorValue(value) {
        return value !== undefined && value !== null && value !== "";
    }
    async function makeUpdate(operation, results, options) {
        const isSetting = operation !== "delattr";
        const errors = [];
        const messages = [];
        const failed = [];
        const failedSet = new Set();
        const { noCreate = false, priorValues = {} } = options || {};
        const setOptions = buildSetAttributeOptions({ noCreate });
        const deleteKinds = new Map();
        const deleteStates = new Map();
        const deleteObserverTargets = new Map();
        if (!isSetting) {
            for (const target in results) {
                for (const name in results[target]) {
                    const { actualName } = toActualName(name);
                    const groupKey = logicalAttributeKey(target, actualName);
                    if (!deleteKinds.has(groupKey)) {
                        deleteKinds.set(groupKey, await resolveObserverKind(target, actualName));
                    }
                    if (!deleteStates.has(groupKey)) {
                        const kind = deleteKinds.get(groupKey) ?? await resolveObserverKind(target, actualName);
                        deleteStates.set(groupKey, await captureDeletePriorState(target, actualName, kind, priorValues));
                    }
                    if (!deleteObserverTargets.has(groupKey)) {
                        const kind = deleteKinds.get(groupKey) ?? await resolveObserverKind(target, actualName);
                        deleteObserverTargets.set(groupKey, resolveObserverDestroyObj(target, actualName, kind));
                    }
                }
            }
        }
        for (const target in results) {
            for (const name in results[target]) {
                const { actualName, isMax } = toActualName(name);
                const type = isMax ? "max" : "current";
                const key = failureKey(target, name);
                const newValue = results[target][name];
                if (isSetting) {
                    const value = newValue ?? "";
                    try {
                        const ok = await libSmartAttributes.setAttribute(target, actualName, value, type, setOptions);
                        if (!ok) {
                            failed.push(key);
                            failedSet.add(key);
                            errors.push(`Failed to set attribute '${name}' on target '${target}'.`);
                        }
                    }
                    catch (error) {
                        failed.push(key);
                        failedSet.add(key);
                        errors.push(`Failed to set attribute '${name}' on target '${target}': ${String(error)}`);
                    }
                }
                else {
                    if (shouldSkipPairedMaxDelete(target, actualName, isMax, priorValues, results)) {
                        continue;
                    }
                    try {
                        const ok = await libSmartAttributes.deleteAttribute(target, actualName, type);
                        if (!ok) {
                            failed.push(key);
                            failedSet.add(key);
                            errors.push(`Failed to delete attribute '${actualName}' on target '${target}'.`);
                        }
                    }
                    catch (error) {
                        failed.push(key);
                        failedSet.add(key);
                        errors.push(`Failed to delete attribute '${actualName}' on target '${target}': ${String(error)}`);
                    }
                }
            }
        }
        const groups = collectLogicalGroups(results);
        for (const group of groups) {
            if (groupHasFailure(group, failedSet)) {
                continue;
            }
            const groupKey = logicalAttributeKey(group.target, group.actualName);
            const state = isSetting
                ? mergeAttributeState(group.target, group.actualName, priorValues, results, false)
                : deleteStates.get(groupKey) ?? mergeAttributeState(group.target, group.actualName, priorValues, results, true);
            const kind = isSetting
                ? await resolveObserverKind(group.target, group.actualName)
                : deleteKinds.get(logicalAttributeKey(group.target, group.actualName)) ?? await resolveObserverKind(group.target, group.actualName);
            if (isSetting) {
                const prev = toSnapshot(group.target, group.actualName, kind, {
                    current: state.priorCurrent,
                    max: state.priorMax,
                });
                const obj = resolveObserverObj(group.target, group.actualName, kind, state);
                if (isNewAttributeOrUser(kind, state)) {
                    notifyObservers("add", resolveObserverAddObj(group.target, group.actualName, kind, state));
                }
                notifyObservers("change", obj, prev);
            }
            else {
                const obj = deleteObserverTargets.get(groupKey)
                    ?? resolveObserverObj(group.target, group.actualName, kind, state);
                notifyObservers("destroy", obj);
            }
        }
        return { errors, messages, failed };
    }

    // #region Get Attributes
    async function getSingleAttribute(target, attributeName) {
        const isMax = attributeName.endsWith("_max");
        const type = isMax ? "max" : "current";
        if (isMax) {
            attributeName = attributeName.slice(0, -4); // remove '_max'
        }
        try {
            const attribute = await libSmartAttributes.getAttribute(target, attributeName, type);
            return attribute;
        }
        catch {
            return undefined;
        }
    }
    async function getAttributes(target, attributeNames) {
        const attributes = {};
        if (Array.isArray(attributeNames)) {
            for (const name of attributeNames) {
                const cleanName = name.replace(/[^a-zA-Z0-9_]/g, "");
                attributes[cleanName] = await getSingleAttribute(target, cleanName);
            }
        }
        else {
            for (const name in attributeNames) {
                const cleanName = name.replace(/[^a-zA-Z0-9_]/g, "");
                attributes[cleanName] = await getSingleAttribute(target, cleanName);
            }
        }
        return attributes;
    }

    function isBeaconSupported() {
        try {
            const campaign = Campaign();
            return !!campaign.computedSummary;
        }
        catch {
            return false;
        }
    }

    function cleanValue(value) {
        return value.trim().replace(/^['"](.*)['"]$/g, "$1");
    }
    function getCharName(targetID) {
        const character = getObj("character", targetID);
        if (character) {
            return character.get("name");
        }
        return `ID: ${targetID}`;
    }

    // region Command Handlers
    async function setattr(changes, target, referenced = [], noCreate = false, _feedback) {
        const result = {};
        const errors = [];
        const request = createRequestList(referenced, changes, false);
        const currentValues = await getCurrentValues(target, request, changes);
        const undefinedAttributes = extractUndefinedAttributes(currentValues);
        const characterName = getCharName(target);
        for (const change of changes) {
            const { name, current, max } = change;
            if (!name)
                continue;
            if (undefinedAttributes.includes(name) && noCreate) {
                errors.push(`Missing attribute ${name} not created for ${characterName}.`);
                continue;
            }
            if (current !== undefined) {
                result[name] = current;
            }
            if (max !== undefined) {
                result[`${name}_max`] = max;
            }
        }
        return {
            result,
            errors,
        };
    }
    async function modattr(changes, target, referenced, noCreate = false, _feedback) {
        const result = {};
        const errors = [];
        const currentValues = await getCurrentValues(target, referenced, changes);
        const undefinedAttributes = extractUndefinedAttributes(currentValues);
        getCharName(target);
        for (const change of changes) {
            const { name, current, max } = change;
            if (!name)
                continue;
            if (undefinedAttributes.includes(name) && noCreate) {
                errors.push(`Attribute '${name}' is undefined and cannot be modified.`);
                continue;
            }
            const asNumber = Number(currentValues[name] ?? 0);
            if (isNaN(asNumber)) {
                errors.push(`Attribute '${name}' is not number-valued and so cannot be modified.`);
                continue;
            }
            if (current !== undefined) {
                result[name] = calculateModifiedValue(asNumber, current);
            }
            if (max !== undefined) {
                result[`${name}_max`] = calculateModifiedValue(currentValues[`${name}_max`], max);
            }
        }
        return {
            result,
            errors,
        };
    }
    async function modbattr(changes, target, referenced, noCreate = false, _feedback) {
        const result = {};
        const errors = [];
        const request = createRequestList(referenced, changes, true);
        const currentValues = await getCurrentValues(target, request, changes);
        const undefinedAttributes = extractUndefinedAttributes(currentValues);
        getCharName(target);
        for (const change of changes) {
            const { name, current, max } = change;
            if (!name)
                continue;
            if (undefinedAttributes.includes(name) && noCreate) {
                errors.push(`Attribute '${name}' is undefined and cannot be modified.`);
                continue;
            }
            const asNumber = Number(currentValues[name]);
            if (isNaN(asNumber)) {
                errors.push(`Attribute '${name}' is not number-valued and so cannot be modified.`);
                continue;
            }
            if (current !== undefined) {
                result[name] = calculateModifiedValue(asNumber, current);
            }
            if (max !== undefined) {
                result[`${name}_max`] = calculateModifiedValue(currentValues[`${name}_max`], max);
            }
            const newMax = result[`${name}_max`] ?? currentValues[`${name}_max`];
            if (newMax !== undefined) {
                const start = currentValues[name];
                result[name] = calculateBoundValue(result[name] ?? start, newMax);
            }
        }
        return {
            result,
            errors,
        };
    }
    async function resetattr(changes, target, referenced, noCreate = false, _feedback) {
        const result = {};
        const errors = [];
        const request = createRequestList(referenced, changes, true);
        const currentValues = await getCurrentValues(target, request, changes);
        const undefinedAttributes = extractUndefinedAttributes(currentValues);
        getCharName(target);
        for (const change of changes) {
            const { name } = change;
            if (!name)
                continue;
            if (undefinedAttributes.includes(name) && noCreate) {
                errors.push(`Attribute '${name}' is undefined and cannot be reset.`);
                continue;
            }
            const maxName = `${name}_max`;
            if (currentValues[maxName] !== undefined) {
                const maxAsNumber = Number(currentValues[maxName]);
                if (isNaN(maxAsNumber)) {
                    errors.push(`Attribute '${maxName}' is not number-valued and so cannot be used to reset '${name}'.`);
                    continue;
                }
                result[name] = maxAsNumber;
            }
            else {
                result[name] = 0;
            }
        }
        return {
            result,
            errors,
        };
    }
    async function delattr(changes, target, referenced, _, _feedback) {
        const result = {};
        for (const change of changes) {
            const { name } = change;
            if (!name)
                continue;
            result[name] = undefined;
            result[`${name}_max`] = undefined;
        }
        return {
            result,
            errors: [],
        };
    }
    const handlers = {
        setattr,
        modattr,
        modbattr,
        resetattr,
        delattr,
    };
    // #region Helper Functions
    function createRequestList(referenced, changes, includeMax = true) {
        const requestSet = new Set([...referenced]);
        for (const change of changes) {
            if (change.name) {
                requestSet.add(change.name);
                if (includeMax) {
                    requestSet.add(`${change.name}_max`);
                }
            }
        }
        return Array.from(requestSet);
    }
    function extractUndefinedAttributes(attributes) {
        const names = [];
        for (const name in attributes) {
            if (name.endsWith("_max"))
                continue;
            if (attributes[name] === undefined) {
                names.push(name);
            }
        }
        return names;
    }
    async function getCurrentValues(target, referenced, changes) {
        const queriedAttributes = new Set([...referenced]);
        for (const change of changes) {
            if (change.name) {
                queriedAttributes.add(change.name);
                queriedAttributes.add(`${change.name}_max`);
            }
        }
        const attributes = await getAttributes(target, Array.from(queriedAttributes));
        return attributes;
    }
    function calculateModifiedValue(baseValue, modification) {
        const operator = getOperator(modification);
        baseValue = Number(baseValue);
        if (operator) {
            modification = Number(String(modification).substring(1));
        }
        else {
            modification = Number(modification);
        }
        if (isNaN(baseValue))
            baseValue = 0;
        if (isNaN(modification))
            modification = 0;
        return applyCalculation(baseValue, modification, operator);
    }
    function getOperator(value) {
        if (typeof value === "string") {
            const match = value.match(/^([+\-*/])/);
            if (match) {
                return match[1];
            }
        }
        return;
    }
    function applyCalculation(baseValue, modification, operator = "+") {
        modification = Number(modification);
        switch (operator) {
            case "+":
                return baseValue + modification;
            case "-":
                return baseValue - modification;
            case "*":
                return baseValue * modification;
            case "/":
                return modification !== 0 ? baseValue / modification : baseValue;
            default:
                return baseValue + modification;
        }
    }
    function calculateBoundValue(currentValue, maxValue) {
        currentValue = Number(currentValue);
        maxValue = Number(maxValue);
        if (isNaN(currentValue))
            currentValue = 0;
        if (isNaN(maxValue))
            return currentValue;
        return Math.max(Math.min(currentValue, maxValue), 0);
    }

    function formatFeedbackValue(value) {
        if (value === undefined || value === null || value === "") {
            return "(empty)";
        }
        return String(value);
    }
    function formatAttributePart(name, result) {
        const hasCurrent = Object.hasOwn(result, name);
        const maxKey = `${name}_max`;
        const hasMax = Object.hasOwn(result, maxKey);
        if (!hasCurrent && !hasMax) {
            return null;
        }
        if (hasCurrent && hasMax) {
            return `${name} to ${formatFeedbackValue(result[name])} / ${formatFeedbackValue(result[maxKey])}`;
        }
        if (hasCurrent) {
            return `${name} to ${formatFeedbackValue(result[name])}`;
        }
        return `${name} to ${formatFeedbackValue(result[maxKey])} (max)`;
    }
    function formatSettingFeedback(characterName, changes, result) {
        const parts = [];
        for (const change of changes) {
            if (!change.name)
                continue;
            const part = formatAttributePart(change.name, result);
            if (part) {
                parts.push(part);
            }
        }
        if (parts.length === 0) {
            return null;
        }
        return `Setting ${parts.join(", ")} for character ${characterName}.`;
    }
    function formatDeleteFeedback(characterName, changes, result) {
        const names = [];
        for (const change of changes) {
            if (!change.name)
                continue;
            if (Object.hasOwn(result, change.name)) {
                names.push(change.name);
            }
        }
        if (names.length === 0) {
            return null;
        }
        return `Deleting attribute(s) ${names.join(", ")} for character ${characterName}.`;
    }
    function createFeedbackMessage(characterName, feedback, startingValues, targetValues) {
        let message = feedback?.content ?? "";
        // _NAMEJ_: will insert the attribute name.
        // _TCURJ_: will insert what you are changing the current value to (or changing by, if you're using --mod or --modb).
        // _TMAXJ_: will insert what you are changing the maximum value to (or changing by, if you're using --mod or --modb).
        // _CHARNAME_: will insert the character name.
        // _CURJ_: will insert the final current value of the attribute, for this character.
        // _MAXJ_: will insert the final maximum value of the attribute, for this character.
        const targetValueKeys = getChangedAttributeNames(targetValues);
        message = message.replace("_CHARNAME_", characterName);
        message = message.replace(/_(NAME|TCUR|TMAX|CUR|MAX)(\d+)_/g, (_, key, num) => {
            const index = parseInt(num, 10);
            const attributeName = targetValueKeys[index];
            if (!attributeName)
                return "";
            const sheetCurrent = startingValues[attributeName];
            const sheetMax = startingValues[`${attributeName}_max`];
            const resultCurrent = targetValues[attributeName];
            const resultMax = targetValues[`${attributeName}_max`];
            switch (key) {
                case "NAME":
                    return attributeName;
                case "TCUR":
                    return sheetCurrent !== undefined ? `${sheetCurrent}` : "";
                case "TMAX":
                    return sheetMax !== undefined ? `${sheetMax}` : "";
                case "CUR": {
                    const value = resultCurrent ?? sheetCurrent;
                    return value !== undefined ? `${value}` : "";
                }
                case "MAX": {
                    const value = resultMax ?? sheetMax;
                    return value !== undefined ? `${value}` : "";
                }
                default:
                    return "";
            }
        });
        return message;
    }
    function getChangedAttributeNames(targetValues) {
        const seen = new Set();
        const names = [];
        for (const key of Object.keys(targetValues)) {
            const name = key.endsWith("_max") ? key.slice(0, -4) : key;
            if (!seen.has(name)) {
                seen.add(name);
                names.push(name);
            }
        }
        return names;
    }

    var $schema = "./content.schema.json";
    var title = "ChatSetAttr";
    var introduction = "ChatSetAttr is a Roll20 Mod API script that allows users to create, modify, or delete character sheet attributes through chat commands macros. Whether you need to update a single character attribute or make bulk changes across multiple characters, ChatSetAttr provides flexible options to streamline your game management.";
    var sections = [
    	{
    		id: "basic-usage",
    		title: "Basic Usage",
    		blocks: [
    			{
    				type: "paragraph",
    				text: "The script provides several command formats:"
    			},
    			{
    				type: "unorderedList",
    				items: [
    					"`!setattr [--options]` - Create or modify attributes",
    					"`!modattr [--options]` - Shortcut for `!setattr --mod` (adds to existing values)",
    					"`!modbattr [--options]` - Shortcut for `!setattr --modb` (adds to values with bounds)",
    					"`!resetattr [--options]` - Shortcut for `!setattr --reset` (resets to max values)",
    					"`!delattr [--options]` - Delete attributes"
    				]
    			},
    			{
    				type: "paragraph",
    				text: "Each command requires a target selection option and one or more attributes to modify."
    			},
    			{
    				type: "paragraph",
    				text: "**Basic structure:**"
    			},
    			{
    				type: "codeBlock",
    				lines: [
    					"!setattr --[target selection] --attribute1|value1 --attribute2|value2|max2"
    				]
    			}
    		]
    	},
    	{
    		id: "available-commands",
    		title: "Available Commands",
    		subsections: [
    			{
    				id: "setattr",
    				title: "!setattr",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Creates or updates attributes on the selected target(s). If the attribute doesn't exist, it will be created (unless `--nocreate` is specified)."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --hp|25|50 --hp_temp|8"
    						]
    					},
    					{
    						type: "paragraph",
    						text: "This would set `hp` to 25, `hp_max` to 50, `hp_temp` to 8."
    					}
    				]
    			},
    			{
    				id: "modattr",
    				title: "!modattr",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Adds to existing attribute values (works only with numeric values). Shorthand for `!setattr --mod`."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!modattr --sel --hp_temp|-5 --hp|6"
    						]
    					},
    					{
    						type: "paragraph",
    						text: "This subtracts 5 from `hp_temp` and adds 6 to `hp`."
    					}
    				]
    			},
    			{
    				id: "modbattr",
    				title: "!modbattr",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Adds to existing attribute values but keeps the result between 0 and the maximum value. Shorthand for `!setattr --modb`."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!modbattr --sel --hp_temp|-5 --hp|25"
    						]
    					},
    					{
    						type: "paragraph",
    						text: "This subtracts 5 from `hp_temp` but won't reduce it below 0 and increase `hp` by 25, but won't increase it above `mp_xp`."
    					}
    				]
    			},
    			{
    				id: "resetattr",
    				title: "!resetattr",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Resets attributes to their maximum value. Shorthand for `!setattr --reset`."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!resetattr --sel --hp"
    						]
    					},
    					{
    						type: "paragraph",
    						text: "This resets `hp` to its maximum value."
    					}
    				]
    			},
    			{
    				id: "delattr",
    				title: "!delattr",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Deletes the specified attributes."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!delattr --sel --hp --hp_temp"
    						]
    					},
    					{
    						type: "paragraph",
    						text: "This removes the `hp` and `hp_temp` attributes."
    					}
    				]
    			}
    		]
    	},
    	{
    		id: "beacon-computed-values",
    		title: "Beacon Computed Values",
    		blocks: [
    			{
    				type: "paragraph",
    				text: "Beacon character sheets don't have attributes, they have Computed values.  All Computeds for a sheet exist when the sheet starts up, you can't create more or remove existing ones.  If you try to delete a computed, you will get an error message, but it is otherewise safe to try."
    			},
    			{
    				type: "paragraph",
    				text: "Some Computed values are read-only and cannot be set.  Attempting to set or modify them will result in an error message."
    			},
    			{
    				type: "paragraph",
    				text: "For player created attributes, Beacon sheets have a system called User Attributes.  If you attempt to add a new attribute to a Beacon sheet, it will create a User Attribute by that name.  User Attributes are prefaced with `user.` like `user.spellpoints`. They function like attributes and can be created, removed, set, reset, and modified as desired."
    			},
    			{
    				type: "paragraph",
    				text: "**Example:**"
    			},
    			{
    				type: "codeBlock",
    				lines: [
    					"!setattr --sel --spellpoints|18"
    				]
    			},
    			{
    				type: "paragraph",
    				text: "This will create the `user.spellpoints` User Attribute, which can be referenced as either `@{selected|user.spellpoints}` or `@{selected|spellpoints}` and operates like an attribute."
    			}
    		]
    	},
    	{
    		id: "target-selection",
    		title: "Target Selection",
    		blocks: [
    			{
    				type: "paragraph",
    				text: "One of these options must be specified to determine which characters will be affected:"
    			}
    		],
    		subsections: [
    			{
    				id: "all",
    				title: "--all",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Affects all characters in the campaign. **GM only** and should be used with caution, especially in large campaigns."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!resetattr --all --hp"
    						]
    					}
    				]
    			},
    			{
    				id: "allgm",
    				title: "--allgm",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Affects all characters without player controllers (typically NPCs). **GM only**."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --allgm --reset --hp"
    						]
    					}
    				]
    			},
    			{
    				id: "allplayers",
    				title: "--allplayers",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Affects all characters with player controllers (typically PCs)."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --allplayers --mod --hp|-15"
    						]
    					}
    				]
    			},
    			{
    				id: "charid",
    				title: "--charid",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Affects characters with the specified character IDs. Non-GM players can only affect characters they control.  Multiple IDs must be separated by a comma."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --charid <ID1>, <ID2> --hp|150"
    						]
    					}
    				]
    			},
    			{
    				id: "name",
    				title: "--name",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Affects characters with the specified names. Non-GM players can only affect characters they control.  Multiple character names must be separated by a comma."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --name Gandalf, Frodo Baggins --party|\"Fellowship of the Ring\""
    						]
    					}
    				]
    			},
    			{
    				id: "sel",
    				title: "--sel",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Affects characters represented by currently selected tokens."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --hp|25 --hp_temp|8"
    						]
    					}
    				]
    			},
    			{
    				id: "sel-party",
    				title: "--sel-party",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Affects only party characters represented by currently selected tokens (characters with `inParty` set to true)."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel-party --inspiration|1"
    						]
    					}
    				]
    			},
    			{
    				id: "sel-noparty",
    				title: "--sel-noparty",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Affects only non-party characters represented by currently selected tokens (characters with `inParty` set to false or not set)."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel-noparty --npc_status|\"Hostile\""
    						]
    					}
    				]
    			},
    			{
    				id: "party",
    				title: "--party",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Affects all characters marked as party members (characters with `inParty` set to true). **GM only by default**, but can be enabled for players with configuration."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --party --rest_complete|1"
    						]
    					}
    				]
    			}
    		]
    	},
    	{
    		id: "attribute-syntax",
    		title: "Attribute Syntax",
    		blocks: [
    			{
    				type: "paragraph",
    				text: "The syntax for specifying attributes is:"
    			},
    			{
    				type: "codeBlock",
    				lines: [
    					"--attributeName|currentValue|maxValue"
    				]
    			},
    			{
    				type: "unorderedList",
    				items: [
    					"`attributeName` is the name of the attribute to modify",
    					"`currentValue` is the value to set (optional for some commands)",
    					"`maxValue` is the maximum value to set (optional)"
    				]
    			}
    		],
    		subsections: [
    			{
    				id: "examples",
    				title: "Examples:",
    				blocks: [
    					{
    						type: "orderedList",
    						items: [
    							{
    								text: "Set current value only:",
    								codeBlock: {
    									lines: [
    										"--strength|15"
    									]
    								}
    							},
    							{
    								text: "Set both current and maximum values:",
    								codeBlock: {
    									lines: [
    										"--hp|27|35"
    									]
    								}
    							},
    							{
    								text: "Set only the maximum value (leave current unchanged):",
    								codeBlock: {
    									lines: [
    										"--hp||50"
    									]
    								}
    							},
    							{
    								text: "Create empty attribute or set to empty:",
    								codeBlock: {
    									lines: [
    										"--notes|"
    									]
    								}
    							},
    							{
    								text: "Use `#` instead of `|` (useful in roll queries):",
    								codeBlock: {
    									lines: [
    										"--strength#15"
    									]
    								}
    							}
    						]
    					}
    				]
    			}
    		]
    	},
    	{
    		id: "modifier-options",
    		title: "Modifier Options",
    		blocks: [
    			{
    				type: "paragraph",
    				text: "These options change how attributes are processed:"
    			}
    		],
    		subsections: [
    			{
    				id: "mod",
    				title: "--mod",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "See `!modattr` command."
    					}
    				]
    			},
    			{
    				id: "modb",
    				title: "--modb",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "See `!modbattr` command."
    					}
    				]
    			},
    			{
    				id: "reset",
    				title: "--reset",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "See `!resetattr` command."
    					}
    				]
    			},
    			{
    				id: "nocreate",
    				title: "--nocreate",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Prevents creation of new attributes, only updates existing ones."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --nocreate --perception|20 --hp|15"
    						]
    					},
    					{
    						type: "paragraph",
    						text: "This will only update `perception` or `hp` if it already exists."
    					}
    				]
    			},
    			{
    				id: "evaluate",
    				title: "--evaluate",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Evaluates JavaScript expressions in attribute values. **GM only by default**."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --evaluate --hp|2 * 3"
    						]
    					},
    					{
    						type: "paragraph",
    						text: "This will set the `hp` attribute to 6."
    					}
    				]
    			},
    			{
    				id: "replace",
    				title: "--replace",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Replaces special characters to prevent Roll20 from evaluating them:"
    					},
    					{
    						type: "unorderedList",
    						items: [
    							"< becomes [",
    							"> becomes ]",
    							"~ becomes -",
    							"; becomes ?",
    							"` becomes @"
    						]
    					},
    					{
    						type: "paragraph",
    						text: "Also supports \\lbrak, \\rbrak, \\n, \\at, and \\ques for [, ], newline, @, and ?."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --replace --notes|\"Roll <<1d6>> to succeed\""
    						]
    					},
    					{
    						type: "paragraph",
    						text: "This stores \"Roll [[1d6]] to succeed\" without evaluating the roll."
    					}
    				]
    			}
    		]
    	},
    	{
    		id: "output-control-options",
    		title: "Output Control Options",
    		blocks: [
    			{
    				type: "paragraph",
    				text: "These options control the feedback messages generated by the script:"
    			}
    		],
    		subsections: [
    			{
    				id: "silent",
    				title: "--silent",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Suppresses normal output messages (error messages will still appear)."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --silent --stealth|20"
    						]
    					}
    				]
    			},
    			{
    				id: "mute",
    				title: "--mute",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Suppresses all output messages, including errors."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --mute --nocreate --new_value|42"
    						]
    					}
    				]
    			},
    			{
    				id: "fb-public",
    				title: "--fb-public",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Sends output publicly to the chat instead of whispering to the command sender."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --fb-public --hp|25|25 --status|\"Healed\""
    						]
    					}
    				]
    			},
    			{
    				id: "fb-from",
    				title: "--fb-from <NAME>",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Changes the name of the sender for output messages (default is \"ChatSetAttr\")."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --fb-from \"Healing Potion\" --hp|25"
    						]
    					}
    				]
    			},
    			{
    				id: "fb-header",
    				title: "--fb-header <STRING>",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Customizes the header of the output message."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --evaluate --fb-header \"Combat Effects Applied\" --status|\"Poisoned\" --hp|%hp%-5"
    						]
    					}
    				]
    			},
    			{
    				id: "fb-content",
    				title: "--fb-content <STRING>",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Customizes the content of the output message."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --fb-content \"Increasing Hitpoints\" --hp|10"
    						]
    					}
    				]
    			},
    			{
    				id: "special-placeholders",
    				title: "Special Placeholders",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "For use in `--fb-header` and `--fb-content`:"
    					},
    					{
    						type: "unorderedList",
    						items: [
    							"`_NAMEJ_` - Name of the Jth attribute being changed",
    							"`_TCURJ_` - Target current value of the Jth attribute",
    							"`_TMAXJ_` - Target maximum value of the Jth attribute"
    						]
    					},
    					{
    						type: "paragraph",
    						text: "For use in `--fb-content` only:"
    					},
    					{
    						type: "unorderedList",
    						items: [
    							"`_CHARNAME_` - Name of the character",
    							"`_CURJ_` - Final current value of the Jth attribute",
    							"`_MAXJ_` - Final maximum value of the Jth attribute"
    						]
    					},
    					{
    						type: "paragraph",
    						text: "**Important:** The Jth index starts with 0 at the first item."
    					},
    					{
    						type: "paragraph",
    						text: "**Example:**"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --fb-header \"Healing Effects\" --fb-content \"_CHARNAME_ healed by _CUR0_ hitpoints --hp|10"
    						]
    					}
    				]
    			}
    		]
    	},
    	{
    		id: "inline-roll-integration",
    		title: "Inline Roll Integration",
    		blocks: [
    			{
    				type: "paragraph",
    				text: "ChatSetAttr can be used within roll templates or combined with inline rolls:"
    			}
    		],
    		subsections: [
    			{
    				id: "within-roll-templates",
    				title: "Within Roll Templates",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Place the command between roll template properties and end it with `!!!`:"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"&{template:default} {{name=Fireball Damage}} !setattr --mod --name @{target|character_name} --silent --hp|-{{damage=[[8d6]]}}!!! {{effect=Fire damage}}"
    						]
    					}
    				]
    			},
    			{
    				id: "using-inline-rolls-in-values",
    				title: "Using Inline Rolls in Values",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Inline rolls can be used for attribute values:"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --hp|[[2d6+5]]"
    						]
    					}
    				]
    			},
    			{
    				id: "roll-queries",
    				title: "Roll Queries",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Roll queries can determine attribute values:"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --hp|?{Set strength to what value?|100}"
    						]
    					}
    				]
    			}
    		]
    	},
    	{
    		id: "repeating-section-support",
    		title: "Repeating Section Support",
    		blocks: [
    			{
    				type: "paragraph",
    				text: "ChatSetAttr supports working with repeating sections:"
    			}
    		],
    		subsections: [
    			{
    				id: "creating-new-repeating-items",
    				title: "Creating New Repeating Items",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Use `CREATE` to create a new row in a repeating section:"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --repeating_inventory_CREATE_itemname|\"Magic Sword\" --repeating_inventory_CREATE_itemweight|2"
    						]
    					}
    				]
    			},
    			{
    				id: "modifying-existing-repeating-items",
    				title: "Modifying Existing Repeating Items",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Access by row ID:"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --repeating_inventory_ID_itemname|\"Enchanted Magic Sword\""
    						]
    					},
    					{
    						type: "paragraph",
    						text: "Access by index (starts at 0):"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --repeating_inventory_$0_itemname|\"First Item\""
    						]
    					}
    				]
    			},
    			{
    				id: "deleting-repeating-rows",
    				title: "Deleting Repeating Rows",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Delete by row ID:"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!delattr --sel --repeating_inventory_ID"
    						]
    					},
    					{
    						type: "paragraph",
    						text: "Delete by index:"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!delattr --sel --repeating_inventory_$0"
    						]
    					},
    					{
    						type: "note",
    						text: "repeating sections for Beacon sheets are currently not supported.  They are read-only which prevents ChatSetAttr from being able to modify them.",
    						emphasis: true
    					}
    				]
    			}
    		]
    	},
    	{
    		id: "special-value-expressions",
    		title: "Special Value Expressions",
    		subsections: [
    			{
    				id: "attribute-references",
    				title: "Attribute References",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Reference other attribute values using `%attribute_name%`:"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --evaluate --temp_hp|%hp% / 2"
    						]
    					}
    				]
    			},
    			{
    				id: "resetting-to-maximum",
    				title: "Resetting to Maximum",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Reset an attribute to its maximum value:"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --hp|%hp_max%"
    						]
    					}
    				]
    			}
    		]
    	},
    	{
    		id: "global-configuration",
    		title: "Global Configuration",
    		blocks: [
    			{
    				type: "paragraph",
    				text: "The script has four global configuration options that can be toggled with `!setattr-config`:"
    			}
    		],
    		subsections: [
    			{
    				id: "players-can-modify",
    				title: "--players-can-modify",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Allows players to modify attributes on characters they don't control."
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr-config --players-can-modify"
    						]
    					}
    				]
    			},
    			{
    				id: "players-can-evaluate",
    				title: "--players-can-evaluate",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Allows players to use the `--evaluate` option."
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr-config --players-can-evaluate"
    						]
    					}
    				]
    			},
    			{
    				id: "players-can-target-party",
    				title: "--players-can-target-party",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Allows players to use the `--party` target option. **GM only by default**."
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr-config --players-can-target-party"
    						]
    					}
    				]
    			},
    			{
    				id: "use-workers",
    				title: "--use-workers",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Toggles whether the script triggers sheet workers when setting attributes."
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr-config --use-workers"
    						]
    					}
    				]
    			}
    		]
    	},
    	{
    		id: "complete-examples",
    		title: "Complete Examples",
    		subsections: [
    			{
    				id: "basic-combat-example",
    				title: "Basic Combat Example",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Reduce a character's HP and status after taking damage:"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!modattr --sel --evaluate --hp|-15 --fb-header \"Combat Result\" --fb-content \"_CHARNAME_ took 15 damage and has _CUR0_ HP remaining!\""
    						]
    					}
    				]
    			},
    			{
    				id: "leveling-up-a-character",
    				title: "Leveling Up a Character",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Update multiple stats when a character gains a level:"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --level|8 --hp|75|75 --attack_bonus|7 --fb-from \"Level Up\" --fb-header \"Character Advanced\" --fb-public"
    						]
    					}
    				]
    			},
    			{
    				id: "create-new-item-in-inventory",
    				title: "Create New Item in Inventory",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Add a new item to a character's inventory:"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel --repeating_inventory_-CREATE_itemname|\"Healing Potion\" --repeating_inventory_-CREATE_itemcount|3 --repeating_inventory_-CREATE_itemweight|0.5 --repeating_inventory_-CREATE_itemcontent|\"Restores 2d8+2 hit points when consumed\""
    						]
    					}
    				]
    			},
    			{
    				id: "apply-status-effects-during-combat",
    				title: "Apply Status Effects During Combat",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Apply a debuff to selected enemies in the middle of combat:"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"&{template:default} {{name=Web Spell}} {{effect=Slows movement}} !setattr --name @{target|character_name} --silent --speed|-15 --status|\"Restrained\"!!! {{duration=1d4 rounds}}"
    						]
    					}
    				]
    			},
    			{
    				id: "party-management-examples",
    				title: "Party Management Examples",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "Give inspiration to all party members after a great roleplay moment:"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --party --inspiration|1 --fb-public --fb-header \"Inspiration Awarded\" --fb-content \"All party members receive inspiration for excellent roleplay!\""
    						]
    					},
    					{
    						type: "paragraph",
    						text: "Apply a long rest to only party characters among selected tokens:"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel-party --hp|%hp_max% --spell_slots_reset|1 --fb-header \"Long Rest Complete\""
    						]
    					},
    					{
    						type: "paragraph",
    						text: "Set hostile status for non-party characters among selected tokens:"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"!setattr --sel-noparty --attitude|\"Hostile\" --fb-from \"DM\" --fb-content \"Enemies are now hostile!\""
    						]
    					}
    				]
    			}
    		]
    	},
    	{
    		id: "for-developers",
    		title: "For Developers",
    		subsections: [
    			{
    				id: "registering-observers",
    				title: "Registering Observers",
    				blocks: [
    					{
    						type: "paragraph",
    						text: "If you're developing your own scripts, you can register observer functions to react to attribute changes made by ChatSetAttr:"
    					},
    					{
    						type: "codeBlock",
    						lines: [
    							"ChatSetAttr.registerObserver(event, observer);"
    						]
    					},
    					{
    						type: "paragraph",
    						text: "Where `event` is one of:"
    					},
    					{
    						type: "unorderedList",
    						items: [
    							"`\"add\"` - Called when attributes are created",
    							"`\"change\"` - Called when attributes are modified",
    							"`\"destroy\"` - Called when attributes are deleted"
    						]
    					},
    					{
    						type: "paragraph",
    						text: "And `observer` is an event handler function similar to Roll20's built-in event handlers."
    					},
    					{
    						type: "paragraph",
    						text: "This allows your scripts to react to changes made by ChatSetAttr the same way they would react to changes made directly by Roll20's interface."
    					}
    				]
    			}
    		]
    	}
    ];
    var helpContent = {
    	$schema: $schema,
    	title: title,
    	introduction: introduction,
    	sections: sections
    };

    function loadHelpDocument() {
        return helpContent;
    }

    const INLINE_PATTERN = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    function renderInlineHtml(text) {
        const parts = [];
        let lastIndex = 0;
        let match;
        INLINE_PATTERN.lastIndex = 0;
        while ((match = INLINE_PATTERN.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(escapeHtml(text.slice(lastIndex, match.index)));
            }
            const token = match[0];
            if (token.startsWith("**")) {
                parts.push(`<strong>${escapeHtml(token.slice(2, -2))}</strong>`);
            }
            else {
                parts.push(`<code>${escapeHtml(token.slice(1, -1))}</code>`);
            }
            lastIndex = match.index + token.length;
        }
        if (lastIndex < text.length) {
            parts.push(escapeHtml(text.slice(lastIndex)));
        }
        return new SafeHtml(parts.join(""));
    }
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
    function joinCodeLines(lines) {
        return lines.join("\n");
    }

    function concatHtml(...parts) {
        return new SafeHtml(parts.map(part => part.html).join(""));
    }
    function renderBlocks(blocks) {
        if (!blocks)
            return [];
        const parts = [];
        for (const block of blocks) {
            switch (block.type) {
                case "paragraph":
                    parts.push(h("p", {}, renderInlineHtml(block.text)));
                    break;
                case "codeBlock":
                    parts.push(h("pre", {}, h("code", {}, joinCodeLines(block.lines))));
                    break;
                case "unorderedList":
                    parts.push(h("ul", {}, ...block.items.map(item => h("li", {}, renderInlineHtml(item)))));
                    break;
                case "orderedList":
                    parts.push(h("ol", {}, ...block.items.map(item => {
                        const children = [renderInlineHtml(item.text)];
                        if (item.codeBlock) {
                            children.push(h("pre", {}, h("code", {}, joinCodeLines(item.codeBlock.lines))));
                        }
                        return h("li", {}, ...children);
                    })));
                    break;
                case "note":
                    parts.push(block.emphasis
                        ? h("p", {}, h("em", {}, h("strong", {}, "Note:"), " ", renderInlineHtml(block.text)))
                        : h("p", {}, renderInlineHtml(block.text)));
                    break;
            }
        }
        return parts;
    }
    function renderSubsection(subsection) {
        return concatHtml(h("h3", {}, subsection.title), ...renderBlocks(subsection.blocks));
    }
    function renderSection(section) {
        return concatHtml(h("h2", { id: section.id }, section.title), ...renderBlocks(section.blocks), ...(section.subsections?.map(renderSubsection) ?? []));
    }
    function renderTableOfContents(doc, handoutID) {
        return h("ol", {}, ...doc.sections.map(section => h("li", {}, h("a", {
            href: `http://journal.roll20.net/handout/${handoutID}/#${section.title.replace(/\s+/g, "%20")}`,
        }, section.title))));
    }
    function renderHelpHtml(doc, handoutID) {
        return concatHtml(h("h1", {}, doc.title), h("p", {}, doc.introduction), h("h2", {}, "Table of Contents"), renderTableOfContents(doc, handoutID), ...doc.sections.map(section => renderSection(section))).html;
    }

    function createHelpHandout(handoutID) {
        return renderHelpHtml(loadHelpDocument(), handoutID);
    }

    var updatedAt = 1781657828941;
    var contentRevision = {
    	updatedAt: updatedAt
    };

    const revision = contentRevision;
    function getBundledHelpContentUpdatedAt() {
        return revision.updatedAt;
    }

    const HELP_COMMAND = "!setattr-help";
    const HELP_HANDOUT_NAME = "ChatSetAttr Help";
    function checkHelpMessage(msg) {
        return msg.trim().toLowerCase().startsWith(HELP_COMMAND);
    }
    function findHelpHandout() {
        return findObjs({
            _type: "handout",
            name: HELP_HANDOUT_NAME,
        })[0];
    }
    function applyHelpContentToHandout(handout) {
        const helpContent = createHelpHandout(handout.id);
        const bundledAt = getBundledHelpContentUpdatedAt();
        handout.set({
            inplayerjournals: "all",
            notes: helpContent,
        });
        setConfig({ helpContentUpdatedAt: bundledAt });
    }
    function handleHelpCommand() {
        let handout = findHelpHandout();
        if (!handout) {
            handout = createObj("handout", {
                name: HELP_HANDOUT_NAME,
            });
        }
        applyHelpContentToHandout(handout);
    }
    function syncHelpHandoutOnStartup() {
        const handout = findHelpHandout();
        if (!handout) {
            return;
        }
        const bundledAt = getBundledHelpContentUpdatedAt();
        const stateAt = getConfig().helpContentUpdatedAt;
        if (stateAt >= bundledAt) {
            return;
        }
        applyHelpContentToHandout(handout);
    }

    function inlineRollValue(roll) {
        const tableItems = roll.results.rolls.reduce((names, subRoll) => {
            const tableSubRoll = subRoll;
            if (!Object.prototype.hasOwnProperty.call(tableSubRoll, "table")) {
                return names;
            }
            const subNames = (tableSubRoll.results ?? [])
                .map(result => result.tableItem?.name ?? "")
                .filter(Boolean);
            if (subNames.length) {
                names.push(subNames.join(", "));
            }
            return names;
        }, []);
        const tableText = tableItems.filter(Boolean).join(", ");
        return (tableText.length && tableText) || roll.results.total || 0;
    }
    function normalizeTemplateRollProperties(content) {
        return content
            .replace(/\{\{[^}[\]]+=\$?\[\[(\d+)\]\].*?\}\}/g, (_, index) => `$[[${index}]]`)
            .replace(/\{\{[^}=]+=([^}]+)\}\}/g, (_, value) => value.trim());
    }
    function processInlinerolls(msg) {
        if (!msg.inlinerolls?.length) {
            return msg.content;
        }
        const values = msg.inlinerolls.map(roll => String(inlineRollValue(roll)));
        return values.reduce((content, value, index) => content.replace(`$[[${index}]]`, value), msg.content);
    }

    // #region Commands
    const COMMAND_TYPE = [
        "setattr",
        "modattr",
        "modbattr",
        "resetattr",
        "delattr"
    ];
    function isCommand(command) {
        return COMMAND_TYPE.includes(command);
    }
    // #region Command Options
    const COMMAND_OPTIONS = [
        "mod",
        "modb",
        "reset"
    ];
    const OVERRIDE_DICTIONARY = {
        "mod": "modattr",
        "modb": "modbattr",
        "reset": "resetattr",
    };
    function isCommandOption(option) {
        return COMMAND_OPTIONS.includes(option);
    }
    // #region Targets
    const TARGETS = [
        "all",
        "allgm",
        "allplayers",
        "charid",
        "name",
        "sel",
        "sel-noparty",
        "sel-party",
        "party",
    ];
    // #region Feedback
    const FEEDBACK_OPTIONS = [
        "fb-public",
        "fb-from",
        "fb-header",
        "fb-content",
    ];
    function isFeedbackOption(option) {
        for (const fbOption of FEEDBACK_OPTIONS) {
            if (option.startsWith(fbOption))
                return true;
        }
        return false;
    }
    function extractFeedbackKey(option) {
        if (option === "fb-public")
            return "public";
        if (option === "fb-from")
            return "from";
        if (option === "fb-header")
            return "header";
        if (option === "fb-content")
            return "content";
        return false;
    }
    // #region Options
    const OPTIONS = [
        "nocreate",
        "evaluate",
        "replace",
        "silent",
        "mute",
    ];
    function isOption(option) {
        return OPTIONS.includes(option);
    }
    // #region Alias Characters
    const ALIAS_CHARACTERS = {
        "<": "[",
        ">": "]",
        "~": "-",
        ";": "?",
        "`": "@",
    };

    // #region Inline Message Extraction and Validation
    function validateMessage(content) {
        for (const command of COMMAND_TYPE) {
            const messageCommand = content.split(" ")[0];
            if (messageCommand === `!${command}`) {
                return true;
            }
        }
        return false;
    }
    function extractMessageFromRollTemplate(msg) {
        for (const command of COMMAND_TYPE) {
            if (msg.content.includes(command)) {
                const regex = new RegExp(`(!${command}.*?)!!!`, "gi");
                const match = regex.exec(msg.content);
                if (match)
                    return match[1].trim();
            }
        }
        return false;
    }
    // #region Message Parsing
    function extractOperation(parts) {
        if (parts.length === 0) {
            log("Empty Command.");
            return;
        }
        const commandPart = parts.shift();
        const tokens = commandPart.trim().split(/\s+/).filter(Boolean);
        if (tokens.length === 0) {
            log("Empty Command.");
            return;
        }
        if (!tokens[0].startsWith("!")) {
            log("Invalid Command.");
            return;
        }
        const command = tokens[0].slice(1);
        if (!isCommand(command)) {
            log("Invalid Command.");
            return;
        }
        if (tokens.length > 1) {
            parts.unshift(tokens.slice(1).join(" "));
        }
        return command;
    }
    function extractReferences(value) {
        if (typeof value !== "string")
            return [];
        const matches = value.matchAll(/%[a-zA-Z0-9_]+%/g);
        return Array.from(matches, m => m[0]);
    }
    function splitMessage(content) {
        const split = content.split("--").map(part => part.trim());
        return split;
    }
    function includesATarget(part) {
        if (part.includes("|") || part.includes("#"))
            return false;
        [part] = part.split(" ").map(p => p.trim());
        for (const target of TARGETS) {
            const isMatch = part.toLowerCase() === target.toLowerCase();
            if (isMatch)
                return true;
        }
        return false;
    }
    function parseMessage(content) {
        const parts = splitMessage(content);
        let operation = extractOperation(parts);
        if (!operation) {
            return;
        }
        const targeting = [];
        const options = {};
        const changes = [];
        const references = [];
        const feedback = { public: false };
        for (const part of parts) {
            if (isCommandOption(part)) {
                operation = OVERRIDE_DICTIONARY[part];
            }
            else if (isOption(part)) {
                options[part] = true;
            }
            else if (includesATarget(part)) {
                targeting.push(part);
            }
            else if (isFeedbackOption(part)) {
                const [key, ...valueParts] = part.split(" ");
                const value = valueParts.join(" ");
                const feedbackKey = extractFeedbackKey(key);
                if (!feedbackKey)
                    continue;
                if (feedbackKey === "public") {
                    feedback.public = true;
                }
                else {
                    feedback[feedbackKey] = cleanValue(value);
                }
            }
            else if (part.includes("|") || part.includes("#")) {
                const split = part.split(/[|#]/g).map(p => p.trim());
                const [attrName, attrCurrent, attrMax] = split;
                if (!attrName && !attrCurrent && !attrMax) {
                    continue;
                }
                const attribute = {};
                if (attrName)
                    attribute.name = attrName;
                if (attrCurrent)
                    attribute.current = cleanValue(attrCurrent);
                if (attrMax)
                    attribute.max = cleanValue(attrMax);
                changes.push(attribute);
                const currentMatches = extractReferences(attrCurrent);
                const maxMatches = extractReferences(attrMax);
                references.push(...currentMatches, ...maxMatches);
            }
            else {
                const suspectedAttribute = part.replace(/[^-0-9A-Za-z_$]/g, "");
                if (!suspectedAttribute)
                    continue;
                changes.push({ name: suspectedAttribute });
            }
        }
        return {
            operation,
            options,
            targeting,
            changes,
            references,
            feedback,
        };
    }

    const REPEATING_INDEX_TOKEN = /^\$(\d+)$/i;
    const REPEATING_CREATE_TOKEN = /^CREATE$/i;
    const REPEATING_DASH_CREATE_TOKEN = /^-CREATE$/i;
    function isRepeatingCreateToken(token) {
        return REPEATING_CREATE_TOKEN.test(token) || REPEATING_DASH_CREATE_TOKEN.test(token);
    }
    function parseRepeatingIdentifierToken(token) {
        if (!token)
            return null;
        const indexMatch = token.match(REPEATING_INDEX_TOKEN);
        if (indexMatch) {
            return { kind: "index", index: Number(indexMatch[1]) };
        }
        if (isRepeatingCreateToken(token)) {
            return { kind: "create" };
        }
        return { kind: "rowId", rowId: token };
    }
    function isRepeatingRowIdToken(token) {
        const parsed = parseRepeatingIdentifierToken(token);
        return parsed?.kind === "rowId";
    }
    function resolveRowIdInRepOrder(repOrder, rowId) {
        const rowIdLo = rowId.toLowerCase();
        const index = repOrder.findIndex(id => id.toLowerCase() === rowIdLo);
        if (index === -1)
            return null;
        return repOrder[index];
    }
    function parseRepeatingRowDeleteTarget(name) {
        if (extractRepeatingParts(name)) {
            return null;
        }
        const parts = name.split("_");
        if (parts.length !== 3) {
            return null;
        }
        const [repeating, section, identifierToken] = parts;
        if (repeating !== "repeating" || !section || !identifierToken) {
            return null;
        }
        const parsed = parseRepeatingIdentifierToken(identifierToken);
        if (!parsed || parsed.kind === "create") {
            return null;
        }
        const sectionPrefix = `repeating_${section}`;
        if (parsed.kind === "index") {
            return { sectionPrefix, rowIndex: parsed.index };
        }
        return { sectionPrefix, rowId: parsed.rowId };
    }
    function getSectionFromRepeatingPrefix(sectionPrefix) {
        const match = sectionPrefix.match(/^repeating_(.+)$/);
        return match ? match[1] : null;
    }
    function resolveRepeatingRowId(target, repOrder) {
        if (target.rowIndex !== undefined) {
            if (target.rowIndex < 0 || target.rowIndex >= repOrder.length) {
                return null;
            }
            return repOrder[target.rowIndex];
        }
        if (target.rowId) {
            return resolveRowIdInRepOrder(repOrder, target.rowId);
        }
        return null;
    }
    function findRepeatingRowAttributeNames(characterID, sectionPrefix, rowId) {
        const prefix = `${sectionPrefix}_${rowId}_`.toUpperCase();
        const attributes = findObjs({
            _type: "attribute",
            _characterid: characterID,
        });
        const names = [];
        for (const attribute of attributes) {
            const name = attribute.get("name");
            if (typeof name !== "string")
                continue;
            if (name.toUpperCase().startsWith(prefix)) {
                names.push(name);
            }
        }
        return names;
    }
    function expandRepeatingRowDeletes(characterID, changes, repOrders, errors, characterName) {
        const result = [];
        for (const change of changes) {
            if (!change.name)
                continue;
            const target = parseRepeatingRowDeleteTarget(change.name);
            if (!target) {
                result.push(change);
                continue;
            }
            const section = getSectionFromRepeatingPrefix(target.sectionPrefix);
            if (!section) {
                result.push(change);
                continue;
            }
            const repOrder = repOrders[section] || [];
            const resolvedRowId = resolveRepeatingRowId(target, repOrder);
            if (!resolvedRowId) {
                if (target.rowIndex !== undefined) {
                    errors.push(`Repeating row number ${target.rowIndex} invalid for character ${characterName} and repeating section ${target.sectionPrefix}.`);
                }
                else {
                    errors.push(`Repeating row id ${target.rowId} invalid for character ${characterName} and repeating section ${target.sectionPrefix}.`);
                }
                continue;
            }
            const fieldNames = findRepeatingRowAttributeNames(characterID, target.sectionPrefix, resolvedRowId);
            for (const name of fieldNames) {
                result.push({ name });
            }
        }
        return result;
    }
    function extractRepeatingParts(attributeName) {
        const [repeating, section, identifier, ...fieldParts] = attributeName.split("_");
        if (repeating !== "repeating") {
            return null;
        }
        const field = fieldParts.join("_");
        if (!section || !identifier || !field) {
            return null;
        }
        return {
            section,
            identifier,
            field
        };
    }
    function hasCreateIdentifier(attributeName) {
        const parts = extractRepeatingParts(attributeName);
        if (parts) {
            return isRepeatingCreateToken(parts.identifier);
        }
        return isRepeatingCreateToken(attributeName);
    }
    function hasIndexIdentifier(attributeName) {
        const parts = extractRepeatingParts(attributeName);
        if (!parts)
            return false;
        return REPEATING_INDEX_TOKEN.test(parts.identifier);
    }
    function convertRepOrderToArray(repOrder) {
        return repOrder.split(",").map(id => id.trim()).filter(Boolean);
    }
    function discoverRowIds(characterID, section) {
        const rowIds = new Set();
        const attributes = findObjs({
            _type: "attribute",
            _characterid: characterID,
        });
        for (const attribute of attributes) {
            const name = attribute.get("name");
            if (typeof name !== "string")
                continue;
            const parts = name.split("_");
            if (parts.length < 4)
                continue;
            if (parts[0] !== "repeating" || parts[1] !== section)
                continue;
            const identifier = parts[2];
            if (isRepeatingRowIdToken(identifier)) {
                rowIds.add(identifier);
            }
        }
        return Array.from(rowIds);
    }
    function mergeRepOrder(storedOrder, discoveredIds) {
        const discoveredSet = new Set(discoveredIds);
        const ordered = storedOrder.filter(id => discoveredSet.has(id));
        for (const id of discoveredIds) {
            if (!ordered.includes(id)) {
                ordered.push(id);
            }
        }
        return ordered;
    }
    async function getRepOrderForSection(characterID, section) {
        const repOrderAttribute = `_reporder_repeating_${section}`;
        const repOrder = await libSmartAttributes.getAttribute(characterID, repOrderAttribute);
        return repOrder;
    }
    function getAllSectionNames(attributes) {
        const sectionNames = new Set();
        for (const attr of attributes) {
            if (!attr.name)
                continue;
            const parts = extractRepeatingParts(attr.name);
            if (parts) {
                sectionNames.add(parts.section);
                continue;
            }
            const rowDelete = parseRepeatingRowDeleteTarget(attr.name);
            if (rowDelete) {
                const section = getSectionFromRepeatingPrefix(rowDelete.sectionPrefix);
                if (section) {
                    sectionNames.add(section);
                }
            }
        }
        return Array.from(sectionNames);
    }
    async function getAllRepOrders(characterID, sectionNames) {
        const repOrders = {};
        for (const section of sectionNames) {
            const repOrderString = await getRepOrderForSection(characterID, section);
            const stored = repOrderString && typeof repOrderString === "string"
                ? convertRepOrderToArray(repOrderString)
                : [];
            const discovered = discoverRowIds(characterID, section);
            repOrders[section] = mergeRepOrder(stored, discovered);
        }
        return repOrders;
    }

    function processModifierValue(modification, resolvedAttributes, { shouldEvaluate = false, shouldAlias = false } = {}) {
        let finalValue = replacePlaceholders(modification, resolvedAttributes);
        if (shouldAlias) {
            finalValue = replaceAliasCharacters(finalValue);
        }
        if (shouldEvaluate) {
            finalValue = evaluateExpression(finalValue);
        }
        return finalValue;
    }
    function replaceAliasCharacters(modification) {
        let result = modification;
        for (const alias in ALIAS_CHARACTERS) {
            const original = ALIAS_CHARACTERS[alias];
            const regex = new RegExp(`\\${alias}`, "g");
            result = result.replace(regex, original);
        }
        return result;
    }
    function replacePlaceholders(value, attributes) {
        if (typeof value !== "string")
            return value;
        return value.replace(/%([a-zA-Z0-9_]+)%/g, (match, name) => {
            const replacement = attributes[name];
            return replacement !== undefined ? String(replacement) : match;
        });
    }
    function evaluateExpression(expression) {
        try {
            const stringValue = String(expression);
            const result = eval(stringValue);
            return result;
        }
        catch {
            return expression;
        }
    }
    function processModifierName(name, { repeatingID, repOrder }) {
        let result = name;
        const hasCreate = result.includes("CREATE");
        if (hasCreate && repeatingID) {
            if (/-CREATE/i.test(result)) {
                result = result.replace(/-CREATE/i, repeatingID);
            }
            else {
                result = result.replace(/CREATE/i, repeatingID);
            }
        }
        const rowIndexMatch = result.match(/\$(\d+)/);
        if (rowIndexMatch && repOrder) {
            const rowIndex = parseInt(rowIndexMatch[1], 10);
            const rowID = repOrder[rowIndex];
            if (!rowID)
                return result;
            result = result.replace(`$${rowIndex}`, rowID);
        }
        return result;
    }
    function processModifications(modifications, resolved, options, repOrders, errors = [], characterName = "") {
        const processedModifications = [];
        const repeatingID = libUUID.generateRowID();
        for (const mod of modifications) {
            if (!mod.name)
                continue;
            let processedName = mod.name;
            const parts = extractRepeatingParts(mod.name);
            if (parts) {
                const hasCreate = hasCreateIdentifier(parts.identifier);
                const repOrder = repOrders[parts.section] || [];
                processedName = processModifierName(mod.name, {
                    repeatingID: hasCreate ? repeatingID : parts.identifier,
                    repOrder,
                });
                if (hasIndexIdentifier(mod.name)) {
                    const unresolvedIndex = processedName.match(/\$(\d+)/);
                    if (unresolvedIndex) {
                        errors.push(`Repeating row number ${unresolvedIndex[1]} invalid for character ${characterName} and repeating section repeating_${parts.section}.`);
                        continue;
                    }
                }
            }
            let processedCurrent = undefined;
            if (mod.current !== undefined && mod.current !== "undefined") {
                processedCurrent = String(mod.current);
                processedCurrent = processModifierValue(processedCurrent, resolved, {
                    shouldEvaluate: options.evaluate,
                    shouldAlias: options.replace,
                });
            }
            let processedMax = undefined;
            if (mod.max !== undefined) {
                processedMax = String(mod.max);
                processedMax = processModifierValue(processedMax, resolved, {
                    shouldEvaluate: options.evaluate,
                    shouldAlias: options.replace,
                });
            }
            const processedMod = {
                name: processedName,
            };
            if (processedCurrent !== undefined) {
                processedMod.current = processedCurrent;
            }
            if (processedMax !== undefined) {
                processedMod.max = processedMax;
            }
            processedModifications.push(processedMod);
        }
        return processedModifications;
    }

    const permissions = {
        playerID: "",
        isGM: false,
        canModify: false,
    };
    function checkPermissions(playerID) {
        const player = getObj("player", playerID);
        if (!player) {
            if ("API" === playerID) {
                // allow API full access
                setPermissions(playerID, true, true);
                return true;
            }
            log(`Player with ID ${playerID} not found.`);
            return false;
        }
        const isGM = playerIsGM(playerID);
        const config = getConfig();
        const playersCanModify = config.playersCanModify || false;
        const canModify = isGM || playersCanModify;
        setPermissions(playerID, isGM, canModify);
        return true;
    }
    function setPermissions(playerID, isGM, canModify) {
        permissions.playerID = playerID;
        permissions.isGM = isGM;
        permissions.canModify = canModify;
    }
    function getPermissions() {
        return { ...permissions };
    }
    function checkPermissionForTarget(playerID, target) {
        const isAPI = "API" == playerID;
        if (isAPI) {
            return true;
        }
        const player = getObj("player", playerID);
        if (!player) {
            return false;
        }
        const isGM = playerIsGM(playerID);
        if (isGM) {
            return true;
        }
        if (getConfig().playersCanModify) {
            return true;
        }
        const character = getObj("character", target);
        if (!character) {
            return false;
        }
        const controlledBy = (character.get("controlledby") || "").split(",");
        return controlledBy.includes(playerID);
    }

    function generateSelectedTargets(message, type) {
        const errors = [];
        const targets = [];
        if (!message.selected)
            return { targets, errors };
        for (const token of message.selected) {
            const tokenObj = getObj("graphic", token._id);
            if (!tokenObj) {
                errors.push(`Selected token with ID ${token._id} not found.`);
                continue;
            }
            if (tokenObj.get("_subtype") !== "token") {
                errors.push(`Selected object with ID ${token._id} is not a token.`);
                continue;
            }
            const represents = tokenObj.get("represents");
            const character = getObj("character", represents);
            if (!character) {
                errors.push(`Token with ID ${token._id} does not represent a character.`);
                continue;
            }
            const inParty = character.get("inParty");
            if (type === "sel-noparty" && inParty) {
                continue;
            }
            if (type === "sel-party" && !inParty) {
                continue;
            }
            targets.push(character.id);
        }
        return {
            targets,
            errors,
        };
    }
    function generateAllTargets(type) {
        const { isGM } = getPermissions();
        const errors = [];
        if (!isGM) {
            errors.push(`Only GMs can use the '${type}' target option.`);
            return {
                targets: [],
                errors,
            };
        }
        const characters = findObjs({ _type: "character" });
        if (type === "all") {
            return {
                targets: characters.map(char => char.id),
                errors,
            };
        }
        else if (type === "allgm") {
            const targets = characters.filter(char => {
                const controlledBy = char.get("controlledby");
                return !controlledBy;
            }).map(char => char.id);
            return {
                targets,
                errors,
            };
        }
        else if (type === "allplayers") {
            const targets = characters.filter(char => {
                const controlledBy = char.get("controlledby");
                return !!controlledBy;
            }).map(char => char.id);
            return {
                targets,
                errors,
            };
        }
        return {
            targets: [],
            errors: [`Unknown target type '${type}'.`],
        };
    }
    function generateCharacterIDTargets(values) {
        const { playerID } = getPermissions();
        const targets = [];
        const errors = [];
        for (const charID of values) {
            const character = getObj("character", charID);
            if (!character) {
                errors.push(`Character with ID ${charID} not found.`);
                continue;
            }
            const characterID = character.id;
            const hasPermission = checkPermissionForTarget(playerID, characterID);
            if (!hasPermission) {
                errors.push(`Permission error. You do not have permission to modify character with ID ${charID}.`);
                continue;
            }
            targets.push(characterID);
        }
        return {
            targets,
            errors,
        };
    }
    function generatePartyTargets() {
        const { isGM } = getPermissions();
        const { playersCanTargetParty } = getConfig();
        const targets = [];
        const errors = [];
        if (!isGM && !playersCanTargetParty) {
            errors.push("Only GMs can use the 'party' target option.");
            return {
                targets,
                errors,
            };
        }
        const characters = findObjs({ _type: "character", inParty: true });
        for (const character of characters) {
            const characterID = character.id;
            targets.push(characterID);
        }
        return {
            targets,
            errors,
        };
    }
    function splitCommaSeparatedValues(valueString) {
        if (!valueString) {
            return [];
        }
        return valueString.split(/\s*,\s*/).map(v => v.trim()).filter(v => v.length > 0);
    }
    function parseTargetOption(option) {
        const trimmed = option.trim();
        const spaceIndex = trimmed.indexOf(" ");
        if (spaceIndex === -1) {
            return { type: trimmed, values: [] };
        }
        const type = trimmed.slice(0, spaceIndex);
        const remainder = trimmed.slice(spaceIndex + 1).trim();
        if (type === "name" || type === "charid") {
            return { type, values: splitCommaSeparatedValues(remainder) };
        }
        return { type, values: [] };
    }
    function generateNameTargets(values) {
        const { playerID } = getPermissions();
        const targets = [];
        const errors = [];
        for (const name of values) {
            const characters = findObjs({ _type: "character", name }, { caseInsensitive: true });
            if (characters.length === 0) {
                errors.push(`Character with name "${name}" not found.`);
                continue;
            }
            if (characters.length > 1) {
                errors.push(`Multiple characters found with name "${name}". Please use character ID instead.`);
                continue;
            }
            const character = characters[0];
            const characterID = character.id;
            const hasPermission = checkPermissionForTarget(playerID, characterID);
            if (!hasPermission) {
                errors.push(`Permission error. You do not have permission to modify character with name "${name}".`);
                continue;
            }
            targets.push(characterID);
        }
        return {
            targets,
            errors,
        };
    }
    function generateTargets(message, targetOptions) {
        const characterIDs = [];
        const errors = [];
        for (const option of targetOptions) {
            const { type, values } = parseTargetOption(option);
            if (type === "sel" || type === "sel-noparty" || type === "sel-party") {
                const results = generateSelectedTargets(message, type);
                characterIDs.push(...results.targets);
                errors.push(...results.errors);
            }
            else if (type === "all" || type === "allgm" || type === "allplayers") {
                const results = generateAllTargets(type);
                characterIDs.push(...results.targets);
                errors.push(...results.errors);
            }
            else if (type === "charid") {
                const results = generateCharacterIDTargets(values);
                characterIDs.push(...results.targets);
                errors.push(...results.errors);
            }
            else if (type === "name") {
                const results = generateNameTargets(values);
                characterIDs.push(...results.targets);
                errors.push(...results.errors);
            }
            else if (type === "party") {
                const results = generatePartyTargets();
                characterIDs.push(...results.targets);
                errors.push(...results.errors);
            }
        }
        const targets = Array.from(new Set(characterIDs));
        return {
            targets,
            errors,
        };
    }

    const timerMap = new Map();
    function startTimer(key, duration = 50, callback) {
        // Clear any existing timer for the same key
        const existingTimer = timerMap.get(key);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }
        const timer = setTimeout(() => {
            callback();
            timerMap.delete(key);
        }, duration);
        timerMap.set(key, timer);
    }
    function clearTimer(key) {
        const timer = timerMap.get(key);
        if (timer) {
            clearTimeout(timer);
            timerMap.delete(key);
        }
    }

    function broadcastHeader() {
        log(`${scriptJson.name} v${scriptJson.version} by ${scriptJson.authors.join(", ")} loaded.`);
    }
    function checkDependencies() {
        const errors = [];
        if (libSmartAttributes === undefined) {
            errors.push("libSmartAttributes is required but not found. Please ensure the libSmartAttributes script is installed.");
        }
        if (libUUID === undefined) {
            errors.push("libUUID is required but not found. Please ensure the libUUID script is installed.");
        }
        if (errors.length > 0) {
            sendErrors("gm", "Missing Dependencies", errors);
        }
        return errors.length === 0;
    }
    async function acceptMessage(msg) {
        // State
        const errors = [];
        const messages = [];
        const result = {};
        // Parse Message
        const parsed = parseMessage(msg.content);
        if (!parsed) {
            return errorOut("Could not parse command. Check that command options use -- (double dash).", msg.playerid, errors, normalizeCommandOutputOptions());
        }
        const { operation, targeting, options, changes, references, feedback, } = parsed;
        const output = normalizeCommandOutputOptions(options);
        // Start Timer
        startTimer("chatsetattr", 8000, () => sendDelayMessage(msg.playerid, output));
        // Check Config and Permissions
        const config = getConfig();
        const isAPI = "API" === msg.playerid;
        const isGM = playerIsGM(msg.playerid);
        if (options.evaluate && !isAPI && !isGM && !config.playersCanEvaluate) {
            return errorOut("You do not have permission to use the evaluate option.", msg.playerid, errors, output);
        }
        if (targeting.includes("party") && !isAPI && !isGM && !config.playersCanTargetParty) {
            return errorOut("You do not have permission to target the party.", msg.playerid, errors, output);
        }
        if ((operation === "modattr" || operation === "modbattr") && !isAPI && !isGM && !config.playersCanModify) {
            return errorOut("You do not have permission to modify attributes.", msg.playerid, errors, output);
        }
        // Preprocess
        const { targets, errors: targetErrors } = generateTargets(msg, targeting);
        errors.push(...targetErrors);
        if (targets.length === 0) {
            return errorOut("No valid targets found.", msg.playerid, errors, output);
        }
        const request = generateRequest(references, changes);
        const command = handlers[operation];
        if (!command) {
            return errorOut(`Invalid operation: ${operation}`, msg.playerid, errors, output);
        }
        // Execute
        const priorValues = {};
        const pendingChanges = {};
        for (const target of targets) {
            const attrs = await getAttributes(target, request);
            priorValues[target] = attrs;
            const sectionNames = getAllSectionNames(changes);
            const repOrders = await getAllRepOrders(target, sectionNames);
            let effectiveChanges = changes;
            if (operation === "delattr") {
                effectiveChanges = expandRepeatingRowDeletes(target, changes, repOrders, errors, getCharName(target));
            }
            const modifications = processModifications(effectiveChanges, attrs, options, repOrders, errors, getCharName(target));
            const response = await command(modifications, target, references, options.nocreate, feedback);
            if (response.errors.length > 0) {
                errors.push(...response.errors);
                continue;
            }
            pendingChanges[target] = modifications;
            result[target] = response.result;
        }
        const updateResult = await makeUpdate(operation, result, {
            noCreate: options.nocreate,
            priorValues});
        clearTimer("chatsetattr");
        errors.push(...updateResult.errors);
        for (const target in result) {
            const filteredResult = filterSuccessfulResult(target, result[target], updateResult.failed);
            if (Object.keys(filteredResult).length === 0) {
                continue;
            }
            const characterName = getCharName(target);
            const targetChanges = pendingChanges[target] ?? [];
            let message;
            if (feedback?.content) {
                message = createFeedbackMessage(characterName, feedback, priorValues[target] ?? {}, filteredResult);
            }
            else if (operation === "delattr") {
                message = formatDeleteFeedback(characterName, targetChanges, filteredResult);
            }
            else {
                message = formatSettingFeedback(characterName, targetChanges, filteredResult);
            }
            if (message) {
                messages.push(message);
            }
        }
        sendErrors(msg.playerid, "Errors", errors, feedback?.from, output);
        const delSetTitle = operation === "delattr" ? "Deleting attributes" : "Setting attributes";
        const feedbackTitle = feedback?.header ?? delSetTitle;
        if (messages.length > 0) {
            sendMessages(msg.playerid, feedbackTitle, messages, {
                from: feedback?.from,
                public: feedback?.public,
            }, output);
        }
    }
    function errorOut(errorText, playerid, errors, output) {
        errors.push(errorText);
        sendErrors(playerid, "Errors", errors, undefined, output);
        clearTimer("chatsetattr");
    }
    function filterSuccessfulResult(target, targetResult, failed) {
        const filtered = {};
        for (const key in targetResult) {
            if (!failed.includes(`${target}:${key}`)) {
                filtered[key] = targetResult[key];
            }
        }
        return filtered;
    }
    function generateRequest(references, changes) {
        const referenceSet = new Set(references);
        for (const change of changes) {
            if (!change.name) {
                continue;
            }
            if (!referenceSet.has(change.name)) {
                referenceSet.add(change.name);
            }
            const maxName = `${change.name}_max`;
            if (!referenceSet.has(maxName)) {
                referenceSet.add(maxName);
            }
        }
        return Array.from(referenceSet);
    }
    function registerHandlers() {
        broadcastHeader();
        if (!checkDependencies()) {
            return;
        }
        if (!isBeaconSupported()) {
            sendBeaconUnsupportedNotice();
        }
        on("chat:message", (msg) => {
            if (msg.type !== "api") {
                const inlineMessage = extractMessageFromRollTemplate(msg);
                if (!inlineMessage)
                    return;
                msg.content = inlineMessage;
            }
            msg.content = normalizeTemplateRollProperties(msg.content);
            msg.content = processInlinerolls(msg);
            const debugReset = msg.content.startsWith("!setattrs-debugreset");
            if (debugReset) {
                log("ChatSetAttr: Debug - resetting state.");
                state.ChatSetAttr = {};
                return;
            }
            const debugVersion = msg.content.startsWith("!setattrs-debugversion");
            if (debugVersion) {
                log("ChatSetAttr: Debug - setting state schema version to 3.");
                if (!state.ChatSetAttr)
                    state.ChatSetAttr = {};
                state.ChatSetAttr.version = 3;
                return;
            }
            const isHelpMessage = checkHelpMessage(msg.content);
            if (isHelpMessage) {
                handleHelpCommand();
                return;
            }
            const isConfigMessage = checkConfigMessage(msg.content);
            if (isConfigMessage) {
                if (!playerIsGM(msg.playerid)) {
                    return;
                }
                handleConfigCommand(msg.content, msg.playerid);
                return;
            }
            const validMessage = validateMessage(msg.content);
            if (!validMessage)
                return;
            if (checkPermissions(msg.playerid)) {
                acceptMessage(msg);
            }
        });
    }

    const LI_STYLE = s({
        marginBottom: "4px",
    });
    const WRAPPER_STYLE = s(frameStyleBase);
    const PARAGRAPH_SPACING_STYLE = s({
        marginTop: "8px",
        marginBottom: "8px",
    });
    function createVersionMessage() {
        return (h("div", { style: WRAPPER_STYLE },
            h("p", null,
                h("strong", null, "ChatSetAttr has been updated to version 2.0!")),
            h("p", null, "This update includes important changes to improve compatibility and performance."),
            h("strong", null, "Changelog:"),
            h("ul", null,
                h("li", { style: LI_STYLE }, "Added compatibility for Beacon sheets, including the new Dungeons and Dragons character sheet."),
                h("li", { style: LI_STYLE },
                    "Added support for targeting party members with the ",
                    h("code", null, "--party"),
                    " flag."),
                h("li", { style: LI_STYLE },
                    "Added support for excluding party members when targeting selected tokens with the ",
                    h("code", null, "--sel-noparty"),
                    " flag."),
                h("li", { style: LI_STYLE },
                    "Added support for including only party members when targeting selected tokens with the ",
                    h("code", null, "--sel-party"),
                    " flag.")),
            h("p", null, "Please review the updated documentation for details on these new features and how to use them."),
            h("div", { style: PARAGRAPH_SPACING_STYLE },
                h("strong", null,
                    "If you encounter any bugs or issues, please report them via the ",
                    h("a", { href: "https://help.roll20.net/hc/en-us/requests/new" }, "Roll20 Helpdesk"))),
            h("div", { style: PARAGRAPH_SPACING_STYLE },
                h("strong", null,
                    "If you want to create a handout with the updated documentation, use the command ",
                    h("code", null, "!setattr-help"),
                    " or click the button below"),
                h("a", { href: "!setattr-help" }, "Create Help Handout")))).html;
    }

    const v2_0 = {
        appliesTo: "<=3",
        version: 4,
        update: () => {
            setConfig({
                version: 4,
                playersCanTargetParty: true,
                scriptVersion: scriptJson.version,
            });
            const title = "ChatSetAttr Updated to Version 2.0";
            const content = createVersionMessage();
            sendNotification(title, content, false);
        },
    };

    const VERSION_HISTORY = [
        v2_0,
    ];
    function welcome() {
        const hasWelcomed = hasFlag("welcome");
        if (hasWelcomed) {
            return;
        }
        sendWelcomeMessage();
        setFlag("welcome");
    }
    function update() {
        log("ChatSetAttr: Checking for state schema updates...");
        const currentSchemaVersion = getPersistedSchemaVersion();
        log(`ChatSetAttr: Current state schema version: ${currentSchemaVersion}`);
        checkForUpdates(currentSchemaVersion);
        persistStateVersionMetadata();
    }
    function checkForUpdates(currentSchemaVersion) {
        for (const migration of VERSION_HISTORY) {
            log(`ChatSetAttr: Evaluating schema migration to ${migration.version} (appliesTo: ${migration.appliesTo})`);
            const applies = migration.appliesTo;
            const threshold = Number(applies.replace(/(<=|<|>=|>|=)/, "").trim());
            const comparison = applies.replace(String(threshold), "").trim();
            const compared = compareSchemaVersions(currentSchemaVersion, threshold);
            let shouldApply = false;
            switch (comparison) {
                case "<=":
                    shouldApply = compared <= 0;
                    break;
                case "<":
                    shouldApply = compared < 0;
                    break;
                case ">=":
                    shouldApply = compared >= 0;
                    break;
                case ">":
                    shouldApply = compared > 0;
                    break;
                case "=":
                    shouldApply = compared === 0;
                    break;
            }
            if (shouldApply) {
                migration.update();
                currentSchemaVersion = migration.version;
                updateVersionInState(currentSchemaVersion);
            }
        }
    }
    function compareSchemaVersions(current, threshold) {
        return current - threshold;
    }
    function updateVersionInState(newSchemaVersion) {
        setConfig({ version: newSchemaVersion });
    }

    on("ready", () => {
        checkGlobalConfig();
        registerHandlers();
        syncHelpHandoutOnStartup();
        syncScriptVersion();
        update();
        welcome();
        persistStateVersionMetadata();
    });

    exports.registerObserver = registerObserver;

    return exports;

})({});
