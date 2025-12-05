#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod commands;
mod git_config;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      commands::read_scope,
      commands::write_scope,
      commands::list_scopes,
      commands::merged_view
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri app");
}
