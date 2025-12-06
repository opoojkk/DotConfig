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
    description: "Name used to identify the author for commits.",
  },
  {
    key: "user.email",
    label: "User Email",
    type: "string",
    category: "User",
    description: "Email used to identify the author for commits.",
  },
  {
    key: "core.autocrlf",
    label: "Auto CRLF",
    type: "enum",
    category: "Core",
    description: "Control line ending conversion on checkout/commit.",
    enumValues: ["true", "false", "input"],
    defaultValue: "input",
  },
  {
    key: "core.filemode",
    label: "File Mode",
    type: "boolean",
    category: "Core",
    description: "Check file permission bit changes.",
    defaultValue: "true",
  },
  {
    key: "core.editor",
    label: "Editor",
    type: "path",
    category: "Core",
    description: "Default text editor path.",
  },
  {
    key: "core.ignorecase",
    label: "Ignore Case",
    type: "boolean",
    category: "Core",
    description: "Ignore case in filenames.",
    defaultValue: "true",
  },
  {
    key: "init.defaultBranch",
    label: "Default Branch",
    type: "string",
    category: "Core",
    description: "Default branch name when initializing repositories.",
    defaultValue: "main",
  },
  {
    key: "color.ui",
    label: "Color UI",
    type: "enum",
    category: "Core",
    description: "Enable colored output in the command line.",
    enumValues: ["auto", "true", "false"],
    defaultValue: "auto",
  },
  {
    key: "alias.st",
    label: "Alias: st",
    type: "string",
    category: "Alias",
    description: "Shortcut for git status.",
  },
  {
    key: "alias.ci",
    label: "Alias: ci",
    type: "string",
    category: "Alias",
    description: "Shortcut for git commit.",
  },
  {
    key: "remote.origin.url",
    label: "Remote origin URL",
    type: "string",
    category: "Remote",
    description: "Fetch URL for origin.",
  },
  {
    key: "remote.origin.pushurl",
    label: "Remote origin Push URL",
    type: "string",
    category: "Remote",
    description: "Push URL for origin.",
  },
  {
    key: "fetch.prune",
    label: "Fetch Prune",
    type: "boolean",
    category: "Remote",
    description: "Auto prune removed remote branches when fetching.",
    defaultValue: "false",
  },
  {
    key: "push.autoSetupRemote",
    label: "Auto Setup Remote",
    type: "boolean",
    category: "Remote",
    description: "Auto create upstream tracking on first push.",
    defaultValue: "true",
  },
  {
    key: "pull.rebase",
    label: "Pull Rebase",
    type: "enum",
    category: "Workflow",
    description: "Default strategy for git pull.",
    enumValues: ["false", "true", "merges"],
    defaultValue: "false",
  },
  {
    key: "merge.ff",
    label: "Merge Fast-Forward",
    type: "enum",
    category: "Workflow",
    description: "Allow fast-forward merges.",
    enumValues: ["true", "false", "only"],
    defaultValue: "true",
  },
  {
    key: "commit.gpgsign",
    label: "Commit GPG Sign",
    type: "boolean",
    category: "Security",
    description: "Sign commits with GPG by default.",
    defaultValue: "false",
  },
  {
    key: "gpg.format",
    label: "GPG Format",
    type: "enum",
    category: "Security",
    description: "Format used for signatures.",
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
