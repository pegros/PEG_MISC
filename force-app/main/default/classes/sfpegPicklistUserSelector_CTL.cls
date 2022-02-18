/***
* @description  Lightning controller to list all picklist fields of the User object.
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

global with sharing class sfpegPicklistUserSelector_CTL extends VisualEditor.DynamicPickList {
    
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

    global sfpegPicklistUserSelector_CTL(VisualEditor.DesignTimePageContext pageContext) {
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

        Map<String,Schema.SObjectField> entityFields = User.sObjectType.getDescribe().fields.getMap();
        System.debug(LoggingLevel.FINEST,'getValues: entityFields fetched ' + entityFields);

        for (String fieldName : entityFields.keySet()){
            System.debug(LoggingLevel.FINEST,'getValues: processing fieldName ' + fieldName);
            DescribeFieldResult fieldDesc = entityFields.get(fieldName).getDescribe();
            //System.debug(LoggingLevel.FINEST,'getValues: field desc ' + fieldDesc);
            System.debug(LoggingLevel.FINEST,'getValues: field type '  + fieldDesc.getType());
            switch on (fieldDesc.getType()) {
                when Picklist {
                    System.debug(LoggingLevel.FINE,'getValues: registering picklist field ' + fieldName);
                    System.debug(LoggingLevel.FINEST,'getValues: field label ' + fieldDesc.getLabel());
                    System.debug(LoggingLevel.FINEST,'getValues: field local name ' + fieldDesc.getLocalName());
                    System.debug(LoggingLevel.FINEST,'getValues: field name ' + fieldDesc.getName());
                    picklistValues.addRow(new VisualEditor.DataRow(
                        fieldDesc.getLabel(),
                        'User.' + fieldDesc.getName()));
                }
                when else {
                    System.debug(LoggingLevel.FINE,'getValues: ignoring non picklist field ' + fieldName);
                }
            }
        }
        System.debug(LoggingLevel.FINEST,'getValues: END returning ' + picklistValues);
        return picklistValues;
    }
}