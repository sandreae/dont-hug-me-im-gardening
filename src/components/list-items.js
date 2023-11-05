import { setGardenId, setSpriteId, setSpriteImg, getKeyPair } from '../app.js';

export class GardenListItem extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById('garden-list-item');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
  }

  connectedCallback() {
    if (this.document) {
      const { name, width, height } = this.document.fields;
      const { documentId, owner } = this.document.meta;

      this.shadow.querySelector('#name').innerText = name;
      this.shadow.querySelector(
        '#dimensions',
      ).innerText = `${width} x ${height}`;

      const item = this.shadow.querySelector('div');
      item.id = documentId;
      item.name = name;

      const keyPair = getKeyPair();
      if (owner == keyPair.publicKey()) {
        const deleteButton = document.createElement('delete-garden-button');
        deleteButton.documentId = documentId;

        item.appendChild(deleteButton);
      }

      item.onclick = (e) => {
        e.preventDefault();
        setGardenId(documentId);
      };
    }
  }
}

export class SpriteListItem extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('sprite-list-item');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
  }

  connectedCallback() {
    const { img, description } = this.document.fields;
    const { documentId } = this.document.meta;

    const image = this.shadow.querySelector('img');
    image.src = `http://localhost:2020/blobs/${img.meta.documentId}`;
    image.alt = description;
    image.id = documentId;
    image.onclick = (e) => {
      setSpriteId(e.target.id);
      setSpriteImg(e.target.src);
    };
  }
}
