import { LightningElement } from 'lwc';
export default class CaSearch extends LightningElement {
    
    isLoading = false;

    handleLoading() {
        this.isLoading = true;
    }
    handleDoneLoading() {
        this.isLoading = false;
    }
    searchAccounts(event) {
        let acTypeId = event.detail.acTypeId;

        this.template.querySelector('c-ca-search-result').searchAccounts(acTypeId);
        this.handleDoneLoading();
    }
}