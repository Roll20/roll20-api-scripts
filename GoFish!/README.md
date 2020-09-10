<h1>GoFish!</h1>
<h4>by theTexasWave</h4>
<hr/>
<ul>
    <li>Name: Ben Kulka</li>
    <li>Roll20: <a href="https://app.roll20.net/users/3034675/thetexaswave">theTexasWave</a></li>
    <li>Github: <a href="https://github.com/btkulka">btkulka</a></li>
    <li>Email: thetexaswave@gmail.com</li>
    <li>Discord: theTexasWave#8979</li>
    <li>Patreon: <a href="https://www.patreon.com/thetexaswave">theTexasWave</a></li>
    <li>Venmo: @twave</li>
</ul>
<hr/>
<p><i>If you enjoyed the script, please feel free to send a small tip over to my Venmo :)</i></p>
<p><i>If you have any questions, comments, concerns, or would like to drop me a penny for my work (always appreciated!), you can reach me at theTexasWave@gmail.com or check out my <a href="https://www.patreon.com/thetexaswave">Patreon</a> where I am working on a myriad of coding projects.</i></p>
<hr/>
<h3>Description</h3>
<p><strong>GoFish!</strong> is a fully realized fishing mini-game for Roll20 that allows users to catch, collect, or sell a wide variety of fish all with a few API commands.</p>
<p>The library is set up in such a way that the <strong>Master Fish List</strong>, the fishing table names, the rarity of fishes, the value of fishes, the weight of fishes, and etc. is easily customizable. Any DM can quickly edit and manpulate these settings to expand upon the listings already provided.</p>
<p>All caught fish belong to a table (freshwater or saltwater), and from there their sizes are randomly generated. A player or the GM has the ability to cash in these fish at any time with the <strong>built in value system</strong>.</p>
<p>GoFish! is also shipped with the <strong>GoFish! Index</strong> which keeps track of a master fish list for the GM, and all discovered fish for the Party (as well as <strong>maintains a list of all-time-records</strong>).</p>
<hr/>
<h4>The gist</h4>
<p>
    A user must have a 'Dexterity' (or 'DEX' modifier), a 'RodDurability' attribute (with current and max), and a 'Fishing' attribute supplied to their character. This helps the system generate their 'Fishing Skill' which will drop better items for them on average. Select a character and enter one of the <b>!go-fish</b> commands to get rolling.
</p>
<p>
    As of v1.1.0, fishing now includes an <b>experience</b> system, where a character's fishing skill automatically increases over time based on the weight, size, and rarity of a fish caught.
    <br/>
    I've also added a <b>rod durability</b> system, which acts as a "stamina" system of sorts that keeps players from just abusing the system. Rod durability decreases with each fish and is determined by a random roll based on the size of the fish, and can be decreased with a higher fishing skill.
</p>
<hr/>
<h3>Usage</h3>
<h4>namespace</h4>
<h5><code>!go-fish</code></h5>
<p><strong>!go-fish</strong> is the official API command for GoFish!, and all interactions will begin with this keyword. Providing no additional arguments will print the usage.</p>
<h4>help/usage</h4>
<code>!go-fish help</code>
<p>This is the official way to print in-game usage, which will be printed directly to the chat feed. All API commands and instructions will be listed here. In lieu of 'help', you may also pass '-h' or '--help'.</p>
<h4>Solo fishing</h4>
<h5><code>!go-fish [water-source] [pool-type]</code></h5>
<p>
    Fishes for the first selected character. The most detailed display of fish are shown this way. A random fish of a random weight (in lbs) is caught from the given water-source and pool-type. A random amount of time passes (in minutes). The character's fishing rod's durability decreases by a random amount.
    <br/>
    A higher fishing skill:
    <ul>
        <li>Increases the value of the fish caught (through a drop lowest internal re-roll system)</li>
        <li>Decreases the amount of time spent fishing.</li>
        <li>Decreases the character's fishing rod durability decrease.</li>
    </ul>
    <br/>
    Parameters:
    <ul>
        <li> <strong> water-source (required) </strong> - the type of water that the character is fishing from. <em>saltwater | freshwater</em></li>
        <li> pool-type - the rarity pool that the fish are being generated from. <em>lesser (default) | common | greater</em>
    </ul>
</p>
<h4>Timed fishing tourney</h4>
<h5><code>!go-fish time [time] [water-source] [pool-type]</code></h5>
<p>
    Fishes for X minutes for all selected characters. As many fish are caught as possible within the time limit by each character, mutually exclusively. The fish caught are listed by the character who caught them. Fishing skill affects each character as described above. Each character's fishing rod will decrease more with each catch.
    <br/>
    Parameters:
    <ul>
        <li> <strong> time (required) </strong> - the amount of time in minutes, as a Number, the characters will fish (rounded) <em> ex: 60</em></li>
        <li> <strong> water-source (required) </strong> - the type of water that the character is fishing from. <em>saltwater | freshwater</em></li>
        <li> pool-type - the rarity pool that the fish are being generated from. <em>lesser (default) | common | greater</em>
    </ul>
</p>
<h4>Quantified fishing tourney</h4>
<h5><code>!go-fish amount [amount] [water-source] [pool-type]</code></h5>
<p>
    All characters fish until X amount of fish are caught. All fish caught count towards the amount, so oftentimes characters with higher fishing skills will catch many more fish than those with lower fishing skills. Fishing skill affects each character as described above. Each character's fishing rod will decrease more with each catch. The amount of time passed is the amount of time it took to reach the Xth fish.
    <br/>
    Parameters:
    <ul>
        <li> <strong> amount (required) </strong> - the amount of fish to be caught as a pure Number (rounded) <em> ex: 10</em></li>
        <li> <strong> water-source (required) </strong> - the type of water that the character is fishing from. <em>saltwater | freshwater</em></li>
        <li> pool-type - the rarity pool that the fish are being generated from. <em>lesser (default) | common | greater</em>
    </ul>
</p>
<h4>Value of fish</h4>
<h5><code>!go-fish valueof [fishname] [weight]</code></h5>
<p>
    Retrieves the profile of the given fish as well as what it is worth. If no weight is passed, its default value is provided. Otherwise, the value is calculated proportionately.
    <br/>
    Parameters:
    <ul>
        <li> <strong> fishname (required) </strong> - the name of the fish (case insensitive). If a space exists within the fish name, wrap the whole name in quotes <em> ex: "Giant Catfish"</em></li>
        <li> weight - the weight of the fish (in pounds). Up to two decimal places are used. <em>ex: 4.45</em>
    </ul>
</p>
<h4>Cashing out</h4>
<h5><code>!go-fish cashout [fishname] [weight]</code></h5>
<p>
    If a player does not want to carry around a bunch of specifically weighted fish, the player may cash the fish out for a lower value than they might get at a market. The value is calculated with the <i>CASH_OUT_PERCENTAGE</i> which can be configured, but is set to 40% of the actual value by default. If no weight is provided, the default value is used for the calculation.
    <br/>
    Parameters:
    <ul>
        <li> <strong> fishname (required) </strong> - the name of the fish (case insensitive). If a space exists within the fish name, wrap the whole name in quotes <em> ex: "Giant Catfish"</em></li>
        <li> weight - the weight of the fish (in pounds). Up to two decimal places are used. <em>ex: 4.45</em>
    </ul>
</p>
<h4>Resetting game</h4>
<h5><code>!go-fish reset</code></h5>
<p>
    <strong>(GM Only)</strong> Resets GoFish! to its default state. This resets all tables and all records kept in the GoFish! Index.
    <br/>
    <em>Note: If you wish to edit the fishing tables, edit them <strong>within</strong> the MASTER_FISH_LIST, as this is what decides the values within a table upon reset.</em>
    <br/>
    Parameters:
    <ul>
        <li> <strong> fishname (required) </strong> - the name of the fish (case insensitive). If a space exists within the fish name, wrap the whole name in quotes <em> ex: "Giant Catfish"</em></li>
        <li> weight - the weight of the fish (in pounds). Up to two decimal places are used. <em>ex: 4.45</em>
    </ul>
</p>