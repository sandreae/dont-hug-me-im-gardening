import {
  setCurrentSpeciesId,
  setCurrentSpeciesChar,
  setCurrentGarden,
} from './store.js';

export class GardenSelectItem extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const input = document.createElement('input');
    input.checked = this.selected;
    input.type = 'radio';
    input.name = 'garden';
    input.value = this.name;
    input.id = this.id;

    input.onclick = (e) => {
      const gardenId = e.target.id;
      setCurrentGarden(gardenId);
    };

    const label = document.createElement('label');
    label.for = this.id;
    label.textContent = this.name;

    const li = document.createElement('li');
    li.appendChild(input);
    li.appendChild(label);
    this.shadow.appendChild(li);
  }
}

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
