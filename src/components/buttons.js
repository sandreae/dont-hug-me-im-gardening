import { setGardenId } from '../app.js';
import { deleteGarden } from '../queries.js';

export class ArrowButton extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('arrow-button');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
  }

  connectedCallback() {
    const img = this.shadow.querySelector('img');
    if (this.hasAttribute('down')) {
      img.style.transform = 'rotate(180deg)';
    } else if (this.hasAttribute('left')) {
      img.style.transform = 'rotate(-90deg)';
    } else if (this.hasAttribute('right')) {
      img.style.transform = 'rotate(90deg)';
    }
  }
}

export class DeleteGardenButton extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('delete-garden-button');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
  }

  connectedCallback() {
    const button = this.shadow.querySelector('button');
    button.onclick = async (e) => {
      e.preventDefault();
      const result = confirm('Are you sure you want to delete this garden?');
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
