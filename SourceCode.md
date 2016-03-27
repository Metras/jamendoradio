# Introduction #

A short description of the source code files.


# Details #

Root directory:
  * manifest.json - Contains metainformation.
  * background.html - Links up the scripts needed for the background processes.
  * popup.html - The base for what is shown when the user presses the toolbar button in Chrome.
  * options.html - A page for configuration.

scripts:
  * background.js - The background processes (keeps the audio element and the playlist).
  * jamendoAPI.js - Functions for communicating with the Jamendo site.
  * JamendoRadio.js - The content script that is embedded when the user is browsing   www.jamendo.com
  * options.js - Functions needed by options.html
  * popup.js - Functions needed by popup.html
  * scrobble.js - A wrapper for the audioscrobbler API v1.2.1
  * util.js - Contains utilities, like the jQuery framework...

styles:
  * options.css - Contains style declarations for the options.html
  * popup.css - Contains the base styles for the popup.html

styles/<skin directory>
  * skin.css - Contains additional, skin-specific information for the popup.html

styels/options
  * This folder contains the custom jQueryUI style the option page uses.