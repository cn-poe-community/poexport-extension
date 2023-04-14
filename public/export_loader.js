(async () => {
  chrome.storage.local.get({ exportEnabled: true }, (res) => {
    if (res.exportEnabled) {
      let container = document.createElement("div");
      container.id = "exportContainer";
      document.body.appendChild(container);
    }
  });
  const src = chrome.runtime.getURL("export.js");
  await import(src);
})();
