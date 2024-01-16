// SPDX-License-Identifier: AGPL-3.0-or-later

use std::{path::PathBuf, fs};

use anyhow::Result;
use aquadoggo::{ConfigFile, Configuration};

/// Load and validate an `aquadoggo` node configuration from .toml file.
pub fn load_config(config_path: &PathBuf) -> Result<Configuration> {
    let config_str = fs::read_to_string(&config_path)?;
    let node_config: ConfigFile = toml::from_str(&config_str)?;
    node_config.try_into()
}
