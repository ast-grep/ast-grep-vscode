import { memo } from 'react'
import SearchOptions from './comps/SearchOptions'
import SearchWidget from './comps/SearchWidget'

function SearchWidgetContainer() {
  return (
    <div style={{ margin: '0 12px 0 2px' }}>
      <SearchWidget />
      <SearchOptions />
    </div>
  )
}

export default memo(SearchWidgetContainer)
