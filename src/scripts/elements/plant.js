export function createPlantElement(garden, emoji, x, y, id) {
  const plant = document.createElement('div');
  garden.appendChild(plant);
  plant.classList.add('plant');
  plant.innerHTML = `<div>${emoji}</div>`;
  plant.id = id;
  plant.style.left = `${x}px`;
  plant.style.top = `${y}px`;
}
