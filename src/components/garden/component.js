import { getGardenSpriteTiles } from '../../queries.js';
import { template } from './template.js';

export class Garden extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));

    this.spriteTiles = [];
    this.rows = this.hasAttribute('rows') ? this.getAttribute('rows') : 12;
    this.columns = this.hasAttribute('columns')
      ? this.getAttribute('columns')
      : 16;
    this.name = this.hasAttribute('name')
      ? this.getAttribute('name')
      : 'Select or create a garden -->';
  }

  connectedCallback() {
    this.shadow.querySelector('#heading').textContent = this.name;
    this.renderEmptyTiles();
  }

  get id() {
    return this.getAttribute('id');
  }

  set id(val) {
    if (val && val.length != 0) {
      this.setAttribute('id', val);
    } else {
      this.removeAttribute('id');
    }
  }

  get name() {
    return this.getAttribute('name');
  }

  set name(val) {
    if (val && val.length != 0) {
      this.setAttribute('name', val);
    } else {
      this.removeAttribute('name');
    }
  }

  get columns() {
    return this.getAttribute('columns');
  }

  set columns(val) {
    if (val && val.length != 0) {
      this.setAttribute('columns', val);
    } else {
      this.removeAttribute('columns');
    }
  }

  get rows() {
    return this.getAttribute('rows');
  }

  set rows(val) {
    if (val && val.length != 0) {
      this.setAttribute('rows', val);
    } else {
      this.removeAttribute('rows');
    }
  }

  static get observedAttributes() {
    return ['id', 'name', 'columns', 'rows'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'id': {
        this.spriteTiles = [];
        this.renderEmptyTiles();
        if (newValue) {
          this.renderSprites();
        }
        break;
      }
      case 'name': {
        this.shadow.querySelector('#heading').textContent = newValue;
        break;
      }
      case 'rows': {
        if (newValue != oldValue) {
          const garden = this.shadow.querySelector('#garden');
          garden.style.height = `${newValue * 75}px`;
          this.renderEmptyTiles();
        }
        break;
      }
      case 'columns': {
        if (newValue != oldValue) {
          const garden = this.shadow.querySelector('#garden');
          garden.style.width = `${newValue * 75}px`;
          garden.style.minWidth = `${newValue * 75}px`;
          this.renderEmptyTiles();
        }
        break;
      }
    }
  }

  renderEmptyTiles() {
    const garden = this.shadow.querySelector('#garden');
    garden.innerHTML = '';

    for (let pos_x = 0; pos_x < this.columns; pos_x++) {
      for (let pos_y = 0; pos_y < this.rows; pos_y++) {
        let tile = document.createElement('garden-tile');
        tile.pos_x = pos_x;
        tile.pos_y = pos_y;

        garden.appendChild(tile);
      }
    }
  }

  async renderSprites() {
    if (!this.id || !window.CURRENT_GARDEN) {
      this.spriteTiles = [];
      return;
    }

    let { name, columns, rows } = window.CURRENT_GARDEN.fields;

    this.name = name;
    this.columns = columns;
    this.rows = rows;

    const currentTiles = this.shadow.querySelectorAll('garden-tile');

    let hasNextPage = true;
    let endCursor = null;
    let documents = [];

    while (hasNextPage) {
      const tilesResponse = await getGardenSpriteTiles(this.id, 50, endCursor);
      ({ hasNextPage, endCursor, documents } = tilesResponse);
      for (let newTile of documents) {
        let currentTile = Array.from(currentTiles).find((tile) => {
          return (
            newTile.fields.pos_x === Number(tile.pos_x) &&
            newTile.fields.pos_y === Number(tile.pos_y)
          );
        });

        if (!currentTile.sprite) {
          currentTile.sprite = newTile.fields.sprite;
          currentTile.spriteId = newTile.meta.documentId;
        }
      }
    }
  }
}
