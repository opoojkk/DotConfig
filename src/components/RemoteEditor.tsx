import { useState } from "react";
import type { RemoteItem } from "../stores/remoteStore";

interface Props {
  store: {
    remotes: RemoteItem[];
    addRemote: (remote: RemoteItem) => void;
    updateRemote: (name: string, payload: Partial<RemoteItem>) => void;
    removeRemote: (name: string) => void;
  };
}

function RemoteEditor({ store }: Props) {
  const [name, setName] = useState("");
  const [fetchUrl, setFetchUrl] = useState("");
  const [pushUrl, setPushUrl] = useState("");

  const onSubmit = () => {
    if (!name || !fetchUrl) return;
    store.addRemote({ name, fetchUrl, pushUrl });
    setName("");
    setFetchUrl("");
    setPushUrl("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {store.remotes.map((remote) => (
        <div
          key={remote.name}
          style={{
            padding: 10,
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.02)",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>{remote.name}</strong>
            <button
              onClick={() => store.removeRemote(remote.name)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid var(--danger)",
                background: "transparent",
                color: "var(--danger)",
                cursor: "pointer",
              }}
            >
              删除
            </button>
          </div>
          <label style={{ fontSize: 12, color: "var(--muted)" }}>Fetch URL</label>
          <input
            value={remote.fetchUrl}
            onChange={(e) => store.updateRemote(remote.name, { fetchUrl: e.target.value })}
            style={{
              padding: 8,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              color: "var(--text)",
            }}
          />
          <label style={{ fontSize: 12, color: "var(--muted)" }}>Push URL</label>
          <input
            value={remote.pushUrl ?? ""}
            onChange={(e) => store.updateRemote(remote.name, { pushUrl: e.target.value })}
            style={{
              padding: 8,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              color: "var(--text)",
            }}
          />
        </div>
      ))}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
        <input
          placeholder="远程名称 (如 origin)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--panel)",
            color: "var(--text)",
          }}
        />
        <input
          placeholder="Fetch URL"
          value={fetchUrl}
          onChange={(e) => setFetchUrl(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--panel)",
            color: "var(--text)",
          }}
        />
        <input
          placeholder="Push URL (可选)"
          value={pushUrl}
          onChange={(e) => setPushUrl(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--panel)",
            color: "var(--text)",
          }}
        />
        <button
          onClick={onSubmit}
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid var(--accent)",
            background: "var(--accent)",
            color: "#0a0f14",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          新增远程
        </button>
      </div>
    </div>
  );
}

export default RemoteEditor;
