import { GARDEN_HEIGHT, GARDEN_WIDTH } from './constants.js';
import {
  createGarden,
  createSpecies,
  getAllGardens,
  searchGardenByName,
} from './queries.js';
import { getCurrentGarden } from './store.js';

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
      const emoji = input.value;

      const id = await createSpecies({
        name: 'temp name',
        vec_img: `${emoji}`,
      });

      console.log('Created species: ', id);
      input.value = '';
    };
  }
}

export class GardenSearch extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('garden-search');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
  }

  connectedCallback() {
    const input = this.shadow.querySelector('input');

    input.oninput = async (e) => {
      e.preventDefault();
      // const searchString = e.target.value;
      const gardens = Array.from([
        { fields: { name: 'hello' }, meta: { documentId: '0' } },
        { fields: { name: 'goodbye' }, meta: { documentId: '1' } },
      ]);
      // const gardens = !searchString || searchString.length == 0
      //   ? await getAllGardens()
      //   : await searchGardenByName(searchString);
      const list = this.shadow.querySelector('ul');
      list.innerHTML = '';

      gardens.forEach((garden) => {
        const { name } = garden.fields;
        const { documentId } = garden.meta;

        const item = document.createElement('garden-select-item');
        item.name = name;
        item.id = documentId;

        list.appendChild(item);
      });
    };
  }
}
