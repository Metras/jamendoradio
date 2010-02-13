//Streamer
var audio = new Audio();
var Volume = 1;

//Scrobblers
var scrobblers = false;

//Jamendo interface
var jamendo = false; 

//Playlist
var _currentIndex; var _repeat;
var _playlist; 
var _prefetching; var _prefetchlist;

//Storage
var storage = false;
var _current = false;
function getCurrent(dataUpdatedCallback) {
	if(!Initialized) { init(); }
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
                case "manipulatePage": sendResponse({ GoAhead: storage.SiteIntegration }); return;
                case "loadAlbumPlayList": LoadAlbum(request.data); break;
                case "loadTrackPlayList": LoadTrack(request.data); break;
                case "loadArtistRadio": LoadArtist(request.data); break;
                case "loadPlayList": LoadPlayList(request.data); break;
                case "loadRadioPlayList": LoadJamRadio(request.data); break;
				case "scrobbleReady": sendResponse(scrobblers.ready()); return;
				case "scrobbleInit": scrobblers.init(); break;
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
		'init':function() { if(storage.Scrobble && storage.ScrobbleUsername && storage.ScrobblePassword) 
			scrobblers.audioscrobbler.Handshake(storage.ScrobbleUsername, storage.ScrobblePassword); },
		'nowPlaying':function() { if(!this.ready()) this.init(); this.aso = getScrobbleObject(_current); this.audioscrobbler.NowPlaying(this.aso); },
		'submit':function() { if(!this.aso) return; if(this.audioscrobbler.Submit(this.aso)) this.clear(); },
		'clear':function() { this.aso = false; }
	}
	jamendo = new Jamendo();
	jamendo.onPlaylistLoaded(PlaylistDataRecieved);
	storage = new Storage();
	_current = new Current();
	
	scrobblers.init();
	
	Initialized = true;
}

//Internals
function Current() {
	this.Ready = function() { if(_playlist) return true; return false; }
	this.Loaded = function() { if(audio.src) return true; return false; }
	this.Playing = function() { return this.Loaded() && !audio.paused; }
	
	this.Dirty = false;
	
	var _onChange = false;
	this.onChange = function(callback) { _onChange = callback; if(!this.Ready()) this.Unload(); else this.Update();}
	
	var cachedAlbumUrls = ['../styles/splash.jpg'];
	this.Update = function() {
		if(!_onChange) return;
		
		try {
		if(this.AlbumImageUrl == 'loading') {
			_onChange(_current, false);
		} else if(cachedAlbumUrls.contains(this.AlbumImageUrl)) {
			_onChange(_current, true);
		} else {
			var albumImage = document.createElement("img"); var source = this.AlbumImageUrl;
			albumImage.onload = function () { cachedAlbumUrls[cachedAlbumUrls.length] = this.src; _current.Update();  }
			albumImage.src = this.AlbumImageUrl;
			_onChange(_current, false);
		}} catch(err) {}
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

function PlaylistDataRecieved(playlist) {
	if(_prefetching) {
		_prefetchlist = playlist;
	} else {
		_playlist = playlist;
		UpdatePosition(0);
		Play();
	}
}

function UpdatePosition(newIndex) {
	_currentIndex = newIndex;
	scrobblers.submit(); scrobblers.clear();
	
	var data;
	if(_currentIndex >= _playlist.length) {
		if(_prefetchlist) { _playlist = _prefetchlist; _prefetchlist = false; UpdatePosition(0); return; } 
		else if(repeat) { UpdatePosition(0); return; }
		else { _current.Unload(); return; }
	}
	var data = _playlist[_currentIndex];
	_current.SetInfo(data.name, data.id, data.album_name, data.album_image, data.album_url, data.album_name, data.album_url);
	
	audio.src = data.stream;
	audio.volume = 1;
	audio.load();
}

//Operation
function LoadStation(config) {
	_current.Fetching();
	_prefetching = false;
	
	config += "&n=5";
	if(config.indexOf("order=random") == -1)
		config += "&nshuffle=500";
	repeat = false;
		
	jamendo.loadPlaylist(config);
}
function SetVolume(vol) {
	Volume = vol;
	audio.volume = vol;
}
function Play() {	
	if(_current.Loaded()) audio.play();
	audio.volume = Volume;
}
function Pause() {
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
	if(forcePlay || _current.Playing()) {
		UpdatePosition(_currentIndex + 1);
		Play();
	} else {
		UpdatePosition(_currentIndex + 1);
	}
}
function Stop() {
	audio.src = "";
	audio.load();
	scrobblers.submit();
	scrobblers.clear();
	_current.Unload();
}
init();
