// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod key_pair;

use std::env;
use std::fs::DirBuilder;
use std::fs::File;
use std::io::Read;
use std::path::Path;
use std::path::PathBuf;
use std::time::Duration;

use aquadoggo::{Configuration, LockFile, Node};
use tauri::async_runtime;

use crate::key_pair::generate_or_load_key_pair;

const BLOBS_DIR: &str = "blobs";

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}


/// Load data from a toml file following `LockFile` format.
fn load_seed_data(path: &Path) -> Option<LockFile> {
    let absolute_path = if path.is_absolute() {
        path.to_path_buf()
    } else {
        env::current_dir().expect("Get current dir").join(path)
    };

    let mut file = match File::open(absolute_path) {
        Ok(file) => file,
        Err(_) => return None,
    };

    let mut buffer = String::new();
    file.read_to_string(&mut buffer)
        .expect("Read seed data file");
    toml::from_str(&buffer.to_string()).ok()
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

    // If `--seed-data-path` cli arg was passed then load the seed data file.
    let seed_data = match &app.get_cli_matches()?.args.get("seed-data-path") {
        Some(arg) => {
            let path = Path::new(
                arg.value
                    .as_str()
                    .expect("Path passed to `--seed-data-path`"),
            );

            load_seed_data(path)
        }
        None => None,
    };

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

    let (tx, rx) = tokio::sync::oneshot::channel();
    async_runtime::spawn(async move {
        // Start the node.
        let node = Node::start(key_pair, config).await;

        // Migrate the required schemas
        //
        // Loading with the `include_str` macro means they are included in any compiled binaries
        let data = include_str!("../schemas/schema.lock");
        let lock_file: LockFile = toml::from_str(&data).expect("error parsing schema.lock file");
        let did_migrate_schemas = node.migrate(lock_file).await.expect("Migrate schemas");
        if did_migrate_schemas {
            println!(
                "Schema migration: required schemas successfully deployed on initial start-up"
            );
        }

        // Migrate seed data
        if let Some(seed_data) = seed_data {
            if did_migrate_schemas {
                // If schema migration occurred we wait a little for the graphql endpoints to be build.
                tokio::time::sleep(Duration::from_secs(1)).await;
            }
            let did_migrate_seed = node.migrate(seed_data).await.expect("Migrate seed data");
            if did_migrate_seed {
                println!("Seed data: seed data successfully published to node");
            }
        }

        // Wait for any migrated data to be ready
        tokio::time::sleep(Duration::from_secs(1)).await;
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
