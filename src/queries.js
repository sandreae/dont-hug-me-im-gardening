import { OperationFields } from './libs/shirokuma.min.js';
import {
  GARDEN_SCHEMA_ID,
  TILE_SCHEMA_ID,
  SPRITE_SCHEMA_ID,
  ENDPOINT,
} from './constants.js';

async function request(query) {
  return fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: query,
      variables: {},
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      return result;
    });
}

export async function createGarden(name, columns, rows) {
  const timestamp = Math.floor(new Date().getTime() / 1000.0);
  let fields = new OperationFields({
    name,
    columns,
    rows,
    timestamp,
  });
  return await window.session.create(fields, { schemaId: GARDEN_SCHEMA_ID });
}

export async function createTile(pos_x, pos_y, spriteId, gardenId) {
  const timestamp = Math.floor(new Date().getTime() / 1000.0);
  let fields = new OperationFields({
    pos_x: Math.floor(pos_x),
    pos_y: Math.floor(pos_y),
    timestamp,
  });

  fields.insert('garden', 'relation', gardenId);
  fields.insert('sprite', 'pinned_relation', [spriteId]);

  return await window.session.create(fields, { schemaId: TILE_SCHEMA_ID });
}

export async function createSprite(description, blob) {
  const blobId = await window.session.createBlob(blob);

  const timestamp = Math.floor(new Date().getTime() / 1000.0);
  let fields = new OperationFields();
  fields.insert('img', 'relation', blobId);
  fields.insert('description', 'str', description);
  fields.insert('timestamp', 'int', timestamp);

  return await window.session.create(fields, { schemaId: SPRITE_SCHEMA_ID });
}

export async function deleteGarden(gardenId) {
  let hasNextPage = true;
  let endCursor = null;
  let tileDocuments = [];

  while (hasNextPage) {
    const response = await getGardenTiles(gardenId, 100, endCursor);
    ({ hasNextPage, endCursor } = response);
    tileDocuments = tileDocuments.concat(response.documents);
  }

  for (const document of tileDocuments) {
    await deleteTile(document.meta.viewId);
  }

  return await window.session.delete(gardenId, { schemaId: GARDEN_SCHEMA_ID });
}

export async function deleteTile(id) {
  return await window.session.delete(id, { schemaId: TILE_SCHEMA_ID });
}

export async function getGarden(id) {
  const query = `query {
    ${GARDEN_SCHEMA_ID}(id: "${id}") {
      fields {
        name
        rows
        columns
        timestamp
      }
      meta {
        documentId
        owner
      }
    }
  }`;

  const result = await request(query);
  return result.data[GARDEN_SCHEMA_ID];
}

export async function getAllGardens(options) {
  options.schema = GARDEN_SCHEMA_ID;
  options.orderBy = `name`;
  options.fields = `{
    cursor
    fields {
      name
      rows
      columns
      timestamp
    }
    meta {
      documentId
      viewId
      owner
    }
  }`;

  return await paginatedQuery(options);
}

export async function getGardenTiles(gardenId, first, after) {
  const options = {
    schema: TILE_SCHEMA_ID,
    first,
    after,
    orderBy: `timestamp`,
    orderDirection: `DESC`,
    filter: `{ garden: { eq: "${gardenId}" } }`,
    fields: `{
      cursor
      fields {
        pos_x
        pos_y
        sprite {
          fields {
            img {
              meta {
                documentId
              }
            }
          }
        }
      }
      meta {
        documentId
        viewId
      }
    }`,
  };
  return await paginatedQuery(options);
}

export async function getAllSprites(options) {
  options.schema = SPRITE_SCHEMA_ID;
  options.orderBy = `timestamp`;
  options.fields = `{
      cursor
      fields {
        description
        img {
          meta {
            documentId
          }
        }
      } 
      meta {
        documentId
        viewId
      }
    }`;
  return await paginatedQuery(options);
}

export async function paginatedQuery(options) {
  const { schema, first, after, orderBy, orderDirection, filter, fields } =
    options;

  const queryName = `all_${schema}`;
  const query = `
    query {
      ${queryName}(
        ${first ? `first: ${first},` : ''} 
        ${after ? `after: "${after}",` : ''} 
        ${orderBy ? `orderBy: ${orderBy},` : ''} 
        ${orderDirection ? `orderDirection: ${orderDirection},` : ''} 
        ${filter ? `filter: ${filter},` : ''} 
      ) {
        totalCount
        hasNextPage
        endCursor
        documents ${fields}
      }
    }
  `;

  const result = await request(query);
  return result.data[queryName];
}

export default { sprites: getAllSprites, gardens: getAllGardens };
