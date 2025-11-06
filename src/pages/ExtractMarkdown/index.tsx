import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import apiService from '@services/api'
import './ExtractMarkdown.css'

const ExtractMarkdown = () => {
  const [articleUrl, setArticleUrl] = useState('')
  const [markdownContent, setMarkdownContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExtract = async () => {
    if (!articleUrl.trim()) {
      setError('请输入文章链接')
      return
    }

    if (!articleUrl.includes('mp.weixin.qq.com')) {
      setError('请输入有效的微信公众号文章链接')
      return
    }

    setLoading(true)
    setError(null)
    setMarkdownContent('')

    try {
      const content = await apiService.extractArticleMarkdown(articleUrl)
      setMarkdownContent(content)
      if (!content || content.trim() === '') {
        setError('文章内容为空或提取失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '提取失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent)
      alert('Markdown内容已复制到剪贴板')
    } catch (err) {
      alert('复制失败，请手动复制')
    }
  }

  return (
    <div className="extract-markdown-page feature-page">
      {/* 左侧输入区域 */}
      <div className="input-section">
        <div className="input-container">
          <h2 className="section-title">提取Markdown内容</h2>
          <p className="section-description">
            输入微信公众号文章链接，将文章内容转换为Markdown格式
          </p>

          <div className="input-form">
            <div className="input-group">
              <textarea
                value={articleUrl}
                onChange={(e) => setArticleUrl(e.target.value)}
                placeholder="请输入微信公众号文章链接...
例如：https://mp.weixin.qq.com/s/xxxxxxxxxxxx"
                className="url-textarea"
                rows={4}
                disabled={loading}
              />
            </div>

            <button
              onClick={handleExtract}
              disabled={loading || !articleUrl.trim()}
              className="extract-button"
            >
              {loading ? '提取中...' : '提取Markdown'}
            </button>

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
              <li>链接必须来自微信公众号 (mp.weixin.qq.com)</li>
              <li>支持文章完整内容转换</li>
              <li>转换后的内容包含文本格式和链接</li>
              <li>部分特殊字符可能会影响转换效果</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 右侧结果展示区域 */}
      <div className="result-section">
        <div className="result-container">
          <div className="result-header">
            <h3 className="result-title">Markdown内容</h3>
            {markdownContent && (
              <button
                onClick={copyToClipboard}
                className="copy-button"
              >
                复制内容
              </button>
            )}
          </div>

          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>正在提取文章内容...</p>
            </div>
          )}

          {!loading && !markdownContent && !error && (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h4>暂无内容</h4>
              <p>请输入文章链接开始提取</p>
            </div>
          )}

          {!loading && markdownContent && (
            <div className="markdown-display">
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({node, ...props}) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" />
                    ),
                    img: ({node, ...props}) => {
                      const src = apiService.normalizeImageUrl(String((props as any).src || ''))
                      return (
                        <img
                          {...props}
                          src={src}
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                      )
                    }
                  }}
                >
                  {markdownContent}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExtractMarkdown