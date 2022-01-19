/***
* @description  Lightning controller to list all related lists of the current Record.
*               It is meant to be used in 'datasource' properties of LWC component field configuration
*               Part of the PEG_MISC package.
* @author       P-E GROS
* @date         Jan 2022
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

global with sharing class sfpegRelatedListSelector_CTL extends VisualEditor.DynamicPickList {
    
    static Map<String,String> standardObjectMap = new Map<String,String>{
        'ContentDocumentLink' => 'File',
        'AttachedContentDocument' => 'File',
        'AttachedContentNote' => 'Note',
        'ActivityHistory' => 'Task2',
        'OpenActivity' => 'Events',
        'TopicAssignment' => 'Topic',
        'EmailMessage' => 'Email',
        'ActionPlan' => 'Entitlement'
    };
    static Map<String,String> standardCustomObjectMap = new Map<String,String>{
        'BranchUnitRelatedRecord' => 'Custom16'
    };

    /***
    * @description Context of the Lightning page calling the picklist controller.
    ***/
    VisualEditor.DesignTimePageContext pageContext;

    /***
    * @description Constructor enabling to fetch the Lightning page context (and especially
    *              the entityName of the record being displayed in the page).
    * @param       VisualEditor.DesignTimePageContext   Current page context
    * @exception   none really specific.
    ***/    

    global sfpegRelatedListSelector_CTL(VisualEditor.DesignTimePageContext pageContext) {
        System.debug(LoggingLevel.FINEST,'Constructor: START with page context ' + pageContext);
        System.debug(LoggingLevel.FINEST,'Constructor: entityName ' + pageContext.entityName);
        this.pageContext = pageContext;
    }


    /***
    * @description Override of the method providing the default value.
    * @return      VisualEditor.DataRow   Always returns the default ('---','N/A') value.
    * @exception   none really specific.
    ***/
    global override VisualEditor.DataRow getDefaultValue() {
        System.debug(LoggingLevel.FINEST,'getDefaultValue: START');
        return new VisualEditor.DataRow('---','N/A');
    }
    
    /***
    * @description Override of the method providing the set of picklist values.
    *              Returns label / api names couples for all picklist fields
    *              defined on entity. Includes a default ('---','N/A') value.
    * @return      VisualEditor.DynamicPickListRows  List of picklist values for datasource.
    * @exception   none really specific.
    ***/
    global override VisualEditor.DynamicPickListRows getValues() {
        System.debug(LoggingLevel.FINEST,'getValues: START Number');

        VisualEditor.DynamicPickListRows picklistValues = new VisualEditor.DynamicPickListRows();
        picklistValues.addRow(new VisualEditor.DataRow('---','N/A'));
        System.debug(LoggingLevel.FINEST,'getValues: picklistValues init ' + picklistValues);

        System.debug(LoggingLevel.FINEST,'getValues: entity name fetched ' + pageContext.entityName);
        Schema.SObjectType entityDesc = Schema.getGlobalDescribe().get(pageContext.entityName);
        System.debug(LoggingLevel.FINEST,'getValues: entityDesc fetched ' + entityDesc);

        List<Schema.ChildRelationship> childRelationships = entityDesc.getDescribe().getChildRelationships();
        System.debug(LoggingLevel.FINEST,'getValues: childRelationships fetched ' + childRelationships);

        Map<String,String> relatedObjects = new Map<String,String>();
        for (Schema.ChildRelationship iter : childRelationships){
            if (String.isNotBlank(iter.getRelationshipName())) {
                String iterName = iter.getRelationshipName();
                System.debug(LoggingLevel.FINEST,'getValues: processing relation ' + iterName);

                String iterObjectName = iter.getChildSObject().getDescribe().getName();
                System.debug(LoggingLevel.FINEST,'getValues: related object ' + iterObjectName);
                Boolean iterIsCustomObject = iter.getChildSObject().getDescribe().isCustom();
                System.debug(LoggingLevel.FINEST,'getValues: custom object? ' + iterIsCustomObject);

                String iterIconData = relatedObjects.get(iterObjectName);
                if (iterIconData == null) {
                    System.debug(LoggingLevel.FINEST,'getValues: initializing icondata ');
                    if (iterIsCustomObject) {
                        String iconName = getCustomObjectIcon(iterObjectName);
                        iterIconData = '"icon":"custom:' + iconName + '","class":"slds-icon-custom-' + iconName + '"';
                    }
                    else if (standardCustomObjectMap.containsKey(iterObjectName)) {
                        System.debug(LoggingLevel.FINEST,'getValues: overriding object name ' + iterObjectName);
                        iterObjectName = standardCustomObjectMap.get(iterObjectName);
                        iterIconData = '"icon":"custom:' + iterObjectName.tolowercase() + '","class":"slds-icon-custom-' + iterObjectName.tolowercase() + '"';
                    }
                    else {
                        if (standardObjectMap.containsKey(iterObjectName)) {
                            System.debug(LoggingLevel.FINEST,'getValues: overriding object name ' + iterObjectName);
                            iterObjectName = standardObjectMap.get(iterObjectName);
                            System.debug(LoggingLevel.FINEST,'getValues: by ' + iterObjectName);
                        }
                        iterIconData = '"icon":"standard:' + iterObjectName.tolowercase() + '","class":"slds-icon-standard-' + iterObjectName.tolowercase() + '"';
                    }
                    System.debug(LoggingLevel.FINEST,'getValues: icondata init ' + iterIconData);
                    relatedObjects.put(iterObjectName,iterIconData);
                    System.debug(LoggingLevel.FINEST,'getValues: icondata registered');
                }
                else {
                    System.debug(LoggingLevel.FINEST,'getValues: reusing icondata ' + iterIconData);
                }

                picklistValues.addRow(new VisualEditor.DataRow(
                    iterName,
                    '{"name":"' + iterName + '",' + iterIconData + '}'));
            }
            else {
                System.debug(LoggingLevel.FINE,'getValues: ignoring relationship without name ' + iter);
            }
        }
        System.debug(LoggingLevel.FINEST,'getValues: END returning ' + picklistValues);
        return picklistValues;
    }

    /***
    * @description  Private utility method to fetch the SLDS icon name related to a custom SObject.
    *               It parses all tabs incuded in all apps to try and find the SLDS svg icon name
    *               associated to teh custom object tab. 
    *               The object tab should be included at least in one of the apps to become avvailable.
    *               A default 'custom9' value is returned by default. 
    * @param        objectName  API Name of the SObject
    * @return       String      customXX name of the SLDS icon related 
    * @exception    none
    ***/
    @TestVisible
    private static String getCustomObjectIcon(final String objectName) {
        System.debug('getCustomObjectIcon: START with object ' + objectName);

        String objectIcon = 'custom9';
        List<Schema.DescribeTabSetResult> tabSetDesc = Schema.describeTabs();
        for (Schema.DescribeTabSetResult iter : tabSetDesc) {
            System.debug('getCustomObjectIcon: processing App ' + iter.getLabel());
            List<Schema.DescribeTabResult> iterTabs = iter.getTabs();
            for (Schema.DescribeTabResult iterTab : iterTabs) {
                if (iterTab.isCustom()) {
                    System.debug('getCustomObjectIcon: processing Tab ' + iterTab.getSObjectName()); 
                    if (iterTab.getSObjectName() == objectName) {
                        System.debug('getCustomObjectIcon: fetching icon ID');
                        List<Schema.DescribeIconResult> iterIcons = iterTab.getIcons();
                        for (Schema.DescribeIconResult iterIcon : iterIcons) {
                            //System.debug('getData: ' + ' # ' + iterIcon.getContentType()); 
                            if (iterIcon.getContentType() == 'image/svg+xml') {
                                Integer lastSlash = (iterIcon.getUrl()).lastIndexOf('/') + 1;
                                Integer lastDot = (iterIcon.getUrl()).lastIndexOf('.');
                                objectIcon = (iterIcon.getUrl()).mid(lastSlash, lastDot - lastSlash);

                                System.debug('getCustomObjectIcon: END / icon Name found ' + objectIcon);
                                return objectIcon;
                            }
                        }
                    }
                    else {
                        System.debug('getCustomObjectIcon: ignored (different object)');
                    } 
                }
                else {
                    System.debug('getCustomObjectIcon: ignored (standard object)');
                } 
            }
        }
        System.debug('getCustomObjectIcon: END / object icon not found, returning default ' + objectIcon);   
        return objectIcon;
    }
}