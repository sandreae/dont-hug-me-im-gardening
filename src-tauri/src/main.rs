// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use aquadoggo::{Configuration, Node};
use fishy::{
    lock_file::{Commit, LockFile},
    Client,
};
use p2panda_rs::identity::KeyPair;
use tauri::async_runtime;

const ENDPOINT: &str = "http://localhost:2020/graphql";

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    async_runtime::spawn(async {
        let config = Configuration::default();
        let key_pair = KeyPair::new();
        let node = Node::start(key_pair, config).await;

        let data = include_str!("../schemas/schema.lock");
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
