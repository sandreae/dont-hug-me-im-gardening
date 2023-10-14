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

    this.gardens = [];
  }

  connectedCallback() {
    const input = this.shadow.querySelector('input');
    input.oninput = async (e) => {
      e.preventDefault();
      this.fetchGardens();
    };

    setInterval(this.fetchGardens.bind(this), 1000);
  }

  get refresh() {
    return this.hasAttribute('refresh');
  }

  set refresh(val) {
    if (val) {
      this.setAttribute('refresh', val);
    } else {
      this.removeAttribute('refresh');
    }
  }

  static get observedAttributes() {
    return ['refresh'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(name, newValue);
    if (name === 'refresh' && newValue) {
      this.renderList();
    }
  }

  async fetchGardens() {
    const input = this.shadow.querySelector('input');
    const searchString = input.value;

    const newGardens =
      !searchString || searchString.length == 0
        ? await getAllGardens()
        : await searchGardenByName(searchString);

    if (JSON.stringify(this.gardens) !== JSON.stringify(newGardens)) {
      this.gardens = newGardens;
      this.refresh = true;
    } else {
      this.refresh = false;
    }
  }

  renderList() {
    const list = this.shadow.querySelector('ul');
    list.innerHTML = '';

    this.gardens.forEach((garden) => {
      const { name } = garden.fields;
      const { documentId } = garden.meta;

      const item = document.createElement('select-item');
      item.checked = documentId === this.currentGarden;
      item.name = name;
      item.id = documentId;

      item.onclick = (e) => {
        const gardenId = e.target.id;
        this.currentGarden = gardenId;
        this.renderList();
      };

      list.appendChild(item);
    });
  }
}
