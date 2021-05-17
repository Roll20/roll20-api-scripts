ImportHS6e

Character sheet import tool for Roll20. Imports Hero System 6e sheets to the Hero6e character sheet.

This sheet is recommended to be used with the other non-official Hero System API's (HeroSystem6e and HeroTracker).

You can install the API's for HeroSystem6e and HeroTracker applications via the one click install. My importer will be there once I have it working and ready for production. Here is a link that covers the one click installs:

https://help.roll20.net/hc/en-us/articles/360046238454-How-to-Install-API-Scripts-via-1-Click-Install#where-to-go-to-install-0-0

To install the character importer you need to use these instructions: https://help.roll20.net/hc/en-us/articles/360037256714-API#D&D5eOGLRollTemplates-StyleDifferences

Scroll down to How do I install an API script if I want to write my own code or I want to use code from an external source and follow the directions.

To import a character:

Export the character using the attached JSON template.
Open the JSON character sheet and copy the contents.
Open the character sheet (as the GM), click Edit at the top right of the sheet and paste the JSON into the GM Notes field.
Click Save Changes.
Assign the character sheet to a token on the board and select the token (you will get an error message in chat on the next step if you don't).
Switch to the Chat window and paste in !importHS6e --debug
Open the character sheet (if you closed it)
Click Edit on the character sheet then Save Changes.
