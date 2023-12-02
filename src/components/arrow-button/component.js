import { template } from "./template.js";

export class ArrowButton extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));

    this.onClick = () => {
      console.error('ArrowButtonError: no onClick method set');
    };
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
