import { KeyPair, Session } from './libs/shirokuma.min.js';
import {
  AnimatedList,
  ArrowButton,
  DeleteButton,
  Garden,
  GardenForm,
  GardenListItem,
  GardenSearch,
  GardenTile,
  SpriteForm,
  SpriteListItem,
} from './components/index.js';
import { GRAPHQL_ENDPOINT } from './constants.js';

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

export const setCurrentGarden = (gardenDocument) => {
  window.CURRENT_GARDEN = gardenDocument;

  // Set the id attribute on `garden-main`
  const garden = document.querySelector('garden-main');
  if (gardenDocument) {
    garden.setAttribute('id', gardenDocument.meta.documentId);
  } else {
    garden.removeAttribute('id');
  }

  // Set the selected attribute on `#garden-list`
  const gardenList = document.querySelector('#garden-list');
  if (gardenDocument) {
    gardenList.setAttribute('selected', gardenDocument.meta.documentId);
  } else {
    gardenList.removeAttribute('selected');
  }
};

export const setCurrentSprite = (spriteDocument) => {
  window.CURRENT_SPRITE = spriteDocument;
};

export const app = async () => {
  const keyPair = getKeyPair();

  // Open a long running connection to a p2panda node and configure it so all
  // calls in this session are executed using that key pair
  window.session = new Session(GRAPHQL_ENDPOINT).setKeyPair(keyPair);

  customElements.define('delete-button', DeleteButton);
  customElements.define('arrow-button', ArrowButton);
  customElements.define('garden-search', GardenSearch);
  customElements.define('garden-tile', GardenTile);
  customElements.define('garden-main', Garden);
  customElements.define('sprite-form', SpriteForm);
  customElements.define('garden-form', GardenForm);
  customElements.define('animated-list', AnimatedList);
  customElements.define('sprite-list-item', SpriteListItem);
  customElements.define('garden-list-item', GardenListItem);
};
