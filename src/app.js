import { Session } from './libs/shirokuma.min.js';
import { getKeyPair } from './store.js';
import { AnimatedList } from './components/lists.js';
import { Garden, GardenTile } from './components/garden.js';
import { GardenForm, SearchInput, SpriteForm } from './components/forms.js';
import { Button } from './components/button.js';
import { SpriteListItem, GardenListItem } from './components/list-items.js';

export async function app() {
  const keyPair = getKeyPair();

  // Open a long running connection to a p2panda node and configure it so all
  // calls in this session are executed using that key pair
  window.session = new Session('http://localhost:2020/graphql').setKeyPair(
    keyPair,
  );

  customElements.define('garden-tile', GardenTile);
  customElements.define('garden-main', Garden);
  customElements.define('sprite-form', SpriteForm);
  customElements.define('garden-form', GardenForm);
  customElements.define('animated-list', AnimatedList);
  customElements.define('sprite-list-item', SpriteListItem);
  customElements.define('garden-list-item', GardenListItem);
  customElements.define('arrow-button', Button, { extends: 'button' });
  customElements.define('search-input', SearchInput, { extends: 'input' });
}
