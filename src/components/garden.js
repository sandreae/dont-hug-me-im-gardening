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
  }
}

export class Garden extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById('garden-main');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
  }

  connectedCallback() {
    for (let index = 0; index < 192; index++) {
      let element = document.createElement('garden-tile');
      element.id = index;
      element.onclick = this.onClick;
      this.shadow.appendChild(element);
    }

    setInterval(this.refreshPlants.bind(this), 1000);
  }

  async onClick(e) {
    e.preventDefault();
    const target = e.target;

    const gardenId = window.selectedGarden;
    const index = target.id;

    if (!gardenId) {
      return;
    }

    const createdAt = Math.floor(new Date().getTime() / 1000.0);
    const currentSpeciesId = window.selectedSpecies;
    const plantId = await createPlant(
      index,
      createdAt,
      currentSpeciesId,
      gardenId,
    );

    const currentImage = target.shadow.querySelector('img');
    if (!currentImage) {
      const newImage = document.createElement('img');
      newImage.src = window.selectedSpeciesImgSrc;
      target.shadow.appendChild(newImage);
      return;
    } else {
      currentImage.src = window.selectedSpeciesImgSrc;
    }

    console.log('Created plant: ', plantId);
  }

  async refreshPlants() {
    const gardenId = window.selectedGarden;

    if (gardenId === undefined) {
      return;
    }

    const newPlants = await getPlantsForGarden(gardenId);
    let gardenTiles = this.shadow.querySelectorAll('garden-tile');

    Array.from(gardenTiles).forEach((tile) => {
      let currentPosition = tile.id;

      let newPlant = Array.from(newPlants).find((plant) => {
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
        console.log(tile);
        return;
      }

      if (src !== currentImage.src) {
        currentImage.src = src;
      }
    });
  }
}
