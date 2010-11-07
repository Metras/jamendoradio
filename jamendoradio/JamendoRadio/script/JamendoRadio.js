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
	createUserRadio("g_avatar");
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
function createUserRadio(cssClass) {
	var playButton = document.body.getElementsByClassName(cssClass)[0];
	if(playButton) {
		playButton.onclick = function () {
			chrome.extension.sendRequest( { target : "loadFromMainPage", set : 'user', data : /user\/([\w\.%]+)/.exec(location.href)[1] }, function (response) { } );
			return false;
		}	
	}
}
function start() {
	var set, data;
	
	if(this.innerHTML.match(/album_id=/)) {
		if(this.innerHTML.match(/#(\d+)/))
			chrome.extension.sendRequest( { target : "overrideStartIndex", startIndex: this.innerHTML.match(/#(\d+)/)[1] }, function (response) { });
		data = this.innerHTML.match(/album_id=(\d+)/)[1];
		set = 'album';
	} else if(this.innerHTML.match(/playlist_id=/)) {
		if(this.innerHTML.match(/#(\d+)/))
			chrome.extension.sendRequest( { target : "overrideStartIndex", startIndex: this.innerHTML.match(/#(\d+)/)[1] }, function (response) { });
		data = this.innerHTML.match(/playlist_id=(\d+)/)[1];
		set = 'playlist';
	} else if(this.innerHTML.match(/radio\\/)) {
		data = this.innerHTML.match(/id=(\d+)/)[1];
		set = 'radio';		
	} else if(this.innerHTML.match(/id=/)) {
		data = this.innerHTML.match(/id=(\d+)/)[1];
		set = 'track';
	} else return;
	
	chrome.extension.sendRequest( { target : "loadFromMainPage", set : set, data : data }, function (response) { });
	return false;
}
var test;
chrome.extension.sendRequest( { target : "storage" }, function (response) { if (response.storage)test=response.storage;if(test && test.SiteIntegration)manipulatePage(); });
