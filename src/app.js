import { KeyPair, Session } from './libs/shirokuma.min.js';
import { AnimatedList } from './components/lists.js';
import { Garden, GardenTile } from './components/garden.js';
import { GardenForm, SearchInput, SpriteForm } from './components/forms.js';
import { ArrowButton, DeleteGardenButton } from './components/buttons.js';
import { SpriteListItem, GardenListItem } from './components/list-items.js';

const LOCAL_STORAGE_KEY = 'privateKey';

export const getKeyPair = () => {
  const privateKey = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (privateKey) {
    return new KeyPair(privateKey);
  }

  const keyPair = new KeyPair();
  window.localStorage.setItem(LOCAL_STORAGE_KEY, keyPair.privateKey());
  return keyPair;
};

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

export const app = async () => {
  const keyPair = getKeyPair();

  // Open a long running connection to a p2panda node and configure it so all
  // calls in this session are executed using that key pair
  window.session = new Session('http://localhost:2020/graphql').setKeyPair(
    keyPair,
  );

  customElements.define('delete-garden-button', DeleteGardenButton);
  customElements.define('arrow-button', ArrowButton);
  customElements.define('search-input', SearchInput);
  customElements.define('garden-tile', GardenTile);
  customElements.define('garden-main', Garden);
  customElements.define('sprite-form', SpriteForm);
  customElements.define('garden-form', GardenForm);
  customElements.define('animated-list', AnimatedList);
  customElements.define('sprite-list-item', SpriteListItem);
  customElements.define('garden-list-item', GardenListItem);
};
