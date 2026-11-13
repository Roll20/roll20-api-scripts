// Repair: bring a group's copies back in step with the source page. Finds
// copies that drifted (changed by another Mod, or while the sandbox was
// down), copies that are missing, links whose objects have all gone, and
// objects made while SyncPage was not watching.

import { HIDDEN_LAYER } from './constants.js';
import { applyProps, createCopy, drift, readProps, withoutLocal } from './copy.js';
import { dropLink, prune, setLinkObject } from './groups.js';
import { handleLeftovers, referenceOf, unlinkedOn } from './pair.js';
import { getSetting } from './state.js';
import { copyPageSettings, layerExcluded, mirrorNew, removeCopies } from './sync.js';
import { sameValue } from './utils.js';

/**
 * @typedef {object} RepairCounts
 * @property {number} drifted Copies whose properties differed.
 * @property {number} recreated Missing copies made again.
 * @property {number} removed Copies removed because their source object went.
 * @property {number} dropped Links with no objects left.
 * @property {number} mirrored New objects copied to the other pages.
 * @property {number} leftovers New objects on copies, handled by pairLeftovers.
 * @property {number} pageSettings Pages whose settings differed.
 */

/**
 * Repairs one group.
 *
 * @param {object} group Group.
 * @param {object} [options] Options.
 * @param {boolean} [options.dryRun=false] Count without changing anything.
 * @param {string} [options.gm] GM to ask about leftovers.
 * @returns {RepairCounts} Counts.
 */
export function repairGroup(group, { dryRun = false, gm } = {}) {
  const counts = {
    drifted: 0,
    recreated: 0,
    removed: 0,
    dropped: 0,
    mirrored: 0,
    leftovers: 0,
    pageSettings: 0,
  };
  const spreadSourceDeletes = ['all', 'source'].includes(getSetting('deleteMode', group));

  for (const [linkId, link] of Object.entries({ ...group.links })) {
    const sourceId = link.objects[group.source];
    const sourceGone = !!sourceId && !getObj(link.type, sourceId);
    if (sourceGone && spreadSourceDeletes) {
      // Deleted on the source page while SyncPage was not watching.
      counts.removed += Object.values(link.objects).filter(
        (id) => id !== sourceId && getObj(link.type, id)
      ).length;
      if (!dryRun) {
        removeCopies(group, linkId, sourceId, 'repair');
        dropLink(group, linkId);
      }
      continue;
    }
    const base = referenceOf(group, link);
    if (!base) {
      counts.dropped += 1;
      if (!dryRun) {
        dropLink(group, linkId);
      }
      continue;
    }
    const refPage = base.get('_pageid');
    const want = withoutLocal(readProps(base), group);
    for (const p of group.pages) {
      if (p === refPage || !getObj('page', p)) {
        continue;
      }
      const h = group.hidden[linkId]?.[p];
      if (h?.snapshot) {
        const differs = Object.entries(want).some(
          ([k, v]) => k !== 'layer' && !sameValue(h.snapshot.props[k], v)
        );
        if (differs) {
          counts.drifted += 1;
          if (!dryRun) {
            Object.assign(h.snapshot.props, { ...want, layer: h.snapshot.props.layer });
            h.layer = want.layer;
          }
        }
        continue;
      }
      const target = h ? { ...want, layer: HIDDEN_LAYER } : want;
      const objId = link.objects[p];
      const obj = objId ? getObj(link.type, objId) : null;
      if (!obj) {
        if (layerExcluded(group, want.layer)) {
          continue;
        }
        counts.recreated += 1;
        if (!dryRun) {
          const { obj: copy } = createCopy(
            link.type,
            { ...readProps(base), layer: target.layer },
            p
          );
          if (copy) {
            setLinkObject(group, linkId, p, copy.id);
          }
        }
        continue;
      }
      if (h) {
        h.layer = want.layer;
      }
      const diff = drift(link.type, target, readProps(obj), group);
      if (Object.keys(diff).length) {
        counts.drifted += 1;
        if (!dryRun) {
          applyProps(obj, diff);
        }
      }
    }
  }

  // Objects made while SyncPage was not watching (sandbox down, paused).
  for (const p of group.pages) {
    const fresh = unlinkedOn(group, p);
    if (!fresh.length) {
      continue;
    }
    if (
      p === group.source ||
      (getSetting('newObjects', group) === 'mirror' &&
        getSetting('pairLeftovers', group) === 'copy')
    ) {
      counts.mirrored += fresh.length;
      if (!dryRun) {
        fresh.forEach((o) => mirrorNew(group, o));
      }
    } else {
      counts.leftovers += fresh.length;
      if (!dryRun) {
        handleLeftovers(group, p, fresh, gm);
      }
    }
  }

  counts.pageSettings = copyPageSettings(group, { dryRun });
  if (!dryRun) {
    // Last, so missing objects were seen above before their entries are dropped.
    prune();
    group.repairLog = { at: Date.now(), ...counts };
  }
  return counts;
}

/**
 * Returns the total of the changes in a repair.
 *
 * @param {RepairCounts} counts Counts.
 * @returns {number} Total.
 */
export function repairTotal(counts) {
  return (
    counts.drifted +
    counts.recreated +
    counts.removed +
    counts.dropped +
    counts.mirrored +
    counts.leftovers +
    counts.pageSettings
  );
}
