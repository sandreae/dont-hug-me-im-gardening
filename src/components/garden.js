import { createTile, getGardenTiles } from '../queries.js';

export class GardenTile extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('garden-tile');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
  }

  connectedCallback() {
    this.onclick = async (e) => {
      e.preventDefault();

      if (!window.GARDEN_ID || !window.SPRITE_ID || !window.SPRITE_IMG) {
        window.alert(
          'Oops! Create a garden and choose a sprite before placing tiles.',
        );
        return;
      }

      const target = e.target;
      const pos_x = target.pos_x;
      const pos_y = target.pos_y;
      const timestamp = Math.floor(new Date().getTime() / 1000.0);
      const currentSpeciesId = window.SPRITE_ID;
      const tileId = await createTile(
        pos_x,
        pos_y,
        timestamp,
        currentSpeciesId,
        window.GARDEN_ID,
      );

      console.log('Created tile: ', tileId);

      const currentImage = target.shadow.querySelector('img');

      if (!currentImage) {
        const newImage = document.createElement('img');
        newImage.src = window.SPRITE_IMG;
        target.shadow.appendChild(newImage);
        return;
      } else {
        currentImage.src = window.SPRITE_IMG;
      }
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
    this.rows = this.hasAttribute('rows') ? this.getAttribute('rows') : 16;
    this.columns = this.hasAttribute('columns')
      ? this.getAttribute('columns')
      : 16;
    this.name = this.hasAttribute('name')
      ? this.getAttribute('name')
      : 'Select a garden -->';
  }

  connectedCallback() {
    this.shadow.querySelector('#heading').textContent = this.name;

    const garden = this.shadow.querySelector('#garden');

    for (let pos_x = 0; pos_x < this.columns; pos_x++) {
      for (let pos_y = 0; pos_y < this.rows; pos_y++) {
        let tile = document.createElement('garden-tile');
        tile.pos_x = pos_x;
        tile.pos_y = pos_y;
        garden.appendChild(tile);
      }
    }
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

  static get observedAttributes() {
    return ['id', 'name'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name == 'id') {
      this.refresh();
    } else if (name == 'name') {
      this.shadow.querySelector('#header').textContent = newValue;
    }
  }

  async fetch() {
    if (!this.id) {
      this.tiles = [];
      return;
    }

    const response = await getGardenTiles(this.id, 100);
    let { hasNextPage, endCursor, documents } = response;
    let tiles = documents;

    while (hasNextPage) {
      const response = await getGardenTiles(this.id, 100, endCursor);
      ({ hasNextPage, endCursor, documents } = response);
      tiles = tiles.concat(documents);
    }

    this.tiles = tiles;
  }

  render() {
    this.shadow.querySelector('#heading').textContent = this.name;

    let gardenTiles = this.shadow.querySelectorAll('garden-tile');

    Array.from(gardenTiles).forEach((tile) => {
      let pos_x = tile.pos_x;
      let pos_y = tile.pos_y;

      let newTile = this.tiles.find((tile) => {
        return (
          tile.fields.pos_x === Number(pos_x) &&
          tile.fields.pos_y === Number(pos_y)
        );
      });

      if (!newTile) {
        const img = tile.shadow.querySelector('img');
        if (img) {
          tile.shadow.removeChild(img);
        }
        return;
      }

      const { img } = newTile.fields.sprite.fields;
      const src = `http://localhost:2020/blobs/${img.meta.documentId}`;

      const currentImage = tile.shadow.querySelector('img');

      if (!currentImage) {
        const newImage = document.createElement('img');
        newImage.src = src;
        tile.shadow.appendChild(newImage);
      } else if (src !== currentImage.src) {
        tile.shadow.removeChild(currentImage);
        const newImage = document.createElement('img');
        newImage.src = src;
        tile.shadow.appendChild(newImage);
      }
    });
  }

  async refresh() {
    await this.fetch();
    this.render();
  }
}
