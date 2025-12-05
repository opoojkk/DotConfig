import { create } from "zustand";

export interface RemoteItem {
  name: string;
  fetchUrl: string;
  pushUrl?: string;
}

interface RemoteState {
  remotes: RemoteItem[];
  addRemote(remote: RemoteItem): void;
  updateRemote(name: string, payload: Partial<RemoteItem>): void;
  removeRemote(name: string): void;
}

export const useRemoteStore = create<RemoteState>((set) => ({
  remotes: [
    {
      name: "origin",
      fetchUrl: "https://github.com/example/repo.git",
      pushUrl: "git@github.com:example/repo.git",
    },
  ],
  addRemote: (remote) =>
    set((state) => ({ remotes: [...state.remotes, remote] })),
  updateRemote: (name, payload) =>
    set((state) => ({
      remotes: state.remotes.map((remote) =>
        remote.name === name ? { ...remote, ...payload } : remote
      ),
    })),
  removeRemote: (name) =>
    set((state) => ({ remotes: state.remotes.filter((remote) => remote.name !== name) })),
}));
