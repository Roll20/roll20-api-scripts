import { SILENT_MANAGEMENT_FLAGS } from "./constants.js";
import { spawnPointFx, spawnTravelFx } from "./effects.js";
import { getSafeTokenName, whisperSender, whisperSenderError } from "./messages.js";

/**
 * Validates selection and resolves the two tokens targeted for swapping.
 *
 * @param {object} msg Roll20 chat message object.
 * @returns {Array<object>|null} Two graphic token objects or null when invalid.
 */
export function getSelectedTokens(msg) {
  const selectedCount = (msg.selected || []).length;

  if (selectedCount !== 2) {
    const isSilent = SILENT_MANAGEMENT_FLAGS.some((flag) => flag.test(msg.content));
    if (!isSilent) {
      whisperSenderError(
        msg,
        `Please select exactly two tokens to perform a swap. (Currently selected: ${selectedCount})`,
        "Selection Error",
      );
    }
    return null;
  }

  const token1 = getObj("graphic", msg.selected[0]._id);
  const token2 = getObj("graphic", msg.selected[1]._id);

  if (!token1 || !token2) {
    whisperSenderError(msg, "One or both selected tokens could not be found.");
    return null;
  }

  if (token1.get("pageid") !== token2.get("pageid")) {
    whisperSenderError(
      msg,
      "Please select two tokens on the same page to perform a swap.",
      "Selection Error",
    );
    return null;
  }

  return [token1, token2];
}

/**
 * Confirms both tokens reached their intended destination coordinates.
 *
 * @param {object} token1 First token object.
 * @param {object} token2 Second token object.
 * @param {{left:number, top:number}} pos1 Original position for token1.
 * @param {{left:number, top:number}} pos2 Original position for token2.
 * @returns {boolean} True when both tokens match expected post-swap coordinates.
 */
function hasVerifiedSwapPosition(token1, token2, pos1, pos2) {
  return (
    token1.get("left") === pos2.left &&
    token1.get("top") === pos2.top &&
    token2.get("left") === pos1.left &&
    token2.get("top") === pos1.top
  );
}

/**
 * Resolves the current live token objects from stored ids.
 *
 * @param {string} token1Id First token id.
 * @param {string} token2Id Second token id.
 * @returns {{token1:object, token2:object}|null} Live tokens or null when missing.
 */
function getLiveTokenPair(token1Id, token2Id) {
  const token1 = getObj("graphic", token1Id);
  const token2 = getObj("graphic", token2Id);
  if (!token1 || !token2) {
    return null;
  }
  return { token1, token2 };
}

/**
 * Resolves live tokens and handles missing-token failures consistently.
 *
 * @param {{token1Id:string, token2Id:string, msg:object}} context Token ids and message context.
 * @param {(tokens:{token1:object, token2:object})=>void} callback Work to execute when tokens are live.
 * @returns {boolean} True when callback ran; false when tokens were missing.
 */
function withLiveTokens(context, callback) {
  const livePair = getLiveTokenPair(context.token1Id, context.token2Id);
  if (!livePair) {
    whisperSenderError(
      context.msg,
      "Swap cancelled because one or both tokens are no longer available.",
      "Swap Cancelled",
    );
    return false;
  }
  callback(livePair);
  return true;
}

/**
 * Spawns destination FX at both destination points after an optional delay.
 *
 * @param {{left:number, top:number, page:string}} pos1 Original position for token1.
 * @param {{left:number, top:number, page:string}} pos2 Original position for token2.
 * @param {string} destinationFx FX to spawn at destination points.
 * @param {number} delayMs Delay in milliseconds before spawning FX.
 * @returns {void}
 */
function scheduleDestinationFx(pos1, pos2, destinationFx, delayMs) {
  const spawn = () => {
    spawnPointFx(pos2.left, pos2.top, destinationFx, pos2.page);
    spawnPointFx(pos1.left, pos1.top, destinationFx, pos1.page);
  };

  if (delayMs > 0) {
    setTimeout(spawn, delayMs);
    return;
  }

  spawn();
}

/**
 * Keeps travel FX visible for the configured travel duration.
 *
 * Roll20's spawnFxBetweenPoints API does not expose a duration argument for
 * built-in beam FX, so persistence is achieved by re-spawning bursts across
 * the travel window.
 *
 * @param {{left:number, top:number, page:string}} pos1 Start position.
 * @param {{left:number, top:number, page:string}} pos2 End position.
 * @param {string} travelFx Travel FX type.
 * @param {number} durationMs Duration in milliseconds.
 * @param {Function} onComplete Callback when the FX window completes.
 * @returns {void}
 */
function sustainTravelFx(pos1, pos2, travelFx, durationMs, onComplete) {
  if (travelFx === "none") {
    onComplete();
    return;
  }

  if (durationMs <= 0) {
    spawnTravelFx(pos1, pos2, travelFx);
    onComplete();
    return;
  }

  const pulseMs = 350;
  const startedAt = Date.now();

  const pulse = () => {
    spawnTravelFx(pos1, pos2, travelFx);
    if (Date.now() - startedAt >= durationMs) {
      onComplete();
      return;
    }
    setTimeout(pulse, pulseMs);
  };

  pulse();
}

/**
 * Animates both tokens toward their destination over the configured travel duration.
 *
 * @param {object} token1 First token object.
 * @param {object} token2 Second token object.
 * @param {{left:number, top:number}} pos1 Original position for token1.
 * @param {{left:number, top:number}} pos2 Original position for token2.
 * @param {number} durationMs Travel animation duration in milliseconds.
 * @param {object} msg Roll20 chat message object.
 * @param {Function} onComplete Callback after animation reaches the destination.
 * @returns {void}
 */
function animateTravel(token1, token2, pos1, pos2, durationMs, msg, onComplete) {
  if (durationMs <= 0) {
    onComplete();
    return;
  }

  const token1Id = token1.get("_id");
  const token2Id = token2.get("_id");
  // Roll20 can coalesce very frequent token updates. Use paced, fixed steps so
  // travel visibly spans the configured duration.
  const maxTickMs = 120;
  const stepCount = Math.max(1, Math.ceil(durationMs / maxTickMs));
  const stepIntervalMs = durationMs / stepCount;
  let stepIndex = 0;

  const step = () => {
    stepIndex += 1;
    const progress = Math.min(stepIndex / stepCount, 1);

    const nextToken1Left = pos1.left + (pos2.left - pos1.left) * progress;
    const nextToken1Top = pos1.top + (pos2.top - pos1.top) * progress;
    const nextToken2Left = pos2.left + (pos1.left - pos2.left) * progress;
    const nextToken2Top = pos2.top + (pos1.top - pos2.top) * progress;

    if (
      !withLiveTokens({ token1Id, token2Id, msg }, ({ token1: liveToken1, token2: liveToken2 }) => {
        liveToken1.set({ left: nextToken1Left, top: nextToken1Top });
        liveToken2.set({ left: nextToken2Left, top: nextToken2Top });
      })
    ) {
      return;
    }

    if (progress >= 1) {
      onComplete();
      return;
    }

    setTimeout(step, stepIntervalMs);
  };

  setTimeout(step, stepIntervalMs);
}

/**
 * Swaps token coordinates, verifies the result, and runs a completion callback.
 *
 * @param {object} token1 First token object.
 * @param {object} token2 Second token object.
 * @param {{left:number, top:number, page:string}} pos1 Original position for token1.
 * @param {{left:number, top:number, page:string}} pos2 Original position for token2.
 * @param {object} msg Roll20 chat message object.
 * @param {Function} [onVerified] Optional callback executed after verification.
 * @param {Function} [onFailed] Optional callback executed when verification fails.
 * @returns {void}
 */
export function performSwap(
  token1,
  token2,
  pos1,
  pos2,
  msg,
  onVerified,
  onFailed,
) {
  const token1Id = token1.get("_id");
  const token2Id = token2.get("_id");

  if (!withLiveTokens({ token1Id, token2Id, msg }, ({ token1: liveToken1, token2: liveToken2 }) => {
    liveToken1.set({ left: pos2.left, top: pos2.top });
    liveToken2.set({ left: pos1.left, top: pos1.top });
  })) {
    return;
  }

  const maxVerificationAttempts = 8;
  const verificationRetryMs = 50;
  let attempt = 0;

  const verifyThenFinalize = () => {
    const livePair = getLiveTokenPair(token1Id, token2Id);
    if (!livePair) {
      whisperSenderError(
        msg,
        "Swap cancelled because one or both tokens are no longer available.",
        "Swap Cancelled",
      );
      if (typeof onFailed === "function") {
        onFailed();
      }
      return;
    }

    if (hasVerifiedSwapPosition(livePair.token1, livePair.token2, pos1, pos2)) {
      const token1Name = getSafeTokenName(livePair.token1, "Token 1");
      const token2Name = getSafeTokenName(livePair.token2, "Token 2");
      whisperSender(
        msg,
        `<strong>Swap Successful!</strong><br>${token1Name} ↔ ${token2Name}`,
        "Success",
      );
      if (typeof onVerified === "function") {
        onVerified();
      }
      return;
    }

    attempt += 1;
    if (attempt >= maxVerificationAttempts) {
      whisperSenderError(msg, "Token swap failed verification.");
      if (typeof onFailed === "function") {
        onFailed();
      }
      return;
    }

    setTimeout(verifyThenFinalize, verificationRetryMs);
  };

  verifyThenFinalize();
}

function runNormalTravelPhase(context) {
  const {
    token1,
    token2,
    pos1,
    pos2,
    travelFx,
    destinationFx,
    msg,
    msTravelTime,
    msSwapDelay,
    msBeforeDestinationFx,
  } = context;

  const runSwap = () => {
    performSwap(token1, token2, pos1, pos2, msg, () => {
      scheduleDestinationFx(pos1, pos2, destinationFx, msBeforeDestinationFx);
    });
  };

  let completedTracks = 0;
  const finishTravelPhase = () => {
    completedTracks += 1;
    if (completedTracks < 2) {
      return;
    }
    if (msSwapDelay > 0) {
      setTimeout(runSwap, msSwapDelay);
    } else {
      runSwap();
    }
  };

  animateTravel(token1, token2, pos1, pos2, msTravelTime, msg, finishTravelPhase);
  sustainTravelFx(pos1, pos2, travelFx, msTravelTime, finishTravelPhase);
}

function runInvisibleTravelPhase(context) {
  const {
    token1,
    token2,
    pos1,
    pos2,
    travelFx,
    destinationFx,
    msg,
    msTravelTime,
    msSwapDelay,
    msBeforeDestinationFx,
  } = context;
  const hideRenderBufferMs = 80;
  const revealRenderBufferMs = 120;
  const token1Id = token1.get("_id");
  const token2Id = token2.get("_id");

  const layer1 = token1.get("layer");
  const layer2 = token2.get("layer");

  const revealThenFx = () => {
    withLiveTokens({ token1Id, token2Id, msg }, ({ token1: liveToken1, token2: liveToken2 }) => {
      // Restore layer — tokens appear at their new positions with no render artifact.
      liveToken1.set({ layer: layer1 });
      liveToken2.set({ layer: layer2 });
      setTimeout(() => scheduleDestinationFx(pos1, pos2, destinationFx, 0), revealRenderBufferMs);
    });
  };

  const doMove = () => {
    withLiveTokens({ token1Id, token2Id, msg }, ({ token1: liveToken1, token2: liveToken2 }) => {
      // Tokens are on the GM layer so the position change is invisible to players.
      liveToken1.set({ left: pos2.left, top: pos2.top });
      liveToken2.set({ left: pos1.left, top: pos1.top });

      const token1Name = getSafeTokenName(liveToken1, "Token 1");
      const token2Name = getSafeTokenName(liveToken2, "Token 2");
      whisperSender(
        msg,
        `<strong>Swap Successful!</strong><br>${token1Name} ↔ ${token2Name}`,
        "Success",
      );

      if (msBeforeDestinationFx > 0) {
        setTimeout(revealThenFx, msBeforeDestinationFx);
      } else {
        revealThenFx();
      }
    });
  };

  // Moving to gmlayer removes tokens from the player canvas instantly — no
  // position-change flash, unlike baseOpacity which Roll20 ignores on move renders.
  if (
    !withLiveTokens({ token1Id, token2Id, msg }, ({ token1: liveToken1, token2: liveToken2 }) => {
      liveToken1.set({ layer: "gmlayer" });
      liveToken2.set({ layer: "gmlayer" });
    })
  ) {
    return;
  }

  setTimeout(() => {
    sustainTravelFx(pos1, pos2, travelFx, msTravelTime, () => {});

    const msBeforeHiddenSwap = msTravelTime + msSwapDelay;
    if (msBeforeHiddenSwap > 0) {
      setTimeout(doMove, msBeforeHiddenSwap);
      return;
    }
    doMove();
  });
}

/**
 * Executes staged FX before performing the final swap.
 *
 * @param {object} config Effective swap configuration.
 * @param {object} token1 First token object.
 * @param {object} token2 Second token object.
 * @param {{left:number, top:number, page:string}} pos1 Original position for token1.
 * @param {{left:number, top:number, page:string}} pos2 Original position for token2.
 * @param {object} msg Roll20 chat message object.
 * @returns {void}
 */
export function executeSwapPipeline(config, token1, token2, pos1, pos2, msg) {
  const {
    originFx,
    travelFx,
    travelMode,
    destinationFx,
    originTime,
    travelTime,
    swapDelay,
    destinationDelay,
    destinationTime,
  } = config;

  const msBeforeTravel = originTime * 1000;
  const msTravelTime = travelTime * 1000;
  const msSwapDelay = swapDelay * 1000;
  const msBeforeDestinationFx = (destinationDelay + destinationTime) * 1000;
  const useInvisibleTravel = travelMode === "invisible";

  spawnPointFx(pos1.left, pos1.top, originFx, pos1.page);
  spawnPointFx(pos2.left, pos2.top, originFx, pos2.page);

  setTimeout(() => {
    if (useInvisibleTravel) {
      runInvisibleTravelPhase({
        token1,
        token2,
        pos1,
        pos2,
        travelFx,
        destinationFx,
        msg,
        msTravelTime,
        msSwapDelay,
        msBeforeDestinationFx,
      });
      return;
    }

    runNormalTravelPhase({
      token1,
      token2,
      pos1,
      pos2,
      travelFx,
      destinationFx,
      msg,
      msTravelTime,
      msSwapDelay,
      msBeforeDestinationFx,
    });
  }, msBeforeTravel);
}
