import * as stylex from '@stylexjs/stylex'
import { Icon, icons } from '../SearchResultList/Icon'
import { type ChangeEvent, useCallback } from 'react'
import { VscListFlat } from 'react-icons/vsc'
import { useSearchField } from '../../hooks/useQuery'

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
  // <option> color is required for windows
  langOptions: {
    color: 'var(--vscode-dropdown-foreground)',
    backgroundColor: 'var(--vscode-dropdown-background)',
  },
})

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function LangSelect() {
  const [lang, setLang] = useSearchField('lang')
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
        value={lang}
        onChange={onChange}
      >
        <option value="" {...stylex.props(styles.langOptions)}>
          Auto Detect
        </option>
        {icons.map(icon => (
          <option key={icon} value={icon} {...stylex.props(styles.langOptions)}>
            {capitalize(icon)}
          </option>
        ))}
      </select>
      {lang ? <Icon name={lang} style={styles.langIcon} /> : <VscListFlat />}
    </label>
  )
}
