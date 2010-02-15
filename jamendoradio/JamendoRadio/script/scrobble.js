function Scrobbler(endpoint, clientId, clientVersion) {
    var _endpoint = endpoint; var _clientId = clientId; var _clientVersion = clientVersion;

    var _session;
    this.Handshake = function(user, passwordHash) {
		if(!allowed(true)) return;
		if(!user || !passwordHash) return;
		console.log('Sending handshake...');

        var ts = timeStamp();
        var auth_token = hex_md5(passwordHash + ts);
        var post_string = sformat("?hs=true&p=1.2.1&c={0}&v={1}&t={2}&u={3}&a={4}", 
			_clientId, _clientVersion, ts, user, auth_token);

		var setup = function(response) {
			var data = response.split('\n');
			if(data[0] == "OK") {
				_session = {'usr':user,'pwd':passwordHash,'sessionId':data[1],'npUrl':data[2],'subUrl':data[3]};
				console.log("Handshake completed, " + user + " is now logged in to endpoint " + _endpoint + ".");
			} else {
				console.log("Request failed");
				_session = false;
			} 
			console.log("Response: " + response);
		}
		makeRequest("GET", _endpoint + post_string, setup);
	}

    this.NowPlaying = function(cd) {
		if(!allowed() || !cd) return;

		var post_string = sformat("?s={0}&a={1}&b={2}&t={3}&l={4}&n={5}&m={6}",
			_session.sessionId, cd.a, cd.b, cd.t, cd.l, cd.n, cd.m);
			
		console.log('Submitting NowPlaying for track "' + cd.t + '".');
		makeRequest("POST", _session.npUrl + post_string, function(r) { console.log("Response: " + r); }, function() { _session = false; });
   }
    this.Submit = function(cd) {
		if(!allowed()) return;
	
		// Check if scrobbling is allowed
		if(cd.l < 30)
			console.log('Track "' + cd.t + '" is too short for scrobbling.');
			
		var cts = timeStamp();
		if((cts - cd.i >= 240) || (cts - cd.i > cd.l / 2)) {
			//All-righty then
			var post_string = sformat("?s={0}&o[0]=P&r[0]=&a[0]={1}&b[0]={2}&t[0]={3}&l[0]={4}&n[0]={5}&i[0]={6}&m[0]={7}",
				_session.sessionId, cd.a, cd.b, cd.t, cd.l, cd.n, cd.i, cd.m);
			
			console.log('Submitting scrobble for track "' + cd.t + '".');
			makeRequest("POST", _session.subUrl + post_string, function(r) { console.log("Response: " + r); }, function() { _session = false; });
			return true;
		} else {
			//Guess not
			console.log('It is way too soon to scrobble track "' + cd.t + '".');
		}
		return false;
    }

	function allowed(skipSessionCheck) { return (skipSessionCheck || _session) && eval(localStorage["Scrobble"]); }
	this.IsReady = function() {
		return allowed();
	}
}

function getScrobbleObject(data, variant) {
	var scrobbleObject;
	if(data.Artist == "# Psytrance Brazil #") { //DIRTY DIRTY!!!
		var fixedArtist; var fixedAlbum; var fixedTrack; var dashIndex;

		if(data.Album.indexOf('-') > -1) {
			dashIndex = data.Album.indexOf('-');
			fixedAlbum = data.Album.substr(dashIndex + 1);
			fixedArtist = data.Album.substr(0, dashIndex - 1);
		} else fixedAlbum = data.Album;
		if(data.Track.indexOf('-') > -1) {
			dashIndex = data.Track.indexOf('-');
			fixedTrack = data.Track.substr(dashIndex + 1);
			fixedArtist = data.Track.substr(0, dashIndex - 1);
		} else fixedTrack = data.Track;
		if(!fixedArtist || !fixedAlbum || !fixedTrack) return;
		scrobbleObject = {
			'a':urlencode(fixedArtist),
			'b':urlencode(fixedAlbum),
			't':urlencode(fixedTrack),
			'l':Math.round(audio.duration),
			'n':"",
			'm':"",
			'i':Math.round(new Date().getTime() / 1000)             
		}
	} else {
		scrobbleObject = {
			'a':urlencode(data.Artist),
			'b':urlencode(data.Album),
			't':urlencode(data.Track),
			'l':Math.round(audio.duration),
			'n':"",
			'm':"",
			'i':Math.round(new Date().getTime() / 1000)
		};
	}

	if(variant) switch(variant) {
		case 'jamendo': scrobbleObject.m = urlencode("jamendo.com/track/" + data.TrackId); break;
	}
	
	return scrobbleObject;
}