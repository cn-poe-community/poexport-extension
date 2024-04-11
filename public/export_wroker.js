const EXPORT_SERVER = 'http://120.77.179.194:8888'
const HTTP_TIMEOUT = 3000

async function transform(compressed, sendResponse) {
  console.log(`fetching ${EXPORT_SERVER}/transform`)
  let res = null

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT)

  try {
    res = await fetch(`${EXPORT_SERVER}/transform`, {
      method: 'post',
      headers: {
        'Content-type': 'octet-stream'
      },
      body: compressed,
      signal: controller.signal
    })
  } catch (err) {
    console.log(err)
    sendResponse({
      code: 1,
      msg: `无法访问Export服务器，刷新重试或联系开发者`
    })
    return
  }finally{
    clearTimeout(timeoutId)
  }

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
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.task === 'load') {
    //加载逻辑已移除，因此目前不做任何事情
  } else if (request.task === 'transform') {
    const data = new Uint8Array(request.compressed)
    transform(data, sendResponse)
  }
  return true
})
