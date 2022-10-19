/***
* @description Test class for the sfpegPicklistRecordSelector_CTL and sfpegPicklistUserSelector_CTL classes.
* @author      P-E GROS
* @date        June 2022
* @see         sfpegPicklistRecordSelector_CTL
* @see         sfpegPicklistUserSelector_CTL
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
public class  sfpegPicklist_TST {
    
    /***
    * @description Initializes the test context.
    ***/
    @testSetup
    static void testSetup() {
        System.debug('testSetup: START');

        System.debug('testSetup: END');
    }

    /***
    * @description  Tests the "getDefaultValue" method of the sfpegPicklistRecordSelector_CTL class,
    *               which should always return the default N/A value.
    * @see sfpegPicklistRecordSelector_CTL
    ***/
    static TestMethod void testGetDefaultValue() {
        System.debug('testGetDefaultValue: START'); 
        Test.startTest();

        VisualEditor.DesignTimePageContext  testContext = new VisualEditor.DesignTimePageContext();
        testContext.entityName =  'Account';
        System.debug('testGetDefaultValue: testContext init'); 

        sfpegPicklistRecordSelector_CTL controller = new sfpegPicklistRecordSelector_CTL(testContext);
        System.debug('testGetDefaultValue: controller init'); 
    
        VisualEditor.DataRow defVal = controller.getDefaultValue();
        System.debug('testGetDefaultValue: getDefaultValue called ' + defVal); 

        System.assertEquals('N/A',defVal.getValue());

        Test.stopTest();
        System.debug('testGetDefaultValue: END');
    }

    /***
    * @description  Tests the "getValues" method of the sfpegPicklistRecordSelector_CTL class,
    *               which should always include the default N/A value.
    * @see sfpegPicklistRecordSelector_CTL
    ***/
    static TestMethod void testGetValues() {
        System.debug('testGetValues: START'); 
        Test.startTest();

        VisualEditor.DesignTimePageContext  testContext = new VisualEditor.DesignTimePageContext();
        testContext.entityName =  'Account';
        System.debug('testGetValues: testContext init'); 

        sfpegPicklistRecordSelector_CTL controller = new sfpegPicklistRecordSelector_CTL(testContext);
        System.debug('testGetValues: controller init'); 
    
        VisualEditor.DynamicPickListRows listVal = controller.getValues();
        System.debug('testGetValues: getValues called ' + listVal); 

        System.assert(listVal.size() > 0);

        Test.stopTest();
        System.debug('testGetValues: END');
    }

    /***
    * @description  Tests the "getDefaultValue" method of the sfpegPicklistUserSelector_CTL class,
    *               which should always return the default N/A value.
    * @see sfpegPicklistUserSelector_CTL
    ***/
    static TestMethod void testGetDefaultValueUser() {
        System.debug('testGetDefaultValueUser: START'); 
        Test.startTest();

        VisualEditor.DesignTimePageContext  testContext = new VisualEditor.DesignTimePageContext();
        testContext.entityName =  'Account';
        System.debug('testGetDefaultValueUser: testContext init'); 

        sfpegPicklistUserSelector_CTL controller = new sfpegPicklistUserSelector_CTL(testContext);
        System.debug('testGetDefaultValueUser: controller init'); 
    
        VisualEditor.DataRow defVal = controller.getDefaultValue();
        System.debug('testGetDefaultValueUser: getDefaultValue called ' + defVal); 

        System.assertEquals('N/A',defVal.getValue());

        Test.stopTest();
        System.debug('testGetDefaultValueUser: END');
    }

    /***
    * @description  Tests the "getValues" method of the sfpegPicklistUserSelector_CTL class,
    *               which should always include the default N/A value.
    * @see sfpegPicklistUserSelector_CTL
    ***/
    static TestMethod void testGetValuesUser() {
        System.debug('testGetValuesUser: START'); 
        Test.startTest();

        VisualEditor.DesignTimePageContext  testContext = new VisualEditor.DesignTimePageContext();
        testContext.entityName =  'Account';
        System.debug('testGetValuesUser: testContext init'); 

        sfpegPicklistUserSelector_CTL controller = new sfpegPicklistUserSelector_CTL(testContext);
        System.debug('testGetValuesUser: controller init'); 
    
        VisualEditor.DynamicPickListRows listVal = controller.getValues();
        System.debug('testGetValuesUser: getValues called ' + listVal); 

        System.assert(listVal.size() > 0);

        Test.stopTest();
        System.debug('testGetValuesUser: END');
    }
}
