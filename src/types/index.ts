/**
 * @file index.ts
 * @description
 * 该文件定义了整个应用中使用的核心TypeScript类型和接口。
 * 主要包括：
 * - API相关的类型，如公众号信息(`WeChatAccount`)、文章信息(`Article`)和通用API响应(`APIResponse`)。
 * - 各API端点的特定响应类型，例如`SearchAccountsResponse`和`GetArticlesResponse`。
 * - API请求参数的类型，如`SearchAccountsParams`和`GetArticlesParams`。
 * - 通用错误和配置类型。
 */

// 微信公众号爬虫API TypeScript类型定义

// 公众号信息类型
export interface WeChatAccount {
  name: string;           // 公众号全名
  alias: string;          // 公众号别名
  head_image_url: string; // 头像图片链接
  signature: string;      // 功能简介
  service_type: number;   // 服务类型：0-未知, 1-订阅号, 2-服务号
  verify_status: number;  // 验证状态：-1-未认证, 0-已认证
}

// 文章信息类型
export interface Article {
  title: string;          // 文章标题
  link: string;           // 文章链接
  cover: string;          // 封面图片链接
  digest: string;         // 文章摘要
  create_time: number;    // 创建时间 (Unix时间戳)
  update_time: number;    // 更新时间 (Unix时间戳)
  publish_type: number;   // 发布类型
}

// API响应通用类型
export interface APIResponse<T> {
  code: number;           // 状态码，200表示成功
  data: T[];              // 数据数组
  total?: number;         // 总数(可选，文章列表接口特有)
}

// 搜索公众号响应类型
export type SearchAccountsResponse = APIResponse<WeChatAccount>;

// 获取文章列表响应类型
export type GetArticlesResponse = APIResponse<Article>;

// 提取Markdown内容响应类型
export type ExtractMarkdownResponse = string; // 直接返回Markdown字符串

// 关键词搜索响应类型
export type SearchArticlesResponse = APIResponse<Article>;

// API错误类型
export interface APIError {
  code: number;
  message: string;
  detail?: string;
}

// 请求参数类型
export interface SearchAccountsParams {
  search: string;         // 搜索关键词
}

export interface GetArticlesParams {
  nickname: string;       // 公众号昵称
  count?: number;         // 返回数量，默认10
}

export interface ExtractMarkdownParams {
  url: string;           // 文章链接
}

export interface SearchArticlesParams {
  keyword: string;        // 关键词
  nickname: string;       // 公众号昵称
  search_type?: 'title' | 'content';  // 搜索类型，支持'title'或'content'
  count?: number;         // 返回数量，默认10
  offset?: number;        // 偏移量，默认0
}

// 配置类型
export interface APIConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl?: string;
}