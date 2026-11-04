// Other Mods that keep page coordinates of their own (patrol routes, homes,
// areas) can follow a zoom: Resizer.onZoom((pageId, factor) => { … }).

const listeners = [];

/**
 * Adds a zoom listener.
 *
 * @param {(pageId: string, factor: number) => void} fn Listener.
 * @returns {() => void} Function that removes the listener.
 */
export function onZoom(fn) {
  if (typeof fn !== 'function') {
    return () => {};
  }
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) {
      listeners.splice(i, 1);
    }
  };
}

/**
 * Tells the listeners a page was zoomed. A failing listener is logged and the
 * others still run.
 *
 * @param {string} pageId Page ID.
 * @param {number} factor Zoom factor (below 1 for zoom out and for undoing a zoom in).
 * @returns {void}
 */
export function notifyZoom(pageId, factor) {
  for (const fn of [...listeners]) {
    try {
      fn(pageId, factor);
    } catch (err) {
      log(`Resizer: a zoom listener failed: ${err?.message || err}`);
    }
  }
}
