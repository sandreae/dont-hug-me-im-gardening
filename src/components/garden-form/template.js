export const template = document.createElement('template');
template.innerHTML = /* html */ `
  <style>
    @import "/components/garden-form/style.css";
  </style>
  <h2><slot>Placeholder Title!</slot></h2>
  <form>
    <label for="name">== name ==</label>
    <input type="text" name="name" maxlength="60" minlength="1" required placeholder="Name" />
    <label for="rows">== rows ==</label>
    <input type="number" min="1" max="1000" name="rows" required placeholder="Rows" value="1" />
    <label for="columns">== columns ==</label>
    <input type="number" min="1" max="1000" name="columns" required placeholder="Columns" value="1" />
    <input type="submit" value="create" />
  </form>
`;
