import { getAllSpecies, getPlantsForGarden } from './queries.js';
import { Session } from '../libs/shirokuma.min.js';
import { getKeyPair } from './key_pair.js';
import { initNav } from './nav.js';
import {
  initGardenForm,
  initSearchGardenForm,
  initSpeciesForm,
} from './forms/index.js';
import { createPlantElement, createSpeciesElement } from './elements/index.js';

export async function init() {
  const keyPair = getKeyPair();

  // Open a long running connection to a p2panda node and configure it so all
  // calls in this session are executed using that key pair
  window.session = new Session('http://localhost:2020/graphql').setKeyPair(
    keyPair,
  );

  initNav();
  initGardenForm();
  initSearchGardenForm();
  initSpeciesForm();

  // Set to true to activate polling.
  localStorage.setItem('doPoll', true);
  setInterval(poll, 1000);
}

async function poll() {
  if (localStorage.getItem('doPoll')) {
    await refreshPlants();
    await refreshSpecies();
  }
}

async function refreshSpecies() {
  let species = await getAllSpecies();

  let speciesElement = document.getElementById('species');
  speciesElement.innerHTML = '';

  species.forEach((item) => {
    let { vec_img } = item.fields;
    let { documentId } = item.meta;

    let div = createSpeciesElement(vec_img, documentId);
    speciesElement.appendChild(div);
  });
}

async function refreshPlants() {
  let gardens = document.getElementsByClassName('garden');
  let gardensWithPlants = [];

  for (const garden of gardens) {
    let documentId = garden.id;
    let plants = await getPlantsForGarden(documentId);
    gardensWithPlants.push({ garden, plants });
  }

  gardensWithPlants.forEach(({ garden, plants }) => {
    let plantWrapper = garden.getElementsByClassName('plant-wrapper')[0];
    plantWrapper.innerHTML = '';
    plants.forEach((plant) => {
      let { pos_x, pos_y } = plant.fields;
      let emoji = plant.fields.species.fields.vec_img;
      let id = plant.meta.documentId;
      createPlantElement(plantWrapper, emoji, pos_x, pos_y, id);
    });
  });
}
