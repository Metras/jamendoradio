function Scrobbler(endpoint, clientId, clientVersion) {
    var _endpoint = endpoint; var _clientId = clientId; var _clientVersion = clientVersion;

    var _session;
    this.Handshake = function(user, passwordHash) {
		if(!allowed(true)) return;
		if(!user || !passwordHash) return;
				
        var ts = timeStamp();
        var auth_token = hex_md5(passwordHash + ts);
        var post_string = sformat("?hs=true&p=1.2.1&c={0}&v={1}&t={2}&u={3}&a={4}", 
			_clientId, _clientVersion, ts, user, auth_token);

		var setup = function(response) {
			var data = response.split('\n');
			if(data[0] == "OK") {
				_session = {'usr':user,'pwd':passwordHash,'sessionId':data[1],'npUrl':data[2],'subUrl':data[3]};
			
				console.log("Handshake completed, " + user + " is now logged in to endpoint " + _endpoint + ".");
				console.log("Response: " + response);
			} else {
				console.log("Request failed");
				_session = false;
			} 
		}
		makeRequest("GET", _endpoint + post_string, setup);
	}

	var _listening;
    this.NowPlaying = function(cd) {
		if(!allowed()) return;

		var post_string = sformat("?s={0}&a={1}&b={2}&t={3}&l={4}&n={5}&m={6}",
			_sessionId, _cd.a, _cd.b, _cd.t, _cd.l, _cd.n, _cd.m);
			
		console.log('Submitting NowPlaying for track "' + _cd.t + '".');
		makeRequest("POST", _session.npUrl + post_string, function(r) { console.log("Response: " + r); }, function() { _ready = false; });
   }
    this.Submit = function(cd) {
		if(!allowed()) return;
	
		// Check if scrobbling is allowed
		if(_cd.l < 30)
			console.log('Track "' + _cd.t + '" is too short for scrobbling.');
			
		var cts = timeStamp();
		if((cts - _cd.i >= 240) || (cts - _cd.i > _cd.l / 2)) {
			//All-righty then
			var post_string = sformat("?s={0}&o[0]=P&r[0]=&a[0]={1}&b[0]={2}&t[0]={3}&l[0]={4}&n[0]={5}&i[0]={6}&m[0]={7}",
				_sessionId, _cd.a, _cd.b, _cd.t, _cd.l, _cd.n, _cd.i, _cd.m);
			
			console.log('Submitting scrobble for track "' + _cd.t + '".');
			makeRequest("POST", _session.subUrl + post_string, function(r) { console.log("Response: " + r); }, function() { _ready = false; });
		} else {
			//Guess not
			console.log('Track "' + _cd.t + '" has been prematurely ended, and does not qualify for scrobbling.');
		}
    }

	function allowed(skipSessionCheck) { return (skipSessionCheck || _session) && eval(localStorage["Scrobble"]); }
	this.IsReady = function() {
		return allowed();
	}
}