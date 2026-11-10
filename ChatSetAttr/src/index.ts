import { registerHandlers } from "./modules/main";
import { update, welcome } from "./modules/versioning";
import "./utils/chat";

on("ready", () => {
  registerHandlers();
  update();
  welcome();
});

export { registerObserver } from "./modules/observer";