function Scrobbler(endpoint, clientId, clientVersion) {
    var _endpoint = endpoint;
    var _clientId = clientId;
    var _clientVersion = clientVersion;
    var _session;
	
    this.Handshake = function (user, passwordHash, fromRetry) {
        if (!allowed(true))return;
        if (!user || !passwordHash)return;
        if(!fromRetry) retry_reset();
        var ts = timeStamp();
        var auth_token = hex_md5(passwordHash + ts);
    	var post_string = "?" + $.param({hs:true,p:'1.2.1',c:_clientId,v:_clientVersion,t:ts,u:user,a:auth_token});
        var setup = function (response) {
			var data = response.split('\n');
            if (data[0] == "OK") {
                _session = { 'usr' : user, 'pwd' : passwordHash, 'sessionId' : data[1], 'npUrl' : data[2], 'subUrl' : data[3]};
            } else  fail(); 
        }
        //makeRequest("GET", _endpoint + post_string, setup, fail	);
		$.get(_endpoint + post_string, setup);
    }
    this.NowPlaying = function (cd) {
        if (!allowed() || !cd)return;
		cd.s = _session.sessionId;
		var post_string = "?" + $.param(cd);
        $.post(_session.npUrl + post_string, check);
    }
    this.Submit = function (cd, playTime) {
        if (!allowed())return;
        // Check if scrobbling is permitted in accordance with API guidelines
        if (cd.l < 30) return;
        if ((playTime >= 240) || (playTime > cd.l / 2)) {
            //All-righty then
			cd.s = _session.sessionId;
			var post_string = "?" + $.param(cd);
			$.post(_session.subUrl + post_string, check);			
             return true;
        }
        //Guess not
        return false;
    }
    function allowed(skipSessionCheck) {
        return (skipSessionCheck || _session) && eval(localStorage["Scrobble"]);
    }
    this.IsReady = function () {
        return allowed();
    }
	
	var _retryCounter = 0;
	var _retryTimer = null;
	function retry(tries, user, passwordHash) {
		var hs = this.Handshake;
		if(tries < 3) _retryTimer = setTimeout(function() {  hs(user, passwordHash, true) }, 1500);
	}
	function retry_reset(){
		if(_retryTimer) clearTimeout(_retryTimer);
		_retryCounter = 0;
	}
	function check(r) {
		if(r.split('\n')[0] != "OK") { fail(); return false; }
		return true;
	}
	function fail() {
		retry(_retryCounter++, eval(localStorage["ScrobbleUsername"]), eval(localStorage["ScrobblePassword"]));
		_session = false;
	}
}
function getScrobbleObject(data, variant) {
    var scrobbleObject;
    if (data.Artist == "# Psytrance Brazil #") {
        //DIRTY DIRTY!!!
        var fixedArtist;
        var fixedAlbum;
        var fixedTrack;
        var dashIndex;
        if (data.Album.indexOf('-') >  - 1) {
            dashIndex = data.Album.indexOf('-');
            fixedAlbum = data.Album.substr(dashIndex + 1);
            fixedArtist = data.Album.substr(0, dashIndex - 1);
        }
        else fixedAlbum = data.Album;
        if (data.Track.indexOf('-') >  - 1) {
            dashIndex = data.Track.indexOf('-');
            fixedTrack = data.Track.substr(dashIndex + 1);
            fixedArtist = data.Track.substr(0, dashIndex - 1);
        }
        else fixedTrack = data.Track;
        if (!fixedArtist || !fixedAlbum || !fixedTrack)return;
        scrobbleObject = {'a' : fixedArtist, 'b' :fixedAlbum, 't' :fixedTrack, 'l' : Math.round(audio.duration), 'n' : "", 'm' : "", 'i' : Math.round(new Date().getTime() / 1000) };
    }
    else {
        scrobbleObject = { 'a' : data.Artist, 'b' :data.Album, 't' :data.Track, 'l' : Math.round(audio.duration), 'n' : "", 'm' : "", 'i' : Math.round(new Date().getTime()/1000)};
    }
    if (variant)switch (variant) {
        case 'jamendo':
        scrobbleObject.m = urlencode("jamendo.com/track / " + data.TrackId);
        break;
    }
    return scrobbleObject;
}
