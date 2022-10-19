/***
* @description Test class for the sfpegFieldSetDescription_CTL and sfpegFieldsetSelector_CTL classes.
* @author      P-E GROS
* @date        June 2022
* @see         sfpegFieldSetDescription_CTL
* @see         sfpegFieldsetSelector_CTL
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
public class  sfpegFieldSet_TST {
    
    /***
    * @description Initializes the test context.
    ***/
    @testSetup
    static void testSetup() {
        System.debug('testSetup: START');

        System.debug('testSetup: END');
    }

    /***
    * @description  Tests the "getDefaultValue" method of the sfpegFieldsetSelector_CTL class,
    *               which should always return the default N/A value.
    * @see sfpegFieldsetSelector_CTL
    ***/
    static TestMethod void testGetDefaultValue() {
        System.debug('testGetDefaultValue: START'); 
        Test.startTest();

        VisualEditor.DesignTimePageContext  testContext = new VisualEditor.DesignTimePageContext();
        testContext.entityName =  'Account';
        System.debug('testGetDefaultValue: testContext init'); 

        sfpegFieldsetSelector_CTL controller = new sfpegFieldsetSelector_CTL(testContext);
        System.debug('testGetDefaultValue: controller init'); 
    
        VisualEditor.DataRow defVal = controller.getDefaultValue();
        System.debug('testGetDefaultValue: getDefaultValue called ' + defVal); 

        System.assertEquals('N/A',defVal.getValue());

        Test.stopTest();
        System.debug('testGetDefaultValue: END');
    }

    /***
    * @description  Tests the "getValues" method of the sfpegFieldsetSelector_CTL class,
    *               which should always include the default N/A value.
    * @see sfpegFieldsetSelector_CTL
    ***/
    static TestMethod void testGetValues() {
        System.debug('testGetValues: START'); 
        Test.startTest();

        VisualEditor.DesignTimePageContext  testContext = new VisualEditor.DesignTimePageContext();
        testContext.entityName =  'Account';
        System.debug('testGetValues: testContext init'); 

        sfpegFieldsetSelector_CTL controller = new sfpegFieldsetSelector_CTL(testContext);
        System.debug('testGetValues: controller init'); 
    
        VisualEditor.DynamicPickListRows listVal = controller.getValues();
        System.debug('testGetValues: getValues called ' + listVal); 

        System.assert(listVal.size() > 0);

        Test.stopTest();
        System.debug('testGetValues: END');
    }

    /***
    * @description  Tests the "getFieldSetDesc" method of the sfpegFieldSetDescription_CTL class,
    *               including all error cases.
    * @see  sfpegFieldSetDescription_CTL
    ***/
    
    static TestMethod void testGetFieldSetDesc() {
        System.debug('testGetFieldSetDesc: START'); 
        Test.startTest();

        try {
            sfpegFieldSetDescription_CTL.getFieldSetDesc('SFPEG_DUMMY_FIELDSET');
            System.debug(LoggingLevel.Error,'testGetFieldSetDesc: no exception raised for invalid fieldset name');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetFieldSetDesc: proper exception raised for invalid fieldset name ' + e.getMessage());
            System.assert(true);
        }

        try {
            sfpegFieldSetDescription_CTL.getFieldSetDesc('SFPEG_DUMMY_OBJECT.SFPEG_DUMMY_FIELDSET');
            System.debug(LoggingLevel.Error,'testGetFieldSetDesc: no exception raised for invalid fieldset name');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetFieldSetDesc: proper exception raised for invalid fieldset name ' + e.getMessage());
            System.assert(true);
        }

        try {
            sfpegFieldSetDescription_CTL.getFieldSetDesc('Account.SFPEG_DUMMY_FIELDSET');
            System.debug(LoggingLevel.Error,'testGetFieldSetDesc: no exception raised for unknown fieldset name');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetFieldSetDesc: proper exception raised for invalid fieldset name ' + e.getMessage());
            System.assert(true);
        }

        try {
            Map<String,Object> fsDesc = sfpegFieldSetDescription_CTL.getFieldSetDesc('Account.sfpegTestMisc');
            System.debug('testGetConfiguration: configuration for test fieldset found ' + fsDesc);
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetConfiguration: configuration for test fieldset not found ' + e.getMessage());
            System.assert(false);
        }

        Test.stopTest();
        System.debug('testGetConfiguration: END');    
    }
}