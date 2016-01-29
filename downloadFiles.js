window.injectedDownloader = window.injectedDownloader || false;
if (window.injectedDownloader ) {
	//Already injected into page
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
				textContent: "Multi-File Downloader"
			},
			{
				tag: "div",
				className: "section filters",
				children: [
					{
						tag: "label",
						htmlFor: "extensionFilter",
						textContent: "Filter Extensions:"
					},
					{
						tag: "div",
						className: "filterBox",
						children: [
							{
								tag: "input",
								type: "checkbox",
								id: "blackListExtensions"
							},
							{
								tag: "label",
								htmlFor: "blackListExtensions",
								textContent: "Blacklist",
								children: [
									{
										tag: "div",
										className: "switch",
										children: [
											{
												tag: "div",
												className: "button"
											}
										]
									}
								]
							},
							{
								tag: "br"
							},
							{
								tag: "input",
								type: "text",
								spellcheck: "false",
								id: "extensionFilter",
								className: "text",
								value: ""
							},
							{
								tag: "button",
								id: "updateFileList",
								textContent: "#"
							}
						]
					}
				]
			},
			{
				tag: "div",
				className: "section filenames",
				children: [
					{
						tag: "label",
						htmlFor: "folderName",
						textContent: "Folder:"
					},
					{
						tag: "input",
						type: "text",
						spellcheck: "false",
						id: "folderName",
						className: "text"
					}
				]
			},
			{
				tag: "div",
				className: "section fileList",
				children: [
					{
						tag: "input",
						type: "checkbox",
						id: "notifyOnFinish"
					},
					{
						tag: "label",
						htmlFor: "notifyOnFinish",
						id: "notifyOnFinishLabel",
						textContent: "Notify when finished",
						children: [
							{
								tag: "div",
								className: "switch",
								children: [
									{
										tag: "div",
										className: "button"
									}
								]
							}
						]
					},
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
	
	//the refesh button needs it's icon
	document.getElementById("updateFileList").style = "background-image: url(" + chrome.extension.getURL("refreshIcon.png") + ");";
	
	updateList([], true);
	
	var port = chrome.runtime.connect({name: "download_info"});
	
	port.postMessage({
		domain: getDomain(window.location.href)
	});
	
	port.onMessage.addListener(function(message) {
		console.info("Recieved message", message);
	});
	
	document.getElementById("downloadAllFiles").addEventListener('click', function(e) {
		for (var i = 0; i < window.urls.length; i++) {
			var folder = getValidFolderName(document.getElementById("folderName").value.trim());
			port.postMessage({
				url: window.urls[i],
				folder: folder
			});
		}
	});
	
	document.getElementById("notifyOnFinishLabel").addEventListener('click', function(e) {
		setTimeout(function() {
			//with out a delay it used the .checked value before the change made by the click
			port.postMessage({
				notifyOnFinish: document.getElementById("notifyOnFinish").checked
			});
		}, 5);
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
	window.popupPosition = [10, 10];
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

	function removeFile() {
		var url = this.parentNode.children[2].children[0].href;
		var index = window.urls.indexOf(url);
		if (index != -1) {
			window.urls.splice(index, 1);
		}
		this.parentNode.parentNode.removeChild(this.parentNode);
	}

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
		list.innerHTML = "<thead><tr><th></th><th>Domain</th><th>Name</th><th>Type</th><th>Size</th></tr></thead>";
		for (var i = 0; i < window.urls.length; i++) {
			list.appendChild(createElementFromObject({
				tag: "tr",
				children: [
					{
						tag: "td",
						className: "removeButton",
						textContent: "x",
					},
					{
						tag: "td",
						className: "domain",
						textContent: getDomain(window.urls[i])
					},
					{
						tag: "td",
						className: "link",
						children: [
							{
								tag: "a",
								className: "IGNORE_DO_NOT_DOWNLOAD",
								href: window.urls[i],
								textContent: window.urls[i].split("/").pop().split(".")[0]
							}
						]
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
				list.children[index + 1].children[4].textContent = getReadableFileSize(size);
			});
			list.children[list.children.length - 1].children[0].addEventListener("click", removeFile);
		}
	}

	function getValidFolderName(string) {
		if (string[0] == "/" || string[0] == "\\") {
			return getValidFolderName(string.slice(1, string.length - 1).trim());
		} else if (string[string.length - 1] == "/" || string[string.length - 1] == "\\") {
			return getValidFolderName(string.slice(0, string.length - 1).trim());
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
						if (prop == "spellcheck") {
							element.spellcheck = false;
						}
					}
				}
			}
		}
		return element;
	}
}