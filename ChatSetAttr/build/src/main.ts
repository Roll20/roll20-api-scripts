import { ChatSetAttr } from "./classes/ChatSetAttr";

on("ready", () => {
  new ChatSetAttr();
  // ChatSetAttr.checkInstall();
});

export default {
  registerObserver: ChatSetAttr.registerObserver,
  unregisterObserver: ChatSetAttr.unregisterObserver,
};

