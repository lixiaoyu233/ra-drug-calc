# 风免计算器 — 工作指引

## 项目性质

纯前端静态项目，**无构建工具、无测试框架、无 linter、无 typecheck**。所有验证靠手动打开页面。

## 目录结构

```
docs/                      # GitHub Pages 部署根目录（必须 commit）
  index.html               # 网页版，~750 行单页应用，内联 CSS/JS
  sw.js                    # Service Worker（开发时干扰热更新）
  manifest.json            # PWA manifest
  drug-data.js             # 药物数据（与小程序共享逻辑）

miniprogram-medication/    # 微信小程序
  app.json / app.js / app.wxss
  pages/index/
    index.js   (~666行)    # 全部逻辑：drugDB、处方计算、断药分析
    index.wxml             # 视图层
    index.wxss             # 样式层
  utils/
    date.js                # 日期工具函数（两端共享）
    pinyin-pro.js          # 拼音搜索库
  web/index.html           # 小程序内嵌 web-view 页面
```

## 关键事实

- **web 版**：`docs/index.html` 直接双击或在本地服务器打开。**不要用 `file://` 预览，Service Worker 会缓存旧版本导致看不到修改。** 推荐 `python3 -m http.server` 或 VS Code Live Server。
- **小程序版**：通过微信开发者工具导入 `miniprogram-medication/` 目录运行。
- **药物数据库**在 `index.js` 顶部的 `drugDB` 对象，共 16 种风湿免疫药物。添加/修改药物需同步更新 `drug-data.js`（web 版）和 `index.js`（小程序版）。
- **拼音搜索**：web 版用 `pinyin-pro-common.js`（UMD 包），小程序版用 `utils/pinyin-pro.js`（CommonJS）。
- **无 npm 依赖**：web 版零依赖，小程序版无第三方包。
- **所有文案为中文**，药品名、UI 标签、提示信息均为中文。
- **GitHub Pages 自动部署** `docs/` 目录，推送 main 即生效。

## 开发注意事项

- **Service Worker 陷阱**：修改 `docs/` 后，已缓存的浏览器可能仍显示旧版本。开发时在 DevTools → Application → Service Workers 勾选 "Bypass for network"，或使用无痕窗口。
- **日期计算**核心逻辑在 `utils/date.js`，web 版和小程序版都引用。修改日期逻辑后两端都要验证。
- **断药分析**在 `index.js` 的 `calcSupply()` 和 `analyzeGaps()` 函数，涉及 freq 映射表 `freqTimes`。添加新频次时，需同时在 `freqOptions`、`freqTimes`、`getBatchDays` 中注册。
- **PWA manifest** 在 `manifest.json`，图标在 `icon.svg`。
- **OpenCode 配置**：`~/.config/opencode/opencode.jsonc` 中 oh-my-openagent 插件已设 `"i18n": {"locale": "zh"}`。技能描述翻译位于 `node_modules/oh-my-openagent/dist/skills/*/SKILL.md`，更新插件后可能被覆盖。

## 无自动验证

项目没有 CI、没有测试、没有 lint 脚本。修改后**必须手动验证**：
1. 打开 web 版，测试受影响的功能
2. 小程序版在微信开发者工具中运行验证
3. 验证断药天数计算、日期推算等核心逻辑
