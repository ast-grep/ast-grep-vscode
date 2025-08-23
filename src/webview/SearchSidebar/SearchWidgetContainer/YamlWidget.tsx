import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  yaml: {
    marginLeft: 18,
    display: 'flex',
    flexDirection: 'column',
  },
  editor: {
    width: '100%',
  },
  searchButton: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
})

export default function YamlWidget() {
  return (
    <div {...stylex.props(styles.yaml)}>
    </div>
  )
}
