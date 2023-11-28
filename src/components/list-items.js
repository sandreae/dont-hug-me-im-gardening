import { setCurrentGarden, getKeyPair, setCurrentSprite } from '../app.js';
import { deleteGarden } from '../queries.js';
import { BLOBS_ENDPOINT } from '../constants.js';
import { confirmAction } from '../utils.js';

export class GardenListItem extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById('garden-list-item');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));

    this.cb = () => {
      setCurrentGarden(this.document);
    };
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
        deleteButton.onclick = async () => {
          console.log('DELETE CLICKED');
          if (
            await confirmAction('Are you sure you want to delete this garden?')
          ) {
            await deleteGarden(this.id);
            if (window.GARDEN_ID == this.id) {
              setCurrentGarden(null);
            }
            console.log('REFRESH GARDEN LIST');
            document.querySelector('#garden-list').refresh();
          }
        };

        item.appendChild(deleteButton);
      }
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

    this.cb = () => {
      setCurrentSprite(this.document);
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
