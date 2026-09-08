import { Img } from './Img'

export type MascotPose = 'idle' | 'cheer' | 'think' | 'wave' | 'point'

interface Props {
  pose?: MascotPose
  /** Text in the speech bubble. Kids can't read it — it mirrors the spoken line
   *  so a grown-up nearby knows what was asked. */
  says?: string
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function Mascot({ pose = 'idle', says, size = 'md', onClick }: Props) {
  const body = (
    <Img src={`mascot/${pose}`} alt="Fox guide" className={`mascot-img mascot-${size}`} fallback="🦊" />
  )

  return (
    <div className={`mascot mascot-wrap-${size}`}>
      {onClick ? (
        <button type="button" className="mascot-button" onClick={onClick} aria-label="Say it again">
          {body}
        </button>
      ) : (
        body
      )}
      {says ? <p className="mascot-bubble">{says}</p> : null}
    </div>
  )
}
