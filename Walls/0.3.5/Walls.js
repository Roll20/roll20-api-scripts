// Github:   https://github.com/shdwjk/Roll20API/blob/master/Walls/Walls.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

const Walls = (() => { // eslint-disable-line no-unused-vars

    const version = '0.3.5';
    const lastUpdate = 1569122819;
    const schemaVersion = 0.4;
    const regex = {
        colors: /^(?:#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?|transparent)$/
    };

    const resetWork = () => state.Walls.work = {
        accumulating: {},
        mapGraphic: {
            id: undefined,
            pageid: undefined,
            x: 0.0,
            y: 0.0,
            width: 1.0,
            height: 1.0
        },
        scale: {
            x: 1.0,
            y: 1.0
        },
        color: {
            stroke: '#ff0000',
            fill: 'transparent'
        },
        strokeWidth: 5,
        completedPaths: [],
        workPath: []
    };

    const checkInstall = () => {
        log('-=> Walls v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! state.hasOwnProperty('Walls') || state.Walls.schemaVersion !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');

            state.Walls = {
                version: schemaVersion,
                work: {}
            };
        }
        resetWork();
    };
    const min = (arr) => arr.reduce((a,b) => a < b ? a : b);
    const max = (arr) => arr.reduce((a,b) => a > b ? a : b);
    const isNumber = (n) => typeof n ==='number' && n === Number(n) && Number.isFinite(n);

    const range = (n) => [...Array(n).keys()];
    //const rangeEven = (n) => range(Math.floor(n/2)).map(v=>v*2);
    //const rangeOdd = (n) => range(Math.floor(n/2)).map(v=>v*2+1);
    const range0_1 = (n) => range(n+1).map(v=>v/n);

    let epsilon = 1;

    let PT = {
        approxEqual: (a,b) => (Math.abs(a[0]-b[0])<epsilon) && (Math.abs(a[1]-b[1])<epsilon),
        dist: (a,b) => Math.sqrt(Math.pow(a[0]-b[0],2)+Math.pow(a[1]-b[1],2)),
        min: (a,b) => [min([a[0],b[0]]),min([a[1],b[1]])],
        max: (a,b) => [max([a[0],b[0]]),max([a[1],b[1]])],
        sub: (a,b) => [a[0]-b[0],a[1]-b[1]],
        dim: (a,b) => [Math.abs(a[0]-b[0]), Math.abs(a[1]-b[1])]
    };
    let toPlaces3 = (n) => (1*n.toFixed(3));

    let bezierPoint1D = (t,s,c1,c2,e) => s*(1.0-t)*(1.0-t)*(1.0-t)+3.0*c1*(1.0-t)*(1.0-t)*t+3.0*c2*(1.0-t)*t*t+e*t*t*t;
    let bezierPoint2D = (t,s,c1,c2,e) => [bezierPoint1D(t,s[0],c1[0],c2[0],e[0]), bezierPoint1D(t,s[1],c1[1],c2[1],e[1])];

    let approximateCurve = (start, ar) => {
        let control1 = ar.slice(1,3);
        let control2 = ar.slice(3,5);
        let end = ar.slice(5,7);

        // is straight line
        if( PT.approxEqual(start,control1) &&
            PT.approxEqual(control2,end) ) {
            return [['L', ...end.map(toPlaces3) ]];
        }

        // is true curve
        let eLength = PT.dist(start,control1) + PT.dist(control1,control2) + PT.dist(control2,end);
        let steps = Math.round(eLength/10)||1;

        let newAr = [];
        range0_1(steps).slice(1).map(t=>{
            newAr.push(['L', ...bezierPoint2D(t,start,control1,control2,end).map(toPlaces3)]);
        });
        
        return newAr;
    };

    const normalizeSegment = (elem,start) => {
        switch(elem[0]){
            case 'M':
                return [['M',Math.round(elem[1]),Math.round(elem[2])]];

            case 'C':
                return approximateCurve(start,elem);
        }
        return elem;
    };

    const buildPath = (segments) => {
        // find bounding box
        let minPt = [Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER];
        let maxPt = [0,0];
        
        let start = [0,0];
        let p = [];
        segments.forEach(elem => {
            let segs = normalizeSegment(elem,start);
            p = [...p,...segs];
            start = p.slice(-1)[0].slice(-2);
        });

        p.forEach((elem) => {
            switch(elem[0]) {
                case 'M':
                    minPt = PT.min(minPt,elem.slice(1,3));
                    maxPt = PT.max(maxPt,elem.slice(1,3));
                    break;

                case 'L':
                    minPt = PT.min(minPt,elem.slice(1,3));
                    maxPt = PT.max(maxPt,elem.slice(1,3));
                    break;


                default:
                    break;
            }
        });
        let dim = PT.dim(minPt,maxPt);
        let centerX = minPt[0]+(dim[0]/2) + state.Walls.work.mapGraphic.x;
        let centerY = minPt[1]+(dim[1]/2) + state.Walls.work.mapGraphic.y;

        let newP = [];

        // re-bias points
        p.forEach((elem) => {
            newP.push([elem[0],...PT.sub(elem.slice(-2),minPt)]);
        });

        let pathstring=JSON.stringify(newP);

        createObj('path',{
            pageid: state.Walls.work.mapGraphic.pageid,
            stroke: state.Walls.work.color.stroke,
            fill: state.Walls.work.color.fill,
            left: centerX,
            top: centerY,
            width: dim[0],
            height: dim[1],
            stroke_width: state.Walls.work.strokeWidth,
            layer: 'walls',
            path: pathstring
        });
    };

    const buildWalls = () => {
        if(state.Walls.work.mapGraphic.id) {
            let mapGraphic=getObj('graphic',state.Walls.work.mapGraphic.id);
            if(mapGraphic) {
                state.Walls.work.completedPaths.forEach(buildPath);
            }
            sendChat('','/w gm Walls finished.');
        }
    };

    const handleInput = (msg) => {
        if('api' === msg.type && /^!walls\b/i.test(msg.content) && playerIsGM(msg.playerid)){

            let args = msg.content.split(/\s+/).slice(1);

            let mapGraphic,left,top,width,height;
            let who = (getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

            switch(args[0]) {

                case 'begin':
                    resetWork();
                    if(msg.selected && 1 === msg.selected.length && 'graphic'=== msg.selected[0]._type) {
                        mapGraphic=getObj('graphic',msg.selected[0]._id);
                        if(mapGraphic) {
                            left=mapGraphic.get('left');
                            top =mapGraphic.get('top');
                            width=mapGraphic.get('width');
                            height=mapGraphic.get('height');

                            state.Walls.work.mapGraphic.id=mapGraphic.id;
                            state.Walls.work.mapGraphic.pageid=mapGraphic.get('pageid');
                            state.Walls.work.mapGraphic.x=Math.round((left-(width/2))*100)/100;
                            state.Walls.work.mapGraphic.y=Math.round((top-(height/2))*100)/100;
                            state.Walls.work.mapGraphic.height=height;
                            state.Walls.work.mapGraphic.width=width;
                        }
                    } else {
                        sendChat('Walls',`/w "${who}" Warning - select exactly one graphic on the mapGraphic layer.`);
                    }
                    break;

                case 'end':
                    if(state.Walls.work.workPath.length) {
                        state.Walls.work.completedPaths.push(state.Walls.work.workPath);
                        state.Walls.work.workPath=[];
                    }
                    buildWalls();
                    break;

                case 'viewbox':
                    state.Walls.work.scale.x=state.Walls.work.mapGraphic.width/args[1];
                    state.Walls.work.scale.y=state.Walls.work.mapGraphic.height/args[2];
                    break;

                case 'strokewidth': {
                    let w = parseFloat(args[1]);
                    if(isNumber(w) && ( 0<w && w<100)){
                        state.Walls.work.strokeWidth = w;
                    }
                }
                break;

            case 'strokecolor':
                if(args[1].match(regex.colors)){
                    state.Walls.work.color.stroke = args[1];
                }
                break;

            case 'fillcolor':
                if(args[1].match(regex.colors)){
                    state.Walls.work.color.fill = args[1];
                }
                break;

            case 'moveto':
                if(state.Walls.work.workPath.length) {
                    state.Walls.work.completedPaths.push(state.Walls.work.workPath);
                    state.Walls.work.workPath=[];
                }
                state.Walls.work.workPath.push(['M',(args[1]*state.Walls.work.scale.x),(args[2]*state.Walls.work.scale.y)]);
                break;

            case 'curveto':
                state.Walls.work.workPath.push(['C',
                    (args[1]*state.Walls.work.scale.x), (args[2]*state.Walls.work.scale.y),
                    (args[3]*state.Walls.work.scale.x), (args[4]*state.Walls.work.scale.y),
                    (args[5]*state.Walls.work.scale.x), (args[6]*state.Walls.work.scale.y)
                ]);
                break;

            case 'lineto':
                state.Walls.work.workPath.push(['L',
                    (args[1]*state.Walls.work.scale.x), (args[2]*state.Walls.work.scale.y)
                ]);
                break;
            }
        }
    };

    const registerEventHandlers = () => {        
        on("chat:message", handleInput);
    };

    on("ready", () => {
        checkInstall(); 
        registerEventHandlers();
    });

    return { /* public interface */ };
})();



