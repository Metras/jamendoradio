# Introduction #

Skins are created as subfolders of the folder styles.
In the folder, you need a skin.css file as well as a lot of small image files.

The default skin has the following files in its subdirectory:
```
skin.css
background.png
next-active.png
next.png
pause-active.png
pause-hover.png
pause.png
play-active.png
play-hover.png
play.png
stop-active.png
stop.png
volume-active.png
volume.png
```

The image files are completely arbitrary, the only file that may not be named any other way is the skin.css.

There is no HTML to edit, it is static and defined in the popup.html file. What you are allowed to do, is change the images and positions of the already declared elements using CSS.

The HTML structure of the popup consists of the following elements (**css class names** in **bold**):
  * **player** - The background div, containing all the elements of the popup except for the channel browser.
  * **albumloading** - The image that is displayed to indicate background activity. You can provide your own image, or point it to "../ajax-loader.gif".
  * **albumimage** - The container that will display the album image or the splash screen.
  * **info** - container for the title, album name and artist name, use this for rough positioning.
  * **title, album, artist** - These contains info about the song that is currently played. If the text is too long, it will scroll in this container. You can add extra space to the end of the container by specifying the padding-right, thus allowing finer control of how the text scrolls.
  * **play, pause, next, stop** - The play element will have their css class updated to reflect the current playback status (play or pause). And all of these elements will be invisible when no radio is loaded.
  * **ui-slider, ui-slider-handle** - This controls the volume slider.


### Testing your own skin ###
For now, to test your own skin you either need to use the source code and add the files there, or use some (experimental?) extension to change the CSS of the official Jamendo Radio extension.

### Intentions ###
It would be possible to create an entire skins designer, but perhaps that is overkill.

It would be interesting to see if it would be possible to somehow use the local storage/database, to allow the user to upload custom skins..