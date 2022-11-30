import { LightningElement, wire, track } from "lwc";
import getContactList from "@salesforce/apex/ContactController.getContactList";

const COLS = [
  { label: "First Name", fieldName: "FirstName", editable: true },
  { label: "Last Name", fieldName: "LastName", editable: true },
  { label: "Title", fieldName: "Title", editable: true },
  { label: "Phone", fieldName: "Phone", type: "phone", editable: true },
  { label: "Email", fieldName: "Email", type: "email", editable: true }
];

export default class Psearch extends LightningElement {
  contacts;
  error;
  columns = COLS;
  resultCount = 0;
  @track searchText;

  handelsearchtext(event) {
    this.searchText = event.target.value;
  }

  setResultCount(event) {
    this.resultCount = event.detail;
  }

  // //Combobox  code   Start
  //   value ;

  //     get options() {
  //         return [
  //             { label: '', value: '' },
  //             { label: 'Lead', value: 'lead' },
  //             { label: 'Acc', value: 'account' },
  //             { label: 'Contact', value: 'contact' },
  //         ];
  //     }

  //     handleChange(event) {
  //       this.value = event.detail.value;
  //       if (!this.value) {
  //         getData(this.value);
  //       }
  //     }

  //   getData(tpye) {
  //     this.dbResuits = '';
  //   }
  // //Combobox  code   end

  // //  sercher Start
  // queryTerm;

  // handleKeyUp(evt) {
  //     const isEnterKey = evt.keyCode === 13;
  //     if (isEnterKey) {
  //         this.queryTerm = evt.target.value;
  //     }
  // }

  //   //sercher end
}
