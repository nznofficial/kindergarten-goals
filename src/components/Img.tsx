import { useState } from 'react'

const BASE = import.meta.env.BASE_URL

interface Props {
  /** Path under public/assets/images, without extension. */
  src: string
  alt: string
  className?: string
  /** Shown while the generated art is missing, so the game is playable before
   *  the asset run and never shows a broken-image icon to a child. */
  fallback?: string
}

/**
 * An illustration with a friendly stand-in. Asset generation happens outside the
 * app, so any image can legitimately be absent during development.
 */
export function Img({ src, alt, className, fallback }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className={`img-fallback ${className ?? ''}`} role="img" aria-label={alt}>
        <span>{fallback ?? alt.slice(0, 2)}</span>
      </div>
    )
  }

  return (
    <img
      className={className}
      src={`${BASE}assets/images/${src}.webp`}
      alt={alt}
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}
