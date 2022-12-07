# ![Logo](/media/Logo.png) &nbsp; **sfpegValueSelectorCmp** Component

## Introduction

The **sfpegValueSelectorCmp** component lets the user easily modify a picklist field value in one single click on the Lightning UI. This field may come from the current page record or from the current User record. Data and updates are executed via the Lightning Data Service and therefore updates are propagated instantaneously to the page(s).

Such a feature enables to easily modify the conditional display conditions on the Lightning page and update its content accordingly. All possible picklist values are displayed in the order configured on the field (possibly filtered based on the record type), the current value being highlighted.

E.g. for a junction object, you may have a picklist field with multiple values proposing to display details of one related record, details of another related record, a global summary of the two record... This reduces the number/complexity of tabs
in the page and streamlines the user experience.


## Display Modes 

Multiple display modes are available but the principles remain the same.
* `buttons`: picklist values are displayed as a button group

![Value Selector in Buttons mode](/media/sfpegValueSelectorButtons.png)

* `path`: picklist values are displayed as a path.

![Value Selector in Path mode](/media/sfpegValueSelectorPath.png)

* `progress`: picklist values are displayed as a progress bar.

![Value Selector in Progress Bar mode](/media/sfpegValueSelectorProgress.png)

* `tabs`: picklist values are displayed as horizontal tabs.

![Value Selector in Tabs mode](/media/sfpegValueSelectorTabs.png)

* `tabsV`: picklist values are displayed as vertical tabs.

![Value Selector in vertical Tabs mode](/media/sfpegValueSelectorTabsV.png)

* `picklist`: picklist values are in a picklist dropdown menu (the active state being displayed in the menu label).

![Value Selector in Picklist mode](/media/sfpegValueSelectorPicklist.png)

* `radio`: picklist values are in a radio button set.

![Value Selector in Radio Button mode](/media/sfpegValueSelectorRadio.png)

Depending on the case, it may be better to locate the picklist value on the current record (same value for all users) or
on the User (same value for all records of the same object).


## Configuration

All the configuration of the **sfpegValueSelectorCmp** component is done in the App Builder.

![Value Selector configuration](/media/sfpegValueSelectorConfig.png)

The following properties are available:
* `Title` to set a text title to the component 
* `Display Mode` to set the display mode of the component, see possible options above  
* `Wrapping CSS Class` to set the style of the component container, e.g. to act on its border, padding, background color... leveraging standard SLDS classes available.
* `Current Record Field` to select the picklist field on the current page object to be used in the component (optional, User field being used if not set).
* `Current User Field` to select the picklist field on the User object to be used in the component (optional, used if Record field not set).
* `Debug?` to activate debug logs in the browser console and present some confighurayion details below the component.


## Technical Details

The  **sfpegValueSelectorCmp** relies on the following Apex classes:
* **sfpegPicklistRecordSelector_CTL** to fetch the picklist fields available on the current page object during App Builder configuration
* **sfpegPicklistUserSelector_CTL** to fetch the picklist fields available on the User object during App Builder configuration

It relies on a hidden standard **[lightning-record-edit-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-edit-form/documentation)** to fetch and update picklist values.

When validation rules prevent a picklist value change, the error is reverted and an error message displayed.

![Value Selector Update Error](/media/sfpegValueSelectorError.png)

