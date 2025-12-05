# GitConfig Studio

GitConfig Studio 是一款跨平台的 Git 配置可视化编辑器，围绕 Git 的三层配置作用域（System / Global / Local）提供专业级管理体验。本仓库给出完整的功能规格、UI 草图、架构设计与实现建议，便于直接落地为可用的 Tauri + React 应用。

## 核心价值
- **作用域清晰**：同时读取 Local、Global、System 配置，合并展示覆盖链。
- **可视化编辑**：文本、布尔、枚举、路径选择等组件化输入，支持新增/删除键值。
- **专业工具化**：Alias、Remote、diff/merge 工具、模板、备份/恢复、冲突分析等能力，一次到位。

## 功能矩阵
| 类别 | 具体能力 |
| --- | --- |
| 基础 | 配置读取/搜索、作用域切换与覆盖提示、键值编辑、新增/删除、Alias 管理 |
| 进阶 | 分类 UI、内联配置文档、Remote 管理、diff/merge 工具设置、组件化输入控件 |
| 专业 | 冲突分析器、Config Diff、备份与恢复、模板系统、Undo/Redo、IDE 插件接口 |
| 安全 | 权限检测、并发写保护 |

## UI 总览
- **顶部导航**：应用信息、主题/备份设置、关于。
- **作用域 Tabs**：Local / Global / System / Merged View。
- **左侧 Sidebar**：按组浏览（User/Core/Diff/Merge/Color/Alias/Remote/HTTP/GC/Pack/Credential）。
- **编辑面板**：文本输入、布尔开关、枚举下拉、路径选择器，附带内联说明与覆盖来源标记。
- **专用子界面**：
  - Alias 列表增删改查。
  - Remote 管理（fetch/push URL、添加/删除远程）。
- **底部动作区**：保存、Undo/Redo、Diff、导出配置、快照切换。

## 架构蓝图
本项目建议使用 **Tauri + Rust + React (TypeScript)**，以 Rust 负责配置解析与读写，前端负责渲染与交互。

### 后端（Rust）
- 模块化 `GitConfigEngine`：`load_config(scope)`, `set`, `delete`, `merge_view`, `diff(snapshotA, snapshotB)`。
- 使用 `ini` crate 解析 `.gitconfig`，计算覆盖关系。
- IPC 命令示例：`read_config`, `write_config`, `list_scopes`, `read_merged_config`。

### 前端（React + Zustand）
- 状态：`scopeStore`（当前作用域）、`configStore`（键值/覆盖来源）、`historyStore`（快照与 Undo/Redo）。
- UI 组件：`ScopeTabs`, `ConfigGroupPanel`, `ConfigItem`（Text/Boolean/Enum/PathSelector），`AliasEditor`, `RemoteEditor`, `DiffViewer`。
- 内联文档由 Schema 驱动：JSON Schema 描述类型、分组、枚举值与官方说明。

### 目录建议
```
gitconfig-studio/
├─ src/                 # React 前端
│  ├─ App.tsx
│  ├─ components/
│  ├─ stores/
│  └─ ui/
├─ src-tauri/           # Rust + Tauri 后端
│  ├─ Cargo.toml
│  ├─ tauri.conf.json
│  └─ src/
│     ├─ main.rs
│     ├─ commands.rs
│     └─ git_config/
│         ├─ mod.rs
│         ├─ read.rs
│         ├─ write.rs
│         └─ merge.rs
└─ package.json
```

## 初始化示例
- 创建工程：`npm create tauri-app`（选择 React + TS + Rust），或按目录结构手动初始化。
- `src-tauri/src/main.rs` 注册命令：
```rust
mod commands;
use commands::*;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_config,
            write_config,
            list_scopes,
            read_merged_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}
```
- `src-tauri/src/commands.rs` 简易实现：
```rust
use std::fs;

#[tauri::command]
pub fn read_config(path: String) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_config(path: String, content: String) -> Result<(), String> {
    fs::write(path, content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_scopes() -> Vec<String> {
    vec![
        "~/.gitconfig".into(),
        "/etc/gitconfig".into(),
        ".git/config".into(),
    ]
}
```

## 开发路线图
1. **MVP**：作用域读取/编辑、搜索、Alias 编辑器、覆盖标记。
2. **进阶**：Schema 驱动 UI、Remote 管理、diff/merge 工具选择、内联文档。
3. **专业增强**：冲突分析、Config Diff、模板、备份/恢复、Undo/Redo、并发写保护。

## 快速运行（前端 + Tauri 原型）

1. 安装依赖

```bash
pnpm install # 或 npm install
```

2. 启动前端原型（Vite）

```bash
pnpm run dev
```

3. 启动 Tauri（需要 Rust toolchain 与 tauri-cli）

```bash
cargo install tauri-cli # 如未安装
pnpm tauri dev         # 或 npm run tauri dev
```

> 当前原型已经包含作用域切换、配置编辑、Alias/Remote 管理与覆盖关系视图；Tauri IPC 提供 `read_scope`/`write_scope`/`merged_view` 等命令，可直接串联 UI。

## 贡献
欢迎提交 Issue / PR，一起完善 GitConfig Studio。
