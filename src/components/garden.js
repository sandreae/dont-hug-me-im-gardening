import { createPlant } from '../queries.js';
import {
  getCurrentGarden,
  getCurrentSpeciesId,
  getCurrentSpeciesChar,
} from '../store.js';

export class GardenTile extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const template = document.getElementById('garden-tile');
    const templateContent = template.content;

    this.attachShadow({ mode: 'open' }).appendChild(
      templateContent.cloneNode(true),
    );
  }
}

export class Garden extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById('garden-main');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
  }

  connectedCallback() {
    for (let index = 0; index < 192; index++) {
      let element = document.createElement('garden-tile');
      element.id = index;
      element.onclick = this.onClick;
      this.shadow.appendChild(element);
    }
  }

  async onClick(e) {
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
}
