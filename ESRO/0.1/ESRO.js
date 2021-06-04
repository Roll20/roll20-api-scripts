var bshields = bshields || {}, wrap;
bshields.esro = (function() {
    'use strict';
    
    var version = 0.1,
        statuses = ['red', 'blue', 'green', 'brown', 'purple', 'pink', 'yellow',
            'dead', 'skull', 'sleepy', 'half-heart', 'half-haze',
            'interdiction', 'snail', 'lightning-helix', 'spanner',
            'chained-heart', 'chemical-bolt', 'death-zone', 'drink-me',
            'edge-crack', 'ninja-mask', 'stopwatch', 'fishing-net', 'overdrive',
            'strong', 'fist', 'padlock', 'three-leaves', 'fluffy-wing',
            'pummeled', 'tread', 'arrowed', 'aura', 'back-pain', 'black-flag',
            'bleeding-eye', 'bolt-shield', 'broken-heart', 'cobweb',
            'broken-shield', 'flying-flag', 'radioactive', 'trophy',
            'broken-skull', 'frozen-orb', 'rolling-bomb', 'white-tower', 'grab',
            'screaming', 'grenade', 'sentry-gun', 'all-for-one', 'angel-outfit',
            'archery-target'],
        r20GetObj = getObj,
        r20Campaign = Campaign,
        r20FindObjs = findObjs,
        r20FilterObjs = filterObjs,
        r20GetAllObjs = getAllObjs,
        r20CreateObj = createObj,
        r20On = on,
        r20ToFront = toFront,
        r20ToBack = toBack;
    
    function Roll20Object(obj) {
        for (var k in obj) this[k] = false;
        this.toString = function toString(minimal) {
            return !minimal && this.toJSON ? this.toJSON() : '[object Roll20Object' + (this.id ? ' ' + this.id : '') + ']';
        };
        this.unwrap = function unwrap() { return obj; };
    }
    function wrapObjs(objs) { return _.map(objs, function(o) { return wrapObj(o); }); }
    function wrapObj(obj) {
        var newObj = new Roll20Object(obj);
        
        _.each(newObj, function(v, key) {
            if(key === 'toString' || key === 'unwrap' || key === 'id') return;
            Object.defineProperty(newObj, key, {
                enumerable: true,
                configurable: false,
                get: function() { return obj[key]; },
                set: function(v) { /* NOP */ }
            });
        });
        _.each(newObj.attributes, function(val, key) {
            if ((newObj.get('type') === 'character' || newObj.get('type') === 'handout') && (key === 'notes' || key === 'gmnotes' || key === 'bio')) {
                Object.defineProperty(newObj, key, {
                    enumerable: true,
                    configurable: false,
                    get: function() {
                        var prom = new Promise(function(resolve, reject) { newObj.get(key, function(text) { resolve(text); }); })
                        return function async(callback) { prom.then(callback); };
                    },
                    set: function(v) { newObj.set ? newObj.set(key, v) : newObj.attributes[key] = v; }
                });
                return;
            }
            
            if (key.indexOf('_') === 0) {
                Object.defineProperty(newObj, key.substring(1), {
                    enumerable: true,
                    configurable: false,
                    get: function() { return newObj.get ? newObj.get(key) : newObj.attributes[key]; },
                    set: function(v) { /* NOP */ }
                });
                Object.defineProperty(newObj, key, {
                    enumerable: true,
                    configurable: false,
                    get: function() { return newObj.get ? newObj.get(key) : newObj.attributes[key]; },
                    set: function(v) { /* NOP */ }
                });
            } else {
                Object.defineProperty(newObj, key, {
                    enumerable: true,
                    configurable: false,
                    get: function() { return newObj.get ? newObj.get(key) : newObj.attributes[key]; },
                    set: function(v) { newObj.set ? newObj.set(key, v) : newObj.attributes[key] = v; }
                });
            }
        });
        
        if (newObj.type === 'graphic') {
            _.each(statuses, function(status) {
                Object.defineProperty(newObj, 'status_' + status, {
                    enumerable: false,
                    configurable: false,
                    get: function() {
                        function extractStatus(s) {
                            if (s.indexOf(status) < 0) return false;
                            s = s.substring(s.indexOf(status));
                            if (s.indexOf(',') === status.length || s.indexOf(',') < 0 && s.length === status.length) return true;
                            s = s.substring(s.indexOf('@') + 1, s.indexOf(',') < 0 ? s.length : s.indexOf(','));
                            return parseInt(s);
                        }
                        
                        return newObj.get ? newObj.get('status_' + status) : extractStatus(newObj.attributes.statusmarkers);
                    },
                    set: function(v) {
                        function insertStatus(s) {
                            var statusInsert;
                            if (v) {
                                if (_.isNumber(v)) statusInsert = status + '@' + v;
                                else statusInsert = status;
                                
                                if (s.length === 0) return statusInsert;
                                if (s.indexOf(status) < 0) return [s, statusInsert].join(',');
                                s = s.split(',');
                                _.each(s, function(t, i) {
                                    if (t.indexOf(status) === 0) s[i] = statusInsert;
                                    else s[i] = '';
                                });
                                s = _.reject(s, function(t) { return t.length === 0; });
                                return s.join(',');
                            } else {
                                if (s.indexOf(status) >= 0) {
                                    s = s.split(',');
                                    _.each(s, function(t, i) { if (t.indexOf(status) === 0) t[i] = ''; });
                                    s = _.reject(s, function(t) { return t.length === 0; });
                                    return s.join(',');
                                }
                                return s;
                            }
                        }
                        
                        newObj.set ? newObj.set('status_' + status, v) : newObj.attributes.statusmarkers = insertStatus(newObj.attributes.statusmarkers);
                    }
                });
            });
        }
        
        return newObj;
    }
    
    function externalWrapObj(obj) {
        if (_.isArray(obj)) {
            return wrapObjs(obj);
        } else {
            return wrapObj(obj);
        }
    }
    
    function esroGetObj(type, id) { return wrapObj(r20GetObj(type, id)); }
    function esroCampaign() { return wrapObj(r20Campaign()); }
    function esroFindObjs(attrs, options) { return wrapObjs(r20FindObjs(attrs, options)); }
    function esroGetAllObjs() { return wrapObjs(r20GetAllObjs()); }
    function esroCreateObj(type, attributes) { return wrapObject(r20CreateObj(type, attributes)); }
    function esroFilterObjs(callback) {
        var allObjs = esroGetAllObjs();
        
        return _.filter(allObjs, callback);
    }
    
    function esroOn(event, callback) {
        if (event.indexOf('change:') === 0) { // obj, prev
            r20On(event, function(obj, prev) {
                callback(wrapObj(obj), prev);
            });
        } else if (event.indexOf('add:') === 0 || event.indexOf('destroy:') === 0) { // obj
            r20On(event, function(obj) {
                callback(wrapObj(obj));
            });
        } else { // passthrough
            r20On(event, callback);
        }
    }
    
    function esroToFront(obj) {
        if (obj instanceof Roll20Object) r20ToFront(obj.unwrap());
        else r20ToFront(obj);
    }
    function esroToBack(obj) {
        if (obj instanceof Roll20Object) r20ToBack(obj.unwrap());
        else r20ToBack(obj);
    }
    
    function checkInstall() {
        if (!state.bshields ||
            !state.bshields.esro ||
            !state.bshields.esro.version ||
             state.bshields.esro.version !== version) {
            state.bshields = state.bshields || {};
            state.bshields.esro = {
                version: version,
                gcUpdated: 0,
                config: {}
            }
        }
        checkGlobalConfig();
    }
    
    function checkGlobalConfig() {
        var gc = globalconfig && globalconfig.esro,
            st = state.bshields.esro;
        
        if (gc && gc.lastsaved && gc.lastsaved > st.gcUpdated) {
            st.gcUpdated = gc.lastsaved;
            st.config.getObj = gc['Overwrite `getObj()`'] === 'true';
            st.config.Campaign = gc['Overwrite `Campaign()`'] === 'true';
            st.config.findObjs = gc['Overwrite `findObjs()`'] === 'true';
            st.config.filterObjs = gc['Overwrite `filterObjs()`'] === 'true';
            st.config.getAllObjs = gc['Overwrite `getAllObjs()`'] === 'true';
            st.config.createObj = gc['Overwrite `createObj()`'] === 'true';
            st.config.on = gc['Overwrite `on()`'] === 'true';
            st.config.toFront = gc['Overwrite `toFront()`'] === 'true';
            st.config.toBack = gc['Overwrite `toBack()`'] === 'true';
        }
    }
    
    return {
        checkInstall: checkInstall,
        wrap: externalWrapObj,
        
        // Wrapped versions of object functions
        getObj: esroGetObj,
        Campaign: esroCampaign,
        findObjs: esroFindObjs,
        filterObjs: esroFilterObjs,
        getAllObjs: esroGetAllObjs,
        createObj: esroCreateObj,
        on: esroOn,
        toFront: esroToFront,
        toBack: esroToBack,
        
        // Original version of object functions
        r20: {
            getObj: r20GetObj,
            Campaign: r20Campaign,
            findObjs: r20FindObjs,
            filterObjs: r20FilterObjs,
            getAllObjs: r20GetAllObjs,
            createObj: r20CreateObj,
            on: r20On,
            toFront: r20ToFront,
            toBack: r20ToBack
        }
    };
}());
bshields.esro.overwriteFunctions = (function() {
    // Overwriting the existing Roll20 functions requires non-strict mode
    var configDefaults = {
            getObj: true,
            Campaign: true,
            findObjs: true,
            filterObjs: true,
            getAllObjs: true,
            createObj: true,
            on: true,
            toFront: true,
            toBack: true
        },
        config = {
            get getObj() {
                var st = state.bshields.esro.config.getObj;
                if (_.isBoolean(st)) return st;
                return configDefaults.getObj;
            },
            get Campaign() {
                var st = state.bshields.esro.config.Campaign;
                if (_.isBoolean(st)) return st;
                return configDefaults.Campaign;
            },
            get findObjs() {
                var st = state.bshields.esro.config.findObjs;
                if (_.isBoolean(st)) return st;
                return configDefaults.findObjs;
            },
            get filterObjs() {
                var st = state.bshields.esro.config.filterObjs;
                if (_.isBoolean(st)) return st;
                return configDefaults.filterObjs;
            },
            get getAllObjs() {
                var st = state.bshields.esro.config.getAllObjs;
                if (_.isBoolean(st)) return st;
                return configDefaults.getAllObjs;
            },
            get createObj() {
                var st = state.bshields.esro.config.createObj;
                if (_.isBoolean(st)) return st;
                return configDefaults.createObj;
            },
            get on() {
                var st = state.bshields.esro.config.on;
                if (_.isBoolean(st)) return st;
                return configDefaults.on;
            },
            get toFront() {
                var st = state.bshields.esro.config.toFront;
                if (_.isBoolean(st)) return st;
                return configDefaults.toFront;
            },
            get toBack() {
                var st = state.bshields.esro.config.toBack;
                if (_.isBoolean(st)) return st;
                return configDefaults.toBack;
            }
        };
    
    function overwriteFunctions() {
        if (config.getObj) getObj = bshields.esro.getObj;
        if (config.Campaign) Campaign = bshields.esro.Campaign;
        if (config.findObjs) findObjs = bshields.esro.findObjs;
        if (config.filterObjs) filterObjs = bshields.esro.filterObjs;
        if (config.getAllObjs) getAllObjs = bshields.esro.getAllObjs;
        if (config.createObj) createObj = bshields.esro.createObj;
        if (config.on) on = bshields.esro.on;
        if (config.toFront) toFront = bshields.esro.toFront;
        if (config.toBack) toBack = bshields.esro.toBack;
    }
    
    return overwriteFunctions;
}());

on('ready', function() {
    'use strict';
    
    bshields.esro.checkInstall();
    bshields.esro.overwriteFunctions();
});
wrap = wrap || bshields.esro.wrap;