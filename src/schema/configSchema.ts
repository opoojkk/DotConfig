export type ConfigType = "string" | "boolean" | "enum" | "path";

export interface ConfigMeta {
  key: string;
  label: string;
  type: ConfigType;
  category: string;
  description?: string;
  enumValues?: string[];
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
  },
  {
    key: "core.filemode",
    label: "File Mode",
    type: "boolean",
    category: "Core",
    description: "检查文件权限位变更。",
  },
  {
    key: "core.editor",
    label: "Editor",
    type: "path",
    category: "Core",
    description: "默认文本编辑器路径。",
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
];

export const CATEGORIES = [
  "User",
  "Core",
  "Alias",
  "Remote",
];
