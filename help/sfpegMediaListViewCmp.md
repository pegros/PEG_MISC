# ![Logo](/media/Logo.png) &nbsp; **sfpegMediaListViewCmp** Component

## Introduction

The **sfpegMediaListViewCmp** component basically enables to display the first records of any List View
as a list of media tiles within a standard card container. Each media tile is composed of:
* an optional icon on the left (which may be an Asset file or any ContentDocument)
* textual content on the right successively containing a title, a richtext description, an horizontal
list of field values and a set of badges
* a _See more..._ button enabling to navigate to the record.

![Media List View](/media/sfpegMediaListView.png)

Each content property comes from fields defined on the main object of the List View. Fields used
do not necessarily need to be present in the List View configuration.

Multiple **CSS** and layout properties have been made available to customise the rendering of the component 
via standard **[SLDS](https://www.lightningdesignsystem.com/)** utility classes (e.g. theme, padding, box...)

![Inverse Media List View](/media/sfpegMediaListViewInverse.png)


## Configuration

All the configuration of the **sfpegMediaListViewCmp** component is done in the App Builder.

![Media List View Configuration](/media/sfpegMediaListViewConfig.png)

The following properties are available:
* container configuration:
    * `Card Title` (optional) to set a global header title to the component
    * `Card Icon` (optional) to include also an icon (with the name of one of the available
     [SLDS Icons](https://www.lightningdesignsystem.com/icons/))
    * `Card CSS Class` (optional) to define a global wrapping style for the component (e.g. to add a wrapping border)
* tile list display configuration:
    * `List CSS Class` (optional) to define a style for the component content section (e.g. to add padding)
    * `Tile CSS Class` (optional) to define a style for each tile (e.g. to define background and border)
    * `Tile Size`to define the size of each tile as a divider of the 12 column content section
    (**12** corresponding to 1 tile per row, **6** to 2 tiles per row...)
    * `Icon Size`to define the size of each icon, out of a predefined set (from x-small to xxx-large)
    * `buttonVariant` to define the variant (_bare_ or _inverse_) of the **See more** navigation button
    within each tile (_inverse_ being useful when a dark tile background is set via  `tileClass`)
* global action configuration:
    * `Show Refresh?` to show a data refresh header button
    * `Show Open?` to show a list view open header button
* List View Configuration:
    * `Object Name` to set the API Name of the List View main Object
    * `List View Name` to provide the API Name of the List View
    * `Max. #Rows` to set a max. number of rows displayed in the component
* Tile Content Configuration:
    * `Icon Field` (optional) set with the API Name of the field providing the Icon to use, either as the 
    Name of an Asset file or the Salesforce ID of a Content Document file
    * `Title Field` (optional) set with the API Name of the field providing the tile Title content
    * `Description Field` (optional) set with the API Name of the field providing the tile Description 
    (text or richtext)
    * `Detail Fields`(optional) set with a stringified JSON list of API Names for all fields providing the tile 
    Details horizontal list content (e.g. `["Amount__c","CreationFormula__c"]`)
    * `Badge Field` (optional) set with the API Name of the field providing the content of the tile badge(s),
    a split by the **;** character being automatically executed to split teh value in different badges
    (e.g. for multi-picklist fields)
* Miscellaneous elements:
    * `Show Field Labels?` to display field labels (or online help if available) as _on hover_ titles on each 
    tile sub-component
    * `Debug?` to activate/show debug information
    * `Site Name` (only for Experience Cloud) to provide the Site Name to be included in the image download URLs


## Technical Details

The  **sfpegMediaListViewCmp** has no Apex class dependency and entirely relies on
* the **[Lightning Data Service](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/data_ui_api)** to fech values for the first records of the List View.

It relies on special Salesforce endpoints (having existed for a while but not really officially documented)
to fetch the content of each image displayed:
* `/sfc/servlet.shepherd/document/download/` for standard ContentDocument files (with Salesforce ID)
* `/file-asset/`for Asset files (with asset file name)

When used in Experience Cloud, the `Site Name` property must be set and is directly used for these download
operations.