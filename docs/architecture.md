# GitConfig Studio 架构与模块设计

本文档详细分解 GitConfig Studio 的技术架构与核心模块，便于落地实现。

## 1. 作用域与配置引擎
- **System / Global / Local** 三层作用域，Local > Global > System 优先级。
- `GitConfigEngine` 提供：
  - `load_config(scope)`：读取并解析指定作用域配置。
  - `merge_view()`：合并三层，返回每个键的覆盖链及生效来源。
  - `set(key, value, scope)` / `delete(key, scope)`：写入或删除指定作用域键值。
  - `diff(snapshotA, snapshotB)`：对比快照或不同作用域。
- 并发与权限：检测 `.lock`，System 作用域需要权限提示。

## 2. Rust 后端模块划分
```
src-tauri/
  src/
    main.rs           # Tauri 启动与命令注册
    commands.rs       # IPC 命令定义
    git_config/
      mod.rs          # re-export 与公共类型
      read.rs         # 读取 & 解析
      write.rs        # 写入 & 删除
      merge.rs        # 覆盖链与合并视图
      diff.rs         # 快照/作用域 diff
      schema.rs       # 配置项元数据（类型、分组、枚举值、描述）
```

### 2.1 数据结构示例（Rust）
```rust
#[derive(Debug, Clone, serde::Serialize)]
pub struct KeyEntry {
    pub key: String,
    pub value: Option<String>,
    pub scope: Scope,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct MergedEntry {
    pub key: String,
    pub effective: Option<String>,
    pub sources: Vec<KeyEntry>, // 按优先级排序
}
```

## 3. 前端模块划分（React + Zustand）
```
src/
  stores/
    scopeStore.ts   # 当前作用域，作用域列表
    configStore.ts  # 合并视图、分组、过滤、搜索
    historyStore.ts # 快照、Undo/Redo
  components/
    ScopeTabs.tsx
    ConfigGroupPanel.tsx
    ConfigItem/
      TextItem.tsx
      BooleanItem.tsx
      EnumItem.tsx
      PathSelector.tsx
    AliasEditor/
      AliasTable.tsx
      AliasForm.tsx
    RemoteEditor/
      RemoteList.tsx
      RemoteForm.tsx
    DiffViewer.tsx
    ConflictBadge.tsx
```

## 4. Schema 驱动渲染
- `schema.json` 描述所有配置项的类型、分组、枚举值和官方说明。
- 前端根据 schema 自动渲染控件、分组和 tooltip；后端用来验证写入值是否合法。

示例（片段）：
```json
{
  "core.autocrlf": {
    "type": "enum",
    "enum": ["true", "false", "input"],
    "category": "core",
    "description": "控制 checkout/commit 时的换行符转换"
  },
  "user.name": {
    "type": "string",
    "category": "user",
    "description": "提交者名称"
  }
}
```

## 5. Undo/Redo 与快照
- 每次写操作生成快照，记录 `{key, old, new, scope, timestamp}`。
- `historyStore` 提供 `undo()` / `redo()`；后端可存储到本地文件实现持久化。

## 6. 模板与备份
- 模板：预置 JSON，点击应用批量写入指定作用域。
- 备份：导出三个作用域的完整文本；恢复时直接替换或按 key 合并。

## 7. Diff 与冲突分析
- 冲突分析：当同一 key 在多个作用域出现不同值时，UI 显示覆盖链和冲突标签。
- Diff：
  - 作用域对比（Local vs Global）。
  - 快照对比（当前 vs 上次保存）。
  - 模板对比（当前 vs 模板）。

## 8. 安全性
- 写入前检测锁文件（`.git/config.lock`）。
- System 作用域操作提示需要管理员/ sudo。

## 9. CLI/插件接口
- 提供 `git-config-gui` 命令启动 GUI。
- 预留 API 供 VSCode/JetBrains 插件调用（如通过 Tauri `invoke` 或本地 HTTP IPC）。
