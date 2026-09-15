
  =========================================================
  @File        combatassistant.js
  @Project     Combat Assistant
  @Description Lightweight Roll20 combat assistance extracted from T&T ideas.
  @Author      AmadeusVF
  @Version     1.2.8
  =========================================================
 
  Design goals
  - Writes character sheet HP only through Beacon when the HP bar is linked.
  - Reads Roll20 attackdamagehealing chat rolls and whispers GM action cards.
  - Uses token bars for unlinked HP and temporary HP.
  - Optionally reads assigned character sheet traits for resistance, immunity,
    vulnerability, and native Roll20 saving throw results.
 
  Main command
    !ca menu
    !combatAssistant menu
    !combatAssistant config
    !combatAssistant set hpbar 1
    !combatAssistant set acbar 2
    !combatAssistant set tempbar 3
    !combatAssistant deal payloadmanual ...
    !combatAssistant heal payloadmanual ...
    !combatAssistant resource
    !combatAssistant turn nextfocusremovestop ...
 
const CombatAssistant = (() = {
    'use strict';

     -----------------------------------------------------------------------
      Metadata
      --------------------------------------------------------------------- 
    const META = Object.freeze({
        NAME 'Combat Assistant',
        DEVELOPER 'AmadeusVF',
        DEVELOPER_URL 'httpswww.patreon.comcwAmadeusVFhome',
        SHORT_NAME 'CA',
        LOG_NAME 'Combat Assistant',
        CHAT_NAME 'Combat Assistant',
        VERSION '1.2.8',
        SCHEMA_VERSION 7,
        STATE_KEY 'COMBAT_ASSISTANT',
        LEGACY_STATE_KEY 'COMBAT_TRACKER',
    });

    const COMMANDS = Object.freeze([
        '!combatassistant',
        '!combat-assistant',
        '!ca'
    ]);

    const PLAYER_ALLOWED_ACTIONS = Object.freeze({
        use true,
        usearea true,
        conc true,
        concopen true,
        conend true,
        cleanupbatch true,
        rollsave true,
        rollinit true,
        turn true,
        turnnext true,
        turnfocus true,
        resource true,
        resources true,
        resourceadjust true,
        turnaction true,
        dash true,
        disengage true,
        dodge true,
        combat true,
        spells true
    });

    const INITIATIVE_BATCH_TIMERS = Object.create(null);
    const INITIATIVE_AUTO_WATCHDOGS = Object.create(null);
    const INITIATIVE_AUTO_COMPLETIONS = Object.create(null);
    const TOKEN_MUTATION_QUEUES = Object.create(null);
    const NATIVE_SAVE_CAPTURE_BUFFER = {
        timer null,
        rolls []
    };
    const TURN_TRACKER_TIMERS = {
        additions null
    };
    let STATE_INITIALIZED = false;
    let AREA_MARKER_GROUP_SYNC_ACTIVE = false;
    let AREA_MARKER_DESTROY_ACTIVE = false;
    const RUNTIME_CLEANUP_INTERVAL_MS = 15  1000;
    const PLAYER_ACTION_RESERVATION_MS = 30  1000;
    const PLAYER_ACTION_TTL_MS = 10  60  1000;
    const NATIVE_ROLL_TTL_MS = 2  60  1000;
    const RECENT_ATTACK_TTL_MS = 60  1000;
    const MAX_PAYLOAD_LENGTH = 25000;
    let LAST_RUNTIME_CLEANUP_AT = 0;
    let SCRIPT_ACTIVE = false;
    let ADVANCED_MODE = false;
    const TEMP_RUNTIME_CONFIG_DEFAULTS = Object.freeze({
        DEBUG false,
        CHAT_DEBUG_ATTACKS false,
        CHAT_DEBUG_SPELLS false
    });
    const TEMP_RUNTIME_CONFIG = {
        DEBUG false,
        CHAT_DEBUG_ATTACKS false,
        CHAT_DEBUG_SPELLS false
    };

     -----------------------------------------------------------------------
      Config
      --------------------------------------------------------------------- 
    const DEFAULT_CARD_CONFIG = Object.freeze({
        width 300,
        leftOffset -30,
        titleColor 'rgb(255, 255, 255)',
        bodyColor 'rgb(255, 255, 255)',
        borderColor 'rgb(127, 127, 127)',
        titleBgColor 'rgba(0, 0, 0, 0.6)',
        titleLineColor 'rgba(215, 47, 47, 0.8)',
        bodyBgColor 'rgba(0, 0, 0, 0.3)',
        bodyImageUrl 'httpsimages.rawpixel.comimage_800cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTEyL3Jhd3BpeGVsX29mZmljZV80Nl9ibGFja193YWxscGFwZXJfbW9ub2Nocm9tZV9jaGluZXNlX2RyYWdvbl8yNmY3MzllOS1mYzkwLTQ3MDEtYjdmNS01NjFmMTQwMjc1OGRfMS5qcGc.jpg'
    });

    const DEFAULT_TEXT_CONFIG = Object.freeze({
        character 'rgb(211, 194, 12)',
        heal 'rgb(52, 203, 116)',
        damage 'rgb(220, 45, 45)',
        applied 'rgb(84, 186, 255)'
    });

    const DAMAGE_TYPE_COLORS = Object.freeze({
        normal 'rgb(220, 45, 45)',
        bludgeoning 'rgb(200, 65, 65)',
        slashing 'rgb(200, 65, 65)',
        piercing 'rgb(200, 65, 65)',
        fire 'rgb(235, 20, 0)',
        acid 'rgb(115, 230, 95)',
        poison 'rgb(134, 38, 244)',
        cold 'rgb(49, 87, 239)',
        lightning 'rgb(75, 230, 255)',
        thunder 'rgb(122, 120, 255)',
        force 'rgb(185, 45, 120)',
        necrotic 'rgb(61, 82, 79)',
        psychic 'rgb(155, 90, 212)',
        radiant 'rgb(223, 232, 96)',
        healing 'rgb(52, 203, 116)',
        'temp healing' 'rgb(255, 105, 180)'
    });

    const DAMAGE_TYPE_ICONS = Object.freeze({
        normal '&#128171;',
        acid '&#129514;',
        bludgeoning '&#128162;',
        cold '&#10052;&#65039;',
        fire '&#128293;',
        force '&#127744;',
        lightning '&#9889;',
        necrotic '&#128128;',
        piercing '&#128481;&#65039;',
        poison '&#9760;&#65039;',
        psychic '&#129708;',
        radiant '&#127775;',
        slashing '&#9585;',
        thunder '&#127785;&#65039;',
        healing '&#128154;',
        'temp healing' '&#128151;'
    });

    const ABILITIES = Object.freeze({
        strength 'STR',
        dexterity 'DEX',
        constitution 'CON',
        intelligence 'INT',
        wisdom 'WIS',
        charisma 'CHA'
    });

    const ABILITY_ALIASES = Object.freeze({
        str 'strength',
        strength 'strength',
        dex 'dexterity',
        dexterity 'dexterity',
        con 'constitution',
        constitution 'constitution',
        int 'intelligence',
        intelligence 'intelligence',
        wis 'wisdom',
        wisdom 'wisdom',
        cha 'charisma',
        charisma 'charisma'
    });

    const CONFIG = Object.freeze({
        CHAT_NAME META.CHAT_NAME,
        DEFAULT_CARD_CONFIG,
        DEFAULT_TEXT_CONFIG,
        DEFAULT_CARD_WIDTH DEFAULT_CARD_CONFIG.width,
        DEFAULT_CARD_LEFT_OFFSET DEFAULT_CARD_CONFIG.leftOffset,
        DEFAULT_CARD_TITLE_COLOR DEFAULT_CARD_CONFIG.titleColor,
        DEFAULT_CARD_BODY_COLOR DEFAULT_CARD_CONFIG.bodyColor,
        DEFAULT_CARD_BORDER_COLOR DEFAULT_CARD_CONFIG.borderColor,
        DEFAULT_CARD_TITLE_BG_COLOR DEFAULT_CARD_CONFIG.titleBgColor,
        DEFAULT_CARD_TITLE_LINE_COLOR DEFAULT_CARD_CONFIG.titleLineColor,
        DEFAULT_CARD_BODY_BG_COLOR DEFAULT_CARD_CONFIG.bodyBgColor,
        DEFAULT_CARD_BODY_IMAGE_URL DEFAULT_CARD_CONFIG.bodyImageUrl,
        DEFAULT_TEXT_CHARACTER_COLOR DEFAULT_TEXT_CONFIG.character,
        DEFAULT_TEXT_HEAL_COLOR DEFAULT_TEXT_CONFIG.heal,
        DEFAULT_DAMAGE_TYPE_COLOR DEFAULT_TEXT_CONFIG.damage,
        DEFAULT_TEXT_APPLIED_COLOR DEFAULT_TEXT_CONFIG.applied,
        DAMAGE_TYPE_COLORS,
        DAMAGE_TYPE_ICONS,
        ROLL_CARD_STYLE Object.freeze({
            fontFamily 'Comic Sans MS', 'Comic Sans', cursive,
            fontSize '22px',
            fontWeight '900',
            color 'rgb(255,255,255)'
        })
    });

    const RUNTIME_CONFIG_DEFAULTS = Object.freeze({
        CHAT_TRACKING true,
        CONCENTRATION_TRACKING true,
        CHAT_PROBE false,
        PLAYER_ATTACK_BUTTON false,
        COMBAT_VISUAL_EFFECTS false,
        PROJECTILE_EFFECT_NAME 'missile',
        DIRECT_HIT_EFFECT_NAME 'bomb',
        AREA_HIT_EFFECT_NAME 'burn',
        PLAYER_HEALING_BUTTON false,
        PLAYER_ACTION_RANGE_CHECK false,
        PLAYER_TOKEN_AREA_MARK false,
        PLAYER_AREA_MARKER_KEEP_UNTIL_ROLLED false,
        AREA_MARKER_FREE_MOVEMENT true,
        PLAYER_MARKER_SQUARE_URL 'httpsfiles.d20.ioimages495780883qX3WMFpR8BUE_jjRkt9ahAmed.webm',
        PLAYER_MARKER_RADIUS_URL 'httpsfiles.d20.ioimages495578323tBnLEPGE1GdLdoyQt2FyrQmed.webm',
        PLAYER_MARKER_OPACITY 60,
        PLAYER_MANUAL_ROLL false,
        CA_ROLLS_INITIATIVE false,
        SHEET_2014_CA_ROLLS false,
        TURN_TRACKER true,
        TURN_AUTO_FOCUS false,
        TURN_MOVEMENT_TRACKER false,
        SHOW_PLAYER_RESOURCES false,
        SHOW_NPC_RESOURCES true,
        PLAYER_PUBLIC_RESOURCE_USAGE false,
        HANDLE_ACTIONS false,
        CONC_TURN_TRACKER false,
        ROUND_COUNTER true,
        PUBLIC_ROUND_COUNTER false,
        REMOVE_NPC_DEAD_TOKENS false,
        TURN_MARKER true,
        PUBLIC_TURN_MARKER false,
        TURN_MARKER_IMAGE_URL 'httpsfiles.d20.ioimages495303287txqHTA2ByhDGG_aL7-Qe2gmed.webm1785019892',
        TURN_MARKER_IMG_SIZE 20,
        TURN_MARKER_FOLLOW false,
        HP_BAR 1,
        AC_BAR 2,
        TEMP_HP_BAR 3,
        DAMAGE_ROUND_UP true,
        REQUIRE_AC_FOR_ATTACK true,
        USE_SHEET_DAMAGE_TRAITS true,
        REVEAL_DAMAGE_SOURCE true,
        REVEAL_TOKEN_NAMES_IN_LOG true,
        HIDE_TOKEN_NAMES_IN_LOG false,
        AREA_RADIUS_DEBUG_DRAW false,
        CHAT_BACKGROUND_IMAGE_URL DEFAULT_CARD_CONFIG.bodyImageUrl
    });

    const RUNTIME_CONFIG_FIELDS = Object.freeze([
        { type 'section', label 'Main' },
        { key 'CHAT_TRACKING', label 'Chat Tracking', type 'boolean', tip 'Read Roll20 attack, damage, and healing rolls.' },
        { key 'CONCENTRATION_TRACKING', label 'Concentration Tracking', type 'boolean', tip 'Track concentration spells, keep their area markers active, and request concentration saves when the caster takes damage.' },
        { key 'CA_ROLLS_INITIATIVE', label '2024 Combat Assistant Rolls Initiative', type 'boolean', tip 'Combat Assistant rolls initiative from sheet data and writes the turn order directly.' },
        { key 'SHEET_2014_CA_ROLLS', label '2014 Combat Assistant Rolls', type 'boolean', tip 'OFF uses Roll20 buttons for 2014 NPC saving throws and initiative. ON rolls 2014 NPC saving throws and initiative with Combat Assistant after asking normal, advantage, or disadvantage.' },
        { key 'HP_BAR', label 'HP Bar', type 'bar', tip 'Token bar used for hit points.' },
        { key 'AC_BAR', label 'AC Bar', type 'bar', tip 'Token bar used for armor class.' },
        { key 'TEMP_HP_BAR', label 'Temp HP Bar', type 'bar0', tip 'Token bar used for temporary HP. Use 0 to disable.' },
        { key 'DAMAGE_ROUND_UP', label 'Damage Round Up', type 'boolean', tip 'Round halved damage up instead of down.' },
        { key 'REQUIRE_AC_FOR_ATTACK', label 'Require AC for Attack', type 'boolean', tip 'Block automatic attack resolution when the configured AC bar is empty or zero.' },
        { key 'USE_SHEET_DAMAGE_TRAITS', label 'Read Sheet Resistances', type 'boolean', tip 'Read Roll20 sheet damage resistances, immunities, and vulnerabilities.' },
        { key 'REVEAL_DAMAGE_SOURCE', label 'Reveal Damage Source in Log', type 'boolean', tip 'Show who caused damage and which attack or spell caused it.' },
        { key 'REVEAL_TOKEN_NAMES_IN_LOG', label 'Reveal Token Names in Log', type 'boolean', tip 'Show token names in public combat logs. OFF uses generic Target and Attacker labels.' },
        { type 'section', label 'Players' },
        { key 'PLAYER_MANUAL_ROLL', label 'Player Manual Roll', type 'boolean', tip 'Ask player-controlled tokens to make their own saving throws and initiative rolls when Roll20 can expose a usable sheet button.' },
        { key 'PLAYER_HEALING_BUTTON', label 'Player Healing Button', type 'boolean', tip 'When possible, captured healing buttons are whispered to the controlling player, allowing them to select a target and apply healing.' },
        { key 'PLAYER_ATTACK_BUTTON', label 'Player Attack Button', type 'boolean', tip 'When possible, captured attack buttons are whispered to the controlling player, allowing them to select a target, resolve the attack against its AC, and automatically apply damage.' },
        { key 'PLAYER_ACTION_RANGE_CHECK', label 'Player Target Range Check', type 'boolean', tip 'For generated player spell buttons, measure the spell range from the caster token to the chosen target before applying healing or damage.' },
        { key 'PLAYER_TOKEN_AREA_MARK', label 'Player Token Area Mark', type 'boolean', tip 'For generated player area spell buttons, spawn a movable area marker token and resolve all tokens inside it when the player presses Roll.' },
        { type 'section', label 'Effects' },
        { key 'PLAYER_AREA_MARKER_KEEP_UNTIL_ROLLED', label 'Keep Marker Until Rolls Finish', type 'boolean', tip 'When an area marker triggers saving throws, keep the marker visible until every affected token has resolved its roll and damage.' },
        { key 'AREA_MARKER_FREE_MOVEMENT', label 'Marker Free Movement', type 'boolean', tip 'ON lets area markers move freely. OFF snaps area markers to the Roll20 grid when they are moved.' },
        { key 'PLAYER_MARKER_SQUARE_URL', label 'Square Marker Roll20 URL', type 'roll20image', tip 'Roll20 uploaded image URL used for square, cube, cone, or line player area markers.' },
        { key 'PLAYER_MARKER_RADIUS_URL', label 'Radius Marker Roll20 URL', type 'roll20image', tip 'Roll20 uploaded image URL used for radius, sphere, cylinder, or emanation player area markers.' },
        { key 'PLAYER_MARKER_OPACITY', label 'Marker Opacity', type 'percent', tip 'Opacity percentage for player area marker tokens.' },
        { key 'COMBAT_VISUAL_EFFECTS', label 'Combat Visual Effects', type 'boolean', tip 'Show automatic Roll20 FX when Combat Assistant applies damage, healing, temporary HP, projectile attacks, or area spells.' },
        { key 'PROJECTILE_EFFECT_NAME', label 'Projectile Effect Name', type 'text', tip 'Optional built-in or Custom FX name used from the attacker to the selected target for ranged projectile attacks. Leave empty to disable projectile FX.' },
        { key 'DIRECT_HIT_EFFECT_NAME', label 'Direct Hit Effect Name', type 'text', tip 'Built-in base effect or exact Custom FX name used when damage is applied without a saving throw. Built-in effects use the blood color. Leave empty to disable.' },
        { key 'AREA_HIT_EFFECT_NAME', label 'Area Hit Effect Name', type 'text', tip 'Built-in base effect or exact Custom FX name used when damage is applied through a saving throw. Built-in effects use the damage type color. Leave empty to disable.' },
        { type 'section', label 'Turn Tracker' },
        { key 'TURN_TRACKER', label 'Turn Tracker', type 'boolean', tip 'Track combat rounds and current turns from the Turn Order. Player Next buttons are always active while Turn Tracker is ON.' },
        { key 'TURN_AUTO_FOCUS', label 'Turn Auto Focus', type 'boolean', tip 'Ping and focus everyone on the current turn token.' },
        { key 'HANDLE_ACTIONS', label 'Turn Token Action', type 'boolean', tip 'Show Dash, Disengage, Dodge, Combat, and Spells controls on every token Turn card.' },
        { key 'TURN_MOVEMENT_TRACKER', label 'Turn Movement Tracker', type 'boolean', tip 'Track movement spent by the current-turn token, warn its controller and the GM when it exceeds available speed, and let Dash add another base-speed allowance.' },
        { key 'CONC_TURN_TRACKER', label 'Conc. Turn Tracker', type 'boolean', tip 'Decrease finite concentration duration once when the concentrating token reaches its turn, and end concentration automatically at 0 turns left.' },
        { key 'ROUND_COUNTER', label 'Round Counter', type 'boolean', tip 'Whisper the GM the Round Counter card with all tokens currently in combat.' },
        { key 'PUBLIC_ROUND_COUNTER', label 'Public Round Counter', type 'boolean', tip 'Also show the Round Counter card publicly. Round Counter must be ON.' },
        { key 'REMOVE_NPC_DEAD_TOKENS', label 'Remove NPC Dead Tokens', type 'boolean', tip 'ON automatically removes unlinked NPC turns with 0 HP. OFF shows a red Remove button below Next on that token turn card.' },
        { key 'TURN_MARKER', label 'Turn Marker', type 'boolean', tip 'Spawn a marker token on the current turn token.' },
        { key 'PUBLIC_TURN_MARKER', label 'Turn Marker Token Public', type 'boolean', tip 'OFF puts the turn marker on the GM layer. ON puts it on the map layer and brings it forward.' },
        { key 'TURN_MARKER_IMAGE_URL', label 'Turn Marker Token Image', type 'roll20image', tip 'Roll20 uploaded image used for the turn marker token. Must start with httpsfiles.d20.ioimages.' },
        { key 'TURN_MARKER_IMG_SIZE', label 'Turn Marker Token Size %', type 'number', tip 'Percentage added to the current token width and height. 20 means the marker is 20% larger than the token. Default 20.' },
        { key 'TURN_MARKER_FOLLOW', label 'Turn Marker Follow', type 'boolean', tip 'Keep the marker centered and scaled when the current turn token moves or resizes.' },
        { type 'section', label 'Resources' },
        { key 'SHOW_PLAYER_RESOURCES', label 'Show Player Resources', type 'boolean', tip 'Show the current player-controlled token's limited resources and spell slots directly on its Turn card.' },
        { key 'SHOW_NPC_RESOURCES', label 'Show NPC Resources', type 'boolean', tip 'Show limited resources and spell slots for non-player-controlled tokens on the GM Turn card only.' },
        { key 'PLAYER_PUBLIC_RESOURCE_USAGE', label 'Player Public Usage', type 'boolean', tip 'When a player uses or recovers a resource, send the Resource Update card to public chat instead of private whispers.' },
        { type 'section', label 'Extra' },
        { key 'DEBUG', label 'Debug', type 'boolean', temporary true, advancedOnly true, tip 'Temporary API-console debug logging. Resets to OFF whenever the API sandbox restarts.' },
        { key 'CHAT_DEBUG_ATTACKS', label 'Chat Debug Attacks', type 'boolean', temporary true, advancedOnly true, tip 'Temporarily print full attack diagnostics in chat after opening Combat. Resets to OFF whenever the API sandbox restarts.' },
        { key 'CHAT_DEBUG_SPELLS', label 'Chat Debug Spells', type 'boolean', temporary true, advancedOnly true, tip 'Temporarily print full spell diagnostics in chat after opening Spells. Resets to OFF whenever the API sandbox restarts.' },
        { key 'AREA_RADIUS_DEBUG_DRAW', label 'Area Radius Debug Draw', type 'boolean', tip 'Draw temporary GM-only reference circles when resolving radius, sphere, cylinder, or emanation area markers.' },
        { key 'CHAT_BACKGROUND_IMAGE_URL', label 'Change Background URL', type 'text', tip 'Background image used by Combat Assistant cards.' },
        { key 'CHAT_PROBE', label 'Chat Probe', type 'boolean', tip 'Whisper raw Roll20 chat message dumps to the GM for parser testing.' },
    ]);


    const RUNTIME_CONFIG_ALIASES = Object.freeze({
                HPBAR 'HP_BAR',
                HP_BAR 'HP_BAR',
                ACBAR 'AC_BAR',
                AC_BAR 'AC_BAR',
                TEMPBAR 'TEMP_HP_BAR',
                TEMP_BAR 'TEMP_HP_BAR',
                TEMP_HP 'TEMP_HP_BAR',
                TEMP_HP_BAR 'TEMP_HP_BAR',
                CHAT 'CHAT_TRACKING',
                CHATTRACKING 'CHAT_TRACKING',
                CHAT_TRACKING 'CHAT_TRACKING',
                CONC 'CONCENTRATION_TRACKING',
                CONCENTRATION 'CONCENTRATION_TRACKING',
                CONCENTRATION_TRACKING 'CONCENTRATION_TRACKING',
                PROBE 'CHAT_PROBE',
                CHAT_PROBE 'CHAT_PROBE',
                ROUNDUP 'DAMAGE_ROUND_UP',
                DAMAGE_ROUND_UP 'DAMAGE_ROUND_UP',
                REQUIRE_AC 'REQUIRE_AC_FOR_ATTACK',
                REQUIRE_AC_FOR_ATTACK 'REQUIRE_AC_FOR_ATTACK',
                SHEET_TRAITS 'USE_SHEET_DAMAGE_TRAITS',
                USE_SHEET_DAMAGE_TRAITS 'USE_SHEET_DAMAGE_TRAITS',
                PLAYER_COMBAT 'PLAYER_ATTACK_BUTTON',
                PLAYER_ATTACK_BUTTON 'PLAYER_ATTACK_BUTTON',
                FX 'COMBAT_VISUAL_EFFECTS',
                EFFECTS 'COMBAT_VISUAL_EFFECTS',
                COMBAT_FX 'COMBAT_VISUAL_EFFECTS',
                VISUAL_EFFECTS 'COMBAT_VISUAL_EFFECTS',
                COMBAT_VISUAL_EFFECTS 'COMBAT_VISUAL_EFFECTS',
                PROJECTILE 'PROJECTILE_EFFECT_NAME',
                PROJECTILE_FX 'PROJECTILE_EFFECT_NAME',
                PROJECTILE_EFFECT 'PROJECTILE_EFFECT_NAME',
                PROJECTILE_EFFECT_NAME 'PROJECTILE_EFFECT_NAME',
                DIRECT_HIT 'DIRECT_HIT_EFFECT_NAME',
                DIRECT_HIT_FX 'DIRECT_HIT_EFFECT_NAME',
                DIRECT_HIT_EFFECT 'DIRECT_HIT_EFFECT_NAME',
                DIRECT_HIT_EFFECT_NAME 'DIRECT_HIT_EFFECT_NAME',
                AREA_HIT 'AREA_HIT_EFFECT_NAME',
                AREA_HIT_FX 'AREA_HIT_EFFECT_NAME',
                AREA_HIT_EFFECT 'AREA_HIT_EFFECT_NAME',
                AREA_HIT_EFFECT_NAME 'AREA_HIT_EFFECT_NAME',
                PLAYER_HEALTH 'PLAYER_HEALING_BUTTON',
                PLAYER_HEALING_BUTTON 'PLAYER_HEALING_BUTTON',
                PLAYER_RANGE 'PLAYER_ACTION_RANGE_CHECK',
                PLAYER_TARGET_RANGE 'PLAYER_ACTION_RANGE_CHECK',
                PLAYER_TARGET_RANGE_CHECK 'PLAYER_ACTION_RANGE_CHECK',
                PLAYER_ACTION_RANGE_CHECK 'PLAYER_ACTION_RANGE_CHECK',
                PLAYER_AREA_MARK 'PLAYER_TOKEN_AREA_MARK',
                PLAYER_TOKEN_AREA_MARK 'PLAYER_TOKEN_AREA_MARK',
                PLAYER_AREA_MARKER_KEEP 'PLAYER_AREA_MARKER_KEEP_UNTIL_ROLLED',
                PLAYER_AREA_MARKER_KEEP_UNTIL_ROLLED 'PLAYER_AREA_MARKER_KEEP_UNTIL_ROLLED',
                PLAYER_AREA_MARKER_UNTIL_ROLLS 'PLAYER_AREA_MARKER_KEEP_UNTIL_ROLLED',
                KEEP_AREA_MARKER_UNTIL_ROLLS 'PLAYER_AREA_MARKER_KEEP_UNTIL_ROLLED',
                MARKER_FREE 'AREA_MARKER_FREE_MOVEMENT',
                MARKER_FREE_MOVEMENT 'AREA_MARKER_FREE_MOVEMENT',
                AREA_MARKER_FREE 'AREA_MARKER_FREE_MOVEMENT',
                AREA_MARKER_FREE_MOVEMENT 'AREA_MARKER_FREE_MOVEMENT',
                PLAYER_MARKER_SQUARE 'PLAYER_MARKER_SQUARE_URL',
                PLAYER_MARKER_SQUARE_URL 'PLAYER_MARKER_SQUARE_URL',
                PLAYER_MARKER_RADIUS 'PLAYER_MARKER_RADIUS_URL',
                PLAYER_MARKER_RADIUS_URL 'PLAYER_MARKER_RADIUS_URL',
                PLAYER_MARKER_OPACITY 'PLAYER_MARKER_OPACITY',
                PLAYER_TOKEN_MARK_OPACITY 'PLAYER_MARKER_OPACITY',
                PLAYER_TOKEN_MARKER_OPACITY 'PLAYER_MARKER_OPACITY',
                PLAYER_MANUAL 'PLAYER_MANUAL_ROLL',
                PLAYER_MANUAL_ROLL 'PLAYER_MANUAL_ROLL',
                MANUAL_ROLL 'PLAYER_MANUAL_ROLL',
                AREA_RADIUS_DEBUG 'AREA_RADIUS_DEBUG_DRAW',
                AREA_RADIUS_DEBUG_DRAW 'AREA_RADIUS_DEBUG_DRAW',
                AREA_DEBUG_DRAW 'AREA_RADIUS_DEBUG_DRAW',
                RADIUS_DEBUG_DRAW 'AREA_RADIUS_DEBUG_DRAW',
                CA2014 'SHEET_2014_CA_ROLLS',
                '2014' 'SHEET_2014_CA_ROLLS',
                '2014_CA' 'SHEET_2014_CA_ROLLS',
                '2014_CA_ROLLS' 'SHEET_2014_CA_ROLLS',
                SHEET_2014_CA_ROLLS 'SHEET_2014_CA_ROLLS',
                TURN 'TURN_TRACKER',
                TURN_TRACKER 'TURN_TRACKER',
                TURN_MOVEMENT_TRACKER 'TURN_MOVEMENT_TRACKER',
                MOVEMENT_TRACKER 'TURN_MOVEMENT_TRACKER',
                TURN_MOVEMENT 'TURN_MOVEMENT_TRACKER',
                SHOW_PLAYER_RESOURCES 'SHOW_PLAYER_RESOURCES',
                PLAYER_RESOURCES 'SHOW_PLAYER_RESOURCES',
                SHOW_NPC_RESOURCES 'SHOW_NPC_RESOURCES',
                NPC_RESOURCES 'SHOW_NPC_RESOURCES',
                HANDLE_ACTIONS 'HANDLE_ACTIONS',
                TURN_TOKEN_ACTION 'HANDLE_ACTIONS',
                TURN_TOKEN_ACTIONS 'HANDLE_ACTIONS',
                ACTIONS 'HANDLE_ACTIONS',
                TURN_ACTIONS 'HANDLE_ACTIONS',
                PLAYER_ACTIONS 'HANDLE_ACTIONS',
                PLAYER_PUBLIC_RESOURCE_USAGE 'PLAYER_PUBLIC_RESOURCE_USAGE',
                PLAYER_PUBLIC_USAGE 'PLAYER_PUBLIC_RESOURCE_USAGE',
                PUBLIC_RESOURCE_USAGE 'PLAYER_PUBLIC_RESOURCE_USAGE',
                CONC_TURN_TRACKER 'CONC_TURN_TRACKER',
                CONCENTRATION_TURN_TRACKER 'CONC_TURN_TRACKER',
                CONC_TURN 'CONC_TURN_TRACKER',
                ROUND_COUNTER 'ROUND_COUNTER',
                PUBLIC_ROUND_COUNTER 'PUBLIC_ROUND_COUNTER',
                REMOVE_DEAD 'REMOVE_NPC_DEAD_TOKENS',
                REMOVE_NPC_DEAD 'REMOVE_NPC_DEAD_TOKENS',
                REMOVE_NPC_DEAD_TOKENS 'REMOVE_NPC_DEAD_TOKENS',
                TURN_MARKER 'TURN_MARKER',
                PUBLIC_TURN_MARKER 'PUBLIC_TURN_MARKER',
                TURN_MARKER_TOKEN_IMAGE 'TURN_MARKER_IMAGE_URL',
                TURN_MARKER_URL 'TURN_MARKER_IMAGE_URL',
                TURN_MARKER_IMAGE 'TURN_MARKER_IMAGE_URL',
                TURN_MARKER_IMAGE_URL 'TURN_MARKER_IMAGE_URL',
                TURN_MARKER_TOKEN_OFFSET 'TURN_MARKER_IMG_SIZE',
                TURN_MARKER_SIZE 'TURN_MARKER_IMG_SIZE',
                TURN_MARKER_SIZE_PERCENT 'TURN_MARKER_IMG_SIZE',
                TURN_MARKER_PERCENT 'TURN_MARKER_IMG_SIZE',
                TURN_MARKER_IMG_SIZE 'TURN_MARKER_IMG_SIZE',
                TURN_MARKER_FOLLOW 'TURN_MARKER_FOLLOW',
                TURN_AUTO_FOCUS 'TURN_AUTO_FOCUS',
                REVEAL_NAMES 'REVEAL_TOKEN_NAMES_IN_LOG',
                REVEAL_TOKEN_NAMES 'REVEAL_TOKEN_NAMES_IN_LOG',
                REVEAL_TOKEN_NAMES_IN_LOG 'REVEAL_TOKEN_NAMES_IN_LOG',
                HIDE_NAMES 'HIDE_TOKEN_NAMES_IN_LOG',
                HIDE_TOKEN_NAMES 'HIDE_TOKEN_NAMES_IN_LOG',
                HIDE_TOKEN_NAMES_IN_LOG 'HIDE_TOKEN_NAMES_IN_LOG',
                BG 'CHAT_BACKGROUND_IMAGE_URL',
                BACKGROUND 'CHAT_BACKGROUND_IMAGE_URL',
                CHAT_BACKGROUND_IMAGE_URL 'CHAT_BACKGROUND_IMAGE_URL',
                DEBUG 'DEBUG',
                CHAT_DEBUG_ATTACKS 'CHAT_DEBUG_ATTACKS',
                DEBUG_ATTACKS 'CHAT_DEBUG_ATTACKS',
                CHAT_DEBUG_SPELLS 'CHAT_DEBUG_SPELLS',
                DEBUG_SPELLS 'CHAT_DEBUG_SPELLS'
    });

     -----------------------------------------------------------------------
      State
      --------------------------------------------------------------------- 
    const State = {
        defaults() {
            return {
                schemaVersion META.SCHEMA_VERSION,
                settings Object.assign({}, RUNTIME_CONFIG_DEFAULTS),
                recentAttacks {},
                recentAttackQueue [],
                pendingNativeSaves {},
                pendingNativeInitiatives {},
                pendingNativeInitiativeBatches {},
                pendingNativeInitiativeSeq 0,
                playerActionRequests {},
                concentration {},
                turnTracker {
                    round 0,
                    pivotTokenId '',
                    pivotPr '',
                    currentTokenId '',
                    knownTokenIds [],
                    roundProgressTokenIds [],
                    pendingAddedTokenIds [],
                    turnMarkerId '',
                    movement { tokenId '', baseSpeed 0, spent 0, dashCount 0, dashBonus 0, warned false, lastLeft null, lastTop null },
                    active false
                },
                helperCharacterId ''
            };
        },

        isRecord(value) {
            return !!value && typeof value === 'object' && !Array.isArray(value);
        },

        ensure() {
            if (!this.isRecord(state[META.STATE_KEY]) && META.LEGACY_STATE_KEY && this.isRecord(state[META.LEGACY_STATE_KEY])) {
                state[META.STATE_KEY] = state[META.LEGACY_STATE_KEY];
            }
            if (!this.isRecord(state[META.STATE_KEY])) {
                state[META.STATE_KEY] = this.defaults();
                STATE_INITIALIZED = false;
            }
            if (!STATE_INITIALIZED  state[META.STATE_KEY].schemaVersion !== META.SCHEMA_VERSION) {
                this.migrate();
                STATE_INITIALIZED = true;
            }
            return state[META.STATE_KEY];
        },

        migrate() {
            const root = this.isRecord(state[META.STATE_KEY])  state[META.STATE_KEY]  this.defaults();
            state[META.STATE_KEY] = root;
            root.schemaVersion = Math.max(1, Utils.toInt(root.schemaVersion, 1));
            root.settings = this.isRecord(root.settings)  root.settings  {};
             Debug controls are intentionally session-only. Remove stale values left
             by older releases so these options never remain persisted in state.
            delete root.settings.DEBUG;
            delete root.settings.CHAT_DEBUG_ATTACKS;
            delete root.settings.CHAT_DEBUG_SPELLS;
            Object.keys(RUNTIME_CONFIG_DEFAULTS).forEach((key) = {
                if (!Object.prototype.hasOwnProperty.call(root.settings, key)) {
                    root.settings[key] = RUNTIME_CONFIG_DEFAULTS[key];
                }
            });
            root.recentAttacks = this.isRecord(root.recentAttacks)  root.recentAttacks  {};
            root.recentAttackQueue = Array.isArray(root.recentAttackQueue)  root.recentAttackQueue  [];
            root.pendingNativeSaves = this.isRecord(root.pendingNativeSaves)  root.pendingNativeSaves  {};
            root.pendingNativeInitiatives = this.isRecord(root.pendingNativeInitiatives)  root.pendingNativeInitiatives  {};
            root.pendingNativeInitiativeBatches = this.isRecord(root.pendingNativeInitiativeBatches)  root.pendingNativeInitiativeBatches  {};
            root.pendingNativeInitiativeSeq = Math.max(0, Utils.toInt(root.pendingNativeInitiativeSeq, 0));
            root.playerActionRequests = this.isRecord(root.playerActionRequests)  root.playerActionRequests  {};
            root.concentration = this.isRecord(root.concentration)  root.concentration  {};
            root.turnTracker = this.isRecord(root.turnTracker)  root.turnTracker  {};
            root.turnTracker.round = Math.max(0, Utils.toInt(root.turnTracker.round, 0));
            root.turnTracker.pivotTokenId = String(root.turnTracker.pivotTokenId  '').trim();
            root.turnTracker.pivotPr = String(root.turnTracker.pivotPr  '').trim();
            root.turnTracker.currentTokenId = String(root.turnTracker.currentTokenId  '').trim();
            root.turnTracker.knownTokenIds = Array.isArray(root.turnTracker.knownTokenIds)  root.turnTracker.knownTokenIds  [];
            root.turnTracker.roundProgressTokenIds = Array.isArray(root.turnTracker.roundProgressTokenIds)  root.turnTracker.roundProgressTokenIds  [];
            root.turnTracker.pendingAddedTokenIds = Array.isArray(root.turnTracker.pendingAddedTokenIds)  root.turnTracker.pendingAddedTokenIds  [];
            root.turnTracker.turnMarkerId = String(root.turnTracker.turnMarkerId  '').trim();
            root.turnTracker.movement = this.isRecord(root.turnTracker.movement)  root.turnTracker.movement  {};
            root.turnTracker.movement.tokenId = String(root.turnTracker.movement.tokenId  '').trim();
            root.turnTracker.movement.baseSpeed = Math.max(0, Utils.toNumber(root.turnTracker.movement.baseSpeed, 0));
            root.turnTracker.movement.spent = Math.max(0, Utils.toNumber(root.turnTracker.movement.spent, 0));
            root.turnTracker.movement.dashCount = Math.max(0, Utils.toInt(root.turnTracker.movement.dashCount, 0));
            root.turnTracker.movement.dashBonus = Math.max(0, Utils.toNumber(root.turnTracker.movement.dashBonus, 0));
            root.turnTracker.movement.warned = Utils.toBoolean(root.turnTracker.movement.warned, false);
            root.turnTracker.movement.lastLeft = root.turnTracker.movement.lastLeft === null  root.turnTracker.movement.lastLeft === undefined  null  Utils.toNumber(root.turnTracker.movement.lastLeft, null);
            root.turnTracker.movement.lastTop = root.turnTracker.movement.lastTop === null  root.turnTracker.movement.lastTop === undefined  null  Utils.toNumber(root.turnTracker.movement.lastTop, null);
            root.turnTracker.active = Utils.toBoolean(root.turnTracker.active, false);
            root.helperCharacterId = String(root.helperCharacterId  '').trim();
            root.schemaVersion = META.SCHEMA_VERSION;
        },

        get() {
            return this.ensure();
        },

        createPlayerActionRequest(data) {
            const root = this.get();
            root.playerActionRequests = root.playerActionRequests  {};
            this.cleanupPlayerActionRequests();
            const id = 'pa_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
            const requestedUses = Math.max(1, Utils.toInt(data && data.uses, 1));
            root.playerActionRequests[id] = Object.assign({}, data  {}, {
                id,
                createdAt Date.now(),
                uses requestedUses,
                remainingUses requestedUses,
                usedTargetIds [],
                reservations {},
                used false
            });
            return id;
        },

        getPlayerActionRequest(id) {
            const root = this.get();
            root.playerActionRequests = root.playerActionRequests  {};
            const safeId = String(id  '').trim();
            return safeId  (root.playerActionRequests[safeId]  null)  null;
        },

        cleanupPlayerActionReservations(request) {
            if (!request) return;
            const now = Date.now();
            request.reservations = request.reservations && typeof request.reservations === 'object'  request.reservations  {};
            Object.keys(request.reservations).forEach((key) = {
                const createdAt = Number(request.reservations[key]  0);
                if (!createdAt  now - createdAt  PLAYER_ACTION_RESERVATION_MS) delete request.reservations[key];
            });
        },

        reservePlayerAction(id, targetId) {
            const request = this.getPlayerActionRequest(id);
            if (!request  request.used) return false;
            this.cleanupPlayerActionReservations(request);
            const safeTargetId = String(targetId  '__action__').trim()  '__action__';
            request.usedTargetIds = Array.isArray(request.usedTargetIds)  request.usedTargetIds  [];
            if (request.usedTargetIds.indexOf(safeTargetId) = 0  request.reservations[safeTargetId]) return false;
            const remaining = Math.max(0, Utils.toInt(request.remainingUses, Utils.toInt(request.uses, 1)));
            if (remaining = Object.keys(request.reservations).length) return false;
            request.reservations[safeTargetId] = Date.now();
            return true;
        },

        commitPlayerAction(id, targetId) {
            const request = this.getPlayerActionRequest(id);
            if (!request  request.used) return false;
            this.cleanupPlayerActionReservations(request);
            const safeTargetId = String(targetId  '__action__').trim()  '__action__';
            if (!request.reservations[safeTargetId]) return false;
            delete request.reservations[safeTargetId];
            request.usedTargetIds = Array.isArray(request.usedTargetIds)  request.usedTargetIds  [];
            if (request.usedTargetIds.indexOf(safeTargetId)  0) request.usedTargetIds.push(safeTargetId);
            const remaining = Math.max(1, Utils.toInt(request.remainingUses, Utils.toInt(request.uses, 1)));
            request.remainingUses = Math.max(0, remaining - 1);
            if (request.remainingUses = 0) request.used = true;
            request.usedAt = Date.now();
            return true;
        },

        releasePlayerAction(id, targetId) {
            const request = this.getPlayerActionRequest(id);
            if (!request) return false;
            const safeTargetId = String(targetId  '__action__').trim()  '__action__';
            request.reservations = request.reservations && typeof request.reservations === 'object'  request.reservations  {};
            if (!request.reservations[safeTargetId]) return false;
            delete request.reservations[safeTargetId];
            return true;
        },

        markPlayerActionUsed(id) {
            const key = '__legacy__';
            return this.reservePlayerAction(id, key) && this.commitPlayerAction(id, key);
        },

        markPlayerActionTargetUsed(id, targetId) {
            const request = this.getPlayerActionRequest(id);
            if (!request  request.used) return false;
            const safeTargetId = String(targetId  '').trim();
            request.usedTargetIds = Array.isArray(request.usedTargetIds)  request.usedTargetIds  [];
            if (safeTargetId && request.usedTargetIds.indexOf(safeTargetId)  0) request.usedTargetIds.push(safeTargetId);
            return true;
        },

        setConcentration(entry) {
            const root = this.get();
            root.concentration = root.concentration  {};
            const safeTokenId = String(entry && entry.casterTokenId  '').trim();
            if (!safeTokenId) return false;
            root.concentration[safeTokenId] = Object.assign({}, entry  {}, {
                casterTokenId safeTokenId,
                startedAt Date.now()
            });
            return true;
        },

        getConcentrationByTokenId(tokenId) {
            const root = this.get();
            root.concentration = root.concentration  {};
            return root.concentration[String(tokenId  '').trim()]  null;
        },

        getConcentrationByActionId(actionId) {
            const root = this.get();
            root.concentration = root.concentration  {};
            const safeActionId = String(actionId  '').trim();
            if (!safeActionId) return null;
            const tokenIds = Object.keys(root.concentration);
            for (let i = 0; i  tokenIds.length; i += 1) {
                const entry = root.concentration[tokenIds[i]]  {};
                if (String(entry.actionId  '').trim() === safeActionId) return entry;
            }
            return null;
        },

        removeConcentrationByTokenId(tokenId) {
            const root = this.get();
            root.concentration = root.concentration  {};
            const safeTokenId = String(tokenId  '').trim();
            if (!safeTokenId  !root.concentration[safeTokenId]) return null;
            const entry = root.concentration[safeTokenId];
            delete root.concentration[safeTokenId];
            return entry;
        },

        reconcilePersistentState() {
            const root = this.get();
            root.concentration = this.isRecord(root.concentration)  root.concentration  {};
            root.playerActionRequests = this.isRecord(root.playerActionRequests)  root.playerActionRequests  {};
            const activeActionIds = Object.create(null);

            Object.keys(root.concentration).forEach((tokenId) = {
                const entry = root.concentration[tokenId]  {};
                const casterTokenId = String(entry.casterTokenId  tokenId  '').trim();
                const actionId = String(entry.actionId  '').trim();
                const tokenExists = casterTokenId && typeof R20 !== 'undefined' && !!R20.getTokenById(casterTokenId);
                const request = actionId  root.playerActionRequests[actionId]  null;
                if (tokenExists && request) {
                    activeActionIds[actionId] = true;
                    return;
                }
                if (request) {
                    this.removePlayerActionMarkers(request);
                    delete root.playerActionRequests[actionId];
                }
                delete root.concentration[tokenId];
            });

            Object.keys(root.playerActionRequests).forEach((actionId) = {
                const request = root.playerActionRequests[actionId]  {};
                if (!request.concentrationAreaActive  activeActionIds[actionId]) return;
                this.removePlayerActionMarkers(request);
                delete root.playerActionRequests[actionId];
            });
            return true;
        },

        beginPersistentAreaMarkerResolution(id, targetIds) {
            const request = this.getPlayerActionRequest(id);
            if (!request) return false;
            const ids = Utils.uniqueNames((Array.isArray(targetIds)  targetIds  [])
                .map((targetId) = String(targetId  '').trim())
                .filter(Boolean));
            request.areaMarkerKeepUntilRolled = true;
            request.areaResolutionActive = true;
            request.areaTargetIds = ids;
            request.areaPendingTargetIds = ids.slice();
            request.areaCompletedTargetIds = [];
            request.used = true;
            request.usedAt = Date.now();
            request.reservations = {};
            return ids.length  0;
        },

        completePersistentAreaMarkerTarget(id, targetId) {
            const request = this.getPlayerActionRequest(id);
            const safeTargetId = String(targetId  '').trim();
            if (!request  !request.areaMarkerKeepUntilRolled  !safeTargetId) return false;
            request.areaCompletedTargetIds = Array.isArray(request.areaCompletedTargetIds)  request.areaCompletedTargetIds  [];
            request.areaPendingTargetIds = Array.isArray(request.areaPendingTargetIds)  request.areaPendingTargetIds  [];
            if (request.areaCompletedTargetIds.indexOf(safeTargetId)  0) request.areaCompletedTargetIds.push(safeTargetId);
            request.areaPendingTargetIds = request.areaPendingTargetIds.filter((idValue) = String(idValue  '').trim() !== safeTargetId);
            if (request.areaPendingTargetIds.length  0) return false;
            this.removePersistentAreaMarkerRequest(id);
            return true;
        },

        removePersistentAreaMarkerRequest(id) {
            const root = this.get();
            root.playerActionRequests = root.playerActionRequests  {};
            const request = root.playerActionRequests[String(id  '').trim()];
            if (!request) return false;
            this.removePlayerActionMarkers(request);
            delete root.playerActionRequests[String(id  '').trim()];
            return true;
        },

        getPlayerActionMarkerIds(entry) {
            const ids = [];
            const addId = (markerId) = {
                const safeId = String(markerId  '').trim();
                if (safeId && ids.indexOf(safeId)  0) ids.push(safeId);
            };
            if (entry && Array.isArray(entry.markerTokenIds)) entry.markerTokenIds.forEach(addId);
            addId(entry && entry.markerTokenId);
            const alternatives = entry && Array.isArray(entry.areaMarkerAlternatives)  entry.areaMarkerAlternatives  [];
            alternatives.forEach((alternative) = {
                if (!alternative  alternative.dismissed) return;
                if (Array.isArray(alternative.markerTokenIds)) alternative.markerTokenIds.forEach(addId);
                addId(alternative.markerTokenId);
            });
            return ids;
        },

        removePlayerActionMarkers(entry) {
            if (typeof R20 === 'undefined') return false;
            let removed = false;
            AREA_MARKER_DESTROY_ACTIVE = true;
            try {
                this.getPlayerActionMarkerIds(entry).forEach((markerId) = {
                    const marker = R20.getTokenById(markerId);
                    if (marker && R20.removeGraphic(marker)) removed = true;
                });
            } finally {
                AREA_MARKER_DESTROY_ACTIVE = false;
            }
            return removed;
        },

        findAreaMarkerGroupByTokenId(tokenId) {
            const found = this.findAreaMarkerRequestByTokenId(tokenId);
            return found && found.group  found  null;
        },

        findAreaMarkerRequestByTokenId(tokenId) {
            const safeTokenId = String(tokenId  '').trim();
            if (!safeTokenId) return null;
            const root = this.get();
            root.playerActionRequests = root.playerActionRequests  {};
            const requestIds = Object.keys(root.playerActionRequests);
            for (let i = 0; i  requestIds.length; i += 1) {
                const request = root.playerActionRequests[requestIds[i]]  {};
                const alternatives = Array.isArray(request.areaMarkerAlternatives)  request.areaMarkerAlternatives  [];
                for (let a = 0; a  alternatives.length; a += 1) {
                    const alternative = alternatives[a]  {};
                    const ids = [];
                    if (Array.isArray(alternative.markerTokenIds)) ids.push.apply(ids, alternative.markerTokenIds);
                    if (alternative.markerTokenId) ids.push(alternative.markerTokenId);
                    if (ids.map((id) = String(id  '').trim()).indexOf(safeTokenId) = 0) {
                        return {
                            requestId requestIds[i],
                            request,
                            alternative,
                            group alternative.markerGroup  null
                        };
                    }
                }
                const markerIds = [];
                if (Array.isArray(request.markerTokenIds)) markerIds.push.apply(markerIds, request.markerTokenIds);
                if (request.markerTokenId) markerIds.push(request.markerTokenId);
                if (markerIds.map((id) = String(id  '').trim()).indexOf(safeTokenId) = 0) {
                    return { requestId requestIds[i], request, alternative null, group request.areaMarkerGroup  null };
                }
            }
            return null;
        },

        shouldKeepPersistentAreaMarker(entry) {
            return !!(entry && (entry.concentrationAreaActive  (entry.areaMarkerKeepUntilRolled && Array.isArray(entry.areaPendingTargetIds) && entry.areaPendingTargetIds.length  0)));
        },

        isConcentrationAction(entry) {
            return !!(entry && entry.concentrationAreaActive);
        },

        prunePlayerActionRequests(root, now) {
            root.playerActionRequests = this.isRecord(root.playerActionRequests)  root.playerActionRequests  {};
            Object.keys(root.playerActionRequests).forEach((id) = {
                const entry = root.playerActionRequests[id]  {};
                this.cleanupPlayerActionReservations(entry);
                const createdAt = Number(entry.createdAt  0);
                const age = createdAt  now - createdAt  Number.POSITIVE_INFINITY;
                const expired = !createdAt  age  PLAYER_ACTION_TTL_MS;
                if (!entry.used && !expired) return;
                if (this.isConcentrationAction(entry)) return;
                if (this.shouldKeepPersistentAreaMarker(entry) && !expired) return;
                this.removePlayerActionMarkers(entry);
                delete root.playerActionRequests[id];
            });
        },

        pruneTimedMap(root, key, now, maxAgeMs, onExpire, timestampField) {
            root[key] = this.isRecord(root[key])  root[key]  {};
            const field = String(timestampField  'createdAt');
            Object.keys(root[key]).forEach((id) = {
                const entry = root[key][id]  {};
                const timestamp = Number(entry[field]  0);
                if (timestamp && now - timestamp = maxAgeMs) return;
                if (Utils.isFunction(onExpire)) onExpire(id, entry);
                delete root[key][id];
            });
        },

        clearInitiativeBatchRuntime(batchId) {
            const safeBatchId = String(batchId  '').trim();
            if (!safeBatchId) return;
            if (INITIATIVE_BATCH_TIMERS[safeBatchId]) {
                clearTimeout(INITIATIVE_BATCH_TIMERS[safeBatchId]);
                delete INITIATIVE_BATCH_TIMERS[safeBatchId];
            }
            Object.keys(INITIATIVE_AUTO_WATCHDOGS).forEach((key) = {
                if (key.indexOf(safeBatchId + '') !== 0) return;
                clearTimeout(INITIATIVE_AUTO_WATCHDOGS[key]);
                delete INITIATIVE_AUTO_WATCHDOGS[key];
            });
            delete INITIATIVE_AUTO_COMPLETIONS[safeBatchId];
        },

        cleanupPlayerActionRequests() {
            this.prunePlayerActionRequests(this.get(), Date.now());
        },

        cleanupRuntimeQueues(force) {
            const now = Date.now();
            if (!force && now - LAST_RUNTIME_CLEANUP_AT  RUNTIME_CLEANUP_INTERVAL_MS) return false;
            LAST_RUNTIME_CLEANUP_AT = now;
            const root = this.get();

            this.prunePlayerActionRequests(root, now);
            this.pruneTimedMap(root, 'pendingNativeSaves', now, NATIVE_ROLL_TTL_MS);
            this.pruneTimedMap(root, 'pendingNativeInitiatives', now, NATIVE_ROLL_TTL_MS);
            this.pruneTimedMap(root, 'pendingNativeInitiativeBatches', now, NATIVE_ROLL_TTL_MS, (id) = {
                this.clearInitiativeBatchRuntime(id);
            });
            this.pruneTimedMap(root, 'recentAttacks', now, RECENT_ATTACK_TTL_MS, null, 'timestamp');

            root.recentAttackQueue = (Array.isArray(root.recentAttackQueue)  root.recentAttackQueue  [])
                .filter((entry) = entry && now - Number(entry.timestamp  0) = RECENT_ATTACK_TTL_MS)
                .slice(-20);
            return true;
        }

    };

     -----------------------------------------------------------------------
      Logger
      --------------------------------------------------------------------- 
    const Logger = {
        isDebugEnabled() {
            return !!RuntimeConfig.get('DEBUG');
        },

        format(value) {
            if (value instanceof Error) return value.stack  value.message  String(value);
            if (typeof value === 'string') return value;
            if (value === undefined) return 'undefined';
            if (value === null) return 'null';
            if (typeof value === 'object') {
                 Roll20 sometimes surfaces thrownerror-like objects whose enumerable
                 JSON representation is only {}. Read their non-enumerable fields too.
                try {
                    const names = Object.getOwnPropertyNames(value  {});
                    const errorLike = {};
                    names.forEach((key) = {
                        try { errorLike[key] = value[key]; } catch (ignored) {}
                    });
                    if (value.name && !errorLike.name) errorLike.name = value.name;
                    if (value.message && !errorLike.message) errorLike.message = value.message;
                    if (value.stack && !errorLike.stack) errorLike.stack = value.stack;
                    const json = JSON.stringify(errorLike);
                    if (json && json !== '{}') return json;
                    return JSON.stringify(value);
                } catch (ignored) {
                    return String(value);
                }
            }
            return String(value);
        },

        write(level, argsLike) {
            const suffix = level  ('' + level)  '';
            const args = Array.prototype.slice.call(argsLike  []).map((value) = this.format(value));
            log('[' + META.LOG_NAME + suffix + '] ' + args.join(' '));
        },

        info() {
            this.write('', arguments);
        },

        debug() {
            if (!this.isDebugEnabled()) return;
            this.write('DEBUG', arguments);
        },

        error() {
            this.write('ERROR', arguments);
        }
    };

     -----------------------------------------------------------------------
      Utils
      --------------------------------------------------------------------- 
    const Utils = {
        asString(value, fallback) {
            if (fallback === undefined) fallback = '';
            return value === undefined  value === null  fallback  String(value);
        },

        toInt(value, fallback) {
            if (fallback === undefined) fallback = 0;
            const n = parseInt(value, 10);
            return Number.isNaN(n)  fallback  n;
        },

        toNumber(value, fallback) {
            if (fallback === undefined) fallback = 0;
            const n = parseFloat(value);
            return Number.isNaN(n)  fallback  n;
        },

        toBoolean(value, fallback) {
            if (fallback === undefined) fallback = false;
            if (value === undefined  value === null  String(value).trim() === '') return fallback;
            if (value === true  value === false) return value;
            const normalized = String(value).trim().toLowerCase();
            if (['1', 'true', 'yes', 'y', 'on', 'enable', 'enabled'].indexOf(normalized) = 0) return true;
            if (['0', 'false', 'no', 'n', 'off', 'disable', 'disabled'].indexOf(normalized) = 0) return false;
            return fallback;
        },

        clamp(value, min, max) {
            return Math.max(min, Math.min(max, value));
        },

        isFunction(value) {
            return typeof value === 'function';
        },

        isNonEmptyString(value) {
            return typeof value === 'string' && value.trim().length  0;
        },

        escapeHtml(value) {
            return Utils.asString(value)
                .replace(&g, '&amp;')
                .replace(g, '&lt;')
                .replace(g, '&gt;')
                .replace(g, '&quot;')
                .replace('g, '&#39;');
        },

        attrSafe(value) {
            return Utils.escapeHtml(value).replace([rn]+g, ' ');
        },

        stripHtml(value) {
            return String(value  '')
                .replace(brsgi, 'n')
                .replace((pdivlitrh[1-6])gi, 'n')
                .replace(li[^]gi, '- ')
                .replace([^]+g, '')
                .replace(&nbsp;gi, ' ')
                .replace(&quot;gi, '')
                .replace(&#39;&apos;gi, ')
                .replace(&lt;gi, '')
                .replace(&gt;gi, '')
                .replace(&amp;gi, '&')
                .trim();
        },

        cleanRoll20Label(value) {
            return Utils.stripHtml(value)
                .replace([([^]]+)](([^)]+))g, '$1')
                .replace($[[d+]]g, '')
                .replace(s+g, ' ')
                .trim();
        },

        truncate(value, maxLength) {
            const text = String(value  '');
            const max = Math.max(20, Utils.toInt(maxLength, 1200));
            return text.length  max  text.slice(0, max) + '...'  text;
        },

        sanitizeJsonValue(value, depth) {
            const level = Math.max(0, Utils.toInt(depth, 0));
            if (level  8) return null;
            if (value === null  value === undefined) return value;
            if (typeof value === 'string') return value.slice(0, 5000);
            if (typeof value === 'number') return Number.isFinite(value)  value  0;
            if (typeof value === 'boolean') return value;
            if (Array.isArray(value)) return value.slice(0, 200).map((entry) = this.sanitizeJsonValue(entry, level + 1));
            if (typeof value !== 'object') return null;
            const safe = {};
            Object.keys(value).slice(0, 200).forEach((key) = {
                if (key === '__proto__'  key === 'prototype'  key === 'constructor') return;
                safe[key] = this.sanitizeJsonValue(value[key], level + 1);
            });
            return safe;
        },

        encodeJsonPayload(value) {
            try {
                const json = JSON.stringify(this.sanitizeJsonValue(value  {}, 0));
                if (json.length  MAX_PAYLOAD_LENGTH) throw new Error('Payload exceeds maximum length.');
                return encodeURIComponent(json);
            } catch (error) {
                Logger.debug('[Payloadencode]', error && error.message  error.message  String(error));
                return '%7B%7D';
            }
        },

        decodeJsonPayload(value, fallback) {
            if (fallback === undefined) fallback = {};
            try {
                const raw = String(value  '').trim();
                if (!raw  raw.length  MAX_PAYLOAD_LENGTH  12) return fallback;
                const decoded = decodeURIComponent(raw);
                if (decoded.length  MAX_PAYLOAD_LENGTH) return fallback;
                const parsed = JSON.parse(decoded);
                return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
                     this.sanitizeJsonValue(parsed, 0)
                     fallback;
            } catch (error) {
                Logger.debug('[Payloaddecode]', error && error.message  error.message  String(error));
                return fallback;
            }
        },

        splitCommand(content) {
            const text = Utils.asString(content).trim();
            const parts = text.split(s+);
            return { raw text, base parts[0]  '', args parts.slice(1) };
        },

        normalizeName(value) {
            let text = String(value  '')
                .trim()
                .toLowerCase()
                .replace([^]g, '')
                .replace(&nbsp;g, ' ')
                .replace(&amp;g, '&');
            try {
                text = text.normalize('NFKD').replace([u0300-u036f]g, '');
            } catch (ignored) {}
            try {
                text = text.replace(new RegExp('[^p{L}p{N}]+', 'gu'), ' ');
            } catch (ignored) {
                text = text.replace([^a-z0-9]+g, ' ');
            }
            return text.replace(s+g, ' ').trim();
        },

        uniqueNames(list) {
            const seen = Object.create(null);
            const out = [];
            (Array.isArray(list)  list  []).forEach((entry) = {
                const name = String(entry  '').trim();
                const key = name.toLowerCase();
                if (!name  seen[key]) return;
                seen[key] = true;
                out.push(name);
            });
            return out;
        },

        formatSigned(value) {
            const n = Utils.toInt(value, 0);
            return (n = 0  '+'  '') + String(n);
        },

        isSafeImageUrl(value) {
            const url = String(value  '').trim();
            return url === ''  ^https[^s'()]+$i.test(url);
        },

        extractUrl(value) {
            const text = String(value  '').trim();
            const markdown = text.match(((https[^)s]+))i);
            if (markdown) return markdown[1];
            const raw = text.match(https[^s)]+i);
            return raw  raw[0]  text;
        },

        isRoll20FileUrl(value) {
            const url = Utils.extractUrl(value);
            return !url  (Utils.isSafeImageUrl(url) && ^httpsfiles.d20.ioimagesi.test(url));
        },

        stripWrappingQuotes(value) {
            const text = String(value  '').trim();
            if (text.length = 2) {
                const first = text.charAt(0);
                const last = text.charAt(text.length - 1);
                if ((first === '' && last === '')  (first === ' && last === ')) return text.slice(1, -1).trim();
            }
            return text;
        },

        isAnimatedVideoUrl(value) {
            const url = Utils.extractUrl(value);
            return .(webmmp4)($)i.test(String(url  ''));
        },

        roll20StaticPreviewUrl(value) {
            const url = Utils.extractUrl(value);
            if (!Utils.isSafeImageUrl(url)) return '';
            if (!Utils.isAnimatedVideoUrl(url)) return url;
            if (!imagesi.test(url)) return '';
             Roll20 uses sample.png as the static preview for animated library
             assets (including the image shown for animated tokens in Turn Order).
             Chat cannot render WEBMMP4 through an img, so use that preview.
            const preview = url.replace(
                (thumbmedoriginalmax).(webmmp4)(=$)i,
                'sample.png'
            );
            return preview !== url  preview  '';
        }
    };

     -----------------------------------------------------------------------
      Runtime config
      --------------------------------------------------------------------- 
    const RuntimeConfig = {
        persistedSettings() {
            const root = State.get();
            root.settings = root.settings  {};
             Keep temporary debug flags out of persistent state even if an older
             schema or a manual edit left them behind.
            delete root.settings.DEBUG;
            delete root.settings.CHAT_DEBUG_ATTACKS;
            delete root.settings.CHAT_DEBUG_SPELLS;
            const hadRevealTokenNames = Object.prototype.hasOwnProperty.call(root.settings, 'REVEAL_TOKEN_NAMES_IN_LOG');
            Object.keys(RUNTIME_CONFIG_DEFAULTS).forEach((key) = {
                if (!Object.prototype.hasOwnProperty.call(root.settings, key)) root.settings[key] = RUNTIME_CONFIG_DEFAULTS[key];
            });
            if (!hadRevealTokenNames) {
                root.settings.REVEAL_TOKEN_NAMES_IN_LOG = !Utils.toBoolean(root.settings.HIDE_TOKEN_NAMES_IN_LOG, false);
            }
            root.settings.HIDE_TOKEN_NAMES_IN_LOG = !Utils.toBoolean(root.settings.REVEAL_TOKEN_NAMES_IN_LOG, true);
            return root.settings;
        },

        isTemporaryKey(key) {
            return Object.prototype.hasOwnProperty.call(TEMP_RUNTIME_CONFIG_DEFAULTS, String(key  '').trim().toUpperCase());
        },

        getAll() {
            return Object.assign({}, this.persistedSettings(), TEMP_RUNTIME_CONFIG);
        },

        get(key) {
            const safeKey = String(key  '').trim().toUpperCase();
            if (this.isTemporaryKey(safeKey)) {
                return Object.prototype.hasOwnProperty.call(TEMP_RUNTIME_CONFIG, safeKey)
                     TEMP_RUNTIME_CONFIG[safeKey]
                     TEMP_RUNTIME_CONFIG_DEFAULTS[safeKey];
            }
            const config = this.persistedSettings();
            return Object.prototype.hasOwnProperty.call(config, safeKey)  config[safeKey]  RUNTIME_CONFIG_DEFAULTS[safeKey];
        },

        normalizeKey(key) {
            const normalized = String(key  '').trim().toUpperCase().replace([-s]+g, '_');
            return RUNTIME_CONFIG_ALIASES[normalized]  normalized;
        },

        getField(key) {
            const safeKey = this.normalizeKey(key);
            for (let i = 0; i  RUNTIME_CONFIG_FIELDS.length; i += 1) {
                if (RUNTIME_CONFIG_FIELDS[i].key === safeKey) return RUNTIME_CONFIG_FIELDS[i];
            }
            return null;
        },

        normalizeValue(field, value) {
            if (!field) return value;
            const fallback = this.isTemporaryKey(field.key)  TEMP_RUNTIME_CONFIG_DEFAULTS[field.key]  RUNTIME_CONFIG_DEFAULTS[field.key];
            if (field.type === 'boolean') return Utils.toBoolean(value, !!fallback);
            if (field.type === 'bar') return Utils.clamp(Utils.toInt(value, fallback), 1, 4);
            if (field.type === 'bar0') return Utils.clamp(Utils.toInt(value, fallback), 0, 4);
            if (field.type === 'percent') return Utils.clamp(Utils.toInt(value, fallback), 0, 100);
            if (field.type === 'number') return Math.max(0, Utils.toInt(value, fallback));
            if (field.type === 'roll20image') return Utils.extractUrl(value);
            if (field.type === 'image'  field.key === 'CHAT_BACKGROUND_IMAGE_URL') {
                const url = String(value === undefined  value === null  ''  value).trim();
                return Utils.isSafeImageUrl(url)  url  (fallback  '');
            }
            return String(value === undefined  value === null  ''  value).trim();
        },

        set(key, value) {
            const safeKey = this.normalizeKey(key);
            const field = this.getField(safeKey);
            if (!field) return { ok false, message 'Unknown setting ' + key + '.' };
            if (field.advancedOnly && !ADVANCED_MODE) return { ok false, message 'Enable advanced mode first with !ca advancemode yes.' };
            if (field.type === 'section') return { ok false, message 'Setting is not editable ' + key + '.' };
            if (field.type === 'bar'  field.type === 'bar0') {
                const raw = String(value === undefined  value === null  ''  value).trim();
                const bar = Utils.toInt(raw, null);
                const min = field.type === 'bar0'  0  1;
                if (bar === null  String(bar) !== raw  bar  min  bar  4) {
                    return { ok false, message field.label + ' must be a whole number from ' + min + ' to 4.' };
                }
            }
            if (field.type === 'percent') {
                const raw = String(value === undefined  value === null  ''  value).trim();
                const pct = Utils.toInt(raw, null);
                if (pct === null  String(pct) !== raw  pct  0  pct  100) {
                    return { ok false, message field.label + ' must be a whole number from 0 to 100.' };
                }
            }
            if (field.type === 'number') {
                const raw = String(value === undefined  value === null  ''  value).trim();
                const number = Utils.toInt(raw, null);
                if (number === null  String(number) !== raw  number  0) {
                    return { ok false, message field.label + ' must be a whole number of 0 or greater.' };
                }
            }
            if (field.type === 'roll20image' && !Utils.isRoll20FileUrl(value)) {
                return { ok false, title 'Invalid URL', message 'Only images uploaded to Roll20 are supported here. Use a URL that starts with httpsfiles.d20.ioimages.' };
            }
            const normalized = this.normalizeValue(field, value);
            if (this.isTemporaryKey(safeKey)) {
                TEMP_RUNTIME_CONFIG[safeKey] = normalized;
            } else {
                const config = this.persistedSettings();
                config[safeKey] = normalized;
                if (safeKey === 'REVEAL_TOKEN_NAMES_IN_LOG') config.HIDE_TOKEN_NAMES_IN_LOG = !Utils.toBoolean(config[safeKey], true);
                if (safeKey === 'HIDE_TOKEN_NAMES_IN_LOG') config.REVEAL_TOKEN_NAMES_IN_LOG = !Utils.toBoolean(config[safeKey], false);
            }
            return { ok true, key safeKey, value normalized, field };
        },

        toggle(key) {
            const safeKey = this.normalizeKey(key);
            const field = this.getField(safeKey);
            if (!field) return { ok false, message 'Unknown setting ' + key + '.' };
            if (field.advancedOnly && !ADVANCED_MODE) return { ok false, message 'Enable advanced mode first with !ca advancemode yes.' };
            if (field.type !== 'boolean') return { ok false, message 'Setting is not toggleable ' + key + '.' };
            return this.set(safeKey, !Utils.toBoolean(this.get(safeKey), false));
        },

        fields() {
            return RUNTIME_CONFIG_FIELDS.filter((field) = !field.advancedOnly  ADVANCED_MODE);
        },

        setAdvancedMode(enabled) {
            ADVANCED_MODE = !!enabled;
            if (!ADVANCED_MODE) {
                Object.keys(TEMP_RUNTIME_CONFIG_DEFAULTS).forEach((key) = {
                    TEMP_RUNTIME_CONFIG[key] = TEMP_RUNTIME_CONFIG_DEFAULTS[key];
                });
            }
            return ADVANCED_MODE;
        },

        resetDefaults() {
            const root = State.get();
            root.settings = Object.assign({}, RUNTIME_CONFIG_DEFAULTS);
            Object.keys(TEMP_RUNTIME_CONFIG_DEFAULTS).forEach((key) = {
                TEMP_RUNTIME_CONFIG[key] = TEMP_RUNTIME_CONFIG_DEFAULTS[key];
            });
            ADVANCED_MODE = false;
            return this.getAll();
        },

        isAdvancedMode() {
            return ADVANCED_MODE;
        }
    };

     -----------------------------------------------------------------------
      HTML helpers
      --------------------------------------------------------------------- 
    const Html = {
        tag(tagName, content, style) {
            if (content === undefined) content = '';
            if (style === undefined) style = '';
            const styleAttr = style  ' style=' + style + ''  '';
            return '' + tagName + styleAttr + '' + content + '' + tagName + '';
        },

        span(content, style) {
            return this.tag('span', content  '', style  '');
        },

        div(content, style) {
            return this.tag('div', content  '', style  '');
        },

        img(src, style) {
            return 'img src=' + Utils.attrSafe(src  '') + ' style=' + (style  '') + ' ';
        },

        tooltip(innerHtml, tipHtml) {
            const tip = String(tipHtml  '').trim();
            if (!tip) return innerHtml;
            return 'span class=showtip tipsy title=' + Utils.attrSafe(tip) + '' + innerHtml + 'span';
        },

        card(options) {
            options = options  {};
            const title = String(options.title  '');
            const body = String(options.body  '');
            const buildOptions = options.buildOptions  {};
            const width = Number(buildOptions.width)  CONFIG.DEFAULT_CARD_WIDTH;
            const leftOffset = Number(buildOptions.leftOffset)  CONFIG.DEFAULT_CARD_LEFT_OFFSET;
            const titleAlign = buildOptions.titleAlign  'center';
            const bodyAlign = buildOptions.bodyAlign  'center';
            const titleColor = buildOptions.titleColor  CONFIG.DEFAULT_CARD_TITLE_COLOR;
            const bodyColor = buildOptions.bodyColor  CONFIG.DEFAULT_CARD_BODY_COLOR;
            const borderColor = buildOptions.borderColor  CONFIG.DEFAULT_CARD_BORDER_COLOR;
            const titleBgColor = buildOptions.titleBgColor  CONFIG.DEFAULT_CARD_TITLE_BG_COLOR;
            const titleLineColor = buildOptions.titleLineColor  CONFIG.DEFAULT_CARD_TITLE_LINE_COLOR;
            const bodyBgColor = buildOptions.bodyBgColor  CONFIG.DEFAULT_CARD_BODY_BG_COLOR;
            const bgImageURLRaw = buildOptions.bgImageURL  RuntimeConfig.get('CHAT_BACKGROUND_IMAGE_URL')  CONFIG.DEFAULT_CARD_BODY_IMAGE_URL;
            const bgImageURL = Utils.isSafeImageUrl(bgImageURLRaw)  bgImageURLRaw  CONFIG.DEFAULT_CARD_BODY_IMAGE_URL;
            const bgOverlayStart = buildOptions.bgOverlayStart  'rgba(0, 0, 0, 0.8)';
            const bgOverlayEnd = buildOptions.bgOverlayEnd  'rgba(0, 0, 0, 0.8)';
            const bgSize = buildOptions.bgSize  'auto 100%';
            const bgAttachment = buildOptions.bgAttachment  'fixed';
            const bgPosition = buildOptions.bgPosition  'right 25px bottom 100px';
            const titleHtml = Utils.isNonEmptyString(buildOptions.titleHtml)
                 String(buildOptions.titleHtml)
                 Utils.escapeHtml(title);

            return (
                'div style=displayblock;widthcalc(100% + ' + Math.abs(leftOffset) + 'px);margin-left' + leftOffset + 'px;text-alignleft;box-sizingborder-box;' +
                    'div style=' +
                        'displayblock;' +
                        'width' + width + 'px;' +
                        'max-width100%;' +
                        'background-imagelinear-gradient(' + bgOverlayStart + ',' + bgOverlayEnd + '), url('' + Utils.attrSafe(bgImageURL) + '');' +
                        'background-size' + bgSize + ';' +
                        'background-position' + bgPosition + ';' +
                        'background-repeatno-repeat;' +
                        'background-attachment' + bgAttachment + ';' +
                        'border1px solid ' + borderColor + ';' +
                        'border-radius8px;' +
                        'overflowhidden;' +
                        'box-sizingborder-box;' +
                        'font-familyArial,Helvetica,sans-serif;' +
                    '' +
                        'div style=padding8px 12px;text-align' + titleAlign + ';font-weight700;font-size18px;color' + titleColor + ';background' + titleBgColor + ';' +
                            titleHtml +
                            'div style=height1px;background' + titleLineColor + ';margin6px -6px -8px -6px;div' +
                        'div' +
                        'div style=padding8px 10px 10px 10px;text-align' + bodyAlign + ';color' + bodyColor + ';background' + bodyBgColor + ';' + body + 'div' +
                    'div' +
                'div'
            );
        }
    };

     -----------------------------------------------------------------------
      Roll20 adapter
      --------------------------------------------------------------------- 
    const R20 = {
        send(message, callback) {
            if (Utils.isFunction(callback)) sendChat(CONFIG.CHAT_NAME, message, callback);
            else sendChat(CONFIG.CHAT_NAME, message);
        },

        direct(html) {
            this.send('direct ' + html);
        },

        whisper(target, html, callback) {
            const safeTarget = String(target  'GM').replace([rn]g, '').trim()  'GM';
            this.send('w ' + safeTarget + ' ' + html, callback);
        },

        hasSheetReader() {
            return typeof getSheetItem === 'function';
        },

        hasSheetWriter() {
            return typeof setSheetItem === 'function';
        },

        hasSheetApi() {
            return this.hasSheetWriter();
        },

        getRuntimeCapabilities() {
            return {
                sheetReader this.hasSheetReader(),
                sheetWriter this.hasSheetWriter()
            };
        },

        buttonAbilityCommand(characterId, abilityName) {
            const safeCharacterId = String(characterId  '').trim();
            const safeAbilityName = String(abilityName  '').trim();
            return safeCharacterId && safeAbilityName  ('~' + safeCharacterId + '' + safeAbilityName)  '';
        },

        chatAbilityCommand(characterId, abilityName) {
            const safeCharacterId = String(characterId  '').trim();
            const safeAbilityName = String(abilityName  '').trim();
            return safeCharacterId && safeAbilityName  ('%{' + safeCharacterId + '' + safeAbilityName + '}')  '';
        },

        sheetAttributeCommand(characterId, attributeName, htmlEncoded) {
            const safeCharacterId = String(characterId  '').trim();
            const safeAttributeName = String(attributeName  '').trim();
            if (!safeCharacterId  !safeAttributeName) return '';
            return (htmlEncoded  '&#64;'  '@') + '{' + safeCharacterId + '' + safeAttributeName + '}';
        },

        getSelectedTokens(msg) {
            const selected = Array.isArray(msg && msg.selected)  msg.selected  [];
            const seen = Object.create(null);
            const tokens = [];
            for (let i = 0; i  selected.length; i += 1) {
                const id = String(selected[i] && selected[i]._id  '').trim();
                if (!id  seen[id]) continue;
                seen[id] = true;
                const token = getObj('graphic', id);
                if (token) tokens.push(token);
            }
            return tokens;
        },

        getTokenById(tokenId) {
            const id = String(tokenId  '').trim();
            return id  getObj('graphic', id)  null;
        },

        getCharacterFromToken(token) {
            if (!token  !Utils.isFunction(token.get)) return null;
            const charId = String(token.get('represents')  '').trim();
            return charId  getObj('character', charId)  null;
        },

        getCharacterByName(characterName) {
            const safeName = Utils.stripWrappingQuotes(characterName).toLowerCase();
            if (!safeName) return null;
            const characters = findObjs({ _type 'character' })  [];
            for (let i = 0; i  characters.length; i += 1) {
                const current = String(characters[i].get('name')  '').trim().toLowerCase();
                if (current === safeName) return characters[i];
            }
            return null;
        },

        cleanupBatchAbilities(maxKeep, maxAgeMs, options) {
            const opts = options  {};
            const helper = opts.noCreate  this.getExistingBatchHelper()  this.getOrCreateBatchHelper();
            if (!helper) return;
            const helperId = String(helper.id  '').trim();
            if (!helperId) return;
            const keep = Math.max(1, Utils.toInt(maxKeep, 20));
            const ageLimit = Math.max(60000, Utils.toInt(maxAgeMs, 10  60  1000));
            const now = Date.now();
            const abilities = (findObjs({ _type 'ability', _characterid helperId })  [])
                .filter((ability) = ability && Utils.isFunction(ability.get) && Utils.isFunction(ability.remove) && ^CT_Batch_i.test(String(ability.get('name')  '')))
                .map((ability) = {
                    const name = String(ability.get('name')  '');
                    const stamp = name.match(_([0-9a-z]+)$i);
                    const createdAt = stamp  parseInt(stamp[1], 36)  0;
                    return { ability, name, createdAt Number.isFinite(createdAt)  createdAt  0 };
                })
                .sort((a, b) = b.createdAt - a.createdAt);
            abilities.forEach((entry, index) = {
                if (opts.removeAll  index = keep  !entry.createdAt  now - entry.createdAt  ageLimit) {
                    try {
                        entry.ability.remove();
                    } catch (error) {
                        Logger.debug('[batch-cleanup]', error && error.message  error.message  String(error));
                    }
                }
            });
            if (opts.removeWhenEmpty) {
                const remainingAbilities = findObjs({ _type 'ability', _characterid helperId })  [];
                if (!remainingAbilities.length && Utils.isFunction(helper.remove)) {
                    try {
                        helper.remove();
                        State.get().helperCharacterId = '';
                    } catch (error) {
                        Logger.debug('[batch-cleanuphelper]', error && error.message  error.message  String(error));
                    }
                }
            }
        },

        getExistingBatchHelper() {
            const root = State.get();
            const storedId = String(root.helperCharacterId  '').trim();
            let existing = storedId  getObj('character', storedId)  null;
            if (!existing) {
                const named = this.getCharacterByName('Combat Assistant Helper');
                if (named) {
                    const namedId = String(named.id  '').trim();
                    const hasOwnedAbilities = namedId && (findObjs({ _type 'ability', _characterid namedId })  [])
                        .some((ability) = ability && Utils.isFunction(ability.get) && ^CT_Batch_i.test(String(ability.get('name')  '')));
                    const namedNotes = Utils.isFunction(named.get)  String(named.get('gmnotes')  '')  '';
                    if (hasOwnedAbilities  namedNotes.indexOf('Managed by Combat Assistant') = 0) existing = named;
                }
            }
            return existing  null;
        },

        getOrCreateBatchHelper() {
            const root = State.get();
            const storedId = String(root.helperCharacterId  '').trim();
            let existing = storedId  getObj('character', storedId)  null;
            if (!existing) {
                const named = this.getCharacterByName('Combat Assistant Helper');
                if (named) {
                    const namedId = String(named.id  '').trim();
                    const hasOwnedAbilities = namedId && (findObjs({ _type 'ability', _characterid namedId })  [])
                        .some((ability) = ability && Utils.isFunction(ability.get) && ^CT_Batch_i.test(String(ability.get('name')  '')));
                    const namedNotes = Utils.isFunction(named.get)  String(named.get('gmnotes')  '')  '';
                    if (hasOwnedAbilities  namedNotes.indexOf('Managed by Combat Assistant') = 0) existing = named;
                }
            }
            if (!existing && typeof createObj === 'function') {
                try {
                    existing = createObj('character', {
                        name 'Combat Assistant Helper',
                        archived false,
                        inplayerjournals '',
                        controlledby 'all',
                        gmnotes 'Managed by Combat Assistant. Do not rename or delete while the script is active.'
                    });
                } catch (error) {
                    Logger.error('[batch-helper]', error && error.message  error.message  String(error));
                    return null;
                }
            }
            if (!existing) return null;
            root.helperCharacterId = String(existing.id  '').trim();
            try {
                if (Utils.isFunction(existing.set)) {
                    existing.set({
                        archived false,
                        inplayerjournals '',
                        controlledby 'all',
                        gmnotes 'Managed by Combat Assistant. Temporary Roll All helper; safe to ignore.'
                    });
                }
            } catch (error) {
                Logger.debug('[batch-helper-access]', error && error.message  error.message  String(error));
            }
            return existing;
        },

        createNativeRollBatchAbility(commands) {
            const safeCommands = Array.isArray(commands)
                 commands.map((command) = String(command  '').trim()).filter(Boolean)
                 [];
            if (!safeCommands.length) return { ok false, message 'No Roll20 commands were available for the batch.' };
            const helper = this.getOrCreateBatchHelper();
            if (!helper) return { ok false, message 'Combat Assistant Helper character could not be created.' };
            const helperId = String(helper.id  '').trim();
            if (!helperId  typeof createObj !== 'function') return { ok false, message 'Combat Assistant Helper is not usable.' };
            this.cleanupBatchAbilities(250, 10  60  1000);
            const abilityName = 'CT_Batch_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36);
            const cleanupCommand = '!combatAssistant cleanupbatch ' + helperId + ' ' + abilityName;
            try {
                createObj('ability', {
                    _characterid helperId,
                    name abilityName,
                    action safeCommands.concat([cleanupCommand]).join('n'),
                    istokenaction false
                });
                return {
                    ok true,
                    command this.buttonAbilityCommand(helperId, abilityName),
                    abilityName,
                    count safeCommands.length
                };
            } catch (error) {
                Logger.error('[batch-ability]', error && error.message  error.message  String(error));
                return { ok false, message 'Roll20 batch ability could not be created.' };
            }
        },

        cleanupBatchHelperAfterUse(helperId, abilityName) {
            const safeHelperId = String(helperId  '').trim();
            const safeAbilityName = String(abilityName  '').trim();
            if (!safeHelperId  !^CT_Batch_i.test(safeAbilityName)) return false;
            const root = State.get();
            if (String(root.helperCharacterId  '').trim() !== safeHelperId) return false;
            const helper = getObj('character', safeHelperId);
            if (!helper  !Utils.isFunction(helper.get)) return false;
            const helperName = String(helper.get('name')  '').trim();
            const helperNotes = String(helper.get('gmnotes')  '').trim();
            if (helperName !== 'Combat Assistant Helper' && helperNotes.indexOf('Managed by Combat Assistant')  0) return false;
            const abilities = findObjs({ _type 'ability', _characterid safeHelperId })  [];
            abilities.forEach((ability) = {
                if (!ability  !Utils.isFunction(ability.get)  !Utils.isFunction(ability.remove)) return;
                if (String(ability.get('name')  '').trim() !== safeAbilityName) return;
                try {
                    ability.remove();
                } catch (error) {
                    Logger.debug('[batch-helper-cleanupability]', error && error.message  error.message  String(error));
                }
            });
            const remainingAbilities = findObjs({ _type 'ability', _characterid safeHelperId })  [];
            const remaining = remainingAbilities
                .some((ability) = ability && Utils.isFunction(ability.get) && ^CT_Batch_i.test(String(ability.get('name')  '')));
            if (!remaining && !remainingAbilities.length && Utils.isFunction(helper.remove)) {
                try {
                    helper.remove();
                    root.helperCharacterId = '';
                } catch (error) {
                    Logger.debug('[batch-helper-cleanupcharacter]', error && error.message  error.message  String(error));
                }
            }
            return true;
        },

        createNativeRollButtonCommand(command) {
            const batch = this.createNativeRollBatchAbility([command]);
            return batch && batch.ok  batch.command  '';
        },

        nativeBatchExecutionCommand(roll) {
            const directCommand = String(roll && roll.directCommand  '').trim();
            if (directCommand) return directCommand;
            const nativeCommand = String(roll && roll.nativeCommand  '').trim();
            if (nativeCommand) return nativeCommand;
            const batchCommand = String(roll && roll.batchCommand  '').trim();
            if (batchCommand) return batchCommand;
            return String(roll && roll.command  '').trim();
        },

        sendNativeCommandsSequentially(commands, delayMs) {
            const safeCommands = Array.isArray(commands)
                 commands.map((command) = String(command  '').trim()).filter(Boolean)
                 [];
            const delay = Math.max(100, Utils.toInt(delayMs, 700));
            safeCommands.forEach((command, index) = {
                setTimeout(() = {
                    try {
                        sendChat(CONFIG.CHAT_NAME, command);
                    } catch (error) {
                        Logger.error('[native-rollauto]', error && error.message  error.message  String(error));
                    }
                }, index  delay);
            });
            return safeCommands.length;
        },

        getTokensByCharacterName(characterName) {
            const character = this.getCharacterByName(characterName);
            if (!character) return [];
            const characterId = String(character.id  '').trim();
            return this.getTokensByCharacterId(characterId);
        },

        getTokensByCharacterId(characterId) {
            const safeCharacterId = String(characterId  '').trim();
            if (!safeCharacterId) return [];
            return (findObjs({ _type 'graphic', represents safeCharacterId })  []).filter((token) = token && Utils.isFunction(token.get));
        },

        getTokenLayer(token) {
            return token && Utils.isFunction(token.get)  String(token.get('layer')  '').trim().toLowerCase()  '';
        },

        getTokenPageId(tokenOrId) {
            const token = typeof tokenOrId === 'string'  this.getTokenById(tokenOrId)  tokenOrId;
            return token && Utils.isFunction(token.get)  String(token.get('_pageid')  token.get('pageid')  '').trim()  '';
        },

        getTokensOnPage(pageId) {
            const safePageId = String(pageId  '').trim();
            if (!safePageId) return [];
            return (findObjs({ _type 'graphic', _pageid safePageId })  []).filter((token) = {
                if (!token  !Utils.isFunction(token.get)) return false;
                const layer = this.getTokenLayer(token);
                if (layer && layer !== 'objects') return false;
                const gmnotes = String(token.get('gmnotes')  '');
                const name = String(token.get('name')  '').trim();
                if (^Combat Assistant area markerbi.test(gmnotes)  ^CA Areabi.test(name)) return false;
                return !!String(token.get('represents')  name).trim();
            });
        },

        getPageGeometry(pageId) {
            const page = pageId  getObj('page', pageId)  null;
            const scaleFeet = page && Utils.isFunction(page.get)  Utils.toNumber(page.get('scale_number'), 5)  5;
            const snappingIncrement = page && Utils.isFunction(page.get)  Utils.toNumber(page.get('snapping_increment'), 1)  1;
            return {
                scaleFeet scaleFeet  0  scaleFeet  5,
                snappingIncrement snappingIncrement  0  snappingIncrement  1,
                pixelsPerUnit 70  (snappingIncrement  0  snappingIncrement  1)
            };
        },

        getPageScaleFeet(pageId) {
            return this.getPageGeometry(pageId).scaleFeet;
        },

        pixelsToPageFeet(pageId, pixels) {
            const geometry = this.getPageGeometry(pageId);
            return (Math.max(0, Utils.toNumber(pixels, 0))  geometry.pixelsPerUnit)  geometry.scaleFeet;
        },

        pageFeetToPixels(pageId, feet) {
            const geometry = this.getPageGeometry(pageId);
            return (Math.max(0, Utils.toNumber(feet, 0))  geometry.scaleFeet)  geometry.pixelsPerUnit;
        },

        getTokenRect(token) {
            if (!token  !Utils.isFunction(token.get)) return null;
            const width = Math.max(1, Utils.toNumber(token.get('width'), 70));
            const height = Math.max(1, Utils.toNumber(token.get('height'), 70));
            const left = Utils.toNumber(token.get('left'), 0);
            const top = Utils.toNumber(token.get('top'), 0);
            return {
                left,
                top,
                width,
                height,
                minX left - (width  2),
                maxX left + (width  2),
                minY top - (height  2),
                maxY top + (height  2)
            };
        },

        getTokenRotationDegrees(token) {
            if (!token  !Utils.isFunction(token.get)) return 0;
            const rotation = Utils.toNumber(token.get('rotation'), 0);
            const normalized = rotation % 360;
            return normalized  0  normalized + 360  normalized;
        },

        rotatePoint(point, origin, degrees) {
            const radians = (Utils.toNumber(degrees, 0)  Math.PI)  180;
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);
            const dx = Utils.toNumber(point && point.x, 0) - Utils.toNumber(origin && origin.x, 0);
            const dy = Utils.toNumber(point && point.y, 0) - Utils.toNumber(origin && origin.y, 0);
            return {
                x Utils.toNumber(origin && origin.x, 0) + ((dx  cos) - (dy  sin)),
                y Utils.toNumber(origin && origin.y, 0) + ((dx  sin) + (dy  cos))
            };
        },

        getRotatedRectPolygon(rect, rotationDegrees) {
            if (!rect) return [];
            const center = { x rect.left, y rect.top };
            const halfWidth = Math.max(0.5, Utils.toNumber(rect.width, 1)  2);
            const halfHeight = Math.max(0.5, Utils.toNumber(rect.height, 1)  2);
            return [
                { x center.x - halfWidth, y center.y - halfHeight },
                { x center.x + halfWidth, y center.y - halfHeight },
                { x center.x + halfWidth, y center.y + halfHeight },
                { x center.x - halfWidth, y center.y + halfHeight }
            ].map((point) = this.rotatePoint(point, center, rotationDegrees));
        },

        getInsetRect(rect, insetPx) {
            if (!rect) return null;
            const inset = Math.max(0, Utils.toNumber(insetPx, 0));
            const width = Math.max(1, Utils.toNumber(rect.width, 1) - (inset  2));
            const height = Math.max(1, Utils.toNumber(rect.height, 1) - (inset  2));
            return {
                left rect.left,
                top rect.top,
                width,
                height,
                minX rect.left - (width  2),
                maxX rect.left + (width  2),
                minY rect.top - (height  2),
                maxY rect.top + (height  2)
            };
        },

        projectPolygon(points, axis) {
            let min = Infinity;
            let max = -Infinity;
            points.forEach((point) = {
                const projection = (point.x  axis.x) + (point.y  axis.y);
                if (projection  min) min = projection;
                if (projection  max) max = projection;
            });
            return { min, max };
        },

        polygonsOverlap(polyA, polyB, minimumOverlapPx) {
            if (!Array.isArray(polyA)  !Array.isArray(polyB)  polyA.length  3  polyB.length  3) return false;
            const requiredOverlap = Math.max(0, Utils.toNumber(minimumOverlapPx, 0));
            const axes = [];
            const addAxes = (poly) = {
                for (let i = 0; i  poly.length; i += 1) {
                    const current = poly[i];
                    const next = poly[(i + 1) % poly.length];
                    const edgeX = next.x - current.x;
                    const edgeY = next.y - current.y;
                    const length = Math.sqrt((edgeX  edgeX) + (edgeY  edgeY));
                    if (length  0) axes.push({ x -edgeY  length, y edgeX  length });
                }
            };
            addAxes(polyA);
            addAxes(polyB);
            for (let i = 0; i  axes.length; i += 1) {
                const a = this.projectPolygon(polyA, axes[i]);
                const b = this.projectPolygon(polyB, axes[i]);
                const overlap = Math.min(a.max, b.max) - Math.max(a.min, b.min);
                if (overlap = requiredOverlap) return false;
            }
            return true;
        },

        tokenIntersectsRotatedMarker(token, marker, boundaryInsetPx) {
            const tokenRect = this.getTokenRect(token);
            const markerRect = this.getInsetRect(this.getTokenRect(marker), boundaryInsetPx);
            if (!tokenRect  !markerRect) return false;
            const tokenPoly = this.getRotatedRectPolygon(tokenRect, this.getTokenRotationDegrees(token));
            const markerPoly = this.getRotatedRectPolygon(markerRect, this.getTokenRotationDegrees(marker));
            return this.polygonsOverlap(tokenPoly, markerPoly, boundaryInsetPx);
        },

        clampPointToDistance(point, origin, maxDistancePx) {
            const safePoint = { x Utils.toNumber(point && point.x, 0), y Utils.toNumber(point && point.y, 0) };
            const safeOrigin = { x Utils.toNumber(origin && origin.x, 0), y Utils.toNumber(origin && origin.y, 0) };
            const maxDistance = Math.max(0, Utils.toNumber(maxDistancePx, 0));
            const dx = safePoint.x - safeOrigin.x;
            const dy = safePoint.y - safeOrigin.y;
            const distance = Math.sqrt((dx  dx) + (dy  dy));
            if (distance = maxDistance  distance = 0) return safePoint;
            const scale = maxDistance  distance;
            return {
                x safeOrigin.x + (dx  scale),
                y safeOrigin.y + (dy  scale)
            };
        },

        measureTokenDistanceFeet(sourceToken, targetToken) {
            if (!sourceToken  !targetToken) return { ok false, message 'Source or target token was not found.' };
            const sourcePageId = this.getTokenPageId(sourceToken);
            const targetPageId = this.getTokenPageId(targetToken);
            if (!sourcePageId  !targetPageId  sourcePageId !== targetPageId) {
                return { ok false, message 'Source and target tokens must be on the same page.' };
            }
            const geometry = this.getPageGeometry(sourcePageId);
            const feetPerCell = geometry.scaleFeet;
            const pxPerCell = geometry.pixelsPerUnit;
            const sx = Utils.toNumber(sourceToken.get('left'), 0);
            const sy = Utils.toNumber(sourceToken.get('top'), 0);
            const tx = Utils.toNumber(targetToken.get('left'), 0);
            const ty = Utils.toNumber(targetToken.get('top'), 0);
            const sourceWidthCells = Math.max(1, Math.round(Math.max(1, Utils.toNumber(sourceToken.get('width'), 70))  pxPerCell));
            const sourceHeightCells = Math.max(1, Math.round(Math.max(1, Utils.toNumber(sourceToken.get('height'), 70))  pxPerCell));
            const targetWidthCells = Math.max(1, Math.round(Math.max(1, Utils.toNumber(targetToken.get('width'), 70))  pxPerCell));
            const targetHeightCells = Math.max(1, Math.round(Math.max(1, Utils.toNumber(targetToken.get('height'), 70))  pxPerCell));
            const centerDxCells = Math.abs(sx - tx)  pxPerCell;
            const centerDyCells = Math.abs(sy - ty)  pxPerCell;
            const occupiedDxCells = Math.max(0, centerDxCells - ((sourceWidthCells - 1)  2) - ((targetWidthCells - 1)  2));
            const occupiedDyCells = Math.max(0, centerDyCells - ((sourceHeightCells - 1)  2) - ((targetHeightCells - 1)  2));
            const distanceCells = Math.ceil(Math.max(occupiedDxCells, occupiedDyCells));
            const feet = distanceCells  feetPerCell;
            return { ok true, feet, pixels distanceCells  pxPerCell, sourcePageId };
        },

        measureTokenCenterDistanceFeet(sourceToken, targetToken) {
            if (!sourceToken  !targetToken) return { ok false, message 'Source or target token was not found.' };
            const sourcePageId = this.getTokenPageId(sourceToken);
            const targetPageId = this.getTokenPageId(targetToken);
            if (!sourcePageId  !targetPageId  sourcePageId !== targetPageId) {
                return { ok false, message 'Source and target tokens must be on the same page.' };
            }
            const source = this.getTokenRect(sourceToken);
            const target = this.getTokenRect(targetToken);
            if (!source  !target) return { ok false, message 'Token geometry could not be read.' };
            const dx = target.left - source.left;
            const dy = target.top - source.top;
            const pixels = Math.sqrt((dx  dx) + (dy  dy));
            const feet = this.pixelsToPageFeet(sourcePageId, pixels);
            return { ok true, feet, pixels, sourcePageId };
        },

        measureTokenCenterToTargetEdgeFeet(sourceToken, targetToken) {
            if (!sourceToken  !targetToken) return { ok false, message 'Source or target token was not found.' };
            const sourcePageId = this.getTokenPageId(sourceToken);
            const targetPageId = this.getTokenPageId(targetToken);
            if (!sourcePageId  !targetPageId  sourcePageId !== targetPageId) {
                return { ok false, message 'Source and target tokens must be on the same page.' };
            }
            const source = this.getTokenRect(sourceToken);
            const target = this.getTokenRect(targetToken);
            if (!source  !target) return { ok false, message 'Token geometry could not be read.' };
            const dx = Math.max(0, Math.max(target.minX - source.left, source.left - target.maxX));
            const dy = Math.max(0, Math.max(target.minY - source.top, source.top - target.maxY));
            const pixels = Math.sqrt((dx  dx) + (dy  dy));
            const feet = this.pixelsToPageFeet(sourcePageId, pixels);
            return { ok true, feet, pixels, sourcePageId };
        },

        getTokensWithinFeet(sourceToken, rangeFeet) {
            const sourceId = this.getTokenId(sourceToken);
            const pageId = this.getTokenPageId(sourceToken);
            const maxFeet = Math.max(0, Utils.toNumber(rangeFeet, 0));
            if (!sourceId  !pageId  maxFeet = 0) return [];
            return this.getTokensOnPage(pageId).filter((token) = {
                if (!token  this.getTokenId(token) === sourceId) return false;
                const measured = this.measureTokenCenterToTargetEdgeFeet(sourceToken, token);
                return measured.ok && measured.feet = Math.max(0, maxFeet - 0.1);
            });
        },

        isSquareAreaShape(shape) {
            const normalized = String(shape  '').trim().toLowerCase();
            return normalized === 'cube'  normalized === 'square';
        },

        isConeAreaShape(shape) {
            return String(shape  '').trim().toLowerCase() === 'cone';
        },

        isLineAreaShape(shape) {
            return String(shape  '').trim().toLowerCase() === 'line';
        },

        getAreaMarkerImageUrl(areaInfo) {
            const shape = areaInfo && areaInfo.shape  String(areaInfo.shape)  '';
            const key = this.isSquareAreaShape(shape)  this.isConeAreaShape(shape)  this.isLineAreaShape(shape)  'PLAYER_MARKER_SQUARE_URL'  'PLAYER_MARKER_RADIUS_URL';
            const url = String(RuntimeConfig.get(key)  '').trim();
            return Utils.isSafeImageUrl(url) && url  url  '';
        },

        getAreaMarkerSizePixels(areaInfo, pageId) {
            const sizeFeet = Math.max(0, Utils.toNumber(areaInfo && areaInfo.sizeFeet, 0));
            if (sizeFeet = 0) return 0;
            const shape = String(areaInfo && areaInfo.shape  '').trim().toLowerCase();
            const markerFeet = shape === 'cube'
                 (sizeFeet  2)
                 (this.isSquareAreaShape(shape)  sizeFeet  (sizeFeet  2));
            return Math.max(1, Math.round(this.pageFeetToPixels(pageId, markerFeet)));
        },

        getConeRowWidths(sizeFeet) {
            const normalizedSize = Math.max(5, Math.round(Math.max(0, Utils.toNumber(sizeFeet, 0))  5)  5);
            const exact = {
                15 [1, 3, 3],
                30 [1, 3, 3, 3, 5, 5],
                45 [1, 3, 3, 3, 5, 5, 5, 7],
                60 [1, 3, 3, 3, 5, 5, 5, 7, 7, 7, 9, 9]
            };
            if (exact[normalizedSize]) return exact[normalizedSize].slice();
            const rows = Math.max(1, Math.ceil(normalizedSize  5));
            const widths = [];
            for (let row = 0; row  rows; row += 1) {
                widths.push(row === 0  1  (3 + (Math.floor((row - 1)  3)  2)));
            }
            return widths;
        },

        getConeMarkerPieces(areaInfo, pageId) {
            const sizeFeet = Math.max(0, Utils.toNumber(areaInfo && areaInfo.sizeFeet, 0));
            const rowPx = Math.max(1, this.pageFeetToPixels(pageId, 5));
            return this.getConeRowWidths(sizeFeet).map((widthCells, row) = ({
                index row,
                widthCells,
                offsetX 0,
                offsetY (row + 1)  rowPx,
                width widthCells  rowPx,
                height rowPx,
                rotationOffset 0
            }));
        },

        applyAreaMarkerLighting(marker, lightInfo) {
            if (!marker  !Utils.isFunction(marker.set)) return false;
            const info = lightInfo && lightInfo.hasLight  lightInfo  null;
            if (!info) return false;
            const bright = Math.max(0, Utils.toNumber(info.brightFeet, 0));
            const dim = Math.max(0, Utils.toNumber(info.dimFeet, 0));
            if (bright = 0 && dim = 0) return false;
            const legacyRadius = bright + dim;
            try {
                marker.set({
                    emits_bright_light bright  0,
                    bright_light_distance bright,
                    emits_low_light dim  0,
                    low_light_distance legacyRadius  0  legacyRadius  dim,
                    light_radius legacyRadius  0  legacyRadius  '',
                    light_dimradius bright  0  bright  '',
                    light_otherplayers true
                });
                return true;
            } catch (ignored) {
                return false;
            }
        },

        applyAreaMarkerVisuals(marker, tooltip, opacity, lightInfo) {
            if (!marker  !Utils.isFunction(marker.set)) return false;
            try {
                marker.set({
                    show_tooltip true,
                    gm_only_tooltip false,
                    tooltip
                });
                marker.set({
                    opacity,
                    baseOpacity opacity,
                    fadeOpacity opacity,
                    alpha opacity
                });
            } catch (ignored) {}
            this.applyAreaMarkerLighting(marker, lightInfo);
            setTimeout(() = {
                try {
                    marker.set({
                        opacity,
                        baseOpacity opacity,
                        fadeOpacity opacity,
                        alpha opacity
                    });
                } catch (ignored) {}
                this.applyAreaMarkerLighting(marker, lightInfo);
            }, 250);
            return true;
        },

        sendAreaMarkerToBack(marker) {
            if (!marker) return false;
            const moveToBack = () = {
                try {
                    if (typeof toBack === 'function') {
                        toBack(marker);
                        return true;
                    }
                } catch (ignored) {}
                return false;
            };
            moveToBack();
            setTimeout(moveToBack, 100);
            return true;
        },

        createAreaMarkerGraphic(options) {
            const data = options  {};
            const marker = createObj('graphic', {
                _pageid data.pageId,
                layer 'objects',
                imgsrc data.imgsrc,
                name data.name,
                left Utils.toNumber(data.left, 0),
                top Utils.toNumber(data.top, 0),
                width Math.max(1, Utils.toNumber(data.width, 1)),
                height Math.max(1, Utils.toNumber(data.height, 1)),
                rotation Utils.toNumber(data.rotation, 0),
                controlledby data.controlledBy  '',
                showname false,
                showplayers_name false,
                represents '',
                isdrawing RuntimeConfig.get('AREA_MARKER_FREE_MOVEMENT'),
                disableTokenMenu true,
                gmnotes data.gmnotes  ''
            });
            this.sendAreaMarkerToBack(marker);
            return marker;
        },

        createConePlayerAreaMarker(request, sourceToken, markerBase) {
            const payload = request && request.payload  request.payload  {};
            const areaInfo = payload.areaInfo && payload.areaInfo.isArea  payload.areaInfo  null;
            const pieces = this.getConeMarkerPieces(areaInfo, markerBase.pageId);
            if (!pieces.length) return { ok false, message 'Cone marker size could not be calculated.' };
            const center = {
                x Utils.toNumber(sourceToken.get('left'), 0),
                y Utils.toNumber(sourceToken.get('top'), 0)
            };
            const created = [];
            try {
                pieces.forEach((piece) = {
                    const name = markerBase.name + ' Cone ' + String(piece.index + 1);
                    const marker = this.createAreaMarkerGraphic({
                        pageId markerBase.pageId,
                        imgsrc markerBase.imgsrc,
                        name,
                        left center.x + piece.offsetX,
                        top center.y + piece.offsetY,
                        width piece.width,
                        height piece.height,
                        rotation 0,
                        controlledBy markerBase.controlledBy,
                        gmnotes 'Combat Assistant area marker for ' + String(request.id  '') + ' cone piece ' + String(piece.index + 1)
                    });
                    if (!marker) throw new Error('Cone marker piece could not be created.');
                    this.applyAreaMarkerVisuals(marker, markerBase.tooltip, markerBase.opacity, markerBase.lightInfo);
                    const id = this.getTokenId(marker);
                    created.push(Object.assign({}, piece, {
                        id,
                        name,
                        pageId markerBase.pageId
                    }));
                });
                return {
                    ok true,
                    marker this.getTokenById(created[0] && created[0].id),
                    markerId created[0] && created[0].id,
                    markerIds created.map((piece) = piece.id).filter(Boolean),
                    markerName markerBase.name,
                    markerGroup {
                        type 'cone',
                        centerLeft center.x,
                        centerTop center.y,
                        rotation 0,
                        pieces created
                    }
                };
            } catch (error) {
                created.forEach((piece) = this.removeGraphic(this.getTokenById(piece.id)));
                return { ok false, message error && error.message  error.message  String(error) };
            }
        },

        createLinePlayerAreaMarker(request, sourceToken, markerBase) {
            const payload = request && request.payload  request.payload  {};
            const areaInfo = payload.areaInfo && payload.areaInfo.isArea  payload.areaInfo  null;
            const lengthFeet = Math.max(0, Utils.toNumber(areaInfo && (areaInfo.lengthFeet  areaInfo.sizeFeet), 0));
            const widthFeet = Math.max(1, Utils.toNumber(areaInfo && areaInfo.widthFeet, 5));
            const lengthPx = Math.max(1, this.pageFeetToPixels(markerBase.pageId, lengthFeet));
            const widthPx = Math.max(1, this.pageFeetToPixels(markerBase.pageId, widthFeet));
            if (lengthFeet = 0) return { ok false, message 'Line marker length could not be calculated.' };
            const sourceRect = this.getTokenRect(sourceToken);
            if (!sourceRect) return { ok false, message 'Caster token geometry could not be read.' };
            const marker = this.createAreaMarkerGraphic({
                pageId markerBase.pageId,
                imgsrc markerBase.imgsrc,
                name markerBase.name + ' Line',
                left sourceRect.left,
                top sourceRect.top + (lengthPx  2),
                width widthPx,
                height lengthPx,
                rotation 0,
                controlledBy markerBase.controlledBy,
                gmnotes 'Combat Assistant area marker for ' + String(request.id  '') + ' line'
            });
            if (!marker) return { ok false, message 'Line marker token could not be created.' };
            this.applyAreaMarkerVisuals(marker, markerBase.tooltip, markerBase.opacity, markerBase.lightInfo);
            const markerId = this.getTokenId(marker);
            return {
                ok true,
                marker,
                markerId,
                markerIds [markerId],
                markerName markerBase.name,
                markerGroup {
                    type 'line',
                    lengthFeet,
                    widthFeet,
                    pieces [{ id markerId, index 0, width widthPx, height lengthPx }]
                }
            };
        },

        createStandardPlayerAreaMarker(request, sourceToken, markerBase) {
            const payload = request && request.payload  request.payload  {};
            const areaInfo = payload.areaInfo && payload.areaInfo.isArea  payload.areaInfo  null;
            const sizePx = this.getAreaMarkerSizePixels(areaInfo, markerBase.pageId);
            if (sizePx = 0) return { ok false, message 'Area marker size could not be calculated.' };
            const marker = this.createAreaMarkerGraphic({
                pageId markerBase.pageId,
                imgsrc markerBase.imgsrc,
                name markerBase.name,
                left Utils.toNumber(sourceToken.get('left'), 0),
                top Utils.toNumber(sourceToken.get('top'), 0),
                width sizePx,
                height sizePx,
                rotation 0,
                controlledBy markerBase.controlledBy,
                gmnotes 'Combat Assistant area marker for ' + String(request.id  '')
            });
            if (!marker) return { ok false, message 'Area marker token could not be created.' };
            this.applyAreaMarkerVisuals(marker, markerBase.tooltip, markerBase.opacity, markerBase.lightInfo);
            const markerId = this.getTokenId(marker);
            return { ok true, marker, markerId, markerIds [markerId], markerName markerBase.name };
        },

        getAreaMarkerName(actionId, sourceName) {
            const id = String(actionId  '').trim();
            const caster = Utils.normalizeName(sourceName  'caster').replace(s+g, '-').slice(0, 32)  'caster';
            return 'CA Area ' + caster + ' ' + id;
        },

        createPlayerAreaMarker(request, sourceToken, playerId) {
            const payload = request && request.payload  request.payload  {};
            const areaInfo = payload.areaInfo && payload.areaInfo.isArea  payload.areaInfo  null;
            if (!areaInfo) return { ok false, message 'Area information was not found.' };
            if (!sourceToken  !Utils.isFunction(sourceToken.get)) return { ok false, message 'Caster token was not found.' };
            if (typeof createObj !== 'function') return { ok false, message 'Roll20 createObj is not available.' };
            const imgsrc = this.getAreaMarkerImageUrl(areaInfo);
            if (!imgsrc) return { ok false, message 'Area marker image URL is not configured.' };
            const pageId = this.getTokenPageId(sourceToken);
            if (!pageId) return { ok false, message 'Caster token page was not found.' };
            const sourceTokenId = this.getTokenId(sourceToken);
            const sourceCharacter = this.getCharacterFromToken(sourceToken);
            const sourceCharacterId = sourceCharacter  String(sourceCharacter.id  sourceToken.get('represents')  '').trim()  String(sourceToken.get('represents')  '').trim();
            payload.casterTokenId = sourceTokenId;
            payload.casterCharacterId = sourceCharacterId;
            payload.casterPageId = pageId;
            if (request) {
                request.sourceTokenId = sourceTokenId;
                request.sourceCharacterId = sourceCharacterId;
                request.sourcePageId = pageId;
            }
            const opacity = Utils.clamp(Utils.toInt(RuntimeConfig.get('PLAYER_MARKER_OPACITY'), 60), 0, 100)  100;
            const controlledBy = this.getTokenControllerIds(sourceToken, sourceCharacter, playerId).join(',');
            const name = this.getAreaMarkerName(request.id, payload.sourceName  request.characterName  'caster');
            const tooltip = this.playerAreaMarkerTooltip(request, payload, areaInfo);
            const markerBase = { pageId, imgsrc, controlledBy, name, tooltip, opacity, lightInfo payload.lightInfo  null };
            if (this.isConeAreaShape(areaInfo.shape)) return this.createConePlayerAreaMarker(request, sourceToken, markerBase);
            if (this.isLineAreaShape(areaInfo.shape)) return this.createLinePlayerAreaMarker(request, sourceToken, markerBase);
            return this.createStandardPlayerAreaMarker(request, sourceToken, markerBase);
        },

        getAreaInfoOptions(areaInfo) {
            const primary = areaInfo && areaInfo.isArea  areaInfo  null;
            const options = primary && Array.isArray(primary.options)  primary.options  [];
            const list = options.length  options  (primary  [primary]  []);
            const seen = Object.create(null);
            return list.filter((entry) = {
                if (!entry  !entry.isArea) return false;
                const key = [
                    String(entry.shape  '').trim().toLowerCase(),
                    Utils.toNumber(entry.sizeFeet, 0),
                    Utils.toNumber(entry.widthFeet, 0)
                ].join('');
                if (seen[key]) return false;
                seen[key] = true;
                return true;
            });
        },

        createPlayerAreaMarkers(request, sourceToken, playerId) {
            const payload = request && request.payload  request.payload  {};
            const options = this.getAreaInfoOptions(payload.areaInfo);
            if (!options.length) return { ok false, alternatives [], message 'Area information was not found.' };
            const alternatives = [];
            const errors = [];
            options.forEach((areaInfo, index) = {
                const variant = String(areaInfo.shape  'area').toLowerCase() + '-' + String(index + 1);
                const variantRequest = Object.assign({}, request, {
                    id String(request.id  '') + '-' + variant,
                    payload Object.assign({}, payload, { areaInfo })
                });
                const result = this.createPlayerAreaMarker(variantRequest, sourceToken, playerId);
                if (!result  !result.ok) {
                    errors.push((areaInfo.label  areaInfo.shape  'Area') + ' ' + String(result && result.message  'marker could not be created'));
                    return;
                }
                alternatives.push({
                    id variant,
                    areaInfo,
                    markerTokenId result.markerId,
                    markerTokenIds Array.isArray(result.markerIds)  result.markerIds.slice()  [result.markerId].filter(Boolean),
                    markerName result.markerName,
                    markerGroup result.markerGroup  null,
                    dismissed false
                });
            });
            return {
                ok alternatives.length  0,
                alternatives,
                markerIds alternatives.reduce((ids, alternative) = ids.concat(alternative.markerTokenIds  []), []),
                message errors.join(' ')
            };
        },

        getActiveAreaMarkerAlternatives(request) {
            const alternatives = request && Array.isArray(request.areaMarkerAlternatives)  request.areaMarkerAlternatives  [];
            if (!alternatives.length) {
                const marker = this.findPlayerAreaMarker(request);
                return marker  [{
                    id 'legacy',
                    areaInfo request && request.payload && request.payload.areaInfo,
                    markerTokenId this.getTokenId(marker),
                    markerTokenIds this.findPlayerAreaMarkers(request).map((entry) = this.getTokenId(entry)).filter(Boolean),
                    markerName request && request.markerName,
                    markerGroup request && request.areaMarkerGroup
                }]  [];
            }
            return alternatives.filter((alternative) = {
                if (!alternative  alternative.dismissed) return false;
                const expected = Array.isArray(alternative.markerTokenIds)  alternative.markerTokenIds.filter(Boolean)  [];
                const existing = expected.filter((id) = !!this.getTokenById(id));
                if (!expected.length  existing.length !== expected.length) {
                    alternative.dismissed = true;
                    AREA_MARKER_DESTROY_ACTIVE = true;
                    try {
                        existing.forEach((id) = {
                            const marker = this.getTokenById(id);
                            if (marker) this.removeGraphic(marker);
                        });
                    } finally {
                        AREA_MARKER_DESTROY_ACTIVE = false;
                    }
                    alternative.markerTokenId = '';
                    alternative.markerTokenIds = [];
                    return false;
                }
                return true;
            });
        },

        activateAreaMarkerAlternative(request, alternative) {
            if (!request  !alternative) return false;
            request.payload = request.payload  {};
            request.payload.areaInfo = alternative.areaInfo  request.payload.areaInfo;
            request.markerTokenId = String(alternative.markerTokenId  '').trim();
            request.markerTokenIds = Array.isArray(alternative.markerTokenIds)  alternative.markerTokenIds.slice()  [request.markerTokenId].filter(Boolean);
            request.markerName = alternative.markerName  request.markerName;
            request.areaMarkerGroup = alternative.markerGroup  null;
            request.activeAreaAlternativeId = alternative.id  '';
            return true;
        },

        playerAreaMarkerTooltip(request, payload, areaInfo) {
            const sourceName = String(payload && payload.sourceName  request && request.characterName  'Caster').trim()  'Caster';
            const actionName = String(payload && payload.sourceAction  request && request.attackName  '').trim();
            const saveAbility = CombatService.abilityNameToShortLabel(payload && payload.saveAbility  '')  '';
            const challenge = Math.max(0, Utils.toInt(payload && payload.challenge, 0));
            const check = saveAbility && challenge  (saveAbility + ' DC ' + String(challenge))  (challenge  ('Roll ' + String(challenge))  '');
            const damageRolls = Array.isArray(payload && payload.damageRolls)  payload.damageRolls  [];
            const damage = damageRolls.map((roll) = {
                const total = Math.max(0, Utils.toInt(roll && roll.total, 0));
                const type = CombatService.normalizeDamageType(roll && roll.damageType  'normal');
                const label = type  (type.charAt(0).toUpperCase() + type.slice(1))  'Damage';
                return String(total) + ' ' + (type === 'normal'  'Damage'  (label + ' Damage'));
            }).filter(Boolean).join(', ');
            const damageFormula = CombatService.getPrimaryDamageFormula(payload);
            const casterTokenId = String(payload && payload.casterTokenId  request && request.sourceTokenId  '').trim();
            const rangeInfo = CombatService.getAreaMarkerRangeInfo(payload  {});
            const range = rangeInfo.limited
                 (String(rangeInfo.rangeFeet) + ' ft')
                 Utils.cleanRoll20Label(payload && payload.rangeText  '');
            const areaSize = Math.max(0, Utils.toNumber(areaInfo && areaInfo.sizeFeet, 0));
            const areaShape = String(areaInfo && areaInfo.shape  '').trim().toLowerCase();
            const areaLabel = areaSize  0 && areaShape  (String(areaSize).replace(.0+$, '') + ' ft ' + areaShape)  (areaInfo && areaInfo.label  String(areaInfo.label)  '');
            const lightInfo = payload && payload.lightInfo && payload.lightInfo.hasLight  payload.lightInfo  null;
            const lightLabel = lightInfo
                 (String(lightInfo.label  (String(Math.max(0, Utils.toNumber(lightInfo.brightFeet, 0))).replace(.0+$, '') + ' ft bright')).trim())
                 '';
            return [
                '[' + sourceName + ']',
                actionName  '[' + actionName + ']'  '',
                check  '[' + check + ']'  '',
                damage  '[' + damage + ']'  '',
                range  '[' + range + ']'  '',
                areaLabel  '[' + areaLabel + ']'  '',
                lightLabel  '[Light ' + lightLabel + ']'  '',
                damageFormula  '[' + damageFormula + ']'  '',
                casterTokenId  '[' + casterTokenId + ']'  ''
            ].filter(Boolean).join('');
        },

        findPlayerAreaMarker(request) {
            const markerId = String(request && request.markerTokenId  '').trim();
            const byId = markerId  this.getTokenById(markerId)  null;
            if (byId) return byId;
            const name = String(request && request.markerName  this.getAreaMarkerName(request && request.id, request && request.characterName  '')  '').trim();
            if (!name) return null;
            const tokens = findObjs({ _type 'graphic', name })  [];
            return tokens.find((token) = token && Utils.isFunction(token.get))  null;
        },

        findPlayerAreaMarkers(request) {
            const activeIds = request && request.activeAreaAlternativeId && Array.isArray(request.markerTokenIds)
                 request.markerTokenIds
                 State.getPlayerActionMarkerIds(request);
            const markers = activeIds.map((id) = this.getTokenById(id)).filter((token) = token && Utils.isFunction(token.get));
            if (markers.length) return markers;
            const marker = this.findPlayerAreaMarker(request);
            return marker  [marker]  [];
        },

        removeGraphic(token) {
            if (!token  !Utils.isFunction(token.remove)) return false;
            try {
                token.remove();
                return true;
            } catch (error) {
                Logger.debug('[graphicremove]', error && error.message  error.message  String(error));
                return false;
            }
        },

        getConeMarkerPieceLimit(piece, fallbackIndex) {
            return Math.max(1, Utils.toInt(piece && piece.widthCells, 1));
        },

        measureTokenCenterToMarkerCenterPixels(token, marker) {
            const tokenRect = this.getTokenRect(token);
            const markerRect = this.getTokenRect(marker);
            if (!tokenRect  !markerRect) return Infinity;
            const dx = tokenRect.left - markerRect.left;
            const dy = tokenRect.top - markerRect.top;
            return Math.sqrt((dx  dx) + (dy  dy));
        },

        getConeMarkerPieceMeta(request, marker, fallbackIndex) {
            const markerId = this.getTokenId(marker);
            const pieces = request && request.areaMarkerGroup && Array.isArray(request.areaMarkerGroup.pieces)
                 request.areaMarkerGroup.pieces
                 [];
            return pieces.find((piece) = String(piece && piece.id  '').trim() === markerId)  {
                id markerId,
                index fallbackIndex  0
            };
        },

        getTokensInsideConeAreaMarker(markers, request, boundaryInsetPx, casterTokenId, isSelfRange) {
            if (!Array.isArray(markers)  !markers.length) return [];
            const selectedById = Object.create(null);
            const markerIds = markers.map((entry) = this.getTokenId(entry)).filter(Boolean);
            const candidates = this.getTokensOnPage(this.getTokenPageId(markers[0])).filter((token) = {
                const tokenId = this.getTokenId(token);
                if (!token  !tokenId  markerIds.indexOf(tokenId) = 0) return false;
                if (casterTokenId && tokenId === casterTokenId) return false;
                return !!this.getTokenRect(token);
            });
            markers.forEach((pieceMarker, pieceIndex) = {
                const pieceMeta = this.getConeMarkerPieceMeta(request, pieceMarker, pieceIndex);
                const limit = this.getConeMarkerPieceLimit(pieceMeta, pieceIndex);
                const pieceHits = candidates
                    .map((token) = ({
                        token,
                        tokenId this.getTokenId(token),
                        distance this.measureTokenCenterToMarkerCenterPixels(token, pieceMarker),
                        intersects this.tokenIntersectsRotatedMarker(token, pieceMarker, boundaryInsetPx)
                    }))
                    .filter((entry) = entry.intersects && !selectedById[entry.tokenId])
                    .sort((a, b) = a.distance - b.distance)
                    .slice(0, limit);
                pieceHits.forEach((entry) = {
                    selectedById[entry.tokenId] = entry.token;
                });
            });
            return Object.keys(selectedById).map((tokenId) = selectedById[tokenId]).filter(Boolean);
        },

        getLineMarkerEndpoints(marker) {
            const rect = this.getTokenRect(marker);
            if (!rect) return null;
            const center = { x rect.left, y rect.top };
            const halfLength = rect.height  2;
            return {
                first this.rotatePoint({ x rect.left, y rect.top - halfLength }, center, this.getTokenRotationDegrees(marker)),
                second this.rotatePoint({ x rect.left, y rect.top + halfLength }, center, this.getTokenRotationDegrees(marker))
            };
        },

        getLineMarkerStartEnd(marker, sourceToken) {
            const endpoints = this.getLineMarkerEndpoints(marker);
            const sourceRect = this.getTokenRect(sourceToken);
            if (!endpoints) return null;
            if (!sourceRect) return { start endpoints.first, end endpoints.second };
            const distance = (point) = {
                const dx = point.x - sourceRect.left;
                const dy = point.y - sourceRect.top;
                return Math.sqrt((dx  dx) + (dy  dy));
            };
            return distance(endpoints.first) = distance(endpoints.second)
                 { start endpoints.first, end endpoints.second }
                 { start endpoints.second, end endpoints.first };
        },

        getTokensInsideLineAreaMarker(marker, request, boundaryInsetPx, casterTokenId, isSelfRange) {
            const pageId = this.getTokenPageId(marker);
            const markerId = this.getTokenId(marker);
            if (!pageId  !markerId) return [];
            return this.getTokensOnPage(pageId).filter((token) = {
                const tokenId = this.getTokenId(token);
                if (!token  !tokenId  tokenId === markerId) return false;
                if (isSelfRange && casterTokenId && tokenId === casterTokenId) return false;
                return this.tokenIntersectsRotatedMarker(token, marker, boundaryInsetPx);
            });
        },

        tokenCircleIntersectsAreaRadius(token, markerRect, pageId, radiusFeet, boundaryInsetFeet) {
            const rect = this.getTokenRect(token);
            if (!rect  !markerRect  !pageId) return false;
            const dx = Utils.toNumber(rect.left, 0) - Utils.toNumber(markerRect.left, 0);
            const dy = Utils.toNumber(rect.top, 0) - Utils.toNumber(markerRect.top, 0);
            const centerDistanceFeet = this.pixelsToPageFeet(pageId, Math.sqrt((dx  dx) + (dy  dy)));
            const tokenRadiusPx = Math.max(0, Math.min(Utils.toNumber(rect.width, 0), Utils.toNumber(rect.height, 0))  2);
            const tokenRadiusFeet = this.pixelsToPageFeet(pageId, tokenRadiusPx);
            return centerDistanceFeet = Math.max(0, Utils.toNumber(radiusFeet, 0) + tokenRadiusFeet - Utils.toNumber(boundaryInsetFeet, 0));
        },

        debugCirclePath(radiusPx, segments) {
            const radius = Math.max(1, Utils.toNumber(radiusPx, 1));
            const count = Math.max(12, Utils.toInt(segments, 36));
            const center = radius;
            const path = [];
            for (let i = 0; i = count; i += 1) {
                const angle = (Math.PI  2  i)  count;
                const x = Math.round((center + Math.cos(angle)  radius)  100)  100;
                const y = Math.round((center + Math.sin(angle)  radius)  100)  100;
                path.push([i === 0  'M'  'L', x, y]);
            }
            return JSON.stringify(path);
        },

        debugDrawCircle(pageId, centerX, centerY, radiusPx, options) {
            const opts = options  {};
            const radius = Math.max(1, Utils.toNumber(radiusPx, 0));
            const safePageId = String(pageId  '').trim();
            if (!safePageId  typeof createObj !== 'function') return null;
            let path = null;
            try {
                path = createObj('path', {
                    _pageid safePageId,
                    layer opts.layer  'gmlayer',
                    left Utils.toNumber(centerX, 0),
                    top Utils.toNumber(centerY, 0),
                    width radius  2,
                    height radius  2,
                    stroke opts.stroke  'rgb(80,180,255)',
                    stroke_width Math.max(1, Utils.toInt(opts.strokeWidth, 2)),
                    fill opts.fill  'transparent',
                    _path this.debugCirclePath(radius, opts.segments  48)
                });
                if (path && Utils.isFunction(path.set)) {
                    path.set({
                        controlledby '',
                        name opts.name  'CA Area Radius Debug',
                        gmnotes opts.gmnotes  'Temporary Combat Assistant area radius debug drawing.'
                    });
                }
                const ttlMs = Math.max(5000, Utils.toInt(opts.ttlMs, 45000));
                setTimeout(() = {
                    try {
                        if (path && Utils.isFunction(path.remove)) path.remove();
                    } catch (ignored) {}
                }, ttlMs);
            } catch (error) {
                Logger.debug('[area-radius-debug-draw]', error && error.message  error.message  String(error));
            }
            return path;
        },

        debugDrawAreaRadiusMeasurement(pageId, markerRect, token, radiusFeet, included, drawAreaCircle) {
            if (!RuntimeConfig.get('AREA_RADIUS_DEBUG_DRAW')) return;
            const rect = this.getTokenRect(token);
            if (!pageId  !markerRect  !rect) return;
            const tokenRadiusPx = Math.max(1, Math.min(Utils.toNumber(rect.width, 0), Utils.toNumber(rect.height, 0))  2);
            if (drawAreaCircle) {
                const areaRadiusPx = this.pageFeetToPixels(pageId, Math.max(0, Utils.toNumber(radiusFeet, 0)));
                this.debugDrawCircle(pageId, markerRect.left, markerRect.top, areaRadiusPx, {
                    stroke 'rgb(80,180,255)',
                    strokeWidth 2,
                    name 'CA Area Radius Debug',
                    gmnotes 'Combat Assistant debug circular area reference.',
                    ttlMs 45000
                });
            }
            this.debugDrawCircle(pageId, rect.left, rect.top, tokenRadiusPx, {
                stroke included  'rgb(90,230,120)'  'rgb(230,80,80)',
                strokeWidth 2,
                name 'CA Token Radius Debug',
                gmnotes 'Combat Assistant debug token circular radius reference.',
                ttlMs 45000
            });
        },

        getTokensInsideAreaMarker(marker, request) {
            if (!marker  !Utils.isFunction(marker.get)) return [];
            const payload = request && request.payload  request.payload  {};
            const areaInfo = payload.areaInfo && payload.areaInfo.isArea  payload.areaInfo  {};
            const casterTokenId = String(payload.casterTokenId  request && request.sourceTokenId  '').trim();
            const isSelfRange = ^selfbi.test(Utils.cleanRoll20Label(payload.rangeText  payload.range  ''));
            const markers = this.findPlayerAreaMarkers(request);
            const markerIds = markers.map((entry) = this.getTokenId(entry)).filter(Boolean);
            const pageId = this.getTokenPageId(marker);
            const markerRect = this.getTokenRect(marker);
            if (!pageId  !markerRect) return [];
            const shape = String(areaInfo.shape  '').trim();
            const isCone = this.isConeAreaShape(shape);
            const isLine = this.isLineAreaShape(shape);
            const isSquare = this.isSquareAreaShape(shape);
            const radiusFeet = isSquare  isLine  0  this.pixelsToPageFeet(pageId, markerRect.width  2);
            const boundaryInsetFeet = 0.1;
            const boundaryInsetPx = this.pageFeetToPixels(pageId, boundaryInsetFeet);
            if (isCone) return this.getTokensInsideConeAreaMarker(markers, request, boundaryInsetPx, casterTokenId, isSelfRange);
            if (isLine) return this.getTokensInsideLineAreaMarker(marker, request, boundaryInsetPx, casterTokenId, isSelfRange);
            let radiusDebugAreaDrawn = false;
            return this.getTokensOnPage(pageId).filter((token) = {
                const tokenId = this.getTokenId(token);
                if (!token  !tokenId  markerIds.indexOf(tokenId) = 0) return false;
                if (isSelfRange && casterTokenId && tokenId === casterTokenId) return false;
                const rect = this.getTokenRect(token);
                if (!rect) return false;
                if (isSquare) {
                    return rect.maxX  markerRect.minX + boundaryInsetPx &&
                        rect.minX  markerRect.maxX - boundaryInsetPx &&
                        rect.maxY  markerRect.minY + boundaryInsetPx &&
                        rect.minY  markerRect.maxY - boundaryInsetPx;
                }
                const included = this.tokenCircleIntersectsAreaRadius(token, markerRect, pageId, radiusFeet, boundaryInsetFeet);
                const drawAreaCircle = !radiusDebugAreaDrawn;
                if (drawAreaCircle) radiusDebugAreaDrawn = true;
                this.debugDrawAreaRadiusMeasurement(pageId, markerRect, token, radiusFeet, included, drawAreaCircle);
                return included;
            });
        },

        getAreaMarkerSourceToken(request) {
            const payload = request && request.payload  request.payload  {};
            const sourceId = String(payload.casterTokenId  request && request.sourceTokenId  '').trim();
            return sourceId  this.getTokenById(sourceId)  null;
        },

        isSelfAreaMarkerRequest(request) {
            const payload = request && request.payload  request.payload  {};
            return ^selfbi.test(Utils.cleanRoll20Label(payload.rangeText  payload.range  ''));
        },

        snapSelfAreaMarkerToSource(marker, request) {
            const sourceToken = this.getAreaMarkerSourceToken(request);
            const markerPageId = this.getTokenPageId(marker);
            const sourcePageId = this.getTokenPageId(sourceToken);
            const sourceRect = this.getTokenRect(sourceToken);
            if (!marker  !Utils.isFunction(marker.set)  !sourceRect  !markerPageId  markerPageId !== sourcePageId) return false;
            marker.set({
                left sourceRect.left,
                top sourceRect.top
            });
            return true;
        },

        syncLineAreaMarkerToSource(marker, request) {
            const sourceToken = this.getAreaMarkerSourceToken(request);
            const sourceRect = this.getTokenRect(sourceToken);
            const markerRect = this.getTokenRect(marker);
            const sourcePageId = this.getTokenPageId(sourceToken);
            const markerPageId = this.getTokenPageId(marker);
            if (!sourceRect  !markerRect  !sourcePageId  sourcePageId !== markerPageId  !Utils.isFunction(marker.set)) return false;
            const endpoints = this.getLineMarkerStartEnd(marker, sourceToken);
            if (!endpoints) return false;
            const maxDistancePx = this.pageFeetToPixels(sourcePageId, 5);
            const clamped = this.clampPointToDistance(endpoints.start, { x sourceRect.left, y sourceRect.top }, maxDistancePx);
            const shiftX = clamped.x - endpoints.start.x;
            const shiftY = clamped.y - endpoints.start.y;
            if (Math.abs(shiftX)  0.01 && Math.abs(shiftY)  0.01) return true;
            marker.set({ left markerRect.left + shiftX, top markerRect.top + shiftY });
            return true;
        },

        syncAreaMarkerGroupForMovedToken(token) {
            if (AREA_MARKER_GROUP_SYNC_ACTIVE  !token  !Utils.isFunction(token.get)) return false;
            const markerId = this.getTokenId(token);
            const found = State.findAreaMarkerRequestByTokenId(markerId);
            if (!found  !found.request) return false;
            const payload = found.request.payload  {};
            const areaInfo = found.alternative && found.alternative.areaInfo
                 found.alternative.areaInfo
                 (payload.areaInfo && payload.areaInfo.isArea  payload.areaInfo  null);
            if (areaInfo && this.isLineAreaShape(areaInfo.shape) && this.isSelfAreaMarkerRequest(found.request)) {
                AREA_MARKER_GROUP_SYNC_ACTIVE = true;
                try {
                    return this.syncLineAreaMarkerToSource(token, found.request);
                } finally {
                    AREA_MARKER_GROUP_SYNC_ACTIVE = false;
                }
            }
            if (areaInfo && !this.isConeAreaShape(areaInfo.shape) && this.isSelfAreaMarkerRequest(found.request)) {
                AREA_MARKER_GROUP_SYNC_ACTIVE = true;
                try {
                    return this.snapSelfAreaMarkerToSource(token, found.request);
                } finally {
                    AREA_MARKER_GROUP_SYNC_ACTIVE = false;
                }
            }
            if (!found.group  String(found.group.type  '').toLowerCase() !== 'cone') return false;
            const pieces = Array.isArray(found.group.pieces)  found.group.pieces  [];
            const movedPiece = pieces.find((piece) = String(piece && piece.id  '').trim() === markerId);
            if (!movedPiece) return false;
            const movedRect = this.getTokenRect(token);
            if (!movedRect) return false;
            const rotation = this.getTokenRotationDegrees(token) - Utils.toNumber(movedPiece.rotationOffset, 0);
            const rotatedOffset = this.rotatePoint(
                { x Utils.toNumber(movedPiece.offsetX, 0), y Utils.toNumber(movedPiece.offsetY, 0) },
                { x 0, y 0 },
                rotation
            );
            const center = {
                x movedRect.left - rotatedOffset.x,
                y movedRect.top - rotatedOffset.y
            };
            const sourceToken = this.getAreaMarkerSourceToken(found.request);
            const sourceRect = this.getTokenRect(sourceToken);
            const sourcePageId = this.getTokenPageId(sourceToken);
            const markerPageId = this.getTokenPageId(token);
            const firstPiece = pieces[0]  movedPiece;
            if (sourceRect && sourcePageId && sourcePageId === markerPageId && firstPiece) {
                const firstOffset = this.rotatePoint(
                    { x Utils.toNumber(firstPiece.offsetX, 0), y Utils.toNumber(firstPiece.offsetY, 0) },
                    { x 0, y 0 },
                    rotation
                );
                const firstCenter = {
                    x center.x + firstOffset.x,
                    y center.y + firstOffset.y
                };
                const maxDistancePx = this.pageFeetToPixels(sourcePageId, 5);
                const clampedFirstCenter = this.clampPointToDistance(firstCenter, { x sourceRect.left, y sourceRect.top }, maxDistancePx);
                center.x = clampedFirstCenter.x - firstOffset.x;
                center.y = clampedFirstCenter.y - firstOffset.y;
            }
            AREA_MARKER_GROUP_SYNC_ACTIVE = true;
            try {
                found.group.centerLeft = center.x;
                found.group.centerTop = center.y;
                found.group.rotation = rotation;
                pieces.forEach((piece) = {
                    const marker = this.getTokenById(piece.id);
                    if (!marker  !Utils.isFunction(marker.set)) return;
                    const offset = this.rotatePoint(
                        { x Utils.toNumber(piece.offsetX, 0), y Utils.toNumber(piece.offsetY, 0) },
                        { x 0, y 0 },
                        rotation
                    );
                    marker.set({
                        left center.x + offset.x,
                        top center.y + offset.y,
                        width Math.max(1, Utils.toNumber(piece.width, 1)),
                        height Math.max(1, Utils.toNumber(piece.height, 1)),
                        rotation rotation + Utils.toNumber(piece.rotationOffset, 0)
                    });
                });
            } catch (error) {
                Logger.debug('[area-marker-sync]', error && error.message  error.message  String(error));
                return false;
            } finally {
                AREA_MARKER_GROUP_SYNC_ACTIVE = false;
            }
            return true;
        },

        handleAreaMarkerDestroyed(token) {
            if (AREA_MARKER_DESTROY_ACTIVE  !token) return false;
            const markerId = this.getTokenId(token);
            const found = State.findAreaMarkerRequestByTokenId(markerId);
            if (!found  !found.request) return false;
            const request = found.request;
            const alternative = found.alternative;
            const concentrationCasterTokenId = String(request.concentrationCasterTokenId  '').trim();
            const shouldEndConcentration = !!(request.concentrationAreaActive && concentrationCasterTokenId);
            const ids = alternative
                 (Array.isArray(alternative.markerTokenIds)  alternative.markerTokenIds.slice()  [alternative.markerTokenId].filter(Boolean))
                 State.getPlayerActionMarkerIds(request);
            if (alternative) {
                alternative.dismissed = true;
                alternative.markerTokenId = '';
                alternative.markerTokenIds = [];
            }
            request.markerTokenIds = (Array.isArray(request.markerTokenIds)  request.markerTokenIds  [])
                .filter((id) = ids.indexOf(String(id  '').trim())  0);
            if (ids.indexOf(String(request.markerTokenId  '').trim()) = 0) {
                request.markerTokenId = '';
                request.markerName = '';
                request.areaMarkerGroup = null;
            }
            AREA_MARKER_DESTROY_ACTIVE = true;
            try {
                ids.forEach((id) = {
                    const safeId = String(id  '').trim();
                    if (!safeId  safeId === markerId) return;
                    const remaining = this.getTokenById(safeId);
                    if (remaining) this.removeGraphic(remaining);
                });
            } finally {
                AREA_MARKER_DESTROY_ACTIVE = false;
            }
            if (shouldEndConcentration && typeof CombatService !== 'undefined' && CombatService.endConcentrationByTokenId) {
                CombatService.endConcentrationByTokenId(concentrationCasterTokenId, 'area marker removed');
            }
            return true;
        },

        findTokenByCharacterIdOnPage(characterId, pageId) {
            const safePageId = String(pageId  '').trim();
            if (!safePageId) return null;
            const tokens = this.getTokensByCharacterId(characterId);
            for (let i = 0; i  tokens.length; i += 1) {
                if (this.getTokenPageId(tokens[i]) === safePageId) return tokens[i];
            }
            return null;
        },

        getPlayerPageId(playerId) {
            const safePlayerId = String(playerId  '').trim();
            if (typeof Campaign !== 'function') return '';
            try {
                const campaign = Campaign();
                const specificRaw = campaign && Utils.isFunction(campaign.get)  campaign.get('playerspecificpages')  '';
                const specific = specificRaw  JSON.parse(specificRaw)  {};
                if (safePlayerId && specific && specific[safePlayerId]) return String(specific[safePlayerId]  '').trim();
                const player = safePlayerId  getObj('player', safePlayerId)  null;
                const lastPage = player && Utils.isFunction(player.get)  String(player.get('_lastpage')  '').trim()  '';
                if (lastPage) return lastPage;
                return String(campaign.get('playerpageid')  '').trim();
            } catch (error) {
                return '';
            }
        },

        getTokenId(token) {
            return token && Utils.isFunction(token.get)  String(token.get('_id')  token.id  '').trim()  '';
        },

        tokenIsControlledByPlayer(token, character, playerId) {
            const safePlayerId = String(playerId  '').trim();
            if (!safePlayerId) return false;
            return this.hasPlayerAccess(token && Utils.isFunction(token.get)  token.get('controlledby')  '', safePlayerId) 
                this.hasPlayerAccess(character && Utils.isFunction(character.get)  character.get('controlledby')  '', safePlayerId);
        },

        resolveRollSourceToken(result, playerId) {
            const safePlayerId = String(playerId  '').trim();
            const explicitTokenId = String(result && (result.sourceTokenId  result.casterTokenId  result.tokenId)  '').trim();
            const explicit = explicitTokenId  this.getTokenById(explicitTokenId)  null;
            if (explicit) return explicit;

            const character = this.getCharacterByName(result && (result.characterName  result.tokenName)  '');
            const characterId = character  String(character.id  '').trim()  '';
            if (!characterId) return null;
            const playerPageId = this.getPlayerPageId(safePlayerId);
            const pageToken = this.findTokenByCharacterIdOnPage(characterId, playerPageId);
            if (pageToken) return pageToken;

            const tokens = this.getTokensByCharacterId(characterId);
            for (let i = 0; i  tokens.length; i += 1) {
                if (this.tokenIsControlledByPlayer(tokens[i], character, safePlayerId)) return tokens[i];
            }
            return tokens[0]  null;
        },

        getTokenImageByCharacterName(characterName) {
            const tokens = this.getTokensByCharacterName(characterName);
            for (let i = 0; i  tokens.length; i += 1) {
                const imgsrc = String(tokens[i].get('imgsrc')  '').trim();
                if (imgsrc) return imgsrc;
            }
            const character = this.getCharacterByName(characterName);
            const avatar = character  String(character.get('avatar')  '').trim()  '';
            return avatar;
        },

        getCharacterControllerDisplayNames(character) {
            const ids = [];
            const addIds = (raw) = {
                String(raw  '').split(',').forEach((id) = {
                    const safeId = String(id  '').trim();
                    if (safeId) ids.push(safeId);
                });
            };
            if (character && Utils.isFunction(character.get)) addIds(character.get('controlledby'));
            if (ids.indexOf('all') = 0) {
                const players = findObjs({ _type 'player' })  [];
                return Utils.uniqueNames(players.map((player) = {
                    if (!player  !Utils.isFunction(player.get)) return '';
                    return String(player.get('_displayname')  player.get('displayname')  '').trim();
                }).filter(Boolean));
            }
            const names = Utils.uniqueNames(ids.map((id) = {
                const player = getObj('player', id);
                if (!player) return '';
                return String(player.get('_displayname')  player.get('displayname')  '').trim();
            }).filter(Boolean));
            return names;
        },

        getTokenControllerDisplayNames(token, character) {
            const ids = [];
            const addIds = (raw) = {
                String(raw  '').split(',').forEach((id) = {
                    const safeId = String(id  '').trim();
                    if (safeId) ids.push(safeId);
                });
            };
            if (token && Utils.isFunction(token.get)) addIds(token.get('controlledby'));
            if (character && Utils.isFunction(character.get)) addIds(character.get('controlledby'));
            if (ids.indexOf('all') = 0) {
                const players = findObjs({ _type 'player' })  [];
                return Utils.uniqueNames(players.map((player) = {
                    if (!player  !Utils.isFunction(player.get)) return '';
                    return String(player.get('_displayname')  player.get('displayname')  '').trim();
                }).filter(Boolean));
            }
            return Utils.uniqueNames(ids.map((id) = {
                const player = getObj('player', id);
                if (!player) return '';
                return String(player.get('_displayname')  player.get('displayname')  '').trim();
            }).filter(Boolean));
        },

        getNonGmTokenControllerDisplayNames(token, character) {
            const ids = [];
            const addIds = (raw) = {
                String(raw  '').split(',').forEach((id) = {
                    const safeId = String(id  '').trim();
                    if (safeId && ids.indexOf(safeId)  0) ids.push(safeId);
                });
            };
            if (token && Utils.isFunction(token.get)) addIds(token.get('controlledby'));
            if (character && Utils.isFunction(character.get)) addIds(character.get('controlledby'));

            let playerIds = ids.slice();
            if (ids.indexOf('all') = 0) {
                playerIds = (findObjs({ _type 'player' })  []).map((player) = {
                    if (!player) return '';
                    return String(player.id  (Utils.isFunction(player.get)  player.get('_id')  '')  '').trim();
                }).filter(Boolean);
            }

            return Utils.uniqueNames(playerIds.map((id) = {
                if (!id  id === 'all') return '';
                if (typeof playerIsGM === 'function' && playerIsGM(id)) return '';
                const player = getObj('player', id);
                if (!player  !Utils.isFunction(player.get)) return '';
                return String(player.get('_displayname')  player.get('displayname')  '').trim();
            }).filter(Boolean));
        },

        getTokenControllerIds(token, character, fallbackPlayerId) {
            const ids = [];
            const addIds = (raw) = {
                String(raw  '').split(',').forEach((id) = {
                    const safeId = String(id  '').trim();
                    if (safeId && ids.indexOf(safeId)  0) ids.push(safeId);
                });
            };
            if (token && Utils.isFunction(token.get)) addIds(token.get('controlledby'));
            if (character && Utils.isFunction(character.get)) addIds(character.get('controlledby'));
            if (!ids.length && fallbackPlayerId) addIds(fallbackPlayerId);
            return ids;
        },

        isPlayerControlledToken(token, character) {
            const tokenControlledBy = token && Utils.isFunction(token.get)  String(token.get('controlledby')  '').trim()  '';
            return !!tokenControlledBy  this.isPlayerControlledCharacter(character);
        },

        isPlayerControlledCharacter(character) {
            if (!character  !Utils.isFunction(character.get)) return false;
            return String(character.get('controlledby')  '').trim() !== '';
        },

        parsePlayerAccessList(value) {
            return String(value  '').split(',').map((entry) = String(entry  '').trim()).filter(Boolean);
        },

        hasPlayerAccess(value, playerId) {
            const safePlayerId = String(playerId  '').trim();
            const entries = this.parsePlayerAccessList(value);
            if (entries.indexOf('all') = 0) return true;
            if (!safePlayerId) return false;
            return entries.indexOf(safePlayerId) = 0;
        },

        getCharacterAccessFlags(character, playerId, isGM) {
            if (isGM) return { journalAccess true, controlAccess true, hasAccess true, isGM true };
            if (!character) return { journalAccess false, controlAccess false, hasAccess false, isGM false };
            const journalAccess = this.hasPlayerAccess(character.get('inplayerjournals'), playerId);
            const controlAccess = this.hasPlayerAccess(character.get('controlledby'), playerId);
            return { journalAccess, controlAccess, hasAccess journalAccess && controlAccess, isGM false };
        },

        getCharacterStoreDumpRoots(characterId) {
            const safeCharacterId = String(characterId  '').trim();
            if (!safeCharacterId) return [];
            const attrs = findObjs({ _type 'attribute', _characterid safeCharacterId })  [];
            const storeAttr = attrs.find((attr) = attr && Utils.isFunction(attr.get) && String(attr.get('name')  '').trim().toLowerCase() === 'store');
            if (!storeAttr) return [];
            const current = storeAttr.get('current');
            if (current && typeof current === 'object') return [current];
            const raw = String(current  '').trim();
            if (!raw) return [];
            try {
                const parsed = JSON.parse(raw);
                return parsed && typeof parsed === 'object'  [parsed]  [];
            } catch (error) {
                Logger.debug('[store dump]', error && error.message  error.message  String(error));
                return [];
            }
        },

        detectSheetVersion(characterId) {
            const safeCharacterId = String(characterId  '').trim();
            if (!safeCharacterId) return 'unknown';
            const storeRoots = this.getCharacterStoreDumpRoots(safeCharacterId);
            if (storeRoots.some((root) = root && typeof root === 'object' && (root.integrants  root.settings  root.hitpoints))) return '2024';

            const attrs = findObjs({ _type 'attribute', _characterid safeCharacterId })  [];
            const names = Object.create(null);
            attrs.forEach((attr) = {
                if (!attr  !Utils.isFunction(attr.get)) return;
                const name = String(attr.get('name')  '').trim().toLowerCase();
                if (name) names[name] = true;
            });
            const classicSignals = ['rtype', 'wtype', 'npc', 'spellcasting_ability', 'strength_save_roll', 'dexterity_save_roll', 'constitution_save_roll'];
            if (classicSignals.some((name) = names[name])) return '2014';
            return storeRoots.length  '2024'  '2014';
        }
    };


     -----------------------------------------------------------------------
      Combat visual effects
      --------------------------------------------------------------------- 
    const CombatEffects = {
        DAMAGE_TYPE_EFFECT_COLORS Object.freeze({
            normal 'death',
            bludgeoning 'death',
            piercing 'death',
            slashing 'death',
            fire 'fire',
            acid 'acid',
            poison 'slime',
            cold 'water',
            lightning 'water',
            thunder 'frost',
            force 'magic',
            psychic 'charm',
            necrotic 'smoke',
            radiant 'holy',
            healing 'slime',
            'temp healing' 'charm'
        }),

        isEnabled() {
            return Utils.toBoolean(RuntimeConfig.get('COMBAT_VISUAL_EFFECTS'), false);
        },

        normalizeDamageType(value) {
            const normalized = String(value  'normal')
                .trim()
                .toLowerCase()
                .replace([_-]+g, ' ')
                .replace(s+g, ' ');
            if (normalized === 'temporary healing'  normalized === 'temporary hp'  normalized === 'temp hp') return 'temp healing';
            return normalized  'normal';
        },

        getEffectColor(damageType) {
            const normalized = this.normalizeDamageType(damageType);
            return this.DAMAGE_TYPE_EFFECT_COLORS[normalized]  this.DAMAGE_TYPE_EFFECT_COLORS.normal;
        },

        getPrimaryDamageType(payloadOrParts) {
            const source = payloadOrParts  {};
            const parts = Array.isArray(source.parts)  source.parts  [];
            const damagingPart = parts.find((part) = Math.max(0, Utils.toInt(part && part.finalDamage, 0))  0);
            if (damagingPart) return this.normalizeDamageType(damagingPart.damageType  'normal');

            const damageRolls = Array.isArray(source.damageRolls)  source.damageRolls  [];
            const positiveRoll = damageRolls.find((roll) = Math.max(0, Utils.toInt(roll && (roll.total  roll.amount  roll.damage), 0))  0);
            const firstRoll = positiveRoll  damageRolls[0];
            return this.normalizeDamageType(firstRoll && firstRoll.damageType  source.damageType  'normal');
        },

        spawnAtToken(token, effectName, color) {
            if (!this.isEnabled()) return false;
            if (!token  !Utils.isFunction(token.get)  typeof spawnFx !== 'function') return false;
            const rect = R20.getTokenRect(token);
            const pageId = R20.getTokenPageId(token);
            const effectRef = this.resolveColoredEffectReference(effectName, color);
            if (!rect  !pageId  !effectRef) return false;
            try {
                spawnFx(rect.left, rect.top, effectRef, pageId);
                return true;
            } catch (error) {
                Logger.debug('[combat-fx]', error && error.message  error.message  String(error));
                return false;
            }
        },

        spawnTimedAtToken(token, effectName, color, durationMs) {
            if (!this.isEnabled()) return false;
            const duration = Utils.clamp(Utils.toInt(durationMs, 1000), 1, 10000);
            const repeats = Math.max(1, Math.ceil(duration  1000));
            const interval = repeats  1  Math.max(1, Math.floor(duration  repeats))  0;
            for (let index = 0; index  repeats; index += 1) {
                setTimeout(() = {
                    this.spawnAtToken(token, effectName, color);
                }, index  interval);
            }
            return true;
        },

        getProjectileEffectName() {
            return String(RuntimeConfig.get('PROJECTILE_EFFECT_NAME')  '').trim();
        },

        getDirectHitEffectName() {
            return String(RuntimeConfig.get('DIRECT_HIT_EFFECT_NAME')  '').trim();
        },

        getAreaHitEffectName() {
            return String(RuntimeConfig.get('AREA_HIT_EFFECT_NAME')  '').trim();
        },

        findCustomEffectReference(effectName) {
            const safeName = String(effectName  '').trim();
            if (!safeName) return '';
            try {
                const exact = findObjs({ _type 'custfx', name safeName })  [];
                if (exact.length) return String(exact[0].id  exact[0].get('_id')  '');
                const normalized = safeName.toLowerCase();
                const custom = (findObjs({ _type 'custfx' })  []).find((effect) = {
                    if (!effect  !Utils.isFunction(effect.get)) return false;
                    return String(effect.get('name')  '').trim().toLowerCase() === normalized;
                });
                return custom  String(custom.id  custom.get('_id')  '')  '';
            } catch (error) {
                Logger.debug('[combat-fxcustom]', error && error.message  error.message  String(error));
                return '';
            }
        },

        resolveColoredEffectReference(effectName, color) {
            const safeName = String(effectName  '').trim();
            const safeColor = String(color  '').trim().toLowerCase();
            if (!safeName  !safeColor) return '';
            const exactCustom = this.findCustomEffectReference(safeName);
            if (exactCustom) return exactCustom;
            const normalizedName = safeName.toLowerCase();
            const hasColorSuffix = -(acidbloodcharmdeathfirefrostholymagicslimesmokewater)$.test(normalizedName);
            const coloredName = hasColorSuffix  normalizedName  (normalizedName + '-' + safeColor);
            return this.resolveEffectReference(coloredName);
        },

        resolveEffectReference(effectName) {
            const safeName = String(effectName  '').trim();
            if (!safeName) return '';
            const customRef = this.findCustomEffectReference(safeName);
            return customRef  safeName;
        },

        spawnBetweenTokens(sourceToken, targetToken, effectName) {
            if (!this.isEnabled()) return false;
            if (!sourceToken  !targetToken  !Utils.isFunction(sourceToken.get)  !Utils.isFunction(targetToken.get)) return false;
            if (typeof spawnFxBetweenPoints !== 'function') return false;
            const sourcePageId = R20.getTokenPageId(sourceToken);
            const targetPageId = R20.getTokenPageId(targetToken);
            const effectRef = this.resolveEffectReference(effectName);
            if (!sourcePageId  sourcePageId !== targetPageId  !effectRef) return false;
            const source = R20.getTokenRect(sourceToken);
            const target = R20.getTokenRect(targetToken);
            if (!source  !target) return false;
            try {
                spawnFxBetweenPoints(
                    { x source.left, y source.top },
                    { x target.left, y target.top },
                    effectRef,
                    sourcePageId
                );
                return true;
            } catch (error) {
                Logger.debug('[combat-fxprojectile]', error && error.message  error.message  String(error));
                return false;
            }
        },

        spawnColoredBetweenPoints(sourceToken, targetToken, effectName, color) {
            if (!this.isEnabled()) return false;
            if (!sourceToken  !targetToken  !Utils.isFunction(sourceToken.get)  !Utils.isFunction(targetToken.get)) return false;
            if (typeof spawnFxBetweenPoints !== 'function') return false;
            const sourcePageId = R20.getTokenPageId(sourceToken);
            const targetPageId = R20.getTokenPageId(targetToken);
            const effectRef = this.resolveColoredEffectReference(effectName, color);
            if (!sourcePageId  sourcePageId !== targetPageId  !effectRef) return false;
            const source = R20.getTokenRect(sourceToken);
            const target = R20.getTokenRect(targetToken);
            if (!source  !target) return false;
            try {
                spawnFxBetweenPoints(
                    { x source.left, y source.top },
                    { x target.left, y target.top },
                    effectRef,
                    sourcePageId
                );
                return true;
            } catch (error) {
                Logger.debug('[combat-fxbreath]', error && error.message  error.message  String(error));
                return false;
            }
        },

        spawnColoredBetweenCoordinates(start, end, pageId, effectName, color) {
            if (!this.isEnabled()  typeof spawnFxBetweenPoints !== 'function') return false;
            const effectRef = this.resolveColoredEffectReference(effectName, color);
            if (!start  !end  !pageId  !effectRef) return false;
            try {
                spawnFxBetweenPoints(
                    { x Utils.toNumber(start.x, 0), y Utils.toNumber(start.y, 0) },
                    { x Utils.toNumber(end.x, 0), y Utils.toNumber(end.y, 0) },
                    effectRef,
                    pageId
                );
                return true;
            } catch (error) {
                Logger.debug('[combat-fxcoordinates]', error && error.message  error.message  String(error));
                return false;
            }
        },

        isSelfRange(payload) {
            const source = payload  {};
            const rangeText = Utils.cleanRoll20Label(source.rangeText  source.range  '');
            return ^selfbi.test(rangeText);
        },

        isRangedProjectile(payload) {
            const source = payload  {};
            const areaInfo = source.areaInfo && source.areaInfo.isArea  source.areaInfo  null;
            if (String(source.type  '').trim().toLowerCase() !== 'damage'  areaInfo  this.isSelfRange(source)) return false;
            const rangeText = Utils.cleanRoll20Label(source.rangeText  source.range  '').toLowerCase();
            if (!rangeText  btouchbbreachb.test(rangeText)) return false;
            const rangeInfo = CombatService.parseActionRangeFeet(rangeText);
            if (!rangeInfo.ok  !rangeInfo.limited) return false;
            if (brangedb.test(rangeText)  d+(.d+)ssd+(.d+).test(rangeText)) return true;
            if (Utils.toBoolean(source.isSpellAction, false) && rangeInfo.rangeFeet  5) return true;
            return rangeInfo.rangeFeet  10;
        },

        playProjectile(request, targetToken, resolvedSourceToken) {
            if (!this.isEnabled()) return false;
            const safeRequest = request  {};
            const payload = safeRequest.payload  {};
            const effectName = this.getProjectileEffectName();
            const forceProjectile = !!(payload.forceProjectileFx  safeRequest.forceProjectileFx);
            if (!effectName  (!forceProjectile && !this.isRangedProjectile(payload))) return false;
            const sourceTokenId = String(payload.casterTokenId  safeRequest.sourceTokenId  '').trim();
            const sourceToken = resolvedSourceToken  (sourceTokenId  R20.getTokenById(sourceTokenId)  null);
            if (forceProjectile) {
                const measured = R20.measureTokenCenterToTargetEdgeFeet(sourceToken, targetToken);
                if (measured.ok && measured.feet = 10) return false;
            }
            return this.spawnBetweenTokens(sourceToken, targetToken, effectName);
        },

        playDamageReceived(token, result) {
            if (!this.isEnabled()  !result  Math.max(0, Utils.toInt(result.totalDamage, 0)) = 0) return false;
            const isSavingThrowDamage = !!(result.save && result.save.used);
            const effectName = isSavingThrowDamage  this.getAreaHitEffectName()  this.getDirectHitEffectName();
            const color = isSavingThrowDamage
                 this.getEffectColor(this.getPrimaryDamageType(result))
                 'blood';
            return this.spawnAtToken(token, effectName, color);
        },

        playHealingReceived(token, mode, effectiveAmount) {
            if (!this.isEnabled()  Math.max(0, Utils.toInt(effectiveAmount, 0)) = 0) return false;
            const type = String(mode  '').trim().toLowerCase() === 'temp'  'temp healing'  'healing';
            return this.spawnTimedAtToken(token, 'sparkle', this.getEffectColor(type), 1000);
        },

        playConeBreath(request, payload, fallbackMarkerToken) {
            if (!this.isEnabled()) return false;
            const safeRequest = request  {};
            const safePayload = payload  safeRequest.payload  {};
            const areaInfo = safePayload.areaInfo && safePayload.areaInfo.isArea  safePayload.areaInfo  null;
            if (!areaInfo  !R20.isConeAreaShape(areaInfo.shape)) return false;
            const casterTokenId = String(safePayload.casterTokenId  safeRequest.sourceTokenId  '').trim();
            const casterToken = casterTokenId  R20.getTokenById(casterTokenId)  null;
            if (!casterToken) return false;
            const pieces = safeRequest.areaMarkerGroup && Array.isArray(safeRequest.areaMarkerGroup.pieces)
                 safeRequest.areaMarkerGroup.pieces.slice()
                 [];
            pieces.sort((a, b) = Utils.toInt(a && a.index, 0) - Utils.toInt(b && b.index, 0));
            const lastPiece = pieces.length  pieces[pieces.length - 1]  null;
            const lastMarker = lastPiece && lastPiece.id  R20.getTokenById(lastPiece.id)  fallbackMarkerToken;
            if (!lastMarker) return false;
            const color = this.getEffectColor(this.getPrimaryDamageType(safePayload));
            return this.spawnColoredBetweenPoints(casterToken, lastMarker, 'breath', color);
        },

        playLineBeam(request, payload, markerToken) {
            if (!this.isEnabled()) return false;
            const safeRequest = request  {};
            const safePayload = payload  safeRequest.payload  {};
            const areaInfo = safePayload.areaInfo && safePayload.areaInfo.isArea  safePayload.areaInfo  null;
            if (!areaInfo  !R20.isLineAreaShape(areaInfo.shape)) return false;
            const marker = markerToken  R20.findPlayerAreaMarker(safeRequest);
            if (!marker) return false;
            const casterTokenId = String(safePayload.casterTokenId  safeRequest.sourceTokenId  '').trim();
            const casterToken = casterTokenId  R20.getTokenById(casterTokenId)  null;
            const endpoints = R20.getLineMarkerStartEnd(marker, casterToken);
            if (!endpoints) return false;
            const color = this.getEffectColor(this.getPrimaryDamageType(safePayload));
            return this.spawnColoredBetweenCoordinates(
                endpoints.start,
                endpoints.end,
                R20.getTokenPageId(marker),
                'beam',
                color
            );
        },

        playSelfAreaNova(request, payload) {
            if (!this.isEnabled()) return false;
            const safeRequest = request  {};
            const safePayload = payload  safeRequest.payload  {};
            const areaInfo = safePayload.areaInfo && safePayload.areaInfo.isArea  safePayload.areaInfo  null;
            if (!areaInfo  !this.isSelfRange(safePayload)) return false;
            if (String(safeRequest.type  safePayload.type  '').trim().toLowerCase() === 'heal') return false;
            if (R20.isConeAreaShape(areaInfo.shape)) return this.playConeBreath(safeRequest, safePayload);
            if (R20.isLineAreaShape(areaInfo.shape)) return this.playLineBeam(safeRequest, safePayload);
            const casterTokenId = String(safePayload.casterTokenId  safeRequest.sourceTokenId  '').trim();
            const casterToken = casterTokenId  R20.getTokenById(casterTokenId)  null;
            if (!casterToken) return false;
            const color = this.getEffectColor(this.getPrimaryDamageType(safePayload));
            return this.spawnAtToken(casterToken, 'nova', color);
        },

        playThrownAreaExplosion(request, payload, markerToken) {
            if (!this.isEnabled()) return false;
            const safeRequest = request  {};
            const safePayload = payload  safeRequest.payload  {};
            const areaInfo = safePayload.areaInfo && safePayload.areaInfo.isArea  safePayload.areaInfo  null;
            if (!areaInfo  this.isSelfRange(safePayload)) return false;
            if (String(safeRequest.type  safePayload.type  '').trim().toLowerCase() === 'heal') return false;
            if (R20.isConeAreaShape(areaInfo.shape)) return this.playConeBreath(safeRequest, safePayload, markerToken);
            if (R20.isLineAreaShape(areaInfo.shape)) return this.playLineBeam(safeRequest, safePayload, markerToken);
            const color = this.getEffectColor(this.getPrimaryDamageType(safePayload));
            return this.spawnAtToken(markerToken, 'explode', color);
        }
    };

     -----------------------------------------------------------------------
      Render
      --------------------------------------------------------------------- 
    const Render = {
        getMessageCardStyle(type) {
            const bgColorByType = {
                normal { titleColor 'rgb(200, 200, 200)', borderColor CONFIG.DEFAULT_CARD_BORDER_COLOR },
                warning { titleColor 'rgb(230, 195, 60)', borderColor 'rgb(127, 127, 0)' },
                failure { titleColor 'rgb(225, 60, 60)', borderColor 'rgb(127, 0, 0)' },
                success { titleColor 'rgb(80, 220, 120)', borderColor 'rgb(0, 127, 0)' }
            };
            return bgColorByType[String(type  'normal').toLowerCase()]  bgColorByType.normal;
        },

        sendWhisperMessage(target, title, body, type) {
            const cardStyle = this.getMessageCardStyle(type  'normal');
            R20.whisper(target  'GM', Html.card({
                title title  META.NAME,
                body 'div style=font-size14px;margin0;line-height17px;' + String(body  '') + 'div',
                buildOptions { titleColor cardStyle.titleColor, borderColor cardStyle.borderColor }
            }));
        },

        sendPublicMessage(title, body, type, buildOptions) {
            const cardStyle = this.getMessageCardStyle(type  'normal');
            const options = Object.assign({ titleColor cardStyle.titleColor, borderColor cardStyle.borderColor }, buildOptions  {});
            R20.send(Html.card({
                title title  META.NAME,
                body 'div style=font-size14px;margin0;line-height17px;' + String(body  '') + 'div',
                buildOptions options
            }));
        },

        sendDamageResult(result, type) {
            this.sendPublicMessage(
                'Combat Log',
                this.buildDamageNarrative(result),
                type  (result && result.missed  'warning'  (result && result.noDamage  'warning'  'normal')),
                { titleHtml this.combatLogTitleHtml(result  {}, 'Combat Log') }
            );
        },

        sendHealResult(result, requestedBy) {
            result = result  {};
            const narrative = this.buildHealNarrative(result);
            const sourceName = String(result.sourceName  '').trim();
            const sourceAction = String(result.sourceAction  '').trim();
            const isManual = ^manual$i.test(sourceName)  ^manual(s+healing)$i.test(sourceAction);
            const title = result.mode === 'temp'  'Temporary HP'  'Healing';
            if (isManual) {
                const cardStyle = this.getMessageCardStyle('success');
                R20.whisper(requestedBy  'GM', Html.card({
                    title 'Combat Log',
                    body 'div style=font-size14px;margin0;line-height17px;' + narrative + 'div',
                    buildOptions {
                        titleColor cardStyle.titleColor,
                        borderColor cardStyle.borderColor,
                        titleHtml this.combatLogTitleHtml(result, title)
                    }
                }));
                return;
            }
            this.sendPublicMessage('Combat Log', narrative, 'success', { titleHtml this.combatLogTitleHtml(result, title) });
        },


        buildGmHealingSummaryCard(results, healingAmount) {
            const list = (Array.isArray(results)  results  []).filter((result) = result && result.ok && result.mode !== 'temp');
            const amount = Math.max(0, Utils.toInt(healingAmount, list.length  list[0].amount  0));
            const green = CONFIG.DEFAULT_TEXT_HEAL_COLOR;
            const red = 'rgb(220,95,95)';
            const titleHtml = 'div style=text-aligncenter;font-weight900;Healing &#128154; span style=color' + green + ';' + Utils.escapeHtml(String(amount)) + 'spandiv';
            const rows = list.map((result) = {
                const current = Math.max(0, Utils.toInt(result.previousHp, 0));
                const next = Math.max(0, Utils.toInt(result.currentHp, current));
                const currentColor = current = 0  red  'rgb(255,255,255)';
                const icon = this.titleTokenIconHtml(result.tokenImgsrc  '');
                const name = String(result.tokenName  'Token');
                return (
                    'table style=width100%;border-collapsecollapse;table-layoutfixed;margin0;padding0;tbodytr' +
                        'td style=width28px;text-alignleft;vertical-alignmiddle;padding1px 0;' + icon + 'td' +
                        'td style=text-alignleft;vertical-alignmiddle;padding1px 4px 1px 2px;color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-size12px;line-height15px;font-weight900;overflowhidden;white-spacenowrap;text-overflowellipsis;' + Utils.escapeHtml(name) + 'td' +
                        'td style=width116px;text-alignright;vertical-alignmiddle;padding1px 0;white-spacenowrap;font-size12px;line-height15px;font-weight900;' +
                            'span style=color' + currentColor + ';' + Utils.escapeHtml(String(current)) + 'span' +
                            'span style=colorrgb(205,205,205);padding0 3px;+span' +
                            'span style=color' + green + ';' + Utils.escapeHtml(String(amount)) + 'span' +
                            'span style=colorrgb(205,205,205);padding0 3px;=span' +
                            'span style=color' + green + ';' + Utils.escapeHtml(String(next)) + 'span' +
                        'td' +
                    'trtbodytable'
                );
            }).join('');
            const cardStyle = this.getMessageCardStyle('success');
            return Html.card({
                title 'Healing',
                body rows  'div style=text-aligncenter;colorrgb(170,170,170);font-size11px;No healing was applied.div',
                buildOptions {
                    titleColor cardStyle.titleColor,
                    borderColor cardStyle.borderColor,
                    titleHtml,
                    bodyAlign 'left'
                }
            });
        },

        sendGmHealingSummary(results, healingAmount, requestedBy) {
            R20.whisper(requestedBy  'GM', this.buildGmHealingSummaryCard(results, healingAmount));
        },

        getDamageTypeIcon(type) {
            const key = CombatService.normalizeDamageType(type);
            return CONFIG.DAMAGE_TYPE_ICONS[key]  CONFIG.DAMAGE_TYPE_ICONS.normal;
        },

        getDamageTypeColor(type) {
            const key = CombatService.normalizeDamageType(type);
            return CONFIG.DAMAGE_TYPE_COLORS[key]  CONFIG.DEFAULT_DAMAGE_TYPE_COLOR;
        },

        queryOptionsWithDefault(label, defaultValue, options) {
            const safeLabel = Utils.attrSafe(label  'Value');
            const normalizedDefault = String(defaultValue  '').trim().toLowerCase();
            const safeOptions = (Array.isArray(options)  options  [])
                .map((entry) = {
                    if (Array.isArray(entry)) return { label String(entry[0]  ''), value String(entry[1]  entry[0]  '') };
                    return { label String(entry  ''), value String(entry  '') };
                })
                .filter((entry) = entry.value);
            const ordered = [];
            const seen = Object.create(null);
            const addOption = (entry) = {
                const value = String(entry && entry.value  '').trim();
                if (!value) return;
                const key = value.toLowerCase();
                if (seen[key]) return;
                seen[key] = true;
                ordered.push(String(entry.label  value) + ',' + value);
            };
            const defaultEntry = safeOptions.find((entry) = String(entry.value  '').trim().toLowerCase() === normalizedDefault);
            if (defaultEntry) addOption(defaultEntry);
            safeOptions.forEach(addOption);
            return '&#63;{' + safeLabel + '' + ordered.map(Utils.attrSafe).join('') + '}';
        },

        damageTypeQuery(defaultType) {
            return this.queryOptionsWithDefault('Damage Type', CombatService.normalizeDamageType(defaultType  'normal'), [
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

        playerAreaFooterHtml(targetCount, areaInfo) {
            const count = Math.max(0, Utils.toInt(targetCount, 0));
            const label = areaInfo && areaInfo.label  String(areaInfo.label)  'Area';
            return 'span style=colorrgb(105,220,120);font-weight900;' + Utils.escapeHtml(String(count)) + 'span ' +
                'Targets found in a ' +
                'span style=colorrgb(235,205,75);font-weight900;' + Utils.escapeHtml(label) + 'span, ' +
                'use this button once per target.';
        },

        playerAreaMarkerFooterHtml(areaInfo, payload) {
            const options = payload && Array.isArray(payload.areaOptions) && payload.areaOptions.length
                 payload.areaOptions
                 (areaInfo && Array.isArray(areaInfo.options)  areaInfo.options  []);
            if (options.length  1) {
                const labels = options.map((entry) = String(entry && (entry.label  entry.shape)  'Area')).filter(Boolean);
                return 'Multiple area choices detected span style=colorrgb(235,205,75);font-weight900;' +
                    Utils.escapeHtml(labels.join(' or ')) +
                    'span. Delete the marker you will not use. Roll works only when exactly one area remains.';
            }
            const label = areaInfo && areaInfo.label  String(areaInfo.label)  'Area';
            const rangeInfo = RuntimeConfig.get('PLAYER_ACTION_RANGE_CHECK')  CombatService.getAreaMarkerRangeInfo(payload  {})  { ok false };
            const rangeText = rangeInfo.ok && rangeInfo.limited  (String(rangeInfo.rangeFeet) + ' ft')  '';
            return 'Move the ' +
                'span style=colorrgb(235,205,75);font-weight900;' + Utils.escapeHtml(label) + 'span marker' +
                (rangeText  (' within span style=colorrgb(235,205,75);font-weight900;' + Utils.escapeHtml(rangeText) + 'span')  '') +
                ', then press Roll.';
        },

        playerSingleTargetFooterHtml(payloadOrRangeText) {
            if (!RuntimeConfig.get('PLAYER_ACTION_RANGE_CHECK')) {
                return 'Single Use Button. Press the button, then choose a target when Roll20 asks.';
            }
            const isPayload = payloadOrRangeText && typeof payloadOrRangeText === 'object';
            const rangeText = isPayload
                 CombatService.getRangeTextForFooter(payloadOrRangeText)
                 '';
            if (rangeText) {
                return 'Single Use Button. Select a target within span style=colorrgb(235,205,75);font-weight900;' + Utils.escapeHtml(rangeText) + 'span.';
            }
            const range = Utils.cleanRoll20Label(isPayload  ''  (payloadOrRangeText  ''));
            const rangeInfo = CombatService.parseActionRangeFeet(range);
            if (rangeInfo.ok && rangeInfo.limited) {
                return 'Single Use Button. Select a target within span style=colorrgb(235,205,75);font-weight900;' + Utils.escapeHtml(String(rangeInfo.rangeFeet)) + ' ftspan.';
            }
            return 'Single Use Button. Press the button, then choose a target when Roll20 asks.';
        },

        saveAbilityQuery(defaultAbility) {
            const normalized = CombatService.normalizeAbilityName(defaultAbility  '');
            return this.queryOptionsWithDefault('Save', normalized  'no', [
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
            return String(command  '#').replace(g, '&quot;').replace([rn]+g, ' ');
        },

        iconButtonHtml(buildOptions) {
            const options = buildOptions  {};
            const iconHtml = String(options.iconHtml  options.icon  '&#9679;');
            const label = String(options.label  options.text  'BTN');
            const command = this.sanitizeCommand(options.command  options.callback  '#');
            const width = Math.max(1, Utils.toInt(options.width, 40));
            const height = Math.max(1, Utils.toInt(options.height, 40));
            const iconSize = Math.max(1, Utils.toInt(options.iconSize, 18));
            const labelSize = Math.max(1, Utils.toInt(options.labelSize, 12));
            const labelHeight = Math.max(1, Utils.toInt(options.labelHeight, 13));
            const labelLineHeight = Math.max(1, Utils.toInt(options.labelLineHeight, 12));
            const backgroundColor = String(options.backgroundColor  'rgba(55,55,55,0.95)');
            const borderColor = String(options.borderColor  'rgba(255,255,255,0.75)');
            const textColor = String(options.textColor  'rgb(255,255,255)');
            const margin = String(options.margin  '0 1px');
            const paddingTop = Math.max(0, Utils.toInt(options.paddingTop, 5));
            const labelPaddingTop = Math.max(0, Utils.toInt(options.labelPaddingTop, 0));
            const labelWhiteSpace = options.labelNoWrap  'nowrap'  'normal';
            const safeTooltip = String(options.tooltip  '').trim();
            const titleAttr = safeTooltip  (' title=' + Utils.attrSafe(safeTooltip) + '')  '';
            return (
                'a href=' + command + '' + titleAttr + ' style=' +
                    'displayinline-block;width' + width + 'px;height' + height + 'px;min-width' + width + 'px;' +
                    'box-sizingborder-box;text-aligncenter;text-decorationnone;border1px solid ' + borderColor + ';border-radius' + String(options.borderRadius  '4px') + ';' +
                    'background' + backgroundColor + ';color' + textColor + ';font-familyArial,Helvetica,sans-serif;overflowhidden;vertical-alignmiddle;margin' + margin + ';padding' + paddingTop + 'px 0 0 0;' +
                '' +
                    'strongspan style=displayblock;height20px;line-height19px;font-size' + iconSize + 'px;text-aligncenter;' + iconHtml + 'spanstrong' +
                    'strongspan style=displayblock;height' + labelHeight + 'px;line-height' + labelLineHeight + 'px;padding' + labelPaddingTop + 'px;font-size' + labelSize + 'px;text-aligncenter;white-space' + labelWhiteSpace + ';' + Utils.escapeHtml(label) + 'spanstrong' +
                'a'
            );
        },

        areaRollControlButtons(buildOptions) {
            const options = buildOptions  {};
            const actionId = String(options.actionId  '').trim();
            const casterTokenId = String(options.casterTokenId  '').trim();
            const buttons = [this.iconButtonHtml({
                iconHtml '&#127922;',
                label 'Roll',
                command options.rollCommand  ('!combatAssistant usearea ' + Utils.attrSafe(actionId)),
                backgroundColor 'rgba(120,40,40,0.95)',
                tooltip options.rollTooltip  'Move the area marker, then roll every token inside it'
            })];
            if (options.isConcentration && casterTokenId) {
                buttons.push(this.iconButtonHtml({
                    iconHtml '&#9201;&#65039;',
                    label 'End',
                    command '!combatAssistant conend ' + Utils.attrSafe(casterTokenId) + ' ' + Utils.attrSafe(actionId),
                    backgroundColor 'rgba(80,80,80,0.95)',
                    tooltip options.endTooltip  'End concentration and remove the area marker'
                }));
            }
            return buttons;
        },

        iconButtonTableHtml(buttons, options) {
            options = options  {};
            const safeButtons = Array.isArray(buttons)  buttons.filter(Boolean)  [];
            const columns = Math.max(1, Utils.toInt(options.columns  safeButtons.length  1, 1));
            const footer = String(options.footer  '').trim();
            const footerHtml = String(options.footerHtml  '').trim();
            const colWidth = 100  columns;
            const rows = [];
            for (let i = 0; i  safeButtons.length; i += columns) {
                const cells = [];
                for (let c = 0; c  columns; c += 1) {
                    const button = safeButtons[i + c];
                    cells.push('td style=width' + colWidth + '%;text-aligncenter;vertical-alignmiddle;padding2px 4px;' + (button  '') + 'td');
                }
                rows.push('tr' + cells.join('') + 'tr');
            }
            return (
                'table style=width100%;border-collapsecollapse;table-layoutfixed;tbody' + rows.join('') + 'tbodytable' +
                (footerHtml  footer  'div style=padding-top5px;colorrgb(170,170,170);font-size10px;line-height12px;text-aligncenter;' + (footerHtml  Utils.escapeHtml(footer)) + 'div'  '')
            );
        },

        rollBadgeHtml(roll, marker, options) {
            options = options  {};
            roll = roll  {};
            const natural = Utils.toInt(roll.natural, 0);
            const total = Utils.toInt(roll.total, natural);
            const displayMarker = natural === 1  '&#128165;'  marker;
            const isCritical = !!roll.critical  displayMarker === '&#9733;';
            const isNaturalOne = natural === 1;
            const isDimmed = !!roll.dimmed && !isCritical && !isNaturalOne;
            const hasSuccessState = roll.success === true  roll.success === false;
            const bgColor = isCritical
                 'rgba(70,150,90,0.30)'
                 (isNaturalOne  'rgba(165,45,45,0.30)'  (isDimmed  'rgba(55,55,55,0.30)'  (hasSuccessState  (roll.success  'rgba(70,150,90,0.30)'  'rgba(165,45,45,0.30)')  (options.bgColor  'rgba(55,55,55,0.95)'))));
            const borderColor = options.borderColor  (isCritical  'rgb(60,255,110)'  (isNaturalOne  'rgb(255,60,60)'  (isDimmed  'rgba(255,255,255,0.35)'  (hasSuccessState  (roll.success  'rgba(100,230,130,0.85)'  'rgba(230,80,80,0.85)')  'rgba(255,255,255,0.75)'))));
            const rollStyle = CONFIG.ROLL_CARD_STYLE  {};
            const size = Math.max(18, Utils.toInt(options.size, 40));
            const fontSize = String(options.fontSize  rollStyle.fontSize  '20px');
            const modifier = Utils.toInt(roll.modifier, 0);
            const tooltip = roll.tooltip  ('Roll [1d20] = [ ' + String(natural) + ' ]');
            const markerColor = displayMarker === '&#9650;'  displayMarker === '&#9733;'  'rgb(90,220,120)'  'rgb(230,80,80)';
            const markerTop = displayMarker === '&#9733;'  displayMarker === '&#128165;'  '0px'  '-3px';
            const markerSize = displayMarker === '&#9733;'  '12px'  (displayMarker === '&#128165;'  '11px'  '10px');
            const textColor = isDimmed  'rgb(145,145,145)'  (rollStyle.color  'rgb(255,255,255)');
            return Html.div(
                Html.tooltip(
                    Html.div(
                        Utils.escapeHtml(String(total)) +
                        (displayMarker  Html.span(displayMarker, 'positionabsolute;top' + markerTop + ';right2px;font-size' + markerSize + ';line-height10px;color' + markerColor + ';font-weight900;')  ''),
                        'positionrelative;width' + size + 'px;height' + size + 'px;line-height' + size + 'px;text-aligncenter;border1px solid ' + borderColor + ';border-radius4px;background' + bgColor + ';font-family' + (rollStyle.fontFamily  'Arial, Helvetica, sans-serif') + ';font-size' + fontSize + ';font-weight' + (rollStyle.fontWeight  '900') + ';color' + textColor + ';'
                    ),
                    tooltip
                ),
                'displayinline-block;width' + (size + 2) + 'px;text-aligncenter;vertical-alignmiddle;'
            );
        },

        savingThrowBadgesHtml(roll, ability) {
            roll = roll  {};
            const modifier = Utils.toInt(roll.modifier, 0);
            const mode = String(roll.mode  'normal').toLowerCase();
            const rolls = (Array.isArray(roll.rolls) && roll.rolls.length  roll.rolls  [roll.natural])
                .map((value) = Utils.toInt(value, 0));
            const chosen = mode === 'advantage'
                 Math.max.apply(null, rolls)
                 (mode === 'disadvantage'  Math.min.apply(null, rolls)  Utils.toInt(roll.natural, 0));
            let chosenUsed = false;
            const badges = rolls.map((natural) = {
                const isChosen = !chosenUsed && natural === chosen;
                if (isChosen) chosenUsed = true;
                const total = natural + modifier;
                const marker = isChosen && mode === 'advantage'  '&#9650;'  (isChosen && mode === 'disadvantage'  '&#9660;'  '');
                return this.rollBadgeHtml({
                    natural,
                    total,
                    modifier,
                    success !!roll.success,
                    dimmed rolls.length  1 && !isChosen,
                    tooltip ability + ' SavebrRoll ' + String(natural) + 'brModifier ' + Utils.formatSigned(modifier) + 'brTotal ' + String(total) + 'brDC ' + String(roll.dc) + (mode !== 'normal'  ('brMode ' + mode)  '') + (roll.rollModeReason  ('brReason ' + Utils.escapeHtml(String(roll.rollModeReason)))  '')
                }, marker, { size 34, fontSize '18px' });
            }).reverse().join('');
            return 'div style=displayinline-block;text-alignright;white-spacenowrap;' + badges + 'div';
        },

        numericRollBoxHtml(total, tooltip, options) {
            options = options  {};
            return this.rollBadgeHtml({
                natural Utils.toInt(total, 0),
                total Utils.toInt(total, 0),
                tooltip String(tooltip  'Roll total ' + String(total  0)),
                success options.success
            }, options.marker  '', { size options.size  40, fontSize options.fontSize  '20px' });
        },

        attackPromptTitleHtml(result) {
            result = result  {};
            const imgsrc = String(result.tokenImgsrc  '').trim();
            const character = R20.getCharacterByName(result.characterName  result.tokenName  '');
            const avatar = character && Utils.isFunction(character.get)  String(character.get('avatar')  '').trim()  '';
            const imgHtml = this.chatTokenImageHtml(imgsrc, 24, avatar, 3)  'span style=displayblock;width24px;height24px;span';
            const damageRolls = Array.isArray(result.damageRolls) && result.damageRolls.length
                 result.damageRolls
                 (Array.isArray(result.attackDamageRolls) && result.attackDamageRolls.length
                     result.attackDamageRolls
                     [{ damageType result.damageType  'normal' }]);
            const damageTypes = [];
            damageRolls.forEach((roll) = {
                const type = CombatService.normalizeDamageType(roll && roll.damageType  result.damageType  'normal');
                if (type && damageTypes.indexOf(type)  0) damageTypes.push(type);
            });
            if (!damageTypes.length) damageTypes.push(CombatService.normalizeDamageType(result.damageType  'normal'));
            const visibleDamageTypes = damageTypes.slice(0, 2);
            const firstDamageType = visibleDamageTypes[0]  'normal';
            const damageIconSlots = [null, null];
            if (visibleDamageTypes.length === 1) {
                damageIconSlots[1] = visibleDamageTypes[0];
            } else if (visibleDamageTypes.length = 2) {
                damageIconSlots[0] = visibleDamageTypes[0];
                damageIconSlots[1] = visibleDamageTypes[1];
            }
            const damageIconCells = damageIconSlots.map((type) = {
                const icon = type  (this.getDamageTypeIcon(type)  '&#9679;')  '';
                const tooltip = type  Utils.attrSafe(type)  '';
                return 'td' + (tooltip  (' title=' + tooltip + '')  '') + ' style=width12px;height12px;padding0;text-aligncenter;vertical-alignmiddle;font-size11px;line-height12px;font-weight900;white-spacenowrap;' + icon + 'td';
            }).join('');
            const isSaveAttack = Utils.toBoolean(result.isSaveAttack, false)  !!result.saveAbility;
            const challengeValue = isSaveAttack  (result.saveDc  result.attackTotal  0)  (result.attackTotal  result.saveDc  0);
            const damageValue = result.damageTotal  result.healTotal  0;
            const topTooltip = isSaveAttack
                 ((CombatService.abilityNameToShortLabel(result.saveAbility  '')  'SAVE') + ' Saving Throw DC ' + String(challengeValue))
                 'Attack Roll';
            return (
                'table style=width100%;border-collapsecollapse;table-layoutfixed;' +
                    'tbodytr' +
                        'td style=width28px;text-alignleft;vertical-alignmiddle;padding0;' + imgHtml + 'td' +
                        'td style=text-aligncenter;vertical-alignmiddle;font-size17px;line-height19px;font-weight900;white-spacenormal;' + Utils.escapeHtml(String(result.attackName  'Attack')) + 'td' +
                        'td style=width28px;text-alignright;vertical-alignmiddle;padding0;' +
                            'table style=width24px;height24px;border-collapsecollapse;table-layoutfixed;margin-leftauto;tbody' +
                                'tr' +
                                    'td style=width12px;height12px;padding0;td' +
                                    'td title=' + Utils.attrSafe(topTooltip) + ' style=width12px;height12px;padding0;text-aligncenter;vertical-alignmiddle;font-size11px;line-height12px;font-weight900;white-spacenowrap;colorrgb(230,80,80);&#128165;td' +
                                'tr' +
                                'tr' + damageIconCells + 'tr' +
                            'tbodytable' +
                        'td' +
                        'td style=width10%;text-alignright;vertical-alignmiddle;padding0;' +
                            'table style=width100%;height24px;border-collapsecollapse;table-layoutfixed;tbody' +
                                'trtd style=height12px;padding0;text-alignright;vertical-alignmiddle;font-size11px;line-height12px;font-weight900;white-spacenowrap;colorrgb(255,255,255);' + Utils.escapeHtml(String(challengeValue)) + 'tdtr' +
                                'trtd style=height12px;padding0;text-alignright;vertical-alignmiddle;font-size11px;line-height12px;font-weight900;white-spacenowrap;color' + this.getDamageTypeColor(firstDamageType) + ';' + Utils.escapeHtml(String(damageValue)) + 'tdtr' +
                            'tbodytable' +
                        'td' +
                    'trtbody' +
                'table'
            );
        },

        showAttackDamagePrompt(result) {
            result = result  {};
            if (result.effectType === 'healing'  result.isHealing) {
                const healAmount = Math.max(0, Utils.toInt(result.healTotal  result.damageTotal, 0));
                const isTempHealing = Utils.toBoolean(result.isTempHealing, false)  String(result.healMode  '').toLowerCase() === 'temp';
                const payload = Utils.encodeJsonPayload({
                    type 'heal',
                    mode isTempHealing  'temp'  'hp',
                    amount healAmount,
                    sourceName String(result.tokenName  result.characterName  'Caster'),
                    sourceAction String(result.attackName  'Healing'),
                    sourceImgsrc String(result.tokenImgsrc  '')
                });
                const healButton = this.iconButtonHtml({
                    iconHtml isTempHealing  '&#128151;'  '&#128154;',
                    label isTempHealing  'Temp'  'Heal',
                    command '!combatAssistant heal ' + payload,
                    backgroundColor 'rgba(20,115,55,0.95)',
                    tooltip isTempHealing  'Apply temporary HP to selected token bar(s)'  'Apply healing to selected token bar(s)'
                });
                const editButton = this.iconButtonHtml({
                    iconHtml '&#9997;&#127995;',
                    label 'Edit',
                    command '!combatAssistant heal manual &#63;{Heal TypeHP,hpTemp,temp} &#63;{Healing' + String(healAmount) + '}',
                    backgroundColor 'rgba(55,55,55,0.95)',
                    tooltip 'Edit healing amount'
                });
                const body = this.iconButtonTableHtml([healButton, editButton], { columns 2, footer 'Select target token(s) before pressing any button.' });
                return Html.card({
                    title META.NAME,
                    body,
                    buildOptions { titleHtml this.attackPromptTitleHtml(Object.assign({}, result, { damageTotal healAmount, damageType isTempHealing  'temp healing'  'healing', attackTotal 0 })) }
                });
            }

            const damageRolls = Array.isArray(result.damageRolls) && result.damageRolls.length
                 result.damageRolls
                 [{ total result.damageTotal, damageType result.damageType  'normal', formula result.damageFormula  'Roll20' }];
            const primaryDamage = damageRolls[0]  {};
            const challenge = Math.max(0, Utils.toInt(result.saveDc  result.attackTotal, 0));
            const saveAbility = CombatService.normalizeAbilityName(result.saveAbility  '');
            const attackPayload = Utils.encodeJsonPayload({
                type 'damage',
                mode result.isSaveAttack  saveAbility  'save'  'attack',
                challenge,
                attackNatural Math.max(0, Utils.toInt(result.attackNatural, 0)),
                isCritical !!result.isCritical,
                saveAbility,
                halfOnSuccess !!result.halfOnSuccess,
                halfOnSuccessKnown !!result.halfOnSuccessKnown,
                damageRolls,
                sourceName String(result.tokenName  result.characterName  ''),
                sourceAction String(result.attackName  ''),
                sourceImgsrc String(result.tokenImgsrc  ''),
                rangeText String(result.rangeText  result.range  ''),
                durationText String(result.durationText  result.duration  ''),
                isSpellAction !!result.isSpellAction,
                isConcentration !!result.isConcentration,
                lightInfo result.lightInfo && result.lightInfo.hasLight  result.lightInfo  { hasLight false },
                areaInfo result.areaInfo && result.areaInfo.isArea  result.areaInfo  { isArea false },
                areaOptions result.areaOptions  R20.getAreaInfoOptions(result.areaInfo)
            });
            const hitPayload = Utils.encodeJsonPayload({
                type 'damage',
                mode 'direct',
                challenge 0,
                saveAbility '',
                damageRolls,
                sourceName String(result.tokenName  result.characterName  ''),
                sourceAction String(result.attackName  ''),
                sourceImgsrc String(result.tokenImgsrc  '')
            });
            const missPayload = Utils.encodeJsonPayload({
                type 'damage',
                mode 'miss',
                forceMiss true,
                damageRolls [{ total 0, damageType 'normal' }],
                sourceName String(result.tokenName  result.characterName  ''),
                sourceAction String(result.attackName  ''),
                sourceImgsrc String(result.tokenImgsrc  '')
            });
            const attackButton = this.iconButtonHtml({
                iconHtml result.isSaveAttack  saveAbility  '&#127922;'  '&#9876;&#65039;',
                label result.isSaveAttack  saveAbility  (CombatService.abilityNameToShortLabel(saveAbility)  'SAVE')  'Atk',
                command '!combatAssistant deal ' + attackPayload + ((result.isSaveAttack  saveAbility) && RuntimeConfig.get('SHEET_2014_CA_ROLLS')
                     ' &#63;{2014 Roll ModeNormal,normalAdvantage,advantageDisadvantage,disadvantage}'
                     ''),
                backgroundColor 'rgba(45,45,45,0.95)',
                tooltip result.isSaveAttack  saveAbility  'Roll selected target save and apply damage'  'Apply damage only if attack hits selected target AC'
            });
            const hitButton = this.iconButtonHtml({
                iconHtml '&#128165;',
                label 'Hit',
                command '!combatAssistant deal ' + hitPayload,
                backgroundColor 'rgba(120,40,40,0.95)',
                tooltip 'Apply damage directly to selected token(s)'
            });
            const missButton = this.iconButtonHtml({
                iconHtml '&#128683;',
                label 'Miss',
                command '!combatAssistant deal ' + missPayload,
                backgroundColor 'rgba(80,135,85,0.65)',
                tooltip 'No damage'
            });
            const editButton = this.iconButtonHtml({
                iconHtml '&#9997;&#127995;',
                label 'Edit',
                command '!combatAssistant deal manual &#63;{Damage' + String(Math.max(0, Utils.toInt(result.damageTotal  primaryDamage.total, 0))) + '} ' +
                    this.damageTypeQuery(primaryDamage.damageType  result.damageType  'normal') + ' ' +
                    '&#63;{DC' + String(challenge  0) + '} ' +
                    this.saveAbilityQuery(saveAbility  'no') + ' ' +
                    this.queryOptionsWithDefault('Half on Success', result.halfOnSuccess  'yes'  'no', [['No', 'no'], ['Yes', 'yes']]),
                backgroundColor 'rgba(45,45,45,0.95)',
                tooltip 'Edit damage manually'
            });
            const buttons = [attackButton, hitButton, missButton, editButton];
            const areaInfo = result.areaInfo && result.areaInfo.isArea  result.areaInfo  null;
            const npcSetEligible = !!result.npcSetEligible;
            const npcSetPayload = npcSetEligible  Utils.encodeJsonPayload(Object.assign({}, Utils.decodeJsonPayload(attackPayload, {}), {
                sourceName String(result.tokenName  result.characterName  ''),
                sourceAction String(result.attackName  ''),
                sourceImgsrc String(result.tokenImgsrc  '')
            }))  '';
            if (npcSetEligible && areaInfo && RuntimeConfig.get('PLAYER_TOKEN_AREA_MARK')) {
                buttons.push(this.iconButtonHtml({
                    iconHtml '&#127922;',
                    label 'Source',
                    command '!combatAssistant npcarea ' + npcSetPayload + ' &#64;{targetSourcetoken_id}',
                    labelSize 8,
                    labelNoWrap true,
                    backgroundColor 'rgba(95,55,135,0.95)',
                    tooltip 'Set an NPC area attack choose source, move the marker, then roll'
                }));
            } else if (npcSetEligible) {
                buttons.push(this.iconButtonHtml({
                    iconHtml '&#9876;&#65039;',
                    label 'AtkFX',
                    command '!combatAssistant npcset ' + npcSetPayload + ' &#64;{targetSourcetoken_id} &#64;{targetTargettoken_id}',
                    labelSize 9,
                    labelNoWrap true,
                    backgroundColor 'rgba(95,55,135,0.95)',
                    tooltip 'Set an NPC attack choose source, then target'
                }));
            }
            const footer = buttons.length  4
                 (areaInfo
                     'Select target token(s), or use Source to choose the NPC source and place an area marker.'
                     'Select target token(s), or use AtkFX to choose an NPC source and target.')
                 'Select target token(s) before pressing any button.';
            const body = this.iconButtonTableHtml(buttons, { columns Math.min(buttons.length, 5), footer });
            return Html.card({
                title META.NAME,
                body,
                buildOptions { titleHtml this.attackPromptTitleHtml(result) }
            });
        },

        compactSettingButtonHtml(buildOptions) {
            const options = buildOptions  {};
            const buttonH = Math.max(1, Utils.toInt(options.height, 8));
            const buttonW = Math.max(1, Utils.toInt(options.width, 24));
            const command = this.sanitizeCommand(options.command  '#');
            const label = Utils.escapeHtml(String(options.label === undefined  options.label === null  ''  options.label));
            const tooltip = String(options.tooltip  '').trim();
            const fontSize = Math.max(1, Utils.toInt(options.fontSize, 10))
            return (
                'a href=' + command + '' +
                (tooltip  (' title=' + Utils.attrSafe(tooltip) + '')  '') +
                ' style=' +
                'displayinline-flex;' +
                'align-itemscenter;' +
                'justify-contentcenter;' +
                'width' + buttonW + 'px;' +
                'height' + buttonH + 'px;' +
                'line-height1;' +
                'text-aligncenter;' +
                'text-decorationnone;' +
                'border1px solid rgba(255,255,255,0.65);' +
                'border-radius4px;' +
                'colorrgb(255,255,255);' +
                'font-size' + fontSize + 'px;' +
                'font-weight900;' +
                'box-sizingborder-box;' +
                'background' + String(options.backgroundColor  'rgba(0,105,160,0.95)') + ';' +
                    label +
                'a'
            );
        },

        turnActionButtonHtml(tokenId, label, action, options) {
            const opts = options  {};
            const safeTokenId = String(tokenId  '').trim();
            const safeAction = String(action  '').trim().toLowerCase();
            const command = safeAction === 'combat'
                 ('!combatAssistant combat ' + Utils.attrSafe(safeTokenId))
                 (safeAction === 'spells'
                     ('!combatAssistant spells ' + Utils.attrSafe(safeTokenId))
                     ('!combatAssistant ' + safeAction));
            return this.compactSettingButtonHtml({
                label String(label  ''),
                command,
                tooltip String(opts.tooltip  label  '').trim(),
                width Math.max(24, Utils.toInt(opts.width, 38)),
                height Math.max(1, Utils.toInt(opts.height, 8)),
                backgroundColor String(opts.backgroundColor  'rgba(45,45,45,0.95)')
            });
        },

        buildTurnActionsHtml(info, options) {
            if (!RuntimeConfig.get('HANDLE_ACTIONS')  !info  !info.tokenId) return '';
            const buttons = [
                this.turnActionButtonHtml(info.tokenId, 'Dash', 'dash', { tooltip 'Take the Dash action', backgroundColor 'rgba(45,45,45,0.95)' }),
                this.turnActionButtonHtml(info.tokenId, 'Disen.', 'disengage', { tooltip 'Take the Disengage action', backgroundColor 'rgba(45,45,45,0.95)' }),
                this.turnActionButtonHtml(info.tokenId, 'Dodge', 'dodge', { tooltip 'Take the Dodge action', backgroundColor 'rgba(45,45,45,0.95)' }),
                this.turnActionButtonHtml(info.tokenId, 'Combat', 'combat', { tooltip 'List attacks from this character sheet', backgroundColor 'rgba(105,35,35,0.95)' }),
                this.turnActionButtonHtml(info.tokenId, 'Spells', 'spells', { tooltip 'Open combat spells', backgroundColor 'rgba(65,55,120,0.95)' })
            ];
            return 'div style=text-aligncenter;white-spacenowrap;line-heightnormal;' +
                buttons.map((button, index) = (index  'span style=displayinline-block;width3px;height1px;span'  '') + button).join('') +
            'div';
        },

        attackDamageButtonHtml(attack) {
            const damage = attack && Array.isArray(attack.damage) && attack.damage.length  attack.damage[0]  null;
            if (!damage) {
                return 'span title=No damage formula found style=displayinline-flex;align-itemscenter;justify-contentcenter;width40px;height40px;box-sizingborder-box;border1px solid rgba(255,255,255,0.45);border-radius4px;backgroundrgba(55,55,55,0.75);colorrgb(165,165,165);font-size9px;line-height10px;text-aligncenter;vertical-alignmiddle;-span';
            }
            const formula = String(damage.formula  '-').trim()  '-';
            const damageType = String(damage.damageType  'Damage').trim()  'Damage';
            const allDamage = (attack.damage  []).map((entry) = String(entry.formula  '-') + (entry.damageType  (' ' + entry.damageType)  '')).join(' + ');
            return 'span title=' + Utils.attrSafe(allDamage) + ' style=displayinline-block;width40px;height40px;box-sizingborder-box;border1px solid rgba(255,255,255,0.55);border-radius4px;backgroundrgba(95,45,45,0.92);colorrgb(255,255,255);text-aligncenter;vertical-alignmiddle;overflowhidden;font-familyArial,Helvetica,sans-serif;' +
                'strongspan style=displayblock;height21px;line-height21px;font-size10px;white-spacenowrap;overflowhidden;' + Utils.escapeHtml(formula) + 'spanstrong' +
                'span style=displayblock;height17px;line-height14px;padding0 1px;font-size8px;white-spacenowrap;overflowhidden;' + Utils.escapeHtml(damageType) + 'span' +
            'span';
        },

        attackRollButtonHtml(attack) {
            const bonus = String(attack && attack.attackBonusLabel  '+0');
            const command = this.sanitizeCommand(attack && attack.rollCommand  '#');
            const breakdown = String(attack && attack.attackBreakdown  bonus);
            return 'a href=' + command + ' title=' + Utils.attrSafe(breakdown) + ' style=displayinline-block;width40px;height40px;box-sizingborder-box;text-aligncenter;text-decorationnone;border1px solid rgba(255,255,255,0.75);border-radius4px;backgroundrgba(0,105,160,0.95);colorrgb(255,255,255);font-familyArial,Helvetica,sans-serif;overflowhidden;vertical-alignmiddle;' +
                'strongspan style=displayblock;height27px;line-height27px;font-size17px;text-aligncenter;' + Utils.escapeHtml(bonus) + 'spanstrong' +
                'strongspan style=displayblock;height12px;line-height10px;font-size9px;text-aligncenter;Rollspanstrong' +
            'a';
        },

        combatAttackDamageEntries(attack) {
            return attack && Array.isArray(attack.damage)
                 attack.damage.filter((entry) = {
                    if (!entry) return false;
                    const formula = String(entry.formula  '').trim();
                    if (!formula) return false;
                    const compact = formula.replace(s+g, '').toLowerCase();
                    if (compact === '-'  compact === '0'  ^0(.0+)$.test(compact)  ^0dd+([+-]0+)$.test(compact)) return false;
                    return true;
                })
                 [];
        },

        combatAttackHasDamage(attack) {
            return !!(this.combatAttackDamageEntries(attack).length && String(attack && attack.damageCommand  '').trim());
        },

        combatAttackDamageButtonHtml(attack) {
            const damageEntries = this.combatAttackDamageEntries(attack);
            const command = String(attack && attack.damageCommand  '').trim();
            if (!damageEntries.length  !command) return '';
            const allDamage = damageEntries.map((entry) = {
                const formula = String(entry.formula  '').trim();
                const damageType = String(entry.damageType  'Damage').trim()  'Damage';
                return formula + ' ' + damageType;
            }).join('  ');
            const visible = damageEntries.slice(0, 2);
            const multiple = visible.length  1;
            const rows = visible.map((entry) = {
                const formula = String(entry.formula  '').trim();
                const damageType = String(entry.damageType  'Damage').trim()  'Damage';
                const icon = this.getDamageTypeIcon(damageType)  '&#128171;';
                return 'span style=displayblock;width48px;height' + (multiple  '12px'  '23px') + ';line-height' + (multiple  '12px'  '21px') + ';padding-top' + (multiple  '0'  '2px') + ';font-size10px;font-weight900;white-spacenowrap;overflowhidden;text-aligncenter;box-sizingborder-box;' +
                    'b' + Utils.escapeHtml(formula) + '&nbsp;' + icon + 'b' +
                'span';
            }).join('');
            const style = 'displayblock;width50px;height25px;min-width50px;min-height25px;padding0;margin0;box-sizingborder-box;border1px solid rgba(255,255,255,0.55);border-radius4px;backgroundrgba(85,20,20,0.70);colorrgb(255,255,255);text-aligncenter;vertical-alignmiddle;overflowhidden;font-familyArial,Helvetica,sans-serif;text-decorationnone;';
            return 'a href=' + Utils.attrSafe(command) + ' title=' + Utils.attrSafe('Roll damage ' + allDamage) + ' style=' + style + '' + rows + 'a';
        },

        combatAttackRollButtonHtml(attack) {
            const bonus = String(attack && attack.attackBonusLabel  '+0');
            const numericBonus = Math.abs(Utils.toInt(attack && attack.attackBonus, Utils.toInt(bonus, 0)));
            const bonusFontSize = numericBonus  9  14  16;
            const saveDc = Math.max(0, Utils.toInt(attack && attack.saveDc, 0));
            const saveAbility = CombatService.normalizeAbilityName(attack && attack.saveAbility  '');
            const saveAbilityLabel = CombatService.abilityNameToShortLabel(saveAbility)  (saveAbility  saveAbility.slice(0, 3).toUpperCase()  '');
            const isSave = saveDc  0 && !!saveAbilityLabel;
            const command = String(attack && attack.rollCommand  '').trim();
            const breakdown = isSave
                 ('DC ' + String(saveDc) + ' ' + saveAbilityLabel + ' Saving Throw')
                 (String(attack && attack.attackBreakdown  bonus).trim()  bonus);
            const tag = command  'a'  'span';
            const href = command  (' href=' + Utils.attrSafe(command) + '')  '';
            const disabledTitle = command  breakdown  (breakdown + ' - Roll unavailable');
            const topText = isSave  String(saveDc)  bonus;
            const bottomText = isSave  saveAbilityLabel  'Roll';
            const topFontSize = isSave  15  bonusFontSize;
            const bottomFontSize = isSave  10  10;
            return '' + tag + href + ' title=' + Utils.attrSafe(disabledTitle) + ' style=' +
                'displayinline-flex;flex-directioncolumn;align-itemscenter;justify-contentcenter;' +
                'width25px;height25px;min-width25px;min-height25px;padding0;margin0;' +
                'box-sizingborder-box;border1px solid rgba(255,255,255,0.70);border-radius4px;' +
                'backgroundrgba(54,54,54,0.50);colorrgb(255,255,255);text-decorationnone;' +
                'text-aligncenter;vertical-alignmiddle;overflowhidden;font-familyArial,Helvetica,sans-serif;' +
                    'bspan style=displayblock;height15px;line-height15px;font-size' + String(topFontSize) + 'px;font-weight900;white-spacenowrap;colorrgb(255,255,255);' + Utils.escapeHtml(topText) + 'spanb' +
                    'bspan style=displayblock;height9px;line-height9px;font-size' + String(bottomFontSize) + 'px;font-weight900;white-spacenowrap;colorrgb(255,255,255);' + Utils.escapeHtml(bottomText) + 'spanb' +
            '' + tag + '';
        },

        buildCombatAttacksCard(characterName, attacks) {
            const safeName = String(characterName  'Character').trim()  'Character';
            const safeAttacks = (Array.isArray(attacks)  attacks  [])
                .filter((attack) = attack && String(attack.name  '').trim());
            const rows = safeAttacks.map((attack, index) = {
                const name = String(attack.name  '').trim();
                const ability = String(attack.abilityLabel  '').trim();
                const attackType = String(attack.attackTypeLabel  attack.attackType  'Attack').trim()  'Attack';
                const rangeLabel = ^(Ranged AttackRanged Save)$i.test(attackType)  String(attack.rangeLabel  '').trim()  '';
                const separator = index  safeAttacks.length - 1
                     'border-bottom1px solid rgba(255,255,255,0.12);'
                     '';
                const hasDamage = this.combatAttackHasDamage(attack);
                const controlsWidth = hasDamage  79  25;
                const controlsCellWidth = hasDamage  83  29;
                return 'table style=width100%;border-collapsecollapse;table-layoutfixed;' + separator + 'tbodytr' +
                    'td style=text-alignleft;vertical-alignmiddle;padding4px 3px 4px 0;white-spacenormal;overflow-wrapnormal;word-breaknormal;' +
                        'div style=colorrgb(232,220,180);font-size11px;line-height13px;font-weight700;white-spacenormal;overflow-wrapnormal;word-breaknormal;' +
                            Utils.escapeHtml(name) +
                        'div' +
                        'div style=padding-top1px;colorrgb(255,255,255);font-size9px;line-height11px;font-weight400;white-spacenormal;' +
                            Utils.escapeHtml(attackType) +
                            (ability  (' span style=colorrgb(155,155,155);font-weight700;[' + Utils.escapeHtml(ability) + ']span')  '') +
                            (rangeLabel  (' span style=colorrgb(155,155,155);font-weight700;[' + Utils.escapeHtml(rangeLabel) + ']span')  '') +
                        'div' +
                    'td' +
                    'td style=width' + String(controlsCellWidth) + 'px;text-alignright;vertical-alignmiddle;padding0 0 0 4px;' +
                        'table style=width' + String(controlsWidth) + 'px;border-collapsecollapse;table-layoutfixed;margin-leftauto;tbodytr' +
                            (hasDamage  ('td style=width50px;height25px;padding0;text-aligncenter;vertical-alignmiddle;' + this.combatAttackDamageButtonHtml(attack) + 'tdtd style=width4px;height25px;padding0;td')  '') +
                            'td style=width25px;height25px;padding0;text-aligncenter;vertical-alignmiddle;' + this.combatAttackRollButtonHtml(attack) + 'td' +
                        'trtbodytable' +
                    'td' +
                'trtbodytable';
            }).join('');
            const body = rows  'div style=text-aligncenter;colorrgb(170,170,170);font-size11px;line-height14px;padding5px 0;No usable attacks were found on this character sheet.div';
            return Html.card({
                title safeName + ' Combat',
                body,
                buildOptions {
                    titleHtml Html.span(Utils.escapeHtml(safeName), 'color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight900;') + Html.span(' Combat', 'colorrgb(235,235,235);font-weight900;'),
                    titleColor 'rgb(235,235,235)',
                    bodyAlign 'left'
                }
            });
        },

        spellLevelTitle(level) {
            const safeLevel = Math.max(0, Math.min(9, Utils.toInt(level, 0)));
            return safeLevel === 0  'CANTRIPS'  ('LEVEL ' + String(safeLevel));
        },

        spellSlotValueHtml(current, max) {
            const safeCurrent = Math.max(0, Utils.toInt(current, 0));
            const safeMax = Math.max(0, Utils.toInt(max, 0));
            const currentColor = safeCurrent = 0
                 'rgb(220,45,45)'
                 (safeMax  0 && safeCurrent = safeMax  'rgb(52,203,116)'  'rgb(235,205,75)');
            return 'span style=font-weight900;white-spacenowrap;' +
                'span style=color' + currentColor + ';' + Utils.escapeHtml(String(safeCurrent)) + 'span ' +
                'span style=colorrgb(225,225,225);span ' +
                'span style=colorrgb(52,203,116);' + Utils.escapeHtml(String(safeMax)) + 'span' +
            'span';
        },

        spellCastingTimeLabel(value) {
            const raw = String(value  '').trim();
            if (!raw) return '';
            if (bbonuss+actionbi.test(raw)) return 'Bonus';
            if (breactionbi.test(raw)) return 'Reaction';
            if (^(1s+)actionbi.test(raw)  ^actionbi.test(raw)) return 'Action';
            return raw.replace(s+ors+ritualbig, '').trim();
        },

        spellDurationLabel(value, concentration) {
            const raw = String(value  '').trim();
            const compact = (text) = String(text  '')
                .replace(bminutesbig, 'min')
                .replace(bhoursbig, 'hr')
                .replace(b1s+roundbig, '1 Round')
                .replace(b(d+)s+roundsbig, (match, count) = String(count) + (String(count) === '1'  ' Round'  ' Rounds'))
                .replace(^instantaneous$i, 'Instant')
                .replace(s+g, ' ')
                .trim();
            const isConcentration = Utils.toBoolean(concentration, false)  bconcentrationbi.test(raw);
            if (isConcentration) {
                const remainder = compact(raw
                    .replace(^sconcentrations,si, '')
                    .replace(^sups+tos+i, ''));
                return remainder  ('Conc. ' + remainder)  'Conc.';
            }
            return compact(raw);
        },

        spellComponentsHtml(spell) {
            const source = spell  {};
            const v = Utils.toBoolean(source.verbal, false);
            const s = Utils.toBoolean(source.somatic, false);
            const m = Utils.toBoolean(source.material, false);
            if (!v && !s && !m) return '';
            const parts = [];
            if (v) parts.push('span style=colorrgb(52,203,116);font-weight900;Vspan');
            if (s) parts.push('span style=colorrgb(75,160,235);font-weight900;Sspan');
            if (m) {
                const material = String(source.materialDescription  '').trim()  'Material component';
                parts.push('span title=' + Utils.attrSafe(material) + ' style=colorrgb(225,70,70);font-weight900;cursorhelp;Mspan');
            }
            return 'span style=colorrgb(175,175,175);[span' + parts.join('span style=displayinline-block;width3px;span') + 'span style=colorrgb(175,175,175);]span';
        },

        spellCastingTimeHtml(value) {
            const label = this.spellCastingTimeLabel(value);
            if (!label) return '';
            let color = 'rgb(210,210,210)';
            if (^action$i.test(label)) color = 'rgb(52,203,116)';
            else if (^bonus$i.test(label)) color = 'rgb(105,185,235)';
            else if (^reaction$i.test(label)) color = 'rgb(235,110,110)';
            return 'span style=color' + color + ';font-size9px;font-weight800;' + Utils.escapeHtml(label) + 'span';
        },

        spellCastButtonHtml(spell) {
            const command = String(spell && spell.castCommand  '').trim();
            const tag = command  'a'  'span';
            const href = command  (' href=' + Utils.attrSafe(command) + '')  '';
            const name = String(spell && spell.name  'Spell').trim()  'Spell';
            const title = command  ('Cast ' + name)  ('Cast ' + name + ' - unavailable');
            return '' + tag + href + ' title=' + Utils.attrSafe(title) + ' style=' +
                'displayinline-flex;flex-directioncolumn;align-itemscenter;justify-contentcenter;' +
                'width25px;height25px;min-width25px;min-height25px;padding0;margin0;' +
                'box-sizingborder-box;border1px solid rgba(205,190,255,0.80);border-radius4px;' +
                'backgroundrgba(76,58,125,0.72);colorrgb(255,255,255);text-decorationnone;' +
                'text-aligncenter;vertical-alignmiddle;overflowhidden;font-familyArial,Helvetica,sans-serif;' +
                    'bspan style=displayblock;height15px;line-height15px;font-size13px;font-weight900;white-spacenowrap;&#129668;spanb' +
                    'bspan style=displayblock;height9px;line-height9px;font-size8px;font-weight900;white-spacenowrap;Castspanb' +
            '' + tag + '';
        },

        spellCombatControlsWidth() {
             Keep a fixed spell-control column so Damage occupies the left 50px
             only when present and RollSaveCast always lands in the same
             right-most 25px column.
            return 79;
        },

        spellCombatControlsHtml(spell) {
            const action = spell && spell.combat && typeof spell.combat === 'object'  spell.combat  null;
            const hasDamage = !!(action && this.combatAttackHasDamage(action));
            const rightControl = action  this.combatAttackRollButtonHtml(action)  this.spellCastButtonHtml(spell);
            return 'table style=width79px;border-collapsecollapse;table-layoutfixed;margin-leftauto;tbodytr' +
                'td style=width50px;height25px;padding0;text-aligncenter;vertical-alignmiddle;' + (hasDamage  this.combatAttackDamageButtonHtml(action)  '') + 'td' +
                'td style=width4px;height25px;padding0;td' +
                'td style=width25px;height25px;padding0;text-aligncenter;vertical-alignmiddle;' + rightControl + 'td' +
            'trtbodytable';
        },


        buildSpellsCard(characterName, spellData) {
            const safeName = String(characterName  'Character').trim()  'Character';
            const data = spellData  {};
            const spells = (Array.isArray(data.spells)  data.spells  [])
                .filter((spell) = spell && String(spell.name  '').trim());
            const profile = data.profile  {};
            const abilityLabel = String(profile.abilityLabel  '').trim();
            const abilityModifier = Utils.toInt(profile.abilityModifier, 0);
            const attackBonus = Utils.toInt(profile.spellAttackBonus, 0);
            const saveDc = Math.max(0, Utils.toInt(profile.spellSaveDc, 0));
            const signed = (value) = value = 0  ('+' + String(value))  String(value);
            const profileBits = [];
            if (abilityLabel) profileBits.push('span style=colorrgb(160,160,160);' + Utils.escapeHtml(abilityLabel) + 'span b style=colorrgb(235,235,235);' + Utils.escapeHtml(signed(abilityModifier)) + 'b');
            if (abilityLabel  attackBonus) profileBits.push('span style=colorrgb(160,160,160);ATKspan b style=colorrgb(235,235,235);' + Utils.escapeHtml(signed(attackBonus)) + 'b');
            if (saveDc  0) profileBits.push('span style=colorrgb(160,160,160);DCspan b style=colorrgb(235,235,235);' + Utils.escapeHtml(String(saveDc)) + 'b');
            const profileHtml = profileBits.length
                 'div style=padding0 0 5px 0;text-aligncenter;font-size10px;line-height13px;' + profileBits.join('span style=displayinline-block;width8px;span') + 'div'
                 '';

            let pactHtml = '';
            if (data.isPact) {
                const pactCurrent = Math.max(0, Utils.toInt(data.pactSlotsCurrent, 0));
                const pactMax = Math.max(0, Utils.toInt(data.pactSlotMax, 0));
                const pactLevel = Math.max(0, Utils.toInt(data.pactSlotLevel, 0));
                pactHtml = 'div style=margin0 0 5px 0;padding4px 6px;border1px solid rgba(145,120,210,0.55);border-radius4px;backgroundrgba(65,55,120,0.35);font-size10px;line-height13px;' +
                    'table style=width100%;border-collapsecollapse;table-layoutfixed;tbodytr' +
                        'td style=text-alignleft;colorrgb(205,190,235);font-weight900;PACT MAGICtd' +
                        'td style=text-aligncenter;' + this.spellSlotValueHtml(pactCurrent, pactMax) + 'td' +
                        'td style=text-alignright;colorrgb(205,190,235);font-weight900;white-spacenowrap;CAST LV. ' + Utils.escapeHtml(String(pactLevel  '-')) + 'td' +
                    'trtbodytable' +
                'div';
            }

            const slotByLevel = Object.create(null);
            (Array.isArray(data.slots)  data.slots  []).forEach((slot) = {
                const level = Math.max(1, Math.min(9, Utils.toInt(slot && slot.level, 0)));
                if (!level) return;
                slotByLevel[level] = slot;
            });
            const grouped = Object.create(null);
            spells.forEach((spell) = {
                const level = Math.max(0, Math.min(9, Utils.toInt(spell.level, 0)));
                grouped[level] = grouped[level]  [];
                grouped[level].push(spell);
            });
            const levels = Object.keys(grouped).map((value) = Utils.toInt(value, 0)).sort((a, b) = a - b);
            const groupsHtml = levels.map((level) = {
                const slot = !data.isPact && level  0  slotByLevel[level]  null;
                const slotHtml = slot
                     this.spellSlotValueHtml(slot.current, slot.max)
                     '';
                const heading = 'div style=margin-top' + (level === levels[0]  '0'  '5px') + ';padding2px 4px;border-bottom1px solid rgba(155,130,215,0.45);colorrgb(205,190,235);font-size9px;line-height12px;font-weight900;' +
                    'span' + Utils.escapeHtml(this.spellLevelTitle(level)) + 'span' +
                    (slotHtml  ('span style=floatright;' + slotHtml + 'span')  '') +
                'div';
                const rows = grouped[level].map((spell, index) = {
                    const range = String(spell.range  '').trim();
                    const ritual = Utils.toBoolean(spell.ritual, false);
                    const castingTime = this.spellCastingTimeLabel(spell.castingTime);
                    const duration = this.spellDurationLabel(spell.duration, spell.concentration);
                    const schoolRaw = String(spell.school  '').trim();
                    const school = schoolRaw  (schoolRaw.charAt(0).toUpperCase() + schoolRaw.slice(1).toLowerCase())  '';
                    const components = this.spellComponentsHtml(spell);
                     Shared two-row spell layout
                       Spellname - [V S M] - ActionBonusReaction - Ritual
                       Range - InstantConc.Duration - School
                    const dot = 'span style=colorrgb(95,95,95);padding0 3px;&middot;span';
                    const row1 = Utils.escapeHtml(String(spell.name  'Spell')) +
                        (components  (dot + 'span style=font-size9px;' + components + 'span')  '') +
                        (castingTime  (dot + this.spellCastingTimeHtml(spell.castingTime))  '') +
                        (ritual  (dot + 'span style=colorrgb(75,160,235);font-size9px;font-weight900;Ritualspan')  '');
                    const row2Parts = [];
                    if (range) row2Parts.push('span style=colorrgb(155,155,155);font-weight600;' + Utils.escapeHtml(range) + 'span');
                    if (duration) row2Parts.push('span style=colorrgb(145,145,145);' + Utils.escapeHtml(duration) + 'span');
                    if (school) row2Parts.push('span style=colorrgb(145,145,145);' + Utils.escapeHtml(school) + 'span');
                    const separator = index  grouped[level].length - 1  'border-bottom1px solid rgba(255,255,255,0.10);'  '';
                    const metaTitle = [
                        range  ('Range ' + range)  '',
                        ritual  'Ritual'  '',
                        castingTime  ('Casting ' + castingTime)  '',
                        duration  ('Duration ' + duration)  '',
                        school  ('School ' + school)  ''
                    ].filter(Boolean).join('  ');
                    return 'table style=width100%;border-collapsecollapse;table-layoutfixed;' + separator + 'tbodytr' +
                        'td style=text-alignleft;vertical-alignmiddle;padding4px 3px 4px 0;overflowhidden;' +
                            'div style=colorrgb(232,220,180);font-size11px;line-height13px;font-weight700;white-spacenowrap;overflowhidden;text-overflowellipsis;' + row1 + 'div' +
                            'div title=' + Utils.attrSafe(metaTitle) + ' style=padding-top1px;font-size8px;line-height10px;font-weight600;white-spacenowrap;overflowhidden;text-overflowellipsis;' + row2Parts.join(dot) + 'div' +
                        'td' +
                        'td style=width' + String(this.spellCombatControlsWidth(spell) + 4) + 'px;text-alignright;vertical-alignmiddle;padding0 0 0 4px;' + this.spellCombatControlsHtml(spell) + 'td' +
                    'trtbodytable';
                }).join('');
                return heading + rows;
            }).join('');
            const emptyHtml = 'div style=text-aligncenter;colorrgb(170,170,170);font-size11px;line-height14px;padding5px 0;No usable spells were found on this character sheet.div';
            const body = profileHtml + pactHtml + (groupsHtml  emptyHtml);
            return Html.card({
                title safeName + ' Spells',
                body,
                buildOptions {
                    titleHtml Html.span(Utils.escapeHtml(safeName), 'color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight900;') + Html.span(' Spells', 'colorrgb(235,235,235);font-weight900;'),
                    titleColor 'rgb(235,235,235)',
                    bodyAlign 'left'
                }
            });
        },

        buildSpellRenderProbeCard(characterName, spellData, probe) {
            const safeName = String(characterName  'Character').trim()  'Character';
            const data = spellData  {};
            const info = probe  {};
            const spells = (Array.isArray(data.spells)  data.spells  []).filter((spell) = spell && String(spell.name  '').trim());
            const levelGroups = Object.create(null);
            spells.forEach((spell) = {
                const level = Math.max(0, Math.min(9, Utils.toInt(spell && spell.level, 0)));
                levelGroups[level] = levelGroups[level]  [];
                levelGroups[level].push(String(spell.name  'Spell').trim()  'Spell');
            });
            const namesHtml = Object.keys(levelGroups)
                .map((value) = Utils.toInt(value, 0))
                .sort((a, b) = a - b)
                .map((level) = 'div style=padding1px 0;b style=colorrgb(205,190,235);' + Utils.escapeHtml(this.spellLevelTitle(level)) + 'b ' + Utils.escapeHtml(levelGroups[level].join(', ')) + 'div')
                .join('');
            const levelChars = Array.isArray(info.levelCards)
                 info.levelCards.map((entry) = 'Lv' + String(entry.level) + '=' + String(entry.chars)).join('  ')
                 '';
            const body =
                'div style=font-size9px;line-height12px;text-alignleft;' +
                    'divb style=colorrgb(190,165,225);Probeb 2024-style compact 2014 list with Roll only.div' +
                    'divb style=colorrgb(190,165,225);Spellsb ' + Utils.escapeHtml(String(spells.length)) + 'div' +
                    'divb style=colorrgb(190,165,225);Test card charsb ' + Utils.escapeHtml(String(info.fullCardChars  0)) + 'div' +
                    (info.originalFullCardChars  'divb style=colorrgb(190,165,225);Original 2024 renderer charsb ' + Utils.escapeHtml(String(info.originalFullCardChars)) + 'div'  '') +
                    (typeof info.chunkCount === 'number'  'divb style=colorrgb(190,165,225);Split cardsb ' + Utils.escapeHtml(String(info.chunkCount)) + 'div'  '') +
                    (Array.isArray(info.chunkCards) && info.chunkCards.length  'divb style=colorrgb(190,165,225);Split charsb ' + Utils.escapeHtml(info.chunkCards.map((entry) = String(entry.chars  0)).join('  ')) + 'div'  '') +
                    (info.fullCardError  'divb style=colorrgb(220,75,75);Render errorb ' + Utils.escapeHtml(String(info.fullCardError)) + 'div'  '') +
                    (levelChars  'divb style=colorrgb(190,165,225);Level card charsb ' + Utils.escapeHtml(levelChars) + 'div'  '') +
                    'div style=height1px;backgroundrgba(255,255,255,0.15);margin4px 0;div' +
                    (namesHtml  'divNo spell names.div') +
                'div';
            return Html.card({
                title safeName + ' Spell Probe',
                body,
                buildOptions { titleColor 'rgb(235,235,235)', bodyAlign 'left' }
            });
        },

        diagnosticValueText(value) {
            if (value === undefined) return 'undefined';
            if (value === null) return 'null';
            if (typeof value === 'string') return value;
            if (typeof value === 'number'  typeof value === 'boolean') return String(value);
            try { return JSON.stringify(value); } catch (ignored) { return String(value); }
        },

        combatDiagnosticFieldsHtml(fields) {
            const safeFields = Array.isArray(fields)  fields  [];
            const lines = safeFields.map((entry) = {
                const key = String(entry && entry.key  '').trim()  '(value)';
                let value = this.diagnosticValueText(entry && entry.value);
                const originalLength = value.length;
                if (value.length  280) value = value.slice(0, 280) + ' ... [truncated ' + String(originalLength - 280) + ' chars]';
                return 'strong' + Utils.escapeHtml(key) + 'strong = ' + Utils.escapeHtml(value) + 'br';
            }).join('');
            return 'div style=colorrgb(235,235,235);font-size9px;line-height12px;text-alignleft;white-spacenormal;overflow-wrapanywhere;word-breakbreak-word;' + lines + 'div';
        },

        buildCombatAttackDiagnosticCard(characterName, diagnostic, index, total) {
            const safeName = String(characterName  'Character').trim()  'Character';
            const attackName = String(diagnostic && diagnostic.name  ('Attack ' + String(index + 1))).trim();
            const version = String(diagnostic && diagnostic.sheetVersion  'unknown');
            const fields = diagnostic && Array.isArray(diagnostic.fields)  diagnostic.fields  [];
            const body =
                'div style=padding-bottom4px;border-bottom1px solid rgba(255,255,255,0.18);margin-bottom4px;' +
                    'span style=colorrgb(232,220,180);font-size11px;font-weight900;' + Utils.escapeHtml(attackName) + 'span' +
                    'span style=colorrgb(145,145,145);font-size9px; [' + Utils.escapeHtml(version) + ']span' +
                    'span style=floatright;colorrgb(145,145,145);font-size9px;' + Utils.escapeHtml(String(index + 1)) + '' + Utils.escapeHtml(String(total)) + 'span' +
                'div' +
                this.combatDiagnosticFieldsHtml(fields);
            return Html.card({
                title safeName + ' Attack Data',
                body,
                buildOptions {
                    titleHtml Html.span(Utils.escapeHtml(safeName), 'color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight900;') + Html.span(' Attack Data', 'colorrgb(235,235,235);font-weight900;'),
                    titleColor 'rgb(235,235,235)',
                    bodyAlign 'left'
                }
            });
        },

        buildCombatDiagnosticSummaryCard(characterName, diagnosticSet) {
            const safeName = String(characterName  'Character').trim()  'Character';
            const data = diagnosticSet  {};
            const body =
                'div style=font-size10px;line-height14px;text-alignleft;' +
                    'divspan style=colorrgb(205,185,120);font-weight700;Sheetspan ' + Utils.escapeHtml(String(data.sheetVersion  'unknown')) + 'div' +
                    'divspan style=colorrgb(205,185,120);font-weight700;Attacksspan ' + Utils.escapeHtml(String((data.attacks  []).length)) + 'div' +
                    'divspan style=colorrgb(205,185,120);font-weight700;Readparsespan ' + Utils.escapeHtml(String(data.readMs  0)) + ' msdiv' +
                    'divspan style=colorrgb(205,185,120);font-weight700;Collectspan ' + Utils.escapeHtml(String(data.collectMs  0)) + ' msdiv' +
                    (typeof data.liveReadMs === 'number' && data.liveReadMs  0  'divspan style=colorrgb(205,185,120);font-weight700;Live ability diagnosticspan ' + Utils.escapeHtml(String(data.liveReadMs)) + ' msdiv'  '') +
                    (typeof data.sheetApiReads === 'number' && data.sheetApiReads  0  'divspan style=colorrgb(205,185,120);font-weight700;getSheetItem readsspan ' + Utils.escapeHtml(String(data.sheetApiReads)) + 'div'  '') +
                    (typeof data.storeChars === 'number' && data.storeChars  0  'divspan style=colorrgb(205,185,120);font-weight700;Store charsspan ' + Utils.escapeHtml(String(data.storeChars)) + 'div'  '') +
                    'div style=padding-top4px;colorrgb(160,160,160);Combat is rendered from the store first. getSheetItem reads shown here are diagnostic-only and run after the Combat card is sent.div' +
                'div';
            return Html.card({
                title safeName + ' Combat Diagnostic',
                body,
                buildOptions { titleColor 'rgb(235,235,235)', bodyAlign 'left' }
            });
        },

        buildSpellDiagnosticCard(characterName, diagnostic, index, total) {
            const safeName = String(characterName  'Character').trim()  'Character';
            const spellName = String(diagnostic && diagnostic.name  ('Spell ' + String(index + 1))).trim();
            const version = String(diagnostic && diagnostic.sheetVersion  'unknown');
            const fields = diagnostic && Array.isArray(diagnostic.fields)  diagnostic.fields  [];
            const isContext = !!(diagnostic && diagnostic.isContext);
            const counter = isContext  !(Utils.toInt(total, 0)  0)
                 ''
                 ('span style=floatright;colorrgb(145,145,145);font-size9px;' + Utils.escapeHtml(String(index + 1)) + '' + Utils.escapeHtml(String(total)) + 'span');
            const body =
                'div style=padding-bottom4px;border-bottom1px solid rgba(255,255,255,0.18);margin-bottom4px;' +
                    'span style=colorrgb(205,190,235);font-size11px;font-weight900;' + Utils.escapeHtml(spellName) + 'span' +
                    'span style=colorrgb(145,145,145);font-size9px; [' + Utils.escapeHtml(version) + ']span' +
                    counter +
                'div' +
                this.combatDiagnosticFieldsHtml(fields);
            return Html.card({
                title safeName + ' Spell Data',
                body,
                buildOptions {
                    titleHtml Html.span(Utils.escapeHtml(safeName), 'color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight900;') + Html.span(' Spell Data', 'colorrgb(235,235,235);font-weight900;'),
                    titleColor 'rgb(235,235,235)',
                    bodyAlign 'left'
                }
            });
        },

        buildSpellDiagnosticSummaryCard(characterName, diagnosticSet) {
            const safeName = String(characterName  'Character').trim()  'Character';
            const data = diagnosticSet  {};
            const body =
                'div style=font-size10px;line-height14px;text-alignleft;' +
                    'divspan style=colorrgb(190,165,225);font-weight700;Sheetspan ' + Utils.escapeHtml(String(data.sheetVersion  'unknown')) + 'div' +
                    'divspan style=colorrgb(190,165,225);font-weight700;Spellsspan ' + Utils.escapeHtml(String((data.spells  []).length)) + 'div' +
                    (typeof data.spellAttackRows === 'number' && data.spellAttackRows  0  'divspan style=colorrgb(190,165,225);font-weight700;Spell attack rowsspan ' + Utils.escapeHtml(String(data.spellAttackRows)) + 'div'  '') +
                    'divspan style=colorrgb(190,165,225);font-weight700;Readparsespan ' + Utils.escapeHtml(String(data.readMs  0)) + ' msdiv' +
                    'divspan style=colorrgb(190,165,225);font-weight700;Collectspan ' + Utils.escapeHtml(String(data.collectMs  0)) + ' msdiv' +
                    (typeof data.fullCardChars === 'number'  'divspan style=colorrgb(190,165,225);font-weight700;Full card charsspan ' + Utils.escapeHtml(String(data.fullCardChars)) + 'div'  '') +
                    (data.levelCardChars  'divspan style=colorrgb(190,165,225);font-weight700;Level card charsspan ' + Utils.escapeHtml(String(data.levelCardChars)) + 'div'  '') +
                    (data.singleSpellMaxChars  'divspan style=colorrgb(190,165,225);font-weight700;Largest single spell cardspan ' + Utils.escapeHtml(String(data.singleSpellMaxChars)) + 'div'  '') +
                    (data.chunkCount  'divspan style=colorrgb(190,165,225);font-weight700;Split cardsspan ' + Utils.escapeHtml(String(data.chunkCount)) + 'div'  '') +
                    (data.chunkCardChars  'divspan style=colorrgb(190,165,225);font-weight700;Split charsspan ' + Utils.escapeHtml(String(data.chunkCardChars)) + 'div'  '') +
                    (data.renderError  'divspan style=colorrgb(220,75,75);font-weight700;Render errorspan ' + Utils.escapeHtml(String(data.renderError)) + 'div'  '') +
                    (typeof data.liveReadMs === 'number' && data.liveReadMs  0  'divspan style=colorrgb(190,165,225);font-weight700;Live Sheet APIspan ' + Utils.escapeHtml(String(data.liveReadMs)) + ' msdiv'  '') +
                    (typeof data.sheetApiReads === 'number' && data.sheetApiReads  0  'divspan style=colorrgb(190,165,225);font-weight700;getSheetItem readsspan ' + Utils.escapeHtml(String(data.sheetApiReads)) + 'div'  '') +
                    (typeof data.storeChars === 'number' && data.storeChars  0  'divspan style=colorrgb(190,165,225);font-weight700;Store charsspan ' + Utils.escapeHtml(String(data.storeChars)) + 'div'  '') +
                    'div style=padding-top4px;colorrgb(160,160,160);Store-only diagnostic. No getSheetItem reads are performed; 2024 spell attackDC values are derived from the active Spellcasting, Ability Score, proficiency, and Pact Magic data.div' +
                'div';
            return Html.card({
                title safeName + ' Spell Diagnostic',
                body,
                buildOptions { titleColor 'rgb(235,235,235)', bodyAlign 'left' }
            });
        },

        combatMenuTitleHtml() {
            return (
                'table style=width100%;border-collapsecollapse;table-layoutfixed;tbodytr' +
                    'td style=width34px;text-alignleft;vertical-alignmiddle;white-spacenowrap;' +
                        'a href=!combatAssistant help title=Open help style=displayinline-block;backgroundtransparent;border0;colorrgb(230,230,230);text-decorationnone;font-size15px;line-height15px;padding0;margin0;&#10067;a' +
                    'td' +
                    'td style=text-aligncenter;vertical-alignmiddle;' + Utils.escapeHtml(META.NAME) + 'td' +
                    'td style=width34px;text-alignright;vertical-alignmiddle;white-spacenowrap;' +
                        'a href=!combatAssistant config title=Open settings style=displayinline-block;backgroundtransparent;border0;colorrgb(230,230,230);text-decorationnone;font-size15px;line-height15px;padding0;margin0;&#9881;&#65039;a' +
                    'td' +
                'trtbodytable'
            );
        },

        showBootstrapCard() {
            R20.whisper('GM', 
                Html.card({
                    title META.NAME,
                    body
                        'div style=positionrelative;min-height106px;' +
                            'div style=positionabsolute;left0;right0;bottom-6px;displaytable;width100%;font-size12px;line-height14px;' +
                                'div style=displaytable-cell;text-alignleft;padding-left4px;colorrgb(160,160,160);Created by a href=' + Utils.attrSafe(META.DEVELOPER_URL) + ' target=_blank style=colorrgb(0, 180, 180);text-decorationnone;font-weight700;b' + Utils.escapeHtml(META.DEVELOPER) + 'badiv' +
                                'div style=displaytable-cell;text-alignright;padding-right4px;colorrgb(160,160,160);Version span style=colorrgb(160, 160, 0);font-weight700;b' + Utils.escapeHtml(META.VERSION) + 'bspandiv' +
                            'div' +
                        'div',
                    buildOptions {
                        titleHtml this.combatMenuTitleHtml(),
                        titleColor 'rgb(188, 138, 32)',
                        bgOverlayStart 'rgba(0,0,0,0)',
                        bgOverlayEnd 'rgba(0,0,0,0)',
                        bgSize 'cover',
                        bgAttachment 'scroll',
                        bgPosition 'center center',
                        bgImageURL 'httpsraw.githubusercontent.comAmadeusVFTrinkets-Trackers_ImagesrefsheadsmainCA.png'
                    }
                })
            );
        },

        showConfigMenu(target) {
            const settings = RuntimeConfig.getAll();
            const fields = RuntimeConfig.fields();

            const rows = fields.map((field) = {
                if (field.type === 'section') {
                    return 'trtd colspan=2 style=padding8px 0 3px 0;text-aligncenter;colorrgb(165,165,165);font-size13px;line-height15px;font-weight700;' +
                        Utils.escapeHtml(field.label  '') +
                    'tdtr';
                }
                const value = settings[field.key];
                let button = '';
                if (field.type === 'boolean') {
                    button = this.compactSettingButtonHtml({
                        label value  'ON'  'OFF',
                        command '!combatAssistant toggle ' + Utils.attrSafe(field.key),
                        tooltip 'Toggle ' + field.label,
                        backgroundColor value  'rgba(20,115,55,0.95)'  'rgba(120,40,40,0.95)'
                    });
                } else if (field.type === 'bar'  field.type === 'bar0') {
                    const opts = field.type === 'bar0'  '01234'  '1234';
                    button = this.compactSettingButtonHtml({
                        label value,
                        command '!combatAssistant set ' + Utils.attrSafe(field.key) + ' &#63;{' + Utils.attrSafe(field.label) + '' + opts + '}',
                        tooltip 'Edit ' + field.label
                    });
                } else if (field.type === 'percent'  field.type === 'number') {
                    button = this.compactSettingButtonHtml({
                        label String(value  0),
                        command '!combatAssistant set ' + Utils.attrSafe(field.key) + ' &#63;{' + Utils.attrSafe(field.label) + '' + Utils.attrSafe(String(value  0)) + '}',
                        tooltip 'Edit ' + field.label
                    });
                } else {
                    button = this.compactSettingButtonHtml({
                        label 'EDIT',
                        command '!combatAssistant set ' + Utils.attrSafe(field.key) + ' &#63;{' + Utils.attrSafe(field.label) + '' + Utils.attrSafe(String(value  '').replace(g, ' ')) + '}',
                        tooltip 'Edit ' + field.label
                    });
                }
                const displayValue = field.type === 'boolean'
                     (value  'ON'  'OFF')
                     String(value === undefined  value === null  value === ''  '-'  value);
                return (
                    'tr' +
                        'td title=' + Utils.attrSafe(field.tip  field.label) + ' style=text-alignleft;vertical-alignmiddle;padding2px 2px 2px 2px;colorrgb(225,225,225);font-size12px;font-weight700;white-spacenowrap;' + Utils.escapeHtml(field.label) + 'td' +
                        'td style=width40px;text-alignright;vertical-alignmiddle;padding2px 0;' + button + 'td' +
                    'tr'
                );
            }).join('');
            const defaultButton = this.compactSettingButtonHtml({
                label 'Default',
                width 54,
                height 14,
                command '!combatAssistant defaults &#63;{Reset all Combat Assistant settings to defaultNo,noYes,yes}',
                tooltip 'Restore every persistent setting to its default value',
                backgroundColor 'rgba(70,70,70,0.95)'
            });
            const body =
                'table style=width100%;border-collapsecollapse;tbody' + rows + 'tbodytable' +
                'div style=height1px;backgroundrgba(125,125,125,0.65);margin7px 0 6px 0;div' +
                'div style=text-aligncenter;padding0 0 2px 0;' + defaultButton + 'div';
            R20.whisper(target  'GM', Html.card({ title META.NAME + ' Settings', body }));
        },

        showMenu(target) {
            const damageTypes = '-,normalAcid,acidBludgeoning,bludgeoningCold,coldFire,fireForce,forceLightning,lightningNecrotic,necroticPiercing,piercingPoison,poisonPsychic,psychicRadiant,radiantSlashing,slashingThunder,thunder';
            const abilities = 'No,noStrength,strengthDexterity,dexterityConstitution,constitutionIntelligence,intelligenceWisdom,wisdomCharisma,charisma';
            const dmgButton = this.iconButtonHtml({
                iconHtml '&#128165;',
                label 'Dmg',
                command '!combatAssistant deal manual &#63;{Damage0} &#63;{Type' + damageTypes + '} &#63;{DC0} &#63;{Save' + abilities + '} &#63;{Half on Successnoyes}' +
                    (RuntimeConfig.get('SHEET_2014_CA_ROLLS')  ' &#63;{2014 Roll ModeNormal,normalAdvantage,advantageDisadvantage,disadvantage}'  ''),
                backgroundColor 'rgba(135,35,35,0.95)',
                tooltip 'Deal damage to selected token(s)'
            });
            const healButton = this.iconButtonHtml({
                iconHtml '&#128154;',
                label 'Heal',
                command '!combatAssistant heal manual &#63;{Heal TypeHP,hpTemp,temp} &#63;{Healing0}',
                backgroundColor 'rgba(20,115,55,0.95)',
                tooltip 'Heal selected token(s)'
            });
            const saveButton = this.iconButtonHtml({
                iconHtml '&#128735;',
                label 'Save',
                command '!combatAssistant save &#63;{AbilityStrength,strengthDexterity,dexterityConstitution,constitutionIntelligence,intelligenceWisdom,wisdomCharisma,charisma}' +
                    (RuntimeConfig.get('SHEET_2014_CA_ROLLS')  ' &#63;{2014 Roll ModeNormal,normalAdvantage,advantageDisadvantage,disadvantage}'  ''),
                backgroundColor 'rgba(160,145,65,0.85)',
                tooltip 'Roll a saving throw for selected token(s)'
            });
            const initButton = this.iconButtonHtml({
                iconHtml '&#127922;',
                label 'Init',
                command '!combatAssistant init' +
                    (RuntimeConfig.get('SHEET_2014_CA_ROLLS')  ' &#63;{2014 Roll ModeNormal,normalAdvantage,advantageDisadvantage,disadvantage}'  ''),
                backgroundColor 'rgba(70,115,170,0.85)',
                tooltip 'Roll initiative for selected token(s)'
            });
            const concButton = this.iconButtonHtml({
                iconHtml '&#9203;',
                label 'Conc.',
                command '!ca conc',
                backgroundColor 'rgba(80,80,120,0.95)',
                tooltip 'Reroll active concentration damage and open controls'
            });
            const body = this.iconButtonTableHtml([dmgButton, healButton, saveButton, initButton, concButton], {
                columns 5,
                footer 'Select target token(s) before pressing a button.'
            });
            R20.whisper(target  'GM', Html.card({
                title META.NAME,
                body,
                buildOptions { titleHtml this.combatMenuTitleHtml() }
            }));
        },

        showHelp(target) {
            const separator = 'div style=height1px;backgroundrgba(125,125,125,0.55);margin7px 0 6px 0;div';
            const sectionTitle = (title) = 'b style=colorrgb(245,220,80);font-size12px;' + Utils.escapeHtml(title) + 'bbr';
            const commandHtml = (command) = 'code style=font-size12px;line-height15px;' + command + 'code';
            const descriptionHtml = (text) = 'span style=font-size10px;line-height13px;colorrgb(190,190,190);' + Utils.escapeHtml(text) + 'span';
            const helpLine = (command, description) = commandHtml(command) + (description  (' span style=font-size10px;line-height13px;colorrgb(190,190,190);- ' + Utils.escapeHtml(description) + 'span')  '') + 'br';
            const body =
                'div style=text-alignleft;font-size12px;line-height16px;colorrgb(225,225,225);' +
                    sectionTitle('Main Commands') +
                    helpLine('!ca menu', 'Opens the main Combat Assistant menu.') +
                    helpLine('!ca help', 'Shows this help card.') +
                    helpLine('!ca settings', 'Opens the Combat Assistant settings.') +
                    helpLine('!ca deal manual &lt;dmg&gt; &lt;type&gt; &lt;DC&gt; &lt;Attr&gt; &lt;half&gt;', 'Applies manual damage to the selected target. Damage type, attackDC value, saving throw ability, and half damage are optional.') +
                    helpLine('!ca heal manual &lt;hptemp&gt; &lt;value&gt;', 'Restores Hit Points or grants Temporary Hit Points to the selected target.') +
                    helpLine('!ca save &lt;ability&gt;', 'Rolls the selected token's saving throw using the specified ability.') +
                    helpLine('!ca init', 'Rolls initiative for the selected token.') +

                    separator +
                    sectionTitle('Combat') +
                    'div style=padding-bottom2px;' + descriptionHtml('Combat and Spells list the attacks and spells available on a character sheet.') + 'div' +
                    helpLine('!ca combat', 'Shows the attack list for the selected token.') +
                    helpLine('!ca combat &lt;sheet name&gt;', 'Shows the attack list for the named character sheet.') +
                    helpLine('!ca spells', 'Shows the spell list for the selected token.') +
                    helpLine('!ca spells &lt;sheet name&gt;', 'Shows the spell list for the named character sheet.') +
                    helpLine('!ca dash  !ca disengage  !ca dodge', 'Declares the chosen action for the token currently in turn.') +

                    separator +
                    sectionTitle('Turn Tracker') +
                    helpLine('!ca turn', 'Shows the Turn card for the token currently in turn.') +
                    helpLine('!ca turnnext', 'Ends the current turn and advances to the next token.') +
                    helpLine('!ca turnfocus', 'Focuses the view on the token currently in turn. Players can use it only during a turn they control.') +
                    helpLine('!ca turnstop yes', 'Ends the active combat and stops the Turn Tracker.') +

                    separator +
                    sectionTitle('Resources') +
                    helpLine('!ca resources', 'Shows resources for the selected token.') +
                    helpLine('!ca resources &lt;sheet name&gt;', 'Shows resources for the named character sheet.') +

                    separator +
                    sectionTitle('Examples') +
                    helpLine('!ca deal manual 10', 'Deals 10 untyped damage directly.') +
                    helpLine('!ca deal manual 10 Fire', 'Deals 10 Fire damage directly.') +
                    helpLine('!ca deal manual 10 Fire 13', 'Deals 10 Fire damage if an attack total of 13 meets the target's AC.') +
                    helpLine('!ca deal manual 10 Fire 13 Dexterity', 'Requests a DC 13 Dexterity saving throw; a successful save prevents the damage.') +
                    helpLine('!ca deal manual 10 Fire 13 Dexterity yes', 'Requests a DC 13 Dexterity saving throw; a successful save takes half damage.') +

                    separator +
                    sectionTitle('Bar Configuration') +
                    'div style=font-size10px;line-height13px;colorrgb(190,190,190);padding-bottom2px;text-aligncenter;' +
                        'HP Bar b style=colorrgb(70,190,115);' + Utils.escapeHtml(String(RuntimeConfig.get('HP_BAR'))) + 'b &nbsp; ' +
                        'AC Bar b style=colorrgb(70,190,115);' + Utils.escapeHtml(String(RuntimeConfig.get('AC_BAR'))) + 'b &nbsp; ' +
                        'Temp HP Bar b style=colorrgb(70,190,115);' + Utils.escapeHtml(String(RuntimeConfig.get('TEMP_HP_BAR'))) + 'b' +
                    'div'+
                    
                    helpLine('!ca set hpbar &lt;1-4&gt;', 'Sets the token bar used for Hit Points.') +
                    helpLine('!ca set acbar &lt;1-4&gt;', 'Sets the token bar used for Armor Class.') +
                    helpLine('!ca set tempbar &lt;0-4&gt;', 'Sets the token bar used for Temporary Hit Points. Use 0 to disable it.') +

                    separator +
                    sectionTitle('Extra') +
                    'div style=font-size10px;line-height13px;colorrgb(190,190,190);padding1px 4px 5px 4px;text-aligncenter;' +
                        'This was extracted from the original T&amp;T V1.3.8 codebase, which is now abandoned. Combat Assistant is designed as a companion to the new a href=httpsapp.roll20.netforumpost12758022t-and-t-chat-based-inventory-dynamic-shops-auto-healing-loot-and-item-automation-for-roll20-d-and-d-2024 target=_blank style=colorrgb(0,180,180);text-decorationnone;font-weight700;bTrinkets and Trackers V2.3.0ba. Use both together for a more immersive Roll20 experience.' +
                    'div' +
                    'div style=font-size10px;line-height13px;colorrgb(160,160,160);padding-top3px;text-aligncenter;' +
                        'Created by a href=' + Utils.attrSafe(META.DEVELOPER_URL) + ' target=_blank style=colorrgb(0,180,180);text-decorationnone;font-weight700;b' + Utils.escapeHtml(META.DEVELOPER) + 'ba' +
                        ' &nbsp;&middot;&nbsp; Version span style=colorrgb(255,220,0);font-weight700;' + Utils.escapeHtml(META.VERSION) + 'span' +
                    'div' +
                'div';
            const configButton = this.iconButtonHtml({ iconHtml '&#9881;&#65039;', label 'Config', command '!combatAssistant config', width 52, tooltip 'Open settings' });
            R20.whisper(target  'GM', Html.card({ title META.NAME, body body + 'div style=text-aligncenter;padding-top6px;' + configButton + 'div' }));
        },

        buildDamageNarrative(result) {
            result = result  {};
            const hideNames = !RuntimeConfig.get('REVEAL_TOKEN_NAMES_IN_LOG');
            const targetLabel = hideNames  'Target'  String(result.tokenName  'Target');
            const targetName = Html.span(Utils.escapeHtml(targetLabel), 'color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight900;');
            const sourceName = String(result.sourceName  '').trim();
            const sourceAction = String(result.sourceAction  '').trim();
            const isManualSource = ^manual$i.test(sourceName)  ^manual(s+damage)$i.test(sourceAction);
            const revealSource = RuntimeConfig.get('REVEAL_DAMAGE_SOURCE') && !isManualSource;
            const sourceLabel = hideNames  'Attacker'  sourceName;
            const sourceNameHtml = sourceName  Html.span(Utils.escapeHtml(sourceLabel), 'color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight900;')  '';
            const sourceActionHtml = sourceAction
                 Html.span(Utils.escapeHtml(sourceAction), 'colorrgb(245,220,80);font-weight900;')
                 '';
            const sourcePhrase = revealSource && sourceActionHtml
                 (' from ' + (sourceNameHtml  (sourceNameHtml + '&#39;s ')  '') + sourceActionHtml)
                 (revealSource && sourceNameHtml  (' from ' + sourceNameHtml)  '');

            if (result.missed) {
                return revealSource && sourceActionHtml
                     (sourceNameHtml  (sourceNameHtml + ' ')  '') + 'attacks ' + targetName + ' with ' + sourceActionHtml + ' but misses.'
                     (revealSource && sourceNameHtml  (sourceNameHtml + ' attacks ' + targetName + ' but misses.')  'The attack against ' + targetName + ' misses.');
            }
            if (result.save && result.save.used) {
                const roll = result.save;
                const outcome = roll.success  ' succeeds'  ' fails';
                const ability = CombatService.abilityNameToShortLabel(roll.ability)  'SAVE';
                const badge = this.savingThrowBadgesHtml(roll, ability);
                const damageParts = this.buildDamagePartsHtml(result);
                const hasDamageAdjustment = damageParts && b(blocked byreduced byincreased by)bi.test(damageParts);
                const joinedSourcePhrase = hasDamageAdjustment && sourcePhrase  (',' + sourcePhrase)  sourcePhrase;
                const phrase = targetName + outcome + ' on the ' + ability + ' Save and takes ' + (damageParts  'no damage') + joinedSourcePhrase + (result.fainted  ' and falls unconscious'  '') + '.';
                const tempLine = result.tempAbsorbed  0
                     'div style=padding-top2px;colorrgb(52,203,116);font-size10px;line-height12px;text-aligncenter;(Some damage was absorbed by Temporary HP)div'
                     '';
                return 'table style=width100%;border-collapsecollapse;table-layoutfixed;trtd style=text-aligncenter;vertical-alignmiddle;font-size14px;line-height16px;' + phrase + 'tdtd style=width78px;text-alignright;vertical-aligntop;white-spacenowrap;' + badge + 'tdtrtable' + tempLine;
            }
            if (result.noDamage) {
                const damageParts = this.buildDamagePartsHtml(result);
                const hasDamageAdjustment = damageParts && b(blocked byreduced byincreased by)bi.test(damageParts);
                const joinedSourcePhrase = hasDamageAdjustment && sourcePhrase  (',' + sourcePhrase)  sourcePhrase;
                return targetName + ' takes ' + (damageParts  'no damage') + joinedSourcePhrase + '.';
            }

            const damageParts = this.buildDamagePartsHtml(result);
            const hasDamageAdjustment = damageParts && b(blocked byreduced byincreased by)bi.test(damageParts);
            const joinedSourcePhrase = hasDamageAdjustment && sourcePhrase  (',' + sourcePhrase)  sourcePhrase;
            const tempLine = result.tempAbsorbed  0
                 'div style=padding-top2px;colorrgb(52,203,116);font-size10px;line-height12px;text-aligncenter;(Some damage was absorbed by Temporary HP)div'
                 '';
            return targetName + ' takes ' + (damageParts  '0 damage') + joinedSourcePhrase + (result.fainted  ' and falls unconscious'  '') + '.' + tempLine;
        },

        chatTokenImageHtml(imgsrc, size, fallbackImgsrc, radius) {
            const raw = String(imgsrc  '').trim();
            const fallbackRaw = String(fallbackImgsrc  '').trim();
            const safeSize = Math.max(1, Utils.toInt(size, 24));
            const safeRadius = Math.max(0, Utils.toInt(radius, 3));
            const primary = Utils.roll20StaticPreviewUrl(raw);
            const fallback = Utils.roll20StaticPreviewUrl(fallbackRaw);
            if (!primary && !fallback) return '';

            if (Utils.isAnimatedVideoUrl(raw)) {
                 Animated Roll20 tokens have a static sample.png preview.
                 Do not layer the character avatar behind it sample.png can contain
                 transparency, which would make both images visible at the same time.
                const chosenAnimated = primary  fallback;
                return chosenAnimated
                     'span style=displayblock;width' + safeSize + 'px;height' + safeSize + 'px;' +
                        'border-radius' + safeRadius + 'px;background-colortransparent;' +
                        'background-imageurl('' + Utils.attrSafe(chosenAnimated) + '');' +
                        'background-sizecover;background-positioncenter;background-repeatno-repeat;span'
                     '';
            }

            const chosen = primary  fallback;
            return chosen
                 Html.img(chosen, 'width' + safeSize + 'px;height' + safeSize + 'px;object-fitcover;border-radius' + safeRadius + 'px;vertical-alignmiddle;displayblock;')
                 '';
        },

        titleTokenIconHtml(imgsrc, fallbackImgsrc) {
            return this.chatTokenImageHtml(imgsrc, 24, fallbackImgsrc  '', 3);
        },

        turnActionTitleHtml(token, character) {
            const imgsrc = token && Utils.isFunction(token.get)  String(token.get('imgsrc')  '').trim()  '';
            const avatar = character && Utils.isFunction(character.get)  String(character.get('avatar')  '').trim()  '';
            return (
                'table style=width100%;border-collapsecollapse;table-layoutfixed;tbodytr' +
                    'td style=width28px;text-alignleft;vertical-alignmiddle;padding0;' + this.titleTokenIconHtml(imgsrc, avatar) + 'td' +
                    'td style=text-aligncenter;vertical-alignmiddle;Turn Actiontd' +
                    'td style=width28px;text-alignright;vertical-alignmiddle;padding0;td' +
                'trtbodytable'
            );
        },

        movementTitleHtml(token, character) {
            const imgsrc = token && Utils.isFunction(token.get)  String(token.get('imgsrc')  '').trim()  '';
            const avatar = character && Utils.isFunction(character.get)  String(character.get('avatar')  '').trim()  '';
            return (
                'table style=width100%;border-collapsecollapse;table-layoutfixed;tbodytr' +
                    'td style=width28px;text-alignleft;vertical-alignmiddle;padding0;' + this.titleTokenIconHtml(imgsrc, avatar) + 'td' +
                    'td style=text-aligncenter;vertical-alignmiddle;Movement Exceededtd' +
                    'td style=width28px;text-alignright;vertical-alignmiddle;padding0;td' +
                'trtbodytable'
            );
        },

        combatLogTitleHtml(result, title) {
            result = result  {};
            const sourceName = String(result.sourceName  '').trim();
            const sourceAction = String(result.sourceAction  '').trim();
            const isManualSource = ^manual$i.test(sourceName)  ^manual(s+(damagehealing))$i.test(sourceAction);
            const showSource = RuntimeConfig.get('REVEAL_DAMAGE_SOURCE') && !isManualSource;
            const sourceHtml = showSource  this.titleTokenIconHtml(result.sourceImgsrc  '')  this.titleTokenIconHtml('');
            const targetHtml = this.titleTokenIconHtml(result.tokenImgsrc  '');
            return (
                'table style=width100%;border-collapsecollapse;table-layoutfixed;tbodytr' + (showSource 
                    'td style=width28px;text-alignleft;vertical-alignmiddle;padding0;' + sourceHtml + 'td'  t) +
                    'td style=text-aligncenter;vertical-alignmiddle;' + Utils.escapeHtml(title  'Combat Log') + 'td' +
                    'td style=width28px;text-alignright;vertical-alignmiddle;padding0;' + targetHtml + 'td' +
                'trtbodytable'
            );
        },

        concentrationTitleHtml(imgsrc, title) {
            return (
                'table style=width100%;border-collapsecollapse;table-layoutfixed;tbodytr' +
                    'td style=width28px;text-alignleft;vertical-alignmiddle;padding0;' + this.titleTokenIconHtml(imgsrc  '') + 'td' +
                    'td style=text-aligncenter;vertical-alignmiddle;' + Utils.escapeHtml(title  'Concentration') + 'td' +
                    'td style=width28px;text-alignright;vertical-alignmiddle;padding0;td' +
                'trtbodytable'
            );
        },

        sendConcentrationSpellReroll(result) {
            result = result  {};
            const spellName = String(result.spellName  'Concentration').trim();
            const formula = String(result.formula  '').trim();
            const total = Math.max(0, Utils.toInt(result.total, 0));
            const diceValues = Array.isArray(result.diceValues)  result.diceValues.map((value) = Utils.toInt(value, 0)).filter((value) = value  0)  [];
            const modifier = Utils.toInt(result.modifier, 0);
            const tooltip = 'Roll(' + (diceValues.length  diceValues.join('+')  String(total - modifier)) + ')' +
                'brModifier' + Utils.formatSigned(modifier) +
                'brTotal' + String(total);
            const body =
                'table style=width100%;border-collapsecollapse;table-layoutfixed;tbodytr' +
                    'td style=text-alignleft;vertical-alignmiddle;font-size14px;line-height16px;' +
                        'strong style=colorrgb(235,220,170);' + Utils.escapeHtml(spellName) + 'strong' +
                        (formula  ' span style=colorrgb(145,145,145);font-weight900;[' + Utils.escapeHtml(formula) + ']span'  '') +
                    'td' +
                    'td style=width48px;text-alignright;vertical-alignmiddle;' + this.numericRollBoxHtml(total, tooltip, { size 34, fontSize '18px' }) + 'td' +
                'trtbodytable';
            this.sendPublicMessage('Concentration Spell', body, 'normal', {
                titleHtml this.concentrationTitleHtml(result.casterImgsrc  '', 'Concentration Spell')
            });
        },

        sendConcentrationLost(result) {
            result = result  {};
            const revealNames = RuntimeConfig.get('REVEAL_TOKEN_NAMES_IN_LOG');
            const revealSource = RuntimeConfig.get('REVEAL_DAMAGE_SOURCE');
            const casterLabel = revealNames  String(result.casterName  'Caster')  'Caster';
            const spellName = String(result.spellName  '').trim();
            const casterHtml = Html.span(Utils.escapeHtml(casterLabel), 'color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight900;');
            const spellHtml = spellName && revealSource
                 (' on ' + Html.span(Utils.escapeHtml(spellName), 'colorrgb(245,220,80);font-weight900;'))
                 '';
            const roll = result.roll  {};
            const dc = Math.max(10, Utils.toInt(result.dc, 10));
            const total = Utils.toInt(roll.total, 0);
            const modifier = Utils.toInt(roll.modifier, 0);
            const natural = roll.natural !== undefined && roll.natural !== null  Utils.toInt(roll.natural, total - modifier)  total;
            const rollBox = this.rollBadgeHtml({
                natural,
                total,
                modifier,
                rolls roll.rolls,
                mode roll.mode  'normal',
                success false,
                tooltip 'CON SavebrTotal ' + String(total) + 'brDC ' + String(dc)
            }, '', { size 40, fontSize '20px' });
            const body =
                'table style=width100%;border-collapsecollapse;table-layoutfixed;tbodytr' +
                    'td style=text-alignleft;vertical-alignmiddle;font-size14px;line-height16px;' +
                        casterHtml + ' lost concentration' + spellHtml + '.' +
                    'td' +
                    'td style=width54px;text-alignright;vertical-alignmiddle;' + rollBox + 'td' +
                'trtbodytable';
            this.sendPublicMessage('Concentration Lost', body, 'failure', {
                titleHtml this.concentrationTitleHtml(result.casterImgsrc  '', 'Concentration Lost')
            });
        },

        sendConcentrationExpired(result) {
            result = result  {};
            const revealNames = RuntimeConfig.get('REVEAL_TOKEN_NAMES_IN_LOG');
            const revealSource = RuntimeConfig.get('REVEAL_DAMAGE_SOURCE');
            const casterLabel = revealNames  String(result.casterName  'Caster')  'Caster';
            const spellName = String(result.spellName  '').trim();
            const casterHtml = Html.span(Utils.escapeHtml(casterLabel), 'color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight900;');
            const spellHtml = spellName && revealSource
                 Html.span(Utils.escapeHtml(spellName), 'colorrgb(245,220,80);font-weight900;')
                 'the spell';
            const body = casterHtml + 's concentration on  + spellHtml + ' ends naturally as the spell reaches the end of its duration.';
            this.sendPublicMessage('Concentration Ended', body, 'normal', {
                titleHtml this.concentrationTitleHtml(result.casterImgsrc  '', 'Concentration Ended')
            });
        },

        buildDamagePartsHtml(result) {
            const rawParts = (Array.isArray(result && result.parts)  result.parts  []);
            const hadPendingDamage = (part) = Utils.toInt(part && part.adjustedBase, Utils.toInt(part && part.baseDamage, 0))  0;
            const visibleParts = rawParts.filter((part) = Utils.toInt(part && part.finalDamage, 0)  0  (!!(part && part.immune) && hadPendingDamage(part)));
            const allVisibleDamageBlockedByImmunity = visibleParts.length  0 && visibleParts.every((part) = !!part.immune && Utils.toInt(part.finalDamage, 0) = 0);
            const parts = visibleParts.map((part) = {
                const type = CombatService.normalizeDamageType(part.damageType);
                const typeLabel = type && type !== 'normal'  type  '';
                const color = this.getDamageTypeColor(type);
                const typed = typeLabel  Html.span(Utils.escapeHtml(typeLabel), 'color' + color + ';font-weight900;')  '';
                const traitLabel = typed  'damage';
                if (part.immune && Utils.toInt(part.finalDamage, 0) = 0 && hadPendingDamage(part)) {
                    return allVisibleDamageBlockedByImmunity && visibleParts.length === 1
                         'no damage, blocked by ' + traitLabel + ' immunity'
                         'no ' + (typed  (typed + ' ')  '') + 'damage, blocked by ' + traitLabel + ' immunity';
                }
                const amount = Html.span(Utils.escapeHtml(String(part.finalDamage)), 'color' + color + ';font-weight900;');
                const adjustments = [];
                if (part.immune) adjustments.push('blocked by ' + traitLabel + ' immunity');
                if (part.resistant) adjustments.push('reduced by ' + traitLabel + ' resistance');
                if (part.vulnerable) adjustments.push('increased by ' + traitLabel + ' vulnerability');
                return amount + (typed  (' ' + typed)  '') + ' damage' + (adjustments.length  (', ' + adjustments.join(' and '))  '');
            });
            return parts.join(', ');
        },

        buildHealNarrative(result) {
            result = result  {};
            const hideNames = !RuntimeConfig.get('REVEAL_TOKEN_NAMES_IN_LOG');
            const targetName = Html.span(Utils.escapeHtml(hideNames  'Target'  String(result.tokenName  'Target')), 'color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight900;');
            const displayedAmount = result.effectiveAmount !== undefined && result.effectiveAmount !== null  result.effectiveAmount  (result.amount  0);
            const amount = Html.span(Utils.escapeHtml(String(displayedAmount)), 'color' + (result.mode === 'temp'  'rgb(255,105,180)'  CONFIG.DEFAULT_TEXT_HEAL_COLOR) + ';font-weight900;');
            const sourceNameRaw = String(result.sourceName  '').trim();
            const sourceActionRaw = String(result.sourceAction  '').trim();
            const sourceName = sourceNameRaw && !^manual$i.test(sourceNameRaw)
                 Html.span(Utils.escapeHtml(hideNames  'Healer'  sourceNameRaw), 'color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight900;')
                 '';
            const sourceAction = sourceActionRaw && !^manual(s+healing)$i.test(sourceActionRaw)
                 Html.span(Utils.escapeHtml(sourceActionRaw), 'colorrgb(245,220,80);font-weight900;')
                 '';
            if (sourceName  sourceAction) {
                const source = sourceName  Html.span('Someone', 'color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight900;');
                const usingText = sourceAction  (' using ' + sourceAction)  '';
                if (result.mode === 'temp') return source + ' grants ' + amount + ' temporary HP to ' + targetName + usingText + '.';
                return source + ' heals ' + amount + ' HP to ' + targetName + usingText + '.';
            }
            if (result.mode === 'temp') {
                return targetName + ' receives ' + amount + ' temporary HP (' + Utils.escapeHtml(String(result.previousTemp  0)) + ' &rarr; ' + Utils.escapeHtml(String(result.currentTemp  0)) + ').';
            }
            return targetName + ' heals ' + amount + ' HP (' + Utils.escapeHtml(String(result.previousHp  0)) + ' &rarr; ' + Utils.escapeHtml(String(result.currentHp  0)) + (result.maxHp !== null && result.maxHp !== undefined  ('' + Utils.escapeHtml(String(result.maxHp)))  '') + ').';
        },

        showNativeSaveRollRequest(request) {
            request = request  {};
            const ability = CombatService.abilityNameToShortLabel(request.saveAbility  '')  'SAVE';
            const challenge = Math.max(0, Utils.toInt(request.challenge, 0));
            const tokenName = Html.span(Utils.escapeHtml(String(request.tokenName  'Target')), 'color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight900;');
            const damageType = CombatService.normalizeDamageType(request.damageType  'normal');
            const damageIcon = this.getDamageTypeIcon(damageType);
            const damageColor = this.getDamageTypeColor(damageType);
            const note = String(request.note  '').trim();
            const concentrationSpellName = String(request.concentrationSpellName  request.maintainSpellName  '').trim();
            const concentrationLine = concentrationSpellName
                 ('brspan style=colorrgb(190,190,190);font-size12px;to Maintain span' +
                    'strong style=colorrgb(245,220,80);' + Utils.escapeHtml(concentrationSpellName) + 'strong')
                 '';
            const damageLine = concentrationLine  (
                'brspan style=colorrgb(190,190,190);font-size12px;Damage span' +
                'strong style=color' + damageColor + ';' + damageIcon + ' ' + Utils.escapeHtml(String(request.damage  0)) +
                (damageType === 'normal'  ''  (' ' + Utils.escapeHtml(damageType))) + 'strong'
            );
            const button = this.iconButtonHtml({
                iconHtml '&#127922;',
                label ability,
                command String(request.command  '#'),
                backgroundColor 'rgba(45,45,45,0.95)',
                tooltip 'Roll ' + ability + ' saving throw'
            });
            const body =
                'table style=width100%;border-collapsecollapse;table-layoutfixed;tbodytr' +
                    'td style=text-aligncenter;vertical-alignmiddle;padding2px 8px 6px 0;font-size13px;line-height16px;colorrgb(235,235,235);' +
                        tokenName + ' must roll a strong' + Utils.escapeHtml(ability) + 'strong saving throw' + (challenge  0  (' strongDC ' + Utils.escapeHtml(String(challenge)) + 'strong')  '') + '.' +
                        damageLine +
                        (note  'brspan style=colorrgb(235,205,75);font-size11px;font-weight700;' + Utils.escapeHtml(note) + 'span'  '') +
                    'td' +
                    'td style=width56px;text-alignright;vertical-alignmiddle;padding2px 0 6px 4px;' + button + 'td' +
                'trtbodytable';
            return Html.card({
                title ability + ' Saving Throw',
                body
            });
        },

        showNativeSheetRollRequest(request) {
            request = request  {};
            const label = String(request.label  'Roll');
            const tokenName = Html.span(Utils.escapeHtml(String(request.tokenName  'Token')), 'color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight900;');
            const button = this.iconButtonHtml({
                iconHtml String(request.iconHtml  '&#127922;'),
                label,
                command String(request.command  '#'),
                backgroundColor 'rgba(45,45,45,0.95)',
                tooltip String(request.tooltip  'Roll')
            });
            const body =
                'table style=width100%;border-collapsecollapse;table-layoutfixed;tbodytr' +
                    'td style=text-aligncenter;vertical-alignmiddle;padding2px 8px 6px 0;font-size13px;line-height16px;colorrgb(235,235,235);' +
                        tokenName + ' rolls strong' + Utils.escapeHtml(String(request.rollName  label)) + 'strong.' +
                    'td' +
                    'td style=width56px;text-alignright;vertical-alignmiddle;padding2px 0 6px 4px;' + button + 'td' +
                'trtbodytable';
            return Html.card({
                title String(request.title  label + ' Roll'),
                body
            });
        },

        showNativeBatchRollRequest(request) {
            request = request  {};
            const label = String(request.label  'Roll');
            const names = (Array.isArray(request.names)  request.names  [])
                .map((name) = String(name  '').trim())
                .filter(Boolean);
            const rows = names.length
                 names.map((name) = 'div style=padding1px 0;colorrgb(225,225,225);font-size12px;line-height14px;' + Utils.escapeHtml(name) + 'div').join('')
                 'div style=colorrgb(180,180,180);font-size12px;line-height14px;No tokens listed.div';
            const button = this.iconButtonHtml({
                iconHtml String(request.iconHtml  '&#127922;'),
                label,
                command String(request.command  '#'),
                backgroundColor 'rgba(45,45,45,0.95)',
                tooltip String(request.tooltip  label)
            });
            const body =
                'table style=width100%;border-collapsecollapse;table-layoutfixed;tbodytr' +
                    'td style=text-alignleft;vertical-alignmiddle;padding2px 8px 6px 0;' +
                        'div style=colorrgb(190,190,190);font-size12px;line-height14px;padding-bottom3px;' + String(request.intro  'Roll for') + 'div' +
                        rows +
                    'td' +
                    'td style=width60px;text-alignright;vertical-alignmiddle;padding2px 0 6px 4px;' + button + 'td' +
                'trtbodytable';
            return Html.card({
                title String(request.title  label),
                body
            });
        },

        showInitiativeResults(results) {
            const rows = (Array.isArray(results)  results  []).map((result) = {
                const modifier = Utils.toInt(result.modifier, 0);
                const tokenName = Html.span(Utils.escapeHtml(String(result.tokenName  'Token')), 'color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight900;');
                const bonusHtml = Html.span(' (' + Utils.escapeHtml(Utils.formatSigned(modifier)) + ')', 'colorrgb(145,145,145);font-size11px;font-weight700;');
                const mode = String(result.mode  'normal');
                const reasonText = (mode === 'advantage'  mode === 'disadvantage')  String(result.rollModeReason  mode).trim()  '';
                const reasonMarker = mode === 'advantage'
                     Html.span(' &#9650; ', 'colorrgb(90,220,120);font-size10px;font-weight900;')
                     (mode === 'disadvantage'  Html.span(' &#9660; ', 'colorrgb(230,80,80);font-size10px;font-weight900;')  '');
                const reasonHtml = reasonText
                     'div style=colorrgb(145,145,145);font-size10px;line-height11px;font-weight700;padding-top1px;white-spacenormal;' + reasonMarker + Utils.escapeHtml(reasonText) + 'div'
                     '';
                const rolls = (Array.isArray(result.rolls) && result.rolls.length  result.rolls  [result.natural  0]).map((roll) = Utils.toInt(roll, 0));
                const chosenValue = mode === 'advantage'
                     Math.max.apply(null, rolls)
                     (mode === 'disadvantage'  Math.min.apply(null, rolls)  rolls[0]);
                let chosenUsed = false;
                const badges = rolls.map((roll) = {
                    const isChosen = !chosenUsed && roll === chosenValue;
                    if (isChosen) chosenUsed = true;
                    const marker = isChosen && mode === 'advantage'  '&#9650;'  (isChosen && mode === 'disadvantage'  '&#9660;'  '');
                    return this.rollBadgeHtml({
                        natural roll,
                        total roll + modifier,
                        modifier,
                        dimmed rolls.length  1 && !isChosen,
                        tooltip 'InitiativebrRoll (' + String(roll) + ')brModifier ' + Utils.formatSigned(modifier) + 'brTotal ' + String(roll + modifier) + (mode !== 'normal'  ('brMode ' + mode)  '')
                    }, marker, { size 34, fontSize '18px' });
                }).reverse().join('');
                return 'tr' +
                    'td style=text-alignleft;vertical-alignmiddle;padding3px 4px;font-size14px;line-height16px;' +
                        'div' + tokenName + bonusHtml + 'div' + reasonHtml +
                    'td' +
                    'td style=width86px;text-alignright;vertical-alignmiddle;padding3px 0;white-spacenowrap;overflowvisible;' +
                        'div style=displayinline-block;text-alignright;white-spacenowrap;' + badges + 'div' +
                    'td' +
                'tr';
            }).join('');
            const body = rows
                 'table style=width100%;border-collapsecollapse;table-layoutfixed;tbody' + rows + 'tbodytable'
                 'divNo initiative rolls were made.div';
            return Html.card({ title 'Initiative Roll', body });
        },

        showSavingThrowResults(results, abilityLabel) {
            const safeAbilityLabel = String(abilityLabel  'SAVE').trim().toUpperCase();
            const rows = (Array.isArray(results)  results  []).map((result) = {
                const modifier = Utils.toInt(result.modifier, 0);
                const tokenName = Html.span(Utils.escapeHtml(String(result.tokenName  'Token')), 'color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight900;');
                const bonusHtml = Html.span(' (' + Utils.escapeHtml(Utils.formatSigned(modifier)) + ')', 'colorrgb(145,145,145);font-size11px;font-weight700;');
                const mode = String(result.mode  'normal');
                const reasonText = String(result.rollModeReason  '').trim();
                const reasonHtml = reasonText
                     Html.span(' (' + Utils.escapeHtml(reasonText) + ')', 'colorrgb(145,145,145);font-size10px;font-weight700;')
                     '';
                const rolls = (Array.isArray(result.rolls) && result.rolls.length  result.rolls  [result.natural  0]).map((roll) = Utils.toInt(roll, 0));
                const chosenValue = mode === 'advantage'
                     Math.max.apply(null, rolls)
                     (mode === 'disadvantage'  Math.min.apply(null, rolls)  rolls[0]);
                let chosenUsed = false;
                const badges = rolls.map((roll) = {
                    const isChosen = !chosenUsed && roll === chosenValue;
                    if (isChosen) chosenUsed = true;
                    const marker = isChosen && mode === 'advantage'  '&#9650;'  (isChosen && mode === 'disadvantage'  '&#9660;'  '');
                    return this.rollBadgeHtml({
                        natural roll,
                        total roll + modifier,
                        modifier,
                        dimmed rolls.length  1 && !isChosen,
                        tooltip safeAbilityLabel + ' SavebrRoll (' + String(roll) + ')brModifier ' + Utils.formatSigned(modifier) + 'brTotal ' + String(roll + modifier) + (mode !== 'normal'  ('brMode ' + mode)  '')
                    }, marker, { size 34, fontSize '18px' });
                }).reverse().join('');
                return 'tr' +
                    'td style=text-alignleft;vertical-alignmiddle;padding3px 4px;font-size14px;line-height16px;' + tokenName + bonusHtml + reasonHtml + 'td' +
                    'td style=width86px;text-alignright;vertical-alignmiddle;padding3px 0;white-spacenowrap;overflowvisible;' +
                        'div style=displayinline-block;text-alignright;white-spacenowrap;' + badges + 'div' +
                    'td' +
                'tr';
            }).join('');
            const body = rows
                 'table style=width100%;border-collapsecollapse;table-layoutfixed;tbody' + rows + 'tbodytable'
                 'divNo saving throws were made.div';
            return Html.card({ title safeAbilityLabel + ' Saving Throws', body });
        }
    };

     -----------------------------------------------------------------------
      Roll parser and chat capture
      --------------------------------------------------------------------- 
    const RollParser = {
        isOwnChatMessage(msg) {
            const who = String(msg && msg.who  '').trim();
            const content = String(msg && msg.content  '');
            if (Utils.normalizeName(who).indexOf(Utils.normalizeName(META.CHAT_NAME)) = 0) return true;
            if (Combat Assistant Chat Probei.test(content)) return true;
            return false;
        },

        renderChatProbe(msg) {
            msg = msg  {};
            const keys = Object.keys(msg)
                .filter((key) = ['content', 'inlinerolls'].indexOf(key)  0)
                .sort();
            const inlineRolls = (Array.isArray(msg.inlinerolls)  msg.inlinerolls  []).map((roll, index) = ({
                index,
                expression roll && roll.expression  String(roll.expression)  '',
                total roll && roll.results && roll.results.total !== undefined  roll.results.total  ''
            }));
            const content = String(msg.content  '');
            const plain = Utils.stripHtml(content);
            const body =
                'div style=text-alignleft;font-size11px;line-height14px;colorrgb(225,225,225);' +
                    'btypeb ' + Utils.escapeHtml(msg.type  '') + 'br' +
                    'bwhob ' + Utils.escapeHtml(msg.who  '') + 'br' +
                    'brolltemplateb ' + Utils.escapeHtml(msg.rolltemplate  '') + 'br' +
                    'bkeysb ' + Utils.escapeHtml(keys.join(', ')) + 'br' +
                    'binlinerollsbbrcode style=white-spacepre-wrap;' + Utils.escapeHtml(Utils.truncate(JSON.stringify(inlineRolls), 900)) + 'codebr' +
                    'bplainbbrcode style=white-spacepre-wrap;' + Utils.escapeHtml(Utils.truncate(plain, 1400)) + 'codebr' +
                    'bcontentbbrcode style=white-spacepre-wrap;' + Utils.escapeHtml(Utils.truncate(content, 1800)) + 'code' +
                'div';
            return Html.card({ title 'Combat Assistant Chat Probe', body });
        },

        maybeDumpChatProbe(msg) {
            if (!RuntimeConfig.get('CHAT_PROBE')) return;
            if (this.isOwnChatMessage(msg)) return;
            R20.whisper('GM', this.renderChatProbe(msg));
        },

        getRollTemplateField(content, field) {
            const safeField = String(field  '').replace([.+^${}()[]]g, '$&');
            const match = String(content  '').match(new RegExp('{{' + safeField + '=([sS])}}', 'i'));
            return match  String(match[1]  '').trim()  '';
        },

        getFirstField(content, fields) {
            for (let i = 0; i  fields.length; i += 1) {
                const value = this.getRollTemplateField(content, fields[i]);
                if (String(value  '').trim()) return value;
            }
            return '';
        },

        getInlineRollTotal(msg, index) {
            const rolls = Array.isArray(msg && msg.inlinerolls)  msg.inlinerolls  [];
            const roll = rolls[index]  null;
            if (!roll  !roll.results) return null;
            if (roll.results.total !== undefined && roll.results.total !== null) return Utils.toNumber(roll.results.total, 0);
            return null;
        },

        getInlineRollFormula(msg, value) {
            const index = this.extractInlineRollIndex(value);
            if (index === null) return '';
            const rolls = Array.isArray(msg && msg.inlinerolls)  msg.inlinerolls  [];
            const roll = rolls[index]  null;
            return roll && roll.expression  String(roll.expression  '').trim()  '';
        },

        getInlineRollObject(msg, value) {
            const index = this.extractInlineRollIndex(value);
            if (index === null) return null;
            const rolls = Array.isArray(msg && msg.inlinerolls)  msg.inlinerolls  [];
            return rolls[index]  null;
        },

        extractInlineRollIndex(value) {
            const text = String(value  '');
            const match = text.match($[[(d+)]])  text.match([[.]]);
            if (!match) return null;
            if (match[1] !== undefined) return Utils.toInt(match[1], 0);
            return null;
        },

        fieldTotal(msg, value) {
            const text = String(value  '').trim();
            const index = this.extractInlineRollIndex(text);
            if (index !== null) {
                const total = this.getInlineRollTotal(msg, index);
                if (total !== null) return total;
            }
            const numeric = text.replace([^]g, '').match(-d+(.d+));
            return numeric  Utils.toNumber(numeric[0], 0)  null;
        },

        evaluateFlatMathExpression(expression) {
            const source = String(expression  '').replace(s+g, '');
            if (!source  [^0-9+-().].test(source)) return null;
            const tokens = source.match(d+(.d+)[+-()]g)  [];
            if (tokens.join('') !== source) return null;
            let index = 0;
            let invalid = false;
            const parseExpression = () = {
                let value = parseTerm();
                while (index  tokens.length && (tokens[index] === '+'  tokens[index] === '-')) {
                    const op = tokens[index++];
                    const rhs = parseTerm();
                    value = op === '+'  value + rhs  value - rhs;
                }
                return value;
            };
            const parseTerm = () = {
                let value = parseFactor();
                while (index  tokens.length && (tokens[index] === ''  tokens[index] === '')) {
                    const op = tokens[index++];
                    const rhs = parseFactor();
                    if (op === '' && rhs === 0) {
                        invalid = true;
                        return NaN;
                    }
                    value = op === ''  value  rhs  value  rhs;
                }
                return value;
            };
            const parseFactor = () = {
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
            if (invalid  index !== tokens.length) return null;
            return Number.isFinite(result)  result  null;
        },

        getInlineRollD20Natural(msg, value) {
            const roll = this.getInlineRollObject(msg, value);
            const collectDiceResults = (node, results) = {
                if (!node  typeof node !== 'object') return;
                if (Array.isArray(node)) {
                    node.forEach((entry) = collectDiceResults(entry, results));
                    return;
                }
                if (Array.isArray(node.results)) {
                    node.results.forEach((entry) = {
                        if (!entry  typeof entry !== 'object') return;
                        const sides = Utils.toInt(node.sides  node.dice  node.die  0, 0);
                        const value = entry.v !== undefined  entry.v  (entry.value !== undefined  entry.value  entry.result);
                        if ((sides === 20  d20i.test(String(node.expression  node.type  ''))) && value !== undefined && value !== null) {
                            results.push(Utils.toInt(value, 0));
                        }
                    });
                }
                Object.keys(node).forEach((key) = {
                    if (key !== 'results') collectDiceResults(node[key], results);
                });
            };
            const diceResults = [];
            collectDiceResults(roll && roll.results, diceResults);
            if (diceResults.length) return diceResults[0];

            const formula = this.getInlineRollFormula(msg, value);
            const total = this.fieldTotal(msg, value);
            if (total === null  !d20i.test(formula)) return null;
            const withoutDice = formula.replace(dd20ig, '0').replace([[^]]]g, '');
            const modifier = this.evaluateFlatMathExpression(withoutDice);
            if (modifier === null) return null;
            const natural = Math.round(Utils.toNumber(total, 0) - modifier);
            return natural = 1 && natural = 20  natural  null;
        },

        hasTemplateFlag(content, fields, flag) {
            const safeFlag = String(flag  '').trim().toLowerCase();
            if (!safeFlag) return false;
            if (Utils.toBoolean(fields[safeFlag], false)) return true;
            return new RegExp('{{' + safeFlag.replace([.+^${}()[]]g, '$&') + '=1}}', 'i').test(String(content  ''));
        },

        isZeroD20InlineRoll(msg, value) {
            const formula = this.getInlineRollFormula(msg, value);
            return b0d20bi.test(String(formula  '').replace(s+g, ''));
        },

        resolve2014TemplateD20Roll(msg, fields, content, r1Value, r2Value) {
            const r1 = this.fieldTotal(msg, r1Value);
            const rawR2 = this.fieldTotal(msg, r2Value);
            const r2IsRealRoll = rawR2 !== null && rawR2 !== undefined && !this.isZeroD20InlineRoll(msg, r2Value);
            const r2 = r2IsRealRoll  rawR2  null;
            const n1 = r1 !== null  this.getInlineRollD20Natural(msg, r1Value)  null;
            const n2 = r2 !== null  this.getInlineRollD20Natural(msg, r2Value)  null;
            const rollModeText = String(fields.rollmode  fields.type  '').toLowerCase();
            const advantage = this.hasTemplateFlag(content, fields, 'advantage')  this.hasTemplateFlag(content, fields, 'adv')  badvantagebi.test(rollModeText);
            const disadvantage = this.hasTemplateFlag(content, fields, 'disadvantage')  this.hasTemplateFlag(content, fields, 'disadv')  bdisadvantagebi.test(rollModeText);
            const always = this.hasTemplateFlag(content, fields, 'always');
            let total = r1 !== null  r1  null;
            let natural = n1;
            let mode = 'normal';
            if (r1 !== null && r2 !== null) {
                if (disadvantage) {
                    total = Math.min(r1, r2);
                    natural = r2  r1  n2  n1;
                    mode = 'disadvantage';
                } else if (advantage  always) {
                    total = Math.max(r1, r2);
                    natural = r2  r1  n2  n1;
                    mode = 'advantage';
                }
            }
            return {
                total,
                natural,
                mode,
                rolls [r1, r2].filter((value) = value !== null && value !== undefined),
                naturalRolls [n1, n2].filter((value) = value !== null && value !== undefined),
                hasSecondRoll r2 !== null && r2 !== undefined
            };
        },

        getRollTemplateFields(content) {
            const fields = Object.create(null);
            const source = String(content  '');
            const pattern = {{([^=}{]+)=([sS])}}g;
            let match;
            while ((match = pattern.exec(source)) !== null) {
                fields[String(match[1]  '').trim().toLowerCase()] = String(match[2]  '').trim();
            }
            if (!fields.charname) {
                const charMatch = source.match((^s)charname=([^rn{}]+)(=s+{{$)i);
                if (charMatch) fields.charname = String(charMatch[1]  '').trim();
            }
            return fields;
        },

        parseAdvancedHtml(content) {
            const source = String(content  '');
            if (!rolltemplatebi.test(source)) return null;
            const htmlText = (raw) = Utils.stripHtml(raw).replace(s+g, ' ').trim();
            const readDivByClass = (className) = {
                const pattern = new RegExp('divs+class=[^]' + className + '[^][^]([sS])div', 'i');
                const match = source.match(pattern);
                return match  htmlText(match[1])  '';
            };
            const characterName = Utils.cleanRoll20Label(readDivByClass('meta__character-name'));
            const titleMatch = source.match(divs+class=[^]header__title[^][^]([sS])divi);
            const rawTitle = titleMatch  Utils.cleanRoll20Label(htmlText(titleMatch[1]))  '';
            if (!rawTitle) return null;
            const textSource = htmlText(source);
            const isTemporaryHitPoints = btemporarys+hits+pointsbi.test(rawTitle)  btemporarys+hits+pointsbi.test(textSource)  btemp(orary)shpbi.test(textSource);
            const isHealing = isTemporaryHitPoints  data-rollSubcategory=(HealingHeal)i.test(source)  b(healingheal)bi.test(rawTitle)  b(healingheal)s+breakdownbi.test(textSource);
            const isTempHealing = isTemporaryHitPoints;
            const isDamage = !isHealing && (header__title[^]--damagei.test(titleMatch[0])  data-rollSubcategory=Damagei.test(source));
            const isSpellDetailsCard = !isDamage && !isHealing && (bSpells+Detailsbi.test(textSource)  (bCastings+Timesi.test(textSource) && b(ComponentsDuration)si.test(textSource)));
            const attackName = Utils.cleanRoll20Label(rawTitle.replace(s+(DamageHealingHeal)s$i, '').trim());
            const resultMatch = source.match(data-result=([+-]d+(.d+))i);
            const firstResult = resultMatch  Utils.toNumber(resultMatch[1], 0)  null;
            const damageRolls = [];
            const damagePattern = damage-breakdown__icon[sS]divs([^]+)sdivs+class=[^]damage-breakdown__total[^][^]s([+-]d+)gi;
            const formulaPattern = divs+class=[^]rt-formula__raw[^][^]([sS])divsdivs+class=[^]rt-formula__evaluated[^][^][sS]data-roll(nameid)=[^][^]s([+-]d+)gi;
            const formulas = [];
            let formulaMatch = null;
            while ((formulaMatch = formulaPattern.exec(source)) !== null) {
                formulas.push({ formula htmlText(formulaMatch[1]), total Utils.toInt(formulaMatch[2], 0) });
            }
            const formulaText = formulas.map((entry) = String(entry.formula  '')).join(' ');
            const rollModeText = [formulaText, textSource].join(' ');
            const hasD20Formula = bd20bi.test(formulaText)  bd20bi.test(source);
            const hasAttackResult = firstResult !== null && (hasD20Formula  b(AttackTos+HitHit)bi.test(textSource));
            const rollMode = badvantageb2d20kh(1)kh1i.test(rollModeText)
                 'advantage'
                 (bdisadvantageb2d20kl(1)kl1i.test(rollModeText)  'disadvantage'  'normal');
            const hasSecondRoll = hasD20Formula && (rollMode !== 'normal'  b2d20bi.test(formulaText));
            let damageMatch = null;
            while ((damageMatch = damagePattern.exec(source)) !== null) {
                const index = damageRolls.length;
                const type = isHealing  'healing'  (htmlText(damageMatch[1])  'normal');
                const total = Utils.toInt(damageMatch[2], 0);
                damageRolls.push({ total, damageType type, formula (formulas[index] && formulas[index].formula)  'Roll20' });
            }
            if (!damageRolls.length && isDamage) {
                const damageTypeMatch = textSource.match(b(acidbludgeoningcoldfireforcelightningnecroticpiercingpoisonpsychicradiantslashingthunder)s+damagebi) 
                    textSource.match(bDamages+Typess(acidbludgeoningcoldfireforcelightningnecroticpiercingpoisonpsychicradiantslashingthunder)bi);
                const damageType = damageTypeMatch  CombatService.normalizeDamageType(damageTypeMatch[1])  'normal';
                const damageFormula = formulas.length
                     formulas.map((entry) = entry.formula  '').filter(Boolean).join(' + ')
                     'Roll20';
                const formulaTotal = formulas.length
                     formulas.reduce((sum, entry) = sum + Math.max(0, Utils.toInt(entry.total, 0)), 0)
                     Math.max(0, Utils.toInt(firstResult, 0));
                if (formulaTotal  0) damageRolls.push({ total formulaTotal, damageType, formula damageFormula  'Roll20' });
            }
            if (!damageRolls.length && isHealing && firstResult !== null) {
                damageRolls.push({
                    total Math.max(0, Utils.toInt(firstResult, 0)),
                    damageType isTempHealing  'temp healing'  'healing',
                    formula formulas.length  formulas.map((entry) = entry.formula  '').filter(Boolean).join(' + ')  'Roll20'
                });
            }
            const damageTotal = damageRolls.length  damageRolls.reduce((sum, entry) = sum + Math.max(0, Utils.toInt(entry.total, 0)), 0)  ((isDamage  isHealing)  firstResult  null);
            const saveDcMatch = textSource.match(bDCs([0-9]+)i)  textSource.match(b(difficultys+class)s([0-9]+)i);
            const saveAbilityMatch = textSource.match(b(strengthdexterityconstitutionintelligencewisdomcharismastrdexconintwischa)bs+(savings+throwsave)bi)  textSource.match(b(savings+throwsave)bs[-]sb(strengthdexterityconstitutionintelligencewisdomcharismastrdexconintwischa)bi);
            const saveDc = saveDcMatch  Utils.toInt(saveDcMatch[1], 0)  0;
            const saveAbility = saveAbilityMatch  saveAbilityMatch[1]  '';
            const halfOnSuccess = bOns+Successfuls+Savess(HalfHalfs+ass+much)s+damagebi.test(textSource)  bhalfs+(ass+muchs+)damagebi.test(textSource);
            const readInlineDetail = (label) = {
                const pattern = new RegExp('b' + label + 'ss([^.;]+)(=s+b(AreaDurationCastings+TimeAttackSaveHealRangeComponentsSchoolCantripLevelMaterial)b$)', 'i');
                const detail = textSource.match(pattern);
                return detail  Utils.cleanRoll20Label(detail[1])  '';
            };
            return {
                characterName,
                attackName,
                isAttack !isDamage && !isHealing && (!isSpellDetailsCard  hasAttackResult),
                isDamage,
                isHealing,
                isTempHealing,
                attackTotal !isDamage && !isHealing && (!isSpellDetailsCard  hasAttackResult)  firstResult  null,
                damageTotal,
                damageType damageRolls.length  damageRolls[0].damageType  'normal',
                damageRolls,
                formula damageRolls.length  damageRolls.map((entry) = entry.formula  'Roll20').join(' + ')  'Roll20',
                rollMode,
                hasSecondRoll,
                saveDc,
                saveAbility,
                halfOnSuccess,
                halfOnSuccessKnown saveDc  0,
                rangeText readInlineDetail('Range'),
                durationText readInlineDetail('Duration'),
                areaText readInlineDetail('Area')
            };
        },

        extractSaveDetailsFromText(text) {
            const source = Utils.stripHtml(String(text  '')).replace(s+g, ' ').trim();
            if (!source) return { saveDc 0, saveAbility '', halfOnSuccess false };
            const saveDcMatch = source.match(bDCs([0-9]+)i)  source.match(b(difficultys+class)s([0-9]+)i);
            const abilityPattern = '(strengthdexterityconstitutionintelligencewisdomcharismastrdexconintwischa)';
            const saveAbilityMatch =
                source.match(new RegExp('bDCs[0-9]+s+' + abilityPattern + 's+(savings+throwsave)b', 'i')) 
                source.match(new RegExp('b' + abilityPattern + 's+(savings+throwsave)b', 'i')) 
                source.match(new RegExp('b(savings+throwsave)bs[-]s' + abilityPattern + 'b', 'i'));
            const halfOnSuccess = bOns+Successfuls+Savess(HalfHalfs+ass+much)s+damagebi.test(source) 
                bhalfs+(ass+muchs+)damagebi.test(source);
            return {
                saveDc saveDcMatch  Math.max(0, Utils.toInt(saveDcMatch[1], 0))  0,
                saveAbility saveAbilityMatch  CombatService.normalizeAbilityName(saveAbilityMatch[1])  '',
                halfOnSuccess
            };
        },

        extractNarrativeDamageRolls(text) {
            const source = Utils.stripHtml(String(text  '')).replace(s+g, ' ').trim();
            if (!source) return [];
            const rolls = [];
            const seen = Object.create(null);
            const knownType = '(acidbludgeoningcoldfireforcelightningnecroticpiercingpoisonpsychicradiantslashingthunder)';
            const addRoll = (totalValue, typeValue, formulaValue) = {
                const total = Math.max(0, Utils.toInt(totalValue, 0));
                const damageType = CombatService.normalizeDamageType(typeValue  'normal');
                if (total = 0  !damageType) return;
                const formula = Utils.cleanRoll20Label(formulaValue  '')  'Roll20';
                const key = String(total) + '' + damageType + '' + formula;
                if (seen[key]) return;
                seen[key] = true;
                rolls.push({ total, damageType, formula });
            };
            const scan = (regex, callback) = {
                regex.lastIndex = 0;
                let match = null;
                while ((match = regex.exec(source)) !== null) {
                    callback(match);
                    if (match.index === regex.lastIndex) regex.lastIndex += 1;
                }
            };
            scan(new RegExp(
                'b(FailureFaileds+SaveOns+Faileds+SaveHittakestakingdealssuffers)bs[^.;]{0,90}' +
                '(bd+s(sors)(d+)s(s([^()]d+dd+[^()])s)s)s' +
                knownType + 's+damageb',
                'gi'
            ), (match) = addRoll(match[1], match[3], match[2]));
            scan(new RegExp(
                'b(FailureFaileds+SaveOns+Faileds+SaveHittakestakingdealssuffers)bs[^.;]{0,90}' +
                '(d+)s+' + knownType + 's+damageb',
                'gi'
            ), (match) = addRoll(match[1], match[2], 'Roll20'));
            return rolls;
        },

        shouldSkipNarrativeDamageFallback(fields, advanced, content) {
            if (advanced && (advanced.isDamage  advanced.isHealing)) return false;
            const text = Utils.stripHtml([
                fields && fields.description,
                fields && fields.desc,
                content
            ].filter(Boolean).join(' ')).replace(s+g, ' ').trim();
            if (!text) return false;
            return bSpells+Detailsbi.test(text)  (bCastings+Timesi.test(text) && b(ComponentsDuration)si.test(text));
        },

        splitSecondarySaveDamageRolls(damageRolls, text, saveDc, saveAbility) {
            const rolls = Array.isArray(damageRolls)  damageRolls  [];
            const source = Utils.stripHtml(String(text  '')).replace(s+g, ' ').trim();
            if (rolls.length  2  !source  !saveDc  !CombatService.normalizeAbilityName(saveAbility  '')) {
                return { hasSplit false, attackDamageRolls rolls, saveDamageRolls rolls };
            }
            const mentionedIndexes = [];
            rolls.forEach((roll, index) = {
                const type = CombatService.normalizeDamageType(roll && roll.damageType  '');
                if (!type  type === 'normal'  type === 'healing'  type === 'temp healing') return;
                const escaped = type.replace([.+^${}()[]]g, '$&');
                const typeDamage = new RegExp('b' + escaped + 's+damageb', 'i');
                const damageType = new RegExp('bdamages+(types+)' + escaped + 'b', 'i');
                const takingType = new RegExp('btak(einges)b[sS]{0,80}b' + escaped + 'b[sS]{0,40}bdamageb', 'i');
                if (typeDamage.test(source)  damageType.test(source)  takingType.test(source)) mentionedIndexes.push(index);
            });
            if (mentionedIndexes.length !== 1) {
                return { hasSplit false, attackDamageRolls rolls, saveDamageRolls rolls };
            }
            const saveIndex = mentionedIndexes[0];
            const saveDamageRolls = [rolls[saveIndex]];
            const attackDamageRolls = rolls.filter((_, index) = index !== saveIndex);
            if (!attackDamageRolls.length  !saveDamageRolls.length) {
                return { hasSplit false, attackDamageRolls rolls, saveDamageRolls rolls };
            }
            return { hasSplit true, attackDamageRolls, saveDamageRolls };
        },

        parseAttackRoll(msg, fields, advanced) {
            const content = String(msg.content  '');
            if (advanced && advanced.isAttack && advanced.attackTotal !== null) {
                return {
                    total Math.max(0, Utils.toInt(advanced.attackTotal, 0)),
                    hasAttackRoll true,
                    mode advanced.rollMode  'normal',
                    rolls advanced.attackTotal !== null && advanced.attackTotal !== undefined  [Math.max(0, Utils.toInt(advanced.attackTotal, 0))]  [],
                    naturalRolls [],
                    hasSecondRoll !!advanced.hasSecondRoll,
                    saveDc advanced.saveDc  0,
                    saveAbility advanced.saveAbility  '',
                    halfOnSuccess !!advanced.halfOnSuccess,
                    halfOnSuccessKnown !!advanced.halfOnSuccessKnown
                };
            }
            const attackFieldValue = String(fields.attack  '').trim();
            const attackFieldIsRoll = !!attackFieldValue &&
                !^[01]$.test(attackFieldValue) &&
                ($[[d+]].test(attackFieldValue)  bd20bi.test(attackFieldValue)  ^[+-]d+(.d+)$.test(attackFieldValue));
            const r1Value = fields.r1  fields.atk  fields.roll  (attackFieldIsRoll  attackFieldValue  '');
            const r2Value = fields.r2  '';
            const resolvedRoll = this.resolve2014TemplateD20Roll(msg, fields, content, r1Value, r2Value);
            const saveDcField = fields.savedc  fields.save_dc  fields.dc  fields.spelldc  '';
            const saveDcTotal = saveDcField  this.fieldTotal(msg, saveDcField)  null;
            const textSave = this.extractSaveDetailsFromText([
                fields.savedesc,
                fields.save_success,
                fields.description,
                fields.desc,
                content
            ].filter(Boolean).join(' '));
            const saveDc = Math.max(0, Utils.toInt(saveDcTotal !== null  saveDcTotal  saveDcField, 0))  textSave.saveDc;
            const saveAbility = fields.saveattr  fields.saveability  fields.save_ability  fields.savetype  textSave.saveAbility  '';
            let total = resolvedRoll.total;
            const natural = resolvedRoll.natural;
            const mode = resolvedRoll.mode;
            if (total === null && saveDc  0) total = saveDc;
            return {
                total,
                hasAttackRoll resolvedRoll.total !== null && resolvedRoll.total !== undefined,
                natural,
                isCritical natural === 20,
                mode,
                rolls resolvedRoll.rolls,
                naturalRolls resolvedRoll.naturalRolls,
                saveDc,
                saveAbility,
                halfOnSuccess halfi.test(String(fields.savedesc  fields.save_success  fields.description  ''))  textSave.halfOnSuccess,
                halfOnSuccessKnown saveDc  0
            };
        },

        parseDamageRolls(msg, fields, advanced, attack) {
            if (advanced && Array.isArray(advanced.damageRolls) && advanced.damageRolls.length) {
                return advanced.damageRolls.map((entry) = ({
                    total Math.max(0, Utils.toInt(entry.total, 0)),
                    damageType CombatService.normalizeDamageType(entry.damageType  advanced.damageType  'normal'),
                    formula entry.formula  advanced.formula  'Roll20'
                }));
            }
            const damageRolls = [];
            const content = String(msg && msg.content  '');
            const hasCritTemplate = !!(
                (attack && attack.isCritical) 
                Utils.toBoolean(fields.crit  fields.critical  false, false) 
                {{crit=1}}i.test(content)
            );
            const critKeyByDamageKey = {
                dmg1 'crit1',
                dmg2 'crit2',
                globaldamage 'globaldamagecrit'
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
            damageKeys.forEach((pair) = {
                const value = fields[pair[0]];
                if (!value) return;
                if (pair[0] === 'damage' && (fields.dmg1  fields.dmg1flag  fields.dmg2)) return;
                const total = this.fieldTotal(msg, value);
                if (total === null) return;
                const rawType = fields[pair[1]]  fields.damage_type  fields.damagetype  fields.dmgtype  '';
                if (Math.max(0, Utils.toInt(total, 0)) = 0 && !String(rawType  '').trim()) return;
                const type = rawType  'normal';
                const critKey = critKeyByDamageKey[pair[0]]  '';
                const critValue = hasCritTemplate && critKey && fields[critKey]
                     this.fieldTotal(msg, fields[critKey])
                     0;
                const baseTotal = Math.max(0, Utils.toInt(total, 0));
                const critTotal = Math.max(0, Utils.toInt(critValue, 0));
                const baseFormula = this.getInlineRollFormula(msg, value)  'Roll20';
                const critFormula = critTotal  0  this.getInlineRollFormula(msg, fields[critKey])  '';
                damageRolls.push({
                    total baseTotal + critTotal,
                    damageType CombatService.normalizeDamageType(type),
                    formula critTotal  0
                         (baseFormula + ' + crit ' + (critFormula  String(critTotal)))
                         baseFormula,
                    baseTotal,
                    critTotal
                });
            });
            if (!damageRolls.length && !this.shouldSkipNarrativeDamageFallback(fields, advanced, content)) {
                const narrativeDamageRolls = this.extractNarrativeDamageRolls([
                    fields.description,
                    fields.desc,
                    fields.savedesc,
                    fields.save_success,
                    msg && msg.content
                ].filter(Boolean).join(' '));
                if (narrativeDamageRolls.length) return narrativeDamageRolls;
            }
            return damageRolls;
        },

        extractDurationText(fields, advanced, content) {
            const direct = Utils.cleanRoll20Label(
                fields.duration  fields.spellduration  fields.spell_duration  (advanced && advanced.durationText)  ''
            );
            if (direct) return direct;

            const candidates = [fields.properties, fields.props, fields.description, fields.desc, content].filter(Boolean);
            for (let i = 0; i  candidates.length; i += 1) {
                const text = Utils.stripHtml(String(candidates[i]  '')).replace(s+g, ' ').trim();
                if (!text) continue;
                const match = text.match(bDurationss(.+)(=s+b(AreaRangeCastings+TimeAttackSaveHealComponentsSchoolCantripLevelMaterial)b$)i);
                if (match && String(match[1]  '').trim()) return Utils.cleanRoll20Label(match[1]);
            }
            return '';
        },

        extractRangeText(fields, advanced, content) {
            const direct = Utils.cleanRoll20Label(fields.range  fields.spellrange  fields.attackrange  fields.reach  (advanced && advanced.rangeText)  '');
            if (direct) return direct;
            const candidates = [
                fields.properties,
                fields.props,
                fields.description,
                fields.desc,
                content
            ].filter(Boolean);
            const readWeaponRange = (value) = {
                const text = Utils.cleanRoll20Label(value).replace(s+g, ' ').trim();
                if (!text) return '';
                const slashMatch =
                    text.match(bRangess(s(d+(.d+)ssd+(.d+)(s(ft.feetfoot)))i) 
                    text.match(b(AmmunitionThrown)b[^d]{0,40}b(d+(.d+)ssd+(.d+)(s(ft.feetfoot)))i);
                if (slashMatch) return Utils.cleanRoll20Label(slashMatch[1]);
                const labeledMatch = text.match(bRangess([^.;]+)(=s+b(AreaDurationCastings+TimeAttackSaveHealComponentsSchoolCantripLevelPropertiesMasteryAmmunitionLoadingHeavyLightFinesseThrownTwo-HandedVersatileReach)b$)i);
                if (labeledMatch) return Utils.cleanRoll20Label(labeledMatch[1]);
                const singleTargetWithin =
                    text.match(b(oneathe)s+(creaturetargetobjectenemy)[^.;]{0,140}bwithins+(d+(.d+))s(feetfootft.)bi) 
                    text.match(b(targetcreatureobjectenemy)[^.;]{0,140}bwithins+(d+(.d+))s(feetfootft.)bi);
                return singleTargetWithin  (String(singleTargetWithin[1]) + ' feet')  '';
            };
            for (let i = 0; i  candidates.length; i += 1) {
                const range = readWeaponRange(candidates[i]);
                if (range) return range;
            }
            return '';
        },

        parseLightInfo(fields, advanced, content) {
            const candidates = [
                fields.description,
                fields.desc,
                fields.range,
                fields.spellrange,
                advanced && advanced.rangeText,
                advanced && advanced.areaText,
                content
            ].filter(Boolean).map((entry) = Utils.cleanRoll20Label(entry).replace(s+g, ' ').trim());
            const text = candidates.join(' ');
            if (!text) return { hasLight false };
            const unit = '(footfeetft.)';
            const number = '(d+(.d+))';
            const lightVerb = '((shedsemitscastsgivess+off)s+)';
            const brightDim = new RegExp('b' + lightVerb + 'brights+lights+(ins+as+fors+)' +
                number + 's(-s)' + unit + 's(radius)b[^.;]{0,80}bdims+lights+(fors+)(ans+additionals+)' +
                number + 's(-s)' + unit + 'b', 'i');
            const brightOnly = new RegExp('b' + lightVerb + 'brights+lights+(ins+as+fors+)' +
                number + 's(-s)' + unit + 's(radius)b', 'i');
            let match = text.match(brightDim);
            if (match) {
                const brightFeet = Math.max(0, Utils.toNumber(match[1], 0));
                const dimFeet = Math.max(0, Utils.toNumber(match[2], 0));
                return {
                    hasLight brightFeet  0  dimFeet  0,
                    brightFeet,
                    dimFeet,
                    label String(brightFeet).replace(.0+$, '') + ' ft bright' + (dimFeet  0  (' + ' + String(dimFeet).replace(.0+$, '') + ' ft dim')  '')
                };
            }
            match = text.match(brightOnly);
            if (match) {
                const brightFeet = Math.max(0, Utils.toNumber(match[1], 0));
                return {
                    hasLight brightFeet  0,
                    brightFeet,
                    dimFeet 0,
                    label String(brightFeet).replace(.0+$, '') + ' ft bright'
                };
            }
            return { hasLight false };
        },

        stripLightDescriptions(text) {
            const source = String(text  '');
            if (!source) return '';
            const unit = '(footfeetft.)';
            const number = 'd+(.d+)';
            return source
                .replace(new RegExp('b(ands+)(its+)((shedsemitscastsgivess+off)s+)brights+lights+(ins+as+fors+)' +
                    number + 's(-s)' + unit + 's(radius)b[^.;]{0,100}bdims+lights+(fors+)(ans+additionals+)' +
                    number + 's(-s)' + unit + 'b', 'gi'), ' ')
                .replace(new RegExp('b(ands+)(its+)((shedsemitscastsgivess+off)s+)brights+lights+(ins+as+fors+)' +
                    number + 's(-s)' + unit + 's(radius)b', 'gi'), ' ')
                .replace(s+g, ' ')
                .trim();
        },

        parseAreaInfo(fields, advanced, content) {
            const candidates = [
                fields.area,
                fields.aoe,
                fields.range,
                fields.spellrange,
                fields.attackrange,
                fields.description,
                fields.desc,
                advanced && advanced.rangeText,
                advanced && advanced.areaText,
                content
            ].filter(Boolean).map((entry) = Utils.cleanRoll20Label(entry));
            const texts = [];
            const textSeen = Object.create(null);
            candidates.forEach((entry) = {
                const normalized = String(entry  '')
                    .replace([u2010u2011u2012u2013u2014u2212]g, '-')
                    .replace(s+g, ' ')
                    .trim();
                const areaText = this.stripLightDescriptions(normalized);
                const key = areaText.toLowerCase();
                if (!areaText  textSeen[key]) return;
                textSeen[key] = true;
                texts.push(areaText);
            });
            if (!texts.length) return { isArea false, options [] };

            const areas = [];
            const areaSeen = Object.create(null);
            const titleShape = (shape) = {
                const raw = String(shape  '').trim().toLowerCase();
                return raw  (raw.charAt(0).toUpperCase() + raw.slice(1))  'Area';
            };
            const addArea = (lengthValue, shapeValue, widthValue, options) = {
                const areaOptions = options  {};
                const sizeFeet = Math.max(0, Utils.toNumber(lengthValue, 0));
                const rawShape = String(shapeValue  '').trim().toLowerCase();
                if (sizeFeet = 0  !rawShape) return;
                const shape = titleShape(rawShape);
                const widthFeet = rawShape === 'line'  Math.max(1, Utils.toNumber(widthValue, 5))  0;
                if (rawShape === 'line' && (widthValue === undefined  widthValue === null  String(widthValue).trim() === '')) {
                    const specificLineExists = areas.some((entry) = String(entry.shape  '').toLowerCase() === 'line' && Utils.toNumber(entry.sizeFeet, 0) === sizeFeet);
                    if (specificLineExists) return;
                }
                const key = rawShape + '' + String(sizeFeet) + '' + String(widthFeet);
                if (areaSeen[key]) return;
                areaSeen[key] = true;
                const info = {
                    isArea true,
                    sizeFeet,
                    shape,
                    label areaOptions.label  (rawShape === 'line'
                         (String(sizeFeet).replace(.0+$, '') + '-Foot x ' + String(widthFeet).replace(.0+$, '') + '-Foot Line')
                         (String(sizeFeet).replace(.0+$, '') + '-Foot ' + shape)),
                    priority Utils.toInt(areaOptions.priority, 0)
                };
                if (areaOptions.damagePointArea) info.damagePointArea = true;
                if (areaOptions.wallArea) info.wallArea = true;
                if (rawShape === 'line') {
                    info.lengthFeet = sizeFeet;
                    info.widthFeet = widthFeet;
                }
                areas.push(info);
            };
            const wordNumber = (value) = {
                const raw = String(value  '').trim().toLowerCase();
                const words = {
                    one 1,
                    two 2,
                    three 3,
                    four 4,
                    five 5,
                    six 6,
                    seven 7,
                    eight 8,
                    nine 9,
                    ten 10,
                    twelve 12
                };
                return words[raw]  Utils.toNumber(raw, 0);
            };
            const scan = (text, regex, callback) = {
                regex.lastIndex = 0;
                let match = null;
                while ((match = regex.exec(text)) !== null) {
                    callback(match);
                    if (match.index === regex.lastIndex) regex.lastIndex += 1;
                }
            };
            const unit = '(footfeetft.)';
            const number = '(d+(.d+))';

            texts.forEach((text) = {
                scan(text, new RegExp(
                    'b(eacheveryany)s+(creaturetargetobjectcreatures+ors+object)s[^.;]{0,160}bwithins+' +
                    number + 's(-s)' + unit + 's+ofs+(thatthea)s+pointb',
                    'gi'
                ), (match) = addArea(match[1], 'radius', 0, {
                    priority 20,
                    damagePointArea true,
                    label String(Utils.toNumber(match[1], 0)).replace(.0+$, '') + '-Foot Damage Radius'
                }));

                scan(text, new RegExp(
                    'b(eacheveryanyathe)s(creaturetargetobjectcreatures+ors+object)s[^.;]{0,180}bwithins+' +
                    number + 's(-s)' + unit + 's+ofs+(thattheathis)s+(sphereorbflameobjecteffect)b[^.;]{0,180}b(savings+throwsavedamage)b',
                    'gi'
                ), (match) = addArea(match[1], 'radius', 0, {
                    priority 20,
                    damagePointArea true,
                    label String(Utils.toNumber(match[1], 0)).replace(.0+$, '') + '-Foot Damage Radius'
                }));

                scan(text, new RegExp(
                    number + 's(-s)' + unit + 's(-s)longs,s(ands)' +
                    number + 's(-s)' + unit + 's(-s)wides+lineb',
                    'gi'
                ), (match) = addArea(match[1], 'line', match[2]));

                scan(text, new RegExp(
                    number + 's(-s)' + unit + 's(-s)wides,s(ands)' +
                    number + 's(-s)' + unit + 's(-s)longs+lineb',
                    'gi'
                ), (match) = addArea(match[2], 'line', match[1]));

                scan(text, new RegExp(
                    'blineb[^.;]{0,100}' + number + 's(-s)' + unit + 's(-s)long[^.;]{0,50}' +
                    number + 's(-s)' + unit + 's(-s)wide',
                    'gi'
                ), (match) = addArea(match[1], 'line', match[2]));

                scan(text, new RegExp(
                    number + 's(-s)' + unit + 's(-s)(longs+)lineb(s+thats+iss,s+and)[^.;]{0,40}' +
                    number + 's(-s)' + unit + 's(-s)wide',
                    'gi'
                ), (match) = addArea(match[1], 'line', match[2]));

                scan(text, new RegExp(
                    number + 's(' + unit + 's)(byx&times;u00d7)s' + number + 's' + unit + 's(-s)lineb',
                    'gi'
                ), (match) = {
                    const first = Utils.toNumber(match[1], 0);
                    const second = Utils.toNumber(match[2], 0);
                    addArea(Math.max(first, second), 'line', Math.min(first, second));
                });

                scan(text, new RegExp(
                    'bwallb[^.;]{0,120}b(ups+tos+)' + number + 's(-s)' + unit + 's(-s)longb[^.;]{0,120}((and,)s)' +
                    '((d+(.d+))s(-s)' + unit + 's(-s)(thickwide))',
                    'gi'
                ), (match) = addArea(match[1], 'line', Math.max(5, Utils.toNumber(match[2], 5)), {
                    priority 5,
                    wallArea true,
                    label String(Utils.toNumber(match[1], 0)).replace(.0+$, '') + '-Foot Wall'
                }));

                scan(text, new RegExp(
                    'b(hemisphericals+domedomeglobe)b[^.;]{0,100}bradiusb[^.;]{0,40}b(ups+tos+)' +
                    number + 's(-s)' + unit + 'b',
                    'gi'
                ), (match) = addArea(match[1], 'radius', 0, {
                    priority 5,
                    wallArea true,
                    label String(Utils.toNumber(match[1], 0)).replace(.0+$, '') + '-Foot Wall Radius'
                }));

                scan(text, new RegExp(
                    'b(mades+ups+ofs+ups+tos+)(d+onetwothreefourfivesixseveneightninetentwelve)s+' +
                    number + 's(-s)' + unit + 's(-s)squares+panelsb',
                    'gi'
                ), (match) = {
                    const count = Math.max(1, wordNumber(match[1]));
                    const panelSize = Math.max(1, Utils.toNumber(match[2], 10));
                    addArea(count  panelSize, 'line', 5, {
                        priority 5,
                        wallArea true,
                        label String(count  panelSize).replace(.0+$, '') + '-Foot Wall'
                    });
                });

                scan(text, new RegExp(
                    'b(mades+ups+ofs+ups+tos+)(d+onetwothreefourfivesixseveneightninetentwelve)s+' +
                    number + 's(-s)' + unit + 's(-s)(byx&times;u00d7)s(-s)' +
                    number + 's(-s)' + unit + 's(squares+)panelsb',
                    'gi'
                ), (match) = {
                    const count = Math.max(1, wordNumber(match[1]));
                    const panelSize = Math.max(1, Utils.toNumber(match[2], 10));
                    addArea(count  panelSize, 'line', 5, {
                        priority 5,
                        wallArea true,
                        label String(count  panelSize).replace(.0+$, '') + '-Foot Wall'
                    });
                });
            });

            const shapePattern = '(cubeconespherelinecylinderradiusemanation)';
            texts.forEach((text) = {
                scan(text, new RegExp(
                    'b(AreassSelfs(s)' +
                    number + 's(-s)' + unit + 's(-s)' + shapePattern + 'b',
                    'gi'
                ), (match) = {
                    const shape = String(match[2]  '').toLowerCase();
                    const sizeFeet = Math.max(0, Utils.toNumber(match[1], 0));
                    if (shape === 'line' && areas.some((entry) = String(entry.shape  '').toLowerCase() === 'line' && Utils.toNumber(entry.sizeFeet, 0) === sizeFeet)) return;
                    addArea(match[1], match[2], shape === 'line'  5  0);
                });
            });

            if (!areas.length) return { isArea false, options [] };
            const maxPriority = areas.reduce((max, area) = Math.max(max, Utils.toInt(area && area.priority, 0)), 0);
            const selectedAreas = maxPriority  0
                 areas.filter((area) = Utils.toInt(area && area.priority, 0) === maxPriority)
                 areas;
            return Object.assign({}, selectedAreas[0], { options selectedAreas });
        },

        parseMessage(msg) {
            if (!msg  msg.type === 'api') return null;
            const content = String(msg.content  '');
            if (!msg.rolltemplate && content.indexOf('{{')  0 && !rolltemplatebi.test(content)) return null;

            const fields = this.getRollTemplateFields(content);
            const advanced = this.parseAdvancedHtml(content);
            const explicitAttackNameSource = (advanced && advanced.attackName)  fields.rname  fields.attackname  fields.spellname  fields.rollname  this.getFirstField(content, ['rname', 'attackname', 'spellname', 'rollname']);
            const explicitCharacterNameSource = (advanced && advanced.characterName)  fields.charname  fields.character_name  fields.character  fields.source  this.getFirstField(content, ['charname', 'character_name', 'character', 'source']);
            const attackName = Utils.cleanRoll20Label(explicitAttackNameSource  fields.name  this.getFirstField(content, ['name'])  'Attack');
            const characterName = Utils.cleanRoll20Label(explicitCharacterNameSource  String(msg.who  '').replace(s+(GM)$i, '').trim());
            const lower = content.toLowerCase();
            const attack = this.parseAttackRoll(msg, fields, advanced);
            const damageRolls = this.parseDamageRolls(msg, fields, advanced, attack);
            const rangeText = this.extractRangeText(fields, advanced, content);
            const durationText = this.extractDurationText(fields, advanced, content);
            const damageTotal = damageRolls.length
                 damageRolls.reduce((sum, entry) = sum + Math.max(0, Utils.toInt(entry.total, 0)), 0)
                 Math.max(0, Utils.toInt(advanced && advanced.damageTotal, 0));
            const hasDamage = damageRolls.length  0  (advanced && advanced.isDamage);
            const healingSignalText = String(fields.dmg1type  fields.damage_type  fields.damagetype  fields.hldmgtype  fields.healingtype  fields.rname  fields.name  '');
            const temporaryHitPointsSignal = btemporarys+hits+pointsbi.test(healingSignalText)  btemporarys+hits+pointsbi.test(content)  btemp(orary)shpbi.test(healingSignalText)  btemp(orary)shpbi.test(content);
            const explicitHealing = (advanced && advanced.isHealing)  temporaryHitPointsSignal  b(healingheal)bi.test(healingSignalText);
            const rollLabelText = [
                msg.rolltemplate,
                explicitAttackNameSource,
                fields.rname,
                fields.rollname,
                fields.name
            ].join(' ');
            const normalizedRollLabel = Utils.normalizeName(rollLabelText);
            const looksLikeInitiative = normalizedRollLabel.indexOf('initiative') = 0  normalizedRollLabel.indexOf('init') = 0;
            const attackFieldValue = String(fields.attack  '').trim();
            const attackFieldIsRoll = !!attackFieldValue &&
                !^[01]$.test(attackFieldValue) &&
                ($[[d+]].test(attackFieldValue)  bd20bi.test(attackFieldValue)  ^[+-]d+(.d+)$.test(attackFieldValue));
            const templateName = String(msg.rolltemplate  '').trim().toLowerCase();
            const isSpellAction = !!(String(fields.spelllevel  fields.spell_level  fields.spell  '').trim()  bspells+detailsbi.test(content)  bspell-itembi.test(content));
            const isConcentration = bConcentrationbi.test(content)  bDurationssConcentrationbi.test(content);
            const lightInfo = this.parseLightInfo(fields, advanced, content);
            const areaInfo = this.parseAreaInfo(fields, advanced, content);
            const attackTemplateSignal = (^[^a-z])(atkattacknpcatknpcfullatk)([^a-z]$)i.test(templateName) && templateName !== 'dmg' && templateName !== 'npcdmg';
            const hasAttackSignal = !!(
                fields.r1 
                fields.r2 
                fields.atk 
                fields.roll 
                attackFieldIsRoll 
                {{r1=.test(lower) 
                {{atk=1}}i.test(content) 
                attackTemplateSignal
            );
            const looksLikeAttack = !looksLikeInitiative && ((advanced && advanced.isAttack)  hasAttackSignal);
            const looksLikeDamage = hasDamage  dmgd={{dmg={{globaldamage={{hldmg={{healing={{heal=.test(lower);
            const saveAbility = CombatService.normalizeAbilityName((advanced && advanced.saveAbility)  attack.saveAbility  fields.saveability  fields.saveattr  '');
            const saveDc = Math.max(0, Utils.toInt((advanced && advanced.saveDc)  attack.saveDc  0, 0));
            const hasSpellContext = !!(isSpellAction && !hasDamage && !explicitHealing && (saveDc  0  saveAbility  (areaInfo && areaInfo.isArea)));
            const splitSaveDamage = this.splitSecondarySaveDamageRolls(damageRolls, [
                fields.savedesc,
                fields.save_success,
                fields.description,
                fields.desc,
                content
            ].filter(Boolean).join(' '), saveDc, saveAbility);

            if (!looksLikeAttack && !looksLikeDamage && !explicitHealing && !hasSpellContext) return null;

            return {
                characterName,
                hasExplicitCharacterName !!String(explicitCharacterNameSource  '').trim(),
                tokenName characterName  'Token',
                tokenImgsrc R20.getTokenImageByCharacterName(characterName),
                attackName,
                hasExplicitAttackName !!String(explicitAttackNameSource  '').trim(),
                isAttack !!(looksLikeAttack  hasSpellContext),
                isDamage !!looksLikeDamage && !explicitHealing,
                isHealing !!explicitHealing,
                isTempHealing !!(advanced && advanced.isTempHealing)  temporaryHitPointsSignal,
                attackTotal Math.max(0, Utils.toInt(attack.total, 0)),
                hasAttackRoll !!attack.hasAttackRoll,
                attackNatural attack.natural,
                attackRolls attack.rolls  [],
                attackNaturalRolls attack.naturalRolls  [],
                attackHasSecondRoll !!attack.hasSecondRoll,
                isCritical !!attack.isCritical,
                rollMode attack.mode  'normal',
                saveDc,
                saveAbility,
                isSaveAttack saveDc  0,
                halfOnSuccess !!((advanced && advanced.halfOnSuccess)  attack.halfOnSuccess),
                halfOnSuccessKnown !!((advanced && advanced.halfOnSuccessKnown)  attack.halfOnSuccessKnown),
                rangeText,
                durationText,
                isSpellAction,
                isConcentration,
                hasSpellContext,
                lightInfo,
                areaInfo,
                damageType damageRolls.length  damageRolls[0].damageType  ((advanced && advanced.damageType)  'normal'),
                damageTotal,
                healTotal damageTotal,
                damageFormula damageRolls.map((entry) = entry.formula  'Roll20').join(' + ')  'Roll20',
                damageRolls,
                hasSecondarySaveDamageSplit !!splitSaveDamage.hasSplit,
                attackDamageRolls splitSaveDamage.attackDamageRolls,
                saveDamageRolls splitSaveDamage.saveDamageRolls
            };
        },

        capturedRollKey(characterName, attackName) {
            return Utils.normalizeName(characterName) + '' + Utils.normalizeName(attackName);
        },

        rememberAttack(entry) {
            const root = State.get();
            root.recentAttacks = root.recentAttacks  {};
            root.recentAttackQueue = Array.isArray(root.recentAttackQueue)  root.recentAttackQueue  [];
            const next = Object.assign({}, entry, { timestamp Date.now() });
            const key = this.capturedRollKey(next.characterName, next.attackName);
            root.recentAttacks[key] = next;
            root.recentAttackQueue.push(next);
            this.pruneRecentAttacks();
            return next;
        },

        pruneRecentAttacks() {
            const root = State.get();
            const now = Date.now();
            root.recentAttackQueue = (root.recentAttackQueue  []).filter((entry) = entry && now - Number(entry.timestamp  0) = 60000).slice(-20);
            Object.keys(root.recentAttacks  {}).forEach((key) = {
                if (now - Number(root.recentAttacks[key] && root.recentAttacks[key].timestamp  0)  60000) delete root.recentAttacks[key];
            });
        },

        findRecentAttack(characterName, attackName) {
            this.pruneRecentAttacks();
            const root = State.get();
            const direct = root.recentAttacks[this.capturedRollKey(characterName, attackName)];
            if (direct) return direct;
            const normalizedCharacter = Utils.normalizeName(characterName);
            const normalizedAttack = Utils.normalizeName(attackName);
            for (let i = (root.recentAttackQueue  []).length - 1; i = 0; i -= 1) {
                const entry = root.recentAttackQueue[i];
                if (!entry) continue;
                const entryCharacter = Utils.normalizeName(entry.characterName);
                const entryAttack = Utils.normalizeName(entry.attackName);
                if (normalizedCharacter && entryCharacter && normalizedCharacter !== entryCharacter) continue;
                if (normalizedAttack && entryAttack && normalizedAttack !== entryAttack && normalizedAttack.indexOf(entryAttack)  0 && entryAttack.indexOf(normalizedAttack)  0) continue;
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
            root.pendingNativeSaves = root.pendingNativeSaves  {};
            const now = Date.now();
            const maxAge = Math.max(10000, Utils.toInt(maxAgeMs, 120000));
            Object.keys(root.pendingNativeSaves).forEach((key) = {
                const entry = root.pendingNativeSaves[key];
                const createdAt = Math.max(0, Utils.toInt(entry && entry.createdAt, 0));
                if (!createdAt  now - createdAt  maxAge) delete root.pendingNativeSaves[key];
            });
        },

        createPendingNativeSave(entry) {
            this.prunePendingNativeSaves();
            const root = State.get();
            root.pendingNativeSaves = root.pendingNativeSaves  {};
            const tokenId = String(entry && entry.tokenId  '').trim();
            const rollName = String(entry && entry.rollName  '').trim();
            const normalizedRollName = Utils.normalizeName(rollName);
            Object.keys(root.pendingNativeSaves).forEach((key) = {
                const existing = root.pendingNativeSaves[key]  {};
                if (!tokenId  String(existing.tokenId  '').trim() !== tokenId) return;
                if (normalizedRollName && Utils.normalizeName(existing.rollName  '') !== normalizedRollName) return;
                delete root.pendingNativeSaves[key];
            });
            const requestId = this.makePendingNativeSaveId();
            root.pendingNativeSaves[requestId] = Object.assign({}, entry  {}, {
                id requestId,
                kind 'saving',
                characterName String(entry && entry.characterName  '').trim(),
                normalizedCharacter Utils.normalizeName(entry && entry.characterName  ''),
                rollName,
                normalizedRollName,
                tokenId,
                characterId String(entry && entry.characterId  '').trim(),
                captureNative !entry  !Object.prototype.hasOwnProperty.call(entry, 'captureNative')  true  Utils.toBoolean(entry.captureNative, true),
                forcedRollMode String(entry && entry.forcedRollMode  '').trim(),
                forcedRollReason String(entry && entry.forcedRollReason  '').trim(),
                createdAt Date.now()
            });
            return requestId;
        },

        consumePendingNativeSaveById(requestId) {
            this.prunePendingNativeSaves();
            const root = State.get();
            root.pendingNativeSaves = root.pendingNativeSaves  {};
            const safeRequestId = String(requestId  '').trim();
            if (!safeRequestId  !root.pendingNativeSaves[safeRequestId]) return null;
            const entry = root.pendingNativeSaves[safeRequestId];
            delete root.pendingNativeSaves[safeRequestId];
            return entry  null;
        },

        getPendingNativeSaveById(requestId) {
            this.prunePendingNativeSaves();
            const root = State.get();
            root.pendingNativeSaves = root.pendingNativeSaves  {};
            const safeRequestId = String(requestId  '').trim();
            return safeRequestId && root.pendingNativeSaves[safeRequestId]  root.pendingNativeSaves[safeRequestId]  null;
        },

        prunePendingNativeInitiatives(maxAgeMs) {
            const root = State.get();
            root.pendingNativeInitiatives = root.pendingNativeInitiatives  {};
            root.pendingNativeInitiativeBatches = root.pendingNativeInitiativeBatches  {};
            const now = Date.now();
            const maxAge = Math.max(10000, Utils.toInt(maxAgeMs, 120000));
            Object.keys(root.pendingNativeInitiatives).forEach((key) = {
                const entry = root.pendingNativeInitiatives[key];
                const createdAt = Math.max(0, Utils.toInt(entry && entry.createdAt, 0));
                if (!createdAt  now - createdAt  maxAge) delete root.pendingNativeInitiatives[key];
            });
            Object.keys(root.pendingNativeInitiativeBatches).forEach((key) = {
                const entry = root.pendingNativeInitiativeBatches[key];
                const createdAt = Math.max(0, Utils.toInt(entry && entry.createdAt, 0));
                if (!createdAt  now - createdAt  maxAge) delete root.pendingNativeInitiativeBatches[key];
            });
        },

        getTurnOrderSnapshot() {
            if (typeof Campaign !== 'function') return [];
            try {
                const parsed = JSON.parse(Campaign().get('turnorder')  '[]');
                return Array.isArray(parsed)  parsed.filter(Boolean).map((entry) = Object.assign({}, entry))  [];
            } catch (error) {
                return [];
            }
        },

        createPendingNativeInitiativeBatch(tokens) {
            this.prunePendingNativeInitiatives();
            const root = State.get();
            root.pendingNativeInitiativeBatches = root.pendingNativeInitiativeBatches  {};
            const tokenIds = (Array.isArray(tokens)  tokens  [])
                .map((token) = String(token && ((Utils.isFunction(token.get)  token.get('_id')  '')  token.id)  '').trim())
                .filter(Boolean);
            const batchId = this.makePendingNativeInitiativeBatchId();
            root.pendingNativeInitiativeBatches[batchId] = {
                id batchId,
                tokenIds,
                results {},
                autoQueue [],
                activeAutoRequestId '',
                turnorderSnapshot this.getTurnOrderSnapshot(),
                createdAt Date.now()
            };
            return batchId;
        },

        getPendingNativeInitiativeBatch(batchId) {
            const root = State.get();
            root.pendingNativeInitiativeBatches = root.pendingNativeInitiativeBatches  {};
            const safeBatchId = String(batchId  '').trim();
            return safeBatchId  (root.pendingNativeInitiativeBatches[safeBatchId]  null)  null;
        },

        setNativeInitiativeAutoQueue(batchId, rolls, onComplete) {
            const batch = this.getPendingNativeInitiativeBatch(batchId);
            if (!batch) return false;
            batch.autoQueue = (Array.isArray(rolls)  rolls  [])
                .map((roll, index) = ({
                    requestId String(roll && roll.requestId  '').trim(),
                    nativeCommand String(roll && roll.nativeCommand  '').trim(),
                    tokenName String(roll && roll.tokenName  'Token').trim(),
                    index,
                    status 'pending'
                }))
                .filter((roll) = roll.requestId && roll.nativeCommand);
            batch.activeAutoRequestId = '';
            if (Utils.isFunction(onComplete)) INITIATIVE_AUTO_COMPLETIONS[String(batchId  '').trim()] = onComplete;
            return batch.autoQueue.length  0;
        },

        finishNativeInitiativeAutoQueue(batchId) {
            const safeBatchId = String(batchId  '').trim();
            const onComplete = safeBatchId  INITIATIVE_AUTO_COMPLETIONS[safeBatchId]  null;
            if (!Utils.isFunction(onComplete)) return false;
            delete INITIATIVE_AUTO_COMPLETIONS[safeBatchId];
            try {
                onComplete();
            } catch (error) {
                Logger.error('[initiative-auto-complete]', error && error.message  error.message  String(error));
            }
            return true;
        },

        advanceNativeInitiativeAutoQueue(batchId) {
            const batch = this.getPendingNativeInitiativeBatch(batchId);
            if (!batch  !Array.isArray(batch.autoQueue)) {
                this.finishNativeInitiativeAutoQueue(batchId);
                return false;
            }
            if (String(batch.activeAutoRequestId  '').trim()) return false;
            const next = batch.autoQueue.find((entry) = entry && entry.status === 'pending');
            if (!next) {
                this.finishNativeInitiativeAutoQueue(batchId);
                return false;
            }
            next.status = 'waiting';
            batch.activeAutoRequestId = next.requestId;
            setTimeout(() = {
                try {
                     Sheet abilities must use normal chat dispatch so Roll20 emits
                     the rendered roll to chatmessage for initiative capture.
                    R20.send(next.nativeCommand);
                    const watchdogKey = String(batchId) + '' + String(next.requestId);
                    if (INITIATIVE_AUTO_WATCHDOGS[watchdogKey]) clearTimeout(INITIATIVE_AUTO_WATCHDOGS[watchdogKey]);
                    INITIATIVE_AUTO_WATCHDOGS[watchdogKey] = setTimeout(() = {
                        delete INITIATIVE_AUTO_WATCHDOGS[watchdogKey];
                        const currentBatch = this.getPendingNativeInitiativeBatch(batchId);
                        if (!currentBatch  String(currentBatch.activeAutoRequestId  '') !== String(next.requestId)) return;
                        next.status = 'failed';
                        currentBatch.activeAutoRequestId = '';
                        this.removePendingNativeInitiativeById(next.requestId);
                        R20.whisper('GM', Html.card({
                            title 'Initiative Roll Timeout',
                            body 'div style=font-size12px;line-height15px;No initiative result was captured for strong' + Utils.escapeHtml(next.tokenName  'Token') + 'strong. The remaining rolls will continue.div'
                        }));
                        this.advanceNativeInitiativeAutoQueue(batchId);
                    }, 5000);
                } catch (error) {
                    Logger.error('[initiative-auto-roll]', error && error.message  error.message  String(error));
                    next.status = 'failed';
                    batch.activeAutoRequestId = '';
                    this.advanceNativeInitiativeAutoQueue(batchId);
                }
            }, 100);
            return true;
        },

        formatInitiativeValue(value) {
            const safeValue = Math.round(Utils.toNumber(value, 0)  100)  100;
            return Number.isInteger(safeValue)  String(safeValue)  safeValue.toFixed(2).replace(0+$g, '').replace(.$, '');
        },

        getCurrentTurnOrder() {
            if (typeof Campaign !== 'function') return [];
            try {
                const parsed = JSON.parse(Campaign().get('turnorder')  '[]');
                return Array.isArray(parsed)  parsed.filter(Boolean).map((entry) = Object.assign({}, entry))  [];
            } catch (error) {
                return [];
            }
        },

        getTokenPageId(tokenId) {
            const token = R20.getTokenById(tokenId);
            return token && Utils.isFunction(token.get)  String(token.get('_pageid')  '').trim()  '';
        },

        makeTurnOrderEntry(tokenId, initiativeTotal) {
            const safeTokenId = String(tokenId  '').trim();
            const entry = { id safeTokenId, pr this.formatInitiativeValue(initiativeTotal), custom '' };
            const pageId = this.getTokenPageId(safeTokenId);
            if (pageId) entry._pageid = pageId;
            return entry;
        },

        updateTurnOrderWithInitiativeResults(results) {
            const safeResults = (Array.isArray(results)  results  [])
                .filter((result) = result && result.tokenId && result.total !== undefined && result.total !== null);
            if (!safeResults.length  typeof Campaign !== 'function') return false;
            const priorityValue = (value) = Utils.toNumber(value, 0);
            const sortedResults = safeResults
                .map((result, index) = Object.assign({ __order index }, result))
                .sort((a, b) = {
                    const diff = priorityValue(b.total) - priorityValue(a.total);
                    if (diff !== 0) return diff;
                    return Utils.toInt(a.__order, 0) - Utils.toInt(b.__order, 0);
                });

            const before = this.getCurrentTurnOrder();
            let turnOrder = before.map((entry) = Object.assign({}, entry));
            const trackerState = State.get().turnTracker && typeof State.get().turnTracker === 'object'
                 State.get().turnTracker
                 {};
            const activeCurrentTokenId = trackerState.active
                 String(trackerState.currentTokenId  '').trim()
                 '';
            const rolledIds = Object.create(null);
            sortedResults.forEach((result) = {
                const id = String(result.tokenId  '').trim();
                if (id) rolledIds[id] = true;
            });

            turnOrder = turnOrder.filter((entry) = {
                const id = String(entry && entry.id  '').trim();
                return !id  !rolledIds[id];
            });
            sortedResults.forEach((result) = {
                turnOrder.push(this.makeTurnOrderEntry(result.tokenId, result.total));
            });
            turnOrder.sort((a, b) = priorityValue(b && b.pr) - priorityValue(a && a.pr));

             Roll20 treats index 0 as the active turn. During an active combat,
             sorting a newly rolled initiative must not jump the turn back to the
             highest initiative. Keep the full initiative order, but rotate that
             sorted cycle so the token that was already acting remains at index 0.
            if (activeCurrentTokenId) {
                const activeIndex = turnOrder.findIndex((entry) = String(entry && entry.id  '').trim() === activeCurrentTokenId);
                if (activeIndex  0) turnOrder = turnOrder.slice(activeIndex).concat(turnOrder.slice(0, activeIndex));
            }

            const firstPageId = String((sortedResults.find((result) = String(result.pageId  '').trim())  {}).pageId  this.getTokenPageId(sortedResults[0].tokenId)  '').trim();
            Campaign().set('turnorder', JSON.stringify(turnOrder));
            if (firstPageId) Campaign().set('initiativepage', firstPageId);
            this.debugTurnOrderWrite('Native Initiative Update', before, turnOrder);
            return true;
        },

        debugTurnOrderWrite(source, before, after) {
            if (!RuntimeConfig.get('DEBUG')) return;
            Render.sendPublicMessage(
                'Turn Order Debug',
                'div style=text-alignleft;font-size11px;line-height13px;' +
                    'strongSourcestrong ' + Utils.escapeHtml(String(source  'Unknown')) + 'br' +
                    'strongBeforestrongbrcode' + Utils.escapeHtml(JSON.stringify(before  [])) + 'codebr' +
                    'strongAfterstrongbrcode' + Utils.escapeHtml(JSON.stringify(after  [])) + 'code' +
                'div',
                'normal'
            );
        },

        createPendingNativeInitiative(entry) {
            this.prunePendingNativeInitiatives();
            const root = State.get();
            root.pendingNativeInitiatives = root.pendingNativeInitiatives  {};
            root.pendingNativeInitiativeSeq = Math.max(0, Utils.toInt(root.pendingNativeInitiativeSeq, 0)) + 1;
            const requestId = this.makePendingNativeInitiativeId();
            root.pendingNativeInitiatives[requestId] = Object.assign({}, entry  {}, {
                id requestId,
                kind 'initiative',
                characterName String(entry && entry.characterName  '').trim(),
                normalizedCharacter Utils.normalizeName(entry && entry.characterName  ''),
                tokenId String(entry && entry.tokenId  '').trim(),
                characterId String(entry && entry.characterId  '').trim(),
                batchId String(entry && entry.batchId  '').trim(),
                sequence root.pendingNativeInitiativeSeq,
                createdAt Date.now()
            });
            return requestId;
        },

        removePendingNativeInitiativeById(requestId) {
            const safeRequestId = String(requestId  '').trim();
            if (!safeRequestId) return false;
            const root = State.get();
            root.pendingNativeInitiatives = root.pendingNativeInitiatives  {};
            if (!root.pendingNativeInitiatives[safeRequestId]) return false;
            delete root.pendingNativeInitiatives[safeRequestId];
            return true;
        },

        resolvePendingNativeSave(characterName, rollName) {
            this.prunePendingNativeSaves();
            const root = State.get();
            root.pendingNativeSaves = root.pendingNativeSaves  {};
            const normalizedCharacter = Utils.normalizeName(characterName);
            const normalizedRoll = Utils.normalizeName(rollName);
            const entries = Object.keys(root.pendingNativeSaves)
                .map((key) = root.pendingNativeSaves[key])
                .filter(Boolean)
                .filter((entry) = entry.captureNative !== false)
                .sort((a, b) = Utils.toInt(a.createdAt, 0) - Utils.toInt(b.createdAt, 0));
            if (!entries.length) return null;

            const matches = entries.filter((entry) = {
                if (entry.normalizedCharacter && normalizedCharacter && entry.normalizedCharacter !== normalizedCharacter) return false;
                if (!entry.normalizedRollName  !normalizedRoll) return true;
                return normalizedRoll.indexOf(entry.normalizedRollName) = 0  entry.normalizedRollName.indexOf(normalizedRoll) = 0;
            });
            let entry = matches[0]  null;
            if (!entry && normalizedCharacter) {
                const characterMatches = entries.filter((candidate) = {
                    if (!candidate.normalizedCharacter) return false;
                    return candidate.normalizedCharacter === normalizedCharacter;
                });
                if (characterMatches.length === 1) entry = characterMatches[0];
            }
            if (!entry && entries.length === 1 && !normalizedRoll) {
                const only = entries[0];
                if (!normalizedCharacter  !only.normalizedCharacter  only.normalizedCharacter === normalizedCharacter) entry = only;
            }
            if (!entry && !normalizedCharacter) entry = entries[0]  null;
            if (!entry) return null;
            delete root.pendingNativeSaves[entry.id];
            return entry;
        },

        resolvePendingNativeInitiative(characterName) {
            this.prunePendingNativeInitiatives();
            const root = State.get();
            root.pendingNativeInitiatives = root.pendingNativeInitiatives  {};
            const normalizedCharacter = Utils.normalizeName(characterName);
            const entries = Object.keys(root.pendingNativeInitiatives)
                .map((key) = root.pendingNativeInitiatives[key])
                .filter(Boolean)
                .sort((a, b) = {
                    const seqDiff = Utils.toInt(a.sequence, 0) - Utils.toInt(b.sequence, 0);
                    return seqDiff  (Utils.toInt(a.createdAt, 0) - Utils.toInt(b.createdAt, 0));
                });
            if (!entries.length) return null;
            let entry = entries.find((candidate) = {
                if (!normalizedCharacter) return true;
                if (!candidate.normalizedCharacter) return false;
                return candidate.normalizedCharacter === normalizedCharacter;
            })  null;
            if (!entry) {
                const activeEntries = entries.filter((candidate) = {
                    const batch = this.getPendingNativeInitiativeBatch(candidate.batchId);
                    return batch && String(batch.activeAutoRequestId  '').trim() === String(candidate.id  '').trim();
                });
                if (activeEntries.length === 1) entry = activeEntries[0];
            }
            if (!entry && !normalizedCharacter) entry = entries[0];
            if (!entry) return null;
            delete root.pendingNativeInitiatives[entry.id];
            return entry;
        },

        recordPendingNativeInitiativeResult(tokenId, initiativeTotal, batchId, requestId) {
            const safeTokenId = String(tokenId  '').trim();
            const batch = this.getPendingNativeInitiativeBatch(batchId);
            if (!safeTokenId  !batch) return false;
            batch.results = batch.results  {};
            batch.results[safeTokenId] = Math.round(Utils.toNumber(initiativeTotal, 0)  100)  100;
            const knownResults = [];
            (Array.isArray(batch.tokenIds)  batch.tokenIds  []).forEach((id) = {
                const knownTokenId = String(id  '').trim();
                if (!knownTokenId  !Object.prototype.hasOwnProperty.call(batch.results  {}, knownTokenId)) return;
                knownResults.push({
                    tokenId knownTokenId,
                    pageId this.getTokenPageId(knownTokenId),
                    total batch.results[knownTokenId]
                });
            });
            this.updateTurnOrderWithInitiativeResults(knownResults);
            const safeRequestId = String(requestId  '').trim();
            if (safeRequestId && String(batch.activeAutoRequestId  '').trim() === safeRequestId) {
                const watchdogKey = String(batchId) + '' + safeRequestId;
                if (INITIATIVE_AUTO_WATCHDOGS[watchdogKey]) {
                    clearTimeout(INITIATIVE_AUTO_WATCHDOGS[watchdogKey]);
                    delete INITIATIVE_AUTO_WATCHDOGS[watchdogKey];
                }
                const active = (Array.isArray(batch.autoQueue)  batch.autoQueue  [])
                    .find((entry) = entry && String(entry.requestId  '').trim() === safeRequestId);
                if (active) active.status = 'done';
                batch.activeAutoRequestId = '';
                setTimeout(() = this.advanceNativeInitiativeAutoQueue(batchId), 150);
            }
            const expectedIds = (Array.isArray(batch.tokenIds)  batch.tokenIds  [])
                .map((id) = String(id  '').trim())
                .filter(Boolean);
            const complete = expectedIds.length  0 && expectedIds.every((id) = Object.prototype.hasOwnProperty.call(batch.results  {}, id));
            if (complete) this.schedulePendingNativeInitiativeBatchFlush(batchId, 250);
            return true;
        },

        schedulePendingNativeInitiativeBatchFlush(batchId, delayMs) {
            const safeBatchId = String(batchId  '').trim();
            if (!safeBatchId) return;
            if (INITIATIVE_BATCH_TIMERS[safeBatchId]) clearTimeout(INITIATIVE_BATCH_TIMERS[safeBatchId]);
            INITIATIVE_BATCH_TIMERS[safeBatchId] = setTimeout(() = {
                delete INITIATIVE_BATCH_TIMERS[safeBatchId];
                try {
                    this.flushPendingNativeInitiativeBatch(safeBatchId);
                } catch (error) {
                    Logger.error('[initiative-batch-flush]', error && error.message  error.message  String(error));
                }
            }, Math.max(100, Utils.toInt(delayMs, 600)));
        },

        flushPendingNativeInitiativeBatch(batchId) {
            const batch = this.getPendingNativeInitiativeBatch(batchId);
            if (!batch) return false;
            const root = State.get();
            root.pendingNativeInitiativeBatches = root.pendingNativeInitiativeBatches  {};
            const safeBatchId = String(batchId  '').trim();
            delete INITIATIVE_AUTO_COMPLETIONS[safeBatchId];
            delete root.pendingNativeInitiativeBatches[safeBatchId];
            return true;
        },

        getRollTemplateBlocks(content) {
            const source = String(content  '');
            const blocks = [];
            const pattern = rolltemplateb[sS]rolltemplategi;
            let match = null;
            while ((match = pattern.exec(source)) !== null) {
                if (match[0]) blocks.push(match[0]);
            }
            return blocks.length  blocks  [source];
        },

        extractNativeInitiativeRolls(msg, parsed) {
            const content = String(msg && msg.content  '');
            const rolls = [];
            const blocks = this.getRollTemplateBlocks(content);
            const isInitiativeLabel = (value) = {
                const normalized = Utils.normalizeName(value  '');
                return normalized.indexOf('initiative') = 0  normalized.indexOf('init') = 0;
            };
            const isInitiativeFields = (fields, block, advanced) = {
                const label = [
                    msg && msg.rolltemplate,
                    advanced && advanced.attackName,
                    fields && fields.rname,
                    fields && fields.rollname,
                    fields && fields.name
                ].join(' ');
                return isInitiativeLabel(label)  binitiativebi.test(block  '');
            };

            blocks.forEach((block) = {
                const advanced = this.parseAdvancedHtml(block);
                const fields = this.getRollTemplateFields(block);
                if (!isInitiativeFields(fields, block, advanced)) return;
                const attack = this.parseAttackRoll(msg, fields, advanced);
                const resultMatch = String(block  '').match(data-result=([+-]d+(.d+))i);
                const total = attack && attack.total !== null && attack.total !== undefined
                     Utils.toNumber(attack.total, 0)
                     (advanced && advanced.attackTotal !== null && advanced.attackTotal !== undefined
                         Utils.toNumber(advanced.attackTotal, 0)
                         (resultMatch  Utils.toNumber(resultMatch[1], 0)  null));
                if (total === null  total === undefined  Number.isNaN(Number(total))) return;
                rolls.push({
                    characterName (advanced && advanced.characterName)  fields.charname  '',
                    total
                });
            });

            if (!rolls.length && parsed) {
                const rollName = parsed.attackName  String(parsed.attackName  '')  '';
                if (!rollName  isInitiativeLabel(rollName)) {
                    const total = this.extractCapturedRollTotal(msg, parsed);
                    if (total !== null && total !== undefined && !Number.isNaN(Number(total))) {
                        rolls.push({
                            characterName parsed.characterName  '',
                            total
                        });
                    }
                }
            }

            if (!rolls.length && binitiativebi.test(content)) {
                const totals = [];
                const resultPattern = data-result=([+-]d+(.d+))gi;
                let resultMatch = null;
                while ((resultMatch = resultPattern.exec(content)) !== null) {
                    totals.push(Utils.toNumber(resultMatch[1], 0));
                }
                totals.forEach((total) = {
                    if (total !== null && total !== undefined && !Number.isNaN(Number(total))) {
                        rolls.push({
                            characterName '',
                            total
                        });
                    }
                });
            }

            return rolls;
        },

        async handlePendingNativeInitiativeCapture(parsed, msg) {
            const root = State.get();
            if (!root.pendingNativeInitiatives  !Object.keys(root.pendingNativeInitiatives).length) return false;
            if (!msg  msg.type === 'api') return false;
            const content = String(msg && msg.content  '');
            const rolls = this.extractNativeInitiativeRolls(msg, parsed);
            if (!rolls.length) return false;
            let applied = 0;
            rolls.forEach((roll) = {
                const characterName = roll.characterName  '';
                const pending = this.resolvePendingNativeInitiative(characterName);
                if (!pending) return;
                if (this.recordPendingNativeInitiativeResult(pending.tokenId, roll.total, pending.batchId, pending.id)) applied += 1;
            });
            return applied  0;
        },

        extractCapturedRollTotal(msg, parsed) {
            const content = String(msg && msg.content  '');
            const advanced = this.parseAdvancedHtml(content);
            if (advanced && advanced.attackTotal !== null && advanced.attackTotal !== undefined) return Utils.toNumber(advanced.attackTotal, 0);
            if (parsed && parsed.attackTotal !== undefined && parsed.attackTotal !== null) return Utils.toNumber(parsed.attackTotal, 0);
            const resultMatch = content.match(data-result=([+-]d+(.d+))i);
            if (resultMatch) return Utils.toNumber(resultMatch[1], 0);
            const rolls = Array.isArray(msg && msg.inlinerolls)  msg.inlinerolls  [];
            for (let i = 0; i  rolls.length; i += 1) {
                if (rolls[i] && rolls[i].results && rolls[i].results.total !== undefined && rolls[i].results.total !== null) {
                    return Utils.toNumber(rolls[i].results.total, 0);
                }
            }
            return null;
        },

        normalizeTemplateRollName(value) {
            return Utils.cleanRoll20Label(String(value  '')
                .replace(^{([^}]+)}g, '$1')
                .replace([-_]+ubgi, '')
                .replace([-_]+g, ' ')
                .replace(s+g, ' ')
                .trim());
        },

        extractSimpleNativeSaveBlocks(content) {
            const source = String(content  '');
            const starts = [];
            const pattern = {{rname=gi;
            let match = null;
            while ((match = pattern.exec(source)) !== null) {
                starts.push(match.index);
            }
            if (starts.length = 1) return [source];
            return starts.map((start, index) = source.slice(start, index + 1  starts.length  starts[index + 1]  source.length).trim()).filter(Boolean);
        },

        extractSimpleNativeSaveRoll(msg, content) {
            const source = String(content  '');
            const templateName = String(msg && msg.rolltemplate  '').trim().toLowerCase();
            if (templateName && templateName !== 'simple') return null;
            if (!{{r1=.test(source) && !br1=$[[d+]]i.test(source)) return null;
            const fields = this.getRollTemplateFields(source);
            const rawRollName = fields.rname  fields.rollname  fields.name  '';
            const rollName = this.normalizeTemplateRollName(rawRollName);
            const label = [templateName, rawRollName, rollName, source].join(' ');
            if (Utils.normalizeName(label).indexOf('initiative') = 0) return null;
            if (!bsavebbsavingbbsalvacii.test(label)) return null;
            const resolved = this.resolve2014TemplateD20Roll(msg, fields, source, fields.r1  fields.roll  '', fields.r2  '');
            let total = resolved.total;
            if (total === null  total === undefined  Number.isNaN(Number(total))) total = this.getInlineRollTotal(msg, 0);
            if (total === null  total === undefined  Number.isNaN(Number(total))) return null;
            const characterName = Utils.cleanRoll20Label(
                fields.charname 
                fields.character_name 
                fields.character 
                ''
            );
            return {
                characterName,
                rollName,
                total,
                mode resolved.mode  'normal',
                rolls Array.isArray(resolved.rolls)  resolved.rolls  [],
                hasSecondRoll !!resolved.hasSecondRoll
            };
        },

        extractSimpleNativeSaveRolls(msg, content) {
            const templateName = String(msg && msg.rolltemplate  '').trim().toLowerCase();
            if (templateName && templateName !== 'simple') return [];
            const blocks = this.extractSimpleNativeSaveBlocks(content);
            return blocks
                .map((block) = this.extractSimpleNativeSaveRoll(msg, block))
                .filter(Boolean);
        },

        hasNativeRollEvidence(msg, content) {
            const source = String(content  '');
            const inlineRolls = Array.isArray(msg && msg.inlinerolls)  msg.inlinerolls  [];
            if (inlineRolls.length) return true;
            if ({{r1=br1=$[[d+]]i.test(source)) return true;
            if (rolltemplatebi.test(source) && data-result=$[[d+]]{{(r1attackrollatk)=i.test(source)) return true;
            return false;
        },

        extractNativeSaveRolls(msg) {
            const content = String(msg && msg.content  '');
            if (!this.hasNativeRollEvidence(msg, content)) return [];
            const blocks = this.getRollTemplateBlocks(content);
            const rolls = [];
            const isInitiativeLabel = (value) = Utils.normalizeName(value  '').indexOf('initiative') = 0;
            const simpleRolls = this.extractSimpleNativeSaveRolls(msg, content);
            simpleRolls.forEach((roll) = rolls.push(roll));
            blocks.forEach((block) = {
                if (simpleRolls.length && block === content) return;
                const fields = this.getRollTemplateFields(block);
                const advanced = this.parseAdvancedHtml(block);
                const label = [
                    msg && msg.rolltemplate,
                    advanced && advanced.attackName,
                    fields.rname,
                    fields.rollname,
                    fields.name
                ].join(' ');
                if (isInitiativeLabel(label)  binitiativebi.test(Utils.stripHtml(block  ''))) return;
                const attack = this.parseAttackRoll(Object.assign({}, msg  {}, { content block }), fields, advanced);
                const resultMatch = String(block  '').match(data-result=([+-]d+(.d+))i);
                const total = attack && attack.total !== null && attack.total !== undefined
                     Utils.toNumber(attack.total, 0)
                     (advanced && advanced.attackTotal !== null && advanced.attackTotal !== undefined
                         Utils.toNumber(advanced.attackTotal, 0)
                         (resultMatch  Utils.toNumber(resultMatch[1], 0)  null));
                if (total === null  total === undefined  Number.isNaN(Number(total))) return;
                const characterName = Utils.cleanRoll20Label(
                    (advanced && advanced.characterName) 
                    fields.charname 
                    fields.character_name 
                    fields.character 
                    ''
                );
                const rollName = Utils.cleanRoll20Label(
                    (advanced && advanced.attackName) 
                    fields.rname 
                    fields.rollname 
                    fields.name 
                    ''
                );
                rolls.push({
                    characterName,
                    rollName,
                    total,
                    mode attack && attack.mode  (advanced && advanced.rollMode)  'normal',
                    rolls attack && Array.isArray(attack.rolls)  attack.rolls  [],
                    hasSecondRoll !!(attack && attack.hasSecondRoll)  !!(advanced && advanced.hasSecondRoll)
                });
            });
            return rolls;
        },

        async applyPendingNativeSaveResult(pending, rollInfo) {
            const total = Utils.toNumber(rollInfo && rollInfo.total, null);
            if (total === null  total === undefined  Number.isNaN(Number(total))) return false;
            const token = R20.getTokenById(pending.tokenId);
            if (!token) {
                CombatService.completePersistentAreaMarkerTarget(pending.payload  {}, pending.tokenId);
                Render.sendWhisperMessage(pending.requestedBy  'GM', 'Damage Blocked', 'The pending saving throw target token was not found.', 'failure');
                return true;
            }
            const capturedMode = CombatService.normalizeRollMode(rollInfo && rollInfo.mode  'normal');
            const capturedRolls = Array.isArray(rollInfo && rollInfo.rolls)  rollInfo.rolls.map((value) = Utils.toInt(value, 0)).filter((value) = value  0)  [];
            const capturedHasSecondRoll = !!(rollInfo && rollInfo.hasSecondRoll)  capturedRolls.length  1  capturedMode === 'advantage'  capturedMode === 'disadvantage';
            if (pending.magicResistanceReroll && pending.magicResistanceRerollStage !== 'second' && capturedMode === 'normal' && !capturedHasSecondRoll) {
                this.requestMagicResistanceSecondNativeSave(pending, total);
                return true;
            }
            const firstMagicResistanceTotal = pending.magicResistanceReroll && pending.magicResistanceRerollStage === 'second'
                 Utils.toNumber(pending.magicResistanceFirstTotal, null)
                 null;
            const finalTotal = firstMagicResistanceTotal !== null && firstMagicResistanceTotal !== undefined
                 Math.max(firstMagicResistanceTotal, Utils.toNumber(total, 0))
                 total;
            const nativeSaveRolls = firstMagicResistanceTotal !== null && firstMagicResistanceTotal !== undefined
                 [firstMagicResistanceTotal, Utils.toNumber(total, 0)]
                 capturedRolls;
            const payload = Object.assign({}, pending.payload  {}, {
                nativeSaveTotal finalTotal,
                nativeSaveRollName String(rollInfo && rollInfo.rollName  ''),
                nativeSaveCharacterName String(rollInfo && rollInfo.characterName  pending.characterName  ''),
                nativeSaveMode firstMagicResistanceTotal !== null && firstMagicResistanceTotal !== undefined  'advantage'  capturedMode,
                nativeSaveRolls,
                nativeSaveRollModeReason firstMagicResistanceTotal !== null && firstMagicResistanceTotal !== undefined  'Magic Resistance'  ''
            });
            if (pending.concentrationCheck  payload.concentrationCheck) {
                CombatService.resolveConcentrationSave(token, {
                    total finalTotal,
                    ability 'constitution',
                    mode payload.nativeSaveMode,
                    rolls nativeSaveRolls,
                    rollModeReason payload.nativeSaveRollModeReason
                }, pending);
                return true;
            }
            const result = await CombatService.applyDamageToToken(token, payload);
            if (!result.ok) {
                CombatService.completePersistentAreaMarkerTarget(payload, token);
                Render.sendWhisperMessage(pending.requestedBy  'GM', 'Damage Blocked', result.message  'Could not apply damage after the saving throw.', 'failure');
                return true;
            }
            Render.sendDamageResult(result);
            CombatService.completePersistentAreaMarkerTarget(payload, token);
            return true;
        },

        async flushPendingNativeSaveCaptureBuffer() {
            NATIVE_SAVE_CAPTURE_BUFFER.timer = null;
            const allRolls = NATIVE_SAVE_CAPTURE_BUFFER.rolls.splice(0);
            if (!allRolls.length) return false;
            const resolved = [];
            for (let i = 0; i  allRolls.length; i += 1) {
                const roll = allRolls[i]  {};
                const pending = this.resolvePendingNativeSave(roll.characterName  '', roll.rollName  '');
                if (!pending) continue;
                resolved.push({ pending, roll });
            }
            let applied = 0;
            for (let i = 0; i  resolved.length; i += 1) {
                if (await this.applyPendingNativeSaveResult(resolved[i].pending, resolved[i].roll)) applied += 1;
            }
            return applied  0;
        },

        queuePendingNativeSaveCapture(rolls) {
            (Array.isArray(rolls)  rolls  []).forEach((roll) = {
                if (roll) NATIVE_SAVE_CAPTURE_BUFFER.rolls.push(roll);
            });
            if (NATIVE_SAVE_CAPTURE_BUFFER.timer) clearTimeout(NATIVE_SAVE_CAPTURE_BUFFER.timer);
            NATIVE_SAVE_CAPTURE_BUFFER.timer = setTimeout(() = {
                Promise.resolve(this.flushPendingNativeSaveCaptureBuffer()).catch((error) = {
                    Logger.error('[native-save-buffer]', error && error.message  error.message  String(error));
                });
            }, 100);
        },

        async handlePendingNativeSaveCapture(msg) {
            const root = State.get();
            if (!root.pendingNativeSaves  !Object.keys(root.pendingNativeSaves).length) return false;
            if (!msg  msg.type === 'api') return false;
            const content = String(msg && msg.content  '');
            if (!this.hasNativeRollEvidence(msg, content)) return false;
            if (binitiativebi.test(Utils.stripHtml(content  ''))) return false;
            const rolls = this.extractNativeSaveRolls(msg);
            if (!rolls.length) return false;
            this.queuePendingNativeSaveCapture(rolls);
            return true;
        },

        requestMagicResistanceSecondNativeSave(pending, firstTotal) {
            const command = String(pending && (pending.nativeCommand  pending.batchCommand  pending.buttonCommand)  '').trim();
            const buttonCommand = String(pending && (pending.buttonCommand  pending.nativeCommand  pending.batchCommand)  '').trim();
            if (!command && !buttonCommand) {
                Render.sendWhisperMessage(pending && pending.requestedBy  'GM', 'Saving Throw', 'Magic Resistance needs one more save roll, but the native command was not found.', 'warning');
                return false;
            }
            const requestId = this.createPendingNativeSave(Object.assign({}, pending  {}, {
                magicResistanceRerollStage 'second',
                magicResistanceFirstTotal Utils.toNumber(firstTotal, 0),
                captureNative true
            }));
            const saveAbility = CombatService.normalizeAbilityName(pending && (pending.rollName  pending.payload && pending.payload.saveAbility)  '');
            const challenge = Math.max(0, Utils.toInt(pending && pending.payload && pending.payload.challenge, 0));
            const damageRolls = Array.isArray(pending && pending.payload && pending.payload.damageRolls)  pending.payload.damageRolls  [];
            const fallbackDamage = Math.max(0, Utils.toInt(pending && pending.payload && (pending.payload.damageTotal  pending.payload.amount  pending.payload.damage), 0));
            const damage = damageRolls.length
                 damageRolls.reduce((sum, roll) = sum + Math.max(0, Utils.toInt(roll && (roll.total  roll.amount  roll.damage), 0)), 0)
                 fallbackDamage;
            const damageType = damageRolls.length  damageRolls[0].damageType  (pending && pending.payload && pending.payload.damageType  'normal');
            if (pending && pending.playerPrompt) {
                const recipients = Array.isArray(pending.recipients) && pending.recipients.length  pending.recipients  ['GM'];
                const card = Render.showNativeSaveRollRequest({
                    tokenName pending.tokenName  pending.characterName  'Token',
                    saveAbility,
                    challenge,
                    damage,
                    damageType,
                    command buttonCommand  command,
                    note 'Magic Resistance roll one more time. Combat Assistant will use the higher result.'
                });
                recipients.forEach((recipient) = R20.whisper(recipient, card));
            } else {
                setTimeout(() = {
                    try {
                        R20.send(command  buttonCommand);
                    } catch (error) {
                        Logger.error('[magic-resistance-save-reroll]', error && error.message  error.message  String(error));
                    }
                }, 100);
            }
            return !!requestId;
        },

        getNpcSetSourceInfo(result) {
            const token = R20.resolveRollSourceToken(result  {}, result && result.playerId  '');
            const character = token
                 R20.getCharacterFromToken(token)
                 R20.getCharacterByName(result && (result.characterName  result.tokenName)  '');
            if (token && R20.isPlayerControlledToken(token, character)) return null;
            if (!token && character && R20.isPlayerControlledCharacter(character)) return null;
            if (!token && !character && !RuntimeConfig.get('COMBAT_VISUAL_EFFECTS')) return null;
            return {
                npcSetEligible true,
                npcSetSourceTokenId token  R20.getTokenId(token)  '',
                npcSetSourceCharacterId character  String(character.id  (token && token.get('represents'))  '').trim()  '',
                npcSetSourcePageId token  R20.getTokenPageId(token)  ''
            };
        },

        withNpcSetInfo(result) {
            const info = this.getNpcSetSourceInfo(result);
            if (!info) return Object.assign({}, result  {}, { npcSetEligible false });
            return Object.assign({}, result  {}, info, {
                sourceTokenId info.npcSetSourceTokenId,
                casterTokenId info.npcSetSourceTokenId,
                casterCharacterId info.npcSetSourceCharacterId,
                casterPageId info.npcSetSourcePageId
            });
        },

        sendPlayerPrompt(result) {
            const isHealing = !!result.isHealing;
            const playerActionEnabled = isHealing
                 RuntimeConfig.get('PLAYER_HEALING_BUTTON')
                 RuntimeConfig.get('PLAYER_ATTACK_BUTTON');
            const concentrationTracking = !!(result && result.isConcentration && RuntimeConfig.get('CONCENTRATION_TRACKING'));
            if (!playerActionEnabled && !concentrationTracking) return false;
            const token = R20.resolveRollSourceToken(result, result.playerId  '');
            const character = token  R20.getCharacterFromToken(token)  null;
            const playerRecipients = R20.getCharacterControllerDisplayNames(character);
            if (!playerRecipients.length) return false;
            const recipients = isHealing  playerRecipients  Utils.uniqueNames(['GM'].concat(playerRecipients));
            const casterTokenId = R20.getTokenId(token);
            const casterCharacterId = character  String(character.id  token.get('represents')  '').trim()  '';
            const casterPageId = R20.getTokenPageId(token);
            const saveAbility = CombatService.normalizeAbilityName(result.saveAbility  '');
            const areaInfo = result && result.areaInfo && result.areaInfo.isArea  result.areaInfo  { isArea false, options [] };
            const areaOptions = R20.getAreaInfoOptions(areaInfo);
            const useAreaMarkerRequested = playerActionEnabled && !isHealing && areaInfo.isArea && RuntimeConfig.get('PLAYER_TOKEN_AREA_MARK');
            let areaTargets = [];
            let useCount = 1;
            const payloadObject = isHealing  {
                type 'heal',
                mode result.isTempHealing  'temp'  'hp',
                amount Math.max(0, Utils.toInt(result.healTotal  result.damageTotal, 0)),
                sourceName String(result.tokenName  result.characterName  'Caster'),
                sourceAction String(result.attackName  'Healing'),
                sourceImgsrc String((token && token.get('imgsrc'))  result.tokenImgsrc  ''),
                rangeText String(result.rangeText  result.range  ''),
                durationText String(result.durationText  result.duration  ''),
                isSpellAction !!result.isSpellAction,
                isConcentration !!result.isConcentration,
                lightInfo result.lightInfo && result.lightInfo.hasLight  result.lightInfo  { hasLight false },
                areaInfo,
                areaOptions,
                casterTokenId,
                casterCharacterId,
                casterPageId
            }  {
                type 'damage',
                mode result.isSaveAttack  saveAbility  'save'  'attack',
                challenge Math.max(0, Utils.toInt(result.saveDc  result.attackTotal, 0)),
                attackNatural Math.max(0, Utils.toInt(result.attackNatural, 0)),
                isCritical !!result.isCritical,
                saveAbility,
                halfOnSuccess !!result.halfOnSuccess,
                halfOnSuccessKnown !!result.halfOnSuccessKnown,
                damageRolls Array.isArray(result.damageRolls) && result.damageRolls.length
                     result.damageRolls
                     [{ total result.damageTotal  0, damageType result.damageType  'normal', formula result.damageFormula  'Roll20' }],
                sourceName String(result.tokenName  result.characterName  ''),
                sourceAction String(result.attackName  ''),
                sourceImgsrc String((token && token.get('imgsrc'))  result.tokenImgsrc  ''),
                rangeText String(result.rangeText  result.range  ''),
                durationText String(result.durationText  result.duration  ''),
                isSpellAction !!result.isSpellAction,
                isConcentration !!result.isConcentration,
                lightInfo result.lightInfo && result.lightInfo.hasLight  result.lightInfo  { hasLight false },
                areaInfo,
                areaOptions,
                casterTokenId,
                casterCharacterId,
                casterPageId
            };
            const actionId = State.createPlayerActionRequest({
                type isHealing  'heal'  'damage',
                payload payloadObject,
                sourceTokenId casterTokenId,
                sourceCharacterId casterCharacterId,
                sourcePageId casterPageId,
                characterId casterCharacterId,
                characterName character  String(character.get('name')  '')  '',
                attackName String(result.attackName  (isHealing  'Healing'  'Attack')),
                uses useCount,
                areaTargetIds areaTargets.map((target) = R20.getTokenId(target)).filter(Boolean)
            });
            const request = State.getPlayerActionRequest(actionId);
            let useAreaMarker = false;
            let markerError = '';
            if (useAreaMarkerRequested && request) {
                const markerResult = R20.createPlayerAreaMarkers(request, token, result.playerId  '');
                if (markerResult.ok && markerResult.alternatives.length) {
                    request.areaMarkerAlternatives = markerResult.alternatives;
                    request.markerTokenIds = markerResult.markerIds.slice();
                    const firstAlternative = markerResult.alternatives[0];
                    request.markerTokenId = firstAlternative.markerTokenId;
                    request.markerName = firstAlternative.markerName;
                    request.areaMarkerGroup = firstAlternative.markerGroup  null;
                    useAreaMarker = true;
                    if (markerResult.message) markerError = markerResult.message;
                } else {
                    markerError = markerResult.message  'Area marker could not be created.';
                    Logger.debug('[player-area-marker]', markerError);
                    areaTargets = [];
                    useCount = 1;
                    request.uses = useCount;
                    request.remainingUses = useCount;
                    request.areaTargetIds = [];
                }
            }
             Concentration begins when the spell is castcaptured, not when the player
             later presses RollATK. This makes the token tooltip and turn counter
             available immediately and also supports non-area concentration spells.
            const concentrationStarted = !!(request && token && payloadObject.isConcentration && RuntimeConfig.get('CONCENTRATION_TRACKING') &&
                CombatService.startConcentrationForRequest(request, token));
             Concentration tracking is independent of whether player ATKHeal buttons
             are enabled. If no player action button is requested, retain the request
             solely as the active concentrationreroll payload and stop here.
            if (!playerActionEnabled) return concentrationStarted;
            const command = useAreaMarker
                 ('!combatAssistant usearea ' + actionId)
                 ('!combatAssistant use ' + actionId + ' &#64;{targettoken_id}');
            const buttons = useAreaMarker
                 Render.areaRollControlButtons({ actionId, casterTokenId, isConcentration payloadObject.isConcentration && RuntimeConfig.get('CONCENTRATION_TRACKING') })
                 [isHealing
                     Render.iconButtonHtml({ iconHtml result.isTempHealing  '&#128151;'  '&#128154;', label result.isTempHealing  'Temp'  'Heal', command, backgroundColor 'rgba(20,115,55,0.95)', tooltip 'Choose a target token and apply this healing once' })
                     Render.iconButtonHtml({ iconHtml '&#9876;&#65039;', label result.isSaveAttack  saveAbility  (CombatService.abilityNameToShortLabel(saveAbility)  'SAVE')  'ATK', command, backgroundColor 'rgba(120,40,40,0.95)', tooltip 'Choose a target token and apply this attack once' })];
            const body = Render.iconButtonTableHtml(buttons, {
                columns buttons.length,
                footerHtml useAreaMarker
                     Render.playerAreaMarkerFooterHtml(areaInfo, payloadObject)
                     Render.playerSingleTargetFooterHtml(payloadObject),
                footer ''
            }) + (markerError  'div style=padding-top4px;colorrgb(235,160,90);font-size10px;text-aligncenter;' + Utils.escapeHtml(markerError) + 'div'  '');
            const titleResult = Object.assign({}, result, {
                damageType isHealing  (result.isTempHealing  'temp healing'  'healing')  result.damageType,
                damageTotal isHealing  (result.healTotal  result.damageTotal  0)  result.damageTotal
            });
            recipients.forEach((recipient) = R20.whisper(recipient, Html.card({
                title isHealing  'Healing Available'  'Attack Available',
                body,
                buildOptions { titleHtml Render.attackPromptTitleHtml(titleResult) }
            })));
            return true;
        },

        shouldOfferAttackAndSavePrompts(result) {
            if (!result  result.isHealing) return false;
            const attackTotal = Math.max(0, Utils.toInt(result.attackTotal, 0));
            const saveDc = Math.max(0, Utils.toInt(result.saveDc, 0));
            const saveAbility = CombatService.normalizeAbilityName(result.saveAbility  '');
            const damageRolls = Array.isArray(result.damageRolls)  result.damageRolls  [];
            const damageTotal = Math.max(0, Utils.toInt(result.damageTotal, 0));
            return !!result.hasAttackRoll && attackTotal  0 && saveDc  0 && !!saveAbility && (damageRolls.length  0  damageTotal  0);
        },

        attackPromptVariant(result) {
            const source = result  {};
            const rolls = source.hasSecondarySaveDamageSplit && Array.isArray(source.attackDamageRolls) && source.attackDamageRolls.length
                 source.attackDamageRolls
                 (Array.isArray(source.damageRolls)  source.damageRolls  []);
            const total = rolls.reduce((sum, entry) = sum + Math.max(0, Utils.toInt(entry && entry.total, 0)), 0);
            return Object.assign({}, source, {
                isSaveAttack false,
                saveDc 0,
                saveAbility '',
                halfOnSuccess false,
                halfOnSuccessKnown false,
                damageRolls rolls,
                damageTotal total,
                damageType rolls.length  rolls[0].damageType  source.damageType,
                damageFormula rolls.map((entry) = entry.formula  'Roll20').join(' + ')  source.damageFormula  'Roll20',
                areaInfo { isArea false }
            });
        },

        savePromptVariant(result) {
            const source = result  {};
            const rolls = source.hasSecondarySaveDamageSplit && Array.isArray(source.saveDamageRolls) && source.saveDamageRolls.length
                 source.saveDamageRolls
                 (Array.isArray(source.damageRolls)  source.damageRolls  []);
            const total = rolls.reduce((sum, entry) = sum + Math.max(0, Utils.toInt(entry && entry.total, 0)), 0);
            return Object.assign({}, source, {
                isSaveAttack true,
                saveAbility CombatService.normalizeAbilityName(result && result.saveAbility  ''),
                saveDc Math.max(0, Utils.toInt(result && result.saveDc, 0)),
                damageRolls rolls,
                damageTotal total,
                damageType rolls.length  rolls[0].damageType  source.damageType,
                damageFormula rolls.map((entry) = entry.formula  'Roll20').join(' + ')  source.damageFormula  'Roll20',
                attackTotal 0,
                hasAttackRoll false
            });
        },

        sendAttackDamagePrompts(result) {
            if (this.shouldOfferAttackAndSavePrompts(result)) {
                R20.whisper('GM', Render.showAttackDamagePrompt(this.withNpcSetInfo(this.attackPromptVariant(result))));
                R20.whisper('GM', Render.showAttackDamagePrompt(this.withNpcSetInfo(this.savePromptVariant(result))));
                return;
            }
            R20.whisper('GM', Render.showAttackDamagePrompt(this.withNpcSetInfo(result)));
            this.sendPlayerPrompt(result);
        },

        async handleChatMessage(msg) {
            if (!RuntimeConfig.get('CHAT_TRACKING')) return;
            const parsed = this.parseMessage(msg);
            if (parsed) parsed.playerId = String(msg && msg.playerid  '').trim();
            if (await this.handlePendingNativeInitiativeCapture(parsed, msg)) return;
            if (await this.handlePendingNativeSaveCapture(msg)) return;
            if (!parsed) return;
            Logger.debug('[Roll capture]', JSON.stringify({ name parsed.attackName, char parsed.characterName, attack parsed.isAttack, damage parsed.isDamage, healing parsed.isHealing, total parsed.attackTotal, damage parsed.damageTotal }));

            if (parsed.isHealing) {
                const healResult = Object.assign({}, parsed, {
                    effectType 'healing',
                    healMode parsed.isTempHealing  'temp'  'hp',
                    damageType parsed.isTempHealing  'temp healing'  'healing',
                    damageTotal parsed.healTotal
                });
                R20.whisper('GM', Render.showAttackDamagePrompt(healResult));
                this.sendPlayerPrompt(healResult);
                return;
            }

            if (parsed.isAttack && !parsed.isDamage && (parsed.hasAttackRoll  parsed.hasSpellContext)) {
                this.rememberAttack(parsed);
                return;
            }

            if (parsed.isAttack && parsed.isDamage) {
                this.sendAttackDamagePrompts(parsed);
                if (parsed.hasAttackRoll) this.rememberAttack(parsed);
                return;
            }

            if (parsed.isDamage) {
                const prior = this.findRecentAttack(
                    parsed.hasExplicitCharacterName  parsed.characterName  '',
                    parsed.hasExplicitAttackName  parsed.attackName  ''
                );
                if (!prior && !parsed.isSaveAttack && !(parsed.areaInfo && parsed.areaInfo.isArea)) return;
                const priorHasAttackRoll = !!(prior && prior.hasAttackRoll);
                const clearSaveFromPriorAttack = priorHasAttackRoll && !parsed.hasSecondarySaveDamageSplit;
                const result = Object.assign({}, parsed, {
                    tokenName (prior && prior.tokenName)  parsed.tokenName,
                    tokenImgsrc (prior && prior.tokenImgsrc)  parsed.tokenImgsrc,
                    attackName (prior && prior.attackName)  parsed.attackName,
                    attackTotal Math.max(0, Utils.toInt(prior && prior.attackTotal, parsed.attackTotal  0)),
                    hasAttackRoll !!((prior && prior.hasAttackRoll)  parsed.hasAttackRoll),
                    rollMode (prior && prior.rollMode)  parsed.rollMode,
                    saveDc clearSaveFromPriorAttack  0  Math.max(0, Utils.toInt(parsed.saveDc  (prior && prior.saveDc), 0)),
                    saveAbility clearSaveFromPriorAttack  ''  (parsed.saveAbility  (prior && prior.saveAbility)  ''),
                    isSaveAttack clearSaveFromPriorAttack  false  !!(parsed.saveDc  (prior && prior.saveDc)),
                    halfOnSuccess clearSaveFromPriorAttack  false  !!(parsed.halfOnSuccess  (prior && prior.halfOnSuccess)),
                    halfOnSuccessKnown clearSaveFromPriorAttack  false  !!(parsed.halfOnSuccessKnown  (prior && prior.halfOnSuccessKnown)),
                    rangeText parsed.rangeText  (prior && prior.rangeText)  '',
                    durationText parsed.durationText  (prior && prior.durationText)  '',
                    isSpellAction !!(parsed.isSpellAction  (prior && prior.isSpellAction)),
                    isConcentration !!(parsed.isConcentration  (prior && prior.isConcentration)),
                    lightInfo (parsed.lightInfo && parsed.lightInfo.hasLight  parsed.lightInfo  null)  (prior && prior.lightInfo)  { hasLight false },
                    areaInfo clearSaveFromPriorAttack  { isArea false }  ((parsed.areaInfo && parsed.areaInfo.isArea  parsed.areaInfo  null)  (prior && prior.areaInfo)  { isArea false }),
                    hasSecondarySaveDamageSplit !!parsed.hasSecondarySaveDamageSplit,
                    attackDamageRolls parsed.attackDamageRolls,
                    saveDamageRolls parsed.saveDamageRolls
                });
                this.sendAttackDamagePrompts(result);
                if (prior) this.clearRecentAttack(prior);
            }
        }
    };

     -----------------------------------------------------------------------
      Turn tracker
      --------------------------------------------------------------------- 
    const TurnTracker = {
        getState() {
            const root = State.get();
            root.turnTracker = root.turnTracker && typeof root.turnTracker === 'object' && !Array.isArray(root.turnTracker)
                 root.turnTracker
                 {};
            root.turnTracker.round = Math.max(0, Utils.toInt(root.turnTracker.round, 0));
            root.turnTracker.knownTokenIds = Array.isArray(root.turnTracker.knownTokenIds)  root.turnTracker.knownTokenIds  [];
            root.turnTracker.roundProgressTokenIds = Array.isArray(root.turnTracker.roundProgressTokenIds)  root.turnTracker.roundProgressTokenIds  [];
            root.turnTracker.pendingAddedTokenIds = Array.isArray(root.turnTracker.pendingAddedTokenIds)  root.turnTracker.pendingAddedTokenIds  [];
            root.turnTracker.turnMarkerId = String(root.turnTracker.turnMarkerId  '').trim();
            root.turnTracker.movement = root.turnTracker.movement && typeof root.turnTracker.movement === 'object' && !Array.isArray(root.turnTracker.movement)
                 root.turnTracker.movement
                 {};
            root.turnTracker.movement.tokenId = String(root.turnTracker.movement.tokenId  '').trim();
            root.turnTracker.movement.baseSpeed = Math.max(0, Utils.toNumber(root.turnTracker.movement.baseSpeed, 0));
            root.turnTracker.movement.spent = Math.max(0, Utils.toNumber(root.turnTracker.movement.spent, 0));
            root.turnTracker.movement.dashCount = Math.max(0, Utils.toInt(root.turnTracker.movement.dashCount, 0));
            root.turnTracker.movement.dashBonus = Math.max(0, Utils.toNumber(root.turnTracker.movement.dashBonus, 0));
            root.turnTracker.movement.warned = Utils.toBoolean(root.turnTracker.movement.warned, false);
            root.turnTracker.movement.lastLeft = root.turnTracker.movement.lastLeft === null  root.turnTracker.movement.lastLeft === undefined  null  Utils.toNumber(root.turnTracker.movement.lastLeft, null);
            root.turnTracker.movement.lastTop = root.turnTracker.movement.lastTop === null  root.turnTracker.movement.lastTop === undefined  null  Utils.toNumber(root.turnTracker.movement.lastTop, null);
            return root.turnTracker;
        },

        isEnabled() {
            return RuntimeConfig.get('TURN_TRACKER');
        },

        isMovementEnabled() {
            return this.isEnabled() && RuntimeConfig.get('TURN_MOVEMENT_TRACKER');
        },

        getMovementState() {
            return this.getState().movement;
        },

        clearMovementState() {
            const movement = this.getMovementState();
            movement.tokenId = '';
            movement.baseSpeed = 0;
            movement.spent = 0;
            movement.dashCount = 0;
            movement.dashBonus = 0;
            movement.warned = false;
            movement.lastLeft = null;
            movement.lastTop = null;
            return movement;
        },

        movementAvailable(movement) {
            const data = movement  this.getMovementState();
            return Math.max(0, Utils.toNumber(data.baseSpeed, 0) + Utils.toNumber(data.dashBonus, 0));
        },

        movementRemaining(movement) {
            const data = movement  this.getMovementState();
            return this.movementAvailable(data) - Math.max(0, Utils.toNumber(data.spent, 0));
        },

        formatMovementFeet(value) {
            const n = Utils.toNumber(value, 0);
            const rounded = Math.round(n  10)  10;
            return Math.abs(rounded - Math.round(rounded))  0.001  String(Math.round(rounded))  String(rounded);
        },

        resetMovementForEntry(entry, options) {
            if (!this.isMovementEnabled()  !entry) return this.clearMovementState();
            const opts = options  {};
            const info = this.getTokenInfo(entry);
            if (!info  !info.tokenId  !info.token) return this.clearMovementState();
            const movement = this.getMovementState();
            movement.tokenId = String(info.tokenId  '').trim();
            movement.baseSpeed = Math.max(0, Utils.toNumber(info.speed, 30));
            movement.spent = 0;
            movement.dashCount = 0;
            movement.dashBonus = 0;
            movement.warned = false;
            movement.lastLeft = Utils.toNumber(info.token.get('left'), 0);
            movement.lastTop = Utils.toNumber(info.token.get('top'), 0);

            const characterId = info.character
                 String(info.character.id  (Utils.isFunction(info.character.get)  info.character.get('_id')  '')  '').trim()
                 '';
            if (opts.resolveAsync && characterId && R20.detectSheetVersion(characterId) === '2024') {
                this.resolveTurnCardSpeed(Object.assign({}, info)).then((resolvedInfo) = {
                    const live = this.getMovementState();
                    if (!this.isMovementEnabled()  String(live.tokenId  '') !== String(info.tokenId  '')) return;
                    this.syncMovementBaseSpeed(resolvedInfo  info);
                }).catch((error) = {
                    Logger.debug('[turn-movementspeed]', error && error.message  error.message  String(error));
                });
            }
            return movement;
        },

        resetMovementForCurrentTurn(options) {
            const current = this.tokenEntries(this.getCurrentTurnOrder())[0]  null;
            return current  this.resetMovementForEntry(current, options  {})  this.clearMovementState();
        },

        syncMovementBaseSpeed(info) {
            if (!this.isMovementEnabled()  !info  !info.tokenId) return null;
            const movement = this.getMovementState();
            if (String(movement.tokenId  '') !== String(info.tokenId  '')) {
                const entry = info.entry  { id info.tokenId, pr info.initiative  '' };
                return this.resetMovementForEntry(entry);
            }
            const resolvedBase = Math.max(0, Utils.toNumber(info.speed, movement.baseSpeed  30));
            movement.baseSpeed = resolvedBase;
            movement.dashBonus = resolvedBase  Math.max(0, Utils.toInt(movement.dashCount, 0));
            if (movement.spent = this.movementAvailable(movement) + 0.001) movement.warned = false;
            return movement;
        },

        movementDisplay(info) {
            const base = Math.max(0, Utils.toNumber(info && info.speed, 0));
            if (!this.isMovementEnabled()  !info  !info.tokenId) return { value base, dashed false, dashCount 0 };
            const movement = this.getMovementState();
            if (String(movement.tokenId  '') !== String(info.tokenId  '')) return { value base, dashed false, dashCount 0 };
            return {
                value this.movementRemaining(movement),
                dashed Math.max(0, Utils.toInt(movement.dashCount, 0))  0,
                dashCount Math.max(0, Utils.toInt(movement.dashCount, 0)),
                spent Math.max(0, Utils.toNumber(movement.spent, 0)),
                available this.movementAvailable(movement)
            };
        },

        turnSpeedHtml(info) {
            const display = this.movementDisplay(info);
            const isNegative = Utils.toNumber(display.value, 0)  -0.001;
            const color = isNegative  'rgb(220,95,95)'  (display.dashed  'rgb(52,203,116)'  'rgb(235,205,75)');
            const dashMarker = display.dashed
                 'sup title=Dash +' + Utils.attrSafe(this.formatMovementFeet(Math.max(0, Utils.toNumber(info && info.speed, 0))) + ' ft. x' + String(display.dashCount)) + ' style=colorrgb(52,203,116);font-size8px;line-height8px;font-weight900;padding-left1px;&#9650;sup'
                 '';
            return 'span style=color' + color + ';font-weight900;&#127939; ' + Utils.escapeHtml(this.formatMovementFeet(display.value)) + dashMarker + 'span';
        },

        movementPathPoints(token, previous) {
            if (!token  !Utils.isFunction(token.get)) return [];
            const current = { left Utils.toNumber(token.get('left'), 0), top Utils.toNumber(token.get('top'), 0) };
            const movement = this.getMovementState();
            const start = {
                left previous && previous.left !== undefined  Utils.toNumber(previous.left, current.left)  (movement.lastLeft === null  current.left  Utils.toNumber(movement.lastLeft, current.left)),
                top previous && previous.top !== undefined  Utils.toNumber(previous.top, current.top)  (movement.lastTop === null  current.top  Utils.toNumber(movement.lastTop, current.top))
            };
            const points = [start];
            if (Math.abs(start.left - current.left) = 0.01 && Math.abs(start.top - current.top) = 0.01) return points;
            const raw = String(token.get('lastmove')  '').trim();
            if (raw) {
                const parts = raw.split(',').map((value) = Utils.toNumber(value, null));
                for (let i = 0; i + 1  parts.length; i += 2) {
                    if (parts[i] === null  parts[i + 1] === null) continue;
                    const last = points[points.length - 1];
                    if (!last  Math.abs(last.left - parts[i])  0.01  Math.abs(last.top - parts[i + 1])  0.01) {
                        points.push({ left parts[i], top parts[i + 1] });
                    }
                }
            }
            const last = points[points.length - 1];
            if (!last  Math.abs(last.left - current.left)  0.01  Math.abs(last.top - current.top)  0.01) points.push(current);
            return points;
        },

        movementDistanceFeet(token, previous) {
            const points = this.movementPathPoints(token, previous);
            if (points.length  2) return 0;
            const pageId = R20.getTokenPageId(token);
            const geometry = R20.getPageGeometry(pageId);
            let total = 0;
            for (let i = 1; i  points.length; i += 1) {
                const dx = Math.abs(points[i].left - points[i - 1].left);
                const dy = Math.abs(points[i].top - points[i - 1].top);
                 D&D square-grid movement one diagonal square consumes one square,
                 matching the common 5e grid interpretation and the user's requested
                 count squares moved behavior.
                const squares = Math.max(dx, dy)  Math.max(1, geometry.pixelsPerUnit);
                total += squares  Math.max(0, geometry.scaleFeet);
            }
            return Math.round(total  100)  100;
        },

        sendMovementExceededWarning(token) {
            if (!token) return false;
            const character = R20.getCharacterFromToken(token);
            const movement = this.getMovementState();
            const available = this.movementAvailable(movement);
            const spent = Math.max(0, Utils.toNumber(movement.spent, 0));
            const exceeded = Math.max(0, spent - available);
            const characterName = character && Utils.isFunction(character.get)
                 (String(character.get('name')  '').trim()  CombatService.getTokenName(token))
                 CombatService.getTokenName(token);
            const nameHtml = 'strong style=color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';' + Utils.escapeHtml(characterName  'Character') + 'strong';
            const body = nameHtml + ' has used all movement available for this turn and is still moving. ' +
                'span style=colorrgb(235,205,75);font-weight900;' + Utils.escapeHtml(this.formatMovementFeet(spent)) + '  ' + Utils.escapeHtml(this.formatMovementFeet(available)) + ' ft.span' +
                (exceeded  0  (' span style=colorrgb(220,95,95);font-weight900;(' + Utils.escapeHtml(this.formatMovementFeet(exceeded)) + ' ft. over)span')  '');
            const card = Html.card({
                title 'Movement Exceeded',
                body,
                buildOptions { titleHtml Render.movementTitleHtml(token, character), titleColor 'rgb(235,235,235)' }
            });
            R20.whisper('GM', card);
            R20.getNonGmTokenControllerDisplayNames(token, character).forEach((recipient) = {
                if (recipient) R20.whisper(recipient, card);
            });
            return true;
        },

        trackCurrentTurnMovement(token, previous) {
            if (!this.isMovementEnabled()  !token  this.isTurnMarkerGraphic(token)) return false;
            const tokenId = R20.getTokenId(token);
            const currentId = String(this.getState().currentTokenId  '').trim();
            if (!tokenId  tokenId !== currentId) return false;
            let movement = this.getMovementState();
            if (String(movement.tokenId  '') !== tokenId) {
                const current = this.tokenEntries(this.getCurrentTurnOrder())[0]  null;
                movement = current  this.resetMovementForEntry(current)  movement;
            }
            const distance = this.movementDistanceFeet(token, previous);
            movement.lastLeft = Utils.toNumber(token.get('left'), movement.lastLeft === null  0  movement.lastLeft);
            movement.lastTop = Utils.toNumber(token.get('top'), movement.lastTop === null  0  movement.lastTop);
            if (!(distance  0)) return false;
            movement.spent = Math.max(0, Utils.toNumber(movement.spent, 0)) + distance;
            const exceeded = movement.spent  this.movementAvailable(movement) + 0.001;
            if (exceeded && !movement.warned) {
                movement.warned = true;
                this.sendMovementExceededWarning(token);
                const current = this.tokenEntries(this.getCurrentTurnOrder())[0]  null;
                if (current) this.sendTurnCard(current);
            }
            return true;
        },

        applyDashToCurrentTurn(tokenId) {
            if (!this.isMovementEnabled()) return { ok false, enabled false };
            const current = this.tokenEntries(this.getCurrentTurnOrder())[0]  null;
            const currentId = String(current && current.id  '').trim();
            if (!current  !currentId) return { ok false, enabled true };
            if (tokenId && String(tokenId  '').trim() !== currentId) return { ok false, enabled true };
            let movement = this.getMovementState();
            if (String(movement.tokenId  '') !== currentId) movement = this.resetMovementForEntry(current);
            movement.dashCount = Math.max(0, Utils.toInt(movement.dashCount, 0)) + 1;
            movement.dashBonus = Math.max(0, Utils.toNumber(movement.baseSpeed, 0))  movement.dashCount;
            if (movement.spent = this.movementAvailable(movement) + 0.001) movement.warned = false;
            return {
                ok true,
                enabled true,
                baseSpeed movement.baseSpeed,
                spent movement.spent,
                available this.movementAvailable(movement),
                remaining this.movementRemaining(movement),
                dashCount movement.dashCount
            };
        },

        parseTurnOrder(raw) {
            if (Array.isArray(raw)) return raw.filter(Boolean).map((entry) = Object.assign({}, entry));
            try {
                const parsed = JSON.parse(String(raw  '[]'));
                return Array.isArray(parsed)  parsed.filter(Boolean).map((entry) = Object.assign({}, entry))  [];
            } catch (error) {
                return [];
            }
        },

        getCurrentTurnOrder() {
            if (typeof Campaign !== 'function') return [];
            try {
                return this.parseTurnOrder(Campaign().get('turnorder')  '[]');
            } catch (error) {
                return [];
            }
        },

        tokenEntries(order) {
            return (Array.isArray(order)  order  [])
                .filter((entry) = {
                    const id = String(entry && entry.id  '').trim();
                    return id && id !== '-1' && !!R20.getTokenById(id);
                })
                .map((entry, index) = Object.assign({ __order index }, entry));
        },

        entryPriority(entry) {
            return Utils.toNumber(entry && entry.pr, 0);
        },

        findPivot(order) {
            const entries = this.tokenEntries(order);
            if (!entries.length) return null;
            let pivot = entries[0];
            for (let i = 1; i  entries.length; i += 1) {
                const candidate = entries[i];
                if (this.entryPriority(candidate)  this.entryPriority(pivot)) pivot = candidate;
            }
            return pivot;
        },

        idsFromOrder(order) {
            return this.tokenEntries(order).map((entry) = String(entry.id  '').trim()).filter(Boolean);
        },

        firstTokenId(order) {
            const first = this.tokenEntries(order)[0]  null;
            return first  String(first.id  '').trim()  '';
        },

        rotateOrderToToken(order, tokenId) {
            const list = (Array.isArray(order)  order  []).filter(Boolean).map((entry) = Object.assign({}, entry));
            const safeTokenId = String(tokenId  '').trim();
            if (!safeTokenId  list.length = 1) return list;
            const index = list.findIndex((entry) = String(entry && entry.id  '').trim() === safeTokenId);
            if (index = 0) return list;
            return list.slice(index).concat(list.slice(0, index));
        },

        difference(a, b) {
            const wanted = Object.create(null);
            (Array.isArray(b)  b  []).forEach((id) = { wanted[String(id)] = true; });
            return (Array.isArray(a)  a  []).filter((id) = !wanted[String(id)]);
        },

        unique(ids) {
            const seen = Object.create(null);
            return (Array.isArray(ids)  ids  []).filter((id) = {
                const safeId = String(id  '').trim();
                if (!safeId  seen[safeId]) return false;
                seen[safeId] = true;
                return true;
            });
        },

        initializeFromCurrentTurnOrder() {
            if (!this.isEnabled()) return false;
            const order = this.getCurrentTurnOrder();
            const entries = this.tokenEntries(order);
            const state = this.getState();
            if (!entries.length) {
                this.resetState();
                return false;
            }
            const pivot = this.findPivot(entries);
            state.active = true;
            state.round = Math.max(1, Utils.toInt(state.round, 1));
            state.pivotTokenId = String(pivot && pivot.id  '').trim();
            state.pivotPr = pivot  String(pivot.pr  '')  '';
            state.currentTokenId = this.firstTokenId(entries);
            state.knownTokenIds = this.idsFromOrder(entries);
            state.roundProgressTokenIds = this.unique([state.currentTokenId]);
            if (this.isMovementEnabled()) this.resetMovementForEntry(this.tokenEntries(entries)[0]  null, { resolveAsync true });
            else this.clearMovementState();
            this.updateCurrentTurnPresentation(this.tokenEntries(entries)[0]  null, { sendCard false, focus false });
            return true;
        },

        resetState() {
            const state = this.getState();
            state.round = 0;
            state.pivotTokenId = '';
            state.pivotPr = '';
            state.currentTokenId = '';
            state.knownTokenIds = [];
            state.roundProgressTokenIds = [];
            state.pendingAddedTokenIds = [];
            state.active = false;
            this.clearMovementState();
            this.removeTurnMarker();
            if (TURN_TRACKER_TIMERS.additions) {
                clearTimeout(TURN_TRACKER_TIMERS.additions);
                TURN_TRACKER_TIMERS.additions = null;
            }
            return true;
        },

        tokenImageHtml(info, size, highlight, label) {
            const imgsrc = String(info && info.imgsrc  '').trim();
            const dead = !!(info && info.dead);
            const tooltip = String(label  (info && info.name)  'Token').trim();
            const avatar = info && info.character && Utils.isFunction(info.character.get)  String(info.character.get('avatar')  '').trim()  '';
            const renderedImage = Render.chatTokenImageHtml(imgsrc, size, avatar, 4);
            const image = renderedImage  'span style=displayblock;width' + size + 'px;height' + size + 'px;line-height' + size + 'px;text-aligncenter;border-radius4px;backgroundrgba(55,55,55,0.95);colorrgb(210,210,210);font-size14px;font-weight900;span';
            const deadOverlay = dead
                 'span style=positionabsolute;left0;top0;width' + size + 'px;height' + size + 'px;border-radius4px;backgroundrgba(220,0,0,0.42);z-index1;span'
                 '';
            const addedMarker = highlight
                 'span title=New token style=positionabsolute;right-2px;top-6px;z-index3;colorrgb(52,203,116);font-size13px;line-height13px;font-weight900;text-shadow0 1px 2px rgb(0,0,0),0 0 2px rgb(0,0,0);&#9650;span'
                 '';
            return 'span title=' + Utils.attrSafe(tooltip) + ' style=displayinline-block;positionrelative;width' + size + 'px;height' + size + 'px;vertical-alignmiddle;overflowvisible;' + image + deadOverlay + addedMarker + 'span';
        },

        tokenHasHpLink(token) {
            if (!token) return false;
            for (let i = 1; i = 4; i += 1) {
                if (CombatService.linkedBarMatches(token, i, 'hp')) return true;
            }
            return false;
        },

        getTokenHpInfo(token) {
            const hpBarNumber = CombatService.getBarNumberForAttribute(token, 'hp', 'HP_BAR');
            const bar = CombatService.getBar(token, hpBarNumber);
            if (!bar.ok) return { value 0, max null, linked false, hasValue false };
            const rawValue = token && Utils.isFunction(token.get)  token.get('bar' + String(hpBarNumber) + '_value')  '';
            return {
                value Math.max(0, Utils.toInt(bar.value, 0)),
                max bar.max,
                linked this.tokenHasHpLink(token),
                hasValue rawValue !== undefined && rawValue !== null && String(rawValue).trim() !== ''
            };
        },

        parseSpeedValue(value, fallback) {
            const defaultValue = fallback === undefined  null  fallback;
            if (value === undefined  value === null  String(value).trim() === '') return defaultValue;
            const match = String(value).match(-d+(.d+));
            if (!match) return defaultValue;
            const speed = Math.floor(Number(match[0]));
            return Number.isFinite(speed) && speed = 0  speed  defaultValue;
        },

        getLegacyTokenSpeed(characterId) {
            const safeCharacterId = String(characterId  '').trim();
            if (!safeCharacterId) return 30;
            const values = [];
            ['speed', 'npc_speed'].forEach((name) = {
                if (typeof getAttrByName === 'function') {
                    try {
                        const resolved = this.parseSpeedValue(getAttrByName(safeCharacterId, name), null);
                        if (resolved !== null) values.push(resolved);
                    } catch (ignored) {}
                }
                const direct = CombatService.readAttributeRaw(safeCharacterId, [name], '');
                const directValue = this.parseSpeedValue(direct, null);
                if (directValue !== null) values.push(directValue);
            });
            return values.length  Math.max.apply(null, values)  30;
        },

        getTokenSpeed(characterId) {
            const safeCharacterId = String(characterId  '').trim();
            if (!safeCharacterId) return 30;
            if (R20.detectSheetVersion(safeCharacterId) === '2014') return this.getLegacyTokenSpeed(safeCharacterId);

             Beacon values are resolved asynchronously just before the Turn card is sent.
             Keep a sane placeholder here for synchronous callers such as getTokenInfo().
            return 30;
        },

        async resolveTurnCardSpeed(info) {
            const safeInfo = info  {};
            const character = safeInfo.character;
            const characterId = character
                 String(character.id  (Utils.isFunction(character.get)  character.get('_id')  '')  '').trim()
                 '';
            if (!characterId) return safeInfo;
            if (R20.detectSheetVersion(characterId) === '2014') {
                safeInfo.speed = this.getLegacyTokenSpeed(characterId);
                return safeInfo;
            }

            let resolved = null;
            if (typeof getSheetItem === 'function') {
                try {
                    resolved = this.parseSpeedValue(await getSheetItem(characterId, 'speed', 'current'), null);
                } catch (error) {
                    Logger.debug('[turn-cardspeed2024]', error && error.message  error.message  String(error));
                }
            }

             Last-resort compatibility fallback. Beacon sheets should normally use getSheetItem().
            if (resolved === null && typeof getAttrByName === 'function') {
                try {
                    resolved = this.parseSpeedValue(getAttrByName(characterId, 'speed'), null);
                } catch (ignored) {}
            }
            if (resolved !== null) safeInfo.speed = resolved;
            return safeInfo;
        },

        getTokenStatusLabels(token) {
            if (!token  !Utils.isFunction(token.get)) return '';
            return String(token.get('statusmarkers')  '')
                .split(',')
                .map((entry) = String(entry  '').trim().split('@')[0])
                .filter(Boolean)
                .join(', ');
        },

        getTokenInfo(entry) {
            const tokenId = String(entry && entry.id  '').trim();
            const token = R20.getTokenById(tokenId);
            const character = token  R20.getCharacterFromToken(token)  null;
            const hp = token  this.getTokenHpInfo(token)  { value 0, max null, linked false, hasValue false };
            const ac = token  CombatService.readAc(token)  0;
            const characterId = character  String(character.id  '').trim()  '';
            return {
                entry,
                token,
                character,
                tokenId,
                name token  CombatService.getTokenName(token)  String(entry && entry.custom  'Token'),
                characterName character && Utils.isFunction(character.get)  String(character.get('name')  '').trim()  '',
                imgsrc token && Utils.isFunction(token.get)  String(token.get('imgsrc')  '').trim()  '',
                initiative String(entry && entry.pr !== undefined  entry.pr  ''),
                hp hp.value,
                hpMax hp.max,
                hpLinked hp.linked,
                hasHpValue hp.hasValue,
                dead hp.hasValue && hp.value = 0,
                ac,
                speed this.getTokenSpeed(characterId),
                markers token  this.getTokenStatusLabels(token)  '',
                playerControlled token  R20.isPlayerControlledToken(token, character)  false,
                recipients token  R20.getTokenControllerDisplayNames(token, character)  []
            };
        },

        roundRecipientIsPublic() {
            return RuntimeConfig.get('PUBLIC_ROUND_COUNTER');
        },

        roundTokenLabel(info, publicCard) {
            const initiative = String(info && info.initiative  '-');
            if (publicCard) return initiative;
            return String(info && info.name  'Token') + '  HP ' + String(info && info.hp !== undefined  info.hp  0) + '  ' + initiative;
        },

        buildRoundCounterCard(order, options) {
            const opts = options  {};
            const entries = this.tokenEntries(order  this.getCurrentTurnOrder());
            const publicCard = !!opts.publicCard;
            const highlightIds = this.unique(opts.highlightTokenIds  []);
            const round = Math.max(0, Utils.toInt(opts.round, this.getState().round  0));
            const count = entries.length;
            const tokenHtml = entries.map((entry) = {
                const info = this.getTokenInfo(entry);
                const highlighted = highlightIds.indexOf(info.tokenId) = 0;
                return 'span title=' + Utils.attrSafe(this.roundTokenLabel(info, publicCard)) + ' style=displayinline-block;vertical-aligntop;width32px;height32px;text-aligncenter;margin1px 2px 4px 2px;' +
                    this.tokenImageHtml(info, 30, highlighted, this.roundTokenLabel(info, publicCard)) +
                'span';
            }).join('');
            const stopButton = opts.includeStop
                 Render.compactSettingButtonHtml({
                    label 'Stop',
                    command '!combatAssistant turnstop &#63;{Stop CombatNo,noYes,yes}',
                    tooltip 'End combat and clear the Turn Order',
                    backgroundColor 'rgba(120,40,40,0.95)'
                })
                 '';
            const roundBox = Render.rollBadgeHtml({ total round, natural 0, tooltip 'Round ' + String(round) }, '', {
                size 40,
                fontSize '20px',
                bgColor 'rgba(55,55,55,0.95)'
            });
            const body =
                'table style=width100%;border-collapsecollapse;table-layoutfixed;tbody' +
                    'tr' +
                        'td style=width80%;text-aligncenter;vertical-alignmiddle;padding0 6px 5px 0;colorrgb(165,165,165);font-size12px;line-height14px;' +
                            Utils.escapeHtml(String(count)) + ' Tokens in Combat' +
                        'td' +
                        'td style=width20%;text-aligncenter;vertical-alignmiddle;padding0 0 5px 0;colorrgb(205,205,205);font-size10px;line-height14px;font-weight900;Roundtd' +
                    'tr' +
                    'tr' +
                        'td style=width80%;text-aligncenter;vertical-aligntop;padding0 6px 0 0;' + (tokenHtml  'span style=colorrgb(150,150,150);font-size11px;No tokensspan') + 'td' +
                        'td style=width20%;text-aligncenter;vertical-aligntop;padding0;' +
                            roundBox +
                            (stopButton  ('div style=padding-top5px;' + stopButton + 'div')  '') +
                        'td' +
                    'tr' +
                'tbodytable';
            return Html.card({
                title String(opts.title  'Round Counter'),
                body,
                buildOptions { titleColor 'rgb(230,230,230)', borderColor 'rgb(127,127,127)' }
            });
        },

        sendRoundCounter(options) {
            if (!this.isEnabled()  !RuntimeConfig.get('ROUND_COUNTER')) return false;
            const order = options && options.order;
            const gmCard = this.buildRoundCounterCard(order, Object.assign({}, options  {}, {
                publicCard false,
                includeStop options && Object.prototype.hasOwnProperty.call(options, 'includeStop')  options.includeStop  true
            }));
            R20.whisper('GM', gmCard);
            if (this.roundRecipientIsPublic()) {
                const publicCard = this.buildRoundCounterCard(order, Object.assign({}, options  {}, {
                    publicCard true,
                    includeStop false
                }));
                R20.send(publicCard);
            }
            return true;
        },

        buildTurnCard(info, includeNext, includeRemove, options) {
            const opts = options  {};
            const tokenName = String(info && info.name  'Token');
            const displayName = String(info && (info.characterName  info.name)  'Token');
            const hpColor = info && info.hp  0  'rgb(52,203,116)'  'rgb(220,45,45)';
            const tokenFocusButton = this.turnFocusImageButtonHtml(info, 40);
            const concentration = info && info.tokenId  State.getConcentrationByTokenId(info.tokenId)  null;
            const tooltipTurnsLeft = concentration  CombatService.concentrationTurnsLeftFromToken(info && info.token)  null;
            const stateTurnsLeft = concentration && concentration.turnsLeft !== null && concentration.turnsLeft !== undefined
                 Math.max(0, Utils.toInt(concentration.turnsLeft, 0))
                 null;
            const concentrationTurnsLeft = tooltipTurnsLeft !== null  tooltipTurnsLeft  stateTurnsLeft;
            const concentrationTurnLabel = concentrationTurnsLeft !== null  (String(concentrationTurnsLeft) + ' T.')  '∞ T.';
            const concentrationButton = concentration
                 Render.iconButtonHtml({
                    iconHtml '&#9203;',
                    label concentrationTurnLabel,
                    command '!combatAssistant conc ' + Utils.attrSafe(info.tokenId),
                    width 42,
                    height 38,
                    iconSize 16,
                    labelSize 9,
                    tooltip Reroll this concentration spell's damage and open its controls + (concentrationTurnsLeft !== null  (' - ' + String(concentrationTurnsLeft) + ' turn(s) left')  ''),
                    backgroundColor 'rgba(80,80,120,0.95)',
                    margin '0'
                })
                 '';
            const nextButton = includeNext
                 Render.iconButtonHtml({
                    iconHtml '&#10145;&#65039;',
                    label 'Next',
                    command '!combatAssistant turnnext ' + Utils.attrSafe(info.tokenId),
                    width 42,
                    height 38,
                    iconSize 16,
                    labelSize 10,
                    tooltip 'End this turn',
                    backgroundColor 'rgba(45,45,45,0.95)',
                    margin '0'
                })
                 '';
            const removeButton = includeRemove
                 Render.compactSettingButtonHtml({
                    label 'Remove',
                    command '!combatAssistant turnremove ' + Utils.attrSafe(info.tokenId),
                    width 32,
                    fontSize 8,
                    tooltip 'Advance to the next turn, then remove this defeated token from the Turn Order',
                    backgroundColor 'rgba(120,40,40,0.95)'
                })
                 '';
            const mainTurnButtons = (concentrationButton  (concentrationButton + 'span style=displayinline-block;width2px;height1px;vertical-alignmiddle;span')  '') + nextButton;
            const turnButtons = 'div style=white-spacenowrap;text-alignright;line-height0;' + mainTurnButtons + 'div' +
                (removeButton  ('div style=padding-top3px;text-alignright;' + removeButton + 'div')  '');
            const markers = String(info && info.markers  '').trim()  '-';
            let turnResourceList = '';
            const allowPlayerResources = RuntimeConfig.get('SHOW_PLAYER_RESOURCES') && info && info.playerControlled;
            const allowNpcResources = RuntimeConfig.get('SHOW_NPC_RESOURCES') && info && !info.playerControlled && opts.gmCard === true;
            if ((allowPlayerResources  allowNpcResources) && info && info.character && info.tokenId) {
                try {
                    const characterId = String(info.character.id  (Utils.isFunction(info.character.get)  info.character.get('_id')  '')  '').trim();
                    if (characterId) {
                        const resourceEntries = ResourceService.getEntries(characterId);
                        if (resourceEntries.length) turnResourceList = ResourceService.buildResourceListHtml(info.tokenId, resourceEntries);
                    }
                } catch (error) {
                    Logger.debug('[turn-cardresources]', error && error.message  error.message  String(error));
                }
            }
            const mainTurnRow =
                'table style=width100%;border-collapsecollapse;table-layoutfixed;tbodytr' +
                    'td style=width66%;text-alignleft;vertical-alignmiddle;padding0 6px 0 0;' +
                        'table style=width100%;border-collapsecollapse;table-layoutauto;tbodytr' +
                            'td rowspan=3 style=width44px;text-alignleft;vertical-aligntop;padding0 6px 0 0;' + tokenFocusButton + 'td' +
                            'td style=text-alignleft;vertical-aligntop;color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-size13px;line-height15px;font-weight900;' + Utils.escapeHtml(displayName) + 'td' +
                        'trtr' +
                            'td style=text-alignleft;vertical-aligntop;font-size11px;line-height14px;colorrgb(220,220,220);white-spacenowrap;' +
                                'span style=color' + hpColor + ';font-weight900;&#10084;&#65039; ' + Utils.escapeHtml(String(info && info.hp !== undefined  info.hp  0)) + 'span' +
                                '  span style=colorrgb(84,186,255);font-weight900;&#128737;&#65039; ' + Utils.escapeHtml(String(info && info.ac  0)) + 'span' +
                                '  ' + this.turnSpeedHtml(info) +
                            'td' +
                        'trtr' +
                            'td style=text-alignleft;vertical-aligntop;colorrgb(170,170,170);font-size10px;line-height12px;' + Utils.escapeHtml(markers) + 'td' +
                        'trtbodytable' +
                    'td' +
                    'td style=width34%;text-alignright;vertical-alignmiddle;padding0;' + turnButtons + 'td' +
                'trtbodytable';
            const turnActions = Render.buildTurnActionsHtml(info, opts);
            const actionSection = turnActions
                 'div style=height1px;backgroundrgb(105,105,105);margin7px 0 5px 0;div' + turnActions
                 '';
            const resourceSection = turnResourceList
                 'div style=height1px;backgroundrgb(105,105,105);margin7px 0 4px 0;div' + turnResourceList
                 '';
            return Html.card({
                title tokenName + ''s Turn',
                body mainTurnRow + actionSection + resourceSection,
                buildOptions { titleColor CONFIG.DEFAULT_TEXT_CHARACTER_COLOR, borderColor 'rgb(127,127,127)', bodyAlign 'left' }
            });
        },

        turnFocusImageButtonHtml(info, size) {
            const tokenId = String(info && info.tokenId  '').trim();
            const label = String(info && info.name  'Token').trim();
            const image = this.tokenImageHtml(info, size, false, 'Focus ' + label);
            if (!tokenId) return image;
            return 'a href=!combatAssistant turnfocus ' + Utils.attrSafe(tokenId) + ' title=' + Utils.attrSafe('Focus ' + label) + ' style=displayinline-block;width' + size + 'px;height' + size + 'px;padding0;margin0;border0;backgroundtransparent;text-decorationnone;line-height' + size + 'px;vertical-alignmiddle;' + image + 'a';
        },

        setPivotFromOrder(order) {
            const pivot = this.findPivot(order);
            const state = this.getState();
            state.pivotTokenId = String(pivot && pivot.id  '').trim();
            state.pivotPr = pivot  String(pivot.pr  '')  '';
            return state.pivotTokenId;
        },

        pruneRoundProgress(currentIds) {
            const allowed = Object.create(null);
            (Array.isArray(currentIds)  currentIds  []).forEach((id) = { allowed[String(id)] = true; });
            const state = this.getState();
            state.roundProgressTokenIds = this.unique(state.roundProgressTokenIds  []).filter((id) = allowed[String(id)]);
            return state.roundProgressTokenIds;
        },

        recordRoundProgress(tokenId, currentIds) {
            const safeTokenId = String(tokenId  '').trim();
            if (!safeTokenId) return [];
            const state = this.getState();
            state.roundProgressTokenIds = this.unique((state.roundProgressTokenIds  []).concat([safeTokenId]));
            if (Array.isArray(currentIds) && currentIds.length) this.pruneRoundProgress(currentIds);
            return state.roundProgressTokenIds;
        },

        hasCompletedRoundProgress(currentIds) {
            const seen = Object.create(null);
            this.unique(this.getState().roundProgressTokenIds  []).forEach((id) = { seen[String(id)] = true; });
            return (Array.isArray(currentIds)  currentIds  []).every((id) = !!seen[String(id)]);
        },

        getTurnMarker() {
            const markerId = String(this.getState().turnMarkerId  '').trim();
            return markerId  getObj('graphic', markerId)  null;
        },

        removeTurnMarker() {
            const state = this.getState();
            const marker = this.getTurnMarker();
            if (marker && Utils.isFunction(marker.remove)) {
                try {
                    marker.remove();
                } catch (error) {
                    Logger.debug('[turn-markerremove]', error && error.message  error.message  String(error));
                }
            }
            state.turnMarkerId = '';
            return true;
        },

        isTurnMarkerGraphic(token) {
            if (!token  !Utils.isFunction(token.get)) return false;
            const markerId = String(this.getState().turnMarkerId  '').trim();
            const tokenId = R20.getTokenId(token);
            if (markerId && tokenId === markerId) return true;
            return String(token.get('gmnotes')  '').indexOf('Managed by Combat Assistant Turn Marker') = 0;
        },

        getTurnMarkerLayer() {
            return RuntimeConfig.get('PUBLIC_TURN_MARKER')  'map'  'gmlayer';
        },

        bringTurnMarkerForward(marker) {
            if (!marker  !RuntimeConfig.get('PUBLIC_TURN_MARKER')) return false;
            const move = () = {
                try {
                    if (typeof toFront === 'function') toFront(marker);
                } catch (ignored) {}
            };
            move();
            setTimeout(move, 100);
            return true;
        },

        updateTurnMarkerForEntry(entry) {
            if (!this.isEnabled()  !RuntimeConfig.get('TURN_MARKER')) {
                this.removeTurnMarker();
                return false;
            }
            const info = this.getTokenInfo(entry);
            const token = info && info.token;
            const imgsrc = String(RuntimeConfig.get('TURN_MARKER_IMAGE_URL')  '').trim();
            if (!token  !Utils.isFunction(token.get)  !Utils.isRoll20FileUrl(imgsrc)  !imgsrc  typeof createObj !== 'function') {
                this.removeTurnMarker();
                return false;
            }
            const pageId = R20.getTokenPageId(token);
            if (!pageId) {
                this.removeTurnMarker();
                return false;
            }
            const sizePercent = Math.max(0, Utils.toNumber(RuntimeConfig.get('TURN_MARKER_IMG_SIZE'), 20));
            const markerScale = 1 + (sizePercent  100);
            const tokenWidth = Math.max(1, Utils.toNumber(token.get('width'), 70));
            const tokenHeight = Math.max(1, Utils.toNumber(token.get('height'), 70));
            const width = Math.max(1, Math.round(tokenWidth  markerScale));
            const height = Math.max(1, Math.round(tokenHeight  markerScale));
            const layer = this.getTurnMarkerLayer();
            const markerData = {
                _pageid pageId,
                layer,
                imgsrc,
                name 'CA Turn Marker',
                left Utils.toNumber(token.get('left'), 0),
                top Utils.toNumber(token.get('top'), 0),
                width,
                height,
                rotation Utils.toNumber(token.get('rotation'), 0),
                showname false,
                showplayers_name false,
                represents '',
                controlledby '',
                isdrawing true,
                disableTokenMenu true,
                gmnotes 'Managed by Combat Assistant Turn Marker'
            };
            const markerUpdateData = Object.assign({}, markerData);
            delete markerUpdateData._pageid;
            let marker = this.getTurnMarker();
            try {
                if (!marker  !Utils.isFunction(marker.get)  String(marker.get('_pageid')  '').trim() !== pageId) {
                    if (marker && Utils.isFunction(marker.remove)) marker.remove();
                    marker = createObj('graphic', markerData);
                    this.getState().turnMarkerId = marker  String(marker.id  '').trim()  '';
                } else if (Utils.isFunction(marker.set)) {
                    marker.set(markerUpdateData);
                }
                this.bringTurnMarkerForward(marker);
            } catch (error) {
                Logger.debug('[turn-markerupdate]', error && error.message  error.message  String(error));
                this.getState().turnMarkerId = '';
                return false;
            }
            return !!marker;
        },

        focusMapToken(token) {
            if (typeof sendPing !== 'function'  !token  !Utils.isFunction(token.get)) return false;
            const pageId = R20.getTokenPageId(token);
            if (!pageId) return false;
            try {
                sendPing(Utils.toNumber(token.get('left'), 0), Utils.toNumber(token.get('top'), 0), pageId, null, true);
                return true;
            } catch (error) {
                Logger.debug('[turn-focus]', error && error.message  error.message  String(error));
                return false;
            }
        },

        focusTurnToken(entry, force) {
            if (!force && !RuntimeConfig.get('TURN_AUTO_FOCUS')) return false;
            const info = this.getTokenInfo(entry);
            return this.focusMapToken(info && info.token);
        },

        sendCurrentTurnCardToContext(ctx) {
            if (!this.isEnabled()) {
                Render.sendWhisperMessage(ctx && ctx.who  'GM', 'Turn Tracker', 'Turn Tracker is disabled.', 'warning');
                return false;
            }
            const current = this.tokenEntries(this.getCurrentTurnOrder())[0]  null;
            const currentId = String(current && current.id  '').trim();
            if (!current  !currentId) {
                Render.sendWhisperMessage(ctx && ctx.who  'GM', 'Turn Tracker', 'There is no current turn.', 'warning');
                return false;
            }
             GM replays the normal Turn-card delivery GM always receives it,
             and a player-controlled current turn also reaches its controllers.
            if (ctx && ctx.isGM) return this.sendTurnCard(current);

            const info = this.getTokenInfo(current);
            if (!info  !info.token) {
                Render.sendWhisperMessage(ctx && ctx.who  'GM', 'Turn Tracker', 'The current turn token was not found.', 'warning');
                return false;
            }
            const character = info.character  R20.getCharacterFromToken(info.token);
            if (!R20.tokenIsControlledByPlayer(info.token, character, ctx && ctx.playerId  '')) {
                Render.sendWhisperMessage(ctx && ctx.who  'GM', 'Turn Tracker', 'It is not your turn.', 'warning');
                return false;
            }

            const expectedTokenId = String(info.tokenId  currentId).trim();
            const deliver = (resolvedInfo) = {
                const live = this.tokenEntries(this.getCurrentTurnOrder())[0]  null;
                if (expectedTokenId && live && String(live.id  '').trim() !== expectedTokenId) return false;
                const finalInfo = resolvedInfo  info;
                this.syncMovementBaseSpeed(finalInfo);
                const isGmCard = !!(ctx && ctx.isGM);
                const showRemove = isGmCard && !RuntimeConfig.get('REMOVE_NPC_DEAD_TOKENS') && this.isDeadNpcInfo(finalInfo);
                const card = this.buildTurnCard(finalInfo, true, showRemove, {
                    gmCard isGmCard,
                    playerCard !isGmCard
                });
                R20.whisper(ctx && ctx.who  'GM', card);
                return true;
            };

            const characterId = info.character
                 String(info.character.id  (Utils.isFunction(info.character.get)  info.character.get('_id')  '')  '').trim()
                 '';
            if (characterId && R20.detectSheetVersion(characterId) === '2024') {
                this.resolveTurnCardSpeed(info)
                    .then(deliver)
                    .catch((error) = {
                        Logger.debug('[turn-cardmanual]', error && error.message  error.message  String(error));
                        deliver(info);
                    });
                return true;
            }
            return deliver(info);
        },

        focusTokenById(tokenId, ctx) {
            const requestContext = ctx  {};
            let playerCurrentToken = null;

             Players may use Turn Focus only while the live current-turn token
             is under their control. This prevents players from repeatedly
             forcing map focus during another creature's turn. The GM bypasses
             this restriction and keeps the existing unrestricted behavior.
            if (!requestContext.isGM) {
                const playerCurrent = this.tokenEntries(this.getCurrentTurnOrder())[0]  null;
                const playerCurrentId = String(playerCurrent && playerCurrent.id  '').trim();
                if (!playerCurrent  !playerCurrentId) {
                    Render.sendWhisperMessage(requestContext.who  'GM', 'Turn Tracker', 'There is no current turn to focus.', 'warning');
                    return false;
                }
                playerCurrentToken = R20.getTokenById(playerCurrentId);
                if (!playerCurrentToken) {
                    Render.sendWhisperMessage(requestContext.who  'GM', 'Turn Tracker', 'The current turn token was not found.', 'warning');
                    return false;
                }
                const playerCurrentCharacter = R20.getCharacterFromToken(playerCurrentToken);
                if (!R20.tokenIsControlledByPlayer(playerCurrentToken, playerCurrentCharacter, requestContext.playerId  '')) {
                    Render.sendWhisperMessage(requestContext.who  'GM', 'Turn Tracker', 'It is not your turn.', 'warning');
                    return false;
                }
            }

            const requestedId = String(tokenId  '').trim();
            if (requestedId) {
                const requestedToken = R20.getTokenById(requestedId);
                if (!requestedToken  !R20.getTokenPageId(requestedToken)) {
                    Render.sendWhisperMessage(requestContext.who  'GM', 'Turn Tracker', 'The requested token was not found on a map.', 'warning');
                    return false;
                }
                return this.focusMapToken(requestedToken);
            }

             For an authorized player, the current token was already resolved
             above. Reuse it instead of reading the Turn Order a second time.
            if (playerCurrentToken) return this.focusMapToken(playerCurrentToken);

            const current = this.tokenEntries(this.getCurrentTurnOrder())[0]  null;
            const currentId = String(current && current.id  '').trim();
            if (!current  !currentId) {
                Render.sendWhisperMessage(requestContext.who  'GM', 'Turn Tracker', 'There is no current turn to focus.', 'warning');
                return false;
            }
            const token = R20.getTokenById(currentId);
            if (!token) {
                Render.sendWhisperMessage(requestContext.who  'GM', 'Turn Tracker', 'The current turn token was not found.', 'warning');
                return false;
            }
            return this.focusMapToken(token);
        },

        updateCurrentTurnPresentation(entry, options) {
            const opts = options  {};
            if (!entry) return false;
            this.updateTurnMarkerForEntry(entry);
            if (opts.focus !== false) this.focusTurnToken(entry, false);
            if (opts.sendCard) this.sendTurnCard(entry);
            return true;
        },

        refreshCurrentTurnPresentation(options) {
            const current = this.tokenEntries(this.getCurrentTurnOrder())[0]  null;
            return current  this.updateCurrentTurnPresentation(current, options  { sendCard false, focus false })  false;
        },

        handleGraphicChange(token, previous) {
            if (!this.isEnabled()  !token  this.isTurnMarkerGraphic(token)) return false;
            const tokenId = R20.getTokenId(token);
            if (!tokenId  tokenId !== String(this.getState().currentTokenId  '').trim()) return false;
            let handled = false;
            if (this.isMovementEnabled()) handled = this.trackCurrentTurnMovement(token, previous)  handled;
            if (RuntimeConfig.get('TURN_MARKER_FOLLOW')) handled = this.refreshCurrentTurnPresentation({ sendCard false, focus false })  handled;
            return handled;
        },

        handleGraphicDestroyed(token) {
            if (!token) return false;
            const tokenId = R20.getTokenId(token);
            const state = this.getState();
            if (tokenId && tokenId === String(state.turnMarkerId  '').trim()) {
                state.turnMarkerId = '';
                return true;
            }
            if (tokenId && tokenId === String(state.currentTokenId  '').trim()) {
                this.removeTurnMarker();
                return true;
            }
            return false;
        },

        sendTurnCard(entry) {
            if (!this.isEnabled()  !entry) return false;
            const info = this.getTokenInfo(entry);
            if (!info.token) return false;
            const expectedTokenId = String(info.tokenId  '').trim();
            const deliver = (resolvedInfo) = {
                 A Beacon speed read is asynchronous. If the turn already changed while
                 Roll20 was resolving it, suppress the stale card instead of sending it late.
                const current = this.tokenEntries(this.getCurrentTurnOrder())[0]  null;
                if (expectedTokenId && current && String(current.id  '').trim() !== expectedTokenId) return false;
                const finalInfo = resolvedInfo  info;
                this.syncMovementBaseSpeed(finalInfo);
                const showRemove = !RuntimeConfig.get('REMOVE_NPC_DEAD_TOKENS') && this.isDeadNpcInfo(finalInfo);
                const gmCard = this.buildTurnCard(finalInfo, true, showRemove, { gmCard true, playerCard false });
                R20.whisper('GM', gmCard);
                const playerRecipients = finalInfo.playerControlled
                     R20.getNonGmTokenControllerDisplayNames(finalInfo.token, finalInfo.character)
                     [];
                if (playerRecipients.length) {
                     Player-character action controls are rendered in both the GM copy
                     and the copy delivered to actual non-GM controllers.
                    const playerCard = this.buildTurnCard(finalInfo, true, false, { gmCard false, playerCard true });
                    playerRecipients.forEach((recipient) = {
                        if (recipient) R20.whisper(recipient, playerCard);
                    });
                }
                return true;
            };

            const characterId = info.character
                 String(info.character.id  (Utils.isFunction(info.character.get)  info.character.get('_id')  '')  '').trim()
                 '';
            if (characterId && R20.detectSheetVersion(characterId) === '2024') {
                this.resolveTurnCardSpeed(info)
                    .then(deliver)
                    .catch((error) = {
                        Logger.debug('[turn-cardspeed]', error && error.message  error.message  String(error));
                        deliver(info);
                    });
                return true;
            }
            return deliver(info);
        },

        processConcentrationTurnStart(entry) {
            if (!entry) return false;
            const tokenId = String(entry.id  '').trim();
            return tokenId  CombatService.processConcentrationTurnStart(tokenId)  false;
        },

        isDeadNpcInfo(info) {
            return !!(info && info.token && !info.hpLinked && info.hasHpValue && info.hp = 0);
        },

        isDeadNpcTurn(entry) {
            return this.isDeadNpcInfo(this.getTokenInfo(entry));
        },

        removeTurn(tokenId) {
            if (!this.isEnabled()) return false;
            if (typeof Campaign !== 'function') return false;
            const safeTokenId = String(tokenId  '').trim();
            if (!safeTokenId) return false;
            const before = this.getCurrentTurnOrder();
            const after = before.filter((entry) = String(entry && entry.id  '').trim() !== safeTokenId);
            Campaign().set('turnorder', JSON.stringify(after));
            return before.length !== after.length;
        },

        maybeHandleCurrentDeadNpc(order) {
            const current = this.tokenEntries(order)[0]  null;
            if (!current  !this.isDeadNpcTurn(current)) return false;
            if (RuntimeConfig.get('REMOVE_NPC_DEAD_TOKENS')) {
                this.removeTurn(current.id);
                return true;
            }
             With automatic removal OFF the normal turn card carries a small red
             Remove button below Next. No separate Token Remover card is sent.
            return false;
        },

        removeCurrentTurnAfterAdvance(tokenId, ctx) {
            if (!this.isEnabled()) return false;
            const safeTokenId = String(tokenId  '').trim();
            const order = this.getCurrentTurnOrder();
            const current = this.tokenEntries(order)[0]  null;
            if (!current  !safeTokenId  String(current.id  '').trim() !== safeTokenId) {
                Render.sendWhisperMessage(ctx && ctx.who  'GM', 'Turn Tracker', 'That token is not the current turn.', 'warning');
                return false;
            }
            if (!this.isDeadNpcTurn(current)) {
                Render.sendWhisperMessage(ctx && ctx.who  'GM', 'Turn Tracker', 'Remove is only available for a defeated unlinked NPC turn.', 'warning');
                return false;
            }
            if (order.length = 1) return this.removeTurn(safeTokenId);

             Advance first so all normal next-turn presentation, focus, marker and
             round-wrap behavior runs exactly as it would from the Next button.
             Remove the old token on the following tick, after that transition.
            if (!this.advanceTurn(safeTokenId, ctx)) return false;
            setTimeout(() = {
                this.removeTurn(safeTokenId);
            }, 0);
            return true;
        },

        advanceTurn(tokenId, ctx) {
            if (!this.isEnabled()) return false;
            const order = this.getCurrentTurnOrder();
            const entries = this.tokenEntries(order);
            const current = entries[0]  null;
             turnnext is intentionally generic. The optional tokenId is retained
             only so old Turn-card buttons remain valid; the live current entry is
             always authoritative.
            const safeTokenId = String(current && current.id  '').trim();
            if (!current  !safeTokenId) {
                Render.sendWhisperMessage(ctx && ctx.who  'GM', 'Turn Tracker', 'There is no current turn to advance.', 'warning');
                return false;
            }
            const token = R20.getTokenById(safeTokenId);
            if (!token) {
                Render.sendWhisperMessage(ctx && ctx.who  'GM', 'Turn Tracker', 'The current turn token was not found.', 'warning');
                return false;
            }
            if (ctx && !ctx.isGM) {
                const character = R20.getCharacterFromToken(token);
                if (!R20.tokenIsControlledByPlayer(token, character, ctx.playerId)) {
                    Render.sendWhisperMessage(ctx.who, 'Turn Tracker', 'It is not your turn.', 'warning');
                    return false;
                }
            }
            const state = this.getState();
            if (order.length = 1) {
                state.round = Math.max(1, Utils.toInt(state.round, 1)) + 1;
                state.currentTokenId = safeTokenId;
                state.roundProgressTokenIds = [safeTokenId];
                if (this.isMovementEnabled()) this.resetMovementForEntry(current);
                this.processConcentrationTurnStart(current);
                this.sendRoundCounter({ order, includeStop true, round state.round });
                this.updateCurrentTurnPresentation(current, { sendCard true, focus true });
                return true;
            }
            const rotated = order.slice(1).concat(order.slice(0, 1));
            const rotatedIds = this.idsFromOrder(rotated);
            const next = this.tokenEntries(rotated)[0]  null;
            const nextId = String(next && next.id  '').trim();
            let pivotId = String(state.pivotTokenId  '').trim();
            if (!pivotId  this.idsFromOrder(order).indexOf(pivotId)  0) pivotId = this.setPivotFromOrder(order);
            const startsNewRound = !!(nextId && pivotId && nextId === pivotId && String(current.id  '').trim() !== pivotId);

             Keep the tracker state ahead of Campaign().set(). This prevents the
             changecampaignturnorder handler from treating a CA Next rotation as
             an unprocessed turn change and, most importantly, makes the wrap from
             the last token back to the pivot increment the round deterministically.
            if (nextId) {
                state.currentTokenId = nextId;
                if (startsNewRound) {
                    state.round = Math.max(1, Utils.toInt(state.round, 1)) + 1;
                    state.roundProgressTokenIds = this.unique([nextId]);
                } else {
                    this.recordRoundProgress(nextId, rotatedIds);
                }
            }

            if (next) {
                if (this.isMovementEnabled()) this.resetMovementForEntry(next);
                this.processConcentrationTurnStart(next);
            }
            Campaign().set('turnorder', JSON.stringify(rotated));

            if (startsNewRound) {
                this.sendRoundCounter({ order rotated, includeStop true, round state.round });
            }
            if (next) {
                if (this.maybeHandleCurrentDeadNpc(rotated)) return true;
                this.updateCurrentTurnPresentation(next, { sendCard true, focus true });
            }
            return true;
        },

        stopCombat(confirm) {
            if (!this.isEnabled()) return false;
            const answer = String(confirm  '').trim().toLowerCase();
            if (answer !== 'yes' && answer !== 'y') return false;
            const order = this.getCurrentTurnOrder();
            const state = this.getState();
            const round = Math.max(0, Utils.toInt(state.round, 0));
            if (typeof Campaign === 'function') Campaign().set('turnorder', '[]');
            this.sendRoundCounter({ order, includeStop false, round, title 'Combat Ended' });
            this.resetState();
            return true;
        },

        scheduleAddedTokensRender(addedIds) {
            const state = this.getState();
            state.pendingAddedTokenIds = this.unique((state.pendingAddedTokenIds  []).concat(addedIds  []));
            if (TURN_TRACKER_TIMERS.additions) clearTimeout(TURN_TRACKER_TIMERS.additions);

            TURN_TRACKER_TIMERS.additions = setTimeout(() = {
                TURN_TRACKER_TIMERS.additions = null;
                if (!this.isEnabled()) return;

                const currentOrder = this.getCurrentTurnOrder();
                const currentIds = this.idsFromOrder(currentOrder);
                const currentState = this.getState();
                const knownIds = this.unique(currentState.knownTokenIds  []);
                const newlyDiscovered = this.difference(currentIds, knownIds);

                 Re-check the live Turn Order after the 3-second quiet window.
                 If another token appeared without a clean Roll20 change event,
                 absorb it into the batch and restart the 3-second window.
                if (newlyDiscovered.length) {
                    currentState.pendingAddedTokenIds = this.unique((currentState.pendingAddedTokenIds  []).concat(newlyDiscovered));
                    currentState.knownTokenIds = currentIds.slice();
                    this.scheduleAddedTokensRender([]);
                    return;
                }

                const present = Object.create(null);
                currentIds.forEach((id) = { present[String(id)] = true; });
                const highlights = this.unique(currentState.pendingAddedTokenIds  [])
                    .filter((id) = !!present[String(id)]);
                currentState.pendingAddedTokenIds = [];

                if (highlights.length) {
                    this.sendRoundCounter({
                        order currentOrder,
                        highlightTokenIds highlights,
                        includeStop true,
                        round currentState.round
                    });
                }
            }, 3000);
        },

        handleTurnOrderChange(campaign, previous) {
            if (!this.isEnabled()) return;
            const currentOrder = this.getCurrentTurnOrder();
            const previousOrder = previous && Object.prototype.hasOwnProperty.call(previous, 'turnorder')
                 this.parseTurnOrder(previous.turnorder)
                 [];
            const currentIds = this.idsFromOrder(currentOrder);
            const previousIds = this.idsFromOrder(previousOrder);
            const state = this.getState();
            if (!currentIds.length) {
                this.resetState();
                return;
            }

             Prefer our persistent known-token set once combat is active. It is a
             more reliable baseline than Roll20's previous.turnorder for API-driven
             mutations and prevents additions from being missed between rapid edits.
            const knownBefore = this.unique(state.knownTokenIds  []);
            const structuralBaselineIds = state.active && knownBefore.length  knownBefore  previousIds;
            const addedIds = this.difference(currentIds, structuralBaselineIds);
            const removedIds = this.difference(structuralBaselineIds, currentIds);
            const previousFirst = previousIds[0]  String(state.currentTokenId  '').trim();
            const currentFirst = currentIds[0]  '';
            let pivotId = String(state.pivotTokenId  '').trim();
            const trackedCurrentId = String(state.currentTokenId  '').trim();
            const firstChanged = currentFirst && currentFirst !== trackedCurrentId;
            const structuralChange = addedIds.length  0  removedIds.length  0;
            let showRound = false;

             Adding an initiative entry is structural, not a turn advance. Roll20
             may sort the whole list and move the highest initiative to index 0.
             If the token that was already acting is still present, rotate the new
             cycle back around that token and keep all turnround progress intact.
            const activePureAddition = !!(
                state.active &&
                addedIds.length  0 &&
                removedIds.length === 0 &&
                trackedCurrentId &&
                currentIds.indexOf(trackedCurrentId) = 0
            );
            if (activePureAddition) {
                const preservedOrder = currentFirst === trackedCurrentId
                     currentOrder
                     this.rotateOrderToToken(currentOrder, trackedCurrentId);
                const preservedIds = this.idsFromOrder(preservedOrder);
                const pivot = this.findPivot(preservedOrder);
                if (pivot) {
                    state.pivotTokenId = String(pivot.id  '').trim();
                    state.pivotPr = String(pivot.pr  '');
                }
                this.recordRoundProgress(trackedCurrentId, preservedIds);
                state.currentTokenId = trackedCurrentId;
                state.knownTokenIds = currentIds.slice();
                this.scheduleAddedTokensRender(addedIds);
                if (currentFirst !== trackedCurrentId && typeof Campaign === 'function') {
                    Campaign().set('turnorder', JSON.stringify(preservedOrder));
                }
                const preservedCurrent = this.tokenEntries(preservedOrder)[0]  null;
                if (preservedCurrent) this.updateCurrentTurnPresentation(preservedCurrent, { sendCard false, focus false });
                return;
            }

            if (!state.active  (!previousIds.length && !knownBefore.length)) {
                state.round = Math.max(1, Utils.toInt(state.round, 0)  1);
                state.active = true;
                pivotId = this.setPivotFromOrder(currentOrder);
                state.roundProgressTokenIds = this.unique([currentFirst]);
                showRound = true;
            } else if (structuralChange) {
                pivotId = this.setPivotFromOrder(currentOrder);
                state.roundProgressTokenIds = this.unique([currentFirst]);
            } else {
                if (!pivotId  currentIds.indexOf(pivotId)  0) {
                    pivotId = this.setPivotFromOrder(currentOrder);
                    state.roundProgressTokenIds = this.unique([currentFirst]);
                }
                if (firstChanged) {
                    this.recordRoundProgress(previousFirst, currentIds);
                    if (currentFirst === pivotId && previousFirst !== currentFirst && this.hasCompletedRoundProgress(currentIds)) {
                        state.round = Math.max(1, Utils.toInt(state.round, 1)) + 1;
                        state.roundProgressTokenIds = this.unique([currentFirst]);
                        showRound = true;
                    } else {
                        this.recordRoundProgress(currentFirst, currentIds);
                    }
                }
            }

            state.pivotTokenId = pivotId;
            state.pivotPr = (this.tokenEntries(currentOrder).filter((entry) = String(entry.id  '').trim() === pivotId)[0]  {}).pr  state.pivotPr  '';
            state.currentTokenId = currentFirst;
            state.knownTokenIds = currentIds.slice();

            if ((firstChanged  showRound) && currentFirst) {
                const currentEntry = this.tokenEntries(currentOrder)[0]  null;
                if (this.isMovementEnabled()) this.resetMovementForEntry(currentEntry);
                this.processConcentrationTurnStart(currentEntry);
            }
            if (showRound) this.sendRoundCounter({ order currentOrder, includeStop true, round state.round });
            if (addedIds.length && previousIds.length) this.scheduleAddedTokensRender(addedIds);
            if (firstChanged  showRound) {
                if (this.maybeHandleCurrentDeadNpc(currentOrder)) return;
                this.updateCurrentTurnPresentation(this.tokenEntries(currentOrder)[0], { sendCard true, focus true });
            } else {
                this.updateCurrentTurnPresentation(this.tokenEntries(currentOrder)[0], { sendCard false, focus false });
            }
        }
    };

     -----------------------------------------------------------------------
      Combat service
      --------------------------------------------------------------------- 
    const CombatService = {
        normalizeDamageType(type) {
            const raw = String(type  '').trim().toLowerCase();
            if (!raw  raw === '-'  raw === 'none') return 'normal';
            if (btemporarys+hits+pointsbi.test(raw)  btemp(orary)shpbi.test(raw)  btemps+healingbi.test(raw)) return 'temp healing';
            const known = Object.keys(CONFIG.DAMAGE_TYPE_COLORS);
            for (let i = 0; i  known.length; i += 1) {
                if (raw === known[i]  raw.indexOf(known[i]) = 0) return known[i];
            }
            if (heali.test(raw)) return 'healing';
            return raw.replace([^a-zs-]+g, '').replace(s+g, ' ').trim()  'normal';
        },

        normalizeAbilityName(value) {
            const key = String(value  '').trim().toLowerCase();
            return ABILITY_ALIASES[key]  '';
        },

        abilityNameToShortLabel(value) {
            const ability = this.normalizeAbilityName(value);
            return ABILITIES[ability]  '';
        },

        parseActionRangeFeet(value) {
            const text = Utils.stripHtml(String(value  '')).replace(s+g, ' ').trim().toLowerCase();
            if (!text) return { ok false, limited false, rangeFeet null, text '' };
            if (btouchb.test(text)) return { ok true, limited true, rangeFeet 5, text };
            if (^selfb.test(text)) return { ok true, limited false, rangeFeet null, text };
            const slash = text.match(b(d+(.d+))ss(d+(.d+))b);
            if (slash) {
                return { ok true, limited true, rangeFeet Math.max(Utils.toNumber(slash[1], 0), Utils.toNumber(slash[2], 0)), text };
            }
            const matches = [];
            const rangePattern = (d+(.d+))s(ft.feetfoot)big;
            let match = null;
            while ((match = rangePattern.exec(text)) !== null) {
                matches.push(Math.max(0, Utils.toNumber(match[1], 0)));
            }
            if (!matches.length) return { ok false, limited false, rangeFeet null, text };
            return { ok true, limited true, rangeFeet Math.max.apply(null, matches), text };
        },

        getActionRangeInfo(payload) {
            const data = payload  {};
            const range = this.parseActionRangeFeet(data.rangeText  data.range  '');
            if (range.ok && range.limited) return range;
            if (range.ok && ^selfbi.test(String(range.text  ''))) return range;
            if (String(data.type  '').toLowerCase() === 'damage') {
                return { ok true, limited true, rangeFeet 10, text 'default attack range' };
            }
            return range;
        },

        getAreaMarkerRangeInfo(payload) {
            const data = payload  {};
            const range = this.parseActionRangeFeet(data.rangeText  data.range  '');
            if (range.ok && ^selfbi.test(String(range.text  ''))) {
                const areaInfo = data.areaInfo && data.areaInfo.isArea  data.areaInfo  null;
                const directional = !!(areaInfo && (R20.isConeAreaShape(areaInfo.shape)  R20.isLineAreaShape(areaInfo.shape)));
                return { ok true, limited true, rangeFeet directional  5  2.5, text range.text  'self' };
            }
            return this.getActionRangeInfo(data);
        },

        getRangeTextForFooter(payload) {
            if (!RuntimeConfig.get('PLAYER_ACTION_RANGE_CHECK')) return '';
            const range = this.getActionRangeInfo(payload  {});
            return range.ok && range.limited  (String(range.rangeFeet) + ' ft')  '';
        },

        validatePlayerActionRange(request, targetToken) {
            if (!RuntimeConfig.get('PLAYER_ACTION_RANGE_CHECK')) return { ok true, skipped true };
            const payload = request && request.payload  request.payload  {};
            if (payload.ignoreRangeCheck  payload.npcSet  request && request.npcSet) return { ok true, skipped true };
            if (String(payload.type  '').toLowerCase() !== 'damage' && !payload.isSpellAction) return { ok true, skipped true };
            const areaInfo = payload.areaInfo && payload.areaInfo.isArea  payload.areaInfo  null;
            const useAreaMarker = !!(request && request.markerTokenId);
            const range = areaInfo && useAreaMarker
                 { ok true, limited true, rangeFeet Math.max(0, Utils.toNumber(areaInfo.sizeFeet, 0)), text areaInfo.label  'Area' }
                 this.getActionRangeInfo(payload);
            if (!range.ok  !range.limited) return { ok true, skipped true };
            const sourceToken = CommandHandlers.resolvePlayerActionSourceOnTargetPage(request, targetToken);
            if (!sourceToken) {
                return { ok false, message 'Caster token was not found on the target page.' };
            }
            const measured = R20.measureTokenCenterToTargetEdgeFeet(sourceToken, targetToken);
            if (!measured.ok) return measured;
            const effectiveRangeFeet = Math.max(0, Utils.toNumber(range.rangeFeet, 0) - 0.1);
            if (measured.feet  effectiveRangeFeet) {
                const targetName = this.getTokenName(targetToken);
                return {
                    ok false,
                    message targetName + ' is out of range for this action. Range ' + range.rangeFeet + ' ft, distance ' + Math.ceil(measured.feet) + ' ft.'
                };
            }
            return { ok true, rangeFeet range.rangeFeet, distanceFeet measured.feet };
        },

        validatePlayerAreaMarkerRange(request, markerToken) {
            if (!RuntimeConfig.get('PLAYER_ACTION_RANGE_CHECK')) return { ok true, skipped true };
            const payload = request && request.payload  request.payload  {};
            if (payload.ignoreRangeCheck  payload.npcSet  request && request.npcSet) return { ok true, skipped true };
            const range = this.getAreaMarkerRangeInfo(payload);
            if (!range.ok  !range.limited) return { ok true, skipped true };
            const sourceToken = CommandHandlers.resolvePlayerActionSourceOnTargetPage(request, markerToken);
            if (!sourceToken) return { ok false, message 'Caster token was not found on the area marker page.' };
            const areaInfo = payload.areaInfo && payload.areaInfo.isArea  payload.areaInfo  null;
            let measured = null;
            if (areaInfo && R20.isLineAreaShape(areaInfo.shape)) {
                const sourcePageId = R20.getTokenPageId(sourceToken);
                const markerPageId = R20.getTokenPageId(markerToken);
                const sourceRect = R20.getTokenRect(sourceToken);
                const endpoints = R20.getLineMarkerStartEnd(markerToken, sourceToken);
                if (!sourcePageId  !markerPageId  sourcePageId !== markerPageId) {
                    return { ok false, message 'Caster and line marker must be on the same page.' };
                }
                if (!sourceRect  !endpoints) return { ok false, message 'Line marker geometry could not be read.' };
                const dx = endpoints.start.x - sourceRect.left;
                const dy = endpoints.start.y - sourceRect.top;
                const pixels = Math.sqrt((dx  dx) + (dy  dy));
                measured = { ok true, feet R20.pixelsToPageFeet(sourcePageId, pixels), pixels, sourcePageId };
            } else if (areaInfo && R20.isConeAreaShape(areaInfo.shape) && request && request.areaMarkerGroup) {
                const sourcePageId = R20.getTokenPageId(sourceToken);
                const markerPageId = R20.getTokenPageId(markerToken);
                const sourceRect = R20.getTokenRect(sourceToken);
                if (!sourcePageId  !markerPageId  sourcePageId !== markerPageId) {
                    return { ok false, message 'Caster and area marker must be on the same page.' };
                }
                if (!sourceRect) return { ok false, message 'Caster token geometry could not be read.' };
                const pieces = Array.isArray(request.areaMarkerGroup.pieces)  request.areaMarkerGroup.pieces  [];
                const firstPiece = pieces.slice().sort((a, b) = Utils.toInt(a && a.index, 0) - Utils.toInt(b && b.index, 0))[0];
                const firstMarker = firstPiece && firstPiece.id  R20.getTokenById(firstPiece.id)  markerToken;
                const firstRect = R20.getTokenRect(firstMarker);
                if (!firstRect) return { ok false, message 'Cone marker geometry could not be read.' };
                const dx = firstRect.left - sourceRect.left;
                const dy = firstRect.top - sourceRect.top;
                const pixels = Math.sqrt((dx  dx) + (dy  dy));
                measured = { ok true, feet R20.pixelsToPageFeet(sourcePageId, pixels), pixels, sourcePageId };
            } else {
                measured = R20.measureTokenCenterDistanceFeet(sourceToken, markerToken);
            }
            if (!measured.ok) return measured;
            const isDirectionalSelfRange = !!(areaInfo &&
                (R20.isConeAreaShape(areaInfo.shape)  R20.isLineAreaShape(areaInfo.shape)) &&
                ^selfbi.test(String(range.text  '')));
            const allowedRangeFeet = isDirectionalSelfRange  5  Utils.toNumber(range.rangeFeet, 0);
            const effectiveRangeFeet = Math.max(0, isDirectionalSelfRange  (allowedRangeFeet + 0.1)  (allowedRangeFeet - 0.1));
            if (measured.feet  effectiveRangeFeet) {
                return {
                    ok false,
                    message 'The area marker is out of range. Range ' + String(allowedRangeFeet) + ' ft, distance ' + String(Math.ceil(measured.feet)) + ' ft.'
                };
            }
            return { ok true, rangeFeet allowedRangeFeet, distanceFeet measured.feet };
        },

        getBarNumber(key) {
            return Utils.clamp(Utils.toInt(RuntimeConfig.get(key), key === 'TEMP_HP_BAR'  0  1), key === 'TEMP_HP_BAR'  0  1, 4);
        },

        getTokenName(token) {
            if (!token  !Utils.isFunction(token.get)) return 'Target';
            return String(token.get('name')  'Target').trim()  'Target';
        },

        getBar(token, barNumber) {
            const bar = Utils.toInt(barNumber, 0);
            if (!token  bar  1  bar  4) return { ok false, message 'Invalid token bar. Use bar 1, 2, 3, or 4.' };
            const prefix = 'bar' + String(bar) + '_';
            const valueRaw = token.get(prefix + 'value');
            const maxRaw = token.get(prefix + 'max');
            const linkRaw = token.get(prefix + 'link');
            const value = valueRaw === undefined  valueRaw === null  String(valueRaw).trim() === ''  0  Utils.toNumber(valueRaw, 0);
            const max = maxRaw === undefined  maxRaw === null  String(maxRaw).trim() === ''  null  Utils.toNumber(maxRaw, null);
            const link = String(linkRaw  '').trim();
            return { ok true, bar, value, max, link, prefix };
        },

        linkedBarMatches(token, barNumber, attrName) {
            const bar = this.getBar(token, barNumber);
            if (!bar.ok  !bar.link) return false;
            const wanted = String(attrName  '').trim().toLowerCase();
            const rawLink = String(bar.link  '').trim().toLowerCase();
            if (rawLink === wanted) return true;
            const attr = getObj('attribute', bar.link);
            return !!(attr && Utils.isFunction(attr.get) && String(attr.get('name')  '').trim().toLowerCase() === wanted);
        },

        getBarNumberForAttribute(token, attrName, configKey) {
            const wanted = String(attrName  '').trim().toLowerCase();
            for (let i = 1; i = 4; i += 1) {
                if (this.linkedBarMatches(token, i, wanted)) return i;
            }
            return this.getBarNumber(configKey);
        },

        findCharacterAttribute(characterId, attrName) {
            const safeCharacterId = String(characterId  '').trim();
            const wanted = String(attrName  '').trim().toLowerCase();
            if (!safeCharacterId  !wanted) return null;
            const attrs = findObjs({ _type 'attribute', _characterid safeCharacterId })  [];
            for (let i = 0; i  attrs.length; i += 1) {
                const attr = attrs[i];
                if (!attr  !Utils.isFunction(attr.get)) continue;
                if (String(attr.get('name')  '').trim().toLowerCase() === wanted) return attr;
            }
            return null;
        },

        findLinkedOrNamedAttribute(token, barNumber, attrName) {
            const character = R20.getCharacterFromToken(token);
            const characterId = character  String(character.id  token.get('represents')  '').trim()  '';
            const wanted = String(attrName  '').trim().toLowerCase();
            const bar = this.getBar(token, barNumber);
            if (bar.ok && bar.link) {
                const linked = getObj('attribute', bar.link);
                if (linked && Utils.isFunction(linked.get) && String(linked.get('name')  '').trim().toLowerCase() === wanted) {
                    return linked;
                }
            }
            return this.findCharacterAttribute(characterId, wanted);
        },

        setBarValue(token, barNumber, value) {
            const bar = Utils.toInt(barNumber, 0);
            if (!token  bar  1  bar  4) return false;
            const props = {};
            props['bar' + String(bar) + '_value'] = value;
            token.set(props);
            return true;
        },

        shouldWriteSheetAttributeForBar(token, barNumber, attrName) {
            const safeAttr = String(attrName  '').trim().toLowerCase();
            return this.linkedBarMatches(token, barNumber, safeAttr);
        },

        async setCharacterSheetAttributeValue(characterId, attrName, value) {
            const safeCharacterId = String(characterId  '').trim();
            const safeAttrName = String(attrName  '').trim();
            const safeValue = String(Math.max(0, Utils.toInt(value, 0)));
            if (!safeCharacterId  !safeAttrName) return { ok false, message 'Character or attribute was not found.' };
            if (typeof setSheetItem !== 'function') {
                return { ok false, message 'Beacon setSheetItem() is not available. The character sheet was not modified.' };
            }
            Logger.debug('[sheet-attrsetstart]', 'characterId=' + safeCharacterId, 'attr=' + safeAttrName, 'value=' + safeValue, 'source=setSheetItem');
            try {
                await setSheetItem(safeCharacterId, safeAttrName, safeValue);
                Logger.debug('[sheet-attrsetok]', 'characterId=' + safeCharacterId, 'attr=' + safeAttrName, 'value=' + safeValue, 'source=setSheetItem');
                return { ok true, source 'setSheetItem' };
            } catch (error) {
                const beaconError = error && error.message  error.message  String(error);
                Logger.debug('[setSheetItem' + safeAttrName + ']', beaconError);
                return {
                    ok false,
                    message 'Could not set sheet attribute ' + safeAttrName + ' with Beacon ' + beaconError
                };
            }
        },

        async setBarOrLinkedAttributeValue(token, barNumber, attrName, value, options) {
            const bar = this.getBar(token, barNumber);
            if (!bar.ok) return bar;
            const opts = options  {};
            const safeValue = Math.max(0, Utils.toInt(value, 0));
            if (this.shouldWriteSheetAttributeForBar(token, barNumber, attrName)) {
                const character = R20.getCharacterFromToken(token);
                const characterId = character  String(character.id  token.get('represents')  '').trim()  '';
                const sheetWrite = await this.setCharacterSheetAttributeValue(characterId, attrName, safeValue);
                if (sheetWrite.ok) {
                    const linkedAttr = this.findLinkedOrNamedAttribute(token, barNumber, attrName);
                    const linkedValueRaw = linkedAttr && Utils.isFunction(linkedAttr.get)  linkedAttr.get('current')  '';
                    const linkedValue = linkedValueRaw !== undefined && linkedValueRaw !== null && String(linkedValueRaw).trim() !== ''
                         Math.max(0, Utils.toInt(linkedValueRaw, safeValue))
                         safeValue;
                    this.setBarValue(token, barNumber, linkedValue);
                    return {
                        ok true,
                        linked true,
                        source sheetWrite.source,
                        tokenSynced true,
                        tokenValue linkedValue
                    };
                }
                if (opts.fallbackToBarIfLinkedAttrMissing) {
                    this.setBarValue(token, barNumber, safeValue);
                    return { ok true, linked false, fallback true };
                }
                return sheetWrite;
            }
            if (String(bar.link  '').trim()) {
                return {
                    ok false,
                    message 'Bar ' + String(barNumber) + ' is linked to a different attribute. Combat Assistant will not overwrite it.'
                };
            }
            this.setBarValue(token, barNumber, safeValue);
            return { ok true, linked false };
        },

        readAc(token) {
            const acBar = this.getBarNumber('AC_BAR');
            const bar = this.getBar(token, acBar);
            if (bar.ok && String(bar.value).trim() !== '') return Utils.toInt(bar.value, 0);
            return 0;
        },

        getCharacterStoreAttribute(characterId) {
            const safeCharacterId = String(characterId  '').trim();
            if (!safeCharacterId) return null;
            const attrs = findObjs({ _type 'attribute', _characterid safeCharacterId })  [];
            for (let i = 0; i  attrs.length; i += 1) {
                const attr = attrs[i];
                if (!attr  !Utils.isFunction(attr.get)) continue;
                if (String(attr.get('name')  '').trim().toLowerCase() === 'store') return attr;
            }
            return null;
        },

        loadCharacterStore(characterId) {
            const attr = this.getCharacterStoreAttribute(characterId);
            if (!attr) return { ok false, message 'Character store was not found.' };
            const current = attr.get('current');
            if (current && typeof current === 'object') return { ok true, root current };
            const raw = String(current  '').trim();
            if (!raw) return { ok false, message 'Character store is empty.' };
            try {
                const root = JSON.parse(raw);
                return root && typeof root === 'object'  { ok true, root }  { ok false, message 'Character store is not an object.' };
            } catch (error) {
                return { ok false, message 'Character store could not be parsed.' };
            }
        },

        getHitpointsNode(root) {
            if (!root  typeof root !== 'object'  Array.isArray(root)) return null;
            if (!root.hitpoints  typeof root.hitpoints !== 'object'  Array.isArray(root.hitpoints)) return null;
            return root.hitpoints;
        },

        getDeathSavesState(characterId) {
            const store = this.loadCharacterStore(characterId);
            if (!store.ok) return { ok false, open false, failures 0, successes 0, message store.message };
            const hitpoints = this.getHitpointsNode(store.root);
            const deathSaves = hitpoints && hitpoints.deathSaves && typeof hitpoints.deathSaves === 'object' && !Array.isArray(hitpoints.deathSaves)
                 hitpoints.deathSaves
                 null;
            return {
                ok true,
                open Utils.toBoolean(deathSaves && deathSaves.open, false),
                failures Utils.toInt(deathSaves && deathSaves.failures, 0),
                successes Utils.toInt(deathSaves && deathSaves.successes, 0)
            };
        },

        setTokenStatusMarker(token, marker, enabled) {
            if (!token  !Utils.isFunction(token.get)  !Utils.isFunction(token.set)) return false;
            const safeMarker = String(marker  '').trim();
            if (!safeMarker) return false;
            const current = String(token.get('statusmarkers')  '')
                .split(',')
                .map((entry) = String(entry  '').trim())
                .filter(Boolean);
            const normalized = current.filter((entry) = entry.split('@')[0] !== safeMarker);
            if (enabled) normalized.push(safeMarker);
            token.set('statusmarkers', normalized.join(','));
            return true;
        },

        tokenHasStatusMarker(token, marker) {
            if (!token  !Utils.isFunction(token.get)) return false;
            const safeMarker = String(marker  '').trim();
            if (!safeMarker) return false;
            return String(token.get('statusmarkers')  '')
                .split(',')
                .map((entry) = String(entry  '').trim().split('@')[0])
                .indexOf(safeMarker) = 0;
        },

        concentrationDurationTurns(durationText) {
            const text = Utils.stripHtml(String(durationText  '')).replace(s+g, ' ').trim().toLowerCase();
            if (!text) return null;
            const match = text.match((ups+tos+)(d+(.d+))s(roundsturnssecondssecsminutesminshourshrsdays)i);
            if (!match) return null;
            const amount = Math.max(0, Utils.toNumber(match[1], 0));
            const unit = String(match[2]  '').toLowerCase();
            if (amount = 0) return 0;
            let turnsPerUnit = 1;
            if (^sec.test(unit)) turnsPerUnit = 1  6;
            else if (^min.test(unit)) turnsPerUnit = 10;
            else if (^h(ou)r.test(unit)) turnsPerUnit = 600;
            else if (^day.test(unit)) turnsPerUnit = 14400;
            return Math.max(1, Math.ceil(amount  turnsPerUnit));
        },

        concentrationTurnsLeftFromTooltip(text) {
            const source = String(text  '');
            const blockStart = source.search((^n)sCA Concentrationsi);
            if (blockStart  0) return null;
            const block = source.slice(blockStart);
            const match = block.match((^n)sDurationss(d+)s+turnss+leftbi);
            if (!match) return null;
            return Math.max(0, Utils.toInt(match[1], 0));
        },

        concentrationTurnsLeftFromToken(token) {
            if (!token  !Utils.isFunction(token.get)) return null;
            return this.concentrationTurnsLeftFromTooltip(token.get('tooltip'));
        },

        concentrationDurationLine(entry) {
            const turnsLeft = entry && entry.turnsLeft !== null && entry.turnsLeft !== undefined
                 Math.max(0, Utils.toInt(entry.turnsLeft, 0))
                 null;
            if (turnsLeft === null) return 'Duration Until concentration ends';
            return 'Duration ' + String(turnsLeft) + ' turn' + (turnsLeft === 1  ''  's') + ' left';
        },

        buildConcentrationTooltip(entry) {
            const data = entry  {};
            return 'CA Concentration ' + String(data.spellName  'Concentration').trim() +
                'nToken ' + String(data.casterTokenId  '').trim() +
                'nAction ' + String(data.actionId  '').trim() +
                'n' + this.concentrationDurationLine(data);
        },

        syncConcentrationTooltip(entry, token) {
            if (!entry  !token  !Utils.isFunction(token.get)  !Utils.isFunction(token.set)) return false;
            const currentTooltip = String(token.get('tooltip')  '');
            const baseTooltip = this.stripConcentrationTooltip(currentTooltip);
            const nextTooltip = (baseTooltip  (baseTooltip + 'n')  '') + this.buildConcentrationTooltip(entry);
            try {
                 Write the text independently first. Roll20 has historically had quirks
                 around the show_tooltip toggle, while the tooltip property itself is writable.
                token.set('tooltip', nextTooltip);
                token.set('show_tooltip', true);
                if (String(token.get('tooltip')  '') !== nextTooltip) {
                    token.set({ tooltip nextTooltip, show_tooltip true });
                }
                return String(token.get('tooltip')  '') === nextTooltip;
            } catch (error) {
                Logger.debug('[concentrationtooltip]', error && error.message  error.message  String(error));
                return false;
            }
        },

        processConcentrationTurnStart(tokenId) {
            if (!RuntimeConfig.get('CONC_TURN_TRACKER')) return false;
            const safeTokenId = String(tokenId  '').trim();
            if (!safeTokenId) return false;
            const entry = State.getConcentrationByTokenId(safeTokenId);
            if (!entry  entry.turnsLeft === null  entry.turnsLeft === undefined) return false;
            const token = R20.getTokenById(safeTokenId);
            const tooltipTurns = this.concentrationTurnsLeftFromToken(token);
            const before = tooltipTurns !== null
                 tooltipTurns
                 Math.max(0, Utils.toInt(entry.turnsLeft, 0));
            const after = Math.max(0, before - 1);
            entry.turnsLeft = after;
            if (after  0) {
                this.syncConcentrationTooltip(entry, token);
                return true;
            }
            Render.sendConcentrationExpired({
                casterName token  this.getTokenName(token)  String(entry.casterName  'Caster'),
                casterImgsrc token && Utils.isFunction(token.get)  String(token.get('imgsrc')  '')  '',
                spellName entry.spellName  'Concentration'
            });
            this.endConcentrationByTokenId(safeTokenId, 'duration expired', { silent true });
            return true;
        },

        stripConcentrationTooltip(text) {
            return String(text  '').replace(nsCA Concentration[sS]$i, '').trim();
        },

        startConcentrationForRequest(request, casterToken) {
            if (!RuntimeConfig.get('CONCENTRATION_TRACKING')) return false;
            if (!request  !request.payload  !request.payload.isConcentration  !casterToken  !Utils.isFunction(casterToken.get)  !Utils.isFunction(casterToken.set)) return false;
            const casterTokenId = R20.getTokenId(casterToken);
            if (!casterTokenId) return false;
            const actionId = String(request.id  '').trim();
            const spellName = String(request.attackName  request.payload.sourceAction  'Concentration').trim();
            const previous = State.removeConcentrationByTokenId(casterTokenId);
            if (previous && previous.actionId && previous.actionId !== actionId) {
                const previousRequest = State.getPlayerActionRequest(previous.actionId);
                if (previousRequest) {
                    previousRequest.concentrationAreaActive = false;
                    State.removePlayerActionMarkers(previousRequest);
                }
            }
            const currentTooltip = String(casterToken.get('tooltip')  '');
            const priorTooltip = previous  String(previous.priorTooltip  '')  this.stripConcentrationTooltip(currentTooltip);
            const priorShowTooltip = previous  !!previous.priorShowTooltip  Utils.toBoolean(casterToken.get('show_tooltip'), false);
            const durationText = String(request.payload.durationText  '').trim();
            const durationTurns = this.concentrationDurationTurns(durationText);
            this.setTokenStatusMarker(casterToken, 'stopwatch', true);
            request.payload.casterTokenId = casterTokenId;
            request.concentrationAreaActive = true;
            request.concentrationCasterTokenId = casterTokenId;
            State.setConcentration({
                actionId,
                casterTokenId,
                spellName,
                durationText,
                durationTurns,
                turnsLeft durationTurns,
                priorTooltip,
                priorShowTooltip,
                markerTokenIds State.getPlayerActionMarkerIds(request)
            });
            const concentrationEntry = State.getConcentrationByTokenId(casterTokenId);
            this.syncConcentrationTooltip(concentrationEntry, casterToken);
            return true;
        },

        repairConcentrationTooltips() {
            const root = State.get();
            const concentration = root && root.concentration && typeof root.concentration === 'object'  root.concentration  {};
            let repaired = 0;
            Object.keys(concentration).forEach((tokenId) = {
                const entry = concentration[tokenId];
                const token = R20.getTokenById(tokenId);
                if (entry && token && this.syncConcentrationTooltip(entry, token)) repaired += 1;
            });
            return repaired;
        },

        endConcentrationByTokenId(tokenId, reason, options) {
            const opts = options  {};
            const entry = State.removeConcentrationByTokenId(tokenId);
            if (!entry) return false;
            const token = R20.getTokenById(entry.casterTokenId);
            if (token && Utils.isFunction(token.set)) {
                try {
                    token.set({
                        show_tooltip !!entry.priorShowTooltip,
                        tooltip String(entry.priorTooltip  '')
                    });
                } catch (ignored) {}
                this.setTokenStatusMarker(token, 'stopwatch', false);
            }
            const request = State.getPlayerActionRequest(entry.actionId);
            if (request) {
                request.concentrationAreaActive = false;
                State.removePlayerActionMarkers(request);
                const root = State.get();
                if (root.playerActionRequests) delete root.playerActionRequests[String(entry.actionId  '').trim()];
            }
            if (!opts.silent) {
                Render.sendWhisperMessage('GM', 'Concentration Ended', 'strong' + Utils.escapeHtml(entry.spellName  'Concentration') + 'strong' + (reason  (' ' + Utils.escapeHtml(reason))  ''), 'normal');
            }
            return true;
        },

        concentrationDamageDc(damageAmount) {
            return Math.max(10, Math.floor(Math.max(0, Utils.toNumber(damageAmount, 0))  2));
        },

        concentrationDamageTypeFromResult(result) {
            const parts = Array.isArray(result && result.parts)  result.parts  [];
            const damagingPart = parts.find((part) = Math.max(0, Utils.toInt(part && part.finalDamage, 0))  0);
            return this.normalizeDamageType(damagingPart && damagingPart.damageType  (parts[0] && parts[0].damageType)  'normal');
        },

        resolveConcentrationSave(token, roll, pending) {
            const tokenId = R20.getTokenId(token);
            const entry = State.getConcentrationByTokenId(tokenId);
            const safePending = pending  {};
            const payload = safePending.payload  {};
            if (!entry) {
                Render.sendWhisperMessage('GM', 'Concentration Check', Utils.escapeHtml(this.getTokenName(token)  'Token') + ' is no longer concentrating.', 'warning');
                return { ok false, success false };
            }
            const dc = Math.max(10, Utils.toInt(safePending.concentrationDc  payload.challenge  payload.concentrationDc, 10));
            const total = Utils.toNumber(roll && roll.total, 0);
            const tokenName = this.getTokenName(token);
            const spellName = (entry && entry.spellName)  safePending.concentrationSpellName  payload.concentrationSpellName  'Concentration';
            const success = total = dc;
            if (success) {
                const totalHtml = Html.span(Utils.escapeHtml(String(total)), 'colorrgb(52,203,116);font-weight900;');
                const tokenHtml = Html.span(Utils.escapeHtml(tokenName  'Token'), 'color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight900;');
                const spellHtml = Html.span(Utils.escapeHtml(spellName), 'colorrgb(245,220,80);font-weight900;');
                const body = tokenHtml + ' maintains ' + spellHtml + ' concentration with a CON save of ' + totalHtml + ' vs DC ' + Utils.escapeHtml(String(dc)) + '.';
                Render.sendPublicMessage('Concentration Check', body, 'success');
            } else {
                Render.sendConcentrationLost({
                    casterName tokenName,
                    casterImgsrc token && Utils.isFunction(token.get)  String(token.get('imgsrc')  '')  '',
                    spellName,
                    dc,
                    roll
                });
                this.endConcentrationByTokenId(tokenId, 'failed concentration save DC ' + dc, { silent true });
            }
            return { ok true, success, dc, total };
        },

        queueConcentrationSaveForDamage(token, result) {
            if (!RuntimeConfig.get('CONCENTRATION_TRACKING')) return false;
            const tokenId = R20.getTokenId(token);
            const entry = State.getConcentrationByTokenId(tokenId);
            const damageTaken = Math.max(0, Utils.toInt(result && result.totalDamage, 0));
            if (!entry  damageTaken = 0) return false;
            if (!this.tokenHasStatusMarker(token, 'stopwatch')) return false;
            const dc = this.concentrationDamageDc(damageTaken);
            const damageType = this.concentrationDamageTypeFromResult(result);
            const payload = {
                type 'concentration',
                mode 'save',
                challenge dc,
                saveAbility 'constitution',
                halfOnSuccess false,
                damageTotal damageTaken,
                damageType,
                damageRolls [{ total damageTaken, damageType, formula 'Concentration' }],
                sourceName result && result.sourceName  '',
                sourceAction 'Concentration Check',
                concentrationCheck true,
                concentrationDc dc,
                concentrationTokenId tokenId,
                concentrationActionId entry.actionId,
                concentrationSpellName entry.spellName  'Concentration'
            };
            const queued = this.startNativeSavingDamageRoll(token, payload, 'GM', { deferPlayerPrompt true });
            if (!queued.ok) {
                const roll = this.rollSavingThrowForToken(token, 'constitution', 'normal');
                if (!roll.ok) {
                    Render.sendWhisperMessage('GM', 'Concentration Check', queued.message  roll.message  'Concentration saving throw could not be rolled.', 'warning');
                    return false;
                }
                R20.direct(Render.showSavingThrowResults([roll], 'CON'));
                this.resolveConcentrationSave(token, roll, { payload, concentrationDc dc, concentrationSpellName entry.spellName });
                return true;
            }
            if (queued.playerPrompt) {
                const recipients = Array.isArray(queued.recipients) && queued.recipients.length  queued.recipients  ['GM'];
                recipients.forEach((recipient) = R20.whisper(recipient, queued.card  Render.showNativeSaveRollRequest({
                    tokenName queued.tokenName  this.getTokenName(token),
                    saveAbility 'constitution',
                    challenge dc,
                    damage damageTaken,
                    damageType,
                    command queued.command  '',
                    concentrationSpellName entry.spellName  'Concentration'
                })));
                return true;
            }
            if (queued.sheetVersion === '2014') {
                if (RuntimeConfig.get('SHEET_2014_CA_ROLLS')) {
                    R20.whisper('GM', Render.showNativeBatchRollRequest({
                        title '2014 Concentration Check',
                        intro 'Roll a strongCONstrong saving throw DC ' + Utils.escapeHtml(String(dc)) + ' to maintain concentration',
                        names [queued.tokenName  this.getTokenName(token)],
                        label 'CON',
                        iconHtml '&#127922;',
                        command '!combatAssistant roll2014save &#63;{Roll ModeNormal,normalAdvantage,advantageDisadvantage,disadvantage} ' +
                            Utils.encodeJsonPayload({ ids [queued.requestId].filter(Boolean) }),
                        tooltip 'Roll the concentration saving throw with Combat Assistant'
                    }));
                    return true;
                }
                const batch = R20.createNativeRollBatchAbility([queued.batchCommand  queued.nativeCommand  '']);
                if (batch.ok) {
                    R20.whisper('GM', Render.showNativeBatchRollRequest({
                        title 'Concentration Check',
                        intro 'Roll a strongCONstrong saving throw DC ' + Utils.escapeHtml(String(dc)) + ' to maintain concentration',
                        names [queued.tokenName  this.getTokenName(token)],
                        label 'CON',
                        iconHtml '&#127922;',
                        command batch.command,
                        tooltip 'Roll the concentration saving throw'
                    }));
                    return true;
                }
                Render.sendWhisperMessage('GM', 'Concentration Check', batch.message  'Could not create the 2014 concentration roll button.', 'warning');
                return false;
            }
            R20.sendNativeCommandsSequentially([queued.nativeCommand  queued.batchCommand  ''], 100);
            return true;
        },

        normalizeTraitList(value, removePattern) {
            const raw = String(value  '').trim().toLowerCase();
            if (!raw  raw === '-'  raw === 'none') return [];
            return raw
                .replace(bandbg, ',')
                .split([,;]+)
                .map((entry) = entry
                    .replace(([^)])g, '')
                    .replace(removePattern  $^, '')
                    .trim()
                )
                .filter(Boolean)
                .filter((entry, index, list) = list.indexOf(entry) === index);
        },

        normalizeDamageTraitValue(value) {
            const values = [];
            const collect = (entry) = {
                if (entry === undefined  entry === null) return;
                if (Array.isArray(entry)) {
                    entry.forEach(collect);
                    return;
                }
                if (typeof entry === 'object') {
                    ['damage', 'type', 'value', 'name', 'label'].forEach((key) = {
                        if (Object.prototype.hasOwnProperty.call(entry, key)) collect(entry[key]);
                    });
                    return;
                }
                values.push(String(entry));
            };
            collect(value);
            return this.normalizeTraitList(values.join(','), damagegi);
        },

        addDamageTraitValues(traits, target, value) {
            if (!traits  !target  !Object.prototype.hasOwnProperty.call(traits, target)) return;
            this.normalizeDamageTraitValue(value).forEach((entry) = {
                if (entry && traits[target].indexOf(entry)  0) traits[target].push(entry);
            });
        },

        readJsonDamageTraitFields(rawJson, traits) {
            if (!rawJson  !traits) return;
            let parsed = null;
            try {
                parsed = JSON.parse(String(rawJson  '').trim());
            } catch (error) {
                return;
            }
            if (!parsed  typeof parsed !== 'object'  Array.isArray(parsed)) return;
            const fields = Object.create(null);
            Object.keys(parsed).forEach((key) = {
                fields[String(key  '').trim().toLowerCase()] = parsed[key];
            });
            const pick = (names) = {
                for (let i = 0; i  names.length; i += 1) {
                    const key = String(names[i]  '').trim().toLowerCase();
                    if (Object.prototype.hasOwnProperty.call(fields, key)) return fields[key];
                }
                return '';
            };
            this.addDamageTraitValues(traits, 'resistances', pick(['Resistances', 'Damage Resistances', 'Damage Resistance']));
            this.addDamageTraitValues(traits, 'immunities', pick(['Immunities', 'Damage Immunities', 'Damage Immunity']));
            this.addDamageTraitValues(traits, 'vulnerabilities', pick(['Vulnerabilities', 'Damage Vulnerabilities', 'Damage Vulnerability']));
        },

        read2014DamageTraits(characterId, traits) {
            if (!characterId  !traits) return traits;
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
            const traits = { resistances [], immunities [], vulnerabilities [] };
            if (!characterId  !RuntimeConfig.get('USE_SHEET_DAMAGE_TRAITS')) return traits;
            const addTraits = (target, value) = this.addDamageTraitValues(traits, target, value);
            const walk = (node) = {
                if (!node  typeof node !== 'object') return;
                if (Array.isArray(node)) {
                    node.forEach(walk);
                    return;
                }
                const type = String(node.type  '').trim().toLowerCase();
                const hasCascades = Object.prototype.hasOwnProperty.call(node, 'cascades');
                const enabled = !Object.prototype.hasOwnProperty.call(node, '_enabled')  Utils.toBoolean(node._enabled, true);
                if (type === 'defense' && enabled && !hasCascades) {
                    const defense = String(node.defense  '').trim().toLowerCase();
                    if (defense.indexOf('resist') = 0) addTraits('resistances', node.damage);
                    else if (defense.indexOf('immune') = 0  defense.indexOf('immun') = 0) addTraits('immunities', node.damage);
                    else if (defense.indexOf('vulner') = 0) addTraits('vulnerabilities', node.damage);
                }
                Object.keys(node).forEach((key) = walk(node[key]));
            };
            R20.getCharacterStoreDumpRoots(characterId).forEach(walk);
            this.read2014DamageTraits(characterId, traits);
            Logger.debug('[Sheet traits]', characterId, JSON.stringify(traits));
            return traits;
        },

        traitIncludes(traitText, damageType) {
            const type = this.normalizeDamageType(damageType);
            if (!type  type === 'normal'  type === 'healing'  type === 'temp healing') return false;
            const list = Array.isArray(traitText)  traitText  this.normalizeDamageTraitValue(traitText);
            if (!list.length) return false;
            if (list.some((entry) = {
                const current = String(entry  '').trim().toLowerCase();
                return current === type  current.indexOf(type) = 0  type.indexOf(current) = 0;
            })) return true;
            const text = list.join(',');
            if (type === 'bludgeoning' && bludgeon.test(text)) return true;
            if (type === 'piercing' && pierc.test(text)) return true;
            if (type === 'slashing' && slash.test(text)) return true;
            return false;
        },

        applyTraits(amount, damageType, traits) {
            let finalDamage = Math.max(0, Utils.toInt(amount, 0));
            const immune = this.traitIncludes(traits.immunities, damageType);
            const resistant = this.traitIncludes(traits.resistances, damageType);
            const vulnerable = this.traitIncludes(traits.vulnerabilities, damageType);
            if (immune) finalDamage = 0;
            else {
                if (resistant) finalDamage = RuntimeConfig.get('DAMAGE_ROUND_UP')  Math.ceil(finalDamage  2)  Math.floor(finalDamage  2);
                if (vulnerable) finalDamage = 2;
            }
            return { finalDamage, immune, resistant, vulnerable };
        },

        readAttributeNumber(characterId, names, fallback) {
            const safeCharacterId = String(characterId  '').trim();
            const safeNames = (Array.isArray(names)  names  [names]).map((name) = String(name  '').trim().toLowerCase()).filter(Boolean);
            if (!safeCharacterId  !safeNames.length) return fallback;
            const attrs = findObjs({ _type 'attribute', _characterid safeCharacterId })  [];
            for (let i = 0; i  attrs.length; i += 1) {
                const attr = attrs[i];
                if (!attr  !Utils.isFunction(attr.get)) continue;
                if (safeNames.indexOf(String(attr.get('name')  '').trim().toLowerCase())  0) continue;
                const current = attr.get('current');
                if (current !== undefined && current !== null && String(current).trim() !== '') return Utils.toInt(current, fallback);
            }
            return fallback;
        },

        readAttributeRaw(characterId, names, fallback) {
            const safeCharacterId = String(characterId  '').trim();
            const safeNames = (Array.isArray(names)  names  [names]).map((name) = String(name  '').trim().toLowerCase()).filter(Boolean);
            if (!safeCharacterId  !safeNames.length) return fallback;
            const attrs = findObjs({ _type 'attribute', _characterid safeCharacterId })  [];
            for (let i = 0; i  attrs.length; i += 1) {
                const attr = attrs[i];
                if (!attr  !Utils.isFunction(attr.get)) continue;
                if (safeNames.indexOf(String(attr.get('name')  '').trim().toLowerCase())  0) continue;
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
                if (numericProf !== null && numericProf !== undefined && numericProf  0) proficiency = numericProf;
                else if (@{pb}proficienttrueyeson1i.test(profRaw)) proficiency = this.getProficiencyBonus(characterId);
            }
            const globalSaveBonus = this.readAttributeNumber(characterId, [
                'global_save_mod',
                'global_saving_throw_bonus',
                'globalsavingthrowbonus'
            ], 0);
            return abilityMod + proficiency + globalSaveBonus;
        },

        getAbilityScoreFromStore(characterId, ability) {
            const safeAbility = this.normalizeAbilityName(ability);
            if (!safeAbility) return null;
            const scores = [];
            this.walkCharacterStoreIntegrants(characterId, (node, inheritedCascades) = {
                const type = String(node.type  '').trim().toLowerCase();
                const abilityName = String(node.ability  node.name  '').trim().toLowerCase();
                const enabled = !Object.prototype.hasOwnProperty.call(node, '_enabled')  Utils.toBoolean(node._enabled, true);
                if (type !== 'ability score'  inheritedCascades  !enabled  abilityName !== safeAbility) return;
                const flatValue = this.readFlatValue(node);
                if (flatValue !== null && flatValue !== undefined) scores.push(flatValue);
            });
            const usableScores = scores.filter((score) = score = 3);
            if (usableScores.length) return Math.max.apply(null, usableScores);
            return scores.length  Math.max.apply(null, scores)  null;
        },

        getSavingThrowStoreBonus(characterId, ability) {
            const safeAbility = this.normalizeAbilityName(ability);
            if (!safeAbility) return 0;
            const shortAbility = String(this.abilityNameToShortLabel(safeAbility)  '').trim().toLowerCase();
            let bonus = 0;
            const seen = Object.create(null);
            this.walkCharacterStoreIntegrants(characterId, (node, inheritedCascades) = {
                const type = String(node.type  '').trim().toLowerCase();
                const enabled = !Object.prototype.hasOwnProperty.call(node, '_enabled')  Utils.toBoolean(node._enabled, true);
                if (inheritedCascades  !enabled) return;
                const abilityText = String(node.ability  node.name  node.recordName  node.label  '').trim().toLowerCase();
                const bonusNames = this.parseStoreList(node.bonusName).map((entry) = String(entry  '').trim().toLowerCase()).filter(Boolean);
                const categories = this.parseStoreList(node.bonusCategory).map((entry) = entry.toLowerCase());
                const isSavingThrowNode = type === 'saving throw'  categories.indexOf('saving throws') = 0  categories.indexOf('saving throw') = 0;
                if (!isSavingThrowNode) return;
                if (bonusNames.length && bonusNames.indexOf(safeAbility)  0 && bonusNames.indexOf(shortAbility)  0) return;
                if (abilityText && abilityText !== safeAbility && abilityText.indexOf(safeAbility)  0) return;
                const key = String(node.shortID  node.id  node.name  JSON.stringify(node)).slice(0, 80);
                if (seen[key]) return;
                seen[key] = true;
                const flatValue = this.readFlatValue(node);
                if (flatValue) bonus += flatValue;
                const formula = node.valueFormula && typeof node.valueFormula === 'object'  node.valueFormula  {};
                if (formula.proficiency && Utils.toBoolean(formula.proficiency.add, false)) bonus += this.getProficiencyBonus(characterId);
            });
            return bonus;
        },

        readSavingThrowModifier(characterId, ability) {
            const safeAbility = this.normalizeAbilityName(ability);
            if (!safeAbility) return 0;
            const sheetVersion = R20.detectSheetVersion(characterId);
            if (sheetVersion === '2024') {
                const score = this.getAbilityScoreFromStore(characterId, safeAbility);
                const abilityMod = score === null  score === undefined
                     this.readAttributeNumber(characterId, [safeAbility + '_mod', (this.abilityNameToShortLabel(safeAbility)  '').toLowerCase() + '_mod'], 0)
                     this.abilityScoreToModifier(score);
                return abilityMod + this.getSavingThrowStoreBonus(characterId, safeAbility);
            }
            return this.read2014SavingThrowModifier(characterId, safeAbility);
        },

        characterHasMagicResistance(characterId) {
            const safeCharacterId = String(characterId  '').trim();
            if (!safeCharacterId) return false;
            const character = getObj('character', safeCharacterId);
            const haystack = [];
            if (character && Utils.isFunction(character.get)) {
                 Character bio and gmnotes are asynchronous Roll20 properties.
                 Reading them synchronously causes a sandbox console error, so
                 magic resistance detection relies on sheet attributesstore data.
                haystack.push(character.get('name'));
            }
            const attrs = findObjs({ _type 'attribute', _characterid safeCharacterId })  [];
            attrs.forEach((attr) = {
                if (!attr  !Utils.isFunction(attr.get)) return;
                const name = String(attr.get('name')  '');
                const current = attr.get('current');
                if (magic[_s-]resistancei.test(name)  traiti.test(name)  npci.test(name)  data-traitsi.test(name)) {
                    haystack.push(name);
                    haystack.push(current);
                }
            });
            this.walkCharacterStoreIntegrants(safeCharacterId, (node) = {
                if (!node  typeof node !== 'object') return;
                haystack.push(node.name);
                haystack.push(node.recordName);
                haystack.push(node.title);
                haystack.push(node.description);
                haystack.push(node.label);
                haystack.push(node.text);
                haystack.push(node.content);
            });
            return haystack.some((entry) = magics+resistanceresistencias+m[au00e1]gicai.test(Utils.stripHtml(String(entry  ''))));
        },

        isMagicalSavePayload(payload) {
            const data = payload  {};
            if (Utils.toBoolean(data.isSpellAction, false)) return true;
            const sourceText = [
                data.sourceAction,
                data.attackName,
                data.actionName,
                data.description,
                data.rangeText
            ].map((entry) = String(entry  '')).join(' ');
            return bspellbbmagic(al)bi.test(sourceText);
        },

        getForcedSaveRollMode(token, payload) {
            const character = R20.getCharacterFromToken(token);
            const characterId = character  String(character.id  (Utils.isFunction(token.get)  token.get('represents')  '')  '').trim()  '';
            if (characterId && this.isMagicalSavePayload(payload) && this.characterHasMagicResistance(characterId)) {
                if (payload && payload.concentrationCheck) return { mode '', reason '' };
                const requestedMode = this.normalizeRollMode(payload && payload.rollMode  'normal');
                if (requestedMode === 'disadvantage') return { mode 'normal', reason 'Magic Resistance cancels disadvantage' };
                return { mode 'advantage', reason 'Magic Resistance' };
            }
            return { mode '', reason '' };
        },

        getMagicResistanceSaveInfo(token, payload) {
            const character = R20.getCharacterFromToken(token);
            const characterId = character  String(character.id  (Utils.isFunction(token.get)  token.get('represents')  '')  '').trim()  '';
            if (payload && payload.concentrationCheck) return { applies false, reason '' };
            if (characterId && this.isMagicalSavePayload(payload) && this.characterHasMagicResistance(characterId)) {
                return { applies true, reason 'Magic Resistance' };
            }
            return { applies false, reason '' };
        },

        completePersistentAreaMarkerTarget(payload, tokenOrId) {
            const actionId = String(payload && payload.playerAreaActionId  '').trim();
            const targetId = typeof tokenOrId === 'string'
                 String(tokenOrId  '').trim()
                 R20.getTokenId(tokenOrId);
            if (!actionId  !targetId) return false;
            return State.completePersistentAreaMarkerTarget(actionId, targetId);
        },

        normalizeRollMode(mode) {
            const value = String(mode  '').trim().toLowerCase();
            if (value === 'adv'  value === 'advantage') return 'advantage';
            if (value === 'dis'  value === 'disadvantage') return 'disadvantage';
            return 'normal';
        },

        normalizeInitiativeRollMode(mode) {
            const value = String(mode  '').trim().toLowerCase();
            if (value === 'auto'  value === 'sheet') return 'auto';
            return this.normalizeRollMode(value);
        },

        rollSavingThrowForToken(token, ability, mode) {
            if (!token) return { ok false, message 'Target token was not found.' };
            const character = R20.getCharacterFromToken(token);
            if (!character) return { ok false, message this.getTokenName(token) + ' must be linked to a character.' };
            const characterId = String(character.id  token.get('represents')  '').trim();
            const safeAbility = this.normalizeAbilityName(ability);
            if (!characterId  !safeAbility) return { ok false, message 'Saving throw could not be resolved.' };
            const modifier = this.readSavingThrowModifier(characterId, safeAbility);
            const rollMode = this.normalizeRollMode(mode);
            const roll1 = this.rollD20();
            const roll2 = rollMode === 'normal'  null  this.rollD20();
            const natural = rollMode === 'advantage'
                 Math.max(roll1, roll2)
                 (rollMode === 'disadvantage'  Math.min(roll1, roll2)  roll1);
            return {
                ok true,
                tokenId String(token.id  token.get('_id')  '').trim(),
                tokenName this.getTokenName(token),
                characterId,
                characterName String(character.get('name')  this.getTokenName(token)  'Token').trim(),
                ability safeAbility,
                modifier,
                mode rollMode,
                rolls roll2 === null  [roll1]  [roll1, roll2],
                natural,
                total natural + modifier
            };
        },

        parseStoreList(value) {
            if (Array.isArray(value)) return value.map((entry) = String(entry  '').trim()).filter(Boolean);
            const raw = String(value  '').trim();
            if (!raw) return [];
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed.map((entry) = String(entry  '').trim()).filter(Boolean);
            } catch (ignored) {}
            return raw.split(',').map((entry) = String(entry  '').replace([[]]g, '').trim()).filter(Boolean);
        },

        walkCharacterStore(characterId, visitor) {
            if (!Utils.isFunction(visitor)) return;
            const walk = (node, ancestorHasCascades) = {
                if (!node  typeof node !== 'object') return;
                if (Array.isArray(node)) {
                    node.forEach((entry) = walk(entry, ancestorHasCascades));
                    return;
                }
                const hasCascades = ancestorHasCascades  Object.prototype.hasOwnProperty.call(node, 'cascades');
                visitor(node, hasCascades);
                Object.keys(node).forEach((key) = walk(node[key], hasCascades));
            };
            R20.getCharacterStoreDumpRoots(characterId).forEach((root) = walk(root, false));
        },

        walkCharacterStoreIntegrants(characterId, visitor) {
            if (!Utils.isFunction(visitor)) return;
            const walk = (node, ancestorHasCascades) = {
                if (!node  typeof node !== 'object') return;
                if (Array.isArray(node)) {
                    node.forEach((entry) = walk(entry, ancestorHasCascades));
                    return;
                }
                const hasCascades = ancestorHasCascades  Object.prototype.hasOwnProperty.call(node, 'cascades');
                visitor(node, hasCascades);
                Object.keys(node).forEach((key) = walk(node[key], hasCascades));
            };
            let walked = false;
            R20.getCharacterStoreDumpRoots(characterId).forEach((root) = {
                const integrants = root && root.integrants && root.integrants.integrants;
                if (!integrants  typeof integrants !== 'object') return;
                walked = true;
                if (Array.isArray(integrants)) {
                    integrants.forEach((entry) = walk(entry, false));
                } else {
                    Object.keys(integrants).forEach((key) = walk(integrants[key], false));
                }
            });
            if (!walked) this.walkCharacterStore(characterId, visitor);
        },

        abilityScoreToModifier(score) {
            return Math.floor((Utils.toInt(score, 10) - 10)  2);
        },

        readFlatValue(node) {
            if (!node  typeof node !== 'object') return null;
            const sources = [
                node.valueFormula && node.valueFormula.flatValue,
                node.flatValueFormula && node.flatValueFormula.flatValue,
                node.flatValue
            ];
            for (let i = 0; i  sources.length; i += 1) {
                if (sources[i] !== undefined && sources[i] !== null && String(sources[i]).trim() !== '') return Utils.toInt(sources[i], null);
            }
            return null;
        },

        getDexterityScoreFromStore(characterId) {
            const scores = [];
            this.walkCharacterStoreIntegrants(characterId, (node, inheritedCascades) = {
                const type = String(node.type  '').trim().toLowerCase();
                const ability = String(node.ability  node.name  '').trim().toLowerCase();
                const enabled = !Object.prototype.hasOwnProperty.call(node, '_enabled')  Utils.toBoolean(node._enabled, true);
                if (type !== 'ability score'  inheritedCascades  !enabled  ability !== 'dexterity') return;
                const flatValue = this.readFlatValue(node);
                if (flatValue !== null && flatValue !== undefined) scores.push(flatValue);
            });
            const usableScores = scores.filter((score) = score = 3);
            if (usableScores.length) return Math.max.apply(null, usableScores);
            return scores.length  Math.max.apply(null, scores)  null;
        },

        getDexterityModifierFromStore(characterId) {
            const score = this.getDexterityScoreFromStore(characterId);
            return score === null  score === undefined  null  this.abilityScoreToModifier(score);
        },

        getCharacterLevel(characterId) {
            const attrLevel = this.readAttributeNumber(characterId, ['level', 'character_level', 'base_level'], null);
            if (attrLevel !== null && attrLevel !== undefined && attrLevel  0) return attrLevel;

            const totalLevels = [];
            const classLevels = [];
            this.walkCharacterStoreIntegrants(characterId, (node, inheritedCascades) = {
                const type = String(node.type  '').trim().toLowerCase();
                const enabled = !Object.prototype.hasOwnProperty.call(node, '_enabled')  Utils.toBoolean(node._enabled, true);
                if (type !== 'class level'  inheritedCascades  !enabled) return;
                const totalLevel = Utils.toInt(node.totalLevel, null);
                const level = Utils.toInt(node.level, null);
                if (totalLevel !== null && totalLevel !== undefined && totalLevel  0) totalLevels.push(totalLevel);
                if (level !== null && level !== undefined && level  0) classLevels.push(level);
            });
            if (totalLevels.length) return Math.max.apply(null, totalLevels);
            if (classLevels.length) return classLevels.reduce((sum, level) = sum + level, 0);
            return 1;
        },

        getStandardProficiencyBonus(level) {
            const safeLevel = Math.max(1, Math.min(20, Utils.toInt(level, 1)));
            return Math.max(2, Math.min(6, Math.ceil(safeLevel  4) + 1));
        },

        getProficiencyBonus(characterId) {
            const attrPb = this.readAttributeNumber(characterId, ['pb', 'proficiency_bonus'], null);
            if (attrPb !== null && attrPb !== undefined && attrPb  0) return attrPb;
            return this.getStandardProficiencyBonus(this.getCharacterLevel(characterId));
        },

        getInitiativeExtraBonus(characterId) {
            let bonus = 0;
            const reasons = [];
            const seenReasons = Object.create(null);
            this.walkCharacterStoreIntegrants(characterId, (node, inheritedCascades) = {
                const type = String(node.type  '').trim().toLowerCase();
                const enabled = !Object.prototype.hasOwnProperty.call(node, '_enabled')  Utils.toBoolean(node._enabled, true);
                if (type !== 'initiative'  inheritedCascades  !enabled) return;
                const formula = node.valueFormula && typeof node.valueFormula === 'object'  node.valueFormula  {};
                const reason = String(node.recordName  node.name  'Initiative Bonus').trim();
                if (formula.proficiency && Utils.toBoolean(formula.proficiency.add, false)) {
                    const pb = this.getProficiencyBonus(characterId);
                    if (pb && !seenReasons[reason + 'proficiency']) {
                        seenReasons[reason + 'proficiency'] = true;
                        bonus += pb;
                        if (reason && reasons.indexOf(reason)  0) reasons.push(reason);
                    }
                }
                const flatValue = this.readFlatValue(node);
                if (flatValue && !seenReasons[reason + 'flat']) {
                    seenReasons[reason + 'flat'] = true;
                    bonus += flatValue;
                    if (reason && reasons.indexOf(reason)  0) reasons.push(reason);
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
            this.walkCharacterStoreIntegrants(characterId, (node, inheritedCascades) = {
                const type = String(node.type  '').trim().toLowerCase();
                const enabled = !Object.prototype.hasOwnProperty.call(node, '_enabled')  Utils.toBoolean(node._enabled, true);
                if (type !== 'roll bonus'  inheritedCascades  !enabled) return;
                const categories = this.parseStoreList(node.bonusCategory).map((entry) = entry.toLowerCase());
                if (categories.indexOf('initiative')  0) return;
                const details = String(node.bonusDetails  '').trim().toLowerCase();
                const reason = String(node.recordName  node.name  node.title  '').trim();
                if (details.indexOf('highest') = 0  details.indexOf('advantage') = 0) {
                    advantage += 1;
                    if (reason && advantageReasons.indexOf(reason)  0) advantageReasons.push(reason);
                }
                if (details.indexOf('lowest') = 0  details.indexOf('disadvantage') = 0) {
                    disadvantage += 1;
                    if (reason && disadvantageReasons.indexOf(reason)  0) disadvantageReasons.push(reason);
                }
            });
            if (advantage  disadvantage) return { mode 'advantage', reason advantageReasons.join(', ')  'Advantage' };
            if (disadvantage  advantage) return { mode 'disadvantage', reason disadvantageReasons.join(', ')  'Disadvantage' };
            return { mode 'normal', reason '' };
        },

        get2014InitiativeStyleRollInfo(characterId) {
            const style = String(this.readAttributeRaw(characterId, ['initiative_style'], '')  '').trim();
            if (!style) return { mode 'normal', reason '' };
            const normalized = style.toLowerCase().replace(s+g, '');
            if (bdisadvantagebblowestbkl1k1l2d20kl1}}kl1}kl1.test(normalized)) {
                return { mode 'disadvantage', reason 'Sheet initiative disadvantage' };
            }
            if (badvantagebbhighestbkh1k1h2d20kh1}}kh1}kh1.test(normalized)) {
                return { mode 'advantage', reason 'Sheet initiative advantage' };
            }
            return { mode 'normal', reason '' };
        },

        rollD20() {
            if (typeof randomInteger === 'function') return randomInteger(20);
            return Math.floor(Math.random()  20) + 1;
        },

        getPrimaryDamageFormula(payload) {
            const rolls = Array.isArray(payload && payload.damageRolls)  payload.damageRolls  [];
            const formulas = rolls
                .map((roll) = Utils.cleanRoll20Label(roll && roll.formula  ''))
                .filter((formula) = formula && formula !== 'Roll20' && formula !== 'Manual' && formula !== 'Concentration');
            const formula = formulas[0]  Utils.cleanRoll20Label(payload && payload.damageFormula  '');
            if (!formula  formula === 'Roll20'  formula === 'Manual'  formula === 'Concentration') return '';
            return formula.replace(s+g, '');
        },

        rollDamageFormula(formula) {
            const raw = Utils.cleanRoll20Label(formula  '').replace(s+g, '');
            if (!raw  !^ddd+([+-]ddd+)$i.test(raw)) {
                return { ok false, message 'Damage formula is not supported for reroll ' + raw };
            }
            const terms = raw.match([+-][^+-]+g)  [];
            const detail = [];
            const diceValues = [];
            let modifier = 0;
            let total = 0;
            for (let i = 0; i  terms.length; i += 1) {
                const term = terms[i];
                const sign = term.charAt(0) === '-'  -1  1;
                const body = term.replace(^[+-], '');
                const diceMatch = body.match(^(d)d(d+)$i);
                if (diceMatch) {
                    const count = Math.max(1, Utils.toInt(diceMatch[1]  1, 1));
                    const sides = Math.max(1, Utils.toInt(diceMatch[2], 0));
                    const values = [];
                    for (let d = 0; d  count; d += 1) values.push(this.rollDie(sides));
                    values.forEach((value) = diceValues.push(value  sign));
                    const subtotal = values.reduce((sum, value) = sum + value, 0)  sign;
                    total += subtotal;
                    detail.push((sign  0  '-'  '+') + count + 'd' + sides + '[' + values.join(',') + ']');
                } else {
                    const value = Utils.toInt(body, 0)  sign;
                    modifier += value;
                    total += value;
                    detail.push((value  0  ''  '+') + String(value));
                }
            }
            return {
                ok true,
                formula raw,
                total Math.max(0, total),
                detail detail.join(' ').replace(^+, ''),
                diceValues,
                modifier
            };
        },

        rollDie(sides) {
            const safeSides = Math.max(1, Utils.toInt(sides, 1));
            if (typeof randomInteger === 'function') return randomInteger(safeSides);
            return Math.floor(Math.random()  safeSides) + 1;
        },

        rollInitiativeForToken(token, forcedMode) {
            if (!token) return { ok false, message 'Token was not found.' };
            const character = R20.getCharacterFromToken(token);
            if (!character) return { ok false, message this.getTokenName(token) + ' must be linked to a character.' };
            const characterId = String(character.id  token.get('represents')  '').trim();
            const tokenId = String((Utils.isFunction(token.get)  token.get('_id')  '')  token.id  '').trim();
            const modifier = this.getInitiativeModifier(characterId);
            const forcedModeText = String(forcedMode  '').trim();
            const forcedModeNormalized = this.normalizeInitiativeRollMode(forcedModeText);
            const rollInfo = forcedModeText
                 (forcedModeNormalized === 'auto'
                     this.get2014InitiativeStyleRollInfo(characterId)
                     { mode forcedModeNormalized, reason 'Manual 2014 roll mode' })
                 this.getInitiativeRollInfo(characterId);
            const mode = rollInfo.mode;
            const roll1 = this.rollD20();
            const roll2 = mode === 'normal'  null  this.rollD20();
            const natural = mode === 'advantage'
                 Math.max(roll1, roll2)
                 (mode === 'disadvantage'  Math.min(roll1, roll2)  roll1);
            const total = natural + modifier;
            return {
                ok true,
                tokenId,
                tokenName this.getTokenName(token),
                characterId,
                characterName String(character.get('name')  this.getTokenName(token)  'Token').trim(),
                modifier,
                mode,
                rollModeReason rollInfo.reason,
                rolls roll2 === null  [roll1]  [roll1, roll2],
                natural,
                total
            };
        },

        applyInitiativeResults(results) {
            const safeResults = (Array.isArray(results)  results  []).filter((entry) = entry && entry.ok && entry.tokenId);
            return RollParser.updateTurnOrderWithInitiativeResults(safeResults.map((entry) = ({
                tokenId String(entry.tokenId),
                pageId RollParser.getTokenPageId(String(entry.tokenId)),
                total entry.total
            })));
        },

        getNativeSaveMacroName(ability) {
            const safeAbility = this.normalizeAbilityName(ability);
            return safeAbility  (safeAbility + '_save')  '';
        },

        getNativeSaveCommandSet(characterId, ability) {
            const safeAbility = this.normalizeAbilityName(ability);
            if (!safeAbility) return { macroName '', buttonCommand '', nativeCommand '', batchCommand '', sheetVersion 'unknown', requiresButton false };
            const sheetVersion = R20.detectSheetVersion(characterId);
            const macroName = sheetVersion === '2014'  (safeAbility + '_save_roll')  (safeAbility + '_save');
            const requiresButton = sheetVersion === '2014';
            const sheetAttributeCommand = requiresButton  R20.sheetAttributeCommand(characterId, macroName, false)  '';
            return {
                macroName,
                buttonCommand requiresButton  ''  R20.buttonAbilityCommand(characterId, macroName),
                nativeCommand requiresButton  ''  R20.chatAbilityCommand(characterId, macroName),
                batchCommand requiresButton  sheetAttributeCommand  R20.chatAbilityCommand(characterId, macroName),
                sheetVersion,
                requiresButton
            };
        },

        startNativeSavingDamageRoll(token, payload, who, options) {
            const opts = options  {};
            if (!RuntimeConfig.get('CHAT_TRACKING')) {
                return { ok false, message 'Chat Tracking must be enabled to read Roll20 saving throws.' };
            }
            if (!token) return { ok false, message 'Target token was not found.' };
            const character = R20.getCharacterFromToken(token);
            if (!character) return { ok false, message 'Target token needs an assigned character to roll a saving throw.' };
            const characterId = String(character.id  token.get('represents')  '').trim();
            const saveAbility = this.normalizeAbilityName(payload && payload.saveAbility  '');
            const commandSet = this.getNativeSaveCommandSet(characterId, saveAbility);
            if (!characterId  !commandSet.macroName  !commandSet.batchCommand  (!commandSet.requiresButton && !commandSet.nativeCommand)) return { ok false, message 'Native saving throw macro could not be resolved.' };
            const tokenName = this.getTokenName(token);
            const characterName = String(character.get('name')  tokenName  'Token').trim();
            const damageRolls = Array.isArray(payload && payload.damageRolls)  payload.damageRolls  [];
            const fallbackDamage = Math.max(0, Utils.toInt(payload && (payload.damageTotal  payload.amount  payload.damage), 0));
            const damage = damageRolls.length
                 damageRolls.reduce((sum, roll) = sum + Math.max(0, Utils.toInt(roll && (roll.total  roll.amount  roll.damage), 0)), 0)
                 fallbackDamage;
            const damageType = damageRolls.length  damageRolls[0].damageType  (payload && payload.damageType  'normal');
            const playerCommand = commandSet.buttonCommand;
            const nativeCommand = commandSet.nativeCommand;
            const batchCommand = String(commandSet.batchCommand  nativeCommand  '').trim();
            const tokenControlledBy = token && Utils.isFunction(token.get)  String(token.get('controlledby')  '')  '';
            const characterControlledBy = character && Utils.isFunction(character.get)  String(character.get('controlledby')  '')  '';
            const hasPlayerController = R20.isPlayerControlledToken(token, character);
            const playerRecipients = hasPlayerController  R20.getTokenControllerDisplayNames(token, character)  [];
            const shouldAskPlayer = hasPlayerController &&
                RuntimeConfig.get('PLAYER_MANUAL_ROLL');
            const recipients = shouldAskPlayer  Utils.uniqueNames(['GM'].concat(playerRecipients))  ['GM'];
            const magicResistance = commandSet.sheetVersion === '2024'  this.getMagicResistanceSaveInfo(token, payload)  { applies false, reason '' };
            const forcedRoll = commandSet.sheetVersion === '2014'  this.getForcedSaveRollMode(token, payload)  { mode '', reason '' };
            const requestId = RollParser.createPendingNativeSave({
                tokenId String(token.id  token.get('_id')  '').trim(),
                characterId,
                characterName,
                tokenName,
                rollName saveAbility,
                payload Object.assign({}, payload  {}),
                requestedBy String(who  'GM'),
                captureNative true,
                buttonCommand playerCommand,
                nativeCommand,
                batchCommand,
                sheetVersion commandSet.sheetVersion,
                recipients,
                playerPrompt shouldAskPlayer,
                magicResistanceReroll !!magicResistance.applies,
                magicResistanceRerollStage '',
                magicResistanceReason magicResistance.reason,
                forcedRollMode forcedRoll.mode,
                forcedRollReason forcedRoll.reason,
                concentrationCheck !!(payload && payload.concentrationCheck),
                concentrationDc Math.max(0, Utils.toInt(payload && (payload.concentrationDc  payload.challenge), 0)),
                concentrationSpellName String(payload && payload.concentrationSpellName  '').trim()
            });
            if (!requestId) return { ok false, message 'Native saving throw request could not be queued.' };
            if (!shouldAskPlayer) {
                if (!batchCommand) return { ok false, message 'Native saving throw batch command could not be resolved.' };
                return {
                    ok true,
                    pending true,
                    requestId,
                    tokenName,
                    characterName,
                    saveAbility,
                    challenge Math.max(0, Utils.toInt(payload && payload.challenge, 0)),
                    damage,
                    damageType,
                    command playerCommand,
                    nativeCommand,
                    batchCommand,
                    sheetVersion commandSet.sheetVersion,
                    batchRoll true,
                    tokenControlledBy,
                    characterControlledBy,
                    recipients,
                    forcedRollMode forcedRoll.mode,
                    forcedRollReason forcedRoll.reason
                };
            }
            const promptCommand = forcedRoll.mode
                 ('!combatAssistant rollsave ' + requestId + ' ' + forcedRoll.mode)
                 (playerCommand  (commandSet.requiresButton  R20.createNativeRollButtonCommand(batchCommand)  ''));
            const card = Render.showNativeSaveRollRequest({
                tokenName,
                saveAbility,
                challenge Math.max(0, Utils.toInt(payload && payload.challenge, 0)),
                damage,
                damageType,
                command promptCommand,
                concentrationSpellName payload && payload.concentrationCheck  String(payload.concentrationSpellName  'Concentration').trim()  '',
                note magicResistance.applies  'Magic Resistance'  (forcedRoll.reason  '')
            });
            if (opts.deferPlayerPrompt) {
                return { ok true, pending true, requestId, tokenName, recipients, sheetVersion commandSet.sheetVersion, card, playerPrompt true, damage, damageType, command promptCommand, forcedRollMode forcedRoll.mode, forcedRollReason forcedRoll.reason };
            }
            recipients.forEach((recipient) = R20.whisper(recipient, card));
            return { ok true, pending true, requestId, tokenName, recipients, sheetVersion commandSet.sheetVersion, forcedRollMode forcedRoll.mode, forcedRollReason forcedRoll.reason };
        },

        getTokenMutationKey(token) {
            if (!token  !Utils.isFunction(token.get)) return '';
            const character = R20.getCharacterFromToken(token);
            const characterId = character  String(character.id  token.get('represents')  '').trim()  String(token.get('represents')  '').trim();
            if (characterId) return 'character' + characterId;
            const tokenId = String(token.get('_id')  token.id  '').trim();
            return tokenId  ('token' + tokenId)  '';
        },

        runTokenMutation(token, operation) {
            if (!Utils.isFunction(operation)) return Promise.resolve({ ok false, message 'Token operation was not provided.' });
            const key = this.getTokenMutationKey(token);
            if (!key) return Promise.resolve().then(operation);
            const previous = TOKEN_MUTATION_QUEUES[key]  Promise.resolve();
            const queued = previous
                .catch((error) = {
                    Logger.debug('[token-mutationprevious]', key, error && error.message  error.message  String(error));
                })
                .then(operation);
            let tracked = null;
            const release = () = {
                if (TOKEN_MUTATION_QUEUES[key] === tracked) delete TOKEN_MUTATION_QUEUES[key];
            };
            tracked = queued.then(
                (result) = {
                    release();
                    return result;
                },
                (error) = {
                    release();
                    throw error;
                }
            );
            TOKEN_MUTATION_QUEUES[key] = tracked;
            return tracked;
        },

        applyDamageToToken(token, payload) {
            return this.runTokenMutation(token, () = this.applyDamageToTokenUnlocked(token, payload));
        },

        buildMissDamageResult(context, extra) {
            return Object.assign({
                ok true,
                tokenName context.tokenName,
                tokenImgsrc context.tokenImgsrc,
                sourceImgsrc context.payload.sourceImgsrc  '',
                missed true,
                sourceName context.payload.sourceName  '',
                sourceAction context.payload.sourceAction  '',
                totalDamage 0,
                parts [],
                previousHp context.hpBar.value,
                currentHp context.hpBar.value
            }, extra  {});
        },

        resolveAttackDamageGate(token, context) {
            const payload = context.payload;
            if (payload.forceMiss  payload.mode === 'miss') {
                return { complete true, result this.buildMissDamageResult(context) };
            }
            if (context.mode !== 'attack'  context.challenge = 0) return { complete false };

            const ac = this.readAc(token);
            const attackNatural = Math.max(0, Utils.toInt(payload.attackNatural, 0));
            if (attackNatural === 1) {
                return {
                    complete true,
                    result this.buildMissDamageResult(context, {
                        naturalOne true,
                        ac,
                        attackTotal context.challenge
                    })
                };
            }
            if (ac = 0 && RuntimeConfig.get('REQUIRE_AC_FOR_ATTACK')) {
                return {
                    complete true,
                    result {
                        ok false,
                        message context.tokenName + ' has no valid AC in the configured AC bar. Use Hit for direct damage or configure the AC bar.'
                    }
                };
            }
            if (attackNatural !== 20 && ac  0 && context.challenge  ac) {
                return {
                    complete true,
                    result this.buildMissDamageResult(context, {
                        ac,
                        attackTotal context.challenge
                    })
                };
            }
            return { complete false };
        },

        resolveDamageSaveOutcome(context) {
            if (context.mode !== 'save'  context.challenge = 0) {
                return { ok true, save { used false }, noDamage false, halfDamage false };
            }
            if (!context.characterId) {
                return { ok false, message 'Target token needs an assigned character to roll a saving throw.' };
            }
            const payload = context.payload;
            if (payload.nativeSaveTotal === undefined  payload.nativeSaveTotal === null  String(payload.nativeSaveTotal).trim() === '') {
                return { ok false, message 'Roll20 saving throw result was not captured yet.' };
            }

            const total = Utils.toNumber(payload.nativeSaveTotal, 0);
            const modifier = payload.nativeSaveModifier !== undefined && payload.nativeSaveModifier !== null
                 Utils.toInt(payload.nativeSaveModifier, 0)
                 0;
            const natural = payload.nativeSaveNatural !== undefined && payload.nativeSaveNatural !== null
                 Utils.toInt(payload.nativeSaveNatural, total - modifier)
                 total;
            const suppliedRolls = Array.isArray(payload.nativeSaveRolls)
                 payload.nativeSaveRolls.map((roll) = Utils.toInt(roll, null)).filter((roll) = roll !== null && roll !== undefined)
                 [natural];
            const save = {
                used true,
                ability this.normalizeAbilityName(payload.saveAbility  ''),
                dc context.challenge,
                raw String(payload.nativeSaveRollName  'Roll20'),
                modifier,
                natural,
                total,
                rolls suppliedRolls.length  suppliedRolls  [natural],
                mode this.normalizeRollMode(payload.nativeSaveMode  'normal'),
                rollModeReason String(payload.nativeSaveRollModeReason  '').trim(),
                native true,
                success total = context.challenge
            };
            return {
                ok true,
                save,
                noDamage save.success && !payload.halfOnSuccess,
                halfDamage save.success && !!payload.halfOnSuccess
            };
        },

        calculateDamageBreakdown(context, saveOutcome) {
            const payload = context.payload;
            const damageRolls = Array.isArray(payload.damageRolls) && payload.damageRolls.length
                 payload.damageRolls
                 [{ total payload.damageTotal  payload.amount  payload.damage  0, damageType payload.damageType  'normal' }];
            const traits = this.readStoreDamageTraits(context.characterId);
            const parts = damageRolls.map((roll) = {
                const source = roll  {};
                const baseDamage = Math.max(0, Utils.toInt(source.total  source.amount  source.damage, 0));
                const damageType = this.normalizeDamageType(source.damageType  payload.damageType  'normal');
                let adjustedBase = baseDamage;
                if (saveOutcome.noDamage) adjustedBase = 0;
                else if (saveOutcome.halfDamage) {
                    adjustedBase = RuntimeConfig.get('DAMAGE_ROUND_UP')
                         Math.ceil(adjustedBase  2)
                         Math.floor(adjustedBase  2);
                }
                return Object.assign(
                    { baseDamage, adjustedBase, damageType },
                    this.applyTraits(adjustedBase, damageType, traits)
                );
            });
            return {
                parts,
                totalDamage parts.reduce((sum, part) = sum + Math.max(0, Utils.toInt(part.finalDamage, 0)), 0)
            };
        },

        calculateDamageResourceChanges(context, totalDamage) {
            const previousHp = Math.max(0, Utils.toInt(context.hpBar.value, 0));
            const previousTemp = context.tempBar  Math.max(0, Utils.toInt(context.tempBar.value, 0))  0;
            const tempAbsorbed = context.tempBar  Math.min(previousTemp, Math.max(0, totalDamage))  0;
            const currentTemp = previousTemp - tempAbsorbed;
            const hpDamage = Math.max(0, totalDamage - tempAbsorbed);
            return {
                previousHp,
                currentHp Math.max(0, previousHp - hpDamage),
                previousTemp,
                currentTemp,
                tempAbsorbed,
                hpDamage
            };
        },

        async persistDamageResourceChanges(token, context, changes) {
            let hpWrite = { ok true, skipped true };
            let tempWrite = { ok true, skipped true };
            if (changes.currentHp !== changes.previousHp) {
                hpWrite = await this.setBarOrLinkedAttributeValue(token, context.hpBarNumber, 'hp', changes.currentHp);
                if (!hpWrite.ok) return hpWrite;
            }
            if (context.tempBar && changes.currentTemp !== changes.previousTemp) {
                tempWrite = await this.setBarOrLinkedAttributeValue(token, context.tempBarNumber, 'hp_temp', changes.currentTemp);
                if (!tempWrite.ok) {
                    const rollback = changes.currentHp !== changes.previousHp
                         await this.setBarOrLinkedAttributeValue(token, context.hpBarNumber, 'hp', changes.previousHp)
                         { ok true, skipped true };
                    if (!rollback.ok) {
                        Logger.error('[damage-rollback]', 'HP rollback failed after temp HP write failure', rollback.message  'unknown error');
                        return {
                            ok false,
                            message (tempWrite.message  'Temporary HP could not be updated.') +
                                ' HP rollback also failed; verify the token and sheet values manually.'
                        };
                    }
                    return tempWrite;
                }
            }
            return { ok true, hpWrite, tempWrite };
        },

        async applyDamageToTokenUnlocked(token, payload) {
            if (!token) return { ok false, message 'Target token was not found.' };
            const safePayload = payload  {};
            const character = R20.getCharacterFromToken(token);
            const hpBarNumber = this.getBarNumberForAttribute(token, 'hp', 'HP_BAR');
            const tempBarNumber = this.getBarNumberForAttribute(token, 'hp_temp', 'TEMP_HP_BAR');
            const hpBar = this.getBar(token, hpBarNumber);
            if (!hpBar.ok) return hpBar;
            const tempBar = tempBarNumber  0  this.getBar(token, tempBarNumber)  null;
            if (tempBar && !tempBar.ok) return tempBar;

            const context = {
                payload safePayload,
                tokenName this.getTokenName(token),
                tokenImgsrc String(token.get('imgsrc')  '').trim(),
                characterId character  String(character.id  '').trim()  '',
                hpBarNumber,
                tempBarNumber,
                hpBar,
                tempBar,
                hpLinked this.shouldWriteSheetAttributeForBar(token, hpBarNumber, 'hp'),
                mode String(safePayload.mode  'direct').toLowerCase(),
                challenge Math.max(0, Utils.toInt(safePayload.challenge, 0))
            };

            const attackGate = this.resolveAttackDamageGate(token, context);
            if (attackGate.complete) return attackGate.result;

            const saveOutcome = this.resolveDamageSaveOutcome(context);
            if (!saveOutcome.ok) return saveOutcome;

            const breakdown = this.calculateDamageBreakdown(context, saveOutcome);
            const changes = this.calculateDamageResourceChanges(context, breakdown.totalDamage);
            const writes = await this.persistDamageResourceChanges(token, context, changes);
            if (!writes.ok) return writes;

            let deathMarked = false;
            if (!context.hpLinked && changes.previousHp  0 && changes.currentHp = 0) {
                deathMarked = this.setTokenStatusMarker(token, 'dead', true);
            }

            const result = {
                ok true,
                tokenName context.tokenName,
                tokenImgsrc context.tokenImgsrc,
                sourceImgsrc safePayload.sourceImgsrc  '',
                sourceName safePayload.sourceName  '',
                sourceAction safePayload.sourceAction  '',
                critical context.mode === 'attack' &&
                    (Utils.toInt(safePayload.attackNatural, 0) === 20  Utils.toBoolean(safePayload.isCritical, false)),
                save saveOutcome.save,
                parts breakdown.parts,
                totalDamage breakdown.totalDamage,
                hpDamage changes.hpDamage,
                tempAbsorbed changes.tempAbsorbed,
                previousTemp changes.previousTemp,
                currentTemp changes.currentTemp,
                previousHp changes.previousHp,
                currentHp changes.currentHp,
                maxHp hpBar.max,
                fainted changes.previousHp  0 && changes.currentHp = 0,
                deathMarked,
                sheetWrite writes.hpWrite,
                tempSheetWrite writes.tempWrite,
                noDamage breakdown.totalDamage = 0
            };
            CombatEffects.playDamageReceived(token, result);
            this.queueConcentrationSaveForDamage(token, result);
            return result;
        },

        applyHealToToken(token, payload) {
            return this.runTokenMutation(token, () = this.applyHealToTokenUnlocked(token, payload));
        },

        async applyHealToTokenUnlocked(token, payload) {
            if (!token) return { ok false, message 'Target token was not found.' };
            payload = payload  {};
            const tokenName = this.getTokenName(token);
            const tokenImgsrc = String(token.get('imgsrc')  '').trim();
            const character = R20.getCharacterFromToken(token);
            const characterId = character  String(character.id  token.get('represents')  '').trim()  '';
            const mode = String(payload.mode  'hp').trim().toLowerCase() === 'temp'  'temp'  'hp';
            const amount = Math.max(0, Utils.toInt(payload.amount  payload.healing  payload.heal, 0));
            const sourceName = payload.sourceName  '';
            const sourceAction = payload.sourceAction  '';
            const sourceImgsrc = payload.sourceImgsrc  '';
            if (amount = 0) return { ok false, message 'Healing amount must be greater than 0.' };

            if (mode === 'temp') {
                const tempBarNumber = this.getBarNumberForAttribute(token, 'hp_temp', 'TEMP_HP_BAR');
                if (tempBarNumber = 0) return { ok false, message 'Temp HP bar is disabled. Set TEMP_HP_BAR to 1, 2, 3, or 4.' };
                const tempBar = this.getBar(token, tempBarNumber);
                if (!tempBar.ok) return tempBar;
                const previousTemp = Math.max(0, Utils.toInt(tempBar.value, 0));
                const currentTemp = Math.max(previousTemp, amount);
                const tempWrite = await this.setBarOrLinkedAttributeValue(token, tempBarNumber, 'hp_temp', currentTemp);
                if (!tempWrite.ok) return tempWrite;
                const effectiveAmount = Math.max(0, currentTemp - previousTemp);
                const result = { ok true, mode, tokenName, tokenImgsrc, amount, rolledAmount amount, effectiveAmount, previousTemp, currentTemp, sourceName, sourceAction, sourceImgsrc };
                CombatEffects.playHealingReceived(token, mode, effectiveAmount);
                return result;
            }

            const hpBarNumber = this.getBarNumberForAttribute(token, 'hp', 'HP_BAR');
            const hpBar = this.getBar(token, hpBarNumber);
            if (!hpBar.ok) return hpBar;
            const hpLinked = this.shouldWriteSheetAttributeForBar(token, hpBarNumber, 'hp');
            const previousHp = Math.max(0, Utils.toInt(hpBar.value, 0));
            const deathSaves = previousHp = 0 && hpLinked && characterId
                 this.getDeathSavesState(characterId)
                 { ok true, open false };
            if (hpLinked && previousHp = 0 && deathSaves.open) {
                return {
                    ok false,
                    message tokenName + ' has active death saving throws. Stabilize the character sheet before applying healing.'
                };
            }
            const maxHp = hpBar.max !== null && hpBar.max !== undefined && !Number.isNaN(Number(hpBar.max)) && Number(hpBar.max)  0  Number(hpBar.max)  null;
            const currentHp = maxHp  Math.min(maxHp, previousHp + amount)  (previousHp + amount);
            const hpWrite = await this.setBarOrLinkedAttributeValue(token, hpBarNumber, 'hp', currentHp);
            if (!hpWrite.ok) return hpWrite;
            const effectiveAmount = Math.max(0, currentHp - previousHp);
            const revived = previousHp = 0 && currentHp  0;
            if (revived  (!hpLinked && currentHp  0)) this.setTokenStatusMarker(token, 'dead', false);
            const result = { ok true, mode, tokenName, tokenImgsrc, amount, rolledAmount amount, effectiveAmount, overhealing Math.max(0, amount - effectiveAmount), previousHp, currentHp, maxHp, sourceName, sourceAction, sourceImgsrc, revived, deathSavesWereOpen !!deathSaves.open, sheetWrite hpLinked  { ok true, source 'setSheetItem' }  { ok true, skipped true } };
            CombatEffects.playHealingReceived(token, mode, effectiveAmount);
            return result;
        }
    };

     -----------------------------------------------------------------------
      Resources
      --------------------------------------------------------------------- 
    const ActionService = {
        normalizeSigned(value) {
            const n = Utils.toInt(value, 0);
            return (n = 0  '+'  '') + String(n);
        },

        parseSignedNumber(value, fallback) {
            const text = String(value === undefined  value === null  ''  value).trim();
            const match = text.match([+-]d+);
            return match  Utils.toInt(match[0], fallback === undefined  0  fallback)  (fallback === undefined  0  fallback);
        },

        parseJsonList(value) {
            if (Array.isArray(value)) return value.slice();
            const raw = String(value  '').trim();
            if (!raw) return [];
            try {
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed)  parsed  [];
            } catch (ignored) {
                return [];
            }
        },

        normalizeAbilityName(value) {
            const text = String(value  '').trim().toLowerCase();
            const aliases = {
                str 'strength', strength 'strength',
                dex 'dexterity', dexterity 'dexterity',
                con 'constitution', constitution 'constitution',
                int 'intelligence', intelligence 'intelligence',
                wis 'wisdom', wisdom 'wisdom',
                cha 'charisma', charisma 'charisma'
            };
            return aliases[text]  '';
        },

        abilityLabel(value) {
            const normalized = this.normalizeAbilityName(value);
            return normalized  normalized.slice(0, 3).toUpperCase()  '';
        },

        parseSaveInfoText(value) {
            const text = String(value === undefined  value === null  ''  value).trim();
            if (!text) return { saveDc 0, saveAbility '' };
            const dcMatch = text.match(bDCs(d+)bi)  text.match(b(d+)sDCbi);
            const abilityMatch = text.match(b(strengthdexterityconstitutionintelligencewisdomcharismastrdexconintwischa)bi);
            return {
                saveDc dcMatch  Math.max(0, Utils.toInt(dcMatch[1], 0))  0,
                saveAbility abilityMatch  this.normalizeAbilityName(abilityMatch[1])  ''
            };
        },

        structuredSaveInfo(record, relatedRecords) {
            const source = record && typeof record === 'object'  record  {};
            const related = Array.isArray(relatedRecords)  relatedRecords.filter(Boolean)  [];
            const nested = [source.save, source.savingThrow, source.saving_throw, source.savingThrowData, source.saveData]
                .filter((value) = value !== undefined && value !== null);
            let saveDc = 0;
            let saveAbility = '';
            const takeObject = (obj) = {
                if (!obj  typeof obj !== 'object') return;
                if (!saveDc) saveDc = Math.max(0, Utils.toInt(obj.dc !== undefined  obj.dc  (obj.saveDc !== undefined  obj.saveDc  obj.difficultyClass), 0));
                if (!saveAbility) saveAbility = this.normalizeAbilityName(obj.ability  obj.saveAbility  obj.attribute  obj.stat  '');
            };
            if (!saveDc) saveDc = Math.max(0, Utils.toInt(source.saveDc !== undefined  source.saveDc  (source.save_dc !== undefined  source.save_dc  source.dc), 0));
            saveAbility = this.normalizeAbilityName(source.saveAbility  source.save_ability  source.saveattr  source.saveAttribute  '');
            nested.forEach((entry) = {
                if (typeof entry === 'object') takeObject(entry);
                else {
                    const parsed = this.parseSaveInfoText(entry);
                    if (!saveDc) saveDc = parsed.saveDc;
                    if (!saveAbility) saveAbility = parsed.saveAbility;
                }
            });
            if ((!saveDc  !saveAbility) && source.description) {
                const parsed = this.parseSaveInfoText(source.description);
                if (!saveDc) saveDc = parsed.saveDc;
                if (!saveAbility) saveAbility = parsed.saveAbility;
            }
            related.forEach((entry) = {
                if (!entry  typeof entry !== 'object') return;
                const relatedNested = [entry.save, entry.savingThrow, entry.saving_throw, entry.savingThrowData, entry.saveData]
                    .filter((value) = value !== undefined && value !== null);
                relatedNested.forEach((value) = {
                    if (typeof value === 'object') takeObject(value);
                    else {
                        const parsed = this.parseSaveInfoText(value);
                        if (!saveDc) saveDc = parsed.saveDc;
                        if (!saveAbility) saveAbility = parsed.saveAbility;
                    }
                });
                const relatedText = [entry.type, entry.recordName, entry.name, entry.label]
                    .map((value) = String(value  ''))
                    .join(' ')
                    .toLowerCase();
                if (!(savesaving).test(relatedText)) return;
                takeObject(entry);
                if ((!saveDc  !saveAbility) && entry.description) {
                    const parsed = this.parseSaveInfoText(entry.description);
                    if (!saveDc) saveDc = parsed.saveDc;
                    if (!saveAbility) saveAbility = parsed.saveAbility;
                }
            });
            return { saveDc, saveAbility };
        },

        legacyRowSaveInfo(row) {
            const source = row  {};
            const rawSaveAbility = String(source.saveattr  source.saveability  source.save_ability  source.savetype  source.spellsave  source.save  '').trim();
            const saveDc = Math.max(0, Utils.toInt(source.savedc  source.save_dc  source.spelldc  source.spell_dc  source.dc, 0));
            let saveAbility = this.normalizeAbilityName(rawSaveAbility);
            if (!saveAbility && rawSaveAbility) saveAbility = this.legacyAttrAbility(rawSaveAbility)  this.parseSaveInfoText(rawSaveAbility).saveAbility;
            if ((!saveDc  !saveAbility) && (source.description  source.atk_desc  source.spelldescription  source.spelldesc)) {
                const parsed = this.parseSaveInfoText(source.description  source.atk_desc  source.spelldescription  source.spelldesc);
                saveAbility = saveAbility  parsed.saveAbility;
                return { saveDc saveDc  parsed.saveDc, saveAbility };
            }
            return { saveDc, saveAbility };
        },

        async readSheetNumber(characterId, names, fallback) {
            const safeCharacterId = String(characterId  '').trim();
            const candidates = Array.isArray(names)  names  [names];
            if (typeof getSheetItem === 'function') {
                for (let i = 0; i  candidates.length; i += 1) {
                    const name = String(candidates[i]  '').trim();
                    if (!name) continue;
                    try {
                        const value = await getSheetItem(safeCharacterId, name, 'current');
                        const number = this.parseSignedNumber(value, null);
                        if (number !== null) return number;
                    } catch (ignored) {}
                }
            }
            if (typeof getAttrByName === 'function') {
                for (let i = 0; i  candidates.length; i += 1) {
                    const name = String(candidates[i]  '').trim();
                    if (!name) continue;
                    try {
                        const value = getAttrByName(safeCharacterId, name);
                        const number = this.parseSignedNumber(value, null);
                        if (number !== null) return number;
                    } catch (ignored) {}
                }
            }
            return fallback === undefined  0  fallback;
        },

        async readAbilityMod(characterId, ability) {
            const normalized = this.normalizeAbilityName(ability);
            if (!normalized) return 0;
            return this.readSheetNumber(characterId, [normalized + '_mod', normalized + '_modifier'], 0);
        },

        diagnosticCandidateNamesForAbility(ability) {
            const normalized = this.normalizeAbilityName(ability);
            if (!normalized) return { score [], modifier [], all [] };
            const short = this.abilityLabel(normalized).toLowerCase();
            const score = [normalized, short];
            const modifier = [normalized + '_mod', normalized + '_modifier', short + '_mod', short + '_modifier'];
            return { score, modifier, all score.concat(modifier) };
        },

        diagnosticRawAttributeCandidates(attrs, names) {
            const wanted = Object.create(null);
            (Array.isArray(names)  names  []).forEach((name) = { wanted[String(name  '').toLowerCase()] = true; });
            const out = Object.create(null);
            (Array.isArray(attrs)  attrs  []).forEach((attr) = {
                if (!attr  !Utils.isFunction(attr.get)) return;
                const name = String(attr.get('name')  '').trim();
                if (!name  !wanted[name.toLowerCase()]) return;
                out[name] = attr.get('current');
            });
            (Array.isArray(names)  names  []).forEach((name) = {
                const safe = String(name  '').trim();
                if (safe && !Object.prototype.hasOwnProperty.call(out, safe)) out[safe] = '(missing)';
            });
            return out;
        },

        diagnosticGetAttrByNameCandidates(characterId, names) {
            const out = Object.create(null);
            (Array.isArray(names)  names  []).forEach((name) = {
                const safe = String(name  '').trim();
                if (!safe) return;
                if (typeof getAttrByName !== 'function') {
                    out[safe] = '(unavailable)';
                    return;
                }
                try {
                    const value = getAttrByName(String(characterId  '').trim(), safe);
                    out[safe] = value === undefined  '(undefined)'  value;
                } catch (error) {
                    out[safe] = '(error ' + String(error && error.message  error  'unknown') + ')';
                }
            });
            return out;
        },

        async diagnosticGetSheetItemCandidates(characterId, names) {
            const safeCharacterId = String(characterId  '').trim();
            const list = (Array.isArray(names)  names  []).map((name) = String(name  '').trim()).filter(Boolean);
            if (typeof getSheetItem !== 'function') {
                const unavailable = Object.create(null);
                list.forEach((name) = { unavailable[name] = '(unavailable)'; });
                return { values unavailable, reads 0 };
            }
            const pairs = await Promise.all(list.map(async (name) = {
                try {
                    const value = await getSheetItem(safeCharacterId, name, 'current');
                    return [name, value === undefined  '(undefined)'  value];
                } catch (error) {
                    return [name, '(error ' + String(error && error.message  error  'unknown') + ')'];
                }
            }));
            const values = Object.create(null);
            pairs.forEach((pair) = { values[pair[0]] = pair[1]; });
            return { values, reads list.length };
        },

        diagnosticFirstNumber(values, names) {
            const source = values && typeof values === 'object'  values  {};
            const list = Array.isArray(names)  names  [];
            for (let i = 0; i  list.length; i += 1) {
                const key = String(list[i]  '').trim();
                if (!key  !Object.prototype.hasOwnProperty.call(source, key)) continue;
                const number = this.parseSignedNumber(source[key], null);
                if (number !== null) return number;
            }
            return null;
        },

        diagnosticAbilityDerived(values, candidates) {
            const score = this.diagnosticFirstNumber(values, candidates && candidates.score);
            const directModifier = this.diagnosticFirstNumber(values, candidates && candidates.modifier);
            const modifierFromScore = score === null  null  Math.floor((score - 10)  2);
            return { score, directModifier, modifierFromScore };
        },

        async collectBeaconLiveAbilityDiagnostics(characterId, attrs, attacks, root) {
            const started = Date.now();
            const context = this.beaconCombatContext(root  {});
            const abilities = [];
            (Array.isArray(attacks)  attacks  []).forEach((attack) = {
                const ability = this.normalizeAbilityName(attack && attack.ability);
                if (ability && abilities.indexOf(ability)  0) abilities.push(ability);
            });
            const requests = abilities.map(async (ability) = {
                const candidates = this.diagnosticCandidateNamesForAbility(ability);
                const rawAttributes = this.diagnosticRawAttributeCandidates(attrs, candidates.all);
                const attrByName = this.diagnosticGetAttrByNameCandidates(characterId, candidates.all);
                const sheetItems = await this.diagnosticGetSheetItemCandidates(characterId, candidates.all);
                const storeAbility = context.abilities && context.abilities[ability]  context.abilities[ability]  { score null, modifier null };
                return {
                    ability,
                    reads sheetItems.reads,
                    data {
                        store { score storeAbility.score, modifier storeAbility.modifier },
                        rawAttributeCandidates rawAttributes,
                        rawAttributeDerived this.diagnosticAbilityDerived(rawAttributes, candidates),
                        getAttrByNameCandidates attrByName,
                        getAttrByNameDerived this.diagnosticAbilityDerived(attrByName, candidates),
                        getSheetItemCandidates sheetItems.values,
                        getSheetItemDerived this.diagnosticAbilityDerived(sheetItems.values, candidates)
                    }
                };
            });
            const results = await Promise.all(requests);
            const proficiencyNames = ['pb', 'proficiency_bonus', 'proficiencyBonus'];
            const rawPb = this.diagnosticRawAttributeCandidates(attrs, proficiencyNames);
            const attrPb = this.diagnosticGetAttrByNameCandidates(characterId, proficiencyNames);
            const sheetPb = await this.diagnosticGetSheetItemCandidates(characterId, proficiencyNames);
            const out = { abilities Object.create(null), proficiency {
                store context.proficiency  { value 0, source 'unknown' },
                rawAttributeCandidates rawPb,
                getAttrByNameCandidates attrPb,
                getSheetItemCandidates sheetPb.values
            }, sheetApiReads sheetPb.reads, readMs 0 };
            results.forEach((entry) = {
                out.abilities[entry.ability] = entry.data;
                out.sheetApiReads += entry.reads;
            });
            out.readMs = Date.now() - started;
            return out;
        },

        getActionToken(tokenId, ctx, options) {
            const opts = options  {};
            const safeTokenId = String(tokenId  '').trim();
            if (!safeTokenId) return { ok false, message 'The action token was not specified.' };
            const token = R20.getTokenById(safeTokenId);
            if (!token) return { ok false, message 'The action token was not found.' };
            const character = R20.getCharacterFromToken(token);
            if (!character && opts.requireCharacter !== false) return { ok false, message 'This token is not linked to a character sheet.' };
             Turn Action buttons are allowed at any time. Players still need to
             control the referenced tokencharacter; the GM is unrestricted.
            if (ctx && !ctx.isGM && !R20.tokenIsControlledByPlayer(token, character, ctx.playerId)) {
                return { ok false, message 'You do not control this token.' };
            }
            const characterId = character  String(character.id  (Utils.isFunction(character.get)  character.get('_id')  '')  '').trim()  '';
            const characterName = character && Utils.isFunction(character.get)
                 String(character.get('name')  '').trim()
                 '';
            return {
                ok true,
                token,
                tokenId safeTokenId,
                character,
                characterId,
                characterName characterName  CombatService.getTokenName(token)
            };
        },

        getCurrentTurnActionToken(ctx) {
            if (!TurnTracker.isEnabled()) return { ok false, message 'Turn Tracker is disabled.' };
            const current = TurnTracker.tokenEntries(TurnTracker.getCurrentTurnOrder())[0]  null;
            const currentId = String(current && current.id  '').trim();
            if (!current  !currentId) return { ok false, message 'There is no current turn.' };
            const token = R20.getTokenById(currentId);
            if (!token) return { ok false, message 'The current turn token was not found.' };
            const character = R20.getCharacterFromToken(token);
            if (ctx && !ctx.isGM && !R20.tokenIsControlledByPlayer(token, character, ctx.playerId)) {
                return { ok false, message 'It is not your turn.' };
            }
            const characterId = character  String(character.id  (Utils.isFunction(character.get)  character.get('_id')  '')  '').trim()  '';
            const characterName = character && Utils.isFunction(character.get)
                 String(character.get('name')  '').trim()
                 '';
            return {
                ok true,
                entry current,
                token,
                tokenId currentId,
                character,
                characterId,
                characterName characterName  CombatService.getTokenName(token)
            };
        },

        narrativeAction(ctx, action, tokenId) {
             Dash  Disengage  Dodge are generic current-turn commands now. The
             tokenId remains in old rendered buttons only for backward compatibility.
            const info = this.getCurrentTurnActionToken(ctx);
            if (!info.ok) {
                Render.sendWhisperMessage(ctx && ctx.who  'GM', 'Turn Action', info.message, 'warning');
                return false;
            }
            const normalized = String(action  '').trim().toLowerCase();
            const labels = { dash 'Dash', disengage 'Disengage', dodge 'Dodge' };
            if (!labels[normalized]) {
                Render.sendWhisperMessage(ctx && ctx.who  'GM', 'Turn Action', 'Unknown turn action.', 'warning');
                return false;
            }
            const revealNames = RuntimeConfig.get('REVEAL_TOKEN_NAMES_IN_LOG');
            const displayName = revealNames  info.characterName  'Character';
            const nameHtml = 'strong style=color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';' + Utils.escapeHtml(displayName) + 'strong';
            Render.sendPublicMessage(
                'Turn Action',
                nameHtml + ' takes the strong' + labels[normalized] + 'strong action.',
                'normal',
                { titleHtml Render.turnActionTitleHtml(info.token, info.character) }
            );
            if (normalized === 'dash' && TurnTracker.isMovementEnabled()) {
                const result = TurnTracker.applyDashToCurrentTurn(info.tokenId);
                if (result && result.ok) TurnTracker.sendTurnCard(info.entry);
            }
            return true;
        },

        getLegacyAttackRows(characterId, sourceAttrs) {
            const safeCharacterId = String(characterId  '').trim();
            const attrs = Array.isArray(sourceAttrs)
                 sourceAttrs
                 (findObjs({ _type 'attribute', _characterid safeCharacterId })  []);
            const rows = Object.create(null);
            attrs.forEach((attr) = {
                if (!attr  !Utils.isFunction(attr.get)) return;
                const name = String(attr.get('name')  '');
                const match = name.match(^repeating_attack_([^_]+)_(.+)$i);
                if (!match) return;
                const rowId = match[1];
                const key = String(match[2]  '').toLowerCase();
                rows[rowId] = rows[rowId]  { rowId };
                rows[rowId][key] = attr.get('current');
            });
            return Object.keys(rows).map((id) = rows[id]);
        },

        getLegacyNpcActionRows(characterId, sourceAttrs) {
            const safeCharacterId = String(characterId  '').trim();
            const attrs = Array.isArray(sourceAttrs)
                 sourceAttrs
                 (findObjs({ _type 'attribute', _characterid safeCharacterId })  []);
            const rows = Object.create(null);
            attrs.forEach((attr) = {
                if (!attr  !Utils.isFunction(attr.get)) return;
                const name = String(attr.get('name')  '');
                const match = name.match(^repeating_npcaction_([^_]+)_(.+)$i);
                if (!match) return;
                const rowId = match[1];
                const key = String(match[2]  '').toLowerCase();
                rows[rowId] = rows[rowId]  { rowId };
                rows[rowId][key] = attr.get('current');
            });
            return Object.keys(rows).map((id) = rows[id]);
        },

        legacyNpcActionIsAttack(row) {
            const name = String(row && row.name  '').trim();
            if (!name) return false;
            const attackFlag = String(row && row.attack_flag  '').trim().toLowerCase();
            const displayFlag = String(row && row.attack_display_flag  '');
            const attackOptions = String(row && row.attack_options  '');
            const toHit = String(row && row.attack_tohit  '').trim();
            return attackFlag === 'on'  attack=1i.test(displayFlag)  attack=1i.test(attackOptions)  !!toHit;
        },

        legacyNpcDamageSummaries(row) {
            const out = [];
            const add = (formulaKey, typeKey) = {
                const rawFormula = String(row && row[formulaKey]  '').trim();
                const damageType = String(row && row[typeKey]  '').trim();
                if (!rawFormula && !damageType) return;
                const formula = rawFormula.replace(s+g, '');
                out.push({
                    formula formula  '-',
                    damageType damageType  'Damage',
                    ability '',
                    abilityLabel '',
                    abilityModifier 0,
                    flatBonus 0
                });
            };
            add('attack_damage', 'attack_damagetype');
            add('attack_damage2', 'attack_damagetype2');
            return out;
        },

        getLegacyNpcAttackSummaries(characterId, sourceAttrs) {
            const attrs = Array.isArray(sourceAttrs)
                 sourceAttrs
                 (findObjs({ _type 'attribute', _characterid String(characterId  '').trim() })  []);
            return this.getLegacyNpcActionRows(characterId, attrs)
                .filter((row) = this.legacyNpcActionIsAttack(row))
                .map((row) = {
                    const rowId = String(row && row.rowId  '').trim();
                    const attackBonus = this.parseSignedNumber(row && row.attack_tohit, 0);
                    const attackType = String(row && row.attack_type  '').trim();
                    const range = String(row && row.attack_range  '').trim();
                    return {
                        id rowId,
                        name String(row && row.name  '').trim(),
                        sheetVersion '2014 NPC',
                        ability '',
                        abilityLabel '',
                        abilityModifier 0,
                        proficiencyBonus 0,
                        extraBonus 0,
                        attackType attackType  'Attack',
                        attackTypeLabel this.attackTypeLabel(attackType, range),
                        range,
                        rangeLabel this.combatRangeLabel(range),
                        description String(row && row.description  '').trim(),
                        saveDc this.legacyRowSaveInfo(row).saveDc,
                        saveAbility this.legacyRowSaveInfo(row).saveAbility,
                        attackBonus,
                        attackBonusLabel this.normalizeSigned(attackBonus),
                        attackBreakdown this.normalizeSigned(attackBonus) + ' (NPC sheet)',
                        damage this.legacyNpcDamageSummaries(row),
                        rollCommand rowId  R20.buttonAbilityCommand(characterId, 'repeating_npcaction_' + rowId + '_npc_action')  '',
                        damageCommand rowId  R20.buttonAbilityCommand(characterId, 'repeating_npcaction_' + rowId + '_npc_dmg')  ''
                    };
                });
        },

        legacyAttrAbility(value) {
            const raw = String(value  '').toLowerCase();
            const match = raw.match(@{(strengthdexterityconstitutionintelligencewisdomcharisma)_mod}i);
            return match  String(match[1]).toLowerCase()  '';
        },

        async buildLegacyAttack(characterId, row) {
            const name = String(row && row.atkname  '').trim();
            const rowId = String(row && row.rowId  '').trim();
            if (!name  !rowId) return null;
            const spellLevel = String(row.spelllevel  '').trim();
            const spellInnate = String(row.spell_innate  '').trim();
            if (spellLevel  spellInnate) return null;
            if (String(row.atkflag  '').trim() && String(row.atkflag).indexOf('attack=1')  0) return null;

            const ability = this.legacyAttrAbility(row.atkattr_base);
            const abilityMod = ability  await this.readAbilityMod(characterId, ability)  0;
            const profEnabled = pbi.test(String(row.atkprofflag  ''));
            const pb = profEnabled  await this.readSheetNumber(characterId, 'pb', 0)  0;
            const extra = this.parseSignedNumber(row.atkmod, 0) + this.parseSignedNumber(row.atkmagic, 0);
            const finalFromSheet = this.parseSignedNumber(row.atkbonus, null);
            const computed = abilityMod + pb + extra;
            const attackBonus = finalFromSheet !== null  finalFromSheet  computed;
            const breakdownParts = [];
            if (ability) breakdownParts.push(this.normalizeSigned(abilityMod) + ' ' + this.abilityLabel(ability));
            if (profEnabled) breakdownParts.push(this.normalizeSigned(pb) + ' PB');
            if (extra) breakdownParts.push(this.normalizeSigned(extra) + ' Bonus');

            const damageAbility = this.legacyAttrAbility(row.dmgattr);
            const damageAbilityMod = damageAbility  await this.readAbilityMod(characterId, damageAbility)  0;
            const damageMod = this.parseSignedNumber(row.dmgmod, 0);
            const damageBase = String(row.dmgbase  '').trim();
            const damageFormula = damageBase  (damageBase + (damageAbilityMod  damageMod  this.normalizeSigned(damageAbilityMod + damageMod)  ''))  '';
            const damage = damageFormula  [{ formula damageFormula, damageType String(row.dmgtype  'Damage').trim()  'Damage' }]  [];
            return {
                id rowId,
                name,
                sheetVersion '2014',
                attackType 'Attack',
                range String(row.atkrange  '').trim(),
                attackBonus,
                attackBonusLabel this.normalizeSigned(attackBonus),
                attackBreakdown this.normalizeSigned(attackBonus) + (breakdownParts.length  (' (' + breakdownParts.join(' ') + ')')  ''),
                damage,
                rollCommand '%{' + characterId + 'repeating_attack_' + rowId + '_attack}',
                damageCommand R20.buttonAbilityCommand(characterId, 'repeating_attack_' + rowId + '_attack_dmg')
            };
        },

        async getLegacyAttacks(characterId) {
            const attacks = [];
            const rows = this.getLegacyAttackRows(characterId);
            for (let i = 0; i  rows.length; i += 1) {
                const attack = await this.buildLegacyAttack(characterId, rows[i]);
                if (attack) attacks.push(attack);
            }
            return attacks.concat(this.getLegacyNpcAttackSummaries(characterId));
        },

        getBeaconStore(characterId) {
            const roots = R20.getCharacterStoreDumpRoots(characterId);
            return roots.length  roots[0]  null;
        },

        beaconIntegrants(root) {
            return root && root.integrants && root.integrants.integrants && typeof root.integrants.integrants === 'object'
                 root.integrants.integrants
                 {};
        },

        beaconFlatFormulaValue(record) {
            const formula = record && record.valueFormula;
            if (formula && typeof formula === 'object' && formula.flatValue !== undefined) {
                return this.parseSignedNumber(formula.flatValue, 0);
            }
            if (formula !== undefined && formula !== null && typeof formula !== 'object') {
                return this.parseSignedNumber(formula, 0);
            }
            if (record && record.flatValue !== undefined) return this.parseSignedNumber(record.flatValue, 0);
            return 0;
        },

        beaconAbilityContext(integrants) {
            const groups = Object.create(null);
            Object.keys(integrants  {}).forEach((key) = {
                const record = integrants[key];
                if (!record  record.type !== 'Ability Score'  record._enabled === false  record.parentDisabled === true) return;
                const parentId = String(record.parentID  '').trim();
                const parent = parentId  integrants[parentId]  null;
                if (parent && (parent._enabled === false  parent.parentDisabled === true)) return;
                if (parent && parent.equipData && parent.equipData.equippable === true && parent.equipData.equipped !== true) return;
                const ability = this.normalizeAbilityName(record.ability);
                if (!ability) return;
                groups[ability] = groups[ability]  [];
                groups[ability].push({
                    calculation String(record.calculation  '').trim().toLowerCase(),
                    value this.beaconFlatFormulaValue(record),
                    createdTime Utils.toNumber(record.createdTime, 0)
                });
            });
            const out = Object.create(null);
            Object.keys(groups).forEach((ability) = {
                const entries = groups[ability].slice().sort((a, b) = a.createdTime - b.createdTime);
                let base = 10;
                let hasBase = false;
                let modifiers = 0;
                const setValues = [];
                entries.forEach((entry) = {
                    if (setsbase^set$.test(entry.calculation)) {
                        base = entry.value;
                        hasBase = true;
                    } else if (setsvalueoverride.test(entry.calculation)) {
                        setValues.push(entry.value);
                    } else if (modifybonusadd.test(entry.calculation)) {
                        modifiers += entry.value;
                    }
                });
                const calculated = (hasBase  base  10) + modifiers;
                 Ability-score Set Value effects (for example a magic item that sets
                 Strength to 21) are final score floors in the Beacon sheet. Choosing
                 the highest active value matches D&D's score becomes X item behavior
                 without needing slow Sheet API reads for ordinary Combat menus.
                const score = setValues.length  Math.max.apply(null, [calculated].concat(setValues))  calculated;
                out[ability] = {
                    score,
                    modifier Math.floor((score - 10)  2)
                };
            });
            return out;
        },

        beaconCharacterLevel(integrants) {
            const byClass = Object.create(null);
            Object.keys(integrants  {}).forEach((key) = {
                const record = integrants[key];
                if (!record  record.type !== 'Class Level'  record._enabled === false  record.parentDisabled === true) return;
                const classId = String(record.classID  record.sourceID  record.name  '').trim();
                const level = Math.max(0, Utils.toInt(record.level, 0));
                if (!classId  level = 0) return;
                byClass[classId] = Math.max(byClass[classId]  0, level);
            });
            return Object.keys(byClass).reduce((sum, key) = sum + Math.max(0, Utils.toInt(byClass[key], 0)), 0);
        },

        parseChallengeRating(value) {
            const text = String(value === undefined  value === null  ''  value).trim();
            if (!text) return null;
            const fraction = text.match(^(d+)ss(d+)$);
            if (fraction) {
                const denominator = Utils.toNumber(fraction[2], 0);
                return denominator  Utils.toNumber(fraction[1], 0)  denominator  null;
            }
            const numeric = Number(text);
            return Number.isFinite(numeric)  numeric  null;
        },

        proficiencyBonusFromLevel(level) {
            const safeLevel = Math.max(0, Utils.toInt(level, 0));
            if (!safeLevel) return 0;
            return Math.min(6, 2 + Math.floor((safeLevel - 1)  4));
        },

        proficiencyBonusFromCr(cr) {
            const value = Utils.toNumber(cr, -1);
            if (value  0) return 0;
            if (value = 4) return 2;
            if (value = 8) return 3;
            if (value = 12) return 4;
            if (value = 16) return 5;
            if (value = 20) return 6;
            if (value = 24) return 7;
            if (value = 28) return 8;
            return 9;
        },

        beaconProficiencyBonus(root, integrants) {
            const level = this.beaconCharacterLevel(integrants);
            if (level  0) return { value this.proficiencyBonusFromLevel(level), source 'level', level };
            const cr = this.parseChallengeRating(root && root.npc && root.npc.challengeRating);
            if (cr !== null) return { value this.proficiencyBonusFromCr(cr), source 'cr', cr };
            return { value 0, source 'unknown' };
        },

        proficiencyMultiplier(value) {
            const text = String(value  '').trim().toLowerCase();
            if (!text  notsproficientuntrainednone.test(text)) return 0;
            if (expertdouble.test(text)) return 2;
            if (half.test(text)) return 0.5;
            if (proficient.test(text)) return 1;
            return 0;
        },

        normalizeWeaponProficiencyName(value) {
            return String(value  '').trim().toLowerCase().replace([^a-z0-9]+g, ' ').replace(s+g, ' ').trim();
        },

        beaconWeaponProficiencyMultiplier(record, parent, integrants) {
            const explicit = String(record && record.attack && record.attack.proficiencyLevel  '').trim();
            if (explicit) return this.proficiencyMultiplier(explicit);
            const weaponType = this.normalizeWeaponProficiencyName(parent && parent.weaponData && parent.weaponData.type);
            const training = this.normalizeWeaponProficiencyName(parent && parent.weaponData && parent.weaponData.training);
            if (!weaponType && !training) return 0;
            let best = 0;
            Object.keys(integrants  {}).forEach((key) = {
                const prof = integrants[key];
                if (!prof  prof.type !== 'Proficiency'  prof._enabled === false  prof.parentDisabled === true) return;
                if (!weaponi.test(String(prof.category  ''))) return;
                const name = this.normalizeWeaponProficiencyName(prof.proficiency  prof.name);
                if (!name) return;
                const exactWeapon = weaponType && name === weaponType;
                const allWeapons = ^(all )weapons$.test(name);
                const categoryMatch = training && (name === training  name === training + ' weapon'  name === training + ' weapons');
                if (!exactWeapon && !allWeapons && !categoryMatch) return;
                best = Math.max(best, this.proficiencyMultiplier(prof.proficiencyLevel  'Proficient'));
            });
            return best;
        },

        beaconCombatContext(root) {
            const integrants = this.beaconIntegrants(root);
            const abilities = this.beaconAbilityContext(integrants);
            const proficiency = this.beaconProficiencyBonus(root, integrants);
            return { integrants, abilities, proficiency };
        },

        beaconDamageSummaries(record, context, attackAbility) {
            const integrants = context && context.integrants  {};
            const abilities = context && context.abilities  {};
            const childIds = this.parseJsonList(record && record.childIDs);
            return childIds.map((id) = integrants[id]).filter((entry) = entry && entry.type === 'Damage' && entry._enabled !== false)
                .map((damage) = {
                    const diceSize = String(damage.diceSize  '').trim();
                    const diceCountRaw = damage._diceCount !== undefined  damage._diceCount  damage.diceCount;
                    const diceCount = diceSize  Math.max(1, Utils.toInt(diceCountRaw, 1))  0;
                    const abilitySetting = String(damage.ability  '').trim().toLowerCase();
                    const damageAbility = abilitySetting === 'auto'
                         attackAbility
                         (abilitySetting === 'none'  ''  this.normalizeAbilityName(abilitySetting));
                    const abilityMod = damageAbility && abilities[damageAbility]  Utils.toInt(abilities[damageAbility].modifier, 0)  0;
                    const rawFlatBonus = damage._bonus !== undefined  damage._bonus  damage.bonus;
                    const flatBonus = this.parseSignedNumber(rawFlatBonus, 0);
                    const hasFlatComponent = rawFlatBonus !== undefined && rawFlatBonus !== null && String(rawFlatBonus).trim() !== '';
                    const hasAbilityComponent = !!damageAbility;
                    const totalFlat = abilityMod + flatBonus;
                    let formula = diceSize && diceCount  (String(diceCount) + diceSize)  '';
                    if (formula && totalFlat) formula += this.normalizeSigned(totalFlat);
                    else if (!formula && (hasFlatComponent  hasAbilityComponent)) formula = String(totalFlat);
                    return {
                        formula formula  '-',
                        damageType String(damage.damageType  'Damage').trim()  'Damage',
                        ability damageAbility,
                        abilityLabel this.abilityLabel(damageAbility),
                        abilityModifier abilityMod,
                        flatBonus
                    };
                });
        },

        beaconSaveFormula(record) {
            const source = record && typeof record === 'object'  record  {};
            const save = source.save && typeof source.save === 'object'  source.save  {};
            const candidates = [
                save.saveFormula,
                save.saveFlat,
                save.formula,
                source.saveFormula,
                source.saveFlat
            ];
            for (let i = 0; i  candidates.length; i += 1) {
                if (candidates[i] && typeof candidates[i] === 'object') return candidates[i];
            }
            return null;
        },

        beaconCalculatedSaveDc(record, context, saveInfo) {
            const direct = Math.max(0, Utils.toInt(saveInfo && saveInfo.saveDc, 0));
            const formula = this.beaconSaveFormula(record);
             Structured formulas are authoritative when present. This matters for
             records such as Oil, whose description contains the base text DC 8
             while the actual DC is 8 + ability modifier + proficiency bonus.
            if (!formula) return direct;
            let dc = this.parseSignedNumber(formula.flatValue, 0);
            const abilitySpec = formula.ability && typeof formula.ability === 'object'  formula.ability  null;
            const ability = this.normalizeAbilityName(
                abilitySpec && abilitySpec.ability  saveInfo && saveInfo.saveAbility  ''
            );
            if (abilitySpec && Utils.toBoolean(abilitySpec.add, false) && ability) {
                const abilityData = context && context.abilities && context.abilities[ability];
                dc += abilityData  Utils.toInt(abilityData.modifier, 0)  0;
            }
            const proficiencySpec = formula.proficiency && typeof formula.proficiency === 'object'  formula.proficiency  null;
            if (proficiencySpec && Utils.toBoolean(proficiencySpec.add, false)) {
                dc += Math.max(0, Utils.toInt(context && context.proficiency && context.proficiency.value, 0));
            }
            return Math.max(0, dc);
        },

        beaconLinkedSpellcastingProfile(record, context) {
            const source = record && typeof record === 'object'  record  {};
            const integrants = context && context.integrants  {};
            const abilities = context && context.abilities  {};
            let relations = source.relations;
            if (typeof relations === 'string') {
                try { relations = JSON.parse(relations); } catch (ignored) { relations = null; }
            }
            if (!relations  typeof relations !== 'object'  Array.isArray(relations)) return null;
            const linkedId = Object.keys(relations).find((id) = {
                const linked = integrants[id];
                return linked && String(linked.type  '').trim().toLowerCase() === 'spellcasting' && linked._enabled !== false && linked.parentDisabled !== true;
            });
            if (!linkedId) return null;
            const linked = integrants[linkedId];
            const ability = this.normalizeAbilityName(linked.ability  linked.spellcastingAbility  '');
            if (!ability) return null;
            const abilityData = abilities[ability]  null;
            const abilityModifier = abilityData  Utils.toInt(abilityData.modifier, 0)  0;
            const proficiencyBonus = Math.max(0, Utils.toInt(context && context.proficiency && context.proficiency.value, 0));
            return {
                integrantKey linkedId,
                ability,
                abilityLabel this.abilityLabel(ability),
                abilityModifier,
                proficiencyBonus,
                spellAttackBonus abilityModifier + proficiencyBonus,
                spellSaveDc 8 + abilityModifier + proficiencyBonus
            };
        },

        buildBeaconAttackSummary(characterId, record, context) {
            const integrants = context && context.integrants  {};
            const abilities = context && context.abilities  {};
            const parentKey = String(record && (record.parentID  record.sourceID)  '').trim();
            const parent = parentKey  (integrants[parentKey]  null)  null;
            const relatedSaveRecords = this.parseJsonList(record && record.childIDs).map((id) = integrants[id]).filter(Boolean);
            const saveInfo = this.structuredSaveInfo(record, relatedSaveRecords);
            const attackType = String(record && record.attack && record.attack.type  'Attack').trim();
            const isSaveAttack = savei.test(attackType) && !!saveInfo.saveAbility;
            const linkedSpellcasting = this.beaconLinkedSpellcastingProfile(record, context);
             For a save attack linked to Spellcasting, the save ability belongs to
             the target. Use the linked spellcasting abilityDC for the source instead.
            const ability = this.beaconAttackAbility(record)  (linkedSpellcasting  linkedSpellcasting.ability  saveInfo.saveAbility);
            const abilityMod = ability && abilities[ability]  Utils.toInt(abilities[ability].modifier, 0)  0;
            const proficiencyBase = Math.max(0, Utils.toInt(context && context.proficiency && context.proficiency.value, 0));
            const proficiencyMultiplier = linkedSpellcasting  1  this.beaconWeaponProficiencyMultiplier(record, parent, integrants);
            const proficiencyBonus = linkedSpellcasting  linkedSpellcasting.proficiencyBonus  Math.floor(proficiencyBase  proficiencyMultiplier);
            const extraBonus = this.parseSignedNumber(record && record.attack && record.attack.bonus, 0);
            const attackBonus = abilityMod + proficiencyBonus + extraBonus;
            const parts = [];
            if (ability) parts.push(this.normalizeSigned(abilityMod) + ' ' + this.abilityLabel(ability));
            if (proficiencyBonus) parts.push(this.normalizeSigned(proficiencyBonus) + ' PB');
            if (extraBonus) parts.push(this.normalizeSigned(extraBonus) + ' Bonus');
            const shortID = String(record && record.shortID  '').trim();
            const range = this.beaconAttackRangeRaw(record, parent);
            let saveDc = this.beaconCalculatedSaveDc(record, context, saveInfo);
            if (!saveDc && isSaveAttack && linkedSpellcasting) saveDc = linkedSpellcasting.spellSaveDc;
            return {
                id shortID,
                name String(record && (record.name  record.recordName)  'Attack').trim()  'Attack',
                sheetVersion '2024',
                ability,
                abilityLabel this.abilityLabel(ability),
                abilityModifier abilityMod,
                proficiencyBonus,
                proficiencyMultiplier,
                extraBonus,
                attackType,
                attackTypeLabel this.attackTypeLabel(record && record.attack && record.attack.type, range),
                range,
                rangeLabel this.combatRangeLabel(range),
                description this.attackDescription(record, parent),
                saveDc,
                saveAbility saveInfo.saveAbility,
                attackBonus,
                attackBonusLabel this.normalizeSigned(attackBonus),
                attackBreakdown this.normalizeSigned(attackBonus) + (parts.length  (' (' + parts.join(' ') + ')')  ''),
                damage this.beaconDamageSummaries(record, context, ability),
                rollCommand shortID  R20.buttonAbilityCommand(characterId, 'repeating_attack_' + shortID + '_attack')  '',
                damageCommand shortID  R20.buttonAbilityCommand(characterId, 'repeating_attack_' + shortID + '_attack_dmg')  ''
            };
        },

        getBeaconAttackSummariesFromRoot(characterId, root) {
            const context = this.beaconCombatContext(root);
            const records = Object.keys(context.integrants)
                .map((key) = context.integrants[key])
                .filter((record) = this.beaconAttackIsUsable(record, context.integrants));
            const seen = Object.create(null);
            return records.map((record) = this.buildBeaconAttackSummary(characterId, record, context)).filter((attack) = {
                const key = String(attack.name  '').toLowerCase() + '' + String(attack.id  '');
                if (seen[key]) return false;
                seen[key] = true;
                return true;
            });
        },

        beaconAttackIsUsable(record, integrants) {
            if (!record  record.type !== 'Attack'  record._enabled === false  !record.shortID) return false;
            const attackType = String(record.attack && record.attack.type  '').trim();
            const hasStructuredSave = !!(record.save  record.savingThrow  record.saving_throw  record.saveData  record.savingThrowData);
            if (!attackType && !hasStructuredSave) return false;
             Spell attacks belong in the Spells menu, but non-spell save attacks
             (Oil, special item attacks, etc.) are valid Combat actions.
            if (spelli.test(attackType)) return false;
            if (String(record.source  '').toLowerCase() === 'item') {
                const parent = integrants && integrants[String(record.parentID  record.sourceID  '')];
                if (!parent) return false;
                if (parent.equipData && parent.equipData.equippable === true && parent.equipData.equipped !== true) return false;
            }
            return true;
        },

        async readBeaconAttackBonus(characterId, record, abilityMod, pb, extraBonus) {
            const shortID = String(record && record.shortID  '').trim();
            if (shortID && typeof getSheetItem === 'function') {
                const candidates = [
                    'repeating_attack_' + shortID + '_atkbonus',
                    'repeating_attack(' + shortID + ', atkbonus)'
                ];
                for (let i = 0; i  candidates.length; i += 1) {
                    try {
                        const value = await getSheetItem(characterId, candidates[i], 'current');
                        const parsed = this.parseSignedNumber(value, null);
                        if (parsed !== null) return parsed;
                    } catch (ignored) {}
                }
            }
            return abilityMod + pb + extraBonus;
        },

        async beaconDamageEntries(characterId, record, integrants, attackAbility, parent) {
            const childIds = this.parseJsonList(record && record.childIDs);
            const damageRecords = childIds.map((id) = integrants && integrants[id]).filter((entry) = entry && entry.type === 'Damage' && entry._enabled !== false);
            const out = [];
            for (let i = 0; i  damageRecords.length; i += 1) {
                const damage = damageRecords[i];
                const diceSize = String(damage.diceSize  '').trim();
                const diceCountRaw = damage._diceCount !== undefined  damage._diceCount  damage.diceCount;
                const diceCount = diceSize  Math.max(1, Utils.toInt(diceCountRaw, 1))  0;
                const abilitySetting = String(damage.ability  '').trim().toLowerCase();
                const damageAbility = abilitySetting === 'auto'
                     attackAbility
                     (abilitySetting === 'none'  ''  this.normalizeAbilityName(abilitySetting));
                const abilityMod = damageAbility  await this.readAbilityMod(characterId, damageAbility)  0;
                let flatBonus = this.parseSignedNumber(damage.bonus, 0);
                const attackMagicBonus = this.parseSignedNumber(record && record.attack && record.attack.bonus, 0);
                const parentDescription = String(parent && parent.description  '');
                if (attackMagicBonus && bonuss+tos+attacks+rollss+ands+damages+rollsi.test(parentDescription)) flatBonus += attackMagicBonus;
                const totalFlat = abilityMod + flatBonus;
                let formula = diceSize && diceCount  (String(diceCount) + diceSize)  '';
                if (totalFlat) formula += this.normalizeSigned(totalFlat);
                if (!formula && totalFlat) formula = String(totalFlat);
                out.push({
                    formula formula  '-',
                    damageType String(damage.damageType  'Damage').trim()  'Damage'
                });
            }
            return out;
        },

        async buildBeaconAttack(characterId, record, integrants) {
            const attackAbility = this.normalizeAbilityName(record && record.attack && record.attack.abilityBonus)  (rangedi.test(String(record && record.attack && record.attack.type  ''))  'dexterity'  'strength');
            const abilityMod = await this.readAbilityMod(characterId, attackAbility);
            const proficiencyLevel = String(record && record.attack && record.attack.proficiencyLevel  '').trim().toLowerCase();
            const explicitlyNotProficient = notsproficientuntrainednone.test(proficiencyLevel);
            const pb = explicitlyNotProficient  0  await this.readSheetNumber(characterId, 'pb', 0);
            const extraBonus = this.parseSignedNumber(record && record.attack && record.attack.bonus, 0);
            const attackBonus = await this.readBeaconAttackBonus(characterId, record, abilityMod, pb, extraBonus);
            const parts = [this.normalizeSigned(abilityMod) + ' ' + this.abilityLabel(attackAbility)];
            if (!explicitlyNotProficient && pb) parts.push(this.normalizeSigned(pb) + ' PB');
            if (extraBonus) parts.push(this.normalizeSigned(extraBonus) + ' Bonus');
            const parent = integrants && integrants[String(record.parentID  record.sourceID  '')]  null;
            const damage = await this.beaconDamageEntries(characterId, record, integrants, attackAbility, parent);
            const shortID = String(record.shortID  '').trim();
            return {
                id shortID,
                name String(record.name  record.recordName  'Attack').trim()  'Attack',
                sheetVersion '2024',
                attackType String(record.attack && record.attack.type  'Attack').trim(),
                range String(record.range  '').trim(),
                attackBonus,
                attackBonusLabel this.normalizeSigned(attackBonus),
                attackBreakdown this.normalizeSigned(attackBonus) + ' (' + parts.join(' ') + ')',
                damage,
                rollCommand '%{' + characterId + 'repeating_attack_' + shortID + '_attack}'
            };
        },

        async getBeaconAttacks(characterId) {
            const root = this.getBeaconStore(characterId);
            const integrants = root && root.integrants && root.integrants.integrants && typeof root.integrants.integrants === 'object'
                 root.integrants.integrants
                 {};
            const records = Object.keys(integrants).map((key) = integrants[key]).filter((record) = this.beaconAttackIsUsable(record, integrants));
            const attacks = [];
            for (let i = 0; i  records.length; i += 1) {
                attacks.push(await this.buildBeaconAttack(characterId, records[i], integrants));
            }
            const seen = Object.create(null);
            return attacks.filter((attack) = {
                const key = String(attack.name  '').toLowerCase() + '' + String(attack.id  '');
                if (seen[key]) return false;
                seen[key] = true;
                return true;
            });
        },

        legacyAttackTypeLabel(row) {
            const range = String(row && row.atkrange  '').trim().toLowerCase();
            if (!range) return 'Melee Attack';
            if (b(meleereachtouch)bi.test(range)) return 'Melee Attack';
            if (d+(.d+)ssd+(.d+).test(range)) return 'Ranged Attack';
            if (b(arrowboltrangedthrown)bi.test(range)) return 'Ranged Attack';
            const distance = range.match((d+(.d+))s(ftfeetfoot)bi);
            if (distance) {
                const feet = Utils.toNumber(distance[1], 0);
                if (feet = 10) return 'Melee Attack';
                if (feet  10) return 'Ranged Attack';
            }
            return 'Attack';
        },

        beaconAttackAbility(record) {
            const explicit = this.normalizeAbilityName(record && record.attack && record.attack.abilityBonus);
            if (explicit) return explicit;
            const recordName = String(record && record.recordName  '');
            const named = recordName.match(b(STRDEXCONINTWISCHA)bi);
            if (named) return this.normalizeAbilityName(named[1]);
            const type = String(record && record.attack && record.attack.type  '');
            if (rangedi.test(type)) return 'dexterity';
            if (meleei.test(type)) return 'strength';
            return '';
        },

        combatRangeLabel(value) {
            const raw = String(value  '').trim();
            if (!raw) return '';
            const slash = raw.match((d+(.d+))ss(d+(.d+)));
            if (slash) return slash[1] + '' + slash[2];
            const distance = raw.match((d+(.d+))s(ft.feetfoot)bi);
            if (distance) return distance[1];
            return raw.replace(;[sS]$, '').replace(b(ft.feetfoot)bgi, '').replace(s+g, ' ').trim();
        },

        beaconAttackRangeRaw(record, parent) {
            const direct = String(record && (record.range  record._reachText)  '').trim();
            if (direct) return direct;
            const parentRange = String(parent && (parent.range  (parent.weaponData && parent.weaponData.range))  '').trim();
            if (parentRange) return parentRange;
            const propertyText = Array.isArray(parent && parent.properties)
                 parent.properties.join('  ')
                 String(parent && parent.properties  '');
            const propertyMatch = propertyText.match(bRanges+(d+(.d+)ssd+(.d+))i);
            if (propertyMatch) return propertyMatch[1];
            const description = String(parent && parent.description  '');
            const descriptionMatch = description.match(bRanges+(d+(.d+)ssd+(.d+))i);
            return descriptionMatch  descriptionMatch[1]  '';
        },

        attackDescription(record, parent) {
            return String(record && record.description  parent && parent.description  '').trim();
        },

        attackTypeLabel(value, fallbackRange) {
            const type = String(value  '').trim();
            if (meleei.test(type)) return 'Melee Attack';
            if (rangedi.test(type)) return 'Ranged Attack';
            const range = String(fallbackRange  '').trim();
            if (savei.test(type)) {
                const inferred = range  this.legacyAttackTypeLabel({ atkrange range })  '';
                return ^Ranged Attack$i.test(inferred)  'Ranged Save'  'Save Attack';
            }
            if (range) return this.legacyAttackTypeLabel({ atkrange range });
            return 'Attack';
        },

        flattenDiagnosticValue(value, prefix, out, depth) {
            const target = Array.isArray(out)  out  [];
            const path = String(prefix  '').trim();
            const level = Math.max(0, Utils.toInt(depth, 0));
            if (level  7) {
                target.push({ key path  '(value)', value '[max depth reached]' });
                return target;
            }
            if (value === null  value === undefined  typeof value !== 'object') {
                target.push({ key path  '(value)', value });
                return target;
            }
            if (Array.isArray(value)) {
                if (!value.length) {
                    target.push({ key path  '(value)', value '[]' });
                    return target;
                }
                value.forEach((entry, index) = this.flattenDiagnosticValue(entry, (path  path + '.'  '') + '[' + String(index) + ']', target, level + 1));
                return target;
            }
            const keys = Object.keys(value).sort();
            if (!keys.length) {
                target.push({ key path  '(value)', value '{}' });
                return target;
            }
            keys.forEach((key) = this.flattenDiagnosticValue(value[key], path  (path + '.' + key)  key, target, level + 1));
            return target;
        },

        getStoreDiagnosticSnapshot(characterId) {
            const safeCharacterId = String(characterId  '').trim();
            const started = Date.now();
            const attrs = safeCharacterId  (findObjs({ _type 'attribute', _characterid safeCharacterId })  [])  [];
            const storeAttr = attrs.find((attr) = attr && Utils.isFunction(attr.get) && String(attr.get('name')  '').trim().toLowerCase() === 'store');
            if (!storeAttr) return { root null, attrs, storeChars undefined, readMs Date.now() - started };
            const current = storeAttr.get('current');
            if (current && typeof current === 'object') {
                return { root current, attrs, storeChars undefined, readMs Date.now() - started };
            }
            const raw = String(current  '').trim();
            if (!raw) return { root null, attrs, storeChars undefined, readMs Date.now() - started };
            try {
                return { root JSON.parse(raw), attrs, storeChars raw.length, readMs Date.now() - started };
            } catch (error) {
                Logger.debug('[actionsdiagnostic-store]', error && error.message  error.message  String(error));
                return { root null, attrs, storeChars raw.length, readMs Date.now() - started };
            }
        },

        getLegacyAttackDiagnostics(characterId, attrs, readMs) {
            const started = Date.now();
            const sourceAttrs = Array.isArray(attrs)  attrs  (findObjs({ _type 'attribute', _characterid String(characterId  '').trim() })  []);
            const pcAttacks = this.getLegacyAttackRows(characterId, sourceAttrs).filter((row) = {
                const name = String(row && row.atkname  '').trim();
                if (!name) return false;
                if (String(row.spelllevel  '').trim()  String(row.spell_innate  '').trim()) return false;
                if (String(row.atkflag  '').trim() && String(row.atkflag).indexOf('attack=1')  0) return false;
                return true;
            }).map((row) = {
                const derived = {
                    rowId String(row.rowId  ''),
                    source 'repeating_attack',
                    abilityFromAtkattrBase this.legacyAttrAbility(row.atkattr_base),
                    abilityLabel this.abilityLabel(this.legacyAttrAbility(row.atkattr_base)),
                    attackTypeInferred this.legacyAttackTypeLabel(row),
                    rangeRaw String(row.atkrange  ''),
                    rangeLabel this.combatRangeLabel(row.atkrange),
                    description String(row.atk_desc  '')
                };
                const fields = [];
                this.flattenDiagnosticValue(derived, 'derived', fields, 0);
                this.flattenDiagnosticValue(row, 'row', fields, 0);
                return {
                    name String(row.atkname  '').trim(),
                    sheetVersion '2014',
                    fields
                };
            });
            const npcAttacks = this.getLegacyNpcActionRows(characterId, sourceAttrs)
                .filter((row) = this.legacyNpcActionIsAttack(row))
                .map((row) = {
                    const derived = {
                        rowId String(row.rowId  ''),
                        source 'repeating_npcaction',
                        attackTypeRaw String(row.attack_type  ''),
                        attackTypeLabel this.attackTypeLabel(row.attack_type, row.attack_range),
                        rangeRaw String(row.attack_range  ''),
                        rangeLabel this.combatRangeLabel(row.attack_range),
                        description String(row.description  ''),
                        attackBonusFinal this.parseSignedNumber(row.attack_tohit, 0),
                        damageCount this.legacyNpcDamageSummaries(row).length
                    };
                    const fields = [];
                    this.flattenDiagnosticValue(derived, 'derived', fields, 0);
                    this.flattenDiagnosticValue(row, 'row', fields, 0);
                    return {
                        name String(row.name  '').trim(),
                        sheetVersion '2014 NPC',
                        fields
                    };
                });
            return {
                sheetVersion npcAttacks.length && !pcAttacks.length  '2014 NPC'  '2014',
                attacks pcAttacks.concat(npcAttacks),
                readMs Math.max(0, Utils.toInt(readMs, 0)),
                collectMs Date.now() - started
            };
        },

        getBeaconAttackDiagnostics(characterId, root, storeChars, readMs, liveDiagnostics) {
            const started = Date.now();
            const integrants = root && root.integrants && root.integrants.integrants && typeof root.integrants.integrants === 'object'
                 root.integrants.integrants
                 {};
            const attacks = Object.keys(integrants).map((integrantKey) = ({ integrantKey, record integrants[integrantKey] }))
                .filter((entry) = this.beaconAttackIsUsable(entry.record, integrants))
                .map((entry) = {
                    const record = entry.record;
                    const parentKey = String(record.parentID  record.sourceID  '').trim();
                    const parent = parentKey  (integrants[parentKey]  null)  null;
                    const childIds = this.parseJsonList(record.childIDs);
                    const children = childIds.map((id) = integrants[id]).filter(Boolean);
                    const rangeRaw = this.beaconAttackRangeRaw(record, parent);
                    const attackAbility = this.beaconAttackAbility(record);
                    const liveAbility = liveDiagnostics && liveDiagnostics.abilities  liveDiagnostics.abilities[attackAbility]  null;
                    const derived = {
                        integrantKey entry.integrantKey,
                        shortID String(record.shortID  ''),
                        abilityRaw record && record.attack  record.attack.abilityBonus  undefined,
                        abilityNormalized attackAbility,
                        abilityLabel this.abilityLabel(attackAbility),
                        effectiveAbilityReadComparison liveAbility  '(not collected)',
                        proficiencyReadComparison liveDiagnostics && liveDiagnostics.proficiency  liveDiagnostics.proficiency  '(not collected)',
                        attackTypeRaw record && record.attack  record.attack.type  undefined,
                        attackTypeLabel this.attackTypeLabel(record && record.attack && record.attack.type, rangeRaw),
                        rangeRaw,
                        rangeLabel this.combatRangeLabel(rangeRaw),
                        description this.attackDescription(record, parent),
                        parentKey,
                        childCount children.length
                    };
                    const fields = [];
                    this.flattenDiagnosticValue(derived, 'derived', fields, 0);
                    this.flattenDiagnosticValue(record, 'record', fields, 0);
                    if (parent) this.flattenDiagnosticValue(parent, 'parent', fields, 0);
                    children.forEach((child, index) = this.flattenDiagnosticValue(child, 'child[' + String(index) + ']', fields, 0));
                    return {
                        name String(record.name  record.recordName  'Attack').trim()  'Attack',
                        sheetVersion '2024',
                        fields
                    };
                });
            return {
                sheetVersion '2024',
                attacks,
                storeChars storeChars === undefined  storeChars === null  undefined  Math.max(0, Utils.toInt(storeChars, 0)),
                readMs Math.max(0, Utils.toInt(readMs, 0)),
                collectMs Date.now() - started,
                liveReadMs liveDiagnostics  Math.max(0, Utils.toInt(liveDiagnostics.readMs, 0))  0,
                sheetApiReads liveDiagnostics  Math.max(0, Utils.toInt(liveDiagnostics.sheetApiReads, 0))  0
            };
        },


        getAttackDiagnostics(characterId) {
            const snapshot = this.getStoreDiagnosticSnapshot(characterId);
            const root = snapshot.root;
            const isBeacon = !!(root && typeof root === 'object' && (root.integrants  root.settings  root.hitpoints));
            return isBeacon
                 this.getBeaconAttackDiagnostics(characterId, root, snapshot.storeChars, snapshot.readMs)
                 this.getLegacyAttackDiagnostics(characterId, snapshot.attrs, snapshot.readMs);
        },

        legacyAttributeMap(attrs) {
            const map = Object.create(null);
            (Array.isArray(attrs)  attrs  []).forEach((attr) = {
                if (!attr  !Utils.isFunction(attr.get)) return;
                const name = String(attr.get('name')  '').trim().toLowerCase();
                if (name) map[name] = attr.get('current');
            });
            return map;
        },

        legacyDamageSummaries(row, attrMap, attackAbility) {
            const out = [];
            const build = (prefix) = {
                const base = String(row && row[prefix + 'base']  '').trim();
                const damageType = String(row && row[prefix + 'type']  '').trim();
                if (!base && !damageType) return;
                const ability = this.legacyAttrAbility(row && row[prefix + 'attr'])  attackAbility;
                const abilityMod = ability  this.parseSignedNumber(attrMap[ability + '_mod'], 0)  0;
                const flatBonus = this.parseSignedNumber(row && row[prefix + 'mod'], 0);
                const totalFlat = abilityMod + flatBonus;
                let formula = base;
                if (formula && totalFlat) formula += this.normalizeSigned(totalFlat);
                else if (!formula && totalFlat) formula = String(totalFlat);
                out.push({
                    formula formula  '-',
                    damageType damageType  'Damage',
                    ability,
                    abilityLabel this.abilityLabel(ability),
                    abilityModifier abilityMod,
                    flatBonus
                });
            };
            build('dmg');
            build('dmg2');
            return out;
        },

        getLegacyAttackSummaries(characterId, sourceAttrs) {
            const attrs = Array.isArray(sourceAttrs)
                 sourceAttrs
                 (findObjs({ _type 'attribute', _characterid String(characterId  '').trim() })  []);
            const attrMap = this.legacyAttributeMap(attrs);
            const rows = this.getLegacyAttackRows(characterId, attrs).filter((row) = {
                const name = String(row && row.atkname  '').trim();
                if (!name) return false;
                if (String(row.spelllevel  '').trim()  String(row.spell_innate  '').trim()) return false;
                if (String(row.atkflag  '').trim() && String(row.atkflag).indexOf('attack=1')  0) return false;
                return true;
            });
            const pcAttacks = rows.map((row) = {
                const ability = this.legacyAttrAbility(row.atkattr_base);
                const abilityMod = ability  this.parseSignedNumber(attrMap[ability + '_mod'], 0)  0;
                const profEnabled = pbi.test(String(row.atkprofflag  ''));
                const pb = profEnabled  this.parseSignedNumber(attrMap.pb, 0)  0;
                const extraBonus = this.parseSignedNumber(row.atkmod, 0) + this.parseSignedNumber(row.atkmagic, 0);
                const computed = abilityMod + pb + extraBonus;
                const fromSheet = this.parseSignedNumber(row.atkbonus, null);
                const attackBonus = fromSheet !== null  fromSheet  computed;
                const parts = [];
                if (ability) parts.push(this.normalizeSigned(abilityMod) + ' ' + this.abilityLabel(ability));
                if (pb) parts.push(this.normalizeSigned(pb) + ' PB');
                if (extraBonus) parts.push(this.normalizeSigned(extraBonus) + ' Bonus');
                const rowId = String(row.rowId  '').trim();
                return {
                    id rowId,
                    name String(row.atkname  '').trim(),
                    sheetVersion '2014',
                    ability,
                    abilityLabel this.abilityLabel(ability),
                    abilityModifier abilityMod,
                    proficiencyBonus pb,
                    extraBonus,
                    attackTypeLabel this.legacyAttackTypeLabel(row),
                    range String(row.atkrange  '').trim(),
                    rangeLabel this.combatRangeLabel(row.atkrange),
                    description String(row.atk_desc  '').trim(),
                    saveDc this.legacyRowSaveInfo(row).saveDc,
                    saveAbility this.legacyRowSaveInfo(row).saveAbility,
                    attackBonus,
                    attackBonusLabel this.normalizeSigned(attackBonus),
                    attackBreakdown this.normalizeSigned(attackBonus) + (parts.length  (' (' + parts.join(' ') + ')')  ''),
                    damage this.legacyDamageSummaries(row, attrMap, ability),
                    rollCommand rowId  R20.buttonAbilityCommand(characterId, 'repeating_attack_' + rowId + '_attack')  '',
                    damageCommand rowId  R20.buttonAbilityCommand(characterId, 'repeating_attack_' + rowId + '_attack_dmg')  ''
                };
            });
            return pcAttacks.concat(this.getLegacyNpcAttackSummaries(characterId, attrs));
        },

        getBeaconAttackSummaries(characterId) {
            const root = this.getBeaconStore(characterId);
            return root  this.getBeaconAttackSummariesFromRoot(characterId, root)  [];
        },

        async getAttackSummaries(characterId) {
            const version = R20.detectSheetVersion(characterId);
            return version === '2024'
                 this.getBeaconAttackSummaries(characterId)
                 this.getLegacyAttackSummaries(characterId);
        },

        getLegacyAttackNames(characterId) {
            const pcNames = this.getLegacyAttackRows(characterId)
                .filter((row) = {
                    const name = String(row && row.atkname  '').trim();
                    if (!name) return false;
                    if (String(row.spelllevel  '').trim()  String(row.spell_innate  '').trim()) return false;
                    if (String(row.atkflag  '').trim() && String(row.atkflag).indexOf('attack=1')  0) return false;
                    return true;
                })
                .map((row) = ({ name String(row.atkname  '').trim() }));
            const npcNames = this.getLegacyNpcActionRows(characterId)
                .filter((row) = this.legacyNpcActionIsAttack(row))
                .map((row) = ({ name String(row.name  '').trim() }));
            return pcNames.concat(npcNames);
        },

        getBeaconAttackNames(characterId) {
            const root = this.getBeaconStore(characterId);
            const integrants = root && root.integrants && root.integrants.integrants && typeof root.integrants.integrants === 'object'
                 root.integrants.integrants
                 {};
            return Object.keys(integrants)
                .map((key) = integrants[key])
                .filter((record) = this.beaconAttackIsUsable(record, integrants))
                .map((record) = ({ name String(record.name  record.recordName  'Attack').trim()  'Attack' }));
        },

        getAttackNames(characterId) {
            const version = R20.detectSheetVersion(characterId);
            return version === '2024'  this.getBeaconAttackNames(characterId)  this.getLegacyAttackNames(characterId);
        },

        async getAttacks(characterId) {
            const version = R20.detectSheetVersion(characterId);
            return version === '2024'  this.getBeaconAttacks(characterId)  this.getLegacyAttacks(characterId);
        },

        getLegacySpellRows(characterId, sourceAttrs) {
            const safeCharacterId = String(characterId  '').trim();
            const attrs = Array.isArray(sourceAttrs)
                 sourceAttrs
                 (findObjs({ _type 'attribute', _characterid safeCharacterId })  []);
            const rows = Object.create(null);
            attrs.forEach((attr) = {
                if (!attr  !Utils.isFunction(attr.get)) return;
                const name = String(attr.get('name')  '');
                const match = name.match(^repeating_spell-([^_]+)_([^_]+)_(.+)$i);
                if (!match) return;
                const sectionLevel = String(match[1]  '').trim();
                const rowId = String(match[2]  '').trim();
                const field = String(match[3]  '').trim().toLowerCase();
                const key = sectionLevel + '' + rowId;
                rows[key] = rows[key]  { sectionLevel, rowId };
                rows[key][field] = attr.get('current');
            });
            return Object.keys(rows).map((key) = rows[key]);
        },

        legacySpellDisplayName(row) {
            const source = row  {};
            return String(source.spellname  source.name  source.spell_name  source.atkname  '').trim()  ('Spell ' + String(source.rowId  ''));
        },

        legacySpellGlobalDiagnostic(attrs) {
            const fields = [];
            (Array.isArray(attrs)  attrs  []).forEach((attr) = {
                if (!attr  !Utils.isFunction(attr.get)) return;
                const name = String(attr.get('name')  '').trim();
                if (!name  ^repeating_i.test(name)  ^store$i.test(name)) return;
                if (!(spellcasting^pb$proficiency)i.test(name)) return;
                fields.push({ key 'attribute.' + name + '.current', value attr.get('current') });
                const max = attr.get('max');
                if (max !== undefined && max !== null && String(max).trim() !== '') fields.push({ key 'attribute.' + name + '.max', value max });
            });
            fields.sort((a, b) = String(a.key).localeCompare(String(b.key)));
            return fields;
        },

        getLegacySpellDiagnostics(characterId, attrs, readMs) {
            const started = Date.now();
            const sourceAttrs = Array.isArray(attrs)  attrs  (findObjs({ _type 'attribute', _characterid String(characterId  '').trim() })  []);
            const attrMap = this.legacyAttributeMap(sourceAttrs);
            const globalSpellSaveDc = Math.max(0, Utils.toInt(attrMap.spell_save_dc, 0));
            const globalSpellAttackBonus = this.parseSignedNumber(attrMap.spell_attack_bonus, 0);
            const spellcastingAbilityRaw = String(attrMap.spellcasting_ability  '').trim();
            const spells = this.getLegacySpellRows(characterId, sourceAttrs).map((row) = {
                const saveInfo = this.legacyRowSaveInfo(row);
                const derived = {
                    source 'repeating_spell-' + String(row.sectionLevel  ''),
                    sectionLevel String(row.sectionLevel  ''),
                    rowId String(row.rowId  ''),
                    spellAttack String(row.spellattack  ''),
                    saveDc saveInfo.saveDc  globalSpellSaveDc,
                    saveDcRow saveInfo.saveDc,
                    saveDcGlobal globalSpellSaveDc,
                    saveAbility saveInfo.saveAbility,
                    globalSpellAttackBonus,
                    spellcastingAbilityRaw,
                    rangeRaw String(row.spellrange  row.range  ''),
                    damage1 String(row.spelldamage  ''),
                    damageType1 String(row.spelldamagetype  ''),
                    damage2 String(row.spelldamage2  ''),
                    damageType2 String(row.spelldamagetype2  ''),
                    description String(row.spelldescription  row.spelldesc  row.description  '')
                };
                const fields = [];
                this.flattenDiagnosticValue(derived, 'derived', fields, 0);
                this.flattenDiagnosticValue(row, 'row', fields, 0);
                return {
                    name this.legacySpellDisplayName(row),
                    sheetVersion '2014',
                    fields
                };
            });
            const spellAttackDiagnostics = this.getLegacyAttackRows(characterId, sourceAttrs)
                .filter((row) = {
                    if (String(row.spelllevel  '').trim()  String(row.spell_innate  '').trim()) return true;
                    return Object.keys(row  {}).some((key) = ^spell.test(String(key  '').toLowerCase()));
                })
                .map((row) = {
                    const saveInfo = this.legacyRowSaveInfo(row);
                    const derived = {
                        source 'repeating_attack (spell-linked)',
                        rowId String(row.rowId  ''),
                        spellLevel String(row.spelllevel  ''),
                        spellInnate String(row.spell_innate  ''),
                        saveDc saveInfo.saveDc,
                        saveAbility saveInfo.saveAbility,
                        attackAbility this.legacyAttrAbility(row.atkattr_base),
                        rangeRaw String(row.atkrange  '')
                    };
                    const fields = [];
                    this.flattenDiagnosticValue(derived, 'derived', fields, 0);
                    this.flattenDiagnosticValue(row, 'row', fields, 0);
                    return {
                        name String(row.atkname  'Spell Attack').trim()  'Spell Attack',
                        sheetVersion '2014 Spell Attack',
                        fields
                    };
                });
            const contextFields = this.legacySpellGlobalDiagnostic(sourceAttrs);
            return {
                sheetVersion '2014',
                spells,
                spellAttackRows spellAttackDiagnostics.length,
                extraEntries spellAttackDiagnostics.concat(contextFields.length  [{
                    name 'Spellcasting Context',
                    sheetVersion '2014',
                    isContext true,
                    fields contextFields
                }]  []),
                readMs Math.max(0, Utils.toInt(readMs, 0)),
                collectMs Date.now() - started
            };
        },

        beaconSpellRelatedRecords(spellKey, spell, integrants) {
            const source = integrants  {};
            const rootId = String(spell && spell._id  spellKey  '').trim();
            const queued = [];
            const seen = Object.create(null);
            const out = [];
            const enqueue = (id) = {
                const safeId = String(id  '').trim();
                if (!safeId  seen[safeId]  safeId === rootId  safeId === String(spellKey  '')) return;
                queued.push(safeId);
            };
            this.parseJsonList(spell && spell.childIDs).forEach(enqueue);
            Object.keys(source).forEach((key) = {
                const item = source[key];
                if (!item  item === spell) return;
                const parentId = String(item.parentID  '').trim();
                const sourceId = String(item.sourceID  '').trim();
                if ((rootId && (parentId === rootId  sourceId === rootId))  parentId === String(spellKey  '')  sourceId === String(spellKey  '')) enqueue(key);
            });
            while (queued.length && out.length  80) {
                const id = queued.shift();
                if (seen[id]) continue;
                seen[id] = true;
                const record = source[id];
                if (!record) continue;
                out.push({ key id, record });
                this.parseJsonList(record.childIDs).forEach(enqueue);
                const recordId = String(record._id  id).trim();
                Object.keys(source).forEach((key) = {
                    const child = source[key];
                    if (!child  seen[key]) return;
                    const parentId = String(child.parentID  '').trim();
                    if (parentId === recordId  parentId === id) enqueue(key);
                });
            }
            return out;
        },

        beaconSpellcastingProfiles(root) {
            const integrants = this.beaconIntegrants(root  {});
            const combatContext = this.beaconCombatContext(root  {});
            const abilities = combatContext.abilities  {};
            const proficiencyBonus = Math.max(0, Utils.toInt(combatContext.proficiency && combatContext.proficiency.value, 0));
            const currentPactByLevel = root && root.spellSlots && root.spellSlots.currentPactByLevel && typeof root.spellSlots.currentPactByLevel === 'object'
                 root.spellSlots.currentPactByLevel
                 {};
            return Object.keys(integrants).map((key) = ({ key, record integrants[key] }))
                .filter((entry) = entry.record && String(entry.record.type  '').toLowerCase() === 'spellcasting' && entry.record._enabled !== false && entry.record.parentDisabled !== true)
                .map((entry) = {
                    const record = entry.record;
                    const ability = this.normalizeAbilityName(record.ability  record.spellcastingAbility  '');
                    const abilityData = ability && abilities[ability]  abilities[ability]  null;
                    const modifier = abilityData  Utils.toInt(abilityData.modifier, 0)  0;
                    const casterType = String(record.casterType  '').trim().toLowerCase();
                    const isPact = casterType === 'pact';
                    let pactSlotLevel = 0;
                    let pactSlotMax = 0;
                    let pactSlotsCurrent = 0;
                    if (isPact) {
                        const sourceId = String(record.sourceID  '').trim();
                        Object.keys(integrants).forEach((id) = {
                            const slot = integrants[id];
                            if (!slot  slot._enabled === false  String(slot.type  '').toLowerCase() !== 'spell slot') return;
                            if (sourceId && String(slot.sourceID  '').trim() !== sourceId) return;
                            const level = Math.max(0, Utils.toInt(slot.spellLevel, 0));
                            if (level = 0  level  9) return;
                            if (level  pactSlotLevel) {
                                pactSlotLevel = level;
                                pactSlotMax = Math.max(0, Utils.toInt(this.beaconFlatFormulaValue(slot), 0));
                            } else if (level === pactSlotLevel) {
                                pactSlotMax = Math.max(pactSlotMax, Math.max(0, Utils.toInt(this.beaconFlatFormulaValue(slot), 0)));
                            }
                        });
                        const levelKey = ResourceService && ResourceService.LEVEL_WORDS  ResourceService.LEVEL_WORDS[pactSlotLevel]  '';
                        pactSlotsCurrent = levelKey  Math.max(0, Utils.toInt(currentPactByLevel[levelKey], 0))  0;
                    }
                    return {
                        integrantKey entry.key,
                        name String(record.name  record.recordName  'Spellcasting').trim()  'Spellcasting',
                        source String(record.source  '').trim(),
                        sourceID String(record.sourceID  '').trim(),
                        casterType casterType  'other',
                        ability,
                        abilityLabel this.abilityLabel(ability),
                        abilityScore abilityData  Utils.toInt(abilityData.score, 10)  null,
                        abilityModifier modifier,
                        proficiencyBonus,
                        spellAttackBonus modifier + proficiencyBonus,
                        spellSaveDc 8 + modifier + proficiencyBonus,
                        pactSlotLevel,
                        pactSlotsCurrent,
                        pactSlotMax
                    };
                });
        },

        beaconPrimarySpellcastingProfile(spell, profiles) {
            const safeProfiles = Array.isArray(profiles)  profiles  [];
            if (!safeProfiles.length) return null;
            const sourceId = String(spell && spell.sourceID  '').trim();
            if (sourceId) {
                const direct = safeProfiles.find((profile) = String(profile && profile.sourceID  '').trim() === sourceId);
                if (direct) return direct;
            }
            return safeProfiles.find((profile) = String(profile && profile.source  '').toLowerCase() === 'class')  safeProfiles[0];
        },

        beaconSpellContextDiagnostics(integrants, root) {
            const fields = [];
            const storeRoot = root && typeof root === 'object'  root  {};
            const profiles = this.beaconSpellcastingProfiles(storeRoot);
            profiles.forEach((profile, index) = this.flattenDiagnosticValue(profile, 'derived.spellcasting[' + String(index) + ']', fields, 0));
            if (storeRoot.spells && typeof storeRoot.spells === 'object') this.flattenDiagnosticValue(storeRoot.spells, 'store.spells', fields, 0);
            if (storeRoot.spellSlots && typeof storeRoot.spellSlots === 'object') this.flattenDiagnosticValue(storeRoot.spellSlots, 'store.spellSlots', fields, 0);
            if (storeRoot.settings && typeof storeRoot.settings === 'object') {
                Object.keys(storeRoot.settings).forEach((key) = {
                    if (!(spellcastmagic)i.test(String(key  ''))) return;
                    this.flattenDiagnosticValue(storeRoot.settings[key], 'store.settings.' + key, fields, 0);
                });
            }
            Object.keys(integrants  {}).forEach((key) = {
                const record = integrants[key];
                if (!record  record._enabled === false  String(record.type  '').toLowerCase() === 'spell') return;
                const text = [record.type, record.name, record.recordName, record.label].map((value) = String(value  '')).join(' ');
                if (!(spellcastingspell attackspell savespell dcspellcasting abilitymagic attackmagic dc)i.test(text)) return;
                this.flattenDiagnosticValue(record, 'integrant[' + key + ']', fields, 0);
            });
            return fields;
        },

        async collectSpellLiveSheetDiagnostics(characterId) {
            const started = Date.now();
            const candidates = [
                'spell_save_dc', 'spellSaveDC', 'spell_dc', 'spellDC',
                'spell_attack_bonus', 'spellAttackBonus', 'spell_attack_mod',
                'spellcasting_ability', 'spellcastingAbility',
                'pb', 'proficiency_bonus', 'proficiencyBonus',
                'intelligence', 'intelligence_mod',
                'wisdom', 'wisdom_mod',
                'charisma', 'charisma_mod'
            ];
            const sheetItems = await this.diagnosticGetSheetItemCandidates(characterId, candidates);
            const fields = [];
            this.flattenDiagnosticValue(sheetItems.values, 'getSheetItem', fields, 0);
            return {
                name 'Spellcasting Live Sheet API',
                sheetVersion '2024',
                isContext true,
                fields,
                readMs Date.now() - started,
                sheetApiReads sheetItems.reads
            };
        },

        getBeaconSpellDiagnostics(characterId, root, storeChars, readMs) {
            const started = Date.now();
            const integrants = this.beaconIntegrants(root  {});
            const spellcastingProfiles = this.beaconSpellcastingProfiles(root  {});
            const spells = Object.keys(integrants)
                .map((key) = ({ key, record integrants[key] }))
                .filter((entry) = entry.record && String(entry.record.type  '').toLowerCase() === 'spell' && entry.record._enabled !== false && entry.record.parentDisabled !== true)
                .map((entry) = {
                    const record = entry.record;
                    const related = this.beaconSpellRelatedRecords(entry.key, record, integrants);
                    const relatedRecords = related.map((item) = item.record);
                    const saveInfo = this.structuredSaveInfo(record, relatedRecords);
                    const spellcasting = this.beaconPrimarySpellcastingProfile(record, spellcastingProfiles);
                    const parentKey = String(record.parentID  '').trim();
                    const parent = parentKey  integrants[parentKey]  null;
                    const derived = {
                        integrantKey entry.key,
                        shortID String(record.shortID  ''),
                        level record.level,
                        prepared record._prepared,
                        alwaysPrepared record.alwaysPrepared,
                        castingTime record.castingTime,
                        range record.range,
                        duration record.duration,
                        concentration record.concentration,
                        saveDc saveInfo.saveDc  (saveInfo.saveAbility && spellcasting  spellcasting.spellSaveDc  0),
                        saveAbility saveInfo.saveAbility,
                        spellcastingAbility spellcasting  spellcasting.abilityLabel  '',
                        spellAttackBonus spellcasting  spellcasting.spellAttackBonus  0,
                        spellSaveDc spellcasting  spellcasting.spellSaveDc  0,
                        casterType spellcasting  spellcasting.casterType  '',
                        pactSlotLevel spellcasting  spellcasting.pactSlotLevel  0,
                        pactSlotsCurrent spellcasting  spellcasting.pactSlotsCurrent  0,
                        pactSlotMax spellcasting  spellcasting.pactSlotMax  0,
                        childCount this.parseJsonList(record.childIDs).length,
                        relatedCount related.length
                    };
                    const fields = [];
                    this.flattenDiagnosticValue(derived, 'derived', fields, 0);
                    this.flattenDiagnosticValue(record, 'record', fields, 0);
                    if (parent) this.flattenDiagnosticValue(parent, 'parent', fields, 0);
                    related.forEach((item, index) = {
                        fields.push({ key 'related[' + String(index) + '].integrantKey', value item.key });
                        this.flattenDiagnosticValue(item.record, 'related[' + String(index) + '].record', fields, 0);
                    });
                    return {
                        name String(record.name  record.recordName  'Spell').trim()  'Spell',
                        sheetVersion '2024',
                        fields
                    };
                });
            const contextFields = this.beaconSpellContextDiagnostics(integrants, root);
            return {
                sheetVersion '2024',
                spells,
                spellAttackRows 0,
                extraEntries contextFields.length  [{
                    name 'Spellcasting Context',
                    sheetVersion '2024',
                    isContext true,
                    fields contextFields
                }]  [],
                storeChars storeChars === undefined  storeChars === null  undefined  Math.max(0, Utils.toInt(storeChars, 0)),
                readMs Math.max(0, Utils.toInt(readMs, 0)),
                collectMs Date.now() - started
            };
        },

        getSpellDiagnostics(characterId) {
            const snapshot = this.getStoreDiagnosticSnapshot(characterId);
            const root = snapshot.root;
            const isBeacon = !!(root && typeof root === 'object' && (root.integrants  root.settings  root.hitpoints));
            return isBeacon
                 this.getBeaconSpellDiagnostics(characterId, root, snapshot.storeChars, snapshot.readMs)
                 this.getLegacySpellDiagnostics(characterId, snapshot.attrs, snapshot.readMs);
        },

        normalizeSpellListLevel(value, fallback) {
            const raw = String(value === undefined  value === null  ''  value).trim().toLowerCase();
            if (!raw) return Math.max(0, Math.min(9, Utils.toInt(fallback, 0)));
            if (cantrip^0$.test(raw)) return 0;
            const match = raw.match(d+);
            return Math.max(0, Math.min(9, Utils.toInt(match  match[0]  fallback, 0)));
        },

        primarySpellListProfile(profiles) {
            const safeProfiles = Array.isArray(profiles)  profiles  [];
            if (!safeProfiles.length) return null;
            return safeProfiles.find((profile) = {
                const source = String(profile && profile.source  '').trim().toLowerCase();
                const casterType = String(profile && profile.casterType  '').trim().toLowerCase();
                return source === 'class' && (casterType === 'pact'  casterType === 'full'  casterType === 'half'  casterType === 'third');
            })  safeProfiles.find((profile) = String(profile && profile.source  '').trim().toLowerCase() === 'class')  safeProfiles[0];
        },

        beaconSpellAbilityName(spell) {
            const source = spell  {};
            const level = this.normalizeSpellListLevel(source.level !== undefined  source.level  source.spellLevel, 0);
            const section = level === 0  'cantrip'  String(level);
            const shortID = String(source.shortID  '').trim();
            return shortID  ('repeating_spell-' + section + '_' + shortID + '_spell')  '';
        },

        beaconSpellAbilityCommand(characterId, spell) {
            const abilityName = this.beaconSpellAbilityName(spell);
            return abilityName  R20.buttonAbilityCommand(characterId, abilityName)  '';
        },

        dedupeSpellList(spells) {
            const out = [];
            const indexes = Object.create(null);
            (Array.isArray(spells)  spells  []).forEach((spell) = {
                if (!spell  !String(spell.name  '').trim()) return;
                const level = Math.max(0, Math.min(9, Utils.toInt(spell.level, 0)));
                const key = String(spell.name  '').trim().toLowerCase() + '' + String(level);
                if (!Object.prototype.hasOwnProperty.call(indexes, key)) {
                    indexes[key] = out.length;
                    out.push(spell);
                    return;
                }
                const index = indexes[key];
                const existing = out[index]  {};
                const existingRank = (Utils.toBoolean(existing.alwaysPrepared, false)  2  0) + (Utils.toBoolean(existing.prepared, false)  1  0);
                const candidateRank = (Utils.toBoolean(spell.alwaysPrepared, false)  2  0) + (Utils.toBoolean(spell.prepared, false)  1  0);
                if (candidateRank  existingRank) out[index] = spell;
            });
            return out.sort((a, b) = {
                const levelDiff = Utils.toInt(a && a.level, 0) - Utils.toInt(b && b.level, 0);
                if (levelDiff) return levelDiff;
                return String(a && a.name  '').localeCompare(String(b && b.name  ''));
            });
        },

        applySpellSlotDamageUpcast(damageEntries, upcastText, castLevel) {
            const damage = (Array.isArray(damageEntries)  damageEntries  []).map((entry) = Object.assign({}, entry));
            const text = String(upcastText  '').trim();
            const level = Math.max(0, Utils.toInt(castLevel, 0));
            if (!damage.length  !text  level = 0) return damage;

             Beacon usually exposes the upcast child records too, but the stable
             source for the simple +XdY per slot level rule is the Spell's
             upcastText. Applying it here keeps Pact Magic damage in the list at
             the level it will actually be cast, without live Sheet API reads.
            const match = text.match(damages+increasess+bys+(d+)d(d+)s+fors+eachs+spells+slots+levels+aboves+(d+)(stndrdth)i);
            if (!match) return damage;
            const incrementDice = Math.max(0, Utils.toInt(match[1], 0));
            const dieSize = Math.max(0, Utils.toInt(match[2], 0));
            const threshold = Math.max(0, Utils.toInt(match[3], 0));
            const extraLevels = Math.max(0, level - threshold);
            const extraDice = incrementDice  extraLevels;
            if (!dieSize  !extraDice) return damage;

            for (let i = 0; i  damage.length; i += 1) {
                const formula = String(damage[i] && damage[i].formula  '').trim();
                const formulaMatch = formula.match(new RegExp('^(d+)d' + String(dieSize) + '(.)$', 'i'));
                if (!formulaMatch) continue;
                const baseDice = Math.max(0, Utils.toInt(formulaMatch[1], 0));
                damage[i].formula = String(baseDice + extraDice) + 'd' + String(dieSize) + String(formulaMatch[2]  '');
                damage[i].upcastApplied = true;
                damage[i].castLevel = level;
                break;
            }
            return damage;
        },

        beaconSpellCombatSummary(characterId, spellKey, spell, integrants, profiles, context) {
            const related = this.beaconSpellRelatedRecords(spellKey, spell, integrants);
            const spellId = String(spell && (spell._id  spellKey)  '').trim();
            const attackCandidates = related.filter((item) = {
                const record = item && item.record;
                return record && String(record.type  '').trim().toLowerCase() === 'attack' && record._enabled !== false && record.parentDisabled !== true;
            });
            const attackEntry = attackCandidates.find((item) = {
                const record = item.record  {};
                return String(record.parentID  '').trim() === spellId  String(record.sourceID  '').trim() === spellId;
            })  attackCandidates[0]  null;
            if (!attackEntry) return null;
            const attack = attackEntry.record  {};
            const attackChildren = this.parseJsonList(attack.childIDs).map((id) = integrants[id]).filter(Boolean);
            const saveInfo = this.structuredSaveInfo(attack, attackChildren);
            const profile = this.beaconPrimarySpellcastingProfile(spell, profiles)  this.primarySpellListProfile(profiles);
            const attackType = String(attack.attack && attack.attack.type  '').trim();
            const isSave = savei.test(attackType)  !!saveInfo.saveAbility;
            const isAttack = attacki.test(attackType) && !isSave;
             A spell that is neither an attack nor a saving throw belongs to
             the Cast path, even if it has narrativeautomatic damage.
            if (!isAttack && !isSave) return null;
            let saveDc = 0;
            if (isSave) {
                saveDc = this.beaconCalculatedSaveDc(attack, context, saveInfo);
                if (!saveDc && profile) saveDc = Math.max(0, Utils.toInt(profile.spellSaveDc, 0));
            }
            const attackBonus = profile  Utils.toInt(profile.spellAttackBonus, 0)  0;
            const ability = profile  String(profile.ability  '').trim()  '';
            const shortID = String(attack.shortID  '').trim();
            const abilityLabel = profile  String(profile.abilityLabel  this.abilityLabel(ability)).trim()  this.abilityLabel(ability);
            const casterType = String(profile && profile.casterType  '').trim().toLowerCase();
            const spellLevel = this.normalizeSpellListLevel(spell && (spell.level !== undefined  spell.level  spell.spellLevel), 0);
            const castLevel = casterType === 'pact'
                 Math.max(spellLevel, Math.max(0, Utils.toInt(profile && profile.pactSlotLevel, 0)))
                 spellLevel;
            const baseDamage = this.beaconDamageSummaries(attack, context, ability);
            const damage = castLevel  spellLevel
                 this.applySpellSlotDamageUpcast(baseDamage, spell && spell.upcastText, castLevel)
                 baseDamage;
            return {
                id shortID,
                name String(spell && (spell.name  spell.recordName)  attack.name  'Spell').trim()  'Spell',
                sheetVersion '2024',
                ability,
                abilityLabel,
                attackType,
                attackTypeLabel this.attackTypeLabel(attackType, String(attack.range  spell && spell.range  '')),
                saveDc,
                saveAbility saveInfo.saveAbility,
                attackBonus,
                attackBonusLabel this.normalizeSigned(attackBonus),
                attackBreakdown this.normalizeSigned(attackBonus) + (abilityLabel  (' (' + abilityLabel + ' spellcasting)')  ' (spellcasting)'),
                damage,
                castLevel,
                rollCommand shortID  R20.buttonAbilityCommand(characterId, 'repeating_attack_' + shortID + '_attack')  '',
                damageCommand shortID  R20.buttonAbilityCommand(characterId, 'repeating_attack_' + shortID + '_attack_dmg')  ''
            };
        },

        legacySpellDamageSummaries(row) {
            const source = row  {};
            const damage = [];
            const add = (formula, damageType) = {
                const safeFormula = String(formula  '').trim();
                const safeType = String(damageType  '').trim();
                if (!safeFormula && !safeType) return;
                 Never inject Roll20 macroinline-roll syntax into the spell card.
                 If a custom 2014 spell stores executable syntax here, omit its
                 Damage control rather than risk invalidating the entire list.
                if ([[@{%{{.test(safeFormula)) return;
                damage.push({
                    formula safeFormula  '-',
                    damageType safeType  'Damage'
                });
            };
            add(source.spelldamage, source.spelldamagetype);
            add(source.spelldamage2, source.spelldamagetype2);
            return damage;
        },

        buildLegacySpellRowCombatSummary(characterId, row, profile) {
            const source = row  {};
            const attackMode = String(source.spellattack  '').trim();
            const hasAttack = !!attackMode && !^(none0offfalse)$i.test(attackMode);
            const saveAbility = this.normalizeAbilityName(source.spellsave  source.save  '');
            const hasSave = !!saveAbility;
            const damage = this.legacySpellDamageSummaries(source);
            const attackBonus = Utils.toInt(profile && profile.spellAttackBonus, 0);
            const rowId = String(source.rowId  '').trim();
            const sectionLevel = String(source.sectionLevel  '').trim();
            const command = rowId && sectionLevel
                 R20.buttonAbilityCommand(characterId, 'repeating_spell-' + sectionLevel + '_' + rowId + '_spell')
                 '';
            if (!hasAttack && !hasSave) return null;
            const displayName = this.legacySpellDisplayName(source);
             Without a linked repeating_attack there is no native standalone
             Damage ability, so keep the spell on the CastRoll path only.
            const damageCommand = '';
            return {
                id rowId,
                name displayName,
                sheetVersion '2014',
                ability String(profile && profile.ability  '').trim(),
                abilityLabel String(profile && profile.abilityLabel  '').trim(),
                saveDc hasSave  Math.max(0, Utils.toInt(profile && profile.spellSaveDc, 0))  0,
                saveAbility,
                attackBonus,
                attackBonusLabel hasAttack  this.normalizeSigned(attackBonus)  '-',
                attackBreakdown hasAttack  (this.normalizeSigned(attackBonus) + ' (spellcasting)')  (hasSave  ('DC ' + String(Math.max(0, Utils.toInt(profile && profile.spellSaveDc, 0))) + ' ' + this.abilityLabel(saveAbility))  'Spell roll'),
                damage,
                rollCommand command,
                damageCommand
            };
        },

        buildLegacySpellCombatSummary(characterId, row, spellRow, attrMap, profile) {
            if (!row) return null;
            const ability = this.legacyAttrAbility(row.atkattr_base)  String(profile && profile.ability  '').trim();
            const abilityMod = ability  this.parseSignedNumber(attrMap[ability + '_mod'], Utils.toInt(profile && profile.abilityModifier, 0))  0;
            const saveInfo = this.legacyRowSaveInfo(row);
            const fromSheet = this.parseSignedNumber(row.atkbonus, null);
            const attackBonus = fromSheet !== null  fromSheet  Utils.toInt(profile && profile.spellAttackBonus, abilityMod);
            const rowId = String(row.rowId  '').trim();
            return {
                id rowId,
                name String(row.atkname  'Spell').trim()  'Spell',
                sheetVersion '2014',
                ability,
                abilityLabel this.abilityLabel(ability),
                saveDc saveInfo.saveDc  Math.max(0, Utils.toInt(profile && profile.spellSaveDc, 0)),
                saveAbility saveInfo.saveAbility,
                attackBonus,
                attackBonusLabel this.normalizeSigned(attackBonus),
                attackBreakdown this.normalizeSigned(attackBonus) + ' (spellcasting)',
                 Render only the clean damage values stored on repeating_spell.
                 The repeating_attack dmgbase may contain inline-rollattribute syntax
                 (especially scaling cantrips) that can invalidate a large chat card.
                damage this.legacySpellDamageSummaries(spellRow),
                rollCommand rowId  R20.buttonAbilityCommand(characterId, 'repeating_attack_' + rowId + '_attack')  '',
                damageCommand rowId  R20.buttonAbilityCommand(characterId, 'repeating_attack_' + rowId + '_attack_dmg')  ''
            };
        },

        getBeaconSpellListData(characterId, root) {
            const storeRoot = root && typeof root === 'object'  root  this.getBeaconStore(characterId);
            if (!storeRoot) return { sheetVersion '2024', spells [], slots [], isPact false, profile null };
            const integrants = this.beaconIntegrants(storeRoot);
            const profiles = this.beaconSpellcastingProfiles(storeRoot);
            const primaryProfile = this.primarySpellListProfile(profiles);
            const spellSettings = storeRoot.spells && storeRoot.spells.generalSpellSettings && typeof storeRoot.spells.generalSpellSettings === 'object'
                 storeRoot.spells.generalSpellSettings
                 {};
            const showPreparedOnly = Utils.toBoolean(spellSettings.showPreparedSpellsOnly, false);
            const combatContext = this.beaconCombatContext(storeRoot);
            let spells = Object.keys(integrants)
                .map((key) = ({ key, record integrants[key] }))
                .filter((entry) = entry.record && String(entry.record.type  '').trim().toLowerCase() === 'spell' && entry.record._enabled !== false && entry.record.parentDisabled !== true)
                .map((entry) = {
                    const record = entry.record;
                    const level = this.normalizeSpellListLevel(record.level !== undefined  record.level  record.spellLevel, 0);
                    const prepared = Utils.toBoolean(record._prepared, false);
                    const alwaysPrepared = Utils.toBoolean(record.alwaysPrepared, false);
                    const components = record.components && typeof record.components === 'object'  record.components  {};
                    return {
                        id String(record._id  entry.key  '').trim(),
                        name String(record.name  record.recordName  'Spell').trim()  'Spell',
                        level,
                        prepared,
                        alwaysPrepared,
                        concentration Utils.toBoolean(record.concentration, concentrationi.test(String(record.duration  ''))),
                        castingTime String(record.castingTime  '').trim(),
                        range String(record.range  '').trim(),
                        duration String(record.duration  '').trim(),
                        ritual Utils.toBoolean(record.ritual, false),
                        school String(record.school  '').trim(),
                        verbal Utils.toBoolean(components.verbal, false),
                        somatic Utils.toBoolean(components.somatic, false),
                        material Utils.toBoolean(components.material, false),
                        materialDescription String(components.materialDescription  '').trim(),
                        description String(record.description  '').trim(),
                        upcastText String(record.upcastText  '').trim(),
                        source String(record.source  '').trim(),
                        sourceID String(record.sourceID  '').trim(),
                        castCommand this.beaconSpellAbilityCommand(characterId, record),
                        combat this.beaconSpellCombatSummary(characterId, entry.key, record, integrants, profiles, combatContext)
                    };
                })
                .filter((spell) = !showPreparedOnly  spell.level === 0  spell.prepared  spell.alwaysPrepared);
            spells = this.dedupeSpellList(spells);

            const isPact = !!(primaryProfile && String(primaryProfile.casterType  '').trim().toLowerCase() === 'pact');
            let slots = [];
            if (!isPact && typeof ResourceService !== 'undefined' && ResourceService && Utils.isFunction(ResourceService.buildBeaconResourceEntries)) {
                slots = ResourceService.buildBeaconResourceEntries(characterId, storeRoot)
                    .filter((entry) = entry && entry.ref && entry.ref.kind === 'beacon-spell')
                    .map((entry) = ({
                        level Math.max(1, Math.min(9, Utils.toInt(entry.ref.level, 0))),
                        current Math.max(0, Utils.toInt(entry.current, 0)),
                        max Math.max(0, Utils.toInt(entry.max, 0))
                    }));
            }
            return {
                sheetVersion '2024',
                spells,
                slots,
                profiles,
                profile primaryProfile,
                isPact,
                pactSlotLevel isPact  Math.max(0, Utils.toInt(primaryProfile && primaryProfile.pactSlotLevel, 0))  0,
                pactSlotsCurrent isPact  Math.max(0, Utils.toInt(primaryProfile && primaryProfile.pactSlotsCurrent, 0))  0,
                pactSlotMax isPact  Math.max(0, Utils.toInt(primaryProfile && primaryProfile.pactSlotMax, 0))  0
            };
        },

        getLegacySpellListData(characterId, sourceAttrs) {
            const attrs = Array.isArray(sourceAttrs)
                 sourceAttrs
                 (findObjs({ _type 'attribute', _characterid String(characterId  '').trim() })  []);
            const attrMap = this.legacyAttributeMap(attrs);
            const abilityRaw = String(attrMap.spellcasting_ability  '').trim();
            let ability = this.legacyAttrAbility(abilityRaw);
            if (!ability) {
                const match = abilityRaw.toLowerCase().match(strengthdexterityconstitutionintelligencewisdomcharisma);
                ability = match  match[0]  '';
            }
            const abilityModifier = ability  this.parseSignedNumber(attrMap[ability + '_mod'], 0)  0;
            const proficiencyBonus = this.parseSignedNumber(attrMap.pb, 0);
            const spellAttackBonus = this.parseSignedNumber(attrMap.spell_attack_bonus, abilityModifier + proficiencyBonus);
            const spellSaveDc = Math.max(0, Utils.toInt(attrMap.spell_save_dc, 8 + abilityModifier + proficiencyBonus));
            const profile = {
                name 'Spellcasting',
                source 'Class',
                casterType 'other',
                ability,
                abilityLabel this.abilityLabel(ability),
                abilityModifier,
                proficiencyBonus,
                spellAttackBonus,
                spellSaveDc
            };
            const spellAttackRows = this.getLegacyAttackRows(characterId, attrs).filter((row) = {
                return !!(String(row.spelllevel  '').trim()  String(row.spell_innate  '').trim()  Object.keys(row  {}).some((key) = ^spell.test(String(key  '').toLowerCase())));
            });
            const spellAttackBySpellId = Object.create(null);
            const spellAttackByName = Object.create(null);
            spellAttackRows.forEach((row) = {
                const spellId = String(row.spellid  '').trim().toLowerCase();
                const nameKey = String(row.atkname  '').trim().toLowerCase();
                if (spellId && !spellAttackBySpellId[spellId]) spellAttackBySpellId[spellId] = row;
                if (nameKey && !spellAttackByName[nameKey]) spellAttackByName[nameKey] = row;
            });
            const legacyComponentEnabled = (value, letter) = {
                const raw = String(value  '').trim();
                if (!raw  ^0falseoffno$i.test(raw)) return false;
                return new RegExp('(^[^a-z])' + letter + 's=s1^1$trueonyes', 'i').test(raw);
            };
            let spells = this.getLegacySpellRows(characterId, attrs).map((row) = {
                const name = this.legacySpellDisplayName(row);
                const rowId = String(row.rowId  '').trim();
                const linkedAttack = spellAttackBySpellId[rowId.toLowerCase()]  spellAttackByName[String(name  '').trim().toLowerCase()]  null;
                const level = this.normalizeSpellListLevel(row.sectionLevel, row.spelllevel);
                const sectionLevel = level === 0  'cantrip'  String(level);
                return {
                    id rowId,
                    name,
                    level,
                    prepared ^(1ontrueyesprepared)$i.test(String(row.spellprepared  row.prepared  row.spellpreparedflag  '').trim()),
                    alwaysPrepared false,
                    concentration concentrationi.test(String(row.spellduration  row.duration  row.spelldescription  row.spelldesc  '')),
                    castingTime String(row.spellcastingtime  row.castingtime  '').trim(),
                    range String(row.spellrange  row.range  '').trim(),
                    duration String(row.spellduration  row.duration  '').trim(),
                    ritual ^(1ontrueyesritual)$i.test(String(row.spellritual  row.ritual  '').trim()),
                    school String(row.spellschool  row.school  '').trim(),
                    verbal legacyComponentEnabled(row.spellcomp_v, 'v'),
                    somatic legacyComponentEnabled(row.spellcomp_s, 's'),
                    material legacyComponentEnabled(row.spellcomp_m, 'm'),
                    materialDescription String(row.spellcomp_materials  '').trim(),
                    description String(row.spelldescription  row.spelldesc  row.spell_desc  '').trim(),
                    upcastText String(row.spellhldie  row.spellhlbonus  '').trim(),
                    source '2014',
                    castCommand rowId  R20.buttonAbilityCommand(characterId, 'repeating_spell-' + sectionLevel + '_' + rowId + '_spell')  '',
                    combat linkedAttack
                         this.buildLegacySpellCombatSummary(characterId, linkedAttack, row, attrMap, profile)
                         this.buildLegacySpellRowCombatSummary(characterId, row, profile)
                };
            });
            spells = this.dedupeSpellList(spells);
            let slots = [];
            if (typeof ResourceService !== 'undefined' && ResourceService && Utils.isFunction(ResourceService.buildLegacyResourceEntries)) {
                slots = ResourceService.buildLegacyResourceEntries(characterId)
                    .filter((entry) = entry && entry.ref && entry.ref.kind === 'legacy-spell')
                    .map((entry) = ({
                        level Math.max(1, Math.min(9, Utils.toInt(entry.ref.level, 0))),
                        current Math.max(0, Utils.toInt(entry.current, 0)),
                        max Math.max(0, Utils.toInt(entry.max, 0))
                    }));
            }
            const classText = Object.keys(attrMap).filter((key) = ^class$^multiclassd$^class_display$i.test(key)).map((key) = String(attrMap[key]  '')).join(' ');
            const isPact = warlocki.test(classText);
            let pactSlotLevel = 0;
            let pactSlotsCurrent = 0;
            let pactSlotMax = 0;
            if (isPact && slots.length) {
                const active = slots.slice().sort((a, b) = Utils.toInt(b.level, 0) - Utils.toInt(a.level, 0))[0];
                pactSlotLevel = Math.max(0, Utils.toInt(active && active.level, 0));
                pactSlotsCurrent = Math.max(0, Utils.toInt(active && active.current, 0));
                pactSlotMax = Math.max(0, Utils.toInt(active && active.max, 0));
                slots = [];
                profile.casterType = 'pact';
            }
            return { sheetVersion '2014', spells, slots, profile, profiles [profile], isPact, pactSlotLevel, pactSlotsCurrent, pactSlotMax };
        },

        getSpellListData(characterId, suppliedRoot, sourceAttrs) {
            const root = suppliedRoot && typeof suppliedRoot === 'object'  suppliedRoot  null;
            const isBeacon = root
                 !!(root.integrants  root.settings  root.hitpoints)
                 R20.detectSheetVersion(characterId) === '2024';
            if (isBeacon) return this.getBeaconSpellListData(characterId, root  this.getBeaconStore(characterId));
            return this.getLegacySpellListData(characterId, sourceAttrs);
        },

        prepareLegacySpellListForSharedRenderer(spellList) {
            const data = Object.assign({}, spellList  {});
            data.spells = (Array.isArray(data.spells)  data.spells  []).map((spell) = {
                const normalized = Object.assign({}, spell  {});
                const action = normalized.combat && typeof normalized.combat === 'object'  normalized.combat  null;
                 Spells without a native RollSave action stay on the Cast-button path.
                if (!action  !String(action.rollCommand  '').trim()) normalized.combat = null;
                return normalized;
            });
            return data;
        },

        findRepresentativeToken(characterId, ctx) {
            const safeCharacterId = String(characterId  '').trim();
            if (!safeCharacterId) return null;
            const pageId = R20.getPlayerPageId(ctx && ctx.playerId  '');
            const pageToken = pageId  R20.findTokenByCharacterIdOnPage(safeCharacterId, pageId)  null;
            if (pageToken) return pageToken;
            const tokens = R20.getTokensByCharacterId(safeCharacterId);
            return tokens[0]  null;
        },

        resolveSheetCommandContext(ctx, commandArgs, label) {
            const args = Array.isArray(commandArgs)  commandArgs  [];
            const explicit = Utils.stripWrappingQuotes(args[0]  '');
            const explicitToken = explicit  R20.getTokenById(explicit)  null;
            if (explicitToken) return this.getActionToken(R20.getTokenId(explicitToken), ctx);

            const selected = R20.getSelectedTokens(ctx && ctx.msg);
            if (selected.length) return this.getActionToken(R20.getTokenId(selected[0]), ctx);

            const characterName = Utils.stripWrappingQuotes(args.map((value) = String(value  '').trim()).filter(Boolean).join(' '));
            if (!characterName) {
                return {
                    ok false,
                    message 'Select a linked token or use code!ca ' + Utils.escapeHtml(String(label  'combat').toLowerCase()) + ' &quot;Exact Sheet Name&quot;code.'
                };
            }

            const character = R20.getCharacterByName(characterName);
            if (!character) return { ok false, message 'No character sheet named strong' + Utils.escapeHtml(characterName) + 'strong was found.' };
            const characterId = String(character.id  (Utils.isFunction(character.get)  character.get('_id')  '')  '').trim();
            const token = this.findRepresentativeToken(characterId, ctx);
            if (!ctx.isGM) {
                const controlled = token
                     R20.tokenIsControlledByPlayer(token, character, ctx.playerId)
                     !!R20.getCharacterAccessFlags(character, ctx.playerId, false).controlAccess;
                if (!controlled) return { ok false, message 'You do not control that character.' };
            }
            return {
                ok true,
                token,
                tokenId token  R20.getTokenId(token)  '',
                character,
                characterId,
                characterName String(character.get('name')  characterName).trim()  characterName
            };
        },

        async showCombatForInfo(ctx, info) {
            if (!info  !info.ok) {
                Render.sendWhisperMessage(ctx && ctx.who  'GM', 'Combat', info && info.message  'No accessible character sheet was found.', 'warning');
                return false;
            }
            let attacks = [];
            let snapshot = null;
            let root = null;
            let isBeacon = false;
            const started = Date.now();
            try {
                snapshot = this.getStoreDiagnosticSnapshot(info.characterId);
                root = snapshot.root;
                isBeacon = !!(root && typeof root === 'object' && (root.integrants  root.settings  root.hitpoints));
                attacks = isBeacon
                     this.getBeaconAttackSummariesFromRoot(info.characterId, root)
                     this.getLegacyAttackSummaries(info.characterId, snapshot.attrs);
                Logger.debug('[actionscombat] sheet=' + (isBeacon  '2024'  '2014') + ' attacks=' + String(attacks.length) + ' ms=' + String(Date.now() - started));
            } catch (error) {
                Logger.error('[actionscombat]', error && error.stack  error.stack  String(error));
                Render.sendWhisperMessage(ctx && ctx.who  'GM', 'Combat', 'Combat Assistant could not read this character's attack data.', 'failure');
                return false;
            }
            const recipient = ctx && ctx.who  'GM';
             Keep the actual Combat menu fast send it before any diagnostic Sheet API reads.
            R20.whisper(recipient, Render.buildCombatAttacksCard(info.characterName, attacks));

            if (RuntimeConfig.get('CHAT_DEBUG_ATTACKS')) {
                let diagnosticSet = null;
                try {
                    if (isBeacon) {
                        const liveDiagnostics = await this.collectBeaconLiveAbilityDiagnostics(info.characterId, snapshot.attrs, attacks, root);
                        diagnosticSet = this.getBeaconAttackDiagnostics(info.characterId, root, snapshot.storeChars, snapshot.readMs, liveDiagnostics);
                    } else {
                        diagnosticSet = this.getLegacyAttackDiagnostics(info.characterId, snapshot.attrs, snapshot.readMs);
                    }
                } catch (error) {
                    Logger.debug('[actionscombat-diagnostic]', error && error.message  error.message  String(error));
                }
                if (diagnosticSet) {
                    R20.whisper(recipient, Render.buildCombatDiagnosticSummaryCard(info.characterName, diagnosticSet));
                    (diagnosticSet.attacks  []).forEach((diagnostic, index) = {
                        R20.whisper(recipient, Render.buildCombatAttackDiagnosticCard(info.characterName, diagnostic, index, diagnosticSet.attacks.length));
                    });
                }
            }
            return true;
        },

        async showCombatForContext(ctx, commandArgs) {
            return this.showCombatForInfo(ctx, this.resolveSheetCommandContext(ctx, commandArgs, 'combat'));
        },


        inspectSpellRender(characterName, spellList) {
            const data = spellList  {};
            const spells = (Array.isArray(data.spells)  data.spells  []).filter((spell) = spell && String(spell.name  '').trim());
            const result = {
                fullCardChars 0,
                fullCardError '',
                levelCards [],
                singleSpellMaxChars 0,
                singleSpellMaxName ''
            };
            try {
                result.fullCardChars = Render.buildSpellsCard(characterName, data).length;
            } catch (error) {
                result.fullCardError = Logger.format(error);
            }
            const grouped = Object.create(null);
            spells.forEach((spell) = {
                const level = Math.max(0, Math.min(9, Utils.toInt(spell && spell.level, 0)));
                grouped[level] = grouped[level]  [];
                grouped[level].push(spell);
            });
            Object.keys(grouped).map((value) = Utils.toInt(value, 0)).sort((a, b) = a - b).forEach((level) = {
                try {
                    const chars = Render.buildSpellsCard(characterName, Object.assign({}, data, { spells grouped[level] })).length;
                    result.levelCards.push({ level, count grouped[level].length, chars });
                } catch (error) {
                    result.levelCards.push({ level, count grouped[level].length, chars 0, error Logger.format(error) });
                }
            });
            spells.forEach((spell) = {
                try {
                    const chars = Render.buildSpellsCard(characterName, Object.assign({}, data, { spells [spell] })).length;
                    if (chars  result.singleSpellMaxChars) {
                        result.singleSpellMaxChars = chars;
                        result.singleSpellMaxName = String(spell.name  'Spell').trim()  'Spell';
                    }
                } catch (error) {
                    Logger.info('[spells-debugsingle-render] name=' + String(spell && spell.name  'Spell') + ' error=' + Logger.format(error));
                }
            });
            return result;
        },

        buildLegacySpellCardChunks(characterName, spellList, maxChars) {
            const data = spellList  {};
            const spells = (Array.isArray(data.spells)  data.spells  [])
                .filter((spell) = spell && String(spell.name  '').trim());
            const limit = Math.max(6500, Utils.toInt(maxChars, 8000));
            if (!spells.length) {
                const html = Render.buildSpellsCard(characterName, data);
                return [{ html, level null, count 0, chars html.length }];
            }

            const fullHtml = Render.buildSpellsCard(characterName, data);
            if (fullHtml.length = limit) {
                return [{ html fullHtml, level null, count spells.length, chars fullHtml.length }];
            }

            const grouped = Object.create(null);
            spells.forEach((spell) = {
                const level = Math.max(0, Math.min(9, Utils.toInt(spell && spell.level, 0)));
                grouped[level] = grouped[level]  [];
                grouped[level].push(spell);
            });

            const cards = [];
            const levels = Object.keys(grouped).map((value) = Utils.toInt(value, 0)).sort((a, b) = a - b);
            levels.forEach((level) = {
                let chunk = [];
                const flush = () = {
                    if (!chunk.length) return;
                    const html = Render.buildSpellsCard(characterName, Object.assign({}, data, { spells chunk.slice() }));
                    cards.push({ html, level, count chunk.length, chars html.length });
                    chunk = [];
                };

                grouped[level].forEach((spell) = {
                    const candidate = chunk.concat([spell]);
                    const candidateHtml = Render.buildSpellsCard(characterName, Object.assign({}, data, { spells candidate }));
                    if (chunk.length && candidateHtml.length  limit) {
                        flush();
                        chunk = [spell];
                    } else {
                        chunk = candidate;
                    }
                });
                flush();
            });
            return cards;
        },

        async showSpellsForContext(ctx, commandArgs) {
            const info = this.resolveSheetCommandContext(ctx, commandArgs, 'spells');
            if (!info.ok) {
                Render.sendWhisperMessage(ctx && ctx.who  'GM', 'Spells', info.message, 'warning');
                return false;
            }
            const recipient = ctx && ctx.who  'GM';
            let snapshot = null;
            let root = null;
            let isBeacon = false;
            let spellList = null;
            try {
                snapshot = this.getStoreDiagnosticSnapshot(info.characterId);
                root = snapshot.root;
                isBeacon = !!(root && typeof root === 'object' && (root.integrants  root.settings  root.hitpoints));
                spellList = this.getSpellListData(info.characterId, isBeacon  root  null, snapshot.attrs);
            } catch (error) {
                Logger.error('[actionsspellsread]', Logger.format(error));
                Render.sendWhisperMessage(recipient, 'Spells', Combat Assistant could not read this character's spell data., 'failure');
                return false;
            }

            const spellCount = spellList && Array.isArray(spellList.spells)  spellList.spells.length  0;
            const renderSpellList = isBeacon  spellList  this.prepareLegacySpellListForSharedRenderer(spellList);
            const debugSpells = !!RuntimeConfig.get('CHAT_DEBUG_SPELLS');
            const renderProbe = debugSpells  this.inspectSpellRender(info.characterName, renderSpellList)  null;
            let spellCards = [];
            try {
                const html = Render.buildSpellsCard(info.characterName, renderSpellList);
                spellCards = [{ html, level null, count spellCount, chars html.length }];
            } catch (error) {
                Logger.error('[actionsspellsrender]', Logger.format(error));
                Render.sendWhisperMessage(recipient, 'Spells', 'Spell data was collected, but the spell list renderer failed. Check the API console.', 'failure');
                return false;
            }

            if (debugSpells) {
                if (!isBeacon && renderProbe) {
                    renderProbe.fullCardChars = spellCards[0]  spellCards[0].chars  renderProbe.fullCardChars;
                }
                const levelStats = renderProbe && Array.isArray(renderProbe.levelCards)
                     renderProbe.levelCards.map((entry) = 'Lv' + String(entry.level) + '' + String(entry.count) + '' + String(entry.chars)).join(',')
                     '';
                const chunkStats = spellCards.map((entry, index) =
                    String(index + 1) + '' + (entry.level === null  'all'  ('Lv' + String(entry.level))) + '' + String(entry.count) + '' + String(entry.chars)
                ).join(',');
                Logger.info('[spells-debug] sheet=' + (isBeacon  '2024'  '2014') +
                    ' characterId=' + String(info.characterId  '') +
                    ' spells=' + String(spellCount) +
                    ' fullCardChars=' + String(renderProbe && renderProbe.fullCardChars  (spellCards[0] && spellCards[0].chars)  0) +
                    ' cards=' + String(spellCards.length) +
                    ' cardStats=' + chunkStats +
                    ' largestSingle=' + String(renderProbe && renderProbe.singleSpellMaxChars  0) +
                    ' largestName=' + String(renderProbe && renderProbe.singleSpellMaxName  '') +
                    ' levels=' + levelStats);
                if (!isBeacon) {
                    if (renderProbe) {
                        renderProbe.chunkCount = spellCards.length;
                        renderProbe.chunkCards = spellCards.map((entry) = ({ level entry.level, count entry.count, chars entry.chars }));
                    }
                    R20.whisper(recipient, Render.buildSpellRenderProbeCard(info.characterName, renderSpellList, renderProbe));
                }
            }

             Roll20 sendChat callbacks capture the generated message instead of displaying it.
             Spell cards must therefore be sent without a callback.
            spellCards.forEach((entry) = {
                R20.whisper(recipient, entry.html);
            });
            if (debugSpells) {
                Logger.info('[spells-debugsend] sheet=' + (isBeacon  '2024'  '2014') +
                    ' cards=' + String(spellCards.length) +
                    ' chars=' + spellCards.map((entry) = String(entry.chars)).join(','));
            }
            Logger.debug('[actionsspells] sheet=' + (isBeacon  '2024'  '2014') + ' spells=' + String(spellCount));

            if (debugSpells) {
                let diagnosticSet = null;
                try {
                    diagnosticSet = isBeacon
                         this.getBeaconSpellDiagnostics(info.characterId, root, snapshot.storeChars, snapshot.readMs)
                         this.getLegacySpellDiagnostics(info.characterId, snapshot.attrs, snapshot.readMs);
                    if (diagnosticSet && renderProbe) {
                        diagnosticSet.fullCardChars = renderProbe.fullCardChars;
                        diagnosticSet.levelCardChars = (renderProbe.levelCards  []).map((entry) = 'Lv' + String(entry.level) + '=' + String(entry.chars)).join('  ');
                        diagnosticSet.singleSpellMaxChars = renderProbe.singleSpellMaxChars;
                        diagnosticSet.renderError = renderProbe.fullCardError  '';
                        diagnosticSet.chunkCount = spellCards.length;
                        diagnosticSet.chunkCardChars = spellCards.map((entry) = String(entry.chars)).join('  ');
                    }
                } catch (error) {
                    Logger.info('[actionsspells-diagnostic] ' + Logger.format(error));
                }
                if (diagnosticSet) {
                    R20.whisper(recipient, Render.buildSpellDiagnosticSummaryCard(info.characterName, diagnosticSet));
                    const diagnosticSpells = Array.isArray(diagnosticSet.spells)  diagnosticSet.spells  [];
                    const extra = Array.isArray(diagnosticSet.extraEntries)  diagnosticSet.extraEntries  [];
                    diagnosticSpells.forEach((diagnostic, index) = {
                        R20.whisper(recipient, Render.buildSpellDiagnosticCard(info.characterName, diagnostic, index, diagnosticSpells.length));
                    });
                    extra.forEach((diagnostic) = {
                        R20.whisper(recipient, Render.buildSpellDiagnosticCard(info.characterName, diagnostic, 0, 0));
                    });
                }
            }
            return true;
        }
    };

    const ResourceService = {
        LEVEL_WORDS Object.freeze(['', 'FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'SIXTH', 'SEVENTH', 'EIGHTH', 'NINTH']),
        MAX_STORE_BYTES 9500000,
        SHEET_WORKER_TIMEOUT_MS 2500,

        toResourceInt(value, fallback) {
            const n = parseInt(value, 10);
            return Number.isNaN(n)  (fallback === undefined  0  fallback)  Math.max(0, n);
        },

        getCharacterContext(token) {
            const character = token  R20.getCharacterFromToken(token)  null;
            const characterId = character  String(character.id  '').trim()  '';
            return { token, character, characterId };
        },

        getLegacyAttributes(characterId) {
            const safeCharacterId = String(characterId  '').trim();
            return safeCharacterId  (findObjs({ _type 'attribute', _characterid safeCharacterId })  [])  [];
        },

        legacyAttributeMap(attributes) {
            const map = Object.create(null);
            (Array.isArray(attributes)  attributes  []).forEach((attr) = {
                if (!attr  !Utils.isFunction(attr.get)) return;
                const name = String(attr.get('name')  '').trim();
                if (name) map[name.toLowerCase()] = attr;
            });
            return map;
        },

        legacyAttributeCurrent(attr, fallback) {
            if (!attr  !Utils.isFunction(attr.get)) return fallback === undefined  ''  fallback;
            const value = attr.get('current');
            return value === undefined  value === null  (fallback === undefined  ''  fallback)  value;
        },

        legacyAttributeMax(valueAttr, attrMap, valueAttrName, characterId) {
            let max = 0;
            if (valueAttr && Utils.isFunction(valueAttr.get)) {
                const directMax = valueAttr.get('max');
                if (directMax !== undefined && directMax !== null && String(directMax).trim() !== '') {
                    max = this.toResourceInt(directMax, 0);
                }
            }
            if (max = 0) {
                const maxAttrName = String(valueAttrName  '') + '_max';
                const maxAttr = attrMap[maxAttrName.toLowerCase()];
                if (maxAttr) max = this.toResourceInt(this.legacyAttributeCurrent(maxAttr, 0), 0);
                if (max = 0 && typeof getAttrByName === 'function' && characterId) {
                    try {
                        const resolvedSeparate = getAttrByName(String(characterId), maxAttrName);
                        max = this.toResourceInt(resolvedSeparate, max);
                    } catch (ignored) {}
                }
            }
            if (max = 0 && typeof getAttrByName === 'function' && characterId) {
                try {
                    const resolvedMax = getAttrByName(String(characterId), String(valueAttrName  ''), 'max');
                    max = this.toResourceInt(resolvedMax, max);
                } catch (ignored) {}
            }
            return max;
        },

        buildLegacyResourceEntries(characterId) {
            const attributes = this.getLegacyAttributes(characterId);
            const attrMap = this.legacyAttributeMap(attributes);
            const resources = [];
            const seen = Object.create(null);
            const addResource = (label, valueAttrName) = {
                const safeLabel = String(label  '').trim();
                const safeValueAttrName = String(valueAttrName  '').trim();
                const key = safeValueAttrName.toLowerCase();
                if (!safeLabel  !safeValueAttrName  seen[key]) return;
                const valueAttr = attrMap[key];
                if (!valueAttr) return;
                const max = this.legacyAttributeMax(valueAttr, attrMap, safeValueAttrName, characterId);
                if (max = 0) return;
                const current = this.toResourceInt(this.legacyAttributeCurrent(valueAttr, 0), 0);
                seen[key] = true;
                resources.push({
                    label safeLabel,
                    current,
                    max,
                    sheetVersion '2014',
                    ref { kind 'legacy-resource', valueAttr safeValueAttrName, label safeLabel }
                });
            };

            const classNameAttr = attrMap.class_resource_name;
            const otherNameAttr = attrMap.other_resource_name;
            addResource(this.legacyAttributeCurrent(classNameAttr, ''), 'class_resource');
            addResource(this.legacyAttributeCurrent(otherNameAttr, ''), 'other_resource');

            attributes.forEach((attr) = {
                if (!attr  !Utils.isFunction(attr.get)) return;
                const attrName = String(attr.get('name')  '').trim();
                const match = attrName.match(^repeating_resource_(.+)_resource_(leftright)$i);
                if (!match) return;
                const nameAttr = attrMap[(attrName + '_name').toLowerCase()];
                addResource(this.legacyAttributeCurrent(nameAttr, ''), attrName);
            });

            const spellSlots = [];
            for (let level = 1; level = 9; level += 1) {
                const totalName = 'lvl' + String(level) + '_slots_total';
                const currentName = 'lvl' + String(level) + '_slots_expended';
                const totalAttr = attrMap[totalName];
                const max = this.toResourceInt(this.legacyAttributeCurrent(totalAttr, 0), 0);
                if (max = 0) continue;
                const currentAttr = attrMap[currentName];
                const rawCurrent = currentAttr  this.legacyAttributeCurrent(currentAttr, '')  '';
                const current = rawCurrent === ''  max  this.toResourceInt(rawCurrent, max);
                spellSlots.push({
                    label 'Spell Slots Lv' + String(level),
                    current,
                    max,
                    sheetVersion '2014',
                    ref { kind 'legacy-spell', valueAttr currentName, maxAttr totalName, level, label 'Spell Slots Lv' + String(level) }
                });
            }
            return spellSlots.concat(resources);
        },

        getStoreRoot(characterId) {
            const roots = R20.getCharacterStoreDumpRoots(characterId);
            return roots.length  roots[0]  null;
        },

        getStoreIntegrants(root) {
            if (!root  typeof root !== 'object') return {};
            const wrapped = root.integrants;
            if (wrapped && typeof wrapped === 'object' && wrapped.integrants && typeof wrapped.integrants === 'object') return wrapped.integrants;
            return wrapped && typeof wrapped === 'object'  wrapped  {};
        },

        parseObject(value) {
            if (value && typeof value === 'object' && !Array.isArray(value)) return value;
            const raw = String(value  '').trim();
            if (!raw) return {};
            try {
                const parsed = JSON.parse(raw);
                return parsed && typeof parsed === 'object' && !Array.isArray(parsed)  parsed  {};
            } catch (error) {
                return {};
            }
        },

        flatFormulaValue(formula, fallback) {
            const data = formula && typeof formula === 'object'  formula  {};
            const value = data.flatValue;
            const numeric = parseFloat(value);
            return Number.isFinite(numeric)  Math.max(0, Math.floor(numeric))  (fallback === undefined  0  fallback);
        },

        beaconResourceMax(resource, integrants) {
            let max = 0;
            if (resource && resource.maxValue !== undefined && resource.maxValue !== null && String(resource.maxValue).trim() !== '') {
                max = this.toResourceInt(resource.maxValue, 0);
            }
            max = Math.max(max, this.flatFormulaValue(resource && resource.maxValueFormula, 0));
            const relations = resource && resource.relations && typeof resource.relations === 'object'  resource.relations  {};
            Object.keys(relations).forEach((modifierId) = {
                if (relations[modifierId] !== 'modifiedBy') return;
                const modifier = integrants[modifierId];
                if (!modifier  modifier._enabled === false) return;
                const changes = this.parseObject(modifier.modifications);
                ['max', 'maxValue', 'maxValueFormula.flatValue'].forEach((key) = {
                    if (!Object.prototype.hasOwnProperty.call(changes, key)) return;
                    const candidate = this.toResourceInt(changes[key], 0);
                    if (candidate  max) max = candidate;
                });
            });
            return max;
        },

        buildBeaconResourceEntries(characterId, suppliedRoot) {
            const root = suppliedRoot && typeof suppliedRoot === 'object'  suppliedRoot  this.getStoreRoot(characterId);
            if (!root) return [];
            const integrants = this.getStoreIntegrants(root);
            const resources = [];
            Object.keys(integrants).forEach((id) = {
                const resource = integrants[id];
                if (!resource  resource._enabled === false  String(resource.type  '').toLowerCase() !== 'resource') return;
                const name = String(resource.name  '').trim();
                const recordName = String(resource.recordName  '').trim();
                const label = recordName  name  String(resource.builderDisplayName  '').trim();
                if (!label) return;
                const current = this.toResourceInt(resource.value, 0);
                let max = this.beaconResourceMax(resource, integrants);
                if (max = 0 && current  0) max = current;
                if (max = 0) return;
                resources.push({
                    label,
                    current,
                    max,
                    sheetVersion '2024',
                    name,
                    recordName,
                    shortID String(resource.shortID  '').trim(),
                    ref { kind 'beacon-resource', id String(resource._id  id), label, name, recordName, shortID String(resource.shortID  '').trim() }
                });
            });

            const currentByLevel = root.spellSlots && root.spellSlots.currentByLevel && typeof root.spellSlots.currentByLevel === 'object'
                 root.spellSlots.currentByLevel
                 {};
            const profiles = (typeof ActionService !== 'undefined' && ActionService && Utils.isFunction(ActionService.beaconSpellcastingProfiles))
                 ActionService.beaconSpellcastingProfiles(root)
                 [];
            const pactProfiles = profiles.filter((profile) = String(profile && profile.casterType  '').trim().toLowerCase() === 'pact');
            const hasStandardNonPactProfile = profiles.some((profile) = ^(fullhalfthird)$.test(String(profile && profile.casterType  '').trim().toLowerCase()));
            const pactOnlySlots = pactProfiles.length  0 && !hasStandardNonPactProfile;
            const pactSourceIds = Object.create(null);
            pactProfiles.forEach((profile) = {
                const sourceId = String(profile && profile.sourceID  '').trim();
                if (sourceId) pactSourceIds[sourceId] = true;
            });

             Normal spell-slot maxima exclude Pact Magic slot definitions. This
             prevents a Warlock's 2 Pact slots from being rendered as fake
             Lv1Lv2Lv3 resources while preserving normal slots for multiclass
             characters that also have a non-pact spellcasting progression.
            const maxima = Object.create(null);
            Object.keys(integrants).forEach((id) = {
                const slot = integrants[id];
                if (!slot  slot._enabled === false  String(slot.type  '').toLowerCase() !== 'spell slot') return;
                const slotSourceId = String(slot.sourceID  '').trim();
                if (pactOnlySlots  (slotSourceId && pactSourceIds[slotSourceId])) return;
                let level = this.toResourceInt(slot.spellLevel, 0);
                if (!level) {
                    const match = String(slot.recordName  slot.name  '').match(levels+(d+)s+spells+slotsi);
                    level = match  this.toResourceInt(match[1], 0)  0;
                }
                if (level  1  level  9) return;
                const value = this.flatFormulaValue(slot.valueFormula, 0);
                if (value = 0) return;
                const bucket = maxima[level]  { base 0, modify 0, other 0 };
                const calculation = String(slot.calculation  '').trim().toLowerCase();
                if (calculation === 'set base') bucket.base = Math.max(bucket.base, value);
                else if (calculation === 'modify') bucket.modify += value;
                else bucket.other = Math.max(bucket.other, value);
                maxima[level] = bucket;
            });

            const spellSlots = [];
            for (let level = 1; level = 9; level += 1) {
                const bucket = maxima[level]  { base 0, modify 0, other 0 };
                const max = this.toResourceInt(Math.max(bucket.base + bucket.modify, bucket.other), 0);
                if (max = 0) continue;
                const key = this.LEVEL_WORDS[level];
                const current = this.toResourceInt(currentByLevel[key], 0);
                spellSlots.push({
                    label 'Spell Slots Lv' + String(level),
                    current,
                    max,
                    sheetVersion '2024',
                    ref { kind 'beacon-spell', level, levelKey key, label 'Spell Slots Lv' + String(level) }
                });
            }

            const pactEntries = [];
            const pactProfile = pactProfiles.find((profile) = String(profile && profile.source  '').trim().toLowerCase() === 'class')  pactProfiles[0]  null;
            if (pactProfile) {
                const level = Math.max(0, this.toResourceInt(pactProfile.pactSlotLevel, 0));
                const current = Math.max(0, this.toResourceInt(pactProfile.pactSlotsCurrent, 0));
                const max = Math.max(0, this.toResourceInt(pactProfile.pactSlotMax, 0));
                const levelKey = this.LEVEL_WORDS[level]  '';
                if (level  0 && levelKey && max  0) {
                    const label = 'Pact Magic Lv' + String(level);
                    pactEntries.push({
                        label,
                        current,
                        max,
                        sheetVersion '2024',
                        ref { kind 'beacon-pact', level, levelKey, label }
                    });
                }
            }
            resources.sort((a, b) = String(a.label).localeCompare(String(b.label)));
            return pactEntries.concat(spellSlots, resources);
        },

        getEntries(characterId) {
            const sheetVersion = R20.detectSheetVersion(characterId);
            return sheetVersion === '2024'
                 this.buildBeaconResourceEntries(characterId)
                 this.buildLegacyResourceEntries(characterId);
        },

        resourceAdjustButtonHtml(tokenId, entry, direction) {
            if (!String(tokenId  '').trim()) return '';
            const isUse = direction === 'use';
            const payload = Utils.encodeJsonPayload(entry && entry.ref  {});
            const command = Render.sanitizeCommand('!combatAssistant resourceadjust ' + direction + ' ' + Utils.attrSafe(tokenId) + ' ' + payload + ' &#63;{Quantity1}');
            const tooltip = isUse  ('Use ' + String(entry && entry.label  'resource'))  ('Recover ' + String(entry && entry.label  'resource'));
            const symbol = isUse  '-'  '+';
            return 'a href=' + command + ' title=' + Utils.attrSafe(tooltip) + ' style=displayinline-flex;align-itemscenter;justify-contentcenter;width14px;height14px;min-width14px;min-height14px;max-height14px;padding0;margin0;overflowhidden;text-decorationnone;border0;border-radius3px;box-sizingborder-box;box-shadowinset 0 0 0 1px rgba(255,255,255,0.65);background' +
                (isUse  'rgba(150,45,45,0.95)'  'rgba(35,125,70,0.95)') + ';colorrgb(255,255,255);text-aligncenter;vertical-alignmiddle;line-height14px;' +
                'b style=displayflex;align-itemscenter;justify-contentcenter;width14px;height14px;margin0;padding0;text-aligncenter;font-size14px;line-height14px;font-familyArial,Helvetica,sans-serif;' + symbol + 'b' +
            'a';
        },

        buildResourceRowsHtml(tokenId, entries) {
            return (Array.isArray(entries)  entries  []).map((entry) = {
                const current = Math.max(0, Utils.toInt(entry && entry.current, 0));
                const max = Math.max(0, Utils.toInt(entry && entry.max, 0));
                const currentColor = current = 0
                     'rgb(220,45,45)'
                     (max  0 && current = max  'rgb(52,203,116)'  'rgb(235,205,75)');
                const valueHtml = 'b style=displayinline-block;padding-top2px;vertical-alignmiddle;font-size13px;line-height14px;span style=color' + currentColor + ';' + Utils.escapeHtml(String(entry.current)) + 'span span style=colorrgb(225,225,225);span ' +
                    'span style=colorrgb(52,203,116);' + Utils.escapeHtml(String(entry.max)) + 'spanb';
                const minus = this.resourceAdjustButtonHtml(tokenId, entry, 'use');
                const plus = this.resourceAdjustButtonHtml(tokenId, entry, 'recover');
                return 'tr' +
                    'td style=text-alignleft;vertical-alignmiddle;padding3px 4px 3px 0;colorrgb(232,220,180);font-size11px;line-height14px;overflow-wrapanywhere;' + Utils.escapeHtml(entry.label) + 'td' +
                    'td style=width104px;text-alignright;vertical-alignmiddle;padding3px 0;white-spacenowrap;font-size13px;line-height14px;' +
                        valueHtml + 'span style=displayinline-block;width5px;span' + minus + 'span style=displayinline-block;width3px;span' + plus +
                    'td' +
                'tr';
            }).join('');
        },

        buildResourceListHtml(tokenId, entries) {
            const rows = this.buildResourceRowsHtml(tokenId, entries);
            return rows  'table style=width100%;border-collapsecollapse;table-layoutfixed;tbody' + rows + 'tbodytable'  '';
        },

        buildResourcesCard(token, character, entries) {
            const tokenId = R20.getTokenId(token);
            const characterName = character && Utils.isFunction(character.get)  String(character.get('name')  'Character').trim()  'Character';
            const titleHtml = Html.span(Utils.escapeHtml(characterName), 'color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight900;') +
                Html.span('&#39;s Resources', 'colorrgb(235,235,235);font-weight900;');
            const resourceList = this.buildResourceListHtml(tokenId, entries);
            const body = resourceList  'div style=text-aligncenter;colorrgb(170,170,170);font-size11px;line-height14px;padding4px 0;No limited resources or spell slots were found.div';
            return Html.card({
                title characterName + 's Resources,
                body,
                buildOptions { titleHtml, titleColor 'rgb(235,235,235)', bodyAlign 'left' }
            });
        },

        findRepresentativeToken(characterId, ctx) {
            const safeCharacterId = String(characterId  '').trim();
            if (!safeCharacterId) return null;
            const pageId = R20.getPlayerPageId(ctx && ctx.playerId  '');
            const pageToken = pageId  R20.findTokenByCharacterIdOnPage(safeCharacterId, pageId)  null;
            if (pageToken) return pageToken;
            const tokens = R20.getTokensByCharacterId(safeCharacterId);
            return tokens[0]  null;
        },

        showForContext(ctx, args) {
            const tokens = R20.getSelectedTokens(ctx && ctx.msg);
            let sent = 0;

             Selection always wins. This preserves the original multi-token
             behavior even if a name was also typed after the command.
            if (tokens.length) {
                tokens.forEach((token) = {
                    if (!ctx.isGM && !R20.tokenIsControlledByPlayer(token, R20.getCharacterFromToken(token), ctx.playerId)) return;
                    const info = this.getCharacterContext(token);
                    if (!info.characterId  !info.character) return;
                    R20.whisper(ctx.who  'GM', this.buildResourcesCard(token, info.character, this.getEntries(info.characterId)));
                    sent += 1;
                });
                if (!sent) {
                    Render.sendWhisperMessage(ctx && ctx.who  'GM', 'Resources', 'No selected token with an accessible linked character sheet was found.', 'warning');
                    return false;
                }
                return true;
            }

            const characterName = (Array.isArray(args)  args  [args])
                .map((value) = String(value  '').trim())
                .filter(Boolean)
                .join(' ')
                .trim();
            if (!characterName) {
                Render.sendWhisperMessage(ctx && ctx.who  'GM', 'Resources', 'Select a linked token or use code!ca resources &quot;Character Name&quot;code.', 'warning');
                return false;
            }

            const character = R20.getCharacterByName(characterName);
            if (!character) {
                Render.sendWhisperMessage(ctx && ctx.who  'GM', 'Resources', 'No character sheet named strong' + Utils.escapeHtml(characterName) + 'strong was found.', 'warning');
                return false;
            }
            const characterId = String(character.id  (Utils.isFunction(character.get)  character.get('_id')  '')  '').trim();
            const token = this.findRepresentativeToken(characterId, ctx);
            if (!ctx.isGM) {
                const controlled = token
                     R20.tokenIsControlledByPlayer(token, character, ctx.playerId)
                     !!R20.getCharacterAccessFlags(character, ctx.playerId, false).controlAccess;
                if (!controlled) {
                    Render.sendWhisperMessage(ctx.who, 'Resources', 'You do not control that character.', 'warning');
                    return false;
                }
            }
            R20.whisper(ctx.who  'GM', this.buildResourcesCard(token, character, this.getEntries(characterId)));
            return true;
        },

        resolveLegacyRef(characterId, ref) {
            const attrs = this.getLegacyAttributes(characterId);
            const map = this.legacyAttributeMap(attrs);
            const valueAttrName = String(ref && ref.valueAttr  '').trim();
            const valueAttr = map[valueAttrName.toLowerCase()]  null;
            let max = 0;
            let current = 0;
            if (String(ref && ref.kind) === 'legacy-spell') {
                const maxAttrName = String(ref && ref.maxAttr  '').trim();
                max = this.toResourceInt(this.legacyAttributeCurrent(map[maxAttrName.toLowerCase()], 0), 0);
                const raw = valueAttr  this.legacyAttributeCurrent(valueAttr, '')  '';
                current = raw === ''  max  this.toResourceInt(raw, max);
            } else {
                current = this.toResourceInt(this.legacyAttributeCurrent(valueAttr, 0), 0);
                max = this.legacyAttributeMax(valueAttr, map, valueAttrName, characterId);
            }
            return { current, max, valueAttrName, valueAttr, label String(ref && ref.label  'Resource') };
        },

        writeLegacyCurrent(characterId, attrName, value) {
            const safeCharacterId = String(characterId  '').trim();
            const safeAttrName = String(attrName  '').trim();
            const safeValue = String(this.toResourceInt(value, 0));
            if (!safeCharacterId  !safeAttrName) return false;
            const attrs = this.getLegacyAttributes(safeCharacterId);
            let attr = attrs.find((entry) = entry && Utils.isFunction(entry.get) && String(entry.get('name')  '').trim().toLowerCase() === safeAttrName.toLowerCase())  null;
            try {
                if (!attr && typeof createObj === 'function') {
                    attr = createObj('attribute', { _characterid safeCharacterId, name safeAttrName, current safeValue });
                }
                if (!attr) return false;
                if (Utils.isFunction(attr.setWithWorker)) attr.setWithWorker({ current safeValue });
                else if (Utils.isFunction(attr.set)) attr.set('current', safeValue);
                else return false;
                return true;
            } catch (error) {
                Logger.debug('[resourcelegacy-write]', safeAttrName, error && error.message  error.message  String(error));
                return false;
            }
        },

        resolveBeaconRef(characterId, ref, suppliedRoot) {
            const entries = this.buildBeaconResourceEntries(characterId, suppliedRoot);
            const kind = String(ref && ref.kind  '');
            if (kind === 'beacon-resource') {
                const id = String(ref && ref.id  '').trim();
                return entries.find((entry) = entry.ref && entry.ref.kind === kind && String(entry.ref.id  '').trim() === id)  null;
            }
            if (kind === 'beacon-spell'  kind === 'beacon-pact') {
                const level = this.toResourceInt(ref && ref.level, 0);
                return entries.find((entry) = entry.ref && entry.ref.kind === kind && this.toResourceInt(entry.ref.level, 0) === level)  null;
            }
            return null;
        },

        parseBeaconStoreRoot(value) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                try {
                    return JSON.parse(JSON.stringify(value));
                } catch (error) {
                    return null;
                }
            }
            const raw = String(value === undefined  value === null  ''  value).trim();
            if (!raw) return null;
            try {
                const parsed = JSON.parse(raw);
                return parsed && typeof parsed === 'object' && !Array.isArray(parsed)  parsed  null;
            } catch (error) {
                return null;
            }
        },

        getBeaconStoreAttribute(characterId) {
            const safeCharacterId = String(characterId  '').trim();
            if (!safeCharacterId) return null;
            return (findObjs({
                _type 'attribute',
                _characterid safeCharacterId,
                name 'store'
            })  [])[0]  null;
        },

        storeUtf8ByteLength(value) {
            const text = String(value  '');
            let bytes = 0;
            for (let i = 0; i  text.length; i += 1) {
                const code = text.charCodeAt(i);
                if (code  0x80) bytes += 1;
                else if (code  0x800) bytes += 2;
                else if (code = 0xD800 && code = 0xDBFF && i + 1  text.length) {
                    const next = text.charCodeAt(i + 1);
                    if (next = 0xDC00 && next = 0xDFFF) {
                        bytes += 4;
                        i += 1;
                    } else bytes += 3;
                } else bytes += 3;
            }
            return bytes;
        },

        async readFreshBeaconStore(characterId) {
            const safeCharacterId = String(characterId  '').trim();
            const rootAttr = this.getBeaconStoreAttribute(safeCharacterId);
            if (!rootAttr  !Utils.isFunction(rootAttr.get)) {
                return { ok false, message 'The 2024 character has no writable store attribute.' };
            }

            const attributeCurrent = rootAttr.get('current');
            let rawCurrent = attributeCurrent;
            let root = this.parseBeaconStoreRoot(attributeCurrent);

            if (typeof getSheetItem === 'function') {
                try {
                    const freshValue = await getSheetItem(safeCharacterId, 'store');
                    const freshRoot = this.parseBeaconStoreRoot(freshValue);
                    if (freshRoot) {
                        rawCurrent = freshValue;
                        root = freshRoot;
                    }
                } catch (error) {
                    Logger.debug('[resourcebeacon-store-read]', 'Fresh store read failed; using the attribute value.');
                }
            }

            if (!root) return { ok false, message 'The 2024 character store is not valid JSON.' };
            return {
                ok true,
                rootAttr,
                root,
                mode rawCurrent && typeof rawCurrent === 'object' && !Array.isArray(rawCurrent)  'object'  'json-string',
                baselineJson JSON.stringify(root)
            };
        },

        beaconStoreIsBaselineCurrent(storeEntry) {
            if (!storeEntry  !storeEntry.rootAttr  !Utils.isFunction(storeEntry.rootAttr.get)  !storeEntry.baselineJson) return false;
            const currentRoot = this.parseBeaconStoreRoot(storeEntry.rootAttr.get('current'));
            if (!currentRoot) return false;
            try {
                return JSON.stringify(currentRoot) === storeEntry.baselineJson;
            } catch (error) {
                return false;
            }
        },

        serializeBeaconStore(storeEntry) {
            if (!storeEntry  !storeEntry.rootAttr  !storeEntry.root  typeof storeEntry.root !== 'object') {
                return { ok false, message 'The 2024 character store is invalid.' };
            }
            let json = '';
            try {
                json = JSON.stringify(storeEntry.root);
                const parsed = JSON.parse(json);
                if (!parsed  typeof parsed !== 'object'  Array.isArray(parsed)) {
                    return { ok false, message 'The 2024 character store could not be serialized safely.' };
                }
            } catch (error) {
                return { ok false, message 'The 2024 character store could not be serialized safely.' };
            }
            const bytes = this.storeUtf8ByteLength(json);
            if (bytes  this.MAX_STORE_BYTES) {
                return { ok false, message 'The 2024 character store is too large to write safely (' + String(bytes) + ' bytes).' };
            }
            return {
                ok true,
                json,
                bytes,
                value storeEntry.mode === 'object'  storeEntry.root  json
            };
        },

        waitForBeaconWorker(timeoutMs) {
            const timeout = Math.max(250, this.toResourceInt(timeoutMs, this.SHEET_WORKER_TIMEOUT_MS));
            if (typeof onSheetWorkerCompleted !== 'function') return Promise.resolve(false);
            return new Promise((resolve) = {
                let finished = false;
                const finish = (value) = {
                    if (finished) return;
                    finished = true;
                    resolve(value);
                };
                try {
                    onSheetWorkerCompleted(() = finish(true));
                    setTimeout(() = finish(false), timeout);
                } catch (error) {
                    finish(false);
                }
            });
        },

        applyBeaconStoreValue(root, ref, value) {
            const kind = String(ref && ref.kind  '').trim();
            const safeValue = this.toResourceInt(value, 0);
            if (kind === 'beacon-resource') {
                const integrants = this.getStoreIntegrants(root);
                const id = String(ref && ref.id  '').trim();
                const node = id  integrants[id]  null;
                if (!node  String(node.type  '').trim().toLowerCase() !== 'resource') {
                    return { ok false, message 'The 2024 resource no longer exists in the character store.' };
                }
                node.value = safeValue;
                return { ok true };
            }
            if (kind === 'beacon-spell'  kind === 'beacon-pact') {
                const level = this.toResourceInt(ref && ref.level, 0);
                const levelKey = String(ref && ref.levelKey  this.LEVEL_WORDS[level]  '').trim();
                if (level  1  level  9  !levelKey) {
                    return { ok false, message 'The 2024 spell slot reference is invalid.' };
                }
                root.spellSlots = root.spellSlots && typeof root.spellSlots === 'object'  root.spellSlots  {};
                const bucketName = kind === 'beacon-pact'  'currentPactByLevel'  'currentByLevel';
                root.spellSlots[bucketName] = root.spellSlots[bucketName] && typeof root.spellSlots[bucketName] === 'object'
                     root.spellSlots[bucketName]
                     {};
                root.spellSlots[bucketName][levelKey] = safeValue;
                return { ok true };
            }
            return { ok false, message 'The 2024 resource reference is invalid.' };
        },

        readBeaconStoreValue(root, ref) {
            const kind = String(ref && ref.kind  '').trim();
            if (kind === 'beacon-resource') {
                const integrants = this.getStoreIntegrants(root);
                const id = String(ref && ref.id  '').trim();
                const node = id  integrants[id]  null;
                if (!node  String(node.type  '').trim().toLowerCase() !== 'resource') return null;
                const value = parseInt(node.value, 10);
                return Number.isNaN(value)  null  Math.max(0, value);
            }
            if (kind === 'beacon-spell'  kind === 'beacon-pact') {
                const level = this.toResourceInt(ref && ref.level, 0);
                const levelKey = String(ref && ref.levelKey  this.LEVEL_WORDS[level]  '').trim();
                const bucketName = kind === 'beacon-pact'  'currentPactByLevel'  'currentByLevel';
                const currentByLevel = root && root.spellSlots && root.spellSlots[bucketName];
                if (!currentByLevel  typeof currentByLevel !== 'object'  !levelKey) return null;
                const value = parseInt(currentByLevel[levelKey], 10);
                return Number.isNaN(value)  null  Math.max(0, value);
            }
            return null;
        },

        verifyBeaconStoreValue(rootAttr, ref, expectedValue) {
            if (!rootAttr  !Utils.isFunction(rootAttr.get)) return { ok false, message 'The 2024 store could not be verified after writing.' };
            const root = this.parseBeaconStoreRoot(rootAttr.get('current'));
            if (!root) return { ok false, message 'The 2024 store could not be read after writing.' };
            const actual = this.readBeaconStoreValue(root, ref);
            if (actual === null  actual !== this.toResourceInt(expectedValue, 0)) {
                return { ok false, message 'The 2024 resource write did not match the requested value.', actual };
            }
            return { ok true, actual };
        },

        async writeBeaconStoreValue(storeEntry, ref, value) {
            if (!storeEntry  !storeEntry.ok) return storeEntry  { ok false, message 'The 2024 store is unavailable.' };
            const applied = this.applyBeaconStoreValue(storeEntry.root, ref, value);
            if (!applied.ok) return applied;
            const serialized = this.serializeBeaconStore(storeEntry);
            if (!serialized.ok) return serialized;

             Same defensive pattern used by Resource Quick Manager refuse to
             overwrite a store that changed after the fresh read.
            if (!this.beaconStoreIsBaselineCurrent(storeEntry)) {
                return { ok false, message 'The character sheet changed during this resource update. No 2024 resource write was made; try again.' };
            }

            const attr = storeEntry.rootAttr;
            try {
                if (Utils.isFunction(attr.setWithWorker)) {
                    const workerPromise = this.waitForBeaconWorker(this.SHEET_WORKER_TIMEOUT_MS);
                    attr.setWithWorker({ current serialized.value });
                    await workerPromise;
                } else if (Utils.isFunction(attr.set)) {
                    attr.set({ current serialized.value });
                } else {
                    return { ok false, message 'The 2024 store attribute cannot be written.' };
                }
            } catch (error) {
                Logger.debug('[resourcebeacon-store-write]', error && error.message  error.message  String(error));
                return { ok false, message 'Roll20 rejected the 2024 resource store update.' };
            }

            const verified = this.verifyBeaconStoreValue(attr, ref, value);
            if (!verified.ok) return verified;
            return { ok true, actual verified.actual, bytes serialized.bytes };
        },

        calculateChange(current, max, direction, requested) {
            const safeCurrent = this.toResourceInt(current, 0);
            const safeMax = this.toResourceInt(max, 0);
            const qty = Math.max(1, this.toResourceInt(requested, 1));
            if (direction === 'use') {
                if (safeCurrent = 0) return { ok false, message 'No uses remain.' };
                const effective = Math.min(qty, safeCurrent);
                return { ok true, current safeCurrent, max safeMax, effective, next Math.max(0, safeCurrent - effective) };
            }
            if (safeMax = 0) return { ok false, message 'This resource does not expose a usable maximum.' };
            if (safeCurrent = safeMax) return { ok false, message 'This resource is already at its maximum.' };
            const effective = Math.min(qty, Math.max(0, safeMax - safeCurrent));
            return { ok true, current safeCurrent, max safeMax, effective, next Math.min(safeMax, safeCurrent + effective) };
        },

        buildResourceUpdateCard(token, character, label, direction, quantity, current, max) {
            const characterName = character && Utils.isFunction(character.get)  String(character.get('name')  'Character').trim()  'Character';
            const imgsrc = token && Utils.isFunction(token.get)  String(token.get('imgsrc')  '').trim()  '';
            const avatar = character && Utils.isFunction(character.get)  String(character.get('avatar')  '').trim()  '';
            const renderedImage = Render.chatTokenImageHtml(imgsrc, 28, avatar, 4);
            const image = renderedImage  'span style=displayblock;width28px;height28px;line-height28px;text-aligncenter;border-radius4px;backgroundrgba(55,55,55,0.95);font-size12px;span';
            const titleHtml = 'table style=width100%;border-collapsecollapse;table-layoutfixed;tbodytr' +
                'td style=width34px;text-alignleft;vertical-alignmiddle;' + image + 'td' +
                'td style=text-aligncenter;vertical-alignmiddle;font-weight900;colorrgb(235,235,235);padding-right34px;Resource Updatetd' +
                'trtbodytable';
            const currentColor = current  0  'rgb(52,203,116)'  'rgb(220,45,45)';
            const verb = direction === 'use'  'Used'  'Recover';
            const body = 'div style=text-aligncenter;font-size12px;line-height17px;colorrgb(225,225,225);' +
                'div style=color' + CONFIG.DEFAULT_TEXT_CHARACTER_COLOR + ';font-weight900;' + Utils.escapeHtml(characterName) + 'div' +
                'div' + Utils.escapeHtml(verb) + ' span style=colorrgb(52,203,116);font-weight900;' + Utils.escapeHtml(String(quantity)) + 'xspan ' +
                    'span style=colorrgb(245,220,80);font-weight900;' + Utils.escapeHtml(label) + 'spandiv' +
                'divHas span style=color' + currentColor + ';font-weight900;' + Utils.escapeHtml(String(current)) + 'span span style=colorrgb(225,225,225);font-weight900;span ' +
                    'span style=colorrgb(52,203,116);font-weight900;' + Utils.escapeHtml(String(max)) + 'span left.div' +
                'div';
            return Html.card({ title 'Resource Update', body, buildOptions { titleHtml } });
        },

        sendResourceUpdate(token, character, label, direction, quantity, current, max, ctx) {
            const card = this.buildResourceUpdateCard(token, character, label, direction, quantity, current, max);
            const playerInitiated = !!(ctx && ctx.isGM === false);
            if (playerInitiated && RuntimeConfig.get('PLAYER_PUBLIC_RESOURCE_USAGE')) {
                R20.send(card);
                return true;
            }
            R20.whisper('GM', card);
            if (R20.isPlayerControlledToken(token, character)) {
                R20.getTokenControllerDisplayNames(token, character).forEach((recipient) = {
                    if (recipient) R20.whisper(recipient, card);
                });
            }
            return true;
        },

        async adjust(ctx, args) {
            const direction = String(args && args[0]  '').trim().toLowerCase();
            const tokenId = String(args && args[1]  '').trim();
            const ref = Utils.decodeJsonPayload(args && args[2]  '', {});
            const quantity = Math.max(1, this.toResourceInt(args && args[3], 1));
            if (direction !== 'use' && direction !== 'recover') {
                Render.sendWhisperMessage(ctx.who, 'Resources', 'Unknown resource adjustment.', 'failure');
                return false;
            }
            const token = R20.getTokenById(tokenId);
            if (!token) {
                Render.sendWhisperMessage(ctx.who, 'Resources', 'The resource token was not found.', 'failure');
                return false;
            }
            if (!ctx.isGM && !R20.tokenIsControlledByPlayer(token, R20.getCharacterFromToken(token), ctx.playerId)) {
                Render.sendWhisperMessage(ctx.who, 'Permission Denied', 'You do not control this token.', 'failure');
                return false;
            }
            const info = this.getCharacterContext(token);
            if (!info.character  !info.characterId) {
                Render.sendWhisperMessage(ctx.who, 'Resources', 'This token is not linked to a character sheet.', 'failure');
                return false;
            }
            const kind = String(ref && ref.kind  '');
            if (^legacy-.test(kind)) {
                const trustedEntry = this.buildLegacyResourceEntries(info.characterId).find((entry) = {
                    const trustedRef = entry && entry.ref  {};
                    return String(trustedRef.kind  '') === kind &&
                        String(trustedRef.valueAttr  '').trim().toLowerCase() === String(ref && ref.valueAttr  '').trim().toLowerCase();
                })  null;
                if (!trustedEntry) {
                    Render.sendWhisperMessage(ctx.who, 'Resources', 'Invalid or stale 2014 resource reference. Re-open !ca resource.', 'warning');
                    return false;
                }
                const trustedRef = trustedEntry.ref;
                const snapshot = this.resolveLegacyRef(info.characterId, trustedRef);
                snapshot.label = trustedEntry.label;
                const change = this.calculateChange(snapshot.current, snapshot.max, direction, quantity);
                if (!change.ok) {
                    Render.sendWhisperMessage(ctx.who, 'Resources', Utils.escapeHtml(snapshot.label + ' ' + change.message), 'warning');
                    return false;
                }
                if (!this.writeLegacyCurrent(info.characterId, snapshot.valueAttrName, change.next)) {
                    Render.sendWhisperMessage(ctx.who, 'Resources', 'The 2014 sheet resource could not be updated.', 'failure');
                    return false;
                }
                const verified = this.resolveLegacyRef(info.characterId, trustedRef);
                const finalCurrent = verified.current;
                this.sendResourceUpdate(token, info.character, snapshot.label, direction, change.effective, finalCurrent, verified.max  change.max, ctx);
                return true;
            }

            if (^beacon-.test(kind)) {
                return CombatService.runTokenMutation(token, async () = {
                    const storeEntry = await this.readFreshBeaconStore(info.characterId);
                    if (!storeEntry  !storeEntry.ok) {
                        Render.sendWhisperMessage(ctx.who, 'Resources', Utils.escapeHtml((storeEntry && storeEntry.message)  'The 2024 character store could not be read.'), 'warning');
                        return false;
                    }
                    const entry = this.resolveBeaconRef(info.characterId, ref, storeEntry.root);
                    if (!entry) {
                        Render.sendWhisperMessage(ctx.who, 'Resources', 'The 2024 sheet resource could not be found anymore. Re-open !ca resource.', 'warning');
                        return false;
                    }
                    const change = this.calculateChange(entry.current, entry.max, direction, quantity);
                    if (!change.ok) {
                        Render.sendWhisperMessage(ctx.who, 'Resources', Utils.escapeHtml(entry.label + ' ' + change.message), 'warning');
                        return false;
                    }
                    const writeResult = await this.writeBeaconStoreValue(storeEntry, entry.ref, change.next);
                    if (!writeResult  !writeResult.ok) {
                        Render.sendWhisperMessage(ctx.who, 'Resources', Utils.escapeHtml((writeResult && writeResult.message)  'The 2024 resource store update failed.'), 'warning');
                        return false;
                    }
                    this.sendResourceUpdate(token, info.character, entry.label, direction, change.effective, writeResult.actual, entry.max, ctx);
                    return true;
                });
            }

            Render.sendWhisperMessage(ctx.who, 'Resources', 'Invalid resource reference. Re-open !ca resource.', 'failure');
            return false;
        }
    };

     -----------------------------------------------------------------------
      Commands
      --------------------------------------------------------------------- 
    const CommandHandlers = {
        getTargetToken(ctx, tokenIdArg) {
            const explicitId = String(tokenIdArg  '').trim();
            if (explicitId) {
                const token = R20.getTokenById(explicitId);
                if (token) return token;
            }
            const selected = R20.getSelectedTokens(ctx.msg);
            return selected[0]  null;
        },

        getTargetTokens(ctx, tokenIdArg) {
            const explicitId = String(tokenIdArg  '').trim();
            if (explicitId) {
                const token = R20.getTokenById(explicitId);
                return token  [token]  [];
            }
            const selected = R20.getSelectedTokens(ctx.msg);
            if (selected.length) return selected;
            const fallback = this.getTargetToken(ctx, '');
            return fallback  [fallback]  [];
        },

        ensureApplyPermission(ctx) {
            if (ctx.isGM) return { ok true };
            const action = String(ctx && ctx.actionType  '').toLowerCase();
            if (!ctx.fromPlayerAction) return { ok false, message 'Only generated player action buttons can apply this action.' };
            if (action === 'heal' && RuntimeConfig.get('PLAYER_HEALING_BUTTON')) return { ok true };
            if (action === 'damage' && RuntimeConfig.get('PLAYER_ATTACK_BUTTON')) return { ok true };
            return { ok false, message 'This action is not enabled for players.' };
        },

        isPlayerAllowedAction(action) {
            return !!PLAYER_ALLOWED_ACTIONS[String(action  '').trim().toLowerCase()];
        },


        canUsePlayerActionRequest(ctx, request) {
            if (ctx.isGM) return true;
            const payload = request && request.payload  request.payload  {};
            const sourceTokenId = String(request && request.sourceTokenId  payload.casterTokenId  '').trim();
            const sourceCharacterId = String(request && request.sourceCharacterId  request && request.characterId  payload.casterCharacterId  '').trim();
            const sourceToken = sourceTokenId  R20.getTokenById(sourceTokenId)  null;
            const sourceCharacter = sourceToken
                 R20.getCharacterFromToken(sourceToken)
                 (sourceCharacterId  getObj('character', sourceCharacterId)  null);
            if (sourceToken && R20.tokenIsControlledByPlayer(sourceToken, sourceCharacter, ctx.playerId)) return true;
            const access = R20.getCharacterAccessFlags(sourceCharacter, ctx.playerId, ctx.isGM);
            return !!access.controlAccess;
        },

        getNativeRollRecipients(token, character) {
            const playerRecipients = R20.isPlayerControlledToken(token, character)  R20.getTokenControllerDisplayNames(token, character)  [];
            return Utils.uniqueNames(['GM'].concat(playerRecipients));
        },

        resolvePlayerActionSourceOnTargetPage(request, targetToken) {
            const payload = request && request.payload  request.payload  {};
            const characterId = String(payload.casterCharacterId  request.sourceCharacterId  request.characterId  '').trim();
            const targetPageId = R20.getTokenPageId(targetToken);
            const explicitSourceId = String(payload.casterTokenId  request.sourceTokenId  '').trim();
            const explicitSource = R20.getTokenById(explicitSourceId);
            if (explicitSource && (!targetPageId  R20.getTokenPageId(explicitSource) === targetPageId)) {
                const explicitCharacter = R20.getCharacterFromToken(explicitSource);
                const explicitCharacterId = String((explicitCharacter && explicitCharacter.id)  explicitSource.get('represents')  characterId  '').trim();
                payload.casterTokenId = R20.getTokenId(explicitSource);
                payload.casterCharacterId = explicitCharacterId;
                payload.casterPageId = R20.getTokenPageId(explicitSource);
                payload.sourceImgsrc = String(explicitSource.get('imgsrc')  payload.sourceImgsrc  '');
                request.sourceTokenId = payload.casterTokenId;
                request.sourceCharacterId = explicitCharacterId;
                request.sourcePageId = payload.casterPageId;
                return explicitSource;
            }
            if (explicitSourceId) return null;
            if (!characterId  !targetPageId) return null;
            const samePageToken = R20.findTokenByCharacterIdOnPage(characterId, targetPageId);
            const sourceToken = samePageToken  explicitSource;
            if (!sourceToken) return null;
            payload.casterTokenId = R20.getTokenId(sourceToken);
            payload.casterCharacterId = characterId;
            payload.casterPageId = R20.getTokenPageId(sourceToken);
            payload.sourceImgsrc = String(sourceToken.get('imgsrc')  payload.sourceImgsrc  '');
            request.sourceTokenId = payload.casterTokenId;
            request.sourceCharacterId = characterId;
            request.sourcePageId = payload.casterPageId;
            return sourceToken;
        },

        createNativeRollPlan(tokens, macroName, options) {
            const safeOptions = options  {};
            const safeMacroName = String(macroName  '').trim();
            const trackInitiative = Utils.toBoolean(safeOptions.trackInitiative, false);
            return {
                options safeOptions,
                safeMacroName,
                trackInitiative,
                initiativeBatchId trackInitiative  RollParser.createPendingNativeInitiativeBatch(tokens)  '',
                isInitiativeRoll safeMacroName.toLowerCase() === 'initiative',
                autoRolls [],
                playerRolls [],
                batchRolls [],
                ca2014PlainRolls [],
                ca2014InitiativeRolls [],
                failed [],
                individual 0
            };
        },

        getNativeRollCommandSet(characterId, plan) {
            if (plan.options.saveAbility) {
                return CombatService.getNativeSaveCommandSet(characterId, plan.options.saveAbility);
            }
            const sheetVersion = R20.detectSheetVersion(characterId);
            const requiresButton = plan.isInitiativeRoll && sheetVersion === '2014';
            return {
                macroName plan.safeMacroName,
                buttonCommand R20.buttonAbilityCommand(characterId, plan.safeMacroName),
                nativeCommand requiresButton  ''  R20.chatAbilityCommand(characterId, plan.safeMacroName),
                batchCommand R20.chatAbilityCommand(characterId, plan.safeMacroName),
                sheetVersion,
                requiresButton
            };
        },

        classifyNativeRollToken(token, plan) {
            if (!token) {
                plan.failed.push('Target token was not found.');
                return;
            }
            const character = R20.getCharacterFromToken(token);
            if (!character) {
                plan.failed.push(CombatService.getTokenName(token) + ' must be linked to a character.');
                return;
            }
            const characterId = String(character.id  token.get('represents')  '').trim();
            if (!characterId) {
                plan.failed.push(CombatService.getTokenName(token) + ' has no character id.');
                return;
            }

            const tokenId = R20.getTokenId(token);
            const tokenName = CombatService.getTokenName(token);
            const characterName = String(character.get('name')  tokenName  'Token').trim();
            const commandSet = this.getNativeRollCommandSet(characterId, plan);
            const playerCommand = String(commandSet.buttonCommand  '').trim();
            const nativeCommand = String(commandSet.nativeCommand  '').trim();
            const batchCommand = String(commandSet.batchCommand  nativeCommand  '').trim();
            if (!batchCommand  (!commandSet.requiresButton && !playerCommand)) {
                plan.failed.push(tokenName + ' native roll command could not be resolved.');
                return;
            }

            const common = {
                tokenId,
                tokenName,
                characterName,
                command playerCommand,
                nativeCommand,
                batchCommand,
                tokenControlledBy String(token.get('controlledby')  ''),
                characterControlledBy String(character.get('controlledby')  ''),
                sheetVersion commandSet.sheetVersion
            };

            if (plan.options.saveAbility && commandSet.sheetVersion === '2014' && RuntimeConfig.get('SHEET_2014_CA_ROLLS')) {
                plan.ca2014PlainRolls.push(common);
                return;
            }

            if (plan.trackInitiative) {
                common.requestId = RollParser.createPendingNativeInitiative({
                    tokenId,
                    characterId,
                    characterName,
                    tokenName,
                    batchId plan.initiativeBatchId
                });
            }

            const shouldAskPlayer = R20.isPlayerControlledToken(token, character) &&
                RuntimeConfig.get('PLAYER_MANUAL_ROLL') &&
                !!playerCommand;
            if (shouldAskPlayer) {
                plan.playerRolls.push({
                    recipients this.getNativeRollRecipients(token, character),
                    card Render.showNativeSheetRollRequest({
                        title plan.options.individualTitle  plan.options.title  'Roll20 Roll',
                        tokenName,
                        rollName plan.options.rollName  plan.safeMacroName,
                        label plan.options.label  'Roll',
                        iconHtml plan.options.iconHtml  '&#127922;',
                        command playerCommand,
                        tooltip plan.options.tooltip  ('Roll ' + plan.safeMacroName)
                    })
                });
                plan.individual += 1;
                return;
            }

            if (plan.trackInitiative && plan.isInitiativeRoll && commandSet.sheetVersion === '2014' && RuntimeConfig.get('SHEET_2014_CA_ROLLS')) {
                common.batchId = plan.initiativeBatchId;
                plan.ca2014InitiativeRolls.push(common);
                return;
            }

            if (commandSet.requiresButton) plan.batchRolls.push(common);
            else plan.autoRolls.push(common);
        },

        resolveImmediate2014Rolls(plan) {
            const abilityLabel = CombatService.abilityNameToShortLabel(plan.options.saveAbility  '') 
                String(plan.options.label  'SAVE').toUpperCase();

            if (plan.options.rollMode && plan.ca2014InitiativeRolls.length) {
                const results = [];
                plan.ca2014InitiativeRolls.forEach((roll) = {
                    const token = R20.getTokenById(roll.tokenId);
                    const result = CombatService.rollInitiativeForToken(token, plan.options.rollMode);
                    RollParser.removePendingNativeInitiativeById(roll.requestId);
                    if (!result.ok) {
                        plan.failed.push(result.message  'Initiative roll failed.');
                        return;
                    }
                    results.push(result);
                    if (plan.trackInitiative && roll.batchId) {
                        RollParser.recordPendingNativeInitiativeResult(result.tokenId, result.total, roll.batchId, roll.requestId);
                    }
                });
                if (results.length) R20.direct(Render.showInitiativeResults(results));
            }

            if (plan.options.rollMode && plan.ca2014PlainRolls.length) {
                const results = [];
                plan.ca2014PlainRolls.forEach((roll) = {
                    const token = R20.getTokenById(roll.tokenId);
                    const result = CombatService.rollSavingThrowForToken(token, plan.options.saveAbility, plan.options.rollMode);
                    if (result.ok) results.push(result);
                    else plan.failed.push(result.message  'Saving throw failed.');
                });
                if (results.length) R20.direct(Render.showSavingThrowResults(results, abilityLabel));
            }
        },

        sendPlayerNativeRollRequests(plan) {
            plan.playerRolls.forEach((roll) = {
                const recipients = Array.isArray(roll.recipients) && roll.recipients.length  roll.recipients  ['GM'];
                recipients.forEach((recipient) = R20.whisper(recipient, roll.card));
            });
        },

        send2014NativeRollRequests(plan) {
            const abilityLabel = CombatService.abilityNameToShortLabel(plan.options.saveAbility  '') 
                String(plan.options.label  'SAVE').toUpperCase();

            if (!plan.options.rollMode && plan.ca2014InitiativeRolls.length) {
                R20.whisper('GM', Render.showNativeBatchRollRequest({
                    title '2014 Initiative Rolls',
                    intro 'Roll strongInitiativestrong for',
                    names plan.ca2014InitiativeRolls.map((roll) = roll.tokenName  roll.characterName  'Token'),
                    label 'Init',
                    iconHtml plan.options.iconHtml  '&#127922;',
                    command '!combatAssistant roll2014init &#63;{Roll ModeAuto,autoNormal,normalAdvantage,advantageDisadvantage,disadvantage} ' +
                        Utils.encodeJsonPayload({
                            batchId plan.initiativeBatchId,
                            rolls plan.ca2014InitiativeRolls.map((roll) = ({
                                tokenId roll.tokenId,
                                requestId roll.requestId
                            })).filter((roll) = roll.tokenId)
                        }),
                    tooltip 'Roll all listed 2014 initiatives with Combat Assistant'
                }));
            }

            if (!plan.options.rollMode && plan.ca2014PlainRolls.length) {
                R20.whisper('GM', Render.showNativeBatchRollRequest({
                    title '2014 ' + abilityLabel + ' Saving Throws',
                    intro 'Roll strong' + Utils.escapeHtml(abilityLabel) + 'strong saving throws',
                    names plan.ca2014PlainRolls.map((roll) = roll.tokenName  roll.characterName  'Token'),
                    label 'Roll',
                    iconHtml plan.options.iconHtml  '&#127922;',
                    command '!combatAssistant roll2014plain &#63;{Roll ModeNormal,normalAdvantage,advantageDisadvantage,disadvantage} ' +
                        Utils.encodeJsonPayload({
                            ability plan.options.saveAbility,
                            tokenIds plan.ca2014PlainRolls.map((roll) = roll.tokenId).filter(Boolean)
                        }),
                    tooltip 'Roll all listed 2014 saving throws with Combat Assistant'
                }));
            }
        },

        sendNativeBatchRequest(plan) {
            if (!plan.batchRolls.length) return;
            const batch = R20.createNativeRollBatchAbility(
                plan.batchRolls.map((roll) = R20.nativeBatchExecutionCommand(roll))
            );
            if (!batch.ok) {
                const message = batch.message  'Could not create Roll All button.';
                plan.failed.push(message);
                Render.sendWhisperMessage('GM', 'Roll20 Rolls', message, 'failure');
                return;
            }
            R20.whisper('GM', Render.showNativeBatchRollRequest({
                title plan.options.batchTitle  plan.options.title  'Roll20 Rolls',
                intro plan.options.batchIntro  'Roll for',
                names plan.batchRolls.map((roll) = roll.tokenName  roll.characterName  'Token'),
                label plan.options.batchLabel  'Roll All',
                iconHtml plan.options.iconHtml  '&#127922;',
                command batch.command,
                tooltip plan.options.batchTooltip  'Roll all listed tokens'
            }));
        },

        sendDeferredNativeRollRequests(plan) {
            this.sendPlayerNativeRollRequests(plan);
            this.send2014NativeRollRequests(plan);
            this.sendNativeBatchRequest(plan);
        },

        scheduleNativeRollPlan(plan) {
            const sendDeferred = () = this.sendDeferredNativeRollRequests(plan);
            if (!plan.autoRolls.length) {
                sendDeferred();
                return;
            }
            if (plan.trackInitiative) {
                const queued = RollParser.setNativeInitiativeAutoQueue(plan.initiativeBatchId, plan.autoRolls, sendDeferred);
                if (queued) RollParser.advanceNativeInitiativeAutoQueue(plan.initiativeBatchId);
                else sendDeferred();
                return;
            }
            const rollDelay = Math.max(100, Utils.toInt(plan.options.rollDelayMs, 750));
            R20.sendNativeCommandsSequentially(
                plan.autoRolls.map((roll) = roll.nativeCommand  roll.batchCommand  ''),
                rollDelay
            );
            setTimeout(sendDeferred, (plan.autoRolls.length  rollDelay) + 250);
        },

        summarizeNativeRollPlan(plan) {
            return {
                sent plan.individual + plan.autoRolls.length + plan.batchRolls.length +
                    plan.ca2014PlainRolls.length + plan.ca2014InitiativeRolls.length,
                individual plan.individual,
                automatic plan.autoRolls.length + (plan.options.rollMode
                     plan.ca2014InitiativeRolls.length + plan.ca2014PlainRolls.length
                     0),
                batch plan.batchRolls.length + (plan.options.rollMode
                     0
                     plan.ca2014PlainRolls.length + plan.ca2014InitiativeRolls.length),
                failed plan.failed
            };
        },

        sendNativeRollBatchForTokens(tokens, macroName, options) {
            const plan = this.createNativeRollPlan(tokens, macroName, options);
            if (!plan.safeMacroName) {
                return { sent 0, individual 0, automatic 0, batch 0, failed ['Native Roll20 macro could not be resolved.'] };
            }
            (Array.isArray(tokens)  tokens  []).forEach((token) = this.classifyNativeRollToken(token, plan));
            this.resolveImmediate2014Rolls(plan);
            this.scheduleNativeRollPlan(plan);
            return this.summarizeNativeRollPlan(plan);
        },

        async handle(ctx) {
            const args = ctx.args  [];
            const action = String(args[0]  'menu').trim().toLowerCase();
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
            if (action === 'advancemode'  action === 'advancedmode') {
                const value = String(args[1]  '').trim().toLowerCase();
                if (value !== 'yes' && value !== 'no') {
                    Render.sendWhisperMessage(ctx.who, 'Advanced Mode', 'Use code!ca advancemode yescode or code!ca advancemode nocode. Advanced mode is temporary and resets to NO whenever the API sandbox restarts.', 'warning');
                    return;
                }
                RuntimeConfig.setAdvancedMode(value === 'yes');
                Render.sendWhisperMessage(ctx.who, 'Advanced Mode', value === 'yes'
                     'Advanced Mode is enabled for this API session. Temporary debug settings are now visible.'
                     'Advanced Mode is disabled. Temporary debug settings were reset to OFF.', 'normal');
                Render.showConfigMenu(ctx.who);
                return;
            }
            if (action === 'config'  action === 'settings') {
                Render.showConfigMenu(ctx.who);
                return;
            }
            if (action === 'default'  action === 'defaults') {
                const confirmed = String(args[1]  '').trim().toLowerCase() === 'yes';
                if (!confirmed) {
                    Render.sendWhisperMessage(ctx.who, 'Settings', 'Default reset cancelled. Use the strongDefaultstrong button at the bottom of Settings and confirm Yes.', 'warning');
                    return;
                }
                RuntimeConfig.resetDefaults();
                TurnTracker.clearMovementState();
                if (RUNTIME_CONFIG_DEFAULTS.TURN_TRACKER) TurnTracker.initializeFromCurrentTurnOrder();
                else TurnTracker.resetState();
                TurnTracker.refreshCurrentTurnPresentation({ sendCard false, focus false });
                Render.sendWhisperMessage(ctx.who, 'Settings', 'All Combat Assistant settings were restored to their defaults. Advanced Mode and temporary debug settings were also reset.', 'normal');
                Render.showConfigMenu(ctx.who);
                return;
            }
            if (action === 'set') {
                const key = args[1]  '';
                const value = args.slice(2).join(' ');
                const result = RuntimeConfig.set(key, value);
                if (!result.ok) Render.sendWhisperMessage(ctx.who, result.title  'Settings', result.message, 'failure');
                else {
                    if (result.key === 'TURN_TRACKER' && result.value) TurnTracker.initializeFromCurrentTurnOrder();
                    if (result.key === 'TURN_TRACKER' && !result.value) TurnTracker.resetState();
                    if (result.key === 'TURN_MOVEMENT_TRACKER') {
                        if (result.value) TurnTracker.resetMovementForCurrentTurn({ resolveAsync true });
                        else TurnTracker.clearMovementState();
                    }
                    if (^TURN_MARKER^PUBLIC_TURN_MARKER^TURN_AUTO_FOCUS.test(result.key  '')) TurnTracker.refreshCurrentTurnPresentation({ sendCard false, focus false });
                    Render.showConfigMenu(ctx.who);
                }
                return;
            }
            if (action === 'toggle') {
                const result = RuntimeConfig.toggle(args[1]  '');
                if (!result.ok) Render.sendWhisperMessage(ctx.who, 'Settings', result.message, 'failure');
                else {
                    if (result.key === 'TURN_TRACKER' && result.value) TurnTracker.initializeFromCurrentTurnOrder();
                    if (result.key === 'TURN_TRACKER' && !result.value) TurnTracker.resetState();
                    if (result.key === 'TURN_MOVEMENT_TRACKER') {
                        if (result.value) TurnTracker.resetMovementForCurrentTurn({ resolveAsync true });
                        else TurnTracker.clearMovementState();
                    }
                    if (^TURN_MARKER^PUBLIC_TURN_MARKER^TURN_AUTO_FOCUS.test(result.key  '')) TurnTracker.refreshCurrentTurnPresentation({ sendCard false, focus false });
                    Render.showConfigMenu(ctx.who);
                }
                return;
            }
            if (action === 'dash'  action === 'disengage'  action === 'dodge') {
                ActionService.narrativeAction(ctx, action, '');
                return;
            }
            if (action === 'turnaction') {
                ActionService.narrativeAction(ctx, args[1]  '', args[2]  '');
                return;
            }
            if (action === 'combat') {
                await ActionService.showCombatForContext(ctx, args.slice(1));
                return;
            }
            if (action === 'spells') {
                await ActionService.showSpellsForContext(ctx, args.slice(1));
                return;
            }
            if (action === 'resource'  action === 'resources') {
                ResourceService.showForContext(ctx, args.slice(1));
                return;
            }
            if (action === 'resourceadjust') {
                await ResourceService.adjust(ctx, args.slice(1));
                return;
            }
            if (action === 'turn') {
                const turnAction = String(args[1]  '').trim().toLowerCase();
                if (!turnAction) {
                    TurnTracker.sendCurrentTurnCardToContext(ctx);
                    return;
                }
                if (turnAction === 'next') {
                    TurnTracker.advanceTurn(args[2]  '', ctx);
                    return;
                }
                if (turnAction === 'focus') {
                    TurnTracker.focusTokenById(args[2]  '', ctx);
                    return;
                }
                if (turnAction === 'remove') {
                    if (!ctx.isGM) {
                        Render.sendWhisperMessage(ctx.who, 'Permission Denied', 'Only the GM can remove turns.', 'failure');
                        return;
                    }
                    TurnTracker.removeCurrentTurnAfterAdvance(args[2]  '', ctx);
                    return;
                }
                if (turnAction === 'stop') {
                    if (!ctx.isGM) {
                        Render.sendWhisperMessage(ctx.who, 'Permission Denied', 'Only the GM can stop combat.', 'failure');
                        return;
                    }
                    TurnTracker.stopCombat(args[2]  '');
                    return;
                }
                Render.sendWhisperMessage(ctx.who, 'Turn Tracker', 'Use !ca turn next, !ca turn focus, !ca turn remove, or !ca turn stop yes.', 'warning');
                return;
            }
            if (action === 'turnnext') {
                TurnTracker.advanceTurn(args[1]  '', ctx);
                return;
            }
            if (action === 'turnfocus') {
                TurnTracker.focusTokenById(args[1]  '', ctx);
                return;
            }
            if (action === 'turnremove') {
                if (!ctx.isGM) {
                    Render.sendWhisperMessage(ctx.who, 'Permission Denied', 'Only the GM can remove turns.', 'failure');
                    return;
                }
                TurnTracker.removeCurrentTurnAfterAdvance(args[1]  '', ctx);
                return;
            }
            if (action === 'turnstop') {
                if (!ctx.isGM) {
                    Render.sendWhisperMessage(ctx.who, 'Permission Denied', 'Only the GM can stop combat.', 'failure');
                    return;
                }
                TurnTracker.stopCombat(args[1]  '');
                return;
            }
            if (action === 'use') {
                await this.handlePlayerActionUse(ctx, args.slice(1));
                return;
            }
            if (action === 'usearea') {
                await this.handlePlayerAreaActionUse(ctx, args.slice(1));
                return;
            }
            if (action === 'conc') {
                this.handleConcentrationRecall(ctx, args.slice(1));
                return;
            }
            if (action === 'concopen') {
                this.handleConcentrationOpen(ctx, args.slice(1));
                return;
            }
            if (action === 'conend') {
                this.handleConcentrationEnd(ctx, args.slice(1));
                return;
            }
            if (action === 'npcset') {
                await this.handleNpcSetAction(ctx, args.slice(1));
                return;
            }
            if (action === 'npcarea') {
                await this.handleNpcAreaSetAction(ctx, args.slice(1));
                return;
            }
            if (action === 'rollsave') {
                await this.handleCombatAssistantSaveRoll(ctx, args.slice(1));
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
            if (action === 'cleanupbatch') {
                this.handleBatchHelperCleanup(ctx, args.slice(1));
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
            if (action === 'save'  action === 'saving') {
                await this.handleSave(ctx, args.slice(1));
                return;
            }
            if (action === 'init'  action === 'initiative') {
                await this.handleInitiative(ctx, args.slice(1));
                return;
            }
            if (action === 'rollinit') {
                await this.handleCombatAssistantInitiativeRoll(ctx, args.slice(1));
                return;
            }
            if (action === 'test') {
                this.handleTest(ctx, args.slice(1));
                return;
            }
            if (action === 'testrun') {
                this.handleTestRun(ctx, args.slice(1));
                return;
            }
            Render.sendWhisperMessage(ctx.who, 'Unknown Command', 'Use code style=colorrgb(52,203,116);font-weight900;!ca menucode or code!ca helpcode.', 'warning');
        },

        getAccessibleConcentrationEntries(ctx, explicitTokenId) {
            const root = State.get();
            root.concentration = root.concentration  {};
            const selectedIds = R20.getSelectedTokens(ctx.msg).map((token) = R20.getTokenId(token)).filter(Boolean);
            const wantedTokenId = String(explicitTokenId  '').trim();
            const entries = [];
            Object.keys(root.concentration).forEach((tokenId) = {
                const entry = root.concentration[tokenId]  {};
                const casterTokenId = String(entry.casterTokenId  tokenId  '').trim();
                if (wantedTokenId && casterTokenId !== wantedTokenId) return;
                if (!wantedTokenId && selectedIds.length && selectedIds.indexOf(casterTokenId)  0) return;
                const token = R20.getTokenById(casterTokenId);
                if (!token  !this.canUseTokenButton(ctx, token)) return;
                entries.push(entry);
            });
            return entries;
        },

        concentrationButtonCard(entry) {
            entry = entry  {};
            const request = State.getPlayerActionRequest(entry.actionId);
            const payload = request && request.payload  request.payload  {};
            const casterToken = R20.getTokenById(entry.casterTokenId);
            const buttons = Render.areaRollControlButtons({
                actionId entry.actionId,
                casterTokenId entry.casterTokenId,
                isConcentration true,
                rollTooltip 'Roll the active concentration area again'
            });
            const areaInfo = payload.areaInfo && payload.areaInfo.isArea  payload.areaInfo  null;
            const body = Render.iconButtonTableHtml(buttons, {
                columns buttons.length,
                footerHtml areaInfo
                     Render.playerAreaMarkerFooterHtml(areaInfo, payload)
                     'Active concentration area.',
                footer ''
            });
            return Html.card({
                title 'Concentration',
                body,
                buildOptions {
                    titleHtml Render.attackPromptTitleHtml({
                        attackName entry.spellName  payload.sourceAction  'Concentration',
                        tokenName casterToken  CombatService.getTokenName(casterToken)  (payload.sourceName  'Caster'),
                        tokenImgsrc casterToken && Utils.isFunction(casterToken.get)  String(casterToken.get('imgsrc')  payload.sourceImgsrc  '')  String(payload.sourceImgsrc  ''),
                        isSaveAttack payload.mode === 'save',
                        saveAbility payload.saveAbility,
                        saveDc payload.mode === 'save'  payload.challenge  0,
                        attackTotal payload.mode === 'attack'  payload.challenge  0,
                        damageRolls payload.damageRolls,
                        damageTotal Array.isArray(payload.damageRolls)  payload.damageRolls.reduce((sum, roll) = sum + Math.max(0, Utils.toInt(roll && roll.total, 0)), 0)  0,
                        damageType Array.isArray(payload.damageRolls) && payload.damageRolls.length  payload.damageRolls[0].damageType  'normal'
                    })
                }
            });
        },

        rerollConcentrationDamage(entry) {
            entry = entry  {};
            const request = State.getPlayerActionRequest(entry.actionId);
            if (!request  !request.payload) return false;
            const formula = CombatService.getPrimaryDamageFormula(request.payload);
            if (!formula) return false;
            const reroll = CombatService.rollDamageFormula(formula);
            if (!reroll.ok) {
                Render.sendWhisperMessage('GM', 'Concentration Damage', Utils.escapeHtml(reroll.message  'Damage formula could not be rerolled; using the stored damage.'), 'warning');
                return false;
            }
            const baseRolls = Array.isArray(request.payload.damageRolls) && request.payload.damageRolls.length  request.payload.damageRolls  [{ damageType request.payload.damageType  'normal' }];
            const damageType = CombatService.normalizeDamageType(baseRolls[0] && baseRolls[0].damageType  request.payload.damageType  'normal');
            request.payload.damageRolls = [{ total reroll.total, damageType, formula reroll.formula }];
            request.payload.damageTotal = reroll.total;
            request.payload.damageType = damageType;
            request.payload.damageFormula = reroll.formula;
            const casterToken = R20.getTokenById(entry.casterTokenId);
            Render.sendConcentrationSpellReroll({
                casterImgsrc casterToken && Utils.isFunction(casterToken.get)  String(casterToken.get('imgsrc')  '')  '',
                spellName entry.spellName  request.attackName  request.payload.sourceAction  'Concentration',
                formula reroll.formula,
                total reroll.total,
                diceValues reroll.diceValues,
                modifier reroll.modifier
            });
            return true;
        },

        handleConcentrationOpen(ctx, args) {
            const entries = this.getAccessibleConcentrationEntries(ctx, args[0]  '');
            if (!entries.length) {
                Render.sendWhisperMessage(ctx.who, 'Concentration', 'No active concentration was found for your token.', 'warning');
                return;
            }
            if (entries.length === 1) {
                const card = this.concentrationButtonCard(entries[0]);
                R20.whisper(ctx.who, card);
                if (!ctx.isGM) R20.whisper('GM', card);
                return;
            }
            const buttons = entries.map((entry) = {
                const token = R20.getTokenById(entry.casterTokenId);
                return Render.iconButtonHtml({
                    iconHtml '&#9201;&#65039;',
                    label token  CombatService.getTokenName(token)  (entry.spellName  'Con'),
                    command '!combatAssistant concopen ' + Utils.attrSafe(entry.casterTokenId),
                    backgroundColor 'rgba(80,80,120,0.95)',
                    tooltip 'Open this concentration area controls'
                });
            });
            R20.whisper(ctx.who, Html.card({
                title 'Concentration',
                body Render.iconButtonTableHtml(buttons, { columns Math.min(5, Math.max(1, buttons.length)), footer 'Choose which active concentration area to open.' })
            }));
        },

        handleConcentrationRecall(ctx, args) {
            const entries = this.getAccessibleConcentrationEntries(ctx, args[0]  '');
            if (!entries.length) {
                Render.sendWhisperMessage(ctx.who, 'Concentration', 'No active concentration area was found for your token.', 'warning');
                return;
            }
            if (entries.length === 1) {
                const rerolled = this.rerollConcentrationDamage(entries[0]);
                if (!rerolled) {
                    Render.sendWhisperMessage(
                        ctx.who,
                        'Concentration Damage',
                        'Combat Assistant could not roll fresh damage for this concentration spell. The stored damage was not presented as a new roll.',
                        'warning'
                    );
                    return;
                }
                const card = this.concentrationButtonCard(entries[0]);
                R20.whisper(ctx.who, card);
                if (!ctx.isGM) R20.whisper('GM', card);
                return;
            }
            const buttons = entries.map((entry) = {
                const token = R20.getTokenById(entry.casterTokenId);
                return Render.iconButtonHtml({
                    iconHtml '&#9201;&#65039;',
                    label token  CombatService.getTokenName(token)  (entry.spellName  'Con'),
                    command '!combatAssistant conc ' + Utils.attrSafe(entry.casterTokenId),
                    backgroundColor 'rgba(80,80,120,0.95)',
                    tooltip 'Show this concentration area controls'
                });
            });
            R20.whisper(ctx.who, Html.card({
                title 'Concentration',
                body Render.iconButtonTableHtml(buttons, { columns Math.min(5, Math.max(1, buttons.length)), footer 'Choose which active concentration area to recall.' })
            }));
        },

        handleConcentrationEnd(ctx, args) {
            const tokenId = String(args[0]  '').trim();
            const actionId = String(args[1]  '').trim();
            let entry = tokenId  State.getConcentrationByTokenId(tokenId)  null;
            if (!entry && actionId) entry = State.getConcentrationByActionId(actionId);
            if (!entry) {
                Render.sendWhisperMessage(ctx.who, 'Concentration', 'No active concentration was found.', 'warning');
                return;
            }
            const token = R20.getTokenById(entry.casterTokenId);
            if (token && !this.canUseTokenButton(ctx, token)) {
                Render.sendWhisperMessage(ctx.who, 'Permission Denied', 'You do not control this concentrating token.', 'failure');
                return;
            }
            CombatService.endConcentrationByTokenId(entry.casterTokenId, 'ended manually');
        },

        isNpcSetSourceToken(token) {
            if (!token  !Utils.isFunction(token.get)) return false;
            const character = R20.getCharacterFromToken(token);
            return !R20.isPlayerControlledToken(token, character);
        },

        buildNpcActionRequest(ctx, sourceToken, data) {
            const safeData = data && typeof data === 'object'  data  {};
            const character = R20.getCharacterFromToken(sourceToken);
            const sourceTokenId = R20.getTokenId(sourceToken);
            const sourceCharacterId = character  String(character.id  sourceToken.get('represents')  '').trim()  String(sourceToken.get('represents')  '').trim();
            const sourcePageId = R20.getTokenPageId(sourceToken);
            const saveAbility = CombatService.normalizeAbilityName(safeData.saveAbility  '');
            const damageRolls = Array.isArray(safeData.damageRolls) && safeData.damageRolls.length
                 safeData.damageRolls
                 [{ total Math.max(0, Utils.toInt(safeData.damageTotal, 0)), damageType safeData.damageType  'normal', formula safeData.damageFormula  'Roll20' }];
            const areaInfo = safeData.areaInfo && safeData.areaInfo.isArea  safeData.areaInfo  { isArea false };
            const payload = {
                type 'damage',
                mode String(safeData.mode  (saveAbility  'save'  'attack')).toLowerCase(),
                challenge Math.max(0, Utils.toInt(safeData.challenge  safeData.saveDc  safeData.attackTotal, 0)),
                attackNatural Math.max(0, Utils.toInt(safeData.attackNatural, 0)),
                isCritical !!safeData.isCritical,
                saveAbility,
                halfOnSuccess !!safeData.halfOnSuccess,
                halfOnSuccessKnown !!safeData.halfOnSuccessKnown,
                damageRolls,
                sourceName CombatService.getTokenName(sourceToken),
                sourceAction String(safeData.sourceAction  safeData.attackName  'NPC Attack'),
                sourceImgsrc String(sourceToken.get('imgsrc')  safeData.sourceImgsrc  ''),
                rangeText String(safeData.rangeText  safeData.range  ''),
                durationText String(safeData.durationText  safeData.duration  ''),
                isSpellAction !!safeData.isSpellAction,
                isConcentration !!safeData.isConcentration,
                lightInfo safeData.lightInfo && safeData.lightInfo.hasLight  safeData.lightInfo  { hasLight false },
                areaInfo,
                areaOptions Array.isArray(safeData.areaOptions) && safeData.areaOptions.length  safeData.areaOptions  R20.getAreaInfoOptions(areaInfo),
                casterTokenId sourceTokenId,
                casterCharacterId sourceCharacterId,
                casterPageId sourcePageId,
                ignoreRangeCheck true,
                npcSet true,
                forceProjectileFx !areaInfo.isArea
            };
            const actionId = State.createPlayerActionRequest({
                type 'damage',
                payload,
                sourceTokenId,
                sourceCharacterId,
                sourcePageId,
                characterId sourceCharacterId,
                characterName character  String(character.get('name')  '')  CombatService.getTokenName(sourceToken),
                attackName payload.sourceAction,
                uses 1,
                npcSet true,
                createdByPlayerId String(ctx && ctx.playerId  '').trim()
            });
            return {
                actionId,
                request State.getPlayerActionRequest(actionId),
                payload
            };
        },

        async handleNpcSetAction(ctx, args) {
            if (!ctx.isGM) {
                Render.sendWhisperMessage(ctx.who, 'Permission Denied', 'Only the GM can set NPC attacks.', 'failure');
                return;
            }
            const data = Utils.decodeJsonPayload(args[0]  '', null);
            const sourceId = String(args[1]  '').trim();
            const targetId = String(args[2]  '').trim();
            const sourceToken = R20.getTokenById(sourceId);
            const targetToken = R20.getTokenById(targetId);
            if (!data  !sourceToken  !targetToken) {
                Render.sendWhisperMessage(ctx.who, 'NPC SET', 'Choose an NPC source token and a target token.', 'warning');
                return;
            }
            if (!this.isNpcSetSourceToken(sourceToken)) {
                Render.sendWhisperMessage(ctx.who, 'NPC Source Required', 'The selected source token has a player controller. NPC SET is only for uncontrolled NPC tokens.', 'warning');
                return;
            }
            const pageId = R20.getTokenPageId(sourceToken);
            if (pageId && R20.getTokenPageId(targetToken) && pageId !== R20.getTokenPageId(targetToken)) {
                Render.sendWhisperMessage(ctx.who, 'NPC SET', 'Source and target must be on the same page.', 'warning');
                return;
            }
            const built = this.buildNpcActionRequest(ctx, sourceToken, data);
            await this.handlePlayerActionUse(ctx, [built.actionId, targetId]);
        },

        async handleNpcAreaSetAction(ctx, args) {
            if (!ctx.isGM) {
                Render.sendWhisperMessage(ctx.who, 'Permission Denied', 'Only the GM can set NPC area attacks.', 'failure');
                return;
            }
            if (!RuntimeConfig.get('PLAYER_TOKEN_AREA_MARK')) {
                Render.sendWhisperMessage(ctx.who, 'NPC Area SET Disabled', 'Enable Player Token Area Mark to use NPC SET for area attacks.', 'warning');
                return;
            }
            const data = Utils.decodeJsonPayload(args[0]  '', null);
            const sourceId = String(args[1]  '').trim();
            const sourceToken = R20.getTokenById(sourceId);
            const areaInfo = data && data.areaInfo && data.areaInfo.isArea  data.areaInfo  null;
            if (!data  !sourceToken  !areaInfo) {
                Render.sendWhisperMessage(ctx.who, 'NPC Area SET', 'Choose an NPC source token for this area attack.', 'warning');
                return;
            }
            if (!this.isNpcSetSourceToken(sourceToken)) {
                Render.sendWhisperMessage(ctx.who, 'NPC Source Required', 'The selected source token has a player controller. NPC SET is only for uncontrolled NPC tokens.', 'warning');
                return;
            }
            const built = this.buildNpcActionRequest(ctx, sourceToken, data);
            if (!built.request) {
                Render.sendWhisperMessage(ctx.who, 'NPC Area SET', 'The NPC area request could not be created.', 'failure');
                return;
            }
            const markerResult = R20.createPlayerAreaMarkers(built.request, sourceToken, ctx.playerId  '');
            if (markerResult.ok && markerResult.alternatives.length) {
                built.request.areaMarkerAlternatives = markerResult.alternatives;
                built.request.markerTokenIds = markerResult.markerIds.slice();
                const firstAlternative = markerResult.alternatives[0];
                built.request.markerTokenId = firstAlternative.markerTokenId;
                built.request.markerName = firstAlternative.markerName;
                built.request.areaMarkerGroup = firstAlternative.markerGroup  null;
            } else {
                Render.sendWhisperMessage(ctx.who, 'NPC Area Marker', markerResult.message  'Area marker could not be created.', 'failure');
                return;
            }
            const buttons = Render.areaRollControlButtons({
                actionId built.actionId,
                casterTokenId R20.getTokenId(sourceToken),
                isConcentration built.payload.isConcentration && RuntimeConfig.get('CONCENTRATION_TRACKING'),
                rollTooltip 'Move the NPC area marker, then roll every token inside it'
            });
            const body = Render.iconButtonTableHtml(buttons, {
                columns buttons.length,
                footerHtml Render.playerAreaMarkerFooterHtml(areaInfo, built.payload),
                footer ''
            }) + (markerResult.message  'div style=padding-top4px;colorrgb(235,160,90);font-size10px;text-aligncenter;' + Utils.escapeHtml(markerResult.message) + 'div'  '');
            R20.whisper('GM', Html.card({
                title 'NPC Area Ready',
                body,
                buildOptions {
                    titleHtml Render.attackPromptTitleHtml({
                        attackName built.payload.sourceAction,
                        tokenName built.payload.sourceName,
                        tokenImgsrc built.payload.sourceImgsrc,
                        isSaveAttack built.payload.mode === 'save',
                        saveAbility built.payload.saveAbility,
                        saveDc built.payload.mode === 'save'  built.payload.challenge  0,
                        attackTotal built.payload.mode === 'attack'  built.payload.challenge  0,
                        damageRolls built.payload.damageRolls,
                        damageTotal built.payload.damageRolls.reduce((sum, roll) = sum + Math.max(0, Utils.toInt(roll && roll.total, 0)), 0),
                        damageType built.payload.damageRolls.length  built.payload.damageRolls[0].damageType  'normal'
                    })
                }
            }));
        },

        async handlePlayerActionUse(ctx, args) {
            const actionId = String(args[0]  '').trim();
            const targetId = String(args[1]  '').trim();
            const request = State.getPlayerActionRequest(actionId);
            if (!request  request.used) {
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
            const sourceToken = this.resolvePlayerActionSourceOnTargetPage(request, target);
            const rangeCheck = CombatService.validatePlayerActionRange(request, target);
            if (!rangeCheck.ok) {
                Render.sendWhisperMessage(ctx.who, 'Out of Range', rangeCheck.message  'The selected target is not within range for this action.', 'failure');
                return;
            }
            request.usedTargetIds = Array.isArray(request.usedTargetIds)  request.usedTargetIds  [];
            if (request.usedTargetIds.indexOf(targetId) = 0) {
                Render.sendWhisperMessage(ctx.who, 'Target Already Used', 'This area button was already used on that target.', 'warning');
                return;
            }
            if (!State.reservePlayerAction(actionId, targetId)) {
                Render.sendWhisperMessage(ctx.who, 'Action Busy', 'This action is already being resolved or has no remaining uses.', 'warning');
                return;
            }
            const useCtx = Object.assign({}, ctx, {
                msg Object.assign({}, ctx.msg  {}, { selected [] }),
                fromPlayerAction true
            });
            CombatEffects.playProjectile(request, target, sourceToken);
            try {
                const outcome = String(request.type  '').toLowerCase() === 'heal'
                     await this.handleHeal(useCtx, [Utils.encodeJsonPayload(request.payload  {}), targetId])
                     await this.handleDeal(useCtx, [Utils.encodeJsonPayload(request.payload  {}), targetId]);
                if (outcome && (outcome.applied  0  outcome.queued  0)) State.commitPlayerAction(actionId, targetId);
                else State.releasePlayerAction(actionId, targetId);
            } catch (error) {
                State.releasePlayerAction(actionId, targetId);
                throw error;
            }
        },

        async handlePlayerAreaActionUse(ctx, args) {
            const actionId = String(args[0]  '').trim();
            const request = State.getPlayerActionRequest(actionId);
            const concentrationAreaActive = !!(request && request.concentrationAreaActive);
            if (!request  (request.used && !concentrationAreaActive)) {
                Render.sendWhisperMessage(ctx.who, 'Action Expired', 'This area button has already been used or expired.', 'warning');
                return;
            }
            if (!this.canUsePlayerActionRequest(ctx, request)) {
                Render.sendWhisperMessage(ctx.who, 'Permission Denied', 'This area action belongs to a token you do not control.', 'failure');
                return;
            }
            const activeAlternatives = R20.getActiveAreaMarkerAlternatives(request);
            if (activeAlternatives.length  1) {
                const labels = activeAlternatives.map((alternative) = String(alternative && alternative.areaInfo && (alternative.areaInfo.label  alternative.areaInfo.shape)  'Area'));
                Render.sendWhisperMessage(
                    ctx.who,
                    'Choose One Area',
                    'More than one area marker is still on the map strong' + Utils.escapeHtml(labels.join(' and ')) + 'strong. Delete the marker you will not use, then press Roll again.',
                    'warning'
                );
                return;
            }
            if (!activeAlternatives.length) {
                Render.sendWhisperMessage(ctx.who, 'Area Marker Missing', 'No complete area marker was found. Cast the spell again to create a new marker.', 'failure');
                return;
            }
            R20.activateAreaMarkerAlternative(request, activeAlternatives[0]);
            const marker = R20.findPlayerAreaMarker(request);
            if (!marker) {
                Render.sendWhisperMessage(ctx.who, 'Area Marker Missing', 'The selected area marker token could not be found.', 'failure');
                return;
            }
            const rangeCheck = CombatService.validatePlayerAreaMarkerRange(request, marker);
            if (!rangeCheck.ok) {
                Render.sendWhisperMessage(ctx.who, 'Out of Range', rangeCheck.message  'The area marker is not within range for this action.', 'failure');
                return;
            }
            CombatEffects.playThrownAreaExplosion(request, request.payload  {}, marker);
            const targets = R20.getTokensInsideAreaMarker(marker, request);
            if (!targets.length) {
                Render.sendWhisperMessage(ctx.who, 'Area Targets', 'No target tokens were found inside the area marker.', 'warning');
                return;
            }
            const reservationKey = '__area__';
            if (!State.reservePlayerAction(actionId, reservationKey)) {
                Render.sendWhisperMessage(ctx.who, 'Action Busy', 'This area action is already being resolved or has expired.', 'warning');
                return;
            }
            const payload = Object.assign({}, request.payload  {});
            CombatEffects.playSelfAreaNova(request, payload);
            const targetIds = targets.map((token) = R20.getTokenId(token)).filter(Boolean);
            const concentrationTracking = RuntimeConfig.get('CONCENTRATION_TRACKING');
            const shouldStartConcentrationArea = !!(concentrationTracking && payload.isConcentration && !concentrationAreaActive);
            const keepMarkerUntilRollsFinish = !concentrationAreaActive && !payload.isConcentration && RuntimeConfig.get('PLAYER_AREA_MARKER_KEEP_UNTIL_ROLLED');
            let persistentAreaStarted = false;
            if (keepMarkerUntilRollsFinish) {
                payload.playerAreaActionId = actionId;
                payload.playerAreaMarkerPersistent = true;
                payload.areaTargetIds = targetIds.slice();
                persistentAreaStarted = State.beginPersistentAreaMarkerResolution(actionId, targetIds);
            }
            const useCtx = Object.assign({}, ctx, {
                msg Object.assign({}, ctx.msg  {}, {
                    selected targetIds.map((id) = ({ _id id, _type 'graphic' }))
                }),
                fromPlayerAction true
            });
            Render.sendWhisperMessage(ctx.who, 'Area Targets', 'strong' + Utils.escapeHtml(String(targets.length)) + 'strong target(s) found inside the area marker.', 'normal');
            try {
                const outcome = String(request.type  '').toLowerCase() === 'heal'
                     await this.handleHeal(useCtx, [Utils.encodeJsonPayload(payload)])
                     await this.handleDeal(useCtx, [Utils.encodeJsonPayload(payload)]);
                if (concentrationAreaActive  shouldStartConcentrationArea) {
                    if (shouldStartConcentrationArea) {
                        const sourceToken = this.resolvePlayerActionSourceOnTargetPage(request, marker)  R20.getAreaMarkerSourceToken(request);
                        CombatService.startConcentrationForRequest(request, sourceToken);
                    }
                    State.releasePlayerAction(actionId, reservationKey);
                    const spellName = Utils.escapeHtml(String(request.attackName  payload.sourceAction  'Concentration'));
                    Render.sendWhisperMessage(ctx.who, 'Concentration', 'You have concentration in strong style=colorrgb(245,220,80);' + spellName + 'strong. Use code style=colorrgb(52,203,116);font-weight900;!ca conccode to recall this roll.', 'normal');
                } else if (outcome && (outcome.applied  0  outcome.queued  0)) {
                    if (!persistentAreaStarted) {
                        State.commitPlayerAction(actionId, reservationKey);
                        State.removePlayerActionMarkers(request);
                    } else if (outcome.queued = 0) {
                        State.removePersistentAreaMarkerRequest(actionId);
                    }
                } else {
                    if (persistentAreaStarted) State.removePersistentAreaMarkerRequest(actionId);
                    else State.releasePlayerAction(actionId, reservationKey);
                }
            } catch (error) {
                if (persistentAreaStarted) State.removePersistentAreaMarkerRequest(actionId);
                else State.releasePlayerAction(actionId, reservationKey);
                throw error;
            }
        },

        async handle2014CombatAssistantSaveRoll(ctx, args) {
            if (!ctx.isGM) {
                Render.sendWhisperMessage(ctx.who, 'Permission Denied', 'Only the GM can roll grouped 2014 saving throws.', 'failure');
                return;
            }
            const mode = CombatService.normalizeRollMode(args[0]  'normal');
            const payload = Utils.decodeJsonPayload(args[1]  '', {});
            const ids = Array.isArray(payload.ids)  payload.ids.map((id) = String(id  '').trim()).filter(Boolean)  [];
            if (!ids.length) {
                Render.sendWhisperMessage(ctx.who, '2014 Saving Throws', 'No pending saving throws were found.', 'warning');
                return;
            }
            let applied = 0;
            for (let i = 0; i  ids.length; i += 1) {
                const pending = RollParser.consumePendingNativeSaveById(ids[i]);
                if (!pending) continue;
                const token = R20.getTokenById(pending.tokenId);
                if (!token) {
                    CombatService.completePersistentAreaMarkerTarget(pending.payload  {}, pending.tokenId);
                    Render.sendWhisperMessage(ctx.who, 'Damage Blocked', 'The pending saving throw target token was not found.', 'failure');
                    continue;
                }
                const rollMode = CombatService.normalizeRollMode(pending.forcedRollMode  mode);
                const roll = CombatService.rollSavingThrowForToken(token, pending.rollName  (pending.payload && pending.payload.saveAbility)  '', rollMode);
                if (!roll.ok) {
                    CombatService.completePersistentAreaMarkerTarget(pending.payload  {}, token);
                    Render.sendWhisperMessage(ctx.who, '2014 Saving Throw', roll.message  'Saving throw failed.', 'failure');
                    continue;
                }
                const damagePayload = Object.assign({}, pending.payload  {}, {
                    nativeSaveTotal roll.total,
                    nativeSaveNatural roll.natural,
                    nativeSaveModifier roll.modifier,
                    nativeSaveRolls roll.rolls,
                    nativeSaveMode roll.mode,
                    nativeSaveRollModeReason String(pending.forcedRollReason  ''),
                    nativeSaveRollName (CombatService.abilityNameToShortLabel(roll.ability)  'SAVE') + ' Save',
                    nativeSaveCharacterName roll.characterName
                });
                if (pending.concentrationCheck  damagePayload.concentrationCheck) {
                    roll.rollModeReason = pending.forcedRollReason  '';
                    R20.direct(Render.showSavingThrowResults([roll], CombatService.abilityNameToShortLabel(roll.ability)  'SAVE'));
                    CombatService.resolveConcentrationSave(token, roll, pending);
                    applied += 1;
                    continue;
                }
                const result = await CombatService.applyDamageToToken(token, damagePayload);
                if (!result.ok) {
                    CombatService.completePersistentAreaMarkerTarget(damagePayload, token);
                    Render.sendWhisperMessage(ctx.who, 'Damage Blocked', result.message  'Could not apply damage after the saving throw.', 'failure');
                    continue;
                }
                Render.sendDamageResult(result);
                CombatService.completePersistentAreaMarkerTarget(damagePayload, token);
                applied += 1;
            }
            if (!applied) Render.sendWhisperMessage(ctx.who, '2014 Saving Throws', 'No pending saving throws could be resolved.', 'warning');
        },

        async handleCombatAssistantSaveRoll(ctx, args) {
            const requestId = String(args[0]  '').trim();
            const requestedMode = CombatService.normalizeRollMode(args[1]  'normal');
            if (!requestId) {
                Render.sendWhisperMessage(ctx.who, 'Saving Throw', 'The saving throw request was not found.', 'warning');
                return;
            }
            const pending = RollParser.getPendingNativeSaveById(requestId);
            if (!pending) {
                Render.sendWhisperMessage(ctx.who, 'Saving Throw', 'This saving throw request expired or was already used.', 'warning');
                return;
            }
            const token = R20.getTokenById(pending.tokenId);
            if (!token) {
                RollParser.consumePendingNativeSaveById(requestId);
                CombatService.completePersistentAreaMarkerTarget(pending.payload  {}, pending.tokenId);
                Render.sendWhisperMessage(ctx.who, 'Damage Blocked', 'The pending saving throw target token was not found.', 'failure');
                return;
            }
            if (!this.canUseTokenButton(ctx, token)) {
                Render.sendWhisperMessage(ctx.who, 'Permission Denied', 'You do not control this token.', 'failure');
                return;
            }
            RollParser.consumePendingNativeSaveById(requestId);
            const mode = CombatService.normalizeRollMode(pending.forcedRollMode  requestedMode);
            const roll = CombatService.rollSavingThrowForToken(token, pending.rollName  (pending.payload && pending.payload.saveAbility)  '', mode);
            if (!roll.ok) {
                CombatService.completePersistentAreaMarkerTarget(pending.payload  {}, token);
                Render.sendWhisperMessage(ctx.who, 'Saving Throw', roll.message  'Saving throw failed.', 'failure');
                return;
            }
            roll.rollModeReason = pending.forcedRollReason  '';
            if (pending.concentrationCheck  (pending.payload && pending.payload.concentrationCheck)) {
                R20.direct(Render.showSavingThrowResults([roll], CombatService.abilityNameToShortLabel(roll.ability)  'SAVE'));
                CombatService.resolveConcentrationSave(token, roll, pending);
                return;
            }
            R20.direct(Render.showSavingThrowResults([roll], CombatService.abilityNameToShortLabel(roll.ability)  'SAVE'));
            const damagePayload = Object.assign({}, pending.payload  {}, {
                nativeSaveTotal roll.total,
                nativeSaveNatural roll.natural,
                nativeSaveModifier roll.modifier,
                nativeSaveRolls roll.rolls,
                nativeSaveMode roll.mode,
                nativeSaveRollModeReason String(pending.forcedRollReason  ''),
                nativeSaveRollName (CombatService.abilityNameToShortLabel(roll.ability)  'SAVE') + ' Save',
                nativeSaveCharacterName roll.characterName
            });
            const result = await CombatService.applyDamageToToken(token, damagePayload);
            if (!result.ok) {
                CombatService.completePersistentAreaMarkerTarget(damagePayload, token);
                Render.sendWhisperMessage(ctx.who, 'Damage Blocked', result.message  'Could not apply damage after the saving throw.', 'failure');
                return;
            }
            Render.sendDamageResult(result);
            CombatService.completePersistentAreaMarkerTarget(damagePayload, token);
        },

        handle2014CombatAssistantPlainSaveRoll(ctx, args) {
            if (!ctx.isGM) {
                Render.sendWhisperMessage(ctx.who, 'Permission Denied', 'Only the GM can roll grouped 2014 saving throws.', 'failure');
                return;
            }
            const mode = CombatService.normalizeRollMode(args[0]  'normal');
            const payload = Utils.decodeJsonPayload(args[1]  '', {});
            const ability = CombatService.normalizeAbilityName(payload.ability  '');
            const tokenIds = Array.isArray(payload.tokenIds)  payload.tokenIds.map((id) = String(id  '').trim()).filter(Boolean)  [];
            if (!ability  !tokenIds.length) {
                Render.sendWhisperMessage(ctx.who, '2014 Saving Throws', 'No 2014 saving throw tokens were found.', 'warning');
                return;
            }
            const results = [];
            const failed = [];
            tokenIds.forEach((tokenId) = {
                const token = R20.getTokenById(tokenId);
                const result = CombatService.rollSavingThrowForToken(token, ability, mode);
                if (result.ok) results.push(result);
                else failed.push(result.message  'Saving throw failed.');
            });
            if (results.length) R20.direct(Render.showSavingThrowResults(results, CombatService.abilityNameToShortLabel(ability)  'SAVE'));
            if (failed.length) Render.sendWhisperMessage(ctx.who, '2014 Saving Throws', Utils.escapeHtml(failed.join(' ')), 'warning');
        },

        handleBatchHelperCleanup(ctx, args) {
            const helperId = String(args[0]  '').trim();
            const abilityName = String(args[1]  '').trim();
            if (!helperId  !^CT_Batch_i.test(abilityName)) return;
            setTimeout(() = {
                try {
                    R20.cleanupBatchHelperAfterUse(helperId, abilityName);
                } catch (error) {
                    Logger.debug('[batch-helper-cleanup]', error && error.message  error.message  String(error));
                }
            }, 1000);
        },

        handle2014CombatAssistantInitiativeRoll(ctx, args) {
            if (!ctx.isGM) {
                Render.sendWhisperMessage(ctx.who, 'Permission Denied', 'Only the GM can roll grouped 2014 initiative.', 'failure');
                return;
            }
            const mode = CombatService.normalizeInitiativeRollMode(args[0]  'normal');
            const payload = Utils.decodeJsonPayload(args[1]  '', {});
            const batchId = String(payload.batchId  '').trim();
            const rolls = Array.isArray(payload.rolls)
                 payload.rolls.map((entry) = ({
                    tokenId String(entry && entry.tokenId  '').trim(),
                    requestId String(entry && entry.requestId  '').trim()
                })).filter((entry) = entry.tokenId)
                 [];
            if (!rolls.length) {
                Render.sendWhisperMessage(ctx.who, '2014 Initiative', 'No 2014 initiative tokens were found.', 'warning');
                return;
            }
            const results = [];
            const failed = [];
            rolls.forEach((entry) = {
                const token = R20.getTokenById(entry.tokenId);
                const result = CombatService.rollInitiativeForToken(token, mode);
                RollParser.removePendingNativeInitiativeById(entry.requestId);
                if (result.ok) {
                    results.push(result);
                    if (batchId) {
                        RollParser.recordPendingNativeInitiativeResult(result.tokenId, result.total, batchId, entry.requestId);
                    }
                } else {
                    failed.push(result.message  'Initiative roll failed.');
                }
            });
            if (results.length) {
                if (!batchId) CombatService.applyInitiativeResults(results);
                R20.direct(Render.showInitiativeResults(results));
            }
            if (failed.length) Render.sendWhisperMessage(ctx.who, '2014 Initiative', Utils.escapeHtml(failed.join(' ')), 'warning');
        },

        parseDamageCommandArgs(args) {
            const safeArgs = Array.isArray(args)  args  [];
            if (String(safeArgs[0]  '').toLowerCase() === 'manual') {
                const damage = Math.max(0, Utils.toInt(safeArgs[1], 0));
                const damageType = CombatService.normalizeDamageType(safeArgs[2]  'normal');
                const challenge = Math.max(0, Utils.toInt(safeArgs[3], 0));
                const saveAbility = CombatService.normalizeAbilityName(safeArgs[4]  '');
                const halfOnSuccess = Utils.toBoolean(safeArgs[5], false);
                const payload = {
                    type 'damage',
                    mode saveAbility && challenge  0  'save'  (challenge  0  'attack'  'direct'),
                    challenge,
                    saveAbility,
                    halfOnSuccess,
                    halfOnSuccessKnown !!saveAbility,
                    damageRolls [{ total damage, damageType, formula 'Manual' }],
                    sourceName 'Manual',
                    sourceAction 'Manual Damage'
                };
                const optionalMode = String(safeArgs[6]  '').trim();
                const hasRollMode = ['normal', 'advantage', 'disadvantage', 'adv', 'dis'].indexOf(optionalMode.toLowerCase()) = 0;
                if (hasRollMode) payload.rollMode = CombatService.normalizeRollMode(optionalMode);
                return { payload, targetId hasRollMode  (safeArgs[7]  '')  (safeArgs[6]  '') };
            }

            const payload = Utils.decodeJsonPayload(safeArgs[0]  '', null);
            if (!payload) return { payload null, targetId '' };
            const optionalMode = String(safeArgs[1]  '').trim();
            const hasRollMode = ['normal', 'advantage', 'disadvantage', 'adv', 'dis'].indexOf(optionalMode.toLowerCase()) = 0;
            if (hasRollMode) payload.rollMode = CombatService.normalizeRollMode(optionalMode);
            return { payload, targetId hasRollMode  (safeArgs[2]  '')  (safeArgs[1]  '') };
        },

        requiresNativeSavingRoll(payload) {
            const source = payload  {};
            const mode = String(source.mode  'direct').toLowerCase();
            const challenge = Math.max(0, Utils.toInt(source.challenge, 0));
            const hasNativeTotal = source.nativeSaveTotal !== undefined &&
                source.nativeSaveTotal !== null &&
                String(source.nativeSaveTotal).trim() !== '';
            return mode === 'save' && challenge  0 && !hasNativeTotal;
        },

        createSavingDamageQueue(tokens, payload, ctx) {
            const queue = {
                playerRolls [],
                autoRolls [],
                batchRolls [],
                ca2014Rolls [],
                failed 0
            };
            (Array.isArray(tokens)  tokens  []).forEach((token) = {
                const pending = CombatService.startNativeSavingDamageRoll(token, payload, ctx.who, { deferPlayerPrompt true });
                if (!pending.ok) {
                    CombatService.completePersistentAreaMarkerTarget(payload, token);
                    Render.sendWhisperMessage(ctx.who, 'Damage Blocked', pending.message  'Could not queue Roll20 saving throw.', 'failure');
                    queue.failed += 1;
                    return;
                }
                if (pending.batchRoll && pending.sheetVersion === '2014' &&
                    (RuntimeConfig.get('SHEET_2014_CA_ROLLS')  pending.forcedRollMode)) {
                    queue.ca2014Rolls.push(pending);
                } else if (pending.batchRoll && pending.sheetVersion === '2014') {
                    queue.batchRolls.push(pending);
                } else if (pending.batchRoll) {
                    queue.autoRolls.push(pending);
                } else if (pending.playerPrompt) {
                    queue.playerRolls.push(pending);
                }
            });
            return queue;
        },

        sendPlayerSavingDamageRequests(ctx, payload, challenge, rolls) {
            (Array.isArray(rolls)  rolls  []).forEach((roll) = {
                const recipients = Array.isArray(roll.recipients) && roll.recipients.length  roll.recipients  ['GM'];
                const card = roll.card  Render.showNativeSaveRollRequest({
                    tokenName roll.tokenName,
                    saveAbility payload.saveAbility,
                    challenge,
                    damage roll.damage  payload.damageTotal  0,
                    damageType roll.damageType  payload.damageType  'normal',
                    command roll.command  ''
                });
                recipients.forEach((recipient) = R20.whisper(recipient, card));
            });
        },

        async resolve2014SavingDamageRolls(ctx, payload, rolls, modeOverride, abilityLabel) {
            for (let index = 0; index  rolls.length; index += 1) {
                const queuedRoll = rolls[index]  {};
                const pending = RollParser.consumePendingNativeSaveById(queuedRoll.requestId);
                if (!pending) {
                    CombatService.completePersistentAreaMarkerTarget(payload, queuedRoll.tokenId  '');
                    continue;
                }
                const token = R20.getTokenById(pending.tokenId);
                if (!token) {
                    CombatService.completePersistentAreaMarkerTarget(pending.payload  payload, pending.tokenId);
                    Render.sendWhisperMessage(ctx.who, '2014 Saving Throw', 'The pending saving throw target token was not found.', 'failure');
                    continue;
                }
                const rollMode = CombatService.normalizeRollMode(
                    pending.forcedRollMode  queuedRoll.forcedRollMode  modeOverride  'normal'
                );
                const resultRoll = CombatService.rollSavingThrowForToken(
                    token,
                    pending.rollName  (pending.payload && pending.payload.saveAbility)  '',
                    rollMode
                );
                if (!resultRoll.ok) {
                    CombatService.completePersistentAreaMarkerTarget(pending.payload  payload, token);
                    Render.sendWhisperMessage(ctx.who, '2014 Saving Throw', resultRoll.message  'Saving throw failed.', 'failure');
                    continue;
                }
                const damagePayload = Object.assign({}, pending.payload  {}, {
                    nativeSaveTotal resultRoll.total,
                    nativeSaveNatural resultRoll.natural,
                    nativeSaveModifier resultRoll.modifier,
                    nativeSaveRolls resultRoll.rolls,
                    nativeSaveMode resultRoll.mode,
                    nativeSaveRollModeReason String(pending.forcedRollReason  queuedRoll.forcedRollReason  ''),
                    nativeSaveRollName (CombatService.abilityNameToShortLabel(resultRoll.ability)  abilityLabel) + ' Save',
                    nativeSaveCharacterName resultRoll.characterName
                });
                const result = await CombatService.applyDamageToToken(token, damagePayload);
                if (!result.ok) {
                    CombatService.completePersistentAreaMarkerTarget(damagePayload, token);
                    Render.sendWhisperMessage(ctx.who, 'Damage Blocked', result.message  'Could not apply damage after the saving throw.', 'failure');
                    continue;
                }
                Render.sendDamageResult(result);
                CombatService.completePersistentAreaMarkerTarget(damagePayload, token);
            }
        },

        async send2014SavingDamageRequests(ctx, payload, challenge, rolls) {
            if (!rolls.length) return;
            const abilityLabel = CombatService.abilityNameToShortLabel(payload.saveAbility  '')  'SAVE';
            const forcedRolls = rolls.filter((roll) = !!roll.forcedRollMode);
            const promptedRolls = rolls.filter((roll) = !roll.forcedRollMode);

            if (forcedRolls.length) {
                await this.resolve2014SavingDamageRolls(ctx, payload, forcedRolls, '', abilityLabel);
            }
            if (!promptedRolls.length) return;
            if (payload.rollMode) {
                await this.resolve2014SavingDamageRolls(ctx, payload, promptedRolls, payload.rollMode, abilityLabel);
                return;
            }
            R20.whisper('GM', Render.showNativeBatchRollRequest({
                title '2014 ' + abilityLabel + ' Saving Throws',
                intro 'Roll strong' + Utils.escapeHtml(abilityLabel) + 'strong saving throws' +
                    (challenge  0  (' DC ' + Utils.escapeHtml(String(challenge)))  '') + '',
                names promptedRolls.map((roll) = roll.tokenName  roll.characterName  'Token'),
                label 'Roll',
                iconHtml '&#127922;',
                command '!combatAssistant roll2014save &#63;{Roll ModeNormal,normalAdvantage,advantageDisadvantage,disadvantage} ' +
                    Utils.encodeJsonPayload({ ids promptedRolls.map((roll) = roll.requestId  '').filter(Boolean) }),
                tooltip 'Roll all listed 2014 saving throws with Combat Assistant'
            }));
        },

        sendNativeSavingDamageBatch(ctx, payload, challenge, rolls) {
            if (!rolls.length) return;
            const abilityLabel = CombatService.abilityNameToShortLabel(payload.saveAbility  '')  'SAVE';
            const batch = R20.createNativeRollBatchAbility(
                rolls.map((roll) = R20.nativeBatchExecutionCommand(roll))
            );
            if (!batch.ok) {
                Render.sendWhisperMessage(ctx.who, 'Damage Blocked', batch.message  'Could not create Roll All button.', 'failure');
                return;
            }
            R20.whisper('GM', Render.showNativeBatchRollRequest({
                title abilityLabel + ' Saving Throws',
                intro 'Roll strong' + Utils.escapeHtml(abilityLabel) + 'strong saving throws' +
                    (challenge  0  (' DC ' + Utils.escapeHtml(String(challenge)))  '') + '',
                names rolls.map((roll) = roll.tokenName  roll.characterName  'Token'),
                label 'Roll',
                iconHtml '&#127922;',
                command batch.command,
                tooltip 'Roll all listed saving throws'
            }));
        },

        async sendDeferredSavingDamageRequests(ctx, payload, challenge, queue) {
            this.sendPlayerSavingDamageRequests(ctx, payload, challenge, queue.playerRolls);
            await this.send2014SavingDamageRequests(ctx, payload, challenge, queue.ca2014Rolls);
            this.sendNativeSavingDamageBatch(ctx, payload, challenge, queue.batchRolls);
        },

        async queueNativeSavingDamage(ctx, tokens, payload) {
            const challenge = Math.max(0, Utils.toInt(payload.challenge, 0));
            const queue = this.createSavingDamageQueue(tokens, payload, ctx);
            if (queue.autoRolls.length) {
                R20.sendNativeCommandsSequentially(
                    queue.autoRolls.map((roll) = roll.nativeCommand  roll.batchCommand  ''),
                    850
                );
            }

            const sendDeferred = () = this.sendDeferredSavingDamageRequests(ctx, payload, challenge, queue);
            const deferredDelay = queue.autoRolls.length  ((queue.autoRolls.length  900) + 350)  0;
            if (deferredDelay  0) {
                setTimeout(() = {
                    sendDeferred().catch((error) = {
                        Logger.error('[deferred-saves]', error && error.message  error.message  String(error));
                    });
                }, deferredDelay);
            } else {
                await sendDeferred();
            }

            return {
                queued queue.playerRolls.length + queue.autoRolls.length + queue.batchRolls.length + queue.ca2014Rolls.length,
                failed queue.failed
            };
        },

        async applyDamageToTargets(ctx, tokens, payload) {
            let applied = 0;
            let failed = 0;
            for (let index = 0; index  tokens.length; index += 1) {
                const token = tokens[index];
                const result = await CombatService.applyDamageToToken(token, payload);
                if (!result.ok) {
                    CombatService.completePersistentAreaMarkerTarget(payload, token);
                    Render.sendWhisperMessage(ctx.who, 'Damage Blocked', result.message  'Could not apply damage.', 'failure');
                    failed += 1;
                    continue;
                }
                Render.sendDamageResult(result);
                CombatService.completePersistentAreaMarkerTarget(payload, token);
                applied += 1;
            }
            return { applied, failed };
        },

        async handleDeal(ctx, args) {
            const permission = this.ensureApplyPermission(Object.assign({}, ctx, { actionType 'damage' }));
            if (!permission.ok) {
                Render.sendWhisperMessage(ctx.who, 'Permission Denied', permission.message, 'failure');
                return { applied 0, queued 0, failed 1 };
            }

            const parsed = this.parseDamageCommandArgs(args);
            if (!parsed.payload) {
                Render.sendWhisperMessage(ctx.who, 'Damage', 'Invalid damage payload.', 'failure');
                return { applied 0, queued 0, failed 1 };
            }
            const tokens = this.getTargetTokens(ctx, parsed.targetId);
            if (!tokens.length) {
                Render.sendWhisperMessage(ctx.who, 'Damage', 'No target tokens were found. Select one or more tokens before pressing the button.', 'warning');
                return { applied 0, queued 0, failed 1 };
            }

            if (this.requiresNativeSavingRoll(parsed.payload)) {
                const queued = await this.queueNativeSavingDamage(ctx, tokens, parsed.payload);
                return { applied 0, queued queued.queued, failed queued.failed };
            }
            const applied = await this.applyDamageToTargets(ctx, tokens, parsed.payload);
            return { applied applied.applied, queued 0, failed applied.failed };
        },

        async handleSave(ctx, args) {
            const ability = CombatService.normalizeAbilityName(args[0]  '');
            if (!ability) {
                Render.sendWhisperMessage(ctx.who, 'Saving Throw', 'Choose a valid ability strength, dexterity, constitution, intelligence, wisdom, or charisma.', 'warning');
                return;
            }
            const macroName = CombatService.getNativeSaveMacroName(ability);
            const abilityLabel = CombatService.abilityNameToShortLabel(ability)  'SAVE';
            const rollModeArg = String(args[1]  '').trim();
            const rollMode = ['normal', 'advantage', 'disadvantage', 'adv', 'dis'].indexOf(rollModeArg.toLowerCase()) = 0
                 CombatService.normalizeRollMode(rollModeArg)
                 '';
            const tokens = this.getTargetTokens(ctx, '');
            if (!tokens.length) {
                Render.sendWhisperMessage(ctx.who, 'Saving Throw', 'Select one or more linked tokens.', 'warning');
                return;
            }
            const result = this.sendNativeRollBatchForTokens(tokens, macroName, {
                saveAbility ability,
                title abilityLabel + ' Saving Throw',
                individualTitle abilityLabel + ' Saving Throw',
                rollName abilityLabel + ' Saving Throw',
                label abilityLabel,
                batchLabel abilityLabel,
                batchTitle abilityLabel + ' Saving Throws',
                batchIntro 'Roll strong' + Utils.escapeHtml(abilityLabel) + 'strong saving throws',
                iconHtml '&#128735;',
                tooltip 'Roll ' + abilityLabel + ' saving throw',
                batchTooltip 'Roll all listed ' + abilityLabel + ' saving throws',
                rollMode
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
            const tokenId = String((Utils.isFunction(token.get)  token.get('_id')  '')  token.id  '').trim();
            const characterId = String(character.id  (Utils.isFunction(token.get)  token.get('represents')  '')  '').trim();
            const needs2014Mode = characterId && R20.detectSheetVersion(characterId) === '2014' && RuntimeConfig.get('SHEET_2014_CA_ROLLS');
            const recipients = this.getNativeRollRecipients(token, character);
            const card = Render.showNativeSheetRollRequest({
                title 'Initiative Roll',
                tokenName,
                rollName 'Initiative',
                label 'Init',
                iconHtml '&#127922;',
                command '!combatAssistant rollinit ' + Utils.attrSafe(tokenId) +
                    (needs2014Mode  ' &#63;{2014 Roll ModeAuto,autoNormal,normalAdvantage,advantageDisadvantage,disadvantage}'  ''),
                tooltip 'Roll initiative with Combat Assistant'
            });
            recipients.forEach((recipient) = R20.whisper(recipient, card));
            return true;
        },

        runCombatAssistantInitiative(tokens, ctx, rollMode) {
            const automatic = [];
            const playerTokens = [];
            let requested = 0;
            const failed = [];
            tokens.forEach((token) = {
                const character = R20.getCharacterFromToken(token);
                if (!character) {
                    failed.push(CombatService.getTokenName(token) + ' must be linked to a character.');
                    return;
                }
                if (R20.isPlayerControlledToken(token, character) && RuntimeConfig.get('PLAYER_MANUAL_ROLL')) {
                    playerTokens.push(token);
                    return;
                }
                const characterId = String(character.id  (Utils.isFunction(token.get)  token.get('represents')  '')  '').trim();
                const forcedMode = characterId && R20.detectSheetVersion(characterId) === '2014' && RuntimeConfig.get('SHEET_2014_CA_ROLLS')
                     rollMode
                     '';
                const result = CombatService.rollInitiativeForToken(token, forcedMode);
                if (result.ok) automatic.push(result);
                else failed.push(result.message  'Initiative roll failed.');
            });
            if (automatic.length) {
                CombatService.applyInitiativeResults(automatic);
                R20.direct(Render.showInitiativeResults(automatic));
            }
            playerTokens.forEach((token) = {
                if (this.whisperCombatAssistantInitiativeButton(token, ctx)) requested += 1;
            });
            if (requested) {
                Render.sendWhisperMessage(ctx.who, 'Initiative', 'Initiative roll request sent to player-controlled token(s).', 'normal');
            }
            if (failed.length) Render.sendWhisperMessage(ctx.who, 'Initiative', Utils.escapeHtml(failed.join(' ')), 'warning');
        },

        async handleCombatAssistantInitiativeRoll(ctx, args) {
            const tokenId = String(args[0]  '').trim();
            const rollModeArg = String(args[1]  '').trim();
            const rollMode = ['auto', 'sheet', 'normal', 'advantage', 'disadvantage', 'adv', 'dis'].indexOf(rollModeArg.toLowerCase()) = 0
                 CombatService.normalizeInitiativeRollMode(rollModeArg)
                 '';
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
            const characterId = character  String(character.id  (Utils.isFunction(token.get)  token.get('represents')  '')  '').trim()  '';
            const forcedMode = characterId && R20.detectSheetVersion(characterId) === '2014' && RuntimeConfig.get('SHEET_2014_CA_ROLLS')
                 rollMode
                 '';
            const result = CombatService.rollInitiativeForToken(token, forcedMode);
            if (!result.ok) {
                Render.sendWhisperMessage(ctx.who, 'Initiative', result.message  'Initiative roll failed.', 'failure');
                return;
            }
            CombatService.applyInitiativeResults([result]);
            R20.direct(Render.showInitiativeResults([result]));
        },

        async handleInitiative(ctx, args) {
            args = args  [];
            const rollModeArg = String(args[0]  '').trim();
            const rollMode = ['auto', 'sheet', 'normal', 'advantage', 'disadvantage', 'adv', 'dis'].indexOf(rollModeArg.toLowerCase()) = 0
                 CombatService.normalizeInitiativeRollMode(rollModeArg)
                 '';
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
                    'div style=text-alignleft;font-size11px;line-height13px;strongTurn Order Before Initiativestrongbrcode' +
                        Utils.escapeHtml(JSON.stringify(RollParser.getCurrentTurnOrder())) +
                    'codediv',
                    'normal'
                );
            }
            const result = this.sendNativeRollBatchForTokens(tokens, 'initiative', {
                title 'Initiative Roll',
                individualTitle 'Initiative Roll',
                rollName 'Initiative',
                label 'Init',
                batchLabel 'Init',
                batchTitle 'Initiative Rolls',
                batchIntro 'Roll strongInitiativestrong for',
                iconHtml '&#127922;',
                tooltip 'Roll initiative',
                batchTooltip 'Roll initiative for all listed tokens',
                trackInitiative true,
                rollMode
            });
            if (result.failed.length) Render.sendWhisperMessage(ctx.who, 'Initiative', Utils.escapeHtml(result.failed.join(' ')), 'warning');
        },

        handleTest(ctx, args) {
            const tokens = this.getTargetTokens(ctx, '');
            if (!tokens.length) {
                Render.sendPublicMessage(
                    'Combat Assistant Test',
                    'No selected token.',
                    'warning'
                );
                return;
            }
            const rows = tokens.map((token) = {
                const character = R20.getCharacterFromToken(token);
                const tokenName = CombatService.getTokenName(token);
                const tokenControlledBy = token && Utils.isFunction(token.get)  String(token.get('controlledby')  '')  '';
                const characterControlledBy = character && Utils.isFunction(character.get)  String(character.get('controlledby')  '')  '';
                const characterName = character && Utils.isFunction(character.get)  String(character.get('name')  '')  '';
                return 'div style=padding2px 0;text-alignleft;' +
                    'b' + Utils.escapeHtml(tokenName) + 'bbr' +
                    'token.controlledby code' + Utils.escapeHtml(tokenControlledBy  '(empty)') + 'codebr' +
                    'character code' + Utils.escapeHtml(characterName  '(none)') + 'codebr' +
                    'character.controlledby code' + Utils.escapeHtml(characterControlledBy  '(empty)') + 'code' +
                'div';
            }).join('hr style=border0;border-top1px solid rgba(255,255,255,0.25);margin4px 0;');
            Render.sendPublicMessage(
                'Combat Assistant Test',
                rows,
                'normal'
            );
        },

        handleTestRun(ctx, args) {
            const payload = Utils.decodeJsonPayload(args[0]  '', {});
            const command = String(payload.command  '').trim();
            if (!command) {
                Render.sendWhisperMessage(ctx.who, 'Test Button', 'No command was provided.', 'warning');
                return;
            }
            R20.send(command);
        },

        async handleHeal(ctx, args) {
            let applied = 0;
            let failed = 0;
            const permission = this.ensureApplyPermission(Object.assign({}, ctx, { actionType 'heal' }));
            if (!permission.ok) {
                Render.sendWhisperMessage(ctx.who, 'Permission Denied', permission.message, 'failure');
                return { applied, failed failed + 1 };
            }
            let payload = null;
            let targetId = '';
            if (String(args[0]  '').toLowerCase() === 'manual') {
                payload = {
                    type 'heal',
                    mode String(args[1]  'hp').trim().toLowerCase() === 'temp'  'temp'  'hp',
                    amount Math.max(0, Utils.toInt(args[2], 0)),
                    sourceName 'Manual',
                    sourceAction 'Manual Healing'
                };
                targetId = args[3]  '';
            } else {
                payload = Utils.decodeJsonPayload(args[0]  '', null);
                targetId = args[1]  '';
            }
            if (!payload) {
                Render.sendWhisperMessage(ctx.who, 'Healing', 'Invalid healing payload.', 'failure');
                return { applied, failed failed + 1 };
            }
            const tokens = this.getTargetTokens(ctx, targetId);
            if (!tokens.length) {
                Render.sendWhisperMessage(ctx.who, 'Healing', 'No target tokens were found. Select one or more tokens before pressing the button.', 'warning');
                return { applied, failed failed + 1 };
            }
            const successfulResults = [];
            const sourceName = String(payload.sourceName  '').trim();
            const sourceAction = String(payload.sourceAction  '').trim();
            const isManualHealing = ^manual$i.test(sourceName)  ^manual(s+healing)$i.test(sourceAction);
            const aggregateGmHealing = !!(ctx && ctx.isGM && isManualHealing && String(payload.mode  'hp').toLowerCase() !== 'temp');
            for (let i = 0; i  tokens.length; i += 1) {
                const result = await CombatService.applyHealToToken(tokens[i], payload);
                if (!result.ok) {
                    CombatService.completePersistentAreaMarkerTarget(payload, tokens[i]);
                    Render.sendWhisperMessage(ctx.who, 'Healing Blocked', result.message  'Could not apply healing.', 'failure');
                    failed += 1;
                    continue;
                }
                successfulResults.push(result);
                if (!aggregateGmHealing) Render.sendHealResult(result, ctx.who);
                CombatService.completePersistentAreaMarkerTarget(payload, tokens[i]);
                applied += 1;
            }
            if (aggregateGmHealing && successfulResults.length) {
                Render.sendGmHealingSummary(successfulResults, payload.amount  payload.healing  payload.heal  0, ctx.who);
            }
            return { applied, failed };
        }
    };

     -----------------------------------------------------------------------
      Events  registration
      --------------------------------------------------------------------- 
    const Events = {
        onGraphicChange(obj, previous) {
            try {
                if (!SCRIPT_ACTIVE) return;
                R20.syncAreaMarkerGroupForMovedToken(obj);
                TurnTracker.handleGraphicChange(obj, previous  {});
            } catch (error) {
                Logger.debug('[changegraphic]', error && error.message  error.message  String(error));
            }
        },

        onGraphicDestroy(obj) {
            try {
                if (!SCRIPT_ACTIVE) return;
                const tokenId = R20.getTokenId(obj);
                const concentration = tokenId  State.getConcentrationByTokenId(tokenId)  null;
                if (concentration) {
                    CombatService.endConcentrationByTokenId(tokenId, 'caster token removed', { silent true });
                }
                R20.handleAreaMarkerDestroyed(obj);
                TurnTracker.handleGraphicDestroyed(obj);
            } catch (error) {
                Logger.debug('[destroygraphic]', error && error.message  error.message  String(error));
            }
        },

        onTurnOrderChange(campaign, previous) {
            try {
                if (!SCRIPT_ACTIVE) return;
                TurnTracker.handleTurnOrderChange(campaign, previous  {});
            } catch (error) {
                Logger.debug('[changecampaignturnorder]', error && error.message  error.message  String(error));
            }
        },

        async onChatMessage(msg) {
            try {
                if (!SCRIPT_ACTIVE) return;
                State.cleanupRuntimeQueues();
                if (msg && msg.type !== 'api') {
                    RollParser.maybeDumpChatProbe(msg);
                    await RollParser.handleChatMessage(msg);
                    return;
                }
                if (!msg  msg.type !== 'api') return;
                const parsed = Utils.splitCommand(msg.content);
                const base = String(parsed.base  '').trim().toLowerCase();
                if (COMMANDS.indexOf(base)  0) return;
                const who = Utils.asString(msg.who).replace(s+(GM)$i, '');
                const playerId = msg.playerid  '';
                const isGM = typeof playerIsGM === 'function'  playerIsGM(playerId)  false;
                const ctx = { msg, who, playerId, isGM, args parsed.args, raw parsed.raw };
                await CommandHandlers.handle(ctx);
            } catch (error) {
                Logger.error('[chatmessage]', error && error.stack  error.stack  (error && error.message  error.message  String(error)));
                try {
                    R20.whisper('GM', Html.card({
                        title META.NAME + ' Error',
                        body 'div style=font-size12px;line-height15px;colorrgb(240,180,180);' + Utils.escapeHtml(error && error.message  error.message  String(error)) + 'div',
                        buildOptions { titleColor 'rgb(225,60,60)', borderColor 'rgb(127,0,0)' }
                    }));
                } catch (ignored) {}
            }
        },

        onReady() {
            const capabilities = R20.getRuntimeCapabilities();
            State.ensure();
            State.reconcilePersistentState();
            State.cleanupRuntimeQueues(true);
            CombatService.repairConcentrationTooltips();
            R20.cleanupBatchAbilities(20, PLAYER_ACTION_TTL_MS, { noCreate true, removeWhenEmpty true, removeAll true });
            SCRIPT_ACTIVE = true;
            TurnTracker.initializeFromCurrentTurnOrder();

            if (!capabilities.sheetWriter) {
                Render.sendWhisperMessage(
                    'GM',
                    META.NAME.toUpperCase(),
                    Html.span('SHEET WRITES DISABLEDbr', 'colorrgb(208,139,28)') +
                    'br' +
                    'Roll20 setSheetItem() is not available. Linked Beacon HP and Temp HP cannot be changed, but unlinked token bars and non-sheet features remain active.',
                    'warning'
                );
            }

            Render.showBootstrapCard();
            Logger.info(
                'Ready v' + META.VERSION +
                ' sheetWriter=' + String(capabilities.sheetWriter) +
                '. Use !combatAssistant menu or !combat-assistant help'
            );
        }
    };

    on('ready', () = {
        Events.onReady();
        on('chatmessage', Events.onChatMessage);
        on('changegraphic', Events.onGraphicChange);
        on('destroygraphic', Events.onGraphicDestroy);
        on('changecampaignturnorder', Events.onTurnOrderChange);
    });

    return Object.freeze({
        META,
        CONFIG,
        State,
        RuntimeConfig,
        Utils,
        Html,
        R20,
        CombatEffects,
        Render,
        RollParser,
        TurnTracker,
        CombatService,
        ActionService,
        ResourceService
    });
})();