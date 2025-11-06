import { Routes, Route } from 'react-router-dom'
import Home from '@pages/Home'
import SearchAccount from '@pages/SearchAccount'
import LatestArticles from '@pages/LatestArticles'
import ExtractMarkdown from '@pages/ExtractMarkdown'
import KeywordSearch from '@pages/KeywordSearch'
import Layout from '@components/common/Layout'
import './styles/App.css'

function App() {
  return (
    <div className="App">
      
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search-account" element={<SearchAccount />} />
          <Route path="/latest-articles" element={<LatestArticles />} />
          <Route path="/extract-markdown" element={<ExtractMarkdown />} />
          <Route path="/keyword-search" element={<KeywordSearch />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App