const QUERY_SERVER_URL = 'https://poe.pathof.top/export/server'

async function getServer() {
  const { exportServer } = await chrome.storage.local.get('exportServer')
  return exportServer
}

async function setServer(server) {
  return chrome.storage.local.set({ exportServer: server })
}

async function checkServer() {
  console.log(`checking server status`)
  const server = await getServer()
  if (!server || server.length === 0) {
    console.log(`no available server in storage`)
    return false
  }
  try {
    console.log(`checking server ${server}`)
    const res = await fetch(`${server}/status`)
    if (res.status !== 200) {
      console.log(`server ${server} returns ${res.status}`)
      return false
    }
    const json = await res.json()
    if (!json.code || json.code !== 200) {
      console.log(`server ${server} returns ${json}`)
      return false
    }
  } catch (err) {
    console.log(err)
    return false
  }
  console.log(`server ${server} works well`)
  return true
}

async function loadServer() {
  try {
    const res = await fetch(QUERY_SERVER_URL)
    if (res.status !== 200) {
      console.log(`load server failed: ${res.status}`)
      return
    }
    const server = await res.text()
    console.log(`loaded server ${server}`)
    await setServer(server)
  } catch (err) {
    console.log(err)
  }
}

async function onLoad() {
  const ok = await checkServer()
  if (!ok) {
    console.log('reloading server')
    loadServer()
  }
}

async function transform(compressed, sendResponse) {
  const server = await getServer()
  if (!server || server.length === 0) {
    sendResponse({
      code: 1,
      msg: '无可用Export服务器，刷新重试或联系开发者'
    })
    return
  }
  try {
    console.log(`fetching ${server}/transform`)
    const res = await fetch(`${server}/transform`, {
      method: 'post',
      headers: {
        'Content-type': 'octet-stream'
      },
      body: compressed
    })
    if (res.status !== 200) {
      sendResponse({
        code: 1,
        msg: `导出错误: ${res.status}`
      })
      return
    }
    const apiResp = await res.json()
    const code = apiResp.code
    if (code !== 200) {
      sendResponse({
        code: 1,
        msg: `导出错误: ${apiResp.msg}`
      })
      return
    }

    sendResponse({
      code: 0,
      data: apiResp.data.xml
    })
  } catch (err) {
    console.log(err)
    sendResponse({
      code: 1,
      msg: `${err}`
    })
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.task === 'load') {
    onLoad()
  } else if (request.task === 'transform') {
    const data = new Uint8Array(request.compressed)
    transform(data, sendResponse)
  }
  return true
})
