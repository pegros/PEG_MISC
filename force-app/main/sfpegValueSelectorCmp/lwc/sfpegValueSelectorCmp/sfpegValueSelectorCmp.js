/***
* @author P-E GROS
* @date   Jan 2022
* @description  LWC Component to automatically change a picklist field value
*               on a record via Lightning Data Service (on current User or Record).
*               Part of the PEG_MISC package.
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

import currentUserId            from '@salesforce/user/Id';
/*import { getRecord }            from 'lightning/uiRecordApi';
import { getPicklistValues }    from 'lightning/uiObjectInfoApi';
import { getObjectInfo }        from 'lightning/uiObjectInfoApi';
import { updateRecord }         from 'lightning/uiRecordApi';*/

import LOAD_LABEL   from '@salesforce/label/c.sfpegValueSelectorLoadLabel';
import UPDATE_LABEL from '@salesforce/label/c.sfpegValueSelectorUpdateLabel';

export default class SfpegValueSelectorCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api wrapperCss;                // CSS classes for the wrapping <div>
    @api headerTitle;               // Optional title displayed before the selector
    @api displayMode = 'picklist';  // Display mode for the Selector (path, progress, tabs, buttons, picklist, radio, tabsV)
    @api recordField;               // API Name of the picklist field on the current record
    @api userField;                 // API Name of the picklist field on the current user
    @api isReadOnly = false;        // Flag to activate read-only mode
    @api isDebug = false;           // Flag to activate debug mode

    //----------------------------------------------------------------
    // Internal parameters
    //----------------------------------------------------------------
    @track isReady = false;     // Flag to indicate that component ready
    @track isUpdating = false;  // Flag to indicate that component is updating

    @api objectApiName;         // Object API Name for current page record (if any)
    @api recordId;              // ID of current page record (if any)
    userId = currentUserId;     // ID of current User

    @track _objectApiName;      // Object API Name of the record for which picklist is considered

    @track _recordId;           // ID of the record for which the picklist field is fetched
    @track _recordTypeId;       // Record Type ID value 

    @track _recordField;        // Record field to be retrieved (as Object.Field for @wire service)
    @track _recordFieldList;    // List for @wire service
    @track _recordFieldShort;   // Picklist field APÏ Name
    @track _recordFieldValue;   // Record field value retrieved (code + label)
    @track _recordFieldDesc;    // Picklist Field Description 

    @track displayOptions;      // List of possible values for the Selector (depends on mode)
    @track selectedOption;      // Current active selection value
    @track selectedLabel;       // Current active selection label

    @track errorMessage;        // Error Message Display

    //----------------------------------------------------------------
    // Custom Labels
    //----------------------------------------------------------------
    loadLabel = LOAD_LABEL;
    updateLabel = UPDATE_LABEL;

    //----------------------------------------------------------------
    // Custom getters
    //----------------------------------------------------------------
    get headerClass() {
        return 'slds-card__header-title slds-m-right_large slds-m-vertical_xx-small slds-flexi-truncate';
    }
    get isPicklist() {
        return this.displayMode === 'picklist';
    }
    get isRadio() {
        return this.displayMode === 'radio';
    }
    get isButtons() {
        return this.displayMode === 'buttons';
    }
    get isTabs() {
        return this.displayMode === 'tabs';
    }
    get isTabsV() {
        return this.displayMode === 'tabsV';
    }
    get isProgress() {
        return this.displayMode === 'progress';
    }
    get isPath() {
        return this.displayMode === 'path';
    }
    get isLoading() {
        return !this.isReady;
    }
    /*get selectedLabel() {
        return this._recordFieldValue?.label;
    }*/
    /*get isUser() {
        return this._objectApiName === 'User';
    }*/

    //----------------------------------------------------------------
    // Component Initialisation
    //----------------------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START');

        if (this.recordField && this.recordField != 'N/A') {
            this._objectApiName = this.objectApiName;
            if (this.isDebug) console.log('connected: current Object API Name set ',this._objectApiName);
            this._recordField = this.recordField;
            if (this.isDebug) console.log('connected: current Record field set ',this._recordField);
            this._recordId = this.recordId;
            if (this.isDebug) console.log('connected: current Record ID set ',this._recordId);
        }
        else if (this.userField && this.userField != 'N/A') {
            this._objectApiName = 'User';
            if (this.isDebug) console.log('connected: User Object API Name set ',this._objectApiName);
            this._recordField = this.userField;
            if (this.isDebug) console.log('connected: User field set ',this._recordField);
            this._recordId = this.userId;
            if (this.isDebug) console.log('connected User ID set ',this._recordId);
        }
        else {
            console.warn('connected: no user/record field selected');
            this.isReady = true;
            this.errorMessage = "No user / record field selected!";
        }
        if (this._recordField) {
            this._recordFieldList = [this._recordField];
            this._recordFieldShort = this._recordField.slice(this._recordField.indexOf('.') + 1);
            if (this.isDebug) console.log('connected: short field name set ',this._recordFieldShort);
        }
        if (this.isDebug) console.log('connected: END');
    }

    //----------------------------------------------------------------
    // contextual Data Fetch  
    //----------------------------------------------------------------

    /*
    @wire(getObjectInfo, { objectApiName: "$_objectApiName" })
    wiredObject({ error, data }) {
        if (this.isDebug) console.log('wiredObject: START with ', this._objectApiName);
        if (data) {
            if (this.isDebug) console.log('wiredObject: defaultRecordTypeId ', data.defaultRecordTypeId);
            if (this.isDebug) console.log('wiredObject: data ', JSON.stringify(data));
        }
        if (this.isDebug) console.log('wiredObject: END');
    }

    // Record Data Fetch
    @wire(getRecord, { recordId: "$_recordId", fields: '$_recordFieldList' })
    wiredRecord({ error, data }) {
        if (this.isDebug) console.log('wiredRecord: START with ID ', this._recordId);
        if (this.isDebug) console.log('wiredRecord: and field ', this._recordField);
        this.errorMessage = null;

        if (data) {
            if (this.isDebug) console.log('wiredRecord: data received ', JSON.stringify(data));

            let oldRT = this._recordTypeId;
            if (this._objectApiName === 'User') {
                this._recordTypeId = null;
            }
            else {
                this._recordTypeId = data.recordTypeId || (this._recordId.slice(0,3) + '000000000000AAA'); // standard ID value for "null" RT
            }
            if (this.isDebug) console.log('wiredRecord: record type ID registered ', this._recordTypeId);

            this._recordFieldValue = data.fields[this._recordFieldShort];
            if (this.isDebug) console.log('wiredRecord: field Value registered ', JSON.stringify(this._recordFieldValue));

            if (oldRT !== this._recordTypeId) {
                if (this.isDebug) console.log('wiredRecord: waiting for picklist description');
            }
            else {
                if (this.isDebug) console.log('wiredRecord: finalising the display (same RT)');
                this.finalizeConfig();
            }
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

    // Picklist per RecordType Description Fetch
    @wire(getPicklistValues, { recordTypeId: '$_recordTypeId', fieldApiName: '$_recordField' })
    wiredPicklist({ error, data }) {
        if (this.isDebug) console.log('wiredPicklist: START with ID ', this._recordId);
        if (this.isDebug) console.log('wiredPicklist: and field ', this._recordField);

        if (data) {
            if (this.isDebug) console.log('wiredPicklist: data received ', JSON.stringify(data));
            this._recordFieldDesc =  data;
            this.finalizeConfig();
        }
        else if (error) {
            console.warn('wiredPicklist: error raised ', JSON.stringify(error));
            this.errorMessage = "Picklist values retrieval issue!";
            this.isReady = true;
        }
        else {
            if (this.isDebug) console.log('wiredPicklist: no data/error returned yet');
            //this.errorMessage = "No data returned!";
            //this.isReady = true;
        }

        if (this.isDebug) console.log('wiredPicklist: END');
    } 
    */

    //----------------------------------------------------------------
    // Event handlers
    //----------------------------------------------------------------
    // Init finalization / Update handling (from record-form)
    handleLoad(event){
        if (this.isDebug) console.log('handleLoad: START');
        if (this.isDebug) console.log('handleLoad: event',event);
        if (this.isDebug) console.log('handleLoad: details',JSON.stringify(event.detail));

        if ((event.detail) && (event.detail.records)) {
            let recordData = event.detail.records[this._recordId];
            if (this.isDebug) console.log('handleLoad: record data fetched',JSON.stringify(recordData));

            if (recordData) {
                this._recordTypeId = recordData.recordTypeId;
                if (this.isDebug) console.log('handleLoad: record type ID set', this._recordTypeId);

                this._recordFieldValue = recordData.fields[this._recordFieldShort];
                if (this.isDebug) console.log('handleLoad: record field value set', this._recordFieldValue);
                this.selectedOption = this._recordFieldValue?.value;
                if (this.isDebug) console.log('handleLoad: selectedOption set', this.selectedOption);
                this.selectedLabel = this._recordFieldValue?.displayValue;
                if (this.isDebug) console.log('handleLoad: selectedLabel set', this.selectedLabel);

                if (!this.selectedOption) {
                    console.warn('handleLoad: no value set');
                    this.errorMessage = "No value set for field!"
                }
                else {
                    this.errorMessage = '';
                }
                this.isUpdating = false;
                if (this.isDebug) console.log('handleLoad: stopping update spinner');
            }
            else {
                console.warn('handleLoad: missing recordData');
                this.errorMessage = "Record Data retrieval for record ID failed!";
                this.isReady = true;
            }
        }
        else {
            console.warn('handleLoad: missing form details');
            this.errorMessage = "Record Data retrieval failed!";
            this.isReady = true;
        }
        
        if ((event.detail) && (event.detail.picklistValues)) {
            let picklistData = event.detail.picklistValues[this._recordFieldShort];
            if (this.isDebug) console.log('handleLoad: picklist metadata fetched',JSON.stringify(picklistData));

            if (picklistData) {
                this._recordFieldDesc = picklistData.values;
                if (this.isDebug) console.log('handleLoad: picklist metadata set ', JSON.stringify(this._recordFieldDesc));
                this.finalizeConfig();
            }
            else {
                console.warn('handleLoad: missing picklist metadata details');
                this.errorMessage = "Picklist Metadata retrieval failed!";
                this.isReady = true;
            }
        }
        else {
            console.warn('handleLoad: missing picklist details in form');
            this.errorMessage = "Picklist Data retrieval failed!";
            this.isReady = true;
        }
        if (this.isDebug) console.log('handleLoad: END');
    }

    // Update error handling (from record-form)
    handleError(event){
        if (this.isDebug) console.log('handleError: START');
        if (this.isDebug) console.log('handleError: event',event);
        if (this.isDebug) console.log('handleError: details',JSON.stringify(event.detail));

        let regexp = /message":"(.*?)"/gi;
        if (this.isDebug) console.log('handleError: regexp init ', regexp);
        let messageList = (JSON.stringify(event.detail)).match(regexp);
        if (this.isDebug) console.log('handleError: messageList extracted ', messageList);

        this.errorMessage = messageList.reduce((previous ,current) => {
            let newCurrent = current.slice(10,-1);
            if (previous) return previous + '\n' + newCurrent;
            return newCurrent;
        },'');
        //this.errorMessage = messageList.join('\n');
        if (this.isDebug) console.log('handleError: errorMessage updated ', this.errorMessage);

        this.isUpdating = false;
        if (this.isDebug) console.log('handleError: stopping update spinner');

        if (this.isDebug) console.log('handleError: END');
    }

    // For picklist mode change event
    handleSelect(event){
        if (this.isDebug) console.log('handleSelect: START');
        if (this.isDebug) console.log('handleSelect: event',event);
        //if (this.isDebug) console.log('handleSelect: details',JSON.stringify(event.detail));

        let target = event.detail.value;
        if (this.isDebug) console.log('handleSelect: event detail value',JSON.stringify(target));

        if (target.value !== this._recordFieldValue?.value) {
            if (this.isDebug) console.log('handleSelect: requesting selection update');
            this.updateRecord(target);
            if (this.isDebug) console.log('handleSelect: selection update requested');
        }
        else {
            if (this.isDebug) console.log('handleSelect: current value reselected ');
        }
        
        if (this.isDebug) console.log('handleSelect: END');
    }

    // For radio group mode change event
    handleChange(event){
        if (this.isDebug) console.log('handleChange: START');
        if (this.isDebug) console.log('handleChange: event',event);
        if (this.isDebug) console.log('handleChange: details',JSON.stringify(event.detail));

        let targetVal = event.target?.value;
        if (this.isDebug) console.log('handleChange: target value ',targetVal);

        if (this.displayOptions) {
            let target = this.displayOptions.find(iter => iter.value == targetVal);
            if (this.isDebug) console.log('handleChange: target fetched ',JSON.stringify(target));

            if (target.value !== this._recordFieldValue?.value) {
                if (this.isDebug) console.log('handleChange: requesting selection update');
                this.updateRecord(target);
                if (this.isDebug) console.log('handleChange: selection update requested');
            }
            else {
                if (this.isDebug) console.log('handleChange: current value reselected ');
            }
        }
        else {
            if (this.isDebug) console.log('handleChange: displayOptions not initialized ');
        }
        if (this.isDebug) console.log('handleChange: END');
    }

    // For buttons mode change event
    handleClick(event){
        if (this.isDebug) console.log('handleClick: START');
        if (this.isDebug) console.log('handleClick: event',event);
        //if (this.isDebug) console.log('handleClick: details',JSON.stringify(event.detail));

        let target = event.target.value;
        if (this.isDebug) console.log('handleClick: event target value',JSON.stringify(target));

        if (target.value !== this._recordFieldValue?.value) {
            if (this.isDebug) console.log('handleClick: requesting selection update');
            this.updateRecord(target);
            if (this.isDebug) console.log('handleClick: selection update requested');
        }
        else {
            if (this.isDebug) console.log('handleClick: current value reselected ');
        }
        if (this.isDebug) console.log('handleClick: END');
    }

    // For tabs mode change event
    handleActivate(event){
        if (this.isDebug) console.log('handleActivate: START');
        if (this.isDebug) console.log('handleActivate: event ',event);
        if (this.isDebug) console.log('handleActivate: details ',JSON.stringify(event.detail));
        
        if (this.isDebug) console.log('handleActivate: target ',event.target);
        if (this.isDebug) console.log('handleActivate: target label ',event.target?.label);
        let targetVal = event.target?.value;
        if (this.isDebug) console.log('handleActivate: target value ',targetVal);

        if (this.displayOptions) {
            if (this._recordFieldValue) {
                let target = this.displayOptions.find(iter => iter.value == targetVal);
                if (this.isDebug) console.log('handleActivate: target fetched ',JSON.stringify(target));

                if (target.value !== this._recordFieldValue?.value) {
                    if (this.isDebug) console.log('handleActivate: requesting selection update');
                    this.updateRecord(target);
                    if (this.isDebug) console.log('handleActivate: selection update requested');
                }
                else {
                    if (this.isDebug) console.log('handleActivate: current value reselected ');
                }
            }
            else {
                if (this.isDebug) console.log('handleActivate: _recordFieldValue not initialized ');
            }
        }
        else {
            if (this.isDebug) console.log('handleActivate: displayOptions not initialized ');
        }
        if (this.isDebug) console.log('handleActivate: END');
    }

    // For path mode change event
    handleFocus(event){
        if (this.isDebug) console.log('handleFocus: START');
        if (this.isDebug) console.log('handleFocus: event',event);
        if (this.isDebug) console.log('handleFocus: details',JSON.stringify(event.detail));

        let target = this.displayOptions[(event.detail?.index || 0)];
        if (this.isDebug) console.log('handleFocus: target fetched ',JSON.stringify(target));

        if (target.value !== this._recordFieldValue?.value) {
            if (this.isDebug) console.log('handleFocus: requesting selection update');
            this.updateRecord(target);
            if (this.isDebug) console.log('handleFocus: selection update requested');
        }
        else {
            if (this.isDebug) console.log('handleFocus: current value reselected ');
        }
        if (this.isDebug) console.log('handleFocus: END');
    }

    //----------------------------------------------------------------
    // Utilities
    //----------------------------------------------------------------

    //Configuration finalisation
    finalizeConfig = function() {
        if (this.isDebug) console.log('finalizeConfig: START');
        if (this.isDebug) console.log('finalizeConfig: field value ', JSON.stringify(this._recordFieldValue));
        this.displayOptions = [];
        
        if (this._recordFieldDesc) {
            if (this.isDebug) console.log('finalizeConfig: analysing picklist description ', JSON.stringify(this._recordFieldDesc));

            this._recordFieldDesc.forEach(iter => {
                if (this.isDebug) console.log('finalizeConfig: processing iter ', JSON.stringify(iter));
                this.displayOptions.push({
                    label: iter.label,
                    value: iter.value,
                    variant: (iter.value == this._recordFieldValue?.value ? 'brand' : 'border'),
                    icon: (iter.value == this._recordFieldValue?.value ? 'utility:check' : ''),
                    selected : (iter.value == this._recordFieldValue?.value)
                });
            });
            if (this.isDebug) console.log('finalizeConfig: displayOptions finalized', JSON.stringify(this.displayOptions));
        }
        else {
            console.warn('finalizeConfig: missing descriptions');
            this.errorMessage = "Picklist initialisation failure!";
        }
        this.isReady = true;

        if (this.isDebug) console.log('finalizeConfig: END');
    }

    // Picklist value update request
    updateRecord = function(newValue) {
        if (this.isDebug) console.log('updateRecord: START  with ',JSON.stringify(newValue));

        //if (this.isDebug) console.log('updateRecord: updating selection ');
        //this._recordFieldValue = newValue;            

        this.isUpdating = true;
        if (this.isDebug) console.log('updateRecord: launching update spinner');

        let inputField = this.template.querySelector('lightning-input-field');
        if (this.isDebug) console.log('updateRecord: inputField component fetched ',inputField);

        inputField.value = newValue.value;
        if (this.isDebug) console.log('updateRecord: inputField value set ', inputField.value);

        this.template.querySelector('lightning-record-edit-form').submit();
        if (this.isDebug) console.log('updateRecord: END / change submitted');
        return;
    }

}