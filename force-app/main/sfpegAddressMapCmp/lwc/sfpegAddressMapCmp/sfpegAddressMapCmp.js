/***
* @author P-E GROS
* @date   Jan. 2026
* @description  LWC Component to display up to 5 addresses on a Map based on the current
*               record Record
*               Part of the PEG_MISC package.
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2026 pegros
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

import { LightningElement, api, wire }  from 'lwc';
import { getRecord }                    from 'lightning/uiRecordApi';
import { getObjectInfo }                from 'lightning/uiObjectInfoApi';

import NO_LOCATION_LABEL from '@salesforce/label/c.sfpegAddressMapNoLocation';

export default class SfpegAddressMapCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api cardTitle;
    @api cardIcon;
    @api cardClass;

    @api mapLegend = 'Localisation';
    @api listView;
    @api draggable;
    @api zoomControl;
    @api scrollwheel;
    @api disableDefaultUI;
    @api disableDoubleClickZoom;

    @api location1;
    @api location2;
    @api location3;
    @api location4;
    @api location5;

    @api icon1 = "standard:address";
    @api icon2 = "standard:address";
    @api icon3 = "standard:address";
    @api icon4 = "standard:address";
    @api icon5 = "standard:address";

    @api isDebug = false;       // Flag to activate debug information

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------

    @api objectApiName;     // Object API Name for current page record
    objectDesc;
    @api recordId;          // ID of current page record
    recordData;
    recordFieldList = [];   // List of fields to fetch (in objectApiName.fieldApiName format)

    locationFieldMap = {};
    mapMarkers;
    
    //-----------------------------------------------------
    // Custom getter
    //-----------------------------------------------------

    get figureCaption() {
        return (this.mapMarkers ? this.mapLegend : NO_LOCATION_LABEL);
    }

    get mapClass() {
        return (this.mapMarkers ? 'slds-p-horizontal_small' : 'slds-illustration slds-illustration_small');
    }

    get addressList() {
        return JSON.stringify(([this.location1,this.location2, this.location3, this.location4, this.location5]).filter(item => item && item !== "N/A").map(item => item.split('.')[1]));
    }

    get mapMarkersSerialized(){
        return JSON.stringify(this.locationFieldMap);
    }

    get mapOptions() {
        return {    draggable:this.draggable,
                    zoomControl:this.zoomControl,
                    scrollwheel: this.scrollwheel,
                    disableDefaultUI: this.disableDefaultUI,
                    disableDoubleClickZoom: this.disableDoubleClickZoom
        };
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START map for ', this.cardTitle);
            console.log('connected: card icon ', this.cardIcon);
            console.log('connected: card class ', this.cardClass);
            console.log('connected: map legend ', this.maplegend);
            console.log('connected: location1 ', this.location1);
            console.log('connected: location2 ', this.location2);
            console.log('connected: location3 ', this.location3);
            console.log('connected: location4 ', this.location4);
            console.log('connected: location5 ', this.location5);
            console.log('connected: END map for ', this.cardTitle);
        }
    }

    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START map for ', this.cardTitle);
            console.log('rendered: recordFieldList ', JSON.stringify(this.recordFieldList));
            console.log('rendered: locationFieldMap ', JSON.stringify(this.locationFieldMap));
            console.log('rendered: mapMarkers ', JSON.stringify(this.mapMarkers));            
            console.log('rendered: END map for ', this.cardTitle);
        }
    }


    //-----------------------------------------------------
    // Data Initialization
    //-----------------------------------------------------

    @wire(getObjectInfo, { objectApiName: "$objectApiName" })
    wiredObject({ error, data }) {
        if (this.isDebug) {
            console.log('wiredObject: START map for card title ', this.cardTitle);
            console.log('wiredObject: with object ', this.objectApiName);
        }

        if (data) {
            if (this.isDebug) console.log('wiredObject: data ', JSON.stringify(data));
            this.objectDesc = data;
            
            const locationList = ([
                {field: this.location1, icon: this.icon1},
                {field: this.location2, icon: this.icon2},
                {field: this.location3, icon: this.icon3},
                {field: this.location4, icon: this.icon4},
                {field: this.location5, icon: this.icon5}]).filter(item => item.field && item.field !== "N/A");
            if (this.isDebug) console.log('wiredObject: analysing locations fields ', JSON.stringify(locationList));  

            let recordFieldList = [];
            locationList.forEach(iterLoc => {
                if (this.isDebug) console.log('wiredObject: processing location field', iterLoc.field);
                const locDesc = this.initLocationFields(iterLoc.field,iterLoc.icon,data);
                if (this.locationFieldMap[locDesc.name]) {
                    console.log('wiredObject: location desc already registered', locDesc.name);
                }
                else {
                    recordFieldList = [...recordFieldList, ...locDesc.fields];
                    this.locationFieldMap[locDesc.name] = locDesc;
                    console.log('wiredObject: new location desc registered', JSON.stringify(locDesc));
                }
            });
            this.recordFieldList = recordFieldList;

            if (this.isDebug) {
                console.log('wiredObject: recordFieldList init ', JSON.stringify(this.recordFieldList));
                console.log('wiredObject: locationFieldMap init ', JSON.stringify(this.locationFieldMap));
                console.log('wiredObject: END / Requesting data for record ',this.recordId);
            }
            return;
        }
        else {
            if (this.isDebug) console.log('wiredObject: END / No data for object',this.objectApiName);
        }
    }

    @wire(getRecord, { recordId: "$recordId", fields: '$recordFieldList' })
    //@wire(getRecord, { recordId: "$recordId", layoutTypes: ["Full"], modes: ["View"] }) 
    wiredRecord({ error, data }) {
        if (this.isDebug) {
            console.log('wiredRecord: START map for card title ', this.cardTitle);
            console.log('wiredRecord: with ID ', this.cardTitle);
            console.log('wiredRecord: recordFieldList ', JSON.stringify(this.recordFieldList));
            console.log('wiredRecord: and locationFieldMap ', JSON.stringify(this.locationFieldMap));
        }

        if (data) {
            if (this.isDebug) console.log('wiredRecord: data received ', JSON.stringify(data));

            const mapMarkers = [];
            Object.entries(this.locationFieldMap).forEach(([iterField, iterDesc]) => {
                if (this.isDebug) console.log('wiredRecord: processing location field ',iterField);
                if (this.isDebug) console.log('wiredRecord: with description ', JSON.stringify(iterDesc.description));

                const iterLocation = {};
                Object.entries(iterDesc.description).forEach(([iterSubField, iterSubDesc]) => {
                    if (this.isDebug) console.log('wiredRecord: processing location subfield ',iterSubField);
                    if (this.isDebug) console.log('wiredRecord: with api name ',iterSubDesc.name);
                    const iterSubValue = (data.fields[iterSubDesc.name]);
                    if (this.isDebug) console.log('wiredRecord: and value ',JSON.stringify(iterSubValue));
                    iterLocation[iterSubField] = iterSubValue?.displayValue ?? iterSubValue?.value;
                });
                if (this.isDebug) console.log('wiredRecord: iterLocation init ', JSON.stringify(iterLocation));
                const iterFmtAddress = this.formatAddress(iterLocation);
                if (this.isDebug) console.log('wiredRecord: iterFmtAddress init ', iterFmtAddress);
                if (iterFmtAddress) {
                    mapMarkers.push({
                        location:iterLocation,
                        title: iterDesc.label,
                        description: iterFmtAddress,
                        value: iterField,
                        icon: iterDesc.icon});
                    if (this.isDebug) console.log('wiredRecord: iterLocation registered');
                }
                else {
                    if (this.isDebug) console.log('wiredRecord: iterLocation ignored');
                }
            });
            if (this.isDebug) console.log('wiredRecord: #items in mapMarkers ', mapMarkers.length);
            this.mapMarkers = (mapMarkers?.length > 0 ? mapMarkers : null);

            if (this.isDebug) console.log('wiredRecord: END / mapMarkers init ', JSON.stringify(this.mapMarkers));
        }
        else if (error) {
            console.warn('wiredRecord: END KO / error raised ', JSON.stringify(error));
        }
        else {
            if (this.isDebug) console.log('wiredRecord: END / no data/error returned yet');
        }
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------

    displayAddress(event) {
        if (this.isDebug) console.log('displayAddress: START ',event);
        event.stopPropagation();
        event.preventDefault();
        if (this.isDebug) console.log('displayAddress: selected',event.detail.selectedMarkerValue);
        
        if (this.isDebug) console.log('displayAddress: END');
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------

    initLocationFields(fullFieldName,iconName, objectDesc) {
        if (this.isDebug) console.log('initLocationFields: START with ',fullFieldName);
        if (this.isDebug) console.log('initLocationFields: and icon ',iconName);

        if (!fullFieldName) {
            if (this.isDebug) console.log('initLocationFields: END / no location field provided');
            return;
        }

        // fullFieldName should be in "object.field" format
        const fieldName = fullFieldName.split('.')[1];
        if (!fieldName) {
            console.warn('initLocationFields: END / bad location field name format',fullFieldName);
            return;
        }

        const fieldDesc = {
            name:   fieldName,
            label:  ((objectDesc.fields)[fieldName]).label,
            icon: iconName,
            fields:[],
            description:{}
        };
        if (this.isDebug) console.log('initLocationFields: fieldDesc init ', JSON.stringify(fieldDesc));

        Object.entries(objectDesc.fields)
        .filter(([iterField, iterDesc]) => iterDesc.compoundFieldName === fieldName)
        .forEach(([iterField, iterDesc]) => {
            if (this.isDebug) console.log('initLocationFields: processing location sub-field ',iterField);
            (fieldDesc.fields).push(objectDesc.apiName + '.' + iterDesc.apiName);
            (fieldDesc.description)[iterDesc.compoundComponentName] = {label: iterDesc.label, name: iterDesc.apiName};
        });

        if (this.isDebug) console.log('initLocationFields: END with ', JSON.stringify(fieldDesc));
        return fieldDesc;
    }

    formatAddress(locationData) {
        if (this.isDebug) console.log('formatAddress: START for location ',JSON.stringify(locationData));

        const cityLine = [locationData?.PostalCode, locationData?.City].filter(Boolean).join(" ");
        const formattedAddress = ([
            locationData?.Street,
            cityLine,
            locationData?.StateCode,
            locationData?.CountryCode])
        .filter(Boolean).join("<br/>");

        if (this.isDebug) console.log('formatAddress: END with value ',formattedAddress);
        return formattedAddress;  
    }
}