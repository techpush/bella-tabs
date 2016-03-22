/**
 * BellaTabs
 * @ndaidong
 */

/* global chrome */
/* eslint no-console: 0*/

// events
function onInstall() {

}

function onUpdate(old) {
  console.log(old);
}

var prefs = {
  'method': 2,
  'onOff': 1,
  'ckSpell': 0,
  'oldAccent': 1
};

function updateAllTabs() {
  chrome.tabs.getAllInWindow(null, function eachTab(tabs) {
    tabs.forEach(function updateOne(tab) {
      chrome.tabs.sendMessage(tab.id, prefs);
    });
  });
}

// set listeners
chrome.runtime.onInstalled.addListener(function eachTab(details) {
  if (details.reason === 'install') {
    onInstall();
  } else if (details.reason === 'update') {
    onUpdate(details.previousVersion);
  }
});

chrome.runtime.onMessage.addListener(function onMsg(request, sender, sendResponse) {
  var cb = sendResponse || function fn() {};
  if (request.action === 'configAVIM') {
    updateAllTabs();
    return cb(prefs);
  }
  return false;
});

/*
chrome.alarms.onAlarm.addListener(function(alarm){

});
*/
