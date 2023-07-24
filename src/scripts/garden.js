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
  const index = target.id;

  if (!gardenId) {
    return;
  }

  const createdAt = Math.floor(new Date().getTime() / 1000.0);
  const currentSpeciesId = getCurrentSpeciesId();
  const plantId = await createPlant(
    index,
    createdAt,
    currentSpeciesId,
    gardenId,
  );

  const currentSpeciesChar = getCurrentSpeciesChar();
  target.textContent = currentSpeciesChar;

  console.log('Created plant: ', plantId);
}
