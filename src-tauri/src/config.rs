// SPDX-License-Identifier: AGPL-3.0-or-later

use std::convert::TryFrom;
use std::net::SocketAddr;
use std::path::PathBuf;
use std::str::FromStr;
use std::sync::OnceLock;

use anyhow::{anyhow, Result};
use aquadoggo::{AllowList, Configuration as NodeConfiguration, NetworkConfiguration};
use figment::providers::{Env, Format, Serialized, Toml};
use figment::Figment;
use libp2p::PeerId;
use p2panda_rs::schema::SchemaId;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use tempfile::TempDir;

const WILDCARD: &str = "*";

static TMP_DIR: OnceLock<TempDir> = OnceLock::new();

/// Get configuration from .toml file and environment variables (in that order, meaning that later
/// configuration sources take precedence over the earlier ones).
///
/// Returns a partly unchecked configuration object which results from all of these sources. It
/// still needs to be converted for aquadoggo as it might still contain invalid values.
pub fn load_config(config_path: &PathBuf) -> Result<Configuration> {
    let mut figment = Figment::from(Serialized::defaults(Configuration::default()));
    figment = figment.merge(Toml::file(config_path));

    let config = figment.merge(Env::raw()).extract()?;

    Ok(config)
}

/// Configuration derived from environment variables and .toml file.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Configuration {
    pub log_level: String,
    pub allow_schema_ids: UncheckedAllowList,
    pub database_url: String,
    pub database_max_connections: u32,
    pub http_port: u16,
    pub quic_port: u16,
    pub blobs_base_path: Option<PathBuf>,
    pub private_key: Option<PathBuf>,
    pub mdns: bool,
    pub direct_node_addresses: Vec<SocketAddr>,
    pub allow_peer_ids: UncheckedAllowList,
    pub block_peer_ids: Vec<PeerId>,
    pub relay_addresses: Vec<SocketAddr>,
    pub relay_mode: bool,
    pub worker_pool_size: u32,
}

impl Default for Configuration {
    fn default() -> Self {
        let database_url = {
            // Give each in-memory SQLite database an unique name as we're observing funny issues with
            // SQLite sharing data between processes (!) and breaking each others databases
            // potentially.
            //
            // See related issue: https://github.com/p2panda/aquadoggo/issues/568
            let db_name = format!("dbmem{}", rand::random::<u32>());

            // Set "mode=memory" to enable SQLite running in-memory and set "cache=shared", as
            // setting it to "private" would break sqlx / SQLite.
            //
            // See related issue: https://github.com/launchbadge/sqlx/issues/2510
            format!("sqlite://file:{db_name}?mode=memory&cache=shared")
        };

        Self {
            log_level: "off".into(),
            allow_schema_ids: UncheckedAllowList::Wildcard,
            database_url,
            database_max_connections: 32,
            http_port: 2020,
            quic_port: 2022,
            blobs_base_path: None,
            mdns: true,
            private_key: None,
            direct_node_addresses: vec![],
            allow_peer_ids: UncheckedAllowList::Wildcard,
            block_peer_ids: Vec::new(),
            relay_addresses: vec![],
            relay_mode: false,
            worker_pool_size: 16,
        }
    }
}

impl TryFrom<Configuration> for NodeConfiguration {
    type Error = anyhow::Error;

    fn try_from(value: Configuration) -> Result<Self, Self::Error> {
        // Check if given schema ids are valid
        let allow_schema_ids = match value.allow_schema_ids {
            UncheckedAllowList::Wildcard => AllowList::<SchemaId>::Wildcard,
            UncheckedAllowList::Set(str_values) => {
                let schema_ids: Result<Vec<SchemaId>, anyhow::Error> = str_values
                    .iter()
                    .map(|str_value| {
                        SchemaId::from_str(str_value).map_err(|_| {
                            anyhow!(
                                "Invalid schema id '{str_value}' found in 'allow_schema_ids' list"
                            )
                        })
                    })
                    .collect();

                AllowList::Set(schema_ids?)
            }
        };

        // Check if given peer ids are valid
        let allow_peer_ids = match value.allow_peer_ids {
            UncheckedAllowList::Wildcard => AllowList::<PeerId>::Wildcard,
            UncheckedAllowList::Set(str_values) => {
                let peer_ids: Result<Vec<PeerId>, anyhow::Error> = str_values
                    .iter()
                    .map(|str_value| {
                        PeerId::from_str(str_value).map_err(|_| {
                            anyhow!("Invalid peer id '{str_value}' found in 'allow_peer_ids' list")
                        })
                    })
                    .collect();

                AllowList::Set(peer_ids?)
            }
        };

        // Create a temporary blobs directory when none was given
        let blobs_base_path = match value.blobs_base_path {
            Some(path) => path,
            None => TMP_DIR
                .get_or_init(|| {
                    // Initialise a `TempDir` instance globally to make sure it does not run out of
                    // scope and gets deleted before the end of the application runtime
                    tempfile::TempDir::new()
                        .expect("Could not create temporary directory to store blobs")
                })
                .path()
                .to_path_buf(),
        };

        Ok(NodeConfiguration {
            allow_schema_ids,
            database_url: value.database_url,
            database_max_connections: value.database_max_connections,
            http_port: value.http_port,
            blobs_base_path,
            worker_pool_size: value.worker_pool_size,
            network: NetworkConfiguration {
                quic_port: value.quic_port,
                mdns: value.mdns,
                direct_node_addresses: value.direct_node_addresses,
                allow_peer_ids,
                block_peer_ids: value.block_peer_ids,
                relay_addresses: value.relay_addresses,
                relay_mode: value.relay_mode,
                ..Default::default()
            },
        })
    }
}

/// Helper struct to deserialize from either a wildcard string "*" or a list of string values.
///
/// These string values are not checked yet and need to be validated in a succeeding step.
#[derive(Debug, Clone)]
pub enum UncheckedAllowList {
    Wildcard,
    Set(Vec<String>),
}

impl Serialize for UncheckedAllowList {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match self {
            UncheckedAllowList::Wildcard => serializer.serialize_str(WILDCARD),
            UncheckedAllowList::Set(list) => list.serialize(serializer),
        }
    }
}

impl<'de> Deserialize<'de> for UncheckedAllowList {
    fn deserialize<D>(deserializer: D) -> Result<UncheckedAllowList, D::Error>
    where
        D: Deserializer<'de>,
    {
        #[derive(Deserialize)]
        #[serde(untagged)]
        enum Value<T> {
            String(String),
            Vec(Vec<T>),
        }

        let value = Value::deserialize(deserializer)?;

        match value {
            Value::String(str_value) => {
                if str_value == WILDCARD {
                    Ok(UncheckedAllowList::Wildcard)
                } else {
                    Err(serde::de::Error::custom("only wildcard strings allowed"))
                }
            }
            Value::Vec(vec) => Ok(UncheckedAllowList::Set(vec)),
        }
    }
}
