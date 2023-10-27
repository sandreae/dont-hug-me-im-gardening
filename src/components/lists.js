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
    const previousButton = this.shadow.querySelector('#previous-button');
    const list = this.shadow.querySelector('animated-list');

    list.pageSize = this.pageSize;
    list.addEventListener('animationend', () => {
      this.loading = false;
    });

    nextButton.onclick = async (e) => {
      e.preventDefault();
      this.loading = true;
      await this.nextPage();
      list.pushBack(this.items());
    };

    previousButton.onclick = async (e) => {
      e.preventDefault();
      this.loading = true;
      await this.previousPage();
      list.pushFront(this.items());
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

  get loading() {
    return this.getAttribute('loading');
  }

  set loading(val) {
    if (val) {
      this.setAttribute('loading', val);
    } else {
      this.removeAttribute('loading');
    }
  }

  static get observedAttributes() {
    return ['search', 'has-previous-page', 'has-next-page', 'loading'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'search': {
        this.refresh();
        break;
      }
      case 'loading': {
        const buttons = this.shadow.querySelectorAll('button');
        if (newValue) {
          buttons.forEach((e) => e.classList.add('disabled'));
        } else {
          buttons.forEach((e) => e.classList.remove('disabled'));
        }
        break;
      }
      case 'has-previous-page': {
        const displayStr = newValue ? 'visible' : 'hidden';
        this.shadow.querySelector('#previous-button').style.visibility =
          displayStr;
        break;
      }
      case 'has-next-page': {
        const displayStr = newValue ? 'visible' : 'hidden';
        this.shadow.querySelector('#next-button').style.visibility = displayStr;
        break;
      }
    }
  }

  items() {
    return this.documents.map((garden) => {
      const { name } = garden.fields;
      const { documentId } = garden.meta;

      const div = document.createElement('div');
      if (documentId === this.selected) {
        div.setAttribute('selected', true);
      }
      div.textContent = name;
      div.id = documentId;
      div.style.height = '100%';
      div.style.width = '100%';
      div.style.display = 'flex';
      div.style.flexDirection = 'column';
      div.style.alignItems = 'center';
      div.style.justifyContent = 'center';

      div.onclick = (e) => {
        e.preventDefault();
        const list = this.shadow.querySelector('animated-list');
        list.selected = e.target.id;
        setGardenId(e.target.id);
      };
      return div;
    });
  }

  render() {
    const list = this.shadow.querySelector('animated-list');
    list.pageSize = this.pageSize;
    list.clearItems();
    list.addItems(this.items());
  }

  async refresh() {
    this.reset();
    await this.nextPage();
    this.render();
  }
}

export class SpeciesList extends PaginatedList {
  constructor() {
    super();

    const template = document.getElementById('species-list');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));

    this.setRequest(getAllSpecies);
    this.setPageSize(SPECIES_PAGE_SIZE);
  }

  static get observedAttributes() {
    return ['has-previous-page', 'has-next-page', 'loading'];
  }

  get loading() {
    return this.getAttribute('loading');
  }

  set loading(val) {
    if (val) {
      this.setAttribute('loading', val);
    } else {
      this.removeAttribute('loading');
    }
  }

  connectedCallback() {
    const nextButton = this.shadow.querySelector('#next-button');
    const previousButton = this.shadow.querySelector('#previous-button');
    const list = this.shadow.querySelector('animated-list');

    list.pageSize = this.pageSize;
    list.addEventListener('animationend', () => (this.loading = false));

    nextButton.onclick = async (e) => {
      e.preventDefault();
      this.loading = true;
      await this.nextPage();
      list.pushBack(this.items());
    };

    previousButton.onclick = async (e) => {
      e.preventDefault();
      this.loading = true;
      await this.previousPage();
      list.pushFront(this.items());
    };

    this.refresh();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'loading': {
        const buttons = this.shadow.querySelectorAll('button');
        if (newValue) {
          buttons.forEach((e) => e.classList.add('disabled'));
        } else {
          buttons.forEach((e) => e.classList.remove('disabled'));
        }
        break;
      }
      case 'has-previous-page': {
        const displayStr = newValue ? 'visible' : 'hidden';
        this.shadow.querySelector('#previous-button').style.visibility =
          displayStr;
        break;
      }
      case 'has-next-page': {
        const displayStr = newValue ? 'visible' : 'hidden';
        this.shadow.querySelector('#next-button').style.visibility = displayStr;
        break;
      }
    }
  }

  items() {
    return this.documents.map((species) => {
      const { img } = species.fields;
      const { documentId } = species.meta;

      const image = document.createElement('img');
      if (documentId === this.selected) {
        image.setAttribute('selected', true);
      }
      image.src = `http://localhost:2020/blobs/${img.meta.documentId}`;
      image.id = documentId;
      image.style.height = '100%';
      image.style.width = '100%';

      image.onclick = (e) => {
        e.preventDefault();
        const list = this.shadow.querySelector('animated-list');
        list.selected = e.target.id;
        setSpeciesId(e.target.id);
        setSpeciesImg(e.target.src);
      };

      return image;
    });
  }

  render() {
    const list = this.shadow.querySelector('animated-list');
    list.clearItems();
    list.addItems(this.items());
  }

  async refresh() {
    this.reset();
    await this.nextPage();
    this.render();
  }
}

export class AnimatedList extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('animated-list');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));

    this.initialItems = [];
  }

  static get observedAttributes() {
    return ['selected'];
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

  get height() {
    return this.getAttribute('height');
  }

  set height(val) {
    if (val) {
      this.setAttribute('height', val);
    } else {
      this.removeAttribute('height');
    }
  }

  get width() {
    return this.getAttribute('width');
  }

  set width(val) {
    if (val) {
      this.setAttribute('width', val);
    } else {
      this.removeAttribute('width');
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'selected': {
        const items = this.shadow.querySelectorAll('.item');

        items.forEach((item) => {
          if (item.id == newValue) {
            item.setAttribute('selected', true);
          } else {
            item.removeAttribute('selected');
          }
        });
        break;
      }
    }
  }

  connectedCallback() {
    const wrapper = this.shadow.querySelector('div');

    wrapper.style.height = `${this.height}px`;
    wrapper.style.width = this.width ? `${this.width}px` : '100%';
    this.shadow.appendChild(wrapper);

    this.addItems(this.initialItems);
  }

  pushBack(items) {
    this.addItems(items);
    const wrapper = this.shadow.querySelector('div');

    if (wrapper.children.length > 1) {
      wrapper.children[0].animate(
        [{ top: '0px' }, { top: `${-this.height}px` }],
        {
          fill: 'forwards',
          duration: 1000,
        },
      ).onfinish = (e) => {
        e.target.effect.target.remove();
        this.dispatchEvent(new Event('animationend'));
      };

      wrapper.children[1].animate(
        [{ top: `${this.height}px` }, { top: '0px' }],
        {
          fill: 'forwards',
          duration: 1000,
        },
      );
    } else {
      this.dispatchEvent(new Event('animationend'));
    }
  }

  pushFront(items) {
    this.addItems(items);
    const wrapper = this.shadow.querySelector('div');

    if (wrapper.children.length > 1) {
      wrapper.children[1].animate(
        [{ top: `${-this.height}px` }, { top: '0px' }],
        {
          fill: 'forwards',
          duration: 1000,
        },
      );

      wrapper.children[0].animate(
        [{ top: '0px' }, { top: `${this.height}px` }],
        {
          fill: 'forwards',
          duration: 1000,
        },
      ).onfinish = (e) => {
        e.target.effect.target.remove();
        this.dispatchEvent(new Event('animationend'));
      };
    } else {
      this.dispatchEvent(new Event('animationend'));
    }
  }

  addItems(items) {
    const nextPage = document.createElement('div');
    nextPage.classList.add('page');

    items.forEach((item) => {
      const div = document.createElement('div');
      div.id = item.id;
      div.classList.add('item');
      div.style.height = `${this.height / this.pageSize}px`;
      div.appendChild(item);
      nextPage.appendChild(div);
    });

    const wrapper = this.shadow.querySelector('div');
    wrapper.appendChild(nextPage);
  }

  clearItems() {
    this.shadow.querySelector('div').innerHTML = '';
  }
}
