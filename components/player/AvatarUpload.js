'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import { countryFlag } from '@/lib/utils/countries'

const SIZE = 400

async function resizeToSquare(file) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = reject
      i.src = url
    })
    const side = Math.min(img.naturalWidth, img.naturalHeight)
    const sx = (img.naturalWidth - side) / 2
    const sy = (img.naturalHeight - side) / 2
    const canvas = document.createElement('canvas')
    canvas.width = SIZE
    canvas.height = SIZE
    canvas.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE)
    return await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  } finally {
    URL.revokeObjectURL(url)
  }
}

export default function AvatarUpload({ avatar, name, country, language = 'es', onChange }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const t = (es, en) => (language === 'es' ? es : en)

  const upload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const blob = await resizeToSquare(file)
      const fd = new FormData()
      fd.append('file', blob, 'avatar.jpg')
      const res = await fetch('/api/player/avatar', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onChange?.(data.avatar)
    } catch {
      setError(t('No se pudo subir la foto', 'Could not upload photo'))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/player/avatar', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      onChange?.(null)
    } catch {
      setError(t('No se pudo borrar la foto', 'Could not remove photo'))
    } finally {
      setBusy(false)
    }
  }

  const flag = countryFlag(country)

  return (
    <div className="flex flex-col items-start">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="w-full h-full rounded-full overflow-hidden bg-white/20 ring-2 ring-white/60 flex items-center justify-center backdrop-blur-sm"
          aria-label={t('Cambiar foto', 'Change photo')}
        >
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={name || ''} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl sm:text-3xl font-bold">{name ? name.charAt(0).toUpperCase() : '?'}</span>
          )}
          {busy && (
            <span className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </span>
          )}
        </button>
        {flag && (
          <span className="absolute -top-1 -right-1 text-xl leading-none drop-shadow" title={country}>{flag}</span>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white text-parque-purple shadow flex items-center justify-center"
          aria-label={t('Cambiar foto', 'Change photo')}
        >
          <Camera className="w-4 h-4" />
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="hidden" onChange={upload} />
      </div>
      {avatar && !busy && (
        <button type="button" onClick={remove} className="mt-2 text-[11px] text-purple-200 hover:text-white flex items-center gap-1">
          <Trash2 className="w-3 h-3" /> {t('Quitar foto', 'Remove photo')}
        </button>
      )}
      {error && <p className="mt-1 text-[11px] text-red-200">{error}</p>}
    </div>
  )
}
