var API_Meta = API_Meta ||
{}; //eslint-disable-line no-var
API_Meta.Condefinition = {
    offset: Number.MAX_SAFE_INTEGER,
    lineCount: -1
};
{
    try
    {
        throw new Error('');
    }
    catch (e)
    {
        API_Meta.Condefinition.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (7));
    }
}

/* globals libTokenMarkers, TokenMod, SmartAoE */



on('ready', () =>
{

    // Make sure libTokenMarkers exists, has the functions that are expected, and has a constant for testing
    if('undefined' === typeof libTokenMarkers ||
        (['getStatus', 'getStatuses', 'getOrderedList'].find(k =>
            !libTokenMarkers.hasOwnProperty(k) || 'function' !== typeof libTokenMarkers[k]
        ))
    )
    {
        // notify of the missing library
        sendChat('', `/w gm <div style="color:red;font-weight:bold;border:2px solid red;background-color:black;border-radius:1em;padding:1em;">Missing dependency: libTokenMarkers.<br>You can install this on your Mod Page with One-Click install.</div>`);
        return;

    }

    // Checks for the existence of a given marker. Used for determining whether to create marketplace buttons
    const markerExists = (marker) =>
    {
        if(!marker || !marker.length) return false;

        const match = /(@\d+$|:)/.exec(marker);
        const endIndex = match ? match.index : marker.length;

        const key = marker.slice(0, endIndex);
        const status = libTokenMarkers.getStatus(key);

        return status.getName() === marker;
    };

    let definitions2014 = [
        ["concentrating", "Some Spells require you to maintain Concentration in order to keep their magic active. If you lose concentra⁠tion, such a spell ends.<BR>If a spell must be maintained with Concentration, that fact appears in its Duration entry, and the spell specifies how long you can conce⁠ntrate on it. You can end Concentration at any time (no Action required).<BR>Normal activity, such as moving and Attacking, doesn’t interfere with Concentration. The following factors can break concentration:<BR>• Casting another spell that requires Concentration. You lose concentr⁠ation on a spell if you cast another spell that requires conc⁠entration. You can’t concentrate on two Spells at once.<BR>• Taking Damage. Whenever you take damage while you are concentrating on a spell, you must make a Constitution saving throw to maintain your Concentration. The DC equals 10 or half the damage you take, whichever number is higher. If you take damage from multiple sources, such as an arrow and a dragon’s breath, you make a separate saving throw for each source of damage.<BR>• Being Incapacitated or killed. You lose Concentration on a spell if you are incap⁠acitated or if you die.<BR>• The DM might also decide that certain environmental phenomena, such as a wave Crashing over you while you’re on a storm-tossed ship, require you to succeed on a DC 10 Constitution saving throw to maintain Concentration on a spell."],
        ["blinded", "• A blinded creature can’t see and automatically fails any ability check that requires sight.<BR>• Attack rolls against the creature have advantage, and the creature’s attack rolls have disadvantage."],
        ["charmed", "A charmed creature can’t attack the charmer or target the charmer with harmful bilities or magical Effects.<BR>The charmer has advantage on any ability check to interact socially with the creature."],
        ["deafened", "A deafened creature can’t hear and automatically fails any ability check that requires hearing."],
        ["exhaustion", "Some special ablities and environmental hazards, such as starvation and the long-term effects of freezing or scorching temperatures, can lead to a spcial condition called exhaustion. Exhaustion is measured in six levels. An Effect can give a creature one or more levels of exhaustion, as specified in the effect’s description.<BR><BR><table><thead><tr><th>Lvl&nbsp;</th><th>Effect</th></tr></thead><tbody><tr><td>1</td><td>Disadvantage on Ability Checks</td></tr><tr><td>2</td><td>Speed halved</td></tr><tr><td>3</td><td>Disadvantage on attack rolls and Saving Throws<br></td></tr><tr><td>4</td><td>Hit point maximum halved</td></tr><tr><td>5</td><td>Speed reduced to 0</td></tr><tr><td>6</td><td>Death</td></tr></tbody></table><BR>If an already exhausted creature suffers another effect that causes exhaustion, its current level of exhaustion increases by the amount specified in the effect’s description.<BR><BR>A creature suffers the effect of its current level of exhaustion as well as all lower levels. For example, a creature suffering level 2 exhaustion has its speed halved and has disadvantage on Ability Checks.<BR><BR>An Effect that removes exhaustion reduces its level as specified in the effect’s description, with all exhaustion Effects Ending if a creature’s exhaustion level is reduced below 1.<BR><BR>Finishing a Long Rest reduces a creature’s exhaustion level by 1, provided that the creature has also ingested some food and drink. Also, being raised from the dead reduces a creature's exhaustion level by 1."],
        ["frightened", "A frightened creature has disadvantage on Ability Checks and attack rolls while the source of its fear is within Line of Sight.<BR>The creature can’t willingly move closer to the source of its fear."],
        ["grappled", "A grappled creature’s speed becomes 0, and it can’t benefit from any bonus to its speed.<BR>The condition ends if the grappler is <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef incapacitated'>incapacitated</a>.<BR>The condition also ends if an Effect removes the grappled creature from the reach of the Grappler or Grappling Effect, such as when a creature is hurled away by the thunderwave spell."],
        ["incapacitated", "An incapacitated creature can’t take actions or reactions."],
        ["invisible", "An invisible creature is impossible to see without the aid of magic or a spcial sense. For the purpose of hiding, the creature is heavily obscured. The creature’s location can be detected by any noise it makes or any tracks it leaves.<BR>Attack rolls against the creature have disadvantage, and the creature’s Attack rolls have advantage."],
        ["paralyzed", "A paralyzed creature is <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef incapacitated'>incapacitated</a> and can’t move or speak.<BR>The creature automatically fails Strength and Dexterity Saving Throws.<BR>Attack rolls against the creature have advantage.<BR>Any Attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature."],
        ["petrified", "A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.<BR>The creature is <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef incapacitated'>incapacitated</a>, can’t move or speak, and is unaware of its surroundings.<BR>Attack rolls against the creature have advantage.<BR>The creature automatically fails Strength and Dexterity Saving Throws.<BR>The creature has Resistance to all damage.<BR>The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized."],
        ["poisoned", "A poisoned creature has disadvantage on attack rolls and Ability Checks."],
        ["prone", "A prone creature’s only Movement option is to crawl, unless it stands up and thereby ends the condition.<BR>The creature has disadvantage on attack rolls. <BR>An attack roll against the creature has advantage<BR>if the attacker is within 5 feet of the creature.Otherwise, the attack roll has disadvantage."],
        ["restrained", "A restrained creature’s speed becomes 0, and it can’t benefit from any bonus to its speed.<BR>Attack rolls against the creature have advantage, and the creature’s Attack rolls have disadvantage.<BR>The creature has disadvantage on Dexterity Saving Throws."],
        ["stunned", "A stunned creature is <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef incapacitated'>incapacitated</a>, can’t move, and can speak only falteringly.<BR>The creature automatically fails Strength and Dexterity Saving Throws.<BR>Attack rolls against the creature have advantage."],
        ["unconscious", "An unconscious creature is <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef incapacitated'>incapacitated</a>, can’t move or speak, and is unaware of its surroundings<BR>The creature drops whatever it’s holding and falls prone.<BR>The creature automatically fails Strength and Dexterity Saving Throws.<BR>Attack rolls against the creature have advantage.<BR>Any Attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature."],
        ["dead", "A dead creature is an object.<BR>Most GMs have a monster die the instant it drops to 0 Hit Points, rather than having it fall Unconscious and make death Saving Throws.<BR>Mighty Villains and Special nonplayer Characters are Common exceptions; the GM might have them fall Unconscious and follow the same rules as player Characters."],
        ["bardic-inspiration", "Once within the next 10 minutes, the creature can roll the die and add the number rolled to one ability check, Attack roll, or saving throw it makes. The creature can wait until after it rolls The D20 before deciding to use the Bardic Inspiration die, but must decide before the DM says whether the roll succeeds or fails."],
        ["bloodied", "Bloodied is not an official term, but usually determines the effectiveness of a Swarm. It is the point at which a creature reaches half their full hit points. The DM may reveal this to the players as an indicator of how strong the monster currently is."],
        ["confused", "Not a true condition, but can represent the effect of the confusion spell.<BR>An affected target can’t take reactions and must roll a d10 at the start of each of its turns to determine its behavior for that turn.<BR>d10   Behavior<BR>1   The creature uses all its Movement to move in a random direction. To determine the direction, roll a d8 and assign a direction to each die face. The creature doesn't take an Action this turn.<BR>2-6  The creature doesn't move or take ACTIONS this turn.<BR>7-8 The creature uses its Action to make a melee Attack against a randomly determined creature within its reach. If there is no creature within its reach, the creature does nothing this turn.<BR>9-10 The creature can act and move normally."],
        ["full-cover", "A target with total cover can’t be targeted directly by an Attack or a spell, although some Spells can reach such a target by including it in an area of Effect. A target has total cover if it is completely concealed by an obstacle.<BR><BR>Walls, trees, Creatures, and other Obstacles can provide cover during Combat, making a target more difficult to harm. A target can benefit from cover only when an Attack or other Effect originates on the opposite side of the cover.<BR>There are three degrees of cover. If a target is behind multiple sources of cover, only the most protective degree of cover applies; the degrees aren’t added together. For example, if a target is behind a creature that gives half cover and a tree trunk that gives three-quarters cover, the target has three-quarters cover."],
        ["three-quarter-cover", "A target with three-quarters cover has a +5 bonus to AC and Dexterity Saving Throws. A target has three-quarters cover if about three-quarters of it is covered by an obstacle. The obstacle might be a portcullis, an arrow slit, or a thick tree trunk.<BR><BR>Walls, trees, Creatures, and other Obstacles can provide cover during Combat, making a target more difficult to harm. A target can benefit from cover only when an Attack or other Effect originates on the opposite side of the cover.<BR>There are three degrees of cover. If a target is behind multiple sources of cover, only the most protective degree of cover applies; the degrees aren’t added together. For example, if a target is behind a creature that gives half cover and a tree trunk that gives three-quarters cover, the target has three-quarters cover."],
        ["half-cover", "A target with half cover has a +2 bonus to AC and Dexterity Saving Throws. A target has half cover if an obstacle blocks at least half of its body. The obstacle might be a low wall, a large piece of furniture, a narrow tree trunk, or a creature, whether that creature is an enemy or a friend.<BR><BR>Walls, trees, Creatures, and other Obstacles can provide cover during Combat, making a target more difficult to harm. A target can benefit from cover only when an Attack or other Effect originates on the opposite side of the cover.<BR>There are three degrees of cover. If a target is behind multiple sources of cover, only the most protective degree of cover applies; the degrees aren’t added together. For example, if a target is behind a creature that gives half cover and a tree trunk that gives three-quarters cover, the target has three-quarters cover."],
        ["diseased", "See the entry on <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='https://app.roll20.net/compendium/dnd5e/Rules%3ADiseases?sharedCompendium=4665985#toc_1'>Diseases</a> in the Compendium"],
        ["ethereal", "Border Ethereal<BR>From the Border Ethereal, a Traveler can see into whatever plane it overlaps, but that plane appears muted and indistinct, its colors blurring into each other and its edges turning fuzzy. Ethereal denizens watch the plane as though peering through distorted and frosted glass, and can’t see anything beyond 30 feet into the other plane. Conversely, the Ethereal Plane is usually Invisible to those on the overlapped planes, except with the aid of magic.<BR>Normally, Creatures in the Border Ethereal can’t Attack Creatures on the overlapped plane, and vice versa. A Traveler on the Ethereal Plane is Invisible and utterly silent to someone on the overlapped plane, and solid Objects on the overlapped plane don’t hamper the Movement of a creature in the Border Ethereal. The exceptions are certain Magical Effects (including anything made of Magical force) and living beings. This makes the Ethereal Plane ideal for reconnaissance, spying on opponents, and moving around without being detected. The Ethereal Plane also disobeys the laws of gravity; a creature there can move up and down as easily as walking."],
        ["flying", "Flying Creatures enjoy many benefits of mobility, but they must also deal with the danger of Falling. If a flying creature is knocked prone, has its speed reduced to 0, or is otherwise deprived of the ability to move, the creature falls, unless it has the ability to hover or it is being held aloft by magic, such as by the fly spell."],
        ["haste", "The target’s speed is doubled, it gains a +2 bonus to AC, it has advantage on Dexterity Saving Throws, and it gains an additional Action on each of its turns. That Action can be used only to take the Attack (one weapon attac⁠k only), Dash, Disengage, Hide, or Use an Object Action.<BR>When the spell ends, the target can’t move or take actions until after its next turn, as a wave of lethargy sweeps over it."],
        ["hexed", "Until the spell ends, you deal an extra 1d6 necrotic damage to the target whenever you hit it with an Attack. Also, choose one ability when you cast the spell. The target has disadvantage on Ability Checks made with the chosen ability.<BR>If the target drops to 0 Hit Points before this spell ends, you can use a bonus Action on a subsequent turn of yours to curse a new creature.<BR>A Remove Curse cast on the target ends this spell early."],
        ["hexblade-curse", "As a Bonus Action, choose one creature you can see within 30 feet of you. The target is Cursed for 1 minute. The curse ends early if the target dies, you die, or you are Incapacitated. Until the curse ends, you gain the following benefits:<BR>You gain a bonus to Damage Rolls against the Cursed target. The bonus equals your Proficiency Bonus.<BR>Any Attack roll you make against the Cursed target is a critical hit on a roll of 19 or 20 on The D20.<BR>If the Cursed target dies, you regain Hit Points equal to your Warlock level + your Charisma modifier (minimum of 1 hit point).<BR>You can’t use this feature again until you finish a short or Long Rest."],
        ["hidden", "Combatants often try to Escape their foes’ notice by Hiding, casting the Invisibility spell, or lurking in darkne⁠ss.<BR>When you Attack a target that you can’t see, you have disadvantage on the at⁠tack roll. This is true whether you’re guessing the target’s Location or you’re targeting a creature you can hear but not see. If the target isn’t in the Location you targeted, you automatically miss, but the DM typically just says that the att⁠ack missed, not whether you guessed the target’s Location correctl<BR>When a creature can’t see you, you have advantage on Attack rolls against it. If you are hidden—both unseen and unheard—when you make an at⁠tack, you give away your Location when the att⁠ack hits or misses."],
        ["TempHP", "Temporary Hit Points aren’t actual hit points; they are a buffer against damage, a pool of Hit Points that protect you from injury.<BR>When you have temporary Hit Points and take damage, the temporary Hit Points are lost first, and any leftover damage carries over to your normal Hit Points. For example, if you have 5 temporary Hit Points and take 7 damage, you lose the temporary Hit Points and then take 2 damage.<BR>Because temporary Hit Points are separate from your actual Hit Points, they can exceed your hit point maximum. A character can, therefore, be at full Hit Points and receive temporary Hit Points.<BR>Healing can’t restore temporary Hit Points, and they can’t be added together. If you have temporary Hit Points and receive more of them, you decide whether to keep the ones you have or to gain the new ones. For example, if a spell grants you 12 temporary Hit Points when you already have 10, you can have 12 or 10, not 22.<BR>If you have 0 Hit Points, receiving temporary Hit Points doesn’t restore you to consciousness or stabilize you. They can still absorb damage directed at you while you’re in that state, but only true Healing can save you.<BR>Unless a feature that grants you temporary Hit Points has a Duration, they last until they’re depleted or you finish a Long Rest."],
        ["favored", "Concentration.<BR>The first time on each of your turns that you hit the Favored enemy and deal damage to it, including when you mark it, you can increase that damage by 1d4.<BR>You can use this feature to mark a Favored enemy a number of times equal to your Proficiency bonus, and you regain all expended uses when you finish a Long Rest.<BR>This feature's extra damage increases when you reach certain levels in this class: to 1d6 at 6th Level and to 1d8 at 14th level."],
        ["marked", "You deal an extra 1d6 damage to the target whenever you hit it with a weapon Attack, and you have advantage on any Wisdom (Perception) or Wis⁠dom (Survival) check you make to find it. If the target drops to 0 Hit Points before this spell ends, you can use a bonus Action on a subsequent turn of yours to mark a new creature<BR><b>At Higher Levels.</b> When you cast this spell using a spell slot of 3rd or 4th Level, you can maintain your Concentration on the spell for up to 8 hours. When you use a spell slot of 5th Level or higher, you can maintain your concentr⁠ation on the spell for up to 24 hours."],
        ["raging", "While raging, you gain the following benefits if you aren’t wearing heavy armor:<BR>• You have advantage on Strength checks and Strength Saving Throws.<BR>• When you make a melee weapon Attack using Strength, you gain a bonus to the damage roll that increases as you gain levels as a Barbarian, as shown in the Rage Damage column of the Barbarian table.<BR• You have Resistance to bludgeoning, piercing, and slashing damage.<BR>If you are able to cast Spells, you can’t cast them or concentrate on them while raging.<BR>Your rage lasts for 1 minute. It ends early if you are knocked Unconscious or if Your Turn ends and you haven’t attacked a Hostile creature since your last turn or taken damage since then. You can also end your rage on Your Turn as a bonus Action.<BR>Once you have raged the number of times shown for your Barbarian level in the Rages column of the Barbarian table, you must finish a Long Rest before you can rage again."],
        ["slowed", "An affected target’s speed is halved, it takes a −2 penalty to AC and Dexterity Saving Throws, and it can’t use reactions. On its turn, it can use either an Action or a bonus Action, not both. Regardless of the creature’s Abilities or magic items, it can’t make more than one melee or ranged Attack during its turn.<BR>If the creature attempts to Cast a Spell with a Casting Time of 1 Action, roll a d20. On an 11 or higher, the spell doesn’t take Effect until the creature’s next turn, and the creature must use its Action on that turn to complete the spell. If it can’t, the spell is wasted.<BR>A creature affected by this spell makes another Wisdom saving throw at the end of each of its turns. On a successful save, the Effect ends for it."],
        ["Torch", "A torch burns for 1 hour, providing bright light in a 20-foot radius and dim light for an additional 20 feet. If you make a melee Attack with a burning torch and hit, it deals 1 fire damage."],
        ["dying", "<b>Falling Unconscious</b><BR>If damage reduces you to 0 Hit Points and fails to kill you, you fall Unconscious (see Conditions ). This unconsciousness ends if you regain any Hit Points.<BR><b>Death Saving Throws</b><BR>Whenever you start Your Turn with 0 Hit Points, you must make a Special saving throw, called a death saving throw, to determine whether you creep closer to death or hang onto life. Unlike other Saving Throws, this one isn’t tied to any ability score. You are in the hands of fate now, aided only by Spells and Features that improve your chances of succeeding on a saving throw.<BR>Roll a d20: If the roll is 10 or higher, you succeed. Otherwise, you fail. A success or failure has no Effect by itself. On your third success, you become stable (see below). On your third failure, you die. The successes and failures don’t need to be consecutive; keep track of both until you collect three of a kind. The number of both is reset to zero when you regain any Hit Points or become stable.<BR>Rolling 1 or 20: When you make a death saving throw and roll a 1 on The D20, it counts as two failures. If you roll a 20 on The D20, you regain 1 hit point.<BR>Damage at 0 Hit Points: If you take any damage while you have 0 Hit Points, you suffer a death saving throw failure. If the damage is from a critical hit, you suffer two failures instead. If the damage equals or exceeds your hit point maximum, you suffer Instant Death."],
        ["burrowing", "A monster that has a burrowing speed can use that speed to move through sand, earth, mud, or ice. A monster can’t burrow through solid rock unless it has a Special trait that allows it to do so."],
        ["dodging", "Until the start of your next turn, any Attack roll made against you has disadvantage if you can see the attacker, and you make Dexterity Saving Throws with advantage. You lose this benefit if you are Incapacitated or if your speed drops to 0."],
        ["inspiration", "If you have Inspiration, you can expend it when you make an Attack roll, saving throw, or ability check. Spending your Inspiration gives you advantage on that roll.<BR>Additionally, if you have Inspiration, you can reward another player for good Roleplaying, clever thinking, or simply doing something exciting in the game. When another player character does something that really contributes to the story in a fun and interesting way, you can give up your Inspiration to give that character Inspiration."],
        ["TemporaryHP", "Temporary Hit Points aren’t actual hit points; they are a buffer against damage, a pool of Hit Points that protect you from injury.<BR>When you have temporary Hit Points and take damage, the temporary Hit Points are lost first, and any leftover damage carries over to your normal Hit Points. For example, if you have 5 temporary Hit Points and take 7 damage, you lose the temporary Hit Points and then take 2 damage.<BR>Because temporary Hit Points are separate from your actual Hit Points, they can exceed your hit point maximum. A character can, therefore, be at full Hit Points and receive temporary Hit Points.<BR>Healing can’t restore temporary Hit Points, and they can’t be added together. If you have temporary Hit Points and receive more of them, you decide whether to keep the ones you have or to gain the new ones. For example, if a spell grants you 12 temporary Hit Points when you already have 10, you can have 12 or 10, not 22.<BR>If you have 0 Hit Points, receiving temporary Hit Points doesn’t restore you to consciousness or stabilize you. They can still absorb damage directed at you while you’re in that state, but only true Healing can save you.<BR>Unless a feature that grants you temporary Hit Points has a Duration, they last until they’re depleted or you finish a Long Rest."]
    ];

    let definitions2024 = [
        ["concentrating", "Some spells and other effects require Concentration to remain active, as specified in their descriptions. If the effect’s creator loses Concentration, the effect ends. If the effect has a maximum duration, the effect’s description specifies how long the creator can concentrate on it: up to 1 minute, 1 hour, or some other duration. The creator can end Concentration at any time (no action required). The following factors break Concentration.<br>Another Concentration Effect. You lose Concentration on an effect the moment you start casting a spell that requires Concentration or activate another effect that requires Concentration.<br>Damage. If you take damage, you must succeed on a Constitution saving throw to maintain Concentration. The DC equals 10 or half the damage taken (round down), whichever number is higher, up to a maximum DC of 30.<br>Incapacitated or Dead. Your Concentration ends if you have the Incapacitated condition or you die."],
        ["blinded", "While you have the Blinded condition, you experience the following effects.<BR><b>Can’t See.</b> You can’t see and automatically fail any ability check that requires sight.<BR><b>Attacks Affected.</b> Attack rolls against you have Advantage, and your attack rolls have Disadvantage."],
        ["charmed", "While you have the Charmed condition, you experience the following effects.<BR><BR><b>Can’t Harm the Charmer.</b> You can’t attack the charmer or target the charmer with damaging abilities or magical effects.<BR><BR><b>Social Advantage.</b> The charmer has Advantage on any ability check to interact with you socially."],
        ["deafened", "While you have the Deafened condition, you experience the following effect.<BR><BR><b>Can’t Hear.</b> You can’t hear and automatically fail any ability check that requires hearing."],
        ["exhaustion", "While you have the Exhaustion condition, you experience the following effects.<BR><BR><b>Exhaustion Levels.</b> This condition is cumulative. Each time you receive it, you gain 1 Exhaustion level. You die if your Exhaustion level is 6.<BR><BR><b>D20 Tests Affected.</b> When you make a D20 Test, the roll is reduced by 2 times your Exhaustion level.<BR><BR><b>Speed Reduced.</b> Your Speed is reduced by a number of feet equal to 5 times your Exhaustion level.<BR><BR><b>Removing Exhaustion Levels.</b> Finishing a Long Rest removes 1 of your Exhaustion levels. When your Exhaustion level reaches 0, the condition ends."],
        ["frightened", "While you have the Frightened condition, you experience the following effects.<BR><BR><b>Ability Checks and Attacks Affected.</b> You have Disadvantage on ability checks and attack rolls while the source of fear is within line of sight.<BR><BR><b>Can’t Approach.</b> You can’t willingly move closer to the source of fear."],
        ["grappled", "While you have the Grappled condition, you experience the following effects.<BR><BR><b>Speed 0.</b> Your Speed is 0 and can’t increase.<BR><BR><b>Attacks Affected.</b> You have Disadvantage on attack rolls against any target other than the grappler.<BR><BR><b>Movable.</b> The grappler can drag or carry you when it moves, but every foot of movement costs it 1 extra foot unless you are Tiny or two or more sizes smaller than it."],
        ["incapacitated", "While you have the Incapacitated condition, you experience the following effects.<BR><BR><b>Inactive.</b> You can’t take any action, Bonus Action, or Reaction.<BR><BR><b>No Concentration.</b> Your Concentration is broken.<BR><BR><b>Speechless.</b> You can’t speak.<BR><BR><b>Surprised.</b> If you’re Incapacitated when you roll Initiative, you have Disadvantage on the roll."],
        ["invisible", "While you have the Invisible condition, you experience the following effects.<BR><BR><b>Surprise.</b> If you’re Invisible when you roll Initiative, you have Advantage on the roll.<BR><BR><b>Concealed.</b> You aren’t affected by any effect that requires its target to be seen unless the effect’s creator can somehow see you. Any equipment you are wearing or carrying is also concealed.<BR><BR><b>Attacks Affected.</b> Attack rolls against you have Disadvantage, and your attack rolls have Advantage. If a creature can somehow see you, you don’t gain this benefit against that creature."],
        ["paralyzed", "While you have the Paralyzed condition, you experience the following effects.<BR><BR><b>Incapacitated.</b> You have the <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef incapacitated'>Incapacitated</a> condition.<BR><BR><b>Speed 0.</b> Your Speed is 0 and can’t increase.<BR><BR><b>Saving Throws Affected.</b> You automatically fail Strength and Dexterity saving throws.<BR><BR><b>Attacks Affected.</b> Attack rolls against you have Advantage.<BR><BR><b>Automatic Critical Hits.</b> Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you."],
        ["petrified", "While you have the Petrified condition, you experience the following effects.<BR><BR><b>Turned to Inanimate Substance.</b> You are transformed, along with any nonmagical objects you are wearing and carrying, into a solid inanimate substance (usually stone). Your weight increases by a factor of ten, and you cease aging.<BR><BR><b>Incapacitated.</b> You have the <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef incapacitated'>Incapacitated</a> condition.<BR><BR><b>Speed 0.</b> Your Speed is 0 and can’t increase.<BR><BR><b>Attacks Affected.</b> Attack rolls against you have Advantage.<BR><BR><b>Saving Throws Affected.</b> You automatically fail Strength and Dexterity saving throws.<BR><BR><b>Resist Damage.</b> You have Resistance to all damage.<BR><BR><b>Poison Immunity.</b> You have Immunity to the Poisoned condition."],
        ["poisoned", "While you have the Poisoned condition, you experience the following effect.<BR><BR><b>Ability Checks and Attacks Affected.</b> You have Disadvantage on attack rolls and ability checks."],
        ["prone", "While you have the Prone condition, you experience the following effects.<BR><BR><b>Restricted Movement.</b> Your only movement options are to crawl or to spend an amount of movement equal to half your Speed (round down) to right yourself and thereby end the condition. If your Speed is 0, you can’t right yourself.<BR><BR><b>Attacks Affected.</b> You have Disadvantage on attack rolls. An attack roll against you has Advantage if the attacker is within 5 feet of you. Otherwise, that attack roll has Disadvantage."],
        ["restrained", "While you have the Restrained condition, you experience the following effects.<BR><BR><b>Speed 0.</b> Your Speed is 0 and can’t increase.<BR><BR><b>Attacks Affected.</b> Attack rolls against you have Advantage, and your attack rolls have Disadvantage.<BR><BR><b>Saving Throws Affected.</b> You have Disadvantage on Dexterity saving throws."],
        ["stunned", "While you have the Stunned condition, you experience the following effects.<BR><BR><b>Incapacitated.</b> You have the <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef incapacitated'>Incapacitated</a> condition.<BR><BR><b>Saving Throws Affected.</b> You automatically fail Strength and Dexterity saving throws.<BR><BR><b>Attacks Affected.</b> Attack rolls against you have Advantage."],
        ["unconscious", "While you have the Unconscious condition, you experience the following effects.<BR><BR><b>Inert.</b> You have the <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef incapacitated'>Incapacitated</a> and <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef prone'>Prone</a> conditions, and you drop whatever you’re holding. When this condition ends, you remain Prone.<BR><BR><b>Speed 0.</b> Your Speed is 0 and can’t increase.<BR><BR><b>Attacks Affected.</b> Attack rolls against you have Advantage.<BR><BR><b>Saving Throws Affected.</b> You automatically fail Strength and Dexterity saving throws.<BR><BR><b>Automatic Critical Hits.</b> Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.<BR><BR><b>Unaware.</b> You’re unaware of your surroundings."],
        ["dead", "A dead creature has no Hit Points and can’t regain them unless it is first revived by magic such as the Raise Dead or Revivify spell. When such a spell is cast, the spirit knows who is casting it and can refuse. The spirit of a dead creature has left the body and departed for the Outer Planes, and reviving the creature requires calling the spirit back.<BR>If the creature returns to life, the revival effect determines the creature’s current Hit Points. Unless otherwise stated, the creature returns to life with any conditions, magical contagions, or curses that were affecting it at death if the durations of those effects are still ongoing. If the creature died with any Exhaustion levels, it returns with 1 fewer level. If the creature had Attunement to one or more magic items, it is no longer attuned to them."],
        ["bardic-inspiration", "Once within the next 10 minutes, the creature can roll the die and add the number rolled to one ability check, Attack roll, or saving throw it makes. The creature can wait until after it rolls The D20 before deciding to use the Bardic Inspiration die, but must decide before the DM says whether the roll succeeds or fails."],
        ["bloodied", "A creature is Bloodied while it has half its Hit Points or fewer remaining. Usually determines the effectiveness of a Swarm. It is the point at which a creature reaches half their full hit points. The DM may reveal this to the players as an indicator of how strong the monster currently is."],
        ["confused", "Not a true condition, but can represent the effect of the confusion spell.<BR>An affected target can’t take reactions and must roll 1d10 at the start of each of its turns to determine its behavior for that turn, consulting the table below.<BR>1d10 - Behavior for the Turn<BR>1 - The target doesn't take an action, and it uses all its movement to move. Roll 1d4 for the direction: 1, north; 2, east; 3, south; or 4, west. <BR>2-6 - The target doesn't move or take actions. <BR>7-8 - The target doesn't move, and it takes the Attack action to make one melee attack against a random creature within reach. If none are within reach, the target takes no action.<BR>9-10 - The target chooses its behavior. At the end of each of its turns, an affected target repeats the save, ending the spell on itself on a success."],
        ["full-cover", "Cover provides a degree of protection to a target behind it. There are three degrees of cover, each of which provides a different benefit to a target: Half Cover (+2 bonus to AC and Dexterity saving throws), Three-Quarters Cover (+5 bonus to AC and Dexterity saving throws), and Total Cover (can’t be targeted directly). If behind more than one degree of cover, a target benefits only from the most protective degree."],
        ["three-quarter-cover", "Cover provides a degree of protection to a target behind it. There are three degrees of cover, each of which provides a different benefit to a target: Half Cover (+2 bonus to AC and Dexterity saving throws), Three-Quarters Cover (+5 bonus to AC and Dexterity saving throws), and Total Cover (can’t be targeted directly). If behind more than one degree of cover, a target benefits only from the most protective degree."],
        ["half-cover", "Cover provides a degree of protection to a target behind it. There are three degrees of cover, each of which provides a different benefit to a target: Half Cover (+2 bonus to AC and Dexterity saving throws), Three-Quarters Cover (+5 bonus to AC and Dexterity saving throws), and Total Cover (can’t be targeted directly). If behind more than one degree of cover, a target benefits only from the most protective degree."],
        ["diseased", "See the entry on <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='https://app.roll20.net/compendium/dnd5e/Rules%3ADiseases?sharedCompendium=4665985#toc_1'>Diseases</a> in the Compendium"],
        ["ethereal", "Border Ethereal<BR>From the Border Ethereal, a traveler can see into whatever plane it overlaps, but that plane appears grayish and indistinct, its colors blurring into each other and its edges turning fuzzy, limiting visibility to 30 feet into the other plane. Conversely, the Ethereal Plane is usually imperceptible to those on the overlapped planes, except with the aid of magic.<BR>Normally, creatures in the Border Ethereal can’t attack creatures on the overlapped plane, and vice versa. A traveler on the Ethereal Plane is imperceptible to someone on the overlapped plane, and solid objects on the overlapped plane don’t hamper the movement of a creature in the Border Ethereal. The exceptions are certain magical effects (including anything made of magical force) and living beings. This makes the Ethereal Plane ideal for scouting, spying on opponents, and moving around without being detected. The Ethereal Plane also disobeys the laws of gravity; a creature there can freely move in any direction.<BR>Deep Ethereal<BR>To reach the Deep Ethereal, one typically needs a Plane Shift spell, a Gate spell, or a magical portal. Visitors to the Deep Ethereal are engulfed by roiling mist. Scattered throughout the plane are curtains of vaporous color, and passing through a curtain leads a traveler to a region of the Border Ethereal connected to a specific Inner Plane, the Material Plane, the Feywild, or the Shadowfell. The color of the curtain indicates the plane whose Border Ethereal the curtain conceals; see the Ethereal Curtains table. The curtains are also distinguishable by texture and temperature, each one reflecting something of the nature of the plane beyond."],
        ["flying", "A variety of effects allow a creature to fly. While flying, you fall if you have the Incapacitated or Prone condition or your Fly Speed is reduced to 0. You can stay aloft in those circumstances if you can hover."],
        ["haste", "The target’s speed is doubled, it gains a +2 bonus to AC, it has advantage on Dexterity Saving Throws, and it gains an additional Action on each of its turns. That Action can be used only to take the Attack (one weapon attac⁠k only), Dash, Disengage, Hide, or Use an Object Action.<BR>When the spell ends, the target can’t move or take actions until after its next turn, as a wave of lethargy sweeps over it."],
        ["hexed", "You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 Necrotic damage to the target whenever you hit it with an attack roll. Also, choose one ability when you cast the spell. The target has Disadvantage on ability checks made with the chosen ability.<BR>If the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action on a later turn to curse a new creature."],
        ["hexblade-curse", "As a Bonus Action, choose one creature you can see within 30 feet of you. The target is Cursed for 1 minute. The curse ends early if the target dies, you die, or you are Incapacitated. Until the curse ends, you gain the following benefits:<BR>You gain a bonus to Damage Rolls against the Cursed target. The bonus equals your Proficiency Bonus.<BR>Any Attack roll you make against the Cursed target is a critical hit on a roll of 19 or 20 on The D20.<BR>If the Cursed target dies, you regain Hit Points equal to your Warlock level + your Charisma modifier (minimum of 1 hit point).<BR>You can’t use this feature again until you finish a short or Long Rest."],
        ["hidden", "With the Hide action, you try to conceal yourself. To do so, you must succeed on a DC 15 Dexterity (Stealth) check while you’re Heavily Obscured or behind Three-Quarters Cover or Total Cover, and you must be out of any enemy’s line of sight; if you can see a creature, you can discern whether it can see you.<BR>On a successful check, you have the Invisible condition. Make note of your check’s total, which is the DC for a creature to find you with a Wisdom (Perception) check.<BR>The condition ends on you immediately after any of the following occurs: you make a sound louder than a whisper, an enemy finds you, you make an attack roll, or you cast a spell with a Verbal component."],
        ["TempHP", "Temporary Hit Points aren’t actual hit points; they are a buffer against damage, a pool of Hit Points that protect you from injury.<BR>When you have temporary Hit Points and take damage, the temporary Hit Points are lost first, and any leftover damage carries over to your normal Hit Points. For example, if you have 5 temporary Hit Points and take 7 damage, you lose the temporary Hit Points and then take 2 damage.<BR>Because temporary Hit Points are separate from your actual Hit Points, they can exceed your hit point maximum. A character can, therefore, be at full Hit Points and receive temporary Hit Points.<BR>Healing can’t restore temporary Hit Points, and they can’t be added together. If you have temporary Hit Points and receive more of them, you decide whether to keep the ones you have or to gain the new ones. For example, if a spell grants you 12 temporary Hit Points when you already have 10, you can have 12 or 10, not 22.<BR>If you have 0 Hit Points, receiving temporary Hit Points doesn’t restore you to consciousness or stabilize you. They can still absorb damage directed at you while you’re in that state, but only true Healing can save you.<BR>Unless a feature that grants you temporary Hit Points has a Duration, they last until they’re depleted or you finish a Long Rest."],
        ["favored", "Concentration.<BR>The first time on each of your turns that you hit the Favored enemy and deal damage to it, including when you mark it, you can increase that damage by 1d4.<BR>You can use this feature to mark a Favored enemy a number of times equal to your Proficiency bonus, and you regain all expended uses when you finish a Long Rest.<BR>This feature's extra damage increases when you reach certain levels in this class: to 1d6 at 6th Level and to 1d8 at 14th level."],
        ["marked", "You magically mark one creature you can see within range as your quarry. Until the spell ends, you deal an extra 1d6 Force damage to the target whenever you hit it with an attack roll. You also have Advantage on any Wisdom (Perception or Survival) check you make to find it.<BR>If the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action to move the mark to a new creature you can see within range.<BR>Using a Higher-Level Spell Slot. Your Concentration can last longer with a spell slot of level 3–4 (up to 8 hours) or 5+ (up to 24 hours)."],
        ["raging", "While active, your Rage follows the rules below.<BR>Damage Resistance. You have Resistance to Bludgeoning, Piercing, and Slashing damage.<BR>Rage Damage. When you make an attack using Strength—with either a weapon or an Unarmed Strike—and deal damage to the target, you gain a bonus to the damage that increases as you gain levels as a Barbarian, as shown in the Rage Damage column of the Barbarian Features table.<BR>Strength Advantage. You have Advantage on Strength checks and Strength saving throws.<BR>No Concentration or Spells. You can’t maintain Concentration, and you can’t cast spells.<BR>Duration. The Rage lasts until the end of your next turn, and it ends early if you don Heavy armor or have the Incapacitated condition. If your Rage is still active on your next turn, you can extend the Rage for another round by doing one of the following:<BR>Make an attack roll against an enemy.<BR>Force an enemy to make a saving throw.<BR>Take a Bonus Action to extend your Rage."],
        ["slowed", "Each target must succeed on a Wisdom saving throw or be affected by this spell for the duration.<BR>An affected target’s Speed is halved, it takes a −2 penalty to AC and Dexterity saving throws, and it can’t take Reactions. On its turns, it can take either an action or a Bonus Action, not both, and it can make only one attack if it takes the Attack action. If it casts a spell with a Somatic component, there is a 25 percent chance the spell fails as a result of the target making the spell’s gestures too slowly.<BR>An affected target repeats the save at the end of each of its turns, ending the spell on itself on a success."],
        ["Torch", "A Torch burns for 1 hour, casting Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. When you take the Attack action, you can attack with the Torch, using it as a Simple Melee weapon. On a hit, the target takes 1 Fire damage."],
        ["dying", "When a creature drops to 0 Hit Points, it either dies outright or falls unconscious, as explained below.<BR>Instant Death<BR>Here are the main ways a creature can die instantly.<BR>Monster Death.<BR>A monster dies the instant it drops to 0 Hit Points, although a Dungeon Master can ignore this rule for an individual monster and treat it like a character.<BR>Hit Point Maximum of 0.<BR>A creature dies if its Hit Point maximum reaches 0. Certain effects drain life energy, reducing a creature’s Hit Point maximum.<BR>Massive Damage.<BR>When damage reduces a character to 0 Hit Points and damage remains, the character dies if the remainder equals or exceeds their Hit Point maximum. For example, if your character has a Hit Point maximum of 12, currently has 6 Hit Points, and takes 18 damage, the character drops to 0 Hit Points, but 12 damage remains. The character then dies, since 12 equals their Hit Point maximum.<BR>Character Demise<BR>If your character dies, others might find a magical way to revive your character, such as with the Raise Dead spell. Or talk with the DM about making a new character to join the group.<BR>Falling<BR>Unconscious<BR>If you reach 0 Hit Points and don’t die instantly, you have the Unconscious condition until you regain any Hit Points, and you now face making Death Saving Throws (see below).<BR>Knocking Out a Creature<BR>When you would reduce a creature to 0 Hit Points with a melee attack, you can instead reduce the creature to 1 Hit Point and give it the Unconscious condition. It then starts a Short Rest, at the end of which that condition ends on it. The condition ends early if the creature regains any Hit Points or if someone takes an action to administer first aid to it, making a successful DC 10 Wisdom (Medicine) check.<BR>Death Saving Throws<BR>Whenever you start your turn with 0 Hit Points, you must make a Death Saving Throw to determine whether you creep closer to death or hang on to life. Unlike other saving throws, this one isn’t tied to an ability score. You’re in the hands of fate now.<BR>Three Successes/Failures.<BR>Roll 1d20. If the roll is 10 or higher, you succeed. Otherwise, you fail. A success or failure has no effect by itself. On your third success, you become Stable. On your third failure, you die.<BR>The successes and failures don’t need to be consecutive; keep track of both until you collect three of a kind. The number of both is reset to zero when you regain any Hit Points or become Stable.<BR>Rolling a 1 or 20.<BR>When you roll a 1 on the d20 for a Death Saving Throw, you suffer two failures. If you roll a 20 on the d20, you regain 1 Hit Point.<BR>Damage at 0 Hit Points.<BR>If you take any damage while you have 0 Hit Points, you suffer a Death Saving Throw failure. If the damage is from a Critical Hit, you suffer two failures instead. If the damage equals or exceeds your Hit Point maximum, you die.<BR>Stabilizing a Character<BR>You can take the Help action to try to stabilize a creature with 0 Hit Points, which requires a successful DC 10 Wisdom (Medicine) check.<BR>A Stable creature doesn’t make Death Saving Throws even though it has 0 Hit Points, but it still has the Unconscious condition. If the creature takes damage, it stops being Stable and starts making Death Saving Throws again. A Stable creature that isn’t healed regains 1 Hit Point after 1d4 hours."],
        ["burrowing", "A creature that has a Burrow Speed can use that speed to move through sand, earth, mud, or ice. The creature can’t burrow through solid rock unless the creature has a trait that allows it to do so. See also “Speed."],
        ["dodging", "If you take the Dodge action, you gain the following benefits: until the start of your next turn, any attack roll made against you has Disadvantage if you can see the attacker, and you make Dexterity saving throws with Advantage.<BR>You lose these benefits if you have the Incapacitated condition or if your Speed is 0."],
        ["inspiration", "If you (a player character) have Heroic Inspiration, you can expend it to reroll any die immediately after rolling it, and you must use the new roll.<BR>If you gain Heroic Inspiration but already have it, it’s lost unless you give it to a player character who lacks it."],
        ["TemporaryHP", "Temporary Hit Points aren’t actual hit points; they are a buffer against damage, a pool of Hit Points that protect you from injury.<BR>When you have temporary Hit Points and take damage, the temporary Hit Points are lost first, and any leftover damage carries over to your normal Hit Points. For example, if you have 5 temporary Hit Points and take 7 damage, you lose the temporary Hit Points and then take 2 damage.<BR>Because temporary Hit Points are separate from your actual Hit Points, they can exceed your hit point maximum. A character can, therefore, be at full Hit Points and receive temporary Hit Points.<BR>Healing can’t restore temporary Hit Points, and they can’t be added together. If you have temporary Hit Points and receive more of them, you decide whether to keep the ones you have or to gain the new ones. For example, if a spell grants you 12 temporary Hit Points when you already have 10, you can have 12 or 10, not 22.<BR>If you have 0 Hit Points, receiving temporary Hit Points doesn’t restore you to consciousness or stabilize you. They can still absorb damage directed at you while you’re in that state, but only true Healing can save you.<BR>Unless a feature that grants you temporary Hit Points has a Duration, they last until they’re depleted or you finish a Long Rest."]
    ];


    let defaultConditionsArray = [
        ["concentrating",
            /concentration check|concentration=1/i,
            "Some spells and other effects require Concentration to remain active, as specified in their descriptions. If the effect’s creator loses Concentration, the effect ends. If the effect has a maximum duration, the effect’s description specifies how long the creator can concentrate on it: up to 1 minute, 1 hour, or some other duration. The creator can end Concentration at any time (no action required). The following factors break Concentration.<br>Another Concentration Effect. You lose Concentration on an effect the moment you start casting a spell that requires Concentration or activate another effect that requires Concentration.<br>Damage. If you take damage, you must succeed on a Constitution saving throw to maintain Concentration. The DC equals 10 or half the damage taken (round down), whichever number is higher, up to a maximum DC of 30.<br>Incapacitated or Dead. Your Concentration ends if you have the Incapacitated condition or you die.",
            `death-zone`
        ],
        ["blinded",
            /(be|and|is|magically|become|becomes|is either|has the) blinded|blinded condition/i,
            "While you have the Blinded condition, you experience the following effects.<BR><b>Can’t See.</b> You can’t see and automatically fail any ability check that requires sight.<BR><b>Attacks Affected.</b> Attack rolls against you have Advantage, and your attack rolls have Disadvantage.",
            `bleeding-eye`
        ],
        [
            "charmed",
            /(be|and|is|magically|become|becomes) charmed|charmed condition/i,
            "While you have the Charmed condition, you experience the following effects.<BR><BR><b>Can’t Harm the Charmer.</b> You can’t attack the charmer or target the charmer with damaging abilities or magical effects.<BR><BR><b>Social Advantage.</b> The charmer has Advantage on any ability check to interact with you socially.",
            `chained-heart`
        ],
        [
            "deafened",
            /(be|and|is|magically|become|becomes) deafened|deafened condition/i,
            "While you have the Deafened condition, you experience the following effect.<BR><BR><b>Can’t Hear.</b> You can’t hear and automatically fail any ability check that requires hearing.",
            `overdrive`
        ],
        [
            "exhaustion",
            /(be|and|is|magically|become|becomes) exhausted|(of|magical) exhaustion|exhausted condition/i,
            "While you have the Exhaustion condition, you experience the following effects.<BR><BR><b>Exhaustion Levels.</b> This condition is cumulative. Each time you receive it, you gain 1 Exhaustion level. You die if your Exhaustion level is 6.<BR><BR><b>D20 Tests Affected.</b> When you make a D20 Test, the roll is reduced by 2 times your Exhaustion level.<BR><BR><b>Speed Reduced.</b> Your Speed is reduced by a number of feet equal to 5 times your Exhaustion level.<BR><BR><b>Removing Exhaustion Levels.</b> Finishing a Long Rest removes 1 of your Exhaustion levels. When your Exhaustion level reaches 0, the condition ends.",
            `half-haze`
        ],
        [
            "frightened",
            /(be|and|is|magically|become|becomes) frightened|frightened condition/i,
            "While you have the Frightened condition, you experience the following effects.<BR><BR><b>Ability Checks and Attacks Affected.</b> You have Disadvantage on ability checks and attack rolls while the source of fear is within line of sight.<BR><BR><b>Can’t Approach.</b> You can’t willingly move closer to the source of fear.",
            `screaming`
        ],
        [
            "grappled",
            /(be|and|is|magically|becomes|considered) grappled|grappled condition/i,
            "While you have the Grappled condition, you experience the following effects.<BR><BR><b>Speed 0.</b> Your Speed is 0 and can’t increase.<BR><BR><b>Attacks Affected.</b> You have Disadvantage on attack rolls against any target other than the grappler.<BR><BR><b>Movable.</b> The grappler can drag or carry you when it moves, but every foot of movement costs it 1 extra foot unless you are Tiny or two or more sizes smaller than it.",
            `grab`
        ],
        [
            "incapacitated",
            /(be|and|is|magically|become|becomes) incapacitated|incapacitated condition/i,
            "While you have the Incapacitated condition, you experience the following effects.<BR><BR><b>Inactive.</b> You can’t take any action, Bonus Action, or Reaction.<BR><BR><b>No Concentration.</b> Your Concentration is broken.<BR><BR><b>Speechless.</b> You can’t speak.<BR><BR><b>Surprised.</b> If you’re Incapacitated when you roll Initiative, you have Disadvantage on the roll.",
            `interdiction`
        ],
        [
            "invisible",
            /(be|and|is|magically|become|becomes) invisible|invisible condition/i,
            "While you have the Invisible condition, you experience the following effects.<BR><BR><b>Surprise.</b> If you’re Invisible when you roll Initiative, you have Advantage on the roll.<BR><BR><b>Concealed.</b> You aren’t affected by any effect that requires its target to be seen unless the effect’s creator can somehow see you. Any equipment you are wearing or carrying is also concealed.<BR><BR><b>Attacks Affected.</b> Attack rolls against you have Disadvantage, and your attack rolls have Advantage. If a creature can somehow see you, you don’t gain this benefit against that creature.",
            `ninja-mask`
        ],
        [
            "paralyzed",
            /(be|and|is|magically|become|becomes) paralyzed|paralyzed condition/i,
            "While you have the Paralyzed condition, you experience the following effects.<BR><BR><b>Incapacitated.</b> You have the <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef incapacitated'>Incapacitated</a> condition.<BR><BR><b>Speed 0.</b> Your Speed is 0 and can’t increase.<BR><BR><b>Saving Throws Affected.</b> You automatically fail Strength and Dexterity saving throws.<BR><BR><b>Attacks Affected.</b> Attack rolls against you have Advantage.<BR><BR><b>Automatic Critical Hits.</b> Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.",
            `aura`
        ],
        [
            "petrified",
            /(be|and|is|magically|become|becomes|becoming) petrified|(turns to|turning to) stone|petrified condition/i,
            "While you have the Petrified condition, you experience the following effects.<BR><BR><b>Turned to Inanimate Substance.</b> You are transformed, along with any nonmagical objects you are wearing and carrying, into a solid inanimate substance (usually stone). Your weight increases by a factor of ten, and you cease aging.<BR><BR><b>Incapacitated.</b> You have the <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef incapacitated'>Incapacitated</a> condition.<BR><BR><b>Speed 0.</b> Your Speed is 0 and can’t increase.<BR><BR><b>Attacks Affected.</b> Attack rolls against you have Advantage.<BR><BR><b>Saving Throws Affected.</b> You automatically fail Strength and Dexterity saving throws.<BR><BR><b>Resist Damage.</b> You have Resistance to all damage.<BR><BR><b>Poison Immunity.</b> You have Immunity to the Poisoned condition.",
            `chemical-bolt`
        ],
        [
            "poisoned",
            /(be|and|is|magically|become|becomes) poisoned|poisoned condition/i,
            "While you have the Poisoned condition, you experience the following effect.<BR><BR><b>Ability Checks and Attacks Affected.</b> You have Disadvantage on attack rolls and ability checks.",
            'skull'
        ],
        [
            "prone",
            /(be|and|is|magically|become|becomes|knocked|fall|falls) prone|prone condition/i,
            "While you have the Prone condition, you experience the following effects.<BR><BR><b>Restricted Movement.</b> Your only movement options are to crawl or to spend an amount of movement equal to half your Speed (round down) to right yourself and thereby end the condition. If your Speed is 0, you can’t right yourself.<BR><BR><b>Attacks Affected.</b> You have Disadvantage on attack rolls. An attack roll against you has Advantage if the attacker is within 5 feet of you. Otherwise, that attack roll has Disadvantage.",
            `back-pain`
        ],
        [
            "restrained",
            /(be|and|is|magically|become|becomes) restrained|restrained condition/i,
            "While you have the Restrained condition, you experience the following effects.<BR><BR><b>Speed 0.</b> Your Speed is 0 and can’t increase.<BR><BR><b>Attacks Affected.</b> Attack rolls against you have Advantage, and your attack rolls have Disadvantage.<BR><BR><b>Saving Throws Affected.</b> You have Disadvantage on Dexterity saving throws.",
            `cobweb`
        ],
        [
            "stunned",
            /(be|and|is|magically|become|becomes) stunned|stunned condition/i,
            "While you have the Stunned condition, you experience the following effects.<BR><BR><b>Incapacitated.</b> You have the <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef incapacitated'>Incapacitated</a> condition.<BR><BR><b>Saving Throws Affected.</b> You automatically fail Strength and Dexterity saving throws.<BR><BR><b>Attacks Affected.</b> Attack rolls against you have Advantage.",
            `broken-skull`
        ],
        [
            "unconscious",
            /(be|and|is|magically|become|becomes) unconscious|unconscious condition/i,
            "While you have the Unconscious condition, you experience the following effects.<BR><BR><b>Inert.</b> You have the <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef incapacitated'>Incapacitated</a> and <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef prone'>Prone</a> conditions, and you drop whatever you’re holding. When this condition ends, you remain Prone.<BR><BR><b>Speed 0.</b> Your Speed is 0 and can’t increase.<BR><BR><b>Attacks Affected.</b> Attack rolls against you have Advantage.<BR><BR><b>Saving Throws Affected.</b> You automatically fail Strength and Dexterity saving throws.<BR><BR><b>Automatic Critical Hits.</b> Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.<BR><BR><b>Unaware.</b> You’re unaware of your surroundings.",
            `sleepy`
        ],
        [
            "dead",
            /nonmatching string to prevent accidental triggering/i,
            "A dead creature has no Hit Points and can’t regain them unless it is first revived by magic such as the Raise Dead or Revivify spell. When such a spell is cast, the spirit knows who is casting it and can refuse. The spirit of a dead creature has left the body and departed for the Outer Planes, and reviving the creature requires calling the spirit back.<BR>If the creature returns to life, the revival effect determines the creature’s current Hit Points. Unless otherwise stated, the creature returns to life with any conditions, magical contagions, or curses that were affecting it at death if the durations of those effects are still ongoing. If the creature died with any Exhaustion levels, it returns with 1 fewer level. If the creature had Attunement to one or more magic items, it is no longer attuned to them.",
            `dead`
        ],
        [
            "bardic-inspiration",
            /You can inspire others through stirring words or music/i,
            "Once within the next 10 minutes, the creature can roll the die and add the number rolled to one ability check, Attack roll, or saving throw it makes. The creature can wait until after it rolls The D20 before deciding to use the Bardic Inspiration die, but must decide before the DM says whether the roll succeeds or fails.",
            `black-flag`
        ],
        [
            "bloodied",
            /nonmatching string to prevent accidental triggering/i,
            "A creature is Bloodied while it has half its Hit Points or fewer remaining. Usually determines the effectiveness of a Swarm. It is the point at which a creature reaches half their full hit points. The DM may reveal this to the players as an indicator of how strong the monster currently is.",
            `pummeled`
        ],
        [
            "confused",
            /spawning delusions and provoking uncontrolled action/i,
            "Not a true condition, but can represent the effect of the confusion spell.<BR>An affected target can’t take reactions and must roll 1d10 at the start of each of its turns to determine its behavior for that turn, consulting the table below.<BR>1d10 - Behavior for the Turn<BR>1 - The target doesn't take an action, and it uses all its movement to move. Roll 1d4 for the direction: 1, north; 2, east; 3, south; or 4, west. <BR>2-6 - The target doesn't move or take actions. <BR>7-8 - The target doesn't move, and it takes the Attack action to make one melee attack against a random creature within reach. If none are within reach, the target takes no action.<BR>9-10 - The target chooses its behavior. At the end of each of its turns, an affected target repeats the save, ending the spell on itself on a success.",
            `rolling-bomb`
        ],
        [
            "full-cover",
            /nonmatching string to prevent accidental triggering/i,
            "Cover provides a degree of protection to a target behind it. There are three degrees of cover, each of which provides a different benefit to a target: Half Cover (+2 bonus to AC and Dexterity saving throws), Three-Quarters Cover (+5 bonus to AC and Dexterity saving throws), and Total Cover (can’t be targeted directly). If behind more than one degree of cover, a target benefits only from the most protective degree.",
            `bolt-shield`
        ],
        [
            "three-quarter-cover",
            /nonmatching string to prevent accidental triggering/i,
            "Cover provides a degree of protection to a target behind it. There are three degrees of cover, each of which provides a different benefit to a target: Half Cover (+2 bonus to AC and Dexterity saving throws), Three-Quarters Cover (+5 bonus to AC and Dexterity saving throws), and Total Cover (can’t be targeted directly). If behind more than one degree of cover, a target benefits only from the most protective degree.",
            `broken-shield`
        ],
        [
            "half-cover",
            /nonmatching string to prevent accidental triggering/i,
            "Cover provides a degree of protection to a target behind it. There are three degrees of cover, each of which provides a different benefit to a target: Half Cover (+2 bonus to AC and Dexterity saving throws), Three-Quarters Cover (+5 bonus to AC and Dexterity saving throws), and Total Cover (can’t be targeted directly). If behind more than one degree of cover, a target benefits only from the most protective degree.",
            `broken-shield`
        ],
        [
            "diseased",
            /nonmatching string to prevent accidental triggering/i,
            "See the entry on <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='https://app.roll20.net/compendium/dnd5e/Rules%3ADiseases?sharedCompendium=4665985#toc_1'>Diseases</a> in the Compendium",
            `radioactive`
        ],
        [
            "ethereal",
            /ethereal/i,
            "Border Ethereal<BR>From the Border Ethereal, a traveler can see into whatever plane it overlaps, but that plane appears grayish and indistinct, its colors blurring into each other and its edges turning fuzzy, limiting visibility to 30 feet into the other plane. Conversely, the Ethereal Plane is usually imperceptible to those on the overlapped planes, except with the aid of magic.<BR>Normally, creatures in the Border Ethereal can’t attack creatures on the overlapped plane, and vice versa. A traveler on the Ethereal Plane is imperceptible to someone on the overlapped plane, and solid objects on the overlapped plane don’t hamper the movement of a creature in the Border Ethereal. The exceptions are certain magical effects (including anything made of magical force) and living beings. This makes the Ethereal Plane ideal for scouting, spying on opponents, and moving around without being detected. The Ethereal Plane also disobeys the laws of gravity; a creature there can freely move in any direction.<BR>Deep Ethereal<BR>To reach the Deep Ethereal, one typically needs a Plane Shift spell, a Gate spell, or a magical portal. Visitors to the Deep Ethereal are engulfed by roiling mist. Scattered throughout the plane are curtains of vaporous color, and passing through a curtain leads a traveler to a region of the Border Ethereal connected to a specific Inner Plane, the Material Plane, the Feywild, or the Shadowfell. The color of the curtain indicates the plane whose Border Ethereal the curtain conceals; see the Ethereal Curtains table. The curtains are also distinguishable by texture and temperature, each one reflecting something of the nature of the plane beyond.",
            `angel-outfit`
        ],
        [
            "flying",
            /nonmatching string to prevent accidental triggering/i,
            "A variety of effects allow a creature to fly. While flying, you fall if you have the Incapacitated or Prone condition or your Fly Speed is reduced to 0. You can stay aloft in those circumstances if you can hover.",
            `fluffy-wing`
        ],
        [
            "haste",
            /as a wave of lethargy sweeps over it/i,
            "The target’s speed is doubled, it gains a +2 bonus to AC, it has advantage on Dexterity Saving Throws, and it gains an additional Action on each of its turns. That Action can be used only to take the Attack (one weapon attac⁠k only), Dash, Disengage, Hide, or Use an Object Action.<BR>When the spell ends, the target can’t move or take actions until after its next turn, as a wave of lethargy sweeps over it.",
            `stopwatch`
        ],
        [
            "hexed",
            /You place a curse on a creature that you can see within range/i,
            "You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 Necrotic damage to the target whenever you hit it with an attack roll. Also, choose one ability when you cast the spell. The target has Disadvantage on ability checks made with the chosen ability.<BR>If the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action on a later turn to curse a new creature.",
            `lightning-helix`
        ],
        [
            "hexblade-curse",
            /Starting at 1st Level, you gain the ability to place a baleful curse on someone/i,
            "As a Bonus Action, choose one creature you can see within 30 feet of you. The target is Cursed for 1 minute. The curse ends early if the target dies, you die, or you are Incapacitated. Until the curse ends, you gain the following benefits:<BR>You gain a bonus to Damage Rolls against the Cursed target. The bonus equals your Proficiency Bonus.<BR>Any Attack roll you make against the Cursed target is a critical hit on a roll of 19 or 20 on The D20.<BR>If the Cursed target dies, you regain Hit Points equal to your Warlock level + your Charisma modifier (minimum of 1 hit point).<BR>You can’t use this feature again until you finish a short or Long Rest.",
            `all-for-one`
        ],
        [
            "hidden",
            /nonmatching string to prevent accidental triggering/i,
            "With the Hide action, you try to conceal yourself. To do so, you must succeed on a DC 15 Dexterity (Stealth) check while you’re Heavily Obscured or behind Three-Quarters Cover or Total Cover, and you must be out of any enemy’s line of sight; if you can see a creature, you can discern whether it can see you.<BR>On a successful check, you have the Invisible condition. Make note of your check’s total, which is the DC for a creature to find you with a Wisdom (Perception) check.<BR>The condition ends on you immediately after any of the following occurs: you make a sound louder than a whisper, an enemy finds you, you make an attack roll, or you cast a spell with a Verbal component.",
            `ninja-mask`
        ],
        [
            "TempHP",
            /nonmatching string to prevent accidental triggering/i,
            "Temporary Hit Points aren’t actual hit points; they are a buffer against damage, a pool of Hit Points that protect you from injury.<BR>When you have temporary Hit Points and take damage, the temporary Hit Points are lost first, and any leftover damage carries over to your normal Hit Points. For example, if you have 5 temporary Hit Points and take 7 damage, you lose the temporary Hit Points and then take 2 damage.<BR>Because temporary Hit Points are separate from your actual Hit Points, they can exceed your hit point maximum. A character can, therefore, be at full Hit Points and receive temporary Hit Points.<BR>Healing can’t restore temporary Hit Points, and they can’t be added together. If you have temporary Hit Points and receive more of them, you decide whether to keep the ones you have or to gain the new ones. For example, if a spell grants you 12 temporary Hit Points when you already have 10, you can have 12 or 10, not 22.<BR>If you have 0 Hit Points, receiving temporary Hit Points doesn’t restore you to consciousness or stabilize you. They can still absorb damage directed at you while you’re in that state, but only true Healing can save you.<BR>Unless a feature that grants you temporary Hit Points has a Duration, they last until they’re depleted or you finish a Long Rest.",
            `broken-heart`
        ],
        [
            "favored",
            /mystical bond with Nature to mark the target as your Favored enemy/i,
            "Concentration.<BR>The first time on each of your turns that you hit the Favored enemy and deal damage to it, including when you mark it, you can increase that damage by 1d4.<BR>You can use this feature to mark a Favored enemy a number of times equal to your Proficiency bonus, and you regain all expended uses when you finish a Long Rest.<BR>This feature's extra damage increases when you reach certain levels in this class: to 1d6 at 6th Level and to 1d8 at 14th level.",
            `archery-target`
        ],
        [
            "marked",
            /(mystically mark it as your quarry|You magically mark one creature you can see within range as your quarry)/i,
            "You magically mark one creature you can see within range as your quarry. Until the spell ends, you deal an extra 1d6 Force damage to the target whenever you hit it with an attack roll. You also have Advantage on any Wisdom (Perception or Survival) check you make to find it.<BR>If the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action to move the mark to a new creature you can see within range.<BR>Using a Higher-Level Spell Slot. Your Concentration can last longer with a spell slot of level 3–4 (up to 8 hours) or 5+ (up to 24 hours).",
            `archery-target`
        ],
        [
            "raging",
            /On your turn, you can enter a rage as a Bonus Action/i,
            "While active, your Rage follows the rules below.<BR>Damage Resistance. You have Resistance to Bludgeoning, Piercing, and Slashing damage.<BR>Rage Damage. When you make an attack using Strength—with either a weapon or an Unarmed Strike—and deal damage to the target, you gain a bonus to the damage that increases as you gain levels as a Barbarian, as shown in the Rage Damage column of the Barbarian Features table.<BR>Strength Advantage. You have Advantage on Strength checks and Strength saving throws.<BR>No Concentration or Spells. You can’t maintain Concentration, and you can’t cast spells.<BR>Duration. The Rage lasts until the end of your next turn, and it ends early if you don Heavy armor or have the Incapacitated condition. If your Rage is still active on your next turn, you can extend the Rage for another round by doing one of the following:<BR>Make an attack roll against an enemy.<BR>Force an enemy to make a saving throw.<BR>Take a Bonus Action to extend your Rage.",
            `strong`
        ],
        [
            "slowed",
            /You alter time around up to six creatures of your choice/i,
            "Each target must succeed on a Wisdom saving throw or be affected by this spell for the duration.<BR>An affected target’s Speed is halved, it takes a −2 penalty to AC and Dexterity saving throws, and it can’t take Reactions. On its turns, it can take either an action or a Bonus Action, not both, and it can make only one attack if it takes the Attack action. If it casts a spell with a Somatic component, there is a 25 percent chance the spell fails as a result of the target making the spell’s gestures too slowly.<BR>An affected target repeats the save at the end of each of its turns, ending the spell on itself on a success.",
            `snail`
        ],
        [
            "Torch",
            /nonmatching string to prevent accidental triggering/i,
            "A Torch burns for 1 hour, casting Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. When you take the Attack action, you can attack with the Torch, using it as a Simple Melee weapon. On a hit, the target takes 1 Fire damage.",
            `frozen-orb`
        ],
        [
            "dying",
            /nonmatching string to prevent accidental triggering/i,
            "When a creature drops to 0 Hit Points, it either dies outright or falls unconscious, as explained below.<BR>Instant Death<BR>Here are the main ways a creature can die instantly.<BR>Monster Death.<BR>A monster dies the instant it drops to 0 Hit Points, although a Dungeon Master can ignore this rule for an individual monster and treat it like a character.<BR>Hit Point Maximum of 0.<BR>A creature dies if its Hit Point maximum reaches 0. Certain effects drain life energy, reducing a creature’s Hit Point maximum.<BR>Massive Damage.<BR>When damage reduces a character to 0 Hit Points and damage remains, the character dies if the remainder equals or exceeds their Hit Point maximum. For example, if your character has a Hit Point maximum of 12, currently has 6 Hit Points, and takes 18 damage, the character drops to 0 Hit Points, but 12 damage remains. The character then dies, since 12 equals their Hit Point maximum.<BR>Character Demise<BR>If your character dies, others might find a magical way to revive your character, such as with the Raise Dead spell. Or talk with the DM about making a new character to join the group.<BR>Falling<BR>Unconscious<BR>If you reach 0 Hit Points and don’t die instantly, you have the Unconscious condition until you regain any Hit Points, and you now face making Death Saving Throws (see below).<BR>Knocking Out a Creature<BR>When you would reduce a creature to 0 Hit Points with a melee attack, you can instead reduce the creature to 1 Hit Point and give it the Unconscious condition. It then starts a Short Rest, at the end of which that condition ends on it. The condition ends early if the creature regains any Hit Points or if someone takes an action to administer first aid to it, making a successful DC 10 Wisdom (Medicine) check.<BR>Death Saving Throws<BR>Whenever you start your turn with 0 Hit Points, you must make a Death Saving Throw to determine whether you creep closer to death or hang on to life. Unlike other saving throws, this one isn’t tied to an ability score. You’re in the hands of fate now.<BR>Three Successes/Failures.<BR>Roll 1d20. If the roll is 10 or higher, you succeed. Otherwise, you fail. A success or failure has no effect by itself. On your third success, you become Stable. On your third failure, you die.<BR>The successes and failures don’t need to be consecutive; keep track of both until you collect three of a kind. The number of both is reset to zero when you regain any Hit Points or become Stable.<BR>Rolling a 1 or 20.<BR>When you roll a 1 on the d20 for a Death Saving Throw, you suffer two failures. If you roll a 20 on the d20, you regain 1 Hit Point.<BR>Damage at 0 Hit Points.<BR>If you take any damage while you have 0 Hit Points, you suffer a Death Saving Throw failure. If the damage is from a Critical Hit, you suffer two failures instead. If the damage equals or exceeds your Hit Point maximum, you die.<BR>Stabilizing a Character<BR>You can take the Help action to try to stabilize a creature with 0 Hit Points, which requires a successful DC 10 Wisdom (Medicine) check.<BR>A Stable creature doesn’t make Death Saving Throws even though it has 0 Hit Points, but it still has the Unconscious condition. If the creature takes damage, it stops being Stable and starts making Death Saving Throws again. A Stable creature that isn’t healed regains 1 Hit Point after 1d4 hours.",
            `death-zone`
        ],
        [
            "burrowing",
            /nonmatching string to prevent accidental triggering/i,
            "A creature that has a Burrow Speed can use that speed to move through sand, earth, mud, or ice. The creature can’t burrow through solid rock unless the creature has a trait that allows it to do so. See also “Speed.",
            `edge-crack`
        ],
        [
            "dodging",
            /nonmatching string to prevent accidental triggering/i,
            "If you take the Dodge action, you gain the following benefits: until the start of your next turn, any attack roll made against you has Disadvantage if you can see the attacker, and you make Dexterity saving throws with Advantage.<BR>You lose these benefits if you have the Incapacitated condition or if your Speed is 0.",
            `tread`
        ],
        [
            "inspiration",
            /nonmatching string to prevent accidental triggering/i,
            "If you (a player character) have Heroic Inspiration, you can expend it to reroll any die immediately after rolling it, and you must use the new roll.<BR>If you gain Heroic Inspiration but already have it, it’s lost unless you give it to a player character who lacks it.",
            `flying-flag`
        ],
        [
            "TemporaryHP",
            /nonmatching string to prevent accidental triggering/i,
            "Temporary Hit Points aren’t actual hit points; they are a buffer against damage, a pool of Hit Points that protect you from injury.<BR>When you have temporary Hit Points and take damage, the temporary Hit Points are lost first, and any leftover damage carries over to your normal Hit Points. For example, if you have 5 temporary Hit Points and take 7 damage, you lose the temporary Hit Points and then take 2 damage.<BR>Because temporary Hit Points are separate from your actual Hit Points, they can exceed your hit point maximum. A character can, therefore, be at full Hit Points and receive temporary Hit Points.<BR>Healing can’t restore temporary Hit Points, and they can’t be added together. If you have temporary Hit Points and receive more of them, you decide whether to keep the ones you have or to gain the new ones. For example, if a spell grants you 12 temporary Hit Points when you already have 10, you can have 12 or 10, not 22.<BR>If you have 0 Hit Points, receiving temporary Hit Points doesn’t restore you to consciousness or stabilize you. They can still absorb damage directed at you while you’re in that state, but only true Healing can save you.<BR>Unless a feature that grants you temporary Hit Points has a Duration, they last until they’re depleted or you finish a Long Rest.",
            `broken-heart`
        ]



    ]
    // END SET STATUS CONDITIONS OR TOKEN MARKERS


    let defaultConditionsArray_EasyToRead = [
        ["concentrating",
            /concentration check|concentration=1/i,
            "Some spells and other effects require Concentration to remain active, as specified in their descriptions. If the effect’s creator loses Concentration, the effect ends. If the effect has a maximum duration, the effect’s description specifies how long the creator can concentrate on it: up to 1 minute, 1 hour, or some other duration. The creator can end Concentration at any time (no action required). The following factors break Concentration.<BR>Another Concentration Effect. You lose Concentration on an effect the moment you start casting a spell that requires Concentration or activate another effect that requires Concentration.<BR>Damage. If you take damage, you must succeed on a Constitution saving throw to maintain Concentration. The DC equals 10 or half the damage taken (round down), whichever number is higher, up to a maximum DC of 30.<BR>Incapacitated or Dead. Your Concentration ends if you have the Incapacitated condition or you die.",
            `Concentrating`
        ],
        ["blinded",
            /(be|and|is|magically|become|becomes|is either|has the) blinded|blinded condition/i,
            "While you have the Blinded condition, you experience the following effects.<BR><b>Can’t See.</b> You can’t see and automatically fail any ability check that requires sight.<BR><b>Attacks Affected.</b> Attack rolls against you have Advantage, and your attack rolls have Disadvantage.",
            `Blinded`
        ],
        [
            "charmed",
            /(be|and|is|magically|become|becomes) charmed|charmed condition/i,
            "While you have the Charmed condition, you experience the following effects.<BR><BR><b>Can’t Harm the Charmer.</b> You can’t attack the charmer or target the charmer with damaging abilities or magical effects.<BR><BR><b>Social Advantage.</b> The charmer has Advantage on any ability check to interact with you socially.",
            `Charmed`
        ],
        [
            "deafened",
            /(be|and|is|magically|become|becomes) deafened|deafened condition/i,
            "While you have the Deafened condition, you experience the following effect.<BR><BR><b>Can’t Hear.</b> You can’t hear and automatically fail any ability check that requires hearing.",
            `Deafened`
        ],
        [
            "exhausted",
            /(be|and|is|magically|become|becomes) exhausted|(of|magical) exhaustion|exhausted condition/i,
            "While you have the Exhaustion condition, you experience the following effects.<BR><BR><b>Exhaustion Levels.</b> This condition is cumulative. Each time you receive it, you gain 1 Exhaustion level. You die if your Exhaustion level is 6.<BR><BR><b>D20 Tests Affected.</b> When you make a D20 Test, the roll is reduced by 2 times your Exhaustion level.<BR><BR><b>Speed Reduced.</b> Your Speed is reduced by a number of feet equal to 5 times your Exhaustion level.<BR><BR><b>Removing Exhaustion Levels.</b> Finishing a Long Rest removes 1 of your Exhaustion levels. When your Exhaustion level reaches 0, the condition ends.",
            `Exhausted`
        ],
        [
            "frightened",
            /(be|and|is|magically|become|becomes) frightened|frightened condition/i,
            "While you have the Frightened condition, you experience the following effects.<BR><BR><b>Ability Checks and Attacks Affected.</b> You have Disadvantage on ability checks and attack rolls while the source of fear is within line of sight.<BR><BR><b>Can’t Approach.</b> You can’t willingly move closer to the source of fear.",
            `Frightened`
        ],
        [
            "grappled",
            /(be|and|is|magically|becomes|considered) grappled|grappled condition/i,
            "While you have the Grappled condition, you experience the following effects.<BR><BR><b>Speed 0.</b> Your Speed is 0 and can’t increase.<BR><BR><b>Attacks Affected.</b> You have Disadvantage on attack rolls against any target other than the grappler.<BR><BR><b>Movable.</b> The grappler can drag or carry you when it moves, but every foot of movement costs it 1 extra foot unless you are Tiny or two or more sizes smaller than it.",
            `Grappled`
        ],
        [
            "incapacitated",
            /(be|and|is|magically|become|becomes) incapacitated|incapacitated condition/i,
            "While you have the Incapacitated condition, you experience the following effects.<BR><BR><b>Inactive.</b> You can’t take any action, Bonus Action, or Reaction.<BR><BR><b>No Concentration.</b> Your Concentration is broken.<BR><BR><b>Speechless.</b> You can’t speak.<BR><BR><b>Surprised.</b> If you’re Incapacitated when you roll Initiative, you have Disadvantage on the roll.",
            `Incapacitated`
        ],
        [
            "invisible",
            /(be|and|is|magically|become|becomes) invisible|invisible condition/i,
            "While you have the Invisible condition, you experience the following effects.<BR><BR><b>Surprise.</b> If you’re Invisible when you roll Initiative, you have Advantage on the roll.<BR><BR><b>Concealed.</b> You aren’t affected by any effect that requires its target to be seen unless the effect’s creator can somehow see you. Any equipment you are wearing or carrying is also concealed.<BR><BR><b>Attacks Affected.</b> Attack rolls against you have Disadvantage, and your attack rolls have Advantage. If a creature can somehow see you, you don’t gain this benefit against that creature.",
            `Invisible`
        ],
        [
            "paralyzed",
            /(be|and|is|magically|become|becomes) paralyzed|paralyzed condition/i,
            "While you have the Paralyzed condition, you experience the following effects.<BR><BR><b>Incapacitated.</b> You have the <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef incapacitated'>Incapacitated</a> condition.<BR><BR><b>Speed 0.</b> Your Speed is 0 and can’t increase.<BR><BR><b>Saving Throws Affected.</b> You automatically fail Strength and Dexterity saving throws.<BR><BR><b>Attacks Affected.</b> Attack rolls against you have Advantage.<BR><BR><b>Automatic Critical Hits.</b> Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.",
            `Paralyzed`
        ],
        [
            "petrified",
            /(be|and|is|magically|become|becomes|becoming) petrified|(turns to|turning to) stone|petrified condition/i,
            "While you have the Petrified condition, you experience the following effects.<BR><BR><b>Turned to Inanimate Substance.</b> You are transformed, along with any nonmagical objects you are wearing and carrying, into a solid inanimate substance (usually stone). Your weight increases by a factor of ten, and you cease aging.<BR><BR><b>Incapacitated.</b> You have the <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef incapacitated'>Incapacitated</a> condition.<BR><BR><b>Speed 0.</b> Your Speed is 0 and can’t increase.<BR><BR><b>Attacks Affected.</b> Attack rolls against you have Advantage.<BR><BR><b>Saving Throws Affected.</b> You automatically fail Strength and Dexterity saving throws.<BR><BR><b>Resist Damage.</b> You have Resistance to all damage.<BR><BR><b>Poison Immunity.</b> You have Immunity to the Poisoned condition.",
            `Petrified`
        ],
        [
            "poisoned",
            /(be|and|is|magically|become|becomes) poisoned|poisoned condition/i,
            "While you have the Poisoned condition, you experience the following effect.<BR><BR><b>Ability Checks and Attacks Affected.</b> You have Disadvantage on attack rolls and ability checks.",
            'Poisoned'
        ],
        [
            "prone",
            /(be|and|is|magically|become|becomes|knocked|fall|falls) prone|prone condition/i,
            "While you have the Prone condition, you experience the following effects.<BR><BR><b>Restricted Movement.</b> Your only movement options are to crawl or to spend an amount of movement equal to half your Speed (round down) to right yourself and thereby end the condition. If your Speed is 0, you can’t right yourself.<BR><BR><b>Attacks Affected.</b> You have Disadvantage on attack rolls. An attack roll against you has Advantage if the attacker is within 5 feet of you. Otherwise, that attack roll has Disadvantage.",
            `Prone`
        ],
        [
            "restrained",
            /(be|and|is|magically|become|becomes) restrained|restrained condition/i,
            "While you have the Restrained condition, you experience the following effects.<BR><BR><b>Speed 0.</b> Your Speed is 0 and can’t increase.<BR><BR><b>Attacks Affected.</b> Attack rolls against you have Advantage, and your attack rolls have Disadvantage.<BR><BR><b>Saving Throws Affected.</b> You have Disadvantage on Dexterity saving throws.",
            `Restrained`
        ],
        [
            "stunned",
            /(be|and|is|magically|become|becomes) stunned|stunned condition/i,
            "While you have the Stunned condition, you experience the following effects.<BR><BR><b>Incapacitated.</b> You have the <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef incapacitated'>Incapacitated</a> condition.<BR><BR><b>Saving Throws Affected.</b> You automatically fail Strength and Dexterity saving throws.<BR><BR><b>Attacks Affected.</b> Attack rolls against you have Advantage.",
            `Stunned`
        ],
        [
            "unconscious",
            /(be|and|is|magically|become|becomes) unconscious|unconscious condition/i,
            "While you have the Unconscious condition, you experience the following effects.<BR><BR><b>Inert.</b> You have the <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef incapacitated'>Incapacitated</a> and <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef prone'>Prone</a> conditions, and you drop whatever you’re holding. When this condition ends, you remain Prone.<BR><BR><b>Speed 0.</b> Your Speed is 0 and can’t increase.<BR><BR><b>Attacks Affected.</b> Attack rolls against you have Advantage.<BR><BR><b>Saving Throws Affected.</b> You automatically fail Strength and Dexterity saving throws.<BR><BR><b>Automatic Critical Hits.</b> Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.<BR><BR><b>Unaware.</b> You’re unaware of your surroundings.",
            `Unconscious9`
        ],
        [
            "dead",
            /nonmatching string to prevent accidental triggering/i,
            "A dead creature has no Hit Points and can’t regain them unless it is first revived by magic such as the Raise Dead or Revivify spell. When such a spell is cast, the spirit knows who is casting it and can refuse. The spirit of a dead creature has left the body and departed for the Outer Planes, and reviving the creature requires calling the spirit back.<BR>If the creature returns to life, the revival effect determines the creature’s current Hit Points. Unless otherwise stated, the creature returns to life with any conditions, magical contagions, or curses that were affecting it at death if the durations of those effects are still ongoing. If the creature died with any Exhaustion levels, it returns with 1 fewer level. If the creature had Attunement to one or more magic items, it is no longer attuned to them.",
            `dead`
        ],
        [
            "bardic-inspiration",
            /You can inspire others through stirring words or music/i,
            "Once within the next 10 minutes, the creature can roll the die and add the number rolled to one ability check, Attack roll, or saving throw it makes. The creature can wait until after it rolls The D20 before deciding to use the Bardic Inspiration die, but must decide before the DM says whether the roll succeeds or fails.",
            `Bardic`
        ],
        [
            "bloodied",
            /nonmatching string to prevent accidental triggering/i,
            "A creature is Bloodied while it has half its Hit Points or fewer remaining. Usually determines the effectiveness of a Swarm. It is the point at which a creature reaches half their full hit points. The DM may reveal this to the players as an indicator of how strong the monster currently is.",
            `Bloodied`
        ],
        [
            "confused",
            /spawning delusions and provoking uncontrolled action/i,
            "Not a true condition, but can represent the effect of the confusion spell.<BR>An affected target can’t take reactions and must roll 1d10 at the start of each of its turns to determine its behavior for that turn, consulting the table below.<BR>1d10 - Behavior for the Turn<BR>1 - The target doesn't take an action, and it uses all its movement to move. Roll 1d4 for the direction: 1, north; 2, east; 3, south; or 4, west. <BR>2-6 - The target doesn't move or take actions. <BR>7-8 - The target doesn't move, and it takes the Attack action to make one melee attack against a random creature within reach. If none are within reach, the target takes no action.<BR>9-10 - The target chooses its behavior. At the end of each of its turns, an affected target repeats the save, ending the spell on itself on a success.",
            `Confused`
        ],
        [
            "full-cover",
            /nonmatching string to prevent accidental triggering/i,
            "Cover provides a degree of protection to a target behind it. There are three degrees of cover, each of which provides a different benefit to a target: Half Cover (+2 bonus to AC and Dexterity saving throws), Three-Quarters Cover (+5 bonus to AC and Dexterity saving throws), and Total Cover (can’t be targeted directly). If behind more than one degree of cover, a target benefits only from the most protective degree.",
            //          `death-zone`
            `Cover`
        ],
        [
            "three-quarter-cover",
            /nonmatching string to prevent accidental triggering/i,
            "Cover provides a degree of protection to a target behind it. There are three degrees of cover, each of which provides a different benefit to a target: Half Cover (+2 bonus to AC and Dexterity saving throws), Three-Quarters Cover (+5 bonus to AC and Dexterity saving throws), and Total Cover (can’t be targeted directly). If behind more than one degree of cover, a target benefits only from the most protective degree.",
            `ThreeQuarterCover`
        ],
        [
            "half-cover",
            /nonmatching string to prevent accidental triggering/i,
            "Cover provides a degree of protection to a target behind it. There are three degrees of cover, each of which provides a different benefit to a target: Half Cover (+2 bonus to AC and Dexterity saving throws), Three-Quarters Cover (+5 bonus to AC and Dexterity saving throws), and Total Cover (can’t be targeted directly). If behind more than one degree of cover, a target benefits only from the most protective degree.",
            `HalfCover`
        ],
        [
            "diseased",
            /nonmatching string to prevent accidental triggering/i,
            "See the entry on <a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='https://app.roll20.net/compendium/dnd5e/Rules%3ADiseases?sharedCompendium=4665985#toc_1'>Diseases</a> in the Compendium",
            `Dieseased`
        ],
        [
            "ethereal",
            /ethereal/i,
            "Border Ethereal<BR>From the Border Ethereal, a traveler can see into whatever plane it overlaps, but that plane appears grayish and indistinct, its colors blurring into each other and its edges turning fuzzy, limiting visibility to 30 feet into the other plane. Conversely, the Ethereal Plane is usually imperceptible to those on the overlapped planes, except with the aid of magic.<BR>Normally, creatures in the Border Ethereal can’t attack creatures on the overlapped plane, and vice versa. A traveler on the Ethereal Plane is imperceptible to someone on the overlapped plane, and solid objects on the overlapped plane don’t hamper the movement of a creature in the Border Ethereal. The exceptions are certain magical effects (including anything made of magical force) and living beings. This makes the Ethereal Plane ideal for scouting, spying on opponents, and moving around without being detected. The Ethereal Plane also disobeys the laws of gravity; a creature there can freely move in any direction.<BR>Deep Ethereal<BR>To reach the Deep Ethereal, one typically needs a Plane Shift spell, a Gate spell, or a magical portal. Visitors to the Deep Ethereal are engulfed by roiling mist. Scattered throughout the plane are curtains of vaporous color, and passing through a curtain leads a traveler to a region of the Border Ethereal connected to a specific Inner Plane, the Material Plane, the Feywild, or the Shadowfell. The color of the curtain indicates the plane whose Border Ethereal the curtain conceals; see the Ethereal Curtains table. The curtains are also distinguishable by texture and temperature, each one reflecting something of the nature of the plane beyond.",
            `Ethereal`
        ],
        [
            "flying",
            /nonmatching string to prevent accidental triggering/i,
            "A variety of effects allow a creature to fly. While flying, you fall if you have the Incapacitated or Prone condition or your Fly Speed is reduced to 0. You can stay aloft in those circumstances if you can hover.",
            `Flying`
        ],
        [
            "haste",
            /as a wave of lethargy sweeps over it/i,
            "The target’s speed is doubled, it gains a +2 bonus to AC, it has advantage on Dexterity Saving Throws, and it gains an additional Action on each of its turns. That Action can be used only to take the Attack (one weapon attac⁠k only), Dash, Disengage, Hide, or Use an Object Action.<BR>When the spell ends, the target can’t move or take actions until after its next turn, as a wave of lethargy sweeps over it.",
            `Haste`
        ],
        [
            "hexed",
            /You place a curse on a creature that you can see within range/i,
            "You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 Necrotic damage to the target whenever you hit it with an attack roll. Also, choose one ability when you cast the spell. The target has Disadvantage on ability checks made with the chosen ability.<BR>If the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action on a later turn to curse a new creature.",
            `Hexed`
        ],
        [
            "hexblade-curse",
            /Starting at 1st Level, you gain the ability to place a baleful curse on someone/i,
            "As a Bonus Action, choose one creature you can see within 30 feet of you. The target is Cursed for 1 minute. The curse ends early if the target dies, you die, or you are Incapacitated. Until the curse ends, you gain the following benefits:<BR>You gain a bonus to Damage Rolls against the Cursed target. The bonus equals your Proficiency Bonus.<BR>Any Attack roll you make against the Cursed target is a critical hit on a roll of 19 or 20 on The D20.<BR>If the Cursed target dies, you regain Hit Points equal to your Warlock level + your Charisma modifier (minimum of 1 hit point).<BR>You can’t use this feature again until you finish a short or Long Rest.",
            `Hexed2`
        ],
        [
            "hidden",
            /nonmatching string to prevent accidental triggering/i,
            "With the Hide action, you try to conceal yourself. To do so, you must succeed on a DC 15 Dexterity (Stealth) check while you’re Heavily Obscured or behind Three-Quarters Cover or Total Cover, and you must be out of any enemy’s line of sight; if you can see a creature, you can discern whether it can see you.<BR>On a successful check, you have the Invisible condition. Make note of your check’s total, which is the DC for a creature to find you with a Wisdom (Perception) check.<BR>The condition ends on you immediately after any of the following occurs: you make a sound louder than a whisper, an enemy finds you, you make an attack roll, or you cast a spell with a Verbal component.",
            `Hidden`
        ],
        [
            "TempHP",
            /nonmatching string to prevent accidental triggering/i,
            "Temporary Hit Points aren’t actual hit points; they are a buffer against damage, a pool of Hit Points that protect you from injury.<BR>When you have temporary Hit Points and take damage, the temporary Hit Points are lost first, and any leftover damage carries over to your normal Hit Points. For example, if you have 5 temporary Hit Points and take 7 damage, you lose the temporary Hit Points and then take 2 damage.<BR>Because temporary Hit Points are separate from your actual Hit Points, they can exceed your hit point maximum. A character can, therefore, be at full Hit Points and receive temporary Hit Points.<BR>Healing can’t restore temporary Hit Points, and they can’t be added together. If you have temporary Hit Points and receive more of them, you decide whether to keep the ones you have or to gain the new ones. For example, if a spell grants you 12 temporary Hit Points when you already have 10, you can have 12 or 10, not 22.<BR>If you have 0 Hit Points, receiving temporary Hit Points doesn’t restore you to consciousness or stabilize you. They can still absorb damage directed at you while you’re in that state, but only true Healing can save you.<BR>Unless a feature that grants you temporary Hit Points has a Duration, they last until they’re depleted or you finish a Long Rest.",
            `TempHP`
        ],
        [
            "favored",
            /mystical bond with Nature to mark the target as your Favored enemy/i,
            "Concentration.<BR>The first time on each of your turns that you hit the Favored enemy and deal damage to it, including when you mark it, you can increase that damage by 1d4.<BR>You can use this feature to mark a Favored enemy a number of times equal to your Proficiency bonus, and you regain all expended uses when you finish a Long Rest.<BR>This feature's extra damage increases when you reach certain levels in this class: to 1d6 at 6th Level and to 1d8 at 14th level.",
            `Marked`
        ],
        [
            "marked",
            /(mystically mark it as your quarry|You magically mark one creature you can see within range as your quarry)/i,
            "You magically mark one creature you can see within range as your quarry. Until the spell ends, you deal an extra 1d6 Force damage to the target whenever you hit it with an attack roll. You also have Advantage on any Wisdom (Perception or Survival) check you make to find it.<BR>If the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action to move the mark to a new creature you can see within range.<BR>Using a Higher-Level Spell Slot. Your Concentration can last longer with a spell slot of level 3–4 (up to 8 hours) or 5+ (up to 24 hours).",
            `Marked2`
        ],
        [
            "raging",
            /On your turn, you can enter a rage as a Bonus Action/i,
            "While active, your Rage follows the rules below.<BR>Damage Resistance. You have Resistance to Bludgeoning, Piercing, and Slashing damage.<BR>Rage Damage. When you make an attack using Strength—with either a weapon or an Unarmed Strike—and deal damage to the target, you gain a bonus to the damage that increases as you gain levels as a Barbarian, as shown in the Rage Damage column of the Barbarian Features table.<BR>Strength Advantage. You have Advantage on Strength checks and Strength saving throws.<BR>No Concentration or Spells. You can’t maintain Concentration, and you can’t cast spells.<BR>Duration. The Rage lasts until the end of your next turn, and it ends early if you don Heavy armor or have the Incapacitated condition. If your Rage is still active on your next turn, you can extend the Rage for another round by doing one of the following:<BR>Make an attack roll against an enemy.<BR>Force an enemy to make a saving throw.<BR>Take a Bonus Action to extend your Rage.",
            `Raging`
        ],
        [
            "slowed",
            /You alter time around up to six creatures of your choice/i,
            "Each target must succeed on a Wisdom saving throw or be affected by this spell for the duration.<BR>An affected target’s Speed is halved, it takes a −2 penalty to AC and Dexterity saving throws, and it can’t take Reactions. On its turns, it can take either an action or a Bonus Action, not both, and it can make only one attack if it takes the Attack action. If it casts a spell with a Somatic component, there is a 25 percent chance the spell fails as a result of the target making the spell’s gestures too slowly.<BR>An affected target repeats the save at the end of each of its turns, ending the spell on itself on a success.",
            `Slow`
        ],
        [
            "Torch",
            /nonmatching string to prevent accidental triggering/i,
            "A Torch burns for 1 hour, casting Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. When you take the Attack action, you can attack with the Torch, using it as a Simple Melee weapon. On a hit, the target takes 1 Fire damage.",
            `Torch`
        ],
        [
            "dying",
            /nonmatching string to prevent accidental triggering/i,
            "When a creature drops to 0 Hit Points, it either dies outright or falls unconscious, as explained below.<BR>Instant Death<BR>Here are the main ways a creature can die instantly.<BR>Monster Death.<BR>A monster dies the instant it drops to 0 Hit Points, although a Dungeon Master can ignore this rule for an individual monster and treat it like a character.<BR>Hit Point Maximum of 0.<BR>A creature dies if its Hit Point maximum reaches 0. Certain effects drain life energy, reducing a creature’s Hit Point maximum.<BR>Massive Damage.<BR>When damage reduces a character to 0 Hit Points and damage remains, the character dies if the remainder equals or exceeds their Hit Point maximum. For example, if your character has a Hit Point maximum of 12, currently has 6 Hit Points, and takes 18 damage, the character drops to 0 Hit Points, but 12 damage remains. The character then dies, since 12 equals their Hit Point maximum.<BR>Character Demise<BR>If your character dies, others might find a magical way to revive your character, such as with the Raise Dead spell. Or talk with the DM about making a new character to join the group.<BR>Falling<BR>Unconscious<BR>If you reach 0 Hit Points and don’t die instantly, you have the Unconscious condition until you regain any Hit Points, and you now face making Death Saving Throws (see below).<BR>Knocking Out a Creature<BR>When you would reduce a creature to 0 Hit Points with a melee attack, you can instead reduce the creature to 1 Hit Point and give it the Unconscious condition. It then starts a Short Rest, at the end of which that condition ends on it. The condition ends early if the creature regains any Hit Points or if someone takes an action to administer first aid to it, making a successful DC 10 Wisdom (Medicine) check.<BR>Death Saving Throws<BR>Whenever you start your turn with 0 Hit Points, you must make a Death Saving Throw to determine whether you creep closer to death or hang on to life. Unlike other saving throws, this one isn’t tied to an ability score. You’re in the hands of fate now.<BR>Three Successes/Failures.<BR>Roll 1d20. If the roll is 10 or higher, you succeed. Otherwise, you fail. A success or failure has no effect by itself. On your third success, you become Stable. On your third failure, you die.<BR>The successes and failures don’t need to be consecutive; keep track of both until you collect three of a kind. The number of both is reset to zero when you regain any Hit Points or become Stable.<BR>Rolling a 1 or 20.<BR>When you roll a 1 on the d20 for a Death Saving Throw, you suffer two failures. If you roll a 20 on the d20, you regain 1 Hit Point.<BR>Damage at 0 Hit Points.<BR>If you take any damage while you have 0 Hit Points, you suffer a Death Saving Throw failure. If the damage is from a Critical Hit, you suffer two failures instead. If the damage equals or exceeds your Hit Point maximum, you die.<BR>Stabilizing a Character<BR>You can take the Help action to try to stabilize a creature with 0 Hit Points, which requires a successful DC 10 Wisdom (Medicine) check.<BR>A Stable creature doesn’t make Death Saving Throws even though it has 0 Hit Points, but it still has the Unconscious condition. If the creature takes damage, it stops being Stable and starts making Death Saving Throws again. A Stable creature that isn’t healed regains 1 Hit Point after 1d4 hours.",
            `Dying`
        ],
        [
            "burrowing",
            /nonmatching string to prevent accidental triggering/i,
            "A creature that has a Burrow Speed can use that speed to move through sand, earth, mud, or ice. The creature can’t burrow through solid rock unless the creature has a trait that allows it to do so. See also “Speed.",
            `Burrowing`
        ],
        [
            "dodging",
            /nonmatching string to prevent accidental triggering/i,
            "If you take the Dodge action, you gain the following benefits: until the start of your next turn, any attack roll made against you has Disadvantage if you can see the attacker, and you make Dexterity saving throws with Advantage.<BR>You lose these benefits if you have the Incapacitated condition or if your Speed is 0.",
            `Dodging`
        ],
        [
            "inspiration",
            /nonmatching string to prevent accidental triggering/i,
            "If you (a player character) have Heroic Inspiration, you can expend it to reroll any die immediately after rolling it, and you must use the new roll.<BR>If you gain Heroic Inspiration but already have it, it’s lost unless you give it to a player character who lacks it.",
            `Inspiration`
        ],
        [
            "TemporaryHP",
            /nonmatching string to prevent accidental triggering/i,
            "Temporary Hit Points aren’t actual hit points; they are a buffer against damage, a pool of Hit Points that protect you from injury.<BR>When you have temporary Hit Points and take damage, the temporary Hit Points are lost first, and any leftover damage carries over to your normal Hit Points. For example, if you have 5 temporary Hit Points and take 7 damage, you lose the temporary Hit Points and then take 2 damage.<BR>Because temporary Hit Points are separate from your actual Hit Points, they can exceed your hit point maximum. A character can, therefore, be at full Hit Points and receive temporary Hit Points.<BR>Healing can’t restore temporary Hit Points, and they can’t be added together. If you have temporary Hit Points and receive more of them, you decide whether to keep the ones you have or to gain the new ones. For example, if a spell grants you 12 temporary Hit Points when you already have 10, you can have 12 or 10, not 22.<BR>If you have 0 Hit Points, receiving temporary Hit Points doesn’t restore you to consciousness or stabilize you. They can still absorb damage directed at you while you’re in that state, but only true Healing can save you.<BR>Unless a feature that grants you temporary Hit Points has a Duration, they last until they’re depleted or you finish a Long Rest.",
            `TempHP2`
        ]



    ]
    // END SET STATUS CONDITIONS OR TOKEN MARKERS

    //Creates Handouts
    function createHandoutIfMissing(name, html, gmnotes, avatar)
    {
        if(!name) return;
        if(!html && !gmnotes && !avatar) return; // nothing to set

        const existing = findObjs(
        {
            _type: "handout",
            name
        })[0];
        if(existing) return;

        const handout = createObj("handout",
        {
            name,
            inplayerjournals: "all",
            archived: false
        });

        const props = {};
        if(html) props.notes = html;
        if(gmnotes) props.gmnotes = gmnotes;
        if(avatar) props.avatar = avatar;

        handout.set(props);
    }



    const buttonstyle = `"background-color:#702c91; border-style:none;border-radius:0px 0px 0px 0px; margin:3px 2px 3px 0px; text-decoration:none;display:inline-block;color:#e6e6e6; font-family:Arial; font-size:13px;	padding:0px 7px"`;
    const publicButtonStyle = `"background-color:#702c91; border-style:none;border-radius:10px 0px 0px 10px; margin:3px 2px 3px 3px; text-decoration:none;display:inline-block;color:#e6e6e6; font-family:Arial; font-size:13px;	padding:0px 3px"`;
    const markerButtonStyle = `"background-color:#702c91; border-style:none;border-radius:0px 10px 10px 0px; margin:3px 3px 3px 0px; text-decoration:none;display:inline-block;color:#e6e6e6; font-family:Arial; font-size:13px;	padding:0px 3px"`;
    const saveButtonstyle = `"background-color:#ce0f69; border-width:0px;border-radius:13px; margin:3px; text-transform:capitalize;text-decoration:none;display:inline-block;color:#fff; font-family:Arial; font-size:13px;	padding:0px 7px"`;
    const groupSaveButtonstyle = `"background-color:#ce0f69; border-width:0px;border-radius:13px 0px 0px 13px; margin:3px 1px 3px 3px; text-transform:capitalize;text-decoration:none;display:inline-block;color:#fff; font-family:Arial; font-size:13px;	padding:0px 7px"`;
    const applyDamageButtonstyle = `"background-color:#ce0f69; border-width:0px;border-radius:0px 13px 13px 0px; margin:3px 3px 3px 1px; text-transform:capitalize;text-decoration:none;display:inline-block;color:#fff; font-family:Arial; font-size:13px;	padding:0px 7px"`;
    const simpleButtonstyle = `"background-color:#702c91; border-style:none;border-radius:2px; margin:3px 2px 3px 0px; text-decoration:none;display:inline-block;color:#e6e6e6; font-family:Arial; font-size:13px;	padding:0px 7px"`;

    const conditionnamestyle = `"background-color:#702c91; border-style:none;border-radius:6px 6px 0px 0px; margin:-8px -8px 3px -8px; font-weight:bold;text-transform:capitalize;text-decoration:none;display:block;text-align:center;color:#e6e6e6; font-family:Arial; font-size:13px;	padding:0px 7px"`;

    const reportstyle = `"display: block; background-color:#aaa; border-radius:6px; text-decoration:none;color:#111; font-family:Arial; font-size:13px; padding: 8px;"`;
    const preportstyle = `"display: block; background-color:#aaa; border-radius:6px; text-decoration:none;color:#111; font-family:Arial; font-size:13px; padding: 8px;"`;
    const regexForTitles = /<a style='background-color: transparent;padding: 0px;color: #702c91;display: inline-block;border: none;' href='!condef incapacitated'>incapacitated<\/a>/;
    const buttonbox = `<div style='position:relative;left: -5px; top: -30px; margin-bottom: -34px; min-height:30px; border: solid 1px #444; border-radius:4px; background-color:#000; color:#ddd; display:block'>`;
    const buttonboxUnshifted = `<div style='position:relative;left: -5px; top: min-height:30px; border: solid 1px #444; border-radius:4px; background-color:#000;display:block'>`;
    const buttonMenuStyle = `"display:block; border:1px solid #555; padding:3px; border-radius:4px; background-color:#bbb;"`;
    const printChar = '<span style="font-family: pictos">w</a>';




    const helpHTML = `<h2>Condefinition</h2><h3>What it does</h3><p>Condefinition reads incoming roll templates and looks for imposed conditions and saving throws. It display a button(s) in chat that allow you to quickly apply a corresponding token marker, define the condition, track concentration, roll saving throws and/or apply damage from spells or effects that are triggered by saving throws.</p><ul><li>If the roll template contains a saving throw, it gives a button for the saving throw. Press the button and click on a target to have it roll the appropriate save. If you have <b>GroupCheck</b> installed, it will run a groupcheck save. If you have <b><a href=\"https://app.roll20.net/forum/post/3631602/script-groupcheck-roll-checks-saves-et-cetera-for-many-tokens-at-once/?pageforid=4359153#post-4359153\">Apply Damage</a></b> installed, it will run through the steps to do a save and apply damage.</li><li>If the roll template contains an imposed condition, it will create a button to define the condition. If there is a cross reference in the definition of the condition, it&nbsp; will create an inline link. You can also hover over the button for the text. You can use this button to whisper the text to yourself, or broadcast to the players.</li><li>You can also toggle that condition on any selected tokens. Assigning token markers requires installing <b>TokenMod</b>, and for greater facility, <b>LibTokenMarkers</b>. It comes with the default Status Markers assigned, but the script creates a configuration handout that can be edited to use custom token markers. Instructions are included later in this handout.</li><li>If you installed this Mod using Roll20 One-Click, it should automatically install&nbsp;<b>GroupCheck</b>,&nbsp;<b>TokenMod</b>, and&nbsp;<b>LibTokenMarkers</b>&nbsp;if they are not already present.&nbsp;<b><a href=\"https://app.roll20.net/forum/post/3631602/script-groupcheck-roll-checks-saves-et-cetera-for-many-tokens-at-once/?pageforid=4359153#post-4359153\">Apply Damage</a></b>&nbsp;needs to be installed manually if you want its functionality.</li><li>Besides the official conditions, this also tracks mentions in chat for many common features that benefit from markers, such as raging, using Hunter's Mark, Hexblade's Curse and more. Each of these has buttons to toggle or define the effect.</li><li>The marker for the Concentrating condition also tracks concentration, and prompts for a Constitution Saving Throw when the token takes damage. See below for details.&nbsp;</li><li>This script has been written to work on Classic or Jumpgate, and with the 2014 and/or 2024 sheets for 5e D&amp;D. Instructions for using this with <b>Condition Sync </b>(2024 sheet only) are included below in the configuration section. A dedicated user could probably adapt this for other sheets, but you would need to install the code manually. Contact me for guidance if you need it, but you will need a decent understanding of JavaScript.</li></ul><h3>What it can't do</h3><p>Currently, there are some limitations:</p><ul><li>This is built for GMs to facilitate running NPCs. Although most of the functions will work with PCs as well, and buttons should display for any player whose actions generate them, not every bit of it is player-accessible</li><li>The conditions are matched to tokens and their markers, not character sheets. This is the intended behavior as each instance of a goblin (for example) can have its own imposed conditions. The only exception is if you are using <b>Condition Sync</b> on the 2024 sheet. In this case, Roll20 will sync PC sheet conditions with the appropriate token markers and vice versa)</li><li>I have tried to catch every variation of condition wording, but I have probably missed a few incidences, particularly in products which do not adhere well to the WotC style.</li><li>In this iteration, all buttons and definitions are whispered to the controller of the NPC, typically the GM. If there is interest, I may change this to obey the whisper settings of the NPC, but I did not want to spam the chat.&nbsp;</li></ul><h3>Helper Scripts</h3><ul><li>Required: <b>Token-mod</b>, <b>libTokenMarkers</b></li><li>Improved by: <b>GroupCheck</b>,&nbsp;<b><a href=\"https://app.roll20.net/forum/post/3631602/script-groupcheck-roll-checks-saves-et-cetera-for-many-tokens-at-once/?pageforid=4359153#post-4359153\">Apply Damage</a></b></li></ul><h2>Operation</h2><h3><b>Buttons</b></h3><p>Every time a condition is implied by something in a chat roll template, or if the report function is used on a selected token, the script produces a button. Each button has three parts.</p><p>The middle, largest part of the button will send a message tot he GM in chat, that defines the condition. Sometimes, this will have links to other conditions that the condition imposes. Such as an <i>Unconscious</i> character is also <i>Incapacitated</i>.</p><p>The left side of the button has a word balloon graphic. This also send the definition to chat, but in this case, it is visible to all players.</p><p>The right hand side of the button shows the marker associated with that condition. It will toggle the marker for any and all selected tokens.</p><p><img src=\"https://files.d20.io/images/442935594/yOS7eoRAux8WyT5rvSFaLg/original.png?1748567284\"></p><p><br></p><h3><b>List All Common Condition Definitions</b></h3><p>Condefinition can produce a reference palette of all official condition buttons.<span style=\"background-color: rgba( 0 , 0 , 0 , 0 )\">&nbsp;Type <code>!condef-all</code>&nbsp; to display the report. Note that the script tracks more markers than this, such as \"Raging\", or \"Marked\". These are just the official <i>conditions</i> defined by the rules.</span></p><p><img src=\"https://files.d20.io/images/442933995/z7UHtU9JRZgfR0p0vx_H4g/original.png?1748566537\"></p><p><br></p><h3>Concentration</h3><p>Condefintion will monitor if the token taking damage has a defined concentration marker on it. If you reduce the hit point bar of a concentrating token, the script will prompt you to make the appropriate Constitution save.</p><p>Example. \"Morrigan\" just took 30 hp of damage while concentrating on a spell. The Script notes that the concentration marker was active, calculates the saving throw and produces a button that will cause the selected token to roll a saving throw. Note: In order to make this script work with both the 2014 and 2024 sheets, the <b>Group Check</b> mod is required and configured for your sheet(s). If you installed Condefinition via Roll20 One Click, it should have installed all helper scripts automatically. See the first section of this handout for more details.&nbsp;</p><p><img src=\"https://files.d20.io/images/442936255/oTJKREx0B8Dwp5TQ6VGxyg/original.png?1748567553\"></p><p><br></p><h3>Report</h3><p>Condefintion also allows you to select any number of tokens and run <code>!condef-report</code>. The script produces a set of report buttons for each selected token that has a defined condition marker on it. In this case, the sub-buttons that toggle token markers will only affect the respective token, and that token does not need to be selected.</p><p><img src=\"https://files.d20.io/images/442937172/myYkaSLzPA8hqYG9xKlu_g/original.png?1748568068\"></p><p><br></p><h3>Automation of Abilities that Force Saving Throws</h3><p>This feature requires both <b>Group Check</b>, and the manually installed script<span style=\"font-family: &#34;proxima nova&#34; , , , &#34;system-ui&#34; , &#34;segoe ui&#34; , &#34;roboto&#34; , , &#34;ubuntu&#34; , &#34;cantarell&#34; , &#34;helvetica neue&#34; , sans-serif\">&nbsp;</span><b style=\"font-family: &#34;proxima nova&#34; , , , &#34;system-ui&#34; , &#34;segoe ui&#34; , &#34;roboto&#34; , , &#34;ubuntu&#34; , &#34;cantarell&#34; , &#34;helvetica neue&#34; , sans-serif\"><a href=\"https://app.roll20.net/forum/post/3631602/script-groupcheck-roll-checks-saves-et-cetera-for-many-tokens-at-once/?pageforid=4359153#post-4359153\">Apply Damage</a></b>&nbsp;in order to function. It also requires that the spell or feature of a creature is sent to chat with the Description turned on. In some cases this requires rolling damage or clicking the roll template button that shows the spell description. There are too many sheet variables to account for here, but in short, the keywords needed in order to trigger the script must have been sent to chat.&nbsp;</p><p><img src=\"https://files.d20.io/images/442940114/kWl_PCGDYV8f_9cs_jw_Yw/original.png?1748569736\"></p><p>The button produced is very similar to the concentration check button. In this case, the left half will roll a saving throw for all selected tokens. If you have Apply Damage installed, it will also walk you through the steps necessary to resolve the roll and apply damage accordingly. Note that this function will work on a combination of selected 2014 and 2024 tokens.</p><p><img src=\"https://files.d20.io/images/442941123/VzdgD5qvSLHRqwKBX2rXNw/original.png?1748570402\"></p><p><br></p><h2>Configuration</h2><p>Out of the box, this script will support conditions defined by both the 2014 and 2024 rule sets. It also can switch between the default token markers or my own Easy to Read token markers. This latter is entirely for my own convenience, and they are not required in any way for the script to function.</p><h4>The Condefinitions Handout</h4><p>Type <code>!condef help</code> or <code>!condef config</code> in chat to call up the configuration controls.&nbsp;</p><p>Condefinition uses a lot of Regular Expressions (search code) to find and apply token markers and definitions. It reads these from a handout called Condefinitions. You can edit this handout manually. It has all of the code needed to define the conditions wrapped in a code block. You can edit the names, the definitions, the search code and the name of the corresponding token marker. The edited text must be clean plain text wrapped in code tags using the Code style button in the editor. Most users will only need to change the name of the token marker to match their chosen set.</p><p><b>Configuring for Condition Sync ( D&amp;D by Roll20 (2024) sheet only)</b></p><p>Condition Sync is a feature that keeps character sheet conditions and token markers in sync. For example, if a player applies the \"Blinded\" condition on their character sheet, the corresponding token marker will be automatically applied to their token. Likewise, if the \"Blinded\" token marker is applied to the token, the character sheet will update to reflect the condition.</p><p>This functionality works by renaming 15 specific token markers to match the naming format recognized by the 2024 character sheet (e.g., sheet-blinded). (There are actually 16 syncing conditions, but the \"Custom\" condition is a catchall that is outside of the purview of this script).</p><p><b>To enable Condition Sync in this script:</b></p><ol><li><b>Choose a 2024 rule set using the appropriate button.</b></li><li><b>Click the \"Use Condition-Sync Marker Names\" button.</b></li><li><b>Finally, click \"Apply Configuration\" to save the changes.</b></li></ol><p><br></p><p>If you don't feel comfortable editing the other code, or do so and make a mistake which breaks the handout, you can reset to the default using the buttons in the configuration panel. The script contains defaults for the 2014 and 2024 rule sets, using the default token markers provided by Roll20. <i>I original wrote this script using my own Marketplace set, so if you have installed my \"Easy to Read Token Markers\" set, then there are also buttons that set defaults for those. This Marketplace set is honestly for my own convenience, and the script does not require this set in any way.</i></p><p>Each Condefintion definition is four lines long, and separated by an empty line.</p><ul><li><b>Line 1</b> is the name of the condition</li><li><b>Line 2</b> is the Regular Expression (REGEX) used to trigger the operation of the script. It's a list of search terms that match condition and effect names. If you are not familiar with REGEX, just leave that line alone and you should be fine.</li><li><b>Line 3</b> is the definition of the condition or effect.. This must all be on one line, and can accept simple html styling.</li><li><b>Line 4</b> is the name of the associated token marker.</li></ul><p>After editing and saving the configuration document, you must press the \"Update Conditions\" button in the chat configuration controls. This will apply the conditions immediately.</p><p><b>It is strongly advised that if you do make home brew changes, you duplicate the Condefinitions Handout to use as a backup.</b> the controls can \"reset to factory specs\", but they cannot undo breaking changes.</p><p>If you create a configuration that uses a marketplace set of Token Markers that you prefer, feel free to share with others. It can be copied and pasted between games, so long as you are careful to paste clean text only (hold down the shift key while pasting, or copy from a plain text editor), and wrap the whole thing in the \"Code\" style.</p><p><img src=\"https://files.d20.io/images/442943259/dwGOgHA6nb3a8fRJIat8Dw/original.png?1748571846\"></p><p><br></p><p><br></p>`;
    //createHandoutIfMissing("Help: Condefinition", helpHTML);
    createHandoutIfMissing("Help: Condefinition", helpHTML, "", "https://s3.amazonaws.com/files.d20.io/images/442783616/hDkduTWDpcVEKomHnbb6AQ/med.png");

    //Only include these buttons if the user has the Easy To Read markers from the Marketplace
const marketButtons = markerExists("Hexed3")
    ? `<b>Easy to Read Markers (Marketplace)</b><br>` +
      makeGenericButton("2014", "!condef-easy2014") + `&nbsp;` +
      makeGenericButton("2024", "!condef-easy2024") + `<br>`
    : "";

        const getConfigMessage = () => `<br>` +
        `Condefinition uses a lot of Regular Expressions (search code) to find and apply token markers and definitions. It reads these from a handout called Condefinitions. This handout has all of the code needed to define the conditions in a code block. You can edit the names, the definitions, the search code and the name of the corresponding token marker. The edited text must be clean plain text wrapped in code tags using the Code style button in the editor. Most users will only need to change the name of the token marker to match their chosen set.<BR><BR>If you don't feel comfortable editing the other code, or do so and make a mistake which breaks the handout, you can reset to the default using the buttons in the configuration panel. The script contains defaults for the 2014 and 2024 rule sets, using the default token markers provided by Roll20. I original wrote this script using my own Marketplace set, so if you have installed my "Easy to Read Token Markers" set, then there are also buttons that set defaults for those. This Marketplace set is honestly for my own convenience, and the script does not require this set in any way.` + `<BR><BR>` +
        `<div style=${buttonMenuStyle}>` +

        (marketButtons ? 
        `<B>Choose your Rule and Marker Sets:</B>` + `<br><br>` +
        `<B>Generic Token Markers</B>`
        :`<B>Choose Your Rule Set</B>`) + `<br>` +
        makeGenericButton("2014", "!condef-generic2014") + `&nbsp;` +
        makeGenericButton("2024", "!condef-generic2024") + `<br>` +

        marketButtons +

         `<br>` +`<B>Modify for Condition Sync?</B>` + `<br>` +
        makeGenericButton("Use Condition-Sync Marker Names", "!condef-sheetmarkers") + `<br><br>` +

        `<B>Edit Manually from Handout</B>` + `<br>` +
        makeGenericButton("Open Handout", getHandoutURL("Condefinitions")) +
        `<br><br>` +

        `<B>Critical Last Step:</B>` + `<br>` +
        makeGenericButton("Apply Configuration", "!condef-loadconditions") +  `<br>` +

        
        `</div>` +
        `<br>` +
        `<div style="text-align:center` + makeGenericButton("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Help&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", getHandoutURL("Help: Condefinition")) + `</div>`
;





    let conditionsArray = [];
    loadConditionsFromHandout();

    let ConcentrationMarker = (conditionsArray.find(([k]) => k.toLowerCase() === "concentrating") || [, , , "death-zone"])[3];
    let condefConcentrationMarker = "status_" + ConcentrationMarker;



    let applyDamageIsInstalled = false;
    //check for dependencies
    if(typeof ApplyDamage !== "undefined")
    {
        applyDamageIsInstalled = true;
    }

    let groupCheckIsInstalled = false;
    if(typeof GroupCheck !== "undefined")
    {
        groupCheckIsInstalled = true;
    }


    const version = '1.0.2';
    log('Condefinitions v' + version + ' is ready! --offset ' + API_Meta.Condefinition.offset + ' for the D&D 5th Edition by Roll20 Sheet. Command is !condef-help');
    loadConditionsFromHandout();

    function getHandoutURL(handoutName)
    {
        const handout = findObjs(
        {
            _type: "handout",
            name: handoutName
        })[0];
        if(!handout)
        {
            sendMessage("No Condefintions Handout could be found. Press one of the default settings buttons to create a new handout.")
            return `"No Handout was found"`;
        }
        else
        {
            const id = handout.get("_id");
            return `https://journal.roll20.net/handout/${id}`;
        }
    }


    function getConditionIcon(conditionName)
    {
        const iconMap = {
            blinded: "bleeding-eye",
            charmed: "chained-heart",
            // Extend as needed
        };
        return iconMap[conditionName] || "question-mark";
    }




    function decodeHTMLEntities(str)
    {
        return str
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&");
    }


    function deserializeConditionsMultiline(text)
    {
        return text
            .replace(/^<pre>|<\/pre>$/g, "") // Strip <pre> tags if present
            .split(/\r?\n\r?\n/) // Split on double line breaks
            .map(block =>
            {
                const [key, regexStr, description, label] = block.trim()
                    .split(/\r?\n/);
                const regexMatch = regexStr?.match(/^\/(.+)\/([gimuy]*)$/);
                const regex = regexMatch ? new RegExp(regexMatch[1], regexMatch[2]) : /.^/;

                return [key, regex, description, label];
            })
            .filter(entry => entry.length === 4); // Prevents malformed rows
    }



    function loadConditionsFromHandout()
    {
        const handout = findObjs(
        {
            _type: "handout",
            name: "Condefinitions"
        })[0];
        if(!handout)
        {
            log("⚠️ Handout 'Condefinitions' not found. Creating new Config handout.");
            writeConditionsToHandoutMultilinePlainText(defaultConditionsArray);
            loadConditionsFromHandout();
            createHandoutIfMissing("Condefinitions", helpHTML);
            sendMessage(getConfigMessage(), "Condefinition Configuration");
            return;
        }

        handout.get("notes", function(notes)
        {
            const parsed = deserializeConditionsMultiline(notes);
            if(parsed.length)
            {
                conditionsArray = parsed;
            }
            else
            {
                log("⚠️ No valid conditions found in 'Condefinitions' handout.");
            }
        });
    }




    function serializeConditionsArrayMultiline(array)
    {
        return array.map(([key, regex, description, label]) =>
                `${key}\n${regex.toString()}\n${description}\n${label}`
            )
            .join("\n\n");
    }



    function writeConditionsToHandoutMultilinePlainText(conditionsArray)
    {
        const content = conditionsArray.map(([key, regex, description, label]) =>
            {
                const regexString = regex.toString(); // /.../flags
                // const icon = getConditionIcon(key);   // optional helper for icon name
                return `${key}\n${regex.toString()}\n${description}\n${label}`;
            })
            .join("\n\n");

        const escaped = content
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const wrapped = `<pre>${escaped}</pre>`;

        let handout = findObjs(
        {
            _type: "handout",
            name: "Condefinitions"
        })[0];

        if(!handout)
        {
            handout = createObj("handout",
            {
                name: "Condefinitions",
                inplayerjournals: "all",
                archived: false
            });
        }

        handout.set(
        {
            notes: wrapped
        });
    }



    function readAndParseConditions()
    {
        const handout = findObjs(
        {
            _type: "handout",
            name: "Condefinitions"
        })[0];
        if(!handout)
        {
            log("⚠️ Handout not found.");
            return;
        }

        handout.get("notes", function(notes)
        {

            const stripped = notes.replace(/^<pre>/i, "")
                .replace(/<\/pre>$/i, "");
            const decoded = stripped
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&amp;/g, "&");


            const parsed = deserializeConditionsMultiline(notes);
            return parsed
        });
    }


    function mergeDescriptionsWithClassicDefinitions(originalArray, newConditions)
    {
        return originalArray.map(entry =>
        {
            const [key, regex, , marker] = entry;
            const match = newConditions.find(def => def[0] === key);
            const newDescription = match ? match[1] : entry[2]; // fallback to original description if no match
            return [key, regex, newDescription, marker];
        });
    }




    function sendMessage(message, title)
    {
        let theTitle = (title ? `<div style=${conditionnamestyle}>${title} </div>` : "");
        let theMessage = (message ? ` <div style=${reportstyle}>${theTitle}${message}</div>` : "");

        sendChat("Condefinition", `/w gm ${theMessage}`, null,
        {
            noarchive: true
        });
    }




    // writeConditionsToHandoutMultilinePlainText(conditionsArray);


    const input = `<pre>blinded
/(be|and|is|magically|become|becomes|is either) blinded|blinded condition/i
Example description here
bleeding-eye
Blinded</pre>`;

    const result = deserializeConditionsMultiline(input);



    let buttons = "";
    let reportText = "";

    function makeButton(conditionName, descriptionText, tokenMarker, tokenID)
    {
        let tmLabel = `<span style="font-family: pictos">L</span>`;
        //let markerName = tokenMarker;

        let markerName = ((tokenMarker.includes(";;")) ? tokenMarker.split(";;")[0] : tokenMarker);
        if('undefined' !== typeof libTokenMarkers && undefined !== libTokenMarkers.getStatus(markerName)
            .url)
        {
            let tmImage = libTokenMarkers.getStatus(markerName)
                .url;

            if(undefined !== tmImage && tmImage.length > 0)
            {
                tmLabel = `<img src="${tmImage}"style="margin-top:-1px; height:12px;">`;
            }
        }
        buttons = buttons + `<div style="display:inline-block"><a href="!pcondef ${conditionName}" title="${descriptionText.replace(/<BR>/g, " ").replace(regexForTitles, "incapacitated")}" style=${publicButtonStyle}>${printChar}</a><a href="!condef ${conditionName}" title="${descriptionText.replace(/<BR>/g, " ").replace(regexForTitles, "incapacitated")}" style=${buttonstyle}>${conditionName}</a><a href="!condef-toggle ${tokenMarker} ${((undefined !== tokenID) ? " --ignore-selected --ids " + tokenID : "")}" style=${markerButtonStyle}>${tmLabel}</a></div>`;
    }


    function makeGenericButton(name, link)
    {
        return `<div style="display:inline-block"><a href="${link}"  style=${simpleButtonstyle}>${name}</a></div>`;

    }


    //Concentration Observer
    function concentrationCheck(obj, prev)
    {
        if(obj.get("statusmarkers")
            .includes(condefConcentrationMarker) || obj.get("statusmarkers")
            .includes(ConcentrationMarker) || obj.get(condefConcentrationMarker))
        {
            //        if (obj.get(condefConcentrationMarker)) {
            if(prev["bar1_value"] > obj.get("bar1_value"))
            {
                let final_conc_DC = 10;
                let calc_conc_DC = (prev["bar1_value"] - obj.get("bar1_value")) / 2;
                if(calc_conc_DC > final_conc_DC)
                {
                    final_conc_DC = Math.floor(calc_conc_DC);
                }
                //                let tokenName = obj.get("name");
                let theMessage = `! &{template:spell} {{name=Concentration}}{{savedc=${final_conc_DC}}} {{description=Make a DC ${final_conc_DC} Constitution saving throw}}{{Concentration=1}}`;
                //              let theMessage = `this should print`;
                sendChat("gm", theMessage);
            }
        }

    }

    //Event Handlers
    on("change:graphic:bar1_value", concentrationCheck);
    if(typeof(TokenMod) === 'object') TokenMod.ObserveTokenChange(concentrationCheck);
    if('undefined' !== typeof SmartAoE && SmartAoE.ObserveTokenChange)
    {
        SmartAoE.ObserveTokenChange(function(obj, prev)
        {
            concentrationCheck(obj, prev);
        });
    }


    //Condition report creator. Use !condef for GM only, pcondef for player report. Follow by condition names separated by spaces. !condef-all returns buttons for all conditions, for reference
    on('chat:message', function(msg)
    {


        if(msg.type === "api" && msg.content === "!condef-generic2014")
        {
            writeConditionsToHandoutMultilinePlainText(mergeDescriptionsWithClassicDefinitions(defaultConditionsArray, definitions2014));
            loadConditionsFromHandout();
            sendMessage("Condefinitions handout has been reset to Default token markers using the 2014 condition definitions");
            return;
        }

        if(msg.type === "api" && msg.content === "!condef-generic2024")
        {
            writeConditionsToHandoutMultilinePlainText(mergeDescriptionsWithClassicDefinitions(defaultConditionsArray, definitions2024));
            loadConditionsFromHandout();
            sendMessage("Condefinitions handout has been reset to Default token markers using the 2024 condition definitions");
            return;
        }

        if(msg.type === "api" && msg.content === "!condef-easy2014")
        {
            writeConditionsToHandoutMultilinePlainText(mergeDescriptionsWithClassicDefinitions(defaultConditionsArray_EasyToRead, definitions2014));
            loadConditionsFromHandout();
            sendMessage("Condefinitions handout has been reset to the Easy to Read token markers using the 2014 condition definitions");
            return;
        }

        if(msg.type === "api" && msg.content === "!condef-easy2024")
        {
            writeConditionsToHandoutMultilinePlainText(mergeDescriptionsWithClassicDefinitions(defaultConditionsArray_EasyToRead, definitions2024));
            loadConditionsFromHandout();
            sendMessage("Condefinitions handout has been reset to the Easy to Read token markers using the 2024 condition definitions");
            return;
        }


if (msg.type === 'api' && msg.content === '!condef-sheetmarkers' && playerIsGM(msg.playerid)) {
    const handout = findObjs({ _type: "handout", name: "Condefinitions" })[0];
    if (!handout) {
        sendMessage("⚠️ Handout 'Condefinitions' not found.", "Condefinition");
        return;
    }

    handout.get("notes", function (notes) {
        const stripped = notes.replace(/^<pre>/i, "").replace(/<\/pre>$/i, "");
        const decoded = stripped
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&");

        const targetConditions = new Set([
            "blinded", "charmed", "custom", "deafened", "exhausted",
            "frightened", "grappled", "incapacitated", "invisible",
            "paralyzed", "petrified", "poisoned", "prone",
            "restrained", "stunned", "unconscious"
        ]);

        const blocks = decoded.split(/\n\s*\n/);

        const updatedBlocks = blocks.map(block => {
            const lines = block.trim().split('\n');
            if (lines.length !== 4) return block;

            const [name, regex, description, marker] = lines;
            const key = name.trim().toLowerCase();
            if (targetConditions.has(key)) {
                return [name, regex, description, `sheet-${key}`].join('\n');
            }
            return block;
        });

        const updated = updatedBlocks.join('\n\n');

        const escaped = updated
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        const wrapped = `<pre>${escaped}</pre>`;

        handout.set({ notes: wrapped });

        sendMessage("✅ 16 condition token markers updated to sheet-compatible names.", "Condefinition");
    });
}



        if(msg.type === "api" && msg.content === "!condef-loadconditions")
        {
            loadConditionsFromHandout();
            ConcentrationMarker = (conditionsArray.find(([k]) => k.toLowerCase() === "concentrating") || [, , , "death-zone"])[3];
            condefConcentrationMarker = "status_" + ConcentrationMarker;

            sendMessage("Condition definitions reloaded from handout.");
            return;
        }

        if(msg.type === "api" && (msg.content === "!condef-config" || msg.content === "!condef-help"))
        {
    createHandoutIfMissing("Help: Condefinition", helpHTML, "", "https://s3.amazonaws.com/files.d20.io/images/442783616/hDkduTWDpcVEKomHnbb6AQ/med.png");

            sendMessage(getConfigMessage(), "Condefinition Configuration");
            return;
        }




        if('api' === msg.type && msg.content.match(/^!(condef|pcondef|condef-all|condef-report|condef-toggle)/))
        {
            let args = msg.content.split(" ");
            let sender = msg.who;
            if(msg.content === '!condef-all')
            {
                let message = `! &{template:noecho} {{description= blinded condition charmed condition deafened condition exhausted condition frightened condition grappled condition incapacitated condition invisible condition paralyzed condition petrified condition poisoned condition prone condition restrained condition stunned condition unconscious condition concentration check}}`;
                sendChat("gm", message, null,
                {
                    noarchive: true
                });
                message = "";
                return;
            }


            let messagePrefix = ((msg.content.includes('pcondef')) ? '' : '/w ' + sender + ' ');
            let theCommand = ((msg.content.includes("pcondef")) ? "!pcondef" : "!condef");


            //selected vs target handler
            if(msg.content.includes('condef-toggle ') && msg.content.length > 15)
            {
                let tokenMarker = msg.content.split('condef-toggle ')[1];
                let message = '';
                if(msg.selected)
                {
                    //message = `!token-mod --set statusmarkers|!${tokenMarker}`;
                    let ids = msg.selected.reduce((m, o) => [...m, o._id], []);
                    message = `!token-mod --api-as ${msg.playerid} --set statusmarkers|!${tokenMarker} --ids ${ids.join(' ')}`;
                    //message = `!token-mod --api-as ${msg.playerid} --set statusmarkers|!${tokenMarker}`;

                }
                else
                {

                    message = messagePrefix + buttonboxUnshifted + '<a style = ' + buttonstyle + ' href ="!token-mod --set statusmarkers|!' + tokenMarker + ' --ids &#64;{target|token_id}">No token is selected.<BR>Click here to pick a target.</a></div>';
                }
                sendChat("", message, null,
                {
                    noarchive: true
                });
                return;
            }

            if(msg.content === '!condef-report')
            {
                buttons = "";

                let selected = (msg.selected);

                if(selected)
                {
                    _.each(selected, function(token)
                    {
                        let tok = getObj("graphic", token._id);
                        let tokName = tok.get("name") || "unnamed token";
                        let tokID = tok.get("_id");
                        let markers = tok.get("statusmarkers")
                            .replace(/::/g, ";;");

                        if(markers)
                        {
                            for(let i = 0; i < conditionsArray.length; i++)
                            {
                                let name = conditionsArray[i][0];
                                let descriptionText = conditionsArray[i][2];
                                let tokenMarker = conditionsArray[i][3];

                                if(markers.includes(tokenMarker))
                                {
                                    makeButton(name, descriptionText, tokenMarker, tokID);
                                }
                            }
                            let message = buttonbox + "<span style= 'font-weight:bold; margin: 0px 2px 0px 3px; color:#ddd'>" + tokName + "</span>" + buttons + "</div>";
                            sendChat("", messagePrefix + message, null,
                            {
                                noarchive: true
                            });

                            buttons = "";

                        }
                    });
                }
                else
                {
                    sendMessage("Select one or more tokens with conditions on them");

                }
                return;
            }




            for(let i = 0; i < conditionsArray.length; i++)
            {
                let reportName = conditionsArray[i][0];
                let reportDescription = conditionsArray[i][2];
                if(undefined !== args[1] && args[1] === reportName)
                {
                    reportDescription = reportDescription.replace("!condef", theCommand);
                    reportText = `<div style=${((messagePrefix === "") ? preportstyle : reportstyle)}><div style=${conditionnamestyle}>${reportName} </div>${reportDescription.replace(/&lt;/g, "<").replace(/&gt;/g, ">")}</div>`;
                }
            }

            if(undefined !== reportText && reportText.length > 0)
            {
                sendChat("", messagePrefix + reportText, null,
                {
                    noarchive: true
                });

            }

        }



        //Roll Template Interception
        if((undefined !== msg.rolltemplate && msg.rolltemplate.match(/npcfullatk|npcdmg|npcaction|traits|atkdmg|spell|condefinitions|spelloutput|noecho/g)) || (msg.content.match(/dnd-2024/g)))
        {
            //log (msg.content);
            let sender = msg.who;
            let messagePrefix = '/w ' + sender + ' ';
            let saveAbility = "";
            let saveMatches = "";
            let theAbility = "";
            let saveDC = "";
            let conCheck = "";
            let concentrationButton = "";
            saveMatches = msg.content.match(/DC\s(\d\d)\s(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\ssaving throw/i);
            if(msg.rolltemplate !== "spell" && msg.rolltemplate !== "atkdmg" && null !== saveMatches && saveMatches.length === 3)
            {
                saveDC = saveMatches[1];
                saveAbility = saveMatches[2];
            }
            //msg echo to console is disabled
            if(msg.rolltemplate === "spell" || msg.rolltemplate === "atkdmg" || msg.rolltemplate === "spelloutput" || (msg.content.match(/dnd-2024 dnd-2024--/g)))
            {
                /*log(msg.content);*/
                saveAbility = msg.content.match(/(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\ssav(e|ing throw)/i) || "";
                if(saveAbility.length > 0)
                {
                    saveAbility = saveAbility[1] || "";
                }

                saveDC = ((msg.rolltemplate === "spell" || msg.rolltemplate === "spelloutput") ? msg.content.match(/{{savedc=(\d+)}}/) : msg.content.match(/{{mod=DC(\d+)}}/)) || msg.content.match(/DC\s(\d+)/) || "";
                conCheck = ((msg.rolltemplate === "spell" && msg.content.match(/{{name=Concentration/)) ? "Concentration Check" : "");
                //               if (conCheck!==""){
                //                   makeButton("Concentrating", "makes a con check", "concentrating");
                //               }
                //               concentrationButton = ((conCheck==="") ? "" : "<BR>" + buttons);


                //log("concentrationButton = " + concentrationButton);
                if(saveDC.length > 0)
                {
                    saveDC = saveDC[1] || "";
                }

            }

            if(undefined !== saveAbility && null !== saveAbility)
            {

                theAbility = saveAbility.replace(/Strength/i, "str")
                    .replace(/Dexterity/i, "dex")
                    .replace(/Constitution/i, "con")
                    .replace(/Intelligence/i, "int")
                    .replace(/Wisdom/i, "wis")
                    .replace(/Charisma/i, "cha");
            }
            let saveButton = "";

            if(theAbility.match(/(str|dex|con|int|wis|cha)/))
            {
                //for regular saves
                saveButton = `<a href="!&#13;&#37;{target|npc_${theAbility}}" style=${saveButtonstyle}>DC${saveDC} ${theAbility}</a> <span style = "color:#fff">${conCheck}${concentrationButton}</span>`;
                //for groupcheck
                if(groupCheckIsInstalled)
                {
                    saveAbility = saveAbility.charAt(0)
                        .toUpperCase() + saveAbility.slice(1);
                    saveButton = `<a href="!group-check --${saveAbility} Save" style=${groupSaveButtonstyle}>DC${saveDC} ${theAbility}</a> <span style = "color:#fff">${conCheck}${concentrationButton}</span>`;
                    if(applyDamageIsInstalled && conCheck !== "Concentration Check")
                    {
                        saveButton = saveButton + `<a href="!group-check --hideformula --public --${saveAbility} Save --process --subheader vs DC ${saveDC} --button ApplyDamage !apply-damage ~dmg &#63;{Damage} ~type &#63;{Damage on Save|Half,half|None,none} ~DC ${saveDC}  ~saves RESULTS(,) ~ids IDS(,)" style=${applyDamageButtonstyle}>Dmg</a>`;
                    }
                }
            }

            for(let i = 0; i < conditionsArray.length; i++)
            {
                let name = conditionsArray[i][0];
                let descriptionText = conditionsArray[i][2];
                let tokenMarker = conditionsArray[i][3];

                if(undefined !== name)
                {
                    if(msg.content.match(conditionsArray[i][1]))
                    {
                        makeButton(name, descriptionText, tokenMarker);
                    }

                }
            }
            let GMSaveButton = saveButton;
            if(!playerIsGM(msg.playerid) && msg.playerid !== "API")
            {
                saveButton = "";
            }
            if(buttons.length > 0 || saveButton.length > 0)
            {

                let message = buttonbox + saveButton + buttons + "</div>";
                sendChat("", messagePrefix + message, null,
                {
                    noarchive: true
                });

                if(!messagePrefix.includes(' (GM)') && msg.rolltemplate !== "noecho")
                {
                    message = buttonbox + GMSaveButton + buttons + "</div>";
                    if(conCheck !== "Concentration Check")
                    {
                        sendChat("", '/w gm ' + message, null,
                        {
                            noarchive: true
                        });
                    }
                }


                buttons = "";

            }
        }
    });

});

{
    try
    {
        throw new Error('');
    }
    catch (e)
    {
        API_Meta.Condefinition.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Condefinition.offset);
    }
}
