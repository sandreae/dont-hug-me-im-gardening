// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config;
mod key_pair;

use std::env;
use std::fs::{self, DirBuilder};
use std::path::PathBuf;
use std::time::Duration;

use aquadoggo::{LockFile, Node};
use tauri::async_runtime;

use crate::config::load_config;
use crate::key_pair::generate_or_load_key_pair;

const BLOBS_DIR: &str = "blobs";

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn setup_handler(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error + 'static>> {
    let app_handle = app.handle();
    let app_data_dir = if cfg!(dev) {
        PathBuf::from("./tmp")
    } else {
        app_handle
            .path_resolver()
            .app_data_dir()
            .expect("error resolving app data dir path")
    };

    // Enable logging if set via `RUST_LOG` environment variable.
    if std::env::var("RUST_LOG").is_ok() {
        let _ = env_logger::builder().try_init();
    }

    let default_config_path = app
        .path_resolver()
        .resolve_resource("resources/config.toml")
        .expect("failed to resolve resource");

    let schema_lock_path = app
        .path_resolver()
        .resolve_resource("resources/schemas/schema.lock")
        .expect("failed to resolve resource");

    let sprite_pack_path = app
        .path_resolver()
        .resolve_resource("resources/sprite-packs/001.toml")
        .expect("failed to resolve resource");

    let config_path = app_data_dir.join("config.toml");
    if fs::read(&config_path).is_err() {
        fs::copy(default_config_path, &config_path)?;
    }

    let mut config = load_config(&config_path)?;

    // Set storage paths based on tauri defaults.
    config.database_url = format!(
        "sqlite:{}/db.sqlite3",
        app_data_dir.to_str().expect("invalid character in path")
    );
    config.blobs_base_path = app_data_dir.join(BLOBS_DIR);

    // Create blobs sub directory.
    DirBuilder::new()
        .recursive(true)
        .create(app_data_dir.join(BLOBS_DIR))
        .expect("error creating app data directories");

    // Create a KeyPair or load it from private-key.txt file in app data directory.
    //
    // This key pair is used to identify the node on the network, it is not used for signing
    // any application data.
    let key_pair = generate_or_load_key_pair(app_data_dir.join("private-key.txt"))
        .expect("error generating or loading node key pair");

    let (tx, rx) = tokio::sync::oneshot::channel();
    async_runtime::spawn(async move {
        // Start the node.
        let node = Node::start(key_pair, config).await;

        // Migrate the required schemas
        let data =
            fs::read_to_string(schema_lock_path).expect("schema.lock to be loaded from resources");
        let lock_file: LockFile = toml::from_str(&data).expect("error parsing schema.lock file");
        let did_migrate_schemas = node.migrate(lock_file).await.expect("Migrate schemas");
        if did_migrate_schemas {
            println!(
                "Schema migration: required schemas successfully deployed on initial start-up"
            );
            // Sleep for a second to let the schemas and GraphQL API be built
            tokio::time::sleep(Duration::from_secs(1)).await;
        }

        // Load "sprite pack" seed data
        let data =
            fs::read_to_string(sprite_pack_path).expect("sprite pack to be loaded from resources");
        let sprite_pack: LockFile = toml::from_str(&data).expect("error parsing sprite pack file");
        let did_migrate_schemas = node
            .migrate(sprite_pack)
            .await
            .expect("Publish (migrate) sprite pack");
        if did_migrate_schemas {
            println!("Seed data: packaged sprite packs successfully deployed on initial start-up");
            // Wait for any migrated data to be materialized
            tokio::time::sleep(Duration::from_secs(1)).await;
        }

        let _ = tx.send(());

        node.on_exit().await;
        node.shutdown().await;
    });

    let _ = rx.blocking_recv();

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .setup(setup_handler)
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
