/***
* @author P-E GROS
* @date   June 2022
* @description  LWC Component to display a structured message.
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

import { LightningElement, api, track, wire } from 'lwc';
import { getRecord }    from 'lightning/uiRecordApi';

const sfpegMessageConfigurations = {
    "base": {
        "iconName"   : "",
        "iconVariant": "",
        "theme"      : "slds-theme_default",
        "textVariant": "slds-text-body_regular"
    },
    "notif": {
        "iconName"   : "utility:announcement",
        "iconVariant": "success",
        "theme"      : "slds-theme_default",
        "textVariant": "slds-text-color_default"
    },
    "info": {
        "iconName"   : "utility:info_alt",
        "iconVariant": "inverse",
        "theme"      : "slds-theme_info",
        "textVariant": "slds-text-color_inverse"
    },
    "info-light": {
        "iconName"   : "utility:info_alt",
        "iconVariant": "",
        "theme"      : "slds-theme_default",
        "textVariant": "slds-text-color_weak"
    },
    "warning": {
        "iconName"   : "utility:warning",
        "iconVariant": "warning",
        "theme"      : "slds-theme_warning",
        "textVariant": "slds-text-color_default"
    },
    "warning-light": {
        "iconName"   : "utility:warning",
        "iconVariant": "warning",
        "theme"      : "slds-theme_default",
        "textVariant": "slds-text-color_weak"
    },
    "error": {
        "iconName"   : "utility:error",
        "iconVariant": "inverse",
        "theme"      : "slds-theme_error",
        "textVariant": "slds-text-color_inverse"
    },
    "error-light": {
        "iconName"   : "utility:error",
        "iconVariant": "error",
        "theme"      : "slds-theme_default",
        "textVariant": "slds-text-color_error"
    },
    "success": {
        "iconName"   : "utility:success",
        "iconVariant": "inverse",
        "theme"      : "slds-theme_success",
        "textVariant": "slds-text-color_inverse"
    },
    "success-light": {
        "iconName"   : "utility:success",
        "iconVariant": "success",
        "theme"      : "slds-theme_default",
        "textVariant": "slds-text-color_success"
    },
    "alert": {
        "iconName"   : "utility:alert",
        "iconVariant": "inverse",
        "theme"      : "slds-theme_inverse",
        "textVariant": "slds-text-color_inverse"
    },
    "alert-light": {
        "iconName"   : "utility:alert",
        "iconVariant": "",
        "theme"      : "slds-theme_default",
        "textVariant": "slds-text-color_default"
    }
}

export default class sfpegContextMessageCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api wrapperCss;            // CSS classes  the wrapping <div>
    @api title;                 // Title of the message displayed
    @api message;               // Detailed message content (as String)
    @api messageField;          // Detailed message content (as API name of a text field of current record)
    @api variant = "base";      // Display variant applied for the message (from sfpegMessageConfigurations)
    @api isDebug = false;       // Flag to activate debug mode

    //----------------------------------------------------------------
    // Context variables
    //----------------------------------------------------------------
    @api    recordId;
    @api    objectApiName;
    @track  recordField = null;

    //----------------------------------------------------------------
    // Internal parameters
    //----------------------------------------------------------------
    @track  configuration = sfpegMessageConfigurations.base;    // Configuration applied
    @track  recordMessage;                                      // Message content feetched from record

    //----------------------------------------------------------------
    // Custom getters
    //----------------------------------------------------------------
    get divClass() {
        return  this.configuration.theme + ' ' + this.wrapperCss;
    }

    get hideIcon() {
        return (this.configuration.iconName === "");
    }

    //----------------------------------------------------------------
    // Component Initialization
    //----------------------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('Connected: START');

        this.configuration = sfpegMessageConfigurations[this.variant] || sfpegMessageConfigurations.base;
        if (this.isDebug) console.log('Connected: configuration set ', JSON.stringify(this.configuration));

        if (this.isDebug) console.log('Connected: title provided ', this.title);
        if (this.isDebug) console.log('Connected: message provided ', this.message);

        if (this.messageField) {
            this.recordField = this.objectApiName + '.' + this.messageField;
            if (this.isDebug) console.log('Connected: fetching message field value ', this.recordField);
        }
        console.log('Connected: END');
    }

    @wire(getRecord, { recordId: "$recordId", fields: '$recordField' })
    wiredRecord({ error, data }) {
        if (this.isDebug) console.log('wiredRecord: START with ID ', this.recordId);
        if (this.isDebug) console.log('wiredRecord: and recordField ', this.recordField);
        
        if (data) {
            if (this.isDebug) console.log('wiredRecord: data received ', JSON.stringify(data));

            //if (this.isDebug) console.log('wiredRecord: data fields ', JSON.stringify(data.fields));
            let fieldValue = '';
            try {
                if (this.messageField.includes('.')) {
                    let fieldParts = this.messageField.split('.');
                    if (this.isDebug) console.log('wiredRecord: getting complex messageField value ', fieldParts);
                    fieldValue = data;
                    let lastIndex = fieldParts.size - 1;
                    fieldParts.forEach((iter,index) => {
                        if (index == lastIndex) {
                            fieldValue = fieldValue?.fields[iter]?.displayValue || fieldValue?.fields[iter]?.value;
                        }
                        else {
                            fieldValue = fieldValue?.fields[iter]?.value;
                        }
                    });
                }
                else {
                    if (this.isDebug) console.log('wiredRecord: getting simple messageField value ', this.messageField);
                    fieldValue = data.fields[this.messageField]?.displayValue || data.fields[this.messageField]?.value;
                }
            }
            catch (error) {
                console.warn('wiredRecord: error while extracting messageField value ', JSON.stringify(error));
            }
            if (this.isDebug) console.log('wiredRecord: fieldValue extracted ', fieldValue);

            //if (this.isDebug) console.log('wiredRecord: message field ', JSON.stringify((data.fields)[this.messageField]));
            //this.recordMessage = ((data.fields)[this.messageField]).displayValue || ((data.fields)[this.messageField]).value;
            this.recordMessage = fieldValue;
            if (this.isDebug) console.log('wiredRecord: record message set ', this.recordMessage);
        }
        else if (error) {
            console.warn('wiredRecord: error raised ', JSON.stringify(error));
        }
        else {
            if (this.isDebug) console.log('wiredRecord: no data/error returned yet');
        }

        if (this.isDebug) console.log('wiredRecord: END'); 
    }
}