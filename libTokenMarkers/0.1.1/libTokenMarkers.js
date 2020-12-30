// Github:   https://github.com/shdwjk/Roll20API/blob/master/libTokenMarkers/libTokenMarkers.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
var API_Meta = API_Meta||{};
API_Meta.libTokenMarkers={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.libTokenMarkers.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

const libTokenMarkers = (() => { // eslint-disable-line no-unused-vars

    const version = '0.1.1';
    API_Meta.libTokenMarkers.version = version;
    const lastUpdate = 1609294229;
    const schemaVersion = 0.1;

    const isString = (s) => 'string' === typeof s || s instanceof String;

    class TokenMarker {
        constructor( name, tag, url ) {
            this.name = name;
            this.tag = tag;
            this.url = url;
        }

        getName() {
            return this.name;
        }

        getTag() {
            return this.tag;
        }

        getHTML(scale = 1.4, style=''){
            return `<div style="width: ${scale}em; vertical-align: middle; height: ${scale}em; display:inline-block; margin: 0 3px 0 0; border:0; padding:0;background-image: url('${this.url}');background-repeat:no-repeat; background-size: auto ${scale}em;${style}"></div>`;
        }
    }

    class NullTokenMarker extends TokenMarker {
        getName() {
            return "";
        }
        getTag() {
            return "";
        }
        getHTML() {
            return "";
        }
    }

    class ColorDotTokenMarker extends TokenMarker {
        constructor( name, color ) {
            super(name,name);
            this.color = color;
        }

        getHTML(scale = 1.4, style=''){
            return `<div style="display:inline-block;line-height: 1;margin-right: .12em;${style}"><div style="width: ${scale*.9}em; height: ${scale*.9}em; border-radius:${scale}em; display:inline-block; margin: 0 auto; border:0; background-color: ${this.color};"></div></div>`;
        }
    }

    class ColorTextTokenMarker extends TokenMarker {
        constructor( name, letter, color ) {
            super(name,name);
            this.color = color;
            this.letter = letter;
        }

        getHTML(scale = 1.4, style=''){
            return `<div style="width: 1em; height: 1em; font-size: ${scale}em; line-height: 1em; display:inline-block; margin: 0; border:0; font-weight: bold; color: ${this.color}; text-align: center;${style}">${this.letter}</div>`;
        }
    }

    class TokenMarkerRegistry {

        static init(){
            let tokenMarkers = {};
            let orderedLookup = new Set();
            let reverseLookup = {};

            const insertTokenMarker = (tm) => {
                tokenMarkers[tm.getTag()] = tm;
                orderedLookup.add(tm.getTag());

                let tmName = tm.getName().toLowerCase();

                reverseLookup[tmName] = reverseLookup[tmName]||[];
                reverseLookup[tmName].push(tm.getTag()); 
            };

            const buildStaticMarkers = () => {
                insertTokenMarker(new ColorDotTokenMarker('red', '#C91010'));
                insertTokenMarker(new ColorDotTokenMarker(`blue`, '#1076c9'));
                insertTokenMarker(new ColorDotTokenMarker(`green`, '#2fc910'));
                insertTokenMarker(new ColorDotTokenMarker(`brown`, '#c97310'));
                insertTokenMarker(new ColorDotTokenMarker(`purple`, '#9510c9'));
                insertTokenMarker(new ColorDotTokenMarker(`pink`, '#eb75e1'));
                insertTokenMarker(new ColorDotTokenMarker(`yellow`, '#e5eb75'));

                insertTokenMarker(new ColorTextTokenMarker('dead', 'X', '#cc1010'));
            };


            const readTokenMarkers = () => {
                JSON.parse(Campaign().get('_token_markers')||'[]').forEach( tm => insertTokenMarker(new TokenMarker(tm.name, tm.tag, tm.url)));
            };

            TokenMarkerRegistry.getStatuses = (keyOrName) => {
                if(!isString(keyOrName)){
                    return [];
                }
                if(tokenMarkers.hasOwnProperty(keyOrName)){
                    return [tokenMarkers[keyOrName]];
                }
                let tmName = keyOrName.toLowerCase();
                if(reverseLookup.hasOwnProperty(tmName)){
                    return reverseLookup[tmName].map(t => tokenMarkers[t]); 
                }
                return [];
            };

            TokenMarkerRegistry.getStatus = (keyOrName) => (TokenMarkerRegistry.getStatuses(keyOrName))[0] || new NullTokenMarker();

            TokenMarkerRegistry.getOrderedList = () => {
                return [...orderedLookup].map( key => tokenMarkers[key]);
            };

            buildStaticMarkers();
            readTokenMarkers();
        }
    }

    const tryInit = ()=>{
        if(Campaign()) {
            TokenMarkerRegistry.init();
        } else {
            setTimeout(tryInit,10);
        }
    };
    setTimeout(tryInit,0);


    const checkInstall = () =>  {
        log('-=> libTokenMarkers v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! state.hasOwnProperty('libTokenMarkers') || state.libTokenMarkers.version !== schemaVersion) {
            log(`  > Updating Schema to v${schemaVersion} <`);
            switch(state.libTokenMarkers && state.libTokenMarkers.version) {

                case 0.1:
                    /* break; // intentional dropthrough */ /* falls through */

                case 'UpdateSchemaVersion':
                    state.libTokenMarkers.version = schemaVersion;
                    break;

                default:
                    state.libTokenMarkers = {
                        version: schemaVersion
                    };
                    break;
            }
        }
        log(`  > Loaded ${TokenMarkerRegistry.getOrderedList().length} Token Markers.`);
    };

    on('ready', checkInstall );

    return {
        getStatus: (...a) => TokenMarkerRegistry.getStatus(...a),
        getStatuses: (...a) => TokenMarkerRegistry.getStatuses(...a),
        getOrderedList: (...a) => TokenMarkerRegistry.getOrderedList(...a)
    };

})();

{try{throw new Error('');}catch(e){API_Meta.libTokenMarkers.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.libTokenMarkers.offset);}}
