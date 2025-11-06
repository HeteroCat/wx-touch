import CryptoJS from 'crypto-js'
import type {
  SearchAccountsResponse,
  GetArticlesResponse,
  ExtractMarkdownResponse,
  SearchArticlesResponse
} from '@/types'

// API配置
const API_CONFIG = {
  // 在开发环境中通过 Vite 代理使用相对路径，以避免跨域
  baseUrl: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || 'https://wxcrawl.touchturing.com'),
  apiKey: import.meta.env.VITE_API_KEY || '',
  apiSecret: import.meta.env.VITE_API_SECRET || ''
}

/**
 * 微信公众号爬虫API服务类
 */
class WeChatCrawlAPI {
  private baseUrl: string
  private apiKey: string
  private apiSecret: string

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl
    this.apiKey = API_CONFIG.apiKey
    this.apiSecret = API_CONFIG.apiSecret

    if (!this.apiKey || !this.apiSecret) {
      console.warn('API密钥未配置，请在.env文件中设置VITE_API_KEY和VITE_API_SECRET')
    }
  }

  /**
   * 生成MD5签名认证头
   * @param endpoint API端点路径
   * @returns 认证头对象
   */
  private generateAuthHeaders(endpoint: string): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const message = `${this.apiKey}${endpoint}${timestamp}${this.apiSecret}`
    const signature = CryptoJS.MD5(message).toString()

    return {
      'x-api-key': this.apiKey,
      'x-timestamp': timestamp,
      'x-signature': signature
    }
  }

  /**
   * 发送HTTP请求的通用方法
   * @param method HTTP方法
   * @param endpoint API端点
   * @param params 查询参数
   * @returns 请求结果
   */
  private async request<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    // 当 baseUrl 为空（开发环境）时，使用当前站点作为基准构建 URL
    const url = this.baseUrl
      ? new URL(`${this.baseUrl}${endpoint}`)
      : new URL(endpoint, window.location.origin)
    const headers = {
      ...this.generateAuthHeaders(endpoint),
      'Content-Type': 'application/json'
    }

    // 添加查询参数
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key])
      }
    })

    try {
      const response = await fetch(url.toString(), {
        method,
        headers
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`API请求失败: ${response.status} - ${errorData.detail || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API请求失败 (${endpoint}):`, error)
      throw error
    }
  }

  /**
   * 1. 搜索微信公众号
   * @param search 搜索关键词
   * @returns 搜索结果
   */
  async searchWeChatAccount(search: string): Promise<SearchAccountsResponse> {
    if (!search || search.trim() === '') {
      throw new Error('搜索关键词不能为空')
    }
    return this.request<SearchAccountsResponse>('GET', '/api/search', {
      search: search.trim()
    })
  }

  /**
   * 2. 获取最新文章列表
   * @param nickname 公众号昵称
   * @param count 返回数量，默认10
   * @returns 文章列表
   */
  async getLatestArticles(nickname: string, count: number = 10): Promise<GetArticlesResponse> {
    if (!nickname || nickname.trim() === '') {
      throw new Error('公众号昵称不能为空')
    }
    if (count < 1 || count > 100) {
      throw new Error('文章数量必须在1-100之间')
    }

    return this.request<GetArticlesResponse>('GET', '/api/latest_articles', {
      nickname: nickname.trim(),
      count: Math.min(count, 100)
    })
  }

  /**
   * 3. 提取文章Markdown内容
   * @param url 文章链接
   * @returns Markdown内容
   */
  async extractArticleMarkdown(url: string): Promise<ExtractMarkdownResponse> {
    if (!url || url.trim() === '') {
      throw new Error('文章链接不能为空')
    }
    if (!url.includes('mp.weixin.qq.com')) {
      throw new Error('请提供有效的微信公众号文章链接')
    }

    try {
      const result = await this.request<string>('GET', '/api/extract', {
        url: url.trim()
      })
      // 处理可能的编码问题
      return this.fixEncoding(result)
    } catch (error) {
      console.warn('Markdown提取可能遇到编码问题:', error)
      throw error
    }
  }

  /**
   * 4. 关键词搜索文章
   * @param keyword 关键词
   * @param nickname 公众号昵称
   * @param searchType 搜索类型，默认'title'
   * @param count 返回数量，默认10
   * @param offset 偏移量，默认0
   * @returns 搜索结果
   */
  async searchArticlesByKeyword(
    keyword: string,
    nickname: string,
    searchType: 'title' | 'content' = 'title',
    count: number = 10,
    offset: number = 0
  ): Promise<SearchArticlesResponse> {
    if (!keyword || keyword.trim() === '') {
      throw new Error('搜索关键词不能为空')
    }
    if (!nickname || nickname.trim() === '') {
      throw new Error('公众号昵称不能为空')
    }
    if (count < 1 || count > 100) {
      throw new Error('文章数量必须在1-100之间')
    }
    if (offset < 0) {
      throw new Error('偏移量不能小于0')
    }

    return this.request<SearchArticlesResponse>('GET', '/api/keyword_search', {
      keyword: keyword.trim(),
      nickname: nickname.trim(),
      search_type: searchType,
      count: Math.min(count, 100),
      offset
    })
  }

  /**
   * 修复字符编码问题
   * @param text 可能存在编码问题的文本
   * @returns 修复后的文本
   */
  private fixEncoding(text: string): string {
    if (typeof text !== 'string') {
      return text
    }

    // 移除或替换可能导致问题的特殊字符
    return text
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // 移除零宽字符
      .replace(/[\uFFFD]/g, '') // 移除替换字符
      .trim()
  }

  /**
   * 格式化时间戳为可读日期
   * @param timestamp Unix时间戳
   * @returns 格式化的日期字符串
   */
  formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString('zh-CN')
  }

  /**
   * 规范化图片URL，避免在HTTPS环境下加载HTTP图片导致被浏览器拦截
   * 同时处理以//开头的协议相对URL
   */
  normalizeImageUrl(url: string): string {
    if (!url || typeof url !== 'string') return url
    let result = url.trim()
    // 处理协议相对URL
    if (result.startsWith('//')) {
      result = 'https:' + result
    }
    // 将http切换为https，避免混合内容被拦截
    if (result.startsWith('http://')) {
      result = result.replace(/^http:\/\//, 'https://')
    }
    return result
  }
}

// 导出API服务实例
export const apiService = new WeChatCrawlAPI()
export default apiService