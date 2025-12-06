import { useMemo, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import appIcon from "../../assets/app-icon.svg";

interface Props {
  height?: number;
}

const isTauri =
  typeof window !== "undefined" &&
  (Boolean((window as any).__TAURI__) || Boolean((window as any).__TAURI_INTERNALS__));
const isMac =
  typeof navigator !== "undefined" &&
  (navigator.userAgent.includes("Macintosh") || navigator.userAgent.includes("Mac OS"));
const currentWindow = isTauri ? getCurrentWindow() : null;

function Titlebar({ height = 42 }: Props) {
  const [hovered, setHovered] = useState<"min" | "max" | "close" | null>(null);
  const buttonBaseStyle = useMemo(
    () => ({
      width: isMac ? 12 : 34,
      height: isMac ? 12 : height,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      border: isMac ? "1px solid rgba(0,0,0,0.35)" : "1px solid var(--border)",
      background: isMac ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.02)",
      color: isMac ? "transparent" : "var(--text)",
      cursor: isTauri ? "pointer" : "not-allowed",
      borderRadius: isMac ? 999 : 8,
      transition: "background 120ms ease, color 120ms ease",
      WebkitAppRegion: "no-drag" as const,
      fontSize: isMac ? 0 : 12,
      fontWeight: isMac ? 400 : 700,
    }),
    [height]
  );

  const winMinIcon = (
    <span
      style={{
        display: "block",
        width: 14,
        height: 2,
        background: "currentColor",
        borderRadius: 1,
      }}
    />
  );

  const winMaxIcon = (
    <span
      style={{
        display: "block",
        width: 14,
        height: 10,
        border: "2px solid currentColor",
        borderRadius: 2,
        boxSizing: "border-box",
      }}
    />
  );

  const handleMinimize = async () => {
    if (!isTauri) return;
    await (currentWindow ?? getCurrentWindow()).minimize();
  };

  const handleMaximize = async () => {
    if (!isTauri) return;
    const win = currentWindow ?? getCurrentWindow();
    if (!win) return;
    const maximized = await win.isMaximized();
    if (maximized) {
      await win.unmaximize();
    } else {
      await win.maximize();
    }
  };

  const handleClose = async () => {
    if (!isTauri) {
      window.close();
      return;
    }
    await (currentWindow ?? getCurrentWindow()).close();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 12,
        paddingRight: isMac ? 12 : 0,
        background: "linear-gradient(180deg, #0f1823 0%, #0b121c 100%)",
        borderBottom: "1px solid var(--border)",
        zIndex: 40,
        WebkitAppRegion: "drag" as const,
        color: "var(--text)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMac ? 12 : 10,
          paddingLeft: isMac ? 4 : 0,
        }}
      >
        {isMac && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 6 }}>
            <button
              style={{
                ...buttonBaseStyle,
                background: "#ff5f57",
                borderColor: "#e2463f",
                boxShadow: "0 0 0 0.5px rgba(0,0,0,0.25)",
              }}
              onClick={handleClose}
              title="Close"
            />
            <button
              style={{
                ...buttonBaseStyle,
                background: "#ffbd2e",
                borderColor: "#e0a127",
                boxShadow: "0 0 0 0.5px rgba(0,0,0,0.25)",
              }}
              onClick={handleMinimize}
              title="Minimize"
            />
            <button
              style={{
                ...buttonBaseStyle,
                background: "#28c840",
                borderColor: "#25af3a",
                boxShadow: "0 0 0 0.5px rgba(0,0,0,0.25)",
              }}
              onClick={handleMaximize}
              title="Maximize"
            />
          </div>
        )}
        <img
          src={appIcon}
          alt="DotConfig"
          style={{ width: 22, height: 22, borderRadius: 6, objectFit: "contain", WebkitAppRegion: "no-drag" }}
        />
        <div style={{ fontWeight: 700, letterSpacing: 0.5 }}>DotConfig</div>
      </div>

      {!isMac && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            style={{
              ...buttonBaseStyle,
              width: 46,
              height: height - 8,
              borderRadius: 6,
              border: "none",
              opacity: isTauri ? 1 : 0.5,
              background: hovered === "min" ? "rgba(255,255,255,0.08)" : "transparent",
              color: "var(--text)",
            }}
            onClick={handleMinimize}
            title="Minimize"
            onMouseEnter={() => setHovered("min")}
            onMouseLeave={() => setHovered(null)}
          >
            {winMinIcon}
          </button>
          <button
            style={{
              ...buttonBaseStyle,
              width: 46,
              height: height - 8,
              borderRadius: 6,
              border: "none",
              opacity: isTauri ? 1 : 0.5,
              background: hovered === "max" ? "rgba(255,255,255,0.08)" : "transparent",
              color: "var(--text)",
            }}
            onClick={handleMaximize}
            title="Maximize"
            onMouseEnter={() => setHovered("max")}
            onMouseLeave={() => setHovered(null)}
          >
            {winMaxIcon}
          </button>
          <button
            style={{
              ...buttonBaseStyle,
              width: 46,
              height: height - 8,
              borderRadius: 6,
              border: "none",
              opacity: isTauri ? 1 : 0.5,
              color: hovered === "close" ? "#fff" : "var(--text)",
              background: hovered === "close" ? "#e81123" : "transparent",
              borderColor: "transparent",
            }}
            onClick={handleClose}
            title="Close"
            onMouseEnter={() => setHovered("close")}
            onMouseLeave={() => setHovered(null)}
          >
            X
          </button>
        </div>
      )}
    </div>
  );
}

export default Titlebar;
