---
# **sfpegFileManagerCmp** Component
---

## Introduction

The **sfpegFileManagerCmp** component basically enables to display an image or pdf file attached
to the current record, with some additional information below:
* a textual description to provide additional information
* a set of badges to highlight a few important items.

![File Manager in standard display mode](/media/sfpegFileManager.png)

It provides two display modes (vertical or horizontal) and multiple size variants (actually limiting 
the height of the displayed image).

The containing card title and Icon may be customised, as well as the CSS for the wrapping div (e.g.
to alter margins or background color).

When no file is available, it is possible to upload a new file directly from the same component, this
option being configurable.
![File Manager in Add mode](/media/sfpegFileManagerAdd.png)

The displayed file (ContentDocument) ID is assumed to be stored on a text field of the current 
record. When relying on the component to execute the upload, the file is automatically linked
to the current record and its ContentDocument ID registered on the current record (its
download URL being also possibly stored on another field).


## Configuration

All the configuration of the **sfpegRelatedListKpisCmp** component is done in the App Builder.

![Related List KPIs configuration](/media/sfpegFileManagerConfig.png)

Lookup relations may be used when providing the API names of the fields configurable in the
component, e.g. `Parent.CampaignImageId` to display the file registered on a parent Campaign.


## Technical Details

The  **sfpegRelatedListKpisCmp** has no Apex class dependency and entirely relies on
* the **[Lightning Data Service](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/data_ui_api)** to fech/set field values for the current record.
* the standard **[lightning-file-upload](https://developer.salesforce.com/docs/component-library/bundle/lightning-file-upload/documentation)** base component to upload the files.
