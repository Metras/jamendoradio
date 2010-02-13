//Jamendo API wrapper
function Jamendo(fields, settings, endpoint) {
	var _endpoint = endpoint || 'http://api.jamendo.com/get2/';
	this.getEndpoint = function() { return _endpoint; }
	this.setEndpoint = function(endpoint) { _endpoint = endpoint; }

	var _fields = fields || 'name+id+stream+album_name+album_url+album_image+artist_name+artist_url';
	this.getFields = function() { return _fields; }
	this.setFields = function(fields) { _fields = fields; }
	
	var _settings = settings || '/track/json/track_album+album_artist';
	this.getSettings = function() { return _settings; }
	this.setSettings = function(settings) { _settings = settings; }
	
	var _onPlaylistLoaded = false;
	this.onPlaylistLoaded = function(callback) { _onPlaylistLoaded = callback; }
		
	var _timeKeeper;
	var _previousRequest = false;
	this.loadPlaylist = function(config) {
		var url = '';
		if(!config) url = _previousRequest;
		else url = _endpoint + _fields + _settings + config;
		
		if(_timeKeeper) { return; };
		_timeKeeper = setTimeout(function() { _timeKeeper = false; }, 1200);

		makeRequest("GET", url, function(data) {
			var _playlist = eval(data);
			if(_onPlaylistLoaded)
				_onPlaylistLoaded(_playlist);
		});
		_previousRequest = url;
	}
	
	this.loadArtist = function(artist) {
		var configString = '/?order=random&n=5&nshuffle=500&artist_idstr=' + artist;
		this.loadPlaylist(configString);
	}
	
	this.loadTags = function(tag) {
		var configString = '+album_tag/?order=random&n=5&nshuffle=500&tag_idstr=' + tag;
		this.loadPlaylist(configString);
	}
	
	this.loadUserStarred = function(user) {
		var configString = '+album_user_starred/?order=random&n=5&nshuffle=500&user_idstr=' + user;
		this.loadPlaylist(configString);
	}

	this.loadTracks = function(ids) {
		var configString = '/?id=';
		if(ids.length)
			configString += concat(ids);
		else
			configString += ids;
		
		this.loadPlaylist(configString);
	}
	
	this.loadAlbums = function(ids, order) {
		var configString = '/?order=' + order || (ids.length ? 'random&n=5&nshuffle=500' : 'numalbum_asc') + '&album_id=';
		if(ids.length)
			configString += concat(ids);
		else
			configString += ids;
		
		this.loadPlaylist(configString);
	}
	
	this.loadJamRadio = function(ids, order) {
		var configString = '+radio_track_inradioplaylist/?order=' + order || (ids.length ? 'random&n=5&nshuffle=500' : 'numradio_asc') + '&radio_id=';
		if(ids.length)
			configString += concat(ids);
		else
			configString += ids;
		
		this.loadPlaylist(configString);
	}

	this.loadJamplaylist = function(ids, order) {
		var configString = '+playlist_track/?order=' + order || (ids.length ? 'random&n=5&nshuffle=500' : 'numplaylist_asc') + '&playlist_id=';
		if(ids.length)
			configString += concat(ids);
		else
			configString += ids;
		
		this.loadPlaylist(configString);
	}
	
	function concat(arr, divider) {
		if(!divider) divider = '+';
		var result = '';
		for(i = 0; i < arr.length; i++) { result += divider + arr[i]; }
		return result.substr(1);
	}
}