import { countryFlag } from '@/lib/utils/countries'

const SIZES = {
  xs: { box: 'w-6 h-6', text: 'text-[9px]', flag: 'text-[10px] -bottom-1 -right-1' },
  sm: { box: 'w-8 h-8', text: 'text-[11px]', flag: 'text-xs -bottom-1 -right-1' },
  md: { box: 'w-10 h-10', text: 'text-sm', flag: 'text-sm -bottom-1 -right-1' },
  hero: { box: 'w-16 h-16', text: 'text-xl', flag: 'text-xl -bottom-1 -right-1' },
  lg: { box: 'w-24 h-24', text: 'text-3xl', flag: 'text-2xl -bottom-0.5 -right-0.5' }
}

const initials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

export default function PlayerAvatar({ name, avatar, country, size = 'md', showFlag = true, onDark = false, className = '' }) {
  const s = SIZES[size] || SIZES.md
  const flag = showFlag ? countryFlag(country) : ''

  return (
    <div className={`relative flex-shrink-0 ${s.box} ${className}`}>
      <div className={`w-full h-full rounded-full overflow-hidden font-semibold flex items-center justify-center ${s.text} ${onDark ? 'bg-white/20 text-white ring-2 ring-white/60' : 'bg-purple-100 text-parque-purple'}`}>
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={name || ''} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span>{initials(name)}</span>
        )}
      </div>
      {flag && (
        <span className={`absolute leading-none drop-shadow ${s.flag}`} title={country}>{flag}</span>
      )}
    </div>
  )
}
