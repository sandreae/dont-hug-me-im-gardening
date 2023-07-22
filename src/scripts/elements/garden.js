import { OperationFields } from '../../libs/shirokuma.min.js';
import { createPlant } from '../queries.js';

export function createGardenElement(id, name, width, height) {
  const garden = document.createElement('div');
  const heading = document.createElement('h2');
  const plantWrapper = document.createElement('div');

  heading.innerHTML = name;
  heading.style.position = 'sticky';

  plantWrapper.classList.add('plant-wrapper');

  garden.style.minWidth = `${width}px`;
  garden.style.minHeight = `${height}px`;
  garden.style.width = `${width}px`;
  garden.style.height = `${height}px`;

  if (id) {
    garden.classList.add('garden');
    garden.id = id;
    garden.onclick = inClick;
  } else {
    garden.classList.add('preview-garden');
    garden.id = 'preview-garden';
  }

  garden.appendChild(heading);
  garden.appendChild(plantWrapper);

  return garden;
}

async function inClick(e) {
  e.preventDefault();
  console.log(e);
  const target = e.target;
  const rect = target.getBoundingClientRect();

  const id = target.id;
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  let now = Math.floor(new Date().getTime() / 1000.0);
  let plant_fields = new OperationFields({
    pos_x: Math.floor(x),
    pos_y: Math.floor(y),
    planted_at: now,
    garden: `${id}`,
  });

  plant_fields.insert('species', 'pinned_relation', [
    '00202437ce2dfdb0c543057e645b4d30106c1d18b9f62d5cd53e14d846d1838a0875',
  ]);

  let plantId = await createPlant(plant_fields);
  console.log('Created plant: ', plantId);
}
