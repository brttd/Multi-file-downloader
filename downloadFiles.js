window.injectedDownloader = window.injectedDownloader || false;
if (window.injectedDownloader ) {
	//Already injected into page
	document.getElementById("downloadPopup").className = "";
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
				id: "popupControls",
				children: [
					{
						tag: "div",
						id: "popupDisplayHelp",
						textContent: "?"
					},
					{
						tag: "div",
						id: "popupClose",
						textContent: "x"
					}
				]
			},
			{
				tag: "div",
				id: "mainDownloads",
				children: [
					{
						tag: "div",
						className: "section filters",
						children: [
							{
								tag: "div",
								className: "filterSection",
								children: [
									{
										tag: "label",
										htmlFor: "nameFilter",
										textContent: "Filter By File Name:"
									},
									{
										tag: "div",
										className: "filterBox",
										children: [
											{
												tag: "input",
												type: "checkbox",
												id: "blackListNames"
											},
											{
												tag: "label",
												htmlFor: "blackListNames",
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
												id: "nameFilter",
												className: "text",
												value: "",
												placeholder: "file names"
											},
											{
												tag: "button",
												id: "updateFileList2",
												textContent: "#"
											}
										]
									}
								]
							},
							{
								tag: "div",
								className: "filterSection",
								children: [
									{
										tag: "label",
										htmlFor: "extensionFilter",
										textContent: "Filter By Extension Types:"
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
												value: "",
												placeholder: "file types"
											},
											{
												tag: "button",
												id: "updateFileList",
												textContent: "#"
											}
										]
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
			}
		]
	}));
	
	//the refesh button needs it's icon
	document.getElementById("updateFileList").style = "background-image: url(" + chrome.extension.getURL("refreshIcon.png") + ");";
	document.getElementById("updateFileList2").style = "background-image: url(" + chrome.extension.getURL("refreshIcon.png") + ");";
	
	updateList([], true, [], true);
	
	function displayNextHelp(prevElem, nextElem, text) {
		document.getElementById("popupHelpDialogText").innerHTML = text;
		
		if (prevElem) {prevElem.className = prevElem.className.replace("highlight", "");}
		if (nextElem) {
			nextElem.className += " highlight";
			nextElem.scrollIntoView({block: "end", behavior: "smooth"});
		}
	}
	
	var helpOpen = false;
	function displayHelp() {
		if (!helpOpen) {
			helpOpen = true;
			var popup = document.getElementById('downloadPopup').children[2];
			
			document.getElementById('downloadPopup').appendChild(createElementFromObject({
				tag: "div",
				id: "popupHelpDialog",
				children: [
					{
						tag: "p",
						id: "popupHelpDialogText"
					},
					{
						tag: "button",
						id: "popupHelpDialogNextButton",
						textContent: "next"
					}
				]
			}));
			
			var helpElements = [
				popup.children[2],
				popup.children[0],
				popup.children[1],
				document.getElementById("popupControls")
			];
			
			var helpText = [
				"This is the area controls the actual downloads<br>\
				The table at the bottom displays all the files which have been found.<br>\
				Files can be removed by clicking the \"x\" button on the left.<br>\
				The table also contains the domain from which the file is from (a website can link to files from other websites), a direct link to the file, the file type (extension), and size (Occasionally the file size will not be available).<br>\
				To download all of the listed files, press the \"Download All!\" button.<br>\
				If you would like to have a notification appear when all of the files have finished downloading, click the \"Notify when finished\" button to toggle it on/off. When green, a notification will appear.",
				"This allows you to filter the files by their name, or extension type.<br>\
				Enter file names (or a part of a file name), and file types (.mp3, .pdf, for example) in the respective text boxs. Seperate multiple options with commas.<br>\
				Only files with names and file types that match the given ones will be found.<br>\
				If you want to exclude certain file names, or types, you can enable the \"Blacklist\" option.<br>\
				If the \"Blacklist\" option is green, all file names and types apart from those specified will be searched for.<br>\
				To update the list of files, press the refresh button on the right of the extension type box (note, updating the list will re-add any files which were previously removed).",
				"Downloaded files are saved to the default Chrome downloads folder, normally User/Downloads.<br>\
				If you would like to have the files placed in a sub folder within the downloads folder, enter the name of the folder in the \"Folder:\" text box.<br>\
				You can enter multiple sub folders, seperated by a \"/\" character.<br>\
				If the folder does not exist, it will be created.",
				"To close the popup, click the \"x\" button.<br>\
				If you would like to view this help again, click the \"?\" button."
			];
			
			displayNextHelp(false, helpElements[0], helpText[0]);
			
			
			if (window.popupPosition[0] > window.innerWidth - document.getElementById('downloadPopup').offsetWidth - document.getElementById('popupHelpDialog').offsetWidth - 30) {
				window.popupPosition[0] = window.innerWidth - document.getElementById('downloadPopup').offsetWidth - document.getElementById('popupHelpDialog').offsetWidth - 30;
				updatePosition();
			}
			
			var index = 0;
			
			document.getElementById("popupHelpDialogNextButton").addEventListener('click', function(e) {
				index += 1;
				if (index >= helpElements.length) {
					//close the help
					document.getElementById("downloadPopup").removeChild(document.getElementById("popupHelpDialog"));
					
					//remove the highlight
					helpElements[helpElements.length - 1].className = helpElements[helpElements.length - 1].className.replace("highlight", "");
					
					helpOpen = false;
				} else {
					displayNextHelp(helpElements[index - 1], helpElements[index], helpText[index]);
					
					if (index >= helpElements.length - 1) {
						document.getElementById("popupHelpDialogNextButton").textContent = "finish";
					}
				}
			});
		}
	}
	
	var port = chrome.runtime.connect({name: "download_info"});
	
	port.postMessage({
		domain: getDomain(window.location.href)
	});
	
	port.onMessage.addListener(function(message) {
		if (message.displayHelp) {
			displayHelp();
		}
	});
	
	document.getElementById("popupClose").addEventListener('click', function(e) {
		document.getElementById("downloadPopup").className = "hidden";
	});
	document.getElementById("popupDisplayHelp").addEventListener('click', function(e) {
		displayHelp();
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
		var names = document.getElementById("nameFilter").value.split(",");
		var validNames = [];
		for (var i = 0; i < names.length; i++) {
			names[i] = names[i].trim().toLowerCase();
			if (names[i].length > 0) {
				validNames.push(names[i]);
			}
		}
		
		updateList(validExtensions, (validExtensions.length == 0) ? true : document.getElementById("blackListExtensions").checked, validNames, (validNames.length == 0) ? true : document.getElementById("blackListNames").checked);
	});
	document.getElementById("updateFileList2").addEventListener('click', function(e) {
		var extensions = document.getElementById("extensionFilter").value.split(",");
		var validExtensions = [];
		for (var i = 0; i < extensions.length; i++) {
			//check it is a valid extension type
			extensions[i] = extensions[i].trim().replace(/\./gi, '');
			if (extensions[i].length > 0) {
				validExtensions.push(extensions[i]);
			}
		}
		var names = document.getElementById("nameFilter").value.split(",");
		var validNames = [];
		for (var i = 0; i < names.length; i++) {
			names[i] = names[i].trim().toLowerCase();
			if (names[i].length > 0) {
				validNames.push(names[i]);
			}
		}
		
		updateList(validExtensions, (validExtensions.length == 0) ? true : document.getElementById("blackListExtensions").checked, validNames, (validNames.length == 0) ? true : document.getElementById("blackListNames").checked);
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
		
		if (isNaN(fileSizeInBytes)) {
			return "unknown";
		}
		
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
	
	function validName(name, validNames, blacklistNames) {
		if (blacklistNames) {
			for (var i = 0; i < validNames.length; i++) {
				if (name.toLowerCase().indexOf(validNames[i]) != -1) {
					return false;
				}
			}
			return true;
		} else {
			for (var i = 0; i < validNames.length; i++) {
				if (name.toLowerCase().indexOf(validNames[i]) != -1) {
					return true;
				}
			}
			return false;
		}
	}
	
	function getLinks(validExtensions, blacklistExtensions, validNames, blacklistNames) {
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
						//(if blacklistExtensions is true, only allow extensions which are not in the list,
						//if blacklistExtensions is false, only allow extensions which are in the list)
						var extensionCheck = blackListExtensions ? (validExtensions.indexOf(extension[1]) == -1) : (validExtensions.indexOf(extension[1]) != -1);
						var nameCheck = validName(links[i].href, validNames, blacklistNames);
						if (extensionCheck && nameCheck) {
							urls.push(links[i].href);
						}
						/*
						if (blacklistExtensions) {
							if (validExtensions.indexOf(extension[1]) == -1) {
								urls.push(links[i].href);
							}
						} else if (validExtensions.indexOf(extension[1]) != -1) {
							urls.push(links[i].href);
						}
						*/
					}
				}
			}
		}
		return urls.sort();
	}

	function updateList(validExtensions, blacklistExtensions, validNames, blacklistNames) {
		window.urls = [];
		window.urls = getLinks(validExtensions, blacklistExtensions, validNames, blacklistNames);
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
						textContent: "unknown"
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