function Context() {
	var albumMenus = [];
	var artistMenus = [];
	var albumMenu, artistMenu;
    this.initialize = function () {
		chrome.contextMenus.removeAll()
		createAlbumContext();
		createArtistContext();
    }
	
	createAlbumContext = function() {
		var opt = {
			title: 'Add to station',
			documentUrlPatterns: ['http://*.jamendo.com/*/album/*']
		}
		albumMenu = chrome.contextMenus.create(opt);
		chrome.contextMenus.create({title: 'New station...', parentId: albumMenu, onclick: function(e) { addAlbumStation(e.pageUrl); } });
		
		if(!storage.Stations) return;
		var separator = false;
		for(var i = 0; i < storage.Stations.length; i++) {
			if(!separator)
				chrome.contextMenus.create({type: 'separator', parentId: albumMenu});
			separator = true;
			var station = storage.Stations[i];
			if(station.Subset.indexOf('&album_id=') > 0) {
				var cid = chrome.contextMenus.create({title: station.Name, parentId: albumMenu, onclick: function(e) { addAlbumStation(e.pageUrl, e.menuItemId); } });
				albumMenus[cid] = station.Name;
			}
		}
	}
	
	createArtistContext = function() {
		var opt = {
			title: 'Add to station',
			documentUrlPatterns: ['http://*.jamendo.com/*/artist/*']
		}
		artistMenu = chrome.contextMenus.create(opt);
		chrome.contextMenus.create({title: 'New station...', parentId: artistMenu, onclick: function(e) { addArtistStation(e.pageUrl); } });
		
		if(!storage.Stations) return;
		var separator = false;
		for(var i = 0; i < storage.Stations.length; i++) {
			if(!separator)
				chrome.contextMenus.create({type: 'separator', parentId: artistMenu});
			separator = true;
			var station = storage.Stations[i];
			if(station.Subset.indexOf('&artist_idstr=') > 0) {
				var cid = chrome.contextMenus.create({title: station.Name, parentId: artistMenu, onclick: function(e) { addArtistStation(e.pageUrl, e.menuItemId); } });
				artistMenus[cid] = station.Name;
			}
		}
	}
	
	addAlbumStation = function(url, menuId) {
		var stations = storage.Stations || new Array();
		var albumId = url.match(/\d+$/)[0];
		if(menuId) {
			for(var i = 0; i < stations.length; i++) {
				var check = new RegExp("[+=]" + albumId + "([&+]|$)").exec(stations[i].Subset);
				if(stations[i].Name == albumMenus[menuId] && !check) {
					stations[i].Subset = stations[i].Subset.replace('&album_id=', '&album_id=' + albumId + '+');
				}
			}
		} else {
			var name = prompt('Please enter a name for this station...');
			var subset = '/?order=random&album_id=' + albumId;
			stations.push({ "Name": name, "Subset": subset });

			var cid = chrome.contextMenus.create({title: name, parentId: albumMenu, onclick: function(e) { addAlbumStation(e.pageUrl, e.menuItemId); } });
			albumMenus[cid] = name;
		}
		storage.Stations = stations;
	}
	
	addArtistStation = function(url, menuId) {
		var stations = storage.Stations || new Array();
		var artistId = url.match(/[^\/]+$/)[0];
		if(menuId) {
			for(var i = 0; i < stations.length; i++) {
				var check = new RegExp("[+=]" + artistId + "([&+]|$)").exec(stations[i].Subset);
				if(stations[i].Name == artistMenus[menuId] && !check) {
					stations[i].Subset = stations[i].Subset.replace('&artist_idstr=', '&artist_idstr=' + artistId + '+');
				}
			}
		} else {
			var name = prompt('Please enter a name for this station....');
			var subset = '/?order=random&artist_idstr=' + artistId;
			stations.push({ "Name": name, "Subset": subset});
			
			var cid = chrome.contextMenus.create({title: name, parentId: artistMenu, onclick: function(e) { addArtistStation(e.pageUrl, e.menuItemId); } });
			artistMenus[cid] = name;
		}
		storage.Stations = stations;
	}
}