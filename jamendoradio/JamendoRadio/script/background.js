//Streamer
var audio = new Audio();
var Volume = 1;

//Scrobblers
var scrobblers = false;

//Jamendo interface
var jamendo = false; 

//Playlist
var _playlist; 
var _currentIndex; var _repeat;
var _prefetching; var _prefetchlist;

//Storage and state
var storage = false;
var _current = false;
function getCurrent(dataUpdatedCallback) {
	_current.onChange(dataUpdatedCallback);
	return _current;
}


//Initialization
var Initialized = false;
function init() {
	audio.addEventListener("ended", function() {
		Next(true);
	}, false);
	audio.addEventListener("playing", function() {
		if(_current.Dirty) scrobblers.nowPlaying(); _current.Dirty = false;
	}, false);
    chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
        if (request.target) {
            switch (request.target) {
                case "siteIntegration": sendResponse({ GoAhead: storage.SiteIntegration }); return;
                case "loadFromMainPage": LoadFromMainpage(request); break;
				case "overrideStartIndex": overrideStartIndex = request.startIndex; break;
				case "scrobbleReady": sendResponse(scrobblers.ready()); return;
				case "scrobbleInit": scrobblers.init(); break;
				case "storage": sendResponse({storage:new Storage(localStorage)}); return;
            }
            sendResponse();
        }
        else
            sendResponse({});
    });
	
	scrobblers = {
		'audioscrobbler':new Scrobbler("http://post.audioscrobbler.com/", "jmn", "1.0"), //Scrobble to last.fm
		'jamendo':new Scrobbler("http://postaudioscrobbler.jamendo.com/", "tst", "1.0"), //Scrobble to Jamendo
		'ready':function() { return this.audioscrobbler.IsReady() || this.jamendo.IsReady() },
		'init':function() { this.audioscrobbler.Handshake(storage.ScrobbleUsername, storage.ScrobblePassword) },
		'nowPlaying':function() { if(!this.ready()) this.init(); this.aso = getScrobbleObject(_current); this.audioscrobbler.NowPlaying(this.aso); },
		'submit':function() { if(!this.aso) return; if(this.audioscrobbler.Submit(this.aso, audio.currentTime)) this.clear(); },
		'clear':function() { this.aso = false; }
	}
	storage = new Storage();
	_current = new Current();
	
	jamendo = new Jamendo();
	jamendo.onPlaylistLoaded(PlaylistDataRecieved);
	
	scrobblers.init();
	Volume = storage.Volume;
	if(!Volume) Volume = 1;
	Initialized = true;
}

//Internals
function Current() {
	this.Ready = function() { if(_playlist) return true; return false; }
	this.Loaded = function() { if(audio.src) return true; return false; }
	this.Playing = function() { return this.Loaded() && !audio.paused; }
	
	this.Dirty = false;
	
	var _onChange = false;
	this.onChange = function(callback) { _onChange = callback; if(_current.AlbumImageUrl != 'loading' && !this.Ready()) this.Unload(); else this.Update();}
	function _sendUpdate(albumImageReady) {
		try { _onChange(_current, albumImageReady) } catch(err) { }
	}
	
	var cachedAlbumUrls = ['../styles/splash.jpg'];
	this.Update = function() {
		var title = this.Track;
		if(this.TrackId) title += " - " + this.Artist;
		if(storage.Scrobble) title += sformat(" (Scrobble: {0})", scrobblers.audioscrobbler.IsReady() ? "On" : "Off");
		
		chrome.browserAction.setTitle({"title":title})
		
		if(!_onChange) return;
		
		if(this.AlbumImageUrl == 'loading') {
			_sendUpdate(false);
		} else if(cachedAlbumUrls.contains(this.AlbumImageUrl)) {
			_sendUpdate(true);
		} else {
			var albumImage = document.createElement("img"); var source = this.AlbumImageUrl;
			albumImage.onload = function () { cachedAlbumUrls[cachedAlbumUrls.length] = this.src; _current.Update();  }
			albumImage.src = this.AlbumImageUrl;
			_sendUpdate(false);
		}
	}

	
	this.SetInfo = function(track, trackId, album, albumImageUrl, albumUrl, artist, artistUrl) {
		this.Track = track;
		this.TrackId = trackId,
		this.Album = album;
		this.AlbumImageUrl = albumImageUrl;
		this.AlbumUrl = albumUrl;
		this.Artist = artist;
		this.ArtistUrl = artistUrl;
		
		this.Update();
		this.Dirty = true;
	}
	
	this.Unload = function() {
		this.Track = 'No radio loaded';
		this.TrackId = 0;
		this.Album = 'Please select a';
		this.AlbumImageUrl = '../styles/splash.jpg';
		this.AlbumUrl = '';
		this.Artist = 'channel below...';
		this.ArtistUrl = '';
		
		this.Update();
		this.Dirty = false;
	}
	
	this.Fetching = function() {
		this.Track = 'Radio loading...';
		this.TrackId = 0;
		this.Album = 'Please wait while';
		this.AlbumImageUrl = 'loading';
		this.AlbumUrl = '';
		this.Artist = 'I fetch some songs.';
		this.ArtistUrl = '';
		
		this.Update();
		this.Dirty = false;
	}
}

var overrideStartIndex = false;
function PlaylistDataRecieved(playlist) {
	if(_prefetching) {
		_prefetchlist = playlist;
		_prefetching = false;
	} else {
		_playlist = playlist;
		if(overrideStartIndex) { 
			UpdatePosition(overrideStartIndex);
			overrideStartIndex = false;
		} else {
			UpdatePosition(0);
		}
		Play();
	}
}

function UpdatePosition(newIndex) {
	_currentIndex = newIndex;
	scrobblers.submit(); scrobblers.clear();
	
	var data;
	if(_currentIndex >= _playlist.length) {
		if(_prefetchlist) { _playlist = _prefetchlist; _prefetchlist = false; UpdatePosition(0); return; } 
		else if(_repeat) { UpdatePosition(0); return; }
		else { _current.Unload(); return; }
	}
	var data = _playlist[_currentIndex];
	_current.SetInfo(data.name, data.id, data.album_name, data.album_image, data.album_url, data.artist_name, data.artist_url);
	
	audio.src = data.stream;
	audio.volume = 1;
	audio.load();
}

//Operation
function LoadStation(config) {
	_current.Fetching();
	_prefetching = false;
	_repeat = false;
	_playlist = false;
	audio.pause();
	
	config += "&n=5";
	if(config.indexOf("order=random") == -1)
		config += "&nshuffle=500";
		
	jamendo.loadPlaylist(config);
}
function LoadFromMainpage(info) {
	if(!info.set) return;
	_current.Fetching();
	_prefetching = false;
	_repeat = false;
	_playlist = false;
	audio.pause();
	
	switch(info.set) {
		case 'radio': jamendo.loadJamRadio(info.data); break;
		case 'playlist': jamendo.loadJamPlaylist(info.data); break;
		case 'artist': jamendo.loadArtist(info.data); break;
		case 'album': jamendo.loadAlbums(info.data); break;
		case 'track': jamendo.loadTracks(info.data); break;
	}
}

function SetVolume(vol) {
	Volume = vol;
	audio.volume = vol;
	storage.Volume = vol;
}
function Play() {
	console.log('Play');
	if(_current.Loaded()) audio.play();
	audio.volume = Volume;
}
function Pause() {
	console.log('Pause');
	if(_current.Playing()) audio.pause();
}
function PPlay() {
	console.log('PPlay');
	if(_current.Playing()) audio.pause();
	else if (_current.Loaded()) audio.play();
	audio.volume = Volume;
	scrobblers.submit();
}

function Next(forcePlay) {
	console.log('Next');
	if(_currentIndex + 1 >= _playlist.length && _playlist.length > 1) { _prefetching = true; jamendo.loadPlaylist(); }
	_repeat = _repeat && _playlist.length > 1;
	
	if(forcePlay || _current.Playing()) {
		UpdatePosition(_currentIndex + 1);
		Play();
	} else {
		UpdatePosition(_currentIndex + 1);
	}
	
}
function Stop() {
	console.log('Stop');
	audio.src = "";
	audio.load();
	_playlist = false;
	scrobblers.submit();
	scrobblers.clear();
	_current.Unload();
}

//Lets roll!
init();