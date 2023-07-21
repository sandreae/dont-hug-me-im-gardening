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

  await createDummyData();

  // Set to true to activate polling.
  localStorage.setItem('doPoll', true);
  setInterval(poll, 1000);
}

async function poll() {
  if (localStorage.getItem('doPoll')) {
    await refreshGardens();
  }
}

function initGardenForm() {
  let form = document.getElementById('garden-form');
  form.onsubmit = async (e) => {
    e.preventDefault();

    const name = document.getElementById('garden-name').value;
    const width = document.getElementById('garden-width').value;
    const height = document.getElementById('garden-height').value;

    await createGarden({
      name,
      height: Number(height),
      width: Number(width),
    });
  };
}

async function refreshGardens() {
  let gardens = await getAllGardens();

  let visitPage = document.getElementById(VISIT_PAGE);
  visitPage.innerHTML = '';

  gardens.forEach((garden) => {
    let { name, height, width } = garden.fields;
    let { documentId } = garden.meta;

    const div = document.createElement('div');
    div.style.minWidth = `${width}px`;
    div.style.minHeight = `${height}px`;
    div.style.width = `${width}px`;
    div.style.height = `${height}px`;
    div.classList.add('garden');
    div.innerHTML = name;
    div.id = documentId;
    visitPage.appendChild(div);
  });
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
    name: 99,
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
