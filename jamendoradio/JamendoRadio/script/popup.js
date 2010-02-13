var storage = false;

function loadSkin() {
	if(!storage.Skin) { storage.setSkin('default'); }
	$("head").append(sformat('<link rel="stylesheet" href="styles/{0}/skin.css" type="text/css" />', storage.Skin));
	getState().getCurrent(setPlayerInfo);
}
function setPlayerInfo(data, albumImageLoaded) {
	if(!albumImageLoaded) $(".albumimage").hide();
	else $(".albumimage").css("background", "url(" + data.AlbumImageUrl + ")").fadeIn("slow");

	if(data.Track != $(".title").html()) {
		$(".title").stop(true).css("margin-left", "0").html(data.Track);
		$(".album").stop(true).css("margin-left", "0").html(data.Album);
		$(".artist").stop(true).css("margin-left", "0").html(data.Artist);
	}
	
	if(data.Ready()) {
		$(".album").click(function() { chrome.tabs.create({ "url": data.AlbumUrl }); });
		$(".artist").click(function() { chrome.tabs.create({ "url": data.ArtistUrl }); });
		
		animate(".title", 160); animate(".album", 185); animate(".artist", 185);
		if($(".controls").css("display") == "none") $(".controls").fadeIn("slow");
		else $(".play").toggleClass("pause", getState()._current.Playing());
	} else {
		$(".album").click(function() { chrome.tabs.create({ "url": data.AlbumUrl }); });
		$(".artist").click(function() { chrome.tabs.create({ "url": data.ArtistUrl }); });

		$(".controls").hide();
	}
}

function loadStations() {
	for (i = 0; i < storage.Stations.length; i++) {
		AppendStation(storage.Stations[i].Name, storage.Stations[i].Subset);
	}
}
function AppendStation(name, config) {
	var newHtml = "<a href='javascript:getState().LoadStation(\"{0}\");'>{1}</a>";
	$(".stations").append(sformat(newHtml, config, name));
}
function getState() {
		return chrome.extension.getBackgroundPage();
}
function animate(elementName, widthLimit) {
if($(elementName).width() > widthLimit) {
	var distance = $(elementName).width() - widthLimit;
		$(elementName)
			.animate( { opacity: 1.0 }, 1500)
			.animate( { marginLeft : distance * -1 }, 2000, "swing")
			.animate( { opacity: 1.0 }, 700)
			.animate( { marginLeft : 0 }, 2000, "swing", function() { animate(elementName, widthLimit); });
	}
}