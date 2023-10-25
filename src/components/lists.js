import { GARDENS_PAGE_SIZE, SPECIES_PAGE_SIZE } from '../constants.js';
import { setGardenId, setSpeciesId, setSpeciesImg } from '../globals.js';
import { getAllGardens, getAllSpecies } from '../queries.js';

class PaginatedList extends HTMLElement {
  constructor() {
    super();

    this.request = null;
    this.pageSize = 20;
    this.documents = [];
    this.hasNextPage = false;
    this.hasPreviousPage = false;
  }

  setRequest(request) {
    this.request = request;
  }

  setPageSize(pageSize) {
    this.pageSize = pageSize;
  }

  async nextPage() {
    let options = {
      first: this.pageSize,
      after: this.documents[this.pageSize - 1]
        ? this.documents[this.pageSize - 1]['cursor']
        : null,
    };

    if (this.search) {
      options.filter = `{ name: { contains: "${this.search}" } }`;
    }

    const { documents, hasNextPage } = await this.request(options);

    this.hasNextPage = hasNextPage;
    this.hasPreviousPage = this.documents.length > 0;
    this.documents = documents;
  }

  async previousPage() {
    let options = {
      first: this.pageSize,
      after: this.documents[0]['cursor'],
      orderDirection: 'DESC',
    };

    if (this.search) {
      options.filter = `{ name: { contains: "${this.search}" } }`;
    }

    const { documents, hasNextPage } = await this.request(options);
    this.hasPreviousPage = hasNextPage;
    this.hasNextPage = true;
    this.documents = Array.from(documents).reverse();
  }

  reset() {
    this.documents = [];
    this.hasNextPage = false;
    this.hasPreviousPage = false;
  }

  get hasPreviousPage() {
    return this.getAttribute('has-previous-page');
  }

  set hasPreviousPage(val) {
    if (val) {
      this.setAttribute('has-previous-page', val);
    } else {
      this.removeAttribute('has-previous-page');
    }
  }

  get hasNextPage() {
    return this.getAttribute('has-next-page');
  }

  set hasNextPage(val) {
    if (val) {
      this.setAttribute('has-next-page', val);
    } else {
      this.removeAttribute('has-next-page');
    }
  }
}

export class GardenSearch extends PaginatedList {
  constructor() {
    super();

    const template = document.getElementById('garden-search');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));

    this.setRequest(getAllGardens);
    this.setPageSize(GARDENS_PAGE_SIZE);
  }

  connectedCallback() {
    const input = this.shadow.querySelector('input');
    input.oninput = (e) => {
      e.preventDefault();
      this.search = e.target.value;
    };

    const nextButton = this.shadow.querySelector('#next-button');
    nextButton.onclick = async (e) => {
      e.preventDefault();
      if (this.hasNextPage == 'true') {
        await this.nextPage();
        this.render();
      }
    };

    const previousButton = this.shadow.querySelector('#previous-button');
    previousButton.onclick = async (e) => {
      e.preventDefault();
      await this.previousPage();
      this.render();
    };

    this.nextPage().then(() => {
      this.render();
    });
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
    return ['selected', 'search', 'has-previous-page', 'has-next-page'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'selected': {
        const inputs = this.shadow.querySelectorAll('input');
        inputs.forEach((input) => {
          input.checked = input.id == newValue;
        });
        break;
      }
      case 'search': {
        this.refresh();
        break;
      }
      case 'has-previous-page': {
        const displayStr = newValue ? 'inline' : 'none';
        this.shadow.querySelector('#previous-button').style.display =
          displayStr;
        break;
      }
      case 'has-next-page': {
        const displayStr = newValue ? 'inline' : 'none';
        this.shadow.querySelector('#next-button').style.display = displayStr;
        break;
      }
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
    this.reset();
    await this.nextPage();
    this.render();
  }
}

export class SpeciesListV2 extends PaginatedList {
  constructor() {
    super();

    const template = document.getElementById('species-list');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));

    this.setRequest(getAllSpecies);
    this.setPageSize(SPECIES_PAGE_SIZE);
  }

  connectedCallback() {
    const nextButton = this.shadow.querySelector('#next-button');
    nextButton.onclick = async (e) => {
      e.preventDefault();
      if (this.hasNextPage == 'true') {
        await this.nextPage();
        this.render();
      }
    };

    const previousButton = this.shadow.querySelector('#previous-button');
    previousButton.onclick = async (e) => {
      e.preventDefault();
      await this.previousPage();
      this.render();
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

  static get observedAttributes() {
    return ['selected', 'has-previous-page', 'has-next-page'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'selected': {
        const inputs = this.shadow.querySelectorAll('input');
        inputs.forEach((input) => {
          input.checked = input.id == newValue;
        });
        break;
      }
      case 'has-previous-page': {
        const displayStr = newValue ? 'inline' : 'none';
        this.shadow.querySelector('#previous-button').style.display =
          displayStr;
        break;
      }
      case 'has-next-page': {
        const displayStr = newValue ? 'inline' : 'none';
        this.shadow.querySelector('#next-button').style.display = displayStr;
        break;
      }
    }
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
    this.reset();
    await this.nextPage();
    this.render();
  }
}
