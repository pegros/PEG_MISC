---
# **sfpegFileManagerCmp** Component
---

## Introduction

The **sfpegMediaTileCmp** component basically enables to display a tile for the current record consiting in:
* an image (e.g. from a related file) on the left
* a record summary (a title and list of fields) on the right

![Media Tile Base Display](/media/sfpegMediaTile.png)

Some display options are proposed, e.g. image size or ability to show/hide field labels.


## Configuration

The component relies on a fieldset to define the list of fields to display in the component.
The first field of the fieldset is considered (and displayed as) the tile title.

The rest of the configuration of the **sfpegMediaTileCmp** component is then done in the App Builder.

![Media Tile Base Display](/media/sfpegMediaTileConfig.png)

Configuration is quite straightforward, the only tricky part being the setting of the `Image Field`
which should provide a download URL for a related file or a static resource.
Typically for a **contentDocument** record (i.e. a Salesforce **File**), the field value should
contain a URL value like:
> https://_OrgRootURL_/sfc/servlet.shepherd/document/download/_ContentDocumentId_

### Permissions

You may need to grant access to your User to the `sfpegFieldSetDescription_CTL` Apex class,
e.g. via a dedicated PermissionSet (not included in the Package).

## Technical Details

The  **sfpegRelatedListKpisCmp** relies on the
**[lightning-record-view-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-view-form/documentation)** 
and 
**[lightning-output-field](https://developer.salesforce.com/docs/component-library/bundle/lightning-output-field/documentation)** 
standard components to fech and display all field values for the current record.

It relies on some custom Apex classes:
* **sfpegFieldsetSelector_CTL** to fetch the available fieldsets (for configuration) for the current page Object
* **sfpegFieldsetDescription_CTL** to fetch the content (list of fields) of the configured fieldset (for display).
