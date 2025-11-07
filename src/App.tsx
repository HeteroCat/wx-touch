/**
 * @file App.tsx
 * @description
 * 应用的主组件，负责定义整体布局和页面路由。
 *
 * - 使用`react-router-dom`的`Routes`和`Route`组件来管理不同URL路径下的页面渲染。
 * - 所有页面都被包裹在`Layout`组件中，以实现统一的导航栏和页面结构。
 * - 定义了应用的五个主要页面路由：首页、搜索公众号、最新文章、Markdown提取和关键词搜索。
 */
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