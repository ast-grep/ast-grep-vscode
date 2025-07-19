import ReactDOM from 'react-dom/client'
import { SearchSidebar } from './SearchSidebar'

const App = () => {
  return <SearchSidebar />
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
