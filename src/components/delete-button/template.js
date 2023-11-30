export const template = document.createElement('template');
template.innerHTML = /* html */ `
  <style>
    @import "/components/delete-button/style.css";
  </style>
  <button>
    <slot>x</slot>
  </button>
`;
