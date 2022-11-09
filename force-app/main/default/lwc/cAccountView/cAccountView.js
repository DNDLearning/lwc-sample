import { api, LightningElement, wire, track } from 'lwc';
import { subscribe, MessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import { getRecord } from 'lightning/uiRecordApi';

import NAME_FIELD from '@salesforce/schema/Account.Name';
import TYPE_FIELD from '@salesforce/schema/Account.Type';
import BILL_FIELD from '@salesforce/schema/Account.BillingAddress';
import ANNUALREVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue'

const ACC_FIELDS = [ NAME_FIELD, TYPE_FIELD, BILL_FIELD, ANNUALREVENUE_FIELD ];

import CAMC from '@salesforce/messageChannel/CuiAccountMessageChannel__c';

export default class CAccountView extends LightningElement {

    subscription = null;
    accId;

    @api
    get recordId() {
        return this.accId;
    }
    set recordId(value) {
        this.setAttribute('accId', value);
        this.accId = value;
    }

    @wire(MessageContext)
    messageContext;

    @track
    account;
    error = undefined;

    // @wire(getRecord, {recordId: '$recordId', fields: ACC_FIELDS})
    // wiredAccount({data, error}){
    //     if (data) {
    //         this.account = data;
    //         this.error = undefined;
    //     } else {
    //         this.error = error;
    //     }
    // };

    connectedCallback() {
        this.subscribeMC();
        console.log(">>>>>>>>>>>>>>>> " + this.accId);
    }

    subscribeMC() {
        if (this.subscription  || this.recordId) {
            return;
        }

        subscribe(
            this.messageContext, 
            CAMC,
            (message) =>  { this.recordId = message.recordId },
            {scope: APPLICATION_SCOPE }
        )
    }

}