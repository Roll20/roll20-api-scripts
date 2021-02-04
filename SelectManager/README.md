# SelectManager
SelectManager is a way to preserve portions of a user-generated message so that they are available to scripts later in the chain of API calls. the selected tokens so that they are available to another script (modified to work with SelectManager) called from the API. There is no syntax for the user to call; the SelectManager simply exists as a way to extend the basic functionality of the Roll20 sandbox. The user only needs to install the script to have it on hand for other scripts to make use of it.
### The Problem to Solve
User-generated script calls (i.e., sending command lines to the chat interface) include things that are otherwise stripped out and/or changed if the same call is made from the API. For instance, API-generated scripts (i.e., where a script calls another script) do not include information on the selected tokens. This limits the ways scripts may interact with each other, and it limits what users can do with them. Also, the "who" of the message and the "playerid" are similarly altered for an API-generated call, so if a downstream script wanted to know who had initiated this stack of calls, that information would not be available.
### How SelectManager Helps
Where most scripts listen to only calls to their own handle, SelectManager listens to all calls to the API, and differentiates those initiated by a user versus those initiated by another script. It stores the `selected`, `who`, and `playerid` properties of that message and then makes them available for client scripts to retrieve, should it need them.
### Implementing SelectManager
Implementing SelectManager is up to a script's author, though a user can update a manually-installed script, themselves, while they wait for the author to implement the SelectManager interface. For that sort of implementation, see **Option 2: Use-If-Present Model**), below.
#### Option 1: Make Your Script Dependent on SelectManager 
If you add SelectManager as a dependency to your script in the one-click, you can count on it being there when a user would utilize your script. In that case, you can access the library directly.

Once your script has determined that the message should be received and handled by your script, assign whatever required properties to the various message objects.

    const handleInput = (msg) => {
	    //... script tests for whether to pick up the message, then...
	    if('API' === msg.playerid) {
		    msg.selected = SelectManager.GetSelected();
		    msg.who = SelectManager.GetWho();
		    msg.playerid = SelectManager.GetPlayerID();
		}
	    //... script continues
    };

Alternately, instead of three lines, you could handle it with a single line, using deconstruction assignment:

    [msg.selected, msg.who, msg.playerid] = [SelectManager.GetSelected(), SelectManager.GetWho(), SelectManager.GetPlayerID();]
#### Option 2: Use-If-Present Model
If your script isn't in the one-click or you're unsure whether the SelectManager library will be installed, you can implement the script using just a few lines in your script's definition. Note that if SelectManager is not installed for your user, then this method will not actually solve the problem of your script expecting, when called from the API, to be able to access the selected tokens (for example). However, this method allows your script to continue even if SelectManager is not installed, and if your user complains that the script breaks when they call it from another script, you can tell them the easy fix is to get SelectManager installed.

The below example shows how to implement the `GetSelected()` function alone, though it can be expanded to include the others. Add the following two lines to the outer scope:

    let getSelected = () => {};
    on('ready', () => { if(undefined !== typeof SelectManager) getSelected = () => SelectManager.GetSelected(); });

Next, locate the portion of the script that handles the on('chat:message') event and include the following line immediately after the script tests the API handle to determine whether it should begin processing:

    if('API' === msg.playerid) msg.selected = getSelected();

(note that "msg" should be changed to match the name given to the message object in that procedure).

The following example shows the same idea expanded to include all of the scripts:

    let getSelected = () => {},
    	getWho = () => {},
    	getPlayerID = () => {};
    on('ready', () => {
    	if(undefined !== typeof SelectManager) {
    		getSelected = () => SelectManager.GetSelected();
    		getWho = () => SelectManager.GetWho();
    		getPlayerID = () => SelectManager.GetPlayerID();
    	} 
    });
And then use those three functions (`getSelected()`, `getWho()`, and `getPlayerID()`) to access the data  you need.
