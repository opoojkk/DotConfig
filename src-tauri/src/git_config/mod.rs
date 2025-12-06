use git2::Config;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, fs, path::PathBuf};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ConfigError {
  #[error("failed to open git config: {0}")]
  Open(String),
  #[error("io error: {0}")]
  Io(String),
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum Scope {
  Local,
  Global,
  System,
}

impl Scope {
  pub fn label(&self) -> &'static str {
    match self {
      Scope::Local => "Local",
      Scope::Global => "Global",
      Scope::System => "System",
    }
  }

  pub fn path(&self) -> Option<PathBuf> {
    match self {
      Scope::Local => Some(std::env::current_dir().ok()?.join(".git/config")),
      Scope::Global => dirs::home_dir().map(|p| p.join(".gitconfig")),
      Scope::System => Some(PathBuf::from("/etc/gitconfig")),
    }
  }

  pub fn variants() -> Vec<Scope> {
    vec![Scope::Local, Scope::Global, Scope::System]
  }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigEntry {
  pub key: String,
  pub value: String,
  pub scope: Scope,
  #[serde(skip_serializing_if = "Option::is_none")]
  pub overridden_by: Option<Scope>,
}

pub fn read_scope_entries(scope: Scope) -> Result<Vec<ConfigEntry>, ConfigError> {
  let path = scope.path().ok_or_else(|| ConfigError::Open("无法解析配置路径".into()))?;
  ensure_file(&path)?;
  let config = Config::open(&path).map_err(|e| ConfigError::Open(e.to_string()))?;
  let mut entries = Vec::new();
  let mut iter = config
    .entries(None)
    .map_err(|e| ConfigError::Open(e.to_string()))?;
  while let Some(entry) = iter.next() {
    let entry = entry.map_err(|e| ConfigError::Open(e.to_string()))?;
    if let (Some(name), Some(raw)) = (entry.name(), entry.value()) {
      entries.push(ConfigEntry {
        key: name.to_string(),
        value: raw.to_string(),
        scope,
        overridden_by: None,
      });
    }
  }
  Ok(entries)
}

pub fn write_scope_entries(scope: Scope, entries: Vec<ConfigEntry>) -> Result<(), ConfigError> {
  let path = scope.path().ok_or_else(|| ConfigError::Open("无法解析配置路径".into()))?;
  ensure_file(&path)?;
  let mut config = Config::open(&path).map_err(|e| ConfigError::Open(e.to_string()))?;
  for entry in entries {
    config
      .set_str(&entry.key, &entry.value)
      .map_err(|e| ConfigError::Open(e.to_string()))?;
  }
  Ok(())
}

pub fn merged_view() -> Result<Vec<ConfigEntry>, ConfigError> {
  let priority = [Scope::System, Scope::Global, Scope::Local];
  let mut effective: HashMap<String, ConfigEntry> = HashMap::new();
  let mut history: Vec<ConfigEntry> = Vec::new();

  for scope in priority {
    let entries = read_scope_entries(scope)?;
    for entry in entries {
      if let Some(prev) = effective.get_mut(&entry.key) {
        history.push(ConfigEntry {
          overridden_by: Some(entry.scope),
          ..prev.clone()
        });
        *prev = entry;
      } else {
        effective.insert(entry.key.clone(), entry);
      }
    }
  }

  history.extend(effective.into_values());
  Ok(history)
}

fn ensure_file(path: &PathBuf) -> Result<(), ConfigError> {
  if let Some(parent) = path.parent() {
    fs::create_dir_all(parent).map_err(|e| ConfigError::Io(e.to_string()))?;
  }
  if !path.exists() {
    fs::File::create(path).map_err(|e| ConfigError::Io(e.to_string()))?;
  }
  Ok(())
}
