// By:       LearningRPGs, Joshua W.
// Contact:  https://app.roll20.net/users/1664871/joshua-w

var moneyMaster = {
    denoms: [
        {name: "gp", val: 1},
        {name: "sp", val: 0.1},
        {name: "cp", val: 0.01}
    ],

    validateConfigHandout: function(){
        let moneyMasterConfig = findObjs({type: 'handout', name: 'moneyMasterConfig'});
        if(moneyMasterConfig.length == 0){
            log('moneyMaster: Handout not found... Creating config handout.')
            moneyMasterConfig = createObj('handout', {
                            name: 'moneyMasterConfig',
                            notes: '',
                            gmnotes: '',
                            archived: false
                        });
            moneyMasterConfig.set({
                gmnotes: '<p>First time set-up: type a comma-separated list of the character names of the players who should receive gold. Make sure their names are spelled exactly the same as on their character sheets.</p><p><b>IMPORTANT</b>, ensure each character sheet has some value for gold, silver, and copper (zero at minimum).</p>'
            });
        }
    },

    _getCoins: function(character){
        coins = {};
        coins['gp'] = getAttrByName(character.id, 'gp');
        if(coins['gp'] == '') {
            coins['gp'] = 0;
        }

        coins['sp'] = getAttrByName(character.id, 'sp');
        if(coins['sp'] == '') {
            coins['sp'] = 0;
        }

        coins['cp'] = getAttrByName(character.id, 'cp');
        if(coins['cp'] == '') {
            coins['cp'] = 0;
        }

        return coins;
    },

    _setCoins: function(character, coins){
        var gp = findObjs({ _type:'attribute', name:'gp', characterid:character.id })[0];
        var sp = findObjs({ _type:'attribute', name:'sp', characterid:character.id })[0];
        var cp = findObjs({ _type:'attribute', name:'cp', characterid:character.id })[0];

        if(gp == null || sp == null || cp == null){
            sendChat('moneyMaster', `ERROR: ${character.name} has no value in one more of the money attributes: Gold, Silver, and/or Copper.`)
        }

        gp.set('current', coins['gp']);
        sp.set('current', coins['sp']);
        cp.set('current', coins['cp']);
    },

    processTransaction: function(price, totalMoney){
        var change = totalMoney - price;
        var changePayload = {};
        
        if(price > totalMoney){
            sendChat('moneyMaster', `Insufficient coins to process transaction for value of ${price}`)
            return;
        }
        if(totalMoney == price) {
            return {
                gp: 0,
                sp: 0,
                cp: 0
            };
        }
    
        // Loop through the deenomination array
        var change_arr = moneyMaster.denoms.reduce(function(acc, curr){
            var value = 0;
            // while the denom is larger than the change remaining
            while (change >= curr.val) {
                change -= curr.val;
                value += curr.val;
                
                if (curr.name == 'sp') {
                    value = (Math.round(value * 10)) / 10;
                }
                if (curr.name == 'cp') {
                    value = (Math.round(value * 100)) / 100;
                }
                change = (Math.round(change * 100)) / 100;
            }
            // Add tis denom to the output only if any was used.
            if (value > 0) {
                acc.push([curr.name, value]);
            }
            return acc;
        }, []);
    
        // If there are no elements in change_arr or we have leftover change, return the string "Insufficient Funds"
        if (change_arr.length < 1 || change > 0) {
            return "Insufficient funds";
        }
    
        change_arr.forEach(function(c){
            if(c[0] == 'sp') {
                changePayload[c[0]] = Math.round(c[1]*10);
            }
            else if (c[0] == 'cp') {
                changePayload[c[0]] = Math.round(c[1]*100);
            } else {
                changePayload[c[0]] = Math.round(c[1]);
            }
        });
    
        // Here is your change
        return changePayload;
    },

    splitGold: function(amount){
        let gold = parseFloat(amount) || 0;
        gold = Math.round((gold * 10)) / 10;
        if(Number.isNaN(gold)){
            sendChat('moneyMaster', `ERROR: Value ${amount} is not a float (decimal).`);
            return;
        }
        var moneyMasterConfig = findObjs({type: 'handout', name: 'moneyMasterConfig'})[0];
        moneyMasterConfig.get('notes', function(note){
            if(note == 'null'){
                sendChat('moneyMaster', 'Config is not set-up. Please see the moneyMasterConfig handout.');
                return;
            }
            let players = note.replace(/<[^>]+>/g, '').split(',');
            let numPlayers = players.length;
            sendChat('moneyMaster', `Splitting ${gold} GP!`)
            var remainder = 0;
            // Loop through all enabled players
            _.each(players, function(p){
                let pName = p.trim();
                // Get character object
                let playerId = findObjs({ _type:'character', name:pName })[0];
                let player = getObj('character', playerId.get('id'));
                // Chat error and exit if player cannot be found
                if(player == null){
                    sendChat('moneyMaster', `ERROR: ${pName} is not a character. Please fix the [moneyMasterConfig].`);
                    return;
                }

                // Validate there is a value for gold
                let currentCoins = moneyMaster._getCoins(player);
                let totalMoney = parseInt(coins['gp']) + (parseInt(coins['sp'])/10) + (parseInt(coins['cp'])/100);
                let splitGold = parseFloat(gold / numPlayers).toFixed(2);
                sendChat('moneyMaster', `... ${pName} is getting ${splitGold} of the split.`)
                let updatedCoins = moneyMaster.processTransaction((splitGold * -1), totalMoney);
                if(updatedCoins['gp'] == null){
                    updatedCoins['gp'] = 0;
                } 
                if(updatedCoins['sp'] == null){
                    updatedCoins['sp'] = 0;
                }
                if(updatedCoins['cp'] == null){
                    updatedCoins['cp'] = 0;
                }
                moneyMaster._setCoins(player, updatedCoins);
            });
        });
    },
    
    help: function(){
        let message = 
        '<div id="moneyMaster-help">'+
        '    <hr>'+
        '    <h3>moneyMaster API Script</h3>'+
        '    <h4>Config:</h4>'+
        '    <p>Open the moneyMasterConfig handout and in the <b>notes</b> section, type the names of each character exactly as shown on the character sheets (spaces and capitalization included) with commas between each name.</p>'+
        '    <p></p>'+
        '    <h4>Functions:</h4>'+
        '    <div style="padding:0.1em 0.3em; margin: 0 1em">'+
        '        <p><b style="font-weight:800">Spend</b></p>'+
        '        <p>Example:</p>'+
        '        <code>'+
        '            !moneyMaster spend 1.56'+
        '        </code>'+
        '        <p>The decimal number represents a denonmition of coins. In the example, 1.56 represents 1 gold, 5 silver, and 6 copper.</p>'+
        '        <p><b style="font-weight:800">Split</b></p>'+
        '        <p>Example:</p>'+
        '        <code>'+
        '            !moneyMaster split 300.56'+
        '        </code>'+
        '        <p>The argument provided to moneyMaster should be a float (decimal) value representing the amount to be evenly split amoungst the party memebrs. In the example, 300.56 represents 300 gold, 5 silver, and 6 copper.</p>'+
        '    </div>'+
        '    <p><b>Input:</b></p>'+
        '    <p>The argument provided to moneyMaster should be an integer value representing the amount of gold (GP) to be split amoungst the party memebrs.</p>'+
        '    <p></p>'+
        '    <p><b>Help:</b></p>'+
        '    <p>To show the help menu, type `help`, `--help`, or `-h` as the first argument in this api call.</p>'+
        '    <hr>'+
        '</div>';

        sendChat('moneyMaster', message);
    }
};

on('ready', function(){
    moneyMaster.validateConfigHandout();

    on("chat:message",function(msg){
        if(msg.type == 'api' && playerIsGM(msg.playerid)){
            var args = msg.content.trim().splitArgs(),
                   command, func, arg0, arg1, isHelp;
            
            command = args.shift().substring(1).toLowerCase();
            func = args.shift() || '';
            arg0 = args.shift() || '';
            arg1 = args.shift() || '';
            isHelp = func.toLowerCase() === 'help' || func.toLowerCase() === '--help' || func.toLowerCase() === '-h' || func.toLowerCase() === '';

            if (!isHelp){
                if(func == 'spend') {
                    if(msg.selected){
                        selectedTok = getObj('graphic', msg.selected[0]._id);
                        selectedChar = getObj('character', selectedTok.get('represents'));
                        var coins = moneyMaster._getCoins(selectedChar)
                        var totalMoney = parseInt(coins['gp']) + (parseInt(coins['sp'])/10) + (parseInt(coins['cp'])/100);
                        var cost = parseFloat(arg0) || 0;
                        var newMoney = moneyMaster.processTransaction(cost, totalMoney);
                        if(newMoney['gp'] == null){
                            newMoney['gp'] = 0;
                        } 
                        if(newMoney['sp'] == null){
                            newMoney['sp'] = 0;
                        }
                        if(newMoney['cp'] == null){
                            newMoney['cp'] = 0;
                        }
                        moneyMaster._setCoins(selectedChar, newMoney);
                    } else {
                        sendChat('moneyMaster', 'No token selected - cannot perform function.');
                    }
                } else if(func == 'split') {
                    moneyMaster.splitGold(arg0);
                }
                return;
            }

            if(isHelp){
                moneyMaster.help();
            } else {
                sendChat('moneyMaster', `Function ${func} is not valid.`);
            }

        }
    });
});

