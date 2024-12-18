var API_Meta = API_Meta||{}; //eslint-disable-line no-var
API_Meta.PathSplitter={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.PathSplitter.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-3);}}
API_Meta.PathSplitter.version = '1.1.2';
/* globals PathMath */
/**
 * This script provides a way for players and GMs to split paths by their
 * intersections with another splitting path.
 * This could especially be useful for when corrections need to be made to
 * paths used for dynamic lighting.
 *
 * Simply draw a polygonal path intersecting the path you want to split up.
 * Select the main path and then the splitting path.
 * Then with the main and splitting paths selected,
 * enter the command '!pathSplit'.
 * The original path will be divided into new paths separated at the points
 * where the splitting path intersected the original path.
 *
 * This script also works with paths that have been scaled and rotated.'
 *
 * Requires:
 *   VectorMath
 *   MatrixMath
 *   PathMath
 */

(() => {

  const DEFAULT_SPLIT_COLOR = '#ff00ff';
  const MAKE_MACROS = true;

  const PATHSPLIT_CMD = '!pathSplit';
  const PATHJOIN_CMD = '!pathJoin';
  const PATHCLOSE_CMD = '!pathClose';
  const PATHSPLIT_COLOR_CMD = '!pathSplitColor';
  const EPSILON = 0.001;

  /**
   * A 3-tuple representing a point of intersection between two line segments.
   * The first element is a Vector representing the point of intersection in
   * 2D homogenous coordinates.
   * The second element is the parametric coefficient for the intersection
   * along the first segment.
   * The third element is the parametric coefficient for the intersection
   * along the second segment.
   * @typedef {Array} Intersection
   */

   /**
   * A vector used to define a homogeneous point or a direction.
   * @typedef {number[]} Vector
   */

  /**
   * A line segment defined by two homogenous 2D points.
   * @typedef {Vector[]} Segment
   */

  let isJumpgate = ()=>{
    if(['jumpgate'].includes(Campaign().get('_release'))) {
      isJumpgate = () => true;
    } else {
      isJumpgate = () => false;
    }
    return isJumpgate();
  };


  // Initialize the script's state if it hasn't already been initialized.
  state.PathSplitter = state.PathSplitter || {
    splitPathColor: DEFAULT_SPLIT_COLOR // pink
  };


  function _getSplitSegmentPaths(mainSegments, splitSegments) {
    let resultSegPaths = [];
    let curPathSegs = [];

    mainSegments.forEach( seg1 => {

      // Find the points of intersection and their parametric coefficients.
      let intersections = [];
      splitSegments.forEach(seg2 => {
        let i = PathMath.segmentIntersection(seg1, seg2);
        if(i)
          intersections.push(i);
      });

      if(intersections.length > 0) {
        // Sort the intersections in the order that they appear along seg1.
        intersections.sort((a, b) => {
          return a[1] - b[1];
        });

        let lastPt = seg1[0];
        intersections.forEach( i => {
          // Complete the current segment path.
          curPathSegs.push([lastPt, i[0]]);
          resultSegPaths.push(curPathSegs);

          // Start a new segment path.
          curPathSegs = [];
          lastPt = i[0];
        });
        curPathSegs.push([lastPt, seg1[1]]);
      }
      else {
        curPathSegs.push(seg1);
      }
    });
    resultSegPaths.push(curPathSegs);

    return resultSegPaths;
  }

  const ptDist = (p1,p2) => Math.sqrt(Math.pow(p2[0]-p1[0],2)+Math.pow(p2[1]-p1[1],2));

  const reverseSegs = (segs) => [...segs.map(seg=>seg.reverse())].reverse();

  function closePath(path1){
    let segments = PathMath.toSegments(path1);
    let len = segments.length;

    let _pageid = path1.get('_pageid');
    let controlledby = path1.get('controlledby');
    let fill = path1.get('fill');
    let layer = path1.get('layer');
    let stroke = path1.get('stroke');
    let stroke_width = path1.get('stroke_width');
    let pathExtra = {
        _pageid,
        controlledby,
        fill,
        layer,
        stroke,
        stroke_width
    };

    if(isJumpgate()){
      switch(path1.get('shape')){
        case 'free':
          pathExtra.shape='free'; // force back to freehand
          break;
        case 'pol':
        case 'eli':
        case 'rec':
          break;
      }
    }

    let p1 = [...segments[len-1][1]];
    let p2 = [...segments[0][0]];
    let mp = [(p1[0]+p2[0])/2, (p1[1]+p2[1])/2,1];

    // add closing segment
    segments.unshift(
      [mp,p2]
    );
    segments.push(
      [p1,mp]
    );

    let pathData = {
      ...PathMath.segmentsToPath(segments),
      ...pathExtra
    };
    let path = createObj(isJumpgate() ? 'pathv2' : 'path', pathData);
    if(path){
      path1.remove();
    }
  }

  function joinPaths(path1,path2){
    let p1Segments = PathMath.toSegments(path1);
    let p2Segments = PathMath.toSegments(path2);
    let p1Len = p1Segments.length;
    let p2Len = p2Segments.length;

    let _pageid = path1.get('_pageid');
    let controlledby = path1.get('controlledby');
    let fill = path1.get('fill');
    let layer = path1.get('layer');
    let stroke = path1.get('stroke');
    let stroke_width = path1.get('stroke_width');
    let pathExtra = {
        _pageid,
        controlledby,
        fill,
        layer,
        stroke,
        stroke_width
    };

//    $d({p1Segments,p1Len,p2Segments,p2Len});

    let strategy = [
      { st: 'ss', dist: ptDist(p1Segments[0][0],p2Segments[0][0]) },
      { st: 'se', dist: ptDist(p1Segments[0][0],p2Segments[p2Len-1][1]) },
      { st: 'es', dist: ptDist(p1Segments[p1Len-1][1],p2Segments[0][0]) },
      { st: 'ee', dist: ptDist(p1Segments[p1Len-1][1],p2Segments[p2Len-1][1]) }
    ].sort((a,b)=>a.dist-b.dist)[0];

    switch(strategy.st){
      case 'es':
        break;
      case 'ss':
        p1Segments = reverseSegs(p1Segments);
        break;
      case 'se':
        p1Segments = reverseSegs(p1Segments);
        p2Segments = reverseSegs(p2Segments);
        break;
      case 'ee':
        p2Segments = reverseSegs(p2Segments);
        break;
    }

    let segments;

    if(strategy.dist>0){
      segments = [
        ...p1Segments,
        [p1Segments[p1Len-1][1],p2Segments[0][0]],
        ...p2Segments
      ];
    } else {
      segments = [
        ...p1Segments,
        ...p2Segments
      ];
    }

    if(isJumpgate()){
      switch(path1.get('shape')){
        case 'free':
          pathExtra.shape='free'; // force back to freehand
          break;
        case 'pol':
        case 'eli':
        case 'rec':
          break;
      }
    }

    let pathData = {
      ...PathMath.segmentsToPath(segments),
      ...pathExtra
    };
    let path = createObj(isJumpgate() ? 'pathv2' : 'path', pathData);
    if(path){
      path1.remove();
      path2.remove();
    }
  }

  /**
   * Splits mainPath at its intersections with splitPath. The original path
   * is removed, being replaced by the new split up paths.
   * @param {Path} mainPath
   * @param {Path} splitPath
   * @return {Path[]}
   */
  function splitPathAtIntersections(mainPath, splitPath) {
    let mainSegments = PathMath.toSegments(mainPath);
    let splitSegments = PathMath.toSegments(splitPath);
    let segmentPaths = _getSplitSegmentPaths(mainSegments, splitSegments);

    // Convert the list of segment paths into paths.
    let _pageid = mainPath.get('_pageid');
    let controlledby = mainPath.get('controlledby');
    let fill = mainPath.get('fill');
    let layer = mainPath.get('layer');
    let stroke = mainPath.get('stroke');
    let stroke_width = mainPath.get('stroke_width');
    let pathExtra = {
        _pageid,
        controlledby,
        fill,
        layer,
        stroke,
        stroke_width
    };

    const ptSame = (p1,p2)=> p1[0]===p2[0] && p1[1]===p2[1] && p1[2]===p2[2] ;

    // remove zero length lines
    segmentPaths = segmentPaths
      .map(segs=> segs.filter(s => !ptSame(s[0],s[1])))
      .filter(segs => segs.length);

    if(isJumpgate()){
      switch(mainPath.get('shape')){
        case 'free':
          pathExtra.shape='free'; // force back to freehand
          break;
        case 'pol':
          break;

        case 'eli':
        case 'rec':
            // fix up endpoints 
          if(segmentPaths.length > 1){
            let distCheck = PathMath.distanceToPoint(segmentPaths[0][0][0],splitPath);
            if(distCheck > EPSILON) {
              segmentPaths[0] = [
                ...segmentPaths[segmentPaths.length-1],
                ...segmentPaths[0]
              ];
              delete segmentPaths[segmentPaths.length-1];
              segmentPaths = segmentPaths.filter(p=>null !== p && undefined !== p);
            }
          }
          break;

        default:
          // pathv1 path, do nothing
      }
    }

    let results = [];
    segmentPaths.forEach(segments => {
      let pathData = {
        ...PathMath.segmentsToPath(segments),
        ...pathExtra
      };
      let path = createObj(isJumpgate() ? 'pathv2' : 'path', pathData);
      results.push(path);
    });

    // Remove the original path and the splitPath.
    mainPath.remove();
    splitPath.remove();

    return results;
  }

  on('ready', () => {
    if(MAKE_MACROS){
      let macro = findObjs({
        _type: 'macro',
        name: 'Pathsplitter'
      })[0];

      if(!macro) {
        findObjs({
          _type: 'player'
        })
        .filter( player => playerIsGM(player.id))
        .forEach( gm => {
          createObj('macro', {
            _playerid: gm.get('_id'),
            name: 'Pathsplitter',
            action: PATHSPLIT_CMD
          });
        });
      }

      let macro2 = findObjs({
        _type: 'macro',
        name: 'Pathjoiner'
      })[0];

      if(!macro2) {
        findObjs({
          _type: 'player'
        })
        .filter( player => playerIsGM(player.id))
        .forEach( gm => {
          createObj('macro', {
            _playerid: gm.get('_id'),
            name: 'Pathjoiner',
            action: PATHJOIN_CMD
          });
        });
      }

      let macro3 = findObjs({
        _type: 'macro',
        name: 'Pathcloser'
      })[0];

      if(!macro3) {
        findObjs({
          _type: 'player'
        })
        .filter( player => playerIsGM(player.id))
        .forEach( gm => {
          createObj('macro', {
            _playerid: gm.get('_id'),
            name: 'Pathcloser',
            action: PATHCLOSE_CMD
          });
        });
      }
    }
  });

  on('chat:message', msg => {
    if(msg.type === 'api' && msg.content === PATHSPLIT_COLOR_CMD) {
      try {
        let selected = msg.selected;
        let path = findObjs({
          _type: 'path',
          _id: selected[0]._id
        })[0];

        let stroke = path.get('stroke');
        state.PathSplitter.splitPathColor = stroke;
      }
      catch(err) {
        log('!pathSplit ERROR: ' + err.message);
        log(err.stack);
      }
    }
    else if(msg.type === 'api' && msg.content === PATHSPLIT_CMD) {
      try {
        let selected = msg.selected;
        if(!selected || selected.length !== 2 || ! /^path/.test(selected[0]._type) ||  ! /^path/.test(selected[1]._type) ) {
          let num = selected?.length || 0;
          let types = (selected?.map(o=>o._type)||[]).join(", ");

          let msg = `Two paths must be selected: the one you want to split, and the splitting path (color: <span style="background: ${state.PathSplitter.splitPathColor}; width: 16px; height: 16px; padding: 0.2em; font-weight: bold;">${state.PathSplitter.splitPathColor}</span>).  Selected: (${num}): ${types}`;
          sendChat('Pathsplitter', msg);
          throw new Error(msg);
        }

        let path1 = getObj(selected[0]._type,selected[0]._id);
        let path2 = getObj(selected[1]._type,selected[1]._id);

        // Determine which path is the main path and which is the
        // splitting path.
        let mainPath, splitPath;
        if(path1.get('stroke') === state.PathSplitter.splitPathColor) {
          mainPath = path2;
          splitPath = path1;
        }
        else if(path2.get('stroke') === state.PathSplitter.splitPathColor) {
          mainPath = path1;
          splitPath = path2;
        }
        else {
          let msg = 'No splitting path selected. ';
          msg += `Current split color: <span style="background: ${state.PathSplitter.splitPathColor}; width: 16px; height: 16px; padding: 0.2em; font-weight: bold;">${state.PathSplitter.splitPathColor}</span>`;
          sendChat('Pathsplitter', msg);

          throw new Error('No splitting path selected.');
        }
        splitPathAtIntersections(mainPath, splitPath);
      }
      catch(err) {
        log('!pathSplit ERROR: ' + err.message);
        log(err.stack);
      }
    }
    else if(msg.type === 'api' && msg.content === PATHJOIN_CMD) {
      try {
        let selected = msg.selected;
        if(!selected || selected.length !== 2 || ! /^path/.test(selected[0]._type) ||  ! /^path/.test(selected[1]._type) ) {
          let num = selected?.length || 0;
          let types = (selected?.map(o=>o._type)||[]).join(", ");

          let msg = `Two paths must be selected for joining.  Selected: (${num}): ${types}`;
          sendChat('Pathsplitter', msg);
          throw new Error(msg);
        }

        let path1 = getObj(selected[0]._type,selected[0]._id);
        let path2 = getObj(selected[1]._type,selected[1]._id);

        joinPaths(path1,path2);
      }
      catch(err) {
        log('!pathSplit ERROR: ' + err.message);
        log(err.stack);
      }
    } else if(msg.type === 'api' && msg.content === PATHCLOSE_CMD) {
      try {
        let selected = msg.selected;
        if(!selected || selected.length !== 1 || ! /^path/.test(selected[0]._type) ) {
          let num = selected?.length || 0;
          let types = (selected?.map(o=>o._type)||[]).join(", ");

          let msg = `One path must be selected for closing.  Selected: (${num}): ${types}`;
          sendChat('Pathsplitter', msg);
          throw new Error(msg);
        }

        let path1 = getObj(selected[0]._type,selected[0]._id);

        closePath(path1);
      }
      catch(err) {
        log('!pathSplit ERROR: ' + err.message);
        log(err.stack);
      }
    }
  });
})();
{try{throw new Error('');}catch(e){API_Meta.PathSplitter.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.PathSplitter.offset);}}
