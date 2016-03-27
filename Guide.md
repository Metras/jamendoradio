# Usage #

The popup lists the currently configured channels. To start, simply click the name.
When the radio is playing, the popup will display the playback controls Play/Pause, Stop, Next and a volume control.

You can also allow the extension to integrate with www.jamendo.com, and make all play-buttons on that website start the music within this extension.

# Configuration #

To add more channels, use the options page..

The configuration string, in the channels section is formatted in the following way:

`[+<joins>]/?order=<tendency>[&<additional parameters[&]>]`

The joins are used when fetching songs using sources not immediately associated with the actual track. Jamendo Radio reserves the following joins:
  * track\_album
  * album\_artist

Information about additional parameters can be found in the [Jamendo API documentation](http://developer.jamendo.com/en/wiki/Musiclist2Api).

# Channel designer #
New since v1.5 is the channel designer. It should help in the designing of channels. It contains rudimentary error checking, so it is harder to make mistakes. Also, it has all criteria keys, and all order values contained in drop downs.

When entering values for the criteria, do not use any spaces, and separate each value by placing them on single rows.