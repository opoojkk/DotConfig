export type ConfigType = "string" | "boolean" | "enum" | "path";

export interface ConfigMeta {
  key: string;
  label: string;
  type: ConfigType;
  category: string;
  description?: string;
  enumValues?: string[];
  defaultValue?: string;
}

export const CONFIG_SCHEMA: ConfigMeta[] = [
  {
    key: "user.name",
    label: "User Name",
    type: "string",
    category: "User",
    description: "用于标识提交作者的名称。",
  },
  {
    key: "user.email",
    label: "User Email",
    type: "string",
    category: "User",
    description: "用于标识提交作者的邮箱。",
  },
  {
    key: "core.autocrlf",
    label: "Auto CRLF",
    type: "enum",
    category: "Core",
    description: "控制签出/提交时的换行符转换。",
    enumValues: ["true", "false", "input"],
    defaultValue: "input",
  },
  {
    key: "core.filemode",
    label: "File Mode",
    type: "boolean",
    category: "Core",
    description: "检查文件权限位变更。",
    defaultValue: "true",
  },
  {
    key: "core.editor",
    label: "Editor",
    type: "path",
    category: "Core",
    description: "默认文本编辑器路径。",
  },
  {
    key: "core.ignorecase",
    label: "Ignore Case",
    type: "boolean",
    category: "Core",
    description: "控制文件名大小写是否被忽略。",
    defaultValue: "true",
  },
  {
    key: "init.defaultBranch",
    label: "Default Branch",
    type: "string",
    category: "Core",
    description: "初始化仓库时默认创建的分支名称。",
    defaultValue: "main",
  },
  {
    key: "color.ui",
    label: "Color UI",
    type: "enum",
    category: "Core",
    description: "是否在命令行输出中启用颜色。",
    enumValues: ["auto", "true", "false"],
    defaultValue: "auto",
  },
  {
    key: "alias.st",
    label: "Alias: st",
    type: "string",
    category: "Alias",
    description: "git status 的快捷命令。",
  },
  {
    key: "alias.ci",
    label: "Alias: ci",
    type: "string",
    category: "Alias",
    description: "git commit 的快捷命令。",
  },
  {
    key: "remote.origin.url",
    label: "Remote origin URL",
    type: "string",
    category: "Remote",
    description: "origin 的 fetch URL。",
  },
  {
    key: "remote.origin.pushurl",
    label: "Remote origin Push URL",
    type: "string",
    category: "Remote",
    description: "origin 的 push URL。",
  },
  {
    key: "fetch.prune",
    label: "Fetch Prune",
    type: "boolean",
    category: "Remote",
    description: "抓取时是否自动清理远端已删除的分支。",
    defaultValue: "false",
  },
  {
    key: "push.autoSetupRemote",
    label: "Auto Setup Remote",
    type: "boolean",
    category: "Remote",
    description: "首次 push 时自动创建 upstream 关联。",
    defaultValue: "true",
  },
  {
    key: "pull.rebase",
    label: "Pull Rebase",
    type: "enum",
    category: "Workflow",
    description: "git pull 的默认策略。",
    enumValues: ["false", "true", "merges"],
    defaultValue: "false",
  },
  {
    key: "merge.ff",
    label: "Merge Fast-Forward",
    type: "enum",
    category: "Workflow",
    description: "合并时是否允许 fast-forward。",
    enumValues: ["true", "false", "only"],
    defaultValue: "true",
  },
  {
    key: "commit.gpgsign",
    label: "Commit GPG Sign",
    type: "boolean",
    category: "Security",
    description: "提交时默认进行 GPG 签名。",
    defaultValue: "false",
  },
  {
    key: "gpg.format",
    label: "GPG Format",
    type: "enum",
    category: "Security",
    description: "签名使用的格式。",
    enumValues: ["openpgp", "ssh"],
    defaultValue: "openpgp",
  },
];

export const CATEGORIES = [
  "User",
  "Core",
  "Alias",
  "Remote",
  "Workflow",
  "Security",
];
