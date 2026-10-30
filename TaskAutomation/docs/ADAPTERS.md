# Adapters: Using TaskAutomation from Other Mods

TaskAutomation publishes `globalThis.TaskAutomation` when the sandbox is ready. Everything in the same sandbox can call it: this is a convenience between installed Mods, not a security boundary against a malicious script.

## API

| Member                                    | Meaning                                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `version`                                 | `'1.0.0'`.                                                                                                    |
| `contract`                                | Adapter contract version, `1`.                                                                                |
| `registerAdapter(spec)`                   | Registers (or replaces) an adapter. Returns `{ok, error}`.                                                    |
| `registerAction(adapter, action, impl)`   | Adds one action to an adapter.                                                                                |
| `registerTrigger(adapter, event)`         | Declares an event name the adapter raises.                                                                    |
| `emit(adapter, event, value)`             | Raises an `integration` event (`filter.adapter`, `filter.names`).                                             |
| `signal(name, value)`                     | Raises a `signal` event. It has no player behind it, so it never has GM rights and cannot start player tasks. |
| `start(definitionId, {params, bindings})` | Starts a task whose `access.authority` is `gmService`. Returns the run ID or `null`.                          |

## Load order

If your Mod may load first, queue the spec instead of calling the API:

```js
on('ready', () => {
  const spec = {/* … */};
  if (globalThis.TaskAutomation) {
    TaskAutomation.registerAdapter(spec);
  } else {
    (globalThis.TaskAutomationQueue = globalThis.TaskAutomationQueue || []).push(spec);
  }
});
```

TaskAutomation drains `TaskAutomationQueue` on ready. Registering again with the same name replaces the adapter. When an adapter registers late, runs that stopped because it was missing stay in review and the GM is told they can be retried.

## Adapter spec

```js
TaskAutomation.registerAdapter({
  name: 'weather', // letters, digits, - and _
  contract: 1,
  version: '2.1.0',
  description: 'Weather control',
  authority: 'gm', // 'gm' (default): only GM-authority runs may call it; 'any': player runs too
  actions: {
    setWeather: {
      replay: 'acknowledged', // pure | idempotent | nonIdempotent | acknowledged | ephemeral
      timeoutMs: 5000,
      invoke(input, ctx, done) {
        // input: plain JSON from the step's `input` expressions
        // ctx: { idempotencyKey, runId, opId }
        applyWeather(input.kind, (err) => done(err || null, { kind: input.kind }));
      },
      status(idempotencyKey) {
        // Optional: { done: true, result } if this call already happened, else null.
        return lookup(idempotencyKey);
      },
    },
  },
});
```

A task calls it with:

```json
{
  "id": "rain",
  "type": "integration.call",
  "adapter": "weather",
  "action": "setWeather",
  "input": { "kind": "rain" },
  "saveAs": "weather"
}
```

### Rules

- Call `done(err, result)` once. Later calls are ignored, as are calls after the run was cancelled, paused-and-superseded, timed out or after an API restart (each call is bound to a boot, an operation ID and a generation).
- `result` should be small plain JSON (it is stored, up to 500 characters).
- An error with `err.uncertain = true` means "it may have happened": the run goes to review.
- If `done` is not called within `timeoutMs` (default 30 s), TaskAutomation asks `status(idempotencyKey)`. If that confirms the call, the run continues; otherwise it goes to review. A timeout is _unknown outcome_, not failure.
- The `idempotencyKey` is stable for a step attempt across restarts, so a receiving Mod can refuse duplicates and answer status lookups.
- Adapter callbacks must not use their own long-lived timers for TaskAutomation's sake; if you need a delay, do it in your Mod as usual. TaskAutomation's own delays all use its single scheduler.

## Reference adapter

`reference` is built in for tests and examples:

| Action        | Behaviour                                                                               |
| ------------- | --------------------------------------------------------------------------------------- |
| `echo`        | Answers at once with `{echo: input}`.                                                   |
| `delayedEcho` | Answers after `input.delayMs` (100–9,000 ms) with `{echo: input}`. Has a status lookup. |
| `silent`      | Never answers, to show timeouts and review.                                             |

## Commands instead of adapters

`integration.command` sends a literal `!command` written in the task (GM-only). Values can only be inserted as plain tokens (`{{args.name}}`: letters, digits, `_-.:#@+`). The command comes from the API: Mods that check `playerIsGM` or need a selection will not act on it, and TaskAutomation cannot see whether they did. Prefer an adapter where you control the other Mod.
