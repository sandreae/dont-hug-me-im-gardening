import { GARDEN_HEIGHT, GARDEN_WIDTH } from '../constants.js';
import { createGarden, createSpecies } from '../queries.js';

export class GardenForm extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('garden-form');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
  }

  connectedCallback() {
    const form = this.shadow.querySelector('form');

    form.onsubmit = async (e) => {
      e.preventDefault();
      const input = this.shadow.querySelector('input');
      const id = await createGarden({
        name: input.value,
        width: GARDEN_WIDTH,
        height: GARDEN_HEIGHT,
      });

      console.log('Created garden: ', id);
      input.value = '';
    };
  }
}

export class SpeciesForm extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('species-form');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
  }

  connectedCallback() {
    const form = this.shadow.querySelector('form');

    form.onsubmit = async (e) => {
      e.preventDefault();
      const input = this.shadow.querySelector('input');
      const id = await createSpecies(input.files[0]);

      console.log('Created species: ', id);
      input.value = '';
    };
  }
}
