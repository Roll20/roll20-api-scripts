var TerrainGenerator = TerrainGenerator || (function () {
        'use strict';
        const metadata = {
            name: 'TerrainGenerator',
            version: '0.2.0'
        };

        function getWhisperTarget(id) {
            let targets = [getObj('player', id)];
            if (targets[0]) {
                return '/w ' + targets[0].get('displayname').split(' ')[0] + ' ';
            }
            return '';
        }

        let distanceToPixels = function (dist, page) {
            let PIX_PER_UNIT = 70;
            if (!page) {
                return null;
            }
            return PIX_PER_UNIT * (dist / page.get('scale_number'));
        };

        let getPage = function (pageName) {
            let pages = findObjs({type: 'page', name: pageName});
            if (pages.length !== 1) {
                return null
            }
            return _.first(pages)
        };

        let cleanImageSource = function (imageSource) {
            const parts = imageSource.match(/(.*\/images\/.*)(thumb|med|original|max)(.*)$/);
            if (parts) {
                return parts[1] + 'thumb' + parts[3];
            }
        };

        let getImageSourceFromTable = function (rollTable, itemNames) {
            const rollTables = findObjs({type: 'rollabletable', name: rollTable});
            if (rollTables.length !== 1) {
                return null
            }
            rollTable = _.first(rollTables);
            let image;
            if(itemNames === '*') {
                image = _.sample(findObjs({type: 'tableitem', rollabletableid: rollTable.get('id')}))
            }
            else {
                image = _.chain(itemNames.split(','))
                    .map(function (name) {
                        return findObjs({type: 'tableitem', rollabletableid: rollTable.get('id'), name: name})
                    })
                    .flatten()
                    .sample()
                    .value();
            }
            if (image === undefined) {
                return null
            }
            return image.get('avatar')
        };

        let generateObjects = function (pageName, tableName, itemNames, width, height, sparsity, variance, randomRotation) {
            let page = getPage(pageName);
            if (!page) {
                log('TerrainGenerator: Couldn`t load page');
                return 'Couldn`t load page';
            }
            width = distanceToPixels(width, page);
            height = distanceToPixels(height, page);
            sparsity = distanceToPixels(sparsity, page);
            variance = distanceToPixels(variance, page);
            for (let i = 0; i < distanceToPixels(page.get('height'), page) * page.get('scale_number'); i += sparsity) {
                for (let j = 0; j < distanceToPixels(page.get('width') * page.get('scale_number'), page); j += sparsity) {
                    let randomSize = _.random(variance);
                    let x = _.random((width + randomSize) / 2, sparsity - (width + randomSize) / 2);
                    let y = _.random((height + randomSize) / 2, sparsity - (height + randomSize) / 2);
                    let image = getImageSourceFromTable(tableName, itemNames);
                    if (image === null) {
                        log('TerrainGenerator: Couldn`t load image from rollable table');
                        return 'Couldn`t load image from rollable table';
                    }
                    image = cleanImageSource(image);
                    if (image === undefined) {
                        log('TerrainGenerator: Image must be upload to rollable table your PC');
                        return 'Image must be uploaded to rollable table from your PC'
                    }
                    createObj('graphic', {
                        subtype: 'token',
                        pageid: page.id,
                        imgsrc: image,
                        top: x + j,
                        left: y + i,
                        width: width + randomSize,
                        height: height + randomSize,
                        layer: 'map',
                        rotation: _.random(randomRotation)

                    })
                }
            }
            return true

        };

        let fillBackground = function (pageName, tableName, itemNames, size) {
            return generateObjects(pageName, tableName, itemNames, size, size, size, 0, 0);
        };

        let spawnTrees = function (pageName, tableName, itemNames, size, sparsity, variance, randomRotation) {
            return generateObjects(pageName, tableName, itemNames, size, size, sparsity, variance, randomRotation)
        };

        let handleInput = function (msg) {
            if (msg.type !== 'api') {

            }
            else if ( msg.content.startsWith('!TG') && !playerIsGM(msg.playerid)) {
                log('TerrainGenerator: Only GM can use this script');
                sendChat('TerrainGenerator', getWhisperTarget(msg.playerid) + 'Only GM can use this script');
            }
            else if (msg.content.startsWith('!TGGeneral')) {
                let args = msg.content.split(' ');
                if (args.length !== 9) {
                    log('TerrainGenerator: Wrong number of arguments for !TGGeneral');
                    sendChat('TerrainGenerator', getWhisperTarget(msg.playerid) + 'Wrong number of arguments for !TGGeneral');
                    return;
                }
                args = _.object(['command', 'pageName', 'tableName', 'itemNames', 'width', 'height', 'sparsity', 'variance', 'randomRotation'], args);
                args.width = parseFloat(args.width);
                args.height = parseFloat(args.height);
                args.sparsity = parseFloat(args.sparsity);
                args.variance = parseFloat(args.variance);
                args.randomRotation = parseFloat(args.randomRotation);
                if (_.contains([args.width, args.height, args.sparsity, args.variance, args.randomRotation], NaN)) {
                    log('TerrainGenerator: Wrong argument');
                    sendChat('TerrainGenerator', getWhisperTarget(msg.playerid) + 'Wrong argument');
                    return
                }
                let result = generateObjects(args.pageName, args.tableName, args.itemNames, args.width, args.height, args.sparsity, args.variance, args.randomRotation);
                if (result !== true) {
                    sendChat('TerrainGenerator', getWhisperTarget(msg.playerid) + result);
                }
            }
            else if (msg.content.startsWith('!TGFillBG')) {
                let args = msg.content.split(' ');
                if (args.length !== 5) {
                    log('TerrainGenerator: Wrong number of arguments for !TGFillBG');
                    sendChat('TerrainGenerator', getWhisperTarget(msg.playerid) + 'Wrong number of arguments for !TGFillBG');
                    return;
                }
                args = _.object(['command', 'pageName', 'tableName', 'itemNames', 'size'], args);
                args.size = parseFloat(args.size);
                if (_.contains([args.size], NaN)) {
                    log('TerrainGenerator: Wrong argument');
                    sendChat('TerrainGenerator', getWhisperTarget(msg.playerid) + 'Wrong argument');
                    return
                }
                let result = fillBackground(args.pageName, args.tableName, args.itemNames, args.size);
                if (result !== true) {
                    sendChat('TerrainGenerator', getWhisperTarget(msg.playerid) + result);
                }
            }
            else if (msg.content.startsWith('!TGSpawnTrees')) {
                let args = msg.content.split(' ');
                if (args.length !== 8) {
                    log('TerrainGenerator: Wrong number of arguments for !TGSpawnTrees');
                    sendChat('TerrainGenerator', getWhisperTarget(msg.playerid) + 'Wrong number of arguments for !TGSpawnTrees');
                    return;
                }
                args = _.object(['command', 'pageName', 'tableName', 'itemNames', 'size', 'sparsity', 'variance', 'randomRotation'], args);
                args.size = parseFloat(args.size);
                args.sparsity = parseFloat(args.sparsity);
                args.variance = parseFloat(args.variance);
                args.randomRotation = parseFloat(args.randomRotation);
                if (_.contains([args.size, args.sparsity, args.variance, args.randomRotation], NaN)) {
                    log('TerrainGenerator: Wrong argument');
                    sendChat('TerrainGenerator', getWhisperTarget(msg.playerid) + 'Wrong argument');
                    return
                }
                let result = spawnTrees(args.pageName, args.tableName, args.itemNames, args.size, args.sparsity, args.variance, args.randomRotation);
                if (result !== true) {
                    sendChat('TerrainGenerator', getWhisperTarget(msg.playerid) + result);
                }
            }
        };

        let checkInstall = function () {
            log(metadata.name + ' ver ' + metadata.version + ' loaded');
        };

        let registerEventHandlers = function () {
            on('chat:message', handleInput)
        };

        return {
            checkInstall: checkInstall,
            registerEventHandlers: registerEventHandlers
        }
    })();

on('ready', function () {
    'use strict';
    TerrainGenerator.checkInstall();
    TerrainGenerator.registerEventHandlers();
});