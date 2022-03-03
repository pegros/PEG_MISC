---
# **sfpegMultiValueSelectorCmp** Component
---


## Introduction

The **sfpegMultiValueSelectorCmp** component enables to display and edit a set of picklist fields
on the current record leveraging a same set of values provided by a multi-picklist field, each
value being used max once.

A typical use case (shown in the snapshots) is to define a set of available communication channels 
on a parent campaign and leverage this set of channels to choose a primary and a secondary channel
on a sub-campaign.


## Component Behaviour

By default, the **sfpegMultiValueSelectorCmp** component is displayed in read mode, each picklist
field being initialized with its value fetched via **[Lightning Data Service](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_wire_adapters_record)**.

![Multi-Value Selector in read mode](/media/sfpegMultiValueSelector.png)

When clicking on the `edit` button, it switches to edit mode with `cancel` and `validation` buttons displayed.
The dropdowns are then automatically populated and available to set/update the picklist fields.

![Multi-Value Selector in edit mode](/media/sfpegMultiValueSelectorEdit.png)

The set of possible values is provided by the multi-picklist field configured (fetched also via
**Lightning Data Service**) and it is then progressively filtered out depending on the values
set on the picklist fields (depending on their orders). In the snapshot above, the user cannot
select `SMS` for the second picklist because it is set on the first field.

When the user updates a field, if the new value is used by a next field (i.e. on the right), this next
field is automatically reset to null. 

![Multi-Value Selector in edit mode](/media/sfpegMultiValueSelectorEdit2.png)

The dropdowns are then automatically updated.

![Multi-Value Selector in edit mode](/media/sfpegMultiValueSelectorEdit3.png)

The user may then opt to validate the change or cancel it.


## Configuration

All the configuration of the **sfpegMultiValueSelectorCmp** component is done in the App Builder.

![Multi-Value Selector configuration](/media/sfpegMultiValueSelectorConfig.png)

The configuration is quite straightforwards:
* `Title` defines the left text header
* `Multi-Value Field` sets the multi-select field (by its API Name) providing the eligible picklist values
* `Picklist Fields` sets the list of picklist fields (by their API Names) to be displayed/edited.

The `Wrapping CSS Class` property enables to adapt the style of the component container, e.g. to act on
its border, padding, background color... leveraging standard SLDS classes available.

_Note_: Lookup relations may be used when providing the API name of the multi-pîcklist field, e.g. 
`Parent.Canaux__c` to display the set of channels registered on a parent Campaign.


## Technical Details

The component relies on multiple LWC wire services:
* **[getRecord](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_wire_adapters_record)** to fetch current record's data
* **[updateRecord](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_update_record)** to update the current record
* **[getObjectInfo](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_wire_adapters_object_info)** to fetch the picklist field labels