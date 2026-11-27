#!/usr/bin/env python3
"""scripts/blog.py 的自测:证明信息安全红线真的会拦,而不是"看起来在检查"。

运行:python3 scripts/test_blog.py(零依赖,标准库 unittest)
"""
import os
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import blog  # noqa: E402

CLEAN_FM = """---
title: t
description: d
answer: a
date: 2026-11-27
updated: 2026-11-27
pillar: incident
keyword: k
tags: a, b, c
source: c93877854072
---
"""


def scan(body: str, deny=None):
    with tempfile.TemporaryDirectory() as d:
        path = Path(d) / "x-post.zh.md"
        path.write_text(CLEAN_FM + body, encoding="utf-8")
        post = blog.parse_post(path, [])
        return blog.redline_errors([post], deny or [])


class Redlines(unittest.TestCase):
    def assertFlags(self, body, label, deny=None):
        errs = scan(body, deny)
        self.assertTrue(any(label in e for e in errs), f"应拦下 [{label}],实际:{errs}")

    def test_clean_text_passes(self):
        body = ("正常文字,引用 [文档](https://code.claude.com/docs/en/hooks) 和 [首页](https://myaiwebdev.com/)。"
                "联系 307697527@qq.com。版本 2.1.332,`core.hooksPath`,`auth.uid()`。\n"
                "```bash\necho $1 $(date +%T)\n```\n")
        self.assertEqual(scan(body), [])

    def test_internal_ids(self):
        self.assertFlags("见 BUG-1166 的复盘", "内部需求 / 事故 / 决策编号")
        self.assertFlags("合并了 #9207", "PR / issue 编号")
        self.assertFlags("改了 src/modules/crm", "AllyOS 仓库内部路径")
        self.assertFlags("写入 crm.activities 表", "AllyOS 真实库表名")
        self.assertFlags("仓库 Ally-Nutra-LLC-New/ally-os", "公司私有仓库")
        self.assertFlags("连到 abcdefghijklmnopqrst.supabase.co", "公司私有仓库")

    def test_money_and_contacts(self):
        self.assertFlags("报价 $1,200 起", "金额")
        self.assertFlags("成本 3.5 万元", "金额")
        self.assertFlags("costs 500 USD", "金额")
        self.assertFlags("电话 13800138000", "手机号")
        self.assertFlags("call (415) 555-0100", "电话号码")
        self.assertFlags("写信给 someone@example.com", "邮箱")

    def test_secrets(self):
        self.assertFlags("key sk-ant-abcdefghijklmnopqrstuvwxyz", "疑似 API 密钥")
        self.assertFlags("```\nAKIAABCDEFGHIJKLMNOP\n```", "疑似 AWS 密钥")
        self.assertFlags("token 0123456789abcdef0123456789abcdef", "长十六进制串")
        self.assertFlags("内网 10.0.12.34", "IP 地址")

    def test_external_links_need_allowlist(self):
        self.assertFlags("看 https://example-customer.com/x", "外链不在白名单")
        self.assertFlags("看 https://github.com/Ally-Nutra-LLC-New/ally-os", "外链不在白名单")

    def test_private_denylist_is_case_insensitive_and_masked(self):
        errs = scan("客户是 Acme Foods 公司", ["acme foods"])
        self.assertTrue(any("私有敏感词" in e for e in errs))
        self.assertFalse(any("acme foods" in e.lower() for e in errs), "日志里不能回显敏感词原文")

    def test_strict_without_denylist_fails(self):
        old = os.environ.pop("BLOG_DENYLIST", None)
        try:
            class A:  # noqa: D401
                strict, denylist = True, []
            self.assertEqual(blog.cmd_check(A()), 1)
        finally:
            if old is not None:
                os.environ["BLOG_DENYLIST"] = old


class Markdown(unittest.TestCase):
    def test_faq_table_and_escaping(self):
        md = ("## 一\n段落 <script>\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n## 常见问题\n\n### 问?\n\n答。\n")
        r = blog.render_markdown(md, "zh")
        self.assertIn("&lt;script&gt;", r.html)
        self.assertEqual(r.tables, 1)
        self.assertEqual(r.faq, [("问?", "答。")])
        self.assertEqual(r.h2s, ["一", "常见问题"])

    def test_h1_rejected(self):
        self.assertTrue(blog.render_markdown("# 标题\n", "zh").errors)


if __name__ == "__main__":
    unittest.main(verbosity=2)
