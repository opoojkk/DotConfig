#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod commands;
mod git_config;

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![
      commands::read_scope,
      commands::write_scope,
      commands::list_scopes,
      commands::merged_view,
      commands::is_git_repo
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri app");
}
