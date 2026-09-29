'use client'

import { useState, useEffect } from 'react'

const SOURCE_COLORS = {
  email: 'bg-purple-100 text-purple-800',
  push: 'bg-indigo-100 text-indigo-800',
  instagram: 'bg-pink-100 text-pink-800',
  facebook: 'bg-blue-100 text-blue-800',
  google: 'bg-green-100 text-green-800',
  whatsapp: 'bg-emerald-100 text-emerald-800',
  direct: 'bg-gray-100 text-gray-800',
  '(untracked)': 'bg-gray-100 text-gray-500'
}

export default function AttributionPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/attribution')
        const data = await res.json()
        if (!data.success) throw new Error(data.error || 'Failed')
        setRows(data.rows)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totals = rows.reduce(
    (acc, r) => ({ regs: acc.regs + r.registrations, paid: acc.paid + r.paid }),
    { regs: 0, paid: 0 }
  )

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Attribution</h1>
      <p className="text-sm text-gray-500 mb-6">
        Where registrations come from. Sources are captured from UTM links and referrers at first visit.
      </p>

      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Last</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${SOURCE_COLORS[r.source] || 'bg-yellow-100 text-yellow-800'}`}>
                      {r.source}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{r.campaign || '-'}</td>
                  <td className="px-6 py-3 text-sm text-gray-900 text-right">{r.registrations}</td>
                  <td className="px-6 py-3 text-sm text-gray-900 text-right">{r.paid}</td>
                  <td className="px-6 py-3 text-sm text-gray-500 text-right">
                    {r.lastAt ? new Date(r.lastAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-3 text-sm text-gray-900" colSpan={2}>Total</td>
                <td className="px-6 py-3 text-sm text-gray-900 text-right">{totals.regs}</td>
                <td className="px-6 py-3 text-sm text-gray-900 text-right">{totals.paid}</td>
                <td className="px-6 py-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
