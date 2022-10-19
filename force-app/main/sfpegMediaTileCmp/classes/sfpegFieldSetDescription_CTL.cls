/***
* @description  Lightning controller to fetch the description of a FieldSet.
*               Part of the PEG_MISC package.
* @author       P-E GROS
* @date         April 2022
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

public with sharing class sfpegFieldSetDescription_CTL {

    /***
    * @description Simple method to fetch the list of fields allowed for the user included in
    *              a configured field set.
    * @param       fieldSet             Dev Name of the Field Set 
    * @return      Map<String,Object>   Map containing 2 entries:
    *                                   'label' with the label of the field set,
    *                                   'fields' with the label, name and type of each accessible field
    * @exception   Various exceptions in case input format / data is incorrect.
    ***/

    @AuraEnabled(cacheable=true)
    public static Map<String,Object> getFieldSetDesc(final String name) {
        System.debug('getFieldSetDesc: START with field set name ' + name);

        String[] fsParts = name.split('\\.');
        System.debug('getFieldSetDesc: fsParts extracted ' + fsParts);
        if (fsParts.size()<> 2) throw new AuraHandledException(
            'Bad field set name format for ' + name + '\n Should be "object.fsName".');

        String objName = fsParts[0];
        System.debug('getFieldSetDesc: objName extracted ' + objName);
        String fsName  = fsParts[1];
        System.debug('getFieldSetDesc: fsName extracted ' + fsName);

        Schema.SObjectType objDesc = Schema.getGlobalDescribe().get(objName);
        if (objDesc == null) throw new AuraHandledException(
            'Unknown Object Name for field set ' + name + ' !');
        System.debug('getFieldSetDesc: object descriptor found ');

        Schema.FieldSet fsDesc = objDesc.getDescribe().fieldSets.getMap().get(fsName);
        if (fsDesc == null) throw new AuraHandledException(
            'Unknown Field Set Name for field set ' + name + ' !');
        System.debug('getFieldSet: field set descriptor found ');

        Map<String,Object> descResult = new Map<String,Object>();
        descResult.put('label',fsDesc.getLabel());
        System.debug('getFieldSet: field set Label set ' + fsDesc.getLabel());

        List<Map<String,Object>> fieldDescs = new List<Map<String,Object>>();
        descResult.put('fields',fieldDescs);
        for (Schema.FieldSetMember fieldIter : fsDesc.getFields()) {
            System.debug('getFieldSet: processing field ' + fieldIter.getSObjectField());

            Schema.DescribeFieldResult fieldDesc = fieldIter.getSObjectField().getDescribe();
            System.debug('getFieldSet: fieldDesc fetched ' + fieldDesc);

            if (fieldDesc.isAccessible()) {
                System.debug('getFieldSet: adding accessible field ' + fieldIter.getSObjectField());
                Map<String,Object> fieldMap = new Map<String,Object> {
                    'label' => fieldDesc.getLabel(),
                    'name' => fieldDesc.getName(),
                    'type' => '' + fieldDesc.getType(),
                    'required' => fieldIter.getRequired()
                };
                fieldDescs.add(fieldMap);
            }
            else {
                System.debug('getFieldSet: field not accessible ' + fieldIter.getSObjectField());
            }
        }

        System.debug('getFieldSet: fieldDescs prepared ' + fieldDescs);
        System.debug('getFieldSet: descResult finalised ' + descResult);

        System.debug('getFieldSet: END for fieldDescs with size ' + fieldDescs.size());
        return descResult;
    }
}
