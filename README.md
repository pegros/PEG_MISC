# ![Logo](/media/Logo.png) &nbsp; SFPEG MISC Components

## Introduction

This package contains a set of standalone LWC components adressing very specific and simple use cases.
Their configuration is very simple and is done directly from the App Builder.

These components were built as contributions/examples for former & ongoing Advisory assignments by 
[Pierre-Emmanuel Gros](https://github.com/pegros). 

They heavily rely on standard Lightning framework features such as the Lightning Data Service (LDS) 
and try to apply as much as possible the standard Design System (SLDS). 
The goal was to make them appear as much as possible as standard native Salesforce platform components 
but address some useful use cases not address by the standard components available.

Experience Cloud is supported and requires the Object API Name and the Record ID to be explicitly
set when configuring the components within Experience Cloud pages.

As much attention as possible has been paid to internationalisation requirements (at least languages),
leveraging standard mechanisms to translate labels, field names, picklist values...


## Package Content

This package provides a set of App/Community Builder components listed hereafter.
Detailed information about these components (behaviour, configuration guidelines,
technical implementation principles) is available in their dedicated pages.

### [sfpegRelatedListKpisCmp](/help/sfpegRelatedListKpisCmp.md)
This component enables to display a set of related list record counts (and sums) in a graphical way.

![Related List KPIs](/media/sfpegRelatedListKpis.png)

### [sfpegValueSelectorCmp](/help/sfpegValueSelectorCmp.md)
This component enables to display and modify (single click) easily a picklist field on the current
record/user (very useful when leveraging conditional rendering in Lightning page).

![Value Selector in Buttons mode](/media/sfpegValueSelectorButtons.png)

### [sfpegMultiValueSelectorCmp](/help/sfpegMultiValueSelectorCmp.md)
This component enables to display and edit a set of picklist fields on the current record
leveraging a same set of values provided by a multi-picklist field, each value being used max once.

![Multi-Value Selector](/media/sfpegMultiValueSelector.png)

### [sfpegFileManagerCmp](/help/sfpegFileManagerCmp.md)
This component enables to upload and display a file
related to the current record (the file ID being stored on a record field), possibly with 
an additional text description and multi-value field value (as badges).

![File Manager](/media/sfpegFileManager.png) 

### [sfpegMediaTileCmp](/help/sfpegMediaTileCmp.md)
This component enables to display a graphical summary tile
of the current record (from a fieldset and a formula field providing the download URL of 
an an image file).

![Media Tile Base Display](/media/sfpegMediaTile.png)

### [sfpegMediaPlayCmp](/help/sfpegMediaPlayCmp.md)
This component enables to display in a record page a media
file (ContentDocument of video, audio or image type) referenced on the current record.

![Media Player](/media/sfpegMediaPlayer.png) 

### [sfpegMessageCmp](/help/sfpegMessageCmp.md)
This component enables to display a simple structured message in various variants.

![Message](/media/sfpegMessage.png) 

### [sfpegChatterGroupSelectorCmp](/help/sfpegChatterGroupSelectorCmp.md)
This component enables to enables to display the Feed of a Chatter Group selected
in a configurable (and contextualisable) Name list.

![Chatter Group Selector](/media/sfpegChatterGroupSelector.png) 

## Technical Details

Each App Builder component is packaged independently and may be deployed on a standalone basis.
Each package basically contains the component (usually LWC) as well as some supporting Apex classes
and custom labels.