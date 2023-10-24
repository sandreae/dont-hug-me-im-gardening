import { OperationFields } from './libs/shirokuma.min.js';
import {
  GARDEN_SCHEMA_ID,
  PLANT_SCHEMA_ID,
  SPECIES_SCHEMA_ID,
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

export async function createGarden(fields) {
  return await window.session.create(fields, { schemaId: GARDEN_SCHEMA_ID });
}

export async function createPlant(index, plantedAt, speciesId, gardenId) {
  let fields = new OperationFields({
    index: Math.floor(index),
    planted_at: plantedAt,
  });

  fields.insert('garden', 'relation', gardenId);
  fields.insert('species', 'pinned_relation', [speciesId]);

  return await window.session.create(fields, { schemaId: PLANT_SCHEMA_ID });
}

export async function createSpecies(blob, fields) {
  const blobId = await window.session.createBlob(blob);
  fields.insert('img', 'relation', blobId);

  return await window.session.create(fields, { schemaId: SPECIES_SCHEMA_ID });
}

export async function deleteGarden(id) {
  return await window.session.delete(id, { schemaId: GARDEN_SCHEMA_ID });
}

export async function getAllGardens(options) {
  options.schema = GARDEN_SCHEMA_ID;
  options.orderBy = `name`;
  options.fields = `{
    fields {
      name
      width
      height
    }
    meta {
      documentId
      viewId
    }
  }`;

  return await paginatedQuery(options);
}

export async function getPlantsForGarden(gardenId, first, after) {
  const options = {
    schema: PLANT_SCHEMA_ID,
    first,
    after,
    orderBy: `planted_at`,
    orderDirection: `DESC`,
    filter: `{ garden: { eq: "${gardenId}" } }`,
    fields: `{
      cursor
      fields {
        index
        species {
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

export async function getAllSpecies(first, after) {
  const options = {
    schema: SPECIES_SCHEMA_ID,
    first,
    after,
    fields: `{
      fields {
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
    }`,
  };
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
