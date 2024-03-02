import { memo } from 'react'
import SearchOptions from './SearchOptions'
import SearchWidget from './SearchWidget'

function SearchWidgetContainer() {
  return (
    <div style={{ margin: '0 12px 0 2px' }}>
      <SearchWidget />
      <SearchOptions />
    </div>
  )
}

export default memo(SearchWidgetContainer)
