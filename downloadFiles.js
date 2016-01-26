window.injectedDownloader = window.injectedDownloader || false;
if (window.injectedDownloader ) {
	//Already injected into page
	console.info("Already loaded!");
} else {
	//injected script for the first time
	window.injectedDownloader = true;
	
	document.body.appendChild(createElementFromObject({
		tag: "div",
		id: "downloadPopup",
		children: [
			{
				tag: "p",
				className: "header",
				textContent: "Multi-File downloader"
			},
			{
				tag: "div",
				className: "section filters",
				children: [
					{
						tag: "label",
						for: "extensionFilter",
						textContent: "extensions"
					},
					{
						tag: "input",
						type: "checkbox",
						id: "blackListExtensions"
					},
					{
						tag: "input",
						type: "text",
						id: "extensionFilter",
						className: "text",
						value: ".mp3"
					},
					{
						tag: "button",
						id: "updateFileList",
						textContent: "#"
					}
				]
			},
			{
				tag: "div",
				className: "section filenames",
				children: [
					{
						tag: "div",
						id: "folderSettings",
						children: [
							{
								tag: "label",
								for: "folderName",
								textContent: "folder"
							},
							{
								tag: "input",
								type: "text",
								id: "folderName",
								className: "text"
							}
						]
					},
					{
						tag: "div",
						id: "fileSettings",
						children: [
							{
								tag: "label",
								for: "filename",
								textContent: "file names"
							},
							{
								tag: "input",
								type: "text",
								id: "filename",
								className: "text"
							}
						]
					}
				]
			},
			{
				tag: "div",
				className: "section fileList",
				children: [
					{
						tag: "button",
						id: "downloadAllFiles",
						textContent: "Download all!"
					},
					{
						tag: "table",
						className: "files",
						id: "fileList",
						children: [
							
						]
					}
				]
			}
		]
	}));
	
	updateList([], true);
	
	var port = chrome.runtime.connect({name: "download_info"});
	
	port.onMessage.addListener(function(message) {
		console.info("Recieved message", message);
	});
	
	document.getElementById('downloadAllFiles').addEventListener('click', function(e) {
		for (var i = 0; i < window.urls.length; i++) {
			var folder = getValidFolderName(document.getElementById("folderName").value.trim());
			var filename = document.getElementById("filename").value.trim();
			port.postMessage({
				url: window.urls[i],
				folder: folder,
				filename: filename
			});
		}
	});
	
	document.getElementById("updateFileList").addEventListener('click', function(e) {
		var extensions = document.getElementById("extensionFilter").value.split(",");
		var validExtensions = [];
		for (var i = 0; i < extensions.length; i++) {
			extensions[i] = extensions[i].trim().replace(/\./gi, '');
			if (extensions[i].length > 0) {
				validExtensions.push(extensions[i]);
			}
		}
		updateList(validExtensions, (validExtensions.length == 0) ? true : document.getElementById("blackListExtensions").checked);
	});
	
	
	//enabling moving of popup
	window.popupPosition = [window.innerWidth / 2 - (1 / (100.0 / 25)) * window.innerWidth / 2 - 1 - 1 - 2 - 10, 10];
	updatePosition();
	
	window.dragging = false;
	window.offset = [0, 0];
	
	document.getElementById('downloadPopup').children[0].addEventListener('mousedown', function(e) {
		window.dragging = true;
		window.offset = [window.popupPosition[0] - e.x, window.popupPosition[1] - e.y];
	});
	document.body.addEventListener('mouseup', function(e) {
		window.dragging = false;
	});
	
	document.body.addEventListener('mousemove', function(e) {
		if (window.dragging) {
			window.popupPosition = [e.x + window.offset[0], e.y + window.offset[1]];
			window.popupPosition[0] = Math.max(Math.min(window.popupPosition[0], window.innerWidth - document.getElementById('downloadPopup').offsetWidth), 0);
			window.popupPosition[1] = Math.max(Math.min(window.popupPosition[1], window.innerHeight - document.getElementById('downloadPopup').offsetHeight), 0);
			updatePosition();
		}
	});
}
function updatePosition() {
	document.getElementById('downloadPopup').setAttribute("style", "top: " + window.popupPosition[1] + "px;left: " + window.popupPosition[0] + "px;");
}


function get_filesize(url, index, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("HEAD", url, true);
	xhr.onreadystatechange = function() {
		if (this.readyState == this.DONE) {
			callback(parseInt(xhr.getResponseHeader("Content-Length")), index);
		}
	};
	xhr.send();
}

function getReadableFileSize(fileSizeInBytes) {
	/*
	from:
	http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
	*/
    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
};


function getLinks(validExtensions, blacklist) {
	var links = document.getElementsByTagName("a");
	var urls = [];
	for (var i = 0; i < links.length; i++) {
		if (links[i].className.indexOf("IGNORE_DO_NOT_DOWNLOAD") == -1) {
			//only allow a file to appear once
			if (urls.indexOf(links[i].href) == -1) {
				var extension = links[i].href.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
				//check that it has an extension
				if (extension) {
					//check that the extension is on which is allowed
					//(if blacklist is true, only allow extensions which are not in the list,
					//if blacklist is false, only allow extensions which are in the list)
					if (blacklist) {
						if (validExtensions.indexOf(extension[1]) == -1) {
							urls.push(links[i].href);
						}
					} else if (validExtensions.indexOf(extension[1]) != -1) {
						urls.push(links[i].href);
					}
				}
			}
		}
	}
	return urls.sort();
}

function updateList(validExtensions, blacklist) {
	window.urls = [];
	window.urls = getLinks(validExtensions, blacklist);
	//update the list
	var list = document.getElementById('fileList');
	list.innerHTML = "<thead><tr><th>Domain</th><th>Name</th><th>Type</th><th>Size</th></tr></thead>";
	for (var i = 0; i < window.urls.length; i++) {
		list.appendChild(createElementFromObject({
			tag: "tr",
			children: [
				{
					tag: "td",
					className: "domain",
					textContent: getDomain(window.urls[i])
				},
				{
					tag: "td",
					className: "link IGNORE_DO_NOT_DOWNLOAD",
					href: window.urls[i],
					textContent: window.urls[i].split("/").pop().split(".")[0]
				},
				{
					tag: "td",
					className: "type",
					textContent: window.urls[i].split(".").pop()
				},
				{
					tag: "td",
					className: "size",
					textContent: "??"
				}
			]
		}));
		get_filesize(window.urls[i], i, function(size, index) {
			//(the index has to be +1 because of the headers ("domain", "name", etc)
			list.children[index + 1].children[3].textContent = getReadableFileSize(size);
		});
	}
	console.info("found", i, "files");
}

function getValidFolderName(string) {
	if (string[0] == "/" || string[0] == "\\") {
		return getValidFolderName(string.slice(1, string.length - 1).trim());
	} else if (string[string.length - 1] == "/" || string[string.length - 1] == "\\") {
		return getValidFolderName(string.slice(0, string.length - 2).trim());
	} else {
		return string;
	}
}
function getDomain(url) {
	var domain = url.split("/")[(url.indexOf("://") == -1) ? 0 : 2];
	return domain.split(":")[0];
}

function createElementFromObject(object) {
	//converts an object into a DOM element, and returns it
	//used for creating the popup element from an object to actual HTML DOM elements
	var element = document.createElement(object.tag);
	for (var prop in object) {
		if (object.hasOwnProperty(prop)) {
			if (prop != "tag") {
				if (prop == "children") {
					for (var i = 0; i < object.children.length; i++) {
						element.appendChild(createElementFromObject(object.children[i]));
					}
				} else {
					element[prop] = object[prop];
				}
			}
		}
	}
	return element;
}