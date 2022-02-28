---
# SFPEG MISC Components
---


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

This package provides a set of App/Community Builder components:

* **[sfpegRelatedListKpisCmp](/help/sfpegRelatedListKpisCmp.md)** enables to display a set
of related list record counts (and sums) in a graphical way.

![Related List KPIs](/media/sfpegRelatedListKpis.png)

* **[sfpegValueSelectorCmp](/help/sfpegValueSelectorCmp.md)** enables to display and modify
(single click) easily a picklist field on the current record/user (very useful when leveraging
conditional rendering in Lightning page).

![Value Selector in Buttons mode](/media/sfpegValueSelectorButtons.png)

* **[sfpegFileManagerCmp](/help/sfpegFileManagerCmp.md)** enables to upload and display a file
related to the current record (the file ID being stored on a record field), possibly with 
an additional text description and multi-value field value (as badges).

![File Manager](/media/sfpegFileManager.png) 


Detailed information about these components (behaviour, configuration guidelines,
technical implementation principles) is available in their dedicated pages.


## Technical Details

Each App Builder component is independent may be deployed on a standalone basis, as soon as each
dependencies are deployed as well (usually a few Apex classes).