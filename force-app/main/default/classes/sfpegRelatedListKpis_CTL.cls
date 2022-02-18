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
    public static Map<String,Object> getCounts(final String objectName, final String recordId, final list<String> relations) {
        System.debug(LoggingLevel.FINE,'getCounts: START with object name ' + objectName);
        System.debug(LoggingLevel.FINE,'getCounts: and recordId ' + recordId);
        System.debug(LoggingLevel.FINE,'getCounts: and relations ' + relations);

        List<String> queries = new List<String>();
        Map<String,String> sumMap = new Map<String,String>();
        Integer groupCount = 0;
        String currentQuery;
        for (String iter : relations) {
            System.debug(LoggingLevel.FINE,'getCounts: processing relation ' + iter);

            List<String> iterParts = iter.split('/');
            System.debug(LoggingLevel.FINE,'getCounts: iterParts split ' + iterParts);
            if (iterParts.size() > 1) {
                System.debug(LoggingLevel.FINE,'getCounts: registering sum field for relation');
                sumMap.put(iterParts[0],iterParts[1]);
            }

            groupCount += 1;
            if (groupCount == 1) {
                System.debug(LoggingLevel.FINE,'getCounts: initializing query');
                currentQuery = 'select ';
            }
            if (iterParts.size() > 1) {
                System.debug(LoggingLevel.FINE,'getCounts: fetching id and field ' + iterParts[1]);
                currentQuery += '(select id, ' + iterParts[1] + ' from ' + iterParts[0] + '),';
            }
            else {
                System.debug(LoggingLevel.FINE,'getCounts: fetching only id field');
                currentQuery += '(select id from ' + iterParts[0] + '),';
            }
            if (groupCount == 3) {
                System.debug(LoggingLevel.FINE,'getCounts: finalizing query ' + iterParts[0]);
                currentQuery = currentQuery.removeEnd(',') + ' from ' + objectName + ' where id = \'' + recordId + '\' limit 1';
                System.debug(LoggingLevel.FINE,'getCounts: registering query ' + currentQuery);
                queries.add(currentQuery);
                groupCount = 0;
            }
        }
        System.debug(LoggingLevel.FINE,'getCounts: all relations processed');
        System.debug(LoggingLevel.FINE,'getCounts: sumMap init ' + sumMap);

        if (groupCount != 0) {
            System.debug(LoggingLevel.FINE,'getCounts: finalizing last query');
            currentQuery = currentQuery.removeEnd(',') + ' from ' + objectName + ' where id = \'' + recordId + '\' limit 1';
            System.debug(LoggingLevel.FINE,'getCounts: registering last query ' + currentQuery);
            queries.add(currentQuery);
        } 
        System.debug(LoggingLevel.FINE,'getCounts: queries prepared ' + queries);

        Map<String,Object> results = new Map<String,Object>();
        for (String iter : queries) {
            System.debug(LoggingLevel.FINE,'getCounts: executing query ' + iter);
            sObject recordData = Database.query(iter);
            System.debug(LoggingLevel.FINE,'getCounts: recordData fetched ' + recordData);

            Map<String, Object> fieldsToValue = recordData.getPopulatedFieldsAsMap();
            System.debug(LoggingLevel.FINE,'getCounts: recordData fetched ' + recordData);

            for (String iterField : fieldsToValue.keySet()) {
                if ((iterField != 'Id') && (iterField != 'RecordTypeId')) {
                    System.debug(LoggingLevel.FINE,'getCounts: processing relation ' + iterField);
                    List<Object> relatedList = (List<Object>)(fieldsToValue.get(iterField));
                    Map<String,Object> iterFieldVal = new Map<String,Object>{
                        'count' => relatedList.size()
                    };
                    if (sumMap.containsKey(iterField)) {
                        String sumField = sumMap.get(iterField);
                        System.debug(LoggingLevel.FINE,'getCounts: summing field ' + sumField);
                        Double iterFieldSum = 0;
                        for (Object iterRcd : relatedList) {
                            SObject iterObj = (SObject) iterRcd;
                            iterFieldSum += (Double) (iterObj.get(sumField));
                        }
                        System.debug(LoggingLevel.FINE,'getCounts: summing done ' + iterFieldSum);
                        iterFieldVal.put('sum',iterFieldSum);
                    }
                    System.debug(LoggingLevel.FINE,'getCounts: returning relation value ' + iterFieldVal);
                    results.put(iterField,(Object)iterFieldVal);
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
