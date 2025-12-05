import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CONFIG_SCHEMA } from "../schema/configSchema";

export type Scope = "local" | "global" | "system" | "merged";

export interface ConfigEntry {
  key: string;
  value: string;
  scope: Scope;
  overriddenBy?: Scope;
}

interface ConfigState {
  scope: Scope;
  entries: ConfigEntry[];
  search: string;
  setScope(scope: Scope): void;
  setEntries(entries: ConfigEntry[]): void;
  setSearch(value: string): void;
  updateValue(key: string, scope: Scope, value: string): void;
}

const seedEntries: ConfigEntry[] = CONFIG_SCHEMA.map((meta, index) => ({
  key: meta.key,
  value: meta.type === "boolean" ? "false" : `value-${index + 1}`,
  scope: index % 3 === 0 ? "local" : index % 3 === 1 ? "global" : "system",
}));

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      scope: "merged",
      entries: seedEntries,
      search: "",
      setScope: (scope) => set({ scope }),
      setEntries: (entries) => set({ entries }),
      setSearch: (search) => set({ search }),
      updateValue: (key, scope, value) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.key === key && entry.scope === scope
              ? { ...entry, value }
              : entry
          ),
        })),
    }),
    { name: "config-store" }
  )
);

export const getEffectiveValue = (
  entries: ConfigEntry[],
  key: string
): ConfigEntry | undefined => {
  const scopePriority: Scope[] = ["local", "global", "system"];
  const sorted = entries
    .filter((item) => item.key === key)
    .sort(
      (a, b) => scopePriority.indexOf(a.scope) - scopePriority.indexOf(b.scope)
    );

  const primary = sorted[0];
  if (!primary) return undefined;

  const overriddenBy = sorted.find((item) => item.scope === "local" && item !== primary)
    ? "local"
    : sorted.find((item) => item.scope === "global" && item !== primary)
    ? "global"
    : sorted.find((item) => item.scope === "system" && item !== primary)
    ? "system"
    : undefined;

  return { ...primary, overriddenBy };
};
