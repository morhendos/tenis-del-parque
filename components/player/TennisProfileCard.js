'use client'

import { useState } from 'react'
import { LayoutGrid, Zap, Target, Hand, Repeat, Circle, Calendar, Pencil, Loader2 } from 'lucide-react'

const OPTIONS = {
  surface: {
    icon: LayoutGrid,
    label: { es: 'Superficie favorita', en: 'Favorite surface' },
    values: {
      hard: { es: 'Dura', en: 'Hard' },
      clay: { es: 'Tierra batida', en: 'Clay' },
      grass: { es: 'Hierba', en: 'Grass' },
      indoor: { es: 'Indoor', en: 'Indoor' }
    }
  },
  playStyle: {
    icon: Zap,
    label: { es: 'Estilo de juego', en: 'Play style' },
    values: {
      offensive: { es: 'Ofensivo', en: 'Offensive' },
      defensive: { es: 'Defensivo', en: 'Defensive' },
      all_court: { es: 'Todoterreno', en: 'All-court' },
      serve_volley: { es: 'Saque y volea', en: 'Serve & volley' }
    }
  },
  bestShot: {
    icon: Target,
    label: { es: 'Mejor golpe', en: 'Best shot' },
    values: {
      forehand: { es: 'Derecha', en: 'Forehand' },
      backhand: { es: 'Revés', en: 'Backhand' },
      serve: { es: 'Saque', en: 'Serve' },
      volley: { es: 'Volea', en: 'Volley' },
      return: { es: 'Resto', en: 'Return' },
      drop_shot: { es: 'Dejada', en: 'Drop shot' }
    }
  },
  dominantHand: {
    icon: Hand,
    label: { es: 'Mano dominante', en: 'Dominant hand' },
    values: {
      right: { es: 'Diestro', en: 'Right-handed' },
      left: { es: 'Zurdo', en: 'Left-handed' }
    }
  },
  backhand: {
    icon: Repeat,
    label: { es: 'Revés', en: 'Backhand' },
    values: {
      one_handed: { es: 'A una mano', en: 'One-handed' },
      two_handed: { es: 'A dos manos', en: 'Two-handed' }
    }
  }
}

const EMPTY = { surface: '', playStyle: '', bestShot: '', dominantHand: '', backhand: '', racket: '', racketYear: '' }

const toForm = (p = {}) => ({ ...EMPTY, ...Object.fromEntries(Object.entries(p || {}).filter(([, v]) => v !== null && v !== undefined).map(([k, v]) => [k, String(v)])) })

export default function TennisProfileCard({ tennisProfile, language = 'es', onSaved }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(toForm(tennisProfile))
  const [saved, setSaved] = useState(toForm(tennisProfile))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const t = (es, en) => (language === 'es' ? es : en)
  const notSet = t('Sin indicar', 'Not set')

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/player/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tennisProfile: form })
      })
      if (!res.ok) throw new Error()
      setSaved(form)
      setEditing(false)
      onSaved?.(form)
    } catch {
      setError(t('No se pudo guardar. Inténtalo de nuevo.', 'Could not save. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  const cancel = () => {
    setForm(saved)
    setEditing(false)
    setError('')
  }

  const inputClass = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent'
  const years = []
  for (let y = new Date().getFullYear(); y >= 2005; y--) years.push(y)

  const Row = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-parque-purple" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-500">{label}</div>
        <div className={`text-sm font-medium ${value ? 'text-gray-900' : 'text-gray-400'}`}>{value || notSet}</div>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">{t('Perfil de jugador', 'Player profile')}</h3>
        {!editing && (
          <button onClick={() => setEditing(true)} className="p-1.5 -mr-1.5 text-gray-500 hover:text-parque-purple rounded-lg hover:bg-gray-50" aria-label={t('Editar', 'Edit')}>
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      {!editing ? (
        <div className="px-4 py-1 divide-y divide-gray-50">
          {Object.entries(OPTIONS).map(([key, o]) => (
            <Row key={key} icon={o.icon} label={o.label[language]} value={saved[key] ? o.values[saved[key]]?.[language] : ''} />
          ))}
          <Row icon={Circle} label={t('Raqueta', 'Racket')} value={saved.racket} />
          <Row icon={Calendar} label={t('Raqueta desde', 'Racket since')} value={saved.racketYear} />
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {Object.entries(OPTIONS).map(([key, o]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{o.label[language]}</label>
              <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className={inputClass}>
                <option value="">{notSet}</option>
                {Object.entries(o.values).map(([v, l]) => <option key={v} value={v}>{l[language]}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('Raqueta', 'Racket')}</label>
            <input value={form.racket} maxLength={60} onChange={e => setForm(f => ({ ...f, racket: e.target.value }))} className={inputClass} placeholder="Head Boom Pro" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('Raqueta desde', 'Racket since')}</label>
            <select value={form.racketYear} onChange={e => setForm(f => ({ ...f, racketYear: e.target.value }))} className={inputClass}>
              <option value="">{notSet}</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={cancel} disabled={saving} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {t('Cancelar', 'Cancel')}
            </button>
            <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-parque-purple text-white text-sm font-semibold hover:bg-parque-purple/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('Guardar', 'Save')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
