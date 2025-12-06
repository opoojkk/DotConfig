import type { Translate } from "../i18n";

interface Props {
  categories: string[];
  active: string;
  onSelect(category: string): void;
  t: Translate;
}

function ConfigGroupNav({ categories, active, onSelect, t }: Props) {
  return (
    <aside
      style={{
        padding: 14,
        background: "var(--panel)",
        borderRight: "1px solid var(--border)",
      }}
    >
      <div style={{ marginBottom: 12, color: "var(--muted)", fontSize: 13 }}>
        {t("navTitle")}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            style={{
              textAlign: "left",
              padding: "10px 12px",
              borderRadius: 10,
              background: active === cat ? "rgba(94,181,247,0.12)" : "transparent",
              color: "var(--text)",
              border: `1px solid ${active === cat ? "var(--accent)" : "transparent"}`,
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>
    </aside>
  );
}

export default ConfigGroupNav;
