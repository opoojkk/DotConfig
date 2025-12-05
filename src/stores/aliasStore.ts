import { create } from "zustand";

export interface AliasItem {
  name: string;
  command: string;
}

interface AliasState {
  aliases: AliasItem[];
  addAlias(item: AliasItem): void;
  updateAlias(name: string, command: string): void;
  removeAlias(name: string): void;
}

export const useAliasStore = create<AliasState>((set) => ({
  aliases: [
    { name: "st", command: "status" },
    { name: "ci", command: "commit" },
    { name: "amend", command: "commit --amend" },
  ],
  addAlias: (item) =>
    set((state) => ({ aliases: [...state.aliases, item].sort((a, b) => a.name.localeCompare(b.name)) })),
  updateAlias: (name, command) =>
    set((state) => ({
      aliases: state.aliases.map((alias) =>
        alias.name === name ? { ...alias, command } : alias
      ),
    })),
  removeAlias: (name) =>
    set((state) => ({ aliases: state.aliases.filter((alias) => alias.name !== name) })),
}));
