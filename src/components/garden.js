import { BLOBS_ENDPOINT } from '../constants.js';
import { createTile, getGardenTiles } from '../queries.js';

export class GardenTile extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('garden-tile');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
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

  static get observedAttributes() {
    return ['id'];
  }

  attributeChangedCallback(name) {
    switch (name) {
      case 'id': {
        let img = this.shadow.querySelector('img');
        if (this.sprite) {
          img.src = BLOBS_ENDPOINT + this.sprite.fields.img.meta.documentId;
          img.alt = this.sprite.fields.description;
          img.style.opacity = 1;
        } else {
          img.style.opacity = 0;
        }
        break;
      }
    }
  }

  connectedCallback() {
    this.onclick = async (e) => {
      e.preventDefault();

      if (!window.CURRENT_GARDEN || !window.CURRENT_SPRITE) {
        window.alert(
          'Oops! Create a garden and choose a sprite before placing tiles.',
        );
        return;
      }

      this.sprite = window.CURRENT_SPRITE;
      this.id = this.sprite.meta.documentId;

      const tileId = await createTile(
        this.pos_x,
        this.pos_y,
        window.CURRENT_SPRITE.meta.documentId,
        window.CURRENT_GARDEN.meta.documentId,
      );

      console.log('Created tile: ', tileId);
    };
  }
}

export class Garden extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById('garden-main');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));

    this.tiles = [];
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
        this.tiles = [];
        this.renderTiles();
        if (this.id) {
          this.fetch();
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
          this.renderTiles();
        }
        break;
      }
      case 'columns': {
        if (newValue != oldValue) {
          const garden = this.shadow.querySelector('#garden');
          garden.style.width = `${newValue * 75}px`;
          garden.style.minWidth = `${newValue * 75}px`;
          this.renderTiles();
        }
        break;
      }
    }
  }

  async fetch() {
    if (!this.id || !window.CURRENT_GARDEN) {
      this.tiles = [];
      return;
    }

    let { name, columns, rows } = window.CURRENT_GARDEN.fields;

    this.name = name;
    this.columns = columns;
    this.rows = rows;

    const baseTiles = this.shadow.querySelectorAll('garden-tile');

    let hasNextPage = true;
    let endCursor = null;
    let documents = [];

    while (hasNextPage) {
      const tilesResponse = await getGardenTiles(this.id, 5, endCursor);
      ({ hasNextPage, endCursor, documents } = tilesResponse);
      for (let tileDocument of documents) {
        let baseTile = Array.from(baseTiles).find((tile) => {
          return (
            tileDocument.fields.pos_x === Number(tile.pos_x) &&
            tileDocument.fields.pos_y === Number(tile.pos_y)
          );
        });

        if (!baseTile.sprite) {
          baseTile.sprite = tileDocument.fields.sprite;
          baseTile.id = tileDocument.meta.documentId;
        }
      }
    }
  }

  renderTiles() {
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
}
