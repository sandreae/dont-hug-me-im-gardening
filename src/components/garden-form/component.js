import { setCurrentGarden } from '../../app.js';
import { createGarden, getGarden } from '../../queries.js';
import { template } from './template.js';

export class GardenForm extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));
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

      alert(`Congratulations! "${name.value}" has been created :-)`);
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
