var API_Meta = API_Meta || {}; //eslint-disable-line no-var
API_Meta.Align = {
    offset: Number.MAX_SAFE_INTEGER,
    lineCount: -1
}; {
    try {
        throw new Error('');
    } catch (e) {
        API_Meta.Align.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (7));
    }
}
(() => {
  'use strict';

on('ready', () => {
  const scriptName = 'Align';
  const version = '1.1.0';

        log(`Align v.${version} ready. Command: !align — calls up chat menu with help button`);

  // --- Initialize or restore script state ---
  if (!state.Align) state.Align = {};
  state.Align.undo = state.Align.undo || {};
  state.Align.pendingSnap = state.Align.pendingSnap || {};



    if (!state[scriptName]) {
      state[scriptName] = {
        undo: {},
        pendingSnap: {}
      };
    }
if (!state[scriptName].pendingSnap) {
  state[scriptName].pendingSnap = {};
}

    const CSS = {
      container: 'position:relative;left:-20px; width:100%;border:1px solid #111;background:#ddd;color:#111;padding:6px;margin:4px;border-radius:6px;font-size:13px;line-height:1.5;',
      title: 'width:100%;border:none;background:#444;padding:1px;margin-bottom:5px;border-radius:4px;font-size:14px;line-height:1.5;color:#eee;font-weight:bold;text-align:center;',
      label: 'display:inline-block;font-weight:bold;margin:4px 6px 0 0; width:70px;',
      button: 'box-shadow:inset 0px 1px 3px 0px #555;background:linear-gradient(to bottom, #333 5%, #555 100%);background-color:#444;border-radius:4px;min-width:10px;text-align:center;border:1px solid #566963;display:inline-block;cursor:pointer;color:#eee;font-size:13px;font-weight:bold;padding:1px 5px;margin:1px;text-decoration:none;text-shadow:0px -1px 0px #2b665e;',
      active: 'font-weight:bold !important; background:#555;'
    };

    const alignTypes = ['left', 'right', 'top', 'bottom', 'center', 'center-x', 'center-y'];
    const distributeTypes = ['left', 'right', 'top', 'bottom', 'center', 'center-x', 'center-y'];
    const spacingTypes = ['horizontal', 'vertical'];

    const getButtonLabel = (mode, group) => {
      const map = {
        align: {
          left: '←',
          right: '→',
          top: '↑',
          bottom: '↓',
          center: '⊕',
          'center-x': '|',
          'center-y': '—',
        },
        distribute: {
          left: '←',
          right: '→',
          top: '↑',
          bottom: '↓',
          center: '⊕',
          'center-x': '|||',
          'center-y': 'Ⲷ',
        },
        spacing: {
          horizontal: '⇄',
          vertical: '⇅',
        }
      };
      return map[group]?.[mode] || mode;
    };

    const zIndexByPosition = (tokens, direction = 'top-right') => {
      tokens.sort((a, b) => {
        const aTop = a.get('top'), aLeft = a.get('left');
        const bTop = b.get('top'), bLeft = b.get('left');
        switch (direction) {
          case 'top-left':
            return (bTop - aTop) || (bLeft - aLeft);
          case 'top-right':
            return (bTop - aTop) || (aLeft - bLeft);
          case 'bottom-left':
            return (aTop - bTop) || (bLeft - aLeft);
          case 'bottom-right':
            return (aTop - bTop) || (aLeft - bLeft);
          default:
            return 0;
        }
      });
      tokens.forEach(t => toBack(t));
      tokens.forEach(t => toFront(t));
    };

    const getGridSizePixels = (page) => {
      const unitsPerGrid = page.get('snapping_increment') || 1;
      return unitsPerGrid * 70;
    };

    const pushUndoState = (playerid, tokens) => {
      if (!playerid) return;
      if (!state[scriptName].undo[playerid]) state[scriptName].undo[playerid] = [];
      const snapshot = tokens.map(t => ({
        id: t.id,
        left: t.get('left'),
        top: t.get('top'),
      }));
      state[scriptName].undo[playerid].push(snapshot);
      if (state[scriptName].undo[playerid].length > 10) {
        state[scriptName].undo[playerid].shift();
      }
    };

    const undoLast = (playerid) => {
      if (!playerid || !state[scriptName].undo[playerid] || state[scriptName].undo[playerid].length === 0) return;
      const lastSnapshot = state[scriptName].undo[playerid].pop();
      lastSnapshot.forEach(pos => {
        const token = getObj('graphic', pos.id);
        if (token) token.set({ left: pos.left, top: pos.top });
      });
    };
    
    const scatterTokens = (tokens, page, mode, snap) => {
  if (tokens.length === 0) return;

  // Calculate bounding box for "area" mode
  let bounds = null;
  if (mode === 'area') {
    let lefts = tokens.map(t => t.get('left') - t.get('width')/2);
    let rights = tokens.map(t => t.get('left') + t.get('width')/2);
    let tops = tokens.map(t => t.get('top') - t.get('height')/2);
    let bottoms = tokens.map(t => t.get('top') + t.get('height')/2);
    bounds = {
      left: Math.min(...lefts),
      right: Math.max(...rights),
      top: Math.min(...tops),
      bottom: Math.max(...bottoms),
      width: Math.max(...rights) - Math.min(...lefts),
      height: Math.max(...bottoms) - Math.min(...tops)
    };
  } else {
    // Full page bounds
const pw = page.get('width') * getGridSizePixels(page);
const ph = page.get('height') * getGridSizePixels(page);
    bounds = {
      left: 0,
      right: pw,
      top: 0,
      bottom: ph,
      width: pw,
      height: ph
    };
  }

  const gridSize = getGridSizePixels(page);
  const snapToGrid = snap === true;

  // Helper: generate random position within bounds accounting for token size
  const getRandomPos = (token) => {
    const halfW = token.get('width')/2;
    const halfH = token.get('height')/2;
    const minX = bounds.left + halfW;
    const maxX = bounds.right - halfW;
    const minY = bounds.top + halfH;
    const maxY = bounds.bottom - halfH;

    let x = _.random(minX, maxX);
    let y = _.random(minY, maxY);

if (snapToGrid) {
  const snappedLeft = Math.round((x - halfW) / gridSize) * gridSize;
  const snappedTop = Math.round((y - halfH) / gridSize) * gridSize;

  x = snappedLeft + halfW;
  y = snappedTop + halfH;

  // Clamp after snapping
  x = Math.min(Math.max(x, minX), maxX);
  y = Math.min(Math.max(y, minY), maxY);
}

    return {x, y};
  };

  // Check overlap between two tokens
  const overlaps = (t1, pos) => {
    const halfW1 = t1.get('width')/2;
    const halfH1 = t1.get('height')/2;
    const left1 = pos.x - halfW1;
    const right1 = pos.x + halfW1;
    const top1 = pos.y - halfH1;
    const bottom1 = pos.y + halfH1;

    for (let t2 of tokens) {
      if (t2.id === t1.id || !t2.get('left') || !t2.get('top')) continue;
      const halfW2 = t2.get('width')/2;
      const halfH2 = t2.get('height')/2;
      const left2 = t2.get('left') - halfW2;
      const right2 = t2.get('left') + halfW2;
      const top2 = t2.get('top') - halfH2;
      const bottom2 = t2.get('top') + halfH2;

      // Check AABB overlap
      if (!(right1 <= left2 || left1 >= right2 || bottom1 <= top2 || top1 >= bottom2)) {
        return true;
      }
    }
    return false;
  };

  // Try to place tokens randomly without overlap
  const maxAttempts = 100;
  for (let token of tokens) {
    let placed = false;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const pos = getRandomPos(token);
      if (!overlaps(token, pos)) {
        token.set({left: pos.x, top: pos.y});
        placed = true;
        break;
      }
    }
    // If can't place without overlap, just place randomly
    if (!placed) {
      const pos = getRandomPos(token);
      token.set({left: pos.x, top: pos.y});
    }
  }
};


const showHelp = (playerid) => {
  const playerName = getObj('player', playerid)?.get('_displayname') || 'GM';

  const intro = 
    `<p>This Align script provides token alignment, distribution, spacing, snapping, stacking, undo features, and token page organization.</p>` +
    `<p>Below is a summary of each button in the menu, the command it issues, and what it does.</p>`;

  const sections = [
    {
      title: 'Align Buttons',
      intro: 'Align selected tokens along the specified edges or centers. Command: <code>!align --align|MODE</code> where MODE is one of:',
      items: [
        {mode:'left', desc:'Align all tokens to the leftmost edge.'},
        {mode:'right', desc:'Align all tokens to the rightmost edge.'},
        {mode:'top', desc:'Align all tokens to the top edge.'},
        {mode:'bottom', desc:'Align all tokens to the bottom edge.'},
        {mode:'center', desc:'Align all tokens to the average center (X and Y).'},
        {mode:'center-x', desc:'Align all tokens to the average X coordinate.'},
        {mode:'center-y', desc:'Align all tokens to the average Y coordinate.'},
      ],
    },
    {
      title: 'Distribute Buttons',
      intro: 'Evenly distribute tokens along an axis between the first and last token edges. Command: <code>!align --distribute|MODE</code> where MODE is one of:',
      items: [
        {mode:'left', desc:'Distribute tokens evenly between left edges.'},
        {mode:'right', desc:'Distribute tokens evenly between right edges.'},
        {mode:'top', desc:'Distribute tokens evenly between top edges.'},
        {mode:'bottom', desc:'Distribute tokens evenly between bottom edges.'},
        {mode:'center', desc:'Distribute tokens evenly by their centers.'},
        {mode:'center-x', desc:'Distribute tokens evenly by their horizontal centers.'},
        {mode:'center-y', desc:'Distribute tokens evenly by their vertical centers.'},
      ],
    },
    {
      title: 'Spacing Buttons',
      intro: 'Distribute tokens with even spacing based on their size and the grid, horizontally or vertically. Command: <code>!align --distributespacing|AXIS</code> where AXIS is:',
      items: [
        {mode:'horizontal', desc:'Space tokens evenly horizontally.'},
        {mode:'vertical', desc:'Space tokens evenly vertically.'},
      ],
    },
    {
      title: 'Snap to Grid Buttons',
      intro: 'Snap tokens to the grid with optional spacing. Command: <code>!align --snap|AXIS|SPACES</code> where AXIS is horizontal or vertical and SPACES is number of empty grid squares between tokens.',
      items: [],
    },
    {
      title: 'Stack Buttons',
      intro: 'Change the visual stacking order of tokens from a specified corner. Command: <code>!align --zindex|DIRECTION</code> where DIRECTION is one of: top-left, top-right, bottom-right, bottom-left.',
      items: [],
    },
    {
      title: 'Undo Button',
      intro: 'Undo the last token move operation. Undo is a bit quirky and does not interact with tokenpage commands. Command: <code>!align --undo</code>',
      items: [],
    },
    {
      title: 'Scatter Tokens',
      intro: 'Randomly scatter tokens within the page or a selected area. Command: <code>!align --scatter|MODE|SNAP</code> where MODE is page or area and SNAP is snap or nosnap.<br>',
      items: [],
    },
    
    {
  title: 'Token Page',
  intro: 'Does not work on Legacy Tabletop. These commands organize tokens into structured groups with labeled bounding boxes. All use <code>!tokenpage</code> as the base command.',
  items: [],
    },
{
  title: 'Arrange',
  intro: 'These commands organize tokens into structured groups with labeled bounding boxes. All use <code>!tokenpage</code> as the base command.',
  items: [
    {mode:'--group', desc:'Groups all selected tokens into a single aligned row with a small vertical stagger. Automatically creates a bounding rectangle around the tokens and can optionally label the group.'},
    {mode:'--xoffset|N', desc:'Applies an additional horizontal offset (in pixels) to all tokens in the new group. The button defaults to 10 px increments, which matches the setting behavior.'},
    {mode:'--yoffset|N', desc:'Applies an additional vertical offset (in pixels) to all tokens in the new group. The button defaults to 10 px increments, which matches the setting behavior.<br><b>Note:</b> When a group is created, the script removes the most-overlapping previous container rectangle (if any), snaps the new box to the grid, and adds 10 pixels of padding between the box and tokens.<br><b>Manual Commands</b><br>The following commands do not have a button, but can be input manually, or used in a macro.'},
    {mode:'--label|TEXT', desc:'Adds or updates a label for the group. If no label object is selected, creates a new text label using the saved label style. Example: <code>!tokenpage --group --label|Bandits</code>'},
    {mode:'--labelposition|above|below', desc:'Specifies whether the label appears above or below the bounding box for this group. Overrides the default label position.'}
  ],
},
{
  title: 'Define',
  intro: 'These commands define reusable defaults for boxes and labels, controlling how future token groups are displayed.',
  items: [
    {mode:'--definebox', desc:'Select a rectangle to define the default box style (fill color, stroke color, opacity, and stroke width). Future boxes will use this style automatically.'},
    {mode:'--definelabel', desc:'Select a text object to define the default label style (font, size, color, alignment, bold/italic). Future labels will use this style automatically.'},
    {mode:'--definelabelpos|above|below', desc:'Sets the default label position (above or below the bounding box). Used whenever <code>--labelposition</code> is not specified.'}
  ],
}

  ];

  let content = `<div style="${CSS.container}">`;
  content += `<div style="${CSS.title}">ALIGN SCRIPT HELP</div>`;
  content += intro;

  sections.forEach(section => {
    content += `<p style = "font-size:18px; font-weight:bold; margin-top:15px;">${section.title}</p>`;
    content += `<p>${section.intro}</p>`;
    if (section.items.length) {
      content += '<ul>';
      section.items.forEach(item => {
        content += `<li><code>${item.mode}</code>: ${item.desc}</li>`;
      });
      content += '</ul>';
    }
  });

  content += `</div>`;

  sendChat('Align', `/w "${playerName}" ${content}`, null, {noarchive:true});
};



    const showMenu = (playerid) => {
      const playerName = getObj('player', playerid)?.get('_displayname') || 'GM';
      const getZIndexLabel = (dir) => {
        switch (dir) {
          case 'top-right': return '↗';
          case 'top-left': return '↖';
          case 'bottom-right': return '↘';
          case 'bottom-left': return '↙';
          default: return dir.charAt(0).toUpperCase() + dir.slice(1);
        }
      };
      let content = `<div style="${CSS.container}">`;
content += `<div style="${CSS.title}; position: relative;">` +
    `ALIGN` +
    `<a style="${CSS.button}; position: absolute; right: 6px; top: 0%; transform: translateY(-50%); padding: 0 6px;" href="!align --help">?</a>` +
    `</div>`;
const alignRow = alignTypes.filter(t => !t.includes('center'));
const alignCenters = alignTypes.filter(t => t.includes('center'));
content += `<span style="${CSS.label}">Align:</span>` +
    alignRow.map(t =>
        `<a style="${CSS.button}" href="!align --align|${t}">${getButtonLabel(t, 'align')}</a>`
    ).join('') +
    ` | ` +
    alignCenters.map(t =>
        `<a style="${CSS.button}" href="!align --align|${t}">${getButtonLabel(t, 'align')}</a>`
    ).join('');
const distRow = distributeTypes.filter(t => !t.includes('center'));
const distCenters = distributeTypes.filter(t => t.includes('center'));
content += `<br><span style="${CSS.label}">Distribute:</span>` +
    distRow.map(t =>
        `<a style="${CSS.button}" href="!align --distribute|${t}">${getButtonLabel(t, 'distribute')}</a>`
    ).join('') +
    ` | ` +
    distCenters.map(t =>
        `<a style="${CSS.button}" href="!align --distribute|${t}">${getButtonLabel(t, 'distribute')}</a>`
    ).join('');
content += `<br><span style="${CSS.label}">Spacing:</span>` +
    spacingTypes.map(t =>
        `<a style="${CSS.button}" href="!align --distributespacing|${t}">${getButtonLabel(t, 'spacing')}</a>`
    ).join('');
content += `<br><span style="${CSS.label}">To Grid:</span>` +
    `<a style="${CSS.button}" href="!align --snap|horizontal|?{How many grid squares between tokens (horizontal)|1}">Horizontal</a>` +
    ` | ` +
    `<a style="${CSS.button}" href="!align --snap|vertical|?{How many grid squares between tokens (vertical)|1}">Vertical</a>`;
content += `<br><span style="${CSS.label}">Stack from:</span>` + ['top-left', 'top-right', 'bottom-right', 'bottom-left'].map(dir =>
    `<a style="${CSS.button}" href="!align --zindex|${dir}">${getZIndexLabel(dir)}</a>`
).join('');
content += `<br><br><div style="${CSS.title}; position: relative;">Scatter</div>`;

content += `<span style="${CSS.label}">Snap:</span>` +
    `<a style="${CSS.button}" href="!align --scatter|page|snap">Page</a>` +
    `<a style="${CSS.button}" href="!align --scatter|area|snap">Area</a>`;

content += `<br><span style="${CSS.label}">No Snap:</span>` +
    `<a style="${CSS.button}" href="!align --scatter|page|nosnap">Page</a>` +
    `<a style="${CSS.button}" href="!align --scatter|area|nosnap">Area</a>`;
content += `<br><span style="${CSS.label}">History:</span>` +
    `<a style="${CSS.button}" href="!align --undo">Back</a>`;
content += `<br><br><div style="${CSS.title}; position: relative;">Token Page</div>` +
    `<span style="${CSS.label}">Arrange:</span>` +
    `<a style="${CSS.button}" href="!tokenpage --group">Group</a>` +
    `<a style="${CSS.button}" href="!tokenpage --xoffset|-10">←</a>` +
    `<a style="${CSS.button}" href="!tokenpage --xoffset|10">→</a>` +
    `<a style="${CSS.button}" href="!tokenpage --yoffset|-10">↑</a>` +
    `<a style="${CSS.button}" href="!tokenpage --yoffset|10">↓</a>`;

content += `<span style="${CSS.label}">Define:</span>` +
    `<a style="${CSS.button}" href="!tokenpage --definebox">Container</a>` +
    `<a style="${CSS.button}" href="!tokenpage --definelabel">Label</a>` +
    `<a style="${CSS.button}" href="!tokenpage --definelabelpos|above">↑</a>` +
    `<a style="${CSS.button}" href="!tokenpage --definelabelpos|below">↓</a>`;





        content += `</div>`;
      sendChat(scriptName, `/w "${playerName}" ${content}`, null, {noarchive:true} );
    };
const performSnap = (tokens, snapSpaces, page, playerid, direction) => {
  if (tokens.length < 2) return;

  const gridSize = getGridSizePixels(page);
  const pageWidth = page.get('width') * gridSize;
  const pageHeight = page.get('height') * gridSize;
  const padding = gridSize; // one grid square padding from edges
  const gap = snapSpaces * gridSize;

  const playerName = getObj('player', playerid)?.get('_displayname') || 'GM';

  if (direction === 'horizontal') {
    let cursorX = padding;
    let cursorY = padding;
    let rowTokens = [];
    let maxRowHeight = 0;

    tokens.forEach(token => {
      const width = token.get('width');
      const height = token.get('height');

      // Check if token fits in current row, else wrap to next row
      if (cursorX + width / 2 > pageWidth - padding) {
        // place current row tokens vertically and move cursorY down
        rowTokens.forEach(t => {
          t.set('top', cursorY + t.get('height') / 2);
        });
        cursorY += maxRowHeight + (snapSpaces + 0) * gridSize;
        cursorX = padding;
        rowTokens = [];
        maxRowHeight = 0;
      }

      // Position token horizontally
      token.set('left', cursorX + width / 2);

      // Collect tokens for current row to set vertical positions later
      rowTokens.push(token);

      // Track max height of current row tokens
      if (height > maxRowHeight) maxRowHeight = height;

      // Advance cursorX by token width + gap
      cursorX += width + gap;
    });

    // Place any remaining tokens in the last row vertically
    rowTokens.forEach(t => {
      t.set('top', cursorY + t.get('height') / 2);
    });

    // Check if we overflowed page height; if so, expand page height
    const requiredHeight = cursorY + maxRowHeight + padding;
    if (requiredHeight > pageHeight) {
      const newPageHeight = Math.ceil(requiredHeight / gridSize);
      page.set('height', newPageHeight);
const msgContent = `<div style="${CSS.container}">Page height enlarged to fit snapped tokens.</div>`;
sendChat('Align', `/w "${playerName}" ${msgContent}`, null, {noarchive:true});
    }

  } else if (direction === 'vertical') {
    let cursorX = padding;
    let cursorY = padding;
    let columnTokens = [];
    let maxColumnWidth = 0;

    tokens.forEach(token => {
      const width = token.get('width');
      const height = token.get('height');

      // Check if token fits in current column vertically, else wrap to next column
      if (cursorY + height / 2 > pageHeight - padding) {
        // place current column tokens horizontally and move cursorX right
        columnTokens.forEach(t => {
          t.set('left', cursorX + t.get('width') / 2);
        });

        // Calculate widest token width in current column before moving cursorX
        maxColumnWidth = Math.max(...columnTokens.map(t => t.get('width')));

        cursorX += maxColumnWidth + (snapSpaces + 0) * gridSize;
        cursorY = padding;
        columnTokens = [];
        maxColumnWidth = 0;
      }

      // Position token vertically
      token.set('top', cursorY + height / 2);

      // Collect tokens for current column to set horizontal positions later
      columnTokens.push(token);

      // Track max width of current column tokens
      if (width > maxColumnWidth) maxColumnWidth = width;

      // Advance cursorY by token height + gap
      cursorY += height + gap;
    });

    // Place any remaining tokens in the last column horizontally
    columnTokens.forEach(t => {
      t.set('left', cursorX + t.get('width') / 2);
    });

    // Check if we overflowed page width; if so, expand page width
    const requiredWidth = cursorX + maxColumnWidth + padding;
    if (requiredWidth > pageWidth) {
      const newPageWidth = Math.ceil(requiredWidth / gridSize);
      page.set('width', newPageWidth);
const msgContent = `<div style="${CSS.container}">Page width enlarged to fit snapped tokens.</div>`;
sendChat('Align', `/w "${playerName}" ${msgContent}`, null, {noarchive:true});
    }
  }
};

const isSnapWrappingRequired = (tokens, snapSpaces, page, direction) => {
  const gridSize = getGridSizePixels(page);
  const pageWidth = page.get('width') * gridSize;
  const pageHeight = page.get('height') * gridSize;
  const padding = gridSize; // 1 grid square padding from the edge
  const gap = snapSpaces * gridSize;

  if (direction === 'horizontal') {
    let posX = padding;
    for (const token of tokens) {
      const width = token.get('width');
      if (posX + width / 2 > pageWidth - padding) {
        return true; // would overflow → wrapping or resize needed
      }
      posX += width + gap;
    }
  } else {
    let posY = padding;
    for (const token of tokens) {
      const height = token.get('height');
      if (posY + height / 2 > pageHeight - padding) {
        return true; // would overflow → wrapping or resize needed
      }
      posY += height + gap;
    }
  }

  return false;
};


const showSnapConfirmation = (playerid, tokens, snapSpaces, page, direction) => {
  const playerName = getObj('player', playerid)?.get('_displayname') || 'GM';
  if (!state[scriptName].pendingSnap) state[scriptName].pendingSnap = {};
  state[scriptName].pendingSnap[playerid] = {
    tokens,
    snapSpaces,
    page,
    direction
  };

  const CSS = {
    container: 'position:relative;left:-20px; width:100%;border:1px solid #111;background:#fdf1dc;padding:6px;margin:4px;border-radius:6px;font-size:13px;line-height:1.5;',
    title: 'width:100%;border:none;background:#444;padding:1px;margin-bottom:5px;border-radius:4px;font-size:14px;line-height:1.5;color:#eee;font-weight:bold;text-align:center;',
    button: 'box-shadow:inset 0px 1px 3px 0px #555;background:linear-gradient(to bottom, #333 5%, #555 100%);background-color:#444;border-radius:4px;min-width:10px;text-align:center;border:1px solid #566963;display:inline-block;cursor:pointer;color:#eee;font-size:13px;font-weight:bold;padding:1px 5px;margin:1px;text-decoration:none;text-shadow:0px -1px 0px #2b665e;',
  };

  const content =
    `<div style="${CSS.container}">` +
      `<div style="${CSS.title}">SNAP: Confirmation Required</div>` +
      `<div>This snap operation may wrap tokens to a new row or expand the page. Continue?</div>` +
      `<br>` +
      `<a style="${CSS.button}" href="!align --confirmSnap">Confirm</a>` +
      `<a style="${CSS.button}" href="!align">Cancel</a>` +
    `</div>`;

  sendChat(scriptName, `/w "${playerName}" ${content}`, null, {noarchive:true} );
};

    const handleSnapConfirm = (playerid, direction, snapSpaces) => {
      const snapData = state[scriptName].pendingSnap[playerid];
      if (!snapData) return;
      const page = getObj('page', snapData.pageId);
      if (!page) return;

      const tokens = snapData.tokenIds
        .map(id => getObj('graphic', id))
        .filter(t => !!t);

      pushUndoState(playerid, tokens);
      performSnap(tokens, parseFloat(snapSpaces), page, direction);

      delete state[scriptName].pendingSnap[playerid];
    };

    const handleSnapCancel = (playerid) => {
      delete state[scriptName].pendingSnap[playerid];
      const name = getObj('player', playerid)?.get('_displayname') || 'GM';
const msgContent = `<div style="${CSS.container}">Snap canceled.</div>`;
sendChat(scriptName, `/w "${name}" ${msgContent}`, null, {noarchive:true});
    };

    const alignTokens = (tokens, mode) => {
      if (tokens.length < 2) return;
      switch (mode) {
        case 'left': {
          const minLeft = Math.min(...tokens.map(t => t.get('left') - t.get('width') / 2));
          tokens.forEach(t => t.set('left', minLeft + t.get('width') / 2));
          break;
        }
        case 'right': {
          const maxRight = Math.max(...tokens.map(t => t.get('left') + t.get('width') / 2));
          tokens.forEach(t => t.set('left', maxRight - t.get('width') / 2));
          break;
        }
        case 'top': {
          const minTop = Math.min(...tokens.map(t => t.get('top') - t.get('height') / 2));
          tokens.forEach(t => t.set('top', minTop + t.get('height') / 2));
          break;
        }
        case 'bottom': {
          const maxBottom = Math.max(...tokens.map(t => t.get('top') + t.get('height') / 2));
          tokens.forEach(t => t.set('top', maxBottom - t.get('height') / 2));
          break;
        }
        case 'center': {
          const avgX = tokens.reduce((sum, t) => sum + t.get('left'), 0) / tokens.length;
          const avgY = tokens.reduce((sum, t) => sum + t.get('top'), 0) / tokens.length;
          tokens.forEach(t => {
            t.set('left', avgX);
            t.set('top', avgY);
          });
          break;
        }
        case 'center-x': {
          const avgX = tokens.reduce((sum, t) => sum + t.get('left'), 0) / tokens.length;
          tokens.forEach(t => t.set('left', avgX));
          break;
        }
        case 'center-y': {
          const avgY = tokens.reduce((sum, t) => sum + t.get('top'), 0) / tokens.length;
          tokens.forEach(t => t.set('top', avgY));
          break;
        }
      }
    };

    const distributeTokens = (tokens, mode) => {
      if (tokens.length < 3) return;
      const isHorizontal = ['left', 'right', 'center', 'center-x'].includes(mode);
      tokens.sort((a, b) => isHorizontal ? a.get('left') - b.get('left') : a.get('top') - b.get('top'));
      let start, end;
      const first = tokens[0], last = tokens[tokens.length - 1];
      switch (mode) {
        case 'left': start = first.get('left') - first.get('width') / 2; end = last.get('left') - last.get('width') / 2; break;
        case 'right': start = first.get('left') + first.get('width') / 2; end = last.get('left') + last.get('width') / 2; break;
        case 'top': start = first.get('top') - first.get('height') / 2; end = last.get('top') - last.get('height') / 2; break;
        case 'bottom': start = first.get('top') + first.get('height') / 2; end = last.get('top') + last.get('height') / 2; break;
        case 'center':
        case 'center-x': start = first.get('left'); end = last.get('left'); break;
        case 'center-y': start = first.get('top'); end = last.get('top'); break;
      }
      const step = (end - start) / (tokens.length - 1);
      for (let i = 1; i < tokens.length - 1; i++) {
        const pos = start + step * i;
        switch (mode) {
          case 'left': tokens[i].set('left', pos + tokens[i].get('width') / 2); break;
          case 'right': tokens[i].set('left', pos - tokens[i].get('width') / 2); break;
          case 'top': tokens[i].set('top', pos + tokens[i].get('height') / 2); break;
          case 'bottom': tokens[i].set('top', pos - tokens[i].get('height') / 2); break;
          case 'center':
          case 'center-x': tokens[i].set('left', pos); break;
          case 'center-y': tokens[i].set('top', pos); break;
        }
      }
    };

    const distributeSpacingTokens = (tokens, axis, page) => {
      if (tokens.length < 3) return;
      const gridSize = getGridSizePixels(page);
      const isHorizontal = axis === 'horizontal';
      tokens.sort((a, b) => isHorizontal ? a.get('left') - b.get('left') : a.get('top') - b.get('top'));
      const totalSize = tokens.reduce((sum, t) => sum + (isHorizontal ? t.get('width') : t.get('height')), 0);
      const first = tokens[0], last = tokens[tokens.length - 1];
      const minEdge = isHorizontal ? first.get('left') - first.get('width') / 2 : first.get('top') - first.get('height') / 2;
      const maxEdge = isHorizontal ? last.get('left') + last.get('width') / 2 : last.get('top') + last.get('height') / 2;
      const space = maxEdge - minEdge - totalSize;
      if (space < 0) return;
      const gap = space / (tokens.length - 1);
      let pos = minEdge;
      tokens.forEach(t => {
        const size = isHorizontal ? t.get('width') : t.get('height');
        pos += size / 2;
        if (isHorizontal) t.set('left', pos);
        else t.set('top', pos);
        pos += size / 2 + gap;
      });
    };

    on('chat:message', msg => {
      if (msg.type !== 'api' || !msg.content.startsWith('!align')) return;
      const args = msg.content.split(/\s+--/).slice(1).map(s => '--' + s.trim());

      let alignType = null;
      let distributeType = null;
      let spacingType = null;
      let snapDirection = null;
      let snapSpaces = null;
      let zindexDir = null;
      let undoRequested = false;
      let snapConfirm = false;
      let snapCancel = false;
      let confirmSnapRequested = false;
      let helpRequested = false;
      let scatterMode = null;   // 'page' or 'area'
      let scatterSnap = false;


      for (const arg of args) {
        const parts = arg.slice(2).split('|');
        const cmd = parts[0];
        const val1 = parts[1];
        const val2 = parts[2];

        switch (cmd) {
          case 'align': alignType = val1; break;
          case 'distribute': distributeType = val1; break;
          case 'distributespacing': spacingType = val1; break;
          case 'snap': snapDirection = val1; snapSpaces = parseFloat(val2); break;
          case 'zindex': zindexDir = val1 || 'top-right'; break;
          case 'undo': undoRequested = true; break;
          case 'snapconfirm': snapDirection = val1; snapSpaces = parseFloat(val2); snapConfirm = true; break;
          case 'snapcancel': snapCancel = true; break;
          case 'confirmSnap': confirmSnapRequested = true; break;
          case 'help': helpRequested = true; break;
              case 'scatter': scatterMode = val1 === 'area' ? 'area' : 'page'; scatterSnap = val2 === 'snap';
      break;

        }
      }
if (confirmSnapRequested) {
  const pending = state[scriptName].pendingSnap?.[msg.playerid];
  const playerName = getObj('player', msg.playerid)?.get('_displayname') || 'GM';

  if (pending && pending.tokens?.length) {
    performSnap(pending.tokens, pending.snapSpaces, pending.page, msg.playerid, pending.direction);
    delete state[scriptName].pendingSnap[msg.playerid];
    return;
  } else {
const msgContent = `<div style="${CSS.container}">No pending snap operation found.</div>`;
sendChat(scriptName, `/w "${playerName}" ${msgContent}`, null, {noarchive:true});
    return;
  }
}

      if (snapCancel) {
        handleSnapCancel(msg.playerid);
        return;
      }

      if (snapConfirm) {
        handleSnapConfirm(msg.playerid, snapDirection, snapSpaces);
        return;
      }

      if (args.length === 0) {
        showMenu(msg.playerid);
        return;
      }

      if (undoRequested) {
        undoLast(msg.playerid);
        return;
      }
      
      if (helpRequested) {
  showHelp(msg.playerid);
  return;
}

      const selected = (msg.selected || [])
        .map(s => getObj('graphic', s._id))
        .filter(t => t && t.get('_type') === 'graphic');
      if (!selected.length) return;

      const page = getObj('page', selected[0].get('pageid'));

      const axis = alignType || distributeType || spacingType;
      if (['left', 'right', 'center', 'center-x', 'horizontal'].includes(axis)) {
        selected.sort((a, b) => a.get('left') - b.get('left'));
      } else {
        selected.sort((a, b) => a.get('top') - b.get('top'));
      }
if (scatterMode) {
  scatterTokens(selected, page, scatterMode, scatterSnap);
  return;
}
if (snapDirection && snapSpaces != null && !isNaN(snapSpaces) && snapSpaces >= 0) {
  const wrappingRequired = isSnapWrappingRequired(selected, snapSpaces, page, snapDirection);
  if (wrappingRequired) {
    showSnapConfirmation(msg.playerid, selected, snapSpaces, page, snapDirection);
  } else {
    performSnap(selected, snapSpaces, page, msg.playerid, snapDirection);
  }
      } else {
        pushUndoState(msg.playerid, selected);
        if (zindexDir) zIndexByPosition(selected, zindexDir);
        else if (distributeType) distributeTokens(selected, distributeType);
        else if (spacingType) distributeSpacingTokens(selected, spacingType, page);
        else if (alignType) alignTokens(selected, alignType);
        else showMenu(msg.playerid);
      }
    });
  });
})();





// Token Page Organizer
// Modular grouping + grid alignment + adjustable margins + label positioning

on('ready', () => {
    const SCRIPTNAME = 'TokenPageOrganizer';
    const DEFAULT_MARGINS = [5, 15, 15, 15]; // top, right, bottom, left (px)
    const GRID_SIZE = 10; // snapping grid for box edges

    const logMsg = (msg) => sendChat(SCRIPTNAME, `/w gm ${msg}`);

    const parseArgs = (content) => {
        const args = content.split(/\s+--/).slice(1);
        const opts = {};
        args.forEach(arg => {
            const [key, val] = arg.split('|');
            opts[key.toLowerCase()] = val ? val.trim() : true;
        });
        return opts;
    };

    const snap = (val, grid = GRID_SIZE) => Math.round(val / grid) * grid;

    const isGraphicTokenOnObjects = (o) =>
        o && o.get && o.get('type') === 'graphic' && o.get('subtype') === 'token' && o.get('layer') === 'objects';

    const isTextObj = (o) => o && o.get && o.get('type') === 'text';

    // grid pixel size for the page
    const getGridPixelSize = (page) => {
        const units = Number(page.get('snapping_increment')) || 1;
        return units * 70;
    };

    const getTokenPixelSize = (token, page) => {
        const rawW = Number(token.get('width')) || 0;
        const rawH = Number(token.get('height')) || 0;
        const gridPx = getGridPixelSize(page);
        const scaledW = rawW * (gridPx / 70);
        const scaledH = rawH * (gridPx / 70);
        return { width: Math.max(rawW, scaledW), height: Math.max(rawH, scaledH) };
    };

    const boundingBoxFromTokens = (tokens) => {
        const valid = tokens.filter(t => t && !isNaN(Number(t.get('left'))) && !isNaN(Number(t.get('top'))));
        if (!valid.length) return null;
        const page = getObj('page', valid[0].get('_pageid'));
        if (!page) return null;
        let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
        valid.forEach(t => {
            const { width, height } = getTokenPixelSize(t, page);
            const cx = Number(t.get('left'));
            const cy = Number(t.get('top'));
            left = Math.min(left, cx - width / 2);
            right = Math.max(right, cx + width / 2);
            top = Math.min(top, cy - height / 2);
            bottom = Math.max(bottom, cy + height / 2);
        });
        return { left, right, top, bottom };
    };

    // --- style persistence ---
    function getBoxStyle() {
        const st = state.TokenPageOrganizer = state.TokenPageOrganizer || {};
        return st.boxStyle || {
            fill: '#fce5cd',
            fill_opacity: 0.3,
            stroke: '#660000',
            stroke_width: 1
        };
    }

    const setBoxStyleFromSelection = (msg) => {
        const sel = msg.selected;
        if (!sel || sel.length !== 1) {
            logMsg('Please select exactly one rectangle to define box style.');
            return;
        }
        const obj = getObj(sel[0]._type, sel[0]._id);
        if (!obj || (obj.get('type') !== 'path' && obj.get('type') !== 'pathv2')) {
            logMsg('Selected object is not a rectangle.');
            return;
        }
        state.TokenPageOrganizer = state.TokenPageOrganizer || {};
        state.TokenPageOrganizer.boxStyle = {
            fill: obj.get('fill') || '#fce5cd',
            fill_opacity: parseFloat(obj.get('fill_opacity')) || 0.3,
            stroke: obj.get('stroke') || '#660000',
            stroke_width: parseFloat(obj.get('stroke_width')) || 1
        };
        logMsg(`Box style saved.`);
    };
    
    // --- label style persistence ---
    function getLabelStyle() {
        const st = state.TokenPageOrganizer = state.TokenPageOrganizer || {};
        return st.labelStyle || {
            font_size: 24,
            font_family: 'Arial',
            color: '#000000',
            text_align: 'center',
            bold: false,
            italic: false
        };
    }

    const setLabelStyleFromSelection = (msg) => {
        const sel = msg.selected;
        if (!sel || sel.length !== 1) {
            logMsg('Please select exactly one text object to define label style.');
            return;
        }

        const obj = getObj(sel[0]._type, sel[0]._id);
        if (!obj || obj.get('type') !== 'text') {
            logMsg('Selected object is not a text label.');
            return;
        }

        state.TokenPageOrganizer = state.TokenPageOrganizer || {};
        state.TokenPageOrganizer.labelStyle = {
            font_size: Number(obj.get('font_size')) || 24,
            font_family: obj.get('font_family') || 'Arial',
            color: obj.get('color') || '#000000',
            text_align: obj.get('text_align') || 'center',
            bold: !!obj.get('bold'),
            italic: !!obj.get('italic')
        };

        logMsg(`Label style saved (font: ${state.TokenPageOrganizer.labelStyle.font_family}).`);
    };

    // --- define default label position ---
    const setDefaultLabelPosition = (msg, pos) => {
        if (!pos || !['above', 'below'].includes(pos.toLowerCase())) {
            logMsg('Usage: !tokenpage --definelabelpos|above OR --definelabelpos|below');
            return;
        }
        const st = state.TokenPageOrganizer = state.TokenPageOrganizer || {};
        st.defaultLabelPosition = pos.toLowerCase();
        logMsg(`Default label position set to "${pos}".`);
    };

    const getDefaultLabelPosition = () => {
        const st = state.TokenPageOrganizer = state.TokenPageOrganizer || {};
        return st.defaultLabelPosition || 'above';
    };

    // --- create pathv2 rectangle ---
    const createRectangle = ({ pageid, left, top, width, height }) => {
        if (isNaN(width) || isNaN(height)) {
            logMsg(`Error: Invalid box size (width=${width}, height=${height}).`);
            return;
        }
        const style = getBoxStyle();
        return createObj('pathv2', {
            _pageid: pageid,
            shape: 'rec',
            points: JSON.stringify([[0, 0], [width, height]]),
            fill: style.fill,
            stroke: style.stroke,
            stroke_width: style.stroke_width,
            fill_opacity: style.fill_opacity,
            x: left,
            y: top,
            layer: 'map'
        });
    };

    const handleGroup = (msg, options = {}) => {
        if (!playerIsGM(msg.playerid)) { logMsg('Only the GM may run this command.'); return; }

        const sel = msg.selected || [];
        const objs = sel.map(s => getObj(s._type, s._id)).filter(Boolean);
        const textObjs = objs.filter(isTextObj);
        const tokenObjs = objs.filter(isGraphicTokenOnObjects);

        if (!tokenObjs.length) { logMsg('No tokens found in selection.'); return; }

        const pageid = tokenObjs[0].get('_pageid');
        const page = getObj('page', pageid);
        const gridPx = getGridPixelSize(page);

        const byLeftThenTop = (a, b) => {
            const la = Number(a.get('left')), lb = Number(b.get('left'));
            if (la !== lb) return la - lb;
            return Number(a.get('top')) - Number(b.get('top'));
        };
        const sorted = tokenObjs.slice().sort(byLeftThenTop);

        const first = sorted[0];
        const firstTop = Number(first.get('top'));
        const firstLeft = Number(first.get('left'));
        const firstWidth = Number(first.get('width'));
        const firstHeight = Number(first.get('height'));

        const upperLeftX = firstLeft - firstWidth / 2;
        const upperLeftY = firstTop - firstHeight / 2;
        const snappedUpperLeftX = Math.floor(upperLeftX / 10) * 10;
        const snappedUpperLeftY = Math.floor(upperLeftY / 10) * 10;
        const snappedLeft = snappedUpperLeftX + firstWidth / 2;
        const snappedTop = snappedUpperLeftY + firstHeight / 2;
        first.set({ left: snappedLeft, top: snappedTop });

        const staggerOffset = 8;
        const baseTopEdge = snappedTop - firstHeight / 2;
        const baseLeft = snappedLeft;
        const xOffset = Number(options.xoffset || 0);
        const yOffset = Number(options.yoffset || 0);

        const positions = [];
        for (let i = 0; i < sorted.length; i++) {
            const t = sorted[i];
            const w = Number(t.get('width'));
            const h = Number(t.get('height'));
            const prev = positions[i - 1];
            const x = (i === 0)
                ? baseLeft + xOffset
                : prev.left + prev.width / 2 + gridPx / 4 + w / 2;
            const topEdge = baseTopEdge + ((i % 2 === 1) ? -staggerOffset : staggerOffset) + yOffset;
            const y = topEdge + h / 2;
            positions.push({ id: t.id, left: x, top: y, width: w, height: h });
        }
        positions.forEach(p => getObj('graphic', p.id)?.set({ left: p.left, top: p.top }));

        const bbox = boundingBoxFromTokens(tokenObjs);
        if (!bbox) return logMsg('Could not compute bounding box.');

        const [marginTop, marginRight, marginBottom, marginLeft] = DEFAULT_MARGINS;
        const padded = {
            left: Math.floor((bbox.left - marginLeft) / GRID_SIZE) * GRID_SIZE,
            right: Math.ceil((bbox.right + marginRight) / GRID_SIZE) * GRID_SIZE,
            top: Math.floor((bbox.top - marginTop) / GRID_SIZE) * GRID_SIZE,
            bottom: Math.ceil((bbox.bottom + marginBottom) / GRID_SIZE) * GRID_SIZE
        };

        const rectWidth = padded.right - padded.left;
        const rectHeight = padded.bottom - padded.top;
        const rectCenterLeft = padded.left + rectWidth / 2;
        const rectCenterTop = padded.top + rectHeight / 2;

        // --- detect and remove most-overlapping old rectangle (robust thresholded)
        const oldRects = findObjs({ _pageid: pageid, _type: 'pathv2', layer: 'map' });
        let bestRect = null;
        let maxOverlap = 0;

        // thresholds
        const MIN_ABSOLUTE_OVERLAP = 16;   // pixels^2 minimum absolute overlap to consider
        const THRESH_FRACTION = 0.20;     // must cover at least 20% of the smaller area

        const newArea = Math.max(0, rectWidth * rectHeight);

        oldRects.forEach(r => {
            // center of pathv2
            const rX = Number(r.get('x'));
            const rY = Number(r.get('y'));
            if (!isFinite(rX) || !isFinite(rY)) return;

            // parse points to compute shape extents (points are relative)
            let pts;
            try { pts = JSON.parse(r.get('points') || '[]'); } catch { return; }
            if (!Array.isArray(pts) || pts.length === 0) return;

            const xs = pts.map(p => Number(p[0]) || 0);
            const ys = pts.map(p => Number(p[1]) || 0);
            const minX = Math.min(...xs), maxX = Math.max(...xs);
            const minY = Math.min(...ys), maxY = Math.max(...ys);
            const rW = Math.max(0, maxX - minX), rH = Math.max(0, maxY - minY);
            if (rW <= 0 || rH <= 0) return;

            // absolute extents: pathv2 x/y are center
            const rLeft = rX - rW / 2;
            const rRight = rX + rW / 2;
            const rTop = rY - rH / 2;
            const rBottom = rY + rH / 2;

            const overlapX = Math.max(0, Math.min(rRight, padded.right) - Math.max(rLeft, padded.left));
            const overlapY = Math.max(0, Math.min(rBottom, padded.bottom) - Math.max(rTop, padded.top));
            const overlapArea = overlapX * overlapY;
            if (overlapArea <= 0) return;

            const rArea = rW * rH;
            const smallerArea = Math.min(newArea, rArea);

            // require both an absolute overlap and at least a fraction of the smaller area
            if (overlapArea >= MIN_ABSOLUTE_OVERLAP && overlapArea >= (THRESH_FRACTION * smallerArea)) {
                if (overlapArea > maxOverlap) {
                    maxOverlap = overlapArea;
                    bestRect = r;
                }
            }
        });

        if (bestRect) {
            bestRect.remove();
        }

        createRectangle({
            pageid,
            left: rectCenterLeft,
            top: rectCenterTop,
            width: rectWidth,
            height: rectHeight
        });

        // --- label handling ---
        const labelObj = textObjs[0];
        const ls = getLabelStyle();
        const labelText = options.label;
        const labelPosition = (options.labelposition || getDefaultLabelPosition()).toLowerCase();

        if (labelObj || labelText) {
            const fontSize = labelObj ? Number(labelObj.get('font_size')) || ls.font_size : ls.font_size;
            const textHalfHeight = fontSize / 2;
            const labelAbove = labelPosition === 'above';
            const labelTop = labelAbove
                ? (padded.top - textHalfHeight - 5)
                : (padded.bottom + textHalfHeight + 5);
            const labelSettings = {
                left: rectCenterLeft,
                top: labelTop,
                layer: 'objects',
                font_size: fontSize,
                font_family: ls.font_family,
                color: ls.color,
                text_align: ls.text_align,
                bold: ls.bold,
                italic: ls.italic
            };
            if (labelObj) labelObj.set(labelSettings);
            else if (labelText) createObj('text', Object.assign({ _pageid: pageid, text: labelText }, labelSettings));
        }
    };

    on('chat:message', (msg) => {
        if (msg.type !== 'api' || !msg.content.startsWith('!tokenpage')) return;
        const options = parseArgs(msg.content);
        if (options.definebox) return setBoxStyleFromSelection(msg);
        if (options.definelabel) return setLabelStyleFromSelection(msg);
        if (options.definelabelpos) return setDefaultLabelPosition(msg, options.definelabelpos);
        handleGroup(msg, options);
    });
});



{ try { throw new Error(''); } catch (e) { API_Meta.Align.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Align.offset); } }
