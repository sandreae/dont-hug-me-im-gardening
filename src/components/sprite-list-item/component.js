import { setCurrentSprite } from '../../app.js';
import { template } from './template.js'
import { BLOBS_ENDPOINT } from '../../constants.js';

export class SpriteListItem extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));

    this.onclick = (e) => {
      e.preventDefault();
      setCurrentSprite(this.document);
      this.parentElement.selected = this.id;
    };
  }

  connectedCallback() {
    const { img, description } = this.document.fields;
    const { documentId } = this.document.meta;

    const image = this.shadow.querySelector('img');
    image.src = BLOBS_ENDPOINT + img.meta.documentId;
    image.alt = description;
    image.id = documentId;
  }
}
