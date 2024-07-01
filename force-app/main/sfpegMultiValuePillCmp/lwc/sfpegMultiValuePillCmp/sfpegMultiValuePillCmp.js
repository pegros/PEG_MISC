/***
* @author P-E GROS
* @date   April 2024
* @description  LWC Component to display the (multi-)picklist field value
*               of a record via Lightning Data Service as a (set of) pill(s).
*               Part of the PEG_MISC package.
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2024 pegros
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

import { LightningElement, api , wire } from 'lwc';
import { getRecord }            from 'lightning/uiRecordApi';
///import { getPicklistValues }    from 'lightning/uiObjectInfoApi';
import { getObjectInfo }        from 'lightning/uiObjectInfoApi';
export default class SfpegMultiValuePillCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api wrapperCss;                // CSS classes for the wrapping <div>
    @api tagCss;                    // CSS classes for the individual badges
    @api recordField;               // Name of the picklist field on the current record (as "Object.Field" API Names)
    @api showLabel;                 // Flag to display the field label
    @api variant;                   // Variant to display the tags (badge vs pills vs CSV)
    @api showBorder = false;        // Flag to display the bottom border below the field value (as in forms)
    @api isReadOnly = false;        // Flag to enforce read-only mode
    @api editTitlePrefix = 'Edit';  // Prefix for the edit button icon title
    @api isDebug = false;           // Flag to activate debug mode

    //----------------------------------------------------------------
    // Internal parameters
    //----------------------------------------------------------------
    recordFieldName;            // picklist field API Name
    recordFieldLabel;           // picklist field Label
    isFieldEditable = false;    // Flag to indicate that field is editable for the user
    recordFieldValue;           // picklist field value
    recordTypeId;               // record type ID of the current record
    recordFieldDesc;            // Description of the picklist field
    tags;                       // resulting tags coming from the picklist value.
    isEditMode = false;         // Edit mode toggle state

    //----------------------------------------------------------------
    // Context parameters
    //----------------------------------------------------------------
    @api objectApiName;         // Object API Name for current page record (if any)
    @api recordId;              // ID of current page record (if any)

    //----------------------------------------------------------------
    // Custom Getters
    //----------------------------------------------------------------
    get elementClass() {
        return 'slds-form-element slds-form-element_readonly slds-p-horizontal_medium' + (this.showBorder ? '' : ' noBottomBorder');
    }
    get isBadge() {
        return (this.variant === 'badge');
    }
    get isPill() {
        return (this.variant === 'pill');
    }
    get pillClass() {
        return 'slds-pill ' + this.tagCss;
    }
    get csvValue() {
        return (this.recordFieldValue?.displayValue?.replace(';',', '));
    }

    get showEdit() {
        return !this.isReadOnly && this.isFieldEditable;
    }
    get editTitle() {
        return this.editTitlePrefix + ' ' + this.recordFieldLabel;
    }
    get fieldList() {
        return [this.recordFieldName];
    }

    //----------------------------------------------------------------
    // contextual Data Fetch  
    //----------------------------------------------------------------
    
    //wiredObjectData;
    @wire(getObjectInfo, { objectApiName: "$objectApiName" })
    wiredObject({ error, data }) {
        if (this.isDebug) console.log('wiredObject: START with ', this.objectApiName);
        //this.wiredObjectData = data;
        if (data) {
            if (this.isDebug) console.log('wiredObject: defaultRecordTypeId ', data.defaultRecordTypeId);
            if (this.isDebug) console.log('wiredObject: data ', JSON.stringify(data));
            this.recordFieldDesc = data.fields[this.recordFieldName];
            if (this.isDebug) console.log('wiredObject: recordFieldDesc set ', JSON.stringify(this.recordFieldDesc));
            this.recordFieldLabel = this.recordFieldDesc?.label;
            if (this.isDebug) console.log('wiredObject: recordFieldLabel set ', this.recordFieldLabel);
            this.isFieldEditable = this.recordFieldDesc?.updateable
            if (this.isDebug) console.log('wiredObject: isFieldEditable set ', this.isFieldEditable);
        }
        if (this.isDebug) console.log('wiredObject: END');
    }

    // Record Data Fetch
    @wire(getRecord, { recordId: "$recordId", fields: '$recordField' })
    wiredRecord({ error, data }) {
        if (this.isDebug) console.log('wiredRecord: START with ID ', this.recordId);
        if (this.isDebug) console.log('wiredRecord: and field ', this.recordField);

        if (data) {
            if (this.isDebug) console.log('wiredRecord: data received ', JSON.stringify(data));

            this.recordTypeId = data.recordTypeId || (this.recordId.slice(0,3) + '000000000000AAA'); // standard ID value for "null" RT
            if (this.isDebug) console.log('wiredRecord: record type ID registered ', this.recordTypeId);

            this.recordFieldValue = data.fields[this.recordFieldName];
            if (this.isDebug) console.log('wiredRecord: field Value registered ', JSON.stringify(this.recordFieldValue));

            if (this.recordFieldValue?.displayValue) {
                this.tags = this.recordFieldValue.displayValue.split(';');
                if (this.isDebug) console.log('wiredRecord: tags extracted', JSON.stringify(this.tags));
            }
            else {
                if (this.isDebug) console.log('wiredRecord: no tag to display');
                this.tags = null;
            }

            /*if (this.isDebug) console.log('wiredRecord: wiredObjectData fetched ', JSON.stringify(this.wiredObjectData));
            let recordInput = generateRecordInputForUpdate(data, this.wiredObjectData);
            if (this.isDebug) console.log('wiredRecord: recordInput init ', JSON.stringify(recordInput));

            if (this.isDebug) console.log('wiredRecord: checking recordFieldName ', this.recordFieldName);
            this.isRecordEditable = recordInput.fields.hasOwnProperty(this.recordFieldName) || false;
            if (this.isDebug) console.log('wiredRecord: isRecordEditable init ', this.isRecordEditable);*/
        }
        else if (error) {
            console.warn('wiredRecord: error raised ', JSON.stringify(error));
        }
        else {
            if (this.isDebug) console.log('wiredRecord: no data/error returned yet');
        }

        if (this.isDebug) console.log('wiredRecord: END');
    }

    // Picklist per RecordType Description Fetch
    /*@wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: '$recordField' })
    wiredPicklist({ error, data }) {
        if (this.isDebug) console.log('wiredPicklist: START with ID ', this.recordId);
        if (this.isDebug) console.log('wiredPicklist: and field ', this.recordField);

        if (data) {
            if (this.isDebug) console.log('wiredPicklist: data received ', JSON.stringify(data));
            this.recordFieldDesc =  data;
        }
        else if (error) {
            console.warn('wiredPicklist: error raised ', JSON.stringify(error));
            //this.errorMessage = "Picklist values retrieval issue!";
            //this.isReady = true;
        }
        else {
            if (this.isDebug) console.log('wiredPicklist: no data/error returned yet');
            //this.errorMessage = "No data returned!";
            //this.isReady = true;
        }

        if (this.isDebug) console.log('wiredPicklist: END');
    } */


    //----------------------------------------------------------------
    // Component Initialisation
    //----------------------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START pill for field ',this.recordField);
            console.log('connected: objectApiName provided ',this.objectApiName);
            console.log('connected: recordId provided ',this.recordId);
            console.log('connected: variant provided ',this.variant);
        }
        this.recordFieldName = this.recordField?.split('.')?.pop();
        if (this.isDebug) console.log('connected: recordFieldName extracted ',this.recordFieldName);
        if (this.isDebug) console.log('connected: END pill');
    }

    //----------------------------------------------------------------
    // Event Handlers 
    //----------------------------------------------------------------
    toggleEdit(event) {
        if (this.isDebug) console.log('toggleEdit: START Pill ',this.recordFieldName);
        this.isEditMode = true;
        if (this.isDebug) console.log('toggleEdit: END Pill with isEditMode ',this.isEditMode);
    }

    handleSuccess(event) {
        if (this.isDebug) console.log('handleSuccess: START Pill ',this.recordFieldName);
        this.isEditMode = false;
        if (this.isDebug) console.log('handleSuccess: END Pill with isEditMode ',this.isEditMode);
    }
}