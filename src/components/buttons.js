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
}
