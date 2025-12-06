import { invoke } from "@tauri-apps/api/core";
import type { ConfigEntry, Scope } from "../stores/configStore";
import { CONFIG_SCHEMA } from "../schema/configSchema";

const toScope = (scope: string): Scope => {
  if (scope === "global" || scope === "system" || scope === "merged") return scope;
  return "local";
};

export async function loadConfigFromNative(scope: Scope, repoPath?: string): Promise<ConfigEntry[]> {
  try {
    const entries = (await invoke("read_scope", { scope, repoPath })) as {
      key: string;
      value: string;
      scope: string;
      overriddenBy?: string;
    }[];
    return entries.map((entry) => ({
      key: entry.key,
      value: entry.value,
      scope: toScope(entry.scope),
      overriddenBy: entry.overriddenBy ? toScope(entry.overriddenBy) : undefined,
    }));
  } catch (err) {
    console.warn("Tauri bridge unavailable, fallback to mock data", err);
    return CONFIG_SCHEMA.map((meta, index) => ({
      key: meta.key,
      value: meta.type === "boolean" ? "false" : `mock-${index}`,
      scope,
    }));
  }
}

export async function saveConfigToNative(scope: Scope, entries: ConfigEntry[], repoPath?: string) {
  try {
    await invoke("write_scope", { scope, repoPath, entries });
  } catch (err) {
    console.warn("Tauri bridge unavailable, skipping native write", err);
  }
}

export async function checkGitRepo(path: string): Promise<boolean> {
  try {
    return await invoke("is_git_repo", { path });
  } catch (err) {
    console.warn("Tauri bridge unavailable, fallback false", err);
    return false;
  }
}
