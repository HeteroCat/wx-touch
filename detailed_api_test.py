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

def search_and_test_account():
    """搜索公众号并获取其文章"""
    print("=== 步骤1: 搜索公众号 ===")
    endpoint = "/api/search"
    headers = get_auth_headers(endpoint)
    params = {"search": "TuringTouch"}

    try:
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, params=params)
        result = response.json()
        print(f"搜索结果: {json.dumps(result, indent=2, ensure_ascii=False)}")

        if result.get("code") == 200 and result.get("data"):
            account = result["data"][0]
            account_name = account["name"]
            print(f"\n找到公众号: {account_name}")

            # 步骤2: 获取该公众号的文章列表
            print(f"\n=== 步骤2: 获取 {account_name} 的最新文章 ===")
            test_latest_articles(account_name)

            # 步骤3: 使用该公众号进行关键词搜索
            print(f"\n=== 步骤3: 在 {account_name} 中搜索关键词 ===")
            test_keyword_search(account_name)

            return account
        else:
            print("未找到公众号")
            return None

    except Exception as e:
        print(f"搜索失败: {e}")
        return None

def test_latest_articles(account_name):
    """获取最新文章列表"""
    endpoint = "/api/latest_articles"
    headers = get_auth_headers(endpoint)
    params = {"nickname": account_name, "count": 5}

    try:
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, params=params)
        result = response.json()
        print(f"文章列表响应: {json.dumps(result, indent=2, ensure_ascii=False)}")

        if result.get("code") == 200 and result.get("data"):
            articles = result["data"]
            print(f"\n找到 {len(articles)} 篇文章:")
            for i, article in enumerate(articles):
                print(f"{i+1}. {article.get('title', '无标题')}")
                print(f"   链接: {article.get('link', '无链接')}")
                print(f"   摘要: {article.get('digest', '无摘要')[:50]}...")
                print("-" * 50)

            # 如果有文章，测试第一篇文章的Markdown提取
            if articles and articles[0].get("link"):
                first_article_link = articles[0]["link"]
                print(f"\n=== 步骤3: 提取第一篇文章的Markdown内容 ===")
                test_extract_markdown(first_article_link)
        else:
            print("未找到文章")

    except Exception as e:
        print(f"获取文章失败: {e}")

def test_extract_markdown(article_url):
    """提取文章Markdown内容"""
    endpoint = "/api/extract"
    headers = get_auth_headers(endpoint)
    params = {"url": article_url}

    print(f"正在提取文章: {article_url}")

    try:
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, params=params)
        result = response.json()
        print(f"Markdown提取响应: {json.dumps(result, indent=2, ensure_ascii=False)}")

        if isinstance(result, str):
            print(f"Markdown内容预览:")
            print(result[:500] + "..." if len(result) > 500 else result)

    except Exception as e:
        print(f"提取Markdown失败: {e}")

def test_keyword_search(account_name):
    """关键词搜索文章"""
    endpoint = "/api/keyword_search"
    headers = get_auth_headers(endpoint)
    params = {
        "keyword": "AI",
        "nickname": account_name,
        "search_type": "title",
        "count": 5,
        "offset": 0
    }

    try:
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, params=params)
        result = response.json()
        print(f"关键词搜索响应: {json.dumps(result, indent=2, ensure_ascii=False)}")

        if result.get("code") == 200 and result.get("data"):
            articles = result["data"]
            print(f"\n找到 {len(articles)} 篇包含关键词的文章:")
            for i, article in enumerate(articles):
                print(f"{i+1}. {article.get('title', '无标题')}")
                print(f"   发布时间: {article.get('create_time', '未知')}")
                print("-" * 30)

    except Exception as e:
        print(f"关键词搜索失败: {e}")

if __name__ == "__main__":
    print("开始详细的API测试流程...")
    print(f"API Key: {API_KEY[:10]}...")
    print(f"API Secret: {API_SECRET[:10]}...")
    print("=" * 60)

    # 执行完整的测试流程
    search_and_test_account()

    print("\n" + "=" * 60)
    print("详细API测试完成！")