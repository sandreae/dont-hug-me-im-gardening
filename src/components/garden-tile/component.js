import { BLOBS_ENDPOINT } from '../../constants.js';
import { createTile } from '../../queries.js';
import { template } from './template.js';

export class GardenTile extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));

    this.onclick = async (e) => {
      e.preventDefault();

      if (!window.CURRENT_GARDEN || !window.CURRENT_SPRITE) {
        window.alert(
          'Oops! Create a garden and choose a sprite before placing tiles.',
        );
        return;
      }

      this.sprite = window.CURRENT_SPRITE;
      this.spriteId = this.sprite.meta.documentId;

      await createTile(
        this.pos_x,
        this.pos_y,
        window.CURRENT_SPRITE.meta.documentId,
        window.CURRENT_GARDEN.meta.documentId,
      );
    };
  }

  get spriteId() {
    return this.getAttribute('sprite-id');
  }

  set spriteId(val) {
    if (val && val.length != 0) {
      this.setAttribute('sprite-id', val);
    } else {
      this.removeAttribute('sprite-id');
    }
  }

  static get observedAttributes() {
    return ['sprite-id'];
  }

  attributeChangedCallback(name) {
    switch (name) {
      case 'sprite-id': {
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
}
