import { LightningElement, api, wire, track } from 'lwc';
import getAccountByType from '@salesforce/apex/AccountDataService.getAccountByType';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { publish, MessageContext } from 'lightning/messageService';

import CAMC from '@salesforce/messageChannel/CuiAccountMessageChannel__c';

const actions = [
    { label: 'Show details', name: 'show_details' },
    { label: 'Delete', name: 'delete' },
];


export default class CaSearchResult extends NavigationMixin( LightningElement ) {

    columns = [
        { label: 'Name', fieldName: 'Name', editable: true },
        { label: 'Phone', fieldName: 'Phone', type: 'phone',
            cellattributes: {
                iconName: 'Action:call',
                iconPosition: 'right'
            }
        },
        { label: 'Type', fieldName: 'Type' },
        { label: 'Industry', fieldName: 'Industry' },
        { label: 'Billing Address', fieldName: 'BillingAddress' },
        { label: 'Annual Revenue', fieldName: 'AnnualRevenue', type: 'currency',
            typeAttributes: { currencyCode: 'USD', step: '0.01'}
        },
        { type: 'action', typeAttributes: { rowActions: actions } 
        }        
    ];
      
    @api
    selectedAccountId;

    acTypeId;

    @track
    accounts;

    isLoading = false;

    @wire(MessageContext)
    messageContext;

    @wire(getAccountByType, { type: '$acTypeId' })
    wiredAccount({data, error}) {
        if (data) {
            this.accounts = data;
            console.log('Accounts length : ' + this.accounts.length);
            if (this.accounts.length == 0) {
                this.selectedAccountId = null;
            }
        } else if (error) {
            console.log('data error: ');
            console.log(error);
        }
    }

    @api
    searchAccounts(acTypeId) {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        this.acTypeId = acTypeId;
        console.log(`------------------- ${acTypeId} -------------------`);
    }

    //
    notifyLoading(isLoading) {
        if (isLoading) {
            this.dispatchEvent(new CustomEvent('loading'));
        } else {
            this.dispatchEvent(new CustomEvent('doneLoading'));
        }
    }

    handleRowSelection(event) {
        let selectedRow = event.detail.selectedRows[0];
        this.sendMessage(selectedRow.Id);
        const rowMessage = new ShowToastEvent({
            title: 'Selected Row',
            message: 'Row selected.',
        });
        this.dispatchEvent(rowMessage);
    }

    sendMessage(selectedId) {
        console.log(`Selected Record Id : ` + selectedId );
        publish(this.messageContext, CAMC, { recordId: selectedId});
    }
    
    //
    handleRowAction(event) {
        console.log(' >>>>>>>>>>>>>> event.detail >>>>>>>>>>>>>> ');
        console.log(event.detail);
        let actionName = event.detail.action.name;
        let row = event.detail.row;
        if (actionName === 'show_details') {
            this.showRowDetails(row);
        } else if (actionName === 'delete') {
            this.deleteRow(row);
        }
    }

    //
    showRowDetails(row) {
        console.log('Navigate to detail:' + event.detail.row.Id);
        const detailMessage = new ShowToastEvent({
            title: 'Show Details',
            message: 'Record {0} Detail Shows. See it {1}',
            messageData: [
                'salesforce',
                {
                    url: 'www.baidu.com',
                    label: 'here'
                },
            ],
            variant: 'success'
        });
        this.dispatchEvent(detailMessage);

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.detail.row.Id,
                objectApiName: 'Account',
                actionName: 'view'
            }
        });
    }

    //
    deleteRow(row) {
        const deleteMessage = new ShowToastEvent({
            title: 'Delete Record!',
            message: 'Selected record deleted.',
            variant: 'warning'
        });
        this.dispatchEvent(deleteMessage);
    }
    
}