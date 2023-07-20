import {
  createGarden,
  createPlant,
  createSpecies,
  getAllGardens,
  getAllPlants,
  getAllSpecies,
} from './queries.js';
import { Session } from '../libs/shirokuma.min.js';
import { getKeyPair } from './key_pair.js';

export async function init() {
  const keyPair = getKeyPair();

  // Open a long running connection to a p2panda node and configure it so all
  // calls in this session are executed using that key pair
  const session = new Session('http://localhost:2020/graphql').setKeyPair(
    keyPair,
  );

  try {
    let gardenId = await createGarden(session, {
      name: 'My Garden',
      height: 100,
      width: 100,
    });

    console.log('Garden created!');
    console.log(gardenId);

    let speciesId = await createSpecies(session, {
      name: 'Nettle',
      vec_img: '@',
    });

    console.log('Species created!');
    console.log(gardenId);

    let now = Math.floor(new Date().getTime() / 1000.0);
    let plant_fields = {
      pos_x: 50,
      pos_y: 50,
      species: [`${speciesId}`],
      planted_at: now,
      garden: `${gardenId}`,
    };

    // // This doesn't work yet: https://github.com/p2panda/shirokuma/issues/22
    // let plantId = await createPlant(session, plant_fields);
    // console.log('Plant created!');
    // console.log(plantId);

    let gardens = await getAllGardens();
    console.log('Gardens: ', gardens);

    let species = await getAllSpecies();
    console.log('Species: ', species);

    let plants = await getAllPlants();
    console.log('Plants: ', plants);
  } catch (err) {
    console.error(`${err.message}: ${err.cause}`);
  }
}
