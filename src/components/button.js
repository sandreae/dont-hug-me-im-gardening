export class Button extends HTMLButtonElement {
  constructor() {
    // eslint-disable-next-line no-global-assign
    self = super();
  }

  connectedCallback() {
    const img = document.createElement('img');
    img.src = '/assets/arrow-up.png';
    img.style.transform = this.hasAttribute('down')
      ? 'rotate(180deg)'
      : '';

    this.appendChild(img);
  }
}
