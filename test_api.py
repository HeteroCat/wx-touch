import requests
import time
import hashlib
import json

# API配置
BASE_URL = "https://wxcrawl.touchturing.com"
API_KEY = "ak-ab56cd11e9be48558f70a72227cff416"
API_SECRET = "sk-f19edf25503a4537bb37ae0da01c8197"

def get_auth_headers(endpoint):
    """生成认证头"""
    timestamp = str(int(time.time()))
    message = f"{API_KEY}{endpoint}{timestamp}{API_SECRET}"
    signature = hashlib.md5(message.encode()).hexdigest()
    return {
        "x-api-key": API_KEY,
        "x-timestamp": timestamp,
        "x-signature": signature,
    }

def test_search_wechat():
    """测试1: 搜索微信公众号"""
    print("=== 测试1: 搜索微信公众号 ===")
    endpoint = "/api/search"
    headers = get_auth_headers(endpoint)
    params = {"search": "Touchturing"}

    try:
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, params=params)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.json()
    except requests.exceptions.HTTPError as e:
        print(f"错误: {e.response.status_code} - {e.response.json()}")
        return None

def test_latest_articles():
    """测试2: 获取最新文章列表"""
    print("\n=== 测试2: 获取最新文章列表 ===")
    endpoint = "/api/latest_articles"
    headers = get_auth_headers(endpoint)
    params = {"nickname": "贪吃蛇大作战LSR", "count": 2}

    try:
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, params=params)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.json()
    except requests.exceptions.HTTPError as e:
        print(f"错误: {e.response.status_code} - {e.response.json()}")
        return None

def test_extract_markdown():
    """测试3: 提取文章Markdown内容"""
    print("\n=== 测试3: 提取文章Markdown内容 ===")
    endpoint = "/api/extract"
    headers = get_auth_headers(endpoint)
    # 使用一个示例URL，实际使用时需要替换为有效的微信公众号文章链接
    params = {"url": "https://mp.weixin.qq.com/s/xxxxxxxxxxxx"}

    try:
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, params=params)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.json()
    except requests.exceptions.HTTPError as e:
        print(f"错误: {e.response.status_code} - {e.response.json()}")
        return None

def test_keyword_search():
    """测试4: 关键词搜索文章"""
    print("\n=== 测试4: 关键词搜索文章 ===")
    endpoint = "/api/keyword_search"
    headers = get_auth_headers(endpoint)
    params = {
        "keyword": "人工智能",
        "nickname": "求知图图",
        "search_type": "title",
        "count": 5,
        "offset": 0
    }

    try:
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, params=params)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.json()
    except requests.exceptions.HTTPError as e:
        print(f"错误: {e.response.status_code} - {e.response.json()}")
        return None

if __name__ == "__main__":
    print("开始测试微信公众号爬虫API...")
    print(f"基础URL: {BASE_URL}")
    print(f"API Key: {API_KEY}")
    print(f"API Secret: {API_SECRET}")
    print("=" * 50)

    # 测试所有接口
    test_search_wechat()
    test_latest_articles()
    test_extract_markdown()
    test_keyword_search()

    print("\n测试完成！")