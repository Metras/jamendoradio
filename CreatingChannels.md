# Introduction #

The channel designer can be somewhat intimidating. Please read the following steps to create your own customized channel.


# Steps #

1. Select a name for your station and enter it in _Name_

2. Select what this channel will use to find songs. This may be one or several tags, tracks, albums etc. Decide using the _Base_ drop down menu.

3. If applicable, select a "sort order" for your channel, and enter this in _Tendency_.
(This works when there is a large selection of songs. If you have "Tags" or "Everything" as base, a channel randomly chooses songs from the first 500 songs, sorted according to your selected tendency.)

4. Fill in the criteria. What you enter here depends on what you picked as _Base_
  * **Tags:** One free text tag on each line
  * **Artists:** One artist id on each line
  * **Albums:** One album id on each line
  * **Playlists:** One playlist id on each line
  * **Jamradio:** The id of the jamendo radio id (see special note)
  * **User starred albums:** The id of the user.

5. Press the button "Add channel", which will construct the configuration string for you, and take you to the "Channels" page. Press "Save" here, to finalize your new channel.

**Note:** To find the id, visit the Jamendo page for the particular artist/album/playlist and enter the last part of the URL.
I.E: for a playlist like http://www.jamendo.com/en/playlist/212258 the id would be 212258, or for an artist like http://www.jamendo.com/en/artist/Tunguska_Chillout_Grooves_vol.1, the id would be "Tunguska\_Chillout\_Grooves\_vol.1"

**Special note:** It seems it is impossible to create custom radios on Jamendo now, so don't pick this option...
If you are still adamant, it is the numerical id of the station, which you will have to find in the source. Feel free to experiment, but I do not recommend using this option!

**Additional note:** If you select to integrate this extension with Jamendo.com, you can add albums to album-based channels, or artists to artist-based channels from the context menu (right click) when viewing the respective page in the browser.