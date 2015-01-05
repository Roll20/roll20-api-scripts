Roll20 API Scripts
==================

This repository is the collection of all the community-contributed API scripts that are available for use on Roll20.

Contributing
============

If you want to help improve an existing API script, just clone this repository, make your changes, and submit a pull request. If you would like to contribute a new script for the community to use, just clone this repository and create a new folder with the name of the name of the script. Then send a pull request. If you have any questions or aren't familiar with Github or git in general, feel free to drop us a line at team@roll20.net and we can help you get set up.

Update the Wiki
===============

After making any changes to a script or adding a new one, it is imortant to include those changes with the Roll20 wiki at (https://wiki.roll20.net/API:Script_Index).

Guidelines
==========

Here are a few guidelines that you should follow when contributing API scripts for the community:

**Be Clear and Concise**

Community API scripts should be built from the ground up with the intention of sharing with others. The script's name should be a good indicator of what the script does and how it should be used. A script named "MkLtObjMvr-Dst" is likely to confuse, where a script named "Light Switch" is descriptive, clear, and does a good job of hinting at it's intended use.

Try to use short and descriptive function and variable names. Names like "x1", "fe2", and "xbqne" are practically meaningless. Names like "incrementorForMainLoopWhichSpansFromTenToTwenty" are verbose. Aim for variable and function names that are meaningful but simple, such as "card_val" or "limitStr".

**Make Your Script Accessible**

Please take every effort to format your code in a traditional manner and present the script in a legible state. Leaving comments on the intended use of functions and code blocks can be very useful to future contributors.

Near the top of your script should be a comment providing the script's name, version number, the last time it was updated, and a short breakdown of the scripts intended use. In the breakdown should be included the script's description, intended use, syntax, and configuration option. It is important to add configurable elements near the top of the script in an easily demarcated area with comments on how those elements can or should be customized. 

**Limit Your Script's Footprint**

Include namespaces for your functions and variables, to avoid potential name collisions with other authors. Placing your functions and variable inside a unique namespace to your script protects both it, the user, and other community scripts.

Do your best to limit what your script is manipulating at any given moment to achieve it's desired result. Add API "!" triggers to turn on and off your script's functionality. It is a safe practice to have your script disabled by default. Avoid functions that keep aggresive control and manipulation of objects whenever possible.

namespaces
limit changing things unnecessarily or controlling things constantly





License
=======

All of the code of the API scripts in this repository is released under the MIT license (see LICENSE file for details). If you contribute a new script or help improve an existing script, you agree that your contribution is released under the MIT License as well.
