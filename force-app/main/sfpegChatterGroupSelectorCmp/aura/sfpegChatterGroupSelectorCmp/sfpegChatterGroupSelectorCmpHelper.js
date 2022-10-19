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
    DEBUG: false,
    fetchGroups: function(component,helper){
        if (helper.DEBUG) console.log('fetchGroups: START');

        let groups = component.get("v.groups");
        if (helper.DEBUG) console.log('fetchGroups: groups fetched ',groups);
        let sObjectName = component.get("v.sObjectName");
        if (helper.DEBUG) console.log('fetchGroups: sObjectName fetched ',sObjectName);
        let recordId = component.get("v.recordId");
        if (helper.DEBUG) console.log('fetchGroups: recordId fetched ',recordId);

        if (!groups) {
            console.warn('fetchGroups: END KO missing groups');
            return;
        }

        var fetchAction = component.get("c.getGroupIds");
        fetchAction.setParams({
            groupNames: groups,
            objectApiName: sObjectName,
            recordId: recordId
        });
        fetchAction.setCallback(this, function(response){
            if (helper.DEBUG) console.log('fetchGroups: response received ',response);

            var state = response.getState();
            if (state === "SUCCESS") {
                if (helper.DEBUG) console.log('fetchGroups: data returned ',response.getReturnValue());
                component.set("v.groupList", response.getReturnValue());
                component.set("v.selectGroup", response.getReturnValue()[0]);
                component.set("v.message","Init done");

                //helper.displayGroup(component,helper);
                if (helper.DEBUG) console.log('fetchGroups: END OK ');
            }
            else {
                console.warn('fetchGroups: END KO issue received ',response);
                component.set("v.message","Init failed: " + response);
            }
        });
    	$A.enqueueAction(fetchAction);
        component.set("v.message","Initializing");
        if (helper.DEBUG) console.log('fetchGroups: request sent');
    },
    selectGroup: function(component,event,helper) {
        if (helper.DEBUG) console.log("selectGroup: START with ", event);
    
        let selectGroup = event.getParam("value");
        if (helper.DEBUG) console.log("selectGroup: selecting new Group", selectGroup);
        component.set("v.selectGroup",selectGroup);

        helper.displayGroup(component,helper);
        if (helper.DEBUG) console.log("selectGroup: END");
    },
    displayGroup: function(component,helper) {
        if (helper.DEBUG) console.log('displayGroup: START');
        component.set("v.message","Loading Group");

        /*let feedDiv = component.find("feedDiv");
        if (helper.DEBUG) console.log('displayGroup: feedDiv fetched ',feedDiv);

        let feedCmp = component.find("chatterFeed");
        if (helper.DEBUG) console.log('displayGroup: feedCmp fetched ',feedCmp);
        
        if (feedCmp) {
            let selectGroup = component.get("v.selectGroup");
            if (helper.DEBUG) console.log('displayGroup: selectGroup fetched ',selectGroup);
            if (selectGroup) {
                if (helper.DEBUG) console.log('displayGroup: setting subjectId to ',selectGroup.Id);
                feedCmp.set("v.subjectId", selectGroup.Id);
            }
            else {
                if (helper.DEBUG) console.log('displayGroup: no selection available ');
            }
        }
        else {
            if (helper.DEBUG) console.log('displayGroup: no feedCmp available ');
        }*/

        let selectGroup = component.get("v.selectGroup");
        console.log('displayGroup: selectGroup fetched ', JSON.stringify(selectGroup));
        $A.createComponent(
            "forceChatter:feed",
            {
                type: "Record",
                feedDesign: "BROWSE",
                subjectId: selectGroup.Id
            },
            function(feed, status, errorMessage) {
                let feedDiv = component.find("feedDiv");
                if (!feedDiv) {
                    component.set("v.message","No Chatter feed to display");
                    console.warn("displayGroup: no feed Div found");
                }
                else {
                    component.set("v.message","Displaying Chatter Group " + selectGroup.Name);
                    if (status === "SUCCESS") { 
                        console.log("displayGroup: adding feed in div");
                        feedDiv.set("v.body",feed);
                        console.log("displayGroup: feed added in div");
                        component.set("v.message","Group Displayed");
                    }
                    else {
                        console.warn("displayGroup: feed creation failed ",errorMessage);
                        feedDiv.set("v.body",null);
                        component.set("v.message",errorMessage);
                    }
                }
                console.log('displayGroup: END (feedPublisher)');
            }
        );

        let showPublisher = component.get("v.showPublisher");
        if (showPublisher) {
            console.log("displayGroup: updating publisher");
            $A.createComponent(
                "forceChatter:publisher",
                {
                    context: "RECORD",
                    recordId: selectGroup.Id
                },
                function(publisher, status, errorMessage){
                    let publisherDiv = component.find("publisherDiv");
                    if (!publisherDiv) {
                        component.set("v.message","No Publisher to display");
                        console.warn("displayGroup: no publisher Div found");
                    }
                    else {
                        if (status === "SUCCESS") { 
                            console.log("updateFeed: adding publisher in div");
                            publisherDiv.set("v.body",publisher);
                            console.log("updateFeed: publisher added in div");
                        }
                        else {
                            console.warn("updateFeed: publisher creation failed ",errorMessage);
                            component.set("v.message",errorMessage);
                            publisherDiv.set("v.body",null);
                        }
                    }
                    console.log('displayGroup: END (feedPublisher)');
                }
            ); 
            console.log("displayGroup: updating publisher");

        }
        else {
            console.log("updateFeed: no publisher to add");
        }

        if (helper.DEBUG) console.log("displayGroup: creation launched");
    },
    navigateToGroup : function(component,helper) {
        if (helper.DEBUG) console.log('navigateToGroup: START');

        let selectGroup = component.get("v.selectGroup");
        if (selectGroup) {
            if (helper.DEBUG) console.log('navigateToGroup: selectGroup fetched',selectGroup);
            let navEvt = $A.get("e.force:navigateToSObject");
            navEvt.setParams({"recordId": selectGroup.Id});
            navEvt.fire();
            if (helper.DEBUG) console.log('navigateToGroup: END --> navigation triggered');
        }
        else{
            console.warn('navigateToGroup: END --> no navigation triggered');
        }
    }
})
