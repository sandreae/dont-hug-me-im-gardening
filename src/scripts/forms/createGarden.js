import { createGardenElement } from '../elements/index.js';
import { createGarden } from '../queries.js';

export function initGardenForm() {
  let form = document.getElementById('garden-form');
  form.onsubmit = onSubmit;
  form.oninput = onInput;
}

async function onSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('garden-name').value;
  const width = document.getElementById('garden-width').value;
  const height = document.getElementById('garden-height').value;

  const id = await createGarden({
    name,
    height: Number(height),
    width: Number(width),
  });
  console.log('Created garden: ', id);
}

async function onInput(e) {
  e.preventDefault();
  let form = document.getElementById('garden-form');

  const name = document.getElementById('garden-name').value;
  const width = document.getElementById('garden-width').value;
  const height = document.getElementById('garden-height').value;

  let currentGarden = document.getElementById('preview-garden');
  if (currentGarden) {
    currentGarden.remove();
  }
  let gardenElement = createGardenElement(null, name, width, height);
  form.appendChild(gardenElement);
}
