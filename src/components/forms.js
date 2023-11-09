import { setGardenId } from '../app.js';
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

    form.oninput = (e) => {
      e.preventDefault();
      setGardenId(null);
      const garden = document.querySelector('garden-main');

      const name = e.target.name;
      switch (name) {
        case 'name': {
          garden.setAttribute('name', e.target.value);
          break;
        }
        case 'rows': {
          garden.setAttribute('rows', e.target.value);
          break;
        }
        case 'columns': {
          garden.setAttribute('columns', e.target.value);
          break;
        }
      }
    };

    form.onsubmit = async (e) => {
      e.preventDefault();
      const name = e.target.querySelector('input[name="name"]');
      const rows = e.target.querySelector('input[name="rows"]');
      const columns = e.target.querySelector('input[name="columns"]');

      const id = await createGarden(
        name.value,
        Number(columns.value),
        Number(rows.value),
      );

      console.log('Created garden: ', id);

      name.value = null;
      rows.value = null;
      columns.value = null;

      setGardenId(id);
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
    const img = this.shadow.querySelector('img');
    const imageInput = this.shadow.querySelector('input[name="image"]');
    imageInput.oninput = (e) => {
      let file = e.target.files[0];
      let reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = function () {
        img.src = reader.result;
        img.style.display = 'inline';
      };
    };

    form.onsubmit = async (e) => {
      e.preventDefault();
      const image = this.shadow.querySelector('input[name="image"');
      const description = this.shadow.querySelector('input[name="image"');
      const id = await createSprite(description.value, image.files[0]);

      console.log('Created sprite: ', id);
      description.value = '';

      document.querySelector('#sprite-list').refresh();
    };
  }
}

export class GardenSearch extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('garden-search');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
  }

  connectedCallback() {
    const input = this.shadow.querySelector('input');
    const listId = this.getAttribute('list-id');
    input.oninput = (e) => {
      e.preventDefault();
      const list = document.getElementById(listId);
      list.search = e.target.value;
    };
  }
}
