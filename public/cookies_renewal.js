;(async () => {
  // https://greasyfork.org/zh-CN/scripts/492649-poe%E8%87%AA%E5%8A%A8%E7%BB%AD%E6%9C%9Fcookie/code
  const domains = ['poe.game.qq.com', '.poe.game.qq.com', '.game.qq.com', '.qq.com']

  function resetCookie(name, domain) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`
  }

  function resetAllCookies() {
    const cookies = document.cookie.split('; ')
    for (const cookie of cookies) {
      const name = cookie.split('=', 1)[0].trim()
      for (const domain of domains) {
        resetCookie(name, domain)
      }
    }
  }

  if (window.location.href.includes('login')) {
    if (
      document.cookie.includes('; p_uin=') ||
      document.body.innerText.includes('发生了一个错误')
    ) {
      await resetAllCookies()
    }
  }

  const values = await chrome.storage.local.get({ cookiesRenewalEnabled: false })
  if (values.cookiesRenewalEnabled) {
    await chrome.runtime.sendMessage({
      task: 'cookiesRenewal'
    })
  }
})()
