# ![Logo](/media/Logo.png) &nbsp; **sfpegMediaPlayCmp** Component

## Introduction

The **sfpegMediaPlayCmp** component basically enables to display in a record page a media file (ContentDocument
of video, audio or image type) referenced on the current record, with a few additional optional features:
* a helptext to explain what the purpose of the referenced file is
* a refresh button to easily refresh the media display to take into account a new version just loaded
* a description area above the media, presenting (if any) the content of the description field of the file.

![Media Player in audio display mode](/media/sfpegMediaPlayer.png)

The containing card Title and Icon may be customised, as well as the CSS for the wrapping div (e.g.
to include a bounding box as in the example) and a standard padding activation option for the card content.

When no file is available, the componentr only displays the Card Header.

The displayed file (ContentDocument) ID is assumed to be stored on a text field of the current 
record (or a directly related record).


## Configuration

All the configuration of the **sfpegMediaPlayCmp** component is done in the App Builder.

![Media Player configuration](/media/sfpegMediaPlayerConfig.png)

Lookup relations may be used when providing the API names of the fields configurable in the
component, e.g. `Parent.CampaignVideoId` to display the file registered on a parent Campaign.

## Technical Details

The  **sfpegMediaPlayCmp** has no Apex class dependency and entirely relies on
* the **[Lightning Data Service](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/data_ui_api)** to fech/set field values for the current record and the media file (ContentDocument object).
* the standard **video** and **audio** HTML tags to play the video and audio files.
* some custom labels (prefixed as **sfpegMediaPlay**) for error messages or button title.
