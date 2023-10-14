import {
  setCurrentSpeciesId,
  setCurrentSpeciesChar,
  setCurrentGarden,
} from './store.js';

import { getAllSpecies } from './queries.js';

export class SelectItem extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const input = document.createElement('input');
    input.checked = this.checked;
    input.type = 'radio';
    input.value = this.name;
    input.id = this.id;

    input.onclick = this.onclick;

    const label = document.createElement('label');
    label.for = this.id;
    label.textContent = this.name;

    const li = document.createElement('li');
    li.appendChild(input);
    li.appendChild(label);
    this.shadow.appendChild(li);
  }
}

// export function createGardenListItem(gardenId, value, currentGardenId) {
//   const checked = currentGardenId === gardenId ? true : false;
//   return createListItem(gardenId, value, 'garden', checked, onClickGarden);
// }
//
// export function createSpeciesListItem(speciesId, value, currentSpeciesId) {
//   const checked = currentSpeciesId === speciesId ? true : false;
//   return createListItem(speciesId, value, 'species', checked, onClickSpecies);
// }
//
// function onClickGarden(e) {
//   const gardenId = e.target.id;
//   setCurrentGarden(gardenId);
// }
//
// function onClickSpecies(e) {
//   const speciesId = e.target.id;
//   const speciesChar = e.target.value;
//   setCurrentSpeciesId(speciesId);
//   setCurrentSpeciesChar(speciesChar);
// }
//
// export function createListItem(id, value, name, checked, onClick) {
//   let div = document.createElement('div');
//   let input = document.createElement('input');
//   input.checked = checked;
//   input.type = 'radio';
//   input.name = name;
//   input.value = value;
//   input.id = id;
//
//   let label = document.createElement('label');
//   label.for = id;
//   label.textContent = value;
//
//   input.onclick = onClick;
//   div.appendChild(input);
//   div.appendChild(label);
//   return div;
// }

export class SpeciesList extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('species-list');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
  }

  connectedCallback() {
    setInterval(this.refreshSpecies.bind(this), 1000);
  }

  async refreshSpecies() {
    const currentSpecies = this.currentSpecies;
    const species = await getAllSpecies();

    const list = this.shadow.querySelector('ul');
    list.innerHTML = '';

    species.forEach((species) => {
      const { vec_img } = species.fields;
      const { documentId } = species.meta;

      const item = document.createElement('select-item');
      item.checked = documentId === currentSpecies;
      item.name = vec_img;
      item.id = documentId;
      item.onclick = (e) => {
        const speciesId = e.target.id;
        this.currentSpecies = speciesId;
        this.refreshSpecies();
      };

      list.appendChild(item);
    });
  }
}
