import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, CONFIG_SCHEMA } from "./schema/configSchema";
import {
  ConfigEntry,
  Scope,
  getEffectiveValue,
  useConfigStore,
} from "./stores/configStore";
import { useAliasStore } from "./stores/aliasStore";
import { useRemoteStore } from "./stores/remoteStore";
import { checkGitRepo, loadConfigFromNative, saveConfigToNative } from "./api/tauri";
import ScopeTabs from "./components/ScopeTabs";
import ConfigGroupNav from "./components/ConfigGroupNav";
import ConfigItem from "./components/ConfigItem";
import AliasEditor from "./components/AliasEditor";
import RemoteEditor from "./components/RemoteEditor";
import DiffSummary from "./components/DiffSummary";
import Toolbar from "./components/Toolbar";
import { open } from "@tauri-apps/plugin-dialog";

function App() {
  const { scope, entries, setEntries, search, setScope } = useConfigStore();
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0]);
  const [target, setTarget] = useState<"global" | "repo" | null>(null);
  const [repoInput, setRepoInput] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("");
  const [selectedRepoPath, setSelectedRepoPath] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isDefaultValue, setIsDefaultValue] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const mainRef = useRef<HTMLDivElement | null>(null);
  const activeCategoryRef = useRef(activeCategory);
  const aliasStore = useAliasStore();
  const remoteStore = useRemoteStore();

  useEffect(() => {
    if (!target) return;
    loadConfigFromNative(scope, selectedRepoPath).then(setEntries);
  }, [scope, setEntries, target, selectedRepoPath]);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const groupedSchema = useMemo(() => {
    const term = search.trim().toLowerCase();
    return CATEGORIES.map((category) => ({
      category,
      items: CONFIG_SCHEMA.filter(
        (meta) =>
          meta.category === category &&
          (!term ||
            meta.key.toLowerCase().includes(term) ||
            meta.label.toLowerCase().includes(term))
      ),
    }));
  }, [search]);

  const renderConfigItem = (meta: (typeof CONFIG_SCHEMA)[number]) => {
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
  };

  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  // 基于滚动位置更新导航高亮
  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;

    let rafId: number | null = null;

    const updateActiveCategory = () => {
      const scrollTop = container.scrollTop;
      const offset = 120; // 触发偏移量

      // 从后向前遍历，找到第一个在视口上方的分类
      for (let i = CATEGORIES.length - 1; i >= 0; i--) {
        const category = CATEGORIES[i];
        const el = sectionRefs.current[category];

        // 检查该分类是否有内容
        const hasItems = groupedSchema.find(g => g.category === category)?.items.length ?? 0;
        if (!el || hasItems === 0) continue;

        if (el.offsetTop <= scrollTop + offset) {
          if (category !== activeCategoryRef.current) {
            activeCategoryRef.current = category;
            setActiveCategory(category);
          }
          break;
        }
      }
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveCategory);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    // 初始化时也执行一次
    updateActiveCategory();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [groupedSchema]);
  const handleSave = async () => {
    await saveConfigToNative(scope, entries.filter((entry) => entry.scope === scope), selectedRepoPath);
  };

  const handleChooseGlobal = () => {
    setTarget("global");
    setSelectedRepo("");
    setScope("global");
  };

  const handleChooseRepo = async () => {
    const path = repoInput.trim();
    if (!path) return;
    const ok = await checkGitRepo(path);
    if (!ok) {
      alert("该目录不是有效的 git 仓库，请重新选择。");
      return;
    }
    setTarget("repo");
    setSelectedRepo(path);
    setSelectedRepoPath(path);
    setScope("local");
  };

  const handlePickRepo = async () => {
    try {
      // 在浏览器模式下没有 Tauri 环境，使用 prompt 兜底
      if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
        const manual = window.prompt("请输入仓库路径");
        if (manual) setRepoInput(manual);
        return;
      }

      const path = await open({
        directory: true,
        multiple: false,
        title: "选择一个仓库目录",
        defaultPath: repoInput || undefined,
      });
      if (typeof path === "string") {
        const ok = await checkGitRepo(path);
        if (!ok) {
          alert("该目录不是有效的 git 仓库，请重新选择。");
          return;
        }
        setRepoInput(path);
        setSelectedRepoPath(path);
        setSelectedRepo(path);
        setTarget("repo");
        setScope("local");
      }
    } catch (err) {
      console.warn("选择目录失败", err);
      alert("选择目录失败，请重试或手动输入路径。");
    }
  };

  const suggestions = useMemo(
    () => CONFIG_SCHEMA.filter((meta) => meta.key.includes(newKey.trim())).slice(0, 8),
    [newKey]
  );

  const getDefaultValueByType = (key: string) => {
    const meta = CONFIG_SCHEMA.find((m) => m.key === key);
    if (!meta) return "";
    if (meta.defaultValue !== undefined) return meta.defaultValue;
    if (meta.type === "boolean") return "false";
    if (meta.type === "enum") return meta.enumValues?.[0] ?? "";
    return "";
  };

  const handleAddConfig = () => {
    const key = newKey.trim();
    if (!key) return;
    const value = newValue || getDefaultValueByType(key);
    const existing = entries.find((entry) => entry.key === key && entry.scope === scope);
    if (existing) {
      const ok = window.confirm("该配置已存在，是否覆盖？");
      if (!ok) return;
    }
    const nextEntries = existing
      ? entries.map((entry) =>
        entry.key === key && entry.scope === scope ? { ...entry, value } : entry
      )
      : [...entries, { key, value, scope }];
    setEntries(nextEntries);
    setShowAddModal(false);
    setNewKey("");
    setNewValue("");
    setIsDefaultValue(false);
    setShowSuggestions(false);
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
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>或者</div>
            <h2 style={{ margin: '4px 0 8px' }}>选择一个仓库</h2>
            <p style={{ marginTop: 0, color: 'var(--muted)', lineHeight: 1.6 }}>
              通过系统文件夹选择器指定仓库目录，进入该仓库的配置（对应本地配置）。
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
                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  作用于所有仓库的全局 git 设置
                </div>
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
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>或者</div>
            <h2 style={{ margin: '4px 0 8px' }}>选择一个仓库</h2>
            <p style={{ marginTop: 0, color: 'var(--muted)', lineHeight: 1.6 }}>
              通过系统文件夹选择器指定仓库目录，进入该仓库的配置（对应本地配置）。
            </p>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                onClick={handlePickRepo}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--accent)",
                  background: "rgba(94,181,247,0.14)",
                  color: "var(--text)",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                选择文件夹
              </button>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>
                {repoInput || "未选择"}
              </span>
            </div>
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
        gridTemplateRows: "64px 1fr",
        height: "100vh",
        overflow: "hidden",
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
          position: "sticky",
          top: 0,
          zIndex: 5,
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
        onSelect={(cat) => {
          setActiveCategory(cat);
          activeCategoryRef.current = cat;
          const el = sectionRefs.current[cat];
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
      />

      <main
        ref={mainRef}
        style={{
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          background: "linear-gradient(180deg, #0f1823 0%, #0b121c 100%)",
          borderLeft: "1px solid var(--border)",
          overflowY: "auto",
          height: "calc(100vh - 64px)",
        }}
      >
        <Toolbar onSave={handleSave} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div />
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid var(--accent)",
              background: "rgba(94,181,247,0.14)",
              color: "var(--text)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            添加配置
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {groupedSchema
            .filter(({ items }) => items.length > 0)
            .map(({ category, items }) => (
              <section
                key={category}
                ref={(el) => {
                  sectionRefs.current[category] = el;
                }}
                data-category={category}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h2 style={{ margin: 0 }}>{category}</h2>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>
                    {items.length} 项
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: 12,
                  }}
                >
                  {items.map(renderConfigItem)}
                </div>
              </section>
            ))}
        </div>

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

      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 20,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              width: "min(480px, 100%)",
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 18,
              boxShadow: "0 10px 50px rgba(0,0,0,0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>添加配置项</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontSize: 13, color: "var(--muted)" }}>配置键</label>
              <div style={{ position: "relative" }}>
                <input
                  value={newKey}
                  onChange={(e) => {
                    setNewKey(e.target.value);
                    setIsDefaultValue(false);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => newKey && setShowSuggestions(true)}
                  placeholder="如：user.name"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--text)",
                  }}
                />
                {showSuggestions && newKey && suggestions.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "var(--panel)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      marginTop: 4,
                      maxHeight: 200,
                      overflow: "auto",
                      zIndex: 2,
                    }}
                  >
                    {suggestions.map((meta) => (
                      <div
                        key={meta.key}
                        onClick={() => {
                          setNewKey(meta.key);
                          const value = getDefaultValueByType(meta.key);
                          setNewValue(value);
                          setIsDefaultValue(Boolean(value));
                          setShowSuggestions(false);
                        }}
                        style={{
                          padding: "8px 10px",
                          cursor: "pointer",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{meta.label}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{meta.key}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label style={{ fontSize: 13, color: "var(--muted)" }}>值</label>
              <input
                value={newValue}
                onChange={(e) => {
                  setNewValue(e.target.value);
                  setIsDefaultValue(false);
                }}
                placeholder="填写配置值"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--text)",
                }}
              />

              {isDefaultValue && (
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  已使用该键的默认值
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "var(--panel)",
                    color: "var(--text)",
                    cursor: "pointer",
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleAddConfig}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--accent)",
                    background: "var(--accent)",
                    color: "#0b121c",
                    cursor: newKey.trim() ? "pointer" : "not-allowed",
                    fontWeight: 700,
                  }}
                  disabled={!newKey.trim()}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
