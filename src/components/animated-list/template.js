export const template = document.createElement('template');
template.innerHTML = /* html */ `
  <style>
    @import "/components/delete-button/style.css";
  </style>
  <arrow-button id="previous-button" class="disabled"></arrow-button>
  <div id="list-wrapper">
    No items found yet!
  </div>
  <arrow-button id="next-button" class="disabled" down></arrow-button>
`;
