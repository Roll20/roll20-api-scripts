/* jshint undef: true */
/* globals
 sendChat,
 randomInteger,
 _,
 on
*/

/**
 * Critical Hit & Fumble effect generator
 */
const ImprovedCritical = (function() {
    'use strict';

    // <editor-fold desc="Effect Lists">
    const weaponCriticalHit = [
        {low: 1,  high: 1,  description: "You feel accomplished, but nothing remarkable happens.", effect: "Regular critical hit.", spellDescription: "You feel accomplished, but nothing remarkable happens.", spellEffect: "Regular spell critical hit"},
        {low: 2, high: 5,  description: "You feel it is imperative to press the advantage no matter the cost.", effect:"You can choose to gain advantage on your next attack roll against your target, but all enemies have advantage on their attack rolls against you until the end of your next turn."},
        {low: 6, high: 9,  description: "You feel it is imperative to press the advantage, but maintain awareness of your surroundings.", effect: "You can choose to gain advantage on your next attack roll against your target, your target has advantage on their attack rolls against you until the end of your next turn."},
        {low: 10, high: 14,  description: "You know how to press the advantage.", effect: "You gain advantage on all attacks against your target until the end of your next turn."},
        {low: 15, high: 19,  description: "As you are fighting, you notice an effective route to escape danger.", effect: "You are able to use the disengage action after your attack."},
        {low: 20, high: 24,  description: "You feel the eb and flow of the battle, and know where to make your next move.", effect: "After your turn you move to the top of the initiative order."},
        {low: 25, high: 29,  description: "You begin to recognize patterns in your opponents fighting technique.", effect: "You gain +2 to your AC against your target, and advantage on all savings throws from effects originating from your target until your next turn."},
        {low: 30, high: 39,  description: "You are able to maneuver towards your opponent while attacking, and attempt to harass them.", effect: "After your attack you can choose to attempt to grapple your opponent if you have a free hand, or attempt to shove your opponent if both hands are in use."},
        {low: 40, high: 49,  description: "You are able to maneuver towards your opponent while attacking and harass them.", effect: "After your attack you can choose to automatically succeed in grappling your opponent if you have a free hand, or shoving your opponent if both hands are in use."},
        {low: 50, high: 59,  description: "You attempt to disarm your opponent.", effect:  "You are able to take the disarm action after your attack"},
        {low: 60, high: 69,  description: "You kick your target's weapon out of their hands.", effect: "You are able to take the disarm action after your attack, and can steal your opponents weapon if you have a free hand. Otherwise you can knock it up to 20 feet away."},
        {low: 70, high: 74,  description: "Your senses heighten and you become aware of threats around the battlefield.", effect: "You are able to use the dodge action after your attack."},
        {low: 75, high: 79,  description: "Your attack knocks your target over.", effect: "Your target is knocked prone."},
        {low: 80, high: 84,  description: "Your strike surprises your opponent.", effect: "Your opponent cannot take reactions until the end of their next turn and they are moved to the bottom of the initiative order."},
        {low: 85, high: 89,  description: "You strike with great force.", effect: "Roll an additional set of damage dice above and beyond your normal critical roll."},
        {low: 90, high: 94,  description: "You strike with extreme force.", effect: "Roll an additional set of damage dice above and beyond your normal critical roll, and the target suffers one unit of exhaustion."},
        {low: 95, high: 99,  description: "You strike with debilitating force.", effect: "Roll an additional set of damage dice above and beyond your normal critical roll, and the target suffers a permanent injury chosen by the DM. The permanent injury can be healed with extended rest of a length determined by the DM, but the attack leaves a scar."},
        {low: 100, high: 100,  description: "You strike with devastating force.", effect: "Roll an additional set of damage dice above and beyond your normal critical roll, and the target suffers 1 unit of exhaustion, and the target suffers a permanent injury chosen by the DM. The permanent injury can be healed with extended rest of a length determined by the DM, but the attack leaves a scar."}
    ];

    const spellCriticalHit = [
        {low: 1,  high: 1, description: "You feel accomplished, but nothing remarkable happens.", effect: "Regular spell critical hit."},
        {low: 2, high: 5,  description: "You feel it is imperative to press the advantage no matter the cost.", effect: "You can choose to gain advantage on your next attack roll against your target, but all enemies have advantage on their attack rolls against you until the end of your next turn."},
        {low: 6, high: 9,  description: "You feel it is imperative to press the advantage, but maintain awareness of your surroundings.", effect: "You can choose to gain advantage on your next attack roll against your target, your target has advantage on their attack rolls against you until the end of your next turn."},
        {low: 10, high: 14, description: "As you are fighting, you notice an effective route to escape danger.", effect: "You are able to use the disengage action after your attack."},
        {low: 15, high: 19, description: "You feel the eb and flow of the battle, and know where to make your next move.", effect: "After your turn you move to the top of the initiative order."},
        {low: 20, high: 29, description: "Your spell cripples your opponent.", effect: "Your target's movement speed is cut in half for their next 2 turns."},
        {low: 30, high: 39, description: "Your spell attack knocks your target over.", effect: "Your target is knocked prone."},
        {low: 40, high: 49, description: "The light from your spell flashes near your target's eyes", effect: "Your target is blinded until the end of their next turn."},
        {low: 50, high: 59, description: "You blast the targets weapons out of their hands.", effect: "Your target's weapon is flung 1d6*5 feet away in a random direction."},
        {low: 60, high: 69, description: "The sight of your magic fills the target's heart with fear.", effect: "Your target is frightened by you until you stop casting magic. You are able to discern the source of your targets fear."},
        {low: 70, high: 74, description: "The force from your spell stuns your opponent.", effect: "Your target is incapacitated until the end of their next turn."},
        {low: 75, high: 79, description: "Your spell is incidentally infused with fey energy.", effect: "Roll 10d8. If your targets current health is lower than the number rolled they fall asleep for 1 minute."},
        {low: 80, high: 84, description: "Roll 10d8. If your targets current health is lower than the number rolled they fall asleep for 1 minute.", effect: "Your opponent cannot take reactions and is moved to the bottom of the initiative order."},
        {low: 85, high: 89, description: "Your spell strikes with great force.", effect: "Roll an additional set of spell damage dice above and beyond your normal critical roll."},
        {low: 90, high: 94, description: "Your spell strikes with extreme force.", effect: "Roll an additional set of spell damage dice above and beyond your normal critical roll, and the target suffers one unit of exhaustion."},
        {low: 96, high: 99, description: "Your spell strikes with debilitating force.", effect: "Roll an additional set of spell damage dice above and beyond your normal critical roll, and the target suffers a permanent injury chose by the DM. The permanent injury can be healed with extended rest of a length determined by the DM, but the attack leaves a scar."},
        {low: 100, high: 100, description: "Your spell strikes with devastating force.", effect: "Roll an additional set of spell damage dice above and beyond your normal critical roll, and the target suffers 1 unit of exhaustion, and the target suffers a permanent injury chose by the DM. The permanent injury can be healed with extended rest of a length determined by the DM, but the attack leaves a scar."}
    ];

    const weaponFumble = [
        {low: 1, high: 1, description: "You are embarassed by your poor showing, but nothing remarkable happens.", effect: "You miss your attack."},
        {low: 2, high: 5, description: "You lose your combat footing, exposing yourself to your target.", effect: "Your target has advantage on their first attack roll against you next round."},
        {low: 6, high: 9, description: "You lose your combat footing, exposing yourself to your enemies.", effect: "Your enemies have advantage on their first attack roll against you next round."},
        {low: 10, high: 14, description: "You lose your combat footing, and have difficulty recovering.", effect: "Your enemies have advantage on their attack rolls against you until the end of your next turn."},
        {low: 15, high: 19, description: "Melee: You get tangled with your enemy and fall over. Ranged: You spill your quiver.", effect: "Melee: You are knocked prone and your movement is reduced to 0. Your target must succeed a DC 10 dexterity check or they are also knocked prone. Ranged: You must pick up arrows individually from the ground using your \"environmental interaction\", or the \"Use an Object\" action to nock your bow."},
        {low: 20, high: 29, description: "You lose your balance while attacking.", effect: "You fall prone and your movement is reduced to 0."},
        {low: 30, high: 39, description: "As you attack your opponent you begin to fear that they are the superior combatant.", effect: "Disadvantage on your next attack roll against your target."},
        {low: 40, high: 49, description: "You miss an attack and gaze upon the chaos of the battle, causing your confidence to falter.", effect: "Disadvantage on your next attack roll against any target."},
        {low: 50, high: 59, description: "You lose your grip as you attack.", effect: "Roll a DC 10 Dexterity Check, on failure you drop your weapon at your feet."},
        {low: 60, high: 69, description: "Melee: The weapon slips from your hand as you attack. Ranged: Your ammunition gets lodged in its container.", effect: "Melee: Roll a DC 10 Dexterity Check, on failure you throw your weapon into your enemy's space. DM determines where the item is thrown on large sized or greater creatures. Ranged: You must use an action to organize the ammunition in its case before you can make another ranged attack."},
        {low: 70, high: 79, description: "Melee: You lunge past an enemy exposing yourself to his attack. Ranged: Your missile startles your allies near your target.", effect: "Melee: Enemy you were attacking is able to use their reaction to perform and attack of opportunity. Ranged: the target can perform an opportunity attack on any ally within melee range."},
        {low: 80, high: 84, description: "Missing what you thought was a critical blow causes you to panic.", effect: "You cannot take reactions until the end of your next turn, and you are moved to the bottom of the initiative order."},
        {low: 85, high: 89, description: "You attack wildly and lose track of the fight around you.", effect: "You attack your nearest ally that is within range of your weapon."},
        {low: 90, high: 94, description: "You lose your footing while attacking and fall to the ground bumping your head.", effect: "You fall prone. Roll a DC 10 constitution save, on failure you take 1d6 bludeoning damage and are knocked unconscious for 1 minute or until you receive damage from any source. On success take half damage and you remain conscious."},
        {low: 95, high: 99, description: "You lose your footing while attacking and fall head first.", effect: "You fall prone. Roll a DC 15 constitution save, on failure you take 2d6 damage and are knocked unconscious for 1 minute or until you receive damage from any source. On success take half damage and you remain conscious."},
        {low: 100, high: 100, description: "You lose your footing while attacking and slam your head into the ground.", effect: "You fall prone, take 3d6 damage, and become unconscious for 1 minute or until you receive damage from any source."}
    ];

    const spellFumble = [
        {low: 1, high: 1, description: "You are embarassed by your poor showing, but nothing remarkable happens.", effect: "You miss your attack."},
        {low: 2, high: 5, description: "You get wrapped up in your spellcasting and forget to watch your target.", effect: "Your target has advantage on their first attack roll against you next round."},
        {low: 6, high: 9, description: "You get wrapped up in your spellcasting and forget to watch your surroundings.", effect: "All enemies have advantage on their first attack roll against you next round."},
        {low: 10, high: 14, description: "You are so wrapped up in your spellcasting that you forget you are fighting a battle.", effect: "All enemies have advantage on their attack rolls against you until the end of your next turn."},
        {low: 15, high: 19, description: "Your spell creates a large plume of smoke obscuring your location.", effect: "The area in a 5 foot radius around your location becomes heavily obscured for 1 minute. A strong breeze can blow away the smoke in 1 round."},
        {low: 20, high: 29, description: "Your spell misfires knocking you over.", effect: "You are knocked prone."},
        {low: 30, high: 39, description: "The spell fires in an unexpected manner, causing your confidence in your abilities to falter.", effect: "You have disadvantage on any spell attacks, and enemies have advantage against your spell savings throws until the end of your next turn."},
        {low: 40, high: 49, description: "The placement of your spell startles your allies near your target, causing them to drop their guard.", effect: "Your target is able to use their reaction to take an attack of opportunity on one of your allies in melee range."},
        {low: 50, high: 59, description: "You scramble the ingredients of your component pouch or your focus becomes overloaded with magical energy and temporarily stops working.", effect: "You are unable to cast spells requiring material components until the end of your next turn."},
        {low: 60, high: 69, description: "Your arm cramps as you cast.", effect: "You are unable to cast spells requiring somatic components until the end of your next turn."},
        {low: 70, high: 79, description: "You bite your tongue as you cast.", effect: "You are unable cast spells requiring verbal components until the end of your next turn."},
        {low: 80, high: 84, description: "Your spell misfires and dazes you, causing you to lose track of the fight.", effect: "End your current turn. You cannot take reactions until the end of your next turn, and you are placed last in the initiative order."},
        {low: 85, high: 89, description: "Your spell misfires causing you to panic.", effect: "Ranged/Melee: Your spell targets your nearest ally that is in range of the spell. AoE: The spell goes off targeting your nearest ally/allies."},
        {low: 90, high: 94, description: "Your spell backfires creating a small explosion causing you to fall and bump your head.", effect: "You fall prone. Roll a DC 10 constitution save, on failure you take 1d6 bludeoning damage and are knocked unconscious for 1 minute or until you receive damage from any source. On success take half damage and you remain conscious."},
        {low: 95, high: 99, description: "Your spell backfires creating a large explosion causing you to fall and bump your head", effect: "You fall prone. Roll a DC 15 constitution save, on failure you take 1d6 bludgeoning damage, 1d6 thunder damage, and are knocked unconscious for 1 minute or until you receive damage from any source. On success take half damage and you remain conscious."},
        {low: 100, high: 100, description: "Your spell completely backfires creating a large explosion causing you to fall and bump your head.", effect: "You hit yourself with your spell. If the spell effect is instant you take the full effect. If the spell requires concentration the effect persists until the end of your next turn. You also fall prone, take 1d6 bludgeoning damage, 1d6 thunder damage, and become unconscious for 1 minute or until you receive damage from any source."}
    ];
    // </editor-fold>

    /**
     * Register 'chat:message' event so that we can capture chat events
     */
    const registerEventHandlers = () => {
        on('chat:message', ImprovedCritical.handleChatMessage);
    }

    /**
     * Internal function given the criticalHit or fumble array and roll value that returns the object indicating the description and effect.
     * @param {object[]} effectList Either `weaponCriticalHit`, `spellCriticalHit`, `weaponFumble`, or `spellFumble` array
     * @param {number} roll The percentage rolled
     * @return {object} smack
     * @private
     */
    const _determineEffect = (effectList, roll) => {
        return _.find(effectList, (hit) => {
            return (roll >= hit.low && roll <= hit.high);
        });
    }

    /**
     * Grab the incoming chat message object and check if it is a !critical or !fumble command
     * @see https://help.roll20.net/hc/en-us/articles/360037256754-API-Chat
     * @param {object} msg
     */
    const handleChatMessage = (msg) => {
        /**
         * Send a formatted error message to the chat
         * @param {string} details
         */
        const sendChatError = (details) => {
            const errorTemplate = "&{template:default} {{name= Error}} {{Details=" + details + "}}";
            sendChat('Error Bot', errorTemplate);
        }

        /**
         * Determine if the given argument is numeric returning true if a number, otherwise false.
         * @param {any} n Value to check if is a number
         * @return {boolean}
         */
        const isNumber = (n) => {
            return typeof n ==='number' && n === Number(n) && Number.isFinite(n);
        };

        // Check if we are dealing with a !critical command.
        if (msg.type === "api" && (msg.content.indexOf("!critical") !== -1 || msg.content.indexOf("!fumble") !== -1)) {
            const contentWords = msg.content.split(" ");

            // Sanity check
            if (contentWords.length > 0) {
                // Check that there is zero or only one argument
                if (contentWords.length > 2) {
                    sendChatError('Invalid syntax. Too many arguments.');
                    return;
                }

                // Sanity check
                if (contentWords[0] === '!critical' || contentWords[0] === '!fumble') {
                    let rolled;

                    // Was a roll amount given? If so parse the second "word" as an int, otherwise create a randomInteger.
                    if (contentWords.length === 2) {
                        const percent = contentWords[1];
                        rolled = parseInt(percent);

                        // Check for non number
                        if (!isNumber(rolled)) {
                            sendChatError('Invalid roll percent given (' + percent.toString() + '), or something went wrong.');
                            return;
                        }

                        if (rolled <1 || rolled > 100) {
                            sendChatError('Invalid roll percent given (' + percent.toString() + '), or something went wrong.');
                            return;
                        }
                    } else {
                        rolled = randomInteger(100);
                    }

                    // Is a !critical command?
                    if (contentWords[0] === '!critical') {
                        // Get the criticalHit objects as a smash variables
                        const weaponSmash = ImprovedCritical._determineEffect(weaponCriticalHit, rolled);
                        const spellSmash = ImprovedCritical._determineEffect(spellCriticalHit, rolled);

                        // Sanity check
                        if (weaponSmash && spellSmash) {
                            // Template formatting for a nicer display
                            const template = "&{template:default} {{name= Critical " + rolled.toString() + "%}} {{Weapon=" + weaponSmash.description + "}} {{Weapon Effect= " + weaponSmash.effect + "}} {{Spell=" + spellSmash.description + "}} {{Spell Effect= " + spellSmash.effect + "}}";

                            // Send the critical description and effect as a formatted string in chat
                            sendChat(msg.who, template);
                        } else {
                            sendChatError('Invalid roll percent given or something went wrong.');
                        }
                        return;
                    }

                    // Is it a !fumble command?
                    if (contentWords[0] === '!fumble') {
                        // Get the fumble objects as oops variables
                        const weaponOops = ImprovedCritical._determineEffect(weaponFumble, rolled);
                        const spellOops = ImprovedCritical._determineEffect(spellFumble, rolled);

                        // Sanity check
                        if (weaponOops && spellOops) {
                            // Template formatting for a nicer display
                            const template = "&{template:default} {{name= Fumble " + rolled.toString() + "%}} {{Weapon=" + weaponOops.description + "}} {{ Weapon Effect= " + weaponOops.effect + "}} {{Spell= " + spellOops.description + "}} {{Spell Effect= " + spellOops.effect + "}}";

                            // Send the fumble description and effect as a formatted string in chat
                            sendChat(msg.who, template);
                        } else {
                            sendChatError('Invalid roll percent given or something went wrong.');
                        }
                        return;
                    }

                    // Something went very, very wrong here!
                    sendChatError('Something went wrong. Try again.');
                }
            }
        }
    }

    return {
        registerEventHandlers: registerEventHandlers,
        handleChatMessage: handleChatMessage,
        _determineEffect: _determineEffect
    }
}());

/**
 * Fires when the page has loaded.
 */
on("ready", () => {
    ImprovedCritical.registerEventHandlers();
});