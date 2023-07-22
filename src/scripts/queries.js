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

export async function createPlant(fields) {
  return await window.session.create(fields, { schemaId: PLANT_SCHEMA_ID });
}

export async function createSpecies(fields) {
  return await window.session.create(fields, { schemaId: SPECIES_SCHEMA_ID });
}

export async function deleteGarden(id) {
  return await window.session.delete(id, { schemaId: GARDEN_SCHEMA_ID });
}

export async function getAllGardens() {
  const query_name = `all_${GARDEN_SCHEMA_ID}`;
  const query = `
    query gardens {
      ${query_name}(first: 100, orderBy: name) {
        documents {
          fields {
            name
            width
            height
          }
          meta {
            documentId
            viewId
          }
        }
      }
    }
  `;

  const result = await request(query);
  return result.data[query_name].documents;
}

export async function searchGardenByName(searchString) {
  const query_name = `all_${GARDEN_SCHEMA_ID}`;
  const query = `
    query gardens {
      ${query_name}(first: 1, filter: { name : { contains : "${searchString}" } }) {
        documents {
          fields {
            name
            width
            height
          }
          meta {
            documentId
            viewId
          }
        }
      }
    }
  `;

  const result = await request(query);
  return result.data[query_name].documents;
}

export async function getPlantsForGarden(gardenId) {
  const query_name = `all_${PLANT_SCHEMA_ID}`;
  const query = `
    query plants {
      ${query_name}(first: 50, filter: { garden: {eq: "${gardenId}" } }) {
        documents {
          fields {
            pos_x
            pos_y
            planted_at
            species {
              fields {
                name
                vec_img
              }
              meta {
                documentId
                viewId
              }        
            }
          }
          meta {
            documentId
            viewId
          }
        }
      }
    }
  `;

  const result = await request(query);
  return result.data[query_name].documents;
}

export async function getAllSpecies() {
  const query_name = `all_${SPECIES_SCHEMA_ID}`;
  const query = `
    query species {
      ${query_name} {
        documents {
          fields {
            name
            vec_img
          }
          meta {
            documentId
            viewId
          }
        }
      }
    }
  `;

  const result = await request(query);
  return result.data[query_name].documents;
}
