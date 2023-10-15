import queries from './queries.js';

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

    this.items.forEach((species) => {
      const { vec_img } = species.fields;
      const { documentId } = species.meta;

      const selectItem = document.createElement('select-item');
      selectItem.checked = documentId === this.selected;
      selectItem.name = vec_img;
      selectItem.id = documentId;

      selectItem.onclick = (e) => {
        this.selected = e.target.id;
        this._renderItems();
      };

      list.appendChild(selectItem);
    });
  }
}

export class P2pandaQuery extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.items = [];
    this.query = queries[this.getAttribute('schema')];
  }

  connectedCallback() {
    setInterval(this._query.bind(this), 1000);
  }

  static get observedAttributes() {
    return ['refresh'];
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

  attributeChangedCallback(name) {
    switch (name) {
      case 'refresh':
        this._query();
        this.refresh = false;
        break;

      default:
        break;
    }
  }

  async _query() {
    if (!this.query) {
      return;
    }

    const items = await this.query();

    if (JSON.stringify(this.items) !== JSON.stringify(items)) {
      this.items = items;
      this._onNewItems(items);
      // this._renderItems();
    }
  }

  _onNewItems(items) {
    if (!this.onNewItems) {
      console.log('New items fetched:', items);
      return;
    }
    this.onNewItems(items);
  }
}
