---
title: Fix Python subprocess UnicodeDecodeError on Windows for good
description: AI-written Python scripts pass on Linux, then crash on a Chinese Windows box or silently return empty output. Two AST checks that pin UTF-8 caught 7 misses in 30 days.
answer: Without an explicit encoding, Python decodes subprocess output and encodes print() with the OS code page (gbk on Chinese Windows). Telling the AI in project instructions was not enough, so AllyOS runs two AST checks before every push - every text-mode subprocess call must pass encoding="utf-8", and every script's main() must pin stdout to UTF-8. Scanning 612 files takes about 1.5 s, and the checks caught 7 AI misses in 30 days.
date: 2026-11-28
updated: 2026-11-28
pillar: tools
keyword: python subprocess unicodedecodeerror windows
tags: Claude Code, Python, subprocess, UTF-8, Windows, static analysis
source: 1e40fe7f0670
---

## Background: why a script breaks on a different machine

[AllyOS](https://myaiwebdev.com/#allyos) is a business system I built with Claude Code. Next to the app code, the repository holds hundreds of small Python scripts that run pre-push checks: they read git output, cross-check docs, and print tables of ✓ and ✗. Most were written by AI, and they always worked on Linux and macOS.

They broke on a Chinese-locale Windows machine. Think of an encoding as a codebook. If you don't hand Python one, it asks the OS for the default. Linux and macOS answer UTF-8; Chinese Windows answers gbk (code page 936). Git emits UTF-8, so reading it with the gbk codebook either fails outright or produces garbage.

## Symptom 1: reading child output fails, or "succeeds" with nothing

`subprocess.run(..., text=True)` without `encoding=` decodes with the locale code page. On 2026-11-28 I decoded the same UTF-8 output three ways on Linux (code generalized):

```python
cmd = ["printf", "通过 ✓\n"]          # child writes UTF-8 bytes
for enc in ("gbk", "cp1252", "utf-8"):
    r = subprocess.run(cmd, capture_output=True, encoding=enc)
# gbk    -> UnicodeDecodeError
# cp1252 -> mojibake, returncode 0, no error
# utf-8  -> correct text
```

The cp1252 row is the dangerous one: no exception, exit code 0, and a check script happily reaches a verdict over garbage. On Windows it gets worse. CPython reads pipes there on background threads, the decode error dies inside the thread, and `stdout` comes back as `None` (see the Windows branch of `subprocess.py` in CPython 3.12). The caller sees "git succeeded and said nothing."

## Symptom 2: printing a checkmark crashes

When stdout is a pipe rather than a console, `print()` encodes with the code page. Simulating a gbk pipe:

```bash
PYTHONIOENCODING=gbk python3 -c "print('✓ ok')" | cat
# UnicodeEncodeError: 'gbk' codec can't encode character '✓'
```

The same script works in PowerShell and crashes in Git Bash.

## Why instructions to the AI were not enough

The project instructions Claude Code reads already said scripts must set their subprocess encoding. Yet over the last 30 days, 7 commits on the develop branch existed only to add `encoding="utf-8"` or pin UTF-8 output, and all 7 carry an AI co-author trailer. The rule was known; it just slipped while the model focused on the actual logic. **If a machine can check a rule, don't rely on reminders.**

## The fix: two AST checks that act as tests

AST means parsing code into a tree so you can look for a pattern without running anything. Two unit tests run before every push (generalized):

```python
for node in ast.walk(tree):              # check 1: decode side
    if is_subprocess_call(node) and has_true_kwarg(node, "text", "universal_newlines"):
        if kwarg(node, "encoding") is None:
            offenders.append(f"{path}:{node.lineno}")
# check 2: encode side - every script under tools/ with a main()
# must call pin_utf8_stdio() (sys.stdout.reconfigure(encoding="utf-8"))
```

The failure message states the cause and the fix, so the agent repairs it on its own. Each of the 7 fixes was one keyword argument or one line.

## Measured numbers

| Metric | Value | How we measured |
|---|---|---|
| Python files scanned | 612 | counted 2026-11-28, recursive over the scripts directory |
| subprocess calls / text-mode calls | 211 / 125 | 2026-11-28, same AST rules |
| Scripts with main() that pin UTF-8 | 181 / 181 | 2026-11-28 |
| Runtime of both checks | about 1.5 s | 2026-11-28, Linux, Python 3.12 |
| Commits in 30 days fixing encoding | 7 (all AI co-authored) | develop history counted 2026-11-28; 2,836 commits in that window |

## A checklist you can copy

1. Any `subprocess.run`, `check_output` or `Popen` with `text=True` also gets `encoding="utf-8"`; better, wrap it in one `run_utf8()` helper.
2. First line of every CLI script's `main()`: `sys.stdout.reconfigure(encoding="utf-8")`, plus stderr and stdin.
3. Keep `errors="strict"` so decoding failures are loud; use `errors="replace"` only for advisory output.
4. Write an AST unit test over all scripts that fails on a miss and prints the fix.
5. Run it in the pre-push hook, not just in the AI's instructions.
6. Add one end-to-end test: run a script that prints ✓ with `PYTHONIOENCODING=gbk` and assert it survives.

References: Python's [subprocess docs](https://docs.python.org/3/library/subprocess.html#frequently-used-arguments) on `encoding` and `text`, [UTF-8 Mode](https://docs.python.org/3/library/os.html#utf8-mode), and the [ast module](https://docs.python.org/3/library/ast.html).

## FAQ

### Why not just set PYTHONUTF8=1?

It fixes your machine, but only if every contributor and every CI runner remembers to set it. Declaring the encoding in code works everywhere.

### Why not make the AI remember?

I tried: 7 misses in 30 days with the rule already written down. Reminders lower the error rate; a check catches what slips through. If you want checks like this in your own AI development workflow, see my [services page (in Chinese)](https://myaiwebdev.com/services.html) or read my earlier [Claude Code worktree hooks post-mortem](https://myaiwebdev.com/en/blog/claude-code-subagent-worktree-git-hooks/).
