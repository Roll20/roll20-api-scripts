var psInstaller = psInstaller || (function plexsoupScriptInstaller() {

}());


on("ready",function(){
    // this stuff happens when the script loads.
    // Note: you have to use Caps to refer to the left side of the function declarations in "return"
	
	var Modules = {

		//psTileResizer: psTileResizer,
		//psIsoFacing: psIsoFacing,
		//psIsoMap: psIsoMap,
		psMath: psMath,
		psGUI: psGUI,
		psUtils: psUtils,
		psLightTrails: psLightTrails
	};

	log("_.values(Modules) = " + _.values(Modules));
	
	_.each(Modules, function(moduleObj) {
		if (_.has(moduleObj, "CheckInstall") && moduleObj.CheckInstall !== undefined ) {
			log("checking install for " + moduleObj);
			moduleObj.CheckInstall();			
		}

		if (_.has(moduleObj, "RegisterEventHandlers") && moduleObj.RegisterEventHandlers !== undefined) {
			moduleObj.RegisterEventHandlers();			
		}		
		
	});
});