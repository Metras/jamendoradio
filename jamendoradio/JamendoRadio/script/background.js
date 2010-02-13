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
		Next(); Play();
	}, false);
	audio.addEventListener("playing", function() {
		//if(new_song) { new_song = false; as.NowPlaying(); js.NowPlaying(); }
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
				case "scrobbleReady": sendResponse(as.IsReady()); return;
				case "scrobbleInit": InitScrobble(); break;
            }
            sendResponse();
        }
        else
            sendResponse({});
    });
	
	scrobblers = {
		'audioscrobbler':new Scrobbler("http://post.audioscrobbler.com/", "jmn", "1.0"), //Scrobble to last.fm
		'jamendo':new Scrobbler("http://postaudioscrobbler.jamendo.com/", "tst", "1.0")  //Scrobble to Jamendo
	}
	jamendo = new Jamendo();
	jamendo.onPlaylistLoaded(PlaylistDataRecieved);
	storage = new Storage();
	_current = new Current();
	Initialized = true;
}

//Internals
function Current() {
	this.Ready = function() { if(_playlist) return true; return false; }
	this.Loaded = function() { if(audio.src) return true; return false; }
	this.Playing = function() { return this.Loaded() && !audio.paused; }
	
	var _onChange = false;
	this.onChange = function(callback) { _onChange = callback; if(!this.Ready()) this.Unload(); else this.Update();}
	
	var cachedAlbumUrls = ['../styles/splash.jpg'];
	this.Update = function() {
		if(!_onChange) return;
		
		if(this.AlbumImageUrl == 'loading') {
			_onChange(_current, false);
		} else if(cachedAlbumUrls.contains(this.AlbumImageUrl)) {
			_onChange(_current, true);
		} else {
			var albumImage = document.createElement("img"); var source = this.AlbumImageUrl;
			albumImage.onload = function () { cachedAlbumUrls[cachedAlbumUrls.length] = this.src; _current.Update();  }
			albumImage.src = this.AlbumImageUrl;
			_onChange(_current, false);
		}
	}
	
	this.Unload = function() {
		this.Track = 'No radio loaded';
		this.Album = 'Please select a';
		this.AlbumImageUrl = '../styles/splash.jpg';
		this.AlbumUrl = '';
		this.Artist = 'channel below...';
		this.ArtistUrl = '';
		
		this.Update();
	}
	
	this.Fetching = function() {
		this.Track = 'Radio loading...';
		this.Album = 'Please wait while';
		this.AlbumImageUrl = 'loading';
		this.AlbumUrl = '';
		this.Artist = 'I fetch some songs.';
		this.ArtistUrl = '';
		
		this.Update();
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
	
	var data;
	if(_currentIndex >= _playlist.length) {
		if(_prefetchlist) { _playlist = _prefetchlist; _prefetchlist = false; UpdatePosition(0); return; } 
		else if(repeat) { UpdatePosition(0); return; }
		else { _current.Unload(); return; }
	}
	var data = _playlist[_currentIndex];
	_current.Track = data.name;
	_current.Album = data.album_name;
	_current.AlbumImageUrl = data.album_image;
	_current.AlbumUrl = data.album_url;
	_current.Artist = data.album_name;
	_current.ArtistUrl = data.album_url;

	_current.Update();
	
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
}

function Next() {
	if(_current.Playing()) {
		UpdatePosition(_currentIndex + 1);
		Play();
	} else {
		UpdatePosition(_currentIndex + 1);
	}
}
function Stop() {
	audio.src = "";
	audio.load();
	
	_current.Unload();
}

