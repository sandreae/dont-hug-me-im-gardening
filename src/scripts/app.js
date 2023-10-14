import { Session } from '../libs/shirokuma.min.js';
import {
  getAllGardens,
  getAllSpecies,
  getPlantsForGarden,
  searchGardenByName,
} from './queries.js';
import {
  initGardenForm,
  initSearchGardenForm,
  initSpeciesForm,
} from './forms.js';
import { createGardenListItem, createSpeciesListItem } from './lists.js';
import { getCurrentGarden, getCurrentSpeciesId, getKeyPair } from './store.js';
import { Garden, GardenTile } from './garden.js';

export async function app() {
  const keyPair = getKeyPair();

  // Open a long running connection to a p2panda node and configure it so all
  // calls in this session are executed using that key pair
  window.session = new Session('http://localhost:2020/graphql').setKeyPair(
    keyPair,
  );

  customElements.define("garden-tile", GardenTile);
  customElements.define("garden-main", Garden);

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
    await refreshGardens();
  }
}

async function refreshGardens() {
  const currentGarden = getCurrentGarden();
  const searchInput = document.getElementById('garden-search');
  const searchString = searchInput.value;

  const gardens =
    !searchString || searchString.length == 0
      ? await getAllGardens()
      : await searchGardenByName(searchString);

  const searchResults = document.getElementById('garden-list');
  searchResults.innerHTML = '';

  Array.from(gardens).forEach((garden) => {
    const { name } = garden.fields;
    const { documentId } = garden.meta;
    const listItem = createGardenListItem(documentId, name, currentGarden);
    searchResults.appendChild(listItem);
  });
}

async function refreshSpecies() {
  const currentSpecies = getCurrentSpeciesId();

  const species = await getAllSpecies();

  let speciesElement = document.getElementById('species-list');
  speciesElement.innerHTML = '';

  Array.from(species).forEach((item) => {
    let { vec_img } = item.fields;
    let { documentId } = item.meta;

    let div = createSpeciesListItem(documentId, vec_img, currentSpecies);
    speciesElement.appendChild(div);
  });
}

async function refreshPlants() {
  const gardenId = getCurrentGarden();

  if (gardenId === undefined) {
    return;
  }

  const newPlants = await getPlantsForGarden(gardenId);
  let currentPlants = document.getElementsByClassName('plant');

  Array.from(currentPlants).forEach((currentPlant) => {
    let currentPosition = currentPlant.id;

    let newPlant = Array.from(newPlants).find((plant) => {
      return plant.fields.pos_x === Number(currentPosition);
    });

    if (!newPlant) {
      currentPlant.innerHTML = '';
      return;
    }

    const { vec_img } = newPlant.fields.species.fields;

    if (vec_img !== currentPlant.innerHTML) {
      currentPlant.textContent = vec_img;
    }
  });
}
