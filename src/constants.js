export const LOCAL_STORAGE_KEY = 'privateKey';

// Schema this application uses
export const GARDENS_SCHEMA_ID =
  'gardens_002048de60bb7ef5a1e88b7b7b32da976cef927d083afb4132cbe631beb47ccb293b';
export const TILES_SCHEMA_ID =
  'tiles_0020c1b8203a112c4184bed03a8781fbfc9562bbc46cb92a88592b91e34648709c60';
export const SPRITES_SCHEMA_ID =
  'sprites_00201215a0932e2ae043620979e5b0cde2522e8e6279a3efa5955491e8ad5796d655';

// URL of your local aquadoggo node
const NODE_ENDPOINT = `http://localhost:2020/`;
export const GRAPHQL_ENDPOINT = NODE_ENDPOINT + 'graphql';
export const BLOBS_ENDPOINT = NODE_ENDPOINT + 'blobs/';

// Max upload size in kB.
export const MAX_UPLOAD_SIZE = 50 * 1000;