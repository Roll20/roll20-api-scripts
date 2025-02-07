# Quest Tracker
Quest Tracker is a comprehensive tool for managing quests, rumours, and events in a tabletop RPG setting. Designed for Roll20, it streamlines quest tracking, automates relationships, and integrates seamlessly with in-game calendars and weather systems. Whether you’re a GM running a sandbox campaign or a player tracking multiple storylines, Quest Tracker provides a clear, interactive framework to manage everything.

### Features

- **Quest Management**
  - Create, edit, and delete quests.
  - Track quest progression with statuses like Started, Completed, Ignored, Failed.
  - Organize quests into structured categories.

- **Rumour System**
  - Add, modify, and dynamically generate rumours.
  - Associate rumours with quests and locations.
  - Trigger quests based on discovered rumours.

- **Event Scheduling**
  - Set one-time or recurring events.
  - Link events to calendar dates.
  - Adjust events dynamically based on in-game timelines.

- **Weather & Climate Integration**
  - Procedural weather generation based on in-game seasons.
  - Regional climate variations and forced weather trends.
  - Immersive weather descriptions tied to game locations.

- **Calendar Integration**
  - Supports multiple calendar systems (Harptos, Gregorian, etc.).
  - Leap years, lunar cycles, and seasonal changes.
  - Customizable calendars for homebrew settings.

- **Visual Quest Tree**
  - Displays quest relationships in a tree format.
  - Handles complex dependencies, including mutually exclusive quests.

- **Trigger System**
  - Automate quest state changes based on dates, quest progression, or external triggers.
  - Chain triggers to create cascading effects across events and quests.


### Getting Started

- **Installation**
  - Quest Tracker is now available as a one-click install on Roll20. Simply enable it from the API Scripts menu in your game settings. The required CalendarData module will be installed automatically.

- **Initialization**
  - Once installed, Quest Tracker will initialize automatically. You’ll see a confirmation message in the API log when it’s ready.

- **Usage**
  - Type !qt in the chat to open the main Quest Tracker menu.
  - Use the interface to manage quests, rumours, events, and weather.
  - Navigate through intuitive menus to update quest statuses, schedule events, and track campaign progress.


## Quest Module

The Quest Module is the core of Quest Tracker, providing a structured way to manage quests, track their progression, and define relationships. Designed for Roll20, it offers a flexible and automated approach to managing quest dependencies, statuses, and triggers within sandbox-style RPG campaigns.

### Core Features
* **Create, Edit, and Delete Quests** – Manage quests directly from an intuitive UI.
* **Track Quest Status** – Automatically update and display quest progress.
Define Prerequisites & Dependencies – Control quest unlocks based on player actions.
* **Mutually Exclusive Quests** – Prevent conflicting quests from being active simultaneously.
* **Quest Triggers** – Automate quest progression when specific conditions are met.
* **Visual Quest Tree** – Display quest relationships dynamically.


### Quest Statuses
Each quest has a status that defines its current state. The following statuses are available:

* **Unknown** – The quest exists in the world but is undiscovered by the players. Rumours can still reference unknown quests.
* **Discovered** – The quest has been revealed but is not yet active.
* **Started** – The players have accepted the quest.
* **Ongoing** – The quest is actively being pursued.
* **Completed** – The players have successfully finished the quest.
* **Completed by Someone Else** – Another party has resolved the quest.
* **Failed** – The players were unable to complete the quest.
* **Time Ran Out** – A timed event expired before the quest was completed.
* **Ignored** – The players chose not to follow up on the quest.

> Future Plans: Statuses are currently hardcoded, but a system for custom user-defined statuses may be added based on feedback.

### Quest Relationships

Quests can have prerequisites, dependencies, and exclusivity rules that shape the campaign's progression.

#### Quest Prerequisites
Define conditions that must be met before a quest becomes available. Conditions can include:

* Completing or failing another quest.
* Discovering specific rumours or events.
* Reaching a specific in-game date.

#### Mutually Exclusive Quests
* Prevents quests from being completed simultaneously (e.g., supporting one faction over another).
* Once a mutually exclusive quest is completed, its conflicting quests are automatically disabled.
* Mutually exclusive quests are visually highlighted in the Quest Tree.

>Note: The system does not rigidly enforce quest logic—it provides a guideline for DMs rather than strict enforcement.


### Quest Data Structure
Quest data is stored in JSON format, supporting nested relationships for complex branching questlines.

#### Example Quest JSON:
```
{
  "quest_1": {
    "name": "Primary Quest",
    "description": "The village elders seek help.",
    "relationships": {
      "logic": "AND",
      "conditions": [
        "quest_4",
        {
          "logic": "OR",
          "conditions": ["quest_2", "quest_3"]
        }
      ],
      "mutually_exclusive": ["quest_6"]
    },
    "hidden": false,
    "disabled": false,
    "group": 1,
    "level": 3,
    "handout": "-bioDFNigEOnCVInecv"
  }
}

```

#### Key Quest Properties
* *name* – The quest title (not required to be unique).
* *description* – A tooltip or short summary of the quest.
* *relationships* - A nested logical statement defining the quest's relationships - two levels max
* *hidden* - This will render the quest as hidden to the players on the QuestTree Builder Page
* *disabled* - This will stp this rendering at all on the QuestTree Builder Page
* *group* - This is the ID for the Quest group the Quest is part of.
* *level* - This is an value created by QuestTree Builder Page to assist in building the page
* *handout* - the Roll20 Object refernce to the linked handout

### Navigating the Quest UI

The Quest Page provides a structured way to view and edit quests.

![New Quest Layout](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/newQuestLayout.png)

#### Relationship Tree Diagram
* AND / OR Logic – Nest quests into logic groups to show prerequisites visually.
* Mutually Exclusive Paths – Displayed with red lines to indicate quest conflicts.
* Dynamic Updates – The tree auto-generates based on quest data.

![Relationship Tree Diagram](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/extensive_quest.png)

> Tip: If relationships don’t display correctly, try widening the chat window before reporting an issue.

## Rumours Module

The Rumours Module dynamically integrates narrative elements into your campaign, allowing for player-driven discovery of world events, quest hints, and faction gossip. Rumours are linked to quests, locations, and events, ensuring they evolve alongside the campaign.

### Core Features
- **Dynamic Rumour Generation** – Create, edit, and manage rumours directly from the UI.
- **Quest-Linked Rumours** – Rumours can be tied to quest progress, appearing when certain conditions are met.
- **Location-Based Rumours** – Players hear different information depending on where they are.
- **Priority & Background Rumours** – Control the likelihood of specific rumours being shared.
- **Single-Use Rumours** – Option to have rumours disappear after being revealed.
- **Rumour-Triggered Events** – Displaying a rumour can trigger a quest or event progression.
### Module Architecture

#### Data Structures

Rumours are structured hierarchically by **quest**, **status**, and **location**. Example structure:
```
{
  "quest_1": {
    "unknown": {},
    "discovered": {
      "everywhere": {
        "rumour_1": "A shadowy figure was seen near the ruins."
      },
      "general_store": {
        "rumour_2": "A merchant claims to have seen strange lights in the forest."
      }
    }
  },
  "quest_2": {
    "unknown": {
      "the_boathouse": {
        "rumour_3": "A dockworker is skimming off the books."
      }
    }
  }
}

```
#### Key Elements:
* *quest* – The associated quest ID.
* *status* – The quest state (unknown, discovered, ongoing, etc.).
* *location* – Where the rumour can be heard.
* *rumour_id* – A unique identifier for the rumour.
* *description* – The actual rumour text.

### Managing Rumours

Rumours are stored in Roll20 handouts and managed through the UI. You can import and refresh JSON data from the Configuration Menu.

#### Viewing Rumours

Navigate to Show All Rumours to browse rumours tied to a quest. Use filters to display unknown, discovered, or ongoing rumours.


![Rumours Interface](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/rumoursinterface.png)

#### UI Buttons

* **Add** (+) – Create a new rumour at a location.
* **View Rumour** (👁) - Hover over this icon to see the rumour.
* **Change** (c) – Edit an existing rumour.
* **Remove** (-) – Delete a rumour from a location.
* **Priority** - (b or p) - Toggle between a priority rumour or a background rumour.
* **Frequency** (∞ or 1) - Toggle Betqween the rumour being only shown once, or any number of times   
* **Add Trigger** (T) - Add a trigger to this rumour when it is shown.

#### Location-Based Rumours
Rumours tied to specific locations appear when players interact with those areas. You can also define global rumours ("everywhere") that can be heard across multiple locations.

### Showing Rumours to Players

To reveal rumours in chat:

1. Select the location where the players are.
2. Choose the number of random rumours to display.
3. Press Show Rumours – the selected rumours will be sent to chat.

> Everywhere is a global rumour pool. If no valid rumours exist for the selected location, the system will pull from this pool.

#### Example Display:

![Show Button](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/show_rumours.png)

![Rumour Display](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/rumour_display.png)

#### Formatting Tips
* Use %NEWLINE% to insert line breaks within rumour text.
* Use &quot; to include quotation marks in rumour descriptions.

### Advanced Features

#### Priority Rumours & Background Rumours

* *Priority rumours* ensure important information is shown first.
* *Background rumours* add depth but have a lower chance of appearing.

#### One-Time Rumours

Rumours can be set to disappear after being shown, ensuring they don’t repeat.

#### Rumours as Triggers

A rumour can be linked to triggers that change a quest’s state when revealed (e.g., a rumour about bandits can mark a quest as discovered when heard).

### Error Handling
* Ensure rumour IDs are unique to prevent overwrites.
* Validate quest and location IDs to maintain consistency.


## Filters

![Filters](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/filters_open.png)

All Quests and all rumours have a filters section at the top allowing for better navigation.


## Quest Tree Page

![View of a Quest Tree](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/questtree.png)

### How to Generate the Quest Tree
1. Ensure the Quest Tree Page exists in your Roll20 game.
2. Open Configuration and select Generate Quest Tree Page.

### Automatic vs. Manual Updates

* The Quest Tree updates automatically for:
  * Quest visibility changes
  * Quest status updates
  * Quest name or description changes
* Manual Refresh Required for:
  * Adding new quests
  * Changing quest relationships

This is to prevent performance issues in large quest trees.

### Quest Images

Quest can have images which are tokens. These are set manually using the rollable table; they will not how unles it is directly pulled from your own roll20 library (no external or using premium assets)

### Compatability with Supernotes

Simply use the command **!gmnote** (create it as a token macro) when selecting a quest token and it will open up an small menu with quick functionality with the main interface. actioning any of these commands will open up the full quest interface afterwards. I highly recomend using **!gmnote --config** to toggle off the footer buttons when you set it up.


## Triggers Module

The Triggers Module automates quest changes based on time, quest progression, or external events.

* **Date Trigger** – Triggers after or on a certain date
* **Quest Trigger**  – Changes quest status when another quest updates.
* **Reaction Trigger** – Fires when another trigger activates (useful for event chains).
* **Script Trigger** – Manually trigger effects via button presses or handout links.
* **Event Trigger** - Triggers once an event happens

All Triggers can have certain 'Effects' once pressed

* **Quest**
  * Change Status
  * Toggle State (Disabled / Enabled)
  * Toggle Visibility (Hidden, Visible)
* **Event**
  *  Toggle State (Disabled / Enabled) 


#### Example Uses:

* Auto-disable quests in a mutually exclusive faction conflict.
* Reveal quests when a related quest completes.
* Time-based quest starts (e.g., a festival event).

Once a trigger fires, it is automatically deleted, ensuring quests progress naturally.

|||
|:-------------------------:|:-------------------------:
|![questTrigger](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/leavingWaterdeep.png)|![reactionTrigger](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/banditattack.png)|


## Weather Module

### Overview

The Weather Module is designed to simulate dynamic weather conditions, taking into account environmental trends, forced modifiers, and randomness. This module supports graphical visualizations for key weather parameters and provides an intuitive interface for adjusting and interpreting weather trends.

### Key Weather Parameters

Weather is determined by six key values; each value is rated on a scale of 0 to 100, with 50 representing the average condition. A random number is generated daily to define the weather, following a restricted bell curve distribution centered at 50 (see Bell Curve Graph).

||||
|:-------------------------:|:-------------------------:|:-------------------------:|
|![Temperature Graph](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/temp.png) **Temperature Distribution**|![Precipitation Graph](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/rain.png) **Precipitation Distribution**|![Wind Speed Graph](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/wind.png) **Wind Speed Distribution**|
|![Humidity Graph](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/humid.png) **Humidity Distribution**|![Cloud Cover Graph ](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/cloud.png) **Cloud Cover Distribution**|![Visibility Graph](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/visibility.png) **Visibility Distribution**|
||![Bellcurve Graph](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/bellcurve.png) **Bell Curve Graph**||


### Climate Configuration

Users can select a specific climate configuration, which adjusts weather values based on predefined modifiers. These modifiers vary between -20 to +20 and are season-dependent, linked to the Calendar Module. For instance:

> Icewind Dale (Forgotten Realms): During the "Long Winter" season, the temperature adjustment is -20, the maximum possible adjustment.*

### Daily Adjustments

Weather values change by a maximum of +/- 5 points per day. Near seasonal boundaries (e.g., winter transitioning to spring), this limit increases to +/- 10 points. There is a small chance, especially near seasonal boundaries, that these adjustments can double to +/- 10 or +/- 20 points, resulting in massive weather shifts.

### Forced Trends

A Forced Trend feature can be toggled on or off. When activated, this applies a fixed +/- 20-point difference to simulate significant weather deviations, overriding standard adjustments, this option can be can be found underneath configutation

### How to Use the Module

![Weather GUI](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/weather.png)

#### Initialize the Weather System:

The weather system can be enabled or disabled in the configuration menu. It is enabled by default.

#### Select a Climate Zone:
In the configuration menu, choose the climate zone your players are in (e.g., Northern Temperate or Equatorial). Climate zones are specific to the selected calendar. For instance, the Harptos climates are based on common adventure areas rather than a general climate type like temperate.

#### Change Player Location:
You can change the location the players are in under the 'Adjust Date' menu. Examples include selecting Plains, Swamp, or other terrain types.

### Weather Descriptions

The module provides detailed descriptions of weather conditions based on the player's location and daily weather parameters. When weather is enabled, the description is shown to players as a /desc message whenever the day advances.

![Weather Description](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/weatherdescription.png)

#### Weather Condition Matching

Each day, weather conditions are matched to predefined scenarios. For example:

```
"Persistent Downpour": {
    "conditions": {
        "temperature": { "gte": 50, "lte": 70 },
        "precipitation": { "gte": 60 },
        "wind": { "lte": 50 },
        "humidity": { "gte": 60 },
        "cloudCover": { "gte": 60 },
        "visibility": { "lte": 50 }
    }
}
```

Each scenario is linked to over **11,000 unique descriptions** for potential player locations, such as plains, farms, or forests. These descriptions create immersive and varied environmental narratives.

## Calendar Module

### Overview

The Calendar Module is a comprehensive system designed to manage and integrate various calendar types into your campaign. It supports custom events, lunar cycles, leap years, and dynamic seasonal markers.

### Supported Calendars

The module includes several pre-configured calendars:

* **Gregorian**
* **Harptos (Forgotten Realms)**
* **Barovian (Curse of Strahd)**
* **Golarion (Pathfinder)** - A Pathfinder-specific calendar with varying month lengths and leap year logic.
* **Greyhawk (Original and 2024 Default setting)**
* **Exandria (Critical Role)**

#### Lunar Cycles

Each calendar includes options for tracking lunar phases. The lunar cycle will display key phases, such as the below and are setting specific. Each Calander can have multiple moons and their lunar cycle including their custom phases is displayed along with the weather.

* New Moon
* Waxing Crescent
* First Quarter
* Full Moon
* Waning Crescent

#### Leap Years

Calendars with leap year logic will account for additional days. for example:

* Gregorian: Leap years occur every 4 years, except for years divisible by 100 but not by 400.
* Harptos: Leap days occur every 4 years as "Shieldmeet."

#### Seasonal Events

The module supports predefined seasonal and celestial events, such as:

* Spring Equinox
* Summer Solstice
* Autumn Equinox
* Winter Solstice

These events are always shown to your players.

### Custom Events

Users can add custom events tied to specific dates. These can include festivals, holidays, or recurring milestones within your campaign world.

### Initializing the Calendar

Select a calendar type from the configuration menu. The system will automatically set the date to the default starting date for the selected calendar.

***Warning: Changing the calendar type resets the current date to the default date for the chosen calendar.***

## Adding Custom Calenders


Users can add custom calanders by editing the **QuestTracker Calendar** Handout; as with other QuestTracker handouts all data is stored in the GM Notes field; the structure used is below as an example along with explanations for each field. 

*NOTE: it is very easy to mess this object up, so be careful. use a ![JSON Validator](https://jsonlint.com/) to confirm it is a valid object before refreshing the JSON files in the configuration settings.* 

```
{
  "mythic": {
    "name": "Mythic Calendar",
    "months": [
      { "id": 1, "name": "Primus", "days": 30 },
      { "id": 2, "name": "Secundus", "days": 30 },
      { "id": 3, "name": "Tertius", "days": 30 },
      { "id": 4, "name": "Quartus", "days": 30 },
      { "id": 5, "name": "Quintus", "days": 30 },
      { "id": 6, "name": "Sextus", "days": 30 },
      { "id": 7, "name": "Septimus", "days": 30 },
      { "id": 8, "name": "Octavus", "days": 30 },
      { "id": 9, "name": "Nonus", "days": 30 },
      { "id": 10, "name": "Decimus", "days": 30 }
    ],
    "daysOfWeek": [ "Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7" ],
    "defaultDate": "0001-01-01",
    "startingWeekday": "Day 1",
    "dateFormat": "{day}{ordinal} of {month}, {year}",
    "significantDays": {
      "1-1": "New Era Day",
      "10-30": "Harvest Festival"
    },
    "lunarCycle": {
      "mystara": {
        "name": "Mystara",
        "baselineNewMoon": "0001-01-01",
        "cycleLength": 28,
        "phases": [
          { "name": "New Moon", "start": 0, "end": 7 },
          { "name": "First Quarter", "start": 7, "end": 14 },
          { "name": "Full Moon", "start": 14, "end": 21 },
          { "name": "Last Quarter", "start": 21, "end": 28 }
        ]
      }
    },
    "climates": {
      "mythic region": {
        "seasons": [ "Spring", "Summer", "Autumn", "Winter" ],
        "modifiers": {
          "temperature": { "Spring": 10, "Summer": 20, "Autumn": 15, "Winter": 0 },
          "precipitation": { "Spring": 15, "Summer": 10, "Autumn": 5, "Winter": 10 },
          "wind": { "Spring": 5, "Summer": 5, "Autumn": 10, "Winter": 15 },
          "humid": { "Spring": 20, "Summer": 15, "Autumn": 10, "Winter": 5 },
          "visibility": { "Spring": 10, "Summer": 20, "Autumn": 15, "Winter": 5 },
          "cloudy": { "Spring": 15, "Summer": 10, "Autumn": 20, "Winter": 25 }
        },
        "seasonStart": { "Spring": 3, "Summer": 6, "Autumn": 9, "Winter": 12 }
      }
    }
  }
}
```

### Variables and Usage

#### `name`
**Type**: `String`

- **Description**: The name of the calendar.
- **Example Value**: `"Mythic Calendar"`
- **Usage**: Used as a display name for the calendar system.

---

#### `months`
**Type**: `Array<Object>`

- **Description**: Defines the months in the calendar year.
- **Structure**:
  ```json
  { "id": Number, "name": String, "days": Number }
  ```
- **Fields**:
  - `id`: Unique identifier for the month.
  - `name`: Name of the month.
  - `days`: Number of days in the month.
- **Example**:
  ```json
  [
    { "id": 1, "name": "Primus", "days": 30 },
    { "id": 2, "name": "Secundus", "days": 30 }
  ]
  ```
- **Usage**: Determines the structure of the year and is used to calculate dates.

---

#### `daysOfWeek`
**Type**: `Array<String>`

- **Description**: Defines the days of the week.
- **Example Value**: `["Day 1", "Day 2", "Day 3"]`
- **Usage**: Provides names for weekdays, enabling mapping of days within a week.

---

#### `defaultDate`
**Type**: `String`

- **Description**: The initial date of the calendar system.
- **Example Value**: `"0001-01-01"`
- **Usage**: Acts as a reference point for date calculations.

---

#### `startingWeekday`
**Type**: `String`

- **Description**: The name of the first weekday in the calendar.
- **Example Value**: `"Day 1"`
- **Usage**: Determines which day of the week the calendar starts on.

---

#### `dateFormat`
**Type**: `String`

- **Description**: The format for displaying dates.
- **Example Value**: `"{day}{ordinal} of {month}, {year}"`
- **Usage**: Configures how dates are rendered.

---

#### `significantDays`
**Type**: `Object`

- **Description**: Highlights specific dates with special events or names.
- **Structure**:
  ```json
  "<month>-<day>": String
  ```
- **Example**:
  ```json
  {
    "1-1": "New Era Day",
    "10-30": "Harvest Festival"
  }
  ```
- **Usage**: Used to mark and describe important days.

---

#### `lunarCycle`
**Type**: `Object`

- **Description**: Defines the phases and duration of lunar cycles.
- **Structure**:
  ```json
  {
    "<moon_name>": {
      "name": String,
      "baselineNewMoon": String,
      "cycleLength": Number,
      "phases": Array<Object>
    }
  }
  ```
- **Fields**:
  - `name`: Name of the moon.
  - `baselineNewMoon`: Reference date for the new moon.
  - `cycleLength`: Length of the lunar cycle in days.
  - `phases`: Array of phase definitions.
- **Example**:
  ```json
  {
    "mystara": {
      "name": "Mystara",
      "baselineNewMoon": "0001-01-01",
      "cycleLength": 28,
      "phases": [
        { "name": "New Moon", "start": 0, "end": 7 },
        { "name": "Full Moon", "start": 14, "end": 21 }
      ]
    }
  }
  ```
- **Usage**: Tracks moon phases for gameplay or storytelling.

---

#### `climates`
**Type**: `Object`

- **Description**: Defines seasonal and climate data for regions.
- **Structure**:
  ```json
  {
    "<region>": {
      "seasons": Array<String>,
      "modifiers": Object,
      "seasonStart": Object
    }
  }
  ```
- **Fields**:
  - `seasons`: List of seasons.
  - `modifiers`: Environmental modifiers (temperature, precipitation, etc.).
  - `seasonStart`: Month identifiers marking the start of each season.
- **Example**:
  ```json
  {
    "mythic region": {
      "seasons": ["Spring", "Summer"],
      "modifiers": {
        "temperature": { "Spring": 10, "Summer": 20 }
      },
      "seasonStart": { "Spring": 3, "Summer": 6 }
    }
  }
  ```
- **Usage**: Provides seasonal and environmental context.

*NOTE: Keeping values between -20 and 20 will allow the weather module to perform correctly.*


## Event Module

Navigate to the "Events" section in the configuration menu. Add, edit, or remove events as needed. Assign dates for recurring or one-time events.

| | | |
|:-------------------------:|:-------------------------:|:-------------------------:|
|![Upcoming Events](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/upcoming_events.png)|![All Events](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/allevents.png)|![Modify Events](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/event_modify.png)|


### Adjusting Dates

You can set or move the date using the "Adjust Date" menu.

![Adjust Date Menu](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/datechangesUI.png)

There are also quick commands available for date adjustments. These commands provide a streamlined interface, bypassing the full GUI, and include a cut-down weather display with key information for players:

* **!qt-date advance** Increases the date by 1.
* **!qt-date retreat** Decreases the date by 1.

![Cut Down Weather](https://raw.githubusercontent.com/boli32/QuestTracker/refs/heads/main/img/calander_cut.png)




## FAQ

### How do I access the quest tracker interface?
Use the in-game interface provided by the tool. Simply open the menu to begin navigating quests, rumors, and events by typing !qt into chat

### Can I customize the weather settings?
Yes, the graphical interface allows you to adjust weather trends, add forced conditions.

### How are mutually exclusive quests displayed?
Mutually exclusive quests are visually highlighted and organized in the quest tree to prevent conflicts.

### Can I adjust weather effects manually
Technically, yes you can, by editing the JSON files direct and setting the date to before these changes took place. It is advisable to use the inbuilt tools and make sure the weather runs for a couple of months bfore you start the campaign to even out any extreme fluctuations. Look to forcing weather trends if you wanted to have a drought or cold snap effect the world outside of the seasonal changes.

### Can I change the order of Quest Groups to have them display in a different order on the Quest Tree Page
Yes, you can carefully edit the qt-quest-groups rollable table, although this is not an ideal solution and I may add a reordering functionality later should there be call for it.

### I've noticed you can create quest relationships and then move them into separate quest groups, this results in weirdness on the Quest Tree Page
Yes, that is a workaround to having relationships between quest groups and it *can* result in a very pretty Quest Tree Page, but without a lot of trial and error the Quest Tree Page is not designed to work with this in mind. I left this in as the only other option would be to wipe all relasionships when you add a quest to a quest group which would cause more frustration.

### How does 'auto' work when linking quests to handouts?
This actually works using a 'Damerau–Levenshtein distance' compare. It essentially tries to match the Quest Name with a handout name and will take more 'fuzzy' matches; essentially allowing for a self correction of typos... to a certain extent. if it fails it will create a blank handout and automatically link to it.

### Can you link multiple quests to the same Handout?

Yes, there is no restriction on this should you wish to combine handouts.

### Wait, I have autoadvance all filled in from v1.0, do I have to redo it?

No, there is a script in place to convert all autoadvance triggers into the new Trigger Module; although this is difficult to test it *should* work...


## Updates

#### 2025-02-11
* Release of **v1.2**; Rumours Module has been overhauled
- **Rumours Module**
  * Rumours are stored differently now, when you first upgrade to v1.2 a script will run converting you to be v1.2 compliant.
  * Rumours can be set as 'Priority' or 'Background' where priority rumours will aim to make up at least half of the rumours shown to players
  * Rumours can now also be set to be shown only once and then deleted afterwards
  * Rumours can now count as trigger events; such as changing a quest to be 'discovered' after the rumour is shown to players.
  * Given how rumours are stored, there is a shortcut on the rumours page to automatically create a Rumour Trigger.
  * The Rumours page has had a redesign using symbols as buttons removing reliance on external images. and rather than a truncated rumour the rumour # is shown instead. (As before you can hover over the eye symbol to read the rumour in full)
- **Triggers Module**
  * Added 'Script' triggers which can be triggered from a button press (or a link within a handout), thee bypss checks and just run through the Effect List.
  * Homepage now has an 'Automtion' section which links direct to Triggers. Script triggers can be set a 'active' and they will appear here.
  * Events can now be enabled/disabled through triggers.
  * Events can now trigger... well Triggers.
  * There is a couple of version scripts which run if you have triggers set up in the old version automatically converting them to the new data structure.
- **Events Module**
  * Added Enable/Disable flag so events can be toggled on or off.
  * Events can activate Triggers and be manipulted by them.

#### 2025-02-04
* Release of **v1.1**; significant changes to quest interaction and display.
- **Questbuilder Module**
  * Added the ability to disable quests, disabled quests and all their 'full children' quests will no longer show on the Quest Tree Builder Page 
  * Questbuilder toggles visibility correctly now.
  * GMnote menu expanded to include link to handout
- **Quest Module**
  * Quests can now be linked to handouts
  * Filters can now be applied to the Quest List
  * original Autoadvance removed, instead a new Triggers Module was added
  * Image Icons (from rollable table) are now shown on the Inspect Quest
- **NEW Triggers Module**
  * Quest Triggers significantly expanded so quests now interact with each other much more.
  * Quest Triggers can triggr from:
    * Changes to a quest's Status, Disabled or Hidden fields
    * The Date advancing
    * Other Triggers firing
  * Triggers can change other quests:
    * Status
    * Visibility
    * State (Enabled/Disabled) 
  * Triggers are auomatically removed once fired
- **Weather Module**
    * Tweaked the Bellcurve calculation to allow for a global change and moved the projected average for wind down (-15) and visibility up (+15), along with adjusted descriptions. This should make adventuring parties less likely to be adventuring in 'gale force winds'.
- **Other Quality of Life Changes**
  * QuestTracker Chat is no longer archived

### 2025-01-14 Stable Release V1.0.3

 * **v1.0.3** Allowed for users to add their own custom calanders (2025-01-14)
 * **v1.0.2** Added Krynn (Dragonlance) and Galifar (Eberon) Calanders. also expanded to allow for multiple moons and different cycles. Added the smaller and secondary moons to both Exandria and Grekhawk calander. (2025-01-13)
 * **v1.0.1** Various small fixes. Made Compatable with Supernotes Mod (2025-01-10)
 * **v1.0** Official Release (2025-01-09)
 * **v0.9.2** Fixed quest dropdown to deal with single quests without a dropdown. Also an ungrouped quest which get assigned a relasionship to a quest within a quest group automatically now gets assigned to that quest group. (2025-01-08)
 * **v0.9.1.7.2** Adjusted font and rectangle size on quest tree page
 * **v0.9.1.7.1** Swapped DELETE for CONFIRM in a popup (2025-01-07)
 * **v0.9.1.7** Removed JumpGate Toggle and where it was used (paths fixed now), kept variable in case it is needed later. (2025-01-07)
* **v0.9.1.6** If a rollable table needs to be created, it is now hidden from players. (2025-01-07)
 * **v0.9.1.5** Added Switches to toggle between Imperial or Metric Weather Measurements. (2025-01-07)
* **v0.9.1.4** Fixed Allias Date Advance to show cut down description. (2025-01-07)
* **v0.9.1.3** Fixed Climate modifiers and adjusted bellcurve (2025-01-06)
* **v0.9.1.2** Disabled Quest Relationship buttons when no quests available. (2025-01-03)
* **v0.9.1.1** Fixed Quest Group Dropdown Menu (2025-01-03)
* **v0.9.1** Adjusted climate values and streamlined climate values (2025-01-03)
* **v0.9.0.1** Fixed rumour filtering issue (2025-01-02)
* **v0.9** Initial Upload (2024-12-19)

## Contributing

Contributions are welcome! Please report issues on the GitHub repository and tag me @boli32

[GitHub Repository](https://github.com/Roll20/roll20-api-scripts/issues)

## Credits

- **Author:** Steven Wrighton (Boli)
- **Contact:** [Roll20 Profile](https://app.roll20.net/users/3714078/boli)
- **License:** MIT

---

Thank you for using Quest Tracker. Happy gaming!