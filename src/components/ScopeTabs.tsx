import { useConfigStore } from "../stores/configStore";

const scopes = [
  { key: "local", label: "Local" },
  { key: "global", label: "Global" },
  { key: "system", label: "System" },
  { key: "merged", label: "Merged" },
] as const;

function ScopeTabs() {
  const { scope, setScope } = useConfigStore();

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {scopes.map((item) => (
        <button
          key={item.key}
          onClick={() => setScope(item.key)}
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            border: `1px solid ${scope === item.key ? "var(--accent)" : "var(--border)"}`,
            background: scope === item.key ? "rgba(94,181,247,0.12)" : "var(--panel)",
            color: "var(--text)",
            cursor: "pointer",
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default ScopeTabs;
