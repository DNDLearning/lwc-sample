import { LightningElement, api, wire, track } from 'lwc';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import TYPE_FIELD from '@salesforce/schema/Account.Type';
export default class CaSearchForm extends LightningElement {

    @wire(getObjectInfo, {objectApiName: ACCOUNT_OBJECT})
    acObjInfo;
    error = undefined;
    // selected type id.
    selectedTypeId;
    @track
    searchOptions;
    // account type combobox options
    @wire(getPicklistValues, { recordTypeId: '$acObjInfo.data.defaultRecordTypeId', fieldApiName: TYPE_FIELD})
    accountTypes({data, error}) {
        if (data) {
            this.searchOptions = data.values.map( type => {
                return { label: type.label, value: type.value };
            });
            this.searchOptions.unshift({label: 'All Types', value: ''});
            this.error = undefined;
        } else {
            this.searchOptions = undefined;
            this.error = error;
        }
    }
    // search accounts when type changes.
    handleCmbTypeChange(event) {
        this.selectedTypeId = event.detail.value;
        const searchEvent = new CustomEvent('search', {
            detail: { acTypeId: this.selectedTypeId },
        });
        this.dispatchEvent(searchEvent);
    }
}