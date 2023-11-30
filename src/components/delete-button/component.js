import { confirmAction } from '../../utils.js';
import { template } from './template.js';

export class DeleteButton extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));

    this.onclick = async (e) => {
      e.preventDefault();
      if (!this.onDelete) {
        console.error('DeleteButtonError: onDelete method must be set');
      }
      const result = await confirmAction(
        'Are you sure you want to delete this garden?',
      );
      if (result) {
        await this.onDelete();
      }
    };
  }
}
