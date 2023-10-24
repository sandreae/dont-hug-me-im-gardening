import { createPlant, getPlantsForGarden } from '../queries.js';

export class GardenTile extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const template = document.getElementById('garden-tile');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));

    this.onclick = async (e) => {
      e.preventDefault();

      if (!window.GARDEN_ID || !window.SPECIES_ID || !window.SPECIES_IMG) {
        window.alert(
          'Oops! Create a garden and choose a species before planting.',
        );
        return;
      }

      const target = e.target;
      const index = target.id;
      const createdAt = Math.floor(new Date().getTime() / 1000.0);
      const currentSpeciesId = window.SPECIES_ID;
      const plantId = await createPlant(
        index,
        createdAt,
        currentSpeciesId,
        window.GARDEN_ID,
      );

      console.log('Created plant: ', plantId);

      const currentImage = target.shadow.querySelector('img');

      if (!currentImage) {
        const newImage = document.createElement('img');
        newImage.src = window.SPECIES_IMG;
        target.shadow.appendChild(newImage);
        return;
      } else {
        currentImage.src = window.SPECIES_IMG;
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

    this.plants = [];
  }

  connectedCallback() {
    for (let index = 0; index < 192; index++) {
      let tile = document.createElement('garden-tile');
      tile.id = index;
      this.shadow.appendChild(tile);
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

  static get observedAttributes() {
    return ['id'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name == 'id') {
      if (newValue) {
        this.refresh();
      }
    }
  }

  async fetch() {
    if (!this.id) {
      return;
    }

    const response = await getPlantsForGarden(this.id, 100);
    let { hasNextPage, endCursor, documents } = response;
    let plants = documents;

    while (hasNextPage) {
      const response = await getPlantsForGarden(this.id, 100, endCursor);
      ({ hasNextPage, endCursor, documents } = response);
      plants = plants.concat(documents);
    }

    this.plants = plants;
  }

  render() {
    let gardenTiles = this.shadow.querySelectorAll('garden-tile');

    Array.from(gardenTiles).forEach((tile) => {
      let currentPosition = tile.id;

      let newPlant = this.plants.find((plant) => {
        return plant.fields.index === Number(currentPosition);
      });

      if (!newPlant) {
        const img = tile.shadow.querySelector('img');
        if (img) {
          tile.shadow.removeChild(img);
        }
        return;
      }

      const { img } = newPlant.fields.species.fields;
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
