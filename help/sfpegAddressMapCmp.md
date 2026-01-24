# ![Logo](/media/Logo.png) &nbsp; **sfpegAddressMapCmp** Component

## Introduction

The **sfpegFileManagerCmp** component basically enables to display a card with a map displaying the
locations of up to 5 address fields of the current page record.

![Address Map in standard display](/media/sfpegAddressMap.png)

When no address field is provided or no value set for an address, locations are ignored.

![Address Map with no data](/media/sfpegAddressMapNoData.png)


## Configuration

All the configuration of the **sfpegAddressMapCmp** component is done in the App Builder.

![Address Map configuration](/media/sfpegAddressMapConfig.png)

The containing card title and Icon may be customised, as well as the CSS for the wrapping div (e.g.
to alter margins or background color).

Via dropdown, 5 address fields are then available for selection from the list available on the 
current page Object. It is then possible to define a different custom icon for each address
field in order to better identify them in the list.

At last it provides a wide series of boolean tuning parameters to activate / deactivate
certain standard map behaviours. Please refer to the 
[lightning-map](https://developer.salesforce.com/docs/component-library/bundle/lightning-map/documentation) base component for further details.


## Technical Details

The component relies on multiple LWC wire services:
* **[getObjectInfo](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_wire_adapters_object_info)** to fetch the labels of the compound address fields as
well as identify the individual sub-fields required to fetch address information
* **[getRecord](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_wire_adapters_record)** to fetch current record's data

It also relies on the **sfpegAddressSelector_CTL** Apex controller class as datasource
for the the list of address fields of the current object page in App Builder.

The **sfpegAddressMapNoLocation** custom label enables it to customize / translate the default message displayed when no address is available.
