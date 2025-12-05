import { useState } from "react";
import { useConfigStore } from "../stores/configStore";

interface Props {
  onSave(): void;
}

function Toolbar({ onSave }: Props) {
  const { search, setSearch } = useConfigStore();
  const [message, setMessage] = useState("已加载当前作用域配置");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 12,
        borderRadius: 12,
        background: "var(--panel)",
        border: "1px solid var(--border)",
      }}
    >
      <input
        placeholder="搜索 key 或 label"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: 10,
          flex: 1,
          borderRadius: 10,
          border: "1px solid var(--border)",
          background: "transparent",
          color: "var(--text)",
        }}
      />
      <button
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid var(--border)",
          background: "var(--panel)",
          color: "var(--text)",
          cursor: "pointer",
        }}
        onClick={() => setMessage("已撤销最新更改")}
      >
        Undo
      </button>
      <button
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid var(--border)",
          background: "var(--panel)",
          color: "var(--text)",
          cursor: "pointer",
        }}
        onClick={() => setMessage("已重做更改")}
      >
        Redo
      </button>
      <button
        style={{
          padding: "10px 16px",
          borderRadius: 10,
          border: "1px solid var(--accent)",
          background: "var(--accent)",
          color: "#0a0f14",
          fontWeight: 700,
          cursor: "pointer",
        }}
        onClick={() => {
          onSave();
          setMessage("已保存到当前作用域");
        }}
      >
        保存
      </button>
      <span style={{ color: "var(--muted)", fontSize: 12 }}>{message}</span>
    </div>
  );
}

export default Toolbar;
