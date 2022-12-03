import { LightningElement,track } from 'lwc';
import sheetJS from '@salesforce/resourceUrl/sheetJS';
import {loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import uploadExcelData from '@salesforce/apex/ExcelImportController.uploadExcelData';
import getDocumentId from '@salesforce/apex/ExcelImportController.getDocumentId';

export default class ExcelImportForLwc extends LightningElement {
    //用来存储excel中解析的数据
    @track dataList = [];

    // 上传的excel中的列信息
    @track dataHeaderMap = {
        "Account Name" : "accountName",
        "Account Number" : "accountNumber",
        "Account Source" : "accountSource",
        "Industry" : "industry"
    };

    // 是否展示 loading的spinner
    @track isShowSpinner = false;

    //标识符判断是否文件已经上传
    @track isFileUpload = false;
    //存储文件名称
    @track fileName = '';

    //是否可以点击上传文件按钮
    @track disableUploadButton = true;
    //是否可以点击 上传数据按钮
    @track disableUploadResultButton = true;
    //Base64 编码以后最大的文件字节数
    maxFileSize = 4350000;
    //功能所允许的最多的数据行数
    maxRowNumber = 5000;

    activeSections = [];

    @track templateURL;

    tipSection = '注意事项';


    /*--------针对上传失败场景使用--------*/
    @track isShowErrorTable = false;

    @track errorTableHeader = [
         {label: '行号', fieldName: 'errorRowNumber', type: 'text',fixedWidth: 70},
         {label: '列名称', fieldName: 'columnName', type: 'text'},
         {label: '错误信息', fieldName: 'errorMessage', type: 'text'}
    ];

    @track errorTableList = [];

    /*--------针对上传成功展示数据用-------*/
    @track isShowExcelTable = false;
    @track excelTableHeader = [
        {label: 'Account Name', fieldName: 'accountName', type: 'text'},
        {label: 'Account Number', fieldName: 'accountNumber', type: 'text'},
        {label: 'Account Source', fieldName: 'accountSource', type: 'text'},
        {label: 'Industry', fieldName: 'industry', type: 'text'}
    ];

    @track excelTableList = [];

    //加载 excel js 资源，加载资源以后才允许上传功能
    connectedCallback() {
        loadScript(this, sheetJS).then(() => {
             console.log('加载 sheet JS完成');
             this.disableUploadButton = false;
        });

        getDocumentId()
        .then(result=>{
            if(result) {
                this.templateURL = result; 
            }
        }).catch(error=> {

        });


    }

    renderedCallback() {
        if(this.templateURL) {
            this.enableShowDownTemplate = true;
        }
    }



    /**
    * 上传excel数据解析
    */
    excelFileToJson(event) {
        event.preventDefault();
        let files = event.target.files;
        if(files) {
            this.isFileUpload = true;
            this.fileName = files[0].name;
        }
        const analysisExcel = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsBinaryString(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

        analysisExcel(files[0])
        .then((result) => {
            let datas = []; // 存储获取到的数据
            let XLSX = window.XLSX;

            //文件大小
            let fileWidth = result.length;
            if(fileWidth > this.maxFileSize) {
                this.dataList = [];
                this.disableUploadResultButton = false;
                const toastEvent = new ShowToastEvent({
                    variant: "error",
                    message: '上传失败，最大允许4.3M文件!',
                });
                
                this.dispatchEvent(toastEvent);
            } else {
                let workbook = XLSX.read(result, {
                    type: 'binary'
                });
                for (let sheet in workbook.Sheets) {
                    if (workbook.Sheets.hasOwnProperty(sheet)) {
                        datas = datas.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
                    }
                }

                if(datas.length > this.maxRowNumber) {
                    this.dataList = [];
                    this.disableUploadResultButton = false;
                    const toastEvent = new ShowToastEvent({
                        variant: "error",
                        message: '上传失败，最大只能操作' + this.maxRowNumber + '行数据',
                    });

                    this.dispatchEvent(toastEvent);
                } else {
                    this.dataList = datas;
                    this.disableUploadResultButton = false;
                    const toastEvent = new ShowToastEvent({
                        variant: "success",
                        message: '文件已经上传成功，请点击下方的"上传数据"按钮保存数据'
                    });
                    
                    this.dispatchEvent(toastEvent);
                }
            }
            
        });
        let fileElement = this.template.querySelector('#file-upload-input-0');
    }

    /**
    * 保存上传的excel数据到数据库
    * 1. 校验
    * 2. 校验通过展示excel数据内容
    * 3. 校验失败展示错误信息
    **/
    uploadData(event) {
        this.isShowSpinner = true;
        this.errorTableList = [];
        this.isShowErrorTable = false;
        this.excelTableList = [];
        this.isShowExcelTable = false;
        uploadExcelData({excelBody:JSON.stringify(this.dataList),excelHeadStr : JSON.stringify(this.dataHeaderMap)})
        .then(result=>{
            if(!result.isSuccess) {
                this.errorTableList = result.errorList;
                //先判断当前的附件错误是否为没有内容
                if(this.errorTableList.length == 1 && this.errorTableList[0].errorMessage === 'NO_ROWS') {
                        const toastEvent = new ShowToastEvent({
                            variant: "error",
                            message: '您的附件未包含任何内容，请检查您的附件并重新上传'
                        });
                        this.dispatchEvent(toastEvent);
                } else if(this.errorTableList.length == 1 && this.errorTableList[0].errorMessage === 'FORMAT_ERROR') { 
                    const toastEvent = new ShowToastEvent({
                        variant: "error",
                        message: '您的附件内容与提供的模板的列不匹配，请检查您的附件并重新上传'
                    });
                    this.dispatchEvent(toastEvent);
                } else {
                    this.isShowErrorTable = true;
                    const toastEvent = new ShowToastEvent({
                        variant: "error",
                        message: '您的数据需要整理，请查看错误信息详情列表'
                    });
                    this.dispatchEvent(toastEvent);
                }
                
            } else {
                this.excelTableList = result.dataList;
                this.isShowExcelTable = true;
                const toastEvent = new ShowToastEvent({
                    variant: "success",
                    message: '您操作的数据已经成功，请查看信息详情列表'
                });
                this.dispatchEvent(toastEvent);
            }
            this.isShowSpinner = false;
        }).catch(error=>{
            console.log(error);
            this.isShowSpinner = false;
        });
    }
}