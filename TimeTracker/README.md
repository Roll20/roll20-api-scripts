# TimeTracker.js

Script for virtual tabletop web application Roll20.net. Tracking ingame time and events like lamps, torches and long duration spells (Mage Armor).

## Help

<pre><code>!time -help</code></pre>
This command displays the help.

<pre><code>!time -setformat &lt;timeformat&gt;</code></pre>
Set the show time format.

This command requires 1 parameter:
* **&lt;timeformat&gt;** -- The numeric value of time format. **Parametr must be only 12 or 24**. Default value is **24**. Example **12**.

<pre><code>!time -set &lt;hours&gt;:&lt;minutes&gt;</code></pre>
Set the current time.

This command requires 2 parameters:
* **&lt;hours&gt;** -- The numeric value of hours. **Must be in 24-hours time format**. Example **10**.
* **&lt;minutes&gt;** -- The numeric value of minutes. Example **30**.

<pre><code>!time -plus &lt;hours&gt;:&lt;minutes&gt;</code></pre>
Add hours and minutes to current time. This ammount of time is even automatically deductive from events duration.

This command requires 2 parameters:
* **&lt;hours&gt;** -- The numeric value of how much hours add to current time. Example **1**.
* **&lt;minutes&gt;** -- The numeric value of how much minutes add to current time. Example **28**.

<pre><code>!time -show</code></pre>
This command displays the current time.

<pre><code>!time -addevent &lt;name&gt;:&lt;hours&gt;:&lt;minutes&gt;</code></pre>
Add a event to list and automatically track it&apos;s duration if is used **!time plus** command.

This command requires 3 parameters:
* **&lt;name&gt;** -- String of the event name. Example **PC&apos;s Mage Armor**.
* **&lt;hours&gt;** -- The numeric value of how much hours duration event have. Example **8**.
* **&lt;minutes&gt;** -- The numeric value of how much minutes duration event have. Example **0**.

<pre><code>!time -events</code></pre>
This command displays the active events and it&apos;s remaining duration.

## Macro Query dropdown

If you wanna do all commands from single macro button with dropdown select use the code from MacroQuery file.

## Macros

Time-Set
<pre><code>!time -set ?{hours|0}:?{minutes|0}</code></pre>

Time-Plus
<pre><code>!time -plus ?{hours|0}:?{minutes|0}</code></pre>

Time-AddEvent
<pre><code>!time -addevent ?{name}:?{hours|0}:?{minutes|0}</code></pre>

Time-Show
<pre><code>!time -show</code></pre>

Time-Events
<pre><code>!time -events</code></pre>