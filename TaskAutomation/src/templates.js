// Ready-made task definitions: the plan's montage fixture and the seven
// worked examples (plan §12.2, §12.4). `npm run examples` writes each one to
// examples/<id>.json so they can be imported into any game.

const base = (id, name, description) => ({
  schemaVersion: 1,
  id,
  revision: 1,
  name,
  description,
  enabled: true,
  parameters: {},
});

export const TEMPLATES = [
  {
    ...base(
      'montage',
      'Adventure montage',
      'Cycle selected multi-sided tokens ten times, eight seconds apart.'
    ),
    bindings: { tokens: { from: 'selected', objectType: 'graphic', max: 5 } },
    access: { mode: 'gmOnly', authority: 'initiator' },
    triggers: [{ id: 'manual', type: 'manual' }],
    policy: {
      concurrency: 'skipIfRunning',
      maxConcurrent: 1,
      onError: 'fail',
      overdue: { mode: 'skip', graceMs: 250 },
      restart: 'reconcile',
    },
    steps: [
      {
        id: 'frames',
        type: 'loop',
        mode: 'count',
        count: 10,
        steps: [
          {
            id: 'advance',
            type: 'token.advanceSide',
            target: { binding: 'tokens' },
            delta: 1,
            wrap: true,
          },
          { id: 'hold', type: 'wait', durationMs: 8000 },
        ],
      },
    ],
  },
  {
    ...base(
      'torch-reminder',
      'Torch reminder',
      'Warn the torchbearer after 50 real-world minutes and put the torch out 10 minutes later. Real minutes, not game time.'
    ),
    bindings: { torchbearer: { from: 'selected', objectType: 'graphic', max: 1 } },
    access: { mode: 'gmOnly', authority: 'initiator' },
    triggers: [{ id: 'manual', type: 'manual' }],
    policy: { concurrency: 'allow', maxConcurrent: 10, onError: 'fail', restart: 'reconcile' },
    steps: [
      { id: 'burn', type: 'wait', durationMs: 50 * 60 * 1000, overdue: 'review' },
      {
        id: 'warn',
        type: 'chat.send',
        mode: 'whisper',
        to: { gm: true, controllers: 'torchbearer' },
        text: "{{target.torchbearer.name}}'s torch is guttering: about 10 minutes of light left.",
      },
      { id: 'last-light', type: 'wait', durationMs: 10 * 60 * 1000, overdue: 'review' },
      {
        id: 'out',
        type: 'chat.send',
        mode: 'say',
        text: "{{target.torchbearer.name}}'s torch burns out.",
      },
    ],
  },
  {
    ...base(
      'hp-zero',
      'HP threshold',
      "When a token's bar 1 drops from above 0 to 0 or less, mark it dead and tell the GM."
    ),
    enabled: false,
    bindings: { token: { from: 'event', objectType: 'graphic', max: 1 } },
    access: { mode: 'gmOnly', authority: 'gmService' },
    triggers: [
      {
        id: 'bar-crossing',
        type: 'event',
        event: 'token.change',
        filter: {
          properties: ['bar1_value'],
          crossing: { property: 'bar1_value', direction: 'below', threshold: 0 },
        },
        bind: { binding: 'token' },
        cooldownMs: 1000,
      },
    ],
    policy: { concurrency: 'allow', maxConcurrent: 10, onError: 'skip' },
    steps: [
      { id: 'mark', type: 'marker.set', target: { binding: 'token' }, marker: 'dead', op: 'add' },
      {
        id: 'tell',
        type: 'chat.send',
        mode: 'whisper',
        to: { gm: true },
        text: '{{target.token.name}} has dropped to {{event.new.bar1_value}} HP.',
      },
    ],
  },
  {
    ...base(
      'turn-response',
      'Turn response',
      'When the current turn changes to a token, wait briefly for an optional ready signal, then ping it for the GM.'
    ),
    enabled: false,
    bindings: { token: { from: 'event', objectType: 'graphic', max: 1, min: 0 } },
    access: { mode: 'gmOnly', authority: 'gmService' },
    triggers: [{ id: 'turn', type: 'event', event: 'turn.change', bind: { binding: 'token' } }],
    policy: { concurrency: 'replace', maxConcurrent: 1, onError: 'skip' },
    steps: [
      {
        id: 'has-token',
        type: 'if',
        condition: { op: 'gt', left: { ref: 'target.token.count' }, right: 0 },
        then: [
          {
            id: 'ready',
            type: 'awaitEvent',
            event: 'signal',
            filter: { signal: 'turn-ready' },
            timeoutMs: 15000,
          },
          { id: 'ping', type: 'ping', target: { binding: 'token' }, to: { gm: true } },
          {
            id: 'notify',
            type: 'chat.send',
            mode: 'whisper',
            to: { gm: true },
            text: "It is {{target.token.name}}'s turn.",
          },
        ],
        else: [
          {
            id: 'notify-custom',
            type: 'chat.send',
            mode: 'whisper',
            to: { gm: true },
            text: 'Turn: {{event.name}}',
          },
        ],
      },
    ],
  },
  {
    ...base(
      'scene-cleanup',
      'Scene cleanup',
      'Stop a jukebox track and announce the scene is over. Called by Parallel scene.'
    ),
    parameters: { track: { type: 'string', required: true, maxLength: 100 } },
    bindings: {},
    access: { mode: 'gmOnly', authority: 'initiator' },
    triggers: [{ id: 'manual', type: 'manual' }],
    policy: { concurrency: 'allow', maxConcurrent: 5, onError: 'skip' },
    steps: [
      { id: 'silence', type: 'audio.control', track: '{{param.track}}', op: 'stop' },
      { id: 'done', type: 'chat.send', mode: 'desc', text: 'The scene falls quiet.' },
    ],
  },
  {
    ...base(
      'parallel-scene',
      'Parallel scene',
      'Fade the "Ambience" jukebox track in steps while a door token changes after a wait; when both finish, chain Scene cleanup.'
    ),
    parameters: { track: { type: 'string', default: 'Ambience', maxLength: 100 } },
    bindings: { door: { from: 'selected', objectType: 'graphic', max: 1 } },
    access: { mode: 'gmOnly', authority: 'initiator' },
    triggers: [{ id: 'manual', type: 'manual' }],
    policy: {
      concurrency: 'skipIfRunning',
      maxConcurrent: 1,
      onError: 'fail',
      restart: 'reconcile',
    },
    steps: [
      {
        id: 'scene',
        type: 'parallel',
        join: 'all',
        branches: [
          {
            id: 'music',
            steps: [
              {
                id: 'fade',
                type: 'loop',
                mode: 'count',
                count: 5,
                steps: [
                  {
                    id: 'volume',
                    type: 'audio.control',
                    track: '{{param.track}}',
                    op: 'volume',
                    volume: {
                      op: 'sub',
                      left: 60,
                      right: { op: 'mul', left: { ref: 'run.iteration' }, right: 10 },
                    },
                    onError: 'skip',
                  },
                  { id: 'fade-step', type: 'wait', durationMs: 1000 },
                ],
              },
            ],
          },
          {
            id: 'door',
            steps: [
              { id: 'door-wait', type: 'wait', durationMs: 3000 },
              {
                id: 'door-open',
                type: 'token.advanceSide',
                target: { binding: 'door' },
                delta: 1,
                wrap: true,
              },
            ],
          },
        ],
      },
      {
        id: 'cleanup',
        type: 'call',
        definition: 'scene-cleanup',
        await: true,
        params: { track: { ref: 'param.track' } },
      },
    ],
  },
  {
    ...base(
      'session-reminder',
      'Session reminder',
      'Every Friday at 19:00 (UTC+00:00) remind the table that the session starts soon. Update the offset when the clocks change.'
    ),
    enabled: false,
    bindings: {},
    access: { mode: 'gmOnly', authority: 'gmService' },
    triggers: [
      {
        id: 'weekly',
        type: 'weekly',
        days: ['fri'],
        time: '19:00',
        offset: '+00:00',
        overdue: { mode: 'runOnce', windowMs: 15 * 60 * 1000, maxAgeMs: 2 * 60 * 60 * 1000 },
      },
    ],
    policy: {
      concurrency: 'skipIfRunning',
      maxConcurrent: 1,
      onError: 'skip',
      lifetimeMs: 60 * 60 * 1000,
    },
    steps: [
      {
        id: 'remind',
        type: 'chat.send',
        mode: 'say',
        text: 'Session starts in 15 minutes. Grab your dice!',
      },
    ],
  },
  {
    ...base(
      'token-mod-command',
      'Other-Mod command',
      'Send an approved TokenMod command for the selected token, by ID. Shown as dispatched, not confirmed.'
    ),
    bindings: { token: { from: 'selected', objectType: 'graphic', max: 1 } },
    access: { mode: 'gmOnly', authority: 'initiator' },
    triggers: [{ id: 'manual', type: 'manual' }],
    policy: { concurrency: 'allow', maxConcurrent: 5, onError: 'fail' },
    steps: [
      {
        id: 'mark-blue',
        type: 'integration.command',
        command: '!token-mod --ids {{args.token}} --set statusmarkers|+blue',
        args: { token: { ref: 'target.token.id' } },
      },
    ],
  },
  {
    ...base(
      'door-sequence',
      'Door sequence',
      'Announce a door, wait up to a minute for the door-open signal, then open it or report that it stayed shut.'
    ),
    bindings: { door: { from: 'selected', objectType: 'graphic', max: 1 } },
    access: { mode: 'gmOnly', authority: 'initiator' },
    triggers: [{ id: 'manual', type: 'manual' }],
    policy: {
      concurrency: 'skipIfRunning',
      maxConcurrent: 1,
      onError: 'fail',
      restart: 'reconcile',
    },
    steps: [
      {
        id: 'announce',
        type: 'chat.send',
        mode: 'say',
        text: 'The heavy door groans. Someone must pull the lever...',
      },
      {
        id: 'lever',
        type: 'awaitEvent',
        event: 'signal',
        filter: { signal: 'door-open' },
        timeoutMs: 60000,
        saveAs: 'lever',
      },
      {
        id: 'opened',
        type: 'if',
        condition: { ref: 'var.lever.matched' },
        then: [
          {
            id: 'swing',
            type: 'token.advanceSide',
            target: { binding: 'door' },
            delta: 1,
            wrap: false,
          },
          { id: 'open-msg', type: 'chat.send', mode: 'say', text: 'The door swings open.' },
        ],
        else: [{ id: 'shut-msg', type: 'chat.send', mode: 'say', text: 'The door stays shut.' }],
      },
    ],
  },
];

// Templates that need another template installed first.
export const TEMPLATE_DEPENDENCIES = { 'parallel-scene': ['scene-cleanup'] };

/**
 * Returns a template by ID.
 *
 * @param {string} id Template ID.
 * @returns {object|null} Template definition.
 */
export function getTemplate(id) {
  return TEMPLATES.find((tpl) => tpl.id === id) || null;
}
