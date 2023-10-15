import { GARDEN_HEIGHT, GARDEN_WIDTH } from '../constants.js';
import { createGarden, createSpecies } from '../queries.js';
import { OperationFields } from '../libs/shirokuma.min.js';

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
    };
  }
}

export class SpeciesForm extends HTMLElement {
  constructor() {
    super();

    const template = document.getElementById('species-form');
    const templateContent = template.content;

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(templateContent.cloneNode(true));
  }

  connectedCallback() {
    const form = this.shadow.querySelector('form');

    form.onsubmit = async (e) => {
      e.preventDefault();
      const input = this.shadow.querySelector('input');

      const reader = new FileReader();
      reader.readAsArrayBuffer(input.files[0]);
      reader.onloadend = async (e) => {
        if (e.target.readyState === FileReader.DONE) {
          const arrayBuffer = e.target.result;
          const array = new Uint8Array(arrayBuffer);
          const blobId = await window.session.createBlob('image/jpeg', array);

          const fields = new OperationFields();
          fields.insert('img', 'relation', blobId);
          const id = await createSpecies(fields);

          console.log('Created species: ', id);
          input.value = '';
        }
      };
    };
  }
}
