import process from 'process';
import fs from 'fs';
import toml from 'toml';
import { GRAPHQL_ENDPOINT } from './src/constants.js';

async function publish(entry, operation) {
  return fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation { publish(entry: "${entry}", operation: "${operation}") {
        seqNum
      }}`,
      variables: {},
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      return result;
    });
}

fs.readFile(process.argv[2], 'utf-8', async (err, data) => {
  if (err) throw err;

  const schemaLock = toml.parse(data);
  console.log(schemaLock);
  for (const { entry_hash, entry, operation } of schemaLock.commits) {
    const response = await publish(entry, operation);
    if (response.err) {
      throw err;
    } else {
      console.log('Published entry: ', entry_hash);
    }
  }
});
