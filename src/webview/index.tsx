import { SearchSidebar } from './SearchSidebar'
import ReactDOM from 'react-dom/client'

const App = () => {
  return <SearchSidebar />
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(<App />)
