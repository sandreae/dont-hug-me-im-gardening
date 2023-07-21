import {
  createGarden,
  createPlant,
  createSpecies,
  getAllGardens,
  getAllPlants,
  getAllSpecies,
} from './queries.js';
import { Session, OperationFields } from '../libs/shirokuma.min.js';
import { getKeyPair } from './key_pair.js';
import { initNav } from './nav.js';
import { VISIT_PAGE } from './constants.js';

export async function init() {
  const keyPair = getKeyPair();

  // Open a long running connection to a p2panda node and configure it so all
  // calls in this session are executed using that key pair
  window.session = new Session('http://localhost:2020/graphql').setKeyPair(
    keyPair,
  );

  initNav();
  initGardenForm();
  initSpeciesForm();

  // Set to true to activate polling.
  localStorage.setItem('doPoll', true);
  setInterval(poll, 1000);
}

async function poll() {
  if (localStorage.getItem('doPoll')) {
    await refreshGardens();
    await refreshSpecies();
  }
}

function initGardenForm() {
  let form = document.getElementById('garden-form');
  form.onsubmit = async (e) => {
    e.preventDefault();

    const name = document.getElementById('garden-name').value;
    const width = document.getElementById('garden-width').value;
    const height = document.getElementById('garden-height').value;

    const id = await createGarden({
      name,
      height: Number(height),
      width: Number(width),
    });
    console.log('Created garden: ', id);
  };
  form.oninput = (e) => {
    e.preventDefault();

    const name = document.getElementById('garden-name').value;
    const width = document.getElementById('garden-width').value;
    const height = document.getElementById('garden-height').value;

    let garden = document.getElementById('in-progress-garden');
    if (garden) {
      garden.innerHTML = name;
      garden.style.minWidth = `${width}px`;
      garden.style.minHeight = `${height}px`;
      garden.style.width = `${width}px`;
      garden.style.height = `${height}px`;
    } else {
      let garden = createGardenElement(
        name,
        width,
        height,
        'in-progress-garden',
      );
      form.appendChild(garden);
    }
  };
}

function initSpeciesForm() {
  let form = document.getElementById('species-form');
  form.onsubmit = async (e) => {
    e.preventDefault();

    const emoji = document.getElementById('species-emoji').value;

    const id = await createSpecies({
      name: 'temp name',
      vec_img: emoji,
    });
    console.log('Created species: ', id);
  };
}

async function refreshGardens() {
  let gardens = await getAllGardens();

  let visitPage = document.getElementById(VISIT_PAGE);
  visitPage.innerHTML = '';

  gardens.forEach((garden) => {
    let { name, height, width } = garden.fields;
    let { documentId } = garden.meta;

    let div = createGardenElement(name, height, width, documentId);
    visitPage.appendChild(div);
  });
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

function createGardenElement(name, width, height, id) {
  const div = document.createElement('div');
  div.style.minWidth = `${width}px`;
  div.style.minHeight = `${height}px`;
  div.style.width = `${width}px`;
  div.style.height = `${height}px`;
  div.classList.add('garden');
  div.innerHTML = name;
  div.id = id;
  return div;
}

function createSpeciesElement(emoji, id) {
  const div = document.createElement('div');
  div.innerHTML = emoji;
  div.id = id;
  return div;
}

async function createDummyData() {
  let gardenId = await createGarden({
    name: 'My Garden',
    height: 500,
    width: 400,
  });

  console.log('Garden created!');
  console.log(gardenId);

  let speciesId = await createSpecies({
    name: 'Nettle',
    vec_img: '@',
  });

  console.log('Species created!');
  console.log(gardenId);

  let now = Math.floor(new Date().getTime() / 1000.0);
  let plant_fields = new OperationFields({
    pos_x: 50,
    pos_y: 50,
    planted_at: now,
    garden: `${gardenId}`,
  });

  plant_fields.insert('species', 'pinned_relation', [speciesId]);

  let plantId = await createPlant(plant_fields);
  console.log('Plant created!');
  console.log(plantId);
}
