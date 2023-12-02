import { MAX_UPLOAD_SIZE } from '../../constants.js';
import { createSprite } from '../../queries.js';
import { template } from './template.js';

export class SpriteForm extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    const form = this.shadow.querySelector('form');
    const img = this.shadow.querySelector('img');
    const imageInput = this.shadow.querySelector('input[name="image"]');

    imageInput.oninput = (e) => {
      let file = e.target.files[0];

      if (file.size > MAX_UPLOAD_SIZE) {
        alert('Max image size (50kB) exceeded.');
        e.target.value = '';
        return;
      }

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

      alert(`Congratulations! You created a new sprite :-)`);
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
