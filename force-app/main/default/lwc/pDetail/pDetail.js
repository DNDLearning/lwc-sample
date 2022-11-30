import { LightningElement, api, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import { subscribe, MessageContext } from "lightning/messageService";
import RECORD_CHICK_CHANNEL from "@salesforce/messageChannel/pMsgChanne__c";

import CONTACT_NAME from "@salesforce/schema/Contact.Name";
import FIRSTNAME_FIELD from "@salesforce/schema/Contact.FirstName";
import LASTNAME_FIELD from "@salesforce/schema/Contact.LastName";
import TITLE_FIELD from "@salesforce/schema/Contact.Title";
import EMAIL_FIELD from "@salesforce/schema/Contact.Email";
import { getRecord } from "lightning/uiRecordApi";

export default class PDetail extends LightningElement {
  subscription = null;

  record;
  recordId;
  rowID;
  apiName;

  //用于直接在画面上显示(不在Form组件里)
  Email;
  Name;

  //用于lightning-record-form的字段名
  fields = [CONTACT_NAME];

  //用于lightning-record-edit-form的字段名
  cNameField = CONTACT_NAME;
  cTitleField = TITLE_FIELD;
  cMailField = EMAIL_FIELD;

  //新规记录的ID
  newRecordID;

  @wire(getRecord, {
    recordId: "$recordId",
    fields: [
      CONTACT_NAME,
      FIRSTNAME_FIELD,
      LASTNAME_FIELD,
      TITLE_FIELD,
      EMAIL_FIELD
    ]
  })
  wiredContact({ error, data }) {
    if (data) {
      this.record = JSON.parse(JSON.stringify(data));
      let {
        apiName,
        fields: { Email, Name },
        id
      } = this.record;
      this.apiName = apiName;
      this.rowID = id;
      this.Email = Email.value;
      this.Name = Name.value;
      // console.log( this.apiName,  this.id , this.Email,this.Name );
    } else if (error) {
      this.error = error;
      this.record = undefined;
    }
  }

  // By using the MessageContext @wire adapter, unsubscribe will be called
  // implicitly during the component descruction lifecycle.
  @wire(MessageContext)
  messageContext;

  // Encapsulate logic for LMS subscribe.
  subscribeToMessageChannel() {
    this.subscription = subscribe(
      this.messageContext,
      RECORD_CHICK_CHANNEL,
      (message) => this.handleMessage(message)
    );
  }

  // Handler for message received by component
  handleMessage(message) {
    this.recordId = message.recordId;
  }

  // Standard lifecycle hooks used to sub/unsub to message channel
  connectedCallback() {
    this.subscribeToMessageChannel();
  }

  //提交表单时，组件将Click Submit Sucess 顺序触发自定义事件
  //单击任意Input组件(不是按钮),触发Click
  //点击按钮时,触发Submit
  //提交成功后,触发 Sucess
  handleClick() {
    console.log("Click!");
  }
  handleSubmit(event) {
    console.log("Submit!" + event.target);
    //下面的代码,用来编写自己的subimit时的处理例子
    // event.preventDefault();  // 停止Form的提交
    // const fields = event.detail.fields;
    // fields.Street = '32 Prince Street';
    // this.template.querySelector('lightning-record-edit-form').submit(fields);
  }
  handleSucess(event) {
    console.log("Sucess!" + event.target);
    this.newRecordID = event.detail.id;
    this.showNotification();
    //清空创建成功的字段值
    this.resetNewfield();
  }

  resetNewfield() {
    const inputFields = this.template.querySelectorAll(".newField");
    if (inputFields) {
      inputFields.forEach((field) => {
        field.reset();
      });
    }
  }

  showNotification() {
    const evt = new ShowToastEvent({
      title: "创建记录",
      message: `ID:${this.newRecordID} 创建成功~!`,
      variant: "success"
    });
    this.dispatchEvent(evt);
  }
}
