import { setGardenId, setSpeciesId, setSpeciesImg } from '../globals.js';
import { getAllGardens, getAllSpecies } from '../queries.js';

export class SpeciesList extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('species-list');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));

    this.documents = [];
  }

  connectedCallback() {
    this.refresh();
  }

  async fetch() {
    const { documents } = await getAllSpecies(20);
    this.documents = documents;
  }

  render() {
    const list = this.shadow.querySelector('ul');
    list.innerHTML = '';

    this.documents.forEach((species) => {
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
        setSpeciesId(e.target.id);
        setSpeciesImg(e.target.src);
        this.render();
      };

      list.appendChild(image);
    });
  }

  async refresh() {
    await this.fetch();
    this.render();
  }
}

export class GardenSearch extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('garden-search');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));

    this.documents = [];
  }

  connectedCallback() {
    const input = this.shadow.querySelector('input');

    input.oninput = async (e) => {
      e.preventDefault();
      this.search = e.target.value;
    };

    this.refresh();
  }

  get selected() {
    return this.getAttribute('selected');
  }

  set selected(val) {
    if (val) {
      this.setAttribute('selected', val);
    } else {
      this.removeAttribute('selected');
    }
  }

  get search() {
    return this.getAttribute('search');
  }

  set search(val) {
    if (val && val.length > 0) {
      this.setAttribute('search', val);
    } else {
      this.removeAttribute('search');
    }
  }

  static get observedAttributes() {
    return ['selected', 'search'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name == 'selected' && oldValue != newValue) {
      const selectItems = this.shadow.querySelectorAll('input');
      selectItems.forEach((item) => {
        item.checked = item.id == newValue;
      });
    } else if (name == 'search' && oldValue != newValue) {
      this.refresh();
    }
  }

  async fetch() {
    let options = {};
    if (this.search) {
      options.filter = `{ name: { contains: "${this.search}" } }`;
    }

    const { documents } = await getAllGardens(options);

    if (JSON.stringify(this.documents) !== JSON.stringify(documents)) {
      this.documents = documents;
    }
  }

  render() {
    const list = this.shadow.querySelector('ul');
    list.innerHTML = '';

    this.documents.forEach((garden) => {
      const { name } = garden.fields;
      const { documentId } = garden.meta;

      const label = document.createElement('label');
      label.for = documentId;
      label.textContent = name;

      const input = document.createElement('input');
      input.checked = documentId === this.selected;
      input.name = name;
      input.id = documentId;
      input.type = 'radio';
      input.onclick = (e) => {
        this.selected = e.target.id;
        setGardenId(e.target.id);
      };
      input.onclick.bind(this);

      const li = document.createElement('li');
      li.appendChild(input);
      li.appendChild(label);
      list.appendChild(li);
    });
  }

  async refresh() {
    await this.fetch();
    this.render();
  }
}
