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

var GIM = {
    /////////BEGIN USER CONFIG/////////
    playerList: [
        '-JgXIBWtSs8su8RF-Slt', /* X1: Bor Bersk. */
        '-JglZwTIFm0ivfDzMssH', /* X2: Ulfgar Ungart */
    	'-JggSWGNp1gDvfdZSTPf', /* 3: Baba Frostbeard */
    	'-JglZlSBA2oSX2ClDirs', /* X4: Goden Arthelast */
    	'-JglZlRofAw79n0D-2ol', /* X5: Firalphien Variel */
        '-JglZwTIFm0ivfDzMssH,-JggSWGNp1gDvfdZSTPf,-JglZlSBA2oSX2ClDirs,-JglZlRofAw79n0D-2ol' /* 6: Tamey (Esel) */
    ],
    logPlayerIds: true,
    invImg: 'https://s3.amazonaws.com/files.d20.io/images/7359609/N7-rgMNvKG5czBsAXGD-Mw/thumb.png?1422290877',
    coin: {
        weight: 0.02, /* in lbs. */
        volume: 0.00004, /* in cubic feet. (25,000 per ft3) */
        value_copper: 0.01,
        value_silver: 0.1,
        value_electrum: 0.2,
        value_gold: 1,
        value_platinum: 10
    },
    temperatureUnit: 'C', /* Change to C if Celsius is desired */
    storageItems: [// make sure that no name is any of 'storage'
		{
		    name: 'backpack',
		    maxWeight: 30,
		    maxVolume: 1
		},
		{
		    name: 'quiver',
		    maxWeight: 1,
		    maxVolume: 0.1
		},
		{
		    name: 'boltcase',
		    maxWeight: 1.5,
		    maxVolume: 0.15
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
		    name: 'hhhside1',
		    maxWeight: 20,
		    maxVolume: 2
		},
		{
		    name: 'hhhside2',
		    maxWeight: 20,
		    maxVolume: 2
		},
		{
		    name: 'hhh',
		    maxWeight: 80,
		    maxVolume: 8
		},
    	{
    	    name: 'chest',
    	    maxWeight: 300,
    	    maxVolume: 12
    	},
        {
            name: 'cart',
            maxWeight: 600,
            maxVolume: 50
        }
    ],
    //////////END USER CONFIG//////////	

    invRegex: /^(main|inv%20rep_\S+|worn|drop|ignore)$/i,
    statusRegex: /^(status2?)$/i,
    objsToBeCreated: [],
    lastRun: Date.now(),
    run: function ()
    {
        var time = Date.now();
        if (time - GIM.lastRun > 1000)
        {
            GIM.process();
            _.each(GIM.objsToBeCreated, function (o)
            {
                GIM.create_inv(o.pageId, o.name, o.left, o.top, o.id, o.weight, o.volume);
            });
            GIM.objsToBeCreated = [];
            GIM.lastRun = time;
        }
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
        var typeRegEx = /^(main)|(inv)%20rep_\S+|(worn)|(drop)|(ignore)|(status\d?)$/,
            coinRegEx = /^coins%20(\S+)$/,
            weightRegEx = /^weight%20([\d\.,]+)%20liquid$/,
            warmthRegEx = /^warmth%20(\d+)$/,
            amountRegEx = /(\d+)x/,
            representRegEx = /inv%20rep_(\S+)/;

        var characterAreas = [],
            statuses = [],
            inventories = [],
            items = [],
            equipped = [];

        var pageGraphics = findObjs({ _pageid: Campaign().get('playerpageid'), _type: 'graphic' });
        _.each(pageGraphics, function (graphic)
        {
            var typeResult = typeRegEx.exec(graphic.get('gmnotes')),
                specialType = _.reduceRight(typeResult, function (memo, val) { return memo || val; }, null);

            var obj = {
                type: specialType || 'item',
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

            var notes = graphic.get('gmnotes');

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
                    break;
                case 'inv':
                case 'worn':
                case 'drop':
                    obj.properties = {
                        representId: _.reduceRight(representRegEx.exec(notes), function (memo, val) { return memo || val; }, null)
                    };
                    inventories.push(obj);

                    options.showplayers_bar1 = true;
                    options.showplayers_bar2 = true;
                    break;
                case 'ignore':
                    break;
                default:
                    obj.properties = {
                        isLiquidContainer: notes.indexOf('liquid') !== -1,
                        isUnstowable: notes.indexOf('unstowable') !== -1,
                        coinType: _.reduceRight(coinRegEx.exec(notes), function (memo, val) { return memo || val; }, null),
                        coinAmount: parseFloat(graphic.get('bar3_value')),
                        baseWeight: parseFloat(_.reduceRight(weightRegEx.exec(notes), function (memo, val) { return memo || val; }, null) || 0),
                        warmthValue: parseInt(_.reduceRight(warmthRegEx.exec(notes), function (memo, val) { return memo || val; }, null) || 0),
                        grantsHospitality: notes.indexOf('hosp') !== -1,
                        amount: parseInt(_.reduceRight(amountRegEx.exec(graphic.get('name')), function (memo, val) { return memo || val; }, null) || 1),
                        hasInventory: notes.indexOf('storage') !== -1
                    };
                    items.push(obj);
                    break;
            }

            options.showname = options.showname && _.isString(graphic.get('name')) && graphic.get('name').length > 1;

            graphic.set(options);
        });

        // returns true if the center of 'item' lies inside of 'container'
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

        _.each(items, function (item)
        {
            // update coin weight and volume based on amount
            if (item.properties.coinType)
            {
                item.graphic.set('bar1_value', Math.ceil(GIM.coin.weight * item.properties.coinAmount * 10000) / 10000);
                item.graphic.set('bar2_value', Math.ceil(GIM.coin.volume * item.properties.coinAmount * 10000) / 10000);
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
        });

        _.each(inventories, function (inventory)
        {
            inventory.containedItems = [];
            inventory.containedWeight = 0;
            inventory.containedWeightMax = parseFloat(inventory.graphic.get('bar1_max')) / 100;
            inventory.containedVolume = 0;
            inventory.containedVolumeMax = parseFloat(inventory.graphic.get('bar2_max')) / 100;
            _.each(items, function (item)
            {
                if (itemIsInContainer(item.graphic, inventory.graphic))
                {
                    switch (inventory.type)
                    {
                        case 'inv':
                            if (item.properties.isUnstowable)
                            {
                                item.graphic.set('top', inventory.graphic.get('top') + inventory.graphic.get('height') / 2 + 35);
                                break;
                            }
                        case 'drop':
                            inventory.containedItems.push(item);
                            inventory.containedWeight += parseFloat(item.graphic.get('bar1_value') * item.properties.amount) + item.properties.baseWeight;
                            inventory.containedVolume += parseFloat(item.graphic.get('bar2_value') * item.properties.amount);
                            break;
                        case 'worn':
                            // if this item has an inventory, add its id to the equipped list, otherwise check if a storage has to be created
                            if (item.properties.hasInventory)
                            {
                                equipped.push(item.graphic.get('_id'));
                            }
                            else
                            {
                                var notes = item.graphic.get('gmnotes');
                                _.each(GIM.storageItems, function (storageKind)
                                {
                                    for (var i = 0; i < 10 && notes.indexOf(storageKind.name) !== -1; ++i)
                                    {
                                        GIM.objsToBeCreated.push({
                                            pageId: item.graphic.get('_pageid'),
                                            name: Localization['storage_' + storage.name],
                                            left: item.get('left'),
                                            top: item.get('top'),
                                            id: item.get('_id'),
                                            weight: storageKind.maxWeight,
                                            volume: storageKind.maxVolume
                                        });
                                        notes.replace(storageKind.name, 'storage');
                                    }
                                });
                                item.graphic.set('gmnotes', notes);
                            }
                            break;
                    }
                }
            });
        });

        _.each(inventories, function (inventory)
        {
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

            if (inventory.type === 'inv' || inventory.type === 'drop')
                _.each(inventory.containedItems, function (item)
                {
                    // copy layer from containing inventory
                    item.graphic.set('layer', inventory.graphic.get('layer'));
                });
        });

        _.each(characterAreas, function (charArea)
        {
            //characterAreas.containedItems = [];
            charArea.containedWeight = 0;
            charArea.containedVolume = 0;
            charArea.containedCoinValue = 0;
            _.each(items, function (item)
            {
                if (itemIsInContainer(item.graphic, charArea.graphic) && item.graphic.get('layer') === 'objects')
                {
                    item.graphic.set('controlledby', GIM.playerList[parseInt(charArea.graphic.get('bar3_value')) - 1] || '');

                    //item.graphic.set('status_fishing-net', true);

                    charArea.containedWeight += parseFloat(item.graphic.get('bar1_value') * item.properties.amount) + item.properties.baseWeight;
                    charArea.containedVolume += parseFloat(item.graphic.get('bar2_value') * item.properties.amount);
                    if (item.properties.coinType)
                        charArea.containedCoinValue += GIM.coin['value_' + item.properties.coinType] * item.properties.coinAmount;
                }
            });

            _.each(statuses, function (status)
            {
                if (status.graphic.get('bar3_value') === charArea.graphic.get('bar3_value'))
                    switch (status.type)
                    {
                        case 'status':
                            var totalWeight = Math.ceil(charArea.containedWeight * 100) / 100,
                                totalVolume = Math.ceil(charArea.containedVolume * 100) / 100;
                            status.graphic.set('name', Localization.weight + ': ' + totalWeight + ' | ' + Localization.profile + ': ' + totalVolume);
                            break;
                        case 'status2':
                            break;
                        case 'status3':
                            status.graphic.set('name', Localization.coins + ': ' + Math.floor(charArea.containedCoinValue));
                            break;
                    }
            });
        });
    },
    create_inv: function (g_page_id, g_name, g_left, g_top, g_id, g_wgt, g_vol)
    {
        setTimeout(function ()
        {
            toBack(GIM.fixedCreateObj('graphic', {
                name: g_name,
                imgsrc: GIM.invImg,
                pageid: g_page_id,
                left: g_left + 280,
                top: g_top,
                width: 70,
                height: 70,
                bar1_value: 0,
                bar1_max: g_wgt * 100,
                bar2_value: 0,
                bar2_max: g_vol * 100,
                layer: 'objects',
                gmnotes: 'inv rep_' + g_id
            }));
        }, 5);
    }
};

on('ready', function ()
{
    if (GIM.logPlayerIds)
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
    //setInterval(function () { GIM.runMe() }, 500);
    on('change:graphic:lastmove', function (obj)
    {
        obj.set({ status_spanner: true });
        GIM.run();
    });
    on('add:graphic', function (obj)
    {
        obj.set('width', 70);
        obj.set('height', 70);
    });
});