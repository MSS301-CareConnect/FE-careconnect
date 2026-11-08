export interface DeviceInfo {
  browser: string
  os: string
  mobile: boolean
}

const BROWSERS: [RegExp, string][] = [
  [/Edg(?:e|A|iOS)?\/([\d]+)/, 'Edge'],
  [/OPR\/([\d]+)/, 'Opera'],
  [/SamsungBrowser\/([\d]+)/, 'Samsung Internet'],
  [/CocCoc|coc_coc_browser\/([\d]+)/, 'Cốc Cốc'],
  [/Firefox\/([\d]+)|FxiOS\/([\d]+)/, 'Firefox'],
  [/Chrome\/([\d]+)|CriOS\/([\d]+)/, 'Chrome'],
  [/Version\/([\d]+).*Safari/, 'Safari']
]

/** "Chrome · Windows 10" style names from a raw User-Agent string; brand names stay untranslated. */
export function parseUserAgent(userAgent: string | null | undefined): DeviceInfo | null {
  if (!userAgent) return null
  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1] ?? null
  let os: string | null = null
  if (/Windows NT 10/.test(userAgent)) os = 'Windows 10/11'
  else if (/Windows/.test(userAgent)) os = 'Windows'
  else if (/iPhone|iPad|iPod/.test(userAgent)) os = /iPad/.test(userAgent) ? 'iPadOS' : 'iOS'
  else if (/Android/.test(userAgent)) os = 'Android'
  else if (/Mac OS X/.test(userAgent)) os = 'macOS'
  else if (/CrOS/.test(userAgent)) os = 'ChromeOS'
  else if (/Linux/.test(userAgent)) os = 'Linux'
  if (!browser && !os) return null
  return {
    browser: browser ?? '—',
    os: os ?? '—',
    mobile: /Mobi|Android|iPhone|iPod/.test(userAgent)
  }
}
