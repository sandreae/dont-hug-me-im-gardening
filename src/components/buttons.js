import { setGardenId } from '../app.js';
import { deleteGarden } from '../queries.js';

export class ArrowButton extends HTMLButtonElement {
  constructor() {
    // eslint-disable-next-line no-global-assign
    self = super();
  }

  connectedCallback() {
    const template = document.querySelector('#arrow-button-style');
    this.appendChild(template.content);

    this.classList.add('disabled');
    const img = document.createElement('img');
    img.src = '/assets/arrow-up.png';
    img.style.transform = this.hasAttribute('down') ? 'rotate(180deg)' : '';

    this.appendChild(img);
  }
}

export class DeleteButton extends HTMLButtonElement {
  constructor() {
    // eslint-disable-next-line no-global-assign
    self = super();
  }

  connectedCallback() {
    this.innerText = 'x';
    this.onclick = async (e) => {
      e.preventDefault();
      const result = confirm('Are you sure you want to delete this document?');
      if (result) {
        await deleteGarden(this.documentId);
        if (window.GARDEN_ID == this.documentId) {
          setGardenId(null);
        }
        document.querySelector('#garden-list').refresh();
      }
    };
  }
}
