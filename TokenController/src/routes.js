// Route parsing and compilation. Pure functions only: nothing here touches the
// Roll20 API, so the module can be unit tested in Node.
//
// A route compiles into a track: the list of positions ("frames") a token
// visits, starting where it starts. Patrols walk the track forwards, and
// ping-pong routes walk it backwards again, so a token always retraces exactly
// the cells it came along.

import {
  ANCHOR_PAGE,
  MAX_STEP_DISTANCE,
  MAX_TRACK_FRAMES,
  MAX_WAIT,
  POSITION_EPSILON,
  ROUTE_KIND_CODE,
} from './constants.js';
import {
  bearing,
  cellPitch,
  DIRECTIONS,
  directionZigzags,
  lateralCoordinate,
  stepFrom,
} from './grid.js';

// One step-code token: a direction with an optional distance, W (wait) with an
// optional count, or S (stealth). Diagonals are matched before single letters.
const CODE_TOKEN = /(UL|UR|DL|DR|U|D|L|R)(\d+)?|(W)(\d+)?|(S)/iy;
const CODE_SEPARATOR = /[\s,;]+/y;

/**
 * Parses a step code such as "U2R2D2L2", "UR3 W2 DL3" or "U0WWS".
 *
 * Directions are U, D, L, R and the diagonals UL, UR, DL, DR, each followed by
 * a distance in cells (default 1). A distance of 0 turns the token without
 * moving it. W waits one tick (W3 waits three). S toggles stealth: the token
 * moves between the token layer and the GM layer.
 *
 * @param {string} code Step code.
 * @returns {{ok: true, steps: object[]}|{ok: false, error: string, at?: string}}
 *          Parsed steps, or an error key ('empty', 'badToken', 'tooFar', 'tooLong').
 */
export function parseCode(code) {
  const text = typeof code === 'string' ? code.trim() : '';
  if (!text) {
    return { ok: false, error: 'empty' };
  }
  const steps = [];
  let index = 0;
  while (index < text.length) {
    CODE_SEPARATOR.lastIndex = index;
    if (CODE_SEPARATOR.test(text)) {
      index = CODE_SEPARATOR.lastIndex;
      continue;
    }
    CODE_TOKEN.lastIndex = index;
    const match = CODE_TOKEN.exec(text);
    if (!match) {
      return { ok: false, error: 'badToken', at: text.slice(index, index + 6) };
    }
    index = CODE_TOKEN.lastIndex;
    if (match[1]) {
      const distance = match[2] === undefined ? 1 : Number(match[2]);
      if (distance > MAX_STEP_DISTANCE) {
        return { ok: false, error: 'tooFar', at: match[0] };
      }
      const dir = match[1].toUpperCase();
      steps.push(distance === 0 ? { type: 'face', dir } : { type: 'move', dir, distance });
    } else if (match[3]) {
      const count = match[4] === undefined ? 1 : Number(match[4]);
      if (count < 1 || count > MAX_WAIT) {
        return { ok: false, error: 'tooFar', at: match[0] };
      }
      steps.push({ type: 'wait', count });
    } else {
      steps.push({ type: 'stealth' });
    }
  }
  if (steps.length === 0) {
    return { ok: false, error: 'empty' };
  }
  return { ok: true, steps };
}

/**
 * Writes steps back as a canonical step code.
 *
 * @param {object[]} steps Parsed steps.
 * @returns {string} Step code.
 */
export function stepsToCode(steps) {
  return steps
    .map((step) => {
      if (step.type === 'move') {
        return `${step.dir}${step.distance}`;
      }
      if (step.type === 'face') {
        return `${step.dir}0`;
      }
      if (step.type === 'wait') {
        return step.count === 1 ? 'W' : `W${step.count}`;
      }
      return 'S';
    })
    .join('');
}

/**
 * Returns true when a step code ends where it starts on a square grid
 * (moves cancel out). Used to pick a sensible default mode for new routes.
 *
 * @param {object[]} steps Parsed steps.
 * @returns {boolean} True when the moves cancel out.
 */
export function stepsReturnToStart(steps) {
  let x = 0;
  let y = 0;
  let moved = false;
  for (const step of steps) {
    if (step.type === 'move') {
      const [dx, dy] = DIRECTIONS[step.dir];
      x += dx * step.distance;
      y += dy * step.distance;
      moved = true;
    }
  }
  return moved && x === 0 && y === 0;
}

/**
 * Creates a track frame.
 *
 * @param {number[]} point [x, y].
 * @param {object} [extra] Extra frame fields.
 * @returns {object} Frame.
 */
function frame([x, y], extra = {}) {
  return { x, y, end: true, ...extra };
}

/**
 * Compiles a step-code route into a track.
 *
 * @param {object[]} steps Parsed steps.
 * @param {object} grid Grid from grid.js.
 * @param {number[]} start [x, y] where the token starts.
 * @returns {object[]} Frames.
 */
function compileSteps(steps, grid, start) {
  const frames = [frame(start)];
  let pos = start;
  // Hex zigzags keep close to the line they started on until a sideways move.
  let ref = null;
  for (const step of steps) {
    if (frames.length > MAX_TRACK_FRAMES) {
      break;
    }
    if (step.type === 'wait') {
      for (let i = 0; i < step.count; i++) {
        frames.push(frame(pos, { wait: true }));
      }
    } else if (step.type === 'stealth') {
      frames.push(frame(pos, { stealth: true }));
    } else if (step.type === 'face') {
      const [dx, dy] = DIRECTIONS[step.dir];
      frames.push(frame(pos, { face: bearing(dx, dy) }));
    } else {
      if (directionZigzags(grid, step.dir)) {
        ref = ref ?? lateralCoordinate(grid, pos);
      } else {
        ref = null;
      }
      for (let i = 0; i < step.distance; i++) {
        pos = stepFrom(grid, pos, step.dir, ref);
        frames.push(frame(pos, { end: i === step.distance - 1 }));
      }
    }
  }
  return frames;
}

/**
 * Compiles a waypoint route into a track, splitting each leg into steps about
 * one cell long.
 *
 * @param {object[]} points Waypoints: { x, y }, { wait: n } or { stealth: true }.
 * @param {object} grid Grid from grid.js.
 * @param {number[]} offset [dx, dy] added to every point (the start for
 *        token-anchored routes, [0, 0] for page-anchored ones).
 * @returns {object[]} Frames.
 */
function compileWaypoints(points, grid, offset) {
  const pitch = cellPitch(grid);
  const frames = [];
  let pos = null;
  for (const point of points) {
    if (frames.length > MAX_TRACK_FRAMES) {
      break;
    }
    if (point.wait) {
      if (pos) {
        for (let i = 0; i < Math.min(point.wait, MAX_WAIT); i++) {
          frames.push(frame(pos, { wait: true }));
        }
      }
      continue;
    }
    if (point.stealth) {
      if (pos) {
        frames.push(frame(pos, { stealth: true }));
      }
      continue;
    }
    const target = [point.x + offset[0], point.y + offset[1]];
    if (!pos) {
      pos = target;
      frames.push(frame(pos));
      continue;
    }
    const length = Math.hypot(target[0] - pos[0], target[1] - pos[1]);
    if (length < POSITION_EPSILON) {
      continue;
    }
    const parts = Math.max(1, Math.round(length / pitch));
    for (let i = 1; i <= parts; i++) {
      const t = i / parts;
      frames.push(
        frame([pos[0] + (target[0] - pos[0]) * t, pos[1] + (target[1] - pos[1]) * t], {
          end: i === parts,
        })
      );
    }
    pos = target;
  }
  return frames;
}

/**
 * Compiles a route into a track.
 *
 * @param {object} route Route record (see state.js).
 * @param {object} grid Grid from grid.js.
 * @param {number[]} anchor [x, y] where the track starts (ignored for page-anchored routes).
 * @returns {object[]} Frames; empty when the route cannot be compiled.
 */
export function compileTrack(route, grid, anchor) {
  let frames;
  if (route.kind === ROUTE_KIND_CODE) {
    const parsed = parseCode(route.code);
    frames = parsed.ok ? compileSteps(parsed.steps, grid, anchor) : [];
  } else {
    const offset = route.anchor === ANCHOR_PAGE ? [0, 0] : anchor;
    frames = compileWaypoints(route.points || [], grid, offset);
  }
  return frames.slice(0, MAX_TRACK_FRAMES + 1);
}

/**
 * Returns the index of the next frame a patrol should move to.
 *
 * In segment movement, a patrol skips the frames inside a leg and stops only
 * at the end of each leg, wait or action.
 *
 * @param {object[]} frames Track.
 * @param {number} index Current frame index.
 * @param {number} dir 1 forwards, -1 backwards.
 * @param {string} mode Route mode: 'loop', 'pingpong' or 'once'.
 * @param {boolean} segment True for segment movement.
 * @returns {{index: number, dir: number, finished: boolean}} Next position.
 */
export function nextFrame(frames, index, dir, mode, segment) {
  const last = frames.length - 1;
  if (last <= 0) {
    return { index: 0, dir, finished: mode === 'once' };
  }
  // A closed loop's last frame is its first, so the wrap skips frame 0
  // rather than spending a tick standing still.
  const closed = trackIsClosed(frames);
  let i = index;
  let d = dir;
  for (let guard = 0; guard <= frames.length * 2; guard++) {
    if (d > 0 && i >= last) {
      if (mode === 'once') {
        return { index: last, dir: d, finished: true };
      }
      if (mode === 'loop') {
        i = 0;
        if (closed) {
          continue;
        }
      } else {
        d = -1;
        i -= 1;
      }
    } else if (d < 0 && i <= 0) {
      d = 1;
      i += 1;
    } else {
      i += d;
    }
    if (!segment || frames[i].end || i === 0 || i === last) {
      return { index: i, dir: d, finished: false };
    }
  }
  return { index: i, dir: d, finished: false };
}

/**
 * Returns true when a track's last frame is where it started, so looping does
 * not jump.
 *
 * @param {object[]} frames Track.
 * @returns {boolean} True when closed.
 */
export function trackIsClosed(frames) {
  if (frames.length < 2) {
    return true;
  }
  const first = frames[0];
  const last = frames.at(-1);
  return Math.hypot(first.x - last.x, first.y - last.y) < POSITION_EPSILON;
}

/**
 * Counts the frames that fall outside a page.
 *
 * @param {object[]} frames Track.
 * @param {number} widthPx Page width in pixels.
 * @param {number} heightPx Page height in pixels.
 * @returns {number} Number of frames off the page.
 */
export function framesOffPage(frames, widthPx, heightPx) {
  return frames.filter((f) => f.x < 0 || f.y < 0 || f.x > widthPx || f.y > heightPx).length;
}

/**
 * Returns the rotation for a token facing a bearing, given which way its art faces.
 *
 * @param {number} heading Bearing in degrees (0 = up the screen).
 * @param {string} facing Setting: 'up', 'down', 'left' or 'right' (the way the art faces).
 * @returns {number} Roll20 rotation in degrees.
 */
export function rotationFor(heading, facing) {
  const offsets = { up: 0, right: -90, down: 180, left: 90 };
  const rotation = heading + (offsets[facing] ?? 0);
  return Math.round(((rotation % 360) + 360) % 360);
}

/**
 * Converts recorded absolute positions into a route: a step code when every
 * move is a whole number of cells in one of the eight directions on a square
 * grid, otherwise token-relative waypoints.
 *
 * @param {object[]} entries Recorded entries: { x, y }, { wait: 1 } or { stealth: true }.
 *        The first entry must be the start position.
 * @param {object} grid Grid from grid.js.
 * @returns {{kind: 'code', code: string}|{kind: 'waypoints', points: object[]}|null}
 *          Route fields, or null when nothing was recorded.
 */
export function recordingToRoute(entries, grid) {
  const [start] = entries;
  if (!start || entries.length < 2) {
    return null;
  }
  const relative = entries.map((e) =>
    'x' in e ? { x: e.x - start.x, y: e.y - start.y } : { ...e }
  );

  if (grid.kind === 'square') {
    const steps = [];
    let prev = relative[0];
    let representable = true;
    for (const entry of relative.slice(1)) {
      if (entry.wait) {
        steps.push({ type: 'wait', count: 1 });
        continue;
      }
      if (entry.stealth) {
        steps.push({ type: 'stealth' });
        continue;
      }
      const cx = (entry.x - prev.x) / grid.unit;
      const cy = (entry.y - prev.y) / grid.unit;
      prev = entry;
      if (Math.abs(cx) < 0.01 && Math.abs(cy) < 0.01) {
        continue;
      }
      const rx = Math.round(cx);
      const ry = Math.round(cy);
      const straight = rx === 0 || ry === 0 || Math.abs(rx) === Math.abs(ry);
      if (Math.abs(cx - rx) > 0.01 || Math.abs(cy - ry) > 0.01 || !straight) {
        representable = false;
        break;
      }
      const dir = `${ry < 0 ? 'U' : ry > 0 ? 'D' : ''}${rx < 0 ? 'L' : rx > 0 ? 'R' : ''}`;
      const distance = Math.max(Math.abs(rx), Math.abs(ry));
      const previous = steps.at(-1);
      if (previous?.type === 'move' && previous.dir === dir) {
        previous.distance += distance;
      } else {
        steps.push({ type: 'move', dir, distance });
      }
    }
    if (representable && steps.length > 0) {
      return { kind: 'code', code: stepsToCode(steps) };
    }
  }

  return { kind: 'waypoints', points: relative };
}
