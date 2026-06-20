import { onMessage } from "../utils/messaging";
import * as transformer from "@/utils/transformer_api";

export default defineBackground(() => {
  onMessage("createPOE1Build", (message) => {
    return transformer.createPOE1Build(message.data);
  });
  onMessage("createPOE2Build", (message) => {
    return transformer.createPOE2Build(message.data);
  });
  onMessage("manageWgItems", async (message) => {
    browser.windows.create({
      url: browser.runtime.getURL(
        `/wg_items.html?shareCode=${message.data.shareCode}`,
      ),
      width: 1000,
      height: 600,
      type: "popup",
    });
  });

  onMessage("openTransItemPage", async (message) => {
    browser.windows.create({
      url: browser.runtime.getURL(
        `/trans_item.html?version=${message.data.version}`,
      ),
      width: 1000,
      height: 600,
      type: "popup",
    });
  });

  onMessage("translatePOE1Item", async (message) => {
    return transformer.translatePOE1Item(message.data);
  });

  onMessage("translatePOE2Item", async (message) => {
    return transformer.translatePOE2Item(message.data);
  });
});
