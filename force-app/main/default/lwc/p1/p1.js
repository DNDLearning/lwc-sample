import { LightningElement ,api} from 'lwc';

export default class LightningExampleAccordionBasic extends LightningElement {

    privateTitle='xyz';

    @api
    get title() {
        return this.privateTitle;
    }
  
    changtitle() {
        let p=this.template.querySelector('.p_contxt');
        p.setAttribute('title', 'ppp'); 
    
    }

    set title(value) {
      this.privateTitle = value.toUpperCase();
    
    }


    activeSectionMessage = '';

    handleToggleSection(event) {
        this.activeSectionMessage =
            'Open section name:  ' + event.detail.openSections;
    }

    handleSetActiveSectionC() {
        const accordion = this.template.querySelector('.example-accordion');

        accordion.activeSectionName = 'C';
    }
}
