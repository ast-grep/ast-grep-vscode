import * as stylex from '@stylexjs/stylex'
const styles = stylex.create({
  progressBar: {
    width: '100%',
    flex: '0 0 auto',
    height: '6px',
    overflow: 'hidden',
    position: 'relative'
  }
})

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
      {...stylex.props(styles.progressBar)}
      role="progressbar"
      aria-valuemin={0}
      aria-hidden={!loading}
    >
      <div className="progressBar" style={style} />
    </div>
  )
}
