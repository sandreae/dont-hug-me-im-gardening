export const template = document.createElement('template');
template.innerHTML = /* html */ `
<style>
  @import "/components/sprite-form/style.css";
</style>
<form>
  <label for="image">== image ==</label>
  <div id="image-input-wrapper">
    <input type="file" id="image" name="image" accept="image/*" required placeholder="Sprite image" />
    <img src="" alt="preview of selected sprite image">
  </div>
  <label for="description">== description ==</label>
  <input type="text" name="description" maxlength="120" minlength="1" required placeholder="Description" />
  <input type="submit" value="create" />
</form>
`;
