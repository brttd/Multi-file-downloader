window.injectedDownloader = window.injectedDownloader || false;
if (window.injectedDownloader ) {
	//Already injected into page
	document.getElementById("downloadPopup").className = "";
} else {
	//injected script for the first time
	window.injectedDownloader = true;
	
	var webFileTypes = [
		"asp",
		"aspx",
		"axd",
		"asx",
		"asmx",
		"ashx",
		"css",
		"cfm",
		"yaws",
		"swf",
		"html",
		"htm",
		"xhtml",
		"jhtml",
		"jsp",
		"jspx",
		"wss",
		"do",
		"action",
		"js",
		"pl",
		"php",
		"php5",
		"php4",
		"php3",
		"phtml",
		"py",
		"rb",
		"rhtml",
		"xml",
		"rss",
		"svg",
		"cgi",
		"dll"
	];
	
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
						textContent: "?",
						title: "Display the help dialog."
					},
					{
						tag: "div",
						id: "popupClose",
						textContent: "x",
						title: "Close the popup."
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
										textContent: "Filter By File Name:",
										title: "Options for filtering files by their name."
									},
									{
										tag: "div",
										className: "filterBox",
										children: [
											{
												tag: "input",
												type: "checkbox",
												id: "blackListNames",
											},
											{
												tag: "label",
												htmlFor: "blackListNames",
												textContent: "Blacklist",
												title: "Toggle between whitelisting, or blacklisting the names. When green, all specified names will be blacklisted, making only files which do not have that name appear.",
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
												placeholder: "file names",
												title: "A list of names, or parts of names, seperated by commas."
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
										textContent: "Filter By Extension Types:",
										title: "Options for filtering files by their extension (file type)."
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
												title: "Toggle between whitelisting, or blacklisting the extensions. When green, all specified extension types will be blacklisted, making only files which do not have that extension appear.",
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
												placeholder: "file types",
												title: "A list of extensions (file types), seperated by commas."
											}
										]
									}
								]
							},
							{
								tag: "br"
							},
							{
								tag: "div",
								className: "filterSection",
								children: [
									{
										tag: "input",
										type: "checkbox",
										id: "includeImages"
									},
									{
										tag: "label",
										htmlFor: "includeImages",
										textContent: "Include Visible Images",
										title: "Toggle between excluding, or including visible images. When green, images which appear on the page (aswell as those linked to) will be listed as files to be downloaded.",
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
										type: "checkbox",
										id: "includeWebsiteLinks"
									},
									{
										tag: "label",
										htmlFor: "includeWebsiteLinks",
										textContent: "Include Website Links",
										title: "Toggle between excluding, or including website links. When green, links to website pages/forms will be listed as files to be downloaded. When off, files of types: .html, .php, .asp, etc will be excluded from the file list.",
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
								tag: "input",
								type: "checkbox",
								id: "noFilename"
							},
							{
								tag: "label",
								htmlFor: "noFilename",
								id: "noFilenameLabel",
								textContent: "Use Default Filename",
								title: "Use the default filename for each downloaded file. When green, the downloaded file will determine the filename. When off, the url will determine the filename. Enabling this option disables the Folder option.",
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
								tag: "label",
								htmlFor: "folderName",
								id: "folderNameLabel",
								textContent: "Folder:",
								title: "A subdirectory in the chrome downloads folder for files to be placed in."
							},
							{
								tag: "input",
								type: "text",
								spellcheck: "false",
								id: "folderName",
								className: "text",
								title: "A subdirectory in the chrome downloads folder for files to be placed in."
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
								textContent: "Notify When Finished",
								title: "Toggle a notification on/off. When green, a popup notification will appear after all files have been downloaded.",
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
								tag: "button",
								id: "downloadAllFiles",
								textContent: "Download All!",
								title: "Download all files in the list."
							},
							{
								tag: "button",
								id: "updateFileList",
								textContent: "Update List",
								title: "Update the list of files. All files which fit the criteria set by the filters will be displayed, regardless of wether you previously removed them or not."
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
	
	//the refesh button needs it's icon (no longer)
	//document.getElementById("updateFileList").style = "background-image: url(" + chrome.extension.getURL("refreshIcon.png") + ");";
	
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
						textContent: "Next"
					}
				]
			}));
			
			var helpElements = [
				popup.children[2],
				popup.children[0],
				popup.children[0].children[3],
				popup.children[1],
				document.getElementById("popupControls")
			];
			
			var helpText = [
				"This area controls, and displays the files to be downloaded.<br>\
				In the table at the bottom, information about each file is displayed, it's domain (site it is hosted on), file name, file type, and size (occasionally this will not be accessible).<br>\
				To remove a file from the list (meaning it won't be downloaded when the download button is pressed), click the \"x\" button on the left.<br>\
				To download all the files listed, press the \"Download All\" button.<br>\
				To update the list after changing a filter, press the \"Update List\" button (note, this will cause all files previously removed to be added back, if they still fit the criteria).<br>\
				If you would like to know when the files have finished downloading, toggle the \"Notify When Finished\" option. When green, this will make a popup notification appear when all the files have downloaded.",
				"If you would like to narrow down the file selection by name, or type, you can do so.<br>\
				The file name filter will cause files to be choosen only if their name contains the text listed (note, the file does not have to have excatly the same name as one listed, but only has to contain the text (for example, \"2006-05-03-holiday\" would satisfy the filter \"2006\")).<br>\
				To invert the behavior of this filter, and cause only files which <b>do not</b> contain the text to be listed, enable the \"Blacklist\" option.<br>\
				Multiple names can be specified, seperated by commas.<br>\
				Aswell as filtering the files by their name, you can also filter by their extension (file type).<br>\
				As with the file name filter, enter a list of file types, seperated by commas. Any files which are of that type will be listed. The \"Blacklist\" option has the same function, when enabled causing only files with types not specified to be listed.<br>\
				A file will only be listed if it fits both of these filters.<br>\
				To not filter by name, or file type, leave the respective text boxs blank.",
				"By default, visible images, and website links are not listed.<br>\
				To include them in the file list, toggle the respective option.<br>\
				When green, the \"Include Visible Images\" option will add all images which are displayed on the page, not just images linked.<br>\
				When green, the \"Include Website Links\" option will add include links to files which are commonly used for websites, such as .html, .php, .asp, .js, .xml, etc.<br>\
				Note, if the \"Include Website Links\" option is disabled, even if the file extension filter lists one of the file types, files of that type will not appear.<br>\
				For most sites, both of these options should be disabled, since they can add unwanted files to the list. The \"Include Visible Images\" option should be enabled if being used on a website such as Instagram.",
				"If you would like the files you have selected to download to be placed in a subfolder of the downloads directory, type in a folder name here.<br>\
				Files are downloaded to the chrome default downloads folder, which is normally \"C:/Users/USER/downloads\".<br>\
				If you enter a folder name (it does not have to be an already existing folder), the files will be placed within that folder in the downloads folder.<br>\
				Multiple subdirectorys can be specified, seperating the subsequent folders with a \"/\".",
				"To view this help again, click the \"?\" button, and to close the popup, click the \"x\" button.<br>\
				If you encounter an error whilst using this extension, please leave a comment on this extensions page on the Chrome Webstore, saying what you were doing (page, filter settings), and what went wrong."
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
						document.getElementById("popupHelpDialogNextButton").textContent = "Finish";
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
				folder: folder,
				noFilename: document.getElementById('noFilename').checked
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
			extensions[i] = extensions[i].trim().toLowerCase().replace(/\./gi, '');
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
		
		updateList(validExtensions, (validExtensions.length == 0) ? true : document.getElementById("blackListExtensions").checked, validNames, (validNames.length == 0) ? true : document.getElementById("blackListNames").checked, document.getElementById("includeImages").checked, document.getElementById("includeWebsiteLinks").checked);
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
	
	function isWebLink(url) {
		for (var i = 0; i < webFileTypes.length; i++) {
			if (url.toLowerCase().indexOf(webFileTypes[i]) != -1) {
				return true;
			}
		}
		return false;
	}
	
	function getLinks(validExtensions, blacklistExtensions, validNames, blacklistNames, includeImages, includeWebsiteLinks) {
		var links = document.getElementsByTagName("a");
		var urls = [];
		for (var i = 0; i < links.length; i++) {
			if (links[i].className.indexOf("IGNORE_DO_NOT_DOWNLOAD") == -1) {
				//only allow a file to appear once
				if (urls.indexOf(links[i].href) == -1) {
					var extension = links[i].href.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
					//check that it has an extension
					if (extension) {
						//check that the extension is one which is allowed
						//first check if it is a web link. If it is not, then it's fine
						//if it is, then only accept it if web links are included
						if (!isWebLink(extension[1]) || includeWebsiteLinks) {
							//then check if it is in the extension filter
							var extensionCheck = blacklistExtensions ? (validExtensions.indexOf(extension[1].toLowerCase()) == -1) : (validExtensions.indexOf(extension[1].toLowerCase()) != -1);
							//and if it it is in the name filter
							var nameCheck = validName(links[i].href, validNames, blacklistNames);
							//if it satisfies both, then add it to the list
							if (extensionCheck && nameCheck) {
								urls.push(links[i].href);
							}
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
		if (includeImages) {
			var images = document.getElementsByTagName("img");
			for (var i = 0; i < images.length; i++) {
				if (urls.indexOf(images[i].src) == -1) {
					var extension = images[i].src.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
					if (extension) {
						var extensionCheck = blacklistExtensions ? (validExtensions.indexOf(extension[1]) == -1) : (validExtensions.indexOf(extension[1]) != -1);
						var nameCheck = validName(images[i].src, validNames, blacklistNames);
						if (extensionCheck && nameCheck) {
							urls.push(images[i].src);
						}
					}
				}
			}
		}
		return urls.sort();
	}

	function updateList(validExtensions, blacklistExtensions, validNames, blacklistNames, includeImages, includeWebsiteLinks) {
		window.urls = [];
		window.urls = getLinks(validExtensions, blacklistExtensions, validNames, blacklistNames, includeImages, includeWebsiteLinks);
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