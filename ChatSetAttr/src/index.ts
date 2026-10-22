import { registerHandlers } from "./modules/main";
import { checkGlobalConfig, persistStateVersionMetadata, syncScriptVersion } from "./modules/config";
import { syncHelpHandoutOnStartup } from "./modules/help";
import { update, welcome } from "./modules/versioning";
import "./utils/chat";

on("ready", () => {
  checkGlobalConfig();
  registerHandlers();
  syncHelpHandoutOnStartup();
  syncScriptVersion();
  update();
  welcome();
  persistStateVersionMetadata();
});

export { registerObserver } from "./modules/observer";