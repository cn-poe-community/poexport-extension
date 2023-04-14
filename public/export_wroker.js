const QUERY_SERVER_URL = "https://poe.pathofrun.com/export/server";

async function getServer() {
  const result = await chrome.storage.local.get("exportServer");
  return result.exportServer;
}

async function setServer(server) {
  return chrome.storage.local.set({ exportServer: server });
}

async function checkServer() {
  const server = await getServer();
  console.log(`checking server ${server}`);
  if (!server || server.length === 0) {
    return false;
  }
  try {
    const res = await fetch(`${server}/status`);
    if (res.status !== 200) {
      return false;
    }
    const json = await res.json();
    if (!json.code || json.code !== 200) {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
}

async function loadServer() {
  try {
    const res = await fetch(QUERY_SERVER_URL);
    if (res.status !== 200) {
      return;
    }
    const server = await res.text();
    console.log(`loaded server ${server}`);
    await setServer(server);
  } catch (err) {
    console.log(err);
  }
}

async function onLoad() {
  const right = await checkServer();
  if (!right) {
    console.log("reloading server");
    loadServer();
  }
  console.log("server works well");
}

async function transform(compressed, sendResponse) {
  const server = await getServer();
  if (!server || server.length === 0) {
    sendResponse({
      code: 1,
      msg: "服务端无法访问",
    });
    return;
  }
  try {
    console.log(`fetch ${server}/transform`);
    const res = await fetch(`${server}/transform`, {
      method: "post",
      headers: {
        "Content-type": "octet-stream",
      },
      body: compressed,
    });
    if (res.status !== 200) {
      sendResponse({
        code: 1,
        msg: `HTTP错误: ${res.status}`,
      });
      return;
    }
    const apiResp = await res.json();
    const code = apiResp.code;
    if (code !== 200) {
      sendResponse({
        code: 1,
        msg: `请求错误: ${apiResp.msg}`,
      });
      return;
    }

    sendResponse({
      code: 0,
      data: apiResp.data.xml,
    });
  } catch (err) {
    console.log(err);
    sendResponse({
      code: 1,
      msg: `请求错误: ${err}`,
    });
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.task === "load") {
    onLoad();
  } else if (request.task === "transform") {
    const data = new Uint8Array(request.compressed)
    transform(data, sendResponse);
  }
  return true;
});
