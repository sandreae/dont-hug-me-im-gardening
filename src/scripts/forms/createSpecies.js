import { createSpecies } from '../queries.js';

export function initSpeciesForm() {
  let form = document.getElementById('species-form');
  form.onsubmit = async (e) => {
    e.preventDefault();

    const emoji = document.getElementById('species-emoji').value;

    const id = await createSpecies({
      name: 'temp name',
      vec_img: emoji,
    });
    console.log('Created species: ', id);
  };
}
