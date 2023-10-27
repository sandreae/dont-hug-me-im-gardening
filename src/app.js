import { Session } from './libs/shirokuma.min.js';
import { getKeyPair } from './store.js';
import {
  SpeciesList,
  GardenSearch,
  AnimatedList,
} from './components/lists.js';
import { Garden, GardenTile } from './components/garden.js';
import { GardenForm, SpeciesForm } from './components/forms.js';

export async function app() {
  const keyPair = getKeyPair();

  // Open a long running connection to a p2panda node and configure it so all
  // calls in this session are executed using that key pair
  window.session = new Session('http://localhost:2020/graphql').setKeyPair(
    keyPair,
  );

  customElements.define('garden-tile', GardenTile);
  customElements.define('garden-main', Garden);
  customElements.define('species-form', SpeciesForm);
  customElements.define('species-list', SpeciesList);
  customElements.define('garden-form', GardenForm);
  customElements.define('garden-search', GardenSearch);
  customElements.define('animated-list', AnimatedList);
}
