import { useState } from 'react'
import apiService from '@services/api'
import type { Article } from '@/types'
import CustomSelect from '@/components/common/CustomSelect'

const KeywordSearch = () => {
  const [keyword, setKeyword] = useState('')
  const [nickname, setNickname] = useState('')
  const [searchType, setSearchType] = useState<'title' | 'content'>('title')
  const [count, setCount] = useState<number>(10)
  const [articles, setArticles] = useState<Article[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const safeCount = Math.min(Math.max(count || 10, 1), 20)
  const pageSize = safeCount

  const handleSearch = async (page: number = 0) => {
    if (!keyword.trim()) {
      setError('请输入搜索关键词')
      return
    }

    if (!nickname.trim()) {
      setError('请输入公众号昵称')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await apiService.searchArticlesByKeyword(
        keyword,
        nickname,
        searchType,
        pageSize,
        page * pageSize
      )

      if (response.code === 200) {
        if (page === 0) {
          setArticles(response.data)
        } else {
          setArticles(prev => [...prev, ...response.data])
        }
        setTotalCount(response.total || 0)
        setCurrentPage(page)

        if (response.data.length === 0 && page === 0) {
          setError('未找到包含该关键词的文章')
        }
      } else {
        setError('搜索失败，请重试')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜索失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchClick = () => {
    handleSearch(0) // 从第一页开始搜索
  }

  const handleLoadMore = () => {
    handleSearch(currentPage + 1)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchClick()
    }
  }

  const formatTime = (timestamp: number) => {
    return apiService.formatTimestamp(timestamp)
  }

  const hasMore = articles.length < totalCount

  // 仅允许 <em class="highlight">... </em>，去除其它潜在不安全标签
  const sanitizeHighlightHtml = (html: string) => {
    if (!html || typeof html !== 'string') return html
    let cleaned = html
      // 移除<script>及内容
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      // 移除除 em 标签外的其它标签
      .replace(/<(?!\/?em\b)[^>]*>/g, '')

    // 标准化 em 的属性，只保留 highlight 类
    cleaned = cleaned.replace(/<em[^>]*>/gi, (tag) => {
      const hasHighlight = /class\s*=\s*(["'])[^"']*highlight[^"']*\1/i.test(tag)
      return hasHighlight ? '<em class="highlight">' : '<em>'
    })

    return cleaned
  }

  return (
    <div className="keyword-search-page feature-page">
      {/* 左侧输入区域 */}
      <div className="input-section">
        <div className="input-container">
          <h2 className="section-title">关键词搜索文章</h2>
          <p className="section-description">
            在指定公众号中根据关键词搜索相关文章
          </p>

          <div className="search-form">
            <div className="input-group">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="请输入搜索关键词..."
                className="search-input"
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="请输入公众号昵称..."
                className="search-input"
                disabled={loading}
              />
            </div>

            <div className="inline-controls">
              <div className="input-group inline-item">
                <label className="control-label">搜索范围</label>
                <CustomSelect
                  options={[
                    { value: 'title', label: '标题' },
                    { value: 'content', label: '内容' },
                  ]}
                  value={searchType}
                  onChange={(value) => setSearchType(value as 'title' | 'content')}
                  className="search-type-select"
                  disabled={loading}
                />
              </div>

              <div className="input-group inline-item">
                <label className="control-label">返回数量</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="count-input"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              onClick={handleSearchClick}
              disabled={loading || !keyword.trim() || !nickname.trim()}
              className="search-button"
            >
              {loading ? '搜索中...' : '开始搜索'}
            </button>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>

          {/* 搜索结果统计 */}
          {articles.length > 0 && (
            <div className="search-stats">
              <p>找到 <span className="highlight">{totalCount}</span> 篇相关文章</p>
              <p>已显示 <span className="highlight">{articles.length}</span> 篇</p>
            </div>
          )}

          {/* 使用提示 */}
          <div className="usage-tips">
            <h4>使用提示：</h4>
            <ul>
              <li>可选择在文章标题或内容中进行搜索</li>
              <li>公众号昵称需要完全匹配</li>
              <li>每次返回 1-20 条，可分页加载查看更多结果</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 右侧结果展示区域 */}
      <div className="result-section">
        <div className="result-container">
          <h3 className="result-title">
            搜索结果
            {articles.length > 0 && (
              <span className="result-count">({articles.length}/{totalCount})</span>
            )}
          </h3>

          {loading && articles.length === 0 && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>正在搜索中...</p>
            </div>
          )}

          {!loading && articles.length === 0 && !error && (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <h4>暂无搜索结果</h4>
              <p>请输入关键词和公众号昵称开始搜索</p>
            </div>
          )}

          {!loading && articles.length > 0 && (
            <div className="articles-waterfall">
              {articles.map((article, index) => (
                <div key={`${article.link}-${index}`} className="article-card">
                  {article.cover && (
                    <div className="article-cover">
                      <img
                        src={apiService.normalizeImageUrl(article.cover)}
                        alt={article.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}

                  <div className="article-content">
                    <h4
                      className="article-title"
                      dangerouslySetInnerHTML={{ __html: sanitizeHighlightHtml(article.title) }}
                    />

                    {article.digest && (
                      <p className="article-digest">{article.digest}</p>
                    )}

                    <div className="article-meta">
                      <span className="article-time">
                        {formatTime(article.create_time)}
                      </span>
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="article-link"
                      >
                        阅读原文
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              {/* 加载更多按钮 */}
              {hasMore && (
                <div className="load-more-container">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="load-more-button"
                  >
                    {loading ? '加载中...' : '加载更多'}
                  </button>
                </div>
              )}

              {/* 搜索完成提示 */}
              {!hasMore && articles.length > 0 && (
                <div className="search-complete">
                  <p>已显示全部搜索结果</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default KeywordSearch