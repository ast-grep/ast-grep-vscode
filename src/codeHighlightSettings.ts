const highlightColorOnLight = '#ddebf2'
const highlightColorOnLightSecondary = '#f2ddf1'

const highlightColorOnDark = '#35485b'
// const highlightColorOnDarkSecondary = '#263442'
const highlightColorOnDarkSecondary = '#46355b'

export const getMatchHighlightStyle = (isDark: boolean) => {
  const highlightColor = isDark ? highlightColorOnDark : highlightColorOnLight

  return {
    backgroundColor: highlightColor,
    boxShadow: `0px 5px 0px ${highlightColor}, 0px -5px 0px ${highlightColor}`
  }
}

export const getMatchHighlightStyleSecondary = (isDark: boolean) => {
  const highlightColor = isDark
    ? highlightColorOnDarkSecondary
    : highlightColorOnLightSecondary

  return {
    backgroundColor: highlightColor,
    boxShadow: `0px 5px 0px ${highlightColor}, 0px -5px 0px ${highlightColor}`
  }
}
