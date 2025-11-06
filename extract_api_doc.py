import docx
import re

def extract_api_documentation():
    doc_path = r'C:\Users\h1930\Desktop\个人\AI应用开发\wx-touch\微信公众号爬虫服务 API 文档.docx'
    doc = docx.Document(doc_path)

    full_text = ""
    for para in doc.paragraphs:
        full_text += para.text + "\n"

    print("=== 文档完整内容 ===")
    print(full_text)

    # 提取代码块
    code_blocks = re.findall(r'```(.*?)```', full_text, re.DOTALL)
    print("\n=== 找到的代码块 ===")
    for i, code in enumerate(code_blocks):
        print(f"代码块 {i+1}:")
        print(code)
        print("-" * 50)

if __name__ == "__main__":
    extract_api_documentation()