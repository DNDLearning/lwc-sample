import { api, LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CFileUpload extends LightningElement {

    @api
    recordId;

    get acceptedFormats() {
        return ['.pdf', '.xlsx', '.txt'];
    }

    handleUploadFinished(event) {
        const fileCount = event.detail.files.length;
        const uploadMessage = new ShowToastEvent({
            title: 'Upload file',
            message: fileCount + ' file(s) uploaded.',
            variant: 'success'
        });
        this.dispatchEvent(uploadMessage);
    }
}