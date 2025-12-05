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
  const { scope, entries, setEntries, search } = useConfigStore();
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0]);
  const aliasStore = useAliasStore();
  const remoteStore = useRemoteStore();

  useEffect(() => {
    loadConfigFromNative(scope).then(setEntries);
  }, [scope, setEntries]);

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
          background: "var(--panel)",
        }}
      >
        <div style={{ fontWeight: 700, letterSpacing: 0.5 }}>GitConfig Studio</div>
        <ScopeTabs />
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
