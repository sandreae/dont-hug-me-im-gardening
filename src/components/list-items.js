import { setGardenId, setSpriteId, setSpriteImg } from '../globals.js';

export class GardenListItem extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById('garden-list-item');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
  }

  connectedCallback() {
    const div = this.shadow.querySelector('div');
    if (this.document) {
      const { name } = this.document.fields;
      const { documentId } = this.document.meta;

      div.textContent = name;
      div.id = documentId;

      div.onclick = (e) => {
        setGardenId(e.target.id);
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
