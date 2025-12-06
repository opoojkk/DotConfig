import { useEffect, useState } from "react";
import { useConfigStore } from "../stores/configStore";
import type { Translate } from "../i18n";

interface Props {
  onSave(): void;
  t: Translate;
}

function Toolbar({ onSave, t }: Props) {
  const { search, setSearch } = useConfigStore();
  const [message, setMessage] = useState(t("loadedMessage"));

  useEffect(() => {
    setMessage(t("loadedMessage"));
  }, [t]);

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
        placeholder={t("searchPlaceholder")}
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
        onClick={() => setMessage(t("undoMessage"))}
      >
        {t("undo")}
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
        onClick={() => setMessage(t("redoMessage"))}
      >
        {t("redo")}
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
          setMessage(t("savedMessage"));
        }}
      >
        {t("save")}
      </button>
      <span style={{ color: "var(--muted)", fontSize: 12 }}>{message}</span>
    </div>
  );
}

export default Toolbar;
