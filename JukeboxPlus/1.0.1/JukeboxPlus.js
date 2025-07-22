var API_Meta = API_Meta || {};
API_Meta.JukeboxPlus = {
    offset: Number.MAX_SAFE_INTEGER,
    lineCount: -1
}; {
    try {
        throw new Error('');
    } catch (e) {
        API_Meta.JukeboxPlus.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (4));
    }
}


// Jukebox Plus Plus (Fully Enhanced UI with Album/Playlist Toggle, Track Tagging, and Layout Fixes)
// Changelong
// 1.0.0 Original
// 1.0.1 Added min/Max intervals, bug fixes, and simple Director integration.
on('ready', () =>
{
    
    const version = '1.0.1'; //version number set here
    log('-=> Jukebox Plus v' + version + ' is loaded. Command !jb creates control handout and provides link. Click that to open.');

    const HANDOUT_NAME = 'Jukebox Plus';
    const STATE_KEY = 'GraphicJukebox';

    if(!state[STATE_KEY])
    {
        state[STATE_KEY] = {
            tracks:
            {},
            albumSortOrder:
            {},
            albums:
            {},
            playlists:
            {},
            rollbacks: [],
            settings:
            {
                notifyOnPlay: 'on',
                selectedAlbum: '',
                selectedPlaylist: '',
                viewMode: 'albums',
                settingsExpanded: false,
                nowPlayingOnly: false,
                mode: 'dark',
                helpVisible: false
            }
        };
    }



// Ensure mixSession is present (without disrupting existing state)
// Is separate from initial state declaration to protect users from breaking changes.
if (!state[STATE_KEY].mixSession) {
    state[STATE_KEY].mixSession = {
        active: false,
        loopIds: [],
        randomIds: [],
        timeoutId: null
    };
}

    // Declare once, top level within ready
    const data = state[STATE_KEY];

    // Define icon sets for each theme
    const iconSetDark = {
        play: 'https://files.d20.io/images/446752945/1lxeyU7yN1vPWXcrc3lFng/original.png?1751143927',
        playActive: 'https://files.d20.io/images/446801469/hLU0ilPulBMcR2xBMFCYEQ/original.png?1751166667',
        loop: 'https://files.d20.io/images/446752941/AJY4BveyKRfOvPPHGsY7jw/original.png?1751143926',
        loopActive: 'https://files.d20.io/images/446801468/hJcBoRBqDlXqrJ5sSs69gA/original.png?1751166667',
        isolate: 'https://files.d20.io/images/446752943/0YxEtYa40ld2L2qbLua07w/original.png?1751143927',
        stop: 'https://files.d20.io/images/446752946/Jei3DhJjtd7AcQEMLoT2JQ/original.png?1751143927'
    };

    const iconSetLight = {
        play: 'https://files.d20.io/images/446909842/EKV5MVZ4yWtPPahgW-yyxQ/original.png?1751231236',
        playActive: 'https://files.d20.io/images/446801469/hLU0ilPulBMcR2xBMFCYEQ/original.png?1751166667',
        loop: 'https://files.d20.io/images/446909844/RcZX7CnmpX_-_qeKrfr3ZQ/original.png?1751231236',
        loopActive: 'https://files.d20.io/images/446909844/RcZX7CnmpX_-_qeKrfr3ZQ/original.png?1751231236',
        isolate: 'https://files.d20.io/images/446909843/6IxkbARljNyoN78s26mLQg/original.png?1751231236',
        stop: 'https://files.d20.io/images/446909850/AseQXEd16Xa77lPI2Hdeaw/original.png?1751231238'
    };

    // Define both style sets
 const cssLight = {
    // Layout Containers
    sidebar: 'font-family: Nunito, Arial, sans-serif; background:#f5f5f5; vertical-align:top; padding:6px; border-right:1px solid #ccc; width:215px;',
    tracklist: 'font-family: Nunito, Arial, sans-serif; padding:8px; vertical-align:top; width:100%; background:#ffffff;',
    toggleWrap: 'display:block; margin-bottom:8px;width:160px;',
    //deprecated
    //tracklistScroll: 'max-height:600px !important; overflow-y: scroll; overflow-x: hidden;',

    // Header and Title
    header: 'font-family: Nunito, Arial, sans-serif; font-weight:bold; text-align:left; font-size:20px; padding:4px; color:#222; background:#cc9393; border-bottom:1px solid #ccc;',
    gear: 'float:right; cursor:pointer; color:#666;',
    trackCount: 'color:#333; float:right; font-size:12px; display: inline-block; margin-right:15px; margin-top:5px;',

    // Buttons & Controls
    button: 'display:block; margin-bottom:4px; width:100%; font-size:11px; background:#e0e0e0; color:#333; border:1px solid #bbb;',
    utilityContainer: 'width:90%; font-size:12px; padding:4px 6px; background:#ddd; color:#333; border:1px solid #bbb; border-radius:4px; margin-top:6px; position:relative;',
    utilitySubButton: 'font-size:11px; padding:1px 5px; background:#aaa; color:#333; border:1px solid #999; border-radius:3px; margin:-1px -1px 0px 3px; float:right; text-decoration:none;',
    utilityButton: 'width:90%;display:inline-block; font-size:12px; padding:4px 6px; background:#ddd; color:#222; border:1px solid #bbb; border-radius:4px; text-align:center; margin-top:6px; text-decoration:none;',
    settingsButton: 'width:90%;display:inline-block; font-size:12px; padding:4px 6px; background:transparent; color:#333; text-align:center; margin-top:6px; text-decoration:none;',
        forceTextColor: 'color:#222',

    // *** Updated header buttons to match cssDark measurements but cssLight colors from utility buttons ***
    headerButtonContainer: 'float:right; display:inline-block; font-size:12px; padding:4px 6px; border:1px solid #666; border-radius:4px; text-decoration:none; margin-top:-2px; margin-right:4px; background:#ddd; color:#333;',
    headerButton: 'float:right; font-size:12px; padding:4px 6px; border:1px solid #666; border-radius:4px; text-decoration:none; margin-top:-2px; margin-right:4px; background:#ddd; color:#222;',
    headerSubButton:       'font-size:11px; padding:1px 6px; border:1px solid #999; border-radius:3px; text-decoration:none; margin-top:-2px; background:#aaa; color:#333;',
    headerSubButtonActive: 'font-size:11px; padding:1px 6px; border:1px solid #333; border-radius:3px; text-decoration:none; margin-top:-2px; background:#C27575; color:#333;',

    nowPlayingButton: 'color:#444; padding:2px 4px; display:block; text-decoration:none; background:#eee; border-radius:4px; margin-top:6px;',
    refreshButton: 'font-size:10px; margin-top:8px; display:block; color:#0066cc; text-decoration:underline; cursor:pointer;',

    //announce styles
    announceButton: 'color:#888; font-size:10px; padding:0px 4px; display:inline-block; text-decoration:none; margin-top:4px;',
    announceTitle: 'display:inline-block; font-size:16px; rexr-align:center; font-weight:bold; color:#333; margin-top:4px;',
    announceDesc: 'margin-top:4px; font-size:11px; color:#555; line-height:15px;',

    // Sidebar Links & Rules
    sidebarRule: 'border:0; border-top:1px solid #ccc; margin:20px 0 3px 0;',
    sidebarLink: 'color:#444; padding:2px 4px; display:block; text-decoration:none;',
    albumSelectedLink: 'background:#c22929; color:#fff; padding:2px 4px; display:block; border-radius:4px; text-decoration:none;',
    playlistSelectedLink: 'background:#2d5da6; color:#fff; padding:2px 4px; display:block; border-radius:4px; text-decoration:none;',

    // Album/Playlist Tags
    tags: 'margin-top:4px; margin-left:38px; display:block;',
    albumTag: 'display:inline-block; background:#c22929; color:#fff; border-radius:4px; padding:2px 6px; font-size:10px; margin-right:2px; vertical-align:middle;',
    playlistTag: 'display:inline-block; background:#2d5da6; color:#fff; border-radius:4px; padding:2px 6px; font-size:10px; margin-right:2px; vertical-align:middle;',
    tagRemove: 'color:#fff; margin-left:2px; cursor:pointer;',

    // Toggle Buttons
    toggleButton: 'display:inline-block; width:45%; padding:6px 0; font-weight:bold; border:1px solid #bbb; border-radius:4px; text-align:center; margin-right:4px;',
    toggleActiveAlbums: 'background:#c22929; color:#fff;',
    toggleActivePlaylists: 'background:#2d5da6; color:#fff;',
    toggleInactive: 'background:#bbb; color:#666;',

    // Message styles
    messageContainer: 'font-family: Nunito, Arial, sans-serif; background-color:#ccc; color:#111; padding:10px; position:relative; top:-15px; left:-5px; border: solid 1px #555; border-radius:5px;',
    messageTitle: 'padding: 3px 0px; background-color:#444; border-radius:4px; color:#ddd; font-size:16px; text-transform: capitalize; text-align:center; margin-bottom:13px;',
    messageButton: 'display:inline-block; background:#aaa; color:#111; border: solid 1px #666;border-radius:4px; padding:2px 6px; margin-right:2px; vertical-align:middle;',
    descHelp: 'margin-top:4px; font-size:15px; color:#222;',

    // Track Item Styles
    track: 'border-bottom:1px solid #ccc; padding:6px 0; display:table; width:100%; color:#333;',
    trackTitle: 'display:inline-block; font-size:18px; font-weight:bold; color:#333;',
    controls: 'float:right; margin-top:-2px;',
    controlButtonImg: 'width:16px; height:16px; margin: 0px 2px; vertical-align:middle; cursor:pointer;',
    desc: 'margin-top:4px; font-size:13px; color:#666; margin-left:38px;',
    vol: 'font-size:11px; margin-top:4px; color:#999; margin-left:108px;',
    albumEditLink: 'font-size:10px; margin-left:4px; vertical-align:middle; color:#666;',
    descEditLink: 'font-size:10px; color:#888; font-style:italic; margin-left:6px; cursor:pointer;',
    code: 'display:inline-block; font-size:0.75em; font-family:monospace; font-weight:bold; color:222; background-color:#ddd; padding:1px 4px; margin-left:4px; border-radius:3px; user-select:none;',
volumeControl: 'font-size:10px; color:#888; text-decoration:none; margin-left:8px; margin-top:4px; cursor:pointer;',

    // Images
    image: 'width:100px; height:100px; background:#eee; text-align:center; font-size:11px; color:#999; border:1px solid #bbb; float:left; margin-right:8px; object-fit:cover; object-position:center center; display:block;',
    imageDiv: 'width:100px; height:100px; background-size:cover; background-position:center; border:1px solid #bbb; margin-right:8px; float:left; display:block;',
    imagePlaceholder: 'width:100px; background:#eee; color:#999; text-align:center; font-size:11px; border:1px solid #bbb; margin-right:8px; float:left; display:block; padding-top:35px; height:65px; line-height:18px;',

    // Album specific
    albumImage: 'width:80px; height:80px; object-fit:cover; border:1px solid #bbb; margin-right:8px;',
    albumHeaderDesc: 'font-size:12px; color:#666;',
    addAlbum: 'font-size:10px; margin-top:8px; display:block; color:#666;'
};




    const cssDark = {
        // Layout Containers
        sidebar: 'font-family: Nunito, Arial, sans-serif; background:#222; vertical-align:top; padding:6px; border-right:1px solid #444; width:200px;',
        tracklist: 'font-family: Nunito, Arial, sans-serif; padding:8px; vertical-align:top; width:100%; background:#1e1e1e;',
        toggleWrap: 'display:block; margin-bottom:8px;width:160px;',
        //deprecated
        //tracklistScroll: 'max-height:600px !important; overflow-y: scroll; overflow-x: hidden;',

        // Header and Title
        header: 'font-family: Nunito, Arial, sans-serif; font-weight:bold; text-align:left; font-size:20px; padding:4px; color:#ddd; background:#542d2d; border-bottom:1px solid #444;',
        gear: 'float:right; cursor:pointer; color:#aaa;',
        trackCount: 'color:#888; float:right; font-size:12px; display: inline-block; margin-right:15px; margin-top:5px;',

        // Buttons & Controls
        button: 'display:block; margin-bottom:4px; width:100%; font-size:11px; background:#333; color:#ccc; border:1px solid #555;',
        utilityContainer: 'width:90%; font-size:12px; padding:4px 6px; background:#555; color:#ddd; border:1px solid #444; border-radius:4px; margin-top:6px; position:relative;',
        utilitySubButton: 'font-size:11px; padding:1px 5px; background:#444; color:#ccc; border:1px solid #444; border-radius:3px; margin:-1px -1px 0px 3px; float:right; text-decoration:none;',
        utilityButton: 'width:90%;display:inline-block; font-size:12px; padding:4px 6px; background:#555; color:#ddd; border:1px solid #444; border-radius:4px; text-align:center; margin-top:6px; text-decoration:none;',
        settingsButton: 'width:90%;display:inline-block; font-size:12px; padding:4px 6px; background:transparent; color:#ddd; text-align:center; margin-top:6px; text-decoration:none;',
        headerButtonContainer: 'float:right; display:inline-block; font-size:12px; padding:4px 6px; background:#555; color:#ddd; border:1px solid #444; border-radius:4px; text-decoration:none; margin-top:-2px; margin-right:4px;',
        headerButton: 'float:right; font-size:12px; padding:4px 6px; background:#555; color:#ddd; border:1px solid #444; border-radius:4px; text-decoration:none; margin-top:-2px; margin-right:4px;',
        headerSubButton: 'font-size:11px; padding:1px 6px; background:#444; color:#ddd; border:1px solid #444; border-radius:2px; text-decoration:none; margin-top:-2px;',
        headerSubButtonActive: 'font-size:11px; padding:1px 6px; border:1px solid #333; border-radius:3px; text-decoration:none; margin-top:-2px; background:#C27575; color:#333;',
        nowPlayingButton: 'color:#ccc; padding:2px 4px; display:block; text-decoration:none; background:#444; border-radius:4px; margin-top:6px;',
        refreshButton: 'font-size:10px; margin-top:8px; display:block; color:#66aaff; text-decoration:underline; cursor:pointer;',
        forceTextColor: 'color:#ddd',

        //announce styles
        announceButton: 'color:#888; font-size:10px; padding:0px 4px; display:inline-block; text-decoration:none; margin-top:4px;',
        announceTitle: 'display:inline-block; font-size:16px; font-weight:bold; color:#ccc; margin-top:4px;',
        announceDesc: 'margin-top:4px; font-size:11px; color:#aaa; line-height:15px;',

        // Sidebar Links & Rules
        sidebarRule: 'border:0; border-top:1px solid #444; margin:20px 0 3px 0;',
        sidebarLink: 'color:#ccc; padding:2px 4px; display:block; text-decoration:none;',
        albumSelectedLink: 'background:#993333; color:#eee; padding:2px 4px; display:block; border-radius:4px; text-decoration:none;',
        playlistSelectedLink: 'background:#334477; color:#eee; padding:2px 4px; display:block; border-radius:4px; text-decoration:none;',

        // Album/Playlist Tags
        tags: 'margin-top:4px; margin-left:38px; display:block;',
        albumTag: 'display:inline-block; background:#993333; color:#eee; border-radius:4px; padding:2px 6px; font-size:10px; margin-right:2px; vertical-align:middle;',
        playlistTag: 'display:inline-block; background:#334477; color:#eee; border-radius:4px; padding:2px 6px; font-size:10px; margin-right:2px; vertical-align:middle;',
        tagRemove: 'color:#eee; margin-left:2px; cursor:pointer;',

        // Toggle Buttons
        toggleButton: 'display:inline-block; width:45%; padding:6px 0; font-weight:bold; border:1px solid #555; border-radius:4px; text-align:center; margin-right:4px;',
        toggleActiveAlbums: 'background:#993333; color:#eee;',
        toggleActivePlaylists: 'background:#334477; color:#eee;',
        toggleInactive: 'background:#444; color:#aaa;',

        //Chat message Styles
        messageContainer: 'font-family: Nunito, Arial, sans-serif;  background-color:#222; color:#ccc; padding:10px; position:relative; top:-15px; left:-5px; Border: solid 1px #444; border-radius:5px',
        messageTitle: 'color:#ddd; font-size:16px; text-transform: capitalize; text-align:center;margin-bottom:13px;',
        messageButton: 'display:inline-block; background:#444; color:#ccc; border-radius:4px; padding:2px 6px; margin-right:2px; vertical-align:middle',
        descHelp: 'margin-top:4px; font-size:15px; color:#eee; ',

        // Track Item Styles
        track: 'border-bottom:1px solid #444; padding:6px 0; display:table; width:100%; color:#ccc;',
        trackTitle: 'display:inline-block; font-size:18px; font-weight:bold; color:#ccc;margin-top:2px;',
        controls: 'float:right; margin-top:-2px;',
        controlButtonImg: 'width:16px; height:16px; margin: 4px 2px; vertical-align:middle; cursor:pointer;',
        desc: 'margin-top:4px; font-size:13px; color:#aaa; margin-left:38px;',
        vol: 'font-size:11px; margin-top:4px; color:#999; margin-left:108px;',
        albumEditLink: 'font-size:10px; margin-left:4px; vertical-align:middle; color:#aaa;',
        descEditLink: 'font-size:10px; color:#888; font-style:italic; margin-left:6px; cursor:pointer;',
        code: 'display:inline-block; font-size:0.75em; font-family:monospace; font-weight:bold; color:eee; background-color:#444; padding:1px 4px 0px 4px; margin-left:4px; border-radius:3px; user-select:none;',
volumeControl: 'font-size:10px; color:#888; text-decoration:none; margin: 0px 6px; cursor:pointer;',

        // Images
        image: 'width:100px; height:100px; background:#444; text-align:center; font-size:11px; color:#999; border:1px solid #666; float:left; margin-right:8px; object-fit:cover; object-position:center center; display:block;',
        imageDiv: 'width:100px; height:100px; background-size:cover; background-position:center; border:1px solid #666; margin-right:8px; float:left; display:block;',
        imagePlaceholder: 'width:100px; background:#444; color:#999; text-align:center; font-size:11px; border:1px solid #666; margin-right:8px; float:left; display:block; padding-top:35px; height:65px; line-height:18px;',

        // Album specific
        albumImage: 'width:80px; height:80px; object-fit:cover; border:1px solid #666; margin-right:8px;',
        albumHeaderDesc: 'font-size:12px; color:#bbb;',
        addAlbum: 'font-size:10px; margin-top:8px; display:block; color:#ccc;'
    };


    // Set active theme styles and icons based on saved mode
    let css = data.settings.mode === 'light' ? cssLight : cssDark;
    let icons = data.settings.mode === 'light' ? iconSetLight : iconSetDark;


// Initiatlizes the ID of the currently scheduled timeout used for managing the Mix playback mode.
let mixTimeoutId = null;

const getDirectorHandoutLink = () => {
  if (typeof API_Meta !== 'undefined' &&
      API_Meta.Director &&
      typeof API_Meta.Director.offset === 'number') {
    
    const handout = findObjs({ type: 'handout', name: 'Director' })[0];
    if (handout) {
      const url = `http://journal.roll20.net/handout/${handout.id}`;
      return `<a href="${url}" style="${css.headerButton}"><span style="${css.forceTextColor}">Direct</span></a>`;
    }
  }
  return '';
};



// Renders the help documentation view in the Jukebox Plus handout, styled according to current theme mode.
    const renderHelpView = () =>
    {
        const handout = findObjs(
        {
            _type: 'handout',
            name: HANDOUT_NAME
        })[0];
        if(!handout) return;

        const css = data.settings.mode === 'light' ? cssLight : cssDark;

//HTML that displays the help documentation
const helpHTML = `
  <div style="${css.header}">
    Jukebox Plus — Help
    <a href="!jb help close" style="${css.headerButton}">Return to Player</a>
  </div>
  <div style="${css.tracklist}; padding:8px; line-height:1.6;">

    <div style="${css.trackTitle}">Getting Started</div>
    <div style="${css.descHelp}">
      Jukebox Plus lets you organize and control music tracks by <strong>albums</strong> or <strong>playlists</strong>.
      Use the toggle buttons in the sidebar to switch between views. Tracks are displayed on the right, and control
      buttons appear for each one.
    </div>
    <br><br>

    <div style="${css.trackTitle}">Header Buttons</div>
    <div style="${css.descHelp}">
      At the top right of the interface:
    </div>
    <span style="${css.trackCount}">10 tracks</span>
    <div style="${css.headerButtonContainer}float:none;">
      Play All 
      <a style="${css.headerSubButton}">Together</a>
      <a style="${css.headerSubButton}">In Order</a>
      <a style="${css.headerSubButton}">Loop</a>
      <a style="${css.headerSubButton}">Mix</a>
    </div>
    <div style="${css.headerButtonContainer}float:none;">
      Loop All
      <a style="${css.headerSubButton}">Off</a>
      <a style="${css.headerSubButton}">On</a>
    </div>
    <a style="${css.headerButton}float:none;">Stop All</a>
    <a style="${css.headerButton}float:none;">Find</a>
    <a style="${css.headerButton}float:none;">Help</a>

    <br><br>
    <div style="${css.descHelp}">

      <b>Play All</b><br>
      <div style="margin-left:15px">
        <b>Together</b> — Plays all visible tracks simultaneously. Limited to the first five visible.<br>
        <b>In order</b> — Plays all visible tracks one after the other.<br>
        <b>Loop</b> — Plays all visible tracks one after the other, then starts over.<br>
        <b>Mix</b> — Plays all looping tracks continuously, and all other tracks at random intervals. Use to create a custom soundscape. Stopped by <b>StopAll</b><br>
      </div>

      <b>Loop</b><br>
      <div style="margin-left:15px">
        <b>Off</b> — Disables loop mode for all visible tracks<br>
        <b>On</b> — Enables loop mode for all visible tracks<br>
      </div>
      
      <b>Stop All</b> — Stops all currently playing tracks. Also use to stop a Mix.<br>
      <b>Find</b> — Search all track names and descriptions for the keyword. All matching tracks will be assigned to a temporary album called <b>Found</b>. You can then switch to the Found album to quickly view the results. To clear the results, simply delete the Found album using the Utility panel.<br>If you input "d" as the search term, it will create a temporary album of any duplicate tracks, grouped by name.<br>
      <b>Help</b> — Displays this help page. Click <b>Return to Player</b> to return.
    </div>

    <br><br>

    <div style="${css.trackTitle}">Sidebar: Navigation & Now Playing</div>
    <br>
    <div style="${css.descHelp}">
      <b>View Mode Toggle</b><br>
      The left sidebar lists all albums or playlists, depending on the current view mode. Clicking a name switches the view.
      <br>
      <div style="display:block; width:250px;">
        <a style="${css.albumSelectedLink}display:inline-block;">Albums</a> 
        <a style="${css.playlistSelectedLink}display:inline-block;">Playlists</a>
      </div>
      <div style="${css.descHelp}">
        These buttons let you switch between organizing by:
        <br>
        <b>Album</b> tags or by manual <b>Playlists</b>. Albums are groupings of tracks that you define through Jukebox Plus. You can make as many of these as you like, and any track may belong to multiple albums.
        <b>Playlists</b> are managed by the Roll20 Jukebox interface. You can view and play them here, but you cannot move them about.
      </div>
      <div style="${css.descHelp}">
        At the bottom of the list is:<br>
        <a style="${css.albumSelectedLink}width:130px;">Now Playing</a> Choosing this filters the list to show only tracks currently playing.
      </div>
      <br><br>

      <div style="${css.trackTitle}">Track Controls</div>
      <div style="${css.descHelp}">
        Each track shows these control buttons:<br>

        <div style="margin-left:15px">
          <img src="${icons.play}" width="20" height="20"> <strong>Play</strong>: Start the track.<br>
          <img src="${icons.loop}" width="20" height="20"> <strong>Loop</strong>: Toggle loop mode for the track.<br>
          <img src="${icons.isolate}" width="20" height="20"> <strong>Isolate</strong>: Stops all others and plays only this one.<br>
          <img src="${icons.stop}" width="20" height="20"> <strong>Stop</strong>: Stops this track.<br>
          <a style="${css.announceButton}">➤</a> <strong>Announce</strong>: Sends the track name and description to the chat window.<br>
        </div>
        <br><br>

        <div style="${css.trackTitle}">Track Info and Management</div>
        <div style="${css.descHelp}">
          <b>Edit</b> — Click the track description "edit" link to create a description.<br>
          <div style="margin-left:15px">
            Description special characters:<br>
            "---" to insert a line break.<br>
            "*italic*" surround a word in single asterisks to have it display in italic<br>
            "**bold**" surround a word in double asterisks to have it display in bold<br>
            "!d" or "!desc" to include the description of the track when you announce it. Default is title only.<br>
            "!a" or "!announce" to have a track announce itself automatically whenever you play it. Default is manual announcement only.
          </div>
          <br>
          <b>Tags</b> — Each track has a Playlist tag, and the ability to add album tags. <span style="${css.playlistTag}">Playlist</span> tags are in blue, and <span style="${css.albumTag}">album</span> tags are in red. Click <span style="${css.albumTag}">+ Add</span> to add a track to an Album. Click a Playlist or Album tag to jump immediately to that Playlist or Album. Click the "x" in an Album tag to remove the track from that Album: <span style="${css.albumTag}">Album name | x</span><br>
          <b>Image Area</b> — Click the image area to submit a valid image URL or a hexadecimal color code, such as "#00ff00". You can also enter a common CSS color name such as "red".<br>
          If you submit an image URL, the image will display here next to the title, or in the chat tab while Announcing a track. The URL can come from your Roll20 image library or any valid image host.<br>
          If you submit a valid color code or name, the square will turn that color, and that color will be used when Announcing a track.
        </div>
        <br>
        <br>

        <div style="${css.trackTitle}">Utility Panel</div>
        <div style="${css.descHelp}">
          Click <div style="display: inline-block; width: 100px; text-align:left;">
            <a style="${css.settingsButton}">Settings ▾</a>
          </div> to expand the utility tools. Includes:
          <br>
          <div style="margin-left:15px">
            <div style="width: 170px; text-align:left;">
              <div style="${css.utilityContainer}">Edit Albums:</strong>
                <a style="${css.utilitySubButton}">–</a>
                <a style="${css.utilitySubButton}">+</a>
                <a style="${css.utilitySubButton}">✎</a>
              </div>
            </div>

            These buttons change the name of an album, add a new album, or remove the currently selected album. There is no verification, so use with care.
            <br>

            <div style="width: 170px; text-align:left;">
              <div style="${css.utilityContainer}">A—Z</strong>
                <a style="${css.utilitySubButton}">albums</a>
                <a style="${css.utilitySubButton}">tracks</a>
              </div>
            </div>
            These buttons alphabetize Albums, or Tracks within an Album.

            <div style="width: 170px; text-align:left;">
              <div style="${css.utilityContainer}">Mode:</strong>
                <a style="${css.utilitySubButton}">dark</a>
                <a style="${css.utilitySubButton}">light</a>
              </div>
            </div>

            These buttons switch between light and dark mode.

            <div style="width: 170px; text-align:left;">
              <a style="${css.utilityButton}">↻ Refresh</a>
            </div> Rebuilds the interface if something breaks.

<div style="width: 170px; text-align:left;">
  <div style="${css.utilityContainer}">Mix Rate</strong>
    <a style="${css.utilitySubButton}">60s</a>
    <a style="${css.utilitySubButton}">10s</a>
    <a style="${css.utilitySubButton}">↻</a>
  </div>
</div>
These buttons adjust how often tracks are played when using the <b>Mix</b> function in <b>Play All</b>.<br>
<ul style="margin-left:15px; padding-left:15px; list-style-type:disc;">
  <li><b>Maximum</b> — the longest delay allowed between playing non-looping tracks.</li>
  <li><b>Minimum</b> — the shortest delay allowed between playing non-looping tracks.</li>
  <li><b>Reset</b> — restores the default 10–60 second interval.</li>
</ul>
These values only apply when using <b>Mix</b> mode. Looping tracks are not affected.


            <div style="width: 170px; text-align:left;">
              <div style="${css.utilityContainer}">Backup</strong>
                <a style="${css.utilitySubButton}">make</a>
                <a style="${css.utilitySubButton}">restore</a>
              </div>
            </div>
            These buttons create a backup handout of the custom data you have entered: playlists, descriptions, and images. Higher numbered handouts are later backups. You can restore from a backup if your data gets screwed up, or you can transmogrify or copy the handout to a new game and restore from there. This is a useful way to move your customizations from game to game. Use with caution — Roll20 stores tracks by ID number which are different in every game, and the script tries hard to match title to ID. If you have multiple tracks with the same name or have renamed a track, this may not perform as expected.
          </div>
          <br><br>

          <div style="${css.trackTitle}">Find</div>
          <div style="${css.descHelp}">
            Use the <code>!jb find keyword</code> command to search all track names and descriptions for the keyword.
            All matching tracks will be assigned to a temporary album called <b>Found</b>. You can then switch to the Found album to quickly view the results. To clear the results, simply delete the Found album using the utility panel.
          </div>
          <br><br>

          <div style="${css.trackTitle}">Useful Macros</div>
          <div style="${css.descHelp}">
            Here are some chat commands that can be used in macros:<br>
            <div style="margin-left:15px">
              <code>!jb</code> — Puts a link to this handout in chat<br>
              <code>!jb play TrackName</code> — play the named track<br>
              <code>!jb stopall</code> — stops all audio<br>
              <code>!jb loopall</code> — sets loop mode on all visible tracks<br>
              <code>!jb unloopall</code> — disables loop mode on all tracks<br>
              <code>!jb jump album AlbumName</code> — switch to a specific album<br>
              <code>!jb help</code> — open this help screen<br>
              <code>!jb find keyword</code> search for tracks by keyword in name or description<br>
            </div>
            You can also discover commands by pressing a button, clicking in the chat window, and pressing the up arrow to see what was sent.
          </div>
          <br><br><br><br><br>
        </div>
      </div>
    </div>
  </div>
`;




        handout.set('notes', helpHTML);
    };

// Sends a styled message to chat, supporting optional titles and clickable links using markdown-style [label](command) syntax.
    function sendStyledMessage(titleOrMessage, messageOrUndefined, isPublic = false)
    {
        let title, message;

        if(messageOrUndefined === undefined)
        {
            title = 'Jukebox Plus';
            message = titleOrMessage;
        }
        else
        {
            title = titleOrMessage || 'Jukebox Plus';
            message = messageOrUndefined;
        }

    message = String(message); // ← Fix added here


        // Replace markdown-style [label](command) with styled <a>
        message = message.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, command) =>
        {
            return `<a href="${command}" style="${css.messageButton}">${label}</a>`;
        });

        const html = `<div style="${css.messageContainer}"> <div style="${css.messageTitle}">${title}</div>${message}</div>`;

        const target = isPublic ? '' : '/w gm ';
        sendChat('Jukebox Plus', `${target}${html}`, null,
        {
            noarchive: true
        });
    }

// Formats user-entered text with basic markup for bold, italics, code, and line breaks, and highlights shorthand commands like !a and !d.
const renderFormattedText = (text) => {
  if(!text) return '';
  return esc(text)
    .replace(/---+/g, '<br>')                 // replace --- with <br>
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')  // **bold**
    .replace(/\*(.+?)\*/g, `<span style="font-style:italic; font-family: Arial, sans-serif;">$1</span>`)
    .replace(/`(.+?)`/g, '<code>$1</code>')  // `code`
    .replace(/!a/gi, `<span style="${css.code}">announce</span>`) // announce codes
    .replace(/!d/gi, `<span style="${css.code}">desc</span>`);
};


// Escapes special characters for safe use in Roll20 query prompts (e.g. `?{}` and pipe-delimited lists).
const escapeForRoll20Query = (str) => {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/\?/g, '\\?')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');
};






// Escapes HTML special characters and replaces double slashes with <br> for safe HTML rendering.
    const esc = (s) => s.replace(/[&<>"']/g, c => (
        {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        } [c]))
        .replace(/\/{2}/g, '<br>');

const cssNamedColors = new Set([
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure',
  'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet',
  'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate',
  'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan',
  'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen',
  'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange',
  'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue',
  'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet',
  'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue',
  'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro',
  'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow',
  'grey', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki',
  'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue',
  'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray',
  'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen',
  'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue',
  'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon',
  'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple',
  'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
  'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin',
  'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange',
  'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise',
  'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum',
  'powderblue', 'purple', 'rebeccapurple', 'red', 'rosybrown', 'royalblue',
  'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna',
  'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow',
  'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato',
  'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'
]);



// Holds the state for sequential track playback, including track order, current position, active status, and loop mode.
let sequentialPlayState = {
    trackIds: [],
    currentIndex: -1,
    active: false,
    loop: false // <--- New!
};

// Returns your internal metadata object from `data.tracks`
const findInternalTrack = (idOrName) => {
    return data.tracks[idOrName] || Object.values(data.tracks)
        .find(t => t.title === idOrName);
};

// Returns the actual live Roll20 jukeboxtrack object
const findLiveTrack = (trackId) => {
    return findObjs({ _type: 'jukeboxtrack', _id: trackId })[0];
};

data.settings.playAllMode = data.settings.playAllMode || null;


// Convert linear slider percentage (0–100) to Roll20 volume curve (0–100)
const sliderPercentToStoredVolume = (p) => {
    return Math.round((Math.pow(p / 100, 2)) * 100);
};

// Convert stored volume value (0–100) to slider percent (0–100)
const storedVolumeToSliderPercent = (v) => {
    return Math.round(Math.sqrt((v || 0) / 100) * 100);
};


// Non-state variable for timer handlers
let mixAccentTimerHandles = [];


// Returns the list of tracks currently visible based on view mode (albums, playlists, now playing) and sorting preferences.
const getVisibleTrackList = () => {
    const getPlaylistTracks = () =>
    {
        const plist = data.playlists[data.settings.selectedPlaylist];
        return Array.isArray(plist) ? plist : [];
    };

    if (data.settings.nowPlayingOnly) {
        return Object.values(data.tracks).filter(t => {
            const actual = getAllTracks().find(j => j.id === t.id);
            return actual && actual.get('playing');
        });
    }

    if (data.settings.viewMode === 'albums') {
        const selected = data.settings.selectedAlbum;
        let tracks = Object.values(data.tracks).filter(t => t.albums.includes(selected));

        if (selected === 'Duplicates') {
            tracks.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
        } else if (data.trackSortOrder?.length) {
            const ordered = data.trackSortOrder
                .map(title => tracks.find(t => t.title === title))
                .filter(Boolean);
            const leftovers = tracks.filter(t => !data.trackSortOrder.includes(t.title));
            tracks = [...ordered, ...leftovers];
        }

        return tracks;
    }

    if (data.settings.viewMode === 'playlists') {
        const selected = data.settings.selectedPlaylist;
        const trackIds = data.playlists[selected] || [];
        return trackIds.map(id => data.tracks[id]).filter(Boolean);
    }

    return [];
};


    const getAllTracks = () => findObjs(
    {
        _type: 'jukeboxtrack'
    }) || [];

    // Sync playlists by walking the jukebox folder structure and building playlists object
    const syncPlaylists = () =>
    {
        let folderJSON = Campaign()
            .get('jukeboxfolder');
        if(!folderJSON)
        {
            log('Jukebox Plus: No jukebox folder found.');
            data.playlists = {
                'Unassigned': []
            };
            return;
        }

        let folder;
        try
        {
            folder = JSON.parse(folderJSON);
        }
        catch (e)
        {
            log('Jukebox Plus: Failed to parse jukeboxfolder JSON:', e);
            data.playlists = {
                'Unassigned': []
            };
            return;
        }

        log('Jukebox Plus: jukeboxfolder parsed:', JSON.stringify(folder));

        // Clear previous playlists before repopulating
        data.playlists = {};

        // Flatten walk through the folder structure
        // Each element is an object: { n: playlist name, i: array of track IDs }
        folder.forEach(playlist =>
        {
            if(!playlist.n || !Array.isArray(playlist.i)) return;

            const playlistName = playlist.n;
            if(!data.playlists[playlistName])
            {
                data.playlists[playlistName] = [];
            }

            playlist.i.forEach(trackId =>
            {
                const track = data.tracks[trackId];
                if(track)
                {
                    // Add track ID to playlist if not already present
                    if(!data.playlists[playlistName].includes(trackId))
                    {
                        data.playlists[playlistName].push(trackId);
                    }
                    // Also ensure this playlist is tracked in track.albums or track.playlists if you want
                }
                else
                {
                    log(`Jukebox Plus: Track ID [${trackId}] not found in jukebox tracks.`);
                }
            });
        });

        // If no playlists found, fallback to Unassigned
        if(Object.keys(data.playlists)
            .length === 0)
        {
            log('Jukebox Plus: No playlists created, adding Unassigned fallback.');
            data.playlists = {
                'Unassigned': []
            };
        }
    };

    // Sync tracks and playlists
    const syncTracks = () =>
    {
        getAllTracks()
            .forEach(track =>
            {
                const id = track.get('_id');
                const title = track.get('title');
                const volume = track.get('volume');
                if(!data.tracks[id])
                {
                    data.tracks[id] = {
                        id,
                        title,
                        volume,
                        albums: [],
                        description: '',
                        image: '',
                        sortOrder:
                        {}
                    };
                }
                else
                {
                    data.tracks[id].title = title;
                    data.tracks[id].volume = volume;
                }
            });
        syncPlaylists();
    };


// Builds the full HTML row for a single track, including controls, tags, and image display.
const buildTrackRow = (track) =>
{
    const isHexColor = /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(track.image || '');
    const isNamedColor = cssNamedColors.has((track.image || '').toLowerCase());
    const isURL = /^https?:\/\/.+/.test(track.image || '');

    const img = track.image
        ? `<a href="!jb edit ${track.id} image ?{New image or color code|${esc(track.image)}}">
                <div style="${css.imageDiv}; ${isHexColor || isNamedColor ? `background-color: ${track.image}; background-image: none;` : `background-image: url('${track.image}')`}">
                </div>
           </a>`
        : `<a href="!jb edit ${track.id} image ?{New image or color code|}">
                <div style="${css.imagePlaceholder}">click to add image or color code</div>
           </a>`;

    // Build album options respecting albumSortOrder, exclude albums already assigned to track
    const albumOptions = (data.albumSortOrder && data.albumSortOrder.length
        ? data.albumSortOrder.filter(a => data.albums.hasOwnProperty(a))
        : Object.keys(data.albums || {}))
        .filter(a => !track.albums.includes(a))
        .concat('New Album');

    // Escape and join for prompt
    const addAlbumQuery = albumOptions.map(a => esc(a)).join('|');

    const desc = track.description ?
        `<div style="${css.desc}">${renderFormattedText(track.description)} <a href="!jb edit ${track.id} description ?{New description|${esc(track.description)}}" style="${css.descEditLink}">[edit]</a></div>` :
        `<div style="${css.desc}"><a href="!jb edit ${track.id} description ?{New description|}" style="${css.descEditLink}">click to add description</a></div>`;

    // Live state of the jukebox track
    const actualTrack = findLiveTrack(track.id);
    const isPlaying = actualTrack && actualTrack.get("playing");
    const isLooping = actualTrack && actualTrack.get("loop");

    const playImg = isPlaying ? icons.playActive : icons.play;
    const loopImg = isLooping ? icons.loopActive : icons.loop;

    // Determine view modes
    const isAlbumView = data.settings.viewMode === 'albums' && !data.settings.nowPlayingOnly;
    const isNowPlaying = data.settings.nowPlayingOnly;

    // Determine playlist tag HTML
    let playlistTagHTML = '';
    if ((isAlbumView || isNowPlaying) && data.playlists) {
        const matchingPlaylist = Object.entries(data.playlists)
            .find(([name, ids]) =>
                ids.includes(track.id)
            );
        if (matchingPlaylist) {
            const [playlistName] = matchingPlaylist;
            const encoded = encodeURIComponent(playlistName);
            playlistTagHTML = ` <a href="!jb jump-playlist ${encoded}" style="${css.playlistTag}">${esc(playlistName)}</a>`;
        }
    }

    // Build add album button with sorted options
    const addAlbumButton = `<a href="!jb add-album-and-assign ${track.id} ?{Choose album|${addAlbumQuery}}" style="${css.albumTag}">+ Add</a>`;

    return `
<div style="${css.track}">
  ${img}
  <div style="margin-left:72px;">
    <div>
      <div style="${css.trackTitle}">
        ${esc(track.title)}
        <a href="!jb announce ${track.id}" style="${css.announceButton}">➤</a>
      </div>
      <span style="${css.controls}">
        <a href="!jb volume ${track.id} ?{Set volume 0–100|${storedVolumeToSliderPercent(actualTrack?.get('volume') ?? 100)}}" title="Set volume" style="${css.volumeControl}">v.${storedVolumeToSliderPercent(actualTrack?.get('volume') ?? 100)}% </a>
        <a href="!jb play ${track.id}" title="Play"><img src="${playImg}" alt="Play" style="${css.controlButtonImg}"></a>
        <a href="!jb loop ${track.id}" title="Loop"><img src="${loopImg}" alt="Loop" style="${css.controlButtonImg}"></a>
        <a href="!jb isolate ${track.id}" title="Isolate"><img src="${icons.isolate}" alt="Isolate" style="${css.controlButtonImg}"></a>
        <a href="!jb stop ${track.id}" title="Stop"><img src="${icons.stop}" alt="Stop" style="${css.controlButtonImg}"></a>
     </span>
    </div>
    ${desc}

    <div style="${css.tags}">
      ${
        (track.albums || []).map(name =>
          `<span style="${css.albumTag}">
            <a href="!jb jump album ${encodeURIComponent(name)}" title="Jump to album view" style="text-decoration:none; color:inherit;">${esc(name)}</a>
            &nbsp;|&nbsp;
<a href="!jb edit ${track.id} albums remove ${encodeURIComponent(name)}" style="text-decoration:none; color:inherit;">x</a>
          </span>`
        ).join(' ')
      }
      ${addAlbumButton}
      ${playlistTagHTML}
    </div>
  </div>
</div>
`;
};



    
    
// Returns an object with boolean flags indicating special playback options based on keywords in the track's description.
const getTrackFlags = (track) => {
    const desc = (track.description || '').toLowerCase();
    return {
        announce: desc.includes('!a') || desc.includes('!announce'),
        includeDesc: desc.includes('!d') || desc.includes('!desc')
    };
};

// Returns a sorted list of album names, ensuring the special 'Found' album is always listed last.
const getSortedAlbumNames = () => {
    let albumNames = data.albumSortOrder?.length
        ? data.albumSortOrder.filter(name => data.albums.hasOwnProperty(name))
        : Object.keys(data.albums);

    albumNames = albumNames.filter(name => name !== 'Found');
    if ('Found' in data.albums) albumNames.push('Found');

    return albumNames;
};


// Rebuilds the entire UI and updates the handout based on current settings and track states.
const updateInterface = () =>
{
    css = data.settings.mode === 'light' ? cssLight : cssDark;
    icons = data.settings.mode === 'light' ? iconSetLight : iconSetDark;

    const handout = findObjs(
    {
        _type: 'handout',
        name: HANDOUT_NAME
    })[0];
    if(!handout) return;

    // Ensure selected playlist/album exists, fallback if not
    if(data.settings.viewMode === 'playlists')
    {
        let selected = data.settings.selectedPlaylist;
        if(!selected || !data.playlists[selected])
        {
            const keys = Object.keys(data.playlists);
            if(keys.length)
            {
                selected = keys[0];
            }
            else
            {
                selected = 'Unassigned';
                data.playlists[selected] = [];
            }
            data.settings.selectedPlaylist = selected;
        }
    }
    if(data.settings.viewMode === 'albums')
    {
        let selected = data.settings.selectedAlbum;
        if(!selected || !data.albums[selected])
        {
            const keys = Object.keys(data.albums);
            data.settings.selectedAlbum = keys.length ? keys[0] : '';
        }
    }

    const getPlaylistTracks = () =>
    {
        const plist = data.playlists[data.settings.selectedPlaylist];
        return Array.isArray(plist) ? plist : [];
    };

    const toggleHTML = `
    <div style="${css.toggleWrap}">
      <a href="!jb view albums" style="${css.toggleButton} ${
        data.settings.viewMode === 'albums' ? css.toggleActiveAlbums : css.toggleInactive
      }">Albums</a>
      <a href="!jb view playlists" style="${css.toggleButton} ${
        data.settings.viewMode === 'playlists' ? css.toggleActivePlaylists : css.toggleInactive
      }">Playlists</a>
    </div>
  `;

const isAnyTrackPlaying = findObjs({ _type: 'jukeboxtrack' })
    .some(t => t.get('playing'));


    const sidebarList = (() =>
    {
        const entries = [];

        if(data.settings.viewMode === 'albums')
        {
const albumNames = data.albumSortOrder?.length
    ? data.albumSortOrder.filter(name => data.albums.hasOwnProperty(name))
    : Object.keys(data.albums);

getSortedAlbumNames().forEach(albumName => {
    const encodedName = encodeURIComponent(albumName);
    const style = (albumName === data.settings.selectedAlbum && !data.settings.nowPlayingOnly)
        ? css.albumSelectedLink
        : css.sidebarLink;
    entries.push(`<a href="!jb select album ${encodedName}" style="${style}">${esc(albumName)}</a>`);
});

        }
        else
        {
            Object.keys(data.playlists || {})
                .forEach(playlistName =>
                {
                    const encodedName = encodeURIComponent(playlistName);
                    const style = (playlistName === data.settings.selectedPlaylist && !data.settings.nowPlayingOnly) ?
                        css.playlistSelectedLink :
                        css.sidebarLink;
                    entries.push(`<a href="!jb select playlist ${encodedName}" style="${style}">${esc(playlistName)}</a>`);
                });
        }

        // Highlight Now Playing if active
        const nowPlayingStyle = data.settings.nowPlayingOnly ?
            (data.settings.viewMode === 'albums' ? css.albumSelectedLink : css.playlistSelectedLink) :
            css.sidebarLink;

        entries.push(`<a href="!jb view nowplaying" style="${nowPlayingStyle}">Now Playing</a>`);

        return entries.join('');
    })();

    const visibleTracks = Object.values(data.tracks)
        .filter(track =>
        {
            let matchesView = false;

            if(data.settings.viewMode === 'albums')
            {
                matchesView = data.settings.selectedAlbum ?
                    track.albums.includes(data.settings.selectedAlbum) :
                    true;
            }
            else
            {
                const plist = getPlaylistTracks();
                matchesView = plist.includes(track.id);
            }

if(data.settings.nowPlayingOnly)
{
    const t = findLiveTrack(track.id);
    return matchesView && t && t.get('playing');
}


            return matchesView;
        });

const trackList = getVisibleTrackList().map(buildTrackRow).join('');



    const utilityToggleText = data.settings.utilityExpanded ? 'Settings ▲' : 'Settings ▼';

    const utilityToggleButton = `<a href="!jb toggle-settings" style="${css.settingsButton}">
  Settings ${data.settings.settingsExpanded ? '▴' : '▾'}
</a>`;

 const utilityButtons = data.settings.settingsExpanded ? `
  ${utilityToggleButton}
  <div style="${css.utilityContainer}">
    Edit Albums
    <a href="!jb add album ?{Album Name}" title="Add a new album to your collection" style="${css.utilitySubButton}">+</a>
    <a href="!jb remove-album ?{Choose Album to Delete|${
      (() => {
        const names = Object.keys(data.albums);
        if (names.includes("Found")) {
          return ["Found", ...names.filter(n => n !== "Found")].join('|');
        } else {
          return names.join('|');
        }
      })()
    }}" title="Delete an existing album" style="${css.utilitySubButton}">–</a>
    <a href="!jb rename-album ?{Album to Rename|${Object.keys(data.albums).join('|')}} ?{New Album Name}" title="Rename an existing album" style="${css.utilitySubButton}">✎</a>
  </div>

  <div style="${css.utilityContainer}">
    A–Z
    <a href="!jb sort-tracks" title="Sort tracks alphabetically within albums" style="${css.utilitySubButton}">tracks</a>
    <a href="!jb sort-albums" title="Sort albums alphabetically in the sidebar" style="${css.utilitySubButton}">albums</a>
  </div>

  <div style="${css.utilityContainer}">
    Mix Rate
    <a href="!jb set-mix-max ?{Maximum mix interval (in seconds)|${data.settings.mixMaxInterval || 60}}" title="Maximum mix interval (in seconds)" style="${css.utilitySubButton}">${data.settings.mixMaxInterval || 60}s</a>
    <a href="!jb set-mix-min ?{Minimum mix interval (in seconds)|${data.settings.mixMinInterval || 10}}" title="Minimum mix interval (in seconds)" style="${css.utilitySubButton}">${data.settings.mixMinInterval || 10}s</a>
    <a href="!jb reset-mix-interval" title="Reset to default Mix timing (10–60s)" style="${css.utilitySubButton}">↻</a>
  </div>

  <a href="!jb refresh" title="Reload playlists, albums, and track data" style="${css.utilityButton}">↻ Refresh</a>

  <div style="${css.utilityContainer}">
    Mode
    <a href="!jb mode light" title="Switch to light interface theme" style="${css.utilitySubButton}">light</a>
    <a href="!jb mode dark" title="Switch to dark interface theme" style="${css.utilitySubButton}">dark</a>
  </div>

  <div style="${css.utilityContainer}">
    Backup
    <a href="!jb backup" title="Save a backup copy of current Jukebox data" style="${css.utilitySubButton}">make</a>
    <a href="!jb restore ?{Which backup?|${(
      findObjs({ _type: 'handout' })
        .map(h => h.get('name'))
        .filter(name => /^Jukebox Backup \d{3}$/.test(name))
        .sort()
        .join('|')
    )}}" title="Restore data from a previous backup" style="${css.utilitySubButton}">restore</a>
  </div>
` : utilityToggleButton;


    const html = `
 <table style="width:100%; border-collapse:collapse;">
  <tr>
    <td colspan="2" style="${css.header}">
      Jukebox Plus

      <a href="!jb ${data.settings.helpVisible ? 'help close' : 'help'}" 
         title="${data.settings.helpVisible ? 'Return to the track player interface' : 'Show help and instructions'}"
         style="${css.headerButton}">
        ${data.settings.helpVisible ? 'Return to Player' : 'Help'}
      </a>

      <a href="!jb find ?{search term}" 
         title="Search for tracks by name or description. Enter 'd' to find all duplicates." 
         style="${css.headerButton}">
        Find
      </a>
        ${getDirectorHandoutLink()}

      <a href="!jb stopall" 
         title="Stop all currently playing tracks and end any active play modes" 
         style="${css.headerButton}">
        Stop All
      </a>

      <div style="${css.headerButtonContainer}">Loop All
        <a href="!jb unloopall" 
           title="Disable looping on all visible tracks" 
           style="${css.headerSubButton}">
          Off
        </a>
        <a href="!jb loopall" 
           title="Enable looping on all visible tracks" 
           style="${css.headerSubButton}">
          On
        </a>
      </div>

      <div style="${css.headerButtonContainer}">Play All 
        <a href="!jb playall" 
           title="Play all visible tracks at once (up to 5 simultaneously)" 
           style="${data.settings.playAllMode === 'together' ? css.headerSubButtonActive : css.headerSubButton}">
          Together
        </a>
        <a href="!jb playall-seq" 
           title="Play all visible tracks one after another, once through" 
           style="${data.settings.playAllMode === 'sequential' ? css.headerSubButtonActive : css.headerSubButton}">
          In Order
        </a>
        <a href="!jb playall-seq-loop" 
           title="Play all visible tracks in sequence, looping continuously" 
           style="${data.settings.playAllMode === 'loop' ? css.headerSubButtonActive : css.headerSubButton}">
          Loop
        </a>
        <a href="!jb mix" 
           title="Start mix mode: loop some tracks and randomly play others" 
           style="${data.settings.playAllMode === 'mix' ? css.headerSubButtonActive : css.headerSubButton}">
          Mix
        </a>
      </div>


        
        
        

        <span style="${css.trackCount}">${visibleTracks.length} track${visibleTracks.length !== 1 ? 's' : ''}</span>

      </td>
    </tr>
    <tr>
      <td style="${css.sidebar}">
        ${toggleHTML}
        ${sidebarList}
        <hr style="${css.sidebarRule}">
        ${utilityButtons}
      </td>
      <td style="${css.tracklist}">${trackList}</td>
    </tr>
  </table>
`;

    handout.set('notes', html);
};


// Finds or creates the Jukebox Plus handout and sends a clickable link to it in chat.
    const sendHandoutLink = () =>
    {
        let handout = findObjs(
        {
            _type: 'handout',
            name: HANDOUT_NAME
        })[0];

        if(!handout)
        {
            handout = createObj('handout',
            {
                name: HANDOUT_NAME,
                inplayerjournals: 'all',
                archived: false
            });

            // Defer rendering just slightly to allow Roll20 to index the handout
            setTimeout(() => updateInterface(), 500);
        }
        
            sendStyledMessage(`[Open Jukebox Plus Handout](http://journal.roll20.net/handout/${handout.id})`);

    };


// Handles auto-playing the next track in sequence when one finishes during sequential playback.
on('change:jukeboxtrack', (obj, prev) => {
    if (!sequentialPlayState.active) return;

    // Detect when a track finishes playing (softstop turns true)
    if (prev.softstop === false && obj.get('softstop') === true && !obj.get('loop')) {
        const currentId = sequentialPlayState.trackIds[sequentialPlayState.currentIndex];

        if (obj.id === currentId) {
            obj.set('playing', false); // Optional cleanup

            sequentialPlayState.currentIndex++;

            // If we've reached the end of the list
            if (sequentialPlayState.currentIndex >= sequentialPlayState.trackIds.length) {
                if (sequentialPlayState.loop) {
                    sequentialPlayState.currentIndex = 0;
                } else {
                    sequentialPlayState.active = false;
                    sendStyledMessage('Sequence finished', 'Finished playing all tracks sequentially.');
                    updateInterface();
                    return;
                }
            }

            // Play next track in sequence
            const nextId = sequentialPlayState.trackIds[sequentialPlayState.currentIndex];
            const nextTrack = findLiveTrack(nextId);

            if (nextTrack) {
                nextTrack.set('softstop', false); // Reset in case it was marked finished before
                nextTrack.set('playing', true);
            } else {
                sequentialPlayState.currentIndex++; // skip missing track
            }

            updateInterface();
        }
    }
});


// Updates the UI to reflect play state changes when a track stops naturally outside of sequential playback.
on('change:jukeboxtrack', (obj, prev) => {
    if (sequentialPlayState.active) return;

    if (prev.softstop === false && obj.get('softstop') === true && !obj.get('loop')) {
        obj.set('playing', false);  // Clear playing state so icon updates correctly
        updateInterface();
        log("Track finished naturally, UI updated");
    }
});

// Handles all chat commands starting with !jb, parsing arguments and executing the matching command logic.
    on('chat:message', (msg) =>
    {
        if(msg.type !== 'api' || !msg.content.startsWith('!jb')) return;
        const match = msg.content.slice(3)
            .trim()
            .match(/(?:"[^"]*"|'[^']*'|\S)+/g);
        const args = match ? match.map(s => s.replace(/^['"]|['"]$/g, '')) : [];
        const command = args.shift() || '';

        const findTrackByIdOrName = (idOrName) =>
        {
            return data.tracks[idOrName] || Object.values(data.tracks)
                .find(t => t.title === idOrName);
        };

 


    // Controls playback of a single track: play, stop, loop toggle, or isolate (stop others)
if (["play", "loop", "stop", "isolate"].includes(command)) {
    const idOrName = args.join(' ').trim();

    const internal = findInternalTrack(idOrName);
    if (!internal) {
        sendStyledMessage('Warning', `Track not found: ${idOrName}`);
        return updateInterface();
    }

    const actual = findLiveTrack(internal.id);
    if (!actual) {
        sendStyledMessage(
            'Track Not Playable',
            `<b>"${esc(internal.title)}"</b><br><br>This track is listed in your saved data, but no matching Roll20 jukebox track exists.<br><br>This can happen if the track was deleted, if it was imported from another game, or if its ID changed. If you are sure this track no longer exists or is needed, you can remove it from your saved data.<br><br><a href="!jb delete-track ${internal.id}" style="${css.headerButton}">Remove this broken track</a><br>`,
            false
        );
        return updateInterface();
    }

    if (command === "play") {
        actual.set("playing", true);
        const flags = getTrackFlags(internal);
        if (flags.announce) {
            const descHtml = flags.includeDesc ? `<div style="${css.announceDesc}">${esc(internal.description || '')}</div>` : '';
            const imageHtml = internal.image
                ? `<img src="${internal.image}" style="width:100%; max-width:100%; height:auto;">`
                : '';
            const messageHtml = `${imageHtml}<div style="${css.announceTitle}">${esc(internal.title)}</div>${descHtml}`;
            sendStyledMessage('Now Playing', messageHtml, true);
        }
    }

    if (command === "stop") actual.set("playing", false);
    if (command === "loop") actual.set("loop", !actual.get("loop"));

    if (command === "isolate") {
        getAllTracks().forEach(t => t.set("playing", t.id === internal.id));
    }

    updateInterface();
}




   // Sends a link to the Jukebox Plus handout when no specific command is given
       if(command === '')
        {
            sendHandoutLink();
            return;
        }

    // Shows or hides the help view depending on argument ('help' or 'help close')
        if(command === 'help')
        {
            const sub = args[0]?.toLowerCase();
            data.settings.helpVisible = (sub !== 'close');
            if(data.settings.helpVisible)
            {
                renderHelpView();
            }
            else
            {
                updateInterface();
            }
            return;
        }


    // Plays all tracks currently visible in the view, up to a maximum of 5 simultaneously
if(command === 'playall')
{
    const trackList = (() =>
    {
        if(data.settings.viewMode === 'albums')
        {
            const albumName = data.settings.selectedAlbum;
            return Object.values(data.tracks)
                .filter(t => t.albums.includes(albumName));
        }
        else if(data.settings.viewMode === 'playlists')
        {
            const trackIds = data.playlists[data.settings.selectedPlaylist] || [];
            return trackIds.map(id => data.tracks[id])
                .filter(Boolean);
        }
        return [];
    })();

    const actualTracks = trackList
        .map(t => getAllTracks()
            .find(j => j.id === t.id))
        .filter(t => t);

    const max = 5;

    actualTracks.slice(0, max)
        .forEach(t => {
            t.set('playing', true);

            const flags = getTrackFlags(data.tracks[t.id]);
            if (flags.announce) {
                const descHtml = flags.includeDesc ? `<div style="${css.announceDesc}">${esc(data.tracks[t.id].description || '')}</div>` : '';
                const imageHtml = data.tracks[t.id].image ?
                    `<img src="${data.tracks[t.id].image}" style="width:100%; max-width:100%; height:auto;">` :
                    '';
                const messageHtml = `${imageHtml}<div style="${css.announceTitle}">${esc(data.tracks[t.id].title)}</div>${descHtml}`;
                sendStyledMessage('Now Playing', messageHtml, true);
            }
        });

    if(actualTracks.length > max)
    {
        sendStyledMessage('Notice', 'Only the first 5 tracks were played to avoid clutter.');
    }
data.settings.playAllMode = 'together'; // ✅ Add this line

    updateInterface();
}

    // Plays all visible tracks sequentially, starting from the first one
if (command === 'playall-seq') {
    const visibleTracks = getVisibleTrackList();
    const max = 20;

    const actualTracks = visibleTracks
        .map(t => findLiveTrack(t.id))

        .filter(Boolean)
        .slice(0, max);

    if (actualTracks.length === 0) {
        sendStyledMessage('No tracks', 'No tracks found to play.');
        return;
    }

    // Store track IDs for sequential playing
    sequentialPlayState.trackIds = actualTracks.map(t => t.id);
    sequentialPlayState.currentIndex = 0;
    sequentialPlayState.active = true;

    // Start first track
    const firstTrack = actualTracks[0];
    firstTrack.set('softstop', false);
    firstTrack.set('playing', true);

data.settings.playAllMode = 'sequential'; // ✅ Add this line

    updateInterface();
}


    // Plays all visible tracks sequentially in a loop, restarting after last track ends
if(command === 'playall-seq-loop') {
    const visibleTracks = getVisibleTrackList(); // Same display order used by updateInterface

    const max = 20;
    const actualTracks = visibleTracks
        .map(t => findLiveTrack(t.id))
        .filter(Boolean)
        .slice(0, max);

    if (actualTracks.length === 0) {
        sendStyledMessage('No tracks', 'No tracks found to play.');
        return;
    }

    sequentialPlayState.trackIds = actualTracks.map(t => t.id);
    sequentialPlayState.currentIndex = 0;
    sequentialPlayState.active = true;
    sequentialPlayState.loop = true; // 👈 enables looping after the last track

    // Stop all currently playing tracks
    getAllTracks().forEach(t => t.set('playing', false));

    const firstTrack = actualTracks[0];
    firstTrack.set('softstop', false); // ensure it will start
    firstTrack.set('playing', true);

data.settings.playAllMode = 'loop'; // ✅ Add this line

    updateInterface();
}

// Global timer variable, declared once outside the command handler
let mixAccentTimer = null;

//Sets minimum interval between accent tracks during mix play
if (command === 'set-mix-min') {
    const sec = parseInt(args[0], 10);
    if (!isNaN(sec) && sec >= 1 && sec <= 3600) {
        data.settings.mixMinInterval = sec;
        updateInterface();
    } else {
        sendStyledMessage('Error', 'Invalid minimum interval (1–3600 seconds only).');
    }
}

//Sets maximum interval between accent tracks during mix play
if (command === 'set-mix-max') {
    const sec = parseInt(args[0], 10);
    if (!isNaN(sec) && sec >= 1 && sec <= 3600) {
        data.settings.mixMaxInterval = sec;
        updateInterface();
    } else {
        sendStyledMessage('Error', 'Invalid maximum interval (1–3600 seconds only).');
    }
}

//Re-sets interval between accent tracks during mix play to defaults
if (command === 'reset-mix-interval') {
    data.settings.mixMinInterval = 10;
    data.settings.mixMaxInterval = 60;
    updateInterface();
}



    // Starts a "mix" mode: plays looping tracks continuously and plays non-looping tracks randomly at intervals
if (command === 'mix') {
    if (args[0] === 'stop') {
        sendStyledMessage('Info', 'Use !jb stopall to stop all playback including mix mode.');
        return;
    }

    // Clear any legacy or active mix timers
    mixAccentTimerHandles.forEach(id => clearTimeout(id));
    mixAccentTimerHandles = [];

    if (mixAccentTimer) {
        clearTimeout(mixAccentTimer);
        mixAccentTimer = null;
    }

    // Stop all playing tracks
    getAllTracks().forEach(t => t.set('playing', false));

    const visibleTracks = getVisibleTrackList();
    const max = 20;
    const actualTracks = visibleTracks
        .map(t => getAllTracks().find(j => j.id === t.id))
        .filter(Boolean)
        .slice(0, max);

    if (actualTracks.length === 0) {
        sendStyledMessage('No tracks', 'No tracks found to play.');
        return;
    }

    const loopingTracks = actualTracks.filter(t => t.get('loop'));
    const nonLoopingTracks = actualTracks.filter(t => !t.get('loop'));

    // Start looping tracks immediately
    loopingTracks.forEach(t => {
        t.set('softstop', false);
        t.set('playing', true);
    });

    // Store mode flag (safe)
    data.settings.playAllMode = 'mix';

    // Use configured or default mix intervals
    const minDelay = (data.settings.mixMinInterval || 10) * 1000;
    const maxDelay = (data.settings.mixMaxInterval || 60) * 1000;

    // Set up individual repeating accent timers
    nonLoopingTracks.forEach(track => {
        const playAccent = () => {
            const liveTrack = findLiveTrack(track.id);
            if (liveTrack) {
                liveTrack.set('softstop', false);
                liveTrack.set('playing', true);
            }

            const nextDelay = minDelay + Math.floor(Math.random() * (maxDelay - minDelay));
            const timerId = setTimeout(playAccent, nextDelay);
            mixAccentTimerHandles.push(timerId);
        };

        const initialDelay = 3000 + Math.floor(Math.random() * 5000);
        const timerId = setTimeout(playAccent, initialDelay);
        mixAccentTimerHandles.push(timerId);
    });

    updateInterface();
}


    // Stops all playing tracks and cancels any active mix timer
if (command === 'stopall') {
    // Stop all tracks
    getAllTracks().forEach(t => t.set('playing', false));

    // Cancel legacy single mix timer if active
    if (mixAccentTimer) {
        clearTimeout(mixAccentTimer);
        mixAccentTimer = null;
    }

    // Cancel all individual mix timers if present
    if (Array.isArray(mixAccentTimerHandles)) {
        mixAccentTimerHandles.forEach(id => clearTimeout(id));
        mixAccentTimerHandles = [];
    }

    // Clear session state and mode flag
    state.GraphicJukebox.mixSession = null;
    data.settings.playAllMode = null;

    updateInterface();
}





    // Toggles loop state for all tracks in current album or playlist view
        else if(command === 'loopall' || command === 'unloopall')
        {
            const trackList = (() =>
            {
                if(data.settings.viewMode === 'albums')
                {
                    const albumName = data.settings.selectedAlbum;
                    return Object.values(data.tracks)
                        .filter(t => t.albums.includes(albumName));
                }
                else if(data.settings.viewMode === 'playlists')
                {
                    const trackIds = data.playlists[data.settings.selectedPlaylist] || [];
                    return trackIds.map(id => data.tracks[id])
                        .filter(Boolean);
                }
                return [];
            })();
            const shouldLoop = (command === 'loopall');

            const actualTracks = trackList
                .map(t => getAllTracks()
                    .find(j => j.id === t.id))
                .filter(t => t);

            actualTracks.forEach(t => t.set('loop', shouldLoop));

            updateInterface();
        }

    // Forces a refresh of track data from Roll20's jukebox and updates the interface
        if(command === 'refresh')
        {
            syncTracks();
            updateInterface();
            sendStyledMessage('Track data refreshed.');
        }

    // Creates a backup of all track, album, and playlist data into a new archived handout
        if(command === 'backup')
        {
            const backupData = {
                tracks:
                {},
                albums:
                {
                    ...data.albums
                },
                playlists:
                {},
                albumSortOrder:
                {
                    ...data.albumSortOrder
                }
            };

            // Store track data keyed by title
            Object.values(data.tracks)
                .forEach(t =>
                {
                    backupData.tracks[t.title] = {
                        title: t.title,
                        description: t.description,
                        image: t.image,
                        albums: t.albums.slice(),
                        volume: t.volume
                    };
                });

            // Store playlist data using track titles
            Object.entries(data.playlists)
                .forEach(([playlistName, trackIds]) =>
                {
                    const titles = trackIds.map(id => data.tracks[id]?.title)
                        .filter(Boolean);
                    backupData.playlists[playlistName] = titles;
                });

            // Generate sequential backup handout name
            let index = 1;
            let name = `Jukebox Backup 001`;
            while(findObjs(
                {
                    _type: 'handout',
                    name
                })
                .length > 0)
            {
                index++;
                name = `Jukebox Backup ${String(index).padStart(3, '0')}`;
            }

            const handout = createObj('handout',
            {
                name,
archived: true
            });

            handout.set('notes', `<pre>${JSON.stringify(backupData, null, 2)}</pre>`);
            sendStyledMessage('Backup created', `[${name}](http://journal.roll20.net/handout/${handout.id})`);
        }


    // Restores track, album, and playlist data from a named backup handout
        if(command === 'restore')
        {
            const backupName = args.join(' ')
                .trim();
            const handout = findObjs(
            {
                _type: 'handout',
                name: backupName
            })[0];

            if(!handout)
            {
                sendStyledMessage(`Backup handout not found: ${backupName}`);
                return;
            }

            handout.get('notes', notes =>
            {
                const raw = notes.replace(/^<pre>|<\/pre>$/g, '')
                    .trim();
                let backup;

                try
                {
                    backup = JSON.parse(raw);
                }
                catch (e)
                {
                    sendStyledMessage('Backup', `Failed to parse backup JSON in "${backupName}".`);
                    return;
                }

                const titleToId = {};
                getAllTracks()
                    .forEach(track =>
                    {
                        titleToId[track.get('title')] = track.get('_id');
                    });

                const restoredTracks = {};
                Object.values(backup.tracks ||
                    {})
                    .forEach(bt =>
                    {
                        const id = titleToId[bt.title];
                        if(id)
                        {
                            restoredTracks[id] = {
                                id,
                                title: bt.title,
                                description: bt.description || '',
                                image: bt.image || '',
                                albums: bt.albums || [],
                                volume: bt.volume ?? 0.5,
                                sortOrder:
                                {}
                            };
                        }
                        else
                        {
                            sendStyledMessage('Restore', `Track not found in current game: "${bt.title}"`);
                        }
                    });

                const restoredPlaylists = {};
                Object.entries(backup.playlists ||
                    {})
                    .forEach(([plistName, titles]) =>
                    {
                        restoredPlaylists[plistName] = titles
                            .map(t => titleToId[t])
                            .filter(Boolean);
                    });

                // Apply restored data
                data.tracks = restoredTracks;
                data.albums = {
                    ...backup.albums
                };
                data.albumSortOrder = {
                    ...backup.albumSortOrder
                };
                data.playlists = restoredPlaylists;

                updateInterface();
                sendStyledMessage('Restore', `Backup "${backupName}" restored successfully.`);
            });
        }

    // Removes a track from saved data by ID
if(command === 'delete-track') {
    const id = args.join(' ').trim();
    const track = data.tracks[id];
    if(track) {
        delete data.tracks[id];
        sendStyledMessage('Track Removed', `Track "<b>${esc(track.title)}</b>" has been removed from your saved data.`, false);
        updateInterface();
    } else {
        sendStyledMessage('Error', 'Track not found in saved data.', false);
    }
}

    // Announces a track with formatted message including image/color/description based on flags
if (command === 'announce') {
    const idOrName = args.join(' ').trim();
    const track = findInternalTrack(idOrName);

    if (!track) {
        sendStyledMessage('Warning', 'Track not found.');
        return;
    }

    const actual = findLiveTrack(track.id);
    if (!actual) {
        sendStyledMessage('Warning', 'Track ID found but not playable: ' + track.title);
        return;
    }

    const flags = getTrackFlags(track);

    const value = (track.image || '').trim();
    const isHexColor = /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value);
    const isNamedColor = /^[a-zA-Z]+$/.test(value);
    const isImageURL = /^https?:\/\/.+/.test(value);

    // Convert hex to luminance to determine brightness
    const isDarkHex = (hex) => {
        let r, g, b;
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else {
            r = parseInt(hex.substr(0, 2), 16);
            g = parseInt(hex.substr(2, 2), 16);
            b = parseInt(hex.substr(4, 2), 16);
        }
        const luminance = 0.2126*r + 0.7152*g + 0.0722*b;
        return luminance < 128;
    };

    // Guess named color brightness (simple hardcoded list for safety)
    const darkNamedColors = ['black', 'navy', 'purple', 'maroon', 'darkgreen', 'teal', 'indigo', 'midnightblue', 'darkblue', 'darkslategray'];
    const isDarkNamed = darkNamedColors.includes(value.toLowerCase());

    let imageHtml = '';
    let titleHtml = `<div style="${css.announceTitle}">${esc(track.title)}</div>`;

    if (value && (isHexColor || isNamedColor)) {
        const isDark = isHexColor ? isDarkHex(value) : isDarkNamed;
        const textColor = isDark ? '#fff' : '#111';
        imageHtml = `<div style="width:100%; height:35px; background-color:${value}; color:${textColor}; text-align:center; font-size:16px; font-weight:bold; padding-top:8px; margin-bottom:8px;">${esc(track.title)}</div>`;
        titleHtml = ''; // Suppress normal title line
    } else if (isImageURL) {
        imageHtml = `<img src="${value}" style="width:100%; max-width:100%; height:auto; margin-bottom:8px;">`;
    }

    let cleanDesc = track.description || '';
    if (flags.includeDesc) {
        cleanDesc = cleanDesc.replace(/\s*!a(nnounce)?\b/gi, '');
        cleanDesc = cleanDesc.replace(/\s*!d(esc)?\b/gi, '');
    }

    const descHtml = flags.includeDesc
        ? `<div style="${css.announceDesc}">${renderFormattedText(cleanDesc.trim())}</div>`
        : '';

    const messageHtml = `${imageHtml}${titleHtml}${descHtml}`;
    sendStyledMessage('Now Playing', messageHtml, true);
}





    // Switches view mode between albums and playlists
        if(command === 'view')
        {
            const mode = args[0];
            if(['albums', 'playlists'].includes(mode))
            {
                data.settings.viewMode = mode;
                updateInterface();
            }
        }



if (command === 'volume' && args.length === 2) {
    const trackId = args[0];
    const sliderPercent = parseInt(args[1], 10);
    const t = findLiveTrack(trackId);

    if (t && !isNaN(sliderPercent) && sliderPercent >= 0 && sliderPercent <= 100) {
        const volume = sliderPercentToStoredVolume(sliderPercent);
        t.set('volume', volume);
        updateInterface();
    }
    return;
}




    // Sets view to show only currently playing tracks
        if(command === 'view' && args[0] === 'nowplaying')
        {
            data.settings.nowPlayingOnly = true;
            updateInterface();
        }


    // Resets view to show all tracks
        if(command === 'view' && args[0] === 'all')
        {
            data.settings.nowPlayingOnly = false;
            updateInterface();
        }

    // Changes selected album in album view, given URL encoded album name
if(command === 'jump' && args[0] === 'album')
{
    const encodedName = args.slice(1).join(' ').trim();
    const name = decodeURIComponent(encodedName);

    if(name in data.albums)
    {
        data.settings.viewMode = 'albums';
        data.settings.selectedAlbum = name;
        updateInterface();
    }
    else
    {
        sendStyledMessage(`Album not found: ${name}`);
    }
}

    // Changes selected playlist in playlist view, given URL encoded playlist name
        if(command === 'jump-playlist')
        {
            const name = decodeURIComponent(args.join(' ')
                .trim());

            if(!(name in data.playlists))
            {
                sendStyledMessage(`Playlist not found: ${name}`);
                return;
            }

            data.settings.viewMode = 'playlists';
            data.settings.selectedPlaylist = name;
            data.settings.nowPlayingOnly = false;
            updateInterface();
        }

    // Sorts albums alphabetically and updates the album order
if (command === 'sort-albums') {
    const sorted = Object.keys(data.albums).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    data.albumSortOrder = sorted;
    sendStyledMessage('Albums Sorted', 'Album list has been sorted alphabetically.');
    updateInterface();
}

    // Sorts tracks alphabetically and updates track order
if (command === 'sort-tracks') {
    const sorted = Object.values(data.tracks)
        .map(t => t.title)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    data.trackSortOrder = sorted;
    sendStyledMessage('Tracks Sorted', 'Track database has been sorted alphabetically.');
    updateInterface();
}


    // Edits a field (image, description, albums) of a specified track
if(command === 'edit')
{
    const idOrName = args.shift();
    const field = args.shift();
    const value = args.join(' ').trim();
    const track = findTrackByIdOrName(idOrName);
    if(!track)
    {
        sendStyledMessage(`Track not found: ${idOrName}`);
        return;
    }

    if(field === 'image')
    {
        const isHexColor = /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value);
        const isNamedColor = cssNamedColors.has(value.toLowerCase());

        if(value === '') {
            track.image = ''; // Clear image
        }
        else if(isHexColor || isNamedColor || value.length)
        {
            track.image = value;
        }
        else
        {
            sendStyledMessage(`Invalid input: must be a valid image URL or color code (hex or named).`);
            return;
        }
    }
    else if(field === 'description')
    {
        track.description = value;
    }
    else if(field === 'albums')
    {
        const [action, ...rest] = value.split(' ');
        let target = decodeURIComponent(rest.join(' ').trim());

        if(action === 'add')
        {
            if(target === 'New Album')
            {
                const player = getObj('player', msg.playerid);
                const playerName = player ? player.get('displayname') : 'GM';
                const safeTrackId = track.id.replace(/[^A-Za-z0-9\-_]/g, '');

                sendStyledMessage(`[Click here to create a new album and assign this track](!jb add-album-and-assign ${safeTrackId} ?{Enter new album name})`, false);
                return;
            }

            if(!track.albums.includes(target))
            {
                track.albums.push(target);
            }
        }
        else if(action === 'remove')
        {
            track.albums = track.albums.filter(a => a !== target);
        }
    }

    updateInterface();
}



    // Adds a new album to the album list and selects it
        if(command === 'add' && args[0] === 'album')
        {
            const albumName = args.slice(1)
                .join(' ')
                .trim();
            if(albumName)
            {
data.albums[albumName] = true;
if (!Array.isArray(data.albumSortOrder)) data.albumSortOrder = [];
if (!data.albumSortOrder.includes(albumName)) data.albumSortOrder.push(albumName);
data.settings.selectedAlbum = albumName;
updateInterface();
            }
        }

    // Adds a new album and assigns the specified track to it
        if(command === 'add-album-and-assign')
        {
            const trackId = args.shift();
            const albumName = args.join(' ')
                .trim();

            if(!trackId || !albumName)
            {
                sendStyledMessage('Missing track ID or album name.', false);




                return;
            }


            const track = data.tracks[trackId];
            if(!track)
            {
                sendStyledMessage('Track not found.', false);
                return;
            }

            // If "New Album" is selected, create it only if it doesn't already exist
if (!data.albums[albumName]) {
    data.albums[albumName] = true;
    if (!Array.isArray(data.albumSortOrder)) data.albumSortOrder = [];
    if (!data.albumSortOrder.includes(albumName)) data.albumSortOrder.push(albumName);
}


            if(!track.albums.includes(albumName))
            {
                track.albums.push(albumName);
            }

            updateInterface();
        }

    // Removes an album and cleans up all tracks that reference it
        if(command === 'remove-album')
        {
            const name = args.join(' ')
                .trim();
            if(name in data.albums)
            {
                delete data.albums[name];
                if (Array.isArray(data.albumSortOrder)) {
    data.albumSortOrder = data.albumSortOrder.filter(n => n !== name);
}


                // Remove the album from any tracks that had it
                Object.values(data.tracks)
                    .forEach(track =>
                    {
                        if(track.albums.includes(name))
                        {
                            track.albums = track.albums.filter(a => a !== name);
                        }
                    });

                // Reset selection if the deleted album was selected
                if(data.settings.selectedAlbum === name)
                {
                    const remaining = Object.keys(data.albums);
                    data.settings.selectedAlbum = remaining.length ? remaining[0] : '';
                }

                updateInterface();
                sendStyledMessage(`Album "${name}" has been removed.`, false);
            }
            else
            {
                sendStyledMessage(`Album "${name}" not found.`, false);
            }
        }

    // Renames an album and updates all references to it in tracks and sorting
        if(command === 'rename-album')
        {
            const knownAlbums = Object.keys(data.albums)
                .sort((a, b) => b.length - a.length); // Longest match first
            const joinedArgs = args.join(' ')
                .trim();

            // Try to find which known album name this starts with
            let oldName = null;
            let newName = null;

            for(let album of knownAlbums)
            {
                if(joinedArgs.startsWith(album))
                {
                    oldName = album;
                    newName = joinedArgs.slice(album.length)
                        .trim();
                    break;
                }
            }

            if(!oldName || !newName)
            {
                sendStyledMessage(`Could not determine album names. Got: ${joinedArgs}`, false);
                return;
            }

            if(!data.albums[oldName])
            {
                sendStyledMessage(`Album "${oldName}" not found.`, false);
                return;
            }

            if(data.albums[newName])
            {
                sendStyledMessage('Rename Failed', `An album named "${newName}" already exists.`, false);
                return;
            }

            // Rename in album list
            data.albums[newName] = true;
            delete data.albums[oldName];
            if (!Array.isArray(data.albumSortOrder)) data.albumSortOrder = [];
data.albumSortOrder = data.albumSortOrder.map(n => n === oldName ? newName : n);


            // Update all tracks that had the old album name
            Object.values(data.tracks)
                .forEach(track =>
                {
                    if(track.albums?.includes(oldName))
                    {
                        track.albums = track.albums.map(name => name === oldName ? newName : name);
                    }
                });

            // Switch view to the renamed album
            data.view = {
                mode: 'album',
                name: newName
            };

            updateInterface();
        }

    // Finds tracks by a search term, marking matches into a special 'Found' or 'Duplicates' album
if (command === 'find') {
    const searchTerm = args.join(' ').toLowerCase().trim();

    if (!searchTerm) {
        sendStyledMessage('Find Tracks', 'You must provide a search term.', false);
        return;
    }

    // Remove previous "Found" or "Duplicates" albums
    ['Found', 'Duplicates'].forEach(name => {
        if (name in data.albums) {
            delete data.albums[name];
            Object.values(data.tracks).forEach(track => {
                if (track.albums && track.albums.includes(name)) {
                    track.albums = track.albums.filter(a => a !== name);
                }
            });
        }
    });

    if (searchTerm === 'd') {
        // Special case: Find tracks with duplicate names
        const nameMap = {};
        Object.values(data.tracks).forEach(track => {
            const title = track.title?.toLowerCase().trim();
            if (!title) return;
            if (!nameMap[title]) nameMap[title] = [];
            nameMap[title].push(track);
        });

        const duplicates = Object.values(nameMap)
            .filter(list => list.length > 1)
            .flat();

        if (duplicates.length === 0) {
            sendStyledMessage('Find Duplicates', 'No duplicate track titles found.', false);
            return;
        }

        data.albums['Duplicates'] = true;

        duplicates.forEach(track => {
            if (!track.albums.includes('Duplicates')) {
                track.albums.push('Duplicates');
            }
        });

        data.settings.viewMode = 'albums';
        data.settings.selectedAlbum = 'Duplicates';


// Sort tracklist by title (case-insensitive)
data.trackOrder = duplicates
    .slice()
    .sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))
    .map(track => track.id);



        updateInterface();
        sendStyledMessage('Find Duplicates', `Found ${duplicates.length} duplicate track${duplicates.length !== 1 ? 's' : ''}.`, false);
        return;
    }

    // Normal search mode
    data.albums['Found'] = true;

    const matches = Object.values(data.tracks).filter(track => {
        const title = track.title?.toLowerCase() || '';
        const desc = track.description?.toLowerCase() || '';
        return title.includes(searchTerm) || desc.includes(searchTerm);
    });

    matches.forEach(track => {
        if (!track.albums.includes('Found')) {
            track.albums.push('Found');
        }
    });

    if (matches.length === 0) {
        sendStyledMessage('Find Tracks', `No tracks matched the search: "${searchTerm}"`, false);
        return;
    }

    data.settings.viewMode = 'albums';
    data.settings.selectedAlbum = 'Found';

    updateInterface();
    //sendStyledMessage('Find Tracks', `Found ${matches.length} track${matches.length !== 1 ? 's' : ''} matching "${searchTerm}"`, false);
}


    // Toggles the visibility of the settings pane
        if(command === 'toggle-settings')
        {
            data.settings.settingsExpanded = !data.settings.settingsExpanded;
            updateInterface();
        }


    // Changes the interface mode between 'light' and 'dark'
        if(command === 'mode')
        {
            const theme = args[0]?.toLowerCase();
            if(theme === 'light' || theme === 'dark')
            {
                data.settings.mode = theme;
                updateInterface();
            }
            else
            {
                sendStyledMessage('Unknown Mode', `Mode "${theme}" is not recognized. Must be *light* or *dark*`, false);
            }
        }


    // Selects an album or playlist, updating the current view
        if(command === 'select')
        {
            const type = args.shift();
            let name = args.join(' ')
                .trim();
            name = decodeURIComponent(name);

            // Reset the "Now Playing Only" view
            data.settings.nowPlayingOnly = false;

            if(type === 'album' && (name in data.albums))
            {
                data.settings.selectedAlbum = name;
            }
            if(type === 'playlist')
            {
                if(!(name in data.playlists))
                {
                    data.playlists[name] = [];
                }
                data.settings.selectedPlaylist = name;
            }

            updateInterface();
        }
    });

    syncTracks();
    updateInterface();
});

{ try { throw new Error(''); } catch (e) { API_Meta.JukeboxPlus.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.JukeboxPlus.offset); } }
