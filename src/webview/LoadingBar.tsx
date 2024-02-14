const progressBarStyle = {
  width: '100%',
  height: '6px',
  overflow: 'hidden',
  position: 'relative'
} as const

interface LoadingBarProps {
  loading: boolean
}

export default function LoadingBar({ loading }: LoadingBarProps) {
  const style = {
    display: loading ? '' : 'none',
    position: 'absolute',
    top: '0'
  } as const
  return (
    <div
      style={progressBarStyle}
      role="progressbar"
      aria-valuemin={0}
      aria-hidden={!loading}
    >
      <div className="progressBar" style={style} />
    </div>
  )
}
