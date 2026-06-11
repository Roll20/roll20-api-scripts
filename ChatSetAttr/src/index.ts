import { registerHandlers } from "./modules/main";
import { checkGlobalConfig } from "./modules/config";
import { update, welcome } from "./modules/versioning";
import "./utils/chat";

on("ready", () => {
  checkGlobalConfig();
  registerHandlers();
  update();
  welcome();
});

export { registerObserver } from "./modules/observer";