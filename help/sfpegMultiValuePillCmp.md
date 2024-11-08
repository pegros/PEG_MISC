# ![Logo](/media/Logo.png) &nbsp; **sfpegMultiValuePillCmp** Component

## Introduction

The **sfpegMultiValuePillCmp** component basically enables to display a picklist or multi-picklist
field value in a more graphical and user-friendly way:
* by replacing the ';' characters in a multi value picklist by ', '

![MultiValue Display in text mode](/media/sfpegMultiValuePillText.png)

* by displaying individual values as badges

![MultiValue Display in badge mode](/media/sfpegMultiValuePillBadge.png)

* by displaying individual values as pills

![MultiValue Display in pill mode](/media/sfpegMultiValuePillPill.png)

ℹ️ Text fields containing `;`separated values are also supported in addition to standard (multi-)picklist fields.

## Configuration

All the configuration of the **sfpegMultiValuePillCmp** component is done in the App Builder.

![File Manager configuration](/media/sfpegMultiValuePillConfig.png)

The following properties are available for configuration:
* `Record Field`: (Multi-)Picklist field to be used on current record (as _Object.Field_ API names) directly available from dropdown.
* `Record Text Field`:  Text field (containing ; separated values) to be used instead of a picklist field on current record (as _Field_ API name). Used only if no picklist field is selected.
* `Display Variant`: Display variant of each value (badge, pill or text)
directly available from dropdown.
* `Show Label?`: Flag to show the field label above the value.
* `Show bottom Border ?`: Flag to display the bottom border as in standard forms.
* `Wrapping CSS Class`: CSS Classes for the wrapping div.
* `Tag CSS Class`: CSS Classes for the individual tags.
* `Debug?`: Flag to show debug information.


## Technical Details

⚠️ This component is only available for Record pages to display information about the current record. In Experience Site Builder, this information has to be explicitly provided in the `objectApiName`and `recordId` properties.

The  **sfpegMultiValuePillCmp**  relies on multiple LWC wire services:
* **[getRecord](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_wire_adapters_record)** to fetch current record's data
* **[getObjectInfo](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_wire_adapters_object_info)** to fetch the (multi-)picklist field label

It also relies on the **sfpegMultiPicklistSelector_CTL** Apex controller class as datasource for the the list of picklist and 
multi-picklist fields of the current object page in App Builder.

