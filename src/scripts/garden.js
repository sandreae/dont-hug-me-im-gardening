import { OperationFields } from '../libs/shirokuma.min.js';
import { createPlant } from './queries.js';
import {
  getCurrentGarden,
  getCurrentSpeciesId,
  getCurrentSpeciesChar,
} from './store.js';

export function initGarden() {
  let garden = document.getElementById('garden');
  for (let index = 0; index < 192; index++) {
    let element = document.createElement('div');
    element.id = index;
    element.classList.add('plant', 'clickable');
    element.onclick = onClick;
    garden.appendChild(element);
  }
}

async function onClick(e) {
  e.preventDefault();
  const target = e.target;

  const gardenId = getCurrentGarden();
  const x = target.id;

  if (!gardenId) {
    return;
  }

  const now = Math.floor(new Date().getTime() / 1000.0);
  let plant_fields = new OperationFields({
    pos_x: Math.floor(x),
    pos_y: Math.floor(0),
    planted_at: now,
    garden: `${gardenId}`,
  });

  const currentSpeciesId = getCurrentSpeciesId();
  plant_fields.insert('species', 'pinned_relation', [currentSpeciesId]);

  const plantId = await createPlant(plant_fields);

  const currentSpeciesChar = getCurrentSpeciesChar();
  target.textContent = currentSpeciesChar;

  console.log('Created plant: ', plantId);
}
