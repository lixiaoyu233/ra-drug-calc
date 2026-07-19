# 风免计算器

风湿免疫科用药计算器，支持处方分析、断药监测、日期推算。

## 功能

**处方计算**
- 16 种风湿免疫药物数据库（甲氨蝶呤、来氟米特、生物制剂等）
- 每药预设常用剂量与频次，一键填写
- 自动计算每天用量、可服用天数、预计用完日期

**多次处方管理**
- 添加多次处方到列表，可视化时间线
- 自动分析断药天数与累计断药
- 评估 3 个月连续用药达标情况
- 建议下次购药时间

**日期工具**
- 日期差计算：两个日期相差天数
- 日期推算：按天/周/月往前或往后推算

## 技术栈

- **网页端**：纯 HTML / CSS / JavaScript 单页面应用
- **小程序端**：微信小程序原生开发（WXML + WXSS + JS）
- **部署**：GitHub Pages
- **PWA**：Service Worker + manifest.json

## 项目结构

```
docs/                          # GitHub Pages 部署目录
├── index.html                 # 网页版主页面
├── sw.js                      # Service Worker
├── manifest.json              # PWA manifest
└── icon.svg                   # 应用图标

miniprogram-medication/        # 微信小程序
├── app.json
├── app.js
├── app.wxss
├── pages/
│   └── index/
│       ├── index.js           # 逻辑层（drugDB、处方计算、断药分析）
│       ├── index.wxml         # 视图层
│       ├── index.wxss         # 样式层
│       └── index.json         # 页面配置
├── utils/
│   └── date.js                # 日期工具函数
└── web/
    └── index.html             # 小程序 web-view 内嵌页面

README.md
```

## 使用

**网页版**：访问 [https://lixiaoyu233.github.io/ra-drug-calc/](https://lixiaoyu233.github.io/ra-drug-calc/)

**小程序**：微信搜索「风免计算器」或通过开发者工具导入 `miniprogram-medication/`

**本地开发**：直接打开 `docs/index.html` 即可（推荐本地服务器避免 Service Worker 缓存干扰）

## 免责声明

本工具仅供参考，实际用药请遵医嘱。
