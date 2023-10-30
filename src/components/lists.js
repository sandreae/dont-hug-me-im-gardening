import queries from '../queries.js';

class PaginatedList extends HTMLElement {
  constructor() {
    super();

    this.query = null;
    this.currentPage = [];
    this.hasNextPage = false;
    this.hasPreviousPage = false;
  }

  setQuery(query) {
    this.query = query;
  }

  setPageSize(pageSize) {
    this.pageSize = pageSize;
  }

  async nextPage() {
    let options = {
      first: this.pageSize,
      after: this.currentPage[this.pageSize - 1]
        ? this.currentPage[this.pageSize - 1]['cursor']
        : null,
    };

    if (this.search) {
      options.filter = `{ name: { contains: "${this.search}" } }`;
    }

    const { documents, hasNextPage } = await this.query(options);

    this.hasNextPage = hasNextPage;
    this.hasPreviousPage = this.currentPage.length > 0;
    this.currentPage = documents;
    return this.currentPage;
  }

  async previousPage() {
    let options = {
      first: this.pageSize,
      after: this.currentPage[0]['cursor'],
      orderDirection: 'DESC',
    };

    if (this.search) {
      options.filter = `{ name: { contains: "${this.search}" } }`;
    }

    const { documents, hasNextPage } = await this.query(options);
    this.hasPreviousPage = hasNextPage;
    this.hasNextPage = true;
    this.currentPage = Array.from(documents).reverse();
    return this.currentPage;
  }

  reset() {
    this.currentPage = [];
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

export class AnimatedList extends PaginatedList {
  constructor() {
    super();

    const template = document.getElementById('animated-list');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));

    this.itemTag = this.getAttribute('item-tag');
    this.setQuery(queries[this.getAttribute('query')]);
    this.setPageSize(this.getAttribute('page-size'));

    this.initialItems = [];
  }

  static get observedAttributes() {
    return [
      'selected',
      'search',
      'loading',
      'has-next-page',
      'has-previous-page',
      'type',
    ];
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

  get search() {
    return this.getAttribute('search');
  }

  set search(val) {
    if (val) {
      this.setAttribute('search', val);
    } else {
      this.removeAttribute('search');
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
      case 'search': {
        this.refresh();
        break;
      }
      case 'loading': {
        const buttons = this.shadow.querySelectorAll('arrow-button');
        if (newValue) {
          buttons.forEach((e) => e.classList.add('loading'));
        } else {
          buttons.forEach((e) => e.classList.remove('loading'));
        }
        break;
      }
      case 'has-previous-page': {
        const button = this.shadow.querySelector('#previous-button');
        if (!newValue) {
          button.classList.add('disabled');
        } else {
          button.classList.remove('disabled');
        }
        break;
      }
      case 'has-next-page': {
        const button = this.shadow.querySelector('#next-button');
        if (!newValue) {
          button.classList.add('disabled');
        } else {
          button.classList.remove('disabled');
        }
        break;
      }
    }
  }

  connectedCallback() {
    const wrapper = this.shadow.querySelector('#list-wrapper');

    wrapper.style.height = `${this.height}px`;
    wrapper.style.width = this.width ? `${this.width}px` : '100%';

    const nextButton = this.shadow.querySelector('#next-button');
    const previousButton = this.shadow.querySelector('#previous-button');

    this.addEventListener('animationend', () => {
      this.loading = false;
    });

    nextButton.onclick = async (e) => {
      e.preventDefault();
      this.loading = true;
      const newDocuments = await this.nextPage();
      const newPage = this.createNewPage(newDocuments);
      this.pushBack(newPage);
    };

    previousButton.onclick = async (e) => {
      e.preventDefault();
      this.loading = true;
      const newDocuments = await this.previousPage();
      const newPage = this.createNewPage(newDocuments);
      this.pushFront(newPage);
    };

    this.refresh();
  }

  pushBack(newPage) {
    const wrapper = this.shadow.querySelector('#list-wrapper');
    wrapper.appendChild(newPage);

    if (wrapper.children.length > 1) {
      wrapper.children[0].animate(
        [{ top: '0px' }, { top: `${-this.height}px` }],
        {
          fill: 'forwards',
          duration: 1000,
        },
      ).onfinish = (e) => {
        e.target.effect.target.remove();
        this.loading = false;
      };

      wrapper.children[1].animate(
        [{ top: `${this.height}px` }, { top: '0px' }],
        {
          fill: 'forwards',
          duration: 1000,
        },
      );
    } else {
      this.loading = false;
    }
  }

  pushFront(newPage) {
    const wrapper = this.shadow.querySelector('#list-wrapper');
    wrapper.appendChild(newPage);

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
        this.loading = false;
      };
    } else {
      this.loading = false;
    }
  }

  createNewPage(documents) {
    const newPage = document.createElement('div');
    newPage.classList.add('page');

    documents.forEach((doc) => {
      const { documentId } = doc.meta;

      const item = document.createElement(this.itemTag);
      item.id = documentId;
      item.document = doc;
      if (documentId === this.selected) {
        item.setAttribute('selected', true);
      }

      item.onclick = (e) => {
        e.preventDefault();
        this.selected = e.target.id;
      };

      const div = document.createElement('div');
      div.id = item.id;
      div.classList.add('item');
      div.style.height = `${this.height / this.pageSize}px`;
      div.appendChild(item);

      newPage.appendChild(div);
    });

    return newPage;
  }

  async refresh() {
    this.loading = true;
    this.shadow.querySelector('#list-wrapper').innerHTML = '';
    this.reset();
    const newDocuments = await this.nextPage();
    if (newDocuments.length > 0) {
      const newPage = this.createNewPage(newDocuments);
      this.pushBack(newPage);
    } else {
      this.shadow.querySelector('#list-wrapper').innerHTML = 'No items found..';
    }
  }
}
