import { Session } from '../libs/shirokuma.min.js';
import { getPlantsForGarden } from './queries.js';
import { SpeciesList, SelectItem } from './lists.js';
import { getCurrentGarden, getKeyPair } from './store.js';
import { Garden, GardenTile } from './garden.js';
import { GardenForm, SpeciesForm, GardenSearch } from './forms.js';

export async function app() {
  const keyPair = getKeyPair();

  // Open a long running connection to a p2panda node and configure it so all
  // calls in this session are executed using that key pair
  window.session = new Session('http://localhost:2020/graphql').setKeyPair(
    keyPair,
  );

  customElements.define('garden-tile', GardenTile);
  customElements.define('garden-main', Garden);
  customElements.define('species-form', SpeciesForm);
  customElements.define('species-list', SpeciesList);
  customElements.define('garden-form', GardenForm);
  customElements.define('garden-search', GardenSearch);
  customElements.define('select-item', SelectItem);
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
