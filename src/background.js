/**
 * BellaTabs
 * @ndaidong
 */

/* global chrome */


// events
function onInstall(){

}

function onUpdate(old){
  console.log(old);
}

var prefs = {
  'method': 2,
  'onOff': 1,
  'ckSpell': 0,
  'oldAccent': 1
}

function updateAllTabs(){
  chrome.tabs.getAllInWindow(null, function(tabs){
    tabs.forEach(function(tab){
      chrome.tabs.sendMessage(tab.id, prefs);
    });
  });
}

// set listeners
chrome.runtime.onInstalled.addListener(function(details){
  if(details.reason === 'install'){
    onInstall();
  }
  else if(details.reason === 'update'){
    onUpdate(details.previousVersion);
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  var cb = sendResponse || function(){};
  if(request.action === 'init'){

  }
  else if(request.action === 'configAVIM'){
    updateAllTabs();
    return cb(prefs);
  }
});

/*
chrome.alarms.onAlarm.addListener(function(alarm){

});
*/
