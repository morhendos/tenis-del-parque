'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function MobileHeaderSlot({ children }) {
  const [slot, setSlot] = useState(null)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)')
    const update = () => {
      setSlot(media.matches ? document.getElementById('player-header-slot') : null)
    }
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  if (slot) return createPortal(children(true), slot)
  return children(false)
}
