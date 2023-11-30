import queries from '../../queries.js';
import { PaginatedList } from './paginated-list.js';

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
    this.height = this.hasAttribute('height')
      ? this.getAttribute('height')
      : 500;
    this.width = this.hasAttribute('width') ? this.getAttribute('width') : 200;
    this.rows = this.hasAttribute('rows') ? this.getAttribute('rows') : 2;
    this.pageSize = this.hasAttribute('page-size')
      ? this.getAttribute('page-size')
      : 10;
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
        if (newValue) {
          button.classList.remove('disabled');
        } else {
          button.classList.add('disabled');
        }
        break;
      }
      case 'has-next-page': {
        const button = this.shadow.querySelector('#next-button');
        if (newValue) {
          button.classList.remove('disabled');
        } else {
          button.classList.add('disabled');
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

    newPage.style.height = `${this.height}px`;
    newPage.classList.add('page');

    documents.forEach((doc) => {
      const { documentId } = doc.meta;

      const item = document.createElement(this.itemTag);
      item.id = documentId;
      item.document = doc;

      const div = document.createElement('div');
      div.id = item.id;
      div.classList.add('item');
      const height = this.height / (this.pageSize / this.rows);
      div.style.height = `${height}px`;
      div.style.width = `${this.width / this.rows}px`;

      if (documentId === this.selected) {
        div.setAttribute('selected', true);
      }

      div.appendChild(item);

      newPage.appendChild(div);
    });

    return newPage;
  }

  async refresh() {
    this.loading = true;
    this.currentPage = [];
    this.hasNextPage = false;
    this.hasPreviousPage = false;

    this.shadow.querySelector('#list-wrapper').innerHTML = '';
    const newDocuments = await this.nextPage();

    if (newDocuments.length > 0) {
      const newPage = this.createNewPage(newDocuments);
      this.pushBack(newPage);
    } else {
      this.shadow.querySelector('#list-wrapper').innerHTML = 'No items found..';
    }
  }
}
