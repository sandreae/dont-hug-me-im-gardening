// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::{fs::DirBuilder, path::PathBuf, thread::sleep, time::Duration};

mod key_pair;

use aquadoggo::{Configuration, LockFile, Node};
use tauri::async_runtime;

use crate::key_pair::generate_or_load_key_pair;

const GRAPHQL_ENDPOINT: &str = "http://localhost:2020/graphql";
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

    // Construct node configuration and set database url and blobs path.
    let mut config = Configuration::default();
    config.database_url = format!(
        "sqlite:{}/p2p-garden.sqlite3",
        app_data_dir.to_str().expect("invalid character in path")
    );
    config.blobs_base_path = app_data_dir.join(BLOBS_DIR);

    // Create blobs sub directory.
    DirBuilder::new()
        .recursive(true)
        .create(app_data_dir.join(BLOBS_DIR))
        .expect("error creating app data directories");

    // Create a KeyPair or load it from secret.txt file in app data directory.
    //
    // This key pair is used to identify the node on the network, it is not used for signing
    // any application data.
    let key_pair = generate_or_load_key_pair(app_data_dir.join("secret.txt"))
        .expect("error generating or loading node key pair");

    async_runtime::spawn(async move {
        // Start the node.
        let node = Node::start(key_pair, config).await;

        // Load schema.lock file. By using the include macro, this file is included in compiled binaries.
        let data = include_str!("../schemas/schema.lock");
        let lock_file: LockFile = toml::from_str(&data).expect("error parsing schema.lock file");
        let _ = node.migrate(lock_file).await.is_ok();

        let data = include_str!("../data/data.lock");
        let lock_file: LockFile = toml::from_str(&data).expect("error parsing schema.lock file");
        let _ = node.migrate(lock_file).await.is_ok();

        node.on_exit().await;
        node.shutdown().await;
    });

    sleep(Duration::from_secs(2));

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .setup(setup_handler)
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
