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
    this.classList.add('disabled');
    const img = document.createElement('img');
    img.src = '/assets/arrow-up.png';
    img.style.transform = this.hasAttribute('down') ? 'rotate(180deg)' : '';

    this.appendChild(img);
  }
}
