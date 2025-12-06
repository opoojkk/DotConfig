import { useConfigStore } from "../stores/configStore";

const scopes = [
  { key: "local", label: "Local" },
  { key: "global", label: "Global" },
  { key: "system", label: "System" },
] as const;

interface Props {
  repoEnabled: boolean;
  onRequireRepo?(): void;
  labels?: {
    local: string;
    global: string;
    system: string;
  };
}

function ScopeTabs({ repoEnabled, onRequireRepo, labels }: Props) {
  const { scope, setScope } = useConfigStore();

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {scopes.map((item) => (
        <button
          key={item.key}
          onClick={() => {
            if (item.key === "local" && !repoEnabled) {
              onRequireRepo?.();
              return;
            }
            setScope(item.key);
          }}
          disabled={item.key === "local" && !repoEnabled}
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            border: `1px solid ${
              scope === item.key ? "var(--accent)" : "var(--border)"
            }`,
            background:
              scope === item.key
                ? "rgba(94,181,247,0.12)"
                : item.key === "local" && !repoEnabled
                ? "rgba(255,255,255,0.04)"
                : "var(--panel)",
            color:
              item.key === "local" && !repoEnabled ? "var(--muted)" : "var(--text)",
            cursor:
              item.key === "local" && !repoEnabled ? "not-allowed" : "pointer",
          }}
        >
          {labels?.[item.key] ?? item.label}
        </button>
      ))}
    </div>
  );
}

export default ScopeTabs;
