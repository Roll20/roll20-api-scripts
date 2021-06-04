Script Format
=============

This is an example script set up to illistrate the file structure, sytax, and format required to have your script deployed on Roll20. All scripts must be uploaded into their own folder inside the "Roll20/roll20-api-scripts" repository. For ease of reference please name the folder in a way that easily indentifies the script. 

script.json
============

All scripts require a completed script.json file at their root folder. If the script.json isn't completly filled out, or fill out incorrectly, it will not load and the script will not appear on Roll20. The different elements of the script.json file are:
* `name`: The name of the API script as it will appear on Roll20
* `script`: The name of the javascript file, which must remain uniform throughout versions
* `version`: The current version number of the API script (e.g. `12.3`)
* `previousversions`: All previous versions of the script in an array format (e.g. `["0.5","0.1"]`)
* `description`: A short explanation of the script and it's use that will appear along side the script on Roll20. It is important for this section to be filled out in detail, as it's the primary way users will get information about the purpose and use of the script. Included in the description section needs to be an example use or purpose, list and explanation of API Commands, and any other information necessary to operating the script.
* `authors`: A simple string telling who contributed toward the script (e.g. `Riley Dutton,Steve Koontz`)
* `roll20userid`: A simple string telling the Roll20 User ID's of the authors (e.g. `1` or `45672,145678`). Used internally and won't be shown publicly on the site.
* `useroptions`: An array of hashes that allow script authors to set pre-determined options for users to customize the functionality of the script. For more information check out the _Example folder's script.json for an example or see the Roll20 Wiki for more documentation.
* `dependencies`: A list of other API scripts this script requires to function (e.g. `My Kitchen`) 
* `modifies`: A list of the common Roll20 objects and properties the script reads and writes to. Custom objects and properties inside a namespace don't need to be included. (e.g. `bar1_value: write`)
* `conflicts`: A list of other API scripts this script is known to conflict with (e.g. `Recipes`) 

Folder Structure
================

All versions of the javascript code, including the current version, must be placed in a subfolder named for the version I.E. ("Roll20/roll20-api-scripts/mykitchen/1.1/mykitchen.js"). As new versions come out, all previous versions need to be represented in both the script.json and in the folder structure for backwards compatibility.

Help Documentation for Users
============================

The primary text that will be displayed to describe and help GMs use your script is the "description" in the script.json file. It will appear alongside your script in the Roll20 Script Library. Additionally, useroption fields can also have their own sub-descriptions. Additionally you may choose to add a REAME.md file at the root folder level of your script folder to better guide users who want to look at the code directly, instead of through the Roll20 One-Click Install system. You may include the most recent version of your script at the root level of your folder but if you do so, you must still have a copy in a version folder.


License
=======

All of the code of the API scripts in this repository is released under the MIT license (see LICENSE file for details). If you contribute a new script or help improve an existing script, you agree that your contribution is released under the MIT License as well.
