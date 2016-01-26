chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.executeScript(tab.id, {file: "downloadFiles.js", runAt: "document_idle"});
	chrome.tabs.insertCSS(tab.id, {file: "popup.css", runAt: "document_start"});
});

var filenameConflictAction = "uniquify";
var displaySaveAsDialog = false;

chrome.runtime.onConnect.addListener(function(port) {
	port.onMessage.addListener(function(message) {
		if (message.url) {
			//get a filename based on what was sent
			//if there was a folder, then add it to the beginning
			//if there was a specific name, then use it instead of the original file name
			var filename = (message.folder ? message.folder + "/" : "") + (message.filename ? message.filename : message.url.split("/").pop());
			chrome.downloads.download({
				url: message.url,
				filename: filename,
				conflictAction: filenameConflictAction,
				saveAs: displaySaveAsDialog
			});
		}
	});
});

//load settings
chrome.storage.sync.get(["filenameConflictAction", "displaySaveAsDialog"], function(items) {
	if (typeof(items.filenameConflictAction) == "undefined") {
		filenameConflictAction = "uniquify";
		//since this value has never been set, it needs to be saved
		chrome.storage.sync.set({filenameConflictAction: "uniquify"});
	} else {
		filenameConflictAction = items.filenameConflictAction;
	}
	if (typeof(items.displaySaveAsDialog) == "undefined") {
		displaySaveAsDialog = false;
		//since this value has never been set, it needs to be saved
		chrome.storage.sync.set({displaySaveAsDialog: false});
	} else {
		displaySaveAsDialog = items.displaySaveAsDialog;
	}
});
//detect when settings are changed
chrome.storage.onChanged.addListener(function(changes, areaName) {
	if (typeof(changes.filenameConflictAction) != "undefined") {
		filenameConflictAction = changes.filenameConflictAction.newValue;
	}
	if (typeof(changes.displaySaveAsDialog) != "undefined") {
		displaySaveAsDialog = changes.displaySaveAsDialog.newValue;
	}
});