import { tradeTypes } from "cn-poe2-commons";
import { itemToText, LineEnding } from "cn-poe2-commons/dist/types/item";
import { FetchResult } from "cn-poe2-commons/dist/types/trade";

/**
 * 该实现参考了 https://gist.github.com/Krytos/fcb435878b9ee214c8ef9c5d9a685861
 */
export default defineUnlistedScript(() => {
  const itemCaches = new Map<string, tradeTypes.ItemPackage>();
  const textCaches = new Map<string, string>();
  const processedRows = new Set<string>();

  const originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.send = function (body) {
    this.addEventListener("load", function () {
      if (
        this.responseURL.startsWith(
          "https://poe.game.qq.com/api/trade2/search/",
        )
      ) {
        itemCaches.clear();
        textCaches.clear();
        processedRows.clear();
      } else if (
        this.responseURL.startsWith("https://poe.game.qq.com/api/trade2/fetch/")
      ) {
        try {
          const fetchResult: FetchResult = JSON.parse(this.responseText);
          for (const pack of fetchResult.result) {
            itemCaches.set(pack.id, pack);
          }
        } catch (error) {
          console.log(`解析 FetchResult 出错：${error}`);
        }
      }
    });
    originalXHRSend.call(this, body);
  };

  function processRow(row: Element) {
    const dataId = row.getAttribute("data-id");
    if (!dataId || processedRows.has(dataId)) {
      return;
    }

    try {
      const leftDiv = row.querySelector("div.left");
      if (!leftDiv || !leftDiv.children || leftDiv.children.length < 2) {
        return;
      }

      const copyButton = leftDiv.children[1];
      copyButton.className = "copy";
      copyButton.removeAttribute("style");

      copyButton.addEventListener("click", function () {
        let outputText = textCaches.get(dataId);
        if (!outputText) {
          const itemPack = itemCaches.get(dataId);
          if (!itemPack) {
            return;
          }
          outputText = itemToText(itemPack.item, LineEnding.LF);
        }
        navigator.clipboard.writeText(outputText);
      });

      processedRows.add(dataId);
    } catch (e) {
      console.error("Error processing row:", e);
    }
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) {
          const element = node as Element;
          if (
            element.classList.contains("row") &&
            element.getAttribute("data-id")
          ) {
            processRow(element);
          }
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});
