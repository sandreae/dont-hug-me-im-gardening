import { BLOBS_ENDPOINT } from '../constants.js';
import {
  createTile,
  getGarden,
  getGardenTiles,
  getSprite,
} from '../queries.js';

export class GardenTile extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('garden-tile');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
  }

  connectedCallback() {
    this.render();

    this.onclick = async (e) => {
      e.preventDefault();

      const spriteList = document.querySelector(
        'animated-list[id="sprite-list"]',
      );
      const selectedSpriteId = spriteList.getAttribute('selected');
      console.log(selectedSpriteId);
      if (!window.GARDEN_ID || !selectedSpriteId) {
        window.alert(
          'Oops! Create a garden and choose a sprite before placing tiles.',
        );
        return;
      }

      const tileId = await createTile(
        this.pos_x,
        this.pos_y,
        selectedSpriteId,
        window.GARDEN_ID,
      );

      console.log('Created tile: ', tileId);

      this.sprite = await getSprite(selectedSpriteId);
      this.render();
    };
  }

  render() {
    if (this.sprite) {
      let img = this.shadow.querySelector('img');
      img.src = BLOBS_ENDPOINT + this.sprite.fields.img.meta.documentId;
      img.alt = this.sprite.fields.description;
    }
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

  attributeChangedCallback(name) {
    switch (name) {
      case 'id': {
        this.refresh();
        break;
      }
      case 'name': {
        this.render();
        break;
      }
      case 'rows': {
        this.render();
        break;
      }
      case 'columns': {
        this.render();
        break;
      }
    }
  }

  async fetch() {
    if (!this.id) {
      this.tiles = [];
      return;
    }

    const gardenResponse = await getGarden(this.id);
    let { name, columns, rows } = gardenResponse.fields;

    this.name = name;
    this.columns = columns;
    this.rows = rows;

    const tilesResponse = await getGardenTiles(this.id, 100);
    let { hasNextPage, endCursor, documents } = tilesResponse;
    let tiles = documents;

    while (hasNextPage) {
      const tilesResponse = await getGardenTiles(this.id, 100, endCursor);
      ({ hasNextPage, endCursor, documents } = tilesResponse);
      tiles = tiles.concat(documents);
    }

    this.tiles = tiles;
  }

  render() {
    this.shadow.querySelector('#heading').textContent = this.name;

    const garden = this.shadow.querySelector('#garden');
    garden.innerHTML = '';
    garden.style.width = `${this.columns * 75}px`;
    garden.style.height = `${this.rows * 75}px`;

    for (let pos_x = 0; pos_x < this.columns; pos_x++) {
      for (let pos_y = 0; pos_y < this.rows; pos_y++) {
        let tileDocument = this.tiles.find((tiles) => {
          return (
            tiles.fields.pos_x === Number(pos_x) &&
            tiles.fields.pos_y === Number(pos_y)
          );
        });

        let tile = document.createElement('garden-tile');
        tile.pos_x = pos_x;
        tile.pos_y = pos_y;
        tile.sprite = tileDocument ? tileDocument.fields.sprite : null;

        garden.appendChild(tile);
      }
    }
  }

  async refresh() {
    if (!this.id) {
      this.name = null;
      this.columns = null;
      this.rows = null;
    }
    await this.fetch();
    this.render();
  }
}
