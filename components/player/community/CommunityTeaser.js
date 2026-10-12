'use client'

import Link from 'next/link'
import { MessageCircle, ChevronRight } from 'lucide-react'
import PlayerAvatar from '@/components/player/PlayerAvatar'
import { formatPlayerNameForPublic } from '@/lib/utils/playerNameUtils'
import { useCommunityLatest } from './useCommunityUnread'
import { timeAgo } from './communityUtils'

const content = {
  es: {
    title: 'Comunidad',
    open: 'Ver todo',
    new: 'Nuevo',
    empty: 'Saluda a tu liga o busca con quién pelotear esta semana.',
    write: 'Escribir',
    beat: 'ganó a',
    joined: 'se ha unido a la liga',
    round: (n) => `Empieza la Ronda ${n}`
  },
  en: {
    title: 'Community',
    open: 'See all',
    new: 'New',
    empty: 'Say hi to your league or find someone to hit with this week.',
    write: 'Write',
    beat: 'beat',
    joined: 'joined the league',
    round: (n) => `Round ${n} has started`
  }
}

function summary(post, t, language) {
  const n = (name) => formatPlayerNameForPublic(name)
  if (post.kind === 'admin') return { who: 'Tenis del Parque', text: language === 'en' ? (post.textEn || post.text) : (post.text || post.textEn) }
  if (post.kind === 'player') return { who: n(post.author?.name), text: post.text, person: post.author }
  const d = post.data || {}
  if (post.autoType === 'result') {
    const score = (d.sets || []).map(s => `${s[0]}-${s[1]}`).join(' ')
    return { who: null, text: `🎾 ${n(d.winner?.name)} ${t.beat} ${n(d.loser?.name)} ${d.walkover ? 'W.O.' : score}` }
  }
  if (post.autoType === 'new_player') return { who: null, text: `👋 ${n(d.player?.name)} ${t.joined}` }
  return { who: null, text: `🚀 ${t.round(d.round)}` }
}

export default function CommunityTeaser({ leagueId, language = 'es', locale = 'es' }) {
  const t = content[language] || content.es
  const { data, unread } = useCommunityLatest(leagueId)
  if (!leagueId || !data) return null

  const items = [...(data.pinned || []), ...(data.posts || [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 2)
  const href = `/${locale}/player/league?tab=community&leagueId=${leagueId}`

  return (
    <Link href={href} className="block bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-purple-600" />
          </div>
          <span className="font-semibold text-gray-900">{t.title}</span>
          {unread && <span className="text-[10px] font-semibold text-white bg-red-500 px-1.5 py-0.5 rounded-full">{t.new}</span>}
        </div>
        <span className="text-sm text-parque-purple font-medium flex items-center">
          {items.length ? t.open : t.write} <ChevronRight className="w-4 h-4" />
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">{t.empty}</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {items.map(p => {
            const s = summary(p, t, language)
            return (
              <div key={p._id} className="flex items-center gap-2.5 py-2">
                {s.person ? (
                  <PlayerAvatar name={s.person.name} avatar={s.person.avatar} country={s.person.country} size="sm" showFlag={false} />
                ) : null}
                <p className="flex-1 min-w-0 text-sm text-gray-700 truncate">
                  {s.who && <span className="font-semibold text-gray-900">{s.who}: </span>}
                  {s.text}
                </p>
                <span className="text-[11px] text-gray-400 flex-shrink-0">{timeAgo(p.createdAt, language)}</span>
              </div>
            )
          })}
        </div>
      )}
    </Link>
  )
}
