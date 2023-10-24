export const setGardenId = (id) => {
  window.GARDEN_ID = id;
  document.querySelector('garden-main').setAttribute('id', id);
};

export const setSpeciesId = (id) => {
  window.SPECIES_ID = id;
};

export const setSpeciesImg = (url) => {
  window.SPECIES_IMG = url;
};
