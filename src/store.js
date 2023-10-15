import { KeyPair } from './libs/shirokuma.min.js';

const LOCAL_STORAGE_KEY = 'privateKey';

export function getKeyPair() {
  const privateKey = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (privateKey) {
    return new KeyPair(privateKey);
  }

  const keyPair = new KeyPair();
  window.localStorage.setItem(LOCAL_STORAGE_KEY, keyPair.privateKey());
  return keyPair;
}

export function setCurrentGarden(id) {
  window.localStorage.setItem('gardenId', id);
}

export function getCurrentGarden() {
  return window.localStorage.getItem('gardenId');
}

export function setCurrentSpeciesId(id) {
  window.localStorage.setItem('speciesId', id);
}

export function getCurrentSpeciesId() {
  return window.localStorage.getItem('speciesId');
}

export function setCurrentSpeciesChar(emoji) {
  window.localStorage.setItem('speciesChar', emoji);
}

export function getCurrentSpeciesChar() {
  return window.localStorage.getItem('speciesChar');
}
