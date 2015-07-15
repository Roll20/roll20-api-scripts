if( !_.has(state,'gmcode') ) //Check to see if gmcode exists.
     {
         state.gmcode=
         {
             gmcodearray: []
         }
         var count = 0;
         while (count != 8)
         {
             state.gmcode.gmcodearray[count] = Math.random() * 9;
             state.gmcode.gmcodearray[count] = Math.round(state.gmcode.gmcodearray[count]);
             count++;
         }
         state.gmcode = state.gmcode.gmcodearray.join("");
         log(state.gmcode)
     }
function GenNewCode() //Generates a new code 
{
         state.gmcode=
         {
             gmcodearray: []
         }
         var count = 0;
         while (count != 8)
         {
             state.gmcode.gmcodearray[count] = Math.random() * 9;
             state.gmcode.gmcodearray[count] = Math.round(state.gmcode.gmcodearray[count]);
             count++;
         }
         state.gmcode = state.gmcode.gmcodearray.join("");
         log(state.gmcode)
}
if (state.gmcode == null)
{
         state.gmcode=
         {
             gmcodearray: []
         }
         var count = 0;
         while (count != 8)
         {
             state.gmcode.gmcodearray[count] = Math.random() * 9;
             state.gmcode.gmcodearray[count] = Math.round(state.gmcode.gmcodearray[count]);
             count++;
         }
         state.gmcode = state.gmcode.gmcodearray.join("");   
}
log(state.gmcode)
     on("chat:message", function (msg)
     {
          if(msg.type == "api" && msg.content.indexOf("!clearcode ") !== -1)
          {
             var splitstring    = msg.content.split(/\s+/)             ,
    		        codeEntered =  splitstring[1] || 0;
              if (state.gmcode == null)
              {
                  log("It appears there is no GM code!")
                  sendChat("GMCode", "/w " + msg.who + "There appears to be no currently existing GMCode. Generating new code!")
                  GenNewCode()
              }
              else if (splitstring[1] != state.gmcode)
              {
                  sendChat("GMCodeGen", "/w " + msg.who + "It appears you entered the wrong GM code...")
              }


              else
              {
                  state.gmcode = null;
                  log("GMCode was cleared successfully")
                  sendChat("GMCode", "/w " + msg.who + "You have sucessfully deleted the GM code!")
              }
              splitstring = null;
          }
          else if (msg.type == "api" && msg.content.indexOf("!gencode ") !== -1)
          {
              var message = msg.content.split(/\s+/);
              if (message[1] != state.gmcode && state.gmcode != null)
              {
                  sendChat("GMCode", "/w " + msg.who + "Incorrect code!");
              }
              else if (state.gmcode == null && message[1] == null)
              {
                  sendChat("GMCode", "/w " + msg.who + "There appears to be no currently existing GMCode. Generating new code!")
                  GenNewCode();                  
              }
              else if (state.gmcode == null)
              {
                  sendChat("GMCode", "/w " + msg.who + "There appears to be no currently existing GMCode. Generating new code!")
                  GenNewCode();
              }
              else
              {
                  GenNewCode();
                  sendChat("GMCode", "/w " + msg.who + "New GMCode generated! The new code is: " + state.gmcode)
                  log("New GMCode generated. Code is: " + state.gmcode)
              }
          }
          else if (msg.type == "api" && msg.content.indexOf("!custcode") !== -1)
          {
              var message = msg.content.split(/\s+/);
              if (message[1] != state.gmcode && state.gmcode != null)
              {
                 sendChat("GMCode", "/w " + msg.who + "Incorrect code!"); 
              }
              else if (state.gmcode == null)
              {
                  sendChat("GMCode", "/w " + msg.who + "There appears to be no currently existing GMCode. Generating new code!")
                  GenNewCode();
              }
              else if (message[2] == null)
              {
                  sendChat("GMCode", "/w " + msg.who + "You forgot to input a new code...")
              }
              else
              {
                  state.gmcode = message[2];
                  log("New GMCode: " + state.gmcode);
              }
          }
          else if (msg.type == "api" && msg.content.indexOf("!gmcodehelp") !== -1)
          {
              sendChat("GMCode", "/w " + msg.who + "Use !clearcode GMCODEHERE to clear the GMCode. If no code exists, this will generate a new one. Use !gencode CODEHERE to generate a new random code. Use !custcode GMCODEHERE NEWCODEHERE to input your own custom code. The GMCode is often logged for easy reference!")
          }
     })