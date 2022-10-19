---
# **sfpegChatterGroupSelectorCmp** Component
---

## Introduction

The **sfpegChatterGroupSelectorCmp** component enables to display the Feed of a Chatter Group selected
in a configurable (and contextualisable) Name list.

![Chatter Group Selector](/media/sfpegChatterGroupSelector.png) 

If only one Group is available, the selector disappears.
If multiple are available, the first in the list is selected (and displayed) by default.


## Configuration

Configuration is quite easy and entirely done in the App Builder.

![Chatter Group Selector Configuration](/media/sfpegChatterGroupSelectorConfig.png) 

The most important property is `groups` which should contain the list of Chatter Group names
to be made available in the component.

It must be defined as a JSON list of Group Name strings, e.g.
```
["Global Announcements","Help & Training","Online Support"]
```

Context **merge** tokens are available to dynamically retrieve Chatter Group Names from
fields on the current User or the current Record (when any). A simple `{{{KEY.fieldName}}}` 
syntax may be used in such a case.
```
["Online Support","{{{USR.TeamGroup__c}}}","{{{RCD.BusinessGroup__c}}}"]
```
In such a case, the **TeamGroup__c** value of the current user and the **BusinessGroup__c**
value of the page record are automatically provided to the component.

Beware that these fields should provide the `names` of the considered Chatter Groups.

Empty/null names are ignored as well as Chatter groups not found.


## Technical Details

### Aura Implementation

This component is implemented in Aura technology in order to leverage the standard
 **[forceChatter:publisher](https://developer.salesforce.com/docs/component-library/bundle/forceChatter:publisher/documentation)** and **[forceChatter:feed](https://developer.salesforce.com/docs/component-library/bundle/forceChatter:feed/documentation)** Aura base components.


### Experience Cloud Support

this component works both in standard Lightning Apps and Experience Cloud sites. There are
however a few specifities when using them in Experience Cloud site pages.

The main issue is related to the standard `sObjectName` and `recordId` variables automatically
set by the Lightning framework when in standard Lightning applications but not in Experience Cloud.
Therefore, in order to use `{{{RCD.xxxx}}}` token, the `Object Name` and `Record ID` properties
need to be explicitly set in the configuration. In order to get dynamic values from the page context,
standard `{!objectApiName}` and `{!recordId}` values may be used. 

Also, beware that Chatter Groups are related to a **network** and Chatter Groups defined in an
Experience Cloud site are not visible from a standard Lightning App (and vice versa).
