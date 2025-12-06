export type Locale = "en" | "zh";

const en = {
  appTitle: "DotConfig",
  languageLabel: "Language",
  languageEnglish: "English",
  languageChinese: "中文",
  targetGlobal: "Global config",
  targetRepoPrefix: "Repository:",
  switchTarget: "Switch target",
  globalBadgeLabel: "Global config",
  repoBadgeLabel: "Repository:",
  requireRepo: "Please choose a repository before viewing repo config.",
  invalidRepo: "This directory is not a valid git repository. Please choose another.",
  promptRepo: "Enter repository path",
  pickRepoFail: "Failed to pick folder. Please retry or enter the path manually.",
  overwriteConfirm: "This key already exists in this scope. Overwrite?",

  landingOr: "or",
  landingGlobalHeading: "Work with global config",
  landingGlobalDesc: "Manage Git settings that apply to every repository.",
  landingGlobalButton: "Open global config",
  landingRepoHeading: "Select a repository",
  landingRepoDesc: "Choose a folder to work on repo/local Git config.",
  landingPickFolder: "Pick folder",
  landingNotSelected: "Not selected",
  landingOpenRepo: "Open repository",

  searchPlaceholder: "Search key or label",
  undo: "Undo",
  redo: "Redo",
  save: "Save",
  loadedMessage: "Loaded current scope",
  undoMessage: "Undid latest change",
  redoMessage: "Redid change",
  savedMessage: "Saved to current scope",
  scopeLocal: "Local",
  scopeGlobal: "Global",
  scopeSystem: "System",
  scopeMerged: "Merged",

  addConfig: "Add config",
  itemsSuffix: "items",
  aliasTitle: "Alias Manager",
  remoteTitle: "Remote Manager",
  addConfigTitle: "Add Config Item",
  configKeyLabel: "Config key",
  configKeyPlaceholder: "e.g. user.name",
  configValueLabel: "Value",
  configValuePlaceholder: "Enter value",
  configPathPlaceholder: "/usr/bin/vim",
  defaultValueApplied: "Default value applied",
  cancel: "Cancel",

  enabled: "Enabled",
  disabled: "Disabled",
  effectiveValue: "Effective value",
  emptyPlaceholder: "<empty>",
  overriddenBy: "overridden by",

  diffTitle: "Overrides & Diff",
  diffSubtitle: "Highlight differences across scopes to spot conflicts",
  diffExport: "Export snapshot",
  diffConflict: "Conflict detected",
  diffNotSet: "<not set>",

  remoteDelete: "Delete",
  remoteNamePlaceholder: "Remote name (e.g. origin)",
  remoteFetchPlaceholder: "Fetch URL",
  remotePushPlaceholder: "Push URL (optional)",
  remoteAdd: "Add remote",
  remoteFetchLabel: "Fetch URL",
  remotePushLabel: "Push URL",

  aliasDelete: "Delete",
  aliasNamePlaceholder: "Alias",
  aliasCommandPlaceholder: "Command",
  aliasAdd: "Add",

  navTitle: "Config groups",
};

const zh: typeof en = {
  appTitle: "DotConfig",
  languageLabel: "语言",
  languageEnglish: "English",
  languageChinese: "中文",
  targetGlobal: "全局配置",
  targetRepoPrefix: "仓库：",
  switchTarget: "切换目标",
  globalBadgeLabel: "全局配置",
  repoBadgeLabel: "仓库：",
  requireRepo: "请先选择仓库后再查看仓库配置。",
  invalidRepo: "该目录不是有效的 git 仓库，请重新选择。",
  promptRepo: "请输入仓库路径",
  pickRepoFail: "选择目录失败，请重试或手动输入路径。",
  overwriteConfirm: "该配置已存在，是否覆盖？",

  landingOr: "或者",
  landingGlobalHeading: "使用全局配置",
  landingGlobalDesc: "管理适用于所有仓库的 Git 设置。",
  landingGlobalButton: "打开全局配置",
  landingRepoHeading: "选择一个仓库",
  landingRepoDesc: "选择一个文件夹来管理仓库/本地配置。",
  landingPickFolder: "选择文件夹",
  landingNotSelected: "未选择",
  landingOpenRepo: "打开仓库",

  searchPlaceholder: "搜索 key 或 label",
  undo: "撤销",
  redo: "重做",
  save: "保存",
  loadedMessage: "已加载当前作用域配置",
  undoMessage: "已撤销最新更改",
  redoMessage: "已重做更改",
  savedMessage: "已保存到当前作用域",
  scopeLocal: "本地",
  scopeGlobal: "全局",
  scopeSystem: "系统",
  scopeMerged: "合并",

  addConfig: "添加配置",
  itemsSuffix: "项",
  aliasTitle: "Alias 管理",
  remoteTitle: "Remote 管理",
  addConfigTitle: "添加配置项",
  configKeyLabel: "配置键",
  configKeyPlaceholder: "如：user.name",
  configValueLabel: "值",
  configValuePlaceholder: "填写配置值",
  configPathPlaceholder: "/usr/bin/vim",
  defaultValueApplied: "已使用该键的默认值",
  cancel: "取消",

  enabled: "启用",
  disabled: "禁用",
  effectiveValue: "生效值",
  emptyPlaceholder: "<空>",
  overriddenBy: "被覆盖来源",

  diffTitle: "覆盖关系 & Diff",
  diffSubtitle: "高亮不同作用域的值，帮助发现冲突",
  diffExport: "导出快照",
  diffConflict: "存在冲突",
  diffNotSet: "<未设置>",

  remoteDelete: "删除",
  remoteNamePlaceholder: "远程名称 (如 origin)",
  remoteFetchPlaceholder: "Fetch URL",
  remotePushPlaceholder: "Push URL (可选)",
  remoteAdd: "新增远程",
  remoteFetchLabel: "Fetch URL",
  remotePushLabel: "Push URL",

  aliasDelete: "删除",
  aliasNamePlaceholder: "别名",
  aliasCommandPlaceholder: "命令",
  aliasAdd: "新增",

  navTitle: "配置组",
};

export type CopyKey = keyof typeof en;
export type Translate = (key: CopyKey) => string;

const translations: Record<Locale, Record<CopyKey, string>> = { en, zh };

export function createTranslator(locale: Locale): Translate {
  return (key) => translations[locale][key];
}

export const LOCALE_OPTIONS = [
  { value: "en", label: en.languageEnglish },
  { value: "zh", label: zh.languageChinese },
] as const;

const descriptions: Record<Locale, Record<string, string>> = {
  en: {
    "user.name": "Name used to identify the author for commits.",
    "user.email": "Email used to identify the author for commits.",
    "core.autocrlf": "Control line ending conversion on checkout/commit.",
    "core.filemode": "Check file permission bit changes.",
    "core.editor": "Default text editor path.",
    "core.ignorecase": "Ignore case in filenames.",
    "init.defaultBranch": "Default branch name when initializing repositories.",
    "color.ui": "Enable colored output in the command line.",
    "alias.st": "Shortcut for git status.",
    "alias.ci": "Shortcut for git commit.",
    "remote.origin.url": "Fetch URL for origin.",
    "remote.origin.pushurl": "Push URL for origin.",
    "fetch.prune": "Auto prune removed remote branches when fetching.",
    "push.autoSetupRemote": "Auto create upstream tracking on first push.",
    "pull.rebase": "Default strategy for git pull.",
    "merge.ff": "Allow fast-forward merges.",
    "commit.gpgsign": "Sign commits with GPG by default.",
    "gpg.format": "Format used for signatures.",
  },
  zh: {
    "user.name": "用于标识提交作者的名称。",
    "user.email": "用于标识提交作者的邮箱。",
    "core.autocrlf": "控制签出/提交时的换行符转换。",
    "core.filemode": "检查文件权限位变更。",
    "core.editor": "默认文本编辑器路径。",
    "core.ignorecase": "控制文件名大小写是否被忽略。",
    "init.defaultBranch": "初始化仓库时默认创建的分支名称。",
    "color.ui": "是否在命令行输出中启用颜色。",
    "alias.st": "git status 的快捷命令。",
    "alias.ci": "git commit 的快捷命令。",
    "remote.origin.url": "origin 的 fetch URL。",
    "remote.origin.pushurl": "origin 的 push URL。",
    "fetch.prune": "抓取时是否自动清理远端已删除的分支。",
    "push.autoSetupRemote": "首次 push 时自动创建 upstream 关联。",
    "pull.rebase": "git pull 的默认策略。",
    "merge.ff": "合并时是否允许 fast-forward。",
    "commit.gpgsign": "提交时默认进行 GPG 签名。",
    "gpg.format": "签名使用的格式。",
  },
};

export function getDescription(key: string, locale: Locale) {
  return descriptions[locale]?.[key];
}
