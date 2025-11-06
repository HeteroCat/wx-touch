// 微信公众号爬虫API服务封装
// 基于真实API测试数据更新的完整版本

class WeChatCrawlAPI {
    constructor(apiKey, apiSecret, baseUrl = 'https://wxcrawl.touchturing.com') {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.baseUrl = baseUrl;
    }

    /**
     * 生成认证头
     * @param {string} endpoint - API端点路径
     * @returns {Object} 认证头对象
     */
    generateAuthHeaders(endpoint) {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const message = `${this.apiKey}${endpoint}${timestamp}${this.apiSecret}`;
        const signature = this.md5(message);

        return {
            'x-api-key': this.apiKey,
            'x-timestamp': timestamp,
            'x-signature': signature
        };
    }

    /**
     * MD5哈希函数 (简化版，实际项目中建议使用crypto-js)
     * @param {string} message - 待哈希的消息
     * @returns {string} MD5哈希值
     */
    md5(message) {
        // 这里使用一个简单的实现，生产环境建议使用专业库
        // 为了演示，我们使用浏览器内置的crypto API或Node.js的crypto模块
        if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
            // 浏览器环境
            return this.md5Browser(message);
        } else {
            // Node.js环境或fallback
            return this.md5Node(message);
        }
    }

    /**
     * 浏览器环境的MD5实现
     */
    async md5Browser(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    /**
     * Node.js环境的简化MD5实现
     */
    md5Node(message) {
        // 简化的哈希实现，仅用于演示
        let hash = 0;
        for (let i = 0; i < message.length; i++) {
            const char = message.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * 发送HTTP请求的通用方法
     * @param {string} method - HTTP方法
     * @param {string} endpoint - API端点
     * @param {Object} params - 查询参数
     * @returns {Promise} 请求结果
     */
    async request(method, endpoint, params = {}) {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        const headers = this.generateAuthHeaders(endpoint);

        // 添加查询参数
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        try {
            const response = await fetch(url.toString(), {
                method,
                headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API请求失败 (${endpoint}):`, error);
            throw error;
        }
    }

    /**
     * 1. 搜索微信公众号
     * @param {string} search - 搜索关键词
     * @returns {Promise<Object>} 搜索结果
     * @example
     * // 搜索 "TuringTouch" 相关公众号
     * const result = await api.searchWeChatAccount('TuringTouch');
     * console.log(result.data[0].name); // "图触触控技术TuringTouch"
     */
    async searchWeChatAccount(search) {
        if (!search || search.trim() === '') {
            throw new Error('搜索关键词不能为空');
        }
        return this.request('GET', '/api/search', { search: search.trim() });
    }

    /**
     * 2. 获取最新文章列表
     * @param {string} nickname - 公众号昵称 (必须是精确匹配的公众号名称)
     * @param {number} count - 返回数量，默认10，最大100
     * @returns {Promise<Object>} 文章列表
     * @example
     * // 获取 "图触触控技术TuringTouch" 的最新文章
     * const result = await api.getLatestArticles('图触触控技术TuringTouch', 5);
     * console.log(result.data[0].title); // "来了，图灵 | AI科技前沿"
     */
    async getLatestArticles(nickname, count = 10) {
        if (!nickname || nickname.trim() === '') {
            throw new Error('公众号昵称不能为空');
        }
        if (count < 1 || count > 100) {
            throw new Error('文章数量必须在1-100之间');
        }
        return this.request('GET', '/api/latest_articles', {
            nickname: nickname.trim(),
            count: Math.min(count, 100)
        });
    }

    /**
     * 3. 提取文章Markdown内容
     * @param {string} url - 文章链接 (必须是微信公众号文章链接)
     * @returns {Promise<string>} Markdown内容
     * @example
     * // 提取文章的Markdown内容
     * const markdown = await api.extractArticleMarkdown('https://mp.weixin.qq.com/s/nNIOGhmkLWD5KfDW22WoRg');
     * console.log(markdown);
     */
    async extractArticleMarkdown(url) {
        if (!url || url.trim() === '') {
            throw new Error('文章链接不能为空');
        }
        if (!url.includes('mp.weixin.qq.com')) {
            throw new Error('请提供有效的微信公众号文章链接');
        }

        try {
            const result = await this.request('GET', '/api/extract', { url: url.trim() });
            // 处理可能的编码问题
            return this.fixEncoding(result);
        } catch (error) {
            console.warn('Markdown提取可能遇到编码问题:', error);
            throw error;
        }
    }

    /**
     * 4. 关键词搜索文章
     * @param {string} keyword - 关键词
     * @param {string} nickname - 公众号昵称 (必须是精确匹配的公众号名称)
     * @param {string} searchType - 搜索类型，默认'title'
     * @param {number} count - 返回数量，默认10，最大100
     * @param {number} offset - 偏移量，默认0，用于分页
     * @returns {Promise<Object>} 搜索结果
     * @example
     * // 在 "图触触控技术TuringTouch" 中搜索关键词 "AI"
     * const result = await api.searchArticlesByKeyword('AI', '图触触控技术TuringTouch');
     * console.log(result.total); // 找到的文章总数
     */
    async searchArticlesByKeyword(keyword, nickname, searchType = 'title', count = 10, offset = 0) {
        if (!keyword || keyword.trim() === '') {
            throw new Error('搜索关键词不能为空');
        }
        if (!nickname || nickname.trim() === '') {
            throw new Error('公众号昵称不能为空');
        }
        if (count < 1 || count > 100) {
            throw new Error('文章数量必须在1-100之间');
        }
        if (offset < 0) {
            throw new Error('偏移量不能小于0');
        }

        return this.request('GET', '/api/keyword_search', {
            keyword: keyword.trim(),
            nickname: nickname.trim(),
            search_type: searchType,
            count: Math.min(count, 100),
            offset
        });
    }

    /**
     * 修复字符编码问题
     * @param {string} text - 可能存在编码问题的文本
     * @returns {string} 修复后的文本
     */
    fixEncoding(text) {
        if (typeof text !== 'string') {
            return text;
        }

        // 移除或替换可能导致问题的特殊字符
        return text
            .replace(/[\u200B-\u200D\uFEFF]/g, '') // 移除零宽字符
            .replace(/[\uFFFD]/g, '') // 移除替换字符
            .trim();
    }

    /**
     * 格式化时间戳为可读日期
     * @param {number} timestamp - Unix时间戳
     * @returns {string} 格式化的日期字符串
     */
    formatTimestamp(timestamp) {
        return new Date(timestamp * 1000).toLocaleString('zh-CN');
    }
}

// 导出API服务类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeChatCrawlAPI;
} else if (typeof window !== 'undefined') {
    window.WeChatCrawlAPI = WeChatCrawlAPI;
}

// 使用示例：
// const api = new WeChatCrawlAPI('your_api_key', 'your_api_secret');
// api.searchWeChatAccount('Touchturing').then(result => console.log(result));