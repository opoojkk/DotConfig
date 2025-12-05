use crate::git_config::{read_scope_entries, write_scope_entries, ConfigEntry, Scope};
use serde::{Deserialize, Serialize};

#[tauri::command]
pub fn read_scope(scope: Scope) -> Result<Vec<ConfigEntry>, String> {
  read_scope_entries(scope).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_scope(scope: Scope, entries: Vec<ConfigEntry>) -> Result<(), String> {
  write_scope_entries(scope, entries).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn merged_view() -> Result<Vec<ConfigEntry>, String> {
  crate::git_config::merged_view().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_scopes() -> Vec<ScopeInfo> {
  Scope::variants()
    .into_iter()
    .map(|scope| ScopeInfo {
      scope,
      label: scope.label().to_string(),
      path: scope.path().map(|p| p.to_string_lossy().to_string()),
    })
    .collect()
}

#[derive(Serialize, Deserialize)]
pub struct ScopeInfo {
  scope: Scope,
  label: String,
  path: Option<String>,
}
