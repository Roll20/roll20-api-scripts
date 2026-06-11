export function createHelpHandout(handoutID: string): string {

  const contents = [
    "Basic Usage",
    "Available Commands",
    "Beacon Computed Values",
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

  function createTableOfContents(): string {
    return (
      <ol>
        {contents.map(section => (
          <li key={section}>
            <a href={`http://journal.roll20.net/handout/${handoutID}/#${section.replace(/\s+/g, "%20")}`}>{section}</a>
          </li>
        ))}
      </ol>
    );
  };

  return (
    <div>
      <h1>ChatSetAttr</h1>

      <p>ChatSetAttr is a Roll20 API script that allows users to create, modify, or delete character sheet attributes through chat commands macros. Whether you need to update a single character attribute or make bulk changes across multiple characters, ChatSetAttr provides flexible options to streamline your game management.</p>

      <h2>Table of Contents</h2>

      {createTableOfContents()}

      <h2 id="basic-usage">Basic Usage</h2>

      <p>The script provides several command formats:</p>

      <ul>
        <li><code>!setattr [--options]</code> - Create or modify attributes</li>
        <li><code>!modattr [--options]</code> - Shortcut for <code>!setattr --mod</code> (adds to existing values)</li>
        <li><code>!modbattr [--options]</code> - Shortcut for <code>!setattr --modb</code> (adds to values with bounds)</li>
        <li><code>!resetattr [--options]</code> - Shortcut for <code>!setattr --reset</code> (resets to max values)</li>
        <li><code>!delattr [--options]</code> - Delete attributes</li>
      </ul>

      <p>Each command requires a target selection option and one or more attributes to modify.</p>

      <p><strong>Basic structure:</strong></p>
      <pre><code>!setattr --[target selection] --attribute1|value1 --attribute2|value2|max2</code></pre>

      <h2 id="available-commands">Available Commands</h2>

      <h3>!setattr</h3>

      <p>Creates or updates attributes on the selected target(s). If the attribute doesn't exist, it will be created (unless <code>--nocreate</code> is specified).</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --sel --hp|25|50 --hp_temp|8</code></pre>

      <p>This would set <code>hp</code> to 25, <code>hp_max</code> to 50, <code>hp_temp</code> to 8.</p>

      <h3>!modattr</h3>

      <p>Adds to existing attribute values (works only with numeric values). Shorthand for <code>!setattr --mod</code>.</p>

      <p><strong>Example:</strong></p>
      <pre><code>!modattr --sel --hp_temp|-5 --hp|6</code></pre>

      <p>This subtracts 5 from <code>hp_temp</code> and adds 6 to <code>hp</code>.</p>

      <h3>!modbattr</h3>

      <p>Adds to existing attribute values but keeps the result between 0 and the maximum value. Shorthand for <code>!setattr --modb</code>.</p>

      <p><strong>Example:</strong></p>
      <pre><code>!modbattr --sel --hp_temp|-5 --hp|25</code></pre>

      <p>This subtracts 5 from <code>hp_temp</code> but won't reduce it below 0 and increase <code>hp</code> by 25, but won't increase it above <code>mp_xp</code>.</p>

      <h3>!resetattr</h3>

      <p>Resets attributes to their maximum value. Shorthand for <code>!setattr --reset</code>.</p>

      <p><strong>Example:</strong></p>
      <pre><code>!resetattr --sel --hp</code></pre>

      <p>This resets <code>hp</code> to its maximum value.</p>

      <h3>!delattr</h3>

      <p>Deletes the specified attributes.</p>

      <p><strong>Example:</strong></p>
      <pre><code>!delattr --sel --hp --hp_temp</code></pre>

      <p>This removes the <code>hp</code> and <code>hp_temp</code> attributes.</p>

      <h2 id="beacon-computed-values">Beacon Computed Values</h2>

      <p>Beacon character sheets don't have attributes, they have Computed values.  All Computeds for a sheet existing when the sheet starts up, you can't create more or remove existing ones.  If you try to delete a computed, you will get an error message, but it is otherewise safe to try.</p>

      <p>Some Computed values are read-only and cannot be set.  Attempting to set or modify them will result in an error message.</p>

      <p>For player created attributes, Beacon sheets have a system called User Attributes.  If you attempt to add a new attribute to a Beacon sheet, it will create a User Attribute by that name.  User Attributes are prefaced with <code>user.</code> like <code>user.spellpoints</code>. They function like attributes and can be created, removed, set, reset, and modified as desired.</p>

      <h2 id="target-selection">Target Selection</h2>

      <p>One of these options must be specified to determine which characters will be affected:</p>

      <h3>--all</h3>

      <p>Affects all characters in the campaign. <strong>GM only</strong> and should be used with caution, especially in large campaigns.</p>

      <p><strong>Example:</strong></p>
      <pre><code>!resetattr --all --hp</code></pre>

      <h3>--allgm</h3>

      <p>Affects all characters without player controllers (typically NPCs). <strong>GM only</strong>.</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --allgm --reset --hp</code></pre>

      <h3>--allplayers</h3>

      <p>Affects all characters with player controllers (typically PCs).</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --allplayers --mod --hp|-15</code></pre>

      <h3>--charid</h3>

      <p>Affects characters with the specified character IDs. Non-GM players can only affect characters they control.</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --charid &amp;lt;ID1&amp;gt; &amp;lt;ID2&amp;gt; --hp|150</code></pre>

      <h3>--name</h3>

      <p>Affects characters with the specified names. Non-GM players can only affect characters they control.</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --name Gandalf, Frodo Baggins --party|"Fellowship of the Ring"</code></pre>

      <h3>--sel</h3>

      <p>Affects characters represented by currently selected tokens.</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --sel --hp|25 --hp_temp|8</code></pre>

      <h3>--sel-party</h3>

      <p>Affects only party characters represented by currently selected tokens (characters with <code>inParty</code> set to true).</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --sel-party --inspiration|1</code></pre>

      <h3>--sel-noparty</h3>

      <p>Affects only non-party characters represented by currently selected tokens (characters with <code>inParty</code> set to false or not set).</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --sel-noparty --npc_status|"Hostile"</code></pre>

      <h3>--party</h3>

      <p>Affects all characters marked as party members (characters with <code>inParty</code> set to true). <strong>GM only by default</strong>, but can be enabled for players with configuration.</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --party --rest_complete|1</code></pre>

      <h2 id="attribute-syntax">Attribute Syntax</h2>

      <p>The syntax for specifying attributes is:</p>
      <pre><code>--attributeName|currentValue|maxValue</code></pre>

      <ul>
        <li><code>attributeName</code> is the name of the attribute to modify</li>
        <li><code>currentValue</code> is the value to set (optional for some commands)</li>
        <li><code>maxValue</code> is the maximum value to set (optional)</li>
      </ul>

      <h3>Examples:</h3>

      <ol>
        <li>Set current value only:
          <pre><code>--strength|15</code></pre>
        </li>
        <li>Set both current and maximum values:
          <pre><code>--hp|27|35</code></pre>
        </li>
        <li>Set only the maximum value (leave current unchanged):
          <pre><code>--hp||50</code></pre>
        </li>
        <li>Create empty attribute or set to empty:
          <pre><code>--notes|</code></pre>
        </li>
        <li>Use <code>#</code> instead of <code>|</code> (useful in roll queries):
          <pre><code>--strength#15</code></pre>
        </li>
      </ol>

      <h2 id="modifier-options">Modifier Options</h2>

      <p>These options change how attributes are processed:</p>

      <h3>--mod</h3>

      <p>See <code>!modattr</code> command.</p>

      <h3>--modb</h3>

      <p>See <code>!modbattr</code> command.</p>

      <h3>--reset</h3>

      <p>See <code>!resetattr</code> command.</p>

      <h3>--nocreate</h3>

      <p>Prevents creation of new attributes, only updates existing ones.</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --sel --nocreate --perception|20 --hp|15</code></pre>

      <p>This will only update <code>perception</code> or <code>hp</code> if it already exists.</p>

      <h3>--evaluate</h3>

      <p>Evaluates JavaScript expressions in attribute values. <strong>GM only by default</strong>.</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --sel --evaluate --hp|2 * 3</code></pre>

      <p>This will set the <code>hp</code> attribute to 6.</p>

      <h3>--replace</h3>

      <p>Replaces special characters to prevent Roll20 from evaluating them:</p>
      <ul>
        <li>&amp;lt; becomes [</li>
        <li>&amp;gt; becomes ]</li>
        <li>~ becomes -</li>
        <li>; becomes ?</li>
        <li>` becomes @</li>
      </ul>

      <p>Also supports \lbrak, \rbrak, \n, \at, and \ques for [, ], newline, @, and ?.</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --sel --replace --notes|"Roll &amp;lt;&amp;lt;1d6&amp;gt;&amp;gt; to succeed"</code></pre>

      <p>This stores "Roll [[1d6]] to succeed" without evaluating the roll.</p>

      <h2 id="output-control-options">Output Control Options</h2>

      <p>These options control the feedback messages generated by the script:</p>

      <h3>--silent</h3>

      <p>Suppresses normal output messages (error messages will still appear).</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --sel --silent --stealth|20</code></pre>

      <h3>--mute</h3>

      <p>Suppresses all output messages, including errors.</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --sel --mute --nocreate --new_value|42</code></pre>

      <h3>--fb-public</h3>

      <p>Sends output publicly to the chat instead of whispering to the command sender.</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --sel --fb-public --hp|25|25 --status|"Healed"</code></pre>

      <h3>--fb-from &amp;lt;NAME&amp;gt;</h3>

      <p>Changes the name of the sender for output messages (default is "ChatSetAttr").</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --sel --fb-from "Healing Potion" --hp|25</code></pre>

      <h3>--fb-header &amp;lt;STRING&amp;gt;</h3>

      <p>Customizes the header of the output message.</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --sel --evaluate --fb-header "Combat Effects Applied" --status|"Poisoned" --hp|%hp%-5</code></pre>

      <h3>--fb-content &amp;lt;STRING&amp;gt;</h3>

      <p>Customizes the content of the output message.</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --sel --fb-content "Increasing Hitpoints" --hp|10</code></pre>

      <h3>Special Placeholders</h3>

      <p>For use in <code>--fb-header</code> and <code>--fb-content</code>:</p>

      <ul>
        <li><code>_NAMEJ_</code> - Name of the Jth attribute being changed</li>
        <li><code>_TCURJ_</code> - Target current value of the Jth attribute</li>
        <li><code>_TMAXJ_</code> - Target maximum value of the Jth attribute</li>
      </ul>

      <p>For use in <code>--fb-content</code> only:</p>

      <ul>
        <li><code>_CHARNAME_</code> - Name of the character</li>
        <li><code>_CURJ_</code> - Final current value of the Jth attribute</li>
        <li><code>_MAXJ_</code> - Final maximum value of the Jth attribute</li>
      </ul>

      <p><strong>Important:</strong> The Jth index starts with 0 at the first item.</p>

      <p><strong>Example:</strong></p>
      <pre><code>!setattr --sel --fb-header "Healing Effects" --fb-content "_CHARNAME_ healed by _CUR0_ hitpoints --hp|10</code></pre>

      <h2 id="inline-roll-integration">Inline Roll Integration</h2>

      <p>ChatSetAttr can be used within roll templates or combined with inline rolls:</p>

      <h3>Within Roll Templates</h3>

      <p>Place the command between roll template properties and end it with <code>!!!</code>:</p>

      <pre><code>&amp;&amp;lcub;template:default&amp;rcub; &amp;lcub;&amp;lcub;name=Fireball Damage&amp;rcub;&amp;rcub; !setattr --name @&amp;lcub;target|character_name&amp;rcub; --silent --hp|-&amp;lcub;&amp;lcub;damage=[[8d6]]&amp;rcub;&amp;rcub;!!! &amp;lcub;&amp;lcub;effect=Fire damage&amp;rcub;&amp;rcub;</code></pre>

      <h3>Using Inline Rolls in Values</h3>

      <p>Inline rolls can be used for attribute values:</p>

      <pre><code>!setattr --sel --hp|[[2d6+5]]</code></pre>

      <h3>Roll Queries</h3>

      <p>Roll queries can determine attribute values:</p>

      <pre><code>!setattr --sel --hp|?&amp;lcub;Set strength to what value?|100&amp;rcub;</code></pre>

      <h2 id="repeating-section-support">Repeating Section Support</h2>

      <p>ChatSetAttr supports working with repeating sections:</p>

      <h3>Creating New Repeating Items</h3>

      <p>Use <code>CREATE</code> to create a new row in a repeating section:</p>

      <pre><code>!setattr --sel --repeating_inventory_CREATE_itemname|"Magic Sword" --repeating_inventory_CREATE_itemweight|2</code></pre>

      <h3>Modifying Existing Repeating Items</h3>

      <p>Access by row ID:</p>

      <pre><code>!setattr --sel --repeating_inventory_ID_itemname|"Enchanted Magic Sword"</code></pre>

      <p>Access by index (starts at 0):</p>

      <pre><code>!setattr --sel --repeating_inventory_$0_itemname|"First Item"</code></pre>

      <h3>Deleting Repeating Rows</h3>

      <p>Delete by row ID:</p>

      <pre><code>!delattr --sel --repeating_inventory_ID</code></pre>

      <p>Delete by index:</p>

      <pre><code>!delattr --sel --repeating_inventory_$0</code></pre>

      <h2 id="special-value-expressions">Special Value Expressions</h2>

      <h3>Attribute References</h3>

      <p>Reference other attribute values using <code>%attribute_name%</code>:</p>

      <pre><code>!setattr --sel --evaluate --temp_hp|%hp% / 2</code></pre>

      <h3>Resetting to Maximum</h3>

      <p>Reset an attribute to its maximum value:</p>

      <pre><code>!setattr --sel --hp|%hp_max%</code></pre>

      <h2 id="global-configuration">Global Configuration</h2>

      <p>The script has four global configuration options that can be toggled with <code>!setattr-config</code>:</p>

      <h3>--players-can-modify</h3>

      <p>Allows players to modify attributes on characters they don't control.</p>

      <pre><code>!setattr-config --players-can-modify</code></pre>

      <h3>--players-can-evaluate</h3>

      <p>Allows players to use the <code>--evaluate</code> option.</p>

      <pre><code>!setattr-config --players-can-evaluate</code></pre>

      <h3>--players-can-target-party</h3>

      <p>Allows players to use the <code>--party</code> target option. <strong>GM only by default</strong>.</p>

      <pre><code>!setattr-config --players-can-target-party</code></pre>

      <h3>--use-workers</h3>

      <p>Toggles whether the script triggers sheet workers when setting attributes.</p>

      <pre><code>!setattr-config --use-workers</code></pre>

      <h2 id="complete-examples">Complete Examples</h2>

      <h3>Basic Combat Example</h3>

      <p>Reduce a character's HP and status after taking damage:</p>

      <pre><code>!modattr --sel --evaluate --hp|-15 --fb-header "Combat Result" --fb-content "_CHARNAME_ took 15 damage and has _CUR0_ HP remaining!"</code></pre>

      <h3>Leveling Up a Character</h3>

      <p>Update multiple stats when a character gains a level:</p>

      <pre><code>!setattr --sel --level|8 --hp|75|75 --attack_bonus|7 --fb-from "Level Up" --fb-header "Character Advanced" --fb-public</code></pre>

      <h3>Create New Item in Inventory</h3>

      <p>Add a new item to a character's inventory:</p>

      <pre><code>!setattr --sel --repeating_inventory_-CREATE_itemname|"Healing Potion" --repeating_inventory_-CREATE_itemcount|3 --repeating_inventory_-CREATE_itemweight|0.5 --repeating_inventory_-CREATE_itemcontent|"Restores 2d8+2 hit points when consumed"</code></pre>

      <h3>Apply Status Effects During Combat</h3>

      <p>Apply a debuff to selected enemies in the middle of combat:</p>

      <pre><code>&amp;&amp;lcub;template:default&amp;rcub; &amp;lcub;&amp;lcub;name=Web Spell&amp;rcub;&amp;rcub; &amp;lcub;&amp;lcub;effect=Slows movement&amp;rcub;&amp;rcub; !setattr --name @&amp;lcub;target|character_name&amp;rcub; --silent --speed|-15 --status|"Restrained"!!! &amp;lcub;&amp;lcub;duration=1d4 rounds&amp;rcub;&amp;rcub;</code></pre>

      <h3>Party Management Examples</h3>

      <p>Give inspiration to all party members after a great roleplay moment:</p>

      <pre><code>!setattr --party --inspiration|1 --fb-public --fb-header "Inspiration Awarded" --fb-content "All party members receive inspiration for excellent roleplay!"</code></pre>

      <p>Apply a long rest to only party characters among selected tokens:</p>

      <pre><code>!setattr --sel-party --hp|%hp_max% --spell_slots_reset|1 --fb-header "Long Rest Complete"</code></pre>

      <p>Set hostile status for non-party characters among selected tokens:</p>

      <pre><code>!setattr --sel-noparty --attitude|"Hostile" --fb-from "DM" --fb-content "Enemies are now hostile!"</code></pre>

      <h2 id="for-developers">For Developers</h2>

      <h3>Registering Observers</h3>

      <p>If you're developing your own scripts, you can register observer functions to react to attribute changes made by ChatSetAttr:</p>

      <pre><code>ChatSetAttr.registerObserver(event, observer);</code></pre>

      <p>Where <code>event</code> is one of:</p>
      <ul>
        <li><code>"add"</code> - Called when attributes are created</li>
        <li><code>"change"</code> - Called when attributes are modified</li>
        <li><code>"destroy"</code> - Called when attributes are deleted</li>
      </ul>

      <p>And <code>observer</code> is an event handler function similar to Roll20's built-in event handlers.</p>

      <p>This allows your scripts to react to changes made by ChatSetAttr the same way they would react to changes made directly by Roll20's interface.</p>
    </div>
  );
};
