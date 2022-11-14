import { api, LightningElement, wire } from 'lwc';
import { subscribe, unsubscribe, MessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import fetchFiles from '@salesforce/apex/FileuploadControl.fetchFiles';
import { refreshApex } from '@salesforce/apex';

import CAMC from '@salesforce/messageChannel/CuiAccountMessageChannel__c';

export default class CFileUpload extends LightningElement {

    columns = [
        { label: 'Title', fieldName: 'Title' },
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

    @wire(MessageContext)
    messageContext;

    subscription = null;

    @wire(fetchFiles, { recordId: '$recordId' })
    wiredFetchFiles(result) {
        this.fetchResults = result;
        const {data, error} = result;
        if (data) {
            console.log('file uplaod files for recordId : ' + this.recordId);
            console.log(data);
            this.fileNames = data.map( cd => {
                return { Title : cd.ContentDocument.Title };
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
}