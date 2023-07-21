// Github:   tbd
// By:       Rochard @ Damery
// Contact:  tbd

/**
 * RPGMasterLoader.js
 *
 * * Copyright 2022: Richard @ Damery.
 * Licensed under the GPL Version 3 license.
 * http://www.gnu.org/licenses/gpl.html
 * 
 * This script is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This script is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * This script is just a placeholder for loading other scripts in
 * the RPGMaster suite of API / Mods, so that a One Click search for 
 * 'RPGMaster' finds the loader and allows loading of the suite.
**/
var API_Meta = API_Meta||{}; // eslint-disable-line no-var
API_Meta.RPGMasterLoader={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.RPGMasterLoader.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

const RPGMasterLoader = (() => { // eslint-disable-line no-unused-vars
	'use strict';
	const version = '2.1.0';
	API_Meta.RPGMasterLoader.version = version;
	const lastUpdate = 1684607663;
	const schemaVersion = 0.1;

	const handleChatMessage = (msg) => {
		return;
	};
	
	const checkInstall = () =>  {
		// Nothing to check as this is just a loader for other scripts
	};
	
	const registerLoader = () => {
		on('chat:message',handleChatMessage);
	};

	on('ready', function () {
		checkInstall();
		registerLoader();
	});

})();

{try{throw new Error('');}catch(e){API_Meta.RPGMasterLoader.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.RPGMasterLoader.offset);}}
