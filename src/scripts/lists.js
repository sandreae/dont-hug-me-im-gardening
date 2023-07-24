import {
  setCurrentSpeciesId,
  setCurrentSpeciesChar,
  setCurrentGarden,
} from './store.js';

export function createGardenListItem(gardenId, value, currentGardenId) {
  const checked = currentGardenId === gardenId ? true : false;
  return createListItem(gardenId, value, 'garden', checked, onClickGarden);
}

export function createSpeciesListItem(speciesId, value, currentSpeciesId) {
  const checked = currentSpeciesId === speciesId ? true : false;
  return createListItem(speciesId, value, 'species', checked, onClickSpecies);
}

function onClickGarden(e) {
  const gardenId = e.target.id;
  setCurrentGarden(gardenId);
}

function onClickSpecies(e) {
  const speciesId = e.target.id;
  const speciesChar = e.target.value;
  setCurrentSpeciesId(speciesId);
  setCurrentSpeciesChar(speciesChar);
}

export function createListItem(id, value, name, checked, onClick) {
  let div = document.createElement('div');
  let input = document.createElement('input');
  input.checked = checked;
  input.type = 'radio';
  input.name = name;
  input.value = value;
  input.id = id;

  let label = document.createElement('label');
  label.for = id;
  label.textContent = value;

  input.onclick = onClick;
  div.appendChild(input);
  div.appendChild(label);
  return div;
}
