﻿//Streamer
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
var _currentConfig;

//Storage and state
var storage = false;
var _current = false;
function getCurrent(dataUpdatedCallback) {
	_current.onChange(dataUpdatedCallback);
	return _current;
}

var zeroSongsPlayed = true;

//Initialization
var Initialized = false;
function init() {
	audio.addEventListener("ended", function() {
		zeroSongsPlayed = false;
		Next(true);
	}, false);
	audio.addEventListener("playing", function() {
		if(_current.Dirty) scrobblers.nowPlaying(); _current.Dirty = false;
	}, false);
	audio.addEventListener("error", function() {
		//show warning message for Chrome 7+ (TODO: Once a working Chrome version is out, add upper limit. Or if mea culpa, fix and clean out this stuff here.)
		if (audio.src=="") return;
		if (zeroSongsPlayed && 4 == audio.error.code && parseInt(navigator.appVersion.replace(/.*Chrome\/([0-9]+).*/,'$1')) >= 7)
			_current.StreamError();
		else if (audio.error) {
			_current.Error();
		}
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
	if(storage.SiteIntegration)
		new Context().initialize();
	
	Initialized = true;
}

//Internals
function Current() {
	this.Ready = function() { if(_playlist) return true; return false; }
	this.Loaded = function() { if(audio.src) return true; return false; }
	this.Playing = function() { return this.Loaded() && !audio.paused; }
	
	this.Dirty = false;
	
	//handling album art
	var _onChange = false;
	this.onChange = function(callback) { _onChange = callback; if(_current.AlbumImageUrl != 'loading' && !this.Ready()) this.Unload(); else this.Update();}
	function _sendUpdate(albumImageReady) {
		try { _onChange(_current, albumImageReady) } catch(err) { }
	}
	
	var cachedAlbumUrls = ['../styles/splash.jpg'];
	this.Update = function() {
		var title = this.Track;
		if(this.TrackId) title += "\nby: " + this.Artist;
		if(storage.Scrobble) title += sformat(" (Scrobble: {0})", scrobblers.audioscrobbler.IsReady() ? "On" : "Off");
		
		chrome.browserAction.setTitle({"title":title+'\nJamendo Radio'});
		
		if(!_onChange) return; //require album art handler
		
		if(this.AlbumImageUrl == 'loading') {
			_sendUpdate(false); //no album art right now
		} else if(cachedAlbumUrls.contains(this.AlbumImageUrl)) {
			_sendUpdate(true); //show album art immediately
		} else {
			//load album art async and display when ready
			var albumImage = document.createElement("img"); var source = this.AlbumImageUrl;
			albumImage.onload = function () { cachedAlbumUrls[cachedAlbumUrls.length] = this.src; _current.Update();  }
			albumImage.src = this.AlbumImageUrl;
			_sendUpdate(false); //no album art right now
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
	
	this.StreamError = function() {
		if(!_playlist) { this.Unload(); return; }
		this.Track = 'Error';
		this.TrackId = 0;
		this.Album = 'Chrome 7+ has a known issue with HTML5 audio playback';
		this.AlbumImageUrl = '../styles/splash.jpg';
		this.AlbumUrl = 'http://code.google.com/p/jamendoradio/wiki/StreamFailureFix';
		this.Artist = 'Click to see temporary workaround';
		this.ArtistUrl = 'http://code.google.com/p/jamendoradio/wiki/StreamFailureFix';
	
		this.Update();
		this.Dirty = false;
	}
	
	this.Error = function () {
		if(!_playlist) { this.Unload(); return; }
		this.Track = 'Problem with playback';
		this.TrackId = 0;
		this.Album = 'Requested station/song not available';
		this.AlbumImageUrl = '../styles/splash.jpg';
		this.AlbumUrl = '';
		this.Artist = 'Check your internet connection';
		this.ArtistUrl = '';
	
		this.Update();
		this.Dirty = false;	
	}
}

var overrideStartIndex = false; var doSort = false;
function PlaylistDataRecieved(playlist) {
	if(_prefetching) {
		_prefetchlist = playlist;
		_prefetching = false;
	} else {
		if(doSort) {
			_playlist = [];
			var m = doSort.match(/\d+/g);
			for(var i in m) {
				for(var j in playlist) {
					if(playlist[j].id == m[i]) {
						_playlist.push(playlist[j]);
						break;
					}
				}
			}
			doSort = false;
		} else _playlist = playlist;
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
	_currentIndex = parseInt(newIndex);
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
	_currentConfig = config;
	
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
	_currentConfig = false;
	
	if(info.data.indexOf("+") > -1)
		doSort = info.data;
	else doSort = false;
	
	audio.pause();
	
	switch(info.set) {
		case 'radio': jamendo.loadJamRadio(info.data); break;
		case 'playlist': jamendo.loadJamPlaylist(info.data); break;
		case 'artist': jamendo.loadArtist(info.data); break;
		case 'album': jamendo.loadAlbums(info.data); break;
		case 'track': jamendo.loadTracks(info.data); break;
		case 'user': jamendo.loadUserStarred(info.data); break;
	}
}

function SetVolume(vol) {
	Volume = vol;
	audio.volume = vol;
	storage.Volume = vol;
}
function Play() {
	if(_current.Loaded()) audio.play();
	audio.volume = Volume;
}
function Pause() {
	if(_current.Playing()) audio.pause();
}
function PPlay() {
	if(_current.Playing()) audio.pause();
	else if (_current.Loaded()) audio.play();
	audio.volume = Volume;
	scrobblers.submit();
}

function Next(forcePlay) {
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
	_playlist = false;
	_currentConfig = false;
	audio.src = "";
	audio.load();
	scrobblers.submit();
	scrobblers.clear();
	_current.Unload();
}

//Lets roll!
init();