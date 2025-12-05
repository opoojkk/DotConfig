import { CONFIG_SCHEMA } from "../schema/configSchema";
import { ConfigEntry } from "../stores/configStore";

interface Props {
  entries: ConfigEntry[];
}

function DiffSummary({ entries }: Props) {
  const changedKeys = CONFIG_SCHEMA.filter((meta) =>
    entries.some((entry) => entry.key === meta.key && entry.value !== "")
  );

  return (
    <section
      style={{
        padding: 16,
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: 12,
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700 }}>覆盖关系 & Diff</div>
          <div style={{ color: "var(--muted)", fontSize: 12 }}>
            高亮不同作用域的值，帮助发现冲突
          </div>
        </div>
        <button
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text)",
            cursor: "pointer",
          }}
        >
          导出快照
        </button>
      </header>

      <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
        {changedKeys.map((meta) => {
          const local = entries.find((entry) => entry.key === meta.key && entry.scope === "local");
          const global = entries.find((entry) => entry.key === meta.key && entry.scope === "global");
          const system = entries.find((entry) => entry.key === meta.key && entry.scope === "system");
          const values = [local?.value, global?.value, system?.value].filter(Boolean);
          const hasConflict = new Set(values).size > 1;

          return (
            <div
              key={meta.key}
              style={{
                padding: 10,
                borderRadius: 10,
                border: `1px solid ${hasConflict ? "var(--warning)" : "var(--border)"}`,
                background: hasConflict ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{meta.key}</strong>
                {hasConflict && <span style={{ color: "var(--warning)" }}>存在冲突</span>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 8 }}>
                <ValueCell label="Local" value={local?.value} />
                <ValueCell label="Global" value={global?.value} />
                <ValueCell label="System" value={system?.value} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ValueCell({ label, value }: { label: string; value?: string }) {
  return (
    <div
      style={{
        padding: 8,
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: "var(--panel)",
        minHeight: 42,
      }}
    >
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ wordBreak: "break-all" }}>{value || "<未设置>"}</div>
    </div>
  );
}

export default DiffSummary;
