import type { Stars as StarCount } from '../state/progress'

interface Props {
  count: StarCount
  size?: 'sm' | 'lg'
  /** Animate them popping in one at a time, for the end-of-round celebration. */
  animate?: boolean
}

export function Stars({ count, size = 'sm', animate = false }: Props) {
  return (
    <div className={`stars stars-${size}`} aria-label={`${count} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`star ${i < count ? 'star-on' : 'star-off'} ${animate && i < count ? 'star-pop' : ''}`}
          style={animate ? { animationDelay: `${i * 260}ms` } : undefined}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  )
}
