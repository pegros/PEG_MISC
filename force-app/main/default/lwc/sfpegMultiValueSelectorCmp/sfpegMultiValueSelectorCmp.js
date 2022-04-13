/***
* @author P-E GROS
* @date   Feb 2022
* @description  LWC Component to set a .
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2022 pegros
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
***/

import { LightningElement, wire, api, track} from 'lwc';
//import { getPicklistValues }    from 'lightning/uiObjectInfoApi';
import { getObjectInfo }        from 'lightning/uiObjectInfoApi';
import { getRecord }            from 'lightning/uiRecordApi';
import { updateRecord }         from 'lightning/uiRecordApi';

import EDIT_LABEL   from '@salesforce/label/c.sfpegMultiValueSelectorEditlLabel';
import SAVE_LABEL   from '@salesforce/label/c.sfpegMultiValueSelectorSaveLabel';
import CANCEL_LABEL from '@salesforce/label/c.sfpegMultiValueSelectorCancelLabel';

export default class SfpegMultiValueSelectorCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api wrapperCss;                // CSS classes for the wrapping <div>
    @api headerTitle;               // Optional title displayed before the selector
    @api multiValueField;           // API Name of the multi-picklist field providing the possible values
    @api picklistFields = "[]";     // List of API Names of successive picklist fields to be set (stringified array)
    @api isDebug = false;           // Flag to activate debug mode

    //----------------------------------------------------------------
    // Internal parameters
    //----------------------------------------------------------------
    @track isReady = false;     // Flag to indicate that component ready (spinner control)
    @track isEditMode = false;  // Flag to toggle read/edit modes
    @track isUpdating = false;  // Flag to indicate that component is updating (spinner control)

    @api objectApiName;         // Object API Name for current page record
    @api recordId;              // ID of current page record

    recordFieldList = [];       // List of fields to fetch (in objectApiName.fieldApiName format)
    @track picklistValues = []; // List of remaining possible values
    @track picklistValuesOrig;  // List of all possible values
    @track picklistInputs = []; // List of fieldInputs with available values and selected value
    @track errorMessage = null; // Error message

    //----------------------------------------------------------------
    // Custom Labels
    //----------------------------------------------------------------
    editLabel = EDIT_LABEL;
    saveLabel = SAVE_LABEL;
    cancelLabel = CANCEL_LABEL;

    //----------------------------------------------------------------
    // Custom Getters
    //----------------------------------------------------------------
    get isDisabled() {
        return !this.isEditMode;
    }

    //----------------------------------------------------------------
    // Component Initialisation
    //----------------------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START');

        this.recordFieldList.push(this.objectApiName + '.' + this.multiValueField);
        let picklistFieldsJson = JSON.parse(this.picklistFields);
        picklistFieldsJson.forEach(item => {
            this.recordFieldList.push(this.objectApiName + '.' + item);
            this.picklistInputs.push({name: item});
        });
        if (this.isDebug) console.log('connected: recordFieldList init ',this.recordFieldList);
        if (this.isDebug) console.log('connected: picklistInputs preinit ',this.picklistInputs);

        if (this.isDebug) console.log('connected: END');
    }

    // Record MetaData Fetch
    @wire(getObjectInfo, { objectApiName: "$objectApiName" })
    wiredObject({ error, data }) {
        if (this.isDebug) console.log('wiredObject: START with ', this._objectApiName);
        if (data) {
            if (this.isDebug) console.log('wiredObject: data ', JSON.stringify(data));
            this.picklistInputs.forEach(item => {
                item.label = data.fields[item.name]?.label || "Undefined";
                item.help = data.fields[item.name]?.inlineHelpText;
            });            
            if (this.isDebug) console.log('wiredRecord: picklistInputs registered ', JSON.stringify(this.picklistInputs));
        }
        if (this.isDebug) console.log('wiredObject: END');
    }

    // Record Data Fetch
    @wire(getRecord, { recordId: "$recordId", fields: '$recordFieldList' })
    wiredRecord({ error, data }) {
        if (this.isDebug) console.log('wiredRecord: START with ID ', this.recordId);
        if (this.isDebug) console.log('wiredRecord: and recordFieldList ', this.recordFieldList);
        this.errorMessage = null;

        if (data) {
            if (this.isDebug) console.log('wiredRecord: data received ', JSON.stringify(data));

            //this.picklistValues = this.getFieldValue(data.fields,this.multiValueField);
            this.picklistValues = [];
            this.picklistValues.push({label:"---",value:null});
            let picklistValues = this.getFieldValue(data.fields,this.multiValueField);
            let refValues = picklistValues.value.split(';');
            let refLabels = picklistValues.displayValue.split(';');
            refValues.forEach((item,index) => {
                this.picklistValues.push({label:refLabels[index],value:item});
            })
            if (this.isDebug) console.log('wiredRecord: picklistValues registered ', JSON.stringify(this.picklistValues));
            this.picklistValuesOrig = [... this.picklistValues];

            this.picklistInputs.forEach(item => {
                item.value = (this.getFieldValue(data.fields,item.name))?.value;
            });            
            if (this.isDebug) console.log('wiredRecord: all values for picklists registered ');
            
            this.initValueSets();
            if (this.isDebug) console.log('wiredRecord: picklistInputs registered ', JSON.stringify(this.picklistInputs));
            this.isReady = true;
        }
        else if (error) {
            console.warn('wiredRecord: error raised ', JSON.stringify(error));
            this.errorMessage = "Field value retrieval issue!";
            this.isReady = true;
        }
        else {
            if (this.isDebug) console.log('wiredRecord: no data/error returned yet');
            //this.errorMessage = "No data returned!";
            //this.isReady = true;
        }

        if (this.isDebug) console.log('wiredRecord: END');
    }

    //----------------------------------------------------------------
    // Event Handlers
    //----------------------------------------------------------------
    handleChange(event) {
        if (this.isDebug) console.log('handleChange: START ',event);
        if (this.isDebug) console.log('handleChange: event ',event);
        if (this.isDebug) console.log('handleChange: event detail ',JSON.stringify(event.detail));
        if (this.isDebug) console.log('handleChange: event source name ',event.srcElement.name);

        let modifiedPicklist = this.picklistInputs.find(item => item.name === event.srcElement.name);
        if (this.isDebug) console.log('handleChange: modifiedPicklist found ',JSON.stringify(modifiedPicklist));
        modifiedPicklist.value = event.detail.value;
        if (this.isDebug) console.log('handleChange: modifiedPicklist value changed ',JSON.stringify(modifiedPicklist));

        this.initValueSets();

        if (this.isDebug) console.log('handleChange: END  ');
    }

    toggleEditMode(event){
        if (this.isDebug) console.log('toggleEditMode: START ',event);
        if (this.isDebug) console.log('toggleEditMode: current edit mode ',this.isEditMode);
        this.isEditMode = !this.isEditMode;
        if (this.isDebug) console.log('toggleEditMode: END  ');
    }

    saveChanges(event){
        if (this.isDebug) console.log('saveChanges: START ',event);

        this.isUpdating = true;

        let fields = { Id: this.recordId };
        this.picklistInputs.forEach(item => {
            if (this.isDebug) console.log('saveChanges: processing item ',item.name);
            fields[item.name] = item.value;
        });
        if (this.isDebug) console.log('saveChanges: newRecord init ',JSON.stringify(fields));
        let newRecord = {fields};

        updateRecord(newRecord)
        .then(() => {
            if (this.isDebug) console.log('saveChanges: END / save done ');
            this.isEditMode = !this.isEditMode;
            this.isUpdating = false;
        })
        .catch(error => {
            console.warn('saveChanges: save error ',JSON.stringify(error));

            
            this.errorMessage = error.body.message;
            if (this.isDebug) console.log('handleError: END / errorMessage updated ', this.errorMessage);
            this.isEditMode = !this.isEditMode;
            this.isUpdating = false;
        });

        /*
            let regexp = /message":"(.*?)"/gi;
            if (this.isDebug) console.log('saveChanges: regexp init ', regexp);
            let messageList = (JSON.stringify(error)).match(regexp);
            if (this.isDebug) console.log('saveChanges: messageList extracted ', messageList);

            this.errorMessage = messageList.reduce((previous ,current) => {
                let newCurrent = current.slice(10,-1);
                if (previous) return previous + '\n' + newCurrent;
                return newCurrent;
            },'');*/

        if (this.isDebug) console.log('saveChanges: save requested');
    }

    //----------------------------------------------------------------
    // Utilities
    //----------------------------------------------------------------
    getFieldValue = function(record,field) {
        if (this.isDebug) console.log('getFieldValue: START with field ',field);
        if (this.isDebug) console.log('getFieldValue: record provided ',record);

        if ((field) && (record)) {
            if (field.includes('.')) {
                if (this.isDebug) console.log('getFieldValue: processing relation field ');
                let index = field.indexOf('.');
                if (this.isDebug) console.log('getFieldValue: index of 1st relation ',index);
                let relationField = field.substring(0,index);
                if (this.isDebug) console.log('getFieldValue: relationField extracted ',relationField);
                let subFields = field.substring(index+1);
                if (record[relationField].value) {
                    if (this.isDebug) console.log('getFieldValue: END - fetching next field in relation ',subFields);
                   return this.getFieldValue(record[relationField].value.fields,subFields);
                }
                else {
                    console.warn('getFieldValue: END - No data for next field in relation',subFields);
                    return null;
                }
            }
            else {
                if (this.isDebug) console.log('getFieldValue: END - returning simple field ',record[field].value);
                return record[field];
            }
        }
        else {
            console.warn('getFieldValue: END - No field name or record provided');
            return null;
        }
    }

    initValueSets = function() {
        if (this.isDebug) console.log('initValueSets: START');

        let usedValues = new Set();
        let pickValues = [... this.picklistValues];
        this.picklistInputs.forEach(item => {
            if (this.isDebug) console.log('initValueSets: processing item ',item.name);
            item.pickValues = [...pickValues];
            if (item.value) {
                if (this.isDebug) console.log('initValueSets: processing item value ',item.value);
                if (usedValues.has(item.value)) {
                    if (this.isDebug) console.log('initValueSets: removing item value because already used ');
                    item.value = null;
                }
                else {
                    if (this.isDebug) console.log('initValueSets: removing item value from picklist values');
                    usedValues.add(item.value);
                    pickValues = pickValues.filter(iter => iter.value !== item.value);
                    if (this.isDebug) console.log('initValueSets: available picklist updated',JSON.stringify(pickValues));
                }
            }
            else {
                if (this.isDebug) console.log('initValueSets: item value already null ');
            }
            if (this.isDebug) console.log('initValueSets: item updated ', JSON.stringify(item));
        });

        if (this.isDebug) console.log('initValueSets: END with picklistInputs ', JSON.stringify(this.picklistInputs));
    } 
}