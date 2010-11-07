var storage = false;
function loadSkin() {
    if (!storage.Skin) {
        storage.Skin = 'default';
    }
    $("head").append(sformat('<link rel="stylesheet" href="styles/{0}/skin.css" type="text/css" />', storage.Skin));
    getState().getCurrent(setPlayerInfo);
}
function setPlayerInfo(data, albumImageLoaded) {
    if (!data)return;
    if (!albumImageLoaded)$(".albumimage").hide();
    else $(".albumimage").css("background", "url(" + data.AlbumImageUrl + ")").fadeIn("slow");
    if (data.Track != $(".title").html()) {
        $(".title").stop(true).css("margin-left", "0").html(data.Track);
        $(".album").stop(true).css("margin-left", "0").html(data.Album);
        $(".artist").stop(true).css("margin-left", "0").html(data.Artist);
    }
    if (data.Ready()) {
        $(".album").click(function () { chrome.tabs.create( { "url" : data.AlbumUrl } ); });
        $(".artist").click(function () { chrome.tabs.create( { "url" : data.ArtistUrl } ); });
        animate(".title");
        animate(".album");
        animate(".artist");
        if ($(".controls").css("display") == "none")$(".controls").fadeIn("slow");
        else $(".play").toggleClass("pause", getState()._current.Playing());
    }
    else {
        $(".album").click(function () { chrome.tabs.create( { "url" : data.AlbumUrl } );});
        $(".artist").click(function () { chrome.tabs.create( { "url" : data.ArtistUrl } );});
        $(".controls").hide();
    }
}

function loadStations() {
    if (!storage.SkipDefault)AppendStation('Top 500', '/?order=ratingmonth_desc');
	if(storage.Stations) {
		for (i = 0; i < storage.Stations.length; i++) {
			AppendStation(storage.Stations[i].Name, storage.Stations[i].Subset);
		}
	}
}

function AppendStation(name, config) {
    var newHtml = "<a class='{2}' onclick='markActiveLink(this)' href='javascript:getState().LoadStation(\"{0}\");'>{1}</a>";
    $(".stations").append(sformat(newHtml, config, name, (config==getState()._current.config ? 'chosen' : '') ));
}

function markActiveLink(linkElement) {
	var arr=document.getElementsByClassName('chosen');
	for (var i=0; i<arr.length; i++) { arr[i].className = arr[i].className.replace(/\w*chosen\w*/, ''); }
	
	if (linkElement) linkElement.className += ' chosen';
}

function getState() {
    return chrome.extension.getBackgroundPage();
}

function animate(elementName) {
    if ($(elementName).outerWidth() > $(elementName).parent().innerWidth()) {
        var distance = $(elementName).outerWidth() - $(elementName).parent().innerWidth();
        $(elementName).animate( { opacity : 1.0 }, 1500).animate( { marginLeft : distance *  - 1 }, 2000, "swing").animate( { opacity : 1.0 }, 700).animate( { marginLeft : 0 }, 2000, "swing", function () { animate(elementName); });
    }
}