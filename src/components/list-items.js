import { setGardenId, getKeyPair } from '../app.js';
import { deleteGarden } from '../queries.js';
import { BLOBS_ENDPOINT } from '../constants.js';

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
      const { name, columns, rows } = this.document.fields;
      const { documentId, owner } = this.document.meta;

      this.shadow.querySelector('#name').innerText = name;
      this.shadow.querySelector(
        '#dimensions',
      ).innerText = `${columns} x ${rows}`;

      const item = this.shadow.querySelector('div');
      item.id = documentId;
      item.name = name;

      const keyPair = getKeyPair();
      if (owner == keyPair.publicKey()) {
        const deleteButton = document.createElement('delete-garden-button');
        deleteButton.documentId = documentId;
        deleteButton.onclick = async (e) => {
          e.preventDefault();
          const result = confirm(
            'Are you sure you want to delete this garden?',
          );
          if (result) {
            await deleteGarden(this.documentId);
            if (window.GARDEN_ID == this.documentId) {
              setGardenId(null);
            }
            document.querySelector('#garden-list').refresh();
          }
        };

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
    image.src = BLOBS_ENDPOINT + img.meta.documentId;
    image.alt = description;
    image.id = documentId;
  }
}
