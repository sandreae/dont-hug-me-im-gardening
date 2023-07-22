export function createSpeciesElement(emoji, id) {
  const div = document.createElement('div');
  div.innerHTML = emoji;
  div.id = id;
  return div;
}
