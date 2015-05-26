## Track V20 Attributes

The Vampire The Masquerade, 20th Anniversary Edition character sheet by Matt Zaldivar makes use of player filled text boxes for Disciplines and Backgrounds. These show up as generic Discipline1, Discipline2, etc. attributes when used, making it difficult to pull their values for macros and other functionality. This script solves the issue by creating named attributes for this missing information and keeping them consistent with what players are filling out on the sheet proper. Future versions will likely include support for Dark Ages V20, as well.

**Customizing the Script**

You may wish to add your own Disciplines, Paths, and Backgrounds, or incorporate new ones from V20 supplements as they are released. This is as simple as adding the new attributes you want to track to the appropriate associative array in the script. Each entry's key is the name players will type on their character sheet, while the value will be the attribute's name (which you can use in macros and other scripts). Afterwards be sure to update the `schemaVersion` to ensure attributes are added to preexisting characters.

* `disciplineHash`: Disciplines
* `pathHash`: Paths
* `backgroundHash`: Backgrounds