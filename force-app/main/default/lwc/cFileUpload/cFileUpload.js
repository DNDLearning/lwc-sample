import { api, LightningElement, wire } from 'lwc';
import { subscribe, unsubscribe, MessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import fetchFiles from '@salesforce/apex/FileuploadControl.fetchFiles';
import { refreshApex } from '@salesforce/apex';

import CAMC from '@salesforce/messageChannel/CuiAccountMessageChannel__c';

export default class CFileUpload extends NavigationMixin( LightningElement ) {

    columns = [
        { label: 'Title', fieldName: 'fileUrl', type: 'url',
            typeAttributes: { label: { fieldName: 'Title' } },
            sortable: true,
        },
        { type: 'button', 
            typeAttributes: {
                iconName: 'utility:download',
                label: 'download',
                name: 'download',
                disabled: false,
                value: 'download',
                variant: 'brand'
            }
        },
        { type: 'button', 
            typeAttributes: {
                iconName: 'utility:search',
                label: 'preview',
                name: 'preview',
                disabled: false,
                value: 'preview',
                variant: 'brand'
            }
        },

    ];

    recId;

    @api
    get recordId() {
        return this.recId;
    }
    set recordId(value) {
        this.recId = value;
    }

    fetchResults;
    fileNames;
    error;

    get acceptedFormats() {
        return ['.pdf', '.xlsx', '.txt'];
    }

    get disabled() {
        return this.recordId == undefined;
    }

    get url() {
        return '/sfc/servlet.shepherd/document/download/';
    }

    @wire(MessageContext)
    messageContext;

    subscription = null;

    @wire(fetchFiles, { recordId: '$recordId' })
    wiredFetchFiles(result) {
        this.fetchResults = result;
        const {data, error} = result;
        if (data) {
            this.fileNames = data.map( cd => {
                return { 
                    Id: cd.ContentDocumentId,
                    Title: cd.ContentDocument.Title ,
                    fileUrl: this.url + cd.ContentDocumentId,
                };
            });
            this.error = undefined;
        }
        else {
            console.log(error);
            this.fetchResults = undefined;
            this.fileNames = undefined;
            this.error = error;
        }
    }

    connectedCallback() {
        if (this.subscription || this.recordId ) {
            return;
        }
        this.subscribeMC();
    }

    subscribeMC() {
        this.subscription = subscribe(
            this.messageContext,
            CAMC,
            (message) => { console.log(message); this.recordId = message.recordId }
        );
    }

    disconnectedCallback() {
        if (this.subscription) {
            unsubscribe(this.subscription);
            this.subscription = null;
        }
    }

    handleUploadFinished(event) {
        const fileCount = event.detail.files.length;
        const uploadMessage = new ShowToastEvent({
            title: 'Upload file',
            message: fileCount + ' file(s) uploaded.',
            variant: 'success'
        });
        this.dispatchEvent(uploadMessage);
        this.refresh();
    }

    async refresh() {
        await refreshApex(this.fetchResults);
    }

    handleRowAction(event) {
        let actionName = event.detail.action.name;
        let row = event.detail.row;
        console.log(actionName);
        console.log(row);

        switch (actionName) {
            case 'download':
                window.open(row.fileUrl);
                break;
            case 'preview':
                this[NavigationMixin.Navigate]({
                    type: 'standard__namedPage',
                    attributes: {
                        pageName: 'filePreview'
                    },
                    state: {
                        selectedRecordId: row.Id
                    }
                })
                break;
            default:
                break;
        }

    }
}