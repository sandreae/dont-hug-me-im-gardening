import { createGardenElement } from '../elements/index.js';
import { getAllGardens, searchGardenByName } from '../queries.js';

export function initSearchGardenForm() {
  let input = document.getElementById('garden-search');
  input.oninput = onSearchGardens;
  input.dispatchEvent(new Event('input'));
}

async function onSearchGardens(e) {
  e.preventDefault();
  console.log(e);

  let searchString = e.target.value;
  let gardens =
    searchString.length > 0
      ? await await searchGardenByName(searchString)
      : await getAllGardens();

  let searchResults = document.getElementById('garden-search-results');
  searchResults.innerHTML = '';

  gardens.forEach((garden) => {
    let { name, width, height } = garden.fields;
    let { documentId } = garden.meta;

    let gardenElement = createGardenElement(documentId, name, width, height);
    searchResults.appendChild(gardenElement);
  });
}
