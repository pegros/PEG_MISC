/***
* @description Test class for the sfpegChatterGroup_CTL class.
* @author      P-E GROS
* @date        Oct 2022
* @see         sfpegChatterGroup_CTL
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
public class  sfpegChatterGroup_TST {
    
    /***
    * @description Initializes the test context.
    ***/
    @testSetup
    static void testSetup() {
        System.debug('testSetup: START');

        List<CollaborationGroup> groups = new  List<CollaborationGroup>();
        groups.add(new CollaborationGroup(Name = 'Group 1', CollaborationType='Public'));
        groups.add(new CollaborationGroup(Name = 'Group 2', CollaborationType='Public'));
        System.debug('testSetup: inserting Groups ' + groups);
        insert groups;

        System.debug('testSetup: END');
    }

    /***
    * @description  Tests the "getGroupIds" method of the sfpegChatterGroup_CTL class,
    *               both in standard and KO cases.
    * @see sfpegChatterGroup_CTL
    ***/
    static TestMethod void testGetGroupIds() {
        System.debug('testGetGroupIds: START'); 
        Test.startTest();

        // Input Error Cases
        try {
            sfpegChatterGroup_CTL.getGroupIds('','','');
            System.debug(LoggingLevel.ERROR,'testGetGroupIds: no exception raised for missing inputs');
            System.assert(false);

        }
        catch (Exception e) {
            System.debug('testGetGroupIds: exception properly raised for missing inputs ' + e.getMessage());
            System.assert(true);
        }

        try {
            sfpegChatterGroup_CTL.getGroupIds('DUMMY','','');
            System.debug(LoggingLevel.ERROR,'testGetGroupIds: no exception raised for bad inputs');
            System.assert(false);

        }
        catch (Exception e) {
            System.debug('testGetGroupIds: exception properly raised for bad inputs ' + e.getMessage());
            System.assert(true);
        }

        // OK Cases
        try {
            List<CollaborationGroup> groups = sfpegChatterGroup_CTL.getGroupIds('["Group 2","Group 1"]','','');
            System.debug('testGetGroupIds: base list of groups properly processed ' + groups);
            System.assert(true);

        }
        catch (Exception e) {
            System.debug(LoggingLevel.ERROR,'testGetGroupIds: exception raised for base list of groups ' + e.getMessage());
            System.assert(false);
        }

        try {
            sfpegChatterGroup_CTL.getGroupIds('["Group 1","{{{USR.Name}}}","{{{RCD.Name}}}"]','User',UserInfo.getUserId());
            System.debug('testGetGroupIds: contextualised list of groups properly processed');
            System.assert(true);

        }
        catch (Exception e) {
            System.debug(LoggingLevel.ERROR,'testGetGroupIds: exception raised for contextualised list of groups ' + e.getMessage());
            System.assert(false);
        }

        Test.stopTest();
        System.debug('testGetValuesUser: END');
    }
}
