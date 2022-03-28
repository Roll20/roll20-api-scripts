<div align="center">
    <a href="https://roll20.net">
        <img src="https://raw.githubusercontent.com/Roll20/roll20-character-sheets/master/Roll20%20Logo.png" alt="Roll20 logo" title="Roll20" height="60" />
    </a>

![GitHub last commit (branch)](https://img.shields.io/github/last-commit/Roll20/roll20-api-scripts/master?color=ff0066&label=last%20updated) ![GitHub contributors](https://img.shields.io/github/contributors/Roll20/roll20-api-scripts?color=ff0066) ![GitHub repo size](https://img.shields.io/github/repo-size/Roll20/roll20-api-scripts?color=ff0066)
    
</div>

Roll20 API Scripts
==================

This repository is the collection of all the community-contributed [API Scripts](https://wiki.roll20.net/API:Use_Guide) that are available for use on Roll20.

Contributing
============

If you want to help improve an existing API script, just clone this repository, make your changes, and submit a pull request. If you would like to contribute a new script for the community to use, just clone this repository and create a new folder with the name of the script which matches the name in your `script.json` file. Optionally you can add a `README.md` file with any instructions you want to include as well as any other files you feel will be helpful to the end user. Once everything is in the new folder send a pull request. 

API Documentation:

* [API:Introduction](https://wiki.roll20.net/API:Introduction) - Roll20 Community Wiki
* [API](https://help.roll20.net/hc/en-us/articles/360037256714-API) - Roll20 Help Center

If you aren't familiar with Github or Git in general, see [Beginner's Guide to GitHub](https://wiki.roll20.net/Beginner%27s_Guide_to_GitHub) and/or [Git Guide](https://wiki.roll20.net/Git) on the Community Wiki. If you still need help, post a question on the [Roll20 API forums](https://app.roll20.net/forum/category/46806) contact [contact Roll20](https://help.roll20.net/hc/en-us/requests/new?ticket_form_id=1500000457501) and we can help you get set up.

### Creating a script.json File

When you are ready to submit your script for **public use**, create a `script.json` file in your script's folder (see the [_Example Script](https://github.com/Roll20/roll20-api-scripts/tree/master/_Example%20Script%20-%20Check%20for%20formatting%20details) root folder for an example). The file has the following fields:

* `name`: The name of the API script as it will appear in the Roll20 One-Click Menu.
* `script`: The name of the javascript file, which must remain uniform throughout versions
* `version`: The current version number of the API script (e.g. `12.3`)
* `previousversions`: All previous versions of the script in an array format (e.g. `["0.5","0.1"]`)
* `description`: A short explanation of the script and it's use that will appear along side the script on Roll20. It is important for this section to be filled out in detail, as it's the primary way users will get information about the purpose and use of the script. Included in the description section needs to be an example use or purpose, list and explanation of API Commands, and any other information necessary to operating the script.
  * section is formatted using `markdown`, with the exeption that you need to use `\n` linebreaks, and `\t` for indentions. See [this page](https://wiki.roll20.net/Sheet.json#instructions) for more info.
  * If you have a wiki page or Readme file for the API, it's a good idea to link it. (e.g. )
* `authors`: A simple string telling who contributed toward the script (e.g. `Riley Dutton,Steve Koontz`)
* `roll20userid`: A simple string telling the Roll20 User ID's of the authors (e.g. `1` or `45672,145678`). [How to find your Roll20id](https://wiki.roll20.net/Roll20id) Used internally and won't be shown publicly on the site.
* `patreon`: Place the URL for a Patreon campaign here, and it will appear under your script's description when selected via one-click.  (e.g. `"https://www.patreon.com/<name>"`)
* `tipeee`: Place the URL for a Tipeee here, and it will appear under your script's description when selected via one-click.  (e.g. `"https://www.tipeee.com/<name>"`)
* `useroptions`: An array of hashes that allow script authors to set pre-determined options for users to customize the functionality of the script.
  * For more information check out the [_Example folder's script.json](https://github.com/Roll20/roll20-api-scripts/tree/master/_Example%20Script%20-%20Check%20for%20formatting%20details/script.json) for an example or see the Roll20 [Community Wiki](https://wiki.roll20.net/API:Introduction).
* `dependencies`: A list of other API scripts this script requires to function (e.g. `My Kitchen`) 
* `modifies`: A list of the common Roll20 objects and properties the script reads and writes to. Custom objects and properties inside a namespace don't need to be included. (e.g. `bar1_value: write`)
* `conflicts`: A list of other API scripts this script is known to conflict with (e.g. `Recipes`) 

### Validating script.json
As of January 29, 2021, pull requests must pass validation of the `script.json` file for any changed scripts, 
which will be done using the included [`script.json.schema`](script.json.schema) file.  This is a 
[JSON Schema](https://json-schema.org/) file that describes what is and is not allowed in the `script.json` file.  Any 
JSON Schema validator that supports `Draft-04` or higher should work to help you validate during development/before making
your pull request.

If you want a web-based JSON Schema validator, [this one](https://www.jsonschemavalidator.net/) works well.  Paste
the schema on the left, your `script.json` on the right.

### Post-validation
After we have reviewed your script and approve it, we will merge in your changes which will make them available to everyone. If we reject your script, we will comment on your Github commit and let you know what changes need to be made before it can be accepted.

Accepted File Types
============

The following are the only file types we typically accept in a pull request: 

* JavaScript (`.js`)
* Images (`.png`, `.svg`, `.jpg`, `.jpeg`)
* HTML (`.html)`
* Text (`.txt`, `.md`)
* Script JSON (`.json`)

If you have a file type in your pull request that is not in this list, please leave a comment as to why and we will review on a case-by-case basis.

Update the Wiki
===============

After making any changes to a script or adding a new one, it's great if those changes are updated on the Roll20 [Community Wiki](https://wiki.roll20.net/)'s [API:Script Index](https://wiki.roll20.net/API:Script_Index).

If you're making updates to an existing script, please find that script from the list and update:
* Author: Adding yourself as a contributor
* Version: To reflect your update
* Last Modified: To today's date


If you're contributing a new script that has been accepted and merged in, it helps to create Wiki page for it. The naming convention for scripts is "https://wiki.roll20.net/Script:Script_Name". Please format your listing from the existing style. You can find an example at (https://wiki.roll20.net/Script:Example).

Useful things to document for an API Wiki page:

* Description
* Syntax & Examples
* Changelog: To reflect the new version and the changes you've made
* Links: Forum threads, README files, video showcase
* Configuration

After you've added the page, please go to the [API Script Index](https://wiki.roll20.net/API:Script_Index) and add a link to your listing in the appropriate category.

Guidelines
==========

Here are a few guidelines that you should follow when contributing API scripts for the community:

**Be Clear and Concise**

Community API scripts should be built from the ground up with the intention of sharing with others. The script's name should be a good indicator of what the script does and how it should be used. A script named `MkLtObjMvr-Dst` is likely to confuse, where a script named `Light Switch` is descriptive, clear, and does a good job of hinting at it's intended use.

Try to use short and descriptive function and variable names. Problematic names like `x1`, `fe2`, and `xbqne` are practically meaningless. Names like `incrementorForMainLoopWhichSpansFromTenToTwenty` are verbose. Aim for variable and function names that are meaningful but simple, such as `card_val` or `limitStr`.

**Make Your Script Accessible**

Please take every effort to format your code in a traditional manner and present the script in a legible state. Leaving comments on the intended use of functions and code blocks can be very useful to future contributors.

Near the top of your script should be a comment providing the script's name, version number, the last time it was updated, and a short breakdown of the scripts intended use. In the breakdown should be included the script's description, syntax, and configuration options. It is important to add configurable elements near the top of the script in an easily demarcated area with comments on how those elements can or should be customized.

If your API is complex, it might be useful for the API to create an in-game handut containing User instructions. Having a command like `!your-api --help` to give some details for first-time users can be great, and/or having this message whispered to the GM after first time opening the game after the API was installed.

**Limit Your Script's Footprint**

Include namespaces for your functions and variables, to avoid potential conflicts with other authors. Placing your functions and variables inside a unique namespace to your script protects both it, the user, and other community scripts.

Do your best to limit what your script is manipulating at any given moment to achieve it's desired result. Add API `!` triggers to turn on and off your script's functionality. It is a safe practice to have your script disabled by default. Avoid functions that keep aggressive control and manipulation of objects whenever possible.

It's also smart to make it possible to enable/disable whether the API can be used partially,fully, or not at all by the [players](https://wiki.roll20.net/Player).

License
=======

All of the code of the API scripts in this repository is released under the MIT license (see [LICENSE](LICENSE) for details). If you contribute a new script or help improve an existing script, you agree that your contribution is released under the MIT License as well.
