import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import importAccount from '@salesforce/apex/FileuploadControl.importAccount';

export default class SaiCsvImporter extends LightningElement {

    recordId;

    appceptedFormats = ['.csv'];

    handleUploadFinished(event) {
        let files = event.detail.files;
        if (files.length == 0) {
            return;
        }

console.log('Document Id : ' + files[0].documentId);
        // call apex csv importer import accounts.
        importAccount({docId: files[0].documentId})
        .then(result => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Import Account.',
                    message: 'Import Account complete!',
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            this.error = error;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Import Account.',
                    message: 'Import Account error!\n' + JSON.stringify(error),
                    variant: 'error'
                })
            );

        });

    }

}