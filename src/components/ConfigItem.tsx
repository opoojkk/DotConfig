import type { ConfigMeta } from "../schema/configSchema";
import { ConfigEntry, Scope, useConfigStore } from "../stores/configStore";

interface Props {
  meta: ConfigMeta;
  entries: ConfigEntry[];
  effective?: ConfigEntry;
}

const scopeLabel: Record<Scope, string> = {
  local: "Local",
  global: "Global",
  system: "System",
  merged: "Merged",
};

function ValueInput({
  meta,
  entry,
}: {
  meta: ConfigMeta;
  entry: ConfigEntry;
}) {
  const { updateValue } = useConfigStore();
  if (meta.type === "boolean") {
    return (
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          checked={entry.value === "true"}
          onChange={(e) => updateValue(meta.key, entry.scope, String(e.target.checked))}
        />
        <span>{entry.value === "true" ? "启用" : "禁用"}</span>
      </label>
    );
  }

  if (meta.type === "enum") {
    return (
      <select
        value={entry.value}
        onChange={(e) => updateValue(meta.key, entry.scope, e.target.value)}
        style={{ padding: 8, borderRadius: 8, background: "var(--panel)", color: "var(--text)" }}
      >
        {meta.enumValues?.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type="text"
      value={entry.value}
      onChange={(e) => updateValue(meta.key, entry.scope, e.target.value)}
      placeholder={meta.type === "path" ? "/usr/bin/vim" : "输入值"}
      style={{
        padding: 10,
        width: "100%",
        borderRadius: 10,
        border: "1px solid var(--border)",
        background: "var(--panel)",
        color: "var(--text)",
      }}
    />
  );
}

function ConfigItem({ meta, entries, effective }: Props) {
  const mergedEntries = entries.length
    ? entries
    : [{ key: meta.key, value: "", scope: "local" as Scope }];

  return (
    <article
      style={{
        padding: 14,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 600 }}>{meta.label}</div>
          <div style={{ color: "var(--muted)", fontSize: 12 }}>{meta.key}</div>
        </div>
        {effective && (
          <div style={{ fontSize: 12, color: "var(--accent)" }}>
            生效值: <strong>{effective.value || "<空>"}</strong> ({scopeLabel[effective.scope]})
          </div>
        )}
      </header>
      {meta.description && (
        <div style={{ color: "var(--muted)", fontSize: 13 }}>{meta.description}</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {mergedEntries.map((entry) => (
          <div
            key={`${entry.key}-${entry.scope}`}
            style={{
              padding: 10,
              borderRadius: 10,
              background: "var(--panel)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                fontSize: 13,
                color: "var(--muted)",
              }}
            >
              <span>{scopeLabel[entry.scope]}</span>
              {entry.overriddenBy && (
                <span style={{ color: "var(--warning)" }}>
                  被 {scopeLabel[entry.overriddenBy]} 覆盖
                </span>
              )}
            </div>
            <ValueInput meta={meta} entry={entry} />
          </div>
        ))}
      </div>
    </article>
  );
}

export default ConfigItem;
