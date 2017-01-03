# Markov

_v0.1.1 Updates:_

* Added a feature that allows user created namesets to be used via handouts.
* Removed the `state` code since Markov does not need to maintain state.
* Added a user option to **not** search though handouts for Markov namesets.
* Added this `READ.md`

This script lets you generate names using the Markov chain algorithm (https://en.wikipedia.org/wiki/Markov_chain)

To use simply type `!markov` into the chat. A derived name will be generated and displayed in the chat.
Example output: 
- Maliauc
- Janeran
- Maraindice

## Advanced
Markov uses a default nameset of English names to seed the Markov name generator.

You can include your own namesets for the Markov name generator to use.

To do this create a handout in this format:

### Example
```
Name: latin
Notes: Neque,porro,quisquam,est,qui,dolorem,ipsum,quia,dolor,sit,amet,consectetur,adipisci,velit
GM Notes: markov
```

![Alt text](https://github.com/Roll20/roll20-api-scripts/blob/master/Markov/handout_example.png?raw=true)

To use this above example you would need to restart the API sandbox after saving the handout and then you can use the latin nameset with this command:

`!markov latin`

Example output:
- consciam
- ectet
- ques

## User Options
If you have many handouts and you just want to use the default nameset it is recommended that you clear the checkmark in the user options for this script.