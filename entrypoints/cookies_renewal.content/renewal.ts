// https://greasyfork.org/zh-CN/scripts/492649-poe%E8%87%AA%E5%8A%A8%E7%BB%AD%E6%9C%9Fcookie/code
const domains = [
  "poe.game.qq.com",
  ".poe.game.qq.com",
  ".game.qq.com",
  ".qq.com",
];

function resetCookie(name: string, domain: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
}

export function resetAllCookies() {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const name = cookie.split("=", 1)[0].trim();
    for (const domain of domains) {
      resetCookie(name, domain);
    }
  }
}
