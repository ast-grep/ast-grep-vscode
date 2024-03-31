import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  icon: {
    width: 16,
    height: 16,
    lineHeight: 22,
    marginRight: 6,
  },
})

const icons = `
  bash,
  c,
  cpp,
  csharp,
  css,
  dart,
  go,
  elixir,
  html,
  java,
  javascript,
  json,
  kotlin,
  lua,
  php,
  python,
  ruby,
  rust,
  scala,
  swift,
  tsx,
  typescript
`
  .split(',')
  .map(icon => icon.trim())
  .filter(Boolean)

export function Icon({ name }: { name: string }) {
  const iconName = icons.includes(name) ? name : 'file'
  // @ts-expect-error
  const src = window.ICON_SRC + `/${iconName}.svg`
  return <img src={src} {...stylex.props(styles.icon)} />
}
