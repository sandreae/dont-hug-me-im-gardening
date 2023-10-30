export const setGardenId = (id) => {
  window.GARDEN_ID = id;
  document.querySelector('garden-main').setAttribute('id', id);
};

export const setSpriteId = (id) => {
  window.SPRITE_ID = id;
};

export const setSpriteImg = (url) => {
  window.SPRITE_IMG = url;
};
