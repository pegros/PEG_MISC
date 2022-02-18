/***
* @author P-E GROS
* @date   Feb 2022
* @description  LWC Component to upload/display/update a specific related file on a record. 
*               It relies on custom string field on the object to store the ID of the corresponding 
*               ContentDocument and may generate/store the download URL on another.
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

import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin }  from 'lightning/navigation';
import { getRecord }        from 'lightning/uiRecordApi';
import { updateRecord }     from 'lightning/uiRecordApi';
import { ShowToastEvent }   from 'lightning/platformShowToastEvent';


export default class SfpegFileManagerCmp extends NavigationMixin(LightningElement) {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api wrapperCss;                // CSS classes for the wrapping <div>
    @api displayMode = 'vertical';  // Display mode (horizontal, vertical)
    @api displaySize = 'medium';    // Display size of the image

    @api cardTitle;                 // Label for the wrapping card
    @api cardIcon;                  // Icon for the wrapping card

    @api fileField;                 // API Name of the field containing the ID of the current ContentDocument
    @api urlField;                  // Optional API Name of the field to be updated with the download URL of the ContentDocument
    @api descField;                 // Optional API Name of the field containing an additional textual description
    @api tagField;                  // Optional API Name of the multi-select field containing tags to display below

    @api showUpload = false;        // Flag to show upload button when no image is present
    @api basePath;                  // Base path of the community

    @api isDebug = false;           // Flag to activate debug mode


    //----------------------------------------------------------------
    // Internal parameters
    //----------------------------------------------------------------
    @track isReady;             // Flag indicating if the component is ready to display

    @api objectApiName;         // Object API Name for current page record (if any)
    @api recordId;              // ID of current page record (if any)
    @track recordFields;        // Fields to fetch on the current record
    recordData;                 // Record data fetched

    @track contentDocumentId;   // ID of the current ContentDocument
    contentDocumentFields = [
        "ContentDocument.Title",
        "ContentDocument.LatestPublishedVersionId",
        "ContentDocument.ContentSize",
        "ContentDocument.FileType"];    // Fields to fetch on the ContentDocument
    //@track contentDocument;   // Data of the current ContentDocument
    //@track lastVersionId;     // ID of the last ContentVersion of the ContentDocument
    @track fileUrl;             // Download URL of the file
    fileType;                   // File type of the ContentDocument
    //@track isImage = false;     // Flag indicating that the component is an image
    //@track isPdf = false;       // Flag indicating that the component is a pdf

    @track description;         // Description fetched
    @track tags;                // Tags fetched
    @track errorMessage;        // Possible error message.

    //----------------------------------------------------------------
    // Custom Getters
    //----------------------------------------------------------------
    get globalContainerClass() {
        return " slds-grid slds-gutters slds-grid_vertical-align-center "
            + (this.displayMode === 'vertical' ? "slds-wrap" : "");
    }
    // slds-p-horizontal_medium
    get imageContainerClass() {
        //
        return "slds-align_absolute-center slds-col slds-p-vertical_x-small slds-p-horizontal_medium slds-grow-none slds-shrink-none "
            + (this.displayMode === 'vertical' ? 'slds-size_1-of-1': (this.hasTagDescription ? 'slds-size_1-of-3' : 'slds-size_1-of-1'));
    }
    get imageClass() {
        return "fileImage fileImage-" + this.displaySize + (this.fileType === 'PDF' ? ' fileImage-border' : '');
    }
    get hasTagDescription() {
        return (this.description || this.tags);
    }
    get tagDescriptionClass() {
        //
        return "slds-col slds-grid slds-wrap slds-col_bump-left " + (this.displayMode === 'vertical' ? 'slds-size_1-of-1':'');
    }
    get acceptedFormats() {
        return ['.jpg', '.png', '.jpeg', '.pdf'];
    }

    //----------------------------------------------------------------
    // Component Initialisation
    //----------------------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START');

        if (! this.fileField) {
            console.warn('connected: END KO / missing fileField');
            this.errorMessage = "File ID Field is missing in configuration!";
            this.isReady = true;
            return;
        }
        
        let recordFields = [];
        recordFields.push( this.objectApiName + '.' + this.fileField);

        if (this.urlField) {
            recordFields.push( this.objectApiName + '.' + this.urlField);
        }
        if (this.descField) {
            recordFields.push( this.objectApiName + '.' + this.descField);
        }
        if (this.tagField) {
            recordFields.push( this.objectApiName + '.' + this.tagField);
        }
        if (this.isDebug) console.log('connected: recordFields init', recordFields);
        this.recordFields = recordFields;

        if (this.isDebug) console.log('connected: END');
    }

    // Record Data Fetch
    @wire(getRecord, { recordId: "$recordId", fields: '$recordFields' })
    wiredRecord({ error, data }) {
        if (this.isDebug) console.log('wiredRecord: START with ID ', this.recordId);
        if (this.isDebug) console.log('wiredRecord: and field ', this.recordFields);
        this.errorMessage = null;

        if (data) {
            if (this.isDebug) console.log('wiredRecord: data received ', JSON.stringify(data));

            this.recordData = data;
            /*if ((this.descField) && ((data.fields)[this.descField])  &&  ((data.fields)[this.descField].value)) {
                if (this.isDebug) console.log('wiredRecord: setting description ', (data.fields)[this.descField].value);
                //this.description = (data.fields)[this.descField].value;
                this.description = this.getLdsValue(data.fields, this.descField);
                if (this.isDebug) console.log('wiredRecord: description init',this.description);
            }*/
            if (this.descField) {
                this.description = this.getLdsValue(data.fields, this.descField);
                if (this.isDebug) console.log('wiredRecord: description init',this.description);
            }
            if (this.tagField) {
                let tags = this.getLdsValue(data.fields, this.tagField, true);
                if (this.isDebug) console.log('wiredRecord: tags fetched',tags);
                if (tags) {
                    this.tags = tags.split(';');
                    if (this.isDebug) console.log('wiredRecord: tags init',this.tags);
                }
            }

            /*if (((data.fields)[this.fileField])  &&  ((data.fields)[this.fileField].value)) {
                if (this.isDebug) console.log('wiredRecord: initializing ContentDocument ', (data.fields)[this.fileField].value);
                //this.contentDocumentId = ((data.fields)[this.fileField]).value;
                this.contentDocumentId = this.getLdsValue(data.fields, this.fileField);
                //this.fileUrl = '/sfc/servlet.shepherd/document/download/' + this.contentDocumentId;
                this.fileUrl = this.initFileUrl(this.contentDocumentId);
                this.isReady = true;
            }
            else {
                if (this.isDebug) console.log('wiredRecord: no ContentDocument to init');
                this.fileUrl = this.initFileUrl();
                this.isReady = true;
            }*/
            this.contentDocumentId = this.getLdsValue(data.fields, this.fileField);
            if (this.isDebug) console.log('wiredRecord: contentDocumentId fetched',this.contentDocumentId);
            this.fileUrl = this.initFileUrl(this.contentDocumentId);
            if (this.isDebug) console.log('wiredRecord: fileUrl init',this.fileUrl);

            if (!this.contentDocumentId) {
                if (this.isDebug) console.log('wiredRecord: no content information to fetch');
                this.isReady = true;
            }
            else {
                if (this.isDebug) console.log('wiredRecord: fetching additional content information');
                this.isReady = true;
            }
        }
        else if (error) {
            console.warn('wiredRecord: error raised ', JSON.stringify(error));
            this.errorMessage = "Field value retrieval issue!";
            this.isReady = true;
        }
        else {
            if (this.isDebug) console.log('wiredRecord: no data/error returned yet');
        }

        if (this.isDebug) console.log('wiredRecord: END');
    }

    // Record Data Fetch

    @wire(getRecord, { recordId: "$contentDocumentId", fields: '$contentDocumentFields' })
    wiredDocument({ error, data }) {
        if (this.isDebug) console.log('wiredDocument: START with ID ', this.contentDocumentId);
        if (this.isDebug) console.log('wiredDocument: and field ', this.contentDocumentFields);
        this.errorMessage = null;

        if (data) {
            if (this.isDebug) console.log('wiredDocument: data received ', JSON.stringify(data));

            /*this.contentDocument = data;
            this.lastVersionId = (data.fields).LatestPublishedVersionId.value;
            if (this.isDebug) console.log('wiredDocument: lastVersionId fetched ', this.lastVersionId);

            if ((this.urlField) && ((this.recordData.fields)[this.urlField])) {
                if (this.isDebug) console.log('wiredDocument: reusing old download URL ');
                this.fileUrl = (this.recordData.fields)[this.urlField].value;
                if (this.isDebug) console.log('wiredDocument: fileUrl fetched ', this.fileUrl);
            }
            else if (this.lastVersionId) {
                if (this.isDebug) console.log('wiredDocument: building download URL for last version ', this.lastVersionId);
                let rootUrl = window.location.hostname;
                this.fileUrl = 'https://' + rootUrl + '/sfc/servlet.shepherd/version/download/' + this.lastVersionId;
                if (this.isDebug) console.log('wiredDocument: fileUrl init ', this.fileUrl);
            }*/
            this.fileType = data.fields.FileType.value;
            if (this.isDebug) console.log('wiredDocument: fileType extracted', this.fileType);
            let lastVersionId = data.fields.LatestPublishedVersionId.value;
            if (this.isDebug) console.log('wiredDocument: lastVersionId extracted', lastVersionId);

            if (this.fileType === 'PDF') {
                if (this.isDebug) console.log('wiredDocument: reworking fileUrl for PDF');
                let newFileUrl =  '/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480';
                /*switch (this.displaySize) {
                    case 'x-small':
                        newFileUrl += 'THUMB120BY90';
                        break;
                    case 'small':
                        newFileUrl += 'THUMB240BY180'
                        break;
                    case 'medium':
                        newFileUrl += 'THUMB720BY480'
                        break;
                    case 'large':
                        newFileUrl += 'THUMB720BY480'
                        break;
                    default :
                        newFileUrl += 'THUMB720BY480'
                }*/
                newFileUrl += '&versionId=' + lastVersionId;
                this.fileUrl = newFileUrl;
            }
            this.isReady = true;
        }
        else if (error) {
            console.warn('wiredDocument: error raised ', JSON.stringify(error));
            this.errorMessage = "Document information retrieval issue!";
            this.isReady = true;
        }
        else {
            if (this.isDebug) console.log('wiredDocument: no data/error returned yet');
        }

        if (this.isDebug) console.log('wiredDocument: END');
    }

    //----------------------------------------------------------------
    // Event Handling
    //----------------------------------------------------------------
    showPreview(event){
        if (this.isDebug) console.log('showPreview: START');

        if (!this.basePath) {
            if (this.isDebug) console.log('showPreview: standard case');
            this[NavigationMixin.Navigate]({
                type: 'standard__namedPage',
                attributes: {
                    pageName: 'filePreview'
                },
                state : {
                    recordIds: this.contentDocumentId,
                    selectedRecordId: this.contentDocumentId
                }
            });
        }
        else {
            if (this.isDebug) console.log('showPreview: community case');
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: this.fileUrl
                }
            }, false );
        }
        if (this.isDebug) console.log('showPreview: END');
    }
    
    handleUploadFinished(event){
        if (this.isDebug) console.log('handleUploadFinished: START');
        if (this.isDebug) console.log('handleUploadFinished: event',event);
        if (this.isDebug) console.log('handleUploadFinished: details',JSON.stringify(event.detail));

        let files = (event.detail).files;
        if (this.isDebug) console.log('handleUploadFinished: files extracted',JSON.stringify(files));

        let file = files[0];
        if (this.isDebug) console.log('handleUploadFinished: file extracted',JSON.stringify(file));

        this.contentDocumentId = file.documentId;
        if (this.isDebug) console.log('handleUploadFinished: documentId fetched', this.contentDocumentId);
        this.fileUrl = this.initFileUrl(this.contentDocumentId);
        if (this.isDebug) console.log('handleUploadFinished: fileUrl init', this.fileUrl);

        let recordUpdate = {
            fields: {
                Id: this.recordId,
            }
        }
        if (this.isDebug) console.log('handleUploadFinished: recordData init ', JSON.stringify(recordUpdate));

        (recordUpdate.fields)[this.fileField] = this.contentDocumentId;
        if (this.isDebug) console.log('handleUploadFinished: documentId set ', JSON.stringify(recordUpdate));

        if (this.urlField) {
            if (this.isDebug) console.log('handleUploadFinished: adding urlField ', this.urlField);
            (recordUpdate.fields)[this.urlField] = this.fileUrl;
        }
        if (this.isDebug) console.log('handleUploadFinished: recordData prepared ', JSON.stringify(recordUpdate));

        this.isReady = false;
        updateRecord(recordUpdate)
        .then(() => {
            if (this.isDebug) console.log('handleUploadFinished: END OK');
            const event = new ShowToastEvent({
                title: 'New file properly registered',
                variant: "success"
            });
            this.dispatchEvent(event);
            this.isReady = true;
        })
        .catch(error => {
            if (this.isDebug) console.log('handleUploadFinished: error received ', JSON.stringify(error));

            let regexp = /message":"(.*?)"/gi;
            if (this.isDebug) console.log('handleUploadFinished: regexp init ', regexp);
            let messageList = (JSON.stringify(error)).match(regexp);
            if (this.isDebug) console.log('handleUploadFinished: messageList extracted ', messageList);

            this.errorMessage = messageList.reduce((previous ,current) => {
                let newCurrent = current.slice(10,-1);
                if (previous) return previous + '\n' + newCurrent;
                return newCurrent;
            },'');
            if (this.isDebug) console.log('handleUploadFinished: END KO / errorMessage updated ', this.errorMessage);


            this.isReady = true;
        });

        if (this.isDebug) console.log('handleUploadFinished: recird update triggered');
    }

    //----------------------------------------------------------------
    // Utilities
    //----------------------------------------------------------------
    
    initFileUrl = function(docId) {
        if (this.isDebug) console.log('initFileUrl: START with ',docId);

        if (!docId) {
            if (this.isDebug) console.log('initFileUrl: END / returning default image');
            return '/img/campaign/campaign_image.jpg';
        }

        let rootUrl = 'https://' + window.location.hostname;
        if (this.basePath) {
            if (this.isDebug) console.log('initFileUrl: adding community basePath ', this.basePath);
            rootUrl += '/' +  this.basePath + '/s';
        }
        let fileUrl = rootUrl + '/sfc/servlet.shepherd/document/download/' + docId;
        if (this.isDebug) console.log('initFileUrl: END / returning document url ', fileUrl);
        return fileUrl;
    }


    getLdsValue = function(record,field,isDisplay) {
        if (this.isDebug) console.log('getLdsValue: START with field ',field);
        if (this.isDebug) console.log('getLdsValue: record provided ',record);

        if ((field) && (record)) {
            if (field.includes('.')) {
                if (this.isDebug) console.log('getLdsValue: processing relation field ');
                let index = field.indexOf('.');
                if (this.isDebug) console.log('getLdsValue: index of 1st relation ',index);
                let relationField = field.substring(0,index);
                if (this.isDebug) console.log('getLdsValue: relationField extracted ',relationField);
                let subFields = field.substring(index+1);
                if (record[relationField].value) {
                    if (this.isDebug) console.log('getLdsValue: END - fetching next field in relation ',subFields);
                    return this.getLdsValue(record[relationField].value.fields,subFields);
                }
                else {
                    console.warn('getLdsValue: END - No data for next field in relation',subFields);
                    return null;
                }
            }
            else {
                if (isDisplay) {
                    if (this.isDebug) console.log('getLdsValue: END - returning display value for simple field ',record[field].displayValue);
                    return record[field].displayValue;
                }
                else {
                    if (this.isDebug) console.log('getLdsValue: END - returning value for simple field ',record[field].value);
                    return record[field].value;
                }
            }
        }
        else {
            console.warn('getLdsValue: END - No field name or record provided');
            return null;
        }
    }
}