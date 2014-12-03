/**
 * BellaTabs
 * @ndaidong
 */ 	
	var _user, _city = '', _weather, _lang = navigator.language;

	    // events
	function onInstall(){

	}
	
	function onUpdate(old){
		
	}
	
	var prefs = {
		'method': 2,
		'onOff': 1,
		'ckSpell': 0,
		'oldAccent': 1
	}

	function updateAllTabs(){
		chrome.tabs.getAllInWindow(null, function(tabs){
			for (var i=0; i<tabs.length; i++) {
				var tab = tabs[i];
				chrome.tabs.sendMessage(tab.id, prefs);
			}
		});
	}
	
    // set listeners
    chrome.runtime.onInstalled.addListener(function(details){
		if(details.reason == "install"){
			onInstall();
		}
		else if(details.reason == "update"){
			onUpdate(details.previousVersion);
		}
	});
		
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
		var cb = sendResponse || function(){};
		if(request.action=="init"){
			
		}
		else if(request.action=='configAVIM'){
			cb(prefs);
			updateAllTabs();
		}
	});
	
	chrome.alarms.onAlarm.addListener(function(alarm){
		
	});
