import { memo, useState } from 'react'
import { useEffectOnce } from 'react-use'
import { childPort } from '../../postMessage'
import SearchOptions from './SearchOptions'
import SearchWidget from './SearchWidget'
import YamlWidget from './YamlWidget'

function SearchWidgetContainer() {
  const [isYaml, setIsYaml] = useState(false)
  useEffectOnce(() => {
    childPort.onMessage('enableYAML', setIsYaml)
  })
  return (
    <div style={{ margin: '0 12px 0 2px' }}>
      {isYaml ? <YamlWidget /> : <SearchWidget />}
      <SearchOptions />
    </div>
  )
}

export default memo(SearchWidgetContainer)
