import { LightningElement, api, wire, track } from 'lwc';
import getAccountByType from '@salesforce/apex/AccountDataService.getAccountByType';

const actions = [
    { label: 'Show details', name: 'show_details' },
    { label: 'Delete', name: 'delete' }
];


export default class CaSearchResult extends LightningElement {

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

    @wire(getAccountByType, { type: '$acTypeId' })
    wiredAccount({data, error}) {
        if (data) {
            this.accounts = data;
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
    
    //
    handleRowAction(event) {
        console.log(' >>>>>>>>>>>>>>  >>>>>>>>>>>>>>>>> ');
        console.log(event.detail);
        let actionName = event.detail.action;
        let row = event.detail.row;
        if (actionName == 'show_details') {
            this.showRowDetails(row);
        } else if (actionName == 'delete') {
            this.deleteRow(row);
        }
    }

    //
    showRowDetails(row) {
        const detailMessage = new ShowToastEvent({
            title: 'Show Details',
            message: 'Record {0} Detail Shows. See it {1}',
            messageData: [
                'salesforce',
                {
                    url: 'www.baidu.com',
                    label: 'here'
                }
            ]
        });
        this.dispatchEvent(detailMessage);

    }

    //
    deleteRow(row) {
        const deleteMessage = new ShowToastEvent({
            title: 'Delete Record!',
            Message: 'Selected record deleted.'
        });
        this.dispatchEvent(deleteMessage);
    }
    
}