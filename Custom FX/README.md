## Custom FX

### Commands
* !createfx <_name_> [_properties_]
* !previewfx [_properties_]
* !savepreview <_name_>
* !endpreview

`!createfx` will create an FX object directly. You must supply a name. All properties are optional (default values will be used for any not specified), and may be labeled or not. Labeled properties take the form *propertyName:propertyValue*, and the names are case-sentitive. Unlabeled properties will be consumed in order:

* angle
* angleRandom
* duration
* emissionRate
* endColour
* endColourRandom
* gravity
* lifeSpan
* lifeSpanRandom
* maxParticles
* size
* sizeRandom
* speed
* speedRandom
* startColour
* startColourRandom

The four color properties must be specified as an arracy of four values: `[red, green, blue, alpha]`. The first three should each be an integer in the range 0-255, and the last should be a number in the range 0-1.

`gravity` must be specified as an object in the form `{ x: num, y: num }`. The spaces are optional, and the x/y can swap their order.

Any properties with spaces must be enclosed in quotes. `gravity:"{ x: 5, y: 6}"`, `"gravity:{ x: 5, y: 6 }"`, and `gravity:{x:5,y:6}` are all valid.

`!previewfx` takes the same property parameters as `!createfx`, but instead of immediately creating the FX object, it spawns a looping FX animation on the map, which you can change with additional calls to `!previewfx`. You can stop the animation with `!endpreview` (however, your saved properties will not be erased), and you can save the FX with `!savepreview`, which will erase your preview properties and create an FX object with the same values.