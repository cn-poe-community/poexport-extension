import axios from 'axios'

const PROFILE_URL = 'api/profile'
const GET_CHARACTERS_URL = '/character-window/get-characters'
const GET_ITEMS_URL = '/character-window/get-items'
const GET_PASSIVE_SKILLS_URL = '/character-window/get-passive-skills'

async function profile(): Promise<any> {
  try {
    const { data } = await axios.get(PROFILE_URL)
    return data
  } catch (e) {
    throw requestError(e)
  }
}

async function getCharacters(accountName: string, realm: string): Promise<any> {
  const form = new URLSearchParams()
  form.append('accountName', accountName)
  form.append('realm', realm)

  try {
    const { data } = await axios.post(GET_CHARACTERS_URL, form)
    return data
  } catch (e) {
    throw requestError(e)
  }
}

async function getItems(accountName: string, character: string, realm: string): Promise<any> {
  const form = new URLSearchParams()
  form.append('accountName', accountName)
  form.append('character', character)
  form.append('realm', realm)

  try {
    const { data } = await axios.post(GET_ITEMS_URL, form)
    return data
  } catch (e) {
    throw requestError(e)
  }
}

async function getPassiveSkills(
  accountName: string,
  character: string,
  realm: string
): Promise<any> {
  const form = new URLSearchParams()
  form.append('accountName', accountName)
  form.append('character', character)
  form.append('realm', realm)

  try {
    const { data } = await axios.post(GET_PASSIVE_SKILLS_URL, form)
    return data
  } catch (e) {
    throw requestError(e)
  }
}

function requestError(err: unknown) {
  if (err instanceof axios.AxiosError) {
    if (err.response) {
      const status = err.response.status
      if (status === 401) {
        const rtnErr = new Error('未登陆')
        rtnErr.stack = String(err)
        return rtnErr
      } else if (status === 403) {
        const rtnErr = new Error('账户不存在或已隐藏')
        rtnErr.stack = String(err)
        return rtnErr
      } else if (status === 429) {
        const headers = err.response.headers
        if (headers) {
          const limit = rateLimit(headers)
          if (limit.length > 0) {
            const rtnErr = new Error(`请求过于频繁，请等待 ${limit} 后再试`)
            rtnErr.stack = String(err)
            return rtnErr
          }
        }
        const rtnErr = new Error('请求过于频繁，请稍后再试')
        rtnErr.stack = String(err)
        return rtnErr
      }
    }
  } else if (err instanceof Error) {
    return err
  }

  return new Error(String(err))
}

function rateLimit(headers: { [s: string]: unknown }) {
  let max = 0
  for (const [key, value] of Object.entries(headers)) {
    if (/^x-rate-limit-.+-state$/.test(key)) {
      const states = (value as string).split(',')
      const limits = states.map((s: string) => {
        const pieces = s.split(':')
        return Number(pieces[pieces.length - 1])
      })
      for (let i = 0; i < limits.length; i++) {
        if (limits[i] > max) {
          max = limits[i]
        }
      }
    }
  }

  if (max > 3600) {
    const h = Math.floor(max / 3600)
    const m = Math.floor((max % 3600) / 60)
    const s = max % 60
    return `${h}小时${m}分钟${s}秒`
  }
  if (max > 60) {
    const m = Math.floor((max % 3600) / 60)
    const s = max % 60
    return `${m}分钟${s}秒`
  }
  if (max > 0) {
    return `${max}秒`
  }
  return ''
}

export default {
  profile,
  getCharacters,
  getItems,
  getPassiveSkills
}
