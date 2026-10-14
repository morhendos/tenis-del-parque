'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const Icon = ({ d }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
)

const icons = {
  leagues: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  players: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  matches: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  clubs: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197',
  docs: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
}

const quickLinks = [
  { href: '/admin/leagues', title: 'Leagues', desc: 'Seasons, levels and settings', icon: icons.leagues },
  { href: '/admin/players', title: 'Players', desc: 'Everyone registered', icon: icons.players },
  { href: '/admin/matches', title: 'Matches', desc: 'Rounds, results, deadlines', icon: icons.matches },
  { href: '/admin/clubs', title: 'Clubs', desc: 'Tennis clubs directory', icon: icons.clubs },
  { href: '/admin/users', title: 'Users', desc: 'Accounts and invitations', icon: icons.users },
  { href: '/admin/docs', title: 'Documentation', desc: 'Project docs', icon: icons.docs }
]

const levelStyle = {
  beginner: 'bg-orange-50 text-orange-700 ring-orange-200',
  intermediate: 'bg-slate-50 text-slate-700 ring-slate-200',
  advanced: 'bg-amber-50 text-amber-700 ring-amber-200'
}

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(p => p[0] || '').join('').toUpperCase()

const shortDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

function StatCard({ label, value, sub, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className="w-9 h-9 rounded-xl bg-purple-50 text-parque-purple flex items-center justify-center">
          <Icon d={icon} />
        </div>
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900 tabular-nums">{value}</p>
      {children}
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentPlayers, setRecentPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      const data = await response.json()
      setStats(data.stats)
      setRecentPlayers(data.recentPlayers)
    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-parque-purple" />
      </div>
    )
  }

  const totalPlayers = stats?.totalPlayers || 0
  const pushPlayers = stats?.pushNotifications?.uniquePlayers || 0
  const pushDevices = stats?.pushNotifications?.totalSubscriptions || 0
  const adoption = totalPlayers ? Math.round(pushPlayers / totalPlayers * 100) : 0
  const platforms = Object.entries(stats?.pushNotifications?.byPlatform || {})
    .map(([p, c]) => `${p} ${c}`).join(' · ') || 'No data'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total players" value={totalPlayers} icon={icons.players} />
        <StatCard label="Push enabled" value={pushPlayers} sub={`${pushPlayers} players · ${pushDevices} devices`} icon={icons.bell} />
        <StatCard label="Push adoption" value={`${adoption}%`} sub={platforms} icon={icons.chart}>
          <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-parque-purple to-purple-500" style={{ width: `${adoption}%` }} />
          </div>
        </StatCard>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {quickLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:border-purple-200 hover:shadow-sm transition"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-50 text-parque-purple flex items-center justify-center group-hover:bg-parque-purple group-hover:text-white transition-colors">
              <Icon d={link.icon} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{link.title}</p>
              <p className="text-xs text-gray-500 truncate">{link.desc}</p>
            </div>
            <svg className="ml-auto w-4 h-4 text-gray-300 group-hover:text-parque-purple transition-colors hidden sm:block" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Recent registrations</h3>
          <Link href="/admin/players" className="text-sm font-medium text-parque-purple hover:underline">
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3">Player</th>
                <th className="px-5 py-3 hidden md:table-cell">Email</th>
                <th className="px-5 py-3">Level</th>
                <th className="px-5 py-3 hidden sm:table-cell">League</th>
                <th className="px-5 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentPlayers.map((player) => (
                <tr key={player._id} className="hover:bg-purple-50/40 transition-colors">
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-50 text-parque-purple text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {initials(player.name)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{player.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{player.email}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ring-1 capitalize ${levelStyle[player.level] || 'bg-purple-50 text-parque-purple ring-purple-200'}`}>
                      {player.level}
                    </span>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">{player.league?.name || '-'}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500 text-right tabular-nums">{shortDate(player.registeredAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {recentPlayers.length === 0 && (
            <div className="text-center py-10 text-sm text-gray-500">No players registered yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
