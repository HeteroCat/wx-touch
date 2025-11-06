import { useState } from 'react'
import apiService from '@services/api'
import type { WeChatAccount } from '@/types'
import './SearchAccount.css'

const SearchAccount = () => {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<WeChatAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      setError('请输入搜索关键词')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await apiService.searchWeChatAccount(searchKeyword)
      if (response.code === 200) {
        setSearchResults(response.data)
        if (response.data.length === 0) {
          setError('未找到相关公众号')
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="search-account-page feature-page">
      {/* 左侧输入区域 */}
      <div className="input-section">
        <div className="input-container">
          <h2 className="section-title">搜索微信公众号</h2>
          <p className="section-description">
            输入公众号名称或关键词，快速找到您感兴趣的微信公众号
          </p>

          <div className="search-form">
            <div className="input-group">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="请输入公众号名称或关键词..."
                className="search-input"
                disabled={loading}
              />
              <button
                onClick={handleSearch}
                disabled={loading || !searchKeyword.trim()}
                className="search-button"
              >
                {loading ? '搜索中...' : '搜索'}
              </button>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>

          {/* 搜索提示 */}
          <div className="search-tips">
            <h4>搜索提示：</h4>
            <ul>
              <li>支持公众号名称、昵称搜索</li>
              <li>关键词越精确，搜索结果越准确</li>
              <li>可以尝试使用英文名称或缩写</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 右侧结果展示区域 */}
      <div className="result-section">
        <div className="result-container">
          <h3 className="result-title">
            搜索结果
            {searchResults.length > 0 && (
              <span className="result-count">({searchResults.length})</span>
            )}
          </h3>

          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>正在搜索中...</p>
            </div>
          )}

          {!loading && searchResults.length === 0 && !error && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h4>暂无搜索结果</h4>
              <p>请输入关键词开始搜索</p>
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <div className="accounts-grid">
              {searchResults.map((account, index) => (
                <div key={index} className="account-card">
                  <div className="account-avatar">
                    <img
                      src={apiService.normalizeImageUrl(account.head_image_url)}
                      alt={account.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNmMGYwZjAiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSI5OTk5OTkiLz4KPHBhdGggZD0iTTggMTRDOC01LjI1IDEwLjc0OTkgMyAxMyAzSDE4QzE2Ljc1IDMgMTUuNSA1LjI1IDE1LjUgOFYxNEMxNS41IDE2Ljc1IDEzLjI1IDE5IDEwLjUgMTlIOC41IDE5IDYuMjUgMTYuNzUgNi4yNSAxNFY4QzYuMjUgNS4yNSA4LjUgMyAxMSAzSDhDOS43NDk5IDMgOCA1LjI1IDggOFYxNFoiIGZpbGw9Ijk5OTk5OSIvPgo8L3N2Zz4KPC9zdmc+'
                      }}
                    />
                  </div>

                  <div className="account-info">
                    <h4 className="account-name">{account.name}</h4>
                    <p className="account-signature">{account.signature}</p>

                    <div className="account-meta">
                      <span className="service-type">
                        {account.service_type === 1 ? '订阅号' :
                         account.service_type === 2 ? '服务号' : '未知'}
                      </span>
                      <span className="verify-status">
                        {account.verify_status === 0 ? '已认证' : '未认证'}
                      </span>
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

export default SearchAccount