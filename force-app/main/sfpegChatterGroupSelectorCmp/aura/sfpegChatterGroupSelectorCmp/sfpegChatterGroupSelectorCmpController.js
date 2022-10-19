({
/***
* @author P-E GROS
* @date   Oct 2022
* @description  LWC Component to display the Feed of a Chatter Group selected in a configurable
*               (and contextualisable) Name list. 
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
    doInit : function(component, event, helper) {
        helper.DEBUG = helper.DEBUG || component.get("v.isDebug");
        if (helper.DEBUG) console.log('doinit: START');
        helper.fetchGroups(component,helper);
        if (helper.DEBUG) console.log('doinit: END');
    },
    selectChange : function(component, event, helper) {
        if (helper.DEBUG) console.log('selectChange: START');
        helper.selectGroup(component,event,helper);
        if (helper.DEBUG) console.log('selectChange: END');
    },
    openGroup: function(component, event, helper) {
        if (helper.DEBUG) console.log('openGroup: START');
        helper.navigateToGroup(component,helper);
        if (helper.DEBUG) console.log("openGroup: END");
    }
})
