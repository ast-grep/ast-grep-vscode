import * as stylex from '@stylexjs/stylex'
import { Icon, icons } from '../SearchResultList/Icon'
import { ChangeEvent, useCallback, useState } from 'react'
import { VscListFlat } from 'react-icons/vsc'

const styles = stylex.create({
  langButton: {
    position: 'absolute',
    height: '20px',
    width: '20px',
    border: '1px solid transparent',
    right: 2,
    top: 3,
    borderRadius: '3px',
    ':hover': {
      backgroundColor: 'var(--vscode-inputOption-hoverBackground)',
    },
  },
  langActive: {
    borderColor: 'var(--vscode-inputOption-activeBorder)',
    ':hover': {
      background: 'none',
      filter: 'drop-shadow(1px 1px 3px rgba(0,0,0,0.2))',
    },
  },
  langDropdown: {
    height: '100%',
    width: '100%',
    border: 'none',
    background: 'transparent',
    position: 'absolute',
    appearance: 'none',
    outline: 'none',
    color: 'transparent',
    cursor: 'pointer',
    ':focus': {
      outline: 'none',
    },
  },
  langIcon: {
    marginTop: 1,
    marginLeft: 1,
  },
})

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function LangSelect() {
  const [lang, setLang] = useState('')
  const title = lang
    ? `Search pattern in ${lang}`
    : 'Search pattern in specific language'
  const onChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setLang(e.target.value)
    },
    [setLang],
  )
  return (
    <label
      {...stylex.props(styles.langButton, lang ? styles.langActive : null)}
      title={title}
    >
      <select
        {...stylex.props(styles.langDropdown)}
        style={{ outline: 'none' }}
        onChange={onChange}
      >
        <option value="">Auto Detect</option>
        {icons.map(icon => (
          <option value={icon}>{capitalize(icon)}</option>
        ))}
      </select>
      {lang ? <Icon name={lang} style={styles.langIcon} /> : <VscListFlat />}
    </label>
  )
}
