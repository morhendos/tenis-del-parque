'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { MessageCircle, MoreHorizontal, Pin, Send, Loader2, Trophy, UserPlus, Rocket, Flag, Trash2 } from 'lucide-react'
import PlayerAvatar from '@/components/player/PlayerAvatar'
import PlayerLink from '@/components/player/PlayerLink'
import { formatPlayerNameForPublic } from '@/lib/utils/playerNameUtils'
import { getMaskedName, isDemoModeActive } from '@/lib/utils/demoMode'
import { markSeen, timeAgo } from './communityUtils'

const content = {
  es: {
    placeholder: 'Escribe algo a tu liga...',
    post: 'Publicar',
    empty: 'Todavía no hay nada aquí. ¡Sé el primero en escribir!',
    loadMore: 'Ver más',
    comment: 'Comentar',
    comments: (n) => `${n} comentario${n === 1 ? '' : 's'}`,
    commentPlaceholder: 'Escribe un comentario...',
    delete: 'Borrar',
    report: 'Reportar',
    reported: 'Reportado',
    confirmDelete: '¿Borrar esta publicación?',
    confirmReport: '¿Reportar esta publicación a Tenis del Parque?',
    pinned: 'Fijado',
    pin: 'Fijar',
    unpin: 'Quitar fijado',
    clearReports: 'Quitar reportes',
    reports: (n) => `${n} reporte${n === 1 ? '' : 's'}`,
    tooFast: 'Espera unos segundos antes de publicar otra vez.',
    error: 'Algo ha fallado. Inténtalo de nuevo.',
    beat: 'ganó a',
    walkover: 'por W.O.',
    round: (n) => `Ronda ${n}`,
    playoff: 'Playoff',
    joined: (name) => `${name} se ha unido a la liga. ¡Bienvenido!`,
    newRound: (n) => `¡Empieza la Ronda ${n}! Mira tu rival y reserva pista.`,
    tdp: 'Tenis del Parque'
  },
  en: {
    placeholder: 'Write something to your league...',
    post: 'Post',
    empty: 'Nothing here yet. Be the first to write!',
    loadMore: 'Load more',
    comment: 'Comment',
    comments: (n) => `${n} comment${n === 1 ? '' : 's'}`,
    commentPlaceholder: 'Write a comment...',
    delete: 'Delete',
    report: 'Report',
    reported: 'Reported',
    confirmDelete: 'Delete this post?',
    confirmReport: 'Report this post to Tenis del Parque?',
    pinned: 'Pinned',
    pin: 'Pin',
    unpin: 'Unpin',
    clearReports: 'Clear reports',
    reports: (n) => `${n} report${n === 1 ? '' : 's'}`,
    tooFast: 'Wait a few seconds before posting again.',
    error: 'Something went wrong. Please try again.',
    beat: 'beat',
    walkover: 'by walkover',
    round: (n) => `Round ${n}`,
    playoff: 'Playoff',
    joined: (name) => `${name} joined the league. Welcome!`,
    newRound: (n) => `Round ${n} has started! Check your rival and book a court.`,
    tdp: 'Tenis del Parque'
  }
}

function TdpBadge() {
  return (
    <div className="w-10 h-10 rounded-full bg-white ring-1 ring-gray-200 flex items-center justify-center p-1.5 flex-shrink-0">
      <Image src="/logo-big.png" alt="Tenis del Parque" width={28} height={28} className="object-contain" />
    </div>
  )
}

function AutoIcon({ type }) {
  const Icon = type === 'result' ? Trophy : type === 'new_player' ? UserPlus : Rocket
  return (
    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-parque-purple" />
    </div>
  )
}

function PostCard({ post, language, t, adminMode, isDemo, onChange, onRemove }) {
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const name = (n) => formatPlayerNameForPublic(isDemo ? getMaskedName(n) : n)
  const avatar = (p) => (isDemo ? null : p?.avatar)

  const react = async (emoji) => {
    const prev = post.reactions
    onChange({ ...post, reactions: prev.map(r => (r.emoji === emoji ? { ...r, mine: !r.mine, count: r.count + (r.mine ? -1 : 1) } : r)) })
    try {
      const res = await fetch(`/api/player/community/${post._id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      onChange({ ...post, reactions: data.reactions })
    } catch {
      onChange({ ...post, reactions: prev })
    }
  }

  const sendComment = async () => {
    const text = comment.trim()
    if (!text) return
    setSending(true)
    try {
      const res = await fetch(`/api/player/community/${post._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      onChange(data.post)
      setComment('')
    } catch {
      alert(t.error)
    } finally {
      setSending(false)
    }
  }

  const deleteComment = async (cid) => {
    if (!confirm(t.confirmDelete)) return
    const res = await fetch(`/api/player/community/${post._id}/comments/${cid}`, { method: 'DELETE' })
    if (res.ok) onChange({ ...post, comments: post.comments.filter(c => c._id !== cid) })
  }

  const remove = async () => {
    setMenuOpen(false)
    if (!confirm(t.confirmDelete)) return
    const res = await fetch(adminMode ? `/api/admin/community/${post._id}` : `/api/player/community/${post._id}`, { method: 'DELETE' })
    if (res.ok) onRemove(post._id)
  }

  const report = async () => {
    setMenuOpen(false)
    if (!confirm(t.confirmReport)) return
    const res = await fetch(`/api/player/community/${post._id}/report`, { method: 'POST' })
    if (res.ok) onChange({ ...post, reportedByMe: true })
  }

  const adminPatch = async (body, next) => {
    setMenuOpen(false)
    const res = await fetch(`/api/admin/community/${post._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (res.ok) onChange(next)
  }

  let header
  let body
  if (post.kind === 'admin') {
    header = <><TdpBadge /><div className="min-w-0"><div className="font-semibold text-gray-900 text-sm">{t.tdp}</div><div className="text-xs text-gray-400">{timeAgo(post.createdAt, language)}</div></div></>
    const text = language === 'en' ? (post.textEn || post.text) : (post.text || post.textEn)
    body = <p className="text-sm text-gray-800 whitespace-pre-line break-words">{text}</p>
  } else if (post.kind === 'player') {
    header = (
      <>
        <PlayerAvatar name={post.author?.name} avatar={avatar(post.author)} country={post.author?.country} size="md" />
        <div className="min-w-0">
          <PlayerLink playerId={post.author?._id} stretch className="font-semibold text-gray-900 text-sm truncate block">{post.author ? name(post.author.name) : '-'}</PlayerLink>
          <div className="text-xs text-gray-400">{timeAgo(post.createdAt, language)}</div>
        </div>
      </>
    )
    body = <p className="text-sm text-gray-800 whitespace-pre-line break-words">{post.text}</p>
  } else {
    const d = post.data || {}
    header = <><AutoIcon type={post.autoType} /><div className="min-w-0 text-xs text-gray-400 self-center">{timeAgo(post.createdAt, language)}</div></>
    if (post.autoType === 'result') {
      body = (
        <div>
          <p className="text-sm text-gray-800">
            <PlayerLink playerId={d.winner?._id} className="font-semibold text-gray-900">{name(d.winner?.name)}</PlayerLink>
            {' '}{t.beat}{' '}
            <PlayerLink playerId={d.loser?._id} className="font-semibold text-gray-900">{name(d.loser?.name)}</PlayerLink>
            {d.walkover && <span className="text-gray-500"> {t.walkover}</span>}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {(d.sets || []).map((s, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-purple-50 text-parque-purple text-xs font-semibold tabular-nums">{s[0]}-{s[1]}</span>
            ))}
            {d.retired && <span className="text-xs text-gray-400">ret.</span>}
            <span className="text-xs text-gray-400">{d.playoff ? t.playoff : t.round(d.round)}</span>
          </div>
        </div>
      )
    } else if (post.autoType === 'new_player') {
      body = (
        <div className="flex items-center gap-2">
          <PlayerAvatar name={d.player?.name} avatar={avatar(d.player)} country={d.player?.country} size="sm" />
          <p className="text-sm text-gray-800">{t.joined(name(d.player?.name))}</p>
        </div>
      )
    } else {
      body = <p className="text-sm text-gray-800 font-medium">{t.newRound(d.round)}</p>
    }
  }

  const commentCount = post.comments.length

  return (
    <div className={`bg-white rounded-2xl border shadow-sm ${post.pinned ? 'border-purple-200 ring-1 ring-purple-100' : 'border-gray-100'}`}>
      <div className="px-4 pt-3 flex items-start justify-between gap-2">
        <div className="relative flex items-center gap-3 min-w-0">{header}</div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {post.pinned && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-parque-purple bg-purple-50 px-2 py-0.5 rounded-full">
              <Pin className="w-3 h-3" /> {t.pinned}
            </span>
          )}
          {adminMode && post.reportCount > 0 && (
            <span className="text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{t.reports(post.reportCount)}</span>
          )}
          <div className="relative">
            <button onClick={() => setMenuOpen(o => !o)} className="tap-target p-1.5 text-gray-400 hover:text-gray-600 rounded-lg" aria-label="menu">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-20 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm">
                {adminMode && (
                  <button onClick={() => adminPatch({ pinned: !post.pinned }, { ...post, pinned: !post.pinned })} className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2">
                    <Pin className="w-4 h-4" /> {post.pinned ? t.unpin : t.pin}
                  </button>
                )}
                {adminMode && post.reportCount > 0 && (
                  <button onClick={() => adminPatch({ clearReports: true }, { ...post, reportCount: 0 })} className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2">
                    <Flag className="w-4 h-4" /> {t.clearReports}
                  </button>
                )}
                {post.canDelete && (
                  <button onClick={remove} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-red-600 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> {t.delete}
                  </button>
                )}
                {!adminMode && !post.canDelete && (
                  <button onClick={report} disabled={post.reportedByMe} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700 disabled:text-gray-400 flex items-center gap-2">
                    <Flag className="w-4 h-4" /> {post.reportedByMe ? t.reported : t.report}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-2 pb-3">{body}</div>

      <div className="px-3 pb-2 flex items-center gap-1 flex-wrap">
        {post.reactions.map(r => (
          <button
            key={r.emoji}
            onClick={() => react(r.emoji)}
            disabled={adminMode}
            className={`h-8 px-2 rounded-full text-sm flex items-center gap-1 border transition-colors ${r.mine ? 'bg-purple-50 border-purple-200 text-parque-purple' : 'bg-white border-gray-100 text-gray-500'} ${r.count === 0 && !r.mine ? 'opacity-60' : ''}`}
          >
            <span>{r.emoji}</span>
            {r.count > 0 && <span className="text-xs font-medium tabular-nums">{r.count}</span>}
          </button>
        ))}
        <button onClick={() => setShowComments(s => !s)} className="ml-auto h-8 px-2.5 rounded-full text-xs font-medium text-gray-500 hover:text-parque-purple flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          {commentCount > 0 ? t.comments(commentCount) : t.comment}
        </button>
      </div>

      {showComments && (
        <div className="border-t border-gray-50 px-4 py-3 space-y-3">
          {post.comments.map(c => (
            <div key={c._id} className="flex items-start gap-2">
              {c.isAdmin ? <div className="w-6 h-6 rounded-full bg-gradient-to-br from-parque-purple to-indigo-600 flex-shrink-0" /> : <PlayerAvatar name={c.author?.name} avatar={avatar(c.author)} country={c.author?.country} size="xs" showFlag={false} />}
              <div className="min-w-0 flex-1 bg-gray-50 rounded-xl px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  {c.isAdmin ? (
                    <span className="text-xs font-semibold text-gray-900">{t.tdp}</span>
                  ) : (
                    <PlayerLink playerId={c.author?._id} className="text-xs font-semibold text-gray-900 truncate">{c.author ? name(c.author.name) : '-'}</PlayerLink>
                  )}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] text-gray-400">{timeAgo(c.createdAt, language)}</span>
                    {c.canDelete && (
                      <button onClick={() => deleteComment(c._id)} className="tap-target text-gray-300 hover:text-red-500" aria-label={t.delete}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-line break-words">{c.text}</p>
              </div>
            </div>
          ))}
          <div className="flex items-end gap-2">
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={500}
              rows={1}
              placeholder={t.commentPlaceholder}
              className="flex-1 resize-none px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent"
            />
            <button onClick={sendComment} disabled={sending || !comment.trim()} className="h-9 w-9 rounded-full bg-parque-purple text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0" aria-label={t.comment}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CommunityFeed({ leagueId, language = 'es', adminMode = false, refreshKey = 0 }) {
  const t = content[language] || content.es
  const [pinned, setPinned] = useState([])
  const [posts, setPosts] = useState([])
  const [nextBefore, setNextBefore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [canPost, setCanPost] = useState(false)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    setIsDemo(isDemoModeActive())
  }, [])

  const load = useCallback(async () => {
    if (!leagueId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/player/community?league=${leagueId}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPinned(data.pinned)
      setPosts(data.posts)
      setNextBefore(data.nextBefore)
      setCanPost(!!data.me && !adminMode)
      if (!adminMode) markSeen(leagueId, data.latestAt)
    } catch {
      setPinned([])
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [leagueId, adminMode])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/player/community?league=${leagueId}&before=${encodeURIComponent(nextBefore)}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPosts(p => [...p, ...data.posts])
      setNextBefore(data.nextBefore)
    } finally {
      setLoadingMore(false)
    }
  }

  const submit = async () => {
    const clean = text.trim()
    if (!clean) return
    setPosting(true)
    setError('')
    try {
      const res = await fetch('/api/player/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ league: leagueId, text: clean })
      })
      if (res.status === 429) throw new Error(t.tooFast)
      if (!res.ok) throw new Error(t.error)
      const data = await res.json()
      setPosts(p => [data.post, ...p])
      setText('')
      markSeen(leagueId, data.post.createdAt)
    } catch (e) {
      setError(e.message || t.error)
    } finally {
      setPosting(false)
    }
  }

  const update = (next) => {
    setPinned(list => {
      const exists = list.some(p => p._id === next._id)
      if (next.pinned && exists) return list.map(p => (p._id === next._id ? next : p))
      const without = list.filter(p => p._id !== next._id)
      return next.pinned ? [next, ...without] : without
    })
    setPosts(list => {
      const without = list.filter(p => p._id !== next._id)
      if (next.pinned) return without
      const exists = list.some(p => p._id === next._id)
      if (exists) return list.map(p => (p._id === next._id ? next : p))
      return [next, ...without].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    })
  }

  const remove = (id) => {
    setPinned(list => list.filter(p => p._id !== id))
    setPosts(list => list.filter(p => p._id !== id))
  }

  const all = [...pinned, ...posts]

  return (
    <div className="space-y-3">
      {canPost && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={1000}
            rows={2}
            placeholder={t.placeholder}
            className="w-full resize-none px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent"
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          <div className="mt-2 flex justify-end">
            <button onClick={submit} disabled={posting || !text.trim()} className="px-4 py-2 rounded-xl bg-parque-purple text-white text-sm font-semibold disabled:opacity-40 flex items-center gap-2">
              {posting && <Loader2 className="w-4 h-4 animate-spin" />}
              {t.post}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-parque-purple" /></div>
      ) : all.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-500">{t.empty}</div>
      ) : (
        all.map(p => (
          <PostCard key={p._id} post={p} language={language} t={t} adminMode={adminMode} isDemo={isDemo} onChange={update} onRemove={remove} />
        ))
      )}

      {nextBefore && !loading && (
        <button onClick={loadMore} disabled={loadingMore} className="w-full py-2.5 text-sm font-medium text-parque-purple bg-white rounded-xl border border-gray-100 flex items-center justify-center gap-2">
          {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
          {t.loadMore}
        </button>
      )}
    </div>
  )
}
