/***
* @description  Lightning controller to count records in a set of related lists of a given record.
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

public with sharing class sfpegRelatedListKpis_CTL {
    
    /***
    * @description  Simple method to count records in a set of related lists of a record.
    * @param        objectName  API Name of the target record
    * @param        recordId    Salesforce ID of the target record
    * @param        relations   List of API names of child relationships of the target record
    * @return       list<Object> Count results for each relation
    * @exception    AuraHandledException    Raised if no configuration found for the provided name
    ***/
    @AuraEnabled
    public static Map<String,Integer> getCounts(final String objectName, final String recordId, final list<String> relations) {
        System.debug(LoggingLevel.FINE,'getCounts: START with object name ' + objectName);
        System.debug(LoggingLevel.FINE,'getCounts: and recordId ' + recordId);
        System.debug(LoggingLevel.FINE,'getCounts: and relations ' + relations);

        List<String> queries = new List<String>();
        Integer groupCount = 0;
        String currentQuery;
        for (String iter : relations) {
            System.debug(LoggingLevel.FINE,'getCounts: processing relation ' + iter);
            groupCount += 1;
            if (groupCount == 1) {
                System.debug(LoggingLevel.FINE,'getCounts: initializing query');
                currentQuery = 'select ';
            }
            currentQuery += '(select id from ' + iter + '),';
            if (groupCount == 3) {
                System.debug(LoggingLevel.FINE,'getCounts: finalizing query');
                currentQuery = currentQuery.removeEnd(',') + ' from ' + objectName + ' where id = \'' + recordId + '\' limit 1';
                System.debug(LoggingLevel.FINE,'getCounts: registering query ' + currentQuery);
                queries.add(currentQuery);
                groupCount = 0;
            }
        }
        System.debug(LoggingLevel.FINE,'getCounts: all relation processed');
        if (groupCount != 0) {
            System.debug(LoggingLevel.FINE,'getCounts: finalizing last query');
            currentQuery = currentQuery.removeEnd(',') + ' from ' + objectName + ' where id = \'' + recordId + '\' limit 1';
            System.debug(LoggingLevel.FINE,'getCounts: registering last query ' + currentQuery);
            queries.add(currentQuery);
        } 
        System.debug(LoggingLevel.FINE,'getCounts: queries prepared ' + queries);

        Map<String,Integer> results = new Map<String,Integer>();
        for (String iter : queries) {
            System.debug(LoggingLevel.FINE,'getCounts: executing query ' + iter);
            sObject recordData = Database.query(iter);
            System.debug(LoggingLevel.FINE,'getCounts: recordData fetched ' + recordData);

            Map<String, Object> fieldsToValue = recordData.getPopulatedFieldsAsMap();
            System.debug(LoggingLevel.FINE,'getCounts: recordData fetched ' + recordData);

            for (String iterField : fieldsToValue.keySet()) {
                if ((iterField != 'Id') && (iterField != 'RecordTypeId')) {
                    System.debug(LoggingLevel.FINE,'getCounts: processing field ' + iterField);
                    List<Object> relatedList = (List<Object>)(fieldsToValue.get(iterField));
                    results.put(iterField,relatedList.size());
                }
                else {
                    System.debug(LoggingLevel.FINE,'getCounts: ignoring standard field ' + iterField);
                }
            }
        }
        System.debug(LoggingLevel.FINE,'getCounts: END with ' + results);
        return results;
    }

}
