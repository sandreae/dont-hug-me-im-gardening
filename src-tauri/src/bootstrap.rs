// SPDX-License-Identifier: AGPL-3.0-or-later

///
use anyhow::{anyhow, Result};
use gql_client::Client;
use p2panda_rs::entry::decode::decode_entry;
use p2panda_rs::entry::traits::AsEntry;
use p2panda_rs::entry::{EncodedEntry, LogId, SeqNum};
use p2panda_rs::hash::Hash;
use p2panda_rs::operation::EncodedOperation;
use serde::{Deserialize, Deserializer, Serialize, Serializer};

/// Deploy commits from a lock file to a node.
///
/// This can be used for deploying schema, or pre-populating a node on initial startup.
pub async fn deploy(client: &Client, lock_file_data: &str) {
    // Read and publish all commits contained in the lock file.
    let lock_file: LockFile = toml::from_str(lock_file_data).expect("error reading lock file");
    let commits = lock_file.commits.expect("");
    for commit in commits.iter() {
        let _ = publish(&client, commit.clone()).await;
    }
}

/// Serializable format holding encoded and signed p2panda operations and entries.
///
/// ```toml
/// version = 1
///
/// [[commits]]
/// entry_hash = "..."
/// entry = "..."
/// operation = "..."
///
/// [[commits]]
/// entry_hash = "..."
/// entry = "..."
/// operation = "..."
///
/// # ...
/// ```
#[derive(Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct LockFile {
    pub version: LockFileVersion,
    pub commits: Option<Vec<Commit>>,
}

/// Known versions of lock file format.
#[derive(Debug, Clone)]
enum LockFileVersion {
    V1,
}

impl LockFileVersion {
    /// Returns the operation version encoded as u64.
    pub fn as_u64(&self) -> u64 {
        match self {
            LockFileVersion::V1 => 1,
        }
    }
}

impl Serialize for LockFileVersion {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_u64(self.as_u64())
    }
}

impl<'de> Deserialize<'de> for LockFileVersion {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let version = u64::deserialize(deserializer)?;

        match version {
            1 => Ok(LockFileVersion::V1),
            _ => Err(serde::de::Error::custom(format!(
                "unsupported lock file version {}",
                version
            ))),
        }
    }
}

/// Single commit with encoded entry and operation pair.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Commit {
    /// Hash of the entry.
    pub entry_hash: Hash,

    /// Encoded and signed p2panda entry.
    pub entry: EncodedEntry,

    /// Encoded p2panda operation.
    pub operation: EncodedOperation,
}

/// Publish a commit (entry & operation) to a node if it is not already present.
///
/// Checks if there are no inconsistencies between the nodes' expected and actual state before
/// publishing.
async fn publish(client: &Client, commit: Commit) -> Result<bool> {
    let entry = decode_entry(&commit.entry).unwrap();

    let query = format!(
        r#"
        {{
            nextArgs(publicKey: "{}", viewId: "{}") {{
                logId
                seqNum
                skiplink
                backlink
            }}
        }}
        "#,
        entry.public_key(),
        commit.entry_hash,
    );

    let response = client.query_unwrap::<NextArgsResponse>(&query).await;

    if let Ok(result) = response {
        let args = result.next_args;

        if entry.log_id() != &args.log_id {
            panic!("Inconsistency between local commits and node detected");
        }

        // Check if node already knows about this commit
        if entry.seq_num() < &args.seq_num {
            // Skip this one
            return Ok(false);
        }
    }

    let query = format!(
        r#"
        mutation Publish {{
            publish(entry: "{}", operation: "{}") {{
                logId
                seqNum
                skiplink
                backlink
            }}
        }}
        "#,
        commit.entry, commit.operation
    );

    client
        .query_unwrap::<PublishResponse>(&query)
        .await
        .map_err(|err| anyhow!("GraphQL request to node failed: {err}"))?;

    Ok(true)
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
struct NextArguments {
    log_id: LogId,
    seq_num: SeqNum,
    skiplink: Option<Hash>,
    backlink: Option<Hash>,
}

/// GraphQL response for `nextArgs` query.
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct NextArgsResponse {
    next_args: NextArguments,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
struct PublishResponse {
    publish: NextArguments,
}
