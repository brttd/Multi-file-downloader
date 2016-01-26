var popupData = {
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
					type: "text",
					id: "extensionFilter",
					className: "text",
					value: ".mp3"
				}
			]
		},
		{
			tag: "div",
			className: "section fileNames",
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
							for: "fileName",
							textContent: "file names"
						},
						{
							tag: "input",
							type: "text",
							id: "fileName",
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
					tag: "ul",
					className: "files"
				}
			]
		}
	]
}

function createObjectFromElement(element) {
	//converts a DOM element into an object
	//this means popups can be created with normal html
	//and then converted into a object with this function
	//and then converted into a string with the "createStringFromObject" function
	//and then pasted into a JS file as a object variable
	//and then on runtime,
	//converted into a DOM element with the "createElementFromObject" function
	//Which is a lot easier than manually typing out the JS commands to create the elements individually
	
	var obj = {tag: element.tagName.toLowerCase()};
	
	//labels and inputs have unique properties
	if (obj.tag == "label") {
		if (element.for) {obj.for = element.for;}
	} else if (obj.tag == "input") {
		if (element.type) {obj.type = element.type;}
	}
	//all elements can have an id, className, or text content
	if (element.id) {obj.id = element.id;}
	if (element.className) {obj.className = element.className;}
	if (element.textContent) {obj.textContent = element.textContent;}
	
	//check for children
	if (element.children.length > 0) {
		obj.children = [];
		//add each child as an object
		for (var i = 0; i < element.children.length; i++) {
			obj.children.push(createObjectFromElement(element.children[i]));
		}
	}
	
	return obj;
}

function createElementFromObject(object) {
	//converts an object into a DOM element, and returns it
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

function createStringFromObject(object) {
	//used to create code of the object which can be pasted into a JS file
	//does not indent text
	var string = "{";
	for (var prop in object) {
		if (object.hasOwnProperty(prop)) {
			if (prop == "children") {
				string += "\nchildren: [";
				for (var i = 0; i < object.children.length; i++) {
					string += "\n" + createStringFromObject(object.children[i]);
					if (i < object.children.length - 1) {
						string += ",";
					}
				}
				string += "\n]";
			} else {
				string += "\n" + prop + ': "' + object[prop] + '"';
			}
		}
	}
	string += "\n}"
	return string;
}