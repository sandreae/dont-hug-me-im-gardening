import { VISIT_PAGE, BUILD_PAGE, PLANT_PAGE } from './constants.js';

export function initNav() {
  let buttons = document.getElementsByClassName('nav-button');
  Array.from(buttons).forEach((button) => {
    button.onclick = onNavClick;
  });
}

function onNavClick(e) {
  e.preventDefault();
  const buildPage = document.getElementById(BUILD_PAGE);
  const plantPage = document.getElementById(PLANT_PAGE);
  const visitPage = document.getElementById(VISIT_PAGE);

  const hidePageClass = 'hide-page';

  let page = e.target.name;
  if (page === BUILD_PAGE) {
    buildPage.classList.remove(hidePageClass);
    plantPage.classList.add(hidePageClass);
    visitPage.classList.add(hidePageClass);
  } else if (page === PLANT_PAGE) {
    plantPage.classList.remove(hidePageClass);
    buildPage.classList.add(hidePageClass);
    visitPage.classList.add(hidePageClass);
  } else if (page === VISIT_PAGE) {
    visitPage.classList.remove(hidePageClass);
    buildPage.classList.add(hidePageClass);
    plantPage.classList.add(hidePageClass);
  } else {
    console.log('Oops, what did you just press??');
  }
}
