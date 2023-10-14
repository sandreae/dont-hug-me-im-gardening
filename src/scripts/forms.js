import { GARDEN_HEIGHT, GARDEN_WIDTH } from './constants.js';
import {
  createGarden,
  createSpecies,
  getAllGardens,
  searchGardenByName,
} from './queries.js';

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

    this.gardens = [];
  }

  connectedCallback() {
    const input = this.shadow.querySelector('input');
    input.oninput = async (e) => {
      e.preventDefault();
      const list = this.shadow.querySelector('selectable-list');
      list.refresh = true;
    };

    const list = this.shadow.querySelector('selectable-list');
    list.fetchItems = this.fetchGardenItems.bind(this);
  }

  async fetchGardenItems() {
    const input = this.shadow.querySelector('input');
    const searchString = input.value;

    const newGardens =
      !searchString || searchString.length == 0
        ? await getAllGardens()
        : await searchGardenByName(searchString);

    return newGardens.map((garden) => {
      const { name } = garden.fields;
      const { documentId } = garden.meta;

      return { name: name, id: documentId };
    });
  }
}
