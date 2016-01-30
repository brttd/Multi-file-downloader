chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.executeScript(tab.id, {file: "downloadFiles.js", runAt: "document_idle"});
	chrome.tabs.insertCSS(tab.id, {file: "popup.css", runAt: "document_start"});
});

var filenameConflictAction = "uniquify";
var displaySaveAsDialog = false;

var displayHelp = false;

function getDomain(url) {
	var domain = url.split("/")[(url.indexOf("://") == -1) ? 0 : 2];
	return domain.split(":")[0];
}

var notificationFolders = {};

chrome.runtime.onConnect.addListener(function(port) {
	
	if (displayHelp) {
		port.postMessage({displayHelp: true});
		displayHelp = false;
		chrome.storage.local.set({displayHelp: false});
	}
	
	var notifyOnFinish = false;
	var toFinish = [];
	var domains = [];
	var domainBackup = "??";
	
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
			}, function(id) {
				toFinish.push(id);
			});
			var tempDomain = getDomain(message.url).replace("www.", "");
			if (domains.indexOf(tempDomain) == -1) {
				domains.push(tempDomain);
			}
		} else if (typeof(message.notifyOnFinish) != "undefined") {
			notifyOnFinish = message.notifyOnFinish;
		} else if (typeof(message.domain) != "undefined") {
			domainBackup = message.domain;
		}
	});
	
	chrome.downloads.onChanged.addListener(function(data) {
		if (toFinish.indexOf(data.id) != -1) {
			if (data.state) {
				if (data.state.current == "complete") {
					//remove it from the list of files yet to finish downloading
					toFinish.splice(toFinish.indexOf(data.id), 1);
					if (toFinish.length == 0) {
						if (notifyOnFinish) {
							var domainsString = "";
							if (domains.length == 1) {
								domainsString = domains[0];
							} else if (domains.length > 1) {
								for (var i = 0; i < domains.length - 1; i++) {
									domainsString += domains[i] + ", ";
								}
								domainsString += "& " + domains[domains.length - 1];
							}
							domainsString.trim();
							if (domainsString == "") {
								domainsString = domainBackup;
							}
							chrome.notifications.create({
								type: "basic",
								iconUrl: "icon80.png",
								title: "Multi-File Downloader",
								message: "The files from " + domainsString + " have finished downloading!",
								contextMessage: "Click here to view.",
								isClickable: true
							}, function(id) {
								notificationFolders[id] = data.id;
							});
						}
					}
				}
			}
		}
	});
});

chrome.storage.local.get("displayHelp", function(items) {
	if (typeof(items.displayHelp) != "undefined") {
		displayHelp = items.displayHelp;
	} else {
		displayHelp = true;
	}
});

chrome.notifications.onClicked.addListener(function(id) {
	chrome.downloads.show(notificationFolders[id]);
	chrome.notifications.clear(id);
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