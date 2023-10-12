import { Language } from 'prism-react-renderer'

export const getLanguageBasedOnFileExtension = (
  fileExtension?: string,
): Language => {
  if (!fileExtension) {
    return 'tsx'
  }

  const extensionsSameAsLang: Language[] = [
    'css',
    'go',
    'json',
    'less',
    'sass',
    'scss',
    'sql',
    'yaml',
    'jsx',
    'tsx',
  ]

  if (extensionsSameAsLang.includes(fileExtension as Language)) {
    return fileExtension as Language
  }

  if (fileExtension === 'ts') {
    return 'typescript'
  }

  const jsLike = ['js', 'cjs', 'mjs', 'php']

  if (jsLike.includes(fileExtension)) {
    return 'javascript'
  }

  const markupLike = ['html', 'htm']

  if (markupLike.includes(fileExtension)) {
    return 'markup'
  }

  if (fileExtension === 'py') {
    return 'python'
  }

  if (fileExtension === 'ml') {
    return 'ocaml'
  }

  return 'tsx'
}
