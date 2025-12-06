import { useState } from "react";
import type { AliasItem } from "../stores/aliasStore";
import type { Translate } from "../i18n";

interface Props {
  store: {
    aliases: AliasItem[];
    addAlias: (item: AliasItem) => void;
    updateAlias: (name: string, command: string) => void;
    removeAlias: (name: string) => void;
  };
  t: Translate;
}

function AliasEditor({ store, t }: Props) {
  const [name, setName] = useState("");
  const [command, setCommand] = useState("");

  const onSubmit = () => {
    if (!name || !command) return;
    store.addAlias({ name, command });
    setName("");
    setCommand("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {store.aliases.map((alias) => (
        <div
          key={alias.name}
          style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr 80px",
            gap: 8,
            alignItems: "center",
            padding: 8,
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <strong>{alias.name}</strong>
          <input
            value={alias.command}
            onChange={(e) => store.updateAlias(alias.name, e.target.value)}
            style={{
              padding: 8,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              color: "var(--text)",
            }}
          />
          <button
            onClick={() => store.removeAlias(alias.name)}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--danger)",
              background: "transparent",
              color: "var(--danger)",
              cursor: "pointer",
            }}
          >
            {t("aliasDelete")}
          </button>
        </div>
      ))}

      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 80px", gap: 8 }}>
        <input
          placeholder={t("aliasNamePlaceholder")}
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
          placeholder={t("aliasCommandPlaceholder")}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
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
          {t("aliasAdd")}
        </button>
      </div>
    </div>
  );
}

export default AliasEditor;
