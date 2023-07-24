import { GARDEN_HEIGHT, GARDEN_WIDTH } from './constants.js';
import {
  createGarden,
  createSpecies,
  getAllGardens,
  searchGardenByName,
} from './queries.js';
import { createGardenListItem } from './lists.js';
import { getCurrentGarden } from './store.js';

export function initGardenForm() {
  let form = document.getElementById('garden-form');
  form.onsubmit = onGardenSubmit;
}

async function onGardenSubmit(e) {
  e.preventDefault();
  const input = e.srcElement.elements['name'];
  const id = await createGarden({
    name: input.value,
    width: GARDEN_WIDTH,
    height: GARDEN_HEIGHT,
  });

  console.log('Created garden: ', id);
  input.value = '';
}

export function initSpeciesForm() {
  let form = document.getElementById('species-form');
  form.onsubmit = onSpeciesSubmit;
}

async function onSpeciesSubmit(e) {
  e.preventDefault();
  let input = e.srcElement.elements['emoji'];
  const emoji = input.value;

  const id = await createSpecies({
    name: 'temp name',
    vec_img: `${emoji}`,
  });

  console.log('Created species: ', id);
  input.value = '';
}

export function initSearchGardenForm() {
  let input = document.getElementById('garden-search');
  input.oninput = onSearchGardens;
}

async function onSearchGardens(e) {
  e.preventDefault();
  const currentGarden = getCurrentGarden();

  const searchString = e.target.value;
  const gardens =
    !searchString || searchString.length == 0
      ? await getAllGardens()
      : await searchGardenByName(searchString);

  let searchResults = document.getElementById('garden-list');
  searchResults.innerHTML = '';

  gardens.forEach((garden) => {
    const { name } = garden.fields;
    const { documentId } = garden.meta;

    const listItem = createGardenListItem(documentId, name, currentGarden);
    searchResults.appendChild(listItem);
  });
}
