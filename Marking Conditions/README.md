## Marking Conditions

Allows marking targeted or selected tokens with statusmarkers either directly by name (if known), or by a number of aliases based on D&D 4e statuses.

Statusmarkers can be set with `!mark tokenid [status [type]]` or removed with `!unmark tokenid [status [type]]`, where _tokenid_ is a token object's id (obtained with `@{target|token_id}` or `@{selected|token_id}`), _status_ is the status to set (defaults to `purple` if ommitted), and _type_ is a D&D 4e damage type (only used if _status_ is "ongoing", "damage", or "dam").

The D&D 4e damage types are:

* acid
* cold
* fire
* force
* lightning
* necrotic
* poison
* psychic
* radiant
* thunder

If _status_ is a value that requires a damage type parameter and none is provided, an icon for "untyped" damage will be used.