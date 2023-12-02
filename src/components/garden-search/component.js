import { template } from './template.js';

export class GardenSearch extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    const input = this.shadow.querySelector('input');
    input.oninput = (e) => {
      e.preventDefault();
      const listId = this.getAttribute('list-id');
      const list = document.getElementById(listId);
      list.search = e.target.value;
    };
  }
}
