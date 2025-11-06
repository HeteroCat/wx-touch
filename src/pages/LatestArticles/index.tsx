import { useState } from 'react'
import apiService from '@services/api'
import type { Article } from '@/types'
import './LatestArticles.css'

const LatestArticles = () => {
  const [nickname, setNickname] = useState('')
  const [count, setCount] = useState(10)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetchArticles = async () => {
    if (!nickname.trim()) {
      setError('请输入公众号昵称')
      return
    }

    // 规范数量范围 1-100
    const safeCount = Math.min(Math.max(Math.floor(count) || 10, 1), 100)
    if (safeCount !== count) {
      setCount(safeCount)
    }

    setLoading(true)
    setError(null)

    try {
      const response = await apiService.getLatestArticles(nickname, safeCount)
      if (response.code === 200) {
        setArticles(response.data)
        if (response.data.length === 0) {
          setError('该公众号暂无文章')
        }
      } else {
        setError('获取文章失败，请重试')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取文章失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: number) => {
    return apiService.formatTimestamp(timestamp)
  }

  return (
    <div className="latest-articles-page feature-page">
      {/* 左侧输入区域 */}
      <div className="input-section">
        <div className="input-container">
          <h2 className="section-title">获取最新文章</h2>
          <p className="section-description">
            输入公众号昵称，获取该公众号的最新文章列表
          </p>

          <div className="input-form">
            <div className="input-group">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFetchArticles()}
                placeholder="请输入公众号昵称..."
                className="article-input"
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <input
                type="number"
                value={count}
                min={1}
                max={100}
                step={1}
                onChange={(e) => setCount(Number(e.target.value))}
                onKeyPress={(e) => e.key === 'Enter' && handleFetchArticles()}
                placeholder="返回数量 (1-100，默认10)"
                className="count-input"
                disabled={loading}
              />
              <button
                onClick={handleFetchArticles}
                disabled={loading || !nickname.trim()}
                className="fetch-button"
              >
                {loading ? '获取中...' : '获取文章'}
              </button>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>

          {/* 使用提示 */}
          <div className="usage-tips">
            <h4>使用提示：</h4>
            <ul>
              <li>请输入完整的公众号昵称</li>
              <li>昵称需要与搜索结果中的名称完全匹配</li>
              <li>可以先用搜索功能找到准确的公众号名称</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 右侧结果展示区域 */}
      <div className="result-section">
        <div className="result-container">
          <h3 className="result-title">
            最新文章
            {articles.length > 0 && (
              <span className="article-count">({articles.length})</span>
            )}
          </h3>

          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>正在获取文章...</p>
            </div>
          )}

          {!loading && articles.length === 0 && !error && (
            <div className="empty-state">
              <div className="empty-icon">📰</div>
              <h4>暂无文章</h4>
              <p>请输入公众号昵称获取最新文章</p>
            </div>
          )}

          {!loading && articles.length > 0 && (
            <div className="articles-waterfall">
              {articles.map((article, index) => (
                <div key={index} className="article-card">
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
                    <h4 className="article-title">{article.title}</h4>

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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LatestArticles