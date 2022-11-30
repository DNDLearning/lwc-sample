import { LightningElement, wire, api } from "lwc";

import getContactList from "@salesforce/apex/ContactController.getContactList";
import findContacts from "@salesforce/apex/ContactController.findContacts";
import { getFieldValue, deleteRecord } from "lightning/uiRecordApi";
import { refreshApex } from "@salesforce/apex";

// Import message service features required for publishing and the message channel
import { publish, MessageContext } from "lightning/messageService";
import RECORD_CHICK_CHANNEL from "@salesforce/messageChannel/pMsgChanne__c";

import { ShowToastEvent } from "lightning/platformShowToastEvent";

const actions = [
  { label: "Show details", name: "show_details" },
  { label: "Delete", name: "delete" }
];

const COLS = [
  {
    label: "Name",
    fieldName: "nameUrl",
    editable: false,
    type: "url",
    typeAttributes: {
      label: { fieldName: "Name" },
      target: "_blank",
      sortable: true
    }
  },

  {
    label: "Title",
    fieldName: "Title",
    editable: true,
    type: "button",
    typeAttributes: {
      label: { fieldName: "Title", variant: "base" }
    }
  },

  { label: "Phone", fieldName: "Phone", type: "phone", editable: true },
  { label: "Email", fieldName: "Email", type: "email", editable: true },
  {
    label: "Action",
    type: "action",
    typeAttributes: { rowActions: actions, menuAlignment: "left" }
  }
];
//延迟调用查询数据库方法,
const DELAY = 350;

export default class PDataTable extends LightningElement {
  contacts;
  error;
  columns = COLS;
  //@api searchText = '';
  _searchText = "";
  searchTextForRefresh = "";
  name;
  wiredfindcontactsResult;

  //serchResultCount;
  @wire(findContacts, { searchText: "$_searchText" })
  wiredfindcontacts(value) {
    this.wiredfindcontactsResult = value;
    const { data, error } = value;
    if (data) {
      this.contacts = JSON.parse(JSON.stringify(data));
      this.serchResultCount = this.contacts.length;

      let nameUrl;
      this.contacts = data.map((row) => {
        nameUrl = `/${row.Id}`;
        return { ...row, nameUrl };
      });

      this.error = error;
    } else if (error) {
      this.error = error;
      this.contacts = undefined;
    }
  }

  @wire(MessageContext)
  messageContext;

  set serchResultCount(value) {
    this.dispatchEvent(new CustomEvent("serchresultcount", { detail: value }));
  }
  get serchResultCount() {
    return this.serchResultCount;
  }

  get searchText() {
    return this._searchText;
  }

  @api
  set searchText(value) {
    window.clearTimeout(this.delayTimeout);
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.delayTimeout = setTimeout(() => {
      if (value.length === 0) {
        return;
      }

      this._searchText = value;
      this.searchTextForRefresh = value;
    }, DELAY);
  }
  handleSelectedTitle(event) {
    console.log("getSelectedTitle");
    //两种方式获取选中的行，第一种是使用 event.detail.selectedRows，另外一种是使用querySelector找到 lightning-datatable，然后使用datatable封装的方法
    //const selectedRows = event.detail.selectedRows;
    const dataTable = this.template.querySelector("lightning-datatable");
    const selectedRows = dataTable.getSelectedRows();
    // Display that fieldName of the selected rows
    for (let i = 0; i < selectedRows.length; i++) {
      console.log("You selected: " + selectedRows[i].Title);
    }
  }

  //本方法只是为了模拟dataTabale上的单击和行Action的示例代码,不具有实际的显示删除功能
  handleRowAction(event) {
    //如果在画面上点击的是Titel(button类型),则action返回的是发生点击行的记录信息
    const row = event.detail.row;
    //publishing message
    const payload = { recordId: row.Id };
    publish(this.messageContext, RECORD_CHICK_CHANNEL, payload);

    //如果在画面上选择的下拉按钮的Action在会返回这个action的name
    const action = event.detail.action;

    //得到当前行的所在的Index
    const rows = this.contacts;
    const rowIndex = rows.findIndex((item) => item.Id === row.Id);

    switch (action.name) {
      case "show_details":
        console.log("Showing Details: " + JSON.stringify(row));
        break;
      case "delete":
        this.deleteCruntRow(row.Id);
        rows.splice(rowIndex, 1);
        this.contacts = rows;
        this._searchText = " ";

        break;

      default:
        break;
    }
  }
  deleteCruntRow(CruntRowID) {
    deleteRecord(CruntRowID)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Record deleted",
            variant: "success"
          })
        );
        //キャッシュ更新
        refreshApex(this.wiredfindcontactsResult);
        // Navigate to a record home page after
        // the record is deleted, such as to the
        // contact home page
        // this[NavigationMixin.Navigate]({
        //   type: "standard__objectPage",
        //   attributes: {
        //     objectApiName: "Contact",
        //     actionName: "home"
        //   }
        // });
      })
      .catch((error) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error deleting record",
            message: error.body.message,
            variant: "error"
          })
        );
      });
  }
}
