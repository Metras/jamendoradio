function manipulatePage() {
    overrideLinks("txtorange");
    overrideLinks("trackstable_play");
    overrideLinks("album_simple_play");
    overrideLinks("g_playbutton");
    overrideLinks("container_artistpage_play");
    overrideLinks("album_browser_playbutton");
    overrideLinks("jambutton_playbutton_maxi");
    overrideLinks("visual_radio");
    overrideLinks("jambutton", "featured_now_block");
    createArtistRadio("info_artistapage_avatar");
}
function overrideLinks(cssClass, containerId) {
    var playButtons;
    if (!containerId)playButtons = document.body.getElementsByClassName(cssClass);
    else {
        var container = document.getElementById(containerId);
        if (container)playButtons = container.getElementsByClassName(cssClass);
        else return;
    }
    for (i = 0; i < playButtons.length; i++) {
        if(playButtons[i]) {
			playButtons[i].onclick = start;
			var subLinks = playButtons[i].getElementsByTagName("a");
			for (j = 0; j < subLinks.length; j++) {
				if (subLinks[j].onclick)subLinks[j].onclick = "";
			}
		}
    }
}
function createArtistRadio(cssClass) {
    var playButton = document.body.getElementsByClassName(cssClass)[0];
	if(playButton) {
		playButton.onclick = function () {
			chrome.extension.sendRequest( { target : "loadFromMainPage", set : 'artist', data : /artist\/([\w\.%]+)/.exec(location.href)[1] }, function (response) { } );
			return false;
		}
    }
}
function start() {
    var rxRadio =  new RegExp("radio\\/(\\d+)'");
    var rxTrack =  new RegExp("\\?id=(\\d+)");
    var rxAlbum =  new RegExp("album\\/(\\d+)'");
    var rxPlaylist =  new RegExp("playlist\\/(\\d+)'");
    var rxMisc =  new RegExp("\\?track_id=(\\d+)");
    var data;
    var set;
    if (this.innerHTML.match(rxRadio)) {
        set = 'radio';
        data = rxRadio.exec(this.innerHTML)[1];
    }
    else if (this.innerHTML.match(rxTrack)) {
        set = 'track';
        data = rxTrack.exec(this.innerHTML)[1];
    }
    else if (this.innerHTML.match(rxAlbum)) {
        set = 'album';
        data = rxAlbum.exec(this.innerHTML)[1];
    }
    else if (this.innerHTML.match(rxPlaylist)) {
        set = 'playlist';
        data = rxPlaylist.exec(this.innerHTML)[1];
    }
    else if (this.innerHTML.match(rxMisc)) {
        set = 'track';
        data = rxMisc.exec(this.innerHTML)[1];
    }
    else return;
    chrome.extension.sendRequest( { target : "loadFromMainPage", set : set, data : data }, function (response) { });
    return false;
}
var test;
chrome.extension.sendRequest( { target : "storage" }, function (response) { if (response.storage)test=response.storage;if(test && test.SiteIntegration)manipulatePage(); });
