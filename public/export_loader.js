;(async () => {
  const values = await chrome.storage.local.get({ panelEnabled: true })
  if (values.panelEnabled) {
    let container = document.createElement('div')
    container.id = 'exportContainer'
    document.body.appendChild(container)
  }

  const src = chrome.runtime.getURL('export.js')
  await import(src)
})()
