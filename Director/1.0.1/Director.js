var API_Meta = API_Meta || {};
API_Meta.Director = {
    offset: Number.MAX_SAFE_INTEGER,
    lineCount: -1
}; {
    try {
        throw new Error('');
    } catch (e) {
        API_Meta.Director.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (4));
    }
}


// Jukebox Plus Plus (Fully Enhanced UI with Album/Playlist Toggle, Track Tagging, and Layout Fixes)
on('ready', () =>
{
    
    const version = '1.0.1'; //version number set here
    log('-=> Director v' + version + ' is loaded. Command !director creates control handout and provides link. Click that to open.');

//Changelog:
//1.0.0 Debut script
//1.0.1 Grid Mode, fallback image system for Marketplace images


// == Director Script ==
// Globals
const scriptName = 'Director';
const stateName = 'DIRECTOR_STATE';

// Helper to initialize state if needed
const getState = () => {
  if (!state[stateName]) {
    state[stateName] = {
      acts: {},
      actsExpanded: {},
      activeAct: null,
      activeScene: null,
      helpMode: false, 
      settings: {
        mode: 'light',
        settingsExpanded: false,
        muteBackdropAudio: false,      },
      scenes: {},
    };
  }
  return state[stateName];
};

const updateState = (st) => {
  state[stateName] = st;
};

 
  
  
const cssDark = {
  // === Layout: Header, Sidebar, Columns ===
  header: 'color:#ddd; background:#2d4354; border-bottom:1px solid #444; font-family: Nunito, Arial, sans-serif; font-weight:bold; text-align:left; font-size:20px; padding:4px;',
  sidebar: 'color:#ddd; background:#222; border-right:1px solid #444; width:150px; font-family: Nunito, Arial, sans-serif; vertical-align:top; padding:8px;',
  images: 'color:#ddd; background:#1e1e1e; border-right:1px solid #444; width:210px; font-family: Nunito, Arial, sans-serif; vertical-align:top; padding:8px;',
  items: 'color:#ddd; background:#1e1e1e; font-family: Nunito, Arial, sans-serif; vertical-align:top; padding:8px;',
  columnHeader: 'color:#ddd; background:#333; border-bottom:1px solid #555; margin:-8px -7px 1px -7px; padding:6px 8px; font-weight:bold; font-size:15px;',
  helpContainer: 'background:transparent;padding:16px; font-size:13px; line-height:1.5; max-height:800px; overflow-y:auto;',

  // === Buttons: Headers, Utility, Scene ===
  headerContainer: 'color:#ddd!important; background:#1a2833; border:1px solid #888; border-radius:4px; margin-top:-2px; margin-left:6px; padding:2px 6px; font-size:12px; float:right; text-decoration:none; position:relative; top:3px;',
  headerSubButton: 'color:#ddd!important; background:#2B3D4F; border:1px solid #888; border-radius:4px; margin:1px 0px 0px 4px; padding:1px 6px 0px 6px; font-size:12px; text-decoration:none; display:inline-block;',
  headerButton: 'color:#ddd!important; background:##1a2833; border:1px solid #888; border-radius:4px; margin-top:-2px; margin-left:6px; padding:4px 6px; font-size:12px; float:right; text-decoration:none; position:relative; top:3px;',
  settingsButton: 'color:#ddd; background:transparent; width:90%; margin-top:6px; padding:4px 6px; font-size:12px; display:inline-block; text-align:center; text-decoration:none;',
  utilityButton: 'color:#ddd; background:#555; border:1px solid #777; border-radius:4px; width:90%; margin-top:6px; padding:4px 6px; font-size:12px; display:inline-block; text-align:center; text-decoration:none;',
  utilitySubButton: 'color:#ccc; background:#444; border:1px solid #666; border-radius:3px; margin:-1px -1px 0px 3px; padding:1px 5px; font-size:11px; float:right; text-decoration:none;',
  utilitySubButtonActive: 'color:#111; background:#44aa44; border:1px solid #555; border-radius:3px; margin:-1px -1px 0 3px; padding:1px 5px; font-size:11px; float:right; text-decoration:none; cursor:pointer;',
  utilitySubButtonInactive: 'color:#888; background:#333; border:1px solid #777; border-radius:3px; margin:-1px -1px 0 3px; padding:1px 5px; font-size:11px; float:right; text-decoration:none; cursor:pointer;',
  sceneButtonActive: 'color:#111; background:#44aa44; border:1px solid #2a2a2a; border-radius:3px; margin:-1px -1px 0 3px; padding:3px 5px; font-size:11px; display:block; text-decoration:none; cursor:pointer;',
  sceneButtonInactive: 'color:#888; background:#333; border:1px solid #666; border-radius:3px; margin:-1px -1px 0 3px; padding:3px 5px; font-size:11px; display:block; text-decoration:none; cursor:pointer;',

  // === Utility Containers ===
  utilityContainer: 'color:#ddd; background:#555; border:1px solid #777; border-radius:4px; width:90%; min-height:18px; margin-top:6px; padding:4px 6px; font-size:12px; position:relative;',
  actContainer: 'color:#ddd; background:#555; border:1px solid #444; border-radius:4px; width:120px; min-height:18px; margin-top:0px; padding:4px 25px 4px 6px; font-size:12px; display:inline-block; position:relative;',

  // === Items and Item Buttons ===
  itemButton: 'color:#eee!important; background:#555; border:1px solid #666; width:98%;  margin:3px 0 0 0; padding:3px 6px 3px 0px; font-size:12px; border-radius:4px; display:inline-block; text-align:left; text-decoration:none;',
  itemBadge: 'color:#111; background:#999; border-radius:3px; width:20px; max-height:20px; margin:0px 2px; padding-top:2px; font-size:12px; font-weight:bold; text-align:center; display:inline-block; cursor:pointer; text-decoration:none;',
  itemAddBadge: 'color:#111; background:indianred; border-radius:3px; width:20px; max-height:20px; margin:0px 2px; padding-top:2px; font-size:12px; font-weight:bold; text-align:center; display:inline-block; cursor:pointer; text-decoration:none;',
  editIcon: 'color:#eee; font-size:12px; margin:0px 4px; display:inline-block; float:right; cursor:pointer;',
  utilityEditButton: 'color: #333; background: crimson; padding: 0 2px; border-radius: 3px; min-width:12px; margin-left:2px; margin-bottom:-19px; padding-top:2px; font-family: Pictos; font-size: 12px; text-align:center; float:right; position:relative; top:-22px; right:4px;',
  utilityEditButtonOverlay: 'color: #333; background: crimson; padding: 0 4px; border-radius: 3px; min-width: 12px; margin-left: 4px; padding-top: 2px; font-family: Pictos; font-size: 20px; text-align: center; cursor: pointer; float: none; position: relative; top: 0; right: 0; margin-bottom: 0; z-index: 11;',

  // === Message UI ===
  messageContainer: 'color:#ccc; background-color:#222; border:1px solid #444; border-radius:5px; padding:10px; font-family: Nunito, Arial, sans-serif; position:relative; top:-15px; left:-5px;',
  messageTitle: 'color:#ddd; font-size:16px; text-transform:capitalize; text-align:center; margin-bottom:13px;',
  messageButton: 'color:#ccc; background:#444; border-radius:4px; padding:2px 6px; margin-right:2px; display:inline-block; vertical-align:middle;',

  // === Images ===
  imageContainer: 'margin-bottom:2px; clear:both; overflow:hidden;',
  imageBoxWrapper: 'background:#1e1e1e; border:1px solid #666; border-radius:4px; width:208px; height:119px; margin: 4px 0px 0px 0px; position:relative; float:left;',
  imageDiv: 'background-position:center; background-size:cover; border:1px solid #666; border-radius:4px; width:208; height:117px; display:block;',
  imageTitleOverlay: 'color:#fff; background:rgba(0,0,0,0.4); border-radius:4px; padding:2px 6px; position:absolute; top:4px; left:8px; font-weight:bold; font-size:16px; text-shadow:0 0 4px #000; z-index:2; cursor:pointer;',
  imageBox: 'background-position:center!important; background-size:cover!important; width:208px; height:117px;',
  imageTitle: 'color:#ddd; font-weight:bold; font-size:16px; cursor:pointer; margin-bottom:6px;',
  imageControls: 'min-width:120px; float:left;',
  imageControlButton: 'color:#ddd; background:#555; border:1px solid #444; border-radius:4px; padding:4px 6px; margin-bottom:6px; font-size:12px; display:block; text-align:center; text-decoration:none; cursor:pointer; user-select:none;',
  image: 'border:1px solid #666; width:100px; height:100px; margin-right:8px; display:block; float:left; object-fit:cover;',

  // === Image Tracks ===
  trackButtonGhosted: 'color:white; opacity:0.4; text-shadow: 1px 1px black; font-family:Pictos; font-size:14px; text-decoration:none; margin-left:3px;',
  trackButtonNormal: 'color:white; text-shadow: 1px 1px black; font-family:Pictos; font-size:14px; text-decoration:none; margin-left:3px;',
  trackButtonPlaying: 'color:#44aa44; text-shadow: 1px 1px black; font-family:Pictos; font-size:14px; text-decoration:none; margin-left:3px;',
  trackButtonEdit: 'color:#333; background:crimson; padding:2px 3px; border-radius:3px; min-width:12px; margin-left:3px; font-family:Pictos; font-size:14px; text-align:center; vertical-align: middle; cursor:pointer; text-decoration:none;',


  // === Misc ===
  forceTextColor: 'color:#ddd; display:inline-block;',

  // === Badge Color Reference ===
  badgeColors: {
    handout:   '#2a80b9',
    character: '#27ae60',
    track:     '#e67e22',
    macro:     '#e4048c',
    table:     '#7f6c4f'
  }
};


const lightModeOverrides = {
  header: { color: '#222', background: '#93b3cc', border: '1px solid #666' },
  sidebar: { color: '#222', background: '#bbb', border: '1px solid #666' },
  images: { color: '#222', background: '#bbb', border: '1px solid #666' },
  items: { color: '#222', background: '#bbb' },
  columnHeader: { color: '#222', background: '#999', border: '1px solid #666' },

  headerContainer: { color: '#222', background: '#e0e0e0', border: '1px solid #888' },
  headerSubButton: { color: '#222', background: '#C2C3C4', border: '1px solid #888' },
  headerButton: { color: '#222', background: '#e0e0e0', border: '1px solid #888' },
  settingsButton: { color: '#222' },
  utilityButton: { color: '#222', background: '#ccc', border: '1px solid #666' },
  utilitySubButton: { color: '#222', background: '#ddd', border: '1px solid #999' },
  utilitySubButtonActive: { color: '#222', background: '#88cc88', border: '1px solid #777' },
  utilitySubButtonInactive: { color: '#444', background: '#ddd', border: '1px solid #999' },
  sceneButtonActive: { color: '#222', background: '#88cc88', border: '1px solid #777' },
  sceneButtonInactive: { color: '#555', background: '#ddd', border: '1px solid #666' },

  utilityContainer: { color: '#222', background: '#ccc', border: '1px solid #666' },
  actContainer: { color: '#222', background: '#ccc', border: '1px solid #666' },

  itemButton: { color: '#111', background: '#ddd', border: '1px solid #666' },
  editIcon: { color: '#666' },

  messageContainer: { color: '#222', background: '#f9f9f9', border: '1px solid #ccc' },
  messageTitle: { color: '#222' },
  messageButton: { color: '#222', background: '#ddd' },

  imageBoxWrapper: { background: '#fff', border: '1px solid #ccc' },
  imageDiv: { border: '1px solid #ccc' },
  imageTitle: { color: '#222' },
  imageControlButton: { color: '#222', background: '#eee', border: '1px solid #ccc' },
  image: { border: '1px solid #bbb' },

  forceTextColor: { color: '#111' },

  badgeColors: {
    handout: '#2a80b9',
    character: '#27ae60',
    track: '#e67e22',
    macro: '#e4048c',
    table: '#7f6c4f'
  }
};

const generateCssLightFromDark = (cssDark, overrides) => {
  const result = {};

  const replaceColors = (styleStr, override) => {
    const props = styleStr.split(';').map(p => p.trim()).filter(Boolean);
    const mapped = {};

    // Convert dark mode CSS string into key-value pairs
    props.forEach(p => {
      const [key, value] = p.split(':').map(s => s.trim());
      mapped[key] = value;
    });

    // Apply color/background/border overrides
    if (override) {
      if (override.color) mapped.color = override.color;
      if (override.background) mapped.background = override.background;
      if (override.border) {
        // Override just the relevant border (most are single sides)
        const sides = ['border', 'border-top', 'border-right', 'border-bottom', 'border-left'];
        const borderKey = sides.find(k => Object.keys(mapped).includes(k)) || 'border';
        mapped[borderKey] = override.border;
      }
    }

    // Rebuild into CSS string
    return Object.entries(mapped).map(([k, v]) => `${k}:${v}`).join('; ') + ';';
  };

  // Handle all style keys (excluding badgeColors)
  for (const key in cssDark) {
    if (key === 'badgeColors') continue;
    const override = overrides[key];
    result[key] = replaceColors(cssDark[key], override);
  }

  // Copy and override badgeColors
  result.badgeColors = {
    ...(cssDark.badgeColors || {}),
    ...(overrides.badgeColors || {})
  };

  return result;
};
const cssLight = generateCssLightFromDark(cssDark, lightModeOverrides);



  

  const getCSS = () => (state[stateName].settings.mode === 'dark' ? cssDark : cssLight);

const getPageForPlayer = (playerid) => {
  let player = getObj('player', playerid);
  if (!player) return null;

  if (playerIsGM(playerid)) {
    // For GM, get their last page viewed
    return player.get('lastpage');
  }

  const campaign = Campaign();
  const psp = campaign.get('playerspecificpages');
  if (psp[playerid]) {
    return psp[playerid];
  }

  return campaign.get('playerpageid');
};


// --- Helper Functions ---

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const generateUUID = () => {
  const a = () => Math.random().toString(16).slice(2);
  return `${a()}-${a()}-${a()}`;
};

const getActiveAct = () => {
  const activeScene = state[stateName].activeScene;
  if (!activeScene) return null;

  for (const actName in state[stateName].acts) {
    if (state[stateName].acts[actName].scenes?.[activeScene]) {
      return actName;
    }
  }

  return null;
};


const getActiveScene = () => {
  const st = getState();
  const activeAct = getActiveAct();
  if (!activeAct) return null;
  const act = st.acts[activeAct];
  const scene = st.activeScene;
  if (scene && act.scenes && act.scenes[scene]) {
    return scene;
  }
  const keys = Object.keys(act.scenes || {});
  if (keys.length) {
    st.activeScene = keys[0];
    return keys[0];
  }
  return null;
};

// Utility: Styled chat message sender
const sendStyledMessage = (titleOrMessage, messageOrUndefined, isPublic = false) => {
  const css = getCSS();
  let title, message;
  if (messageOrUndefined === undefined) {
    title = scriptName;
    message = titleOrMessage;
  } else {
    title = titleOrMessage || scriptName;
    message = messageOrUndefined;
  }
  message = String(message);
  message = message.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, command) => {
    return `<a href="${command}" style="${css.messageButton}">${label}</a>`;
  });

  const html = `<div style="${css.messageContainer}"><div style="${css.messageTitle}">${title}</div>${message}</div>`;
  const target = isPublic ? '' : '/w gm ';
  sendChat(scriptName, `${target}${html}`, null, { noarchive: true });
};

// Generate a unique ID for images/items
const generateRowID = () => {
  return `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
};



const deleteScene = (actName, sceneName) => {
  const st = getState();

  const act = st.acts?.[actName];
  if (!act) {
    sendStyledMessage('Director', `Act "${actName}" does not exist.`);
    return;
  }
  if (!act.scenes?.[sceneName]) {
    sendStyledMessage('Director', `Scene "${sceneName}" does not exist in act "${actName}".`);
    return;
  }

  // Delete from scenes
  delete act.scenes[sceneName];

  // Delete from scenesOrder
  if (Array.isArray(act.scenesOrder)) {
    act.scenesOrder = act.scenesOrder.filter(name => name !== sceneName);
  }

  // Clear activeScene if it was deleted
  if (st.activeScene === sceneName) {
    st.activeScene = null;
  }

  // Remove associated buttons
  if (st.items?.buttons) {
    st.items.buttons = st.items.buttons.filter(btn => btn.scene !== sceneName);
  }

  updateState(st);
  updateHandout();
  sendStyledMessage('Director', `Scene "${sceneName}" deleted from act "${actName}".`);
};



const deleteAct = (actName) => {
  const st = getState();

  const act = st.acts?.[actName];
  if (!act) {
    sendStyledMessage('Director', `Act "${actName}" does not exist.`);
    return;
  }

  // Remove associated buttons for scenes in this act
  if (st.items?.buttons) {
    const sceneNames = Object.keys(act.scenes || {});
    st.items.buttons = st.items.buttons.filter(btn => !sceneNames.includes(btn.scene));
  }

  // Clear activeScene if it was in this act
  if (st.activeScene && act.scenes?.[st.activeScene]) {
    st.activeScene = null;
  }

  // Delete act
  delete st.acts[actName];

  // Remove from actsOrder
  if (Array.isArray(st.actsOrder)) {
    st.actsOrder = st.actsOrder.filter(name => name !== actName);
  }

  updateState(st);
  updateHandout();
  sendStyledMessage('Director', `Act "${actName}" and all its scenes deleted.`);
};



// Backup and restore
const makeBackup = () => {
  const st = getState();

  // Find existing backups and parse their numeric suffixes
  const existing = findObjs({ type: 'handout' })
    .map(h => h.get('name'))
    .filter(name => /^Director Backup \d{3}$/.test(name))
    .map(name => parseInt(name.match(/\d{3}$/)[0], 10));

  // Get the next backup number
  const num = existing.length ? Math.max(...existing) + 1 : 1;
  const name = `Director Backup ${String(num).padStart(3, '0')}`;

  createObj('handout', {
    name,
    notes: JSON.stringify(st)
  });

  sendStyledMessage(scriptName, `Backup created: ${name}`);
};

const restoreBackup = (name) => {
  const handout = findObjs({ type: 'handout', name })[0];
  if (!handout) {
    sendStyledMessage(scriptName, `Backup not found: ${name}`);
    return;
  }
  handout.get('notes', (notes) => {
    try {
      const restored = JSON.parse(notes);
      state[stateName] = restored;
      sendStyledMessage(scriptName, `Restored from backup: ${name}`);
      updateHandout();
    } catch (err) {
      sendStyledMessage(scriptName, `Failed to parse backup: ${err.message}`);
    }
  });
};


const repairAllOrders = () => {
  const st = getState();

  // Repair actsOrder
  st.actsOrder = Object.keys(st.acts || {});
  log(`Repaired actsOrder: ${JSON.stringify(st.actsOrder)}`);

  // Repair scenesOrder for each act
  for (const actName of st.actsOrder) {
    const act = st.acts[actName];
    if (act && act.scenes) {
      act.scenesOrder = Object.keys(act.scenes);
      log(`Repaired scenesOrder for act "${actName}": ${JSON.stringify(act.scenesOrder)}`);
    }
  }

  // Prune orphaned character items
  if (st.items?.buttons?.length) {
    const originalCount = st.items.buttons.length;

    st.items.buttons = st.items.buttons.filter(btn => {
      if (btn.type !== 'character') return true;
      return getObj('character', btn.refId); // Keep only if character still exists
    });

    const prunedCount = originalCount - st.items.buttons.length;
    if (prunedCount > 0) {
      log(`[Director] Pruned ${prunedCount} orphaned character items.`);
    }
  }

  updateState(st);
  updateHandout();
};

const createVariantButtonFromToken = (token, scene) => {
  if (!token) return null;

  const represents = token.get('represents');
  if (!represents) return null;

  const safeProps = [
    'width', 'height', 'imgsrc', 'name', 'bar1_value', 'bar1_max', 'bar1_link', 'bar1_formula',
    'bar2_value', 'bar2_max', 'bar2_link', 'bar2_formula', 'bar3_value', 'bar3_max', 'bar3_link', 'bar3_formula',
    'showplayers_name', 'showplayers_bar1', 'showplayers_bar2', 'showplayers_bar3',
    'aura1_radius', 'aura1_color', 'aura2_radius', 'aura2_color',
    'tint_color', 'rotation', 'light_radius', 'light_dimradius', 'light_angle',
    'light_hassight', 'light_losangle', 'light_multiplier',
    'has_bright_light_vision', 'has_low_light_vision',
    'night_vision_distance', 'limit_field_of_vision_total',
    'limit_field_of_night_vision_total', 'compact_bar', 'bar_location',
    'sides', 'showname', 'show_tooltip', 'layer', 'gmnotes'
  ];

  const props = {};
  safeProps.forEach(prop => props[prop] = token.get(prop));

  return {
    id: generateUUID(),
    type: 'variant',
    name: token.get('name') || 'Unnamed Variant',
    refId: represents,
    scene,
    tokenProps: props
  };
};




// Capture image from selected token
const handleCaptureImage = (msg) => {
  if (!msg.selected || msg.selected.length !== 1) {
    sendStyledMessage('Error', 'Please select exactly one token to capture image.');
    return;
  }

  const token = getObj('graphic', msg.selected[0]._id);
  if (!token) {
    sendStyledMessage('Error', 'Selected token not found.');
    return;
  }

  let url = token.get('imgsrc').replace(/(thumb|med|original)/, 'max');
  const width = token.get('width');
  const height = token.get('height');
  const ratio = height / width;

  const st = getState();
  let sceneName = getActiveScene();

  if (!sceneName) {
    sceneName = 'Default Scene';
    if (!st.acts[st.activeAct]?.scenes[sceneName]) {
      if (!st.acts[st.activeAct]) st.acts[st.activeAct] = { scenes: {} };
      st.acts[st.activeAct].scenes[sceneName] = { images: [], items: [], backdropId: null };
      sendStyledMessage('Director', `No active scene found. Created default scene "${sceneName}".`);
    }
    st.activeScene = sceneName;
  }

  const images = st.acts[st.activeAct].scenes[sceneName].images;

  const id = generateRowID();
  images.push({
    id,
    url,
    ratio,
    type: 'highlight',
    title: 'New Image'
  });

  //sendStyledMessage('Image Captured', `Image added to scene "${sceneName}" as a highlight.`);
  updateHandout();
};


const getBadgeColor = (type) => {
  const colors = {
    handout: '#2a80b9',
    character: '#27ae60',
    variant: '#16a085',       // Teal for variants
    track: '#e67e22',
    macro: '#e4048c',
    table: '#7f6c4f',
    all: '#888'
  };
  return colors[type] || '#999';
};


const getBadge = (type, css) => {
  let badgeLetter;
  if (type === 'variant') badgeLetter = 'V';
  else if (type === 'table') badgeLetter = 'R';
  else badgeLetter = type.charAt(0).toUpperCase();

  return `<div style="${css.itemBadge} background:${getBadgeColor(type)};">${badgeLetter}</div>`;
};





const getEditIcon = (id, css) =>
  `<span style="${css.editIcon}" title="Edit" data-edit-id="${id}">✎</span>`;


const Pictos = (char) => `<span style="font-family: 'Pictos';">${char}</span>`;


const getScaledToFit = (ratio, maxW, maxH) => {
  const r = parseFloat(ratio) || 1; // height / width
  let w = maxW;
  let h = Math.round(w * r);

  if (h > maxH) {
    h = maxH;
    w = Math.round(h / r);
  }

  return { w, h };
};


const tagGraphicAsDirector = (graphic) => {
  graphic.set({
    aura2_color: '#000001',
    aura2_radius: '',
  });
};


const isDirectorGraphic = (graphic) =>
  graphic.get('aura2_color') === '#000001' &&
  graphic.get('aura2_radius') === '';



const FALLBACK_IMG = 'https://files.d20.io/images/450376099/-A1LbVK3RyZu-huOhIlTSw/original.png?1753641861';

const getSafeImgsrc = (imgsrc) => imgsrc.includes('/marketplace/') ? FALLBACK_IMG : imgsrc;






const enableDynamicLighting = (pageId) => {
  const page = getObj('page', pageId);
  if (!page) {
    return sendStyledMessage('Dynamic Lighting', 'Page not found.');
  }

  page.set({
    dynamic_lighting_enabled: true,
    daylight_mode_enabled: true,
    daylightModeOpacity: 1,  // 1 = 100%
    explorer_mode: 'off',
    lightupdatedrop: true,
    lightrestrictmove: true,
    force_lighting_refresh: true,
    fog_opacity: 0,
    lightupdatedrop: true
  });

  //sendStyledMessage('Dynamic Lighting', `Dynamic Lighting enabled for page "${page.get('name')}".`);
};



const disableDynamicLighting = (pageId) => {
  const page = getObj('page', pageId);
  if (!page) {
    return sendStyledMessage('Dynamic Lighting', 'Page not found.');
  }

  page.set({
    dynamic_lighting_enabled: false,
    daylight_mode_enabled: false,
    explorer_mode: 'off',
    force_lighting_refresh: true
  });

  //sendStyledMessage('Dynamic Lighting', `Dynamic Lighting disabled for page "${page.get('name')}".`);
};








const handleSetScene = (playerid) => {
  const st = getState();
  const currentScene = st.activeScene;

  if (!currentScene)
    return sendStyledMessage('Set Scene', 'No active scene is selected.');

  // Wipe previous scene if different
    wipeScene(st.lastSetScene, playerid);
  

  let pageId = getPageForPlayer(playerid);
  if (!pageId) pageId = Campaign().get('playerpageid');

  const page = getObj('page', pageId);
  if (!page) {
    return sendStyledMessage('Set Scene', 'No valid player page found, including fallback.');
  }

  const pageName = page.get('name')?.toLowerCase() || '';
  if (!/stage|scene|theater|theatre/.test(pageName)) {
    return sendStyledMessage('Set Scene', `Current page "${page.get('name')}" must contain:<br><i>stage, scene, theater, or theatre</i>.<br><br>Skipping scene setup.`);
  }



disableDynamicLighting(pageId);


  page.set({
    showgrid: false,
    //background_color: '#000000',
  });

  // --- Find scene data ---
  let scene = null;
  for (const act of Object.values(st.acts)) {
    if (act.scenes?.[currentScene]) {
      scene = act.scenes[currentScene];
      break;
    }
  }
  if (!scene) return sendStyledMessage('Set Scene', 'Active scene data not found.');

  const pageWidth = page.get('width') * 70;
  const pageHeight = page.get('height') * 70;
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;

  // Stop all currently playing tracks
  const playingTracks = findObjs({ _type: 'jukeboxtrack' }).filter(t => t.get('playing'));
  playingTracks.forEach(t => t.set('playing', false));

  // --- Backdrop ---
  const backdropImg = scene.images?.find(img => img.id === scene.backdropId);
  if (backdropImg) {
    const maxWidth = pageWidth - 140;
    const maxHeight = pageHeight - 140;
    const size = getScaledToFit(backdropImg.ratio, maxWidth, maxHeight);

    const backdrop = createObj('graphic', {
      _pageid: pageId,
      layer: 'map',
      imgsrc: cleanImg(backdropImg.url),
      left: centerX,
      top: centerY,
      width: size.w,
      height: size.h,
      isdrawing: true,
      name: backdropImg.title || 'Backdrop',
      showname: false,
      showplayers_name: false,
    });
    tagGraphicAsDirector(backdrop);

if (backdropImg.trackId && !st.settings.muteBackdropAudio) {
  const track = getObj('jukeboxtrack', backdropImg.trackId);
  if (track && !track.get('playing')) {
    track.set('playing', true);
  } else if (!track) {
    log(`[Director] Backdrop track ID "${backdropImg.trackId}" not found.`);
  }
}

    st.lastSetScene = currentScene;
  }

  // --- Highlights ---
  const highlights = scene.images?.filter(img => img.type === 'highlight') || [];
  let highlightTop = 105;
  let highlightLeft = -105;

  for (const img of highlights) {
    const size = getScaledDimensions(img.ratio, 210);

    // Wrap column if needed
    if (highlightTop + size.h > pageHeight - 50) {
      highlightTop = 105;
      highlightLeft -= (210 + 10); // 210 fixed width + 10px gap
    }

    const highlight = createObj('graphic', {
      _pageid: pageId,
      layer: 'objects',
      imgsrc: cleanImg(img.url),
      left: highlightLeft,
      top: highlightTop + size.h / 2,
      width: size.w,
      height: size.h,
      isdrawing: true,
      name: img.title || 'Highlight',
      showname: true,
      showplayers_name: false,
    });
    tagGraphicAsDirector(highlight);
    highlightTop += size.h + 20;
  }

  // --- Character Tokens ---
  const charItems = (st.items?.buttons || []).filter(btn =>
    btn.scene === currentScene &&
    (
      (btn.type === 'character' && btn.refId) ||
      (btn.type === 'variant')
    )
  );

  let tokenTop = 105;
  let tokenLeft = pageWidth + 70;
  let currentColumnMaxWidth = 70;

  const placeNextToken = () => {
    if (!charItems.length) return;

    const btn = charItems.shift();

    const handlePlacement = (props, name) => {
      const tokenWidth = props.width || 70;
      const tokenHeight = props.height || 70;

      // Wrap to next column if vertical space exceeded
      if (tokenTop + tokenHeight > pageHeight - 50) {
        tokenTop = 105;
        tokenLeft += currentColumnMaxWidth + 70;
        currentColumnMaxWidth = tokenWidth;
      } else {
        currentColumnMaxWidth = Math.max(currentColumnMaxWidth, tokenWidth);
      }

      props.left = tokenLeft + tokenWidth / 2;
      props.top = tokenTop + tokenHeight / 2;

      const token = createObj('graphic', props);
      tagGraphicAsDirector(token);

      tokenTop += tokenHeight + 20;
    };

    if (btn.type === 'variant') {
      try {
        const props = { ...btn.tokenProps };

/*
        if (!props || !props.imgsrc) {
          log(`[Director] Invalid tokenProps for variant "${btn.name}". Skipping.`);
          return placeNextToken();
        }
        */
        if (!props || !props.imgsrc) {
        props.imgsrc = getSafeImgsrc(cleanImg(props.imgsrc))||FALLBACK_IMG;
}

        props.imgsrc = getSafeImgsrc(cleanImg(props.imgsrc));
        props._pageid = pageId;
        props.layer = 'objects';

        handlePlacement(props, btn.name);
      } catch (e) {
        log(`[Director] Error placing variant "${btn.name}": ${e.message}`);
      }
      return setTimeout(placeNextToken, 0);
    }

    const char = getObj('character', btn.refId);
    if (!char) return placeNextToken();

    char.get('_defaulttoken', (blob) => {
      try {
        const props = JSON.parse(blob);
        if (!props || !props.imgsrc) return placeNextToken();

        props.imgsrc = getSafeImgsrc(cleanImg(props.imgsrc));
        props._pageid = pageId;
        props.layer = 'objects';

        handlePlacement(props, char.get('name'));
      } catch (e) {
        log(`[Director] Error parsing default token for ${char.get('name')}: ${e}`);
      }
      setTimeout(placeNextToken, 0);
    });
  };

  placeNextToken();
  updateHandout();
};


const wipeScene = (sceneName, playerid) => {
  const pageId = getPageForPlayer(playerid);  // This returns what the GM is *currently viewing*
  if (!pageId) {
    // Count total number of pages in the game
    const allPages = findObjs({ _type: 'page' });
    const pageCount = allPages.length;
    // Base message
    let msg = 'No valid page found for your view. Director-controlled pages must contain:<br><i>stage, scene, theater, or theatre</i> in the title.';
    // Add extra paragraph if only one page exists. This is for new games, since the GM must have manually switched to a page at least once.
    if (pageCount === 1) {
      msg += `<br><br><b>Also:</b> If this is a new game, you must have changed pages at least once, as the GM.`;
    }

    return sendStyledMessage('Wipe Scene', msg);
  }

  const page = getObj('page', pageId);
  if (!page) {
    return sendStyledMessage('Wipe Scene', 'Page object could not be found.');
  }

  const name = page.get('name')?.toLowerCase() || '';
  if (!/stage|scene|theater|theatre/.test(name)) {
    return sendStyledMessage('Wipe Scene', `Page "${page.get('name')}" must contain:<br><i>stage, scene, theater, or theatre</i>.<br><br>Aborting wipe.`);
  }

  const graphics = findObjs({ _type: 'graphic', _pageid: pageId });
  graphics.forEach(g => {
    if (isDirectorGraphic(g)) g.remove();
  });

  const paths = findObjs({ _type: 'pathv2', _pageid: pageId, layer: 'walls' });
  paths.forEach(p => {
    if (p.get('stroke') === '#84d162') p.remove();
  });

disableDynamicLighting(pageId);


  //sendStyledMessage('Wipe Scene', `All Director graphics cleared from page "${page.get('name')}".`);
};










const handleSetGrid = (playerid) => {
  const st = getState();
  const currentScene = st.activeScene;

  if (!currentScene)
    return sendStyledMessage('Set Grid', 'No active scene is selected.');

  wipeScene(st.lastSetScene, playerid);

  let pageId = getPageForPlayer(playerid);
  if (!pageId) pageId = Campaign().get('playerpageid');

  const page = getObj('page', pageId);
  if (!page)
    return sendStyledMessage('Set Grid', 'No valid player page found, including fallback.');

enableDynamicLighting(pageId);


  let act, scene;
  for (const a of Object.values(st.acts)) {
    if (a.scenes?.[currentScene]) {
      act = a;
      scene = a.scenes[currentScene];
      break;
    }
  }

  if (!scene)
    return sendStyledMessage('Set Grid', 'Active scene data not found.');

  const validImages = (scene.images || []).filter(img => img.url && img.url.startsWith('https://'));

  if (!validImages.length)
    return sendStyledMessage('Set Grid', 'No image assets found for grid placement.');

  if (validImages.length > 6)
    return sendStyledMessage('Set Grid', 'Grid layout only supports up to 6 images.');

  const pageWidth = page.get('width') * 70;
  const pageHeight = page.get('height') * 70 - 105;

  const imgCount = validImages.length;
  const gridCells = (imgCount <= 2) ? 2 : (imgCount <= 4) ? 4 : 6;
  const rows = (gridCells === 2) ? 1 : 2;
  const cols = (gridCells === 2) ? 2 : (gridCells === 4) ? 2 : 3;

  const cellWidth = Math.floor(pageWidth / cols);
  const cellHeight = Math.floor(pageHeight / rows);

  const margin = 70;
  const maxImgWidth = cellWidth - 2 * margin;
  const maxImgHeight = cellHeight - 2 * margin;

  if (maxImgWidth <= 0 || maxImgHeight <= 0) {
    return sendStyledMessage('Set Grid', 'Grid layout failed: Page is too small to fit all images with required spacing. Resize the page or reduce the number of images and try again.');
  }

  const positions = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push({
        x: c * cellWidth + cellWidth / 2,
        y: r * cellHeight + 105 + cellHeight / 2
      });
    }
  }

  validImages.forEach((img, i) => {
    if (i >= positions.length) return;

    const pos = positions[i];
    const dims = getScaledToFit(img.ratio || 1, maxImgWidth, maxImgHeight);
    const cleanUrl = cleanImg(img.url);
    if (!cleanUrl) return;

    const g = createObj('graphic', {
      _pageid: pageId,
      layer: 'map',
      imgsrc: cleanUrl,
      left: pos.x,
      top: pos.y,
      width: dims.w,
      height: dims.h,
      isdrawing: true,
      name: img.title || `Image ${i + 1}`,
      showname: false,
      showplayers_name: false,
    });

    if (!g) return;

    tagGraphicAsDirector(g);

    createObj('pathv2', {
      _pageid: pageId,
      layer: 'walls',
      stroke: '#84d162',
      stroke_width: 5,
      fill: 'transparent',
      shape: 'rec',
      points: JSON.stringify([
        [0, 0],
        [cellWidth, cellHeight]
      ]),
      x: pos.x,
      y: pos.y,
      barrierType: 'wall',
      controlledby: ''
    });
  });

  st.lastSetScene = currentScene;

  // --- Character Tokens ---
  const charItems = (st.items?.buttons || []).filter(btn =>
    btn.scene === currentScene &&
    (
      (btn.type === 'character' && btn.refId) ||
      (btn.type === 'variant')
    )
  );

  let tokenTop = 105;
  let tokenLeft = pageWidth + 70;
  let currentColumnMaxWidth = 70;

  const placeNextToken = () => {
    if (!charItems.length) return;

    const btn = charItems.shift();

    const handlePlacement = (props, name) => {
      const tokenWidth = props.width || 70;
      const tokenHeight = props.height || 70;

      // Wrap to next column if vertical space exceeded
      if (tokenTop + tokenHeight > pageHeight - 50) {
        tokenTop = 105;
        tokenLeft += currentColumnMaxWidth + 70;
        currentColumnMaxWidth = tokenWidth;
      } else {
        currentColumnMaxWidth = Math.max(currentColumnMaxWidth, tokenWidth);
      }

      props.left = tokenLeft + tokenWidth / 2;
      props.top = tokenTop + tokenHeight / 2;

      const token = createObj('graphic', props);
      tagGraphicAsDirector(token);

      tokenTop += tokenHeight + 20;
    };

    if (btn.type === 'variant') {
      try {
        const props = { ...btn.tokenProps };

/*
        if (!props || !props.imgsrc) {
          log(`[Director] Invalid tokenProps for variant "${btn.name}". Skipping.`);
          return placeNextToken();
        }
        */
        if (!props || !props.imgsrc) {
        props.imgsrc = getSafeImgsrc(cleanImg(props.imgsrc))||FALLBACK_IMG;
}

        props.imgsrc = getSafeImgsrc(cleanImg(props.imgsrc));
        props._pageid = pageId;
        props.layer = 'objects';

        handlePlacement(props, btn.name);
      } catch (e) {
        log(`[Director] Error placing variant "${btn.name}": ${e.message}`);
      }
      return setTimeout(placeNextToken, 0);
    }

    const char = getObj('character', btn.refId);
    if (!char) return placeNextToken();

    char.get('_defaulttoken', (blob) => {
      try {
        const props = JSON.parse(blob);
        if (!props || !props.imgsrc) return placeNextToken();

        props.imgsrc = getSafeImgsrc(cleanImg(props.imgsrc));
        props._pageid = pageId;
        props.layer = 'objects';

        handlePlacement(props, char.get('name'));
      } catch (e) {
        log(`[Director] Error parsing default token for ${char.get('name')}: ${e}`);
      }
      setTimeout(placeNextToken, 0);
    });
  };

  placeNextToken();
  updateHandout();
};




const getScaledDimensions = (ratio, maxDim) => {
  const r = parseFloat(ratio) || 1;
  let w, h;
  if (r >= 1) {
    // Taller than wide — scale height to max
    h = maxDim;
    w = Math.round(maxDim / r);
  } else {
    // Wider than tall — scale width to max
    w = maxDim;
    h = Math.round(maxDim * r);
  }
  return { w, h };
};


const sanitizeTokenProps = (raw) => {
  const props = { ...raw };
  delete props._id;
  delete props.id;
  delete props._type;
  delete props._pageid;
  delete props.layer;

  if (props.imgsrc) props.imgsrc = cleanImg(props.imgsrc);

  return props;
};





const cleanImg = (src) => {
  if (!src) return '';
  const parts = src.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
  if (parts) {
    return parts[1] + 'thumb' + parts[3] + (parts[4] || `?${Math.floor(Math.random() * 9999999)}`);
  }
  return '';
};


const renderHelpHtml = (css) => `
<div style="${css.helpContainer}">
  <h2>Director</h2>
  <p>The Director script supports "theater of the mind" style play in Roll20. It provides an interface for managing scenes, associated images, audio, and relevant game assets — all organized within a persistent handout.</p>
  <p><a href="https://youtu.be/TMYzFNTkiNU?si=yexMBPtz0sXNdx_o" target="_blank">Watch a video demo of Director</a>.</p>
  <br>

  <h3>Interface Overview</h3>
  <p>The interface appears in a Roll20 handout. It consists of four main sections:</p>
  <ul>
    <li><b>Acts & Scenes</b> — scene navigation and management</li>
    <li><b>Images</b> — backdrops, highlights, and associated tracks</li>
    <li><b>Items</b> — characters, variants, macros, and other token types</li>
    <li><b>Utility Controls</b> — edit mode, help toggle, settings, backup</li>
  </ul>
  <br>

  <h3>Acts & Scenes</h3>
  <h4>Act Controls</h4>
  <p>Acts group together related scenes. Use the
    <span style="${css.utilitySubButton}; float:none; position:relative;">+ Add Act</span>
    button to create an act.</p>
  <p>In <b>Edit Mode</b>, act-level options include:
    <ul>
      <li>Rename or delete the act</li>
      <li>Move the act up or down</li>
    </ul>
  </p>

  <h4>Scene Controls</h4>
  <p>Each scene represents a distinct time and place. Click a scene name to set it active. The active scene determines what appears in the Images and Items sections.</p>
  <p>In <b>Edit Mode</b>, scene controls include:
    <ul>
      <li>Rename / Delete</li>
      <li>Move Up / Down — if moved past the end of an act, the scene moves to the top of the next expanded act</li>
    </ul>
  </p>
  <br>

  <h3>Images</h3>
<h4>Backdrop vs. Highlight</h4>
<p><b>Backdrop</b> is the main background image for the scene, displayed on the map layer to set the overall environment.</p>
<p><b>Highlights</b> are supplementary images layered above the backdrop on the object layer, used to draw attention to specific elements or areas.</p>
<p>When a scene is set, the backdrop is placed on the map layer, while all highlights appear on the object layer, aligned left beyond the page boundary for easy visibility and interaction.</p>
<p>To use a highlight, the gm can drag it onto the page, or select it and use the shift-Z keyboard command to preview it to the players.</p>
<p>Highlights and Bacdrops can be switched on the fly by using the buttons found on each image in the handout (see below)
  <h4>Adding Images</h4>
  <p>To add an image:
    <ol>
      <li>Drag a graphic to the tabletop. Hold <b>Alt</b>/<b>Option</b> while dragging to preserve aspect ratio.</li>
      <li>Select the graphic and click 
        <span style="${css.utilitySubButton}; float:none; position:relative;">+ Add Image</span>
        at the top of the Images section.
      </li>
    </ol>
  </p>

  <h4>Image Controls</h4>
  <ul>
    <li><b>Title Overlay</b>: click to rename the image</li>
    <li><b>Bottom-right icons</b>:
      <ul>
        <li>${Pictos('`')} Set as backdrop</li>
        <li>${Pictos('|')} Set as highlight</li>
        <li>${Pictos('m')} Assign track (uses currently playing audio). When an image that has a track is made into the Backdrop image, and track assigned to it immediately starts playing.</li>
      </ul>
    </li>
    <li>In <b>Edit Mode</b>: move, recapture, and delete options appear in the top-right corner</li>
  </ul>
    <h4>Mute Button</h4>
<p>Click to toggle. When this button is red, the audio track auto-play behavior of backdrops is suppressed.</p>
  <br>

  <h3>Items (Characters, Variants, Tracks, Macros, Tables)</h3>
  <p>Items define what is placed or triggered when a scene is set. Items are scoped per scene.</p>

  <h4>Adding Items</h4>
<p>Click a badge to add a new item:</p>
<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:10px;">
  <div style="${css.itemBadge} background:${getBadgeColor('handout')}; float:none; position:relative;">H</div>
  <div style="${css.itemBadge} background:${getBadgeColor('character')}; float:none; position:relative;">C</div>
  <div style="${css.itemBadge} background:${getBadgeColor('variant')}; float:none; position:relative;">V</div>
  <div style="${css.itemBadge} background:${getBadgeColor('track')}; float:none; position:relative;">T</div>
  <div style="${css.itemBadge} background:${getBadgeColor('macro')}; float:none; position:relative;">M</div>
  <div style="${css.itemBadge} background:${getBadgeColor('table')}; float:none; position:relative;">R</div>
</div>

<h4>Item Behavior</h4>
<ul style="list-style: none; padding-left: 0;">
  <li style="position: relative; padding-left: 32px; margin-bottom: 6px;">
    <div style="${css.itemBadge} background:${getBadgeColor('handout')}; position: absolute; left: 0; top: 0;">H</div>
    <b>Handouts</b>: Opens the handout
  </li>
  <li style="position: relative; padding-left: 32px; margin-bottom: 6px;">
    <div style="${css.itemBadge} background:${getBadgeColor('character')}; position: absolute; left: 0; top: 0;">C</div>
    <b>Characters</b>: Opens the sheet if assigned; otherwise, prompts assignment
  </li>
  <li style="position: relative; padding-left: 32px; margin-bottom: 6px;">
    <div style="${css.itemBadge} background:${getBadgeColor('variant')}; position: absolute; left: 0; top: 0;">V</div>
    <b>Variants</b>: Does not open — appears on scene set
  </li>
  <li style="position: relative; padding-left: 32px; margin-bottom: 6px;">
    <div style="${css.itemBadge} background:${getBadgeColor('track')}; position: absolute; left: 0; top: 0;">T</div>
    <b>Tracks</b>: Toggles playback if assigned; otherwise assigns currently playing track
  </li>
  <li style="position: relative; padding-left: 32px; margin-bottom: 6px;">
    <div style="${css.itemBadge} background:${getBadgeColor('macro')}; position: absolute; left: 0; top: 0;">M</div>
    <b>Macros</b>: Runs the macro if assigned; otherwise prompts to assign an existing macro
  </li>
  <li style="position: relative; padding-left: 32px; margin-bottom: 6px;">
    <div style="${css.itemBadge} background:${getBadgeColor('table')}; position: absolute; left: 0; top: 0;">R</div>
    <b>Rollable Tables</b>: Rolls the assigned table; otherwise prompts to assign one. Results are whispered to the GM
  </li>
</ul>




  <p><i>Variants are token snapshots that share a sheet. Use these when default tokens cannot be reliably spawned, or to represent unique versions of a shared character sheet.</i></p>

  <h4>Edit Controls</h4>
  <p>In Edit Mode, each item shows:</p>
  <ul>
    <li><b>${Pictos('p')}</b> — Reassign</li>
    <li><b>${Pictos('#')}</b> — Delete</li>
  </ul>

  <p><b>Filter:</b> Click the
    <span style="${css.itemAddBadge}; float:none; position:relative;">🔍</span>
    button to filter items by type.
  </p>
  <br>

  <h3>Header Buttons</h3>
  <h4>Set Scene as: </h4>
  <p><span style="${css.headerSubButton}; float:none; position:relative;">Scene</span> populates the tabletop with:
    <ul>
      <li>Backdrop image (Map Layer)</li>
      <li>Highlight images (Object Layer, left-aligned off page edge)</li>
      <li>Character and variant tokens (Object Layer, right-aligned off page edge)</li>
      <li>Starts assigned track (if set)</li>
    </ul>
  </p>
    <p><span style="${css.headerSubButton}; float:none; position:relative;">Grid</span> populates the tabletop with:
    <ul>
      <li>up to six images, arranged as grid (Map Layer)</li>
      <li>Surrounds each image with dynamic lighting barrier and turns on dynamic lighting with Daylight Mode</li>
      <li>Top strip of page is not part of grid (for holding player tokens)</li>
      <li>Character and variant tokens (Object Layer, right-aligned off page edge)</li>
    </ul>
  </p>
  <p>Only works if the current page name contains: <i>scene, stage, theater, theatre</i></p>

  <h4>Wipe Scene</h4>
  <p><span style="${css.headerButton}; float:none; position:relative;">Wipe the Scene</span> removes all placed images and stops all audio.</p>
  <p>Only functions on valid stage pages.</p>

  <h4>Edit Mode</h4>
  <p><span style="${css.headerButton}; float:none; position:relative;">${Pictos(')')}</span> toggles editing. When enabled:</p>
  <ul>
    <li>Rename, delete, and move controls appear for acts, scenes, and images</li>
    <li>Items are grouped by type and display reassign/delete controls</li>
  </ul>
    <h4>JB+</h4>
  <p>If you have the Jukebox Plus script installed, this button will display and will put a link in chat for opening that program's controls.</p>
    <h4>Help</h4>
  <p>Displays this Help documentation. While in help mode, this changes to read "Exit Help".</p>
    <h4>Make Help Handout</h4>
  <p>This button appears only while in Help mode. Pressing it will create a handout containing the help documentaiton. Useful if you want to see the documentation and the interface at the same time.</p>


  <h3>Helpful Macros</h3>
  <p>The interface is primary, but the following macros can be used in chat or action buttons:</p>
  <pre style="background:#eee; padding:6px; font-size:12px;">
!director --set-scene
!director --wipe-scene
!director --new-act|Act I
!director --new-scene|Act I|Opening Scene
!director --capture-image
  </pre>
</div>
`;

const getJukeboxPlusHandoutLink = () => {
 const css = getCSS();
  if (typeof API_Meta !== 'undefined' &&
      API_Meta.JukeboxPlus &&
      typeof API_Meta.JukeboxPlus.offset === 'number') {
    
    const handout = findObjs({ type: 'handout', name: 'Jukebox Plus' })[0];
    if (handout) {
      const url = `http://journal.roll20.net/handout/${handout.id}`;
      return `<a href="${url}" style="${css.headerButton}"><span style="${css.forceTextColor}">JB+</span></a>`;
    }
  }
  return '';
};


const renderFilterBarInline = (css) => {
  const st = getState();
  const activeFilter = st.items?.filter || 'all';
  const mode = st.settings?.mode || 'light';
  const borderColor = mode === 'dark' ? '#eee' : '#444';

  // Build dynamic option strings
  const characters = findObjs({ _type: 'character' }).sort((a, b) => a.get('name').localeCompare(b.get('name')));
  const handouts = findObjs({ _type: 'handout' }).sort((a, b) => a.get('name').localeCompare(b.get('name')));
  const macros = findObjs({ _type: 'macro' }).sort((a, b) => a.get('name').localeCompare(b.get('name')));
  const tables = findObjs({ _type: 'rollabletable' }).sort((a, b) => a.get('name').localeCompare(b.get('name')));
  const tracks = findObjs({ _type: 'jukeboxtrack' }).sort((a, b) => a.get('title').localeCompare(b.get('title')));

  const buildOpts = (objs, labelFn = o => o.get('name')) =>
    objs.map(o => `${labelFn(o).replace(/"/g, "&quot;")},${o.id}`).join('|');
    // Suggested replacement for following line to catch names with double quotes.
    //objs.map(o => `${labelFn(o)},${o.id}`).join('|');

  const charOpts = buildOpts(characters);
  const handoutOpts = buildOpts(handouts);
  const macroOpts = buildOpts(macros);
  const tableOpts = buildOpts(tables);
  const trackOpts = buildOpts(tracks, t => t.get('title'));

  const buttons = [
    `<a href="!director --add-handout|?{Select Handout|${handoutOpts}}" style="${css.itemBadge} background:${getBadgeColor('handout')};" title="Add Handout Button">H</a>`,
    `<a href="!director --add-character|?{Select Character|${charOpts}}" style="${css.itemBadge} background:${getBadgeColor('character')};" title="Add Character Button">C</a>`,
    `<a href="!director --add-item|variant" style="${css.itemBadge} background:${getBadgeColor('variant')};" title="Add Variant (from Selected Token)">V</a>`,
    `<a href="!director --add-item|track" style="${css.itemBadge} background:${getBadgeColor('track')};" title="Add Track Button">T</a>`,
    `<a href="!director --add-macro|?{Select Macro|${macroOpts}}" style="${css.itemBadge} background:${getBadgeColor('macro')};" title="Add Macro Button">M</a>`,
    `<a href="!director --add-table|?{Select Table|${tableOpts}}" style="${css.itemBadge} background:${getBadgeColor('table')};" title="Add Rollable Table Button">R</a>`,
    `<a href="!director --filter|?{Filter Items by Type:|Show All Types,all|Handout,handout|Character,character|Track,track|Macro,macro|Table,table}" 
        style="${css.itemAddBadge};" title="Filter Items by Type">🔍</a>`
  ];

  return buttons.join('');
};



// Render the items list with handout buttons and inline query prompt if undefined
const renderItemsList = (css) => {
  const st = getState();
  const isEditMode = !!st.items?.editMode;
  const currentScene = st.activeScene;
  const activeFilter = st.items?.filter || 'all';

  const items = (st.items?.buttons || []).filter(btn => {
    const sceneMatch = btn.scene === currentScene;
    const typeMatch = activeFilter === 'all' || 
                      btn.type === activeFilter || 
                      (activeFilter === 'character' && btn.type === 'variant');
    const excludeActions = btn.type !== 'action';
    return sceneMatch && typeMatch && excludeActions;
  });

  const handouts = findObjs({ _type: 'handout' }).sort((a, b) => a.get('name').localeCompare(b.get('name')));
  const characters = findObjs({ _type: 'character' }).sort((a, b) => a.get('name').localeCompare(b.get('name')));
  const macros = findObjs({ _type: 'macro' }).sort((a, b) => a.get('name').localeCompare(b.get('name')));
  const tables = findObjs({ _type: 'rollabletable' }).sort((a, b) => a.get('name').localeCompare(b.get('name')));

  return items.map(btn => {
    let action = '';
    let labelText = btn.name;
    let tooltipAttr = '';

    if (btn.type === 'action') {
      if (!btn.refId) {
        const options = characters.map(c => `${c.get('name')},${c.id}`).join('|');
        action = `!director --set-action-character|${btn.id}|?{Select Character|${options}}`;
        labelText = 'New Action';
        tooltipAttr = ` title="Assign character for action"`;
      } else if (btn.refId && !btn.actionName) {
        const char = getObj('character', btn.refId);
        let actions = [];
        if (char) {
          const abilities = findObjs({ _type: 'ability', _characterid: char.id });
          actions = abilities.map(a => a.get('name')).sort();
        }
        const opts = actions.length
          ? actions.map(name => `${name},${name}`).join('|')
          : 'No Actions Available,None';
        action = `!director --set-action|${btn.id}|?{Select Action|${opts}}`;
        labelText = `${char ? char.get('name') : 'Unknown Character'} — Choose Action`;
        tooltipAttr = ` title="Choose action for character"`;
      } else if (btn.refId && btn.actionName) {
        const char = getObj('character', btn.refId);
        labelText = `${char ? char.get('name') : 'Unknown Character'}: ${btn.actionName}`;
        action = `!director --run-action|${btn.id}`;
        tooltipAttr = ` title="Run character action"`;
      }
    } else if (btn.type === 'handout') {
      if (btn.refId) {
        action = `http://journal.roll20.net/handout/${btn.refId}`;
        tooltipAttr = ` title="Open handout"`;
      } else {
        const sanitizeQueryLabel = (label) => label.replace(/,/g, '—');
        const options = handouts.map(h => `${sanitizeQueryLabel(h.get('name'))},${h.id}`).join('|');
        action = `!director --set-handout|${btn.id}|?{Select Handout|${options}}`;
        tooltipAttr = ` title="Assign handout"`;
      }
    } else if (btn.type === 'character') {
      if (btn.refId) {
        action = `http://journal.roll20.net/character/${btn.refId}`;
        tooltipAttr = ` title="Open character sheet"`;
      } else {
        const options = characters.map(c => `${c.get('name')},${c.id}`).join('|');
        action = `!director --set-character|${btn.id}|?{Select Character|${options}}`;
        tooltipAttr = ` title="Assign character sheet"`;
      }
    } else if (btn.type === 'variant') {
      if (btn.refId) {
        action = `http://journal.roll20.net/character/${btn.refId}`;
        tooltipAttr = btn.tokenProps?.tooltip
          ? ` title="${btn.tokenProps.tooltip.replace(/"/g, '&quot;')}"`
          : ` title="Linked variant token"`;
      } else {
        action = 'javascript:void(0)';
        tooltipAttr = ` title="Unlinked variant token"`;
      }
    } else if (btn.type === 'macro') {
      if (btn.refId) {
        action = `!director --run-macro|${btn.refId}`;
        tooltipAttr = ` title="Run macro"`;
      } else {
        const options = macros.map(m => `${m.get('name')},${m.id}`).join('|');
        action = `!director --set-macro|${btn.id}|?{Select Macro|${options}}`;
        tooltipAttr = ` title="Assign macro"`;
      }
    } else if (btn.type === 'table') {
      if (btn.refId) {
        const table = getObj('rollabletable', btn.refId);
        if (table) {
          action = `!director --roll-table|${btn.refId}`;
          tooltipAttr = ` title="Roll table"`;
        } else {
          const options = tables.map(t => `${t.get('name')},${t.id}`).join('|');
          action = `!director --set-table|${btn.id}|?{Select Table|${options}}`;
          tooltipAttr = ` title="Assign table"`;
        }
      } else {
        const options = tables.map(t => `${t.get('name')},${t.id}`).join('|');
        action = `!director --set-table|${btn.id}|?{Select Table|${options}}`;
        tooltipAttr = ` title="Assign table"`;
      }
    } else if (btn.type === 'track') {
      const track = btn.refId ? getObj('jukeboxtrack', btn.refId) : null;
      const isPlaying = track?.get('playing');

      if (btn.refId && track) {
        labelText = `${track.get('title')}${isPlaying ? ' ♬' : ''}`;
        action = `!director --toggle-track|${btn.refId}`;
        tooltipAttr = ` title="${track.get('title')}"`;
      } else {
        action = `!director --check-or-assign-track|${btn.id}`;
        labelText = `New Track`;
        tooltipAttr = ` title="Assign or play track"`;
      }
    } else {
      action = `!director --item-placeholder|${btn.id}`;
      tooltipAttr = ` title="Item placeholder"`;
    }

    const editControls = isEditMode
      ? `
        <a href="!director --redefine-item|${btn.id}" title="Redefine" style="${css.utilityEditButton}">${Pictos('p')}</a>
        <a href="!director --delete-item|${btn.id}" title="Delete" style="${css.utilityEditButton}">${Pictos('#')}</a>
      `
      : '';

    return `
      <div style="${css.itemRow}">
        <a href="${action}" style="${css.itemButton}"${tooltipAttr}>
          ${getBadge(btn.type, css)} <span style="${css.forceTextColor}">${labelText}</span> ${editControls}
        </a>
      </div>
    `;
  }).join('');
};

// Helper to reorder keys in an object according to new order array
const reorderObjectKeys = (obj, keyOrder) => {
  const newObj = {};
  for (const key of keyOrder) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
};

function moveActUp(actName) {
  const st = getState();
  const keys = st.actsOrder || Object.keys(st.acts);
  const idx = keys.indexOf(actName);
  if (idx <= 0) return;

  const newKeys = [...keys];
  [newKeys[idx - 1], newKeys[idx]] = [newKeys[idx], newKeys[idx - 1]];

  const reordered = {};
  newKeys.forEach(k => (reordered[k] = st.acts[k]));
  st.acts = reordered;

  st.actsOrder = newKeys;  // Update the order array

  updateState(st);
  updateHandout();
}

function moveActDown(actName) {
  const st = getState();
  const keys = st.actsOrder || Object.keys(st.acts);
  const idx = keys.indexOf(actName);
  if (idx === -1 || idx >= keys.length - 1) return;

  const newKeys = [...keys];
  [newKeys[idx], newKeys[idx + 1]] = [newKeys[idx + 1], newKeys[idx]];

  const reordered = {};
  newKeys.forEach(k => (reordered[k] = st.acts[k]));
  st.acts = reordered;

  st.actsOrder = newKeys;  // Update the order array

  updateState(st);
  updateHandout();
}
function moveSceneUp(actName, sceneName) {
  const st = getState();
  const act = st.acts?.[actName];
  if (!act || !act.scenes?.hasOwnProperty(sceneName)) return;

  const actKeys = st.actsOrder || Object.keys(st.acts);
  const expanded = st.actsExpanded || {};
  const scenes = act.scenes;
  const sceneKeys = act.scenesOrder || Object.keys(scenes);
  const idx = sceneKeys.indexOf(sceneName);
  if (idx === -1) return;

  if (idx > 0) {
    const newSceneKeys = [...sceneKeys];
    [newSceneKeys[idx - 1], newSceneKeys[idx]] = [newSceneKeys[idx], newSceneKeys[idx - 1]];

    const reordered = {};
    newSceneKeys.forEach(k => (reordered[k] = scenes[k]));
    act.scenes = reordered;
    act.scenesOrder = newSceneKeys;
  } else {
    // Find previous expanded act
    const actIdx = actKeys.indexOf(actName);
    for (let i = actIdx - 1; i >= 0; i--) {
      const prevActName = actKeys[i];
      if (expanded[prevActName]) {
        const prevAct = st.acts[prevActName];
        if (!prevAct) return;

        prevAct.scenes = { ...prevAct.scenes, [sceneName]: scenes[sceneName] };
        act.scenes = { ...scenes };
        delete act.scenes[sceneName];

        prevAct.scenesOrder = Object.keys(prevAct.scenes);
        act.scenesOrder = Object.keys(act.scenes);
        break;
      }
    }
  }

  updateState(st);
  updateHandout();
}

function moveSceneDown(actName, sceneName) {
  const st = getState();
  const act = st.acts?.[actName];
  if (!act || !act.scenes?.hasOwnProperty(sceneName)) return;

  const actKeys = st.actsOrder || Object.keys(st.acts);
  const expanded = st.actsExpanded || {};
  const scenes = act.scenes;
  const sceneKeys = act.scenesOrder || Object.keys(scenes);
  const idx = sceneKeys.indexOf(sceneName);
  if (idx === -1) return;

  if (idx < sceneKeys.length - 1) {
    const newSceneKeys = [...sceneKeys];
    [newSceneKeys[idx], newSceneKeys[idx + 1]] = [newSceneKeys[idx + 1], newSceneKeys[idx]];

    const reordered = {};
    newSceneKeys.forEach(k => (reordered[k] = scenes[k]));
    act.scenes = reordered;
    act.scenesOrder = newSceneKeys;
  } else {
    // Find next expanded act
    const actIdx = actKeys.indexOf(actName);
    for (let i = actIdx + 1; i < actKeys.length; i++) {
      const nextActName = actKeys[i];
      if (expanded[nextActName]) {
        const nextAct = st.acts[nextActName];
        if (!nextAct) return;

        nextAct.scenes = { [sceneName]: scenes[sceneName], ...nextAct.scenes };
        act.scenes = { ...scenes };
        delete act.scenes[sceneName];

        nextAct.scenesOrder = Object.keys(nextAct.scenes);
        act.scenesOrder = Object.keys(act.scenes);
        break;
      }
    }
  }

  updateState(st);
  updateHandout();
}

function moveImageUp(imageId) {
  const st = getState();
  const currentScene = st.activeScene;
  if (!currentScene) return;

  const scene = Object.values(st.acts).flatMap(a => Object.values(a.scenes || {})).find(s => s && s.images?.some(img => img.id === imageId));
  if (!scene) return;

  const idx = scene.images.findIndex(img => img.id === imageId);
  if (idx > 0) {
    const newImages = [...scene.images];
    [newImages[idx - 1], newImages[idx]] = [newImages[idx], newImages[idx - 1]];
    scene.images = newImages;
    updateState(st);
    updateHandout();
  }
}

function moveImageDown(imageId) {
  const st = getState();
  const currentScene = st.activeScene;
  if (!currentScene) return;

  const scene = Object.values(st.acts).flatMap(a => Object.values(a.scenes || {})).find(s => s && s.images?.some(img => img.id === imageId));
  if (!scene) return;

  const idx = scene.images.findIndex(img => img.id === imageId);
  if (idx < scene.images.length - 1) {
    const newImages = [...scene.images];
    [newImages[idx], newImages[idx + 1]] = [newImages[idx + 1], newImages[idx]];
    scene.images = newImages;
    updateState(st);
    updateHandout();
  }
}



const initializeOrderArrays = (st) => {
  if (!st.actsOrder) {
    st.actsOrder = Object.keys(st.acts || {});
  }

  for (const actName of st.actsOrder) {
    const act = st.acts[actName];
    if (act && !act.scenesOrder) {
      act.scenesOrder = Object.keys(act.scenes || {});
    }
  }
};

const overlayButtonsContainer = `
  <div style="
    position: absolute; 
    top: 4px; 
    right: 4px; 
    z-index: 10;
    white-space: nowrap;
  ">
    <!-- Buttons go here -->
  </div>
`;

const getTrackNameById = (id) => {
  const track = findObjs({ type: 'jukeboxtrack', id })[0];
  return track ? track.get('title') : 'Unknown Track';
};

const isTrackPlaying = (id) => {
  const track = findObjs({ type: 'jukeboxtrack', id })[0];
  return track && track.get('playing');
};






// --- Handout Update ---
const updateHandout = () => {
  const css = getCSS();
  const st = getState();

  const handout = findObjs({ type: 'handout', name: 'Director' })[0];
  if (!handout) return;

  // === Help Mode ===
  if (st.helpMode) {
    const html = `
      <div style="width:100%;">
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td colspan="3" style="${css.header}">
              Director
              <a href="!director --toggle-help" style="${css.headerButton}">Exit Help</a>
              <a href="!director --make-help-handout" style="${css.headerButton}">Make Help Handout</a>
            </td>
          </tr>
        </table>
        ${renderHelpHtml(css)}
      </div>
    `;
    return handout.set({ notes: html });
  }



for (const actName of Object.keys(st.acts)) {
  const act = st.acts[actName];
  const sceneKeys = Object.keys(act.scenes || {});
  const orderKeys = act.scenesOrder || [];
  const badKeys = orderKeys.filter(name => !sceneKeys.includes(name));
  if (badKeys.length > 0) {
    log(`Mismatch in "${actName}": scenesOrder contains invalid keys:`, badKeys);
  }
}





  if (!st.acts) st.acts = {};
  initializeOrderArrays(st);


  const actsExpanded = st.actsExpanded || {};
  const activeScene = st.activeScene;
  const isEditMode = !!st.items?.editMode;

let scenesObj = {};
for (const actName of st.actsOrder || Object.keys(st.acts)) {
  const act = st.acts[actName];
  if (!act || !act.scenes) continue;
  if (Object.prototype.hasOwnProperty.call(act.scenes, activeScene)) {
    scenesObj = act.scenes;
    break;
  }
}


  let actsHtml = '';
  for (const actName of st.actsOrder) {
    if (!(actName in st.acts)) continue;  // skip if missing act due to deletion

    const expanded = !!actsExpanded[actName];
    const caret = expanded ? '▼' : '▶';

    // === Act-level edit controls ===
    const actControls = isEditMode
      ? `
<a href="!director --rename-act|${actName}|?{New Act Name}" title="Rename Act" style="${css.utilityEditButton}">${Pictos('p')}</a>
<a href="!director --delete-act-confirm|?{Are you sure you want to delete act &quot;${actName}&quot;? This will delete all scenes and assets within this act. This cannot be undone.|Delete|Cancel}|${actName}" 
   title="Delete Act" style="${css.utilityEditButton}">
  ${Pictos('#')}
</a>
<a href="!director --move-act-up|${actName}" title="Move Act Up" style="${css.utilityEditButton}">${Pictos('{')}</a>
<a href="!director --move-act-down|${actName}" title="Move Act Down" style="${css.utilityEditButton}">${Pictos('}')}</a>
      `
      : '';

actsHtml += `
  <div style="margin-bottom: 4px; position: relative;">
    <a href="!director --toggle-act|${encodeURIComponent(actName)}" 
       title="Expand/Collapse Act"
       style="${css.actContainer} text-decoration: none;">
      <span style="position: absolute; left: 6px; top: 4px; margin-right:5px;">${caret}</span>
      <span style="margin-left: 16px; cursor:pointer;">${actName}</span>
    </a>
    <a href="!director --new-scene|${encodeURIComponent(actName)}|?{Scene Name}" 
       title="Add a new scene to this act"
       style="${css.utilitySubButton}; position: absolute; right: 6px; top: 5px;">+</a>
    ${actControls}
`;

    if (expanded) {
      const act = st.acts[actName];
      const scenes = act.scenes || {};
      const scenesOrder = act.scenesOrder || Object.keys(scenes);

      actsHtml += '<div style="margin-left: 20px; margin-top: 4px;">';
      for (const sceneName of scenesOrder) {
        if (!(sceneName in scenes)) continue;  // skip if scene missing

        const isActiveScene = sceneName === activeScene;

        // === Scene-level edit controls ===
        const sceneControls = isEditMode
          ? `
            <a href="!director --rename-scene|${actName}|${sceneName}|?{New Scene Name}" title="Rename Scene" style="${css.utilityEditButton}">${Pictos('p')}</a>
<a href="!director --delete-scene-confirm|?{Are you sure you want to delete scene &quot;${sceneName}&quot; in act &quot;${actName}&quot;? This cannot be undone.|Delete|Cancel}|${actName}|${sceneName}" 
   title="Delete Scene" style="${css.utilityEditButton}">
  ${Pictos('#')}
</a>
            <a href="!director --move-scene-up|${actName}|${sceneName}" title="Move Scene Up" style="${css.utilityEditButton}">${Pictos('{')}</a>
            <a href="!director --move-scene-down|${actName}|${sceneName}" title="Move Scene Down" style="${css.utilityEditButton}">${Pictos('}')}</a>          `
          : '';

        actsHtml += `
          <a href="!director --set-active-scene|${encodeURIComponent(actName)}|${encodeURIComponent(sceneName)}"title="Display This Scene"
             style="${isActiveScene ? css.sceneButtonActive : css.sceneButtonInactive}; position:relative;">
            ${sceneName}
            ${sceneControls}
          </a>
        `;
      }
      actsHtml += '</div>';
    }
    actsHtml += '</div>';
  }

  const getImageUrl = (img) => {
    if (!img.url || typeof img.url !== 'string') return '';
    return img.url.replace(/(thumb|med|original)/, 'max');
  };

const imagesHTML = (() => {
  if (!activeScene) return '<div>No active scene.</div>';
  const images = scenesObj[activeScene]?.images || [];
  if (images.length === 0) return '<div>No images yet</div>';

  return images.map(img => `
    <div style="${css.imageContainer}" data-id="${img.id}">
      <div style="${css.imageBoxWrapper}; position: relative;">
        <a href="!director --set-image-title|${img.id}|?{New title}" style="${css.imageTitleOverlay}">${img.title || 'Untitled'}</a>
        <div style="${css.imageDiv}; background-image: url('${getImageUrl(img)}'); position: relative;">
          <!-- Top-right overlay edit buttons (only in edit mode) -->
          ${isEditMode ? `
            <div style="position: absolute; top: 4px; right: 4px; z-index: 11; white-space: nowrap;">
<a href="!director --move-image-up|${img.id}" style="${css.utilityEditButtonOverlay}">${Pictos('{')}</a>
<a href="!director --move-image-down|${img.id}" style="${css.utilityEditButtonOverlay}">${Pictos('}')}</a>
              <a href="!director --recapture-image|${img.id}" style="${css.utilityEditButtonOverlay}">${Pictos('R')}</a>
              <a href="!director --delete-image|${img.id} ?{Are you sure?|Delete|Cancel}" style="${css.utilityEditButtonOverlay}">${Pictos('#')}</a>
            </div>
          ` : ''}

          <!-- Bottom-right persistent overlay buttons for backdrop, highlight, and track -->
<div style="position: absolute; bottom: 4px; right: 4px; z-index: 10; white-space: nowrap;">
  <a href="!director --highlight|${img.id}" style="${img.type === 'highlight' && img.id !== scenesObj[activeScene].backdropId ? css.utilitySubButtonActive : css.utilitySubButtonInactive}">${Pictos('|')}</a>
  <a href="!director --set-backdrop|${img.id}" style="${img.id === scenesObj[activeScene].backdropId ? css.utilitySubButtonActive : css.utilitySubButtonInactive}">${Pictos('`')}</a>

  <!-- Music note icon (assign / play) -->
  ${
    img.trackId
      ? `<a href="!director --toggle-image-track|${img.id}" title="${getTrackNameById(img.trackId)}"
           style="${isTrackPlaying(img.trackId) ? css.trackButtonPlaying : css.trackButtonNormal}">
             ${Pictos('m')}
         </a>`
      : `<a href="!director --assign-image-track|${img.id}" title="Click to assign a playing track"
           style="${css.trackButtonGhosted}">${Pictos('m')}</a>`
  }

  <!-- Edit-mode only delete button -->
  ${isEditMode && img.trackId
    ? `<a href="!director --remove-image-track|${img.id}" title="Remove track" style="${css.trackButtonEdit}">${Pictos('dm')}</a>`
    : ''
  }
</div>

        </div>
      </div>
    </div>
  `).join('');
})();



  const html = `
    <div style="width:100%;">
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td colspan="3" style="${css.header}">
            Director

<div    style="${css.headerContainer}">
Set as 
<a href="!director --set-grid" 
   style="${css.headerSubButton}" 
   title="Place all Current Scene's Images on the page in a grid. All Characters are off to the right.">
  Grid
</a>
<a href="!director --set-scene" 
   style="${css.headerSubButton}" 
   title="Place the Current Scene's Images and Characters on the Map">
  Scene
</a>
</div>
<a href="!director --wipe-scene" 
   style="${css.headerButton}" 
   title="Clear Map of Images and Characters">
  Wipe the Scene
</a>
<a href="!director --stop-audio" 
   style="${css.headerButton}" 
   title="Stop all currently playing audio tracks">
  Stop Audio
</a>
${getJukeboxPlusHandoutLink()}

 <a href="!director --toggle-help" style="${css.headerButton}" title="Toggle Help Mode">
  ${st.helpMode ? 'Exit Help' : 'Help'}
</a>
<a href="!director --toggle-edit-mode" style="${css.headerButton}" title="Toggle Edit Mode">
 
    ${Pictos(st.items?.editMode ? ')' : '(')}
  </a>         </td>
        </tr>
        <tr>
          <td style="${css.sidebar}">
            <div style="${css.columnHeader}">
              Acts
              <a href="!director --new-act|?{Act name}" style="${css.utilitySubButton}">+ Add Act</a>
            </div>
            <div>${actsHtml}</div>

            <hr style="border:0; border-top:1px solid ${st.settings.mode === 'dark' ? '#444' : '#666'}; margin:10px 0;">

            <div>
              <a href="!director --toggle-settings" style="${css.settingsButton}">
                Settings ${st.settings.settingsExpanded ? '▴' : '▾'}
              </a>
              ${st.settings.settingsExpanded ? `
                <div style="${css.utilityContainer}">
                  Mode
                  <a href="!director --mode|dark" style="${css.utilitySubButton}">Dark</a>
                  <a href="!director --mode|light" style="${css.utilitySubButton}">Light</a>
                </div>
                <div style="${css.utilityContainer}">
                  Backup
                  <a href="!director --backup" style="${css.utilitySubButton}">make</a>
                  <a href="!director --restore|?{Which backup?|Director Backup 001}" style="${css.utilitySubButton}">restore</a>
                </div>
                <a href="!director --repair-orders" style="${css.utilityButton}">↻ Repair</a>
              ` : ''}
            </div>
          </td>
          <td style="${css.images}">
<div style="${css.columnHeader}">
  Images
  <a href="!director --new-image" style="${css.utilitySubButton}" title="Add a new image to this scene">+ Add Image</a>
  <a href="!director --toggle-mute" 
     style="${css.utilitySubButton}; background-color: ${st.settings.muteBackdropAudio ? 'red' : css.utilitySubButtonBackground};"
     title="${st.settings.muteBackdropAudio ? 'Unmute Automatic Backdrop Audio' : 'Mute Automatic Backdrop Audio'}">
    ${Pictos('m')}
  </a>
</div>


            ${imagesHTML}
          </td>
          <td style="${css.items}">
            <div style="${css.columnHeader}">
              Items ${renderFilterBarInline(css)}

            </div>
${renderItemsList(css)}

          </td>
        </tr>
      </table>
    </div>`;


  handout.set({ notes: html });
};



// Jukebox Handler
on('change:jukeboxtrack', () => {
  updateHandout(); // Refresh labels to reflect play status
});



// --- Main Chat Handler ---

on('chat:message', (msg) => {
  if (msg.type !== 'api') return;
if (!msg.playerid || !playerIsGM(msg.playerid)) {
  //sendStyledMessage('Access Denied', 'Only the GM can use Director commands.');
  return;
}
  const playerid = msg.playerid;

  const input = msg.content;
  if (!input.startsWith('!director')) return;

  const parts = input.split(/\s+--/).slice(1);
  const st = getState(); // assuming getState() returns or initializes state.DirectorScript

  if (!parts.length) {
    const handout = findObjs({ type: 'handout', name: 'Director' })[0] || createObj('handout', { name: 'Director' });
    sendStyledMessage('Director', `[Open the Director Interface](http://journal.roll20.net/handout/${handout.id})`);
    updateHandout();
    return;
  }

  for (const part of parts) {
    const [cmd, ...params] = part.split('|');
    const val = params.join('|').trim();

    switch (cmd.trim()) {
        
        
case 'filter': {
  const filterType = val?.toLowerCase();
  const validTypes = ['handout', 'character', 'track', 'macro', 'table', 'action', 'all'];
  if (!validTypes.includes(filterType)) {
    sendStyledMessage('Director', `Invalid filter type: "${val}".`);
    break;
  }

  st.items = st.items || {};
  st.items.filter = filterType;
  updateHandout();
  break;
}







case 'add-item': {
  const type = val?.toLowerCase();
  const validTypes = ['handout', 'character', 'track', 'macro', 'action', 'table', 'variant'];
  if (!validTypes.includes(type)) {
    sendStyledMessage('Director', `Invalid item type: "${val}".`);
    break;
  }

  st.items = st.items || {};
  st.items.buttons = st.items.buttons || [];
  const activeScene = st.activeScene || null;

  // === TRACK: only assign if one is playing ===
  if (type === 'track') {
    const tracks = findObjs({ _type: 'jukeboxtrack' });
    const playingTracks = tracks.filter(t => t.get('playing'));

    if (playingTracks.length > 0) {
      const track = playingTracks[0];
      st.items.buttons.push({
        id: generateUUID(),
        type: 'track',
        name: track.get('title'),
        refId: track.id,
        scene: activeScene,
      });
      updateHandout();
    } else {
      sendStyledMessage('Add Track', 'No track is currently playing. Start a track before creating a track button.');
    }
    break;
  }

  // === VARIANT: create one button per selected token ===
  if (type === 'variant') {
    if (!msg.selected || !msg.selected.length) {
      sendStyledMessage('Director', 'You must select one or more tokens to define as variants.');
      break;
    }

    const created = [];

    for (const sel of msg.selected) {
      const token = getObj('graphic', sel._id);
      if (!token) continue;

      const rawProps = token.toJSON();
      const cleanedProps = sanitizeTokenProps(rawProps);

      // Marketplace image check (non-blocking)
      const imgsrc = token.get('imgsrc') || '';
      if (imgsrc.includes('/marketplace/')) {
    sendStyledMessage('Marketplace Image Detected', 'This asset uses a marketplace image and may not render correctly on the VTT. A fallback will be used at placement.');
        log(`⚠️ This asset uses a marketplace image and may not render correctly on the VTT. A fallback will be used at placement.`);
      }
log ("imgsrc = " + imgsrc);
      st.items.buttons.push({
        id: generateUUID(),
        type: 'variant',
        name: token.get('name') || 'New Variant',
        refId: token.get('represents') || null,
        tokenProps: cleanedProps,
        scene: activeScene,
      });

      created.push(token.get('name') || 'New Variant');
    }

    updateHandout();

    if (created.length) {
      //sendStyledMessage('Director', `Created ${created.length} variant button${created.length > 1 ? 's' : ''}:<br>${created.join(', ')}`);
    } else {
      sendStyledMessage('Director', 'No valid tokens were selected.');
    }

    break;
  }

  // === DEFAULT: create placeholder for other types ===
  st.items.buttons.push({
    id: generateUUID(),
    type,
    name: `New ${capitalize(type)}`,
    refId: null,
    actionName: null,
    scene: activeScene,
  });

  updateHandout();
  break;
}






case 'toggle-edit-mode': {
  st.items = st.items || {};
  st.items.editMode = !st.items.editMode;
  updateHandout();
  break;
}



case 'redefine-item': {
  const btnId = val;
  const btn = st.items?.buttons?.find(b => b.id === btnId);
  if (!btn) break;

  const defaultName = `New ${capitalize(btn.type)}`;
  btn.name = defaultName;
  btn.refId = null;

  updateHandout();
  break;
}


case 'delete-item': {
  const btnId = val;
  const index = st.items?.buttons?.findIndex(b => b.id === btnId);
  if (index !== -1) {
    st.items.buttons.splice(index, 1);
    updateHandout();
  } else {
    sendStyledMessage('Director', `Item not found for deletion: ${btnId}`);
  }
  break;
}










 

// Handler to assign the selected handout to the button and refresh UI + handout
case 'set-handout': {
  const [btnId, handoutId] = params;
  const btn = st.items?.buttons?.find(b => b.id === btnId);
  const handout = getObj('handout', handoutId);
  if (btn && handout) {
    btn.name = handout.get('name');
    btn.refId = handoutId;
    updateHandout();
  } else {
    sendStyledMessage('Director', `Failed to assign handout "${handoutId}" to item "${btnId}".`);
  }
  break;
}

//QX Needed?
case 'set-character': {
  const [btnId, charId] = params;
  const btn = st.items?.buttons?.find(b => b.id === btnId);
  const char = getObj('character', charId);
  if (btn && char) {
    btn.name = char.get('name');
    btn.refId = charId;
    updateHandout();
  } else {
    sendStyledMessage('Director', `Failed to assign character "${charId}" to item "${btnId}".`);
  }
  break;
}


case 'add-character': {
  const charId = val;
  const char = getObj('character', charId);
  if (!char) {
    sendStyledMessage('Director', `Character ID "${charId}" not found.`);
    break;
  }

  // Check for marketplace image (non-blocking)
  const defaultToken = char.get('defaulttoken');
  if (defaultToken) {
    try {
      const tokenObj = JSON.parse(defaultToken);
      const imgsrc = tokenObj.imgsrc || '';
      if (imgsrc.includes('/marketplace/')) {
    sendStyledMessage('Marketplace Image Detected', 'This asset uses a marketplace image and may not render correctly on the VTT. A fallback will be used at placement.');
        log(`This asset uses a marketplace image and may not render correctly on the VTT. A fallback will be used at placement.`);
      }
    } catch (e) {
      log(`⚠️ Unable to parse default token for character ID ${charId}`);
    }
  }

  const st = getState();
  st.items = st.items || {};
  st.items.buttons = st.items.buttons || [];

  const id = generateUUID();
  const activeScene = st.activeScene || null;

  st.items.buttons.push({
    id,
    type: 'character',
    name: char.get('name'),
    refId: charId,
    actionName: null,
    scene: activeScene
  });

  updateHandout();
  break;
}



case 'add-handout': {
  const handout = getObj('handout', val);
  if (!handout) break;

  const st = getState();
  const id = generateUUID();
  const activeScene = st.activeScene || null;

  st.items.buttons.push({
    id,
    type: 'handout',
    name: handout.get('name'),
    refId: val,
    actionName: null,
    scene: activeScene
  });

  updateHandout();
  break;
}


case 'add-track': {
  const track = getObj('jukeboxtrack', val);
  if (!track) break;

  const st = getState();
  const id = generateUUID();
  const activeScene = st.activeScene || null;

  st.items.buttons.push({
    id,
    type: 'track',
    name: track.get('title'),
    refId: val,
    actionName: null,
    scene: activeScene
  });

  updateHandout();
  break;
}


case 'add-macro': {
  const macro = getObj('macro', val);
  if (!macro) {
     sendStyledMessage('Director', `No Macro Chosen. You must have at least one Macro in your Collections tab.`);
     break;
}
  const st = getState();
  const id = generateUUID();
  const activeScene = st.activeScene || null;

  st.items.buttons.push({
    id,
    type: 'macro',
    name: macro.get('name'),
    refId: val,
    actionName: null,
    scene: activeScene
  });

  updateHandout();
  break;
}


case 'add-table': {
  const table = getObj('rollabletable', val);
  if (!table) {
    sendStyledMessage('Director', `No Rollable Table Chosen. You must have at least one Rollable Table in your Collections tab.`);
    break;
  }

  const st = getState();
  const id = generateUUID();
  const activeScene = st.activeScene || null;

  st.items.buttons.push({
    id,
    type: 'table',
    name: table.get('name'),
    refId: val,
    actionName: null,
    scene: activeScene
  });

  updateHandout();
  break;
}








case 'set-variant-character': {
  if (!msg.selected || msg.selected.length === 0) {
    sendStyledMessage('Director', 'Please select one or more tokens that represent characters.');
    break;
  }

  const activeScene = getActiveScene();
  if (!activeScene) {
    sendStyledMessage('Director', 'No active scene. Please select or create one.');
    break;
  }

  const createdNames = [];

  for (const sel of msg.selected) {
    const token = getObj('graphic', sel._id);
    if (!token) continue;

    const variantBtn = createVariantButtonFromToken(token, activeScene);
    if (!variantBtn) continue;

    st.items.buttons.push(variantBtn);
    createdNames.push(variantBtn.name);
  }

  if (createdNames.length) {
    updateHandout();
    sendStyledMessage('Director', `Created ${createdNames.length} variant button${createdNames.length > 1 ? 's' : ''}:<br>${createdNames.join(', ')}`);
  } else {
    sendStyledMessage('Director', 'No valid tokens were selected or none were linked to characters.');
  }
  break;
}



case 'define-variant': {
  const [btnId] = params;
  const btn = st.items?.buttons?.find(b => b.id === btnId);

  if (!btn || btn.type !== 'variant') {
    sendStyledMessage('Director', `Invalid variant button ID: "${btnId}".`);
    break;
  }

  const selected = msg.selected;
  if (!selected || !selected.length) {
    sendStyledMessage('Director', 'Please select a token to define this variant.');
    break;
  }

  const token = getObj('graphic', selected[0]._id);
  if (!token) {
    sendStyledMessage('Director', 'Selected token could not be found.');
    break;
  }

  // Marketplace image check (non-blocking)
  const imgsrc = token.get('imgsrc') || '';
  if (imgsrc.includes('/marketplace/')) {
    sendStyledMessage('Marketplace Image Detected', 'This asset uses a marketplace image and may not render correctly on the VTT. A fallback will be used at placement.');
    log(`This asset uses a marketplace image and may not render correctly on the VTT. A fallback will be used at placement.`);
  }

  const variantBtn = createVariantButtonFromToken(token, getActiveScene());
  if (!variantBtn) {
    sendStyledMessage('Director', 'Selected token must represent a character.');
    break;
  }

  // Update existing button in place
  btn.refId = variantBtn.refId;
  btn.name = variantBtn.name;
  btn.tokenProps = variantBtn.tokenProps;

  updateHandout();
  sendStyledMessage('Director', `Variant defined as "${btn.name}".`);
  break;
}


case 'set-macro': {
  const [btnId, macroId] = params;
  const btn = st.items?.buttons?.find(b => b.id === btnId);
  const macro = getObj('macro', macroId);
  if (btn && macro) {
    btn.name = macro.get('name');
    btn.refId = macroId;
    updateHandout();
  } else {
    sendStyledMessage('Director', `Failed to assign macro "${macroId}" to item "${btnId}".`);
  }
  break;
}


case 'set-action-character': {
  const [btnId, charId] = params;
  const btn = st.items?.buttons?.find(b => b.id === btnId);
  const char = getObj('character', charId);
  if (btn && char) {
    btn.refId = charId;
    btn.actionName = null;       // reset action selection
    btn.name = `New Action`;     // temporary label until action chosen
    updateHandout();
  } else {
    sendStyledMessage('Director', `Failed to assign character "${charId}" to action item "${btnId}".`);
  }
  break;
}

case 'set-action': {
  const [btnId, actionName] = params;
  const btn = st.items?.buttons?.find(b => b.id === btnId);
  if (btn && btn.refId && actionName) {
    btn.actionName = actionName;
    const char = getObj('character', btn.refId);
    btn.name = `${char ? char.get('name') : 'Unknown'}: ${actionName}`;
    updateHandout();
  } else {
    sendStyledMessage('Director', `Failed to assign action "${actionName}" to item "${btnId}".`);
  }
  break;
}



case 'run-action': {
  const btnId = val;
  const btn = st.items?.buttons?.find(b => b.id === btnId);
  if (btn && btn.refId && btn.actionName) {
    // Find ability on character matching actionName
    const abilities = findObjs({
      _type: 'ability',
      _characterid: btn.refId,
      name: btn.actionName,
    });

    if (abilities.length) {
      const ability = abilities[0];
      const actionText = ability.get('action');
      if (actionText && actionText.trim().length > 0) {

        sendChat('GM', actionText);

      } else {
        sendStyledMessage('Director', `Ability "${btn.actionName}" has no action text.`);
      }
    } else {
      sendStyledMessage('Director', `Ability "${btn.actionName}" not found on character.`);
    }
  } else {
    sendStyledMessage('Director', `Invalid action button or not fully defined.`);
  }
  break;
}



case 'roll-table': {
  const tableId = val;
  const table = getObj('rollabletable', tableId);
  if (table) {
    // Roll the table with a whisper using the default roll template and the table name
    sendChat('Director', `/w gm &{template:default} {{name=${table.get('name')}}} {{=[[1t[${table.get('name')}]]]}}`);
    sendStyledMessage(table.get('name'), `=[[1t[${table.get('name')}]]]`);
  }
  break;
}

case 'set-table': {
  const [btnId, tableId] = params;
  const btn = st.items?.buttons?.find(b => b.id === btnId);
  const table = getObj('rollabletable', tableId);
  if (btn && table) {
    btn.name = table.get('name');
    btn.refId = tableId;
    updateHandout();
  } else {
    sendStyledMessage('Director', `Failed to assign table "${tableId}" to item "${btnId}".`);
  }
  break;
}


case 'run-macro': {
  const macroId = val;
  const macro = getObj('macro', macroId);
  if (macro) {
    sendChat('GM', macro.get('action'));
  } else {
    sendStyledMessage('Director', `Macro not found: ${macroId}`);
  }
  break;
}




case 'check-or-assign-track': {
  const btnId = val;
  const btn = st.items?.buttons?.find(b => b.id === btnId);
  const tracks = findObjs({ _type: 'jukeboxtrack' });
  const playingTracks = tracks.filter(t => t.get('playing'));
  if (!btn) break;



  if (playingTracks.length > 0) {
    const track = playingTracks[0];
    btn.name = track.get('title');
    btn.refId = track.id;
    updateHandout();
  } else {
    const options = tracks
      .sort((a, b) => a.get('title').localeCompare(b.get('title')))
      .map(t => `${t.get('title')},${t.id}`)
      .join('|');

    const queryCmd = `!director --set-track|${btnId}|?{Select Track|${options}}`;
    sendChat('Director', queryCmd);
  }

  break;
}

case 'set-track': {
  const [btnId, trackId] = params;
  const btn = st.items?.buttons?.find(b => b.id === btnId);
  const track = getObj('jukeboxtrack', trackId);

  if (btn && track) {
    btn.name = track.get('title');
    btn.refId = trackId;
    updateHandout();
  } else {
    sendStyledMessage('Director', `Failed to assign track "${trackId}" to item "${btnId}".`);
  }
  break;
}

case 'toggle-track': {
  const trackId = val;
  const track = getObj('jukeboxtrack', trackId);
  const allTracks = findObjs({ _type: 'jukeboxtrack' });

  if (!track) {
    sendStyledMessage('Director', `Track not found: ${trackId}`);
    break;
  }

  const isPlaying = track.get('playing');

  track.set('playing', !isPlaying); // Start or stop this one

  updateHandout();
  break;
}







case 'set-scene': {
  handleSetScene(msg.playerid);
  break;
}


case 'set-backdrop': {
  const imageId = val;
  const st = getState();
  const currentScene = st.activeScene;
  if (!currentScene) break;

  let scene = null;
  for (const act of Object.values(st.acts)) {
    if (act.scenes?.[currentScene]) {
      scene = act.scenes[currentScene];
      break;
    }
  }
  if (!scene) break;

  const newBackdrop = scene.images.find(img => img.id === imageId);
  if (!newBackdrop) {
    sendStyledMessage('Set Backdrop', `Could not find image with ID ${imageId}.`);
    break;
  }

  // Stop track for the current backdrop if it has one
  const oldBackdrop = scene.images.find(img => img.id === scene.backdropId);
  if (oldBackdrop?.trackId) {
    const oldTrack = getObj('jukeboxtrack', oldBackdrop.trackId);
    if (oldTrack?.get('playing')) {
      oldTrack.set('playing', false);
    }
  }

  const pid = getPageForPlayer(playerid);
  if (!pid) {
    sendStyledMessage('Set Backdrop', 'No valid page found for your view.');
    break;
  }

  const page = getObj('page', pid);
  if (!page) {
    sendStyledMessage('Set Backdrop', 'Page object could not be found.');
    break;
  }

  const existingPaths = findObjs({ _type: 'pathv2', _pageid: pid, layer: 'walls' });
  const blockingPaths = existingPaths.filter(p => p.get('stroke') === '#84d162');
  if (blockingPaths.length > 0) {
    sendStyledMessage('Set Backdrop', `Cannot set backdrop. Please wipe the scene and use the Set as Scene command in order to use backdrops.`);
    break;
  }


  const pageWidth = page.get('width') * 70;
  const pageHeight = page.get('height') * 70;
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;

  // Find existing backdrop graphic (by matching imgsrc OR name)
  const allGraphics = findObjs({ _type: 'graphic', _pageid: pid, layer: 'map' });
  const cleanNewUrl = cleanImg(newBackdrop.url);
  let targetGraphic = allGraphics.find(g => cleanImg(g.get('imgsrc')) === cleanImg(oldBackdrop?.url));
  if (!targetGraphic && oldBackdrop?.title) {
    targetGraphic = allGraphics.find(g => g.get('name') === oldBackdrop.title);
  }

  if (targetGraphic) {
    const maxWidth = pageWidth - 140;
    const maxHeight = pageHeight - 140;
    const dims = getScaledToFit(newBackdrop.ratio, maxWidth, maxHeight);

    targetGraphic.set({
      imgsrc: cleanNewUrl,
      width: dims.w,
      height: dims.h,
      left: centerX,
      top: centerY,
      name: newBackdrop.title || 'Backdrop',
    });
  }

  // Set the new backdrop
  scene.backdropId = imageId;
  const idx = scene.images.findIndex(img => img.id === imageId);
  if (idx > 0) {
    const [backdrop] = scene.images.splice(idx, 1);
    scene.images.unshift(backdrop);
  }

  // ✅ If the new backdrop has a track, start playing it — unless muted
  if (newBackdrop.trackId && !st.settings.muteBackdropAudio) {
    const newTrack = getObj('jukeboxtrack', newBackdrop.trackId);
    if (newTrack && !newTrack.get('playing')) {
      newTrack.set('playing', true);
    }
  }

  updateState(st);
  updateHandout();
  break;
}


case 'wipe-scene': {
  const st = getState();

  // Stop any playing tracks
  const tracks = findObjs({ _type: 'jukeboxtrack' });
  tracks.forEach(track => {
    if (track.get('playing')) {
      track.set('playing', false);
    }
  });

  const currentScene = st.activeScene;
  if (!currentScene) {
    sendStyledMessage('Wipe Scene', 'No active scene selected.');
    break;
  }

  wipeScene(currentScene, msg.playerid);  // Pass playerid from msg
  break;
}

case 'set-grid':
  handleSetGrid(playerid);
  break;


      case 'open-handout': {
        const handoutId = val;
        const handout = getObj('handout', handoutId);
        if (handout) handout.showToPlayers();
        break;
      }

      case 'item-placeholder': {
        const btnId = val;
        const btn = st.items?.buttons?.find(b => b.id === btnId);
        if (btn) {
          sendStyledMessage('Not Implemented', `This is a placeholder for a <b>${btn.type}</b> item.`, 'warning');
        }
        break;
      }
      
      case 'toggle-act': {
const actName = decodeURIComponent(val);
        st.actsExpanded = st.actsExpanded || {};
        st.actsExpanded[actName] = !st.actsExpanded[actName];
        updateHandout();
        break;
      }

case 'new-act': {
  const actName = decodeURIComponent(params[0] || '') || `Act ${Object.keys(st.acts).length + 1}`;
  if (st.acts[actName]) {
    sendStyledMessage('Director', `Act "${actName}" already exists.`);
    break;
  }
  st.acts[actName] = { scenes: {}, scenesOrder: [] };

  if (!Array.isArray(st.actsOrder)) st.actsOrder = [];
  st.actsOrder.push(actName);

  st.activeAct = actName;
  updateState(st);
  updateHandout();
  break;
}


case 'new-scene': {
  if (params.length >= 2) {
    const actName = decodeURIComponent(params[0]);
    const sceneName = decodeURIComponent(params[1]);
    const act = st.acts[actName];
    if (!act) {
      sendStyledMessage('Director', `Act "${actName}" not found.`);
      break;
    }

    if (act.scenes[sceneName]) {
      sendStyledMessage('Director', `Scene "${sceneName}" already exists in act "${actName}".`);
      break;
    }

    act.scenes[sceneName] = { images: [], items: [], backdropId: null };
    if (!Array.isArray(act.scenesOrder)) act.scenesOrder = [];
    act.scenesOrder.push(sceneName);

    st.activeScene = sceneName;
    updateState(st);
    updateHandout();
    break;
  }

  const activeAct = getActiveAct();
  if (!activeAct) {
    sendStyledMessage('Director', 'No active act. Create an act first.');
    break;
  }

  const act = st.acts[activeAct];
  const sceneName = val || `Scene ${Object.keys(act.scenes).length + 1}`;
  if (act.scenes[sceneName]) {
    sendStyledMessage('Director', `Scene "${sceneName}" already exists in act "${activeAct}".`);
    break;
  }

  act.scenes[sceneName] = { images: [], items: [], backdropId: null };
  if (!Array.isArray(act.scenesOrder)) act.scenesOrder = [];
  act.scenesOrder.push(sceneName);

  st.activeScene = sceneName;
  updateState(st);
  updateHandout();
  break;
}
 

 case 'set-active-scene': {
  const [actName, sceneName] = params.map(decodeURIComponent);
  if (!actName || !sceneName) {
    sendStyledMessage('Director', 'Both act and scene must be specified.');
    break;
  }
  const act = state[stateName].acts[actName];
  if (!act || !act.scenes[sceneName]) {
    sendStyledMessage('Director', `Scene "${sceneName}" not found in act "${actName}".`);
    break;
  }
  state[stateName].activeScene = sceneName;
  updateHandout();
  break;
}


case 'rename-act': {
  const oldName = params[0]?.trim();
  const newName = params[1]?.trim();
  if (!oldName || !newName) {
    sendStyledMessage('Rename Act', 'You must provide both the old and new act names.');
    break;
  }

  const st = getState();
  if (!st.acts?.[oldName]) {
    sendStyledMessage('Rename Act', `Act "${oldName}" not found.`);
    break;
  }

  if (st.acts[newName]) {
    sendStyledMessage('Rename Act', `An act named "${newName}" already exists.`);
    break;
  }

  // Rename act key
  st.acts[newName] = st.acts[oldName];
  delete st.acts[oldName];

  // Update actsOrder array
  if (st.actsOrder && Array.isArray(st.actsOrder)) {
    const idx = st.actsOrder.indexOf(oldName);
    if (idx !== -1) {
      st.actsOrder[idx] = newName;
    }
  }

  // Update actsExpanded keys if needed
  if (st.actsExpanded?.[oldName]) {
    st.actsExpanded[newName] = true;
    delete st.actsExpanded[oldName];
  }

  // Active scene fix is fine but redundant
  if (st.activeScene && st.acts[newName].scenes?.[st.activeScene]) {
    st.activeScene = st.activeScene;
  }

  updateState(st);
  updateHandout();
  sendStyledMessage('Rename Act', `Renamed act <b>${oldName}</b> to <b>${newName}</b>.`);
  break;
}

case 'rename-scene': {
  const actName = params[0]?.trim();
  const oldSceneName = params[1]?.trim();
  const newSceneName = params[2]?.trim();

  const st = getState();

  if (!actName || !oldSceneName || !newSceneName) {
    sendStyledMessage('Rename Scene', 'You must provide act name, old scene name, and new scene name.');
    break;
  }

  const act = st.acts?.[actName];
  if (!act) {
    sendStyledMessage('Rename Scene', `Act "${actName}" not found.`);
    break;
  }

  const scenes = act.scenes;
  if (!scenes?.[oldSceneName]) {
    sendStyledMessage('Rename Scene', `Scene "${oldSceneName}" not found in act "${actName}".`);
    break;
  }

  if (scenes[newSceneName]) {
    sendStyledMessage('Rename Scene', `Scene "${newSceneName}" already exists in act "${actName}".`);
    break;
  }

  // Rename scene key
  scenes[newSceneName] = scenes[oldSceneName];
  delete scenes[oldSceneName];

  // Update scenesOrder array
  if (act.scenesOrder && Array.isArray(act.scenesOrder)) {
    const idx = act.scenesOrder.indexOf(oldSceneName);
    if (idx !== -1) {
      act.scenesOrder[idx] = newSceneName;
    }
  }

  if (st.activeScene === oldSceneName) {
    st.activeScene = newSceneName;
  }

  updateState(st);
  updateHandout();
  sendStyledMessage('Rename Scene', `Renamed scene <b>${oldSceneName}</b> to <b>${newSceneName}</b> in act <b>${actName}</b>.`);
  break;
}




case 'delete-scene-confirm': {
  const [choice, actName, sceneName] = val.split('|');
  if (choice === 'Cancel') {
    sendStyledMessage('Director', 'Delete scene cancelled.');
    break;
  }
  if (choice === 'Delete') {
    deleteScene(actName, sceneName);
    updateHandout();
  }
  break;
}

case 'delete-act-confirm': {
  const [choice, actName] = val.split('|');
  if (choice === 'Cancel') {
    sendStyledMessage('Director', 'Delete act cancelled.');
    break;
  }
  if (choice === 'Delete') {
    deleteAct(actName);
    updateHandout();
  }
  break;
}



case 'move-act-up': {
  moveActUp(val);
  break;
}
case 'move-act-down': {
  moveActDown(val);
  break;
}
case 'move-scene-up': {
  const [actName, sceneName] = val.split('|');
  if (actName && sceneName) moveSceneUp(actName, sceneName);
  break;
}
case 'move-scene-down': {
  const [actName, sceneName] = val.split('|');
  if (actName && sceneName) moveSceneDown(actName, sceneName);
  break;
}

case 'move-image-up': {
  moveImageUp(val);
  break;
}
case 'move-image-down': {
  moveImageDown(val);
  break;
}






case 'stop-audio': {
  const tracks = findObjs({ _type: 'jukeboxtrack' });
  tracks.forEach(track => {
    if (track.get('playing')) {
      track.set('playing', false);
    }
  });
    updateHandout();
  break;
}


case 'new-image': {
  const css = getCSS();
  const activeAct = getActiveAct();
  const sceneName = getActiveScene();
  if (!activeAct || !sceneName) {
    sendStyledMessage('Director', 'No active scene. Create at least one act and one scene first.');
    break;
  }

  if (!msg.selected || msg.selected.length !== 1) {
    const urlButton = `<a href="!director --add-image-url|?{Enter a valid image URL}" style="${css.utilitySubButton}">Enter URL</a>`;
    sendStyledMessage('Director', `Please select exactly one graphic to add as an image.<br><br>Alternatively, you may press this button and enter a valid URL.<br>Image URLs must be of graphics in a user library.<br>${urlButton}<br>`);
    break;
  }

  const token = getObj('graphic', msg.selected[0]._id);
  if (!token) {
    sendStyledMessage('Director', 'Selected graphic not found.');
    break;
  }

  const url = token.get('imgsrc').replace(/(thumb|med|original)/, 'max');

  // Warn if marketplace asset
  if (url.includes('/marketplace/')) {
    sendStyledMessage('Marketplace Image Detected', 'Image URL references a marketplace asset and will be skipped when setting the scene.');
    log(`Image URL includes a marketplace asset and will be skipped when setting the scene.`);
  }

  const width = token.get('width');
  const height = token.get('height');
  const ratio = height / width;
  const id = generateRowID();
  const title = token.get('name')?.trim() || 'New Image';

  st.acts[activeAct].scenes[sceneName].images.push({
    id,
    url,
    ratio,
    type: 'highlight',
    title
  });

  updateHandout();
  break;
}

case 'add-image-url': {
  const activeAct = getActiveAct();
  const sceneName = getActiveScene();
  if (!activeAct || !sceneName) {
    sendStyledMessage('Director', 'No active scene. Create at least one act and one scene first.');
    break;
  }

  if (!val || !/^https:\/\/(s3\.amazonaws\.com|files\.d20\.io)\/.*\.(png|jpe?g|gif|webm)(\?.*)?$/.test(val)) {
    sendStyledMessage('Director', 'Invalid image URL. Must be a Roll20-hosted image (e.g., uploaded to your user library, a character bio, or a forum post).');
    break;
  }

  // Warn if using marketplace asset
  if (val.includes('/marketplace/')) {
    sendStyledMessage('Marketplace Image Detected', 'Image URL references a marketplace asset and will be skipped when setting the scene.');
    log(`Image URL includes a marketplace asset and will be skipped when setting the scene.`);
  }

  const id = generateRowID();

  st.acts[activeAct].scenes[sceneName].images.push({
    id,
    url: val,
    ratio: 1, // fallback; user may want to edit later
    type: 'highlight',
    title: 'New Image'
  });

  updateHandout();
  break;
}



      case 'set-image-title': {
        const [id, ...titleParts] = params;
        const newTitle = titleParts.join('|').trim() || val;
        if (!id) {
          sendStyledMessage('Director', 'Please provide an image ID and a new title.');
          break;
        }
        const activeAct = getActiveAct();
        const activeScene = getActiveScene();
        if (!activeAct || !activeScene) {
          sendStyledMessage('Director', 'No active scene.');
          break;
        }
        const img = st.acts[activeAct].scenes[activeScene].images.find(i => i.id === id);
        if (!img) {
          sendStyledMessage('Director', `Image ID "${id}" not found.`);
          break;
        }
        img.title = newTitle;
        updateHandout();
        break;
      }

      case 'set-backdrop': {
        const id = val;
        const activeAct = getActiveAct();
        const activeScene = getActiveScene();
        if (!activeAct || !activeScene) {
          sendStyledMessage('Director', 'No active scene.');
          break;
        }
        if (!st.acts[activeAct].scenes[activeScene].images.find(i => i.id === id)) {
          sendStyledMessage('Director', `Image ID "${id}" not found.`);
          break;
        }
        st.acts[activeAct].scenes[activeScene].backdropId = id;
        updateHandout();
        break;
      }

      case 'highlight': {
        const id = val;
        const activeAct = getActiveAct();
        const activeScene = getActiveScene();
        if (!activeAct || !activeScene) {
          sendStyledMessage('Director', 'No active scene.');
          break;
        }
        const img = st.acts[activeAct].scenes[activeScene].images.find(i => i.id === id);
        if (!img) {
          sendStyledMessage('Director', `Image ID "${id}" not found.`);
          break;
        }
        img.type = 'highlight';
        updateHandout();
        break;
      }

      case 'delete-image': {
        const [id, ...confirmParts] = val.split(' ');
        const confirmation = confirmParts.join(' ').trim();
        if (confirmation !== 'Delete') {
          sendStyledMessage('Director', 'Delete cancelled.');
          break;
        }
        const activeAct = getActiveAct();
        const activeScene = getActiveScene();
        if (!activeAct || !activeScene) {
          sendStyledMessage('Director', 'No active scene.');
          break;
        }
        const images = st.acts[activeAct].scenes[activeScene].images;
        const index = images.findIndex(i => i.id === id);
        if (index === -1) {
          sendStyledMessage('Director', `Image ID "${id}" not found.`);
          break;
        }
        images.splice(index, 1);
        if (st.acts[activeAct].scenes[activeScene].backdropId === id) {
          st.acts[activeAct].scenes[activeScene].backdropId = null;
        }
        updateHandout();
        break;
      }

      case 'toggle-image': {
        const id = val;
        const activeAct = getActiveAct();
        const activeScene = getActiveScene();
        if (!activeAct || !activeScene) {
          sendStyledMessage('Director', 'No active scene.');
          break;
        }
        const img = st.acts[activeAct].scenes[activeScene].images.find(i => i.id === id);
        if (!img) {
          sendStyledMessage('Director', `Image ID "${id}" not found.`);
          break;
        }
        img.type = img.type === 'highlight' ? 'normal' : 'highlight';
        sendStyledMessage('Director', `Image ID "${id}" toggled to "${img.type}".`);
        updateHandout();
        break;
      }

      case 'recapture-image': {
        const id = val;
        const activeAct = getActiveAct();
        const activeScene = getActiveScene();
        if (!activeAct || !activeScene) {
          sendStyledMessage('Director', 'No active scene.');
          break;
        }
        const imgIndex = st.acts[activeAct].scenes[activeScene].images.findIndex(i => i.id === id);
        if (imgIndex === -1) {
          sendStyledMessage('Director', `Image ID "${id}" not found.`);
          break;
        }

        if (!msg.selected || msg.selected.length !== 1) {
          sendStyledMessage('Director', 'Please select exactly one token to recapture image.');
          break;
        }
        const token = getObj('graphic', msg.selected[0]._id);
        if (!token) {
          sendStyledMessage('Director', 'Selected token not found.');
          break;
        }
        const url = token.get('imgsrc').replace(/(thumb|med|original)/, 'max');
        const width = token.get('width');
        const height = token.get('height');
        const ratio = height / width;
        const img = st.acts[activeAct].scenes[activeScene].images[imgIndex];
        img.url = url;
        img.ratio = ratio;
        updateHandout();
        break;
      }

      case 'mode': {
        if (val !== 'dark' && val !== 'light') {
          sendStyledMessage('Director', 'Mode must be "dark" or "light".');
          break;
        }
        st.settings.mode = val;
        updateHandout();
        break;
      }

      case 'toggle-settings': {
        st.settings.settingsExpanded = !st.settings.settingsExpanded;
        updateHandout();
        break;
      }

      case 'backup': {
        makeBackup();
        break;
      }

  case 'restore': {
    if (val) {
      restoreBackup(val);
    } else {
      sendStyledMessage(scriptName, 'No backup name specified to restore.');
    }
    break;
      }


case 'assign-image-track': {
  const imageId = val;
  const st = getState();
  const currentScene = st.activeScene;
  if (!currentScene) break;

  let targetImage = null;

  // Find the image in the current scene
  for (const act of Object.values(st.acts)) {
    const scene = act.scenes?.[currentScene];
    if (scene) {
      targetImage = scene.images.find(img => img.id === imageId);
      if (targetImage) break;
    }
  }

  if (!targetImage) {
    sendStyledMessage('Assign Track', `Image with ID ${imageId} not found.`);
    break;
  }

  // Find the currently playing track
  const playingTrack = findObjs({ type: 'jukeboxtrack' }).find(track => track.get('playing'));
  if (!playingTrack) {
    sendStyledMessage('Assign Track', 'No track is currently playing.');
    break;
  }

  // Assign the track ID to the image
  targetImage.trackId = playingTrack.id;
  //sendStyledMessage('Assign Track', `Assigned track <b>${playingTrack.get('title')}</b> to image <b>${targetImage.title || 'Untitled'}</b>.`);

  updateHandout();
  break;
}

case 'remove-image-track': {
  const imgId = String(params[0]).trim();
  const st = getState();

  let targetImage = null;
  let scene = null;

  // Search for the image across all scenes
  for (const act of Object.values(st.acts)) {
    for (const s of Object.values(act.scenes || {})) {
      const img = s.images?.find(i => String(i.id).trim() === imgId);
      if (img) {
        targetImage = img;
        scene = s;
        break;
      }
    }
    if (targetImage) break;
  }

  if (!targetImage || !scene) {
    sendStyledMessage('Remove Track', `Image with ID "${imgId}" not found.`);
    break;
  }

  delete targetImage.trackId;
  updateState(st);
  updateHandout();
  sendStyledMessage('Remove Track', 'Track removed from image.');
  break;
}


case 'toggle-mute': {
  const st = getState();
  st.settings.muteBackdropAudio = !st.settings.muteBackdropAudio;
  updateState(st);
  updateHandout();
sendStyledMessage(scriptName, `Backdrop audio is now <b>${st.settings.muteBackdropAudio ? 'muted' : 'unmuted'}</b>.`);
  break;
}


case 'toggle-image-track': {
  const imageId = val;
  const st = getState();
  const currentScene = st.activeScene;
  if (!currentScene) break;

  let targetImage = null;

  // Find the image in the current scene
  for (const act of Object.values(st.acts)) {
    const scene = act.scenes?.[currentScene];
    if (scene) {
      targetImage = scene.images.find(img => img.id === imageId);
      if (targetImage) break;
    }
  }

  if (!targetImage || !targetImage.trackId) {
    sendStyledMessage('Toggle Track', 'No track assigned to this image.');
    break;
  }

  const track = getObj('jukeboxtrack', targetImage.trackId);
  if (!track) {
    sendStyledMessage('Toggle Track', 'Assigned track not found in jukebox.');
    break;
  }

  const currentlyPlaying = track.get('playing');
  track.set('playing', !currentlyPlaying);

  // ✅ Force UI to refresh so icon style updates
  updateHandout();

  break;
}


case 'repair-orders': {
  repairAllOrders();
  sendStyledMessage('Director', 'All scene and act orders have been repaired.');
  const tracks = findObjs({ _type: 'jukeboxtrack' });
  tracks.forEach(track => {
    if (track.get('playing')) {
      track.set('playing', false);
    }
  });

  break;
}


case 'toggle-help': {
  const st = getState();
  st.helpMode = !st.helpMode;
  updateState(st);
  updateHandout();
  break;
}


case 'make-help-handout': {
  const css = getCSS();
  const helpHtml = renderHelpHtml(css);

  const handoutName = 'Director Help';
  let handout = findObjs({ type: 'handout', name: handoutName })[0];

  if (handout) {
    handout.set({ notes: helpHtml });
  } else {
    handout = createObj('handout', {
      name: handoutName,
      notes: helpHtml
    });
  }

  sendStyledMessage('Director', `[Open the Help Handout](http://journal.roll20.net/handout/${handout.id})`);
  break;
}



case 'checkwall': {
  sendStyledMessage('Director', `Open Checkwall.`);

  const pageId = getPageForPlayer(playerid);
  const page = getObj('page', pageId);

  if (!page) {
    sendStyledMessage('Director', `❌ No valid page found.`);
    return;
  }

  sendStyledMessage('Director', `✅ Page: <b>${page.get('name')}</b>`);

  // Static triangle with known good coordinates
  const wall = createObj('pathv2', {
    _pageid: pageId,
    shape: 'pol',
    points: JSON.stringify([
      [0, 0],
      [0, 70],
      [70, 0],
      [0, 0]
    ]),
    fill: 'transparent',
    stroke: '#FF0000',
    stroke_width: 5,
    x: 140,  // Placed slightly off origin so it's visible
    y: 140,
    layer: 'walls',
    barrierType: 'wall'
  });

  if (!wall) {
    log("❌ PathV2 wall creation failed");
    sendStyledMessage('Director', `❌ Path creation failed.`);
  } else {
    log("✅ PathV2 wall created successfully");
    sendStyledMessage('Director', `✅ Wall created at (140, 140).`);
  }

  sendStyledMessage('Director', `Close Checkwall.`);
  break;
}








      case 'refresh': {
        updateHandout();
        sendStyledMessage('Director', 'Director interface refreshed.');
        break;
      }

      default: {
        sendStyledMessage('Director', `Unknown command: ${cmd}`);
      }
    }
  }
});

// Initial update on script load
on('ready', () => {
    getState();

  updateHandout();
});

});
{ try { throw new Error(''); } catch (e) { API_Meta.Director.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Director.offset); } }
