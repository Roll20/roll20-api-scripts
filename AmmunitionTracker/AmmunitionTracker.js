if( !_.has(state,'bullet') )
    {
        state.bullet= {
        bulletarray: [],
        namearray: [],
		slotarray: [],
		ownershiparray: []}
    }
on("chat:message", function(msg)
{
    if(msg.type == "api" && msg.content.indexOf("!bullets ") !== -1)
//This will unload all of the arrays, put them through the process of firing and finally re-package them again
    {
     var mainstring = msg.content.split(/\s+/);
     var slotlocator = parseInt(mainstring[1])
     var unloader = state.bullet.slotarray.indexOf(slotlocator)
     log(slotlocator)
     log(unloader)
     if (state.bullet.slotarray[unloader] == null)
     {
         sendChat("Ammunition tracker", "/w " + msg.who + " This slot seems to be empty...")
     }
     else if(state.bullet.ownershiparray[unloader] != msg.who)
     {
         sendChat("Ammunition tracker", "/w " + msg.who + " This slot is owned by " + state.bullet.ownershiparray[unloader])
     }
     else
     {
         state.bullet.bulletarray[unloader]--;
         log(msg.who + " uses one unit of ammunition from their " + state.bullet.namearray[unloader] + ", they now have " + state.bullet.bulletarray[unloader] + " units of ammunition remaining!")
         sendChat("Ammunition tracker", "/w " + msg.who + " you use one unit of ammo, and now have " + state.bullet.bulletarray[unloader] + " remaining!")
     }
    }
    else if (msg.type == "api" && msg.content.indexOf("!btedit ") !== -1)
    {
        var splitt = msg.content.split(/\s+/), slotselected = splitt[1];
        if (splitt[1] != null)
        {
            slotselected = parseInt(slotselected);
            var newbullets = parseInt(splitt[2]);
            if (newbullets != null)
            {
                var checkforslots = parseInt(splitt[1]);
                checkforslots = state.bullet.slotarray.indexOf(slotselected);
                if (checkforslots != -1)
                {
                    state.bullet.bulletarray[checkforslots] = newbullets;
                    sendChat("Ammunition Tracker", "/w " + msg.who + "The weapon now has " + newbullets + " units of ammunition!");
                }
                else
                {
                    sendChat("Ammunition Tracker", "/w " + msg.who + "Slot " + splitt[1] + " is currently empty");
                    log(splitt[1])
                }    
            }
            else
            {
                sendChat("Ammunition Tracker", "/w " + msg.who + "You must enter a new ammunition value for the slot!")
            }
        }
        else 
        {
            sendChat("Ammunition Tracker", "You must enter a slot number!")
        }
    }
    else if (msg.type == "api" && msg.content == "!btmyslots")
    {
        var counter;
        for (counter = 0; state.bullet.slotarray[counter] != null; counter++)
        {
            if (state.bullet.ownershiparray[counter] == msg.who)
            {
                sendChat("Ammunition Tracker", "/w " + msg.who + "Slot " + state.bullet.slotarray[counter] + ", " + state.bullet.namearray[counter] + ", " + state.bullet.bulletarray[counter] + " units of ammunition")
            }
         }
    }
    else if (msg.type == "api" && msg.content == "!bthelp")
    {
        var messagesent = msg.content.replace("!bthelp", "")
        sendChat("Ammunition tracker", "/w " + msg.who + " Hello! This is the help message! To declare a new weapon type use !setgun *SLOT* *WEAPON_NAME* *AMMUNITION*. There can be no spaces. If a slot is occupied by another player, you will not be able to use that slot. Whenever you fire, type !bullets *SLOT*.Use !btdel *SLOT* to delete a slot.Use !btedit *SLOT* *NEW_AMMO_VALUE to edit the ammunition of a weapon. It is 100% necessary to have slots correctly written. ENJOY!")
    }
    else if (msg.type == "api" && msg.content.indexOf("!btdel ") !== -1)
    {
        splitthestring = msg.content.split(/\s+/);
        var theslotselected = splitthestring[1];
        var parsedslot = parseInt(splitthestring[1])
        log(parsedslot);
        var indexedslot = state.bullet.slotarray.indexOf(parsedslot)
        log(indexedslot)
        if (state.bullet.ownershiparray[indexedslot] != msg.who)
        {
             sendChat("Ammunition Tracker", "/w " + msg.who + "This slot does not belong to you!")
        }
        else
        {
             log(msg.who + " Deleted slot " + state.bullet.slotarray[indexedslot])
             state.bullet.slotarray.splice(indexedslot, 1);
             state.bullet.bulletarray.splice(indexedslot, 1);
             state.bullet.namearray.splice(indexedslot, 1);
             state.bullet.ownershiparray.splice(indexedslot, 1);
             sendChat("Ammunition Tracker", "/w " + msg.who + "You have successfully deleted the contents of slot " + parsedslot)
             log(state.bullet.ownershiparray[indexedslot])
             log(state.bullet.bulletarray[indexedslot])
             log(state.bullet.slotarray[indexedslot])
             log(state.bullet.ownershiparray[indexedslot])
         }
    }
    else if (msg.type == "api" && msg.content.indexOf("!setgun ") !== -1)
    {
    	var splitstring		= msg.content.split(/\s+/)             ,
			slots           = parseInt(splitstring[1],10) || 0     ,
			weaponname      = splitstring[2]              || 'Gun' ,
			maximumbullets  = parseInt(splitstring[3],10) || 10    ;
            var checkifslotisoccupied = state.bullet.slotarray.indexOf(slots);
            log(checkifslotisoccupied)
            if (checkifslotisoccupied == -1)
            {
		findifslotisoccupied = state.bullet.slotarray.indexOf(slots);
		state.bullet.slotarray.push(slots)
		state.bullet.bulletarray.push(maximumbullets);
		state.bullet.namearray.push(weaponname);
		state.bullet.ownershiparray.push(msg.who);
        log(msg.who)
		log("The ammunition of " + weaponname + " in slot " + slots + " is currently " + maximumbullets)
		sendChat("Ammunition Tracker", "/w " + msg.who + " Slot assignment completed successfully!")
            }
            else
            {
                sendChat("Ammunition Tracker", "/w " + msg.who + "Slot " +  slots + " is currently occupied by " + state.bullet.ownershiparray[checkifslotisoccupied])
            }
    } //This ends !setgun
 })
 
