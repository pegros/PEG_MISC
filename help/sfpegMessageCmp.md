# ![Logo](/media/Logo.png) &nbsp; **sfpegMessageCmp** Component

## Introduction

The **sfpegMessageCmp** component enables to display a simple message in various variants.
Leveraging conditional display in Lightning, it easily enables to inform the user about certain
issues or important situations in a structured way.

![Message](/media/sfpegMessage.png) 

Message `Message Title`and `Message Content` properties support custom labels, whereas 
`Message Field` enables to display information contained in a field of the page record
(e.g. leveraging a formula field to build a textual message).
 

## Configuration

Configuration is quite easy and entirely done in the App Builder.

![Message Config](/media/sfpegMessageConfig.png) 


## Technical Details

### Experience Cloud and Flow Support

This component works both in standard Lightning Apps, Flows and Experience Cloud sites. There are
however a few specifities when using them in Flows and Experience Cloud site pages.

The main issue is related to the standard `sObjectName` and `recordId` variables automatically
set by the Lightning framework when in standard Lightning applications but not in thes cases.

Therefore, in order to use `Message Field` property, the `Object Name` and `Record ID` properties
need to be explicitly set in the configuration.

In order to get dynamic values from an **Experience Cloud** page context, standard `{!objectApiName}`
and `{!recordId}` values may be used. 