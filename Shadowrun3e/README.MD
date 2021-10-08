# Shadowrun3e API
New API to compliment Shadowrun3e custom sheet

## Features
--GroupInit
    Initiative API to roll initiative for all selected tokens.
    Deckers that have used the "Jack In" / "Jack Out" buttons on the character sheet will roll Matrix init instead of regular ( augmented ) initiative
    Mages that have set astral plane on the "Magic" tab will roll Astral Initiative instead of regular initiative.
    IC tokens linked to Matrix Characters Sheets will roll initiative based on Matrix Sheet security rating + thier ice Rating

--Grenade [--off | --on ]
    If set to on with "!srun3 --grenade --on" the api will spawn a grenade token and place it on the map.  This action is triggered whenever the "explosive" roll template completes.  Scatter direction and distance are calculated from the Roll results and the icon is placed accordingly.  The logic to place the icon will not take into account walls.
    This features requires that the GM create a token and name it "apigrenade".

    !srun3 --grenade --off will turn off the feature

--conjure [--off | --on ]
If set to on with "!srun3 --conjure --on" the api will spawn a spirit token controllable by the player and place it on the map.  This action is triggered whenever the "conjuring" roll template completes.  

This features requires that the GM create a token and name it "apispirit".  This token will be copied.  This will set a default token for all spirit types. If the GM creates a token named.
The GM can also add spiri type specific tokens to be cloned.  The naming convention is
        watcher
        airelemental
        waterelemental
        earthelemental
        fireelemental
        cityspirit
        fieldspirit
        hearthspirit
        desertspirit
        forestspirit
        mountainspirit
        prairiespirit
        mistspirit
        stormspirit
        windspirit
        lakespirit
        riverspirit
        seaspirit
        gnome
        manitous
        salamander
        sylph
        ancestor



!srun3 --grenade --off will turn off the feature

