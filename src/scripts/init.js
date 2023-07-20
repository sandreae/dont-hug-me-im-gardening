import { getAllGardens, getAllPlants, getAllSpecies } from "./queries.js";


getAllGardens()
  .then(response => console.log(response))
  .catch(err => {
    console.error(`${err.message}: ${err.cause}`);
  });

getAllPlants()
  .then(response => console.log(response))
  .catch(err => {
    console.error(`${err.message}: ${err.cause}`);
  });

getAllSpecies()
  .then(response => console.log(response))
  .catch(err => {
    console.error(`${err.message}: ${err.cause}`);
  });
