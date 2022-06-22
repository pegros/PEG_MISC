/***
* @description  Test class for the sfpegRelatedListKpis_CTL and sfpegRelatedListSelector_CTL classes.
*               It is in ViewAllData mode to avoid complex test data initialisation constraints
*               and simply uses a random Account record for tests.
* @author       P-E GROS
* @date         June 2022
* @see          sfpegRelatedListKpis_CTL
* @see          sfpegRelatedListSelector_CTL
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

@isTest
public class  sfpegRelatedList_TST {

    /***
    * @description  Tests the "getDefaultValue" method of the sfpegRelatedListSelector_CTL class,
    *               which should always return the default N/A value.
    * @see sfpegFieldsetSelector_CTL
    ***/
    @isTest
    static void testGetDefaultValue() {
        System.debug('testGetDefaultValue: START'); 
        Test.startTest();

        VisualEditor.DesignTimePageContext  testContext = new VisualEditor.DesignTimePageContext();
        testContext.entityName =  'Account';
        System.debug('testGetDefaultValue: testContext init'); 

        sfpegRelatedListSelector_CTL controller = new sfpegRelatedListSelector_CTL(testContext);
        System.debug('testGetDefaultValue: controller init'); 
    
        VisualEditor.DataRow defVal = controller.getDefaultValue();
        System.debug('testGetDefaultValue: getDefaultValue called ' + defVal); 

        System.assertEquals('N/A',defVal.getValue());

        Test.stopTest();
        System.debug('testGetDefaultValue: END');
    }

    /***
    * @description  Tests the "getValues" method of the sfpegRelatedListSelector_CTL class,
    *               which should always include the default N/A value.
    * @see sfpegFieldsetSelector_CTL
    ***/
    @isTest
    static void testGetValues() {
        System.debug('testGetValues: START'); 
        Test.startTest();

        VisualEditor.DesignTimePageContext  testContext = new VisualEditor.DesignTimePageContext();
        testContext.entityName =  'Account';
        System.debug('testGetValues: testContext init'); 

        sfpegRelatedListSelector_CTL controller = new sfpegRelatedListSelector_CTL(testContext);
        System.debug('testGetValues: controller init'); 
    
        VisualEditor.DynamicPickListRows listVal = controller.getValues();
        System.debug('testGetValues: getValues called ' + listVal); 

        System.assert(listVal.size() > 0);

        Test.stopTest();
        System.debug('testGetValues: END');
    }

    /***
    * @description  Tests the "getCounts" method of the sfpegRelatedListKpis_CTL class,
    *               including all error cases.
    * @see  sfpegRelatedListKpis_CTL
    ***/

    @isTest(SeeAllData=true)
    static void testGetCounts() {
        System.debug('testGetCounts: START'); 
        Test.startTest();

        String testAccountId = null;
        List<Opportunity> tstOpt = [select AccountId from Opportunity limit 1];
        if ((tstOpt != null) && (!tstOpt.isEmpty())) {
            testAccountId = tstOpt[0].AccountId;
        }
        else {
            List<Case> tstCase = [select AccountId from Case limit 1];
            if ((tstCase != null) && (!tstCase.isEmpty())) {
                testAccountId = tstCase[0].AccountId;
            }
            else {
                Account testAccount = [select Id from Account limit 1];
                testAccountId = testAccount?.Id;
            }
        }
        System.debug('testGetCounts: testAccountId set ' + testAccountId);
        if (testAccountId == null) {
            throw new DmlException('At least one Account should be present in the Database');
        }

        List<String> relationList = new List<String>{'Cases/','Opportunities/Amount'};
        System.debug('testGetCounts: relationList set ' + relationList);

        try {
            sfpegRelatedListKpis_CTL.getCounts('SFPEG_DUMMY_OBJECT','DUMMY_ID',relationList);
            System.debug(LoggingLevel.Error,'testGetCounts: no exception raised for invalid object name');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetCounts: proper exception raised for invalid object name ' + e.getMessage());
            System.assert(true);
        }

        try {
            Map<String,Object> countMap = sfpegRelatedListKpis_CTL.getCounts('Account',testAccountId,relationList);
            System.debug('testGetCounts: counts for test relations found ' + countMap);
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetCounts:  counts for test relations not returned ' + e.getMessage());
            System.assert(false);
        }

        Test.stopTest();
        System.debug('testGetCounts: END');    
    }
}