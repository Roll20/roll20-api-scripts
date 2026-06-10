// Script:   Chronicle
// By:       Keith Curtis
// Contact:  https://app.roll20.net/users/162065/keithcurtis

const Chronicle = (() => {
  'use strict';

  // ==================================================
  // Config
  // ==================================================

  const scriptName = 'Chronicle';
  const version = '1.0.2';
  //Changelog
  ///1.0.2 Added Interannual Day code to handle Traveller Imperial Calendar
  // 1.0.1 Added custom weather and Climate options, made some display changes including parsing of images and links in the display. Fixed firefox Display bug.
  // 1.0.0 Debut
  
  const lastUpdate = Math.floor(Date.now() / 1000);
  const schemaVersion = 0.1;

  const DEBUG = false;
  const LOGGING = false;

  const HANDOUT_PREFIX = 'Chronicle';
  const CHRONICLE_HELP_NAME = "Help: Chronicle";
  const CHRONICLE_HELP_AVATAR = "https://files.d20.io/images/470559564/QxDbBYEhr6jLMSpm0x42lg/original.png?1767857147";
  const CHRONICLE_HELP_TEXT = `
<div>

<h1>Chronicle Calendar System</h1>

<p>Chronicle is a comprehensive calendar system for managing custom calendars, tracking events and notes, generating weather, and organizing campaign time.</p>

<h2>Getting Started</h2>

<h3>Initial Setup</h3>
<p><strong>Command:</strong> <code>!chr</code></p>
<p>Run this command to initialize Chronicle. This creates the main interface handout and opens the Design mode where you can configure your calendar.</p>

<h3>Interface Modes</h3>
<ul>
<li><strong>Calendar Mode:</strong> Default mode showing the calendar grid, featured date details, and navigation controls.</li>
<li><strong>Design Mode:</strong> Configuration interface for setting up calendar structure, holidays, special days, moons, and weather.</li>
<li><strong>Timeline Mode:</strong> Chronological view of all events, notes, and holidays with filtering and tagging.</li>
</ul>

<h2>Calendar Configuration (Design Mode)</h2>

<h3>Basic Calendar Structure</h3>
<p>Click "Design" in the main interface to access configuration options.</p>

<h4>Calendar Name</h4>
<p>Chronicle ships with configuration for Gregorian, Harptos (the calendar used by the Forgotten Realms), Greyhawk, Eberron, Absalom Reckoning, and Traveller Imperial calendars. Choose one of these, or create you own bly clicking New Calendar, and then set the name for your calendar system (e.g., "Mystara", "Exandrian"). The resto of these design instructions will assume that you are creating your own custom calendar. Otherwise, that is all you need to do.</p>

<h4>Calendar Description</h4>
<p>Add context about your calendar system that appears in Design mode. This is useful for explaining the calendar's structure, cultural significance, or special properties to players. Preset calendars (Gregorian, Absalom Reckoning, Faerun, Greyhawk, Eberron, and Traveller Imperial) include detailed descriptions that you can edit or replace with your own text.</p>

<h4>Months</h4>
<p>Define each month with:</p>
<ul>
<li><strong>Name:</strong> Month name (e.g., "Hammer", "January")</li>
<li><strong>Days:</strong> Number of days in the month</li>
<li><strong>Order:</strong> Position in the year (automatically managed)</li>
</ul>
<p>Use the up/down arrows to reorder months. Delete unwanted months with the Delete button.</p>

<h4>Weeks</h4>
<p>Configure the weekly structure:</p>
<ul>
<li><strong>Days in Week:</strong> Number of days per week (typically 7)</li>
<li><strong>Weekday Names:</strong> Names for each day (e.g., "Monday", "Tuesday")</li>
</ul>

<h3>Holidays</h3>
<p>Add recurring or one-time holidays:</p>
<ul>
<li><strong>Name:</strong> Holiday name</li>
<li><strong>Month/Day:</strong> Date of occurrence</li>
<li><strong>Recurring:</strong> Whether it repeats annually</li>
<li><strong>Description:</strong> Optional details about the holiday</li>
</ul>
<p>Holidays appear in red text throughout the calendar. Click a holiday name to view its description privately (whisper) or announce it publicly to all players.</p>

<h3>Special Days</h3>
<p>Special days are intercalary days (like Midsummer) or leap days (like Shieldmeet) that fall outside the normal month/week structure. Some calendars also include interannual days—special days that fall at the beginning or end of the year (such as the Holiday in the Traveller Imperial Calendar) and don't follow the weekly cycle.</p>

<h4>Types</h4>
<ul>
<li><strong>Fixed Special Days:</strong> Occur every year at the same position</li>
<li><strong>Leap Special Days:</strong> Occur periodically (e.g., every 4 years)</li>
</ul>

<h4>Configuration</h4>
<ul>
<li><strong>Name:</strong> Special day name</li>
<li><strong>Position:</strong> After which month and day it occurs (e.g., "After Flamerule 30" for Midsummer)</li>
<li><strong>Week Behavior:</strong>
  <ul>
  <li><strong>Part of week:</strong> Counts as a regular weekday</li>
  <li><strong>Between weeks:</strong> Breaks the week cycle, appears as a separate row in the calendar grid</li>
  </ul>
</li>
<li><strong>Frequency (Leap only):</strong> How often it occurs (e.g., 4 = every 4 years)</li>
<li><strong>Offset (Leap only):</strong> Year offset for calculation (typically 0)</li>
<li><strong>Description:</strong> Optional details about the special day</li>
</ul>

<h3>Moons</h3>
<p>Add celestial bodies with lunar cycles that display on your calendar:</p>
<ul>
<li><strong>Name:</strong> Moon name (e.g., "Selûne")</li>
<li><strong>Period:</strong> Days per complete cycle (supports decimals)</li>
<li><strong>Full Moon Reference:</strong> A known date when the moon was full (used to calculate phases)</li>
<li><strong>Size:</strong> Display size multiplier (0.1 to 1.0, where 1.0 is full size)</li>
<li><strong>Color:</strong> Choose from 12 tint options: yellow, red, green, blue, cyan, orange, purple, tan, brown, white, gray, or dark</li>
<li><strong>Display:</strong> Toggle whether moon appears on calendar grid</li>
</ul>
<p><strong>Moon Phases:</strong> Phases are calculated automatically based on your reference date and display on the calendar grid in the Featured Date section. Each moon shows its correct phase (new, waxing, full, waning) for the selected date.</p>
<p><strong>Visibility:</strong> When multiple moons are visible, hover over any moon to see its name. Single-moon calendars have no tooltip to reduce clutter.</p>
<p><strong>Sprite System:</strong> Moons use a sprite sheet system ensuring compatibility with Roll20's handout system. The system handles all 8 lunar phases with full color support.</p>

<h3>Weather System</h3>
<p>Enable procedural weather generation based on climate zones, or create custom weather effects.</p>

<h4>Setup</h4>
<ol>
<li>Click "Set Climate" in Design mode</li>
<li>The script will guide you through a series of prompts to configure your climate settings, according to a simplified Köppen climate classification. </li>
<li>Select temperature units (Fahrenheit or Celsius)</li>
</ol>

<h4>Generating Weather</h4>
<p>Click "Generate Weather" in the Featured Date section to create weather for the current date. Generated weather persists and appears automatically when viewing that date.</p>

<h4>Custom Weather</h4>
<p>In addition to the climate-based weather generation, you can add custom weather effects to any date. Click the "Add Custom Weather" button in the Featured Date section to manually create weather entries such as storms, fog, earthquakes, or other non-standard atmospheric effects. You can add emojis to custom weather entries (such as 🌪️ for tornado, ⛏️ for earthquake, 🔥 for wildfire) to make them visually distinctive in the calendar and timeline.</p>

<h2>Calendar Mode</h2>

<h3>Date Navigation Controls</h3>
<ul>
<li><strong>◀◀◀:</strong> Previous year</li>
<li><strong>◀◀:</strong> Previous month</li>
<li><strong>◀:</strong> Previous day</li>
<li><strong>Year/Month/Day buttons:</strong> Jump to specific date via dropdown</li>
<li><strong>▶:</strong> Next day</li>
<li><strong>▶▶:</strong> Next month</li>
<li><strong>▶▶▶:</strong> Next year</li>
</ul>

<h3>Featured Date vs Today</h3>
<ul>
<li><strong>Featured Date:</strong> The date currently displayed and selected for viewing/editing</li>
<li><strong>Today:</strong> A saved bookmark representing the "current" campaign date</li>
<li><strong>Go to Today:</strong> Navigate to the Today bookmark</li>
<li><strong>Set Today:</strong> Save the current Featured Date as the new Today bookmark</li>
</ul>

<h3>Calendar Grid</h3>
<p>Click any date in the calendar grid to set it as the Featured Date. Dates show:</p>
<ul>
<li><strong>Day number</strong></li>
<li><strong>Holidays</strong> (in red text)</li>
<li><strong>Special days</strong> (full-width rows for "between weeks" types, or inline in red for "part of week" types)</li>
<li><strong>Events/notes</strong> (first 40 characters displayed)</li>
</ul>

<h2>Events and Notes</h2>

<h3>Adding Events/Notes</h3>
<p>In the Featured Date section, use the "Add Event" or "Add Note" buttons. Enter the content when prompted.</p>

<h3>Difference Between Events and Notes</h3>
<ul>
<li><strong>Events:</strong> Broad campaign events, usually with no specific date (war, plague, political upheaval)</li>
<li><strong>Notes:</strong> Specific campaign events that occur on a given day. (Player actions, party actions, npc actions)</li>
</ul>
<p>The distinction is organizational; both function identically and can be converted between types. In general, use Events for world historuical events, and Notes for campaign adventure tracking.</p>

<h3>Managing Events/Notes</h3>
<p>Each event/note has action buttons:</p>
<ul>
<li><strong>Edit:</strong> Modify the content</li>
<li><strong>Delete:</strong> Remove permanently</li>
<li><strong>↔:</strong> Convert between event and note</li>
<li><strong>Move:</strong> Relocate to a different date</li>
<li><strong>+Tag:</strong> Add organizational tags</li>
</ul>

<h3>Tags</h3>
<p>Tags are labels for organizing and filtering events/notes. Add multiple tags to categorize entries (e.g., "dungeon", "drow", "party", "Waterdeep").</p>

<p>Tags appear as clickable buttons in the timeline detailed view. Click a tag to remove it.</p>
<ul>
<li><strong>+Tag button:</strong> Opens a dropdown menu showing all existing tags in your campaign. Select a tag to instantly add it to that event/note. If no tags exist yet, you can type a new one.</li>
<li><strong>[Untagged] filter:</strong> In Timeline mode, click [Untagged] to filter and show only items without any tags, making it easy to find and tag uncategorized items.</li>
</ul>

<p><strong>Tag Filtering:</strong> In Timeline mode, click any tag in the tag cloud to filter by that tag. Use the tag mode buttons to switch between showing items with ANY of the selected tags (OR) or ALL of the selected tags (AND).</p>

<p>Currently, each note or event is also appeneded with the name of the person who made it. At this moment, Chronicle is purley for GM use, but some campaigns may have multiple GMs. In that case, this feature allows you to track which GM added which information.</p>

<h3>Send to Chat</h3>

<p>Click "Send to Chat" to broadcast the current Featured Date information to all players. This includes:</p>
<ul>
<li>Date and weekday</li>
<li>Moon phases</li>
<li>Weather (if generated)</li>
<li>Holidays and special days (clickable to announce descriptions)</li>
<li>Events and notes for that date</li>
</ul>

<h3>Links and Images in Events/Notes</h3>

<p>Events and notes support embedded links and images, allowing you to attach reference materials directly to your calendar entries. Links are automatically parsed and formatted based on type.</p>

<h4>How Links Display</h4>
<ul>
<li><strong>Calendar Grid:</strong> Links appear as clickable styled text or thumbnail images. Image links show as small previews of the image.</li>
<li><strong>Featured Date & Send to Chat:</strong> Links appear as clickable thumbnails or styled text buttons that open the link or command when clicked.</li>
</ul>

<h4>Supported Link Types</h4>

<p><strong>Image Links (Inline Images):</strong> Display as clickable image thumbnails that send the image to chat when clicked.</p>
<p style="margin-left: 20px; font-family: monospace;">Example: <code>[any text](https://example.com/image.png)</code></p>

<p><strong>Roll20 Handout Links:</strong> Open a specific campaign handout when clicked.</p>
<p style="margin-left: 20px; font-family: monospace;">Example: <code>[Open Lore](http://journal.roll20.net/handout/HANDOUT_ID)</code></p>

<p><strong>Roll20 Character Links:</strong> Open a character sheet when clicked.</p>
<p style="margin-left: 20px; font-family: monospace;">Example: <code>[Open Character](http://journal.roll20.net/character/CHARACTER_ID)</code></p>

<p><strong>API Commands:</strong> Execute a Roll20 API command when clicked (useful for triggering other scripts or macros).</p>
<p style="margin-left: 20px; font-family: monospace;">Example: <code>[Link Text](!API Command)</code></p>

<p>Note that link parsing is very simple, and not as robust as the Roll20 chat engine. Use with caution.</p>

<h2>Timeline Mode</h2>

<h3>Accessing Timeline</h3>
<p>Click "Timeline" in the main interface to view all events and notes chronologically.</p>

<h3>Timeline Features</h3>

<h4>Date Range Selection</h4>
<p>Set start and end dates to filter the timeline view. Year span determines detail level:</p>
<ul>
<li><strong>1 year or less:</strong> Day-by-day view with all details</li>
<li><strong>1-5 years:</strong> Month-by-month summary</li>
<li><strong>5+ years:</strong> Yearly summary</li>
</ul>
<p>By Default, events list at the beginning of the year they are in, and do not display a calendar date. Events are broad happenings. Notes are specific to a date, and display with their calendar date. You can also display events in ascending or descending chronological order.</p>

<h4>Type Filters</h4>
<ul>
<li><strong>Events:</strong> Toggle event visibility</li>
<li><strong>Notes:</strong> Toggle note visibility</li>
<li><strong>Holidays:</strong> Toggle holiday visibility (only shown for spans ≤1 year)</li>
<li><strong>Weather:</strong> Toggle weather visibility (only shown for spans ≤1 year)</li>
<li><strong>Tags:</strong> Filter by specific tags (same click behavior as main interface)</li>
<li><strong>Untagged:</strong> Show only items with no tags attached. Works independently or combined with tag filters.</li>
</ul>

<h4>Show/Hide Details</h4>
<p>Toggle this to display editing buttons and tag information for each entry. In detailed mode, each event and note displays:</p>
<ul>
<li><strong>Edit/Delete buttons:</strong> Modify or remove the item</li>
<li><strong>+Tag button:</strong> Select from existing tags to add to this item</li>
<li><strong>Tags:</strong> Clickable tags showing which categories apply</li>
<li><strong>Elapsed Time:</strong> Time span from the currently viewing date to this item's date, in shorthand format (e.g., "2y.3m.15d", "-1m.2d")</li>
</ul>

<h4>Elapsed Time Display</h4>
<p>Small buttons floating right on each item show time elapsed from your current viewing date:</p>
<ul>
<li><strong>Format:</strong> #y.#m.#d (e.g., "5y", "2y.3m.15d", "-18d")</li>
<li><strong>Smart Display:</strong> Years only shown if span > 1 year, months only if span > 1 month</li>
<li><strong>Negative Values:</strong> Minus sign indicates items before the viewing date</li>
<li><strong>First of Year:</strong> Events on the first day of the year show only years (no months/days)</li>
<li><strong>Clicking the button:</strong> Sets the viewing date to that item without switching modes, useful for exploring time relationships</li>
</ul>

<h4>Tag Mode</h4>
<ul>
<li><strong>Any (OR):</strong> Includes any item with any of the selected tags.</li>
<li><strong>All (AND):</strong> Includes only items with all of the selected tags.</li>
</ul>

<h4>Tags</h4>
<p>Shows a tag cloud of all existing tags. Click tags to filter, or click [Untagged] to show items without tags.</p>

<h4>Date Navigation</h4>
<p>Clicking on a date in the timeline automatically switches to Calendar mode and displays that date. This lets you jump between timeline and calendar views easily.</p>



<h2>Tips and Best Practices</h2>

<h3>Calendar Design</h3>
<ul>
<li>Start with basic structure (months, weeks) before adding holidays and special days</li>
<li>Test special days by navigating to their dates to ensure they appear correctly</li>
</ul>

<h3>Event/Note Organization</h3>
<ul>
<li>Develop a consistent tagging system early (e.g., "bruenor", "waterdeep", "adventure")</li>
<li>Use notes for tracking campaign events ("PCs Enter Lankhmar", "Frodo contract Mummy Rot")</li>
<li>Use events for historical events (battles, treaties, cataclysms)</li>
</ul>

<h3>Weather</h3>
<ul>
<li>Generate weather as needed rather than pre-generating for long periods</li>
<li>Weather persists once generated, so you can reference it later</li>
<li>Choose climate settings that match your campaign setting, and the generated weather should be believable</li>
</ul>

<h3>Timeline Usage</h3>
<ul>
<li>Use Timeline mode for campaign review and planning</li>
<li>Filter by tags to track specific storylines or NPCs</li>
<li>Start a session day by using "Send to Chat" feature for all players. This will inform them of date, weather, and holidays, if any, as well as show them where they are within the week.</li>
</ul>

<h2>Commands Reference</h2>

<p><strong>!chr</strong> - Initialize/open Chronicle interface</p>
<p>All other functions are accessed through the interactive interface buttons rather than direct commands.</p>

<h2>Data Storage</h2>

<p>Chronicle stores all data in Roll20 handouts:</p>
<ul>
<li><strong>Chronicle: [Campaign Name]</strong> - Calendar configuration (months, weeks, holidays, special days, moons, climate)</li>
<li><strong>Chronicle Events: [Campaign Name]</strong> - Events, notes, and weather data</li>
<li><strong>Chronicle Interface</strong> - Main interface handout</li>
<li><strong>Help: Chronicle</strong> - This help documentation</li>
</ul>

<p>These handouts are automatically created and updated. Do not manually edit their GM Notes section, as this may corrupt your calendar data.</p>

</div>
  `;

  const INTERFACE_HANDOUT_NAME = 'Chronicle';

  // ==================================================
  // CSS (Centralized Styles)
  // ==================================================

  const cssDark = {
    button: 'display: inline-block; padding: 4px 8px; margin: 2px; background: #5a9fd4; color: #111111; border: 1px solid #555555; border-radius: 3px; font-weight:bold; text-decoration: none; cursor: pointer; font-size: 11px;',
    buttonSmall: 'display: inline-block; padding: 2px 5px; margin: 1px; background: #5a9fd4; color: #111111; border: 1px solid #555555; border-radius: 2px; font-weight:bold; text-decoration: none; cursor: pointer; font-size: 9px;',
    creator: 'display: inline-block; padding: 2px 6px; margin: 0 3px; background: #3a3a3a; color: #aaaaaa; border-radius: 20px; font-size: 9px; font-weight: bold;',
    tagButton: 'display: inline-block; padding: 2px 5px; margin: 0 1px; background: #2a2a2a; color: #cccccc; border-radius: 20px; text-decoration: none; cursor: pointer; font-size: 9px;font-weight: bold;',
    tag: 'display: inline-block; padding: 2px 5px; margin: 0 2px; background: #2d2d2d; color: #bbbbbb; border-radius: 20px; text-decoration: none; cursor: pointer; font-size: 9px;font-weight: bold;',
    holiday: 'color: #dd5555; font-weight: bold;',
    container: 'background: #1a1a1a; color: #eeeeee; padding: 10px; border: 1px solid #555555; border-radius: 5px; font-family: "Helvetica Neue", Arial, sans-serif; margin: -30px;',
    chatOutput: 'background: #4a4a4a; color: #eeeeee; padding: 8px 12px; border-left: 6px solid #6b8cae; border-top: 1px solid #6b8cae; border-right: 1px solid #6b8cae; border-bottom: 1px solid #6b8cae; border-radius: 3px; font-family: "Helvetica Neue", Arial, sans-serif; font-size: 13px; margin: 2px 0;',
    header: 'background: #2d2d2d; color: #eeeeee; padding: 10px; margin: -10px -10px 10px -10px; border-bottom: 2px solid #555555; font-weight: bold; font-size: 16px;',
    table: 'width: 100%; border-collapse: collapse; margin: 10px 0;',
    tableCell: 'border: 1px solid #555555; padding: 5px; text-align: center; color: #eeeeee; vertical-align: top;',
    calendarDay: 'width: 14.28%; min-height: 60px; vertical-align: top; border: 1px solid #555555; padding: 2px; position: relative; cursor: pointer; background: #2d2d2d; color: #eeeeee;',
    calendarDayOtherMonth: 'width: 14.28%; min-height: 60px; vertical-align: top; border: 1px solid #555555; padding: 2px; position: relative; opacity: 0.5; cursor: pointer; background: #2d2d2d; color: #eeeeee;',
    calendarDayToday: 'width: 14.28%; min-height: 60px; vertical-align: top; border: 3px solid #5a9fd4; padding: 2px; position: relative; background: #3a3a3a; cursor: pointer; font-weight: bold; color: #eeeeee;',
    emojiCircle: 'background: #1a1a1a; border: 1px solid #555; border-radius: 50%; max-width: 32px; max-height: 32px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 1px; float: right; line-height: 1;',
    link: 'color: #5a9fd4; text-decoration: none;'
  };

  const lightModeOverrides = {
    button: { background: '#4a7ac2', color: '#eeeeee', border: '1px solid #999999' },
    buttonSmall: { background: '#4a7ac2', color: '#eeeeee', border: '1px solid #999999' },
    creator: { background: '#e0e0e0', color: '#222222'},
    tagButton: { background: '#cccccc', color: '#333333'},
    tag: { background: '#cccccc', color: '#777777'},
    holiday: { color: '#cc3333' },
    container: { background: '#eeeeee', color: '#111111', border: '1px solid #cccccc' },
    chatOutput: { background: '#dddddd', color: '#111111', 'border-left': '6px solid #4a7ac2', 'border-top': '1px solid #4a7ac2', 'border-right': '1px solid #4a7ac2', 'border-bottom': '1px solid #4a7ac2' },
    header: { background: '#f5f5f5', color: '#111111', border: '2px solid #cccccc' },
    tableCell: { border: '1px solid #cccccc', color: '#111111' },
    calendarDay: { background: '#eeeeee', color: '#111111', border: '1px solid #cccccc' },
    calendarDayOtherMonth: { background: '#eeeeee', color: '#111111', border: '1px solid #cccccc' },
    calendarDayToday: { background: '#d8d8d8', color: '#111111', border: '3px solid #4a7ac2' },
    emojiCircle: { background: '#333333', border: '1px solid #999' },
    link: { color: '#2a5a9a' }
  };

  const fantasyModeOverrides = {
    button: { background: '#8b4513', color: '#f4e8d0', border: '1px solid #5a3820' },
    buttonSmall: { background: '#8b4513', color: '#f4e8d0', border: '1px solid #5a3820' },
    creator: { background: '#d4c0a0', color: '#5a3820' },
    tagButton: { background: '#c4b090', color: '#6b4820' },
    tag: { background: '#cbb8a0', color: '#7b5830' },
    holiday: { color: '#cc4444' },
    container: { background: '#f4e8d0', color: '#2c1810', border: '1px solid #8b6f47' },
    chatOutput: { background: '#e8d4b0', color: '#2c1810', 'border-left': '6px solid #8b4513', 'border-top': '1px solid #8b4513', 'border-right': '1px solid #8b4513', 'border-bottom': '1px solid #8b4513' },
    header: { background: '#e8d4b0', color: '#2c1810', border: '2px solid #8b6f47' },
    tableCell: { border: '1px solid #8b6f47', color: '#2c1810' },
    calendarDay: { background: '#f4e8d0', color: '#2c1810', border: '1px solid #8b6f47' },
    calendarDayOtherMonth: { background: '#f4e8d0', color: '#2c1810', border: '1px solid #8b6f47' },
    calendarDayToday: { background: '#d4c0a0', color: '#2c1810', border: '3px solid #8b4513' },
    emojiCircle: { background: '#5a3820', border: '1px solid #8b6f47' },
    link: { color: '#6b3410' }
  };

  const generateThemedCSS = (baseCSS, overrides) => {
    const result = {};

    const replaceColors = (styleStr, override) => {
      if (!override) return styleStr;

      const props = styleStr.split(';').map(p => p.trim()).filter(Boolean);
      const mapped = {};

      props.forEach(p => {
        const [key, value] = p.split(':').map(s => s.trim());
        mapped[key] = value;
      });

      if (override.color) mapped.color = override.color;
      if (override.background) mapped.background = override.background;
      if (override.border) {
        const sides = ['border', 'border-top', 'border-right', 'border-bottom', 'border-left'];
        const borderKey = sides.find(k => Object.keys(mapped).includes(k)) || 'border';
        mapped[borderKey] = override.border;
      }
      
      // Handle individual border properties (kebab-case)
      if (override['border-left']) mapped['border-left'] = override['border-left'];
      if (override['border-top']) mapped['border-top'] = override['border-top'];
      if (override['border-right']) mapped['border-right'] = override['border-right'];
      if (override['border-bottom']) mapped['border-bottom'] = override['border-bottom'];

      return Object.entries(mapped).map(([k, v]) => `${k}:${v}`).join('; ') + ';';
    };

    for (const key in baseCSS) {
      const override = overrides[key];
      result[key] = replaceColors(baseCSS[key], override);
    }

    return result;
  };

  const cssLight = generateThemedCSS(cssDark, lightModeOverrides);
  const cssFantasy = generateThemedCSS(cssDark, fantasyModeOverrides);

  const getCSS = () => {
    const theme = State.config().theme;
    if (theme === 'light') return cssLight;
    if (theme === 'fantasy') return cssFantasy;
    return cssDark;
  };

  // Legacy reference for backward compatibility
  const CSS = cssDark;

  // ==================================================
  // Utilities
  // ==================================================

  const Utils = {

    stripGM: (who) => {
      // Remove " (GM)" suffix if present
      return who.replace(/ \(GM\)$/, '');
    },

    parseTags: (tagString) => {
      if (!tagString || tagString.trim() === '') return [];
      return tagString.split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);
    }

  };

  // ==================================================
  // Logger
  // ==================================================

  const Logger = {
    log: (msg) => {
      if (LOGGING) log(`${scriptName} | ${msg}`);
    },
    debug: (msg) => {
      if (DEBUG) log(`${scriptName} [DEBUG] | ${msg}`);
    },
    error: (msg) => log(`${scriptName} [ERROR] | ${msg}`)
  };

  // ==================================================
  // Markdown Parser
  // ==================================================

  const MarkdownParser = {
    
    // Parse markdown [text](url) patterns
    parse: (text) => {
      if (!text) return [];
      
      const elements = [];
      const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        const linkText = match[1];
        const url = match[2];
        const isImage = MarkdownParser.isImageUrl(url);
        
        elements.push({
          type: isImage ? 'image' : 'link',
          text: linkText,
          url: url,
          full: match[0],
          isImage: isImage
        });
      }
      
      return elements;
    },
    
    // Check if URL is an image based on extension
    isImageUrl: (url) => {
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'];
      const lowerUrl = url.toLowerCase();
      return imageExtensions.some(ext => lowerUrl.endsWith(ext));
    },
    
    // Get text with markdown elements removed (for alt text display)
    stripMarkdown: (text) => {
      if (!text) return text;
      return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
    },
    
    // Render markdown elements as HTML for display
    renderAsHtml: (text, calendar, options = {}) => {
      if (!text) return '';
      
      const elements = MarkdownParser.parse(text);
      if (elements.length === 0) return text; // No markdown, return as-is
      
      let html = '';
      let lastIndex = 0;
      
      // Get CSS styles
      const CSS_CURRENT = getCSS();
      
      // Get holiday link styling with Roll20 button style overrides
      const holidayStyle = CSS_CURRENT.holiday + ' text-decoration: underline; cursor: pointer; background: none; border: none; padding: 0; margin: 0;';
      
      // Sort elements by position in text
      const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      const matches = [];
      
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          linkText: match[1],
          url: match[2]
        });
      }
      
      matches.forEach(m => {
        // Add text before this element
        if (lastIndex < m.start) {
          html += text.substring(lastIndex, m.start);
        }
        
        const isImage = MarkdownParser.isImageUrl(m.url);
        
        if (isImage) {
          // Render image link
          if (options.featured || options.sendToChat) {
            // In featured date or send to chat, make image thumbnail clickable to whisper
            const imgSize = options.sendToChat ? '24px' : '20px';
            html += `<a style="${holidayStyle}" href="!chr --imagewhisper ${encodeURIComponent(m.url)}" title="${m.linkText}"><img src="${m.url}" style="max-height: ${imgSize}; max-width: ${imgSize}; width: auto; height: auto; margin: 0 3px; vertical-align: middle; display: inline-block; border: none; padding: 0;"></a>`;
          } else {
            // In calendar grid, show very small inline thumbnail
            html += `<img src="${m.url}" style="max-height: 12px; max-width: 12px; width: auto; height: auto; margin: 0 1px; vertical-align: middle; display: inline-block; border: none; padding: 0;" alt="${m.linkText}" title="${m.linkText}">`;
          }
        } else {
          // Render text link
          if (options.featured || options.sendToChat) {
            // In featured date or send to chat, use clickable anchor
            html += `<a style="${holidayStyle}" href="${m.url}">${m.linkText}</a>`;
          } else {
            // In calendar grid, use span to avoid nested anchor tags (cell itself is clickable)
            html += `<span style="${holidayStyle}">${m.linkText}</span>`;
          }
        }
        
        lastIndex = m.end;
      });
      
      // Add remaining text
      if (lastIndex < text.length) {
        html += text.substring(lastIndex);
      }
      
      return html;
    }
  };

  // ==================================================
  // Data Models
  // ==================================================

  const DataModels = {

    // Calendar structure
    createCalendar: (name = 'New Calendar') => ({
      name: name,
      description: '', // Description of the calendar system
      daysInYear: 365,
      months: [],
      interMonthDays: [], // Special days between months
      interannualDays: [], // Days outside the year cycle (beginning/end of year)
      weeks: {
        enabled: true,
        daysInWeek: 7,
        weekdayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        weekNames: [], // Optional week names
        displayWeekNames: false,
        canSpanMonths: true
      },
      leapYears: {
        enabled: false,
        cycle: 4, // Every N years
        exceptions: [] // Years that don't follow the pattern
      },
      seasons: {
        vernalEquinox: 1, // Day of year
        // Other points calculated at even intervals
      },
      holidays: [], // Recurring holidays tied to specific dates
      climate: null, // Current climate settings
      units: 'us' // 'us' or 'metric'
    }),

    createMonth: (name, days, order) => ({
      name: name,
      days: days,
      order: order // Position in year (0-indexed)
    }),

    createInterMonthDay: (name, position, breaksWeekCycle, dayType, frequency, offset, description) => ({
      id: `special_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      position: position, // {afterMonth: X, afterDay: Y} - position in calendar
      breaksWeekCycle: breaksWeekCycle, // true = between weeks, false = part of week
      dayType: dayType || 'fixed', // 'fixed' or 'leap'
      frequency: frequency || null, // for leap days (e.g., 4 = every 4 years)
      offset: offset || 0, // for leap days (year % frequency === offset)
      description: description || ''
    }),

    createInterannualDay: (name, position = 'beginning', order = 0) => ({
      id: `interannual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      position: position, // 'beginning' or 'end'
      order: order // For ordering multiple interannual days at same position
    }),

    createMoon: (name, period, fullDayRef, size = 1, color = 'yellow', display = true) => ({
      id: `moon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      period: period, // Days per cycle (supports decimals)
      fullDayRef: fullDayRef, // {year, month, day} when this moon was full
      size: size, // Display size 0.1-1 (default 1)
      color: color, // Illuminated portion color (default '#f7d79c')
      display: display // Whether to show on calendar grid (default true)
    }),

    createHoliday: (name, dateRef, recurring, description) => ({
      id: `holiday_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      dateRef: dateRef, // {month, day} or {month, week, weekday} for relative dates
      recurring: recurring, // true for annual
      type: 'absolute', // or 'relative'
      description: description || ''
    }),

    createSpecialDay: (name, position, dayType, weekBehavior, frequency, offset, description) => ({
      id: `special_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      position: position, // {afterMonth: X, afterDay: Y} - occurs after this date
      dayType: dayType, // 'fixed' or 'leap'
      weekBehavior: weekBehavior, // 'partOfWeek' or 'betweenWeeks'
      frequency: frequency || null, // for leap days (e.g., 4 for every 4 years)
      offset: offset || 0, // for leap days (year offset)
      description: description || ''
    }),

    createEvent: (content, dateRef, tags, createdBy) => ({
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'event',
      content: content,
      dateRef: dateRef, // {year, month, day} or {year, month} or {year}
      tags: tags || [],
      createdBy: createdBy,
      createdAt: Date.now()
    }),

    createNote: (content, dateRef, tags, createdBy) => ({
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'note',
      content: content,
      dateRef: dateRef, // {year, month, day} or {year, month} or {year}
      tags: tags || [],
      createdBy: createdBy,
      createdAt: Date.now()
    }),

    createWeather: (dateRef, climate, temp, precipitation, wind, description) => ({
      id: `weather_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dateRef: dateRef, // {year, month, day}
      climate: climate,
      temperature: temp, // {value, unit}
      precipitation: precipitation,
      wind: wind,
      description: description
    }),

    createParty: (name, members) => ({
      id: `party_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      members: members || [] // Array of character IDs
    }),

    createClimate: (inputs) => ({
      latitude_band: inputs.latitude_band,
      ocean_proximity: inputs.ocean_proximity,
      coast_type: inputs.coast_type,
      elevation: inputs.elevation,
      rainshadow: inputs.rainshadow,
      koppen_code: null,
      climate_name: null,
      temperature_profile: null,
      precipitation_profile: null,
      biome_hint: null
    })

  };

  // ==================================================
  // Climate Classification System
  // ==================================================

  const ClimateClassifier = {

    classify: (inputs) => {
      const climate = DataModels.createClimate(inputs);

      // Step 1: Determine base climate group
      let baseGroup = ClimateClassifier._getBaseGroup(inputs);

      // Step 2: Check for arid override
      const aridCheck = ClimateClassifier._checkArid(inputs);
      if (aridCheck) {
        climate.koppen_code = aridCheck;
        ClimateClassifier._populateDescriptions(climate);
        return climate;
      }

      // Step 3: Determine precipitation pattern
      const precipPattern = ClimateClassifier._getPrecipPattern(inputs, baseGroup);

      // Step 4: Determine temperature subtype
      const tempSubtype = ClimateClassifier._getTempSubtype(inputs, baseGroup);

      // Assemble final code
      climate.koppen_code = baseGroup + precipPattern + tempSubtype;

      // Generate descriptions
      ClimateClassifier._populateDescriptions(climate);

      return climate;
    },

    _getBaseGroup: (inputs) => {
      let group;

      switch (inputs.latitude_band) {
        case 'tropical': group = 'A'; break;
        case 'subtropical': group = 'C'; break;
        case 'temperate': group = 'C'; break;
        case 'subarctic': group = 'D'; break;
        case 'polar': group = 'E'; break;
        default: group = 'C';
      }

      // Override: continental temperate becomes subarctic
      if (inputs.ocean_proximity === 'continental' && inputs.latitude_band === 'temperate') {
        group = 'D';
      }

      // Override: alpine elevation shifts colder
      if (inputs.elevation === 'alpine') {
        if (group === 'C') group = 'D';
        else if (group === 'D') group = 'E';
      }

      return group;
    },

    _checkArid: (inputs) => {
      // Set to "B" if arid conditions met
      if (inputs.rainshadow === 'leeward' && inputs.ocean_proximity !== 'coastal') {
        // Arid
        if (inputs.latitude_band === 'tropical' || inputs.latitude_band === 'subtropical') {
          return 'BWh'; // Hot desert
        } else {
          return 'BWk'; // Cold desert
        }
      }

      if (inputs.ocean_proximity === 'continental' && 
          (inputs.latitude_band === 'subtropical' || inputs.latitude_band === 'temperate')) {
        // Check for steppe mitigation
        if (inputs.ocean_proximity === 'near_coastal' || inputs.rainshadow === 'windward') {
          return 'BSk'; // Steppe
        } else {
          return 'BWk'; // Cold desert
        }
      }

      return null; // Not arid
    },

    _getPrecipPattern: (inputs, baseGroup) => {
      if (baseGroup === 'E' || baseGroup === 'B') return '';

      // West coast + subtropical/temperate = dry summer
      if (inputs.coast_type === 'west' && 
          (inputs.latitude_band === 'subtropical' || inputs.latitude_band === 'temperate')) {
        return 's';
      }

      // East coast + subtropical = dry winter (monsoonal)
      if (inputs.coast_type === 'east' && inputs.latitude_band === 'subtropical') {
        return 'w';
      }

      // Windward = no dry season
      if (inputs.rainshadow === 'windward') {
        return 'f';
      }

      // Default to no dry season
      return 'f';
    },

    _getTempSubtype: (inputs, baseGroup) => {
      if (baseGroup !== 'C' && baseGroup !== 'D') return '';

      switch (inputs.latitude_band) {
        case 'tropical':
        case 'subtropical':
          return 'a'; // Hot summer
        case 'temperate':
          return 'b'; // Warm summer
        case 'subarctic':
          return 'c'; // Cool summer
        default:
          return 'b';
      }
    },

    _populateDescriptions: (climate) => {
      const descriptions = {
        'Af': {
          name: 'Tropical Rainforest',
          temp: 'Hot and humid year-round',
          precip: 'Heavy rainfall in all seasons',
          biome: 'Dense jungle, diverse wildlife'
        },
        'Aw': {
          name: 'Tropical Savanna',
          temp: 'Hot year-round',
          precip: 'Distinct wet and dry seasons',
          biome: 'Grasslands with scattered trees'
        },
        'BWh': {
          name: 'Hot Desert',
          temp: 'Extremely hot days, cool nights',
          precip: 'Minimal rainfall',
          biome: 'Sparse vegetation, dunes, arid plains'
        },
        'BWk': {
          name: 'Cold Desert',
          temp: 'Hot summers, cold winters',
          precip: 'Very low precipitation',
          biome: 'Rocky terrain, hardy shrubs'
        },
        'BSk': {
          name: 'Cold Steppe',
          temp: 'Warm summers, cold winters',
          precip: 'Low to moderate precipitation',
          biome: 'Short grasslands, sparse vegetation'
        },
        'BSh': {
          name: 'Hot Steppe',
          temp: 'Hot summers, mild winters',
          precip: 'Low precipitation',
          biome: 'Semi-arid grasslands'
        },
        'Csa': {
          name: 'Mediterranean',
          temp: 'Hot dry summers, mild wet winters',
          precip: 'Summer drought, winter rain',
          biome: 'Scrubland, drought-resistant trees'
        },
        'Csb': {
          name: 'Warm Mediterranean',
          temp: 'Warm dry summers, mild wet winters',
          precip: 'Summer drought, winter rain',
          biome: 'Mixed forest, chaparral'
        },
        'Cfa': {
          name: 'Humid Subtropical',
          temp: 'Hot summers, mild winters',
          precip: 'High humidity, frequent storms',
          biome: 'Mixed forests, broadleaf vegetation'
        },
        'Cfb': {
          name: 'Marine West Coast',
          temp: 'Mild temperatures year-round',
          precip: 'Frequent rainfall in all seasons',
          biome: 'Temperate rainforest, dense evergreen vegetation'
        },
        'Cfc': {
          name: 'Subpolar Oceanic',
          temp: 'Cool summers, mild winters',
          precip: 'Consistent rainfall',
          biome: 'Coniferous forest, mosses'
        },
        'Dfa': {
          name: 'Hot-Summer Humid Continental',
          temp: 'Hot summers, cold snowy winters',
          precip: 'Moderate precipitation year-round',
          biome: 'Deciduous and mixed forests'
        },
        'Dfb': {
          name: 'Warm-Summer Humid Continental',
          temp: 'Warm summers, cold winters',
          precip: 'Moderate precipitation year-round',
          biome: 'Deciduous forests, seasonal variation'
        },
        'Dfc': {
          name: 'Subarctic',
          temp: 'Cool summers, very cold winters',
          precip: 'Low to moderate precipitation',
          biome: 'Boreal forest, taiga'
        },
        'Dfd': {
          name: 'Extreme Subarctic',
          temp: 'Cool summers, extremely cold winters',
          precip: 'Low precipitation',
          biome: 'Sparse boreal forest'
        },
        'ET': {
          name: 'Tundra',
          temp: 'Cold year-round',
          precip: 'Low precipitation',
          biome: 'Permafrost, mosses, lichens'
        },
        'EF': {
          name: 'Ice Cap',
          temp: 'Extremely cold year-round',
          precip: 'Minimal precipitation',
          biome: 'Permanent ice and snow'
        }
      };

      // Handle polar special case
      if (climate.koppen_code.startsWith('E')) {
        if (climate.elevation === 'alpine') {
          climate.koppen_code = 'EF';
        } else {
          climate.koppen_code = 'ET';
        }
      }

      const desc = descriptions[climate.koppen_code] || descriptions['Cfb'];
      climate.climate_name = desc.name;
      climate.temperature_profile = desc.temp;
      climate.precipitation_profile = desc.precip;
      climate.biome_hint = desc.biome;
    }

  };

  // ==================================================
  // State Management
  // ==================================================

  const State = {

    initialize: () => {
      if (!state[scriptName] || state[scriptName].version !== schemaVersion) {

        Logger.log(`Initializing Schema v${schemaVersion}`);

        state[scriptName] = {
          version: schemaVersion,
          config: {
            currentCalendar: null, // Name of active calendar handout
            currentEvents: null, // Name of active events handout
            currentDate: { year: 1, month: 1, day: 1 },
            featuredDate: { year: 1, month: 1, day: 1 }, // Saved "current campaign date"
            displayMode: 'calendar', // 'calendar', 'design', 'timeline'
            theme: 'light', // 'light', 'dark', 'fantasy'
            viewingDate: { year: 1, month: 1 }, // Month being viewed
            verboseCalendar: false // Show full notes/events in calendar cells vs just indicators
          }
        };
      }
    },

    get: () => state[scriptName],
    config: () => state[scriptName].config,

    setConfig: (key, value) => {
      state[scriptName].config[key] = value;
    }
  };

  // ==================================================
  // Default Calendars
  // ==================================================

  const DefaultCalendars = {

    gregorian: () => {
      const cal = DataModels.createCalendar('Gregorian');
      cal.description = 'The modern Gregorian Calendar is the internationally dominant civil calendar used across most of Earth. It is a solar calendar consisting of 365 days divided into twelve uneven months and organized into a repeating seven-day week. To maintain alignment with the Earth\'s orbit and seasonal cycle, a leap day is added every four years, except in certain century years not evenly divisible by 400. It is used globally for civil administration, commerce, science, and international coordination, though many cultures also maintain traditional or religious calendars alongside it. Earth has a single large moon. The math for the Gregorian has been simplified here for game use. If you want historical accuracy, consult an almanac.';
      cal.daysInYear = 365;
      cal.months = [
        DataModels.createMonth('January', 31, 0),
        DataModels.createMonth('February', 28, 1),
        DataModels.createMonth('March', 31, 2),
        DataModels.createMonth('April', 30, 3),
        DataModels.createMonth('May', 31, 4),
        DataModels.createMonth('June', 30, 5),
        DataModels.createMonth('July', 31, 6),
        DataModels.createMonth('August', 31, 7),
        DataModels.createMonth('September', 30, 8),
        DataModels.createMonth('October', 31, 9),
        DataModels.createMonth('November', 30, 10),
        DataModels.createMonth('December', 31, 11)
      ];
      cal.weeks = {
        enabled: true,
        daysInWeek: 7,
        weekdayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        weekNames: [],
        displayWeekNames: false,
        canSpanMonths: true
      };
      cal.leapYears = {
        enabled: true,
        cycle: 4,
        exceptions: []
      };
      cal.seasons = {
        vernalEquinox: 80
      };
      cal.holidays = [
        DataModels.createHoliday('New Year\'s Day', { month: 1, day: 1 }, true),
        DataModels.createHoliday('Martin Luther King Jr. Day', { month: 1, day: 15 }, true),
        DataModels.createHoliday('Valentine\'s Day', { month: 2, day: 14 }, true),
        DataModels.createHoliday('St. Patrick\'s Day', { month: 3, day: 17 }, true),
        DataModels.createHoliday('Passover (Pesach)', { month: 4, day: 8 }, true),
        DataModels.createHoliday('Earth Day', { month: 4, day: 22 }, true),
        DataModels.createHoliday('Mother\'s Day', { month: 5, day: 12 }, true),
        DataModels.createHoliday('Shavuot', { month: 5, day: 26 }, true),
        DataModels.createHoliday('Memorial Day', { month: 5, day: 26 }, true),
        DataModels.createHoliday('Father\'s Day', { month: 6, day: 16 }, true),
        DataModels.createHoliday('Independence Day', { month: 7, day: 4 }, true),
        DataModels.createHoliday('Labor Day', { month: 9, day: 3 }, true),
        DataModels.createHoliday('Rosh Hashanah', { month: 9, day: 23 }, true),
        DataModels.createHoliday('Yom Kippur', { month: 10, day: 2 }, true),
        DataModels.createHoliday('Sukkot', { month: 9, day: 30 }, true),
        DataModels.createHoliday('Halloween', { month: 10, day: 31 }, true),
        DataModels.createHoliday('Thanksgiving', { month: 11, day: 22 }, true),
        DataModels.createHoliday('Hanukkah (Chanukah)', { month: 12, day: 6 }, true),
        DataModels.createHoliday('Christmas', { month: 12, day: 25 }, true)
      ];
      cal.climate = null;
      cal.units = 'us';
      cal.moons = [];
      return cal;
    },

    absalom: () => {
      const cal = DataModels.createCalendar('Absalom Reckoning');
      cal.description = 'The common calendar of Golarion is the Absalom Reckoning system, dating years from the founding of the city of Absalom. The calendar closely resembles the modern Gregorian structure familiar to players, with 365 days divided into twelve uneven months and a seven-day week. Every four years, a leap day is added to maintain seasonal alignment. The system is widely used across the Inner Sea region for commerce, governance, and scholarship, though individual cultures may maintain local calendars and observances alongside it. Golarion has a single moon that follows regular phases and exerts strong cultural and mystical influence. Lunar cycles are associated with magic, lycanthropy, tides, religion, and omens, and many traditions mark important events according to the moon\'s position or appearance in the night sky.';
      cal.daysInYear = 365;
      cal.months = [
        DataModels.createMonth('Abadius', 31, 0),
        DataModels.createMonth('Calistril', 28, 1),
        DataModels.createMonth('Pharast', 31, 2),
        DataModels.createMonth('Gozran', 30, 3),
        DataModels.createMonth('Desnus', 31, 4),
        DataModels.createMonth('Sarenith', 30, 5),
        DataModels.createMonth('Erastus', 31, 6),
        DataModels.createMonth('Arodus', 31, 7),
        DataModels.createMonth('Rova', 30, 8),
        DataModels.createMonth('Lamashan', 31, 9),
        DataModels.createMonth('Neth', 30, 10),
        DataModels.createMonth('Kuthona', 31, 11)
      ];
      cal.weeks = {
        enabled: true,
        daysInWeek: 7,
        weekdayNames: ['Moonday', 'Toilday', 'Wealday', 'Oathday', 'Fireday', 'Starday', 'Sunday'],
        weekNames: [],
        displayWeekNames: false,
        canSpanMonths: true
      };
      cal.leapYears = {
        enabled: true,
        cycle: 4,
        exceptions: []
      };
      cal.seasons = {
        vernalEquinox: 80
      };
      cal.holidays = [
        DataModels.createHoliday('Foundation Day', { month: 1, day: 1 }, true),
        DataModels.createHoliday('Ascension Day', { month: 12, day: 25 }, true)
      ];
      cal.climate = null;
      cal.units = 'us';
      cal.moons = [];
      return cal;
    },

    faerun: () => {
      const cal = DataModels.createCalendar('Faerun');
      cal.description = 'The standard calendar of the Forgotten Realms is the Calendar of Harptos, a solar calendar used across much of Faerûn. The year contains 365 days divided into twelve months of thirty days each. Instead of a seven-day week, the calendar uses ten-day periods commonly called tendays, which serve the same social and commercial role as weeks in many real-world cultures. Between several months are special intercalary festival days that do not belong to any month or tenday, and every four years an additional leap day is added to keep the calendar aligned with the seasons. Faerûn is illuminated primarily by a single moon, which follows regular phases.';
      cal.daysInYear = 360;
      cal.months = [
        DataModels.createMonth('Hammer', 30, 0),
        DataModels.createMonth('Alturiak', 30, 1),
        DataModels.createMonth('Ches', 30, 2),
        DataModels.createMonth('Tarsakh', 30, 3),
        DataModels.createMonth('Mirtul', 30, 4),
        DataModels.createMonth('Kythorn', 30, 5),
        DataModels.createMonth('Flamerule', 30, 6),
        DataModels.createMonth('Eleasis', 30, 7),
        DataModels.createMonth('Eleint', 30, 8),
        DataModels.createMonth('Marpenoth', 30, 9),
        DataModels.createMonth('Uktar', 30, 10),
        DataModels.createMonth('Nightal', 30, 11)
      ];
      cal.weeks = {
        enabled: true,
        daysInWeek: 10,
        weekdayNames: ['Firstday', 'Secondday', 'Thirdday', 'Fourthday', 'Fifthday', 'Sixthday', 'Seventhday', 'Eighthday', 'Ninthday', 'Tenthday'],
        weekNames: [],
        displayWeekNames: false,
        canSpanMonths: true
      };
      cal.interMonthDays = [
        DataModels.createInterMonthDay('Midwinter', { afterMonth: 1, afterDay: 30 }, true, 'fixed', null, 0, "A hard-season revel marking survival through winter's worst. Taverns overflow, nobles host masked feasts, and common folk exchange small gifts. Priests often proclaim omens for the coming year, making it fertile ground for prophecy, intrigue, or sudden violence beneath forced merriment."),
        DataModels.createInterMonthDay('Greengrass', { afterMonth: 4, afterDay: 30 }, true, 'fixed', null, 0, "A joyous spring festival celebrating planting, fertility, and renewal. Villages hold dances, contests, and outdoor feasts while druids and priests bless fields. Travelers find communities unusually welcoming, though ancient barrows and fey sites are said to stir with new life as well."),
        DataModels.createInterMonthDay('Midsummer', { afterMonth: 7, afterDay: 30 }, true, 'fixed', null, 0, "A raucous holiday of bonfires, drinking, romance, and excess. Nobles sponsor tournaments and public celebrations while adventurers easily find work as guards, performers, or duelists. The festival's chaos also makes it ideal cover for thefts, assassinations, and secret cult rites."),
        DataModels.createInterMonthDay('Highharvestide', { afterMonth: 9, afterDay: 30 }, true, 'fixed', null, 0, "A harvest celebration focused on gratitude, trade, and preparation for winter. Markets swell with food, crafts, and livestock while temples collect offerings for the needy. Rural folk tell ghost stories and leave symbolic gifts to appease local spirits before the dark season begins."),
        DataModels.createInterMonthDay('The Feast of the Moon', { afterMonth: 11, afterDay: 30 }, true, 'fixed', null, 0, "A solemn yet warm remembrance of the dead held as winter approaches. Families honor ancestors with candlelit vigils and shared meals, while priests conduct rites for wandering souls. Undead sightings and supernatural encounters are considered more common during the festival nights."),
        DataModels.createInterMonthDay('Shieldmeet', { afterMonth: 1, afterDay: 30 }, true, 'leap', 4, 0, "Occurring only every four years, this extra feast day is tied to truces, diplomacy, and grand gatherings. Mercenary companies negotiate contracts, rulers announce decrees, and temples pursue reconciliation rituals. Many believe ancient magic weakens or shifts during Shieldmeet, encouraging risky arcane experiments.")
      ];
      cal.leapYears = {
        enabled: false,
        cycle: 0,
        exceptions: []
      };
      cal.seasons = {
        vernalEquinox: 60
      };
      cal.holidays = [];
      cal.climate = null;
      cal.units = 'us';
      cal.moons = [];
      return cal;
    },

    greyhawk: () => {
      const cal = DataModels.createCalendar('Greyhawk');
      cal.description = 'The Flanaess commonly uses the Common Year calendar, a structured system consisting of 364 days divided into twelve months of twenty-eight days each. The calendar is organized around a seven-day week, with every month containing exactly four weeks. In addition to the regular months, several festival weeks occur between seasons; these intercalary periods are not part of any month and are often associated with celebrations, religious observances, tournaments, and civic events. Every four years, an additional leap festival week is inserted to preserve seasonal accuracy. The system is highly orderly and easy to track, making it popular among scholars, merchants, and rulers throughout the known world. Greyhawk\'s world possesses two moons.';
      cal.daysInYear = 364;
      cal.months = [
        DataModels.createMonth('Fireseek', 28, 0),
        DataModels.createMonth('Readying', 28, 1),
        DataModels.createMonth('Coldeven', 28, 2),
        DataModels.createMonth('Growfest', 7, 3),
        DataModels.createMonth('Planting', 28, 4),
        DataModels.createMonth('Flocktime', 28, 5),
        DataModels.createMonth('Wealsun', 28, 6),
        DataModels.createMonth('Richfest', 7, 7),
        DataModels.createMonth('Reaping', 28, 8),
        DataModels.createMonth('Goodmonth', 28, 9),
        DataModels.createMonth('Harvester', 28, 10),
        DataModels.createMonth('Brewfest', 7, 11),
        DataModels.createMonth('Patchwall', 28, 12),
        DataModels.createMonth('Ready\'reat', 28, 13),
        DataModels.createMonth('Sunsebb', 28, 14),
        DataModels.createMonth('Needfest', 7, 15)
      ];
      cal.weeks = {
        enabled: true,
        daysInWeek: 7,
        weekdayNames: ['Starday', 'Sunday', 'Moonday', 'Godsday', 'Waterday', 'Earthday', 'Freeday'],
        weekNames: [],
        displayWeekNames: false,
        canSpanMonths: false
      };
      cal.leapYears = {
        enabled: false,
        cycle: 0,
        exceptions: []
      };
      cal.seasons = {
        vernalEquinox: 91
      };
      cal.holidays = [];
      cal.climate = null;
      cal.units = 'us';
      cal.moons = [
        DataModels.createMoon('Luna', 28, { year: 1, month: 8, day: 4 }),
        DataModels.createMoon('Celene', 91, { year: 1, month: 8, day: 4 })
      ];
      return cal;
    },

    eberron: () => {
      const cal = DataModels.createCalendar('Eberron');
      cal.description = 'The standard calendar of Eberron is the Galifar Calendar, established during the reign of the Kingdom of Galifar and still used throughout Khorvaire. The year contains 336 days divided into twelve months of exactly twenty-eight days each, creating a perfectly regular structure of four seven-day weeks per month. Because every month begins on the same weekday, dates are easy to track and schedule. The calendar contains no leap years or intercalary festival days. Eberron has an unusually complex lunar system consisting of twelve moons of varying sizes, colors, and orbital periods. The changing combinations of visible moons are a major feature of the setting\'s atmosphere and cosmology, particularly in relation to magic, prophecy, and planar influence. For simplicity, about half the moons do not display in Calendar view. This can be edited below.';
      cal.daysInYear = 336;
      cal.months = [
        DataModels.createMonth('Zarantyr', 28, 0),
        DataModels.createMonth('Olarune', 28, 1),
        DataModels.createMonth('Therendor', 28, 2),
        DataModels.createMonth('Eyre', 28, 3),
        DataModels.createMonth('Dravago', 28, 4),
        DataModels.createMonth('Nymm', 28, 5),
        DataModels.createMonth('Lharvion', 28, 6),
        DataModels.createMonth('Barrakas', 28, 7),
        DataModels.createMonth('Rhaan', 28, 8),
        DataModels.createMonth('Sypheros', 28, 9),
        DataModels.createMonth('Aryth', 28, 10),
        DataModels.createMonth('Vult', 28, 11)
      ];
      cal.weeks = {
        enabled: true,
        daysInWeek: 7,
        weekdayNames: ['Sul', 'Mol', 'Zol', 'Wir', 'Zor', 'Far', 'Sar'],
        weekNames: [],
        displayWeekNames: false,
        canSpanMonths: true
      };
      cal.leapYears = {
        enabled: false,
        cycle: 4,
        exceptions: []
      };
      cal.seasons = {
        vernalEquinox: 84
      };
      cal.holidays = [
        DataModels.createHoliday('Brightblade', { month: 1, day: 12 }, true, 'A festival honoring Dol Arrah and ideals of sacrifice, courage, and honorable battle.'),
        DataModels.createHoliday('Long Shadows', { month: 9, day: 26 }, true, 'A solemn remembrance of the dead associated with Dolurrh, funerary rites, and ancestral reflection.'),
        DataModels.createHoliday('Wildnight', { month: 10, day: 18 }, true, 'A chaotic celebration tied to the Traveler, featuring masks, revelry, deception, and unpredictable behavior.'),
        DataModels.createHoliday('Baker\'s Night', { month: 11, day: 9 }, true, 'A communal feast celebrated across Khorvaire with food, hospitality, storytelling, and preparation for winter.')
      ];
      cal.climate = null;
      cal.units = 'us';
      cal.moons = [
        DataModels.createMoon('Zarantyr', 0.4, { year: 1, month: 1, day: 1 }, 0.3, 'orange', false),  // Tiny, hidden
        DataModels.createMoon('Olarune', 0.8, { year: 1, month: 1, day: 2 }, 0.4, 'gray', false),  // Small, hidden
        DataModels.createMoon('Therendor', 1.8, { year: 1, month: 1, day: 3 }, 0.5, 'tan', false),  // Medium-small, hidden
        DataModels.createMoon('Eyre', 2.9, { year: 1, month: 1, day: 4 }, 0.6, 'yellow', true),  // Medium, visible, default color
        DataModels.createMoon('Dravago', 5.1, { year: 1, month: 1, day: 5 }, 0.7, 'orange', true),  // Medium-large, visible, orange
        DataModels.createMoon('Nymm', 6.7, { year: 1, month: 1, day: 6 }, 0.8, 'blue', true),  // Large, visible, blue
        DataModels.createMoon('Lharvion', 10.3, { year: 1, month: 1, day: 7 }, 0.9, 'red', true),  // Very large, visible, red
        DataModels.createMoon('Barrakas', 12.3, { year: 1, month: 1, day: 8 }, 1.0, 'orange', true),  // Full size, visible, orange
        DataModels.createMoon('Rhaan', 14.5, { year: 1, month: 1, day: 9 }, 0.5, 'purple', false),  // Medium-small, hidden, purple
        DataModels.createMoon('Sypheros', 16.9, { year: 1, month: 1, day: 10 }, 0.6, 'brown', false),  // Medium, hidden, brown
        DataModels.createMoon('Aryth', 11.9, { year: 1, month: 1, day: 11 }, 0.7, 'tan', false),  // Medium-large, hidden, tan
        DataModels.createMoon('Vult', 29.2, { year: 1, month: 1, day: 12 }, 0.8, 'yellow', true)  // Large, visible, yellow
      ];
      return cal;
    },

    traveller: () => {
      const cal = DataModels.createCalendar('Traveller');
      cal.description = 'The standard Imperial Calendar used throughout the Third Imperium. The year begins with Holiday, a day outside the normal weekly cycle. This is followed by 364 numbered days, ensuring that Wonday always marks Day 2 of every year.';
      cal.daysInYear = 365;  // Full year: Holiday (1) + month days (364)
      cal.months = [
        DataModels.createMonth('Day', 364, 0)
      ];
      cal.interannualDays = [
        DataModels.createInterannualDay('Holiday', 'beginning', 0)
      ];
      cal.weeks = {
        enabled: true,
        daysInWeek: 7,
        weekdayNames: ['Wonday', 'Tuday', 'Thirday', 'Forday', 'Fiday', 'Sixday', 'Senday'],
        weekNames: [],
        displayWeekNames: false,
        canSpanMonths: true
      };
      cal.leapYears = {
        enabled: false,
        cycle: 4,
        exceptions: []
      };
      cal.seasons = {
        vernalEquinox: 1
      };
      cal.holidays = [];
      cal.climate = null;
      cal.units = 'us';
      cal.moons = [];
      return cal;
    },

  };

  // ==================================================
  // Parser
  // ==================================================

  const Parser = {

    parse: (content) => {
      const tokens = content.trim().split(/\s+/);
      const command = tokens.shift();

      const args = {};
      let currentKey = null;

      tokens.forEach(token => {

        if (token.startsWith('--')) {
          currentKey = token.replace(/^--/, '');
          args[currentKey] = true;
          return;
        }

        if (currentKey) {
          // Don't split on pipe - keep the entire value intact
          if (args[currentKey] === true) {
            args[currentKey] = token;
          } else {
            args[currentKey] += ` ${token}`;
          }
        }

      });

      return { command, args };
    }

  };

  // ==================================================
  // Output
  // ==================================================

  const Output = {

    send: (who, message) => {
      const CSS_CURRENT = getCSS();
      const cleanWho = who.split('(GM')[0].trim();
      const cleanMessage = message.replace(/\r?\n/g, '');
      // Use chatOutput style for whispered messages
      const styledMessage = `<div style="${CSS_CURRENT.chatOutput}">${cleanMessage}</div>`;
      sendChat(scriptName, `/w "${cleanWho}" ${styledMessage}`);
    },

    broadcast: (message) => {
      const cleanMessage = message.replace(/\r?\n/g, '');
      sendChat(scriptName, cleanMessage);
    },

    makeButton: (label, command, style) => {
      const CSS_CURRENT = getCSS();
      const buttonStyle = style || CSS_CURRENT.button;
      return `<a style="${buttonStyle}" href="${command}">${label}</a>`;
    }

  };

  // ==================================================
  // Handout Management
  // ==================================================

  const HandoutManager = {

    findHandout: (name) => {
      return findObjs({ type: 'handout', name: name })[0];
    },

    createHandout: (name, notes, gmnotes = '', archived = true) => {
      return createObj('handout', {
        name: name,
        notes: notes,
        gmnotes: gmnotes,
        infolderorder: '',
        archived: archived
      });
    },

    getHandoutNotes: (handout, callback) => {
      handout.get('notes', callback);
    },

    getHandoutGMNotes: (handout, callback) => {
      handout.get('gmnotes', callback);
    },

    setHandoutNotes: (handout, notes) => {
      handout.set('notes', notes);
    },

    setHandoutGMNotes: (handout, gmnotes) => {
      handout.set('gmnotes', gmnotes);
    },

    saveCalendar: (calendar) => {
      const name = `${HANDOUT_PREFIX} Calendar: ${calendar.name}`;
      let handout = HandoutManager.findHandout(name);

      const data = JSON.stringify(calendar, null, 2);

      if (!handout) {
        handout = HandoutManager.createHandout(name, '');
        Logger.log(`Created calendar handout: ${name}`);
      }
      
      HandoutManager.setHandoutGMNotes(handout, data);
      Logger.log(`Updated calendar handout: ${name}`);

      State.setConfig('currentCalendar', name);
      return handout;
    },

    loadData: (callback) => {
      // Load calendar and events data using proper async callbacks
      // Pass loaded data to callback instead of storing in state
      const calName = State.config().currentCalendar;
      if (!calName) {
        callback({
          calendar: null,
          events: [],
          notes: [],
          moons: [],
          weather: []
        });
        return;
      }

      const calHandout = HandoutManager.findHandout(calName);
      if (!calHandout) {
        Logger.error(`Calendar handout not found: ${calName}`);
        callback({
          calendar: null,
          events: [],
          notes: [],
          moons: [],
          weather: []
        });
        return;
      }

      // Load calendar with callback
      HandoutManager.getHandoutGMNotes(calHandout, (gmnotes) => {
        let calendar = null;
        let moons = [];
        
        try {
          calendar = JSON.parse(gmnotes || '{}');
          moons = calendar.moons || [];
          Logger.debug(`Loaded calendar: ${calendar.name}`);
        } catch (e) {
          Logger.error(`Failed to parse calendar: ${e}`);
        }

        // Load events with callback
        const eventsName = `${HANDOUT_PREFIX} Events: ${calName.replace(`${HANDOUT_PREFIX} Calendar: `, '')}`;
        const eventsHandout = HandoutManager.findHandout(eventsName);
        
        if (!eventsHandout) {
          callback({
            calendar: calendar,
            events: [],
            notes: [],
            moons: moons,
            weather: []
          });
          return;
        }

        HandoutManager.getHandoutGMNotes(eventsHandout, (eventsNotes) => {
          let events = [];
          let notes = [];
          let weather = [];
          
          try {
            const data = JSON.parse(eventsNotes || '{}');
            events = data.events || [];
            notes = data.notes || [];
            weather = data.weather || [];
            Logger.debug(`Loaded ${events.length} events, ${notes.length} notes`);
          } catch (e) {
            Logger.error(`Failed to parse events: ${e}`);
          }

          // Return all loaded data
          callback({
            calendar: calendar,
            events: events,
            notes: notes,
            moons: moons,
            weather: weather
          });
        });
      });
    },



    saveEvents: (campaignName, events, notes, weather = []) => {
      const name = `${HANDOUT_PREFIX} Events: ${campaignName}`;
      let handout = HandoutManager.findHandout(name);

      const jsonData = JSON.stringify({ events, notes, weather }, null, 2);

      if (!handout) {
        handout = HandoutManager.createHandout(name, jsonData);
        Logger.log(`Created events handout: ${name}`);
      } else {
        HandoutManager.setHandoutGMNotes(handout, jsonData);
        Logger.log(`Updated events handout: ${name}`);
      }

      State.setConfig('currentEvents', name);
      return handout;
    },

    loadEvents: (name, callback) => {
      const handout = HandoutManager.findHandout(name);
      if (!handout) {
        Logger.error(`Events handout not found: ${name}`);
        callback({ events: [], notes: [] });
        return;
      }

      HandoutManager.getHandoutGMNotes(handout, (gmnotes) => {
        try {
          const data = JSON.parse(gmnotes);
          Logger.debug(`Loaded ${data.events.length} events and ${data.notes.length} notes`);
          callback(data);
        } catch (e) {
          Logger.error(`Failed to parse events: ${e}`);
          callback({ events: [], notes: [] });
        }
      });
    }

  };

  // ==================================================
  // Date Utilities
  // ==================================================

  const DateUtils = {

    // ==================================================
    // Interannual Day Helpers
    // ==================================================

    // Get all interannual days at a given position, sorted by order
    getInterannualDaysAtPosition: (position, calendar) => {
      if (!calendar.interannualDays || calendar.interannualDays.length === 0) return [];
      return calendar.interannualDays
        .filter(d => d.position === position)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    },

    // Count interannual days at beginning (needed for month offset)
    countInterannualDaysAtBeginning: (calendar) => {
      if (!calendar.interannualDays || calendar.interannualDays.length === 0) return 0;
      return calendar.interannualDays.filter(d => d.position === 'beginning').length;
    },

    // Count interannual days at end
    countInterannualDaysAtEnd: (calendar) => {
      if (!calendar.interannualDays || calendar.interannualDays.length === 0) return 0;
      return calendar.interannualDays.filter(d => d.position === 'end').length;
    },

    // Convert interannual day reference to absolute day within the year
    getAbsDayOfInterannualDay: (position, order, calendar) => {
      if (!calendar.interannualDays || calendar.interannualDays.length === 0) return 0;

      if (position === 'beginning') {
        // Beginning interannual days are at the start: 1, 2, 3, ...
        const beginningDays = DateUtils.getInterannualDaysAtPosition('beginning', calendar);
        const index = beginningDays.findIndex(d => d.order === order);
        return index >= 0 ? index + 1 : 0;
      } else if (position === 'end') {
        // End interannual days are at the end of the year
        const baseDays = calendar.daysInYear;
        const endDays = DateUtils.getInterannualDaysAtPosition('end', calendar);
        const index = endDays.findIndex(d => d.order === order);
        return index >= 0 ? baseDays + index + 1 : 0;
      }
      return 0;
    },

    // Get effective day for weekday calculation (excludes interannual days from sequence)
    getEffectiveDayForWeekday: (absDay, year, calendar) => {
      if (!calendar.interannualDays || calendar.interannualDays.length === 0) return absDay;

      // Count interannual days that come before this absolute day in the year
      let interannualsBefore = 0;

      // Count beginning interannual days (they come before all other days)
      const beginningCount = DateUtils.countInterannualDaysAtBeginning(calendar);
      const baseDays = calendar.daysInYear;

      if (absDay > beginningCount) {
        interannualsBefore = beginningCount;
      } else {
        interannualsBefore = 0; // absDay is on or before a beginning interannual day
      }

      // Check for ending interannual days
      const endingDays = DateUtils.getInterannualDaysAtPosition('end', calendar);
      for (const day of endingDays) {
        const endAbsDay = DateUtils.getAbsDayOfInterannualDay('end', day.order, calendar);
        if (absDay > endAbsDay) {
          interannualsBefore++;
        }
      }

      return absDay - interannualsBefore;
    },

    // Check if an absolute day falls on an interannual day
    isAbsDayOnInterannualDay: (absDay, calendar) => {
      if (!calendar.interannualDays || calendar.interannualDays.length === 0) return false;

      for (const day of calendar.interannualDays) {
        const dayAbsDay = DateUtils.getAbsDayOfInterannualDay(day.position, day.order, calendar);
        if (absDay === dayAbsDay) return true;
      }
      return false;
    },

    // Get interannual day reference from absolute day
    getInterannualDayFromAbsDay: (absDay, calendar) => {
      if (!calendar.interannualDays || calendar.interannualDays.length === 0) return null;

      for (const day of calendar.interannualDays) {
        const dayAbsDay = DateUtils.getAbsDayOfInterannualDay(day.position, day.order, calendar);
        if (absDay === dayAbsDay) {
          return {
            id: day.id,
            name: day.name,
            position: day.position,
            order: day.order,
            dayOfYear: absDay
          };
        }
      }
      return null;
    },

    // Convert {year, month, day} or {year, isInterannual, position, order} to absolute day number
    toAbsoluteDay: (dateRef, calendar) => {
      if (!calendar || !dateRef) return 0;

      let dayCount = 0;

      // Count all complete years before the current year
      if (dateRef.year > 0) {
        for (let y = 1; y < dateRef.year; y++) {
          dayCount += DateUtils.getDaysInYear(y, calendar);
        }
      } else if (dateRef.year < 0) {
        for (let y = -1; y >= dateRef.year; y--) {
          dayCount -= DateUtils.getDaysInYear(y, calendar);
        }
      }

      // Handle interannual day reference
      if (dateRef.isInterannual) {
        const absDayInYear = DateUtils.getAbsDayOfInterannualDay(dateRef.position, dateRef.order, calendar);
        if (absDayInYear === undefined || absDayInYear === null || isNaN(absDayInYear)) {
          return dayCount; // Fall back to just the year count
        }
        return dayCount + absDayInYear;
      }

      // Handle regular month/day reference
      // Add complete months in current year
      for (let m = 1; m < dateRef.month; m++) {
        const daysInMonth = DateUtils.getDaysInMonth(m, dateRef.year, calendar);
        dayCount += daysInMonth;
      }

      // Add days in current month
      if (dateRef.day) {
        dayCount += dateRef.day;
      }

      return dayCount;
    },

    // Get days in a specific year (accounting for leap years)
    getDaysInYear: (year, calendar) => {
      // Base calculation for leap years
      let baseDays = calendar.daysInYear;
      if (calendar.leapYears?.enabled) {
        if (year % calendar.leapYears.cycle === 0 && !calendar.leapYears.exceptions?.includes(year)) {
          baseDays += 1; // Leap year
        }
      }

      // Note: Interannual days are NOT included in the year count because they're
      // outside the normal month/day structure and don't affect absolute day calculations
      return baseDays;
    },

    // Get days in a specific month
    getDaysInMonth: (monthNum, year, calendar) => {
      const month = calendar.months[monthNum - 1];
      if (!month) return 0;

      // Check if this is February in a leap year (for Gregorian-like calendars)
      if (calendar.leapYears.enabled && monthNum === 2) {
        if (year % calendar.leapYears.cycle === 0 && !calendar.leapYears.exceptions.includes(year)) {
          return month.days + 1;
        }
      }

      return month.days;
    },

    // Convert absolute day back to date reference {year, month, day} or interannual reference
    getDateRefFromAbsoluteDay: (absDay, calendar) => {
      if (!calendar) return { year: 0, month: 1, day: 1 };

      // Find the year this absolute day falls in
      let dayCount = 0;
      let year = 1;

      // Handle positive years
      while (dayCount + DateUtils.getDaysInYear(year, calendar) < absDay) {
        dayCount += DateUtils.getDaysInYear(year, calendar);
        year++;
      }

      // Now calculate day within this year
      const dayInYear = absDay - dayCount;

      // Check if this is an interannual day
      const interannualDay = DateUtils.getInterannualDayFromAbsDay(dayInYear, calendar);
      if (interannualDay) {
        return {
          year: year,
          isInterannual: true,
          position: interannualDay.position,
          order: interannualDay.order
        };
      }

      // Account for beginning interannual days when calculating month/day
      const beginningInterannualCount = DateUtils.countInterannualDaysAtBeginning(calendar);
      const adjustedDayInYear = dayInYear - beginningInterannualCount;

      if (adjustedDayInYear <= 0) {
        // This shouldn't happen if interannualDay check worked, but safety net
        return { year: year, month: 1, day: Math.max(1, adjustedDayInYear) };
      }

      // Calculate which month and day
      let month = 1;
      let dayCount2 = 0;

      while (month <= calendar.months.length) {
        const daysInMonth = DateUtils.getDaysInMonth(month, year, calendar);
        if (dayCount2 + daysInMonth >= adjustedDayInYear) {
          // Found the month
          const dayInMonth = adjustedDayInYear - dayCount2;
          return { year: year, month: month, day: dayInMonth };
        }
        dayCount2 += daysInMonth;
        month++;
      }

      // Fallback (shouldn't reach here)
      return { year: year, month: calendar.months.length || 1, day: 1 };
    },

    // Calculate distance between two dates
    calculateDistance: (from, to, calendar) => {
      const fromAbs = DateUtils.toAbsoluteDay(from, calendar);
      const toAbs = DateUtils.toAbsoluteDay(to, calendar);
      const diff = toAbs - fromAbs;

      // Convert to appropriate unit
      if (Math.abs(diff) < 365) {
        return `${diff > 0 ? '+' : ''}${diff}d`;
      }

      const years = diff / 365;
      if (Math.abs(years) < 10) {
        return `${years > 0 ? '+' : ''}${years.toFixed(1)}y`;
      }

      return `${years > 0 ? '+' : ''}${Math.round(years)}y`;
    },

    // Get the weekday for a given date
    getWeekday: (dateRef, calendar) => {
      if (!calendar.weeks.enabled) return null;

      const absDay = DateUtils.toAbsoluteDay(dateRef, calendar);
      const weekdayIndex = (absDay - 1) % calendar.weeks.daysInWeek;
      return calendar.weeks.weekdayNames[weekdayIndex];
    },

    // Get special days that occur in a specific year
    getSpecialDaysForYear: (year, calendar) => {
      if (!calendar.interMonthDays) return [];
      
      return calendar.interMonthDays.filter(sd => {
        if (sd.dayType === 'fixed') {
          return true; // Fixed days always occur
        } else if (sd.dayType === 'leap') {
          // Check if this year qualifies for the leap day
          return (year - sd.offset) % sd.frequency === 0;
        }
        return false;
      });
    },

    // Get special days that occur after a specific date
    getSpecialDaysAfterDate: (month, day, year, calendar) => {
      const specialDays = DateUtils.getSpecialDaysForYear(year, calendar);
      
      return specialDays.filter(sd => {
        if (!sd.position) return false;
        // Check if special day comes after this month/day
        if (sd.position.afterMonth > month) return false;
        if (sd.position.afterMonth === month && sd.position.afterDay > day) return false;
        return true;
      });
    },

    // Check if a date is a special day (occurs AFTER the position day)
    isSpecialDay: (month, day, year, calendar) => {
      const specialDays = DateUtils.getSpecialDaysForYear(year, calendar);
      
      return specialDays.find(sd => {
        if (!sd.position) return false;
        // Special day occurs the day AFTER position.afterDay
        if (sd.position.afterMonth !== month) return false;
        
        // For "part of week" special days, they occur on afterDay + 1
        // For "between weeks" they're shown separately in grid
        if (!sd.breaksWeekCycle) {
          return day === sd.position.afterDay + 1;
        }
        
        return false;
      });
    },

    // Calculate elapsed time between two dates
    // Returns object with {years, months, days, isNegative} for display
    getElapsedTime: (fromDate, toDate, calendar) => {
      if (!calendar || !fromDate || !toDate) return { years: 0, months: 0, days: 0, isNegative: false };

      // Calculate absolute day values using the same logic as timeline sorting
      let fromAbsDay, toAbsDay;
      
      if (fromDate.isInterannual) {
        let yearDays = 0;
        if (fromDate.year > 1) {
          for (let y = 1; y < fromDate.year; y++) {
            yearDays += DateUtils.getDaysInYear(y, calendar);
          }
        }
        fromAbsDay = yearDays + DateUtils.getAbsDayOfInterannualDay(fromDate.position, fromDate.order, calendar);
      } else {
        const beginningInterannualCount = DateUtils.countInterannualDaysAtBeginning(calendar);
        fromAbsDay = DateUtils.toAbsoluteDay(fromDate, calendar) + beginningInterannualCount;
      }
      
      if (toDate.isInterannual) {
        let yearDays = 0;
        if (toDate.year > 1) {
          for (let y = 1; y < toDate.year; y++) {
            yearDays += DateUtils.getDaysInYear(y, calendar);
          }
        }
        toAbsDay = yearDays + DateUtils.getAbsDayOfInterannualDay(toDate.position, toDate.order, calendar);
      } else {
        const beginningInterannualCount = DateUtils.countInterannualDaysAtBeginning(calendar);
        toAbsDay = DateUtils.toAbsoluteDay(toDate, calendar) + beginningInterannualCount;
      }
      
      let totalDays = Math.floor(toAbsDay - fromAbsDay);
      const isNegative = totalDays < 0;
      totalDays = Math.abs(totalDays);
      
      let years = 0;
      let months = 0;
      let days = totalDays;
      
      const daysInYear = DateUtils.getDaysInYear(fromDate.year || toDate.year, calendar);
      if (days >= daysInYear) {
        years = Math.floor(days / daysInYear);
        days = days % daysInYear;
      }
      
      if (days >= 30) {
        months = Math.floor(days / 30);
        days = days % 30;
      }
      
      return { years: years, months: months, days: days, isNegative: isNegative, isFirstOfYear: false };
    },

  };

  // ==================================================
  // Moon Phase Calculator
  // ==================================================

  const MoonPhaseCalculator = {

    getPhase: (moon, dateRef, calendar) => {
      const currentDay = DateUtils.toAbsoluteDay(dateRef, calendar);
      const fullDay = DateUtils.toAbsoluteDay(moon.fullDayRef, calendar);

      const daysSinceFull = currentDay - fullDay;
      const cyclePosition = ((daysSinceFull % moon.period) + moon.period) % moon.period;

      // Normalize to 0-1, where 0 is new moon, 0.5 is full moon
      // Since fullDayRef is when the moon WAS full, we need to offset by half a cycle
      let phase = cyclePosition / moon.period;
      phase = (phase + 0.5) % 1; // Shift so full moon reference = 0.5
      
      return phase;
    },

    generateMoonHTML: (phase, size, color, moonName, showTooltip) => {
      // Set defaults
      if (size === undefined) size = 1;
      if (color === undefined) color = 'yellow';
      if (moonName === undefined) moonName = '';
      if (showTooltip === undefined) showTooltip = false;
      
      // Sprite sheet URL
      const spriteURL = 'https://files.d20.io/images/488065736/0YUajKyQKqwp_NAkiQZw2Q/original.webp?1779563627';
      
      // Map color names to row indices (0-11)
      const colorMap = {
        'yellow': 0, '#f7d79c': 0, // default yellow
        'red': 1, '#ff0000': 1, '#ff4500': 1, '#ff6347': 1,
        'green': 2, '#00ff00': 2, '#008000': 2,
        'blue': 3, '#0000ff': 3, '#87ceeb': 3,
        'cyan': 4, '#00ffff': 4,
        'orange': 5, '#ffa500': 5, '#d4af37': 5, '#ffd700': 5,
        'purple': 6, '#800080': 6, '#dda0dd': 6,
        'tan': 7, '#d2b48c': 7, '#f0e68c': 7, '#e8dcc4': 7,
        'brown': 8, '#8b4513': 8, '#a0522d': 8,
        'white': 9, '#ffffff': 9, '#f8f8ff': 9,
        'gray': 10, '#808080': 10, '#c0c0c0': 10,
        'dark': 11, '#000000': 11, '#2a2a2a': 11
      };
      
      // Find closest color match
      let rowIndex = 0;
      const lowerColor = (color || '').toLowerCase();
      if (colorMap[lowerColor] !== undefined) {
        rowIndex = colorMap[lowerColor];
      } else if (colorMap[color] !== undefined) {
        rowIndex = colorMap[color];
      }
      
      // Map phase (0-1) to column index (0-7)
      // 0 = new, 0.125 = waxing crescent, 0.25 = first quarter, 0.375 = waxing gibbous
      // 0.5 = full, 0.625 = waning gibbous, 0.75 = last quarter, 0.875 = waning crescent
      let colIndex = Math.floor(phase * 8);
      if (colIndex >= 8) colIndex = 7; // Cap at 7
      
      // Sprite sheet specs
      const sheetWidth = 512;
      const sheetHeight = 768;
      const cols = 8;
      const rows = 12;
      const cellWidth = sheetWidth / cols; // 64px
      const cellHeight = sheetHeight / rows; // 64px
      
      // Calculate display size
      const baseSize = 20;
      const actualSize = baseSize * Math.max(0.1, Math.min(1, size));
      
      // Calculate background position (negative offsets to show the correct cell)
      const bgX = -(colIndex * actualSize);
      const bgY = -(rowIndex * actualSize);
      
      // Scale the entire sprite sheet so each 64px cell becomes actualSize pixels
      // Sheet is 8 cols × 12 rows, so scaled sheet is (8*actualSize) × (12*actualSize)
      const scaledSheetWidth = cols * actualSize;
      const scaledSheetHeight = rows * actualSize;
      
      // Create HTML with background sprite
      let html = '<span style="';
      html += 'display: inline-block; ';
      html += 'width: ' + actualSize + 'px; ';
      html += 'height: ' + actualSize + 'px; ';
      html += 'background-image: url(' + spriteURL + '); ';
      html += 'background-position: ' + bgX + 'px ' + bgY + 'px; ';
      html += 'background-size: ' + scaledSheetWidth + 'px ' + scaledSheetHeight + 'px; ';
      html += 'background-repeat: no-repeat; ';
      html += 'vertical-align: middle;';
      html += '"';
      
      if (showTooltip && moonName) {
        html += ' title="' + moonName + '"';
      }
      
      html += '></span>';
      
      return html;
    },

    getAllPhases: (moons, dateRef, calendar) => {
      if (!moons || moons.length === 0) {
        return [];
      }
      
      const visibleMoons = moons.filter(m => m.display !== false);
      const showTooltips = visibleMoons.length > 1;
      
      const results = [];
      for (let i = 0; i < visibleMoons.length; i++) {
        const moon = visibleMoons[i];
        try {
          const phase = MoonPhaseCalculator.getPhase(moon, dateRef, calendar);
          const size = moon.size || 1;
          const color = moon.color || 'yellow';
          const html = MoonPhaseCalculator.generateMoonHTML(phase, size, color, moon.name, showTooltips);
          
          results.push({
            name: moon.name,
            phase: phase,
            html: html
          });
        } catch (e) {
          log('Error generating moon phase for ' + moon.name + ': ' + e);
        }
      }
      
      return results;
    }

  };

  // ==================================================
  // Interface Renderer
  // ==================================================


  // ==================================================
  // Data Loader - Loads data from handouts with callbacks
  // ==================================================
  
  const DataLoader = {
    loadAll: (callback) => {
      const calName = State.config().currentCalendar;
      
      if (!calName) {
        // No calendar loaded
        callback({
          calendar: null,
          events: [],
          notes: [],
          moons: [],
          weather: []
        });
        return;
      }
      
      const calHandout = HandoutManager.findHandout(calName);
      if (!calHandout) {
        Logger.error(`Calendar handout not found: ${calName}`);
        callback({
          calendar: null,
          events: [],
          notes: [],
          moons: [],
          weather: []
        });
        return;
      }
      
      // Load calendar with callback
      HandoutManager.getHandoutGMNotes(calHandout, (gmnotes) => {
        let calendar = null;
        let moons = [];
        
        try {
          calendar = JSON.parse(gmnotes || '{}');
          
          // Migration: ensure moons array exists
          if (!calendar.moons) {
            calendar.moons = [];
          }
          moons = calendar.moons;
        } catch (e) {
          Logger.error(`Failed to parse calendar: ${e}`);
        }
        
        // Load events with callback
        const eventsName = `${HANDOUT_PREFIX} Events: ${calName.replace(`${HANDOUT_PREFIX} Calendar: `, '')}`;
        const eventsHandout = HandoutManager.findHandout(eventsName);
        
        if (!eventsHandout) {
          callback({
            calendar: calendar,
            events: [],
            notes: [],
            moons: moons,
            weather: []
          });
          return;
        }
        
        HandoutManager.getHandoutGMNotes(eventsHandout, (eventsNotes) => {
          let events = [];
          let notes = [];
          let weather = [];
          
          try {
            const data = JSON.parse(eventsNotes || '{}');
            events = data.events || [];
            notes = data.notes || [];
            weather = data.weather || [];
          } catch (e) {
            Logger.error(`Failed to parse events: ${e}`);
          }
          
          callback({
            calendar: calendar,
            events: events,
            notes: notes,
            moons: moons,
            weather: weather
          });
        });
      });
    }
  };

  const InterfaceRenderer = {

    render: (mode, data, callback) => {
      const CSS_CURRENT = getCSS();
      const theme = State.config().theme;

      let content = '';
      
      // Outer wrapper for entire handout background
      content += `<div style="${CSS_CURRENT.container}">`;
      
      content += InterfaceRenderer.renderHeader(mode);
      
      switch (mode) {
        case 'calendar':
          content += InterfaceRenderer.renderCalendarMode(data);
          break;
        case 'design':
          content += InterfaceRenderer.renderDesignMode(data);
          break;
        case 'timeline':
          content += InterfaceRenderer.renderTimelineMode(data);
          break;
        default:
          content += '<div>Unknown mode</div>';
      }

      content += '</div>'; // Close outer wrapper

      // Save to interface handout (theme is already applied via getCSS() in each component)
      let handout = HandoutManager.findHandout(INTERFACE_HANDOUT_NAME);
      if (!handout) {
        handout = HandoutManager.createHandout(INTERFACE_HANDOUT_NAME, content, '', false);
      } else {
        HandoutManager.setHandoutNotes(handout, content);
      }

      if (callback) callback(handout);
    },

    renderHeader: (currentMode) => {
      const CSS_CURRENT = getCSS();
      const modes = [
        { key: 'calendar', label: 'Calendar' },
        { key: 'design', label: 'Design' },
        { key: 'timeline', label: 'Timeline' }
      ];

      const themes = [
        { key: 'light', label: '☀️' },
        { key: 'dark', label: '🌙' },
        { key: 'fantasy', label: '📜' }
      ];

      let html = '<div style="' + CSS_CURRENT.header + 'padding: 10px; margin: -10px -10px 10px -10px;">';
      html += '<span style="font-size: 18px; font-weight: bold;">Chronicle</span>';
      
      html += '<span style="float: right;">';
      
      // Mode buttons (inline)
      modes.forEach(m => {
        const style = m.key === currentMode ? CSS_CURRENT.button + 'font-weight: bold;' : CSS_CURRENT.button;
        html += Output.makeButton(m.label, `!chr --mode ${m.key}`, style);
      });
      
      html += '<span style="margin: 0 8px;">|</span>';
      
      // Theme buttons (inline, same size as mode buttons)
      themes.forEach(t => {
        html += Output.makeButton(t.label, `!chr --theme ${t.key}`, CSS_CURRENT.button);
      });
      
      html += '<span style="margin: 0 8px;">|</span>';
      
      // Utility buttons (inline, same size)
      html += Output.makeButton('Help', '!chr --help', CSS_CURRENT.button);
      html += Output.makeButton('Send to Chat', `!chr --chat ${currentMode}`, CSS_CURRENT.button);
      
      html += '</span>'; // Close float:right span
      html += '</div>';
      return html;
    },

    renderCalendarMode: (data) => {
      const calendar = data.calendar;
      if (!calendar) {
        return '<div style="padding: 20px;">No calendar loaded. Use Design Mode to create one.</div>';
      }

      const viewingDate = State.config().viewingDate;
      const currentDate = State.config().currentDate;
      
      let html = '<div style="padding: 10px;">';

      // Month navigation
      html += InterfaceRenderer.renderMonthNavigation(viewingDate, calendar);

      // Calendar grid
      html += InterfaceRenderer.renderCalendarGrid(viewingDate, calendar, data);

      // Events and notes for current viewing date
      html += InterfaceRenderer.renderDayDetails(currentDate, calendar, data);

      html += '</div>';
      return html;
    },

    renderMonthNavigation: (viewingDate, calendar) => {
      const CSS_CURRENT = getCSS();
      const month = calendar.months[viewingDate.month - 1];
      const monthName = month ? month.name : 'Unknown';
      const currentDate = State.config().currentDate;

      let html = '<div style="text-align: center; margin: 10px 0; font-size: 16px; font-weight: bold;">';
      
      // Previous controls
      html += Output.makeButton('◀◀◀', `!chr --prevyear`, CSS_CURRENT.button);
      html += Output.makeButton('◀◀', `!chr --prevmonth`, CSS_CURRENT.button);
      html += Output.makeButton('◀', `!chr --prevday`, CSS_CURRENT.button);
      
      html += ` <span style="margin: 0 10px;">`;
      
      // Day picker with direct query
      html += `<a style="${CSS_CURRENT.button}" href="!chr --jumptoday ?{Which day?|${currentDate.day}}">${currentDate.day}</a>`;
      html += ` `;
      
      // Month picker with direct query (or simple link for single-month calendars)
      let monthButtonHref;
      if (calendar.months.length === 1) {
        monthButtonHref = `!chr --jumptomonth 1`;
      } else {
        const monthList = calendar.months.map((m, idx) => `${m.name},${idx + 1}`).join('|');
        monthButtonHref = `!chr --jumptomonth ?{Which month?|${monthList}}`;
      }
      html += `<a style="${CSS_CURRENT.button}" href="${monthButtonHref}">${monthName}</a>`;
      html += ` `;
      
      // Year picker with direct query
      html += `<a style="${CSS_CURRENT.button}" href="!chr --jumptoyear ?{Which year?|${viewingDate.year}}">${viewingDate.year}</a>`;
      html += `</span> `;
      
      // Next controls
      html += Output.makeButton('▶', `!chr --nextday`, CSS_CURRENT.button);
      html += Output.makeButton('▶▶', `!chr --nextmonth`, CSS_CURRENT.button);
      html += Output.makeButton('▶▶▶', `!chr --nextyear`, CSS_CURRENT.button);
      
      html += '</div>';

      // Featured Date (currently viewing) and Today (saved campaign date) display
      const currentMonth = calendar.months[currentDate.month - 1];
      const currentMonthName = currentMonth ? currentMonth.name : 'Unknown';
      
      const todayDate = State.config().featuredDate || currentDate; // "Today" is the saved date
      const todayMonth = calendar.months[todayDate.month - 1];
      const todayMonthName = todayMonth ? todayMonth.name : 'Unknown';
      
      html += `<div style="text-align: center; margin: 5px 0; font-size: 12px;">`;
      html += `<strong>Today:</strong> ${todayMonthName} ${todayDate.day}, ${todayDate.year} `;
      html += Output.makeButton('Go to Today', `!chr --gototoday`, CSS_CURRENT.buttonSmall);
      html += Output.makeButton('Define Today as Featured', `!chr --settoday`, CSS_CURRENT.buttonSmall);
      html += `</div>`;

      return html;
    },

    renderCalendarGrid: (viewingDate, calendar, data) => {
      const CSS_CURRENT = getCSS();
      const month = calendar.months[viewingDate.month - 1];
      if (!month) return '<div>Invalid month</div>';

      const daysInWeek = calendar.weeks.daysInWeek;
      const daysInMonth = DateUtils.getDaysInMonth(viewingDate.month, viewingDate.year, calendar);

      // Find what weekday the 1st falls on
      const firstDate = { year: viewingDate.year, month: viewingDate.month, day: 1 };
      const firstAbsDay = DateUtils.toAbsoluteDay(firstDate, calendar);
      const firstWeekday = (firstAbsDay - 1) % daysInWeek;

      let html = '<table style="' + CSS_CURRENT.table + ' table-layout: fixed;">';

      // Weekday header
      html += '<tr>';
      for (let i = 0; i < daysInWeek; i++) {
        const dayName = calendar.weeks.weekdayNames[i] || i;
        html += `<th style="${CSS_CURRENT.tableCell}">${dayName}</th>`;
      }
      html += '</tr>';

      // Render beginning interannual days (only when viewing month 1)
      if (viewingDate.month === 1 && calendar.interannualDays?.length > 0) {
        const beginningDays = DateUtils.getInterannualDaysAtPosition('beginning', calendar);
        for (const day of beginningDays) {
          html += '<tr>';
          const specialDayBg = CSS_CURRENT.calendarDay.includes('2d2d2d') ? '#3d3d3d' : 
                               CSS_CURRENT.calendarDay.includes('eeeeee') ? '#d8d8d8' : 
                               '#e4d4c0';
          html += `<td colspan="${daysInWeek}" style="padding: 8px; text-align: left; background: ${specialDayBg}; border: 2px solid #6a6a6a; font-weight: bold; font-size: 13px; cursor: pointer; padding-left: 15px;">`;
          html += `<a style="text-decoration: none; color: inherit; display: block;" href="!chr --viewinterannual ${viewingDate.year}|${day.position}|${day.order}">`;
          html += `<span style="${CSS_CURRENT.holiday}">${day.name}</span>`;
          html += `</a>`;
          html += `</td>`;
          html += '</tr>';
        }
      }

      // Get special days for this year that break the week cycle (between weeks intercalary days)
      const specialDaysThisYear = DateUtils.getSpecialDaysForYear(viewingDate.year, calendar);
      const betweenWeeksSpecialDays = specialDaysThisYear.filter(sd => 
        sd.breaksWeekCycle && 
        sd.position && 
        sd.position.afterMonth === viewingDate.month
      );

      // Special days that occur BEFORE the month (afterDay = 0)
      const specialDaysBeforeMonth = betweenWeeksSpecialDays.filter(sd => sd.position.afterDay === 0);
      specialDaysBeforeMonth.forEach(sd => {
        html += '<tr>';
        const specialDayBg = CSS_CURRENT.calendarDay.includes('2d2d2d') ? '#3d3d3d' : 
                             CSS_CURRENT.calendarDay.includes('eeeeee') ? '#d8d8d8' : 
                             '#e4d4c0';
        html += `<td colspan="${daysInWeek}" style="padding: 8px; text-align: left; background: ${specialDayBg}; border: 2px solid #6a6a6a; font-weight: bold; font-size: 13px; cursor: pointer; padding-left: 15px;">`;
        html += `<a style="text-decoration: none; color: inherit; display: block;" href="!chr --setspecialday ${viewingDate.year}|${sd.id}">`;
        html += `<span style="${CSS_CURRENT.holiday}">${sd.name}</span>`;
        html += `</a>`;
        html += `</td>`;
        html += '</tr>';
      });

      // Calendar days
      let dayNum = 1;
      let dayCounter = 0;
      let finished = false;

      while (!finished) {
        html += '<tr>';

        for (let weekday = 0; weekday < daysInWeek; weekday++) {
          if (dayCounter < firstWeekday) {
            // Days from previous month
            const prevDate = InterfaceRenderer.getPreviousMonthDay(
              viewingDate, 
              firstWeekday - dayCounter,
              calendar
            );
            html += InterfaceRenderer.renderCalendarCell(prevDate, calendar, true, data);
          } else if (dayNum <= daysInMonth) {
            // Days in current month
            const date = { year: viewingDate.year, month: viewingDate.month, day: dayNum };
            html += InterfaceRenderer.renderCalendarCell(date, calendar, false, data);
            dayNum++;
          } else {
            // Days from next month
            const nextDate = InterfaceRenderer.getNextMonthDay(
              viewingDate,
              dayNum - daysInMonth,
              calendar
            );
            html += InterfaceRenderer.renderCalendarCell(nextDate, calendar, true, data);
            dayNum++;
          }

          dayCounter++;
        }

        html += '</tr>';

        // Check for special days that occur after the last day of this week
        const lastDayRendered = dayNum - 1;
        const specialDaysAfterThisWeek = betweenWeeksSpecialDays.filter(sd => {
          // Find special days where afterDay is within the range of days just rendered
          return sd.position.afterDay > (lastDayRendered - daysInWeek) && 
                 sd.position.afterDay <= lastDayRendered;
        });

        // Sort by afterDay to show in correct order
        specialDaysAfterThisWeek.sort((a, b) => a.position.afterDay - b.position.afterDay);

        // Insert special day rows
        specialDaysAfterThisWeek.forEach(sd => {
          html += '<tr>';
          // Theme-aware background color (slightly lighter than calendar cells)
          const specialDayBg = CSS_CURRENT.calendarDay.includes('2d2d2d') ? '#3d3d3d' : // dark theme
                               CSS_CURRENT.calendarDay.includes('eeeeee') ? '#d8d8d8' : // light theme
                               '#e4d4c0'; // fantasy theme
          html += `<td colspan="${daysInWeek}" style="padding: 8px; text-align: left; background: ${specialDayBg}; border: 2px solid #6a6a6a; font-weight: bold; font-size: 13px; cursor: pointer; padding-left: 15px;">`;
          html += `<a style="text-decoration: none; color: inherit; display: block;" href="!chr --setspecialday ${viewingDate.year}|${sd.id}">`;
          html += `<div>`;
          html += `<span style="${CSS_CURRENT.holiday}">${sd.name}</span>`;
          
          // Get events and notes for this special day
          const specialDayDate = {
            year: viewingDate.year,
            month: sd.position.afterMonth,
            day: sd.position.afterDay + 1
          };
          const sdEvents = data.events.filter(e => 
            e.dateRef.year === specialDayDate.year && 
            e.dateRef.month === specialDayDate.month && 
            e.dateRef.day === specialDayDate.day
          );
          const sdNotes = data.notes.filter(n => 
            n.dateRef.year === specialDayDate.year && 
            n.dateRef.month === specialDayDate.month && 
            n.dateRef.day === specialDayDate.day
          );
          
          // Show events/notes if any
          if (sdEvents.length > 0 || sdNotes.length > 0) {
            html += '<div style="font-size: 11px; margin-top: 5px; font-weight: normal;">';
            sdEvents.forEach(e => {
              html += `• ${e.content.substring(0, 40)}${e.content.length > 40 ? '...' : ''}<br>`;
            });
            sdNotes.forEach(n => {
              html += `• ${n.content.substring(0, 40)}${n.content.length > 40 ? '...' : ''}<br>`;
            });
            html += '</div>';
          }
          
          html += `</div>`;
          html += `</a>`;
          html += `</td>`;
          html += '</tr>';
        });

        if (dayNum > daysInMonth + daysInWeek) {
          finished = true;
        }
      }

      // Special days that occur AFTER the month ends (afterDay >= daysInMonth)
      // But exclude ones already shown during the month
      const shownSpecialDayIds = new Set();
      betweenWeeksSpecialDays.forEach(sd => {
        if (sd.position.afterDay > 0 && sd.position.afterDay <= daysInMonth) {
          shownSpecialDayIds.add(sd.id);
        }
      });
      
      const specialDaysAfterMonth = betweenWeeksSpecialDays.filter(sd => 
        sd.position.afterDay >= daysInMonth && !shownSpecialDayIds.has(sd.id)
      );
      specialDaysAfterMonth.forEach(sd => {
        html += '<tr>';
        const specialDayBg = CSS_CURRENT.calendarDay.includes('2d2d2d') ? '#3d3d3d' : 
                             CSS_CURRENT.calendarDay.includes('eeeeee') ? '#d8d8d8' : 
                             '#e4d4c0';
        html += `<td colspan="${daysInWeek}" style="padding: 8px; text-align: left; background: ${specialDayBg}; border: 2px solid #6a6a6a; font-weight: bold; font-size: 13px; cursor: pointer; padding-left: 15px;">`;
        html += `<a style="text-decoration: none; color: inherit; display: block;" href="!chr --setspecialday ${viewingDate.year}|${sd.id}">`;
        html += `<span style="${CSS_CURRENT.holiday}">${sd.name}</span>`;
        html += `</a>`;
        html += `</td>`;
        html += '</tr>';
      });

      // Render ending interannual days (only when viewing the last month)
      if (viewingDate.month === calendar.months.length && calendar.interannualDays?.length > 0) {
        const endingDays = DateUtils.getInterannualDaysAtPosition('end', calendar);
        for (const day of endingDays) {
          html += '<tr>';
          const specialDayBg = CSS_CURRENT.calendarDay.includes('2d2d2d') ? '#3d3d3d' : 
                               CSS_CURRENT.calendarDay.includes('eeeeee') ? '#d8d8d8' : 
                               '#e4d4c0';
          html += `<td colspan="${daysInWeek}" style="padding: 8px; text-align: left; background: ${specialDayBg}; border: 2px solid #6a6a6a; font-weight: bold; font-size: 13px; cursor: pointer; padding-left: 15px;">`;
          html += `<a style="text-decoration: none; color: inherit; display: block;" href="!chr --viewinterannual ${viewingDate.year}|${day.position}|${day.order}">`;
          html += `<span style="${CSS_CURRENT.holiday}">${day.name}</span>`;
          html += `</a>`;
          html += `</td>`;
          html += '</tr>';
        }
      }

      html += '</table>';
      return html;
    },

    renderCalendarCell: (date, calendar, otherMonth, data) => {
      const CSS_CURRENT = getCSS();
      const currentDate = State.config().currentDate;
      const verboseMode = State.config().verboseCalendar || false;
      const isToday = !otherMonth && 
                      date.year === currentDate.year && 
                      date.month === currentDate.month && 
                      date.day === currentDate.day;
      
      let style = otherMonth ? CSS_CURRENT.calendarDayOtherMonth : 
                  isToday ? CSS_CURRENT.calendarDayToday : 
                  CSS_CURRENT.calendarDay;
      
      const moons = data.moons;
      const holidays = InterfaceRenderer.getHolidaysForDate(date, calendar);
      const weatherCache = data.weather;
      const events = data.events.filter(e => 
        e.dateRef.year === date.year && 
        e.dateRef.month === date.month && 
        e.dateRef.day === date.day
      );
      const notes = data.notes.filter(n => 
        n.dateRef.year === date.year && 
        n.dateRef.month === date.month && 
        n.dateRef.day === date.day
      );
      
      // Find weather for this date
      const weatherForDate = weatherCache.find(w =>
        w.dateRef.year === date.year &&
        w.dateRef.month === date.month &&
        w.dateRef.day === date.day
      );

      let html = `<td style="${style}">`;
      html += `<a style="display: block; text-decoration: none; color: inherit; width: 100%; height: inherit; overflow: hidden;" href="!chr --viewdate ${date.year}|${date.month}|${date.day}">`;
      
      // Weather emoji (float right at top)
      if (weatherForDate) {
        const weatherEmoji = weatherForDate.emoji || WeatherGenerator.getWeatherEmoji(weatherForDate.description);
        html += `<div style="${CSS_CURRENT.emojiCircle}">${weatherEmoji}</div>`;
      }
      
      // Date number - offset by beginning interannual days to show day-of-year
      const beginningInterannualCount = DateUtils.countInterannualDaysAtBeginning(calendar);
      const displayDay = date.day + beginningInterannualCount;
      html += `<div style="font-weight: bold; clear: none;">`;
      html += `${displayDay}`;
      html += `</div>`;

      // Moon phases (sprite-based)
      if (moons && moons.length > 0) {
        const phases = MoonPhaseCalculator.getAllPhases(moons, date, calendar);
        html += '<div style="font-size: 10px; clear: none;">';
        phases.forEach(p => {
          html += p.html;
        });
        html += '</div>';
      }

      // Holidays (larger font, themed color)
      if (holidays.length > 0) {
        html += `<div style="font-size: 10px; font-style: italic; margin-top: 2px; clear: both; ${CSS_CURRENT.holiday}">`;
        html += holidays[0].name; // Show first holiday only
        html += '</div>';
      }

      // Special Days (if "part of week" type)
      const specialDay = DateUtils.isSpecialDay(date.month, date.day, date.year, calendar);
      if (specialDay && !specialDay.breaksWeekCycle) {
        html += `<div style="font-size: 10px; font-style: italic; margin-top: 2px; clear: both; ${CSS_CURRENT.holiday}">`;
        html += specialDay.name;
        html += '</div>';
      }

      // Notes/Events indicator or verbose display
      const hasContent = events.length > 0 || notes.length > 0;
      if (hasContent) {
        if (verboseMode) {
          // Verbose: show actual content with markdown rendered (but compact)
          html += '<div style="font-size: 11px; margin-top: 3px; clear: none;">';
          if (events.length > 0) {
            html += '<strong>Events:</strong><br>';
            events.forEach(e => {
              const rendered = MarkdownParser.renderAsHtml(e.content);
              html += `• ${rendered}<br>`;
            });
          }
          if (notes.length > 0) {
            notes.forEach(n => {
              const rendered = MarkdownParser.renderAsHtml(n.content);
              html += `• ${rendered}<br>`;
            });
          }
          html += '</div>';
        } else {
          // Indicator only
          html += '<div style="font-size: 9px; margin-top: 2px; font-weight: bold; clear: none;">';
          if (events.length > 0) html += `📅 `;
          if (notes.length > 0) html += `📝`;
          html += '</div>';
        }
      }

      html += '</a>'; // Close clickable link
      html += '</td>';
      return html;
    },

    getPreviousMonthDay: (viewingDate, daysBack, calendar) => {
      let month = viewingDate.month - 1;
      let year = viewingDate.year;

      if (month < 1) {
        month = calendar.months.length;
        year--;
      }

      const daysInPrevMonth = DateUtils.getDaysInMonth(month, year, calendar);
      const day = daysInPrevMonth - daysBack + 1;

      return { year, month, day };
    },

    getNextMonthDay: (viewingDate, daysForward, calendar) => {
      let month = viewingDate.month + 1;
      let year = viewingDate.year;

      if (month > calendar.months.length) {
        month = 1;
        year++;
      }

      return { year, month, day: daysForward };
    },

    getHolidaysForDate: (date, calendar) => {
      return calendar.holidays.filter(h => {
        if (h.type === 'absolute') {
          return h.dateRef.month === date.month && h.dateRef.day === date.day;
        }
        // TODO: Handle relative dates
        return false;
      });
    },

    renderDayDetails: (date, calendar, data) => {
      const CSS_CURRENT = getCSS();
      const verbose = State.config().verboseCalendar || false;

      // Check if this is an interannual day
      let isInterannual = false;
      let interannualDayInfo = null;
      if (date.isInterannual) {
        isInterannual = true;
        interannualDayInfo = DateUtils.getInterannualDayFromAbsDay(
          DateUtils.getAbsDayOfInterannualDay(date.position, date.order, calendar),
          calendar
        );
      }

      // Filter events and notes - handle both regular and interannual dates
      const events = data.events.filter(e => {
        if (isInterannual) {
          return e.dateRef.year === date.year && 
                 e.dateRef.isInterannual === true &&
                 e.dateRef.position === date.position &&
                 e.dateRef.order === date.order;
        } else {
          return e.dateRef.year === date.year && 
                 e.dateRef.month === date.month && 
                 e.dateRef.day === date.day;
        }
      });

      const notes = data.notes.filter(n => {
        if (isInterannual) {
          return n.dateRef.year === date.year && 
                 n.dateRef.isInterannual === true &&
                 n.dateRef.position === date.position &&
                 n.dateRef.order === date.order;
        } else {
          return n.dateRef.year === date.year && 
                 n.dateRef.month === date.month && 
                 n.dateRef.day === date.day;
        }
      });

      const weather = data.weather.find(w => {
        if (isInterannual) {
          return w.dateRef.year === date.year &&
                 w.dateRef.isInterannual === true &&
                 w.dateRef.position === date.position &&
                 w.dateRef.order === date.order;
        } else {
          return w.dateRef.year === date.year &&
                 w.dateRef.month === date.month &&
                 w.dateRef.day === date.day;
        }
      });

      // Calculate day of year and month name (handles both regular and interannual)
      let dayOfYear = 0;
      let monthName = '';
      
      if (isInterannual) {
        dayOfYear = DateUtils.getAbsDayOfInterannualDay(date.position, date.order, calendar);
        monthName = ''; // Not applicable for interannual days
      } else {
        const month = calendar.months[date.month - 1];
        monthName = month ? month.name : 'Unknown';
        // Calculate day of year (1-based, counting from month 1 day 1)
        const beginningInterannualCount = DateUtils.countInterannualDaysAtBeginning(calendar);
        for (let m = 1; m < date.month; m++) {
          dayOfYear += DateUtils.getDaysInMonth(m, date.year, calendar);
        }
        dayOfYear += beginningInterannualCount + date.day;
      }

      const daysInYear = DateUtils.getDaysInYear(date.year, calendar);
      const vernal = calendar.seasons.vernalEquinox || 80; // Default to day 80 if not set
      const seasonOffset = Math.floor(daysInYear / 12); // 1/12 of year before equinox/solstice
      
      // Calculate season boundaries (starting 1/12 year before each equinox/solstice)
      const springStart = vernal - seasonOffset;
      const summerStart = vernal + Math.floor(daysInYear / 4) - seasonOffset;
      const autumnStart = vernal + Math.floor(daysInYear / 2) - seasonOffset;
      const winterStart = vernal + Math.floor(3 * daysInYear / 4) - seasonOffset;
      
      let season = 'winter';
      if (dayOfYear >= springStart && dayOfYear < summerStart) {
        season = 'spring';
      } else if (dayOfYear >= summerStart && dayOfYear < autumnStart) {
        season = 'summer';
      } else if (dayOfYear >= autumnStart && dayOfYear < winterStart) {
        season = 'autumn';
      } else {
        season = 'winter';
      }

      let html = '<div style="margin-top: 20px; padding: 10px; background: var(--bg-secondary); border-radius: 5px;">';

      // Display interannual day or regular date
      if (isInterannual && interannualDayInfo) {
        html += `<span style="font-size: 18px; font-weight: bold;">Featured Date: `;
        html += `<a style="${CSS_CURRENT.holiday} text-decoration: underline; cursor: pointer;">${interannualDayInfo.name}</a>`;
        html += `, Year ${date.year}</span>`;
      } else if (date.specialDayId) {
        const specialDay = (calendar.interMonthDays || []).find(sd => sd.id === date.specialDayId);
        if (specialDay) {
          html += `<span style="font-size: 18px; font-weight: bold;">Featured Date: `;
          html += `<a style="${CSS_CURRENT.holiday} text-decoration: underline; cursor: pointer;" href="!chr --specialdaywhisper ${specialDay.id}">${specialDay.name}</a>`;
          html += `, ${date.year}</span>`;
        } else {
          // Regular date with special day ID - apply offset for display
          const beginningInterannualCount = DateUtils.countInterannualDaysAtBeginning(calendar);
          const displayDay = date.day + beginningInterannualCount;
          html += `<span style="font-size: 18px; font-weight: bold;">Featured Date: ${monthName} ${displayDay}, ${date.year}</span>`;
        }
      } else {
        // Regular date - apply offset for display to match grid
        const beginningInterannualCount = DateUtils.countInterannualDaysAtBeginning(calendar);
        const displayDay = date.day + beginningInterannualCount;
        html += `<span style="font-size: 18px; font-weight: bold;">Featured Date: ${monthName} ${displayDay}, ${date.year}</span>`;
      }

      // Control buttons with Roll20 queries
      const verboseMode = State.config().verboseCalendar || false;
      html += '<div style="margin: 10px 0; float:right; display:inline-block;">';
      html += Output.makeButton(verboseMode ? '▼ Hide Details' : '▶ Show Details', `!chr --toggleverbose`, CSS_CURRENT.button);
      html += Output.makeButton('Add Note', `!chr --savenote ?{Note text}`, CSS_CURRENT.button);
      html += Output.makeButton('Add Event', `!chr --saveevent ?{Event text}`, CSS_CURRENT.button);
      html += Output.makeButton('Generate Weather', `!chr --genweather`, CSS_CURRENT.button);
      html += '</div>';


      html += `<p style="font-size: 11px; color: var(--text-secondary);"><em>Season: ${season.charAt(0).toUpperCase() + season.slice(1)} (Day ${dayOfYear} of ${daysInYear})</em></p>`;

      // Holidays
      const holidays = (calendar.holidays || []).filter(h => 
        h.dateRef.month === date.month && 
        h.dateRef.day === date.day
      );
      if (holidays.length > 0) {
        html += '<div style="margin: 10px 0;"><strong>Holidays:</strong> ';
        holidays.forEach((h, idx) => {
          html += `<a style="${CSS_CURRENT.holiday} text-decoration: underline; cursor: pointer;" href="!chr --holidaywhisper ${h.id}">${h.name}</a>`;
          if (idx < holidays.length - 1) html += ', ';
        });
        html += '</div>';
      }

      // Special Days
      const specialDay = DateUtils.isSpecialDay(date.month, date.day, date.year, calendar);
      if (specialDay) {
        html += '<div style="margin: 10px 0;"><strong>Special Day:</strong> ';
        html += `<a style="${CSS_CURRENT.holiday} text-decoration: underline; cursor: pointer;" href="!chr --specialdaywhisper ${specialDay.id}">${specialDay.name}</a>`;
        html += '</div>';
      }

      // Weather
      if (weather) {
        html += '<div style="margin: 10px 0;"><strong>Weather:</strong> ';
        // Show emoji (custom or generated from description) in styled circle
        const weatherEmoji = weather.emoji || WeatherGenerator.getWeatherEmoji(weather.description);
        const emojiStyle = CSS_CURRENT.emojiCircle.replace('float: right;', '').replace('float:right;', '') + 'display: inline-block; vertical-align: middle;';
        html += `<div style="${emojiStyle}">${weatherEmoji}</div>`;
        html += weather.description;
        html += ` (${weather.temperature.value}°${weather.temperature.unit})`;
        html += Output.makeButton('Regenerate', `!chr --regenweather`, CSS_CURRENT.buttonSmall + `margin-left:10px;`);
        html += Output.makeButton('Clear Weather', `!chr --clearweather`, CSS_CURRENT.buttonSmall + `margin-left:5px;`);
        
        // Custom weather button with emoji selection
        const weatherEmojis = [
          '☀️ Clear', '⛅ Partly Cloudy', '☁️ Cloudy', '🌤️ Hazy', '🌫️ Fog/Mist',
          '🌧️ Rain', '🌨️ Light Snow', '❄️ Heavy Snow', '⛈️ Thunderstorm', '🌬️ Windy',
          '🔥 Wildfire', '⚡ Earthquake', '💧 Flood', '☄️ Meteor'
        ];
        let weatherDropdown = '?{Choose Weather and Description|';
        weatherDropdown += weatherEmojis.map(e => {
          const parts = e.split(' ');
          const emoji = parts[0];
          const label = parts.slice(1).join(' ');
          return `${e},${emoji}`;
        }).join('|');
        weatherDropdown += '}|?{Weather Description}';
        weatherDropdown += `|?{Temperature|${weather.temperature.value}}`;
        
        html += Output.makeButton('Custom', 
          `!chr --customweather ${weatherDropdown}`, 
          CSS_CURRENT.buttonSmall + `margin-left:5px;`);
        html += '</div>';
      }

      // Events
      if (events.length > 0) {
        html += '<div style="margin: 10px 0;"><strong>Events:</strong><ul style="list-style-type: none; padding-left: 0;">';
        events.forEach((e, idx) => {
          html += `<li>`;
          
          // Action buttons (always visible) with prepopulated content
          const escapedContent = e.content.replace(/\|/g, '&#124;').replace(/\}/g, '&#125;');
          html += Output.makeButton('Edit', `!chr --editevent ${e.id}|?{New content|${escapedContent}}`, CSS_CURRENT.buttonSmall);
          html += Output.makeButton('Delete', `!chr --deleteevent ${e.id}`, CSS_CURRENT.buttonSmall);
          html += `<a style="${CSS_CURRENT.buttonSmall}" href="!chr --convert ${e.id}|event">↔</a>`;
          html += `<a style="${CSS_CURRENT.buttonSmall}" href="!chr --moveevent ${e.id}|?{New Year|${date.year}}|?{New Month (1-${calendar.months.length})|${date.month}}|?{New Day|${date.day}}">Move</a>`;
          
          // Content
          html += ` ${MarkdownParser.renderAsHtml(e.content, calendar, {featured: true})} `;
          
          // Verbose mode: show creator, tag management, and tags
          if (verbose) {
            // Creator badge
            html += `<span style="${CSS_CURRENT.creator}">${e.createdBy}</span> `;
            
            // Tag management buttons
            html += `<a style="${CSS_CURRENT.tagButton}" href="!chr --addtag ${e.id}|event|?{New tags (comma-separated)}">+</a>`;
            
            // Build tag list for the Ⲷ button
            const allTags = TagSystem.getAllTags(data);
            if (allTags.length > 0) {
              const tagList = allTags.join('|');
              html += `<a style="${CSS_CURRENT.tagButton}" href="!chr --addtag ${e.id}|event|?{Choose from list|${tagList}}">Ⲷ</a>`;
            } else {
              html += `<a style="${CSS_CURRENT.tagButton}" href="!chr --addtag ${e.id}|event|?{New tags (comma-separated)}">Ⲷ</a>`;
            }
            
            // Display existing tags
            if (e.tags && e.tags.length > 0) {
              e.tags.forEach(tag => {
                html += `<a style="${CSS_CURRENT.tag}" href="!chr --edittag ${e.id}|event|${tag}|?{Edit tag &#39;${tag}&#39; (leave blank to delete)|${tag}}">${tag}</a>`;
              });
            }
          }
          
          html += '</li>';
        });
        html += '</ul></div>';
      }

      // Notes
      if (notes.length > 0) {
        html += '<div style="margin: 10px 0;"><strong>Notes:</strong><ul style="list-style-type: none; padding-left: 0;">';
        notes.forEach((n, idx) => {
          html += `<li>`;
          
          // Action buttons (always visible) with prepopulated content
          const escapedContent = n.content.replace(/\|/g, '&#124;').replace(/\}/g, '&#125;');
          html += Output.makeButton('Edit', `!chr --editnote ${n.id}|?{New content|${escapedContent}}`, CSS_CURRENT.buttonSmall);
          html += Output.makeButton('Delete', `!chr --deletenote ${n.id}`, CSS_CURRENT.buttonSmall);
          html += `<a style="${CSS_CURRENT.buttonSmall}" href="!chr --convert ${n.id}|note">↔</a>`;
          html += `<a style="${CSS_CURRENT.buttonSmall}" href="!chr --movenote ${n.id}|?{New Year|${date.year}}|?{New Month (1-${calendar.months.length})|${date.month}}|?{New Day|${date.day}}">Move</a>`;
          
          // Content
          html += ` ${MarkdownParser.renderAsHtml(n.content, calendar, {featured: true})} `;
          
          // Verbose mode: show creator, tag management, and tags
          if (verbose) {
            // Creator badge
            html += `<span style="${CSS_CURRENT.creator}">${n.createdBy}</span> `;
            
            // Tag management buttons
            html += `<a style="${CSS_CURRENT.tagButton}" href="!chr --addtag ${n.id}|note|?{New tags (comma-separated)}">+</a>`;
            
            // Build tag list for the Ⲷ button
            const allTags = TagSystem.getAllTags(data);
            if (allTags.length > 0) {
              const tagList = allTags.join('|');
              html += `<a style="${CSS_CURRENT.tagButton}" href="!chr --addtag ${n.id}|note|?{Choose from list|${tagList}}">Ⲷ</a>`;
            } else {
              html += `<a style="${CSS_CURRENT.tagButton}" href="!chr --addtag ${n.id}|note|?{New tags (comma-separated)}">Ⲷ</a>`;
            }
            
            // Display existing tags
            if (n.tags && n.tags.length > 0) {
              n.tags.forEach(tag => {
                html += `<a style="${CSS_CURRENT.tag}" href="!chr --edittag ${n.id}|note|${tag}|?{Edit tag &#39;${tag}&#39; (leave blank to delete)|${tag}}">${tag}</a>`;
              });
            }
          }
          
          html += '</li>';
        });
        html += '</ul></div>';
      }

      html += '</div>';
      return html;
    },

    renderDesignMode: (data) => {
      const CSS_CURRENT = getCSS();
      const calendar = data.calendar || DataModels.createCalendar('New Calendar');

      let html = '<div style="padding: 10px;">';
      html += '<h2>Calendar Design</h2>';

      // Calendar selection
      html += '<div style="margin: 20px 0;">';
      html += '<strong>Active Calendar:</strong> ' + (calendar.name || 'None');
      html += '<div style="margin-top: 5px;">';
      
      // Built-in calendars
      html += Output.makeButton('Load Gregorian', `!chr --loadcal gregorian`, CSS_CURRENT.button);
      html += Output.makeButton('Load Absalom', `!chr --loadcal absalom`, CSS_CURRENT.button);
      html += Output.makeButton('Load Faerun', `!chr --loadcal faerun`, CSS_CURRENT.button);
      html += Output.makeButton('Load Greyhawk', `!chr --loadcal greyhawk`, CSS_CURRENT.button);
      html += Output.makeButton('Load Eberron', `!chr --loadcal eberron`, CSS_CURRENT.button);
      html += Output.makeButton('Load Traveller', `!chr --loadcal traveller`, CSS_CURRENT.button);
      
      // Find all custom calendar handouts
      const allHandouts = findObjs({ type: 'handout' });
      const presetCalendarNames = [
        HANDOUT_PREFIX + ' Calendar: Gregorian',
        HANDOUT_PREFIX + ' Calendar: Absalom Reckoning',
        HANDOUT_PREFIX + ' Calendar: Faerun',
        HANDOUT_PREFIX + ' Calendar: Greyhawk',
        HANDOUT_PREFIX + ' Calendar: Eberron',
        HANDOUT_PREFIX + ' Calendar: Traveller'
      ];
      
      const customCalendars = allHandouts.filter(h => {
        const name = h.get('name');
        return name.startsWith(HANDOUT_PREFIX + ' Calendar:') && 
               !presetCalendarNames.includes(name);
      });
      
      // Add button for each custom calendar
      customCalendars.forEach(h => {
        const fullName = h.get('name');
        const calName = fullName.replace(HANDOUT_PREFIX + ' Calendar: ', '');
        html += Output.makeButton('Load ' + calName, '!chr --loadcal ' + calName, CSS_CURRENT.button);
      });
      
      html += '<a style="' + CSS_CURRENT.button + '" href="!chr --createnewcal ?{Calendar Name|New Calendar}">New Calendar</a>';
      html += '</div>';
      html += '</div>';

      // Calendar Description
      if (calendar.description) {
        html += '<div style="margin: 20px 0; padding: 10px; background: var(--bg-secondary); font-style: italic; border-left: 3px solid var(--border);">';
        html += '<p>' + calendar.description + '</p>';
        html += Output.makeButton('Edit Description', '!chr --savedescription ?{Calendar Description|' + calendar.description.replace(/'/g, '&#39;').replace(/"/g, '&quot;') + '}', CSS_CURRENT.buttonSmall);
        html += '</div>';
      } else {
        html += '<div style="margin: 20px 0; padding: 10px; background: var(--bg-secondary);">';
        html += '<p><em>No description set.</em></p>';
        html += Output.makeButton('Add Description', '!chr --savedescription ?{Calendar Description}', CSS_CURRENT.buttonSmall);
        html += '</div>';
      }

      // Basic settings
      html += '<div style="margin: 20px 0; padding: 10px; background: var(--bg-secondary);">';
      html += '<h3>Basic Settings</h3>';
      html += `<p><strong>Calendar Name:</strong> ${calendar.name} `;
      html += Output.makeButton('Edit', `!chr --savename ?{Calendar Name|${calendar.name}}`, CSS_CURRENT.buttonSmall);
      html += '</p>';
      html += `<p><strong>Days in Year:</strong> ${calendar.daysInYear} `;
      html += Output.makeButton('Edit', `!chr --savedaysinyear ?{Days in Year|${calendar.daysInYear}}`, CSS_CURRENT.buttonSmall);
      html += '</p>';
      html += `<p><strong>Days in Week:</strong> ${calendar.weeks.daysInWeek} `;
      html += Output.makeButton('Edit', `!chr --savedaysinweek ?{Days in Week|${calendar.weeks.daysInWeek}}`, CSS_CURRENT.buttonSmall);
      html += '</p>';
      html += '</div>';

      // Months
      html += '<div style="margin: 20px 0; padding: 10px; background: var(--bg-secondary);">';
      html += '<h3>Months</h3>';
      if (calendar.months.length === 0) {
        html += '<p><em>No months defined</em></p>';
      } else {
        html += '<table style="' + CSS_CURRENT.table + '">';
        html += '<tr><th>Order</th><th>Name</th><th>Days</th><th>Actions</th></tr>';
        calendar.months.forEach((m, idx) => {
          html += '<tr>';
          html += `<td style="${CSS_CURRENT.tableCell}">${idx + 1}</td>`;
          html += `<td style="${CSS_CURRENT.tableCell}">${m.name}</td>`;
          html += `<td style="${CSS_CURRENT.tableCell}">${m.days}</td>`;
          html += `<td style="${CSS_CURRENT.tableCell}">`;
          
          // Up arrow (disabled for first item)
          if (idx > 0) {
            html += Output.makeButton('↑', `!chr --movemonth ${idx}|up`, CSS_CURRENT.buttonSmall);
          } else {
            html += `<span style="${CSS_CURRENT.buttonSmall} opacity: 0.3; cursor: default;">↑</span>`;
          }
          
          // Down arrow (disabled for last item)
          if (idx < calendar.months.length - 1) {
            html += Output.makeButton('↓', `!chr --movemonth ${idx}|down`, CSS_CURRENT.buttonSmall);
          } else {
            html += `<span style="${CSS_CURRENT.buttonSmall} opacity: 0.3; cursor: default;">↓</span>`;
          }
          
          html += Output.makeButton('Edit', `!chr --updatemonth ${idx}|?{Month Name|${m.name}}|?{Days|${m.days}}`, CSS_CURRENT.buttonSmall);
          html += Output.makeButton('Delete', `!chr --delmonth ${idx}`, CSS_CURRENT.buttonSmall);
          html += '</td>';
          html += '</tr>';
        });
        html += '</table>';
      }
      html += '<div style="margin-top: 5px;">';
      html += Output.makeButton('Add Month', `!chr --savemonth ?{Month Name}|?{Days in Month}`, CSS_CURRENT.button);
      html += '</div>';
      html += '</div>';

      // Weekday names
      html += '<div style="margin: 20px 0; padding: 10px; background: var(--bg-secondary);">';
      html += '<h3>Weekday Names</h3>';
      html += '<p>' + calendar.weeks.weekdayNames.join(', ') + '</p>';
      const weekdayStr = calendar.weeks.weekdayNames.join(',');
      html += Output.makeButton('Edit Weekdays', `!chr --saveweekdays ?{Weekday Names (comma-separated)|${weekdayStr}}`, CSS_CURRENT.button);
      html += '</div>';

      // Holidays
      html += '<div style="margin: 20px 0; padding: 10px; background: var(--bg-secondary);">';
      html += '<h3>Holidays</h3>';
      if (!calendar.holidays || calendar.holidays.length === 0) {
        html += '<p><em>No holidays defined</em></p>';
      } else {
        html += '<table style="' + CSS_CURRENT.table + '">';
        html += '<tr><th>Name</th><th>Date</th><th>Description</th><th>Recurring</th><th>Actions</th></tr>';
        calendar.holidays.forEach((h, idx) => {
          html += '<tr>';
          html += `<td style="${CSS_CURRENT.tableCell}">${h.name}</td>`;
          html += `<td style="${CSS_CURRENT.tableCell}">`;
          if (h.type === 'absolute') {
            html += `${h.dateRef.month}/${h.dateRef.day}`;
          } else {
            html += `Relative`;
          }
          html += `</td>`;
          html += `<td style="${CSS_CURRENT.tableCell}">${h.description || '<em>None</em>'}</td>`;
          html += `<td style="${CSS_CURRENT.tableCell}">${h.recurring ? 'Yes' : 'No'}</td>`;
          html += `<td style="${CSS_CURRENT.tableCell}">`;
          
          // Edit button - edit all fields
          const escapedName = h.name.replace(/\|/g, '&#124;').replace(/\}/g, '&#125;');
          const escapedDesc = (h.description || '').replace(/\|/g, '&#124;').replace(/\}/g, '&#125;');
          const recurringDefault = h.recurring ? 'Yes' : 'No';
          html += Output.makeButton('Edit', 
            `!chr --editholiday ${idx}|?{Holiday Name|${escapedName}}|?{Month (1-12)|${h.dateRef.month}}|?{Day|${h.dateRef.day}}|?{Recurring?|${recurringDefault}|Yes|No}|?{Description|${escapedDesc}}`, 
            CSS_CURRENT.buttonSmall);
          
          // Up/Down arrows
          if (idx > 0) {
            html += Output.makeButton('↑', `!chr --moveholiday ${idx}|up`, CSS_CURRENT.buttonSmall);
          } else {
            html += `<span style="${CSS_CURRENT.buttonSmall} opacity: 0.3; cursor: default;">↑</span>`;
          }
          if (idx < calendar.holidays.length - 1) {
            html += Output.makeButton('↓', `!chr --moveholiday ${idx}|down`, CSS_CURRENT.buttonSmall);
          } else {
            html += `<span style="${CSS_CURRENT.buttonSmall} opacity: 0.3; cursor: default;">↓</span>`;
          }
          
          html += Output.makeButton('Delete', `!chr --deleteholiday ${idx}`, CSS_CURRENT.buttonSmall);
          html += '</td>';
          html += '</tr>';
        });
        html += '</table>';
      }
      html += '<div style="margin-top: 5px;">';
      html += Output.makeButton('Add Holiday', 
        `!chr --addholiday ?{Holiday Name}|?{Month (1-12)}|?{Day}|?{Recurring?|Yes|No}|?{Description (optional)||}`, 
        CSS_CURRENT.button);
      html += '</div>';
      html += '</div>';

      // Special Days
      html += '<div style="margin: 20px 0; padding: 10px; background: var(--bg-secondary);">';
      html += '<h3>Special Days</h3>';
      html += '<p style="font-size: 11px; font-style: italic;">Intercalary days (like Midsummer, leap days) that occur outside normal month/week structure</p>';
      const specialDays = calendar.interMonthDays || [];
      if (specialDays.length === 0) {
        html += '<p><em>No special days defined</em></p>';
      } else {
        html += '<table style="' + CSS_CURRENT.table + '">';
        html += '<tr><th>Name</th><th>Position</th><th>Type</th><th>Week Behavior</th><th>Description</th><th>Actions</th></tr>';
        specialDays.forEach((sd, idx) => {
          html += '<tr>';
          html += `<td style="${CSS_CURRENT.tableCell}">${sd.name}</td>`;
          html += `<td style="${CSS_CURRENT.tableCell}">`;
          if (sd.position && sd.position.afterMonth) {
            const monthName = calendar.months[sd.position.afterMonth - 1]?.name || '?';
            html += `After ${monthName} ${sd.position.afterDay || ''}`;
          } else {
            html += 'Not set';
          }
          html += `</td>`;
          html += `<td style="${CSS_CURRENT.tableCell}">`;
          if (sd.dayType === 'leap') {
            html += `Leap (every ${sd.frequency} yrs)`;
          } else {
            html += 'Fixed';
          }
          html += `</td>`;
          html += `<td style="${CSS_CURRENT.tableCell}">${sd.breaksWeekCycle ? 'Between weeks' : 'Part of week'}</td>`;
          html += `<td style="${CSS_CURRENT.tableCell}">${sd.description || '<em>None</em>'}</td>`;
          html += `<td style="${CSS_CURRENT.tableCell}">`;
          
          // Edit button - direct href
          const escapedName = sd.name.replace(/\|/g, '&#124;').replace(/\}/g, '&#125;');
          const escapedDesc = (sd.description || '').replace(/\|/g, '&#124;').replace(/\}/g, '&#125;');
          
          const currentMonth = calendar.months[sd.position.afterMonth - 1];
          const monthList = calendar.months.map((m, idx) => {
            const num = idx + 1;
            return `${m.name},${num}`;
          }).join('|');
          const monthDefault = `${currentMonth.name},${sd.position.afterMonth}`;
          
          const weekBehaviorDefault = sd.breaksWeekCycle ? 'Between weeks,betweenWeeks' : 'Part of week,partOfWeek';
          
          let editQuery = `!chr --updatespecialday ${idx}|${sd.dayType}|?{Name|${escapedName}}|?{After Which Month?|${monthDefault}|${monthList}}|?{After Which Day?|${sd.position.afterDay}}|?{Week Behavior|${weekBehaviorDefault}|Part of week,partOfWeek|Between weeks,betweenWeeks}`;
          
          if (sd.dayType === 'leap') {
            editQuery += `|?{Frequency|${sd.frequency}}|?{Offset|${sd.offset}}`;
          }
          
          editQuery += `|?{Description|${escapedDesc}}`;
          
          html += `<a style="${CSS_CURRENT.buttonSmall}" href="${editQuery}">Edit</a>`;
          html += Output.makeButton('Delete', `!chr --deletespecialday ${idx}`, CSS_CURRENT.buttonSmall);
          html += '</td>';
          html += '</tr>';
        });
        html += '</table>';
      }
      html += '<div style="margin-top: 5px;">';
      
      // Build month list for special day queries
      const monthList = calendar.months.map((m, idx) => `${m.name},${idx + 1}`).join('|');
      
      // Fixed special day query
      const fixedQuery = `!chr --savespecialday fixed|?{Name}|?{After Which Month?|${monthList}}|?{After Which Day? (0=before month)}|?{Week Behavior|Part of week,partOfWeek|Between weeks,betweenWeeks}|?{Description (optional)|}`;
      html += `<a style="${CSS_CURRENT.button}" href="${fixedQuery}">Add Fixed Special Day</a>`;
      
      // Leap special day query
      const leapQuery = `!chr --savespecialday leap|?{Name}|?{After Which Month?|${monthList}}|?{After Which Day? (0=before month)}|?{Week Behavior|Part of week,partOfWeek|Between weeks,betweenWeeks}|?{Every N years (frequency)|4}|?{Year offset|0}|?{Description (optional)|}`;
      html += `<a style="${CSS_CURRENT.button}" href="${leapQuery}">Add Leap Special Day</a>`;
      
      html += '</div>';
      html += '</div>';

      // Interannual Days
      html += '<div style="margin: 20px 0; padding: 10px; background: var(--bg-secondary);">';
      html += '<h3>Interannual Days (Year Holidays)</h3>';
      const interannualDays = calendar.interannualDays || [];
      
      if (interannualDays.length === 0) {
        html += '<p><em>No interannual days defined</em></p>';
      } else {
        html += '<table style="width: 100%; border-collapse: collapse;">';
        html += '<tr style="background: var(--bg-primary); font-weight: bold;">';
        html += '<td style="padding: 5px; border: 1px solid var(--border);">Position</td>';
        html += '<td style="padding: 5px; border: 1px solid var(--border);">Order</td>';
        html += '<td style="padding: 5px; border: 1px solid var(--border);">Name</td>';
        html += '<td style="padding: 5px; border: 1px solid var(--border);">Actions</td>';
        html += '</tr>';
        
        interannualDays.forEach((day, idx) => {
          const escapedName = day.name.replace(/'/g, "\\'");
          const positionLabel = day.position === 'beginning' ? 'Beginning of Year' : 'End of Year';
          
          html += '<tr>';
          html += `<td style="padding: 5px; border: 1px solid var(--border);">${positionLabel}</td>`;
          html += `<td style="padding: 5px; border: 1px solid var(--border);">${day.order}</td>`;
          html += `<td style="padding: 5px; border: 1px solid var(--border);">${day.name}</td>`;
          html += '<td style="padding: 5px; border: 1px solid var(--border);">';
          
          // Up arrow (move earlier in position)
          if (idx > 0 && interannualDays[idx - 1].position === day.position) {
            html += Output.makeButton('↑', `!chr --moveinterannual ${idx}|up`, CSS_CURRENT.buttonSmall);
          }
          
          // Down arrow (move later in position)
          if (idx < interannualDays.length - 1 && interannualDays[idx + 1].position === day.position) {
            html += Output.makeButton('↓', `!chr --moveinterannual ${idx}|down`, CSS_CURRENT.buttonSmall);
          }
          
          // Edit button
          const editQuery = `!chr --updateinterannual ${idx}|?{Name|${escapedName}}`;
          html += `<a style="${CSS_CURRENT.buttonSmall}" href="${editQuery}">Edit</a>`;
          
          // Delete button
          html += Output.makeButton('Delete', `!chr --deleteinterannual ${idx}`, CSS_CURRENT.buttonSmall);
          html += '</td>';
          html += '</tr>';
        });
        
        html += '</table>';
      }
      
      html += '<div style="margin-top: 5px;">';
      // Add Interannual Day query - embedded in button link
      const interannualQuery = `!chr --addinterannual ?{Name}|?{Position|beginning,end}`;
      html += `<a style="${CSS_CURRENT.button}" href="${interannualQuery}">Add Interannual Day</a>`;
      html += '</div>';
      html += '</div>';
      html += '<div style="margin: 20px 0; padding: 10px; background: var(--bg-secondary);">';
      html += '<h3>Moons</h3>';
      const moons = data.moons;
      if (!moons || moons.length === 0) {
        html += '<p><em>No moons defined</em></p>';
      } else {
        html += '<table style="width: 100%; border-collapse: collapse;">';
        html += '<tr style="background: var(--bg-primary); font-weight: bold;">';
        html += '<td style="padding: 5px; border: 1px solid var(--border);">Name</td>';
        html += '<td style="padding: 5px; border: 1px solid var(--border);">Period</td>';
        html += '<td style="padding: 5px; border: 1px solid var(--border);">Size</td>';
        html += '<td style="padding: 5px; border: 1px solid var(--border);">Color</td>';
        html += '<td style="padding: 5px; border: 1px solid var(--border);">Visible</td>';
        html += '<td style="padding: 5px; border: 1px solid var(--border);">Actions</td>';
        html += '</tr>';
        
        moons.forEach((m, idx) => {
          const size = m.size || 1;
          const color = m.color || 'yellow';
          const display = m.display !== false ? 'Yes' : 'No';
          
          html += '<tr>';
          html += '<td style="padding: 5px; border: 1px solid var(--border);">' + m.name + '</td>';
          html += '<td style="padding: 5px; border: 1px solid var(--border);">' + m.period + 'd</td>';
          html += '<td style="padding: 5px; border: 1px solid var(--border);">' + size + '</td>';
          html += '<td style="padding: 5px; border: 1px solid var(--border);">' + color + '</td>';
          html += '<td style="padding: 5px; border: 1px solid var(--border);">' + display + '</td>';
          html += '<td style="padding: 5px; border: 1px solid var(--border);">';
          
          // Up/Down arrows
          if (idx > 0) {
            html += Output.makeButton('↑', '!chr --movemoon ' + idx + '|up', CSS_CURRENT.buttonSmall);
          }
          if (idx < moons.length - 1) {
            html += Output.makeButton('↓', '!chr --movemoon ' + idx + '|down', CSS_CURRENT.buttonSmall);
          }
          
          html += Output.makeButton('Edit', 
            '!chr --updatemoon ' + idx + '|?{Moon Name|' + m.name + '}|?{Period|' + m.period + '}|?{Full Year|' + m.fullDayRef.year + '}|?{Full Month|' + m.fullDayRef.month + '}|?{Full Day|' + m.fullDayRef.day + '}|?{Size (0.1-1.0)|' + size + '}|?{Color|' + color + ',yellow|red,red|green,green|blue,blue|cyan,cyan|orange,orange|purple,purple|tan,tan|brown,brown|white,white|gray,gray|dark,dark}|?{Display on grid?|' + (m.display !== false ? 'true' : 'false') + ',true|false,false}', 
            CSS_CURRENT.buttonSmall);
          html += Output.makeButton('Delete', '!chr --delmoon ' + idx + '', CSS_CURRENT.buttonSmall);
          
          html += '</td>';
          html += '</tr>';
        });
        
        html += '</table>';
      }
      html += Output.makeButton('Add Moon', 
        '!chr --savemoon ?{Moon Name}|?{Period in Days (decimals OK)|28}|?{Year when full|1}|?{Month when full|1}|?{Day when full|1}|?{Size (0.1-1.0)|1}|?{Color|yellow,yellow|red,red|green,green|blue,blue|cyan,cyan|orange,orange|purple,purple|tan,tan|brown,brown|white,white|gray,gray|dark,dark}|?{Display on grid?|true,true|false,false}', 
        CSS_CURRENT.button);
      html += '</div>';

      // Climate
      html += '<div style="margin: 20px 0; padding: 10px; background: var(--bg-secondary);">';
      html += '<h3>Climate</h3>';
      if (calendar.climate) {
        html += `<p><strong>${calendar.climate.climate_name}</strong> (${calendar.climate.koppen_code})</p>`;
        html += `<p><em>${calendar.climate.biome_hint}</em></p>`;
      } else {
        html += '<p><em>No climate set</em></p>';
      }
      html += Output.makeButton('Set Climate', 
        `!chr --saveclimate ?{Latitude|tropical|subtropical|temperate|subarctic|polar}|?{Ocean Proximity|coastal|near_coastal|inland|continental}|?{Coast Type|west|east|none}|?{Elevation|lowland|highland|alpine}|?{Rainfall Pattern - If nearby mountains affect rainfall choose windward for the wetter side and leeward for the drier side otherwise choose neutral|windward|leeward|neutral}`, 
        CSS_CURRENT.button);
      
      // Climate Override button with dropdown
      const climateOptions = [
        { code: 'Af', name: 'Tropical Rainforest', temp: 'Hot and humid year-round', precip: 'Heavy rainfall in all seasons', biome: 'Dense jungle - diverse wildlife' },
        { code: 'Aw', name: 'Tropical Savanna', temp: 'Hot year-round', precip: 'Distinct wet and dry seasons', biome: 'Grasslands with scattered trees' },
        { code: 'BWh', name: 'Hot Desert', temp: 'Extremely hot days - cool nights', precip: 'Minimal rainfall', biome: 'Sparse vegetation - dunes - arid plains' },
        { code: 'BWk', name: 'Cold Desert', temp: 'Hot summers - cold winters', precip: 'Very low precipitation', biome: 'Rocky terrain - hardy shrubs' },
        { code: 'BSk', name: 'Cold Steppe', temp: 'Warm summers - cold winters', precip: 'Low to moderate precipitation', biome: 'Short grasslands - sparse vegetation' },
        { code: 'BSh', name: 'Hot Steppe', temp: 'Hot summers - mild winters', precip: 'Low precipitation', biome: 'Semi-arid grasslands' },
        { code: 'Csa', name: 'Mediterranean', temp: 'Hot dry summers - mild wet winters', precip: 'Summer drought - winter rain', biome: 'Scrubland - drought-resistant trees' },
        { code: 'Csb', name: 'Warm Mediterranean', temp: 'Warm dry summers - mild wet winters', precip: 'Summer drought - winter rain', biome: 'Mixed forest - chaparral' },
        { code: 'Cfa', name: 'Humid Subtropical', temp: 'Hot summers - mild winters', precip: 'High humidity - frequent storms', biome: 'Mixed forests - broadleaf vegetation' },
        { code: 'Cfb', name: 'Marine West Coast', temp: 'Mild temperatures year-round', precip: 'Frequent rainfall in all seasons', biome: 'Temperate rainforest - dense evergreen vegetation' },
        { code: 'Cfc', name: 'Subpolar Oceanic', temp: 'Cool summers - mild winters', precip: 'Consistent rainfall', biome: 'Coniferous forest - mosses' },
        { code: 'Dfa', name: 'Hot-Summer Humid Continental', temp: 'Hot summers - cold snowy winters', precip: 'Moderate precipitation year-round', biome: 'Deciduous and mixed forests' },
        { code: 'Dfb', name: 'Warm-Summer Humid Continental', temp: 'Warm summers - cold winters', precip: 'Moderate precipitation year-round', biome: 'Deciduous forests - seasonal variation' },
        { code: 'Dfc', name: 'Subarctic', temp: 'Cool summers - very cold winters', precip: 'Low to moderate precipitation', biome: 'Boreal forest - taiga' },
        { code: 'Dfd', name: 'Extreme Subarctic', temp: 'Cool summers - extremely cold winters', precip: 'Low precipitation', biome: 'Sparse boreal forest' },
        { code: 'ET', name: 'Tundra', temp: 'Cold year-round', precip: 'Low precipitation', biome: 'Permafrost - mosses - lichens' },
        { code: 'EF', name: 'Ice Cap', temp: 'Extremely cold year-round', precip: 'Minimal precipitation', biome: 'Permanent ice and snow' }
      ];
      
      let climateDropdown = '?{Choose a specific Climate|';
      climateDropdown += climateOptions.map(c => 
        `${c.code} ${c.name} - ${c.temp} - ${c.precip} - ${c.biome},${c.code}`
      ).join('|');
      climateDropdown += '}';
      
      html += Output.makeButton('Override Climate', 
        `!chr --overrideclimate ${climateDropdown}`, 
        CSS_CURRENT.buttonSmall);
      
      // Temperature units toggle
      const currentUnits = calendar.units || 'us';
      const unitsLabel = currentUnits === 'us' ? 'F' : 'C';
      html += Output.makeButton(`Units: ${unitsLabel}`, `!chr --toggleunits`, CSS_CURRENT.buttonSmall);
      
      html += '</div>';

      // Seasons
      html += '<div style="margin: 20px 0; padding: 10px; background: var(--bg-secondary);">';
      html += '<h3>Seasons & Equinoxes</h3>';
      html += `<p><strong>Vernal Equinox:</strong> Day ${calendar.seasons.vernalEquinox} of ${calendar.daysInYear} `;
      html += Output.makeButton('Edit', 
        `!chr --setvernalequinox ?{Day of Year for Vernal Equinox|${calendar.seasons.vernalEquinox}}`, 
        CSS_CURRENT.buttonSmall);
      html += '</p>';
      
      // Calculate and display the other seasonal points
      const vernal = calendar.seasons.vernalEquinox;
      const daysInYear = calendar.daysInYear;
      const summer = vernal + Math.floor(daysInYear / 4);
      const autumnal = vernal + Math.floor(daysInYear / 2);
      const winter = vernal + Math.floor(3 * daysInYear / 4);
      
      html += `<p><em>Based on this setting:</em></p>`;
      html += `<ul style="font-size: 11px;">`;
      html += `<li>Spring Equinox (Vernal): Day ${vernal}</li>`;
      html += `<li>Summer Solstice: Day ${summer}</li>`;
      html += `<li>Autumn Equinox: Day ${autumnal}</li>`;
      html += `<li>Winter Solstice: Day ${winter}</li>`;
      html += `</ul>`;
      html += '<p style="font-size: 10px; font-style: italic;">These points divide the year into four equal seasons for weather generation.</p>';
      html += '</div>';

      // Leap Years
      html += '<div style="margin: 20px 0; padding: 10px; background: var(--bg-secondary);">';
      html += '<h3>Leap Years</h3>';
      html += `<p><strong>Enabled:</strong> ${calendar.leapYears.enabled ? 'Yes' : 'No'} `;
      html += Output.makeButton('Toggle', `!chr --toggleleap`, CSS_CURRENT.buttonSmall);
      html += '</p>';
      
      if (calendar.leapYears.enabled) {
        html += `<p><strong>Cycle:</strong> Every ${calendar.leapYears.cycle} years `;
        html += Output.makeButton('Edit', 
          `!chr --setleapcycle ?{Leap Year Cycle|${calendar.leapYears.cycle}}`, 
          CSS_CURRENT.buttonSmall);
        html += '</p>';
        
        html += '<p><strong>Exception Years:</strong> ';
        if (calendar.leapYears.exceptions && calendar.leapYears.exceptions.length > 0) {
          calendar.leapYears.exceptions.forEach((year, idx) => {
            html += `${year} `;
            html += Output.makeButton('✖', 
              `!chr --removeleapexception ${idx}`, 
              CSS_CURRENT.buttonSmall);
            html += ' ';
          });
        } else {
          html += '<em>None</em>';
        }
        html += '</p>';
        html += '<div style="margin-top: 5px;">';
        html += Output.makeButton('Add Exception Year', 
          `!chr --addleapexception ?{Year to Exclude from Leap Years}`, 
          CSS_CURRENT.button);
        html += '</div>';
        
        html += `<p style="font-size: 10px; font-style: italic; margin-top: 10px;">When enabled, adds 1 day to the year every ${calendar.leapYears.cycle} years (except exception years). February typically receives the extra day in Gregorian-style calendars.</p>`;
      }
      html += '</div>';

      html += '</div>';
      return html;
    },

    renderTimelineMode: (data) => {
      const CSS_CURRENT = getCSS();
      const calendar = data.calendar;
      const events = data.events;
      const notes = data.notes;
      const holidays = calendar.holidays || [];
      
      // Get timeline state from State config (create if doesn't exist)
      const timelineState = State.config().timelineState || {
        selectedTags: [],
        tagMode: 'OR', // 'OR' or 'AND'
        showEvents: true,
        showNotes: true,
        showHolidays: false,
        showWeather: false,
        showDetails: false,
        showUntagged: false, // Show items with no tags
        startYear: null,
        endYear: null,
        sortAscending: true
      };
      
      // Get all unique tags
      const allTags = TagSystem.getAllTags(data);
      
      // Build pipe-separated tag list for queries
      const tagQueryString = Array.from(allTags).sort().join('|');
      
      let html = '<table style="width: 100%; height: 100%; border-collapse: collapse;"><tr>';
      
      // ===== LEFT SIDEBAR =====
      html += '<td style="width: 250px; padding: 10px; border-right: 1px solid #555555; vertical-align: top;">';
      
      // Type toggles
      html += '<div style="margin-bottom: 15px;">';
      html += '<strong style="font-size: 11px;">Type:</strong><br>';
      html += Output.makeButton(
        timelineState.showEvents ? '✓ Events' : 'Events',
        `!chr --tl-toggle event`,
        timelineState.showEvents ? CSS_CURRENT.button : CSS_CURRENT.buttonSmall
      );
      html += Output.makeButton(
        timelineState.showNotes ? '✓ Notes' : 'Notes',
        `!chr --tl-toggle note`,
        timelineState.showNotes ? CSS_CURRENT.button : CSS_CURRENT.buttonSmall
      );
      html += Output.makeButton(
        timelineState.showHolidays ? '✓ Holidays' : 'Holidays',
        `!chr --tl-toggle holiday`,
        timelineState.showHolidays ? CSS_CURRENT.button : CSS_CURRENT.buttonSmall
      );
      html += Output.makeButton(
        timelineState.showWeather ? '✓ Weather' : 'Weather',
        `!chr --tl-toggle weather`,
        timelineState.showWeather ? CSS_CURRENT.button : CSS_CURRENT.buttonSmall
      );
      html += '</div>';
      
      // Show Details toggle
      html += '<div style="margin-bottom: 15px;">';
      html += Output.makeButton(
        timelineState.showDetails ? '▼ Hide Details' : '▶ Show Details',
        `!chr --tl-toggle details`,
        timelineState.showDetails ? CSS_CURRENT.button : CSS_CURRENT.buttonSmall
      );
      html += '</div>';
      
      // Date range controls
      html += '<div style="margin-bottom: 15px;">';
      html += '<strong style="font-size: 11px;">Date Range:</strong> ';
      
      const startYearText = timelineState.startYear || '---';
      html += `<a style="${CSS_CURRENT.buttonSmall}" href="!chr --tl-startyear ?{Earliest year to display|}">`;
      html += startYearText;
      html += `</a>`;
      
      html += Output.makeButton('All', `!chr --tl-clearrange`, CSS_CURRENT.buttonSmall);
      
      const endYearText = timelineState.endYear || '---';
      html += `<a style="${CSS_CURRENT.buttonSmall}" href="!chr --tl-endyear ?{Latest year to display|}">`;
      html += endYearText;
      html += `</a>`;
      
      // Sort toggle
      const sortIcon = timelineState.sortAscending ? '↓' : '↑';
      html += Output.makeButton(sortIcon, `!chr --tl-togglesort`, CSS_CURRENT.buttonSmall);
      
      html += '</div>';
      
      // Tag mode toggle
      html += '<div style="margin-bottom: 15px;">';
      html += '<strong style="font-size: 11px;">Tag Mode:</strong> ';
      html += Output.makeButton(
        timelineState.tagMode === 'OR' ? 'ANY (OR)' : 'ALL (AND)',
        `!chr --tl-togglemode`,
        CSS_CURRENT.buttonSmall
      );
      html += '</div>';
      
      // Select All / Deselect All buttons
      if (allTags.length > 0) {
        html += '<div style="margin-bottom: 15px;">';
        if (timelineState.selectedTags.length === allTags.length) {
          html += Output.makeButton('Deselect All', `!chr --tl-deselectall`, CSS_CURRENT.buttonSmall);
        } else if (timelineState.selectedTags.length === 0) {
          html += Output.makeButton('Select All', `!chr --tl-selectall`, CSS_CURRENT.buttonSmall);
        } else {
          html += Output.makeButton('Select All', `!chr --tl-selectall`, CSS_CURRENT.buttonSmall);
          html += Output.makeButton('Deselect All', `!chr --tl-deselectall`, CSS_CURRENT.buttonSmall);
        }
        html += '</div>';
      }
      
      // Tag list
      html += '<div style="margin-bottom: 5px;"><strong style="font-size: 11px;">Tags:</strong></div>';
      html += '<div style="margin-top: 5px;">';
      
      if (allTags.length === 0) {
        html += '<div style="font-size: 10px; font-style: italic; color: #888888;">No tags yet</div>';
      } else {
        allTags.forEach(tag => {
          const isSelected = timelineState.selectedTags.includes(tag);
          let tagStyle = CSS_CURRENT.tag;
          
          if (isSelected) {
            // Different color based on AND/OR mode
            if (timelineState.tagMode === 'OR') {
              // OR mode - blue/highlighted
              tagStyle = 'display: inline-block; padding: 2px 5px; margin: 0 2px; background: #4a7ac2; color: #ffffff; border-radius: 20px; text-decoration: none; cursor: pointer; font-size: 9px; font-weight: bold;';
            } else {
              // AND mode - green/highlighted
              tagStyle = 'display: inline-block; padding: 2px 5px; margin: 0 2px; background: #5a9f5a; color: #ffffff; border-radius: 20px; text-decoration: none; cursor: pointer; font-size: 9px; font-weight: bold;';
            }
          }
          
          html += '<a style="' + tagStyle + '" href="!chr --tl-toggletag ' + tag + '">' + tag + '</a> ';
        });
      }
      
      // Add "Untagged" filter
      html += '<div style="margin-top: 10px;">';
      const showUntagged = timelineState.showUntagged || false;
      const untaggedStyle = showUntagged ? 
        'display: inline-block; padding: 2px 5px; margin: 0 2px; background: #888888; color: #ffffff; border-radius: 20px; text-decoration: none; cursor: pointer; font-size: 9px; font-weight: bold;' : 
        CSS_CURRENT.tag;
      html += '<a style="' + untaggedStyle + '" href="!chr --tl-toggleuntagged">[Untagged]</a>';
      html += '</div>';
      
      html += '</div>';
      html += '</td>'; // End left sidebar
      
      // ===== RIGHT CONTENT AREA =====
      html += '<td style="padding: 10px; vertical-align: top;">';
      
      if (timelineState.selectedTags.length === 0 && !timelineState.showUntagged) {
        html += '<div style="padding: 20px; text-align: center; color: #888888;">';
        html += 'Select one or more tags to view timeline';
        html += '</div>';
      } else {
        // Filter items based on selected tags, tag mode, and untagged filter
        let filteredItems = [];
        
        // Add events if toggled on
        if (timelineState.showEvents) {
          events.forEach(e => {
            let shouldInclude = false;
            
            // Check if item has tags
            const hasTags = e.tags && e.tags.length > 0;
            
            // Show item if ANY of these conditions are true:
            // 1. showUntagged is ON and item has NO tags
            if (timelineState.showUntagged && !hasTags) {
              shouldInclude = true;
            }
            // 2. tags are selected and item matches them
            if (timelineState.selectedTags.length > 0 && hasTags) {
              const matches = timelineState.tagMode === 'OR'
                ? e.tags.some(t => timelineState.selectedTags.includes(t))
                : timelineState.selectedTags.every(t => e.tags.includes(t));
              if (matches) shouldInclude = true;
            }
            // 3. NO filters active - show all items
            if (timelineState.selectedTags.length === 0 && !timelineState.showUntagged) {
              shouldInclude = true;
            }
            
            if (shouldInclude) {
              filteredItems.push({
                type: 'event',
                date: e.dateRef,
                content: e.content,
                item: e
              });
            }
          });
        }
        
        // Add notes if toggled on
        if (timelineState.showNotes) {
          notes.forEach(n => {
            let shouldInclude = false;
            
            // Check if item has tags
            const hasTags = n.tags && n.tags.length > 0;
            
            // Show item if ANY of these conditions are true:
            // 1. showUntagged is ON and item has NO tags
            if (timelineState.showUntagged && !hasTags) {
              shouldInclude = true;
            }
            // 2. tags are selected and item matches them
            if (timelineState.selectedTags.length > 0 && hasTags) {
              const matches = timelineState.tagMode === 'OR'
                ? n.tags.some(t => timelineState.selectedTags.includes(t))
                : timelineState.selectedTags.every(t => n.tags.includes(t));
              if (matches) shouldInclude = true;
            }
            // 3. NO filters active - show all items
            if (timelineState.selectedTags.length === 0 && !timelineState.showUntagged) {
              shouldInclude = true;
            }
            
            if (shouldInclude) {
              filteredItems.push({
                type: 'note',
                date: n.dateRef,
                content: n.content,
                item: n // Store full object
              });
            }
          });
        }
        
        // Find date range of filtered items
        if (filteredItems.length > 0) {
          const sortedItems = [...filteredItems].sort((a, b) => {
            const aAbs = DateUtils.toAbsoluteDay(a.date, calendar);
            const bAbs = DateUtils.toAbsoluteDay(b.date, calendar);
            return aAbs - bAbs;
          });
          
          const earliestDate = sortedItems[0].date;
          const latestDate = sortedItems[sortedItems.length - 1].date;
          
          // Calculate year span
          const yearSpan = latestDate.year - earliestDate.year;
          
          // Add holidays if toggled on, within range, AND span is one year or less
          if (timelineState.showHolidays && yearSpan <= 1) {
            holidays.forEach(h => {
              // Check if holiday falls within the date range of filtered items
              const holidayDate = { year: earliestDate.year, month: h.dateRef.month, day: h.dateRef.day };
              
              // Check each year in range
              for (let year = earliestDate.year; year <= latestDate.year; year++) {
                const hDate = { year: year, month: h.dateRef.month, day: h.dateRef.day };
                const hAbs = DateUtils.toAbsoluteDay(hDate, calendar);
                const earlyAbs = DateUtils.toAbsoluteDay(earliestDate, calendar);
                const lateAbs = DateUtils.toAbsoluteDay(latestDate, calendar);
                
                if (hAbs >= earlyAbs && hAbs <= lateAbs) {
                  filteredItems.push({
                    type: 'holiday',
                    date: hDate,
                    content: h.name
                  });
                }
              }
            });
            
            // Add special days if toggled on
            const specialDays = calendar.interMonthDays || [];
            specialDays.forEach(sd => {
              // Check each year in range
              for (let year = earliestDate.year; year <= latestDate.year; year++) {
                // Check if this special day occurs in this year (leap day logic)
                const specialDaysForYear = DateUtils.getSpecialDaysForYear(year, calendar);
                if (specialDaysForYear.find(s => s.id === sd.id)) {
                  const sdDate = { year: year, month: sd.position.afterMonth, day: sd.position.afterDay + 1 };
                  const sdAbs = DateUtils.toAbsoluteDay(sdDate, calendar);
                  const earlyAbs = DateUtils.toAbsoluteDay(earliestDate, calendar);
                  const lateAbs = DateUtils.toAbsoluteDay(latestDate, calendar);
                  
                  if (sdAbs >= earlyAbs && sdAbs <= lateAbs) {
                    filteredItems.push({
                      type: 'specialday',
                      date: sdDate,
                      content: sd.name,
                      specialDayId: sd.id
                    });
                  }
                }
              }
            });
          }
        }
        
        // Add weather if toggled on
        if (timelineState.showWeather) {
          const weather = data.weather || [];
          weather.forEach(w => {
            filteredItems.push({
              type: 'weather',
              date: w.dateRef,
              content: `${w.description} (${w.temperature.value}°${w.temperature.unit})`,
              item: w
            });
          });
        }
        
        // Apply year range filter
        if (timelineState.startYear) {
          filteredItems = filteredItems.filter(item => item.date.year >= timelineState.startYear);
        }
        if (timelineState.endYear) {
          filteredItems = filteredItems.filter(item => item.date.year <= timelineState.endYear);
        }
        
        // Sort by date
        filteredItems.sort((a, b) => {
          const aAbs = DateUtils.toAbsoluteDay(a.date, calendar);
          const bAbs = DateUtils.toAbsoluteDay(b.date, calendar);
          return timelineState.sortAscending ? aAbs - bAbs : bAbs - aAbs;
        });
        
        if (filteredItems.length === 0) {
          html += '<div style="padding: 20px; text-align: center; color: #888888;">';
          html += 'No items match the selected filters';
          html += '</div>';
        } else {
          // Group items by date AND sort by proper date order
          const itemsByDate = {};
          filteredItems.forEach(item => {
            // Create a key that works for both regular and interannual dates
            let key;
            if (item.date.isInterannual) {
              key = `${item.date.year}-interannual-${item.date.position}-${item.date.order}`;
            } else {
              key = `${item.date.year}-${item.date.month}-${item.date.day}`;
            }
            if (!itemsByDate[key]) {
              // Calculate sortKey specially to account for interannual days coming first
              let sortKey;
              if (item.date.isInterannual) {
                // Interannual days: calculate year + their position in year
                let yearDays = 0;
                if (item.date.year > 1) {
                  for (let y = 1; y < item.date.year; y++) {
                    yearDays += DateUtils.getDaysInYear(y, calendar);
                  }
                }
                const absDayInYear = DateUtils.getAbsDayOfInterannualDay(item.date.position, item.date.order, calendar);
                sortKey = yearDays + absDayInYear;
              } else {
                // Regular dates: add beginning interannual count so they come after those days
                const beginningInterannualCount = DateUtils.countInterannualDaysAtBeginning(calendar);
                sortKey = DateUtils.toAbsoluteDay(item.date, calendar) + beginningInterannualCount;
              }
              
              itemsByDate[key] = {
                date: item.date,
                items: [],
                sortKey: sortKey
              };
            }
            itemsByDate[key].items.push(item);
          });
          
          // Convert to array and sort by absolute day (this is the key fix!)
          const sortedDates = Object.values(itemsByDate).sort((a, b) => 
            timelineState.sortAscending ? a.sortKey - b.sortKey : b.sortKey - a.sortKey
          );
          
          // Render timeline table
          html += '<table style="width: 100%; border-collapse: collapse; border: none;">';
          
          let lastYear = null;
          let lastMonth = null;
          
          sortedDates.forEach(entry => {
            const d = entry.date;
            const month = d.isInterannual ? null : calendar.months[d.month - 1];
            const monthName = d.isInterannual ? '' : (month ? month.name : 'Unknown');
            
            // Calculate weekday (interannual days have no weekday)
            let weekdayName = '';
            if (!d.isInterannual) {
              const absDay = DateUtils.toAbsoluteDay(d, calendar);
              const weekdayIndex = (absDay - 1) % calendar.weeks.daysInWeek;
              weekdayName = calendar.weeks.weekdayNames[weekdayIndex] || 'Day';
            }
            
            // Check if only events (no notes or holidays)
            const hasOnlyEvents = entry.items.every(item => item.type === 'event');
            
            html += '<tr style="vertical-align: top;">';
            
            // Date column - theme-aware colors, clickable
            html += `<td style="padding: 5px 15px 5px 0; width: 150px; font-size: 11px; border: none; cursor: pointer;">`;
            
            // Create link based on date type
            let dateLink;
            if (d.isInterannual) {
              dateLink = `!chr --viewinterannual ${d.year}|${d.position}|${d.order}`;
            } else {
              dateLink = `!chr --viewdate ${d.year}|${d.month}|${d.day}`;
            }
            html += `<a style="text-decoration: none; color: inherit; display: block;" href="${dateLink}">`;
            
            if (d.year !== lastYear) {
              html += `<strong style="font-size: 13px;">${d.year}</strong><br>`;
              lastYear = d.year;
              lastMonth = null; // Reset month when year changes
            }
            
            // Display date information based on type
            if (d.isInterannual) {
              // For interannual days, find and display the name
              const interannualDay = DateUtils.getInterannualDayFromAbsDay(
                DateUtils.getAbsDayOfInterannualDay(d.position, d.order, calendar),
                calendar
              );
              if (interannualDay) {
                html += `<span style="${CSS_CURRENT.holiday}">${interannualDay.name}</span>`;
              }
            } else {
              // For regular dates, show month and day
              if (!hasOnlyEvents) {
                if (d.month !== lastMonth) {
                  html += `<strong>${monthName}</strong><br>`;
                  lastMonth = d.month;
                }
                
                html += `<span>${weekdayName} ${d.day}</span>`;
              }
            }
            html += '</a>';
            html += '</td>';
            
            // Content column
            html += '<td style="padding: 5px 0; font-size: 12px; border: none;">';
            
            entry.items.forEach(item => {
              if (item.type === 'holiday') {
                html += `<div style="margin-bottom: 3px;"><strong style="${CSS_CURRENT.holiday}">Holiday:</strong> ${item.content}</div>`;
              } else if (item.type === 'specialday') {
                html += `<div style="margin-bottom: 3px;"><a style="${CSS_CURRENT.holiday} text-decoration: underline; cursor: pointer;" href="!chr --setspecialday ${item.date.year}|${item.specialDayId}">${item.content}</a></div>`;
              } else if (item.type === 'weather') {
                html += `<div style="margin-bottom: 3px;"><strong>Weather:</strong> ${item.content}</div>`;
              } else if (item.type === 'event' && timelineState.showDetails && item.item) {
                // Show event with action buttons and tags
                const e = item.item;
                const escapedContent = e.content.replace(/\|/g, '&#124;').replace(/\}/g, '&#125;');
                
                // Calculate elapsed time from the viewing date (currentDate)
                const viewingDate = State.config().currentDate || { year: 1, month: 1, day: 1 };
                const elapsed = DateUtils.getElapsedTime(viewingDate, e.dateRef, calendar);
                let elapsedText = '';
                if (elapsed.isFirstOfYear) {
                  elapsedText = (elapsed.isNegative ? '-' : '') + elapsed.years + 'y';
                } else {
                  if (elapsed.years > 0) elapsedText += elapsed.years + 'y.';
                  if (elapsed.months > 0 || elapsed.years > 0) elapsedText += elapsed.months + 'm.';
                  elapsedText += elapsed.days + 'd';
                  if (elapsed.isNegative) elapsedText = '-' + elapsedText;
                }
                
                html += `<div style="margin-bottom: 8px; padding: 5px; background: var(--bg-secondary); border-left: 3px solid ${CSS_CURRENT.holiday};">`;
                html += '<div style="margin-bottom: 5px;">';
                html += e.content;
                // Elapsed time button floating right
                html += `<a style="${CSS_CURRENT.tag} float: right;" href="!chr --setfeatureddate ${e.dateRef.year}|${e.dateRef.month}|${e.dateRef.day}">${elapsedText}</a>`;
                html += '</div>';
                
                // Buttons and tags on same line
                html += '<div>';
                html += Output.makeButton('Edit', `!chr --editevent ${e.id}|?{New content|${escapedContent}}`, CSS_CURRENT.buttonSmall);
                html += Output.makeButton('Delete', `!chr --deleteevent ${e.id}`, CSS_CURRENT.buttonSmall);
                html += `<a style="${CSS_CURRENT.buttonSmall}" href="!chr --convert ${e.id}|event">↔</a>`;
                html += `<a style="${CSS_CURRENT.buttonSmall}" href="!chr --moveevent ${e.id}|?{New Year|${e.dateRef.year}}|?{New Month (1-${calendar.months.length})|${e.dateRef.month}}|?{New Day|${e.dateRef.day}}">Move</a>`;
                html += `<a style="${CSS_CURRENT.buttonSmall}" href="!chr --addtag ${e.id}|event|?{Tag|${tagQueryString}}">+Tag</a>`;
                if (e.tags && e.tags.length > 0) {
                  html += ' ';
                  e.tags.forEach(tag => {
                    const tagState = timelineState.selectedTags.includes(tag) ? 'active' : 'inactive';
                    html += `<a style="${CSS_CURRENT.tag}" href="!chr --edittag ${e.id}|event|${tag}|?{Edit tag &#39;${tag}&#39; (leave blank to delete)|${tag}}">${tag}</a>`;
                  });
                }
                html += '</div>';
                html += '</div>';
              } else if (item.type === 'note' && timelineState.showDetails && item.item) {
                // Show note with action buttons and tags
                const n = item.item;
                const escapedContent = n.content.replace(/\|/g, '&#124;').replace(/\}/g, '&#125;');
                
                // Calculate elapsed time from the viewing date (currentDate)
                const viewingDate = State.config().currentDate || { year: 1, month: 1, day: 1 };
                const elapsed = DateUtils.getElapsedTime(viewingDate, n.dateRef, calendar);
                let elapsedText = '';
                if (elapsed.isFirstOfYear) {
                  elapsedText = (elapsed.isNegative ? '-' : '') + elapsed.years + 'y';
                } else {
                  if (elapsed.years > 0) elapsedText += elapsed.years + 'y.';
                  if (elapsed.months > 0 || elapsed.years > 0) elapsedText += elapsed.months + 'm.';
                  elapsedText += elapsed.days + 'd';
                  if (elapsed.isNegative) elapsedText = '-' + elapsedText;
                }
                
                html += `<div style="margin-bottom: 8px; padding: 5px; background: var(--bg-secondary); border-left: 3px solid #888;">`;
                html += '<div style="margin-bottom: 5px;">';
                html += n.content;
                // Elapsed time button floating right
                html += `<a style="${CSS_CURRENT.tag} float: right;" href="!chr --setfeatureddate ${n.dateRef.year}|${n.dateRef.month}|${n.dateRef.day}">${elapsedText}</a>`;
                html += '</div>';
                
                // Buttons and tags on same line
                html += '<div>';
                html += Output.makeButton('Edit', `!chr --editnote ${n.id}|?{New content|${escapedContent}}`, CSS_CURRENT.buttonSmall);
                html += Output.makeButton('Delete', `!chr --deletenote ${n.id}`, CSS_CURRENT.buttonSmall);
                html += `<a style="${CSS_CURRENT.buttonSmall}" href="!chr --convert ${n.id}|note">↔</a>`;
                html += `<a style="${CSS_CURRENT.buttonSmall}" href="!chr --movenote ${n.id}|?{New Year|${n.dateRef.year}}|?{New Month (1-${calendar.months.length})|${n.dateRef.month}}|?{New Day|${n.dateRef.day}}">Move</a>`;
                html += `<a style="${CSS_CURRENT.buttonSmall}" href="!chr --addtag ${n.id}|note|?{Tag|${tagQueryString}}">+Tag</a>`;
                if (n.tags && n.tags.length > 0) {
                  html += ' ';
                  n.tags.forEach(tag => {
                    const tagState = timelineState.selectedTags.includes(tag) ? 'active' : 'inactive';
                    html += `<a style="${CSS_CURRENT.tag}" href="!chr --edittag ${n.id}|note|${tag}|?{Edit tag &#39;${tag}&#39; (leave blank to delete)|${tag}}">${tag}</a>`;
                  });
                }
                html += '</div>';
                html += '</div>';
              } else {
                // Simple display - just content with elapsed time button
                const viewingDate = State.config().currentDate || { year: 1, month: 1, day: 1 };
                const elapsed = DateUtils.getElapsedTime(viewingDate, item.date, calendar);
                let elapsedText = '';
                if (elapsed.isFirstOfYear) {
                  elapsedText = (elapsed.isNegative ? '-' : '') + elapsed.years + 'y';
                } else {
                  if (elapsed.years > 0) elapsedText += elapsed.years + 'y.';
                  if (elapsed.months > 0 || elapsed.years > 0) elapsedText += elapsed.months + 'm.';
                  elapsedText += elapsed.days + 'd';
                  if (elapsed.isNegative) elapsedText = '-' + elapsedText;
                }
                
                html += '<div style="margin-bottom: 3px; position: relative;">';
                html += item.content;
                html += `<a style="${CSS_CURRENT.tag} float: right; margin-left: 10px;" href="!chr --setfeatureddate ${item.date.year}|${item.date.month}|${item.date.day}">${elapsedText}</a>`;
                html += '</div>';
              }
            });
            
            html += '</td>';
            html += '</tr>';
          });
          
          html += '</table>';
        }
      }
      
      html += '</td>'; // End content area
      html += '</tr></table>'; // End outer table
      
      return html;
    }

  };

  // ==================================================
  // Commands (Single Root)
  // ==================================================

  const Commands = {

    root: (msg, parsed) => {
      const { args } = parsed;

      if (args.help) {
        return Commands.help(msg);
      }

      if (args.init) {
        return Commands.initialize(msg, args);
      }

      if (args.mode) {
        return Commands.setMode(msg, args.mode);
      }

      if (args.theme) {
        return Commands.setTheme(msg, args.theme);
      }

      if (args.loadcal) {
        return Commands.loadCalendar(msg, args.loadcal);
      }

      if (args.prevmonth) {
        return Commands.previousMonth(msg);
      }

      if (args.nextmonth) {
        return Commands.nextMonth(msg);
      }

      if (args.prevday) {
        return Commands.previousDay(msg);
      }

      if (args.nextday) {
        return Commands.nextDay(msg);
      }

      if (args.prevyear) {
        return Commands.previousYear(msg);
      }

      if (args.nextyear) {
        return Commands.nextYear(msg);
      }

      if (args.gototoday) {
        return Commands.goToToday(msg);
      }

      if (args.settoday) {
        return Commands.setToday(msg);
      }

      if (args.toggleverbose) {
        return Commands.toggleVerbose(msg);
      }

      if (args.editevent) {
        return Commands.editEvent(msg, args.editevent);
      }

      if (args.deleteevent) {
        return Commands.deleteEvent(msg, args.deleteevent);
      }

      if (args.editnote) {
        return Commands.editNote(msg, args.editnote);
      }

      if (args.deletenote) {
        return Commands.deleteNote(msg, args.deletenote);
      }

      if (args.convert) {
        return Commands.convertItem(msg, args.convert);
      }

      if (args.moveevent) {
        return Commands.moveEvent(msg, args.moveevent);
      }

      if (args.movenote) {
        return Commands.moveNote(msg, args.movenote);
      }

      if (args.pickmonth) {
        return Commands.pickMonth(msg);
      }

      if (args.pickyear) {
        return Commands.pickYear(msg);
      }

      if (args.jumptomonth) {
        return Commands.jumpToMonth(msg, args.jumptomonth);
      }

      if (args.jumptoyear) {
        return Commands.jumpToYear(msg, args.jumptoyear);
      }

      if (args.jumptoday) {
        return Commands.jumpToDay(msg, args.jumptoday);
      }

      if (args.newcal) {
        return Commands.newCalendar(msg);
      }

      if (args.createnewcal) {
        return Commands.createNewCalendar(msg, args.createnewcal);
      }

      if (args.viewdate) {
        return Commands.viewDate(msg, args.viewdate);
      }

      if (args.setfeatureddate) {
        return Commands.setFeaturedDate(msg, args.setfeatureddate);
      }

      if (args.addnote) {
        return Commands.addNote(msg);
      }

      if (args.addevent) {
        return Commands.addEvent(msg);
      }

      if (args.genweather) {
        return Commands.generateWeather(msg);
      }

      if (args.regenweather) {
        return Commands.regenerateWeather(msg);
      }

      if (args.clearweather) {
        return Commands.clearWeather(msg);
      }

      if (args.customweather) {
        return Commands.customWeather(msg, args.customweather);
      }

      if (args.imagewhisper) {
        return Commands.imageWhisper(msg, args.imagewhisper);
      }

      if (args.imageannounce) {
        return Commands.imageAnnounce(msg, args.imageannounce);
      }

      if (args.addmonth) {
        return Commands.addMonth(msg);
      }

      if (args.addmoon) {
        return Commands.addMoon(msg);
      }

      if (args.setclimate) {
        return Commands.setClimate(msg);
      }

      if (args.savenote) {
        return Commands.saveNote(msg, args.savenote);
      }

      if (args.saveevent) {
        return Commands.saveEvent(msg, args.saveevent);
      }

      if (args.savemonth) {
        return Commands.saveMonth(msg, args.savemonth);
      }

      if (args.savemoon) {
        return Commands.saveMoon(msg, args.savemoon);
      }

      if (args.saveclimate) {
        return Commands.saveClimate(msg, args.saveclimate);
      }

      if (args.overrideclimate) {
        return Commands.overrideClimate(msg, args.overrideclimate);
      }

      if (args.toggleunits) {
        return Commands.toggleUnits(msg);
      }

      if (args.setvernalequinox) {
        return Commands.setVernalEquinox(msg, args.setvernalequinox);
      }

      if (args.toggleleap) {
        return Commands.toggleLeapYear(msg);
      }

      if (args.setleapcycle) {
        return Commands.setLeapCycle(msg, args.setleapcycle);
      }

      if (args.addleapexception) {
        return Commands.addLeapException(msg, args.addleapexception);
      }

      if (args.removeleapexception !== undefined) {
        return Commands.removeLeapException(msg, args.removeleapexception);
      }

      if (args.addholiday) {
        return Commands.addHoliday(msg, args.addholiday);
      }

      if (args.editholiday) {
        return Commands.editHoliday(msg, args.editholiday);
      }

      if (args.holidaywhisper) {
        return Commands.holidayWhisper(msg, args.holidaywhisper);
      }

      if (args.holidayannounce) {
        return Commands.holidayAnnounce(msg, args.holidayannounce);
      }

      if (args.addspecialday) {
        return Commands.addSpecialDay(msg, args.addspecialday);
      }

      if (args.savespecialday) {
        return Commands.saveSpecialDay(msg, args.savespecialday);
      }

      if (args.editspecialday) {
        return Commands.editSpecialDay(msg, args.editspecialday);
      }

      if (args.updatespecialday) {
        return Commands.updateSpecialDay(msg, args.updatespecialday);
      }

      if (args.deletespecialday) {
        return Commands.deleteSpecialDay(msg, args.deletespecialday);
      }

      if (args.specialdaywhisper) {
        return Commands.specialDayWhisper(msg, args.specialdaywhisper);
      }

      if (args.specialdayannounce) {
        return Commands.specialDayAnnounce(msg, args.specialdayannounce);
      }

      if (args.setspecialday) {
        return Commands.setSpecialDay(msg, args.setspecialday);
      }

      if (args.addinterannual) {
        return Commands.addInterannualDay(msg, args.addinterannual);
      }

      if (args.updateinterannual) {
        return Commands.updateInterannualDay(msg, args.updateinterannual);
      }

      if (args.deleteinterannual) {
        return Commands.deleteInterannualDay(msg, args.deleteinterannual);
      }

      if (args.moveinterannual) {
        return Commands.moveInterannualDay(msg, args.moveinterannual);
      }

      if (args.viewinterannual) {
        return Commands.viewInterannualDay(msg, args.viewinterannual);
      }

      if (args.deleteholiday !== undefined) {
        return Commands.deleteHoliday(msg, args.deleteholiday);
      }

      if (args.movemonth) {
        return Commands.moveMonth(msg, args.movemonth);
      }

      if (args.movemoon) {
        return Commands.moveMoon(msg, args.movemoon);
      }

      if (args.moveholiday) {
        return Commands.moveHoliday(msg, args.moveholiday);
      }

      if (args.editmonth !== undefined) {
        return Commands.editMonth(msg, args.editmonth);
      }

      if (args.delmonth !== undefined) {
        return Commands.deleteMonth(msg, args.delmonth);
      }

      if (args.editmoon !== undefined) {
        return Commands.editMoon(msg, args.editmoon);
      }

      if (args.delmoon !== undefined) {
        return Commands.deleteMoon(msg, args.delmoon);
      }

      if (args.editweekdays) {
        return Commands.editWeekdays(msg);
      }

      if (args.saveweekdays) {
        return Commands.saveWeekdays(msg, args.saveweekdays);
      }

      if (args.editname) {
        return Commands.editCalendarName(msg);
      }

      if (args.savename) {
        return Commands.saveCalendarName(msg, args.savename);
      }

      if (args.savedescription) {
        return Commands.saveDescription(msg, args.savedescription);
      }

      if (args.editdaysinyear) {
        return Commands.editDaysInYear(msg);
      }

      if (args.savedaysinyear) {
        return Commands.saveDaysInYear(msg, args.savedaysinyear);
      }

      if (args.editdaysinweek) {
        return Commands.editDaysInWeek(msg);
      }

      if (args.savedaysinweek) {
        return Commands.saveDaysInWeek(msg, args.savedaysinweek);
      }

      if (args.updatemonth) {
        return Commands.updateMonth(msg, args.updatemonth);
      }

      if (args.updatemoon) {
        return Commands.updateMoon(msg, args.updatemoon);
      }

      if (args.addtag) {
        return Commands.addTag(msg, args.addtag);
      }

      if (args.edittag) {
        return Commands.editTag(msg, args.edittag);
      }

      if (args.addtagfromlist) {
        return Commands.addTagFromList(msg, args.addtagfromlist);
      }

      // Timeline commands
      if (args['tl-toggle']) {
        return Commands.timelineToggle(msg, args['tl-toggle']);
      }

      if (args['tl-startyear']) {
        return Commands.timelineStartYear(msg, args['tl-startyear']);
      }

      if (args['tl-endyear']) {
        return Commands.timelineEndYear(msg, args['tl-endyear']);
      }

      if (args['tl-clearrange']) {
        return Commands.timelineClearRange(msg);
      }

      if (args['tl-togglesort']) {
        return Commands.timelineToggleSort(msg);
      }

      if (args['tl-togglemode']) {
        return Commands.timelineToggleMode(msg);
      }

      if (args['tl-deselectall']) {
        return Commands.timelineDeselectAll(msg);
      }

      if (args['tl-selectall']) {
        return Commands.timelineSelectAll(msg);
      }

      if (args['tl-toggletag']) {
        return Commands.timelineToggleTag(msg, args['tl-toggletag']);
      }

      if (args['tl-toggleuntagged']) {
        return Commands.timelineToggleUntagged(msg);
      }

      if (args.pickitemtag) {
        return Commands.pickItemTag(msg, args.pickitemtag);
      }

      if (args.addtag) {
        return Commands.addTag(msg, args.addtag);
      }

      if (args.chat) {
        if (args.chat === 'calendar') {
          return Commands.sendCalendarToChat(msg);
        } else if (args.chat === 'design') {
          return Commands.sendDesignToChat(msg);
        }
      }

      // Default: show handout link
      Commands.showHandout(msg);
    },

    help: (msg) => {
      // Find or create the help handout
      let helpHandout = findObjs({
        _type: 'handout',
        name: CHRONICLE_HELP_NAME
      })[0];

      if (!helpHandout) {
        // Create new help handout
        helpHandout = createObj('handout', {
          name: CHRONICLE_HELP_NAME,
          inplayerjournals: 'all',
          archived: false,
          avatar: CHRONICLE_HELP_AVATAR
        });
        
        helpHandout.set('notes', CHRONICLE_HELP_TEXT);
        
        log('Chronicle: Created help handout');
      } else {
        // Update existing help handout
        helpHandout.set('notes', CHRONICLE_HELP_TEXT);
        helpHandout.set('avatar', CHRONICLE_HELP_AVATAR);
        log('Chronicle: Updated help handout');
      }

      // Send clickable button
      const CSS_CURRENT = getCSS();
      const handoutId = helpHandout.get('_id');
      const button = `<a style="${CSS_CURRENT.button}" href="http://journal.roll20.net/handout/${handoutId}">Open Chronicle Help Documentation</a>`;
      
      Output.send(msg.who, button);
    },

    initialize: (msg, args) => {
      const CSS_CURRENT = getCSS();
      // Create default calendar
      const calendar = DefaultCalendars.gregorian();
      HandoutManager.saveCalendar(calendar);
      State.setConfig('currentCalendar', `${HANDOUT_PREFIX} Calendar: ${calendar.name}`);

      // Create empty events handout
      HandoutManager.saveEvents('My Campaign', [], []);

      // Set initial viewing date
      State.setConfig('viewingDate', { year: 1, month: 1 });
      State.setConfig('currentDate', { year: 1, month: 1, day: 1 });

      Output.send(msg.who, `<div style="${CSS_CURRENT.container}">Chronicle initialized with Gregorian calendar!</div>`);
      
      Commands.renderInterface(msg);
    },

    renderInterface: (msg) => {
      // Load data with callbacks, then render with loaded data
      HandoutManager.loadData((data) => {
        const mode = State.config().displayMode;
        InterfaceRenderer.render(mode, data, (handout) => {
          // Silently update - no confirmation needed
        });
      });
    },

    showHandout: (msg) => {
      let handout = HandoutManager.findHandout(INTERFACE_HANDOUT_NAME);
      if (!handout) {
        // Create and render if it doesn't exist
        Commands.renderInterface(msg);
        handout = HandoutManager.findHandout(INTERFACE_HANDOUT_NAME);
      }
      
      if (handout) {
        // Send button link using Output system
        const who = Utils.stripGM(msg.who);
        const CSS_CURRENT = getCSS();
        const button = `<a style="${CSS_CURRENT.button}" href="http://journal.roll20.net/handout/${handout.id}">Open Chronicle Interface</a>`;
        Output.send(who, button);
      }
    },

    setMode: (msg, mode) => {
      State.setConfig('displayMode', mode);
      Commands.renderInterface(msg);
    },

    setTheme: (msg, theme) => {
      State.setConfig('theme', theme);
      Commands.renderInterface(msg);
    },

    loadCalendar: (msg, calType) => {
      let calendar;
      
      // Check if this is a request to list existing calendars
      if (calType === 'list') {
        const handouts = findObjs({ type: 'handout' });
        const presetNames = ['Gregorian', 'Absalom Reckoning', 'Faerun', 'Greyhawk', 'Eberron'];
        const calendarHandouts = handouts.filter(h => {
          const name = h.get('name');
          if (!name.startsWith(HANDOUT_PREFIX + ' Calendar:')) return false;
          
          const calName = name.replace(HANDOUT_PREFIX + ' Calendar: ', '');
          // Exclude preset calendars from the list since they have dedicated Load buttons
          return !presetNames.includes(calName);
        });
        
        if (calendarHandouts.length === 0) {
          Output.send(msg.who, '<em>No custom calendars found.</em>');
          return;
        }
        
        let output = '<div><strong>Custom Calendars:</strong><br>';
        calendarHandouts.forEach(h => {
          const fullName = h.get('name');
          const calName = fullName.replace(HANDOUT_PREFIX + ' Calendar: ', '');
          output += '• ' + calName + ' - <a href="!chr --loadcal ' + calName + '">Load</a><br>';
        });
        output += '</div>';
        Output.send(msg.who, output);
        return;
      }
      
      // Check if loading a default calendar type
      if (calType === 'gregorian' || calType === 'absalom' || calType === 'faerun' || calType === 'greyhawk' || calType === 'eberron' || calType === 'traveller') {
        // Get the default calendar
        if (calType === 'gregorian') {
          calendar = DefaultCalendars.gregorian();
        } else if (calType === 'absalom') {
          calendar = DefaultCalendars.absalom();
        } else if (calType === 'faerun') {
          calendar = DefaultCalendars.faerun();
        } else if (calType === 'greyhawk') {
          calendar = DefaultCalendars.greyhawk();
        } else if (calType === 'eberron') {
          calendar = DefaultCalendars.eberron();
        } else if (calType === 'traveller') {
          calendar = DefaultCalendars.traveller();
        }
        
        // Check if handouts already exist - if so, just load them instead of overwriting
        const handoutName = `${HANDOUT_PREFIX} Calendar: ${calendar.name}`;
        const existingHandout = HandoutManager.findHandout(handoutName);
        
        if (existingHandout) {
          // Handout already exists - just switch to it, don't overwrite
          State.setConfig('currentCalendar', handoutName);
          const eventsName = `${HANDOUT_PREFIX} Events: ${calendar.name}`;
          State.setConfig('currentEvents', eventsName);
          Commands.renderInterface(msg);
          return;
        }
        
        // Handout doesn't exist - create it
        HandoutManager.saveCalendar(calendar);
        State.setConfig('currentCalendar', handoutName);
        Commands.renderInterface(msg);
        return;
      }
      
      // Not a preset - try to find existing calendar handout with this name
      const handoutName = `${HANDOUT_PREFIX} Calendar: ${calType}`;
      const handout = HandoutManager.findHandout(handoutName);
      
      if (!handout) {
        Output.send(msg.who, `Calendar "${calType}" not found. Use <strong>!chr --loadcal list</strong> to see existing calendars, or <strong>!chr --loadcal gregorian</strong> / <strong>!chr --loadcal absalom</strong> / <strong>!chr --loadcal faerun</strong> / <strong>!chr --loadcal greyhawk</strong> / <strong>!chr --loadcal eberron</strong> / <strong>!chr --loadcal traveller</strong> to create a new one.`);
        return;
      }
      
      // Load the existing calendar
      State.setConfig('currentCalendar', handoutName);
      const eventsName = `${HANDOUT_PREFIX} Events: ${calType}`;
      State.setConfig('currentEvents', eventsName);
      
      Commands.renderInterface(msg);
    },

    previousDay: (msg) => {
      DataLoader.loadAll((data) => {
        const currentDate = State.config().currentDate;
        const calendar = data.calendar;

        if (!calendar || !calendar.months || calendar.months.length === 0) {
          Output.send(msg.who, 'No calendar loaded');
          return;
        }

        let day = currentDate.day - 1;
        let month = currentDate.month;
        let year = currentDate.year;

        if (day < 1) {
          month--;
          if (month < 1) {
            month = calendar.months.length;
            year--;
          }
          day = DateUtils.getDaysInMonth(month, year, calendar);
        }

        const newDate = { year, month, day };
        State.setConfig('currentDate', newDate);
        State.setConfig('viewingDate', { year, month });
        Commands.renderInterface(msg);
      });
    },

    nextDay: (msg) => {
      DataLoader.loadAll((data) => {
        const currentDate = State.config().currentDate;
        const calendar = data.calendar;

        if (!calendar || !calendar.months || calendar.months.length === 0) {
          Output.send(msg.who, 'No calendar loaded');
          return;
        }

        let day = currentDate.day + 1;
        let month = currentDate.month;
        let year = currentDate.year;

        const daysInMonth = DateUtils.getDaysInMonth(month, year, calendar);

        if (day > daysInMonth) {
          day = 1;
          month++;
          if (month > calendar.months.length) {
            month = 1;
            year++;
          }
        }

        const newDate = { year, month, day };
        State.setConfig('currentDate', newDate);
        State.setConfig('viewingDate', { year, month });
        Commands.renderInterface(msg);
      });
    },

    previousMonth: (msg) => {
      DataLoader.loadAll((data) => {
        const viewingDate = State.config().viewingDate;
        const calendar = data.calendar;

        if (!calendar || !calendar.months || calendar.months.length === 0) {
          Output.send(msg.who, 'No calendar loaded');
          return;
        }

        let month = viewingDate.month - 1;
        let year = viewingDate.year;

        if (month < 1) {
          month = calendar.months.length;
          year--;
        }

        State.setConfig('viewingDate', { year, month });
        Commands.renderInterface(msg);
      });
    },

    nextMonth: (msg) => {
      DataLoader.loadAll((data) => {
        const viewingDate = State.config().viewingDate;
        const calendar = data.calendar;

        if (!calendar || !calendar.months || calendar.months.length === 0) {
          Output.send(msg.who, 'No calendar loaded');
          return;
        }

        let month = viewingDate.month + 1;
        let year = viewingDate.year;

        if (month > calendar.months.length) {
          month = 1;
          year++;
        }

        State.setConfig('viewingDate', { year, month });
        Commands.renderInterface(msg);
      });
    },

    previousYear: (msg) => {
      const viewingDate = State.config().viewingDate;
      
      State.setConfig('viewingDate', { 
        year: viewingDate.year - 1, 
        month: viewingDate.month 
      });
      Commands.renderInterface(msg);
    },

    nextYear: (msg) => {
      const viewingDate = State.config().viewingDate;
      
      State.setConfig('viewingDate', { 
        year: viewingDate.year + 1, 
        month: viewingDate.month 
      });
      Commands.renderInterface(msg);
    },

    goToToday: (msg) => {
      // Navigate to the saved "Today" date
      const todayDate = State.config().featuredDate || State.config().currentDate;
      State.setConfig('currentDate', todayDate);
      State.setConfig('viewingDate', { 
        year: todayDate.year, 
        month: todayDate.month 
      });
      Commands.renderInterface(msg);
    },

    setToday: (msg) => {
      // Save the current Featured Date as the new "Today"
      const currentDate = State.config().currentDate;
      State.setConfig('featuredDate', {
        year: currentDate.year,
        month: currentDate.month,
        day: currentDate.day
      });
      Commands.renderInterface(msg);
    },

    toggleVerbose: (msg) => {
      const current = State.config().verboseCalendar || false;
      State.setConfig('verboseCalendar', !current);
      Commands.renderInterface(msg);
    },

    // Timeline Mode Commands
    timelineToggle: (msg, type) => {
      const timelineState = State.config().timelineState || {
        selectedTags: [],
        tagMode: 'OR',
        showEvents: true,
        showNotes: true,
        showHolidays: false,
        startYear: null,
        endYear: null,
        sortAscending: true
      };

      if (type === 'event') {
        timelineState.showEvents = !timelineState.showEvents;
      } else if (type === 'note') {
        timelineState.showNotes = !timelineState.showNotes;
      } else if (type === 'holiday') {
        timelineState.showHolidays = !timelineState.showHolidays;
      } else if (type === 'weather') {
        timelineState.showWeather = !timelineState.showWeather;
      } else if (type === 'details') {
        timelineState.showDetails = !timelineState.showDetails;
      }

      State.setConfig('timelineState', timelineState);
      Commands.renderInterface(msg);
    },

    timelineStartYear: (msg, year) => {
      const timelineState = State.config().timelineState || {
        selectedTags: [],
        tagMode: 'OR',
        showEvents: true,
        showNotes: true,
        showHolidays: false,
        startYear: null,
        endYear: null,
        sortAscending: true
      };

      const yearNum = parseInt(year);
      if (!isNaN(yearNum)) {
        timelineState.startYear = yearNum;
        State.setConfig('timelineState', timelineState);
      }

      Commands.renderInterface(msg);
    },

    timelineEndYear: (msg, year) => {
      const timelineState = State.config().timelineState || {
        selectedTags: [],
        tagMode: 'OR',
        showEvents: true,
        showNotes: true,
        showHolidays: false,
        startYear: null,
        endYear: null,
        sortAscending: true
      };

      const yearNum = parseInt(year);
      if (!isNaN(yearNum)) {
        timelineState.endYear = yearNum;
        State.setConfig('timelineState', timelineState);
      }

      Commands.renderInterface(msg);
    },

    timelineClearRange: (msg) => {
      const timelineState = State.config().timelineState || {
        selectedTags: [],
        tagMode: 'OR',
        showEvents: true,
        showNotes: true,
        showHolidays: false,
        startYear: null,
        endYear: null,
        sortAscending: true
      };

      timelineState.startYear = null;
      timelineState.endYear = null;
      State.setConfig('timelineState', timelineState);
      Commands.renderInterface(msg);
    },

    timelineToggleSort: (msg) => {
      const timelineState = State.config().timelineState || {
        selectedTags: [],
        tagMode: 'OR',
        showEvents: true,
        showNotes: true,
        showHolidays: false,
        startYear: null,
        endYear: null,
        sortAscending: true
      };

      timelineState.sortAscending = !timelineState.sortAscending;
      State.setConfig('timelineState', timelineState);
      Commands.renderInterface(msg);
    },

    timelineToggleMode: (msg) => {
      const timelineState = State.config().timelineState || {
        selectedTags: [],
        tagMode: 'OR',
        showEvents: true,
        showNotes: true,
        showHolidays: false,
        startYear: null,
        endYear: null,
        sortAscending: true
      };

      timelineState.tagMode = timelineState.tagMode === 'OR' ? 'AND' : 'OR';
      State.setConfig('timelineState', timelineState);
      Commands.renderInterface(msg);
    },

    timelineDeselectAll: (msg) => {
      const timelineState = State.config().timelineState || {
        selectedTags: [],
        tagMode: 'OR',
        showEvents: true,
        showNotes: true,
        showHolidays: false,
        startYear: null,
        endYear: null,
        sortAscending: true
      };

      timelineState.selectedTags = [];
      State.setConfig('timelineState', timelineState);
      Commands.renderInterface(msg);
    },

    timelineSelectAll: (msg) => {
      DataLoader.loadAll((data) => {
        const timelineState = State.config().timelineState || {
          selectedTags: [],
          tagMode: 'OR',
          showEvents: true,
          showNotes: true,
          showHolidays: false,
          startYear: null,
          endYear: null,
          sortAscending: true
        };

        // Get all tags and select them
        const allTags = TagSystem.getAllTags(data);
        timelineState.selectedTags = [...allTags];
        State.setConfig('timelineState', timelineState);
        Commands.renderInterface(msg);
      });
    },

    timelineToggleTag: (msg, tag) => {
      const timelineState = State.config().timelineState || {
        selectedTags: [],
        tagMode: 'OR',
        showEvents: true,
        showNotes: true,
        showHolidays: false,
        showUntagged: false,
        startYear: null,
        endYear: null,
        sortAscending: true
      };

      const index = timelineState.selectedTags.indexOf(tag);
      if (index > -1) {
        // Tag is selected, remove it
        timelineState.selectedTags.splice(index, 1);
      } else {
        // Tag is not selected, add it
        timelineState.selectedTags.push(tag);
      }

      State.setConfig('timelineState', timelineState);
      Commands.renderInterface(msg);
    },

    timelineToggleUntagged: (msg, tag) => {
      const timelineState = State.config().timelineState || {
        selectedTags: [],
        tagMode: 'OR',
        showEvents: true,
        showNotes: true,
        showHolidays: false,
        showUntagged: false,
        startYear: null,
        endYear: null,
        sortAscending: true
      };

      timelineState.showUntagged = !timelineState.showUntagged;

      State.setConfig('timelineState', timelineState);
      Commands.renderInterface(msg);
    },

    pickItemTag: (msg, itemData) => {
      const parts = itemData.split('|');
      const itemId = parts[0];
      const itemType = parts[1]; // 'event' or 'note'

      DataLoader.loadAll((data) => {
        // Find the item
        let item = null;
        if (itemType === 'event') {
          item = data.events.find(e => e.id === itemId);
        } else if (itemType === 'note') {
          item = data.notes.find(n => n.id === itemId);
        }

        if (!item) {
          Output.send(msg.who, 'Item not found');
          return;
        }

        // Collect all existing tags
        const allTags = new Set();
        data.events.forEach(e => {
          if (e.tags) e.tags.forEach(t => allTags.add(t));
        });
        data.notes.forEach(n => {
          if (n.tags) n.tags.forEach(t => allTags.add(t));
        });

        const tagList = Array.from(allTags).sort().join('|');

        // Build button with direct query - use pipe-separated tags
        let output = '<div>';
        if (tagList) {
          output += '<a style="' + CSS_CURRENT.button + '" href="!chr --addtag ' + itemId + '|' + itemType + '|?{Tag|' + tagList + '}">Pick a tag to add</a>';
        } else {
          output += '<em>No existing tags to choose from. Type a new tag:</em><br>';
          output += '<a style="' + CSS_CURRENT.button + '" href="!chr --addtag ' + itemId + '|' + itemType + '|?{Tag}">Add new tag</a>';
        }
        output += '</div>';
        
        Output.send(msg.who, output);
      });
    },

    addTag: (msg, tagData) => {
      const parts = tagData.split('|');
      const itemId = parts[0];
      const itemType = parts[1];
      const tag = parts.slice(2).join('|').trim(); // Rejoin in case tag contains |

      if (!tag) {
        Output.send(msg.who, 'No tag selected');
        return;
      }

      DataLoader.loadAll((data) => {
        let item = null;
        if (itemType === 'event') {
          item = data.events.find(e => e.id === itemId);
        } else if (itemType === 'note') {
          item = data.notes.find(n => n.id === itemId);
        }

        if (!item) {
          Output.send(msg.who, 'Item not found');
          return;
        }

        // Add tag if not already present
        if (!item.tags) item.tags = [];
        if (!item.tags.includes(tag)) {
          item.tags.push(tag);
        }

        // Save
        HandoutManager.saveEvents(data.events);
        HandoutManager.saveNotes(data.notes);
        Commands.renderInterface(msg);
      });
    },

    editEvent: (msg, eventData) => {
      const parts = eventData.split('|');
      const eventId = parts[0];
      const newContent = parts[1];

      DataLoader.loadAll((data) => {
        const events = data.events;
        const event = events.find(e => e.id === eventId);
        
        if (!event) {
          Output.send(msg.who, 'Event not found');
          return;
        }

        event.content = newContent;
        const calendar = data.calendar;
        const notes = data.notes;
        HandoutManager.saveEvents(calendar.name, events, notes, data.weather || []);

        Commands.renderInterface(msg);
      });
    },

    deleteEvent: (msg, eventId) => {
      DataLoader.loadAll((data) => {
        let events = data.events;
        const originalLength = events.length;
        events = events.filter(e => e.id !== eventId);

        if (events.length === originalLength) {
          Output.send(msg.who, 'Event not found');
          return;
        }

        const calendar = data.calendar;
        const notes = data.notes;
        HandoutManager.saveEvents(calendar.name, events, notes, data.weather || []);

        Commands.renderInterface(msg);
      });
    },

    editNote: (msg, noteData) => {
      const parts = noteData.split('|');
      const noteId = parts[0];
      const newContent = parts[1];

      DataLoader.loadAll((data) => {
        const notes = data.notes;
        const note = notes.find(n => n.id === noteId);
        
        if (!note) {
          Output.send(msg.who, 'Note not found');
          return;
        }

        note.content = newContent;
        const calendar = data.calendar;
        const events = data.events;
        HandoutManager.saveEvents(calendar.name, events, notes, data.weather || []);

        Commands.renderInterface(msg);
      });
    },

    deleteNote: (msg, noteId) => {
      DataLoader.loadAll((data) => {
        let notes = data.notes;
        const originalLength = notes.length;
        notes = notes.filter(n => n.id !== noteId);

        if (notes.length === originalLength) {
          Output.send(msg.who, 'Note not found');
          return;
        }

        const calendar = data.calendar;
        const events = data.events;
        HandoutManager.saveEvents(calendar.name, events, notes, data.weather || []);

        Commands.renderInterface(msg);
      });
    },

    convertItem: (msg, itemData) => {
      DataLoader.loadAll((data) => {
        const parts = itemData.split('|');
        const itemId = parts[0];
        const fromType = parts[1]; // 'event' or 'note'

        const calendar = data.calendar;
        let events = data.events;
        let notes = data.notes;

        if (fromType === 'event') {
          // Convert event to note
          const eventIndex = events.findIndex(e => e.id === itemId);
          if (eventIndex === -1) {
            Output.send(msg.who, 'Event not found');
            return;
          }

          const event = events[eventIndex];
          const newNote = DataModels.createNote(event.content, event.dateRef, event.tags || [], event.createdBy);
          notes.push(newNote);
          events.splice(eventIndex, 1);

          HandoutManager.saveEvents(calendar.name, events, notes, data.weather || []);
        } else if (fromType === 'note') {
          // Convert note to event
          const noteIndex = notes.findIndex(n => n.id === itemId);
          if (noteIndex === -1) {
            Output.send(msg.who, 'Note not found');
            return;
          }

          const note = notes[noteIndex];
          const newEvent = DataModels.createEvent(note.content, note.dateRef, note.tags || [], note.createdBy);
          events.push(newEvent);
          notes.splice(noteIndex, 1);

          HandoutManager.saveEvents(calendar.name, events, notes, data.weather || []);
        }

        Commands.renderInterface(msg);
      });
    },

    moveEvent: (msg, eventData) => {
      DataLoader.loadAll((data) => {
        const parts = eventData.split('|');
        const eventId = parts[0];
        const newYear = parseInt(parts[1]);
        const newMonth = parseInt(parts[2]);
        const newDay = parseInt(parts[3]);

        const calendar = data.calendar;
        let events = data.events;
        let notes = data.notes;

        const eventIndex = events.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
          Output.send(msg.who, 'Event not found');
          return;
        }

        // Update the event's dateRef
        events[eventIndex].dateRef = {
          year: newYear,
          month: newMonth,
          day: newDay
        };

        HandoutManager.saveEvents(calendar.name, events, notes, data.weather || []);
        Commands.renderInterface(msg);
      });
    },

    moveNote: (msg, noteData) => {
      DataLoader.loadAll((data) => {
        const parts = noteData.split('|');
        const noteId = parts[0];
        const newYear = parseInt(parts[1]);
        const newMonth = parseInt(parts[2]);
        const newDay = parseInt(parts[3]);

        const calendar = data.calendar;
        let events = data.events;
        let notes = data.notes;

        const noteIndex = notes.findIndex(n => n.id === noteId);
        if (noteIndex === -1) {
          Output.send(msg.who, 'Note not found');
          return;
        }

        // Update the note's dateRef
        notes[noteIndex].dateRef = {
          year: newYear,
          month: newMonth,
          day: newDay
        };

        HandoutManager.saveEvents(calendar.name, events, notes, data.weather || []);
        Commands.renderInterface(msg);
      });
    },

    addTag: (msg, tagData) => {
      DataLoader.loadAll((data) => {
        const parts = tagData.split('|');
        if (parts.length < 3) {
          Output.send(msg.who, 'Invalid tag data format');
          return;
        }

        const itemId = parts[0];
        const itemType = parts[1]; // 'event' or 'note'
        const newTagsStr = parts[2];

        const calendar = data.calendar;
        let events = data.events;
        let notes = data.notes;

        // Parse new tags
        const newTags = Utils.parseTags(newTagsStr);
        
        if (newTags.length === 0) {
          Output.send(msg.who, 'No valid tags provided');
          return;
        }

        // Find the item and add tags
        let found = false;
        if (itemType === 'event') {
          const event = events.find(e => e.id === itemId);
          if (event) {
            event.tags = event.tags || [];
            newTags.forEach(tag => {
              if (!event.tags.includes(tag)) {
                event.tags.push(tag);
              }
            });
            found = true;
          }
        } else if (itemType === 'note') {
          const note = notes.find(n => n.id === itemId);
          if (note) {
            note.tags = note.tags || [];
            newTags.forEach(tag => {
              if (!note.tags.includes(tag)) {
                note.tags.push(tag);
              }
            });
            found = true;
          }
        }

        if (!found) {
          Output.send(msg.who, 'Item not found');
          return;
        }

        HandoutManager.saveEvents(calendar.name, events, notes, data.weather || []);
        Commands.renderInterface(msg);
      });
    },

    editTag: (msg, tagData) => {
      DataLoader.loadAll((data) => {
        const parts = tagData.split('|');
        if (parts.length < 4) {
          Output.send(msg.who, 'Invalid tag edit format');
          return;
        }

        const itemId = parts[0];
        const itemType = parts[1]; // 'event' or 'note'
        const oldTag = parts[2].toLowerCase().trim();
        const newTag = parts[3].toLowerCase().trim();

        const calendar = data.calendar;
        let events = data.events;
        let notes = data.notes;

        // Find the item
        let item = null;
        if (itemType === 'event') {
          item = events.find(e => e.id === itemId);
        } else if (itemType === 'note') {
          item = notes.find(n => n.id === itemId);
        }

        if (!item || !item.tags) {
          Output.send(msg.who, 'Item or tag not found');
          return;
        }

        const tagIndex = item.tags.indexOf(oldTag);
        if (tagIndex === -1) {
          return;
        }

        if (newTag === '') {
          // Delete tag
          item.tags.splice(tagIndex, 1);
          HandoutManager.saveEvents(calendar.name, events, notes, data.weather || []);
        } else {
          // Update tag
          item.tags[tagIndex] = newTag;
          HandoutManager.saveEvents(calendar.name, events, notes, data.weather || []);
        }

        Commands.renderInterface(msg);
      });
    },

    addTagFromList: (msg, itemData) => {
      DataLoader.loadAll((data) => {
        const parts = itemData.split('|');
        if (parts.length < 2) {
          Output.send(msg.who, 'Invalid format');
          return;
        }

        const itemId = parts[0];
        const itemType = parts[1];

        // Get all existing tags
        const allTags = TagSystem.getAllTags(data);

        if (allTags.length === 0) {
          Output.send(msg.who, 'No existing tags found. Use the + button to create tags first.');
          return;
        }

        // Build the tag list for the query dropdown and output the command directly
        const tagList = allTags.join('|');
        
        // This sends nothing to chat - Roll20 will process the command directly from the button
        // The button's href already contains the full command, so we just need to trigger it
        sendChat('Chronicle', `!chr --addtag ${itemId}|${itemType}|?{Choose tag to add|${tagList}}`);
      });
    },

    pickMonth: (msg) => {
      DataLoader.loadAll((data) => {
        const CSS_CURRENT = getCSS();
        const calendar = data.calendar;
        if (!calendar || !calendar.months || calendar.months.length === 0) {
          Output.send(msg.who, 'No calendar loaded');
          return;
        }

        // Build list of months for query (or simple link for single-month calendars)
        let monthButtonHref;
        if (calendar.months.length === 1) {
          monthButtonHref = `!chr --jumptomonth 1`;
        } else {
          const monthList = calendar.months.map((m, idx) => `${m.name},${idx + 1}`).join('|');
          monthButtonHref = `!chr --jumptomonth ?{Which month?|${monthList}}`;
        }
        Output.send(msg.who, `Click to jump to month: <br>${Output.makeButton('Select Month', monthButtonHref, CSS_CURRENT.button)}`);
      });
    },

    jumpToMonth: (msg, monthNum) => {
      const month = parseInt(monthNum);
      const viewingDate = State.config().viewingDate;
      
      if (isNaN(month)) {
        Output.send(msg.who, 'Invalid month');
        return;
      }

      State.setConfig('viewingDate', { 
        year: viewingDate.year, 
        month: month 
      });
      Commands.renderInterface(msg);
    },

    pickYear: (msg) => {
      const CSS_CURRENT = getCSS();
      const viewingDate = State.config().viewingDate;
      Output.send(msg.who, `Current year: ${viewingDate.year}<br>${Output.makeButton('Jump to Year', `!chr --jumptoyear ?{Enter year|${viewingDate.year}}`, CSS_CURRENT.button)}`);
    },

    jumpToYear: (msg, yearNum) => {
      const year = parseInt(yearNum);
      const viewingDate = State.config().viewingDate;
      
      if (isNaN(year)) {
        Output.send(msg.who, 'Invalid year');
        return;
      }

      State.setConfig('viewingDate', { 
        year: year, 
        month: viewingDate.month 
      });
      Commands.renderInterface(msg);
    },

    jumpToDay: (msg, dayNum) => {
      DataLoader.loadAll((data) => {
        const day = parseInt(dayNum);
        const currentDate = State.config().currentDate;
        const calendar = data.calendar;
        
        if (isNaN(day)) {
          Output.send(msg.who, 'Invalid day');
          return;
        }

        const month = calendar.months[currentDate.month - 1];
        if (!month || day < 1 || day > month.days) {
          Output.send(msg.who, `Invalid day. Must be between 1 and ${month ? month.days : '?'}`);
          return;
        }

        State.setConfig('currentDate', {
          year: currentDate.year,
          month: currentDate.month,
          day: day
        });
        Commands.renderInterface(msg);
      });
    },

    newCalendar: (msg) => {
      const CSS_CURRENT = getCSS();
      Output.send(msg.who, `${Output.makeButton('Create New Calendar', `!chr --createnewcal ?{Calendar Name|New Calendar}`, CSS_CURRENT.button)}`);
    },

    createNewCalendar: (msg, calName) => {
      const calendar = DataModels.createCalendar(calName);
      
      // Start with basic structure - user will configure in Design Mode
      calendar.months = [];
      calendar.weeks.weekdayNames = ['Day1', 'Day2', 'Day3', 'Day4', 'Day5', 'Day6', 'Day7'];
      
      HandoutManager.saveCalendar(calendar);
      State.setConfig('currentCalendar', `${HANDOUT_PREFIX} Calendar: ${calName}`);

      Output.send(msg.who, `New calendar "${calName}" created. Use Design Mode to add months.`);
      State.setConfig('displayMode', 'design');
      Commands.renderInterface(msg);
    },

    viewDate: (msg, dateStr) => {
      const parts = dateStr.split('|');
      const date = {
        year: parseInt(parts[0]),
        month: parseInt(parts[1]),
        day: parseInt(parts[2])
      };

      State.setConfig('currentDate', date);
      State.setConfig('viewingDate', { year: date.year, month: date.month });
      State.setConfig('displayMode', 'calendar'); // Switch to calendar view
      Commands.renderInterface(msg);
    },

    setFeaturedDate: (msg, dateStr) => {
      const parts = dateStr.split('|');
      const date = {
        year: parseInt(parts[0]),
        month: parseInt(parts[1]),
        day: parseInt(parts[2])
      };

      State.setConfig('currentDate', date);
      State.setConfig('viewingDate', { year: date.year, month: date.month });
      // Don't change mode - stay in current view (timeline)
      Commands.renderInterface(msg);
    },

    addNote: (msg) => {
      // Kept for backward compatibility, but query is now in the button
      DataLoader.loadAll((data) => {
        const currentDate = State.config().currentDate;
        const calendar = data.calendar;
        const month = calendar.months[currentDate.month - 1];
        const monthName = month ? month.name : 'Unknown';
        
        Output.send(msg.who, `To add a note for ${monthName} ${currentDate.day}, ${currentDate.year}, use the Add Note button in the handout.`);
      });
    },

    saveNote: (msg, noteText) => {
      DataLoader.loadAll((data) => {
        const currentDate = State.config().currentDate;
        const notes = data.notes;
        let eventsName = State.config().currentEvents;
        const currentCalendar = State.config().currentCalendar;
        const who = Utils.stripGM(msg.who);

        // If currentEvents isn't set, derive it from calendar name
        if (!eventsName && currentCalendar) {
          const calName = currentCalendar.replace(`${HANDOUT_PREFIX} Calendar: `, '');
          eventsName = `${HANDOUT_PREFIX} Events: ${calName}`;
          State.setConfig('currentEvents', eventsName);
        }

        const note = DataModels.createNote(noteText, currentDate, [], who);
        notes.push(note);

        // Save to handout
        const events = data.events;
        if (eventsName) {
          const calName = eventsName.replace(`${HANDOUT_PREFIX} Events: `, '');
          HandoutManager.saveEvents(calName, events, notes, data.weather || []);
        } else {
          Output.send(msg.who, 'Error: No calendar loaded. Please load or create a calendar first.');
          return;
        }

        Commands.renderInterface(msg);
      });
    },

    addEvent: (msg) => {
      // Kept for backward compatibility, but query is now in the button
      DataLoader.loadAll((data) => {
        const currentDate = State.config().currentDate;
        const calendar = data.calendar;
        const month = calendar.months[currentDate.month - 1];
        const monthName = month ? month.name : 'Unknown';
        
        Output.send(msg.who, `To add an event for ${monthName} ${currentDate.day}, ${currentDate.year}, use the Add Event button in the handout.`);
      });
    },

    saveEvent: (msg, eventText) => {
      DataLoader.loadAll((data) => {
        const currentDate = State.config().currentDate;
        const events = data.events;
        let eventsName = State.config().currentEvents;
        const currentCalendar = State.config().currentCalendar;
        const who = Utils.stripGM(msg.who);

        // If currentEvents isn't set, derive it from calendar name
        if (!eventsName && currentCalendar) {
          const calName = currentCalendar.replace(`${HANDOUT_PREFIX} Calendar: `, '');
          eventsName = `${HANDOUT_PREFIX} Events: ${calName}`;
          State.setConfig('currentEvents', eventsName);
        }

        const event = DataModels.createEvent(eventText, currentDate, [], who);
        events.push(event);

        // Save to handout
        const notes = data.notes;
        if (eventsName) {
          const calName = eventsName.replace(`${HANDOUT_PREFIX} Events: `, '');
          HandoutManager.saveEvents(calName, events, notes, data.weather || []);
        } else {
          Output.send(msg.who, 'Error: No calendar loaded. Please load or create a calendar first.');
          return;
        }

        Commands.renderInterface(msg);
      });
    },

    generateWeather: (msg) => {
      DataLoader.loadAll((data) => {
        const currentDate = State.config().currentDate;
        const calendar = data.calendar;
        const weather = data.weather;

        // Check if weather already exists for this date
        const existing = weather.findIndex(w =>
          w.dateRef.year === currentDate.year &&
          w.dateRef.month === currentDate.month &&
          w.dateRef.day === currentDate.day
        );

        const newWeather = WeatherGenerator.generate(currentDate, calendar);
        
        if (!newWeather) {
          Output.send(msg.who, 'No climate set. Use Design Mode to set a climate first.');
          return;
        }

        if (existing >= 0) {
          weather[existing] = newWeather;
        } else {
          weather.push(newWeather);
        }

        // Save weather to handout
        const events = data.events;
        const notes = data.notes;
        HandoutManager.saveEvents(calendar.name, events, notes, weather);

        // Weather generated, interface will re-render to show it
        Commands.renderInterface(msg);
      });
    },

    regenerateWeather: (msg) => {
      // Just call generateWeather again, which will overwrite existing
      Commands.generateWeather(msg);
    },

    clearWeather: (msg) => {
      DataLoader.loadAll((data) => {
        const currentDate = State.config().currentDate;
        const calendar = data.calendar;
        let weather = data.weather || [];

        // Remove weather for current date
        weather = weather.filter(w => 
          !(w.dateRef.year === currentDate.year && 
            w.dateRef.month === currentDate.month && 
            w.dateRef.day === currentDate.day)
        );

        // Save back
        const events = data.events;
        const notes = data.notes;
        HandoutManager.saveEvents(calendar.name, events, notes, weather);

        Commands.renderInterface(msg);
      });
    },

    customWeather: (msg, weatherData) => {
      DataLoader.loadAll((data) => {
        const currentDate = State.config().currentDate;
        const calendar = data.calendar;
        let weather = data.weather || [];

        // Parse the weather data: emoji, description, and temperature
        const parts = weatherData.split('|');
        if (parts.length < 2) {
          Output.send(msg.who, 'Invalid weather format.');
          return;
        }

        const emoji = parts[0].trim();
        const description = parts[1].trim();
        const temperatureInput = parts.length > 2 ? parts[2].trim() : '72';

        if (!emoji || !description) {
          Output.send(msg.who, 'Weather emoji and description are required.');
          return;
        }

        // Parse temperature as number
        const tempValue = parseInt(temperatureInput) || 72;

        // Find existing weather for this date
        const existing = weather.findIndex(w =>
          w.dateRef.year === currentDate.year &&
          w.dateRef.month === currentDate.month &&
          w.dateRef.day === currentDate.day
        );

        // Create custom weather object
        const customWeather = {
          dateRef: { year: currentDate.year, month: currentDate.month, day: currentDate.day },
          temperature: {
            value: tempValue,
            unit: calendar.units === 'metric' ? 'C' : 'F'
          },
          description: description,
          emoji: emoji,
          isCustom: true
        };

        if (existing >= 0) {
          weather[existing] = customWeather;
        } else {
          weather.push(customWeather);
        }

        // Save weather
        const events = data.events;
        const notes = data.notes;
        HandoutManager.saveEvents(calendar.name, events, notes, weather);

        Commands.renderInterface(msg);
      });
    },

    addMonth: (msg) => {
      // Kept for backward compatibility - query is now in the button
      Output.send(msg.who, `Use the Add Month button in Design Mode to add a month.`);
    },

    saveMonth: (msg, monthData) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
      
        Logger.debug(`saveMonth received: "${monthData}"`);
      
        const parts = monthData.split('|');
      
        if (parts.length < 2) {
          Output.send(msg.who, `Invalid format. Received ${parts.length} parts. Expected format: Name|Days. Got: "${monthData}"`);
          return;
        }

        const name = parts[0].trim();
        const days = parseInt(parts[1]);

        if (isNaN(days) || days < 1) {
          Output.send(msg.who, `Invalid number of days. Received: "${parts[1]}"`);
          return;
        }

        const newMonth = DataModels.createMonth(name, days, calendar.months.length);
        calendar.months.push(newMonth);

        HandoutManager.saveCalendar(calendar);

        Commands.renderInterface(msg);
      });
    },

    addMoon: (msg) => {
        // Kept for backward compatibility - query is now in the button
        Output.send(msg.who, `Use the Add Moon button in Design Mode to add a moon.`);
      },


    saveMoon: (msg, moonData) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        if (!calendar) {
          Output.send(msg.who, 'No calendar loaded');
          return;
        }
      
        const moons = calendar.moons || [];
      
        Logger.debug(`saveMoon received: "${moonData}"`);
      
        const parts = moonData.split('|');
      
        if (parts.length < 5) {
          Output.send(msg.who, `Invalid format. Expected at least 5 parts: Name|Period|FullYear|FullMonth|FullDay. Got: "${moonData}"`);
          return;
        }

        const name = parts[0].trim();
        const period = parseFloat(parts[1]); // Changed to parseFloat for decimal support
        const fullYear = parseInt(parts[2]);
        const fullMonth = parseInt(parts[3]);
        const fullDay = parseInt(parts[4]);
        const size = parts.length > 5 ? parseFloat(parts[5]) : 1;
        const color = parts.length > 6 ? parts[6].trim() : 'yellow';
        const display = parts.length > 7 ? parts[7].trim() === 'true' : true;

        if (isNaN(period) || isNaN(fullYear) || isNaN(fullMonth) || isNaN(fullDay)) {
          Output.send(msg.who, `Invalid numbers in moon data. Period=${parts[1]}, Year=${parts[2]}, Month=${parts[3]}, Day=${parts[4]}`);
          return;
        }

        const fullDayRef = { year: fullYear, month: fullMonth, day: fullDay };
        const newMoon = DataModels.createMoon(name, period, fullDayRef, size, color, display);
        moons.push(newMoon);

        calendar.moons = moons;
        HandoutManager.saveCalendar(calendar);

        Commands.renderInterface(msg);
      });
    },


    setClimate: (msg) => {
        // Kept for backward compatibility - query is now in the button
        Output.send(msg.who, `Use the Set Climate button in Design Mode to configure climate.`);
      },


    saveClimate: (msg, climateData) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const parts = climateData.split('|');
      
        if (parts.length < 5) {
          Output.send(msg.who, 'Invalid format. See help for proper format.');
          return;
        }

        const inputs = {
          latitude_band: parts[0].trim(),
          ocean_proximity: parts[1].trim(),
          coast_type: parts[2].trim(),
          elevation: parts[3].trim(),
          rainshadow: parts[4].trim()
        };

        const climate = ClimateClassifier.classify(inputs);
        calendar.climate = climate;

        HandoutManager.saveCalendar(calendar);

        Commands.renderInterface(msg);
      });
    },

    overrideClimate: (msg, koppenCode) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const code = koppenCode.trim();  // Don't convert to uppercase - keep the original case
        
        // Climate descriptions (must match the ones in UI)
        const descriptions = {
          'Af': { name: 'Tropical Rainforest', temp: 'Hot and humid year-round', precip: 'Heavy rainfall in all seasons', biome: 'Dense jungle - diverse wildlife' },
          'Aw': { name: 'Tropical Savanna', temp: 'Hot year-round', precip: 'Distinct wet and dry seasons', biome: 'Grasslands with scattered trees' },
          'BWh': { name: 'Hot Desert', temp: 'Extremely hot days - cool nights', precip: 'Minimal rainfall', biome: 'Sparse vegetation - dunes - arid plains' },
          'BWk': { name: 'Cold Desert', temp: 'Hot summers - cold winters', precip: 'Very low precipitation', biome: 'Rocky terrain - hardy shrubs' },
          'BSk': { name: 'Cold Steppe', temp: 'Warm summers - cold winters', precip: 'Low to moderate precipitation', biome: 'Short grasslands - sparse vegetation' },
          'BSh': { name: 'Hot Steppe', temp: 'Hot summers - mild winters', precip: 'Low precipitation', biome: 'Semi-arid grasslands' },
          'Csa': { name: 'Mediterranean', temp: 'Hot dry summers - mild wet winters', precip: 'Summer drought - winter rain', biome: 'Scrubland - drought-resistant trees' },
          'Csb': { name: 'Warm Mediterranean', temp: 'Warm dry summers - mild wet winters', precip: 'Summer drought - winter rain', biome: 'Mixed forest - chaparral' },
          'Cfa': { name: 'Humid Subtropical', temp: 'Hot summers - mild winters', precip: 'High humidity - frequent storms', biome: 'Mixed forests - broadleaf vegetation' },
          'Cfb': { name: 'Marine West Coast', temp: 'Mild temperatures year-round', precip: 'Frequent rainfall in all seasons', biome: 'Temperate rainforest - dense evergreen vegetation' },
          'Cfc': { name: 'Subpolar Oceanic', temp: 'Cool summers - mild winters', precip: 'Consistent rainfall', biome: 'Coniferous forest - mosses' },
          'Dfa': { name: 'Hot-Summer Humid Continental', temp: 'Hot summers - cold snowy winters', precip: 'Moderate precipitation year-round', biome: 'Deciduous and mixed forests' },
          'Dfb': { name: 'Warm-Summer Humid Continental', temp: 'Warm summers - cold winters', precip: 'Moderate precipitation year-round', biome: 'Deciduous forests - seasonal variation' },
          'Dfc': { name: 'Subarctic', temp: 'Cool summers - very cold winters', precip: 'Low to moderate precipitation', biome: 'Boreal forest - taiga' },
          'Dfd': { name: 'Extreme Subarctic', temp: 'Cool summers - extremely cold winters', precip: 'Low precipitation', biome: 'Sparse boreal forest' },
          'ET': { name: 'Tundra', temp: 'Cold year-round', precip: 'Low precipitation', biome: 'Permafrost - mosses - lichens' },
          'EF': { name: 'Ice Cap', temp: 'Extremely cold year-round', precip: 'Minimal precipitation', biome: 'Permanent ice and snow' }
        };
        
        if (!descriptions[code]) {
          Output.send(msg.who, `Invalid climate code: ${code}`);
          return;
        }
        
        const desc = descriptions[code];
        const climate = {
          koppen_code: code,
          climate_name: desc.name,
          temperature_profile: desc.temp,
          precipitation_profile: desc.precip,
          biome_hint: desc.biome
        };
        
        calendar.climate = climate;
        HandoutManager.saveCalendar(calendar);
        Commands.renderInterface(msg);
        
        Output.send(msg.who, `Climate set to: ${desc.name} (${code})`);
      });
    },

    toggleUnits: (msg) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        
        // Toggle between 'us' and 'metric'
        calendar.units = (calendar.units === 'us') ? 'metric' : 'us';
        
        HandoutManager.saveCalendar(calendar);
        Commands.renderInterface(msg);
      });
    },


    setVernalEquinox: (msg, dayStr) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const day = parseInt(dayStr);

        if (isNaN(day) || day < 1 || day > calendar.daysInYear) {
          Output.send(msg.who, `Invalid day. Must be between 1 and ${calendar.daysInYear}`);
          return;
        }

        calendar.seasons.vernalEquinox = day;
        HandoutManager.saveCalendar(calendar);

        Output.send(msg.who, `Vernal Equinox set to day ${day}`);
        Commands.renderInterface(msg);
      });
    },

    toggleLeapYear: (msg) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        calendar.leapYears.enabled = !calendar.leapYears.enabled;
      
        HandoutManager.saveCalendar(calendar);

        Output.send(msg.who, `Leap years ${calendar.leapYears.enabled ? 'enabled' : 'disabled'}`);
        Commands.renderInterface(msg);
      });
    },

    setLeapCycle: (msg, cycleStr) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const cycle = parseInt(cycleStr);

        if (isNaN(cycle) || cycle < 1) {
          Output.send(msg.who, 'Invalid cycle. Must be a positive number.');
          return;
        }

        calendar.leapYears.cycle = cycle;
        HandoutManager.saveCalendar(calendar);

        Output.send(msg.who, `Leap year cycle set to every ${cycle} years`);
        Commands.renderInterface(msg);
      });
    },

    addLeapException: (msg, yearStr) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const year = parseInt(yearStr);

        if (isNaN(year)) {
          Output.send(msg.who, 'Invalid year');
          return;
        }

        if (!calendar.leapYears.exceptions) {
          calendar.leapYears.exceptions = [];
        }

        if (calendar.leapYears.exceptions.includes(year)) {
          Output.send(msg.who, `Year ${year} is already an exception`);
          return;
        }

        calendar.leapYears.exceptions.push(year);
        calendar.leapYears.exceptions.sort((a, b) => a - b);

        HandoutManager.saveCalendar(calendar);

        Commands.renderInterface(msg);
      });
    },

    removeLeapException: (msg, idxStr) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const idx = parseInt(idxStr);

        if (!calendar.leapYears.exceptions || idx < 0 || idx >= calendar.leapYears.exceptions.length) {
          Output.send(msg.who, 'Invalid exception index');
          return;
        }

        const year = calendar.leapYears.exceptions[idx];
        calendar.leapYears.exceptions.splice(idx, 1);

        HandoutManager.saveCalendar(calendar);

        Commands.renderInterface(msg);
      });
    },


    addHoliday: (msg, holidayData) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const parts = holidayData.split('|');

        Logger.debug(`addHoliday received: "${holidayData}"`);

        if (parts.length < 4) {
          Output.send(msg.who, `Invalid format. Expected: Name|Month|Day|Recurring|Description. Got: "${holidayData}"`);
          return;
        }

        const name = parts[0].trim();
        const month = parseInt(parts[1]);
        const day = parseInt(parts[2]);
        const recurring = parts[3].trim() === 'Yes';
        const description = parts[4] ? parts[4].trim() : '';

        if (isNaN(month) || isNaN(day)) {
          Output.send(msg.who, `Invalid month or day. Month=${parts[1]}, Day=${parts[2]}`);
          return;
        }

        if (month < 1 || month > calendar.months.length) {
          Output.send(msg.who, `Invalid month. Must be between 1 and ${calendar.months.length}`);
          return;
        }

        const holiday = DataModels.createHoliday(name, {month, day}, recurring, description);
      
        if (!calendar.holidays) {
          calendar.holidays = [];
        }
        calendar.holidays.push(holiday);

        HandoutManager.saveCalendar(calendar);

        Commands.renderInterface(msg);
      });
    },

    editHoliday: (msg, holidayData) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const parts = holidayData.split('|');

        if (parts.length < 6) {
          Output.send(msg.who, `Invalid format. Expected: Index|Name|Month|Day|Recurring|Description`);
          return;
        }

        const idx = parseInt(parts[0]);
        const name = parts[1].trim();
        const month = parseInt(parts[2]);
        const day = parseInt(parts[3]);
        const recurring = parts[4].trim() === 'Yes';
        const description = parts[5].trim();

        if (isNaN(idx) || idx < 0 || idx >= calendar.holidays.length) {
          Output.send(msg.who, `Invalid holiday index: ${idx}`);
          return;
        }

        if (isNaN(month) || isNaN(day)) {
          Output.send(msg.who, `Invalid month or day`);
          return;
        }

        if (month < 1 || month > calendar.months.length) {
          Output.send(msg.who, `Invalid month. Must be between 1 and ${calendar.months.length}`);
          return;
        }

        // Update all fields
        calendar.holidays[idx].name = name;
        calendar.holidays[idx].dateRef = { month, day };
        calendar.holidays[idx].recurring = recurring;
        calendar.holidays[idx].description = description;

        HandoutManager.saveCalendar(calendar);

        Commands.renderInterface(msg);
      });
    },

    holidayWhisper: (msg, holidayId) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const holiday = calendar.holidays.find(h => h.id === holidayId);

        if (!holiday) {
          Output.send(msg.who, `Holiday not found`);
          return;
        }

        const CSS_CURRENT = getCSS();
        let output = `<strong style="${CSS_CURRENT.holiday}">${holiday.name}</strong>`;
        if (holiday.description) {
          output += `<br>${holiday.description}`;
        }
        output += `<br>`;
        output += `<a style="${CSS_CURRENT.button}" href="!chr --holidayannounce ${holiday.id}">Announce publicly</a>`;

        Output.send(msg.who, output);
      });
    },

    holidayAnnounce: (msg, holidayId) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const holiday = calendar.holidays.find(h => h.id === holidayId);

        if (!holiday) {
          Output.send(msg.who, `Holiday not found`);
          return;
        }

        const CSS_CURRENT = getCSS();
        let output = `<div style="${CSS_CURRENT.chatOutput}">`;
        output += `<strong style="${CSS_CURRENT.holiday}">${holiday.name}</strong>`;
        if (holiday.description) {
          output += `<br>${holiday.description}`;
        }
        output += `</div>`;

        Output.broadcast(output);
      });
    },

    imageWhisper: (msg, imageUrl) => {
      const CSS_CURRENT = getCSS();
      let output = `<img src="${decodeURIComponent(imageUrl)}" style="max-width: 100%; height: auto; margin: 10px 0;">`;
      output += `<br>`;
      output += `<a style="${CSS_CURRENT.button}" href="!chr --imageannounce ${imageUrl}">Display Publicly</a>`;

      Output.send(msg.who, output);
    },

    imageAnnounce: (msg, imageUrl) => {
      const CSS_CURRENT = getCSS();
      let output = `<div style="${CSS_CURRENT.chatOutput}">`;
      output += `<img src="${decodeURIComponent(imageUrl)}" style="max-width: 100%; height: auto; margin: 10px 0;">`;
      output += `</div>`;

      Output.broadcast(output);
    },

    addSpecialDay: (msg, dayType) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        
        // Build month list for query
        const monthList = calendar.months.map((m, idx) => `${m.name},${idx + 1}`).join('|');
        
        // Create direct query based on type - this will be embedded in a button href
        let query = `!chr --savespecialday ${dayType}|?{Name}|?{After Which Month?|${monthList}}|?{After Which Day? (0=before month)}|?{Week Behavior|Part of week,partOfWeek|Between weeks,betweenWeeks}`;
        
        if (dayType === 'leap') {
          query += `|?{Every N years (frequency)|4}|?{Year offset|0}`;
        }
        
        query += `|?{Description (optional)|}`;
        
        // This command should not be called from Design mode buttons anymore
        // But keep for backwards compatibility
        const CSS_CURRENT = getCSS();
        Output.send(msg.who, `<a style="${CSS_CURRENT.button}" href="${query}">Configure Special Day</a>`);
      });
    },

    saveSpecialDay: (msg, specialDayData) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const parts = specialDayData.split('|');
        
        const dayType = parts[0]; // 'fixed' or 'leap'
        const name = parts[1].trim();
        const monthParts = parts[2].split(','); // "MonthName,MonthNumber"
        const afterMonth = parseInt(monthParts[1] || monthParts[0]); // Use number part or fallback
        const afterDay = parseInt(parts[3]);
        const weekBehaviorParts = parts[4].split(',');
        const weekBehavior = weekBehaviorParts[1] || weekBehaviorParts[0]; // Get second part or fallback
        
        let frequency = null;
        let offset = 0;
        let description = '';
        
        if (dayType === 'leap') {
          frequency = parseInt(parts[5]);
          offset = parseInt(parts[6]);
          description = parts[7] ? parts[7].trim() : '';
        } else {
          description = parts[5] ? parts[5].trim() : '';
        }
        
        if (!name || isNaN(afterMonth) || isNaN(afterDay)) {
          Output.send(msg.who, `Invalid input. Name: "${name}", Month: ${afterMonth}, Day: ${afterDay}`);
          return;
        }
        
        const specialDay = DataModels.createInterMonthDay(
          name,
          { afterMonth, afterDay },
          weekBehavior === 'betweenWeeks',
          dayType,
          frequency,
          offset,
          description
        );
        
        if (!calendar.interMonthDays) {
          calendar.interMonthDays = [];
        }
        calendar.interMonthDays.push(specialDay);
        
        HandoutManager.saveCalendar(calendar);
        Commands.renderInterface(msg);
      });
    },

    editSpecialDay: (msg, idx) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const CSS_CURRENT = getCSS();
        const index = parseInt(idx);
        
        if (!calendar.interMonthDays || index < 0 || index >= calendar.interMonthDays.length) {
          Output.send(msg.who, 'Special day not found');
          return;
        }
        
        const sd = calendar.interMonthDays[index];
        const escapedName = sd.name.replace(/\|/g, '&#124;').replace(/\}/g, '&#125;');
        const escapedDesc = (sd.description || '').replace(/\|/g, '&#124;').replace(/\}/g, '&#125;');
        
        // Build month list with current selection first
        const currentMonth = calendar.months[sd.position.afterMonth - 1];
        const monthList = calendar.months.map((m, idx) => {
          const num = idx + 1;
          return num === sd.position.afterMonth ? `${m.name},${num}` : `${m.name},${num}`;
        }).join('|');
        const monthDefault = `${currentMonth.name},${sd.position.afterMonth}`;
        
        // Week behavior with current as default
        const weekBehaviorDefault = sd.breaksWeekCycle ? 'Between weeks,betweenWeeks' : 'Part of week,partOfWeek';
        
        let query = `!chr --updatespecialday ${index}|${sd.dayType}|?{Name|${escapedName}}|?{After Which Month?|${monthDefault}|${monthList}}|?{After Which Day?|${sd.position.afterDay}}|?{Week Behavior|${weekBehaviorDefault}|Part of week,partOfWeek|Between weeks,betweenWeeks}`;
        
        if (sd.dayType === 'leap') {
          query += `|?{Frequency|${sd.frequency}}|?{Offset|${sd.offset}}`;
        }
        
        query += `|?{Description|${escapedDesc}}`;
        
        Output.send(msg.who, Output.makeButton('Update Special Day', query, CSS_CURRENT.button));
      });
    },

    updateSpecialDay: (msg, specialDayData) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const parts = specialDayData.split('|');
        
        const index = parseInt(parts[0]);
        const dayType = parts[1];
        const name = parts[2].trim();
        const monthParts = parts[3].split(',');
        const afterMonth = parseInt(monthParts[1] || monthParts[0]);
        const afterDay = parseInt(parts[4]);
        const weekBehaviorParts = parts[5].split(',');
        const weekBehavior = weekBehaviorParts[1] || weekBehaviorParts[0];
        
        let frequency = null;
        let offset = 0;
        let description = '';
        
        if (dayType === 'leap') {
          frequency = parseInt(parts[6]);
          offset = parseInt(parts[7]);
          description = parts[8] ? parts[8].trim() : '';
        } else {
          description = parts[6] ? parts[6].trim() : '';
        }
        
        if (!calendar.interMonthDays || index < 0 || index >= calendar.interMonthDays.length) {
          Output.send(msg.who, 'Special day not found');
          return;
        }
        
        calendar.interMonthDays[index].name = name;
        calendar.interMonthDays[index].position = { afterMonth, afterDay };
        calendar.interMonthDays[index].breaksWeekCycle = (weekBehavior === 'betweenWeeks');
        calendar.interMonthDays[index].dayType = dayType;
        calendar.interMonthDays[index].frequency = frequency;
        calendar.interMonthDays[index].offset = offset;
        calendar.interMonthDays[index].description = description;
        
        HandoutManager.saveCalendar(calendar);
        Commands.renderInterface(msg);
      });
    },

    deleteSpecialDay: (msg, idxStr) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const idx = parseInt(idxStr);
        
        if (!calendar.interMonthDays || idx < 0 || idx >= calendar.interMonthDays.length) {
          Output.send(msg.who, 'Invalid special day index');
          return;
        }
        
        const sd = calendar.interMonthDays[idx];
        calendar.interMonthDays.splice(idx, 1);
        
        HandoutManager.saveCalendar(calendar);
        Commands.renderInterface(msg);
      });
    },

    specialDayWhisper: (msg, specialDayId) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const specialDay = (calendar.interMonthDays || []).find(sd => sd.id === specialDayId);
        
        if (!specialDay) {
          Output.send(msg.who, `Special day not found`);
          return;
        }
        
        const CSS_CURRENT = getCSS();
        let output = `<strong style="${CSS_CURRENT.holiday}">${specialDay.name}</strong>`;
        if (specialDay.description) {
          output += `<br>${specialDay.description}`;
        }
        output += `<br>`;
        output += `<a style="${CSS_CURRENT.button}" href="!chr --specialdayannounce ${specialDay.id}">Announce publicly</a>`;
        
        Output.send(msg.who, output);
      });
    },

    specialDayAnnounce: (msg, specialDayId) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const specialDay = (calendar.interMonthDays || []).find(sd => sd.id === specialDayId);
        
        if (!specialDay) {
          Output.send(msg.who, `Special day not found`);
          return;
        }
        
        const CSS_CURRENT = getCSS();
        let output = `<div style="${CSS_CURRENT.chatOutput}">`;
        output += `<strong style="${CSS_CURRENT.holiday}">${specialDay.name}</strong>`;
        if (specialDay.description) {
          output += `<br>${specialDay.description}`;
        }
        output += `</div>`;
        
        Output.broadcast(output);
      });
    },

    setSpecialDay: (msg, specialDayData) => {
      DataLoader.loadAll((data) => {
        const parts = specialDayData.split('|');
        const year = parseInt(parts[0]);
        const specialDayId = parts[1];
        
        const calendar = data.calendar;
        const specialDay = (calendar.interMonthDays || []).find(sd => sd.id === specialDayId);
        
        if (!specialDay) {
          Output.send(msg.who, `Special day not found`);
          return;
        }
        
        // Calculate unique day number for this special day
        // Count how many special days come before this one with the same afterMonth and afterDay
        const specialDaysThisYear = DateUtils.getSpecialDaysForYear(year, calendar);
        const sameDaySpecialDays = specialDaysThisYear.filter(sd => 
          sd.position.afterMonth === specialDay.position.afterMonth &&
          sd.position.afterDay === specialDay.position.afterDay
        );
        
        // Find this special day's index among same-day special days
        const index = sameDaySpecialDays.findIndex(sd => sd.id === specialDayId);
        
        // Set currentDate with special day reference and unique fractional day
        State.setConfig('currentDate', {
          year: year,
          month: specialDay.position.afterMonth,
          day: specialDay.position.afterDay + 1 + (index * 0.01), // Unique fractional offset
          specialDayId: specialDayId
        });
        
        // Set viewing month
        State.setConfig('viewingDate', {
          year: year,
          month: specialDay.position.afterMonth
        });
        
        Commands.renderInterface(msg);
      });
    },


    addInterannualDay: (msg, data) => {
      DataLoader.loadAll((calData) => {
        const parts = data.split('|');
        const name = parts[0] || 'Unnamed';
        const position = parts[1] || 'beginning';

        const calendar = calData.calendar;
        if (!calendar.interannualDays) {
          calendar.interannualDays = [];
        }

        // Find the highest order for this position
        const daysAtPosition = calendar.interannualDays.filter(d => d.position === position);
        const maxOrder = daysAtPosition.length > 0 ? Math.max(...daysAtPosition.map(d => d.order || 0)) : -1;

        const newDay = DataModels.createInterannualDay(name, position, maxOrder + 1);
        calendar.interannualDays.push(newDay);

        HandoutManager.saveCalendar(calendar);
        Commands.renderInterface(msg);
      });
    },

    updateInterannualDay: (msg, data) => {
      DataLoader.loadAll((calData) => {
        const parts = data.split('|');
        const idx = parseInt(parts[0]);
        const name = parts[1] || 'Unnamed';

        const calendar = calData.calendar;
        if (calendar.interannualDays && calendar.interannualDays[idx]) {
          calendar.interannualDays[idx].name = name;
          HandoutManager.saveCalendar(calendar);
        }

        Commands.renderInterface(msg);
      });
    },

    deleteInterannualDay: (msg, idxStr) => {
      DataLoader.loadAll((calData) => {
        const calendar = calData.calendar;
        const idx = parseInt(idxStr);

        if (calendar.interannualDays && idx >= 0 && idx < calendar.interannualDays.length) {
          calendar.interannualDays.splice(idx, 1);
          HandoutManager.saveCalendar(calendar);
        }

        Commands.renderInterface(msg);
      });
    },

    moveInterannualDay: (msg, data) => {
      DataLoader.loadAll((calData) => {
        const parts = data.split('|');
        const idx = parseInt(parts[0]);
        const direction = parts[1];

        const calendar = calData.calendar;
        if (!calendar.interannualDays || idx < 0 || idx >= calendar.interannualDays.length) {
          Commands.renderInterface(msg);
          return;
        }

        const day = calendar.interannualDays[idx];
        const daysAtPosition = calendar.interannualDays.filter(d => d.position === day.position);
        const positionIndex = daysAtPosition.indexOf(day);

        if (direction === 'up' && positionIndex > 0) {
          // Swap orders with previous day
          const prevDay = daysAtPosition[positionIndex - 1];
          [day.order, prevDay.order] = [prevDay.order, day.order];
          HandoutManager.saveCalendar(calendar);
        } else if (direction === 'down' && positionIndex < daysAtPosition.length - 1) {
          // Swap orders with next day
          const nextDay = daysAtPosition[positionIndex + 1];
          [day.order, nextDay.order] = [nextDay.order, day.order];
          HandoutManager.saveCalendar(calendar);
        }

        Commands.renderInterface(msg);
      });
    },

    viewInterannualDay: (msg, data) => {
      DataLoader.loadAll((calData) => {
        const parts = data.split('|');
        const year = parseInt(parts[0]);
        const position = parts[1];
        const order = parseInt(parts[2]);

        const calendar = calData.calendar;

        // Set current date to this interannual day
        State.setConfig('currentDate', {
          year: year,
          isInterannual: true,
          position: position,
          order: order
        });

        // Set viewing month (first month for beginning, last for end)
        const viewMonth = position === 'beginning' ? 1 : calendar.months.length;
        State.setConfig('viewingDate', {
          year: year,
          month: viewMonth
        });

        Commands.renderInterface(msg);
      });
    },

    deleteHoliday: (msg, idxStr) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const idx = parseInt(idxStr);

        if (!calendar.holidays || idx < 0 || idx >= calendar.holidays.length) {
          Output.send(msg.who, 'Invalid holiday index');
          return;
        }

        const holiday = calendar.holidays[idx];
        calendar.holidays.splice(idx, 1);

        HandoutManager.saveCalendar(calendar);

        Commands.renderInterface(msg);
      });
    },


    moveMonth: (msg, moveData) => {
        const calendar = data.calendar;
        const parts = moveData.split('|');
        const idx = parseInt(parts[0]);
        const direction = parts[1];

        if (isNaN(idx) || idx < 0 || idx >= calendar.months.length) {
          Output.send(msg.who, 'Invalid month index');
          return;
        }

        const newIdx = direction === 'up' ? idx - 1 : idx + 1;

        if (newIdx < 0 || newIdx >= calendar.months.length) {
          return; // Can't move beyond boundaries
        }

        // Swap
        const temp = calendar.months[idx];
        calendar.months[idx] = calendar.months[newIdx];
        calendar.months[newIdx] = temp;

        // Update order property
        calendar.months.forEach((m, i) => {
          m.order = i;
        });

        HandoutManager.saveCalendar(calendar);

        Commands.renderInterface(msg);
      },


    moveMoon: (msg, moveData) => {
        const moons = data.moons;
        const parts = moveData.split('|');
        const idx = parseInt(parts[0]);
        const direction = parts[1];

        if (isNaN(idx) || idx < 0 || idx >= moons.length) {
          Output.send(msg.who, 'Invalid moon index');
          return;
        }

        const newIdx = direction === 'up' ? idx - 1 : idx + 1;

        if (newIdx < 0 || newIdx >= moons.length) {
          return; // Can't move beyond boundaries
        }

        // Swap
        const temp = moons[idx];
        moons[idx] = moons[newIdx];
        moons[newIdx] = temp;


        Commands.renderInterface(msg);
      },


    moveHoliday: (msg, moveData) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const parts = moveData.split('|');
        const idx = parseInt(parts[0]);
        const direction = parts[1];

        if (!calendar.holidays || isNaN(idx) || idx < 0 || idx >= calendar.holidays.length) {
          Output.send(msg.who, 'Invalid holiday index');
          return;
        }

        const newIdx = direction === 'up' ? idx - 1 : idx + 1;

        if (newIdx < 0 || newIdx >= calendar.holidays.length) {
          return; // Can't move beyond boundaries
        }

        // Swap
        const temp = calendar.holidays[idx];
        calendar.holidays[idx] = calendar.holidays[newIdx];
        calendar.holidays[newIdx] = temp;

        HandoutManager.saveCalendar(calendar);

        Commands.renderInterface(msg);
      });
    },


    editMonth: (msg, idx) => {
      DataLoader.loadAll((data) => {
          const calendar = data.calendar;
          const monthIndex = parseInt(idx);
          const month = calendar.months[monthIndex];
      
          if (!month) {
            Output.send(msg.who, 'Invalid month index');
            return;
          }

          Output.send(msg.who, `To edit "${month.name}", type: <strong>!chr --updatemonth ${idx}|?{New Month Name|${month.name}}|?{New Days|${month.days}}</strong>`);
      });
    },

    updateMonth: (msg, monthData) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
    
        Logger.debug(`updateMonth received: "${monthData}"`);
    
        const parts = monthData.split('|');
    
        if (parts.length < 3) {
          Output.send(msg.who, `Invalid format. Received ${parts.length} parts. Expected: Index|Name|Days. Got: "${monthData}"`);
          return;
        }

        const idx = parseInt(parts[0]);
        const name = parts[1].trim();
        const days = parseInt(parts[2]);

        if (isNaN(idx) || isNaN(days) || !calendar.months[idx]) {
          Output.send(msg.who, `Invalid month data. Index=${parts[0]}, Name=${parts[1]}, Days=${parts[2]}`);
          return;
        }

        calendar.months[idx].name = name;
        calendar.months[idx].days = days;

        HandoutManager.saveCalendar(calendar);

        Commands.renderInterface(msg);
      });
    },

    deleteMonth: (msg, idx) => {
      DataLoader.loadAll((data) => {
            const calendar = data.calendar;
            const monthIndex = parseInt(idx);
            const month = calendar.months[monthIndex];
      
            if (!month) {
              Output.send(msg.who, 'Invalid month index');
              return;
            }

            calendar.months.splice(monthIndex, 1);
      
            // Re-index remaining months
            calendar.months.forEach((m, i) => {
              m.order = i;
            });

            HandoutManager.saveCalendar(calendar);

            Commands.renderInterface(msg);
          });
        },

        editMoon: (msg, idx) => {
      DataLoader.loadAll((data) => {
              const moons = data.moons;
              const moonIndex = parseInt(idx);
              const moon = moons[moonIndex];
      
              if (!moon) {
                Output.send(msg.who, 'Invalid moon index');
                return;
              }

              Output.send(msg.who, `To edit "${moon.name}", use: <strong>!chr --updatemoon ${idx}|?{Moon Name|${moon.name}}|?{Period|${moon.period}}|?{Full Year|${moon.fullDayRef.year}}|?{Full Month|${moon.fullDayRef.month}}|?{Full Day|${moon.fullDayRef.day}}</strong>`);
      });
    },

    updateMoon: (msg, moonData) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const moons = calendar.moons || [];
        const parts = moonData.split('|');
      
        if (parts.length < 6) {
          Output.send(msg.who, 'Invalid format');
          return;
        }

        const idx = parseInt(parts[0]);
        const name = parts[1].trim();
        const period = parseFloat(parts[2]); // Changed to parseFloat for decimal support
        const fullYear = parseInt(parts[3]);
        const fullMonth = parseInt(parts[4]);
        const fullDay = parseInt(parts[5]);
        const size = parts.length > 6 ? parseFloat(parts[6]) : (moons[idx].size || 1);
        const color = parts.length > 7 ? parts[7].trim() : (moons[idx].color || 'yellow');
        const display = parts.length > 8 ? parts[8].trim() === 'true' : (moons[idx].display !== false);

        if (isNaN(idx) || !moons[idx]) {
          Output.send(msg.who, 'Invalid moon index');
          return;
        }

        moons[idx].name = name;
        moons[idx].period = period;
        moons[idx].fullDayRef = { year: fullYear, month: fullMonth, day: fullDay };
        moons[idx].size = size;
        moons[idx].color = color;
        moons[idx].display = display;

        calendar.moons = moons;
        HandoutManager.saveCalendar(calendar);

        Commands.renderInterface(msg);
      });
    },

    deleteMoon: (msg, idx) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const moons = calendar.moons || [];
        const moonIndex = parseInt(idx);
        const moon = moons[moonIndex];
      
        if (!moon) {
          Output.send(msg.who, 'Invalid moon index');
          return;
        }

        moons.splice(moonIndex, 1);

        calendar.moons = moons;
        HandoutManager.saveCalendar(calendar);

        Commands.renderInterface(msg);
      });
    },

    editWeekdays: (msg) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const current = calendar.weeks.weekdayNames.join(',');
      
        Output.send(msg.who, `Current weekdays: ${current}<br>To change, type: <strong>!chr --saveweekdays ?{Weekday Names (comma-separated)|${current}}</strong>`);
      });
    },

    saveWeekdays: (msg, weekdayData) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const weekdays = weekdayData.split(',').map(w => w.trim());

        if (weekdays.length !== calendar.weeks.daysInWeek) {
          Output.send(msg.who, `Error: You must provide exactly ${calendar.weeks.daysInWeek} weekday names`);
          return;
        }

        calendar.weeks.weekdayNames = weekdays;
        HandoutManager.saveCalendar(calendar);

        Commands.renderInterface(msg);
      });
    },

    editCalendarName: (msg) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        Output.send(msg.who, `Current name: ${calendar.name}<br>To change, type: <strong>!chr --savename ?{Calendar Name|${calendar.name}}</strong>`);
      });
    },

    saveCalendarName: (msg, newName) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const oldName = calendar.name;
        calendar.name = newName;

        // Save with new name
        const newHandoutName = HANDOUT_PREFIX + ' Calendar: ' + newName;
        State.setConfig('currentCalendar', newHandoutName);
        HandoutManager.saveCalendar(calendar);

        Output.send(msg.who, 'Calendar renamed from "' + oldName + '" to "' + newName + '"');
        Commands.renderInterface(msg);
      });
    },

    saveDescription: (msg, description) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        calendar.description = description || '';
        
        HandoutManager.saveCalendar(calendar);
        Commands.renderInterface(msg);
      });
    },

    editDaysInYear: (msg) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        Output.send(msg.who, `Current days in year: ${calendar.daysInYear}<br>To change, type: <strong>!chr --savedaysinyear ?{Days in Year|${calendar.daysInYear}}</strong>`);
      });
    },

    saveDaysInYear: (msg, days) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const numDays = parseInt(days);

        if (isNaN(numDays) || numDays < 1) {
          Output.send(msg.who, 'Invalid number of days');
          return;
        }

        calendar.daysInYear = numDays;
        HandoutManager.saveCalendar(calendar);

        Output.send(msg.who, `Days in year set to ${numDays}`);
        Commands.renderInterface(msg);
      });
    },

    editDaysInWeek: (msg) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        Output.send(msg.who, `Current days in week: ${calendar.weeks.daysInWeek}<br>To change, type: <strong>!chr --savedaysinweek ?{Days in Week|${calendar.weeks.daysInWeek}}</strong>`);
      });
    },

    saveDaysInWeek: (msg, days) => {
      DataLoader.loadAll((data) => {
        const calendar = data.calendar;
        const numDays = parseInt(days);

        if (isNaN(numDays) || numDays < 1) {
          Output.send(msg.who, 'Invalid number of days');
          return;
        }

        calendar.weeks.daysInWeek = numDays;
      
        // Adjust weekday names if needed
        while (calendar.weeks.weekdayNames.length < numDays) {
          calendar.weeks.weekdayNames.push(`Day${calendar.weeks.weekdayNames.length + 1}`);
        }
        while (calendar.weeks.weekdayNames.length > numDays) {
          calendar.weeks.weekdayNames.pop();
        }

        HandoutManager.saveCalendar(calendar);

        Output.send(msg.who, `Days in week set to ${numDays}`);
        Commands.renderInterface(msg);
      });
    },

    sendCalendarToChat: (msg) => {
      DataLoader.loadAll((data) => {
                  const CSS_CURRENT = getCSS();
                  const calendar = data.calendar;
                  const viewingDate = State.config().viewingDate;
                  const currentDate = State.config().currentDate;
                  const month = calendar.months[currentDate.month - 1];
                  const moons = data.moons;
                  const events = data.events;
                  const notes = data.notes;
                  const weather = data.weather;

                  if (!month) {
                    Output.send(msg.who, 'Invalid month');
                    return;
                  }

                  // Calculate day of year (1-based, counting from month 1 day 1)
                  let dayOfYear = 0;
                  for (let m = 1; m < currentDate.month; m++) {
                    dayOfYear += DateUtils.getDaysInMonth(m, currentDate.year, calendar);
                  }
                  dayOfYear += currentDate.day;

                  const daysInYear = DateUtils.getDaysInYear(currentDate.year, calendar);
                  const vernal = calendar.seasons.vernalEquinox || 80;
                  const seasonOffset = Math.floor(daysInYear / 12);
                  
                  const springStart = vernal - seasonOffset;
                  const summerStart = vernal + Math.floor(daysInYear / 4) - seasonOffset;
                  const autumnStart = vernal + Math.floor(daysInYear / 2) - seasonOffset;
                  const winterStart = vernal + Math.floor(3 * daysInYear / 4) - seasonOffset;
      
                  let season = 'Winter';
                  if (dayOfYear >= springStart && dayOfYear < summerStart) {
                    season = 'Spring';
                  } else if (dayOfYear >= summerStart && dayOfYear < autumnStart) {
                    season = 'Summer';
                  } else if (dayOfYear >= autumnStart && dayOfYear < winterStart) {
                    season = 'Autumn';
                  } else {
                    season = 'Winter';
                  }

                  let output = `<div style="${CSS_CURRENT.chatOutput}">`;
                  output += `<div style="font-weight:bold;margin-bottom:5px;">${month.name} ${currentDate.day}, ${currentDate.year}</div>`;
                  output += `<div style="font-size:11px;margin-bottom:5px;"><em>Season: ${season} (Day ${dayOfYear} of ${daysInYear})</em></div>`;

                  // Current day's weather
                  const todayWeather = weather.find(w => 
                    w.dateRef.year === currentDate.year && 
                    w.dateRef.month === currentDate.month && 
                    w.dateRef.day === currentDate.day
                  );
                  if (todayWeather) {
                    const weatherEmoji = todayWeather.emoji || WeatherGenerator.getWeatherEmoji(todayWeather.description);
                    const emojiStyle = CSS_CURRENT.emojiCircle.replace('float: right;', '').replace('float:right;', '') + 'display: inline-block; vertical-align: middle;';
                    output += `<div style="margin-top:5px;font-size:11px;"><strong>Weather:</strong> <div style="${emojiStyle}">${weatherEmoji}</div> ${todayWeather.description} (${todayWeather.temperature.value}°${todayWeather.temperature.unit})</div>`;
                  }

                  // Current day's holidays
                  const todayHolidays = (calendar.holidays || []).filter(h => 
                    h.dateRef.month === currentDate.month && 
                    h.dateRef.day === currentDate.day
                  );
                  if (todayHolidays.length > 0) {
                    output += '<div style="margin-top:5px;font-size:11px;"><strong>Holidays:</strong> ';
                    output += todayHolidays.map(h => 
                      `<a style="${CSS_CURRENT.holiday} text-decoration: underline; cursor: pointer; background: none; border: none;" href="!chr --holidayannounce ${h.id}">${h.name}</a>`
                    ).join(', ');
                    output += '</div>';
                  }

                  // Current day's special days
                  const todaySpecialDay = DateUtils.isSpecialDay(currentDate.month, currentDate.day, currentDate.year, calendar);
                  if (todaySpecialDay) {
                    output += '<div style="margin-top:5px;font-size:11px;"><strong>Special Day:</strong> ';
                    output += `<a style="${CSS_CURRENT.holiday} text-decoration: underline; cursor: pointer; background: none; border: none;" href="!chr --specialdayannounce ${todaySpecialDay.id}">${todaySpecialDay.name}</a>`;
                    output += '</div>';
                  }

                  // Current day's events (exclude gm tagged)
                  const todayEvents = events.filter(e => 
                    e.dateRef.year === currentDate.year && 
                    e.dateRef.month === currentDate.month && 
                    e.dateRef.day === currentDate.day &&
                    !(e.tags && e.tags.includes('gm'))
                  );
                  if (todayEvents.length > 0) {
                    output += '<div style="margin-top:5px;font-size:11px;"><strong>Events:</strong></div><ul style="margin:2px 0;padding-left:15px;font-size:13px;">';
                    todayEvents.forEach(e => output += `<li>${MarkdownParser.renderAsHtml(e.content, calendar, {sendToChat: true})}</li>`);
                    output += '</ul>';
                  }

                  // Current day's notes (exclude gm tagged)
                  const todayNotes = notes.filter(n => 
                    n.dateRef.year === currentDate.year && 
                    n.dateRef.month === currentDate.month && 
                    n.dateRef.day === currentDate.day &&
                    !(n.tags && n.tags.includes('gm'))
                  );
                  if (todayNotes.length > 0) {
                    output += '<div style="margin-top:5px;font-size:11px;"><strong>Notes:</strong></div><ul style="margin:2px 0;padding-left:15px;font-size:13px;">';
                    todayNotes.forEach(n => output += `<li>${MarkdownParser.renderAsHtml(n.content, calendar, {sendToChat: true})}</li>`);
                    output += '</ul>';
                  }

                  // Week context (simplified calendar)
                  const daysInWeek = calendar.weeks.daysInWeek;
                  const daysInMonth = DateUtils.getDaysInMonth(currentDate.month, currentDate.year, calendar);
                  const currentAbsDay = DateUtils.toAbsoluteDay(currentDate, calendar);
                  const currentWeekday = (currentAbsDay - 1) % daysInWeek;
                  const weekStart = currentDate.day - currentWeekday;

                  output += '<div style="margin-top:10px;"><strong>This Week:</strong></div>';
                  output += '<table style="width:100%;border-collapse:collapse;font-size:10px;margin:5px 0;">';
      
                  // Weekday headers
                  output += '<tr>';
                  for (let i = 0; i < Math.min(daysInWeek, 7); i++) {
                    const dayName = calendar.weeks.weekdayNames[i] || i;
                    output += `<th style="border:1px solid #666;padding:2px;vertical-align:top;">${dayName.substr(0, 2)}</th>`;
                  }
                  output += '</tr>';

                  output += '<tr>';
                  for (let i = 0; i < Math.min(daysInWeek, 7); i++) {
                    const day = weekStart + i;
                    if (day < 1 || day > daysInMonth) {
                      output += '<td style="border:1px solid #666;padding:2px;opacity:0.3;vertical-align:top;">-</td>';
                    } else {
                      const isToday = day === currentDate.day;
                      const style = isToday ? 
                        'border:2px solid #6b8cae;padding:1px;font-weight:bold;vertical-align:top;background:#5a5a5a;' : 
                        'border:1px solid #666;padding:2px;vertical-align:top;';
          
                      output += `<td style="${style}"><div>${day}</div>`;
          
                      // Moon phases (SVG, visible moons only)
                      if (moons && moons.length > 0) {
                        const date = {year: currentDate.year, month: currentDate.month, day: day};
                        const phases = MoonPhaseCalculator.getAllPhases(moons, date, calendar);
                        if (phases.length > 0) {
                          output += `<div style="font-size:8px;">`;
                          phases.forEach(p => output += p.html);
                          output += `</div>`;
                        }
                      }
          
                      // Weather emoji
                      const w = weather.find(ww => ww.dateRef.year === currentDate.year && ww.dateRef.month === currentDate.month && ww.dateRef.day === day);
                      if (w) {
                        const weatherEmoji = w.emoji || WeatherGenerator.getWeatherEmoji(w.description);
                        output += `<div style="font-size:8px;">${weatherEmoji}</div>`;
                      }
          
                      output += '</td>';
                    }
                  }
                  output += '</tr></table>';

                  output += '</div>';

                  Output.broadcast(output);
      });
    },

    sendDesignToChat: (msg) => {
      DataLoader.loadAll((data) => {
        const CSS_CURRENT = getCSS();
        const calendar = data.calendar;
        const moons = data.moons;

                  let output = `<div style="${CSS_CURRENT.chatOutput}">`;
                  output += `<div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">${calendar.name} - Calendar Structure</div>`;
      
                  output += `<div style="font-size: 11px; margin: 5px 0;">`;
                  output += `<strong>Days in Year:</strong> ${calendar.daysInYear} | `;
                  output += `<strong>Days in Week:</strong> ${calendar.weeks.daysInWeek}`;
                  output += `</div>`;

                  output += `<div style="font-size: 11px; margin: 5px 0;">`;
                  output += `<strong>Months:</strong> ${calendar.months.map(m => `${m.name} (${m.days})`).join(', ')}`;
                  output += `</div>`;

                  output += `<div style="font-size: 11px; margin: 5px 0;">`;
                  output += `<strong>Weekdays:</strong> ${calendar.weeks.weekdayNames.join(', ')}`;
                  output += `</div>`;

                  if (moons && moons.length > 0) {
                    output += `<div style="font-size: 11px; margin: 5px 0;">`;
                    output += `<strong>Moons:</strong> ${moons.map(m => `${m.name} (${m.period}d)`).join(', ')}`;
                    output += `</div>`;
                  }

                  if (calendar.climate) {
                    output += `<div style="font-size: 11px; margin: 5px 0;">`;
                    output += `<strong>Climate:</strong> ${calendar.climate.climate_name} (${calendar.climate.koppen_code})`;
                    output += `</div>`;
                  }

                  if (calendar.leapYears.enabled) {
                    output += `<div style="font-size: 11px; margin: 5px 0;">`;
                    output += `<strong>Leap Years:</strong> Every ${calendar.leapYears.cycle} years`;
                    output += `</div>`;
                  }

                  output += '</div>';

                  Output.broadcast(output);
      });
    }

  };

  // ==================================================
  // Weather Generator
  // ==================================================

              const WeatherGenerator = {

                getWeatherEmoji: (description) => {
                  if (!description) return '';
      
                  const desc = description.toLowerCase();
      
                  // Check for specific weather types
                  if (desc.includes('snow')) {
                    if (desc.includes('heavy')) return '❄️';
                    if (desc.includes('light')) return '🌨️';
                    return '❄️';
                  }
                  if (desc.includes('thunderstorm')) return '⛈️';
                  if (desc.includes('rain')) {
                    if (desc.includes('heavy')) return '🌧️';
                    return '🌧️';
                  }
                  if (desc.includes('cloudy') || desc.includes('overcast')) return '☁️';
                  if (desc.includes('partly')) return '⛅';
                  if (desc.includes('clear')) {
                    if (desc.includes('cold')) return '🌬️';
                    return '☀️';
                  }
                  if (desc.includes('fog') || desc.includes('mist')) return '🌫️';
      
                  // Default
                  return '🌤️';
                },

                generate: (date, calendar) => {
                  if (!calendar.climate) {
                    return null;
                  }

                  const climate = calendar.climate;
                  const dayOfYear = DateUtils.toAbsoluteDay(date, calendar) % DateUtils.getDaysInYear(date.year, calendar);
      
                  // Determine season
                  const season = WeatherGenerator._getSeason(dayOfYear, calendar);

                  // Generate based on climate and season
                  const temp = WeatherGenerator._generateTemperature(climate, season, calendar.units);
                  const precip = WeatherGenerator._generatePrecipitation(climate, season);
                  const wind = WeatherGenerator._generateWind(climate, season);
                  const description = WeatherGenerator._generateDescription(climate, season, temp, precip, wind);

                  return DataModels.createWeather(date, climate.koppen_code, temp, precip, wind, description);
                },

                _getSeason: (dayOfYear, calendar) => {
                  const vernal = calendar.seasons.vernalEquinox;
                  const daysInYear = calendar.daysInYear;
      
                  // Calculate other equinoxes/solstices at even intervals
                  const summer = vernal + Math.floor(daysInYear / 4);
                  const autumnal = vernal + Math.floor(daysInYear / 2);
                  const winter = vernal + Math.floor(3 * daysInYear / 4);

                  if (dayOfYear >= vernal && dayOfYear < summer) return 'spring';
                  if (dayOfYear >= summer && dayOfYear < autumnal) return 'summer';
                  if (dayOfYear >= autumnal && dayOfYear < winter) return 'autumn';
                  return 'winter';
                },

                _generateTemperature: (climate, season, units) => {
                  const code = climate.koppen_code;
                  let baseTemp = 60; // Default Fahrenheit
                  let seasonalSwing = 15; // Default seasonal temperature variation

                  // Adjust by climate group
                  if (code.startsWith('A')) {
                    baseTemp = 85; // Tropical
                    seasonalSwing = 5; // Minimal seasonal variation in tropics
                  } else if (code.startsWith('B')) {
                    baseTemp = code.includes('h') ? 90 : 70; // Hot/Cold Desert
                    seasonalSwing = code.includes('h') ? 20 : 30; // Large daily and seasonal swings in deserts
                  } else if (code.startsWith('C')) {
                    baseTemp = 65; // Temperate
                    seasonalSwing = 20; // Moderate seasonal variation
                  } else if (code.startsWith('D')) {
                    baseTemp = 45; // Continental
                    seasonalSwing = 35; // Large seasonal variation
                  } else if (code.startsWith('E')) {
                    baseTemp = 20; // Polar
                    seasonalSwing = 25; // Moderate variation (always cold)
                  }

                  // Adjust by season with climate-appropriate swings
                  const seasonMod = {
                    'spring': 0,
                    'summer': seasonalSwing,
                    'autumn': -seasonalSwing * 0.3,
                    'winter': -seasonalSwing * 1.3
                  };
                  baseTemp += seasonMod[season] || 0;

                  // Add random daily variation (larger in continental climates, smaller in maritime)
                  let dailyVariation = 10;
                  if (code.includes('f')) dailyVariation = 7; // Maritime climates more stable
                  if (code.startsWith('D')) dailyVariation = 15; // Continental more variable
                  if (code.startsWith('B')) dailyVariation = 20; // Deserts highly variable
      
                  const variation = Math.floor(Math.random() * (dailyVariation * 2)) - dailyVariation;
                  let temp = baseTemp + variation;

                  const unit = units === 'metric' ? 'C' : 'F';
      
                  if (units === 'metric') {
                    temp = Math.round((temp - 32) * 5 / 9);
                  }

                  return { value: temp, unit: unit };
                },

                _generatePrecipitation: (climate, season) => {
                  const code = climate.koppen_code;
                  const rand = Math.random();

                  // Dry climates (B) - very little precipitation year-round
                  if (code.startsWith('B')) {
                    if (rand < 0.9) return 'Clear';
                    return 'Scattered clouds';
                  }

                  // Rainforest (Af) - heavy rain year-round
                  if (code === 'Af') {
                    if (rand < 0.6) return 'Rain';
                    if (rand < 0.9) return 'Heavy rain';
                    return 'Partly cloudy';
                  }

                  // Monsoon/Tropical Savanna (Aw) - wet summer, dry winter
                  if (code === 'Aw') {
                    if (season === 'summer') {
                      if (rand < 0.7) return 'Heavy rain';
                      return 'Thunderstorms';
                    } else if (season === 'winter') {
                      if (rand < 0.8) return 'Clear';
                      return 'Partly cloudy';
                    } else {
                      if (rand < 0.5) return 'Rain';
                      return 'Cloudy';
                    }
                  }

                  // Mediterranean (Cs) - dry summer, wet winter
                  if (code.startsWith('Cs')) {
                    if (season === 'summer') {
                      if (rand < 0.8) return 'Clear';
                      return 'Partly cloudy';
                    } else if (season === 'winter') {
                      if (rand < 0.6) return 'Rain';
                      return 'Cloudy';
                    } else {
                      if (rand < 0.5) return 'Partly cloudy';
                      return 'Rain';
                    }
                  }

                  // Monsoon temperate (Cw) - dry winter
                  if (code.startsWith('Cw')) {
                    if (season === 'winter') {
                      if (rand < 0.7) return 'Clear';
                      return 'Partly cloudy';
                    } else {
                      if (rand < 0.5) return 'Rain';
                      return 'Cloudy';
                    }
                  }

                  // Marine/Humid climates (Cf, Df) - precipitation year-round but varies by season
                  if (code.includes('f')) {
                    // Winter tends to have more precipitation in continental climates
                    if (code.startsWith('D') && season === 'winter') {
                      if (rand < 0.3) return 'Snow';
                      if (rand < 0.6) return 'Heavy snow';
                      if (rand < 0.8) return 'Cloudy';
                      return 'Light snow';
                    }
        
                    // Summer has more thunderstorms
                    if (season === 'summer') {
                      if (rand < 0.3) return 'Clear';
                      if (rand < 0.5) return 'Partly cloudy';
                      if (rand < 0.7) return 'Cloudy';
                      if (rand < 0.85) return 'Rain';
                      return 'Thunderstorms';
                    }
        
                    // Spring/Autumn moderate
                    if (rand < 0.3) return 'Clear';
                    if (rand < 0.6) return 'Partly cloudy';
                    if (rand < 0.8) return 'Cloudy';
                    return 'Rain';
                  }

                  // Polar (E) - very little precipitation, mostly snow
                  if (code.startsWith('E')) {
                    if (season === 'summer') {
                      if (rand < 0.6) return 'Overcast';
                      if (rand < 0.9) return 'Light snow';
                      return 'Snow';
                    } else {
                      if (rand < 0.5) return 'Clear and cold';
                      if (rand < 0.8) return 'Light snow';
                      return 'Heavy snow';
                    }
                  }

                  // Default fallback
                  if (rand < 0.3) return 'Clear';
                  if (rand < 0.6) return 'Partly cloudy';
                  if (rand < 0.8) return 'Cloudy';
                  if (rand < 0.95) return 'Rain';
                  return 'Thunderstorms';
                },

                _generateWind: (climate, season) => {
                  const rand = Math.random();
      
                  if (rand < 0.4) return 'Calm';
                  if (rand < 0.7) return 'Light breeze';
                  if (rand < 0.9) return 'Moderate wind';
                  if (rand < 0.97) return 'Strong wind';
                  return 'Very strong wind';
                },

                _generateDescription: (climate, season, temp, precip, wind) => {
                  let desc = precip;
      
                  if (precip !== 'Clear' && wind !== 'Calm') {
                    desc += `, ${wind.toLowerCase()}`;
                  }

                  return desc;
                }

              };

              // ==================================================
              // Tag System
              // ==================================================

              const TagSystem = {

                expandPartyTags: (tags) => {
                  // Party management removed - tags are just passed through for now
                  return [...tags];
                },

                getAllTags: (data) => {
                  const events = data.events;
                  const notes = data.notes;
      
                  const allTags = new Set();
      
                  [...events, ...notes].forEach(item => {
                    if (item.tags) {
                      item.tags.forEach(tag => allTags.add(tag));
                    }
                  });

                  return Array.from(allTags).sort();
                },

                filterByTags: (items, tags) => {
                  if (!tags || tags.length === 0) return items;

                  return items.filter(item => {
                    if (!item.tags) return false;
                    return tags.some(tag => item.tags.includes(tag));
                  });
                }

              };

              // ==================================================
              // Input Handler
              // ==================================================

              const handleInput = (msg) => {
                if (msg.type !== 'api') return;

                const parsed = Parser.parse(msg.content);

                if (parsed.command !== '!chronicle' && parsed.command !== '!chr') return;

                Commands.root(msg, parsed);
              };

              // ==================================================
              // Event Registration
              // ==================================================

              const registerEventHandlers = () => {
                on('chat:message', handleInput);
              };

              // ==================================================
              // Initialization
              // ==================================================

              const checkInstall = () => {
                log(`Chronicle v.${version} [${new Date(lastUpdate * 1000)}]. To use, type !chr in chat.`);
                State.initialize();
                return true;
              };

              on('ready', () => {
                if (checkInstall()) {
                  registerEventHandlers();
                }
              });

              // ==================================================
              // Public Interface
              // ==================================================

              return {
                version: version
              };
})();
