# Plan: 设置 OpenCode 回复语言为中文

## 目标
将 OpenCode 及其插件的回复语言设置为中文（`zh`）。

## 背景
- 用户希望 OpenCode（包括 oh-my-openagent 插件）用中文回复
- oh-my-openagent 插件内置了 i18n 系统，支持 `"en"` 和 `"zh"` 两种语言
- 插件通过 `opencode.jsonc` 中的 `i18n.locale` 配置项来设置语言

## 待办事项

### 1. 修复 i18n 配置位置（原方案有误）
- **⚠️ 错误做法**: 把 `i18n` 放在 `opencode.jsonc` 顶层 → OpenCode 验证失败，报 `Unrecognized key: i18n`
- **✅ 正确做法**: `i18n` 必须放在插件配置的第二个元素中：`["oh-my-openagent", {"i18n": {"locale": "zh"}}]`
- **文件**: `/Users/lixiaoyu/.config/opencode/opencode.jsonc`
- **当前状态**: 已完成

### 2. 翻译 `/` 菜单技能描述为中文
- **oh-my-openagent 技能**（16 个）：frontend, debugging, ast-grep, coding-agent-sessions, git-master, init-deep, lsp-setup, programming, refactor, remove-ai-slops, review-work, start-work, ultimate-browsing, ulw-plan, ulw-research, visual-qa
- **内置技能**（10 个）：agent-browser, playwright, playwright-cli, git-master, frontend, review-work, remove-ai-slops, debugging, visual-qa, init-deep
- **Superpowers 技能**（14 个）：brainstorming, dispatching-parallel-agents, executing-plans, finishing-a-development-branch, receiving-code-review, requesting-code-review, subagent-driven-development, systematic-debugging, test-driven-development, using-git-worktrees, using-superpowers, verification-before-completion, writing-plans, writing-skills
- **当前状态**: ✅ 已完成

### 3. 验证
- ~重启 OpenCode，确认能正常打开~ ✅ 已修复
- 重启 OpenCode 后，`/` 菜单中的技能描述应以中文显示 ✅ 技能描述已全部翻译
- 用中文提问，确认 AI 模型自动以中文回复

## 备注
- AI 模型的回复语言默认跟随用户输入语言（用户提中文就问中文），无需额外配置
- 如果系统 `LANG` 环境变量已包含 `zh`（如 `zh_CN.UTF-8`），插件会自动检测为中文；`i18n.locale` 显式设置可确保即使环境变量未设置也能生效
- 插件配置必须放在 OpenCode 的 `plugin` 数组中的 `["plugin-name", {config}]` 格式，不能放在 `opencode.jsonc` 顶层
- 技能描述翻译在以下位置：
  - `~/.config/opencode/node_modules/oh-my-openagent/dist/skills/*/SKILL.md`（各技能文件）
  - `~/.config/opencode/node_modules/oh-my-openagent/dist/index.js`（内置技能注册）
  - `~/.cache/opencode/packages/superpowers@git+.../node_modules/superpowers/skills/*/SKILL.md`（superpowers 技能）
- 注意：更新 oh-my-openagent 插件后翻译可能被覆盖，需要重新应用
