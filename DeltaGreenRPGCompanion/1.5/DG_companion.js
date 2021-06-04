 on('chat:message',(msg)=>{
    log(msg);
    let msgCopy = _.clone(msg),
        rollResult,attributeToSet,characterID;
	//this will match the rolltemplate text of &{template:bond} {{characterid=@{character_id}}} {{attribute=bond_projection_1}} {{roll=[[1d4]]}} 	
    const patternMatch = /{{characterid=(.+?)}} {{attribute=(.+?)}} {{roll=\$\[\[(\d+)\]\]}}/,
        rollTemplateRegex = /bond/;//What roll templates we want to act on
    
    if(msg.rolltemplate && rollTemplateRegex.test(msg.rolltemplate)){
        msg.content.replace(patternMatch,(match,cID,attributeToChange,rollIndex)=>{
			rollResult = msg.inlinerolls[rollIndex].results.total;   // get the result from the roll
            characterID = cID;                                       // get the character sheet ID
            attributeToSet = attributeToChange;                      // get the name of the attribute to change
            //let attributeObj = findObjs({characterid:characterID,name:attributeToSet},{ caseInsensitive: true })[0];
            let attributeObj = getAttrByName(characterID, attributeToSet); // get the attribute, I use this one instead of FindObj because it doesn't work otherwise for default values
         //-----Debug output
			//log(`character ID: ${characterID}`);
            //log(`toSet: ${attributeToSet}`);
            //log(`result: ${rollResult}`);
            //log(attributeObj);
		//-----
		    // new value is given by finalres= current-1d4
			// there is no check to see if the value is lower than zero cause the exception is handled by the sheetworker itself.
            const value = parseInt(attributeObj)||0;
            const finalres = value - rollResult;
		//-----Debuf output
            //log(finalres);
		//-----
			// If the object has never been modified before, the variable will be undefined
            let object = findObjs({characterid:characterID,name:attributeToSet},{ caseInsensitive: true })[0];
            // create the object in the case if has not been created before
			if (object === undefined){
                object=createObj("attribute", {
                    name: attributeToSet,
                    characterid: characterID
                    });
            }		
		//-----Debug output
            //log(object);
		//-----
            // Set with worker to allow the sheet to interact with the API
			object.setWithWorker({current: finalres});
		//-----Debug output
            //log(object);
            //log(finalres);
            //log(object);
            //log(finalres);
            //log(object);
            //log(finalres);
            //log(object);
        //-----
        });
    }
});

