/***
* @author P-E GROS
* @date   Sept. 2022
* @description  LWC Component to display/play a specific related media file on a record. 
*               It relies on custom string field on the object to store the ID of the corresponding 
*               ContentDocument.
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
import { getRecord, getRecordNotifyChange } from 'lightning/uiRecordApi';

import REFRESH_LABEL   from '@salesforce/label/c.sfpegMediaPlayRefreshLabel';
import MISSING_FIELD_ERROR from '@salesforce/label/c.sfpegMediaPlayMissingFileIdError';
import INVALID_FILE_ID_ERROR from '@salesforce/label/c.sfpegMediaPlayInvalidFileIdError';
import INVALID_FILE_PREFIX_ERROR from '@salesforce/label/c.sfpegMediaPlayInvalidFileIdPrefixError';
import FILE_DATA_ERROR from '@salesforce/label/c.sfpegMediaPlayFileDataRetrievalError';

const FILE_TYPES_MAP = {
    video: ['MOV','WMV', 'MP4', 'AVI'],
    audio: ['WAV','MP3'],
    image: ['JPG','PNG','JPEG','PDF']
}

export default class SfpegMediaPlayCmp extends NavigationMixin(LightningElement) {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api wrapperCss;        // CSS classes for the wrapping <div>
    @api cardTitle;         // Label for the wrapping card
    @api cardIcon;          // Icon for the wrapping card
    @api hasInnerPadding;   // Flag to enforce extra padding for the card content

    @api fileField;         // API Name of the field containing the ID of the current ContentDocument
    @api showDetails = false;   // Flag to display File Description above the media
    @api showRefresh = false;   // Flag to display a file data refresh button icon (to fetch the latest file version after upload)
    @api helpText;          // Help text to display in the card header with user info about the file displayed

    @api basePath;          // Base path of the community

    @api isDebug = false;   // Flag to activate debug mode

    //----------------------------------------------------------------
    // Internal parameters
    //----------------------------------------------------------------
    @track isReady = false;     // Flag indicating if the component is ready to display

    @api objectApiName;         // Object API Name for current page record (if any)
    @api recordId;              // ID of current page record (if any)
    @track recordFields;        // Fields to fetch on the current record
    recordData;                 // Record data fetched (basically the fileField value)

    @track fileId;              // ID of the current ContentDocument
    fileFields = [
        "ContentDocument.Title",
        "ContentDocument.Description",
        "ContentDocument.LatestPublishedVersionId",
        "ContentDocument.ContentSize",
        "ContentDocument.FileType"];    // Fields to fetch on the ContentDocument
    @track fileData;            // Record 
    @track fileUrl;             // Download URL of the file

    @track errorMsg;            // Possible error message.

    //----------------------------------------------------------------
    // Custom Labels
    //----------------------------------------------------------------
    refreshLabel = REFRESH_LABEL;

    //----------------------------------------------------------------
    // Custom Getters
    //----------------------------------------------------------------
    get isVideo() {
        return FILE_TYPES_MAP.video.includes(this.fileData?.FileType?.value || 'UNDEFINED' );
    }
    get isAudio() {
        return FILE_TYPES_MAP.audio.includes(this.fileData?.FileType?.value || 'UNDEFINED' );
    }
    get isImage() {
        return FILE_TYPES_MAP.image.includes(this.fileData?.FileType?.value || 'UNDEFINED' );
    }
    get contentClass() {
        //return 'slds-card_boundary';
        return (this.hasInnerPadding ? 'slds-p-horizontal_medium' : '');
    }
    get imageClass() {
        return "fileImage" + (this.fileData?.FileType?.value === 'PDF' ? ' fileImage-border' : '');
    }
    get fileDetails() {
        return JSON.stringify(this.fileData);
    }
    get fileTitle() {
        return this.fileData?.Title?.value;
    }
    get fileDescription() {
        return this.fileData?.Description?.value;
    }
    get lastVersionId() {
        return this.fileData?.LatestPublishedVersionId?.value;
    }


    //----------------------------------------------------------------
    // Component Initialisation
    //----------------------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START');

        if (! this.fileField) {
            console.warn('connected: END KO / missing fileField');
            //this.errorMsg = "File ID Field is missing in configuration!";
            this.errorMsg = MISSING_FIELD_ERROR;
            this.isReady = true;
            return;
        }
        
        let recordFields = [];
        if (this.fileField)
        recordFields.push( this.objectApiName + '.' + this.fileField);

        if (this.isDebug) console.log('connected: recordFields init', recordFields);
        this.recordFields = recordFields;

        if (this.isDebug) console.log('connected: END');
    }

    // Record Data Fetch
    @wire(getRecord, { recordId: "$recordId", fields: '$recordFields' })
    wiredRecord({ error, data }) {
        if (this.isDebug) console.log('wiredRecord: START with ID ', this.recordId);
        if (this.isDebug) console.log('wiredRecord: and field ', this.recordFields);
        this.errorMsg = null;

        if (data) {
            if (this.isDebug) console.log('wiredRecord: data received ', JSON.stringify(data));

            this.recordData = data;
            let fileId = this.getLdsValue(data.fields, this.fileField);

            if (!fileId) {
                if (this.isDebug) console.log('wiredRecord: no content information to fetch');
                this.fileId = null;
                this.isReady = true;
            }
            else if (fileId.length != 18) {
                console.warn('wiredRecord: bad file ID length (should be 18 chars)',fileId);
                this.fileId = null;
                //this.errorMsg = 'Referenced File ID format is invalid!';
                this.errorMsg = INVALID_FILE_ID_ERROR;
                this.isReady = true;
            }
            else if (fileId.substr(0,3) !== '069') {
                this.fileId = null;
                console.warn('wiredRecord: Bad Referenced Fil ID prefix (should be 069 / ContentDocument)!',fileId);
                //this.errorMsg = 'Referenced File ID prefix is invalid!';
                this.errorMsg = INVALID_FILE_PREFIX_ERROR;
                this.isReady = true;
            }
            else {
                if (this.isDebug) console.log('wiredRecord: fetching file information with ID ', fileId);
                this.fileId = fileId;
                //this.isReady = true;
            }
        }
        else if (error) {
            console.warn('wiredRecord: error raised ', JSON.stringify(error));
            //this.errorMsg = "File Data retrieval issue!";
            this.errorMsg = FILE_DATA_ERROR;
            this.isReady = true;
        }
        else {
            if (this.isDebug) console.log('wiredRecord: no data/error returned yet');
        }

        if (this.isDebug) console.log('wiredRecord: END');
    }

    // File Data Fetch
    @wire(getRecord, { recordId: "$fileId", fields: '$fileFields' })
    wiredDocument({ error, data }) {
        if (this.isDebug) console.log('wiredDocument: START with ID ', this.fileId);
        if (this.isDebug) console.log('wiredDocument: and field ', this.fileFields);
        this.errorMsg = null;

        if (data) {
            if (this.isDebug) console.log('wiredDocument: data received ', JSON.stringify(data));

            this.fileData = data.fields;
            this.fileType = this.fileData.FileType.value;
            if (this.isDebug) console.log('wiredDocument: fileType extracted', this.fileType);
            let lastVersionId = this.fileData.LatestPublishedVersionId.value;
            if (this.isDebug) console.log('wiredDocument: lastVersionId extracted', lastVersionId);

            this.fileUrl = this.initFileUrl(this.fileId, this.fileData?.LatestPublishedVersionId?.value, this.fileData?.FileType?.value);
            if (this.isDebug) console.log('wiredDocument: fileUrl init',this.fileUrl);

            this.isReady = true;
        }
        else if (error) {
            console.warn('wiredDocument: error raised ', JSON.stringify(error));
            this.errorMsg = "Document information retrieval issue!";
            this.isReady = true;
        }
        else {
            if (this.isDebug) console.log('wiredDocument: no data/error returned yet');
        }

        if (this.isDebug) console.log('wiredDocument: END');
    }

    //----------------------------------------------------------------
    // Utilities
    //----------------------------------------------------------------
    
    initFileUrl = function(docId,versionId,docType) {
        if (this.isDebug) console.log('initFileUrl: START with file ID ',docId);
        if (this.isDebug) console.log('initFileUrl: of type ',docType);
        if (this.isDebug) console.log('initFileUrl: with last version ID ',versionId);

        let rootUrl = 'https://' + window.location.hostname;
        if (this.basePath) {
            if (this.isDebug) console.log('initFileUrl: adding community basePath ', this.basePath);
            rootUrl += '/' +  this.basePath + '/s';
        }

        if (docType === 'PDF') {
            if (this.isDebug) console.log('initFileUrl: END PDF url ', this.basePath);
            return rootUrl + '/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=' + versionId;
        }
        else {
            if (this.isDebug) console.log('initFileUrl: generating standard URL ');
            return rootUrl + '/sfc/servlet.shepherd/document/download/' + docId;
        }
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
                    recordIds: this.fileId,
                    selectedRecordId: this.fileId
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

    refreshFile(event) {
        if (this.isDebug) console.log('refreshFile: START');

        if (this.fileId) {
            if (this.isDebug) console.log('refreshFile: forcing file data refresh ');
            getRecordNotifyChange([{recordId: this.fileId}]);
        }
        else {
            if (this.isDebug) console.log('refreshFile: not file data to refresh');
        }

        if (this.isDebug) console.log('refreshFile: END');
    }

    //----------------------------------------------------------------
    // Utilities
    //----------------------------------------------------------------

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