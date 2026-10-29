// Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
export const SCRIPT_NAME = '__SCRIPT_NAME__';
export const SCRIPT_VERSION = '__BUILD_VERSION__';
export const SCRIPT_LAST_UPDATED = '__BUILD_DATE__';

export const DEFAULT_LOCALE = 'en-US';

export const STATE_KEY = 'TaskAutomation';
// Persistent state layout version. Definitions carry their own schemaVersion.
export const SCHEMA_VERSION = 1;
export const DEFINITION_SCHEMA_VERSION = 1;
export const COMMAND = '!taskautomation';

export const HANDOUT_DASHBOARD_NAME = 'TaskAutomation - Dashboard';
export const HANDOUT_HELP_NAME = 'TaskAutomation - Help';
export const HANDOUT_PLAYER_NAME = 'TaskAutomation - Player View';
export const HANDOUT_EXPORT_NAME = 'TaskAutomation - Export';

export const AUTHOR_LINKS = {
  maintainer: {
    name: 'MidNiteShadow7',
    profile: 'https://app.roll20.net/users/16506286/midniteshadow7',
    github: 'https://github.com/steverobertsuk',
  },
};

// Instance states (plan §4).
export const STATUS = Object.freeze({
  QUEUED: 'queued',
  RUNNING: 'running',
  WAITING: 'waiting',
  PAUSED: 'paused',
  REVIEW: 'review',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
});
export const TERMINAL_STATUSES = new Set(['completed', 'failed', 'cancelled', 'expired']);
export const ACTIVE_STATUSES = new Set(['queued', 'running', 'waiting', 'paused', 'review']);

// Typed error codes shared by commands, run journals and the dashboard (plan §10).
export const ERROR_CODES = Object.freeze({
  VALIDATION: 'validation',
  UNAUTHORIZED: 'unauthorized',
  MISSING_TARGET: 'missingTarget',
  UNAVAILABLE: 'unavailable',
  CONFLICT: 'conflict',
  TIMEOUT: 'timeout',
  UNCERTAIN: 'uncertain',
  RESOURCE_LIMIT: 'resourceLimit',
  RUNAWAY: 'runaway',
  STALE: 'stale',
  INTERNAL: 'internal',
});

// Replay classes for actions (plan §8.1). `ephemeral` is a non-idempotent
// visual effect (ping, spawned effect) whose uncertain outcome is skipped
// rather than replayed or reviewed.
export const REPLAY = Object.freeze({
  PURE: 'pure',
  IDEMPOTENT: 'idempotent',
  NON_IDEMPOTENT: 'nonIdempotent',
  ACKNOWLEDGED: 'acknowledged',
  EPHEMERAL: 'ephemeral',
  INTERNAL: 'internal',
});

// Scheduler job kinds.
export const JOB = Object.freeze({
  OCCURRENCE: 'occurrence',
  CONTINUE: 'continue',
  RETRY: 'retry',
  DEBOUNCE: 'debounce',
  AWAIT_TIMEOUT: 'awaitTimeout',
  ASYNC_TIMEOUT: 'asyncTimeout',
  QUEUE_EXPIRY: 'queueExpiry',
  DASHBOARD: 'dashboard',
  MAINTENANCE: 'maintenance',
  CHECKPOINT: 'checkpoint',
  RECOVERY: 'recovery',
});

// Lower numbers run first when two jobs share a deadline. Time always wins.
export const JOB_PRIORITY = Object.freeze({
  recovery: 0,
  continue: 10,
  retry: 10,
  awaitTimeout: 10,
  asyncTimeout: 10,
  occurrence: 20,
  debounce: 20,
  queueExpiry: 30,
  dashboard: 40,
  checkpoint: 50,
  maintenance: 60,
});

// Scheduler safeguards (plan §3.1). Tunable application limits, not Roll20 quotas.
export const SCHEDULER_DEFAULTS = Object.freeze({
  maxJobsPerDrain: 25,
  maxDrainMs: 15,
  yieldMs: 10,
  // Conservative ceiling below the 2^31-1 ms host limit; long waits re-check on wake.
  maxHostDelayMs: 2_147_000_000,
  compactRatio: 0.5,
  compactMinimum: 64,
});

// Product defaults from plan §12.1, enforced again at runtime.
export const DEFAULT_LIMITS = Object.freeze({
  definitions: 100,
  activeInstances: 100,
  branchesPerRun: 10,
  nestingDepth: 8,
  loopIterations: 100,
  consecutiveSteps: 500,
  stepsPerJob: 50,
  queuedPerDefinition: 100,
  catchUpPerGroup: 10,
  minIntervalMs: 1000,
  minWaitMs: 100,
  targetsPerChunk: 20,
  payloadBytes: 32 * 1024,
  importBytes: 256 * 1024,
  stateBytes: 1024 * 1024,
  ancestryDepth: 8,
  descendantsPerRun: 50,
  stepsPerDefinition: 500,
  expressionDepth: 16,
  expressionNodes: 200,
  stringLength: 2000,
  nameLength: 100,
  historyRuns: 200,
  auditEntries: 1000,
  openIncidents: 100,
  timelinePerRun: 50,
  queryResults: 20,
  admissionsPerMinute: 60,
  playerCommandsPerMinute: 30,
  burstPerTrigger: 20,
  echoWindowMs: 1500,
  chatPerMinute: 30,
  writesPerJob: 40,
  awaitTimeoutMaxMs: 7 * 24 * 60 * 60 * 1000,
});

// Timing defaults (plan §7.2, §9).
export const TIMING = Object.freeze({
  graceMs: 250,
  lateWindowMs: 5 * 60 * 1000,
  dashboardSpacingMs: 2000,
  dashboardCoalesceMs: 500,
  dashboardMaxDirtyMs: 5000,
  confirmationTtlMs: 5 * 60 * 1000,
  importTtlMs: 10 * 60 * 1000,
  asyncTimeoutMs: 30 * 1000,
  maintenanceMs: 10 * 60 * 1000,
  recreateHandoutMs: 60 * 1000,
  recoverySummaryMs: 60 * 1000,
  clockJumpMs: 5000,
});

// Default configuration for new installs.
export const DEFAULT_CONFIG = {
  language: DEFAULT_LOCALE,
  dashboardRows: 25,
  playerView: false,
  diagnostics: false,
  checkpointMs: 0,
  privateChatTriggers: false,
  roundAnchor: 'Round',
  graceMs: TIMING.graceMs,
  lateWindowMs: TIMING.lateWindowMs,
};

// Settings the GM can change on the Mod's page in the API Scripts screen.
export const USEROPTION_KEYS = ['dashboardRows', 'playerView', 'diagnostics'];

export const DASHBOARD_ROW_OPTIONS = [10, 25, 50];

// Dashboard sections, in navigation order.
export const DASHBOARD_VIEWS = [
  'overview',
  'definitions',
  'instances',
  'queue',
  'incidents',
  'history',
  'integrations',
];

// Duration units accepted by commands (plan §13). Months and years are
// deliberately absent: they are not fixed lengths.
export const DURATION_UNITS = Object.freeze({
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
});

export const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// Token properties a task may read or watch, and the ones `token.set` may write.
export const TOKEN_READ_PROPERTIES = [
  'name',
  'left',
  'top',
  'width',
  'height',
  'rotation',
  'layer',
  'pageid',
  'represents',
  'bar1_value',
  'bar1_max',
  'bar2_value',
  'bar2_max',
  'bar3_value',
  'bar3_max',
  'statusmarkers',
  'tint_color',
  'currentSide',
  'controlledby',
  'fliph',
  'flipv',
  'showname',
];
export const TOKEN_WRITE_PROPERTIES = {
  left: 'number',
  top: 'number',
  rotation: 'number',
  layer: 'layer',
  bar1_value: 'bar',
  bar1_max: 'bar',
  bar2_value: 'bar',
  bar2_max: 'bar',
  bar3_value: 'bar',
  bar3_max: 'bar',
  tint_color: 'color',
  fliph: 'boolean',
  flipv: 'boolean',
  showname: 'boolean',
  name: 'string',
};
// Writes only a GM-authority run may make.
export const TOKEN_GM_PROPERTIES = new Set(['layer', 'name']);
export const LAYERS = ['objects', 'gmlayer', 'map', 'walls', 'foreground'];

export const ATTRIBUTE_READ_PROPERTIES = ['name', 'current', 'max', 'characterid'];
export const CHARACTER_READ_PROPERTIES = ['name', 'controlledby', 'inplayerjournals'];
export const PLAYER_READ_PROPERTIES = ['displayname', 'online'];
export const PAGE_READ_PROPERTIES = ['name', 'width', 'height'];

// Built-in visual effects that `effect.spawn` accepts without GM approval.
export const FX_TYPES = [
  'bomb',
  'bubbling',
  'burn',
  'burst',
  'explode',
  'glow',
  'missile',
  'nova',
  'splatter',
];
export const FX_COLORS = [
  'acid',
  'blood',
  'charm',
  'death',
  'fire',
  'frost',
  'holy',
  'magic',
  'slime',
  'smoke',
  'water',
];

// Commands listed by `help` and the Help handout, with their help keys.
export const HELP_COMMANDS = [
  ['', 'menu'],
  ['help', 'help'],
  ['dashboard open|refresh|view <section> [<page>]', 'dashboard'],
  ['definition list|show|create|validate|publish', 'definition'],
  ['definition enable|disable|clone|archive|purge', 'definitionManage'],
  ['definition set|param|binding|access|policy|trigger|step', 'definitionEdit'],
  ['definition export|import', 'definitionTransfer'],
  ['template list|add <name>', 'template'],
  ['instance start|dry-run --definition <id>', 'instanceStart'],
  ['instance list|inspect|pause|resume|cancel|rerun', 'instance'],
  ['instance decide --id <run> --action <choice>', 'instanceDecide'],
  ['schedule add|list|pause|resume|remove|offset', 'schedule'],
  ['signal <name> [--value <v>]', 'signal'],
  ['report missed|runs|audit|diagnostics', 'report'],
  ['recovery preview|apply|acknowledge', 'recovery'],
  ['config show|set <key> <value>', 'config'],
  ['adapter list', 'adapter'],
  ['stop-all --preview|--confirm <token>', 'stopAll'],
  ['resume-all', 'resumeAll'],
];

// Colour palette for chat cards and handouts, shared with the other MidNiteShadow7 Mods.
export const COLOR_HEADER_BG = '#1d2a3a';
export const COLOR_HEADER_TEXT = '#e6edf5';
export const COLOR_CARD_BG_TOP = '#26394f';
export const COLOR_CARD_BG_BOTTOM = '#17222f';
export const COLOR_BORDER = '#3a5573';
export const COLOR_TEXT = '#e2e8f0';
export const COLOR_MUTED = '#9aabbd';
export const COLOR_ACCENT = '#f6ae2d';
export const COLOR_BUTTON_BG = '#33658a';
export const COLOR_BUTTON_TEXT = '#ffffff';
export const COLOR_BUTTON_ALT_BG = '#24384d';
export const COLOR_BUTTON_ALT_BORDER = '#4a6a8c';
export const COLOR_DANGER_BG = '#8a2c2c';
export const COLOR_OK = '#7bd389';
export const COLOR_WARNING_BG = '#fef3c7';
export const COLOR_WARNING_BORDER = '#92400e';
export const COLOR_WARNING_TEXT = '#92400e';
export const COLOR_ERROR_BG = '#fee2e2';
export const COLOR_ERROR_BORDER = '#991b1b';
export const COLOR_ERROR_TEXT = '#991b1b';
