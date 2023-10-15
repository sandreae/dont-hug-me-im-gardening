import queries from '../queries.js';

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
