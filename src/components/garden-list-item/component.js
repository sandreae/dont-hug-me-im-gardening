import { setCurrentGarden, getKeyPair } from '../../app.js';
import { deleteGarden } from '../../queries.js';
import { template } from './template.js';

export class GardenListItem extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));

    this.document = null;
    
    this.onclick = (e) => {
      e.preventDefault();
      setCurrentGarden(this.document);
    };
  }

  connectedCallback() {
    if (!this.document) {
      console.error(
        'GardenListItemError: document property expected to be set',
      );
    }

    const { name, columns, rows } = this.document.fields;
    const { documentId, owner } = this.document.meta;

    this.id = documentId;
    this.name = name;

    this.shadow.querySelector('#name').innerText =
      name.length > 12 ? `${name.slice(0, 12)}...` : name;
    this.shadow.querySelector('#dimensions').innerText = `${columns} x ${rows}`;

    const keyPair = getKeyPair();

    if (owner == keyPair.publicKey()) {
      const deleteButton = this.shadow.querySelector('delete-button');
      deleteButton.onDelete = onDelete(documentId);
      deleteButton.style.visibility = 'visible';
    }
  }
}

const onDelete = (id) => {
  return async () => {
    await deleteGarden(id);
    if (window.GARDEN_ID == id) {
      setCurrentGarden(null);
    }
    document.querySelector('#garden-list').refresh();
  };
};
