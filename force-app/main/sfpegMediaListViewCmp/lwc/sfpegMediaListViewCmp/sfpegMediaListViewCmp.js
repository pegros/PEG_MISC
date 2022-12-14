/***
* @author P-E GROS
* @date   Dec 2022
* @description  LWC Component to a liste view as media tiles with navigation links.
*               Part of the PEG_MISC package..
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

import { LightningElement, wire, api, track } from 'lwc';
//import { getListInfoByName } from 'lightning/uiListsApi';
import { NavigationMixin }  from 'lightning/navigation';
import { getListUi }        from 'lightning/uiListApi';
import { getObjectInfo }    from 'lightning/uiObjectInfoApi';

import SEE_MORE_LABEL   from '@salesforce/label/c.sfpegMediaListViewSeeMoreLabel';
import SEE_MORE_ICON    from '@salesforce/label/c.sfpegMediaListViewSeeMoreIcon';
import OPEN_LABEL       from '@salesforce/label/c.sfpegMediaListViewOpenLabel';
import REFRESH_LABEL    from '@salesforce/label/c.sfpegMediaListViewRefreshLabel';

const CONTENT_FILE_PREFIX = '069';

export default class SfpegMediaListViewCmp extends NavigationMixin(LightningElement) {

    //----------------------------------------------------------------
    // Main Configuration Properties (for App Builder)
    //----------------------------------------------------------------
    @api cardClass;     // CSS class for the component Wrapping div
    @api cardIcon;      // Icon Name for the card container (should be a SLDS supported one)
    @api cardTitle;     // Title for the card container
    @api listClass;     // CSS class for the component inner div

    @api objectName;    // Object API Name to which the list view applies
    @api listViewName;  // API Name of the list view
    @api maxRows = 10;  // Max. number of rows to display

    @api iconField;     // API Name of the field providing the tile icon name (asset) or ID (content file)
    @api titleField;    // API Name of the field providing the tile title
    @api descField;     // API Name of the field providing the tile richtext description
    @api detailFields;  // Stringified JSON array of API Names for the fields providing the details
    @api badgeField;    // API Name of the field providing the tile badge(s)

    @api tileClass;             // CSS class for the tile Wrapping div
    @api tileSize = 12;         // Width of the tiles (should be a divider of 12)
    @api iconSize = 'medium';   // Size of the tile icons
    @api buttonVariant = 'base'; // Variant for the component See More buttons
    @api showRefresh = false;   // Flag to display a list view refresh button
    @api showOpen = false;      // Flag to display a list view open button
    @api showTitles = false;    // Flag to activate field label titles (or online help if available)

    @api basePath;              // Experience Site name used in URL base path

    @api isDebug = false;       // Debug mode activation flag

    //----------------------------------------------------------------
    // Internal Technical Parameters
    //----------------------------------------------------------------
    objectDescription;          // Object description (for field labels)
    requiredFields;             // List of fields explicitly required to display the tiles
    fieldLabels = {};           // Map of required field labels by API Name (for on hover titles)
    @track errorMsg;            // Error message raised during initialisation
    detailFieldList;            // JSON parsed version of the detailFields configuration property
    @track displayData;         // Tile data to be displayed
    assetRootUrl;               // Root URL to use for icon asset file display
    
    //----------------------------------------------------------------
    // Custom Labels
    //----------------------------------------------------------------
    seeMoreLabel = SEE_MORE_LABEL;
    seeMoreIcon = SEE_MORE_ICON;
    openLabel = OPEN_LABEL;
    refreshLabel = REFRESH_LABEL;

    //----------------------------------------------------------------
    // Custom Getters
    //----------------------------------------------------------------
    get iconClass() {
        return 'icon-' + (this.iconSize || 'small');
    }

    get hasActions() {
        return this.showOpen || this.showRefresh;
    }

    //----------------------------------------------------------------
    // Component Initalisation
    //----------------------------------------------------------------

    /*@wire(getListInfoByName, { objectApiName: '$objectName', listViewApiName: '$listViewName' })
    wiredListView(data, error) {
        if (this.isDebug) console.log('wiredListView: START with objectName ', this.objectName);
        if (this.isDebug) console.log('wiredListView: and listViewName ', this.listViewName);

        if (data) {
            if (this.isDebug) console.log('wiredListView: data fetch OK', JSON.stringify(data));
        }
        else if (error) {
            console.warn('wiredListView: data fetch KO', JSON.stringify(error));
            this.errorMsg = JSON.stringify(error);
        }
        else {
            if (this.isDebug) console.log('wiredRecord: END N/A');
        }
    }*/

    @wire(getObjectInfo, { objectApiName: '$objectName' })
    wiredObject(data, error) {
        if (this.isDebug) console.log('wiredObject: START with objectName ', this.objectName);
        if (this.isDebug) console.log('wiredObject: showTitles set to ', this.showTitles);
        
        if (data) {
            if (this.isDebug) console.log('wiredObject: data fetch OK', JSON.stringify(data));
            this.objectDescription = data;

            let fieldDescs = data.data?.fields || {};
            if (this.iconField)     this.fieldLabels.icon       = this.showTitles   ? fieldDescs[this.iconField]?.inlineHelpText    || fieldDescs[this.iconField]?.label    : null;
            if (this.titleField)    this.fieldLabels.title      = this.showTitles   ? fieldDescs[this.titleField]?.inlineHelpText   || fieldDescs[this.titleField]?.label   : null;
            if (this.descField)     this.fieldLabels.description = this.showTitles  ? fieldDescs[this.descField]?.inlineHelpText    || fieldDescs[this.descField]?.label    : null;
            if (this.badgeField)    this.fieldLabels.badge      = this.showTitles   ? fieldDescs[this.badgeField]?.inlineHelpText   || fieldDescs[this.badgeField]?.label   : null;
            if (this.isDebug) console.log('wiredObject: fieldLabels init ', this.fieldLabels);
        }
        else if (error) {
            console.warn('wiredObject: data fetch KO ', JSON.stringify(error));
            this.errorMsg = JSON.stringify(error);
        }
        
        if (this.isDebug) console.log('wiredObject: END');
    }

    @wire(getListUi, {  objectApiName: '$objectName', listViewApiName:  '$listViewName', pageSize: '$maxRows',
                        fields: '$requiredFields'})
    wiredListData(data, error) {
        if (this.isDebug) console.log('wiredListData: START with objectName ', this.objectName);
        if (this.isDebug) console.log('wiredListData: and listViewName ', this.listViewName);

        if (this.isDebug) console.log('wiredListData: objectDescription set to ', JSON.stringify(this.objectDescription));
        if (this.isDebug) console.log('wiredObject: showTitles set to ', this.showTitles);
        let fieldDescs = this.objectDescription?.data?.fields || {};

        if (data) {
            if (this.isDebug) console.log('wiredListData: data fetch OK', JSON.stringify(data));

            let records = data?.data?.records?.records;
            if (this.isDebug) console.log('wiredListData: records available ', records);

            let displayData = [];
            if (records) {
                records.forEach(iter => {
                    if (this.isDebug) console.log('wiredListData: processing iter ',iter);
                    let iterVal = {id : iter.id};
                    if (this.iconField) {
                        let iconVal = iter.fields[this.iconField]?.value;
                        if (iconVal) {
                            if (iconVal.startsWith(CONTENT_FILE_PREFIX)) {
                                iterVal.icon = this.fileRootUrl + iconVal;
                            }
                            else {
                                iterVal.icon = this.assetRootUrl + iconVal;
                            }
                        }
                    }
                    if (this.titleField) iterVal.title = iter.fields[this.titleField]?.displayValue || iter.fields[this.titleField]?.value;
                    if (this.descField) iterVal.description = iter.fields[this.descField]?.displayValue || iter.fields[this.descField]?.value;
                    if (this.detailFieldList) {
                        iterVal.details = [];
                        this.detailFieldList.forEach( iterDetail => {
                            let iterDetailValue = iter.fields[iterDetail]?.displayValue || iter.fields[iterDetail]?.value;
                            if (iterDetailValue) {
                                iterVal.details.push({
                                    name: iterDetail,
                                    label: (this.showTitles ? (fieldDescs[iterDetail]?.inlineHelpText || fieldDescs[iterDetail]?.label) : null),
                                    value: iterDetailValue
                                });
                            }
                        });
                    } 
                    if (this.badgeField) {
                        if (iter.fields[this.badgeField]?.value) {
                            iterVal.badges = [];
                            if (iter.fields[this.badgeField].value.includes(';')) {
                                let badgeVals = iter.fields[this.badgeField].displayValue.split(';');
                                badgeVals.forEach(iterBadge => {
                                    iterVal.badges.push(iterBadge);
                                });
                            }
                            else {
                                iterVal.badges.push(iter.fields[this.badgeField].displayValue || iter.fields[this.badgeField].value);
                            }
                        }
                    }
                    if (this.isDebug) console.log('wiredListData: iterVal prepared ', JSON.stringify(iterVal));
                    displayData.push(iterVal);
                })
            }
            this.displayData = displayData;
            if (this.isDebug) console.log('wiredListData: END displayData finalized ', JSON.stringify(displayData));
        }
        else if (error) {
            console.warn('wiredListData: END KO / data fetch error ', JSON.stringify(error));
            this.errorMsg = JSON.stringify(error);
        }
        else {
            if (this.isDebug) console.log('wiredListData: END N/A');
        }
    }

    connectedCallback() {
        if (this.isDebug) console.log('connectedCallback: START');

        //let rootUrl = 'https://' + window.location.hostname;
        let rootUrl = '';
        if (this.basePath) {
            if (this.isDebug) console.log('connected: community basePath defined ', this.basePath);
            rootUrl += '/' + this.basePath;//(instead of s)
        }
        this.fileRootUrl = rootUrl + '/sfc/servlet.shepherd/document/download/';
        if (this.isDebug) console.log('connected: fileRootUrl init ', this.fileRootUrl);
        this.assetRootUrl = rootUrl + '/file-asset/';
        if (this.isDebug) console.log('connected: assetRootUrl init ', this.assetRootUrl);

        if (this.isDebug) console.log('connected: detailFields fetched ', this.detailFields);
        if (this.detailFields) {
            this.detailFieldList = JSON.parse(this.detailFields);
            if (this.isDebug) console.log('connected: detailFieldList parsed ', this.detailFieldList);
        }

        if (this.objectName) {
           let requiredFields = [];
            if (this.iconField)     requiredFields.push(this.objectName + '.' + this.iconField);
            if (this.titleField)    requiredFields.push(this.objectName + '.' + this.titleField);
            if (this.descField)     requiredFields.push(this.objectName + '.' + this.descField);
            if (this.detailFieldList) {
                this.detailFieldList.forEach(item => {requiredFields.push(this.objectName + '.' + item);});
            }
            if (this.badgeField)    requiredFields.push(this.objectName + '.' + this.badgeField);
            if (this.isDebug) console.log('connected: requiredFields init ', requiredFields);
            this.requiredFields = requiredFields;
        }
        
        if (this.isDebug) console.log('connectedCallback: END');

    }

    //----------------------------------------------------------------
    // Event Handlers
    //----------------------------------------------------------------

    // Handler for List View open from header button
    handleOpen(event) {
        if (this.isDebug) console.log('handleOpen: START');

        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: this.objectName,
                actionName: 'list'
            },
            state: {
                filterName: this.listViewName
            }
        });

        if (this.isDebug) console.log('handleOpen: END');
    }

    // Handler for List View refresh from header button
    handleRefresh(event) {
        if (this.isDebug) console.log('handleRefresh: START');

        let requiredFields = [... this.requiredFields];
        this.requiredFields = requiredFields;

        if (this.isDebug) console.log('handleRefresh: END');
    }
    
    // Handler for target SeeMore from tile navigation buttons
    handleSeeMore(event) {
        if (this.isDebug) console.log('handleSeeMore: START');
        //if (this.isDebug) console.log('handleSeeMore: src ', event.srcElement);
        //if (this.isDebug) console.log('handleSeeMore: src dataset ', event.srcElement?.dataset);
        //if (this.isDebug) console.log('handleSeeMore: src value ', event.srcElement?.dataset?.target);
        
        let target = event.srcElement?.dataset?.target;
        if (this.isDebug) console.log('handleSeeMore: target determined ', target);

        let pageRef = {
            type: 'standard__recordPage',
            attributes: {
                recordId:       target,
                objectApiName:  this.objectName,
                actionName:     'view'
            }
        };
        if (this.isDebug) console.log('handleSeeMore: pageRef init ', pageRef);

        this[NavigationMixin.Navigate](pageRef);

        if (this.isDebug) console.log('handleSeeMore: END');
    }

}