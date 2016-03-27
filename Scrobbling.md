# Introduction #

From version 1.8.0, Jamendo Radio also supports scrobbling to audioscrobbler (last.fm).

It was my intention to support scrobbling to Jamendo as well, but I get a BADSESSION error, even though the handshake is successful, when submitting...

# Details #

Jamendo radio can now scrobble to last.fm, one of the more frequent feature requests I receive.

It should be pretty straight forward. Enter your credentials in the options page, check the check-box and press save.

If everything went as it should, you should see a green status message "Connection detected". You can toggle scrobbling on or off, without destroying your saved credentials, by changing the check-box. The credentials will only be updated if saving when both the user name and password text fields are filled.

# Special note #
There is a record label, which posts many albums to Jamendo.
However, in doing so, they mark themselves as artist, and the actual artist name is combined with the track-names (and sometimes with the album name as well).

I have added custom parsing to resolve this, but I want more testing done, before I release this to the public. If you want to help me test, download the compiled extension from the trunk.

(So far, this only affects the "artist" with Jamendo id "psydom". Their current name is "# Psytrance Brazil #", and before that they were known as "Speedsound", and before that "Psydom Recordz"...)

To find the beta version:
`Top menu item "Source" -> sub-menu "Browse" -> expand "Trunk" -> expand "JamendoRadio", click the file JamendoRadio.crx. -> click "View raw file" to download`

THIS VERSION AUTO-UPDATES ONLY TO NEW BETA-VERSIONS!
(But it can be loaded in parallel with the official version since they have different ids. Just disable the version you don't need atm.)