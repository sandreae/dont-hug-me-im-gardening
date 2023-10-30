import { GARDEN_HEIGHT, GARDEN_WIDTH } from '../constants.js';
import { createGarden, createSprite } from '../queries.js';

export class GardenForm extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('garden-form');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
  }

  connectedCallback() {
    const form = this.shadow.querySelector('form');

    form.onsubmit = async (e) => {
      e.preventDefault();
      const input = this.shadow.querySelector('input');
      const id = await createGarden({
        name: input.value,
        width: GARDEN_WIDTH,
        height: GARDEN_HEIGHT,
      });

      console.log('Created garden: ', id);
      input.value = '';

      document.querySelector('#garden-list').refresh();
    };
  }
}

export class SpriteForm extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('sprite-form');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
  }

  connectedCallback() {
    const form = this.shadow.querySelector('form');

    form.onsubmit = async (e) => {
      e.preventDefault();
      const input = this.shadow.querySelector('input');
      const id = await createSprite("My cute sprite", input.files[0]);

      console.log('Created sprite: ', id);
      input.value = '';

      document.querySelector('#sprite-list').refresh();
    };
  }
}

export class SearchInput extends HTMLInputElement {
  constructor() {
    // eslint-disable-next-line no-global-assign
    self = super();
  }

  connectedCallback() {
    const listId = this.getAttribute('list-id');
    this.oninput = (e) => {
      e.preventDefault();
      const list = document.getElementById(listId);
      list.search = e.target.value;
    };
  }
}