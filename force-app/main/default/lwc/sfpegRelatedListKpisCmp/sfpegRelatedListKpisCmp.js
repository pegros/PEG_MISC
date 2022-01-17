/***
* @author P-E GROS
* @date   Jan 2022
* @description  LWC Component to display a set of related list counters on a record.
*               Also enables to open the considered related list.
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
import { NavigationMixin } from 'lightning/navigation';
import getCounts from '@salesforce/apex/sfpegRelatedListKpis_CTL.getCounts';
//import { getObjectInfo }        from 'lightning/uiObjectInfoApi';
import LOCALE   from '@salesforce/i18n/locale';
import NUMBER   from '@salesforce/i18n/number.numberFormat';

export default class SfpegRelatedListKpisCmp extends NavigationMixin(LightningElement) {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api wrapperCss;                // CSS classes for the wrapping <div>
    @api relList1;                  // Configuration of the 1st related list
    @api relList2;                  // Configuration of the 2nd related list
    @api relList3;                  // Configuration of the 3rd related list
    @api relList4;                  // Configuration of the 4th related list
    @api relList5;                  // Configuration of the 5th related list
    @api relList6;                  // Configuration of the 6th related list
    @api showRefresh = false;       // Flag to display the refresh button
    @api isDebug = false;           // Flag to activate debug mode

    //----------------------------------------------------------------
    // Internal parameters
    //----------------------------------------------------------------
    @track isReady = false;     // Flag to indicate that component ready
    @track isLoading = false;   // Flag to indicate that component is updating

    @api objectApiName;         // Object API Name for current page record (if any)
    @api recordId;              // ID of current page record (if any)

    relations;                  // List of relation names to be counted
    @track kpiList;             // List of KPIs displayed (with values)
    @track errorMessage;        // Possible error message.

    NUM_FORMAT = new Intl.NumberFormat(LOCALE, {
        notation: "compact" ,
        compactDisplay: "short",
        style: 'decimal',
        maximumSignificantDigits: 3}
    );

    //----------------------------------------------------------------
    // Component Initialisation
    //----------------------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START');

        this.relations = [];
        this.kpiList = [];

        if ((this.relList1) && (this.relList1 !== 'N/A')) {
            if (this.isDebug) console.log('connected: registering relList1 ',this.elList1);
            let desc = JSON.parse(this.relList1);
            desc.value = 0;
            desc.class +=  ' kpiContainer';
            this.relations.push(desc.name);
            this.kpiList.push(desc);
        }
        if ((this.relList2) && (this.relList2 !== 'N/A')) {
            if (this.isDebug) console.log('connected: registering relList2 ',this.relList2);
            let desc = JSON.parse(this.relList2);
            desc.value = 0;
            desc.class +=  ' kpiContainer';
            this.relations.push(desc.name);
            this.kpiList.push(desc);
        }
        if ((this.relList3) && (this.relList3 !== 'N/A')) {
            if (this.isDebug) console.log('connected: registering relList3 ',this.relList3);
            let desc = JSON.parse(this.relList3);
            desc.value = 0;
            desc.class +=  ' kpiContainer';
            this.relations.push(desc.name);
            this.kpiList.push(desc);
        }
        if ((this.relList4) && (this.relList4 !== 'N/A')) {
            if (this.isDebug) console.log('connected: registering relList4 ',this.relList4);
            let desc = JSON.parse(this.relList4);
            desc.value = 0;
            desc.class +=  ' kpiContainer';
            this.relations.push(desc.name);
            this.kpiList.push(desc);
        }
        if ((this.relList5) && (this.relList5 !== 'N/A')) {
            if (this.isDebug) console.log('connected: registering relList5 ',this.relList5);
            let desc = JSON.parse(this.relList5);
            desc.value = 0;
            desc.class +=  ' kpiContainer';
            this.relations.push(desc.name);
            this.kpiList.push(desc);
        }
        if ((this.relList6) && (this.relList6 !== 'N/A')) {
            if (this.isDebug) console.log('connected: registering relList6 ',this.relList6);
            let desc = JSON.parse(this.relList6);
            desc.value = 0;
            desc.class +=  ' kpiContainer';
            this.relations.push(desc.name);
            this.kpiList.push(desc);
        }
        if (this.isDebug) console.log('connected: relations set ',JSON.stringify(this.relations));
        if (this.isDebug) console.log('connected: kpiList set ',JSON.stringify(this.kpiList));

        /*this.kpiList = [
            {"name":"cases","value":125,"icon":"standard:case","class":"slds-icon-standard-case kpiContainer"},
            {"name":"opportunities","value":30,"icon":"standard:opportunity","class":"slds-icon-standard-opportunity kpiContainer"},
            {"name":"quotes__r","value":75,"icon":"standard:quotes","class":"slds-icon-standard-quotes kpiContainer"},
            {"name":"contracts__r","value":20,"icon":"custom:custom12","class":"slds-icon-custom-custom12 kpiContainer"},
            {"name":"claims__r","value":52,"icon":"custom:custom23","class":"slds-icon-custom-custom23 kpiContainer"},
            {"name":"tasks","value":25123,"icon":"standard:task","class":"slds-icon-standard-task kpiContainer"}
        ];
        if (this.isDebug) console.log('connected: kpiList set ',this.kpiList );*/

        this.executeQueries()
        if (this.isDebug) console.log('connected: END');
    }

    //----------------------------------------------------------------
    // Event handlers
    //----------------------------------------------------------------
    /*@wire(getObjectInfo, { objectApiName: "$objectApiName" })
    wiredObject({ error, data }) {
        if (this.isDebug) console.log('wiredObject: START with ', this._objectApiName);
        if (data) {
            if (this.isDebug) console.log('wiredObject: defaultRecordTypeId ', data.defaultRecordTypeId);
            if (this.isDebug) console.log('wiredObject: data ', JSON.stringify(data));
        }
        if (this.isDebug) console.log('wiredObject: END');
    }*/
    handleRefresh(event) {
        if (this.isDebug) console.log('handleRefresh: START');
        this.isLoading = true;
        this.executeQueries();
        if (this.isDebug) console.log('handleRefresh: END');
    }

    //----------------------------------------------------------------
    // Event handlers
    //----------------------------------------------------------------
    handleKpiClick(event) {
        if (this.isDebug) console.log('handleKpiClick: START');
        if (this.isDebug) console.log('handleKpiClick: event',event);

        let kpiName = event.currentTarget.dataset.kpiName;
        if (this.isDebug) console.log('handleKpiClick: KPI name fetched ', kpiName);

        let kpiDesc = this.kpiList.find(iter => iter.name = kpiName);
        if (this.isDebug) console.log('handleKpiClick: KPI desc fetched ', JSON.stringify(kpiDesc));

        if (this.isDebug) console.log('handleKpiClick: opening related list ');

        this[NavigationMixin.Navigate]({
                type: 'standard__recordRelationshipPage',
                attributes: {
                    recordId: this.recordId,
                    objectApiName: this.objectApiName,
                    relationshipApiName: kpiName,
                    actionName: 'view'
                }
        });
        if (this.isDebug) console.log('handleKpiClick: END / navigation triggered');  
    }

    //----------------------------------------------------------------
    // Event handlers
    //----------------------------------------------------------------
    executeQueries = function() {
        if (this.isDebug) console.log('executeQueries: START');  

        let params = {  objectName: this.objectApiName,
                        recordId:   this.recordId,
                        relations:  this.relations };
        if (this.isDebug) console.log('executeQueries: params prepared ', JSON.stringify(params));  

        getCounts(params).then((result) => {
            if (this.isDebug) console.log('executeQueries: result received ', JSON.stringify(result));
            for (let iter in result) {
                if (this.isDebug) console.log('executeQueries: processing relation ', iter);

                let iterDesc = this.kpiList.find(item => item.name === iter);
                if (iterDesc) {
                    if (this.isDebug) console.log('executeQueries: setting value to ', result[iter]);
                    //iterDesc.value = result[iter];
                    iterDesc.value =  this.NUM_FORMAT.format(result[iter]);
                    iterDesc.valueFull =  result[iter];
                    if (this.isDebug) console.log('executeQueries: value shortened to ', iterDesc.value);
                }
                else {
                    console.warn('executeQueries: relation not found in kpiList ', iter);
                }
            }
            if (this.isDebug) console.log('executeQueries: kpiList updated ', JSON.stringify(this.kpiList));
            this.isReady = true;
            this.isLoading = false;

            if (this.isDebug) console.log('executeQueries: END');  
        }).catch( error => {
            console.warn('executeQueries: error raised ', JSON.stringify(error));

            let regexp = /message":"(.*?)"/gi;
            if (this.isDebug) console.log('executeQueries: regexp init ', regexp);
            let messageList = (JSON.stringify(error)).match(regexp);
            if (this.isDebug) console.log('executeQueries: messageList extracted ', messageList);

            this.errorMessage = messageList.reduce((previous ,current) => {
                let newCurrent = current.slice(10,-1);
                if (previous) return previous + '\n' + newCurrent;
                return newCurrent;
            },'');
            if (this.isDebug) console.log('handleError: errorMessage updated ', this.errorMessage);

            this.isReady = true;
            this.isLoading = false;
            if (this.isDebug) console.log('executeQueries: END / KO ');
        });

        if (this.isDebug) console.log('executeQueries: count queries requested');  
    }
}