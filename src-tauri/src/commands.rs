use crate::git_config::{
  is_git_repo as is_git_repo_check,
  path_for_scope,
  read_scope_entries,
  write_scope_entries,
  ConfigEntry,
  Scope,
};
use serde::{Deserialize, Serialize};

#[tauri::command]
pub fn read_scope(scope: Scope, repo_path: Option<String>) -> Result<Vec<ConfigEntry>, String> {
  read_scope_entries(scope, repo_path.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_scope(scope: Scope, repo_path: Option<String>, entries: Vec<ConfigEntry>) -> Result<(), String> {
  write_scope_entries(scope, repo_path.as_deref(), entries).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn merged_view() -> Result<Vec<ConfigEntry>, String> {
  crate::git_config::merged_view().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn is_git_repo(path: String) -> bool {
  is_git_repo_check(&path)
}

#[tauri::command]
pub fn list_scopes() -> Vec<ScopeInfo> {
  Scope::variants()
    .into_iter()
    .map(|scope| ScopeInfo {
      scope,
      label: scope.label().to_string(),
      path: path_for_scope(scope),
    })
    .collect()
}

#[derive(Serialize, Deserialize)]
pub struct ScopeInfo {
  scope: Scope,
  label: String,
  path: Option<String>,
}
