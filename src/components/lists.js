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
      const { img } = species.fields;
      const { documentId } = species.meta;

      const image = document.createElement('img');
      if (documentId === this.selected) {
        image.setAttribute('selected', true);
      }
      image.src = `http://localhost:2020/blobs/${img.meta.documentId}`;
      image.id = documentId;

      image.onclick = (e) => {
        this.selected = e.target.id;
        window.selectedSpecies = e.target.id;
        window.selectedSpeciesImgSrc = e.target.src;
        this._renderItems();
      };

      list.appendChild(image);
    });
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
        window.selectedGarden = e.target.id;
        this._renderItems();
      };

      list.appendChild(selectItem);
    });
  }
}

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
