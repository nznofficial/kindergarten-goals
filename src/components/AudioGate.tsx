import { useState } from 'react'
import { unlock } from '../audio/manager'
import { Mascot } from './Mascot'
import { child } from '../config/child'

interface Props {
  onReady: () => void
}

/**
 * iOS will not let us make a sound until the child has tapped something, and a
 * silent game looks broken rather than muted. So the very first screen is one
 * enormous button whose only job is to satisfy that policy.
 */
export function AudioGate({ onReady }: Props) {
  const [busy, setBusy] = useState(false)

  const start = async () => {
    setBusy(true)
    await unlock()
    onReady()
  }

  return (
    <div className="gate">
      <Mascot pose="wave" size="lg" />
      <h1 className="gate-title">
        Hi {child.firstName}!
      </h1>
      <p className="gate-sub">Tap to start</p>
      <button type="button" className="gate-button" onClick={start} disabled={busy}>
        {busy ? '…' : 'Play'}
      </button>
    </div>
  )
}
