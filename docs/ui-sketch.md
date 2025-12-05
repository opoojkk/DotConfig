# GitConfig Studio UI 草图

## 顶部与作用域切换
```
+---------------------------------------------------------------+
| [Logo] GitConfig Studio                       [Settings] [Help]
+---------------------------------------------------------------+
| Scope Tabs:  Local | Global | System | Merged View           |
+---------------------------------------------------------------+
```
- Settings：主题、自动备份、模板配置、权限提示。
- Merged View：展示覆盖链，标记生效来源。

## 主界面布局
```
+---------------------------------------------------------------+
| Sidebar (Config Groups)     |   Config Editor Panel          |
|-----------------------------+---------------------------------|
|  • User                     |  [Header] user.name             |
|  • Core                     |  Value:  [ text field        ] |
|  • Diff                     |  -------------------------------|
|  • Merge                    |  [Header] user.email            |
|  • Alias                    |  Value:  [ text field        ] |
|  • Remote                   |                                 |
|  • Color                    |  --------------------------------
|  • HTTP                     |  [Boolean Switch] core.autocrlf |
|  • GC                       |  --------------------------------
|  • Pack                     |  [Enum Dropdown] core.filemode  |
|  • Credential               |                                 |
|-----------------------------+---------------------------------|
|  [Bottom: Snapshot / Diff / Export]                          |
+---------------------------------------------------------------+
```
- Sidebar：按组过滤配置项，支持搜索。
- 编辑面板：统一行高、左侧键名、右侧控件，附带描述 tooltip 与覆盖来源标签。

## 配置项控件
- **文本**：`<input>`，支持路径补全。
- **布尔**：开关，显示当前作用域与生效值。
- **枚举**：下拉选择，提示官方说明。
- **路径选择**：调用系统文件/目录选择器。

## Alias 编辑器
```
Aliases:
+----------------------------------------+
| Name          | Command                |
|----------------------------------------|
| st            | status                 |
| ci            | commit                 |
| amend         | commit --amend         |
+----------------------------------------+
[Add]  [Edit]  [Delete]
```
- 列表右上角搜索；新增/编辑弹窗包含名称与命令字段，支持复制。

## Remote 编辑器
```
Remote List:
+---------------------+
| origin              |
|   fetch: https://github.com/...  |
|   push:  https://github.com/...  |
|---------------------|
| origin2             |
+---------------------+

[Add Remote] [Edit Remote] [Remove]
```
- 支持添加多个 fetch/push URL，提示缺失 URL 或重复名称。

## Diff & 冲突分析
```
Local   | Global  | System  | Effective
---------------------------------------
true    | false   | false   | true (Local)
```
- 点击某行可展开显示来源与时间戳。
- Diff 视图支持 Scope 对比、快照对比、模板对比。

## 底栏动作区
```
[ Save ]    [ Undo ]   [ Redo ]   [ Diff Changes ]   [ Export Config ]
```
- Undo/Redo 直连历史队列；Save 仅写当前作用域；导出生成打包文件。

## 快照/模板
- 快照：自动保存到本地，供恢复或对比。
- 模板：Standard / Git for Windows / Linux Dev / Diff-Merge / Performance，一键应用。

## 权限与安全
- System 写入前弹权限提示；检测 `.git/config.lock` 时禁止写入并提示原因。
