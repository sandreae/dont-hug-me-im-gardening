// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::fs::DirBuilder;

mod key_pair;

use aquadoggo::{Configuration, Node};
use fishy::lock_file::LockFile;
use fishy::Client;
use tauri::api::path;
use tauri::async_runtime;

use crate::key_pair::generate_or_load_key_pair;

const ENDPOINT: &str = "http://localhost:2020/graphql";
const APP_DATA_DIR: &str = "p2p-garden";
const BLOBS_DIR: &str = "blobs";

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    async_runtime::spawn(async {
        // Enable logging if set via `RUST_LOG` environment variable.
        if std::env::var("RUST_LOG").is_ok() {
            let _ = env_logger::builder().try_init();
        }

        // Get the recommended app data dir from tauri environment and append
        // p2p-garden app dir to the path.
        let data_dir = path::data_dir()
            .expect("error deriving data dir path")
            .join(APP_DATA_DIR);

        // Construct node configuration and set database url and blobs path.
        let mut config = Configuration::default();
        config.database_url = format!(
            "sqlite:{}/p2p-garden.sqlite3",
            data_dir.to_str().expect("invalid character in path")
        );
        config.blobs_base_path = data_dir.join(BLOBS_DIR);

        // Create blob the root app data directory and the blobs sub directory.
        DirBuilder::new()
            .recursive(true)
            .create(data_dir.join(BLOBS_DIR))
            .expect("error creating app data directories");

        // Create a KeyPair or load it from secret.txt file in app data directory.
        //
        // This key pair is used to identify the node on the network, it is not used for signing
        // any application data.
        let key_pair = generate_or_load_key_pair(data_dir.join("secret.txt"))
            .expect("error generating or loading node key pair");

        // Start the node.
        let node = Node::start(key_pair, config).await;

        // Load schema.lock file, by using the include macro, this file is included in compiled binaries.
        let data = include_str!("../schemas/schema.lock");

        // Read and publish all commits contained in the schema.lock file.
        //
        // This pre-populates the node with the schemas required by the p2p-garden application. 
        let lock_file: LockFile = toml::from_str(&data).expect("error reading schema.lock file");
        let commits = lock_file.commits();
        let client = Client::new(&ENDPOINT);
        for commit in commits.iter() {
            let _ = client.publish(commit.clone()).await;
        }

        node.on_exit().await;
        node.shutdown().await;
    });

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
