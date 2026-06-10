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
    function h(tagName, attributes = {}, ...children) {
        const attrs = Object.entries(attributes ?? {})
            .map(([key, value]) => ` ${key}="${value}"`)
            .join("");
        // Deeply flatten arrays and filter out null/undefined values
        const flattenedChildren = children.flat(10).filter(child => child != null);
        const childrenContent = flattenedChildren.join("");
        return `<${tagName}${attrs}>${childrenContent}</${tagName}>`;
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
    const frameStyleError = {
        border: "1px solid rgba(239, 68, 68, 0.4)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
    };
    const headerStyleBase = {
        fontSize: "1.5em",
        marginBottom: "0.5em",
    };

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
        const relevantEntries = configEntries.filter(([key]) => key !== "version" && key !== "globalconfigCache" && key !== "flags");
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
                h("div", { style: CONFIG_CLEAR_FIX_STYLE }))));
    }

    const SCHEMA_VERSION = "2.0";
    const DEFAULT_CONFIG = {
        version: SCHEMA_VERSION,
        globalconfigCache: {
            lastsaved: 0
        },
        playersCanTargetParty: true,
        playersCanModify: false,
        playersCanEvaluate: false,
        useWorkers: true,
        flags: []
    };
    function getConfig() {
        const stateConfig = state?.ChatSetAttr || {};
        return {
            ...DEFAULT_CONFIG,
            ...stateConfig,
        };
    }
    function setConfig(newConfig) {
        const stateConfig = state.ChatSetAttr || {};
        state.ChatSetAttr = {
            ...stateConfig,
            ...newConfig,
            globalconfigCache: {
                lastsaved: Date.now()
            }
        };
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
    function handleConfigCommand(message) {
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
        sendChat("ChatSetAttr", configMessage, undefined, { noarchive: true });
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
        return character?.sheetEnvironment === "legacy";
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
        const character = getObj("character", target);
        if (character?.sheetEnvironment === "legacy") {
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
                const obj = resolveObserverObj(group.target, group.actualName, kind, state);
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

    const DELAY_WRAPPER_STYLE = s(frameStyleBase);
    const DELAY_HEADER_STYLE = s(headerStyleBase);
    function createDelayMessage() {
        return (h("div", { style: DELAY_WRAPPER_STYLE },
            h("div", { style: DELAY_HEADER_STYLE }, "Long Running Query"),
            h("div", null, "The operation is taking a long time to execute. This may be due to a large number of targets or attributes being processed. Please be patient as the operation completes.")));
    }

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
            h("div", { style: styles.body }, messages.map(message => h("p", null, message)))));
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

    const NOTIFY_WRAPPER_STYLE = s(frameStyleBase);
    const NOTIFY_HEADER_STYLE = s(headerStyleBase);
    function createNotifyMessage(title, content) {
        return (h("div", { style: NOTIFY_WRAPPER_STYLE },
            h("div", { style: NOTIFY_HEADER_STYLE }, title),
            h("div", null, content)));
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
                h("a", { href: "!setattrs-help", style: buttonStyle }, "Create Journal Handout"))));
    }

    function whisperPrefix(playerID) {
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
            : `${whisperPrefix(playerID)}${newMessage}`;
        sendChat(from, chatMessage);
    }
    function sendErrors(playerID, header, errors, from, output) {
        if (errors.length === 0 || output?.mute) {
            return;
        }
        const sender = from ?? "ChatSetAttr";
        const newMessage = createErrorMessage(header, errors);
        sendChat(sender, `${whisperPrefix(playerID)}${newMessage}`);
    }
    function sendDelayMessage(output) {
        if (output?.silent) {
            return;
        }
        const delayMessage = createDelayMessage();
        sendChat("ChatSetAttr", delayMessage, undefined, { noarchive: true });
    }
    function sendNotification(title, content, archive) {
        const notifyMessage = createNotifyMessage(title, content);
        sendChat("ChatSetAttr", "/w gm " + notifyMessage, undefined, { noarchive: archive });
    }
    function sendWelcomeMessage() {
        const welcomeMessage = createWelcomeMessage();
        sendNotification("Welcome to ChatSetAttr!", welcomeMessage, false);
    }

    function createFeedbackMessage(characterName, feedback, startingValues, targetValues) {
        let message = feedback?.content ?? "";
        // _NAMEJ_: will insert the attribute name.
        // _TCURJ_: will insert what you are changing the current value to (or changing by, if you're using --mod or --modb).
        // _TMAXJ_: will insert what you are changing the maximum value to (or changing by, if you're using --mod or --modb).
        // _CHARNAME_: will insert the character name.
        // _CURJ_: will insert the final current value of the attribute, for this character.
        // _MAXJ_: will insert the final maximum value of the attribute, for this character.
        const targetValueKeys = Object.keys(targetValues).filter(key => !key.endsWith("_max"));
        message = message.replace("_CHARNAME_", characterName);
        message = message.replace(/_(NAME|TCUR|TMAX|CUR|MAX)(\d+)_/g, (_, key, num) => {
            const index = parseInt(num, 10);
            const attributeName = targetValueKeys[index];
            if (!attributeName)
                return "";
            const targetCurrent = startingValues[attributeName];
            const targetMax = startingValues[`${attributeName}_max`];
            const startingCurrent = targetValues[attributeName];
            const startingMax = targetValues[`${attributeName}_max`];
            switch (key) {
                case "NAME":
                    return attributeName;
                case "TCUR":
                    return `${targetCurrent}`;
                case "TMAX":
                    return `${targetMax}`;
                case "CUR":
                    return `${startingCurrent}`;
                case "MAX":
                    return `${startingMax}`;
                default:
                    return "";
            }
        });
        return message;
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
    async function setattr(changes, target, referenced = [], noCreate = false, feedback) {
        const result = {};
        const messagesByKey = {};
        const errors = [];
        const request = createRequestList(referenced, changes, false);
        const currentValues = await getCurrentValues(target, request, changes);
        const undefinedAttributes = extractUndefinedAttributes(currentValues);
        const characterName = getCharName(target);
        for (const change of changes) {
            const { name, current, max } = change;
            if (!name)
                continue; // skip if no name provided
            if (undefinedAttributes.includes(name) && noCreate) {
                errors.push(`Missing attribute ${name} not created for ${characterName}.`);
                continue;
            }
            if (current !== undefined) {
                result[name] = current;
                let newMessage = `Set attribute '${name}' on ${characterName}.`;
                if (feedback.content) {
                    newMessage = createFeedbackMessage(characterName, feedback, currentValues, result);
                }
                messagesByKey[name] = newMessage;
            }
            if (max !== undefined) {
                result[`${name}_max`] = max;
                let newMessage = `Set attribute '${name}' on ${characterName}.`;
                if (feedback.content) {
                    newMessage = createFeedbackMessage(characterName, feedback, currentValues, result);
                }
                messagesByKey[`${name}_max`] = newMessage;
            }
        }
        return {
            result,
            messagesByKey,
            errors,
        };
    }
    async function modattr(changes, target, referenced, noCreate = false, feedback) {
        const result = {};
        const messagesByKey = {};
        const errors = [];
        const currentValues = await getCurrentValues(target, referenced, changes);
        const undefinedAttributes = extractUndefinedAttributes(currentValues);
        const characterName = getCharName(target);
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
                let newMessage = `Set attribute '${name}' on ${characterName}.`;
                if (feedback.content) {
                    newMessage = createFeedbackMessage(characterName, feedback, currentValues, result);
                }
                messagesByKey[name] = newMessage;
            }
            if (max !== undefined) {
                result[`${name}_max`] = calculateModifiedValue(currentValues[`${name}_max`], max);
                let newMessage = `Set attribute '${name}' on ${characterName}.`;
                if (feedback.content) {
                    newMessage = createFeedbackMessage(characterName, feedback, currentValues, result);
                }
                messagesByKey[`${name}_max`] = newMessage;
            }
        }
        return {
            result,
            messagesByKey,
            errors,
        };
    }
    async function modbattr(changes, target, referenced, noCreate = false, feedback) {
        const result = {};
        const messagesByKey = {};
        const errors = [];
        const request = createRequestList(referenced, changes, true);
        const currentValues = await getCurrentValues(target, request, changes);
        const undefinedAttributes = extractUndefinedAttributes(currentValues);
        const characterName = getCharName(target);
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
            let newMessage = `Modified attribute '${name}' on ${characterName}.`;
            if (feedback.content) {
                newMessage = createFeedbackMessage(characterName, feedback, currentValues, result);
            }
            if (current !== undefined) {
                messagesByKey[name] = newMessage;
            }
            if (max !== undefined) {
                messagesByKey[`${name}_max`] = newMessage;
            }
        }
        return {
            result,
            messagesByKey,
            errors,
        };
    }
    async function resetattr(changes, target, referenced, noCreate = false, feedback) {
        const result = {};
        const messagesByKey = {};
        const errors = [];
        const request = createRequestList(referenced, changes, true);
        const currentValues = await getCurrentValues(target, request, changes);
        const undefinedAttributes = extractUndefinedAttributes(currentValues);
        const characterName = getCharName(target);
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
            let newMessage = `Reset attribute '${name}' on ${characterName}.`;
            if (feedback.content) {
                newMessage = createFeedbackMessage(characterName, feedback, currentValues, result);
            }
            messagesByKey[name] = newMessage;
        }
        return {
            result,
            messagesByKey,
            errors,
        };
    }
    async function delattr(changes, target, referenced, _, feedback) {
        const result = {};
        const messagesByKey = {};
        const currentValues = await getCurrentValues(target, referenced, changes);
        const characterName = getCharName(target);
        for (const change of changes) {
            const { name } = change;
            if (!name)
                continue;
            result[name] = undefined;
            result[`${name}_max`] = undefined;
            let newMessage = `Deleted attribute '${name}' on ${characterName}.`;
            if (feedback.content) {
                newMessage = createFeedbackMessage(characterName, feedback, currentValues, result);
            }
            messagesByKey[name] = newMessage;
            if (currentValues[`${name}_max`] !== undefined) {
                messagesByKey[`${name}_max`] = newMessage;
            }
        }
        return {
            result,
            messagesByKey,
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

    function createHelpHandout(handoutID) {
        const contents = [
            "Basic Usage",
            "Available Commands",
            "Target Selection",
            "Attribute Syntax",
            "Modifier Options",
            "Output Control Options",
            "Inline Roll Integration",
            "Repeating Section Support",
            "Special Value Expressions",
            "Global Configuration",
            "Complete Examples",
            "For Developers",
        ];
        function createTableOfContents() {
            return (h("ol", null, contents.map(section => (h("li", { key: section },
                h("a", { href: `http://journal.roll20.net/handout/${handoutID}/#${section.replace(/\s+/g, "%20")}` }, section))))));
        }
        return (h("div", null,
            h("h1", null, "ChatSetAttr"),
            h("p", null, "ChatSetAttr is a Roll20 API script that allows users to create, modify, or delete character sheet attributes through chat commands macros. Whether you need to update a single character attribute or make bulk changes across multiple characters, ChatSetAttr provides flexible options to streamline your game management."),
            h("h2", null, "Table of Contents"),
            createTableOfContents(),
            h("h2", { id: "basic-usage" }, "Basic Usage"),
            h("p", null, "The script provides several command formats:"),
            h("ul", null,
                h("li", null,
                    h("code", null, "!setattr [--options]"),
                    " - Create or modify attributes"),
                h("li", null,
                    h("code", null, "!modattr [--options]"),
                    " - Shortcut for ",
                    h("code", null, "!setattr --mod"),
                    " (adds to existing values)"),
                h("li", null,
                    h("code", null, "!modbattr [--options]"),
                    " - Shortcut for ",
                    h("code", null, "!setattr --modb"),
                    " (adds to values with bounds)"),
                h("li", null,
                    h("code", null, "!resetattr [--options]"),
                    " - Shortcut for ",
                    h("code", null, "!setattr --reset"),
                    " (resets to max values)"),
                h("li", null,
                    h("code", null, "!delattr [--options]"),
                    " - Delete attributes")),
            h("p", null, "Each command requires a target selection option and one or more attributes to modify."),
            h("p", null,
                h("strong", null, "Basic structure:")),
            h("pre", null,
                h("code", null, "!setattr --[target selection] --attribute1|value1 --attribute2|value2|max2")),
            h("h2", { id: "available-commands" }, "Available Commands"),
            h("h3", null, "!setattr"),
            h("p", null,
                "Creates or updates attributes on the selected target(s). If the attribute doesn't exist, it will be created (unless ",
                h("code", null, "--nocreate"),
                " is specified)."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --sel --hp|25|50 --hp|0|800")),
            h("p", null,
                "This would set ",
                h("code", null, "hp"),
                " to 25, ",
                h("code", null, "hp_max"),
                " to 50, ",
                h("code", null, "hp"),
                " to 0 and ",
                h("code", null, "xp_max"),
                " to 800."),
            h("h3", null, "!modattr"),
            h("p", null,
                "Adds to existing attribute values (works only with numeric values). Shorthand for ",
                h("code", null, "!setattr --mod"),
                "."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!modattr --sel --hp|-5 --hp|100")),
            h("p", null,
                "This subtracts 5 from ",
                h("code", null, "hp"),
                " and adds 100 to ",
                h("code", null, "hp"),
                "."),
            h("h3", null, "!modbattr"),
            h("p", null,
                "Adds to existing attribute values but keeps the result between 0 and the maximum value. Shorthand for ",
                h("code", null, "!setattr --modb"),
                "."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!modbattr --sel --hp|-25 --hp|2500")),
            h("p", null,
                "This subtracts 5 from ",
                h("code", null, "hp"),
                " but won't reduce it below 0 and increase ",
                h("code", null, "hp"),
                " by 25, but won't increase it above ",
                h("code", null, "mp_xp"),
                "."),
            h("h3", null, "!resetattr"),
            h("p", null,
                "Resets attributes to their maximum value. Shorthand for ",
                h("code", null, "!setattr --reset"),
                "."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!resetattr --sel --hp --hp")),
            h("p", null,
                "This resets ",
                h("code", null, "hp"),
                ", and ",
                h("code", null, "hp"),
                " to their respective maximum values."),
            h("h3", null, "!delattr"),
            h("p", null, "Deletes the specified attributes."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!delattr --sel --hp --hp")),
            h("p", null,
                "This removes the ",
                h("code", null, "hp"),
                " and ",
                h("code", null, "hp"),
                " attributes."),
            h("h2", { id: "target-selection" }, "Target Selection"),
            h("p", null, "One of these options must be specified to determine which characters will be affected:"),
            h("h3", null, "--all"),
            h("p", null,
                "Affects all characters in the campaign. ",
                h("strong", null, "GM only"),
                " and should be used with caution, especially in large campaigns."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --all --hp|15")),
            h("h3", null, "--allgm"),
            h("p", null,
                "Affects all characters without player controllers (typically NPCs). ",
                h("strong", null, "GM only"),
                "."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --allgm --hp|150")),
            h("h3", null, "--allplayers"),
            h("p", null, "Affects all characters with player controllers (typically PCs)."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --allplayers --hp|15")),
            h("h3", null, "--charid"),
            h("p", null, "Affects characters with the specified character IDs. Non-GM players can only affect characters they control."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --charid <ID1> <ID2> --hp|150")),
            h("h3", null, "--name"),
            h("p", null, "Affects characters with the specified names. Non-GM players can only affect characters they control."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --name Gandalf, Frodo Baggins --party|\"Fellowship of the Ring\"")),
            h("h3", null, "--sel"),
            h("p", null, "Affects characters represented by currently selected tokens."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --sel --hp|25 --hp|30")),
            h("h3", null, "--sel-party"),
            h("p", null,
                "Affects only party characters represented by currently selected tokens (characters with ",
                h("code", null, "inParty"),
                " set to true)."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --sel-party --inspiration|1")),
            h("h3", null, "--sel-noparty"),
            h("p", null,
                "Affects only non-party characters represented by currently selected tokens (characters with ",
                h("code", null, "inParty"),
                " set to false or not set)."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --sel-noparty --npc_status|\"Hostile\"")),
            h("h3", null, "--party"),
            h("p", null,
                "Affects all characters marked as party members (characters with ",
                h("code", null, "inParty"),
                " set to true). ",
                h("strong", null, "GM only by default"),
                ", but can be enabled for players with configuration."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --party --rest_complete|1")),
            h("h2", { id: "attribute-syntax" }, "Attribute Syntax"),
            h("p", null, "The syntax for specifying attributes is:"),
            h("pre", null,
                h("code", null, "--attributeName|currentValue|maxValue")),
            h("ul", null,
                h("li", null,
                    h("code", null, "attributeName"),
                    " is the name of the attribute to modify"),
                h("li", null,
                    h("code", null, "currentValue"),
                    " is the value to set (optional for some commands)"),
                h("li", null,
                    h("code", null, "maxValue"),
                    " is the maximum value to set (optional)")),
            h("h3", null, "Examples:"),
            h("ol", null,
                h("li", null,
                    "Set current value only:",
                    h("pre", null,
                        h("code", null, "--strength|15"))),
                h("li", null,
                    "Set both current and maximum values:",
                    h("pre", null,
                        h("code", null, "--hp|27|35"))),
                h("li", null,
                    "Set only the maximum value (leave current unchanged):",
                    h("pre", null,
                        h("code", null, "--hp||50"))),
                h("li", null,
                    "Create empty attribute or set to empty:",
                    h("pre", null,
                        h("code", null, "--notes|"))),
                h("li", null,
                    "Use ",
                    h("code", null, "#"),
                    " instead of ",
                    h("code", null, "|"),
                    " (useful in roll queries):",
                    h("pre", null,
                        h("code", null, "--strength#15")))),
            h("h2", { id: "modifier-options" }, "Modifier Options"),
            h("p", null, "These options change how attributes are processed:"),
            h("h3", null, "--mod"),
            h("p", null,
                "See ",
                h("code", null, "!modattr"),
                " command."),
            h("h3", null, "--modb"),
            h("p", null,
                "See ",
                h("code", null, "!modbattr"),
                " command."),
            h("h3", null, "--reset"),
            h("p", null,
                "See ",
                h("code", null, "!resetattr"),
                " command."),
            h("h3", null, "--nocreate"),
            h("p", null, "Prevents creation of new attributes, only updates existing ones."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --sel --nocreate --perception|20 --hp|15")),
            h("p", null,
                "This will only update ",
                h("code", null, "perception"),
                " or ",
                h("code", null, "hp"),
                " if it already exists."),
            h("h3", null, "--evaluate"),
            h("p", null,
                "Evaluates JavaScript expressions in attribute values. ",
                h("strong", null, "GM only by default"),
                "."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --sel --evaluate --hp|2 * 3")),
            h("p", null,
                "This will set the ",
                h("code", null, "hp"),
                " attribute to 6."),
            h("h3", null, "--replace"),
            h("p", null, "Replaces special characters to prevent Roll20 from evaluating them:"),
            h("ul", null,
                h("li", null, "< becomes ["),
                h("li", null, "> becomes ]"),
                h("li", null, "~ becomes -"),
                h("li", null, "; becomes ?"),
                h("li", null, "` becomes @")),
            h("p", null, "Also supports \\lbrak, \\rbrak, \\n, \\at, and \\ques for [, ], newline, @, and ?."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --sel --replace --notes|\"Roll <<1d6>> to succeed\"")),
            h("p", null, "This stores \"Roll [[1d6]] to succeed\" without evaluating the roll."),
            h("h2", { id: "output-control-options" }, "Output Control Options"),
            h("p", null, "These options control the feedback messages generated by the script:"),
            h("h3", null, "--silent"),
            h("p", null, "Suppresses normal output messages (error messages will still appear)."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --sel --silent --stealth|20")),
            h("h3", null, "--mute"),
            h("p", null, "Suppresses all output messages, including errors."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --sel --mute --nocreate --new_value|42")),
            h("h3", null, "--fb-public"),
            h("p", null, "Sends output publicly to the chat instead of whispering to the command sender."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --sel --fb-public --hp|25|25 --status|\"Healed\"")),
            h("h3", null, "--fb-from <NAME>"),
            h("p", null, "Changes the name of the sender for output messages (default is \"ChatSetAttr\")."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --sel --fb-from \"Healing Potion\" --hp|25")),
            h("h3", null, "--fb-header <STRING>"),
            h("p", null, "Customizes the header of the output message."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --sel --evaluate --fb-header \"Combat Effects Applied\" --status|\"Poisoned\" --hp|%hp%-5")),
            h("h3", null, "--fb-content <STRING>"),
            h("p", null, "Customizes the content of the output message."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --sel --fb-content \"Increasing Hitpoints\" --hp|10")),
            h("h3", null, "Special Placeholders"),
            h("p", null,
                "For use in ",
                h("code", null, "--fb-header"),
                " and ",
                h("code", null, "--fb-content"),
                ":"),
            h("ul", null,
                h("li", null,
                    h("code", null, "_NAMEJ_"),
                    " - Name of the Jth attribute being changed"),
                h("li", null,
                    h("code", null, "_TCURJ_"),
                    " - Target current value of the Jth attribute"),
                h("li", null,
                    h("code", null, "_TMAXJ_"),
                    " - Target maximum value of the Jth attribute")),
            h("p", null,
                "For use in ",
                h("code", null, "--fb-content"),
                " only:"),
            h("ul", null,
                h("li", null,
                    h("code", null, "_CHARNAME_"),
                    " - Name of the character"),
                h("li", null,
                    h("code", null, "_CURJ_"),
                    " - Final current value of the Jth attribute"),
                h("li", null,
                    h("code", null, "_MAXJ_"),
                    " - Final maximum value of the Jth attribute")),
            h("p", null,
                h("strong", null, "Important:"),
                " The Jth index starts with 0 at the first item."),
            h("p", null,
                h("strong", null, "Example:")),
            h("pre", null,
                h("code", null, "!setattr --sel --fb-header \"Healing Effects\" --fb-content \"_CHARNAME_ healed by _CUR0_ hitpoints --hp|10")),
            h("h2", { id: "inline-roll-integration" }, "Inline Roll Integration"),
            h("p", null, "ChatSetAttr can be used within roll templates or combined with inline rolls:"),
            h("h3", null, "Within Roll Templates"),
            h("p", null,
                "Place the command between roll template properties and end it with ",
                h("code", null, "!!!"),
                ":"),
            h("pre", null,
                h("code", null, "&&lcub;template:default&rcub; &lcub;&lcub;name=Fireball Damage&rcub;&rcub; !setattr --name @&lcub;target|character_name&rcub; --silent --hp|-&lcub;&lcub;damage=[[8d6]]&rcub;&rcub;!!! &lcub;&lcub;effect=Fire damage&rcub;&rcub;")),
            h("h3", null, "Using Inline Rolls in Values"),
            h("p", null, "Inline rolls can be used for attribute values:"),
            h("pre", null,
                h("code", null, "!setattr --sel --hp|[[2d6+5]]")),
            h("h3", null, "Roll Queries"),
            h("p", null, "Roll queries can determine attribute values:"),
            h("pre", null,
                h("code", null, "!setattr --sel --hp|?&lcub;Set strength to what value?|100&rcub;")),
            h("h2", { id: "repeating-section-support" }, "Repeating Section Support"),
            h("p", null, "ChatSetAttr supports working with repeating sections:"),
            h("h3", null, "Creating New Repeating Items"),
            h("p", null,
                "Use ",
                h("code", null, "CREATE"),
                " to create a new row in a repeating section:"),
            h("pre", null,
                h("code", null, "!setattr --sel --repeating_inventory_CREATE_itemname|\"Magic Sword\" --repeating_inventory_CREATE_itemweight|2")),
            h("h3", null, "Modifying Existing Repeating Items"),
            h("p", null, "Access by row ID:"),
            h("pre", null,
                h("code", null, "!setattr --sel --repeating_inventory_ID_itemname|\"Enchanted Magic Sword\"")),
            h("p", null, "Access by index (starts at 0):"),
            h("pre", null,
                h("code", null, "!setattr --sel --repeating_inventory_$0_itemname|\"First Item\"")),
            h("h3", null, "Deleting Repeating Rows"),
            h("p", null, "Delete by row ID:"),
            h("pre", null,
                h("code", null, "!delattr --sel --repeating_inventory_ID")),
            h("p", null, "Delete by index:"),
            h("pre", null,
                h("code", null, "!delattr --sel --repeating_inventory_$0")),
            h("h2", { id: "special-value-expressions" }, "Special Value Expressions"),
            h("h3", null, "Attribute References"),
            h("p", null,
                "Reference other attribute values using ",
                h("code", null, "%attribute_name%"),
                ":"),
            h("pre", null,
                h("code", null, "!setattr --sel --evaluate --temp_hp|%hp% / 2")),
            h("h3", null, "Resetting to Maximum"),
            h("p", null, "Reset an attribute to its maximum value:"),
            h("pre", null,
                h("code", null, "!setattr --sel --hp|%hp_max%")),
            h("h2", { id: "global-configuration" }, "Global Configuration"),
            h("p", null,
                "The script has four global configuration options that can be toggled with ",
                h("code", null, "!setattr-config"),
                ":"),
            h("h3", null, "--players-can-modify"),
            h("p", null, "Allows players to modify attributes on characters they don't control."),
            h("pre", null,
                h("code", null, "!setattr-config --players-can-modify")),
            h("h3", null, "--players-can-evaluate"),
            h("p", null,
                "Allows players to use the ",
                h("code", null, "--evaluate"),
                " option."),
            h("pre", null,
                h("code", null, "!setattr-config --players-can-evaluate")),
            h("h3", null, "--players-can-target-party"),
            h("p", null,
                "Allows players to use the ",
                h("code", null, "--party"),
                " target option. ",
                h("strong", null, "GM only by default"),
                "."),
            h("pre", null,
                h("code", null, "!setattr-config --players-can-target-party")),
            h("h3", null, "--use-workers"),
            h("p", null, "Toggles whether the script triggers sheet workers when setting attributes."),
            h("pre", null,
                h("code", null, "!setattr-config --use-workers")),
            h("h2", { id: "complete-examples" }, "Complete Examples"),
            h("h3", null, "Basic Combat Example"),
            h("p", null, "Reduce a character's HP and status after taking damage:"),
            h("pre", null,
                h("code", null, "!modattr --sel --evaluate --hp|-15 --fb-header \"Combat Result\" --fb-content \"_CHARNAME_ took 15 damage and has _CUR0_ HP remaining!\"")),
            h("h3", null, "Leveling Up a Character"),
            h("p", null, "Update multiple stats when a character gains a level:"),
            h("pre", null,
                h("code", null, "!setattr --sel --level|8 --hp|75|75 --attack_bonus|7 --fb-from \"Level Up\" --fb-header \"Character Advanced\" --fb-public")),
            h("h3", null, "Create New Item in Inventory"),
            h("p", null, "Add a new item to a character's inventory:"),
            h("pre", null,
                h("code", null, "!setattr --sel --repeating_inventory_-CREATE_itemname|\"Healing Potion\" --repeating_inventory_-CREATE_itemcount|3 --repeating_inventory_-CREATE_itemweight|0.5 --repeating_inventory_-CREATE_itemcontent|\"Restores 2d8+2 hit points when consumed\"")),
            h("h3", null, "Apply Status Effects During Combat"),
            h("p", null, "Apply a debuff to selected enemies in the middle of combat:"),
            h("pre", null,
                h("code", null, "&&lcub;template:default&rcub; &lcub;&lcub;name=Web Spell&rcub;&rcub; &lcub;&lcub;effect=Slows movement&rcub;&rcub; !setattr --name @&lcub;target|character_name&rcub; --silent --speed|-15 --status|\"Restrained\"!!! &lcub;&lcub;duration=1d4 rounds&rcub;&rcub;")),
            h("h3", null, "Party Management Examples"),
            h("p", null, "Give inspiration to all party members after a great roleplay moment:"),
            h("pre", null,
                h("code", null, "!setattr --party --inspiration|1 --fb-public --fb-header \"Inspiration Awarded\" --fb-content \"All party members receive inspiration for excellent roleplay!\"")),
            h("p", null, "Apply a long rest to only party characters among selected tokens:"),
            h("pre", null,
                h("code", null, "!setattr --sel-party --hp|%hp_max% --spell_slots_reset|1 --fb-header \"Long Rest Complete\"")),
            h("p", null, "Set hostile status for non-party characters among selected tokens:"),
            h("pre", null,
                h("code", null, "!setattr --sel-noparty --attitude|\"Hostile\" --fb-from \"DM\" --fb-content \"Enemies are now hostile!\"")),
            h("h2", { id: "for-developers" }, "For Developers"),
            h("h3", null, "Registering Observers"),
            h("p", null, "If you're developing your own scripts, you can register observer functions to react to attribute changes made by ChatSetAttr:"),
            h("pre", null,
                h("code", null, "ChatSetAttr.registerObserver(event, observer);")),
            h("p", null,
                "Where ",
                h("code", null, "event"),
                " is one of:"),
            h("ul", null,
                h("li", null,
                    h("code", null, "\"add\""),
                    " - Called when attributes are created"),
                h("li", null,
                    h("code", null, "\"change\""),
                    " - Called when attributes are modified"),
                h("li", null,
                    h("code", null, "\"destroy\""),
                    " - Called when attributes are deleted")),
            h("p", null,
                "And ",
                h("code", null, "observer"),
                " is an event handler function similar to Roll20's built-in event handlers."),
            h("p", null, "This allows your scripts to react to changes made by ChatSetAttr the same way they would react to changes made directly by Roll20's interface.")));
    }

    function checkHelpMessage(msg) {
        return msg.trim().toLowerCase().startsWith("!setattrs-help");
    }
    function handleHelpCommand() {
        let handout = findObjs({
            _type: "handout",
            name: "ChatSetAttr Help",
        })[0];
        if (!handout) {
            handout = createObj("handout", {
                name: "ChatSetAttr Help",
            });
        }
        const helpContent = createHelpHandout(handout.id);
        handout.set({
            "inplayerjournals": "all",
            "notes": helpContent,
        });
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
        const command = parts.shift().slice(1); // remove the leading '!'
        const isValidCommand = isCommand(command);
        if (!isValidCommand) {
            log("Invalid Command.");
            return;
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
            result = result.replace("CREATE", repeatingID);
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
            if (mod.current !== "undefined") {
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
        const { operation, targeting, options, changes, references, feedback, } = parseMessage(msg.content);
        const output = normalizeCommandOutputOptions(options);
        // Start Timer
        startTimer("chatsetattr", 8000, () => sendDelayMessage(output));
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
        const pendingMessages = {};
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
            pendingMessages[target] = { ...pendingMessages[target], ...response.messagesByKey };
            result[target] = response.result;
        }
        const updateResult = await makeUpdate(operation, result, {
            noCreate: options.nocreate,
            priorValues});
        clearTimer("chatsetattr");
        errors.push(...updateResult.errors);
        for (const target in pendingMessages) {
            for (const key in pendingMessages[target]) {
                if (!updateResult.failed.includes(`${target}:${key}`)) {
                    messages.push(pendingMessages[target][key]);
                }
            }
        }
        sendErrors(msg.playerid, "Errors", errors, feedback?.from, output);
        const delSetTitle = operation === "delattr" ? "Deleting Attributes" : "Setting Attributes";
        const feedbackTitle = feedback?.header ?? delSetTitle;
        sendMessages(msg.playerid, feedbackTitle, messages, {
            from: feedback?.from,
            public: feedback?.public,
        }, output);
    }
    function errorOut(errorText, playerid, errors, output) {
        errors.push(errorText);
        sendErrors(playerid, "Errors", errors, undefined, output);
        clearTimer("chatsetattr");
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
        on("chat:message", (msg) => {
            if (msg.type !== "api") {
                const inlineMessage = extractMessageFromRollTemplate(msg);
                if (!inlineMessage)
                    return;
                msg.content = inlineMessage;
            }
            const debugReset = msg.content.startsWith("!setattrs-debugreset");
            if (debugReset) {
                log("ChatSetAttr: Debug - resetting state.");
                state.ChatSetAttr = {};
                return;
            }
            const debugVersion = msg.content.startsWith("!setattrs-debugversion");
            if (debugVersion) {
                log("ChatSetAttr: Debug - setting version to 1.10.");
                if (!state.ChatSetAttr)
                    state.ChatSetAttr = {};
                state.ChatSetAttr.version = "1.10";
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
                handleConfigCommand(msg.content);
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
                    h("code", null, "!setattrs-help"),
                    " or click the button below"),
                h("a", { href: "!setattrs-help" }, "Create Help Handout"))));
    }

    const v2_0 = {
        appliesTo: "<=1.10",
        version: "2.0",
        update: () => {
            // Update state data
            const config = getConfig();
            config.version = "2.0";
            config.playersCanTargetParty = true;
            setConfig(config);
            // Send message explaining update
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
        log("ChatSetAttr: Checking for updates...");
        const config = getConfig();
        let currentVersion = config.version || "1.10";
        log(`ChatSetAttr: Current version: ${currentVersion}`);
        if (currentVersion === 3) {
            currentVersion = "1.10";
        }
        log(`ChatSetAttr: Normalized current version: ${currentVersion}`);
        checkForUpdates(String(currentVersion));
    }
    function checkForUpdates(currentVersion) {
        for (const version of VERSION_HISTORY) {
            log(`ChatSetAttr: Evaluating version update to ${version.version} (appliesTo: ${version.appliesTo})`);
            const applies = version.appliesTo;
            const versionString = applies.replace(/(<=|<|>=|>|=)/, "").trim();
            const comparison = applies.replace(versionString, "").trim();
            const compared = compareVersions(currentVersion, versionString);
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
                version.update();
                currentVersion = version.version;
                updateVersionInState(currentVersion);
            }
        }
    }
    function compareVersions(v1, v2) {
        const [major1, minor1 = 0, patch1 = 0] = v1.split(".").map(Number);
        const [major2, minor2 = 0, patch2 = 0] = v2.split(".").map(Number);
        if (major1 !== major2) {
            return major1 - major2;
        }
        if (minor1 !== minor2) {
            return minor1 - minor2;
        }
        return patch1 - patch2;
    }
    function updateVersionInState(newVersion) {
        const config = getConfig();
        config.version = newVersion;
        setConfig(config);
    }

    on("ready", () => {
        registerHandlers();
        update();
        welcome();
    });

    exports.registerObserver = registerObserver;

    return exports;

})({});
