var ArgParse = ArgParse || (function() {
    
    function argparse(argv) {
        var obj = {};
        argList = argv.split(' --').slice(1);
        _.each(argList, function(args) {
            let argSet = args.split(' ');
            if (argSet.length == 0) {
                return;
            } else if (argSet.length == 1) {
                obj[argSet[0]] = true;
            } else {
                let key = argSet[0].trim();
                let value = argSet.slice(1).join(' ');
                obj[key] = value.trim();
            }
        });

        return obj;
    }
    
    return {
        argparse,
    }
})();