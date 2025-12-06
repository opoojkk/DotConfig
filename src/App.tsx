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
import { createTranslator, getDescription, LOCALE_OPTIONS, Locale } from "./i18n";

const LOCALE_STORAGE_KEY = "dotconfig-locale";

function App() {
  const { scope, entries, setEntries, search, setScope } = useConfigStore();
  const [locale, setLocale] = useState<Locale>("en");
  const [pendingLocale, setPendingLocale] = useState<Locale>("en");
  const [showLocaleSetup, setShowLocaleSetup] = useState(false);
  const [localeLoaded, setLocaleLoaded] = useState(false);
  const t = useMemo(() => createTranslator(locale), [locale]);
  const scopeLabel = useMemo(
    () => ({
      local: t("scopeLocal"),
      global: t("scopeGlobal"),
      system: t("scopeSystem"),
      merged: t("scopeMerged"),
    }),
    [t]
  );

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
    if (typeof window === "undefined") {
      setLocaleLoaded(true);
      return;
    }
    const cached = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (cached === "en" || cached === "zh") {
      setLocale(cached);
      setPendingLocale(cached);
      setShowLocaleSetup(false);
    } else {
      setShowLocaleSetup(true);
    }
    setLocaleLoaded(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || showLocaleSetup || !localeLoaded) return;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale, showLocaleSetup, localeLoaded]);

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
    const metaWithDescription = {
      ...meta,
      description: getDescription(meta.key, locale) ?? meta.description,
    };
    return (
      <ConfigItem
        key={`${meta.key}-${scope}`}
        meta={metaWithDescription}
        entries={scopedEntries}
        effective={effective ?? undefined}
        t={t}
        scopeLabel={scopeLabel}
      />
    );
  };

  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;

    let rafId: number | null = null;

    const updateActiveCategory = () => {
      const containerRect = container.getBoundingClientRect();
      const offset = 150;

      let newCategory: string | null = null;

      for (let i = CATEGORIES.length - 1; i >= 0; i--) {
        const category = CATEGORIES[i];
        const el = sectionRefs.current[category];

        const hasItems = groupedSchema.find((g) => g.category === category)?.items.length ?? 0;
        if (!el || hasItems === 0) {
          continue;
        }

        const rect = el.getBoundingClientRect();
        const relativeTop = rect.top - containerRect.top;

        if (relativeTop <= offset) {
          newCategory = category;
          break;
        }
      }

      if (!newCategory) {
        for (const category of CATEGORIES) {
          const hasItems = groupedSchema.find((g) => g.category === category)?.items.length ?? 0;
          if (hasItems > 0) {
            newCategory = category;
            break;
          }
        }
      }

      if (newCategory && newCategory !== activeCategoryRef.current) {
        activeCategoryRef.current = newCategory;
        setActiveCategory(newCategory);
      }
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveCategory);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    updateActiveCategory();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [groupedSchema, target]);

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
      alert(t("invalidRepo"));
      return;
    }
    setTarget("repo");
    setSelectedRepo(path);
    setSelectedRepoPath(path);
    setScope("local");
  };

  const handlePickRepo = async () => {
    try {
      if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
        const manual = window.prompt(t("promptRepo"));
        if (manual) setRepoInput(manual);
        return;
      }

      const path = await open({
        directory: true,
        multiple: false,
        title: t("landingRepoHeading"),
        defaultPath: repoInput || undefined,
      });
      if (typeof path === "string") {
        const ok = await checkGitRepo(path);
        if (!ok) {
          alert(t("invalidRepo"));
          return;
        }
        setRepoInput(path);
        setSelectedRepoPath(path);
        setSelectedRepo(path);
        setTarget("repo");
        setScope("local");
      }
    } catch (err) {
      console.warn("Select repo failed", err);
      alert(t("pickRepoFail"));
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
      const ok = window.confirm(t("overwriteConfirm"));
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

  if (!localeLoaded) {
    return null;
  }

  if (showLocaleSetup) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 30% 20%, rgba(94,181,247,0.15), transparent 32%), radial-gradient(circle at 70% 60%, rgba(94,181,247,0.1), transparent 40%), #0b121c",
          color: "var(--text)",
          padding: 24,
        }}
      >
        <div
          style={{
            width: "min(960px, 100%)",
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
            display: "grid",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, color: "var(--muted)", letterSpacing: 0.4 }}>DotConfig</div>
              <h1 style={{ margin: "6px 0 4px" }}>Choose your language / 请选择语言</h1>
              <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>
                Pick a language to use across the app. We'll remember it on this device so you do not have to set it again.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {LOCALE_OPTIONS.map((item) => {
              const active = pendingLocale === item.value;
              const languageLabel = item.value === "en" ? "English" : "中文";
              const helper = item.value === "en" ? "Use DotConfig in English" : "使用中文界面";
              return (
                <button
                  key={item.value}
                  onClick={() => setPendingLocale(item.value)}
                  style={{
                    textAlign: "left",
                    padding: "16px 18px",
                    borderRadius: 14,
                    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                    background: active ? "rgba(94,181,247,0.14)" : "rgba(255,255,255,0.03)",
                    color: "var(--text)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{languageLabel}</span>
                  <span style={{ fontWeight: 700 }}>{helper}</span>
                  {active && (
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>
                      This will be used as the default language.
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              onClick={() => {
                setLocale(pendingLocale);
                setShowLocaleSetup(false);
              }}
              style={{
                padding: "12px 18px",
                borderRadius: 10,
                border: "1px solid var(--accent)",
                background: "var(--accent)",
                color: "#0b121c",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Start using DotConfig
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>{t("landingOr")}</div>
            <h2 style={{ margin: "4px 0 8px" }}>{t("landingGlobalHeading")}</h2>
            <p style={{ marginTop: 0, color: "var(--muted)", lineHeight: 1.6 }}>
              {t("landingGlobalDesc")}
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
                <div style={{ fontWeight: 700 }}>{t("landingGlobalButton")}</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  {t("targetGlobal")}
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
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>{t("landingOr")}</div>
            <h2 style={{ margin: "4px 0 8px" }}>{t("landingRepoHeading")}</h2>
            <p style={{ marginTop: 0, color: "var(--muted)", lineHeight: 1.6 }}>
              {t("landingRepoDesc")}
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
                {t("landingPickFolder")}
              </button>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>
                {repoInput || t("landingNotSelected")}
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
              {t("landingOpenRepo")}
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
          <div style={{ fontWeight: 700, letterSpacing: 0.5 }}>{t("appTitle")}</div>
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
            {target === "global" ? t("globalBadgeLabel") : `${t("repoBadgeLabel")} ${selectedRepo}`}
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
            {t("switchTarget")}
          </button>
        </div>
        <ScopeTabs
          repoEnabled={Boolean(selectedRepo)}
          onRequireRepo={() => alert(t("requireRepo"))}
          labels={{
            local: scopeLabel.local,
            global: scopeLabel.global,
            system: scopeLabel.system,
          }}
        />
        <div style={{ display: "flex", gap: 8, color: "var(--muted)", alignItems: "center" }}>
          <span style={{ fontSize: 12 }}>{t("languageLabel")}</span>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              color: "var(--text)",
            }}
          >
            {LOCALE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value === "en" ? t("languageEnglish") : t("languageChinese")}
              </option>
            ))}
          </select>
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
        t={t}
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
        <Toolbar onSave={handleSave} t={t} />
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
            {t("addConfig")}
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
                    {items.length} {t("itemsSuffix")}
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
            <h3 style={{ marginTop: 0 }}>{t("aliasTitle")}</h3>
            <AliasEditor store={aliasStore} t={t} />
          </div>
          <div style={{ background: "var(--panel)", padding: 16, borderRadius: 12 }}>
            <h3 style={{ marginTop: 0 }}>{t("remoteTitle")}</h3>
            <RemoteEditor store={remoteStore} t={t} />
          </div>
        </section>

        <DiffSummary entries={entries} t={t} />
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
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>{t("addConfigTitle")}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontSize: 13, color: "var(--muted)" }}>{t("configKeyLabel")}</label>
              <div style={{ position: "relative" }}>
                <input
                  value={newKey}
                  onChange={(e) => {
                    setNewKey(e.target.value);
                    setIsDefaultValue(false);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => newKey && setShowSuggestions(true)}
                  placeholder={t("configKeyPlaceholder")}
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

              <label style={{ fontSize: 13, color: "var(--muted)" }}>{t("configValueLabel")}</label>
              <input
                value={newValue}
                onChange={(e) => {
                  setNewValue(e.target.value);
                  setIsDefaultValue(false);
                }}
                placeholder={t("configValuePlaceholder")}
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
                  {t("defaultValueApplied")}
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
                  {t("cancel")}
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
                  {t("save")}
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
