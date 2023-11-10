import { createTile, getGarden, getGardenTiles } from '../queries.js';

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
      const currentSpeciesId = window.SPRITE_ID;

      let currentSprite = target.shadow.querySelector('img');

      if (!currentSprite) {
        currentSprite = document.createElement('img');
        target.shadow.appendChild(currentSprite);
      }

      if (currentSprite.src == window.SPRITE_IMG) {
        return;
      }

      const tileId = await createTile(
        pos_x,
        pos_y,
        currentSpeciesId,
        window.GARDEN_ID,
      );

      console.log('Created tile: ', tileId);

      currentSprite.src = window.SPRITE_IMG;
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
        this.renderGridTiles();
        break;
      }
      case 'columns': {
        this.renderGridTiles();
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

  renderGridTiles() {
    const garden = this.shadow.querySelector('#garden');
    garden.innerHTML = '';
    garden.style.width = `${this.columns * 75}px`;
    garden.style.height = `${this.rows * 75}px`;

    for (let pos_x = 0; pos_x < this.columns; pos_x++) {
      for (let pos_y = 0; pos_y < this.rows; pos_y++) {
        let tile = document.createElement('garden-tile');
        tile.pos_x = pos_x;
        tile.pos_y = pos_y;
        garden.appendChild(tile);
      }
    }
  }

  render() {
    this.shadow.querySelector('#heading').textContent = this.name;

    this.renderGridTiles();
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
    if (!this.id) {
      this.name = '';
      this.columns = 16;
      this.rows = 12;
    }
    await this.fetch();
    this.render();
  }
}
