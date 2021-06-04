var srre={};

srre.Exroll=function(values){
    critGlitch=false;
    
    sendChat('RollEx','[['+values.nDice+'d6cs>5>5sd]]',function(result){
        var numb={}
        numb.rolls = result[0].inlinerolls[0].results.rolls[0].results;
        var hitCount=0;
        var oneCount=0;
        for(var j=0; j<numb.rolls.length; j++) {
            if(numb.rolls[j].v == 1) {
                oneCount++;
            }
            if(numb.rolls[j].v == 5 || numb.rolls[j].v == 6) {
                hitCount++;
            }
        }
        values.nSuccesses+=hitCount;
        if(oneCount>=numb.rolls.length/2){
            if(hitCount==0){
                critGlitch=true
            }else{
                values.nGlitches++;
                numb.glitch=true
            }
        }
        numb.successes=hitCount
        values.numb.push(numb)
        if(critGlitch){
            sendout={}
            sendout.successes=values.nSuccesses
            sendout.glitches=values.nGlitches
            sendout.stop='Critical Glitch'
            sendout.numb=values.numb
            sendout.player=values.player
            srre.ShowResults(sendout)
        }else if(values.nSuccesses>=values.maxSuccesses){
            sendout={}
            sendout.successes=values.nSuccesses
            sendout.glitches=values.nGlitches
            sendout.stop='Enough Successes'
            sendout.numb=values.numb
            sendout.player=values.player
            srre.ShowResults(sendout)
        }else if(values.nDice-1<values.maxDice){
            sendout={}
            sendout.successes=values.nSuccesses
            sendout.glitches=values.nGlitches
            sendout.stop='Out of Dice'
            sendout.numb=values.numb
            sendout.player=values.player
            srre.ShowResults(sendout)
        }else{
            values.nDice-=1
            srre.Exroll(values)
        }
    });
}
      
      
      
      
      
srre.ShowResults=function(values){
    var showing=
    '<table style="background-color:#111111; border:4px solid #550000; color:#eebb99; text-align:left; font-size:1em; width:100%; margin-right:5%;">'+
    '<tr>'+
    '<th style="background-color:#444444; text-align:center; color:#eebb99; margin:0px; font-size:1.5em;">'+
    '<img style="float:left; width:auto; height:3em;" src="https://4.bp.blogspot.com/-1jrWKeMyeO8/U_Rjfb5B0MI/AAAAAAAAByA/qgfLMIjJsSk/s1600/SR5%2BLogo%2BSigil.png">'+
    'Extended Roll by '+values.player+ '</th>'+
    '</tr>'+
    '<tr><td><div style="display:block; width:calc(100%+2px); border:1px solid #550000; vertical-align:top; margin:-1px -3px 0px -3px; padding:1px;"> </div></td></tr>'+
    '<tr><td><div style="color:#444444; font-size:0.8em; text-align:center;">Dicerolls</div></td></tr>'
    if(values.numb){
        var glitching=''
        var succ=''
        for(var i=0;i<values.numb.length;i++){
            showing+='<tr><td>>Roll '+(i+1)+'('+
            '<span class="inlinerollresult showtip tipsy-n importantroll" style="padding:0 3px 0 3px;font-weight: bold; font-size: 1.1em;" title="'
            if(values.numb[i].rolls){
                showing+='Rolling '+values.numb[i].rolls.length+'d6cs>5>5sd = ('
                for(var j=0;j<values.numb[i].rolls.length;j++){
                    if(values.numb[i].rolls[j].v>=5){
                        showing+='<span style='+'&'+'quot'+';'+'font-size:1.1em;color:#00ff00;'+'&'+'quot'+';'+'>'
                    }else if(values.numb[i].rolls[j].v==1){
                        showing+='<span style='+'&'+'quot'+';'+'font-size:1.1em;color:#ff4444;'+'&'+'quot'+';'+'>'
                    }else{
                        showing+='<span style='+'&'+'quot'+';'+'font-size:1.1em;color:#ffffff;'+'&'+'quot'+';'+'>'
                    }
                    showing+=values.numb[i].rolls[j].v+'</span>'
                    if(j<values.numb[i].rolls.length-1){
                        showing+='+'
                    }
                }
            }
            showing+=')"><span style="padding:0 3px 0 3px;font-weight: bold; font-size: 1.1em;">'+values.numb[i].successes+
            '</span></span>)</td></tr>'
            succ+='+'+values.numb[i].successes
            if(values.numb[i].glitch){
                glitching+='Roll '+(i+1)+'<br>'
            }
        }
    }
    showing+='<tr><td><div style="display:block; width:calc(100%+2px); border:1px solid #550000; vertical-align:top; margin:-1px -3px 0px -3px; padding:1px;"> </div></td></tr>'+
    '<tr><td><div style="color:#444444; font-size:0.8em; text-align:center;">Result</div></td></tr>'+
    '<tr><td><div> <br> </div></td></tr>'+
    '<tr style="font-size:1.5em; text-align:center; color:#99eeee;">'+
        '<td><span class="showtip tipsy-n" style="padding:0 3px 0 3px;font-weight: bold; font-size: 1.1em;" title="Rolling '+succ.substring(1)+' = '+values.successes+'">'+values.successes+'</span> Successes</td>'+
    '</tr>'+
    '<tr><td><div> <br> </div></td></tr>'+
    '<tr style="font-size:1.2em; text-align:left;">'+
        '<td>Glitches(<span class="showtip tipsy" style="padding:0 3px 0 3px;font-weight: bold; font-size: 1.1em;" title="'+glitching+'">'+values.glitches+'</span>)</td>'+
    '</tr>'+
    '<tr style="font-size:1.2em; text-align:left;">'+
        '<td>Stopping Reason: '+values.stop+'</td>'+
    '</tr>'+
    '</table>'
    sendChat('RollEx',showing)
}
      
      
      
srre.ShowHelp=function(){
    var showing=''+
    '<table style="background-color:#111111; border:4px solid #550000; color:#eebb99; text-align:left; font-size:1em; width:100%; margin-right:5%;">'+
        '<tr>'+
            '<th style="background-color:#444444; text-align:center; color:#eebb99; margin:0px; font-size:1.5em;">'+
            '<img style="float:left; width:auto; height:3em;" src="https://4.bp.blogspot.com/-1jrWKeMyeO8/U_Rjfb5B0MI/AAAAAAAAByA/qgfLMIjJsSk/s1600/SR5%2BLogo%2BSigil.png">'+
            'Roll Extended Version 0.01 </th>'+
        '</tr>'+
        '<tr><td><div style="display:block; width:calc(100%+2px); border:1px solid #550000; vertical-align:top; margin:-1px -3px 0px -3px; padding:1px;"> </div></td></tr>'+
        '<tr><td>'+
            '<span style="font-size:1.2em"><b>Welcome to Roll Extended</b></span><br><br>'+
            'To roll an extended test type:<br>'+
            '<b>!RollEx <span style="color:#ffffff">xx</span></b><br>'+
            '<span style="color:#ffffff">xx</span> being the number of dice to start with.<br>'+
            'This is always required!<br><br><br>'+
            '<span style="font-size:1.1em"><b>Optional Modifiers:</b></span> <br><br>'+
            '<b>!RollEx <span style="color:#ffffff">xx</span> d<span style="color:#bbee99">y</span></b><br>'+
            '<span style="color:#bbee99">y</span> being the minimum number of dice before you want to stop <br><br>'+
            '<b>!RollEx <span style="color:#ffffff">xx</span> s<span style="color:#aaaaee">z</span></b><br>'+
            '<span style="color:#aaaaee">z</span> being the number of successes after which you want to stop<br><br>'+
            '<b>!RollEx <span style="color:#ffffff">xx</span> s<span style="color:#aaaaee">z</span> d<span style="color:#bbee99">y</span></b><br>'+
            'to combine them both<br><br>'+
            'Will always stop when rolling a critical glitch'+
        '</td></tr>'+
    '</table>'
    sendChat('RollEx',showing)
}




srre.Rollextender=function(msg){
    if(msg.content.match(/RollEx/i)!=null){
        var temp=msg.content.match(/RollEx\s*\d+/i)
        if(temp){
            var maxSuc=msg.content.match(/s\d+/i)
            var maxDice=msg.content.match(/d\d+/i)
            var arg={}
            arg.nDice=temp[0].match(/\d+/)[0];
            if(maxDice){
                arg.maxDice=maxDice[0].match(/\d+/)[0]
            }else{
                arg.maxDice=1;
            }
            if(maxSuc){
                arg.maxSuccesses=maxSuc[0].match(/\d+/)[0]
            }else{
                arg.maxSuccesses=1000;
            }
            arg.nSuccesses=0;
            arg.nGlitches=0;
            arg.numb=[];
            arg.player=msg.who
            srre.Exroll(arg)
        }else{
            srre.ShowHelp()
        }
    }
}



srre.Glitchdetection=function(msg){
    if(((msg.type == 'general' || msg.type == 'whisper') && (msg.rolltemplate != null)) || (msg.type == 'rollresult' || msg.type == 'gmrollresult')) {
        if(msg.type == 'rollresult' || msg.type == 'gmrollresult'){
            var rollResult = JSON.parse(msg.content);
            var dice = rollResult.rolls[0].results;
            if(dice!=null)
                var poolSize=dice.length;
            else
                var poolSize=0;
        }else {
            var j=0;
            for(var f=0;f<msg.inlinerolls.length;f++)
            {
                if(msg.inlinerolls[f].expression.indexOf('>5>5')>=0)
                {
                    j=f;
                }
            }
            var dice = msg.inlinerolls[j].results.rolls[0].results;
            if(dice!=null)
                var poolSize=dice.length;
            else
                var poolSize=0;
        }
        if(poolSize>0){
            var oneCount = 0;
            var hitCount = 0;
            var i = 0;
            
            
            for(i=0; i<poolSize; i++) {
                if(dice[i].v == 1) {
                    oneCount++;
                }
                if(dice[i].v == 5 || dice[i].v == 6) {
                    hitCount++;
                }
            }
            if(oneCount >= poolSize/2 && hitCount == 0) {
                sendChat('Glitcher','/w GM '+
                '<table style="background-color:#111111; border:4px solid #550000; color:#eebb99; text-align:left; font-size:1em; width:100%; margin-right:5%;">'+
                    '<tr>'+
                        '<th style="background-color:#444444; text-align:center; color:#eebb99; margin:0px; font-size:1.5em;">'+
                        '<img style="float:left; width:auto; height:3em;" src="https://4.bp.blogspot.com/-1jrWKeMyeO8/U_Rjfb5B0MI/AAAAAAAAByA/qgfLMIjJsSk/s1600/SR5%2BLogo%2BSigil.png">'+
                        '<br>Critical Glitch!!</th>'+
                    '</tr>'+
                '</table>');
            } else if(oneCount >= poolSize/2){
                sendChat('Glitcher','/w GM '+
                '<table style="background-color:#111111; border:4px solid #550000; color:#eebb99; text-align:left; font-size:1em; width:100%; margin-right:5%;">'+
                    '<tr>'+
                        '<th style="background-color:#444444; text-align:center; color:#eebb99; margin:0px; font-size:1.5em;">'+
                        '<img style="float:left; width:auto; height:3em;" src="https://4.bp.blogspot.com/-1jrWKeMyeO8/U_Rjfb5B0MI/AAAAAAAAByA/qgfLMIjJsSk/s1600/SR5%2BLogo%2BSigil.png">'+
                        '<br>Glitch!</th>'+
                    '</tr>'+
                '</table>');
            }
        }
    }
}

on('chat:message', function (msg) {
    srre.Glitchdetection(msg)
    if(msg.type == 'api'){
        srre.Rollextender(msg)
    }
});


