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


## Package Documentation

This readme document provides an overview of the different elements available in the package as well as some
general configuration guidelines and technical implementation principles.

### **sfpegRelatedListKpisCmp** Component

#### Introduction

The **sfpegRelatedListKpisCmp** component enables to display record counts for up to 6 related lists
of the current record of a Lightning page in a graphical way. It provides three size variants to 
cope with screen size constraints and background CSS may also be customised.

![Related List KPIs](/media/sfpegRelatedListKpis.png)

For each related list selected, it fetches the icon and color of the related object type and displays
the count value within a circle (coloured only if the count is greater than 0). A title may be set above
and a second KPI displayed below in a badge (this KPI corresponding to a sum of a number/currency field).

KPIs are rounded by default to respect the widget size constraints and circular layout, but the precise
value is available upon hovering in a title popup.
KPI icons are clickable and redirect the user to the corresponding related list page.

As an option, it may display a _refresh_ button to force a recount.

#### Configuration

All the configuration of the **sfpegRelatedListKpisCmp** component is done in the App Builder.

![Related List KPIs configuration](/media/sfpegRelatedListKpisConfig.png)

The following properties are available:
* `Wrapping CSS Class` to set the style of the component container, e.g. to act on its border, padding, background color... leveraging standard SLDS classes available.
* `Display Size` to set the size of the displayed KPI widgets (small, medium, large).
* KPI fields (up to 6 configurable):
    * `Label #xxx` to set the (optional) label associated to the KPI (free text, supporting custom labels)
    * `Related List #xxx` to select the underlying related list for which the KPI should be displayed (as a picklist of all related lists available on the object)
    * `Sum Field #xxx` to define a field which should be summarized in the badge below the main count, as a JSON string providing the field API `mame` and its `format` (_currency_, _number_ or default _integer_), e.g. `{"name":"Number__c","format":"number"}`
* `Show Refresh?` to display a _refresh_ button next to the KPI widgets.
* `Inverse Text?` to display labels in inverse mode (for dark backgrounds).
* `Debug?` to activate debug logs in the browser console and present some confighurayion details below the component.


#### Technical Details

The  **sfpegRelatedListKpisCmp** relies on the following Apex classes:
* **sfpegRelatedListSelector_CTL** to fetch related lists available during App Builder configuration
* **sfpegRelatedListKpis_CTL** to fetch the counts for all configured related lists upon component initialisation / refresh.

_Notes_:
* Colors and icons are automatically computed out of the related object by the **sfpegRelatedListSelector_CTL** class:
    * some standard objects do not have an actual dedicated icon and some mapping may occur to associate them a correct value (e.g. _AttachedContentDocument_ is replaced by _File_, _AttachedContentNote_ by _Note_...)
    * for the custom objects, an analysis of the `Schema.describeTabs()` information is done to retrieve the icon associated to the object. A tab must therefore be defined for the custom object and it must be displayed in at least one application for the logic to operate properly.
* Component background may be easily altered by leveraging the standard [SLDS theme classes](https://www.lightningdesignsystem.com/utilities/themes/)
    * *slds-theme_default* set by default in the configuration
    * the second example leverages the *slds-theme_shade* value
    * the first example leverages the *slds-popover_feature* class which injects a standard background image.


### **sfpegValueSelectorCmp** Component

#### Introduction

The **sfpegValueSelectorCmp** component lets the user easily modify a picklist field value in one single click on the Lightning UI. This field may come from the current page record or from the current User record. Data and updates are executed via the Lightning Data Service and therefore updates are propagated instantaneously to the page(s).

Such a feature enables to easily modify the conditional display conditions on the Lightning page and update its content accordingly. All possible picklist values are displayed in the order configured on the field (possibly filtered based on the record type), the current value being highlighted.

E.g. for a junction object, you may have a picklist field with multiple values proposing to display details of one related record, details of another related record, a global summary of the record... This reduces the number/complexity of tabs in the page and streamlines the user experience.

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


#### Configuration

All the configuration of the **sfpegValueSelectorCmp** component is done in the App Builder.

![Value Selector configuration](/media/sfpegValueSelectorConfig.png)

The following properties are available:
* `Title` to set a text title to the component 
* `Display Mode` to set the display mode of the component, see possible options above  
* `Wrapping CSS Class` to set the style of the component container, e.g. to act on its border, padding, background color... leveraging standard SLDS classes available.
* `Current Record Field` to select the picklist field on the current page object to be used in the component (optional, User field being used if not set).
* `Current User Field` to select the picklist field on the User object to be used in the component (optional, used if Record field not set).
* `Debug?` to activate debug logs in the browser console and present some confighurayion details below the component.


#### Technical Details

The  **sfpegValueSelectorCmp** relies on the following Apex classes:
* **sfpegPicklistRecordSelector_CTL** to fetch the picklist fields available on the current page object during App Builder configuration
* **sfpegPicklistUserSelector_CTL** to fetch the picklist fields available on the User object during App Builder configuration

It relies on a hidden standard **[lightning-record-edit-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-edit-form/documentation)** to fetch and update picklist values.

When validation rules prevent a picklist value change, the error is reverted and an error message displayed.

![Value Selector Update Error](/media/sfpegValueSelectorError.png)

