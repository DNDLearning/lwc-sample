import { LightningElement } from 'lwc';

export default class PLayout extends LightningElement {

  privateTitle;

  @api
  get title() {
      return this.privateTitle;
  }

  set title(value) {
    this.privateTitle = value.toUpperCase();
    p=document.querySelector('.p_contxt');
      p.setAttribute('title', this.privateTitle);
  }
}