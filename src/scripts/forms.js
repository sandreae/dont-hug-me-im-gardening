import { GARDEN_HEIGHT, GARDEN_WIDTH } from './constants.js';
import { createGarden, createSpecies } from './queries.js';

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
      const query = this.shadow.querySelector('p2panda-query');
      query.refresh = true;
    };

    const query = this.shadow.querySelector('p2panda-query');
    query.onNewItems = this._onNewItems.bind(this);
  }

  _onNewItems(items) {
    this.items = items;
    this._renderItems();
  }

  _renderItems() {
    const list = this.shadow.querySelector('ul');
    list.innerHTML = '';

    this.items.forEach((garden) => {
      const { name } = garden.fields;
      const { documentId } = garden.meta;

      const selectItem = document.createElement('select-item');
      selectItem.checked = documentId === this.selected;
      selectItem.name = name;
      selectItem.id = documentId;

      selectItem.onclick = (e) => {
        this.selected = e.target.id;
        this._renderItems();
      };

      list.appendChild(selectItem);
    });
  }
}
