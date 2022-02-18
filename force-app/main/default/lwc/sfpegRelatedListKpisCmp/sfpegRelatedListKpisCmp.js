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
import CURRENCY from '@salesforce/i18n/currency';
//import NUMBER   from '@salesforce/i18n/number.numberFormat';

export default class SfpegRelatedListKpisCmp extends NavigationMixin(LightningElement) {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api wrapperCss;                // CSS classes for the wrapping <div>
    @api displaySize = "medium";    // Size of the widgets.

    @api label1;                    // Label for the 1st related list
    @api relList1;                  // Configuration of the 1st related list
    @api field1;                    // Configuration of a sum field for the the 1st related list

    @api label2;                    // Label for the 2nd related list
    @api relList2;                  // Configuration of the 2nd related list
    @api field2;                    // Configuration of a sum field for the the 2nd related list

    @api label3;                    // Label for the 3rd related list
    @api relList3;                  // Configuration of the 3rd related list
    @api field3;                    // Configuration of a sum field for the the 3rd related list

    @api label4;                    // Label for the 4th related list
    @api relList4;                  // Configuration of the 4th related list
    @api field4;                    // Configuration of a sum field for the the 4th related list

    @api label5;                    // Label for the 5th related list
    @api relList5;                  // Configuration of the 5th related list
    @api field5;                    // Configuration of a sum field for the the 5th related list

    @api label6;                    // Label for the 6th related list
    @api relList6;                  // Configuration of the 6th related list
    @api field6;                    // Configuration of a sum field for the the 6th related list

    @api inverseText = false;       // Flag to display the labels in inverse font (for dark backgrounds)
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

    @track marginClass;         // Class to leave vertical space for the labels and the badges

    // Formatting templates
    NUM_FORMAT = new Intl.NumberFormat(LOCALE, {
        notation: "compact" ,
        compactDisplay: "short",
        style: 'decimal'//,
        //maximumSignificantDigits: 2
    });
    CUR_FORMAT = new Intl.NumberFormat(LOCALE, {
        notation: "compact" ,
        compactDisplay: "short",
        currencyDisplay: 'symbol',
        currency: CURRENCY,
        style: 'currency'//,
        //maximumSignificantDigits: 2
    });

    //----------------------------------------------------------------
    // Custom Getters
    //----------------------------------------------------------------
    get numberClass() {
        switch (this.displaySize ) {
            case "large" :
                return "slds-text-heading_medium slds-text-color_default kpiNumber";
            case "medium" :
                return "slds-text-heading_small slds-text-color_default kpiNumber";
            default :
                return "slds-text-body_regular slds-text-color_default kpiNumber";
        }
    }
    get kpiValueClass() {
        return "kpiValue kpiValue-" + this.displaySize;
    }
    get kpiIconClass() {
        return "kpiAction kpiIcon kpiIcon-" + this.displaySize;
    }
    get iconSize() {
        /*switch (this.displaySize ) {
            case "large" :
                return "medium";
            case "medium" :
                return "small";
            default :
                return "x-small";
        }*/
        switch (this.displaySize ) {
            case "large" :
                return "small";
            case "medium" :
                return "x-small";
            default :
                return "xx-small";
        }
    }
    get titleClass() {
        return "slds-text-title kpiTitle " + (this.inverseText ? ' slds-text-color_inverse' : '');
    }
    get badgeClass() {
        return "slds-text-color_default kpiBadgeContainer";
        /*
        switch (this.displaySize ) {
            case "large" :
                return "slds-text-heading_small slds-text-color_default kpiBadge";
            case "medium" :
                return "slds-text-body_regular slds-text-color_default kpiBadge";
            default :
                return "slds-text-body_small slds-text-color_default kpiBadge";
        }
        */
    }
    get badgeValueClass() {
        return "slds-badge slds-badge_lightest kpiBadge kpiBadge-" + this.displaySize;
    }


    //----------------------------------------------------------------
    // Component Initialisation
    //----------------------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START');

        if ((this.label1) || (this.label2) || (this.label3) || (this.label4) || (this.label5) || (this.label6)) {
            this.marginClass = " slds-m-top_medium "; //+ this.displaySize;
            if (this.isDebug) console.log('connected: setting top margin ', this.marginClass);
        }
        if ((this.field1) || (this.field2) || (this.field3) || (this.field4) || (this.field5) || (this.field6)) {
            this.marginClass += " slds-m-bottom_x-small "; //+ this.displaySize;
            if (this.isDebug) console.log('connected: setting bottom margin ', this.marginClass);
        }

        this.relations = [];
        this.kpiList = [];

        if ((this.relList1) && (this.relList1 !== 'N/A')) {
            if (this.isDebug) console.log('connected: registering relList1 ',this.relList1);
            if (this.isDebug) console.log('connected: with field1 ',this.field1);
            if (this.isDebug) console.log('connected: and label1 ',this.label1);
            this.registerRelation(this.relList1,this.label1,this.field1);
        }
        if ((this.relList2) && (this.relList2 !== 'N/A')) {
            if (this.isDebug) console.log('connected: registering relList2 ',this.relList2);
            if (this.isDebug) console.log('connected: with field2 ',this.field2);
            if (this.isDebug) console.log('connected: and label2 ',this.label2);
            this.registerRelation(this.relList2,this.label2,this.field2);
        }
        if ((this.relList3) && (this.relList3 !== 'N/A')) {
            if (this.isDebug) console.log('connected: registering relList3',this.relList3);
            if (this.isDebug) console.log('connected: with field3 ',this.field3);
            if (this.isDebug) console.log('connected: and label3 ',this.label3);
            this.registerRelation(this.relList3,this.label3,this.field3);
        }
        if ((this.relList4) && (this.relList4 !== 'N/A')) {
            if (this.isDebug) console.log('connected: registering relList4 ',this.relList4);
            if (this.isDebug) console.log('connected: with field4 ',this.field4);
            if (this.isDebug) console.log('connected: and label4 ',this.label4);
            this.registerRelation(this.relList4,this.label4,this.field4);
        }
        if ((this.relList5) && (this.relList5 !== 'N/A')) {
            if (this.isDebug) console.log('connected: registering relList5 ',this.relList5);
            if (this.isDebug) console.log('connected: with field5 ',this.field5);
            if (this.isDebug) console.log('connected: and label5 ',this.label5);
            this.registerRelation(this.relList5,this.label5,this.field5);
        }
        if ((this.relList6) && (this.relList6 !== 'N/A')) {
            if (this.isDebug) console.log('connected: registering relList6 ',this.relList6);
            if (this.isDebug) console.log('connected: with field6 ',this.field6);
            if (this.isDebug) console.log('connected: and label6 ',this.label6);
            this.registerRelation(this.relList6,this.label6,this.field6);
        }
        if (this.isDebug) console.log('connected: relations set ',JSON.stringify(this.relations));
        if (this.isDebug) console.log('connected: kpiList set ',JSON.stringify(this.kpiList));

        this.executeQueries()
        if (this.isDebug) console.log('connected: END');
    }

    //----------------------------------------------------------------
    // Event handlers
    //----------------------------------------------------------------

    handleRefresh(event) {
        if (this.isDebug) console.log('handleRefresh: START');
        this.isLoading = true;
        this.executeQueries();
        if (this.isDebug) console.log('handleRefresh: END');
    }

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
    // Utilities
    //----------------------------------------------------------------

    registerRelation = function(relation,label,field) {
        if (this.isDebug) console.log('registerRelation: START with ',relation);
        let desc = JSON.parse(relation);
        desc.label = label;
        desc.value = 0;
        desc.class +=  ' kpiContainer kpiContainer-' + this.displaySize + this.marginClass;
        if (field) desc.sum = JSON.parse(field);
        this.relations.push(desc.name + '/' + ((desc.sum?.name) || ''));
        this.kpiList.push(desc);
        if (this.isDebug) console.log('registerRelation: END with ',desc);
    }

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
                    iterDesc.value =  this.NUM_FORMAT.format(result[iter].count || 0);
                    iterDesc.valueFull =  result[iter].count;
                    if (this.isDebug) console.log('executeQueries: value shortened to ', iterDesc.value);
                    if (iterDesc.sum) {
                        switch (iterDesc.sum.format) {
                            case "currency" :
                                iterDesc.sum.value = this.CUR_FORMAT.format(result[iter].sum || 0);
                                iterDesc.sum.valueFull =  result[iter].sum || 0;
                                break;
                            case "number" :
                                iterDesc.sum.value = this.NUM_FORMAT.format(result[iter].sum || 0);
                                iterDesc.sum.valueFull =  result[iter].sum || 0;
                                break;
                            default :
                                iterDesc.sum.value =  this.NUM_FORMAT.format(parseInt(result[iter].sum || 0)); 
                                iterDesc.sum.valueFull =  parseInt(result[iter].sum || 0);
                        }
                        if (this.isDebug) console.log('executeQueries: sum value shortened to ', iterDesc.sum.value);
                    }
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