// A binary min-heap of scheduler jobs ordered by (dueAt, priority, sequence).
// Pure: no Roll20 globals.

/**
 * Returns true when job a must run before job b. Time always wins; priority
 * only orders equal deadlines; sequence keeps insertion order stable.
 *
 * @param {{dueAt: number, priority: number, sequence: number}} a Job.
 * @param {{dueAt: number, priority: number, sequence: number}} b Job.
 * @returns {boolean} True when a comes first.
 */
export function jobBefore(a, b) {
  if (a.dueAt !== b.dueAt) {
    return a.dueAt < b.dueAt;
  }
  if (a.priority !== b.priority) {
    return a.priority < b.priority;
  }
  return a.sequence < b.sequence;
}

/**
 * Creates an empty heap.
 *
 * @returns {{items: object[]}} Heap.
 */
export function createHeap() {
  return { items: [] };
}

/**
 * Inserts a job. O(log n).
 *
 * @param {{items: object[]}} heap Heap.
 * @param {object} job Job.
 * @returns {void}
 */
export function heapPush(heap, job) {
  const items = heap.items;
  items.push(job);
  let i = items.length - 1;
  while (i > 0) {
    const parent = (i - 1) >> 1;
    if (!jobBefore(items[i], items[parent])) {
      break;
    }
    [items[i], items[parent]] = [items[parent], items[i]];
    i = parent;
  }
}

/**
 * Returns the first job without removing it. O(1).
 *
 * @param {{items: object[]}} heap Heap.
 * @returns {object|undefined} Head job.
 */
export function heapPeek(heap) {
  return heap.items[0];
}

/**
 * Removes and returns the first job. O(log n).
 *
 * @param {{items: object[]}} heap Heap.
 * @returns {object|undefined} Head job.
 */
export function heapPop(heap) {
  const items = heap.items;
  if (items.length === 0) {
    return undefined;
  }
  const head = items[0];
  const last = items.pop();
  if (items.length > 0) {
    items[0] = last;
    siftDown(items, 0);
  }
  return head;
}

/**
 * Rebuilds the heap from the given jobs. O(n).
 *
 * @param {{items: object[]}} heap Heap.
 * @param {object[]} jobs Jobs to keep.
 * @returns {void}
 */
export function heapRebuild(heap, jobs) {
  heap.items = [...jobs];
  for (let i = (heap.items.length >> 1) - 1; i >= 0; i -= 1) {
    siftDown(heap.items, i);
  }
}

/**
 * Moves an item down until both children come after it.
 *
 * @param {object[]} items Heap array.
 * @param {number} start Index.
 * @returns {void}
 */
function siftDown(items, start) {
  let i = start;
  for (;;) {
    const left = 2 * i + 1;
    const right = left + 1;
    let first = i;
    if (left < items.length && jobBefore(items[left], items[first])) {
      first = left;
    }
    if (right < items.length && jobBefore(items[right], items[first])) {
      first = right;
    }
    if (first === i) {
      return;
    }
    [items[i], items[first]] = [items[first], items[i]];
    i = first;
  }
}
