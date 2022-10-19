---
# **sfpegRelatedListKpisCmp** Component
---

## Introduction

The **sfpegRelatedListKpisCmp** component enables to display record counts for up to 6 related lists
of the current record of a Lightning page in a graphical way. It provides three size variants
(shown in the snapshot below) to cope with screen size constraints and wrapping CSS may also be customised
(e.g. to alter margins or background color).

![Related List KPIs](/media/sfpegRelatedListKpis.png)

For each related list selected, it fetches the icon and color of the related object type and displays
the count value within a circle (coloured only if the count is greater than 0). A title may be set above
and a second KPI displayed below in a badge (this KPI corresponding to a sum of a number/currency field).

KPIs are rounded by default to respect the widget size constraints and circular layout, but the precise
value is available upon hovering in a title popup.
KPI icons are clickable and redirect the user to the corresponding related list page.

As an option, it may display a ***refresh*** button to force a recount.


## Configuration

All the configuration of the **sfpegRelatedListKpisCmp** component is done in the App Builder.

![Related List KPIs configuration](/media/sfpegRelatedListKpisConfig.png)

The following properties are available:
* `Wrapping CSS Class` to set the style of the component container, e.g. to act on its border, padding, background color... leveraging standard SLDS classes available.
* `Display Size` to set the size of the displayed KPI widgets (small, medium, large).
* KPI fields (up to 6 configurable):
    * `Label #xxx` to set the (optional) label associated to the KPI (free text, supporting custom labels)
    * `Related List #xxx` to select the underlying related list for which the KPI should be displayed (as a picklist of all related lists available on the object)
    * `Sum Field #xxx` to define a field which should be summarized in the badge below the main count, as a JSON string providing the field API `mame` and its `format` (_currency_, _number_ or default _integer_), e.g. `{"name":"Number__c","format":"number"}`
* `Show Refresh?` to display a ***refresh*** button next to the KPI widgets.
* `Inverse Text?` to display labels in inverse mode (for dark backgrounds).
* `Debug?` to activate debug logs in the browser console and present some configuration details below the component.

### Permissions

You may need to grant your users access to the `sfpegRelatedListKpis_CTL` Apex class,
e.g. via a dedicated PermissionSet (not included in the Package).

## Technical Details

The  **sfpegRelatedListKpisCmp** relies on the following Apex classes:
* **sfpegRelatedListSelector_CTL** to fetch related lists available during App Builder configuration
* **sfpegRelatedListKpis_CTL** to fetch the counts (and sums) for all configured related lists upon component initialisation / refresh.

_Notes_:
* Colors and icons are automatically computed out of the related object by the **sfpegRelatedListSelector_CTL** class:
    * some standard objects do not have an actual dedicated icon and some mapping may occur to associate them a correct value (e.g. ***AttachedContentDocument*** is replaced by ***File***, ***AttachedContentNote*** by ***Note***...)
    * for the custom objects, an analysis of the `Schema.describeTabs()` information is done to retrieve the icon associated to the object. A tab must therefore be defined for the custom object and it must be displayed in at least one application for the logic to operate properly.
* Component background may be easily altered by leveraging the standard [SLDS theme classes](https://www.lightningdesignsystem.com/utilities/themes/)
    * ***slds-theme_default*** set by default in the configuration
    * the second example leverages the ***slds-theme_shade*** value
    * the first example leverages the ***slds-popover_feature*** class which injects a standard background image.
 
