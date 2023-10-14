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

export class SpeciesList extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('species-list');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
  }

  connectedCallback() {
    const list = this.shadow.querySelector('selectable-list');
    list.fetchItems = this.fetchSpeciesItems.bind(this);
  }

  async fetchSpeciesItems() {
    const species = await getAllSpecies();

    return species.map((species) => {
      const { vec_img } = species.fields;
      const { documentId } = species.meta;

      return { name: vec_img, id: documentId };
    });
  }
}

export class SelectableList extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('selectable-list');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));

    this.items = [];
  }

  connectedCallback() {
    setInterval(this._refreshItems.bind(this), 1000);
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
      this._refreshItems();
    }
  }

  async _refreshItems() {
    if (!this.fetchItems) {
      return;
    }

    const items = await this.fetchItems();

    if (JSON.stringify(this.items) !== JSON.stringify(items)) {
      this.items = items;
      this._renderItems();
    }
    this.refresh = false;
  }

  _renderItems() {
    const list = this.shadow.querySelector('ul');
    list.innerHTML = '';

    this.items.forEach((item) => {
      const { name, id } = item;

      const selectItem = document.createElement('select-item');
      selectItem.checked = id === this.selected;
      selectItem.name = name;
      selectItem.id = id;

      selectItem.onclick = (e) => {
        this.selected = e.target.id;
        this._renderItems();
      };

      list.appendChild(selectItem);
    });
  }
}
