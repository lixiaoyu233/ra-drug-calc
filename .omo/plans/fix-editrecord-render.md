# 修复：编辑记录后处方列表未渲染

## 问题
编辑既往保存的条目后跳转到处方计算页，历史处方列表空白。原因：`editRecord()` 设置了 `prescList` 但未调用 `renderList()` 刷新 UI。

## 修改

### 1. `docs/index.html` — line 718
在 `switchTab(0)` 前插入 `renderList()`。

### 2. `miniprogram-medication/web/index.html` — line 719
同样在 `switchTab(0)` 前插入 `renderList()`。

### 3. `miniprogram-medication/pages/index/index.js` — 无需修改
小程序使用 WXML 数据绑定（`wx:for="{{prescList}}"`），`setData` 后会自动更新。

## 验证
1. 打开网页版，进入「记录」tab
2. 点击某条记录的「编辑」
3. 应跳转到处方计算页，历史处方列表正确显示
