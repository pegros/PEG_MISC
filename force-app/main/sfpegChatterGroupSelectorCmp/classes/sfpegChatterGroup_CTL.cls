/***
* @description  Lightning controller for the sfpegChatterGroupSelectorCmp Aura component.
*               It mainly enables teh component to fetch the list of Chatter Group IDs
*               given their Names, either provided explicitly or implicitly via field
*               values on the current User or Record (leveraging a {{{TOKEN.field}}} merge
*               syntax) 
* @author       P-E GROS
* @date         Oct 2022
* @see PEG_MISC package (https://github.com/pegros/PEG_MISC)
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

public with sharing class sfpegChatterGroup_CTL {
    
    /***
    * @description  regex patterns to extract context tokens.
    ***/
    static final Pattern TOKEN_PATTERN = Pattern.compile('\\{\\{\\{([A-Z]{3}).(\\w+)\\}\\}\\}');

    /***
    * @description  Method to get the list of Group Names and IDs corresponding to a configured
    *               list (as a Stringified JSON array of group names).
    *               Dynamic values from current User or Record may be included leveraging context 
    *               merge tokens (as {{{USR.fieldApiName}}} for User fields or {{{RCD.fieldApiName}}}
    *               for record ones).
    ***/
    @AuraEnabled(cacheable=true)
    public static List<CollaborationGroup> getGroupIds(final String groupNames, final String objectApiName, final String recordId) {
        System.debug('getGroupIds: START with group names ' + groupNames);

        if (String.isBlank(groupNames)) {
            System.debug(LoggingLevel.ERROR,'getGroupIds: END KO /  no group names provided');
            throw new AuraHandledException('Missing Group Names configuration');
        }

        String mergedGroupNames;
        if (groupNames.contains('{{{')) {
            System.debug('getGroupIds: merging tokens');
            mergedGroupNames = mergeTemplate(groupNames,objectApiName, recordId);
        }
        else {
            System.debug('getGroupIds: no merge required');
            mergedGroupNames = groupNames;
        }

        List<Object> groupNamesList;
        try {
            groupNamesList = (List<Object>) JSON.deserializeUntyped(mergedGroupNames);
            System.debug(LoggingLevel.FINE,'getGroupIds: group names split ' + groupNamesList);
        }
        catch (Exception e) {
            throw new AuraHandledException('Configuration parsing error: ' + e.getMessage());
        }

        List<String> nameList = new  List<String>();
        for (Object iter: groupNamesList){
            nameList.add((String)iter);
        }
        System.debug(LoggingLevel.FINE,'getGroupIds: group names extracted ' + nameList);

        List<CollaborationGroup> groupList;
        try {
            groupList = [select Id, Name from CollaborationGroup where Name in :nameList];
            System.debug(LoggingLevel.FINE,'getGroupIds: group record fetched ' + groupList);
        }
        catch (Exception e) {
            throw new AuraHandledException('Group Data fetch error: ' + e.getMessage());
        }

        System.debug(LoggingLevel.FINE,'getGroupIds: END');
        return sortByName(groupList,nameList);
    }

    /***
    * @description  Private utility method to extract all USR or RCD context tokens in a template and
    *               and replace them via their actual values fetche via SOQL.
    ***/
    private static String mergeTemplate(final String template, final String objectApiName, final String recordId) {
        System.debug('mergeTemplate: START with ' + template);

        Map<String,Map<String,String>> tokenMap = extractTokens(template);
        System.debug('mergeTemplate: tokens extracted');

        String mergedTemplate = template;
        if (tokenMap.containsKey('USR')) {
            System.debug('mergeTemplate: replacing User fields');
            mergedTemplate = replaceTokens(mergedTemplate, tokenMap.get('USR'), 'User', UserInfo.getUserId());
            System.debug('mergeTemplate: USR tokens replaced ' + mergedTemplate);
        }

        if (tokenMap.containsKey('RCD')) {
            System.debug('mergeTemplate: replacing Record fields');
            mergedTemplate = replaceTokens(mergedTemplate, tokenMap.get('RCD'), objectApiName, recordId);
            System.debug('mergeTemplate: RCD tokens replaced ' + mergedTemplate);
        }
        System.debug('mergeTemplate: END with ' + mergedTemplate);
        return mergedTemplate;
    }

    /***
    * @description  Private utility method to extract all USR or RCD context tokens in a template
    *               It returns a map per token name (e.g. USR) of all merge tokens (e.g. {{{USR.GroupName__c}}})
    *               and their related field (i.e. GroupName__c)
    ***/
    private static Map<String,Map<String,String>> extractTokens(final String template) {
        System.debug('extractTokens: START with ' + template);

        Map<String,Map<String,String>> tokenMap = new  Map<String,Map<String,String>>();
        Matcher tokenMatcher = TOKEN_PATTERN.matcher(template);
            
        while (tokenMatcher.find()) {
            System.debug(LoggingLevel.FINE,'extractTokens: processing match ' + tokenMatcher.group(0));

            String objectToken = tokenMatcher.group(1);
            System.debug(LoggingLevel.FINE,'extractTokens: objectToken identified ' + objectToken);

            String fieldName = tokenMatcher.group(2);
            System.debug(LoggingLevel.FINE,'extractTokens: fieldName identified ' + fieldName);

            if (!tokenMap.containsKey(objectToken)) {
                System.debug(LoggingLevel.FINE,'extractTokens: registering object map for ' + objectToken);
                tokenMap.put(objectToken,new Map<String,String>());
            }
            Map<String,String> objectMap = tokenMap.get(objectToken);

            objectMap.put(tokenMatcher.group(0),fieldName);
        }
    
        System.debug('extractTokens: END with ' + tokenMap);
        return tokenMap;
    }

    /***
    * @description  Private utility method to replace in a template all context tokens listed in a Map
    *               after having fetched the corresponding data via SOQL.
    ***/
    private static String replaceTokens(final String template, final Map<String,String> tokenMap, final String objectName, final String recordId) {
        System.debug('replaceTokens: START for object ' + objectName);

        if (tokenMap.isEmpty()) {
            System.debug('replaceTokens: END / no token to process');
            return template;
        }
        System.debug('replaceTokens: fetching fields ' + tokenMap.values());

        String mergedTemplate = template;

        String fieldQuery = 'SELECT ' +  String.join(tokenMap.values(),',') + ' FROM ' + objectName + ' WHERE Id = \'' + recordId  + '\' LIMIT 1';
        System.debug(LoggingLevel.FINE, 'replaceTokens: fieldQuery init ' + fieldQuery);

        SObject recordData = database.query(fieldQuery);
        System.debug('replaceTokens: record data fetched ' + recordData);

        for (String iter : tokenMap.keySet()) {
            System.debug(LoggingLevel.FINE, 'replaceTokens: replacing token ' + iter);
            String iterField = tokenMap.get(iter);
            System.debug(LoggingLevel.FINE, 'replaceTokens: with value ' + recordData.get(iterField));
            mergedTemplate = mergedTemplate.replace(iter,(String)(recordData.get(iterField)));
        }
        System.debug('replaceTokens: END with ' + mergedTemplate);
        return mergedTemplate;
    }

    /***
    * @description  Private utility method to sort Group records (e.g. returned by a SOQL query) according to 
    *               a sequence of Group Names (e.g. provided as input).
    ***/
    private static List<CollaborationGroup> sortByName(final List<CollaborationGroup> groupList, final List<String> nameList) {
        System.debug('sortByName: START');

        Map<String,CollaborationGroup> groupMap = new Map<String,CollaborationGroup>();
        for (CollaborationGroup iter : groupList) {
            groupMap.put(iter.Name,iter); 
        }
        System.debug('sortByName: Map prepared');

        List<CollaborationGroup> sortedGroupList = new List<CollaborationGroup>();
        for (String iter : nameList) {
            CollaborationGroup iterGroup = groupMap.get(iter);
            if (iterGroup != null) {
                System.debug('sortByName: registering Group ' + iter);
                sortedGroupList.add(iterGroup);
            }
            else {
                System.debug(LoggingLevel.WARN,'sortByName: Missing Group ' + iter);
            }
        }

        System.debug('sortByName: END with ' + sortedGroupList);
        return sortedGroupList;
    }
}
