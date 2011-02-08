var idCounter = 0;
var storage =  new Storage();
setInterval(function () {
    chrome.extension.sendRequest( { target : "scrobbleReady" }, function (response) {
        if (response)$("#scrobblestatus").css('color', 'green').text('Connection detected');
        else $("#scrobblestatus").css('color', 'red').text('No connection');
    });
}
, 250);
function save_channels() {
	storage.SkipDefault =  $("#skipDefault").attr("checked");
    var options =  new Array();
    $(".channelRow").each(function () {
        options[options.length] = { "Name" : this.children[1].children[0].value, "Subset" : this.children[3].children[0].value };
    });
    storage.Stations = options;
	$(".configContainer input").attr('disabled', 'disabled')
	
	if(storage.SiteIntegration)
		new Context().initialize();
}
function restore_channels() {
	$("#skipDefault").attr("checked", storage.SkipDefault);
    $(".channel").remove();
	if(storage.Stations) {
		for (i = 0; i < storage.Stations.length; i++) {
			AddChannel(storage.Stations[i].Name, storage.Stations[i].Subset);
		}
	}
}
function save_options() {
	storage.SiteIntegration =  $("#pageIntegration").attr("checked");
	storage.Skin = $("#skin").attr("value");
	save_scrobble();
	
	if(storage.SiteIntegration)
		new Context().initialize();
}
function restore_options() {
	$("#pageIntegration").attr("checked", storage.SiteIntegration);
	$("#skin").attr("value", storage.Skin || "default");
    preview_skin();
	restore_scrobble();
}
function save_scrobble() {
	storage.Scrobble = $("#scrobble").attr("checked");
	
    var usr =  $("#scrUsername").attr("value");
    var pwd = $("#scrPassword").attr("value");
    if (usr && pwd) {
        storage.ScrobbleUsername = usr;
        storage.ScrobblePassword = hex_md5(pwd);
        $("#scrPassword").attr("value", "");
        pwd = "";
    }
    chrome.extension.sendRequest( { target : "scrobbleInit" }, function (response) {});
}
function restore_scrobble() {
    $("#scrobble").attr("checked", storage.Scrobble);
	 $("#scrUsername").attr("value",  storage.ScrobbleUsername || "");
    /* No point in restoring the password. It's been eaten up by the MD5 algorithm */
}
function preview_skin() {
	$("#skinPreview").attr("src", sformat('styles/{0}.png', $("#skin").attr("value")));
}

function AddChannel(name, config) {
    var ident = "channel_" + idCounter++;
    var newHTML = "<li id='{0}' class='ui-state-default channel'>" + "<table><tr class='channelRow'><td class='move'><span class='ui-icon ui-icon-arrowthick-2-n-s'></span></td>" + "<td class='nameContainer'><input class='channelName' value='{1}' /></td>" + "<td class='edit'><span class='ui-icon ui-icon-pencil' onclick=\"$('#editor_{0}').removeAttr('disabled');\"></span></td>" + "<td class='configContainer'><input id='editor_{0}' class='channelConfig' value='{2}' disabled='true' /></td>" + "<td class='trash'><span class='ui-icon ui-icon-trash' onclick='$(\"#{0}\").remove();'></span></td></tr></table></li>";
    $("#channels").append(sformat(newHTML, ident, name, config));
}
function CreateChannel() {
    if (!newName.value) {
        alert("Please pick a name for this station");
        return;
    }
    if (!newSet.value && !newOrder.value) {
        alert("Please specify sort order");
        return;
    }
    if (newSet.value && !newValues.value) {
        alert("Please specify criteria");
        return;
    }
    if (newValues.value &&  newValues.value.indexOf(' ') >  - 1) {
        alert("Criteria may not contain spaces.\nSeparate them by placing one on each row...");
        return;
    }
    if (newSet.value == "user" &&  newValues.value.indexOf("\n") >  - 1) {
        alert("You may only fetch albums from a single user.");
        return;
    }
    var config = "";
    switch (newSet.value) {
        case "tag":
            config = "+album_tag/?tag_idstr=" +  newValues.value.replace(/\n/mg, '+');
            if (newOrder.value)config += "&order=" +  newOrder.value;
            break;
        case "artist":
            config = "/?order=random&artist_idstr=" +  newValues.value.replace(/\n/mg, '+');
            break;
        case "album":
            config = "/?order=random&album_id=" +  newValues.value.replace(/\n/mg, '+');
            break;
        case "playlist":
            config = "+playlist_track/?order=random&playlist_id=" +  newValues.value.replace(/\n/mg, '+');
            break;
        case "jamradio":
            config = "+radio_track_inradioplaylist/?order=random&radio_id=" +  newValues.value.replace(/\n/mg, '+');
            break;
        case "user":
            config = "+album_user_starred/?order=random&user_idstr=" +  newValues.value.replace(/\n/mg, '+');
            break;
            default : config = "/?order=" +  newOrder.value;
    }
    AddChannel(newName.value, config);
    ClearDesigner();
    return true;
}
function ClearDesigner() {
    $('#designer input').add('#designer textarea').val('');
    $('#designer select').attr('selectedIndex', 0);
     newValues.disabled = true;
     newOrder.disabled = false;
}
$(function () {
    $("#channels").sortable();
    $("#channels").disableSelection();
    $(".fg-button:not(.ui-state-disabled)").hover(function () {
        $(this).addClass("ui-state-hover");
    }
    , function () {
        $(this).removeClass("ui-state-hover");
    }
    ).mousedown(function () {
        $(this).parents('.fg-buttonset-single:first').find(".fg-button.ui-state-active").removeClass("ui-state-active");
        if ($(this).is('.ui-state-active.fg-button-toggleable, .fg-buttonset-multi .ui-state-active')) {
            $(this).removeClass("ui-state-active");
        }
        else {
            $(this).addClass("ui-state-active");
        }
    }
    ).mouseup(function () {
        if (!$(this).is('.fg-button-toggleable, .fg-buttonset-single .fg-button,  .fg-buttonset-multi .fg-button')) {
            $(this).removeClass("ui-state-active");
        }
    }
    );
    $(".contextMenu").mouseleave(function () {
        $(this).hide(500);
    }
    );
    setTimeout(function () {
        $("#accordion").css("height", "100%");
        $("#accordion").fadeIn(500).accordion( {
            fillSpace : true, changestart : function (event, ui) {
                cIndex = parseInt(ui.newHeader.attr("index"));
            }
        }
        );
    }
    , 150);
}
);
var cIndex = 0;
$(window).resize(function () {
    $("#accordion").fadeOut(500, function () {
        $("#accordion").accordion('destroy').fadeIn(500).accordion( { fillSpace : true, changestart : function (event, ui) { cIndex = parseInt(ui.newHeader.attr("index")) }, active : cIndex });
    });
}
);
