;(async () => {
  const values = await chrome.storage.local.get({ cookiesRenewalEnabled: true })
  if (values.cookiesRenewalEnabled) {
    await chrome.runtime.sendMessage({
      task: 'cookiesRenewal'
    })
  }
})()
