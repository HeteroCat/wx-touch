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
 * @file api.ts
 * @description
 * 本文件封装了与微信公众号爬虫API交互的所有功能。
 * 主要功能包括：
 * 1. 搜索微信公众号
 * 2. 获取指定公众号的最新文章列表
 * 3. 提取微信文章的Markdown内容
 * 4. 根据关键词在指定公众号内搜索文章
 *
 * 服务通过`WeChatCrawlAPI`类实现，并导出单例`apiService`供全局使用。
 * API认证通过请求头中的`x-api-key`, `x-timestamp`, `x-signature`实现，
 * 其中`signature`是基于apiKey, endpoint, timestamp和apiSecret生成的MD5哈希。
 *
 * 开发环境利用Vite的代理功能将/api请求转发至目标服务器，避免跨域问题。
 * 生产环境则直接请求`VITE_API_BASE_URL`指定的基础URL。
 */
class WeChatCrawlAPI {
  private baseUrl: string
  private apiKey: string
  private apiSecret: string

  /**
   * @constructor
   * @description
   * 初始化API服务，加载环境变量中的配置。
   * 如果API密钥未配置，会在控制台发出警告。
   */
  constructor() {
    this.baseUrl = API_CONFIG.baseUrl
    this.apiKey = API_CONFIG.apiKey
    this.apiSecret = API_CONFIG.apiSecret

    if (!this.apiKey || !this.apiSecret) {
      console.warn('API密钥未配置，请在.env文件中设置VITE_API_KEY和VITE_API_SECRET')
    }
  }

  /**
   * @method generateAuthHeaders
   * @private
   * @description
   * 根据API端点和当前时间戳生成认证所需的请求头。
   * 签名算法：MD5(apiKey + endpoint + timestamp + apiSecret)
   * @param {string} endpoint - API端点路径，例如 '/api/search'。
   * @returns {Record<string, string>} 包含`x-api-key`, `x-timestamp`, `x-signature`的请求头对象。
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
   * @method request
   * @private
   * @template T
   * @description
   * 一个通用的HTTP请求方法，封装了fetch API，并自动处理认证头和参数。
   * @param {'GET' | 'POST'} method - HTTP请求方法。
   * @param {string} endpoint - API端点路径。
   * @param {Record<string, any>} [params={}] - URL查询参数。
   * @returns {Promise<T>} - 解析后的JSON响应数据。
   * @throws {Error} - 当网络请求失败或API返回非2xx状态码时抛出。
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
   * @method searchWeChatAccount
   * @public
   * @description
   * 根据关键词搜索微信公众号。
   * @param {string} search - 搜索关键词。
   * @returns {Promise<SearchAccountsResponse>} - 包含公众号信息的响应数据。
   * @throws {Error} - 当搜索关键词为空时抛出。
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
   * @method getLatestArticles
   * @public
   * @description
   * 获取指定公众号的最新文章列表。
   * @param {string} nickname - 目标公众号的昵称。
   * @param {number} [count=10] - 希望获取的文章数量，范围为1-100。
   * @returns {Promise<GetArticlesResponse>} - 包含文章列表的响应数据。
   * @throws {Error} - 当公众号昵称为空或文章数量超出范围时抛出。
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
   * @method extractArticleMarkdown
   * @public
   * @description
   * 提取指定URL的微信文章内容，并返回Markdown格式。
   * @param {string} url - 微信文章的URL。
   * @returns {Promise<ExtractMarkdownResponse>} - 文章的Markdown内容字符串。
   * @throws {Error} - 当URL为空或不是有效的微信文章链接时抛出。
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
   * @method searchArticlesByKeyword
   * @public
   * @description
   * 在指定公众号内根据关键词搜索文章。
   * @param {string} keyword - 搜索关键词。
   * @param {string} nickname - 目标公众号的昵称。
   * @param {'title' | 'content'} [searchType='title'] - 搜索范围，'title'表示仅搜索标题，'content'表示搜索标题和内容。
   * @param {number} [count=10] - 返回结果的数量，范围为1-100。
   * @param {number} [offset=0] - 结果的偏移量，用于分页。
   * @returns {Promise<SearchArticlesResponse>} - 包含搜索到的文章列表的响应数据。
   * @throws {Error} - 当关键词或公众号昵称为空，或分页参数不合法时抛出。
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
   * @method fixEncoding
   * @private
   * @description
   * 清理文本中可能存在的编码问题或无效字符。
   * @param {string} text - 待处理的原始文本。
   * @returns {string} - 清理后的文本。
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
   * @method formatTimestamp
   * @public
   * @description
   * 将Unix时间戳（秒）转换为本地化的日期时间字符串。
   * @param {number} timestamp - Unix时间戳（秒）。
   * @returns {string} - 格式如 "YYYY/M/D HH:mm:ss" 的本地日期时间字符串。
   */
  formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString('zh-CN')
  }

  /**
   * @method normalizeImageUrl
   * @public
   * @description
   * 规范化图片URL，主要用于处理协议相对URL和将HTTP转换为HTTPS，以避免浏览器混合内容警告。
   * @param {string} url - 原始图片URL。
   * @returns {string} - 规范化后的HTTPS URL。
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