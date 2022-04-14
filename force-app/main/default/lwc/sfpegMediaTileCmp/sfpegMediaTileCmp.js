/***
* @author P-E GROS
* @date   April 2022
* @description  LWC Component to display an image next to a set of fields
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

import { LightningElement, api, track } from 'lwc';
import { getRecord }        from 'lightning/uiRecordApi';
import getFieldSetDesc     from '@salesforce/apex/sfpegFieldSetDescription_CTL.getFieldSetDesc';

const FIELDSET_CONFIGS = {};

export default class SfpegMediaTileCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api wrapperCss;            // CSS Classes for the wrapping div
    @api fieldSet;              // Dev Name of the fieldset for the record details
    @api imageField;            // API Name of the field containing the image URL
    @api imageDesc = 'Image';   // Description of the image
    @api imageSize = 'medium';  // CSS Classes for the wrapping card div
    @api showLabels = false;    // Detail field label activation
    @api isDebug = false;       // Debug mode activation

    //----------------------------------------------------------------
    // Internal parameters
    //----------------------------------------------------------------
    @track isReady = false;     // Configuration readiness state;
    @api objectApiName;         // Object API Name of the current record
    @api recordId;              // ID of the current record

    @track imageUrl;            // URL of the image to be displayed (fetched via imageField)
    @track titleField;          // API Name of the title field (1st field of the fieldset)
    @track detailFields;        // List of API Names of fields displayed as details (other fields of fieldset)
    @track errorMessage;        // Error message displayed (e.g. upon config retrieval issue)

    //----------------------------------------------------------------
    // Custom Getters
    //----------------------------------------------------------------
    get imageClass() {
        return "image-" + this.imageSize;
    }
    get detailList(){
        return JSON.stringify(this.detailFields);
    }
    get fieldVariant(){
        return this.showLabels ? '' : 'label-hidden';
    }

    //----------------------------------------------------------------
    // Component Initialisation
    //----------------------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START');

        if ((! this.fieldSet) || (this.fieldSet == 'N/A')) {
            console.warn('connected: END KO / missing fieldset');
            this.errorMessage = 'FieldSet not configured!';
            return;
        }

        if (FIELDSET_CONFIGS[this.fieldSet]) {
            if (this.isDebug) console.log('connected: reusing already loaded fieldset');
            this.titleField = FIELDSET_CONFIGS[this.fieldSet].titleField;
            this.detailFields = FIELDSET_CONFIGS[this.fieldSet].detailFields;
            this.isReady = true;
            if (this.isDebug) console.log('connected: END');
            return;
        }

        if (this.isDebug) console.log('connected: fetching fieldset description from server', this.fieldSet);
        getFieldSetDesc({name: this.fieldSet})
        .then( result => {
            if (this.isDebug) console.log('connected: fieldset description received ',JSON.stringify(result));

            this.detailFields = [];
            result.fields.forEach(item => this.detailFields.push(item.name));
            this.titleField = this.detailFields.shift();

            FIELDSET_CONFIGS[this.fieldSet] = {
                titleField: this.titleField,
                detailFields: this.detailFields
            }
            if (this.isDebug) console.log('connected: fieldset registered ',JSON.stringify(FIELDSET_CONFIGS[this.fieldSet]));

            this.isReady = true;
            if (this.isDebug) console.log('connected: END');
        }).catch( error => {
            console.warn('connected: END / configuration fetch error ',error);
            this.errorMessage = 'FieldSet description fetch error: ' + JSON.stringify(error);
        });
        if (this.isDebug) console.log('connected: request sent');
    }

    //----------------------------------------------------------------
    // Event Handling
    //----------------------------------------------------------------
    handleLoad(event){
        if (this.isDebug) console.log('handleLoad: START');

        if (this.isDebug) console.log('handleLoad: event ', event);
        if (this.isDebug) console.log('handleLoad: event details ', JSON.stringify(event.detail));
        
        /*let imageOutputField = this.template.querySelector('lightning-output-field[data-my-id=imageField]');
        console.log('handleLoad: imageOutputField fetched ',imageOutputField);
        console.log('handleLoad: data ',JSON.stringify(imageOutputField));

        this.imageUrl = imageOutputField.value;
        console.log('handleLoad: imageUrl set ',this.imageUrl); */

        this.imageUrl = ((((event?.detail?.records)[this.recordId])?.fields)[this.imageField])?.value;
        console.log('handleLoad: imageUrl set ',this.imageUrl);

        if (this.isDebug) console.log('handleLoad: END');
    }
}