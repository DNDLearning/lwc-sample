import { LightningElement, api, wire, track } from 'lwc';
import getAccountByType from '@salesforce/apex/AccountDataService.getAccountByType'
export default class CaSearchResult extends LightningElement {
    @api
    selectedAccountId;
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
        }
    ];
    acTypeId;
    @track
    accounts;
    isLoading = false;
    @wire(getAccountByType, { acTypeId: '$acTypeId' })
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
    }
    notifyLoading(isLoading) {
        if (isLoading) {
            this.dispatchEvent(new CustomEvent('loading'));
        } else {
            this.dispatchEvent(new CustomEvent('doneLoading'));
        }
    }
}
