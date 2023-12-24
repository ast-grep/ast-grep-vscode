import { SgSearch } from '../../../types'

type SearchResultListProps = {
  matches: Array<SgSearch>
}

const SearchResultList = ({ matches }: SearchResultListProps) => {
  // TODO
  return <pre>{JSON.stringify(matches, null, 2)}</pre>
}
export default SearchResultList
