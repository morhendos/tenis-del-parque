const CODES = 'AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GI GM GN GQ GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MO MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PR PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VN VU WS XK YE ZA ZM ZW'.split(' ')

const POPULAR = ['ES', 'GB', 'GI', 'DE', 'NL', 'FR', 'IT', 'SE', 'NO', 'DK', 'BE', 'IE', 'PL', 'PT', 'US', 'AR']

export function countryFlag(code) {
  if (!code || !/^[A-Z]{2}$/i.test(code)) return ''
  return String.fromCodePoint(...code.toUpperCase().split('').map(c => 0x1f1e6 + c.charCodeAt(0) - 65))
}

export function countryName(code, locale = 'es') {
  if (!code) return ''
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code.toUpperCase()) || code
  } catch {
    return code
  }
}

export function getCountryOptions(locale = 'es') {
  const all = CODES.map(code => ({ code, name: countryName(code, locale), flag: countryFlag(code) }))
  const popular = POPULAR.map(c => all.find(o => o.code === c)).filter(Boolean)
  const rest = all.filter(o => !POPULAR.includes(o.code)).sort((a, b) => a.name.localeCompare(b.name, locale))
  return { popular, rest }
}
