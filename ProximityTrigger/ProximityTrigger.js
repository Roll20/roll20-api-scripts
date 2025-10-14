/* ProximityTrigger - Proximity-Based Automation for Roll20 */
(function () {

    /**
     * CardStyle
     *
     * Represents a visual style configuration for proximity trigger message cards.
     * Defines colors, formatting, and whisper behavior for message display.
     * Used for all trigger types: NPCs, traps, environment effects, and more.
     */
    class CardStyle {
        /**
         * Creates a new CardStyle with customizable appearance.
         *
         * @param name - The unique name identifier for this style
         * @param borderColor - Border color (hex or CSS color name)
         * @param backgroundColor - Background color
         * @param bubbleColor - Speech bubble interior color
         * @param textColor - Text color for readability
         * @param whisper - Whisper mode: 'character', 'gm', or 'off'
         */
        constructor(name, borderColor = '#8b4513', backgroundColor = '#f4e8d8', bubbleColor = '#ffffff', textColor = '#2c1810', whisper = 'off') {
            this.name = name;
            this.borderColor = borderColor;
            this.backgroundColor = backgroundColor;
            this.bubbleColor = bubbleColor;
            this.textColor = textColor;
            this.whisper = whisper;
        }
    }

    /**
     * State Initialization
     *
     * Initializes the ProximityTrigger state object that persists between sessions.
     */
    /**
     * Initializes or returns the existing ProximityTrigger state.
     * Roll20 persists the state object between game sessions.
     *
     * @returns The ProximityTrigger state object
     */
    function initializeState() {
        if (!state.ProximityTrigger) {
            state.ProximityTrigger = {
                defaultImagePath: '',
                defaultDistance: 2,
                defaultTimeout: 10000,
                monitoredNPCs: {},
                cardStyles: [
                    new CardStyle('Default')
                ]
            };
        }
        return state.ProximityTrigger;
    }

    /**
     * Help Handler
     *
     * Displays usage information and command reference.
     */
    /**
     * Shows comprehensive help message with all available commands.
     *
     * @param msg - The chat message object
     */
    function handleHelp(msg) {
        const who = msg.who || 'gm';
        sendChat('Proximity Trigger', `/w ${who} &{template:default} ` +
            `{{name=ProximityTrigger Help}} ` +
            `{{!pt=Main command (must include one flag)}} ` +
            `{{Use for=NPCs, traps, environment, passive checks, area effects}} ` +
            `{{--monitor|-M [Token/Name]=Add or edit a trigger (requires a token or name). Use underscores for spaces.}} ` +
            `{{--list|-l=List all monitored triggers}} ` +
            `{{--menu|-m=Open the ProximityTrigger menu}} ` +
            `{{--edit|-e [Name] [prop] [value]=Edit a trigger's property (prop: triggerDistance, timeout, img, cardStyle, mode)}} ` +
            `{{--trigger|-t [Token/Name]=Manually activate a trigger}} ` +
            `{{--cardstyles|-cl=List all card styles}} ` +
            `{{--cardstyle|-C [StyleName] [property] [value]=Edit or create a card style}} ` +
            `{{--delete|-D [Name]=Delete a monitored trigger}} ` +
            `{{--help|-h=Show this help}}`);
    }

    /**
     * Menu Handler
     *
     * Displays the main ProximityTrigger menu with quick access buttons.
     */
    /**
     * Shows the main interactive menu with common command buttons.
     *
     * @param msg - The chat message object
     */
    function handleMenu(msg) {
        const who = msg.who;
        sendChat('Proximity Trigger', `/w ${who} &{template:default} ` +
            `{{name=ProximityTrigger Menu}} ` +
            `{{[Add/Edit Trigger](!pt -M)}}` +
            `{{[List Triggers](!pt -l)}} ` +
            `{{[Activate Trigger](!pt -t)}} ` +
            `{{[Card Styles](!pt -cl)}} ` +
            `{{[Help](!pt -h)}}`);
    }

    /**
     * Name Utilities
     *
     * Functions for converting between display names and safe command names.
     */
    /**
     * Converts a display name to a safe command-friendly name.
     * Replaces spaces with underscores for use in chat commands.
     *
     * @param name - The original display name
     * @returns Safe name with underscores instead of spaces
     */
    function toSafeName(name) {
        return name.trim().replace(/\s+/g, '_');
    }
    /**
     * Converts a safe command name back to a display name.
     * Replaces underscores with spaces.
     *
     * @param safeName - The underscored safe name
     * @returns Display name with spaces
     */
    function fromSafeName(safeName) {
        return safeName.replace(/_/g, ' ').trim();
    }

    /**
     * List Triggers Handler
     *
     * Displays all currently monitored triggers with their settings.
     */
    /**
     * Lists all monitored triggers with clickable links to edit them.
     *
     * @param msg - The chat message object
     * @param state - The ProximityTrigger state
     */
    function handleListNPCs(msg, state) {
        const who = msg.who || 'gm';
        const monitored = Object.values(state.monitoredNPCs);
        if (monitored.length === 0) {
            sendChat('Proximity Trigger', `/w ${who} No triggers are currently monitored. Use !pt --monitor to add one.`);
            return;
        }
        const list = monitored.map(npc => {
            const safeName = toSafeName(npc.name);
            return `{{[${npc.name}](!pt -M ${safeName})=` +
                `(Mode: ${npc.mode}, Dist: ${npc.triggerDistance}, ` +
                `Timeout: ${npc.timeout}ms, Messages: ${npc.messages.length}, ` +
                `Style: ${npc.cardStyle})}}`;
        }).join(' ');
        sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Monitored Triggers}} ${list}`);
    }

    /**
     * Triggered Tokens Tracking
     *
     * Maintains a cache of which tokens have recently triggered NPCs.
     * This prevents spam by enforcing cooldown periods.
     */
    /**
     * Tracks which token pairs have triggered recently.
     * Key format: "movingTokenId_npcTokenId"
     * Value: true if triggered and on cooldown
     */
    const triggeredTokens = {};

    /**
     * Delete NPC Handler
     *
     * Removes an NPC from monitoring and clears its triggers.
     */
    /**
     * Deletes a monitored NPC or shows a menu of NPCs to delete.
     *
     * @param msg - The chat message object
     * @param state - The ProximityTrigger state
     */
    function handleDeleteNPC(msg, state) {
        const who = msg.who || 'gm';
        const args = msg.content.trim().split(' ');
        // If no name provided, list NPCs to delete
        if (args.length < 3) {
            const entries = Object.values(state.monitoredNPCs);
            if (entries.length === 0) {
                sendChat('Proximity Trigger', `/w ${who} No NPCs are monitored.`);
                return;
            }
            const menu = entries.map(npc => `{{[${npc.name}](!pt -D ${toSafeName(npc.name)})}}`).join(' ');
            sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Delete Monitored NPC}} ${menu}`);
            return;
        }
        const safeName = args[2];
        const name = fromSafeName(safeName);
        const npc = state.monitoredNPCs[safeName];
        if (!npc) {
            sendChat('Proximity Trigger', `/w ${who} Monitored NPC "${name}" not found.`);
            return;
        }
        // Clear any pending triggers for all tokens of this NPC
        if (npc.tokenIds) {
            npc.tokenIds.forEach(tokenId => {
                Object.keys(triggeredTokens).forEach(key => {
                    if (key.includes(tokenId)) {
                        delete triggeredTokens[key];
                    }
                });
            });
        }
        delete state.monitoredNPCs[safeName];
        sendChat('Proximity Trigger', `/w ${who} Removed "${npc.name}" from monitoring.`);
    }

    /**
     * List Card Styles Handler
     *
     * Displays all available card styles with edit links.
     */
    /**
     * Lists all card styles or allows creation of new ones.
     *
     * @param msg - The chat message object
     * @param state - The ProximityTrigger state
     */
    function handleListCardStyles(msg, state) {
        const who = msg.who || 'gm';
        const list = state.cardStyles.map(s => `{{[${s.name}](!pt -C ${toSafeName(s.name)})}}`).join(' ');
        sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Card Styles}} ` +
            `{{[Create New](!pt -C new)}} ${list}`);
    }

    /**
     * Token Utilities
     *
     * Helper functions for working with Roll20 tokens and their properties.
     */
    /**
     * Gets the best available image URL for a token in priority order:
     * 1. Character avatar (if token represents a character)
     * 2. Token image
     * 3. Default image from state
     * 4. Empty string
     *
     * @param token - The Roll20 token object
     * @param state - The ProximityTrigger state object
     * @returns The best available image URL
     */
    function getBestTokenImage(token, state) {
        // Check if token represents a character and get avatar
        const charId = token.get('represents');
        if (charId) {
            const character = getObj('character', charId);
            if (character) {
                const avatar = character.get('avatar');
                if (avatar && avatar.trim() !== '') {
                    return avatar;
                }
            }
        }
        // Fall back to token image
        const tokenImg = token.get('imgsrc');
        if (tokenImg && tokenImg.trim() !== '') {
            return tokenImg;
        }
        // Fall back to default image from state
        if (state.defaultImagePath && state.defaultImagePath.trim() !== '') {
            return state.defaultImagePath;
        }
        // Final fallback
        return '';
    }
    /**
     * Gets the effective name for a token - either the token's name or the character it represents.
     *
     * @param token - The Roll20 token object
     * @returns The token's name, character name, or empty string
     */
    function getTokenEffectiveName(token) {
        // First try the token's own name
        const tokenName = token.get('name');
        if (tokenName && tokenName.trim() !== '') {
            return tokenName.trim();
        }
        // If no token name, check if it represents a character
        const charId = token.get('represents');
        if (charId) {
            const character = getObj('character', charId);
            if (character) {
                const charName = character.get('name');
                if (charName && charName.trim() !== '') {
                    return charName.trim();
                }
            }
        }
        return '';
    }
    /**
     * Retrieves a player/character name from a token for message personalization.
     * Returns the first name only for brevity in messages.
     *
     * @param token - The token that triggered the interaction
     * @returns Player/character first name or "Guild Member"
     */
    function getPlayerNameFromToken(token) {
        const charId = token.get('represents');
        if (charId) {
            const character = getObj('character', charId);
            if (character) {
                const fullName = character.get('name');
                return fullName.split(' ')[0] || 'Guild Member';
            }
        }
        return 'Guild Member';
    }
    /**
     * Finds a token on the current page by a character's name.
     *
     * @param charName - The character name to search for
     * @returns The first matching token, or null if none found
     */
    function findTokenByCharacterName(charName) {
        const characters = findObjs({ _type: 'character', name: charName });
        const character = characters[0];
        if (!character)
            return null;
        const pageId = Campaign().get('playerpageid');
        const tokens = findObjs({
            _pageid: pageId,
            _type: 'graphic',
            represents: character.id
        });
        return tokens.find(t => t.get('layer') === 'objects') || tokens[0] || null;
    }
    /**
     * Extracts the token to act on from a chat command or selection.
     * Chat args take priority over a selected token.
     *
     * @param msg - The chat message object (msg.type === "api")
     * @param fromSafeNameFn - Function to convert safe names back to display names
     * @returns The token to use, or undefined if none found
     */
    function getTokenFromCall(msg, fromSafeNameFn) {
        const args = msg.content.trim().split(' ');
        // If command includes a name after flag, use that
        if (args.length > 2) {
            const token = findTokenByCharacterName(fromSafeNameFn(args[2]));
            return token || undefined;
        }
        // Otherwise, if a token is selected, use that
        if (msg.selected && msg.selected.length > 0) {
            return getObj('graphic', msg.selected[0]._id);
        }
        return undefined;
    }

    /**
     * MessageObject
     *
     * Represents a single message that a proximity trigger can display.
     * Works for NPCs, traps, environment effects, passive checks, and more.
     * Supports weighted random selection and per-message style overrides.
     */
    class MessageObject {
        /**
         * Creates a new MessageObject.
         *
         * @param content - The message text (supports {playerName} placeholder)
         * @param weight - Relative probability weight (0 = disabled, higher = more likely)
         * @param cardStyle - Optional style override for this specific message
         */
        constructor(content, weight = 1, cardStyle = null) {
            this.content = content;
            this.weight = weight;
            this.cardStyle = cardStyle;
        }
    }

    /**
     * Message Utilities
     *
     * Functions for selecting and personalizing proximity trigger messages.
     */
    /**
     * Selects a random message from an array using weighted probability.
     * Messages with weight 0 or negative are excluded from selection.
     *
     * @param messages - Array of message objects with weights
     * @returns The selected message (or default if none available)
     */
    function getRandomMessage(messages) {
        if (!messages || messages.length === 0) {
            return new MessageObject('They are lost in thought...', 1);
        }
        // Filter out messages with weight 0 or negative
        const validMessages = messages.filter(m => {
            const weight = (m.weight !== undefined && m.weight !== null) ? m.weight : 1;
            return weight > 0;
        });
        if (validMessages.length === 0) {
            return new MessageObject('They are lost in thought...', 1);
        }
        // Build weighted pool for random selection
        const pool = [];
        validMessages.forEach(m => {
            const weight = (m.weight !== undefined && m.weight !== null) ? m.weight : 1;
            for (let i = 0; i < weight; i++) {
                pool.push(m);
            }
        });
        return pool[Math.floor(Math.random() * pool.length)];
    }
    /**
     * Personalizes a message by replacing placeholders with actual values.
     * Currently supports {playerName} placeholder.
     *
     * @param messageContent - The message template with placeholders
     * @param playerName - The player name to insert
     * @returns The personalized message
     */
    function personalizeMessage(messageContent, playerName) {
        // Use first name only if full name provided
        const firstName = playerName === 'Guild Member'
            ? playerName
            : playerName.split(' ')[0];
        return messageContent.replace(/{playerName}/g, firstName);
    }

    /**
     * Message Display Core
     *
     * Handles the display and rendering of proximity trigger messages.
     * Works for NPCs, traps, environment effects, passive checks, and more.
     */
    /**
     * Triggers and displays an NPC message with styled card.
     * Handles mode changes (once → off) and applies appropriate styling.
     *
     * @param npc - The NPC that was triggered
     * @param state - The ProximityTrigger state
     * @param playerName - The player who triggered the interaction
     */
    function triggerNPCMessage(npc, state, playerName = 'Guild Member') {
        if (!npc || npc.mode === 'off')
            return;
        // Handle 'once' mode
        if (npc.mode === 'once') {
            npc.mode = 'off';
        }
        const selectedMessage = getRandomMessage(npc.messages);
        const personalizedContent = personalizeMessage(selectedMessage.content, playerName);
        // Determine card style (priority: message override > NPC default > Default)
        const defaultCardStyle = state.cardStyles.find(style => style.name === 'Default');
        let cardStyle = defaultCardStyle;
        if (npc.cardStyle) {
            const npcStyle = state.cardStyles.find(style => style.name === npc.cardStyle);
            if (npcStyle)
                cardStyle = npcStyle;
        }
        if (selectedMessage.cardStyle) {
            const msgStyle = state.cardStyles.find(style => style.name === selectedMessage.cardStyle);
            if (msgStyle)
                cardStyle = msgStyle;
        }
        // Ensure we have a valid card style
        if (!cardStyle) {
            cardStyle = new CardStyle('Default');
        }
        // Build styled HTML card
        const card = buildMessageCard(npc, personalizedContent, cardStyle, cardStyle);
        // Determine whisper target
        const whisperPrefix = getWhisperPrefix(cardStyle.whisper, playerName);
        sendChat(npc.name, `${whisperPrefix}${card}`);
    }
    /**
     * Builds the HTML for a styled message card.
     *
     * @param npc - The NPC
     * @param messageContent - The personalized message
     * @param cardStyle - The style to apply
     * @param defaultStyle - Fallback default style
     * @returns HTML string for the card
     */
    function buildMessageCard(npc, messageContent, cardStyle, defaultStyle) {
        const borderColor = cardStyle.borderColor || defaultStyle.borderColor;
        const bgColor = cardStyle.backgroundColor || defaultStyle.backgroundColor;
        const bubbleColor = cardStyle.bubbleColor || defaultStyle.bubbleColor;
        const textColor = cardStyle.textColor || defaultStyle.textColor;
        let html = `<div style="background: ${bgColor}; border: 3px solid ${borderColor}; ` +
            `border-radius: 10px; padding: 15px; margin: 10px; ` +
            `box-shadow: 0 4px 8px rgba(0,0,0,0.3);">`;
        // Add image if available
        if (npc.img && npc.img.trim() !== '') {
            html += `<div style="text-align: center; margin-bottom: 10px;">` +
                `<img src="${npc.img}" style="max-width: 200px; border: 4px solid ${borderColor}; ` +
                `border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">` +
                `</div>`;
        }
        // Add speech bubble
        html += `<div style="background: ${bubbleColor}; border: 2px solid ${borderColor}; ` +
            `border-radius: 8px; padding: 12px; position: relative;">` +
            `<div style="position: absolute; top: -10px; left: 20px; width: 0; height: 0; ` +
            `border-left: 10px solid transparent; border-right: 10px solid transparent; ` +
            `border-bottom: 10px solid ${borderColor};"></div>` +
            `<div style="position: absolute; top: -7px; left: 21px; width: 0; height: 0; ` +
            `border-left: 9px solid transparent; border-right: 9px solid transparent; ` +
            `border-bottom: 9px solid white;"></div>` +
            `<p style="margin: 0; color: ${textColor}; font-size: 14px; line-height: 1.6;">` +
            `<strong>${npc.name}:</strong></p>` +
            `<p style="margin: 8px 0 0 0; color: ${textColor}; font-size: 14px; ` +
            `line-height: 1.6; font-style: italic;">${messageContent}</p>` +
            `</div></div>`;
        return html;
    }
    /**
     * Determines the whisper prefix for the message.
     *
     * @param whisperMode - The whisper setting ('off', 'character', 'gm')
     * @param playerName - The player name
     * @returns The whisper prefix or empty string
     */
    function getWhisperPrefix(whisperMode, playerName) {
        if (whisperMode === 'off')
            return '';
        if (whisperMode === 'character')
            return `/w ${playerName} `;
        if (whisperMode === 'gm')
            return '/w gm ';
        return '';
    }

    /**
     * Trigger Handler
     *
     * Manually triggers an NPC message display.
     */
    /**
     * Handles manual triggering of NPC messages.
     * Can trigger from selected token, named NPC, or show selection menu.
     *
     * @param msg - The chat message object
     * @param state - The ProximityTrigger state
     */
    function handleTrigger(msg, state) {
        const who = msg.who || 'gm';
        const args = msg.content.trim().split(/\s+/);
        const token = getTokenFromCall(msg, fromSafeName);
        // If a token is selected → trigger its monitored NPC
        if (token) {
            const tokenName = getTokenEffectiveName(token);
            const safeName = toSafeName(tokenName);
            const monitoredNPC = state.monitoredNPCs[safeName];
            if (!monitoredNPC) {
                sendChat('Proximity Trigger', `/w ${who} Token "${tokenName}" is not a monitored NPC.`);
                return;
            }
            triggerNPCMessage(monitoredNPC, state);
            return;
        }
        // No token selected → try by name argument
        if (args.length > 2) {
            const safeName = args.slice(2).join('_');
            const monitoredNPC = state.monitoredNPCs[safeName];
            if (monitoredNPC) {
                triggerNPCMessage(monitoredNPC, state);
                return;
            }
        }
        // No token and no matching name → list all monitored NPCs
        const npcEntries = Object.entries(state.monitoredNPCs);
        if (npcEntries.length === 0) {
            sendChat('Proximity Trigger', `/w ${who} No monitored NPCs are currently active.`);
            return;
        }
        const npcButtons = npcEntries.map(([safeName, npc]) => `{{[${npc.name}](!pt -t ${safeName})}}`).join(' ');
        sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Trigger a Monitored NPC}} ${npcButtons}`);
    }

    /**
     * MonitoredNPC
     *
     * Represents an actively monitored proximity trigger in the game.
     * Can be used for NPCs, traps, environment effects, passive checks, and more.
     * Multiple tokens can share the same trigger configuration.
     * The name "MonitoredNPC" is kept for backward compatibility.
     */
    class MonitoredNPC {
        /**
         * Creates a new MonitoredNPC.
         *
         * @param name - The NPC's display name
         * @param triggerDistance - Trigger distance in token body widths
         * @param tokenIds - Array of Roll20 token IDs representing this NPC
         * @param timeout - Cooldown in ms before re-triggering (0 = permanent)
         * @param img - Portrait URL
         * @param messages - Array of possible messages
         * @param cardStyle - Card style name for this NPC
         * @param mode - Operating mode: 'on', 'off', or 'once'
         */
        constructor(name, triggerDistance = 2, tokenIds = [], timeout = 10000, img = 'https://studionimbus.dev/Projects/AlabastriaCharacterAssistant/GuildEmblem.png', messages = [], cardStyle = 'Default', mode = 'on') {
            this.name = name;
            this.triggerDistance = triggerDistance;
            this.tokenIds = tokenIds;
            this.timeout = timeout;
            this.img = img;
            this.messages = messages;
            this.cardStyle = cardStyle;
            this.mode = mode;
        }
    }

    /**
     * Monitor Handler
     *
     * Handles adding/editing NPCs to the monitoring system.
     */
    /**
     * Handles the --monitor command.
     * Can create new monitored NPCs or open edit dialogs for existing ones.
     *
     * @param msg - The chat message object
     * @param state - The ProximityTrigger state
     */
    function handleMonitor(msg, state) {
        const who = msg.who;
        const token = getTokenFromCall(msg, fromSafeName);
        if (token) {
            const tokenName = getTokenEffectiveName(token);
            const safeName = toSafeName(tokenName);
            // Create or edit monitored entry
            if (!state.monitoredNPCs[safeName]) {
                createMonitoredNPCFromToken(msg, token, state);
            }
            else {
                showEditMonitorNPCDialog(msg, token, state);
            }
            return;
        }
        // If no token given, show a menu of tokens on the page
        const tokens = findObjs({ type: 'graphic', subtype: 'token', layer: 'objects' });
        if (tokens.length === 0) {
            sendChat('Proximity Trigger', `/w ${who} No tokens found to monitor on this page.`);
            return;
        }
        const menu = tokens.map(t => {
            const name = getTokenEffectiveName(t);
            if (!name)
                return ''; // Skip tokens with no name
            return `{{[${name}](!pt -M ${toSafeName(name)})}}`;
        }).filter(item => item !== '').join(' ');
        sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Select Token to Monitor}} ${menu}`);
    }
    /**
     * Creates a new MonitoredNPC from a token and opens its edit dialog.
     *
     * @param msg - The chat message object
     * @param token - The token to monitor
     * @param state - The ProximityTrigger state
     */
    function createMonitoredNPCFromToken(msg, token, state) {
        const name = getTokenEffectiveName(token);
        if (!name) {
            sendChat('Proximity Trigger', `/w ${msg.who} Token has no name and doesn't represent a named character.`);
            return;
        }
        const safeName = toSafeName(name);
        // Check if this NPC already exists
        if (state.monitoredNPCs[safeName]) {
            // Add this token to the existing NPC if not already there
            const monitoredNPC = state.monitoredNPCs[safeName];
            if (!monitoredNPC.tokenIds.includes(token.id)) {
                monitoredNPC.tokenIds.push(token.id);
                sendChat('Proximity Trigger', `/w ${msg.who} Added token to existing monitored NPC "${name}".`);
            }
        }
        else {
            // Create a new monitored NPC with this token
            state.monitoredNPCs[safeName] = new MonitoredNPC(name, state.defaultDistance || 2, [token.id], state.defaultTimeout || 10000, getBestTokenImage(token, state), [], state.cardStyles[0].name || 'Default', 'on');
        }
        showEditMonitorNPCDialog(msg, token, state);
    }
    /**
     * Displays the edit dialog for a monitored NPC with clickable property fields.
     *
     * @param msg - The chat message object
     * @param token - Optional token (can also look up by name)
     * @param state - The ProximityTrigger state
     */
    function showEditMonitorNPCDialog(msg, token, state) {
        let npc;
        let safeName;
        if (token) {
            const tokenName = getTokenEffectiveName(token);
            safeName = toSafeName(tokenName);
            npc = state.monitoredNPCs[safeName];
            if (!npc) {
                sendChat('Proximity Trigger', `/w ${msg.who} Token "${tokenName}" is not monitored.`);
                return;
            }
        }
        else {
            // Try to find NPC by name from message args
            const args = msg.content.trim().split(' ');
            if (args.length > 2) {
                const npcName = fromSafeName(args[2]);
                safeName = toSafeName(npcName);
                npc = state.monitoredNPCs[safeName];
                if (!npc) {
                    sendChat('Proximity Trigger', `/w ${msg.who} NPC "${npcName}" is not monitored.`);
                    return;
                }
            }
            else {
                sendChat('Proximity Trigger', `/w ${msg.who} Please specify an NPC to edit.`);
                return;
            }
        }
        // Build clickable fields for each property
        const properties = [
            { label: 'Mode', attr: 'mode' },
            { label: 'Trigger Distance ^in token widths^', attr: 'triggerDistance' },
            { label: 'Timeout (ms)', attr: 'timeout' },
            { label: 'Image URL', attr: 'img' },
            { label: 'Card Style', attr: 'cardStyle' },
            { label: 'Messages', attr: 'messages' }
        ];
        const buttons = properties.map(prop => `{{[${prop.label}](!pt -M ${safeName} ${prop.attr})}}`).join(' ');
        const tokenCount = npc.tokenIds ? npc.tokenIds.length : 0;
        sendChat('Proximity Trigger', `/w ${msg.who} &{template:default} {{name=Edit NPC: ${npc.name}}} ` +
            `{{Tokens: ${tokenCount}}} ${buttons} ` +
            `{{[Delete Monitor](!pt -D ${safeName})}}`);
    }

    /**
     * Edit NPC Handler
     *
     * Handles editing properties of monitored NPCs.
     */
    /**
     * Edits properties of a monitored NPC via chat command.
     * Usage: !pt -e <NPC_Name> <prop> <value>
     *
     * @param msg - The chat message object
     * @param state - The ProximityTrigger state
     */
    function handleEditNPC(msg, state) {
        const who = msg.who || 'gm';
        const args = msg.content.trim().split(' ');
        const safeName = args[2];
        const npcName = fromSafeName(safeName);
        const npc = state.monitoredNPCs[safeName];
        if (!npc) {
            sendChat('Proximity Trigger', `/w ${who} Monitored NPC "${npcName}" not found.`);
            return;
        }
        // If no property given, open edit dialog
        if (args.length < 4) {
            // Try to get one of the tokens for this NPC
            let token = null;
            if (npc.tokenIds && npc.tokenIds.length > 0) {
                token = getObj('graphic', npc.tokenIds[0]);
            }
            showEditMonitorNPCDialog({ who: who, content: msg.content }, token, state);
            return;
        }
        const property = args[3].toLowerCase();
        // Show input prompts if no value provided
        if (args.length < 5) {
            showPropertyInputPrompt(msg, npc, property, state);
            return;
        }
        // Set the property value
        const value = args.slice(4).join(' ').trim();
        setNPCProperty(msg, npc, property, value, state);
    }
    /**
     * Shows an input prompt for a specific NPC property.
     *
     * @param msg - The chat message object
     * @param npc - The NPC being edited
     * @param property - The property to edit
     * @param state - The ProximityTrigger state
     */
    function showPropertyInputPrompt(msg, npc, property, state) {
        const who = msg.who || 'gm';
        const safeName = toSafeName(npc.name);
        switch (property) {
            case 'cardstyle':
                // List all styles for user to pick
                const styleList = state.cardStyles.map(s => `{{[${s.name}](!pt -e ${safeName} cardStyle ${s.name})}}`).join(' ');
                sendChat('Proximity Trigger', `/w ${who} &{template:default} ` +
                    `{{name=Select Card Style for ${npc.name}}} ${styleList}`);
                break;
            case 'triggerdistance':
                const currDist = npc.triggerDistance;
                sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Set Distance for ${npc.name}}} ` +
                    `{{Current: ${currDist}}} ` +
                    `{{Distance (token widths)=[Click Here](!pt -e ${safeName} triggerDistance ?{Distance|${currDist}})}}`);
                break;
            case 'timeout':
                const currTimeout = npc.timeout;
                sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Set Timeout for ${npc.name}}} ` +
                    `{{Current: ${currTimeout} ms}} ` +
                    `{{Timeout (ms)=[Click Here](!pt -e ${safeName} timeout ?{Timeout|${currTimeout}})}}`);
                break;
            case 'img':
                const imgUrl = npc.img || 'https://studionimbus.dev/Projects/AlabastriaCharacterAssistant/GuildEmblem.png';
                sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Set Image URL for ${npc.name}}} ` +
                    `{{Current: [Link](${npc.img || 'none'})}} ` +
                    `{{New URL=[Click Here](!pt -e ${safeName} img ?{Enter new image URL|${imgUrl}})}}`);
                break;
            case 'mode':
                const currMode = npc.mode || 'on';
                sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Set Mode for ${npc.name}}} ` +
                    `{{Current: ${currMode}}} ` +
                    `{{New Mode=[Click Here](!pt -e ${safeName} mode ?{Enter new Mode ^on, off, once^|${currMode}})}}`);
                break;
            default:
                sendChat('Proximity Trigger', `/w ${who} Unknown property "${property}".`);
        }
    }
    /**
     * Sets an NPC property to a new value.
     *
     * @param msg - The chat message object
     * @param npc - The NPC being edited
     * @param property - The property to set
     * @param value - The new value
     * @param state - The ProximityTrigger state
     */
    function setNPCProperty(msg, npc, property, value, state) {
        const who = msg.who || 'gm';
        const tokenCount = npc.tokenIds ? npc.tokenIds.length : 0;
        const tokenInfo = tokenCount > 0
            ? ` (Applied to ${tokenCount} token${tokenCount !== 1 ? 's' : ''})`
            : '';
        switch (property) {
            case 'triggerdistance':
                const dist = parseFloat(value);
                if (isNaN(dist) || dist <= 0) {
                    sendChat('Proximity Trigger', `/w ${who} Invalid distance. Using default ${state.defaultDistance}.`);
                    npc.triggerDistance = state.defaultDistance || 2;
                }
                else {
                    npc.triggerDistance = dist;
                    sendChat('Proximity Trigger', `/w ${who} ${npc.name} trigger distance set to ${dist}${tokenInfo}.`);
                }
                break;
            case 'timeout':
                const timeout = parseInt(value);
                if (isNaN(timeout) || timeout < 0) {
                    sendChat('Proximity Trigger', `/w ${who} Invalid timeout. Using default ${state.defaultTimeout}.`);
                    npc.timeout = state.defaultTimeout || 10000;
                }
                else {
                    npc.timeout = timeout;
                    sendChat('Proximity Trigger', `/w ${who} ${npc.name} timeout set to ${timeout}ms${tokenInfo}.`);
                }
                break;
            case 'img':
                npc.img = value;
                sendChat('Proximity Trigger', `/w ${who} ${npc.name} image URL updated${tokenInfo}.`);
                break;
            case 'cardstyle':
                const style = state.cardStyles.find(s => s.name.toLowerCase() === value.toLowerCase());
                if (!style) {
                    sendChat('Proximity Trigger', `/w ${who} Card style "${value}" not found. ` +
                        `Use --cardstyles to list available styles.`);
                }
                else {
                    npc.cardStyle = style.name;
                    sendChat('Proximity Trigger', `/w ${who} ${npc.name} style set to ${style.name}${tokenInfo}.`);
                }
                break;
            case 'mode':
                const mode = value.toLowerCase();
                if (mode !== 'on' && mode !== 'off' && mode !== 'once') {
                    sendChat('Proximity Trigger', `/w ${who} Mode ${value} not supported, defaulting to 'on'.`);
                    npc.mode = 'on';
                }
                else {
                    npc.mode = mode;
                    sendChat('Proximity Trigger', `/w ${who} ${npc.name} mode set to ${npc.mode}${tokenInfo}.`);
                }
                break;
            default:
                sendChat('Proximity Trigger', `/w ${who} Unknown property "${property}".`);
        }
    }

    /**
     * Card Style Handler
     *
     * Handles creating, editing, and deleting card styles.
     */
    /**
     * Handles all card style operations: create, edit, delete, list.
     * Usage: !pt -C <StyleName> <property> <value>
     *
     * @param msg - The chat message object
     * @param state - The ProximityTrigger state
     */
    function handleCardStyle(msg, state) {
        const who = msg.who || 'gm';
        const args = msg.content.trim().split(' ');
        // Handle creating new card style
        if (args.length >= 3 && (args[2].toLowerCase() === 'new' || args[2].toLowerCase() === 'create')) {
            handleCreateCardStyle(msg, args, state);
            return;
        }
        // Handle deleting card style
        if (args.length >= 3 && (args[2].toLowerCase() === 'delete' || args[2].toLowerCase() === 'remove')) {
            handleDeleteCardStyle(msg, args, state);
            return;
        }
        // If no style name provided, show list of styles for editing
        if (args.length < 3) {
            const styleList = state.cardStyles.map(style => `{{[${style.name}](!pt -C ${toSafeName(style.name)})}}`).join(' ');
            sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Edit Card Styles}} ` +
                `{{[Create New](!pt -C new)}} ${styleList}`);
            return;
        }
        const styleName = fromSafeName(args[2]);
        const cardStyle = state.cardStyles.find(style => style.name.toLowerCase() === styleName.toLowerCase());
        if (!cardStyle) {
            sendChat('Proximity Trigger', `/w ${who} Could not find card style: ${styleName}.`);
            return;
        }
        // If no property specified, show edit dialog
        if (args.length < 4) {
            showCardStyleEditDialog(msg, cardStyle);
            return;
        }
        const property = args[3].toLowerCase();
        // Prevent editing Default style properties
        if (cardStyle.name === 'Default') {
            sendChat('Proximity Trigger', `/w ${who} Cannot edit properties of the Default card style.`);
            return;
        }
        // If no value provided, show input prompt
        if (args.length < 5) {
            showCardStylePropertyPrompt(msg, cardStyle, property);
            return;
        }
        // Set the property value
        const value = args.slice(4).join(' ').trim().toLowerCase();
        setCardStyleProperty(msg, cardStyle, property, value);
    }
    /**
     * Shows the edit dialog for a card style with clickable property links.
     *
     * @param msg - The chat message object
     * @param cardStyle - The card style to edit
     */
    function showCardStyleEditDialog(msg, cardStyle) {
        const who = msg.who || 'gm';
        // Don't allow editing Default style
        if (cardStyle.name === 'Default') {
            sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Card Style: ${cardStyle.name}}} ` +
                `{{This is the default style and cannot be edited.}} ` +
                `{{[Create New Style](!pt -C new)}}`);
            return;
        }
        const properties = [
            { name: 'Border Color', attr: 'borderColor', value: cardStyle.borderColor },
            { name: 'Background Color', attr: 'backgroundColor', value: cardStyle.backgroundColor },
            { name: 'Bubble Color', attr: 'bubbleColor', value: cardStyle.bubbleColor },
            { name: 'Text Color', attr: 'textColor', value: cardStyle.textColor },
            { name: 'Whisper', attr: 'whisper', value: cardStyle.whisper }
        ];
        const propertyLinks = properties.map(prop => `{{[${prop.name}: ${prop.value}](!pt -C ${toSafeName(cardStyle.name)} ${prop.attr})}}`).join(' ');
        sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Edit Card Style: ${cardStyle.name}}} ` +
            `${propertyLinks} ` +
            `{{[Delete Style](!pt -C delete ${toSafeName(cardStyle.name)})}}`);
    }
    /**
     * Shows an input prompt for a specific card style property.
     *
     * @param msg - The chat message object
     * @param cardStyle - The card style being edited
     * @param property - The property to edit
     */
    function showCardStylePropertyPrompt(msg, cardStyle, property) {
        const who = msg.who || 'gm';
        const currentValue = cardStyle[property];
        let promptMessage = '';
        switch (property) {
            case 'bordercolor':
                promptMessage = 'Enter border color ^any CSS color - red, #ff0000, rgb^255,0,0^, etc.^:';
                break;
            case 'backgroundcolor':
                promptMessage = 'Enter background color ^any CSS color^:';
                break;
            case 'bubblecolor':
                promptMessage = 'Enter speech bubble color ^any CSS color^:';
                break;
            case 'textcolor':
                promptMessage = 'Enter text color ^any CSS color^:';
                break;
            case 'whisper':
                promptMessage = 'Enter whisper mode ^\'character\', \'gm\', or \'off\'^:';
                break;
            default:
                sendChat('Proximity Trigger', `/w ${who} Unknown property: ${property}. ` +
                    `Valid properties: borderColor, backgroundColor, bubbleColor, textColor, whisper`);
                return;
        }
        sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Set ${property} for ${cardStyle.name}}} ` +
            `{{Current: ${currentValue}}} ` +
            `{{${promptMessage}=[Click Here](!pt -C ${toSafeName(cardStyle.name)} ${property} ?{${promptMessage}|${currentValue}})}}`);
    }
    /**
     * Sets a card style property to a new value.
     *
     * @param msg - The chat message object
     * @param cardStyle - The card style being edited
     * @param property - The property to set
     * @param value - The new value
     */
    function setCardStyleProperty(msg, cardStyle, property, value) {
        const who = msg.who || 'gm';
        switch (property) {
            case 'bordercolor':
                cardStyle.borderColor = value;
                sendChat('Proximity Trigger', `/w ${who} Updated ${cardStyle.name} border color to "${value}"`);
                break;
            case 'backgroundcolor':
                cardStyle.backgroundColor = value;
                sendChat('Proximity Trigger', `/w ${who} Updated ${cardStyle.name} background color to "${value}"`);
                break;
            case 'bubblecolor':
                cardStyle.bubbleColor = value;
                sendChat('Proximity Trigger', `/w ${who} Updated ${cardStyle.name} bubble color to "${value}"`);
                break;
            case 'textcolor':
                cardStyle.textColor = value;
                sendChat('Proximity Trigger', `/w ${who} Updated ${cardStyle.name} text color to "${value}"`);
                break;
            case 'whisper':
                if (value === 'character' || value === 'gm' || value === 'off') {
                    cardStyle.whisper = value;
                    sendChat('Proximity Trigger', `/w ${who} Updated ${cardStyle.name} whisper to "${value}"`);
                }
                else {
                    cardStyle.whisper = 'off';
                    sendChat('Proximity Trigger', `/w ${who} Invalid whisper value "${value}". Set to "off". ` +
                        `Valid values: 'character', 'gm', 'off'`);
                }
                break;
            default:
                sendChat('Proximity Trigger', `/w ${who} Unknown property: ${property}. ` +
                    `Valid properties: borderColor, backgroundColor, bubbleColor, textColor, whisper`);
                return;
        }
        // Show the updated edit dialog
        sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Card Style Updated}} ` +
            `{{[Continue Editing ${cardStyle.name}](!pt -C ${toSafeName(cardStyle.name)})}}`);
    }
    /**
     * Handles creating a new card style.
     *
     * @param msg - The chat message object
     * @param args - Command arguments
     * @param state - The ProximityTrigger state
     */
    function handleCreateCardStyle(msg, args, state) {
        const who = msg.who || 'gm';
        const styleName = fromSafeName(args.slice(3).join(' '));
        if (!styleName) {
            sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Create New Card Style}} ` +
                `{{Enter style name=[Click Here](!pt -C new ?{Style Name})}}`);
            return;
        }
        // Check if style already exists
        if (state.cardStyles.find(style => style.name.toLowerCase() === styleName.toLowerCase())) {
            sendChat('Proximity Trigger', `/w ${who} Card style "${styleName}" already exists.`);
            return;
        }
        // Create new card style with default colors
        const newStyle = new CardStyle(styleName);
        state.cardStyles.push(newStyle);
        sendChat('Proximity Trigger', `/w ${who} Created new card style: "${styleName}".`);
        // Show edit dialog for the new style
        handleCardStyle({
            content: `!pt -C ${toSafeName(styleName)}`,
            who: who
        }, state);
    }
    /**
     * Handles deleting a card style.
     *
     * @param msg - The chat message object
     * @param args - Command arguments
     * @param state - The ProximityTrigger state
     */
    function handleDeleteCardStyle(msg, args, state) {
        const who = msg.who || 'gm';
        if (args.length < 4) {
            // Show clickable menu of styles to delete (excluding Default)
            const deletableStyles = state.cardStyles.filter(style => style.name !== 'Default');
            if (deletableStyles.length === 0) {
                sendChat('Proximity Trigger', `/w ${who} No card styles can be deleted (Default style is protected).`);
                return;
            }
            const styleList = deletableStyles.map(style => `{{[${style.name}](!pt -C delete ${toSafeName(style.name)})}}`).join(' ');
            sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Delete Card Style}} ${styleList}`);
            return;
        }
        const styleName = fromSafeName(args.slice(3).join('_'));
        // Prevent deletion of Default style
        if (styleName.toLowerCase() === 'default') {
            sendChat('Proximity Trigger', `/w ${who} Cannot delete the Default card style.`);
            return;
        }
        const styleIndex = state.cardStyles.findIndex(style => style.name.toLowerCase() === styleName.toLowerCase());
        if (styleIndex === -1) {
            sendChat('Proximity Trigger', `/w ${who} Could not find card style: ${styleName}`);
            return;
        }
        // Check if any triggers are using this style
        const triggersUsingStyle = [];
        Object.values(state.monitoredNPCs).forEach(npc => {
            if (npc.cardStyle === state.cardStyles[styleIndex].name) {
                triggersUsingStyle.push(npc.name);
            }
        });
        if (triggersUsingStyle.length > 0) {
            sendChat('Proximity Trigger', `/w ${who} Cannot delete "${styleName}" - it's being used by: ` +
                `${triggersUsingStyle.join(', ')}. Change their card styles first.`);
            return;
        }
        const deletedStyle = state.cardStyles.splice(styleIndex, 1)[0];
        sendChat('Proximity Trigger', `/w ${who} Deleted card style: "${deletedStyle.name}"`);
    }

    /**
     * Messages Handler
     *
     * Handles adding, editing, and deleting messages for monitored NPCs.
     */
    /**
     * Handles all message management operations for a monitored NPC.
     *
     * @param msg - The chat message object
     * @param state - The ProximityTrigger state
     */
    function handleMessages(msg, state) {
        const who = msg.who || 'gm';
        const args = msg.content.trim().split(' ');
        // Extract the NPC name from the command
        const safeName = args[2];
        const npcName = fromSafeName(safeName);
        const action = args[4] ? args[4].toLowerCase() : 'menu';
        // Find the monitored NPC by name
        const monitoredNPC = state.monitoredNPCs[safeName];
        if (!monitoredNPC) {
            sendChat('Proximity Trigger', `/w ${who} Could not find monitored NPC: ${npcName}`);
            return;
        }
        const safeNPCName = toSafeName(monitoredNPC.name);
        // Route to appropriate handler based on action
        switch (action) {
            case 'menu':
                showMessagesMenu(msg, monitoredNPC, safeNPCName);
                break;
            case 'add':
                handleAddMessage(msg, args, monitoredNPC, safeNPCName);
                break;
            case 'add_content':
                handleAddMessageContent(msg, args, monitoredNPC, safeNPCName);
                break;
            case 'add_weight':
                handleAddMessageWeight(msg, args, monitoredNPC, safeNPCName);
                break;
            case 'edit':
                handleEditMessage(msg, args, monitoredNPC, safeNPCName);
                break;
            case 'edit_content':
                handleEditMessageContent(msg, args, monitoredNPC, safeNPCName, npcName);
                break;
            case 'edit_content_save':
                handleEditMessageContentSave(msg, args, monitoredNPC, safeNPCName);
                break;
            case 'edit_weight':
                handleEditMessageWeight(msg, args, monitoredNPC, safeNPCName);
                break;
            case 'edit_weight_save':
                handleEditMessageWeightSave(msg, args, monitoredNPC, safeNPCName, npcName);
                break;
            case 'edit_cardstyle':
                handleEditMessageCardStyle(msg, args, monitoredNPC, safeNPCName, state);
                break;
            case 'set_cardstyle':
                handleSetMessageCardStyle(msg, args, monitoredNPC, safeNPCName, state);
                break;
            case 'delete':
                handleDeleteMessage(msg, args, monitoredNPC, safeNPCName);
                break;
            default:
                sendChat('Proximity Trigger', `/w ${who} Unknown message action: ${action}`);
        }
    }
    /**
     * Shows the main messages management menu for an NPC.
     */
    function showMessagesMenu(msg, npc, safeNPCName) {
        const who = msg.who || 'gm';
        let messageList = '{{No messages configured}}';
        if (npc.messages.length > 0) {
            messageList = npc.messages.map((msgObj, index) => {
                const preview = msgObj.content.length > 50
                    ? msgObj.content.substring(0, 50) + '...'
                    : msgObj.content;
                return `{{[${index + 1}: ${preview}](!pt -M ${safeNPCName} messages edit ${index})}}`;
            }).join(' ');
        }
        sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Message Manager: ${npc.name}}} ` +
            `{{Total Messages: ${npc.messages.length}}} ${messageList} ` +
            `{{[Add New Message](!pt -M ${safeNPCName} messages add)}} ` +
            `{{[Back to NPC Edit](!pt -M ${safeNPCName})}}`);
    }
    /**
     * Prompts for adding a new message.
     */
    function handleAddMessage(msg, _args, npc, safeNPCName) {
        const who = msg.who || 'gm';
        const promptMessage = 'Enter the new message text. Use {playerName} as a placeholder:';
        sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Add Message to ${npc.name}}} ` +
            `{{${promptMessage}=[Click Here](!pt -M ${safeNPCName} messages add_content ?{Message Text})}}`);
    }
    /**
     * Handles setting the content for a new message.
     */
    function handleAddMessageContent(msg, args, npc, safeNPCName) {
        const who = msg.who || 'gm';
        const newContent = args.slice(5).join(' ').trim();
        if (!newContent) {
            sendChat('Proximity Trigger', `/w ${who} Message content cannot be empty. Make sure to include {playerName} if needed.`);
            return;
        }
        const newMessage = new MessageObject(newContent, 1, null);
        npc.messages.push(newMessage);
        sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Set Message Weight}} ` +
            `{{Message added! Now set its relative weight ^higher number more likely to appear^:}} ` +
            `{{Weight ^default 1, off 0^=[Click Here](!pt -M ${safeNPCName} messages add_weight ${npc.messages.length - 1} ?{Weight|1})}}`);
    }
    /**
     * Handles setting the weight for a newly added message.
     */
    function handleAddMessageWeight(msg, args, npc, safeNPCName) {
        const who = msg.who || 'gm';
        const msgIndex = parseInt(args[5]);
        let weight = parseInt(args[6]);
        if (isNaN(msgIndex) || msgIndex < 0 || msgIndex >= npc.messages.length) {
            sendChat('Proximity Trigger', `/w ${who} Invalid message index.`);
            return;
        }
        if (isNaN(weight) || weight < 0) {
            sendChat('Proximity Trigger', `/w ${who} Weight must be >= 0. Using default of 1.`);
            weight = 1;
        }
        npc.messages[msgIndex].weight = weight;
        sendChat('Proximity Trigger', `/w ${who} Message weight set to ${weight}.`);
        // Return to the messages menu
        handleMessages({ content: `!pt -M ${safeNPCName} messages`, who: who }, { monitoredNPCs: { [safeNPCName]: npc } });
    }
    /**
     * Shows the edit menu for a specific message.
     */
    function handleEditMessage(msg, args, npc, safeNPCName) {
        const who = msg.who || 'gm';
        const msgIndex = parseInt(args[5]);
        if (isNaN(msgIndex) || msgIndex < 0 || msgIndex >= npc.messages.length) {
            sendChat('Proximity Trigger', `/w ${who} Invalid message selection.`);
            return;
        }
        const messageToEdit = npc.messages[msgIndex];
        sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Edit ${npc.name} Message ${msgIndex + 1}}} ` +
            `{{Card Style: ${messageToEdit.cardStyle || 'Default'}}} ` +
            `{{Content: ${messageToEdit.content}}} ` +
            `{{Weight: ${messageToEdit.weight}}} ` +
            `{{[Edit Content](!pt -M ${safeNPCName} messages edit_content ${msgIndex})}} ` +
            `{{[Edit Weight](!pt -M ${safeNPCName} messages edit_weight ${msgIndex})}} ` +
            `{{[Change Card Style](!pt -M ${safeNPCName} messages edit_cardstyle ${msgIndex})}} ` +
            `{{[Delete Message](!pt -M ${safeNPCName} messages delete ${msgIndex})}} ` +
            `{{[Back to Messages](!pt -M ${safeNPCName} messages)}}`);
    }
    /**
     * Shows prompt to edit message content.
     */
    function handleEditMessageContent(msg, args, npc, safeNPCName, npcName) {
        const who = msg.who || 'gm';
        const msgIndex = parseInt(args[5]);
        const monitoredMessage = npc.messages[msgIndex];
        if (!monitoredMessage) {
            sendChat('Proximity Trigger', `/w ${who} Invalid message index.`);
            return;
        }
        sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Edit ${npcName} Message Content}} ` +
            `{{Current: ${monitoredMessage.content}}} ` +
            `{{Enter new text. Use {playerName} as a placeholder: ` +
            `[Click Here](!pt -M ${safeNPCName} messages edit_content_save ${msgIndex} ?{Message Text})}}`);
    }
    /**
     * Saves edited message content.
     */
    function handleEditMessageContentSave(msg, args, npc, safeNPCName, _npcName) {
        const who = msg.who || 'gm';
        const msgIndex = parseInt(args[5]);
        const newContent = args.slice(6).join(' ').trim();
        if (!newContent) {
            sendChat('Proximity Trigger', `/w ${who} Message content cannot be empty. Remember {playerName} placeholder.`);
            return;
        }
        npc.messages[msgIndex].content = newContent;
        sendChat('Proximity Trigger', `/w ${who} Message content updated.`);
        // Return to messages menu
        handleMessages({ content: `!pt -M ${safeNPCName} messages`, who: who }, { monitoredNPCs: { [safeNPCName]: npc } });
    }
    /**
     * Shows prompt to edit message weight.
     */
    function handleEditMessageWeight(msg, args, npc, safeNPCName) {
        const who = msg.who || 'gm';
        const msgIndex = parseInt(args[5]);
        const monitoredMessage = npc.messages[msgIndex];
        if (!monitoredMessage) {
            sendChat('Proximity Trigger', `/w ${who} Invalid message index.`);
            return;
        }
        sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Edit ${npc.name} Message ${msgIndex + 1} Weight}} ` +
            `{{Current Weight: ${monitoredMessage.weight}}} ` +
            `{{New Weight: [Click Here](!pt -M ${safeNPCName} messages edit_weight_save ${msgIndex} ?{Weight|${monitoredMessage.weight}})}}`);
    }
    /**
     * Saves edited message weight.
     */
    function handleEditMessageWeightSave(msg, args, npc, safeNPCName, npcName) {
        const who = msg.who || 'gm';
        const msgIndex = parseInt(args[5]);
        let newWeight = parseInt(args[6]);
        if (isNaN(newWeight) || newWeight < 0)
            newWeight = 1;
        npc.messages[msgIndex].weight = newWeight;
        sendChat('Proximity Trigger', `/w ${who} ${npcName} Message ${msgIndex + 1} weight updated to ${newWeight}.`);
        // Return to messages menu
        handleMessages({ content: `!pt -M ${safeNPCName} messages`, who: who }, { monitoredNPCs: { [safeNPCName]: npc } });
    }
    /**
     * Shows card style selection for a message.
     */
    function handleEditMessageCardStyle(msg, args, npc, safeNPCName, state) {
        const who = msg.who || 'gm';
        const msgIndex = parseInt(args[5]);
        const styleList = state.cardStyles.map(style => `{{[${style.name}](!pt -M ${safeNPCName} messages set_cardstyle ${msgIndex} ${toSafeName(style.name)})}}`).join(' ');
        sendChat('Proximity Trigger', `/w ${who} &{template:default} {{name=Set Message Card Style}} ${styleList} ` +
            `{{[Back to Edit ${npc.name} Message](!pt -M ${safeNPCName} messages edit ${msgIndex})}}`);
    }
    /**
     * Sets the card style for a message.
     */
    function handleSetMessageCardStyle(msg, args, npc, safeNPCName, state) {
        const who = msg.who || 'gm';
        const msgIndex = parseInt(args[5]);
        const styleName = fromSafeName(args.slice(6).join(' '));
        const style = state.cardStyles.find(s => s.name.toLowerCase() === styleName.toLowerCase());
        if (!style) {
            sendChat('Proximity Trigger', `/w ${who} Card style "${styleName}" not found.`);
            return;
        }
        npc.messages[msgIndex].cardStyle = style.name;
        sendChat('Proximity Trigger', `/w ${who} ${npc.name} Message ${msgIndex + 1} card style set to ${style.name}.`);
        // Return to the message edit screen
        handleMessages({ content: `!pt -M ${safeNPCName} messages edit ${msgIndex}`, who: who }, { monitoredNPCs: { [safeNPCName]: npc }, cardStyles: state.cardStyles });
    }
    /**
     * Deletes a message from an NPC.
     */
    function handleDeleteMessage(msg, args, npc, safeNPCName) {
        const who = msg.who || 'gm';
        const msgIndex = parseInt(args[5]);
        if (isNaN(msgIndex) || msgIndex < 0 || msgIndex >= npc.messages.length) {
            sendChat('Proximity Trigger', `/w ${who} Invalid message index for deletion.`);
            return;
        }
        const deletedMessage = npc.messages.splice(msgIndex, 1)[0];
        const preview = deletedMessage.content.length > 50
            ? deletedMessage.content.substring(0, 50) + '...'
            : deletedMessage.content;
        sendChat('Proximity Trigger', `/w ${who} Deleted message: "${preview}"`);
        // Return to messages menu
        handleMessages({ content: `!pt -M ${safeNPCName} messages`, who: who }, { monitoredNPCs: { [safeNPCName]: npc } });
    }

    /**
     * Chat Listener
     *
     * Handles chat message events and routes commands to appropriate handlers.
     */
    /**
     * Sets up the chat message listener for API commands.
     * Routes commands to appropriate handlers based on flags.
     *
     * @param state - The ProximityTrigger state
     */
    function setupChatListener(state) {
        on('chat:message', function (msg) {
            const who = msg.who || 'gm';
            // Only handle API commands that start with !pt
            if (msg.type !== 'api' || !msg.content.startsWith('!pt')) {
                return;
            }
            // Handle --monitor or -M (with special case for messages)
            if (msg.content.includes('--monitor') || msg.content.includes('-M')) {
                const args = msg.content.trim().split(' ');
                if (args.length > 3 && args[3] === 'messages') {
                    handleMessages(msg, state);
                    return;
                }
                // If more than 3 args, treat as edit call
                if (args.length > 3) {
                    handleEditNPC(msg, state);
                }
                else {
                    handleMonitor(msg, state);
                }
                return;
            }
            // Handle --edit or -e
            if (msg.content.includes('--edit') || msg.content.includes('-e')) {
                handleEditNPC(msg, state);
                return;
            }
            // Handle --menu or -m
            if (msg.content.includes('--menu') || msg.content.includes('-m')) {
                handleMenu(msg);
                return;
            }
            // Handle --list or -l
            if (msg.content.includes('--list') || msg.content.includes('-l')) {
                handleListNPCs(msg, state);
                return;
            }
            // Handle --help or -h
            if (msg.content.includes('--help') || msg.content.includes('-h')) {
                handleHelp(msg);
                return;
            }
            // Handle --cardstyles or -cl
            if (msg.content.includes('--cardstyles') || msg.content.includes('-cl')) {
                handleListCardStyles(msg, state);
                return;
            }
            // Handle --cardstyle or -C
            if (msg.content.includes('--cardstyle') || msg.content.includes('-C')) {
                handleCardStyle(msg, state);
                return;
            }
            // Handle --trigger or -t
            if (msg.content.includes('--trigger') || msg.content.includes('-t')) {
                handleTrigger(msg, state);
                return;
            }
            // Handle --delete or -D
            if (msg.content.includes('--delete') || msg.content.includes('-D')) {
                handleDeleteNPC(msg, state);
                return;
            }
            // Unknown command
            sendChat('Proximity Trigger', `/w ${who} Unknown command. Review the help:`);
            handleHelp(msg);
        });
    }

    /**
     * Distance Utilities
     *
     * Functions for calculating distances and checking proximity.
     */
    /**
     * Calculates Euclidean distance between two points.
     *
     * @param x1 - X coordinate of first point
     * @param y1 - Y coordinate of first point
     * @param x2 - X coordinate of second point
     * @param y2 - Y coordinate of second point
     * @returns The distance between the two points
     */
    function calculateDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Proximity Checker Core
     *
     * Handles proximity detection and activation of trigger messages.
     * Works for NPCs, traps, environment effects, passive checks, and more.
     */
    /**
     * Checks all monitored triggers for proximity when a token moves.
     * Activates triggers if tokens are within range and not on cooldown.
     *
     * @param movedToken - The token that moved
     * @param state - The ProximityTrigger state
     */
    function checkAllProximities(movedToken, state) {
        const movedId = movedToken.id;
        const pageId = movedToken.get('pageid');
        const movedCenterX = movedToken.get('left') + movedToken.get('width') / 2;
        const movedCenterY = movedToken.get('top') + movedToken.get('height') / 2;
        const playerName = getPlayerNameFromToken(movedToken);
        // Check each monitored NPC
        Object.entries(state.monitoredNPCs).forEach(([_, npc]) => {
            // Skip if this NPC doesn't have any tokens
            if (!npc.tokenIds || npc.tokenIds.length === 0)
                return;
            // Check each token representing this NPC
            npc.tokenIds.forEach(tokenId => {
                // Skip if the moved token is one of this NPC's tokens
                if (tokenId === movedId)
                    return;
                const npcToken = getObj('graphic', tokenId);
                if (!npcToken)
                    return;
                // Skip if not on same page
                if (npcToken.get('pageid') !== pageId)
                    return;
                // Calculate NPC token position
                const npcCenterX = npcToken.get('left') + npcToken.get('width') / 2;
                const npcCenterY = npcToken.get('top') + npcToken.get('height') / 2;
                const distance = calculateDistance(npcCenterX, npcCenterY, movedCenterX, movedCenterY);
                const threshold = npc.triggerDistance * npcToken.get('width') + (npcToken.get('width') / 2);
                // Use token ID in the trigger key to track each token separately
                const key = movedId + '_' + tokenId;
                if (distance <= threshold && !triggeredTokens[key]) {
                    triggerNPCMessage(npc, state, playerName);
                    triggeredTokens[key] = true;
                    // Set timeout to clear the trigger
                    globalThis.setTimeout(() => {
                        if (npc.timeout !== 0)
                            delete triggeredTokens[key];
                    }, npc.timeout > 0 ? npc.timeout : 1);
                }
            });
        });
    }

    /**
     * Token Listener
     *
     * Handles token-related events (movement, creation, destruction).
     */
    /**
     * Sets up all token-related event listeners.
     *
     * @param state - The ProximityTrigger state
     */
    function setupTokenListeners(state) {
        // Monitor token movement
        on('change:graphic', function (token, prev) {
            // Only check tokens that have moved
            if (token.get('left') !== prev.left || token.get('top') !== prev.top) {
                checkAllProximities(token, state);
            }
        });
        // Monitor when new graphics are added to the page
        on('add:graphic', function (token) {
            if (token.get('subtype') !== 'token')
                return;
            const tokenName = getTokenEffectiveName(token);
            if (!tokenName)
                return; // Skip if no name found
            const safeName = toSafeName(tokenName);
            // Check if this token should be monitored
            const monitoredNPC = state.monitoredNPCs[safeName];
            if (monitoredNPC) {
                // Add this token ID to the monitored trigger if not already there
                if (!monitoredNPC.tokenIds.includes(token.id)) {
                    monitoredNPC.tokenIds.push(token.id);
                    log(`Added token ${token.id} to monitored trigger ${tokenName}`);
                }
            }
        });
        // Monitor when graphics are destroyed
        on('destroy:graphic', function (token) {
            if (token.get('subtype') !== 'token')
                return;
            const tokenName = getTokenEffectiveName(token);
            if (!tokenName)
                return; // Skip if no name found
            const safeName = toSafeName(tokenName);
            // Remove this token ID from the monitored NPC if it exists
            const monitoredNPC = state.monitoredNPCs[safeName];
            if (monitoredNPC && monitoredNPC.tokenIds) {
                const index = monitoredNPC.tokenIds.indexOf(token.id);
                if (index > -1) {
                    monitoredNPC.tokenIds.splice(index, 1);
                    log(`Removed token ${token.id} from monitored NPC ${tokenName}`);
                    // Clear any triggered tokens for this token
                    Object.keys(triggeredTokens).forEach(key => {
                        if (key.includes(token.id)) {
                            delete triggeredTokens[key];
                        }
                    });
                }
            }
        });
    }

    /**
     * ProximityTrigger - Main Entry Point
     *
     * A modular Roll20 API script for proximity-based automation.
     * Automatically triggers events when player tokens approach designated areas or objects.
     *
     * Perfect for:
     * - Interactive NPCs (conversations, greetings)
     * - Trap warnings and hazards
     * - Environmental descriptions
     * - Passive ability checks
     * - Area-based effects
     * - Dynamic storytelling
     *
     * Features:
     * - Automatic proximity detection
     * - Customizable trigger distances and cooldowns
     * - Weighted random message selection
     * - Styleable message cards
     * - Per-message and per-trigger styling
     * - Interactive chat-based configuration
     * - Manual trigger creation and management
     *
     * @version 2.1.0
     */
    /**
     * Main initialization function.
     * Called when Roll20 API is ready.
     */
    function initialize() {
        // Initialize or retrieve persisted state
        const proximityState = initializeState();
        // Set up event listeners
        setupChatListener(proximityState);
        setupTokenListeners(proximityState);
        // Log successful initialization
        log('✅ ProximityTrigger v2.1.0 loaded and ready!');
        log(`   - ${Object.keys(proximityState.monitoredNPCs).length} triggers monitored`);
        log(`   - ${proximityState.cardStyles.length} card styles available`);
        log('   - Command: !pt [options]');
    }
    // Register the initialization function with Roll20
    on('ready', initialize);

})();
