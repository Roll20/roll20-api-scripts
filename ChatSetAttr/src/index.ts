import { registerHandlers } from "./modules/main";
import { checkGlobalConfig } from "./modules/config";
import { syncHelpHandoutOnStartup } from "./modules/help";
import { update, welcome } from "./modules/versioning";
import "./utils/chat";

on("ready", () => {
  checkGlobalConfig();
  registerHandlers();
  syncHelpHandoutOnStartup();
  update();
  welcome();
});

export { registerObserver } from "./modules/observer";