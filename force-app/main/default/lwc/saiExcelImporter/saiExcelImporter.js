import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import sheetjs from '@salesforce/resourceUrl/sheetmin';

let XLS = {};

export default class SaiExcelImporter extends LightningElement {

    acceptedFormats = ['.xls', '.xlsx'];

    connectedCallback() {
        Promise.all([
            loadScript(this, sheetjs + '/sheetmin.js')
        ]).then(()=> {
            XLS = XLSX;
            this.readFromFile();
        });
    }

    async readFromFile() {
        let returnVal = await readFileFromRecord({record:'test'});
        let wb = XLS.read(returnVal, { type: 'base64', WTF:false });
        console.log(this.to_json(wb));
    }

    to_json(workbook) {
        let result = {};
        workbook.SheetNames.forEach(function(sheetName) {
            let roa = XLS.utils.sheet_to_json(workbook.sheets[sheetsName], {header:1});
        });
        return JSON.stringify(result, 2, 2);
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        if (uploadedFiles.length > 0) {
            this.ExcelToJSON(uploadedFiles[0]);
        }
    }

    ExcelToJSON(file) {
        let reader = new FileReader();
        reader.onload = event => {
            let data = event.target.result;
            let workbook = XLS.read(data, {
                type: 'binary'
            });
            let XL_row_object = XLS.utils.sheet_to_row_object_array(workbook.Sheets['Sheet1']);
            data = JSON.stringify(XL_row_object);
            console.log(JSON.stringify(data));
        };

        reader.onerror = function(ex) {
            this.error = ex;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while reading the file',
                    message: ex.message,
                    variant: 'error',
                }),
            );
        };
        reader.readAsBinaryString(file);
    }
}