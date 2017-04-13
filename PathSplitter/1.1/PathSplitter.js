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
  'use strict';

  const PATHSPLIT_CMD = '!pathSplit';
  const PATHSPLIT_COLOR_CMD = '!pathSplitColor';

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


  // Initialize the script's state if it hasn't already been initialized.
  state.PathSplitter = state.PathSplitter || {
    splitPathColor: '#ff00ff' // pink
  };


  function _getSplitSegmentPaths(mainSegments, splitSegments) {
    let resultSegPaths = [];
    let curPathSegs = [];

    _.each(mainSegments, seg1 => {

      // Find the points of intersection and their parametric coefficients.
      let intersections = [];
      _.each(splitSegments, seg2 => {
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
        _.each(intersections, i => {
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
  };

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

    let results = [];
    _.each(segmentPaths, segments => {
      let pathData = PathMath.segmentsToPath(segments);
      _.extend(pathData, {
        _pageid: _pageid,
        controlledby: controlledby,
        fill: fill,
        layer: layer,
        stroke: stroke,
        stroke_width: stroke_width
      });
      let path = createObj('path', pathData);
      results.push(path);
    });

    // Remove the original path and the splitPath.
    mainPath.remove();
    splitPath.remove();

    return results;
  }

  on('ready', () => {
    let macro = findObjs({
      _type: 'macro',
      name: 'Pathsplitter'
    })[0];

    if(!macro) {
      let players = findObjs({
        _type: 'player'
      });
      let gms = _.filter(players, player => {
        return playerIsGM(player.get('_id'));
      });

      _.each(gms, gm => {
        createObj('macro', {
          _playerid: gm.get('_id'),
          name: 'Pathsplitter',
          action: PATHSPLIT_CMD
        });
      });
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
        let path1 = findObjs({
          _type: 'path',
          _id: selected[0]._id
        })[0];
        let path2 = findObjs({
          _type: 'path',
          _id: selected[1]._id
        })[0];

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
          msg += `Current split color: <span style="background: ${state.PathSplitter.splitPathColor}; width: 16px; height: 16px; padding: 0.2em; font-weight: bold;">${state.PathSplitter.splitPathColor}</span>`
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
  });
})();
