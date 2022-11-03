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
        let boatTypeId = event.detail.value;
        this.template.querySelector('c-ca-c/caSearchResult').searchAccounts(boatTypeId);
        this.handleDoneLoading();
    }
}
