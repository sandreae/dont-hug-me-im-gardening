import { setCurrentGarden } from '../app.js';
import { createGarden, createSprite, getGarden } from '../queries.js';

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

      const name = form.querySelector('input[name="name"]');
      const rows = form.querySelector('input[name="rows"]');
      const columns = form.querySelector('input[name="columns"]');

      const garden = document.querySelector('garden-main');
      garden.name = name.value;
      garden.rows = rows.value;
      garden.columns = columns.value;

      setCurrentGarden(null);
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
      rows.value = 1;
      columns.value = 1;

      setTimeout(async () => {
        const gardenDocument = await getGarden(id);
        setCurrentGarden(gardenDocument);
        document.querySelector('#garden-list').refresh();
      }, 200);
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
      const imageInput = this.shadow.querySelector('input[name="image"');
      const descriptionInput = this.shadow.querySelector(
        'input[name="description"',
      );

      const id = await createSprite(
        descriptionInput.value,
        imageInput.files[0],
      );

      console.log('Created sprite: ', id);
      imageInput.value = '';
      descriptionInput.value = '';
      const img = this.shadow.querySelector('img');
      img.style.display = 'hidden';
      img.src = '';

      setTimeout(() => {
        document.querySelector('#sprite-list').refresh();
      }, 200);
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
