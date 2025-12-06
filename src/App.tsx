import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, CONFIG_SCHEMA } from "./schema/configSchema";
import {
  ConfigEntry,
  Scope,
  getEffectiveValue,
  useConfigStore,
} from "./stores/configStore";
import { useAliasStore } from "./stores/aliasStore";
import { useRemoteStore } from "./stores/remoteStore";
import { loadConfigFromNative, saveConfigToNative } from "./api/tauri";
import ScopeTabs from "./components/ScopeTabs";
import ConfigGroupNav from "./components/ConfigGroupNav";
import ConfigItem from "./components/ConfigItem";
import AliasEditor from "./components/AliasEditor";
import RemoteEditor from "./components/RemoteEditor";
import DiffSummary from "./components/DiffSummary";
import Toolbar from "./components/Toolbar";

function App() {
  const { scope, entries, setEntries, search, setScope } = useConfigStore();
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0]);
  const [target, setTarget] = useState<"global" | "repo" | null>(null);
  const [repoInput, setRepoInput] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("");
  const aliasStore = useAliasStore();
  const remoteStore = useRemoteStore();

  useEffect(() => {
    if (!target) return;
    loadConfigFromNative(scope).then(setEntries);
  }, [scope, setEntries, target]);

  const filteredSchema = useMemo(
    () =>
      CONFIG_SCHEMA.filter(
        (meta) =>
          meta.category === activeCategory &&
          (meta.key.includes(search) || meta.label.includes(search))
      ),
    [activeCategory, search]
  );

  const renderConfigRows = () =>
    filteredSchema.map((meta) => {
      const scopedEntries = entries.filter((entry) => entry.key === meta.key);
      const effective = getEffectiveValue(entries, meta.key);
      return (
        <ConfigItem
          key={`${meta.key}-${scope}`}
          meta={meta}
          entries={scopedEntries}
          effective={effective ?? undefined}
        />
      );
    });

  const handleSave = async () => {
    await saveConfigToNative(scope, entries.filter((entry) => entry.scope === scope));
  };

  const handleChooseGlobal = () => {
    setTarget("global");
    setSelectedRepo("");
    setScope("global");
  };

  const handleChooseRepo = () => {
    const name = repoInput.trim() || "当前仓库";
    setTarget("repo");
    setSelectedRepo(name);
    setScope("local");
  };

  if (!target) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #0f1823 0%, #0b121c 100%)",
          color: "var(--text)",
          padding: 24,
        }}
      >
        <div
          style={{
            width: "min(900px, 100%)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
              开始
            </div>
            <h2 style={{ margin: "4px 0 12px" }}>选择配置目标</h2>
            <p style={{ marginTop: 0, color: "var(--muted)", lineHeight: 1.6 }}>
              先选择要操作的配置范围，再进入配置编辑器。
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
              <button
                onClick={handleChooseGlobal}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid var(--accent)",
                  background: "rgba(94,181,247,0.14)",
                  color: "var(--text)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ fontWeight: 700 }}>打开全局配置</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>作用于所有仓库的全局 git 设置</div>
              </button>
            </div>
          </div>

          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
              或者
            </div>
            <h2 style={{ margin: "4px 0 8px" }}>选择一个仓库</h2>
            <p style={{ marginTop: 0, color: "var(--muted)", lineHeight: 1.6 }}>
              填写仓库路径或名称，进入该仓库的配置（对应本地配置）。
            </p>
            <input
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="例如：d:/Projects/my-repo"
              style={{
                padding: "12px 12px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text)",
                outline: "none",
              }}
            />
            <button
              onClick={handleChooseRepo}
              disabled={!repoInput.trim()}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: repoInput.trim() ? "var(--accent)" : "rgba(255,255,255,0.05)",
                color: repoInput.trim() ? "#0b121c" : "var(--muted)",
                cursor: repoInput.trim() ? "pointer" : "not-allowed",
                fontWeight: 700,
              }}
            >
              打开仓库
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        gridTemplateRows: "64px 1fr 140px",
        minHeight: "100vh",
        background: "var(--bg)",
      }}
    >
      <header
        style={{
          gridColumn: "1 / span 2",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          borderBottom: "1px solid var(--border)",
          background: "linear-gradient(180deg, #0f1823 0%, #0b121c 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontWeight: 700, letterSpacing: 0.5 }}>GitConfig Studio</div>
          <div
            style={{
              padding: "6px 10px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            {target === "global" ? "全局配置" : `仓库：${selectedRepo}`}
          </div>
          <button
            onClick={() => {
              setTarget(null);
              setScope("global");
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              color: "var(--text)",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            切换目标
          </button>
        </div>
        <ScopeTabs
          repoEnabled={Boolean(selectedRepo)}
          onRequireRepo={() => alert("请先选择一个仓库，才能查看仓库配置")}
        />
        <div style={{ display: "flex", gap: 12, color: "var(--muted)" }}>
          <span>Snapshots</span>
          <span>Help</span>
        </div>
      </header>

      <ConfigGroupNav
        categories={CATEGORIES}
        active={activeCategory}
        onSelect={setActiveCategory}
      />

      <main
        style={{
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          background: "linear-gradient(180deg, #0f1823 0%, #0b121c 100%)",
          borderLeft: "1px solid var(--border)",
        }}
      >
        <Toolbar onSave={handleSave} />
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 12,
          }}
        >
          {renderConfigRows()}
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          <div style={{ background: "var(--panel)", padding: 16, borderRadius: 12 }}>
            <h3 style={{ marginTop: 0 }}>Alias 管理</h3>
            <AliasEditor store={aliasStore} />
          </div>
          <div style={{ background: "var(--panel)", padding: 16, borderRadius: 12 }}>
            <h3 style={{ marginTop: 0 }}>Remote 管理</h3>
            <RemoteEditor store={remoteStore} />
          </div>
        </section>

        <DiffSummary entries={entries} />
      </main>
    </div>
  );
}

export default App;
