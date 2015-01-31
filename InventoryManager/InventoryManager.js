/////////////////////////////////////////////////
/***********************************************/
var Localization = {
    'coins': 'Goldwert',
    'coin_copper': 'KM',
    'coin_silver': 'SM',
    'coin_electrum': 'EM',
    'coin_gold': 'GM',
    'coin_platinum': 'PM',

    'weight': 'Traglast',
    'warmth': 'Wärme',
    'hospitality': 'Komfort',
    'profile': 'Profil',

    'storage_backpack': 'Rucksack',
    'storage_quiver': 'Köcher',
    'storage_boltcase': 'Bolzenköcher',
    'storage_pouch': 'Beutel',
    'storage_bagofholding': 'Nimmervoller Beutel',
    'storage_hhh': 'Praktischer Tornister',
    'storage_hhhside1': 'Tornister Seitenfach',
    'storage_hhhside2': 'Tornister Seitenfach',
    'storage_chest': 'Kiste',
    'storage_cart': 'Karren',
    'storage_pocket': 'Tasche'
};

/////////////////////////////////////////////////
/***********************************************/

var RoubysInventoryManager = {
    /////////BEGIN USER CONFIG/////////
    playerList: [
        '', /* 1: Bor Bersk. */
        '-JglZwTIFm0ivfDzMssH', /* 2: Ulfgar Ungart */
<<<<<<< HEAD
        '-JggSWGNp1gDvfdZSTPf', /* 3: Baba Frostbeard */
        '-JglZlSBA2oSX2ClDirs', /* 4: Goden Arthelast */
        '-JglZlRofAw79n0D-2ol', /* 5: Firalphien Variel */
=======
    	'-JggSWGNp1gDvfdZSTPf', /* 3: Baba Frostbeard */
    	'-JglZlSBA2oSX2ClDirs', /* 4: Goden Arthelast */
    	'-JglZlRofAw79n0D-2ol', /* 5: Firalphien Variel */
>>>>>>> 9b9c4f505bc9e1d6f49411ebfec2c667885038dd
        '-JglZwTIFm0ivfDzMssH,-JggSWGNp1gDvfdZSTPf,-JglZlSBA2oSX2ClDirs,-JglZlRofAw79n0D-2ol' /* 6: Tamey (community) */
    ],
    logPlayerIds: true,
    inventoryTokenImage: 'https://s3.amazonaws.com/files.d20.io/images/7359609/N7-rgMNvKG5czBsAXGD-Mw/thumb.png?1422290877',
    coin: {
        weight: 0.02, // in lbs
        volume: 0.00004, // in cubic feet (25,000 per ft3)
        value_copper: 0.01,
        value_silver: 0.1,
        value_electrum: 0.2,
        value_gold: 1,
        value_platinum: 10
    },
    temperatureUnit: 'C', // change to F if fahrenheit is desired
    storageItems: [
<<<<<<< HEAD
        {
            name: 'backpack', // key of the storagekind, does not contain storage!
            maxWeight: 30, // maximum weight allowed in this kind
            maxVolume: 1 // maximum of contained volume allowed
        },
        {
            name: 'quiver',
            maxWeight: 1,
            maxVolume: .1
        },
        {
            name: 'boltcase',
            maxWeight: 1.5,
            maxVolume: .15
        },
        {
            name: 'pouch',
            maxWeight: 6,
            maxVolume: .2
        },
        {
            name: 'pocket',
            maxWeight: 3,
            maxVolume: .1
        },
        {
            name: 'bagofholding',
            maxWeight: 500,
            maxVolume: 64
        },
        {
            name: 'hhh',
            maxWeight: 80,
            maxVolume: 8
        },
        {
            name: 'hhhside',
            maxWeight: 20,
            maxVolume: 2
        },
        {
            name: 'chest',
            maxWeight: 300,
            maxVolume: 12
        },
=======
		{
		    name: 'backpack', // key of the storagekind, does not contain storage!
		    maxWeight: 30, // maximum weight allowed in this kind
		    maxVolume: 1 // maximum of contained volume allowed
		},
		{
		    name: 'quiver',
		    maxWeight: 1,
		    maxVolume: .1
		},
		{
		    name: 'boltcase',
		    maxWeight: 1.5,
		    maxVolume: .15
		},
		{
		    name: 'pouch',
		    maxWeight: 6,
		    maxVolume: .2
		},
    	{
    	    name: 'pocket',
    	    maxWeight: 3,
    	    maxVolume: .1
    	},
		{
		    name: 'bagofholding',
		    maxWeight: 500,
		    maxVolume: 64
		},
		{
		    name: 'hhh',
		    maxWeight: 80,
		    maxVolume: 8
		},
		{
		    name: 'hhhside',
		    maxWeight: 20,
		    maxVolume: 2
		},
    	{
    	    name: 'chest',
    	    maxWeight: 300,
    	    maxVolume: 12
    	},
>>>>>>> 9b9c4f505bc9e1d6f49411ebfec2c667885038dd
        {
            name: 'cart',
            maxWeight: 600,
            maxVolume: 50
        }
    ],
    //////////END USER CONFIG//////////    

    debugMode: false,
    objsToBeCreated: [],
    lastRun: Date.now(),
    run: function ()
    {
        var time = Date.now();
        if (time - RoubysInventoryManager.lastRun > 1000)
        {
            RoubysInventoryManager.process();
            _.each(RoubysInventoryManager.objsToBeCreated, function (o)
            {
                RoubysInventoryManager.createInventory(o.pageId, o.name, o.left, o.top, o.id, o.weight, o.volume);
            });
            RoubysInventoryManager.objsToBeCreated = [];
            RoubysInventoryManager.lastRun = time;
        }
    },
    createInventory: function (g_page_id, g_name, g_left, g_top, g_id, g_wgt, g_vol)
    {
        setTimeout(function ()
        {
            toBack(RoubysInventoryManager.fixedCreateObj('graphic', {
                name: g_name,
                imgsrc: RoubysInventoryManager.inventoryTokenImage,
                pageid: g_page_id,
                left: g_left + 280,
                top: g_top,
                width: 70,
                height: 70,
                bar1_value: 0,
                bar1_max: g_wgt,
                bar2_value: 0,
                bar2_max: g_vol,
                layer: 'objects',
                gmnotes: 'inv rep_' + g_id
            }));
        }, 5);
    },
    fixedCreateObj: function ()
    {
        var obj = createObj.apply(this, arguments);
        if (obj && !obj.fbpath)
        {
            obj.fbpath = obj.changed._fbpath.replace(/([^\/]*\/){4}/, '/');
        }
        return obj;
    },
    process: function ()
    {
        var typeRegEx = /(main)|(inv)|(worn)|(drop)|(ignore)|(status\d?)/,
            modifierRegEx = /(unstowable)|(constantweight)|(liquid)|(hosp)|(storage)/ig,
            paramModifierRegEx = /(?:(weight)%20([\d\.,]+))|(?:(warmth)%20(\d+))|(?:(coins)%20(\S+))|(?:(rep)_(\S+))|(?:(weightfactor)%20([\d\.,]+))/ig,
            amountRegEx = /(\d+)x/;

        function getType(notes)
        {
            return _.reduceRight(typeRegEx.exec(notes), function (memo, val) { return memo || val; }, null) || 'item';
        }

        function getModifier(notes)
        {
            var match = null,
                results = {
                    unstowable: false,
                    constantweight: false,
                    liquid: false,
                    hosp: false,
                    storage: false
                };
            modifierRegEx.lastIndex = 0;
            while (match = modifierRegEx.exec(notes))
                results[match[0].toLowerCase()] = !!_.reduceRight(match, function (memo, val) { return memo || val; }, null);
            return results;
        }

        function getParamModifier(notes)
        {
            var match = null,
                results = {
                    weight: null,
                    warmth: null,
                    coins: null,
                    rep: null,
                    weightfactor: null
                };
            paramModifierRegEx.lastIndex = 0;
            while (match = paramModifierRegEx.exec(notes))
            {
                var index = -1,
                    value = _.reduceRight(match, function (memo, val, i) { if (!memo) index = i; return memo || val; }, null);
                results[match[index - 1].toLowerCase()] = value;
            }
            return results;
        }

        // returns true if the center of 'item' lies inside of 'container' dimensions
        function itemIsInContainer(item, container)
        {
            var halfWidth = container.get('width') / 2,
                halfHeight = container.get('height') / 2,
                left = container.get('left') - halfWidth,
                top = container.get('top') - halfHeight,
                right = container.get('left') + halfWidth,
                bottom = container.get('top') + halfHeight;

            return item.get('left') >= left &&
                   item.get('top') >= top &&
                   item.get('left') <= right &&
                   item.get('top') <= bottom;
        }

        var characterAreas = [],
            statuses = [],
            equipmentSlots = [],
            inventories = [],
            items = [],
            equipped = [];

        /***
         * Go thru all tokens on the current page and sort them into their groups, parse modifiers
         * and store informations in their objects for the algorithm
         **/
        var pageGraphics = findObjs({ _pageid: Campaign().get('playerpageid'), _type: 'graphic' });
        _.each(pageGraphics, function (graphic)
        {
            var notes = graphic.get('gmnotes'),
                specialType = getType(notes),
                modifier = getModifier(notes),
                paramModifier = getParamModifier(notes);

            var obj = {
                type: specialType,
                graphic: graphic
            };

            var options = {
                statusmarkers: '!',

                showplayers_name: true,
                showname: true,

                showplayers_bar1: false,
                showplayers_bar2: false,
                showplayers_bar3: false,

                playersedit_bar1: false,
                playersedit_bar2: false,
                playersedit_bar3: false,
            };

            switch (specialType)
            {
                case 'main':
                    characterAreas.push(obj);

                    options.showname = false;
                    break;
                case 'status':
                case 'status2':
                case 'status3':
                    statuses.push(obj);

                    if (graphic.get('bar1_max') > 0)
                        options.showplayers_bar1 = true;
                    break;
                case 'worn':
                    obj.properties = {
                        isSlot: true
                    };

                    equipmentSlots.push(obj);
                    break;
                case 'inv':
                    obj.properties = {
                        representId: paramModifier.rep
                    };

                    options.showplayers_bar1 = true;
                    options.showplayers_bar2 = true;
                case 'drop':
                    inventories.push(obj);
                    break;
                case 'ignore':
                    break;
                default:
                    obj.properties = {
                        equippedAt: null,
                        isLiquidContainer: modifier.liquid,
                        isUnstowable: modifier.unstowable,
                        coinType: paramModifier.coins,
                        coinAmount: paramModifier.coins ? parseFloat(graphic.get('bar3_value')) : 0,
                        baseWeight: parseFloat(paramModifier.weight || 0),
                        warmthValue: parseInt(paramModifier.warmth || 0),
                        grantsHospitality: modifier.hosp,
                        amount: parseInt(_.reduceRight(amountRegEx.exec(graphic.get('name')), function (memo, val) { return memo || val; }, null) || 1),
                        hasInventory: modifier.storage,
                        inventories: [],
                        hasConstantWeight: modifier.constantweight
                    };
                    items.push(obj);
                    break;
            }

            // show the name if the namefield is set (and longer than a char)
            options.showname = options.showname && _.isString(graphic.get('name')) && graphic.get('name').length > 1;

            graphic.set(options);
        });

        /***
         * Go thru all items (tokens that represent bare items that one can carry) and calculate their weights / containers
         **/
        _.each(items, function (item)
        {
            // update coin weight and volume based on amount
            if (item.properties.coinType)
            {
                item.graphic.set('bar1_value', Math.ceil(RoubysInventoryManager.coin.weight * item.properties.coinAmount * 10000) / 10000);
                item.graphic.set('bar2_value', Math.ceil(RoubysInventoryManager.coin.volume * item.properties.coinAmount * 10000) / 10000);
                item.graphic.set('name', Localization['coin_' + item.properties.coinType] + ': ' + item.properties.coinAmount);
            }
            // if the item is an empty liquid container, reset its tint and name
            if (item.properties.isLiquidContainer)
            {
                if (item.graphic.get('bar1_value') == 0)
                {
                    // pull the default name from the character it represents (if any)
                    var character = getObj('character', item.graphic.get('represents'));
                    var defaultName = character ? character.get('name') : '';
                    item.graphic.set('name', defaultName);
                    item.graphic.set('tint_color', 'transparent');
                }
            }

            // check if this item is equipped
            _.each(equipmentSlots, function (slot)
            {
                if (itemIsInContainer(item.graphic, slot.graphic))
                {
                    item.properties.equippedAt = slot;

                    if (RoubysInventoryManager.debugMode)
                        item.graphic.set('status_grab', true);

                    // if this item has an inventory, add its id to the equipped list, otherwise check if a storage has to be created
                    if (item.properties.hasInventory)
                    {
                        //item.properties.hasConstantWeight
                        equipped.push(item.graphic.get('_id'));
                    }
                    else
                    {
                        var notes = item.graphic.get('gmnotes');
                        _.each(RoubysInventoryManager.storageItems, function (storageKind)
                        {
                            for (var i = 0; i < 10 && notes.indexOf(storageKind.name) !== -1; ++i)
                            {
                                RoubysInventoryManager.objsToBeCreated.push({
                                    pageId: item.graphic.get('_pageid'),
                                    name: Localization['storage_' + storageKind.name],
                                    left: item.graphic.get('left'),
                                    top: item.graphic.get('top'),
                                    id: item.graphic.get('_id'),
                                    weight: storageKind.maxWeight * 100,
                                    volume: storageKind.maxVolume * 100
                                });
                                notes = notes.replace(storageKind.name, 'storage');
                            }
                        });
                        item.graphic.set('gmnotes', notes);
                    }
                }
            });
        });

        _.each(inventories, function (inventory)
        {
            inventory.containedItems = [];
            inventory.containedWeight = 0;
            inventory.containedVolume = 0;
            // divide by 100 because values less than 1 dont display a bar, so we multiply bar-values when we set them
            inventory.containedWeightMax = parseFloat(inventory.graphic.get('bar1_max')) / 100;
            inventory.containedVolumeMax = parseFloat(inventory.graphic.get('bar2_max')) / 100;
            _.each(items, function (item)
            {
                if (itemIsInContainer(item.graphic, inventory.graphic))
                {
                    if (inventory.type === 'inv' && item.properties.isUnstowable)
                    {
                        item.graphic.set('top', inventory.graphic.get('top') + inventory.graphic.get('height') / 2 + 35);
                    }
                    else
                    {
                        inventory.containedItems.push(item);
                        inventory.containedWeight += parseFloat(item.graphic.get('bar1_value') * item.properties.amount) + item.properties.baseWeight;
                        inventory.containedVolume += parseFloat(item.graphic.get('bar2_value') * item.properties.amount);

                        if (RoubysInventoryManager.debugMode)
                            item.graphic.set('status_fishing-net', true);
                    }
                }
<<<<<<< HEAD
                else if (inventory.type === 'inv')
=======
                else if(inventory.type === 'inv')
>>>>>>> 9b9c4f505bc9e1d6f49411ebfec2c667885038dd
                {
                    if (item.properties.hasInventory && item.graphic.get('_id') === inventory.properties.representId)
                    {
                        item.properties.inventories.push(inventory);

                        if (RoubysInventoryManager.debugMode)
                        {
                            inventory.graphic.set('status_padlock', true);
                            item.graphic.set('status_padlock', true);
                        }
                    }
                }
            });
            // set weight and volume for backpack inventories and such
            if (inventory.type === 'inv')
            {
                var isEquipped = equipped.indexOf(inventory.properties.representId) !== -1,
                    isFull = inventory.containedWeight > inventory.containedWeightMax && inventory.containedWeightMax > 0 ||
                             inventory.containedVolume > inventory.containedVolumeMax && inventory.containedVolumeMax > 0;

                inventory.graphic.set('bar1_value', Math.ceil(inventory.containedWeight * 100));
                inventory.graphic.set('bar2_value', Math.ceil(inventory.containedVolume * 100));
                inventory.graphic.set({ status_dead: isFull });

                // hide the inventory, if its representative is not equipped
                if (!isEquipped)
                {
                    inventory.graphic.set('layer', 'gmlayer');
                }
                else
                {
                    inventory.graphic.set('layer', 'objects');
                }
            }
            else if (inventory.type === 'drop')
            {
                inventory.graphic.set('layer', 'map');
            }

            _.each(inventory.containedItems, function (item)
            {
                // copy layer from containing inventory
                item.graphic.set('layer', inventory.graphic.get('layer'));
            });
        });

        _.each(characterAreas, function (charArea)
        {
            charArea.containedWeight = 0;
            charArea.containedVolume = 0;
            charArea.containedCoinValue = 0;
            _.each(items, function (item)
            {
                if (itemIsInContainer(item.graphic, charArea.graphic) && item.graphic.get('layer') === 'objects')
                {
                    var controller = RoubysInventoryManager.playerList[parseInt(charArea.graphic.get('bar3_value')) - 1] || '';

                    item.graphic.set('controlledby', controller);

                    if (!item.properties.containedIn && item.properties.equippedAt)
                    {
                        charArea.containedWeight += parseFloat(item.graphic.get('bar1_value') * item.properties.amount) + item.properties.baseWeight;
                        charArea.containedVolume += parseFloat(item.graphic.get('bar2_value') * item.properties.amount);
                        if (item.properties.coinType)
                            charArea.containedCoinValue += RoubysInventoryManager.coin['value_' + item.properties.coinType] * item.properties.coinAmount;

<<<<<<< HEAD
                        if (item.properties.hasInventory && !item.properties.hasConstantWeight)
=======
                        if(item.properties.hasInventory && !item.properties.hasConstantWeight)
>>>>>>> 9b9c4f505bc9e1d6f49411ebfec2c667885038dd
                        {
                            _.each(item.properties.inventories, function (inventory)
                            {
                                _.each(inventory.containedItems, function (containerItem)
                                {
                                    containerItem.graphic.set('controlledby', controller);

                                    charArea.containedWeight += parseFloat(containerItem.graphic.get('bar1_value') * containerItem.properties.amount) + containerItem.properties.baseWeight;
                                    // dont add the volume (/profile) to the charater for contained items
                                    //charArea.containedVolume += parseFloat(containerItem.graphic.get('bar2_value') * containerItem.properties.amount);
                                    if (containerItem.properties.coinType)
                                        charArea.containedCoinValue += RoubysInventoryManager.coin['value_' + containerItem.properties.coinType] * containerItem.properties.coinAmount;

                                    if (RoubysInventoryManager.debugMode)
                                        containerItem.graphic.set('status_bleeding-eye', true);
                                })
                            });
                        }

                        if (RoubysInventoryManager.debugMode)
                            item.graphic.set('status_bleeding-eye', true);
                    }
                }
            });

            _.each(statuses, function (status)
            {
                if (status.graphic.get('bar3_value') === charArea.graphic.get('bar3_value'))
                    switch (status.type)
                    {
                        case 'status':
                            var totalWeight = Math.ceil(charArea.containedWeight * 100) / 100,
                                totalVolume = Math.ceil(charArea.containedVolume * 100) / 100,
                                maxWeight = parseFloat(status.graphic.get('bar1_max')) / 100,
                                maxVolume = parseFloat(status.graphic.get('bar2_max')) / 100,
                                isFull = totalWeight > maxWeight && maxWeight > 0 ||
                                         totalVolume > maxVolume && maxVolume > 0;

                            status.graphic.set('name', Localization.weight + ': ' + totalWeight + ' | ' + Localization.profile + ': ' + totalVolume);

                            status.graphic.set('bar1_value', Math.ceil(totalWeight * 100));
                            status.graphic.set('bar2_value', Math.ceil(totalVolume * 100));
                            status.graphic.set({ status_dead: isFull });
                            break;
                        case 'status2':
                            break;
                        case 'status3':
                            status.graphic.set('name', Localization.coins + ': ' + Math.floor(charArea.containedCoinValue));
                            break;
                    }
            });
        });
    }
};

on('ready', function ()
{
    if (RoubysInventoryManager.logPlayerIds)
    {
        log('************* PLAYER IDs *************');
        filterObjs(function (obj)
        {
            if (obj.get('type') == 'player')
                log(obj.get('_displayname') + ': ' + obj.get('_id'));
            return false;
        });
        log('**************************************');
    }
    //setInterval(function () { RoubysInventoryManager.runMe() }, 500);
    on('change:graphic:lastmove', function (obj)
    {
        if (RoubysInventoryManager.debugMode)
            obj.set({ status_spanner: true });
        RoubysInventoryManager.run();
    });
    on('add:graphic', function (obj)
    {
        obj.set('width', 70);
        obj.set('height', 70);
    });
});